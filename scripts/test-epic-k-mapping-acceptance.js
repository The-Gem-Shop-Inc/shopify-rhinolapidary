'use strict';

const assert = require('node:assert/strict');
const { schemaErrors } = require('./lib/epic-k-evidence-drift');
const { clone, readJson } = require('./lib/epic-k-policy');
const {
    EXPECTED_LIMITATION_PATHS,
    EXPECTED_SOURCE_STATUSES,
    EXPECTED_STATUS_COUNTS,
    fingerprint,
    validateMappingAcceptance,
} = require('./lib/epic-k-mapping-acceptance');
const { validateEpicKShopifyAudit } = require('./validate-epic-k-shopify-audit');
const { validateRemediationPreflight } = require('./validate-epic-k-remediation-preflight');

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
function statusCounts(entries, key) {
    return entries.reduce((counts, entry) => {
        counts[entry[key]] = (counts[entry[key]] || 0) + 1;
        return counts;
    }, {});
}

test('receipt conforms to the corrected strict schema', () => assert.deepEqual(
    schemaErrors('schemas/epic-k-shopify-mapping-acceptance.schema.json', receipt, 'mapping acceptance receipt'),
    [],
));
test('committed full design acceptance passes semantic validation', () => assert.deepEqual(validate().errors, []));
test('all twenty-four mapping definitions are accepted', () => {
    assert.equal(receipt.acceptedMappingDefinitions.length, 24);
    assert.deepEqual(
        receipt.acceptedMappingDefinitions.map((entry) => entry.normalizedPath),
        Object.keys(EXPECTED_SOURCE_STATUSES),
    );
    assert(receipt.acceptedMappingDefinitions.every((entry) => entry.designAcceptance === 'accepted'));
});
test('accepted design definitions preserve every source classification', () => assert.deepEqual(
    Object.fromEntries(receipt.acceptedMappingDefinitions.map((entry) => [entry.normalizedPath, entry.sourceVerificationStatus])),
    { ...EXPECTED_SOURCE_STATUSES },
));
test('source classification counts remain 13, 3, 5, and 3', () => assert.deepEqual(
    statusCounts(mapping.mappings, 'status'),
    { ...EXPECTED_STATUS_COUNTS },
));
test('all eleven evidence limitations remain explicit and accepted as design definitions', () => {
    assert.equal(receipt.evidenceLimitations.length, 11);
    assert.deepEqual(receipt.evidenceLimitations.map((entry) => entry.normalizedPath), [...EXPECTED_LIMITATION_PATHS]);
    assert(receipt.evidenceLimitations.every((entry) => entry.designAcceptance === 'accepted' && entry.limitationStatus === 'outstanding'));
});
test('authoritative source mapping fingerprint is deterministic and exact', () => assert.equal(
    fingerprint(mapping), receipt.sourceLinks.sourceMapping.fingerprint.value,
));
test('historical sanitized snapshot fingerprint is deterministic and exact', () => assert.equal(
    fingerprint(snapshot), receipt.sourceLinks.sanitizedSnapshot.fingerprint.value,
));
test('historical audit provenance fingerprint is deterministic and exact', () => assert.equal(
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
test('duplicate accepted definition fails', () => {
    const value = clone(receipt);
    value.acceptedMappingDefinitions[23] = clone(value.acceptedMappingDefinitions[0]);
    expectFailure({ receipt: value }, /duplicate paths/);
});
test('unknown accepted definition fails', () => {
    const value = clone(receipt);
    value.acceptedMappingDefinitions[23].normalizedPath = 'products[].inventedField';
    expectFailure({ receipt: value }, /unknown paths/);
});
test('omitted accepted definition fails', () => {
    const value = clone(receipt);
    value.acceptedMappingDefinitions.pop();
    expectFailure({ receipt: value }, /acceptedMappingDefinitions|fewer than 24/);
});
test('partial mapping definition is accepted without becoming verified', () => {
    const entry = receipt.acceptedMappingDefinitions.find((item) => item.normalizedPath === 'source.mappingAcceptanceStatus');
    assert.equal(entry.designAcceptance, 'accepted');
    assert.equal(entry.sourceVerificationStatus, 'partial');
});
test('unavailable mapping definition is accepted without becoming verified', () => {
    const entry = receipt.acceptedMappingDefinitions.find((item) => item.normalizedPath === 'products[].packages');
    assert.equal(entry.designAcceptance, 'accepted');
    assert.equal(entry.sourceVerificationStatus, 'unavailable');
});
test('operationally dependent definition is accepted without evidence promotion', () => {
    const entry = receipt.acceptedMappingDefinitions.find((item) => item.normalizedPath === 'rates[].operationalApproval');
    assert.equal(entry.designAcceptance, 'accepted');
    assert.equal(entry.sourceVerificationStatus, 'requires_operational_evidence');
});
test('attempt to mark unavailable information verified fails', () => {
    const value = clone(receipt);
    value.acceptedMappingDefinitions.find((entry) => entry.normalizedPath === 'products[].packages').sourceVerificationStatus = 'verified';
    expectFailure({ receipt: value }, /must preserve source classification unavailable/);
});
test('attempt to alter source classification fails even if schema remains valid', () => {
    const value = clone(mapping);
    value.mappings.find((entry) => entry.normalizedPath === 'products[].packages').status = 'verified';
    expectFailure({ mapping: value }, /source classification must remain unavailable|source mapping fingerprint mismatch/);
});
test('modified mapping definition invalidates the acceptance fingerprint', () => {
    const value = clone(mapping);
    value.mappings[0].transformation = 'Altered after Product Owner acceptance';
    expectFailure({ mapping: value }, /source mapping fingerprint mismatch/);
});
test('authoritative mapping records complete design acceptance', () => {
    assert.equal(mapping.version, '1.2.0');
    assert.equal(mapping.productOwnerMappingAcceptanceStatus, 'accepted');
    assert.equal(receipt.mappingDesignAcceptanceStatus, 'accepted');
    assert.equal(receipt.authority.additionalProductOwnerApprovalRequired, false);
});
test('historical snapshot and audit provenance retain pending assessment metadata', () => {
    assert.equal(snapshot.source.mappingAcceptanceStatus, 'pending');
    assert.equal(provenance.productOwnerMappingAcceptanceStatus, 'pending');
    assert.equal(receipt.application.historicalReportsRewritten, false);
});
test('historical October 24 audit evidence remains reproducible', () => assert.deepEqual(
    validateEpicKShopifyAudit().errors,
    [],
));
test('historical K1B-03A projection remains reproducible', () => assert.deepEqual(
    validateRemediationPreflight().errors,
    [],
));
test('all eight operational evidence requirements remain blocked', () => {
    assert.equal(evidenceGap.summary.BLOCKED, 8);
    assert.equal(evidenceGap.results.length, 8);
    assert(evidenceGap.results.every((entry) => entry.state === 'BLOCKED'));
    assert.equal(receipt.boundaries.operationalEvidenceStatus, 'BLOCKED');
});
test('operational readiness remains blocked', () => {
    assert.equal(evidenceGap.operationalReadiness, 'BLOCKED');
    assert.equal(currentDrift.operationalReadiness, 'BLOCKED');
});
test('live checkout enforcement remains unverified', () => {
    assert.equal(evidenceGap.liveCheckoutEnforcement, 'UNVERIFIED');
    assert.equal(currentDrift.liveCheckoutEnforcement, 'UNVERIFIED');
    assert.equal(receipt.boundaries.liveCheckoutEnforcement, 'UNVERIFIED');
});
test('receipt creates no K-DEC-020 and changes no business decision', () => {
    assert.equal(receipt.authority.newBusinessDecisionCreated, false);
    assert.equal(receipt.boundaries.businessDecisionsChanged, false);
    assert(!JSON.stringify(receipt).includes('K-DEC-020'));
});
test('design acceptance grants no Shopify access or mutation authority', () => {
    assert.equal(receipt.boundaries.shopifyAccessAuthorized, false);
    assert.equal(receipt.boundaries.shopifyMutationsAuthorized, false);
    assert.equal(receipt.boundaries.shopifyOperationsPerformed, false);
});
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
console.log(`Epic K full mapping design acceptance tests passed: ${passed}/${tests.length}.`);
