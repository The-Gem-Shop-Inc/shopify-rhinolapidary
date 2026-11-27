'use strict';

const assert = require('node:assert/strict');
const {
  DisabledProductionSubmissionAuthenticator,
  InMemorySubmissionReceiptStore,
  SubmissionIngestionService,
  SyntheticSubmissionAuthenticator,
  createB08ASubmissionSystem,
} = require('./lib/epic-l-policy2');

const auth = { credential: 'synthetic-credential-b08a-customer-001' };
const diagnosticsActor = { actorId: 'SYNTHETIC_B08A_DIAGNOSTICS', permissions: ['SUBMISSION_DIAGNOSTICS_READ', 'SUBMISSION_AUDIT_READ'] };
const unauthorized = { actorId: 'SYNTHETIC_UNAUTHORIZED', permissions: [] };

function registrationEnvelope(system, deliveryId = 'syn_delivery_registration_001', overrides = {}) {
  const machine = system.catalogEntries[0];
  return {
    envelopeVersion: '1.0.0',
    submissionType: 'REGISTRATION',
    delivery: { transportId: 'SYNTHETIC_FORM_FIXTURE', deliveryId },
    payload: { productGid: machine.productGid, variantGid: machine.variantGid, productVersion: machine.productVersion, ...overrides },
  };
}

function supportEnvelope(deliveryId = 'syn_delivery_support_001', overrides = {}) {
  return {
    envelopeVersion: '1.0.0',
    submissionType: 'SUPPORT',
    delivery: { transportId: 'SYNTHETIC_FORM_FIXTURE', deliveryId },
    payload: { category: 'TECHNICAL_GUIDANCE', ...overrides },
  };
}

let rejectedInvalidOperations = 0;
function expectCode(run, code) {
  assert.throws(run, (error) => error?.code === code, `Expected ${code}`);
  rejectedInvalidOperations += 1;
}

const tests = [];
function test(name, run) { tests.push({ name, run }); }

test('registration envelope creates one governed registration with deterministic defaults', () => {
  const system = createB08ASubmissionSystem();
  const receipt = system.ingestion.ingest({ authentication: auth, envelope: registrationEnvelope(system) });
  assert.equal(receipt.state, 'COMPLETED');
  assert.equal(receipt.result.targetType, 'REGISTRATION');
  const record = system.registration.getPrivateRegistration({ actor: { actorId: system.syntheticPrincipal.principalId, customerReference: system.syntheticPrincipal.customerReference, permissions: ['REGISTRATION_READ_OWN'] }, registrationId: receipt.result.targetReference });
  assert.deepEqual(record.data.firstUseDeclaration, { state: 'UNKNOWN' });
  assert.equal(record.data.registrationPath, 'NEW_REGISTRATION');
  assert.equal(record.data.policyVersion, 'POLICY2_PROPOSED_NOT_EFFECTIVE');
  assert.deepEqual(record.data.purchaseEvidence, []);
});

test('incomplete support is accepted privately for clarification without a safe finding', () => {
  const system = createB08ASubmissionSystem();
  const receipt = system.ingestion.ingest({ authentication: auth, envelope: supportEnvelope() });
  const record = system.supportIntake.getPrivateCase({ actor: { actorId: system.syntheticPrincipal.principalId, customerReference: system.syntheticPrincipal.customerReference, permissions: ['SUPPORT_CASE_READ_OWN'] }, caseReference: receipt.result.targetReference });
  const intake = record.data.syntheticFacts.supportIntake;
  assert.equal(receipt.result.outcome, 'SAFETY_REVIEW_REQUIRED');
  assert.equal(intake.issueSummary, 'SYNTHETIC_CLARIFICATION_REQUIRED');
  assert.equal(intake.safetyDisclosure, 'AMBIGUOUS_REVIEW_REQUIRED');
  assert.equal(intake.safetyAssessment.automaticSafeFinding, false);
});

