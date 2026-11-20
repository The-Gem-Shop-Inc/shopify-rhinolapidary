
const { test, expect } = require('@playwright/test');
const { gotoUnlocked } = require('./helpers/storefront');

const approvedMachines = [
    'em-1',
    'lapmaster-18',
    'sawmaster-18',
    'sawmaster-24',
    'trimmaster',
];

for (const handle of approvedMachines) {
    test(`${handle}: verified machine compatibility is browseable`, async ({ page }) => {
        await gotoUnlocked(
            page,
            `/products/${handle}`,
            `compatibility ${handle}`
        );

        const context = page.locator(
            'main product-info .rhino-machine-contextual'
        );

        const heading = context.locator(
            'h2[id^="OwnerContext-"]'
        );

        const cards = context.locator(
            'li[data-rhino-owner-compatible]'
        );

        const browse = page.locator(
            'main product-info a[data-rhino-machine-browse]'
        );

        await expect(context).toBeVisible();
        await expect(heading).toBeVisible();
        await expect(cards.first()).toBeVisible();
        await expect(browse).toBeVisible();

        const targetId = await heading.getAttribute('id');

        await expect(browse).toHaveAttribute(
            'href',
            `#${targetId}`
        );

        await browse.focus();
        await expect(browse).toBeFocused();
    });
}

test('machine without approved compatibility cards receives no browse link', async ({ page }) => {
    await gotoUnlocked(
        page,
        '/products/beadmaster',
        'unrelated machine'
    );

    await expect(
        page.locator('main product-info .rhino-machine-contextual')
    ).toHaveCount(0);

    await expect(
        page.locator('main product-info a[data-rhino-machine-browse]')
    ).toHaveCount(0);
});
