'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const integration = require('./validate-j2-g4-catalog-cart-integration');
const semantic = require('./lib/j2-g4-json-integrity');

const REPOSITORY_ROOT = path.resolve(__dirname, '..');
const EXPECTED_MANIFEST_SHA256 = 'c7836d2c0990095317f729ce1cdd80d2e502e97c07b120a68d00fe6b127fba30';
const EXPECTED_FAILURE_SHA256 = '650277a6fde20d5b52809458d8c53f2b3533d6496b1350ebf632d42249978153';
const AUTHORIZED_SEMANTIC_PATHS = new Set([
  'locales/en.default.json',
  'templates/collection.directory.json',
  'templates/collection.json',
]);
const DEFAULT_INVENTORY_CONTRACT = Object.freeze({
  preUploadFiles: 456,
  currentFiles: 463,
  unrelatedFiles: 446,
  authorizedAdditions: 7,
});

const normalize = (value) => String(value).replace(/\\/g, '/');
const hashBuffer = (value) => crypto.createHash('sha256').update(value).digest('hex');
const readBuffer = (root, relative) => {
  const normalized = normalize(relative);
  assert(!normalized.startsWith('/') && !normalized.split('/').includes('..'), `${relative}: unsafe relative path`);
  const file = path.join(root, ...normalized.split('/'));
  assert(fs.existsSync(file) && fs.statSync(file).isFile(), `${relative}: readback missing`);
  return fs.readFileSync(file);
};

function readStrictJson(file, { allowShopifyHeader = false } = {}) {
  return semantic.parseJsonDocument(fs.readFileSync(file), { allowShopifyHeader, label: file }).value;
}

function calculateCandidateDigest(records) {
  const rows = records.map(({ path: file, sha256, size }) => ({ path: file, sha256, size }));
  return hashBuffer(Buffer.from(JSON.stringify(rows), 'utf8'));
}

function verifyFile({ record, candidateRoot, readbackRoot, semanticPaths = AUTHORIZED_SEMANTIC_PATHS }) {
  const candidate = readBuffer(candidateRoot, record.path);
  const remote = readBuffer(readbackRoot, record.path);
  const sourceSha256 = hashBuffer(candidate);
  const remoteSha256 = hashBuffer(remote);
  assert.equal(sourceSha256, record.sha256, `${record.path}: committed candidate SHA-256 mismatch`);
  if (record.size !== undefined) assert.equal(candidate.length, record.size, `${record.path}: committed candidate size mismatch`);

  const base = {
    path: record.path,
    sourceSize: candidate.length,
    sourceSha256,
    remoteSize: remote.length,
    remoteSha256,
  };
  if (sourceSha256 === remoteSha256) return { ...base, verification: 'EXACT_SHA256', semanticDigest: null };
  assert(semanticPaths.has(record.path), `${record.path}: readback SHA-256 mismatch; no semantic exception is authorized`);
  const candidateJson = semantic.parseJsonDocument(candidate, { label: `${record.path} candidate` });
  const remoteJson = semantic.parseJsonDocument(remote, { allowShopifyHeader: true, label: `${record.path} remote` });
  assert.equal(remoteJson.canonical, candidateJson.canonical, `${record.path}: semantic JSON mismatch`);
  return {
    ...base,
    verification: 'AUTHORIZED_SEMANTIC_JSON',
    semanticDigest: candidateJson.semanticDigest,
    remoteSemanticDigest: remoteJson.semanticDigest,
    remoteHeaderKind: remoteJson.headerKind,
    remoteHeaderBytes: remoteJson.headerBytes,
  };
}

