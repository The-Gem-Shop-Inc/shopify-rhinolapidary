const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Ajv2020 = require('ajv/dist/2020');

const root = process.cwd();
const files = {
  snapshot: ['docs/qa/evidence/epic-e/2026-09-03-epic-e-admin-snapshot.json'],
  decisions: ['data/epic-e-product-owner-decisions.json', 'schemas/epic-e-product-owner-decisions.schema.json'],
  classification: ['data/epic-e-product-classification.json', 'schemas/epic-e-product-classification.schema.json'],
  identity: ['data/epic-e-product-identity.json', 'schemas/epic-e-product-identity.schema.json'],
  registry: ['data/rhino-commerce-sku-registry.json', 'schemas/rhino-commerce-sku-registry.schema.json'],
  configuration: ['data/epic-e-commercial-configuration-candidates.json', 'schemas/epic-e-commercial-configuration-candidates.schema.json'],
  conflictIndex: ['data/epic-e-conflict-reference-index.json', 'schemas/epic-e-conflict-reference-index.schema.json'],
  vendor: ['data/epic-e-vendor-semantic-audit.json', 'schemas/epic-e-vendor-semantic-audit.schema.json'],
  variants: ['data/epic-e-variant-architecture.json', 'schemas/epic-e-variant-architecture.schema.json'],
  rules: ['data/product-data-rules.json', 'schemas/product-data-rules.schema.json'],
};
const read = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const sameSet = (left, right) => left.length === right.length && left.every((value) => right.includes(value));

function allDecisionIds(value, result = []) {
  if (Array.isArray(value)) value.forEach((item) => allDecisionIds(item, result));
  else if (value && typeof value === 'object') {
    if (typeof value.decisionId === 'string') result.push(value.decisionId);
    Object.values(value).forEach((item) => allDecisionIds(item, result));
  }
  return result;
}

