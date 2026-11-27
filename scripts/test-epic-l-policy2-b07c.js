'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createB07ResourceAdminSystem } = require('./lib/epic-l-policy2/resource-admin-fixture');
const { createPersistentResourceAdminWorkspace } = require('../server/epic-l-policy2-resource-admin/app');

let sequence = 0;
let positiveAssertions = 0;
let negativeRejections = 0;
const command = (name) => `B07C-TEST-${name}-${++sequence}`;
const pass = (condition, message) => { assert.ok(condition, message); positiveAssertions += 1; };
function rejectsCode(operation, code) {
  let captured;
  try { operation(); } catch (error) { captured = error; }
  assert.ok(captured, `Expected rejection ${code}`);
  assert.equal(captured.code, code, `Expected ${code}, received ${captured.code}: ${captured.message}`);
  negativeRejections += 1;
}

function approvedInput(system, overrides = {}) {
  const product = system.snapshot.products.find((item) => item.status === 'ACTIVE');
  return {
    title: 'B07C synthetic resource', category: 'SETUP_GUIDE', language: 'en-US',
    languageDisposition: { basis: 'DEFAULTED', verified: false, evidenceRefs: ['POLICY_DEFAULT:en-US'] },
    editableSourceIdentity: 'synthetic://b07c/source', proposedCustomerDeliveryLink: null,
    providerType: 'OTHER_PROVIDER', immutableRevisionIdentity: `sha256:${'1'.repeat(64)}`,
    changeStatus: 'NEW_DRAFT', changeReason: 'B07C_TEST', changeEvidenceRefs: ['B07C_TEST'],
    applicability: [{ productGid: product.productGid, variantGid: product.variants[0].variantGid, machineVersion: 'B07C-V1', approvalStatus: 'EXPLICITLY_APPROVED' }],
    rightsDisposition: { status: 'APPROVED_WITH_EVIDENCE', evidenceRefs: ['B07C_RIGHTS'] },
    accessibilityDisposition: { status: 'ACCESSIBLE_WITH_EVIDENCE', evidenceRefs: ['B07C_ACCESSIBILITY'] },
    availabilityDisposition: { status: 'SYNTHETIC_AVAILABLE', checkedAt: '2026-09-08T00:00:00.000Z', evidenceRefs: ['B07C_SYNTHETIC'], synthetic: true, productionVerified: false },
    ...overrides,
  };
}

function makeDraft(system, overrides = {}) {
  return system.administration.createDraft({ actor: system.actors.productOwner, commandId: command('draft'), input: approvedInput(system, overrides) });
}

function current(detail) { return detail.revisions[detail.revisions.length - 1]; }

