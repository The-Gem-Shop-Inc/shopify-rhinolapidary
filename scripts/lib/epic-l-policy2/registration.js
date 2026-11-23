'use strict';

const {
  AuthorizationError,
  ConflictError,
  TransitionError,
  clone,
  createOpaqueIdentifier,
  deepFreeze,
  requireAuthorization,
  requireValue,
  stableStringify,
} = require('./common');

const REGISTRATION_STATES = Object.freeze([
  'RECEIVED',
  'IDENTITY_VERIFICATION_REQUIRED',
  'DUPLICATE_REVIEW',
  'ACKNOWLEDGED',
  'RESOURCE_DELIVERY_PENDING',
  'COMPLETE',
  'RECOVERY_REQUIRED',
  'REJECTED_INVALID_INPUT',
]);

const FIRST_USE_STATES = Object.freeze(['NOT_STARTED', 'DECLARED_DATE', 'UNKNOWN']);
const OWNERSHIP_STATES = Object.freeze(['UNVERIFIED', 'VERIFIED', 'INCONCLUSIVE', 'CONFLICTING']);
const ACKNOWLEDGEMENT_STATES = Object.freeze([
  'NOT_CREATED',
  'CREATED',
  'NOTIFICATION_QUEUED',
  'DELIVERY_ATTEMPTED',
  'DELIVERY_CONFIRMED',
  'DELIVERY_FAILED',
  'RECOVERY_REQUIRED',
]);

const REGISTRATION_TRANSITIONS = Object.freeze([
  ['RECEIVED', 'IDENTITY_VERIFICATION_REQUIRED'],
  ['RECEIVED', 'DUPLICATE_REVIEW'],
  ['RECEIVED', 'ACKNOWLEDGED'],
  ['RECEIVED', 'RECOVERY_REQUIRED'],
  ['RECEIVED', 'REJECTED_INVALID_INPUT'],
  ['IDENTITY_VERIFICATION_REQUIRED', 'DUPLICATE_REVIEW'],
  ['IDENTITY_VERIFICATION_REQUIRED', 'ACKNOWLEDGED'],
  ['IDENTITY_VERIFICATION_REQUIRED', 'RECOVERY_REQUIRED'],
  ['DUPLICATE_REVIEW', 'IDENTITY_VERIFICATION_REQUIRED'],
  ['DUPLICATE_REVIEW', 'ACKNOWLEDGED'],
  ['DUPLICATE_REVIEW', 'RECOVERY_REQUIRED'],
  ['ACKNOWLEDGED', 'RESOURCE_DELIVERY_PENDING'],
  ['ACKNOWLEDGED', 'DUPLICATE_REVIEW'],
  ['ACKNOWLEDGED', 'RECOVERY_REQUIRED'],
  ['RESOURCE_DELIVERY_PENDING', 'DUPLICATE_REVIEW'],
  ['RESOURCE_DELIVERY_PENDING', 'COMPLETE'],
  ['RESOURCE_DELIVERY_PENDING', 'RECOVERY_REQUIRED'],
  ['RECOVERY_REQUIRED', 'IDENTITY_VERIFICATION_REQUIRED'],
  ['RECOVERY_REQUIRED', 'DUPLICATE_REVIEW'],
  ['RECOVERY_REQUIRED', 'ACKNOWLEDGED'],
  ['RECOVERY_REQUIRED', 'RESOURCE_DELIVERY_PENDING'],
  ['RECOVERY_REQUIRED', 'COMPLETE'],
]);

class InMemoryOrchestrationLedger {
  constructor() {
    this.receipts = new Map();
  }

  execute(commandId, input, operation) {
    requireValue(typeof commandId === 'string' && commandId.length > 0, 'COMMAND_ID_REQUIRED', 'An idempotency command ID is required');
    const fingerprint = stableStringify(input);
    const prior = this.receipts.get(commandId);
    if (prior) {
      if (prior.fingerprint !== fingerprint) throw new ConflictError('IDEMPOTENCY_KEY_REUSE', 'Command ID was already used with different input');
      return clone(prior.result);
    }
    const result = operation();
    this.receipts.set(commandId, deepFreeze({ fingerprint, result: clone(result) }));
    return clone(result);
  }
}

class MachineRegistrationService {
  constructor({
    privateRecords,
    notifications,
    resources,
    activationGate,
    catalog,
    authorize = () => false,
    systemActor,
    clock = () => new Date().toISOString(),
    registrationIdFactory = () => createOpaqueIdentifier(16, 'reg_'),
    acknowledgementEventIdFactory = () => createOpaqueIdentifier(16, 'ack_'),
    duplicateReviewIdFactory = () => createOpaqueIdentifier(16, 'dup_'),
    testMode = false,
    interruptionHook = null,
  }) {
    requireValue(privateRecords, 'PRIVATE_RECORD_STORE_REQUIRED', 'Registration requires the B01 private record store');
    requireValue(notifications, 'NOTIFICATION_OUTBOX_REQUIRED', 'Registration requires the B01 notification outbox');
    requireValue(resources?.resolveApprovedCustomerRevision, 'RESOURCE_RESOLVER_REQUIRED', 'Registration requires the B01 resource resolver port');
    requireValue(activationGate, 'ACTIVATION_GATE_REQUIRED', 'Registration requires the disabled operational activation gate');
    requireValue(catalog, 'PRODUCT_CATALOG_REQUIRED', 'Registration requires exact Product/Variant identities');
    requireValue(systemActor, 'SYSTEM_ACTOR_REQUIRED', 'Registration requires a private system actor');
    if (resources.synthetic === true) requireValue(testMode, 'SYNTHETIC_RESOURCE_AUTHORITY_FORBIDDEN', 'Synthetic resources require explicit test mode');
    if (interruptionHook) requireValue(testMode, 'SYNTHETIC_INTERRUPTION_FORBIDDEN', 'Interruption hooks require explicit test mode');
    this.privateRecords = privateRecords;
    this.notifications = notifications;
    this.resources = resources;
    this.activationGate = activationGate;
    this.catalog = catalog;
    this.authorize = authorize;
    this.systemActor = systemActor;
    this.clock = clock;
    this.registrationIdFactory = registrationIdFactory;
    this.acknowledgementEventIdFactory = acknowledgementEventIdFactory;
    this.duplicateReviewIdFactory = duplicateReviewIdFactory;
    this.testMode = testMode;
    this.interruptionHook = interruptionHook;
    this.commandLedger = new InMemoryOrchestrationLedger();
    this.registrationIdsByCommand = new Map();
    this.registrationTimesByCommand = new Map();
    this.acknowledgementIdsByRegistration = new Map();
    this.recordIdsByRegistration = new Map();
  }

