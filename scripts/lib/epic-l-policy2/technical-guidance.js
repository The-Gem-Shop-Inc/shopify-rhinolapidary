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
const { InMemoryOrchestrationLedger } = require('./registration');

const GUIDANCE_STATES = Object.freeze([
  'REQUESTED',
  'MACHINE_IDENTIFICATION_REQUIRED',
  'SAFETY_REVIEW_REQUIRED',
  'RESOURCE_REVIEW_REQUIRED',
  'AWAITING_HUMAN_SELECTION',
  'SYNTHETIC_GUIDANCE_RECORDED',
  'FOLLOW_UP_REQUIRED',
  'RECOVERY_REQUIRED',
  'WITHDRAWN_OR_SUPERSEDED',
]);

class GovernedCustomerResourceResolver {
  constructor(resourceGovernance) {
    requireValue(resourceGovernance, 'RESOURCE_GOVERNANCE_REQUIRED', 'The B01 resource governance component is required');
    this.resourceGovernance = resourceGovernance;
    this.synthetic = false;
  }

  resolveApplicable(machineIdentity, category = null) {
    return this.resourceGovernance.resolveApprovedCustomerRevision({
      productGid: machineIdentity.productGid,
      variantGid: machineIdentity.variantGid,
      machineVersion: machineIdentity.machineVersion,
      category,
    }).map((revision) => ({
      ...revision,
      approvalContext: 'APPROVED_CUSTOMER_RELEASE',
      syntheticFixture: false,
      customerReleaseAuthorized: true,
    }));
  }
}

class SyntheticGuidanceResourceResolver {
  constructor({ resourceGovernance, fixtureResourceIds = [] }) {
    requireValue(resourceGovernance, 'RESOURCE_GOVERNANCE_REQUIRED', 'Synthetic resource resolution must use the B01 resource governance component');
    requireValue(fixtureResourceIds.length > 0 && fixtureResourceIds.every((id) => /^synthetic:resource:/.test(id)), 'SYNTHETIC_RESOURCE_ID_REQUIRED', 'Synthetic fixture resources require unmistakable synthetic identities');
    this.resourceGovernance = resourceGovernance;
    this.fixtureResourceIds = [...fixtureResourceIds];
    this.synthetic = true;
  }

  resolveApplicable(machineIdentity, category = null) {
    const matches = [];
    for (const resourceId of this.fixtureResourceIds) {
      for (const revision of this.resourceGovernance.history(resourceId)) {
        if (revision.releaseStatus !== 'APPROVED_INTERNAL') continue;
        if (category && revision.category !== category) continue;
        if (!revision.applicability.productGids.includes(machineIdentity.productGid)) continue;
        if (!revision.applicability.variantGids.includes(machineIdentity.variantGid)) continue;
        if (!revision.applicability.machineVersions.includes(machineIdentity.machineVersion)) continue;
        requireValue(revision.technicalApproval?.synthetic === true, 'SYNTHETIC_KEVIN_APPROVAL_REQUIRED', 'Synthetic guidance fixtures require explicit synthetic Kevin approval evidence');
        matches.push({
          ...revision,
          approvalContext: 'SYNTHETIC_TEST_ONLY',
          syntheticFixture: true,
          customerReleaseAuthorized: false,
        });
      }
    }
    return matches;
  }
}

class UnresolvedTechnicalGuidanceAuthorityResolver {
  constructor() { this.synthetic = false; }

  inspect({ operatorReference, authorityScope }) {
    return {
      status: 'UNRESOLVED',
      operatorReference,
      authorityScope,
      authorizationEvidenceReference: null,
      syntheticAuthorityVerified: false,
      operationalAuthorityVerified: false,
    };
  }

  authorizeOperator(input) {
    throw new AuthorizationError('TECHNICAL_GUIDANCE_AUTHORITY_UNRESOLVED', 'Production technical guidance operator authority is unresolved', this.inspect(input));
  }
}

class SyntheticTechnicalGuidanceAuthorityResolver {
  constructor(grants = []) {
    this.synthetic = true;
    this.grants = grants.map((grant) => clone(grant));
  }

  inspect({ operatorReference, authorityScope, at }) {
    const grant = this.grants.find((candidate) => candidate.operatorReference === operatorReference);
    if (!grant) return this.unresolved('UNRESOLVED', operatorReference, authorityScope);
    if (!/^synthetic:/.test(grant.authorizationEvidenceReference || '')) return this.unresolved('AUTHORIZATION_EVIDENCE_MISSING', operatorReference, authorityScope);
    if (!grant.authorityScopes?.includes(authorityScope)) return this.unresolved('OUT_OF_SCOPE', operatorReference, authorityScope);
    if (at < grant.authorizedFrom || at > grant.authorizedTo) return this.unresolved('EXPIRED_OR_NOT_YET_VALID', operatorReference, authorityScope);
    return {
      status: 'VERIFIED_SYNTHETIC',
      operatorReference,
      actorId: grant.actorId,
      authorityScope,
      authorizationEvidenceReference: grant.authorizationEvidenceReference,
      authorizedFrom: grant.authorizedFrom,
      authorizedTo: grant.authorizedTo,
      syntheticAuthorityVerified: true,
      operationalAuthorityVerified: false,
    };
  }

