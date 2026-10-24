'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { clone, readJson } = require('./lib/epic-k-policy');
const {
    fingerprint,
    renderDepartmentalRequestReport,
    validateIntakeManifest,
    validateSubmissionCandidate,
} = require('./lib/epic-k-evidence-intake');

const AS_OF = '2026-10-24T18:00:00.000Z';
const manifest = readJson('data/epic-k-evidence-intake-manifest.json');
const requirements = readJson('data/epic-k-operational-evidence-requirements.json');
const receipts = readJson('data/epic-k-evidence-receipts.json');
const evidenceGap = readJson('data/epic-k-evidence-gap-report.json');
const mapping = readJson('data/epic-k-shopify-source-mapping.json');
const mappingAcceptance = readJson('data/epic-k-shopify-mapping-acceptance-2026-10-24.json');
const tests = [];
function test(name, run) { tests.push({ name, run }); }

function makeCandidate(requirementId) {
    const requirement = requirements.requirements.find((entry) => entry.id === requirementId);
    const request = manifest.requests.find((entry) => entry.requirementId === requirementId);
    const suffix = requirementId.slice(-3);
    const candidate = {
        schemaVersion: 1,
        contractId: 'epic-k-evidence-receipts',
        version: '1.0.0-provisional',
        status: 'partial_evidence',
        inputClassification: 'synthetic_fixture',
        synthetic: true,
        operationalReadiness: 'blocked',
        liveCheckoutCompliance: 'unverified',
        generatedAt: '2026-10-24T17:00:00.000Z',
        receipts: [{
            id: `SYNTHETIC-RECEIPT-INTAKE-${suffix}`,
            requirementId,
            category: requirement.category,
            synthetic: true,
            ownerRole: requirement.authorityOwners[0],
            verificationStatus: 'accepted',
            source: {
                artifactType: 'synthetic_intake_fixture',
                reference: `SYNTHETIC-SOURCE-${suffix}`,
                sanitized: true,
                restrictedRawArtifact: false,
                digest: suffix.repeat(22).slice(0, 64),
            },
            subject: {
                type: request.allowedSubjectTypes[0],
                identifiers: requirementId === 'K-EVID-003'
                    ? [`SYNTHETIC-PRODUCT-${suffix}`, `SYNTHETIC-VARIANT-${suffix}`]
                    : [`SYNTHETIC-SUBJECT-${suffix}`],
                scope: [...request.requiredScopeDimensions],
            },
            collectedAt: '2026-10-24T17:00:00.000Z',
            validity: request.validityMode === 'required_interval'
                ? { kind: 'interval', validFrom: '2026-10-24T16:00:00.000Z', expiresAt: '2026-10-25T16:00:00.000Z' }
                : { kind: 'none_established' },
            support: {
                supportsRequirement: true,
                coverage: 'complete',
                supportedFacts: [...requirement.requiredFacts],
            },
            assertions: request.requiredAssertionNames.map((name) => ({ name, value: `SYNTHETIC_${name}_${suffix}` })),
        }],
    };
    const receipt = candidate.receipts[0];
    const setAssertion = (name, value) => {
        const assertion = receipt.assertions.find((entry) => entry.name === name);
        if (assertion) assertion.value = value;
        else receipt.assertions.push({ name, value });
    };
    if (requirementId === 'K-EVID-001') setAssertion('pickupEligibility', true);
    if (requirementId === 'K-EVID-003') {
        setAssertion('packedShippingWeight', 125);
        setAssertion('weightUnit', 'lb');
        setAssertion('packageCount', 1);
        setAssertion('packageDimensions', '24x18x12');
        setAssertion('dimensionUnit', 'in');
        setAssertion('measurementInclusions', 'Synthetic packed unit with all listed components');
    }
    if (requirementId === 'K-EVID-005') {
        setAssertion('alaskaRate', 100);
        setAssertion('hawaiiRate', 125);
        setAssertion('currency', 'USD');
        setAssertion('confirmedServiceAvailability', true);
        setAssertion('alaskaServiceAvailability', true);
        setAssertion('hawaiiServiceAvailability', true);
        setAssertion('alaskaApprovalReference', 'SYNTHETIC_ALASKA_APPROVAL');
        setAssertion('hawaiiApprovalReference', 'SYNTHETIC_HAWAII_APPROVAL');
    }
    if (requirementId === 'K-EVID-006') {
        setAssertion('cost', 25);
        setAssertion('currency', 'USD');
        setAssertion('selectionAcceptance', true);
    }
    return candidate;
}

