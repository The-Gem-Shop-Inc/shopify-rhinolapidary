'use strict';

const assert = require('node:assert/strict');
const {
  SyntheticNotificationTransport,
  createB01Foundation,
  createOpaqueIdentifier,
} = require('./lib/epic-l-policy2');

const PRODUCT_GID = 'gid://shopify/Product/100000000001';
const VARIANT_GID = 'gid://shopify/ProductVariant/200000000001';
const OTHER_PRODUCT_GID = 'gid://shopify/Product/100000000002';
const DESTINATION = 'dst_synthetic_reference_001';

const fullPermissions = [
  'PRIVATE_RECORD_CREATE', 'PRIVATE_RECORD_READ', 'PRIVATE_RECORD_UPDATE', 'PRIVATE_AUDIT_READ',
  'RESOURCE_REVISION_CREATE', 'RESOURCE_TECHNICAL_APPROVE', 'RESOURCE_CUSTOMER_RELEASE',
  'NOTIFICATION_QUEUE', 'NOTIFICATION_ATTEMPT', 'NOTIFICATION_RECOVERY', 'NOTIFICATION_RECONCILE',
  'NOTIFICATION_TERMINAL_DISPOSITION', 'SUPPORT_CASE_CREATE', 'SAFETY_INTERRUPT', 'SAFETY_DISPOSITION',
];

const operator = { actorId: 'SYNTHETIC_OPERATOR', permissions: fullPermissions };
const syntheticKevin = { actorId: 'SYNTHETIC_KEVIN_AUTHORITY', permissions: fullPermissions };
const unauthorized = { actorId: 'SYNTHETIC_UNAUTHORIZED', permissions: [] };

function deterministicClock() {
  let tick = 0;
  return () => new Date(Date.UTC(2026, 10, 23, 12, 0, tick++)).toISOString();
}

function deterministicFactory(prefix) {
  let sequence = 0;
  return () => `${prefix}${String(++sequence).padStart(20, '0')}`;
}

function makeFoundation(outcomes = []) {
  const transport = new SyntheticNotificationTransport(outcomes);
  const foundation = createB01Foundation({
    catalogEntries: [{ productGid: PRODUCT_GID, variantGid: VARIANT_GID }],
    transport,
    clock: deterministicClock(),
    identifiers: {
      recordId: deterministicFactory('rec_'),
      publicReference: deterministicFactory('ref_'),
      auditId: deterministicFactory('aud_'),
      notificationId: deterministicFactory('ntf_'),
      attemptId: deterministicFactory('att_'),
      resourceId: deterministicFactory('res_'),
      revisionId: deterministicFactory('rev_'),
      resourceAuditId: deterministicFactory('raud_'),
      domainEventId: deterministicFactory('evt_'),
    },
    technicalApprovalAuthority: {
      actorId: syntheticKevin.actorId,
      authorityRole: 'SYNTHETIC_KEVIN_TECHNICAL_APPROVER',
      synthetic: true,
    },
    systemActor: {
      actorId: 'B01_SYNTHETIC_SYSTEM',
      permissions: ['NOTIFICATION_QUEUE', 'NOTIFICATION_ATTEMPT', 'NOTIFICATION_RECOVERY'],
    },
    testMode: true,
  });
  return { ...foundation, transport };
}

let rejectedInvalidOperations = 0;
function expectCode(fn, code) {
  assert.throws(fn, (error) => error && error.code === code, `Expected error code ${code}`);
  rejectedInvalidOperations += 1;
}

const tests = [];
function test(name, run) {
  tests.push({ name, run });
}

function createPrivateRecord(foundation, commandId = 'create-private') {
  return foundation.privateRecords.create({
    actor: operator,
    commandId,
    category: 'REGISTRATION',
    state: 'RECEIVED',
    data: { customerReference: 'private_customer_123', policyVersion: 'SYNTHETIC' },
  });
}

