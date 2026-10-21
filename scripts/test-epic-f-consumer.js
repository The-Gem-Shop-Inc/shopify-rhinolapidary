'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { loadContext, evaluate, classification, build, read } = require('./lib/epic-f-consumer');
const { requiredDatasets } = require('./lib/epic-e-readiness');
const { validateGenerated } = require('./validate-epic-f-consumer');
const fixture = read('tests/fixtures/epic-f-consumer.json');
const stateValidator = new (require('ajv/dist/2020'))().compile(read('schemas/epic-f-consumer-state.schema.json'));
const query = { productGid: fixture.machineProductGid, domain: 'product_class', field: 'PRODUCT.metafields.rhino.product_class' };
const asOf = '2026-09-11T12:00:00.000Z';

function approvedFixture() {
  const c = loadContext();
  c.fixtureOnly = true;
  const before = read(c.plans.product_class.currentReadSnapshot.path);
  const after = structuredClone(before);
  after.capturedAt = asOf;
  after.errors = [];
  for (const key of requiredDatasets) {
    const records = after.datasets[key]?.records || [];
    after.datasets[key] = { queryStatus: 'success', errorCount: 0, recordCount: records.length, records };
  }
  for (const row of c.bundles.product_class.rows) {
    const p = after.datasets.products.records.find(p => p.id === row.targetGid);
    p.metafields = { nodes: [{ id: 'gid://shopify/Metafield/' + p.id.split('/').pop(), namespace: 'rhino', key: 'product_class', type: 'single_line_text_field', jsonValue: row.desired }] };
  }
  c.before.product_class = before;
  c.after.product_class = after;
  c.receiptsCurrent.product_class = true;
  c.plans.product_class.executionStatus = 'completed';
  c.plans.product_class.driftValidation.status = 'passed';
  c.plans.product_class.approvals.forEach(a => Object.assign(a, { granted: true, recordedAt: asOf, evidence: 'repository-only-fixture' }));
  Object.assign(c.readiness.rows.find(r => r.consumer === 'F' && r.domain === 'product_class'), {
    safe_for_customer_fact_rendering: true, value_blocked: false, admin_mutation_required: false, admin_reconciliation_required: false,
  });
  return c;
}
const passed = new Set();
const positive = approvedFixture();
const state = evaluate(positive, query, asOf);
assert(stateValidator(state), JSON.stringify(stateValidator.errors));
assert(state.eligible, JSON.stringify(state));
assert(state.suppressed, 'Repository-only approval simulation must remain suppressed for customers');
// Internal fixture formatter proves a positive value path without a customer renderer.
assert.equal(state.eligible && positive.fixtureOnly ? positive.bundles.product_class.rows.find(r => r.targetGid === query.productGid).desired : '', 'machine');
passed.add('approved_current');
const negatives = {
  missing_value: c => { c.bundles.product_class.rows.find(r => r.targetGid === query.productGid).desired = null; },
  proposed_value: c => { c.bundles.product_class.rows.find(r => r.targetGid === query.productGid).valueState = 'proposed'; },
  conflicting_value: c => { c.bundles.product_class.rows.find(r => r.targetGid === query.productGid).conflictIds = ['fixture-conflict']; },
  stale_approval: c => { c.inputsCurrent = false; },
  stale_reconciliation: c => { c.receiptsCurrent.product_class = false; },
  unauthorized_nonblank: c => { c.bundles.product_class.rows = []; },
  missing_approval: c => { c.bundles.product_class.rows.find(r => r.targetGid === query.productGid).approvalDecisionId = null; },
  source_revocation: c => { c.decisions.decisions.productClass.bulkApproval.decisionState = 'blocked'; },
  audience_denied: c => { c.registry.metafields.find(f => f.key === 'product_class').accessIntent.storefront = 'none'; },
  activation_denied: c => { c.plans.product_class.approvals[0].granted = false; },
  live_value_drift: c => { c.after.product_class.datasets.products.records.find(p => p.id === query.productGid).metafields.nodes[0].jsonValue = 'unapproved'; },
  wrong_live_type: c => { c.after.product_class.datasets.products.records.find(p => p.id === query.productGid).metafields.nodes[0].type = 'json'; },
};
for (const [name, mutate] of Object.entries(negatives)) {
  const c = approvedFixture(); mutate(c);
  const result = evaluate(c, query, asOf);
  assert(stateValidator(result), JSON.stringify(stateValidator.errors));
  assert(!result.eligible && result.suppressed, name); passed.add(name);
}
for (const [name, override] of Object.entries({ wrong_product: { productGid: 'gid://shopify/Product/1' },
  wrong_class: { productGid: positive.classification.mappings.find(m => m.proposedProductClass === 'consumable').productGid },
  wrong_field: { field: 'PRODUCT.metafields.rhino.input_voltage' }, wrong_domain: { domain: 'electrical' } })) {
  assert(!evaluate(positive, { ...query, ...override }, asOf).eligible, name); passed.add(name);
}
assert(!evaluate(positive, query, '2026-09-19T00:00:00.000Z').eligible); passed.add('expired_eligibility');
assert(!evaluate(positive, query, '2026-09-18T12:00:00.000Z').eligible, 'Expiry is exclusive');
assert.throws(() => build(positive), /fixture/); passed.add('fixture_leakage');
const ignored = fs.readFileSync('.shopifyignore', 'utf8');
for (const directory of ['tests', 'data', 'schemas', 'scripts']) assert(ignored.includes(directory + '/*'), 'Repository contract/fixtures must be excluded from theme upload');
assert.equal(classification(positive, 'gid://shopify/Product/1'), null);
assert(!evaluate(positive, { ...query, productGid: 'gid://shopify/Product/1', title: 'TrimMaster', tags: ['machine'], collections: ['machines'], vendor: 'Rhino Lapidary', handle: 'trimmaster' }, asOf).eligible);
passed.add('title_tag_collection_fallback');
const raw = approvedFixture(); raw.bundles.product_class.rows = [];
raw.after.product_class.datasets.products.records.find(p => p.id === query.productGid).descriptionHtml = 'machine';
assert(!evaluate(raw, query, asOf).eligible); passed.add('raw_description_fallback');
const current = loadContext(); const generated = build(current);
const revoked = structuredClone(current);
revoked.decisions.decisions.productClass.bulkApproval.decisionState = 'blocked';
assert.throws(() => build(revoked), /Epic E|classification/);
const stale = structuredClone(current); stale.inputsCurrent = false;
assert.throws(() => build(stale), /Stale/);
assert(validateGenerated({ ...generated.artifact, fixtureOnly: true }, generated.liquid, current).length);
assert(validateGenerated(generated.artifact, generated.liquid + 'machine', current).length);
const drift = structuredClone(generated.artifact); drift.routes[0].productClass = 'machine';
assert(validateGenerated(drift, generated.liquid, current).length);
passed.add('generated_artifact_drift');
assert.deepEqual([...passed].sort(), fixture.cases.slice().sort());
console.log(`F1 consumer adversarial matrix passed: ${passed.size} cases; positive fixtures cannot generate customer artifacts.`);
