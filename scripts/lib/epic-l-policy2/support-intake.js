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
} = require('./common');
const { InMemoryOrchestrationLedger } = require('./registration');

const SUPPORT_CATEGORIES = Object.freeze([
  'WARRANTY_DECISION',
  'TECHNICAL_GUIDANCE',
  'PARTS_QUESTION',
  'MANUFACTURER_REFERRAL',
  'SHIPPING_CLAIM',
]);

const SAFETY_DISCLOSURES = Object.freeze([
  'EXPLICIT_HAZARD',
  'AMBIGUOUS_REVIEW_REQUIRED',
  'NO_HAZARD_REPORTED',
]);

const ACKNOWLEDGEMENT_STATES = Object.freeze([
  'NOT_CREATED',
  'CREATED',
  'NOTIFICATION_QUEUED',
  'DELIVERY_ATTEMPTED',
  'DELIVERY_CONFIRMED',
  'DELIVERY_FAILED',
  'RECOVERY_REQUIRED',
]);

class UnresolvedSupportRouteResolver {
  constructor(routes) {
    this.routes = clone(routes);
    this.synthetic = false;
  }

  resolve(category) {
    const route = this.routes.find((candidate) => candidate.category === category);
    requireValue(route, 'UNKNOWN_SUPPORT_ROUTE', 'Unknown support routes fail closed');
    return {
      category,
      status: 'UNRESOLVED',
      primaryReference: null,
      backupReference: null,
      destination: route.destination || null,
      handoffProcedureStatus: route.handoffProcedureStatus || null,
    };
  }
}

class SyntheticSupportRouteResolver {
  constructor(routes) {
    this.routes = clone(routes);
    this.synthetic = true;
  }

  resolve(category) {
    const route = this.routes.find((candidate) => candidate.category === category);
    requireValue(route, 'UNKNOWN_SUPPORT_ROUTE', 'Unknown support routes fail closed');
    return clone(route);
  }
}

class DisabledRoutingAdapter {
  constructor() { this.synthetic = false; }
  route() { return { outcome: 'UNAVAILABLE', evidence: null }; }
}

class SyntheticRoutingAdapter {
  constructor(outcomes = []) {
    this.synthetic = true;
    this.outcomes = [...outcomes];
    this.calls = [];
  }

  route(envelope) {
    this.calls.push(clone(envelope));
    return clone(this.outcomes.shift() || { outcome: 'UNCERTAIN', evidence: null });
  }
}

class GovernedSupportIntakeService {
  constructor({
    privateRecords,
    safety,
    registration,
    notifications,
    activationGate,
    catalog,
    contract,
    authorize = () => false,
    systemActor,
    routeResolver,
    routingAdapter = new DisabledRoutingAdapter(),
    clock = () => new Date().toISOString(),
    caseReferenceFactory = () => createOpaqueIdentifier(16, 'case_'),
    acknowledgementEventIdFactory = () => createOpaqueIdentifier(16, 'sack_'),
    routingAttemptIdFactory = () => createOpaqueIdentifier(16, 'routeatt_'),
    testMode = false,
    interruptionHook = null,
  }) {
    requireValue(privateRecords && safety && registration && notifications && activationGate && catalog && contract, 'SUPPORT_DEPENDENCY_REQUIRED', 'B03 requires the B01/B02 domain ports and support contract');
    requireValue(systemActor, 'SYSTEM_ACTOR_REQUIRED', 'B03 requires a private system actor');
    const contractCategories = contract.routes.map((route) => route.category);
    requireValue(JSON.stringify(contractCategories) === JSON.stringify(SUPPORT_CATEGORIES), 'SUPPORT_CATEGORY_CONTRACT_MISMATCH', 'Support categories must match the committed contract');
    const resolver = routeResolver || new UnresolvedSupportRouteResolver(contract.routes);
    if (resolver.synthetic === true || routingAdapter.synthetic === true || interruptionHook) requireValue(testMode, 'SYNTHETIC_SUPPORT_COMPONENT_FORBIDDEN', 'Synthetic support components require explicit test mode');
    this.privateRecords = privateRecords;
    this.safety = safety;
    this.registration = registration;
    this.notifications = notifications;
    this.activationGate = activationGate;
    this.catalog = catalog;
    this.contract = clone(contract);
    this.authorize = authorize;
    this.systemActor = systemActor;
    this.routeResolver = resolver;
    this.routingAdapter = routingAdapter;
    this.clock = clock;
    this.caseReferenceFactory = caseReferenceFactory;
    this.acknowledgementEventIdFactory = acknowledgementEventIdFactory;
    this.routingAttemptIdFactory = routingAttemptIdFactory;
    this.testMode = testMode;
    this.interruptionHook = interruptionHook;
    this.commandLedger = new InMemoryOrchestrationLedger();
    this.caseReferencesByCommand = new Map();
    this.submittedTimesByCommand = new Map();
    this.acknowledgementIdsByCase = new Map();
    this.recordIdsByCase = new Map();
  }

