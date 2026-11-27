'use strict';

const {
  AuthorizationError,
  ConflictError,
  ValidationError,
  clone,
  createOpaqueIdentifier,
  deepFreeze,
  requireAuthorization,
  requireValue,
  stableStringify,
} = require('./common');

const SUBMISSION_ENVELOPE_VERSION = '1.0.0';
const SUBMISSION_TYPES = Object.freeze(['REGISTRATION', 'SUPPORT']);
const RECEIPT_STATES = Object.freeze(['RECEIVED', 'PROCESSING', 'RETRY_REQUIRED', 'REJECTED', 'COMPLETED']);
const SYNTHETIC_TRANSPORTS = Object.freeze(['SYNTHETIC_FORM_FIXTURE', 'SYNTHETIC_API_FIXTURE']);

function exactKeys(value, allowed, code, label) {
  requireValue(value && typeof value === 'object' && !Array.isArray(value), code, `${label} must be an object`);
  requireValue(Object.keys(value).every((key) => allowed.includes(key)), code, `${label} contains unsupported fields`);
}

function payloadDigest(envelope) {
  return require('node:crypto').createHash('sha256').update(stableStringify(envelope)).digest('hex');
}

class SyntheticSubmissionAuthenticator {
  constructor({ principals = {}, testMode = false } = {}) {
    requireValue(testMode === true, 'SYNTHETIC_AUTHENTICATOR_FORBIDDEN', 'Synthetic submission authentication requires explicit test mode');
    this.principals = new Map(Object.entries(principals).map(([credential, principal]) => [credential, deepFreeze(clone(principal))]));
    this.synthetic = true;
  }

  authenticate(context) {
    exactKeys(context, ['credential'], 'UNTRUSTED_AUTHENTICATION_CONTEXT', 'Authentication context');
    const principal = this.principals.get(context.credential);
    if (!principal) throw new AuthorizationError('SUBMISSION_AUTHENTICATION_REQUIRED', 'Submission authentication failed');
    requireValue(principal.synthetic === true && /^syn_principal_[A-Za-z0-9_-]{8,}$/.test(principal.principalId || ''), 'INVALID_SYNTHETIC_PRINCIPAL', 'Synthetic principal binding is invalid');
    requireValue(/^cus_[A-Za-z0-9_-]{16,}$/.test(principal.customerReference || ''), 'OPAQUE_CUSTOMER_REFERENCE_REQUIRED', 'Authenticated principal requires an opaque customer reference');
    requireValue(/^dst_[A-Za-z0-9_-]{16,}$/.test(principal.notificationDestinationReference || ''), 'OPAQUE_DESTINATION_REQUIRED', 'Authenticated principal requires an opaque destination reference');
    return clone(principal);
  }
}

class DisabledProductionSubmissionAuthenticator {
  constructor() { this.synthetic = false; }
  authenticate() {
    throw new AuthorizationError('PRODUCTION_IDENTITY_BINDING_UNRESOLVED', 'Production submission identity binding is not authorized in B08A');
  }
}

class InMemorySubmissionReceiptStore {
  constructor({
    authorize = () => false,
    clock = () => new Date().toISOString(),
    receiptIdFactory = () => createOpaqueIdentifier(16, 'subrcpt_'),
    correlationIdFactory = () => createOpaqueIdentifier(16, 'corr_'),
    commandIdFactory = () => createOpaqueIdentifier(16, 'subcmd_'),
    attemptIdFactory = () => createOpaqueIdentifier(16, 'subatt_'),
    auditIdFactory = () => createOpaqueIdentifier(16, 'subaud_'),
  } = {}) {
    this.authorize = authorize;
    this.clock = clock;
    this.receiptIdFactory = receiptIdFactory;
    this.correlationIdFactory = correlationIdFactory;
    this.commandIdFactory = commandIdFactory;
    this.attemptIdFactory = attemptIdFactory;
    this.auditIdFactory = auditIdFactory;
    this.receipts = new Map();
    this.receiptIdsByDelivery = new Map();
    this.audit = new Map();
  }

