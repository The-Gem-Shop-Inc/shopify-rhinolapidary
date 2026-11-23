'use strict';

const assert = require('node:assert/strict');
const {
  SyntheticNotificationTransport,
  SyntheticWarrantyAuthorityResolver,
  UnresolvedWarrantyAuthorityResolver,
  createB01Foundation,
} = require('./lib/epic-l-policy2');

const PRODUCT_GID = 'gid://shopify/Product/710000000001';
const VARIANT_GID = 'gid://shopify/ProductVariant/810000000001';
const CUSTOMER_A = 'cus_synthetic_warranty_customer_a';
const CUSTOMER_B = 'cus_synthetic_warranty_customer_b';
const DESTINATION_A = 'dst_synthetic_warranty_destination_a';
const REVIEWER_REFERENCE = 'auth_syn_warranty_reviewer_0001';
const AUTHORITY_SCOPE = 'SYNTHETIC_POLICY2_MACHINE_REVIEW';

const customerA = {
  actorId: 'SYNTHETIC_WARRANTY_CUSTOMER_A', customerReference: CUSTOMER_A,
  permissions: ['SUPPORT_INTAKE_CREATE', 'SUPPORT_CASE_READ_OWN', 'REGISTRATION_CREATE', 'REGISTRATION_READ_OWN'],
};
const customerB = {
  actorId: 'SYNTHETIC_WARRANTY_CUSTOMER_B', customerReference: CUSTOMER_B,
  permissions: ['SUPPORT_INTAKE_CREATE', 'SUPPORT_CASE_READ_OWN', 'WARRANTY_REVIEW_PRIVATE_READ'],
};
const preparer = {
  actorId: 'SYNTHETIC_EVIDENCE_PREPARER',
  permissions: ['SUPPORT_CASE_PRIVATE_READ', 'WARRANTY_REVIEW_REQUEST', 'WARRANTY_REVIEW_PRIVATE_READ', 'WARRANTY_EVIDENCE_PREPARE', 'WARRANTY_REVIEW_RECONSIDER', 'WARRANTY_REVIEW_SUPERSEDE'],
};
const reviewer = {
  actorId: 'SYNTHETIC_WARRANTY_REVIEWER',
  permissions: ['SUPPORT_CASE_PRIVATE_READ', 'WARRANTY_REVIEW_PRIVATE_READ', 'WARRANTY_REVIEW_CONDUCT'],
};
const spoofingReviewer = {
  actorId: 'SYNTHETIC_SPOOFING_REVIEWER',
  permissions: ['SUPPORT_CASE_PRIVATE_READ', 'WARRANTY_REVIEW_PRIVATE_READ', 'WARRANTY_REVIEW_CONDUCT'],
};
const supportOperator = {
  actorId: 'SYNTHETIC_SUPPORT_OPERATOR',
  permissions: ['SUPPORT_CASE_PRIVATE_READ', 'WARRANTY_REVIEW_PRIVATE_READ'],
};
const unauthorized = { actorId: 'SYNTHETIC_UNAUTHORIZED', permissions: [] };
const systemActor = {
  actorId: 'B04_SYNTHETIC_PRIVATE_SYSTEM',
  permissions: [
    'PRIVATE_RECORD_CREATE', 'PRIVATE_RECORD_READ', 'PRIVATE_RECORD_UPDATE', 'PRIVATE_AUDIT_READ',
    'NOTIFICATION_QUEUE', 'NOTIFICATION_ATTEMPT', 'NOTIFICATION_RECOVERY', 'NOTIFICATION_RECONCILE',
    'SUPPORT_CASE_CREATE', 'SAFETY_INTERRUPT', 'SAFETY_DISPOSITION',
  ],
};

function deterministicClock() {
  let tick = 0;
  return () => new Date(Date.UTC(2026, 10, 23, 18, 0, tick++)).toISOString();
}

function deterministicFactory(prefix) {
  let sequence = 0;
  return () => `${prefix}${String(++sequence).padStart(24, '0')}`;
}

function authorityGrant(overrides = {}) {
  return {
    reviewerIdentityReference: REVIEWER_REFERENCE,
    actorId: reviewer.actorId,
    authorityRole: 'HUMAN_WARRANTY_REVIEWER',
    authorityScopes: [AUTHORITY_SCOPE],
    assessmentTypes: [
      'SYNTHETIC_SUPPORTABILITY_ASSESSMENT',
      'SYNTHETIC_NON_SUPPORTABILITY_ASSESSMENT',
      'SYNTHETIC_FURTHER_EVIDENCE_ASSESSMENT',
    ],
    authorizationEvidenceReference: 'synthetic:authority:warranty-reviewer:1',
    authorizedFrom: '2026-11-01T00:00:00.000Z',
    authorizedTo: '2026-12-31T23:59:59.999Z',
    ...overrides,
  };
}

