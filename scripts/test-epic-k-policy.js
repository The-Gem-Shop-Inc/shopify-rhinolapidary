'use strict';

const assert = require('node:assert/strict');
const {
    ROUTES,
    assessFulfillment,
    assessQuotation,
    clone,
    normalizeQuoteScope,
    readJson,
    validateContentClaims,
    validateContracts,
} = require('./lib/epic-k-policy');

const decisions = readJson('data/epic-k-provisional-decisions.json');
const policy = readJson('data/epic-k-fulfillment-policy.json');
const evidence = readJson('data/epic-k-operational-evidence-requirements.json');
const scenarios = readJson('tests/fixtures/epic-k-policy-scenarios.json');
const tests = [];

function test(name, run) {
    tests.push({ name, run });
}

function scenario(id) {
    return clone(scenarios.routingCases.find((entry) => entry.id === id));
}

function quotationScenario() {
    const value = scenario('K-SYN-MACHINE-MIXED-CART');
    value.request.deliveryRequirements = {
        designation: 'commercial',
        liftgateRequired: false,
        accessInformation: 'SYNTHETIC-DOCK-ACCESS',
    };
    value.request.insuranceSelection = 'declined';
    return value;
}

function approvedQuote(value) {
    return {
        id: 'SYNTHETIC-QUOTE-A',
        status: 'operations_approved',
        approvedBy: { role: 'warehouse_or_shipping_operations', id: 'SYNTHETIC-OPERATOR-A' },
        scope: normalizeQuoteScope(value),
        expiresAt: '2026-10-30T12:00:00.000Z',
        destinationApproval: { rateApproved: true, serviceAvailabilityConfirmed: true },
        insurance: {
            availabilityDocumented: false,
            costDocumented: false,
            amountCents: null,
            customerAccepted: false,
        },
    };
}

test('canonical contracts and fixtures validate', () => {
    assert.deepEqual(validateContracts({ decisions, policy, evidence, scenarios }), []);
});

for (const fixture of scenarios.routingCases) {
    test(`routing fixture ${fixture.id}`, () => {
        const actual = assessFulfillment(fixture, policy);
        assert.equal(actual.route, fixture.expected.route);
        assert.equal(actual.policyEligible, fixture.expected.policyEligible);
        assert.equal(actual.shopifyCheckoutEnforceable, 'unverified');
        assert.equal(actual.paymentAuthorized, false);
    });
}

test('pickup is a distinct route and is not classified as free shipping', () => {
    const actual = assessFulfillment(scenario('K-SYN-PICKUP-MACHINE-APPROVED'), policy);
    assert.equal(actual.route, ROUTES.PICKUP);
    assert.doesNotMatch(actual.reasons.join(' '), /free shipping/i);
});

test('approved whole-cart quotation may proceed to invoice in a synthetic scenario', () => {
    const value = quotationScenario();
    const actual = assessQuotation(value, approvedQuote(value));
    assert.equal(actual.canInvoice, true);
    assert.equal(actual.paymentAuthorized, true);
});

test('quotation cannot be invoiced before operations approval', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    quote.status = 'requested';
    assert.equal(assessQuotation(value, quote).canInvoice, false);
});

test('expired quotation requires renewed authorization', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    quote.expiresAt = '2026-10-22T12:00:00.000Z';
    const actual = assessQuotation(value, quote);
    assert.equal(actual.canInvoice, false);
    assert.match(actual.reasons.join(' '), /expired/);
});

test('complete-cart scope rejects a quotation missing an accessory', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    quote.scope.cart = quote.scope.cart.filter((item) => item.kind === 'machine');
    assert.equal(assessQuotation(value, quote).canInvoice, false);
});

test('machine quantity change invalidates prior payment authorization', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    value.cart.items[0].quantity += 1;
    assert.equal(assessQuotation(value, quote).canInvoice, false);
});

test('destination change invalidates prior payment authorization', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    value.request.destination.subdivisionCode = 'MN';
    assert.equal(assessQuotation(value, quote).canInvoice, false);
});

test('delivery-requirements change invalidates prior payment authorization', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    value.request.deliveryRequirements.liftgateRequired = true;
    assert.equal(assessQuotation(value, quote).canInvoice, false);
});

test('insurance-selection change invalidates prior payment authorization', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    value.request.insuranceSelection = 'selected';
    const actual = assessQuotation(value, quote);
    assert.equal(actual.canInvoice, false);
    assert.match(actual.reasons.join(' '), /scope|insurance/);
});

test('selected insurance requires documented availability, cost, and acceptance', () => {
    const value = quotationScenario();
    value.request.insuranceSelection = 'selected';
    const quote = approvedQuote(value);
    quote.scope = normalizeQuoteScope(value);
    quote.insurance = {
        availabilityDocumented: true,
        costDocumented: true,
        amountCents: 2500,
        customerAccepted: true,
    };
    assert.equal(assessQuotation(value, quote).canInvoice, true);
});

test('missing insurance premium is not treated as free purchased coverage', () => {
    const value = quotationScenario();
    value.request.insuranceSelection = 'selected';
    const quote = approvedQuote(value);
    quote.scope = normalizeQuoteScope(value);
    quote.insurance = {
        availabilityDocumented: true,
        costDocumented: false,
        amountCents: null,
        customerAccepted: true,
    };
    const actual = assessQuotation(value, quote);
    assert.equal(actual.canInvoice, false);
    assert.match(actual.reasons.join(' '), /documented availability and cost/);
});