function assertLocaleContract(candidateRoot, readbackRoot, baselineLocalePath) {
  const candidate = semantic.parseJsonDocument(readBuffer(candidateRoot, 'locales/en.default.json'), { label: 'locale candidate' }).value;
  const remote = semantic.parseJsonDocument(readBuffer(readbackRoot, 'locales/en.default.json'), { allowShopifyHeader: true, label: 'locale remote' }).value;
  const baseline = semantic.parseJsonDocument(fs.readFileSync(baselineLocalePath), { allowShopifyHeader: true, label: 'locale baseline' }).value;
  const candidateLeaves = semantic.flattenLeaves(candidate);
  const remoteLeaves = semantic.flattenLeaves(remote);
  const baselineLeaves = semantic.flattenLeaves(baseline);
  assert.equal(Object.keys(candidateLeaves).length, 533, 'Candidate locale must contain 533 translation leaves');
  assert.equal(Object.keys(remoteLeaves).length, 533, 'Remote locale must contain 533 translation leaves');
  assert.equal(Object.keys(baselineLeaves).length, 526, 'Original preview locale must contain 526 translation leaves');
  assert.deepEqual(remoteLeaves, candidateLeaves, 'Remote locale keys or values differ from the candidate');
  for (const [key, value] of Object.entries(baselineLeaves)) {
    assert(Object.hasOwn(candidateLeaves, key), `${key}: original preview translation missing`);
    assert.deepEqual(candidateLeaves[key], value, `${key}: original preview translation altered`);
  }
  const toastPaths = integration.TOAST_KEYS.map((key) => `sections.cart_feedback.${key}`);
  const additions = Object.keys(candidateLeaves).filter((key) => !Object.hasOwn(baselineLeaves, key)).sort();
  assert.deepEqual(additions, [...toastPaths].sort(), 'Locale additions are not exactly the seven approved J2 toast keys');
  for (const key of toastPaths) assert.equal(typeof candidateLeaves[key] === 'string' && candidateLeaves[key].trim() !== '', true, `${key}: toast translation is missing or empty`);
  assert.equal(candidateLeaves[integration.QUOTE_KEY], integration.AUTHORIZED_QUOTE, 'Approved quotation explanation mismatch');
  return { candidateLeaves: 533, remoteLeaves: 533, preservedPreviewLeaves: 526, approvedToastLeaves: 7 };
}

function assertCollectionContracts(candidateRoot, readbackRoot) {
  const collection = readStrictJson(path.join(candidateRoot, 'templates', 'collection.json'));
  const directory = readStrictJson(path.join(candidateRoot, 'templates', 'collection.directory.json'));
  assert.deepEqual(collection.order, ['banner', 'catalog-navigation', 'product-grid'], 'Collection section ordering changed');
  assert.deepEqual(Object.keys(collection.sections), collection.order, 'Collection sections and ordering diverge');
  assert.deepEqual(collection.sections.banner, {
    type: 'main-collection-banner',
    settings: { show_collection_description: true, show_collection_image: false, color_scheme: 'scheme-1' },
  }, 'Collection banner configuration changed');
  assert.deepEqual(collection.sections['catalog-navigation'], { type: 'rhino-g-catalog-navigation', settings: {} }, 'Catalog navigation configuration changed');
  assert.deepEqual(collection.sections['product-grid'], {
    type: 'main-collection-product-grid',
    settings: {
      products_per_page: 20,
      columns_desktop: 5,
      color_scheme: 'scheme-1',
      image_ratio: 'adapt',
      image_shape: 'default',
      show_secondary_image: false,
      show_vendor: false,
      show_rating: false,
      quick_add: 'bulk',
      enable_filtering: true,
      filter_type: 'horizontal',
      enable_sorting: true,
      columns_mobile: '2',
      padding_top: 36,
      padding_bottom: 36,
    },
  }, 'Product grid configuration changed');
  assert.deepEqual(directory.order, ['banner', 'catalog-navigation', 'product-directory'], 'Directory section ordering changed');
  assert.deepEqual(Object.keys(directory.sections), directory.order, 'Directory sections and ordering diverge');
  assert.deepEqual(directory.sections.banner, collection.sections.banner, 'Directory banner configuration changed');
  assert.deepEqual(directory.sections['catalog-navigation'], collection.sections['catalog-navigation'], 'Directory navigation configuration changed');
  assert.deepEqual(directory.sections['product-directory'], { type: 'rhino-g-catalog-directory', settings: {} }, 'Directory section configuration changed');

  for (const file of ['templates/collection.json', 'templates/collection.directory.json']) {
    const candidate = semantic.parseJsonDocument(readBuffer(candidateRoot, file), { label: `${file} candidate` });
    const remote = semantic.parseJsonDocument(readBuffer(readbackRoot, file), { allowShopifyHeader: true, label: `${file} remote` });
    assert.equal(remote.canonical, candidate.canonical, `${file}: remote section configuration differs`);
  }
  return { collectionSections: collection.order, directorySections: directory.order };
}

function enumerateFiles(root, current = root) {
  return fs.readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(current, entry.name);
    return entry.isDirectory() ? enumerateFiles(root, absolute) : [normalize(path.relative(root, absolute))];
  });
}

