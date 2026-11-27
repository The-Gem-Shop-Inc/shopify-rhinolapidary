'use strict';

const crypto = require('node:crypto');
const {
  ActivationError,
  AuthorizationError,
  ConflictError,
  clone,
  createOpaqueIdentifier,
  deepFreeze,
  requireAuthorization,
  requireValue,
  stableStringify,
} = require('./common');
const { RESOURCE_CATEGORIES } = require('./resource-governance');

const ADMIN_LIFECYCLE_STATES = Object.freeze([
  'DRAFT',
  'TECHNICAL_REVIEW_REQUIRED',
  'APPROVED_INTERNAL',
  'SUPERSEDED',
  'RETIRED',
]);
const CHANGE_STATUSES = Object.freeze(['UNCHANGED_EXISTING_UNBOUND', 'UNCHANGED_EXISTING_BOUND', 'CHANGED_CONTENT', 'NEW_DRAFT']);
const RIGHTS_STATUSES = Object.freeze(['UNRESOLVED', 'APPROVED_WITH_EVIDENCE', 'NOT_REQUIRED_WITH_EVIDENCE', 'REJECTED']);
const ACCESSIBILITY_STATUSES = Object.freeze(['UNRESOLVED', 'ACCESSIBLE_WITH_EVIDENCE', 'NOT_REQUIRED_WITH_EVIDENCE', 'REMEDIATION_REQUIRED']);
const AVAILABILITY_STATUSES = Object.freeze(['UNRESOLVED', 'SYNTHETIC_AVAILABLE', 'STALE', 'FAILED']);
const PROVIDER_TYPES = Object.freeze(['REPOSITORY_FILE', 'SHOPIFY_FILE', 'GOOGLE_DOC', 'YOUTUBE', 'OTHER_PROVIDER']);
const APPROVED_APPLICABILITY = 'EXPLICITLY_APPROVED';
const OBSERVED_APPLICABILITY = 'OBSERVED_NOT_APPROVED';
const ARCHIVE_VERSION = 'EPIC_L_POLICY2_RESOURCE_ADMIN_EXPORT_V1';
const HISTORICAL_APPROVAL_EVIDENCE_REFERENCE = 'repository-evidence:data/epic-l-policy2-decision-receipt-r3.json#OPEN-09';
const FORBIDDEN_EXPORT_KEY_PARTS = Object.freeze([
  'customerreference', 'customerrecord', 'registrationid', 'notificationdestination', 'destinationreference',
  'supportcase', 'testimony', 'address', 'email', 'phone', 'webhook', 'credential', 'secret',
  'manufacturercontact', 'manufacturerdestination',
]);

function sha256(value) {
  return crypto.createHash('sha256').update(typeof value === 'string' ? value : stableStringify(value)).digest('hex');
}

class ResourceAdministrationService {
  constructor({
    resourceGovernance,
    catalogSnapshot,
    b05Queue,
    authorize = () => false,
    clock = () => new Date().toISOString(),
    resourceIdFactory = () => createOpaqueIdentifier(16, 'ares_'),
    revisionIdFactory = () => createOpaqueIdentifier(16, 'arev_'),
    auditIdFactory = () => createOpaqueIdentifier(16, 'aaud_'),
    isolatedSyntheticMode = false,
  }) {
    requireValue(resourceGovernance?.validateApplicability, 'RESOURCE_GOVERNANCE_REQUIRED', 'B07 requires the canonical resource governance service');
    requireValue(Array.isArray(catalogSnapshot?.products), 'CATALOG_SNAPSHOT_REQUIRED', 'B07 requires the accepted Product catalog snapshot');
    requireValue(Array.isArray(b05Queue?.candidates), 'B05_QUEUE_REQUIRED', 'B07 requires the B05 resource approval queue');
    requireValue(isolatedSyntheticMode === true, 'ISOLATED_SYNTHETIC_MODE_REQUIRED', 'B07 administration runs only in explicit isolated synthetic mode');
    this.resourceGovernance = resourceGovernance;
    this.catalogSnapshot = deepFreeze(clone(catalogSnapshot));
    this.b05Queue = deepFreeze(clone(b05Queue));
    this.authorize = authorize;
    this.clock = clock;
    this.resourceIdFactory = resourceIdFactory;
    this.revisionIdFactory = revisionIdFactory;
    this.auditIdFactory = auditIdFactory;
    this.resources = new Map();
    this.audit = [];
    this.commandReceipts = new Map();
    this.isolatedSyntheticMode = true;
  }

  execute(commandId, input, operation) {
    requireValue(typeof commandId === 'string' && commandId.length > 0, 'COMMAND_ID_REQUIRED', 'Every B07 write requires a command identity');
    const fingerprint = stableStringify(input);
    const prior = this.commandReceipts.get(commandId);
    if (prior) {
      if (prior.fingerprint !== fingerprint) throw new ConflictError('IDEMPOTENCY_KEY_REUSE', 'Command ID was reused with different input');
      return clone(prior.result);
    }
    const result = operation();
    this.commandReceipts.set(commandId, deepFreeze({ fingerprint, result: clone(result) }));
    return clone(result);
  }

  importB05Candidates({ actor, commandId }) {
    requireAuthorization(this.authorize, actor, 'RESOURCE_ADMIN_IMPORT_B05', {});
    const input = { operation: 'importB05Candidates', queueDigest: sha256(this.b05Queue) };
    return this.execute(commandId, input, () => {
      this.validateB05Queue();
      const prepared = this.b05Queue.candidates.map((candidate) => this.prepareCandidate(candidate));
      const inserted = [];
      const skipped = [];
      for (const record of prepared) {
        const prior = this.resources.get(record.resourceId);
        if (prior) {
          requireValue(prior.origin?.candidateId === record.origin.candidateId && prior.origin.queueDigest === record.origin.queueDigest, 'B05_IMPORT_IDENTITY_CONFLICT', 'Existing resource conflicts with B05 candidate identity');
          skipped.push(record.resourceId);
          continue;
        }
        this.resources.set(record.resourceId, deepFreeze(record));
        inserted.push(record.resourceId);
        this.appendAudit(actor, 'B05_RESOURCE_CANDIDATE_IMPORTED', { resourceId: record.resourceId, candidateId: record.origin.candidateId });
      }
      return { inserted, skipped, totalCandidates: prepared.length, approvalsCreated: 0, customerReleasesCreated: 0 };
    });
  }

