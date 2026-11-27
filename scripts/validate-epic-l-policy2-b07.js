'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const { READINESS_BLOCKERS } = require('./lib/epic-l-policy2/foundation');
const { createB07ResourceAdminSystem } = require('./lib/epic-l-policy2/resource-admin-fixture');

const ROOT = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));
const sha256 = (relativePath) => crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, relativePath))).digest('hex').toUpperCase();
const checks = [];
function check(name, condition) {
  assert.ok(condition, `B07 validation failed: ${name}`);
  checks.push(name);
}
function validateSchema(dataPath, schemaPath) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  const validate = ajv.compile(readJson(schemaPath));
  const valid = validate(readJson(dataPath));
  assert.equal(valid, true, `${dataPath} schema failed:\n${ajv.errorsText(validate.errors, { separator: '\n' })}`);
}

const schemaPairs = [
  ['data/epic-l-policy2-resource-administration-contract.json', 'schemas/epic-l-policy2-resource-administration.schema.json'],
  ['data/epic-l-policy2-b07-recovery.json', 'schemas/epic-l-policy2-b07-recovery.schema.json'],
  ['data/epic-l-policy2-b07-progress.json', 'schemas/epic-l-policy2-b07-progress.schema.json'],
  ['data/epic-l-policy2-r3-engineering-progress.json', 'schemas/epic-l-policy2-r3-engineering-progress.schema.json'],
  ['data/epic-l-policy2-pbi-backlog.json', 'schemas/epic-l-policy2-backlog.schema.json'],
];
for (const pair of schemaPairs) validateSchema(...pair);
check('all B07 and additively extended backlog schemas pass', true);

const contract = readJson('data/epic-l-policy2-resource-administration-contract.json');
const recovery = readJson('data/epic-l-policy2-b07-recovery.json');
const progress = readJson('data/epic-l-policy2-b07-progress.json');
const r3Progress = readJson('data/epic-l-policy2-r3-engineering-progress.json');
const backlog = readJson('data/epic-l-policy2-pbi-backlog.json');
const preserved = readJson('data/epic-l-policy2-b06-preserved-paths.json');
const queue = readJson('data/epic-l-policy2-resource-approval-queue.json');
const registration = readJson('data/epic-l-policy2-registration-contract.json');
const support = readJson('data/epic-l-policy2-support-safety-contract.json');
const warranty = readJson('data/epic-l-policy2-warranty-review-contract.json');

check('B05 queue identity remains exact', sha256('data/epic-l-policy2-resource-approval-queue.json') === contract.b05QueueSha256 && contract.b05QueueSha256 === 'C5A3196BCF2BAB4FA09F0C702A5A0148DD173D263D32F47FA9D52157DF6CED2A');
check('B05 queue remains three high manuals six medium diagrams and zero releases', queue.candidates.length === 9 && queue.counts.highPriority === 3 && queue.counts.mediumPriority === 6 && queue.counts.manuals === 3 && queue.counts.diagrams === 6 && queue.counts.customerReleaseAuthorizations === 0 && queue.releaseAuthorized === false);
check('recovery records exactly the authorized 51-path baseline', recovery.startingWorktreePathCount === 51 && recovery.protectedPathsPassing === 39 && recovery.protectedPathsFailing === 0 && recovery.candidates.length === 12);
check('recovery snapshot remained outside the repository and unpublished', recovery.temporarySnapshot.outsideRepository && recovery.temporarySnapshot.candidateFilesOnly && recovery.temporarySnapshot.byteAndHashVerified && !recovery.temporarySnapshot.published && !recovery.temporarySnapshot.committed);
check('all initial recovery candidate hashes and statuses are recorded', recovery.candidates.every((item) => /^[A-F0-9]{64}$/.test(item.initialSha256) && [' M', '??'].includes(item.initialStatus) && item.initialBytes > 0));
check('no candidate was outside scope or excluded', !recovery.unrelatedCandidateWorkFound && recovery.candidateFilesExcluded.length === 0 && recovery.candidates.every((item) => !['ARCHITECTURALLY_UNSUITABLE', 'OUTSIDE_AUTHORIZED_SCOPE'].includes(item.classification)));