test('authenticated context supplies private identity and destination without duplicate entry', () => {
  const system = createB08ASubmissionSystem();
  const receipt = system.ingestion.ingest({ authentication: auth, envelope: registrationEnvelope(system, 'syn_delivery_context_001') });
  const record = system.registration.getPrivateRegistration({ actor: { actorId: 'SYNTHETIC_ADMIN', permissions: ['REGISTRATION_PRIVATE_READ'] }, registrationId: receipt.result.targetReference });
  assert.equal(record.data.customerReference, system.syntheticPrincipal.customerReference);
  assert.equal(record.data.notificationDestinationReference, system.syntheticPrincipal.notificationDestinationReference);
  assert.equal(JSON.stringify(registrationEnvelope(system, 'syn_delivery_context_002')).includes(system.syntheticPrincipal.customerReference), false);
});

test('identical transport redelivery is idempotent across receipt and domain records', () => {
  const system = createB08ASubmissionSystem();
  const envelope = registrationEnvelope(system, 'syn_delivery_idempotent_001');
  const first = system.ingestion.ingest({ authentication: auth, envelope });
  const repeated = system.ingestion.ingest({ authentication: auth, envelope });
  assert.deepEqual(repeated, first);
  assert.equal(system.receiptStore.receipts.size, 1);
  assert.equal(system.registration.recordIdsByRegistration.size, 1);
});

test('conflicting reuse of a delivery identity is rejected without a second record', () => {
  const system = createB08ASubmissionSystem();
  const envelope = registrationEnvelope(system, 'syn_delivery_conflict_001');
  system.ingestion.ingest({ authentication: auth, envelope });
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope: registrationEnvelope(system, 'syn_delivery_conflict_001', { productVersion: 'CONFLICT' }) }), 'CONFLICTING_DELIVERY_REUSE');
  assert.equal(system.registration.recordIdsByRegistration.size, 1);
});

test('domain success followed by receipt interruption converges on retry without duplication', () => {
  let interrupt = true;
  const system = createB08ASubmissionSystem({ afterDomainHook() { if (interrupt) { interrupt = false; throw Object.assign(new Error('synthetic interruption'), { code: 'SYNTHETIC_INTERRUPTION' }); } } });
  const envelope = registrationEnvelope(system, 'syn_delivery_retry_001');
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope }), 'SYNTHETIC_INTERRUPTION');
  assert.equal(system.registration.recordIdsByRegistration.size, 1);
  const completed = system.ingestion.ingest({ authentication: auth, envelope });
  assert.equal(completed.state, 'COMPLETED');
  assert.equal(completed.attemptCount, 2);
  assert.equal(system.registration.recordIdsByRegistration.size, 1);
  const audit = system.ingestion.auditTrail({ actor: diagnosticsActor, receiptId: completed.receiptId });
  assert.equal(audit.filter((event) => event.eventType === 'SUBMISSION_PROCESSING_STARTED').length, 2);
});

test('support ingestion composes registration context without inferring warranty eligibility', () => {
  const system = createB08ASubmissionSystem();
  const registration = system.ingestion.ingest({ authentication: auth, envelope: registrationEnvelope(system, 'syn_delivery_link_registration') });
  const support = system.ingestion.ingest({ authentication: auth, envelope: supportEnvelope('syn_delivery_link_support', { registrationId: registration.result.targetReference, hazardDisclosure: 'NOT_REPORTED' }) });
  const record = system.supportIntake.getPrivateCase({ actor: { actorId: system.syntheticPrincipal.principalId, customerReference: system.syntheticPrincipal.customerReference, permissions: ['SUPPORT_CASE_READ_OWN'] }, caseReference: support.result.targetReference });
  const context = record.data.syntheticFacts.supportIntake.registrationContext;
  assert.equal(context.status, 'AUTHORIZED_CONTEXT');
  assert.equal(context.eligibilityInferred, false);
  assert.equal(context.warrantyFinding, 'NOT_PERFORMED');
});

