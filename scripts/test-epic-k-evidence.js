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
    if (mutation === 'expired') receipt.validity.expiresAt = fixtures.assessmentTime;
    if (mutation === 'partial') {
        receipt.support.coverage = 'partial';
        receipt.support.supportedFacts = ['Approved paid service'];
    }
    if (mutation === 'available') receipt.verificationStatus = 'available';
    return value;
}

function mutateSnapshot(mutation) {
    const value = clone(fixtures.baseSnapshot);
    if (mutation === 'zero_rate') {
        value.rates[0].amountCents = 0;
        value.rates[0].effectivePriceStatus = 'verified_zero';
    }
    if (mutation === 'threshold_free') {
        value.rates[0].type = 'threshold_free';
        value.rates[0].thresholdCents = 10000;
        value.rates[0].effectivePriceStatus = 'verified_zero';
    }
    if (mutation === 'unknown_discount') {
        value.discounts[0].active = true;
        value.discounts[0].shippingEffect = 'unverified';
        value.discounts[0].effectiveShippingPriceStatus = 'unverified';
    }
    if (mutation === 'reduced_discount_unknown') {
        value.discounts[0].active = true;
        value.discounts[0].shippingEffect = 'reduced_shipping';
        value.discounts[0].effectiveShippingPriceStatus = 'unverified';
    }
    if (mutation === 'reduced_discount_positive') {
        value.discounts[0].active = true;
        value.discounts[0].shippingEffect = 'reduced_shipping';
        value.discounts[0].effectiveShippingPriceStatus = 'verified_positive';
    }
    if (mutation === 'unknown_rate') {
        value.rates[0].type = 'carrier_calculated';
        value.rates[0].amountCents = null;
        value.rates[0].effectivePriceStatus = 'unverified';
    }
    if (mutation === 'missing_discounts') {
        value.source.datasetCompleteness.discounts = 'missing';
        value.discounts = [];
    }
    if (mutation === 'permissive_machine') value.profiles[1].machineShipmentMode = 'ordinary_checkout_possible';
    if (mutation === 'unverified_machine') value.profiles[1].machineShipmentMode = 'unverified';
    if (mutation === 'missing_machine_profile') {
        value.source.datasetCompleteness.profiles = 'partial';
        value.profiles = value.profiles.filter((profile) => profile.id !== 'SYNTHETIC_PROFILE_MACHINE_QUOTE');
    }
    if (mutation === 'unknown_pickup') value.products[1].pickupEligibility = 'unknown';
    if (mutation === 'missing_pickup_readiness') value.pickup[0].inventoryReadinessStatus = 'missing';
    if (['international_inactive_market', 'international_unknown_market', 'international_confirmed_market'].includes(mutation)) {
        value.zones.push({ id: 'SYNTHETIC_ZONE_CA', countryCodes: ['CA'], subdivisionCodes: [] });
        value.markets.push({
            id: 'SYNTHETIC_MARKET_CA',
            countryCodes: ['CA'],
            active: mutation !== 'international_inactive_market',
            checkoutAvailabilityEvidence: mutation === 'international_confirmed_market'
                ? 'confirmed'
                : mutation === 'international_inactive_market' ? 'absent' : 'unverified',
        });
    }
    if (mutation === 'territory_scope') value.zones[0].subdivisionCodes.push('PR');
    if (mutation === 'territory_and_international') {
        value.zones[0].subdivisionCodes.push('PR');
        value.zones.push({ id: 'SYNTHETIC_ZONE_CA', countryCodes: ['CA'], subdivisionCodes: [] });
        value.markets.push({ id: 'SYNTHETIC_MARKET_CA', countryCodes: ['CA'], active: true, checkoutAvailabilityEvidence: 'unverified' });
    }
    if (mutation === 'missing_ak_rate') value.rates = value.rates.filter((rate) => !rate.subdivisionCodes.includes('AK'));
    if (mutation === 'missing_hi_rate') value.rates = value.rates.filter((rate) => !rate.subdivisionCodes.includes('HI'));
    if (mutation === 'unapproved_ak') value.rates[1].operationalApproval = 'missing';
    if (mutation === 'missing_weight') value.products[1].shippingWeight = null;
    if (mutation === 'zero_weight') value.products[1].shippingWeight.value = 0;
    if (mutation.startsWith('weight_status_')) {
        const status = mutation.slice('weight_status_'.length);
        for (const product of value.products) product.shippingWeight.evidenceStatus = status;
    }
    if (mutation === 'missing_packages') {
        value.products[1].packageCharacteristicsStatus = 'missing';
        value.products[1].packages = [];
    }
    if (mutation === 'expired_snapshot') {
        value.source.validity = { kind: 'interval', expiresAt: fixtures.assessmentTime };
    }
    if (mutation === 'collected_after_assessment') value.source.collectedAt = '2026-10-23T19:00:00.000Z';
    return value;
}

