'use strict';

const assert = require('node:assert/strict');
const {
  SUPPORT_CATEGORIES,
  SyntheticNotificationTransport,
  SyntheticRoutingAdapter,
  SyntheticSupportRouteResolver,
  createB01Foundation,
} = require('./lib/epic-l-policy2');

const PRODUCT_GID = 'gid://shopify/Product/510000000001';
const VARIANT_GID = 'gid://shopify/ProductVariant/610000000001';
const CUSTOMER_A = 'cus_synthetic_support_customer_a';
const CUSTOMER_B = 'cus_synthetic_support_customer_b';
const DESTINATION_A = 'dst_synthetic_support_destination_a';

const customerPermissions = [
  'SUPPORT_INTAKE_CREATE', 'SUPPORT_CASE_READ_OWN', 'SUPPORT_ACKNOWLEDGE_OWN',
  'REGISTRATION_CREATE', 'REGISTRATION_READ_OWN',
];
const customerA = { actorId: 'SYNTHETIC_SUPPORT_CUSTOMER_A', customerReference: CUSTOMER_A, permissions: customerPermissions };
const customerB = { actorId: 'SYNTHETIC_SUPPORT_CUSTOMER_B', customerReference: CUSTOMER_B, permissions: customerPermissions };
const operator = {
  actorId: 'SYNTHETIC_SUPPORT_OPERATOR',
  permissions: [
    'SUPPORT_INTAKE_CREATE', 'SUPPORT_INTAKE_CREATE_FOR_CUSTOMER', 'SUPPORT_CASE_PRIVATE_READ', 'SUPPORT_CASE_AUDIT_READ',
    'SUPPORT_ACKNOWLEDGE', 'SUPPORT_RECOVER', 'SUPPORT_ROUTE_RESOLVE', 'SUPPORT_ROUTE_ATTEMPT', 'SUPPORT_CASE_TRANSITION',
    'SUPPORT_MANUFACTURER_REFERRAL_INTENT', 'REGISTRATION_PRIVATE_READ',
  ],
};
const reviewer = { actorId: 'SYNTHETIC_SUPPORT_REVIEWER', permissions: ['SUPPORT_ROUTE_HANDOFF_ACKNOWLEDGE', 'SUPPORT_CASE_PRIVATE_READ'] };
const safetyAuthority = { actorId: 'SYNTHETIC_SAFETY_AUTHORITY', permissions: ['SAFETY_DISPOSITION', 'SUPPORT_CASE_PRIVATE_READ'] };
const unauthorized = { actorId: 'SYNTHETIC_UNAUTHORIZED', permissions: [] };
const systemActor = {
  actorId: 'B03_SYNTHETIC_PRIVATE_SYSTEM',
  permissions: [
    'PRIVATE_RECORD_CREATE', 'PRIVATE_RECORD_READ', 'PRIVATE_RECORD_UPDATE', 'PRIVATE_AUDIT_READ',
    'NOTIFICATION_QUEUE', 'NOTIFICATION_ATTEMPT', 'NOTIFICATION_RECOVERY', 'NOTIFICATION_RECONCILE',
    'SUPPORT_CASE_CREATE', 'SAFETY_INTERRUPT', 'SAFETY_DISPOSITION',
  ],
};

function deterministicClock() {
  let tick = 0;
  return () => new Date(Date.UTC(2026, 10, 23, 18, 0, tick++)).toISOString();
}

function deterministicFactory(prefix) {
  let sequence = 0;
  return () => `${prefix}${String(++sequence).padStart(24, '0')}`;
}

function approvedRoutes() {
  return SUPPORT_CATEGORIES.map((category) => ({
    category,
    status: 'APPROVED',
    primaryReference: `staff_syn_primary_${category.toLowerCase()}`,
    backupReference: `staff_syn_backup_${category.toLowerCase()}`,
    destination: category === 'MANUFACTURER_REFERRAL' ? 'Silica-Gem' : `queue_syn_${category.toLowerCase()}`,
  }));
}

