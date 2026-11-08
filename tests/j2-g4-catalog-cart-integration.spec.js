'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fixture = require('../scripts/lib/j2-g4-catalog-cart-fixtures');

const input = (page, variantId) => page.locator(`#Quantity-${variantId}`);
const plus = (page, variantId) => page.locator(`quick-add-bulk[data-index="${variantId}"] button[name="plus"]`);
const minus = (page, variantId) => page.locator(`quick-add-bulk[data-index="${variantId}"] button[name="minus"]`);
const toast = (page) => page.locator('cart-feedback-toast');

async function expectConfirmed(page, mounted, quantities, expectedTotal = null) {
  const total = expectedTotal ?? Object.values(quantities).reduce((sum, quantity) => sum + quantity, 0);
  for (const [variantId, quantity] of Object.entries(quantities)) {
    await expect(input(page, variantId)).toHaveValue(String(quantity));
    await expect(input(page, variantId)).toHaveAttribute('data-cart-quantity', String(quantity));
  }
  expect(mounted.cart().item_count).toBe(total);
  if (total) {
    await expect(page.locator('#cart-icon-bubble .cart-count-bubble [aria-hidden="true"]')).toHaveText(String(total));
  } else {
    await expect(page.locator('#cart-icon-bubble .cart-count-bubble')).toHaveCount(0);
  }
  await expect(page.locator('#CartDrawer .drawer__inner')).toContainText(`Drawer quantity ${total}`);
}

test('default, sort, filter, pagination, directory, and anchors retain their governed views', async ({ page }) => {
  await fixture.mount(page);
  await expect(page.locator('body')).toHaveAttribute('data-catalog-view', 'photographic');
  await expect(page.locator('#product-grid .card--product')).toHaveCount(2);
  await expect(page.locator('quick-add-bulk')).toHaveCount(2);

  await page.getByRole('link', { name: 'Sort by price' }).click();
  await expect(page).toHaveURL(/sort_by=price-ascending/);
  await expect(page.locator('body')).toHaveAttribute('data-catalog-view', 'photographic');
  await page.getByRole('link', { name: 'Available Products' }).click();
  await expect(page).toHaveURL(/filter\.v\.availability=1/);
  await expect(page.locator('body')).toHaveAttribute('data-catalog-view', 'photographic');
  const nextPage = page.getByRole('link', { name: 'Next page' });
  await nextPage.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/page=2/);
  await expect(page.locator('body')).toHaveAttribute('data-catalog-view', 'photographic');

  await page.getByRole('navigation', { name: 'Catalog categories' }).getByRole('link', { name: 'Replacement Parts' }).click();
  await expect(page).toHaveURL(/view=directory#g-replacement-parts/);
  await expect(page.locator('body')).toHaveAttribute('data-catalog-view', 'directory');
  await expect(page.locator('#product-grid')).toBeHidden();
  await expect(page.locator('#g-replacement-parts')).toBeVisible();
  await page.getByRole('link', { name: 'Accessories' }).last().click();
  await expect(page).toHaveURL(/#g-accessories/);
  await expect(page.locator('#g-accessories')).toBeVisible();
});

test('photographic quick-add, badge, drawer, cart page, and toast remain synchronized', async ({ page }) => {
  const mounted = await fixture.mount(page);
  await plus(page, 101).click();
  await expectConfirmed(page, mounted, { 101: 1, 202: 0 });
  await expect(toast(page)).toHaveAttribute('data-status', 'added');
  await expect(toast(page).locator('[data-cart-feedback-message]')).toHaveText('Added to cart — Diamond Blade');

  await plus(page, 101).click();
  await expectConfirmed(page, mounted, { 101: 2, 202: 0 });
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

test('rapid multi-Product updates serialize and collection navigation cannot stale confirmed state', async ({ page }) => {
  const mounted = await fixture.mount(page, { updateDelays: [400, 10] });
  await plus(page, 101).click();
  await expect.poll(() => mounted.state.requests.length).toBe(1);
  await plus(page, 202).click();
  await expectConfirmed(page, mounted, { 101: 1, 202: 1 });
  expect(mounted.state.maxActiveRequests).toBe(1);
  expect(mounted.state.completions).toEqual([101, 202]);

  await page.getByRole('navigation', { name: 'Catalog categories' }).getByRole('link', { name: 'Machines' }).click();
  await expect(page).toHaveURL(/\/collections\/machines$/);
  await expect(page.locator('body')).toHaveAttribute('data-catalog-view', 'photographic');
  await expectConfirmed(page, mounted, { 101: 1, 202: 1 });
  expect(mounted.state.errors).toEqual([]);
});

test('rejected and uncertain mutations never announce false success', async ({ page }) => {
  const mounted = await fixture.mount(page, { mode: 'validation-error' });
  await plus(page, 101).click();
  await expect(toast(page)).toHaveAttribute('data-status', 'rejected');
  await expect(toast(page).locator('[data-cart-feedback-message]')).toContainText('Fixture quantity rejected');
  await expectConfirmed(page, mounted, { 101: 0, 202: 0 });

  mounted.setMode('network-rejected');
  mounted.state.failReconciliation = true;
  await plus(page, 101).click();
  await expect(toast(page)).toHaveAttribute('data-status', 'uncertain');
  await expect(toast(page).locator('[data-cart-feedback-message]')).toContainText('status uncertain');
  await expect(toast(page).locator('[data-cart-feedback-message]')).not.toContainText('Added to cart');
});

test('header/drawer disclosure, mobile, zoom, focus, fallback, and accessibility coexist', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const mounted = await fixture.mount(page);
  await page.setViewportSize({ width: 320, height: 720 });
  await page.evaluate(() => { document.documentElement.style.fontSize = '20px'; });

  const summary = page.locator('.catalog-disclosure summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.catalog-disclosure')).toHaveAttribute('open', '');
  await page.keyboard.press('Tab');
  await expect(page.locator('.catalog-disclosure a').first()).toBeFocused();
  await expect(page.getByRole('img', { name: 'No image available for Saw Vice' })).toBeVisible();

  await plus(page, 101).focus();
  await page.keyboard.press('Enter');
  await expectConfirmed(page, mounted, { 101: 1, 202: 0 });
  await expect(plus(page, 101)).toBeFocused();
  const live = toast(page).locator('[data-cart-feedback-live]');
  await expect(live).toHaveAttribute('aria-live', 'polite');
  await expect(toast(page).locator('.cart-feedback-toast__surface')).toHaveCSS('animation-name', 'none');

  const geometry = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.viewport);
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([]);
  expect(mounted.state.errors).toEqual([]);
});

test('integrated source keeps role authority and one toast initialization', () => {
  const section = fs.readFileSync('sections/main-collection-product-grid.liquid', 'utf8');
  const navigation = fs.readFileSync('sections/rhino-g-catalog-navigation.liquid', 'utf8');
  assert(!section.includes('rhino_g_index'));
  assert.equal(section.split('cart-feedback-toast.js').length - 1, 1);
  assert.equal(section.split("render 'cart-feedback-toast'").length - 1, 1);
  assert(section.includes('paginate collection.products by section.settings.products_per_page'));
  for (const invented of ['/collections/replacement-parts', '/collections/consumables', '/collections/accessories']) {
    assert(!navigation.includes(invented));
  }
});
