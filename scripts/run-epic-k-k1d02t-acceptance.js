'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require('@playwright/test');
const {
  buildDraftOrderInput,
  idempotencyIdentity,
  payloadHash,
  validatePayload,
} = require('../server/epic-k-draft-order/core');

const ROOT = path.resolve(__dirname, '..');
const FIXTURE_PATH = path.join(ROOT, 'data/epic-k-k1d02t-acceptance-fixture.json');
const READINESS_PATH = path.join(ROOT, 'data/epic-k-k1d02-backend-readiness.json');
const AUTHORIZATION_PHRASE = 'Tobi-authorized-one-draft-K1D-02T-2026-10-29';
const DATABASE = 'rhino-quotation-drafts';
const WRANGLER_CONFIG = path.join(ROOT, 'config/wrangler.epic-k-draft-order.jsonc');

const FIND_DRAFTS_QUERY = `#graphql
  query AcceptanceDrafts($query: String!) {
    draftOrders(first: 10, query: $query, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        name
        status
        tags
        createdAt
        customAttributes { key value }
      }
    }
  }
`;

const READ_DRAFT_QUERY = `#graphql
  query AcceptanceDraft($id: ID!) {
    draftOrder(id: $id) {
      id
      name
      status
      tags
      createdAt
      updatedAt
      email
      phone
      note2
      invoiceSentAt
      completedAt
      reserveInventoryUntil
      acceptAutomaticDiscounts
      allowDiscountCodesInCheckout
      allVariantPricesOverridden
      discountCodes
      totalDiscountsSet { shopMoney { amount currencyCode } }
      customAttributes { key value }
      shippingLine { id title }
      customer { id }
      order { id name }
      shippingAddress {
        firstName
        lastName
        company
        address1
        address2
        city
        provinceCode
        zip
        countryCodeV2
        phone
      }
      lineItems(first: 20) {
        nodes {
          id
          quantity
          variant { id title }
          customAttributes { key value }
          appliedDiscount { title value valueType }
        }
      }
    }
  }
`;

const VERIFY_VARIANTS_QUERY = `#graphql
  query AcceptanceVariants($ids: [ID!]!) {
    shop { myshopifyDomain }
    nodes(ids: $ids) {
      __typename
      ... on ProductVariant {
        id
        title
        availableForSale
        product { id title status }
      }
    }
  }
`;

class AcceptanceBlockedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AcceptanceBlockedError';
  }
}

function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

function parseArgs(argv) {
  const execute = argv.includes('--execute');
  const preflight = argv.includes('--preflight');
  if (execute === preflight) throw new Error('Choose exactly one of --preflight or --execute.');
  return { execute };
}

function assertExecutionAuthorization(value) {
  if (value !== AUTHORIZATION_PHRASE) {
    throw new AcceptanceBlockedError('Exact K1D-02T owner authorization is required before the single live write.');
  }
}

function appCredentials(projectDir) {
  if (!projectDir || !fs.existsSync(path.join(projectDir, 'shopify.app.toml'))) {
    throw new AcceptanceBlockedError('SHOPIFY_APP_PROJECT_DIR must identify the installed Rhino app project.');
  }
  const shopifyCli = process.env.SHOPIFY_CLI_JS
    || path.join(path.dirname(process.execPath), 'node_modules', '@shopify', 'cli', 'bin', 'run.js');
  if (!fs.existsSync(shopifyCli)) throw new AcceptanceBlockedError('SHOPIFY_CLI_JS must identify the Shopify CLI entrypoint.');
  const result = spawnSync(process.execPath, [shopifyCli, 'app', 'env', 'show', '--path', projectDir, '--no-color', '--no-input'], {
    encoding: 'utf8', windowsHide: true, maxBuffer: 1024 * 1024,
  });
  if (result.status !== 0) throw new AcceptanceBlockedError('Shopify CLI could not retrieve the app credentials.');
  const clientId = /SHOPIFY_API_KEY\s*=\s*"?([^"\r\n]+)/.exec(result.stdout)?.[1]?.trim();
  const clientSecret = /SHOPIFY_API_SECRET\s*=\s*"?([^"\r\n]+)/.exec(result.stdout)?.[1]?.trim();
  if (!clientId || !clientSecret) throw new AcceptanceBlockedError('Shopify CLI did not return both required app credentials.');
  return { clientId, clientSecret };
}