  createDraft({ actor, commandId, input }) {
    requireAuthorization(this.authorize, actor, 'RESOURCE_ADMIN_CREATE_DRAFT', {});
    this.validateDraftInput(input, { allowEmptyApplicability: true });
    return this.execute(commandId, { operation: 'createDraft', input }, () => {
      const resourceId = this.resourceIdFactory();
      const revision = this.buildRevision({
        actor,
        input: { ...input, changeStatus: 'NEW_DRAFT', changeReason: input.changeReason || 'NEW_RESOURCE_DRAFT' },
        revisionId: this.revisionIdFactory(),
        sequence: 1,
        supersedesRevisionId: null,
      });
      const record = deepFreeze({
        resourceId,
        title: revision.title,
        category: revision.category,
        version: 1,
        createdAt: this.clock(),
        origin: { kind: 'B07_DRAFT', candidateId: null, queueDigest: null },
        revisions: [revision],
        events: [],
      });
      this.resources.set(resourceId, record);
      this.appendAudit(actor, 'RESOURCE_DRAFT_CREATED', { resourceId, revisionId: revision.revisionId });
      return this.detail(resourceId);
    });
  }

  startRevision({ actor, commandId, resourceId, expectedVersion, baseRevisionId, input }) {
    requireAuthorization(this.authorize, actor, 'RESOURCE_ADMIN_CREATE_REVISION', { resourceId });
    this.validateDraftInput(input, { allowEmptyApplicability: true });
    requireValue(['UNCHANGED_EXISTING_BOUND', 'CHANGED_CONTENT'].includes(input.changeStatus), 'INVALID_REVISION_CHANGE_STATUS', 'Updates must identify unchanged binding or changed content');
    requireValue(input.changeReason && Array.isArray(input.changeEvidenceRefs) && input.changeEvidenceRefs.length > 0, 'REVISION_CHANGE_EVIDENCE_REQUIRED', 'Revision reason and evidence are required');
    return this.execute(commandId, { operation: 'startRevision', resourceId, expectedVersion, baseRevisionId, input }, () => {
      const record = this.requireResourceVersion(resourceId, expectedVersion);
      const base = this.requireRevision(record, baseRevisionId);
      requireValue(base.revisionId === record.revisions[record.revisions.length - 1].revisionId && !['SUPERSEDED', 'RETIRED'].includes(this.lifecycleFor(record, baseRevisionId)), 'INVALID_REVISION_BASE', 'A new revision must start from the current active administrative revision');
      const revision = this.buildRevision({
        actor,
        input: {
          ...clone(base),
          ...clone(input),
          applicability: input.applicability || clone(base.applicability),
          technicalApprovalInherited: false,
        },
        revisionId: this.revisionIdFactory(),
        sequence: record.revisions.length + 1,
        supersedesRevisionId: baseRevisionId,
      });
      const updated = {
        ...clone(record),
        title: revision.title,
        category: revision.category,
        version: record.version + 1,
        revisions: [...record.revisions, revision],
      };
      this.resources.set(resourceId, deepFreeze(updated));
      this.appendAudit(actor, 'RESOURCE_REVISION_STARTED', { resourceId, revisionId: revision.revisionId, baseRevisionId, changeStatus: revision.changeStatus });
      return this.detail(resourceId);
    });
  }

  recordHistoricalApprovalAssertion({ actor, commandId, resourceId, expectedVersion, revisionId, approvalEvidenceReference, authorityLimitations = [] }) {
    requireAuthorization(this.authorize, actor, 'RESOURCE_HISTORICAL_APPROVAL_ASSERT', { resourceId, revisionId });
    requireValue(typeof approvalEvidenceReference === 'string' && approvalEvidenceReference.length > 0, 'APPROVAL_EVIDENCE_REQUIRED', 'Historical approval assertion requires an evidence reference');
    requireValue(approvalEvidenceReference === HISTORICAL_APPROVAL_EVIDENCE_REFERENCE, 'UNSUPPORTED_APPROVAL_EVIDENCE', 'Historical approval must reference the recorded Product Owner assertion without fabricating Kevin evidence');
    return this.execute(commandId, { operation: 'historicalApproval', resourceId, expectedVersion, revisionId, approvalEvidenceReference, authorityLimitations }, () => {
      const record = this.requireResourceVersion(resourceId, expectedVersion);
      const revision = this.requireRevision(record, revisionId);
      requireValue(!this.technicalApprovalFor(record, revisionId, false), 'TECHNICAL_DISPOSITION_ALREADY_RECORDED', 'A revision can retain only one technical disposition');
      requireValue(revision.changeStatus !== 'CHANGED_CONTENT' && revision.changeStatus !== 'NEW_DRAFT', 'CHANGED_CONTENT_REQUIRES_FRESH_DISPOSITION', 'Changed or new content cannot inherit historical approval');
      requireValue(this.validImmutableRevisionIdentity(revision.immutableRevisionIdentity), 'IMMUTABLE_REVISION_IDENTITY_REQUIRED', 'Historical approval must bind to an immutable revision identity');
      this.requireApprovedApplicability(revision.applicability);
      const event = {
        eventType: 'HISTORICAL_KEVIN_APPROVAL_ASSERTED', revisionId,
        recordedAt: this.clock(), recordedBy: actor.actorId,
        assertedAuthorityName: 'Kevin', approvalOccurredAt: null, productionIdentityVerified: false,
        approvalEvidenceReference, authorityLimitations: [...authorityLimitations], customerReleaseAuthorized: false,
      };
      return this.appendResourceEvent(record, actor, event);
    });
  }

