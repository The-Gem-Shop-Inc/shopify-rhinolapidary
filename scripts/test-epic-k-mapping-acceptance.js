'use strict';

const assert = require('node:assert/strict');
const { schemaErrors } = require('./lib/epic-k-evidence-drift');
const { clone, readJson } = require('./lib/epic-k-policy');
const {
    EXPECTED_ACCEPTED_PATHS,
    EXPECTED_UNRESOLVED,
    fingerprint,
    validateMappingAcceptance,
} = require('./lib/epic-k-mapping-acceptance');

const receipt = readJson('data/epic-k-shopify-mapping-acceptance-2026-10-24.json');
const mapping = readJson('data/epic-k-shopify-source-mapping.json');
const snapshot = readJson('data/epic-k-shopify-config-snapshot-2026-10-24.json');
const provenance = readJson('data/epic-k-shopify-audit-provenance-2026-10-24.json');
const evidenceGap = readJson('data/epic-k-evidence-gap-report.json');
const currentDrift = readJson('data/epic-k-shopify-configuration-drift-report-2026-10-24.json');

const tests = [];
function test(name, run) { tests.push({ name, run }); }
function validate(overrides = {}) {
    return validateMappingAcceptance(
        overrides.receipt || receipt,
        overrides.mapping || mapping,
        overrides.snapshot || snapshot,
        overrides.provenance || provenance,
        overrides.evidenceGap || evidenceGap,
        overrides.currentDrift || currentDrift,
    );
}
function expectFailure(overrides, pattern) {
    const result = validate(overrides);
    assert(result.errors.length > 0, 'expected validation failure');
    if (pattern) assert.match(result.errors.join('\n'), pattern);
}

