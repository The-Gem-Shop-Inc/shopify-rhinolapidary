'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = path.resolve(__dirname, '..');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function sha256(relativePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, relativePath))).digest('hex').toUpperCase();
}

function validateSchema(dataPath, schemaPath) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(readJson(schemaPath));
  const valid = validate(readJson(dataPath));
  assert.equal(valid, true, `${dataPath} schema failed:\n${ajv.errorsText(validate.errors, { separator: '\n' })}`);
}

const checks = [];
function check(name, condition) {
  assert.ok(condition, `Revision 3 validation failed: ${name}`);
  checks.push(name);
}

validateSchema('data/epic-l-policy2-decision-receipt-r3.json', 'schemas/epic-l-policy2-decision-receipt-r3.schema.json');
validateSchema('data/epic-l-policy2-next-engineering-backlog-r3.json', 'schemas/epic-l-policy2-next-engineering-backlog-r3.schema.json');

const receipt = readJson('data/epic-l-policy2-decision-receipt-r3.json');
const nextBacklog = readJson('data/epic-l-policy2-next-engineering-backlog-r3.json');
const priorReceipt = readJson('data/epic-l-policy2-decision-receipt.json');
const coverage = readJson('data/epic-l-policy2-coverage-matrix.json');
const snapshot = readJson('data/epic-l-policy2-shopify-product-snapshot-2026-11-23.json');
const resourceQueue = readJson('data/epic-l-policy2-resource-approval-queue.json');
const b05 = readJson('data/epic-l-policy2-b05-progress.json');
const existingBacklog = readJson('data/epic-l-policy2-pbi-backlog.json');
const registration = readJson('data/epic-l-policy2-registration-contract.json');
const support = readJson('data/epic-l-policy2-support-safety-contract.json');

check('completed packet hash is exact', sha256(receipt.source.repositoryPath) === receipt.source.sha256);
check('prior November receipt remains the preserved 2.1.0 record', priorReceipt.schemaVersion === '2.1.0' && sha256('data/epic-l-policy2-decision-receipt.json') === 'E56CE33817AB4965705B46FE62B50D689823DBA2D519A7BD1989F00EF48099E7');
check('B01/B02 historical contracts are unchanged in this batch', sha256('data/epic-l-policy2-registration-contract.json') === '87155A608F1E442B7DE0A61FCFB11EE1F62633E9594C4B553867A0551EC398C8' && sha256('data/epic-l-policy2-support-safety-contract.json') === 'AF25105C9084491F9D832B335E8245FC3D9550CBD016E5C94F88CDD9D71939EC');

const expectedAreas = Array.from({ length: 10 }, (_, index) => `OPEN-${String(index + 1).padStart(2, '0')}`);
const actualAreas = receipt.decisionAreas.map((area) => area.areaId).sort();
check('receipt contains exactly OPEN-01 through OPEN-10', JSON.stringify(actualAreas) === JSON.stringify(expectedAreas));
check('owner direction never grants a customer promise', receipt.decisionAreas.every((area) => area.customerFacingPromiseAuthorized === false));
check('authority dimensions keep implementation and publication gated', receipt.authoritySeparation.businessDirectionAccepted === true && receipt.authoritySeparation.shopifyCapabilityProven === false && receipt.authoritySeparation.operationalReadiness === false && receipt.authoritySeparation.customerFacingPromiseAuthorized === false && receipt.authoritySeparation.publicationAuthorized === false);
check('no signature or redundant approval form is introduced', receipt.formalApprovalOverride.signatureRequired === false && receipt.formalApprovalOverride.redundantApprovalFormRequired === false);

const restrictedConfig = JSON.stringify({ receipt, nextBacklog });
check('machine-readable reconciliation contains no email address or webhook credential', !/@|discord(?:app)?\.com\/api\/webhooks|webhook[_-]?url|gmail\.com/i.test(restrictedConfig));