  authorizeOperator({ actor, ...input }) {
    const inspected = this.inspect(input);
    const codes = {
      OUT_OF_SCOPE: 'TECHNICAL_GUIDANCE_AUTHORITY_OUT_OF_SCOPE',
      EXPIRED_OR_NOT_YET_VALID: 'TECHNICAL_GUIDANCE_AUTHORITY_EXPIRED',
      AUTHORIZATION_EVIDENCE_MISSING: 'TECHNICAL_GUIDANCE_AUTHORIZATION_EVIDENCE_MISSING',
    };
    requireValue(inspected.status === 'VERIFIED_SYNTHETIC', codes[inspected.status] || 'TECHNICAL_GUIDANCE_AUTHORITY_UNRESOLVED', 'Synthetic operator authority is not valid', inspected);
    if (!actor || actor.actorId !== inspected.actorId) throw new AuthorizationError('TECHNICAL_GUIDANCE_IDENTITY_SPOOFING_REJECTED', 'Authenticated actor does not match the synthetic operator grant');
    return inspected;
  }

  unresolved(status, operatorReference, authorityScope) {
    return {
      status,
      operatorReference,
      authorityScope,
      authorizationEvidenceReference: null,
      syntheticAuthorityVerified: false,
      operationalAuthorityVerified: false,
    };
  }
}

class TechnicalGuidanceService {
  constructor({
    privateRecords,
    supportIntake,
    safety,
    resources,
    activationGate,
    catalog,
    contract,
    authorize = () => false,
    systemActor,
    resourceResolver,
    authorityResolver = new UnresolvedTechnicalGuidanceAuthorityResolver(),
    clock = () => new Date().toISOString(),
    guidanceIdFactory = () => createOpaqueIdentifier(16, 'guide_'),
    selectionIdFactory = () => createOpaqueIdentifier(16, 'gsel_'),
    testMode = false,
    interruptionHook = null,
  }) {
    requireValue(privateRecords && supportIntake && safety && resources && activationGate && catalog && contract, 'TECHNICAL_GUIDANCE_DEPENDENCY_REQUIRED', 'B05 requires the B01-B04 domain ports and versioned contract');
    requireValue(systemActor, 'SYSTEM_ACTOR_REQUIRED', 'B05 requires the private system actor');
    requireValue(contract.contractId === 'EPIC-L-POLICY2-TECHNICAL-GUIDANCE', 'TECHNICAL_GUIDANCE_CONTRACT_REQUIRED', 'The versioned B05 contract is required');
    const resolver = resourceResolver || new GovernedCustomerResourceResolver(resources);
    if (resolver.synthetic || authorityResolver.synthetic || interruptionHook) requireValue(testMode, 'SYNTHETIC_GUIDANCE_COMPONENT_FORBIDDEN', 'Synthetic B05 components require explicit test mode');
    this.privateRecords = privateRecords;
    this.supportIntake = supportIntake;
    this.safety = safety;
    this.resources = resources;
    this.activationGate = activationGate;
    this.catalog = catalog;
    this.contract = clone(contract);
    this.authorize = authorize;
    this.systemActor = systemActor;
    this.resourceResolver = resolver;
    this.authorityResolver = authorityResolver;
    this.clock = clock;
    this.guidanceIdFactory = guidanceIdFactory;
    this.selectionIdFactory = selectionIdFactory;
    this.testMode = testMode;
    this.interruptionHook = interruptionHook;
    this.commandLedger = new InMemoryOrchestrationLedger();
    this.guidanceIdsByCommand = new Map();
    this.requestedTimesByCommand = new Map();
    this.recordIdsByGuidance = new Map();
  }

