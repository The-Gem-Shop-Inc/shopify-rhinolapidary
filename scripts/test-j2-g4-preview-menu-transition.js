'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { Liquid } = require('liquidjs');
const {
  countExactAllProducts,
  menuUpdateVariables,
  semanticDigest,
  validateDocument,
  validateLiveEvidence,
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

function liveEvidence(expectedState) {
  const proposed = expectedState === 'proposed';
  return {
    readOnly: true,
    shopifyMutations: 0,
    shop: { id: sourceDocument.shop.gid, myshopifyDomain: sourceDocument.shop.myshopifyDomain },
    previewTheme: { id: sourceDocument.target.previewTheme.gid, role: 'UNPUBLISHED' },
    productionTheme: { id: sourceDocument.target.protectedProductionTheme.gid, role: 'MAIN' },
    previewMenu: {
      id: sourceDocument.target.previewMenu.gid,
      handle: sourceDocument.target.previewMenu.handle,
      items: clone(proposed ? sourceDocument.recommendation.approvedProposedTree : sourceDocument.predecessor.tree),
    },
    previewThemeAssignment: {
      menuHandle: sourceDocument.target.previewMenu.handle,
      menuTypeDesktop: 'mega',
      checksumMd5: sourceDocument.evidence.previewHeaderGroupMd5,
    },
    productionMenu: {
      id: sourceDocument.target.protectedProductionMenu.gid,
      handle: sourceDocument.target.protectedProductionMenu.handle,
    },
    publishedLocales: [{ locale: 'en', published: true }],
    collections: sourceDocument.destinationResources.map(({ gid, handle }) => ({ id: gid, handle })),
    routeChecks: sourceDocument.recommendation.requiredRouteChecks.map((route) => ({
      route, status: 200, previewThemeId: sourceDocument.target.previewTheme.numericId, photographic: true,
    })),
    categoryAuthorityChecks: sourceDocument.categoryAuthority.map(({ label, route }) => ({
      label,
      route,
      status: 200,
      previewThemeId: sourceDocument.target.previewTheme.numericId,
      governed: false,
      categorizedSectionCount: 0,
      productLinkCount: 1,
      meaningfulCategorizedContent: false,
    })),
    duplicateSuppressionCurrentMenu: {
      desktop: { exactAllProductsCount: 1, injected: !proposed },
      mobile: { exactAllProductsCount: 1, injected: !proposed },
    },
  };
}

function expectLiveReject(name, expectedState, mutate, pattern) {
  test(name, () => {
    const evidence = liveEvidence(expectedState === 'invalid' ? 'proposed' : expectedState);
    mutate(evidence);
    assert.throws(() => validateLiveEvidence(sourceDocument, evidence, expectedState), pattern);
  });
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

test('predecessor desktop injected All Products passes live evidence validation', () => {
  const evidence = liveEvidence('predecessor');
  validateLiveEvidence(sourceDocument, evidence, 'predecessor');
  assert.equal(evidence.duplicateSuppressionCurrentMenu.desktop.injected, true);
});

test('predecessor mobile injected All Products passes live evidence validation', () => {
  const evidence = liveEvidence('predecessor');
  validateLiveEvidence(sourceDocument, evidence, 'predecessor');
  assert.equal(evidence.duplicateSuppressionCurrentMenu.mobile.injected, true);
});

test('proposed desktop explicit All Products passes live evidence validation', () => {
  const evidence = liveEvidence('proposed');
  validateLiveEvidence(sourceDocument, evidence, 'proposed');
  assert.equal(evidence.duplicateSuppressionCurrentMenu.desktop.injected, false);
});

test('proposed mobile explicit All Products passes live evidence validation', () => {
  const evidence = liveEvidence('proposed');
  validateLiveEvidence(sourceDocument, evidence, 'proposed');
  assert.equal(evidence.duplicateSuppressionCurrentMenu.mobile.injected, false);
});

expectLiveReject('predecessor rejects explicit rather than injected desktop All Products', 'predecessor', (evidence) => {
  evidence.duplicateSuppressionCurrentMenu.desktop.injected = false;
}, /false !== true/);

expectLiveReject('proposed rejects injected rather than explicit mobile All Products', 'proposed', (evidence) => {
  evidence.duplicateSuppressionCurrentMenu.mobile.injected = true;
}, /true !== false/);

expectLiveReject('live evidence rejects zero exact All Products links', 'proposed', (evidence) => {
  evidence.duplicateSuppressionCurrentMenu.desktop.exactAllProductsCount = 0;
}, /0 !== 1/);

expectLiveReject('live evidence rejects two exact All Products links', 'proposed', (evidence) => {
  evidence.duplicateSuppressionCurrentMenu.mobile.exactAllProductsCount = 2;
}, /2 !== 1/);

expectLiveReject('live evidence rejects an invalid expected state', 'invalid', () => {}, /Unknown expected state invalid/);

expectLiveReject('proposed live evidence rejects semantic menu drift', 'proposed', (evidence) => {
  evidence.previewMenu.items[1].items[1].title = 'Machines changed';
}, /Live proposed semantic digest drift/);

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
