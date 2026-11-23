'use strict';

const {
  TransitionError,
  clone,
  createOpaqueIdentifier,
  requireAuthorization,
  requireValue,
} = require('./common');

class SupportSafetyService {
  constructor({
    contract,
    privateRecords,
    notifications,
    authorize = () => false,
    systemActor,
    clock = () => new Date().toISOString(),
    domainEventIdFactory = () => createOpaqueIdentifier(16, 'evt_'),
    testMode = false,
  }) {
    requireValue(contract?.stateMachine, 'SUPPORT_CONTRACT_REQUIRED', 'The committed support/safety transition contract is required');
    requireValue(privateRecords, 'PRIVATE_RECORD_STORE_REQUIRED', 'A private record store is required');
    requireValue(notifications, 'NOTIFICATION_OUTBOX_REQUIRED', 'A notification outbox is required');
    requireValue(systemActor, 'SYSTEM_ACTOR_REQUIRED', 'A private system actor is required');
    this.contract = clone(contract);
    this.privateRecords = privateRecords;
    this.notifications = notifications;
    this.authorize = authorize;
    this.systemActor = systemActor;
    this.clock = clock;
    this.domainEventIdFactory = domainEventIdFactory;
    this.testMode = testMode;
  }

  createCase({ actor, commandId, destinationReference, initialState = 'SUBMITTED', syntheticFacts = {} }) {
    requireAuthorization(this.authorize, actor, 'SUPPORT_CASE_CREATE', { initialState });
    requireValue(initialState === 'SUBMITTED' || this.testMode, 'INVALID_INITIAL_SUPPORT_STATE', 'Operational cases must begin in SUBMITTED');
    requireValue(this.contract.stateMachine.states.includes(initialState), 'UNKNOWN_SUPPORT_STATE', 'Unknown support states fail closed');
    requireValue(/^dst_[A-Za-z0-9_-]{16,}$/.test(destinationReference || ''), 'OPAQUE_DESTINATION_REQUIRED', 'Support destinations must use an opaque reference');
    return this.privateRecords.create({
      actor,
      commandId,
      category: 'SUPPORT_CASE',
      state: initialState,
      data: {
        destinationReference,
        safetyHoldActive: initialState === 'SAFETY_HOLD',
        safetyInterruption: null,
        warningNotificationId: null,
        unresolvedNotificationIds: [],
        rhinoCaseOwnershipRetained: true,
        rhinoCommunicationResponsibilityRetained: true,
        continuousMonitoring: false,
        staffHandlingStatus: 'PENDING_APPROVED_BUSINESS_HOURS',
        syntheticFacts: clone(syntheticFacts),
      },
    });
  }

  ordinaryTransition({ actor, commandId, caseRecordId, expectedVersion, toState }) {
    const current = this.privateRecords.read({ actor, recordId: caseRecordId });
    requireValue(this.contract.stateMachine.states.includes(toState), 'UNKNOWN_SUPPORT_STATE', 'Unknown support states fail closed');
    if (current.state === 'SAFETY_HOLD' || current.data.safetyHoldActive) {
      throw new TransitionError('ACTIVE_SAFETY_HOLD', 'Ordinary transitions are locked while a safety hold is active');
    }
    const allowed = this.contract.stateMachine.ordinaryTransitions.some((transition) => transition.from === current.state && transition.to === toState);
    requireValue(allowed, 'UNKNOWN_OR_UNAUTHORIZED_TRANSITION', 'Transition is not authorized by the committed contract', { from: current.state, to: toState });
    if (this.contract.stateMachine.transitionGuards.notificationDeliveryFailureBlocks.includes(toState)) {
      requireValue(current.data.unresolvedNotificationIds.length === 0, 'UNRESOLVED_NOTIFICATION_BLOCKS_CASE_COMPLETION', 'Notification recovery must be reconciled before resolution or closure');
    }
    const patch = {};
    if (toState === 'MANUFACTURER_ESCALATED') {
      patch.rhinoCaseOwnershipRetained = true;
      patch.rhinoCommunicationResponsibilityRetained = true;
      patch.manufacturerDestination = this.contract.stateMachine.manufacturerDestination;
      patch.manufacturerHandoffStatus = 'UNRESOLVED';
    }
    return this.privateRecords.update({
      actor,
      commandId,
      recordId: caseRecordId,
      expectedVersion,
      nextState: toState,
      patch,
      eventType: 'SUPPORT_CASE_ORDINARY_TRANSITION',
    });
  }

