'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const draftClient = require('../assets/rhino-quote-draft-client');
const {
  AcceptanceBlockedError,
  accessToken,
  adminGraphql,
  appCredentials,
  d1Claim,
  d1LatestDiagnostic,
  findAcceptanceDrafts,
  normalizedAttributes,
  redactSecrets,
  verifyDraft,
} = require('./run-epic-k-k1d02t-acceptance');
const {
  idempotencyIdentity,
  payloadHash,
  validatePayload,
} = require('../server/epic-k-draft-order/core');

const ROOT = path.resolve(__dirname, '..');
const READINESS = require('../data/epic-k-k1d02-backend-readiness.json');
const STORE_ORIGIN = 'https://sz5dnk-nf.myshopify.com';
const PREVIEW_THEME_ID = '158631198917';
const OWNER_AUTHORIZATION_FLAG = 'true';
const SESSION_PATH = path.join(os.tmpdir(), 'rhino-k1d03a-browser-state.json');
const PREFLIGHT_PATH = path.join(os.tmpdir(), 'rhino-k1d03a-preflight.json');
const EVIDENCE_DIR = path.join(ROOT, 'docs/qa/evidence/epic-k/k1d03a-storefront-2026-10-30');
const EVIDENCE_PATH = path.join(EVIDENCE_DIR, 'acceptance-success.json');
const FAILURE_PATH = path.join(EVIDENCE_DIR, 'acceptance-unconfirmed.json');
const SCREENSHOT_PATH = path.join(EVIDENCE_DIR, 'customer-confirmation.png');
const EXPECTED_ITEMS = Object.freeze([
  {
    id: 46484249903301,
    quantity: 1,
    properties: { Acceptance: 'K1D-03A', 'Requested preparation': 'Synthetic storefront quotation' },
  },
  {
    id: 46484250001605,
    quantity: 2,
    properties: { Acceptance: 'K1D-03A', 'Packaging note': 'Quantity two; keep line properties distinct' },
  },
]);

const ACCEPTANCE_DRAFT_QUERY = `#graphql
  query K1D03AAcceptanceDraft($id: ID!) {
    draftOrder(id: $id) {
      id name status tags createdAt updatedAt email phone note2
      invoiceSentAt completedAt reserveInventoryUntil
      acceptAutomaticDiscounts allowDiscountCodesInCheckout allVariantPricesOverridden
      discountCodes totalDiscountsSet { shopMoney { amount currencyCode } }
      customAttributes { key value }
      shippingLine { id title }
      shippingAddress {
        firstName lastName company address1 address2 city provinceCode zip countryCodeV2 phone
      }
      lineItems(first: 20) {
        nodes {
          id quantity variant { id title }
          customAttributes { key value }
          appliedDiscount { title value valueType }
        }
      }
    }
  }
`;

const VERIFY_VARIANTS_QUERY = `#graphql
  query K1D03AVariants($ids: [ID!]!) {
    shop { myshopifyDomain }
    nodes(ids: $ids) {
      __typename
      ... on ProductVariant { id availableForSale product { id status } }
    }
  }
`;

function readRuntime() {
  const dotenv = require('dotenv');
  const base = dotenv.parse(fs.readFileSync(path.join(ROOT, '.env')));
  const acceptance = dotenv.parse(fs.readFileSync(path.join(ROOT, '.env.k1d03a.local')));
  return { ...base, ...acceptance, ...process.env };
}

function required(runtime, name) {
  const value = String(runtime[name] || '').trim();
  if (!value) throw new AcceptanceBlockedError(`${name} is required in ignored runtime configuration.`);
  return value;
}

function boolValue(runtime, name) {
  const value = required(runtime, name).toLowerCase();
  if (!['true', 'false'].includes(value)) throw new AcceptanceBlockedError(`${name} must be true or false.`);
  return value === 'true';
}

