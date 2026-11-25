'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  SyntheticNotificationTransport,
  createB01Foundation,
  createOutOfHoursAcknowledgementIntent,
  evaluateBusinessHours,
  migrateRegistrationRecordToV22,
  validateCoverageProjectionAgainstMatrix,
} = require('./lib/epic-l-policy2');

const root = path.resolve(__dirname, '..');
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const PRODUCT_GID = 'gid://shopify/Product/8905778888901';
const VARIANT_GID = 'gid://shopify/ProductVariant/46484252754117';
const CUSTOMER = 'cus_synthetic_b06_customer_001';
let sequence = 0;
let negativeCount = 0;
const tests = [];

function test(name, fn) { tests.push({ name, fn }); }
function deterministicFactory(prefix) { let value = 0; return () => `${prefix}${String(++value).padStart(24, '0')}`; }
function expectCode(fn, code) {
  negativeCount += 1;
  assert.throws(fn, (error) => error?.code === code, `Expected ${code}`);
}
function makeFoundation() {
  const privatePermissions = ['PRIVATE_RECORD_CREATE', 'PRIVATE_RECORD_READ', 'PRIVATE_RECORD_UPDATE', 'PRIVATE_AUDIT_READ'];
  const systemActor = {
    actorId: 'B06_SYNTHETIC_SYSTEM',
    permissions: [...privatePermissions, 'NOTIFICATION_QUEUE', 'NOTIFICATION_ATTEMPT', 'NOTIFICATION_RECOVERY', 'NOTIFICATION_RECONCILE', 'SUPPORT_CASE_CREATE', 'SAFETY_INTERRUPT', 'SAFETY_DISPOSITION', 'SUPPORT_CASE_ASSIGN_OWNER', 'SUPPORT_CASE_REOPEN'],
  };
  return createB01Foundation({
    rootDir: root,
    testMode: true,
    catalogEntries: [{ productGid: PRODUCT_GID, variantGid: VARIANT_GID }],
    transport: new SyntheticNotificationTransport(),
    clock: (() => { let tick = 0; return () => new Date(Date.UTC(2026, 10, 25, 15, 0, tick++)).toISOString(); })(),
    identifiers: {
      recordId: deterministicFactory('rec_'), publicReference: deterministicFactory('ref_'), auditId: deterministicFactory('aud_'),
      notificationId: deterministicFactory('ntf_'), attemptId: deterministicFactory('att_'), resourceId: deterministicFactory('res_'),
      revisionId: deterministicFactory('rev_'), resourceAuditId: deterministicFactory('raud_'), domainEventId: deterministicFactory('evt_'),
      registrationId: deterministicFactory('reg_'), acknowledgementEventId: deterministicFactory('ack_'), duplicateReviewId: deterministicFactory('dup_'),
      supportCaseReference: deterministicFactory('case_'), supportAcknowledgementEventId: deterministicFactory('sack_'), supportRoutingAttemptId: deterministicFactory('routeatt_'),
      warrantyReviewId: deterministicFactory('wreview_'), warrantyAssessmentId: deterministicFactory('wassess_'), guidanceId: deterministicFactory('guide_'), guidanceSelectionId: deterministicFactory('gsel_'),
    },
    systemActor,
  });
}
const customer = { actorId: 'SYNTHETIC_B06_CUSTOMER', customerReference: CUSTOMER, permissions: ['REGISTRATION_CREATE', 'REGISTRATION_READ_OWN'] };
const operator = { actorId: 'SYNTHETIC_B06_OPERATOR', permissions: ['REGISTRATION_PRIVATE_READ', 'REGISTRATION_EVIDENCE_REVIEW'] };
function registrationInput(overrides = {}) {
  return {
    customerReference: CUSTOMER,
    notificationDestinationReference: 'dst_synthetic_b06_destination_001',
    productGid: PRODUCT_GID,
    variantGid: VARIANT_GID,
    productVersion: 'MACHINE-V1',
    policyVersion: 'POLICY2_BUSINESS_INTENT_NOT_EFFECTIVE',
    firstUseDeclaration: { state: 'UNKNOWN' },
    ...overrides,
  };
}
function createRegistration(foundation, overrides = {}) {
  sequence += 1;
  return foundation.registration.createRegistration({ actor: customer, commandId: `b06-registration-${sequence}`, input: registrationInput(overrides) }).registration;
}

