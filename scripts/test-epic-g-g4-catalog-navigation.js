'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { Liquid } = require('liquidjs');
const { validate } = require('./validate-epic-g-g4-catalog-navigation');

const tests = [];
function test(name, fn) {
  try {
    fn();
    tests.push({ name, passed: true });
  } catch (error) {
    tests.push({ name, passed: false, error: error.message });
    console.error(name, error.stack);
  }
}

const navigationSource = fs.readFileSync('sections/rhino-g-catalog-navigation.liquid', 'utf8').split('{% schema %}')[0];
const engine = new Liquid();
engine.registerFilter('asset_url', (value) => value);
engine.registerFilter('stylesheet_tag', (value) => `<link href="${value}" rel="stylesheet">`);

function renderNavigation({ handle = 'all', suffix = null } = {}) {
  return engine.parseAndRenderSync(navigationSource, {
    collection: { handle },
    routes: { all_products_collection_url: '/collections/all', collections_url: '/collections' },
    section: { id: 'fixture' },
    template: { suffix },
  });
}

test('G4 structural validator passes', () => validate());

test('default All Products navigation marks the photographic catalog current', () => {
  const html = renderNavigation();
  assert(html.includes('href="/collections/all"\n        aria-current="page"'));
  assert(!html.includes('href="/collections/all?view=directory"\n      aria-current="page"'));
});

test('directory and Machines expose distinct current destinations', () => {
  const directory = renderNavigation({ suffix: 'directory' });
  assert(directory.includes('href="/collections/all?view=directory"\n      aria-current="page"'));
  const machines = renderNavigation({ handle: 'machines' });
  assert(machines.includes('href="/collections/machines"\n        aria-current="page"'));
});

test('role navigation uses governed directory anchors, never invented collections', () => {
  const html = renderNavigation();
  for (const route of [
    '/collections/all?view=directory#g-replacement-parts',
    '/collections/all?view=directory#g-consumables',
    '/collections/all?view=directory#g-accessories',
  ]) assert(html.includes(route));
  for (const route of ['/collections/replacement-parts', '/collections/parts', '/collections/consumables', '/collections/accessories']) assert(!html.includes(route));
});

test('default template keeps native sort, filter, pagination, cards, empty state and bulk quantity controls', () => {
  const source = fs.readFileSync('sections/main-collection-product-grid.liquid', 'utf8');
  for (const contract of [
    'collection.sort_options',
    "render 'facets'",
    'paginate collection.products by section.settings.products_per_page',
    "render 'card-product'",
    'collection--empty',
    'quick-add-bulk.js',
    'quantity-popover.js',
  ]) assert(source.includes(contract));
  assert(!source.includes('rhino_g_index'));
});

test('missing image falls back to the existing named text card', () => {
  const source = fs.readFileSync('snippets/card-product.liquid', 'utf8');
  assert(source.includes('card--text'));
  assert(source.includes('StandardCardNoMediaLink-'));
  assert(source.includes('{{ card_product.title | escape }}'));
});

const result = { passed: tests.filter(({ passed }) => passed).length, failed: tests.filter(({ passed }) => !passed).length, tests };
console.log(JSON.stringify(result));
if (result.failed) process.exitCode = 1;
