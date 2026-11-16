'use strict';

const assert = require('node:assert/strict');
const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const integration = require('./validate-j2-g4-catalog-cart-integration');

const root = path.resolve(__dirname, '..');
const TOAST_PATHS = integration.TOAST_KEYS.map((key) => `sections.cart_feedback.${key}`);

const parseJsonc = (text) => JSON.parse(String(text).replace(/^\/\*[\s\S]*?\*\/\s*/, ''));

function compareCandidate({ candidateText, integrationText, remoteText }) {
  const candidate = parseJsonc(candidateText);
  const original = parseJsonc(integrationText);
  const remote = parseJsonc(remoteText);
  const candidateLeaves = integration.flattenLeaves(candidate);
  const originalLeaves = integration.flattenLeaves(original);
  const remoteLeaves = integration.flattenLeaves(remote);

  assert.equal(Object.keys(remoteLeaves).length, 526, 'Remote preview baseline must contain 526 leaves');
  assert.equal(Object.keys(candidateLeaves).length, 533, 'Reconciled candidate must contain 533 leaves');
  assert.deepEqual(Object.keys(candidateLeaves).sort(), Object.keys(originalLeaves).sort(), 'Candidate key set differs from immutable integration');
  assert.equal(candidateLeaves[integration.QUOTE_KEY], integration.AUTHORIZED_QUOTE, 'Authorized quote explanation mismatch');

  for (const key of Object.keys(originalLeaves)) {
    if (key === integration.QUOTE_KEY) continue;
    assert.deepEqual(candidateLeaves[key], originalLeaves[key], `${key}: unauthorized integration-locale deviation`);
  }

  const added = Object.keys(candidateLeaves).filter((key) => !(key in remoteLeaves)).sort();
  const removed = Object.keys(remoteLeaves).filter((key) => !(key in candidateLeaves)).sort();
  const changed = Object.keys(remoteLeaves).filter((key) => key in candidateLeaves && candidateLeaves[key] !== remoteLeaves[key]).sort();
  assert.deepEqual(added, [...TOAST_PATHS].sort(), 'Remote-to-candidate additions must be exactly the seven toast keys');
  assert.deepEqual(removed, [], 'Original preview translation key removed');
  assert.deepEqual(changed, [], 'Original preview translation value changed');

  for (const key of TOAST_PATHS) {
    assert.equal(typeof candidateLeaves[key] === 'string' && candidateLeaves[key].trim() !== '', true, `${key}: toast value missing or empty`);
  }

  return {
    remoteLeaves: Object.keys(remoteLeaves).length,
    candidateLeaves: Object.keys(candidateLeaves).length,
    preservedRemoteLeaves: Object.keys(remoteLeaves).length,
    addedToastKeys: added.length,
    changedRemoteValues: changed.length,
  };
}

function validate({ remotePath } = {}) {
  assert(remotePath, 'Usage: node scripts/validate-j2-g4-locale-reconciliation.js <fresh-remote-en.default.json>');
  const integrationText = cp.execFileSync('git', ['show', `${integration.INTEGRATION}:${integration.LOCALE}`], { cwd: root, encoding: 'utf8' });
  return compareCandidate({
    candidateText: fs.readFileSync(path.join(root, integration.LOCALE), 'utf8'),
    integrationText,
    remoteText: fs.readFileSync(path.resolve(remotePath), 'utf8'),
  });
}

if (require.main === module) {
  try {
    console.log(JSON.stringify(validate({ remotePath: process.argv[2] })));
  } catch (error) {
    console.error(error.stack);
    process.exitCode = 1;
  }
}

module.exports = { TOAST_PATHS, compareCandidate, parseJsonc, validate };
