
const { test, expect } = require('@playwright/test');
const { gotoUnlocked } = require('./helpers/storefront');

test('catalog navigation supports populated and pending categories', async ({ page }) => {
    await gotoUnlocked(page, '/collections/all', 'catalog navigation');

    const nav = page.locator('[data-rhino-g-catalog-navigation]');
    await expect(nav).toBeVisible();

    const categories = [
        'All Products',
        'Machines',
        'Replacement Parts',
        'Consumables',
        'Accessories',
    ];

    for (const name of categories) {
        const link = nav.getByRole('link', { name, exact: true });

        await expect(link).toBeVisible();

        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();

        const target = new URL(href, page.url());

        expect(target.origin).toBe(new URL(page.url()).origin);
        expect(target.pathname).toMatch(/^\/collections(?:\/|$)/);

        await link.focus();
        await expect(link).toBeFocused();
    }

    const complete = await nav.getAttribute(
        'data-rhino-catalog-complete'
    );

    expect(['true', 'false']).toContain(complete);

    const directory = nav.getByRole('link', {
        name: 'Browse the text Product directory',
        exact: true,
    });

    if (complete === 'true') {
        await expect(directory).toHaveCount(0);

        for (const name of [
            'Replacement Parts',
            'Consumables',
            'Accessories',
        ]) {
            const href = await nav.getByRole('link', {
                name,
                exact: true,
            }).getAttribute('href');

            const target = new URL(href, page.url());
            expect(target.searchParams.get('view')).not.toBe('directory');
        }
    } else {
        await expect(directory).toBeVisible();
    }

    const overflow = await nav.evaluate(
        element => element.scrollWidth > element.clientWidth + 1
    );

    expect(overflow).toBe(false);
});