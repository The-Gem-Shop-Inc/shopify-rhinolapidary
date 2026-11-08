'use strict';

const assert = require('node:assert/strict');
const { createRepository } = require('./lib/j2-g4-validator-repository');

const FOUNDATION = '414288a16fe7123b06c3433f0063ba402fc35e83';
const J2 = '0edacc2799be0be8592b424799e2af2be5a1a165';
const G4 = 'a53daec8ffbbbdcd6c5acba1da7770fa23ec3a12';
const BRANCH = 'integration/catalog-cart-preview';
const SHARED = 'sections/main-collection-product-grid.liquid';
const INTEGRATION = '64ddfaadbcea98175940fd54d9cf198c443e39c3';

const normalize = (value) => String(value).replace(/\r\n/g, '\n').trimEnd();

function expectedCombinedSection(repository = createRepository()) {
  let source = repository.show(J2, SHARED);
  const prefix = `{%- assign rhino_g_index = false -%}\n{%- if collection.handle == 'all' and request.path == collection.url and current_tags == blank and collection.sort_by == blank and collection.products_count == collection.all_products_count -%}{%- assign rhino_g_index = true -%}{%- endif -%}\n{%- assign rhino_g_page_size = section.settings.products_per_page -%}\n{%- if rhino_g_index -%}\n{%- assign rhino_g_page_size = 150 -%}\n{{ 'rhino-g-catalog.css' | asset_url | stylesheet_tag }}\n<script src="{{ 'rhino-g-catalog.js' | asset_url }}" defer="defer"></script>\n{%- else -%}\n`;
  assert(source.startsWith(prefix), 'J2 predecessor no longer contains the governed G3B wrapper');
  source = source.slice(prefix.length);
  source = source.replace('\n{%- endif -%}\n{%- style -%}', '\n{%- style -%}');
  source = source.replace(
    `    {%- paginate collection.products by rhino_g_page_size -%}\n{%- if rhino_g_index -%}\n{%- render 'rhino-g-catalog-index', collection: collection, paginate: paginate -%}\n{%- else -%}`,
    '    {%- paginate collection.products by section.settings.products_per_page -%}',
  );
  source = source.replace('    {%- endif -%}\n{%- endpaginate -%}', '    {%- endpaginate -%}');
  return source;
}

function validateSchema(file, repository) {
  const match = repository.read(file).match(/{% schema %}([\s\S]*?){% endschema %}/);
  assert(match, `${file}: missing schema`);
  const schema = JSON.parse(match[1]);
  const ids = (schema.settings || []).map(({ id }) => id).filter(Boolean);
  assert.equal(new Set(ids).size, ids.length, `${file}: duplicate setting IDs`);
  const types = (schema.blocks || []).map(({ type }) => type);
  assert.equal(new Set(types).size, types.length, `${file}: duplicate block types`);
  for (const block of schema.blocks || []) {
    const blockIds = (block.settings || []).map(({ id }) => id).filter(Boolean);
    assert.equal(new Set(blockIds).size, blockIds.length, `${file}/${block.type}: duplicate setting IDs`);
  }
}