function validateBatch(overrides = {}) {
  const data = Object.fromEntries(Object.entries(files).map(([name, [dataPath]]) => [name, overrides[name] || read(dataPath)]));
  const {snapshot, decisions, classification, identity, registry, configuration, conflictIndex, vendor, variants: variantArchitecture, rules} = data;
  const products = snapshot.datasets.products.records;
  const variants = snapshot.datasets.variants.records;
  const productGids = new Set(products.map((product) => product.id));
  const variantGids = new Set(variants.map((variant) => variant.id));
  const errors = [];

  const ajv = new Ajv2020({allErrors: true, strict: false, formats: {date: /^\d{4}-\d{2}-\d{2}$/, 'date-time': (value) => value === null || !Number.isNaN(Date.parse(value)), uri: (value) => { try { new URL(value); return true; } catch { return false; } }}});
  for (const [name, [, schemaPath]] of Object.entries(files)) {
    if (!schemaPath) continue;
    const validate = ajv.compile(read(schemaPath));
    if (!validate(data[name])) for (const issue of validate.errors || []) errors.push(`${name}: ${issue.instancePath || '/'} ${issue.message}`);
  }

  const snapshotBytes = fs.readFileSync(path.join(root, decisions.evidenceBaseline.snapshotPath));
  if (digest(snapshotBytes) !== decisions.evidenceBaseline.sha256 || snapshot.capturedAt !== decisions.evidenceBaseline.capturedAt) errors.push('decisions: stale evidence baseline without explicit supersession');
  const decisionIds = allDecisionIds(decisions);
  if (new Set(decisionIds).size !== decisionIds.length) errors.push('decisions: decision IDs must be unique');
  if (decisions.decisions.sku.authority.decisionState !== 'approved' || decisions.decisions.sku.authority.issuer !== 'Rhino Lapidary governed commerce SKU registry') errors.push('SKU authority: Rhino governed commerce SKU issuer must be approved');
  if (decisions.decisions.sku.generationPolicy?.format !== 'RH-######' || decisions.decisions.sku.generationPolicy?.scheme !== 'opaque_sequence') errors.push('SKU scheme: approved opaque RH-###### architecture missing');

  for (const row of decisions.decisions.productClass.overrides) {
    const product = products.find((item) => item.id === row.productGid);
    if (!product) errors.push(`decisions: unknown Product GID ${row.productGid}`);
    else if (product.handle !== row.handle) errors.push(`${row.decisionId}: Product GID/handle mismatch`);
  }
  for (const row of decisions.decisions.taxonomy.productDecisions) if (!productGids.has(row.productGid)) errors.push(`decisions: unknown Product GID ${row.productGid}`);
  for (const row of decisions.decisions.sku.candidateDecisions) {
    if (!productGids.has(row.productGid)) errors.push(`decisions: unknown Product GID ${row.productGid}`);
    if (!variantGids.has(row.variantGid)) errors.push(`decisions: unknown Variant GID ${row.variantGid}`);
    const variant = variants.find((item) => item.id === row.variantGid);
    if (variant && variant.product.id !== row.productGid) errors.push(`${row.decisionId}: Product/Variant GID mismatch`);
  }

  const evidenceProposals = classification.mappings.filter((row) => row.evidenceDecisionState === 'proposed').map((row) => ({productGid: row.productGid, handle: row.handle, productClass: row.evidenceProposedProductClass})).sort((a, b) => a.productGid.localeCompare(b.productGid));
  if (evidenceProposals.length !== decisions.decisions.productClass.bulkApproval.expectedCount || digest(JSON.stringify(evidenceProposals)) !== decisions.decisions.productClass.bulkApproval.expectedProposalDigest) errors.push('classification: approved proposal baseline digest/count drifted');
  if (classification.mappings.length !== 122 || classification.mappings.length !== products.length) errors.push('classification: coverage must reconcile to all 122 products');
  if (new Set(classification.mappings.map((row) => row.productGid)).size !== classification.mappings.length) errors.push('classification: Product GIDs must be unique');
  const expectedClassTotals = {machine: 11, replacement_part: 54, consumable: 39, accessory: 18};
  for (const [productClass, count] of Object.entries(expectedClassTotals)) if (classification.mappings.filter((row) => row.proposedProductClass === productClass).length !== count || classification.statistics.byClass[productClass] !== count) errors.push(`classification: Product Owner-approved class totals must reconcile to 122 (${productClass}=${count})`);
  if (classification.mappings.some((row) => row.classDecisionState !== 'approved') || classification.statistics.byDecisionState.approved !== 122 || classification.statistics.byDecisionState.blocked !== 0) errors.push('classification: Product Owner-approved coverage must be 122 approved and zero blocked');
  const purple = classification.mappings.find((row) => row.handle === 'purple-jade-bead-strand');
  if (!purple || purple.proposedProductClass !== 'replacement_part' || purple.classDecisionState !== 'approved' || purple.approvalDecisionId !== 'PO-E-039' || purple.catalogScopeDisposition !== 'in_scope' || !purple.supportingEvidence.some((item) => item.sourceKind === 'product_owner_decision')) errors.push('purple-jade-bead-strand: valid Product Owner replacement-part decision reverted to obsolete catalog-scope blocker');

  const allowedClasses = new Set(classification.allowedVocabulary);
  const taxonomyNodes = new Map(classification.taxonomyAudit.nodes.map((node) => [node.id, node.path]));
  for (const row of classification.mappings) {
    if (!allowedClasses.has(row.proposedProductClass)) errors.push(`${row.handle}: class outside closed vocabulary`);
    if (!decisionIds.includes(row.approvalDecisionId)) errors.push(`${row.handle}: generated approved class lacks matching human decision record`);
    for (const evidence of row.supportingEvidence) if (evidence.canonicalForClass && ['tag', 'collection'].includes(evidence.sourceKind)) errors.push(`${row.handle}: tag/collection used as class or compatibility proof`);
    if (!row.candidateShopifyTaxonomy || taxonomyNodes.get(row.candidateShopifyTaxonomy.id) !== row.candidateShopifyTaxonomy.path) errors.push(`${row.handle}: taxonomy candidate absent from audited official-node set`);
    if (row.taxonomySpecificity === 'broad_fallback' && !row.taxonomyRationale) errors.push(`${row.handle}: broad taxonomy fallback lacks reason`);
    if (row.productTypeRecommendation.value !== '') errors.push(`${row.handle}: Product Type used as duplicate product-class authority`);
  }
  const expectedTaxonomy = {
    'em-1': ['multi-purpose lapidary machine', 'gid://shopify/TaxonomyCategory/ha-15-38'],
    jademaster: ['rock saw', 'gid://shopify/TaxonomyCategory/ha-15-62-6'],
    tumblemaster: ['tumbler', 'gid://shopify/TaxonomyCategory/ha-15-51-2'],
  };
  for (const [handle, [meaning, categoryId]] of Object.entries(expectedTaxonomy)) {
    const row = classification.mappings.find((item) => item.handle === handle);
    if (!row || row.businessMeaning !== meaning || row.candidateShopifyTaxonomy?.id !== categoryId || row.taxonomyDecisionState !== 'approved') errors.push(`${handle}: taxonomy business meaning confused with an invented or unsupported Shopify taxonomy node`);
    if (row?.businessMeaning === row?.candidateShopifyTaxonomy?.path) errors.push(`${handle}: taxonomy business meaning confused with Shopify taxonomy node`);
  }
  const specific = classification.mappings.filter((row) => row.taxonomySpecificity === 'specific').length;
  const broad = classification.mappings.filter((row) => row.taxonomySpecificity === 'broad_fallback').length;
  const unresolved = classification.mappings.filter((row) => row.taxonomySpecificity === 'unresolved').length;
  if (specific !== 79 || broad !== 43 || unresolved !== 0 || classification.statistics.taxonomyBySpecificity.specific !== specific || classification.statistics.taxonomyBySpecificity.broad_fallback !== broad || classification.statistics.taxonomyBySpecificity.unresolved !== unresolved) errors.push('taxonomy: expected 79 specific, 43 broad fallback, and zero unresolved rows');

  if (identity.productIdentities.length !== products.length || identity.variantIdentities.length !== variants.length) errors.push('identity: product/variant coverage mismatch');
  if (identity.additionalRhinoBusinessId.decisionState !== 'not_justified') errors.push('identity: an additional Rhino business ID is not justified');
  if (identity.skuPolicy.authorityState !== 'approved' || identity.skuPolicy.registry !== files.registry[0] || identity.skuPolicy.allocationAllowed !== 'next unused RH-###### identifier from the governed registry allocation process only') errors.push('identity: approved governed SKU allocation policy missing');
  if (identity.skuPolicy.derivationProhibited.includes('invented_sequence')) errors.push('identity: obsolete blanket invented_sequence prohibition was not superseded');
  const requiredProhibitions = ['product_title','handle','product_class','vendor','machine_family','voltage','grit','size','compatibility','dimensions','shopify_numeric_id','technical_spec','sort_position','arbitrary_agent_sequence'];
  if (!requiredProhibitions.every((value) => identity.skuPolicy.derivationProhibited.includes(value))) errors.push('identity: prohibited SKU derivation coverage incomplete');

  if (registry.allocations.length !== variants.length || new Set(registry.allocations.map((row) => row.variantGid)).size !== variants.length) errors.push('SKU registry: exactly one allocation row per current Variant is required');
  const allocatedAndRetired = [];
  for (const allocation of registry.allocations) {
    const variant = variants.find((item) => item.id === allocation.variantGid);
    if (!variant || variant.product.id !== allocation.productGid) errors.push(`${allocation.variantGid}: registry Product/Variant GID mismatch`);
    if (allocation.sku) allocatedAndRetired.push([allocation.sku, allocation.variantGid]);
    for (const retired of allocation.replacedOrRetiredSkuHistory) allocatedAndRetired.push([retired.sku, allocation.variantGid]);
    if (allocation.issuanceState === 'proposed' && !/^RH-[0-9]{6}$/.test(allocation.sku || '')) errors.push(`${allocation.variantGid}: proposed allocation must use RH-######`);
    if (['approved','active'].includes(allocation.issuanceState) && (!allocation.issuedAt || !allocation.issuedBy)) errors.push(`${allocation.variantGid}: approved allocation lacks issuer evidence`);
  }
  const normalizedSkus = allocatedAndRetired.map(([sku]) => sku.toUpperCase());
  if (new Set(normalizedSkus).size !== normalizedSkus.length) errors.push('SKU registry: duplicate active/retired SKU reuse detected');
  if (registry.statistics.proposed !== 121 || registry.statistics.blocked !== 2 || registry.statistics.deferredNonSellable !== 2 || registry.statistics.approved !== 0) errors.push('SKU registry: expected 121 proposed, 2 blocked, 2 deferred, and 0 approved values');
  if (registry.scheme.nextAvailableSequence <= Math.max(...registry.allocations.filter((row) => row.sku).map((row) => Number(row.sku.slice(3))))) errors.push('SKU registry: next sequence would reuse a reserved identifier');

  const registryByVariant = new Map(registry.allocations.map((row) => [row.variantGid, row]));
  for (const row of identity.variantIdentities) {
    const allocation = registryByVariant.get(row.variantGid);
    if (!allocation || row.commerceSkuProposal !== allocation.sku || row.skuRegistryState !== allocation.issuanceState) errors.push(`${row.handle}: generated identity does not consume governed SKU registry`);
    for (const candidate of row.skuCandidates) {
      if (/^RH-/i.test(candidate.value) && (candidate.source !== files.registry[0] || candidate.derivation !== 'governed_registry_allocation')) errors.push(`${row.handle}: ad-hoc RH sequence issuance outside governed SKU registry`);
      if (requiredProhibitions.includes(candidate.derivation)) errors.push(`${row.handle}: SKU derived from prohibited product title/handle/class/vendor/family/spec source`);
      if (candidate.commerceSkuApproved && candidate.sourceRole !== 'commerce_sku') errors.push(`${row.handle}: technical part/order number automatically promoted to commerce SKU`);
    }
    if (row.commerceSkuProposal && row.legacyPartNumbers.some((legacy) => legacy.toUpperCase() === row.commerceSkuProposal.toUpperCase())) errors.push(`${row.handle}: legacy component identifier silently promoted to sold-set SKU`);
    if (new Set(row.aliases.map((alias) => alias.toUpperCase())).size !== row.aliases.length) errors.push(`${row.handle}: duplicate case-insensitive alias`);
  }
  const knownMulti = {
    'lapmaster-pulleys': ['YL-450-T12','YL-450-T13'],
    'trimmaster-pulleys': ['IDM-T11','IDM-T13'],
    'automatic-feed-clamp': ['BK-450-K01','BK-600-K01'],
    'saw-vice-plate-set': ['BK-450-24','BK-600-24'],
  };
  for (const [handle, identifiers] of Object.entries(knownMulti)) {
    const row = identity.variantIdentities.find((item) => item.handle === handle);
    if (!row || !sameSet(row.legacyPartNumbers, identifiers)) errors.push(`${handle}: one of two meaningful constituent or machine-size-specific technical IDs was arbitrarily discarded`);
    if (handle.includes('pulleys') && (!/^RH-/.test(row.commerceSkuProposal || '') || row.legacyPartNumbers.includes(row.commerceSkuProposal))) errors.push(`${handle}: legacy component identifier silently promoted to sold-set SKU`);
    if (!handle.includes('pulleys') && (row.commerceSkuProposal !== null || row.skuReadiness !== 'blocked_semantic_restructure_required')) errors.push(`${handle}: machine-size distinction hidden instead of blocking SKU assignment`);
  }
  if (identity.barcodePolicy.required !== false) errors.push('identity: barcode generation is prohibited without a demonstrated consumer');

  if (vendor.policy.shopifyVendorMeaning !== 'marketed_product_brand') errors.push('vendor: Shopify Vendor must have one governed marketed-brand meaning');
  if (vendor.exceptions.length !== 11 || vendor.statistics.proposed !== 11 || vendor.statistics.ambiguous !== 0) errors.push('vendor: expected 11 evidence-backed proposals and zero ambiguous rows');
  for (const row of vendor.exceptions) {
    if (!productGids.has(row.productGid)) errors.push(`vendor: unknown Product GID ${row.productGid}`);
    if (row.proposedShopifyVendor === 'Rhino Lapidary' && row.observedBrand !== 'Rhino Lapidary') errors.push(`${row.handle}: Vendor defaulted to Rhino despite unambiguous third-party marketed-brand evidence`);
    if (row.proposedShopifyVendor !== row.observedBrand || row.humanDecisionRequired || row.decisionState !== 'proposed') errors.push(`${row.handle}: approved Vendor policy not applied to unambiguous marketed-brand evidence`);
    if (row.observedManufacturer && row.observedManufacturer === row.observedBrand) errors.push(`${row.handle}: manufacturer silently inferred from marketed brand`);
  }

  const expectedConfigurationIds = Array.from({length: 22}, (_, index) => `CONFIG-${String(index + 1).padStart(3, '0')}`);
  if (!sameSet(decisions.decisions.commercialConfiguration.map((row) => row.candidateId), expectedConfigurationIds)) errors.push('decisions: must cover CONFIG-001 through CONFIG-022 exactly');
  if (!sameSet(configuration.candidates.map((row) => row.candidateId), expectedConfigurationIds)) errors.push('configuration: commercial decisions must cover CONFIG-001 through CONFIG-022 exactly');
  const conflicts = new Map(conflictIndex.conflicts.map((row) => [row.conflictId, row]));
  for (const row of configuration.candidates) {
    const decision = decisions.decisions.commercialConfiguration.find((item) => item.candidateId === row.candidateId);
    if (!decision || decision.decisionId !== row.resolution.decisionId || decision.disposition !== row.resolution.disposition) errors.push(`${row.candidateId}: generated disposition lacks matching human decision`);
    for (const conflictId of row.conflictIds) {
      const conflict = conflicts.get(conflictId);
      if (!conflict) errors.push(`${row.candidateId}: unknown conflict ${conflictId}`);
      else if (!conflict.normalizedFamilies.includes(row.handle)) errors.push(`${row.candidateId}: conflict ${conflictId} belongs to ${conflict.entity}, not ${row.handle}`);
    }
    if (row.resolution.authorizesMutation) errors.push(`${row.candidateId}: product split/merge/variant mutation represented as authorized`);
  }
  if (configuration.candidates.some((row) => row.conflictIds.includes('C-040') || row.conflictIds.includes('C-041'))) errors.push('configuration: EM-1 C-040/C-041 technical evidence cannot be promoted to variant evidence');
  const blade = configuration.candidates.find((row) => row.candidateId === 'CONFIG-012');
  const bladeProduct = products.find((product) => product.id === blade.productGid);
  const bladeVariants = variants.filter((variant) => variant.product.id === blade.productGid);
  for (const option of bladeProduct.options.filter((item) => item.name !== 'Title')) {
    const summary = blade.optionEvidence.optionSummaries.find((item) => item.optionName === option.name);
    const selected = [...new Set(bladeVariants.flatMap((variant) => variant.selectedOptions.filter((item) => item.name === option.name).map((item) => item.value)))];
    if (!summary || !sameSet(summary.productValues, option.values) || !sameSet(summary.variantValues, selected)) errors.push('CONFIG-012: option evidence inconsistent with snapshot variant values');
  }
  if (blade.sourceObservations[0].location !== blade.optionEvidence.summary) errors.push('CONFIG-012: source observation is inconsistent with generated option evidence');
  if (variantArchitecture.configurationDispositions.some((row) => row.authorizesMutation)) errors.push('variant architecture: mutation represented as authorized');
  if (!variantArchitecture.ePbi009Handoff.ready || variantArchitecture.constraints.requiredSku.currentAuthorityState !== 'approved') errors.push('variant architecture: approved upstream E-PBI-007 contract missing from E-PBI-009 handoff');

  if (rules.skuGovernance?.authorityState !== 'approved' || rules.skuGovernance?.registry !== files.registry[0] || !rules.skuGovernance?.prohibitedDerivations?.includes('arbitrary_agent_sequence')) errors.push('product data rules: approved SKU governance missing');
  if ('requiredTagsByProductClass' in rules || rules.legacyTagAuthority?.decisionState !== 'deprecated') errors.push('product data rules: deprecated tag authority reintroduced');
  const forbidden = JSON.stringify({decisions, classification, identity, registry, configuration, vendor, variantArchitecture, rules});
  if (/"(?:shopifyAdminMutationAuthorized|metafieldDefinitions|metaobjectDefinitions|authorizedVariantMutation)"\s*:\s*(?:true|\[|\{)/.test(forbidden)) errors.push('batch boundary: Shopify Admin mutation or E-PBI-009 implementation entered Batch 2B.1 scope');
  return errors;
}

function runCli() {
  const errors = validateBatch();
  if (errors.length) {
    console.error('Epic E Batch 2B validation failed.');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  const classification = read(files.classification[0]);
  const registry = read(files.registry[0]);
  console.log(`Epic E Batch 2B validation passed: ${classification.statistics.byDecisionState.approved} approved classifications, ${registry.statistics.proposed} governed SKU proposals, 2 explicit SKU blockers, and 22 preserved configuration decisions.`);
}

if (require.main === module) runCli();
module.exports = {validateBatch, read, files, runCli};
