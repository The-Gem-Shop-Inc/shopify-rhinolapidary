'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const {
  PRIVATE_RECORD_CATEGORIES,
  READINESS_BLOCKERS,
  RESOURCE_CATEGORIES,
  createB01Foundation,
  loadSupportContract,
} = require('./lib/epic-l-policy2');
const { validateAll: validateArchitecture } = require('./validate-epic-l-policy2');

const root = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));

const ajv = new Ajv2020({ allErrors: true, strict: false });
const schema = readJson('schemas/epic-l-policy2-b01-progress.schema.json');
const progress = readJson('data/epic-l-policy2-b01-progress.json');
const validate = ajv.compile(schema);
if (!validate(progress)) {
  throw new Error(`B01 progress schema failed: ${ajv.errorsText(validate.errors, { separator: '\n' })}`);
}

const checks = [];
function check(name, condition) {
  if (!condition) throw new Error(`B01 validation failed: ${name}`);
  checks.push(name);
}

const support = loadSupportContract(root);
const resources = readJson('data/epic-l-policy2-resource-governance.json');
const foundation = createB01Foundation({ rootDir: root });
const architectureBlockerCodes = validateArchitecture().readinessBlockers.map((blocker) => blocker.code);

check('progress receipt schema', true);
check('four exact PBI progress rows', JSON.stringify(progress.pbiProgress.map((row) => row.pbiId).sort()) === JSON.stringify(['L-PBI-006', 'L-PBI-012', 'L-PBI-014', 'L-PBI-016']));
check('all operational and legal gates remain false', progress.pbiProgress.every((row) => !row.productionInfrastructureSelected && !row.securityReviewComplete && !row.operationalOwnerApproval && !row.legalApproval && !row.customerActivationPermitted));
check('eight architecture readiness blockers retained exactly', JSON.stringify(progress.readinessBlockers) === JSON.stringify(architectureBlockerCodes) && JSON.stringify(READINESS_BLOCKERS) === JSON.stringify(architectureBlockerCodes));
check('five private record categories', PRIVATE_RECORD_CATEGORIES.length === 5);
check('resource categories match committed contract', JSON.stringify(RESOURCE_CATEGORIES) === JSON.stringify(resources.categories));
check('support contract transition coverage', support.stateMachine.ordinaryTransitions.length === 23 && support.stateMachine.globalSafetyInterruption.relevantNonterminalStates.length === 10);
check('customer activation gate remains blocked', foundation.activationGate.snapshot().customerActivationPermitted === false);

console.log(`Epic L Policy 2.0 B01 artifact checks passed: ${checks.length}/${checks.length}`);
console.log('PBI progress: engineering foundation only; production, security, owner, legal, and customer activation gates remain false.');
