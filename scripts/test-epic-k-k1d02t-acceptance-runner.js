'use strict';

const assert = require('assert/strict');
const {
  AUTHORIZATION_PHRASE,
  assertExecutionAuthorization,
  buildBlockedEvidence,
  buildEvidence,
  matchingDrafts,
  verifyDraft,
} = require('./run-epic-k-k1d02t-acceptance');
const {
  buildDraftOrderInput,
  idempotencyIdentity,
  validatePayload,
} = require('../server/epic-k-draft-order/core');

const SHOP = 'sz5dnk-nf.myshopify.com';
const rawFixture = require('../data/epic-k-k1d02t-acceptance-fixture.json');
const fixture = validatePayload(rawFixture);
const identity = idempotencyIdentity(SHOP, fixture);

function draft() {
  const input = buildDraftOrderInput(fixture, identity.tag);
  return {
    id: 'gid://shopify/DraftOrder/9001',
    name: '#D9001',
    status: 'OPEN',
    tags: input.tags,
    createdAt: '2026-10-29T17:00:00Z',
    updatedAt: '2026-10-29T17:00:00Z',
    email: fixture.customer.email,
    phone: fixture.customer.phone,
    note2: input.note,
    invoiceSentAt: null,
    completedAt: null,
    reserveInventoryUntil: null,
    acceptAutomaticDiscounts: true,
    allowDiscountCodesInCheckout: true,
    allVariantPricesOverridden: false,
    discountCodes: [],
    totalDiscountsSet: { shopMoney: { amount: '0.0', currencyCode: 'USD' } },
    customAttributes: input.customAttributes,
    shippingLine: null,
    customer: null,
    order: null,
    shippingAddress: {
      ...fixture.shippingAddress,
      firstName: fixture.customer.firstName,
      lastName: fixture.customer.lastName,
      company: fixture.customer.company,
      phone: fixture.customer.phone,
      countryCodeV2: 'US',
    },
    lineItems: {
      nodes: fixture.items.map((item, index) => ({
        id: `gid://shopify/DraftOrderLineItem/${index + 1}`,
        quantity: item.quantity,
        variant: { id: item.variantId, title: 'Synthetic fixture variant' },
        customAttributes: item.properties,
        appliedDiscount: null,
      })),
    },
  };
}

function main() {
  let passed = 0;
  const test = (name, fn) => {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  };

  test('exact owner authorization is mandatory', () => {
    assert.throws(() => assertExecutionAuthorization('yes'));
    assert.doesNotThrow(() => assertExecutionAuthorization(AUTHORIZATION_PHRASE));
  });

  test('the committed fixture retains the external property shape accepted by the endpoint', () => {
    assert.equal(Array.isArray(rawFixture.items[0].properties), false);
    assert.deepEqual(validatePayload(rawFixture), fixture);
  });

  test('the acceptance draft must preserve fixture data and every safety boundary', () => {
    const result = verifyDraft(draft(), fixture, identity.tag);
    assert.equal(result.status, 'OPEN');
    assert.equal(result.shippingLineAbsent, true);
    assert.equal(result.inventoryReservationAbsent, true);
    assert.equal(result.paymentAbsent, true);
  });

  test('a variant or quantity mismatch fails acceptance', () => {
    const changed = draft();
    changed.lineItems.nodes[0].quantity += 1;
    assert.throws(() => verifyDraft(changed, fixture, identity.tag));
  });

  test('matching reconciliation requires both deterministic tag and reference', () => {
    const candidates = [{ ...draft(), customAttributes: [{ key: 'Quotation reference', value: fixture.quoteReference }] }];
    assert.equal(matchingDrafts(candidates, fixture.quoteReference, identity.tag).length, 1);
    assert.equal(matchingDrafts(candidates, 'KQ-OTHER00-1', identity.tag).length, 0);
  });

  test('machine evidence is sanitized and proves one completed D1 claim', () => {
    const verified = verifyDraft(draft(), fixture, identity.tag);
    const evidence = buildEvidence({
      fixture,
      identity,
      firstResponse: { status: 200, body: { status: 'draft_created', duplicate: false } },
      duplicateResponse: { status: 200, body: { status: 'draft_created', duplicate: true } },
      draft: verified,
      claim: {
        state: 'COMPLETED', attempt_count: 1, draft_id: verified.id, draft_name: verified.name,
        quote_reference: fixture.quoteReference, payload_hash: require('../server/epic-k-draft-order/core').payloadHash(fixture),
      },
      adminCount: 1,
    });
    const serialized = JSON.stringify(evidence);
    assert.equal(evidence.safety.draftsCreated, 1);
    assert.equal(evidence.d1.reconciliationComplete, true);
    assert.doesNotMatch(serialized, /k1d02t-20261029@example\.invalid|100 Test Avenue|\+12025550100|access_token|signature=/i);
  });

  test('a confirmed Shopify rejection produces sanitized blocked evidence without permitting a retry', () => {
    const evidence = buildBlockedEvidence({
      fixture,
      identity,
      firstResponse: { status: 422, body: { code: 'SHOPIFY_REJECTED' } },
      claim: {
        state: 'FAILED_RETRYABLE', attempt_count: 1, draft_id: null, draft_name: null,
        quote_reference: fixture.quoteReference, payload_hash: require('../server/epic-k-draft-order/core').payloadHash(fixture),
      },
      adminCount: 0,
    });
    const serialized = JSON.stringify(evidence);
    assert.equal(evidence.status, 'BLOCKED');
    assert.equal(evidence.safety.draftsCreated, 0);
    assert.equal(evidence.safety.duplicateRequestAttempted, false);
    assert.equal(evidence.d1.state, 'FAILED_RETRYABLE');
    assert.doesNotMatch(serialized, /k1d02t-20261029@example\.invalid|100 Test Avenue|\+12025550100|access_token|signature=/i);
  });

  console.log(`Epic K K1D-02T acceptance-runner tests passed: ${passed}/${passed}.`);
}

main();
