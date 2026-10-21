const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests', testMatch: /machine-.*\.spec\.js/,
  outputDir: 'test-results/epic-f/f2/browser', timeout: 60000,
  workers: 1, reporter: [['list'], ['json', { outputFile: 'test-results/epic-f/f2/playwright.json' }]],
  use: { browserName: 'chromium', headless: true, trace: 'retain-on-failure' },
});
