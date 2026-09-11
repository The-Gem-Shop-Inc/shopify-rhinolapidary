const crypto = require('crypto');

const APPROVED_CLASSES = ['machine', 'replacement_part', 'consumable', 'accessory'];
const DECISION_STATES = ['observed', 'proposed', 'approved', 'conflicting', 'blocked', 'deprecated', 'superseded'];
const FUTURE_PBIS = new Set(['E-PBI-010', 'E-PBI-011', 'E-PBI-012', 'E-PBI-013', 'E-PBI-014', 'E-PBI-015', 'E-PBI-016', 'E-PBI-017', 'E-PBI-018B']);
const DIFF_STATES = ['create', 'no_op', 'conflict', 'incompatible_type', 'unexpected_live_definition', 'desired_not_approved', 'deprecated_definition_still_live', 'inaccessible_not_audited'];

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function allDefinitions(registry) {
  return [
    ...(registry.metafields || []).map((entry) => ({ ...entry, resourceKind: 'metafield' })),
    ...(registry.metaobjects || []).map((entry) => ({ ...entry, resourceKind: 'metaobject', ownerType: 'METAOBJECT', namespace: null, key: entry.type }))
  ];
}

function containsTbd(value) {
  return typeof value === 'string' && /(^|\W)TBD($|\W)/i.test(value);
}

