'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = path.resolve(__dirname, '..');
const AS_OF = Date.parse('2026-11-23T23:59:59Z');
const ARTIFACTS = {
  decisionReceipt: ['data/epic-l-policy2-decision-receipt.json', 'schemas/epic-l-policy2-decision-receipt.schema.json'],
  snapshot: ['data/epic-l-policy2-shopify-product-snapshot-2026-11-23.json', 'schemas/epic-l-policy2-shopify-snapshot.schema.json'],
  coverage: ['data/epic-l-policy2-coverage-matrix.json', 'schemas/epic-l-policy2-coverage.schema.json'],
  registration: ['data/epic-l-policy2-registration-contract.json', 'schemas/epic-l-policy2-registration.schema.json'],
  support: ['data/epic-l-policy2-support-safety-contract.json', 'schemas/epic-l-policy2-support-safety.schema.json'],
  resources: ['data/epic-l-policy2-resource-governance.json', 'schemas/epic-l-policy2-resource-governance.schema.json'],
  capability: ['data/epic-l-policy2-capability-privacy-audit.json', 'schemas/epic-l-policy2-capability-privacy.schema.json'],
  backlog: ['data/epic-l-policy2-pbi-backlog.json', 'schemas/epic-l-policy2-backlog.schema.json'],
  branches: ['data/epic-l-policy2-branch-maintenance.json', 'schemas/epic-l-policy2-branch-maintenance.schema.json'],
  dependencies: ['data/epic-l-policy2-dependency-reconciliation.json', 'schemas/epic-l-policy2-dependency-reconciliation.schema.json']
};

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadArtifacts() {
  const data = {};
  for (const [name, [dataPath]] of Object.entries(ARTIFACTS)) data[name] = readJson(dataPath);
  return data;
}

function duplicates(values) {
  return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function add(errors, code, message) {
  errors.push({code, message});
}

function validateSchemas(data) {
  const errors = [];
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    formats: {
      date: /^\d{4}-\d{2}-\d{2}$/,
      uri: /^https?:\/\//
    }
  });
  for (const [name, [, schemaPath]] of Object.entries(ARTIFACTS)) {
    const validate = ajv.compile(readJson(schemaPath));
    if (!validate(data[name])) {
      for (const error of validate.errors) {
        add(errors, `SCHEMA_${name.toUpperCase()}`, `${error.instancePath || '/'} ${error.message}`);
      }
    }
  }
  return errors;
}