function makeFoundation({ notificationOutcomes = [], routeResolver, routingOutcomes = [], interruptionHook } = {}) {
  const transport = new SyntheticNotificationTransport(notificationOutcomes);
  const routingAdapter = new SyntheticRoutingAdapter(routingOutcomes);
  const foundation = createB01Foundation({
    catalogEntries: [{ productGid: PRODUCT_GID, variantGid: VARIANT_GID }],
    transport,
    clock: deterministicClock(),
    identifiers: {
      recordId: deterministicFactory('rec_'), publicReference: deterministicFactory('ref_'), auditId: deterministicFactory('aud_'),
      notificationId: deterministicFactory('ntf_'), attemptId: deterministicFactory('att_'), resourceId: deterministicFactory('res_'),
      revisionId: deterministicFactory('rev_'), resourceAuditId: deterministicFactory('raud_'), domainEventId: deterministicFactory('evt_'),
      registrationId: deterministicFactory('reg_'), acknowledgementEventId: deterministicFactory('ack_'), duplicateReviewId: deterministicFactory('dup_'),
      supportCaseReference: deterministicFactory('case_'), supportAcknowledgementEventId: deterministicFactory('sack_'), supportRoutingAttemptId: deterministicFactory('routeatt_'),
    },
    technicalApprovalAuthority: { actorId: 'SYNTHETIC_KEVIN_AUTHORITY', authorityRole: 'SYNTHETIC_TECHNICAL_APPROVER', synthetic: true },
    systemActor,
    supportRouteResolver: routeResolver,
    supportRoutingAdapter: routingAdapter,
    supportInterruptionHook: interruptionHook,
    testMode: true,
  });
  return { ...foundation, transport, routingAdapter };
}

function input(overrides = {}) {
  return {
    customerReference: CUSTOMER_A,
    notificationDestinationReference: DESTINATION_A,
    category: 'TECHNICAL_GUIDANCE',
    sourceChannel: 'SYNTHETIC_WEB_FORM',
    productGid: PRODUCT_GID,
    variantGid: VARIANT_GID,
    productVersion: 'MACHINE-V1',
    issueSummary: 'SYNTHETIC_SUPPORT_ISSUE',
    evidenceRefs: ['synthetic:support:evidence:1'],
    safetyDisclosure: 'NO_HAZARD_REPORTED',
    ...overrides,
  };
}

function create(foundation, commandId = 'case-create-1', overrides = {}, actor = customerA) {
  return foundation.supportIntake.createCase({ actor, commandId, input: input(overrides) });
}

function operatorRecord(foundation, caseReference) {
  return foundation.supportIntake.getPrivateCase({ actor: operator, caseReference });
}

function customerRecord(foundation, caseReference, actor = customerA) {
  return foundation.supportIntake.getPrivateCase({ actor, caseReference });
}

function acknowledge(foundation, caseReference, commandId = 'support-ack-create') {
  const record = operatorRecord(foundation, caseReference);
  foundation.supportIntake.createAcknowledgement({ actor: operator, commandId, caseReference, expectedVersion: record.version });
  return operatorRecord(foundation, caseReference);
}

function disposition() {
  return {
    responsibleAuthority: 'SYNTHETIC_SAFETY_AUTHORITY', authorityRole: 'SYNTHETIC_INCIDENT_AUTHORITY',
    authorityName: 'Kevin', authorityBindingStatus: 'VERIFIED_IDENTITY_BINDING', authorityEvidenceReference: 'synthetic:authority:kevin',
    reason: 'Synthetic hazard evidence reviewed', evidenceRefs: ['synthetic:safety:evidence'],
    disposition: 'CLEARED_FOR_GOVERNED_SUPPORT', dispositionAt: '2026-11-23T19:00:00.000Z',
  };
}

let rejectedInvalidOperations = 0;
function expectCode(fn, code) {
  assert.throws(fn, (error) => error && error.code === code, `Expected error code ${code}`);
  rejectedInvalidOperations += 1;
}

const tests = [];
function test(name, run) { tests.push({ name, run }); }

test('all five exact support categories create minimized private cases', () => {
  const f = makeFoundation();
  for (const [index, category] of SUPPORT_CATEGORIES.entries()) {
    const result = create(f, `category-${index}`, { category });
    assert.equal(result.case.state, 'SUBMITTED');
    assert.equal(result.case.data.syntheticFacts.supportIntake.category, category);
    assert.equal(result.case.data.syntheticFacts.supportIntake.classification.warrantyFinding, 'NOT_PERFORMED');
  }
});

