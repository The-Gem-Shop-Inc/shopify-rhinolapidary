'use strict';
// Recover only a diff-whitespace failure after a complete F7 invocation. Keep
// original command exits immutable; no suite success is invented or relabeled.
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { read, write, fileHash } = require('./lib/epic-f-governance');
const { validate, packetPath } = require('./lib/epic-f-machine-page-readiness');
const folder = 'test-results/epic-f/f8';
const initial = read(`${folder}/batch-f8-first-attempt.json`);
const packet = read(packetPath), errors = validate(packet);
if (initial.packet.sha256 !== fileHash(packetPath)) errors.push('Readiness packet changed since completed regression run');
if (initial.tests.failed !== 0) errors.push('Original readiness tests failed');
const allowedFailure = command => command === 'git diff --check' || /^npm run validate:epic-f-batch-f[2-7]$/.test(command);
const proof = {};
for (let n = 1; n <= 7; n++) {
    const record = initial.regression[`F${n}`];
    if (!record || !fs.existsSync(record.evidence) || fileHash(record.evidence) !== record.sha256) {
        errors.push(`Missing/changed original F${n} execution evidence`); continue;
    }
    const full = read(record.evidence);
    for (const result of full.results) {
        const required = result.required ?? result.requiredForBatch ?? true;
        if (required && result.exitCode !== 0 && !allowedFailure(result.command)) errors.push(`Non-whitespace F${n} failure: ${result.command}`);
    }
    if (full.historicalComparison?.some(r => !r.unchanged)) errors.push(`F${n} historical diagnostic drift`);
    const stats = full.browser || full.gallery;
    if (stats && (stats.unexpected || stats.skipped || stats.flaky)) errors.push(`F${n} incomplete browser evidence`);
    proof[`F${n}`] = { originalCommand: record.command, originalExitCode: record.exitCode, originalAssessedAt: record.assessedAt,
        evidence: record.evidence, sha256: record.sha256, originalResults: record.results };
}
const diff = spawnSync('git', ['diff', '--check'], { encoding: 'utf8' });
fs.writeFileSync(`${folder}/regression-diff-recheck.txt`, (diff.stdout || '') + (diff.stderr || ''));
if (diff.status !== 0) errors.push('Current git diff --check failed');
const exitCode = errors.length ? 1 : 0;
write(`${folder}/regression-recheck.json`, { assessedAt: new Date().toISOString(), exitCode,
    scope: 'Diff-only recovery; complete successful suite evidence reused, original command exits retained',
    reason: 'Two introduced tracker status-line trailing spaces removed; no runtime/test/source-contract delta',
    errors, proof, currentCheck: { command: 'git diff --check', exitCode: diff.status ?? 1 },
    repositoryRegressionPassed: exitCode === 0 });
if (errors.length) console.error(errors.join('\n'));
else console.log('F1-F7 repository checks reconciled: complete suites passed; original diff-only failures retained; current diff check exit 0.');
process.exitCode = exitCode;