function assertIdentity(identityEvidence) {
  assert.equal(identityEvidence.readOnly, true, 'Identity evidence is not marked read-only');
  assert.equal(identityEvidence.shopifyMutations, 0, 'Identity evidence records Shopify mutations');
  const source = identityEvidence.response || identityEvidence;
  assert.equal(source.shop.id, 'gid://shopify/Shop/79279947973', 'Wrong Shopify shop identity');
  assert.equal(source.shop.myshopifyDomain, 'sz5dnk-nf.myshopify.com', 'Wrong Shopify domain');
  assert.equal(source.preview.id, 'gid://shopify/OnlineStoreTheme/158631198917', 'Wrong preview theme identity');
  assert.equal(source.preview.role, 'UNPUBLISHED', 'Preview theme is not UNPUBLISHED');
  assert.equal(source.production.id, 'gid://shopify/OnlineStoreTheme/158579622085', 'Wrong production theme identity');
  assert.equal(source.production.role, 'MAIN', 'Production theme is not MAIN');
  assert.deepEqual(source.shopLocales, [{ locale: 'en', name: 'English', primary: true, published: true }], 'English is not the only published storefront locale');
  return {
    shopId: source.shop.id,
    previewThemeId: source.preview.id,
    previewRole: source.preview.role,
    productionThemeId: source.production.id,
    productionRole: source.production.role,
    publishedLocales: ['en'],
  };
}

function assertInventory({ manifest, readbackRoot, preUploadInventory, inventoryContract }) {
  assert(Array.isArray(preUploadInventory), 'Pre-upload inventory must be an array');
  const baseline = new Map(preUploadInventory.map((entry) => [normalize(entry.path), entry.sha256]));
  assert.equal(baseline.size, preUploadInventory.length, 'Pre-upload inventory contains duplicate paths');
  const currentPaths = enumerateFiles(readbackRoot).sort();
  const candidatePaths = new Set(manifest.themeFiles.map((record) => normalize(record.path)));
  const expectedPaths = new Set([...baseline.keys(), ...candidatePaths]);
  assert.equal(preUploadInventory.length, inventoryContract.preUploadFiles, 'Pre-upload inventory count changed');
  assert.equal(currentPaths.length, inventoryContract.currentFiles, 'Current theme inventory count changed');
  assert.deepEqual(currentPaths, [...expectedPaths].sort(), 'Current theme contains missing or unexpected assets');
  const additions = [...candidatePaths].filter((file) => !baseline.has(file)).sort();
  assert.equal(additions.length, inventoryContract.authorizedAdditions, 'Authorized addition count changed');
  const unrelated = [...baseline.keys()].filter((file) => !candidatePaths.has(file)).sort();
  assert.equal(unrelated.length, inventoryContract.unrelatedFiles, 'Unrelated asset count changed');
  for (const file of unrelated) {
    const actual = hashBuffer(readBuffer(readbackRoot, file));
    assert.equal(actual, baseline.get(file), `${file}: unrelated theme asset changed`);
  }
  return {
    preUploadFiles: preUploadInventory.length,
    currentFiles: currentPaths.length,
    unrelatedFilesVerified: unrelated.length,
    authorizedAdditions: additions,
    missingFiles: 0,
    unexpectedFiles: 0,
  };
}

