'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('@playwright/test');
const {
  accessToken,
  adminGraphql,
  appCredentials,
} = require('./run-epic-k-k1d02t-acceptance');

const ROOT = path.resolve(__dirname, '..');
const STORE = 'sz5dnk-nf.myshopify.com';
const STORE_ORIGIN = `https://${STORE}`;
const API_VERSION = '2026-10';
const PRODUCTION_THEME_ID = '158579622085';
const PREVIEW_THEME_ID = '158631198917';
const OUTPUT = path.join(ROOT, 'docs/qa/evidence/epic-k/k1d04p-release-readiness-2026-11-05/current-shopify-audit.json');
const K1D02 = require('../data/epic-k-k1d02-backend-readiness.json');
const K1D03A = require('../docs/qa/evidence/epic-k/k1d03a-storefront-2026-10-30/acceptance-success.json');
const PRODUCT_CLASSIFICATION = require('../data/epic-e-product-classification.json');
const TEST_ITEMS = [
  { id: 46484249903301, quantity: 1 },
  { id: 46484250001605, quantity: 2 },
];
const ADDRESSES = [
  { id: 'contiguous_us_wisconsin', country: 'US', province: 'WI', zip: '53024' },
  { id: 'contiguous_us_illinois', country: 'US', province: 'IL', zip: '60601' },
  { id: 'alaska', country: 'US', province: 'AK', zip: '99501' },
  { id: 'hawaii', country: 'US', province: 'HI', zip: '96813' },
  { id: 'international_canada', country: 'CA', province: 'ON', zip: 'M5V2T6' },
  { id: 'international_united_kingdom', country: 'GB', province: '', zip: 'SW1A1AA' },
];

const VARIANTS_QUERY = `query K1D04PVariants($first: Int!, $after: String) {
  productVariants(first: $first, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes {
      id title sku availableForSale price
      quantityRule { min increment max }
      inventoryItem { requiresShipping }
      product { id handle title status isGiftCard productType }
    }
  }
}`;
const IDENTITY_QUERY = `query K1D04PIdentity {
  shop {
    id myshopifyDomain currencyCode ianaTimezone
    plan { displayName partnerDevelopment shopifyPlus }
    features { marketDrivenShipping unifiedMarkets deliveryProfiles }
  }
  appInstallation { accessScopes { handle } }
}`;
const DRAFT_QUERY = `query K1D04PDraft($id: ID!) {
  draftOrder(id: $id) {
    id name status tags createdAt updatedAt invoiceSentAt completedAt reserveInventoryUntil
    shippingLine { id }
  }
}`;
const CONFIG_QUERIES = {
  deliveryProfiles: `query K1D04PProfiles { deliveryProfiles(first: 10) { nodes { id name default coversAllItems } } }`,
  markets: `query K1D04PMarkets { markets(first: 50) { nodes { id name status type delivery { shipping { isEnabled } } } } }`,
  locations: `query K1D04PLocations { locations(first: 50, includeInactive: true, includeLegacy: true) { nodes { id name isActive localPickupSettingsV2 { pickupTime } } } }`,
  discounts: `query K1D04PDiscounts { discountNodes(first: 10) { nodes { id } } }`,
  shopifyFunctions: `query K1D04PFunctions { shopifyFunctions(first: 50) { nodes { id title apiType apiVersion appKey handle } } }`,
};

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

async function adminContext(values) {
  const credentials = appCredentials(required(values, 'SHOPIFY_APP_PROJECT_DIR'));
  const token = await accessToken({
    shop: STORE,
    clientId: credentials.clientId,
    clientSecret: credentials.clientSecret,
  });
  credentials.clientSecret = null;
  return { shop: STORE, apiVersion: API_VERSION, token };
}

