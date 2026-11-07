'use strict';

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fixture = require('../scripts/lib/epic-j-j2-collection-fixtures');

const input = (page, variantId) => page.locator(`#Quantity-${variantId}`);
const plus = (page, variantId) =>
  page.locator(`quick-add-bulk[data-index="${variantId}"] button[name="plus"]`);
const minus = (page, variantId) =>
  page.locator(`quick-add-bulk[data-index="${variantId}"] button[name="minus"]`);
const toast = (page) => page.locator('cart-feedback-toast');

async function expectConfirmed(page, mounted, quantities, expectedTotal = null) {
  const total =
    expectedTotal ?? Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  for (const [variantId, quantity] of Object.entries(quantities)) {
    await expect(input(page, variantId)).toHaveValue(String(quantity));
    await expect(input(page, variantId)).toHaveAttribute('data-cart-quantity', String(quantity));
  }
  expect(mounted.cart().item_count).toBe(total);
  if (total === 0) {
    await expect(page.locator('#cart-icon-bubble .cart-count-bubble')).toHaveCount(0);
  } else {
    await expect(page.locator('#cart-icon-bubble .cart-count-bubble [aria-hidden="true"]')).toHaveText(
      String(total)
    );
  }
  const drawer = page.locator('#CartDrawer .drawer__inner');
  if (await drawer.count()) await expect(drawer).toContainText(`Drawer quantity ${total}`);
}

test('empty cart add, increment, decrement, remove, and cart page stay synchronized', async ({ page }) => {
  const mounted = await fixture.mount(page);
  await expectConfirmed(page, mounted, { 101: 0, 202: 0 });

  await plus(page, 101).click();
  await expectConfirmed(page, mounted, { 101: 1, 202: 0 });
  await expect(toast(page)).toHaveAttribute('data-status', 'added');
  await expect(toast(page).locator('[data-cart-feedback-message]')).toHaveText('Added to cart — Diamond Blade');

  await plus(page, 101).click();
  await expectConfirmed(page, mounted, { 101: 2, 202: 0 });
  await expect(toast(page).locator('[data-cart-feedback-message]')).toHaveText(
    'Quantity updated — Diamond Blade: 2'
  );

  await minus(page, 101).click();
  await expectConfirmed(page, mounted, { 101: 1, 202: 0 });
  await minus(page, 101).click();
  await expectConfirmed(page, mounted, { 101: 0, 202: 0 });
  await expect(toast(page).locator('[data-cart-feedback-message]')).toHaveText('Removed from cart — Diamond Blade');

  await plus(page, 101).click();
  await plus(page, 202).click();
  await expectConfirmed(page, mounted, { 101: 1, 202: 1 });
  await page.goto('http://collection.local/cart');
  await expect(page.locator('#cart-page-count')).toHaveText('2');
  expect(mounted.state.errors).toEqual([]);
});

test('rapid clicks coalesce and concurrent Products are globally serialized', async ({ page }) => {
  const mounted = await fixture.mount(page, { updateDelays: [500, 10] });
  await page.evaluate(() => {
    window.cartAnnouncements = [];
    const live = document.querySelector('[data-cart-feedback-live]');
    new MutationObserver(() => {
      if (live.textContent) window.cartAnnouncements.push(live.textContent);
    }).observe(live, { childList: true, characterData: true, subtree: true });
  });

  await plus(page, 101).click();
  await expect.poll(() => mounted.state.requests.length).toBe(1);
  await plus(page, 202).click();
  await expect.poll(() => mounted.state.requests.length).toBe(2);
  await expect.poll(() => mounted.state.completions.length).toBe(2);
  await expectConfirmed(page, mounted, { 101: 1, 202: 1 });
  expect(mounted.state.maxActiveRequests).toBe(1);
  expect(mounted.state.completions).toEqual([101, 202]);

  mounted.state.updateDelays.push(500, 0);
  await plus(page, 101).click();
  await expect.poll(() => mounted.state.requests.length).toBe(3);
  await plus(page, 101).click();
  await expect.poll(() => mounted.state.requests.length).toBe(4);
  await expect.poll(() => mounted.state.completions.length).toBe(4);
  await expectConfirmed(page, mounted, { 101: 3, 202: 1 });
  expect(mounted.state.requests.at(-1).updates).toEqual({ 101: 3 });

  await plus(page, 101).click();
  await plus(page, 101).click();
  await plus(page, 101).click();
  await expectConfirmed(page, mounted, { 101: 6, 202: 1 });
  expect(mounted.state.requests.at(-1).updates).toEqual({ 101: 6 });
  await expect(toast(page).locator('[data-cart-feedback-message]')).toHaveText(
    'Quantity updated — Diamond Blade: 6'
  );
  await page.waitForTimeout(350);
  const announcements = await page.evaluate(() => window.cartAnnouncements);
  expect(announcements.at(-1)).toBe('Quantity updated — Diamond Blade: 6');
  expect(announcements.filter((message) => message.endsWith(': 2') || message.endsWith(': 4'))).toEqual([]);
  expect(mounted.state.errors).toEqual([]);
});