  createCase({ actor, commandId, input }) {
    requireAuthorization(this.authorize, actor, 'SUPPORT_INTAKE_CREATE', { category: input?.category });
    this.validateInput(input);
    if (!this.authorize(actor, 'SUPPORT_INTAKE_CREATE_FOR_CUSTOMER', input)) requireValue(actor.customerReference === input.customerReference, 'SUPPORT_CUSTOMER_REFERENCE_MISMATCH', 'Submitters may create only their own synthetic cases');
    const caseReference = this.caseReferencesByCommand.get(commandId) || this.caseReferenceFactory();
    const submittedAt = this.submittedTimesByCommand.get(commandId) || this.clock();
    this.caseReferencesByCommand.set(commandId, caseReference);
    this.submittedTimesByCommand.set(commandId, submittedAt);
    return this.commandLedger.execute(commandId, { operation: 'createSupportCase', input }, () => {
      const registrationContext = this.resolveRegistrationContext(actor, input);
      const safetyAssessment = this.buildSafetyAssessment(input.safetyDisclosure);
      const recoveryObligations = [];
      if (registrationContext.status === 'REVIEW_REQUIRED') recoveryObligations.push('REGISTRATION_CONTEXT_REVIEW_REQUIRED');
      if (input.safetyDisclosure === 'AMBIGUOUS_REVIEW_REQUIRED') recoveryObligations.push('SAFETY_INFORMATION_REVIEW_REQUIRED');
      const intake = {
        caseReference,
        customerReference: input.customerReference,
        category: input.category,
        submittedAt,
        sourceChannel: input.sourceChannel,
        machineIdentity: input.productGid ? { productGid: input.productGid, variantGid: input.variantGid, productVersion: input.productVersion || null } : null,
        requestedRegistrationReference: input.registrationId || null,
        registrationContext,
        issueSummary: input.issueSummary || null,
        evidenceRefs: [...(input.evidenceRefs || [])],
        safetyDisclosure: input.safetyDisclosure,
        safetyAssessment,
        classification: { category: input.category, warrantyFinding: 'NOT_PERFORMED', diagnosticFinding: 'NOT_PERFORMED' },
        routing: {
          status: input.safetyDisclosure === 'AMBIGUOUS_REVIEW_REQUIRED' ? 'SAFETY_REVIEW_REQUIRED' : 'NOT_RESOLVED',
          intendedRoute: input.category,
          eligibility: input.safetyDisclosure === 'AMBIGUOUS_REVIEW_REQUIRED' ? 'BLOCKED_PENDING_SAFETY_REVIEW' : 'NOT_EVALUATED',
          configuredPrimary: null,
          configuredBackup: null,
          assignedOwner: null,
          assignedBackup: null,
          attempt: null,
          handoffStatus: 'NOT_ACKNOWLEDGED',
        },
        acknowledgement: { status: 'NOT_CREATED', eventId: null, notificationId: null, history: [], deliveryEvidence: null },
        recoveryObligations,
        externalBoundaries: this.externalBoundaries(input.category),
        continuousMonitoring: false,
        customerActivationPermitted: false,
      };
      const created = this.safety.createCase({
        actor: this.recordActor(actor),
        commandId: `${commandId}:case`,
        destinationReference: input.notificationDestinationReference,
        initialState: 'SUBMITTED',
        syntheticFacts: { supportIntake: intake },
      });
      this.recordIdsByCase.set(caseReference, created.recordId);
      this.interrupt('AFTER_CASE_PERSISTED', { caseReference });
      let current = this.readRecord(actor, caseReference);
      if (input.safetyDisclosure === 'EXPLICIT_HAZARD' && !current.data.safetyHoldActive) {
        const interrupted = this.safety.interruptForHazard({
          actor: this.recordActor(actor),
          commandId: `${commandId}:safety`,
          caseRecordId: current.recordId,
          expectedVersion: current.version,
          hazard: {
            reportedAt: submittedAt,
            sourceChannel: input.sourceChannel,
            reportedSymptoms: input.hazardEvidenceRef,
            productGid: input.productGid || null,
            variantGid: input.variantGid || null,
          },
        });
        current = interrupted.caseRecord;
        if (interrupted.notification.state !== 'DELIVERY_CONFIRMED') {
          current = this.updateIntake(current, actor, `${commandId}:safety-recovery`, {
            recoveryObligations: this.addObligation(this.intake(current).recoveryObligations, 'STOP_USE_WARNING_DELIVERY_UNRESOLVED'),
          }, 'SUPPORT_WARNING_RECOVERY_RECORDED');
        }
      }
      this.interrupt('AFTER_SAFETY_PRIORITY_APPLIED', { caseReference, state: current.state });
      return { case: this.ownerView(current), intakeOutcome: current.state === 'SAFETY_HOLD' ? 'SAFETY_HOLD' : input.safetyDisclosure === 'AMBIGUOUS_REVIEW_REQUIRED' ? 'SAFETY_REVIEW_REQUIRED' : 'RECEIVED' };
    });
  }