function assess(candidate, asOf = AS_OF) {
    return validateSubmissionCandidate(candidate, manifest, requirements, { asOf });
}
function expectInvalid(candidate, pattern) {
    const result = assess(candidate);
    assert.equal(result.submissionState, 'INVALID');
    if (pattern) assert.match(result.errors.join('\n'), pattern);
}

test('committed intake manifest is valid and preserves eight blocked requirements', () => {
    const result = validateIntakeManifest(manifest, requirements, receipts, evidenceGap, mapping, mappingAcceptance, { asOf: '2026-10-24T23:59:59.000Z' });
    assert.deepEqual(result.errors, []);
    assert.equal(result.requestCount, 8);
    assert.equal(result.blockedCount, 8);
});
test('manifest is bound to the exact authoritative requirements register', () => assert.equal(
    manifest.requirementsSource.fingerprint.value,
    fingerprint(requirements),
));
test('October 24 empty-register preparation state is preserved as a historical fingerprint', () => {
    assert.equal(manifest.historicalPreparationRecord.recordIsHistorical, true);
    assert.equal(manifest.historicalPreparationRecord.receiptRegisterFingerprint.value, fingerprint(receipts));
    assert.equal(manifest.historicalPreparationRecord.evidenceGapFingerprint.value, fingerprint(evidenceGap));
    assert.equal(manifest.historicalPreparationRecord.receiptCount, 0);
    assert.equal(manifest.historicalPreparationRecord.blockedRequirementCount, 8);
});
test('manifest contains exactly one request per authoritative requirement', () => assert.deepEqual(
    manifest.requests.map((entry) => entry.requirementId),
    requirements.requirements.map((entry) => entry.id),
));
test('all repository discovery sources are explicitly non-authoritative for receipt satisfaction', () => assert(
    manifest.requests.flatMap((entry) => entry.repositorySources).every((source) => source.maySatisfyRequirement === false),
));
test('all eight structurally complete synthetic candidates are ready for owner review but remain blocked', () => {
    for (const requirement of requirements.requirements) {
        const result = assess(makeCandidate(requirement.id));
        assert.deepEqual(result.errors, [], requirement.id);
        assert.equal(result.submissionState, 'VALID_STRUCTURE_AND_SCOPE');
        assert.equal(result.candidatePolicyComparison.operationalReadiness, 'BLOCKED');
        assert.equal(result.candidatePolicyComparison.liveCheckoutEnforcement, 'UNVERIFIED');
        assert.equal(result.candidatePolicyComparison.results.find((entry) => entry.id === requirement.id).state, 'BLOCKED');
        assert.equal(result.authorityAssessment.departmentalAcceptance, 'UNVERIFIED');
        assert.equal(result.authorityAssessment.authoritativeRegisterAttachment, 'NOT_ATTACHED');
    }
});
test('missing mandatory fact fails', () => {
    const value = makeCandidate('K-EVID-004');
    value.receipts[0].support.supportedFacts.pop();
    expectInvalid(value, /incorrectly scoped evidence|supported facts/i);
});
test('missing owner role fails', () => {
    const value = makeCandidate('K-EVID-001');
    delete value.receipts[0].ownerRole;
    expectInvalid(value, /ownerRole/);
});
test('missing owner identity assertion fails', () => {
    const value = makeCandidate('K-EVID-002');
    value.receipts[0].assertions = value.receipts[0].assertions.filter((entry) => entry.name !== 'ownerIdentity');
    expectInvalid(value, /missing mandatory assertions: ownerIdentity/);
});
test('unsupported owner role fails', () => {
    const value = makeCandidate('K-EVID-003');
    value.receipts[0].ownerRole = 'Unsupported authority';
    expectInvalid(value, /unsupported owner role/);
});
test('missing Product or service scope fails', () => {
    const value = makeCandidate('K-EVID-004');
    value.receipts[0].subject.scope.pop();
    expectInvalid(value, /missing required scope dimensions/);
});
test('missing source digest fails provenance validation', () => {
    const value = makeCandidate('K-EVID-006');
    delete value.receipts[0].source.digest;
    expectInvalid(value, /source digest is required/);
});
test('missing validity information fails the receipt contract', () => {
    const value = makeCandidate('K-EVID-008');
    delete value.receipts[0].validity;
    expectInvalid(value, /validity/);
});
test('expired evidence fails', () => {
    const value = makeCandidate('K-EVID-005');
    value.receipts[0].validity.expiresAt = AS_OF;
    expectInvalid(value, /expired|incorrectly scoped evidence/i);
});
test('duplicate receipt fails', () => {
    const value = makeCandidate('K-EVID-005');
    value.receipts.push(clone(value.receipts[0]));
    expectInvalid(value, /duplicate|incorrectly scoped evidence/i);
});
test('conflicting evidence fails', () => {
    const value = makeCandidate('K-EVID-007');
    const conflicting = clone(value.receipts[0]);
    conflicting.id = 'SYNTHETIC-RECEIPT-INTAKE-007-B';
    conflicting.source.reference = 'SYNTHETIC-SOURCE-007-B';
    conflicting.source.digest = 'b'.repeat(64);
    conflicting.assertions.find((entry) => entry.name === 'carrierFilingResponsibility').value = 'SYNTHETIC_CONFLICT';
    value.receipts.push(conflicting);
    expectInvalid(value, /conflicting|incorrectly scoped evidence/i);
});
test('synthetic evidence represented as authoritative fails', () => {
    const value = makeCandidate('K-EVID-001');
    value.inputClassification = 'authoritative_intake';
    expectInvalid(value, /synthetic submission cannot be represented as authoritative/);
});
test('repository source artifact cannot be mistaken for approval', () => {
    const value = makeCandidate('K-EVID-004');
    value.receipts[0].source.reference = 'data/epic-k-shopify-config-snapshot-2026-10-24.json';
    value.receipts[0].source.artifactType = 'shopify_configuration';
    expectInvalid(value, /discovery evidence, not operational approval|cannot be treated as approval/);
});
test('expired or unconfirmed Epic E/F evidence cannot be promoted', () => {
    const value = makeCandidate('K-EVID-003');
    value.receipts[0].source.reference = 'data/epic-e-measurement-evidence.json';
    value.receipts[0].source.artifactType = 'repository_observation';
    expectInvalid(value, /expired or unconfirmed Epic E\/F evidence|discovery evidence/);
});
test('unverified price fails', () => {
    const value = makeCandidate('K-EVID-005');
    value.receipts[0].assertions.find((entry) => entry.name === 'alaskaRate').value = 'unverified';
    expectInvalid(value, /unverified or unspecified/);
});
test('unverified measurement fails', () => {
    const value = makeCandidate('K-EVID-003');
    value.receipts[0].assertions.find((entry) => entry.name === 'packedShippingWeight').value = null;
    expectInvalid(value, /cannot be null/);
});
test('unverified service availability fails', () => {
    const value = makeCandidate('K-EVID-005');
    value.receipts[0].assertions.find((entry) => entry.name === 'confirmedServiceAvailability').value = 'unknown';
    expectInvalid(value, /unverified or unspecified/);
});
test('documented synthetic zero insurance cost remains distinct from missing cost', () => {
    const value = makeCandidate('K-EVID-006');
    value.receipts[0].assertions.find((entry) => entry.name === 'cost').value = 0;
    const result = assess(value);
    assert.deepEqual(result.errors, []);
    assert.equal(result.candidatePolicyComparison.results.find((entry) => entry.id === 'K-EVID-006').state, 'BLOCKED');
});
test('zero packed weight as a number fails', () => {
    const value = makeCandidate('K-EVID-003');
    value.receipts[0].assertions.find((entry) => entry.name === 'packedShippingWeight').value = 0;
    expectInvalid(value, /packedShippingWeight must be a finite number greater than zero/);
});
test('zero packed weight as a string fails', () => {
    const value = makeCandidate('K-EVID-003');
    value.receipts[0].assertions.find((entry) => entry.name === 'packedShippingWeight').value = '0';
    expectInvalid(value, /numeric strings are not accepted/);
});
test('zero package count fails', () => {
    const value = makeCandidate('K-EVID-003');
    value.receipts[0].assertions.find((entry) => entry.name === 'packageCount').value = 0;
    expectInvalid(value, /packageCount must be a positive integer/);
});
test('fractional package count fails', () => {
    const value = makeCandidate('K-EVID-003');
    value.receipts[0].assertions.find((entry) => entry.name === 'packageCount').value = 1.5;
    expectInvalid(value, /packageCount must be a positive integer/);
});
test('missing package dimensions fail', () => {
    const value = makeCandidate('K-EVID-003');
    value.receipts[0].assertions = value.receipts[0].assertions.filter((entry) => entry.name !== 'packageDimensions');
    expectInvalid(value, /missing mandatory assertions: packageDimensions|packageDimensions must list/);
});
test('invalid or incomplete package dimensions fail', () => {
    const value = makeCandidate('K-EVID-003');
    value.receipts[0].assertions.find((entry) => entry.name === 'packageDimensions').value = '24x18x0';
    expectInvalid(value, /three strictly positive numeric dimensions/);
});
test('missing measurement units fail', () => {
    const value = makeCandidate('K-EVID-003');
    value.receipts[0].assertions = value.receipts[0].assertions.filter((entry) => !['weightUnit', 'dimensionUnit'].includes(entry.name));
    expectInvalid(value, /missing mandatory assertions: weightUnit, dimensionUnit|recognized explicit unit/);
});
test('unrecognized measurement units fail', () => {
    const value = makeCandidate('K-EVID-003');
    value.receipts[0].assertions.find((entry) => entry.name === 'weightUnit').value = 'stones';
    expectInvalid(value, /weightUnit must use a recognized explicit unit/);
});
test('package dimension count must match package count', () => {
    const value = makeCandidate('K-EVID-003');
    value.receipts[0].assertions.find((entry) => entry.name === 'packageCount').value = 2;
    expectInvalid(value, /exactly one complete dimension set for each package/);
});
test('zero Alaska charge fails', () => {
    const value = makeCandidate('K-EVID-005');
    value.receipts[0].assertions.find((entry) => entry.name === 'alaskaRate').value = 0;
    expectInvalid(value, /alaskaRate must be a finite number greater than zero/);
});
test('zero Hawaii charge fails', () => {
    const value = makeCandidate('K-EVID-005');
    value.receipts[0].assertions.find((entry) => entry.name === 'hawaiiRate').value = 0;
    expectInvalid(value, /hawaiiRate must be a finite number greater than zero/);
});
test('numeric strings cannot supply state rates', () => {
    const value = makeCandidate('K-EVID-005');
    value.receipts[0].assertions.find((entry) => entry.name === 'alaskaRate').value = '100';
    expectInvalid(value, /alaskaRate.*numeric strings are not accepted/);
});
test('missing rate currency fails', () => {
    const value = makeCandidate('K-EVID-005');
    value.receipts[0].assertions = value.receipts[0].assertions.filter((entry) => entry.name !== 'currency');
    expectInvalid(value, /currency must be an explicit three-letter currency code/);
});
test('missing state-specific service availability fails', () => {
    const value = makeCandidate('K-EVID-005');
    value.receipts[0].assertions = value.receipts[0].assertions.filter((entry) => entry.name !== 'hawaiiServiceAvailability');
    expectInvalid(value, /hawaiiServiceAvailability must be explicitly true/);
});
test('a general approval reference cannot stand in for separate state approvals', () => {
    const value = makeCandidate('K-EVID-005');
    value.receipts[0].assertions.find((entry) => entry.name === 'hawaiiApprovalReference').value = 'SYNTHETIC_ALASKA_APPROVAL';
    expectInvalid(value, /separate state approval references/);
});
test('missing insurance cost fails while documented zero remains valid', () => {
    const value = makeCandidate('K-EVID-006');
    value.receipts[0].assertions = value.receipts[0].assertions.filter((entry) => entry.name !== 'cost');
    expectInvalid(value, /missing mandatory assertions: cost|cost must be a documented finite number/);
});
test('unknown or numeric-string insurance cost fails', () => {
    const value = makeCandidate('K-EVID-006');
    value.receipts[0].assertions.find((entry) => entry.name === 'cost').value = '0';
    expectInvalid(value, /cost must be a documented finite number/);
});
test('unknown insurance cost fails', () => {
    const value = makeCandidate('K-EVID-006');
    value.receipts[0].assertions.find((entry) => entry.name === 'cost').value = 'unknown';
    expectInvalid(value, /unverified or unspecified|cost must be a documented finite number/);
});
test('negative insurance cost fails', () => {
    const value = makeCandidate('K-EVID-006');
    value.receipts[0].assertions.find((entry) => entry.name === 'cost').value = -1;
    expectInvalid(value, /invalid numeric value|cost must be a documented finite number/);
});
test('missing insurance service fails', () => {
    const value = makeCandidate('K-EVID-006');
    value.receipts[0].assertions = value.receipts[0].assertions.filter((entry) => entry.name !== 'applicableService');
    expectInvalid(value, /missing mandatory assertions: applicableService|applicableService must be an explicit/);
});
test('synthetic evidence claiming acceptance cannot establish authority', () => {
    const result = assess(makeCandidate('K-EVID-006'));
    assert.equal(result.submissionState, 'VALID_STRUCTURE_AND_SCOPE');
    assert.equal(result.authorityAssessment.sourceAuthenticity, 'UNVERIFIED');
    assert.equal(result.authorityAssessment.departmentalAcceptance, 'UNVERIFIED');
    assert.equal(result.authorityAssessment.operationalReadiness, 'BLOCKED');
    assert.equal(result.authorityAssessment.candidateVerificationStatusIsAuthority, false);
});
test('candidate approval claim without independently established authority remains unverified', () => {
    const value = makeCandidate('K-EVID-001');
    value.inputClassification = 'authoritative_intake';
    value.synthetic = false;
    value.receipts[0].id = 'K-RECEIPT-TEST-001';
    value.receipts[0].synthetic = false;
    value.receipts[0].source.artifactType = 'owner_eligibility_register';
    value.receipts[0].source.reference = 'TEST-ONLY-OWNER-REGISTER';
    value.receipts[0].subject.identifiers = ['TEST-PRODUCT', 'TEST-VARIANT'];
    value.receipts[0].assertions.find((entry) => entry.name === 'ownerIdentity').value = 'Test owner identity';
    const result = assess(value);
    assert.deepEqual(result.errors, []);
    assert.equal(result.candidatePolicyComparison.results.find((entry) => entry.id === 'K-EVID-001').state, 'PASS');
    assert.equal(result.candidatePolicyComparison.assessmentScope, 'NON_AUTHORITATIVE_CANDIDATE_COMPARISON');
    assert.equal(result.candidatePolicyComparison.establishesRepositoryAuthority, false);
    assert.equal(result.authorityAssessment.departmentalAcceptance, 'UNVERIFIED');
    assert.equal(result.authorityAssessment.authoritativeRegisterAttachment, 'NOT_ATTACHED');
    assert.equal(result.authorityAssessment.operationalReadiness, 'BLOCKED');
});
test('explicit Product pickup ineligibility is valid evidence but does not authorize pickup', () => {
    const value = makeCandidate('K-EVID-001');
    value.receipts[0].assertions.find((entry) => entry.name === 'pickupEligibility').value = false;
    const result = assess(value);
    assert.deepEqual(result.errors, []);
    assert.equal(result.policyEffects[0].pickupEligibility, 'explicitly_ineligible');
    assert.equal(result.policyEffects[0].ordinaryPickupAuthorized, false);
});
test('future partial receipt register does not invalidate the reusable request manifest', () => {
    const futureReceipts = makeCandidate('K-EVID-004');
    futureReceipts.receipts[0].verificationStatus = 'available';
    const result = validateIntakeManifest(manifest, requirements, futureReceipts, evidenceGap, mapping, mappingAcceptance, { asOf: AS_OF });
    assert.deepEqual(result.errors, []);
    assert.equal(result.receiptCount, 1);
    assert.equal(result.blockedCount, 8);
});
test('expired receipt in a future register fails reusable manifest validation', () => {
    const futureReceipts = makeCandidate('K-EVID-005');
    futureReceipts.receipts[0].validity.expiresAt = AS_OF;
    const result = validateIntakeManifest(manifest, requirements, futureReceipts, evidenceGap, mapping, mappingAcceptance, { asOf: AS_OF });
    assert.match(result.errors.join('\n'), /expired|authoritative receipt register contains/);
});
test('conflicting receipts in a future register fail reusable manifest validation', () => {
    const futureReceipts = makeCandidate('K-EVID-007');
    const conflicting = clone(futureReceipts.receipts[0]);
    conflicting.id = 'SYNTHETIC-RECEIPT-INTAKE-007-B';
    conflicting.source.reference = 'SYNTHETIC-SOURCE-007-B';
    conflicting.source.digest = 'c'.repeat(64);
    conflicting.assertions.find((entry) => entry.name === 'carrierFilingResponsibility').value = 'SYNTHETIC_DIFFERENT_RESPONSIBILITY';
    futureReceipts.receipts.push(conflicting);
    const result = validateIntakeManifest(manifest, requirements, futureReceipts, evidenceGap, mapping, mappingAcceptance, { asOf: AS_OF });
    assert.match(result.errors.join('\n'), /conflicting|authoritative receipt register contains/);
});
test('checkout enforcement inference fails', () => {
    const value = makeCandidate('K-EVID-004');
    value.receipts[0].assertions.push({ name: 'checkoutEnforcement', value: true });
    expectInvalid(value, /cannot infer checkout or payment authority/);
});
test('missing explicit assessment clock fails', () => {
    const result = validateSubmissionCandidate(makeCandidate('K-EVID-008'), manifest, requirements, {});
    assert.equal(result.submissionState, 'INVALID');
    assert.match(result.errors.join('\n'), /explicit assessment time/);
});
test('generated departmental report is deterministic and current', () => assert.equal(
    fs.readFileSync('docs/project/epic-k-operational-evidence-request-report.md', 'utf8'),
    renderDepartmentalRequestReport(manifest, requirements),
));
test('authoritative receipt register remains empty and truthful', () => {
    assert.equal(receipts.status, 'intake_open_no_authoritative_receipts');
    assert.deepEqual(receipts.receipts, []);
    assert.equal(evidenceGap.summary.BLOCKED, 8);
});

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
console.log(`Epic K operational evidence intake tests passed: ${passed}/${tests.length}.`);