test('unknown category, malformed identity, unsupported fields, and real contact data are rejected', () => {
  const f = makeFoundation();
  expectCode(() => create(f, 'unknown-category', { category: 'REPAIR_INTAKE' }), 'UNKNOWN_SUPPORT_CATEGORY');
  expectCode(() => create(f, 'bad-customer', { customerReference: 'customer@example.com' }), 'OPAQUE_CUSTOMER_REFERENCE_REQUIRED');
  expectCode(() => f.supportIntake.createCase({ actor: customerA, commandId: 'extra-field', input: { ...input(), paymentDetails: 'synthetic' } }), 'UNSUPPORTED_SUPPORT_INPUT');
  expectCode(() => create(f, 'real-contact', { issueSummary: 'SYNTHETIC_CALL_555-555-1212' }), 'REAL_CUSTOMER_DATA_FORBIDDEN');
  expectCode(() => create(f, 'partial-machine', { variantGid: undefined }), 'COMPLETE_MACHINE_IDENTITY_REQUIRED');
});

test('duplicate command is idempotent and conflicting command reuse fails', () => {
  const f = makeFoundation();
  const first = create(f, 'case-idempotent');
  const repeated = create(f, 'case-idempotent');
  assert.deepEqual(repeated, first);
  expectCode(() => create(f, 'case-idempotent', { category: 'PARTS_QUESTION' }), 'IDEMPOTENCY_KEY_REUSE');
});

test('unauthenticated creation and cross-customer creation are rejected', () => {
  const f = makeFoundation();
  expectCode(() => f.supportIntake.createCase({ actor: null, commandId: 'no-actor', input: input() }), 'AUTHORIZATION_REQUIRED');
  expectCode(() => create(f, 'cross-create', { customerReference: CUSTOMER_B }, customerA), 'SUPPORT_CUSTOMER_REFERENCE_MISMATCH');
});

test('private case access rejects unauthenticated, unauthorized, ID-only, and cross-customer callers', () => {
  const f = makeFoundation();
  const caseReference = create(f).case.data.syntheticFacts.supportIntake.caseReference;
  expectCode(() => f.supportIntake.getPrivateCase({ actor: null, caseReference }), 'SUPPORT_CASE_ACCESS_DENIED');
  expectCode(() => f.supportIntake.getPrivateCase({ actor: unauthorized, caseReference }), 'SUPPORT_CASE_ACCESS_DENIED');
  expectCode(() => f.supportIntake.getPrivateCase({ actor: customerB, caseReference }), 'SUPPORT_CASE_ACCESS_DENIED');
  expectCode(() => f.supportIntake.getPrivateCase({ actor: { actorId: 'KNOWS_CASE', permissions: ['SUPPORT_CASE_READ_OWN'] }, caseReference }), 'SUPPORT_CASE_ACCESS_DENIED');
});

test('public case handle reveals no private customer, machine, evidence, or routing data', () => {
  const f = makeFoundation();
  const caseReference = create(f).case.data.syntheticFacts.supportIntake.caseReference;
  const handle = f.supportIntake.getPublicHandle(caseReference);
  const serialized = JSON.stringify(handle);
  assert.equal(serialized.includes(CUSTOMER_A), false);
  assert.equal(serialized.includes(PRODUCT_GID), false);
  assert.equal(serialized.includes('synthetic:support:evidence'), false);
  assert.deepEqual(Object.keys(handle).sort(), ['caseReference', 'customerActivationPermitted', 'processingStatus']);
});

test('support intake proceeds without registration, serial, account history, or coverage finding', () => {
  const f = makeFoundation();
  const intake = create(f, 'no-registration', { registrationId: undefined }).case.data.syntheticFacts.supportIntake;
  assert.equal(intake.registrationContext.status, 'NOT_PROVIDED');
  assert.equal(intake.classification.warrantyFinding, 'NOT_PERFORMED');
  assert.equal(intake.externalBoundaries.warrantyDecision.status, 'NOT_PERFORMED');
});

test('authorized registration context is exact, read-only, audited, and creates no eligibility finding', () => {
  const f = makeFoundation();
  const registration = f.registration.createRegistration({ actor: customerA, commandId: 'registration-context', input: {
    customerReference: CUSTOMER_A, notificationDestinationReference: DESTINATION_A, productGid: PRODUCT_GID, variantGid: VARIANT_GID,
    productVersion: 'MACHINE-V1', policyVersion: 'POLICY2_PROPOSED_NOT_EFFECTIVE', firstUseDeclaration: { state: 'UNKNOWN' },
  } }).registration;
  const beforeVersion = registration.version;
  const result = create(f, 'case-with-registration', { registrationId: registration.data.registrationId });
  const context = result.case.data.syntheticFacts.supportIntake.registrationContext;
  assert.equal(context.status, 'AUTHORIZED_CONTEXT');
  assert.equal(context.machineIdentity.productGid, PRODUCT_GID);
  assert.equal(context.eligibilityInferred, false);
  assert.equal(operatorRecord(f, result.case.data.syntheticFacts.supportIntake.caseReference).data.syntheticFacts.supportIntake.classification.warrantyFinding, 'NOT_PERFORMED');
  assert.equal(f.registration.getPrivateRegistration({ actor: customerA, registrationId: registration.data.registrationId }).version, beforeVersion);
  assert.ok(f.registration.auditTrail({ actor: customerA, registrationId: registration.data.registrationId }).some((event) => event.eventType === 'RECORD_ACCESSED'));
});