  getPrivateCase({ actor, caseReference }) {
    const record = this.readRecord(actor, caseReference);
    if (this.authorize(actor, 'SUPPORT_CASE_PRIVATE_READ', record)) return clone(record);
    this.requireOwner(actor, record, 'SUPPORT_CASE_READ_OWN');
    return this.ownerView(record);
  }

  getPublicHandle(caseReference) {
    const record = this.readRecord(this.systemActor, caseReference);
    const intake = this.intake(record);
    return deepFreeze({
      caseReference,
      processingStatus: record.state === 'CLOSED' ? 'CLOSED' : record.state === 'SAFETY_HOLD' || intake.safetyDisclosure === 'AMBIGUOUS_REVIEW_REQUIRED' ? 'REVIEW_REQUIRED' : 'PROCESSING',
      customerActivationPermitted: false,
    });
  }

  auditTrail({ actor, caseReference }) {
    const record = this.readRecord(actor, caseReference);
    if (!this.authorize(actor, 'SUPPORT_CASE_AUDIT_READ', record)) this.requireOwner(actor, record, 'SUPPORT_CASE_READ_OWN');
    return this.privateRecords.auditTrail({ actor: this.recordActor(actor), recordId: record.recordId });
  }

  createAcknowledgement({ actor, commandId, caseReference, expectedVersion }) {
    return this.commandLedger.execute(commandId, { operation: 'createCaseAcknowledgement', caseReference, expectedVersion }, () => {
      let record = this.readRecord(actor, caseReference);
      this.requireOwnerOrPermission(actor, record, 'SUPPORT_ACKNOWLEDGE', 'SUPPORT_ACKNOWLEDGE_OWN');
      this.requireVersion(record, expectedVersion);
      let intake = this.intake(record);
      if (intake.acknowledgement.status !== 'NOT_CREATED') return this.acknowledgementView(record);
      requireValue(record.state !== 'SAFETY_HOLD' || record.data.safetyInterruption?.stopUseWarning, 'SAFETY_WARNING_REQUIRED_BEFORE_ACKNOWLEDGEMENT', 'Safety warning generation must precede ordinary acknowledgement');
      const eventId = this.acknowledgementIdsByCase.get(caseReference) || this.acknowledgementEventIdFactory();
      this.acknowledgementIdsByCase.set(caseReference, eventId);
      record = this.updateIntake(record, actor, `${commandId}:event`, {
        acknowledgement: {
          status: 'CREATED', eventId, notificationId: null, deliveryEvidence: null,
          history: [{ status: 'CREATED', occurredAt: this.clock() }],
          policyPromiseAuthorized: false, staffAssignmentConfirmed: false, continuousMonitoringImplied: false,
        },
      }, 'SUPPORT_ACKNOWLEDGEMENT_CREATED');
      this.interrupt('AFTER_SUPPORT_ACKNOWLEDGEMENT_CREATED', { caseReference, eventId });
      record = this.queueAcknowledgement(record, actor, eventId);
      this.interrupt('AFTER_SUPPORT_ACKNOWLEDGEMENT_LINKED', { caseReference, eventId });
      return this.acknowledgementView(record);
    });
  }

  attemptAcknowledgementDelivery({ actor, commandId, caseReference, expectedVersion }) {
    return this.commandLedger.execute(commandId, { operation: 'attemptSupportAcknowledgement', caseReference, expectedVersion }, () => {
      let record = this.readRecord(actor, caseReference);
      this.requireOwnerOrPermission(actor, record, 'SUPPORT_ACKNOWLEDGE', 'SUPPORT_ACKNOWLEDGE_OWN');
      this.requireVersion(record, expectedVersion);
      const acknowledgement = this.intake(record).acknowledgement;
      requireValue(acknowledgement.notificationId, 'SUPPORT_ACKNOWLEDGEMENT_NOT_QUEUED', 'Support acknowledgement is not queued');
      let notification = this.notifications.attempt({ actor: this.systemActor, commandId: `${commandId}:notification`, notificationId: acknowledgement.notificationId });
      if (notification.state === 'DELIVERY_FAILED') notification = this.notifications.requireRecovery({ actor: this.systemActor, commandId: `${commandId}:notification:recovery`, notificationId: notification.notificationId, reason: 'SUPPORT_ACKNOWLEDGEMENT_DELIVERY_FAILED' });
      return this.applyAcknowledgementNotification(record, actor, commandId, notification);
    });
  }