function createResource(foundation, { customerCopyApproval = false } = {}) {
  return foundation.resources.createRevision({
    actor: operator,
    category: 'MANUAL',
    sourceIdentity: 'synthetic-source-revision-1',
    customerCopyApproval,
    applicability: {
      productGids: [PRODUCT_GID],
      variantGids: [VARIANT_GID],
      machineVersions: ['SYNTHETIC-MACHINE-V1'],
    },
  });
}

function queueNotification(foundation, commandId = 'queue-1') {
  return foundation.notifications.queue({
    actor: operator,
    commandId,
    domainEventId: `evt_${commandId.padEnd(20, '0')}`,
    destinationReference: DESTINATION,
    channel: 'SYNTHETIC_INTERNAL',
    messageClass: 'SYNTHETIC_ACKNOWLEDGEMENT',
  });
}

function disposition(overrides = {}) {
  return {
    responsibleAuthority: 'SYNTHETIC_AUTHORITY',
    authorityRole: 'SYNTHETIC_INCIDENT_DISPOSITION',
    reason: 'Synthetic hazard evidence reviewed',
    evidenceRefs: ['synthetic:evidence:1'],
    disposition: 'CLEARED_FOR_GOVERNED_SUPPORT',
    dispositionAt: '2026-11-23T14:00:00.000Z',
    ...overrides,
  };
}

test('unauthenticated and unauthorized private access is rejected', () => {
  const f = makeFoundation();
  const record = createPrivateRecord(f);
  expectCode(() => f.privateRecords.read({ actor: null, recordId: record.recordId }), 'AUTHORIZATION_REQUIRED');
  expectCode(() => f.privateRecords.read({ actor: unauthorized, recordId: record.recordId }), 'AUTHORIZATION_REQUIRED');
});

test('optimistic concurrency rejects lost updates', () => {
  const f = makeFoundation();
  const record = createPrivateRecord(f);
  f.privateRecords.update({ actor: operator, commandId: 'update-1', recordId: record.recordId, expectedVersion: 1, patch: { marker: 1 } });
  expectCode(() => f.privateRecords.update({ actor: operator, commandId: 'update-2', recordId: record.recordId, expectedVersion: 1, patch: { marker: 2 } }), 'RECORD_VERSION_CONFLICT');
});

test('repeated record commands are idempotent and conflicting reuse fails', () => {
  const f = makeFoundation();
  const first = createPrivateRecord(f, 'same-create');
  const repeated = createPrivateRecord(f, 'same-create');
  assert.deepEqual(repeated, first);
  expectCode(() => f.privateRecords.create({ actor: operator, commandId: 'same-create', category: 'SUPPORT_CASE', state: 'SUBMITTED', data: {} }), 'IDEMPOTENCY_KEY_REUSE');
});

test('public record handles do not disclose private references', () => {
  const f = makeFoundation();
  const record = createPrivateRecord(f);
  const handle = f.privateRecords.publicHandle(record.recordId);
  assert.equal(JSON.stringify(handle).includes('private_customer_123'), false);
  assert.equal(Object.hasOwn(handle, 'data'), false);
  assert.equal(record.retention.approvalStatus, 'BLOCKED_PENDING_PROCESSOR_AND_LEGAL_APPROVAL');
  assert.equal(record.retention.durableRetentionGuaranteed, false);
});

test('opaque identifier helper enforces at least 128 random bits', () => {
  expectCode(() => createOpaqueIdentifier(15), 'INSUFFICIENT_IDENTIFIER_ENTROPY');
  const identifier = createOpaqueIdentifier(16, 'reg_');
  assert.match(identifier, /^reg_[A-Za-z0-9_-]{22}$/);
});

test('invalid Product and Variant identities and relationships are rejected', () => {
  const f = makeFoundation();
  expectCode(() => f.catalog.assertRelationship('product-1', VARIANT_GID), 'INVALID_PRODUCT_GID');
  expectCode(() => f.catalog.assertRelationship(PRODUCT_GID, 'variant-1'), 'INVALID_VARIANT_GID');
  expectCode(() => f.catalog.assertRelationship(OTHER_PRODUCT_GID, VARIANT_GID), 'INVALID_PRODUCT_VARIANT_RELATIONSHIP');
});

