'use strict';

const assert = require('node:assert/strict');
const http = require('node:http');
const {
  createB07ResourceAdminSystem,
  PRODUCT_OWNER_ACTOR,
} = require('./lib/epic-l-policy2/resource-admin-fixture');
const { HISTORICAL_APPROVAL_EVIDENCE_REFERENCE } = require('./lib/epic-l-policy2/resource-administration');
const { createResourceAdminServer, MAX_REQUEST_BYTES, SESSION_HEADER, SESSION_VALUE } = require('../server/epic-l-policy2-resource-admin/app');

let sequence = 0;
let positiveAssertions = 0;
let negativeRejections = 0;
const command = (name) => `B07-TEST-${name}-${++sequence}`;
const pass = (condition, message) => { assert.ok(condition, message); positiveAssertions += 1; };
function rejectsCode(operation, code) {
  let captured;
  try { operation(); } catch (error) { captured = error; }
  assert.ok(captured, `Expected rejection ${code}`);
  assert.equal(captured.code, code, `Expected ${code}, received ${captured.code}: ${captured.message}`);
  negativeRejections += 1;
}
async function rejectsCodeAsync(operation, code) {
  let captured;
  try { await operation(); } catch (error) { captured = error; }
  assert.ok(captured, `Expected rejection ${code}`);
  assert.equal(captured.code, code, `Expected ${code}, received ${captured.code}: ${captured.message}`);
  negativeRejections += 1;
}

function completeInput(system, overrides = {}) {
  const product = system.snapshot.products.find((item) => item.status === 'ACTIVE');
  const variant = product.variants[0];
  return {
    title: 'Synthetic EM resource',
    category: 'SETUP_GUIDE',
    language: 'en-US',
    editableSourceIdentity: 'synthetic-editor://resource/source',
    proposedCustomerDeliveryLink: 'https://delivery.invalid/resources/em-guide',
    providerType: 'OTHER_PROVIDER',
    immutableRevisionIdentity: `sha256:${'a'.repeat(64)}`,
    changeStatus: 'NEW_DRAFT',
    changeReason: 'B07_SYNTHETIC_TEST',
    changeEvidenceRefs: ['B07-CHANGE-EVIDENCE'],
    applicability: [{
      productGid: product.productGid,
      variantGid: variant.variantGid,
      machineVersion: 'SYNTHETIC-MACHINE-V1',
      approvalStatus: 'EXPLICITLY_APPROVED',
    }],
    rightsDisposition: { status: 'APPROVED_WITH_EVIDENCE', evidenceRefs: ['B07-RIGHTS'] },
    accessibilityDisposition: { status: 'ACCESSIBLE_WITH_EVIDENCE', evidenceRefs: ['B07-ACCESSIBILITY'] },
    availabilityDisposition: { status: 'SYNTHETIC_AVAILABLE', checkedAt: '2026-11-25T18:00:00.000Z', evidenceRefs: ['B07-SYNTHETIC-CHECK'], synthetic: true, productionVerified: false },
    ...overrides,
  };
}

function createCompleteDraft(system, overrides = {}) {
  return system.administration.createDraft({
    actor: system.actors.productOwner,
    commandId: command('draft'),
    input: completeInput(system, overrides),
  });
}

function recordFreshAndApprove(system, detail) {
  const revision = detail.revisions.at(-1);
  detail = system.administration.recordFreshTechnicalDisposition({
    actor: system.actors.technical,
    commandId: command('fresh'),
    resourceId: detail.resourceId,
    expectedVersion: detail.version,
    revisionId: revision.revisionId,
    evidenceRefs: ['B07-FRESH-TECHNICAL-EVIDENCE'],
  });
  return system.administration.approveInternal({
    actor: system.actors.productOwner,
    technicalActor: system.actors.technical,
    commandId: command('internal'),
    resourceId: detail.resourceId,
    expectedVersion: detail.version,
    revisionId: revision.revisionId,
    reason: 'B07-INTERNAL-ONLY',
    evidenceRefs: ['B07-INTERNAL-EVIDENCE'],
  });
}

