const assert = require('assert');
const {validateBatch, read, files} = require('./validate-epic-e-batch-2b1');

const clone = (value) => JSON.parse(JSON.stringify(value));
const base = Object.fromEntries(Object.entries(files).map(([name, [dataPath]]) => [name, read(dataPath)]));
assert.deepStrictEqual(validateBatch(base), []);

function rejects(mutator, needle) {
  const data = clone(base);
  mutator(data);
  const errors = validateBatch(data);
  assert(errors.some((error) => error.includes(needle)), `expected ${needle}; got ${errors.join('; ')}`);
}

rejects((data) => {
  const row = data.classification.mappings.find((item) => item.handle === 'purple-jade-bead-strand');
  row.proposedProductClass = null;
  row.classDecisionState = 'blocked';
  row.catalogScopeDisposition = 'blocked_pending_scope_decision';
}, 'reverted to obsolete catalog-scope blocker');

rejects((data) => { data.classification.statistics.byClass.replacement_part = 53; }, 'class totals must reconcile to 122');

rejects((data) => {
  data.identity.variantIdentities[0].skuCandidates.push({value: 'RH-999999', source: 'agent output', sourceRole: 'commerce_sku_proposal', semanticRole: 'sellable_variant', derivation: 'governed_registry_allocation', decisionState: 'proposed', approvalDecisionId: null, commerceSkuApproved: false});
}, 'ad-hoc RH sequence issuance outside governed SKU registry');

rejects((data) => {
  const first = data.registry.allocations.find((row) => row.sku);
  const second = data.registry.allocations.find((row) => row.sku && row.variantGid !== first.variantGid);
  second.replacedOrRetiredSkuHistory.push({sku: first.sku.toLowerCase(), state: 'retired', retiredAt: '2026-09-04T12:00:00Z', reason: 'negative test'});
}, 'duplicate active/retired SKU reuse');

rejects((data) => {
  const candidate = data.identity.variantIdentities.find((row) => row.commerceSkuProposal).skuCandidates.find((row) => row.sourceRole === 'commerce_sku_proposal');
  candidate.derivation = 'product_title';
}, 'SKU derived from prohibited product title/handle/class/vendor/family/spec source');

rejects((data) => {
  const row = data.identity.variantIdentities.find((item) => item.handle === 'trimmaster-pulleys');
  row.commerceSkuProposal = 'IDM-T11';
}, 'legacy component identifier silently promoted to sold-set SKU');

rejects((data) => {
  const row = data.identity.variantIdentities.find((item) => item.handle === 'automatic-feed-clamp');
  row.legacyPartNumbers.pop();
}, 'machine-size-specific technical IDs was arbitrarily discarded');

rejects((data) => {
  const row = data.vendor.exceptions.find((item) => item.handle === 'dialux-polishing-paste');
  row.proposedShopifyVendor = 'Rhino Lapidary';
}, 'Vendor defaulted to Rhino despite unambiguous third-party marketed-brand evidence');

rejects((data) => {
  const row = data.vendor.exceptions[0];
  row.observedManufacturer = row.observedBrand;
}, 'manufacturer silently inferred from marketed brand');

rejects((data) => {
  const row = data.classification.mappings.find((item) => item.handle === 'jademaster');
  row.businessMeaning = row.candidateShopifyTaxonomy.path;
}, 'taxonomy business meaning confused');

rejects((data) => { data.variants.shopifyAdminMutationAuthorized = true; }, 'Shopify Admin mutation or E-PBI-009 implementation');

console.log('Epic E Batch 2B.1 negative tests passed: all 11 required classification, SKU, legacy-ID, Vendor/manufacturer, taxonomy, and no-Admin-mutation regressions were rejected.');