function makeFoundation({ authorityResolver = new SyntheticWarrantyAuthorityResolver([authorityGrant()]), notificationOutcomes = [], testMode = true } = {}) {
  const transport = new SyntheticNotificationTransport(notificationOutcomes);
  const foundation = createB01Foundation({
    catalogEntries: [{ productGid: PRODUCT_GID, variantGid: VARIANT_GID }],
    transport,
    clock: deterministicClock(),
    identifiers: {
      recordId: deterministicFactory('rec_'), publicReference: deterministicFactory('ref_'), auditId: deterministicFactory('aud_'),
      notificationId: deterministicFactory('ntf_'), attemptId: deterministicFactory('att_'), resourceId: deterministicFactory('res_'),
      revisionId: deterministicFactory('rev_'), resourceAuditId: deterministicFactory('raud_'), domainEventId: deterministicFactory('evt_'),
      registrationId: deterministicFactory('reg_'), acknowledgementEventId: deterministicFactory('ack_'), duplicateReviewId: deterministicFactory('dup_'),
      supportCaseReference: deterministicFactory('case_'), supportAcknowledgementEventId: deterministicFactory('sack_'), supportRoutingAttemptId: deterministicFactory('routeatt_'),
      warrantyReviewId: deterministicFactory('wreview_'), warrantyAssessmentId: deterministicFactory('wassess_'),
    },
    systemActor,
    warrantyAuthorityResolver: authorityResolver,
    testMode,
    rootDir: process.cwd(),
  });
  return { ...foundation, transport };
}

function supportInput(overrides = {}) {
  return {
    customerReference: CUSTOMER_A,
    notificationDestinationReference: DESTINATION_A,
    category: 'WARRANTY_DECISION',
    sourceChannel: 'SYNTHETIC_WEB_FORM',
    productGid: PRODUCT_GID,
    variantGid: VARIANT_GID,
    productVersion: 'MACHINE-V1',
    issueSummary: 'SYNTHETIC_WARRANTY_REVIEW_REQUEST',
    evidenceRefs: ['synthetic:support:warranty-request'],
    safetyDisclosure: 'NO_HAZARD_REPORTED',
    ...overrides,
  };
}

function createSupport(foundation, commandId = 'support-case-1', overrides = {}, actor = customerA) {
  return foundation.supportIntake.createCase({ actor, commandId, input: supportInput(overrides) }).case;
}

function policyEvidence(overrides = {}) {
  return {
    policyId: 'POLICY2_SYNTHETIC_TEST',
    policyVersion: '2.0-synthetic-test',
    effectiveFrom: '2026-01-01T00:00:00.000Z',
    effectiveTo: '2026-12-31T23:59:59.999Z',
    applicabilityEventAt: '2026-11-20T12:00:00.000Z',
    applicabilityEvidenceRefs: ['synthetic:policy:applicability'],
    customerCopyApproved: true,
    customerCopyApprovalEvidenceRefs: ['synthetic:policy:copy-approval'],
    legalLanguageApproved: true,
    legalApprovalEvidenceRefs: ['synthetic:policy:legal-approval'],
    provenanceResolved: true,
    provenanceEvidenceRefs: ['synthetic:policy:provenance'],
    historicalPolicy: false,
    syntheticFixture: true,
    ...overrides,
  };
}

function coverageEvidence(overrides = {}) {
  return {
    productGid: PRODUCT_GID,
    variantGid: VARIANT_GID,
    coverageDisposition: 'MACHINE',
    classificationApproved: true,
    businessApproved: true,
    legalApproved: true,
    businessApprovalEvidenceRefs: ['synthetic:coverage:business-approval'],
    legalApprovalEvidenceRefs: ['synthetic:coverage:legal-approval'],
    manufacturingSourceStatus: 'VERIFIED',
    manufacturingSourceEvidenceRefs: ['synthetic:manufacturer:source'],
    manufacturerObligationStatus: 'EVIDENCED',
    manufacturerObligationEvidenceRefs: ['synthetic:manufacturer:obligation'],
    authorityBasisSignals: [],
    observedTechnicalClass: 'machine',
    observedPublicationStatus: 'ACTIVE',
    syntheticFixture: true,
    ...overrides,
  };
}

