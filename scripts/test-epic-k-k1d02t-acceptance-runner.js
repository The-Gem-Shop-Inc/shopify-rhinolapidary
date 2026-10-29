'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const {
  AUTHORIZATION_PHRASE,
  AUTHORIZATION_UNCONSUMED_CONFIRMATION,
  PASSWORD_ROTATION_CONFIRMATION,
  assertAuthorizationUnconsumed,
  assertExecutionAuthorization,
  assertPasswordRotation,
  buildBlockedEvidence,
  buildEvidence,
  materializeAcceptanceFixture,
  matchingDrafts,
  redactSecrets,
  verifyDraft,
} = require('./run-epic-k-k1d02t-acceptance');
const {
  buildDraftOrderInput,
  idempotencyIdentity,
  validatePayload,
} = require('../server/epic-k-draft-order/core');

const SHOP = 'sz5dnk-nf.myshopify.com';
const OWNER_EMAIL = 'owner-controlled@rhino-acceptance.co';
const rawFixture = require('../data/epic-k-k1d02t-acceptance-fixture.json');
const materializedFixture = materializeAcceptanceFixture(rawFixture, OWNER_EMAIL);
const fixture = validatePayload(materializedFixture);
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

  test('password rotation and unconsumed authorization confirmations are mandatory', () => {
    assert.throws(() => assertPasswordRotation('yes'));
    assert.doesNotThrow(() => assertPasswordRotation(PASSWORD_ROTATION_CONFIRMATION));
    assert.throws(() => assertAuthorizationUnconsumed('yes'));
    assert.doesNotThrow(() => assertAuthorizationUnconsumed(AUTHORIZATION_UNCONSUMED_CONFIRMATION));
  });

  test('reserved test email domains are rejected while an owner-controlled email is accepted', () => {
    for (const email of ['test@example.invalid', 'test@example.com', 'test@subdomain.test', 'test@localhost']) {
      assert.throws(() => materializeAcceptanceFixture(rawFixture, email));
    }
    assert.equal(materializeAcceptanceFixture(rawFixture, OWNER_EMAIL).customer.email, OWNER_EMAIL);
    assert.equal('email' in rawFixture.customer, false);
  });

  test('the committed fixture retains the external property shape accepted by the endpoint', () => {
    assert.equal(Array.isArray(rawFixture.items[0].properties), false);
    assert.deepEqual(validatePayload(materializedFixture), fixture);
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
    assert.equal(evidence.fixture.emailSource, 'secure_runtime_variable');
    assert.equal(evidence.fixture.emailDomainRecorded, false);
    assert.doesNotMatch(serialized, /owner-controlled@rhino-acceptance\.co|1 Acceptance Way|access_token|signature=/i);
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
    assert.doesNotMatch(serialized, /owner-controlled@rhino-acceptance\.co|1 Acceptance Way|access_token|signature=/i);
  });

  test('credential, email, URL, and password values are redacted from failures', () => {
    const secret = 'replacement-password-value';
    const message = redactSecrets(`password=${secret} email=${OWNER_EMAIL} https://store.invalid/?access_token=abc`, [secret, OWNER_EMAIL]);
    assert.doesNotMatch(message, /replacement-password-value|owner-controlled@rhino-acceptance\.co|https:\/\//);
    assert.match(message, /\[redacted\]/);
    const runnerSource = fs.readFileSync(require.resolve('./run-epic-k-k1d02t-acceptance'), 'utf8');
    assert.doesNotMatch(runnerSource, /\.screenshot\(|tracing\.start\(|recordVideo/);
    assert.match(runnerSource, /process\.env\.STOREFRONT_PASSWORD/);
  });

  console.log(`Epic K K1D-02T acceptance-runner tests passed: ${passed}/${passed}.`);
}

main();
