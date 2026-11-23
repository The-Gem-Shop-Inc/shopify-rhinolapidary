'use strict';

const {
  ActivationError,
  AuthorizationError,
  ConflictError,
  TransitionError,
  clone,
  createOpaqueIdentifier,
  deepFreeze,
  requireAuthorization,
  requireValue,
} = require('./common');

const REVIEW_DECISION_TYPES = Object.freeze(['INITIAL_WARRANTY_REVIEW', 'REFERRED_WARRANTY_REVIEW', 'RECONSIDERATION_REVIEW']);

class UnresolvedWarrantyAuthorityResolver {
  constructor() { this.synthetic = false; }

  inspect({ reviewerIdentityReference, authorityRole, authorityScope }) {
    return {
      status: 'UNRESOLVED',
      reviewerIdentityReference,
      authorityRole,
      authorityScope,
      authorizationEvidenceReference: null,
      operationalAuthorityVerified: false,
      syntheticAuthorityVerified: false,
    };
  }

  authorizeReviewer(input) {
    const inspected = this.inspect(input);
    throw new AuthorizationError('WARRANTY_AUTHORITY_UNRESOLVED', 'Real human warranty authority is unresolved', inspected);
  }
}

class SyntheticWarrantyAuthorityResolver {
  constructor(grants = []) {
    this.synthetic = true;
    this.grants = grants.map((grant) => clone(grant));
  }

  inspect({ reviewerIdentityReference, authorityRole, authorityScope, assessmentType, at }) {
    const grant = this.grants.find((candidate) => candidate.reviewerIdentityReference === reviewerIdentityReference);
    if (!grant) return this.unresolved('UNRESOLVED', reviewerIdentityReference, authorityRole, authorityScope);
    if (!/^synthetic:/.test(grant.authorizationEvidenceReference || '')) return this.unresolved('AUTHORIZATION_EVIDENCE_MISSING', reviewerIdentityReference, authorityRole, authorityScope);
    if (grant.authorityRole !== authorityRole) return this.unresolved('ROLE_MISMATCH', reviewerIdentityReference, authorityRole, authorityScope);
    if (!grant.authorityScopes?.includes(authorityScope) || (assessmentType && !grant.assessmentTypes?.includes(assessmentType))) {
      return this.unresolved('OUT_OF_SCOPE', reviewerIdentityReference, authorityRole, authorityScope);
    }
    if (at < grant.authorizedFrom || at > grant.authorizedTo) return this.unresolved('EXPIRED_OR_NOT_YET_VALID', reviewerIdentityReference, authorityRole, authorityScope);
    return {
      status: 'VERIFIED_SYNTHETIC',
      reviewerIdentityReference,
      actorId: grant.actorId,
      authorityRole,
      authorityScope,
      authorizationEvidenceReference: grant.authorizationEvidenceReference,
      authorizedFrom: grant.authorizedFrom,
      authorizedTo: grant.authorizedTo,
      operationalAuthorityVerified: false,
      syntheticAuthorityVerified: true,
    };
  }

  authorizeReviewer({ actor, ...input }) {
    const inspected = this.inspect(input);
    requireValue(inspected.status === 'VERIFIED_SYNTHETIC', this.errorCode(inspected.status), 'Synthetic reviewer authority is not valid for this review', inspected);
    if (!actor || actor.actorId !== inspected.actorId) {
      throw new AuthorizationError('REVIEWER_IDENTITY_SPOOFING_REJECTED', 'The authenticated synthetic actor does not match the granted reviewer identity');
    }
    return inspected;
  }

  unresolved(status, reviewerIdentityReference, authorityRole, authorityScope) {
    return {
      status,
      reviewerIdentityReference,
      authorityRole,
      authorityScope,
      authorizationEvidenceReference: null,
      operationalAuthorityVerified: false,
      syntheticAuthorityVerified: false,
    };
  }

  errorCode(status) {
    if (status === 'OUT_OF_SCOPE') return 'WARRANTY_AUTHORITY_OUT_OF_SCOPE';
    if (status === 'EXPIRED_OR_NOT_YET_VALID') return 'WARRANTY_AUTHORITY_EXPIRED';
    if (status === 'ROLE_MISMATCH') return 'WARRANTY_AUTHORITY_ROLE_MISMATCH';
    if (status === 'AUTHORIZATION_EVIDENCE_MISSING') return 'WARRANTY_AUTHORIZATION_EVIDENCE_MISSING';
    return 'WARRANTY_AUTHORITY_UNRESOLVED';
  }
}

class WarrantyReviewService {
  constructor({
    privateRecords,
    supportIntake,
    activationGate,
    catalog,
    coverageMatrix,
    decisionReceipt,
    contract,
    authorize = () => false,
    systemActor,
    authorityResolver = new UnresolvedWarrantyAuthorityResolver(),
    clock = () => new Date().toISOString(),
    reviewIdFactory = () => createOpaqueIdentifier(16, 'wreview_'),
    assessmentIdFactory = () => createOpaqueIdentifier(16, 'wassess_'),
    testMode = false,
  }) {
    requireValue(privateRecords && supportIntake && activationGate && catalog && coverageMatrix && decisionReceipt && contract, 'WARRANTY_REVIEW_DEPENDENCY_REQUIRED', 'B04 requires the committed Policy 2.0 and B01-B03 domain ports');
    requireValue(systemActor, 'SYSTEM_ACTOR_REQUIRED', 'B04 requires the private system actor');
    requireValue(contract.contractId === 'EPIC-L-POLICY2-WARRANTY-REVIEW', 'WARRANTY_REVIEW_CONTRACT_REQUIRED', 'The versioned B04 review contract is required');
    if (authorityResolver.synthetic) requireValue(testMode, 'SYNTHETIC_AUTHORITY_FORBIDDEN', 'Synthetic warranty authority requires explicit test mode');
    this.privateRecords = privateRecords;
    this.supportIntake = supportIntake;
    this.activationGate = activationGate;
    this.catalog = catalog;
    this.coverageMatrix = clone(coverageMatrix);
    this.decisionReceipt = clone(decisionReceipt);
    this.contract = clone(contract);
    this.authorize = authorize;
    this.systemActor = systemActor;
    this.authorityResolver = authorityResolver;
    this.clock = clock;
    this.reviewIdFactory = reviewIdFactory;
    this.assessmentIdFactory = assessmentIdFactory;
    this.testMode = testMode;
    this.reviewIdsByCommand = new Map();
    this.requestedTimesByCommand = new Map();
    this.classifiedTimesByCommand = new Map();
    this.recordIdsByReview = new Map();
  }