  createRegistration({ actor, commandId, input }) {
    requireAuthorization(this.authorize, actor, 'REGISTRATION_CREATE', { customerReference: input?.customerReference });
    this.validateCreateInput(input);
    if (!this.authorize(actor, 'REGISTRATION_ADMIN_CREATE', input)) {
      requireValue(actor.customerReference === input.customerReference, 'CUSTOMER_REFERENCE_MISMATCH', 'Caller may create only its own synthetic registration');
    }
    const registrationId = this.registrationIdsByCommand.get(commandId) || this.registrationIdFactory();
    this.registrationIdsByCommand.set(commandId, registrationId);
    return this.commandLedger.execute(commandId, { operation: 'createRegistration', input }, () => {
      const registeredAt = this.registrationTimesByCommand.get(commandId) || this.clock();
      this.registrationTimesByCommand.set(commandId, registeredAt);
      const record = this.privateRecords.create({
        actor: this.recordActor(actor),
        commandId: `${commandId}:record`,
        category: 'REGISTRATION',
        state: 'RECEIVED',
        data: {
          registrationId,
          customerReference: input.customerReference,
          notificationDestinationReference: input.notificationDestinationReference,
          productGid: input.productGid,
          variantGid: input.variantGid,
          productVersion: input.productVersion,
          registeredAt,
          policyVersion: input.policyVersion,
          policyApplicabilityStatus: 'NOT_EVALUATED',
          firstUseDeclaration: clone(input.firstUseDeclaration),
          serialNumber: input.serialNumber || null,
          ownershipVerification: { status: 'UNVERIFIED', evidenceRefs: [], decidedAt: null, decidedBy: null },
          duplicateSignals: clone(input.duplicateSignals || {}),
          duplicateInvestigation: null,
          acknowledgement: { status: 'NOT_CREATED', eventId: null, notificationId: null, history: [] },
          instructionDelivery: { status: 'PENDING_RESOLUTION', current: null, history: [], resolutionHistory: [] },
          recoveryObligations: [],
          correctionHistory: [],
          warrantyEligibility: { determined: false, automaticDenial: false, customerPromiseAuthorized: false },
          supportRouteReference: null,
        },
      });
      this.recordIdsByRegistration.set(registrationId, record.recordId);
      this.interrupt('AFTER_REGISTRATION_PERSISTED', { registrationId });
      const duplicate = this.assessDuplicate(record);
      const nextState = duplicate.matchTypes.length ? 'DUPLICATE_REVIEW' : 'IDENTITY_VERIFICATION_REQUIRED';
      const duplicateInvestigation = duplicate.matchTypes.length ? {
        reviewId: this.duplicateReviewIdFactory(),
        status: 'HUMAN_REVIEW_REQUIRED',
        matchTypes: duplicate.matchTypes,
        conflictingRegistrationIds: duplicate.registrationIds,
        openedAt: this.clock(),
        resolution: null,
      } : null;
      this.assertLifecycleTransition(record.state, nextState, { ...record.data, duplicateInvestigation });
      const classified = this.privateRecords.update({
        actor: this.recordActor(actor),
        commandId: `${commandId}:classification`,
        recordId: record.recordId,
        expectedVersion: record.version,
        nextState,
        patch: duplicate.matchTypes.length ? { duplicateInvestigation } : {},
        eventType: duplicate.matchTypes.length ? 'REGISTRATION_DUPLICATE_REVIEW_OPENED' : 'REGISTRATION_IDENTITY_VERIFICATION_REQUIRED',
        eventDetails: { requestedBy: actor.actorId, privacyPreservingOutcome: duplicate.matchTypes.length ? 'REVIEW_REQUIRED' : 'RECEIVED_FOR_VERIFICATION' },
      });
      return {
        registration: this.ownerView(classified),
        submissionOutcome: duplicate.matchTypes.length ? 'REVIEW_REQUIRED' : 'RECEIVED_FOR_VERIFICATION',
      };
    });
  }

  getPrivateRegistration({ actor, registrationId }) {
    const record = this.readRecord(actor, registrationId);
    if (this.authorize(actor, 'REGISTRATION_PRIVATE_READ', record)) return clone(record);
    this.requireOwner(actor, record, 'REGISTRATION_READ_OWN');
    return this.ownerView(record);
  }

  getPublicHandle(registrationId) {
    const record = this.readRecord(this.systemActor, registrationId);
    const reviewStates = ['IDENTITY_VERIFICATION_REQUIRED', 'DUPLICATE_REVIEW', 'RECOVERY_REQUIRED'];
    return deepFreeze({
      registrationId,
      processingStatus: record.state === 'COMPLETE' ? 'COMPLETE' : record.state === 'REJECTED_INVALID_INPUT' ? 'NOT_ACCEPTED' : reviewStates.includes(record.state) ? 'REVIEW_REQUIRED' : 'PROCESSING',
      customerActivationPermitted: false,
    });
  }

  auditTrail({ actor, registrationId }) {
    const record = this.readRecord(actor, registrationId);
    if (!this.authorize(actor, 'REGISTRATION_AUDIT_READ', record)) this.requireOwner(actor, record, 'REGISTRATION_READ_OWN');
    return this.privateRecords.auditTrail({ actor: this.recordActor(actor), recordId: record.recordId });
  }