  recordFreshTechnicalDisposition({ actor, commandId, resourceId, expectedVersion, revisionId, evidenceRefs }) {
    requireAuthorization(this.authorize, actor, 'RESOURCE_TECHNICAL_APPROVE', { resourceId, revisionId });
    requireValue(actor.actorId === this.resourceGovernance.technicalApprovalAuthority.actorId, 'KEVIN_APPROVAL_REQUIRED', 'Configured synthetic Kevin authority is required');
    requireValue(Array.isArray(evidenceRefs) && evidenceRefs.length > 0, 'APPROVAL_EVIDENCE_REQUIRED', 'Fresh technical disposition requires evidence');
    return this.execute(commandId, { operation: 'freshTechnicalDisposition', resourceId, expectedVersion, revisionId, evidenceRefs }, () => {
      const record = this.requireResourceVersion(resourceId, expectedVersion);
      const revision = this.requireRevision(record, revisionId);
      requireValue(!this.technicalApprovalFor(record, revisionId, false), 'TECHNICAL_DISPOSITION_ALREADY_RECORDED', 'A revision can retain only one technical disposition');
      requireValue(revision.changeStatus === 'CHANGED_CONTENT' || revision.changeStatus === 'NEW_DRAFT', 'FRESH_DISPOSITION_NOT_REQUIRED', 'Fresh technical disposition is reserved for new or changed content');
      const event = {
        eventType: 'FRESH_TECHNICAL_DISPOSITION_RECORDED', revisionId,
        recordedAt: this.clock(), recordedBy: actor.actorId, authorityRole: this.resourceGovernance.technicalApprovalAuthority.authorityRole,
        evidenceRefs: [...evidenceRefs], synthetic: true, productionIdentityVerified: false, customerReleaseAuthorized: false,
      };
      return this.appendResourceEvent(record, actor, event);
    });
  }

  approveInternal({ actor, technicalActor, commandId, resourceId, expectedVersion, revisionId, reason, evidenceRefs }) {
    requireAuthorization(this.authorize, actor, 'RESOURCE_ADMIN_APPROVE_INTERNAL', { resourceId, revisionId });
    requireValue(reason && Array.isArray(evidenceRefs) && evidenceRefs.length > 0, 'INTERNAL_APPROVAL_EVIDENCE_REQUIRED', 'Internal approval requires reason and evidence');
    return this.execute(commandId, { operation: 'approveInternal', resourceId, expectedVersion, revisionId, reason, evidenceRefs }, () => {
      const record = this.requireResourceVersion(resourceId, expectedVersion);
      const revision = this.requireRevision(record, revisionId);
      requireValue(!['APPROVED_INTERNAL', 'SUPERSEDED', 'RETIRED'].includes(this.lifecycleFor(record, revisionId)), 'INVALID_INTERNAL_APPROVAL', 'Only an active unapproved revision may enter internal approval');
      const missing = this.missingRequirements(record, revision);
      requireValue(missing.length === 0, 'RESOURCE_REQUIREMENTS_INCOMPLETE', 'Resource cannot enter internal approval while evidence is missing', { missing });
      this.assertNoConflictingActiveAssignment(resourceId, revision);
      const approval = this.technicalApprovalFor(record, revisionId);
      if (approval.eventType !== 'HISTORICAL_KEVIN_APPROVAL_ASSERTED') {
        requireValue(technicalActor, 'TECHNICAL_ACTOR_REQUIRED', 'Changed content approval requires the configured technical actor');
        requireAuthorization(this.authorize, technicalActor, 'RESOURCE_TECHNICAL_APPROVE', { resourceId, revisionId });
        requireValue(technicalActor.actorId === this.resourceGovernance.technicalApprovalAuthority.actorId, 'KEVIN_APPROVAL_REQUIRED', 'Configured synthetic Kevin authority is required');
      }
      const canonical = this.resourceGovernance.createRevision({
        actor,
        resourceId,
        category: revision.category,
        sourceIdentity: revision.editableSourceIdentity,
        applicability: this.canonicalApplicability(revision.applicability),
        customerCopyApproval: false,
        administrativeMetadata: {
          administrativeRevisionId: revision.revisionId,
          immutableRevisionIdentity: revision.immutableRevisionIdentity,
          proposedCustomerDeliveryLink: revision.proposedCustomerDeliveryLink,
          language: revision.language,
        },
      });
      this.resourceGovernance.submitTechnicalReview({ actor, resourceId, revisionId: canonical.revisionId });
      if (approval.eventType === 'HISTORICAL_KEVIN_APPROVAL_ASSERTED') {
        this.resourceGovernance.recordHistoricalTechnicalApprovalAssertion({
          actor, resourceId, revisionId: canonical.revisionId,
          assertion: {
            authorityName: 'Kevin',
            approvalEvidenceReference: approval.approvalEvidenceReference,
            immutableRevisionIdentity: revision.immutableRevisionIdentity,
            exactApplicability: true,
            authorityLimitations: approval.authorityLimitations,
          },
        });
      } else {
        this.resourceGovernance.approveTechnical({ actor: technicalActor, resourceId, revisionId: canonical.revisionId, approvalEvidence: approval.evidenceRefs });
      }
      const event = {
        eventType: 'RESOURCE_INTERNAL_APPROVAL_RECORDED', revisionId,
        recordedAt: this.clock(), recordedBy: actor.actorId, reason, evidenceRefs: [...evidenceRefs],
        governanceRevisionId: canonical.revisionId, customerReleaseAuthorized: false, productionAvailabilityVerified: false,
      };
      return this.appendResourceEvent(record, actor, event);
    });
  }

