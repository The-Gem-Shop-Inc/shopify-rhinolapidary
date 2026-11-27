'use strict';

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const registryPath = process.env.B07C_REGISTRY_PATH || path.join(os.homedir(), 'Downloads', 'epic-l-policy2-resource-registry.json');
const headers = { 'x-rhino-synthetic-session': 'B07_LOCAL_ISOLATED', origin: 'http://127.0.0.1:4178' };

test.beforeEach(async ({ request, page }) => {
  const response = await request.post('/api/reset', { headers, data: { commandId: `B07C-BROWSER-RESET-${crypto.randomUUID()}`, confirmed: true } });
  expect(response.ok()).toBeTruthy();
  await page.goto('/');
  await expect(page.locator('#inventory-count')).toHaveText('9 resources shown');
});

test('routine administrative editing uses no content classification fields and creates no content revision', async ({ page }) => {
  await page.getByText('BEADMASTER - BEAD MACHINE DIMENSIONS.pdf', { exact: true }).click();
  await page.getByRole('button', { name: 'Edit administrative details' }).click();
  const dialog = page.getByRole('dialog', { name: 'Edit administrative details' });
  await expect(dialog.locator('[name="changeStatus"], [name="immutableRevisionIdentity"], [name="availabilityStatus"], [name="changeReason"]')).toHaveCount(0);
  expect(await dialog.locator(':invalid').count()).toBe(0);
  await dialog.getByLabel('Title', { exact: true }).fill('BeadMaster dimensions — administrative title');
  await dialog.getByRole('button', { name: 'Save details' }).click();
  await expect(page.getByRole('heading', { name: 'BeadMaster dimensions — administrative title' })).toBeVisible();
  await expect(page.getByText('Existing content; identity pending', { exact: true }).first()).toBeVisible();
  await expect(page.locator('.history li')).toHaveCount(1);
});

test('content replacement is confirmed, auto-supersedes history, and requires a fresh technical decision', async ({ page }) => {
  await page.locator('.resource-card').first().click();
  await page.getByRole('button', { name: 'Update content' }).click();
  const dialog = page.getByRole('dialog', { name: 'Update content' });
  await dialog.getByLabel('Title', { exact: true }).fill('EM-1 instructions — replacement');
  await dialog.getByRole('button', { name: 'Continue to confirmation' }).click();
  await expect(page.getByRole('dialog', { name: 'Confirm action' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.locator('.detail-grid dd').filter({ hasText: /^Content changed$/ })).toBeVisible();
  await expect(page.locator('.history li')).toHaveCount(2);
  await expect(page.locator('.history')).toContainText('Replaced');
  await expect(page.getByRole('button', { name: 'Record technical decision' })).toBeVisible();
  await page.getByRole('button', { name: 'Record technical decision' }).click();
  await expect(page.getByText('Technical decision', { exact: true })).toBeVisible();
});

test('automatic enrichment fills deterministic values and leaves delivery preparation pending when unknown', async ({ page }) => {
  await page.getByRole('button', { name: 'Review automatic updates' }).click();
  const dialog = page.getByRole('dialog', { name: 'Review suggested updates' });
  await expect(dialog.getByText(/values/).first()).toBeVisible();
  await dialog.getByRole('button', { name: 'Apply automatic updates' }).click();
  await page.getByText('Beadmaster — Bead Machine Dimensions', { exact: true }).click();
  await expect(page.getByText('en-US (defaulted)')).toBeVisible();
  await page.getByText('Advanced identities and evidence').click();
  await expect(page.getByText('sha256:4f99ba41459f3f5cae6fa8a78d6e2867cfb296fedbaef4aaf07a0508751c72f4', { exact: true })).toBeVisible();
  await expect(page.getByText('Pending delivery preparation')).toBeVisible();
  await page.locator('#filter-form input[name="search"]').fill('EM-1');
  await page.locator('.resource-card').click();
  await page.getByText('Advanced identities and evidence').click();
  await expect(page.locator('.detail-grid dd').filter({ hasText: /cdn\.shopify\.com\/.*EM-1_Instructions\.pdf/ })).toBeVisible();
});

test('imports the Product Owner V1 archive and presents both SawMaster corrections as one confirmation', async ({ page }) => {
  test.skip(!fs.existsSync(registryPath), `Product Owner archive not available at ${registryPath}`);
  await page.locator('#import-registry').setInputFiles(registryPath);
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByText('Two SawMaster diagrams need one content check.')).toBeVisible();
  await page.getByRole('button', { name: 'Review automatic updates' }).click();
  await page.getByRole('button', { name: 'Apply automatic updates' }).click();
  await page.getByRole('button', { name: 'Confirm both files were unchanged' }).click();
  const correctionResponse = page.waitForResponse((response) => response.url().endsWith('/api/bulk/correct-unchanged'));
  const refreshedBootstrap = page.waitForResponse((response) => response.url().endsWith('/api/bootstrap') && response.request().method() === 'GET');
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  expect((await correctionResponse).ok()).toBeTruthy();
  await refreshedBootstrap;
  await expect(page.getByText('Both classifications were corrected with retained history.')).toBeVisible();
  await expect(page.getByText('Two SawMaster diagrams need one content check.')).toBeHidden();
  await page.locator('#filter-form input[name="search"]').fill('SAWMASTER 18');
  await page.locator('[data-resource-id="repo-sawmaster-18-saw-machine-18-dimensions-pdf"]').click();
  await expect(page.getByText('Sawmaster 18" 2026', { exact: false })).toBeVisible();
  await page.getByText('Advanced identities and evidence').click();
  await expect(page.getByText(/Originally Content changed; effectively Existing unchanged content/)).toBeVisible();
});

test('keyboard navigation, focus indicators, and simplified dialogs meet WCAG A and AA checks', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#workspace')).toBeFocused();
  let results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
  await page.locator('.resource-card').first().click();
  await page.getByRole('button', { name: 'Edit administrative details' }).click();
  results = await new AxeBuilder({ page }).include('#resource-dialog').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('workspace state survives browser reload and reset requires confirmation', async ({ page }) => {
  await page.locator('.resource-card').first().click();
  await page.getByRole('button', { name: 'Edit administrative details' }).click();
  await page.getByRole('dialog', { name: 'Edit administrative details' }).getByLabel('Title', { exact: true }).fill('Persisted browser workflow');
  await page.getByRole('button', { name: 'Save details' }).click();
  await page.reload();
  await expect(page.getByText('Persisted browser workflow', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset workspace' }).click();
  await expect(page.getByRole('dialog', { name: 'Confirm action' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('Persisted browser workflow', { exact: true })).toBeVisible();
});