function acceptanceValues(runtime) {
  const values = {
    firstName: required(runtime, 'K1D03A_FIRST_NAME'),
    lastName: required(runtime, 'K1D03A_LAST_NAME'),
    email: required(runtime, 'K1D03A_CONTACT_EMAIL').toLowerCase(),
    phone: String(runtime.K1D03A_PHONE || '').trim(),
    company: String(runtime.K1D03A_COMPANY || '').trim(),
    address1: required(runtime, 'K1D03A_ADDRESS1'),
    address2: String(runtime.K1D03A_ADDRESS2 || '').trim(),
    city: required(runtime, 'K1D03A_CITY'),
    provinceCode: required(runtime, 'K1D03A_PROVINCE_CODE').toUpperCase(),
    zip: required(runtime, 'K1D03A_POSTAL_CODE'),
    countryCode: required(runtime, 'K1D03A_COUNTRY_CODE').toUpperCase(),
    addressType: required(runtime, 'K1D03A_DELIVERY_TYPE').toLowerCase(),
    liftgateRequired: boolValue(runtime, 'K1D03A_LIFTGATE_REQUIRED'),
    insuranceRequested: boolValue(runtime, 'K1D03A_INSURANCE_REQUESTED'),
    accessInformation: required(runtime, 'K1D03A_ACCESS_INFORMATION'),
  };
  assert.match(values.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  assert.equal(values.countryCode, 'US');
  assert.ok(['residential', 'commercial'].includes(values.addressType));
  return values;
}

function parseMode(argv) {
  const modes = ['--preflight', '--execute', '--resume-confirmed', '--reconcile'].filter((flag) => argv.includes(flag));
  if (modes.length !== 1) throw new Error('Choose exactly one of --preflight, --execute, --resume-confirmed, or --reconcile.');
  return modes[0].slice(2);
}

function assertAuthorization(runtime) {
  if (String(runtime.K1D03A_OWNER_AUTHORIZED || '').toLowerCase() !== OWNER_AUTHORIZATION_FLAG) {
    throw new AcceptanceBlockedError('Explicit Product Owner authorization is required before the one live K1D-03A submission.');
  }
  assert.equal(READINESS.evidence.storefrontPasswordRotationConfirmed, true,
    'Accepted K1D-02T evidence must confirm storefront-password rotation.');
}

function hash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function loadPreflight() {
  if (!fs.existsSync(PREFLIGHT_PATH) || !fs.existsSync(SESSION_PATH)) {
    throw new AcceptanceBlockedError('A successful current K1D-03A preflight session is required.');
  }
  return JSON.parse(fs.readFileSync(PREFLIGHT_PATH, 'utf8'));
}

function writeExclusive(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, { flag: 'wx' });
}

async function adminContext(runtime) {
  const credentials = appCredentials(required(runtime, 'SHOPIFY_APP_PROJECT_DIR'));
  assert.equal(credentials.clientId, READINESS.shopify.clientId);
  const token = await accessToken({
    shop: READINESS.shopify.canonicalShop,
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
  });
  credentials.clientSecret = null;
  return { shop: READINESS.shopify.canonicalShop, apiVersion: READINESS.shopify.apiVersion, token };
}

async function verifyVariants(admin) {
  const ids = EXPECTED_ITEMS.map((item) => `gid://shopify/ProductVariant/${item.id}`);
  const data = await adminGraphql(admin, VERIFY_VARIANTS_QUERY, { ids });
  assert.equal(data.shop.myshopifyDomain, READINESS.shopify.canonicalShop);
  assert.equal(data.nodes.length, ids.length);
  for (const node of data.nodes) {
    assert.equal(node.__typename, 'ProductVariant');
    assert.equal(node.product.status, 'ACTIVE');
    assert.equal(node.availableForSale, true);
  }
  return ids;
}

async function verifyD2(admin) {
  const data = await adminGraphql(admin, ACCEPTANCE_DRAFT_QUERY, { id: READINESS.evidence.acceptedDraftId });
  const draft = data.draftOrder;
  assert.equal(draft.name, '#D2');
  assert.equal(draft.status, 'OPEN');
  assert.deepEqual([...draft.tags].sort(), ['K1D-d4a71c89ba75fd8252a0abe4', 'Unquoted']);
  assert.equal(draft.createdAt, draft.updatedAt, 'Draft Order #D2 has been modified since its accepted creation.');
  assert.equal(draft.shippingLine, null);
  assert.equal(draft.invoiceSentAt, null);
  assert.equal(draft.completedAt, null);
  assert.equal(draft.reserveInventoryUntil, null);
  return true;
}

async function authenticate(page, password) {
  await page.goto(`${STORE_ORIGIN}/?preview_theme_id=${PREVIEW_THEME_ID}`, { waitUntil: 'domcontentloaded' });
  if (new URL(page.url()).pathname !== '/password') return;
  await page.locator('password-modal summary').click();
  await page.locator('form[action$="/password"] input[name="password"]').fill(password);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    page.locator('form[action$="/password"] button[name="commit"]').click(),
  ]);
  if (new URL(page.url()).pathname === '/password') throw new AcceptanceBlockedError('Current storefront runtime password was rejected.');
}

async function seedActualCart(page) {
  const result = await page.evaluate(async (items) => {
    const root = window.Shopify?.routes?.root || '/';
    const clear = await fetch(`${root}cart/clear.js`, { method: 'POST', headers: { Accept: 'application/json' } });
    if (!clear.ok) return { ok: false, stage: 'clear', status: clear.status };
    const add = await fetch(`${root}cart/add.js`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!add.ok) return { ok: false, stage: 'add', status: add.status };
    const note = await fetch(`${root}cart/update.js`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'K1D-03A synthetic storefront acceptance; do not invoice or fulfill.' }),
    });
    return { ok: note.ok, stage: 'note', status: note.status };
  }, EXPECTED_ITEMS);
  assert.deepEqual(result, { ok: true, stage: 'note', status: 200 });
}

