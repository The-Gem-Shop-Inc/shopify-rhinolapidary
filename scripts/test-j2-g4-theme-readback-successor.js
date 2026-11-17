'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const integration = require('./validate-j2-g4-catalog-cart-integration');
const successor = require('./validate-j2-g4-theme-readback-successor');
const { SHOPIFY_HEADERS, parseJsonDocument } = require('./lib/j2-g4-json-integrity');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'data/j2-g4-preview-deployment-manifest.json'), 'utf8'));
const additions = new Set([
  'assets/cart-feedback-toast.js',
  'assets/component-cart-feedback-toast.css',
  'assets/rhino-g-catalog-navigation.css',
  'sections/rhino-g-catalog-directory.liquid',
  'sections/rhino-g-catalog-navigation.liquid',
  'snippets/cart-feedback-toast.liquid',
  'templates/collection.directory.json',
]);
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');

function write(rootPath, relative, value) {
  const file = path.join(rootPath, ...relative.split('/'));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}

function generatedHeader(file) {
  return `${file.startsWith('locales/') ? SHOPIFY_HEADERS.language : SHOPIFY_HEADERS.theme}\n`;
}

function writeJsonRemote(readbackRoot, file, value) {
  write(readbackRoot, file, `${generatedHeader(file)}${JSON.stringify(value, null, 2)}\n`);
}

function identity() {
  return {
    readOnly: true,
    shopifyMutations: 0,
    shop: { id: 'gid://shopify/Shop/79279947973', myshopifyDomain: 'sz5dnk-nf.myshopify.com' },
    preview: { id: 'gid://shopify/OnlineStoreTheme/158631198917', role: 'UNPUBLISHED' },
    production: { id: 'gid://shopify/OnlineStoreTheme/158579622085', role: 'MAIN' },
    shopLocales: [{ locale: 'en', name: 'English', primary: true, published: true }],
  };
}

function createFixture() {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rhino-j2-g4-successor-'));
  const readbackRoot = path.join(temporaryRoot, 'readback');
  const rollbackArchive = path.join(temporaryRoot, 'rollback');
  const expected = [...manifest.themeFiles, ...manifest.unchangedRuntimeDependencies];
  for (const record of expected) {
    const source = fs.readFileSync(path.join(root, ...record.path.split('/')));
    const value = successor.AUTHORIZED_SEMANTIC_PATHS.has(record.path)
      ? Buffer.concat([Buffer.from(generatedHeader(record.path)), source])
      : source;
    write(readbackRoot, record.path, value);
  }
  write(readbackRoot, 'assets/unrelated-fixture.txt', 'unchanged unrelated fixture\n');

  const baselineLocale = JSON.parse(fs.readFileSync(path.join(root, 'locales/en.default.json'), 'utf8'));
  for (const key of integration.TOAST_KEYS) delete baselineLocale.sections.cart_feedback[key];
  if (Object.keys(baselineLocale.sections.cart_feedback).length === 0) delete baselineLocale.sections.cart_feedback;
  write(path.join(rollbackArchive, 'theme'), 'locales/en.default.json', JSON.stringify(baselineLocale, null, 2));
  assert.equal(Object.keys(integration.flattenLeaves(baselineLocale)).length, 526);

  const preUploadInventory = [];
  for (const record of manifest.themeFiles.filter(({ path: file }) => !additions.has(file))) {
    preUploadInventory.push({ path: record.path, sha256: record.sha256 });
  }
  for (const record of manifest.unchangedRuntimeDependencies) preUploadInventory.push({ path: record.path, sha256: record.sha256 });
  preUploadInventory.push({ path: 'assets/unrelated-fixture.txt', sha256: hash(Buffer.from('unchanged unrelated fixture\n')) });

  const candidateDigest = successor.calculateCandidateDigest(manifest.themeFiles);
  const options = {
    repositoryRoot: root,
    readbackRoot,
    rollbackArchive,
    identityEvidence: identity(),
    failureRecord: { classification: 'FAILED_EXACT_READBACK', candidateDigest },
    preUploadInventory,
    inventoryContract: { preUploadFiles: 16, currentFiles: 23, unrelatedFiles: 6, authorizedAdditions: 7 },
  };
  return {
    temporaryRoot,
    readbackRoot,
    options,
    cleanup: () => fs.rmSync(temporaryRoot, { recursive: true, force: true }),
  };
}

function mutateJson(fixture, file, mutation) {
  const body = fs.readFileSync(path.join(fixture.readbackRoot, ...file.split('/')));
  const value = parseJsonDocument(body, { allowShopifyHeader: true, label: file }).value;
  mutation(value);
  writeJsonRemote(fixture.readbackRoot, file, value);
}

function execute(mutator, pattern) {
  const fixture = createFixture();
  try {
    mutator(fixture);
    if (pattern) assert.throws(() => successor.validate(fixture.options), pattern);
    else return successor.validate(fixture.options);
  } finally {
    fixture.cleanup();
  }
}