  recordOwnershipDecision({ actor, commandId, registrationId, expectedVersion, decision }) {
    requireAuthorization(this.authorize, actor, 'REGISTRATION_OWNERSHIP_APPROVE', { registrationId });
    requireValue(OWNERSHIP_STATES.includes(decision?.status) && decision.status !== 'UNVERIFIED', 'INVALID_OWNERSHIP_STATE', 'Ownership decision state is invalid');
    requireValue(Array.isArray(decision.evidenceRefs) && decision.evidenceRefs.length > 0, 'OWNERSHIP_EVIDENCE_REQUIRED', 'Ownership decisions require private evidence references');
    return this.commandLedger.execute(commandId, { operation: 'ownershipDecision', registrationId, expectedVersion, decision }, () => {
      const record = this.readRecord(actor, registrationId);
      this.requireVersion(record, expectedVersion);
      const nextState = decision.status === 'VERIFIED' ? record.state : 'DUPLICATE_REVIEW';
      const duplicateInvestigation = decision.status === 'VERIFIED' ? record.data.duplicateInvestigation : {
        ...(record.data.duplicateInvestigation || {
          reviewId: this.duplicateReviewIdFactory(),
          openedAt: this.clock(),
          matchTypes: ['OWNERSHIP_EVIDENCE'],
          conflictingRegistrationIds: [],
        }),
        status: 'HUMAN_REVIEW_REQUIRED',
        resolution: decision.status,
      };
      this.assertLifecycleTransition(record.state, nextState, { ...record.data, duplicateInvestigation });
      return this.privateRecords.update({
        actor: this.recordActor(actor),
        commandId: `${commandId}:record`,
        recordId: record.recordId,
        expectedVersion,
        nextState,
        patch: {
          ownershipVerification: {
            status: decision.status,
            evidenceRefs: [...decision.evidenceRefs],
            decidedAt: this.clock(),
            decidedBy: actor.actorId,
          },
          duplicateInvestigation,
        },
        eventType: 'REGISTRATION_OWNERSHIP_DECISION_RECORDED',
        eventDetails: { requestedBy: actor.actorId, decision: decision.status, evidenceRefs: [...decision.evidenceRefs] },
      });
    });
  }

  resolveDuplicateReview({ actor, commandId, registrationId, expectedVersion, decision, reason, evidenceRefs }) {
    requireAuthorization(this.authorize, actor, 'REGISTRATION_DUPLICATE_REVIEW', { registrationId });
    const allowed = ['LEGITIMATE_DUPLICATE', 'DISTINCT_REGISTRATION', 'COMPETING_OWNERSHIP_CLAIM', 'INCONCLUSIVE'];
    requireValue(allowed.includes(decision) && reason && Array.isArray(evidenceRefs) && evidenceRefs.length > 0, 'DUPLICATE_DECISION_EVIDENCE_REQUIRED', 'Duplicate review decision, reason, and evidence are required');
    return this.commandLedger.execute(commandId, { operation: 'resolveDuplicateReview', registrationId, expectedVersion, decision, reason, evidenceRefs }, () => {
      const record = this.readRecord(actor, registrationId);
      this.requireVersion(record, expectedVersion);
      requireValue(record.state === 'DUPLICATE_REVIEW' && record.data.duplicateInvestigation, 'DUPLICATE_REVIEW_NOT_ACTIVE', 'Registration is not in duplicate review');
      const resolved = ['LEGITIMATE_DUPLICATE', 'DISTINCT_REGISTRATION'].includes(decision);
      const duplicateInvestigation = {
        ...record.data.duplicateInvestigation,
        status: resolved ? 'REVIEWED_NO_AUTOMATIC_MERGE' : 'HUMAN_REVIEW_REQUIRED',
        resolution: decision,
        resolutionReason: reason,
        resolutionEvidenceRefs: [...evidenceRefs],
        decidedAt: this.clock(),
        decidedBy: actor.actorId,
      };
      const nextState = resolved ? 'IDENTITY_VERIFICATION_REQUIRED' : 'DUPLICATE_REVIEW';
      this.assertLifecycleTransition(record.state, nextState, { ...record.data, duplicateInvestigation });
      return this.privateRecords.update({
        actor: this.recordActor(actor),
        commandId: `${commandId}:record`,
        recordId: record.recordId,
        expectedVersion,
        nextState,
        patch: { duplicateInvestigation },
        eventType: 'REGISTRATION_DUPLICATE_REVIEW_DECIDED',
        eventDetails: { requestedBy: actor.actorId, decision, reason, evidenceRefs: [...evidenceRefs], automaticMerge: false, ownershipTransfer: false },
      });
    });
  }

  recordValidationRejection({ actor, commandId, registrationId, expectedVersion, reason, evidenceRefs }) {
    requireAuthorization(this.authorize, actor, 'REGISTRATION_REJECT_INVALID', { registrationId });
    requireValue(reason && Array.isArray(evidenceRefs) && evidenceRefs.length > 0, 'VALIDATION_REJECTION_EVIDENCE_REQUIRED', 'Validation rejection requires reason and evidence');
    return this.commandLedger.execute(commandId, { operation: 'recordValidationRejection', registrationId, expectedVersion, reason, evidenceRefs }, () => {
      const record = this.readRecord(actor, registrationId);
      this.requireVersion(record, expectedVersion);
      requireValue(record.state === 'RECEIVED', 'VALIDATION_REJECTION_NOT_ALLOWED', 'Only a received record can enter invalid-input rejection');
      const validationRejection = { reason, evidenceRefs: [...evidenceRefs], rejectedAt: this.clock(), rejectedBy: actor.actorId };
      this.assertLifecycleTransition(record.state, 'REJECTED_INVALID_INPUT', { ...record.data, validationRejection });
      return this.privateRecords.update({
        actor: this.recordActor(actor),
        commandId: `${commandId}:record`,
        recordId: record.recordId,
        expectedVersion,
        nextState: 'REJECTED_INVALID_INPUT',
        patch: { validationRejection },
        eventType: 'REGISTRATION_INVALID_INPUT_REJECTED',
        eventDetails: { requestedBy: actor.actorId, reason, evidenceRefs: [...evidenceRefs] },
      });
    });
  }