function requestJson(port, method, pathname, body, withSession = true, withOrigin = true, hostHeader = null) {
  return new Promise((resolve, reject) => {
    const serialized = body === undefined ? null : JSON.stringify(body);
    const headers = {};
    if (hostHeader) headers.host = hostHeader;
    if (withSession) headers[SESSION_HEADER] = SESSION_VALUE;
    if (serialized) { if (withOrigin) headers.origin = `http://127.0.0.1:${port}`; headers['content-type'] = 'application/json'; headers['content-length'] = Buffer.byteLength(serialized); }
    const request = http.request({ hostname: '127.0.0.1', port, method, path: pathname, headers }, (response) => {
      let text = '';
      response.on('data', (chunk) => { text += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body: JSON.parse(text) }));
    });
    request.on('error', reject);
    if (serialized) request.write(serialized);
    request.end();
  });
}

async function main() {
  const system = createB07ResourceAdminSystem();
  const admin = system.administration;

  pass(admin.search().length === 9, 'All nine B05 candidates must import');
  pass(admin.search().filter((item) => item.priority === 'HIGH').length === 3, 'Three candidates must remain high priority');
  pass(admin.search().filter((item) => item.category === 'DIAGRAM').length === 6, 'Six diagram candidates must import');
  pass(admin.search().every((item) => item.customerReleaseAuthorized === false), 'B05 import must create no customer release');
  const repeat = admin.importB05Candidates({ actor: system.actors.productOwner, commandId: command('repeat-import') });
  pass(repeat.inserted.length === 0 && repeat.skipped.length === 9 && admin.search().length === 9, 'Repeated import must be idempotent');

  let documentDraft = createCompleteDraft(system, { title: 'Draft document', category: 'SETUP_GUIDE' });
  let videoDraft = createCompleteDraft(system, { title: 'Draft video', category: 'TUTORIAL_VIDEO', immutableRevisionIdentity: `sha256:${'b'.repeat(64)}`, proposedCustomerDeliveryLink: 'https://delivery.invalid/video' });
  pass(documentDraft.revisions.at(-1).category === 'SETUP_GUIDE', 'Document draft must be created');
  pass(videoDraft.revisions.at(-1).category === 'TUTORIAL_VIDEO', 'Video draft must be created');
  pass(documentDraft.revisions.at(-1).applicability[0].productGid === system.snapshot.products.find((item) => item.status === 'ACTIVE').productGid, 'Exact Product assignment must persist');

  const candidate = admin.search({ category: 'MANUAL' })[0];
  let historical = admin.detail(candidate.resourceId);
  const candidateRevision = historical.revisions.at(-1);
  const historicalInput = completeInput(system, {
    title: candidateRevision.title,
    category: candidateRevision.category,
    editableSourceIdentity: candidateRevision.editableSourceIdentity,
    immutableRevisionIdentity: `sha256:${'c'.repeat(64)}`,
    changeStatus: 'UNCHANGED_EXISTING_BOUND',
    changeReason: 'BIND_EXISTING_RESOURCE_TO_EXACT_REVISION',
    applicability: candidateRevision.applicability.map((item) => ({ ...item, approvalStatus: 'EXPLICITLY_APPROVED' })),
  });
  historical = admin.startRevision({ actor: system.actors.productOwner, commandId: command('bind'), resourceId: historical.resourceId, expectedVersion: historical.version, baseRevisionId: candidateRevision.revisionId, input: historicalInput });
  const boundRevision = historical.revisions.at(-1);
  historical = admin.recordHistoricalApprovalAssertion({ actor: system.actors.productOwner, commandId: command('historical'), resourceId: historical.resourceId, expectedVersion: historical.version, revisionId: boundRevision.revisionId, approvalEvidenceReference: HISTORICAL_APPROVAL_EVIDENCE_REFERENCE, authorityLimitations: ['PRODUCTION_IDENTITY_UNVERIFIED'] });
  pass(historical.revisions.at(-1).technicalApproval.eventType === 'HISTORICAL_KEVIN_APPROVAL_ASSERTED', 'Unchanged exact revision may record the Product Owner historical assertion');
  historical = admin.approveInternal({ actor: system.actors.productOwner, technicalActor: system.actors.technical, commandId: command('approve-historical'), resourceId: historical.resourceId, expectedVersion: historical.version, revisionId: boundRevision.revisionId, reason: 'INTERNAL_RESOURCE_ONLY', evidenceRefs: ['B07-EXACT-BINDING'] });
  pass(historical.revisions.at(-1).lifecycleStatus === 'APPROVED_INTERNAL' && historical.customerReleaseAuthorized === false, 'Historical assertion can support only internal approval');

  documentDraft = recordFreshAndApprove(system, documentDraft);
  pass(documentDraft.revisions.at(-1).lifecycleStatus === 'APPROVED_INTERNAL', 'New content must obtain a fresh technical disposition');
  const beforeRevision = documentDraft.revisions.at(-1);
  documentDraft = admin.startRevision({ actor: system.actors.productOwner, commandId: command('revision'), resourceId: documentDraft.resourceId, expectedVersion: documentDraft.version, baseRevisionId: beforeRevision.revisionId, input: completeInput(system, { title: 'Draft document revision 2', category: 'SETUP_GUIDE', immutableRevisionIdentity: `sha256:${'d'.repeat(64)}`, changeStatus: 'CHANGED_CONTENT', changeReason: 'CONTENT_CHANGED' }) });
  const afterRevision = documentDraft.revisions.at(-1);
  pass(admin.compare(documentDraft.resourceId, beforeRevision.revisionId, afterRevision.revisionId).changes.some((item) => item.field === 'immutableRevisionIdentity'), 'Revision comparison must expose changed immutable identity');
  documentDraft = admin.supersede({ actor: system.actors.productOwner, commandId: command('supersede'), resourceId: documentDraft.resourceId, expectedVersion: documentDraft.version, previousRevisionId: beforeRevision.revisionId, replacementRevisionId: afterRevision.revisionId, reason: 'CONTENT_REPLACED', evidenceRefs: ['B07-SUPERSESSION'] });
  pass(documentDraft.revisions.find((item) => item.revisionId === beforeRevision.revisionId).lifecycleStatus === 'SUPERSEDED', 'Supersession must preserve predecessor history');
  videoDraft = admin.retire({ actor: system.actors.productOwner, commandId: command('retire'), resourceId: videoDraft.resourceId, expectedVersion: videoDraft.version, revisionId: videoDraft.revisions.at(-1).revisionId, reason: 'SYNTHETIC_RETIREMENT', evidenceRefs: ['B07-RETIREMENT'] });
  pass(videoDraft.revisions.at(-1).lifecycleStatus === 'RETIRED', 'Retirement must retain revision evidence');
  pass(admin.search({ search: 'Draft document revision 2' }).length === 1 && admin.search({ category: 'TUTORIAL_VIDEO' }).length >= 1, 'Search and category filters must work');

  const archive = admin.exportRegistry({ actor: system.actors.productOwner });
  const restoreSystem = createB07ResourceAdminSystem({ importB05: false });
  const restored = restoreSystem.administration.importRegistry({ actor: restoreSystem.actors.productOwner, commandId: command('restore'), archive });
  pass(restored.importedResources === archive.resources.length && restoreSystem.administration.search().length === archive.resources.length, 'Export/import must round trip the complete registry');
  pass(JSON.stringify(restoreSystem.administration.exportRegistry({ actor: restoreSystem.actors.productOwner }).resources) === JSON.stringify(archive.resources), 'Round trip must preserve resource and revision history exactly');

  // Executed negative operations. Each call must actually reject with the named contract code.
  const badProduct = completeInput(system); badProduct.applicability[0].productGid = 'gid://shopify/Product/99999999999999';
  rejectsCode(() => admin.createDraft({ actor: system.actors.productOwner, commandId: command('bad-product'), input: badProduct }), 'UNKNOWN_PRODUCT_GID');
  const badVariant = completeInput(system); badVariant.applicability[0].variantGid = 'gid://shopify/ProductVariant/99999999999999';
  rejectsCode(() => admin.createDraft({ actor: system.actors.productOwner, commandId: command('bad-variant'), input: badVariant }), 'UNKNOWN_VARIANT_GID');
  const relationshipProducts = system.snapshot.products.filter((item) => item.variants.length).slice(0, 2);
  const badRelationship = completeInput(system); badRelationship.applicability[0] = { productGid: relationshipProducts[0].productGid, variantGid: relationshipProducts[1].variants[0].variantGid, machineVersion: 'V1', approvalStatus: 'EXPLICITLY_APPROVED' };
  rejectsCode(() => admin.createDraft({ actor: system.actors.productOwner, commandId: command('bad-relation'), input: badRelationship }), 'INVALID_PRODUCT_VARIANT_RELATIONSHIP');
  const noVersion = completeInput(system); noVersion.applicability[0].machineVersion = '';
  rejectsCode(() => admin.createDraft({ actor: system.actors.productOwner, commandId: command('no-version'), input: noVersion }), 'MACHINE_VERSION_APPLICABILITY_REQUIRED');
  let incomplete = createCompleteDraft(system, { title: 'Incomplete applicability', category: 'SAFETY_NOTICE', applicability: [] });
  const incompleteRevision = incomplete.revisions.at(-1);
  incomplete = admin.recordFreshTechnicalDisposition({ actor: system.actors.technical, commandId: command('incomplete-tech'), resourceId: incomplete.resourceId, expectedVersion: incomplete.version, revisionId: incompleteRevision.revisionId, evidenceRefs: ['B07-TECH'] });
  rejectsCode(() => admin.approveInternal({ actor: system.actors.productOwner, technicalActor: system.actors.technical, commandId: command('no-app-approve'), resourceId: incomplete.resourceId, expectedVersion: incomplete.version, revisionId: incompleteRevision.revisionId, reason: 'NO', evidenceRefs: ['B07'] }), 'RESOURCE_REQUIREMENTS_INCOMPLETE');
  const duplicateInside = completeInput(system); duplicateInside.applicability.push({ ...duplicateInside.applicability[0] });
  rejectsCode(() => admin.createDraft({ actor: system.actors.productOwner, commandId: command('dupe-inside'), input: duplicateInside }), 'DUPLICATE_APPLICABILITY_ASSIGNMENT');
  const unboundCandidates = admin.search({ category: 'DIAGRAM' }).slice(0, 2).map((row) => admin.detail(row.resourceId));
  const noImmutable = admin.startRevision({ actor: system.actors.productOwner, commandId: command('no-immutable-revision'), resourceId: unboundCandidates[0].resourceId, expectedVersion: unboundCandidates[0].version, baseRevisionId: unboundCandidates[0].revisions.at(-1).revisionId, input: completeInput(system, { title: unboundCandidates[0].title, category: 'DIAGRAM', immutableRevisionIdentity: null, changeStatus: 'UNCHANGED_EXISTING_BOUND' }) });
  const pendingHistorical = admin.recordHistoricalApprovalAssertion({ actor: system.actors.productOwner, commandId: command('no-immutable'), resourceId: noImmutable.resourceId, expectedVersion: noImmutable.version, revisionId: noImmutable.revisions.at(-1).revisionId, approvalEvidenceReference: HISTORICAL_APPROVAL_EVIDENCE_REFERENCE });
  assert.equal(pendingHistorical.revisions.at(-1).technicalApproval.bindingStatus, 'PENDING_IMMUTABLE_IDENTITY');
  const mutableOnly = admin.startRevision({ actor: system.actors.productOwner, commandId: command('mutable-only-revision'), resourceId: unboundCandidates[1].resourceId, expectedVersion: unboundCandidates[1].version, baseRevisionId: unboundCandidates[1].revisions.at(-1).revisionId, input: completeInput(system, { title: unboundCandidates[1].title, category: 'DIAGRAM', immutableRevisionIdentity: 'https://docs.invalid/current', changeStatus: 'UNCHANGED_EXISTING_BOUND' }) });
  rejectsCode(() => admin.recordHistoricalApprovalAssertion({ actor: system.actors.productOwner, commandId: command('mutable-only'), resourceId: mutableOnly.resourceId, expectedVersion: mutableOnly.version, revisionId: mutableOnly.revisions.at(-1).revisionId, approvalEvidenceReference: HISTORICAL_APPROVAL_EVIDENCE_REFERENCE }), 'IMMUTABLE_REVISION_IDENTITY_REQUIRED');
  const invalidProviderRevision = admin.startRevision({ actor: system.actors.productOwner, commandId: command('invalid-provider-revision'), resourceId: unboundCandidates[1].resourceId, expectedVersion: mutableOnly.version, baseRevisionId: mutableOnly.revisions.at(-1).revisionId, input: completeInput(system, { title: unboundCandidates[1].title, category: 'DIAGRAM', immutableRevisionIdentity: 'provider-revision:bad', changeStatus: 'UNCHANGED_EXISTING_BOUND' }) });
  rejectsCode(() => admin.recordHistoricalApprovalAssertion({ actor: system.actors.productOwner, commandId: command('invalid-provider-authority'), resourceId: invalidProviderRevision.resourceId, expectedVersion: invalidProviderRevision.version, revisionId: invalidProviderRevision.revisions.at(-1).revisionId, approvalEvidenceReference: HISTORICAL_APPROVAL_EVIDENCE_REFERENCE }), 'IMMUTABLE_REVISION_IDENTITY_REQUIRED');
  const productionAvailability = completeInput(system); productionAvailability.availabilityDisposition.productionVerified = true;
  rejectsCode(() => admin.createDraft({ actor: system.actors.productOwner, commandId: command('production-availability'), input: productionAvailability }), 'PRODUCTION_AVAILABILITY_CLAIM_FORBIDDEN');
  const staleProduct = system.snapshot.products.find((item) => item.status !== 'ACTIVE');
  const staleCatalog = completeInput(system); staleCatalog.applicability = [{ productGid: staleProduct.productGid, variantGid: staleProduct.variants[0].variantGid, machineVersion: 'STALE', approvalStatus: 'EXPLICITLY_APPROVED' }];
  rejectsCode(() => admin.createDraft({ actor: system.actors.productOwner, commandId: command('stale-catalog'), input: staleCatalog }), 'STALE_CATALOG_REFERENCE');
  let failedAvailability = createCompleteDraft(system, { title: 'Failed availability evidence', availabilityDisposition: { status: 'FAILED', checkedAt: '2026-11-25T18:00:00.000Z', evidenceRefs: ['B07-SYNTHETIC-FAILURE'], synthetic: true, productionVerified: false } });
  failedAvailability = admin.recordFreshTechnicalDisposition({ actor: system.actors.technical, commandId: command('failed-availability-tech'), resourceId: failedAvailability.resourceId, expectedVersion: failedAvailability.version, revisionId: failedAvailability.revisions.at(-1).revisionId, evidenceRefs: ['B07-TECH'] });
  rejectsCode(() => admin.approveInternal({ actor: system.actors.productOwner, technicalActor: system.actors.technical, commandId: command('failed-availability-approve'), resourceId: failedAvailability.resourceId, expectedVersion: failedAvailability.version, revisionId: failedAvailability.revisions.at(-1).revisionId, reason: 'NO', evidenceRefs: ['B07'] }), 'RESOURCE_REQUIREMENTS_INCOMPLETE');
  const changedBase = admin.detail(candidate.resourceId); const changedCandidate = admin.startRevision({ actor: system.actors.productOwner, commandId: command('changed'), resourceId: changedBase.resourceId, expectedVersion: changedBase.version, baseRevisionId: changedBase.revisions.at(-1).revisionId, input: completeInput(system, { category: 'MANUAL', changeStatus: 'CHANGED_CONTENT' }) });
  rejectsCode(() => admin.recordHistoricalApprovalAssertion({ actor: system.actors.productOwner, commandId: command('inherit'), resourceId: changedCandidate.resourceId, expectedVersion: changedCandidate.version, revisionId: changedCandidate.revisions.at(-1).revisionId, approvalEvidenceReference: HISTORICAL_APPROVAL_EVIDENCE_REFERENCE }), 'CHANGED_CONTENT_REQUIRES_FRESH_DISPOSITION');
  rejectsCode(() => admin.recordHistoricalApprovalAssertion({ actor: system.actors.productOwner, commandId: command('unsupported'), resourceId: historical.resourceId, expectedVersion: historical.version, revisionId: boundRevision.revisionId, approvalEvidenceReference: '' }), 'APPROVAL_EVIDENCE_REQUIRED');
  rejectsCode(() => admin.recordHistoricalApprovalAssertion({ actor: system.actors.productOwner, commandId: command('fabricated'), resourceId: historical.resourceId, expectedVersion: historical.version, revisionId: boundRevision.revisionId, approvalEvidenceReference: 'FABRICATED-KEVIN-APPROVAL' }), 'UNSUPPORTED_APPROVAL_EVIDENCE');
  const unauthorized = { actorId: 'SELF_ASSERTED_ADMIN', context: 'ISOLATED_SYNTHETIC', productionIdentityVerified: false, permissions: ['RESOURCE_ADMIN_CREATE_DRAFT'] };
  rejectsCode(() => admin.createDraft({ actor: unauthorized, commandId: command('unauthorized'), input: completeInput(system) }), 'AUTHORIZATION_REQUIRED');
  const selfProduction = { ...PRODUCT_OWNER_ACTOR, actorId: 'SELF_ASSERTED_PRODUCTION', context: 'PRODUCTION', productionIdentityVerified: true };
  rejectsCode(() => admin.createDraft({ actor: selfProduction, commandId: command('self-production'), input: completeInput(system) }), 'AUTHORIZATION_REQUIRED');
  rejectsCode(() => admin.startRevision({ actor: system.actors.productOwner, commandId: command('stale'), resourceId: documentDraft.resourceId, expectedVersion: 1, baseRevisionId: afterRevision.revisionId, input: completeInput(system, { changeStatus: 'CHANGED_CONTENT' }) }), 'RESOURCE_VERSION_CONFLICT');
  const replayInput = completeInput(system, { title: 'Replay one', category: 'SAFETY_NOTICE' }); const replayCommand = command('replay');
  admin.createDraft({ actor: system.actors.productOwner, commandId: replayCommand, input: replayInput });
  rejectsCode(() => admin.createDraft({ actor: system.actors.productOwner, commandId: replayCommand, input: { ...replayInput, title: 'Replay two' } }), 'IDEMPOTENCY_KEY_REUSE');
  rejectsCode(() => admin.overwriteHistoricalRevision(), 'HISTORICAL_REVISION_IMMUTABLE');
  rejectsCode(() => admin.deleteHistoricalRevision(), 'HISTORICAL_REVISION_DELETE_FORBIDDEN');
  rejectsCode(() => admin.supersede({ actor: system.actors.productOwner, commandId: command('bad-super'), resourceId: documentDraft.resourceId, expectedVersion: documentDraft.version, previousRevisionId: afterRevision.revisionId, replacementRevisionId: afterRevision.revisionId, reason: 'BAD', evidenceRefs: ['B07'] }), 'INVALID_SUPERSESSION');
  const malformedArchive = JSON.parse(JSON.stringify(archive)); malformedArchive.resources[0].revisions[0].title = 'Tampered';
  const emptyForMalformed = createB07ResourceAdminSystem({ importB05: false });
  rejectsCode(() => emptyForMalformed.administration.importRegistry({ actor: emptyForMalformed.actors.productOwner, commandId: command('malformed'), archive: malformedArchive }), 'RESOURCE_ARCHIVE_DIGEST_MISMATCH');
  pass(emptyForMalformed.administration.search().length === 0, 'Malformed import must not partially mutate the registry');
  const leakingArchive = JSON.parse(JSON.stringify(archive)); leakingArchive.resources[0].revisions[0].email = 'private@example.invalid';
  const crypto = require('node:crypto'); const { stableStringify } = require('./lib/epic-l-policy2/common'); delete leakingArchive.archiveDigest; leakingArchive.archiveDigest = crypto.createHash('sha256').update(stableStringify(leakingArchive)).digest('hex');
  const emptyForLeak = createB07ResourceAdminSystem({ importB05: false });
  rejectsCode(() => emptyForLeak.administration.importRegistry({ actor: emptyForLeak.actors.productOwner, commandId: command('leak'), archive: leakingArchive }), 'RESTRICTED_EXPORT_DATA');
  const inconsistentArchive = JSON.parse(JSON.stringify(archive)); inconsistentArchive.resources[0].version = 0; delete inconsistentArchive.archiveDigest; inconsistentArchive.archiveDigest = crypto.createHash('sha256').update(stableStringify(inconsistentArchive)).digest('hex');
  const emptyForInconsistent = createB07ResourceAdminSystem({ importB05: false });
  rejectsCode(() => emptyForInconsistent.administration.importRegistry({ actor: emptyForInconsistent.actors.productOwner, commandId: command('inconsistent'), archive: inconsistentArchive }), 'INVALID_RESOURCE_ARCHIVE');
  pass(emptyForInconsistent.administration.search().length === 0, 'Inconsistent import must not partially mutate the registry');
  rejectsCode(() => admin.assertCustomerPublicationBlocked(), 'CUSTOMER_ACTIVATION_DISABLED');
  rejectsCode(() => admin.attemptStorefrontMutation(), 'STOREFRONT_MUTATION_FORBIDDEN');
  rejectsCode(() => createB07ResourceAdminSystem({ importB05: false, factories: { administration: { isolatedSyntheticMode: false } } }), 'ISOLATED_SYNTHETIC_MODE_REQUIRED');
  const noTechnical = createCompleteDraft(system, { title: 'No technical', category: 'SAFETY_NOTICE', machineVersion: 'NO-TECH' });
  rejectsCode(() => admin.approveInternal({ actor: system.actors.productOwner, technicalActor: system.actors.technical, commandId: command('no-tech'), resourceId: noTechnical.resourceId, expectedVersion: noTechnical.version, revisionId: noTechnical.revisions.at(-1).revisionId, reason: 'BAD', evidenceRefs: ['B07'] }), 'RESOURCE_REQUIREMENTS_INCOMPLETE');
  rejectsCode(() => admin.recordFreshTechnicalDisposition({ actor: system.actors.productOwner, commandId: command('wrong-tech'), resourceId: noTechnical.resourceId, expectedVersion: noTechnical.version, revisionId: noTechnical.revisions.at(-1).revisionId, evidenceRefs: ['B07'] }), 'AUTHORIZATION_REQUIRED');
  let assignmentOwner = createCompleteDraft(system, { title: 'Active assignment owner', category: 'DYNAMIC_INSTRUCTION_DOCUMENT' });
  assignmentOwner = recordFreshAndApprove(system, assignmentOwner);
  let assignmentConflict = createCompleteDraft(system, { title: 'Conflicting assignment', category: 'DYNAMIC_INSTRUCTION_DOCUMENT' });
  assignmentConflict = admin.recordFreshTechnicalDisposition({ actor: system.actors.technical, commandId: command('conflict-tech'), resourceId: assignmentConflict.resourceId, expectedVersion: assignmentConflict.version, revisionId: assignmentConflict.revisions.at(-1).revisionId, evidenceRefs: ['B07-TECH'] });
  rejectsCode(() => admin.approveInternal({ actor: system.actors.productOwner, technicalActor: system.actors.technical, commandId: command('active-conflict'), resourceId: assignmentConflict.resourceId, expectedVersion: assignmentConflict.version, revisionId: assignmentConflict.revisions.at(-1).revisionId, reason: 'CONFLICT', evidenceRefs: ['B07'] }), 'DUPLICATE_ACTIVE_ASSIGNMENT');
  rejectsCode(() => admin.retire({ actor: system.actors.productOwner, commandId: command('retire-twice'), resourceId: videoDraft.resourceId, expectedVersion: videoDraft.version, revisionId: videoDraft.revisions.at(-1).revisionId, reason: 'AGAIN', evidenceRefs: ['B07'] }), 'INVALID_RETIREMENT');
  rejectsCode(() => restoreSystem.administration.importRegistry({ actor: restoreSystem.actors.productOwner, commandId: command('nonempty-import'), archive }), 'IMPORT_REQUIRES_EMPTY_REGISTRY');

  const server = createResourceAdminServer({ system: createB07ResourceAdminSystem() });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const denied = await requestJson(port, 'GET', '/api/bootstrap', undefined, false);
  pass(denied.status === 403 && denied.body.error.code === 'ISOLATED_SESSION_REQUIRED', 'HTTP API must require explicit isolated session');
  negativeRejections += 1;
  const recovered = await requestJson(port, 'GET', '/api/bootstrap');
  pass(recovered.status === 200 && recovered.body.data.resources.length === 9, 'Interface API must recover after a rejected request');
  const rejectedHost = await requestJson(port, 'GET', '/api/bootstrap', undefined, true, true, 'attacker.invalid');
  pass(rejectedHost.status === 403 && rejectedHost.body.error.code === 'LOCAL_HOST_REQUIRED', 'Interface must reject non-loopback Host headers');
  negativeRejections += 1;
  const rejectedOrigin = await requestJson(port, 'POST', '/api/publication', {}, true, false);
  pass(rejectedOrigin.status === 403 && rejectedOrigin.body.error.code === 'LOCAL_ORIGIN_REQUIRED', 'Interface writes must reject requests without the exact local origin');
  negativeRejections += 1;
  const oversized = await requestJson(port, 'POST', '/api/publication', { padding: 'x'.repeat(MAX_REQUEST_BYTES) });
  pass(oversized.status === 413 && oversized.body.error.code === 'REQUEST_TOO_LARGE', 'Interface must reject oversized request bodies');
  negativeRejections += 1;
  const traversal = await requestJson(port, 'GET', '/../package.json', undefined, false);
  pass(traversal.status === 404 && traversal.body.error.code === 'NOT_FOUND', 'Static server must reject traversal and arbitrary file access');
  negativeRejections += 1;
  const pathOverride = await requestJson(port, 'POST', '/api/resources/MISSING_RESOURCE/revisions', { actor: system.actors.productOwner, resourceId: recovered.body.data.resources[0].resourceId, commandId: command('path-override'), expectedVersion: 1, baseRevisionId: recovered.body.data.resources[0].currentRevisionId, input: completeInput(system, { changeStatus: 'CHANGED_CONTENT' }) });
  pass(pathOverride.status === 400 && pathOverride.body.error.code === 'RESOURCE_NOT_FOUND', 'Request bodies cannot override server-selected path identity');
  negativeRejections += 1;
  const blockedPublication = await requestJson(port, 'POST', '/api/publication', {});
  pass(blockedPublication.status === 403 && blockedPublication.body.error.code === 'CUSTOMER_ACTIVATION_DISABLED', 'Manipulated publication request must fail in domain layer');
  negativeRejections += 1;
  await new Promise((resolve) => server.close(resolve));

  pass(system.activation.blockers.length === 8, 'All eight readiness blockers must remain active');
  rejectsCode(() => system.governance.releaseForCustomer({ actor: system.actors.productOwner, resourceId: documentDraft.resourceId, revisionId: system.governance.history(documentDraft.resourceId)[0].revisionId }), 'AUTHORIZATION_REQUIRED');
  pass(system.governance.resolveApprovedCustomerRevision({ ...admin.canonicalApplicability(documentDraft.revisions.at(-1).applicability), productGid: documentDraft.revisions.at(-1).applicability[0].productGid, variantGid: documentDraft.revisions.at(-1).applicability[0].variantGid, machineVersion: documentDraft.revisions.at(-1).applicability[0].machineVersion }).length === 0, 'No customer release revision may exist');
  console.log(JSON.stringify({ suite: 'EPIC-L-POLICY2-B07', positiveAssertions, negativeOperationRejections: negativeRejections, providerCalls: 0, shopifyMutations: 0, publications: 0, customerDecisions: 0, customerNotifications: 0 }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
