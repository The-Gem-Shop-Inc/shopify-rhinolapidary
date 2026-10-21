'use strict';
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { read, write, fileHash } = require('./lib/epic-f-governance');
const folder = 'test-results/epic-f/f8';
fs.mkdirSync(folder, { recursive: true });
const results = [];
const recheck = process.argv.includes('--recheck-diff-only');
if (process.argv.slice(2).some(a => a !== '--recheck-diff-only')) throw new Error('Unknown F8 argument');
// F7 invokes F6 -> F5 -> F4 -> F3 -> F2 -> F1 exactly once. Historical
// source artifacts stay immutable; new execution evidence is recorded separately.
for (const script of ['validate:epic-f-machine-page-readiness', 'test:epic-f-machine-page-readiness', ...(recheck ? ['recheck:epic-f-batch-f8-regression'] : ['validate:epic-f-batch-f7']), 'theme:check']) {
    const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', script], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
    const log = `${folder}/${script.replaceAll(':', '-')}.txt`;
    fs.writeFileSync(log, (result.stdout || '') + (result.stderr || '') + (result.error ? String(result.error) : ''));
    results.push({ command: `npm run ${script}`, exitCode: result.status ?? 1, required: true, log });
    console.log(`${script}: exit ${result.status ?? 1}`);
}
const diff = spawnSync('git', ['diff', '--check'], { encoding: 'utf8' });
fs.writeFileSync(`${folder}/git-diff-check.txt`, (diff.stdout || '') + (diff.stderr || ''));
results.push({ command: 'git diff --check', exitCode: diff.status ?? 1, required: true, log: `${folder}/git-diff-check.txt` });
const regression = {};
for (let n = 1; n <= 7; n++) {
    const path = `test-results/epic-f/${n === 1 ? '' : `f${n}/`}batch-f${n}-validation.json`;
    try {
        const r = read(path);
        regression[`F${n}`] = { command: `npm run validate:epic-f-batch-f${n}`, exitCode: r.exitCode, assessedAt: r.assessedAt,
            evidence: path, sha256: fileHash(path), results: r.results };
    } catch (error) { regression[`F${n}`] = { exitCode: 1, error: error.message }; }
}
const packet = read('data/epic-f-machine-page-readiness.json');
const tests = read(`${folder}/readiness-tests.json`);
const recovery = recheck ? read(`${folder}/regression-recheck.json`) : null;
const regressionPassed = recheck ? recovery.exitCode === 0 : Object.values(regression).every(r => r.exitCode === 0);
const exitCode = results.every(r => r.exitCode === 0) && regressionPassed && packet.repositoryAggregatePassed && tests.failed === 0 ? 0 : 1;
write(`${folder}/batch-f8-validation.json`, { batch: 'F8', assessedAt: new Date().toISOString(), exitCode,
    scope: 'F-PBI-018A repository/static/local-fixture only', results, regression, regressionRecovery: recovery, tests,
    packet: { path: 'data/epic-f-machine-page-readiness.json', sha256: fileHash('data/epic-f-machine-page-readiness.json'), assessedAt: packet.assessedAt },
    sourceObservationTimesPreserved: true, currentAdminAuditRun: false,
    pbiStates: packet.pbiStates, liveReleaseState: packet.liveReleaseState, realGrants: packet.realGrants,
    authorizations: packet.authorizations, actionsPerformed: packet.actionsPerformed, delta: packet.delta });
console.log(`F8 repository aggregate: exit ${exitCode}; F18 partial; F18B not ready; no live actions.`);
process.exitCode = exitCode;