async function collectVariants(admin) {
  const nodes = [];
  let after = null;
  do {
    const data = await adminGraphql(admin, VARIANTS_QUERY, { first: 100, after });
    nodes.push(...data.productVariants.nodes);
    if (!data.productVariants.pageInfo.hasNextPage) break;
    after = data.productVariants.pageInfo.endCursor;
    assert.ok(after, 'Variant pagination cursor missing.');
  } while (nodes.length < 10000);
  const nonShipping = nodes
    .filter((node) => node.inventoryItem?.requiresShipping !== true && !node.product.isGiftCard)
    .map((node) => ({
      variantId: node.id.split('/').pop(),
      skuPresent: Boolean(node.sku),
      productHandle: node.product.handle,
      productStatus: node.product.status,
      productType: node.product.productType || '',
      availableForSale: node.availableForSale,
      classification: 'potential_physical_checkout_bypass_requires_product_owner_review',
    }));
  const classificationByHandle = new Map(PRODUCT_CLASSIFICATION.mappings.map((entry) => [
    entry.handle,
    entry.classDecisionState === 'approved' ? entry.proposedProductClass : null,
  ]));
  const currentEligible = nodes.filter((node) => node.product.status === 'ACTIVE'
    && node.availableForSale
    && node.inventoryItem?.requiresShipping === true);
  const pickClass = (productClass) => {
    const node = currentEligible.find((candidate) => classificationByHandle.get(candidate.product.handle) === productClass);
    assert.ok(node, `No currently available active ${productClass} Variant was found.`);
    return {
      id: Number(node.id.split('/').pop()),
      quantity: Math.max(1, node.quantityRule?.min || 1),
      handle: node.product.handle,
      productClass,
    };
  };
  const accessory = pickClass('accessory');
  const machine = pickClass('machine');
  const consumable = pickClass('consumable');
  const replacementPart = pickClass('replacement_part');
  const priced = [...currentEligible].sort((left, right) => Number(left.price) - Number(right.price));
  const lowValue = priced[0];
  const highValue = priced[priced.length - 1];
  const checkoutScenarios = [
    { id: 'accepted_two_variant_cart', items: TEST_ITEMS },
    { id: 'active_accessory_cart', items: [{ id: accessory.id, quantity: accessory.quantity }] },
    { id: 'active_machine_cart', items: [{ id: machine.id, quantity: machine.quantity }] },
    { id: 'active_consumable_cart', items: [{ id: consumable.id, quantity: consumable.quantity }] },
    { id: 'active_replacement_part_cart', items: [{ id: replacementPart.id, quantity: replacementPart.quantity }] },
    { id: 'mixed_machine_accessory_cart', items: [{ id: machine.id, quantity: machine.quantity }, { id: accessory.id, quantity: accessory.quantity }] },
    { id: 'low_value_cart', items: [{ id: Number(lowValue.id.split('/').pop()), quantity: Math.max(1, lowValue.quantityRule?.min || 1) }] },
    { id: 'high_value_cart', items: [{ id: Number(highValue.id.split('/').pop()), quantity: Math.max(1, highValue.quantityRule?.min || 1) }] },
  ];
  return {
    queryStatus: 'complete',
    variantCount: nodes.length,
    activeVariantCount: nodes.filter((node) => node.product.status === 'ACTIVE').length,
    requiresShippingTrueCount: nodes.filter((node) => node.inventoryItem?.requiresShipping === true).length,
    nonGiftCardRequiresShippingFalseCount: nonShipping.length,
    potentialBypassVariants: nonShipping,
    checkoutScenarioSelections: {
      accessory: { variantId: String(accessory.id), handle: accessory.handle, productClass: accessory.productClass },
      machine: { variantId: String(machine.id), handle: machine.handle, productClass: machine.productClass },
      consumable: { variantId: String(consumable.id), handle: consumable.handle, productClass: consumable.productClass },
      replacementPart: { variantId: String(replacementPart.id), handle: replacementPart.handle, productClass: replacementPart.productClass },
      lowValue: { variantId: lowValue.id.split('/').pop(), price: lowValue.price, handle: lowValue.product.handle },
      highValue: { variantId: highValue.id.split('/').pop(), price: highValue.price, handle: highValue.product.handle },
    },
    checkoutScenarios,
    testVariants: TEST_ITEMS.map((item) => {
      const node = nodes.find((candidate) => candidate.id.endsWith(`/${item.id}`));
      assert.ok(node, `Test Variant ${item.id} was not returned by current Admin data.`);
      return {
        variantId: String(item.id),
        quantity: item.quantity,
        handle: node.product.handle,
        active: node.product.status === 'ACTIVE',
        availableForSale: node.availableForSale,
        requiresShipping: node.inventoryItem?.requiresShipping === true,
      };
    }),
  };
}

