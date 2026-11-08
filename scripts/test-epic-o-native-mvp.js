'use strict';

const assert = require('node:assert/strict');
const {paths, readJson, validateNativeMvp, evaluateBuyAgainScenario} = require('./lib/epic-o-native-mvp');

const contract = readJson(paths.contract);
const fixtures = readJson(paths.fixtures);
const snapshot = readJson(paths.snapshot);
const authorization = readJson(paths.authorization);
const clone = (value) => structuredClone(value);

assert.deepEqual(validateNativeMvp(contract, fixtures, snapshot, authorization).errors, []);

for (const scenario of fixtures.buyAgainScenarios) {
  const result = evaluateBuyAgainScenario(scenario);
  assert.equal(result.historicalTermsPromised, scenario.navigationInterrupted || scenario.networkFailure ? undefined : false, scenario.id);
  if (Object.keys(result.priceUsed || {}).length) {
    for (const line of scenario.lines.filter((candidate) => result.added[candidate.key])) {
      assert.equal(result.priceUsed[line.key], line.currentPrice, `${scenario.id} must use current price`);
      if (line.currentPrice !== line.historicalPrice) {
        assert.notEqual(result.priceUsed[line.key], line.historicalPrice, `${scenario.id} must not use the historical price`);
      }
    }
  }
}

function expectFailure(name, mutate, fragment) {
  const candidateContract = clone(contract);
  const candidateFixtures = clone(fixtures);
  const candidateSnapshot = clone(snapshot);
  const candidateAuthorization = clone(authorization);
  mutate(candidateContract, candidateFixtures, candidateSnapshot, candidateAuthorization);
  const result = validateNativeMvp(candidateContract, candidateFixtures, candidateSnapshot, candidateAuthorization);
  assert.ok(result.errors.some((error) => error.includes(fragment)), `${name} did not fail with ${fragment}: ${result.errors.join(' | ')}`);
}

expectFailure('classic mode', (_contract, _fixtures, candidate) => {
  candidate.configuration.accountMode.value = 'CLASSIC';
}, 'Verified NEW_CUSTOMER_ACCOUNTS');

expectFailure('custom auth', (candidate) => {
  candidate.architecture.customAuthentication = true;
}, 'customAuthentication');

expectFailure('missing scenario', (_contract, candidate) => {
  candidate.buyAgainScenarios = candidate.buyAgainScenarios.filter((scenario) => scenario.id !== 'network-failure');
}, 'Missing Buy again fixture network-failure');

expectFailure('ownership inference', (candidate) => {
  candidate.privacyInvariants.purchaseDoesNotEstablishOwnership = false;
}, 'purchaseDoesNotEstablishOwnership');

expectFailure('PII fixture', (_contract, candidate) => {
  candidate.accountStates[0].unsafe = ['person', 'example.com'].join('@');
}, 'email address');

expectFailure('planning flag rewrite', (_contract, _fixtures, _snapshot, candidate) => {
  candidate.supersedesPlanningAuthorizationFlags = true;
}, 'planning snapshot must remain historical');

console.log('Epic O native MVP tests passed: current catalog reconciliation, partial/error recovery, architecture, privacy, authorization provenance, and negative fixtures.');