async function accessToken({ shop, clientId, clientSecret }) {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' }),
  });
  if (!response.ok) throw new AcceptanceBlockedError(`Shopify client credentials failed with HTTP ${response.status}.`);
  const body = await response.json();
  const scopes = new Set(String(body.scope || '').split(',').map((scope) => scope.trim()).filter(Boolean));
  for (const scope of ['read_products', 'write_draft_orders', 'write_app_proxy']) {
    if (!scopes.has(scope)) throw new AcceptanceBlockedError(`Installed app is missing required scope ${scope}.`);
  }
  if (!body.access_token) throw new AcceptanceBlockedError('Shopify did not issue an access token.');
  return body.access_token;
}

async function adminGraphql({ shop, apiVersion, token }, query, variables) {
  const response = await fetch(`https://${shop}/admin/api/${apiVersion}/graphql.json`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-shopify-access-token': token },
    body: JSON.stringify({ query, variables }),
  });
  if (!response.ok) throw new AcceptanceBlockedError(`Admin GraphQL failed with HTTP ${response.status}.`);
  const body = await response.json();
  if (body.errors?.length) {
    throw new AcceptanceBlockedError(`Admin GraphQL rejected the acceptance read: ${body.errors.map((entry) => entry.message).join('; ')}`);
  }
  return body.data;
}

function d1Claim(idempotencyKey) {
  if (!/^epic-k:k1d01:[a-f0-9]{64}$/.test(idempotencyKey)) throw new Error('Unexpected idempotency key format.');
  const sql = `SELECT idempotency_key, payload_hash, quote_reference, state, attempt_count, lease_expires_at, draft_id, draft_name, error_code, created_at, updated_at FROM quote_submission_claims WHERE idempotency_key = '${idempotencyKey}'`;
  const wranglerCli = path.join(ROOT, 'node_modules/wrangler/bin/wrangler.js');
  const result = spawnSync(process.execPath, [wranglerCli, 'd1', 'execute', DATABASE, '--remote', '--config', WRANGLER_CONFIG, '--command', sql, '--json', '--yes'], {
    cwd: ROOT, encoding: 'utf8', windowsHide: true, maxBuffer: 2 * 1024 * 1024,
  });
  if (result.status !== 0) throw new AcceptanceBlockedError('Remote D1 claim read failed.');
  let output;
  try { output = JSON.parse(result.stdout); } catch { throw new AcceptanceBlockedError('Remote D1 returned an unreadable claim result.'); }
  const rows = output?.[0]?.results || output?.[0]?.result?.[0]?.results || [];
  return rows[0] || null;
}

function matchingDrafts(nodes, reference, tag) {
  return (nodes || []).filter((draft) => (
    draft.tags?.includes(tag)
    && draft.customAttributes?.some((entry) => entry.key === 'Quotation reference' && entry.value === reference)
  ));
}

async function findAcceptanceDrafts(admin, reference, tag) {
  const data = await adminGraphql(admin, FIND_DRAFTS_QUERY, { query: `tag:${tag}` });
  return matchingDrafts(data.draftOrders?.nodes, reference, tag);
}

function normalizedAttributes(value) {
  return [...(value || [])].map(({ key, value: attributeValue }) => ({ key, value: attributeValue }))
    .sort((left, right) => left.key.localeCompare(right.key));
}

function phoneDigits(value) { return String(value || '').replace(/\D/g, '').slice(-10); }

