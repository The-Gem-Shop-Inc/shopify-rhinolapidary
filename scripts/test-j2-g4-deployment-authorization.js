'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const exception = JSON.parse(fs.readFileSync('data/j2-g4-preview-theme-check-exception.json', 'utf8'));
const staleAuthorizations = [
  'J2G4-PREVIEW-APPLY-fdbc70207ed4577129b39c404c9fb4131b2718dc46935d8c0dc12886c22656ba',
  'J2G4-PREVIEW-APPLY-8117c027ca79c74a30c912c7149a10a2fd792270d1ff473f44d80f49ed7b8dcb',
];
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

function deriveAuthorization(record, candidateDigest = record.candidate.digest) {
  const scope = record.deploymentScope;
  const scopeInput = [
    scope.mode,
    scope.themeFileCount,
    candidateDigest,
    `nodelete=${scope.nodeleteRequired}`,
    `remoteDeletionAllowed=${scope.remoteDeletionAllowed}`,
    `productionThemeAllowed=${scope.productionThemeAllowed}`,
  ].join('|');
  const scopeDigest = sha256(scopeInput);
  const bindingInput = [
    record.identity,
    record.target.shopGid,
    record.target.themeGid,
    candidateDigest,
    record.candidate.manifestFileSha256,
    record.rollback.inventorySha256,
    record.themeCheck.completeReportSha256,
    scopeDigest,
  ].join('|');
  return { scopeDigest, authorizationValue: `J2G4-PREVIEW-APPLY-${sha256(bindingInput)}` };
}

const current = deriveAuthorization(exception);
assert.equal(current.scopeDigest, exception.deploymentScope.digest);
assert.equal(current.authorizationValue, exception.binding.authorizationValue);
for (const staleAuthorization of staleAuthorizations) {
  assert.notEqual(staleAuthorization, current.authorizationValue, 'Previous authorization value must be invalidated');
  assert(exception.binding.invalidatedAuthorizationValues.includes(staleAuthorization));
}

const changedCandidate = deriveAuthorization(exception, '0'.repeat(64));
assert.notEqual(changedCandidate.authorizationValue, current.authorizationValue, 'Previous candidate authorization must not authorize a corrected candidate');
assert.equal(exception.deploymentScope.nodeleteRequired, true);
assert.equal(exception.deploymentScope.remoteDeletionAllowed, false);
assert.equal(exception.deploymentScope.productionThemeAllowed, false);
assert(exception.transport.requiredFlags.includes('--nodelete'));

console.log(JSON.stringify({
  passed: 2,
  staleAuthorizationRejected: true,
  changedCandidateAuthorizationRejected: true,
  nodeleteBound: true,
  authorizationValue: current.authorizationValue,
}));

module.exports = { deriveAuthorization };