function validateRegistrySemantics(registry, options = {}) {
  const errors = [];
  const definitions = allDefinitions(registry);
  const classification = options.classification;
  const filters = options.filters;
  const governance = options.sourceGovernance;
  const productRules = options.productRules;

  if (!registry.batchBoundary?.repositoryContractOnly || registry.batchBoundary?.adminMutationAuthorized || registry.batchBoundary?.definitionCreationAuthorized || registry.batchBoundary?.valuePopulationAuthorized) {
    errors.push('Epic E batch boundary must remain repository-only with Admin creation and value population disabled.');
  }

  if (governance && JSON.stringify(governance.decisionStates) !== JSON.stringify(DECISION_STATES)) {
    errors.push('Registry must reuse the Epic E decision-state vocabulary exactly.');
  }
  if (productRules) {
    const customData = productRules.customDataGovernance;
    if (customData?.registry !== 'data/metafield-metaobject-definitions.json' || customData?.canonicalProductClass !== 'rhino.product_class' || customData?.adminMutationAuthorized !== false || customData?.definitionPlanGate !== 'E-PBI-019' || customData?.definitionCreationPbi !== 'E-PBI-020') {
      errors.push('product-data rules do not preserve the canonical custom-data registry and E-PBI-019/E-PBI-020 safety boundary');
    }
  }

  const identities = new Set();
  const ids = new Set();
  for (const definition of definitions) {
    const identity = definition.resourceKind === 'metafield'
      ? `${definition.ownerType}:${definition.namespace}.${definition.key}`.toLowerCase()
      : `metaobject:${definition.type}`.toLowerCase();
    if (identities.has(identity)) errors.push(`duplicate custom-data identity ${identity}`);
    identities.add(identity);
    if (ids.has(definition.definitionId)) errors.push(`duplicate definitionId ${definition.definitionId}`);
    ids.add(definition.definitionId);
    for (const dependency of definition.definitionDependencies || []) if (!definitions.some((candidate) => candidate.definitionId === dependency)) errors.push(`${definition.definitionId}: unknown definition dependency ${dependency}`);

    const ownerValues = [
      ...(definition.evidence?.evidenceOwners || []),
      definition.ownership?.businessApprovalOwner,
      definition.ownership?.operationalOwner,
      definition.ownership?.technicalImplementationOwner
    ].filter(Boolean);
    if (definition.decisionState === 'approved' || definition.requiredForLaunch) {
      if (ownerValues.some(containsTbd)) errors.push(`${definition.definitionId}: approved/launch-required definition cannot use TBD ownership`);
      if (!definition.ownerType) errors.push(`${definition.definitionId}: missing owner/resource type`);
      if (!definition.type || !definition.cardinality && definition.resourceKind === 'metafield') errors.push(`${definition.definitionId}: missing Shopify type/cardinality`);
      if (!(definition.consumers?.mvp?.length || definition.consumers?.postMvp?.length)) errors.push(`${definition.definitionId}: approved definition has no concrete consumer`);
      if (definition.lifecycleState !== 'approved_desired_state') errors.push(`${definition.definitionId}: approved definition must have approved_desired_state lifecycle`);
    }
    if (definition.decisionState === 'deprecated' && definition.lifecycleState !== 'deprecated') errors.push(`${definition.definitionId}: deprecated decision must use deprecated lifecycle`);
    if (definition.lifecycleState === 'intentionally_absent' && definition.decisionState === 'approved') errors.push(`${definition.definitionId}: intentionally absent definition cannot be approved for creation`);

    for (const productClass of definition.applicability?.productClasses || []) {
      if (!APPROVED_CLASSES.includes(productClass)) errors.push(`${definition.definitionId}: unknown Product class ${productClass}`);
    }

    if ((['E-PBI-015','E-PBI-016','E-PBI-017'].includes(definition.sourcePbi) && !require('./epic-e-batch-3c-contract').isBatch3cDefinition(definition)) || /^E-PBI-0(?:2\d|[3-9]\d)/.test(definition.sourcePbi)) {
      errors.push(`${definition.definitionId}: future ${definition.sourcePbi} definition is outside Batch 3B`);
    }
    if (FUTURE_PBIS.has(definition.sourcePbi) && definition.decisionState === 'approved') {
      const domain = (registry.plannedDomains || []).find((entry) => entry.owningPbis?.includes(definition.sourcePbi));
      const batchField = require('./epic-e-batch-3b-fields').fields.find(f=>f.sourcePbi===definition.sourcePbi&&f.key===definition.key&&f.type===definition.type);
      if (!domain?.definitionKeysApproved || !batchField) errors.push(`${definition.definitionId}: future ${definition.sourcePbi} definition cannot be approved without its authorized field contract`);
    }

    if (definition.decisionState === 'deprecated' && !definition.migration?.replacementAuthorityPbi && !definition.migration?.replacementDefinitionId) {
      errors.push(`${definition.definitionId}: deprecated definition lacks replacement authority`);
    }

    if (definition.resourceKind === 'metaobject' && definition.decisionState === 'approved') {
      if (!definition.reuseJustification || !definition.simplerMetafieldInsufficient || !definition.referenceDirection?.length) {
        errors.push(`${definition.definitionId}: approved metaobject lacks reuse/reference justification`);
      }
      if (!definition.fields?.some((field) => field.key === definition.displayNameKey)) errors.push(`${definition.definitionId}: displayNameKey does not name a field`);
    }
  }

  const prohibitedByOwner = new Map();
  for (const exclusion of registry.governance?.nativeFieldExclusions || []) {
    if (!prohibitedByOwner.has(exclusion.shopifyOwner)) prohibitedByOwner.set(exclusion.shopifyOwner, new Map());
    for (const key of exclusion.prohibitedCustomKeys || []) prohibitedByOwner.get(exclusion.shopifyOwner).set(key.toLowerCase(), exclusion.concept);
  }
  for (const field of registry.metafields || []) {
    const nativeConcept = prohibitedByOwner.get(field.ownerType)?.get(field.key.toLowerCase());
    if (nativeConcept) errors.push(`${field.definitionId}: ${field.ownerType}:${field.namespace}.${field.key} duplicates native Shopify concept ${nativeConcept}`);
    if (field.customDataJustification?.duplicatesNativeField !== false) errors.push(`${field.definitionId}: custom-data justification must explicitly reject native duplication`);
  }

  const productClass = (registry.metafields || []).find((field) => field.ownerType === 'PRODUCT' && field.namespace === 'rhino' && field.key === 'product_class');
  if (!productClass || productClass.decisionState !== 'approved' || productClass.canonicalRole !== 'canonical' || productClass.type !== 'single_line_text_field' || productClass.cardinality !== 'one' || !productClass.requiredForLaunch) {
    errors.push('rhino.product_class must be an approved, canonical, launch-required Product single-line definition.');
  } else {
    const allowed = productClass.allowedBehavior?.allowedValues || [];
    if (JSON.stringify(allowed) !== JSON.stringify(APPROVED_CLASSES)) errors.push('rhino.product_class allowed values do not match the approved vocabulary.');
    const choices = productClass.validationRules?.find((rule) => rule.name === 'choices' && rule.enforcement === 'shopify_definition');
    if (JSON.stringify(choices?.value) !== JSON.stringify(APPROVED_CLASSES)) errors.push('rhino.product_class must declare the Shopify choices validation.');
    if (/tag|collection|product type/i.test(productClass.evidence?.authority || '')) errors.push('rhino.product_class evidence authority cannot be tags, collections, or Product Type.');
  }

  const compatibility = (registry.metafields || []).find((field) => field.namespace === 'rhino' && field.key === 'compatibility');
  if (!compatibility || compatibility.decisionState !== 'deprecated' || compatibility.canonicalRole === 'canonical' || !/text/.test(compatibility.type) || compatibility.migration?.replacementAuthorityPbi !== 'E-PBI-012') {
    errors.push('legacy rhino.compatibility must be deprecated/noncanonical and name E-PBI-012 as replacement authority.');
  }

  const machineJson = (registry.metafields || []).find((field) => field.namespace === 'rhino' && field.key === 'machine_specs');
  if (!machineJson || machineJson.type !== 'json' || machineJson.decisionState !== 'deprecated' || machineJson.canonicalRole === 'canonical' || machineJson.migration?.replacementAuthorityPbi !== 'E-PBI-010') {
    errors.push('legacy rhino.machine_specs JSON must be deprecated/noncanonical and name E-PBI-010 as replacement authority.');
  }

  const familyObject = (registry.metaobjects || []).find((entry) => entry.type === 'machine_family');
  const familyReference = (registry.metafields || []).find((entry) => entry.namespace === 'rhino' && entry.key === 'machine_family');
  if (!familyObject || !familyReference || familyObject.decisionState !== 'approved' || familyReference.decisionState !== 'approved' || familyReference.type !== 'metaobject_reference') {
    errors.push('approved machine-family foundation requires the machine_family metaobject and rhino.machine_family Product reference.');
  }
  if (!/not.*compatibility|not a .*compatibility/i.test(`${familyObject?.entitySemantics || ''} ${familyReference?.description || ''}`)) {
    errors.push('machine-family contract must state that family membership is not compatibility proof.');
  }

  if (classification) {
    if (JSON.stringify(classification.allowedVocabulary) !== JSON.stringify(APPROVED_CLASSES)) errors.push('Product-class registry vocabulary differs from classification evidence.');
    if (classification.statistics?.byDecisionState?.approved !== 122 || classification.statistics?.byDecisionState?.blocked !== 0) errors.push('Product-class evidence is not 122 approved / zero blocked.');
  }

  if (filters) {
    for (const field of registry.metafields || []) {
      const source = field.ownerType === 'PRODUCT' ? 'product-metafield' : field.ownerType === 'PRODUCTVARIANT' ? 'variant-metafield' : null;
      const linked = filters.filters?.filter((filter) => filter.source === source && filter.namespace === field.namespace && filter.key === field.key) || [];
      if (field.usedForFiltering && !linked.length) errors.push(`${field.definitionId}: marked filterable but no collection filter references it`);
      if (field.decisionState !== 'approved' && linked.some((filter) => filter.requiredForLaunch)) errors.push(`${field.definitionId}: unapproved/deprecated definition cannot back a launch-required filter`);
      if (field.decisionState === 'deprecated' && field.usedForFiltering) errors.push(`${field.definitionId}: deprecated field cannot be an active filter architecture`);
      if (field.decisionState === 'deprecated' && linked.some((filter) => filter.customerFacing)) errors.push(`${field.definitionId}: deprecated field cannot back a customer-facing filter`);
    }
  }

  const expectedStats = {
    metafields: registry.metafields?.length || 0,
    metaobjects: registry.metaobjects?.length || 0,
    byOwnerType: Object.fromEntries(['PRODUCT', 'PRODUCTVARIANT', 'COLLECTION'].map((owner) => [owner, (registry.metafields || []).filter((field) => field.ownerType === owner).length])),
    byDecisionState: Object.fromEntries(['approved', 'proposed', 'deprecated', 'blocked'].map((state) => [state, definitions.filter((definition) => definition.decisionState === state).length])),
    approvedLaunchRequired: definitions.filter((definition) => definition.decisionState === 'approved' && definition.requiredForLaunch).length,
    approvedWithTbdOwner: definitions.filter((definition) => definition.decisionState === 'approved' && JSON.stringify(definition.ownership).match(/TBD/i)).length
  };
  if (JSON.stringify(registry.statistics) !== JSON.stringify(expectedStats)) errors.push('registry statistics do not reconcile to definitions');

  const requiredNativeConcepts = ['variant_sku', 'vendor', 'shopify_product_category', 'native_shipping_weight'];
  const nativeConcepts = new Set((registry.governance?.nativeFieldExclusions || []).map((entry) => entry.concept));
  for (const concept of requiredNativeConcepts) if (!nativeConcepts.has(concept)) errors.push(`missing native-field exclusion ${concept}`);

  for (const sourceText of options.productionSourceTexts || []) {
    const forbidden = ['metafieldDefinition' + 'Create', 'metaobjectDefinition' + 'Create', 'metafields' + 'Set', 'metaobject' + 'Upsert'];
    for (const token of forbidden) if (sourceText.includes(token)) errors.push(`Admin mutation code ${token} is forbidden in E-PBI-009 production tooling`);
  }

  return errors;
}