const tests = [
  ['accepts approved Shopify headers and harmless object-key/whitespace serialization', () => {
    const result = execute((fixture) => {
      mutateJson(fixture, 'templates/collection.json', (value) => {
        value.sections = Object.fromEntries(Object.entries(value.sections).reverse());
      });
    });
    assert.equal(result.classification, 'PASS_SUCCESSOR_SEMANTIC_READBACK');
    assert.equal(result.exactRuntimeMatches, 14);
    assert.equal(result.authorizedSemanticRuntimeMatches, 3);
  }],
  ['rejects a missing translation', () => execute((fixture) => {
    mutateJson(fixture, 'locales/en.default.json', (value) => { delete value.general.password_page.login_form_heading; });
  }, /semantic JSON mismatch|translation missing|533/)],
  ['rejects an altered translation', () => execute((fixture) => {
    mutateJson(fixture, 'locales/en.default.json', (value) => { value.general.password_page.login_form_heading += ' altered'; });
  }, /semantic JSON mismatch|altered/)],
  ['rejects an empty quotation explanation', () => execute((fixture) => {
    mutateJson(fixture, 'locales/en.default.json', (value) => { value.sections.cart.quote_mode.email_fallback_explanation = ''; });
  }, /semantic JSON mismatch|quotation explanation/)],
  ['rejects a missing toast key', () => execute((fixture) => {
    mutateJson(fixture, 'locales/en.default.json', (value) => { delete value.sections.cart_feedback.pending; });
  }, /semantic JSON mismatch|toast|533/)],
  ['rejects an added unapproved translation key', () => execute((fixture) => {
    mutateJson(fixture, 'locales/en.default.json', (value) => { value.sections.cart_feedback.unapproved = 'No'; });
  }, /semantic JSON mismatch|additions|533/)],
  ['rejects a changed Product grid setting', () => execute((fixture) => {
    mutateJson(fixture, 'templates/collection.json', (value) => { value.sections['product-grid'].settings.products_per_page = 24; });
  }, /semantic JSON mismatch|Product grid/)],
  ['rejects changed section ordering', () => execute((fixture) => {
    mutateJson(fixture, 'templates/collection.json', (value) => { value.order.reverse(); });
  }, /semantic JSON mismatch|section ordering/)],
  ['rejects a missing directory section', () => execute((fixture) => {
    mutateJson(fixture, 'templates/collection.directory.json', (value) => { delete value.sections['product-directory']; });
  }, /semantic JSON mismatch|Directory section/)],
  ['rejects invalid JSON', () => execute((fixture) => {
    write(fixture.readbackRoot, 'templates/collection.json', `${SHOPIFY_HEADERS.theme}\n{"sections":`);
  }, /expected a JSON value|invalid|unterminated/)],
  ['rejects duplicate JSON keys', () => execute((fixture) => {
    write(fixture.readbackRoot, 'templates/collection.json', `${SHOPIFY_HEADERS.theme}\n{"sections":{},"sections":{},"order":[]}`);
  }, /duplicate object key/)],
  ['rejects modified JavaScript', () => execute((fixture) => {
    fs.appendFileSync(path.join(fixture.readbackRoot, 'assets/cart-feedback-toast.js'), '\n// changed');
  }, /cart-feedback-toast\.js: readback SHA-256 mismatch/)],
  ['rejects modified Liquid', () => execute((fixture) => {
    fs.appendFileSync(path.join(fixture.readbackRoot, 'sections/main-collection-product-grid.liquid'), '\n{% comment %}changed{% endcomment %}');
  }, /main-collection-product-grid\.liquid: readback SHA-256 mismatch/)],
  ['rejects modified CSS', () => execute((fixture) => {
    fs.appendFileSync(path.join(fixture.readbackRoot, 'assets/component-cart-feedback-toast.css'), '\n.changed{}');
  }, /component-cart-feedback-toast\.css: readback SHA-256 mismatch/)],
  ['rejects modified dependencies', () => execute((fixture) => {
    fs.appendFileSync(path.join(fixture.readbackRoot, 'assets/rhino-g-catalog.js'), '\n// changed dependency');
  }, /dependency readback SHA-256 mismatch/)],
  ['rejects unrelated theme asset changes', () => execute((fixture) => {
    fs.appendFileSync(path.join(fixture.readbackRoot, 'assets/unrelated-fixture.txt'), 'changed');
  }, /unrelated theme asset changed/)],
  ['rejects wrong Shopify theme identity', () => execute((fixture) => {
    fixture.options.identityEvidence.preview.id = 'gid://shopify/OnlineStoreTheme/1';
  }, /Wrong preview theme identity/)],
  ['rejects wrong publication role', () => execute((fixture) => {
    fixture.options.identityEvidence.preview.role = 'MAIN';
  }, /Preview theme is not UNPUBLISHED/)],
  ['rejects a mismatched candidate digest', () => execute((fixture) => {
    fixture.options.failureRecord.candidateDigest = '0'.repeat(64);
  }, /candidate digest mismatch/)],
  ['rejects a semantic exception for an unauthorized file', () => {
    const fixture = createFixture();
    try {
      write(fixture.temporaryRoot, 'candidate/unauthorized.json', '{"a":1}\n');
      write(fixture.temporaryRoot, 'remote/unauthorized.json', '{ "a": 1 }\n');
      const record = { path: 'unauthorized.json', sha256: hash(Buffer.from('{"a":1}\n')), size: 8 };
      assert.throws(() => successor.verifyFile({
        record,
        candidateRoot: path.join(fixture.temporaryRoot, 'candidate'),
        readbackRoot: path.join(fixture.temporaryRoot, 'remote'),
        semanticPaths: new Set(),
      }), /no semantic exception is authorized/);
    } finally {
      fixture.cleanup();
    }
  }],
];

let failed = 0;
for (const [name, test] of tests) {
  try {
    test();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}: ${error.stack}`);
  }
}
console.log(JSON.stringify({ passed: tests.length - failed, failed, total: tests.length }));
if (failed) process.exitCode = 1;