test('inaccessible or other-customer registration reference produces only generic review', () => {
  const f = makeFoundation();
  const registration = f.registration.createRegistration({ actor: customerA, commandId: 'registration-private', input: {
    customerReference: CUSTOMER_A, notificationDestinationReference: DESTINATION_A, productGid: PRODUCT_GID, variantGid: VARIANT_GID,
    productVersion: 'PRIVATE-OWNER-MACHINE-V2', policyVersion: 'PROPOSED', firstUseDeclaration: { state: 'UNKNOWN' },
  } }).registration;
  const result = create(f, 'case-other-registration', { customerReference: CUSTOMER_B, notificationDestinationReference: 'dst_synthetic_support_destination_b', registrationId: registration.data.registrationId }, customerB);
  const context = result.case.data.syntheticFacts.supportIntake.registrationContext;
  assert.deepEqual(context, { status: 'REVIEW_REQUIRED', readOnly: true, eligibilityInferred: false });
  assert.equal(JSON.stringify(result.case).includes(registration.data.productVersion), false);
});

test('explicit hazardous intake immediately enters SAFETY_HOLD with separate warning evidence', () => {
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:warning' } }] });
  const result = create(f, 'hazard-confirmed', { safetyDisclosure: 'EXPLICIT_HAZARD', hazardEvidenceRef: 'synthetic:hazard:smoke' });
  assert.equal(result.case.state, 'SAFETY_HOLD');
  assert.equal(result.case.data.safetyInterruption.stopUseWarning.eventType, 'STATIC_STOP_USE_WARNING_GENERATED');
  assert.equal(result.case.data.safetyInterruption.stopUseWarning.deliveryStatus, 'DELIVERY_CONFIRMED');
  assert.equal(result.case.data.syntheticFacts.supportIntake.safetyAssessment.automaticSafeFinding, false);
});

test('failed warning delivery preserves safety hold and explicit recovery', () => {
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'FAILED', reasonCode: 'SYNTHETIC_FAILURE' }] });
  const result = create(f, 'hazard-failed', { safetyDisclosure: 'EXPLICIT_HAZARD', hazardEvidenceRef: 'synthetic:hazard:overheat' });
  assert.equal(result.case.state, 'SAFETY_HOLD');
  assert.equal(result.case.data.safetyInterruption.stopUseWarning.deliveryStatus, 'RECOVERY_REQUIRED');
  assert.ok(result.case.data.syntheticFacts.supportIntake.recoveryObligations.includes('STOP_USE_WARNING_DELIVERY_UNRESOLVED'));
  assert.equal(result.case.data.unresolvedNotificationIds.length, 1);
});

test('uncertain warning remains unresolved and is never represented as delivered', () => {
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'UNCERTAIN', reasonCode: 'SYNTHETIC_TIMEOUT' }] });
  const result = create(f, 'hazard-uncertain', { safetyDisclosure: 'EXPLICIT_HAZARD', hazardEvidenceRef: 'synthetic:hazard:noise' });
  assert.equal(result.case.state, 'SAFETY_HOLD');
  assert.equal(result.case.data.safetyInterruption.stopUseWarning.deliveryEvidence, null);
  assert.equal(result.case.data.safetyInterruption.stopUseWarning.deliveryStatus, 'RECOVERY_REQUIRED');
});

test('ambiguous safety information requires human review and never creates an automatic safe finding', () => {
  const f = makeFoundation();
  const result = create(f, 'hazard-ambiguous', { safetyDisclosure: 'AMBIGUOUS_REVIEW_REQUIRED' });
  const intake = result.case.data.syntheticFacts.supportIntake;
  assert.equal(result.intakeOutcome, 'SAFETY_REVIEW_REQUIRED');
  assert.equal(intake.safetyAssessment.status, 'HUMAN_REVIEW_REQUIRED');
  assert.equal(intake.safetyAssessment.automaticSafeFinding, false);
  assert.ok(intake.recoveryObligations.includes('SAFETY_INFORMATION_REVIEW_REQUIRED'));
});