function definitionDataset(ownerType) {
  return ownerType === 'PRODUCT' ? 'productMetafieldDefinitions'
    : ownerType === 'PRODUCTVARIANT' ? 'variantMetafieldDefinitions'
      : ownerType === 'COLLECTION' ? 'collectionMetafieldDefinitions'
        : 'metaobjectDefinitions';
}

function flattenLiveDefinitions(snapshot) {
  const rows = [];
  for (const [ownerType, datasetName] of [['PRODUCT','productMetafieldDefinitions'],['PRODUCTVARIANT','variantMetafieldDefinitions'],['COLLECTION','collectionMetafieldDefinitions']]) {
    for (const record of snapshot.datasets?.[datasetName]?.records || []) rows.push({ ...record, resourceKind: 'metafield', ownerType, datasetName });
  }
  for (const record of snapshot.datasets?.metaobjectDefinitions?.records || []) rows.push({ ...record, resourceKind: 'metaobject', ownerType: 'METAOBJECT', datasetName: 'metaobjectDefinitions' });
  return rows;
}

function normalizedValidations(values) {
  return (values || []).map((entry) => ({ name: entry.name, value: typeof entry.value === 'string' ? entry.value : JSON.stringify(entry.value) })).sort((a, b) => a.name.localeCompare(b.name));
}

