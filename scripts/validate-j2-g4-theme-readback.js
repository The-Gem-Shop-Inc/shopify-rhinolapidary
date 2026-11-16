'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const repositoryRoot = path.resolve(__dirname, '..');
const readbackRoot = path.resolve(process.argv[2] || '');
assert(process.argv[2], 'Usage: node scripts/validate-j2-g4-theme-readback.js <readback-theme-root>');
const manifest = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'data/j2-g4-preview-deployment-manifest.json'), 'utf8'));
const expected = [...manifest.themeFiles, ...manifest.unchangedRuntimeDependencies];
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

for (const record of expected) {
  const file = path.join(readbackRoot, ...record.path.split('/'));
  assert(fs.existsSync(file), `${record.path}: readback missing`);
  assert.equal(hash(file), record.sha256, `${record.path}: readback SHA-256 mismatch`);
}

console.log(JSON.stringify({
  readbackRoot,
  uploadedFilesVerified: manifest.themeFiles.length,
  unchangedDependenciesVerified: manifest.unchangedRuntimeDependencies.length,
  sha256Verified: true,
}));
