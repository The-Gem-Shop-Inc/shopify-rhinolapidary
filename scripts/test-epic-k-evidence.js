'use strict';

const assert = require('node:assert/strict');
const {
    assessConfigurationDrift,
    schemaErrors,
    verifyEvidence,
} = require('./lib/epic-k-evidence-drift');
const { clone, readJson } = require('./lib/epic-k-policy');

const requirements = readJson('data/epic-k-operational-evidence-requirements.json');
const fixtures = readJson('tests/fixtures/epic-k-evidence-drift-fixtures.json');
const tests = [];
function test(name, run) { tests.push({ name, run }); }

function mutateReceiptSet(mutation) {
    const value = clone(fixtures.baseReceiptSet);
    const receipt = value.receipts[0];
    if (mutation === 'remove_owner') delete receipt.ownerRole;
    if (mutation === 'unsupported_owner') receipt.ownerRole = 'Unsupported role';
    if (mutation === 'unsupported_scope') receipt.support.supportedFacts.pop();
    if (mutation === 'duplicate') value.receipts.push(clone(receipt));
    if (mutation === 'conflict') {
        const conflicting = clone(receipt);
        conflicting.id = 'SYNTHETIC-RECEIPT-004-B';
        conflicting.source.reference = 'SYNTHETIC-SOURCE-SERVICES-002';
        conflicting.assertions[0].value = 'rejected';
        value.receipts.push(conflicting);
    }
    if (mutation === 'expired') receipt.validity.expiresAt = fixtures.evaluationTime;
    if (mutation === 'partial') {
        receipt.support.coverage = 'partial';
        receipt.support.supportedFacts = ['Approved paid service'];
    }
    if (mutation === 'available') receipt.verificationStatus = 'available';
    return value;
}

function mutateSnapshot(mutation) {
    const value = clone(fixtures.baseSnapshot);
    if (mutation === 'zero_rate') value.rates[0].amountCents = 0;
    if (mutation === 'threshold_free') {
        value.rates[0].type = 'threshold_free';
        value.rates[0].thresholdCents = 10000;
    }
    if (mutation === 'missing_discounts') {
        value.source.datasetCompleteness.discounts = 'missing';
        value.discounts = [];
    }
    if (mutation === 'permissive_machine') value.profiles[1].machineShipmentMode = 'ordinary_checkout_possible';
    if (mutation === 'missing_machine_profile') {
        value.source.datasetCompleteness.profiles = 'partial';
        value.profiles = value.profiles.filter((profile) => profile.id !== 'SYNTHETIC_PROFILE_MACHINE_QUOTE');
    }
    if (mutation === 'unknown_pickup') value.products[1].pickupEligibility = 'unknown';
    if (mutation === 'missing_pickup_readiness') value.pickup[0].inventoryReadinessStatus = 'missing';
    if (mutation === 'international_zone') {
        value.zones.push({ id: 'SYNTHETIC_ZONE_CA', countryCodes: ['CA'], subdivisionCodes: [] });
        value.source.datasetCompleteness.markets = 'missing';
        value.markets = [];
    }
    if (mutation === 'unapproved_ak') value.rates[1].operationalApproval = 'missing';
    if (mutation === 'missing_weight') value.products[1].shippingWeight = null;
    if (mutation === 'zero_weight') value.products[1].shippingWeight.value = 0;
    if (mutation === 'missing_packages') {
        value.products[1].packageCharacteristicsStatus = 'missing';
        value.products[1].packages = [];
    }
    if (mutation === 'expired_snapshot') {
        value.source.validity = { kind: 'interval', expiresAt: fixtures.evaluationTime };
    }
    return value;
}

function resultById(report, id) {
    return report.results.find((result) => result.id === id);
}

test('canonical empty intake validates and blocks every evidence requirement', () => {
    const actual = verifyEvidence(readJson('data/epic-k-evidence-receipts.json'), requirements);
    assert.deepEqual(actual.errors, []);
    assert.equal(actual.report.summary.BLOCKED, 8);
    assert.equal(actual.report.overallState, 'BLOCKED');
});

for (const fixture of fixtures.receiptCases) {
    test(`evidence receipt fixture ${fixture.id}`, () => {
        const input = mutateReceiptSet(fixture.mutation);
        const schema = schemaErrors('schemas/epic-k-evidence-receipts.schema.json', input, 'receipt fixture');
        assert.equal(schema.length === 0, fixture.expectedSchemaValid);
        const actual = verifyEvidence(input, requirements, { asOf: fixtures.evaluationTime });
        if (!fixture.expectedSchemaValid) {
            assert(actual.errors.length > 0);
            return;
        }
        assert.equal(resultById(actual.report, 'K-EVID-004').state, fixture.expectedRequirementState);
    });
}

