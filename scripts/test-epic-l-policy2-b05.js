'use strict';

const assert = require('node:assert/strict');
const {
  SyntheticGuidanceResourceResolver,
  SyntheticNotificationTransport,
  SyntheticTechnicalGuidanceAuthorityResolver,
  UnresolvedTechnicalGuidanceAuthorityResolver,
  createB01Foundation,
} = require('./lib/epic-l-policy2');

const PRODUCT_GID = 'gid://shopify/Product/910000000001';
const VARIANT_GID = 'gid://shopify/ProductVariant/920000000001';
const OTHER_VARIANT_GID = 'gid://shopify/ProductVariant/920000000002';
const CUSTOMER_A = 'cus_synthetic_guidance_customer_a';
const CUSTOMER_B = 'cus_synthetic_guidance_customer_b';
const DESTINATION_A = 'dst_synthetic_guidance_destination_a';
const OPERATOR_REFERENCE = 'auth_syn_guidance_operator_0001';
const AUTHORITY_SCOPE = 'SYNTHETIC_POLICY2_GUIDANCE_SELECTION';
const RESOURCE_ID = 'synthetic:resource:machine-manual-1';

const customerA = { actorId: 'SYNTHETIC_GUIDANCE_CUSTOMER_A', customerReference: CUSTOMER_A, permissions: ['SUPPORT_INTAKE_CREATE', 'SUPPORT_CASE_READ_OWN'] };
const customerB = { actorId: 'SYNTHETIC_GUIDANCE_CUSTOMER_B', customerReference: CUSTOMER_B, permissions: ['TECHNICAL_GUIDANCE_PRIVATE_READ'] };
const operator = {
  actorId: 'SYNTHETIC_GUIDANCE_OPERATOR',
  permissions: [
    'SUPPORT_CASE_PRIVATE_READ', 'TECHNICAL_GUIDANCE_REQUEST', 'TECHNICAL_GUIDANCE_PRIVATE_READ', 'TECHNICAL_GUIDANCE_SELECT',
    'TECHNICAL_GUIDANCE_REPORT_HAZARD', 'TECHNICAL_GUIDANCE_RECOVER', 'TECHNICAL_RESOURCE_REVISION_REQUEST',
    'TECHNICAL_GUIDANCE_RECONSIDER', 'TECHNICAL_GUIDANCE_WITHDRAW',
  ],
};
const spoofingOperator = { ...operator, actorId: 'SYNTHETIC_GUIDANCE_SPOOFING_OPERATOR' };
const unauthorized = { actorId: 'SYNTHETIC_UNAUTHORIZED', permissions: [] };
const resourceEditor = { actorId: 'SYNTHETIC_RESOURCE_EDITOR', permissions: ['RESOURCE_REVISION_CREATE'] };
const syntheticKevin = { actorId: 'SYNTHETIC_KEVIN_AUTHORITY', permissions: ['RESOURCE_TECHNICAL_APPROVE'] };
const safetyAuthority = { actorId: 'SYNTHETIC_SAFETY_AUTHORITY', permissions: ['SAFETY_DISPOSITION', 'SUPPORT_CASE_PRIVATE_READ'] };
const systemActor = {
  actorId: 'B05_SYNTHETIC_PRIVATE_SYSTEM',
  permissions: [
    'PRIVATE_RECORD_CREATE', 'PRIVATE_RECORD_READ', 'PRIVATE_RECORD_UPDATE', 'PRIVATE_AUDIT_READ',
    'NOTIFICATION_QUEUE', 'NOTIFICATION_ATTEMPT', 'NOTIFICATION_RECOVERY', 'NOTIFICATION_RECONCILE',
    'SUPPORT_CASE_CREATE', 'SAFETY_INTERRUPT', 'SAFETY_DISPOSITION',
  ],
};

function deterministicClock() {
  let tick = 0;
  return () => new Date(Date.UTC(2026, 10, 24, 15, 0, tick++)).toISOString();
}

function deterministicFactory(prefix) {
  let sequence = 0;
  return () => `${prefix}${String(++sequence).padStart(24, '0')}`;
}

