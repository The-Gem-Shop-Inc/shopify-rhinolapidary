'use strict';

const assert = require('node:assert/strict');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');

const FOUNDATION = 'origin/feat/epic-l-l1a-foundation';
const J2 = 'origin/epic-j/j2-collection-cart-feedback';
const G4 = 'origin/epic-g/g4-photo-catalog-navigation';
const BRANCH = 'integration/catalog-cart-preview';
const SHARED = 'sections/main-collection-product-grid.liquid';
const INTEGRATION = '64ddfaadbcea98175940fd54d9cf198c443e39c3';

const normalize = (value) => String(value).replace(/\r\n/g, '\n').trimEnd();
const read = (file) => fs.readFileSync(file, 'utf8');
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const git = (...args) => cp.execFileSync('git', args, { encoding: 'utf8' }).trim();
const show = (ref, file) => cp.execFileSync('git', ['show', `${ref}:${file}`], { encoding: 'utf8' });
const files = (range) => git('diff', '--name-only', range).split(/\r?\n/).filter(Boolean);

function expectedCombinedSection() {
  let source = show(J2, SHARED);
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

function validateSchema(file) {
  const match = read(file).match(/{% schema %}([\s\S]*?){% endschema %}/);
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

function validate({ requireManifest = false } = {}) {
  assert.equal(git('branch', '--show-current'), BRANCH, 'Wrong integration branch');
  assert.equal(git('rev-parse', 'HEAD'), INTEGRATION, 'Unexpected committed integration HEAD');
  assert.equal(cp.spawnSync('git', ['merge-base', '--is-ancestor', J2, 'HEAD']).status, 0, 'J2 is not an ancestor');
  assert.equal(git('rev-parse', G4), 'a53daec8ffbbbdcd6c5acba1da7770fa23ec3a12', 'Unexpected G4 commit');
  assert.equal(git('config', '--get', 'core.longpaths'), 'true', 'Git long paths must remain enabled');
  assert.equal(git('diff', '--cached', '--name-only'), '', 'Integration changes must not be staged');
  const allowedEvidenceChanges = [
    'data/epic-g-g4-route-successor-evidence.json',
    'data/j2-g4-preview-deployment-manifest.json',
    'docs/project/implementation-records/j2-g4-integrated-evidence-reconciliation.md',
    'scripts/validate-epic-g-g4-route-successor-evidence.js',
    'scripts/validate-j2-g4-catalog-cart-integration.js',
  ];
  const workingChanges = cp.execFileSync('git', ['status', '--porcelain', '-uall'], { encoding: 'utf8' })
    .trimEnd()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).replace(/\\/g, '/'))
    .sort();
  assert.deepEqual(workingChanges, allowedEvidenceChanges.slice().sort(), 'Unexpected evidence reconciliation file set');

  const j2Files = files(`${FOUNDATION}...${J2}`);
  const g4Files = files(`${FOUNDATION}...${G4}`);
  assert.deepEqual(j2Files.filter((file) => g4Files.includes(file)), [SHARED], 'Unexpected J2/G4 overlap');

  for (const file of j2Files.filter((file) => file !== SHARED)) {
    assert.equal(normalize(read(file)), normalize(show(J2, file)), `${file}: J2 source drift`);
  }
  for (const file of g4Files.filter((file) => file !== SHARED)) {
    assert.equal(normalize(read(file)), normalize(show(G4, file)), `${file}: G4 source drift`);
  }

  const section = read(SHARED);
  assert.equal(normalize(section), normalize(expectedCombinedSection()), 'Shared collection section is not the exact combined successor');
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

  assert(read('snippets/card-product.liquid').includes('data-product-title="{{ card_product.title | escape }}"'));
  assert(read('assets/quick-add-bulk.js').includes("document.querySelector('cart-feedback-toast')"));
  assert(read('assets/quick-add-bulk.js').includes('CollectionCartCoordinator'));
  assert(read('templates/collection.json').includes('"catalog-navigation"'));
  assert(read('templates/collection.directory.json').includes('"product-directory"'));
  assert(read('snippets/rhino-g-catalog-index.liquid').includes('?view=directory'));

  for (const file of [
    SHARED,
    'sections/rhino-g-catalog-navigation.liquid',
    'sections/rhino-g-catalog-directory.liquid',
  ]) validateSchema(file);

  const manifestPath = 'data/j2-g4-preview-deployment-manifest.json';
  if (requireManifest) {
    const manifest = JSON.parse(read(manifestPath));
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
    assert.equal(manifest.source.j2Commit, git('rev-parse', J2));
    assert.equal(manifest.source.g4Commit, git('rev-parse', G4));
    assert.equal(manifest.source.head, INTEGRATION);
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
      assert.equal(sha256(row.path), row.sha256, `${row.path}: manifest hash drift`);
      assert.equal(cp.spawnSync('git', ['diff', '--quiet', INTEGRATION, '--', row.path]).status, 0, `${row.path}: differs from committed integration`);
    }
    for (const row of manifest.unchangedRuntimeDependencies) {
      assert.equal(sha256(row.path), row.sha256, `${row.path}: dependency hash drift`);
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
    ]) assert(fs.existsSync(file), `${file}: integration evidence missing`);
    require('./validate-epic-g-g4-route-successor-evidence').validate();
  }

  return {
    branch: BRANCH,
    head: INTEGRATION,
    j2Commit: git('rev-parse', J2),
    g4Commit: git('rev-parse', G4),
    sharedFiles: [SHARED],
    photographicCatalog: true,
    j2ToastInitialization: true,
    stagedFiles: 0,
    manifestValidated: requireManifest,
  };
}

if (require.main === module) {
  try {
    console.log(JSON.stringify(validate({ requireManifest: process.argv.includes('--manifest') })));
  } catch (error) {
    console.error(error.stack);
    process.exitCode = 1;
  }
}

module.exports = { expectedCombinedSection, sha256, validate };