test('Alaska quotation cannot invoice without separate rate and service evidence', () => {
    const value = scenario('K-SYN-ALASKA-QUOTE-INTAKE');
    value.request.deliveryRequirements = {
        designation: 'residential', liftgateRequired: false, accessInformation: 'SYNTHETIC-ACCESS',
    };
    value.request.insuranceSelection = 'declined';
    const quote = approvedQuote(value);
    quote.destinationApproval = { rateApproved: false, serviceAvailabilityConfirmed: false };
    assert.equal(assessQuotation(value, quote).canInvoice, false);
});

test('Hawaii quotation may invoice only after separate rate and service approval', () => {
    const value = scenario('K-SYN-HAWAII-QUOTE-INTAKE');
    value.request.deliveryRequirements = {
        designation: 'commercial', liftgateRequired: true, accessInformation: 'SYNTHETIC-ACCESS',
    };
    value.request.insuranceSelection = 'declined';
    const quote = approvedQuote(value);
    assert.equal(assessQuotation(value, quote).canInvoice, true);
});

test('unapproved numeric delivery estimate is rejected', () => {
    const errors = validateContentClaims([{
        id: 'K-CONTENT-NUMERIC-UNAPPROVED',
        claimType: 'delivery_estimate',
        text: 'Delivery takes 3-5 business days.',
        authority: { status: 'missing' },
    }], policy);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /operations approval/);
});

test('operations-approved numeric delivery estimate is distinguishable', () => {
    assert.deepEqual(validateContentClaims([{
        id: 'K-CONTENT-NUMERIC-APPROVED',
        claimType: 'delivery_estimate',
        text: 'Synthetic delivery estimate: 3-5 business days.',
        authority: { status: 'approved_operations' },
    }], policy), []);
});

test('machine specification number is not treated as a delivery estimate', () => {
    assert.deepEqual(validateContentClaims([{
        id: 'K-CONTENT-SPEC', claimType: 'machine_specification', text: 'Synthetic motor specification: 120 V.',
    }], policy), []);
});

test('quotation expiration date is not treated as a delivery estimate', () => {
    assert.deepEqual(validateContentClaims([{
        id: 'K-CONTENT-EXPIRATION', claimType: 'quotation_expiration', text: 'Synthetic quotation expires 2026-10-30.',
    }], policy), []);
});

test('claims instructions require Rhino notification and a designated process', () => {
    const errors = validateContentClaims([{
        id: 'K-CONTENT-CLAIMS', claimType: 'carrier_claims', text: 'Follow carrier instructions.',
        rhinoNotificationRequired: false, designatedContactProcess: '',
    }], policy);
    assert.equal(errors.length, 2);
});

test('claims instructions may not eliminate every remedy for uninsured shipments', () => {
    const errors = validateContentClaims([{
        id: 'K-CONTENT-REMEDIES', claimType: 'carrier_claims', text: 'Notify Rhino.',
        rhinoNotificationRequired: true, designatedContactProcess: 'SYNTHETIC-CONTACT',
        uninsuredRemediesEliminated: true,
    }], policy);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /categorically eliminate/);
});

test('final decision status is rejected', () => {
    const changed = clone(decisions);
    changed.decisions[0].status = 'final';
    assert(validateContracts({ decisions: changed, policy, evidence, scenarios }).some((error) => /provisional|must be equal/.test(error)));
});

test('free-shipping policy drift is rejected', () => {
    const changed = clone(policy);
    changed.shipping.freeShippingAllowed = true;
    assert(validateContracts({ decisions, policy: changed, evidence, scenarios }).some((error) => /free shipping|must be equal/.test(error)));
});

test('invented quote-validity duration is rejected', () => {
    const changed = clone(policy);
    changed.quotation.validity.durationDefined = true;
    assert(validateContracts({ decisions, policy: changed, evidence, scenarios }).some((error) => /validity duration|must be equal/.test(error)));
});

test('claim of live checkout enforcement is rejected', () => {
    const changed = clone(policy);
    changed.enforcement.liveCheckoutEnforcement = true;
    assert(validateContracts({ decisions, policy: changed, evidence, scenarios }).some((error) => /live Shopify enforcement|must be equal/.test(error)));
});

test('synthetic evidence cannot satisfy operational readiness', () => {
    const changed = clone(evidence);
    changed.requirements[0].syntheticDataMaySatisfy = true;
    assert(validateContracts({ decisions, policy, evidence: changed, scenarios }).some((error) => /synthetic|must be equal/.test(error)));
});

test('real Shopify identifiers are rejected from synthetic fixtures', () => {
    const changed = clone(scenarios);
    changed.routingCases[0].cart.items[0].id = 'gid://shopify/ProductVariant/123';
    assert(validateContracts({ decisions, policy, evidence, scenarios: changed }).some((error) => /Shopify GIDs|pattern/.test(error)));
});

test('unknown pickup eligibility cannot be changed to default approval', () => {
    const changed = clone(policy);
    changed.pickup.unknownEligibility = 'approved';
    assert(validateContracts({ decisions, policy: changed, evidence, scenarios }).some((error) => /unknown pickup|must be equal/.test(error)));
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
console.log(`Epic K policy tests passed: ${passed}/${tests.length}.`);