function compareDefinition(desired, live, liveDefinitions = []) {
  const desiredAccess = {
    admin: ({ none: 'NONE', merchant_read: 'MERCHANT_READ', merchant_read_write: 'MERCHANT_READ_WRITE' })[desired.accessIntent?.admin],
    storefront: ({ none: 'NONE', public_read: 'PUBLIC_READ' })[desired.accessIntent?.storefront]
  };
  if (desired.resourceKind === 'metafield') {
    const liveType = typeof live.type === 'string' ? live.type : live.type?.name;
    if (liveType !== desired.type) return { state: 'incompatible_type', differences: [{ field: 'type', desired: desired.type, current: liveType || null }] };
    const differences = [];
    for (const field of ['namespace', 'key', 'name', 'description']) if ((live[field] ?? null) !== (desired[field] ?? null)) differences.push({ field, desired: desired[field] ?? null, current: live[field] ?? null });
    const resolvedValidations = [];
    for (const rule of (desired.validationRules || []).filter((rule) => rule.enforcement === 'mutation_plan_resolution')) {
      const targets = liveDefinitions.filter((definition) => definition.resourceKind === 'metaobject' && definition.type === rule.value);
      if (rule.name !== 'metaobject_type' || targets.length !== 1 || !targets[0].id) differences.push({ field: 'reference_definition_resolution', desired: rule.value, current: null });
      else resolvedValidations.push({ name: 'metaobject_definition_id', value: targets[0].id });
    }
    const desiredShopifyValidations = normalizedValidations([...(desired.validationRules || []).filter((rule) => rule.enforcement === 'shopify_definition'), ...resolvedValidations]);
    const liveValidations = normalizedValidations(live.validations);
    if (JSON.stringify(desiredShopifyValidations) !== JSON.stringify(liveValidations)) differences.push({ field: 'validations', desired: desiredShopifyValidations, current: liveValidations });
    if (JSON.stringify(desiredAccess) !== JSON.stringify(live.access || {})) differences.push({ field: 'access', desired: desiredAccess, current: live.access || null });
    return differences.length ? { state: 'conflict', differences } : { state: 'no_op', differences: [] };
  }
  const differences = [];
  for (const field of ['type', 'name', 'description', 'displayNameKey']) if ((live[field] ?? null) !== (desired[field] ?? null)) differences.push({ field, desired: desired[field] ?? null, current: live[field] ?? null });
  const desiredFields = (desired.fields || []).map(({ key, name, description, required, type }) => ({ key, name, description, required, type })).sort((a, b) => a.key.localeCompare(b.key));
  const liveFields = (live.fieldDefinitions || []).map((field) => ({ key: field.key, name: field.name, description: field.description, required: field.required, type: typeof field.type === 'string' ? field.type : field.type?.name })).sort((a, b) => a.key.localeCompare(b.key));
  if (JSON.stringify(desiredFields) !== JSON.stringify(liveFields)) differences.push({ field: 'fields', desired: desiredFields, current: liveFields });
  if (JSON.stringify(desiredAccess) !== JSON.stringify(live.access || {})) differences.push({ field: 'access', desired: desiredAccess, current: live.access || null });
  const desiredCapabilities = { publishable: { enabled: desired.capabilities?.publishable }, translatable: { enabled: desired.capabilities?.translatable } };
  if (JSON.stringify(desiredCapabilities) !== JSON.stringify(live.capabilities || {})) differences.push({ field: 'capabilities', desired: desiredCapabilities, current: live.capabilities || null });
  return differences.length ? { state: 'conflict', differences } : { state: 'no_op', differences: [] };
}