  requestGuidance({ actor, commandId, caseReference, request }) {
    requireAuthorization(this.authorize, actor, 'TECHNICAL_GUIDANCE_REQUEST', { caseReference });
    this.validateRequest(request);
    const guidanceId = this.guidanceIdsByCommand.get(commandId) || this.guidanceIdFactory();
    const requestedAt = this.requestedTimesByCommand.get(commandId) || this.clock();
    this.guidanceIdsByCommand.set(commandId, guidanceId);
    this.requestedTimesByCommand.set(commandId, requestedAt);
    return this.commandLedger.execute(commandId, { operation: 'requestTechnicalGuidance', caseReference, request }, () => {
      const supportCase = this.supportIntake.getPrivateCase({ actor, caseReference });
      const intake = this.supportFacts(supportCase);
      this.validateSupportRelationship(intake, request);
      const machineIdentity = this.resolveMachineIdentity(intake, request.machineIdentity);
      const safety = this.safetySnapshot(supportCase, intake);
      let candidates = [];
      let state = 'MACHINE_IDENTIFICATION_REQUIRED';
      const obligations = [];
      if (safety.blocked) {
        state = 'SAFETY_REVIEW_REQUIRED';
        obligations.push(...safety.obligations);
      } else if (machineIdentity) {
        this.catalog.assertRelationship(machineIdentity.productGid, machineIdentity.variantGid);
        candidates = this.resourceResolver.resolveApplicable(machineIdentity, request.category || null);
        if (candidates.length === 0) {
          state = 'RESOURCE_REVIEW_REQUIRED';
          obligations.push('APPROVED_APPLICABLE_RESOURCE_REQUIRED');
        } else {
          state = 'AWAITING_HUMAN_SELECTION';
        }
      } else {
        obligations.push('EXACT_MACHINE_IDENTITY_REQUIRED');
      }
      const data = {
        guidanceId,
        caseReference,
        caseRecordId: supportCase.recordId,
        customerReference: intake.customerReference,
        supportCategory: intake.category,
        explicitReferral: clone(request.explicitReferral || null),
        requestedAt,
        requestedBy: actor.actorId,
        operatorReference: request.operatorReference,
        authorityScope: request.authorityScope,
        machineIdentity,
        registrationContext: this.registrationSummary(intake.registrationContext),
        relatedWarrantyReviewReference: request.relatedWarrantyReviewReference || null,
        warrantyReviewAuthorityEffect: false,
        safetyAssessment: safety,
        resourceCategory: request.category || null,
        resourceCandidates: candidates.map((candidate) => this.candidateReference(candidate)),
        selections: [],
        revisionRequests: [],
        reconsiderations: [],
        recoveryObligations: [...new Set(obligations)],
        guidanceStateHistory: [
          { fromState: null, toState: 'REQUESTED', occurredAt: requestedAt, event: 'GUIDANCE_REQUESTED' },
          { fromState: 'REQUESTED', toState: state, occurredAt: this.clock(), event: 'GUIDANCE_READINESS_CLASSIFIED' },
        ],
        diagnosticFinding: 'NOT_PERFORMED',
        repairInstructionsGenerated: false,
        warrantyFinding: 'NOT_PERFORMED',
        customerGuidanceDelivered: false,
        customerNotificationSent: false,
        customerReleaseAuthorized: false,
        supportCaseClosed: false,
        machineOperationAuthorized: false,
      };
      const created = this.privateRecords.create({
        actor: this.recordActor(actor), commandId: `${commandId}:create`, category: 'RESOURCE_DELIVERY', state: 'REQUESTED', data,
      });
      this.recordIdsByGuidance.set(guidanceId, created.recordId);
      this.assertTransition('REQUESTED', state);
      const classified = this.privateRecords.update({
        actor: this.recordActor(actor), commandId: `${commandId}:classify`, recordId: created.recordId, expectedVersion: created.version, nextState: state,
        patch: {}, eventType: 'TECHNICAL_GUIDANCE_READINESS_CLASSIFIED', eventDetails: { state, resourceCandidateCount: candidates.length },
      });
      return this.privateView(classified);
    });
  }

  getPrivateGuidance({ actor, guidanceId }) {
    const record = this.readRecord(actor, guidanceId);
    this.requirePrivateRead(actor, record);
    return this.privateView(record);
  }

  getPublicHandle(guidanceId) {
    const record = this.readRecord(this.systemActor, guidanceId);
    return deepFreeze({
      guidanceReference: guidanceId,
      processingStatus: record.state === 'WITHDRAWN_OR_SUPERSEDED' ? 'WITHDRAWN' : 'INTERNAL_REVIEW',
      customerGuidanceDelivered: false,
      customerActivationPermitted: false,
    });
  }

  auditTrail({ actor, guidanceId }) {
    const record = this.readRecord(actor, guidanceId);
    this.requirePrivateRead(actor, record);
    return this.privateRecords.auditTrail({ actor: this.recordActor(actor), recordId: record.recordId });
  }

