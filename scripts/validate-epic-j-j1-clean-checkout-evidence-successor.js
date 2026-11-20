'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const successorPath = path.join(root, 'data/epic-j-j1-clean-checkout-evidence-successor.json');
const successor = JSON.parse(fs.readFileSync(successorPath, 'utf8'));
const historicalPath = path.join(root, successor.historicalContract.path);
const historical = JSON.parse(fs.readFileSync(historicalPath, 'utf8'));
const sha256 = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

assert.equal(successor.schemaVersion, 1);
assert.equal(successor.contentChanged, false);
assert.equal(sha256(historicalPath), successor.historicalContract.sha256);
assert.equal(successor.historicalContract.modified, false);
assert.equal(successor.records.length, historical.cleanCheckoutEvidence.length);

for (const record of successor.records) {
  const predecessor = historical.cleanCheckoutEvidence.find(({ path: file }) => file === record.historicalPath);
  assert(predecessor, `${record.historicalPath}: historical record missing`);
  assert.equal(predecessor.sha256, record.sha256, `${record.historicalPath}: historical hash changed`);
  assert.match(record.historicalPath, /\.log$/);
  assert.match(record.currentPath, /\.txt$/);
  assert(!fs.existsSync(path.join(root, record.historicalPath)), `${record.historicalPath}: forbidden historical path remains tracked locally`);
  const currentPath = path.join(root, record.currentPath);
  assert(fs.existsSync(currentPath), `${record.currentPath}: successor transcript missing`);
  assert.equal(sha256(currentPath), record.sha256, `${record.currentPath}: transcript bytes changed`);
}

console.log(`Epic J clean-checkout evidence successor valid: ${successor.records.length} byte-identical transcripts, historical contract unchanged.`);