check('catalog counts remain 122 Products and 125 Variants', snapshot.counts.products === 122 && snapshot.counts.variants === 125 && snapshot.counts.byStatus.ACTIVE === 78 && snapshot.counts.byStatus.DRAFT === 44);
check('coverage matrix preserves exact catalog accounting', coverage.currentAudit.products === 122 && coverage.currentAudit.variants === 125 && coverage.currentAudit.activeProducts === 78 && coverage.currentAudit.draftProducts === 44);
const unresolved = coverage.activeProductApprovalRegister.filter((row) => row.coverageProposal?.disposition === 'HUMAN_REVIEW_REQUIRED');
check('first coverage review set is exactly 31 Products', unresolved.length === 31 && coverage.currentAudit.tentativeDispositionCounts.HUMAN_REVIEW_REQUIRED === 31);
check('31-Product review preserves exact Product and Variant GIDs', unresolved.every((row) => /^gid:\/\/shopify\/Product\/\d+$/.test(row.productGid) && row.variantGids.length > 0 && row.variantGids.every((gid) => /^gid:\/\/shopify\/ProductVariant\/\d+$/.test(gid))));
check('no Product acquired customer coverage authorization', coverage.currentAudit.customerPromiseAuthorizedProducts === 0 && coverage.activeProductApprovalRegister.every((row) => row.customerPromiseAuthorized === false));

check('B05 completion record is present and synthetic-only', b05.status === 'ENGINEERING_TECHNICAL_GUIDANCE_IMPLEMENTED_SYNTHETIC_ONLY' && b05.mode === 'PRIVATE_SYNTHETIC_DATA_ONLY' && b05.customerFacingAuthority === false && b05.testEvidence.liveProviderCalls === 0 && b05.testEvidence.resourcePublications === 0);
check('B05 queue remains nine candidates and zero releases', resourceQueue.counts.candidates === 9 && resourceQueue.counts.approvedRevisions === 0 && resourceQueue.counts.customerReleaseAuthorizations === 0 && resourceQueue.releaseAuthorized === false);

check('obsolete physical serial assumption is explicitly preserved for additive migration', registration.record.serialNumber?.sameAsRegistrationId === false && registration.duplicateHandling.keyCandidates.includes('verified serial number') && nextBacklog.items.find((item) => item.itemId === 'R3-001')?.acceptanceEvidence.some((line) => /legacyPhysicalSerialEvidence/.test(line)));
check('recommended B06 is synthetic and non-mutating', nextBacklog.recommendedNextBatch.batchId === 'EPIC-L-POLICY2-B06' && nextBacklog.recommendedNextBatch.realCustomerDataAllowed === false && nextBacklog.recommendedNextBatch.shopifyMutationAllowed === false && nextBacklog.recommendedNextBatch.publicationAllowed === false);
check('B06 includes additive registration, support, warranty, and exact coverage work', ['R3-001', 'R3-002', 'R3-003', 'R3-004'].every((id) => nextBacklog.recommendedNextBatch.itemIds.includes(id)));

check('existing activation gate remains blocked', existingBacklog.activationGate.status === 'BLOCKED');
check('existing eight readiness blockers remain represented in B05', b05.readinessBlockers.length === 8 && b05.readinessBlockers.includes('M1_ACTIVATION_BLOCKED'));
check('support safety hold remains private guarded architecture', support.stateMachine.states.includes('SAFETY_HOLD') && support.stateMachine.safetyHoldExit.authorizationRequired === true && support.stateMachine.safetyHoldExit.directResolutionOrClosureAllowed === false);
check('manufacturer handoff retains Rhino responsibility', support.manufacturerEscalation.rhinoCaseOwnershipRetained === true && support.manufacturerEscalation.rhinoCommunicationResponsibilityRetained === true && support.manufacturerEscalation.caseMayCloseOnReferralAlone === false);

const requiredDocs = [
  'docs/project/epic-l-policy2-decision-reconciliation-r3.md',
  'docs/project/epic-l-policy2-dependency-readiness-r3.md',
  'docs/architecture/epic-l-policy2-shopify-native-feasibility-r3.md',
  'docs/architecture/epic-l-policy2-resource-administration-r3.md'
];
check('all Revision 3 reports exist and are nonempty', requiredDocs.every((file) => read(file).length > 1000));

console.log(`Epic L Policy 2.0 Revision 3 reconciliation checks passed: ${checks.length}/${checks.length}`);
