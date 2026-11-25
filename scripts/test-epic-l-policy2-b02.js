'use strict';

const assert = require('node:assert/strict');
const {
  MachineRegistrationService,
  REGISTRATION_STATES,
  REGISTRATION_TRANSITIONS,
  SyntheticNotificationTransport,
  createB01Foundation,
  createOpaqueIdentifier,
} = require('./lib/epic-l-policy2');

const PRODUCT_GID = 'gid://shopify/Product/310000000001';
const VARIANT_GID = 'gid://shopify/ProductVariant/410000000001';
const OTHER_PRODUCT_GID = 'gid://shopify/Product/310000000002';
const OTHER_VARIANT_GID = 'gid://shopify/ProductVariant/410000000002';
const CUSTOMER_A = 'cus_synthetic_customer_a_001';
const CUSTOMER_B = 'cus_synthetic_customer_b_001';
const DESTINATION_A = 'dst_synthetic_destination_a_001';
const ROUTE = 'route_support_pending_01';

const operatorPermissions = [
  'REGISTRATION_CREATE', 'REGISTRATION_ADMIN_CREATE', 'REGISTRATION_PRIVATE_READ', 'REGISTRATION_AUDIT_READ',
  'REGISTRATION_OWNERSHIP_APPROVE', 'REGISTRATION_CORRECT', 'REGISTRATION_ACKNOWLEDGE', 'REGISTRATION_RECOVER',
  'REGISTRATION_DUPLICATE_REVIEW', 'REGISTRATION_REJECT_INVALID',
  'REGISTRATION_RESOURCE_RESOLVE', 'REGISTRATION_RESOURCE_DELIVER', 'REGISTRATION_COMPLETE',
  'RESOURCE_REVISION_CREATE', 'RESOURCE_TECHNICAL_APPROVE', 'RESOURCE_CUSTOMER_RELEASE',
];
const operator = { actorId: 'SYNTHETIC_REGISTRATION_OPERATOR', permissions: operatorPermissions };
const customerA = {
  actorId: 'SYNTHETIC_CUSTOMER_ACTOR_A',
  customerReference: CUSTOMER_A,
  permissions: ['REGISTRATION_CREATE', 'REGISTRATION_READ_OWN', 'REGISTRATION_ACKNOWLEDGE_OWN', 'REGISTRATION_RESOURCE_RESOLVE_OWN'],
};
const customerB = {
  actorId: 'SYNTHETIC_CUSTOMER_ACTOR_B',
  customerReference: CUSTOMER_B,
  permissions: ['REGISTRATION_CREATE', 'REGISTRATION_READ_OWN', 'REGISTRATION_ACKNOWLEDGE_OWN', 'REGISTRATION_RESOURCE_RESOLVE_OWN'],
};
const unauthorized = { actorId: 'SYNTHETIC_UNAUTHORIZED', permissions: [] };

const systemActor = {
  actorId: 'B02_SYNTHETIC_PRIVATE_SYSTEM',
  permissions: [
    'PRIVATE_RECORD_CREATE', 'PRIVATE_RECORD_READ', 'PRIVATE_RECORD_UPDATE', 'PRIVATE_AUDIT_READ',
    'NOTIFICATION_QUEUE', 'NOTIFICATION_ATTEMPT', 'NOTIFICATION_RECOVERY', 'NOTIFICATION_RECONCILE',
  ],
};

function deterministicClock() {
  let tick = 0;
  return () => new Date(Date.UTC(2026, 10, 23, 15, 0, tick++)).toISOString();
}

function deterministicFactory(prefix) {
  let sequence = 0;
  return () => `${prefix}${String(++sequence).padStart(24, '0')}`;
}

class SyntheticResourceResolver {
  constructor(revisions = [], { filter = true } = {}) {
    this.synthetic = true;
    this.revisions = revisions;
    this.filter = filter;
    this.calls = [];
  }

  resolveApprovedCustomerRevision(query) {
    this.calls.push({ ...query });
    if (!this.filter) return this.revisions.map((revision) => ({ ...revision }));
    return this.revisions.filter((revision) =>
      revision.applicability.productGids.includes(query.productGid)
      && revision.applicability.variantGids.includes(query.variantGid)
      && revision.applicability.machineVersions.includes(query.machineVersion));
  }
}

function resource(revisionId = 'rev_synthetic_001', machineVersion = 'MACHINE-V1') {
  return {
    resourceId: 'res_synthetic_manual_001',
    revisionId,
    releaseStatus: 'APPROVED_CUSTOMER_RELEASE',
    synthetic: true,
    applicability: {
      productGids: [PRODUCT_GID],
      variantGids: [VARIANT_GID],
      machineVersions: [machineVersion],
    },
  };
}

