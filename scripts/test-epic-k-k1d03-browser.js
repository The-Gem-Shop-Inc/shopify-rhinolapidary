'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const fixtures = require('./lib/epic-j-cart-fixtures');

const OUTPUT_DIR = process.env.EPIC_K_K1D03_EVIDENCE_DIR
  || 'docs/qa/evidence/epic-k/k1d03-storefront-2026-10-30/mocked';
const VIEWPORTS = [
  { label: '1440-desktop', width: 1440, height: 1000 },
  { label: '1024-desktop-tablet', width: 1024, height: 900 },
  { label: '768-tablet', width: 768, height: 900 },
  { label: '390-mobile', width: 390, height: 844 },
  { label: '320-mobile', width: 320, height: 800 },
  { label: '1440-at-200-percent-equivalent', width: 720, height: 900 },
];

function ajaxCart(overrides = {}) {
  return {
    token: 'fixture-token-secret-material-never-forwarded',
    note: 'Fixture cart note',
    currency: 'USD',
    discount_codes: [{ code: 'SAVE10', applicable: true }],
    cart_level_discount_applications: [],
    items: [
      { variant_id: 44812144910533, quantity: 2, properties: { Finish: 'Polished', _internal: 'omit' }, line_level_discount_allocations: [] },
      { variant_id: 44812144910533, quantity: 1, properties: { Finish: 'Matte' }, line_level_discount_allocations: [] },
    ],
    ...overrides,
  };
}

async function mount(page, { carts = [ajaxCart()], proxy } = {}) {
  const state = { cartReads: 0, proxyRequests: [], contactRequests: 0 };
  const html = fixtures.documentFor({ mixed: true, automation: true });
  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname !== 'localhost') return route.abort();
    if (url.pathname.startsWith('/assets/') && fs.existsSync(`.${url.pathname}`)) {
      return route.fulfill({
        body: fs.readFileSync(`.${url.pathname}`),
        contentType: url.pathname.endsWith('.js') ? 'application/javascript' : 'text/css',
      });
    }
    if (url.pathname === '/cart.js') {
      const cart = carts[Math.min(state.cartReads, carts.length - 1)];
      state.cartReads += 1;
      return route.fulfill({ json: cart });
    }
    if (url.pathname === '/apps/rhino-quote-draft') {
      const body = JSON.parse(request.postData() || '{}');
      state.proxyRequests.push(body);
      if (proxy) return proxy(route, body, state);
      return route.fulfill({ status: 503, json: { ok: false, code: 'SUBMISSION_FAILED' } });
    }
    if (url.pathname === '/contact') {
      state.contactRequests += 1;
      return route.fulfill({ contentType: 'text/html', body: html });
    }
    if (url.pathname.includes('/variants/') && url.searchParams.get('section_id') === 'pickup-availability') {
      return route.fulfill({ contentType: 'text/html', body: '<div class="pickup-availability-preview"></div>' });
    }
    return route.fulfill({ contentType: 'text/html', body: html });
  });
  await page.goto('http://localhost/cart');
  await page.locator('rhino-quote-mode').waitFor();
  await page.waitForFunction(() => Boolean(document.querySelector('rhino-quote-mode').cartBaseline));
  return state;
}

async function fillQuote(page, suffix = '') {
  await page.locator('#RhinoFulfillmentShipping').check();
  await page.locator('#RhinoQuoteFirstName').fill('Synthetic');
  await page.locator('#RhinoQuoteLastName').fill(`Customer${suffix}`);
  await page.locator('#RhinoQuoteEmail').fill(`fixture${suffix.replace(/\W/g, '')}@example.invalid`);
  await page.locator('#RhinoQuotePhone').fill('262-555-0100');
  await page.locator('#RhinoQuoteCompany').fill('Fixture Company');
  await page.locator('#RhinoQuoteAddress1').fill('100 Fixture Street');
  await page.locator('#RhinoQuoteAddress2').fill('Dock 2');
  await page.locator('#RhinoQuoteCity').fill('Grafton');
  await page.locator('#RhinoQuoteState').selectOption('WI');
  await page.locator('#RhinoQuotePostalCode').fill('53024');
  await page.locator('input[name="contact[delivery_type]"][value="Commercial"]').check();
  await page.locator('input[name="contact[liftgate_required]"][value="Yes"]').check();
  await page.locator('#RhinoQuoteAccess').fill('Call at the gate.');
  await page.locator('input[name="contact[insurance_options_requested]"]').check();
}

