'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const EXPECTED_SOURCE_COMMIT = '216270579eefba8f7558bbce84e260a06f4fefcc';
const STORE = 'sz5dnk-nf.myshopify.com';
const SHOP_GID = 'gid://shopify/Shop/79279947973';
const PRODUCTION_THEME_ID = '158579622085';
const PREVIEW_THEME_ID = '158631198917';
const MENU_HANDLE = 'preview-primary-navigation-menu';
const INACTIVE_STOREFRONT_LOCALES = [
  'bg', 'cs', 'da', 'de', 'el', 'es', 'fi', 'fr', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'lt',
  'nb', 'nl', 'pl', 'pt-BR', 'pt-PT', 'ro', 'ru', 'sk', 'sl', 'sv', 'th', 'tr', 'vi', 'zh-CN', 'zh-TW',
];

const normalize = (value) => String(value).replace(/\\/g, '/');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const fileHash = (file) => sha256(fs.readFileSync(file));
const stripShopifyHeader = (text) => text.replace(/^\uFEFF?\s*\/\*[\s\S]*?\*\/\s*/, '');
const readJson = (file) => JSON.parse(stripShopifyHeader(fs.readFileSync(file, 'utf8')));

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function semanticHash(file) {
  if (!file.endsWith('.json')) return fileHash(file);
  return sha256(Buffer.from(JSON.stringify(stable(readJson(file))), 'utf8'));
}

function listFiles(root) {
  const walk = (current) => fs.readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    const absolute = path.join(current, entry.name);
    return entry.isDirectory() ? walk(absolute) : [normalize(path.relative(root, absolute))];
  });
  return walk(root).sort();
}

function record(root, relativePath) {
  const absolute = path.join(root, ...normalize(relativePath).split('/'));
  if (!fs.existsSync(absolute)) return { path: normalize(relativePath), state: 'ABSENT', bytes: null, sha256: null, semanticSha256: null };
  const stat = fs.statSync(absolute);
  assert(stat.isFile(), `${relativePath}: expected file`);
  return {
    path: normalize(relativePath),
    state: 'PRESENT',
    bytes: stat.size,
    sha256: fileHash(absolute),
    semanticSha256: semanticHash(absolute),
  };
}

function inventory(root) {
  const files = listFiles(root).map((file) => record(root, file));
  const digest = sha256(Buffer.from(JSON.stringify(files.map(({ path: file, bytes, semanticSha256 }) => ({ path: file, bytes, semanticSha256 }))), 'utf8'));
  return { fileCount: files.length, digest, files };
}

function acceptedPaths(repositoryRoot) {
  const phaseB = readJson(path.join(repositoryRoot, 'data/j2-g4-preview-deployment-manifest.json'));
  const phaseC = readJson(path.join(repositoryRoot, 'data/j2-g4-phase-c-corrective-manifest.json'));
  return [...new Set([
    ...phaseB.themeFiles.map(({ path: file }) => normalize(file)),
    ...phaseC.runtimeFiles.map(({ path: file }) => normalize(file)),
    ...phaseB.unchangedRuntimeDependencies.map(({ path: file }) => normalize(file)),
  ])].sort();
}

function assertThemeSettings(productionRoot, previewRoot) {
  const settings = {};
  for (const [name, root] of [['production', productionRoot], ['preview', previewRoot]]) {
    const data = readJson(path.join(root, 'config/settings_data.json'));
    const header = readJson(path.join(root, 'sections/header-group.json'));
    settings[name] = {
      cartType: data.current?.cart_type,
      quoteAutomationEnabled: data.current?.rhino_quote_draft_automation_enabled,
      menuHandle: header.sections?.header?.settings?.menu,
      languageSelectorEnabled: header.sections?.header?.settings?.enable_language_selector,
    };
    assert.equal(settings[name].cartType, 'notification', `${name}: cart type drifted`);
    assert.equal(settings[name].quoteAutomationEnabled, true, `${name}: quote automation is not enabled`);
    assert.equal(settings[name].menuHandle, MENU_HANDLE, `${name}: header menu drifted`);
    assert.equal(settings[name].languageSelectorEnabled, false, `${name}: language selector unexpectedly enabled`);
  }
  return settings;
}