function makeFoundation({ outcomes = [], resolver, interruptionHook } = {}) {
  const transport = new SyntheticNotificationTransport(outcomes);
  const foundation = createB01Foundation({
    catalogEntries: [
      { productGid: PRODUCT_GID, variantGid: VARIANT_GID },
      { productGid: OTHER_PRODUCT_GID, variantGid: OTHER_VARIANT_GID },
    ],
    transport,
    clock: deterministicClock(),
    identifiers: {
      recordId: deterministicFactory('rec_'), publicReference: deterministicFactory('ref_'), auditId: deterministicFactory('aud_'),
      notificationId: deterministicFactory('ntf_'), attemptId: deterministicFactory('att_'), resourceId: deterministicFactory('res_'),
      revisionId: deterministicFactory('rev_'), resourceAuditId: deterministicFactory('raud_'), domainEventId: deterministicFactory('evt_'),
      registrationId: deterministicFactory('reg_'), acknowledgementEventId: deterministicFactory('ack_'), duplicateReviewId: deterministicFactory('dup_'),
    },
    technicalApprovalAuthority: { actorId: 'SYNTHETIC_KEVIN_AUTHORITY', authorityRole: 'SYNTHETIC_TECHNICAL_APPROVER', synthetic: true },
    systemActor,
    registrationResourceResolver: resolver,
    registrationInterruptionHook: interruptionHook,
    testMode: true,
  });
  return { ...foundation, transport };
}

function input(overrides = {}) {
  return {
    customerReference: CUSTOMER_A,
    notificationDestinationReference: DESTINATION_A,
    productGid: PRODUCT_GID,
    variantGid: VARIANT_GID,
    productVersion: 'MACHINE-V1',
    policyVersion: 'POLICY2_PROPOSED_NOT_EFFECTIVE',
    firstUseDeclaration: { state: 'UNKNOWN' },
    ...overrides,
  };
}

function create(foundation, commandId = 'register-1', overrides = {}, actor = customerA) {
  return foundation.registration.createRegistration({ actor, commandId, input: input(overrides) });
}

function privateRecord(foundation, registrationId, actor = customerA) {
  return foundation.registration.getPrivateRegistration({ actor, registrationId });
}

function operatorRecord(foundation, registrationId) {
  return foundation.registration.getPrivateRegistration({ actor: operator, registrationId });
}

function acknowledge(foundation, registrationId, commandId = 'ack-create') {
  const current = operatorRecord(foundation, registrationId);
  foundation.registration.createAcknowledgement({ actor: operator, commandId, registrationId, expectedVersion: current.version, supportRouteReference: ROUTE });
  return operatorRecord(foundation, registrationId);
}

function verifyOwnership(foundation, registrationId, commandId = 'ownership-verify') {
  const current = operatorRecord(foundation, registrationId);
  return foundation.registration.recordOwnershipDecision({
    actor: operator,
    commandId,
    registrationId,
    expectedVersion: current.version,
    decision: { status: 'VERIFIED', evidenceRefs: [`synthetic:evidence:${commandId}`] },
  });
}

let rejectedInvalidOperations = 0;
function expectCode(fn, code) {
  assert.throws(fn, (error) => error && error.code === code, `Expected error code ${code}`);
  rejectedInvalidOperations += 1;
}

const tests = [];
function test(name, run) { tests.push({ name, run }); }

test('valid synthetic registration captures exact private identity without eligibility inference', () => {
  const f = makeFoundation();
  const result = create(f);
  assert.equal(result.registration.state, 'IDENTITY_VERIFICATION_REQUIRED');
  assert.match(result.registration.data.registrationId, /^reg_[A-Za-z0-9_-]{24,}$/);
  assert.notEqual(result.registration.data.registrationId, result.registration.data.serialNumber);
  assert.equal(result.registration.data.productGid, PRODUCT_GID);
  assert.equal(result.registration.data.variantGid, VARIANT_GID);
  assert.equal(result.registration.data.productVersion, 'MACHINE-V1');
  assert.equal(result.registration.data.warrantyEligibility.determined, false);
  assert.equal(result.registration.data.warrantyEligibility.automaticDenial, false);
});

test('registration identifier helper enforces at least 128 random bits by construction', () => {
  expectCode(() => createOpaqueIdentifier(15, 'reg_'), 'INSUFFICIENT_IDENTIFIER_ENTROPY');
  assert.match(createOpaqueIdentifier(16, 'reg_'), /^reg_[A-Za-z0-9_-]{22}$/);
});

test('identical registration command is idempotent and conflicting reuse is rejected', () => {
  const f = makeFoundation();
  const first = create(f, 'register-idempotent');
  const repeated = create(f, 'register-idempotent');
  assert.deepEqual(repeated, first);
  expectCode(() => create(f, 'register-idempotent', { productVersion: 'DIFFERENT' }), 'IDEMPOTENCY_KEY_REUSE');
});

test('invalid Product, Variant, and Product-Variant relationships fail closed', () => {
  const f = makeFoundation();
  expectCode(() => create(f, 'invalid-product', { productGid: 'product-1' }), 'INVALID_PRODUCT_GID');
  expectCode(() => create(f, 'invalid-variant', { variantGid: 'variant-1' }), 'INVALID_VARIANT_GID');
  expectCode(() => create(f, 'mismatch', { variantGid: OTHER_VARIANT_GID }), 'INVALID_PRODUCT_VARIANT_RELATIONSHIP');
});

