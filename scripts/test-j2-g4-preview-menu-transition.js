'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { Liquid } = require('liquidjs');
const {
  countExactAllProducts,
  menuUpdateVariables,
  semanticDigest,
  validateDocument,
} = require('./lib/j2-g4-preview-menu-transition');
const { validate } = require('./validate-j2-g4-preview-menu-transition');

const sourceDocument = JSON.parse(fs.readFileSync('data/j2-g4-preview-menu-transition.json', 'utf8'));
const clone = (value) => structuredClone(value);
const tests = [];

function test(name, fn) {
  try {
    fn();
    tests.push({ name, passed: true });
  } catch (error) {
    tests.push({ name, passed: false, error: error.message });
  }
}

function expectReject(name, mutate, pattern) {
  test(name, () => {
    const fixture = clone(sourceDocument);
    mutate(fixture);
    assert.throws(() => validateDocument(fixture), pattern);
  });
}

function link(title, url, links = []) {
  return { title, url, handle: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'), links, current: false, child_active: false, levels: links.some((item) => item.links?.length) ? 2 : 1 };
}

const liquid = new Liquid({ strictFilters: false, strictVariables: false });
liquid.registerFilter('inline_asset_content', () => '');
liquid.registerFilter('t', (value) => value);

function renderMenu(file, catalogChildren) {
  let source = fs.readFileSync(file, 'utf8');
  if (file.endsWith('header-drawer.liquid')) {
    source = source.split('          <div class="menu-drawer__utility-links">')[0];
  }
  return liquid.parseAndRenderSync(source, {
    routes: { all_products_collection_url: '/collections/all' },
    section: {
      settings: {
        menu_type_desktop: 'mega',
        menu_color_scheme: 'scheme-1',
        enable_customer_avatar: false,
        menu: { links: [link('Catalog', '/collections', catalogChildren)] },
      },
    },
    shop: { customer_accounts_enabled: false },
    localization: { available_countries: [], available_languages: [] },
    settings: {},
  });
}

function exactAllHrefCount(html) {
  return (html.match(/href="\/collections\/all"/g) || []).length;
}

test('schema and semantic validator pass', () => validate());

test('current menu without All Products injects exactly one desktop and mobile entry', () => {
  const children = [link('Saws', '/collections/saws'), link('Laps', '/collections/flat-laps'), link('Shaping', '/collections/shaping')];
  for (const file of ['snippets/header-mega-menu.liquid', 'snippets/header-drawer.liquid']) {
    const html = renderMenu(file, children);
    assert.equal(exactAllHrefCount(html), 1);
    assert(html.includes('data-rhino-g-catalog-entry'));
  }
});

test('proposed explicit All Products suppresses injection and remains singular', () => {
  const children = [link('All Products', '/collections/all'), link('Machines', '/collections/machines')];
  for (const file of ['snippets/header-mega-menu.liquid', 'snippets/header-drawer.liquid']) {
    const html = renderMenu(file, children);
    assert.equal(exactAllHrefCount(html), 1);
    assert(!html.includes('data-rhino-g-catalog-entry'));
  }
});

test('nested Machines collections reveal the mobile parent-link limitation', () => {
  const machines = link('Machines', '/collections/machines', [
    link('Saws', '/collections/saws'),
    link('Laps', '/collections/flat-laps'),
    link('Shaping', '/collections/shaping'),
  ]);
  const desktop = renderMenu('snippets/header-mega-menu.liquid', [link('All Products', '/collections/all'), machines]);
  const mobile = renderMenu('snippets/header-drawer.liquid', [link('All Products', '/collections/all'), machines]);
  for (const route of ['/collections/machines', '/collections/saws', '/collections/flat-laps', '/collections/shaping']) assert(desktop.includes(`href="${route}"`));
  assert(!mobile.includes('href="/collections/machines"'));
  for (const route of ['/collections/saws', '/collections/flat-laps', '/collections/shaping']) assert(mobile.includes(`href="${route}"`));
});

test('approved flat preservation subset keeps every collection reachable on desktop and mobile', () => {
  const children = sourceDocument.recommendation.approvedProposedTree[1].items.map((item) => link(item.title, item.url));
  for (const file of ['snippets/header-mega-menu.liquid', 'snippets/header-drawer.liquid']) {
    const html = renderMenu(file, children);
    assert.equal(exactAllHrefCount(html), 1);
    for (const route of sourceDocument.recommendation.requiredRouteChecks) assert(html.includes(`href="${route}"`));
  }
});

test('directory query and fragment links do not suppress the exact All Products injection', () => {
  const children = [
    link('Replacement Parts', '/collections/all?view=directory#g-replacement-parts'),
    link('Consumables', '/collections/all?view=directory#g-consumables'),
    link('Accessories', '/collections/all?view=directory#g-accessories'),
  ];
  for (const file of ['snippets/header-mega-menu.liquid', 'snippets/header-drawer.liquid']) {
    const html = renderMenu(file, children);
    assert.equal(exactAllHrefCount(html), 1);
    assert(html.includes('g-replacement-parts'));
  }
});

test('approved menu creates exact menuUpdate variables and one All Products entry', () => {
  const variables = menuUpdateVariables(sourceDocument, sourceDocument.recommendation.approvedProposedTree);
  assert.equal(variables.id, 'gid://shopify/Menu/257402405061');
  assert.equal(variables.handle, 'preview-primary-navigation-menu');
  assert.equal(countExactAllProducts(variables.items), 1);
  assert.equal(semanticDigest(variables.items), sourceDocument.digests.proposedTreeSemanticSha256);
});

expectReject('duplicate destination URLs are rejected before rendering', (fixture) => {
  fixture.recommendation.approvedProposedTree[1].items.push({
    title: 'Duplicate catalog', type: 'HTTP', url: '/collections/all', resourceId: null, tags: [], items: [],
  });
}, /Duplicate menu destination|exact \/collections\/all/);

expectReject('unauthorized category semantic exception is rejected', (fixture) => {
  fixture.categoryAuthority[0].menuEligible = true;
}, /true !== false/);

expectReject('category labels cannot enter the approved tree while authority is expired', (fixture) => {
  fixture.recommendation.approvedProposedTree[1].items.push({
    title: 'Accessories', type: 'HTTP', url: '/collections/all?view=directory#g-accessories', resourceId: null, tags: [], items: [],
  });
}, /Accessories must remain outside|Expected values to be strictly deep-equal/);

expectReject('production menu targeting is rejected', (fixture) => {
  fixture.target.previewMenu.gid = 'gid://shopify/Menu/254120886469';
}, /257402405061/);

expectReject('wrong preview theme is rejected', (fixture) => {
  fixture.target.previewTheme.numericId = '158579622085';
}, /158631198917/);

expectReject('mutation authorization cannot be embedded in the planning artifact', (fixture) => {
  fixture.mutationAuthorized = true;
}, /true !== false/);

expectReject('rollback must remain the exact predecessor', (fixture) => {
  fixture.rollback.tree[1].items.pop();
}, /Rollback must restore/);

expectReject('fourth-level navigation is rejected', (fixture) => {
  fixture.recommendation.approvedProposedTree[1].items[2].items.push({
    title: 'Level three', type: 'HTTP', url: '/level-three', resourceId: null, tags: [], items: [
      { title: 'Too deep', type: 'HTTP', url: '/too-deep', resourceId: null, tags: [], items: [] },
    ],
  });
}, /at most three levels/);

const result = { passed: tests.filter(({ passed }) => passed).length, failed: tests.filter(({ passed }) => !passed).length, tests };
console.log(JSON.stringify(result));
if (result.failed) process.exitCode = 1;
