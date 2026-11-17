'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { validate, MANIFEST_PATH } = require('./validate-j2-g4-phase-c-corrective-release');

const baseline = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const deployment = fs.readFileSync('scripts/deploy-j2-g4-phase-c-preview.ps1', 'utf8');
const clone = () => structuredClone(baseline);
const rejects = (mutate, pattern) => {
  const candidate = clone();
  mutate(candidate);
  assert.match(validate(candidate).join('\n'), pattern);
};

assert.deepEqual(validate(baseline), []);
rejects((value) => { value.candidateDigest = '0'.repeat(64); }, /candidate digest mismatch/i);
rejects((value) => { value.historicalEvidence.phaseBTransport = 'PASS'; }, /reclassified/i);
rejects((value) => { value.authorization.uploadAuthorized = true; }, /cannot authorize an upload/i);
rejects((value) => { value.authorization.phaseBApplyTokenReusable = true; }, /cannot reuse/i);
rejects((value) => { value.target.productionExcluded = false; }, /Production exclusion/i);
rejects((value) => { value.target.requiredPreviewRole = 'MAIN'; }, /identity or role/i);
rejects((value) => { value.runtimeFiles[0].candidateSha256 = 'f'.repeat(64); }, /candidate SHA-256 mismatch/i);
rejects((value) => { value.runtimeFiles.push(structuredClone(value.runtimeFiles[0])); }, /exactly seven/i);
rejects((value) => { value.newDependencies = []; }, /dependency accounting/i);
rejects((value) => { value.rollback.mustUseNewTimestampedArchive = false; }, /rollback requirements/i);

const deploymentErrors = (source) => {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  require(/\[string\]\$Mode = 'Plan'/.test(source), 'Deployment must default to Plan.');
  require(/\$Mode -eq 'Apply'[\s\S]*AuthorizationValue -eq \$transaction\.authorizationValue[\s\S]*AuthorizeStrictOmission\.IsPresent[\s\S]*Invoke-NativeChecked 'shopify' \$transaction\.arguments/.test(source), 'Apply must remain authorization and strict-omission gated.');
  require(/HistoricalPhaseBAuthorization[\s\S]*Consumed Phase B authorization is forbidden/.test(source), 'Consumed Phase B authorization must be rejected.');
  require(/--nodelete/.test(source) && /Forbidden upload flag present/.test(source), 'Selective no-delete transport guard is missing.');
  require(/completeTheme\.fileCount -eq 463/.test(source), 'Complete fresh rollback inventory is required.');
  require(/replacements\.Count -eq 6[\s\S]*additions\.Count -eq 1/.test(source), 'Six replacement and one addition rollback scope is required.');
  require(/exact Phase C readback mismatch/.test(source), 'All seven Phase C files require exact readback.');
  require(/unrelated remote file changed/.test(source) && /unexpected remote file appeared/.test(source), 'Unrelated asset preservation is required.');
  require(/semantic exception is not needed[\s\S]*was not broadened/.test(source), 'JSON exceptions must not broaden to this non-JSON release.');
  require(/No automatic rollback was executed/.test(source), 'Readback must not trigger automatic rollback.');
  for (const path of baseline.runtimeFiles.map((entry) => entry.path)) require(source.includes(`'${path}'`), `${path}: missing upload allowlist entry.`);
  return errors;
};
assert.deepEqual(deploymentErrors(deployment), []);
const deploymentRejects = (transform, pattern) => assert.match(deploymentErrors(transform(deployment)).join('\n'), pattern);
deploymentRejects((source) => source.replace("[string]$Mode = 'Plan'", "[string]$Mode = 'Apply'"), /default to Plan/i);
deploymentRejects((source) => source.replace("Assert-Gate ($AuthorizeStrictOmission.IsPresent)", "Assert-Gate ($true)"), /strict-omission gated/i);
deploymentRejects((source) => source.replace('completeTheme.fileCount -eq 463', 'completeTheme.fileCount -gt 0'), /complete fresh rollback/i);
deploymentRejects((source) => source.replace('exact Phase C readback mismatch', 'semantic Phase C readback mismatch'), /exact readback/i);
deploymentRejects((source) => source.replace('unexpected remote file appeared', 'unexpected file ignored'), /Unrelated asset preservation/i);

console.log('J2/G4 Phase C corrective release negative tests passed: 15/15 plus deployment Plan contract.');
