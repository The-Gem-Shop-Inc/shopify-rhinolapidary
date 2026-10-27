'use strict';

const assert = require('node:assert/strict');
const fixture = require('../tests/fixtures/epic-k-quote-mode.json');
const {
    assessCart,
    buildStaffPayload,
    cartSignature,
    duplicateSubmissionState,
    validateQuoteRequest,
} = require('./lib/epic-k-quote-mode');
const { validateQuoteMode } = require('./validate-epic-k-quote-mode');
const integration = validateQuoteMode();

const tests = [];
function test(name, run) { tests.push({ name, run }); }
function clone(value) { return structuredClone(value); }

test('eligible pickup cart can proceed to native checkout', () => assert.equal(assessCart(fixture.eligibleCart).pickupCheckoutAllowed, true));
test('ineligible pickup item blocks immediate pickup', () => assert.equal(assessCart(fixture.mixedCart).pickupCheckoutAllowed, false));
test('explicit pickup exclusion fails closed', () => {
    const cart = clone(fixture.eligibleCart);
    cart.items[0].pickupExcluded = true;
    assert.equal(assessCart(cart).pickupCheckoutAllowed, false);
});
test('inactive product fails closed', () => {
    const cart = clone(fixture.eligibleCart);
    cart.items[0].productStatus = 'draft';
    assert.equal(assessCart(cart).pickupCheckoutAllowed, false);
});
test('inventory transfer requirement fails closed', () => {
    const cart = clone(fixture.eligibleCart);
    cart.items[0].requiresInventoryTransfer = true;
    assert.equal(assessCart(cart).pickupCheckoutAllowed, false);
});
test('unavailable preparation arrangement fails closed', () => {
    const cart = clone(fixture.eligibleCart);
    cart.items[0].preparationArrangementAvailable = false;
    assert.equal(assessCart(cart).pickupCheckoutAllowed, false);
});
test('machinery can use pickup when the same policy and live availability checks pass', () => {
    const cart = clone(fixture.eligibleCart);
    cart.items[0].productClass = 'machine';
    assert.equal(assessCart(cart).pickupCheckoutAllowed, true);
});
test('missing Grafton availability fails closed', () => {
    const cart = clone(fixture.eligibleCart);
    cart.items[0].graftonPickup.available = false;
    assert.equal(assessCart(cart).pickupCheckoutAllowed, false);
});
test('disabled Grafton pickup fails closed', () => {
    const cart = clone(fixture.eligibleCart);
    cart.items[0].graftonPickup.enabled = false;
    assert.equal(assessCart(cart).pickupCheckoutAllowed, false);
});
test('mixed machinery and accessory cart remains one quotation', () => {
    const result = assessCart(fixture.mixedCart);
    assert.equal(result.quotationRequestAllowed, true);
    assert.equal(result.quotationScope, 'complete_cart');
    assert.equal(result.itemCount, 4);
});
test('empty cart cannot submit', () => assert.equal(assessCart({ items: [] }).quotationRequestAllowed, false));
test('missing Variant identity invalidates cart', () => {
    const cart = clone(fixture.eligibleCart);
    delete cart.items[0].variantId;
    assert.equal(assessCart(cart).completeCartValid, false);
});
test('zero quantity invalidates cart', () => {
    const cart = clone(fixture.eligibleCart);
    cart.items[0].quantity = 0;
    assert.equal(assessCart(cart).completeCartValid, false);
});
test('fractional quantity invalidates cart', () => {
    const cart = clone(fixture.eligibleCart);
    cart.items[0].quantity = 1.5;
    assert.equal(assessCart(cart).completeCartValid, false);
});
test('numeric string quantity invalidates cart', () => {
    const cart = clone(fixture.eligibleCart);
    cart.items[0].quantity = '1';
    assert.equal(assessCart(cart).completeCartValid, false);
});
test('complete customer and cart request is valid', () => assert.equal(validateQuoteRequest(fixture.customer, fixture.eligibleCart).valid, true));
test('customer name is required', () => {
    const request = clone(fixture.customer);
    request.name = '';
    assert.match(validateQuoteRequest(request, fixture.eligibleCart).errors.join('\n'), /name is required/);
});
test('customer email is validated', () => {
    const request = clone(fixture.customer);
    request.email = 'invalid';
    assert.match(validateQuoteRequest(request, fixture.eligibleCart).errors.join('\n'), /email is invalid/);
});
test('shipping street address is required', () => {
    const request = clone(fixture.customer);
    request.address1 = '';
    assert.match(validateQuoteRequest(request, fixture.eligibleCart).errors.join('\n'), /address1 is required/);
});
test('international quotation intake is rejected', () => {
    const request = clone(fixture.customer);
    request.country = 'CA';
    assert.match(validateQuoteRequest(request, fixture.eligibleCart).errors.join('\n'), /United States/);
});
test('territory or military destination code is rejected', () => {
    const request = clone(fixture.customer);
    request.state = 'PR';
    assert.match(validateQuoteRequest(request, fixture.eligibleCart).errors.join('\n'), /50 United States/);
});
test('Alaska quotation intake is accepted', () => {
    const request = clone(fixture.customer);
    request.state = 'AK';
    assert.equal(validateQuoteRequest(request, fixture.eligibleCart).valid, true);
});
test('Hawaii quotation intake is accepted', () => {
    const request = clone(fixture.customer);
    request.state = 'HI';
    assert.equal(validateQuoteRequest(request, fixture.eligibleCart).valid, true);
});
test('residential or commercial designation is required', () => {
    const request = clone(fixture.customer);
    delete request.deliveryType;
    assert.match(validateQuoteRequest(request, fixture.eligibleCart).errors.join('\n'), /deliveryType/);
});
test('explicit false liftgate response remains valid', () => assert.equal(validateQuoteRequest(fixture.customer, fixture.eligibleCart).valid, true));
test('missing liftgate response fails', () => {
    const request = clone(fixture.customer);
    delete request.liftgateRequired;
    assert.match(validateQuoteRequest(request, fixture.eligibleCart).errors.join('\n'), /liftgateRequired/);
});
test('explicit no-access-limitations statement is accepted', () => assert.equal(validateQuoteRequest(fixture.customer, fixture.eligibleCart).valid, true));
test('missing access information fails', () => {
    const request = clone(fixture.customer);
    request.accessInformation = '';
    assert.match(validateQuoteRequest(request, fixture.eligibleCart).errors.join('\n'), /accessInformation/);
});
test('customer cannot invent a shipping charge', () => {
    const request = { ...fixture.customer, shippingCharge: 0 };
    assert.match(validateQuoteRequest(request, fixture.eligibleCart).errors.join('\n'), /cannot set a shipping charge/);
});
test('customer cannot authorize invoice', () => {
    const request = { ...fixture.customer, invoiceAuthorized: true };
    assert.match(validateQuoteRequest(request, fixture.eligibleCart).errors.join('\n'), /cannot authorize an invoice/);
});
test('staff payload preserves every Variant and quantity', () => {
    const payload = buildStaffPayload(fixture.customer, fixture.eligibleCart, 'KQ-SYNTHETIC');
    assert.deepEqual(payload.items, [
        { variantId: '10000000000001', quantity: 1 },
        { variantId: '10000000000002', quantity: 2 },
    ]);
});
test('staff payload never supplies shipping price or invoice approval', () => {
    const payload = buildStaffPayload(fixture.customer, fixture.eligibleCart, 'KQ-SYNTHETIC');
    assert.equal(payload.shippingCharge, null);
    assert.equal(payload.invoiceAuthorized, false);
});
test('cart signature is stable across item ordering', () => {
    const reversed = { items: [...fixture.eligibleCart.items].reverse() };
    assert.equal(cartSignature(reversed), cartSignature(fixture.eligibleCart));
});
test('submitted duplicate is blocked', () => assert.equal(
    duplicateSubmissionState({ cartSignature: '1:1', status: 'submitted' }, '1:1'),
    'DUPLICATE_BLOCKED',
));
test('pending submission can retry after interrupted navigation', () => assert.equal(
    duplicateSubmissionState({ cartSignature: '1:1', status: 'pending' }, '1:1'),
    'RETRY_ALLOWED',
));
test('materially changed cart creates a new submission scope', () => assert.equal(
    duplicateSubmissionState({ cartSignature: '1:1', status: 'submitted' }, '1:2'),
    'NEW',
));
test('repository integration contract passes', () => assert.deepEqual(integration.errors, []));
test('repository keeps explicit pickup exclusions empty until an exclusion is approved', () => assert.deepEqual(integration.exclusionTokens, []));
test('repository evidence report keeps operational readiness blocked', () => assert.equal(integration.evidenceReport.operationalReadiness, 'BLOCKED'));
test('repository evidence report keeps checkout enforcement unverified', () => assert.equal(integration.evidenceReport.liveCheckoutEnforcement, 'UNVERIFIED'));

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
console.log(`Epic K temporary quote mode tests passed: ${passed}/${tests.length}.`);