const results = [];
async function test(name, run) {
  await run();
  results.push(name);
  console.log(`PASS ${name}`);
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    await test('confirmed Draft Order response maps the complete live cart and never posts email', async () => {
      const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
      const state = await mount(page, {
        proxy: (route, body) => route.fulfill({
          json: {
            ok: true,
            storedInShopifyAdmin: true,
            status: 'draft_created',
            reference: body.quoteReference,
            staffIdentifier: '#D9001',
            duplicate: false,
          },
        }),
      });
      await fillQuote(page);
      await page.locator('[data-rhino-draft-submit]').click();
      try {
        await page.locator('[data-rhino-draft-confirmation]').waitFor({ state: 'visible', timeout: 5000 });
      } catch (error) {
        const diagnostic = await page.locator('rhino-quote-mode').evaluate((element) => ({
          state: element.submissionState,
          status: element.querySelector('[data-rhino-quote-status]')?.textContent,
          active: localStorage.getItem('rhino-quote:k1d03:active'),
        }));
        throw new Error(`${error.message}\n${JSON.stringify({ diagnostic, proxyRequests: state.proxyRequests })}`);
      }
      assert.equal(state.proxyRequests.length, 1);
      assert.equal(state.contactRequests, 0);
      const payload = state.proxyRequests[0];
      assert.equal(payload.items.length, 2);
      assert.deepEqual(payload.items.map((item) => item.quantity), [2, 1]);
      assert.deepEqual(payload.items.map((item) => item.properties.Finish), ['Polished', 'Matte']);
      assert.equal(payload.customer.firstName, 'Synthetic');
      assert.equal(payload.customer.lastName, 'Customer');
      assert.equal(payload.delivery.liftgateRequired, true);
      assert.equal(payload.delivery.insuranceRequested, true);
      assert.deepEqual(payload.discountCodes, ['SAVE10']);
      assert.equal(payload.cartNote, 'Fixture cart note');
      assert.doesNotMatch(payload.cartToken, /fixture-token|secret|material/);
      assert.equal(Object.hasOwn(payload, 'price'), false);
      assert.equal(await page.locator('[data-rhino-confirmed-draft]').innerText(), '#D9001');
      assert.match(await page.locator('[data-rhino-draft-confirmation]').innerText(), /before any payment is requested/i);
      await page.close();
    });

    await test('cart changed during form completion stops before the app proxy', async () => {
      const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      const state = await mount(page, { carts: [ajaxCart(), ajaxCart({ note: 'Changed after render' })] });
      await fillQuote(page, ' Changed');
      await page.locator('[data-rhino-draft-submit]').click();
      await page.locator('[data-rhino-quote-status][role="alert"]').waitFor();
      assert.equal(state.proxyRequests.length, 0);
      assert.match(await page.locator('[data-rhino-quote-status]').innerText(), /cart changed/i);
      assert.equal(await page.locator('#RhinoQuoteLastName').inputValue(), 'Customer Changed');
      await page.close();
    });

    await test('uncertain backend result locks the reference and prevents a second draft or email', async () => {
      const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      const state = await mount(page);
      await fillQuote(page, ' Uncertain');
      await page.locator('[data-rhino-draft-submit]').click();
      await page.locator('[data-rhino-quote-status][role="alert"]').waitFor();
      assert.equal(state.proxyRequests.length, 1);
      const reference = state.proxyRequests[0].quoteReference;
      assert.equal(await page.locator('[data-rhino-draft-submit]').isDisabled(), true);
      assert.equal(await page.locator('[data-rhino-email-submit]').isDisabled(), true);
      await page.locator('rhino-quote-mode').evaluate((element) => element.submitDraftOrder());
      assert.equal(state.proxyRequests.length, 1);
      await page.reload();
      await page.locator('rhino-quote-mode').waitFor();
      assert.equal(await page.locator('[data-rhino-email-submit]').isDisabled(), true);
      assert.match(await page.locator('[data-rhino-reference-display]').innerText(), new RegExp(reference));
      assert.equal(state.proxyRequests.length, 1);
      await page.close();
    });

    await test('duplicate recovery confirms the same reference and staff identifier', async () => {
      const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      const state = await mount(page, {
        proxy: (route, body) => route.fulfill({ json: {
          ok: true, storedInShopifyAdmin: true, reference: body.quoteReference, staffIdentifier: '#D9002', duplicate: true,
        } }),
      });
      await fillQuote(page, ' Duplicate');
      await page.locator('[data-rhino-draft-submit]').click();
      await page.locator('[data-rhino-draft-confirmation]').waitFor({ state: 'visible' });
      assert.equal(state.proxyRequests.length, 1);
      assert.equal(await page.locator('[data-rhino-draft-confirmation]').getAttribute('data-duplicate'), 'true');
      assert.equal(await page.locator('[data-rhino-confirmed-draft]').innerText(), '#D9002');
      await page.close();
    });

    await test('selling plan fails closed to the deliberate native email alternative', async () => {
      const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      const sellingPlanCart = ajaxCart({ items: [{
        variant_id: 44812144910533, quantity: 1, properties: {}, selling_plan: 77, line_level_discount_allocations: [],
      }] });
      const state = await mount(page, { carts: [sellingPlanCart] });
      await fillQuote(page, ' Plan');
      await page.locator('[data-rhino-draft-submit]').click();
      await page.locator('[data-rhino-quote-status][role="alert"]').waitFor();
      assert.equal(state.proxyRequests.length, 0);
      assert.match(await page.locator('[data-rhino-quote-status]').innerText(), /cannot be represented faithfully/i);
      assert.equal(await page.locator('[data-rhino-email-submit]').isEnabled(), true);
      await page.close();
    });

    await test('manual email fallback identifies itself and does not call the Draft Order endpoint', async () => {
      const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      const state = await mount(page);
      await fillQuote(page, ' Email');
      await page.evaluate(() => {
        const form = document.querySelector('#RhinoShippingQuoteForm');
        form.addEventListener('submit', (event) => {
          event.preventDefault();
          window.manualFallback = Object.fromEntries(new FormData(form));
        });
      });
      await page.locator('[data-rhino-email-submit]').click();
      const fallback = await page.evaluate(() => window.manualFallback);
      assert.equal(state.proxyRequests.length, 0);
      assert.equal(fallback['contact[submission_path]'], 'Email fallback - not stored as a Shopify Draft Order');
      assert.equal(fallback['contact[name]'], 'Synthetic Customer Email');
      assert.match(fallback['contact[quotation_reference]'], /^KQ-/);
      assert.match(fallback['contact[body]'], new RegExp(fallback['contact[quotation_reference]']));
      await page.close();
    });

    await test('pickup remains native checkout and never calls the quotation proxy', async () => {
      const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      const state = await mount(page);
      await page.locator('#RhinoFulfillmentPickup').check();
      await page.waitForTimeout(50);
      assert.equal(state.proxyRequests.length, 0);
      assert.equal(await page.locator('[data-rhino-pickup-checkout]').getAttribute('form'), 'cart');
      assert.equal(await page.locator('.additional-checkout-buttons').count(), 0);
      await page.close();
    });

    for (const viewport of VIEWPORTS) {
      await test(`${viewport.label} automated and fallback controls retain accessible geometry`, async () => {
        const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
        await mount(page);
        await page.locator('#RhinoFulfillmentShipping').check();
        const metrics = await page.evaluate(() => {
          const panel = document.querySelector('#RhinoShippingQuotePanel').getBoundingClientRect();
          const controls = [...document.querySelectorAll('#RhinoShippingQuotePanel input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), #RhinoShippingQuotePanel select, #RhinoShippingQuotePanel textarea:not([hidden]), #RhinoShippingQuotePanel button')]
            .filter((element) => getComputedStyle(element).display !== 'none')
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return { width: rect.width, left: rect.left, right: rect.right };
            });
          return {
            viewport: document.documentElement.clientWidth,
            content: document.documentElement.scrollWidth,
            panelWidth: panel.width,
            controls,
            labels: [...document.querySelectorAll('#RhinoShippingQuotePanel label[for]')].every((label) => label.htmlFor && label.textContent.trim()),
            choiceInputs: [...document.querySelectorAll('#RhinoShippingQuotePanel input[type="radio"], #RhinoShippingQuotePanel input[type="checkbox"]')].every((input) => {
              const rect = input.getBoundingClientRect();
              return rect.width >= 20 && rect.height >= 20;
            }),
            positiveTabindex: document.querySelectorAll('#RhinoShippingQuotePanel [tabindex]:not([tabindex="0"]):not([tabindex="-1"])').length,
          };
        });
        assert(metrics.content <= metrics.viewport + 1);
        assert(metrics.panelWidth >= Math.min(280, viewport.width - 30));
        assert(metrics.controls.length >= 13);
        assert(metrics.controls.every((control) => control.width >= Math.min(200, viewport.width - 80)));
        assert(metrics.controls.every((control) => control.left >= -1 && control.right <= metrics.viewport + 1));
        assert.equal(metrics.labels, true);
        assert.equal(metrics.choiceInputs, true);
        assert.equal(metrics.positiveTabindex, 0);
        await page.screenshot({ path: path.join(OUTPUT_DIR, `shipping-${viewport.label}.png`), fullPage: true });
        await page.close();
      });
    }
  } finally {
    await browser.close();
  }

  console.log(`Epic K1D-03 mocked browser tests passed: ${results.length}/${results.length}.`);
  console.log(`Mocked browser screenshots: ${OUTPUT_DIR}`);
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
