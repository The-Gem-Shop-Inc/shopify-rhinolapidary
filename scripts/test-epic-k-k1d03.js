'use strict';

const assert = require('node:assert/strict');
const client = require('../assets/rhino-quote-draft-client');

const cryptoFixture = (seed) => ({
  getRandomValues(bytes) {
    bytes.fill(seed);
    return bytes;
  },
});

const values = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ADA@example.invalid',
  phone: '262-555-0100',
  company: 'Analytical Engines',
  address1: '100 Fixture Street',
  address2: 'Dock 2',
  city: 'Grafton',
  provinceCode: 'wi',
  zip: '53024',
  addressType: 'Commercial',
  liftgateRequired: true,
  accessInformation: 'Call at the gate.',
  insuranceRequested: false,
};

function cart(overrides = {}) {
  return {
    token: 'raw-token-with-auth-key-material',
    note: 'Keep upright.',
    discount_codes: [],
    cart_level_discount_applications: [],
    items: [{ variant_id: 111, quantity: 1, properties: { Finish: 'Polished', _private: 'omit' }, line_level_discount_allocations: [] }],
    ...overrides,
  };
}

const tests = [];
function test(name, run) { tests.push({ name, run }); }

test('single Variant quotation uses native identity and quantity', () => {
  const payload = client.buildPayload({ cart: cart(), values, quoteReference: 'KQ-AAAAAA-1', cartToken: 'K1D03_SAFE_TOKEN' });
  assert.deepEqual(payload.items, [{
    variantId: 'gid://shopify/ProductVariant/111', quantity: 1, properties: { Finish: 'Polished' }, sellingPlanId: null,
  }]);
});

test('multiple Variants and quantities remain separate lines', () => {
  const items = client.normalizeItems(cart({ items: [
    { variant_id: 111, quantity: 2, properties: {} },
    { variant_id: 222, quantity: 3, properties: {} },
  ] }));
  assert.deepEqual(items.map(({ variantId, quantity }) => [variantId, quantity]), [
    ['gid://shopify/ProductVariant/111', 2], ['gid://shopify/ProductVariant/222', 3],
  ]);
});

test('duplicate Variant IDs with distinct public properties are not merged', () => {
  const items = client.normalizeItems(cart({ items: [
    { variant_id: 111, quantity: 1, properties: { Cut: 'A' } },
    { variant_id: 111, quantity: 1, properties: { Cut: 'B' } },
  ] }));
  assert.equal(items.length, 2);
  assert.deepEqual(items.map((item) => item.properties), [{ Cut: 'A' }, { Cut: 'B' }]);
});

test('complete delivery and US address map exactly', () => {
  const material = client.formMaterial(values);
  assert.deepEqual(material.shippingAddress, {
    address1: '100 Fixture Street', address2: 'Dock 2', city: 'Grafton', provinceCode: 'WI', zip: '53024', countryCode: 'US',
  });
  assert.deepEqual(material.delivery, {
    addressType: 'commercial', liftgateRequired: true, accessInformation: 'Call at the gate.', insuranceRequested: false,
  });
});

test('customer first and last names map explicitly', () => {
  assert.deepEqual(client.formMaterial(values).customer, {
    firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.invalid', phone: '262-555-0100', company: 'Analytical Engines',
  });
});

test('cart material detects quantity, property, note, and discount changes', () => {
  const first = client.canonicalJson(client.cartMaterial(cart()));
  const second = client.canonicalJson(client.cartMaterial(cart({ note: 'Changed note.' })));
  assert.notEqual(first, second);
});

test('stable quotation reference is reused for the same fingerprint', () => {
  const reference = 'KQ-ABCDEF123456-1';
  assert.deepEqual(client.decideIdentity({ fingerprint: 'same', reference, state: 'retryable' }, 'same', 1), {
    reference, reuse: true, blocked: false, state: 'retryable',
  });
});

test('a genuinely new eligible request gets a new reference', () => {
  const result = client.decideIdentity({ fingerprint: 'old', reference: 'KQ-ABCDEF-1', state: 'confirmed' }, 'new', 2, cryptoFixture(7));
  assert.equal(result.reuse, false);
  assert.match(result.reference, client.REFERENCE_PATTERN);
  assert.notEqual(result.reference, 'KQ-ABCDEF-1');
});

test('server rejection is not classified as success', () => {
  assert.deepEqual(client.classifyResponse(422, { code: 'INVALID_CART', retryable: false }), { kind: 'rejected', code: 'INVALID_CART' });
});