test('interrupted hazardous intake restores safety hold before normal processing', () => {
  let interrupted = false;
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:warning' } }], interruptionHook(stage) { if (stage === 'AFTER_CASE_PERSISTED' && !interrupted) { interrupted = true; throw Object.assign(new Error('synthetic interruption'), { code: 'SYNTHETIC_INTERRUPTION' }); } } });
  expectCode(() => create(f, 'hazard-interrupted', { safetyDisclosure: 'EXPLICIT_HAZARD', hazardEvidenceRef: 'synthetic:hazard:interrupted' }), 'SYNTHETIC_INTERRUPTION');
  const recovered = create(f, 'hazard-interrupted', { safetyDisclosure: 'EXPLICIT_HAZARD', hazardEvidenceRef: 'synthetic:hazard:interrupted' });
  assert.equal(recovered.case.state, 'SAFETY_HOLD');
});

test('ordinary routing and transitions cannot bypass an active safety hold', () => {
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:warning' } }], routeResolver: new SyntheticSupportRouteResolver(approvedRoutes()) });
  const result = create(f, 'hazard-routing', { safetyDisclosure: 'EXPLICIT_HAZARD', hazardEvidenceRef: 'synthetic:hazard:routing' });
  const caseReference = result.case.data.syntheticFacts.supportIntake.caseReference;
  let record = f.supportIntake.resolveRoutingIntent({ actor: operator, commandId: 'hazard-route-resolve', caseReference, expectedVersion: result.case.version });
  assert.equal(record.data.syntheticFacts.supportIntake.routing.status, 'BLOCKED_SAFETY_HOLD');
  expectCode(() => f.supportIntake.attemptRouting({ actor: operator, commandId: 'hazard-route-attempt', caseReference, expectedVersion: record.version }), 'ACTIVE_SAFETY_HOLD');
  expectCode(() => f.supportIntake.transitionCase({ actor: operator, commandId: 'hazard-route-transition', caseReference, expectedVersion: record.version, toState: 'TRIAGED' }), 'ACTIVE_SAFETY_HOLD');
});

test('safety disposition requires distinct authority and complete evidence', () => {
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:warning' } }] });
  const result = create(f, 'hazard-disposition', { safetyDisclosure: 'EXPLICIT_HAZARD', hazardEvidenceRef: 'synthetic:hazard:disposition' });
  const caseReference = result.case.data.syntheticFacts.supportIntake.caseReference;
  expectCode(() => f.supportIntake.authorizedSafetyDisposition({ actor: operator, commandId: 'hazard-disposition-unauthorized', caseReference, expectedVersion: result.case.version, toState: 'TRIAGED', dispositionRecord: disposition() }), 'AUTHORIZATION_REQUIRED');
  expectCode(() => f.supportIntake.authorizedSafetyDisposition({ actor: safetyAuthority, commandId: 'hazard-disposition-missing', caseReference, expectedVersion: result.case.version, toState: 'TRIAGED', dispositionRecord: { ...disposition(), evidenceRefs: [] } }), 'SAFETY_DISPOSITION_EVIDENCE_REQUIRED');
  const cleared = f.supportIntake.authorizedSafetyDisposition({ actor: safetyAuthority, commandId: 'hazard-disposition-valid', caseReference, expectedVersion: result.case.version, toState: 'TRIAGED', dispositionRecord: disposition() });
  assert.equal(cleared.state, 'TRIAGED');
});

test('existing ten-state global safety interruption remains intact', () => {
  const f = makeFoundation();
  assert.equal(f.safety.contract.stateMachine.globalSafetyInterruption.relevantNonterminalStates.length, 10);
  assert.equal(f.safety.contract.stateMachine.globalSafetyInterruption.transitions.length, 10);
});

test('default routing remains unresolved and invents no staff assignments', () => {
  const f = makeFoundation();
  const result = create(f);
  const caseReference = result.case.data.syntheticFacts.supportIntake.caseReference;
  const record = f.supportIntake.resolveRoutingIntent({ actor: operator, commandId: 'route-unresolved', caseReference, expectedVersion: result.case.version });
  const routing = record.data.syntheticFacts.supportIntake.routing;
  assert.equal(routing.status, 'PENDING_CONFIGURATION');
  assert.equal(routing.configuredPrimary, null);
  assert.equal(routing.assignedOwner, null);
  assert.ok(record.data.syntheticFacts.supportIntake.recoveryObligations.includes('ROUTING_CONFIGURATION_UNRESOLVED'));
});

