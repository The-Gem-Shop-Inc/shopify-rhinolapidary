const fs = require('fs');
const path = require('path');
const assert = require('assert');
const Ajv2020 = require('ajv/dist/2020');
const {
  sha256,
  validateRegistrySemantics,
  buildDefinitionDiff,
  validateDiffSemantics
} = require('./lib/epic-e-custom-data-contract');

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const clone = (value) => JSON.parse(JSON.stringify(value));
const registry = readJson('data/metafield-metaobject-definitions.json');
const classification = readJson('data/epic-e-product-classification.json');
const filters = readJson('data/collection-filter-spec.json');
const sourceGovernance = readJson('data/epic-e-source-governance.json');
const productRules = readJson('data/product-data-rules.json');
const snapshot = readJson(registry.adminReconciliation.snapshotPath);
const schema = readJson('schemas/metafield-metaobject-definitions.schema.json');
const ajv = new Ajv2020({ allErrors: true, strict: false, formats: { date: /^\d{4}-\d{2}-\d{2}$/, 'date-time': (value) => !Number.isNaN(Date.parse(value)) } });
const schemaValidate = ajv.compile(schema);

function registryErrors(candidate, productionSourceTexts = []) {
  const errors = [];
  if (!schemaValidate(candidate)) errors.push(...schemaValidate.errors.map((error) => `${error.instancePath} ${error.message}`));
  errors.push(...validateRegistrySemantics(candidate, { classification, filters, sourceGovernance, productRules, productionSourceTexts }));
  return errors;
}

function expectRegistryFailure(label, mutate, pattern, sourceTexts = []) {
  const candidate = clone(registry);
  mutate(candidate);
  const errors = registryErrors(candidate, sourceTexts);
  assert(errors.some((error) => pattern.test(error)), `${label}: expected ${pattern}, got ${errors.join(' | ')}`);
}

assert.deepStrictEqual(registryErrors(registry), [], 'baseline registry must pass');

expectRegistryFailure('TBD owner', (candidate) => { candidate.metafields[0].ownership.operationalOwner = 'TBD'; }, /TBD|enum/);
expectRegistryFailure('missing owner type', (candidate) => { delete candidate.metafields[0].ownerType; }, /ownerType|owner\/resource type/);
expectRegistryFailure('missing type/cardinality', (candidate) => { delete candidate.metafields[0].cardinality; }, /cardinality|type\/cardinality/);
expectRegistryFailure('duplicate namespace/key', (candidate) => { const copy = clone(candidate.metafields[0]); copy.definitionId = 'CD-MF-099'; candidate.metafields.push(copy); }, /duplicate custom-data identity/);
expectRegistryFailure('native Variant SKU duplicate', (candidate) => { const field = candidate.metafields[3]; field.ownerType = 'PRODUCTVARIANT'; field.key = 'sku'; }, /native Shopify concept variant_sku/);
expectRegistryFailure('native Vendor duplicate', (candidate) => { candidate.metafields[3].key = 'vendor'; }, /native Shopify concept vendor/);
expectRegistryFailure('native Category duplicate', (candidate) => { candidate.metafields[3].key = 'shopify_category'; }, /native Shopify concept shopify_product_category/);
expectRegistryFailure('native shipping weight duplicate', (candidate) => { const field = candidate.metafields[3]; field.ownerType = 'PRODUCTVARIANT'; field.key = 'shipping_weight'; }, /native Shopify concept native_shipping_weight/);
expectRegistryFailure('approved definition without consumer', (candidate) => { candidate.metafields[0].consumers = { mvp: [], postMvp: [] }; }, /no concrete consumer/);
expectRegistryFailure('canonical text compatibility', (candidate) => { const field = candidate.metafields[2]; field.decisionState = 'approved'; field.lifecycleState = 'approved_desired_state'; field.canonicalRole = 'canonical'; }, /legacy rhino\.compatibility/);
expectRegistryFailure('opaque JSON final architecture', (candidate) => { const field = candidate.metafields[4]; field.decisionState = 'approved'; field.lifecycleState = 'approved_desired_state'; field.canonicalRole = 'canonical'; field.consumers.mvp = ['F']; }, /legacy rhino\.machine_specs JSON/);
expectRegistryFailure('deprecated without replacement authority', (candidate) => { const field = candidate.metafields[2]; field.migration.replacementAuthorityPbi = null; field.migration.replacementDefinitionId = null; }, /lacks replacement authority/);
expectRegistryFailure('future PBI silently approved', (candidate) => { const field = candidate.metafields[3]; field.sourcePbi = 'E-PBI-010'; field.decisionState = 'approved'; field.lifecycleState = 'approved_desired_state'; }, /future E-PBI-010 definition/);
expectRegistryFailure('metaobject without reuse justification', (candidate) => { candidate.metaobjects[0].reuseJustification = ''; }, /reuse\/reference justification|minLength/);
expectRegistryFailure('unknown Product class', (candidate) => { candidate.metafields[0].applicability.productClasses.push('finished_stone'); }, /unknown Product class|enum/);
expectRegistryFailure('zero Admin definitions invalidate desired state', (candidate) => { candidate.metafields[0].decisionState = 'blocked'; candidate.metafields[0].lifecycleState = 'blocked'; }, /rhino\.product_class must be an approved/);
expectRegistryFailure('Admin mutation code', () => {}, /Admin mutation code .* forbidden/, ['async function run(){ return metafieldDefinitionCreate(input); }']);
expectRegistryFailure('Admin mutation boundary', (candidate) => { candidate.batchBoundary.adminMutationAuthorized = true; }, /repository-only|false/);