  authorizedCorrection({ actor, commandId, registrationId, expectedVersion, correction, reason, evidenceRefs }) {
    requireAuthorization(this.authorize, actor, 'REGISTRATION_CORRECT', { registrationId });
    requireValue(reason && Array.isArray(evidenceRefs) && evidenceRefs.length > 0, 'CORRECTION_EVIDENCE_REQUIRED', 'Authorized correction requires reason and evidence');
    const allowed = ['productGid', 'variantGid', 'productVersion', 'firstUseDeclaration', 'serialNumber'];
    requireValue(Object.keys(correction || {}).length > 0 && Object.keys(correction).every((key) => allowed.includes(key)), 'UNSUPPORTED_REGISTRATION_CORRECTION', 'Correction contains an unsupported field');
    return this.commandLedger.execute(commandId, { operation: 'authorizedCorrection', registrationId, expectedVersion, correction, reason, evidenceRefs }, () => {
      const record = this.readRecord(actor, registrationId);
      this.requireVersion(record, expectedVersion);
      const nextProduct = correction.productGid || record.data.productGid;
      const nextVariant = correction.variantGid || record.data.variantGid;
      this.catalog.assertRelationship(nextProduct, nextVariant);
      if (correction.firstUseDeclaration) this.validateFirstUse(correction.firstUseDeclaration);
      const priorValues = {};
      for (const key of Object.keys(correction)) priorValues[key] = clone(record.data[key]);
      return this.privateRecords.update({
        actor: this.recordActor(actor),
        commandId: `${commandId}:record`,
        recordId: record.recordId,
        expectedVersion,
        nextState: record.state,
        patch: {
          ...clone(correction),
          correctionHistory: [...record.data.correctionHistory, {
            correctionId: `${commandId}:correction`,
            correctedAt: this.clock(),
            correctedBy: actor.actorId,
            reason,
            evidenceRefs: [...evidenceRefs],
            priorValues,
          }],
        },
        eventType: 'REGISTRATION_AUTHORIZED_CORRECTION',
        eventDetails: { requestedBy: actor.actorId, fields: Object.keys(correction), reason, evidenceRefs: [...evidenceRefs] },
      });
    });
  }

  createAcknowledgement({ actor, commandId, registrationId, expectedVersion, supportRouteReference }) {
    requireValue(/^route_[A-Za-z0-9_-]{8,}$/.test(supportRouteReference || ''), 'SUPPORT_ROUTE_REFERENCE_REQUIRED', 'An opaque support route reference is required');
    return this.commandLedger.execute(commandId, { operation: 'createAcknowledgement', registrationId, expectedVersion, supportRouteReference }, () => {
      let record = this.readRecord(actor, registrationId);
      this.requireOwnerOrPermission(actor, record, 'REGISTRATION_ACKNOWLEDGE', 'REGISTRATION_ACKNOWLEDGE_OWN');
      this.requireVersion(record, expectedVersion);
      if (record.data.acknowledgement.status !== 'NOT_CREATED') {
        requireValue(record.data.supportRouteReference === supportRouteReference, 'ACKNOWLEDGEMENT_ALREADY_EXISTS', 'Acknowledgement already exists with a different support route');
        return this.acknowledgementView(record);
      }
      const eventId = this.acknowledgementIdsByRegistration.get(registrationId) || this.acknowledgementEventIdFactory();
      this.acknowledgementIdsByRegistration.set(registrationId, eventId);
      record = this.privateRecords.update({
        actor: this.recordActor(actor),
        commandId: `${commandId}:event`,
        recordId: record.recordId,
        expectedVersion,
        nextState: record.state,
        patch: {
          supportRouteReference,
          acknowledgement: this.buildAcknowledgement(record, eventId, 'CREATED', null, [{ status: 'CREATED', occurredAt: this.clock() }], supportRouteReference),
        },
        eventType: 'REGISTRATION_ACKNOWLEDGEMENT_CREATED',
        eventDetails: { requestedBy: actor.actorId, eventId },
      });
      this.interrupt('AFTER_ACKNOWLEDGEMENT_EVENT_PERSISTED', { registrationId, eventId });
      record = this.queueAcknowledgement(record, actor, eventId);
      this.interrupt('AFTER_ACKNOWLEDGEMENT_LINKED', { registrationId, eventId, notificationId: record.data.acknowledgement.notificationId });
      return this.acknowledgementView(record);
    });
  }

  attemptAcknowledgementDelivery({ actor, commandId, registrationId, expectedVersion }) {
    return this.commandLedger.execute(commandId, { operation: 'attemptAcknowledgementDelivery', registrationId, expectedVersion }, () => {
      let record = this.readRecord(actor, registrationId);
      this.requireOwnerOrPermission(actor, record, 'REGISTRATION_ACKNOWLEDGE', 'REGISTRATION_ACKNOWLEDGE_OWN');
      this.requireVersion(record, expectedVersion);
      requireValue(record.data.acknowledgement.notificationId, 'ACKNOWLEDGEMENT_NOT_QUEUED', 'Acknowledgement notification is not queued');
      let notification = this.notifications.attempt({
        actor: this.systemActor,
        commandId: `${commandId}:notification`,
        notificationId: record.data.acknowledgement.notificationId,
      });
      if (notification.state === 'DELIVERY_FAILED') {
        notification = this.notifications.requireRecovery({
          actor: this.systemActor,
          commandId: `${commandId}:notification:recovery`,
          notificationId: notification.notificationId,
          reason: 'REGISTRATION_ACKNOWLEDGEMENT_DELIVERY_FAILED',
        });
      }
      return this.applyAcknowledgementNotification(record, actor, commandId, notification);
    });
  }

  recoverAcknowledgement({ actor, commandId, registrationId, expectedVersion, action = 'RESUME_QUEUE', reconciliation = null }) {
    requireAuthorization(this.authorize, actor, 'REGISTRATION_RECOVER', { registrationId });
    return this.commandLedger.execute(commandId, { operation: 'recoverAcknowledgement', registrationId, expectedVersion, action, reconciliation }, () => {
      let record = this.readRecord(actor, registrationId);
      this.requireVersion(record, expectedVersion);
      const acknowledgement = record.data.acknowledgement;
      requireValue(acknowledgement.status !== 'NOT_CREATED', 'ACKNOWLEDGEMENT_NOT_CREATED', 'No acknowledgement exists to recover');
      if (!acknowledgement.notificationId) return this.queueAcknowledgement(record, actor, acknowledgement.eventId);
      let notification = this.notifications.get(acknowledgement.notificationId);
      if (action === 'RESUME_QUEUE' && notification.state === 'PENDING') return this.acknowledgementView(record);
      if (action === 'RETRY_DELIVERY') {
        notification = this.notifications.attempt({ actor: this.systemActor, commandId: `${commandId}:retry`, notificationId: notification.notificationId });
        if (notification.state === 'DELIVERY_FAILED') notification = this.notifications.requireRecovery({ actor: this.systemActor, commandId: `${commandId}:retry:recovery`, notificationId: notification.notificationId, reason: 'REGISTRATION_ACKNOWLEDGEMENT_RETRY_FAILED' });
      } else if (action === 'RECONCILE') {
        requireValue(reconciliation, 'RECONCILIATION_EVIDENCE_REQUIRED', 'Reconciliation outcome and evidence are required');
        notification = this.notifications.reconcile({ actor: this.systemActor, commandId: `${commandId}:reconcile`, notificationId: notification.notificationId, ...reconciliation });
      } else if (action !== 'RESUME_QUEUE') {
        throw new TransitionError('UNKNOWN_RECOVERY_ACTION', 'Unknown registration recovery actions fail closed');
      }
      record = this.readRecord(actor, registrationId);
      return this.applyAcknowledgementNotification(record, actor, commandId, notification);
    });
  }