test('all five categories resolve only against explicit approved synthetic routes', () => {
  const f = makeFoundation({ routeResolver: new SyntheticSupportRouteResolver(approvedRoutes()) });
  for (const [index, category] of SUPPORT_CATEGORIES.entries()) {
    const result = create(f, `route-category-${index}`, { category });
    const caseReference = result.case.data.syntheticFacts.supportIntake.caseReference;
    const record = f.supportIntake.resolveRoutingIntent({ actor: operator, commandId: `route-resolve-${index}`, caseReference, expectedVersion: result.case.version });
    const routing = record.data.syntheticFacts.supportIntake.routing;
    assert.equal(routing.status, 'ELIGIBLE');
    assert.equal(routing.assignedOwner, null);
    assert.match(routing.configuredPrimary, /^staff_syn_/);
  }
});

test('route attempt and human handoff acknowledgement are distinct', () => {
  const f = makeFoundation({ routeResolver: new SyntheticSupportRouteResolver(approvedRoutes()), routingOutcomes: [{ outcome: 'QUEUED', evidence: { queueReceipt: 'synthetic:route:queued' } }] });
  const result = create(f, 'route-handoff');
  const caseReference = result.case.data.syntheticFacts.supportIntake.caseReference;
  let record = f.supportIntake.resolveRoutingIntent({ actor: operator, commandId: 'route-handoff-resolve', caseReference, expectedVersion: result.case.version });
  record = f.supportIntake.attemptRouting({ actor: operator, commandId: 'route-handoff-attempt', caseReference, expectedVersion: record.version });
  assert.equal(record.data.syntheticFacts.supportIntake.routing.handoffStatus, 'NOT_ACKNOWLEDGED');
  assert.equal(record.data.syntheticFacts.supportIntake.routing.assignedOwner, null);
  record = f.supportIntake.acknowledgeRoutingHandoff({ actor: reviewer, commandId: 'route-handoff-ack', caseReference, expectedVersion: record.version, evidenceRefs: ['synthetic:route:handoff'] });
  assert.equal(record.data.syntheticFacts.supportIntake.routing.handoffStatus, 'ACKNOWLEDGED');
  assert.match(record.data.syntheticFacts.supportIntake.routing.assignedOwner, /^staff_syn_/);
});

test('failed and uncertain routing produce recovery without erasing case', () => {
  for (const [index, outcome] of ['FAILED', 'UNCERTAIN'].entries()) {
    const f = makeFoundation({ routeResolver: new SyntheticSupportRouteResolver(approvedRoutes()), routingOutcomes: [{ outcome }] });
    const result = create(f, `route-fail-case-${index}`);
    const caseReference = result.case.data.syntheticFacts.supportIntake.caseReference;
    let record = f.supportIntake.resolveRoutingIntent({ actor: operator, commandId: `route-fail-resolve-${index}`, caseReference, expectedVersion: result.case.version });
    record = f.supportIntake.attemptRouting({ actor: operator, commandId: `route-fail-attempt-${index}`, caseReference, expectedVersion: record.version });
    assert.equal(record.state, 'RECOVERY_REQUIRED');
    assert.equal(record.data.syntheticFacts.supportIntake.routing.status, 'RECOVERY_REQUIRED');
    assert.ok(record.data.syntheticFacts.supportIntake.recoveryObligations.includes('ROUTING_DELIVERY_UNRESOLVED'));
  }
});

test('acknowledgement is idempotent, queued is not delivered, and wording has no promises', () => {
  const f = makeFoundation();
  const caseReference = create(f).case.data.syntheticFacts.supportIntake.caseReference;
  const version = operatorRecord(f, caseReference).version;
  const first = f.supportIntake.createAcknowledgement({ actor: operator, commandId: 'ack-idempotent', caseReference, expectedVersion: version });
  const repeated = f.supportIntake.createAcknowledgement({ actor: operator, commandId: 'ack-idempotent', caseReference, expectedVersion: version });
  assert.deepEqual(repeated, first);
  assert.equal(first.acknowledgementStatus, 'NOTIFICATION_QUEUED');
  assert.equal(first.policyPromiseAuthorized, false);
  assert.equal(first.staffAssignmentConfirmed, false);
  assert.equal(first.continuousMonitoringImplied, false);
  assert.equal(f.transport.calls.length, 0);
});

