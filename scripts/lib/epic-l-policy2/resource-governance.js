'use strict';

const {
  TransitionError,
  clone,
  createOpaqueIdentifier,
  deepFreeze,
  requireAuthorization,
  requireValue,
} = require('./common');

const RESOURCE_CATEGORIES = Object.freeze([
  'MANUAL',
  'DYNAMIC_INSTRUCTION_DOCUMENT',
  'DIAGRAM',
  'SETUP_GUIDE',
  'TUTORIAL_VIDEO',
  'SAFETY_NOTICE',
]);

class ResourceRevisionGovernance {
  constructor({
    catalog,
    activationGate,
    authorize = () => false,
    technicalApprovalAuthority,
    clock = () => new Date().toISOString(),
    resourceIdFactory = () => createOpaqueIdentifier(16, 'res_'),
    revisionIdFactory = () => createOpaqueIdentifier(16, 'rev_'),
    auditIdFactory = () => createOpaqueIdentifier(16, 'raud_'),
    testMode = false,
  }) {
    requireValue(catalog, 'RESOURCE_CATALOG_REQUIRED', 'An exact Product/Variant catalog is required');
    requireValue(activationGate, 'ACTIVATION_GATE_REQUIRED', 'An activation gate is required');
    requireValue(technicalApprovalAuthority, 'TECHNICAL_AUTHORITY_REQUIRED', 'Technical approval authority must be configured explicitly');
    if (technicalApprovalAuthority.synthetic === true) {
      requireValue(testMode === true, 'SYNTHETIC_AUTHORITY_FORBIDDEN', 'Synthetic technical authority is permitted only in explicit test mode');
    }
    this.catalog = catalog;
    this.activationGate = activationGate;
    this.authorize = authorize;
    this.technicalApprovalAuthority = deepFreeze(clone(technicalApprovalAuthority));
    this.clock = clock;
    this.resourceIdFactory = resourceIdFactory;
    this.revisionIdFactory = revisionIdFactory;
    this.auditIdFactory = auditIdFactory;
    this.resources = new Map();
    this.audit = [];
  }

  createRevision({ actor, resourceId, category, sourceIdentity, applicability, customerCopyApproval = false }) {
    requireAuthorization(this.authorize, actor, 'RESOURCE_REVISION_CREATE', { resourceId, category });
    requireValue(RESOURCE_CATEGORIES.includes(category), 'UNSUPPORTED_RESOURCE_CATEGORY', 'Unsupported resource category', { category });
    requireValue(typeof sourceIdentity === 'string' && sourceIdentity.length > 0, 'EDITING_SOURCE_IDENTITY_REQUIRED', 'Editing source identity is required');
    this.validateApplicability(applicability);
    const stableResourceId = resourceId || this.resourceIdFactory();
    const revisionId = this.revisionIdFactory();
    const revision = deepFreeze({
      resourceId: stableResourceId,
      revisionId,
      category,
      sourceIdentity,
      applicability: clone(applicability),
      createdAt: this.clock(),
      releaseStatus: 'DRAFT',
      technicalApproval: null,
      customerCopyApproval,
      supersedesRevisionId: null,
      supersededByRevisionId: null,
    });
    const existing = this.resources.get(stableResourceId) || [];
    this.resources.set(stableResourceId, [...existing, revision]);
    this.appendAudit(actor, 'RESOURCE_REVISION_CREATED', { resourceId: stableResourceId, revisionId });
    return clone(revision);
  }

  submitTechnicalReview({ actor, resourceId, revisionId }) {
    return this.changeRevision(actor, resourceId, revisionId, 'RESOURCE_TECHNICAL_REVIEW_REQUESTED', (revision) => ({
      ...revision,
      releaseStatus: 'TECHNICAL_REVIEW',
    }));
  }

  approveTechnical({ actor, resourceId, revisionId, approvalEvidence }) {
    requireAuthorization(this.authorize, actor, 'RESOURCE_TECHNICAL_APPROVE', { resourceId, revisionId });
    requireValue(actor.actorId === this.technicalApprovalAuthority.actorId, 'KEVIN_APPROVAL_REQUIRED', 'Configured Kevin technical approval authority is required');
    requireValue(Array.isArray(approvalEvidence) && approvalEvidence.length > 0, 'APPROVAL_EVIDENCE_REQUIRED', 'Technical approval evidence is required');
    return this.changeRevision(actor, resourceId, revisionId, 'RESOURCE_TECHNICALLY_APPROVED', (revision) => {
      requireValue(revision.releaseStatus === 'TECHNICAL_REVIEW', 'RESOURCE_NOT_IN_TECHNICAL_REVIEW', 'Resource must be in technical review before approval');
      return {
        ...revision,
        releaseStatus: 'APPROVED_INTERNAL',
        technicalApproval: {
          actorId: actor.actorId,
          authorityRole: this.technicalApprovalAuthority.authorityRole,
          approvedAt: this.clock(),
          evidenceRefs: [...approvalEvidence],
          synthetic: this.technicalApprovalAuthority.synthetic === true,
        },
      };
    });
  }