  resolveInstructionResource({ actor, commandId, registrationId, expectedVersion }) {
    return this.commandLedger.execute(commandId, { operation: 'resolveInstructionResource', registrationId, expectedVersion }, () => {
      const record = this.readRecord(actor, registrationId);
      this.requireOwnerOrPermission(actor, record, 'REGISTRATION_RESOURCE_RESOLVE', 'REGISTRATION_RESOURCE_RESOLVE_OWN');
      this.requireVersion(record, expectedVersion);
      requireValue(record.data.acknowledgement.status !== 'NOT_CREATED', 'ACKNOWLEDGEMENT_REQUIRED_BEFORE_RESOURCE_DELIVERY', 'Registration acknowledgement must exist before instruction resolution');
      const matches = this.resources.resolveApprovedCustomerRevision({
        productGid: record.data.productGid,
        variantGid: record.data.variantGid,
        machineVersion: record.data.productVersion,
      });
      let status;
      let current = null;
      let obligation = null;
      if (matches.length === 0) {
        status = 'BLOCKED_NO_APPROVED_RESOURCE';
        obligation = 'MISSING_APPROVED_RESOURCE';
      } else if (matches.length > 1) {
        status = 'REVIEW_REQUIRED_MULTIPLE_RESOURCES';
        obligation = 'RESOURCE_SELECTION_REVIEW_REQUIRED';
      } else {
        const match = matches[0];
        requireValue(match.resourceId && match.revisionId, 'RESOURCE_IDENTITY_INCOMPLETE', 'Resolved resource identity is incomplete');
        this.assertResourceApplicability(match, record);
        current = {
          resourceId: match.resourceId,
          revisionId: match.revisionId,
          productGid: record.data.productGid,
          variantGid: record.data.variantGid,
          machineVersion: record.data.productVersion,
          deliveryStatus: 'PENDING',
          resolvedAt: this.clock(),
          synthetic: match.synthetic === true,
        };
        status = 'PENDING_DELIVERY';
      }
      const priorCurrent = record.data.instructionDelivery.current;
      const resolutionHistory = priorCurrent && (priorCurrent.resourceId !== current?.resourceId || priorCurrent.revisionId !== current?.revisionId)
        ? [...record.data.instructionDelivery.resolutionHistory, clone(priorCurrent)]
        : [...record.data.instructionDelivery.resolutionHistory];
      const obligations = this.replaceObligation(record.data.recoveryObligations, ['MISSING_APPROVED_RESOURCE', 'RESOURCE_SELECTION_REVIEW_REQUIRED'], obligation);
      const prospectiveData = {
        ...record.data,
        instructionDelivery: { ...record.data.instructionDelivery, status, current, resolutionHistory },
        recoveryObligations: obligations,
      };
      this.assertLifecycleTransition(record.state, 'RESOURCE_DELIVERY_PENDING', prospectiveData);
      const updated = this.privateRecords.update({
        actor: this.recordActor(actor),
        commandId: `${commandId}:record`,
        recordId: record.recordId,
        expectedVersion,
        nextState: 'RESOURCE_DELIVERY_PENDING',
        patch: {
          instructionDelivery: { ...record.data.instructionDelivery, status, current, resolutionHistory },
          recoveryObligations: obligations,
        },
        eventType: 'REGISTRATION_INSTRUCTION_RESOURCE_RESOLVED',
        eventDetails: { requestedBy: actor.actorId, status, resourceId: current?.resourceId || null, revisionId: current?.revisionId || null },
      });
      this.interrupt('AFTER_RESOURCE_RESOLUTION_PERSISTED', { registrationId, status });
      return this.ownerView(updated);
    });
  }

  recordInstructionDelivery({ actor, commandId, registrationId, expectedVersion, evidence }) {
    requireAuthorization(this.authorize, actor, 'REGISTRATION_RESOURCE_DELIVER', { registrationId });
    requireValue(['DELIVERY_CONFIRMED', 'DELIVERY_FAILED'].includes(evidence?.deliveryStatus), 'INVALID_RESOURCE_DELIVERY_STATUS', 'Resource delivery status is invalid');
    requireValue(evidence.resourceId && evidence.revisionId && evidence.deliveredAt && evidence.deliveryChannel, 'RESOURCE_DELIVERY_EVIDENCE_REQUIRED', 'Complete instruction delivery evidence is required');
    return this.commandLedger.execute(commandId, { operation: 'recordInstructionDelivery', registrationId, expectedVersion, evidence }, () => {
      const record = this.readRecord(actor, registrationId);
      this.requireVersion(record, expectedVersion);
      const current = record.data.instructionDelivery.current;
      requireValue(current && current.resourceId === evidence.resourceId && current.revisionId === evidence.revisionId, 'RESOURCE_REVISION_MISMATCH', 'Delivery evidence does not match the resolved resource revision');
      const history = [...record.data.instructionDelivery.history, clone(evidence)];
      const confirmed = evidence.deliveryStatus === 'DELIVERY_CONFIRMED';
      const obligations = this.replaceObligation(record.data.recoveryObligations, ['RESOURCE_DELIVERY_FAILED'], confirmed ? null : 'RESOURCE_DELIVERY_FAILED');
      const nextState = confirmed ? 'RESOURCE_DELIVERY_PENDING' : 'RECOVERY_REQUIRED';
      const prospectiveData = {
        ...record.data,
        instructionDelivery: {
          ...record.data.instructionDelivery,
          status: evidence.deliveryStatus,
          current: { ...current, deliveryStatus: evidence.deliveryStatus },
          history,
        },
        recoveryObligations: obligations,
      };
      this.assertLifecycleTransition(record.state, nextState, prospectiveData);
      return this.privateRecords.update({
        actor: this.recordActor(actor),
        commandId: `${commandId}:record`,
        recordId: record.recordId,
        expectedVersion,
        nextState,
        patch: {
          instructionDelivery: {
            ...record.data.instructionDelivery,
            status: evidence.deliveryStatus,
            current: { ...current, deliveryStatus: evidence.deliveryStatus },
            history,
          },
          recoveryObligations: obligations,
        },
        eventType: 'REGISTRATION_INSTRUCTION_DELIVERY_RECORDED',
        eventDetails: { requestedBy: actor.actorId, resourceId: evidence.resourceId, revisionId: evidence.revisionId, deliveryStatus: evidence.deliveryStatus },
      });
    });
  }