  open({ principal, transportId, deliveryId, digest, submissionType }) {
    const deliveryKey = `${transportId}:${deliveryId}`;
    const existingId = this.receiptIdsByDelivery.get(deliveryKey);
    if (existingId) {
      const existing = this.receipts.get(existingId);
      if (existing.payloadDigest !== digest) {
        throw new ConflictError('CONFLICTING_DELIVERY_REUSE', 'Transport delivery identity was reused with different content', { receiptId: existing.receiptId });
      }
      return { receipt: clone(existing), created: false };
    }
    const now = this.clock();
    const receipt = deepFreeze({
      receiptId: this.receiptIdFactory(),
      correlationId: this.correlationIdFactory(),
      domainCommandId: this.commandIdFactory(),
      transportId,
      deliveryId,
      payloadDigest: digest,
      submissionType,
      principalReference: principal.principalId,
      customerReference: principal.customerReference,
      state: 'RECEIVED',
      version: 1,
      receivedAt: now,
      modifiedAt: now,
      attempts: [],
      result: null,
      restrictedDiagnostic: null,
      productionAuthority: false,
    });
    requireValue(!this.receipts.has(receipt.receiptId), 'DUPLICATE_RECEIPT_ID', 'Submission receipt identity must be unique');
    this.receipts.set(receipt.receiptId, receipt);
    this.receiptIdsByDelivery.set(deliveryKey, receipt.receiptId);
    this.appendAudit(receipt.receiptId, principal.principalId, 'SUBMISSION_RECEIVED', { submissionType, transportId, payloadDigest: digest });
    return { receipt: clone(receipt), created: true };
  }

  beginAttempt(receiptId) {
    const current = this.requireReceipt(receiptId);
    requireValue(['RECEIVED', 'RETRY_REQUIRED', 'PROCESSING'].includes(current.state), 'SUBMISSION_NOT_RETRYABLE', 'Submission is not available for processing');
    if (current.state === 'PROCESSING' && current.attempts.at(-1)?.status === 'STARTED') return clone(current);
    const attempt = { attemptId: this.attemptIdFactory(), sequence: current.attempts.length + 1, startedAt: this.clock(), status: 'STARTED' };
    return this.replace(current, { state: 'PROCESSING', attempts: [...current.attempts, attempt], restrictedDiagnostic: null }, 'SUBMISSION_PROCESSING_STARTED', { attemptId: attempt.attemptId });
  }

  complete(receiptId, result) {
    const current = this.requireReceipt(receiptId);
    if (current.state === 'COMPLETED') return clone(current);
    requireValue(current.state === 'PROCESSING', 'SUBMISSION_NOT_PROCESSING', 'Only a processing submission may complete');
    const attempts = current.attempts.map((attempt, index) => index === current.attempts.length - 1
      ? { ...attempt, status: 'COMPLETED', completedAt: this.clock() }
      : attempt);
    return this.replace(current, { state: 'COMPLETED', attempts, result: clone(result), restrictedDiagnostic: null }, 'SUBMISSION_COMPLETED', { targetType: result.targetType, targetReference: result.targetReference });
  }

  fail(receiptId, error, retryable) {
    const current = this.requireReceipt(receiptId);
    const state = retryable ? 'RETRY_REQUIRED' : 'REJECTED';
    const code = error?.code || 'SUBMISSION_PROCESSING_FAILURE';
    const attempts = current.attempts.map((attempt, index) => index === current.attempts.length - 1
      ? { ...attempt, status: state, completedAt: this.clock(), errorCode: code }
      : attempt);
    return this.replace(current, {
      state,
      attempts,
      restrictedDiagnostic: { code, retryable, recordedAt: this.clock(), containsSubmissionPayload: false },
    }, retryable ? 'SUBMISSION_RETRY_REQUIRED' : 'SUBMISSION_REJECTED', { code });
  }