  recordSyntheticGuidance({ actor, commandId, guidanceId, expectedVersion, selection }) {
    requireAuthorization(this.authorize, actor, 'TECHNICAL_GUIDANCE_SELECT', { guidanceId });
    this.validateSelection(selection);
    return this.commandLedger.execute(commandId, { operation: 'recordSyntheticGuidance', guidanceId, expectedVersion, selection }, () => {
    let record = this.readRecord(actor, guidanceId);
    this.requirePrivateRead(actor, record);
    this.requireVersion(record, expectedVersion);
    requireValue(record.state === 'AWAITING_HUMAN_SELECTION', 'GUIDANCE_NOT_AWAITING_SELECTION', 'Guidance is not ready for human resource selection');
    const supportCase = this.supportIntake.getPrivateCase({ actor, caseReference: record.data.caseReference });
    this.assertSafetyAllowsGuidance(supportCase, this.supportFacts(supportCase));
    const authority = this.authorityResolver.authorizeOperator({
      actor,
      operatorReference: record.data.operatorReference,
      authorityScope: record.data.authorityScope,
      at: this.clock(),
    });
    const candidate = record.data.resourceCandidates.find((item) => item.resourceId === selection.resourceId && item.revisionId === selection.revisionId);
    requireValue(candidate, 'RESOURCE_REVISION_NOT_APPLICABLE', 'Selected resource revision is not an exact applicable candidate');
    requireValue(candidate.technicalApproval?.synthetic === true && candidate.approvalContext === 'SYNTHETIC_TEST_ONLY', 'SYNTHETIC_KEVIN_APPROVAL_REQUIRED', 'B05 selection requires governed synthetic Kevin approval evidence');
    requireValue(candidate.releaseStatus === 'APPROVED_INTERNAL', 'UNAPPROVED_RESOURCE_SELECTION', 'Unapproved resource revisions cannot be selected');
    requireValue(candidate.customerReleaseAuthorized === false, 'CUSTOMER_RELEASE_FIXTURE_FORBIDDEN', 'Synthetic selection cannot authorize customer release');
    const recorded = {
      selectionId: this.selectionIdFactory(),
      resourceId: candidate.resourceId,
      revisionId: candidate.revisionId,
      category: candidate.category,
      sourceIdentity: candidate.sourceIdentity,
      selectedAt: this.clock(),
      selectedBy: actor.actorId,
      operatorReference: authority.operatorReference,
      operatorAuthorizationEvidenceReference: authority.authorizationEvidenceReference,
      technicalApprovalEvidence: clone(candidate.technicalApproval),
      approvalContext: 'SYNTHETIC_TEST_ONLY',
      presentationEvidenceReference: selection.presentationEvidenceReference,
      contentReturned: false,
      contentRewritten: false,
      diagnosticAdviceGenerated: false,
      repairInstructionsGenerated: false,
      customerDelivered: false,
      customerReleaseAuthorized: false,
      machineOperationAuthorized: false,
    };
    this.assertTransition(record.state, 'SYNTHETIC_GUIDANCE_RECORDED');
    record = this.privateRecords.update({
      actor: this.recordActor(actor), commandId, recordId: record.recordId, expectedVersion, nextState: 'SYNTHETIC_GUIDANCE_RECORDED',
      patch: {
        selections: [...record.data.selections, recorded],
        recoveryObligations: [],
        guidanceStateHistory: [...record.data.guidanceStateHistory, { fromState: record.state, toState: 'SYNTHETIC_GUIDANCE_RECORDED', occurredAt: this.clock(), event: 'SYNTHETIC_RESOURCE_REFERENCE_RECORDED' }],
      },
      eventType: 'SYNTHETIC_TECHNICAL_GUIDANCE_RECORDED', eventDetails: { selectionId: recorded.selectionId, resourceId: recorded.resourceId, revisionId: recorded.revisionId },
    });
    return this.privateView(record);
    });
  }

  requestResourceRevision({ actor, commandId, guidanceId, expectedVersion, reason, evidenceRefs }) {
    requireAuthorization(this.authorize, actor, 'TECHNICAL_RESOURCE_REVISION_REQUEST', { guidanceId });
    requireValue(/^SYNTHETIC_[A-Z0-9_:-]{4,}$/.test(reason || '') && this.validEvidenceRefs(evidenceRefs), 'RESOURCE_REVISION_REQUEST_EVIDENCE_REQUIRED', 'Revision requests require a synthetic reason and evidence');
    let record = this.readRecord(actor, guidanceId);
    this.requirePrivateRead(actor, record);
    this.requireVersion(record, expectedVersion);
    const latest = record.data.selections.at(-1) || null;
    const request = {
      requestedAt: this.clock(), requestedBy: actor.actorId, reason, evidenceRefs: [...evidenceRefs],
      resourceId: latest?.resourceId || null, revisionId: latest?.revisionId || null,
      technicalApprovalGranted: false, resourceMutated: false, customerPublicationAuthorized: false,
    };
    const nextState = 'FOLLOW_UP_REQUIRED';
    this.assertTransition(record.state, nextState);
    record = this.privateRecords.update({
      actor: this.recordActor(actor), commandId, recordId: record.recordId, expectedVersion, nextState,
      patch: {
        revisionRequests: [...record.data.revisionRequests, request],
        recoveryObligations: [...new Set([...record.data.recoveryObligations, 'TECHNICAL_REVISION_REVIEW_REQUIRED'])],
        guidanceStateHistory: [...record.data.guidanceStateHistory, { fromState: record.state, toState: nextState, occurredAt: this.clock(), event: 'RESOURCE_REVISION_REQUESTED' }],
      },
      eventType: 'TECHNICAL_RESOURCE_REVISION_REQUESTED', eventDetails: { reason },
    });
    return this.privateView(record);
  }