test('first use states validate without requiring date, serial, or historical order', () => {
  const f = makeFoundation();
  assert.equal(create(f, 'first-not-started', { firstUseDeclaration: { state: 'NOT_STARTED' } }).registration.data.firstUseDeclaration.state, 'NOT_STARTED');
  assert.equal(create(f, 'first-unknown', { firstUseDeclaration: { state: 'UNKNOWN' } }).registration.data.serialNumber, null);
  assert.equal(create(f, 'first-date', { firstUseDeclaration: { state: 'DECLARED_DATE', declaredDate: '2026-11-20' } }).registration.data.firstUseDeclaration.declaredDate, '2026-11-20');
  expectCode(() => create(f, 'first-date-missing', { firstUseDeclaration: { state: 'DECLARED_DATE' } }), 'FIRST_USE_DATE_REQUIRED');
  expectCode(() => create(f, 'first-unknown-date', { firstUseDeclaration: { state: 'UNKNOWN', declaredDate: '2026-11-20' } }), 'UNEXPECTED_FIRST_USE_DATE');
  expectCode(() => create(f, 'first-invalid', { firstUseDeclaration: { state: 'SOMETIME' } }), 'INVALID_FIRST_USE_DECLARATION');
});

test('unauthenticated, unauthorized, cross-customer, and registration-ID-only access is rejected', () => {
  const f = makeFoundation();
  const registrationId = create(f).registration.data.registrationId;
  expectCode(() => f.registration.getPrivateRegistration({ actor: null, registrationId }), 'REGISTRATION_ACCESS_DENIED');
  expectCode(() => f.registration.getPrivateRegistration({ actor: unauthorized, registrationId }), 'REGISTRATION_ACCESS_DENIED');
  expectCode(() => f.registration.getPrivateRegistration({ actor: customerB, registrationId }), 'REGISTRATION_ACCESS_DENIED');
  expectCode(() => f.registration.getPrivateRegistration({ actor: { actorId: 'KNOWS_ID', permissions: ['REGISTRATION_READ_OWN'] }, registrationId }), 'REGISTRATION_ACCESS_DENIED');
});

test('customer reference mismatch cannot create a record for another customer', () => {
  const f = makeFoundation();
  expectCode(() => create(f, 'cross-create', { customerReference: CUSTOMER_B }, customerA), 'CUSTOMER_REFERENCE_MISMATCH');
});

test('public registration handle discloses no customer, machine, serial, or conflict identity', () => {
  const f = makeFoundation();
  const registrationId = create(f, 'public', { serialNumber: 'SYNTHETIC-SERIAL-PUBLIC' }).registration.data.registrationId;
  const publicHandle = f.registration.getPublicHandle(registrationId);
  const serialized = JSON.stringify(publicHandle);
  assert.equal(serialized.includes(CUSTOMER_A), false);
  assert.equal(serialized.includes(PRODUCT_GID), false);
  assert.equal(serialized.includes('SYNTHETIC-SERIAL-PUBLIC'), false);
  assert.deepEqual(Object.keys(publicHandle).sort(), ['customerActivationPermitted', 'processingStatus', 'registrationId']);
});

test('historical physical serial evidence remains readable but has no duplicate authority', () => {
  const f = makeFoundation();
  const first = create(f, 'dup-first', { serialNumber: 'SYNTHETIC-SERIAL-DUP' }).registration.data.registrationId;
  const second = create(f, 'dup-second', { customerReference: CUSTOMER_B, notificationDestinationReference: 'dst_synthetic_destination_b_001', serialNumber: 'synthetic-serial-dup' }, customerB);
  assert.equal(second.submissionOutcome, 'RECEIVED_FOR_VERIFICATION');
  assert.equal(second.registration.state, 'IDENTITY_VERIFICATION_REQUIRED');
  assert.equal(JSON.stringify(second.registration).includes(first), false);
  const full = operatorRecord(f, second.registration.data.registrationId);
  assert.equal(full.data.legacyPhysicalSerialEvidence.value, 'synthetic-serial-dup');
  assert.equal(full.data.duplicateInvestigation, null);
  assert.equal(f.registration.getPublicHandle(second.registration.data.registrationId).processingStatus, 'REVIEW_REQUIRED');
});

test('same customer may own multiple distinct registrations without serial conflation', () => {
  const f = makeFoundation();
  const first = create(f, 'same-first', { serialNumber: 'SYNTHETIC-SERIAL-SAME' });
  const repeated = create(f, 'same-second', { serialNumber: 'SYNTHETIC-SERIAL-SAME' });
  assert.notEqual(first.registration.data.registrationId, repeated.registration.data.registrationId);
  assert.equal(repeated.registration.state, 'IDENTITY_VERIFICATION_REQUIRED');
  assert.equal(repeated.submissionOutcome, 'RECEIVED_FOR_VERIFICATION');
});