test('resource revisions reject incomplete applicability', () => {
  const f = makeFoundation();
  expectCode(() => f.resources.createRevision({
    actor: operator,
    category: 'MANUAL',
    sourceIdentity: 'synthetic-source',
    applicability: { productGids: [PRODUCT_GID], variantGids: [VARIANT_GID], machineVersions: [] },
  }), 'MACHINE_VERSION_APPLICABILITY_REQUIRED');
});

test('missing configured Kevin approval blocks internal approval', () => {
  const f = makeFoundation();
  const revision = createResource(f);
  f.resources.submitTechnicalReview({ actor: operator, resourceId: revision.resourceId, revisionId: revision.revisionId });
  expectCode(() => f.resources.approveTechnical({ actor: operator, resourceId: revision.resourceId, revisionId: revision.revisionId, approvalEvidence: ['synthetic:evidence'] }), 'KEVIN_APPROVAL_REQUIRED');
});

test('unapproved resources and customer copy cannot be released', () => {
  const f = makeFoundation();
  const revision = createResource(f);
  expectCode(() => f.resources.releaseForCustomer({ actor: operator, resourceId: revision.resourceId, revisionId: revision.revisionId }), 'RESOURCE_NOT_TECHNICALLY_APPROVED');
  f.resources.submitTechnicalReview({ actor: operator, resourceId: revision.resourceId, revisionId: revision.revisionId });
  f.resources.approveTechnical({ actor: syntheticKevin, resourceId: revision.resourceId, revisionId: revision.revisionId, approvalEvidence: ['synthetic:evidence'] });
  expectCode(() => f.resources.releaseForCustomer({ actor: operator, resourceId: revision.resourceId, revisionId: revision.revisionId }), 'CUSTOMER_COPY_NOT_APPROVED');
});

test('approved internal resource still cannot cross disabled activation gate', () => {
  const f = makeFoundation();
  const revision = createResource(f, { customerCopyApproval: true });
  f.resources.submitTechnicalReview({ actor: operator, resourceId: revision.resourceId, revisionId: revision.revisionId });
  f.resources.approveTechnical({ actor: syntheticKevin, resourceId: revision.resourceId, revisionId: revision.revisionId, approvalEvidence: ['synthetic:evidence'] });
  expectCode(() => f.resources.releaseForCustomer({ actor: operator, resourceId: revision.resourceId, revisionId: revision.revisionId }), 'CUSTOMER_ACTIVATION_DISABLED');
});

test('superseded resource revisions retain immutable history and audit', () => {
  const f = makeFoundation();
  const first = createResource(f);
  const next = f.resources.supersede({
    actor: operator,
    resourceId: first.resourceId,
    previousRevisionId: first.revisionId,
    replacement: {
      category: 'MANUAL',
      sourceIdentity: 'synthetic-source-revision-2',
      applicability: { productGids: [PRODUCT_GID], variantGids: [VARIANT_GID], machineVersions: ['SYNTHETIC-MACHINE-V1'] },
    },
  });
  const history = f.resources.history(first.resourceId);
  assert.equal(history.length, 2);
  assert.equal(history[0].releaseStatus, 'RETIRED');
  assert.equal(history[0].supersededByRevisionId, next.revisionId);
  assert.equal(history[1].supersedesRevisionId, first.revisionId);
  assert.ok(f.resources.auditTrail().length >= 3);
});

test('notification delivery failure is not represented as success', () => {
  const f = makeFoundation([{ outcome: 'FAILED', reasonCode: 'SYNTHETIC_BOUNCE' }]);
  const queued = queueNotification(f);
  const attempted = f.notifications.attempt({ actor: operator, commandId: 'attempt-1', notificationId: queued.notificationId });
  assert.equal(attempted.state, 'DELIVERY_FAILED');
  assert.equal(attempted.deliveryEvidence, null);
});

