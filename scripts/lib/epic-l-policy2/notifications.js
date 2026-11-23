'use strict';

const {
  TransitionError,
  clone,
  createOpaqueIdentifier,
  deepFreeze,
  requireAuthorization,
  requireValue,
  stableStringify,
} = require('./common');

const NOTIFICATION_STATES = Object.freeze([
  'PENDING',
  'DELIVERY_ATTEMPTED',
  'DELIVERY_CONFIRMED',
  'DELIVERY_FAILED',
  'RECOVERY_REQUIRED',
  'TERMINAL_DISPOSITION',
]);

const DELIVERY_CHANNELS = Object.freeze(['SYNTHETIC_EMAIL', 'SYNTHETIC_SMS', 'SYNTHETIC_INTERNAL']);

class SyntheticNotificationTransport {
  constructor(outcomes = []) {
    this.outcomes = [...outcomes];
    this.calls = [];
  }

  deliver(envelope) {
    this.calls.push(clone(envelope));
    return clone(this.outcomes.shift() || { outcome: 'UNCERTAIN', evidence: null });
  }
}

class InMemoryNotificationOutbox {
  constructor({
    transport,
    authorize = () => false,
    clock = () => new Date().toISOString(),
    notificationIdFactory = () => createOpaqueIdentifier(16, 'ntf_'),
    attemptIdFactory = () => createOpaqueIdentifier(16, 'att_'),
  }) {
    requireValue(transport && typeof transport.deliver === 'function', 'NOTIFICATION_TRANSPORT_REQUIRED', 'A notification transport port is required');
    this.transport = transport;
    this.authorize = authorize;
    this.clock = clock;
    this.notificationIdFactory = notificationIdFactory;
    this.attemptIdFactory = attemptIdFactory;
    this.notifications = new Map();
    this.commandReceipts = new Map();
  }

  queue({ actor, commandId, domainEventId, destinationReference, channel, messageClass }) {
    requireAuthorization(this.authorize, actor, 'NOTIFICATION_QUEUE', { domainEventId, channel });
    requireValue(typeof domainEventId === 'string' && domainEventId.length > 0, 'DOMAIN_EVENT_REQUIRED', 'Associated domain event identity is required');
    requireValue(/^dst_[A-Za-z0-9_-]{16,}$/.test(destinationReference || ''), 'OPAQUE_DESTINATION_REQUIRED', 'Destination must be an opaque reference, not contact details');
    requireValue(DELIVERY_CHANNELS.includes(channel), 'UNSUPPORTED_DELIVERY_CHANNEL', 'Only synthetic B01 channels are permitted');
    return this.idempotent(commandId, { operation: 'queue', domainEventId, destinationReference, channel, messageClass }, () => {
      const notification = {
        notificationId: this.notificationIdFactory(),
        domainEventId,
        destinationReference,
        channel,
        messageClass,
        state: 'PENDING',
        createdAt: this.clock(),
        modifiedAt: this.clock(),
        attempts: [],
        deliveryEvidence: null,
        terminalDisposition: null,
      };
      this.notifications.set(notification.notificationId, deepFreeze(notification));
      return notification;
    });
  }

  attempt({ actor, commandId, notificationId }) {
    requireAuthorization(this.authorize, actor, 'NOTIFICATION_ATTEMPT', { notificationId });
    return this.idempotent(commandId, { operation: 'attempt', notificationId }, () => {
      const current = this.requireNotification(notificationId);
      requireValue(['PENDING', 'DELIVERY_FAILED', 'RECOVERY_REQUIRED'].includes(current.state), 'NOTIFICATION_ATTEMPT_NOT_ALLOWED', 'Notification is not eligible for an attempt');
      const attempt = {
        attemptId: this.attemptIdFactory(),
        attemptedAt: this.clock(),
        state: 'DELIVERY_ATTEMPTED',
      };
      this.save({ ...current, state: 'DELIVERY_ATTEMPTED', modifiedAt: this.clock(), attempts: [...current.attempts, attempt] });
      let result;
      try {
        result = this.transport.deliver({
          notificationId,
          attemptId: attempt.attemptId,
          domainEventId: current.domainEventId,
          destinationReference: current.destinationReference,
          channel: current.channel,
          messageClass: current.messageClass,
        });
      } catch (_error) {
        result = { outcome: 'FAILED', reasonCode: 'TRANSPORT_EXCEPTION' };
      }
      if (result.outcome === 'CONFIRMED') {
        requireValue(result.evidence && result.evidence.providerReceipt, 'DELIVERY_EVIDENCE_REQUIRED', 'Confirmed delivery requires provider evidence');
        return this.save({
          ...this.requireNotification(notificationId),
          state: 'DELIVERY_CONFIRMED',
          modifiedAt: this.clock(),
          deliveryEvidence: { ...clone(result.evidence), confirmedAt: this.clock(), attemptId: attempt.attemptId },
        });
      }
      if (result.outcome === 'FAILED') {
        return this.save({
          ...this.requireNotification(notificationId),
          state: 'DELIVERY_FAILED',
          modifiedAt: this.clock(),
          failure: { reasonCode: result.reasonCode || 'SYNTHETIC_FAILURE', attemptId: attempt.attemptId },
        });
      }
      if (result.outcome === 'UNCERTAIN') {
        return this.save({
          ...this.requireNotification(notificationId),
          state: 'RECOVERY_REQUIRED',
          modifiedAt: this.clock(),
          uncertainty: { reasonCode: result.reasonCode || 'OUTCOME_UNCERTAIN', attemptId: attempt.attemptId },
        });
      }
      this.save({
        ...this.requireNotification(notificationId),
        state: 'RECOVERY_REQUIRED',
        modifiedAt: this.clock(),
        uncertainty: { reasonCode: 'UNKNOWN_TRANSPORT_OUTCOME', attemptId: attempt.attemptId },
      });
      throw new TransitionError('UNKNOWN_TRANSPORT_OUTCOME', 'Unknown transport outcomes fail closed');
    });
  }