test('authorized duplicate decision never auto-merges or transfers ownership', () => {
  const f = makeFoundation();
  const first = create(f, 'review-first').registration.data.registrationId;
  const duplicate = create(f, 'review-second', { customerReference: CUSTOMER_B, notificationDestinationReference: 'dst_synthetic_destination_b_002', duplicateSignals: { existingRegistrationEvidenceRef: first } }, customerB).registration;
  const resolved = f.registration.resolveDuplicateReview({ actor: operator, commandId: 'review-decision', registrationId: duplicate.data.registrationId, expectedVersion: duplicate.version, decision: 'LEGITIMATE_DUPLICATE', reason: 'Synthetic evidence indicates a repeated submission', evidenceRefs: ['synthetic:duplicate:decision'] });
  assert.equal(resolved.state, 'IDENTITY_VERIFICATION_REQUIRED');
  assert.equal(resolved.data.customerReference, CUSTOMER_B);
  assert.equal(resolved.data.duplicateInvestigation.status, 'REVIEWED_NO_AUTOMATIC_MERGE');
});

test('inconclusive duplicate decision remains in human review', () => {
  const f = makeFoundation();
  const first = create(f, 'inconclusive-first').registration.data.registrationId;
  const duplicate = create(f, 'inconclusive-second', { duplicateSignals: { existingRegistrationEvidenceRef: first } }).registration;
  const reviewed = f.registration.resolveDuplicateReview({ actor: operator, commandId: 'inconclusive-decision', registrationId: duplicate.data.registrationId, expectedVersion: duplicate.version, decision: 'INCONCLUSIVE', reason: 'Synthetic evidence cannot resolve the signal', evidenceRefs: ['synthetic:duplicate:inconclusive'] });
  assert.equal(reviewed.state, 'DUPLICATE_REVIEW');
  assert.equal(reviewed.data.duplicateInvestigation.status, 'HUMAN_REVIEW_REQUIRED');
});

test('unverified customer cannot overwrite ownership or registration evidence', () => {
  const f = makeFoundation();
  const record = create(f).registration;
  expectCode(() => f.registration.recordOwnershipDecision({ actor: customerA, commandId: 'owner-forge', registrationId: record.data.registrationId, expectedVersion: record.version, decision: { status: 'VERIFIED', evidenceRefs: ['synthetic:forged'] } }), 'AUTHORIZATION_REQUIRED');
  expectCode(() => f.registration.authorizedCorrection({ actor: customerA, commandId: 'correction-forge', registrationId: record.data.registrationId, expectedVersion: record.version, correction: { serialNumber: 'OVERWRITE' }, reason: 'forged', evidenceRefs: ['synthetic:forged'] }), 'AUTHORIZATION_REQUIRED');
});

test('conflicting ownership remains in review and preserves private evidence', () => {
  const f = makeFoundation();
  const record = create(f).registration;
  const decided = f.registration.recordOwnershipDecision({ actor: operator, commandId: 'owner-conflict', registrationId: record.data.registrationId, expectedVersion: record.version, decision: { status: 'CONFLICTING', evidenceRefs: ['synthetic:conflict:1'] } });
  assert.equal(decided.state, 'DUPLICATE_REVIEW');
  assert.equal(decided.data.ownershipVerification.status, 'CONFLICTING');
  assert.deepEqual(decided.data.ownershipVerification.evidenceRefs, ['synthetic:conflict:1']);
  assert.equal(JSON.stringify(privateRecord(f, record.data.registrationId)).includes('synthetic:conflict:1'), false);
});

test('authorized correction preserves registration identity and audit history', () => {
  const f = makeFoundation();
  const record = create(f).registration;
  const corrected = f.registration.authorizedCorrection({ actor: operator, commandId: 'correction-valid', registrationId: record.data.registrationId, expectedVersion: record.version, correction: { productVersion: 'MACHINE-V1.1' }, reason: 'Synthetic evidence correction', evidenceRefs: ['synthetic:correction:1'] });
  assert.equal(corrected.data.registrationId, record.data.registrationId);
  assert.equal(corrected.data.productVersion, 'MACHINE-V1.1');
  assert.equal(corrected.data.correctionHistory.length, 1);
  assert.ok(f.registration.auditTrail({ actor: operator, registrationId: record.data.registrationId }).some((event) => event.eventType === 'REGISTRATION_AUTHORIZED_CORRECTION'));
});

test('acknowledgement creation is idempotent and queued is not delivered', () => {
  const f = makeFoundation();
  const registrationId = create(f).registration.data.registrationId;
  const version = operatorRecord(f, registrationId).version;
  const first = f.registration.createAcknowledgement({ actor: operator, commandId: 'ack-idempotent', registrationId, expectedVersion: version, supportRouteReference: ROUTE });
  const repeated = f.registration.createAcknowledgement({ actor: operator, commandId: 'ack-idempotent', registrationId, expectedVersion: version, supportRouteReference: ROUTE });
  assert.deepEqual(repeated, first);
  assert.equal(first.acknowledgementStatus, 'NOTIFICATION_QUEUED');
  assert.equal(f.transport.calls.length, 0);
  assert.equal(first.policyPromiseAuthorized, false);
});