function validateDecisions(receipt, errors) {
  const expected = Array.from({length: 20}, (_, index) => `L-DEC-${String(index + 1).padStart(3, '0')}`);
  const decisions = Array.isArray(receipt.decisions) ? receipt.decisions : [];
  const ids = decisions.map((decision) => decision.decisionId).sort();
  if (JSON.stringify(ids) !== JSON.stringify(expected)) add(errors, 'DECISION_SET_INCOMPLETE', 'receipt must contain exactly L-DEC-001 through L-DEC-020');

  const sources = new Map((receipt.sourceRegistry || []).map((source) => [source.sourceId, source]));
  for (const decision of decisions) {
    const business = decision.businessIntentApproval;
    const legal = decision.customerFacingLegalApproval;
    if (!business) {
      add(errors, 'DECISION_APPROVAL_MISSING', `${decision.decisionId} lacks business-intent approval state`);
      continue;
    }
    for (const ref of business.sourceRefs || []) {
      if (!sources.has(ref.sourceId)) add(errors, 'DECISION_SOURCE_UNKNOWN', `${decision.decisionId} references unknown source ${ref.sourceId}`);
    }
    if (business.confirmedAuthority && /UNRESOLVED/.test(business.provenanceStatus || '')) {
      add(errors, 'DECISION_APPROVAL_CONFLICT', `${decision.decisionId} claims confirmed authority while provenance is unresolved`);
    }
    if (business.confirmedAuthority) {
      const refs = (business.sourceRefs || []).map((ref) => sources.get(ref.sourceId)).filter(Boolean);
      if (!refs.length || refs.some((source) => !source.exactApprovedWordingAvailable || source.verificationStatus !== 'VERIFIED_APPROVED_SOURCE')) {
        add(errors, 'DECISION_APPROVAL_CONFLICT', `${decision.decisionId} confirmed authority lacks a verified exact source`);
      }
    }
    if (legal?.releaseAuthorized && (legal.status !== 'APPROVED' || !(legal.evidenceRefs || []).length)) {
      add(errors, 'CUSTOMER_COPY_UNAPPROVED', `${decision.decisionId} customer copy is releasable without legal evidence`);
    }
  }

  const policy = receipt.policyVersionControl || {};
  if (policy.customerCopyReleaseAuthorized && (policy.lifecycleStatus !== 'APPROVED' || policy.applicabilityApproval !== 'APPROVED' || !(policy.approvalEvidenceRefs || []).length)) {
    add(errors, 'CUSTOMER_COPY_UNAPPROVED', 'policy version is marked releasable without applicable approval evidence');
  }
  if (policy.customerCopyReleaseAuthorized && policy.applicableTo && Date.parse(policy.applicableTo) < AS_OF) {
    add(errors, 'POLICY_VERSION_EXPIRED', 'expired policy version is marked releasable');
  }
  if (policy.customerCopyReleaseAuthorized && (!policy.applicableFrom || Date.parse(policy.applicableFrom) > AS_OF)) {
    add(errors, 'POLICY_VERSION_INAPPLICABLE', 'policy version is marked releasable outside its applicability period');
  }
}