function obligationEvidence(overrides = {}) {
  return {
    manufacturerObligationsDistinct: true,
    rhinoVoluntaryObligationsDistinct: true,
    legallyRequiredProtectionsDistinct: true,
    evidenceRefs: ['synthetic:obligations:boundaries'],
    ...overrides,
  };
}

function reviewPacket(overrides = {}) {
  return {
    decisionType: 'INITIAL_WARRANTY_REVIEW',
    requestedReviewerIdentityReference: REVIEWER_REFERENCE,
    authorityRole: 'HUMAN_WARRANTY_REVIEWER',
    authorityScope: AUTHORITY_SCOPE,
    machineIdentity: { productGid: PRODUCT_GID, variantGid: VARIANT_GID, productVersion: 'MACHINE-V1' },
    policyEvidence: policyEvidence(),
    coverageEvidence: coverageEvidence(),
    ownershipEvidenceRefs: ['synthetic:ownership:evidence'],
    purchaseEvidenceRefs: ['synthetic:purchase:evidence'],
    supportingEvidenceRefs: ['synthetic:review:supporting-evidence', 'synthetic:assessment:evidence'],
    obligationEvidence: obligationEvidence(),
    ...overrides,
  };
}

function requestReview(foundation, caseReference, commandId = 'review-request-1', packet = reviewPacket(), actor = preparer) {
  return foundation.warrantyReview.requestReview({ actor, commandId, caseReference, packet });
}

function getReview(foundation, reviewId, actor = preparer) {
  return foundation.warrantyReview.getPrivateReview({ actor, reviewId });
}

function readyReview(foundation, id = 'ready-review') {
  const support = createSupport(foundation, `${id}:support`);
  const review = requestReview(foundation, support.data.syntheticFacts.supportIntake.caseReference, `${id}:request`);
  assert.equal(review.state, 'READY_FOR_HUMAN_REVIEW');
  return { support, review };
}

function startReview(foundation, review) {
  return foundation.warrantyReview.startHumanReview({ actor: reviewer, commandId: `${review.data.reviewId}:start`, reviewId: review.data.reviewId, expectedVersion: review.version });
}

function supportiveAssessment() {
  return {
    assessmentType: 'SYNTHETIC_SUPPORTABILITY_ASSESSMENT',
    conclusion: 'SUPPORTABLE_IN_ISOLATED_TEST_CONTEXT',
    reasoningCode: 'SYNTHETIC_EVIDENCE_SUPPORTS_TEST_ASSESSMENT',
    supportingEvidenceRefs: ['synthetic:assessment:evidence'],
  };
}

let rejectedInvalidOperations = 0;
function expectCode(fn, code) {
  assert.throws(fn, (error) => error && error.code === code, `Expected error code ${code}`);
  rejectedInvalidOperations += 1;
}

const tests = [];
function test(name, run) { tests.push({ name, run }); }

test('normal authority resolver defaults to unresolved deny', () => {
  const f = makeFoundation({ authorityResolver: new UnresolvedWarrantyAuthorityResolver() });
  const support = createSupport(f);
  const review = requestReview(f, support.data.syntheticFacts.supportIntake.caseReference);
  assert.equal(review.state, 'AUTHORITY_UNRESOLVED');
  assert.equal(review.data.authorityResolution.operationalAuthorityVerified, false);
});

test('valid isolated synthetic review request reaches ready without customer authority', () => {
  const f = makeFoundation();
  const { review } = readyReview(f);
  assert.equal(review.data.customerEffect, false);
  assert.equal(review.data.warrantyFindingIssued, false);
  assert.equal(review.category, 'APPROVAL_EVIDENCE');
});

test('duplicate review request is idempotent and conflicting command reuse is rejected', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  const caseReference = support.data.syntheticFacts.supportIntake.caseReference;
  const first = requestReview(f, caseReference, 'review-idempotent');
  const repeat = requestReview(f, caseReference, 'review-idempotent');
  assert.deepEqual(repeat, first);
  expectCode(() => requestReview(f, caseReference, 'review-idempotent', reviewPacket({ decisionType: 'RECONSIDERATION_REVIEW' })), 'IDEMPOTENCY_KEY_REUSE');
});

test('unauthenticated and unauthorized review requests are rejected', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  const caseReference = support.data.syntheticFacts.supportIntake.caseReference;
  expectCode(() => requestReview(f, caseReference, 'no-actor', reviewPacket(), null), 'AUTHORIZATION_REQUIRED');
  expectCode(() => requestReview(f, caseReference, 'no-permission', reviewPacket(), unauthorized), 'AUTHORIZATION_REQUIRED');
});