test('explicit hazard enters the existing private safety hold and performs no diagnosis', () => {
  const system = createB08ASubmissionSystem();
  const receipt = system.ingestion.ingest({ authentication: auth, envelope: supportEnvelope('syn_delivery_hazard_001', { hazardDisclosure: 'REPORTED', hazardEvidenceRef: 'synthetic:hazard:reported-symptoms' }) });
  const record = system.supportIntake.getPrivateCase({ actor: { actorId: 'SYNTHETIC_ADMIN', permissions: ['SUPPORT_CASE_PRIVATE_READ'] }, caseReference: receipt.result.targetReference });
  assert.equal(record.state, 'SAFETY_HOLD');
  assert.equal(record.data.safetyHoldActive, true);
  assert.equal(record.data.syntheticFacts.supportIntake.safetyAssessment.diagnosisPerformed, false);
});

test('registration defaults remain distinguishable from supplied human evidence', () => {
  const system = createB08ASubmissionSystem();
  const supplied = system.ingestion.ingest({ authentication: auth, envelope: registrationEnvelope(system, 'syn_delivery_supplied_001', { firstUseDeclaration: { state: 'DECLARED_DATE', declaredDate: '2026-11-20' }, registrationPath: 'PRIOR_PURCHASE_EXCEPTION' }) });
  const record = system.registration.getPrivateRegistration({ actor: { actorId: 'SYNTHETIC_ADMIN', permissions: ['REGISTRATION_PRIVATE_READ'] }, registrationId: supplied.result.targetReference });
  assert.equal(record.data.firstUseDeclaration.declaredDate, '2026-11-20');
  assert.equal(record.data.registrationPath, 'PRIOR_PURCHASE_EXCEPTION');
});

test('receipt response and restricted diagnostics minimize private data', () => {
  const system = createB08ASubmissionSystem();
  const receipt = system.ingestion.ingest({ authentication: auth, envelope: supportEnvelope('syn_delivery_minimized_001', { issueSummary: 'SYNTHETIC_PRIVATE_DETAIL_CODE' }) });
  const publicText = JSON.stringify(receipt);
  assert.equal(publicText.includes(system.syntheticPrincipal.customerReference), false);
  assert.equal(publicText.includes('SYNTHETIC_PRIVATE_DETAIL_CODE'), false);
  const diagnostics = system.ingestion.getRestrictedDiagnostics({ actor: diagnosticsActor, receiptId: receipt.receiptId });
  assert.equal(diagnostics.submissionPayloadIncluded, false);
  assert.equal(diagnostics.customerContactIncluded, false);
  assert.equal(JSON.stringify(diagnostics).includes('SYNTHETIC_PRIVATE_DETAIL_CODE'), false);
});

test('receipt diagnostics and audit require explicit independent permissions', () => {
  const system = createB08ASubmissionSystem();
  const receipt = system.ingestion.ingest({ authentication: auth, envelope: supportEnvelope('syn_delivery_diag_auth_001') });
  expectCode(() => system.ingestion.getRestrictedDiagnostics({ actor: unauthorized, receiptId: receipt.receiptId }), 'AUTHORIZATION_REQUIRED');
  expectCode(() => system.ingestion.auditTrail({ actor: unauthorized, receiptId: receipt.receiptId }), 'AUTHORIZATION_REQUIRED');
});

test('append-only receipt audit is returned as an immutable copy', () => {
  const system = createB08ASubmissionSystem();
  const receipt = system.ingestion.ingest({ authentication: auth, envelope: supportEnvelope('syn_delivery_audit_001') });
  const first = system.ingestion.auditTrail({ actor: diagnosticsActor, receiptId: receipt.receiptId });
  first[0].eventType = 'MUTATED';
  const second = system.ingestion.auditTrail({ actor: diagnosticsActor, receiptId: receipt.receiptId });
  assert.equal(second[0].eventType, 'SUBMISSION_RECEIVED');
  assert.ok(second.some((event) => event.eventType === 'SUBMISSION_COMPLETED'));
});