  requestReview({ actor, commandId, caseReference, packet }) {
    requireAuthorization(this.authorize, actor, 'WARRANTY_REVIEW_REQUEST', { caseReference });
    requireAuthorization(this.authorize, actor, 'WARRANTY_REVIEW_PRIVATE_READ', { caseReference });
    this.validatePacket(packet);
    const supportCase = this.supportIntake.getPrivateCase({ actor, caseReference });
    const intake = this.supportFacts(supportCase);
    this.validateSupportRelationship(intake, packet);
    const reviewId = this.reviewIdsByCommand.get(commandId) || this.reviewIdFactory();
    const requestedAt = this.requestedTimesByCommand.get(commandId) || this.clock();
    const classifiedAt = this.classifiedTimesByCommand.get(commandId) || this.clock();
    this.reviewIdsByCommand.set(commandId, reviewId);
    this.requestedTimesByCommand.set(commandId, requestedAt);
    this.classifiedTimesByCommand.set(commandId, classifiedAt);
    const authorityResolution = this.authorityResolver.inspect({
      reviewerIdentityReference: packet.requestedReviewerIdentityReference,
      authorityRole: packet.authorityRole,
      authorityScope: packet.authorityScope,
      at: requestedAt,
    });
    const readiness = this.evaluateReadiness({ packet, supportCase, authorityResolution });
    const data = {
      reviewId,
      caseReference,
      caseRecordId: supportCase.recordId,
      customerReference: intake.customerReference,
      supportCategory: intake.category,
      supportStateAtRequest: supportCase.state,
      requestedAt,
      requestedBy: actor.actorId,
      decisionType: packet.decisionType,
      requestedReviewerIdentityReference: packet.requestedReviewerIdentityReference,
      authorityRole: packet.authorityRole,
      authorityScope: packet.authorityScope,
      authorityResolution,
      machineIdentity: clone(packet.machineIdentity),
      registrationContext: this.registrationContextSummary(intake.registrationContext),
      policyEvidence: clone(packet.policyEvidence),
      coverageEvidence: clone(packet.coverageEvidence),
      ownershipEvidenceRefs: [...(packet.ownershipEvidenceRefs || [])],
      purchaseEvidenceRefs: [...(packet.purchaseEvidenceRefs || [])],
      supportingEvidenceRefs: [...(packet.supportingEvidenceRefs || [])],
      obligationEvidence: clone(packet.obligationEvidence),
      explicitReferral: clone(packet.explicitReferral || null),
      missingEvidence: readiness.missingEvidence,
      safetySnapshot: this.safetySnapshot(supportCase),
      evidenceRevisions: [{ revision: 1, recordedAt: requestedAt, recordedBy: actor.actorId, reason: 'INITIAL_REVIEW_PACKET', packet: clone(packet), readiness: clone(readiness) }],
      syntheticAssessments: [],
      reconsiderations: [],
      supersession: null,
      customerEffect: false,
      operationalDecision: null,
      customerNotification: null,
      warrantyFindingIssued: false,
      rhinoCaseOwnershipRetained: supportCase.data.rhinoCaseOwnershipRetained === true,
      rhinoCommunicationResponsibilityRetained: supportCase.data.rhinoCommunicationResponsibilityRetained === true,
      reviewStateHistory: [{ fromState: null, toState: 'REVIEW_REQUESTED', occurredAt: requestedAt, event: 'REVIEW_REQUESTED' }],
    };
    const created = this.privateRecords.create({
      actor: this.recordActor(actor),
      commandId: `${commandId}:create`,
      category: 'APPROVAL_EVIDENCE',
      state: 'REVIEW_REQUESTED',
      data,
    });
    this.recordIdsByReview.set(reviewId, created.recordId);
    this.assertTransition('REVIEW_REQUESTED', readiness.state);
    const classified = this.privateRecords.update({
      actor: this.recordActor(actor), commandId: `${commandId}:classify`, recordId: created.recordId, expectedVersion: created.version, nextState: readiness.state,
      patch: { reviewStateHistory: [...data.reviewStateHistory, { fromState: 'REVIEW_REQUESTED', toState: readiness.state, occurredAt: classifiedAt, event: 'REVIEW_READINESS_CLASSIFIED' }] },
      eventType: 'WARRANTY_REVIEW_READINESS_CLASSIFIED', eventDetails: { readinessState: readiness.state },
    });
    return this.privateView(classified);
  }

  getPrivateReview({ actor, reviewId }) {
    const record = this.readRecord(actor, reviewId);
    this.requirePrivateRead(actor, record);
    return this.privateView(record);
  }

