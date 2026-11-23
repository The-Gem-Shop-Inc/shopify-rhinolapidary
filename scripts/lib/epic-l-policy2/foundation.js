'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  DisabledOperationalActivationGate,
  ExactProductVariantCatalog,
  createOpaqueIdentifier,
} = require('./common');
const { InMemoryPrivateRecordStore } = require('./private-records');
const { InMemoryNotificationOutbox, SyntheticNotificationTransport } = require('./notifications');
const { ResourceRevisionGovernance } = require('./resource-governance');
const { SupportSafetyService } = require('./support-safety');
const { MachineRegistrationService } = require('./registration');
const { GovernedSupportIntakeService } = require('./support-intake');
const { WarrantyReviewService } = require('./warranty-review');

const READINESS_BLOCKERS = Object.freeze([
  'DECISION_PROVENANCE_UNRESOLVED',
  'POLICY_CUSTOMER_COPY_NOT_APPROVED',
  'COVERAGE_APPROVAL_PENDING',
  'RESOURCE_APPROVAL_PENDING',
  'SUPPORT_OPERATIONS_UNRESOLVED',
  'MANUFACTURER_HANDOFF_UNRESOLVED',
  'PRIVACY_RETENTION_UNRESOLVED',
  'M1_ACTIVATION_BLOCKED',
]);

function permissionAuthorizer(actor, permission) {
  return Array.isArray(actor?.permissions) && actor.permissions.includes(permission);
}

function loadSupportContract(rootDir = path.resolve(__dirname, '..', '..', '..')) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'epic-l-policy2-support-safety-contract.json'), 'utf8'));
}

function loadPolicy2Json(filename, rootDir = path.resolve(__dirname, '..', '..', '..')) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, 'data', filename), 'utf8'));
}

function createB01Foundation({
  catalogEntries = [],
  transport = new SyntheticNotificationTransport(),
  clock,
  identifiers = {},
  technicalApprovalAuthority,
  systemActor,
  testMode = false,
  rootDir,
  registrationResourceResolver,
  registrationInterruptionHook,
  supportRouteResolver,
  supportRoutingAdapter,
  supportInterruptionHook,
  warrantyAuthorityResolver,
} = {}) {
  const authorize = permissionAuthorizer;
  const privateSystemActor = systemActor || {
    actorId: 'B01_PRIVATE_SYSTEM',
    permissions: [
      'PRIVATE_RECORD_CREATE', 'PRIVATE_RECORD_READ', 'PRIVATE_RECORD_UPDATE', 'PRIVATE_AUDIT_READ',
      'NOTIFICATION_QUEUE', 'NOTIFICATION_ATTEMPT', 'NOTIFICATION_RECOVERY', 'NOTIFICATION_RECONCILE',
      'SUPPORT_CASE_CREATE', 'SAFETY_INTERRUPT', 'SAFETY_DISPOSITION',
    ],
  };
  const activationGate = new DisabledOperationalActivationGate(READINESS_BLOCKERS);
  const catalog = new ExactProductVariantCatalog(catalogEntries);
  const privateRecords = new InMemoryPrivateRecordStore({
    authorize,
    clock,
    recordIdFactory: identifiers.recordId,
    publicReferenceFactory: identifiers.publicReference,
    auditIdFactory: identifiers.auditId,
  });
  const notifications = new InMemoryNotificationOutbox({
    transport,
    authorize,
    clock,
    notificationIdFactory: identifiers.notificationId,
    attemptIdFactory: identifiers.attemptId,
  });
  const resources = new ResourceRevisionGovernance({
    catalog,
    activationGate,
    authorize,
    technicalApprovalAuthority: technicalApprovalAuthority || {
      actorId: 'KEVIN_AUTHORITY_UNRESOLVED',
      authorityRole: 'TECHNICAL_APPROVER',
      synthetic: false,
    },
    clock,
    resourceIdFactory: identifiers.resourceId,
    revisionIdFactory: identifiers.revisionId,
    auditIdFactory: identifiers.resourceAuditId,
    testMode,
  });
  const safety = new SupportSafetyService({
    contract: loadSupportContract(rootDir),
    privateRecords,
    notifications,
    authorize,
    systemActor: privateSystemActor,
    clock,
    domainEventIdFactory: identifiers.domainEventId || (() => createOpaqueIdentifier(16, 'evt_')),
    testMode,
  });
  const registration = new MachineRegistrationService({
    privateRecords,
    notifications,
    resources: registrationResourceResolver || resources,
    activationGate,
    catalog,
    authorize,
    systemActor: privateSystemActor,
    clock,
    registrationIdFactory: identifiers.registrationId,
    acknowledgementEventIdFactory: identifiers.acknowledgementEventId,
    duplicateReviewIdFactory: identifiers.duplicateReviewId,
    testMode,
    interruptionHook: registrationInterruptionHook,
  });
  const supportIntake = new GovernedSupportIntakeService({
    privateRecords,
    safety,
    registration,
    notifications,
    activationGate,
    catalog,
    contract: loadSupportContract(rootDir),
    authorize,
    systemActor: privateSystemActor,
    routeResolver: supportRouteResolver,
    routingAdapter: supportRoutingAdapter,
    clock,
    caseReferenceFactory: identifiers.supportCaseReference,
    acknowledgementEventIdFactory: identifiers.supportAcknowledgementEventId,
    routingAttemptIdFactory: identifiers.supportRoutingAttemptId,
    testMode,
    interruptionHook: supportInterruptionHook,
  });
  const warrantyReview = new WarrantyReviewService({
    privateRecords,
    supportIntake,
    activationGate,
    catalog,
    coverageMatrix: loadPolicy2Json('epic-l-policy2-coverage-matrix.json', rootDir),
    decisionReceipt: loadPolicy2Json('epic-l-policy2-decision-receipt.json', rootDir),
    contract: loadPolicy2Json('epic-l-policy2-warranty-review-contract.json', rootDir),
    authorize,
    systemActor: privateSystemActor,
    authorityResolver: warrantyAuthorityResolver,
    clock,
    reviewIdFactory: identifiers.warrantyReviewId,
    assessmentIdFactory: identifiers.warrantyAssessmentId,
    testMode,
  });

  return {
    activationGate,
    catalog,
    notifications,
    privateRecords,
    resources,
    registration,
    safety,
    supportIntake,
    warrantyReview,
    ports: Object.freeze({
      registrationRecordStorage: registration,
      registrationAcknowledgementEvent: registration,
      registrationRecovery: registration,
      resourceRevisionResolution: resources,
      supportCaseCreation: supportIntake,
      supportAcknowledgement: supportIntake,
      supportRouting: supportIntake,
      warrantyReviewRequest: warrantyReview,
      warrantyEvidencePreparation: warrantyReview,
      syntheticWarrantyAssessment: warrantyReview,
      warrantyDecisionIssuanceGate: warrantyReview,
      safetyInterruption: safety,
      notificationDeliveryAndReconciliation: notifications,
      authorizedHumanDisposition: safety,
      auditEventRecording: privateRecords,
      operationalActivationGate: activationGate,
    }),
  };
}

module.exports = {
  READINESS_BLOCKERS,
  createB01Foundation,
  loadPolicy2Json,
  loadSupportContract,
  permissionAuthorizer,
};
