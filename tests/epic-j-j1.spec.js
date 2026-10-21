'use strict';
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const F = require('../scripts/lib/epic-j-j1-fixtures');
const C = require('../scripts/lib/epic-j-cart-fixtures');
const J = require('../scripts/lib/epic-j-j0');
async function submit(page) { await page.locator('product-form form').evaluate(e => e.requestSubmit()); }
async function recovered(page) { await expect(page.locator('[name=add]')).not.toHaveAttribute('aria-disabled', 'true'); }
async function error(page) {
  const alert = page.locator('.product-form__error-message-wrapper');
  await expect(alert).toBeVisible(); await expect(alert).toHaveAttribute('role', 'alert'); await expect(alert).toHaveText(F.genericError);
}
test('J1 transport rejection is visible, announced, preserves selection and never auto-retries', async ({ page }) => {
  const s = await F.mount(page, { mode: 'transport' });
  await page.locator('label[for="machine-1-1"]').click();
  await expect(page.locator('product-form [name=id]')).toHaveValue(F.fixture.items[1].variantId);
  await page.locator('[name=quantity]').fill('2'); await submit(page); await recovered(page);
  await error(page); await page.waitForTimeout(200);
  expect(s.posts).toHaveLength(1); expect(s.items).toEqual([]);
  await expect(page.locator('product-form [name=id]')).toHaveValue(F.fixture.items[1].variantId);
  await expect(page.locator('[name=quantity]')).toHaveValue('2');
  s.mode = 'success'; await submit(page); await expect(page.locator('#cart-notification')).toHaveClass(/active/); await recovered(page);
  expect(s.posts).toHaveLength(2); expect(s.items[0].quantity).toBe(2); expect(s.errors).toEqual([]);
  J.write('j1-transport.json', { visibleAnnouncedError: true, preservedVariant: F.fixture.items[1].variantId, quantity: 2, emulatedPosts: s.posts.length, automaticRetries: 0 });
});
for (const width of [360, 390, 1440]) for (const enlarged of [false, true]) test('J1 success and notification focus ' + width + ' text ' + (enlarged ? 200 : 100), async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 });
  const s = await F.mount(page);
  if (enlarged) await page.evaluate(() => document.documentElement.style.fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) * 2 + 'px');
  await page.locator('[name=add]').focus();
  await page.locator('product-form form').evaluate(e => { e.requestSubmit(); e.requestSubmit(); });
  await expect(page.locator('#cart-notification')).toHaveClass(/active/); await recovered(page);
  expect(s.posts).toHaveLength(1); expect(s.items[0].quantity).toBe(1);
  const dialog = page.locator('#cart-notification');
  await expect(dialog).toHaveAttribute('aria-modal', 'true'); await expect(dialog).toHaveAttribute('aria-label', /added/i);
  await expect.poll(() => page.evaluate(() => !!document.activeElement.closest('cart-notification'))).toBe(true);
  await page.keyboard.press('Escape'); await expect(page.locator('[name=add]')).toBeFocused();
  await expect(dialog).toHaveCSS('visibility', 'hidden');
  for (let i = 0; i < 6; i++) { await page.keyboard.press('Tab'); expect(await page.evaluate(() => !!document.activeElement.closest('cart-notification'))).toBe(false); }
  expect(s.errors).toEqual([]);
});
for (const mode of ['missing-section', 'null-section', 'malformed-section', 'wrong-line', 'missing-key', 'invalid-json']) test('J1 rejects ' + mode + ' without partial fragment updates or retrying an uncertain POST', async ({ page }) => {
  const s = await F.mount(page, { mode });
  const prior = await page.locator('#cart-icon-bubble').innerHTML();
  await page.evaluate(() => { window.j1updates = 0; subscribe(PUB_SUB_EVENTS.cartUpdate, () => { window.j1updates++; }); });
  await submit(page); await recovered(page); await error(page);
  expect(await page.locator('#cart-icon-bubble').innerHTML()).toBe(prior);
  expect(await page.evaluate(() => window.j1updates)).toBe(0);
  await expect(page.locator('#cart-notification')).not.toHaveClass(/active/);
  expect(s.posts).toHaveLength(1); expect(s.items[0].quantity).toBe(1);
  // An uncertain response may follow a successful server add. Only read/navigate to reconcile.
  await page.goto('http://machine.local/cart'); await expect(page.locator('.cart-item')).toHaveCount(1);
  await expect(page.locator('[name="updates[]"]')).toHaveValue('1'); expect(s.posts).toHaveLength(1);
});
test('J1 incomplete response after success closes prior notice and reconciles by native cart navigation', async ({ page }) => {
  const s = await F.mount(page); await submit(page); await recovered(page); await expect(page.locator('#cart-notification')).toHaveClass(/active/);
  const oldIcon = await page.locator('#cart-icon-bubble').innerHTML();
  s.mode = 'missing-section'; await submit(page); await recovered(page); await error(page);
  await expect(page.locator('#cart-notification')).not.toHaveClass(/active/);
  expect(await page.locator('#cart-icon-bubble').innerHTML()).toBe(oldIcon); expect(s.posts).toHaveLength(2);
  await page.goto('http://machine.local/cart'); await expect(page.locator('[name="updates[]"]')).toHaveValue('2'); expect(s.posts).toHaveLength(2);
});
test('J1 422 preserves prior cart and two Size line identities; history renders server state', async ({ page }) => {
  const s = await F.mount(page); expect(await page.locator('variant-selects input').count()).toBe(4);
  await submit(page); await recovered(page); await expect(page.locator('#cart-notification')).toHaveClass(/active/); await page.keyboard.press('Escape');
  await page.locator('label[for="machine-1-1"]').click();
  await expect(page.locator('product-form [name=id]')).toHaveValue(F.fixture.items[1].variantId);
  await submit(page); await recovered(page); await expect(page.locator('#cart-notification')).toHaveClass(/active/); await page.keyboard.press('Escape');
  const prior = structuredClone(s.items); s.mode = '422';
  await submit(page); await recovered(page); await expect(page.getByRole('alert')).toHaveText('Fixture quantity rejected');
  expect(s.items).toEqual(prior); expect(s.posts).toHaveLength(3);
  await page.goto('http://machine.local/cart'); await expect(page.locator('.cart-item')).toHaveCount(2);
  for (const line of prior) await expect(page.locator('[data-quantity-variant-id="' + line.variantId + '"]')).toHaveValue('1');
  await expect(page.locator('.totals__total-value')).toContainText('$40.00');
  await page.locator('.cart-item__name').first().click();
  // Emulated server cart changes between navigations; no second cart implementation runs in the page.
  s.items[0].quantity = 3;
  await page.goBack(); await expect(page.locator('[data-quantity-variant-id="' + prior[0].variantId + '"]')).toHaveValue('3');
  await page.goForward(); await page.goBack(); await expect(page.locator('.cart-item')).toHaveCount(2);
  await expect(page.locator('.totals__total-value')).toContainText('$70.00'); expect(s.errors).toEqual([]);
});
test('J1 native cart quantity, 422 restoration, section refresh, removal and empty recovery', async ({ page }) => {
  const s = await F.mount(page); await submit(page); await recovered(page);
  await page.locator('#cart-notification-button').click(); await expect(page).toHaveURL(/\/cart$/);
  await page.locator('[name=plus]').click(); await expect(page.locator('[name="updates[]"]')).toHaveValue('2');
  await expect(page.locator('.totals__total-value')).toContainText('$30.00');
  s.mode = '422'; await page.locator('[name=plus]').click();
  await expect(page.locator('.cart-item__error-text')).toHaveText('Fixture inventory quantity unavailable');
  await expect(page.locator('[name="updates[]"]')).toHaveValue('2'); expect(s.items[0].quantity).toBe(2);
  s.mode = 'success'; await page.locator('[name=minus]').click();
  await expect(page.locator('[name="updates[]"]')).toHaveValue('1'); await expect(page.locator('.totals__total-value')).toContainText('$15.00');
  s.items[0].quantity = 3;
  await page.evaluate(() => publish(PUB_SUB_EVENTS.cartUpdate, { source: 'fixture-server-observation' }));
  await expect(page.locator('[name="updates[]"]')).toHaveValue('3');
  await page.locator('cart-remove-button a').click(); await expect(page.locator('.cart__empty-text')).toBeVisible();
  await expect(page.locator('[name=checkout]')).not.toBeVisible(); expect(s.items).toEqual([]); expect(s.posts).toHaveLength(5); expect(s.errors).toEqual([]);
  J.write('j1-native-cart-state.json', { emulatedPosts: 5, emulatedFinalCartEmpty: true, nativeSectionRefresh: true, realPosts: 0 });
});
for (const width of [360, 390, 1440]) for (const enlarged of [false, true]) test('J1 cart layout ' + width + ' text ' + (enlarged ? 200 : 100), async ({ page }) => {
  await page.setViewportSize({ width, height: 1000 }); const s = await C.mount(page, { nativeRules: true });
  if (enlarged) await page.evaluate(() => document.documentElement.style.fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) * 2 + 'px');
  const geometry = await page.evaluate(() => {
    const box = e => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right, width: r.width, height: r.height, scrollWidth: e.scrollWidth, clientWidth: e.clientWidth, text: e.textContent.trim() }; };
    return { viewport: innerWidth, rootFont: getComputedStyle(document.documentElement).fontSize, scrollWidth: document.documentElement.scrollWidth,
      cart: box(document.querySelector('cart-items')), rows: [...document.querySelectorAll('.cart-item')].map(box),
      content: [...document.querySelectorAll('.cart-item__name,.product-option,.cart-item__price-wrapper,quantity-input,cart-remove-button,.totals,[name=checkout]')].filter(e => e.getBoundingClientRect().width).map(e => ({ ...box(e), class: e.className, tag: e.tagName })) };
  });
  J.write('j1-layout-' + width + '-text' + (enlarged ? 200 : 100) + '.json', geometry);
  await page.screenshot({ path: J.outputPath('j1-layout-' + width + '-text' + (enlarged ? 200 : 100) + '.png'), fullPage: true });
  expect.soft(geometry.scrollWidth, 'cart horizontal overflow').toBeLessThanOrEqual(width + 1);
  for (const c of geometry.content) { expect.soft(c.left, c.class).toBeGreaterThanOrEqual(-1); expect.soft(c.right, c.class).toBeLessThanOrEqual(width + 1); }
  for (const input of await page.locator('[name="updates[]"]').all()) { await expect(input).toHaveAttribute('aria-label', /quantity/i); await expect(input).toBeEnabled(); await input.focus(); await expect(input).toBeFocused(); }
  for (const remove of await page.locator('cart-remove-button a').all()) { await expect(remove).toHaveAttribute('aria-label', /remove.*Saw Blade/i); await remove.focus(); await expect(remove).toBeFocused(); }
  const checkout = page.locator('[name=checkout]'); await checkout.scrollIntoViewIfNeeded(); await checkout.focus(); await expect(checkout).toBeVisible(); await expect(checkout).toBeEnabled(); await expect(checkout).toBeFocused();
  expect(await checkout.getAttribute('form')).toBe('cart'); await expect(page.locator('.totals__total-value')).toContainText('$55.00');
  await page.locator('.cart-item [name=plus]').first().click();
  await expect(page.locator('.cart-item__error-text').first()).toHaveText('Fixture inventory quantity unavailable');
  await expect(page.locator('[name="updates[]"]').first()).toHaveValue('2');
  const axe = await new AxeBuilder({ page }).analyze(); J.write('j1-axe-' + width + '-text' + (enlarged ? 200 : 100) + '.json', axe.violations);
  expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]); expect(s.errors).toEqual([]);
});