function authorityGrant(overrides = {}) {
  return {
    operatorReference: OPERATOR_REFERENCE,
    actorId: operator.actorId,
    authorityScopes: [AUTHORITY_SCOPE],
    authorizationEvidenceReference: 'synthetic:authority:technical-guidance:1',
    authorizedFrom: '2026-11-01T00:00:00.000Z',
    authorizedTo: '2026-12-31T23:59:59.999Z',
    ...overrides,
  };
}

function makeFoundation({
  withApprovedResource = true,
  authorityResolver = new SyntheticTechnicalGuidanceAuthorityResolver([authorityGrant()]),
  resourceResolverFactory,
  notificationOutcomes = [],
  interruptionHook = null,
  testMode = true,
} = {}) {
  const transport = new SyntheticNotificationTransport(notificationOutcomes);
  const fixtureFactory = resourceResolverFactory || ((resources) => new SyntheticGuidanceResourceResolver({ resourceGovernance: resources, fixtureResourceIds: [RESOURCE_ID] }));
  const foundation = createB01Foundation({
    catalogEntries: [
      { productGid: PRODUCT_GID, variantGid: VARIANT_GID },
      { productGid: PRODUCT_GID, variantGid: OTHER_VARIANT_GID },
    ],
    transport,
    clock: deterministicClock(),
    identifiers: {
      recordId: deterministicFactory('rec_'), publicReference: deterministicFactory('ref_'), auditId: deterministicFactory('aud_'),
      notificationId: deterministicFactory('ntf_'), attemptId: deterministicFactory('att_'), resourceId: deterministicFactory('res_'),
      revisionId: deterministicFactory('rev_'), resourceAuditId: deterministicFactory('raud_'), domainEventId: deterministicFactory('evt_'),
      registrationId: deterministicFactory('reg_'), acknowledgementEventId: deterministicFactory('ack_'), duplicateReviewId: deterministicFactory('dup_'),
      supportCaseReference: deterministicFactory('case_'), supportAcknowledgementEventId: deterministicFactory('sack_'), supportRoutingAttemptId: deterministicFactory('routeatt_'),
      warrantyReviewId: deterministicFactory('wreview_'), warrantyAssessmentId: deterministicFactory('wassess_'),
      guidanceId: deterministicFactory('guide_'), guidanceSelectionId: deterministicFactory('gsel_'),
    },
    technicalApprovalAuthority: { actorId: syntheticKevin.actorId, authorityRole: 'SYNTHETIC_TECHNICAL_APPROVER', synthetic: true },
    systemActor,
    guidanceResourceResolverFactory: fixtureFactory,
    guidanceAuthorityResolver: authorityResolver,
    guidanceInterruptionHook: interruptionHook,
    testMode,
    rootDir: process.cwd(),
  });
  let revision = null;
  if (withApprovedResource) {
    revision = foundation.resources.createRevision({
      actor: resourceEditor,
      resourceId: RESOURCE_ID,
      category: 'MANUAL',
      sourceIdentity: 'synthetic:source:machine-manual-1',
      applicability: { productGids: [PRODUCT_GID], variantGids: [VARIANT_GID], machineVersions: ['MACHINE-V1'] },
      customerCopyApproval: false,
    });
    revision = foundation.resources.submitTechnicalReview({ actor: resourceEditor, resourceId: RESOURCE_ID, revisionId: revision.revisionId });
    revision = foundation.resources.approveTechnical({ actor: syntheticKevin, resourceId: RESOURCE_ID, revisionId: revision.revisionId, approvalEvidence: ['synthetic:kevin:approval:1'] });
  }
  return { ...foundation, transport, revision };
}

function makeNormalFoundation() {
  const foundation = createB01Foundation({
    catalogEntries: [{ productGid: PRODUCT_GID, variantGid: VARIANT_GID }],
    clock: deterministicClock(),
    transport: new SyntheticNotificationTransport(),
    rootDir: process.cwd(),
  });
  return foundation;
}

function supportInput(overrides = {}) {
  return {
    customerReference: CUSTOMER_A,
    notificationDestinationReference: DESTINATION_A,
    category: 'TECHNICAL_GUIDANCE',
    sourceChannel: 'SYNTHETIC_WEB_FORM',
    productGid: PRODUCT_GID,
    variantGid: VARIANT_GID,
    productVersion: 'MACHINE-V1',
    issueSummary: 'SYNTHETIC_TECHNICAL_GUIDANCE_REQUEST',
    evidenceRefs: ['synthetic:support:guidance-request'],
    safetyDisclosure: 'NO_HAZARD_REPORTED',
    ...overrides,
  };
}

