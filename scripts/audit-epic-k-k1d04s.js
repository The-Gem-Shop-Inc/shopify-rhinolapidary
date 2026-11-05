'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..');
const STORE = 'sz5dnk-nf.myshopify.com';
const ORIGIN = `https://${STORE}`;
const OUTPUT = path.join(
  ROOT,
  'docs/qa/evidence/epic-k/k1d04p-release-readiness-2026-11-05/checkout-enforcement-2026-11-05.json',
);
const CONFIRMATION_OUTPUT = path.join(
  ROOT,
  'docs/qa/evidence/epic-k/k1d04p-release-readiness-2026-11-05/checkout-bypass-confirmation-2026-11-05.json',
);
const CONFIRM_BYPASS = process.argv.includes('--confirm-bypass');
const UNAVAILABLE_PICKUP = process.argv.includes('--unavailable-pickup');
const UNAVAILABLE_PICKUP_OUTPUT = path.join(
  ROOT,
  'docs/qa/evidence/epic-k/k1d04p-release-readiness-2026-11-05/unavailable-pickup-checkout-2026-11-05.json',
);

const DESTINATIONS = {
  wisconsin: { country: 'US', province: 'WI', postalCode: '53024', city: 'Grafton' },
  illinois: { country: 'US', province: 'IL', postalCode: '60601', city: 'Chicago' },
  alaska: { country: 'US', province: 'AK', postalCode: '99501', city: 'Anchorage' },
  canada: { country: 'CA', province: 'ON', postalCode: 'M5V 2T6', city: 'Toronto' },
};

const SCENARIOS = [
  { id: 'general_accessory_wisconsin', handles: ['screw-on-flat-lap'], destination: 'wisconsin' },
  { id: 'machinery_illinois', handles: ['beadmaster'], destination: 'illinois' },
  { id: 'mixed_general_machinery_wisconsin', handles: ['screw-on-flat-lap', 'beadmaster'], destination: 'wisconsin' },
  { id: 'general_accessory_alaska', handles: ['screw-on-flat-lap'], destination: 'alaska' },
  { id: 'general_accessory_canada', handles: ['screw-on-flat-lap'], destination: 'canada' },
];

function runtime() {
  const dotenv = require('dotenv');
  const values = fs.existsSync(path.join(ROOT, '.env'))
    ? dotenv.parse(fs.readFileSync(path.join(ROOT, '.env')))
    : {};
  return { ...values, ...process.env };
}

function required(values, key) {
  const value = String(values[key] || '').trim();
  if (!value) throw new Error(`${key} is required in secure runtime configuration.`);
  return value;
}

async function authenticate(page, password) {
  await page.goto(ORIGIN, { waitUntil: 'domcontentloaded' });
  if (new URL(page.url()).pathname !== '/password') return;
  const summary = page.locator('password-modal summary');
  const input = page.locator('form[action$="/password"] input[name="password"]');
  if (await summary.count() && !(await input.isVisible())) await summary.click();
  await input.fill(password);
  const responsePromise = page.waitForResponse((response) => response.request().method() === 'POST'
    && new URL(response.url()).pathname.endsWith('/password'));
  await page.locator('form[action$="/password"] button[name="commit"]').click();
  const response = await responsePromise;
  await page.waitForLoadState('domcontentloaded');
  assert.notEqual(response.status(), 429, 'Storefront password endpoint was throttled; stop and retry later.');
  assert.notEqual(new URL(page.url()).pathname, '/password', 'Storefront password was rejected.');
}

async function jsonRequest(page, target, options = {}) {
  return page.evaluate(async ({ target: url, options: init }) => {
    const response = await fetch(url, init);
    let body = null;
    try { body = await response.json(); } catch { /* response may not be JSON */ }
    return { status: response.status, body, retryAfter: response.headers.get('retry-after') };
  }, { target, options });
}

