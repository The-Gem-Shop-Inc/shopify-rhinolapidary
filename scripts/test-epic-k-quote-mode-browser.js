'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const fixtures = require('./lib/epic-j-cart-fixtures');

const results = [];
async function test(name, fn) {
  await fn();
  results.push({ name, status: 'PASS' });
}

(async () => {
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
      assert.equal(await desktop.locator('.rhino-quote-mode__route button[disabled]').count(), 1);
    });

    await test('empty required customer fields prevent submission', async () => {
      await desktop.evaluate(() => {
        window.fixtureQuoteSubmission = null;
        document.querySelector('#RhinoShippingQuoteForm').addEventListener('submit', event => {
          event.preventDefault();
          window.fixtureQuoteSubmission = Object.fromEntries(new FormData(event.currentTarget));
        });
      });
      await desktop.locator('[data-rhino-quote-submit]').click();
      assert.equal(await desktop.evaluate(() => window.fixtureQuoteSubmission), null);
      assert.equal(await desktop.locator('#RhinoQuoteName:invalid').count(), 1);
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
      assert.equal(Object.keys(submission).some(key => /payment|card/i.test(key)), false);
    });

    await test('repeat submission for an unchanged cart is blocked in the browser session', async () => {
      const state = await desktop.locator('rhino-quote-mode').evaluate(element => ({
        signature: element.dataset.cartSignature,
        reference: element.dataset.reference,
      }));
      await desktop.evaluate(({ signature, reference }) => {
        sessionStorage.setItem(`rhino-quote:${signature}`, JSON.stringify({ cartSignature: signature, reference, status: 'submitted' }));
      }, state);
      await desktop.reload();
      assert.equal(await desktop.locator('[data-rhino-quote-submit]').isDisabled(), true);
      await assert.doesNotReject(async () => assert.match(await desktop.locator('[data-rhino-quote-status]').innerText(), /already submitted/i));
    });

    await test('desktop route cards use a two-column layout', async () => {
      const columns = await desktop.locator('.rhino-quote-mode__routes').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
      assert.equal(columns, 2);
    });

    for (const width of [360, 390]) {
      const mobile = await browser.newPage({ viewport: { width, height: 900 } });
      await fixtures.mount(mobile, { mixed: true });
      await test(`${width}px cart remains readable without horizontal overflow`, async () => {
        await mobile.locator('rhino-quote-mode').waitFor();
        const dimensions = await mobile.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }));
        assert(dimensions.content <= dimensions.viewport);
        assert.equal(await mobile.locator('.rhino-quote-mode__routes').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length), 1);
      });
      await mobile.close();
    }

    await test('rendered request never invents free shipping or an approved invoice', async () => {
      const body = await desktop.locator('textarea[name="contact[body]"]').inputValue();
      assert.doesNotMatch(body, /free shipping|shipping charge:\s*\$0/i);
      assert.doesNotMatch(body, /invoice authorization:\s*(approved|true)/i);
    });

    await test('cart quantity controls remain present after quote-mode integration', async () => {
      assert.equal(await desktop.locator('quantity-input').count(), 2);
      assert.equal(await desktop.locator('cart-remove-button').count(), 2);
    });
  } finally {
    await browser.close();
  }

  for (const result of results) console.log(`PASS ${result.name}`);
  console.log(`Epic K quote mode browser tests passed: ${results.length}/${results.length}.`);
})().catch(error => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
