'use strict';
// Reconcile recorded actual remote bodies/inventories and preserve the task baseline.
// This is evidence verification, never a Shopify write or an approval renewal.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const E = require('./lib/epic-e-owner-response-adapter');
const R = require('./lib/epic-g-catalog');
const C = require('./lib/epic-g-catalog-entry');
const D = require('./deploy-epic-g-catalog-preview');

function run() {
  const read = name => E.read(`${R.DIR}/${name}.json`);
  const baseline = read('repository-before');
  const allowed = [...R.FILES, ...C.FILES, 'package.json', 'data/navigation-spec.json',
    'data/global-navigation-ia.json', 'data/epic-g-machine-routes.json',
    'docs/rhino-lapidary-pbi-tracker-epic-g.md', 'docs/project/epic-g-proposed-backlog.json'];
  const changed = [], missing = [];
  for (const row of baseline.files) {
    if (!fs.existsSync(row.path)) { missing.push(row.path); continue; }
    const sha256 = R.digest(row.path).sha256;
    if (sha256 !== row.sha256) changed.push({path:row.path,beforeSha256:row.sha256,afterSha256:sha256});
  }
  assert.deepEqual(missing, [], 'Pre-existing file disappeared');
  const preservationFailures = changed.filter(r => !allowed.includes(r.path));
  const release = R.verify(); C.verify();
  const protectedFiles = D.protectedState();
  const binding = require('./lib/epic-f-final-owner-binding').verify();
  const mainBefore = read('main-inventory-before'), mainAfter = read('main-inventory-after-entry');
  const previewBefore = read('preview-inventory-before'), previewAfter = read('preview-inventory-after-entry');
  assert.equal(mainAfter.role, 'MAIN'); assert.equal(previewAfter.role, 'UNPUBLISHED');
  assert.deepEqual(mainAfter.nodes, mainBefore.nodes, 'MAIN inventory changed');
  const files = [...R.FILES, ...C.FILES];
  const changedRemote = previewAfter.nodes.filter(n => previewBefore.nodes.find(p => p.filename === n.filename)?.checksumMd5 !== n.checksumMd5);
  assert.deepEqual(changedRemote.map(n => n.filename).sort(), files.slice().sort());
  assert(previewBefore.nodes.every(n => previewAfter.nodes.some(a => a.filename === n.filename)), 'Remote file deleted');
  const bodies = [...read('preview-files-after-correction-2').data.theme.files.nodes,
    ...read('preview-files-after-entry').data.theme.files.nodes];
  const remoteRuntime = files.map(path => {
    const node = bodies.find(n => n.filename === path); assert(node);
    const sha256 = E.hash(node.body.content); assert.equal(sha256, R.digest(path).sha256);
    const md5 = crypto.createHash('md5').update(node.body.content).digest('hex');
    assert.equal(md5, previewAfter.nodes.find(n => n.filename === path).checksumMd5);
    return {path, beforeMd5:previewBefore.nodes.find(n=>n.filename===path)?.checksumMd5||null,
      remoteMd5:md5,remoteSha256:sha256,localSha256:sha256};
  });
  const browser = read('deployed-browser');
  assert.equal(browser.phase, 'DEPLOYED_PREVIEW'); assert.equal(browser.overlay, false);
  assert.deepEqual(browser.failures, []); assert.equal(browser.destinations.length, 111);
  const cart = read('anonymous-cart'); assert.deepEqual(cart.failures, []); assert(cart.nativeCart.cleaned);
  const machines = read('regression-writes/epic-g/g3a-2026-10-19/deployed-browser');
  assert.deepEqual(machines.failures, []); assert.equal(machines.cells.length, 22);
  const sourceFiles = [...files, ...changed.map(r=>r.path), ...D.SOURCES,
    'scripts/report-epic-g-catalog.js','scripts/validate-epic-g-catalog.js',
    'scripts/probe-epic-g-catalog-baseline.js','data/epic-g-catalog-routes.json',
    'docs/architecture/epic-g-catalog-index-contract.md',
    'docs/project/implementation-records/g-pbi-005-batch-g3b.md'];
  const out = {at:new Date().toISOString(),sourceBinding:binding.bindingSha256,
    receiptExpiresAt:release.receiptExpiresAt,observationCapturedAt:release.observationCapturedAt,
    roleReleaseExpiresAt:release.expiresAt,existingFilesChecked:baseline.files.length,
    unchangedExistingFiles:baseline.files.length-changed.length,changed,preservationFailures,protectedFiles,
    themeFiles:{main:mainAfter.nodes.length,preview:previewAfter.nodes.length,
      MAINChanges:0,unrelatedPreviewChanges:0,settingsChanges:0,previewStillUnpublished:true},
    remoteRuntime,operations:{reportedConnectorReadQueries:32+read('theme-operation-log-final').length,
      individuallyLoggedQueries:read('admin-connector-log').operations.length+read('theme-operation-log-final').length,
      initialSnapshotQueriesCarriedFromContinuation:6,
      previewPushCommands:4,previewFileWriteOccurrences:9,uniquePreviewFiles:7,
      AdminCatalogMutations:0,MAINWrites:0,publicationEvents:0,
      nativeAnonymousCartPosts:cart.requests.length,cartCleaned:true,
      note:'Initial six theme reads are carried from continuation accounting; inventory/body snapshots persist, but the initial identity timestamp was not retained. CLI internal HTTP calls and browser GET counts are not inferred.'},
    G2FitLeaseRenewed:false,sourceFiles:[...new Set(sourceFiles)].map(R.digest)};
  fs.writeFileSync(`${R.DIR}/protected-state.json`, JSON.stringify(out,null,2)+'\n');
  console.log(JSON.stringify({existingFiles:out.existingFilesChecked,changed:changed.length,
    remoteFiles:remoteRuntime.length,MAINChanges:0,previewOnly:true,operations:out.operations}));
  assert.deepEqual(preservationFailures, [], 'Unrelated existing files changed; see preserved failure hashes in protected-state.json');
  return out;
}
if(require.main===module) { try { run(); } catch(e) { console.error(e.stack); process.exitCode=1; } }
module.exports = {run};