  reconsiderForSupersession({ actor, commandId, guidanceId, expectedVersion, reason, evidenceRefs }) {
    requireAuthorization(this.authorize, actor, 'TECHNICAL_GUIDANCE_RECONSIDER', { guidanceId });
    requireValue(/^SYNTHETIC_[A-Z0-9_:-]{4,}$/.test(reason || '') && this.validEvidenceRefs(evidenceRefs), 'GUIDANCE_RECONSIDERATION_EVIDENCE_REQUIRED', 'Reconsideration requires a synthetic reason and evidence');
    let record = this.readRecord(actor, guidanceId);
    this.requirePrivateRead(actor, record);
    this.requireVersion(record, expectedVersion);
    requireValue(record.data.selections.length > 0, 'GUIDANCE_SELECTION_REQUIRED', 'Reconsideration requires a preserved prior selection');
    this.assertTransition(record.state, 'RESOURCE_REVIEW_REQUIRED');
    const priorSelectionId = record.data.selections.at(-1).selectionId;
    record = this.privateRecords.update({
      actor: this.recordActor(actor), commandId, recordId: record.recordId, expectedVersion, nextState: 'RESOURCE_REVIEW_REQUIRED',
      patch: {
        reconsiderations: [...record.data.reconsiderations, { requestedAt: this.clock(), requestedBy: actor.actorId, reason, evidenceRefs: [...evidenceRefs], priorSelectionId }],
        resourceCandidates: [],
        recoveryObligations: [...new Set([...record.data.recoveryObligations, 'REPLACEMENT_RESOURCE_REVIEW_REQUIRED'])],
        guidanceStateHistory: [...record.data.guidanceStateHistory, { fromState: record.state, toState: 'RESOURCE_REVIEW_REQUIRED', occurredAt: this.clock(), event: 'RESOURCE_SELECTION_RECONSIDERATION_REQUESTED' }],
      },
      eventType: 'TECHNICAL_GUIDANCE_RECONSIDERATION_REQUESTED', eventDetails: { reason, priorSelectionId },
    });
    return this.privateView(record);
  }

  reportHazard({ actor, commandId, guidanceId, expectedVersion, hazard }) {
    requireAuthorization(this.authorize, actor, 'TECHNICAL_GUIDANCE_REPORT_HAZARD', { guidanceId });
    return this.commandLedger.execute(commandId, { operation: 'reportGuidanceHazard', guidanceId, expectedVersion, hazard }, () => {
      let guidance = this.readRecord(actor, guidanceId);
      this.requirePrivateRead(actor, guidance);
      this.requireVersion(guidance, expectedVersion);
      let supportCase = this.supportIntake.getPrivateCase({ actor, caseReference: guidance.data.caseReference });
      if (supportCase.state !== 'SAFETY_HOLD' && !supportCase.data.safetyHoldActive) {
        const interrupted = this.safety.interruptForHazard({
          actor: this.recordActor(actor), commandId: `${commandId}:safety`, caseRecordId: supportCase.recordId, expectedVersion: supportCase.version, hazard,
        });
        supportCase = interrupted.caseRecord;
      }
      this.interrupt('AFTER_GUIDANCE_SAFETY_INTERRUPTION', { guidanceId, supportState: supportCase.state });
      this.assertTransition(guidance.state, 'SAFETY_REVIEW_REQUIRED');
      const obligations = [...new Set([...guidance.data.recoveryObligations, 'ACTIVE_SAFETY_HOLD', ...(supportCase.data.unresolvedNotificationIds?.length ? ['STOP_USE_WARNING_DELIVERY_UNRESOLVED'] : [])])];
      guidance = this.privateRecords.update({
        actor: this.recordActor(actor), commandId: `${commandId}:guidance`, recordId: guidance.recordId, expectedVersion: guidance.version, nextState: 'SAFETY_REVIEW_REQUIRED',
        patch: {
          safetyAssessment: this.safetySnapshot(supportCase, this.supportFacts(supportCase)),
          recoveryObligations: obligations,
          guidanceStateHistory: [...guidance.data.guidanceStateHistory, { fromState: guidance.state, toState: 'SAFETY_REVIEW_REQUIRED', occurredAt: this.clock(), event: 'GUIDANCE_INTERRUPTED_FOR_HAZARD' }],
          machineOperationAuthorized: false,
        },
        eventType: 'TECHNICAL_GUIDANCE_SAFETY_INTERRUPTED', eventDetails: { supportCaseState: supportCase.state },
      });
      return this.privateView(guidance);
    });
  }