function validateSnapshotAndCoverage(snapshot, coverage, receipt, errors) {
  const products = snapshot.products || [];
  const productIds = products.map((product) => product.productGid);
  const variantToProduct = new Map();
  for (const product of products) {
    for (const variant of product.variants || []) variantToProduct.set(variant.variantGid, product.productGid);
  }
  duplicates(productIds).forEach((id) => add(errors, 'SNAPSHOT_PRODUCT_DUPLICATE', id));
  duplicates([...variantToProduct.keys()]).forEach((id) => add(errors, 'SNAPSHOT_VARIANT_DUPLICATE', id));
  if (products.length !== snapshot.counts.products) add(errors, 'SNAPSHOT_PRODUCT_COUNT_MISMATCH', 'snapshot Product count mismatch');
  if (variantToProduct.size !== snapshot.counts.variants) add(errors, 'SNAPSHOT_VARIANT_COUNT_MISMATCH', 'snapshot Variant count mismatch');

  const active = products.filter((product) => product.status === 'ACTIVE');
  const drafts = products.filter((product) => product.status === 'DRAFT');
  const register = coverage.activeProductApprovalRegister || [];
  const draftRegister = coverage.draftProducts || [];
  const registeredIds = register.map((row) => row.productGid);
  const draftIds = draftRegister.map((row) => row.productGid);
  duplicates(registeredIds).forEach((id) => add(errors, 'COVERAGE_PRODUCT_DUPLICATE', id));
  duplicates(draftIds).forEach((id) => add(errors, 'COVERAGE_DRAFT_DUPLICATE', id));

  for (const product of active) {
    if (!registeredIds.includes(product.productGid)) add(errors, 'COVERAGE_ACTIVE_PRODUCT_MISSING', product.productGid);
  }
  for (const row of register) {
    const product = active.find((item) => item.productGid === row.productGid);
    if (!product) {
      add(errors, 'COVERAGE_UNKNOWN_PRODUCT', row.productGid);
      continue;
    }
    const expectedVariants = product.variants.map((variant) => variant.variantGid).sort();
    const actualVariants = [...(row.variantGids || [])].sort();
    if (JSON.stringify(expectedVariants) !== JSON.stringify(actualVariants)) {
      add(errors, 'COVERAGE_VARIANT_PRODUCT_MISMATCH', `${row.productGid} variants do not match the snapshot`);
    }
    for (const variantGid of actualVariants) {
      if (variantToProduct.get(variantGid) !== row.productGid) add(errors, 'COVERAGE_VARIANT_PRODUCT_MISMATCH', `${variantGid} does not belong to ${row.productGid}`);
    }
    if (row.coverageProposal?.status === 'TENTATIVE') {
      const refs = row.coverageProposal.evidenceRefs || [];
      const physicalIds = new Set((row.physicalFunctionAssessment?.evidenceRefs || []).map((evidence) => evidence.evidenceId));
      if (!refs.length || !refs.some((ref) => physicalIds.has(ref))) {
        add(errors, 'COVERAGE_TECHNICAL_CLASS_ONLY', `${row.productGid} tentative disposition lacks independent physical-function evidence`);
      }
    }
    if (row.coverageProposal?.derivedSolelyFromTechnicalClass) {
      add(errors, 'COVERAGE_TECHNICAL_CLASS_ONLY', `${row.productGid} derives coverage solely from technical class`);
    }
    const business = row.businessApproval || {};
    const legal = row.legalApproval || {};
    if (business.status === 'APPROVED' && (!(business.evidenceRefs || []).length || !business.approvedBy || !business.approvedAt)) {
      add(errors, 'COVERAGE_UNVERIFIED_APPROVED', `${row.productGid} business approval lacks evidence`);
    }
    if (legal.status === 'APPROVED' && (!(legal.evidenceRefs || []).length || !legal.approvedBy || !legal.approvedAt)) {
      add(errors, 'COVERAGE_UNVERIFIED_APPROVED', `${row.productGid} legal approval lacks evidence`);
    }
    if (row.customerPromiseAuthorized) {
      const policy = receipt.policyVersionControl || {};
      if (business.status !== 'APPROVED' || legal.status !== 'APPROVED' || !policy.customerCopyReleaseAuthorized) {
        add(errors, 'COVERAGE_PROMISE_UNAUTHORIZED', `${row.productGid} authorizes a customer promise without all approvals`);
      }
    }
    if (row.manufacturingSource?.shopifyVendorUsedAsAuthority) {
      add(errors, 'COVERAGE_VENDOR_AS_MANUFACTURER', `${row.productGid} uses Shopify Vendor as manufacturing authority`);
    }
  }
  for (const product of drafts) {
    if (!draftIds.includes(product.productGid)) add(errors, 'COVERAGE_DRAFT_PRODUCT_MISSING', product.productGid);
  }
  if (register.length !== active.length) add(errors, 'COVERAGE_REVIEW_ACCOUNTING_MISMATCH', `expected ${active.length} Active rows, received ${register.length}`);
  if ((coverage.currentAudit?.humanReviewRequiredProducts || 0) !== active.length) add(errors, 'COVERAGE_REVIEW_ACCOUNTING_MISMATCH', 'every Active Product must remain in human review until approvals exist');
}

function validateRegistration(registration, errors) {
  const identifier = registration.identifier || {};
  if (identifier.kind !== 'opaque_random' || identifier.minimumEntropyBits < 128) {
    add(errors, 'REGISTRATION_IDENTIFIER_PRIVACY', 'registration identifier must be opaque with at least 128 bits of entropy');
  }
  const exclusions = (identifier.mustNotContain || []).join(' ').toLowerCase();
  for (const token of ['customer id','email','order number','serial number','product gid']) {
    if (!exclusions.includes(token)) add(errors, 'REGISTRATION_IDENTIFIER_PRIVACY', `identifier exclusion missing ${token}`);
  }
  if (registration.duplicateHandling?.automaticOverwrite || registration.duplicateHandling?.unauthorizedOverwriteAllowed) {
    add(errors, 'REGISTRATION_DUPLICATE_OVERWRITE', 'duplicate registration cannot overwrite an existing record automatically');
  }
  if (registration.eligibility?.registrationAbsentAutomaticDenial !== false) {
    add(errors, 'REGISTRATION_AUTOMATIC_DENIAL', 'registration absence cannot automatically deny eligibility');
  }
}