test('registration succeeds without physical serial and requires evidence review', () => {
  const record = createRegistration(makeFoundation());
  assert.equal(record.data.serialNumber, null);
  assert.equal(record.data.legacyPhysicalSerialEvidence, null);
  assert.equal(record.data.purchaseEvidenceAssessment.status, 'EXCEPTION_REVIEW_REQUIRED');
  assert.equal(record.data.warrantyEligibility.automaticDenial, false);
});

test('one customer may own multiple distinct machine records', () => {
  const f = makeFoundation();
  const first = createRegistration(f);
  const second = createRegistration(f);
  assert.notEqual(first.data.registrationId, second.data.registrationId);
  assert.equal(second.state, 'IDENTITY_VERIFICATION_REQUIRED');
});

test('shared purchase evidence does not conflate separate machine registrations', () => {
  const evidence = { evidenceId: 'purchase-po-1', source: 'THE_GEM_SHOP_PURCHASE_ORDER', verificationStatus: 'SUPPLIED', evidenceReference: 'synthetic:purchase:po:1' };
  const f = makeFoundation();
  const first = createRegistration(f, { purchaseEvidence: [evidence] });
  const second = createRegistration(f, { purchaseEvidence: [evidence] });
  assert.notEqual(first.data.registrationId, second.data.registrationId);
  assert.equal(second.data.duplicateInvestigation, null);
});

test('historical B02 record migration is additive and idempotent', () => {
  const historical = { data: { registrationId: 'reg_historical_0000000000000001', serialNumber: 'LEGACY-1', productGid: PRODUCT_GID, variantGid: VARIANT_GID } };
  const migrated = migrateRegistrationRecordToV22(historical);
  const repeated = migrateRegistrationRecordToV22(migrated);
  assert.deepEqual(repeated, migrated);
  assert.equal(migrated.data.registrationId, historical.data.registrationId);
  assert.equal(migrated.data.serialNumber, 'LEGACY-1');
  assert.equal(migrated.data.migrationHistory.length, 1);
});

test('remote inspection first-use evidence requires explicit inspection identity and reviewer', () => {
  const f = makeFoundation();
  expectCode(() => createRegistration(f, { firstUseEvidence: [{ evidenceId: 'inspection-bad', source: 'REMOTE_INSPECTION', verificationStatus: 'SUPPLIED', evidenceReference: 'synthetic:inspection:bad' }] }), 'REMOTE_INSPECTION_EVIDENCE_REQUIRED');
  const record = createRegistration(f, { firstUseEvidence: [{ evidenceId: 'inspection-1', source: 'REMOTE_INSPECTION', verificationStatus: 'PENDING_VERIFICATION', evidenceReference: 'synthetic:inspection:1', inspectionId: 'inspection-synthetic-1', inspectionDate: '2026-11-20', reviewerReference: 'staff_syn_kevin_0001' }] });
  assert.equal(record.data.firstUseEvidence[0].inspectionId, 'inspection-synthetic-1');
  assert.notEqual(record.data.registeredAt.slice(0, 10), record.data.firstUseEvidence[0].inspectionDate);
});

test('accepted evidence requires authorized reviewer details and customers cannot forge it', () => {
  const f = makeFoundation();
  const record = createRegistration(f);
  const evidence = { evidenceId: 'purchase-accepted-1', source: 'THE_GEM_SHOP_PURCHASE_ORDER', verificationStatus: 'ACCEPTED_BY_AUTHORIZED_REVIEW', evidenceReference: 'synthetic:purchase:accepted', reviewedBy: 'staff_syn_avery_0001', reviewedAt: '2026-11-25T15:00:00.000Z' };
  expectCode(() => f.registration.recordEvidence({ actor: customer, commandId: 'forge-evidence', registrationId: record.data.registrationId, expectedVersion: record.version, collection: 'purchaseEvidence', evidence }), 'AUTHORIZATION_REQUIRED');
  const updated = f.registration.recordEvidence({ actor: operator, commandId: 'accept-evidence', registrationId: record.data.registrationId, expectedVersion: record.version, collection: 'purchaseEvidence', evidence });
  assert.equal(updated.data.purchaseEvidenceAssessment.status, 'ACCEPTED_BY_AUTHORIZED_REVIEW');
  assert.equal(updated.data.warrantyEligibility.determined, false);
});