function verifyDraft(draft, fixture, tag) {
  assert.ok(draft, 'Shopify did not return the created Draft Order.');
  assert.match(draft.id, /^gid:\/\/shopify\/DraftOrder\/[1-9][0-9]*$/);
  assert.match(draft.name, /^#D[1-9][0-9]*$/);
  assert.equal(draft.status, 'OPEN');
  assert.ok(draft.tags.includes('Unquoted'));
  assert.ok(draft.tags.includes(tag));
  assert.equal(draft.shippingLine, null);
  assert.equal(draft.invoiceSentAt, null);
  assert.equal(draft.completedAt, null);
  assert.equal(draft.reserveInventoryUntil, null);
  assert.equal(draft.order, null);
  assert.equal(draft.customer, null);
  assert.equal(draft.allVariantPricesOverridden, false);
  assert.equal(draft.email, fixture.customer.email);
  assert.equal(phoneDigits(draft.phone), phoneDigits(fixture.customer.phone));
  assert.deepEqual(draft.discountCodes, fixture.discountCodes);
  assert.equal(draft.acceptAutomaticDiscounts, true);
  assert.equal(draft.allowDiscountCodesInCheckout, true);

  const address = draft.shippingAddress;
  assert.ok(address, 'Draft Order shipping address is missing.');
  for (const field of ['firstName', 'lastName', 'company', 'address1', 'address2', 'city', 'provinceCode', 'zip']) {
    assert.equal(address[field], fixture.shippingAddress[field] ?? fixture.customer[field], `Shipping address field ${field} differs.`);
  }
  assert.equal(address.countryCodeV2, 'US');
  assert.equal(phoneDigits(address.phone), phoneDigits(fixture.customer.phone));

  const expectedInput = buildDraftOrderInput(fixture, tag);
  assert.equal(draft.note2, expectedInput.note);
  assert.deepEqual(normalizedAttributes(draft.customAttributes), normalizedAttributes(expectedInput.customAttributes));
  assert.equal(draft.lineItems.nodes.length, fixture.items.length);
  for (const expected of fixture.items) {
    const actual = draft.lineItems.nodes.find((line) => line.variant?.id === expected.variantId);
    assert.ok(actual, `Draft is missing Variant ${expected.variantId}.`);
    assert.equal(actual.quantity, expected.quantity);
    assert.deepEqual(normalizedAttributes(actual.customAttributes), normalizedAttributes(expected.properties));
    assert.equal(actual.appliedDiscount, null);
  }

  return {
    id: draft.id,
    name: draft.name,
    createdAt: draft.createdAt,
    status: draft.status,
    tags: draft.tags,
    reconciliationTag: tag,
    lineItems: draft.lineItems.nodes.map((line) => ({
      variantId: line.variant.id,
      quantity: line.quantity,
      propertyKeys: normalizedAttributes(line.customAttributes).map((entry) => entry.key),
    })),
    discountCodes: draft.discountCodes,
    automaticDiscountsAccepted: draft.acceptAutomaticDiscounts,
    totalDiscount: draft.totalDiscountsSet?.shopMoney || null,
    syntheticContactMatched: true,
    shippingAddressMatched: true,
    staffNoteMatched: true,
    shippingLineAbsent: true,
    invoiceAbsent: true,
    inventoryReservationAbsent: true,
    completedOrderAbsent: true,
    paymentAbsent: true,
    fulfillmentAbsent: true,
    customerRecordAbsent: true,
  };
}

function buildEvidence({ fixture, identity, firstResponse, duplicateResponse, draft, claim, adminCount }) {
  return {
    schemaVersion: 1,
    batch: 'K1D-02T',
    status: 'PASS',
    verifiedAt: new Date().toISOString(),
    authorization: { owner: 'Tobi', scope: 'one synthetic unpaid uninvoiced Draft Order', confirmed: true },
    fixture: {
      quotationReference: fixture.quoteReference,
      syntheticEmailDomain: 'example.invalid',
      shippingCountryCode: fixture.shippingAddress.countryCode,
      itemCount: fixture.items.length,
      items: fixture.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity, propertyKeys: normalizedAttributes(item.properties).map((entry) => entry.key) })),
      discountCodes: fixture.discountCodes,
    },
    proxy: {
      storefrontPath: '/apps/rhino-quote-draft',
      firstResponse: { status: firstResponse.status, code: firstResponse.body?.status || null, duplicate: firstResponse.body?.duplicate === true },
      duplicateResponse: { status: duplicateResponse.status, code: duplicateResponse.body?.status || null, duplicate: duplicateResponse.body?.duplicate === true },
      authenticatedUrlRecorded: false,
    },
    draft,
    admin: { draftCountForReference: adminCount, appearsInOrdersDrafts: adminCount === 1 },
    d1: {
      state: claim.state,
      attemptCount: Number(claim.attempt_count),
      draftId: claim.draft_id,
      draftName: claim.draft_name,
      quotationReference: claim.quote_reference,
      payloadHashMatched: claim.payload_hash === payloadHash(fixture),
      reconciliationComplete: claim.state === 'COMPLETED',
    },
    safety: {
      draftsCreated: 1,
      invoiceSent: false,
      paymentCollectedOrAuthorized: false,
      shippingLineCreated: false,
      inventoryReserved: false,
      orderCompleted: false,
      fulfillmentCreated: false,
      customerCreatedOrAttached: false,
      themeChanged: false,
      storefrontClientEnabled: false,
      emailFallbackActive: true,
    },
    deterministicIdentity: { reconciliationTag: identity.tag },
  };
}