function validateResources(resources, errors) {
  const registry = resources.resourceRegistry || [];
  if (resources.releaseReadiness === 'READY_FOR_CUSTOMER_RELEASE' && registry.length === 0) {
    add(errors, 'RESOURCE_RELEASE_MISSING', 'release is ready with no resource revisions');
  }
  if (resources.customerReleaseGate?.releaseAuthorized && registry.length === 0) {
    add(errors, 'RESOURCE_RELEASE_MISSING', 'customer release is authorized with an empty registry');
  }
  for (const resource of registry) {
    if (resource.releaseStatus === 'APPROVED_CUSTOMER_RELEASE') {
      if (!resource.revisionId || !(resource.applicableMachineVersions || []).length) {
        add(errors, 'RESOURCE_REVISION_UNAPPROVED', `${resource.resourceId || 'unknown'} lacks revision/applicability evidence`);
      }
      if (resource.technicalApprovedBy !== 'Kevin' || !resource.technicalApprovedAt || !(resource.approvalEvidence || []).length) {
        add(errors, 'RESOURCE_KEVIN_APPROVAL_MISSING', `${resource.resourceId || 'unknown'} lacks Kevin approval evidence`);
      }
    }
  }
  if (resources.customerReleaseGate?.releaseAuthorized) {
    const allApproved = registry.length > 0 && registry.every((resource) => resource.releaseStatus === 'APPROVED_CUSTOMER_RELEASE');
    if (!allApproved) add(errors, 'RESOURCE_REVISION_UNAPPROVED', 'customer release includes missing or unapproved revisions');
  }
}

function transitionKey(transition) {
  return `${transition.from}->${transition.to}`;
}

function validateSupportContract(support, errors) {
  const machine = support.stateMachine || {};
  const safety = machine.globalSafetyInterruption || {};
  const safetyKeys = new Set((safety.transitions || []).map(transitionKey));
  for (const state of safety.relevantNonterminalStates || []) {
    if (!safetyKeys.has(`${state}->SAFETY_HOLD`)) add(errors, 'SAFETY_INTERRUPT_COVERAGE_MISSING', `hazard from ${state} cannot enter SAFETY_HOLD`);
  }
  if (!machine.safetyHoldExit?.authorizationRequired || machine.safetyHoldExit?.directResolutionOrClosureAllowed) {
    add(errors, 'SAFETY_HOLD_EXIT_GUARD_MISSING', 'SAFETY_HOLD exit is not strictly authorized');
  }
  for (const transition of machine.safetyHoldExit?.allowedTransitions || []) {
    if (['RESOLVED','CLOSED','RECOVERY_REQUIRED'].includes(transition.to)) {
      add(errors, 'SAFETY_HOLD_EXIT_GUARD_MISSING', `SAFETY_HOLD has unsafe direct exit to ${transition.to}`);
    }
  }
  if (!machine.transitionGuards?.activeSafetyHoldBlocksAllOrdinaryTransitions || machine.transitionGuards?.recoveryMayClearSafetyHold) {
    add(errors, 'SAFETY_HOLD_RECOVERY_GUARD_MISSING', 'recovery or ordinary transitions can bypass a safety hold');
  }
  if (!support.notifications?.failedDeliveryBlocksResolution || !support.notifications?.failedDeliveryBlocksClosure) {
    add(errors, 'NOTIFICATION_CLOSURE_GUARD_MISSING', 'notification failure does not block resolution and closure');
  }
  if (support.hours?.continuousMonitoring || support.warningDelivery?.continuousMonitoringImplied || support.staffHandling?.continuousMonitoring) {
    add(errors, 'CONTINUOUS_MONITORING_IMPLIED', 'support contract implies continuous monitoring');
  }
  if (!support.manufacturerEscalation?.rhinoCaseOwnershipRetained || !support.manufacturerEscalation?.rhinoCommunicationResponsibilityRetained || support.manufacturerEscalation?.caseMayCloseOnReferralAlone) {
    add(errors, 'MANUFACTURER_ESCALATION_OWNERSHIP_LOST', 'manufacturer escalation loses Rhino ownership or communication responsibility');
  }
}