  supersede({ actor, commandId, resourceId, expectedVersion, previousRevisionId, replacementRevisionId, reason, evidenceRefs }) {
    requireAuthorization(this.authorize, actor, 'RESOURCE_ADMIN_SUPERSEDE', { resourceId });
    requireValue(reason && Array.isArray(evidenceRefs) && evidenceRefs.length > 0, 'SUPERSESSION_EVIDENCE_REQUIRED', 'Supersession requires reason and evidence');
    requireValue(previousRevisionId !== replacementRevisionId, 'INVALID_SUPERSESSION', 'A revision cannot supersede itself');
    return this.execute(commandId, { operation: 'supersede', resourceId, expectedVersion, previousRevisionId, replacementRevisionId, reason, evidenceRefs }, () => {
      const record = this.requireResourceVersion(resourceId, expectedVersion);
      const previous = this.requireRevision(record, previousRevisionId);
      const replacement = this.requireRevision(record, replacementRevisionId);
      requireValue(replacement.supersedesRevisionId === previous.revisionId && replacement.sequence > previous.sequence, 'INVALID_SUPERSESSION', 'Replacement must be a later revision started from the predecessor');
      requireValue(!['SUPERSEDED', 'RETIRED'].includes(this.lifecycleFor(record, previousRevisionId)), 'INVALID_SUPERSESSION', 'Historical or retired revision cannot be superseded again');
      requireValue(!['SUPERSEDED', 'RETIRED'].includes(this.lifecycleFor(record, replacementRevisionId)), 'INVALID_SUPERSESSION', 'Replacement revision must remain active');
      const event = { eventType: 'RESOURCE_REVISION_SUPERSEDED', revisionId: previousRevisionId, replacementRevisionId, recordedAt: this.clock(), recordedBy: actor.actorId, reason, evidenceRefs: [...evidenceRefs] };
      return this.appendResourceEvent(record, actor, event);
    });
  }

  retire({ actor, commandId, resourceId, expectedVersion, revisionId, reason, evidenceRefs }) {
    requireAuthorization(this.authorize, actor, 'RESOURCE_ADMIN_RETIRE', { resourceId, revisionId });
    requireValue(reason && Array.isArray(evidenceRefs) && evidenceRefs.length > 0, 'RETIREMENT_EVIDENCE_REQUIRED', 'Retirement requires reason and evidence');
    return this.execute(commandId, { operation: 'retire', resourceId, expectedVersion, revisionId, reason, evidenceRefs }, () => {
      const record = this.requireResourceVersion(resourceId, expectedVersion);
      this.requireRevision(record, revisionId);
      requireValue(!['SUPERSEDED', 'RETIRED'].includes(this.lifecycleFor(record, revisionId)), 'INVALID_RETIREMENT', 'Revision is already historical');
      return this.appendResourceEvent(record, actor, { eventType: 'RESOURCE_REVISION_RETIRED', revisionId, recordedAt: this.clock(), recordedBy: actor.actorId, reason, evidenceRefs: [...evidenceRefs] });
    });
  }

  search(filters = {}) {
    const normalizedSearch = String(filters.search || '').trim().toLowerCase();
    const rows = [...this.resources.values()].map((record) => this.summary(record)).filter((row) => {
      if (normalizedSearch && !stableStringify(row).toLowerCase().includes(normalizedSearch)) return false;
      if (filters.category && row.category !== filters.category) return false;
      if (filters.productGid && !row.applicability.productGids.includes(filters.productGid)) return false;
      if (filters.variantGid && !row.applicability.variantGids.includes(filters.variantGid)) return false;
      if (filters.machineVersion && !row.applicability.machineVersions.includes(filters.machineVersion)) return false;
      if (filters.lifecycleStatus && row.lifecycleStatus !== filters.lifecycleStatus) return false;
      if (filters.changeStatus && row.changeStatus !== filters.changeStatus) return false;
      if (filters.missingEvidence === 'true' && row.missingRequirements.length === 0) return false;
      if (filters.missingEvidence === 'false' && row.missingRequirements.length > 0) return false;
      return true;
    });
    return clone(rows.sort((a, b) => a.priorityRank - b.priorityRank || a.title.localeCompare(b.title)));
  }

  detail(resourceId) {
    const record = this.requireResource(resourceId);
    return clone({
      ...record,
      revisions: record.revisions.map((revision) => this.projectRevision(record, revision)),
      audit: this.audit.filter((event) => event.resourceId === resourceId),
      customerReleaseAuthorized: false,
    });
  }

  compare(resourceId, leftRevisionId, rightRevisionId) {
    const record = this.requireResource(resourceId);
    const left = this.projectRevision(record, this.requireRevision(record, leftRevisionId));
    const right = this.projectRevision(record, this.requireRevision(record, rightRevisionId));
    const fields = ['title', 'category', 'language', 'providerType', 'editableSourceIdentity', 'proposedCustomerDeliveryLink', 'immutableRevisionIdentity', 'applicability', 'rightsDisposition', 'accessibilityDisposition', 'availabilityDisposition', 'changeStatus'];
    return { resourceId, leftRevisionId, rightRevisionId, changes: fields.filter((field) => stableStringify(left[field]) !== stableStringify(right[field])).map((field) => ({ field, before: clone(left[field]), after: clone(right[field]) })) };
  }

  catalogOptions() {
    return this.catalogSnapshot.products.map((product) => ({
      productGid: product.productGid,
      title: product.title,
      status: product.status,
      variants: product.variants.map((variant) => ({ variantGid: variant.variantGid, title: variant.title, availableForSale: variant.availableForSale })),
    }));
  }

  exportRegistry({ actor }) {
    requireAuthorization(this.authorize, actor, 'RESOURCE_ADMIN_EXPORT', {});
    const archive = {
      archiveVersion: ARCHIVE_VERSION,
      exportedAt: this.clock(),
      mode: 'ISOLATED_SYNTHETIC_RESOURCE_ADMINISTRATION',
      customerReleaseAuthorized: false,
      catalogSource: 'data/epic-l-policy2-shopify-product-snapshot-2026-11-23.json',
      resources: [...this.resources.values()].map((record) => clone(record)),
      audit: clone(this.audit),
    };
    this.assertNoRestrictedData(archive);
    return { ...archive, archiveDigest: sha256(archive) };
  }