  completeRegistration({ actor, commandId, registrationId, expectedVersion }) {
    requireAuthorization(this.authorize, actor, 'REGISTRATION_COMPLETE', { registrationId });
    return this.commandLedger.execute(commandId, { operation: 'completeRegistration', registrationId, expectedVersion }, () => {
      const record = this.readRecord(actor, registrationId);
      this.requireVersion(record, expectedVersion);
      this.assertCompletionGuards(record);
      this.assertLifecycleTransition(record.state, 'COMPLETE', record.data);
      return this.privateRecords.update({
        actor: this.recordActor(actor),
        commandId: `${commandId}:record`,
        recordId: record.recordId,
        expectedVersion,
        nextState: 'COMPLETE',
        patch: { recoveryObligations: [] },
        eventType: 'REGISTRATION_ENGINEERING_LIFECYCLE_COMPLETE',
        eventDetails: { requestedBy: actor.actorId, warrantyEligibilityDetermined: false, customerActivationPermitted: false },
      });
    });
  }

  recordRecoveryDisposition({ actor, commandId, registrationId, expectedVersion, disposition, reason, evidenceRefs = [] }) {
    requireAuthorization(this.authorize, actor, 'REGISTRATION_RECOVER', { registrationId });
    const allowed = ['REQUIRES_IDENTITY_REVIEW', 'REQUIRES_PRODUCT_OWNER_REVIEW', 'REQUIRES_TECHNICAL_REVIEW', 'REQUIRES_LEGAL_REVIEW', 'UNRESOLVED'];
    requireValue(allowed.includes(disposition) && reason, 'INVALID_RECOVERY_DISPOSITION', 'Recovery disposition and reason are required');
    return this.commandLedger.execute(commandId, { operation: 'recordRecoveryDisposition', registrationId, expectedVersion, disposition, reason, evidenceRefs }, () => {
      const record = this.readRecord(actor, registrationId);
      this.requireVersion(record, expectedVersion);
      const obligation = { code: disposition, reason, evidenceRefs: [...evidenceRefs], recordedAt: this.clock(), recordedBy: actor.actorId };
      this.assertLifecycleTransition(record.state, 'RECOVERY_REQUIRED', { ...record.data, recoveryObligations: [...record.data.recoveryObligations, obligation] });
      return this.privateRecords.update({
        actor: this.recordActor(actor),
        commandId: `${commandId}:record`,
        recordId: record.recordId,
        expectedVersion,
        nextState: 'RECOVERY_REQUIRED',
        patch: { recoveryObligations: [...record.data.recoveryObligations, obligation] },
        eventType: 'REGISTRATION_RECOVERY_DISPOSITION_RECORDED',
        eventDetails: { requestedBy: actor.actorId, disposition, reason, evidenceRefs: [...evidenceRefs] },
      });
    });
  }

  assertCustomerActivationBlocked() {
    this.activationGate.assertPermitted('MACHINE_REGISTRATION_ACTIVATION');
  }

  validateCreateInput(input) {
    requireValue(input && /^cus_[A-Za-z0-9_-]{16,}$/.test(input.customerReference || ''), 'OPAQUE_CUSTOMER_REFERENCE_REQUIRED', 'A synthetic opaque customer reference is required');
    requireValue(/^dst_[A-Za-z0-9_-]{16,}$/.test(input.notificationDestinationReference || ''), 'OPAQUE_DESTINATION_REQUIRED', 'A synthetic opaque notification destination is required');
    this.catalog.assertRelationship(input.productGid, input.variantGid);
    requireValue(typeof input.productVersion === 'string' && input.productVersion.length > 0, 'PRODUCT_VERSION_REQUIRED', 'Machine or Product version is required');
    requireValue(typeof input.policyVersion === 'string' && input.policyVersion.length > 0, 'POLICY_VERSION_REQUIRED', 'A policy version reference is required');
    this.validateFirstUse(input.firstUseDeclaration);
    if (input.serialNumber !== undefined && input.serialNumber !== null) requireValue(typeof input.serialNumber === 'string' && input.serialNumber.trim().length > 0, 'INVALID_SERIAL_NUMBER', 'Serial number must be non-empty when supplied');
  }

  validateFirstUse(declaration) {
    requireValue(declaration && FIRST_USE_STATES.includes(declaration.state), 'INVALID_FIRST_USE_DECLARATION', 'First use declaration state is invalid');
    if (declaration.state === 'DECLARED_DATE') requireValue(/^\d{4}-\d{2}-\d{2}$/.test(declaration.declaredDate || ''), 'FIRST_USE_DATE_REQUIRED', 'Declared first use requires an ISO date');
    if (declaration.state !== 'DECLARED_DATE') requireValue(!declaration.declaredDate, 'UNEXPECTED_FIRST_USE_DATE', 'Only DECLARED_DATE may contain a first use date');
  }

  assessDuplicate(record) {
    const matchTypes = new Set();
    const registrationIds = new Set();
    for (const [registrationId, recordId] of this.recordIdsByRegistration.entries()) {
      if (registrationId === record.data.registrationId) continue;
      const other = this.privateRecords.read({ actor: this.recordActor(this.systemActor), recordId });
      if (record.data.serialNumber && other.data.serialNumber && this.normalizeSerial(record.data.serialNumber) === this.normalizeSerial(other.data.serialNumber)) {
        matchTypes.add('PHYSICAL_SERIAL_SIGNAL');
        registrationIds.add(registrationId);
      }
      const orderSignal = record.data.duplicateSignals?.verifiedOrderLineReference;
      if (orderSignal && other.data.duplicateSignals?.verifiedOrderLineReference === orderSignal && other.data.productGid === record.data.productGid && other.data.variantGid === record.data.variantGid) {
        matchTypes.add('ORDER_LINE_AND_MACHINE_SIGNAL');
        registrationIds.add(registrationId);
      }
      if (record.data.duplicateSignals?.existingRegistrationEvidenceRef === registrationId) {
        matchTypes.add('EXISTING_REGISTRATION_EVIDENCE_SIGNAL');
        registrationIds.add(registrationId);
      }
    }
    return { matchTypes: [...matchTypes], registrationIds: [...registrationIds] };
  }

