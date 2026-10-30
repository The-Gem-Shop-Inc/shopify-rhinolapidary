'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');

const STORE_ORIGIN = 'https://sz5dnk-nf.myshopify.com';
const PREVIEW_THEME_ID = '158631198917';
const OUTPUT_DIR = 'docs/qa/evidence/epic-k/k1d03-storefront-2026-10-30/preview-mocked';
const VIEWPORTS = [
  { label: '1440-desktop', width: 1440, height: 1000 },
  { label: '1024-desktop-tablet', width: 1024, height: 900 },
  { label: '768-tablet', width: 768, height: 900 },
  { label: '390-mobile', width: 390, height: 844 },
  { label: '320-mobile', width: 320, height: 800 },
  { label: '1440-at-200-percent-equivalent', width: 720, height: 900 },
];
const ITEMS = [
  { id: 46484249903301, quantity: 1, properties: { 'K1D-03 preview': 'Polished fixture' } },
  { id: 46484250001605, quantity: 2, properties: { 'K1D-03 preview': 'Distinct fixture' } },
];

function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

async function retry429(label, operation) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await operation();
    if (response?.status() !== 429) return response;
    if (attempt === 3) break;
    const retryAfter = Number(response.headers()['retry-after']);
    await delay(Number.isFinite(retryAfter) ? retryAfter * 1000 : Math.min(60000, 10000 * (2 ** attempt)));
  }
  throw new Error(`${label} remained rate limited.`);
}

function storefrontPassword() {
  const password = require('dotenv').parse(fs.readFileSync('.env')).STOREFRONT_PASSWORD;
  assert.ok(password, 'STOREFRONT_PASSWORD is required for preview-only verification.');
  return password;
}

async function authenticate(context) {
  const page = await context.newPage();
  let password;
  try {
    await retry429('Storefront', () => page.goto(STORE_ORIGIN, { waitUntil: 'load' }));
    if (new URL(page.url()).pathname !== '/password') return;
    password = storefrontPassword();
    await page.locator('password-modal summary').click();
    const input = page.locator('form[action$="/password"] input[name="password"]');
    await input.waitFor({ state: 'visible' });
    await input.fill(password);
    const [response] = await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }),
      page.locator('form[action$="/password"] button[name="commit"]').click(),
    ]);
    assert.ok(response?.ok(), `Storefront authentication failed with HTTP ${response?.status()}.`);
  } finally {
    password = null;
    await page.close();
  }
}

function publicProperties(value) {
  return Object.fromEntries(Object.entries(value || {}).filter(([key, entry]) => key && !key.startsWith('_') && String(entry).trim()));
}