function validate(options = {}) {
  const repositoryRoot = path.resolve(options.repositoryRoot || REPOSITORY_ROOT);
  const readbackRoot = path.resolve(options.readbackRoot || '');
  assert(options.readbackRoot, 'A readback theme root is required');
  const manifestPath = path.join(repositoryRoot, 'data', 'j2-g4-preview-deployment-manifest.json');
  const manifestBuffer = fs.readFileSync(manifestPath);
  assert.equal(hashBuffer(manifestBuffer), EXPECTED_MANIFEST_SHA256, 'Original candidate manifest SHA-256 mismatch');
  const manifest = semantic.parseJsonDocument(manifestBuffer, { label: 'deployment manifest' }).value;
  assert.equal(manifest.themeFiles.length, 17, 'Manifest must contain 17 runtime files');
  assert.equal(manifest.unchangedRuntimeDependencies.length, 5, 'Manifest must contain five unchanged dependencies');
  assert.equal(new Set(manifest.themeFiles.map(({ path: file }) => file)).size, 17, 'Manifest contains duplicate runtime paths');

  for (const record of manifest.themeFiles) {
    const candidate = readBuffer(repositoryRoot, record.path);
    assert.equal(hashBuffer(candidate), record.sha256, `${record.path}: candidate SHA-256 differs from manifest`);
    assert.equal(candidate.length, record.size, `${record.path}: candidate size differs from manifest`);
  }
  const candidateDigest = calculateCandidateDigest(manifest.themeFiles);
  assert.equal(candidateDigest, manifest.deploymentCandidate.digest, 'Deployment candidate digest mismatch');

  const identityEvidence = options.identityEvidence || readStrictJson(path.resolve(options.identityEvidencePath));
  const identity = assertIdentity(identityEvidence);

  const failureRecord = options.failureRecord || readStrictJson(path.resolve(options.failureRecordPath));
  if (!options.failureRecord) assert.equal(hashBuffer(fs.readFileSync(path.resolve(options.failureRecordPath))), EXPECTED_FAILURE_SHA256, 'Historical Phase B failure-record SHA-256 mismatch');
  assert.equal(failureRecord.classification, 'FAILED_EXACT_READBACK', 'Historical Phase B result was reclassified');
  assert.equal(failureRecord.candidateDigest, candidateDigest, 'Historical failure record candidate digest mismatch');

  const runtime = manifest.themeFiles.map((record) => verifyFile({ record, candidateRoot: repositoryRoot, readbackRoot }));
  const dependencies = manifest.unchangedRuntimeDependencies.map((record) => {
    const candidate = readBuffer(repositoryRoot, record.path);
    const remote = readBuffer(readbackRoot, record.path);
    const sourceSha256 = hashBuffer(candidate);
    const remoteSha256 = hashBuffer(remote);
    assert.equal(sourceSha256, record.sha256, `${record.path}: committed dependency SHA-256 mismatch`);
    assert.equal(remoteSha256, record.sha256, `${record.path}: dependency readback SHA-256 mismatch`);
    return { path: record.path, sourceSha256, remoteSha256, verification: 'EXACT_SHA256' };
  });

  const rollbackRoot = path.resolve(options.rollbackArchive || '');
  assert(options.rollbackArchive, 'A rollback archive is required');
  const baselineLocalePath = path.join(rollbackRoot, 'theme', 'locales', 'en.default.json');
  const locale = assertLocaleContract(repositoryRoot, readbackRoot, baselineLocalePath);
  const templates = assertCollectionContracts(repositoryRoot, readbackRoot);
  const preUploadInventory = options.preUploadInventory || readStrictJson(path.resolve(options.preUploadInventoryPath));
  const inventory = assertInventory({
    manifest,
    readbackRoot,
    preUploadInventory,
    inventoryContract: options.inventoryContract || DEFAULT_INVENTORY_CONTRACT,
  });

  return {
    schemaVersion: 1,
    classification: 'PASS_SUCCESSOR_SEMANTIC_READBACK',
    policyStatus: 'PROPOSED_NOT_AUTHORIZED_FOR_PRODUCTION',
    historicalPhaseBResult: 'FAILED_EXACT_READBACK_UNCHANGED',
    candidateDigest,
    manifestSha256: EXPECTED_MANIFEST_SHA256,
    identity,
    runtime,
    dependencies,
    locale,
    templates,
    inventory,
    exactRuntimeMatches: runtime.filter(({ verification }) => verification === 'EXACT_SHA256').length,
    authorizedSemanticRuntimeMatches: runtime.filter(({ verification }) => verification === 'AUTHORIZED_SEMANTIC_JSON').length,
  };
}

function parseArguments(argv) {
  const values = {};
  for (const argument of argv) {
    if (!argument.startsWith('--')) {
      if (!values.readbackRoot) values.readbackRoot = argument;
      else throw new Error(`Unexpected positional argument: ${argument}`);
      continue;
    }
    const [key, ...rest] = argument.slice(2).split('=');
    values[key] = rest.join('=');
  }
  return {
    readbackRoot: values['readback-root'] || values.readbackRoot,
    identityEvidencePath: values['identity-evidence'],
    preUploadInventoryPath: values['pre-upload-inventory'],
    rollbackArchive: values['rollback-archive'],
    failureRecordPath: values['failure-record'],
  };
}

if (require.main === module) {
  try {
    const result = validate(parseArguments(process.argv.slice(2)));
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error(error.stack);
    process.exitCode = 1;
  }
}

module.exports = {
  AUTHORIZED_SEMANTIC_PATHS,
  DEFAULT_INVENTORY_CONTRACT,
  EXPECTED_FAILURE_SHA256,
  EXPECTED_MANIFEST_SHA256,
  assertCollectionContracts,
  assertInventory,
  assertLocaleContract,
  calculateCandidateDigest,
  validate,
  verifyFile,
};
