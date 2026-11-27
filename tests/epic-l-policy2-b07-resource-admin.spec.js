'use strict';

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#inventory-count')).toContainText(/\d+ resources shown/);
  expect(await page.locator('.resource-card').count()).toBeGreaterThanOrEqual(9);
});

test('imports the exact B05 inventory and supports search and filters', async ({ page }) => {
  await expect(page.locator('.resource-card')).toHaveCount(9);
  await page.locator('#filter-form select[name="category"]').selectOption('DIAGRAM');
  await expect(page.getByText('6 resources shown')).toBeVisible();
  await page.locator('#filter-form select[name="category"]').selectOption('');
  await page.locator('#filter-form input[name="search"]').fill('EM-1');
  await expect(page.locator('.resource-card')).toHaveCount(1);
  await page.locator('.resource-card').click();
  await expect(page.getByRole('heading', { name: /EM-1_Instructions/ })).toBeVisible();
  await expect(page.getByText('Resolve before internal approval')).toBeVisible();
});

test('creates a recoverable incomplete draft and preserves separate source and delivery fields', async ({ page }) => {
  await page.getByRole('button', { name: 'New draft' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create draft' });
  await dialog.getByLabel('Title', { exact: true }).fill('B07 Playwright draft document');
  await dialog.locator('#resource-category').selectOption('SETUP_GUIDE');
  await dialog.locator('#editable-source').fill('synthetic-editor://playwright/document');
  await dialog.locator('#proposed-delivery').fill('https://delivery.invalid/playwright/document');
  await dialog.getByRole('button', { name: 'Save governed revision' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('heading', { name: 'B07 Playwright draft document' })).toBeVisible();
  await expect(page.getByText('synthetic-editor://playwright/document')).toBeVisible();
  await expect(page.getByText('https://delivery.invalid/playwright/document')).toBeVisible();
  await expect(page.getByText(/immutable revision identity required/i)).toBeVisible();
});

test('recovers after domain validation error without losing the open form', async ({ page }) => {
  await page.getByRole('button', { name: 'New draft' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create draft' });
  await dialog.getByLabel('Title', { exact: true }).fill('B07 error recovery draft');
  await dialog.locator('#resource-category').selectOption('TUTORIAL_VIDEO');
  await dialog.locator('#editable-source').fill('synthetic-editor://playwright/video');
  const product = dialog.locator('[name="assignmentProduct"]');
  await product.selectOption({ index: 1 });
  const variant = dialog.locator('[name="assignmentVariant"]');
  await variant.selectOption({ index: 1 });
  await dialog.locator('[name="assignmentMachineVersion"]').fill('PW-V1');
  await variant.evaluate((select) => {
    const option = document.createElement('option');
    option.value = 'gid://shopify/ProductVariant/99999999999999';
    option.textContent = 'Unknown test variant';
    select.append(option);
    select.value = option.value;
  });
  await dialog.getByRole('button', { name: 'Save governed revision' }).click();
  await expect(dialog.getByRole('alert')).toContainText('UNKNOWN_VARIANT_GID');
  await product.selectOption('');
  await dialog.locator('[name="assignmentMachineVersion"]').fill('');
  await dialog.getByRole('button', { name: 'Save governed revision' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('heading', { name: 'B07 error recovery draft' })).toBeVisible();
});

test('assigns multiple exact machines and retains accessible supersession history', async ({ page }) => {
  await page.getByRole('button', { name: 'New draft' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create draft' });
  await dialog.getByLabel('Title', { exact: true }).fill('B07 multi-machine document');
  await dialog.locator('#resource-category').selectOption('SETUP_GUIDE');
  await dialog.locator('#editable-source').fill('synthetic-editor://playwright/multi-machine');
  await dialog.locator('#proposed-delivery').fill('https://delivery.invalid/playwright/multi-machine');
  await dialog.getByLabel('Immutable revision identity', { exact: true }).fill(`sha256:${'1'.repeat(64)}`);
  await dialog.locator('[name="providerType"]').selectOption('OTHER_PROVIDER');
  const first = dialog.locator('[data-assignment]').first();
  await first.locator('[name="assignmentProduct"]').selectOption({ index: 1 });
  await first.locator('[name="assignmentVariant"]').selectOption({ index: 1 });
  await first.locator('[name="assignmentMachineVersion"]').fill('PW-MACHINE-A');
  await first.locator('[name="assignmentApprovalStatus"]').selectOption('EXPLICITLY_APPROVED');
  await dialog.getByRole('button', { name: 'Add machine assignment' }).click();
  const second = dialog.locator('[data-assignment]').nth(1);
  await second.locator('[name="assignmentProduct"]').selectOption({ index: 2 });
  await second.locator('[name="assignmentVariant"]').selectOption({ index: 1 });
  await second.locator('[name="assignmentMachineVersion"]').fill('PW-MACHINE-B');
  await second.locator('[name="assignmentApprovalStatus"]').selectOption('EXPLICITLY_APPROVED');
  await dialog.getByRole('button', { name: 'Save governed revision' }).click();
  await expect(page.getByText(/PW-MACHINE-A:/)).toBeVisible();
  await expect(page.getByText(/PW-MACHINE-B:/)).toBeVisible();

  await page.getByRole('button', { name: 'Start revision' }).click();
  const revisionDialog = page.getByRole('dialog', { name: 'Start immutable revision' });
  await revisionDialog.getByLabel('Title', { exact: true }).fill('B07 multi-machine document revision 2');
  await revisionDialog.getByLabel('Immutable revision identity', { exact: true }).fill(`sha256:${'2'.repeat(64)}`);
  await revisionDialog.getByRole('button', { name: 'Save governed revision' }).click();
  await page.getByRole('button', { name: 'Compare with current' }).click();
  await expect(page.getByRole('table')).toContainText('immutableRevisionIdentity');
  await page.getByRole('button', { name: 'Supersede predecessor' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.locator('.history')).toContainText('SUPERSEDED');
  await expect(page.locator('.history li')).toHaveCount(2);
});

test('exports and atomically restores the isolated registry through the interface', async ({ page }) => {
  const before = await page.locator('.resource-card').count();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  await page.locator('#import-registry').setInputFiles(downloadPath);
  await expect(page.getByRole('dialog', { name: 'Confirm transition' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirm' }).click();
  await expect(page.getByText('Validated synthetic archive restored.')).toBeVisible();
  await expect(page.locator('.resource-card')).toHaveCount(before);
});

test('supports keyboard navigation and has no detectable WCAG A/AA violations', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#workspace')).toBeFocused();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
  await page.getByRole('button', { name: 'New draft' }).click();
  const dialogResults = await new AxeBuilder({ page }).include('#resource-dialog').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(dialogResults.violations).toEqual([]);
});

test('protects unsaved changes and confirms consequential transitions', async ({ page }) => {
  await page.locator('.resource-card').first().click();
  await page.getByRole('button', { name: 'Start revision' }).click();
  await page.getByRole('dialog', { name: 'Start immutable revision' }).getByLabel('Title', { exact: true }).fill('Changed but not saved');
  page.once('dialog', async (dialog) => { expect(dialog.message()).toContain('Discard unsaved changes'); await dialog.dismiss(); });
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(page.getByRole('dialog', { name: 'Start immutable revision' })).toBeVisible();
  page.once('dialog', async (dialog) => { await dialog.accept(); });
  await page.getByRole('button', { name: 'Close dialog' }).click();
  await expect(page.getByRole('dialog', { name: 'Start immutable revision' })).toBeHidden();
  await page.getByRole('button', { name: 'Retire' }).click();
  await expect(page.getByRole('dialog', { name: 'Confirm transition' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
});