function createSupport(foundation, commandId = 'support-1', overrides = {}) {
  return foundation.supportIntake.createCase({ actor: customerA, commandId, input: supportInput(overrides) }).case;
}

function guidanceRequest(overrides = {}) {
  return {
    operatorReference: OPERATOR_REFERENCE,
    authorityScope: AUTHORITY_SCOPE,
    machineIdentity: { productGid: PRODUCT_GID, variantGid: VARIANT_GID, machineVersion: 'MACHINE-V1' },
    category: 'MANUAL',
    ...overrides,
  };
}

function requestGuidance(foundation, supportCase, commandId = 'guidance-1', request = guidanceRequest(), actor = operator) {
  const caseReference = supportCase.data.syntheticFacts.supportIntake.caseReference;
  return foundation.technicalGuidance.requestGuidance({ actor, commandId, caseReference, request });
}

function selectGuidance(foundation, guidance, commandId = 'selection-1', actor = operator, overrides = {}) {
  return foundation.technicalGuidance.recordSyntheticGuidance({
    actor, commandId, guidanceId: guidance.data.guidanceId, expectedVersion: guidance.version,
    selection: { resourceId: RESOURCE_ID, revisionId: foundation.revision.revisionId, presentationEvidenceReference: 'synthetic:presentation:operator-console:1', ...overrides },
  });
}

function safeDisposition() {
  return {
    responsibleAuthority: 'SYNTHETIC_SAFETY_AUTHORITY',
    authorityRole: 'SYNTHETIC_SAFETY_DISPOSITION_AUTHORITY',
    authorityName: 'Kevin',
    authorityBindingStatus: 'VERIFIED_IDENTITY_BINDING',
    authorityEvidenceReference: 'synthetic:authority:kevin',
    reason: 'SYNTHETIC_HAZARD_REVIEW_COMPLETED',
    evidenceRefs: ['synthetic:safety:review:1'],
    disposition: 'CLEARED_FOR_GOVERNED_SUPPORT',
    dispositionAt: '2026-11-24T16:00:00.000Z',
  };
}

let rejectedInvalidOperations = 0;
function expectCode(fn, code) {
  assert.throws(fn, (error) => error && error.code === code, `Expected ${code}`);
  rejectedInvalidOperations += 1;
}

const tests = [];
function test(name, run) { tests.push({ name, run }); }

test('normal empty governed registry fails closed', () => {
  const f = makeNormalFoundation();
  const support = createSupport(f);
  const guidance = requestGuidance(f, support);
  assert.equal(guidance.state, 'RESOURCE_REVIEW_REQUIRED');
  assert.deepEqual(guidance.data.resourceCandidates, []);
});

test('authorized request resolves an exact synthetic approved revision', () => {
  const f = makeFoundation();
  const guidance = requestGuidance(f, createSupport(f));
  assert.equal(guidance.state, 'AWAITING_HUMAN_SELECTION');
  assert.equal(guidance.data.resourceCandidates[0].revisionId, f.revision.revisionId);
  assert.equal(guidance.data.resourceCandidates[0].customerReleaseAuthorized, false);
});

test('authorized human selection records identity without content or customer delivery', () => {
  const f = makeFoundation();
  const selected = selectGuidance(f, requestGuidance(f, createSupport(f)));
  assert.equal(selected.state, 'SYNTHETIC_GUIDANCE_RECORDED');
  assert.equal(selected.data.selections[0].contentReturned, false);
  assert.equal(selected.data.selections[0].customerDelivered, false);
  assert.equal(selected.data.machineOperationAuthorized, false);
});

test('request and selection commands are idempotent and conflicting reuse fails', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  const first = requestGuidance(f, support, 'guidance-idempotent');
  assert.deepEqual(requestGuidance(f, support, 'guidance-idempotent'), first);
  expectCode(() => requestGuidance(f, support, 'guidance-idempotent', guidanceRequest({ category: 'DIAGRAM' })), 'IDEMPOTENCY_KEY_REUSE');
  const selected = selectGuidance(f, first, 'selection-idempotent');
  assert.deepEqual(selectGuidance(f, first, 'selection-idempotent'), selected);
  expectCode(() => selectGuidance(f, first, 'selection-idempotent', operator, { presentationEvidenceReference: 'synthetic:presentation:different' }), 'IDEMPOTENCY_KEY_REUSE');
});