  recoverAfterAuthorizedSafetyDisposition({ actor, commandId, guidanceId, expectedVersion }) {
    requireAuthorization(this.authorize, actor, 'TECHNICAL_GUIDANCE_RECOVER', { guidanceId });
    let guidance = this.readRecord(actor, guidanceId);
    this.requirePrivateRead(actor, guidance);
    this.requireVersion(guidance, expectedVersion);
    const supportCase = this.supportIntake.getPrivateCase({ actor, caseReference: guidance.data.caseReference });
    this.assertSafetyAllowsGuidance(supportCase, this.supportFacts(supportCase));
    requireValue(supportCase.data.authorizedSafetyDisposition, 'AUTHORIZED_SAFETY_DISPOSITION_REQUIRED', 'Guidance recovery after a safety hold requires the governed human disposition');
    const candidates = guidance.data.machineIdentity ? this.resourceResolver.resolveApplicable(guidance.data.machineIdentity, guidance.data.resourceCategory) : [];
    const nextState = candidates.length ? 'AWAITING_HUMAN_SELECTION' : 'RESOURCE_REVIEW_REQUIRED';
    this.assertTransition(guidance.state, nextState);
    guidance = this.privateRecords.update({
      actor: this.recordActor(actor), commandId, recordId: guidance.recordId, expectedVersion, nextState,
      patch: {
        safetyAssessment: this.safetySnapshot(supportCase, this.supportFacts(supportCase)),
        resourceCandidates: candidates.map((candidate) => this.candidateReference(candidate)),
        recoveryObligations: candidates.length ? [] : ['APPROVED_APPLICABLE_RESOURCE_REQUIRED'],
        guidanceStateHistory: [...guidance.data.guidanceStateHistory, { fromState: guidance.state, toState: nextState, occurredAt: this.clock(), event: 'GUIDANCE_RECOVERED_AFTER_AUTHORIZED_SAFETY_DISPOSITION' }],
        machineOperationAuthorized: false,
      },
      eventType: 'TECHNICAL_GUIDANCE_SAFETY_RECOVERY_RECORDED', eventDetails: { nextState },
    });
    return this.privateView(guidance);
  }

  withdraw({ actor, commandId, guidanceId, expectedVersion, reason }) {
    requireAuthorization(this.authorize, actor, 'TECHNICAL_GUIDANCE_WITHDRAW', { guidanceId });
    requireValue(/^SYNTHETIC_[A-Z0-9_:-]{4,}$/.test(reason || ''), 'GUIDANCE_WITHDRAWAL_REASON_REQUIRED', 'Withdrawal requires a synthetic reason');
    let record = this.readRecord(actor, guidanceId);
    this.requirePrivateRead(actor, record);
    this.requireVersion(record, expectedVersion);
    this.assertTransition(record.state, 'WITHDRAWN_OR_SUPERSEDED');
    record = this.privateRecords.update({
      actor: this.recordActor(actor), commandId, recordId: record.recordId, expectedVersion, nextState: 'WITHDRAWN_OR_SUPERSEDED',
      patch: { withdrawnAt: this.clock(), withdrawnBy: actor.actorId, withdrawalReason: reason },
      eventType: 'TECHNICAL_GUIDANCE_WITHDRAWN', eventDetails: { reason },
    });
    return this.privateView(record);
  }

  emitDiagnosticOutput() { throw new ActivationError('AUTONOMOUS_DIAGNOSTIC_FORBIDDEN', 'B05 cannot generate diagnostic output'); }
  emitRepairInstructions() { throw new ActivationError('INVENTED_REPAIR_INSTRUCTIONS_FORBIDDEN', 'B05 cannot generate or invent repair instructions'); }
  publishResource() { this.activationGate.assertPermitted('TECHNICAL_RESOURCE_PUBLICATION'); }
  notifyCustomer() { this.activationGate.assertPermitted('TECHNICAL_GUIDANCE_CUSTOMER_NOTIFICATION'); }
  authorizeMachineOperation() { throw new ActivationError('MACHINE_OPERATION_AUTHORIZATION_FORBIDDEN', 'Technical guidance cannot authorize machine operation'); }

  activationSnapshot() {
    return {
      ...this.activationGate.snapshot(),
      technicalGuidanceCustomerServicePermitted: false,
      resourcePublicationPermitted: false,
      realNotificationPermitted: false,
      autonomousDiagnosisPermitted: false,
    };
  }