test('transport exceptions become visible delivery failures without leaking exception data', () => {
  const f = makeFoundation();
  f.transport.deliver = () => { throw new Error('synthetic private transport detail'); };
  const queued = queueNotification(f, 'throwing-transport');
  const attempted = f.notifications.attempt({ actor: operator, commandId: 'throwing-attempt', notificationId: queued.notificationId });
  assert.equal(attempted.state, 'DELIVERY_FAILED');
  assert.equal(attempted.failure.reasonCode, 'TRANSPORT_EXCEPTION');
  assert.equal(JSON.stringify(attempted).includes('synthetic private transport detail'), false);
});

test('notification retries are idempotent and do not duplicate transport actions', () => {
  const f = makeFoundation([
    { outcome: 'FAILED', reasonCode: 'SYNTHETIC_FAILURE' },
    { outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:receipt:1' } },
  ]);
  const queued = queueNotification(f);
  f.notifications.attempt({ actor: operator, commandId: 'attempt-failed', notificationId: queued.notificationId });
  f.notifications.requireRecovery({ actor: operator, commandId: 'recovery-1', notificationId: queued.notificationId, reason: 'SYNTHETIC_RECOVERY' });
  const confirmed = f.notifications.attempt({ actor: operator, commandId: 'attempt-retry', notificationId: queued.notificationId });
  const repeated = f.notifications.attempt({ actor: operator, commandId: 'attempt-retry', notificationId: queued.notificationId });
  assert.equal(confirmed.state, 'DELIVERY_CONFIRMED');
  assert.deepEqual(repeated, confirmed);
  assert.equal(f.transport.calls.length, 2);
});

test('uncertain delivery remains unresolved until evidence reconciliation', () => {
  const f = makeFoundation([{ outcome: 'UNCERTAIN', reasonCode: 'SYNTHETIC_TIMEOUT' }]);
  const queued = queueNotification(f);
  const uncertain = f.notifications.attempt({ actor: operator, commandId: 'attempt-uncertain', notificationId: queued.notificationId });
  assert.equal(uncertain.state, 'RECOVERY_REQUIRED');
  expectCode(() => f.notifications.terminalDisposition({ actor: operator, commandId: 'terminal-uncertain', notificationId: queued.notificationId, disposition: 'ABANDONED', evidenceRefs: ['synthetic:evidence'] }), 'TERMINAL_DISPOSITION_NOT_ALLOWED');
  const reconciled = f.notifications.reconcile({ actor: operator, commandId: 'reconcile-confirmed', notificationId: queued.notificationId, outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:reconciled:1' } });
  assert.equal(reconciled.state, 'DELIVERY_CONFIRMED');
});

test('all approved ordinary support transitions execute from the committed contract', () => {
  const f = makeFoundation();
  for (const [index, transition] of f.safety.contract.stateMachine.ordinaryTransitions.entries()) {
    const record = f.safety.createCase({ actor: operator, commandId: `ordinary-create-${index}`, destinationReference: DESTINATION, initialState: transition.from });
    const result = f.safety.ordinaryTransition({ actor: operator, commandId: `ordinary-transition-${index}`, caseRecordId: record.recordId, expectedVersion: record.version, toState: transition.to });
    assert.equal(result.state, transition.to);
  }
});

test('each of ten relevant support states enters SAFETY_HOLD immediately', () => {
  const states = makeFoundation().safety.contract.stateMachine.globalSafetyInterruption.relevantNonterminalStates;
  assert.equal(states.length, 10);
  for (const [index, state] of states.entries()) {
    const f = makeFoundation([{ outcome: 'CONFIRMED', evidence: { providerReceipt: `synthetic:warning:${index}` } }]);
    const record = f.safety.createCase({ actor: operator, commandId: `hazard-create-${index}`, destinationReference: DESTINATION, initialState: state });
    const result = f.safety.interruptForHazard({
      actor: operator,
      commandId: `hazard-${index}`,
      caseRecordId: record.recordId,
      expectedVersion: record.version,
      hazard: { reportedAt: '2026-11-23T12:00:00.000Z', sourceChannel: 'SYNTHETIC_TEST', reportedSymptoms: 'Synthetic hazardous symptom' },
    });
    assert.equal(result.caseRecord.state, 'SAFETY_HOLD');
    assert.equal(result.caseRecord.data.safetyHoldActive, true);
    assert.equal(result.caseRecord.data.safetyInterruption.stopUseWarning.eventType, 'STATIC_STOP_USE_WARNING_GENERATED');
    assert.equal(result.caseRecord.data.safetyInterruption.stopUseWarning.deliveryStatus, 'DELIVERY_CONFIRMED');
  }
});

test('ordinary transitions cannot bypass an active safety hold', () => {
  const f = makeFoundation([{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:warning' } }]);
  const record = f.safety.createCase({ actor: operator, commandId: 'hold-create', destinationReference: DESTINATION, initialState: 'TRIAGED' });
  const held = f.safety.interruptForHazard({ actor: operator, commandId: 'hold-enter', caseRecordId: record.recordId, expectedVersion: 1, hazard: { reportedAt: '2026-11-23T12:00:00.000Z', sourceChannel: 'SYNTHETIC', reportedSymptoms: 'Synthetic hazard' } }).caseRecord;
  expectCode(() => f.safety.ordinaryTransition({ actor: operator, commandId: 'hold-bypass', caseRecordId: record.recordId, expectedVersion: held.version, toState: 'GUIDANCE_ACTIVE' }), 'ACTIVE_SAFETY_HOLD');
});

test('unauthorized and incomplete safety dispositions fail closed', () => {
  const f = makeFoundation([{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:warning' } }]);
  const record = f.safety.createCase({ actor: operator, commandId: 'disposition-create', destinationReference: DESTINATION, initialState: 'TRIAGED' });
  const held = f.safety.interruptForHazard({ actor: operator, commandId: 'disposition-hold', caseRecordId: record.recordId, expectedVersion: 1, hazard: { reportedAt: '2026-11-23T12:00:00.000Z', sourceChannel: 'SYNTHETIC', reportedSymptoms: 'Synthetic hazard' } }).caseRecord;
  expectCode(() => f.safety.authorizedSafetyDisposition({ actor: unauthorized, commandId: 'disposition-unauthorized', caseRecordId: record.recordId, expectedVersion: held.version, toState: 'TRIAGED', dispositionRecord: disposition() }), 'AUTHORIZATION_REQUIRED');
  expectCode(() => f.safety.authorizedSafetyDisposition({ actor: operator, commandId: 'disposition-incomplete', caseRecordId: record.recordId, expectedVersion: held.version, toState: 'TRIAGED', dispositionRecord: disposition({ evidenceRefs: [] }) }), 'SAFETY_DISPOSITION_EVIDENCE_REQUIRED');
});

test('authorized evidence-backed safety hold exit succeeds only to approved states', () => {
  const f = makeFoundation([{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:warning' } }]);
  const record = f.safety.createCase({ actor: operator, commandId: 'exit-create', destinationReference: DESTINATION, initialState: 'TRIAGED' });
  const held = f.safety.interruptForHazard({ actor: operator, commandId: 'exit-hold', caseRecordId: record.recordId, expectedVersion: 1, hazard: { reportedAt: '2026-11-23T12:00:00.000Z', sourceChannel: 'SYNTHETIC', reportedSymptoms: 'Synthetic hazard' } }).caseRecord;
  expectCode(() => f.safety.authorizedSafetyDisposition({ actor: operator, commandId: 'exit-invalid', caseRecordId: record.recordId, expectedVersion: held.version, toState: 'RESOLVED', dispositionRecord: disposition() }), 'UNAUTHORIZED_SAFETY_HOLD_EXIT');
  const exited = f.safety.authorizedSafetyDisposition({ actor: operator, commandId: 'exit-valid', caseRecordId: record.recordId, expectedVersion: held.version, toState: 'TRIAGED', dispositionRecord: disposition() });
  assert.equal(exited.state, 'TRIAGED');
  assert.equal(exited.data.safetyHoldActive, false);
});

test('warning delivery failure keeps safety hold active and records recovery', () => {
  const f = makeFoundation([{ outcome: 'FAILED', reasonCode: 'SYNTHETIC_FAILURE' }]);
  const record = f.safety.createCase({ actor: operator, commandId: 'warning-fail-create', destinationReference: DESTINATION, initialState: 'TRIAGED' });
  const result = f.safety.interruptForHazard({ actor: operator, commandId: 'warning-fail', caseRecordId: record.recordId, expectedVersion: 1, hazard: { reportedAt: '2026-11-23T12:00:00.000Z', sourceChannel: 'SYNTHETIC', reportedSymptoms: 'Synthetic hazard' } });
  assert.equal(result.caseRecord.state, 'SAFETY_HOLD');
  assert.equal(result.notification.state, 'RECOVERY_REQUIRED');
  assert.equal(result.caseRecord.data.unresolvedNotificationIds.length, 1);
  expectCode(() => f.safety.authorizedSafetyDisposition({ actor: operator, commandId: 'warning-fail-exit', caseRecordId: record.recordId, expectedVersion: result.caseRecord.version, toState: 'TRIAGED', dispositionRecord: disposition() }), 'WARNING_DELIVERY_UNRESOLVED');
});

test('notification failure blocks support resolution and closure', () => {
  for (const [index, stateAndTarget] of [['GUIDANCE_ACTIVE', 'RESOLVED'], ['RESOLVED', 'CLOSED']].entries()) {
    const f = makeFoundation([{ outcome: 'FAILED', reasonCode: 'SYNTHETIC_FAILURE' }]);
    const [state, target] = stateAndTarget;
    const record = f.safety.createCase({ actor: operator, commandId: `blocked-create-${index}`, destinationReference: DESTINATION, initialState: state });
    const queued = queueNotification(f, `blocked-queue-${index}`);
    f.notifications.attempt({ actor: operator, commandId: `blocked-attempt-${index}`, notificationId: queued.notificationId });
    const blocked = f.safety.recordNotificationRecovery({ actor: operator, commandId: `blocked-mark-${index}`, caseRecordId: record.recordId, expectedVersion: 1, notificationId: queued.notificationId });
    expectCode(() => f.safety.ordinaryTransition({ actor: operator, commandId: `blocked-transition-${index}`, caseRecordId: record.recordId, expectedVersion: blocked.version, toState: target }), 'UNRESOLVED_NOTIFICATION_BLOCKS_CASE_COMPLETION');
  }
});

test('case notification recovery clears only after evidenced reconciliation', () => {
  const f = makeFoundation([{ outcome: 'UNCERTAIN', reasonCode: 'SYNTHETIC_TIMEOUT' }]);
  const record = f.safety.createCase({ actor: operator, commandId: 'clear-create', destinationReference: DESTINATION, initialState: 'GUIDANCE_ACTIVE' });
  const queued = queueNotification(f, 'clear-queue');
  f.notifications.attempt({ actor: operator, commandId: 'clear-attempt', notificationId: queued.notificationId });
  const blocked = f.safety.recordNotificationRecovery({ actor: operator, commandId: 'clear-block', caseRecordId: record.recordId, expectedVersion: 1, notificationId: queued.notificationId });
  expectCode(() => f.safety.clearReconciledNotification({ actor: operator, commandId: 'clear-too-soon', caseRecordId: record.recordId, expectedVersion: blocked.version, notificationId: queued.notificationId }), 'NOTIFICATION_RECONCILIATION_INCOMPLETE');
  f.notifications.reconcile({ actor: operator, commandId: 'clear-reconcile', notificationId: queued.notificationId, outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:reconciled' } });
  const cleared = f.safety.clearReconciledNotification({ actor: operator, commandId: 'clear-valid', caseRecordId: record.recordId, expectedVersion: blocked.version, notificationId: queued.notificationId });
  assert.deepEqual(cleared.data.unresolvedNotificationIds, []);
  const resolved = f.safety.ordinaryTransition({ actor: operator, commandId: 'clear-resolve', caseRecordId: record.recordId, expectedVersion: cleared.version, toState: 'RESOLVED' });
  assert.equal(resolved.state, 'RESOLVED');
});

test('recovery cannot clear an active safety hold', () => {
  const f = makeFoundation([{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:warning' } }]);
  const record = f.safety.createCase({ actor: operator, commandId: 'recovery-create', destinationReference: DESTINATION, initialState: 'RECOVERY_REQUIRED' });
  const held = f.safety.interruptForHazard({ actor: operator, commandId: 'recovery-hold', caseRecordId: record.recordId, expectedVersion: 1, hazard: { reportedAt: '2026-11-23T12:00:00.000Z', sourceChannel: 'SYNTHETIC', reportedSymptoms: 'Synthetic hazard' } }).caseRecord;
  expectCode(() => f.safety.recover({ actor: operator, commandId: 'recovery-bypass', caseRecordId: record.recordId, expectedVersion: held.version }), 'RECOVERY_CANNOT_CLEAR_SAFETY_HOLD');
});

test('manufacturer escalation retains Rhino ownership and cannot close automatically', () => {
  const f = makeFoundation();
  const record = f.safety.createCase({ actor: operator, commandId: 'manufacturer-create', destinationReference: DESTINATION, initialState: 'TRIAGED' });
  const escalated = f.safety.ordinaryTransition({ actor: operator, commandId: 'manufacturer-escalate', caseRecordId: record.recordId, expectedVersion: 1, toState: 'MANUFACTURER_ESCALATED' });
  assert.equal(escalated.data.manufacturerDestination, 'Silica-Gem');
  assert.equal(escalated.data.rhinoCaseOwnershipRetained, true);
  assert.equal(escalated.data.rhinoCommunicationResponsibilityRetained, true);
  expectCode(() => f.safety.ordinaryTransition({ actor: operator, commandId: 'manufacturer-close', caseRecordId: record.recordId, expectedVersion: escalated.version, toState: 'CLOSED' }), 'UNKNOWN_OR_UNAUTHORIZED_TRANSITION');
});

test('unknown states, transitions, and transport outcomes fail closed', () => {
  const f = makeFoundation([{ outcome: 'MYSTERY' }]);
  expectCode(() => f.safety.createCase({ actor: operator, commandId: 'unknown-state', destinationReference: DESTINATION, initialState: 'UNKNOWN' }), 'UNKNOWN_SUPPORT_STATE');
  const record = f.safety.createCase({ actor: operator, commandId: 'unknown-create', destinationReference: DESTINATION, initialState: 'TRIAGED' });
  expectCode(() => f.safety.ordinaryTransition({ actor: operator, commandId: 'unknown-transition', caseRecordId: record.recordId, expectedVersion: 1, toState: 'CLOSED' }), 'UNKNOWN_OR_UNAUTHORIZED_TRANSITION');
  const queued = queueNotification(f, 'unknown-queue');
  expectCode(() => f.notifications.attempt({ actor: operator, commandId: 'unknown-attempt', notificationId: queued.notificationId }), 'UNKNOWN_TRANSPORT_OUTCOME');
});

test('customer activation remains disabled with all eight readiness blockers', () => {
  const f = makeFoundation();
  const gate = f.activationGate.snapshot();
  assert.equal(gate.customerActivationPermitted, false);
  assert.equal(gate.blockers.length, 8);
  expectCode(() => f.activationGate.assertPermitted('REGISTRATION_ACTIVATION'), 'CUSTOMER_ACTIVATION_DISABLED');
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

console.log(`Epic L Policy 2.0 B01 domain tests passed: ${passed}/${tests.length}`);
console.log(`B01 invalid operations rejected: ${rejectedInvalidOperations}`);
console.log('Safety contract coverage: 23 ordinary transitions; 10 hazard interruptions; authorized hold exit enforced.');
console.log('Operational activation: BLOCKED (8 readiness blockers retained).');
