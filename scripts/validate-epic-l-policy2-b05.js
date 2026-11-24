'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const {
  READINESS_BLOCKERS,
  UnresolvedTechnicalGuidanceAuthorityResolver,
  createB01Foundation,
} = require('./lib/epic-l-policy2');
const { validateAll: validateArchitecture } = require('./validate-epic-l-policy2');

const root = path.resolve(__dirname, '..');
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const contract = readJson('data/epic-l-policy2-technical-guidance-contract.json');
const contractSchema = readJson('schemas/epic-l-policy2-technical-guidance.schema.json');
const queue = readJson('data/epic-l-policy2-resource-approval-queue.json');
const queueSchema = readJson('schemas/epic-l-policy2-resource-approval-queue.schema.json');
const progress = readJson('data/epic-l-policy2-b05-progress.json');
const progressSchema = readJson('schemas/epic-l-policy2-b05-progress.schema.json');
const backlog = readJson('data/epic-l-policy2-pbi-backlog.json');
const resourceContract = readJson('data/epic-l-policy2-resource-governance.json');
const resourceCatalog = readJson('data/epic-e-resource-catalog.json');
const snapshot = readJson('data/epic-l-policy2-shopify-product-snapshot-2026-11-23.json');
const source = fs.readFileSync(path.join(root, 'scripts/lib/epic-l-policy2/technical-guidance.js'), 'utf8');

const ajv = new Ajv2020({ allErrors: true, strict: false });
for (const [name, schema, artifact] of [
  ['technical guidance contract', contractSchema, contract],
  ['resource approval queue', queueSchema, queue],
  ['B05 progress receipt', progressSchema, progress],
]) {
  const validate = ajv.compile(schema);
  if (!validate(artifact)) throw new Error(`B05 ${name} schema failed: ${ajv.errorsText(validate.errors, { separator: '\n' })}`);
}

const checks = [];
function check(name, condition) {
  if (!condition) throw new Error(`B05 validation failed: ${name}`);
  checks.push(name);
}

const architectureBlockers = validateArchitecture().readinessBlockers.map((blocker) => blocker.code);
const foundation = createB01Foundation({ rootDir: root, catalogEntries: [{ productGid: 'gid://shopify/Product/1', variantGid: 'gid://shopify/ProductVariant/1' }] });
const authorization = backlog.subsequentEngineeringAuthorizations.find((item) => item.batchId === 'EPIC-L-POLICY2-B05');
const batch = backlog.engineeringBatches.find((item) => item.batchId === 'EPIC-L-POLICY2-B05');
const pbi = backlog.firstOperationalMilestone.find((item) => item.pbiId === 'L-PBI-009');
const progressPbi = progress.pbiProgress[0];