  importRegistry({ actor, commandId, archive, replaceExisting = false }) {
    requireAuthorization(this.authorize, actor, 'RESOURCE_ADMIN_IMPORT_ARCHIVE', {});
    return this.execute(commandId, { operation: 'importRegistry', archiveDigest: archive?.archiveDigest, replaceExisting }, () => {
      const prepared = this.validateArchive(archive);
      requireValue(replaceExisting === true || this.resources.size === 0, 'IMPORT_REQUIRES_EMPTY_REGISTRY', 'Archive import requires an empty registry unless an explicit isolated restore is requested');
      requireValue(typeof replaceExisting === 'boolean', 'INVALID_IMPORT_MODE', 'Archive restore mode must be explicit');
      const priorCount = this.resources.size;
      this.resources = new Map();
      for (const record of prepared.resources) this.resources.set(record.resourceId, deepFreeze(clone(record)));
      this.audit = prepared.audit.map((event) => deepFreeze(clone(event)));
      this.commandReceipts = new Map();
      this.appendAudit(actor, 'RESOURCE_REGISTRY_ARCHIVE_IMPORTED', { resourceCount: prepared.resources.length, replacedResourceCount: replaceExisting ? priorCount : 0, archiveDigest: archive.archiveDigest });
      return { importedResources: prepared.resources.length, replacedResourceCount: replaceExisting ? priorCount : 0, partialMutation: false, customerReleaseAuthorized: false };
    });
  }

  assertCustomerPublicationBlocked() {
    this.resourceGovernance.activationGate.assertPermitted('RESOURCE_CUSTOMER_RELEASE');
  }

  attemptStorefrontMutation() {
    throw new ActivationError('STOREFRONT_MUTATION_FORBIDDEN', 'B07 contains no storefront mutation capability');
  }

  overwriteHistoricalRevision() { throw new AuthorizationError('HISTORICAL_REVISION_IMMUTABLE', 'Historical revisions cannot be overwritten'); }
  deleteHistoricalRevision() { throw new AuthorizationError('HISTORICAL_REVISION_DELETE_FORBIDDEN', 'Historical revisions cannot be deleted'); }

  validateB05Queue() {
    requireValue(this.b05Queue.candidates.length === 9 && this.b05Queue.counts?.manuals === 3 && this.b05Queue.counts?.diagrams === 6, 'B05_QUEUE_COUNT_MISMATCH', 'B05 queue must contain exactly three manuals and six diagrams');
    requireValue(new Set(this.b05Queue.candidates.map((candidate) => candidate.candidateId)).size === 9, 'B05_QUEUE_DUPLICATE_IDENTITY', 'B05 candidate identities must be unique');
    requireValue(this.b05Queue.counts.approvedRevisions === 0 && this.b05Queue.counts.customerReleaseAuthorizations === 0 && this.b05Queue.releaseAuthorized === false, 'B05_QUEUE_AUTHORITY_ESCALATION', 'B05 import cannot contain approval or release authority');
    for (const candidate of this.b05Queue.candidates) {
      this.validateAssignment({ productGid: candidate.productGid, variantGid: candidate.observedVariantGid, machineVersion: candidate.candidateMachineVersion, approvalStatus: OBSERVED_APPLICABILITY });
      requireValue(candidate.approvalStatus === 'HUMAN_REVIEW_REQUIRED' && candidate.kevinApprovalStatus === 'NOT_EVIDENCED', 'B05_CANDIDATE_APPROVAL_FORBIDDEN', 'B05 candidates must remain unresolved evidence');
    }
  }

  prepareCandidate(candidate) {
    const resourceId = candidate.sourceIdentity;
    const revision = deepFreeze({
      revisionId: `b05rev_${sha256(`${this.b05Queue.queueId}|${candidate.candidateId}`).slice(0, 32)}`, sequence: 1, title: candidate.sourceFilename, category: candidate.category,
      language: null, editableSourceIdentity: candidate.sourceIdentity, proposedCustomerDeliveryLink: null,
      providerType: candidate.sourceReference.startsWith('gid://shopify/GenericFile/') ? 'SHOPIFY_FILE' : 'REPOSITORY_FILE',
      immutableRevisionIdentity: candidate.revisionIdentity, changeStatus: 'UNCHANGED_EXISTING_UNBOUND',
      changeReason: 'B05_CANDIDATE_EVIDENCE_IMPORT', changeEvidenceRefs: [candidate.sourceReference],
      applicability: [{ productGid: candidate.productGid, variantGid: candidate.observedVariantGid, machineVersion: candidate.candidateMachineVersion, approvalStatus: OBSERVED_APPLICABILITY }],
      rightsDisposition: { status: candidate.rightsStatus === 'NEEDS_CONFIRMATION' ? 'UNRESOLVED' : candidate.rightsStatus, evidenceRefs: [] },
      accessibilityDisposition: { status: 'UNRESOLVED', evidenceRefs: [] },
      availabilityDisposition: { status: 'UNRESOLVED', checkedAt: null, evidenceRefs: [], synthetic: true, productionVerified: false, futureProviderVerificationRequired: true },
      supersedesRevisionId: null, createdAt: this.clock(), createdBy: 'B07_SYNTHETIC_IMPORT',
      importedCandidateEvidence: clone(candidate), technicalApprovalInherited: false, customerReleaseAuthorized: false,
    });
    return {
      resourceId, title: revision.title, category: revision.category, version: 1, createdAt: this.clock(),
      origin: { kind: 'B05_CANDIDATE', candidateId: candidate.candidateId, queueDigest: sha256(this.b05Queue) },
      revisions: [revision], events: [],
    };
  }