  interruptForHazard({ actor, commandId, caseRecordId, expectedVersion, hazard, warningChannel = 'SYNTHETIC_INTERNAL' }) {
    requireAuthorization(this.authorize, actor, 'SAFETY_INTERRUPT', { caseRecordId });
    const current = this.privateRecords.read({ actor, recordId: caseRecordId });
    const relevant = this.contract.stateMachine.globalSafetyInterruption.relevantNonterminalStates;
    requireValue(relevant.includes(current.state), 'SAFETY_INTERRUPT_NOT_ALLOWED', 'Hazard interruption is not authorized from this state', { state: current.state });
    requireValue(hazard && hazard.reportedAt && hazard.sourceChannel && hazard.reportedSymptoms, 'HAZARD_EVIDENCE_REQUIRED', 'Hazard report time, source channel, and reported symptoms are required');
    const eventId = this.domainEventIdFactory();
    const held = this.privateRecords.update({
      actor,
      commandId: `${commandId}:hold`,
      recordId: caseRecordId,
      expectedVersion,
      nextState: 'SAFETY_HOLD',
      patch: {
        safetyHoldActive: true,
        safetyInterruption: {
          eventId,
          trigger: 'HAZARDOUS_INFORMATION_RECEIVED',
          hazard: clone(hazard),
          stopUseWarning: {
            eventType: 'STATIC_STOP_USE_WARNING_GENERATED',
            generatedAt: this.clock(),
            deliveryStatus: 'PENDING',
            diagnosticAdviceIncluded: false,
            continuousMonitoringImplied: false,
          },
        },
        staffHandlingStatus: 'PENDING_APPROVED_BUSINESS_HOURS',
      },
      eventType: 'SAFETY_INTERRUPT_ENTERED',
      eventDetails: { eventId },
    });
    const queued = this.notifications.queue({
      actor: this.systemActor,
      commandId: `${commandId}:warning:queue`,
      domainEventId: eventId,
      destinationReference: current.data.destinationReference,
      channel: warningChannel,
      messageClass: 'STATIC_APPROVED_STOP_USE_WARNING_REQUIRED',
    });
    const attempted = this.notifications.attempt({
      actor: this.systemActor,
      commandId: `${commandId}:warning:attempt`,
      notificationId: queued.notificationId,
    });
    const confirmed = attempted.state === 'DELIVERY_CONFIRMED';
    let finalNotification = attempted;
    if (attempted.state === 'DELIVERY_FAILED') {
      finalNotification = this.notifications.requireRecovery({
        actor: this.systemActor,
        commandId: `${commandId}:warning:recovery`,
        notificationId: queued.notificationId,
        reason: 'STOP_USE_WARNING_DELIVERY_FAILED',
      });
    }
    const updated = this.privateRecords.update({
      actor,
      commandId: `${commandId}:warning:record`,
      recordId: caseRecordId,
      expectedVersion: held.version,
      nextState: 'SAFETY_HOLD',
      patch: {
        warningNotificationId: queued.notificationId,
        unresolvedNotificationIds: confirmed ? [] : [queued.notificationId],
        safetyInterruption: {
          ...held.data.safetyInterruption,
          stopUseWarning: {
            ...held.data.safetyInterruption.stopUseWarning,
            deliveryStatus: confirmed ? 'DELIVERY_CONFIRMED' : 'RECOVERY_REQUIRED',
            deliveryEvidence: confirmed ? clone(attempted.deliveryEvidence) : null,
          },
        },
      },
      eventType: confirmed ? 'STOP_USE_WARNING_DELIVERY_CONFIRMED' : 'STOP_USE_WARNING_RECOVERY_REQUIRED',
      eventDetails: { notificationId: queued.notificationId, notificationState: finalNotification.state },
    });
    return { caseRecord: updated, notification: finalNotification };
  }

  reconcileWarning({ actor, commandId, caseRecordId, expectedVersion, outcome, evidence }) {
    const current = this.privateRecords.read({ actor, recordId: caseRecordId });
    requireValue(current.state === 'SAFETY_HOLD' && current.data.warningNotificationId, 'ACTIVE_WARNING_RECOVERY_REQUIRED', 'Warning reconciliation requires an active safety hold notification');
    const notification = this.notifications.reconcile({
      actor,
      commandId: `${commandId}:notification`,
      notificationId: current.data.warningNotificationId,
      outcome,
      evidence,
    });
    const confirmed = notification.state === 'DELIVERY_CONFIRMED';
    return this.privateRecords.update({
      actor,
      commandId: `${commandId}:case`,
      recordId: caseRecordId,
      expectedVersion,
      nextState: 'SAFETY_HOLD',
      patch: {
        unresolvedNotificationIds: confirmed ? [] : [notification.notificationId],
        safetyInterruption: {
          ...current.data.safetyInterruption,
          stopUseWarning: {
            ...current.data.safetyInterruption.stopUseWarning,
            deliveryStatus: confirmed ? 'DELIVERY_CONFIRMED' : 'DELIVERY_FAILED',
            deliveryEvidence: confirmed ? clone(notification.deliveryEvidence) : null,
          },
        },
      },
      eventType: 'STOP_USE_WARNING_RECONCILED',
      eventDetails: { outcome },
    });
  }