test('malformed domain input is terminal and leaves no partial registration mutation', () => {
  const system = createB08ASubmissionSystem();
  const envelope = registrationEnvelope(system, 'syn_delivery_invalid_domain_001', { productVersion: '' });
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope }), 'PRODUCT_VERSION_REQUIRED');
  assert.equal(system.registration.recordIdsByRegistration.size, 0);
  const receipt = [...system.receiptStore.receipts.values()][0];
  assert.equal(receipt.state, 'REJECTED');
  const repeated = system.ingestion.ingest({ authentication: auth, envelope });
  assert.equal(repeated.state, 'REJECTED');
  assert.equal(receipt.attempts.length, 1);
});

test('boundary rejects malformed envelopes before a receipt or domain mutation', () => {
  const system = createB08ASubmissionSystem();
  const malformed = registrationEnvelope(system, 'syn_delivery_malformed_001');
  malformed.claimedRole = 'PRODUCTION_ADMIN';
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope: malformed }), 'INVALID_SUBMISSION_ENVELOPE');
  assert.equal(system.receiptStore.receipts.size, 0);
  assert.equal(system.registration.recordIdsByRegistration.size, 0);
});

test('authentication context cannot contain self-asserted roles or permissions', () => {
  const system = createB08ASubmissionSystem();
  expectCode(() => system.ingestion.ingest({ authentication: { ...auth, role: 'ADMIN' }, envelope: supportEnvelope('syn_delivery_forged_auth_001') }), 'UNTRUSTED_AUTHENTICATION_CONTEXT');
  expectCode(() => system.ingestion.ingest({ authentication: { ...auth, permissions: ['SUPPORT_INTAKE_CREATE_FOR_CUSTOMER'] }, envelope: supportEnvelope('syn_delivery_forged_auth_002') }), 'UNTRUSTED_AUTHENTICATION_CONTEXT');
});

test('unknown credentials and production identity remain denied', () => {
  const system = createB08ASubmissionSystem();
  expectCode(() => system.ingestion.ingest({ authentication: { credential: 'unknown' }, envelope: supportEnvelope('syn_delivery_unknown_auth_001') }), 'SUBMISSION_AUTHENTICATION_REQUIRED');
  const production = new DisabledProductionSubmissionAuthenticator();
  expectCode(() => production.authenticate({ credential: 'anything' }), 'PRODUCTION_IDENTITY_BINDING_UNRESOLVED');
});

test('receipt cannot be read by a different authenticated principal', () => {
  const system = createB08ASubmissionSystem();
  const receipt = system.ingestion.ingest({ authentication: auth, envelope: supportEnvelope('syn_delivery_receipt_owner_001') });
  const otherAuthenticator = new SyntheticSubmissionAuthenticator({ testMode: true, principals: { other: { principalId: 'syn_principal_b08a_customer_002', customerReference: 'cus_synthetic_b08a_customer_002', notificationDestinationReference: 'dst_synthetic_b08a_customer_002', synthetic: true } } });
  const other = otherAuthenticator.authenticate({ credential: 'other' });
  expectCode(() => system.receiptStore.publicReceipt(receipt.receiptId, other), 'SUBMISSION_RECEIPT_ACCESS_DENIED');
});

test('unknown products variants and mismatched relationships fail in the canonical catalog', () => {
  const system = createB08ASubmissionSystem();
  const second = system.catalogEntries[1];
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope: registrationEnvelope(system, 'syn_delivery_bad_product_001', { productGid: 'gid://shopify/Product/999999999999' }) }), 'INVALID_PRODUCT_VARIANT_RELATIONSHIP');
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope: registrationEnvelope(system, 'syn_delivery_bad_variant_001', { variantGid: 'gid://shopify/ProductVariant/999999999999' }) }), 'INVALID_PRODUCT_VARIANT_RELATIONSHIP');
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope: registrationEnvelope(system, 'syn_delivery_mismatch_001', { variantGid: second.variantGid }) }), 'INVALID_PRODUCT_VARIANT_RELATIONSHIP');
});