  validateRequest(request) {
    const allowed = ['operatorReference', 'authorityScope', 'machineIdentity', 'category', 'explicitReferral', 'relatedWarrantyReviewReference'];
    requireValue(request && Object.keys(request).every((key) => allowed.includes(key)), 'UNSUPPORTED_GUIDANCE_REQUEST_FIELD', 'Guidance requests accept only minimized routing and identity fields');
    requireValue(/^auth_syn_[A-Za-z0-9_-]{8,}$/.test(request.operatorReference || ''), 'OPAQUE_OPERATOR_REFERENCE_REQUIRED', 'A synthetic opaque operator reference is required');
    requireValue(/^SYNTHETIC_[A-Z0-9_:-]{4,}$/.test(request.authorityScope || ''), 'GUIDANCE_AUTHORITY_SCOPE_REQUIRED', 'An explicit synthetic authority scope is required');
    if (request.machineIdentity) {
      const allowedMachine = ['productGid', 'variantGid', 'machineVersion'];
      requireValue(Object.keys(request.machineIdentity).every((key) => allowedMachine.includes(key)), 'UNSUPPORTED_MACHINE_IDENTITY_FIELD', 'Machine identity cannot contain customer data or heuristic identifiers');
      requireValue(typeof request.machineIdentity.machineVersion === 'string' && request.machineIdentity.machineVersion.length > 0, 'MACHINE_VERSION_REQUIRED', 'Exact machine version is required when machine identity is supplied');
      this.catalog.assertRelationship(request.machineIdentity.productGid, request.machineIdentity.variantGid);
    }
    if (request.category) requireValue(this.contract.resourceCategories.includes(request.category), 'UNSUPPORTED_RESOURCE_CATEGORY', 'Unsupported resource category');
    if (request.relatedWarrantyReviewReference) requireValue(/^wreview_[A-Za-z0-9_-]{16,}$/.test(request.relatedWarrantyReviewReference), 'INVALID_WARRANTY_REVIEW_REFERENCE', 'Warranty review references must remain opaque');
  }

  validateSelection(selection) {
    const allowed = ['resourceId', 'revisionId', 'presentationEvidenceReference'];
    requireValue(selection && Object.keys(selection).every((key) => allowed.includes(key)), 'UNSUPPORTED_GUIDANCE_SELECTION_FIELD', 'Guidance selection may record only governed resource identity and synthetic presentation evidence');
    requireValue(typeof selection.resourceId === 'string' && selection.resourceId.length > 0 && typeof selection.revisionId === 'string' && selection.revisionId.length > 0, 'RESOURCE_REVISION_IDENTITY_REQUIRED', 'Exact resource and revision identities are required');
    requireValue(/^synthetic:/.test(selection.presentationEvidenceReference || ''), 'SYNTHETIC_PRESENTATION_EVIDENCE_REQUIRED', 'Synthetic presentation evidence is required');
  }

  validateSupportRelationship(intake, request) {
    if (intake.category !== 'TECHNICAL_GUIDANCE') {
      requireValue(request.explicitReferral?.requested === true && /^synthetic:/.test(request.explicitReferral.evidenceReference || ''), 'EXPLICIT_TECHNICAL_GUIDANCE_REFERRAL_REQUIRED', 'Other support categories require an explicit human technical-guidance referral');
    }
    if (intake.machineIdentity && request.machineIdentity) {
      requireValue(intake.machineIdentity.productGid === request.machineIdentity.productGid && intake.machineIdentity.variantGid === request.machineIdentity.variantGid && (!intake.machineIdentity.productVersion || intake.machineIdentity.productVersion === request.machineIdentity.machineVersion), 'SUPPORT_CASE_MACHINE_IDENTITY_MISMATCH', 'Guidance identity must match the authorized support case');
    }
  }

  resolveMachineIdentity(intake, requested) {
    if (requested) return clone(requested);
    if (!intake.machineIdentity?.productGid || !intake.machineIdentity?.variantGid || !intake.machineIdentity?.productVersion) return null;
    return { productGid: intake.machineIdentity.productGid, variantGid: intake.machineIdentity.variantGid, machineVersion: intake.machineIdentity.productVersion };
  }

  safetySnapshot(record, intake) {
    const obligations = [];
    if (record.state === 'SAFETY_HOLD' || record.data.safetyHoldActive) obligations.push('ACTIVE_SAFETY_HOLD');
    if ((record.data.unresolvedNotificationIds || []).length) obligations.push('UNRESOLVED_SAFETY_NOTIFICATION');
    if (intake.safetyDisclosure === 'AMBIGUOUS_REVIEW_REQUIRED') obligations.push('AMBIGUOUS_SAFETY_INFORMATION_REVIEW_REQUIRED');
    if (record.data.staffHandlingStatus === 'PENDING_APPROVED_BUSINESS_HOURS' && record.data.safetyHoldActive) obligations.push('SERIOUS_INCIDENT_HUMAN_HANDLING_PENDING');
    return {
      supportState: record.state,
      safetyHoldActive: record.data.safetyHoldActive === true,
      warningDeliveryStatus: record.data.safetyInterruption?.stopUseWarning?.deliveryStatus || null,
      unresolvedNotificationCount: (record.data.unresolvedNotificationIds || []).length,
      disclosure: intake.safetyDisclosure,
      blocked: obligations.length > 0,
      obligations,
      automaticSafeFinding: false,
      machineOperationAuthorized: false,
    };
  }

