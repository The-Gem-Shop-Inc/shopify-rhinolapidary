const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: /epic-j-j2-collection-cart\.spec\.js/,
  outputDir: 'test-results/epic-j/j2-collection-cart',
  timeout: 60_000,
  workers: 1,
  reporter: [['list']],
  use: { headless: true, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 5'] } },
  ],
});
