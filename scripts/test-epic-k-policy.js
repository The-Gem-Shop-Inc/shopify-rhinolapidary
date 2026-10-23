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

const EVALUATION_TIME = '2026-10-23T12:00:00.000Z';

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
        shippingService: {
            id: 'SYNTHETIC-FREIGHT-SERVICE-A',
            supportStatus: 'documented_supported',
        },
        shippingCharge: {
            documented: true,
            amountCents: 12500,
            currencyCode: 'USD',
            approvalStatus: 'operations_approved',
        },
        destinationApproval: { rateApproved: true, serviceAvailabilityConfirmed: true },
        insurance: {
            availabilityDocumented: false,
            costDocumented: false,
            amountCents: null,
            customerAccepted: false,
        },
    };
}

function assessment(value, quote, now = EVALUATION_TIME) {
    return assessQuotation(value, quote, { now, policy });
}

function assertAssessmentSatisfied(actual) {
    assert.equal(actual.repositoryPolicyAssessment, 'satisfied');
    assert.equal(actual.repositoryInvoiceEvidenceComplete, true);
    assert.equal(actual.authorizationScope, 'repository_policy_assessment_only');
    assert.equal(actual.canInvoice, false);
    assert.equal(actual.paymentAuthorized, false);
    assert.equal(actual.shopifyCheckoutEnforceable, 'unverified');
    assert.equal(actual.operationalReadiness, 'unverified');
}

function assertAssessmentRejected(actual, reasonPattern) {
    assert.equal(actual.repositoryPolicyAssessment, 'not_satisfied');
    assert.equal(actual.repositoryInvoiceEvidenceComplete, false);
    assert.equal(actual.canInvoice, false);
    assert.equal(actual.paymentAuthorized, false);
    if (reasonPattern) assert.match(actual.reasons.join(' '), reasonPattern);
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

test('complete synthetic quotation satisfies only the repository policy assessment', () => {
    const value = quotationScenario();
    assertAssessmentSatisfied(assessment(value, approvedQuote(value)));
});

test('passing offline assessment never authorizes Shopify payment or a real invoice', () => {
    const value = quotationScenario();
    const actual = assessment(value, approvedQuote(value));
    assertAssessmentSatisfied(actual);
    assert.equal(actual.paymentAuthorized, false);
    assert.equal(actual.canInvoice, false);
});

test('quotation assessment fails before operations approval', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    quote.status = 'requested';
    assertAssessmentRejected(assessment(value, quote), /operations approval/);
});

test('expired quotation requires renewed authorization', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    quote.expiresAt = '2026-10-22T12:00:00.000Z';
    assertAssessmentRejected(assessment(value, quote), /expired/);
});

test('malformed quotation expiration is rejected', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    quote.expiresAt = 'not-a-timestamp';
    assertAssessmentRejected(assessment(value, quote), /expiration is missing or invalid/);
});

test('invalid calendar quotation expiration is rejected', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    quote.expiresAt = '2026-02-31T12:00:00.000Z';
    assertAssessmentRejected(assessment(value, quote), /expiration is missing or invalid/);
});

test('missing quotation expiration is rejected', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    delete quote.expiresAt;
    assertAssessmentRejected(assessment(value, quote), /expiration is missing or invalid/);
});

test('missing evaluation time cannot satisfy quotation assessment', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    assertAssessmentRejected(assessQuotation(value, quote, { policy }), /valid explicit evaluation time/);
});

test('invalid evaluation time cannot satisfy quotation assessment', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    assertAssessmentRejected(assessment(value, quote, 'invalid-clock'), /valid explicit evaluation time/);
});

test('complete-cart scope rejects a quotation missing an accessory', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    quote.scope.cart = quote.scope.cart.filter((item) => item.kind === 'machine');
    assertAssessmentRejected(assessment(value, quote), /scope does not match/);
});

test('machine quantity change invalidates prior payment authorization', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    value.cart.items[0].quantity += 1;
    assertAssessmentRejected(assessment(value, quote), /scope does not match/);
});

test('destination change invalidates prior payment authorization', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    value.request.destination.subdivisionCode = 'MN';
    assertAssessmentRejected(assessment(value, quote), /scope does not match/);
});

test('street address change within the same state invalidates the quotation', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    value.request.destination.address1 = '101 Different Synthetic Freight Way';
    assertAssessmentRejected(assessment(value, quote), /scope does not match/);
});

test('postal code change within the same state invalidates the quotation', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    value.request.destination.postalCode = 'SYN-IL-002';
    assertAssessmentRejected(assessment(value, quote), /scope does not match/);
});

test('delivery-requirements change invalidates prior payment authorization', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    value.request.deliveryRequirements.liftgateRequired = true;
    assertAssessmentRejected(assessment(value, quote), /scope does not match/);
});

for (const [field, pattern] of [
    ['postalCode', /shipment destination/],
    ['city', /shipment destination/],
    ['address1', /shipment destination/],
]) {
    test(`missing quotation destination ${field} is rejected`, () => {
        const value = quotationScenario();
        delete value.request.destination[field];
        const quote = approvedQuote(value);
        assertAssessmentRejected(assessment(value, quote), pattern);
    });
}

test('blank applicable secondary address is rejected', () => {
    const value = quotationScenario();
    value.request.destination.address2 = '   ';
    const quote = approvedQuote(value);
    assertAssessmentRejected(assessment(value, quote), /shipment destination/);
});

