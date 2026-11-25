'use strict';

const assert = require('node:assert/strict');
const {
  clone,
  loadArtifacts,
  readJson,
  validateArtifacts,
  validateTransition
} = require('./validate-epic-l-policy2');

const baseline = loadArtifacts();
const baselineResult = validateArtifacts(baseline);
assert.deepEqual(baselineResult.schemaErrors, [], 'baseline schemas must conform');
assert.deepEqual(baselineResult.governanceErrors, [], 'baseline governance controls must conform');
assert.ok(baselineResult.readinessBlockers.length > 0, 'baseline must remain blocked for business readiness');

const fixtures = readJson('tests/fixtures/epic-l-policy2-negative-fixtures.json');

function mutate(data, mutation) {
  switch (mutation) {
    case 'DELETE_BUSINESS_APPROVAL':
      delete data.decisionReceipt.decisions[0].businessIntentApproval;
      break;
    case 'CONFIRM_UNRESOLVED_PROVENANCE':
      data.decisionReceipt.decisions[0].businessIntentApproval.confirmedAuthority = true;
      break;
    case 'RELEASE_DECISION_COPY_WITHOUT_LEGAL_EVIDENCE':
      data.decisionReceipt.decisions[0].customerFacingLegalApproval.releaseAuthorized = true;
      break;
    case 'APPROVE_COVERAGE_WITHOUT_EVIDENCE': {
      const approval = data.coverage.activeProductApprovalRegister[0].businessApproval;
      approval.status = 'APPROVED';
      approval.approvedBy = 'Product Owner';
      approval.approvedAt = '2026-11-23T12:00:00-06:00';
      approval.evidenceRefs = [];
      break;
    }
    case 'REPLACE_WITH_UNKNOWN_PRODUCT_GID':
      data.coverage.activeProductApprovalRegister[0].productGid = 'gid://shopify/Product/9999999999999';
      break;
    case 'MOVE_VARIANT_TO_WRONG_PRODUCT':
      data.coverage.activeProductApprovalRegister[0].variantGids = [
        data.coverage.activeProductApprovalRegister[1].variantGids[0]
      ];
      break;
    case 'REMOVE_INDEPENDENT_PHYSICAL_EVIDENCE': {
      const row = data.coverage.activeProductApprovalRegister.find((item) => item.coverageProposal.status === 'TENTATIVE');
      row.physicalFunctionAssessment.evidenceRefs = [];
      row.coverageProposal.evidenceRefs = [row.technicalClassificationEvidence.sourceRef];
      break;
    }
    case 'AUTHORIZE_UNAPPROVED_CUSTOMER_PROMISE':
      data.coverage.activeProductApprovalRegister[0].customerPromiseAuthorized = true;
      break;
    case 'RELEASE_EXPIRED_POLICY':
      Object.assign(data.decisionReceipt.policyVersionControl, {
        lifecycleStatus: 'APPROVED',
        applicabilityApproval: 'APPROVED',
        applicableFrom: '2020-01-01T00:00:00Z',
        applicableTo: '2021-01-01T00:00:00Z',
        customerCopyReleaseAuthorized: true,
        approvalEvidenceRefs: ['fixture-approval']
      });
      break;
    case 'ALLOW_DUPLICATE_AUTOMATIC_OVERWRITE':
      data.registration.duplicateHandling.automaticOverwrite = true;
      break;
    case 'USE_READABLE_CUSTOMER_IDENTIFIER':
      data.registration.identifier.kind = 'customer_id_prefixed';
      data.registration.identifier.minimumEntropyBits = 32;
      break;
    case 'MARK_EMPTY_RESOURCE_REGISTRY_READY':
      data.resources.releaseReadiness = 'READY_FOR_CUSTOMER_RELEASE';
      data.resources.customerReleaseGate.releaseAuthorized = true;
      break;
    case 'RELEASE_RESOURCE_WITHOUT_KEVIN_APPROVAL':
      data.resources.releaseReadiness = 'READY_FOR_CUSTOMER_RELEASE';
      data.resources.customerReleaseGate.releaseAuthorized = true;
      data.resources.resourceRegistry.push({
        resourceId: 'fixture-manual',
        category: 'MANUAL',
        revisionId: 'rev-1',
        sourceIdentity: 'fixture',
        applicableProductGids: [data.snapshot.products[0].productGid],
        applicableVariantGids: [data.snapshot.products[0].variants[0].variantGid],
        applicableMachineVersions: ['fixture-version'],
        technicalApprovedBy: null,
        technicalApprovedAt: null,
        approvalEvidence: [],
        releaseStatus: 'APPROVED_CUSTOMER_RELEASE'
      });
      break;
    case 'REMOVE_GUIDANCE_SAFETY_INTERRUPT':
      data.support.stateMachine.globalSafetyInterruption.transitions =
        data.support.stateMachine.globalSafetyInterruption.transitions.filter(
          (transition) => transition.from !== 'GUIDANCE_ACTIVE'
        );
      break;
    case 'REMOVE_REGISTRATION_RETENTION_DEPENDENCY': {
      const pbi = data.backlog.firstOperationalMilestone.find((item) => item.pbiId === 'L-PBI-004');
      pbi.blockingDependencies = pbi.blockingDependencies.filter((id) => id !== 'L-PBI-006');
      break;
    }
    case 'RELEASE_DRAFT_POLICY':
      data.decisionReceipt.policyVersionControl.customerCopyReleaseAuthorized = true;
      break;
    default:
      throw new Error(`Unknown artifact mutation ${mutation}`);
  }
}

