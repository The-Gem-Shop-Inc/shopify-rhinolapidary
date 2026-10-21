const { test, expect, chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const AxeBuilder = require('@axe-core/playwright').default;
const { mount } = require('../scripts/lib/epic-f-machine-fixtures');

test('Chromium actual browser zoom to 200% reflows the machine shell', async ({}, testInfo) => {
  // Chromium's tabs.setZoom changes browser zoom/layout viewport. CDP
  // setPageScaleFactor is pinch zoom and is deliberately not used as evidence.
  const extension = testInfo.outputPath('zoom-extension');
  fs.mkdirSync(extension, { recursive: true });
  fs.writeFileSync(path.join(extension, 'manifest.json'), JSON.stringify({ manifest_version: 3, name: 'Local F2 zoom evidence', version: '1.0', permissions: ['tabs'], background: { service_worker: 'worker.js' } }));
  fs.writeFileSync(path.join(extension, 'worker.js'), 'chrome.runtime.onInstalled.addListener(() => {});');
  const context = await chromium.launchPersistentContext(testInfo.outputPath('profile'), {
    channel: 'chromium', headless: true, viewport: null,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`, '--window-size=1280,1000'],
  });
  try {
    const worker = context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
    const page = await context.newPage();
    await mount(page, 'tracked-available', { long: true });
    const before = await page.evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio }));
    const zoom = await worker.evaluate(async () => {
      const tab = (await chrome.tabs.query({})).find(t => t.url.startsWith('http://machine.local/'));
      await chrome.tabs.setZoom(tab.id, 2);
      return chrome.tabs.getZoom(tab.id);
    });
    expect(zoom).toBe(2);
    await expect.poll(() => page.evaluate(() => innerWidth)).toBeLessThanOrEqual(before.width / 2 + 1);
    const after = await page.evaluate(() => ({ width: innerWidth, dpr: devicePixelRatio, scrollWidth: document.documentElement.scrollWidth }));
    expect(after.dpr).toBe(before.dpr * 2);
    expect(after.scrollWidth).toBeLessThanOrEqual(after.width + 1);
    await expect(page.locator('.rhino-machine-contact')).toBeVisible();
    const axe = await new AxeBuilder({ page }).include('main').analyze();
    expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
    await testInfo.attach('actual-browser-zoom', { body: JSON.stringify({ method: 'chrome.tabs.setZoom', zoom, before, after }), contentType: 'application/json' });
  } finally { await context.close(); }
});