  recoverAcknowledgement({ actor, commandId, caseReference, expectedVersion, action = 'RESUME_QUEUE', reconciliation = null }) {
    requireAuthorization(this.authorize, actor, 'SUPPORT_RECOVER', { caseReference });
    return this.commandLedger.execute(commandId, { operation: 'recoverSupportAcknowledgement', caseReference, expectedVersion, action, reconciliation }, () => {
      let record = this.readRecord(actor, caseReference);
      this.requireVersion(record, expectedVersion);
      const acknowledgement = this.intake(record).acknowledgement;
      requireValue(acknowledgement.status !== 'NOT_CREATED', 'SUPPORT_ACKNOWLEDGEMENT_NOT_CREATED', 'No support acknowledgement exists to recover');
      if (!acknowledgement.notificationId) return this.queueAcknowledgement(record, actor, acknowledgement.eventId);
      let notification = this.notifications.get(acknowledgement.notificationId);
      if (action === 'RESUME_QUEUE' && notification.state === 'PENDING') return this.acknowledgementView(record);
      if (action === 'RETRY_DELIVERY') {
        notification = this.notifications.attempt({ actor: this.systemActor, commandId: `${commandId}:retry`, notificationId: notification.notificationId });
        if (notification.state === 'DELIVERY_FAILED') notification = this.notifications.requireRecovery({ actor: this.systemActor, commandId: `${commandId}:retry:recovery`, notificationId: notification.notificationId, reason: 'SUPPORT_ACKNOWLEDGEMENT_RETRY_FAILED' });
      } else if (action === 'RECONCILE') {
        requireValue(reconciliation, 'RECONCILIATION_EVIDENCE_REQUIRED', 'Reconciliation evidence is required');
        notification = this.notifications.reconcile({ actor: this.systemActor, commandId: `${commandId}:reconcile`, notificationId: notification.notificationId, ...reconciliation });
      } else if (action !== 'RESUME_QUEUE') {
        throw new TransitionError('UNKNOWN_RECOVERY_ACTION', 'Unknown support recovery actions fail closed');
      }
      record = this.readRecord(actor, caseReference);
      return this.applyAcknowledgementNotification(record, actor, commandId, notification);
    });
  }

  resolveRoutingIntent({ actor, commandId, caseReference, expectedVersion }) {
    requireAuthorization(this.authorize, actor, 'SUPPORT_ROUTE_RESOLVE', { caseReference });
    return this.commandLedger.execute(commandId, { operation: 'resolveRoutingIntent', caseReference, expectedVersion }, () => {
      const record = this.readRecord(actor, caseReference);
      this.requireVersion(record, expectedVersion);
      const intake = this.intake(record);
      let routing;
      let obligation = null;
      if (record.state === 'SAFETY_HOLD') {
        routing = { ...intake.routing, status: 'BLOCKED_SAFETY_HOLD', eligibility: 'BLOCKED_SAFETY_HOLD' };
      } else if (intake.safetyDisclosure === 'AMBIGUOUS_REVIEW_REQUIRED') {
        routing = { ...intake.routing, status: 'SAFETY_REVIEW_REQUIRED', eligibility: 'BLOCKED_PENDING_SAFETY_REVIEW' };
        obligation = 'SAFETY_INFORMATION_REVIEW_REQUIRED';
      } else {
        const route = this.routeResolver.resolve(intake.category);
        if (route.status !== 'APPROVED') {
          routing = { ...intake.routing, status: 'PENDING_CONFIGURATION', eligibility: 'BLOCKED_UNAPPROVED_ROUTE', configuredPrimary: null, configuredBackup: null };
          obligation = 'ROUTING_CONFIGURATION_UNRESOLVED';
        } else {
          requireValue(route.primaryReference && route.backupReference, 'APPROVED_ROUTE_INCOMPLETE', 'Approved routes require primary and backup references');
          routing = { ...intake.routing, status: 'ELIGIBLE', eligibility: 'ELIGIBLE', configuredPrimary: route.primaryReference, configuredBackup: route.backupReference, destination: route.destination || null };
        }
      }
      return this.updateIntake(record, actor, `${commandId}:record`, {
        routing,
        recoveryObligations: this.replaceObligations(intake.recoveryObligations, ['ROUTING_CONFIGURATION_UNRESOLVED'], obligation),
      }, 'SUPPORT_ROUTING_INTENT_RESOLVED');
    });
  }