function validateTransition(support, attempt) {
  const errors = [];
  const machine = support.stateMachine;
  const states = new Set(machine.states);
  if (!states.has(attempt.from) || !states.has(attempt.to)) {
    add(errors, 'INVALID_TRANSITION', `unknown state ${attempt.from}->${attempt.to}`);
    return errors;
  }
  if (attempt.event === 'HAZARDOUS_INFORMATION_RECEIVED') {
    const allowed = (machine.globalSafetyInterruption.transitions || []).some((transition) => transition.from === attempt.from && transition.to === attempt.to);
    if (!allowed || attempt.to !== 'SAFETY_HOLD') add(errors, 'UNSAFE_HAZARD_TRANSITION', `hazard from ${attempt.from} must enter SAFETY_HOLD`);
    return errors;
  }
  if (attempt.activeSafetyHold && attempt.to === 'RECOVERY_REQUIRED') {
    add(errors, 'SAFETY_HOLD_RECOVERY_BYPASS', 'recovery cannot clear or bypass an active safety hold');
    return errors;
  }
  if (attempt.from === 'SAFETY_HOLD') {
    const allowed = (machine.safetyHoldExit.allowedTransitions || []).some((transition) => transition.from === attempt.from && transition.to === attempt.to);
    const required = machine.safetyHoldExit.requiredRecord || [];
    const authorization = attempt.authorization || {};
    const complete = required.every((field) => authorization[field] !== undefined && authorization[field] !== null && authorization[field] !== '');
    if (!allowed || !complete || !machine.safetyHoldExit.allowedDispositions.includes(authorization.disposition)) {
      add(errors, 'SAFETY_HOLD_EXIT_UNAUTHORIZED', `unauthorized SAFETY_HOLD exit to ${attempt.to}`);
    }
    return errors;
  }
  if (attempt.activeSafetyHold) {
    add(errors, 'SAFETY_HOLD_BYPASS', 'ordinary transition attempted while safety hold is active');
    return errors;
  }
  if (attempt.notificationDelivered === false && ['RESOLVED','CLOSED'].includes(attempt.to)) {
    add(errors, 'NOTIFICATION_FAILURE_CLOSURE', `notification failure cannot transition to ${attempt.to}`);
    return errors;
  }
  const allowed = (machine.ordinaryTransitions || []).some((transition) => transition.from === attempt.from && transition.to === attempt.to);
  if (!allowed) add(errors, 'INVALID_TRANSITION', `unauthorized transition ${attempt.from}->${attempt.to}`);
  return errors;
}