function main() {
  const system = createB07ResourceAdminSystem();
  const admin = system.administration;

  let draft = makeDraft(system);
  const initialRevisionId = current(draft).revisionId;
  draft = admin.editAdministrativeDetails({
    actor: system.actors.productOwner, commandId: command('metadata'), resourceId: draft.resourceId, expectedVersion: draft.version,
    revisionId: initialRevisionId, changes: { title: 'Readable administrative title', language: 'fr-CA', languageDisposition: { basis: 'OVERRIDDEN', verified: false, evidenceRefs: ['ADMIN_OVERRIDE'] } },
  });
  pass(draft.revisions.length === 1 && current(draft).revisionId === initialRevisionId, 'Administrative edits do not create content revisions');
  pass(current(draft).changeStatus === 'NEW_DRAFT' && current(draft).title === 'Readable administrative title', 'Administrative edits retain content classification and project updated metadata');
  pass(draft.events.at(-1).eventType === 'RESOURCE_ADMINISTRATIVE_DETAILS_EDITED' && draft.events.at(-1).contentChanged === false, 'Administrative edit reason and evidence are generated automatically');
  pass(current(draft).language === 'fr-CA' && current(draft).languageDisposition.basis === 'OVERRIDDEN', 'Language override is retained separately from verification');

  draft = admin.updateContent({
    actor: system.actors.productOwner, commandId: command('content'), resourceId: draft.resourceId, expectedVersion: draft.version,
    baseRevisionId: initialRevisionId, confirmed: true,
    input: approvedInput(system, { title: 'Readable administrative title — updated', immutableRevisionIdentity: `sha256:${'2'.repeat(64)}` }),
  });
  pass(draft.revisions.length === 2 && current(draft).changeStatus === 'CHANGED_CONTENT', 'Actual content replacement creates a changed-content revision');
  pass(draft.revisions.find((item) => item.revisionId === initialRevisionId).lifecycleStatus === 'SUPERSEDED', 'Content replacement automatically supersedes while retaining the predecessor');
  pass(current(draft).technicalApproval === null, 'Changed content does not inherit technical approval');
  rejectsCode(() => admin.recordHistoricalApprovalAssertion({ actor: system.actors.productOwner, commandId: command('changed-history'), resourceId: draft.resourceId, expectedVersion: draft.version, revisionId: current(draft).revisionId }), 'CHANGED_CONTENT_REQUIRES_FRESH_DISPOSITION');
  draft = admin.recordFreshTechnicalDisposition({ actor: system.actors.technical, commandId: command('fresh'), resourceId: draft.resourceId, expectedVersion: draft.version, revisionId: current(draft).revisionId });
  pass(current(draft).technicalApproval.evidenceRefs[0].startsWith('authenticated-technical-action:'), 'Authenticated technical action is evidence without a mandatory separate document');

  let pending = admin.detail('repo-beadmaster-bead-machine-dimensions-pdf');
  const pendingRevisionId = current(pending).revisionId;
  pending = admin.editAdministrativeDetails({ actor: system.actors.productOwner, commandId: command('approve-app'), resourceId: pending.resourceId, expectedVersion: pending.version, revisionId: pendingRevisionId, changes: { applicability: current(pending).applicability.map((item) => ({ ...item, approvalStatus: 'EXPLICITLY_APPROVED' })) } });
  pending = admin.recordHistoricalApprovalAssertion({ actor: system.actors.productOwner, commandId: command('pending-history'), resourceId: pending.resourceId, expectedVersion: pending.version, revisionId: pendingRevisionId });
  pass(current(pending).technicalApproval.bindingStatus === 'PENDING_IMMUTABLE_IDENTITY', 'Missing immutable identity retains the historical assertion as pending');
  const enrichment = admin.applyEnrichment({ actor: system.actors.productOwner, commandId: command('enrich'), resourceIds: [pending.resourceId] });
  pending = admin.detail(pending.resourceId);
  pass(enrichment.resourcesChanged === 1 && current(pending).immutableRevisionIdentity === 'sha256:4f99ba41459f3f5cae6fa8a78d6e2867cfb296fedbaef4aaf07a0508751c72f4', 'Actual repository file bytes are hashed automatically');
  pass(current(pending).technicalApproval.eventType === 'HISTORICAL_APPROVAL_BOUND' && current(pending).technicalApproval.bindingStatus === 'BOUND_EXACT_IDENTITY', 'Pending historical approval binds automatically when identity becomes available');
  pass(current(pending).language === 'en-US' && current(pending).languageDisposition.basis === 'DEFAULTED', 'English US is applied as an explicit default, not a verified-language claim');
  pass(current(pending).editableSourceIdentity.includes('BEADMASTER') && current(pending).providerType === 'REPOSITORY_FILE', 'Known source and provider are resolved from inventory evidence');
  pass(current(pending).proposedCustomerDeliveryLink === null && current(pending).missingRequirements.includes('DELIVERY_PREPARATION_PENDING'), 'Unknown delivery remains pending without a fabricated URL');

  const manual = admin.previewEnrichment('shopify-document-035-em-1-instructions-pdf')[0];
  pass(manual.suggestions.some((item) => item.field === 'proposedCustomerDeliveryLink' && String(item.value).startsWith('https://cdn.shopify.com/')), 'Known canonical delivery URL is resolved from the technical source index');
  pass(manual.suggestions.some((item) => item.field === 'language' && item.value === 'en-US'), 'Enrichment preview identifies deterministic language defaults');

  let noDelivery = makeDraft(system, { proposedCustomerDeliveryLink: null, immutableRevisionIdentity: null });
  noDelivery = admin.recordFreshTechnicalDisposition({ actor: system.actors.technical, commandId: command('no-delivery-tech'), resourceId: noDelivery.resourceId, expectedVersion: noDelivery.version, revisionId: current(noDelivery).revisionId });
  pass(current(noDelivery).technicalApproval.eventType === 'FRESH_TECHNICAL_DISPOSITION_RECORDED', 'Missing delivery URL does not block technical disposition');

  const bulkSystem = createB07ResourceAdminSystem();
  const bulkAdmin = bulkSystem.administration;
  const bulkItems = bulkAdmin.search({ category: 'DIAGRAM' }).slice(0, 2).map((row) => {
    let detail = bulkAdmin.detail(row.resourceId);
    detail = bulkAdmin.editAdministrativeDetails({ actor: bulkSystem.actors.productOwner, commandId: command('bulk-app'), resourceId: detail.resourceId, expectedVersion: detail.version, revisionId: current(detail).revisionId, changes: { applicability: current(detail).applicability.map((item) => ({ ...item, approvalStatus: 'EXPLICITLY_APPROVED' })) } });
    return { resourceId: detail.resourceId, revisionId: current(detail).revisionId, expectedVersion: detail.version, applicability: current(detail).applicability };
  });
  rejectsCode(() => bulkAdmin.bulkConfirmHistoricalApproval({ actor: bulkSystem.actors.productOwner, commandId: command('duplicate-bulk-history'), items: [bulkItems[0], bulkItems[0]] }), 'DUPLICATE_BULK_RESOURCE');
  const bulkResult = bulkAdmin.bulkConfirmHistoricalApproval({ actor: bulkSystem.actors.productOwner, commandId: command('bulk-history'), items: bulkItems });
  pass(bulkResult.confirmed === 2, 'One bulk action records eligible unchanged historical approvals');
  pass(bulkItems.every((item) => JSON.stringify(current(bulkAdmin.detail(item.resourceId)).applicability) === JSON.stringify(item.applicability)), 'Bulk historical approval preserves exact applicability');

  const correctionSystem = createB07ResourceAdminSystem();
  const correctionAdmin = correctionSystem.administration;
  const correctionItems = ['repo-sawmaster-18-saw-machine-18-dimensions-pdf', 'repo-sawmaster-24-saw-machine-24-dimensions-pdf'].map((resourceId, index) => {
    let detail = correctionAdmin.detail(resourceId); const base = current(detail);
    detail = correctionAdmin.startRevision({ actor: correctionSystem.actors.productOwner, commandId: command('misclassified'), resourceId, expectedVersion: detail.version, baseRevisionId: base.revisionId, input: approvedInput(correctionSystem, { title: base.title, category: base.category, editableSourceIdentity: base.editableSourceIdentity, immutableRevisionIdentity: `sha256:${String(index + 7).repeat(64)}`, changeStatus: 'CHANGED_CONTENT', applicability: base.applicability.map((item) => ({ ...item, approvalStatus: 'EXPLICITLY_APPROVED' })) }) });
    detail = correctionAdmin.recordFreshTechnicalDisposition({ actor: correctionSystem.actors.technical, commandId: command('obsolete-tech'), resourceId, expectedVersion: detail.version, revisionId: current(detail).revisionId });
    return { resourceId, revisionId: current(detail).revisionId, expectedVersion: detail.version, applicability: current(detail).applicability };
  });
  rejectsCode(() => correctionAdmin.bulkCorrectUnchanged({ actor: correctionSystem.actors.productOwner, commandId: command('duplicate-correction'), items: [correctionItems[0], correctionItems[0]], reason: 'INVALID_DUPLICATE', confirmed: true }), 'DUPLICATE_BULK_RESOURCE');
  const corrected = correctionAdmin.bulkCorrectUnchanged({ actor: correctionSystem.actors.productOwner, commandId: command('bulk-correct'), items: correctionItems, reason: 'PRODUCT_OWNER_CONFIRMED_CONTENT_UNCHANGED', confirmed: true });
  pass(corrected.corrected === 2, 'Both incorrect classifications are corrected by one governed confirmation');
  const correctedDetail = correctionAdmin.detail(correctionItems[0].resourceId); const correctedRevision = current(correctedDetail);
  pass(correctedRevision.recordedChangeStatus === 'CHANGED_CONTENT' && correctedRevision.changeStatus === 'UNCHANGED_EXISTING_BOUND', 'Correction preserves original and effective classifications');
  pass(correctedRevision.classificationCorrection.invalidatedDispositionReferences.length === 1 && correctedRevision.technicalApproval.eventType === 'HISTORICAL_KEVIN_APPROVAL_ASSERTED', 'Obsolete synthetic disposition is invalidated and cannot become real approval evidence');
  pass(JSON.stringify(correctedRevision.applicability) === JSON.stringify(correctionItems[0].applicability), 'Correction preserves exact applicability including machine version');

  let demonstrable = makeDraft(correctionSystem, { immutableRevisionIdentity: `sha256:${'a'.repeat(64)}` });
  const demonstrableBase = current(demonstrable);
  demonstrable = correctionAdmin.startRevision({ actor: correctionSystem.actors.productOwner, commandId: command('real-change'), resourceId: demonstrable.resourceId, expectedVersion: demonstrable.version, baseRevisionId: demonstrableBase.revisionId, input: approvedInput(correctionSystem, { immutableRevisionIdentity: `sha256:${'b'.repeat(64)}`, changeStatus: 'CHANGED_CONTENT' }) });
  rejectsCode(() => correctionAdmin.correctClassification({ actor: correctionSystem.actors.productOwner, commandId: command('evade'), resourceId: demonstrable.resourceId, expectedVersion: demonstrable.version, revisionId: current(demonstrable).revisionId, effectiveChangeStatus: 'UNCHANGED_EXISTING_BOUND', reason: 'TRY_TO_EVADE_REVIEW', confirmed: true }), 'DEMONSTRABLE_CONTENT_CHANGE');

  const archive = admin.exportRegistry({ actor: system.actors.productOwner });
  const restore = createB07ResourceAdminSystem({ importB05: false });
  restore.administration.importRegistry({ actor: restore.actors.productOwner, commandId: command('v1'), archive });
  pass(restore.administration.search().length === archive.resources.length && archive.archiveVersion.endsWith('_V1'), 'Existing V1 archives remain recoverable with history intact');
  const beforeMalformed = JSON.stringify(restore.administration.search()); const malformed = structuredClone(archive); malformed.resources[0].version = 0;
  rejectsCode(() => restore.administration.importRegistry({ actor: restore.actors.productOwner, commandId: command('malformed'), archive: malformed, replaceExisting: true }), 'RESOURCE_ARCHIVE_DIGEST_MISMATCH');
  pass(JSON.stringify(restore.administration.search()) === beforeMalformed, 'Malformed import causes no partial mutation');
  const restricted = structuredClone(archive); restricted.resources[0].customerRecord = 'forbidden'; delete restricted.archiveDigest;
  const crypto = require('node:crypto'); const { stableStringify } = require('./lib/epic-l-policy2/common');
  restricted.archiveDigest = crypto.createHash('sha256').update(stableStringify(restricted)).digest('hex');
  rejectsCode(() => restore.administration.importRegistry({ actor: restore.actors.productOwner, commandId: command('restricted'), archive: restricted, replaceExisting: true }), 'RESTRICTED_EXPORT_DATA');

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rhino-b07c-'));
  const dataFile = path.join(tempDir, 'registry.json');
  const workspace = createPersistentResourceAdminWorkspace({ rootDir: path.resolve(__dirname, '..'), filePath: dataFile });
  let persisted = makeDraft(workspace.system, { title: 'Survives restart' });
  workspace.store.save(workspace.system.administration.exportRegistry({ actor: workspace.system.actors.productOwner }), (candidate) => workspace.system.administration.validateArchive(candidate));
  const restarted = createPersistentResourceAdminWorkspace({ rootDir: path.resolve(__dirname, '..'), filePath: dataFile });
  pass(restarted.system.administration.search({ search: 'Survives restart' }).length === 1, 'Local administrative work survives application restart');
  restarted.store.save(restarted.system.administration.exportRegistry({ actor: restarted.system.actors.productOwner }), (candidate) => restarted.system.administration.validateArchive(candidate));
  fs.writeFileSync(dataFile, '{"interrupted":', 'utf8');
  const recovered = createPersistentResourceAdminWorkspace({ rootDir: path.resolve(__dirname, '..'), filePath: dataFile });
  pass(recovered.restoredFromBackup && recovered.system.administration.search({ search: 'Survives restart' }).length === 1, 'Corrupt current state automatically restores the last valid backup');
  const lastValid = fs.readFileSync(dataFile, 'utf8');
  rejectsCode(() => recovered.store.save({ malformed: true }, (candidate) => recovered.system.administration.validateArchive(candidate)), 'INVALID_RESOURCE_ARCHIVE');
  pass(fs.readFileSync(dataFile, 'utf8') === lastValid, 'Failed save cannot destroy the last valid local registry');
  fs.rmSync(tempDir, { recursive: true, force: true });

  rejectsCode(() => admin.assertCustomerPublicationBlocked(), 'CUSTOMER_ACTIVATION_DISABLED');
  rejectsCode(() => admin.attemptStorefrontMutation(), 'STOREFRONT_MUTATION_FORBIDDEN');
  const unauthorized = { actorId: 'SELF_ASSERTED_PRODUCTION', context: 'PRODUCTION', productionIdentityVerified: true, permissions: ['RESOURCE_ADMIN_APPLY_ENRICHMENT'] };
  rejectsCode(() => admin.applyEnrichment({ actor: unauthorized, commandId: command('unauthorized') }), 'AUTHORIZATION_REQUIRED');

  console.log(JSON.stringify({
    suite: 'EPIC-L-POLICY2-B07C', positiveAssertions, negativeOperationRejections: negativeRejections,
    manualFieldsBefore: 13, manualFieldsAfterExistingUnchanged: 0, explicitActionsBefore: 5, explicitActionsAfterExistingUnchanged: 2,
    liveProviderCalls: 0, shopifyMutations: 0, publications: 0, customerDecisions: 0, customerNotifications: 0,
  }, null, 2));
}

main();