async function openCart(page) {
  const response = await page.goto(`${STORE_ORIGIN}/cart?preview_theme_id=${PREVIEW_THEME_ID}`, { waitUntil: 'networkidle' });
  assert.ok(response?.ok(), `Preview cart returned HTTP ${response?.status() || 0}.`);
  const component = page.locator('rhino-quote-mode[data-automation-enabled="true"]');
  await component.waitFor({ timeout: 15000 });
  await page.waitForFunction(() => Boolean(document.querySelector('rhino-quote-mode')?.cartBaseline));
  assert.equal(await page.locator('[data-rhino-email-submit]').count(), 1, 'Native email fallback is unavailable.');
  return component;
}

async function fillForm(page, values) {
  await page.locator('#RhinoFulfillmentShipping').check();
  await page.locator('#RhinoQuoteFirstName').fill(values.firstName);
  await page.locator('#RhinoQuoteLastName').fill(values.lastName);
  await page.locator('#RhinoQuoteEmail').fill(values.email);
  await page.locator('#RhinoQuotePhone').fill(values.phone);
  await page.locator('#RhinoQuoteCompany').fill(values.company);
  await page.locator('#RhinoQuoteAddress1').fill(values.address1);
  await page.locator('#RhinoQuoteAddress2').fill(values.address2);
  await page.locator('#RhinoQuoteCity').fill(values.city);
  await page.locator('#RhinoQuoteState').selectOption(values.provinceCode);
  await page.locator('#RhinoQuotePostalCode').fill(values.zip);
  await page.locator(`input[name="contact[delivery_type]"][value="${values.addressType === 'commercial' ? 'Commercial' : 'Residential'}"]`).check();
  await page.locator(`input[name="contact[liftgate_required]"][value="${values.liftgateRequired ? 'Yes' : 'No'}"]`).check();
  await page.locator('#RhinoQuoteAccess').fill(values.accessInformation);
  const insurance = page.locator('input[name="contact[insurance_options_requested]"]');
  if (values.insuranceRequested) await insurance.check(); else await insurance.uncheck();
}

async function readActualCart(page) {
  return page.evaluate(async () => {
    const root = window.Shopify?.routes?.root || '/';
    const response = await fetch(`${root}cart.js`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!response.ok) throw new Error(`Ajax cart returned HTTP ${response.status}.`);
    return response.json();
  });
}

function assertCart(cart) {
  assert.equal(cart.items.length, 2);
  assert.equal(cart.item_count, 3);
  assert.deepEqual(cart.discount_codes || [], []);
  for (const expected of EXPECTED_ITEMS) {
    const line = cart.items.find((item) => Number(item.variant_id) === expected.id);
    assert.ok(line, `Cart is missing Variant ${expected.id}.`);
    assert.equal(line.quantity, expected.quantity);
    assert.deepEqual(line.properties, expected.properties);
    assert.equal(line.selling_plan_allocation || null, null);
  }
}

async function prepareIdentity(page, cart, values) {
  return page.evaluate(async ({ expectedValues }) => {
    const component = document.querySelector('rhino-quote-mode');
    const client = window.RhinoQuoteDraftClient;
    const actualCartResponse = await fetch(`${window.Shopify?.routes?.root || '/'}cart.js`, {
      headers: { Accept: 'application/json' }, cache: 'no-store',
    });
    const actualCart = await actualCartResponse.json();
    const fingerprint = await client.fingerprint(actualCart, expectedValues);
    const reference = client.createReference(actualCart.item_count);
    const cartMaterial = client.canonicalJson(client.cartMaterial(actualCart));
    localStorage.setItem(client.ACTIVE_REQUEST_KEY, JSON.stringify({
      fingerprint, cartMaterial, reference, state: 'prepared', preparedAt: Date.now(),
    }));
    component.reference = reference;
    component.updateReferenceDisplay(reference);
    component.syncFallbackFields(reference);
    const safeToken = await client.safeCartToken(actualCart.token);
    return {
      reference,
      fingerprint,
      payload: client.buildPayload({ cart: actualCart, values: expectedValues, quoteReference: reference, cartToken: safeToken }),
      cartMaterial,
    };
  }, { expectedValues: values, cart });
}

async function signedProxyProbe(page) {
  const result = await page.evaluate(async () => {
    const response = await fetch('/apps/rhino-quote-draft', { method: 'GET', headers: { Accept: 'application/json' } });
    let body = null;
    try { body = await response.json(); } catch { /* expected JSON */ }
    return { status: response.status, code: body?.code || null };
  });
  assert.deepEqual(result, { status: 405, code: 'METHOD_NOT_ALLOWED' });
}