async function readConfigAccess(admin) {
  const results = {};
  for (const [name, query] of Object.entries(CONFIG_QUERIES)) {
    try {
      const data = await adminGraphql(admin, query);
      const value = data[name];
      results[name] = {
        queryStatus: 'complete',
        recordCount: Array.isArray(value?.nodes) ? value.nodes.length : 0,
      };
    } catch {
      results[name] = {
        queryStatus: 'inaccessible_current_app_scope',
        recordCount: null,
      };
    }
  }
  return results;
}

function themeList() {
  const command = process.platform === 'win32' ? (process.env.ComSpec || 'cmd.exe') : 'shopify';
  const args = process.platform === 'win32'
    ? ['/d', '/s', '/c', `shopify theme list --store ${STORE} --json --no-color`]
    : ['theme', 'list', '--store', STORE, '--json', '--no-color'];
  const raw = execFileSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    windowsHide: true,
  });
  const themes = JSON.parse(raw);
  return themes.map((theme) => ({
    id: String(theme.id),
    name: theme.name,
    role: theme.role,
    processing: Boolean(theme.processing),
  }));
}

async function authenticate(page, password) {
  await page.goto(STORE_ORIGIN, { waitUntil: 'domcontentloaded' });
  if (new URL(page.url()).pathname !== '/password') return;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    if (attempt > 1) {
      await page.goto(STORE_ORIGIN, { waitUntil: 'domcontentloaded' });
      if (new URL(page.url()).pathname !== '/password') return;
    }
    const summary = page.locator('password-modal summary');
    const input = page.locator('form[action$="/password"] input[name="password"]');
    if (await summary.count() && !(await input.isVisible())) await summary.click();
    const form = page.locator('form[action$="/password"]');
    await input.fill(password);
    const [response] = await Promise.all([
      page.waitForResponse((entry) => entry.request().method() === 'POST'
        && new URL(entry.url()).pathname.endsWith('/password')),
      form.locator('button[name="commit"]').click(),
    ]);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);
    if (new URL(page.url()).pathname !== '/password') {
      const cookies = await page.context().cookies(STORE_ORIGIN);
      if (cookies.some((cookie) => cookie.name === 'storefront_digest')) return;
    }
    if (response.status() !== 429 || attempt === 3) break;
    const retryAfter = Number(response.headers()['retry-after']);
    await page.waitForTimeout(Number.isFinite(retryAfter) ? Math.min(retryAfter * 1000, 30000) : attempt * 10000);
  }
  assert.notEqual(new URL(page.url()).pathname, '/password', 'Storefront authentication was rejected or rate-limited.');
}

async function storefrontJson(page, requestPath, options = {}) {
  return page.evaluate(async ({ requestPath: target, options: init }) => {
    const response = await fetch(target, init);
    let body;
    try { body = await response.json(); } catch { body = null; }
    return { status: response.status, body, retryAfter: response.headers.get('retry-after') };
  }, { requestPath, options });
}

async function retryAfterRateLimit(page, operation, maxAttempts = 4) {
  let result;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    result = await operation();
    if (result.status !== 429) return result;
    const seconds = Number(result.retryAfter);
    await page.waitForTimeout(Number.isFinite(seconds) ? Math.min(seconds * 1000, 30000) : attempt * 5000);
  }
  return result;
}

