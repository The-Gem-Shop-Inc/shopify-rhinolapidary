'use strict';

const assert = require('assert/strict');
const crypto = require('crypto');
const {
  buildDraftOrderInput,
  idempotencyIdentity,
  validatePayload,
} = require('../server/epic-k-draft-order/core');
const {
  CREATE_DRAFT_MUTATION,
  createDraftOrderEndpoint,
  createShopifyClientCredentialsProvider,
} = require('../server/epic-k-draft-order/endpoint');

const SECRET = 'synthetic-app-secret';
const SHOP = 'rhino-lapidary.myshopify.com';
const NOW = Date.parse('2026-10-28T18:00:00Z');

function basePayload(overrides = {}) {
  return {
    fulfillment: 'shipping',
    quoteReference: 'KQ-ABC12345-2',
    cartToken: 'synthetic_cart_token_123456789',
    items: [{ variantId: '10000000000001', quantity: 1, properties: { Finish: 'Polished', _private: 'omit' } }],
    discountCodes: [],
    customer: {
      firstName: 'Synthetic', lastName: 'Customer', email: 'synthetic@example.invalid', phone: '555-0100', company: 'Example LLC',
    },
    shippingAddress: {
      address1: '100 Test Avenue', address2: 'Suite 2', city: 'Example City', provinceCode: 'WI', zip: '53000', countryCode: 'US',
    },
    delivery: {
      addressType: 'commercial', liftgateRequired: false, insuranceRequested: true, accessInformation: 'Loading dock at rear.',
    },
    cartNote: 'Call before arrival.',
    ...overrides,
  };
}

function signedUrl({ timestamp = Math.floor(NOW / 1000), shop = SHOP, extra = {} } = {}) {
  const params = new URLSearchParams({
    shop,
    logged_in_customer_id: '',
    path_prefix: '/apps/rhino-quote-draft',
    timestamp: String(timestamp),
    ...extra,
  });
  const grouped = new Map();
  for (const [key, value] of params.entries()) {
    const values = grouped.get(key) || [];
    values.push(value);
    grouped.set(key, values);
  }
  const message = [...grouped.entries()].map(([key, values]) => `${key}=${values.join(',')}`).sort().join('');
  params.set('signature', crypto.createHmac('sha256', SECRET).update(message).digest('hex'));
  return `https://${SHOP}/apps/rhino-quote-draft?${params}`;
}

function request(payload, url = signedUrl()) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.25' },
    body: JSON.stringify(payload),
  });
}

class MemoryStore {
  constructor() { this.records = new Map(); }
  async claim(input) {
    const prior = this.records.get(input.key);
    if (!prior) {
      this.records.set(input.key, { ...input, state: 'CLAIMED' });
      return { state: 'ACQUIRED' };
    }
    if (prior.payloadHash !== input.payloadHash) return { state: 'CONFLICT' };
    if (prior.state === 'FAILED_RETRYABLE') {
      prior.state = 'CLAIMED';
      return { state: 'ACQUIRED' };
    }
    return { state: ['CLAIMED', 'MUTATING'].includes(prior.state) ? 'IN_PROGRESS' : prior.state, record: { ...prior } };
  }
  async markMutationStarted(input) { this.records.set(input.key, { ...this.records.get(input.key), ...input, state: 'MUTATING' }); }
  async complete(input) { this.records.set(input.key, { ...this.records.get(input.key), ...input, state: 'COMPLETED' }); }
  async markRetryableFailure(input) { this.records.set(input.key, { ...this.records.get(input.key), ...input, state: 'FAILED_RETRYABLE' }); }
  async markUncertain(input) { this.records.set(input.key, { ...this.records.get(input.key), ...input, state: 'UNCERTAIN' }); }
}

function draftFor(input) {
  return {
    id: 'gid://shopify/DraftOrder/9001',
    name: '#D9001',
    status: 'OPEN',
    tags: input.tags,
    invoiceSentAt: null,
    shippingLine: null,
    customAttributes: input.customAttributes,
  };
}