test('business hours evaluator handles standard and daylight time deterministically', () => {
  const contract = readJson('data/epic-l-policy2-support-safety-contract.json');
  assert.equal(evaluateBusinessHours('2026-01-05T15:00:00.000Z', contract).withinSchedule, true);
  assert.equal(evaluateBusinessHours('2026-07-06T14:00:00.000Z', contract).withinSchedule, true);
  assert.equal(evaluateBusinessHours('2026-07-06T22:00:00.000Z', contract).withinSchedule, false);
  assert.equal(evaluateBusinessHours('2026-07-04T16:00:00.000Z', contract).withinSchedule, false);
  assert.equal(evaluateBusinessHours('2026-07-03T16:00:00.000Z', contract).holidayApplied, false);
});

test('outside-hours result creates intent only with no response guarantee or send', () => {
  const contract = readJson('data/epic-l-policy2-support-safety-contract.json');
  const intent = createOutOfHoursAcknowledgementIntent('2026-07-06T22:00:00.000Z', contract);
  assert.equal(intent.externalMessageSent, false);
  assert.equal(intent.responseTimeGuaranteed, false);
  assert.equal(intent.customerWordingApproved, false);
  assert.equal(createOutOfHoursAcknowledgementIntent('2026-07-06T14:00:00.000Z', contract), null);
});

test('assigned owner may resolve after confirmation while unauthorized owner fails', () => {
  const f = makeFoundation();
  const staffBase = ['PRIVATE_RECORD_CREATE', 'PRIVATE_RECORD_READ', 'PRIVATE_RECORD_UPDATE', 'PRIVATE_AUDIT_READ'];
  const assigner = { actorId: 'SYNTHETIC_ASSIGNER', permissions: [...staffBase, 'SUPPORT_CASE_CREATE', 'SUPPORT_CASE_ASSIGN_OWNER'] };
  const created = f.safety.createCase({ actor: assigner, commandId: 'case-owner', destinationReference: 'dst_synthetic_case_owner_001', initialState: 'GUIDANCE_ACTIVE' });
  const assigned = f.safety.assignCaseOwner({ actor: assigner, commandId: 'assign-owner', caseRecordId: created.recordId, expectedVersion: created.version, ownerReference: 'staff_syn_owner_0001', assignmentEvidenceReference: 'synthetic:assignment:1' });
  expectCode(() => f.safety.ordinaryTransition({ actor: { actorId: 'WRONG_OWNER', permissions: staffBase }, commandId: 'resolve-wrong', caseRecordId: created.recordId, expectedVersion: assigned.version, toState: 'RESOLVED', authorityProof: { action: 'CONFIRM_RESOLUTION', verified: true, actorId: 'WRONG_OWNER', ownerReference: 'staff_syn_owner_0002', evidenceReference: 'synthetic:resolution:bad' } }), 'ASSIGNED_OWNER_RESOLUTION_REQUIRED');
  const resolved = f.safety.ordinaryTransition({ actor: { actorId: 'SYNTHETIC_OWNER_ACTOR', permissions: staffBase }, commandId: 'resolve-owner', caseRecordId: created.recordId, expectedVersion: assigned.version, toState: 'RESOLVED', authorityProof: { action: 'CONFIRM_RESOLUTION', verified: true, actorId: 'SYNTHETIC_OWNER_ACTOR', ownerReference: 'staff_syn_owner_0001', evidenceReference: 'synthetic:resolution:1' } });
  assert.equal(resolved.state, 'RESOLVED');
});