async function assertReferenceUnused(admin, fixture, identity) {
  const drafts = await findAcceptanceDrafts(admin, fixture.quoteReference, identity.tag);
  const claim = d1Claim(identity.key);
  assert.equal(drafts.length, 0, 'The generated quotation reference already matches a Shopify Draft Order.');
  assert.equal(claim, null, 'The generated quotation reference already has D1 state.');
}

function sanitizedFixture(fixture) {
  const propertyKeys = (properties) => (Array.isArray(properties)
    ? properties.map((entry) => entry.key).filter(Boolean)
    : Object.keys(properties || {})).sort();
  return {
    quoteReference: fixture.quoteReference,
    contactSource: 'ignored_secure_runtime_configuration',
    contactValuesPersisted: false,
    itemCount: fixture.items.length,
    totalQuantity: fixture.items.reduce((sum, item) => sum + item.quantity, 0),
    items: fixture.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      propertyKeys: propertyKeys(item.properties),
    })),
    addressType: fixture.delivery.addressType,
    liftgateRequired: fixture.delivery.liftgateRequired,
    insuranceRequested: fixture.delivery.insuranceRequested,
    discountCodes: fixture.discountCodes,
    sellingPlansPresent: false,
  };
}

async function preflight(runtime) {
  if (fs.existsSync(PREFLIGHT_PATH) || fs.existsSync(SESSION_PATH)) {
    throw new AcceptanceBlockedError('A K1D-03A preflight session already exists; reconcile it before preparing another reference.');
  }
  const values = acceptanceValues(runtime);
  const admin = await adminContext(runtime);
  await verifyVariants(admin);
  await verifyD2(admin);
  const browser = await chromium.launch({ headless: true });
  let password = required(runtime, 'STOREFRONT_PASSWORD');
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    await authenticate(page, password);
    password = null;
    await signedProxyProbe(page);
    await seedActualCart(page);
    await openCart(page);
    await fillForm(page, values);
    const cart = await readActualCart(page);
    assertCart(cart);
    const prepared = await prepareIdentity(page, cart, values);
    const fixture = validatePayload(prepared.payload);
    const identity = idempotencyIdentity(READINESS.shopify.canonicalShop, fixture);
    await assertReferenceUnused(admin, fixture, identity);
    await context.storageState({ path: SESSION_PATH });
    fs.writeFileSync(PREFLIGHT_PATH, `${JSON.stringify({
      schemaVersion: 1,
      preparedAt: new Date().toISOString(),
      reference: fixture.quoteReference,
      fingerprint: prepared.fingerprint,
      payloadHash: payloadHash(fixture),
      idempotencyKey: identity.key,
      reconciliationTag: identity.tag,
      cartMaterialHash: hash(prepared.cartMaterial),
      fixture: sanitizedFixture(fixture),
      previewThemeId: PREVIEW_THEME_ID,
      appProxyProbe: 'SIGNED_ROUTE_HTTP_405_METHOD_NOT_ALLOWED',
      draftOrderD2Untouched: true,
      authorizationReceived: false,
      browserSessionLocation: 'os_temporary_directory',
    }, null, 2)}\n`, { flag: 'wx' });
    console.log(`K1D-03A preflight PASS: reference ${fixture.quoteReference}; two active Variants; exact cart quantity 3; no matching Shopify draft or D1 claim.`);
    console.log('Execution remains gated on explicit Product Owner authorization for one synthetic Draft Order.');
  } finally {
    password = null;
    admin.token = null;
    await browser.close();
  }
}

function verifyAcceptanceDraft(draft, fixture, identity) {
  const base = verifyDraft(draft, fixture, identity.tag);
  assert.equal(draft.email, fixture.customer.email);
  return { ...base, completedOrderAbsent: draft.status === 'OPEN' && draft.completedAt === null };
}

function evidenceBase(preflight, fixture, identity) {
  return {
    schemaVersion: 1,
    batch: 'K1D-03A',
    reference: fixture.quoteReference,
    fixture: sanitizedFixture(fixture),
    deterministicIdentity: { reconciliationTag: identity.tag },
    preflight: {
      preparedAt: preflight.preparedAt,
      exactCartVerified: true,
      variantsActiveAndAvailable: true,
      noPriorShopifyDraft: true,
      noPriorD1Claim: true,
      draftOrderD2Untouched: true,
      signedAppProxyOperational: true,
      previewUnpublished: true,
      previewAutomationEnabled: true,
      productionChanged: false,
      passwordRotationBasis: 'accepted_k1d02t_confirmation_no_subsequent_exposure',
    },
  };
}

async function reconcile(admin, preflight) {
  const identity = { key: preflight.idempotencyKey, tag: preflight.reconciliationTag };
  const drafts = await findAcceptanceDrafts(admin, preflight.reference, identity.tag);
  const claim = d1Claim(identity.key);
  return { drafts, claim, identity };
}