test('confirmed acknowledgement distinguishes attempted and confirmed evidence', () => {
  const f = makeFoundation({ outcomes: [{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:ack:confirmed' } }] });
  const registrationId = create(f).registration.data.registrationId;
  let record = acknowledge(f, registrationId);
  record = f.registration.attemptAcknowledgementDelivery({ actor: operator, commandId: 'ack-attempt-confirmed', registrationId, expectedVersion: record.version });
  assert.equal(record.data.acknowledgement.status, 'DELIVERY_CONFIRMED');
  assert.ok(record.data.acknowledgement.history.some((entry) => entry.status === 'DELIVERY_ATTEMPTED'));
  assert.equal(record.data.acknowledgement.deliveryEvidence.providerReceipt, 'synthetic:ack:confirmed');
});

test('failed acknowledgement records recovery and never claims delivery', () => {
  const f = makeFoundation({ outcomes: [{ outcome: 'FAILED', reasonCode: 'SYNTHETIC_FAILURE' }] });
  const registrationId = create(f).registration.data.registrationId;
  let record = acknowledge(f, registrationId);
  record = f.registration.attemptAcknowledgementDelivery({ actor: operator, commandId: 'ack-attempt-failed', registrationId, expectedVersion: record.version });
  assert.equal(record.state, 'RECOVERY_REQUIRED');
  assert.equal(record.data.acknowledgement.status, 'RECOVERY_REQUIRED');
  assert.equal(record.data.acknowledgement.deliveryEvidence, null);
  assert.ok(record.data.recoveryObligations.includes('ACKNOWLEDGEMENT_DELIVERY_UNRESOLVED'));
});

test('uncertain acknowledgement remains unresolved until evidence reconciliation', () => {
  const f = makeFoundation({ outcomes: [{ outcome: 'UNCERTAIN', reasonCode: 'SYNTHETIC_TIMEOUT' }] });
  const registrationId = create(f).registration.data.registrationId;
  let record = acknowledge(f, registrationId);
  record = f.registration.attemptAcknowledgementDelivery({ actor: operator, commandId: 'ack-attempt-uncertain', registrationId, expectedVersion: record.version });
  assert.equal(record.state, 'RECOVERY_REQUIRED');
  record = f.registration.recoverAcknowledgement({ actor: operator, commandId: 'ack-reconcile', registrationId, expectedVersion: record.version, action: 'RECONCILE', reconciliation: { outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:reconciled' } } });
  assert.equal(record.state, 'ACKNOWLEDGED');
  assert.equal(record.data.acknowledgement.status, 'DELIVERY_CONFIRMED');
});

test('missing approved resource preserves registration and blocks completion', () => {
  const f = makeFoundation({ outcomes: [{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:ack' } }] });
  const registrationId = create(f).registration.data.registrationId;
  verifyOwnership(f, registrationId);
  let record = acknowledge(f, registrationId);
  record = f.registration.attemptAcknowledgementDelivery({ actor: operator, commandId: 'missing-ack', registrationId, expectedVersion: record.version });
  record = f.registration.resolveInstructionResource({ actor: operator, commandId: 'missing-resource', registrationId, expectedVersion: record.version });
  assert.equal(record.state, 'RESOURCE_DELIVERY_PENDING');
  assert.equal(record.data.instructionDelivery.status, 'BLOCKED_NO_APPROVED_RESOURCE');
  assert.ok(record.data.recoveryObligations.includes('MISSING_APPROVED_RESOURCE'));
  expectCode(() => f.registration.completeRegistration({ actor: operator, commandId: 'missing-complete', registrationId, expectedVersion: record.version }), 'INSTRUCTION_DELIVERY_EVIDENCE_REQUIRED');
});

test('wrong machine-version resource is rejected', () => {
  const resolver = new SyntheticResourceResolver([resource('rev_wrong_version', 'MACHINE-V2')], { filter: false });
  const f = makeFoundation({ resolver });
  const registrationId = create(f).registration.data.registrationId;
  const record = acknowledge(f, registrationId);
  expectCode(() => f.registration.resolveInstructionResource({ actor: operator, commandId: 'wrong-resource', registrationId, expectedVersion: record.version }), 'RESOURCE_MACHINE_VERSION_MISMATCH');
});

test('missing delivery evidence prevents COMPLETE even with a synthetic applicable resource', () => {
  const resolver = new SyntheticResourceResolver([resource()]);
  const f = makeFoundation({ outcomes: [{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:ack' } }], resolver });
  const registrationId = create(f).registration.data.registrationId;
  verifyOwnership(f, registrationId);
  let record = acknowledge(f, registrationId);
  record = f.registration.attemptAcknowledgementDelivery({ actor: operator, commandId: 'no-delivery-ack', registrationId, expectedVersion: record.version });
  record = f.registration.resolveInstructionResource({ actor: operator, commandId: 'no-delivery-resource', registrationId, expectedVersion: record.version });
  expectCode(() => f.registration.completeRegistration({ actor: operator, commandId: 'no-delivery-complete', registrationId, expectedVersion: record.version }), 'INSTRUCTION_DELIVERY_EVIDENCE_REQUIRED');
});

test('synthetic complete lifecycle requires ownership, acknowledgement, and resource evidence', () => {
  const resolver = new SyntheticResourceResolver([resource()]);
  const f = makeFoundation({ outcomes: [{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:ack' } }], resolver });
  const registrationId = create(f).registration.data.registrationId;
  verifyOwnership(f, registrationId);
  let record = acknowledge(f, registrationId);
  record = f.registration.attemptAcknowledgementDelivery({ actor: operator, commandId: 'complete-ack', registrationId, expectedVersion: record.version });
  record = f.registration.resolveInstructionResource({ actor: operator, commandId: 'complete-resource', registrationId, expectedVersion: record.version });
  record = f.registration.recordInstructionDelivery({ actor: operator, commandId: 'complete-delivery', registrationId, expectedVersion: record.version, evidence: { resourceId: 'res_synthetic_manual_001', revisionId: 'rev_synthetic_001', deliveredAt: '2026-11-23T16:00:00.000Z', deliveryChannel: 'SYNTHETIC_INTERNAL', deliveryStatus: 'DELIVERY_CONFIRMED' } });
  record = f.registration.completeRegistration({ actor: operator, commandId: 'complete-registration', registrationId, expectedVersion: record.version });
  assert.equal(record.state, 'COMPLETE');
  assert.equal(record.data.warrantyEligibility.determined, false);
  assert.equal(f.registration.getPublicHandle(registrationId).customerActivationPermitted, false);
});

test('verified ownership does not bypass unresolved duplicate investigation at COMPLETE', () => {
  const resolver = new SyntheticResourceResolver([resource()]);
  const f = makeFoundation({ outcomes: [{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:duplicate-ack' } }], resolver });
  const first = create(f, 'duplicate-complete-first').registration.data.registrationId;
  const registrationId = create(f, 'duplicate-complete-second', { duplicateSignals: { existingRegistrationEvidenceRef: first } }).registration.data.registrationId;
  verifyOwnership(f, registrationId, 'duplicate-complete-owner');
  let record = acknowledge(f, registrationId, 'duplicate-complete-ack-create');
  record = f.registration.attemptAcknowledgementDelivery({ actor: operator, commandId: 'duplicate-complete-ack-attempt', registrationId, expectedVersion: record.version });
  record = f.registration.resolveInstructionResource({ actor: operator, commandId: 'duplicate-complete-resource', registrationId, expectedVersion: record.version });
  record = f.registration.recordInstructionDelivery({ actor: operator, commandId: 'duplicate-complete-delivery', registrationId, expectedVersion: record.version, evidence: { resourceId: 'res_synthetic_manual_001', revisionId: 'rev_synthetic_001', deliveredAt: '2026-11-23T16:00:00.000Z', deliveryChannel: 'SYNTHETIC_INTERNAL', deliveryStatus: 'DELIVERY_CONFIRMED' } });
  expectCode(() => f.registration.completeRegistration({ actor: operator, commandId: 'duplicate-complete-blocked', registrationId, expectedVersion: record.version }), 'DUPLICATE_REVIEW_RESOLUTION_REQUIRED');
});

test('superseded resource resolution preserves original delivery evidence', () => {
  const resolver = new SyntheticResourceResolver([resource('rev_synthetic_001')]);
  const f = makeFoundation({ resolver });
  const registrationId = create(f).registration.data.registrationId;
  let record = acknowledge(f, registrationId);
  record = f.registration.resolveInstructionResource({ actor: operator, commandId: 'supersede-resolve-1', registrationId, expectedVersion: record.version });
  record = f.registration.recordInstructionDelivery({ actor: operator, commandId: 'supersede-deliver-1', registrationId, expectedVersion: record.version, evidence: { resourceId: 'res_synthetic_manual_001', revisionId: 'rev_synthetic_001', deliveredAt: '2026-11-23T16:00:00.000Z', deliveryChannel: 'SYNTHETIC_INTERNAL', deliveryStatus: 'DELIVERY_CONFIRMED' } });
  resolver.revisions = [resource('rev_synthetic_002')];
  record = f.registration.resolveInstructionResource({ actor: operator, commandId: 'supersede-resolve-2', registrationId, expectedVersion: record.version });
  assert.equal(record.data.instructionDelivery.current.revisionId, 'rev_synthetic_002');
  assert.equal(record.data.instructionDelivery.history[0].revisionId, 'rev_synthetic_001');
  assert.equal(record.data.instructionDelivery.resolutionHistory[0].revisionId, 'rev_synthetic_001');
});

test('generic synthetic actor cannot impersonate Kevin or release a real governed resource', () => {
  const f = makeFoundation();
  const revision = f.resources.createRevision({ actor: operator, category: 'MANUAL', sourceIdentity: 'synthetic-source', customerCopyApproval: true, applicability: { productGids: [PRODUCT_GID], variantGids: [VARIANT_GID], machineVersions: ['MACHINE-V1'] } });
  f.resources.submitTechnicalReview({ actor: operator, resourceId: revision.resourceId, revisionId: revision.revisionId });
  expectCode(() => f.resources.approveTechnical({ actor: operator, resourceId: revision.resourceId, revisionId: revision.revisionId, approvalEvidence: ['synthetic:evidence'] }), 'KEVIN_APPROVAL_REQUIRED');
});

test('synthetic resource resolver cannot be configured outside explicit test mode', () => {
  const f = makeFoundation();
  expectCode(() => new MachineRegistrationService({ privateRecords: f.privateRecords, notifications: f.notifications, resources: new SyntheticResourceResolver(), activationGate: f.activationGate, catalog: f.catalog, authorize: () => true, systemActor, testMode: false }), 'SYNTHETIC_RESOURCE_AUTHORITY_FORBIDDEN');
});

test('registration persistence interruption retries without creating a second registration', () => {
  let interrupted = false;
  const f = makeFoundation({ interruptionHook(stage) { if (stage === 'AFTER_REGISTRATION_PERSISTED' && !interrupted) { interrupted = true; throw Object.assign(new Error('synthetic interruption'), { code: 'SYNTHETIC_INTERRUPTION' }); } } });
  expectCode(() => create(f, 'interrupt-registration'), 'SYNTHETIC_INTERRUPTION');
  const recovered = create(f, 'interrupt-registration');
  assert.equal(recovered.registration.state, 'IDENTITY_VERIFICATION_REQUIRED');
  const createdEvents = f.registration.auditTrail({ actor: operator, registrationId: recovered.registration.data.registrationId }).filter((event) => event.eventType === 'RECORD_CREATED');
  assert.equal(createdEvents.length, 1);
});

test('received record can be rejected only through authorized evidence-backed validation disposition', () => {
  let capturedRegistrationId;
  const f = makeFoundation({ interruptionHook(stage, context) { if (stage === 'AFTER_REGISTRATION_PERSISTED' && !capturedRegistrationId) { capturedRegistrationId = context.registrationId; throw Object.assign(new Error('synthetic interruption'), { code: 'SYNTHETIC_INTERRUPTION' }); } } });
  expectCode(() => create(f, 'rejection-received'), 'SYNTHETIC_INTERRUPTION');
  const received = operatorRecord(f, capturedRegistrationId);
  expectCode(() => f.registration.recordValidationRejection({ actor: customerA, commandId: 'rejection-unauthorized', registrationId: capturedRegistrationId, expectedVersion: received.version, reason: 'forged', evidenceRefs: ['synthetic:forged'] }), 'AUTHORIZATION_REQUIRED');
  const rejected = f.registration.recordValidationRejection({ actor: operator, commandId: 'rejection-authorized', registrationId: capturedRegistrationId, expectedVersion: received.version, reason: 'Synthetic semantic validation evidence', evidenceRefs: ['synthetic:validation:1'] });
  assert.equal(rejected.state, 'REJECTED_INVALID_INPUT');
  assert.equal(rejected.data.validationRejection.reason, 'Synthetic semantic validation evidence');
});

test('acknowledgement event interruption remains recoverable without duplicate notification', () => {
  let interrupted = false;
  const f = makeFoundation({ interruptionHook(stage) { if (stage === 'AFTER_ACKNOWLEDGEMENT_EVENT_PERSISTED' && !interrupted) { interrupted = true; throw Object.assign(new Error('synthetic interruption'), { code: 'SYNTHETIC_INTERRUPTION' }); } } });
  const registrationId = create(f).registration.data.registrationId;
  let record = operatorRecord(f, registrationId);
  expectCode(() => f.registration.createAcknowledgement({ actor: operator, commandId: 'interrupt-ack-event', registrationId, expectedVersion: record.version, supportRouteReference: ROUTE }), 'SYNTHETIC_INTERRUPTION');
  record = operatorRecord(f, registrationId);
  assert.equal(record.data.acknowledgement.status, 'CREATED');
  record = f.registration.recoverAcknowledgement({ actor: operator, commandId: 'recover-ack-event', registrationId, expectedVersion: record.version, action: 'RESUME_QUEUE' });
  assert.equal(record.data.acknowledgement.status, 'NOTIFICATION_QUEUED');
  assert.equal(f.transport.calls.length, 0);
});

test('notification queue interruption reuses the same outbox event on recovery', () => {
  let interrupted = false;
  const f = makeFoundation({ interruptionHook(stage) { if (stage === 'AFTER_ACKNOWLEDGEMENT_NOTIFICATION_QUEUED' && !interrupted) { interrupted = true; throw Object.assign(new Error('synthetic interruption'), { code: 'SYNTHETIC_INTERRUPTION' }); } } });
  const registrationId = create(f).registration.data.registrationId;
  let record = operatorRecord(f, registrationId);
  expectCode(() => f.registration.createAcknowledgement({ actor: operator, commandId: 'interrupt-after-queue', registrationId, expectedVersion: record.version, supportRouteReference: ROUTE }), 'SYNTHETIC_INTERRUPTION');
  record = operatorRecord(f, registrationId);
  assert.equal(record.data.acknowledgement.status, 'CREATED');
  record = f.registration.recoverAcknowledgement({ actor: operator, commandId: 'recover-after-queue', registrationId, expectedVersion: record.version, action: 'RESUME_QUEUE' });
  assert.equal(record.data.acknowledgement.status, 'NOTIFICATION_QUEUED');
  assert.equal(record.data.acknowledgement.history.filter((entry) => entry.status === 'NOTIFICATION_QUEUED').length, 1);
});

test('repeated acknowledgement recovery does not duplicate transport operations', () => {
  const f = makeFoundation({ outcomes: [
    { outcome: 'FAILED', reasonCode: 'SYNTHETIC_FAILURE' },
    { outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:retry' } },
  ] });
  const registrationId = create(f).registration.data.registrationId;
  let record = acknowledge(f, registrationId);
  record = f.registration.attemptAcknowledgementDelivery({ actor: operator, commandId: 'recovery-first-attempt', registrationId, expectedVersion: record.version });
  const expectedVersion = record.version;
  const first = f.registration.recoverAcknowledgement({ actor: operator, commandId: 'recovery-retry', registrationId, expectedVersion, action: 'RETRY_DELIVERY' });
  const repeated = f.registration.recoverAcknowledgement({ actor: operator, commandId: 'recovery-retry', registrationId, expectedVersion, action: 'RETRY_DELIVERY' });
  assert.deepEqual(repeated, first);
  assert.equal(f.transport.calls.length, 2);
});

test('record version conflicts fail without changing protected evidence', () => {
  const f = makeFoundation();
  const record = create(f).registration;
  verifyOwnership(f, record.data.registrationId, 'version-advance');
  expectCode(() => f.registration.authorizedCorrection({ actor: operator, commandId: 'stale-correction', registrationId: record.data.registrationId, expectedVersion: record.version, correction: { productVersion: 'STALE' }, reason: 'stale', evidenceRefs: ['synthetic:stale'] }), 'RECORD_VERSION_CONFLICT');
  assert.equal(operatorRecord(f, record.data.registrationId).data.productVersion, 'MACHINE-V1');
});

test('every declared lifecycle transition and guard shape is accepted, while unknown transitions fail closed', () => {
  const f = makeFoundation();
  const validData = {
    duplicateInvestigation: { reviewId: 'dup_synthetic' },
    acknowledgement: { eventId: 'ack_synthetic' },
    instructionDelivery: { status: 'PENDING' },
    recoveryObligations: ['SYNTHETIC_RECOVERY'],
    validationRejection: { reason: 'SYNTHETIC_INVALID_INPUT' },
  };
  assert.ok(REGISTRATION_TRANSITIONS.length >= 20);
  for (const [from, to] of REGISTRATION_TRANSITIONS) {
    assert.equal(f.registration.isTransitionSupported(from, to), true);
    f.registration.assertLifecycleTransition(from, to, validData);
  }
  assert.deepEqual(new Set(REGISTRATION_STATES), new Set(['RECEIVED', 'IDENTITY_VERIFICATION_REQUIRED', 'DUPLICATE_REVIEW', 'ACKNOWLEDGED', 'RESOURCE_DELIVERY_PENDING', 'COMPLETE', 'RECOVERY_REQUIRED', 'REJECTED_INVALID_INPUT']));
  expectCode(() => f.registration.assertLifecycleTransition('COMPLETE', 'ACKNOWLEDGED', validData), 'INVALID_REGISTRATION_TRANSITION');
  expectCode(() => f.registration.assertLifecycleTransition('UNKNOWN', 'RECEIVED', validData), 'UNKNOWN_REGISTRATION_STATE');
  expectCode(() => f.registration.assertLifecycleTransition('RECEIVED', 'ACKNOWLEDGED', { ...validData, acknowledgement: { eventId: null } }), 'ACKNOWLEDGEMENT_EVENT_REQUIRED');
});

test('customer activation, approved policy language, and warranty promises remain blocked', () => {
  const f = makeFoundation();
  const registrationId = create(f).registration.data.registrationId;
  const acknowledgement = acknowledge(f, registrationId);
  assert.equal(acknowledgement.data.acknowledgement.policyPromiseAuthorized, false);
  assert.equal(acknowledgement.data.warrantyEligibility.customerPromiseAuthorized, false);
  expectCode(() => f.registration.assertCustomerActivationBlocked(), 'CUSTOMER_ACTIVATION_DISABLED');
});

let passed = 0;
for (const { name, run } of tests) {
  try {
    run();
    passed += 1;
  } catch (error) {
    console.error(`FAIL: ${name}`);
    throw error;
  }
}

console.log(`Epic L Policy 2.0 B02 registration tests passed: ${passed}/${tests.length}`);
console.log(`B02 invalid operations rejected: ${rejectedInvalidOperations}`);
console.log(`Registration lifecycle transitions exercised: ${REGISTRATION_TRANSITIONS.length}/${REGISTRATION_TRANSITIONS.length}`);
console.log('Customer registration activation: BLOCKED; warranty eligibility: NOT DETERMINED.');
