'use strict';

const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const { read, write } = require('./lib/epic-f-governance');
const folder = 'test-results/epic-f/f7';
fs.mkdirSync(folder, { recursive: true });
const results = [];
for (const script of [
    'validate:epic-f-machine-measurement', 'test:epic-f-machine-measurement',
    'validate:epic-f-machine-template-rollout', 'test:epic-f-machine-template-rollout',
    'validate:hardcoded-strings', 'validate:registers', 'validate:epic-f-batch-f6', 'theme:check'
]) {
    const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', script], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
    const log = `${folder}/${script.replaceAll(':', '-')}.txt`;
    fs.writeFileSync(log, (result.stdout || '') + (result.stderr || '') + (result.error ? String(result.error) : ''));
    results.push({ command: `npm run ${script}`, exitCode: result.status ?? 1, required: true, log });
    console.log(`${script}: exit ${result.status ?? 1}`);
}
const diff = spawnSync('git', ['diff', '--check'], { encoding: 'utf8' });
fs.writeFileSync(`${folder}/git-diff-check.txt`, (diff.stdout || '') + (diff.stderr || ''));
results.push({ command: 'git diff --check', exitCode: diff.status ?? 1, required: true, log: `${folder}/git-diff-check.txt` });
// F6 recursively executes F5 -> F4 -> F3 -> F2 -> F1. Preserve each result.
const regression = {};
for (let batch = 1; batch <= 6; batch++) {
    const path = `test-results/epic-f/${batch === 1 ? '' : `f${batch}/`}batch-f${batch}-validation.json`;
    try {
        const record = read(path);
        regression[`F${batch}`] = { command: `npm run validate:epic-f-batch-f${batch}`, exitCode: record.exitCode, evidence: path, results: record.results };
    } catch (error) { regression[`F${batch}`] = { exitCode: 1, error: String(error) }; }
}
const f6 = fs.existsSync('test-results/epic-f/f6/batch-f6-validation.json') ? read('test-results/epic-f/f6/batch-f6-validation.json') : {};
const plan = read('data/epic-f-machine-template-rollout-plan.json');
const zeroGrants = read('data/epic-f-consumer-release.json').grants.length === 0;
const runtimeUnchanged = results.find(r => r.command === 'npm run validate:epic-f-machine-measurement')?.exitCode === 0;
const exitCode = results.every(r => r.exitCode === 0) && Object.values(regression).every(r => r.exitCode === 0) && zeroGrants ? 0 : 1;
const report = {
    batch: 'F7', assessedAt: new Date().toISOString(), scope: 'repository governance and unit fixtures only; not F-PBI-018', exitCode, results, regression,
    status: { 'F-PBI-016': exitCode ? 'checks failed' : 'complete repository contract; U owner/consent instrumentation blocked', 'F-PBI-017': 'partial', 'F-PBI-017A': exitCode ? 'checks failed' : 'complete repository planning scope', 'F-PBI-017B': 'open/blocked/not authorized', 'F-PBI-014B': 'open/partial', 'F-PBI-015B': 'deferred', 'F-PBI-018': 'not started' },
    measurement: { nativeOwnerSlots: 4, assignedNativeOwners: 0, ownerAuthority: 'U / Analytics Owner; assignment unresolved', optionalQuestions: 4, instrumentation: 'blocked', emittedEvents: 0 },
    rollout: { planHash: plan.planHash, assessed: plan.assessments.length, futureCandidateGids: plan.futureCandidateGids, eligibleTargetGids: plan.eligibleTargetGids, exclusions: plan.assessments.filter(p => p.eligibility === 'excluded'), mutations: 0, GO: 'both absent/not granted', AdminEvidence: 'historical/incomplete/stale for execution' },
    contractTests: { measurement: read(`${folder}/measurement-tests.json`), rollout: read(`${folder}/rollout-tests.json`) },
    unchanged: { storefrontRuntime: runtimeUnchanged, externalRequests: runtimeUnchanged, performanceThresholds: runtimeUnchanged, factGrantsZero: zeroGrants, supportResourcesCustomerOutput: f6.exitCode === 0 ? 0 : null },
    historicalDiagnostics: f6.historicalDiagnostics, historicalComparison: f6.historicalComparison, historicalDescriptionClaimMatches: f6.historicalDescriptionClaimMatches, brokenManualRoutes: f6.brokenManualRoutes,
    deferred: ['004B', '006B', '007B', '008B', '009B', '010B', '011B', '013/F-DEC-001', 'remaining 014B', '015B', '017B', '018', 'B3C-D03 blocked', 'B3B-D06 pending', ...(f6.deferred || [])],
    adminMutationOccurred: false, productTemplateAssignmentOccurred: false, productDataMutationOccurred: false,
    analyticsPixelConsentConfigurationChanged: false, previewOrProductionThemePushedOrPublished: false,
    productionThemePublicationAuthorized: false, releasePerformanceCertificationRun: false
};
write(`${folder}/batch-f7-validation.json`, report);
console.log(`F7 gate: exit ${exitCode}; F16 contract/F17A planning only; instrumentation and execution blocked. F18 not started.`);
process.exitCode = exitCode;