  getPublicHandle(reviewId) {
    const record = this.readRecord(this.systemActor, reviewId);
    return deepFreeze({
      reviewReference: reviewId,
      processingStatus: record.state === 'REVIEW_WITHDRAWN_OR_SUPERSEDED' ? 'WITHDRAWN' : 'INTERNAL_REVIEW',
      customerDecisionIssued: false,
      customerNotificationSent: false,
      customerActivationPermitted: false,
    });
  }

  auditTrail({ actor, reviewId }) {
    const record = this.readRecord(actor, reviewId);
    this.requirePrivateRead(actor, record);
    return this.privateRecords.auditTrail({ actor: this.recordActor(actor), recordId: record.recordId });
  }

  addEvidenceRevision({ actor, commandId, reviewId, expectedVersion, reason, evidencePatch }) {
    requireAuthorization(this.authorize, actor, 'WARRANTY_EVIDENCE_PREPARE', { reviewId });
    requireValue(/^SYNTHETIC_[A-Z0-9_:-]{4,}$/.test(reason || ''), 'EVIDENCE_REVISION_REASON_REQUIRED', 'A synthetic evidence revision reason is required');
    const allowed = ['policyEvidence', 'coverageEvidence', 'ownershipEvidenceRefs', 'purchaseEvidenceRefs', 'supportingEvidenceRefs', 'obligationEvidence'];
    requireValue(evidencePatch && Object.keys(evidencePatch).every((key) => allowed.includes(key)), 'UNSUPPORTED_EVIDENCE_PATCH', 'Evidence revisions cannot alter review, case, customer, or machine identities');
    let record = this.readRecord(actor, reviewId);
    this.requirePrivateRead(actor, record);
    this.requireVersion(record, expectedVersion);
    requireValue(record.state !== 'SYNTHETIC_ASSESSMENT_RECORDED', 'RECONSIDERATION_REQUIRED_BEFORE_EVIDENCE_CHANGE', 'Recorded assessments require reconsideration before evidence changes');
    const nextData = { ...clone(record.data), ...clone(evidencePatch) };
    const packet = this.packetFromData(nextData);
    this.validatePacket(packet);
    const supportCase = this.supportIntake.getPrivateCase({ actor, caseReference: record.data.caseReference });
    const authorityResolution = this.authorityResolver.inspect({
      reviewerIdentityReference: nextData.requestedReviewerIdentityReference,
      authorityRole: nextData.authorityRole,
      authorityScope: nextData.authorityScope,
      at: this.clock(),
    });
    const readiness = this.evaluateReadiness({ packet, supportCase, authorityResolution });
    this.assertTransition(record.state, readiness.state);
    const revision = record.data.evidenceRevisions.length + 1;
    nextData.authorityResolution = authorityResolution;
    nextData.missingEvidence = readiness.missingEvidence;
    nextData.safetySnapshot = this.safetySnapshot(supportCase);
    nextData.evidenceRevisions = [...record.data.evidenceRevisions, { revision, recordedAt: this.clock(), recordedBy: actor.actorId, reason, packet: clone(packet), readiness: clone(readiness) }];
    record = this.privateRecords.update({
      actor: this.recordActor(actor), commandId, recordId: record.recordId, expectedVersion, nextState: readiness.state,
      patch: nextData, eventType: 'WARRANTY_REVIEW_EVIDENCE_REVISED', eventDetails: { revision, reason },
    });
    return this.privateView(record);
  }

  startHumanReview({ actor, commandId, reviewId, expectedVersion }) {
    requireAuthorization(this.authorize, actor, 'WARRANTY_REVIEW_CONDUCT', { reviewId });
    let record = this.readRecord(actor, reviewId);
    this.requirePrivateRead(actor, record);
    this.requireVersion(record, expectedVersion);
    requireValue(record.state === 'READY_FOR_HUMAN_REVIEW', 'WARRANTY_REVIEW_NOT_READY', 'The review is not ready for a human reviewer');
    const supportCase = this.supportIntake.getPrivateCase({ actor, caseReference: record.data.caseReference });
    this.assertSafetyAllowsReview(supportCase);
    const authority = this.authorityResolver.authorizeReviewer({
      actor,
      reviewerIdentityReference: record.data.requestedReviewerIdentityReference,
      authorityRole: record.data.authorityRole,
      authorityScope: record.data.authorityScope,
      at: this.clock(),
    });
    this.assertTransition(record.state, 'HUMAN_REVIEW_UNDERWAY');
    record = this.privateRecords.update({
      actor: this.recordActor(actor), commandId, recordId: record.recordId, expectedVersion, nextState: 'HUMAN_REVIEW_UNDERWAY',
      patch: { authorityResolution: authority, reviewStartedAt: this.clock(), reviewStartedBy: actor.actorId },
      eventType: 'SYNTHETIC_HUMAN_WARRANTY_REVIEW_STARTED', eventDetails: { reviewerIdentityReference: authority.reviewerIdentityReference },
    });
    return this.privateView(record);
  }