  attemptRouting({ actor, commandId, caseReference, expectedVersion }) {
    requireAuthorization(this.authorize, actor, 'SUPPORT_ROUTE_ATTEMPT', { caseReference });
    return this.commandLedger.execute(commandId, { operation: 'attemptRouting', caseReference, expectedVersion }, () => {
      let record = this.readRecord(actor, caseReference);
      this.requireVersion(record, expectedVersion);
      requireValue(record.state !== 'SAFETY_HOLD', 'ACTIVE_SAFETY_HOLD', 'Routing cannot bypass an active safety hold');
      const intake = this.intake(record);
      requireValue(intake.routing.status === 'ELIGIBLE', 'SUPPORT_ROUTE_NOT_ELIGIBLE', 'Support route is not approved and eligible');
      const attemptId = this.routingAttemptIdFactory();
      const result = this.routingAdapter.route({ attemptId, caseReference, category: intake.category, routeReference: intake.routing.configuredPrimary });
      requireValue(['QUEUED', 'FAILED', 'UNCERTAIN'].includes(result.outcome), 'UNKNOWN_ROUTING_OUTCOME', 'Unknown routing outcomes fail closed');
      const failed = result.outcome !== 'QUEUED';
      const routing = {
        ...intake.routing,
        status: failed ? 'RECOVERY_REQUIRED' : 'ROUTING_ATTEMPTED',
        attempt: { attemptId, attemptedAt: this.clock(), outcome: result.outcome, evidence: clone(result.evidence || null) },
        handoffStatus: 'NOT_ACKNOWLEDGED',
        assignedOwner: null,
        assignedBackup: null,
      };
      record = this.updateIntake(record, actor, `${commandId}:record`, {
        routing,
        recoveryObligations: this.replaceObligations(intake.recoveryObligations, ['ROUTING_DELIVERY_UNRESOLVED'], failed ? 'ROUTING_DELIVERY_UNRESOLVED' : null),
      }, failed ? 'SUPPORT_ROUTING_RECOVERY_REQUIRED' : 'SUPPORT_ROUTING_ATTEMPTED');
      if (failed && record.state !== 'RECOVERY_REQUIRED') {
        record = this.safety.ordinaryTransition({ actor: this.recordActor(actor), commandId: `${commandId}:recovery-state`, caseRecordId: record.recordId, expectedVersion: record.version, toState: 'RECOVERY_REQUIRED' });
      }
      return record;
    });
  }

  acknowledgeRoutingHandoff({ actor, commandId, caseReference, expectedVersion, evidenceRefs }) {
    requireAuthorization(this.authorize, actor, 'SUPPORT_ROUTE_HANDOFF_ACKNOWLEDGE', { caseReference });
    requireValue(Array.isArray(evidenceRefs) && evidenceRefs.length > 0, 'ROUTING_HANDOFF_EVIDENCE_REQUIRED', 'Routing handoff acknowledgement requires evidence');
    return this.commandLedger.execute(commandId, { operation: 'acknowledgeRoutingHandoff', caseReference, expectedVersion, evidenceRefs }, () => {
      const record = this.readRecord(actor, caseReference);
      this.requireVersion(record, expectedVersion);
      const intake = this.intake(record);
      requireValue(intake.routing.status === 'ROUTING_ATTEMPTED' && intake.routing.attempt?.outcome === 'QUEUED', 'ROUTING_HANDOFF_NOT_ATTEMPTED', 'A queued routing attempt is required before handoff acknowledgement');
      return this.updateIntake(record, actor, `${commandId}:record`, {
        routing: {
          ...intake.routing,
          status: 'HANDOFF_ACKNOWLEDGED',
          handoffStatus: 'ACKNOWLEDGED',
          assignedOwner: intake.routing.configuredPrimary,
          assignedBackup: intake.routing.configuredBackup,
          handoffEvidenceRefs: [...evidenceRefs],
          handoffAcknowledgedAt: this.clock(),
        },
      }, 'SUPPORT_ROUTING_HANDOFF_ACKNOWLEDGED');
    });
  }

  transitionCase({ actor, commandId, caseReference, expectedVersion, toState }) {
    requireAuthorization(this.authorize, actor, 'SUPPORT_CASE_TRANSITION', { caseReference, toState });
    const record = this.readRecord(actor, caseReference);
    this.requireVersion(record, expectedVersion);
    if (toState === 'ACKNOWLEDGED') {
      const acknowledgement = this.intake(record).acknowledgement;
      requireValue(acknowledgement.eventId && acknowledgement.notificationId, 'SUPPORT_ACKNOWLEDGEMENT_REQUIRED', 'Case acknowledgement state requires a persisted acknowledgement event and queued notification obligation');
    }
    return this.safety.ordinaryTransition({ actor: this.recordActor(actor), commandId, caseRecordId: record.recordId, expectedVersion, toState });
  }

  authorizedSafetyDisposition({ actor, commandId, caseReference, expectedVersion, toState, dispositionRecord }) {
    requireAuthorization(this.authorize, actor, 'SAFETY_DISPOSITION', { caseReference, toState });
    const record = this.readRecord(actor, caseReference);
    this.requireVersion(record, expectedVersion);
    return this.safety.authorizedSafetyDisposition({ actor: this.recordActor(actor), commandId, caseRecordId: record.recordId, expectedVersion, toState, dispositionRecord });
  }