function resultById(report, id) {
    return report.results.find((result) => result.id === id);
}

test('canonical empty intake validates and blocks every evidence requirement', () => {
    const actual = verifyEvidence(readJson('data/epic-k-evidence-receipts.json'), requirements, { asOf: fixtures.assessmentTime });
    assert.deepEqual(actual.errors, []);
    assert.equal(actual.report.summary.BLOCKED, 8);
    assert.equal(actual.report.overallState, 'BLOCKED');
});

for (const fixture of fixtures.receiptCases) {
    test(`evidence receipt fixture ${fixture.id}`, () => {
        const input = mutateReceiptSet(fixture.mutation);
        const schema = schemaErrors('schemas/epic-k-evidence-receipts.schema.json', input, 'receipt fixture');
        assert.equal(schema.length === 0, fixture.expectedSchemaValid);
        const actual = verifyEvidence(input, requirements, { asOf: fixtures.assessmentTime });
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
    const actual = verifyEvidence(fixtures.baseReceiptSet, requirements, { asOf: fixtures.assessmentTime });
    assert.equal(resultById(actual.report, 'K-EVID-004').state, 'BLOCKED');
    assert.equal(actual.report.operationalReadiness, 'BLOCKED');
});

test('available evidence remains distinguishable from accepted evidence', () => {
    const available = verifyEvidence(mutateReceiptSet('available'), requirements, { asOf: fixtures.assessmentTime });
    assert.match(resultById(available.report, 'K-EVID-004').message, /not accepted/);
});

test('missing receipt assessment time cannot establish freshness', () => {
    const actual = verifyEvidence(fixtures.baseReceiptSet, requirements);
    assert.equal(actual.report.assessedAt, null);
    assert.match(resultById(actual.report, 'K-EVID-004').message, /explicit assessment time/);
});

test('invalid receipt assessment time cannot establish freshness', () => {
    const actual = verifyEvidence(fixtures.baseReceiptSet, requirements, { asOf: 'invalid-clock' });
    assert.equal(actual.report.assessedAt, null);
    assert.match(resultById(actual.report, 'K-EVID-004').message, /explicit assessment time/);
});

test('receipt collected after assessment is unavailable at that time', () => {
    const value = mutateReceiptSet('none');
    value.receipts[0].collectedAt = '2026-10-23T19:00:00.000Z';
    const actual = verifyEvidence(value, requirements, { asOf: fixtures.assessmentTime });
    assert.match(resultById(actual.report, 'K-EVID-004').message, /not yet available/);
});

for (const fixture of fixtures.snapshotCases) {
    test(`configuration snapshot fixture ${fixture.id}`, () => {
        const input = mutateSnapshot(fixture.mutation);
        const actual = assessConfigurationDrift(input, undefined, { asOf: fixtures.assessmentTime });
        assert.deepEqual(actual.errors, []);
        assert.equal(resultById(actual.report, fixture.expectedDomain).state, fixture.expectedState);
        assert.equal(actual.report.liveCheckoutEnforcement, 'UNVERIFIED');
        assert.equal(actual.report.operationalReadiness, 'BLOCKED');
    });
}

test('international zone without confirmed checkout remains unresolved', () => {
    const actual = assessConfigurationDrift(mutateSnapshot('international_unknown_market'), undefined, { asOf: fixtures.assessmentTime });
    assert.equal(resultById(actual.report, 'geography').state, 'UNVERIFIED');
    assert.match(resultById(actual.report, 'geography').message, /does not confirm customer checkout availability/);
});

test('territory or military codes are confirmed domestic scope discrepancies', () => {
    const value = mutateSnapshot('territory_scope');
    value.zones[0].subdivisionCodes.push('AA');
    const actual = assessConfigurationDrift(value, undefined, { asOf: fixtures.assessmentTime });
    const geography = resultById(actual.report, 'geography');
    assert.equal(geography.state, 'FAIL');
    assert.match(geography.findings.find((entry) => entry.id === 'domestic_destination_scope').message, /AA, PR/);
});

test('domestic discrepancy is not masked by unresolved international exposure', () => {
    const actual = assessConfigurationDrift(mutateSnapshot('territory_and_international'), undefined, { asOf: fixtures.assessmentTime });
    const geography = resultById(actual.report, 'geography');
    assert.equal(geography.state, 'FAIL');
    assert.equal(geography.findings.find((entry) => entry.id === 'domestic_destination_scope').state, 'FAIL');
    assert.equal(geography.findings.find((entry) => entry.id === 'international_checkout_exposure').state, 'UNVERIFIED');
});

test('fully compliant 50-state input keeps independent geography findings passing', () => {
    const geography = resultById(assessConfigurationDrift(mutateSnapshot('none'), undefined, { asOf: fixtures.assessmentTime }).report, 'geography');
    assert.equal(geography.state, 'PASS');
    assert(geography.findings.every((entry) => entry.state === 'PASS'));
});

test('missing Alaska and Hawaii approvals remain individually visible', () => {
    for (const [mutation, findingId] of [['missing_ak_rate', 'ak_rate_approval'], ['missing_hi_rate', 'hi_rate_approval']]) {
        const geography = resultById(assessConfigurationDrift(mutateSnapshot(mutation), undefined, { asOf: fixtures.assessmentTime }).report, 'geography');
        assert.equal(geography.state, 'BLOCKED');
        assert.equal(geography.findings.find((entry) => entry.id === findingId).state, 'BLOCKED');
        assert.match(geography.findings.find((entry) => entry.id === findingId).message, /invoicing is blocked/);
    }
});

test('confirmed international checkout remains a verified policy conflict', () => {
    const geography = resultById(assessConfigurationDrift(mutateSnapshot('international_confirmed_market'), undefined, { asOf: fixtures.assessmentTime }).report, 'geography');
    assert.equal(geography.state, 'FAIL');
    assert.equal(geography.findings.find((entry) => entry.id === 'international_checkout_exposure').state, 'FAIL');
});

test('multiple geography discrepancies are reported together', () => {
    const value = mutateSnapshot('territory_and_international');
    value.markets.find((market) => market.countryCodes.includes('CA')).checkoutAvailabilityEvidence = 'confirmed';
    value.rates[1].operationalApproval = 'missing';
    const geography = resultById(assessConfigurationDrift(value, undefined, { asOf: fixtures.assessmentTime }).report, 'geography');
    assert.equal(geography.state, 'FAIL');
    assert.deepEqual(
        geography.findings.filter((entry) => entry.state === 'FAIL').map((entry) => entry.id),
        ['domestic_destination_scope', 'international_checkout_exposure', 'ak_rate_approval'],
    );
});

test('reduced shipping discount remains blocked without verified positive effective charge', () => {
    const actual = assessConfigurationDrift(mutateSnapshot('reduced_discount_unknown'), undefined, { asOf: fixtures.assessmentTime });
    assert.equal(resultById(actual.report, 'free_shipping').state, 'BLOCKED');
});

test('reduced shipping discount can pass only with verified positive effective charge', () => {
    const actual = assessConfigurationDrift(mutateSnapshot('reduced_discount_positive'), undefined, { asOf: fixtures.assessmentTime });
    assert.equal(resultById(actual.report, 'free_shipping').state, 'PASS');
});

test('valid synthetic snapshot scopes PASS results to supplied comparison data', () => {
    const actual = assessConfigurationDrift(fixtures.baseSnapshot, undefined, { asOf: fixtures.assessmentTime });
    assert.equal(resultById(actual.report, 'free_shipping').state, 'PASS');
    assert.equal(resultById(actual.report, 'machine_shipping').state, 'PASS');
    assert.equal(resultById(actual.report, 'pickup').state, 'PASS');
    assert.equal(resultById(actual.report, 'geography').state, 'PASS');
    assert.equal(resultById(actual.report, 'product_logistics').state, 'UNVERIFIED');
    assert.equal(resultById(actual.report, 'evidence_freshness').state, 'UNVERIFIED');
    assert.equal(actual.report.liveCheckoutEnforcement, 'UNVERIFIED');
});

test('missing promotional discount evidence cannot produce clean compliance', () => {
    const actual = assessConfigurationDrift(mutateSnapshot('missing_discounts'), undefined, { asOf: fixtures.assessmentTime });
    assert.equal(resultById(actual.report, 'free_shipping').state, 'BLOCKED');
});

test('active pickup location does not prove Product eligibility or inventory readiness', () => {
    const eligibility = assessConfigurationDrift(mutateSnapshot('unknown_pickup'), undefined, { asOf: fixtures.assessmentTime });
    const readiness = assessConfigurationDrift(mutateSnapshot('missing_pickup_readiness'), undefined, { asOf: fixtures.assessmentTime });
    assert.equal(resultById(eligibility.report, 'pickup').state, 'BLOCKED');
    assert.equal(resultById(readiness.report, 'pickup').state, 'BLOCKED');
});

test('malformed normalized snapshot is rejected before comparison', () => {
    const value = mutateSnapshot('none');
    delete value.source.collectorAuthority;
    const actual = assessConfigurationDrift(value, undefined, { asOf: fixtures.assessmentTime });
    assert(actual.errors.length > 0);
    assert.equal(actual.report, null);
});

test('missing snapshot assessment time cannot establish freshness', () => {
    const actual = assessConfigurationDrift(fixtures.baseSnapshot);
    assert.equal(actual.report.assessedAt, null);
    assert.equal(resultById(actual.report, 'evidence_freshness').state, 'BLOCKED');
});

test('invalid snapshot assessment time cannot establish freshness', () => {
    const actual = assessConfigurationDrift(fixtures.baseSnapshot, undefined, { asOf: 'invalid-clock' });
    assert.equal(actual.report.assessedAt, null);
    assert.equal(resultById(actual.report, 'evidence_freshness').state, 'BLOCKED');
});

test('evaluation time before the recorded assessment cannot establish freshness', () => {
    const actual = assessConfigurationDrift(fixtures.baseSnapshot, undefined, { asOf: '2026-10-23T17:59:30.000Z' });
    assert.equal(resultById(actual.report, 'evidence_freshness').state, 'BLOCKED');
});

test('Shopify source verification does not imply Product Owner mapping acceptance', () => {
    const value = mutateSnapshot('none');
    value.synthetic = false;
    value.source.mappingStatus = 'source_verified_mapping_pending_acceptance';
    value.source.sourceVerificationStatus = 'verified';
    value.source.mappingAcceptanceStatus = 'pending';
    value.source.collectionAuthorizationStatus = 'authorized';
    value.source.operationalAuthorityStatus = 'blocked';
    value.source.authorityStatus = 'accepted';
    const actual = assessConfigurationDrift(value, undefined, { asOf: fixtures.assessmentTime });
    assert.equal(resultById(actual.report, 'evidence_freshness').state, 'BLOCKED');
});

test('previously valid snapshot expires when evaluated later', () => {
    const value = mutateSnapshot('none');
    value.source.validity = { kind: 'interval', expiresAt: '2026-10-24T00:00:00.000Z' };
    const before = assessConfigurationDrift(value, undefined, { asOf: fixtures.assessmentTime });
    const after = assessConfigurationDrift(value, undefined, { asOf: '2026-10-24T00:00:01.000Z' });
    assert.equal(resultById(before.report, 'evidence_freshness').state, 'UNVERIFIED');
    assert.equal(resultById(after.report, 'evidence_freshness').state, 'FAIL');
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
