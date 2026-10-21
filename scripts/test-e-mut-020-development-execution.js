'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { authorize, mutationInput, classify, AUTH } = require('./lib/e-mut-020-development-execution');
const bundle = authorize(), record = JSON.parse(fs.readFileSync(AUTH));
let passed = 0;
for (const mutate of [r => r.planId = 'E-MUT-021', r => r.inputSha256 = '0'.repeat(64), r => r.approvalMode = 'skipApprovals', r => r.authorizedMutations.push('metafieldsSet'), r => r.shop.domain = 'other.myshopify.com', r => r.delegatedAuthorityOverride.explicit = false]) {
  const changed = structuredClone(record); mutate(changed); assert.throws(() => authorize(changed)); passed++;
}
const ids = { 'CD-MO-001': 'gid://shopify/MetaobjectDefinition/123' };
for (const row of bundle.rows) { const input = mutationInput(row, ids); assert.ok(input.type); assert.ok(!('admin' in input.access)); assert.ok(!('customerAccount' in input.access)); assert.ok(!('value' in input)); passed++; }
const family = bundle.rows.find(r => r.rowId === 'CD-MF-002');
assert.throws(() => mutationInput(family)); passed++;
assert.deepEqual(mutationInput(family, ids).validations, [{name:'metaobject_definition_id',value:ids['CD-MO-001']}]); passed++;
const before = JSON.parse(fs.readFileSync('docs/qa/evidence/epic-e/E-MUT-020-2026-10-05-before-admin-snapshot.json'));
assert.equal(classify(before).filter(r => r.beforeState === 'ABSENT').length, 38); passed++;
const incomplete = structuredClone(before); incomplete.datasets.products.queryStatus = 'query_failure'; assert.throws(() => classify(incomplete)); passed++;
const live = structuredClone(before), row = bundle.rows.find(r => r.rowId === 'CD-MF-001'), input = mutationInput(row);
live.datasets.productMetafieldDefinitions.records.push({...input,id:'gid://shopify/MetafieldDefinition/123',access:{admin:'PUBLIC_READ_WRITE',storefront:'PUBLIC_READ',customerAccount:'NONE'}});
live.datasets.productMetafieldDefinitions.recordCount = 1;
assert.equal(classify(live).find(r => r.rowId === row.rowId).beforeState, 'EXACT_MATCH'); passed++;
for (const access of [{admin:'PRIVATE',storefront:'PUBLIC_READ',customerAccount:'NONE'},{admin:'PUBLIC_READ_WRITE',storefront:'NONE',customerAccount:'NONE'},{admin:'PUBLIC_READ_WRITE',storefront:'PUBLIC_READ',customerAccount:'READ'}]) {
  const changed = structuredClone(live); changed.datasets.productMetafieldDefinitions.records[0].access = access;
  assert.equal(classify(changed).find(r => r.rowId === row.rowId).beforeState, 'CONFLICT'); passed++;
}
console.log(JSON.stringify({passed,failed:0,scope:'E-MUT-020 exact-input delegated development authorization; definitions only; no remote calls'}));