test('unknown review decision types and real contact data fail closed', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  const caseReference = support.data.syntheticFacts.supportIntake.caseReference;
  expectCode(() => requestReview(f, caseReference, 'bad-type', reviewPacket({ decisionType: 'WARRANTY_APPROVED' })), 'UNKNOWN_WARRANTY_REVIEW_DECISION_TYPE');
  expectCode(() => requestReview(f, caseReference, 'real-data', reviewPacket({ supportingEvidenceRefs: ['synthetic:customer:555-555-1212'] })), 'REAL_CUSTOMER_DATA_FORBIDDEN');
});

test('reviewer permission and verified authority are separate controls', () => {
  const f = makeFoundation();
  const { review } = readyReview(f);
  expectCode(() => f.warrantyReview.startHumanReview({ actor: preparer, commandId: 'preparer-start', reviewId: review.data.reviewId, expectedVersion: review.version }), 'AUTHORIZATION_REQUIRED');
});

test('reviewer identity spoofing is rejected by the synthetic authority boundary', () => {
  const f = makeFoundation();
  const { review } = readyReview(f);
  expectCode(() => f.warrantyReview.startHumanReview({ actor: spoofingReviewer, commandId: 'spoof-start', reviewId: review.data.reviewId, expectedVersion: review.version }), 'REVIEWER_IDENTITY_SPOOFING_REJECTED');
});

test('expired, out-of-scope, role-mismatched, and missing-evidence authority grants reject', () => {
  const expired = new SyntheticWarrantyAuthorityResolver([authorityGrant({ authorizedTo: '2026-11-01T00:00:00.000Z' })]);
  expectCode(() => expired.authorizeReviewer({ actor: reviewer, reviewerIdentityReference: REVIEWER_REFERENCE, authorityRole: 'HUMAN_WARRANTY_REVIEWER', authorityScope: AUTHORITY_SCOPE, at: '2026-11-23T00:00:00.000Z' }), 'WARRANTY_AUTHORITY_EXPIRED');
  const scoped = new SyntheticWarrantyAuthorityResolver([authorityGrant()]);
  expectCode(() => scoped.authorizeReviewer({ actor: reviewer, reviewerIdentityReference: REVIEWER_REFERENCE, authorityRole: 'HUMAN_WARRANTY_REVIEWER', authorityScope: 'SYNTHETIC_OTHER_SCOPE', at: '2026-11-23T00:00:00.000Z' }), 'WARRANTY_AUTHORITY_OUT_OF_SCOPE');
  expectCode(() => scoped.authorizeReviewer({ actor: reviewer, reviewerIdentityReference: REVIEWER_REFERENCE, authorityRole: 'POLICY_AUTHORITY', authorityScope: AUTHORITY_SCOPE, at: '2026-11-23T00:00:00.000Z' }), 'WARRANTY_AUTHORITY_ROLE_MISMATCH');
  const noEvidence = new SyntheticWarrantyAuthorityResolver([authorityGrant({ authorizationEvidenceReference: null })]);
  expectCode(() => noEvidence.authorizeReviewer({ actor: reviewer, reviewerIdentityReference: REVIEWER_REFERENCE, authorityRole: 'HUMAN_WARRANTY_REVIEWER', authorityScope: AUTHORITY_SCOPE, at: '2026-11-23T00:00:00.000Z' }), 'WARRANTY_AUTHORIZATION_EVIDENCE_MISSING');
});

test('historical warranty evidence never authorizes Policy 2.0', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  const policy = policyEvidence({ policyId: 'HISTORICAL_WARRANTY', historicalPolicy: true });
  const review = requestReview(f, support.data.syntheticFacts.supportIntake.caseReference, 'historical-policy', reviewPacket({ policyEvidence: policy }));
  assert.equal(review.state, 'POLICY_APPLICABILITY_UNRESOLVED');
  assert.ok(review.data.missingEvidence.includes('HISTORICAL_POLICY_NOT_POLICY2_AUTHORITY'));
});

test('missing policy dates and applicability evidence remain unresolved', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  const policy = policyEvidence({ effectiveFrom: null, effectiveTo: null, applicabilityEventAt: null, applicabilityEvidenceRefs: [] });
  const review = requestReview(f, support.data.syntheticFacts.supportIntake.caseReference, 'missing-dates', reviewPacket({ policyEvidence: policy }));
  assert.equal(review.state, 'POLICY_APPLICABILITY_UNRESOLVED');
  assert.ok(review.data.missingEvidence.includes('POLICY_EFFECTIVE_PERIOD_NOT_APPROVED'));
});

