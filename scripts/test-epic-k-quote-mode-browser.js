'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const fixtures = require('./lib/epic-j-cart-fixtures');

const OUTPUT_DIR = process.env.EPIC_K_LAYOUT_EVIDENCE_DIR
  || 'docs/qa/evidence/epic-k/k1c02-layout-repair-2026-10-28/offline';
const VIEWPORTS = [
  { label: '1440-desktop', width: 1440, height: 1000 },
  { label: '1024-desktop-tablet', width: 1024, height: 900 },
  { label: '768-tablet', width: 768, height: 900 },
  { label: '390-mobile', width: 390, height: 844 },
  { label: '320-mobile', width: 320, height: 800 },
  { label: '1440-at-200-percent-equivalent', width: 720, height: 900 },
];

const results = [];
async function test(name, fn) {
  await fn();
  results.push({ name, status: 'PASS' });
}

async function layoutMetrics(page) {
  return page.evaluate(() => {
    const rect = (element) => {
      const value = element.getBoundingClientRect();
      return { left: value.left, right: value.right, top: value.top, bottom: value.bottom, width: value.width, height: value.height };
    };
    const cards = [...document.querySelectorAll('[data-rhino-fulfillment-card]')].map((card) => {
      const heading = card.querySelector('h3');
      const range = document.createRange();
      range.selectNodeContents(heading);
      return {
        ...rect(card),
        headingWidth: rect(heading).width,
        headingLineWidths: [...range.getClientRects()].map((line) => line.width),
      };
    });
    const controls = [...document.querySelectorAll(
      '#RhinoShippingQuotePanel input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), '
      + '#RhinoShippingQuotePanel select, #RhinoShippingQuotePanel textarea:not([hidden]), '
      + '#RhinoShippingQuotePanel [data-rhino-quote-submit]',
    )].filter((element) => !element.hidden && getComputedStyle(element).display !== 'none')
      .map((element) => ({ id: element.id, name: element.name, tag: element.tagName, ...rect(element) }));
    const panel = document.querySelector('#RhinoShippingQuotePanel');
    const submit = document.querySelector('[data-rhino-quote-submit]');
    const choiceTargets = [...document.querySelectorAll('[data-rhino-fulfillment-choice]')].map((input) => ({
      input: rect(input),
      label: rect(document.querySelector(`label[for="${input.id}"]`)),
    }));
    return {
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
      cards,
      controls,
      panel: rect(panel),
      submit: rect(submit),
      choiceTargets,
      focusOrderMatchesVisualOrder: Boolean(
        document.querySelector('#RhinoFulfillmentPickup').compareDocumentPosition(document.querySelector('#RhinoQuoteName'))
          & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
      positiveTabindexCount: document.querySelectorAll('#RhinoShippingQuoteForm [tabindex]:not([tabindex="0"]):not([tabindex="-1"])').length,
      columnCount: getComputedStyle(document.querySelector('.rhino-quote-mode__routes')).gridTemplateColumns.split(' ').length,
    };
  });
}

function assertLayout(metrics, viewportWidth) {
  assert(metrics.content <= metrics.viewport + 1, `document width ${metrics.content}px exceeds ${metrics.viewport}px viewport`);
  assert.equal(metrics.cards.length, 2);
  const practicalCardWidth = Math.min(320, viewportWidth - 40);
  for (const card of metrics.cards) {
    assert(card.width >= practicalCardWidth, `fulfillment card width ${card.width}px is below ${practicalCardWidth}px`);
    assert(card.headingWidth >= Math.min(180, card.width - 70), `heading width ${card.headingWidth}px collapsed inside ${card.width}px card`);
    assert(Math.max(...card.headingLineWidths) >= Math.min(150, card.width - 90), 'heading wraps into character-sized lines');
  }
  const cardsShareRow = Math.abs(metrics.cards[0].top - metrics.cards[1].top) < 2;
  if (cardsShareRow) {
    assert(metrics.cards[1].left >= metrics.cards[0].right - 1, 'side-by-side cards overlap');
  } else {
    assert(metrics.cards[1].top >= metrics.cards[0].bottom - 1, 'stacked cards overlap');
  }
  const cardsBottom = Math.max(...metrics.cards.map((card) => card.bottom));
  assert(metrics.panel.top >= cardsBottom, 'shipping form is not in its own row beneath the choices');
  const practicalControlWidth = Math.min(240, viewportWidth - 80);
  assert(metrics.controls.length >= 11, 'expected quotation controls are not visible');
  for (const control of metrics.controls) {
    assert(control.width >= practicalControlWidth, `${control.id || control.name || control.tag} width ${control.width}px is below ${practicalControlWidth}px`);
    assert(control.left >= -1 && control.right <= metrics.viewport + 1, `${control.id || control.name || control.tag} leaves the viewport`);
  }
  assert(metrics.submit.width >= practicalControlWidth, 'quotation submission button is too narrow');
  assert(metrics.submit.right <= metrics.viewport + 1, 'quotation submission button is clipped');
  assert(metrics.choiceTargets.every((target) => target.input.width >= 20 && target.input.height >= 20), 'fulfillment radios are too small');
  assert(metrics.choiceTargets.every((target) => target.label.height >= 44), 'fulfillment labels lack a 44px interactive target');
  assert.equal(metrics.focusOrderMatchesVisualOrder, true, 'focus order does not follow the choice-then-form visual order');
  assert.equal(metrics.positiveTabindexCount, 0, 'positive tabindex overrides the natural focus order');
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await fixtures.mount(desktop, { mixed: true });

    await test('mixed cart renders one complete-cart quotation workflow', async () => {
      await desktop.locator('rhino-quote-mode').waitFor();
      assert.equal(await desktop.locator('.cart-item').count(), 2);
      assert.equal(await desktop.locator('#RhinoShippingQuoteForm').count(), 1);
      const body = await desktop.locator('textarea[name="contact[body]"]').inputValue();
      assert.match(body, /Complete cart:/);
      assert.equal((body.match(/Quantity:/g) || []).length, 2);
    });

    await test('blocked pickup cannot expose native or accelerated checkout', async () => {
      assert.equal(await desktop.locator('[name="checkout"]:not([disabled])').count(), 0);
      assert.equal(await desktop.locator('.additional-checkout-buttons').count(), 0);
      assert.equal(await desktop.locator('[data-rhino-pickup-checkout][disabled]').count(), 1);
    });

    await test('empty required customer fields prevent submission', async () => {
      await desktop.locator('#RhinoFulfillmentShipping').check();
      await desktop.evaluate(() => {
        window.fixtureQuoteSubmission = null;
        document.querySelector('#RhinoShippingQuoteForm').addEventListener('submit', (event) => {
          event.preventDefault();
          window.fixtureQuoteSubmission = Object.fromEntries(new FormData(event.currentTarget));
        });
      });
      await desktop.locator('[data-rhino-quote-submit]').click();
      assert.equal(await desktop.evaluate(() => window.fixtureQuoteSubmission), null);
      assert.equal(await desktop.locator('#RhinoQuoteName:invalid').count(), 1);
      assert.notEqual(await desktop.locator('#RhinoQuoteName').evaluate((input) => input.validationMessage), '');
      assert.equal(await desktop.locator('#RhinoShippingQuotePanel').isVisible(), true);
    });

    await test('valid customer and delivery inputs submit the complete request without payment', async () => {
      await desktop.locator('#RhinoQuoteName').fill('Synthetic Customer');
      await desktop.locator('#RhinoQuoteEmail').fill('fixture@example.invalid');
      await desktop.locator('#RhinoQuoteAddress1').fill('100 Fixture Street');
      await desktop.locator('#RhinoQuoteCity').fill('Fixture City');
      await desktop.locator('#RhinoQuoteState').selectOption('WI');
      await desktop.locator('#RhinoQuotePostalCode').fill('53024');
      await desktop.locator('input[name="contact[delivery_type]"][value="Commercial"]').check();
      await desktop.locator('input[name="contact[liftgate_required]"][value="No"]').check();
      await desktop.locator('#RhinoQuoteAccess').fill('No special access limitations.');
      await desktop.locator('[data-rhino-quote-submit]').click();
      const submission = await desktop.evaluate(() => window.fixtureQuoteSubmission);
      assert.equal(submission['contact[email]'], 'fixture@example.invalid');
      assert.match(submission['contact[body]'], /Shipping charge: pending/);
      assert.match(submission['contact[body]'], /Invoice authorization: none/);
      assert.equal(Object.keys(submission).some((key) => /payment|card/i.test(key)), false);
    });

    await test('repeat submission for an unchanged cart is blocked in the browser session', async () => {
      const state = await desktop.locator('rhino-quote-mode').evaluate((element) => ({
        signature: element.dataset.cartSignature,
        reference: element.dataset.reference,
      }));
      await desktop.evaluate(({ signature, reference }) => {
        sessionStorage.setItem(`rhino-quote:${signature}`, JSON.stringify({ cartSignature: signature, reference, status: 'submitted' }));
      }, state);
      await desktop.reload();
      await desktop.locator('#RhinoFulfillmentShipping').check();
      const duplicateState = await desktop.locator('rhino-quote-mode').evaluate((element) => ({
        stored: sessionStorage.getItem(`rhino-quote:${element.dataset.cartSignature}`),
        disabled: element.querySelector('[data-rhino-quote-submit]').disabled,
        status: element.querySelector('[data-rhino-quote-status]').textContent,
      }));
      assert.equal(duplicateState.disabled, true, JSON.stringify(duplicateState));
      assert.match(await desktop.locator('[data-rhino-quote-status]').innerText(), /already submitted/i);
    });
    await desktop.close();

    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
      await fixtures.mount(page, { mixed: true });
      await test(`${viewport.label} choices and full-width quotation form retain usable geometry`, async () => {
        await page.locator('rhino-quote-mode').waitFor();
        assert.equal(await page.locator('[data-rhino-fulfillment-card]').count(), 2);
        assert.equal(await page.locator('#RhinoShippingQuotePanel').isHidden(), true);
        await page.locator('#RhinoFulfillmentShipping').check();
        await page.locator('#RhinoShippingQuotePanel').waitFor({ state: 'visible' });
        assertLayout(await layoutMetrics(page), viewport.width);

        const labels = await page.locator('#RhinoShippingQuotePanel label[for]').evaluateAll((elements) => (
          elements.map((label) => ({ for: label.htmlFor, text: label.textContent.trim() }))
        ));
        assert(labels.length >= 9 && labels.every((label) => label.for && label.text), 'text inputs must retain readable labels');
        await page.locator('#RhinoQuoteName').fill(`Preserved at ${viewport.width}px`);
        await page.screenshot({ path: path.join(OUTPUT_DIR, `shipping-${viewport.label}.png`), fullPage: true });

        await page.locator('#RhinoFulfillmentPickup').check();
        assert.equal(await page.locator('#RhinoShippingQuotePanel').isHidden(), true);
        assert.equal(await page.locator('[data-rhino-pickup-status]').isVisible(), true);
        assert.equal(await page.locator('[data-rhino-pickup-checkout]').isVisible(), true);
        await page.screenshot({ path: path.join(OUTPUT_DIR, `pickup-${viewport.label}.png`), fullPage: true });

        await page.locator('#RhinoFulfillmentShipping').check();
        assert.equal(await page.locator('#RhinoQuoteName').inputValue(), `Preserved at ${viewport.width}px`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), true);
      });
      await page.close();
    }

    await test('rendered request never invents free shipping or an approved invoice', async () => {
      const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      await fixtures.mount(page, { mixed: true });
      const body = await page.locator('textarea[name="contact[body]"]').inputValue();
      assert.doesNotMatch(body, /free shipping|shipping charge:\s*\$0/i);
      assert.doesNotMatch(body, /invoice authorization:\s*(approved|true)/i);
      await page.close();
    });

    await test('cart quantity controls remain present after quote-mode integration', async () => {
      const page = await browser.newPage({ viewport: { width: 1024, height: 900 } });
      await fixtures.mount(page, { mixed: true });
      assert.equal(await page.locator('quantity-input').count(), 2);
      assert.equal(await page.locator('cart-remove-button').count(), 2);
      await page.close();
    });
  } finally {
    await browser.close();
  }

  for (const result of results) console.log(`PASS ${result.name}`);
  console.log(`Epic K quote mode browser tests passed: ${results.length}/${results.length}.`);
  console.log(`Layout screenshots: ${OUTPUT_DIR}`);
})().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
