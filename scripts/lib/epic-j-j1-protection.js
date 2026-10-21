'use strict';
// Explicit two-file successor only. Historical J0/F contracts remain immutable.
const fs = require('node:fs'), assert = require('node:assert/strict');
const E = require('./epic-e-owner-response-adapter');
const J = require('./epic-j-j0');
const MANIFEST = 'data/epic-j-j1-source-successor.json';
const REVIEWED_MANIFEST_SHA256 = '6656356c225ee086c611381152d196b19e79782ba6dbe9a2ef07d14ad4f868db';
function verify() {
  const body = fs.readFileSync(MANIFEST);
  assert.equal(E.hash(body), REVIEWED_MANIFEST_SHA256, 'Unreviewed J1 successor');
  const successor = JSON.parse(body), baseline = E.read(J.CONTRACT);
  assert.equal(E.hash(fs.readFileSync(J.CONTRACT)), successor.baseline.sha256, 'Historical J0 contract modified');
  assert.equal(successor.id, 'J1-2026-10-20-NATIVE-CART');
  assert.deepEqual(successor.runtime.map(r => r.path).sort(), ['assets/component-cart-items.css', 'assets/product-form.js']);
  for (const r of successor.runtime) {
    assert.equal(baseline.protectedSources.find(p => p.path === r.path)?.sha256, r.oldSha256, 'Unknown runtime predecessor');
    assert.equal(E.hash(fs.readFileSync(r.rollback)), r.oldSha256, 'Rollback source drift');
    assert.equal(E.hash(fs.readFileSync(r.path)), r.sha256, 'Unreviewed runtime source');
  }
  assert.equal(E.hash(fs.readFileSync(successor.before.path)), successor.before.sha256, 'J1 starting evidence modified');
  const before = E.read(successor.before.path), allowed = new Map(successor.reviewedRepositoryChanges.map(r => [r.path, r]));
  const changed = [];
  for (const [path, hash] of Object.entries(before)) {
    assert(fs.existsSync(path), 'Starting source removed: ' + path);
    const current = E.hash(fs.readFileSync(path));
    if (current !== hash) {
      const approval = allowed.get(path);
      assert(approval && approval.oldSha256 === hash && approval.sha256 === current, 'Unrelated or unreviewed source change: ' + path);
      changed.push(path);
    }
  }
  for (const r of successor.reviewedRepositoryChanges) {
    assert.equal(before[r.path], r.oldSha256);
    assert.equal(E.hash(fs.readFileSync(r.path)), r.sha256);
  }
  for (const r of successor.addedSources) {
    assert.equal(before[r.path], undefined, 'New source existed at start');
    const body = r.path === 'scripts/lib/epic-j-j1-protection.js'
      ? fs.readFileSync(r.path, 'utf8').replace(REVIEWED_MANIFEST_SHA256, 'J1_MANIFEST_HASH_PENDING') : fs.readFileSync(r.path);
    assert.equal(E.hash(body), r.sha256, 'New J1 source drift');
  }
  const currentFiles = require('node:child_process').execFileSync('rg', ['--files', '--hidden', '-g', '!.git', '-g', '!node_modules', '-g', '!test-results', '-g', '!playwright-report'], { encoding: 'utf8' }).trim().split(/\r?\n/).map(p => p.replaceAll('\\', '/'));
  const knownAdded = new Set(successor.addedSources.map(r => r.path).concat(MANIFEST));
  for (const p of currentFiles) assert(p.startsWith(successor.evidenceDirectory + '/') || before[p] || knownAdded.has(p), 'Unapproved new file: ' + p);
  const expected = structuredClone(baseline);
  for (const r of successor.reviewedRepositoryChanges) {
    const source = expected.protectedSources.find(p => p.path === r.path);
    if (source) { assert.equal(source.sha256, r.oldSha256); source.sha256 = r.sha256; }
  }
  const protectedState = J.protectedState(expected);
  return { successor, protectedState, startingFilesChecked: Object.keys(before).length, changed, historicalEvidenceChanged: [], approvalRecordsChanged: [], deploymentAuthorized: false };
}
function nativeSurfaceMatches(path, oldSha256, text) {
  const { successor } = verify();
  const r = successor.runtime.find(r => r.path === path);
  assert(r && r.oldNormalizedSha256 === oldSha256, 'Unknown native predecessor');
  assert.equal(E.hash(text.replaceAll('\r\n', '\n')), r.normalizedSha256, 'Unreviewed native successor bytes');
  return true;
}
module.exports = { MANIFEST, verify, nativeSurfaceMatches };
