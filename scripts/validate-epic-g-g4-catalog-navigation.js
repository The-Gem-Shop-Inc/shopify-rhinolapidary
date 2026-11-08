'use strict';

const assert = require('node:assert/strict');
const cp = require('node:child_process');
const fs = require('node:fs');

const BASE = 'origin/feat/epic-l-l1a-foundation';
const BRANCH = 'epic-g/g4-photo-catalog-navigation';
const J2 = 'epic-j/j2-collection-cart-feedback';

const read = (file) => fs.readFileSync(file, 'utf8');
const git = (...args) => cp.execFileSync('git', args, { encoding: 'utf8' }).trim();
const normalized = (value) => value.replace(/\r\n/g, '\n').trimEnd();

function changedFiles() {
  return git('status', '--porcelain')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/\\/g, '/'));
}

function j2Files() {
  return git('diff', '--name-only', `${BASE}...${J2}`).split(/\r?\n/).filter(Boolean);
}

function simulateJ2SectionIntegration(section) {
  const bulkScript = '  <script src="{{ \'quick-add-bulk.js\' | asset_url }}" defer="defer"></script>';
  assert(section.includes(bulkScript), 'G4 must retain the native bulk quick-add script location');
  let integrated = section.replace(
    bulkScript,
    `  {{ 'component-cart-feedback-toast.css' | asset_url | stylesheet_tag }}\n  <script src="{{ 'cart-feedback-toast.js' | asset_url }}" defer="defer"></script>\n${bulkScript}`,
  );
  const schema = '{% schema %}';
  assert(integrated.includes(schema), 'Collection section schema boundary missing');
  integrated = integrated.replace(
    schema,
    `{%- if section.settings.quick_add == 'bulk' -%}\n  {% render 'cart-feedback-toast', color_scheme: section.settings.color_scheme %}\n{%- endif -%}\n\n${schema}`,
  );
  return integrated;
}

function validateSectionSchema(file) {
  const source = read(file);
  const match = source.match(/{% schema %}([\s\S]*?){% endschema %}/);
  assert(match, `${file} is missing a section schema`);
  const schema = JSON.parse(match[1]);
  const ids = (schema.settings || []).map(({ id }) => id).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length, `${file} has duplicate section setting IDs`);
  const blockTypes = (schema.blocks || []).map(({ type }) => type);
  assert.equal(new Set(blockTypes).size, blockTypes.length, `${file} has duplicate block types`);
  for (const block of schema.blocks || []) {
    const blockIds = (block.settings || []).map(({ id }) => id).filter(Boolean);
    assert.equal(new Set(blockIds).size, blockIds.length, `${file} block ${block.type} has duplicate setting IDs`);
  }
}

