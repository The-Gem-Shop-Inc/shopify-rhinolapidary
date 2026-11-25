'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const {
  PRIVATE_RECORD_CATEGORIES,
  READINESS_BLOCKERS,
  UnresolvedWarrantyAuthorityResolver,
  createB01Foundation,
} = require('./lib/epic-l-policy2');
const { validateAll: validateArchitecture } = require('./validate-epic-l-policy2');

const root = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const contract = readJson('data/epic-l-policy2-warranty-review-contract.json');
const contractSchema = readJson('schemas/epic-l-policy2-warranty-review.schema.json');
const progress = readJson('data/epic-l-policy2-b04-progress.json');
const progressSchema = readJson('schemas/epic-l-policy2-b04-progress.schema.json');
const backlog = readJson('data/epic-l-policy2-pbi-backlog.json');
const decisions = readJson('data/epic-l-policy2-decision-receipt.json');
const coverage = readJson('data/epic-l-policy2-coverage-matrix.json');
const support = readJson('data/epic-l-policy2-support-safety-contract.json');
const b01 = readJson('data/epic-l-policy2-b01-progress.json');
const b02 = readJson('data/epic-l-policy2-b02-progress.json');
const b03 = readJson('data/epic-l-policy2-b03-progress.json');
const source = fs.readFileSync(path.join(root, 'scripts/lib/epic-l-policy2/warranty-review.js'), 'utf8');

const ajv = new Ajv2020({ allErrors: true, strict: false });
for (const [name, schema, artifact] of [['contract', contractSchema, contract], ['progress', progressSchema, progress]]) {
  const validate = ajv.compile(schema);
  if (!validate(artifact)) throw new Error(`B04 ${name} schema failed: ${ajv.errorsText(validate.errors, { separator: '\n' })}`);
}

const checks = [];
function check(name, condition) {
  if (!condition) throw new Error(`B04 validation failed: ${name}`);
  checks.push(name);
}

const architectureBlockers = validateArchitecture().readinessBlockers.map((blocker) => blocker.code);
const foundation = createB01Foundation({ rootDir: root });
const b04Batch = backlog.engineeringBatches.find((batch) => batch.batchId === 'EPIC-L-POLICY2-B04');
const b04Authorization = backlog.subsequentEngineeringAuthorizations.find((authorization) => authorization.batchId === 'EPIC-L-POLICY2-B04');
const pbi = progress.pbiProgress[0];
const roleMap = new Map(contract.authorityRoles.map((role) => [role.role, role]));