  validateDraftInput(input, { allowEmptyApplicability }) {
    requireValue(input && typeof input === 'object' && !Array.isArray(input), 'RESOURCE_INPUT_REQUIRED', 'Resource input is required');
    requireValue(typeof input.title === 'string' && input.title.trim().length > 0, 'RESOURCE_TITLE_REQUIRED', 'Resource title is required');
    requireValue(RESOURCE_CATEGORIES.includes(input.category), 'UNSUPPORTED_RESOURCE_CATEGORY', 'Resource category is unsupported');
    requireValue(typeof input.editableSourceIdentity === 'string' && input.editableSourceIdentity.trim().length > 0, 'EDITING_SOURCE_IDENTITY_REQUIRED', 'Editable source identity is required');
    requireValue(input.providerType == null || PROVIDER_TYPES.includes(input.providerType), 'INVALID_PROVIDER_TYPE', 'Resource provider type is invalid');
    requireValue(Array.isArray(input.applicability), 'APPLICABILITY_COLLECTION_REQUIRED', 'Applicability must be a collection');
    if (!allowEmptyApplicability) requireValue(input.applicability.length > 0, 'RESOURCE_APPLICABILITY_REQUIRED', 'At least one exact assignment is required');
    const keys = new Set();
    for (const assignment of input.applicability) {
      this.validateAssignment(assignment);
      const key = `${assignment.productGid}|${assignment.variantGid}|${assignment.machineVersion}`;
      requireValue(!keys.has(key), 'DUPLICATE_APPLICABILITY_ASSIGNMENT', 'Duplicate applicability assignment is forbidden');
      keys.add(key);
    }
    this.validateDisposition(input.rightsDisposition, RIGHTS_STATUSES, 'RIGHTS');
    this.validateDisposition(input.accessibilityDisposition, ACCESSIBILITY_STATUSES, 'ACCESSIBILITY');
    this.validateAvailability(input.availabilityDisposition);
  }

  validateAssignment(assignment) {
    requireValue(assignment && typeof assignment.machineVersion === 'string' && assignment.machineVersion.trim().length > 0, 'MACHINE_VERSION_APPLICABILITY_REQUIRED', 'Machine version must be explicit');
    const product = this.catalogSnapshot.products.find((item) => item.productGid === assignment.productGid);
    requireValue(product, 'UNKNOWN_PRODUCT_GID', 'Product GID is not present in the accepted snapshot');
    const variantOwner = this.catalogSnapshot.products.find((item) => item.variants.some((variant) => variant.variantGid === assignment.variantGid));
    requireValue(variantOwner, 'UNKNOWN_VARIANT_GID', 'Variant GID is not present in the accepted snapshot');
    requireValue(variantOwner.productGid === product.productGid, 'INVALID_PRODUCT_VARIANT_RELATIONSHIP', 'Variant does not belong to the selected Product');
    requireValue([OBSERVED_APPLICABILITY, APPROVED_APPLICABILITY].includes(assignment.approvalStatus), 'INVALID_APPLICABILITY_STATUS', 'Applicability status is invalid');
    if (assignment.approvalStatus === APPROVED_APPLICABILITY) {
      requireValue(product.status === 'ACTIVE', 'STALE_CATALOG_REFERENCE', 'Only an Active Product snapshot identity may become approved applicability');
    }
  }

  validateDisposition(disposition, allowed, prefix) {
    requireValue(disposition && allowed.includes(disposition.status), `INVALID_${prefix}_DISPOSITION`, `${prefix} disposition is invalid`);
    requireValue(Array.isArray(disposition.evidenceRefs), `INVALID_${prefix}_EVIDENCE`, `${prefix} evidence must be a collection`);
    if (!['UNRESOLVED', 'REMEDIATION_REQUIRED', 'REJECTED'].includes(disposition.status)) requireValue(disposition.evidenceRefs.length > 0, `${prefix}_EVIDENCE_REQUIRED`, `${prefix} disposition requires evidence`);
  }

  validateAvailability(disposition) {
    requireValue(disposition && AVAILABILITY_STATUSES.includes(disposition.status), 'INVALID_AVAILABILITY_DISPOSITION', 'Availability disposition is invalid');
    requireValue(disposition.synthetic === true && disposition.productionVerified === false, 'PRODUCTION_AVAILABILITY_CLAIM_FORBIDDEN', 'B07 availability evidence must remain synthetic and non-production');
    requireValue(Array.isArray(disposition.evidenceRefs), 'INVALID_AVAILABILITY_EVIDENCE', 'Availability evidence must be a collection');
    if (disposition.status === 'SYNTHETIC_AVAILABLE') requireValue(disposition.checkedAt && disposition.evidenceRefs.length > 0, 'AVAILABILITY_EVIDENCE_REQUIRED', 'Synthetic availability requires time and evidence');
  }

  buildRevision({ actor, input, revisionId, sequence, supersedesRevisionId }) {
    return deepFreeze({
      revisionId, sequence, title: input.title.trim(), category: input.category, language: input.language || null,
      editableSourceIdentity: input.editableSourceIdentity.trim(), proposedCustomerDeliveryLink: input.proposedCustomerDeliveryLink || null,
      providerType: input.providerType || null,
      immutableRevisionIdentity: input.immutableRevisionIdentity || null, changeStatus: input.changeStatus,
      changeReason: input.changeReason || null, changeEvidenceRefs: [...(input.changeEvidenceRefs || [])],
      applicability: clone(input.applicability), rightsDisposition: clone(input.rightsDisposition),
      accessibilityDisposition: clone(input.accessibilityDisposition), availabilityDisposition: { ...clone(input.availabilityDisposition), futureProviderVerificationRequired: true },
      supersedesRevisionId, createdAt: this.clock(), createdBy: actor.actorId,
      importedCandidateEvidence: input.importedCandidateEvidence ? clone(input.importedCandidateEvidence) : null,
      technicalApprovalInherited: false, customerReleaseAuthorized: false,
    });
  }