test('unapproved customer language and unresolved provenance block applicability', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  const policy = policyEvidence({ customerCopyApproved: false, customerCopyApprovalEvidenceRefs: [], provenanceResolved: false, provenanceEvidenceRefs: [] });
  const review = requestReview(f, support.data.syntheticFacts.supportIntake.caseReference, 'copy-blocked', reviewPacket({ policyEvidence: policy }));
  assert.equal(review.state, 'POLICY_APPLICABILITY_UNRESOLVED');
  assert.ok(review.data.missingEvidence.includes('CUSTOMER_POLICY_COPY_NOT_APPROVED'));
  assert.ok(review.data.missingEvidence.includes('POLICY_PROVENANCE_UNRESOLVED'));
});

test('unverified Product coverage blocks readiness without customer exclusion', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  const coverage = coverageEvidence({ classificationApproved: false, businessApproved: false, legalApproved: false, businessApprovalEvidenceRefs: [], legalApprovalEvidenceRefs: [] });
  const review = requestReview(f, support.data.syntheticFacts.supportIntake.caseReference, 'coverage-unresolved', reviewPacket({ coverageEvidence: coverage }));
  assert.equal(review.state, 'COVERAGE_UNRESOLVED');
  assert.equal(review.data.warrantyFindingIssued, false);
});

test('technical, vendor, publication, registration, title, and compatibility signals cannot confer coverage', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  const caseReference = support.data.syntheticFacts.supportIntake.caseReference;
  for (const signal of ['SHOPIFY_VENDOR', 'SHOPIFY_PRODUCT_TYPE', 'TECHNICAL_PRODUCT_CLASS', 'PRODUCT_TITLE', 'PUBLICATION_STATUS', 'REGISTRATION_COMPLETION', 'OWNERSHIP_VERIFICATION_ONLY', 'TENTATIVE_COMPONENT_CLASSIFICATION', 'CATALOG_COMPATIBILITY']) {
    expectCode(() => requestReview(f, caseReference, `signal-${signal}`, reviewPacket({ coverageEvidence: coverageEvidence({ authorityBasisSignals: [signal] }) })), 'PROHIBITED_COVERAGE_AUTHORITY_SIGNAL');
  }
});

test('Draft publication observation does not automatically exclude legal protection', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  const review = requestReview(f, support.data.syntheticFacts.supportIntake.caseReference, 'draft-observation', reviewPacket({ coverageEvidence: coverageEvidence({ observedPublicationStatus: 'DRAFT' }) }));
  assert.equal(review.state, 'READY_FOR_HUMAN_REVIEW');
  assert.equal(review.data.customerEffect, false);
});

test('manufacturer, Rhino voluntary, and legal obligations must remain distinct', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  const review = requestReview(f, support.data.syntheticFacts.supportIntake.caseReference, 'obligation-boundary', reviewPacket({ obligationEvidence: obligationEvidence({ manufacturerObligationsDistinct: false }) }));
  assert.equal(review.state, 'COVERAGE_UNRESOLVED');
  assert.ok(review.data.missingEvidence.includes('MANUFACTURER_OBLIGATION_BOUNDARY_UNRESOLVED'));
});

test('optional registration context never creates eligibility or coverage', () => {
  const f = makeFoundation();
  const registration = f.registration.createRegistration({ actor: customerA, commandId: 'registration-for-review', input: {
    customerReference: CUSTOMER_A, notificationDestinationReference: DESTINATION_A, productGid: PRODUCT_GID, variantGid: VARIANT_GID,
    productVersion: 'MACHINE-V1', policyVersion: 'POLICY2_DRAFT', firstUseDeclaration: { state: 'UNKNOWN' },
  } }).registration;
  const support = createSupport(f, 'support-with-registration', { registrationId: registration.data.registrationId });
  const coverage = coverageEvidence({ classificationApproved: false, businessApproved: false, legalApproved: false, businessApprovalEvidenceRefs: [], legalApprovalEvidenceRefs: [] });
  const review = requestReview(f, support.data.syntheticFacts.supportIntake.caseReference, 'registration-not-authority', reviewPacket({ coverageEvidence: coverage }));
  assert.equal(review.state, 'COVERAGE_UNRESOLVED');
  assert.equal(review.data.registrationContext.registrationCompletedConfersEligibility, false);
  assert.equal(review.data.registrationContext.ownershipVerificationConfersCoverage, false);
});

test('missing supporting evidence produces EVIDENCE_INCOMPLETE', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  const review = requestReview(f, support.data.syntheticFacts.supportIntake.caseReference, 'missing-evidence', reviewPacket({ supportingEvidenceRefs: [] }));
  assert.equal(review.state, 'EVIDENCE_INCOMPLETE');
});