function validate() {
  assert.equal(git('branch', '--show-current'), BRANCH, 'Wrong G4 branch');
  const ancestor = cp.spawnSync('git', ['merge-base', '--is-ancestor', BASE, 'HEAD']);
  assert.equal(ancestor.status, 0, 'Foundation is not an ancestor of G4');

  const section = read('sections/main-collection-product-grid.liquid');
  for (const file of [
    'sections/main-collection-product-grid.liquid',
    'sections/rhino-g-catalog-navigation.liquid',
    'sections/rhino-g-catalog-directory.liquid',
  ]) validateSectionSchema(file);
  assert(!section.includes('rhino_g_index'), 'Default catalog must not substitute the text directory');
  assert(section.includes('paginate collection.products by section.settings.products_per_page'));
  assert(section.includes("render 'card-product'"), 'Default catalog must render Product cards');
  assert(section.includes("render 'facets'"), 'Default catalog must retain native filtering');
  assert(section.includes('collection.sort_options'), 'Default catalog must retain native sorting');
  assert(section.includes("'quick-add-bulk.js'"), 'Default catalog must retain bulk quick-add');
  assert(!section.includes('sort_by=title-ascending'), 'sort_by must not act as a view selector');
  assert(!section.includes('view=directory'), 'The primary grid must not be gated by the directory view');

  const collection = JSON.parse(read('templates/collection.json'));
  assert.deepEqual(collection.order, ['banner', 'catalog-navigation', 'product-grid']);
  assert.equal(collection.sections['product-grid'].settings.products_per_page, 20);
  assert.equal(collection.sections['product-grid'].settings.quick_add, 'bulk');
  assert.equal(collection.sections['product-grid'].settings.enable_filtering, true);
  assert.equal(collection.sections['product-grid'].settings.enable_sorting, true);

  const directory = JSON.parse(read('templates/collection.directory.json'));
  assert.deepEqual(directory.order, ['banner', 'catalog-navigation', 'product-directory']);
  assert(!Object.values(directory.sections).some(({ type }) => type === 'main-collection-product-grid'));
  const directorySection = read('sections/rhino-g-catalog-directory.liquid');
  assert(directorySection.includes('paginate collection.products by 150'));
  assert(directorySection.includes("render 'rhino-g-catalog-index'"));

  const navigation = read('sections/rhino-g-catalog-navigation.liquid');
  for (const label of ['All Products', 'Machines', 'Replacement Parts', 'Consumables', 'Accessories']) {
    assert(navigation.includes(`>${label}</a>`), `Missing catalog navigation label ${label}`);
  }
  assert(navigation.includes('href="{{ routes.collections_url }}/machines"'));
  for (const fragment of ['g-replacement-parts', 'g-consumables', 'g-accessories']) {
    assert(navigation.includes(`?view=directory#${fragment}`));
  }
  for (const forbidden of ['/collections/replacement-parts', '/collections/parts', '/collections/consumables', '/collections/accessories', '/collections/em-1-parts']) {
    assert(!navigation.includes(forbidden), `Unverified runtime collection route ${forbidden}`);
  }

  const index = read('snippets/rhino-g-catalog-index.liquid');
  assert(index.includes('?view=directory&amp;page='));
  assert(index.includes('View all Products with photos'));
  assert(!index.includes('sort_by=title-ascending'));

  const header = read('snippets/header-mega-menu.liquid');
  const drawer = read('snippets/header-drawer.liquid');
  for (const source of [header, drawer]) {
    assert(source.includes('data-rhino-g-catalog-entry'));
    assert(source.includes('g_catalog_existing'));
    assert(source.includes('>All Products</a>'));
  }

  const card = read('snippets/card-product.liquid');
  assert(card.includes("{% if rhino_card_media %} card--media{% else %} card--text{% endif %}"));
  assert(card.includes('StandardCardNoMediaLink-'), 'Missing-image text-card fallback must remain');
  assert(section.includes('collection--empty'), 'Empty collection fallback must remain');

  for (const protectedFile of [
    'snippets/rhino-g-catalog-authority.liquid',
    'assets/rhino-g-catalog.js',
    'assets/rhino-g-catalog.css',
    'assets/quick-add-bulk.js',
    'assets/quick-order-list.js',
    'snippets/card-product.liquid',
  ]) {
    assert.equal(normalized(read(protectedFile)), normalized(git('show', `${BASE}:${protectedFile}`)), `${protectedFile} changed unexpectedly`);
  }

  const plan = JSON.parse(read('data/epic-g-g4-catalog-navigation.json'));
  assert.equal(plan.catalog.primary.route, '/collections/all');
  assert.equal(plan.catalog.primary.viewSelector, null);
  assert.equal(plan.catalog.secondaryDirectory.route, '/collections/all?view=directory');
  assert.equal(plan.adminMenuPlan.execute, false);
  assert.equal(plan.adminMenuPlan.targetHandle, 'preview-primary-navigation-menu');
  assert.equal(plan.adminMenuPlan.productionHandle, 'main-menu');
  assert.equal(plan.adminMenuPlan.productionMutationAllowed, false);

  const intersection = changedFiles().filter((file) => j2Files().includes(file)).sort();
  assert.deepEqual(intersection, plan.j2Integration.sharedFiles.slice().sort(), 'G4/J2 shared-file ledger drift');

  const j2Section = git('show', `${J2}:sections/main-collection-product-grid.liquid`);
  for (const required of ['component-cart-feedback-toast.css', 'cart-feedback-toast.js', "render 'cart-feedback-toast'"]) {
    assert(j2Section.includes(required), `J2 section contract missing ${required}`);
  }
  assert(git('show', `${J2}:snippets/card-product.liquid`).includes('data-product-title='));
  const integrated = simulateJ2SectionIntegration(section);
  for (const required of [
    "render 'card-product'",
    'paginate collection.products by section.settings.products_per_page',
    'component-cart-feedback-toast.css',
    'cart-feedback-toast.js',
    "render 'cart-feedback-toast'",
    'quick-add-bulk.js',
    'quick-order-list.js',
  ]) {
    assert(integrated.includes(required), `Integrated catalog missing ${required}`);
  }
  assert(!integrated.includes('rhino_g_index'));

  return {
    branch: BRANCH,
    defaultCatalog: 'native-photographic-grid',
    directory: '/collections/all?view=directory',
    approvedCollectionLinks: ['/collections/all', '/collections/machines'],
    j2SharedFiles: intersection,
    changedFiles: changedFiles().length,
  };
}

if (require.main === module) {
  try {
    console.log(JSON.stringify(validate()));
  } catch (error) {
    console.error(error.stack);
    process.exitCode = 1;
  }
}

module.exports = { simulateJ2SectionIntegration, validate };