const registryBytes = fs.readFileSync(path.join(root, 'data/metafield-metaobject-definitions.json'));
const snapshotBytes = fs.readFileSync(path.join(root, registry.adminReconciliation.snapshotPath));
const buildOptions = { asOf: '2026-09-04', registrySha256: sha256(registryBytes), snapshotSha256: sha256(snapshotBytes) };
const zeroDiff = buildDefinitionDiff(registry, snapshot, buildOptions);
assert.strictEqual(zeroDiff.summary.create, registry.statistics.byDecisionState.approved, 'zero-definition snapshot must produce one create per approved definition');
assert.strictEqual(registry.metafields.filter(f=>['product_class','machine_family'].includes(f.key)&&f.decisionState==='approved').length + registry.metaobjects.filter(m=>m.type==='machine_family'&&m.decisionState==='approved').length, 3, 'all three original approved foundations remain');
assert.strictEqual(zeroDiff.summary.desired_not_approved, registry.statistics.byDecisionState.proposed + registry.statistics.byDecisionState.deprecated + registry.statistics.byDecisionState.blocked, 'every unapproved/deprecated concept must remain deferred');
assert.strictEqual(registry.metafields.filter(f=>['grit','compatibility','machine_specs'].includes(f.key)&&f.decisionState!=='approved').length,3,'original three unapproved/deprecated concepts remain deferred');
assert.strictEqual(zeroDiff.downstreamGate.mutationAuthorized, false);
assert.deepStrictEqual(validateDiffSemantics(zeroDiff, registry, snapshot), []);
const invalidZeroDiff = clone(zeroDiff);
invalidZeroDiff.entries.find((entry) => entry.definitionId === 'CD-MF-001').action = 'desired_not_approved';
invalidZeroDiff.summary.create -= 1;
invalidZeroDiff.summary.desired_not_approved += 1;
assert(validateDiffSemantics(invalidZeroDiff, registry, snapshot).some((error) => /zero Admin definitions must yield create/.test(error)), 'zero live definitions cannot invalidate an approved desired definition');

const noOpSnapshot = clone(snapshot);
noOpSnapshot.datasets.productMetafieldDefinitions.records.push({
  id: 'gid://shopify/MetafieldDefinition/0',
  namespace: 'rhino',
  key: 'product_class',
  name: registry.metafields[0].name,
  description: registry.metafields[0].description,
  type: { name: 'single_line_text_field', category: 'TEXT' },
  validations: [{ name: 'choices', value: JSON.stringify(['machine','replacement_part','consumable','accessory']) }],
  access: { admin: 'MERCHANT_READ_WRITE', storefront: 'PUBLIC_READ' }
});
noOpSnapshot.datasets.productMetafieldDefinitions.recordCount = 1;
noOpSnapshot.datasets.productMetafieldDefinitions.resultState = 'nonzero';
const noOpDiff = buildDefinitionDiff(registry, noOpSnapshot, buildOptions);
assert.strictEqual(noOpDiff.entries.find((entry) => entry.definitionId === 'CD-MF-001').action, 'no_op', 'matching live definition must be a no-op');

const typeSnapshot = clone(snapshot);
typeSnapshot.datasets.productMetafieldDefinitions.records.push({ id: 'gid://shopify/MetafieldDefinition/1', namespace: 'rhino', key: 'product_class', name: 'Product class', description: registry.metafields[0].description, type: { name: 'json', category: 'JSON' }, validations: [], access: { admin: 'MERCHANT_READ_WRITE', storefront: 'PUBLIC_READ' } });
typeSnapshot.datasets.productMetafieldDefinitions.recordCount = 1;
typeSnapshot.datasets.productMetafieldDefinitions.resultState = 'nonzero';
const typeDiff = buildDefinitionDiff(registry, typeSnapshot, buildOptions);
assert.strictEqual(typeDiff.entries.find((entry) => entry.definitionId === 'CD-MF-001').action, 'incompatible_type', 'type mismatch must not be no-op');
const unsafeNoOpDiff = clone(typeDiff);
const unsafeNoOpEntry = unsafeNoOpDiff.entries.find((entry) => entry.definitionId === 'CD-MF-001');
unsafeNoOpEntry.action = 'no_op';
unsafeNoOpEntry.differences = [];
unsafeNoOpDiff.summary.incompatible_type -= 1;
unsafeNoOpDiff.summary.no_op += 1;
assert(validateDiffSemantics(unsafeNoOpDiff, registry, typeSnapshot).some((error) => /silently treated as no-op/.test(error)), 'live type mismatch cannot be reported as no-op');

