'use strict';

const {defineConfig, devices} = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  testMatch: 'epic-o-native-account.spec.js',
  outputDir: 'test-results/epic-o-native-account',
  timeout: 30_000,
  expect: {timeout: 5_000},
  reporter: [['list']],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {name: 'synthetic-chromium', use: {...devices['Desktop Chrome']}},
  ],
});