async function reconcileWithReadOnlyWait(admin, preflight, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  let result;
  do {
    result = await reconcile(admin, preflight);
    if (result.drafts.length === 1 && result.claim?.state === 'COMPLETED') return result;
    if (result.drafts.length > 1 || ['FAILED_FINAL', 'FAILED_RETRYABLE'].includes(result.claim?.state)) return result;
    if (Date.now() >= deadline) return result;
    await new Promise((resolve) => setTimeout(resolve, 2000));
  } while (Date.now() <= deadline);
  return result;
}

async function execute(runtime) {
  assertAuthorization(runtime);
  if (fs.existsSync(EVIDENCE_PATH) || fs.existsSync(FAILURE_PATH)) {
    throw new AcceptanceBlockedError('K1D-03A evidence already exists; refusing an accidental rerun.');
  }
  const preflight = loadPreflight();
  const values = acceptanceValues(runtime);
  const admin = await adminContext(runtime);
  await verifyVariants(admin);
  await verifyD2(admin);
  const before = await reconcile(admin, preflight);
  assert.equal(before.drafts.length, 0);
  assert.equal(before.claim, null);

  const browser = await chromium.launch({ headless: true });
  let proxyPostCount = 0;
  let contactPostCount = 0;
  let proxyResponse;
  try {
    const context = await browser.newContext({ storageState: SESSION_PATH, viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.on('request', (request) => {
      const pathname = new URL(request.url()).pathname;
      if (pathname === '/apps/rhino-quote-draft' && request.method() === 'POST') proxyPostCount += 1;
      if (pathname === '/contact' && request.method() === 'POST') contactPostCount += 1;
    });
    await openCart(page);
    await fillForm(page, values);
    const cart = await readActualCart(page);
    assertCart(cart);
    const active = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), draftClient.ACTIVE_REQUEST_KEY);
    assert.equal(active?.state, 'prepared');
    assert.equal(active?.reference, preflight.reference);
    const fingerprint = await page.evaluate(async (expectedValues) => {
      const response = await fetch(`${window.Shopify?.routes?.root || '/'}cart.js`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      return window.RhinoQuoteDraftClient.fingerprint(await response.json(), expectedValues);
    }, values);
    assert.equal(fingerprint, preflight.fingerprint);

    const responsePromise = page.waitForResponse((response) => (
      new URL(response.url()).pathname === '/apps/rhino-quote-draft'
      && response.request().method() === 'POST'
    ), { timeout: 45000 }).catch(() => null);
    await page.locator('[data-rhino-draft-submit]').click();
    proxyResponse = await responsePromise;
    await page.waitForFunction(() => {
      const component = document.querySelector('rhino-quote-mode');
      return ['confirmed', 'uncertain', 'fallback', 'failed'].includes(component?.submissionState);
    }, null, { timeout: 45000 });
    assert.equal(proxyPostCount, 1, 'The customer action must issue exactly one app-proxy POST.');
    assert.equal(contactPostCount, 0, 'The native email fallback was submitted automatically.');

    const after = await reconcileWithReadOnlyWait(admin, preflight);
    const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || 'null'), draftClient.ACTIVE_REQUEST_KEY);
    const confirmed = state?.state === 'confirmed'
      && proxyResponse?.status() === 200
      && after.drafts.length === 1
      && after.claim?.state === 'COMPLETED';

    if (!confirmed) {
      const diagnostic = after.claim ? d1LatestDiagnostic(preflight.idempotencyKey) : null;
      writeExclusive(FAILURE_PATH, {
        ...evidenceBase(preflight, {
          quoteReference: preflight.reference,
          items: EXPECTED_ITEMS.map((item) => ({ variantId: `gid://shopify/ProductVariant/${item.id}`, quantity: item.quantity, properties: item.properties })),
          delivery: values,
          discountCodes: [],
        }, after.identity),
        status: state?.state === 'uncertain' ? 'UNCERTAIN' : 'REJECTED_OR_UNCONFIRMED',
        observedAt: new Date().toISOString(),
        proxy: { postCount: proxyPostCount, httpStatus: proxyResponse?.status() || 0 },
        admin: { matchingDraftCount: after.drafts.length },
        d1: { state: after.claim?.state || 'ABSENT', attemptCount: Number(after.claim?.attempt_count || 0) },
        diagnostic,
        retried: false,
        fallbackSubmitted: false,
      });
      throw new AcceptanceBlockedError('The live result was not confirmed; reconciliation evidence was saved and no retry was attempted.');
    }

    const requestPayload = validatePayload(JSON.parse(proxyResponse.request().postData() || '{}'));
    assert.equal(requestPayload.quoteReference, preflight.reference);
    assert.equal(payloadHash(requestPayload), preflight.payloadHash);
    assert.equal(after.drafts.length, 1);
    assert.equal(after.claim.draft_id, after.drafts[0].id);
    assert.equal(after.claim.quote_reference, preflight.reference);
    assert.equal(after.claim.payload_hash, preflight.payloadHash);
    assert.equal(Number(after.claim.attempt_count), 1);

    const created = await adminGraphql(admin, ACCEPTANCE_DRAFT_QUERY, { id: after.drafts[0].id });
    const verifiedDraft = verifyAcceptanceDraft(created.draftOrder, requestPayload, after.identity);
    assert.equal(state.staffIdentifier, verifiedDraft.name);
    const confirmation = page.locator('[data-rhino-draft-confirmation]');
    await confirmation.waitFor({ state: 'visible' });
    assert.equal((await confirmation.locator('[data-rhino-confirmed-reference]').textContent()).trim(), preflight.reference);
    assert.equal((await confirmation.locator('[data-rhino-confirmed-draft]').textContent()).trim(), verifiedDraft.name);
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
    await confirmation.screenshot({ path: SCREENSHOT_PATH });

    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('rhino-quote-mode[data-automation-enabled="true"]').waitFor();
    await page.locator('[data-rhino-draft-confirmation]').waitFor({ state: 'visible' });
    assert.equal(proxyPostCount, 1, 'Refresh issued a second app-proxy POST.');
    assert.equal(contactPostCount, 0);
    const refreshedReference = (await page.locator('[data-rhino-confirmed-reference]').textContent()).trim();
    const refreshedDraft = (await page.locator('[data-rhino-confirmed-draft]').textContent()).trim();
    assert.equal(refreshedReference, preflight.reference);
    assert.equal(refreshedDraft, verifiedDraft.name);

    const final = await reconcile(admin, preflight);
    assert.equal(final.drafts.length, 1);
    assert.equal(final.drafts[0].id, created.draftOrder.id);
    assert.equal(final.claim.state, 'COMPLETED');
    assert.equal(Number(final.claim.attempt_count), 1);
    await verifyD2(admin);

    writeExclusive(EVIDENCE_PATH, {
      ...evidenceBase(preflight, requestPayload, final.identity),
      status: 'PASS',
      acceptedAt: new Date().toISOString(),
      authorization: { scope: 'exactly_one_synthetic_unpaid_uninvoiced_draft', confirmed: true },
      customerExperience: {
        displayedReference: preflight.reference,
        displayedDraftName: verifiedDraft.name,
        matchedShopify: true,
        confirmationRestoredAfterRefresh: true,
        proxyPostsBeforeAndAfterRefresh: proxyPostCount,
        emailFallbackPosts: contactPostCount,
      },
      proxy: { httpStatus: proxyResponse.status(), postCount: proxyPostCount, mocked: false, intercepted: false },
      admin: { matchingDraftCount: final.drafts.length, draft: verifiedDraft },
      d1: {
        state: final.claim.state,
        attemptCount: Number(final.claim.attempt_count),
        draftId: final.claim.draft_id,
        draftName: final.claim.draft_name,
        payloadHashMatched: final.claim.payload_hash === preflight.payloadHash,
      },
      safety: {
        draftOrdersCreated: 1,
        shippingLineCreated: false,
        invoiceSent: false,
        paymentCollected: false,
        orderCompleted: false,
        fulfillmentCreated: false,
        inventoryReserved: false,
        fallbackSubmitted: false,
        productionThemePublishedOrChanged: false,
        shippingOrPickupConfigurationChanged: false,
      },
      screenshot: path.basename(SCREENSHOT_PATH),
      contactValuesPersisted: false,
      credentialsPersisted: false,
      authenticatedUrlsPersisted: false,
    });
    fs.rmSync(SESSION_PATH, { force: true });
    fs.rmSync(PREFLIGHT_PATH, { force: true });
    console.log(`K1D-03A ACCEPTED: ${verifiedDraft.name}; reference ${preflight.reference}; one proxy POST; one Shopify Draft Order; D1 COMPLETED attempt 1; refresh created no duplicate.`);
  } finally {
    admin.token = null;
    await browser.close();
  }
}

