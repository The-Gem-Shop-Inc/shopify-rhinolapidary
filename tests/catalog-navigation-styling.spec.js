const { test, expect } = require('@playwright/test');
const { gotoUnlocked } = require('./helpers/storefront');

test('catalog navigation remains accessible and usable', async ({ page }) => {
    await gotoUnlocked(page, '/collections/all', 'catalog navigation');

    const navigation = page.locator('[data-rhino-g-catalog-navigation]');

    await expect(navigation).toBeVisible();

    // These destinations constitute the catalog navigation contract.
    // Their appearance, spacing, colors, and layout are not prescribed.
    const requiredLinks = [
        'All Products',
        'Machines',
        'Replacement Parts',
        'Consumables',
        'Accessories',
        'Browse the text Product directory',
    ];

    for (const name of requiredLinks) {
        const link = navigation.getByRole('link', {
            name,
            exact: true,
        });

        // Required navigation must be available to customers.
        await expect(link).toBeVisible();

        // Links must have usable internal destinations.
        const href = await link.getAttribute('href');

        expect(href, `${name} must have a destination`).toBeTruthy();

        const destination = new URL(href, page.url());
        const storefront = new URL(page.url());

        expect(destination.origin, `${name} must remain on the storefront`).toBe(storefront.origin);
        expect(destination.pathname, `${name} must lead into the catalog`)
            .toMatch(/^\/collections(?:\/|$)/);

        // Keyboard users must be able to reach every link.
        await link.focus();
        await expect(link).toBeFocused();
    }

    // The navigation itself must not cause horizontal overflow.
    // This remains relevant regardless of its visual layout.
    const overflows = await navigation.evaluate((element) => {
        return element.scrollWidth > element.clientWidth + 1;
    });

    expect(overflows, 'Catalog navigation must not overflow horizontally').toBe(false);
})