for (const mode of ['missing-sections', 'malformed-sections']) {
  test(`${mode} reconcile without a duplicate mutation`, async ({ page }) => {
    const mounted = await fixture.mount(page, { mode, drawer: false });
    await plus(page, 101).click();
    await expectConfirmed(page, mounted, { 101: 1, 202: 0 });
    await expect(toast(page)).toHaveAttribute('data-status', 'added');
    expect(mounted.state.requests).toHaveLength(1);
    expect(mounted.state.errors).toEqual([]);
  });
}

test('Shopify validation and network rejection reconcile with no false success', async ({ page }) => {
  const mounted = await fixture.mount(page, { mode: 'validation-error' });
  await plus(page, 101).click();
  await expect(toast(page)).toHaveAttribute('data-status', 'rejected');
  await expect(toast(page).locator('[data-cart-feedback-message]')).toContainText('Fixture quantity rejected');
  await expectConfirmed(page, mounted, { 101: 0, 202: 0 });
  await expect(toast(page).locator('[data-cart-feedback-message]')).not.toContainText('Added to cart');

  mounted.setMode('network-rejected');
  await plus(page, 101).click();
  await expect(toast(page)).toHaveAttribute('data-status', 'rejected');
  await expectConfirmed(page, mounted, { 101: 0, 202: 0 });
  expect(mounted.state.errors).toEqual([]);
});

test('ambiguous transport failure declares success only after cart reconciliation confirms it', async ({ page }) => {
  const mounted = await fixture.mount(page, { mode: 'network-applied' });
  await plus(page, 101).click();
  await expectConfirmed(page, mounted, { 101: 1, 202: 0 });
  await expect(toast(page)).toHaveAttribute('data-status', 'added');
  await expect(toast(page).locator('[data-cart-feedback-message]')).toHaveText('Added to cart — Diamond Blade');
});

test('failed mutation and failed reconciliation report an uncertain outcome', async ({ page }) => {
  const mounted = await fixture.mount(page, { mode: 'network-rejected', failReconciliation: true });
  await plus(page, 101).click();
  await expect(toast(page)).toHaveAttribute('data-status', 'uncertain');
  await expect(toast(page).locator('[data-cart-feedback-message]')).toContainText('status uncertain');
  await expect(toast(page).locator('[data-cart-feedback-message]')).not.toContainText('Added to cart');
  expect(mounted.cart().item_count).toBe(0);
});

test('cart changes from another entry point reconcile every visible quantity and total badge', async ({ page }) => {
  const mounted = await fixture.mount(page);
  mounted.setQuantity(101, 2);
  mounted.setQuantity(202, 1);
  mounted.setQuantity(303, 3);
  await page.evaluate(() => publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items' }));
  await expectConfirmed(page, mounted, { 101: 2, 202: 1 }, 6);
  await expect(page.locator('#cart-icon-bubble .cart-count-bubble [aria-hidden="true"]')).toHaveText('6');
  expect(mounted.state.errors).toEqual([]);
});

test('toast is polite, keyboard dismissible, reduced-motion safe, and usable at high zoom', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const mounted = await fixture.mount(page);
  await page.setViewportSize({ width: 320, height: 720 });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '20px';
  });

  await plus(page, 101).focus();
  await page.keyboard.press('Enter');
  await expectConfirmed(page, mounted, { 101: 1, 202: 0 });
  await expect(plus(page, 101)).toBeFocused();
  const live = toast(page).locator('[data-cart-feedback-live]');
  await expect(live).toHaveAttribute('role', 'status');
  await expect(live).toHaveAttribute('aria-live', 'polite');
  await expect(live).toHaveAttribute('aria-atomic', 'true');
  await expect(toast(page).locator('.cart-feedback-toast__surface')).toHaveCSS('animation-name', 'none');

  const geometry = await toast(page).evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return { left: rect.left, right: rect.right, width: rect.width, viewport: innerWidth };
  });
  expect(geometry.left).toBeGreaterThanOrEqual(0);
  expect(geometry.right).toBeLessThanOrEqual(geometry.viewport);

  const dismiss = toast(page).locator('[data-cart-feedback-dismiss]');
  await dismiss.focus();
  await page.keyboard.press('Enter');
  await expect(toast(page)).toBeHidden();

  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([]);
  expect(mounted.state.errors).toEqual([]);
});

test('successful confirmation automatically dismisses after its duration', async ({ page }) => {
  const mounted = await fixture.mount(page);
  await plus(page, 101).click();
  await expectConfirmed(page, mounted, { 101: 1, 202: 0 });
  await expect(toast(page)).toBeVisible();
  await expect(toast(page)).toBeHidden({ timeout: 5000 });
});