test('unauthenticated and unauthorized requests are rejected', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  expectCode(() => requestGuidance(f, support, 'no-actor', guidanceRequest(), null), 'AUTHORIZATION_REQUIRED');
  expectCode(() => requestGuidance(f, support, 'no-permission', guidanceRequest(), unauthorized), 'AUTHORIZATION_REQUIRED');
});

test('cross-customer reads fail and public handle reveals no case or resource data', () => {
  const f = makeFoundation();
  const guidance = requestGuidance(f, createSupport(f));
  expectCode(() => f.technicalGuidance.getPrivateGuidance({ actor: customerB, guidanceId: guidance.data.guidanceId }), 'TECHNICAL_GUIDANCE_ACCESS_DENIED');
  const publicHandle = f.technicalGuidance.getPublicHandle(guidance.data.guidanceId);
  assert.deepEqual(Object.keys(publicHandle), ['guidanceReference', 'processingStatus', 'customerGuidanceDelivered', 'customerActivationPermitted']);
});

test('invalid Product, Variant relationship, and unsupported request fields fail', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  expectCode(() => requestGuidance(f, support, 'bad-product', guidanceRequest({ machineIdentity: { productGid: 'not-a-gid', variantGid: VARIANT_GID, machineVersion: 'MACHINE-V1' } })), 'INVALID_PRODUCT_GID');
  expectCode(() => requestGuidance(f, support, 'bad-variant', guidanceRequest({ machineIdentity: { productGid: PRODUCT_GID, variantGid: 'gid://shopify/ProductVariant/999999999999', machineVersion: 'MACHINE-V1' } })), 'INVALID_PRODUCT_VARIANT_RELATIONSHIP');
  expectCode(() => requestGuidance(f, support, 'private-data', { ...guidanceRequest(), email: 'forbidden@example.test' }), 'UNSUPPORTED_GUIDANCE_REQUEST_FIELD');
});

test('wrong machine version and resource category produce unresolved selection', () => {
  const f = makeFoundation();
  const support = createSupport(f, 'support-wrong-version', { productVersion: null });
  const wrongVersion = requestGuidance(f, support, 'wrong-version', guidanceRequest({ machineIdentity: { productGid: PRODUCT_GID, variantGid: VARIANT_GID, machineVersion: 'MACHINE-V2' } }));
  assert.equal(wrongVersion.state, 'RESOURCE_REVIEW_REQUIRED');
  const wrongCategory = requestGuidance(f, support, 'wrong-category', guidanceRequest({ category: 'DIAGRAM' }));
  assert.equal(wrongCategory.state, 'RESOURCE_REVIEW_REQUIRED');
});

test('exact alternate Variant relationship is valid identity but not resource applicability', () => {
  const f = makeFoundation();
  const support = createSupport(f, 'other-variant-case', { variantGid: OTHER_VARIANT_GID });
  const guidance = requestGuidance(f, support, 'other-variant-guidance', guidanceRequest({ machineIdentity: { productGid: PRODUCT_GID, variantGid: OTHER_VARIANT_GID, machineVersion: 'MACHINE-V1' } }));
  assert.equal(guidance.state, 'RESOURCE_REVIEW_REQUIRED');
  assert.deepEqual(guidance.data.resourceCandidates, []);
});

test('missing exact machine identity remains review required without inference', () => {
  const f = makeFoundation();
  const support = createSupport(f, 'unknown-machine-case', { productGid: undefined, variantGid: undefined, productVersion: undefined });
  const guidance = requestGuidance(f, support, 'unknown-machine-guidance', guidanceRequest({ machineIdentity: null }));
  assert.equal(guidance.state, 'MACHINE_IDENTIFICATION_REQUIRED');
  assert.ok(guidance.data.recoveryObligations.includes('EXACT_MACHINE_IDENTITY_REQUIRED'));
});

