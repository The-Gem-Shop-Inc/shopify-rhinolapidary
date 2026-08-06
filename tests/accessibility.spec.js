require('dotenv').config();

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const {
    gotoUnlocked,
    storefrontUrl,
} = require('./helpers/storefront');

test.setTimeout(90_000);

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

for (const route of routes) {
    test(`${route.name} has no serious or critical axe violations`, async ({ page }) => {
        const targetUrl = storefrontUrl(route.path);
        const result = await gotoUnlocked(page, route.path, route.name);
        const response = result.response;

        const status = response?.status();
        const finalUrl = page.url();
        const title = await page.title();
        const bodyPreview = await page.locator('body').innerText().catch(() => '');

        expect(
            status,
            [
                `${route.name} returned HTTP ${status}`,
                `Target URL: ${targetUrl}`,
                `Final URL: ${finalUrl}`,
                `Title: ${title}`,
                `Body preview: ${bodyPreview.slice(0, 300)}`,
            ].join('\n')
        ).toBeLessThan(400);

        await page.waitForLoadState('load', {
            timeout: 30_000,
        }).catch(() => {});

        await page.evaluate(async () => {
            if (document.fonts?.ready) {
                await document.fonts.ready;
            }
        }).catch(() => {});

        await expect(page.locator('html')).toHaveAttribute('lang', /.+/);
        await expect(page).toHaveTitle(/.+/);

        const results = await new AxeBuilder({ page })
            // Shopify injects this iframe into unpublished theme previews.
            // It is not part of the Rhino Lapidary theme and cannot be fixed in this repo
            .exclude('#PBarNextFrame')
            .analyze();

        const blockingViolations = results.violations.filter((violation) =>
            ['serious', 'critical'].includes(violation.impact)
        );

        expect(
            blockingViolations,
            JSON.stringify(blockingViolations, null, 2)
        ).toEqual([]);
    });
}