  normalizeSerial(value) {
    return value.trim().toUpperCase();
  }

  queueAcknowledgement(record, actor, eventId) {
    const queued = this.notifications.queue({
      actor: this.systemActor,
      commandId: `registration:${record.data.registrationId}:ack:${eventId}:queue`,
      domainEventId: eventId,
      destinationReference: record.data.notificationDestinationReference,
      channel: 'SYNTHETIC_INTERNAL',
      messageClass: 'SYNTHETIC_REGISTRATION_ACKNOWLEDGEMENT_NO_POLICY_PROMISES',
    });
    this.interrupt('AFTER_ACKNOWLEDGEMENT_NOTIFICATION_QUEUED', { registrationId: record.data.registrationId, eventId, notificationId: queued.notificationId });
    const latest = this.privateRecords.read({ actor: this.recordActor(actor), recordId: record.recordId });
    const acknowledgement = this.buildAcknowledgement(latest, eventId, 'NOTIFICATION_QUEUED', queued.notificationId, [
      ...latest.data.acknowledgement.history,
      { status: 'NOTIFICATION_QUEUED', occurredAt: this.clock(), notificationId: queued.notificationId },
    ]);
    this.assertLifecycleTransition(latest.state, 'ACKNOWLEDGED', { ...latest.data, acknowledgement });
    return this.privateRecords.update({
      actor: this.recordActor(actor),
      commandId: `registration:${record.data.registrationId}:ack:${eventId}:link`,
      recordId: latest.recordId,
      expectedVersion: latest.version,
      nextState: 'ACKNOWLEDGED',
      patch: { acknowledgement },
      eventType: 'REGISTRATION_ACKNOWLEDGEMENT_NOTIFICATION_QUEUED',
      eventDetails: { requestedBy: actor.actorId, eventId, notificationId: queued.notificationId, delivered: false },
    });
  }

  applyAcknowledgementNotification(record, actor, commandId, notification) {
    const confirmed = notification.state === 'DELIVERY_CONFIRMED';
    const failed = ['DELIVERY_FAILED', 'RECOVERY_REQUIRED'].includes(notification.state);
    const status = confirmed ? 'DELIVERY_CONFIRMED' : failed ? 'RECOVERY_REQUIRED' : 'DELIVERY_ATTEMPTED';
    const obligations = this.replaceObligation(record.data.recoveryObligations, ['ACKNOWLEDGEMENT_DELIVERY_UNRESOLVED'], confirmed ? null : 'ACKNOWLEDGEMENT_DELIVERY_UNRESOLVED');
    const nextState = confirmed ? (record.state === 'RECOVERY_REQUIRED' ? 'ACKNOWLEDGED' : record.state) : 'RECOVERY_REQUIRED';
    const history = [...record.data.acknowledgement.history];
    for (const attempt of notification.attempts || []) {
      if (!history.some((entry) => entry.attemptId === attempt.attemptId)) history.push({ status: 'DELIVERY_ATTEMPTED', occurredAt: attempt.attemptedAt, attemptId: attempt.attemptId });
    }
    history.push({ status, occurredAt: this.clock(), notificationId: notification.notificationId, deliveryEvidence: confirmed ? clone(notification.deliveryEvidence) : null });
    const prospectiveData = {
      ...record.data,
      acknowledgement: { ...record.data.acknowledgement, status, history, deliveryEvidence: confirmed ? clone(notification.deliveryEvidence) : null },
      recoveryObligations: obligations,
    };
    this.assertLifecycleTransition(record.state, nextState, prospectiveData);
    return this.privateRecords.update({
      actor: this.recordActor(actor),
      commandId: `${commandId}:record`,
      recordId: record.recordId,
      expectedVersion: record.version,
      nextState,
      patch: {
        acknowledgement: { ...record.data.acknowledgement, status, history, deliveryEvidence: confirmed ? clone(notification.deliveryEvidence) : null },
        recoveryObligations: obligations,
      },
      eventType: confirmed ? 'REGISTRATION_ACKNOWLEDGEMENT_DELIVERY_CONFIRMED' : 'REGISTRATION_ACKNOWLEDGEMENT_RECOVERY_REQUIRED',
      eventDetails: { requestedBy: actor.actorId, notificationId: notification.notificationId, notificationState: notification.state },
    });
  }

  buildAcknowledgement(record, eventId, status, notificationId, history, supportRouteReference = record.data.supportRouteReference) {
    return {
      status,
      eventId,
      notificationId,
      registrationId: record.data.registrationId,
      machineIdentity: { productGid: record.data.productGid, variantGid: record.data.variantGid, productVersion: record.data.productVersion },
      registeredAt: record.data.registeredAt,
      verificationState: record.data.ownershipVerification.status,
      resourceDeliveryState: record.data.instructionDelivery.status,
      supportRouteReference,
      policyPromiseAuthorized: false,
      history,
      deliveryEvidence: null,
    };
  }

  acknowledgementView(record) {
    return clone({
      registrationId: record.data.registrationId,
      machineIdentity: record.data.acknowledgement.machineIdentity,
      registeredAt: record.data.registeredAt,
      verificationState: record.data.ownershipVerification.status,
      resourceDeliveryState: record.data.instructionDelivery.status,
      supportRouteReference: record.data.supportRouteReference,
      acknowledgementEventId: record.data.acknowledgement.eventId,
      notificationId: record.data.acknowledgement.notificationId,
      acknowledgementStatus: record.data.acknowledgement.status,
      policyPromiseAuthorized: false,
    });
  }

  readRecord(actor, registrationId) {
    const recordId = this.recordIdsByRegistration.get(registrationId);
    requireValue(recordId, 'REGISTRATION_NOT_FOUND', 'Registration was not found');
    return this.privateRecords.read({ actor: this.recordActor(actor), recordId });
  }