function adminClient(options = {}) {
  const calls = { verify: 0, create: 0, find: 0, inputs: [] };
  return {
    calls,
    async verifyVariants(ids) {
      calls.verify += 1;
      return ids.map((id) => ({ __typename: 'ProductVariant', id, availableForSale: true, product: { status: 'ACTIVE' } }));
    },
    async createDraft(input) {
      calls.create += 1;
      calls.inputs.push(input);
      if (options.throwOnCreate) throw new Error('synthetic network timeout');
      if (options.rejectOnce && calls.create === 1) return { draftOrder: null, userErrors: [{ field: ['lineItems'], message: 'Synthetic rejection' }] };
      return { draftOrder: draftFor(input), userErrors: [] };
    },
    async findDraftsByTag(tag) {
      calls.find += 1;
      return options.reconciledDraft ? [options.reconciledDraft(tag)] : [];
    },
  };
}

function endpoint({ store = new MemoryStore(), admin = adminClient(), rateAllowed = true } = {}) {
  return {
    store,
    admin,
    handle: createDraftOrderEndpoint({
      appSecret: SECRET,
      shopDomain: SHOP,
      adminClient: admin,
      idempotencyStore: store,
      rateLimiter: { async consume() { return { allowed: rateAllowed, retryAfterSeconds: 60 }; } },
      now: () => NOW,
    }),
  };
}

async function body(response) { return response.json(); }