function transitionAttempt(mutation) {
  switch (mutation) {
    case 'EXIT_SAFETY_HOLD_WITHOUT_AUTHORIZATION':
      return {from: 'SAFETY_HOLD', to: 'TRIAGED', authorization: null};
    case 'CLOSE_AFTER_NOTIFICATION_FAILURE':
      return {from: 'RESOLVED', to: 'CLOSED', notificationDelivered: false};
    case 'RECOVERY_DURING_ACTIVE_SAFETY_HOLD':
      return {from: 'SAFETY_HOLD', to: 'RECOVERY_REQUIRED', activeSafetyHold: true};
    case 'UNAUTHORIZED_DIRECT_CLOSE':
      return {from: 'TRIAGED', to: 'CLOSED'};
    default:
      throw new Error(`Unknown transition mutation ${mutation}`);
  }
}

for (const scenario of fixtures.scenarios) {
  let errors;
  if (scenario.kind === 'ARTIFACT_MUTATION') {
    const data = clone(baseline);
    mutate(data, scenario.mutation);
    const result = validateArtifacts(data);
    errors = [...result.schemaErrors, ...result.governanceErrors];
  } else {
    errors = validateTransition(baseline.support, transitionAttempt(scenario.mutation));
  }
  assert.ok(
    errors.some((error) => error.code === scenario.expectedError),
    `${scenario.id} must fail with ${scenario.expectedError}; received ${errors.map((error) => error.code).join(', ') || 'no error'}`
  );
}

for (const attempt of fixtures.positiveTransitionCases) {
  assert.deepEqual(
    validateTransition(baseline.support, attempt),
    [],
    `hazard transition ${attempt.from}->${attempt.to} must be governed and accepted`
  );
}

const authorizedExit = {
  from: 'SAFETY_HOLD',
  to: 'TRIAGED',
  authorization: {
    responsibleAuthority: 'fixture-authority',
    authorityRole: 'fixture-role',
    authorityName: 'Kevin',
    authorityBindingStatus: 'VERIFIED_IDENTITY_BINDING',
    authorityEvidenceReference: 'fixture-authority-evidence',
    reason: 'fixture reviewed hazard',
    evidenceRefs: ['fixture-evidence'],
    disposition: 'CLEARED_FOR_GOVERNED_SUPPORT',
    dispositionAt: '2026-11-23T12:00:00-06:00'
  }
};
assert.deepEqual(validateTransition(baseline.support, authorizedExit), [], 'complete authorized safety disposition must be accepted');

console.log(
  `Epic L Policy 2.0 artifact tests passed: ${fixtures.scenarios.length}/${fixtures.scenarios.length} realistic invalid configurations rejected; ` +
  `${fixtures.positiveTransitionCases.length} active-state safety interrupts and one authorized hold exit accepted.`
);
