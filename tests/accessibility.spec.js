require('dotenv').config();

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

if (!process.env.PREVIEW_URL) {
    throw new Error('PREVIEW_URL must be set to the full Shopify storefront preview URL.');
}

function storefrontUrl(path) {
    const base = new URL(process.env.PREVIEW_URL);
    const target = new URL(path, base.origin);

    // Preserve preview/session params from Shopify's preview URL.
    for (const [key, value] of base.searchParams.entries()) {
        if (!target.searchParams.has(key)) {
            target.searchParams.set(key, value);
        }
    }

    return target.toString();
}

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
    const response = await page.goto(storefrontUrl('/'));

    expect(
        response?.status(),
        `Preview homepage returned HTTP ${response?.status()} at ${page.url()}`
    ).toBeLessThan(400);

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
    test(`${route.name} has no serious or critical axe violations`, async ({ page }) => {
        const targetUrl = storefrontUrl(route.path);
        const response = await page.goto(targetUrl);

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

        await page.waitForLoadState('networkidle');

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