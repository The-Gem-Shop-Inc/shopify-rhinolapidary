require('dotenv').config();

const { defineConfig, devices } = require('@playwright/test');

const previewUrl = process.env.PREVIEW_BASE_URL || process.env.PREVIEW_URL;

if (!previewUrl) {
    throw new Error('PREVIEW_BASE_URL or PREVIEW_URL must identify the Shopify preview storefront.');
}

const parsedPreviewUrl = new URL(previewUrl);

if (
    !process.env.PREVIEW_THEME_ID
    && !parsedPreviewUrl.searchParams.has('preview_theme_id')
) {
    throw new Error('PREVIEW_THEME_ID or preview_theme_id must identify the persistent unpublished preview theme.');
}

module.exports = defineConfig({
    testDir: './tests',
    timeout: 60_000,
    expect: {
        timeout: 10_000,
    },
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: parsedPreviewUrl.origin,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'desktop-chromium',
            use: {
                ...devices['Desktop Chrome'],
            },
        },
        {
            name: 'mobile-chromium',
            use: {
                ...devices['Pixel 5'],
            },
        },
        {
            name: 'desktop-webkit',
            use: {
                ...devices['Desktop Safari'],
            },
        },
    ],
});
