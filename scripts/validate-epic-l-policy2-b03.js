'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const {
  READINESS_BLOCKERS,
  SUPPORT_CATEGORIES,
  createB01Foundation,
} = require('./lib/epic-l-policy2');
const { validateAll: validateArchitecture } = require('./validate-epic-l-policy2');

const root = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const progress = readJson('data/epic-l-policy2-b03-progress.json');
const progressSchema = readJson('schemas/epic-l-policy2-b03-progress.schema.json');
const supportContract = readJson('data/epic-l-policy2-support-safety-contract.json');
const coverage = readJson('data/epic-l-policy2-coverage-matrix.json');
const resources = readJson('data/epic-l-policy2-resource-governance.json');
const backlog = readJson('data/epic-l-policy2-pbi-backlog.json');
const b01 = readJson('data/epic-l-policy2-b01-progress.json');
const b02 = readJson('data/epic-l-policy2-b02-progress.json');
const source = fs.readFileSync(path.join(root, 'scripts/lib/epic-l-policy2/support-intake.js'), 'utf8');

const ajv = new Ajv2020({ allErrors: true, strict: false });
const validate = ajv.compile(progressSchema);
if (!validate(progress)) throw new Error(`B03 progress schema failed: ${ajv.errorsText(validate.errors, { separator: '\n' })}`);

const checks = [];
function check(name, condition) {
  if (!condition) throw new Error(`B03 validation failed: ${name}`);
  checks.push(name);
}

const architectureBlockerCodes = validateArchitecture().readinessBlockers.map((blocker) => blocker.code);
const foundation = createB01Foundation({ rootDir: root });
const b03Backlog = backlog.engineeringBatches.find((batch) => batch.batchId === 'EPIC-L-POLICY2-B03');
const routeCategories = supportContract.routes.map((route) => route.category);
const progressRow = progress.pbiProgress[0];

check('progress receipt schema', true);
check('L-PBI-008 progress is engineering-only', progressRow.pbiId === 'L-PBI-008' && progressRow.engineeringComponentImplemented && progressRow.testsPassing && !progressRow.productionProcessorApproved && !progressRow.securityReviewApproved && !progressRow.realStaffRoutesApproved && !progressRow.publishedHoursApproved && !progressRow.notificationProviderApproved && !progressRow.customerCopyApproved && !progressRow.operationalOwnerApproval && !progressRow.legalApproval && !progressRow.customerActivationPermitted);
check('backlog records B03 without incidental completion of adjacent PBIs', b03Backlog && JSON.stringify(b03Backlog.pbiIds) === JSON.stringify(['L-PBI-008']) && b03Backlog.testsPassing && !b03Backlog.productionInfrastructureSelected && !b03Backlog.securityReviewComplete && !b03Backlog.customerActivationPermitted);
check('support categories match the committed contract', JSON.stringify(SUPPORT_CATEGORIES) === JSON.stringify(routeCategories) && SUPPORT_CATEGORIES.length === 5);
check('normal staff routes and hours remain unresolved', supportContract.routes.every((route) => route.assignmentStatus === 'UNRESOLVED' && route.primary === null && route.backup === null) && supportContract.hours.status === 'BLOCKED_EXACT_HOURS_UNRESOLVED' && supportContract.hours.continuousMonitoring === false);
check('existing safety contract is reused without a second transition table', supportContract.stateMachine.ordinaryTransitions.length === 23 && supportContract.stateMachine.globalSafetyInterruption.relevantNonterminalStates.length === 10 && !/const\s+(?:SUPPORT_)?(?:STATE_)?TRANSITIONS\s*=|ordinaryTransitions\s*:/i.test(source) && /this\.safety\.(?:createCase|interruptForHazard|ordinaryTransition|authorizedSafetyDisposition)/.test(source));
check('all eight readiness blockers and disabled activation remain exact', JSON.stringify(progress.readinessBlockers) === JSON.stringify(architectureBlockerCodes) && JSON.stringify(READINESS_BLOCKERS) === JSON.stringify(architectureBlockerCodes) && foundation.activationGate.snapshot().customerActivationPermitted === false);
check('coverage and resources remain unauthorized', coverage.activeProductApprovalRegister.length === 78 && coverage.activeProductApprovalRegister.every((row) => row.customerPromiseAuthorized === false) && resources.resourceRegistry.length === 0 && resources.customerReleaseGate.releaseAuthorized === false);
check('B01 and B02 evidence remains synthetic and blocked', b01.customerFacingAuthority === false && b02.customerFacingAuthority === false && b01.readinessBlockers.length === 8 && b02.readinessBlockers.length === 8 && b01.pbiProgress.every((row) => !row.customerActivationPermitted) && b02.pbiProgress.every((row) => !row.customerActivationPermitted));
check('support source has no production network client or automated decision capability', !/require\(["'](?:node:)?(?:http|https|net|tls|child_process)["']\)|\bfetch\s*\(|axios|supabase|admin\.graphql/i.test(source) && /warrantyFinding:\s*'NOT_PERFORMED'/.test(source) && /diagnosticFinding:\s*'NOT_PERFORMED'/.test(source) && /externalSubmissionPerformed:\s*false/.test(source));

console.log(`Epic L Policy 2.0 B03 artifact checks passed: ${checks.length}/${checks.length}`);
console.log('Support routes: 5/5 contract categories; production assignments and exact hours remain unresolved.');
console.log('Coverage: 78/78 Active Products remain unapproved; customer promise authorizations: 0.');