test('retired resource revisions are rejected for new guidance while history remains', () => {
  const f = makeFoundation();
  const previousRevisionId = f.revision.revisionId;
  f.resources.supersede({
    actor: resourceEditor,
    resourceId: RESOURCE_ID,
    previousRevisionId,
    replacement: {
      category: 'MANUAL', sourceIdentity: 'synthetic:source:machine-manual-2',
      applicability: { productGids: [PRODUCT_GID], variantGids: [VARIANT_GID], machineVersions: ['MACHINE-V1'] },
      customerCopyApproval: false,
    },
  });
  const guidance = requestGuidance(f, createSupport(f));
  assert.equal(guidance.state, 'RESOURCE_REVIEW_REQUIRED');
  assert.equal(f.resources.history(RESOURCE_ID).find((revision) => revision.revisionId === previousRevisionId).releaseStatus, 'RETIRED');
});

test('missing and unapproved resources cannot be selected', () => {
  const f = makeFoundation({ withApprovedResource: false });
  const guidance = requestGuidance(f, createSupport(f));
  assert.equal(guidance.state, 'RESOURCE_REVIEW_REQUIRED');
  expectCode(() => f.technicalGuidance.recordSyntheticGuidance({ actor: operator, commandId: 'select-missing', guidanceId: guidance.data.guidanceId, expectedVersion: guidance.version, selection: { resourceId: RESOURCE_ID, revisionId: 'rev_missing_0000000000000000', presentationEvidenceReference: 'synthetic:presentation:missing' } }), 'GUIDANCE_NOT_AWAITING_SELECTION');
});

test('malicious unapproved candidate and missing synthetic Kevin evidence fail at selection', () => {
  const badCandidate = {
    resourceId: RESOURCE_ID, revisionId: 'rev_synthetic_bad_candidate_001', category: 'MANUAL', sourceIdentity: 'synthetic:source:bad',
    applicability: { productGids: [PRODUCT_GID], variantGids: [VARIANT_GID], machineVersions: ['MACHINE-V1'] },
    releaseStatus: 'DRAFT', technicalApproval: null, supersedesRevisionId: null, supersededByRevisionId: null,
    approvalContext: 'SYNTHETIC_TEST_ONLY', syntheticFixture: true, customerReleaseAuthorized: false,
  };
  const resolverFactory = () => ({ synthetic: true, resolveApplicable: () => [badCandidate] });
  const f = makeFoundation({ withApprovedResource: false, resourceResolverFactory: resolverFactory });
  f.revision = badCandidate;
  const guidance = requestGuidance(f, createSupport(f));
  expectCode(() => selectGuidance(f, guidance), 'SYNTHETIC_KEVIN_APPROVAL_REQUIRED');
});

test('operator identity spoofing, out of scope, and expired authority fail', () => {
  const f = makeFoundation();
  const guidance = requestGuidance(f, createSupport(f));
  expectCode(() => selectGuidance(f, guidance, 'spoof', spoofingOperator), 'TECHNICAL_GUIDANCE_IDENTITY_SPOOFING_REJECTED');
  const out = makeFoundation({ authorityResolver: new SyntheticTechnicalGuidanceAuthorityResolver([authorityGrant({ authorityScopes: ['SYNTHETIC_OTHER_SCOPE'] })]) });
  expectCode(() => selectGuidance(out, requestGuidance(out, createSupport(out))), 'TECHNICAL_GUIDANCE_AUTHORITY_OUT_OF_SCOPE');
  const expired = makeFoundation({ authorityResolver: new SyntheticTechnicalGuidanceAuthorityResolver([authorityGrant({ authorizedTo: '2026-11-01T00:00:00.000Z' })]) });
  expectCode(() => selectGuidance(expired, requestGuidance(expired, createSupport(expired))), 'TECHNICAL_GUIDANCE_AUTHORITY_EXPIRED');
});

test('normal operator authority remains unresolved and denied', () => {
  const f = makeFoundation({ authorityResolver: new UnresolvedTechnicalGuidanceAuthorityResolver() });
  expectCode(() => selectGuidance(f, requestGuidance(f, createSupport(f))), 'TECHNICAL_GUIDANCE_AUTHORITY_UNRESOLVED');
});

