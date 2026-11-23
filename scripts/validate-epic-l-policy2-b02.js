'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const {
  READINESS_BLOCKERS,
  REGISTRATION_STATES,
  REGISTRATION_TRANSITIONS,
  createB01Foundation,
} = require('./lib/epic-l-policy2');
const { validateAll: validateArchitecture } = require('./validate-epic-l-policy2');

const root = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const progress = readJson('data/epic-l-policy2-b02-progress.json');
const progressSchema = readJson('schemas/epic-l-policy2-b02-progress.schema.json');
const registrationContract = readJson('data/epic-l-policy2-registration-contract.json');
const coverage = readJson('data/epic-l-policy2-coverage-matrix.json');
const resources = readJson('data/epic-l-policy2-resource-governance.json');
const backlog = readJson('data/epic-l-policy2-pbi-backlog.json');
const source = fs.readFileSync(path.join(root, 'scripts/lib/epic-l-policy2/registration.js'), 'utf8');

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(progressSchema);
if (!validate(progress)) throw new Error(`B02 progress schema failed: ${ajv.errorsText(validate.errors, { separator: '\n' })}`);

const checks = [];
function check(name, condition) {
  if (!condition) throw new Error(`B02 validation failed: ${name}`);
  checks.push(name);
}

const architectureBlockerCodes = validateArchitecture().readinessBlockers.map((blocker) => blocker.code);
const foundation = createB01Foundation({ rootDir: root });
const b02Backlog = backlog.engineeringBatches.find((batch) => batch.batchId === 'EPIC-L-POLICY2-B02');

check('progress receipt schema', true);
check('L-PBI-004 and L-PBI-005 engineering-only progress', JSON.stringify(progress.pbiProgress.map((row) => row.pbiId).sort()) === JSON.stringify(['L-PBI-004', 'L-PBI-005']) && progress.pbiProgress.every((row) => row.engineeringComponentImplemented && row.testsPassing && !row.productionInfrastructureSelected && !row.securityReviewComplete && !row.operationalOwnerApproval && !row.legalApproval && !row.customerActivationPermitted));
check('backlog records B02 without operational completion', b02Backlog && b02Backlog.testsPassing && !b02Backlog.productionInfrastructureSelected && !b02Backlog.customerActivationPermitted);
check('registration contract migration is exact and non-business', registrationContract.schemaVersion === '2.1.0' && registrationContract.contractMigration.fromVersion === '2.0.0' && registrationContract.contractMigration.toVersion === '2.1.0' && registrationContract.contractMigration.businessIntentChanged === false);
check('identifier contract requires 128 random bits without UUIDv4', registrationContract.identifier.minimumEntropyBits >= 128 && registrationContract.identifier.minimumRandomBytes >= 16 && registrationContract.identifier.uuidV4SatisfiesMinimumEntropy === false && !registrationContract.identifier.format.includes('UUID'));
check('registration lifecycle matches contract with explicit transitions', JSON.stringify(REGISTRATION_STATES) === JSON.stringify(registrationContract.states) && REGISTRATION_TRANSITIONS.length === 22 && new Set(REGISTRATION_TRANSITIONS.map((transition) => transition.join('->'))).size === 22);
check('eight architecture blockers and disabled activation gate remain exact', JSON.stringify(progress.readinessBlockers) === JSON.stringify(architectureBlockerCodes) && JSON.stringify(READINESS_BLOCKERS) === JSON.stringify(architectureBlockerCodes) && foundation.activationGate.snapshot().customerActivationPermitted === false);
check('coverage remains independent and unapproved', coverage.activeProductApprovalRegister.length === 78 && coverage.activeProductApprovalRegister.every((row) => row.customerPromiseAuthorized === false));
check('approved resource registry remains empty', resources.resourceRegistry.length === 0 && resources.customerReleaseGate.releaseAuthorized === false);
check('registration source has no production network client or eligibility promise', !/require\(["'](?:node:)?(?:http|https|net|tls|child_process)["']\)|\bfetch\s*\(|axios|@shopify|supabase/i.test(source) && !/warrantyEligibility\s*:\s*\{[^}]*determined\s*:\s*true/s.test(source));

console.log(`Epic L Policy 2.0 B02 artifact checks passed: ${checks.length}/${checks.length}`);
console.log('Registration contract: 2.1.0; identifier format: CSPRNG base64url with at least 16 random bytes.');
console.log('Coverage: 78/78 Active Products remain unapproved; customer promise authorizations: 0.');