function hasForbiddenFinancialField(value) {
  if (!value || typeof value !== 'object') return false;
  if (Array.isArray(value)) return value.some(hasForbiddenFinancialField);
  const forbidden = new Set(['price', 'unitPrice', 'linePrice', 'originalPrice', 'subtotal', 'total', 'shippingCharge', 'shippingLine', 'appliedDiscount', 'priceOverride']);
  return Object.entries(value).some(([key, entry]) => forbidden.has(key) || hasForbiddenFinancialField(entry));
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  let realProxyRequests = 0;
  let contactRequests = 0;
  let mockedProxyRequests = 0;
  let submittedPayload;
  try {
    await authenticate(context);
    const page = await context.newPage();
    await page.route('**/apps/rhino-quote-draft**', async (route) => {
      mockedProxyRequests += 1;
      submittedPayload = JSON.parse(route.request().postData() || '{}');
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          storedInShopifyAdmin: true,
          status: 'draft_created',
          reference: submittedPayload.quoteReference,
          staffIdentifier: '#D999999',
          duplicate: false,
        }),
      });
    });
    page.on('request', (request) => {
      const pathname = new URL(request.url()).pathname;
      if (pathname === '/apps/rhino-quote-draft' && !request.isNavigationRequest()) realProxyRequests += 1;
      if (pathname === '/contact' && request.method() === 'POST') contactRequests += 1;
    });

    const preview = await retry429('Preview selection', () => page.goto(
      `${STORE_ORIGIN}/?preview_theme_id=${PREVIEW_THEME_ID}`,
      { waitUntil: 'load' },
    ));
    assert.ok(preview?.ok(), `Preview selection failed with HTTP ${preview?.status()}.`);

    const seed = await page.evaluate(async (items) => {
      const clear = await fetch(`${window.Shopify?.routes?.root || '/'}cart/clear.js`, { method: 'POST', headers: { Accept: 'application/json' } });
      if (!clear.ok) return { ok: false, stage: 'clear', status: clear.status };
      const add = await fetch(`${window.Shopify?.routes?.root || '/'}cart/add.js`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      return { ok: add.ok, stage: 'add', status: add.status };
    }, ITEMS);
    assert.deepEqual(seed, { ok: true, stage: 'add', status: 200 });

    const cartResponse = await retry429('Preview cart', () => page.goto(
      `${STORE_ORIGIN}/cart?preview_theme_id=${PREVIEW_THEME_ID}`,
      { waitUntil: 'networkidle' },
    ));
    assert.ok(cartResponse?.ok(), `Preview cart failed with HTTP ${cartResponse?.status()}.`);
    await page.locator('rhino-quote-mode[data-automation-enabled="true"]').waitFor({ timeout: 15000 });
    await page.waitForFunction(() => Boolean(document.querySelector('rhino-quote-mode')?.cartBaseline));

    const actualCart = await page.evaluate(async () => {
      const response = await fetch(`${window.Shopify?.routes?.root || '/'}cart.js`, { headers: { Accept: 'application/json' }, cache: 'no-store' });
      return response.json();
    });
    assert.equal(actualCart.items.length, 2);

    await page.locator('#RhinoFulfillmentShipping').check();
    await page.locator('#RhinoQuoteFirstName').fill('Synthetic');
    await page.locator('#RhinoQuoteLastName').fill('Preview');
    await page.locator('#RhinoQuoteEmail').fill('k1d03-preview@example.invalid');
    await page.locator('#RhinoQuotePhone').fill('262-555-0100');
    await page.locator('#RhinoQuoteCompany').fill('Rhino QA');
    await page.locator('#RhinoQuoteAddress1').fill('100 Fixture Street');
    await page.locator('#RhinoQuoteAddress2').fill('Dock 2');
    await page.locator('#RhinoQuoteCity').fill('Grafton');
    await page.locator('#RhinoQuoteState').selectOption('WI');
    await page.locator('#RhinoQuotePostalCode').fill('53024');
    await page.locator('input[name="contact[delivery_type]"][value="Commercial"]').check();
    await page.locator('input[name="contact[liftgate_required]"][value="No"]').check();
    await page.locator('#RhinoQuoteAccess').fill('Mocked preview acceptance; no live Draft Order.');

    const geometry = [];
    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      const measured = await page.evaluate(() => {
        const panel = document.querySelector('#RhinoShippingQuotePanel').getBoundingClientRect();
        const buttons = [...document.querySelectorAll('[data-rhino-draft-submit], [data-rhino-email-submit]')].map((button) => {
          const rect = button.getBoundingClientRect();
          return { width: rect.width, left: rect.left, right: rect.right };
        });
        return {
          viewport: document.documentElement.clientWidth,
          content: document.documentElement.scrollWidth,
          panelWidth: panel.width,
          buttons,
        };
      });
      assert(measured.content <= measured.viewport + 1);
      assert(measured.panelWidth >= Math.min(280, viewport.width - 30));
      assert.equal(measured.buttons.length, 2);
      assert(measured.buttons.every((button) => button.width >= Math.min(200, viewport.width - 80)));
      geometry.push({ ...viewport, ...measured });
      await page.screenshot({ path: path.join(OUTPUT_DIR, `shipping-${viewport.label}.png`), fullPage: true });
    }

    await page.locator('[data-rhino-draft-submit]').click();
    await page.locator('[data-rhino-draft-confirmation]').waitFor({ state: 'visible' });
    assert.equal(mockedProxyRequests, 1);
    assert.equal(realProxyRequests, 1, 'Exactly one browser request should be observed and intercepted before Shopify forwarding.');
    assert.equal(contactRequests, 0);
    assert.equal(hasForbiddenFinancialField(submittedPayload), false);
    assert.equal(submittedPayload.items.length, actualCart.items.length);
    assert.deepEqual(
      submittedPayload.items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        properties: item.properties,
      })),
      actualCart.items.map((item) => ({
        variantId: `gid://shopify/ProductVariant/${item.variant_id}`,
        quantity: item.quantity,
        properties: publicProperties(item.properties),
      })),
    );
    assert.equal(submittedPayload.cartNote, String(actualCart.note || ''));
    assert.doesNotMatch(submittedPayload.cartToken, new RegExp(String(actualCart.token).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.equal(await page.locator('[data-rhino-confirmed-draft]').innerText(), '#D999999');

    await page.evaluate(async () => {
      await fetch(`${window.Shopify?.routes?.root || '/'}cart/clear.js`, { method: 'POST', headers: { Accept: 'application/json' } });
    });

    const summary = {
      schemaVersion: 1,
      completedAt: new Date().toISOString(),
      themeId: PREVIEW_THEME_ID,
      previewPublished: false,
      automationEnabled: true,
      proxyMode: 'PLAYWRIGHT_INTERCEPTED_MOCK',
      liveDraftOrdersCreated: 0,
      liveContactRequestsSubmitted: contactRequests,
      mockedProxyRequests,
      actualAjaxCartCompared: true,
      lineCount: submittedPayload.items.length,
      staffIdentifier: '#D999999-MOCK',
      geometry,
      screenshots: VIEWPORTS.map(({ label }) => `shipping-${label}.png`),
      payloadSha256: crypto.createHash('sha256').update(JSON.stringify(submittedPayload)).digest('hex'),
      customerDataPersisted: false,
    };
    fs.writeFileSync(path.join(OUTPUT_DIR, 'verification-summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
    console.log(`Epic K1D-03 preview mocked verification passed: ${VIEWPORTS.length}/${VIEWPORTS.length} viewports.`);
    console.log(`Preview theme ${PREVIEW_THEME_ID}; live Draft Orders created: 0; contact submissions: ${contactRequests}.`);
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
