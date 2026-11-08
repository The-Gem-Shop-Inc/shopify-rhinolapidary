'use strict';

const {test, expect} = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fixtures = require('./fixtures/epic-o-native-account.json');
const {accountEntryHtml, authenticatedAccountHtml} = require('../scripts/lib/epic-o-native-account-fixtures');

const byId = (id) => fixtures.accountStates.find((state) => state.id === id);

test('anonymous account entry uses the configured Shopify sign-in destination without exposing private data', async ({page}) => {
  const state = byId('anonymous-entry');
  await page.setContent(accountEntryHtml(state));
  const link = page.getByRole('link', {name: 'Log in'});
  await expect(link).toHaveAttribute('href', '/customer_authentication/redirect');
  await link.focus();
  await expect(link).toBeFocused();
  await expect(page.locator('body')).not.toContainText(/@|order #|serial/i);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});

test('platform-hidden account entry produces no orphaned account control', async ({page}) => {
  await page.setContent(accountEntryHtml(byId('account-link-hidden-by-platform')));
  await expect(page.getByRole('link', {name: /log in|account/i})).toHaveCount(0);
});

test('synthetic authenticated empty and paginated order states have useful landmarks, names, and recovery', async ({page}) => {
  await page.setContent(authenticatedAccountHtml(byId('authenticated-empty-orders')));
  await expect(page.getByRole('heading', {level: 1, name: 'Orders'})).toBeVisible();
  await expect(page.getByRole('link', {name: 'Shop now'})).toHaveAttribute('href', '/collections/all');
  await expect(page.getByRole('navigation', {name: 'Customer account'})).toBeVisible();

  await page.setContent(authenticatedAccountHtml(byId('authenticated-multiple-order-pages')));
  await expect(page.getByRole('link', {name: /Order SYNTH-ORDER-A/})).toBeVisible();
  await expect(page.getByRole('navigation', {name: 'Order pages'})).toContainText('Page 2 of 3');
  await expect(page.getByRole('link', {name: 'Previous'})).toHaveAttribute('rel', 'prev');
  await expect(page.getByRole('link', {name: 'Next'})).toHaveAttribute('rel', 'next');
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});

test('synthetic address actions and error recovery are keyboard and screen-reader discoverable', async ({page}) => {
  await page.setContent(authenticatedAccountHtml(byId('address-actions')));
  await expect(page.getByRole('button', {name: 'Add address'})).toBeVisible();
  await expect(page.getByRole('button', {name: 'Edit address'})).toHaveCount(2);
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.activeElement?.matches('a, button'))).toBe(true);

  await page.setContent(authenticatedAccountHtml(byId('unavailable-destination')));
  await expect(page.getByRole('alert')).toBeFocused();
  await expect(page.getByRole('button', {name: 'Try again'})).toBeVisible();
  await expect(page.getByRole('link', {name: 'Return to store'})).toHaveAttribute('href', '/');
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});

for (const width of [320, 360, 390, 768, 1024, 1440]) {
  test(`synthetic account reflows at ${width}px and 200% text`, async ({page}) => {
    await page.setViewportSize({width, height: 1000});
    await page.setContent(authenticatedAccountHtml(byId('address-actions')));
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const geometry = await page.evaluate(() => ({scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth}));
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport + 1);
    await expect(page.getByRole('navigation', {name: 'Customer account'})).toBeVisible();
  });
}

test('synthetic account retains actions at 400% text where applicable', async ({page}) => {
  await page.setViewportSize({width: 1280, height: 900});
  await page.setContent(authenticatedAccountHtml(byId('unavailable-destination')));
  await page.evaluate(() => { document.documentElement.style.fontSize = '400%'; });
  await expect(page.getByRole('button', {name: 'Try again'})).toBeVisible();
  await expect(page.getByRole('link', {name: 'Return to store'})).toBeVisible();
});