  publicReceipt(receiptId, principal) {
    const receipt = this.requireReceipt(receiptId);
    if (receipt.principalReference !== principal.principalId) throw new AuthorizationError('SUBMISSION_RECEIPT_ACCESS_DENIED', 'Submission receipt access is not authorized');
    return deepFreeze({
      receiptId: receipt.receiptId,
      correlationId: receipt.correlationId,
      submissionType: receipt.submissionType,
      state: receipt.state,
      receivedAt: receipt.receivedAt,
      modifiedAt: receipt.modifiedAt,
      attemptCount: receipt.attempts.length,
      result: receipt.result ? clone(receipt.result) : null,
      customerActivationPermitted: false,
    });
  }

  restrictedDiagnostics({ actor, receiptId }) {
    requireAuthorization(this.authorize, actor, 'SUBMISSION_DIAGNOSTICS_READ', { receiptId });
    const receipt = this.requireReceipt(receiptId);
    return deepFreeze({
      receiptId,
      payloadDigest: receipt.payloadDigest,
      transportId: receipt.transportId,
      deliveryId: receipt.deliveryId,
      state: receipt.state,
      attempts: clone(receipt.attempts),
      diagnostic: clone(receipt.restrictedDiagnostic),
      submissionPayloadIncluded: false,
      customerContactIncluded: false,
    });
  }

  auditTrail({ actor, receiptId }) {
    requireAuthorization(this.authorize, actor, 'SUBMISSION_AUDIT_READ', { receiptId });
    this.requireReceipt(receiptId);
    return clone(this.audit.get(receiptId) || []);
  }

  requireReceipt(receiptId) {
    const receipt = this.receipts.get(receiptId);
    requireValue(receipt, 'SUBMISSION_RECEIPT_NOT_FOUND', 'Submission receipt was not found');
    return receipt;
  }

  replace(current, patch, eventType, details) {
    const updated = deepFreeze({ ...clone(current), ...clone(patch), version: current.version + 1, modifiedAt: this.clock() });
    this.receipts.set(current.receiptId, updated);
    this.appendAudit(current.receiptId, 'B08A_PRIVATE_INGESTION_SYSTEM', eventType, details);
    return clone(updated);
  }

  appendAudit(receiptId, actorReference, eventType, details) {
    const event = deepFreeze({ auditEventId: this.auditIdFactory(), receiptId, actorReference, eventType, occurredAt: this.clock(), details: clone(details) });
    this.audit.set(receiptId, [...(this.audit.get(receiptId) || []), event]);
  }
}

class SubmissionIngestionService {
  constructor({
    registration,
    supportIntake,
    receiptStore,
    authenticator = new DisabledProductionSubmissionAuthenticator(),
    activationGate,
    clock = () => new Date().toISOString(),
    policyVersion = 'POLICY2_PROPOSED_NOT_EFFECTIVE',
    testMode = false,
    afterDomainHook = null,
  } = {}) {
    requireValue(registration && supportIntake && receiptStore && activationGate, 'SUBMISSION_INGESTION_DEPENDENCY_REQUIRED', 'B08A requires registration, support, receipt, and activation boundaries');
    if (authenticator.synthetic === true || afterDomainHook) requireValue(testMode === true, 'SYNTHETIC_INGESTION_COMPONENT_FORBIDDEN', 'Synthetic ingestion components require explicit test mode');
    this.registration = registration;
    this.supportIntake = supportIntake;
    this.receiptStore = receiptStore;
    this.authenticator = authenticator;
    this.activationGate = activationGate;
    this.clock = clock;
    this.policyVersion = policyVersion;
    this.testMode = testMode;
    this.afterDomainHook = afterDomainHook;
  }