check('three versioned B05 artifacts conform to their schemas', contract.schemaVersion === '1.0.0' && queue.schemaVersion === '1.0.0' && progress.schemaVersion === '1.0.0');
check('B05 has distinct synthetic authorization without changing historical first batch', JSON.stringify(backlog.firstImplementationBatch.allowedPbis) === JSON.stringify(['L-PBI-004', 'L-PBI-005', 'L-PBI-006', 'L-PBI-008', 'L-PBI-012', 'L-PBI-014', 'L-PBI-016']) && !backlog.firstImplementationBatch.allowedPbis.includes('L-PBI-009') && authorization.authorizationId === contract.engineeringAuthorization.authorizationId && JSON.stringify(authorization.authorizedPbis) === JSON.stringify(['L-PBI-009']));
check('L-PBI-009 is engineering implemented but operationally blocked', batch.status === 'ENGINEERING_TECHNICAL_GUIDANCE_IMPLEMENTED_SYNTHETIC_ONLY' && batch.testsPassing && !batch.productionInfrastructureSelected && !batch.securityReviewComplete && !batch.operationalOwnerApproval && !batch.legalApproval && !batch.customerActivationPermitted && pbi.status === 'ENGINEERING_IMPLEMENTED_SYNTHETIC_ONLY' && pbi.realCustomerActivationBlocked && progressPbi.engineeringComponentImplemented && progressPbi.testsPassing && !progressPbi.approvedResourcesAvailable && !progressPbi.customerGuidancePermitted);
check('guidance lifecycle is explicit and unique', contract.guidanceStates.length === 9 && contract.transitions.length === 32 && new Set(contract.transitions.map((transition) => transition.join('->'))).size === 32 && contract.terminalStates.length === 1);
check('resource categories exactly reuse committed governance', JSON.stringify(contract.resourceCategories) === JSON.stringify(resourceContract.categories));
check('normal service uses unresolved authority and empty governed customer registry', foundation.technicalGuidance.authorityResolver instanceof UnresolvedTechnicalGuidanceAuthorityResolver && resourceContract.resourceRegistry.length === 0 && foundation.resources.resolveApprovedCustomerRevision({ productGid: 'gid://shopify/Product/1', variantGid: 'gid://shopify/ProductVariant/1', machineVersion: 'UNKNOWN' }).length === 0);
check('candidate queue is bounded and grants zero approvals', queue.candidates.length === 9 && queue.counts.manuals === 3 && queue.counts.diagrams === 6 && queue.counts.approvedRevisions === 0 && queue.counts.customerReleaseAuthorizations === 0 && queue.releaseAuthorized === false);
check('every queue candidate traces to catalog and exact snapshot identity evidence', queue.candidates.every((candidate) => {
  const catalogEntry = resourceCatalog.resources.find((resource) => resource.resourceId === candidate.sourceIdentity);
  const product = snapshot.products.find((entry) => (entry.productGid || entry.id) === candidate.productGid);
  return catalogEntry && catalogEntry.candidateProductGids.includes(candidate.productGid) && catalogEntry.publicationApproved === false && catalogEntry.canonical === false && catalogEntry.revision === null && product && product.variants.some((variant) => (variant.variantGid || variant.id) === candidate.observedVariantGid);
}));
check('all candidates remain human review with no Kevin or customer release approval', queue.candidates.every((candidate) => candidate.approvalStatus === 'HUMAN_REVIEW_REQUIRED' && candidate.variantApplicabilityApproved === false && candidate.machineVersionApplicabilityApproved === false && candidate.kevinApprovalStatus === 'NOT_EVIDENCED' && candidate.customerReleaseApprovalStatus === 'NOT_APPROVED'));
check('authority roles stay separated and customer release cannot be granted', contract.authoritySeparation.supportOperator && contract.authoritySeparation.technicalResourceApprover && contract.authoritySeparation.safetyDispositionAuthority && contract.authoritySeparation.warrantyReviewAuthority && contract.authoritySeparation.customerReleaseAuthority && contract.operationalGate.customerGuidanceAllowed === false && contract.operationalGate.resourcePublicationAllowed === false && contract.operationalGate.testModeMayBypass === false);
check('existing B01 safety interruption is reused without a parallel transition table', /this\.safety\.interruptForHazard/.test(source) && /this\.supportIntake\.getPrivateCase/.test(source) && !/ordinaryTransitions\s*:|globalSafetyInterruption\s*:/.test(source) && contract.safetyPrecedence.activeSafetyHoldBlocksGuidance && contract.safetyPrecedence.unresolvedWarningBlocksGuidance && !contract.safetyPrecedence.resourceSelectionMayReleaseHold);
check('B02 through B04 context cannot confer guidance, coverage, or case closure', contract.integrationBoundaries.registrationRequired === false && contract.integrationBoundaries.registrationConfersGuidanceAuthority === false && contract.integrationBoundaries.registrationConfersCoverage === false && contract.integrationBoundaries.warrantyReviewConfersGuidanceAuthority === false && contract.integrationBoundaries.guidanceMayChangeWarrantyFinding === false && contract.integrationBoundaries.supportCaseAutoCloseAllowed === false);
check('all eight readiness blockers remain exact', JSON.stringify(progress.readinessBlockers) === JSON.stringify(architectureBlockers) && JSON.stringify(READINESS_BLOCKERS) === JSON.stringify(architectureBlockers));
check('source has no production network, outbound notification, generated content, or permissive activation path', !/require\(["'](?:node:)?(?:http|https|net|tls|child_process)["']\)|\bfetch\s*\(|axios|supabase|admin\.graphql/i.test(source) && !/notifications\.(?:queue|attempt)|supportIntake\.transitionCase|WARRANTY_APPROVED|WARRANTY_DENIED/.test(source) && /AUTONOMOUS_DIAGNOSTIC_FORBIDDEN/.test(source) && /INVENTED_REPAIR_INSTRUCTIONS_FORBIDDEN/.test(source) && /CUSTOMER_ACTIVATION_DISABLED|activationGate\.assertPermitted/.test(source));

console.log(`Epic L Policy 2.0 B05 artifact checks passed: ${checks.length}/${checks.length}`);
console.log('Resource queue: 9 candidates; approved revisions: 0; customer release authorizations: 0.');
console.log('Authority: production operator and Kevin identity bindings unresolved; test fixtures remain synthetic-only.');

module.exports = { artifactChecks: checks.length };