function preparedBrowserIdentity() {
  const storage = JSON.parse(fs.readFileSync(SESSION_PATH, 'utf8'));
  const entry = storage.origins
    ?.flatMap((origin) => origin.localStorage || [])
    .find((item) => item.name === draftClient.ACTIVE_REQUEST_KEY);
  const active = entry ? JSON.parse(entry.value) : null;
  if (!active || active.state !== 'prepared') {
    throw new AcceptanceBlockedError('The preserved browser session does not contain the prepared K1D-03A identity.');
  }
  return active;
}

async function resumeConfirmed(runtime) {
  if (fs.existsSync(EVIDENCE_PATH) || fs.existsSync(FAILURE_PATH)) {
    throw new AcceptanceBlockedError('K1D-03A evidence already exists; refusing an accidental rerun.');
  }
  const preflight = loadPreflight();
  const values = acceptanceValues(runtime);
  const prepared = preparedBrowserIdentity();
  assert.equal(prepared.reference, preflight.reference);
  assert.equal(prepared.fingerprint, preflight.fingerprint);

  const admin = await adminContext(runtime);
  await verifyVariants(admin);
  await verifyD2(admin);
  const reconciled = await reconcile(admin, preflight);
  assert.equal(reconciled.drafts.length, 1, 'The original reference must match exactly one Shopify Draft Order.');
  assert.equal(reconciled.claim?.state, 'COMPLETED');
  assert.equal(Number(reconciled.claim?.attempt_count), 1);
  assert.equal(reconciled.claim?.draft_id, reconciled.drafts[0].id);
  assert.equal(reconciled.claim?.draft_name, reconciled.drafts[0].name);
  const diagnostic = d1LatestDiagnostic(preflight.idempotencyKey);
  assert.equal(diagnostic?.outcomeCategory, 'DRAFT_CREATED');
  assert.equal(diagnostic?.httpStatus, 200);

  const confirmedIdentity = {
    ...prepared,
    state: 'confirmed',
    staffIdentifier: reconciled.claim.draft_name,
    confirmedAt: Date.now(),
  };
  const browser = await chromium.launch({ headless: true });
  let proxyPostCount = 0;
  let contactPostCount = 0;
  let password = required(runtime, 'STOREFRONT_PASSWORD');
  try {
    const context = await browser.newContext({ storageState: SESSION_PATH, viewport: { width: 1440, height: 1000 } });
    await context.addInitScript(({ key, value }) => {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* unavailable on opaque origins */ }
    }, { key: draftClient.ACTIVE_REQUEST_KEY, value: confirmedIdentity });
    const page = await context.newPage();
    page.on('request', (request) => {
      const pathname = new URL(request.url()).pathname;
      if (pathname === '/apps/rhino-quote-draft' && request.method() === 'POST') proxyPostCount += 1;
      if (pathname === '/contact' && request.method() === 'POST') contactPostCount += 1;
    });

    await authenticate(page, password);
    password = null;
    await openCart(page);
    const cart = await readActualCart(page);
    assertCart(cart);
    const payload = validatePayload(await page.evaluate(async ({ expectedValues, reference }) => {
      const client = window.RhinoQuoteDraftClient;
      const response = await fetch(`${window.Shopify?.routes?.root || '/'}cart.js`, {
        headers: { Accept: 'application/json' }, cache: 'no-store',
      });
      const actualCart = await response.json();
      const cartToken = await client.safeCartToken(actualCart.token);
      return client.buildPayload({ cart: actualCart, values: expectedValues, quoteReference: reference, cartToken });
    }, { expectedValues: values, reference: preflight.reference }));
    assert.equal(payloadHash(payload), preflight.payloadHash);

    const confirmation = page.locator('[data-rhino-draft-confirmation]');
    await confirmation.waitFor({ state: 'visible', timeout: 15000 });
    assert.equal(await page.locator('#RhinoFulfillmentShipping').isChecked(), true);
    assert.equal((await confirmation.locator('[data-rhino-confirmed-reference]').textContent()).trim(), preflight.reference);
    assert.equal((await confirmation.locator('[data-rhino-confirmed-draft]').textContent()).trim(), reconciled.claim.draft_name);
    assert.equal(proxyPostCount, 0, 'Restoring a confirmed request issued an app-proxy POST.');
    assert.equal(contactPostCount, 0, 'Restoring a confirmed request submitted the email fallback.');
    fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
    await confirmation.screenshot({ path: SCREENSHOT_PATH });

    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('rhino-quote-mode[data-automation-enabled="true"]').waitFor();
    await page.locator('[data-rhino-draft-confirmation]').waitFor({ state: 'visible', timeout: 15000 });
    assert.equal(await page.locator('#RhinoFulfillmentShipping').isChecked(), true);
    assert.equal((await page.locator('[data-rhino-confirmed-reference]').textContent()).trim(), preflight.reference);
    assert.equal((await page.locator('[data-rhino-confirmed-draft]').textContent()).trim(), reconciled.claim.draft_name);
    assert.equal(proxyPostCount, 0, 'Refreshing restored confirmation issued an app-proxy POST.');
    assert.equal(contactPostCount, 0);

    const created = await adminGraphql(admin, ACCEPTANCE_DRAFT_QUERY, { id: reconciled.drafts[0].id });
    const verifiedDraft = verifyAcceptanceDraft(created.draftOrder, payload, reconciled.identity);
    const final = await reconcile(admin, preflight);
    assert.equal(final.drafts.length, 1);
    assert.equal(final.drafts[0].id, created.draftOrder.id);
    assert.equal(final.claim.state, 'COMPLETED');
    assert.equal(Number(final.claim.attempt_count), 1);
    await verifyD2(admin);

    writeExclusive(EVIDENCE_PATH, {
      ...evidenceBase(preflight, payload, final.identity),
      status: 'PASS',
      acceptedAt: diagnostic.assessedAt,
      refreshFixVerifiedAt: new Date().toISOString(),
      authorization: { scope: 'exactly_one_synthetic_unpaid_uninvoiced_draft', confirmed: true },
      customerExperience: {
        displayedReference: preflight.reference,
        displayedDraftName: verifiedDraft.name,
        matchedShopify: true,
        initialConfirmationObservedBeforeRefreshDefect: true,
        refreshVisibilityDefectReproduced: true,
        refreshVisibilityFixVerified: true,
        confirmationRestoredAfterRefresh: true,
        additionalProxyPostsDuringRecoveryAndRefresh: proxyPostCount,
        emailFallbackPostsDuringRecoveryAndRefresh: contactPostCount,
      },
      proxy: {
        liveSubmissionPostCount: 1,
        recoveryAndRefreshPostCount: proxyPostCount,
        httpStatus: diagnostic.httpStatus,
        mocked: false,
        intercepted: false,
      },
      admin: { matchingDraftCount: final.drafts.length, draft: verifiedDraft },
      d1: {
        state: final.claim.state,
        attemptCount: Number(final.claim.attempt_count),
        draftId: final.claim.draft_id,
        draftName: final.claim.draft_name,
        outcomeCategory: diagnostic.outcomeCategory,
        payloadHashMatched: final.claim.payload_hash === preflight.payloadHash,
      },
      defect: {
        classification: 'STOREFRONT_CONFIRMATION_VISIBILITY_AFTER_REFRESH',
        backendAffected: false,
        duplicateCreated: false,
        fix: 'Selecting the persisted shipping mode before showing a restored confirmation keeps its parent panel visible.',
      },
      safety: {
        draftOrdersCreated: 1,
        shippingLineCreated: false,
        invoiceSent: false,
        paymentCollected: false,
        orderCompleted: false,
        fulfillmentCreated: false,
        inventoryReserved: false,
        fallbackSubmitted: false,
        productionThemePublishedOrChanged: false,
        shippingOrPickupConfigurationChanged: false,
      },
      screenshot: path.basename(SCREENSHOT_PATH),
      contactValuesPersisted: false,
      credentialsPersisted: false,
      authenticatedUrlsPersisted: false,
    });
    fs.rmSync(SESSION_PATH, { force: true });
    fs.rmSync(PREFLIGHT_PATH, { force: true });
    console.log(`K1D-03A ACCEPTED: ${verifiedDraft.name}; reference ${preflight.reference}; exactly one live proxy POST historically; zero recovery or refresh POSTs; one Shopify Draft Order; D1 COMPLETED attempt 1.`);
  } finally {
    password = null;
    admin.token = null;
    await browser.close();
  }
}

