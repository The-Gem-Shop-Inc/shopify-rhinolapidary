const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const routes = [
    {
        name: 'homepage',
        path: '/',
    },
    {
        name: 'collection',
        path: process.env.TEST_COLLECTION_PATH || '/collections/all',
    },
    {
        name: 'search',
        path: process.env.TEST_SEARCH_PATH || '/search?q=rhino',
    },
    {
        name: 'product',
        path: process.env.TEST_PRODUCT_PATH,
    },
    {
        name: 'cart',
        path: '/cart',
    },
    {
        name: 'contact',
        path: process.env.TEST_CONTACT_PATH || '/pages/contact',
    },
].filter(({ path }) => Boolean(path));

async function unlockStorefront(page) {
    await page.goto('/');

    const passwordInput = page.locator('input[name="password"]');

    if (!(await passwordInput.isVisible().catch(() => false))) {
        return;
    }

    const password = process.env.STOREFRONT_PASSWORD;

    if (!password) {
        throw new Error(
            'The storefront is password protected. Set STOREFRONT_PASSWORD before running accessibility tests.'
        );
    }

    await passwordInput.fill(password);
    await page.locator('button[type="submit"]').click();
    await page.waitForLoadState('networkidle');
}

test.beforeEach(async ({ page }) => {
    await unlockStorefront(page);
});

for (const route of routes) {
    test(`${route.name} has no serious or critical axe violations`, async ({
                                                                               page,
                                                                           }) => {
        await page.goto(route.path);
        await page.waitForLoadState('networkidle');

        const results = await new AxeBuilder({ page }).analyze();

        const blockingViolations = results.violations.filter((violation) =>
            ['serious', 'critical'].includes(violation.impact)
        );

        expect(
            blockingViolations,
            JSON.stringify(blockingViolations, null, 2)
        ).toEqual([]);
    });
}