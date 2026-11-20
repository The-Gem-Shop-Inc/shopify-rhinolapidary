
const { test, expect } = require('@playwright/test');
const { gotoUnlocked } = require('./helpers/storefront');

test('approved Product groups are available in the directory', async ({ page }) => {
    await gotoUnlocked(
        page,
        '/collections/all?view=directory',
        'Epic G directory'
    );

    const directory = page.locator('[data-rhino-g-catalog]');

    await expect(directory).toBeVisible();
    await expect(directory).toHaveAttribute('data-governed', 'true');

    for (const role of [
        'replacement_part',
        'consumable',
        'accessory',
    ]) {
        const group = directory.locator(
            `section[data-role="${role}"]`
        );

        await expect(group).toBeVisible();
        await expect(group.getByRole('link').first()).toBeVisible();
    }
});


test('machine directory shortcuts resolve to native product pages', async ({ page }) => {
    await gotoUnlocked(
        page,
        '/collections/all?view=directory',
        'Machine directory shortcuts'
    );

    const section = page.locator(
        '[data-rhino-g-catalog] section[aria-labelledby="g-machine-context"]'
    );

    await expect(section).toBeVisible();

    const links = section.locator('a[data-g-machine]');

    const handles = [
        'em-1',
        'lapmaster-18',
        'sawmaster-18',
        'sawmaster-24',
        'trimmaster',
    ];

    await expect(links).toHaveCount(handles.length);

    for (const handle of handles) {
        await expect(
            links.locator(`[href="/products/${handle}"]`)
        ).toBeVisible();
    }

    for (const link of await links.all()) {
        const href = await link.getAttribute('href');

        expect(href).not.toContain('#');
        expect(href).toMatch(/^\/products\/[a-z0-9-]+$/);
    }
});