  recordNotificationRecovery({ actor, commandId, caseRecordId, expectedVersion, notificationId }) {
    const current = this.privateRecords.read({ actor, recordId: caseRecordId });
    const notification = this.notifications.get(notificationId);
    requireValue(['DELIVERY_FAILED', 'RECOVERY_REQUIRED'].includes(notification.state), 'NOTIFICATION_NOT_UNRESOLVED', 'Only failed or recovery-required notifications can block the case');
    const unresolved = [...new Set([...current.data.unresolvedNotificationIds, notificationId])];
    return this.privateRecords.update({
      actor,
      commandId,
      recordId: caseRecordId,
      expectedVersion,
      nextState: current.state,
      patch: { unresolvedNotificationIds: unresolved },
      eventType: 'SUPPORT_NOTIFICATION_RECOVERY_RECORDED',
      eventDetails: { notificationId, notificationState: notification.state },
    });
  }

  clearReconciledNotification({ actor, commandId, caseRecordId, expectedVersion, notificationId }) {
    const current = this.privateRecords.read({ actor, recordId: caseRecordId });
    const notification = this.notifications.get(notificationId);
    requireValue(notification.state === 'DELIVERY_CONFIRMED' || notification.state === 'TERMINAL_DISPOSITION', 'NOTIFICATION_RECONCILIATION_INCOMPLETE', 'Only evidenced delivery or authorized terminal disposition can clear notification recovery');
    return this.privateRecords.update({
      actor,
      commandId,
      recordId: caseRecordId,
      expectedVersion,
      nextState: current.state,
      patch: { unresolvedNotificationIds: current.data.unresolvedNotificationIds.filter((id) => id !== notificationId) },
      eventType: 'SUPPORT_NOTIFICATION_RECOVERY_CLEARED',
      eventDetails: { notificationId, notificationState: notification.state },
    });
  }

  authorizedSafetyDisposition({ actor, commandId, caseRecordId, expectedVersion, toState, dispositionRecord }) {
    requireAuthorization(this.authorize, actor, 'SAFETY_DISPOSITION', { caseRecordId, toState });
    const current = this.privateRecords.read({ actor, recordId: caseRecordId });
    requireValue(current.state === 'SAFETY_HOLD' && current.data.safetyHoldActive, 'NO_ACTIVE_SAFETY_HOLD', 'Safety disposition requires an active safety hold');
    const allowed = this.contract.stateMachine.safetyHoldExit.allowedTransitions.some((transition) => transition.from === 'SAFETY_HOLD' && transition.to === toState);
    requireValue(allowed, 'UNAUTHORIZED_SAFETY_HOLD_EXIT', 'Requested safety hold exit is not authorized');
    for (const field of this.contract.stateMachine.safetyHoldExit.requiredRecord) {
      requireValue(dispositionRecord && dispositionRecord[field] !== undefined && dispositionRecord[field] !== null && dispositionRecord[field] !== '', 'SAFETY_DISPOSITION_EVIDENCE_REQUIRED', `Safety disposition field ${field} is required`);
    }
    requireValue(Array.isArray(dispositionRecord.evidenceRefs) && dispositionRecord.evidenceRefs.length > 0, 'SAFETY_DISPOSITION_EVIDENCE_REQUIRED', 'Safety disposition evidence references are required');
    requireValue(this.contract.stateMachine.safetyHoldExit.allowedDispositions.includes(dispositionRecord.disposition), 'UNSUPPORTED_SAFETY_DISPOSITION', 'Safety disposition is not authorized');
    requireValue(current.data.unresolvedNotificationIds.length === 0, 'WARNING_DELIVERY_UNRESOLVED', 'A failed or uncertain stop-use warning keeps the safety hold active');
    return this.privateRecords.update({
      actor,
      commandId,
      recordId: caseRecordId,
      expectedVersion,
      nextState: toState,
      patch: {
        safetyHoldActive: false,
        authorizedSafetyDisposition: clone(dispositionRecord),
        rhinoCaseOwnershipRetained: true,
        rhinoCommunicationResponsibilityRetained: true,
      },
      eventType: 'AUTHORIZED_SAFETY_HOLD_EXIT',
      eventDetails: { disposition: dispositionRecord.disposition },
    });
  }

  recover({ actor, commandId, caseRecordId, expectedVersion }) {
    const current = this.privateRecords.read({ actor, recordId: caseRecordId });
    if (current.state === 'SAFETY_HOLD' || current.data.safetyHoldActive) {
      throw new TransitionError('RECOVERY_CANNOT_CLEAR_SAFETY_HOLD', 'Recovery cannot bypass an active safety hold');
    }
    return this.ordinaryTransition({ actor, commandId, caseRecordId, expectedVersion, toState: 'TRIAGED' });
  }
}

module.exports = { SupportSafetyService };