  requireRecovery({ actor, commandId, notificationId, reason }) {
    requireAuthorization(this.authorize, actor, 'NOTIFICATION_RECOVERY', { notificationId });
    return this.idempotent(commandId, { operation: 'recovery', notificationId, reason }, () => {
      const current = this.requireNotification(notificationId);
      requireValue(['DELIVERY_FAILED', 'RECOVERY_REQUIRED'].includes(current.state), 'RECOVERY_NOT_REQUIRED', 'Only failed or uncertain notifications require recovery');
      return this.save({ ...current, state: 'RECOVERY_REQUIRED', modifiedAt: this.clock(), recoveryReason: reason });
    });
  }

  reconcile({ actor, commandId, notificationId, outcome, evidence }) {
    requireAuthorization(this.authorize, actor, 'NOTIFICATION_RECONCILE', { notificationId });
    return this.idempotent(commandId, { operation: 'reconcile', notificationId, outcome, evidence }, () => {
      const current = this.requireNotification(notificationId);
      requireValue(current.state === 'RECOVERY_REQUIRED', 'RECONCILIATION_NOT_ALLOWED', 'Only recovery-required notifications can be reconciled');
      if (outcome === 'CONFIRMED') {
        requireValue(evidence && evidence.providerReceipt, 'DELIVERY_EVIDENCE_REQUIRED', 'Reconciled confirmation requires evidence');
        return this.save({ ...current, state: 'DELIVERY_CONFIRMED', modifiedAt: this.clock(), deliveryEvidence: { ...clone(evidence), reconciledAt: this.clock() } });
      }
      if (outcome === 'FAILED') {
        return this.save({ ...current, state: 'DELIVERY_FAILED', modifiedAt: this.clock(), failure: { reasonCode: evidence?.reasonCode || 'RECONCILED_FAILURE' } });
      }
      throw new TransitionError('UNSUPPORTED_RECONCILIATION_OUTCOME', 'Reconciliation outcome is unsupported');
    });
  }

  terminalDisposition({ actor, commandId, notificationId, disposition, evidenceRefs }) {
    requireAuthorization(this.authorize, actor, 'NOTIFICATION_TERMINAL_DISPOSITION', { notificationId });
    requireValue(Array.isArray(evidenceRefs) && evidenceRefs.length > 0, 'TERMINAL_EVIDENCE_REQUIRED', 'Terminal disposition requires evidence');
    return this.idempotent(commandId, { operation: 'terminal', notificationId, disposition, evidenceRefs }, () => {
      const current = this.requireNotification(notificationId);
      requireValue(['DELIVERY_CONFIRMED', 'DELIVERY_FAILED'].includes(current.state), 'TERMINAL_DISPOSITION_NOT_ALLOWED', 'Uncertain delivery cannot receive terminal disposition');
      return this.save({
        ...current,
        state: 'TERMINAL_DISPOSITION',
        modifiedAt: this.clock(),
        terminalDisposition: { disposition, evidenceRefs: [...evidenceRefs], disposedAt: this.clock(), actorReference: actor.actorId },
      });
    });
  }

  get(notificationId) {
    return clone(this.requireNotification(notificationId));
  }

  idempotent(commandId, input, operation) {
    requireValue(typeof commandId === 'string' && commandId.length > 0, 'COMMAND_ID_REQUIRED', 'An idempotency command ID is required');
    const fingerprint = stableStringify(input);
    const prior = this.commandReceipts.get(commandId);
    if (prior) {
      requireValue(prior.fingerprint === fingerprint, 'IDEMPOTENCY_KEY_REUSE', 'Command ID was reused with different input');
      return clone(prior.result);
    }
    const result = operation();
    this.commandReceipts.set(commandId, deepFreeze({ fingerprint, result: clone(result) }));
    return clone(result);
  }

  requireNotification(notificationId) {
    const notification = this.notifications.get(notificationId);
    requireValue(notification, 'NOTIFICATION_NOT_FOUND', 'Notification was not found');
    return clone(notification);
  }

  save(notification) {
    const frozen = deepFreeze(clone(notification));
    this.notifications.set(notification.notificationId, frozen);
    return clone(frozen);
  }
}

module.exports = {
  DELIVERY_CHANNELS,
  InMemoryNotificationOutbox,
  NOTIFICATION_STATES,
  SyntheticNotificationTransport,
};