test('failed acknowledgement remains recoverable and blocks prohibited resolution', () => {
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'FAILED', reasonCode: 'SYNTHETIC_FAILURE' }] });
  const caseReference = create(f).case.data.syntheticFacts.supportIntake.caseReference;
  let record = acknowledge(f, caseReference);
  record = f.supportIntake.attemptAcknowledgementDelivery({ actor: operator, commandId: 'ack-failed', caseReference, expectedVersion: record.version });
  assert.equal(record.state, 'RECOVERY_REQUIRED');
  assert.equal(record.data.syntheticFacts.supportIntake.acknowledgement.status, 'RECOVERY_REQUIRED');
  record = f.supportIntake.transitionCase({ actor: operator, commandId: 'ack-failed-triage', caseReference, expectedVersion: record.version, toState: 'TRIAGED' });
  record = f.supportIntake.transitionCase({ actor: operator, commandId: 'ack-failed-guidance', caseReference, expectedVersion: record.version, toState: 'GUIDANCE_ACTIVE' });
  expectCode(() => f.supportIntake.transitionCase({ actor: operator, commandId: 'ack-failed-resolve', caseReference, expectedVersion: record.version, toState: 'RESOLVED' }), 'UNRESOLVED_NOTIFICATION_BLOCKS_CASE_COMPLETION');
});