function buildBlockedEvidence({ fixture, identity, firstResponse, claim, adminCount }) {
  return {
    schemaVersion: 1,
    batch: 'K1D-02T',
    status: 'BLOCKED',
    verifiedAt: new Date().toISOString(),
    authorization: { owner: 'Tobi', scope: 'one synthetic unpaid uninvoiced Draft Order', confirmed: true },
    fixture: {
      quotationReference: fixture.quoteReference,
      syntheticEmailDomain: 'example.invalid',
      shippingCountryCode: fixture.shippingAddress.countryCode,
      itemCount: fixture.items.length,
      items: fixture.items.map((item) => ({ variantId: item.variantId, quantity: item.quantity, propertyKeys: normalizedAttributes(item.properties).map((entry) => entry.key) })),
      discountCodes: fixture.discountCodes,
    },
    proxy: {
      storefrontPath: '/apps/rhino-quote-draft',
      firstResponse: { status: firstResponse.status, code: firstResponse.body?.code || null },
      authenticatedUrlRecorded: false,
    },
    draft: null,
    admin: { draftCountForReference: adminCount, appearsInOrdersDrafts: false },
    d1: {
      state: claim?.state || 'ABSENT',
      attemptCount: Number(claim?.attempt_count || 0),
      draftId: claim?.draft_id || null,
      draftName: claim?.draft_name || null,
      quotationReference: claim?.quote_reference || fixture.quoteReference,
      payloadHashMatched: claim?.payload_hash === payloadHash(fixture),
      reconciliationComplete: false,
    },
    safety: {
      draftsCreated: 0,
      duplicateRequestAttempted: false,
      invoiceSent: false,
      paymentCollectedOrAuthorized: false,
      shippingLineCreated: false,
      inventoryReserved: false,
      orderCompleted: false,
      fulfillmentCreated: false,
      customerCreatedOrAttached: false,
      themeChanged: false,
      storefrontClientEnabled: false,
      emailFallbackActive: true,
    },
    blocker: {
      code: 'SHOPIFY_REJECTED_WITHOUT_PUBLIC_USER_ERROR',
      nextAction: 'Supply an owner-controlled test email address and authorize a corrected fixture with a new unique quotation reference.',
    },
    deterministicIdentity: { reconciliationTag: identity.tag },
  };
}

function writeExclusiveEvidence(evidencePath, evidence) {
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, { flag: 'wx' });
}

async function proxyPost(storefrontAlias, fixture, context) {
  const response = await context.request.post(`https://${storefrontAlias}/apps/rhino-quote-draft`, {
    headers: { 'content-type': 'application/json' }, data: fixture, timeout: 30000,
  });
  let body = null;
  try { body = await response.json(); } catch { /* A non-JSON response fails the caller's assertions. */ }
  return { status: response.status(), cacheControl: response.headers()['cache-control'] || null, body };
}

