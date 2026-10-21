'use strict';
// Opt-in development orchestrator. A single CLI create and all browser work
// share this process. The signed URL is never an argument, environment variable,
// trace, screenshot, artifact, stdout line or persistence-hook payload.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const core = require('./lib/epic-f-nonpersistent-preview');
const { localReference, runBrowser, runCleanupBrowser } = require('./lib/epic-f-preview-browser');
function capture(executable, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { ...options, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; }); child.stderr.on('data', chunk => { stderr += chunk; });
    const timer = setTimeout(() => child.kill(), 90000);
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', exit => { clearTimeout(timer); child.stdin.destroy(); resolve({ exit, stdout, stderr }); });
  });
}
function parsePreview(raw, redact) {
  let preview = null;
  // Reparse the retained success response locally; this never issues a request.
  const clean = raw.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '').trim();
  const candidates = [clean, ...clean.split(/\r?\n/), clean.slice(clean.indexOf('{'), clean.lastIndexOf('}') + 1)];
  for (const candidate of candidates) {
    try { const value = JSON.parse(candidate); if (typeof value.url === 'string' && typeof value.preview_identifier === 'string') preview = value; } catch {}
  }
  if (!preview) throw new Error('Successful preview URL/identifier could not be parsed; no retry permitted');
  const url = new URL(preview.url);
  redact.register(preview.url, preview.preview_identifier, url.hostname, ...url.searchParams.values());
  assert.equal(url.protocol, 'https:'); assert.ok(/\.shopifypreview\.com$/i.test(url.hostname), 'Unexpected signed-preview origin');
  return { url: preview.url, identifierHash: core.hash(preview.preview_identifier), urlHash: core.hash(preview.url),
    safe: { origin: '[SIGNED_PREVIEW_HOST_REDACTED]', path: url.pathname, queryNames: [...url.searchParams.keys()] } };
}
async function stateHook(directory, phase, progress) {
  const requestedAt = new Date().toISOString();
  fs.writeFileSync(path.join(directory, `request-${phase}.json`), JSON.stringify({ phase, requestedAt, operation: 'READ_ONLY_PERSISTENCE_SNAPSHOT', target: core.TARGET }) + '\n');
  progress({ phase: 'persistence-hook', requested: phase });
  const filename = path.join(directory, `state-${phase}.json`), deadline = Date.now() + 15 * 60 * 1000;
  while (Date.now() < deadline) {
    if (fs.existsSync(filename)) {
      let snapshot; try { snapshot = core.read(filename); } catch { await new Promise(resolve => setTimeout(resolve, 250)); continue; }
      assert.ok(['identity','inventory','products'].every(k => snapshot[k]?.startedAt >= requestedAt && snapshot[k]?.completedAt >= requestedAt), 'Persistence-hook read is stale');
      return snapshot;
    }
    // An awaited timer holds the event loop open even when parent stdin is EOF.
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`Read-only persistence hook timed out: ${phase}`);
}
async function main() {
  const args = process.argv.slice(2), verifyOnly = args.includes('--verify-only');
  assert.ok(verifyOnly || args.includes('--run'), 'Use --verify-only or explicit --run');
  const directory = path.resolve(args.find(a => a.startsWith('--run-directory='))?.slice(16) || 'test-results/epic-f/nonpersistent-browser');
  const allowedRoot = path.resolve('test-results');
  assert.ok(directory.startsWith(allowedRoot + path.sep), 'Run artifacts must remain inside ignored test-results');
  const redact = core.redactor();
  const progress = value => console.log(JSON.stringify(redact.clean(value)));
  const save = (filename, value) => { const text = JSON.stringify(redact.clean(value), null, 2) + '\n'; redact.assertClean(text); fs.writeFileSync(path.join(directory, filename), text); };
  const sourceBinding = args.find(a=>a.startsWith('--source-binding='))?.slice(17) || null;
  const prepared = core.prepare(directory, sourceBinding), reference = await localReference(prepared.css);
  assert.ok(reference.equal && reference.lfSourceTextMatches, 'Local external/inline canonical CSSOM mismatch');
  save('local-proof.json', { ...prepared.proof, layerBReference: reference });
  progress({ phase: 'local-verification', payloadSha256: prepared.proof.payloadSha256, cssSha256: core.CSS_SHA, reference });
  if (verifyOnly) return;
  const cliEntry = args.find(a => a.startsWith('--cli-entry='))?.slice(12);
  assert.ok(cliEntry && fs.existsSync(cliEntry), 'Provide the installed CLI bin/run.js via --cli-entry');
  const cliRoot = path.dirname(path.dirname(cliEntry)); assert.equal(core.read(path.join(cliRoot, 'package.json')).version, '4.8.3');
  const observer = path.resolve('scripts/lib/epic-f-preview-response-observer.cjs');
  // Pass preload as a Node argument, avoiding Windows NODE_OPTIONS quoting.
  // Prove it loads locally before reserving any remote create.
  const preload = await capture(process.execPath, ['--require', observer, '-e', 'process.stdout.write("OBSERVER_READY");'], { env: { ...process.env, NODE_OPTIONS: '' } });
  assert.equal(preload.exit, 0, 'Response observer local preflight failed'); assert.equal(preload.stdout, 'OBSERVER_READY');
  let signedUrl = null, captured = null, parsed = null, before = null;
  const evidence = { startedAt: new Date().toISOString(), kind: 'NONPERSISTENT_EQUIVALENT_CSS_SHOPIFY_BROWSER_VALIDATION',
    localProof: prepared.proof, cssReference: reference, previewCreates: 0, creation: null, browser: null, persistence: {},
    signedCredentialsPersisted: false, productionExcluded: core.PRODUCTION, persistentMutations: 0, status: 'STARTED' };
  let reserved = false;
  try {
    before = await stateHook(directory, 'before', progress); evidence.persistence.before = core.assertState(before);
    core.reserveSession(directory); reserved = true; evidence.previewCreates = 1;
    const cliArgs = ['--require', observer, cliEntry, 'theme', 'preview', `--store=${core.STORE}`, `--theme=${core.TARGET}`, `--overrides=${prepared.payloadPath}`, '--json'];
    const startedAt = new Date().toISOString();
    captured = await capture(process.execPath, cliArgs, { env: { ...process.env, CI: '1', OPT_OUT_INSTRUMENTATION: 'true',
      NODE_OPTIONS: '' } });
    const observations = captured.stderr.split(/\r?\n/).filter(l => l.includes('__RHINO_PREVIEW_RESPONSE__')).map(l => JSON.parse(l.slice(l.indexOf('__RHINO_PREVIEW_RESPONSE__') + 26)));
    evidence.creation = { startedAt, completedAt: new Date().toISOString(), cliVersion: '4.8.3', autoUpgradeSuppression: 'CI=1',
      command: `shopify theme preview --store=${core.STORE} --theme=${core.TARGET} --overrides=<ignored-run-directory>/overrides.json --json`,
      exit: captured.exit, httpStatus: observations.at(-1)?.status || null, requestId: observations.at(-1)?.requestId || null, observedCreateRequests: observations.length,
      payloadSha256: prepared.proof.payloadSha256, fileCount: prepared.proof.fileCount };
    assert.equal(observations.length, 1, 'One-session request cap violated'); assert.equal(observations[0].target, core.TARGET);
    if (captured.exit !== 0 || observations[0].status !== 200) { evidence.creation.error = redact.text(captured.stderr); throw new Error('Preview creation failed; no retry'); }
    // Shopify's output helper writes --json success to stderr on this CLI.
    parsed = parsePreview(captured.stdout + '\n' + captured.stderr, redact); signedUrl = parsed.url;
    evidence.creation.previewIdentifierSha256 = parsed.identifierHash; evidence.creation.completeSignedUrlSha256 = parsed.urlHash; evidence.creation.preview = parsed.safe;
    parsed = null; captured.stdout = ''; captured.stderr = ''; captured = null;
    save('checkpoint.json', evidence); progress({ phase: 'preview-created', ...evidence.creation });
    const post = await stateHook(directory, 'post-create', progress); evidence.persistence.postCreate = core.assertState(post, before);
    progress({ phase: 'pre-browser-persistence', passed: true });
    const browserRunner = args.includes('--cleanup') ? runCleanupBrowser : runBrowser;
    evidence.browser = await browserRunner({ signedUrl, css: prepared.css, reference, redact, progress });
    evidence.status = evidence.browser.allPassed ? 'VERIFIED_NONPERSISTENT' : evidence.browser.stopReason || 'BROWSER_FINDINGS';
  } catch (error) { evidence.status = 'STOPPED'; evidence.error = redact.text(error.stack || error.message); progress({ phase: 'stopped', error: evidence.error }); }
  finally {
    if (reserved && before) {
      try { const final = await stateHook(directory, 'final', progress); evidence.persistence.final = core.assertState(final, before); }
      catch (error) { evidence.status = 'STOP_PERSISTENCE_UNVERIFIED_OR_DRIFT'; evidence.finalStateError = redact.text(error.stack || error.message); }
    }
    if (parsed) parsed.url = null; if (captured) { captured.stdout = ''; captured.stderr = ''; }
    signedUrl = null; parsed = null; captured = null;
    evidence.completedAt = new Date().toISOString(); evidence.inMemorySecretDisposed = true;
    save('result.json', evidence);
    progress({ phase: 'complete', status: evidence.status, previewCreates: evidence.previewCreates, responsiveCells: evidence.browser?.cells.length || 0, persistentStateUnchanged: !!evidence.persistence.final?.allFileRecordsUnchanged, inMemorySecretDisposed: true });
    redact.clear(); if (evidence.status !== 'VERIFIED_NONPERSISTENT') process.exitCode = 1;
  }
}
if (require.main === module) main().catch(error => { console.error(core.redactor().text(error.stack || error.message)); process.exitCode = 1; });
module.exports = { capture, parsePreview, stateHook };