test('Kevin verified boundary reopens and preserves the original event history', () => {
  const f = makeFoundation();
  const permissions = ['PRIVATE_RECORD_CREATE', 'PRIVATE_RECORD_READ', 'PRIVATE_RECORD_UPDATE', 'PRIVATE_AUDIT_READ', 'SUPPORT_CASE_CREATE', 'SUPPORT_CASE_ASSIGN_OWNER', 'SUPPORT_CASE_REOPEN'];
  const actor = { actorId: 'SYNTHETIC_KEVIN', permissions };
  let record = f.safety.createCase({ actor, commandId: 'reopen-case', destinationReference: 'dst_synthetic_reopen_case_001', initialState: 'GUIDANCE_ACTIVE' });
  record = f.safety.assignCaseOwner({ actor, commandId: 'reopen-assign', caseRecordId: record.recordId, expectedVersion: record.version, ownerReference: 'staff_syn_kevin_0001', assignmentEvidenceReference: 'synthetic:assignment:kevin' });
  record = f.safety.ordinaryTransition({ actor, commandId: 'reopen-resolve', caseRecordId: record.recordId, expectedVersion: record.version, toState: 'RESOLVED', authorityProof: { action: 'CONFIRM_RESOLUTION', verified: true, actorId: actor.actorId, ownerReference: 'staff_syn_kevin_0001', evidenceReference: 'synthetic:resolution:kevin' } });
  record = f.safety.ordinaryTransition({ actor, commandId: 'reopen-close', caseRecordId: record.recordId, expectedVersion: record.version, toState: 'CLOSED' });
  expectCode(() => f.safety.reopenCase({ actor, commandId: 'reopen-bad', caseRecordId: record.recordId, expectedVersion: record.version, authorityProof: { authorityName: 'Kevin', verificationStatus: 'SELF_ASSERTED', actorId: actor.actorId, evidenceReference: 'synthetic:bad' } }), 'KEVIN_REOPEN_AUTHORITY_REQUIRED');
  const reopened = f.safety.reopenCase({ actor, commandId: 'reopen-good', caseRecordId: record.recordId, expectedVersion: record.version, authorityProof: { authorityName: 'Kevin', verificationStatus: 'VERIFIED_IDENTITY_BINDING', actorId: actor.actorId, evidenceReference: 'synthetic:authority:kevin' } });
  assert.equal(reopened.state, 'TRIAGED');
  assert.equal(reopened.data.reopenHistory[0].priorState, 'CLOSED');
  assert.ok(f.privateRecords.auditTrail({ actor, recordId: record.recordId }).length >= 5);
});

test('reopening and Warehouse fallback cannot bypass safety disposition', () => {
  const f = makeFoundation();
  const permissions = ['PRIVATE_RECORD_CREATE', 'PRIVATE_RECORD_READ', 'PRIVATE_RECORD_UPDATE', 'PRIVATE_AUDIT_READ', 'SUPPORT_CASE_CREATE', 'SUPPORT_CASE_REOPEN', 'SAFETY_DISPOSITION'];
  const warehouse = { actorId: 'SYNTHETIC_WAREHOUSE', permissions };
  const held = f.safety.createCase({ actor: warehouse, commandId: 'held-case', destinationReference: 'dst_synthetic_held_case_001', initialState: 'SAFETY_HOLD' });
  expectCode(() => f.safety.reopenCase({ actor: warehouse, commandId: 'held-reopen', caseRecordId: held.recordId, expectedVersion: held.version, authorityProof: { authorityName: 'Kevin', verificationStatus: 'VERIFIED_IDENTITY_BINDING', actorId: warehouse.actorId, evidenceReference: 'synthetic:spoof' } }), 'ACTIVE_SAFETY_HOLD');
  expectCode(() => f.safety.authorizedSafetyDisposition({ actor: warehouse, commandId: 'warehouse-clear', caseRecordId: held.recordId, expectedVersion: held.version, toState: 'TRIAGED', dispositionRecord: { responsibleAuthority: warehouse.actorId, authorityRole: 'WAREHOUSE_FALLBACK', authorityName: 'Warehouse', authorityBindingStatus: 'VERIFIED_IDENTITY_BINDING', authorityEvidenceReference: 'synthetic:warehouse', reason: 'SYNTHETIC_REVIEW', evidenceRefs: ['synthetic:safety:1'], disposition: 'CLEARED_FOR_GOVERNED_SUPPORT', dispositionAt: '2026-11-25T15:00:00.000Z' } }), 'KEVIN_SAFETY_AUTHORITY_REQUIRED');
});

test('manufacturer escalation retains Rhino ownership and cannot authorize refunds', () => {
  const f = makeFoundation();
  const actor = { actorId: 'SYNTHETIC_ESCALATION_OPERATOR', permissions: ['PRIVATE_RECORD_CREATE', 'PRIVATE_RECORD_READ', 'PRIVATE_RECORD_UPDATE', 'SUPPORT_CASE_CREATE'] };
  const created = f.safety.createCase({ actor, commandId: 'manufacturer-case', destinationReference: 'dst_synthetic_manufacturer_001', initialState: 'TRIAGED' });
  const escalated = f.safety.ordinaryTransition({ actor, commandId: 'manufacturer-escalate', caseRecordId: created.recordId, expectedVersion: created.version, toState: 'MANUFACTURER_ESCALATED' });
  assert.equal(escalated.data.rhinoCaseOwnershipRetained, true);
  assert.equal(escalated.data.rhinoCommunicationResponsibilityRetained, true);
  const contract = readJson('data/epic-l-policy2-support-safety-contract.json');
  assert.equal(contract.manufacturerEscalation.automaticRefundAllowed, false);
  assert.equal(contract.manufacturerEscalation.agreementVerificationStatus, 'EXTERNALLY_BLOCKED');
});