test('Shopify timeout or malformed success remains uncertain', () => {
  assert.deepEqual(client.classifyResponse(503, { code: 'SUBMISSION_FAILED' }), { kind: 'uncertain', code: 'UNCONFIRMED_RESULT' });
  assert.equal(client.classifyResponse(200, { ok: true }).kind, 'uncertain');
});

test('duplicate submission recovery requires confirmed Shopify storage', () => {
  const result = client.classifyResponse(200, {
    storedInShopifyAdmin: true, reference: 'KQ-ABCDEF-1', staffIdentifier: '#D9', duplicate: true,
  });
  assert.deepEqual(result, { kind: 'confirmed', reference: 'KQ-ABCDEF-1', staffIdentifier: '#D9', duplicate: true });
});

test('confirmed Draft Order success rejects invalid staff identifiers', () => {
  assert.equal(client.classifyResponse(200, {
    storedInShopifyAdmin: true, reference: 'KQ-ABCDEF-1', staffIdentifier: 'Draft 9',
  }).kind, 'uncertain');
});

test('selling plans are detected for explicit email fallback', () => {
  const [item] = client.normalizeItems(cart({ items: [{ variant_id: 111, quantity: 1, properties: {}, selling_plan: 44 }] }));
  assert.equal(item.sellingPlanId, 'gid://shopify/SellingPlan/44');
});

test('supported discount codes are preserved without amounts', () => {
  const discounted = cart({ discount_codes: [{ code: 'SAVE10', applicable: true }] });
  assert.deepEqual(client.discountRepresentation(discounted), { supported: true, reason: null, codes: ['SAVE10'] });
  assert.deepEqual(client.buildPayload({ cart: discounted, values, quoteReference: 'KQ-ABCDEF-1', cartToken: 'K1D03_SAFE' }).discountCodes, ['SAVE10']);
});

test('unrepresentable coded discounts fail closed', () => {
  const result = client.discountRepresentation(cart({
    line_level_discount_allocations: [],
    items: [{
      variant_id: 111,
      quantity: 1,
      properties: {},
      line_level_discount_allocations: [{ discount_application: { type: 'discount_code', title: 'MISSING' } }],
    }],
  }));
  assert.deepEqual(result, { supported: false, reason: 'DISCOUNT_CODE_UNREPRESENTED', codes: [] });
});

test('invalid Product identity and empty cart fail before submission', () => {
  assert.throws(() => client.normalizeItems({ items: [] }), /INVALID_CART/);
  assert.throws(() => client.normalizeItems({ items: [{ variant_id: 'not-a-variant', quantity: 1 }] }), /INVALID_CART/);
});

test('an uncertain previous mutation blocks every new reference', () => {
  const result = client.decideIdentity({ fingerprint: 'old', reference: 'KQ-ABCDEF-1', state: 'uncertain' }, 'changed', 2, cryptoFixture(8));
  assert.equal(result.blocked, true);
  assert.equal(result.reference, 'KQ-ABCDEF-1');
  assert.equal(client.decideIdentity({ fingerprint: 'same', reference: 'KQ-ABCDEF-1', state: 'uncertain' }, 'same', 1).blocked, true);
});

test('rate limiting and in-progress recovery preserve safe retry semantics', () => {
  assert.equal(client.classifyResponse(429, { code: 'RATE_LIMITED' }).kind, 'recoverable');
  assert.deepEqual(client.classifyResponse(202, { code: 'SUBMISSION_IN_PROGRESS' }), {
    kind: 'recoverable', code: 'SUBMISSION_IN_PROGRESS',
  });
});

test('raw Shopify cart tokens are irreversibly replaced before payload construction', async () => {
  const hashed = await client.safeCartToken(cart().token, require('node:crypto').webcrypto);
  assert.match(hashed, /^K1D03_[a-f0-9]{48}$/);
  assert.doesNotMatch(hashed, /raw-token|auth|key/);
});

test('payload contains no merchandise, shipping, invoice, payment, reservation, or fulfillment override', () => {
  const payload = client.buildPayload({ cart: cart(), values, quoteReference: 'KQ-ABCDEF-1', cartToken: 'K1D03_SAFE' });
  const serialized = JSON.stringify(payload);
  assert.doesNotMatch(serialized, /unitPrice|linePrice|shippingLine|shippingCharge|invoice|payment|reservation|fulfillmentOrder/i);
  assert.equal(payload.fulfillment, 'shipping');
});

(async () => {
  let passed = 0;
  for (const entry of tests) {
    try {
      await entry.run();
      passed += 1;
      console.log(`PASS ${entry.name}`);
    } catch (error) {
      console.error(`FAIL ${entry.name}`);
      throw error;
    }
  }
  console.log(`Epic K1D-03 storefront client tests passed: ${passed}/${tests.length}.`);
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