  recordActor(actor) {
    return { actorId: actor?.actorId || this.systemActor.actorId, permissions: [...this.systemActor.permissions] };
  }

  requireOwner(actor, record, permission) {
    if (!actor || !this.authorize(actor, permission, record) || actor.customerReference !== record.data.customerReference) {
      throw new AuthorizationError('REGISTRATION_ACCESS_DENIED', 'Registration access is not authorized');
    }
  }

  requireOwnerOrPermission(actor, record, elevatedPermission, ownPermission) {
    if (this.authorize(actor, elevatedPermission, record)) return;
    this.requireOwner(actor, record, ownPermission);
  }

  requireVersion(record, expectedVersion) {
    if (record.version !== expectedVersion) throw new ConflictError('RECORD_VERSION_CONFLICT', 'Expected registration version does not match', { expectedVersion, actualVersion: record.version });
  }

  ownerView(record) {
    const view = clone(record);
    if (view.data.duplicateInvestigation) {
      view.data.duplicateInvestigation = {
        reviewId: view.data.duplicateInvestigation.reviewId,
        status: view.data.duplicateInvestigation.status,
        openedAt: view.data.duplicateInvestigation.openedAt,
        privacyPreservingOutcome: 'REVIEW_REQUIRED',
      };
    }
    if (view.data.ownershipVerification) view.data.ownershipVerification.evidenceRefs = [];
    return view;
  }

  assertCompletionGuards(record) {
    requireValue(['RESOURCE_DELIVERY_PENDING', 'RECOVERY_REQUIRED'].includes(record.state), 'INVALID_REGISTRATION_TRANSITION', 'Registration is not in a completable state');
    requireValue(record.data.ownershipVerification.status === 'VERIFIED', 'OWNERSHIP_VERIFICATION_REQUIRED', 'Verified ownership is required for COMPLETE');
    requireValue(!record.data.duplicateInvestigation || record.data.duplicateInvestigation.status === 'REVIEWED_NO_AUTOMATIC_MERGE', 'DUPLICATE_REVIEW_RESOLUTION_REQUIRED', 'Duplicate investigation must be explicitly reviewed before COMPLETE');
    requireValue(record.data.acknowledgement.status === 'DELIVERY_CONFIRMED' && record.data.acknowledgement.deliveryEvidence, 'ACKNOWLEDGEMENT_DELIVERY_EVIDENCE_REQUIRED', 'Confirmed acknowledgement delivery evidence is required for COMPLETE');
    requireValue(record.data.instructionDelivery.status === 'DELIVERY_CONFIRMED' && record.data.instructionDelivery.history.some((entry) => entry.deliveryStatus === 'DELIVERY_CONFIRMED'), 'INSTRUCTION_DELIVERY_EVIDENCE_REQUIRED', 'Confirmed instruction delivery evidence is required for COMPLETE');
    requireValue(record.data.recoveryObligations.length === 0, 'UNRESOLVED_REGISTRATION_RECOVERY', 'Recovery obligations must be resolved before COMPLETE');
  }

  assertResourceApplicability(resource, record) {
    const applicability = resource.applicability;
    requireValue(applicability && Array.isArray(applicability.productGids) && Array.isArray(applicability.variantGids) && Array.isArray(applicability.machineVersions), 'RESOURCE_APPLICABILITY_REQUIRED', 'Resolved resources require exact applicability evidence');
    requireValue(applicability.productGids.includes(record.data.productGid), 'RESOURCE_PRODUCT_MISMATCH', 'Resource does not apply to the registered Product');
    requireValue(applicability.variantGids.includes(record.data.variantGid), 'RESOURCE_VARIANT_MISMATCH', 'Resource does not apply to the registered Variant');
    requireValue(applicability.machineVersions.includes(record.data.productVersion), 'RESOURCE_MACHINE_VERSION_MISMATCH', 'Resource does not apply to the registered machine version');
  }

  isTransitionSupported(fromState, toState) {
    return fromState === toState || REGISTRATION_TRANSITIONS.some(([from, to]) => from === fromState && to === toState);
  }

  assertLifecycleTransition(fromState, toState, prospectiveData) {
    requireValue(REGISTRATION_STATES.includes(fromState) && REGISTRATION_STATES.includes(toState), 'UNKNOWN_REGISTRATION_STATE', 'Unknown registration states fail closed');
    if (fromState !== toState) requireValue(this.isTransitionSupported(fromState, toState), 'INVALID_REGISTRATION_TRANSITION', 'Registration lifecycle transition is not supported', { fromState, toState });
    if (toState === 'DUPLICATE_REVIEW') requireValue(prospectiveData.duplicateInvestigation, 'DUPLICATE_REVIEW_EVIDENCE_REQUIRED', 'Duplicate review requires a private investigation record');
    if (toState === 'ACKNOWLEDGED') requireValue(prospectiveData.acknowledgement?.eventId, 'ACKNOWLEDGEMENT_EVENT_REQUIRED', 'ACKNOWLEDGED requires an acknowledgement event');
    if (toState === 'RESOURCE_DELIVERY_PENDING') requireValue(prospectiveData.instructionDelivery && prospectiveData.acknowledgement?.eventId, 'RESOURCE_DELIVERY_STATE_REQUIRED', 'Resource delivery pending requires acknowledgement and delivery state');
    if (toState === 'RECOVERY_REQUIRED') requireValue(prospectiveData.recoveryObligations?.length > 0, 'RECOVERY_OBLIGATION_REQUIRED', 'RECOVERY_REQUIRED needs an explicit obligation');
    if (toState === 'REJECTED_INVALID_INPUT') requireValue(prospectiveData.validationRejection, 'VALIDATION_REJECTION_EVIDENCE_REQUIRED', 'Invalid input rejection requires evidence');
  }

  replaceObligation(obligations, codes, replacement) {
    const remaining = obligations.filter((item) => !codes.includes(typeof item === 'string' ? item : item.code));
    if (replacement) remaining.push(replacement);
    return remaining;
  }

  interrupt(stage, context) {
    if (this.interruptionHook) this.interruptionHook(stage, clone(context));
  }
}

module.exports = {
  ACKNOWLEDGEMENT_STATES,
  FIRST_USE_STATES,
  InMemoryOrchestrationLedger,
  MachineRegistrationService,
  OWNERSHIP_STATES,
  REGISTRATION_STATES,
  REGISTRATION_TRANSITIONS,
};
