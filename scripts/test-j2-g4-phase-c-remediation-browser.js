'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const cartFixtures = require('./lib/epic-j-cart-fixtures');
const { engine, normalize, contextFor, themeStyle } = require('./lib/epic-f-machine-fixtures');

const OUTPUT_DIR = process.env.J2_G4_PHASE_C_BROWSER_EVIDENCE_DIR || 'test-results/j2-g4-phase-c';
const WIDTHS = [320, 390, 768, 1024, 1440];

function makeEngine(context) {
  const liquid = engine(context);
  const locale = JSON.parse(fs.readFileSync('locales/en.default.json', 'utf8'));
  liquid.registerFilter('t', (key, ...args) => {
    let value = key.split('.').reduce((current, part) => current?.[part], locale) || key;
    const named = Object.fromEntries(args.filter(Array.isArray));
    if (typeof value === 'object') value = value[Number(named.count) === 1 ? 'one' : 'other'];
    for (const [name, replacement] of Object.entries(named)) value = value.replaceAll(new RegExp(`{{\\s*${name}\\s*}}`, 'g'), String(replacement));
    return value;
  });
  return liquid;
}

function facetContext() {
  const context = contextFor('tracked-available');
  const longLabel = 'Extraordinarily long governed Product classification label that must wrap without clipping';
  const productType = {
    label: longLabel,
    type: 'list',
    presentation: 'text',
    param_name: 'filter.p.product_type',
    operator: 'OR',
    url_to_remove: '?sort_by=created-descending',
    active_values: [{ label: longLabel, url_to_remove: '?sort_by=created-descending' }],
    values: [
      { label: longLabel, value: 'Machine', count: 999999, active: true, param_name: 'filter.p.product_type' },
      { label: 'Accessory', value: 'Accessory', count: 0, active: false, param_name: 'filter.p.product_type' },
    ],
  };
  Object.assign(context, {
    results: {
      id: 'fixture-collection', handle: 'all', url: '/collections/all', products_count: 999999,
      all_products_count: 999999, filters: [productType], sort_by: 'created-descending', default_sort_by: 'manual',
      sort_options: [{ name: 'Featured', value: 'manual' }, { name: 'Recently Added with a long label', value: 'created-descending' }],
    },
    enable_filtering: true,
    enable_sorting: true,
    filter_type: 'horizontal',
    paginate: { pages: 1 },
    template: { name: 'collection' },
  });
  return context;
}

function facetDocument() {
  const context = facetContext();
  const fragment = makeEngine(context).parseAndRenderSync(normalize(fs.readFileSync('snippets/facets.liquid', 'utf8')), context);
  return `<!doctype html><html class="js" lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  ${themeStyle(context)}
  <link rel="stylesheet" href="/assets/base.css"><link rel="stylesheet" href="/assets/component-facets.css"><link rel="stylesheet" href="/assets/component-menu-drawer.css">
  </head><body><header><div id="menu-drawer" class="menu-drawer"><div class="menu-drawer__inner-container"><nav class="menu-drawer__navigation"><a class="menu-drawer__menu-item" href="#catalog">Catalog with a deliberately long accessible label</a><div id="link-catalog" class="menu-drawer__submenu"><a class="menu-drawer__menu-item" href="#machines">Machines</a></div></nav></div></div></header>
  <main><aside id="main-collection-filters">${fragment}</aside><div id="ProductGridContainer"><ul id="product-grid"><li>Fixture Product</li></ul></div></main>
  <script src="/assets/global.js"></script><script src="/assets/facets.js"></script></body></html>`;
}

async function mountFacetPage(page) {
  const html = facetDocument();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.route('http://phase-c.local/**', (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/assets/')) {
      const file = `.${url.pathname}`;
      return route.fulfill({ body: fs.readFileSync(file), contentType: file.endsWith('.js') ? 'text/javascript' : 'text/css' });
    }
    return route.fulfill({ body: html, contentType: 'text/html' });
  });
  await page.goto('http://phase-c.local/collections/all');
  return errors;
}