  recordManufacturerReferralIntent({ actor, commandId, caseReference, expectedVersion, evidencePackageReference, rhinoFollowUpReference }) {
    requireAuthorization(this.authorize, actor, 'SUPPORT_MANUFACTURER_REFERRAL_INTENT', { caseReference });
    requireValue(/^synthetic:/.test(evidencePackageReference || '') && /^staff_syn_/.test(rhinoFollowUpReference || ''), 'MANUFACTURER_REFERRAL_EVIDENCE_REQUIRED', 'Synthetic evidence package and Rhino follow-up references are required');
    return this.commandLedger.execute(commandId, { operation: 'manufacturerReferralIntent', caseReference, expectedVersion, evidencePackageReference, rhinoFollowUpReference }, () => {
      const record = this.readRecord(actor, caseReference);
      this.requireVersion(record, expectedVersion);
      const intake = this.intake(record);
      requireValue(intake.category === 'MANUFACTURER_REFERRAL', 'MANUFACTURER_REFERRAL_CATEGORY_REQUIRED', 'Case is not classified for manufacturer referral');
      return this.updateIntake(record, actor, `${commandId}:record`, {
        externalBoundaries: {
          ...intake.externalBoundaries,
          manufacturerReferral: {
            destination: 'Silica-Gem',
            status: 'PROPOSED_NOT_SUBMITTED',
            proposedAt: this.clock(),
            evidencePackageReference,
            customerCommunicationEvidence: null,
            manufacturerAcknowledgement: null,
            rhinoFollowUpReference,
            rhinoCaseOwnershipRetained: true,
            rhinoCommunicationResponsibilityRetained: true,
            externalSubmissionPerformed: false,
          },
        },
      }, 'SUPPORT_MANUFACTURER_REFERRAL_INTENT_RECORDED');
    });
  }

  assertCustomerActivationBlocked() { this.activationGate.assertPermitted('SUPPORT_INTAKE_ACTIVATION'); }