test('active safety hold and unresolved warning block guidance', () => {
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'UNCERTAIN' }] });
  const support = createSupport(f, 'hazard-case', { safetyDisclosure: 'EXPLICIT_HAZARD', hazardEvidenceRef: 'synthetic:hazard:sparks' });
  const guidance = requestGuidance(f, support);
  assert.equal(guidance.state, 'SAFETY_REVIEW_REQUIRED');
  assert.ok(guidance.data.recoveryObligations.includes('ACTIVE_SAFETY_HOLD'));
  assert.ok(guidance.data.recoveryObligations.includes('UNRESOLVED_SAFETY_NOTIFICATION'));
});

test('ambiguous safety disclosure never becomes an automatic safe finding', () => {
  const f = makeFoundation();
  const support = createSupport(f, 'ambiguous-case', { safetyDisclosure: 'AMBIGUOUS_REVIEW_REQUIRED' });
  const guidance = requestGuidance(f, support);
  assert.equal(guidance.state, 'SAFETY_REVIEW_REQUIRED');
  assert.equal(guidance.data.safetyAssessment.automaticSafeFinding, false);
});

test('new hazard interrupts ongoing guidance and warning generation is not delivery', () => {
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'FAILED', reasonCode: 'SYNTHETIC_FAILURE' }] });
  const guidance = requestGuidance(f, createSupport(f));
  const held = f.technicalGuidance.reportHazard({ actor: operator, commandId: 'hazard-report', guidanceId: guidance.data.guidanceId, expectedVersion: guidance.version, hazard: { reportedAt: '2026-11-24T15:30:00.000Z', sourceChannel: 'SYNTHETIC_OPERATOR', reportedSymptoms: 'synthetic:hazard:heat' } });
  assert.equal(held.state, 'SAFETY_REVIEW_REQUIRED');
  assert.equal(held.data.safetyAssessment.warningDeliveryStatus, 'RECOVERY_REQUIRED');
  assert.equal(held.data.machineOperationAuthorized, false);
});

test('interrupted hazard orchestration restores guidance hold idempotently', () => {
  let interrupted = false;
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic-receipt' } }], interruptionHook: (stage) => { if (stage === 'AFTER_GUIDANCE_SAFETY_INTERRUPTION' && !interrupted) { interrupted = true; throw new Error('SYNTHETIC_INTERRUPTION'); } } });
  const guidance = requestGuidance(f, createSupport(f));
  const command = { actor: operator, commandId: 'hazard-interrupted', guidanceId: guidance.data.guidanceId, expectedVersion: guidance.version, hazard: { reportedAt: '2026-11-24T15:30:00.000Z', sourceChannel: 'SYNTHETIC_OPERATOR', reportedSymptoms: 'synthetic:hazard:noise' } };
  assert.throws(() => f.technicalGuidance.reportHazard(command), /SYNTHETIC_INTERRUPTION/);
  const recovered = f.technicalGuidance.reportHazard(command);
  assert.equal(recovered.state, 'SAFETY_REVIEW_REQUIRED');
});

test('authorized safety disposition permits governed recovery but never operation authorization', () => {
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic-receipt' } }] });
  const support = createSupport(f, 'hazard-clear', { safetyDisclosure: 'EXPLICIT_HAZARD', hazardEvidenceRef: 'synthetic:hazard:stop' });
  let guidance = requestGuidance(f, support);
  let currentCase = f.supportIntake.getPrivateCase({ actor: safetyAuthority, caseReference: support.data.syntheticFacts.supportIntake.caseReference });
  f.supportIntake.authorizedSafetyDisposition({ actor: safetyAuthority, commandId: 'safety-clear', caseReference: guidance.data.caseReference, expectedVersion: currentCase.version, toState: 'TRIAGED', dispositionRecord: safeDisposition() });
  guidance = f.technicalGuidance.recoverAfterAuthorizedSafetyDisposition({ actor: operator, commandId: 'guidance-recover', guidanceId: guidance.data.guidanceId, expectedVersion: guidance.version });
  assert.equal(guidance.state, 'AWAITING_HUMAN_SELECTION');
  assert.equal(guidance.data.machineOperationAuthorized, false);
});