async function unlockStorefront(storefrontAlias, storefrontPassword, context) {
  const page = await context.newPage();
  try {
    try {
      const response = await page.goto(`https://${storefrontAlias}/password`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      if (!response?.ok()) throw new AcceptanceBlockedError(`Storefront password page failed with HTTP ${response?.status() || 0}.`);
      await page.evaluate((password) => {
        const form = document.querySelector('form[action="/password"]');
        const input = form?.querySelector('input[name="password"]');
        if (!form || !input) throw new Error('Password form unavailable.');
        input.value = password;
        form.submit();
      }, storefrontPassword);
      await page.waitForTimeout(1500);
      const probe = await context.request.get(`https://${storefrontAlias}/`, { timeout: 15000 });
      if (!probe.ok() || new URL(probe.url()).pathname === '/password') {
        throw new AcceptanceBlockedError(`Storefront unlock did not establish an authenticated session (HTTP ${probe.status()}).`);
      }
    } catch (error) {
      if (error instanceof AcceptanceBlockedError) throw error;
      throw new AcceptanceBlockedError('Browser storefront unlock failed before proxy submission.');
    }
  } finally {
    await page.close();
  }
}

async function main() {
  const { execute } = parseArgs(process.argv.slice(2));
  const readiness = readJson(READINESS_PATH);
  const rawFixture = readJson(FIXTURE_PATH);
  const fixture = validatePayload(rawFixture);
  const identity = idempotencyIdentity(readiness.shopify.canonicalShop, fixture);
  const evidencePath = process.env.K1D02T_EVIDENCE_PATH;
  if (execute) {
    assertExecutionAuthorization(process.env.K1D02T_OWNER_AUTHORIZATION);
    if (!evidencePath) throw new AcceptanceBlockedError('K1D02T_EVIDENCE_PATH is required for the sanitized result.');
    if (fs.existsSync(evidencePath)) throw new AcceptanceBlockedError('The configured evidence path already exists; refusing an accidental rerun.');
  }

  const { clientId, clientSecret } = appCredentials(process.env.SHOPIFY_APP_PROJECT_DIR);
  assert.equal(clientId, readiness.shopify.clientId, 'Shopify CLI app identity differs from the readiness contract.');
  const token = await accessToken({ shop: readiness.shopify.canonicalShop, clientId, clientSecret });
  const admin = { shop: readiness.shopify.canonicalShop, apiVersion: readiness.shopify.apiVersion, token };
  const variantIds = fixture.items.map((item) => item.variantId);
  const variantData = await adminGraphql(admin, VERIFY_VARIANTS_QUERY, { ids: variantIds });
  assert.equal(variantData.shop.myshopifyDomain, readiness.shopify.canonicalShop);
  assert.equal(variantData.nodes.length, variantIds.length);
  for (const variant of variantData.nodes) {
    assert.equal(variant.__typename, 'ProductVariant');
    assert.equal(variant.availableForSale, true);
    assert.equal(variant.product.status, 'ACTIVE');
  }
  await adminGraphql(admin, READ_DRAFT_QUERY, { id: 'gid://shopify/DraftOrder/999999999999999999' });

  const beforeDrafts = await findAcceptanceDrafts(admin, fixture.quoteReference, identity.tag);
  const beforeClaim = d1Claim(identity.key);
  if (beforeDrafts.length || beforeClaim) {
    throw new AcceptanceBlockedError('The fixed acceptance reference already has Shopify or D1 state; refusing another live submission.');
  }
  if (!execute) {
    console.log(`K1D-02T preflight PASS: ${variantIds.length} eligible variants; no tagged draft or D1 claim exists.`);
    return;
  }

  const storefrontPassword = process.env.STOREFRONT_PASSWORD;
  if (!storefrontPassword) throw new AcceptanceBlockedError('STOREFRONT_PASSWORD is required in process memory.');
  const browser = await chromium.launch({ headless: true });
  let firstResponse;
  let duplicateResponse;
  try {
    const context = await browser.newContext();
    await unlockStorefront(readiness.shopify.storefrontAlias, storefrontPassword, context);
    try {
      firstResponse = await proxyPost(readiness.shopify.storefrontAlias, rawFixture, context);
    } catch {
      firstResponse = { status: 0, cacheControl: null, body: null };
    }

    const afterFirstDrafts = await findAcceptanceDrafts(admin, fixture.quoteReference, identity.tag);
    const afterFirstClaim = d1Claim(identity.key);
    const responseConfirmed = firstResponse.status === 200
      && firstResponse.body?.storedInShopifyAdmin === true
      && firstResponse.body?.duplicate !== true;
    const durableResultConfirmed = afterFirstDrafts.length === 1
      && afterFirstClaim?.state === 'COMPLETED'
      && afterFirstClaim?.draft_id === afterFirstDrafts[0].id;
    const rejectionConfirmed = firstResponse.status === 422
      && firstResponse.body?.code === 'SHOPIFY_REJECTED'
      && afterFirstDrafts.length === 0
      && afterFirstClaim?.state === 'FAILED_RETRYABLE'
      && !afterFirstClaim?.draft_id;
    if (rejectionConfirmed) {
      writeExclusiveEvidence(evidencePath, buildBlockedEvidence({
        fixture,
        identity,
        firstResponse,
        claim: afterFirstClaim,
        adminCount: afterFirstDrafts.length,
      }));
      throw new AcceptanceBlockedError(`Shopify confirmed rejection; no retry was attempted (HTTP 422, code SHOPIFY_REJECTED, drafts 0, D1 FAILED_RETRYABLE).`);
    }
    if (!responseConfirmed && !durableResultConfirmed) {
      throw new AcceptanceBlockedError(`The first result is ambiguous; no retry was attempted (HTTP ${firstResponse.status}, code ${firstResponse.body?.code || 'NONE'}, drafts ${afterFirstDrafts.length}, D1 ${afterFirstClaim?.state || 'ABSENT'}).`);
    }
    if (afterFirstDrafts.length !== 1 || afterFirstClaim?.state !== 'COMPLETED') {
      throw new AcceptanceBlockedError('The first result is ambiguous; no retry was attempted. Inspect the deterministic Shopify tag and D1 claim.');
    }

    const created = await adminGraphql(admin, READ_DRAFT_QUERY, { id: afterFirstDrafts[0].id });
    const verifiedDraft = verifyDraft(created.draftOrder, fixture, identity.tag);
    assert.equal(afterFirstClaim.draft_id, verifiedDraft.id);
    assert.equal(afterFirstClaim.draft_name, verifiedDraft.name);
    assert.equal(afterFirstClaim.quote_reference, fixture.quoteReference);
    assert.equal(afterFirstClaim.payload_hash, payloadHash(fixture));

    duplicateResponse = await proxyPost(readiness.shopify.storefrontAlias, rawFixture, context);
    assert.equal(duplicateResponse.status, 200);
    assert.equal(duplicateResponse.body?.duplicate, true);
    assert.equal(duplicateResponse.body?.staffIdentifier, verifiedDraft.name);

    const finalDrafts = await findAcceptanceDrafts(admin, fixture.quoteReference, identity.tag);
    const finalClaim = d1Claim(identity.key);
    assert.equal(finalDrafts.length, 1);
    assert.equal(finalDrafts[0].id, verifiedDraft.id);
    assert.equal(finalClaim?.state, 'COMPLETED');
    assert.equal(finalClaim?.draft_id, verifiedDraft.id);
    assert.equal(Number(finalClaim?.attempt_count), 1);

    const evidence = buildEvidence({ fixture, identity, firstResponse, duplicateResponse, draft: verifiedDraft, claim: finalClaim, adminCount: finalDrafts.length });
    writeExclusiveEvidence(evidencePath, evidence);
    console.log(`K1D-02T PASS: ${verifiedDraft.name} ${verifiedDraft.id}; duplicate suppressed; D1 COMPLETED.`);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  require('dotenv').config({ quiet: true });
  main().catch((error) => {
    const label = error instanceof AcceptanceBlockedError ? 'BLOCKED' : 'FAIL';
    console.error(`K1D-02T ${label}: ${String(error.message || error).replace(/https?:\/\/\S+/g, '[redacted-url]')}`);
    process.exitCode = 1;
  });
}

module.exports = {
  AUTHORIZATION_PHRASE,
  AcceptanceBlockedError,
  assertExecutionAuthorization,
  buildBlockedEvidence,
  buildEvidence,
  matchingDrafts,
  verifyDraft,
};
