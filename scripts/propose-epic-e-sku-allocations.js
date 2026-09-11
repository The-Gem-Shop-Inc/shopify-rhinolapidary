const fs = require('fs');
const path = require('path');

const root = process.cwd();
const snapshotPath = 'docs/qa/evidence/epic-e/2026-09-03-epic-e-admin-snapshot.json';
const identityPath = 'data/epic-e-product-identity.json';
const outputPath = 'data/rhino-commerce-sku-registry.json';
const absoluteOutput = path.join(root, outputPath);

if (fs.existsSync(absoluteOutput) && !process.argv.includes('--force-initial-bootstrap')) {
  throw new Error(`${outputPath} already exists. It is a human-owned issuance ledger; edit it through governance instead of regenerating it.`);
}

const snapshot = JSON.parse(fs.readFileSync(path.join(root, snapshotPath), 'utf8'));
const identity = JSON.parse(fs.readFileSync(path.join(root, identityPath), 'utf8'));
const products = snapshot.datasets.products.records;
const variants = snapshot.datasets.variants.records;
const productByGid = new Map(products.map((product) => [product.id, product]));
const identityByVariant = new Map(identity.variantIdentities.map((variant) => [variant.variantGid, variant]));
const semanticBlockers = new Map([
  ['automatic-feed-clamp', 'BK-450-K01 and BK-600-K01 identify physically distinct machine-size-specific parts collapsed into one Product. A restructuring decision is required before commerce SKU assignment.'],
  ['saw-vice-plate-set', 'BK-450-24 and BK-600-24 identify physically distinct machine-size-specific parts collapsed into one Product. A restructuring decision is required before commerce SKU assignment.'],
]);

const sortedVariants = [...variants].sort((a, b) => {
  const aId = BigInt(a.id.split('/').pop());
  const bId = BigInt(b.id.split('/').pop());
  return aId < bId ? -1 : aId > bId ? 1 : 0;
});
let sequence = 1;
const allocations = sortedVariants.map((variant) => {
  const product = productByGid.get(variant.product.id);
  const oldIdentity = identityByVariant.get(variant.id);
  const legacyIdentifiers = (oldIdentity?.skuCandidates || []).map((candidate) => ({
    value: candidate.value,
    role: candidate.semanticRole,
    source: candidate.source,
  }));
  const blocker = semanticBlockers.get(product.handle);
  const nonSellable = product.status !== 'ACTIVE';
  const sku = !blocker && !nonSellable ? `RH-${String(sequence++).padStart(6, '0')}` : null;
  const issuanceState = blocker ? 'blocked' : nonSellable ? 'deferred_non_sellable' : 'proposed';
  return {
    sku,
    variantGid: variant.id,
    productGid: product.id,
    currentHandleForReview: product.handle,
    currentTitleForReview: product.title,
    issuanceState,
    issuedAt: null,
    issuedBy: null,
    decisionOwner: 'Rhino Lapidary Product Data / Product Owner',
    legacyIdentifiers,
    replacedOrRetiredSkuHistory: [],
    sourceDecision: sku ? 'PO-E-041' : blocker ? (product.handle === 'automatic-feed-clamp' ? 'PO-E-012' : 'PO-E-013') : 'PO-E-041',
    notesOrBlocker: blocker || (nonSellable
      ? 'No initial commerce SKU proposed while the Product is not active/sellable; product kind and identity remain preserved.'
      : 'Initial deterministic proposal reserved in the governed registry. This value is not authoritative or approved for Shopify population until its issuanceState is approved.'),
  };
});

const registry = {
  $schema: '../schemas/rhino-commerce-sku-registry.schema.json',
  schemaVersion: 1,
  source: {
    title: 'Rhino Lapidary governed commerce SKU registry',
    authorityKind: 'human_owned',
    owner: 'Rhino Lapidary Product Data / Product Owner',
    operationsRole: 'downstream_consumer',
    initializedAt: '2026-09-04',
    initialProposalMethod: 'one-time deterministic ordering by immutable Shopify Variant GID',
    regenerationPolicy: 'never_rebuild_allocations_from_catalog_sorting',
  },
  authorityDecisionId: 'PO-E-040',
  schemeDecisionId: 'PO-E-041',
  approvalState: 'architecture_approved_values_proposed',
  scheme: {
    format: 'RH-######',
    scope: 'shopify_variant_sellable_commerce_unit',
    allocationRule: 'next_unused_identifier_from_governed_registry_only',
    nextAvailableSequence: sequence,
    uniqueness: 'case_insensitive_across_active_and_retired',
    immutability: 'immutable_after_approval_except_governed_correction_or_migration',
    retiredIdentifiers: 'never_reuse',
    prohibitedEncoding: ['product_class', 'vendor', 'machine_family', 'voltage', 'grit', 'size', 'compatibility', 'dimensions', 'shopify_numeric_id', 'handle', 'title', 'technical_spec', 'sort_position'],
    arbitraryAgentGenerationProhibited: true,
    legacyIdentifiers: 'preserve_as_aliases_and_history',
    shopifyGids: 'platform_identity_not_commerce_sku',
    variantRestructure: 'requires_explicit_mapping_decision',
  },
  allocations,
  statistics: {
    totalVariants: allocations.length,
    proposed: allocations.filter((entry) => entry.issuanceState === 'proposed').length,
    approved: allocations.filter((entry) => entry.issuanceState === 'approved').length,
    blocked: allocations.filter((entry) => entry.issuanceState === 'blocked').length,
    deferredNonSellable: allocations.filter((entry) => entry.issuanceState === 'deferred_non_sellable').length,
  },
};

fs.writeFileSync(absoluteOutput, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Created ${outputPath} with ${registry.statistics.proposed} proposed allocations, ${registry.statistics.blocked} blockers, and ${registry.statistics.deferredNonSellable} deferred non-sellable variants.`);