check('versioned authority contract and progress receipt schemas', contract.schemaVersion === '1.1.0' && contract.internalWarrantyIntent.status === 'BUSINESS_INTENT_RECORDED_NOT_CUSTOMER_POLICY' && progress.schemaVersion === '1.0.0');
check('original B01-B03 authorization remains historical and B04 is separately scoped', JSON.stringify(backlog.firstImplementationBatch.allowedPbis) === JSON.stringify(['L-PBI-004', 'L-PBI-005', 'L-PBI-006', 'L-PBI-008', 'L-PBI-012', 'L-PBI-014', 'L-PBI-016']) && !backlog.firstImplementationBatch.allowedPbis.includes('L-PBI-013') && b04Authorization.authorizationId === contract.engineeringAuthorization.authorizationId && JSON.stringify(b04Authorization.authorizedPbis) === JSON.stringify(['L-PBI-013']) && b04Authorization.originalFirstImplementationBatchUnchanged === true);
check('L-PBI-013 progress is synthetic engineering only', b04Batch && JSON.stringify(b04Batch.pbiIds) === JSON.stringify(['L-PBI-013']) && b04Batch.testsPassing && !b04Batch.productionInfrastructureSelected && !b04Batch.securityReviewComplete && !b04Batch.operationalOwnerApproval && !b04Batch.legalApproval && !b04Batch.customerActivationPermitted && pbi.engineeringComponentImplemented && pbi.testsPassing && !pbi.realHumanAuthorityApproved && !pbi.policyApplicabilityApproved && !pbi.coverageApprovalComplete && !pbi.customerDecisionIssuancePermitted && !pbi.customerNotificationPermitted);
check('nine authority roles remain distinct with no issuance role', contract.authorityRoles.length === 9 && roleMap.get('EVIDENCE_PREPARER').mayPrepareEvidence === true && roleMap.get('EVIDENCE_PREPARER').mayRecordAssessment === false && roleMap.get('HUMAN_WARRANTY_REVIEWER').mayRecordAssessment === true && contract.authorityRoles.every((role) => role.mayIssueDecision === false));
check('normal authority resolution denies and test mode cannot issue', foundation.warrantyReview.authorityResolver instanceof UnresolvedWarrantyAuthorityResolver && foundation.warrantyReview.authorityResolver.inspect({ reviewerIdentityReference: 'auth_syn_unresolved_0001', authorityRole: 'HUMAN_WARRANTY_REVIEWER', authorityScope: 'SYNTHETIC_SCOPE', at: '2026-11-23T00:00:00.000Z' }).status === 'UNRESOLVED' && foundation.warrantyReview.issuanceGateSnapshot().testModeMayBypass === false && !foundation.warrantyReview.issuanceGateSnapshot().operationalDecisionAllowed);
check('review lifecycle is explicit and unique', contract.reviewStates.length === 11 && contract.transitions.length === 47 && new Set(contract.transitions.map((transition) => transition.join('->'))).size === 47 && contract.terminalStates.length === 1);
check('policy provenance, applicability, and customer language remain unresolved', decisions.policyVersionControl.lifecycleStatus === 'DRAFT' && decisions.policyVersionControl.applicableFrom === null && decisions.policyVersionControl.applicableTo === null && decisions.policyVersionControl.applicabilityApproval === 'NOT_APPROVED' && decisions.policyVersionControl.customerCopyReleaseAuthorized === false && decisions.decisions.every((decision) => decision.customerFacingLegalApproval.releaseAuthorized === false));
check('coverage remains evidence only with zero promises', coverage.activeProductApprovalRegister.length === 78 && coverage.activeProductApprovalRegister.every((row) => row.customerPromiseAuthorized === false && row.businessApproval.status !== 'APPROVED' && row.legalApproval.status !== 'APPROVED'));
check('B03 and B01 safety boundaries are reused', support.stateMachine.globalSafetyInterruption.relevantNonterminalStates.length === 10 && contract.supportIntegration.safetyHoldBypassAllowed === false && contract.supportIntegration.supportCaseMutationAllowed === false && /this\.supportIntake\.getPrivateCase/.test(source) && !/ordinaryTransitions\s*:|globalSafetyInterruption\s*:/.test(source));
check('approval evidence is private and operational issuance is absent', PRIVATE_RECORD_CATEGORIES.includes('APPROVAL_EVIDENCE') && /category:\s*'APPROVAL_EVIDENCE'/.test(source) && /OPERATIONAL_WARRANTY_DECISION_BLOCKED/.test(source) && /CUSTOMER_WARRANTY_NOTIFICATION_BLOCKED/.test(source) && !/notifications\.queue|notifications\.attempt/.test(source));
check('all eight readiness blockers remain exact across batches', JSON.stringify(progress.readinessBlockers) === JSON.stringify(architectureBlockers) && JSON.stringify(READINESS_BLOCKERS) === JSON.stringify(architectureBlockers) && [b01, b02, b03].every((receipt) => JSON.stringify(receipt.readinessBlockers) === JSON.stringify(architectureBlockers)));
check('source has no production network, automated warranty outcome, or remedy execution', !/require\(["'](?:node:)?(?:http|https|net|tls|child_process)["']\)|\bfetch\s*\(|axios|supabase|admin\.graphql/i.test(source) && !/refund|replacementOrder|issuePayment|WARRANTY_APPROVED|WARRANTY_DENIED/.test(source));

console.log(`Epic L Policy 2.0 B04 artifact checks passed: ${checks.length}/${checks.length}`);
console.log('Authority: normal resolver UNRESOLVED_DENY; synthetic grants require test mode; customer issuance has no permitted path.');
console.log('Coverage: 78/78 Active Products remain under human review; customer promise authorizations: 0.');
