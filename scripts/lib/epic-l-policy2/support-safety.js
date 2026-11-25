'use strict';

const {
  TransitionError,
  clone,
  createOpaqueIdentifier,
  requireAuthorization,
  requireValue,
} = require('./common');

function evaluateBusinessHours(at, contractOrHours) {
  const hours = contractOrHours?.hours || contractOrHours;
  requireValue(hours?.timezone === 'America/Chicago', 'BUSINESS_TIMEZONE_REQUIRED', 'Business hours require the approved America/Chicago timezone');
  const instant = at instanceof Date ? at : new Date(at);
  requireValue(!Number.isNaN(instant.getTime()), 'INVALID_BUSINESS_TIME', 'Business hours evaluation requires a valid instant');
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: hours.timezone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(instant).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  const weekdays = new Set(hours.weekdays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const minuteOfDay = Number(parts.hour) * 60 + Number(parts.minute);
  const [startHour, startMinute] = hours.start.split(':').map(Number);
  const [endHour, endMinute] = hours.end.split(':').map(Number);
  const withinSchedule = weekdays.has(parts.weekday)
    && minuteOfDay >= startHour * 60 + startMinute
    && minuteOfDay < endHour * 60 + endMinute;
  return Object.freeze({
    evaluatedAt: instant.toISOString(),
    timezone: hours.timezone,
    localWeekday: parts.weekday,
    localTime: `${parts.hour}:${parts.minute}`,
    withinSchedule,
    holidayApplied: false,
    responseGuarantee: false,
    continuousStaffingAssumed: false,
  });
}

function createOutOfHoursAcknowledgementIntent(at, contractOrHours) {
  const evaluation = evaluateBusinessHours(at, contractOrHours);
  if (evaluation.withinSchedule) return null;
  return Object.freeze({
    kind: 'OUT_OF_HOURS_ACKNOWLEDGEMENT_INTENT',
    scheduleReference: 'MONDAY_FRIDAY_0900_1700_AMERICA_CHICAGO',
    customerWordingApproved: false,
    responseTimeGuaranteed: false,
    externalMessageSent: false,
    evaluation,
  });
}

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
        assignedOwnerReference: null,
        assignmentEvidenceReference: null,
        resolutionConfirmations: [],
        reopenHistory: [],
        syntheticFacts: clone(syntheticFacts),
      },
    });
  }

  ordinaryTransition({ actor, commandId, caseRecordId, expectedVersion, toState, authorityProof = null }) {
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
    if (toState === 'RESOLVED') {
      requireValue(current.data.assignedOwnerReference, 'ASSIGNED_CASE_OWNER_REQUIRED', 'Resolution requires an assigned case owner');
      requireValue(
        authorityProof?.action === 'CONFIRM_RESOLUTION'
          && authorityProof.verified === true
          && authorityProof.actorId === actor.actorId
          && authorityProof.ownerReference === current.data.assignedOwnerReference
          && authorityProof.evidenceReference,
        'ASSIGNED_OWNER_RESOLUTION_REQUIRED',
        'Only the verified assigned case owner may confirm resolution',
      );
      patch.resolutionConfirmations = [...current.data.resolutionConfirmations, {
        ownerReference: authorityProof.ownerReference,
        actorId: authorityProof.actorId,
        evidenceReference: authorityProof.evidenceReference,
        confirmedAt: this.clock(),
      }];
    }
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

  assignCaseOwner({ actor, commandId, caseRecordId, expectedVersion, ownerReference, assignmentEvidenceReference }) {
    requireAuthorization(this.authorize, actor, 'SUPPORT_CASE_ASSIGN_OWNER', { caseRecordId, ownerReference });
    requireValue(/^staff_(?:syn_)?[A-Za-z0-9_-]{8,}$/.test(ownerReference || ''), 'OPAQUE_STAFF_REFERENCE_REQUIRED', 'Assignment requires an opaque staff reference');
    requireValue(typeof assignmentEvidenceReference === 'string' && assignmentEvidenceReference.length > 0, 'ASSIGNMENT_EVIDENCE_REQUIRED', 'Assignment requires evidence');
    const current = this.privateRecords.read({ actor, recordId: caseRecordId });
    requireValue(current.state !== 'CLOSED', 'CLOSED_CASE_ASSIGNMENT_FORBIDDEN', 'A closed case cannot be reassigned without authorized reopening');
    return this.privateRecords.update({
      actor,
      commandId,
      recordId: caseRecordId,
      expectedVersion,
      nextState: current.state,
      patch: { assignedOwnerReference: ownerReference, assignmentEvidenceReference },
      eventType: 'SUPPORT_CASE_OWNER_ASSIGNED',
      eventDetails: { ownerReference, assignmentEvidenceReference },
    });
  }

  reopenCase({ actor, commandId, caseRecordId, expectedVersion, authorityProof }) {
    requireAuthorization(this.authorize, actor, 'SUPPORT_CASE_REOPEN', { caseRecordId });
    const current = this.privateRecords.read({ actor, recordId: caseRecordId });
    requireValue(!current.data.safetyHoldActive && current.state !== 'SAFETY_HOLD', 'ACTIVE_SAFETY_HOLD', 'Reopening cannot bypass an active safety hold');
    requireValue(['RESOLVED', 'CLOSED'].includes(current.state), 'CASE_NOT_REOPENABLE', 'Only resolved or closed cases may be reopened');
    requireValue(
      authorityProof?.authorityName === 'Kevin'
        && authorityProof.verificationStatus === 'VERIFIED_IDENTITY_BINDING'
        && authorityProof.actorId === actor.actorId
        && authorityProof.evidenceReference,
      'KEVIN_REOPEN_AUTHORITY_REQUIRED',
      'Reopening requires Kevin\'s verified identity boundary and evidence',
    );
    return this.privateRecords.update({
      actor,
      commandId,
      recordId: caseRecordId,
      expectedVersion,
      nextState: 'TRIAGED',
      patch: {
        reopenHistory: [...current.data.reopenHistory, {
          priorState: current.state,
          reopenedAt: this.clock(),
          authorizedBy: authorityProof.actorId,
          authorityName: authorityProof.authorityName,
          evidenceReference: authorityProof.evidenceReference,
        }],
      },
      eventType: 'SUPPORT_CASE_REOPENED_BY_VERIFIED_KEVIN_AUTHORITY',
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
    requireValue(
      dispositionRecord.authorityName === 'Kevin'
        && dispositionRecord.authorityBindingStatus === 'VERIFIED_IDENTITY_BINDING'
        && dispositionRecord.responsibleAuthority === actor.actorId
        && dispositionRecord.authorityEvidenceReference,
      'KEVIN_SAFETY_AUTHORITY_REQUIRED',
      'Safety disposition requires Kevin\'s verified identity boundary and authority evidence',
    );
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

module.exports = {
  SupportSafetyService,
  createOutOfHoursAcknowledgementIntent,
  evaluateBusinessHours,
};
