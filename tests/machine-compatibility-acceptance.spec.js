
const { test, expect } = require('@playwright/test');
const { gotoUnlocked } = require('./helpers/storefront');

// These machines currently have published compatible products.
const populatedMachines = [
    'em-1',
    'trimmaster',
];

// These machines have approved relationships, but all referenced
// products are currently Draft. Do not expose those products.
const pendingMachines = [
    'lapmaster-18',
    'sawmaster-18',
    'sawmaster-24',
];

async function inspectMachine(page, handle) {
    await gotoUnlocked(
        page,
        `/products/${handle}`,
        `compatibility ${handle}`
    );

    return {
        context: page.locator(
            'main product-info .rhino-machine-contextual'
        ),
        cards: page.locator(
            'main product-info li[data-rhino-owner-compatible]'
        ),
        browse: page.locator(
            'main product-info a[data-rhino-machine-browse]'
        ),
    };
}

async function verifyPublishedCompatibility(page, handle) {
    const { context, cards, browse } =
        await inspectMachine(page, handle);

    await expect(context).toBeVisible();
    await expect(cards.first()).toBeVisible();
    await expect(browse).toBeVisible();

    const heading = context.locator('h2[id^="OwnerContext-"]');

    await expect(heading).toBeVisible();

    const targetId = await heading.getAttribute('id');

    await expect(browse).toHaveAttribute(
        'href',
        `#${targetId}`
    );

    for (const card of await cards.all()) {
        await expect(card.getByRole('link').first()).toBeVisible();
    }

    await browse.focus();
    await expect(browse).toBeFocused();
}

for (const handle of populatedMachines) {
    test(`${handle}: published compatible products are browseable`, async ({ page }) => {
        await verifyPublishedCompatibility(page, handle);
    });
}

for (const handle of pendingMachines) {
    test(`${handle}: unpublished compatible products are not exposed`, async ({ page }) => {
        const { context, cards, browse } =
            await inspectMachine(page, handle);

        await expect(context).toHaveCount(0);
        await expect(cards).toHaveCount(0);
        await expect(browse).toHaveCount(0);
    });
}

test('unrelated machine receives no invented compatibility', async ({ page }) => {
    const { context, cards, browse } =
        await inspectMachine(page, 'beadmaster');

    await expect(context).toHaveCount(0);
    await expect(cards).toHaveCount(0);
    await expect(browse).toHaveCount(0);
});