async function storefrontProduct(page, handle) {
  const result = await jsonRequest(page, `/products/${handle}.js`, { headers: { Accept: 'application/json' } });
  if (result.status === 404) return null;
  assert.notEqual(result.status, 429, `Product ${handle} lookup was throttled; stop and retry later.`);
  assert.equal(result.status, 200, `Product ${handle} could not be read.`);
  const variant = result.body.variants.find((candidate) => candidate.available);
  return variant ? {
    handle,
    variantId: String(variant.id),
    quantity: 1,
    requiresShipping: variant.requires_shipping === true,
  } : null;
}

async function firstAvailableProduct(page, handles, classification) {
  for (const handle of handles) {
    const product = await storefrontProduct(page, handle);
    if (product) return { ...product, classification };
  }
  throw new Error(`No currently available ${classification} Product was found.`);
}

async function seedFreshCart(page, lines) {
  const before = await jsonRequest(page, '/cart.js', { headers: { Accept: 'application/json' } });
  assert.equal(before.status, 200);
  assert.equal(before.body.item_count, 0, 'Scenario must start from a fresh empty cart.');
  const add = await jsonRequest(page, '/cart/add.js', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: lines.map((line) => ({ id: Number(line.variantId), quantity: line.quantity })) }),
  });
  assert.notEqual(add.status, 429, 'Cart add was throttled; stop rather than retrying an ambiguous request.');
  assert.equal(add.status, 200, `Cart add failed with HTTP ${add.status}.`);
  const cart = await jsonRequest(page, '/cart.js', { headers: { Accept: 'application/json' } });
  assert.equal(cart.status, 200);
  assert.equal(cart.body.items.length, lines.length, 'Cart line count differs from the intended scenario.');
  assert.equal(cart.body.item_count, lines.reduce((sum, line) => sum + line.quantity, 0));
  const actual = cart.body.items.map((item) => String(item.variant_id)).sort();
  const expected = lines.map((line) => line.variantId).sort();
  assert.deepEqual(actual, expected, 'Cart Variant identities differ from the intended scenario.');
  return {
    lineCount: cart.body.items.length,
    itemCount: cart.body.item_count,
    variantIds: actual,
    discountCodesPresent: Array.isArray(cart.body.discount_codes) && cart.body.discount_codes.length > 0,
    sellingPlansPresent: cart.body.items.some((item) => Boolean(item.selling_plan_allocation)),
    requiresShippingByVariant: Object.fromEntries(cart.body.items.map((item) => [
      String(item.variant_id),
      item.requires_shipping === true,
    ])),
  };
}

async function ajaxRates(page, destination) {
  const params = new URLSearchParams({
    'shipping_address[country]': destination.country,
    'shipping_address[province]': destination.province,
    'shipping_address[zip]': destination.postalCode,
  });
  const result = await jsonRequest(page, `/cart/shipping_rates.json?${params}`, { headers: { Accept: 'application/json' } });
  assert.notEqual(result.status, 429, 'Shipping-rate request was throttled; stop rather than infer a result.');
  return {
    httpStatus: result.status,
    methodCount: Array.isArray(result.body?.shipping_rates) ? result.body.shipping_rates.length : 0,
    methods: Array.isArray(result.body?.shipping_rates)
      ? result.body.shipping_rates.map((rate) => ({ name: rate.name, price: rate.price, source: rate.source || null }))
      : [],
  };
}

async function fillFirst(page, selectors, value) {
  for (const selector of selectors) {
    const target = page.locator(selector).filter({ visible: true }).first();
    if (await target.count()) {
      await target.fill(value);
      return true;
    }
  }
  return false;
}

async function selectFirst(page, selectors, value) {
  for (const selector of selectors) {
    const target = page.locator(selector).filter({ visible: true }).first();
    if (await target.count()) {
      await target.selectOption(value);
      return true;
    }
  }
  return false;
}