const deprecatedLiveSnapshot = clone(snapshot);
deprecatedLiveSnapshot.datasets.productMetafieldDefinitions.records.push({ id: 'gid://shopify/MetafieldDefinition/3', namespace: 'rhino', key: 'compatibility', name: 'Compatibility', description: null, type: { name: 'list.single_line_text_field', category: 'TEXT' }, validations: [], access: { admin: 'MERCHANT_READ_WRITE', storefront: 'PUBLIC_READ' } });
deprecatedLiveSnapshot.datasets.productMetafieldDefinitions.recordCount = 1;
deprecatedLiveSnapshot.datasets.productMetafieldDefinitions.resultState = 'nonzero';
const deprecatedLiveDiff = buildDefinitionDiff(registry, deprecatedLiveSnapshot, buildOptions);
assert.strictEqual(deprecatedLiveDiff.entries.find((entry) => entry.definitionId === 'CD-MF-003').action, 'deprecated_definition_still_live');

const unexpectedSnapshot = clone(snapshot);
unexpectedSnapshot.datasets.productMetafieldDefinitions.records.push({ id: 'gid://shopify/MetafieldDefinition/4', namespace: 'unknown', key: 'mystery', name: 'Mystery', description: null, type: { name: 'single_line_text_field', category: 'TEXT' }, validations: [], access: { admin: 'MERCHANT_READ_WRITE', storefront: 'NONE' } });
unexpectedSnapshot.datasets.productMetafieldDefinitions.recordCount = 1;
unexpectedSnapshot.datasets.productMetafieldDefinitions.resultState = 'nonzero';
const unexpectedDiff = buildDefinitionDiff(registry, unexpectedSnapshot, buildOptions);
assert.strictEqual(unexpectedDiff.summary.unexpected_live_definition, 1);

const keyRegistry = clone(registry);
keyRegistry.metafields[0].adminReconciliation.currentDefinitionId = 'gid://shopify/MetafieldDefinition/2';
const keySnapshot = clone(snapshot);
keySnapshot.datasets.productMetafieldDefinitions.records.push({ id: 'gid://shopify/MetafieldDefinition/2', namespace: 'rhino', key: 'wrong_key', name: 'Product class', description: registry.metafields[0].description, type: { name: 'single_line_text_field', category: 'TEXT' }, validations: [], access: { admin: 'MERCHANT_READ_WRITE', storefront: 'PUBLIC_READ' } });
keySnapshot.datasets.productMetafieldDefinitions.recordCount = 1;
keySnapshot.datasets.productMetafieldDefinitions.resultState = 'nonzero';
const keyDiff = buildDefinitionDiff(keyRegistry, keySnapshot, buildOptions);
assert.strictEqual(keyDiff.entries.find((entry) => entry.definitionId === 'CD-MF-001').action, 'conflict', 'key mismatch for known live ID must not be no-op');

const inaccessibleSnapshot = clone(snapshot);
inaccessibleSnapshot.datasets.productMetafieldDefinitions.queryStatus = 'inaccessible_scope';
inaccessibleSnapshot.datasets.productMetafieldDefinitions.resultState = 'inaccessible_scope';
const inaccessibleDiff = buildDefinitionDiff(registry, inaccessibleSnapshot, buildOptions);
assert(inaccessibleDiff.entries.some((entry) => entry.action === 'inaccessible_not_audited'));

const staleDiff = buildDefinitionDiff(registry, snapshot, { ...buildOptions, asOf: '2026-09-20' });
assert.strictEqual(staleDiff.freshness.status, 'stale_refresh_required');
assert.strictEqual(staleDiff.freshness.refreshRequiredBeforeMutation, true);

const unsafeDiff = clone(zeroDiff);
unsafeDiff.downstreamGate.mutationAuthorized = true;
assert(validateDiffSemantics(unsafeDiff, registry, snapshot).some((error) => /non-mutating/.test(error)));

console.log('Epic E E-PBI-009 negative tests passed: ownership, scope/type/cardinality, native-field boundaries, lifecycle, future-PBI, metaobject, vocabulary, diff mismatch/freshness, and Admin-mutation regressions were rejected.');
