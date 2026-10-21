'use strict';
const fs = require('node:fs');
const { chromium } = require('@playwright/test');
const { installPerformanceObservers, createNetworkRecorder } = require('./validate-brand-performance-budget');
const { startFixtureServer } = require('./lib/epic-f-gallery-fixtures');
const { resourceMetrics, mediansFor, evaluateRun, policyLimits } = require('./lib/epic-f-performance');
const budget = require('../data/brand-performance-budget.json');
const fixture = require('../tests/fixtures/epic-f-gallery.json');
const measured = value => ({ status: 'measured', value });
const schemaValidate = new (require('ajv/dist/2020'))({ strict: false, allErrors: true }).compile(require('../schemas/epic-f-performance-measurement.schema.json'));
async function collectSample(browser, state, profile = 'mobile', fixtureOptions = {}) {
  const viewport = { profile, width: profile === 'mobile' ? 390 : 1440, height: 900, deviceScaleFactor: 1 };
  const server = await startFixtureServer(state, fixtureOptions);
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  const recorder = await createNetworkRecorder(context, page);
  // External negative-fixture requests are fulfilled locally. No real provider
  // or Shopify traffic, and no payment/provider output is invented.
  await page.route(/http:\/\/[^/]+\.fixture\.invalid\//, route => route.fulfill({ body: route.request().resourceType() === 'script' ? '' : '<title>Fixture provider</title>', contentType: route.request().resourceType() === 'script' ? 'text/javascript' : 'text/html' }));
  await installPerformanceObservers(page);
  await recorder.session.send('Network.clearBrowserCache');
  await recorder.session.send('Network.setCacheDisabled', { cacheDisabled: true });
  recorder.start();
  try {
    const response = await page.goto(server.url, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(budget.runtime.settleMs);
    const raw = recorder.stop();
    const { summary, resources } = resourceMetrics(raw, server.origin);
    const dom = await page.evaluate(() => {
      const info = document.querySelector('product-info');
      const images = [...document.querySelectorAll('media-gallery img')];
      const scripts = [...document.scripts].filter(s => s.src);
      const productScripts = scripts.filter(s => /\/(?:product-info|product-form|media-gallery|product-modal)\.js/.test(s.src));
      const firstScreen = images.filter(i => { const r = i.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && r.right > 0; }).map(i => i.currentSrc);
      const visibleText = document.body.innerText;
      return { productId: info?.dataset.productId || null, template: info?.classList.contains('rhino-machine-shell') ? 'product.machine' : null,
        pageKind: info && document.querySelectorAll('main').length === 1 && document.querySelectorAll('h1').length === 1 ? 'product' : 'error',
        password: !!document.querySelector('form[action*="password"]'), challenge: /captcha|verify you are human|security challenge/i.test(visibleText),
        firstScreen, dimensionsValid: images.every(i => Number(i.getAttribute('width')) > 0 && Number(i.getAttribute('height')) > 0),
        secondaryLazy: [...document.querySelectorAll('.product__media-list > li:not(:first-child) img')].every(i => i.loading === 'lazy'),
        iframeCount: document.querySelectorAll('iframe').length, autoplayCount: document.querySelectorAll('video[autoplay],audio[autoplay],iframe[src*="autoplay=1"]').length,
        synchronousThirdPartyScripts: scripts.filter(s => new URL(s.src).origin !== location.origin && !s.defer && !s.async && s.type !== 'module').length,
        duplicateProductScripts: productScripts.length - new Set(productScripts.map(s => s.src)).size,
        performance: window.__rhinoPerformance || null };
    });
    const metrics = {
      ...Object.fromEntries(['lcpMs', 'cls', 'tbtMs'].map(name => [name, { status: dom.performance?.observations?.[name] || 'missing', value: dom.performance?.observations?.[name] === 'measured' ? dom.performance[name] : null }])),
      initialTransferBytes: measured(summary.totalTransferBytes), imageBytes: measured(summary.imageBytes), maxImageBytes: measured(summary.maxImageBytes),
      firstScreenMediaBytes: measured(resources.filter(r => dom.firstScreen.includes(r.url)).reduce((sum, r) => sum + r.bytes, 0)),
      requestCount: measured(summary.resourceCount), immediateVideoIframeCount: measured(dom.iframeCount), autoplayMediaCount: measured(dom.autoplayCount),
      thirdPartyScriptHostCount: measured(summary.thirdPartyScriptHosts.length), synchronousThirdPartyScriptCount: measured(dom.synchronousThirdPartyScripts),
    };
    const sample = { timestamp: new Date().toISOString(), fixtureOnly: true, galleryState: state,
      environment: { kind: 'local-fixture', theme: { id: null, name: null, verified: false }, providerOutput: 'not available in local Liquid adapter; native payment_terms unchanged' },
      identity: { requestedUrl: server.url, resolvedUrl: page.url(), requestedRoute: new URL(server.url).pathname, resolvedRoute: new URL(page.url()).pathname,
        productGid: dom.productId ? 'gid://shopify/Product/' + dom.productId : null, template: dom.template },
      navigation: { completed: !!response, status: response?.status() ?? null, pageKind: dom.pageKind, password: dom.password, challenge: dom.challenge },
      viewport, policy: { throttling: { id: 'none-local-fixture', cpuSlowdown: 1 }, cache: 'cold-no-store', settleMs: budget.runtime.settleMs, settlePolicy: 'load + document.fonts.ready + governed settle interval; no user interaction' },
      networkObservation: resources.every(r => r.completed && !r.failed) ? 'complete' : 'missing', resources, metrics,
      media: { dimensionsValid: dom.dimensionsValid, secondaryLazy: dom.secondaryLazy, firstScreenSources: dom.firstScreen }, duplicateProductScripts: dom.duplicateProductScripts,
      blockingMetric: 'sum of max(0,longtask.duration - 50) over observation window; established TBT proxy, not Lighthouse TBT',
    };
    if (['multiple', 'oversized-secondary'].includes(state)) {
      recorder.start();
      await page.locator('.thumbnail-list button').last().click();
      await page.waitForTimeout(budget.runtime.settleMs);
      const later = resourceMetrics(recorder.stop(), server.origin).resources;
      const allImages = [...resources, ...later].filter(r => r.type === 'Image');
      sample.secondaryInspection = { phase: 'after native thumbnail interaction; excluded from initial budget',
        observation: later.every(r => r.completed && !r.failed) ? 'complete' : 'missing', resources: later,
        maxImageBytes: Math.max(0, ...allImages.map(r => r.bytes)) };
    }
    return sample;
  } finally { await context.close(); await server.close(); }
}
async function main() {
  if (process.argv.slice(2).some(a => !['--smoke'].includes(a))) throw new Error('F3 runner permits local fixtures only; preview/release is deferred to 015B');
  const cases = process.argv.includes('--smoke') ? [['one', 'mobile', true], ['oversized-hero', 'mobile', false]] : [
    ...['zero', 'one', 'multiple', 'several', 'video'].flatMap(s => [[s, 'mobile', true], [s, 'desktop', true]]),
    ...['oversized-hero', 'oversized-secondary', 'eager-secondary', 'eager-video', 'autoplay', 'sync-third-party', 'duplicate-script', 'draft'].map(s => [s, 'mobile', false]),
  ];
  const browser = await chromium.launch();
  const results = [];
  try {
    for (const [state, profile, shouldPass] of cases) {
      const sample = await collectSample(browser, state, profile);
      const record = { schemaVersion: 1, stage: 'fixture-regression', requestedRuns: 1, samples: [sample],
        medians: Object.values(sample.metrics).every(m => typeof m.value === 'number') ? mediansFor([sample]) : null,
        aggregationLabel: 'single local fixture observation; not a release median' };
      const violations = evaluateRun(record);
      const schemaValid = schemaValidate(record);
      if (shouldPass && !schemaValid) violations.push('measurement schema: ' + JSON.stringify(schemaValidate.errors));
      const expectedViolation = { 'oversized-hero': 'maxImageBytes: budget', 'oversized-secondary': 'secondary image budget', 'eager-secondary': 'noncritical media eagerly', 'eager-video': 'immediateVideoIframeCount: budget', autoplay: 'autoplayMediaCount: budget', 'sync-third-party': 'synchronousThirdPartyScriptCount: budget', 'duplicate-script': 'duplicate Product script', draft: 'navigation failure' }[state];
      const expectedResult = shouldPass ? violations.length === 0 : violations.some(v => v.includes(expectedViolation));
      results.push({ state, profile, expected: shouldPass ? 'pass' : 'fail', expectedResult, schemaValid, violations, record });
      console.log(`${state}/${profile}: ${violations.length ? 'rejected' : 'passed'} (${expectedResult ? 'expected' : 'UNEXPECTED'}); ${JSON.stringify(sample.metrics)}${violations.length ? '\n  ' + violations.join('; ') : ''}`);
    }
  } finally { await browser.close(); }
  fs.mkdirSync('test-results/epic-f/f3', { recursive: true });
  const report = { scope: 'local-fixture-only', assessedAt: new Date().toISOString(), budgets: { mobile: policyLimits('mobile'), desktop: policyLimits('desktop') },
    results, exitCode: results.every(r => r.expectedResult) ? 0 : 1, previewRun: false, releaseCertification: false };
  fs.writeFileSync('test-results/epic-f/f3/performance-runtime.json', JSON.stringify(report, null, 2) + '\n');
  process.exitCode = report.exitCode;
}
if (require.main === module) main().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { collectSample };