const protectedHashesPass = preserved.paths.every((entry) => sha256(entry.path) === entry.sha256);
check('all 39 B06 protected path hashes remain exact', preserved.paths.length === 39 && protectedHashesPass);
check('existing domain versions remain registration 2.2 support 2.2 warranty 1.1', registration.schemaVersion === '2.2.0' && support.schemaVersion === '2.2.0' && warranty.schemaVersion === '1.1.0');
check('all eight readiness blockers remain exact', JSON.stringify(progress.readinessBlockers) === JSON.stringify(READINESS_BLOCKERS) && progress.readinessBlockers.length === 8);
check('R3-005 progress is a successor receipt and historical backlog is not rewritten', r3Progress.workItems[0].itemId === 'R3-005' && r3Progress.workItems[0].engineeringStatus === 'IMPLEMENTED_PRIVATE_SYNTHETIC_ONLY' && r3Progress.workItems[0].operationalStatus === 'BLOCKED' && r3Progress.historicalBacklogModified === false);
check('R3-005 does not complete human approval publication or M1', !r3Progress.workItems[0].humanResourceApprovalComplete && !r3Progress.workItems[0].resourcePublicationComplete && !r3Progress.workItems[0].customerReleaseAuthorized && !r3Progress.m1OperationallyReady);
check('B07 has separate authorization without changing the first implementation batch', backlog.firstImplementationBatch.allowedPbis.length === 7 && backlog.subsequentEngineeringAuthorizations.some((item) => item.authorizationId === 'EPIC-L-POLICY2-B07-AUTHORIZATION-2026-11-27' && item.originalFirstImplementationBatchUnchanged && !item.realCustomerDataAllowed));
check('L-PBI-014 engineering status is synthetic while delivery remains unimplemented', backlog.firstOperationalMilestone.find((item) => item.pbiId === 'L-PBI-014').status === 'ENGINEERING_RESOURCE_ADMINISTRATION_IMPLEMENTED_SYNTHETIC_ONLY' && r3Progress.pbiStatus['L-PBI-007'] === 'RESOURCE_DELIVERY_NOT_IMPLEMENTED');

const first = createB07ResourceAdminSystem();
const second = createB07ResourceAdminSystem();
const firstRows = first.administration.search();
const secondRows = second.administration.search();
check('fresh systems import exactly nine candidates', firstRows.length === 9 && secondRows.length === 9);
check('B05 logical and revision identities import deterministically', JSON.stringify(firstRows.map((row) => [row.resourceId, row.currentRevisionId])) === JSON.stringify(secondRows.map((row) => [row.resourceId, row.currentRevisionId])));
check('B05 observed applicability remains unapproved and unresolved', firstRows.every((row) => first.administration.detail(row.resourceId).revisions[0].applicability.every((item) => item.approvalStatus === 'OBSERVED_NOT_APPROVED') && row.lifecycleStatus === 'DRAFT'));
const repeated = first.administration.importB05Candidates({ actor: first.actors.productOwner, commandId: 'B07_VALIDATOR_REPEAT_IMPORT' });
check('B05 repeated import is idempotent', repeated.inserted.length === 0 && repeated.skipped.length === 9 && first.administration.search().length === 9);
check('B05 import creates no approval or customer release', firstRows.every((row) => row.technicalApprovalStatus === 'UNRESOLVED' && row.customerReleaseAuthorized === false) && first.governance.auditTrail().length === 0);

check('canonical governance and additive administration exports are wired through the shared library', /resourceGovernance\.createRevision/.test(read('scripts/lib/epic-l-policy2/resource-administration.js')) && /resource-administration/.test(read('scripts/lib/epic-l-policy2/index.js')));
check('historical assertion is bound to the exact R3 OPEN-09 evidence source', contract.historicalApproval.assertionSource === 'repository-evidence:data/epic-l-policy2-decision-receipt-r3.json#OPEN-09' && !contract.historicalApproval.approvalTimestampFabricated && !contract.historicalApproval.productionIdentityVerified);
check('changed content cannot inherit approval and mutable URLs are not immutable identity', contract.revisionRules.technicalApprovalInheritedAfterChange === false && contract.revisionRules.mutableUrlAloneAcceptedAsRevisionIdentity === false && /CHANGED_CONTENT_REQUIRES_FRESH_DISPOSITION/.test(read('scripts/lib/epic-l-policy2/resource-administration.js')));
check('exact applicability supports multiple assignments and rejects stale or duplicate approvals', contract.applicabilityRules.multipleAssignmentsSupported && contract.applicabilityRules.draftProductMayBecomeApprovedApplicability === false && contract.applicabilityRules.duplicateActiveAssignmentAllowed === false);
check('rights accessibility language and availability remain independent synthetic evidence', contract.evidence.rightsIndependent && contract.evidence.accessibilityIndependent && contract.evidence.languageIndependent && contract.evidence.availabilityIndependent && contract.evidence.availabilityMode === 'DETERMINISTIC_SYNTHETIC_ONLY' && !contract.evidence.productionAvailabilityVerified);
check('export restore is demonstration-only and claims no privacy backup readiness', contract.persistence.runtimeModel === 'IN_MEMORY_DEMONSTRATION_STORE' && contract.persistence.businessBackup === 'VALIDATED_DIGESTED_EXPORT_IMPORT' && !contract.persistence.productionDurabilityClaimed && !contract.persistence.privacyRetentionReadinessClaimed);

