const assert = require('assert');
const {validateBatch, read, files} = require('./validate-epic-e-batch-2b');

const clone = (value) => JSON.parse(JSON.stringify(value));
const base = Object.fromEntries(Object.entries(files).map(([name, [dataPath]]) => [name, read(dataPath)]));
assert.deepStrictEqual(validateBatch(base), []);

function rejects(mutator, needle) {
  const data = clone(base);
  mutator(data);
  const errors = validateBatch(data);
  assert(errors.some((error) => error.includes(needle)), `expected ${needle}; got ${errors.join('; ')}`);
}

rejects((data) => { data.configuration.candidates.find((row) => row.candidateId === 'CONFIG-012').sourceObservations[0].location = 'Size: 6", 10", 14", 18"'; }, 'source observation is inconsistent');
rejects((data) => { data.configuration.candidates.find((row) => row.candidateId === 'CONFIG-010').conflictIds = ['C-040']; }, 'belongs to EM-1, not jademaster');
rejects((data) => { data.decisions.decisions.productClass.overrides[0].productGid = 'gid://shopify/Product/999999999'; }, 'unknown Product GID');
rejects((data) => { data.decisions.decisions.sku.candidateDecisions[0].variantGid = 'gid://shopify/ProductVariant/999999999'; }, 'unknown Variant GID');
rejects((data) => { data.decisions.evidenceBaseline.sha256 = '0'.repeat(64); }, 'stale evidence baseline');
rejects((data) => { delete data.decisions.decisions.vendor.owner; }, "must have required property 'owner'");
rejects((data) => { data.classification.mappings[0].proposedProductClass = 'kit'; }, 'class outside closed vocabulary');
rejects((data) => { data.classification.mappings[0].productTypeRecommendation.value = 'Machine'; }, 'Product Type used as duplicate product-class authority');
rejects((data) => { data.classification.mappings[0].supportingEvidence.push({sourceKind: 'tag', source: 'Admin', location: 'tags', canonicalForClass: true}); }, 'tag/collection used as class or compatibility proof');
rejects((data) => { data.configuration.candidates[0].resolution.authorizesMutation = true; }, 'product split/merge/variant mutation represented as authorized');
rejects((data) => { data.decisions.decisions.commercialConfiguration[0].candidateId = 'CONFIG-999'; }, 'must cover CONFIG-001 through CONFIG-022 exactly');
rejects((data) => { data.configuration.metafieldDefinitions = []; }, 'Shopify Admin mutation or E-PBI-009 implementation');

console.log('Epic E Batch 2B regression tests passed: approval authority, evidence baseline, option reconciliation, conflict semantics, classification, no-mutation decisions, and E-PBI-009 boundaries reject invalid fixtures.');