test('receipt conforms to the strict schema', () => assert.deepEqual(
    schemaErrors('schemas/epic-k-shopify-mapping-acceptance.schema.json', receipt, 'mapping acceptance receipt'),
    [],
));
test('committed receipt passes semantic validation', () => assert.deepEqual(validate().errors, []));
test('exactly the thirteen verified mappings are accepted', () => {
    assert.equal(receipt.acceptedMappings.length, 13);
    assert.deepEqual(receipt.acceptedMappings.map((entry) => entry.normalizedPath), [...EXPECTED_ACCEPTED_PATHS]);
    assert(receipt.acceptedMappings.every((entry) => entry.sourceStatus === 'verified' && entry.acceptance === 'accepted'));
});
test('the other eleven mappings retain their unresolved classifications', () => {
    assert.equal(receipt.unresolvedMappings.length, 11);
    assert.deepEqual(
        Object.fromEntries(receipt.unresolvedMappings.map((entry) => [entry.normalizedPath, entry.sourceStatus])),
        { ...EXPECTED_UNRESOLVED },
    );
});
test('source mapping fingerprint is deterministic and exact', () => assert.equal(
    fingerprint(mapping), receipt.sourceLinks.sourceMapping.fingerprint.value,
));
test('sanitized snapshot fingerprint is deterministic and exact', () => assert.equal(
    fingerprint(snapshot), receipt.sourceLinks.sanitizedSnapshot.fingerprint.value,
));
test('audit provenance fingerprint is deterministic and exact', () => assert.equal(
    fingerprint(provenance), receipt.sourceLinks.auditProvenance.fingerprint.value,
));
test('source mapping fingerprint mismatch fails', () => {
    const value = clone(receipt);
    value.sourceLinks.sourceMapping.fingerprint.value = '0'.repeat(64);
    expectFailure({ receipt: value }, /source mapping fingerprint mismatch/);
});
test('snapshot fingerprint mismatch fails', () => {
    const value = clone(receipt);
    value.sourceLinks.sanitizedSnapshot.fingerprint.value = '0'.repeat(64);
    expectFailure({ receipt: value }, /sanitized snapshot fingerprint mismatch/);
});
test('audit provenance fingerprint mismatch fails', () => {
    const value = clone(receipt);
    value.sourceLinks.auditProvenance.fingerprint.value = '0'.repeat(64);
    expectFailure({ receipt: value }, /audit provenance fingerprint mismatch/);
});
test('duplicate accepted mapping path fails', () => {
    const value = clone(receipt);
    value.acceptedMappings[12] = clone(value.acceptedMappings[0]);
    expectFailure({ receipt: value }, /duplicate paths/);
});
test('unknown accepted mapping path fails', () => {
    const value = clone(receipt);
    value.acceptedMappings[12].normalizedPath = 'products[].inventedField';
    expectFailure({ receipt: value }, /unknown or ineligible paths/);
});
test('partial mapping cannot be promoted', () => {
    const value = clone(receipt);
    value.acceptedMappings[12].normalizedPath = 'source.mappingAcceptanceStatus';
    expectFailure({ receipt: value }, /cannot be accepted|unknown or ineligible/);
});
test('unavailable mapping cannot be promoted', () => {
    const value = clone(receipt);
    value.acceptedMappings[12].normalizedPath = 'products[].packages';
    expectFailure({ receipt: value }, /cannot be accepted|unknown or ineligible/);
});
test('operational evidence mapping cannot be promoted', () => {
    const value = clone(receipt);
    value.acceptedMappings[12].normalizedPath = 'rates[].operationalApproval';
    expectFailure({ receipt: value }, /cannot be accepted|unknown or ineligible/);
});
test('duplicate unresolved mapping path fails', () => {
    const value = clone(receipt);
    value.unresolvedMappings[10] = clone(value.unresolvedMappings[0]);
    expectFailure({ receipt: value }, /duplicate paths/);
});
test('changed unresolved classification fails', () => {
    const value = clone(receipt);
    value.unresolvedMappings[0].sourceStatus = 'unavailable';
    expectFailure({ receipt: value }, /unresolved status must remain partial/);
});
test('modified source register fails the receipt fingerprint', () => {
    const value = clone(mapping);
    value.mappings[0].transformation = 'Altered after acceptance';
    expectFailure({ mapping: value }, /source mapping fingerprint mismatch/);
});
test('whole-register acceptance remains pending in every historical source artifact', () => {
    assert.equal(mapping.productOwnerMappingAcceptanceStatus, 'pending');
    assert.equal(snapshot.source.mappingAcceptanceStatus, 'pending');
    assert.equal(provenance.productOwnerMappingAcceptanceStatus, 'pending');
    assert.equal(receipt.boundaries.entireRegisterAcceptanceStatus, 'pending');
});
test('attempted whole-register promotion fails', () => {
    const value = clone(mapping);
    value.productOwnerMappingAcceptanceStatus = 'accepted';
    expectFailure({ mapping: value }, /whole source mapping register acceptance must remain pending|source mapping fingerprint mismatch/);
});
test('all eight operational evidence requirements remain blocked', () => {
    assert.equal(evidenceGap.summary.BLOCKED, 8);
    assert.equal(evidenceGap.results.length, 8);
    assert(evidenceGap.results.every((entry) => entry.state === 'BLOCKED'));
    assert.equal(receipt.boundaries.operationalEvidenceStatus, 'BLOCKED');
});
test('live checkout enforcement remains unverified', () => {
    assert.equal(evidenceGap.liveCheckoutEnforcement, 'UNVERIFIED');
    assert.equal(currentDrift.liveCheckoutEnforcement, 'UNVERIFIED');
    assert.equal(receipt.boundaries.liveCheckoutEnforcement, 'UNVERIFIED');
});
test('existing evidence freshness gate remains blocked', () => assert.equal(
    currentDrift.results.find((entry) => entry.id === 'evidence_freshness').state,
    'BLOCKED',
));
test('receipt creates no K-DEC-020 and changes no business decision', () => {
    assert.equal(receipt.authority.newBusinessDecisionCreated, false);
    assert.equal(receipt.boundaries.businessDecisionsChanged, false);
    assert(!JSON.stringify(receipt).includes('K-DEC-020'));
});
test('receipt records no Shopify operation', () => assert.equal(receipt.boundaries.shopifyOperationsPerformed, false));
test('repeated validation with identical inputs is stable', () => assert.deepEqual(validate(), validate()));

let passed = 0;
for (const entry of tests) {
    try {
        entry.run();
        passed += 1;
    } catch (error) {
        console.error(`FAIL: ${entry.name}`);
        throw error;
    }
}
console.log(`Epic K bounded mapping acceptance tests passed: ${passed}/${tests.length}.`);
