'use strict';
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const folder = 'test-results/epic-f/f2';
fs.mkdirSync(folder, { recursive: true });
const results = [];
function run(command, args, required = true) {
  const p = spawnSync(command, args, { encoding: 'utf8' });
  const display = command === process.execPath ? (args[0] === process.env.npm_execpath ? 'npm ' + args.slice(1).join(' ') : 'node ' + args.join(' ')) : command + ' ' + args.join(' ');
  const log = `${folder}/check-${results.length + 1}.txt`;
  fs.writeFileSync(log, (p.stdout || '') + (p.stderr || '') + (p.error ? String(p.error) : ''));
  results.push({ command: display, exitCode: p.status ?? 1, required, log });
  console.log(`${display}: exit ${p.status ?? 1}`);
}
for (const script of ['validate:epic-f-machine', 'test:epic-f-contact-context', 'test:machine-shell', 'validate:epic-f-batch-f1']) {
  run(process.execPath, [process.env.npm_execpath, 'run', script]);
}
run('git', ['diff', '--check']);
const f1 = JSON.parse(fs.readFileSync('test-results/epic-f/batch-f1-validation.json', 'utf8'));
const browser = JSON.parse(fs.readFileSync(`${folder}/playwright.json`, 'utf8'));
const historicalExpected = require('../tests/fixtures/epic-f-historical-diagnostics.json');
const historicalComparison = Object.entries(historicalExpected).map(([name, expected]) => {
  const findings = fs.readFileSync(`test-results/epic-f/validation/${name}.txt`, 'utf8').split(/\r?\n/).filter(l => l.startsWith('- '));
  const sha256 = createHash('sha256').update(findings.join('\n')).digest('hex');
  return { name, findingCount: findings.length, unchanged: expected.findingCount === findings.length && expected.sha256 === sha256 };
});
results.push({ command: 'F2 historical diagnostic comparison', exitCode: historicalComparison.every(r => r.unchanged) ? 0 : 1, required: true });
function browserEvidence(suites) {
  return suites.flatMap(s => [...(s.specs || []).map(spec => ({ name: spec.title,
    status: spec.tests[0].status, evidence: spec.tests[0].results.flatMap(r => r.attachments || [])
      .filter(a => a.contentType === 'application/json' && a.body)
      .map(a => ({ name: a.name, data: JSON.parse(Buffer.from(a.body, 'base64').toString()) })) })), ...browserEvidence(s.suites || [])]);
}
const exitCode = results.some(r => r.required && r.exitCode !== 0) ? 1 : 0;
const report = { batch: 'F2', assessedAt: new Date().toISOString(), exitCode,
  scope: 'repository and deterministic local Chromium only',
  status: { 'F-PBI-002': exitCode ? 'checks failed' : 'complete repository scope', 'F-PBI-003': exitCode ? 'checks failed' : 'complete fixture scope',
    'F-PBI-012': exitCode ? 'checks failed' : 'complete repository scope; adapter dormant',
    'F-PBI-014A': results[2].exitCode ? 'checks failed' : 'complete local shell scope', 'F-PBI-014B': 'open', 'F-PBI-013': 'open; F-DEC-001 unresolved' },
  results, f1RequiredRegression: f1.results.filter(r => r.requiredForBatch),
  historicalDiagnostics: f1.results.filter(r => !r.requiredForBatch),
  historicalComparison,
  browser: browser.stats,
  browserTests: browserEvidence(browser.suites),
  deferredLiveChecks: ['Shopify renderer parity', 'Preview snapshots', 'Live template assignment verification', 'Native payment provider output', 'Global header/footer Epic C reflow'],
  deferred014B: ['zero/one/multiple approved media', 'media modal focus', 'populated specifications and long values', 'included/optional contents', 'contextual items', 'delivery/pickup', 'warranty/support', 'resources/downloads/video', 'later disclosure/details keyboard journeys'],
  adminMutationOccurred: false, productTemplateAssignmentOccurred: false, themePushedOrPublished: false,
};
fs.writeFileSync(`${folder}/batch-f2-validation.json`, JSON.stringify(report, null, 2) + '\n');
console.log(`F2 gate: exit ${exitCode}. F-PBI-014B and F-PBI-013 remain open; historical diagnostics retain their own exit codes.`);
process.exitCode = exitCode;