test('evidence correction uses optimistic concurrency and preserves prior revision', () => {
  const f = makeFoundation();
  const support = createSupport(f);
  let review = requestReview(f, support.data.syntheticFacts.supportIntake.caseReference, 'correct-evidence', reviewPacket({ policyEvidence: policyEvidence({ effectiveFrom: null, effectiveTo: null }) }));
  expectCode(() => f.warrantyReview.addEvidenceRevision({ actor: preparer, commandId: 'wrong-version', reviewId: review.data.reviewId, expectedVersion: review.version + 1, reason: 'SYNTHETIC_POLICY_EVIDENCE_CORRECTION', evidencePatch: { policyEvidence: policyEvidence() } }), 'RECORD_VERSION_CONFLICT');
  review = f.warrantyReview.addEvidenceRevision({ actor: preparer, commandId: 'correct-version', reviewId: review.data.reviewId, expectedVersion: review.version, reason: 'SYNTHETIC_POLICY_EVIDENCE_CORRECTION', evidencePatch: { policyEvidence: policyEvidence() } });
  assert.equal(review.state, 'READY_FOR_HUMAN_REVIEW');
  assert.equal(review.data.evidenceRevisions.length, 2);
  assert.equal(review.data.evidenceRevisions[0].packet.policyEvidence.effectiveFrom, null);
});

test('unknown or unauthorized lifecycle transitions fail closed', () => {
  const f = makeFoundation();
  expectCode(() => f.warrantyReview.assertTransition('UNKNOWN_STATE', 'READY_FOR_HUMAN_REVIEW'), 'UNKNOWN_WARRANTY_REVIEW_STATE');
  expectCode(() => f.warrantyReview.assertTransition('READY_FOR_HUMAN_REVIEW', 'SYNTHETIC_ASSESSMENT_RECORDED'), 'UNAUTHORIZED_WARRANTY_REVIEW_TRANSITION');
});

test('authorized synthetic reviewer records assessment with no customer effect', () => {
  const f = makeFoundation();
  const { review } = readyReview(f, 'assessment');
  const underway = startReview(f, review);
  const assessed = f.warrantyReview.recordSyntheticAssessment({ actor: reviewer, commandId: 'assessment-record', reviewId: review.data.reviewId, expectedVersion: underway.version, assessment: supportiveAssessment() });
  assert.equal(assessed.state, 'SYNTHETIC_ASSESSMENT_RECORDED');
  assert.equal(assessed.data.syntheticAssessments[0].approvalStatus, 'SYNTHETIC_ASSESSMENT_ONLY');
  assert.equal(assessed.data.operationalDecision, null);
  assert.equal(assessed.data.customerEffect, false);
});

test('unknown assessment types and invented remedies fail closed', () => {
  const f = makeFoundation();
  const { review } = readyReview(f, 'bad-assessment');
  const underway = startReview(f, review);
  expectCode(() => f.warrantyReview.recordSyntheticAssessment({ actor: reviewer, commandId: 'unknown-assessment', reviewId: review.data.reviewId, expectedVersion: underway.version, assessment: { ...supportiveAssessment(), assessmentType: 'WARRANTY_APPROVED' } }), 'UNKNOWN_SYNTHETIC_ASSESSMENT_TYPE');
  expectCode(() => f.warrantyReview.recordSyntheticAssessment({ actor: reviewer, commandId: 'invented-remedy', reviewId: review.data.reviewId, expectedVersion: underway.version, assessment: { ...supportiveAssessment(), remedy: 'REPLACEMENT' } }), 'UNSUPPORTED_SYNTHETIC_ASSESSMENT_FIELD');
  expectCode(() => f.warrantyReview.recordSyntheticAssessment({ actor: reviewer, commandId: 'unpreserved-evidence', reviewId: review.data.reviewId, expectedVersion: underway.version, assessment: { ...supportiveAssessment(), supportingEvidenceRefs: ['synthetic:assessment:not-in-packet'] } }), 'ASSESSMENT_EVIDENCE_NOT_IN_REVIEW_PACKET');
});