async function seedCart(page, items, { clearFirst = true, scenarioId = 'unspecified' } = {}) {
  if (clearFirst) {
    const clear = await retryAfterRateLimit(page, () => storefrontJson(page, '/cart/clear.js', {
      method: 'POST', headers: { Accept: 'application/json' },
    }));
    assert.equal(clear.status, 200);
    await page.waitForTimeout(1500);
  } else {
    const initial = await retryAfterRateLimit(page, () => storefrontJson(page, '/cart.js', { headers: { Accept: 'application/json' } }));
    assert.equal(initial.status, 200);
    assert.equal(initial.body.item_count, 0, 'Fresh checkout scenario must start with an empty cart.');
  }
  let add;
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    add = await storefrontJson(page, '/cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (add.status !== 429) break;
    const current = await retryAfterRateLimit(page, () => storefrontJson(page, '/cart.js', { headers: { Accept: 'application/json' } }));
    const expectedQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    if (current.status === 200 && current.body.item_count === expectedQuantity
      && current.body.items.length === items.length) {
      add = { status: 200, body: current.body, recoveredAfterRateLimit: true };
      break;
    }
    assert.equal(current.body?.item_count || 0, 0, 'Rate-limited cart add had an unexpected partial outcome.');
    const seconds = Number(add.retryAfter);
    await page.waitForTimeout(Number.isFinite(seconds) ? Math.min(seconds * 1000, 30000) : attempt * 5000);
  }
  assert.equal(add.status, 200, `Cart add failed for ${scenarioId} with HTTP ${add.status}.`);
  await page.waitForTimeout(1500);
  const cart = await retryAfterRateLimit(page, () => storefrontJson(page, '/cart.js', { headers: { Accept: 'application/json' } }));
  assert.equal(cart.status, 200);
  assert.equal(cart.body.item_count, items.reduce((sum, item) => sum + item.quantity, 0));
  assert.equal(cart.body.items.length, items.length);
  return {
    lineCount: cart.body.items.length,
    totalQuantity: cart.body.item_count,
    discountsPresent: (cart.body.discount_codes || []).length > 0,
    sellingPlansPresent: cart.body.items.some((item) => Boolean(item.selling_plan_allocation)),
  };
}

function rateSummary(rate) {
  const price = Number(rate.price);
  return {
    name: rate.name,
    priceCents: Number.isFinite(price) ? Math.round(price * 100) : null,
    currency: rate.currency || 'USD',
    source: rate.source || null,
  };
}