test('unauthorized safety release and recovery during a hold fail', () => {
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic-receipt' } }] });
  const support = createSupport(f, 'hazard-unauthorized', { safetyDisclosure: 'EXPLICIT_HAZARD', hazardEvidenceRef: 'synthetic:hazard:stop' });
  const guidance = requestGuidance(f, support);
  expectCode(() => f.technicalGuidance.recoverAfterAuthorizedSafetyDisposition({ actor: operator, commandId: 'recover-with-hold', guidanceId: guidance.data.guidanceId, expectedVersion: guidance.version }), 'ACTIVE_SAFETY_HOLD');
  const currentCase = f.supportIntake.getPrivateCase({ actor: operator, caseReference: guidance.data.caseReference });
  expectCode(() => f.supportIntake.authorizedSafetyDisposition({ actor: operator, commandId: 'bad-release', caseReference: guidance.data.caseReference, expectedVersion: currentCase.version, toState: 'TRIAGED', dispositionRecord: safeDisposition() }), 'AUTHORIZATION_REQUIRED');
});

test('other support categories require an explicit technical referral', () => {
  const f = makeFoundation();
  const support = createSupport(f, 'parts-case', { category: 'PARTS_QUESTION' });
  expectCode(() => requestGuidance(f, support, 'no-referral'), 'EXPLICIT_TECHNICAL_GUIDANCE_REFERRAL_REQUIRED');
  const referred = requestGuidance(f, support, 'with-referral', guidanceRequest({ explicitReferral: { requested: true, evidenceReference: 'synthetic:referral:parts-to-guidance' } }));
  assert.equal(referred.data.supportCategory, 'PARTS_QUESTION');
});

test('registration and warranty references do not authorize guidance or coverage', () => {
  const f = makeFoundation();
  const guidance = requestGuidance(f, createSupport(f), 'context-boundaries', guidanceRequest({ relatedWarrantyReviewReference: 'wreview_000000000000000000000001' }));
  assert.equal(guidance.data.registrationContext.guidanceAuthorityInferred, false);
  assert.equal(guidance.data.registrationContext.warrantyCoverageInferred, false);
  assert.equal(guidance.data.warrantyReviewAuthorityEffect, false);
  assert.equal(guidance.data.warrantyFinding, 'NOT_PERFORMED');
});

test('resource revision request records follow-up without mutating approval', () => {
  const f = makeFoundation();
  let guidance = selectGuidance(f, requestGuidance(f, createSupport(f)));
  const historyBefore = f.resources.history(RESOURCE_ID);
  guidance = f.technicalGuidance.requestResourceRevision({ actor: operator, commandId: 'revision-request', guidanceId: guidance.data.guidanceId, expectedVersion: guidance.version, reason: 'SYNTHETIC_CORRECTION_REVIEW_REQUIRED', evidenceRefs: ['synthetic:revision:issue:1'] });
  assert.equal(guidance.state, 'FOLLOW_UP_REQUIRED');
  assert.equal(guidance.data.revisionRequests[0].technicalApprovalGranted, false);
  assert.deepEqual(f.resources.history(RESOURCE_ID), historyBefore);
});

test('supersession reconsideration preserves earlier selection and audit history', () => {
  const f = makeFoundation();
  let guidance = selectGuidance(f, requestGuidance(f, createSupport(f)));
  const selection = guidance.data.selections[0];
  guidance = f.technicalGuidance.reconsiderForSupersession({ actor: operator, commandId: 'reconsider', guidanceId: guidance.data.guidanceId, expectedVersion: guidance.version, reason: 'SYNTHETIC_REVISION_SUPERSEDED', evidenceRefs: ['synthetic:supersession:evidence:1'] });
  assert.equal(guidance.state, 'RESOURCE_REVIEW_REQUIRED');
  assert.deepEqual(guidance.data.selections[0], selection);
  assert.ok(f.technicalGuidance.auditTrail({ actor: operator, guidanceId: guidance.data.guidanceId }).some((event) => event.eventType === 'TECHNICAL_GUIDANCE_RECONSIDERATION_REQUESTED'));
});