  recordSyntheticAssessment({ actor, commandId, reviewId, expectedVersion, assessment }) {
    requireAuthorization(this.authorize, actor, 'WARRANTY_REVIEW_CONDUCT', { reviewId });
    this.validateAssessment(assessment);
    let record = this.readRecord(actor, reviewId);
    this.requirePrivateRead(actor, record);
    this.requireVersion(record, expectedVersion);
    requireValue(record.state === 'HUMAN_REVIEW_UNDERWAY', 'HUMAN_REVIEW_NOT_UNDERWAY', 'A synthetic assessment requires an underway human review');
    const knownEvidence = new Set(this.allEvidenceRefs(record.data));
    requireValue(assessment.supportingEvidenceRefs.every((reference) => knownEvidence.has(reference)), 'ASSESSMENT_EVIDENCE_NOT_IN_REVIEW_PACKET', 'Assessment evidence must already be preserved in the review packet');
    const supportCase = this.supportIntake.getPrivateCase({ actor, caseReference: record.data.caseReference });
    this.assertSafetyAllowsReview(supportCase);
    const authority = this.authorityResolver.authorizeReviewer({
      actor,
      reviewerIdentityReference: record.data.requestedReviewerIdentityReference,
      authorityRole: record.data.authorityRole,
      authorityScope: record.data.authorityScope,
      assessmentType: assessment.assessmentType,
      at: this.clock(),
    });
    const nextState = assessment.assessmentType === 'SYNTHETIC_FURTHER_EVIDENCE_ASSESSMENT' ? 'FURTHER_EVIDENCE_REQUIRED' : 'SYNTHETIC_ASSESSMENT_RECORDED';
    this.assertTransition(record.state, nextState);
    const recorded = {
      assessmentId: this.assessmentIdFactory(),
      assessmentType: assessment.assessmentType,
      conclusion: assessment.conclusion,
      reasoningCode: assessment.reasoningCode,
      supportingEvidenceRefs: [...assessment.supportingEvidenceRefs],
      reviewerIdentityReference: authority.reviewerIdentityReference,
      authorityRole: authority.authorityRole,
      authorityScope: authority.authorityScope,
      authorizationEvidenceReference: authority.authorizationEvidenceReference,
      reviewedAt: this.clock(),
      context: 'SYNTHETIC',
      approvalStatus: 'SYNTHETIC_ASSESSMENT_ONLY',
      operationalDecision: false,
      customerEffect: false,
      customerPromiseAuthorized: false,
      notificationAuthorized: false,
      remedyAuthorized: false,
    };
    record = this.privateRecords.update({
      actor: this.recordActor(actor), commandId, recordId: record.recordId, expectedVersion, nextState,
      patch: {
        syntheticAssessments: [...record.data.syntheticAssessments, recorded],
        missingEvidence: nextState === 'FURTHER_EVIDENCE_REQUIRED' ? [...new Set([...record.data.missingEvidence, 'REVIEWER_REQUESTED_ADDITIONAL_EVIDENCE'])] : record.data.missingEvidence,
        customerEffect: false,
        operationalDecision: null,
        customerNotification: null,
        warrantyFindingIssued: false,
      },
      eventType: 'SYNTHETIC_WARRANTY_ASSESSMENT_RECORDED', eventDetails: { assessmentId: recorded.assessmentId, assessmentType: recorded.assessmentType },
    });
    return this.privateView(record);
  }

  requestReconsideration({ actor, commandId, reviewId, expectedVersion, reason, evidenceRefs }) {
    requireAuthorization(this.authorize, actor, 'WARRANTY_REVIEW_RECONSIDER', { reviewId });
    requireValue(/^SYNTHETIC_[A-Z0-9_:-]{4,}$/.test(reason || '') && this.validEvidenceRefs(evidenceRefs), 'RECONSIDERATION_EVIDENCE_REQUIRED', 'Reconsideration requires a synthetic reason and evidence');
    let record = this.readRecord(actor, reviewId);
    this.requirePrivateRead(actor, record);
    this.requireVersion(record, expectedVersion);
    this.assertTransition(record.state, 'FURTHER_EVIDENCE_REQUIRED');
    const previousAssessmentId = record.data.syntheticAssessments.at(-1)?.assessmentId || null;
    record = this.privateRecords.update({
      actor: this.recordActor(actor), commandId, recordId: record.recordId, expectedVersion, nextState: 'FURTHER_EVIDENCE_REQUIRED',
      patch: {
        reconsiderations: [...record.data.reconsiderations, { requestedAt: this.clock(), requestedBy: actor.actorId, reason, evidenceRefs: [...evidenceRefs], previousAssessmentId }],
        missingEvidence: [...new Set([...record.data.missingEvidence, 'RECONSIDERATION_EVIDENCE_PENDING'])],
      },
      eventType: 'WARRANTY_REVIEW_RECONSIDERATION_REQUESTED', eventDetails: { reason, previousAssessmentId },
    });
    return this.privateView(record);
  }

  supersedeReview({ actor, commandId, reviewId, expectedVersion, reason, successorReviewReference = null }) {
    requireAuthorization(this.authorize, actor, 'WARRANTY_REVIEW_SUPERSEDE', { reviewId });
    requireValue(/^SYNTHETIC_[A-Z0-9_:-]{4,}$/.test(reason || ''), 'SUPERSESSION_REASON_REQUIRED', 'Supersession requires a synthetic reason');
    if (successorReviewReference) requireValue(/^wreview_[A-Za-z0-9_-]{16,}$/.test(successorReviewReference), 'INVALID_SUCCESSOR_REVIEW_REFERENCE', 'Successor review reference must be opaque');
    let record = this.readRecord(actor, reviewId);
    this.requirePrivateRead(actor, record);
    this.requireVersion(record, expectedVersion);
    this.assertTransition(record.state, 'REVIEW_WITHDRAWN_OR_SUPERSEDED');
    record = this.privateRecords.update({
      actor: this.recordActor(actor), commandId, recordId: record.recordId, expectedVersion, nextState: 'REVIEW_WITHDRAWN_OR_SUPERSEDED',
      patch: { supersession: { reason, successorReviewReference, supersededAt: this.clock(), supersededBy: actor.actorId }, customerEffect: false, warrantyFindingIssued: false },
      eventType: 'WARRANTY_REVIEW_WITHDRAWN_OR_SUPERSEDED', eventDetails: { reason, successorReviewReference },
    });
    return this.privateView(record);
  }