  validateInput(input) {
    const allowed = ['customerReference', 'notificationDestinationReference', 'category', 'sourceChannel', 'productGid', 'variantGid', 'productVersion', 'registrationId', 'issueSummary', 'evidenceRefs', 'safetyDisclosure', 'hazardEvidenceRef'];
    requireValue(input && Object.keys(input).every((key) => allowed.includes(key)), 'UNSUPPORTED_SUPPORT_INPUT', 'Support intake contains unsupported or excessive data');
    requireValue(/^cus_[A-Za-z0-9_-]{16,}$/.test(input.customerReference || ''), 'OPAQUE_CUSTOMER_REFERENCE_REQUIRED', 'Synthetic opaque customer reference is required');
    requireValue(/^dst_[A-Za-z0-9_-]{16,}$/.test(input.notificationDestinationReference || ''), 'OPAQUE_DESTINATION_REQUIRED', 'Synthetic opaque destination reference is required');
    requireValue(SUPPORT_CATEGORIES.includes(input.category), 'UNKNOWN_SUPPORT_CATEGORY', 'Unknown support categories fail closed');
    requireValue(['SYNTHETIC_WEB_FORM', 'SYNTHETIC_INTERNAL', 'SYNTHETIC_PHONE_TRANSCRIPT_REFERENCE'].includes(input.sourceChannel), 'INVALID_SUPPORT_SOURCE_CHANNEL', 'Only synthetic source channels are accepted');
    requireValue(SAFETY_DISCLOSURES.includes(input.safetyDisclosure), 'INVALID_SAFETY_DISCLOSURE', 'Safety disclosure state is required');
    requireValue((typeof input.issueSummary === 'string' && /^SYNTHETIC_[A-Z0-9_:-]{3,}$/.test(input.issueSummary)) || (Array.isArray(input.evidenceRefs) && input.evidenceRefs.length > 0), 'MINIMIZED_SUPPORT_EVIDENCE_REQUIRED', 'A synthetic summary code or evidence reference is required');
    requireValue((input.evidenceRefs || []).every((reference) => /^synthetic:/.test(reference)), 'SYNTHETIC_EVIDENCE_REFERENCE_REQUIRED', 'Only synthetic evidence references are accepted');
    if (input.productGid || input.variantGid) {
      requireValue(input.productGid && input.variantGid, 'COMPLETE_MACHINE_IDENTITY_REQUIRED', 'Product and Variant identity must be supplied together');
      this.catalog.assertRelationship(input.productGid, input.variantGid);
    }
    if (input.registrationId) requireValue(/^reg_[A-Za-z0-9_-]{16,}$/.test(input.registrationId), 'INVALID_REGISTRATION_REFERENCE', 'Registration reference is not opaque');
    if (input.safetyDisclosure === 'EXPLICIT_HAZARD') requireValue(/^synthetic:hazard:/.test(input.hazardEvidenceRef || ''), 'HAZARD_EVIDENCE_REQUIRED', 'Explicit hazards require a synthetic evidence reference');
    requireValue(!/@|\d{3}[-.) ]?\d{3}[-. ]?\d{4}/.test(`${input.issueSummary || ''} ${(input.evidenceRefs || []).join(' ')}`), 'REAL_CUSTOMER_DATA_FORBIDDEN', 'Real contact data is forbidden in B03');
  }

  resolveRegistrationContext(actor, input) {
    if (!input.registrationId) return { status: 'NOT_PROVIDED', readOnly: true, eligibilityInferred: false };
    try {
      const registration = this.registration.getPrivateRegistration({ actor, registrationId: input.registrationId });
      if (registration.data.customerReference !== input.customerReference) return { status: 'REVIEW_REQUIRED', readOnly: true, eligibilityInferred: false };
      return {
        status: 'AUTHORIZED_CONTEXT',
        registrationId: input.registrationId,
        machineIdentity: { productGid: registration.data.productGid, variantGid: registration.data.variantGid, productVersion: registration.data.productVersion },
        ownershipVerificationState: registration.data.ownershipVerification.status,
        registrationState: registration.state,
        readOnly: true,
        eligibilityInferred: false,
        warrantyFinding: 'NOT_PERFORMED',
      };
    } catch (_error) {
      return { status: 'REVIEW_REQUIRED', readOnly: true, eligibilityInferred: false };
    }
  }

  buildSafetyAssessment(disclosure) {
    if (disclosure === 'EXPLICIT_HAZARD') return { status: 'HAZARD_DECLARED', automaticSafeFinding: false, diagnosisPerformed: false };
    if (disclosure === 'AMBIGUOUS_REVIEW_REQUIRED') return { status: 'HUMAN_REVIEW_REQUIRED', automaticSafeFinding: false, diagnosisPerformed: false };
    return { status: 'NO_HAZARD_REPORTED_NOT_A_SAFE_FINDING', automaticSafeFinding: false, diagnosisPerformed: false };
  }

  externalBoundaries(category) {
    return {
      warrantyDecision: { requiredAuthority: 'FUTURE_L_PBI_013_HUMAN_AUTHORITY', status: 'NOT_PERFORMED', approval: null, denial: null, remedy: null },
      technicalGuidance: { status: 'NOT_GENERATED', autonomousDiagnosis: false, approvedResourcesOnly: true, kevinApprovalRequired: true },
      manufacturerReferral: category === 'MANUFACTURER_REFERRAL' ? { destination: 'Silica-Gem', status: 'NOT_PROPOSED', externalSubmissionPerformed: false, rhinoCaseOwnershipRetained: true, rhinoCommunicationResponsibilityRetained: true } : null,
      carrierClaim: category === 'SHIPPING_CLAIM' ? { status: 'CLASSIFIED_ONLY', externalSubmissionPerformed: false, compensationDecision: null, checkoutModified: false } : null,
      quotationWorkflowUsed: false,
    };
  }

  queueAcknowledgement(record, actor, eventId) {
    const intake = this.intake(record);
    const queued = this.notifications.queue({ actor: this.systemActor, commandId: `support:${intake.caseReference}:ack:${eventId}:queue`, domainEventId: eventId, destinationReference: record.data.destinationReference, channel: 'SYNTHETIC_INTERNAL', messageClass: 'SYNTHETIC_SUPPORT_ACKNOWLEDGEMENT_NO_POLICY_PROMISES' });
    this.interrupt('AFTER_SUPPORT_ACKNOWLEDGEMENT_QUEUED', { caseReference: intake.caseReference, eventId, notificationId: queued.notificationId });
    let latest = this.readRecord(actor, intake.caseReference);
    latest = this.updateIntake(latest, actor, `support:${intake.caseReference}:ack:${eventId}:link`, {
      acknowledgement: { ...this.intake(latest).acknowledgement, status: 'NOTIFICATION_QUEUED', notificationId: queued.notificationId, history: [...this.intake(latest).acknowledgement.history, { status: 'NOTIFICATION_QUEUED', occurredAt: this.clock(), notificationId: queued.notificationId }] },
    }, 'SUPPORT_ACKNOWLEDGEMENT_NOTIFICATION_QUEUED');
    if (latest.state === 'SUBMITTED' && this.intake(latest).safetyDisclosure === 'NO_HAZARD_REPORTED') {
      latest = this.safety.ordinaryTransition({ actor: this.recordActor(actor), commandId: `support:${intake.caseReference}:ack:${eventId}:state`, caseRecordId: latest.recordId, expectedVersion: latest.version, toState: 'ACKNOWLEDGED' });
    }
    return latest;
  }

  applyAcknowledgementNotification(record, actor, commandId, notification) {
    const confirmed = notification.state === 'DELIVERY_CONFIRMED';
    const unresolved = ['DELIVERY_FAILED', 'RECOVERY_REQUIRED'].includes(notification.state);
    const status = confirmed ? 'DELIVERY_CONFIRMED' : unresolved ? 'RECOVERY_REQUIRED' : 'DELIVERY_ATTEMPTED';
    let intake = this.intake(record);
    const history = [...intake.acknowledgement.history];
    for (const attempt of notification.attempts || []) if (!history.some((entry) => entry.attemptId === attempt.attemptId)) history.push({ status: 'DELIVERY_ATTEMPTED', occurredAt: attempt.attemptedAt, attemptId: attempt.attemptId });
    history.push({ status, occurredAt: this.clock(), notificationId: notification.notificationId, deliveryEvidence: confirmed ? clone(notification.deliveryEvidence) : null });
    record = this.updateIntake(record, actor, `${commandId}:ack-record`, {
      acknowledgement: { ...intake.acknowledgement, status, history, deliveryEvidence: confirmed ? clone(notification.deliveryEvidence) : null },
      recoveryObligations: this.replaceObligations(intake.recoveryObligations, ['SUPPORT_ACKNOWLEDGEMENT_DELIVERY_UNRESOLVED'], confirmed ? null : 'SUPPORT_ACKNOWLEDGEMENT_DELIVERY_UNRESOLVED'),
    }, confirmed ? 'SUPPORT_ACKNOWLEDGEMENT_DELIVERY_CONFIRMED' : 'SUPPORT_ACKNOWLEDGEMENT_RECOVERY_REQUIRED');
    if (unresolved) {
      record = this.safety.recordNotificationRecovery({ actor: this.recordActor(actor), commandId: `${commandId}:notification-recovery`, caseRecordId: record.recordId, expectedVersion: record.version, notificationId: notification.notificationId });
      if (record.state !== 'SAFETY_HOLD' && record.state !== 'RECOVERY_REQUIRED') record = this.safety.ordinaryTransition({ actor: this.recordActor(actor), commandId: `${commandId}:recovery-state`, caseRecordId: record.recordId, expectedVersion: record.version, toState: 'RECOVERY_REQUIRED' });
    } else if (confirmed && record.data.unresolvedNotificationIds.includes(notification.notificationId)) {
      record = this.safety.clearReconciledNotification({ actor: this.recordActor(actor), commandId: `${commandId}:notification-clear`, caseRecordId: record.recordId, expectedVersion: record.version, notificationId: notification.notificationId });
    }
    return record;
  }

  updateIntake(record, actor, commandId, patch, eventType) {
    const current = this.intake(record);
    return this.privateRecords.update({
      actor: this.recordActor(actor), commandId, recordId: record.recordId, expectedVersion: record.version, nextState: record.state,
      patch: { syntheticFacts: { ...record.data.syntheticFacts, supportIntake: { ...current, ...clone(patch) } } },
      eventType, eventDetails: { requestedBy: actor.actorId },
    });
  }

  intake(record) { return record.data.syntheticFacts.supportIntake; }

  readRecord(actor, caseReference) {
    const recordId = this.recordIdsByCase.get(caseReference);
    requireValue(recordId, 'SUPPORT_CASE_NOT_FOUND', 'Support case was not found');
    return this.privateRecords.read({ actor: this.recordActor(actor), recordId });
  }

  recordActor(actor) { return { actorId: actor?.actorId || this.systemActor.actorId, permissions: [...this.systemActor.permissions] }; }

  requireOwner(actor, record, permission) {
    if (!actor || !this.authorize(actor, permission, record) || actor.customerReference !== this.intake(record).customerReference) throw new AuthorizationError('SUPPORT_CASE_ACCESS_DENIED', 'Support case access is not authorized');
  }

  requireOwnerOrPermission(actor, record, elevatedPermission, ownPermission) {
    if (this.authorize(actor, elevatedPermission, record)) return;
    this.requireOwner(actor, record, ownPermission);
  }

  requireVersion(record, expectedVersion) {
    if (record.version !== expectedVersion) throw new ConflictError('RECORD_VERSION_CONFLICT', 'Expected support case version does not match', { expectedVersion, actualVersion: record.version });
  }

  ownerView(record) {
    const view = clone(record);
    const intake = view.data.syntheticFacts.supportIntake;
    if (intake.registrationContext.status === 'REVIEW_REQUIRED') intake.registrationContext = { status: 'REVIEW_REQUIRED', readOnly: true, eligibilityInferred: false };
    intake.routing.configuredPrimary = null;
    intake.routing.configuredBackup = null;
    intake.routing.assignedOwner = null;
    intake.routing.assignedBackup = null;
    return view;
  }

  acknowledgementView(record) {
    const intake = this.intake(record);
    return clone({ caseReference: intake.caseReference, category: intake.category, submittedAt: intake.submittedAt, acknowledgementEventId: intake.acknowledgement.eventId, notificationId: intake.acknowledgement.notificationId, acknowledgementStatus: intake.acknowledgement.status, routingStatus: intake.routing.status, policyPromiseAuthorized: false, staffAssignmentConfirmed: intake.routing.handoffStatus === 'ACKNOWLEDGED', continuousMonitoringImplied: false });
  }

  addObligation(obligations, code) { return obligations.includes(code) ? [...obligations] : [...obligations, code]; }

  replaceObligations(obligations, codes, replacement) {
    const next = obligations.filter((item) => !codes.includes(typeof item === 'string' ? item : item.code));
    if (replacement && !next.includes(replacement)) next.push(replacement);
    return next;
  }

  interrupt(stage, context) { if (this.interruptionHook) this.interruptionHook(stage, clone(context)); }
}

module.exports = {
  ACKNOWLEDGEMENT_STATES,
  DisabledRoutingAdapter,
  GovernedSupportIntakeService,
  SAFETY_DISCLOSURES,
  SUPPORT_CATEGORIES,
  SyntheticRoutingAdapter,
  SyntheticSupportRouteResolver,
  UnresolvedSupportRouteResolver,
};