test('record version conflicts and invalid selection fields fail closed', () => {
  const f = makeFoundation();
  const guidance = requestGuidance(f, createSupport(f));
  expectCode(() => f.technicalGuidance.recordSyntheticGuidance({ actor: operator, commandId: 'bad-version', guidanceId: guidance.data.guidanceId, expectedVersion: guidance.version - 1, selection: { resourceId: RESOURCE_ID, revisionId: f.revision.revisionId, presentationEvidenceReference: 'synthetic:presentation:1' } }), 'RECORD_VERSION_CONFLICT');
  expectCode(() => f.technicalGuidance.recordSyntheticGuidance({ actor: operator, commandId: 'invented-content', guidanceId: guidance.data.guidanceId, expectedVersion: guidance.version, selection: { resourceId: RESOURCE_ID, revisionId: f.revision.revisionId, presentationEvidenceReference: 'synthetic:presentation:1', instructions: 'forbidden' } }), 'UNSUPPORTED_GUIDANCE_SELECTION_FIELD');
});

test('diagnostics, repair instructions, publication, notification, and operation authorization remain blocked', () => {
  const f = makeFoundation();
  expectCode(() => f.technicalGuidance.emitDiagnosticOutput(), 'AUTONOMOUS_DIAGNOSTIC_FORBIDDEN');
  expectCode(() => f.technicalGuidance.emitRepairInstructions(), 'INVENTED_REPAIR_INSTRUCTIONS_FORBIDDEN');
  expectCode(() => f.technicalGuidance.publishResource(), 'CUSTOMER_ACTIVATION_DISABLED');
  expectCode(() => f.technicalGuidance.notifyCustomer(), 'CUSTOMER_ACTIVATION_DISABLED');
  expectCode(() => f.technicalGuidance.authorizeMachineOperation(), 'MACHINE_OPERATION_AUTHORIZATION_FORBIDDEN');
});

test('guidance never closes support case or invokes external providers', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  const selected = selectGuidance(f, requestGuidance(f, support));
  const currentCase = f.supportIntake.getPrivateCase({ actor: operator, caseReference: selected.data.caseReference });
  assert.notEqual(currentCase.state, 'CLOSED');
  assert.equal(selected.data.supportCaseClosed, false);
  assert.equal(f.transport.calls.length, 0);
});

test('withdrawal preserves prior selections and is terminal', () => {
  const f = makeFoundation();
  let guidance = selectGuidance(f, requestGuidance(f, createSupport(f)));
  guidance = f.technicalGuidance.withdraw({ actor: operator, commandId: 'withdraw', guidanceId: guidance.data.guidanceId, expectedVersion: guidance.version, reason: 'SYNTHETIC_REQUEST_WITHDRAWN' });
  assert.equal(guidance.state, 'WITHDRAWN_OR_SUPERSEDED');
  assert.equal(guidance.data.selections.length, 1);
  expectCode(() => f.technicalGuidance.requestResourceRevision({ actor: operator, commandId: 'after-terminal', guidanceId: guidance.data.guidanceId, expectedVersion: guidance.version, reason: 'SYNTHETIC_INVALID_POST_TERMINAL', evidenceRefs: ['synthetic:terminal:evidence'] }), 'UNAUTHORIZED_TECHNICAL_GUIDANCE_TRANSITION');
});

test('synthetic components cannot be used outside explicit test mode', () => {
  expectCode(() => makeFoundation({ testMode: false }), 'SYNTHETIC_AUTHORITY_FORBIDDEN');
});

test('activation snapshot retains all operational prohibitions', () => {
  const f = makeFoundation();
  const snapshot = f.technicalGuidance.activationSnapshot();
  assert.equal(snapshot.customerActivationPermitted, false);
  assert.equal(snapshot.resourcePublicationPermitted, false);
  assert.equal(snapshot.autonomousDiagnosisPermitted, false);
  assert.equal(snapshot.blockers.length, 8);
});

for (const { name, run } of tests) {
  try { run(); }
  catch (error) { error.message = `B05 test failed: ${name}: ${error.message}`; throw error; }
}

console.log(`Epic L Policy 2.0 B05 domain scenarios passed: ${tests.length}/${tests.length}`);
console.log(`Rejected invalid B05 operations: ${rejectedInvalidOperations}`);
console.log('External provider calls: 0; customer guidance deliveries: 0; published resources: 0.');

module.exports = { domainScenarios: tests.length, rejectedInvalidOperations };
