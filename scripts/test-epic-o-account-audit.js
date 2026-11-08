'use strict';

const assert = require('node:assert/strict');
const {paths, readJson, validateSnapshot} = require('./lib/epic-o-account-audit');

const snapshot = readJson(paths.snapshot);
const queries = readJson(paths.queries);
const now = '2026-11-08T04:00:00.000Z';
const clone = (value) => structuredClone(value);

function expectFailure(name, mutateSnapshot, mutateQueries, fragment) {
  const candidateSnapshot = clone(snapshot);
  const candidateQueries = clone(queries);
  mutateSnapshot?.(candidateSnapshot);
  mutateQueries?.(candidateQueries);
  const result = validateSnapshot(candidateSnapshot, candidateQueries, {now});
  assert.ok(result.errors.some((error) => error.includes(fragment)), `${name} did not fail with ${fragment}: ${result.errors.join(' | ')}`);
}

const valid = validateSnapshot(snapshot, queries, {now});
assert.deepEqual(valid.errors, []);
assert.equal(valid.readyForNativeRepositoryWork, true);

expectFailure('wrong store identity', (value) => {
  value.canonicalStore.observedMyshopifyDomain = 'different-store.myshopify.com';
}, null, 'Canonical store identity mismatch');

const stale = validateSnapshot(snapshot, queries, {now: '2026-11-16T00:00:00.000Z'});
assert.ok(stale.errors.some((error) => error.includes('Evidence is stale')));

expectFailure('missing verified value', (value) => {
  value.configuration.loginLinksVisible.value = null;
}, null, 'Missing login-link visibility');

expectFailure('partial pagination marked complete', (value) => {
  value.additionalInventory.installedAppsAndExtensions.paginationComplete = true;
}, null, 'inaccessible app inventory');

expectFailure('mutation operation', null, (value) => {
  value.operations.push({
    id: 'O-QUERY-999', operationType: 'mutation', operationName: 'ChangeCustomerAccounts', purpose: 'forbidden',
    result: 'not-run', pagination: 'not-applicable', customerRecordsRead: false, rawResponseStored: false,
  });
}, 'not an allowed read-only query operation');

expectFailure('customer PII', (value) => {
  value.additionalInventory.unsafeFixture = ['customer', 'example.com'].join('@');
}, null, 'email address');

expectFailure('secret', (value) => {
  value.additionalInventory.unsafeFixture = ['shpat', 'example', 'secret', 'value'].join('_');
}, null, 'Shopify access token');

expectFailure('classic cannot mean new accounts', (value) => {
  value.configuration.accountMode.value = 'CLASSIC';
}, null, 'CLASSIC finding cannot confirm');

expectFailure('missing API version called verified', (value) => {
  value.api.versionEvidenceState = 'verified';
}, null, 'Missing exact API version');

expectFailure('partial evidence called complete', (value) => {
  value.completeness.oPbi001Complete = true;
}, null, 'O-PBI-001 cannot be Complete');

console.log('Epic O account audit negative fixtures passed: store, freshness, required values, pagination, mutation, PII, secrets, CLASSIC mode, API version, and completion claims.');