test('uncertain acknowledgement requires evidence reconciliation', () => {
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'UNCERTAIN', reasonCode: 'SYNTHETIC_TIMEOUT' }] });
  const caseReference = create(f).case.data.syntheticFacts.supportIntake.caseReference;
  let record = acknowledge(f, caseReference);
  record = f.supportIntake.attemptAcknowledgementDelivery({ actor: operator, commandId: 'ack-uncertain', caseReference, expectedVersion: record.version });
  assert.equal(record.data.syntheticFacts.supportIntake.acknowledgement.deliveryEvidence, null);
  record = f.supportIntake.recoverAcknowledgement({ actor: operator, commandId: 'ack-reconcile', caseReference, expectedVersion: record.version, action: 'RECONCILE', reconciliation: { outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:support:reconciled' } } });
  assert.equal(record.data.syntheticFacts.supportIntake.acknowledgement.status, 'DELIVERY_CONFIRMED');
  assert.equal(record.data.unresolvedNotificationIds.length, 0);
});

test('interrupted acknowledgement queue resumes without duplicate obligation', () => {
  let interrupted = false;
  const f = makeFoundation({ interruptionHook(stage) { if (stage === 'AFTER_SUPPORT_ACKNOWLEDGEMENT_QUEUED' && !interrupted) { interrupted = true; throw Object.assign(new Error('synthetic interruption'), { code: 'SYNTHETIC_INTERRUPTION' }); } } });
  const caseReference = create(f).case.data.syntheticFacts.supportIntake.caseReference;
  let record = operatorRecord(f, caseReference);
  expectCode(() => f.supportIntake.createAcknowledgement({ actor: operator, commandId: 'ack-interrupted', caseReference, expectedVersion: record.version }), 'SYNTHETIC_INTERRUPTION');
  record = operatorRecord(f, caseReference);
  assert.equal(record.data.syntheticFacts.supportIntake.acknowledgement.status, 'CREATED');
  record = f.supportIntake.recoverAcknowledgement({ actor: operator, commandId: 'ack-interrupted-recover', caseReference, expectedVersion: record.version, action: 'RESUME_QUEUE' });
  assert.equal(record.data.syntheticFacts.supportIntake.acknowledgement.status, 'NOTIFICATION_QUEUED');
  assert.equal(record.data.syntheticFacts.supportIntake.acknowledgement.history.filter((entry) => entry.status === 'NOTIFICATION_QUEUED').length, 1);
});

test('manufacturer referral remains proposed, retains Rhino responsibility, and cannot close case', () => {
  const f = makeFoundation();
  const result = create(f, 'manufacturer-case', { category: 'MANUFACTURER_REFERRAL' });
  const caseReference = result.case.data.syntheticFacts.supportIntake.caseReference;
  let record = f.supportIntake.recordManufacturerReferralIntent({ actor: operator, commandId: 'manufacturer-intent', caseReference, expectedVersion: result.case.version, evidencePackageReference: 'synthetic:manufacturer:evidence', rhinoFollowUpReference: 'staff_syn_followup_owner' });
  const referral = record.data.syntheticFacts.supportIntake.externalBoundaries.manufacturerReferral;
  assert.equal(referral.destination, 'Silica-Gem');
  assert.equal(referral.status, 'PROPOSED_NOT_SUBMITTED');
  assert.equal(referral.externalSubmissionPerformed, false);
  assert.equal(referral.rhinoCaseOwnershipRetained, true);
  expectCode(() => f.supportIntake.transitionCase({ actor: operator, commandId: 'manufacturer-ack-bypass', caseReference, expectedVersion: record.version, toState: 'ACKNOWLEDGED' }), 'SUPPORT_ACKNOWLEDGEMENT_REQUIRED');
  f.supportIntake.createAcknowledgement({ actor: operator, commandId: 'manufacturer-ack', caseReference, expectedVersion: record.version });
  record = operatorRecord(f, caseReference);
  record = f.supportIntake.transitionCase({ actor: operator, commandId: 'manufacturer-triage', caseReference, expectedVersion: record.version, toState: 'TRIAGED' });
  record = f.supportIntake.transitionCase({ actor: operator, commandId: 'manufacturer-escalate', caseReference, expectedVersion: record.version, toState: 'MANUFACTURER_ESCALATED' });
  assert.equal(record.data.rhinoCaseOwnershipRetained, true);
  expectCode(() => f.supportIntake.transitionCase({ actor: operator, commandId: 'manufacturer-close', caseReference, expectedVersion: record.version, toState: 'CLOSED' }), 'UNKNOWN_OR_UNAUTHORIZED_TRANSITION');
});

test('carrier claim remains classified only with no API, compensation, insurance, or checkout action', () => {
  const f = makeFoundation();
  const intake = create(f, 'carrier-case', { category: 'SHIPPING_CLAIM' }).case.data.syntheticFacts.supportIntake;
  assert.equal(intake.externalBoundaries.carrierClaim.status, 'CLASSIFIED_ONLY');
  assert.equal(intake.externalBoundaries.carrierClaim.externalSubmissionPerformed, false);
  assert.equal(intake.externalBoundaries.carrierClaim.compensationDecision, null);
  assert.equal(intake.externalBoundaries.carrierClaim.checkoutModified, false);
});

test('warranty and technical guidance boundaries prohibit automated decisions and diagnosis', () => {
  const f = makeFoundation();
  const warranty = create(f, 'warranty-case', { category: 'WARRANTY_DECISION' }).case.data.syntheticFacts.supportIntake;
  const technical = create(f, 'technical-case', { category: 'TECHNICAL_GUIDANCE' }).case.data.syntheticFacts.supportIntake;
  assert.equal(warranty.externalBoundaries.warrantyDecision.status, 'NOT_PERFORMED');
  assert.equal(warranty.externalBoundaries.warrantyDecision.approval, null);
  assert.equal(warranty.externalBoundaries.warrantyDecision.denial, null);
  assert.equal(technical.externalBoundaries.technicalGuidance.status, 'NOT_GENERATED');
  assert.equal(technical.externalBoundaries.technicalGuidance.autonomousDiagnosis, false);
});

test('audit history remains immutable after retries and recovery', () => {
  const f = makeFoundation();
  const caseReference = create(f).case.data.syntheticFacts.supportIntake.caseReference;
  acknowledge(f, caseReference);
  const first = f.supportIntake.auditTrail({ actor: operator, caseReference });
  first[0].eventType = 'MUTATED';
  const second = f.supportIntake.auditTrail({ actor: operator, caseReference });
  assert.notEqual(second[0].eventType, 'MUTATED');
  assert.ok(second.length >= 3);
});

test('no production provider or customer activation can be invoked', () => {
  const f = makeFoundation();
  expectCode(() => f.supportIntake.assertCustomerActivationBlocked(), 'CUSTOMER_ACTIVATION_DISABLED');
  assert.equal(f.routingAdapter.calls.length, 0);
  assert.equal(f.transport.calls.length, 0);
  assert.equal(f.resources.resourceRegistry?.length || 0, 0);
});

let passed = 0;
for (const { name, run } of tests) {
  try { run(); passed += 1; }
  catch (error) { console.error(`FAIL: ${name}`); throw error; }
}

console.log(`Epic L Policy 2.0 B03 support intake tests passed: ${passed}/${tests.length}`);
console.log(`B03 invalid operations rejected: ${rejectedInvalidOperations}`);
console.log('Support categories exercised: 5/5; safety interruption states preserved: 10/10.');
console.log('Support activation: BLOCKED; warranty and diagnostic decisions: NOT PERFORMED.');