  issueOperationalDecision() {
    throw new ActivationError('OPERATIONAL_WARRANTY_DECISION_BLOCKED', 'B04 cannot issue an operational or customer warranty determination', {
      customerDecisionIssued: false,
      customerNotificationAuthorized: false,
      blockers: this.activationGate.snapshot().blockers,
    });
  }

  notifyCustomerDecision() {
    throw new ActivationError('CUSTOMER_WARRANTY_NOTIFICATION_BLOCKED', 'B04 cannot notify a customer of a warranty determination', {
      customerNotificationSent: false,
      blockers: this.activationGate.snapshot().blockers,
    });
  }

  issuanceGateSnapshot() {
    return deepFreeze({
      internalReviewEvidenceAllowed: true,
      syntheticAssessmentAllowed: true,
      operationalDecisionAllowed: false,
      customerNotificationAllowed: false,
      testModeMayBypass: false,
      blockers: [...this.activationGate.snapshot().blockers],
    });
  }

  validatePacket(packet) {
    const allowed = ['decisionType', 'requestedReviewerIdentityReference', 'authorityRole', 'authorityScope', 'machineIdentity', 'policyEvidence', 'coverageEvidence', 'ownershipEvidenceRefs', 'purchaseEvidenceRefs', 'supportingEvidenceRefs', 'obligationEvidence', 'explicitReferral'];
    requireValue(packet && Object.keys(packet).every((key) => allowed.includes(key)), 'UNSUPPORTED_WARRANTY_REVIEW_INPUT', 'Warranty review packet contains unsupported or excessive data');
    requireValue(REVIEW_DECISION_TYPES.includes(packet.decisionType), 'UNKNOWN_WARRANTY_REVIEW_DECISION_TYPE', 'Unknown warranty review decision types fail closed');
    requireValue(/^auth_syn_[A-Za-z0-9_-]{12,}$/.test(packet.requestedReviewerIdentityReference || ''), 'OPAQUE_REVIEWER_REFERENCE_REQUIRED', 'A synthetic opaque reviewer reference is required');
    requireValue(packet.authorityRole === 'HUMAN_WARRANTY_REVIEWER', 'WARRANTY_REVIEWER_ROLE_REQUIRED', 'The assessment role must be a human warranty reviewer');
    requireValue(/^SYNTHETIC_[A-Z0-9_:-]{4,}$/.test(packet.authorityScope || ''), 'WARRANTY_AUTHORITY_SCOPE_REQUIRED', 'An explicit synthetic authority scope is required');
    requireValue(packet.machineIdentity, 'MACHINE_IDENTITY_REQUIRED', 'Exact Product and Variant identity is required');
    this.catalog.assertRelationship(packet.machineIdentity.productGid, packet.machineIdentity.variantGid);
    this.validateEvidenceRefs(packet.ownershipEvidenceRefs || []);
    this.validateEvidenceRefs(packet.purchaseEvidenceRefs || []);
    this.validateEvidenceRefs(packet.supportingEvidenceRefs || []);
    this.validatePolicyEvidence(packet.policyEvidence || {});
    this.validateCoverageEvidence(packet.coverageEvidence || {}, packet.machineIdentity);
    this.validateObligationEvidence(packet.obligationEvidence || {});
    const minimizedText = [
      ...(packet.ownershipEvidenceRefs || []), ...(packet.purchaseEvidenceRefs || []), ...(packet.supportingEvidenceRefs || []),
      ...(packet.policyEvidence?.applicabilityEvidenceRefs || []), ...(packet.policyEvidence?.customerCopyApprovalEvidenceRefs || []),
      ...(packet.policyEvidence?.legalApprovalEvidenceRefs || []), ...(packet.policyEvidence?.provenanceEvidenceRefs || []),
      ...(packet.coverageEvidence?.businessApprovalEvidenceRefs || []), ...(packet.coverageEvidence?.legalApprovalEvidenceRefs || []),
      ...(packet.coverageEvidence?.manufacturingSourceEvidenceRefs || []), ...(packet.coverageEvidence?.manufacturerObligationEvidenceRefs || []),
      ...(packet.obligationEvidence?.evidenceRefs || []), packet.explicitReferral?.reason || '', packet.explicitReferral?.evidenceReference || '',
    ].join(' ');
    requireValue(!/@|\d{3}[-.) ]?\d{3}[-. ]?\d{4}/.test(minimizedText), 'REAL_CUSTOMER_DATA_FORBIDDEN', 'Real customer contact data is forbidden in B04');
  }

  validatePolicyEvidence(policy) {
    const allowed = ['policyId', 'policyVersion', 'effectiveFrom', 'effectiveTo', 'applicabilityEventAt', 'applicabilityEvidenceRefs', 'customerCopyApproved', 'customerCopyApprovalEvidenceRefs', 'legalLanguageApproved', 'legalApprovalEvidenceRefs', 'provenanceResolved', 'provenanceEvidenceRefs', 'historicalPolicy', 'syntheticFixture'];
    requireValue(Object.keys(policy).every((key) => allowed.includes(key)), 'UNSUPPORTED_POLICY_EVIDENCE', 'Policy evidence contains unsupported fields');
    if (policy.syntheticFixture) requireValue(this.testMode, 'SYNTHETIC_POLICY_FIXTURE_FORBIDDEN', 'Synthetic policy evidence requires test mode');
    for (const key of ['applicabilityEvidenceRefs', 'customerCopyApprovalEvidenceRefs', 'legalApprovalEvidenceRefs', 'provenanceEvidenceRefs']) this.validateEvidenceRefs(policy[key] || []);
  }

  validateCoverageEvidence(coverage, machineIdentity) {
    const allowed = ['productGid', 'variantGid', 'coverageDisposition', 'classificationApproved', 'businessApproved', 'legalApproved', 'businessApprovalEvidenceRefs', 'legalApprovalEvidenceRefs', 'manufacturingSourceStatus', 'manufacturingSourceEvidenceRefs', 'manufacturerObligationStatus', 'manufacturerObligationEvidenceRefs', 'authorityBasisSignals', 'observedTechnicalClass', 'observedPublicationStatus', 'syntheticFixture'];
    requireValue(Object.keys(coverage).every((key) => allowed.includes(key)), 'UNSUPPORTED_COVERAGE_EVIDENCE', 'Coverage evidence contains unsupported fields');
    if (coverage.productGid || coverage.variantGid) {
      this.catalog.assertRelationship(coverage.productGid, coverage.variantGid);
      requireValue(coverage.productGid === machineIdentity.productGid && coverage.variantGid === machineIdentity.variantGid, 'COVERAGE_MACHINE_IDENTITY_MISMATCH', 'Coverage evidence must match the exact review Product and Variant');
    }
    if (coverage.syntheticFixture) requireValue(this.testMode, 'SYNTHETIC_COVERAGE_FIXTURE_FORBIDDEN', 'Synthetic coverage evidence requires test mode');
    const prohibited = new Set(this.contract.prohibitedCoverageAuthoritySignals);
    requireValue((coverage.authorityBasisSignals || []).every((signal) => !prohibited.has(signal)), 'PROHIBITED_COVERAGE_AUTHORITY_SIGNAL', 'Shopify or technical signals cannot authorize coverage');
    for (const key of ['businessApprovalEvidenceRefs', 'legalApprovalEvidenceRefs', 'manufacturingSourceEvidenceRefs', 'manufacturerObligationEvidenceRefs']) this.validateEvidenceRefs(coverage[key] || []);
  }

  validateObligationEvidence(obligations) {
    const allowed = ['manufacturerObligationsDistinct', 'rhinoVoluntaryObligationsDistinct', 'legallyRequiredProtectionsDistinct', 'evidenceRefs'];
    requireValue(Object.keys(obligations).every((key) => allowed.includes(key)), 'UNSUPPORTED_OBLIGATION_EVIDENCE', 'Obligation evidence contains unsupported fields');
    this.validateEvidenceRefs(obligations.evidenceRefs || []);
  }

  validateAssessment(assessment) {
    const allowed = ['assessmentType', 'conclusion', 'reasoningCode', 'supportingEvidenceRefs'];
    requireValue(assessment && Object.keys(assessment).every((key) => allowed.includes(key)), 'UNSUPPORTED_SYNTHETIC_ASSESSMENT_FIELD', 'Synthetic assessments cannot include remedies, customer copy, or operational decision fields');
    requireValue(assessment && this.contract.assessmentTypes.includes(assessment.assessmentType), 'UNKNOWN_SYNTHETIC_ASSESSMENT_TYPE', 'Unknown assessment types fail closed');
    requireValue(this.contract.syntheticConclusions.includes(assessment.conclusion), 'UNKNOWN_SYNTHETIC_CONCLUSION', 'Unknown synthetic conclusions fail closed');
    const expected = {
      SYNTHETIC_SUPPORTABILITY_ASSESSMENT: 'SUPPORTABLE_IN_ISOLATED_TEST_CONTEXT',
      SYNTHETIC_NON_SUPPORTABILITY_ASSESSMENT: 'NOT_SUPPORTABLE_IN_ISOLATED_TEST_CONTEXT',
      SYNTHETIC_FURTHER_EVIDENCE_ASSESSMENT: 'FURTHER_EVIDENCE_REQUIRED',
    };
    requireValue(expected[assessment.assessmentType] === assessment.conclusion, 'ASSESSMENT_CONCLUSION_MISMATCH', 'Synthetic assessment type and conclusion do not match');
    requireValue(/^SYNTHETIC_[A-Z0-9_:-]{4,}$/.test(assessment.reasoningCode || ''), 'SYNTHETIC_REASONING_REQUIRED', 'Synthetic reasoning code is required');
    requireValue(this.validEvidenceRefs(assessment.supportingEvidenceRefs), 'ASSESSMENT_EVIDENCE_REQUIRED', 'Synthetic assessment requires supporting evidence');
  }

  evaluateReadiness({ packet, supportCase, authorityResolution }) {
    const missingEvidence = [];
    if (supportCase.state === 'SAFETY_HOLD' || supportCase.data.safetyHoldActive) missingEvidence.push('ACTIVE_SAFETY_HOLD');
    if (supportCase.data.unresolvedNotificationIds?.length) missingEvidence.push('UNRESOLVED_SUPPORT_NOTIFICATION');
    if (!packet.supportingEvidenceRefs?.length) missingEvidence.push('SUPPORTING_EVIDENCE_REQUIRED');
    const policyMissing = this.policyMissing(packet.policyEvidence || {});
    const coverageMissing = this.coverageMissing(packet.coverageEvidence || {}, packet.machineIdentity);
    const obligationMissing = this.obligationMissing(packet.obligationEvidence || {});
    missingEvidence.push(...policyMissing, ...coverageMissing, ...obligationMissing);
    if (supportCase.state === 'SAFETY_HOLD' || supportCase.data.safetyHoldActive || supportCase.data.unresolvedNotificationIds?.length) return { state: 'REVIEW_BLOCKED', missingEvidence: [...new Set(missingEvidence)] };
    if (!packet.supportingEvidenceRefs?.length) return { state: 'EVIDENCE_INCOMPLETE', missingEvidence: [...new Set(missingEvidence)] };
    if (policyMissing.length) return { state: 'POLICY_APPLICABILITY_UNRESOLVED', missingEvidence: [...new Set(missingEvidence)] };
    if (coverageMissing.length || obligationMissing.length) return { state: 'COVERAGE_UNRESOLVED', missingEvidence: [...new Set(missingEvidence)] };
    if (authorityResolution.status !== 'VERIFIED_SYNTHETIC') {
      missingEvidence.push(`REVIEWER_AUTHORITY_${authorityResolution.status}`);
      return { state: 'AUTHORITY_UNRESOLVED', missingEvidence: [...new Set(missingEvidence)] };
    }
    return { state: 'READY_FOR_HUMAN_REVIEW', missingEvidence: [] };
  }

  policyMissing(policy) {
    const missing = [];
    if (!policy.policyId || !policy.policyVersion) missing.push('POLICY_IDENTITY_OR_VERSION_MISSING');
    if (policy.historicalPolicy || /^HISTORICAL/.test(policy.policyId || '')) missing.push('HISTORICAL_POLICY_NOT_POLICY2_AUTHORITY');
    if (!policy.effectiveFrom || !policy.effectiveTo) missing.push('POLICY_EFFECTIVE_PERIOD_NOT_APPROVED');
    if (!policy.applicabilityEventAt || !policy.applicabilityEvidenceRefs?.length) missing.push('POLICY_APPLICABILITY_EVIDENCE_MISSING');
    if (policy.effectiveFrom && policy.effectiveTo && policy.applicabilityEventAt && (policy.applicabilityEventAt < policy.effectiveFrom || policy.applicabilityEventAt > policy.effectiveTo)) missing.push('POLICY_NOT_APPLICABLE_TO_EVENT');
    if (!policy.customerCopyApproved || !policy.customerCopyApprovalEvidenceRefs?.length) missing.push('CUSTOMER_POLICY_COPY_NOT_APPROVED');
    if (!policy.legalLanguageApproved || !policy.legalApprovalEvidenceRefs?.length) missing.push('POLICY_LEGAL_APPROVAL_MISSING');
    if (!policy.provenanceResolved || !policy.provenanceEvidenceRefs?.length) missing.push('POLICY_PROVENANCE_UNRESOLVED');
    return missing;
  }

  coverageMissing(coverage, machineIdentity) {
    const missing = [];
    if (!coverage.productGid || !coverage.variantGid) missing.push('EXACT_COVERAGE_IDENTITY_MISSING');
    if (coverage.productGid && (coverage.productGid !== machineIdentity.productGid || coverage.variantGid !== machineIdentity.variantGid)) missing.push('COVERAGE_IDENTITY_MISMATCH');
    if (!coverage.classificationApproved || !coverage.coverageDisposition) missing.push('COVERAGE_CLASSIFICATION_UNAPPROVED');
    if (!coverage.businessApproved || !coverage.businessApprovalEvidenceRefs?.length) missing.push('COVERAGE_BUSINESS_APPROVAL_MISSING');
    if (!coverage.legalApproved || !coverage.legalApprovalEvidenceRefs?.length) missing.push('COVERAGE_LEGAL_APPROVAL_MISSING');
    if (!['VERIFIED', 'UNRESOLVED'].includes(coverage.manufacturingSourceStatus)) missing.push('MANUFACTURING_SOURCE_STATUS_MISSING');
    if (coverage.manufacturingSourceStatus !== 'VERIFIED' || !coverage.manufacturingSourceEvidenceRefs?.length) missing.push('MANUFACTURING_SOURCE_UNRESOLVED');
    if (!['EVIDENCED', 'NOT_APPLICABLE_EVIDENCED'].includes(coverage.manufacturerObligationStatus) || !coverage.manufacturerObligationEvidenceRefs?.length) missing.push('MANUFACTURER_OBLIGATION_EVIDENCE_MISSING');
    return missing;
  }

  obligationMissing(obligations) {
    const missing = [];
    if (obligations.manufacturerObligationsDistinct !== true) missing.push('MANUFACTURER_OBLIGATION_BOUNDARY_UNRESOLVED');
    if (obligations.rhinoVoluntaryObligationsDistinct !== true) missing.push('RHINO_VOLUNTARY_OBLIGATION_BOUNDARY_UNRESOLVED');
    if (obligations.legallyRequiredProtectionsDistinct !== true) missing.push('LEGAL_PROTECTION_BOUNDARY_UNRESOLVED');
    if (!obligations.evidenceRefs?.length) missing.push('OBLIGATION_BOUNDARY_EVIDENCE_MISSING');
    return missing;
  }

  validateSupportRelationship(intake, packet) {
    if (intake.category !== 'WARRANTY_DECISION') {
      requireValue(packet.explicitReferral?.requested === true && /^synthetic:/.test(packet.explicitReferral.evidenceReference || ''), 'EXPLICIT_WARRANTY_REVIEW_REFERRAL_REQUIRED', 'Non-warranty support categories require an explicit review referral');
    }
    if (intake.machineIdentity) {
      requireValue(intake.machineIdentity.productGid === packet.machineIdentity.productGid && intake.machineIdentity.variantGid === packet.machineIdentity.variantGid, 'SUPPORT_CASE_MACHINE_IDENTITY_MISMATCH', 'Review machine identity must match the support case');
    }
  }

  assertSafetyAllowsReview(supportCase) {
    requireValue(supportCase.state !== 'SAFETY_HOLD' && !supportCase.data.safetyHoldActive, 'ACTIVE_SAFETY_HOLD', 'Warranty review cannot bypass an active safety hold');
    requireValue((supportCase.data.unresolvedNotificationIds || []).length === 0, 'UNRESOLVED_SAFETY_NOTIFICATION', 'Unresolved warning delivery blocks warranty review');
  }

  assertTransition(fromState, toState) {
    if (fromState === toState) return;
    requireValue(this.contract.reviewStates.includes(fromState) && this.contract.reviewStates.includes(toState), 'UNKNOWN_WARRANTY_REVIEW_STATE', 'Unknown review states fail closed');
    const allowed = this.contract.transitions.some(([from, to]) => from === fromState && to === toState);
    if (!allowed) throw new TransitionError('UNAUTHORIZED_WARRANTY_REVIEW_TRANSITION', 'Warranty review transition is not authorized', { fromState, toState });
  }

  packetFromData(data) {
    return {
      decisionType: data.decisionType,
      requestedReviewerIdentityReference: data.requestedReviewerIdentityReference,
      authorityRole: data.authorityRole,
      authorityScope: data.authorityScope,
      machineIdentity: clone(data.machineIdentity),
      policyEvidence: clone(data.policyEvidence),
      coverageEvidence: clone(data.coverageEvidence),
      ownershipEvidenceRefs: [...data.ownershipEvidenceRefs],
      purchaseEvidenceRefs: [...data.purchaseEvidenceRefs],
      supportingEvidenceRefs: [...data.supportingEvidenceRefs],
      obligationEvidence: clone(data.obligationEvidence),
      explicitReferral: clone(data.explicitReferral),
    };
  }

  supportFacts(record) { return record.data.syntheticFacts.supportIntake; }

  safetySnapshot(record) {
    return {
      supportState: record.state,
      safetyHoldActive: record.data.safetyHoldActive === true,
      unresolvedNotificationCount: (record.data.unresolvedNotificationIds || []).length,
      warningDeliveryStatus: record.data.safetyInterruption?.stopUseWarning?.deliveryStatus || null,
      mayResumeEquipment: false,
    };
  }

  registrationContextSummary(context) {
    return {
      status: context?.status || 'NOT_PROVIDED',
      registrationCompletedConfersEligibility: false,
      ownershipVerificationConfersCoverage: false,
    };
  }

  allEvidenceRefs(data) {
    return [
      ...(data.ownershipEvidenceRefs || []), ...(data.purchaseEvidenceRefs || []), ...(data.supportingEvidenceRefs || []),
      ...(data.policyEvidence?.applicabilityEvidenceRefs || []), ...(data.policyEvidence?.customerCopyApprovalEvidenceRefs || []),
      ...(data.policyEvidence?.legalApprovalEvidenceRefs || []), ...(data.policyEvidence?.provenanceEvidenceRefs || []),
      ...(data.coverageEvidence?.businessApprovalEvidenceRefs || []), ...(data.coverageEvidence?.legalApprovalEvidenceRefs || []),
      ...(data.coverageEvidence?.manufacturingSourceEvidenceRefs || []), ...(data.coverageEvidence?.manufacturerObligationEvidenceRefs || []),
      ...(data.obligationEvidence?.evidenceRefs || []),
    ];
  }

  privateView(record) { return clone(record); }

  readRecord(actor, reviewId) {
    const recordId = this.recordIdsByReview.get(reviewId);
    requireValue(recordId, 'WARRANTY_REVIEW_NOT_FOUND', 'Warranty review was not found');
    return this.privateRecords.read({ actor: this.recordActor(actor), recordId });
  }

  requirePrivateRead(actor, record) {
    if (!actor || !this.authorize(actor, 'WARRANTY_REVIEW_PRIVATE_READ', record)) throw new AuthorizationError('WARRANTY_REVIEW_ACCESS_DENIED', 'Warranty review access is not authorized');
    if (actor.customerReference && actor.customerReference !== record.data.customerReference) throw new AuthorizationError('WARRANTY_REVIEW_ACCESS_DENIED', 'Cross-customer warranty review access is forbidden');
  }

  requireVersion(record, expectedVersion) {
    if (record.version !== expectedVersion) throw new ConflictError('RECORD_VERSION_CONFLICT', 'Expected warranty review version does not match', { expectedVersion, actualVersion: record.version });
  }

  recordActor(actor) {
    return { actorId: actor?.actorId || this.systemActor.actorId, permissions: [...this.systemActor.permissions] };
  }

  validateEvidenceRefs(refs) {
    requireValue(Array.isArray(refs) && refs.every((reference) => /^synthetic:[A-Za-z0-9_:/.-]+$/.test(reference)), 'SYNTHETIC_EVIDENCE_REFERENCE_REQUIRED', 'Only synthetic evidence references are accepted in B04');
  }

  validEvidenceRefs(refs) {
    return Array.isArray(refs) && refs.length > 0 && refs.every((reference) => /^synthetic:[A-Za-z0-9_:/.-]+$/.test(reference));
  }
}

module.exports = {
  REVIEW_DECISION_TYPES,
  SyntheticWarrantyAuthorityResolver,
  UnresolvedWarrantyAuthorityResolver,
  WarrantyReviewService,
};
