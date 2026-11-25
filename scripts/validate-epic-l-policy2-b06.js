'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const {
  READINESS_BLOCKERS,
  evaluateBusinessHours,
  migrateRegistrationRecordToV22,
  validateCoverageProjectionAgainstMatrix,
} = require('./lib/epic-l-policy2');

const root = path.resolve(__dirname, '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const readText = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const artifacts = {
  registration: readJson('data/epic-l-policy2-registration-contract.json'),
  support: readJson('data/epic-l-policy2-support-safety-contract.json'),
  warranty: readJson('data/epic-l-policy2-warranty-review-contract.json'),
  projection: readJson('data/epic-l-policy2-coverage-review-31.json'),
  matrix: readJson('data/epic-l-policy2-coverage-matrix.json'),
  progress: readJson('data/epic-l-policy2-b06-progress.json'),
  preserved: readJson('data/epic-l-policy2-b06-preserved-paths.json'),
  backlog: readJson('data/epic-l-policy2-pbi-backlog.json'),
  decision: readJson('data/epic-l-policy2-decision-receipt-r3.json'),
};
const schemaPairs = [
  ['registration', 'schemas/epic-l-policy2-registration.schema.json'],
  ['support', 'schemas/epic-l-policy2-support-safety.schema.json'],
  ['warranty', 'schemas/epic-l-policy2-warranty-review.schema.json'],
  ['projection', 'schemas/epic-l-policy2-coverage-review-31.schema.json'],
  ['progress', 'schemas/epic-l-policy2-b06-progress.schema.json'],
  ['preserved', 'schemas/epic-l-policy2-b06-preserved-paths.schema.json'],
  ['backlog', 'schemas/epic-l-policy2-backlog.schema.json'],
];
const ajv = new Ajv2020({ allErrors: true, strict: false });
for (const [name, schemaPath] of schemaPairs) {
  const validate = ajv.compile(readJson(schemaPath));
  if (!validate(artifacts[name])) throw new Error(`B06 ${name} schema failed: ${ajv.errorsText(validate.errors, { separator: '\n' })}`);
}

const checks = [];
function check(name, condition) {
  if (!condition) throw new Error(`B06 validation failed: ${name}`);
  checks.push(name);
}