test('reconsideration preserves earlier synthetic assessment and audit history', () => {
  const f = makeFoundation();
  const { review } = readyReview(f, 'reconsider');
  const underway = startReview(f, review);
  let assessed = f.warrantyReview.recordSyntheticAssessment({ actor: reviewer, commandId: 'reconsider-assessment', reviewId: review.data.reviewId, expectedVersion: underway.version, assessment: supportiveAssessment() });
  assessed = f.warrantyReview.requestReconsideration({ actor: preparer, commandId: 'reconsider-request', reviewId: review.data.reviewId, expectedVersion: assessed.version, reason: 'SYNTHETIC_CONFLICTING_EVIDENCE_IDENTIFIED', evidenceRefs: ['synthetic:reconsideration:conflict'] });
  assert.equal(assessed.state, 'FURTHER_EVIDENCE_REQUIRED');
  assert.equal(assessed.data.syntheticAssessments.length, 1);
  assert.equal(assessed.data.reconsiderations[0].previousAssessmentId, assessed.data.syntheticAssessments[0].assessmentId);
  assert.ok(f.warrantyReview.auditTrail({ actor: preparer, reviewId: review.data.reviewId }).some((event) => event.eventType === 'WARRANTY_REVIEW_RECONSIDERATION_REQUESTED'));
});

test('supersession preserves prior assessment and records reason', () => {
  const f = makeFoundation();
  const { review } = readyReview(f, 'supersede');
  const underway = startReview(f, review);
  let assessed = f.warrantyReview.recordSyntheticAssessment({ actor: reviewer, commandId: 'supersede-assessment', reviewId: review.data.reviewId, expectedVersion: underway.version, assessment: supportiveAssessment() });
  assessed = f.warrantyReview.supersedeReview({ actor: preparer, commandId: 'supersede-review', reviewId: review.data.reviewId, expectedVersion: assessed.version, reason: 'SYNTHETIC_REPLACED_BY_CORRECTED_REVIEW' });
  assert.equal(assessed.state, 'REVIEW_WITHDRAWN_OR_SUPERSEDED');
  assert.equal(assessed.data.syntheticAssessments.length, 1);
  assert.equal(assessed.data.supersession.reason, 'SYNTHETIC_REPLACED_BY_CORRECTED_REVIEW');
});

test('non-warranty support categories require an explicit auditable referral', () => {
  const f = makeFoundation();
  const support = createSupport(f, 'parts-support', { category: 'PARTS_QUESTION' });
  const caseReference = support.data.syntheticFacts.supportIntake.caseReference;
  expectCode(() => requestReview(f, caseReference, 'parts-no-referral'), 'EXPLICIT_WARRANTY_REVIEW_REFERRAL_REQUIRED');
  const packet = reviewPacket({ decisionType: 'REFERRED_WARRANTY_REVIEW', explicitReferral: { requested: true, reason: 'SYNTHETIC_WARRANTY_QUESTION_IDENTIFIED', evidenceReference: 'synthetic:referral:evidence' } });
  const review = requestReview(f, caseReference, 'parts-referral', packet);
  assert.equal(review.data.supportCategory, 'PARTS_QUESTION');
});

test('cross-customer review access is rejected and case reference is not a credential', () => {
  const f = makeFoundation();
  const { review } = readyReview(f, 'privacy');
  expectCode(() => getReview(f, review.data.reviewId, customerB), 'WARRANTY_REVIEW_ACCESS_DENIED');
  expectCode(() => getReview(f, review.data.reviewId, unauthorized), 'WARRANTY_REVIEW_ACCESS_DENIED');
});

test('public review handle exposes no evidence, reviewer identity, or potential outcome', () => {
  const f = makeFoundation();
  const { review } = readyReview(f, 'public');
  const handle = f.warrantyReview.getPublicHandle(review.data.reviewId);
  const text = JSON.stringify(handle);
  assert.equal(text.includes('synthetic:'), false);
  assert.equal(text.includes(REVIEWER_REFERENCE), false);
  assert.equal(text.includes(PRODUCT_GID), false);
  assert.equal(handle.customerDecisionIssued, false);
});

test('active safety hold created before request blocks review readiness', () => {
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'CONFIRMED', evidence: { providerReceipt: 'synthetic:warning:confirmed' } }] });
  const support = createSupport(f, 'hazard-before-review', { safetyDisclosure: 'EXPLICIT_HAZARD', hazardEvidenceRef: 'synthetic:hazard:smoke' });
  const review = requestReview(f, support.data.syntheticFacts.supportIntake.caseReference, 'hazard-review');
  assert.equal(review.state, 'REVIEW_BLOCKED');
  assert.ok(review.data.missingEvidence.includes('ACTIVE_SAFETY_HOLD'));
});