  appendResourceEvent(record, actor, event) {
    const updated = { ...clone(record), version: record.version + 1, events: [...record.events, deepFreeze(clone(event))] };
    this.resources.set(record.resourceId, deepFreeze(updated));
    this.appendAudit(actor, event.eventType, { resourceId: record.resourceId, revisionId: event.revisionId, resourceVersion: updated.version });
    return this.detail(record.resourceId);
  }

  appendAudit(actor, eventType, details) {
    this.audit.push(deepFreeze({ auditEventId: this.auditIdFactory(), resourceId: details.resourceId || null, actorReference: actor.actorId, eventType, occurredAt: this.clock(), details: clone(details) }));
  }

  summary(record) {
    const revision = record.revisions[record.revisions.length - 1];
    const projected = this.projectRevision(record, revision);
    return {
      resourceId: record.resourceId, title: projected.title, category: projected.category, version: record.version,
      currentRevisionId: revision.revisionId, revisionCount: record.revisions.length, lifecycleStatus: projected.lifecycleStatus,
      changeStatus: projected.changeStatus, technicalApprovalStatus: projected.technicalApproval?.eventType || 'UNRESOLVED',
      applicability: this.canonicalApplicability(projected.applicability), missingRequirements: projected.missingRequirements,
      priority: record.origin.kind === 'B05_CANDIDATE' ? record.revisions[0].importedCandidateEvidence.priority : 'NORMAL',
      priorityRank: record.origin.kind === 'B05_CANDIDATE' && record.revisions[0].importedCandidateEvidence.priority === 'HIGH' ? 0 : 1,
      customerReleaseAuthorized: false,
    };
  }

  projectRevision(record, revision) {
    return {
      ...clone(revision),
      lifecycleStatus: this.lifecycleFor(record, revision.revisionId),
      technicalApproval: this.technicalApprovalFor(record, revision.revisionId, false),
      internalApproval: [...record.events].reverse().find((event) => event.revisionId === revision.revisionId && event.eventType === 'RESOURCE_INTERNAL_APPROVAL_RECORDED') || null,
      missingRequirements: this.missingRequirements(record, revision),
    };
  }

  lifecycleFor(record, revisionId) {
    const events = record.events.filter((event) => event.revisionId === revisionId);
    if (events.some((event) => event.eventType === 'RESOURCE_REVISION_RETIRED')) return 'RETIRED';
    if (events.some((event) => event.eventType === 'RESOURCE_REVISION_SUPERSEDED')) return 'SUPERSEDED';
    if (events.some((event) => event.eventType === 'RESOURCE_INTERNAL_APPROVAL_RECORDED')) return 'APPROVED_INTERNAL';
    if (events.some((event) => ['HISTORICAL_KEVIN_APPROVAL_ASSERTED', 'FRESH_TECHNICAL_DISPOSITION_RECORDED'].includes(event.eventType))) return 'TECHNICAL_REVIEW_REQUIRED';
    return 'DRAFT';
  }

  technicalApprovalFor(record, revisionId, required = true) {
    const event = [...record.events].reverse().find((candidate) => candidate.revisionId === revisionId && ['HISTORICAL_KEVIN_APPROVAL_ASSERTED', 'FRESH_TECHNICAL_DISPOSITION_RECORDED'].includes(candidate.eventType));
    if (required) requireValue(event, 'TECHNICAL_APPROVAL_EVIDENCE_REQUIRED', 'Technical approval evidence is required');
    return event || null;
  }

  missingRequirements(record, revision) {
    const missing = [];
    if (!this.validImmutableRevisionIdentity(revision.immutableRevisionIdentity)) missing.push('IMMUTABLE_REVISION_IDENTITY_REQUIRED');
    if (!revision.proposedCustomerDeliveryLink) missing.push('PROPOSED_DELIVERY_LINK_REQUIRED');
    if (!revision.providerType) missing.push('PROVIDER_TYPE_REQUIRED');
    if (!revision.language) missing.push('LANGUAGE_DISPOSITION_REQUIRED');
    if (!revision.applicability.length) missing.push('RESOURCE_APPLICABILITY_REQUIRED');
    if (revision.applicability.some((assignment) => assignment.approvalStatus !== APPROVED_APPLICABILITY)) missing.push('EXACT_APPLICABILITY_APPROVAL_REQUIRED');
    if (!['APPROVED_WITH_EVIDENCE', 'NOT_REQUIRED_WITH_EVIDENCE'].includes(revision.rightsDisposition.status)) missing.push('RIGHTS_DISPOSITION_REQUIRED');
    if (!['ACCESSIBLE_WITH_EVIDENCE', 'NOT_REQUIRED_WITH_EVIDENCE'].includes(revision.accessibilityDisposition.status)) missing.push('ACCESSIBILITY_DISPOSITION_REQUIRED');
    if (revision.availabilityDisposition.status !== 'SYNTHETIC_AVAILABLE') missing.push('SYNTHETIC_AVAILABILITY_EVIDENCE_REQUIRED');
    if (!this.technicalApprovalFor(record, revision.revisionId, false)) missing.push('TECHNICAL_APPROVAL_EVIDENCE_REQUIRED');
    return missing;
  }

  validImmutableRevisionIdentity(value) {
    return /^sha256:[a-f0-9]{64}$/i.test(value || '') || /^provider-revision:[A-Za-z0-9_-]+:[A-Za-z0-9._-]{4,}$/.test(value || '');
  }

  requireApprovedApplicability(applicability) {
    requireValue(applicability.length > 0, 'RESOURCE_APPLICABILITY_REQUIRED', 'Exact applicability is required');
    requireValue(applicability.every((assignment) => assignment.approvalStatus === APPROVED_APPLICABILITY), 'EXACT_APPLICABILITY_APPROVAL_REQUIRED', 'Every assignment must be explicitly approved');
  }