test('internal warranty intent records business direction but rejects every issuance shortcut', () => {
  const contract = readJson('data/epic-l-policy2-warranty-review-contract.json');
  assert.equal(contract.internalWarrantyIntent.machineDuration.value, 1);
  assert.equal(contract.internalWarrantyIntent.missingReceiptAutomaticDenial, false);
  assert.equal(contract.internalWarrantyIntent.registeredAfterFirstUseAutomaticDenial, false);
  assert.equal(contract.internalWarrantyIntent.priorPurchasers.retroactiveApplicabilityApproved, false);
  assert.equal(contract.issuanceGate.operationalDecisionAllowed, false);
  assert.equal(contract.issuanceGate.customerNotificationAllowed, false);
  assert.equal(contract.authorityDimensions.filter((item) => item.status === 'ESTABLISHED_BY_REVISION_3').length, 1);
  assert.equal(contract.engineeringAcceptanceProhibitions.length, 8);
});

test('exact 31 projection preserves every source identity and creates no approval', () => {
  const matrix = readJson('data/epic-l-policy2-coverage-matrix.json');
  const projection = readJson('data/epic-l-policy2-coverage-review-31.json');
  const selected = matrix.activeProductApprovalRegister.filter((row) => row.shopifyStatus === 'ACTIVE' && row.coverageProposal.disposition === 'HUMAN_REVIEW_REQUIRED');
  assert.equal(projection.records.length, 31);
  assert.equal(new Set(projection.records.map((row) => row.productGid)).size, 31);
  for (const row of projection.records) {
    const source = selected.find((item) => item.productGid === row.productGid);
    assert.ok(source);
    assert.deepEqual(row.variantGids, source.variantGids);
    assert.equal(row.customerPromiseAuthorized, false);
    assert.equal(row.proposedBusinessClassification, null);
  }
  const modified = structuredClone(projection);
  modified.records[0].productGid = 'gid://shopify/Product/9999999999999';
  expectCode(() => validateCoverageProjectionAgainstMatrix(modified, matrix), 'PROJECTED_PRODUCT_GID_NOT_IN_SOURCE');
  const duplicate = structuredClone(projection);
  duplicate.records[1].productGid = duplicate.records[0].productGid;
  expectCode(() => validateCoverageProjectionAgainstMatrix(duplicate, matrix), 'DUPLICATE_PROJECTED_PRODUCT_GID');
  const missing = structuredClone(projection);
  missing.records.pop();
  expectCode(() => validateCoverageProjectionAgainstMatrix(missing, matrix), 'COVERAGE_PROJECTION_COUNT_INVALID');
  assert.deepEqual(validateCoverageProjectionAgainstMatrix(projection, matrix), { selectedProducts: 31, uniqueProducts: 31, customerPromiseAuthorizations: 0 });
});

test('activation and live operations remain blocked', () => {
  const f = makeFoundation();
  expectCode(() => f.registration.assertCustomerActivationBlocked(), 'CUSTOMER_ACTIVATION_DISABLED');
  expectCode(() => f.supportIntake.assertCustomerActivationBlocked(), 'CUSTOMER_ACTIVATION_DISABLED');
  expectCode(() => f.warrantyReview.issueOperationalDecision(), 'OPERATIONAL_WARRANTY_DECISION_BLOCKED');
  expectCode(() => f.warrantyReview.notifyCustomerDecision(), 'CUSTOMER_WARRANTY_NOTIFICATION_BLOCKED');
});

let passed = 0;
for (const item of tests) {
  try { item.fn(); passed += 1; console.log(`ok - ${item.name}`); }
  catch (error) { console.error(`not ok - ${item.name}`); throw error; }
}
console.log(`Epic L Policy 2.0 B06 domain scenarios passed: ${passed}/${tests.length}`);
console.log(`Invalid or unauthorized operations rejected: ${negativeCount}`);
console.log('Live provider operations: 0; customer promises or decisions: 0.');
