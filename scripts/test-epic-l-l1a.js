'use strict';

const assert = require('node:assert/strict');
const { loadArtifacts, validateArtifacts, validateAuditResult } = require('./validate-epic-l-l1a');

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function expectRejected(name, mutate, expectedFragment) {
  const artifacts = loadArtifacts();
  mutate(artifacts);
  const result = validateArtifacts(artifacts);
  assert.ok(result.errors.length > 0, `${name}: fixture unexpectedly passed`);
  assert.ok(result.errors.some((error) => error.includes(expectedFragment)), `${name}: expected error containing "${expectedFragment}"; got ${result.errors.join(' | ')}`);
}

function addProposedPolicyAndMapping(warranty, mappingOverrides = {}) {
  const identity = loadArtifacts().identity;
  const product = identity.productIdentities[0].productGid;
  warranty.policyVersions.push({
    policyId: 'L-WPOL-001', version: 'unapproved-fixture', status: 'proposed', effectiveFrom: null, effectiveTo: null,
    issuer: null, administrator: null, evidenceRefs: [], approvalIds: []
  });
  warranty.productMappings.push({
    mappingId: 'L-WMAP-001', status: 'proposed', productGid: product, variantGids: [], policyId: 'L-WPOL-001',
    effectiveFrom: '2026-01-01', effectiveTo: null, evidenceRefs: [], approvalIds: [], ...mappingOverrides
  });
}

const baseline = validateArtifacts();
assert.deepEqual(baseline.errors, [], `baseline artifacts failed: ${baseline.errors.join(' | ')}`);

const fixtures = [
  ['missing approval evidence', (a) => { a.authority.domains[0].sources[0].approval.evidenceRef = null; }, 'missing approval evidence'],
  ['conflicting authority', (a) => { a.authority.domains[1].evidenceState = 'conflicting'; a.authority.domains[1].conflictRefs = []; }, 'conflicting evidence requires conflictRefs'],
  ['expired current observation', (a) => { a.authority.domains[0].freshness = { kind: 'explicit_interval', validThrough: '2026-01-01T00:00:00.000Z' }; }, 'stale observation is presented as current'],
  ['revoked approval', (a) => { a.authority.domains[0].sources[0].approval.status = 'revoked'; }, 'revoked approval cannot support current authority'],
  ['expired approval', (a) => { a.authority.domains[0].sources[0].approval.status = 'expired'; }, 'expired approval cannot support current authority'],
  ['unapproved warranty duration', (a) => { a.warranty.decisionFields.duration.value = 'one year'; }, 'has an unapproved value'],
  ['universal warranty claim', (a) => { a.warranty.decisionFields.coveredScope.value = 'All products receive universal coverage'; }, 'unauthorized universal coverage claim'],
  ['invalid Product reference', (a) => { addProposedPolicyAndMapping(a.warranty, { productGid: 'gid://shopify/Product/9999999999999' }); }, 'references invalid Product'],
  ['invalid Variant reference', (a) => { addProposedPolicyAndMapping(a.warranty, { variantGids: ['gid://shopify/ProductVariant/9999999999999'] }); }, 'references invalid Variant'],
  ['incorrect policy version', (a) => { addProposedPolicyAndMapping(a.warranty, { policyId: 'L-WPOL-999' }); }, 'references missing policy version'],
  ['overlapping mapping authority', (a) => { addProposedPolicyAndMapping(a.warranty); const second = clone(a.warranty.productMappings[0]); second.mappingId = 'L-WMAP-002'; second.effectiveFrom = '2026-06-01'; a.warranty.productMappings.push(second); }, 'overlap Product authority'],
  ['missing lifecycle responsibility', (a) => { a.service.lifecycle[0].decisionStatus = 'approved'; }, 'missing operational responsibility or evidence'],
  ['repair shipment claim without K evidence', (a) => { const decision = a.service.repairShipment.decisions[6]; decision.decisionStatus = 'approved'; decision.value = 'Rhino files every carrier claim'; decision.evidenceRefs = ['K-EVID-007']; }, 'without accepted K-EVID-007 evidence'],
  ['private data without decisions', (a) => { a.privacy.elements[5].collectionState = 'approved'; a.privacy.elements[5].collectionAllowed = true; }, 'permits private data without complete purpose'],
  ['invented privacy retention', (a) => { a.privacy.elements[6].retention.value = 'seven years'; }, 'retention has an unapproved value'],
  ['secret in public evidence', (a) => { a.authority.rules.push('Fixture credential shpat_1234567890ABCDEF must never survive sanitization.'); }, 'contains Shopify secret'],
  ['serial in public evidence', (a) => { a.authority.rules.push('Fixture value SN-ABC12345 must never survive sanitization.'); }, 'contains serial value'],
  ['order detail in public evidence', (a) => { a.authority.rules.push('Fixture value gid://shopify/Order/123456789 must never survive sanitization.'); }, 'contains private customer or order GID'],
  ['customer contact in public evidence', (a) => { a.authority.rules.push('Fixture customer person@example.com must never survive sanitization.'); }, 'contains email address'],
  ['unauthorized write flag', (a) => { a.admin.operations[0].writeOperation = true; }, 'unauthorized Shopify write operation'],
  ['unauthorized mutation document', (a) => { a.admin.operations[0].queryDocument = 'query Unsafe { mutation { pageCreate { id } } }'; }, 'contains an unauthorized Shopify mutation']
];

for (const [name, mutate, expected] of fixtures) expectRejected(name, mutate, expected);

function completeAuditResult(plan) {
  return {
    status: 'complete',
    shop: { myshopifyDomain: plan.target.expectedMyshopifyDomain },
    operations: plan.operations.map((operation) => ({
      operationId: operation.operationId,
      status: 'complete',
      evidenceRef: `fixture:${operation.operationId}`,
      ...(operation.pagination.required ? { pages: [{ hasNextPage: false, endCursor: null }] } : {})
    }))
  };
}

const adminPlan = loadArtifacts().admin;
const paginationFailure = completeAuditResult(adminPlan);
const paginated = adminPlan.operations.find((operation) => operation.pagination.required);
paginationFailure.operations.find((operation) => operation.operationId === paginated.operationId).pages = [{ hasNextPage: true, endCursor: null }];
assert.ok(validateAuditResult(adminPlan, paginationFailure).some((error) => error.includes('pagination failure is presented as complete')), 'pagination failure fixture unexpectedly passed');

const missingEvidence = completeAuditResult(adminPlan);
missingEvidence.operations.pop();
assert.ok(validateAuditResult(adminPlan, missingEvidence).some((error) => error.includes('missing evidence')), 'missing evidence fixture unexpectedly passed');

const identityMismatch = completeAuditResult(adminPlan);
identityMismatch.shop.myshopifyDomain = 'wrong-shop.myshopify.com';
assert.ok(validateAuditResult(adminPlan, identityMismatch).some((error) => error.includes('target shop identity')), 'identity mismatch fixture unexpectedly passed');

const acceptedAuditFixture = completeAuditResult(adminPlan);
assert.deepEqual(validateAuditResult(adminPlan, acceptedAuditFixture), [], 'deterministic complete audit fixture should satisfy result-shape validation');

console.log(`Epic L L1A tests passed: 1 unresolved baseline, ${fixtures.length} artifact rejection fixtures, 3 audit-result rejection fixtures, and 1 deterministic audit-result shape fixture.`);
console.log('No connected Shopify query was executed; all audit results are synthetic shape fixtures.');