function assertKCompatibility(productionRoot, previewRoot) {
  const unchanged = [
    'assets/rhino-quote-draft-client.js',
    'assets/rhino-quote-mode.css',
    'snippets/rhino-quote-pickup-eligibility.liquid',
    'sections/main-cart-footer.liquid',
    'snippets/buy-buttons.liquid',
    'config/settings_schema.json',
  ];
  for (const file of unchanged) {
    assert.equal(semanticHash(path.join(productionRoot, file)), semanticHash(path.join(previewRoot, file)), `${file}: production/preview K dependency drift`);
  }
  const productionLocale = readJson(path.join(productionRoot, 'locales/en.default.json'));
  const previewLocale = readJson(path.join(previewRoot, 'locales/en.default.json'));
  assert(productionLocale.sections?.cart?.quote_mode, 'production: quote locale missing');
  assert(previewLocale.sections?.cart?.quote_mode, 'preview: quote locale missing');
  return {
    unchangedDependencies: unchanged,
    phaseCQuoteSuccessorFiles: ['assets/rhino-quote-mode.js', 'snippets/rhino-quote-checkout.liquid'],
    productionQuoteLocalePresent: true,
    previewQuoteLocalePresent: true,
  };
}

function buildCandidate({ repositoryRoot, productionRoot, previewRoot, candidateRoot, localizationDisposition }) {
  assert.equal(localizationDisposition, 'ENGLISH_ONLY_REMOVE_INACTIVE_STOREFRONT_LOCALES');
  for (const root of [repositoryRoot, productionRoot, previewRoot]) assert(fs.existsSync(root), `Missing root: ${root}`);
  assert(!fs.existsSync(candidateRoot), `Candidate root must not exist: ${candidateRoot}`);
  fs.cpSync(productionRoot, candidateRoot, { recursive: true, errorOnExist: true });

  const paths = acceptedPaths(repositoryRoot);
  for (const file of paths) {
    const source = path.join(previewRoot, ...file.split('/'));
    assert(fs.existsSync(source), `${file}: accepted preview body missing`);
    const destination = path.join(candidateRoot, ...file.split('/'));
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
  }

  const localeDeletions = INACTIVE_STOREFRONT_LOCALES.map((locale) => `locales/${locale}.json`);
  for (const file of localeDeletions) {
    const destination = path.join(candidateRoot, ...file.split('/'));
    assert(fs.existsSync(destination), `${file}: expected inactive storefront locale missing from production baseline`);
    fs.unlinkSync(destination);
  }

  const settings = assertThemeSettings(productionRoot, previewRoot);
  const kCompatibility = assertKCompatibility(productionRoot, previewRoot);
  const fileRecords = paths.map((file) => {
    const predecessor = record(productionRoot, file);
    const acceptedPreview = record(previewRoot, file);
    const candidate = record(candidateRoot, file);
    assert.equal(candidate.semanticSha256, acceptedPreview.semanticSha256, `${file}: candidate is not accepted preview semantics`);
    const operation = predecessor.state === 'ABSENT'
      ? 'ADD'
      : predecessor.semanticSha256 === candidate.semanticSha256 ? 'VERIFY_NO_CHANGE' : 'REPLACE';
    return { path: file, operation, predecessor, acceptedPreview, candidate };
  });

  const predecessorInventory = inventory(productionRoot);
  const previewInventory = inventory(previewRoot);
  const candidateInventory = inventory(candidateRoot);
  const binding = {
    schemaVersion: 1,
    sourceCommit: EXPECTED_SOURCE_COMMIT,
    shopGid: SHOP_GID,
    store: STORE,
    productionThemeId: PRODUCTION_THEME_ID,
    acceptedPreviewThemeId: PREVIEW_THEME_ID,
    predecessorInventoryDigest: predecessorInventory.digest,
    candidateInventoryDigest: candidateInventory.digest,
    acceptedPaths: fileRecords.map(({ path: file, operation, candidate }) => ({ path: file, operation, sha256: candidate.sha256, semanticSha256: candidate.semanticSha256, bytes: candidate.bytes })),
    localeDeletions,
    menuHandle: MENU_HANDLE,
    settingsMutationCount: 0,
    menuMutationCount: 0,
    productMutationCount: 0,
  };
  const transactionDigest = sha256(Buffer.from(JSON.stringify(stable(binding)), 'utf8'));

  return {
    binding,
    transactionDigest,
    futureStageAuthorizationValue: `J2G4-PRODUCTION-STAGE-${transactionDigest}`,
    paths,
    fileRecords,
    localeDeletions,
    settings,
    kCompatibility,
    predecessorInventory,
    previewInventory,
    candidateInventory,
  };
}

module.exports = {
  EXPECTED_SOURCE_COMMIT,
  STORE,
  SHOP_GID,
  PRODUCTION_THEME_ID,
  PREVIEW_THEME_ID,
  MENU_HANDLE,
  INACTIVE_STOREFRONT_LOCALES,
  acceptedPaths,
  buildCandidate,
  fileHash,
  inventory,
  readJson,
  record,
  semanticHash,
  sha256,
  stable,
};