  ingest({ authentication, envelope }) {
    const principal = this.authenticator.authenticate(authentication);
    this.validateEnvelope(envelope);
    const normalized = this.normalize(envelope, principal);
    const digest = payloadDigest(envelope);
    const opened = this.receiptStore.open({
      principal,
      transportId: envelope.delivery.transportId,
      deliveryId: envelope.delivery.deliveryId,
      digest,
      submissionType: envelope.submissionType,
    });
    let receipt = opened.receipt;
    if (receipt.state === 'COMPLETED' || receipt.state === 'REJECTED') return this.receiptStore.publicReceipt(receipt.receiptId, principal);
    try {
      receipt = this.receiptStore.beginAttempt(receipt.receiptId);
      const actor = this.domainActor(principal, envelope.submissionType);
      const domainResult = envelope.submissionType === 'REGISTRATION'
        ? this.registration.createRegistration({ actor, commandId: receipt.domainCommandId, input: normalized })
        : this.supportIntake.createCase({ actor, commandId: receipt.domainCommandId, input: normalized });
      if (this.afterDomainHook) this.afterDomainHook({ receipt: clone(receipt), domainResult: clone(domainResult) });
      const result = envelope.submissionType === 'REGISTRATION'
        ? { targetType: 'REGISTRATION', targetReference: domainResult.registration.data.registrationId, outcome: domainResult.submissionOutcome }
        : { targetType: 'SUPPORT_CASE', targetReference: domainResult.case.data.syntheticFacts.supportIntake.caseReference, outcome: domainResult.intakeOutcome };
      receipt = this.receiptStore.complete(receipt.receiptId, result);
      return this.receiptStore.publicReceipt(receipt.receiptId, principal);
    } catch (error) {
      const retryable = this.isRetryable(error);
      this.receiptStore.fail(receipt.receiptId, error, retryable);
      throw error;
    }
  }

  getReceipt({ authentication, receiptId }) {
    const principal = this.authenticator.authenticate(authentication);
    return this.receiptStore.publicReceipt(receiptId, principal);
  }

  getRestrictedDiagnostics(input) { return this.receiptStore.restrictedDiagnostics(input); }
  auditTrail(input) { return this.receiptStore.auditTrail(input); }
  assertOperationalActivationBlocked() { this.activationGate.assertPermitted('SUBMISSION_INGESTION_ACTIVATION'); }
  assertExternalTransportBlocked() { throw new AuthorizationError('B08B_EXTERNAL_TRANSPORT_NOT_AUTHORIZED', 'External Forms, Flow, and provider transports remain reserved for B08B'); }

  validateEnvelope(envelope) {
    exactKeys(envelope, ['envelopeVersion', 'submissionType', 'delivery', 'payload'], 'INVALID_SUBMISSION_ENVELOPE', 'Submission envelope');
    requireValue(envelope.envelopeVersion === SUBMISSION_ENVELOPE_VERSION, 'UNSUPPORTED_SUBMISSION_ENVELOPE_VERSION', 'Submission envelope version is unsupported');
    requireValue(SUBMISSION_TYPES.includes(envelope.submissionType), 'UNSUPPORTED_SUBMISSION_TYPE', 'Submission type is unsupported');
    exactKeys(envelope.delivery, ['transportId', 'deliveryId', 'sourceEventAt'], 'INVALID_SUBMISSION_DELIVERY', 'Submission delivery');
    requireValue(SYNTHETIC_TRANSPORTS.includes(envelope.delivery.transportId), 'UNAUTHORIZED_SUBMISSION_TRANSPORT', 'Only isolated synthetic transports are authorized in B08A');
    requireValue(/^syn_delivery_[A-Za-z0-9_-]{8,}$/.test(envelope.delivery.deliveryId || ''), 'INVALID_DELIVERY_IDENTITY', 'A synthetic transport delivery identity is required');
    if (envelope.delivery.sourceEventAt !== undefined) requireValue(!Number.isNaN(Date.parse(envelope.delivery.sourceEventAt)), 'INVALID_SOURCE_EVENT_TIME', 'Source event time must be ISO-compatible');
    exactKeys(envelope.payload, envelope.submissionType === 'REGISTRATION'
      ? ['productGid', 'variantGid', 'productVersion', 'firstUseDeclaration', 'registrationPath', 'purchaseEvidence', 'firstUseEvidence', 'legacyPhysicalSerialEvidence', 'priorRegistrationReference']
      : ['category', 'productGid', 'variantGid', 'productVersion', 'registrationId', 'issueSummary', 'evidenceRefs', 'hazardDisclosure', 'hazardEvidenceRef'],
    'UNSUPPORTED_SUBMISSION_PAYLOAD', 'Submission payload');
  }