test('unsupported evidence category is rejected by the receipt schema', () => {
    const value = mutateReceiptSet('none');
    value.receipts[0].category = 'unsupported_category';
    assert(schemaErrors('schemas/epic-k-evidence-receipts.schema.json', value, 'receipt fixture').length > 0);
});

test('synthetic accepted receipt never produces operational readiness', () => {
    const actual = verifyEvidence(fixtures.baseReceiptSet, requirements, { asOf: fixtures.evaluationTime });
    assert.equal(resultById(actual.report, 'K-EVID-004').state, 'BLOCKED');
    assert.equal(actual.report.operationalReadiness, 'BLOCKED');
});

test('available evidence remains distinguishable from accepted evidence', () => {
    const available = verifyEvidence(mutateReceiptSet('available'), requirements, { asOf: fixtures.evaluationTime });
    assert.match(resultById(available.report, 'K-EVID-004').message, /not accepted/);
});

for (const fixture of fixtures.snapshotCases) {
    test(`configuration snapshot fixture ${fixture.id}`, () => {
        const input = mutateSnapshot(fixture.mutation);
        const actual = assessConfigurationDrift(input, undefined, { asOf: fixtures.evaluationTime });
        assert.deepEqual(actual.errors, []);
        assert.equal(resultById(actual.report, fixture.expectedDomain).state, fixture.expectedState);
        assert.equal(actual.report.liveCheckoutEnforcement, 'UNVERIFIED');
        assert.equal(actual.report.operationalReadiness, 'BLOCKED');
    });
}

test('international zone finding does not claim an active international checkout market', () => {
    const actual = assessConfigurationDrift(mutateSnapshot('international_zone'), undefined, { asOf: fixtures.evaluationTime });
    assert.match(resultById(actual.report, 'geography').message, /does not prove an active international checkout market/);
});

test('valid synthetic snapshot scopes PASS results to supplied comparison data', () => {
    const actual = assessConfigurationDrift(fixtures.baseSnapshot, undefined, { asOf: fixtures.evaluationTime });
    assert.equal(resultById(actual.report, 'free_shipping').state, 'PASS');
    assert.equal(resultById(actual.report, 'machine_shipping').state, 'PASS');
    assert.equal(resultById(actual.report, 'pickup').state, 'PASS');
    assert.equal(resultById(actual.report, 'geography').state, 'PASS');
    assert.equal(resultById(actual.report, 'product_logistics').state, 'PASS');
    assert.equal(resultById(actual.report, 'evidence_freshness').state, 'UNVERIFIED');
    assert.equal(actual.report.liveCheckoutEnforcement, 'UNVERIFIED');
});

test('missing promotional discount evidence cannot produce clean compliance', () => {
    const actual = assessConfigurationDrift(mutateSnapshot('missing_discounts'), undefined, { asOf: fixtures.evaluationTime });
    assert.equal(resultById(actual.report, 'free_shipping').state, 'BLOCKED');
});

test('active pickup location does not prove Product eligibility or inventory readiness', () => {
    const eligibility = assessConfigurationDrift(mutateSnapshot('unknown_pickup'), undefined, { asOf: fixtures.evaluationTime });
    const readiness = assessConfigurationDrift(mutateSnapshot('missing_pickup_readiness'), undefined, { asOf: fixtures.evaluationTime });
    assert.equal(resultById(eligibility.report, 'pickup').state, 'BLOCKED');
    assert.equal(resultById(readiness.report, 'pickup').state, 'BLOCKED');
});

test('malformed normalized snapshot is rejected before comparison', () => {
    const value = mutateSnapshot('none');
    delete value.source.collectorAuthority;
    const actual = assessConfigurationDrift(value, undefined, { asOf: fixtures.evaluationTime });
    assert(actual.errors.length > 0);
    assert.equal(actual.report, null);
});

let passed = 0;
for (const entry of tests) {
    try {
        entry.run();
        passed += 1;
    } catch (error) {
        console.error(`FAIL ${entry.name}`);
        throw error;
    }
}
console.log(`Epic K evidence and drift tests passed: ${passed}/${tests.length}.`);