function validate({ repository = createRepository() } = {}) {
  assert.equal(repository.git('branch', '--show-current'), BRANCH, 'Wrong integration branch');
  assert(repository.commitExists(INTEGRATION), 'Immutable runtime integration commit is missing');
  assert(repository.isAncestor(INTEGRATION, 'HEAD'), 'Current branch does not descend from the immutable runtime integration commit');
  assert(repository.isAncestor(J2, 'HEAD'), 'J2 is not an ancestor');
  for (const commit of [FOUNDATION, J2, G4]) assert(repository.commitExists(commit), `${commit}: approved source commit is missing`);
  assert.equal(repository.git('config', '--get', 'core.longpaths'), 'true', 'Git long paths must remain enabled');
  assert.equal(repository.runtimeStatus(), '', 'Unexpected uncommitted theme runtime change');

  const j2Files = repository.files(`${FOUNDATION}...${J2}`);
  const g4Files = repository.files(`${FOUNDATION}...${G4}`);
  assert.deepEqual(j2Files.filter((file) => g4Files.includes(file)), [SHARED], 'Unexpected J2/G4 overlap');

  for (const file of j2Files.filter((file) => file !== SHARED)) {
    assert.equal(normalize(repository.read(file)), normalize(repository.show(J2, file)), `${file}: J2 source drift`);
  }
  for (const file of g4Files.filter((file) => file !== SHARED)) {
    assert.equal(normalize(repository.read(file)), normalize(repository.show(G4, file)), `${file}: G4 source drift`);
  }

  const section = repository.read(SHARED);
  assert.equal(normalize(section), normalize(expectedCombinedSection(repository)), 'Shared collection section is not the exact combined successor');
  assert(!section.includes('rhino_g_index'), 'Photographic catalog cannot be replaced by the text directory');
  for (const token of [
    "'component-cart-feedback-toast.css'",
    "'cart-feedback-toast.js'",
    "'quick-add-bulk.js'",
    "'quick-order-list.js'",
    "render 'cart-feedback-toast'",
    "render 'card-product'",
    "render 'facets'",
    'collection.sort_options',
    'paginate collection.products by section.settings.products_per_page',
  ]) assert(section.includes(token), `Shared section missing ${token}`);
  for (const token of ['component-cart-feedback-toast.css', 'cart-feedback-toast.js', "render 'cart-feedback-toast'"]) {
    assert.equal(section.split(token).length - 1, 1, `Shared section duplicates ${token}`);
  }

  assert(repository.read('snippets/card-product.liquid').includes('data-product-title="{{ card_product.title | escape }}"'));
  assert(repository.read('assets/quick-add-bulk.js').includes("document.querySelector('cart-feedback-toast')"));
  assert(repository.read('assets/quick-add-bulk.js').includes('CollectionCartCoordinator'));
  assert(repository.read('templates/collection.json').includes('"catalog-navigation"'));
  assert(repository.read('templates/collection.directory.json').includes('"product-directory"'));
  assert(repository.read('snippets/rhino-g-catalog-index.liquid').includes('?view=directory'));

  const english = JSON.parse(repository.read('locales/en.default.json'));
  const toastTranslations = english.sections?.cart_feedback;
  assert(toastTranslations, 'English cart feedback translations missing');
  const toastKeys = ['pending', 'added', 'updated', 'removed', 'rejected', 'uncertain', 'dismiss'];
  assert.deepEqual(Object.keys(toastTranslations), toastKeys);
  for (const key of toastKeys) assert.equal(typeof toastTranslations[key] === 'string' && toastTranslations[key].trim() !== '', true, `Empty cart feedback translation: ${key}`);
  for (const key of toastKeys) assert(repository.read('snippets/cart-feedback-toast.liquid').includes(`'sections.cart_feedback.${key}' | t`), `Toast does not bind translation: ${key}`);
  const toastSnippet = repository.read('snippets/cart-feedback-toast.liquid');
  assert(toastSnippet.includes('role="status"'));
  assert(toastSnippet.includes('aria-live="polite"'));
  assert(toastSnippet.includes('aria-atomic="true"'));
  const toastScript = repository.read('assets/cart-feedback-toast.js');
  assert(toastScript.includes("if (!customElements.get('cart-feedback-toast'))"));
  assert(toastScript.includes('if (!message) return;'), 'Empty toast messages must fail safely without an announcement');

  for (const file of [
    SHARED,
    'sections/rhino-g-catalog-navigation.liquid',
    'sections/rhino-g-catalog-directory.liquid',
  ]) validateSchema(file, repository);

  const manifestPath = 'data/j2-g4-preview-deployment-manifest.json';
  {
    const manifest = JSON.parse(repository.read(manifestPath));
    const expectedThemeFiles = [
      'assets/cart-feedback-toast.js',
      'assets/component-cart-feedback-toast.css',
      'assets/quick-add-bulk.js',
      'assets/quick-order-list.js',
      'locales/en.default.json',
      SHARED,
      'snippets/card-product.liquid',
      'snippets/cart-feedback-toast.liquid',
      'snippets/quick-order-list.liquid',
      'assets/rhino-g-catalog-navigation.css',
      'sections/rhino-g-catalog-directory.liquid',
      'sections/rhino-g-catalog-navigation.liquid',
      'snippets/header-drawer.liquid',
      'snippets/header-mega-menu.liquid',
      'snippets/rhino-g-catalog-index.liquid',
      'templates/collection.directory.json',
      'templates/collection.json',
    ];
    assert.equal(manifest.authorization.deploy, false);
    assert.equal(manifest.authorization.publish, false);
    assert.equal(manifest.authorization.shopifyAdminMutation, false);
    assert.equal(manifest.authorization.stage, false);
    assert.equal(manifest.authorization.commit, false);
    assert.equal(manifest.authorization.push, false);
    assert.equal(manifest.target.requiredRole, 'UNPUBLISHED');
    assert.equal(manifest.target.previouslyKnownPreviewThemeId, '158631198917');
    assert.equal(manifest.target.previouslyKnownProductionThemeId, '158579622085');
    assert.notEqual(manifest.target.previouslyKnownPreviewThemeId, manifest.target.previouslyKnownProductionThemeId);
    assert.equal(manifest.target.identityVerificationStatus, 'NOT_RUN_NO_SHOPIFY_READ_AUTHORIZED');
    assert.equal(manifest.target.productionThemeAllowed, false);
    assert.equal(manifest.target.productionMenuAllowed, false);
    assert.equal(manifest.uploadPolicy.fullThemePushAllowed, false);
    assert.equal(manifest.uploadPolicy.deleteRemoteFilesAllowed, false);
    assert.equal(manifest.source.foundationCommit, FOUNDATION);
    assert.equal(manifest.source.j2Commit, J2);
    assert.equal(manifest.source.g4Commit, G4);
    assert.equal(manifest.source.head, INTEGRATION);
    assert.match(manifest.source.headMeaning, /immutable runtime snapshot/i);
    assert.equal(manifest.source.integrationCommit, INTEGRATION);
    assert.deepEqual(manifest.themeFiles.map(({ path: file }) => file), expectedThemeFiles);
    assert.equal(new Set(expectedThemeFiles).size, expectedThemeFiles.length);
    assert.equal(manifest.themeFiles.length, 17);
    assert(manifest.themeFiles.every(({ path: file }) => /^(assets|locales|sections|snippets|templates)\//.test(file)), 'Non-theme path entered upload manifest');
    assert.equal(manifest.themeFiles.filter(({ path: file }) => file === 'assets/cart-feedback-toast.js').length, 1);
    assert.equal(manifest.themeFiles.filter(({ path: file }) => file === 'snippets/cart-feedback-toast.liquid').length, 1);
    assert(manifest.themeFiles.some(({ path: file }) => file === 'templates/collection.json'));
    assert(manifest.themeFiles.some(({ path: file }) => file === 'templates/collection.directory.json'));
    assert(!manifest.themeFiles.some(({ path: file }) => manifest.repositoryOnlyFiles.includes(file)), 'Repository evidence entered theme upload');
    assert(!manifest.themeFiles.some(({ path: file }) => /(?:secret|token|credential|private|evidence|test|plan)/i.test(file)), 'Private or development path entered theme upload');
    for (const row of manifest.themeFiles) {
      assert.equal(repository.hash(row.path), row.sha256, `${row.path}: manifest hash drift`);
      assert(repository.diffQuiet(INTEGRATION, row.path), `${row.path}: differs from committed integration`);
    }
    for (const row of manifest.unchangedRuntimeDependencies) {
      assert.equal(repository.hash(row.path), row.sha256, `${row.path}: dependency hash drift`);
      assert(repository.diffQuiet(INTEGRATION, row.path), `${row.path}: dependency differs from committed integration`);
    }
    assert.equal(manifest.rollback.verifyAfterRollback, true);
    assert.match(manifest.rollback.precondition, /exact bodies, and hashes/);
    assert.match(manifest.rollback.previouslyAbsentFiles, /proved absent/);
    for (const file of [
      'playwright.j2-g4-integration.config.js',
      'scripts/lib/j2-g4-catalog-cart-fixtures.js',
      'tests/j2-g4-catalog-cart-integration.spec.js',
      'docs/project/implementation-records/j2-g4-tiered-navigation-gap-report.md',
      'data/epic-g-g4-route-successor-evidence.json',
      'scripts/validate-epic-g-g4-route-successor-evidence.js',
      'docs/project/implementation-records/j2-g4-integrated-evidence-reconciliation.md',
      'scripts/lib/j2-g4-validator-repository.js',
      'scripts/test-j2-g4-preflight-validators.js',
      'docs/project/implementation-records/j2-g4-preflight-validator-repair.md',
    ]) assert(repository.exists(file), `${file}: integration evidence missing`);
    require('./validate-epic-g-g4-route-successor-evidence').validate({ repository });
  }

  return {
    branch: BRANCH,
    head: repository.git('rev-parse', 'HEAD'),
    integrationCommit: INTEGRATION,
    j2Commit: J2,
    g4Commit: G4,
    sharedFiles: [SHARED],
    photographicCatalog: true,
    j2ToastInitialization: true,
    runtimeWorkingChanges: 0,
    manifestValidated: true,
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

module.exports = { BRANCH, FOUNDATION, G4, INTEGRATION, J2, SHARED, createRepository, expectedCombinedSection, validate };