async function main() {
  let passed = 0;
  const test = async (name, fn) => {
    await fn();
    passed += 1;
    console.log(`PASS ${name}`);
  };

  await test('single item creates one open Unquoted draft without shipping, invoice, payment, or inventory reservation', async () => {
    const harness = endpoint();
    const response = await harness.handle(request(basePayload()));
    const result = await body(response);
    assert.equal(response.status, 200);
    assert.equal(result.storedInShopifyAdmin, true);
    assert.equal(result.reference, 'KQ-ABC12345-2');
    assert.equal(result.staffIdentifier, '#D9001');
    assert.equal(harness.admin.calls.create, 1);
    const input = harness.admin.calls.inputs[0];
    assert.deepEqual(input.tags.slice(0, 1), ['Unquoted']);
    assert.equal(input.lineItems.length, 1);
    assert.equal(input.lineItems[0].quantity, 1);
    assert.deepEqual(input.lineItems[0].customAttributes, [{ key: 'Finish', value: 'Polished' }]);
    assert.equal('shippingLine' in input, false);
    assert.equal('reserveInventoryUntil' in input, false);
    assert.equal('appliedDiscount' in input, false);
    assert.match(input.note, /Do not send an invoice, collect payment, reserve inventory, or complete/);
  });

  await test('multiple variants, quantities, and public line properties remain distinct', async () => {
    const harness = endpoint();
    const payload = basePayload({
      items: [
        { variantId: '10000000000001', quantity: 2, properties: { Finish: 'Polished' } },
        { variantId: '10000000000002', quantity: 3, properties: [{ name: 'Crate', value: 'Required' }] },
      ],
    });
    const response = await harness.handle(request(payload));
    assert.equal(response.status, 200);
    assert.deepEqual(harness.admin.calls.inputs[0].lineItems.map((line) => line.quantity), [2, 3]);
    assert.equal(harness.admin.calls.verify, 1);
  });

  await test('discount codes are passed to Shopify for recalculation without client prices', async () => {
    const normalized = validatePayload(basePayload({ discountCodes: ['SAVE10'] }));
    const input = buildDraftOrderInput(normalized, 'K1D-synthetic');
    assert.deepEqual(input.discountCodes, ['SAVE10']);
    assert.equal(input.acceptAutomaticDiscounts, true);
    assert.match(input.note, /Discount codes are recalculated by Shopify/);
    assert.throws(() => validatePayload(basePayload({ subtotal: '1.00' })), /must not be supplied/);
  });

  await test('selling-plan carts fail closed to the email fallback on API 2026-10', async () => {
    const harness = endpoint();
    const payload = basePayload({ items: [{ variantId: '10000000000001', quantity: 1, sellingPlanId: '1234' }] });
    const response = await harness.handle(request(payload));
    const result = await body(response);
    assert.equal(response.status, 422);
    assert.equal(result.code, 'SELLING_PLAN_UNSUPPORTED');
    assert.equal(harness.admin.calls.create, 0);
  });

  await test('pickup requests never query Shopify Admin or create drafts', async () => {
    const harness = endpoint();
    const response = await harness.handle(request(basePayload({ fulfillment: 'pickup' })));
    assert.equal(response.status, 409);
    assert.equal((await body(response)).code, 'PICKUP_NOT_ALLOWED');
    assert.deepEqual(harness.admin.calls, { verify: 0, create: 0, find: 0, inputs: [] });
  });

  await test('invalid and inactive cart variants are rejected server-side', async () => {
    const invalid = endpoint();
    assert.equal((await invalid.handle(request(basePayload({ items: [{ variantId: 'bad', quantity: 1 }] })))).status, 422);
    const admin = adminClient();
    admin.verifyVariants = async (ids) => ids.map((id) => ({ __typename: 'ProductVariant', id, product: { status: 'DRAFT' } }));
    const inactive = endpoint({ admin });
    const response = await inactive.handle(request(basePayload()));
    assert.equal(response.status, 422);
    assert.equal(admin.calls.create, 0);
  });

  await test('confirmed Shopify API rejection is recoverable and a corrected retry can succeed', async () => {
    const store = new MemoryStore();
    const admin = adminClient({ rejectOnce: true });
    const harness = endpoint({ store, admin });
    const first = await harness.handle(request(basePayload()));
    assert.equal(first.status, 422);
    assert.equal((await body(first)).code, 'SHOPIFY_REJECTED');
    const retry = await harness.handle(request(basePayload()));
    assert.equal(retry.status, 200);
    assert.equal(admin.calls.create, 2);
  });

  await test('repeated submissions return the durable result and create only one draft', async () => {
    const harness = endpoint();
    assert.equal((await harness.handle(request(basePayload()))).status, 200);
    const duplicate = await harness.handle(request(basePayload()));
    assert.equal(duplicate.status, 200);
    assert.equal((await body(duplicate)).duplicate, true);
    assert.equal((await body(await harness.handle(request(basePayload())))).staffIdentifier, '#D9001');
    assert.equal(harness.admin.calls.create, 1);
  });

  await test('duplicate quote references with changed cart data are rejected without another draft', async () => {
    const harness = endpoint();
    assert.equal((await harness.handle(request(basePayload()))).status, 200);
    const conflict = await harness.handle(request(basePayload({ cartNote: 'Changed after success.' })));
    assert.equal(conflict.status, 409);
    assert.equal((await body(conflict)).code, 'IDEMPOTENCY_CONFLICT');
    assert.equal(harness.admin.calls.create, 1);
  });

  await test('concurrent identical submissions cannot execute two draft mutations', async () => {
    const harness = endpoint();
    const responses = await Promise.all([
      harness.handle(request(basePayload())),
      harness.handle(request(basePayload())),
    ]);
    assert.equal(responses.some((response) => response.status === 200), true);
    assert.equal(responses.every((response) => [200, 202].includes(response.status)), true);
    assert.equal(harness.admin.calls.create, 1);
  });

  await test('a client timeout followed by retry returns the stored result without a duplicate', async () => {
    const harness = endpoint();
    await harness.handle(request(basePayload())); // Simulate a response the browser never received.
    const retry = await harness.handle(request(basePayload()));
    assert.equal(retry.status, 200);
    assert.equal((await body(retry)).duplicate, true);
    assert.equal(harness.admin.calls.create, 1);
  });

  await test('an uncertain Admin timeout reconciles by deterministic tag before any retry mutation', async () => {
    const store = new MemoryStore();
    const timingOut = adminClient({ throwOnCreate: true });
    const firstHarness = endpoint({ store, admin: timingOut });
    assert.equal((await firstHarness.handle(request(basePayload()))).status, 503);
    assert.equal(timingOut.calls.create, 1);
    const payload = validatePayload(basePayload());
    const identity = idempotencyIdentity(SHOP, payload);
    const recovered = adminClient({
      reconciledDraft: (tag) => ({ ...draftFor(buildDraftOrderInput(payload, tag)), id: 'gid://shopify/DraftOrder/9002' }),
    });
    const retryHarness = endpoint({ store, admin: recovered });
    const retry = await retryHarness.handle(request(basePayload()));
    assert.equal(retry.status, 200);
    assert.equal((await body(retry)).duplicate, true);
    assert.equal(recovered.calls.find, 1);
    assert.equal(recovered.calls.create, 0);
    assert.equal(identity.tag.length <= 40, true);
  });

  await test('an unreconciled uncertain result never creates a second draft', async () => {
    const store = new MemoryStore();
    const timingOut = adminClient({ throwOnCreate: true });
    await endpoint({ store, admin: timingOut }).handle(request(basePayload()));
    const retryAdmin = adminClient();
    const retry = await endpoint({ store, admin: retryAdmin }).handle(request(basePayload()));
    assert.equal(retry.status, 503);
    assert.equal((await body(retry)).code, 'SUBMISSION_UNCERTAIN');
    assert.equal(retryAdmin.calls.create, 0);
  });

  await test('app proxy authentication, timestamp freshness, payload size, and rate limits fail closed', async () => {
    const harness = endpoint();
    const unsigned = new URL(signedUrl());
    unsigned.searchParams.set('signature', '0'.repeat(64));
    assert.equal((await harness.handle(request(basePayload(), unsigned.toString()))).status, 401);
    assert.equal((await harness.handle(request(basePayload(), signedUrl({ shop: 'other-shop.myshopify.com' })))).status, 401);
    assert.equal((await harness.handle(request(basePayload(), signedUrl({ timestamp: Math.floor(NOW / 1000) - 301 })))).status, 401);
    assert.equal((await endpoint({ rateAllowed: false }).handle(request(basePayload()))).status, 429);
    const huge = basePayload({ cartNote: 'x'.repeat(33000) });
    assert.equal((await harness.handle(request(huge))).status, 413);
  });

  await test('current client-credentials grant validates scopes and reuses one token per request client', async () => {
    let calls = 0;
    const provider = createShopifyClientCredentialsProvider({
      shopDomain: SHOP,
      clientId: 'synthetic-client-id',
      clientSecret: SECRET,
      fetchImpl: async () => {
        calls += 1;
        return new Response(JSON.stringify({
          access_token: 'synthetic-access-token',
          scope: 'read_products,write_draft_orders,write_app_proxy',
          expires_in: 86399,
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      },
    });
    assert.equal(await provider(), 'synthetic-access-token');
    assert.equal(await provider(), 'synthetic-access-token');
    assert.equal(calls, 1);

    const missingScope = createShopifyClientCredentialsProvider({
      shopDomain: SHOP,
      clientId: 'synthetic-client-id',
      clientSecret: SECRET,
      fetchImpl: async () => new Response(JSON.stringify({ access_token: 'token', scope: 'read_products' }), { status: 200 }),
    });
    await assert.rejects(missingScope(), (error) => error.confirmedFailure === true);
  });

  await test('the only mutation is draftOrderCreate and it cannot send invoices, complete orders, or process payments', async () => {
    assert.match(CREATE_DRAFT_MUTATION, /draftOrderCreate/);
    assert.doesNotMatch(CREATE_DRAFT_MUTATION, /draftOrderInvoiceSend|draftOrderComplete|orderTransaction|payment/i);
  });

  console.log(`Epic K K1D-01 draft-order tests passed: ${passed}/${passed}.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
