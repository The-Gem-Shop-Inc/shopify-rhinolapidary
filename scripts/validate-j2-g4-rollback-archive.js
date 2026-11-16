'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'data/j2-g4-preview-deployment-manifest.json'), 'utf8'));
const archiveRoot = path.resolve(process.argv[2] || '');

assert(process.argv[2], 'Usage: node scripts/validate-j2-g4-rollback-archive.js <archive-root>');
assert.notEqual(path.relative(repositoryRoot, archiveRoot).split(path.sep)[0], '', 'Rollback archive must not be the repository root');
assert(path.relative(repositoryRoot, archiveRoot).startsWith('..'), 'Rollback archive must be outside the public Git repository');
assert(fs.existsSync(archiveRoot), `Archive does not exist: ${archiveRoot}`);

const inventoryPath = path.join(archiveRoot, 'inventory.json');
const inventoryText = fs.readFileSync(inventoryPath, 'utf8');
const inventory = JSON.parse(inventoryText);
assert.equal(inventory.schemaVersion, 1);
assert.equal(inventory.archiveKind, 'J2_G4_PREVIEW_ROLLBACK');
assert.equal(inventory.shop.id, 'gid://shopify/Shop/79279947973');
assert.equal(inventory.shop.myshopifyDomain, 'sz5dnk-nf.myshopify.com');
assert.equal(inventory.theme.id, 'gid://shopify/OnlineStoreTheme/158631198917');
assert.equal(inventory.theme.numericId, '158631198917');
assert.equal(inventory.theme.name, 'Rhino Lapidary - Preview');
assert.equal(inventory.theme.role, 'UNPUBLISHED');
assert.equal(inventory.counts.manifestPaths, 17);
assert.equal(inventory.counts.existing, 10);
assert.equal(inventory.counts.absent, 7);

const normalize = (value) => String(value).replace(/\\/g, '/');
const manifestPaths = manifest.themeFiles.map(({ path: file }) => normalize(file)).sort();
const existingPaths = inventory.existingFiles.map(({ path: file }) => normalize(file)).sort();
const absentPaths = inventory.absentFiles.map(({ path: file }) => normalize(file)).sort();
assert.equal(new Set(existingPaths).size, 10, 'Duplicate existing rollback path');
assert.equal(new Set(absentPaths).size, 7, 'Duplicate absent rollback path');
assert.deepEqual([...existingPaths, ...absentPaths].sort(), manifestPaths, 'Rollback inventory does not cover exactly the 17 manifest paths');
assert.equal(existingPaths.filter((file) => absentPaths.includes(file)).length, 0, 'A path cannot be both existing and absent');

const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
for (const record of inventory.existingFiles) {
  assert.match(record.sha256, /^[a-f0-9]{64}$/);
  const bodyPath = path.join(archiveRoot, 'theme', ...normalize(record.path).split('/'));
  assert(fs.existsSync(bodyPath), `${record.path}: archived body missing`);
  const stat = fs.statSync(bodyPath);
  assert(stat.isFile(), `${record.path}: archived body is not a file`);
  assert.equal(stat.size, record.size, `${record.path}: byte size mismatch`);
  assert.equal(hash(bodyPath), record.sha256, `${record.path}: SHA-256 mismatch`);
}

for (const record of inventory.absentFiles) {
  const bodyPath = path.join(archiveRoot, 'theme', ...normalize(record.path).split('/'));
  assert(!fs.existsSync(bodyPath), `${record.path}: absent path unexpectedly has a rollback body`);
  const markerPath = path.join(archiveRoot, ...normalize(record.marker).split('/'));
  assert(fs.existsSync(markerPath), `${record.path}: missing-file marker absent`);
  const marker = JSON.parse(fs.readFileSync(markerPath, 'utf8'));
  assert.equal(marker.shopId, inventory.shop.id, `${record.path}: marker shop mismatch`);
  assert.equal(marker.themeId, inventory.theme.id, `${record.path}: marker theme mismatch`);
  assert.equal(marker.path, record.path, `${record.path}: marker path mismatch`);
  assert.equal(marker.status, 'ABSENT', `${record.path}: marker status mismatch`);
}

const enumerate = (root) => {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const current = path.join(root, entry.name);
    return entry.isDirectory() ? enumerate(current) : [normalize(path.relative(path.join(archiveRoot, 'theme'), current))];
  });
};
assert.deepEqual(enumerate(path.join(archiveRoot, 'theme')).sort(), existingPaths, 'Archive theme directory contains missing or unrelated files');

for (const forbidden of ['accessToken', 'access_token', 'authorizationHeader', 'password', 'customerEmail']) {
  assert(!inventoryText.includes(`\"${forbidden}\"`), `Inventory must not store ${forbidden}`);
}

console.log(JSON.stringify({
  archiveRoot,
  shopId: inventory.shop.id,
  themeId: inventory.theme.id,
  existingBodies: existingPaths.length,
  absentMarkers: absentPaths.length,
  sha256Verified: true,
  deterministicRestorationReady: true,
}));