test('missing residential or commercial designation is rejected', () => {
    const value = quotationScenario();
    delete value.request.deliveryRequirements.designation;
    const quote = approvedQuote(value);
    assertAssessmentRejected(assessment(value, quote), /residential or commercial designation/);
});

test('malformed residential or commercial designation is rejected', () => {
    const value = quotationScenario();
    value.request.deliveryRequirements.designation = 'unspecified';
    const quote = approvedQuote(value);
    assertAssessmentRejected(assessment(value, quote), /residential or commercial designation/);
});

test('missing liftgate response is rejected', () => {
    const value = quotationScenario();
    delete value.request.deliveryRequirements.liftgateRequired;
    const quote = approvedQuote(value);
    assertAssessmentRejected(assessment(value, quote), /true or false liftgate response/);
});

test('malformed liftgate response is rejected', () => {
    const value = quotationScenario();
    value.request.deliveryRequirements.liftgateRequired = 'no';
    const quote = approvedQuote(value);
    assertAssessmentRejected(assessment(value, quote), /true or false liftgate response/);
});

test('missing access information is rejected', () => {
    const value = quotationScenario();
    delete value.request.deliveryRequirements.accessInformation;
    const quote = approvedQuote(value);
    assertAssessmentRejected(assessment(value, quote), /access information/);
});

test('blank access information is rejected', () => {
    const value = quotationScenario();
    value.request.deliveryRequirements.accessInformation = '   ';
    const quote = approvedQuote(value);
    assertAssessmentRejected(assessment(value, quote), /access information/);
});

test('explicit false liftgate and no-special-limitations declaration are accepted', () => {
    const value = quotationScenario();
    value.request.deliveryRequirements = {
        designation: 'residential',
        liftgateRequired: false,
        accessInformation: 'no_special_access_limitations',
    };
    const quote = approvedQuote(value);
    assertAssessmentSatisfied(assessment(value, quote));
});

test('ordinary pickup does not require freight delivery fields', () => {
    const value = scenario('K-SYN-PICKUP-MACHINE-APPROVED');
    assert.equal(value.request.deliveryRequirements, undefined);
    assert.equal(assessFulfillment(value, policy).route, ROUTES.PICKUP);
});

test('insurance-selection change invalidates prior payment authorization', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    value.request.insuranceSelection = 'selected';
    assertAssessmentRejected(assessment(value, quote), /scope|insurance/);
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
    assertAssessmentSatisfied(assessment(value, quote));
});

test('documented and accepted zero-cost insurance remains distinct from missing cost', () => {
    const value = quotationScenario();
    value.request.insuranceSelection = 'selected';
    const quote = approvedQuote(value);
    quote.scope = normalizeQuoteScope(value);
    quote.insurance = {
        availabilityDocumented: true,
        costDocumented: true,
        amountCents: 0,
        customerAccepted: true,
    };
    assertAssessmentSatisfied(assessment(value, quote));
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
    assertAssessmentRejected(assessment(value, quote), /documented availability and cost/);
});

test('missing freight service evidence is rejected', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    delete quote.shippingService;
    assertAssessmentRejected(assessment(value, quote), /identified shipping service/);
});

test('unsupported freight service is rejected', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    quote.shippingService.supportStatus = 'unverified';
    assertAssessmentRejected(assessment(value, quote), /documented support evidence/);
});

test('missing shipping charge is rejected', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    delete quote.shippingCharge;
    assertAssessmentRejected(assessment(value, quote), /documented shipping charge/);
});

for (const invalidAmount of [null, 0, -1, 12.5, '12500']) {
    test(`invalid shipping charge amount ${JSON.stringify(invalidAmount)} is rejected`, () => {
        const value = quotationScenario();
        const quote = approvedQuote(value);
        quote.shippingCharge.amountCents = invalidAmount;
        assertAssessmentRejected(assessment(value, quote), /positive shipping charge amount/);
    });
}

test('unapproved shipping charge is rejected', () => {
    const value = quotationScenario();
    const quote = approvedQuote(value);
    quote.shippingCharge.approvalStatus = 'pending';
    assertAssessmentRejected(assessment(value, quote), /shipping charge requires operations approval/);
});

test('Alaska quotation cannot invoice without separate rate and service evidence', () => {
    const value = scenario('K-SYN-ALASKA-QUOTE-INTAKE');
    value.request.deliveryRequirements = {
        designation: 'residential', liftgateRequired: false, accessInformation: 'SYNTHETIC-ACCESS',
    };
    value.request.insuranceSelection = 'declined';
    const quote = approvedQuote(value);
    quote.destinationApproval = { rateApproved: false, serviceAvailabilityConfirmed: false };
    assertAssessmentRejected(assessment(value, quote), /Alaska or Hawaii/);
});

test('Hawaii quotation satisfies offline policy only after separate rate and service approval', () => {
    const value = scenario('K-SYN-HAWAII-QUOTE-INTAKE');
    value.request.deliveryRequirements = {
        designation: 'commercial', liftgateRequired: true, accessInformation: 'SYNTHETIC-ACCESS',
    };
    value.request.insuranceSelection = 'declined';
    const quote = approvedQuote(value);
    assertAssessmentSatisfied(assessment(value, quote));
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