async function checkoutState(page, destination) {
  await page.goto(`${ORIGIN}/checkout`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  const reachedCheckout = /checkout/i.test(await page.title()) || new URL(page.url()).pathname.includes('/checkouts/');
  assert.equal(reachedCheckout, true, 'Direct /checkout did not reach Shopify checkout.');

  await fillFirst(page, ['input[name="email"]', 'input[autocomplete="email"]'], 'k1d04-audit@example.invalid');
  await selectFirst(page, ['select[name="countryCode"]', 'select[autocomplete="country"]'], destination.country);
  await fillFirst(page, ['input[name="firstName"]', 'input[autocomplete="given-name"]'], 'Synthetic');
  await fillFirst(page, ['input[name="lastName"]', 'input[autocomplete="family-name"]'], 'Acceptance');
  await fillFirst(page, ['input[name="address1"]', 'input[autocomplete="address-line1"]'], '1 Audit Way');
  await fillFirst(page, ['input[name="city"]', 'input[autocomplete="address-level2"]'], destination.city);
  await selectFirst(page, ['select[name="zone"]', 'select[autocomplete="address-level1"]'], destination.province);
  await fillFirst(page, ['input[name="postalCode"]', 'input[autocomplete="postal-code"]'], destination.postalCode);
  await page.waitForTimeout(1500);

  const continueButton = page.getByRole('button', { name: /continue to (shipping|delivery|payment)|review order/i }).filter({ visible: true }).first();
  if (await continueButton.count() && await continueButton.isEnabled()) {
    await continueButton.click();
    await page.waitForTimeout(3000);
  }

  const rawText = await page.locator('body').innerText();
  const text = rawText.replace(/\s+/g, ' ');
  const paymentInputs = page.locator('input[name="basic"], input[name*="payment" i], iframe[title*="payment" i], [data-payment-method]');
  const deliveryOptions = page.locator('input[type="radio"][name*="shipping" i], input[type="radio"][name*="delivery" i]');
  const payButton = page.locator('#checkout-pay-button, button:has-text("Pay now"), button:has-text("Complete order")').filter({ visible: true }).first();
  const payButtonPresent = Boolean(await payButton.count());
  const payButtonEnabled = payButtonPresent ? await payButton.isEnabled() : false;
  const pickupSelected = /Pickup in store/i.test(text)
    && /1411 6th Ave,?\s*Grafton/i.test(text);
  const shippingAddressPresented = /Shipping address/i.test(text);
  const selectedDeliveryContext = pickupSelected
    ? 'GRAFTON_PICKUP'
    : (shippingAddressPresented ? 'SHIPPING' : 'NO_CONFIRMED_DELIVERY_CONTEXT');
  return {
    reachable: true,
    noDeliveryMessagePresent: /not available|no shipping|can\'t ship|cannot ship|does not ship|no delivery/i.test(text),
    deliveryMethodControlCount: await deliveryOptions.count(),
    paymentControlCount: await paymentInputs.count(),
    paymentStageTextPresent: /payment method|credit card|pay now/i.test(text),
    payButtonPresent,
    payButtonEnabled,
    payButtonLabel: payButtonPresent ? (await payButton.innerText()).replace(/\s+/g, ' ').slice(0, 80) : null,
    sanitizedTextSignals: {
      shippingAddressHeading: /shipping address/i.test(text),
      billingAddressHeading: /billing address/i.test(text),
      deliveryHeading: /delivery/i.test(text),
      shippingHeading: /shipping/i.test(text),
      freeShippingText: /free shipping|shipping free/i.test(text),
      noShippingAvailableText: /not available|no shipping|can\'t ship|cannot ship|does not ship|no delivery/i.test(text),
    },
    sanitizedDeliveryLines: [...new Set(rawText.split(/\r?\n/)
      .map((line) => line.trim().replace(/\s+/g, ' '))
      .filter((line) => /shipping|delivery|pickup|pick up|Grafton|billing address|pay now|complete order/i.test(line))
      .map((line) => line
        .replace(/k1d04-audit@example\.invalid/gi, '[REDACTED_EMAIL]')
        .replace(/1 Audit Way/gi, '[REDACTED_ADDRESS]')
        .replace(/\b(?:53024|60601|99501|M5V\s*2T6)\b/gi, '[REDACTED_POSTAL]'))
      .slice(0, 50))],
    selectedDeliveryContext,
    pickupSelected,
    shippingAddressPresented,
    payableShippingBypassObserved: payButtonEnabled && selectedDeliveryContext === 'SHIPPING',
    checkoutUrlPersisted: false,
  };
}

async function pickupState(page, line) {
  const response = await page.goto(`${ORIGIN}/variants/${line.variantId}/?section_id=pickup-availability`, {
    waitUntil: 'domcontentloaded',
  });
  const text = (await page.locator('body').innerText()).replace(/\s+/g, ' ');
  return {
    httpStatus: response?.status() || 0,
    graftonMentioned: /Grafton|1411 6th Ave/i.test(text),
    available: /pickup available|ready for pickup|usually ready/i.test(text)
      && !/pickup unavailable|not available/i.test(text),
  };
}

async function findUnavailablePickupCandidate(page) {
  const catalog = await jsonRequest(page, '/products.json?limit=250', { headers: { Accept: 'application/json' } });
  assert.notEqual(catalog.status, 429, 'Product catalog lookup was throttled; stop and retry later.');
  assert.equal(catalog.status, 200, 'Published Product catalog could not be read.');
  let checkedCount = 0;
  for (const product of catalog.body.products || []) {
    const variant = product.variants.find((candidate) => candidate.available && candidate.requires_shipping === true);
    if (!variant) continue;
    const line = {
      handle: product.handle,
      variantId: String(variant.id),
      quantity: 1,
      requiresShipping: true,
      classification: 'published_shippable_pickup_probe',
    };
    const pickup = await pickupState(page, line);
    checkedCount += 1;
    if (!pickup.available) return { line, pickup, checkedCount };
    await page.waitForTimeout(100);
  }
  return { line: null, pickup: null, checkedCount };
}

async function main() {
  const values = runtime();
  let password = required(values, 'STOREFRONT_PASSWORD');
  const browser = await chromium.launch({ headless: true });
  const operations = {
    cartAddPosts: 0,
    quotationProxyPosts: 0,
    contactPosts: 0,
    paymentOrCompletionPosts: 0,
  };
  try {
    const authContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const authPage = await authContext.newPage();
    await authenticate(authPage, password);
    const products = {};
    products['screw-on-flat-lap'] = await firstAvailableProduct(authPage, [
      'screw-on-flat-lap',
      'allen-wrench',
      'arbor-wrench',
      'brass-sprayer',
    ], 'general_profile_accessory');
    products.beadmaster = await firstAvailableProduct(authPage, [
      'beadmaster',
      'em-1',
      'jademaster',
      'lapmaster-12',
      'lapmaster-18',
      'sawmaster-18',
      'sawmaster-24',
      'sawmaster-36',
      'shapemaster',
      'trimmaster',
      'tumblemaster',
    ], 'machinery_profile');
    let unavailablePickupSearch = null;
    if (UNAVAILABLE_PICKUP) {
      unavailablePickupSearch = await findUnavailablePickupCandidate(authPage);
      if (unavailablePickupSearch.line) products.unavailablePickup = unavailablePickupSearch.line;
    }
    const state = await authContext.storageState();
    state.cookies = state.cookies.filter((cookie) => !/^cart(?:_|$)/.test(cookie.name));
    await authContext.close();
    password = null;

    const results = [];
    const scenariosToRun = UNAVAILABLE_PICKUP
      ? (unavailablePickupSearch.line
        ? [{ id: 'unavailable_pickup_wisconsin', handles: ['unavailablePickup'], destination: 'wisconsin' }]
        : [])
      : (CONFIRM_BYPASS ? SCENARIOS.slice(0, 1) : SCENARIOS);
    for (const scenario of scenariosToRun) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, storageState: state });
      context.on('request', (request) => {
        if (request.method() !== 'POST') return;
        const pathname = new URL(request.url()).pathname;
        if (pathname === '/cart/add.js') operations.cartAddPosts += 1;
        if (pathname === '/apps/rhino-quote-draft') operations.quotationProxyPosts += 1;
        if (pathname === '/contact') operations.contactPosts += 1;
        if (/payments|complete|processing/.test(pathname)) operations.paymentOrCompletionPosts += 1;
      });
      const page = await context.newPage();
      await page.goto(ORIGIN, { waitUntil: 'domcontentloaded' });
      assert.notEqual(new URL(page.url()).pathname, '/password');
      const lines = scenario.handles.map((handle) => products[handle]);
      const cart = await seedFreshCart(page, lines);
      const rates = await ajaxRates(page, DESTINATIONS[scenario.destination]);
      const checkout = await checkoutState(page, DESTINATIONS[scenario.destination]);
      results.push({ id: scenario.id, destination: scenario.destination, cart, rates, checkout });
      await context.close();
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }

    let pickup = null;
    if (!CONFIRM_BYPASS && !UNAVAILABLE_PICKUP) {
      const pickupContext = await browser.newContext({ viewport: { width: 1440, height: 1000 }, storageState: state });
      const pickupPage = await pickupContext.newPage();
      await pickupPage.goto(ORIGIN, { waitUntil: 'domcontentloaded' });
      const eligible = await firstAvailableProduct(pickupPage, ['bonded-diamond-wheel-220'], 'accepted_pickup_candidate');
      const eligiblePickup = await pickupState(pickupPage, eligible);
      const machinePickup = await pickupState(pickupPage, products.beadmaster);
      pickup = {
        eligibleCandidate: { variantId: eligible.variantId, ...eligiblePickup },
        unavailableCandidate: { variantId: products.beadmaster.variantId, ...machinePickup },
      };
      await pickupContext.close();
    }

    assert.equal(operations.quotationProxyPosts, 0);
    assert.equal(operations.contactPosts, 0);
    assert.equal(operations.paymentOrCompletionPosts, 0);
    const evidence = {
      schemaVersion: 1,
      batch: 'K1D-04P-S',
      capturedAt: new Date().toISOString(),
      store: STORE,
      sessionPolicy: 'fresh cart cookie per checkout scenario; sequential execution; no retry after ambiguous mutation',
      scenarios: results,
      mode: UNAVAILABLE_PICKUP
        ? 'unavailable_pickup_checkout'
        : (CONFIRM_BYPASS ? 'single_case_delivery_context_confirmation' : 'representative_matrix'),
      selectedProducts: products,
      pickup,
      unavailablePickupSearch,
      unavailablePickupDisposition: UNAVAILABLE_PICKUP
        ? (unavailablePickupSearch.line ? 'TESTED' : 'NOT_APPLICABLE_CURRENT_STATE')
        : null,
      operations: {
        ...operations,
        paymentSubmitted: false,
        orderCompleted: false,
        draftOrderCreatedOrModified: false,
      },
      privacy: {
        customerValuesPersisted: false,
        credentialsPersisted: false,
        checkoutUrlsPersisted: false,
      },
    };
    const output = UNAVAILABLE_PICKUP
      ? UNAVAILABLE_PICKUP_OUTPUT
      : (CONFIRM_BYPASS ? CONFIRMATION_OUTPUT : OUTPUT);
    fs.writeFileSync(output, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(`K1D-04P-S checkout evidence written: ${path.relative(ROOT, output)}`);
    console.log(`Scenarios: ${results.length}; proxy/contact/payment posts: ${operations.quotationProxyPosts}/${operations.contactPosts}/${operations.paymentOrCompletionPosts}.`);
  } finally {
    password = null;
    await browser.close();
  }
}

main().catch((error) => {
  console.error(`K1D-04P-S checkout audit failed: ${error.stack || error.message}`);
  process.exitCode = 1;
});
