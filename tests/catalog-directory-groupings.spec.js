
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