function validateBacklog(backlog, errors) {
  const milestone = backlog.firstOperationalMilestone || [];
  const byId = new Map(milestone.map((pbi) => [pbi.pbiId, pbi]));
  const required = ['L-PBI-003','L-PBI-005','L-PBI-006','L-PBI-012','L-PBI-014','L-PBI-016'];
  for (const id of required) if (!byId.has(id)) add(errors, 'M1_SAFEGUARD_MISSING', `${id} is absent from M1`);

  const requiredDependencies = {
    'L-PBI-004': ['L-PBI-003','L-PBI-006','L-PBI-020'],
    'L-PBI-005': ['L-PBI-004','L-PBI-006','L-PBI-016'],
    'L-PBI-007': ['L-PBI-014'],
    'L-PBI-008': ['L-PBI-006','L-PBI-012','L-PBI-013','L-PBI-016','L-PBI-020'],
    'L-PBI-009': ['L-PBI-012','L-PBI-013','L-PBI-014'],
    'L-PBI-010': ['L-PBI-008','L-PBI-012','L-PBI-016'],
    'L-PBI-012': ['L-PBI-006','L-PBI-016'],
    'L-PBI-016': ['L-PBI-006']
  };
  for (const [id, dependencies] of Object.entries(requiredDependencies)) {
    const pbi = byId.get(id);
    if (!pbi) continue;
    for (const dependency of dependencies) {
      if (!pbi.blockingDependencies.includes(dependency)) add(errors, 'M1_DEPENDENCY_MISSING', `${id} must depend on ${dependency}`);
    }
  }
  for (const pbi of milestone) {
    if (!pbi.minimumOperationalRequirement || !pbi.realCustomerActivationBlocked) add(errors, 'M1_ACTIVATION_GUARD_MISSING', `${pbi.pbiId} lacks operational activation guard`);
  }
  const activationRequired = new Set(backlog.activationGate?.requiredPbis || []);
  for (const pbi of milestone) if (!activationRequired.has(pbi.pbiId)) add(errors, 'M1_ACTIVATION_GATE_INCOMPLETE', `${pbi.pbiId} is absent from activation gate`);
  if (backlog.firstImplementationBatch?.realCustomerDataAllowed || backlog.firstImplementationBatch?.customerPromisePublicationAllowed) {
    add(errors, 'M1_SYNTHETIC_BOUNDARY_BROKEN', 'first implementation batch permits real customer data or promises');
  }
  if (backlog.deferredBoundaries?.mandatorySeriousSafetyHandling !== 'M1_REQUIRED') {
    add(errors, 'M1_SAFETY_DEFERRED', 'mandatory serious-safety handling is deferred');
  }
}

function validateGovernance(data) {
  const errors = [];
  validateDecisions(data.decisionReceipt, errors);
  validateSnapshotAndCoverage(data.snapshot, data.coverage, data.decisionReceipt, errors);
  validateRegistration(data.registration, errors);
  validateResources(data.resources, errors);
  validateSupportContract(data.support, errors);
  validateBacklog(data.backlog, errors);
  if (data.capability.mode !== 'READ_ONLY' || data.capability.shopifyMutationPerformed) add(errors, 'SHOPIFY_AUDIT_NOT_READ_ONLY', 'capability audit must be read-only');
  if (data.capability.proposedFutureMutations.some((item) => item.status !== 'NOT_AUTHORIZED')) add(errors, 'SHOPIFY_MUTATION_AUTHORIZED', 'future Shopify mutation is authorized');
  if (data.branches.recordNature !== 'HISTORICAL_RECONCILIATION_AND_WORKSPACE_CONSOLIDATION_RECORD') add(errors, 'MAINTENANCE_STATIC_STATE_OVERCLAIM', 'maintenance manifest does not separate historical reconciliation from workspace consolidation');
  if ((data.branches.preservation.filesIntentionallyPreserved || []).some((item) => item.startsWith('ocs/'))) add(errors, 'MAINTENANCE_PATH_MALFORMED', 'preserved path is malformed');
  const consolidation = data.branches.workspaceConsolidation || {};
  if (consolidation.destination?.path !== 'C:\\rlcc' || consolidation.destination?.branchAfterTransfer !== 'feat/epic-l-policy2-reconciliation') {
    add(errors, 'MAINTENANCE_AUTHORITATIVE_WORKSPACE_MISMATCH', 'C:\\rlcc is not recorded as the active Epic L feature workspace');
  }
  if (consolidation.source?.stateAfterTransfer !== 'DETACHED' || consolidation.source?.roleAfterTransfer !== 'TEMPORARY_RECOVERY_REFERENCE') {
    add(errors, 'MAINTENANCE_SOURCE_WORKTREE_NOT_RELEASED', 'temporary Epic L worktree is not recorded as detached recovery-only');
  }
  if (consolidation.migrationVerification?.initialCopyHashMatches !== 28 || (consolidation.migrationVerification?.initialCopyHashMismatches || []).length) {
    add(errors, 'MAINTENANCE_ARCHITECTURE_COPY_UNVERIFIED', 'the 28-file architecture transfer is not hash verified');
  }
  if (consolidation.migrationVerification?.preservedDestinationHashMatches !== 39 || (consolidation.migrationVerification?.preservedDestinationHashMismatches || []).length) {
    add(errors, 'MAINTENANCE_DESTINATION_PRESERVATION_UNVERIFIED', 'pre-existing destination changes are not hash verified');
  }
  if ((consolidation.collisionAssessment?.unresolvedConflicts || []).length) {
    add(errors, 'MAINTENANCE_UNRESOLVED_COLLISION', 'workspace consolidation retains unresolved path collisions');
  }
  return errors;
}

