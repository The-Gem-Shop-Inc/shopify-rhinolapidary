require('dotenv').config();

const { defineConfig, devices } = require('@playwright/test');

if (!process.env.PREVIEW_BASE_URL) {
    throw new Error('PREVIEW_BASE_URL must identify the Shopify preview storefront.');
}

if (!process.env.PREVIEW_THEME_ID) {
    throw new Error('PREVIEW_THEME_ID must identify the persistent unpublished preview theme.');
}

module.exports = defineConfig({
    testDir: './tests',
    timeout: 60_000,
    expect: {
        timeout: 10_000,
    },
    reporter: [['list'], ['html', { open: 'never' }]],
    use: {
        baseURL: process.env.PREVIEW_BASE_URL,
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