  canonicalApplicability(applicability) {
    return {
      productGids: [...new Set(applicability.map((item) => item.productGid))],
      variantGids: [...new Set(applicability.map((item) => item.variantGid))],
      machineVersions: [...new Set(applicability.map((item) => item.machineVersion))],
    };
  }

  assertNoConflictingActiveAssignment(resourceId, revision) {
    const keys = new Set(revision.applicability.map((item) => `${revision.category}|${item.productGid}|${item.variantGid}|${item.machineVersion}`));
    for (const record of this.resources.values()) {
      for (const candidate of record.revisions) {
        if (record.resourceId === resourceId && candidate.revisionId === revision.revisionId) continue;
        if (this.lifecycleFor(record, candidate.revisionId) !== 'APPROVED_INTERNAL') continue;
        if (candidate.applicability.some((item) => keys.has(`${candidate.category}|${item.productGid}|${item.variantGid}|${item.machineVersion}`))) {
          throw new ConflictError('DUPLICATE_ACTIVE_ASSIGNMENT', 'Another active internal resource already owns this category and exact applicability');
        }
      }
    }
  }

  requireResource(resourceId) {
    const record = this.resources.get(resourceId);
    requireValue(record, 'RESOURCE_NOT_FOUND', 'Administrative resource was not found');
    return record;
  }

  requireResourceVersion(resourceId, expectedVersion) {
    const record = this.requireResource(resourceId);
    if (record.version !== expectedVersion) throw new ConflictError('RESOURCE_VERSION_CONFLICT', 'Expected resource version does not match', { expectedVersion, actualVersion: record.version });
    return record;
  }

  requireRevision(record, revisionId) {
    const revision = record.revisions.find((item) => item.revisionId === revisionId);
    requireValue(revision, 'RESOURCE_REVISION_NOT_FOUND', 'Administrative revision was not found');
    return revision;
  }

  assertNoRestrictedData(value, key = null) {
    const normalizedKey = String(key || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (normalizedKey && FORBIDDEN_EXPORT_KEY_PARTS.some((part) => normalizedKey.includes(part))) throw new AuthorizationError('RESTRICTED_EXPORT_DATA', `Resource export cannot include ${key}`);
    if (Array.isArray(value)) return value.forEach((item) => this.assertNoRestrictedData(item));
    if (!value || typeof value !== 'object') return;
    for (const [entryKey, entry] of Object.entries(value)) this.assertNoRestrictedData(entry, entryKey);
  }

  validateArchive(archive) {
    requireValue(archive && archive.archiveVersion === ARCHIVE_VERSION && archive.mode === 'ISOLATED_SYNTHETIC_RESOURCE_ADMINISTRATION', 'INVALID_RESOURCE_ARCHIVE', 'Resource archive identity or mode is invalid');
    requireValue(archive.customerReleaseAuthorized === false && Array.isArray(archive.resources) && Array.isArray(archive.audit), 'INVALID_RESOURCE_ARCHIVE', 'Resource archive shape is invalid');
    const digestInput = clone(archive); delete digestInput.archiveDigest;
    requireValue(archive.archiveDigest === sha256(digestInput), 'RESOURCE_ARCHIVE_DIGEST_MISMATCH', 'Resource archive digest is invalid');
    this.assertNoRestrictedData(archive);
    const ids = new Set();
    const allRevisionIds = new Set();
    for (const record of archive.resources) {
      requireValue(record && typeof record.resourceId === 'string' && !ids.has(record.resourceId) && Number.isInteger(record.version) && record.version >= 1 && Array.isArray(record.revisions) && record.revisions.length > 0 && Array.isArray(record.events), 'INVALID_RESOURCE_ARCHIVE', 'Archive resource records must be unique and complete');
      ids.add(record.resourceId);
      const revisionIds = new Set();
      for (const revision of record.revisions) {
        requireValue(typeof revision.revisionId === 'string' && !revisionIds.has(revision.revisionId) && !allRevisionIds.has(revision.revisionId), 'INVALID_RESOURCE_ARCHIVE', 'Archive revision IDs must be globally unique');
        revisionIds.add(revision.revisionId);
        allRevisionIds.add(revision.revisionId);
        this.validateDraftInput(revision, { allowEmptyApplicability: true });
        requireValue(revision.customerReleaseAuthorized === false, 'RESOURCE_ARCHIVE_AUTHORITY_ESCALATION', 'Imported revisions cannot authorize customer release');
      }
      requireValue(record.events.every((event) => event && typeof event.eventType === 'string' && typeof event.recordedAt === 'string' && (revisionIds.has(event.revisionId) || event.eventType === 'RESOURCE_REGISTRY_ARCHIVE_IMPORTED')), 'INVALID_RESOURCE_ARCHIVE', 'Archive events must be complete and reference retained revisions');
      requireValue(record.version >= record.revisions.length + record.events.length, 'INVALID_RESOURCE_ARCHIVE', 'Archive record version cannot precede its immutable revisions and events');
    }
    requireValue(archive.audit.every((event) => event && typeof event.auditEventId === 'string' && typeof event.eventType === 'string' && typeof event.occurredAt === 'string' && (event.resourceId == null || ids.has(event.resourceId))), 'INVALID_RESOURCE_ARCHIVE', 'Archive audit events must be complete and reference retained resources');
    return { resources: clone(archive.resources), audit: clone(archive.audit) };
  }
}

module.exports = {
  ACCESSIBILITY_STATUSES,
  ADMIN_LIFECYCLE_STATES,
  APPROVED_APPLICABILITY,
  ARCHIVE_VERSION,
  AVAILABILITY_STATUSES,
  CHANGE_STATUSES,
  OBSERVED_APPLICABILITY,
  HISTORICAL_APPROVAL_EVIDENCE_REFERENCE,
  PROVIDER_TYPES,
  RIGHTS_STATUSES,
  ResourceAdministrationService,
};
