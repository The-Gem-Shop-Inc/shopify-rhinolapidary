'use strict';

const { defineConfig } = require('@playwright/test');
const os = require('node:os');
const path = require('node:path');

const dataFile = path.join(os.tmpdir(), `rhino-b07c-playwright-${process.pid}.json`);

module.exports = defineConfig({
  testDir: './tests',
  testMatch: 'epic-l-policy2-b07c-usability.spec.js',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:4178', browserName: 'chromium', headless: true, trace: 'retain-on-failure' },
  webServer: {
    command: `node server/epic-l-policy2-resource-admin/server.js --synthetic --port 4178 --data-file "${dataFile}"`,
    url: 'http://127.0.0.1:4178', reuseExistingServer: false, timeout: 20_000,
  },
  reporter: [['list']],
});