async function overflowMetrics(page) {
  return page.evaluate(() => {
    const viewport = document.documentElement.clientWidth;
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      let hiddenByClosedDetails = false;
      for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
        if (ancestor.tagName !== 'DETAILS' || ancestor.open) continue;
        const summary = ancestor.querySelector(':scope > summary');
        if (!summary?.contains(element)) { hiddenByClosedDetails = true; break; }
      }
      return !hiddenByClosedDetails && style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };
    const offenders = [...document.querySelectorAll('body *')].filter(visible).map((element) => {
      const rect = element.getBoundingClientRect();
      return { selector: element.id ? `#${element.id}` : element.className || element.tagName, left: rect.left, right: rect.right, width: rect.width };
    }).filter((entry) => entry.left < -1 || entry.right > viewport + 1);
    const drawer = document.querySelector('#menu-drawer').getBoundingClientRect();
    const desktop = document.querySelector('.facets.small-hide');
    const mobile = document.querySelector('.mobile-facets__wrapper');
    return {
      viewport,
      scrollWidth: document.documentElement.scrollWidth,
      offenders,
      drawer: { left: drawer.left, right: drawer.right, width: drawer.width },
      desktopVisible: visible(desktop),
      mobileVisible: visible(mobile),
    };
  });
}

(async () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = { quote: {}, layout: [] };
  try {
    const quoteContext = await browser.newContext({ viewport: { width: 1024, height: 1000 } });
    const quotePage = await quoteContext.newPage();
    const quoteRuntime = await cartFixtures.mount(quotePage, { mixed: true });
    await quotePage.locator('rhino-quote-mode').waitFor();
    assert.equal(await quotePage.locator('input[name="fulfillment_choice"]').count(), 2);
    assert.equal(await quotePage.locator('[aria-controls], input[aria-expanded]').count(), 0, 'native radios carry prohibited disclosure ARIA');
    assert.equal(await quotePage.locator('#RhinoShippingQuotePanel').isHidden(), true);
    assert.equal(await quotePage.locator('#RhinoPickupPanel').isHidden(), true);

    await quotePage.locator('#RhinoFulfillmentShipping').focus();
    await quotePage.keyboard.press('ArrowRight');
    assert.equal(await quotePage.locator('#RhinoFulfillmentPickup').isChecked(), true, 'native arrow-key radio navigation failed');
    assert.equal(await quotePage.locator('#RhinoPickupPanel').isVisible(), true);
    assert.equal(await quotePage.locator('#RhinoShippingQuotePanel').isHidden(), true);
    await quotePage.keyboard.press('ArrowLeft');
    assert.equal(await quotePage.locator('#RhinoFulfillmentShipping').isChecked(), true);
    assert.equal(await quotePage.locator('#RhinoShippingQuotePanel').isVisible(), true);
    assert.equal(await quotePage.locator('#RhinoPickupPanel').isHidden(), true);

    const idAudit = await quotePage.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      const brokenDescriptions = [...document.querySelectorAll('[aria-describedby]')].flatMap((element) => (
        element.getAttribute('aria-describedby').split(/\s+/).filter((id) => !document.getElementById(id))
      ));
      return { duplicateIds, brokenDescriptions };
    });
    assert.deepEqual(idAudit, { duplicateIds: [], brokenDescriptions: [] });
    const radioNames = await quotePage.locator('input[name="fulfillment_choice"]').evaluateAll((radios) => radios.map((radio) => ({
      name: document.querySelector(`label[for="${radio.id}"]`)?.textContent.trim(),
      description: radio.getAttribute('aria-describedby'),
    })));
    assert(radioNames.every((entry) => entry.name && entry.description), 'fulfillment radios need names and descriptions');
    const axe = await new AxeBuilder({ page: quotePage }).include('rhino-quote-mode').analyze();
    const severe = axe.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
    assert.deepEqual(severe, [], `quote accessibility failures: ${JSON.stringify(severe)}`);
    assert.equal(quoteRuntime.errors.length, 0, `quote runtime errors: ${quoteRuntime.errors.join('; ')}`);
    results.quote = { keyboard: 'PASS', panelVisibility: 'PASS', duplicateIds: 0, brokenAriaReferences: 0, seriousCriticalAxe: 0 };
    await quoteContext.close();

    for (const width of WIDTHS) {
      for (const mode of ['normal', 'text200', 'zoom200']) {
        const cssWidth = mode === 'zoom200' ? Math.max(160, Math.floor(width / 2)) : width;
        const page = await browser.newPage({ viewport: { width: cssWidth, height: 900 } });
        const pageErrors = await mountFacetPage(page);
        if (mode === 'text200') await page.evaluate(() => { document.documentElement.style.fontSize = '125%'; });
        await page.waitForTimeout(50);
        const metrics = await overflowMetrics(page);
        assert(metrics.scrollWidth <= metrics.viewport + 1, `${width}/${mode}: document ${metrics.scrollWidth}px exceeds ${metrics.viewport}px`);
        assert.equal(metrics.offenders.length, 0, `${width}/${mode}: visible overflow ${JSON.stringify(metrics.offenders)}`);
        assert(metrics.drawer.width <= metrics.viewport + 1, `${width}/${mode}: offcanvas drawer ${metrics.drawer.width}px exceeds viewport`);
        if (metrics.viewport >= 750 && metrics.viewport <= 989) {
          assert.equal(metrics.desktopVisible, false, `${width}/${mode}: tablet desktop facets should transition away`);
          assert.equal(metrics.mobileVisible, true, `${width}/${mode}: tablet mobile facets disclosure must be available`);
        } else if (metrics.viewport >= 990) {
          assert.equal(metrics.desktopVisible, true, `${width}/${mode}: desktop facets must remain available`);
        }
        if (metrics.mobileVisible) {
          const disclosure = page.locator('summary.mobile-facets__open-wrapper');
          await page.locator('body').click({ position: { x: 1, y: 1 } });
          for (let index = 0; index < 6 && !(await disclosure.evaluate((element) => element === document.activeElement)); index += 1) {
            await page.keyboard.press('Tab');
          }
          assert.equal(await disclosure.evaluate((element) => element === document.activeElement), true, 'mobile facet disclosure is not keyboard reachable');
          const focusStyle = await disclosure.evaluate((element) => {
            const style = getComputedStyle(element);
            return { outline: style.outlineStyle, outlineWidth: style.outlineWidth, boxShadow: style.boxShadow };
          });
          assert(focusStyle.outline !== 'none' || focusStyle.boxShadow !== 'none', `mobile facet focus is not visible: ${JSON.stringify(focusStyle)}`);
          await page.keyboard.press('Enter');
          assert.equal(await page.locator('.mobile-facets__disclosure').getAttribute('open') !== null, true, 'mobile facets did not open from keyboard');
          await page.keyboard.press('Escape');
        } else {
          const sort = page.locator('#SortBy');
          await sort.focus();
          await sort.selectOption('manual');
          assert.equal(await sort.inputValue(), 'manual');
        }
        assert.equal(pageErrors.length, 0, `${width}/${mode}: browser errors ${pageErrors.join('; ')}`);
        results.layout.push({ physicalWidth: width, cssViewport: metrics.viewport, mode, scrollWidth: metrics.scrollWidth, visibleOverflow: 0, drawerWidth: metrics.drawer.width, desktopFacets: metrics.desktopVisible, mobileFacets: metrics.mobileVisible });
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, 'phase-c-browser-results.json'), `${JSON.stringify({ passed: true, ...results }, null, 2)}\n`);
  console.log(`J2/G4 Phase C browser regressions passed: quote + ${results.layout.length} responsive cells.`);
})().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
