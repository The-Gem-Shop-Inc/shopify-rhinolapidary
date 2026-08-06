require('dotenv').config();

const { test, expect } = require('@playwright/test');
const {
    getFixture,
    gotoUnlocked,
} = require('./helpers/storefront');

test('homepage loads storefront shell', async ({ page }) => {
    await gotoUnlocked(page, '/', 'homepage');

    await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('body')).not.toContainText('404 Not Found');
    await expect(page.locator('body')).not.toContainText(/opening soon/i);
});

test('collection fixture loads product grid or empty collection state', async ({ page }) => {
    const fixture = getFixture('collection');

    await gotoUnlocked(page, fixture.path, 'collection');

    const productCardContainers = page.locator(
        '.card-wrapper:has(a[href*="/products/"]), li.grid__item:has(a[href*="/products/"])'
    );

    const emptyState = page.getByText(
        /no products|empty|try fewer filters|there are no products/i
    );

    const productCount = await productCardContainers.count();
    const emptyStateCount = await emptyState.count();

    expect(
        productCount > 0 || emptyStateCount > 0,
        [
            'Collection page did not expose product cards or a recognized empty state.',
            `URL: ${page.url()}`,
            `Product card containers found: ${productCount}`,
            `Empty-state matches found: ${emptyStateCount}`,
        ].join('\n')
    ).toBe(true);

    if (productCount > 0) {
        await expect(productCardContainers.first()).toBeVisible();
    }
});

test('search fixture loads search page', async ({ page }) => {
    const fixture = getFixture('search');

    await gotoUnlocked(page, fixture.path, 'search');

    await expect(page).toHaveURL(/\/search/);

    const mainContent = page.locator('#MainContent, main').first();

    await expect(mainContent).toContainText(/search/i);

    const visibleSearchInput = page
        .locator('#MainContent input[name="q"]:visible, main input[name="q"]:visible')
        .first();

    if ((await visibleSearchInput.count()) > 0) {
        await expect(visibleSearchInput).toBeVisible();
    } else {
        await expect(page.locator('input[name="q"]').first()).toBeAttached();
    }
});

test('product fixture has purchase-critical elements', async ({ page }) => {
    const fixture = getFixture('simpleProduct');

    await gotoUnlocked(page, fixture.path, 'simple product');

    await expect(page.locator('h1').first()).toBeVisible();

    const purchaseButton = page.getByRole('button', {
        name: /add to cart|sold out|unavailable/i,
    });

    await expect(purchaseButton.first()).toBeVisible();

    const priceText = page.locator('body').getByText(/\$\d/);
    await expect(priceText.first()).toBeVisible();
});

test('cart page loads', async ({ page }) => {
    await gotoUnlocked(page, '/cart', 'cart');

    await expect(page.locator('body')).toContainText(/cart/i);
});
