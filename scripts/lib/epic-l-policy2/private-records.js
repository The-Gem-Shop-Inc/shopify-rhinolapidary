'use strict';

const {
  ConflictError,
  clone,
  createOpaqueIdentifier,
  deepFreeze,
  requireAuthorization,
  requireValue,
  stableStringify,
} = require('./common');

const PRIVATE_RECORD_CATEGORIES = Object.freeze([
  'REGISTRATION',
  'SUPPORT_CASE',
  'APPROVAL_EVIDENCE',
  'NOTIFICATION',
  'RESOURCE_DELIVERY',
]);

const DEFAULT_RETENTION = deepFreeze({
  proposedPeriod: 'P7Y',
  approvalStatus: 'BLOCKED_PENDING_PROCESSOR_AND_LEGAL_APPROVAL',
  processor: null,
  durableRetentionGuaranteed: false,
  backupGuaranteed: false,
  deletionGuaranteed: false,
  disposalStatus: 'NOT_SCHEDULED',
});

class InMemoryPrivateRecordStore {
  constructor({
    authorize = () => false,
    clock = () => new Date().toISOString(),
    recordIdFactory = () => createOpaqueIdentifier(16, 'rec_'),
    publicReferenceFactory = () => createOpaqueIdentifier(16, 'ref_'),
    auditIdFactory = () => createOpaqueIdentifier(16, 'aud_'),
  } = {}) {
    this.authorize = authorize;
    this.clock = clock;
    this.recordIdFactory = recordIdFactory;
    this.publicReferenceFactory = publicReferenceFactory;
    this.auditIdFactory = auditIdFactory;
    this.records = new Map();
    this.audit = new Map();
    this.commandReceipts = new Map();
  }

  executeIdempotently(commandId, input, operation) {
    requireValue(typeof commandId === 'string' && commandId.length > 0, 'COMMAND_ID_REQUIRED', 'An idempotency command ID is required');
    const fingerprint = stableStringify(input);
    const prior = this.commandReceipts.get(commandId);
    if (prior) {
      if (prior.fingerprint !== fingerprint) {
        throw new ConflictError('IDEMPOTENCY_KEY_REUSE', 'Command ID was already used with different input', { commandId });
      }
      return clone(prior.result);
    }
    const result = operation();
    this.commandReceipts.set(commandId, deepFreeze({ fingerprint, result: clone(result) }));
    return clone(result);
  }

  create({ actor, commandId, category, state, data, retention = {} }) {
    requireAuthorization(this.authorize, actor, 'PRIVATE_RECORD_CREATE', { category });
    requireValue(PRIVATE_RECORD_CATEGORIES.includes(category), 'UNSUPPORTED_RECORD_CATEGORY', 'Unsupported private record category', { category });
    return this.executeIdempotently(commandId, { operation: 'create', category, state, data, retention }, () => {
      const now = this.clock();
      const recordId = this.recordIdFactory();
      requireValue(!this.records.has(recordId), 'DUPLICATE_RECORD_ID', 'Record identity must be unique');
      const record = {
        recordId,
        publicReference: this.publicReferenceFactory(),
        category,
        state,
        version: 1,
        createdAt: now,
        modifiedAt: now,
        retention: { ...clone(DEFAULT_RETENTION), ...clone(retention) },
        data: clone(data),
      };
      this.records.set(recordId, deepFreeze(record));
      this.appendAudit(recordId, actor, 'RECORD_CREATED', { category, state, version: 1 });
      return record;
    });
  }

  read({ actor, recordId }) {
    const record = this.requireRecord(recordId);
    requireAuthorization(this.authorize, actor, 'PRIVATE_RECORD_READ', { recordId, category: record.category });
    this.appendAudit(recordId, actor, 'RECORD_ACCESSED', { version: record.version });
    return clone(record);
  }

  publicHandle(recordId) {
    const record = this.requireRecord(recordId);
    return deepFreeze({ publicReference: record.publicReference, category: record.category });
  }

  update({ actor, commandId, recordId, expectedVersion, nextState, patch = {}, eventType = 'RECORD_UPDATED', eventDetails = {} }) {
    requireAuthorization(this.authorize, actor, 'PRIVATE_RECORD_UPDATE', { recordId });
    return this.executeIdempotently(commandId, {
      operation: 'update', recordId, expectedVersion, nextState, patch, eventType, eventDetails,
    }, () => {
      const current = this.requireRecord(recordId);
      if (current.version !== expectedVersion) {
        throw new ConflictError('RECORD_VERSION_CONFLICT', 'Expected record version does not match current version', {
          recordId,
          expectedVersion,
          actualVersion: current.version,
        });
      }
      const updated = {
        ...clone(current),
        state: nextState ?? current.state,
        data: { ...clone(current.data), ...clone(patch) },
        version: current.version + 1,
        modifiedAt: this.clock(),
      };
      this.records.set(recordId, deepFreeze(updated));
      this.appendAudit(recordId, actor, eventType, { ...clone(eventDetails), fromState: current.state, toState: updated.state, version: updated.version });
      return updated;
    });
  }

  auditTrail({ actor, recordId }) {
    const record = this.requireRecord(recordId);
    requireAuthorization(this.authorize, actor, 'PRIVATE_AUDIT_READ', { recordId, category: record.category });
    return clone(this.audit.get(recordId) || []);
  }

  requireRecord(recordId) {
    const record = this.records.get(recordId);
    requireValue(record, 'PRIVATE_RECORD_NOT_FOUND', 'Private record was not found');
    return record;
  }

  appendAudit(recordId, actor, eventType, details) {
    const event = deepFreeze({
      auditEventId: this.auditIdFactory(),
      recordId,
      actorReference: actor?.actorId || 'SYSTEM',
      eventType,
      occurredAt: this.clock(),
      details: clone(details),
    });
    const events = this.audit.get(recordId) || [];
    this.audit.set(recordId, [...events, event]);
    return clone(event);
  }
}

module.exports = {
  DEFAULT_RETENTION,
  InMemoryPrivateRecordStore,
  PRIVATE_RECORD_CATEGORIES,
};