async function shippingRates(page, address) {
  const params = new URLSearchParams({
    'shipping_address[country]': address.country,
    'shipping_address[province]': address.province,
    'shipping_address[zip]': address.zip,
  });
  const result = await retryAfterRateLimit(page, () => storefrontJson(page, `/cart/shipping_rates.json?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  }));
  return {
    destination: address.id,
    httpStatus: result.status,
    rates: Array.isArray(result.body?.shipping_rates) ? result.body.shipping_rates.map(rateSummary) : [],
    available: Array.isArray(result.body?.shipping_rates) && result.body.shipping_rates.length > 0,
  };
}

async function pickupEvidence(page, testVariants) {
  const results = [];
  for (const variant of testVariants) {
    const response = await page.goto(`${STORE_ORIGIN}/variants/${variant.variantId}/?section_id=pickup-availability`, {
      waitUntil: 'domcontentloaded',
    });
    const body = await page.locator('body').innerText();
    results.push({
      variantId: variant.variantId,
      httpStatus: response?.status() || 0,
      graftonMentioned: /Grafton|1411 6th Ave/i.test(body),
      pickupAvailableTextPresent: /pickup available|ready for pickup|usually ready/i.test(body),
    });
  }
  return results;
}

async function storefrontAudit(values, variantAudit) {
  const browser = await chromium.launch({ headless: true });
  const observed = { proxyPosts: 0, contactPosts: 0, paymentOrCompletionPosts: 0 };
  let password = required(values, 'STOREFRONT_PASSWORD');
  try {
    const watch = (page) => page.on('request', (request) => {
      const url = new URL(request.url());
      if (request.method() !== 'POST') return;
      if (url.pathname === '/apps/rhino-quote-draft') observed.proxyPosts += 1;
      if (url.pathname === '/contact') observed.contactPosts += 1;
      if (/payments|complete|processing/.test(url.pathname)) observed.paymentOrCompletionPosts += 1;
    });
    const authContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const authPage = await authContext.newPage();
    watch(authPage);
    await authenticate(authPage, password);
    const authenticatedState = await authContext.storageState();
    authenticatedState.cookies = authenticatedState.cookies.filter((cookie) => !/^cart(?:_|$)/.test(cookie.name));
    await authContext.close();
    password = null;
    const scenarios = [];
    for (const scenario of variantAudit.checkoutScenarios) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, storageState: authenticatedState });
      const page = await context.newPage();
      watch(page);
      await page.goto(STORE_ORIGIN, { waitUntil: 'domcontentloaded' });
      assert.notEqual(new URL(page.url()).pathname, '/password', 'Authenticated storefront state was not reusable.');
      const cart = await seedCart(page, scenario.items, { clearFirst: false, scenarioId: scenario.id });
      const rates = [];
      for (const address of ADDRESSES) {
        await page.waitForTimeout(750);
        rates.push(await shippingRates(page, address));
      }
      const checkoutPage = await context.newPage();
      await checkoutPage.goto(`${STORE_ORIGIN}/checkout`, { waitUntil: 'domcontentloaded' });
      const checkoutUrl = new URL(checkoutPage.url());
      scenarios.push({
        id: scenario.id,
        selectedVariantIds: scenario.items.map((item) => String(item.id)),
        cart,
        rates,
        directCheckout: {
          reachedShopifyCheckout: checkoutUrl.hostname.endsWith('shopify.com')
            && (checkoutUrl.pathname.includes('/checkouts/') || /checkout/i.test(await checkoutPage.title())),
          authenticatedUrlPersisted: false,
          paymentSubmitted: false,
          orderCompleted: false,
        },
      });
      await checkoutPage.close();
      await context.close();
    }

    const acceptedScenario = variantAudit.checkoutScenarios[0];
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, storageState: authenticatedState });
    const page = await context.newPage();
    watch(page);
    await page.goto(STORE_ORIGIN, { waitUntil: 'domcontentloaded' });
    const cart = await seedCart(page, acceptedScenario.items, { clearFirst: false, scenarioId: 'accepted_ui_controls' });
    const pickup = await pickupEvidence(page, variantAudit.testVariants);
    await page.goto(`${STORE_ORIGIN}/products/${variantAudit.testVariants[0].handle}?variant=${variantAudit.testVariants[0].variantId}`, {
      waitUntil: 'networkidle',
    });
    const product = await page.evaluate(() => ({
      nativeAddToCartPresent: Boolean(document.querySelector('main [name="add"]')),
      acceleratedCheckoutCount: document.querySelectorAll('main .shopify-payment-button, main shopify-accelerated-checkout').length,
      cartDrawerCheckoutCount: document.querySelectorAll('cart-drawer [name="checkout"], cart-drawer a[href*="/checkout"]').length,
      cartDrawerReviewCartLinkCount: [...document.querySelectorAll('cart-drawer a')]
        .filter((link) => new URL(link.href).pathname === '/cart').length,
    }));

    await page.goto(`${STORE_ORIGIN}/cart`, { waitUntil: 'networkidle' });
    const cartPage = await page.evaluate(() => ({
      quoteComponentCount: document.querySelectorAll('rhino-quote-mode').length,
      enabledNativeCheckoutCount: [...document.querySelectorAll('[name="checkout"]')]
        .filter((button) => !button.disabled).length,
      acceleratedCheckoutCount: document.querySelectorAll('.cart__dynamic-checkout-buttons, shopify-accelerated-checkout-cart').length,
      draftAutomationEnabledCount: document.querySelectorAll('rhino-quote-mode[data-automation-enabled="true"]').length,
    }));

    await context.close();
    return {
      scenarios,
      cart,
      rates: scenarios.find((scenario) => scenario.id === 'accepted_two_variant_cart').rates,
      pickup,
      product,
      cartPage,
      directCheckout: scenarios.find((scenario) => scenario.id === 'accepted_two_variant_cart').directCheckout,
      observed,
    };
  } finally {
    password = null;
    await browser.close();
  }
}

async function draftSafety(admin, id, expectedName) {
  const data = await adminGraphql(admin, DRAFT_QUERY, { id });
  const draft = data.draftOrder;
  assert.equal(draft.name, expectedName);
  return {
    name: draft.name,
    status: draft.status,
    unquotedTagPresent: draft.tags.includes('Unquoted'),
    modifiedSinceCreation: draft.updatedAt !== draft.createdAt,
    shippingLineAbsent: draft.shippingLine === null,
    invoiceAbsent: draft.invoiceSentAt === null,
    completionAbsent: draft.completedAt === null,
    reservationAbsent: draft.reserveInventoryUntil === null,
  };
}

async function main() {
  const values = runtime();
  const admin = await adminContext(values);
  try {
    const identity = await adminGraphql(admin, IDENTITY_QUERY);
    assert.equal(identity.shop.myshopifyDomain, STORE);
    const variants = await collectVariants(admin);
    const configuration = await readConfigAccess(admin);
    const themes = themeList();
    assert.equal(themes.find((theme) => theme.id === PRODUCTION_THEME_ID)?.role, 'live');
    assert.equal(themes.find((theme) => theme.id === PREVIEW_THEME_ID)?.role, 'unpublished');
    const storefront = await storefrontAudit(values, variants);
    const drafts = [
      await draftSafety(admin, K1D02.evidence.acceptedDraftId, '#D2'),
      await draftSafety(admin, K1D03A.admin.draft.id, '#D3'),
    ];
    const audit = {
      schemaVersion: 1,
      batch: 'K1D-04P',
      collectedAt: new Date().toISOString(),
      store: {
        canonicalDomain: identity.shop.myshopifyDomain,
        identityVerified: true,
        currency: identity.shop.currencyCode,
        timezone: identity.shop.ianaTimezone,
        plan: identity.shop.plan.displayName,
        shopifyPlus: identity.shop.plan.shopifyPlus,
        features: identity.shop.features,
      },
      authorization: {
        readOnlyAuditAuthorized: true,
        productionThemeMutationAuthorized: false,
        shippingConfigurationMutationAuthorized: false,
        draftOrderMutationAuthorized: false,
      },
      app: {
        scopes: identity.appInstallation.accessScopes.map((scope) => scope.handle).sort(),
        scopeChanged: false,
      },
      themes,
      variants,
      configuration,
      configurationModel: {
        status: 'identified_current_shop_feature',
        authoritativeMerchantSurface: identity.shop.features.marketDrivenShipping
          ? 'markets_shipping_options'
          : 'legacy_delivery_profiles',
        marketDrivenShipping: identity.shop.features.marketDrivenShipping,
        unifiedMarkets: identity.shop.features.unifiedMarkets,
        deliveryProfilesFeature: identity.shop.features.deliveryProfiles,
        mixedSurfaceRequired: identity.shop.features.marketDrivenShipping,
        note: identity.shop.features.marketDrivenShipping
          ? 'Markets are authoritative for merchant-owned options; app-owned delivery profiles must also be audited.'
          : 'Delivery profiles are authoritative for merchant-owned rates; Markets remain relevant for sell-to country coverage.',
      },
      storefront,
      acceptedDrafts: drafts,
      conclusions: {
        obsoleteEightDollarRateExposed: storefront.scenarios.some((scenario) => scenario.rates
          .some((entry) => entry.rates.some((rate) => rate.priceCents === 800))),
        obsoleteFifteenDollarRateExposed: storefront.scenarios.some((scenario) => scenario.rates
          .some((entry) => entry.rates.some((rate) => rate.priceCents === 1500))),
        internationalRateExposed: storefront.scenarios.some((scenario) => scenario.rates
          .find((entry) => entry.destination === 'international_canada')?.available),
        directCheckoutBypassExists: storefront.scenarios.some((scenario) => scenario.directCheckout.reachedShopifyCheckout),
        serverSideValidationFunctionObserved: configuration.shopifyFunctions.queryStatus === 'complete'
          && configuration.shopifyFunctions.recordCount > 0,
        currentAdminConfigurationFullyAudited: ['deliveryProfiles', 'markets', 'locations', 'discounts', 'shopifyFunctions']
          .every((name) => configuration[name].queryStatus === 'complete'),
      },
      safety: {
        adminGraphqlMutations: 0,
        productionThemeWrites: 0,
        shippingConfigurationWrites: 0,
        draftOrdersCreatedOrModified: 0,
        proxyPosts: storefront.observed.proxyPosts,
        contactPosts: storefront.observed.contactPosts,
        paymentOrCompletionPosts: storefront.observed.paymentOrCompletionPosts,
        invoicesSent: 0,
        paymentsCollected: 0,
        ordersCompleted: 0,
        customerValuesPersisted: false,
        credentialsPersisted: false,
        authenticatedUrlsPersisted: false,
      },
    };
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, `${JSON.stringify(audit, null, 2)}\n`);
    console.log(`K1D-04P read-only audit written: ${path.relative(ROOT, OUTPUT)}`);
    console.log(`Direct checkout reachable: ${audit.conclusions.directCheckoutBypassExists}; $8 rate: ${audit.conclusions.obsoleteEightDollarRateExposed}; $15 rate: ${audit.conclusions.obsoleteFifteenDollarRateExposed}.`);
  } finally {
    admin.token = null;
  }
}

main().catch((error) => {
  console.error(`K1D-04P audit failed: ${error.stack || error.message}`);
  process.exitCode = 1;
});
