'use strict';

// Seal the interrupted QA disposition. This command never navigates Shopify,
// authenticates, runs certification samples, or changes frozen recorder code.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const G = require('./lib/epic-f-live-performance-campaign-v2');
const { validate } = require('./validate-epic-f-live-performance-v2');
const DIR = G.DIR;
const COMPLETION = DIR + '/completion-2026-10-10';
const MANIFEST = DIR + '/evidence-manifest.json';
const fileEvidence = filename => ({ path: filename, sha256: G.hash(fs.readFileSync(filename)), bytes: fs.statSync(filename).size });
const write = (filename, value) => fs.writeFileSync(filename, JSON.stringify(value, null, 2) + '\n');
function filesIn(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    const filename = folder + '/' + entry.name;
    return entry.isDirectory() ? filesIn(filename) : [filename];
  }).sort();
}
function verifyFiles(files) {
  for (const file of files) assert.equal(G.hash(fs.readFileSync(file.path)), file.sha256, 'Changed evidence: ' + file.path);
}
function stoppedState() {
  const campaign = G.read(DIR + '/campaign.json');
  assert.equal(campaign.decision, 'BLOCKED_MEASUREMENT_INTEGRITY');
  assert.equal(campaign.attempted, 2);
  assert.equal(campaign.valid, 0);
  assert.equal(campaign.invalid, 2);
  assert.equal(campaign.retries, 1);
  assert.equal(campaign.records.length, 0);
  const current = G.read('data/epic-f-current-development-status.json');
  assert.equal(current.F_PBI_015B, campaign.decision);
  assert.equal(current.F_PBI_015, 'PARTIAL_CONTRACT_COMPLETE_LIVE_CERTIFICATION_INCOMPLETE');
  assert.equal(current.F_PBI_018B, 'NOT_BEGUN');
  assert.equal(current.releaseReadiness, 'NOT_READY');
  assert.equal(current.F_PBI_017B, 'COMPLETE');
  assert.equal(current.F_PBI_014B_currentShell, 'PASS');
  assert.equal(current.F_DEC_001, 'APPROVED_OPTION_A');
  return campaign;
}
function main() {
  assert.ok(process.argv.slice(2).every(arg => arg === '--verify'), 'Unknown argument');
  if (process.argv.includes('--verify')) {
    const manifest = G.read(MANIFEST);
    verifyFiles(manifest.files);
    verifyFiles(G.read(COMPLETION + '/preservation.json').files);
    G.unchanged(G.read(DIR + '/campaign-start.json').frozenMethodology);
    stoppedState();
    console.log(JSON.stringify({ verified: manifest.files.length, historicalAndStoppedEvidenceUnchanged: true, decision: manifest.decision, newLiveSamples: 0 }));
    return;
  }
  assert.ok(!fs.existsSync(MANIFEST), 'Already sealed; use --verify');
  fs.mkdirSync(COMPLETION, { recursive: true });
  const priorFiles = filesIn(DIR).filter(filename => !filename.startsWith(COMPLETION + '/')).map(fileEvidence);
  const historical = G.read(DIR + '/historical-preservation.json');
  assert.equal(historical.files.length, 73);
  for (const file of historical.files) assert.equal(G.hash(fs.readFileSync(file.path)), file.expected, 'Historical evidence changed: ' + file.path);
  const campaign = stoppedState();

  // Existing validator writes only its derived assessments. Redirect these to
  // new evidence so no October 7 artifact is rewritten on resume.
  const originalWrite = G.write;
  const allowed = new Set(['persistent-no-change.json', 'invalid-lifecycle-diagnosis.json', 'historical-cold-diagnostic-preserved.json', 'evidence-validation.json']);
  let proof;
  try {
    G.write = (name, value) => { assert.ok(allowed.has(name)); write(COMPLETION + '/' + name, value); };
    proof = validate();
  } finally { G.write = originalWrite; }
  assert.equal(proof.evidenceValid, true);
  assert.equal(proof.recorderLiveIntegrityConfirmed, false);
  const localChecks = [
    ['lifecycle-provenance-tests.json', 32], ['profile-cache-tests.json', 22],
    ['schema-evidence-tests.json', 3], ['safety-tests.json', 7]
  ].map(([filename, count]) => {
    const result = G.read(DIR + '/' + filename);
    assert.equal(result.passed, count); assert.equal(result.failed, 0);
    return { ...fileEvidence(DIR + '/' + filename), passed: count, failed: 0, reusedSavedEvidence: true };
  });
  const aggregatePath = 'test-results/epic-f/f8/batch-f8-validation.json';
  const aggregate = G.read(aggregatePath);
  assert.equal(aggregate.exitCode, 0);
  assert.ok(aggregate.results.every(result => result.exitCode === 0));
  const regression = Object.entries(aggregate.regression).map(([batch, result]) => {
    assert.equal(result.exitCode, 0);
    assert.equal(G.hash(fs.readFileSync(result.evidence)), result.sha256);
    return { batch, ...fileEvidence(result.evidence), exitCode: 0, assessedAt: result.assessedAt };
  });
  const aggregateFiles = [...new Set([aggregatePath, ...aggregate.results.map(result => result.log), ...regression.map(result => result.path)])];
  for (const filename of aggregateFiles) fs.copyFileSync(filename, COMPLETION + '/' + path.basename(filename));
  write(COMPLETION + '/repository-regression.json', { originalAggregate: fileEvidence(aggregatePath), completedAt: aggregate.assessedAt, exitCode: 0, regression, originalResults: aggregate.results, reusedCompleteSuccessfulExecution: true, newLiveSamples: 0 });

  const commands = [];
  for (const [executable, args] of [
    [process.execPath, ['scripts/test-epic-f-performance.js']],
    [process.execPath, ['scripts/validate-json-registers.js']],
    ['python', ['scripts/validate-theme-repository.py']],
    ['git', ['-c', 'core.safecrlf=false', 'diff', '--check']]
  ]) {
    const result = spawnSync(executable, args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    const log = COMPLETION + '/command-' + (commands.length + 1) + '.txt';
    fs.writeFileSync(log, (result.stdout || '') + (result.stderr || '') + (result.error ? String(result.error) : ''));
    commands.push({ command: [executable === process.execPath ? 'node' : executable, ...args].join(' '), exitCode: result.status, log });
    assert.equal(result.status, 0, 'Validation failed: ' + args.join(' '));
  }
  verifyFiles(priorFiles);
  write(COMPLETION + '/preservation.json', { checkedAt: new Date().toISOString(), historicalFilesVerified: 73, stoppedV2FilesVerified: priorFiles.length, changed: 0, files: priorFiles });
  const lifecycle = campaign.attemptJournal.map(attempt => {
    const observation = G.read(attempt.evidence);
    return { attempt: attempt.attempt, cache: attempt.cache, invalid: true,
      unresolvedCount: observation.sample.resources.filter(resource => resource.terminalState === 'UNRESOLVED').length,
      missingBytes: observation.sample.resources.filter(resource => resource.bytes === null).map(resource => ({ url: resource.url, terminalState: resource.terminalState, terminalEvent: resource.terminalEvent, failure: resource.failure, provenance: resource.provenance })),
      ambiguities: observation.networkLifecycle.ambiguity,
      actualDrainMs: observation.networkLifecycle.window.actualDrainMs,
      invalidInventorySize: observation.sample.resources.length };
  });
  const validation = { completedAt: new Date().toISOString(), decision: campaign.decision, certificatePassed: false,
    scope: 'Resume evidence finalization only; no new live samples, traces, or Admin reads',
    commands, existingEvidenceValidator: { command: 'validate() from scripts/validate-epic-f-live-performance-v2.js, derived writes redirected to completion folder', exitCode: 0 },
    savedLocalChecks: localChecks, savedRepositoryAggregate: { command: 'npm run validate:epic-f-batch-f8', exitCode: aggregate.exitCode, completedAt: aggregate.assessedAt, evidence: COMPLETION + '/repository-regression.json' },
    savedCanary: { attempted: 2, valid: 0, invalid: 2, retries: 1, decision: campaign.decision, runnerDeclaredIntegrityStopCode: 3, actualProcessExitCode: null, note: 'Previous process exit was not persisted; declared stop code is not presented as an observed exit.' },
    exactIncompleteLifecycle: lifecycle, historicalFilesUnchanged: 73, stoppedV2ArtifactsUnchanged: priorFiles.length,
    newLiveSamples: 0, freshAdminReadOnResume: false, persistentComparisonReadCompletedAt: proof.persistent.afterReadCompletedAt,
    budgetsChanged: false, throttleChanged: false, runtimeChanged: false, ShopifyPersistentMutations: 0 };
  write(DIR + '/validation.json', validation);
  const additional = [
    ...G.toolPaths, 'scripts/complete-epic-f-live-performance-v2-evidence.js',
    'scripts/validate-epic-f-live-performance-v2.js', 'scripts/finalize-epic-f-live-performance-v2.js',
    'scripts/test-epic-f-live-performance-v2-safety.js', 'scripts/diagnose-epic-f-live-performance-v2.js',
    'docs/project/epic-f-015b-recorder-v2-integrity.md', 'docs/project/epic-f-015b-live-performance-certification.md',
    'docs/rhino-lapidary-pbi-tracker-epic-f.md', 'data/epic-f-current-development-status.json', 'data/epic-f-current-shopify-eligibility.json'
  ];
  const files = [...new Set([...filesIn(DIR), ...additional])].filter(filename => filename !== MANIFEST).sort().map(fileEvidence);
  write(MANIFEST, { recordedAt: new Date().toISOString(), decision: campaign.decision, methodIdentity: campaign.methodIdentity,
    methodSha256: campaign.methodSha256, sourceBindingSha256: campaign.sourceBinding.sourceBindingSha256,
    profileId: campaign.profileId, manifestSelfExcluded: true, priorStoppedEvidencePreserved: true,
    historicalFilesVerified: 73, runtimeFilesModified: [], budgetsChanged: false, newLiveSamples: 0,
    ShopifyPersistentMutations: 0, files });
  verifyFiles(files);
  console.log(JSON.stringify({ sealed: files.length, decision: campaign.decision, attempted: 2, valid: 0, historicalFilesUnchanged: 73, newLiveSamples: 0, ShopifyPersistentMutations: 0 }));
}
if (require.main === module) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