test('safety and minimized-data validation fail closed', () => {
  const system = createB08ASubmissionSystem();
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope: supportEnvelope('syn_delivery_hazard_missing_001', { hazardDisclosure: 'REPORTED' }) }), 'HAZARD_EVIDENCE_REQUIRED');
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope: supportEnvelope('syn_delivery_contact_001', { issueSummary: 'SYNTHETIC_VALID_CODE', evidenceRefs: ['synthetic:email@example.com'] }) }), 'REAL_CUSTOMER_DATA_FORBIDDEN');
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope: supportEnvelope('syn_delivery_category_001', { category: 'AUTOMATIC_REFUND' }) }), 'UNKNOWN_SUPPORT_CATEGORY');
});

test('transport envelope rejects unknown live transports versions times and fields', () => {
  const system = createB08ASubmissionSystem();
  const live = supportEnvelope('syn_delivery_live_001'); live.delivery.transportId = 'SHOPIFY_FORMS_LIVE';
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope: live }), 'UNAUTHORIZED_SUBMISSION_TRANSPORT');
  const version = supportEnvelope('syn_delivery_version_001'); version.envelopeVersion = '2.0.0';
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope: version }), 'UNSUPPORTED_SUBMISSION_ENVELOPE_VERSION');
  const time = supportEnvelope('syn_delivery_time_001'); time.delivery.sourceEventAt = 'not-a-time';
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope: time }), 'INVALID_SOURCE_EVENT_TIME');
  const extra = supportEnvelope('syn_delivery_field_001'); extra.payload.customerReference = 'cus_forged_customer_reference';
  expectCode(() => system.ingestion.ingest({ authentication: auth, envelope: extra }), 'UNSUPPORTED_SUBMISSION_PAYLOAD');
});

test('external transport activation customer operations and publication remain unavailable', () => {
  const system = createB08ASubmissionSystem();
  expectCode(() => system.ingestion.assertOperationalActivationBlocked(), 'CUSTOMER_ACTIVATION_DISABLED');
  expectCode(() => system.ingestion.assertExternalTransportBlocked(), 'B08B_EXTERNAL_TRANSPORT_NOT_AUTHORIZED');
  expectCode(() => system.registration.assertCustomerActivationBlocked(), 'CUSTOMER_ACTIVATION_DISABLED');
  expectCode(() => system.supportIntake.assertCustomerActivationBlocked(), 'CUSTOMER_ACTIVATION_DISABLED');
  assert.equal(system.notifications.transport.calls.length, 0);
});

test('B08A has no dependency on resource administration persistence or archives', () => {
  const system = createB08ASubmissionSystem();
  system.ingestion.ingest({ authentication: auth, envelope: supportEnvelope('syn_delivery_independence_001') });
  assert.equal(system.resources.resourceRegistry?.length || 0, 0);
  assert.equal(JSON.stringify([...system.receiptStore.receipts.values()]).includes('Policy2ResourceAdmin'), false);
});

let passed = 0;
for (const { name, run } of tests) {
  try { run(); passed += 1; }
  catch (error) { console.error(`FAIL: ${name}`); throw error; }
}

console.log(`Epic L Policy 2.0 B08A submission ingestion tests passed: ${passed}/${tests.length}`);
console.log(`B08A invalid or unauthorized operations rejected: ${rejectedInvalidOperations}`);
console.log('Synthetic deliveries completed without live provider calls, Shopify mutations, customer decisions, customer notifications, or resource publications.');