function buildDefinitionDiff(registry, snapshot, options = {}) {
  const asOf = options.asOf;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf || '')) throw new Error('buildDefinitionDiff requires deterministic --as-of YYYY-MM-DD');
  const desired = allDefinitions(registry);
  const live = flattenLiveDefinitions(snapshot);
  const consumedLive = new Set();
  const entries = [];

  for (const definition of desired) {
    const datasetName = definitionDataset(definition.ownerType);
    const dataset = snapshot.datasets?.[datasetName];
    const base = {
      definitionId: definition.definitionId,
      resourceKind: definition.resourceKind,
      ownerType: definition.ownerType,
      namespace: definition.namespace,
      key: definition.resourceKind === 'metafield' ? definition.key : definition.type,
      desiredDecisionState: definition.decisionState,
      desiredLifecycleState: definition.lifecycleState,
      dependsOnDefinitionIds: definition.definitionDependencies || [],
      currentDefinitionId: null,
      differences: [],
      mutationAuthorized: false
    };
    if (!dataset || dataset.queryStatus !== 'success') {
      entries.push({ ...base, action: 'inaccessible_not_audited', rationale: `${datasetName} was not successfully audited.` });
      continue;
    }
    let index = live.findIndex((row, rowIndex) => !consumedLive.has(rowIndex) && row.resourceKind === definition.resourceKind && (
      definition.resourceKind === 'metafield'
        ? row.ownerType === definition.ownerType && row.namespace === definition.namespace && row.key === definition.key
        : row.type === definition.type
    ));
    if (index < 0 && definition.adminReconciliation?.currentDefinitionId) index = live.findIndex((row, rowIndex) => !consumedLive.has(rowIndex) && row.id === definition.adminReconciliation.currentDefinitionId);
    const current = index >= 0 ? live[index] : null;
    if (current) consumedLive.add(index);

    if (definition.decisionState !== 'approved') {
      const action = current && definition.decisionState === 'deprecated' ? 'deprecated_definition_still_live' : current ? 'unexpected_live_definition' : 'desired_not_approved';
      entries.push({ ...base, currentDefinitionId: current?.id || null, action, rationale: current ? 'A non-approved registry concept exists in the snapshot and requires explicit reconciliation.' : 'Registry concept is not approved and must not enter a definition-creation plan.' });
      continue;
    }
    if (!current) {
      entries.push({ ...base, action: 'create', rationale: 'Approved desired-state definition is absent from the dated Admin snapshot; creation remains gated by E-PBI-019 and E-PBI-020.' });
      continue;
    }
    const comparison = compareDefinition(definition, current, live);
    entries.push({ ...base, currentDefinitionId: current.id || null, action: comparison.state, differences: comparison.differences, rationale: comparison.state === 'no_op' ? 'Live definition matches the approved desired contract.' : 'Live definition differs from the approved desired contract and cannot be treated as a no-op.' });
  }

  live.forEach((row, index) => {
    if (consumedLive.has(index)) return;
    entries.push({
      definitionId: null,
      resourceKind: row.resourceKind,
      ownerType: row.ownerType,
      namespace: row.resourceKind === 'metafield' ? row.namespace : null,
      key: row.resourceKind === 'metafield' ? row.key : row.type,
      desiredDecisionState: null,
      desiredLifecycleState: null,
      dependsOnDefinitionIds: [],
      currentDefinitionId: row.id || null,
      action: 'unexpected_live_definition',
      differences: [],
      rationale: 'Live definition is absent from the canonical desired-state registry.',
      mutationAuthorized: false
    });
  });

  const snapshotDate = new Date(snapshot.capturedAt);
  const asOfDate = new Date(`${asOf}T23:59:59.999Z`);
  const ageDays = Math.max(0, Math.floor((asOfDate - snapshotDate) / 86400000));
  const maximumAgeDays = registry.adminReconciliation.freshnessPolicy.maximumAgeDaysForMutationPlanning;
  const refreshDeadline = new Date(registry.adminReconciliation.freshnessPolicy.refreshRequiredBeforeMutationAfter);
  const staleForMutationPlanning = ageDays > maximumAgeDays || asOfDate > refreshDeadline || (snapshot.errors || []).length > 0;
  const summary = Object.fromEntries(DIFF_STATES.map((state) => [state, entries.filter((entry) => entry.action === state).length]));
  return {
    $schema: '../schemas/epic-e-custom-data-definition-diff.schema.json',
    schemaVersion: 1,
    generatedAt: `${asOf}T00:00:00.000Z`,
    asOfDate: asOf,
    mode: 'read_only_dry_run',
    registry: { path: 'data/metafield-metaobject-definitions.json', version: registry.registryVersion, revision: registry.revision, sha256: options.registrySha256 },
    adminSnapshot: { path: registry.adminReconciliation.snapshotPath, sha256: options.snapshotSha256, capturedAt: snapshot.capturedAt, apiVersion: snapshot.apiVersion, sourceKind: snapshot.sourceKind },
    freshness: { ageDays, maximumAgeDaysForMutationPlanning: maximumAgeDays, status: staleForMutationPlanning ? 'stale_refresh_required' : 'current_for_repository_reconciliation', refreshRequiredBeforeMutation: staleForMutationPlanning, perpetualAdminStateClaim: false },
    currentObservedCounts: {
      PRODUCT: snapshot.datasets.productMetafieldDefinitions.recordCount,
      PRODUCTVARIANT: snapshot.datasets.variantMetafieldDefinitions.recordCount,
      COLLECTION: snapshot.datasets.collectionMetafieldDefinitions.recordCount,
      METAOBJECT: snapshot.datasets.metaobjectDefinitions.recordCount
    },
    entries,
    summary: { ...summary, approvedDesiredDefinitions: desired.filter((definition) => definition.decisionState === 'approved').length, totalDesiredRegistryConcepts: desired.length, totalObservedLiveDefinitions: live.length },
    downstreamGate: { mutationPlanPbi: 'E-PBI-019', definitionCreationPbi: 'E-PBI-020', deterministicInputEligible: !staleForMutationPlanning && !entries.some((entry) => ['conflict','incompatible_type','inaccessible_not_audited'].includes(entry.action)), mutationAuthorized: false }
  };
}