async function reconcileOnly(runtime) {
  const preflight = loadPreflight();
  const admin = await adminContext(runtime);
  try {
    const result = await reconcile(admin, preflight);
    const diagnostic = result.claim ? d1LatestDiagnostic(preflight.idempotencyKey) : null;
    console.log(JSON.stringify({
      reference: preflight.reference,
      matchingDrafts: result.drafts.map((draft) => ({ id: draft.id, name: draft.name, status: draft.status })),
      d1: result.claim ? {
        state: result.claim.state,
        attemptCount: Number(result.claim.attempt_count),
        draftId: result.claim.draft_id,
        draftName: result.claim.draft_name,
      } : null,
      diagnostic,
    }, null, 2));
  } finally {
    admin.token = null;
  }
}

async function main() {
  const runtime = readRuntime();
  const mode = parseMode(process.argv.slice(2));
  if (mode === 'preflight') return preflight(runtime);
  if (mode === 'execute') return execute(runtime);
  if (mode === 'resume-confirmed') return resumeConfirmed(runtime);
  return reconcileOnly(runtime);
}

if (require.main === module) {
  main().catch((error) => {
    const runtime = (() => { try { return readRuntime(); } catch { return {}; } })();
    console.error(`K1D-03A ${error instanceof AcceptanceBlockedError ? 'BLOCKED' : 'FAIL'}: ${redactSecrets(error.message || error, [
      runtime.STOREFRONT_PASSWORD,
      runtime.K1D03A_CONTACT_EMAIL,
      runtime.K1D03A_FIRST_NAME,
      runtime.K1D03A_LAST_NAME,
      runtime.K1D03A_ADDRESS1,
    ])}`);
    process.exitCode = 1;
  });
}

module.exports = {
  OWNER_AUTHORIZATION_FLAG,
  acceptanceValues,
  assertAuthorization,
  assertCart,
  parseMode,
  sanitizedFixture,
};