check('all B06 and amended contract schemas pass', true);
check('Revision 3 is the accepted business source without customer authority', artifacts.decision.receiptId === 'EPIC-L-POLICY2-OWNER-RECEIPT-R3-2026-11-25' && artifacts.decision.authoritySeparation.businessDirectionAccepted === true && artifacts.decision.authoritySeparation.customerFacingPromiseAuthorized === false);
check('B06 has distinct engineering authorization and preserves the original batch', artifacts.backlog.firstImplementationBatch.allowedPbis.length === 7 && artifacts.backlog.subsequentEngineeringAuthorizations.some((item) => item.authorizationId === 'EPIC-L-POLICY2-B06-AUTHORIZATION-2026-11-25' && item.originalFirstImplementationBatchUnchanged && !item.realCustomerDataAllowed));
check('registration contract is additive 2.2 with stable opaque IDs', artifacts.registration.schemaVersion === '2.2.0' && artifacts.registration.identifier.minimumEntropyBits >= 128 && artifacts.registration.contractMigration.idempotent && artifacts.registration.contractMigration.registrationIdsPreserved && !artifacts.registration.record.serialNumber.duplicateDetectionAuthority);
const migrated = migrateRegistrationRecordToV22({ data: { registrationId: 'reg_validation_00000000000001', serialNumber: 'LEGACY' } });
check('historical registration migration is idempotent and non-destructive', JSON.stringify(migrateRegistrationRecordToV22(migrated)) === JSON.stringify(migrated) && migrated.data.serialNumber === 'LEGACY' && migrated.data.migrationHistory.length === 1);
check('purchase and first-use evidence require review rather than denial', artifacts.registration.record.evidenceCollections.verificationStates.length === 6 && artifacts.registration.eligibility.missingPurchaseEvidenceAutomaticDenial === false && artifacts.registration.eligibility.registrationCompletionProvesWarrantyEligibility === false);
check('support roles are business references with identities still unverified', artifacts.support.responsibilities.length === 9 && artifacts.support.namedStaffContext.assignmentAuthority === 'BUSINESS_ROLES_APPROVED_IDENTITIES_UNVERIFIED' && artifacts.support.responsibilities.every((item) => item.identityBindingStatus !== 'VERIFIED'));
check('business hours are deterministic across Central daylight changes', evaluateBusinessHours('2026-01-05T15:00:00.000Z', artifacts.support).withinSchedule && evaluateBusinessHours('2026-07-06T14:00:00.000Z', artifacts.support).withinSchedule && !evaluateBusinessHours('2026-07-06T22:00:00.000Z', artifacts.support).withinSchedule && artifacts.support.hours.holidayCalendarConfigured === false);
check('resolution reopening and safety authority remain bounded', artifacts.support.stateMachine.resolution.assignedOwnerConfirmationRequired && artifacts.support.stateMachine.reopening.authorityName === 'Kevin' && artifacts.support.stateMachine.reopening.activeSafetyHoldMayBeBypassed === false && artifacts.support.safety.seriousIncident.fallbackMayAuthorizeDisposition === false);
check('manufacturer and Discord boundaries prohibit automatic or durable external handling', artifacts.support.manufacturerEscalation.automaticReferralAllowed === false && artifacts.support.manufacturerEscalation.automaticRefundAllowed === false && artifacts.support.manufacturerEscalation.rhinoCaseOwnershipRetained && artifacts.support.notifications.discord.durableCaseRecord === false && artifacts.support.notifications.discord.directDeliveryImplemented === false);
check('internal warranty intent records one year without issuance authority', artifacts.warranty.schemaVersion === '1.1.0' && artifacts.warranty.internalWarrantyIntent.machineDuration.value === 1 && artifacts.warranty.authorityDimensions.filter((item) => item.status === 'ESTABLISHED_BY_REVISION_3').length === 1 && artifacts.warranty.issuanceGate.operationalDecisionAllowed === false && artifacts.warranty.issuanceGate.customerNotificationAllowed === false);
const projectionResult = validateCoverageProjectionAgainstMatrix(artifacts.projection, artifacts.matrix);
check('exact 31 coverage projection matches current Product and Variant identities', projectionResult.selectedProducts === 31 && projectionResult.uniqueProducts === 31 && artifacts.projection.remainingActiveProductsRequiringEventualApproval === 47);
const worksheet = readText('docs/policy/epic-l-policy2-coverage-review-31-worksheet.md');
check('human worksheet contains every projected Product and plain manufacturer evidence guidance', artifacts.projection.records.every((row) => worksheet.includes(row.productGid)) && worksheet.includes('No separate manufacturer-evidence approver is required'));
check('B06 completion dimensions keep all operational approvals false', artifacts.progress.completionDimensions.engineeringComplete && artifacts.progress.completionDimensions.testsPassing && artifacts.progress.completionDimensions.businessDirectionRecorded && !artifacts.progress.completionDimensions.humanCoverageMappingComplete && !artifacts.progress.completionDimensions.legalClearance && !artifacts.progress.completionDimensions.staffIdentityBinding && !artifacts.progress.completionDimensions.productionProcessorApproval && !artifacts.progress.completionDimensions.operationalActivation);
check('all eight readiness blockers remain exact', JSON.stringify(artifacts.progress.readinessBlockers) === JSON.stringify(READINESS_BLOCKERS) && artifacts.progress.readinessBlockers.length === 8);
check('no activation or customer operation is recorded', Object.values(artifacts.progress.activationEvidence).every((value) => value === false) && artifacts.progress.testEvidence.liveProviderCalls === 0 && artifacts.progress.testEvidence.customerDecisionsIssued === 0 && artifacts.progress.testEvidence.customerNotificationsSent === 0);
const sensitiveSource = ['scripts/lib/epic-l-policy2/registration.js', 'scripts/lib/epic-l-policy2/support-safety.js', 'scripts/lib/epic-l-policy2/support-intake.js'].map(readText).join('\n');
check('amended source has no production network client webhook secret or private address', !/require\(["'](?:node:)?(?:http|https|net|tls|child_process)["']\)|\bfetch\s*\(|axios|discord\.com\/api\/webhooks|@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/i.test(sensitiveSource));
const hashResults = artifacts.preserved.paths.map((entry) => ({
  ...entry,
  actual: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, entry.path))).digest('hex').toUpperCase(),
}));
check('all 39 preserved unrelated paths retain their baseline hashes', hashResults.length === 39 && hashResults.every((entry) => entry.actual === entry.sha256));

console.log(`Epic L Policy 2.0 B06 artifact checks passed: ${checks.length}/${checks.length}`);
console.log('Contracts: registration 2.2.0; support/safety 2.2.0; warranty review 1.1.0.');
console.log('Coverage projection: 31 exact Products; customer promise authorizations: 0.');
console.log('Preserved unrelated paths: 39/39 SHA-256 matches.');