function collectReadinessBlockers(data) {
  const blockers = [];
  if (data.decisionReceipt.unresolvedProvenance?.length) add(blockers, 'DECISION_PROVENANCE_UNRESOLVED', 'original versioned Product Owner decision source is unavailable');
  if (!data.decisionReceipt.policyVersionControl.customerCopyReleaseAuthorized) add(blockers, 'POLICY_CUSTOMER_COPY_NOT_APPROVED', 'customer-facing Policy 2.0 is not approved');
  const coveragePending = data.coverage.activeProductApprovalRegister.filter((row) => row.businessApproval.status !== 'APPROVED' || row.legalApproval.status !== 'APPROVED').length;
  if (coveragePending) add(blockers, 'COVERAGE_APPROVAL_PENDING', `${coveragePending} Active Products require business/legal approval`);
  if (!data.resources.resourceRegistry.length) add(blockers, 'RESOURCE_APPROVAL_PENDING', 'no approved resource revisions are registered');
  if (data.support.hours.status !== 'APPROVED' || data.support.routes.some((route) => route.assignmentStatus !== 'APPROVED')) add(blockers, 'SUPPORT_OPERATIONS_UNRESOLVED', 'published hours, verified staff identities, permissions, and production routing remain unresolved');
  if (data.support.manufacturerEscalation.handoffProcedureStatus !== 'APPROVED') add(blockers, 'MANUFACTURER_HANDOFF_UNRESOLVED', 'Silica-Gem handoff procedure is unresolved');
  if (data.capability.retentionArchitecture.status !== 'APPROVED') add(blockers, 'PRIVACY_RETENTION_UNRESOLVED', 'private processors and seven-year lifecycle are not approved');
  if (data.backlog.activationGate.status !== 'READY') add(blockers, 'M1_ACTIVATION_BLOCKED', 'M1 activation gate is blocked');
  return blockers;
}

function validateArtifacts(data) {
  return {
    schemaErrors: validateSchemas(data),
    governanceErrors: validateGovernance(data),
    readinessBlockers: collectReadinessBlockers(data)
  };
}

function validateAll() {
  const data = loadArtifacts();
  return {data, ...validateArtifacts(data)};
}

if (require.main === module) {
  const result = validateAll();
  const blockingErrors = [...result.schemaErrors, ...result.governanceErrors];
  if (blockingErrors.length) {
    console.error(`Epic L Policy 2.0 validation failed with ${blockingErrors.length} conformance error(s):`);
    for (const error of blockingErrors) console.error(`- [${error.code}] ${error.message}`);
    process.exit(1);
  }
  console.log('Epic L Policy 2.0 schemas and governance controls passed.');
  console.log(`Business readiness remains blocked by ${result.readinessBlockers.length} governed item(s):`);
  for (const blocker of result.readinessBlockers) console.log(`- [${blocker.code}] ${blocker.message}`);
}

module.exports = {
  ARTIFACTS,
  clone,
  loadArtifacts,
  readJson,
  validateAll,
  validateArtifacts,
  validateTransition
};
