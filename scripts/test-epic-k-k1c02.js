'use strict';

const assert = require('node:assert/strict');
const { readJson } = require('./lib/epic-k-policy');
const { STATUS_PATH, validateStatus } = require('./validate-epic-k-k1c02');

const baseline = readJson(STATUS_PATH);
const tests = [];
function test(name, run) { tests.push({ name, run }); }
function changed(mutator) { const value = structuredClone(baseline); mutator(value); return value; }
function rejects(mutator, pattern) { assert.match(validateStatus(changed(mutator)).join('\n'), pattern); }

test('blocked audited state validates', () => assert.deepEqual(validateStatus(baseline), []));
test('active state rejects missing pickup eligibility', () => rejects((value) => {
    value.activation.state = 'ACTIVE';
    value.activation.productionThemePublished = true;
    value.activation.liveCheckoutEnforcement = 'PASS';
    value.verification.contactSubmissionConfirmed = true;
}, /pickup-eligible Variant/));
test('active state rejects an unconfirmed contact route', () => rejects((value) => {
    value.activation.state = 'ACTIVE';
    value.activation.productionThemePublished = true;
    value.activation.liveCheckoutEnforcement = 'PASS';
    value.audit.pickup.approvedPickupVariantCount = 1;
}, /confirmed quotation contact submission/));
test('rate removal rejects an unpublished quotation theme', () => rejects((value) => {
    value.activation.shippingRatesRemoved = ['Standard'];
}, /cannot be removed before/));
test('controlled verification rejects invoice delivery', () => rejects((value) => {
    value.verification.draftInvoice.invoiceSent = true;
}, /must not send an invoice/));
test('controlled verification rejects payment collection', () => rejects((value) => {
    value.verification.draftInvoice.paymentProcessed = true;
}, /must not send an invoice or process payment/));
test('blocked activation requires controlled draft cleanup', () => rejects((value) => {
    value.verification.draftInvoice.draftDeleted = false;
}, /QA objects must be removed/));
test('privacy contract rejects committed customer data', () => rejects((value) => {
    value.privacy.customerDataCommitted = true;
}, /must be equal to constant/));

let passed = 0;
for (const entry of tests) {
    try { entry.run(); passed += 1; }
    catch (error) { console.error(`FAIL: ${entry.name}`); throw error; }
}
console.log(`Epic K1C-02 activation safety tests passed: ${passed}/${tests.length}.`);