const serverSource = read('server/epic-l-policy2-resource-admin/app.js');
const launcherSource = read('server/epic-l-policy2-resource-admin/server.js');
check('server binds loopback and requires explicit synthetic startup', /listen\(port, '127\.0\.0\.1'/.test(launcherSource) && /--synthetic/.test(launcherSource));
check('server has static allowlist body limit and Host Origin session safeguards', /STATIC_FILES/.test(serverSource) && /MAX_REQUEST_BYTES = 1_000_000/.test(serverSource) && /LOCAL_HOST_REQUIRED/.test(serverSource) && /LOCAL_ORIGIN_REQUIRED/.test(serverSource) && /ISOLATED_SESSION_REQUIRED/.test(serverSource));
check('server-selected actor and path identities are applied after request bodies', /\{ \.\.\.body, actor: productOwner, resourceId: decodeURIComponent/.test(serverSource) && /\{ \.\.\.body, actor: technical, resourceId: decodeURIComponent/.test(serverSource));
check('B07 contains no external provider fetch or Shopify mutation client', !/fetch\s*\(\s*['"]https?:\/\//i.test(read('server/epic-l-policy2-resource-admin/public/app.js')) && !/shopify.*(?:mutation|admin.*api)|discord\.com\/api\/webhooks/i.test([serverSource, read('scripts/lib/epic-l-policy2/resource-administration.js')].join('\n')));
check('publication storefront and synthetic activation boundaries remain false', Object.values(contract.activationBoundary).every((value) => value === false) && Object.values(progress.activationEvidence).every((value) => value === false));

const pkg = readJson('package.json');
check('package exposes B07 start test UI and validation commands', ['start:epic-l-policy2-b07', 'test:epic-l-policy2-b07', 'test:epic-l-policy2-b07-ui', 'validate:epic-l-policy2-b07'].every((name) => typeof pkg.scripts[name] === 'string'));
const requiredFiles = [
  'playwright.epic-l-policy2-b07.config.js',
  'server/epic-l-policy2-resource-admin/public/index.html',
  'server/epic-l-policy2-resource-admin/public/app.js',
  'tests/epic-l-policy2-b07-resource-admin.spec.js',
  'docs/project/epic-l-policy2-b07-technical-architecture.md',
  'docs/project/epic-l-policy2-b07-requirements-matrix.md',
  'docs/project/implementation-records/epic-l-policy2-b07.md',
];
check('functional interface tests and governed implementation records exist', requiredFiles.every((file) => fs.statSync(path.join(ROOT, file)).size > 500));
check('Playwright targets only isolated loopback B07 server', /127\.0\.0\.1:4177/.test(read('playwright.epic-l-policy2-b07.config.js')) && /--synthetic/.test(read('playwright.epic-l-policy2-b07.config.js')) && !/rhinolapidary\.com|myshopify\.com/i.test(read('playwright.epic-l-policy2-b07.config.js')));
check('recorded acceptance counts are executable rather than description counts', progress.testEvidence.positiveDomainAndIntegrationAssertions >= 29 && progress.testEvidence.invalidOrUnauthorizedOperationsRejected >= 40 && progress.testEvidence.browserScenariosPassing === progress.testEvidence.browserScenarios && progress.testEvidence.axeViolations === 0);
check('all recorded external operation counts remain zero', progress.testEvidence.liveProviderCalls === 0 && progress.testEvidence.shopifyMutations === 0 && progress.testEvidence.resourcePublications === 0 && progress.testEvidence.customerDecisionsIssued === 0 && progress.testEvidence.customerNotificationsSent === 0);

console.log(`Epic L Policy 2.0 B07 artifact checks passed: ${checks.length}/${checks.length}`);
console.log('B05 inventory: 9 deterministic candidates; customer releases: 0.');
console.log('Protected unrelated paths: 39/39 SHA-256 matches.');