function validateDiffSemantics(diff, registry, snapshot) {
  const errors = [];
  if (diff.mode !== 'read_only_dry_run' || diff.downstreamGate?.mutationAuthorized || diff.entries?.some((entry) => entry.mutationAuthorized)) errors.push('definition diff must remain a non-mutating dry run');
  if (diff.adminSnapshot?.sha256 !== registry.adminReconciliation.snapshotSha256) errors.push('diff snapshot hash differs from registry reconciliation hash');
  if (diff.adminSnapshot?.capturedAt !== snapshot.capturedAt || diff.adminSnapshot?.apiVersion !== snapshot.apiVersion) errors.push('diff snapshot identity does not match the Admin observation');
  const observedTotal = ['productMetafieldDefinitions','variantMetafieldDefinitions','collectionMetafieldDefinitions','metaobjectDefinitions'].reduce((sum, name) => sum + (snapshot.datasets?.[name]?.recordCount || 0), 0);
  if (diff.summary?.totalObservedLiveDefinitions !== observedTotal) errors.push('diff live-definition total does not match snapshot');
  const actionCounts = Object.fromEntries(DIFF_STATES.map((state) => [state, (diff.entries || []).filter((entry) => entry.action === state).length]));
  for (const state of DIFF_STATES) if (diff.summary?.[state] !== actionCounts[state]) errors.push(`diff summary ${state} does not reconcile`);
  for (const entry of diff.entries || []) {
    if (!DIFF_STATES.includes(entry.action)) errors.push(`unsupported diff action ${entry.action}`);
    if (entry.action === 'no_op' && entry.differences?.length) errors.push(`${entry.definitionId || entry.currentDefinitionId}: no-op cannot contain differences`);
    if (entry.action === 'no_op') {
      const desired = allDefinitions(registry).find((definition) => definition.definitionId === entry.definitionId);
      const live = flattenLiveDefinitions(snapshot).find((row) => row.id === entry.currentDefinitionId);
      if (!desired || !live || compareDefinition(desired, live, flattenLiveDefinitions(snapshot)).state !== 'no_op') errors.push(`${entry.definitionId}: live mismatch was silently treated as no-op`);
    }
  }
  const allDefinitionDatasetsZero = ['productMetafieldDefinitions','variantMetafieldDefinitions','collectionMetafieldDefinitions','metaobjectDefinitions'].every((name) => snapshot.datasets?.[name]?.queryStatus === 'success' && snapshot.datasets?.[name]?.recordCount === 0);
  if (allDefinitionDatasetsZero) {
    const approvedCount = allDefinitions(registry).filter((definition) => definition.decisionState === 'approved').length;
    if (diff.summary?.create !== approvedCount) errors.push('zero Admin definitions must yield create for every approved desired definition');
  }
  return errors;
}

module.exports = { APPROVED_CLASSES, DECISION_STATES, DIFF_STATES, sha256, allDefinitions, validateRegistrySemantics, buildDefinitionDiff, validateDiffSemantics };