  releaseForCustomer({ actor, resourceId, revisionId }) {
    requireAuthorization(this.authorize, actor, 'RESOURCE_CUSTOMER_RELEASE', { resourceId, revisionId });
    const revision = this.getRevision(resourceId, revisionId);
    requireValue(revision.releaseStatus === 'APPROVED_INTERNAL', 'RESOURCE_NOT_TECHNICALLY_APPROVED', 'Only an internally approved resource can be considered for customer release');
    requireValue(revision.technicalApproval?.actorId === this.technicalApprovalAuthority.actorId, 'KEVIN_APPROVAL_REQUIRED', 'Kevin technical approval evidence is missing');
    requireValue(revision.customerCopyApproval === true, 'CUSTOMER_COPY_NOT_APPROVED', 'Customer-facing copy approval is missing');
    this.activationGate.assertPermitted('RESOURCE_CUSTOMER_RELEASE');
    throw new TransitionError('UNREACHABLE_RELEASE_STATE', 'Disabled activation gate must reject customer release');
  }

  supersede({ actor, resourceId, previousRevisionId, replacement }) {
    const next = this.createRevision({ actor, resourceId, ...replacement });
    this.changeRevision(actor, resourceId, previousRevisionId, 'RESOURCE_REVISION_SUPERSEDED', (revision) => ({
      ...revision,
      releaseStatus: 'RETIRED',
      supersededByRevisionId: next.revisionId,
    }));
    this.changeRevision(actor, resourceId, next.revisionId, 'RESOURCE_REVISION_LINKED_TO_PREDECESSOR', (revision) => ({
      ...revision,
      supersedesRevisionId: previousRevisionId,
    }));
    return this.getRevision(resourceId, next.revisionId);
  }

  resolveApprovedCustomerRevision({ productGid, variantGid, machineVersion, category }) {
    this.catalog.assertRelationship(productGid, variantGid);
    const matches = [];
    for (const revisions of this.resources.values()) {
      for (const revision of revisions) {
        if (revision.releaseStatus !== 'APPROVED_CUSTOMER_RELEASE') continue;
        if (category && revision.category !== category) continue;
        if (!revision.applicability.productGids.includes(productGid)) continue;
        if (!revision.applicability.variantGids.includes(variantGid)) continue;
        if (!revision.applicability.machineVersions.includes(machineVersion)) continue;
        matches.push(clone(revision));
      }
    }
    return matches;
  }

  history(resourceId) {
    return clone(this.resources.get(resourceId) || []);
  }

  auditTrail() {
    return clone(this.audit);
  }

  validateApplicability(applicability) {
    requireValue(applicability && Array.isArray(applicability.productGids) && applicability.productGids.length > 0, 'PRODUCT_APPLICABILITY_REQUIRED', 'At least one Product GID is required');
    requireValue(Array.isArray(applicability.variantGids) && applicability.variantGids.length > 0, 'VARIANT_APPLICABILITY_REQUIRED', 'At least one Variant GID is required');
    requireValue(Array.isArray(applicability.machineVersions) && applicability.machineVersions.length > 0, 'MACHINE_VERSION_APPLICABILITY_REQUIRED', 'At least one machine version is required');
    for (const productGid of applicability.productGids) {
      requireValue(applicability.variantGids.some((variantGid) => this.catalog.hasRelationship(productGid, variantGid)), 'INVALID_PRODUCT_VARIANT_RELATIONSHIP', 'Every applicable Product must have an exact applicable Variant relationship');
    }
    for (const variantGid of applicability.variantGids) {
      requireValue(applicability.productGids.some((productGid) => this.catalog.hasRelationship(productGid, variantGid)), 'INVALID_PRODUCT_VARIANT_RELATIONSHIP', 'Every applicable Variant must belong to an applicable Product');
    }
  }

  getRevision(resourceId, revisionId) {
    const revision = (this.resources.get(resourceId) || []).find((candidate) => candidate.revisionId === revisionId);
    requireValue(revision, 'RESOURCE_REVISION_NOT_FOUND', 'Resource revision was not found');
    return clone(revision);
  }

  changeRevision(actor, resourceId, revisionId, eventType, mutate) {
    const revisions = this.resources.get(resourceId) || [];
    const index = revisions.findIndex((candidate) => candidate.revisionId === revisionId);
    requireValue(index >= 0, 'RESOURCE_REVISION_NOT_FOUND', 'Resource revision was not found');
    const updated = deepFreeze(mutate(clone(revisions[index])));
    const next = [...revisions];
    next[index] = updated;
    this.resources.set(resourceId, next);
    this.appendAudit(actor, eventType, { resourceId, revisionId });
    return clone(updated);
  }

  appendAudit(actor, eventType, details) {
    this.audit.push(deepFreeze({
      auditEventId: this.auditIdFactory(),
      actorReference: actor.actorId,
      eventType,
      occurredAt: this.clock(),
      details: clone(details),
    }));
  }
}

module.exports = { RESOURCE_CATEGORIES, ResourceRevisionGovernance };
