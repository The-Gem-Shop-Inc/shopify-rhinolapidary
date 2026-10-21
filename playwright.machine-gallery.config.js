const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({ testDir: './tests', testMatch: 'epic-f-gallery.spec.js',
  outputDir: 'test-results/epic-f/f3/gallery-artifacts', workers: 1, timeout: 45000,
  reporter: [['list'], ['json', { outputFile: 'test-results/epic-f/f3/gallery-playwright.json' }]],
  use: { browserName: 'chromium', trace: 'retain-on-failure' } });