  normalize(envelope, principal) {
    const payload = clone(envelope.payload);
    if (envelope.submissionType === 'REGISTRATION') {
      const duplicateSignals = payload.priorRegistrationReference ? { existingRegistrationEvidenceRef: payload.priorRegistrationReference } : {};
      return {
        customerReference: principal.customerReference,
        notificationDestinationReference: principal.notificationDestinationReference,
        productGid: payload.productGid,
        variantGid: payload.variantGid,
        productVersion: payload.productVersion,
        policyVersion: this.policyVersion,
        firstUseDeclaration: payload.firstUseDeclaration || { state: 'UNKNOWN' },
        registrationPath: payload.registrationPath || 'NEW_REGISTRATION',
        purchaseEvidence: payload.purchaseEvidence || [],
        firstUseEvidence: payload.firstUseEvidence || [],
        legacyPhysicalSerialEvidence: payload.legacyPhysicalSerialEvidence || null,
        duplicateSignals,
      };
    }
    const disclosure = payload.hazardDisclosure === 'REPORTED'
      ? 'EXPLICIT_HAZARD'
      : payload.hazardDisclosure === 'NOT_REPORTED'
        ? 'NO_HAZARD_REPORTED'
        : 'AMBIGUOUS_REVIEW_REQUIRED';
    return {
      customerReference: principal.customerReference,
      notificationDestinationReference: principal.notificationDestinationReference,
      category: payload.category,
      sourceChannel: 'SYNTHETIC_WEB_FORM',
      ...(payload.productGid ? { productGid: payload.productGid, variantGid: payload.variantGid, productVersion: payload.productVersion || null } : {}),
      ...(payload.registrationId ? { registrationId: payload.registrationId } : {}),
      issueSummary: payload.issueSummary || 'SYNTHETIC_CLARIFICATION_REQUIRED',
      evidenceRefs: payload.evidenceRefs || [],
      safetyDisclosure: disclosure,
      ...(disclosure === 'EXPLICIT_HAZARD' ? { hazardEvidenceRef: payload.hazardEvidenceRef } : {}),
    };
  }

  domainActor(principal, submissionType) {
    return {
      actorId: principal.principalId,
      customerReference: principal.customerReference,
      permissions: submissionType === 'REGISTRATION'
        ? ['REGISTRATION_CREATE']
        : ['SUPPORT_INTAKE_CREATE', 'REGISTRATION_READ_OWN'],
    };
  }

  isRetryable(error) {
    if (error?.retryable === true || error?.code === 'SYNTHETIC_INTERRUPTION') return true;
    return !(error instanceof ValidationError || error instanceof AuthorizationError || error instanceof ConflictError);
  }
}

module.exports = {
  DisabledProductionSubmissionAuthenticator,
  InMemorySubmissionReceiptStore,
  RECEIPT_STATES,
  SUBMISSION_ENVELOPE_VERSION,
  SUBMISSION_TYPES,
  SYNTHETIC_TRANSPORTS,
  SubmissionIngestionService,
  SyntheticSubmissionAuthenticator,
  payloadDigest,
};