  assertSafetyAllowsGuidance(record, intake) {
    const safety = this.safetySnapshot(record, intake);
    requireValue(!safety.safetyHoldActive, 'ACTIVE_SAFETY_HOLD', 'An active safety hold blocks ordinary technical guidance');
    requireValue(safety.unresolvedNotificationCount === 0, 'UNRESOLVED_SAFETY_NOTIFICATION', 'Unresolved warning delivery blocks technical guidance');
    requireValue(safety.disclosure !== 'AMBIGUOUS_REVIEW_REQUIRED', 'AMBIGUOUS_SAFETY_REVIEW_REQUIRED', 'Ambiguous safety information cannot become an automatic safe finding');
  }

  candidateReference(candidate) {
    return clone({
      resourceId: candidate.resourceId,
      revisionId: candidate.revisionId,
      category: candidate.category,
      sourceIdentity: candidate.sourceIdentity,
      applicability: candidate.applicability,
      releaseStatus: candidate.releaseStatus,
      technicalApproval: candidate.technicalApproval,
      supersedesRevisionId: candidate.supersedesRevisionId,
      supersededByRevisionId: candidate.supersededByRevisionId,
      approvalContext: candidate.approvalContext,
      syntheticFixture: candidate.syntheticFixture,
      customerReleaseAuthorized: candidate.customerReleaseAuthorized,
    });
  }

  registrationSummary(context) {
    return {
      status: context?.status || 'NOT_PROVIDED',
      machineContextOnly: true,
      ownershipInferred: false,
      warrantyCoverageInferred: false,
      guidanceAuthorityInferred: false,
    };
  }

  supportFacts(record) { return record.data.syntheticFacts.supportIntake; }
  privateView(record) { return clone(record); }

  readRecord(actor, guidanceId) {
    const recordId = this.recordIdsByGuidance.get(guidanceId);
    requireValue(recordId, 'TECHNICAL_GUIDANCE_NOT_FOUND', 'Technical guidance record was not found');
    return this.privateRecords.read({ actor: this.recordActor(actor), recordId });
  }

  requirePrivateRead(actor, record) {
    if (!actor || !this.authorize(actor, 'TECHNICAL_GUIDANCE_PRIVATE_READ', record)) throw new AuthorizationError('TECHNICAL_GUIDANCE_ACCESS_DENIED', 'Technical guidance access is not authorized');
    if (actor.customerReference && actor.customerReference !== record.data.customerReference) throw new AuthorizationError('TECHNICAL_GUIDANCE_ACCESS_DENIED', 'Cross-customer technical guidance access is forbidden');
  }

  requireVersion(record, expectedVersion) {
    if (record.version !== expectedVersion) throw new ConflictError('RECORD_VERSION_CONFLICT', 'Expected guidance record version does not match', { expectedVersion, actualVersion: record.version });
  }

  assertTransition(fromState, toState) {
    requireValue(GUIDANCE_STATES.includes(fromState) && GUIDANCE_STATES.includes(toState), 'UNKNOWN_TECHNICAL_GUIDANCE_STATE', 'Unknown guidance states fail closed');
    if (fromState === toState) return;
    const allowed = this.contract.transitions.some(([from, to]) => from === fromState && to === toState);
    if (!allowed) throw new TransitionError('UNAUTHORIZED_TECHNICAL_GUIDANCE_TRANSITION', 'Technical guidance transition is not authorized', { fromState, toState });
  }

  recordActor(actor) { return { actorId: actor?.actorId || this.systemActor.actorId, permissions: [...this.systemActor.permissions] }; }
  validEvidenceRefs(refs) { return Array.isArray(refs) && refs.length > 0 && refs.every((reference) => /^synthetic:[A-Za-z0-9_:/.-]+$/.test(reference)); }
  interrupt(stage, context) { if (this.interruptionHook) this.interruptionHook(stage, clone(context)); }
}

module.exports = {
  GUIDANCE_STATES,
  GovernedCustomerResourceResolver,
  SyntheticGuidanceResourceResolver,
  SyntheticTechnicalGuidanceAuthorityResolver,
  TechnicalGuidanceService,
  UnresolvedTechnicalGuidanceAuthorityResolver,
};