test('safety interruption after request blocks starting review and cannot be cleared by B04', () => {
  const f = makeFoundation({ notificationOutcomes: [{ outcome: 'FAILED', reasonCode: 'SYNTHETIC_WARNING_FAILURE' }] });
  const { support, review } = readyReview(f, 'hazard-after-request');
  const held = f.safety.interruptForHazard({ actor: systemActor, commandId: 'late-hazard', caseRecordId: support.recordId, expectedVersion: support.version, hazard: { reportedAt: '2026-11-23T19:00:00.000Z', sourceChannel: 'SYNTHETIC_INTERNAL', reportedSymptoms: 'synthetic:hazard:late' } });
  assert.equal(held.caseRecord.state, 'SAFETY_HOLD');
  assert.ok(held.caseRecord.data.unresolvedNotificationIds.length > 0);
  expectCode(() => f.warrantyReview.startHumanReview({ actor: reviewer, commandId: 'start-on-hold', reviewId: review.data.reviewId, expectedVersion: review.version }), 'ACTIVE_SAFETY_HOLD');
  assert.equal(getReview(f, review.data.reviewId).state, 'READY_FOR_HUMAN_REVIEW');
});

test('simulated assessment does not close or resolve support case and sends no notification', () => {
  const f = makeFoundation();
  const { support, review } = readyReview(f, 'no-side-effects');
  const underway = startReview(f, review);
  f.warrantyReview.recordSyntheticAssessment({ actor: reviewer, commandId: 'no-side-effect-assessment', reviewId: review.data.reviewId, expectedVersion: underway.version, assessment: supportiveAssessment() });
  const supportAfter = f.supportIntake.getPrivateCase({ actor: supportOperator, caseReference: support.data.syntheticFacts.supportIntake.caseReference });
  assert.equal(supportAfter.state, 'SUBMITTED');
  assert.equal(supportAfter.data.syntheticFacts.supportIntake.classification.warrantyFinding, 'NOT_PERFORMED');
  assert.equal(supportAfter.data.rhinoCaseOwnershipRetained, true);
  assert.equal(supportAfter.data.rhinoCommunicationResponsibilityRetained, true);
  assert.equal(f.transport.calls.length, 0);
});

test('manufacturer evidence does not grant Silica-Gem Rhino or legal decision authority', () => {
  const f = makeFoundation();
  const { review } = readyReview(f, 'manufacturer-boundary');
  assert.equal(review.data.obligationEvidence.manufacturerObligationsDistinct, true);
  assert.equal(review.data.obligationEvidence.rhinoVoluntaryObligationsDistinct, true);
  assert.equal(f.warrantyReview.contract.obligationBoundaries.silicaGemAuthorityOverRhinoOrLegalObligations, false);
});

test('operational decision and customer notification gates reject even in test mode', () => {
  const f = makeFoundation();
  expectCode(() => f.warrantyReview.issueOperationalDecision(), 'OPERATIONAL_WARRANTY_DECISION_BLOCKED');
  expectCode(() => f.warrantyReview.notifyCustomerDecision(), 'CUSTOMER_WARRANTY_NOTIFICATION_BLOCKED');
  const gate = f.warrantyReview.issuanceGateSnapshot();
  assert.equal(gate.operationalDecisionAllowed, false);
  assert.equal(gate.customerNotificationAllowed, false);
  assert.equal(gate.testModeMayBypass, false);
  assert.equal(gate.blockers.length, 8);
});

test('synthetic authority resolver cannot be used outside explicit test mode', () => {
  expectCode(() => makeFoundation({ testMode: false }), 'SYNTHETIC_AUTHORITY_FORBIDDEN');
});

test('real coverage matrix remains 78 under review and zero promise authorizations', () => {
  const f = makeFoundation();
  assert.equal(f.warrantyReview.coverageMatrix.activeProductApprovalRegister.length, 78);
  assert.equal(f.warrantyReview.coverageMatrix.activeProductApprovalRegister.filter((row) => row.customerPromiseAuthorized).length, 0);
});

test('contract retains all 47 explicit transitions and unknown state behavior fails closed', () => {
  const f = makeFoundation();
  assert.equal(f.warrantyReview.contract.transitions.length, 47);
  assert.equal(new Set(f.warrantyReview.contract.transitions.map((transition) => transition.join('->'))).size, 47);
});

for (const { name, run } of tests) {
  try { run(); }
  catch (error) { console.error(`FAIL: ${name}`); throw error; }
}

console.log(`Epic L Policy 2.0 B04 warranty review tests passed: ${tests.length}/${tests.length}`);
console.log(`B04 invalid operations rejected: ${rejectedInvalidOperations}`);
console.log('Review lifecycle: 11 states, 47 explicit transitions; operational issuance and customer notification remain blocked.');
console.log('Coverage: 78/78 Active Products remain under human review; customer promise authorizations: 0.');
