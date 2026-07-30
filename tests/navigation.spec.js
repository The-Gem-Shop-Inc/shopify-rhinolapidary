require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const {
    gotoUnlocked,
    unlockStorefront,
} = require('./helpers/storefront');

const navigationSpec = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data/navigation-spec.json'), 'utf8')
);

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
    await unlockStorefront(page);
});

for (const route of navigationSpec.routes.filter((item) => item.requiredForLaunch)) {
    test(`navigation route resolved: ${route.id}`, async ({ page }) => {
        await gotoUnlocked(page, route.path, route.id);

        await expect(page.locator('body')).not.toContainText('404 Not Found');
        await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
        await expect(page).toHaveTitle(/.+/);
    });
}