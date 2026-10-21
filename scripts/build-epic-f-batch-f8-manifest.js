'use strict';
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { read, write, fileHash } = require('./lib/epic-f-governance');
const baseline = read('tests/fixtures/epic-f-f8-file-baseline.json');
const manifestPath = 'docs/project/epic-f-batch-f8-file-manifest.json';
const paths = [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' }).trim().split(/\r?\n/))].sort();
const files = [];
for (const path of paths) {
    if (path === manifestPath || !fs.existsSync(path) || !fs.statSync(path).isFile()) continue;
    const beforeSha256 = baseline.files[path] ?? null, afterSha256 = fileHash(path);
    if (beforeSha256 !== afterSha256) files.push({ path, beforeSha256, afterSha256, change: beforeSha256 === null ? 'created' : 'modified' });
}
for (const path of Object.keys(baseline.files)) if (!fs.existsSync(path)) files.push({ path, beforeSha256: baseline.files[path], afterSha256: null, change: 'deleted' });
const forbidden = files.filter(f => /^(assets|layout|locales|sections|snippets|templates|config)\//.test(f.path));
if (forbidden.length) throw new Error(`F8 runtime delta forbidden: ${forbidden.map(f => f.path).join(', ')}`);
files.push({ path: manifestPath, change: 'created', note: 'Manifest self hash excluded to avoid circular hashing' });
write(manifestPath, { batch: 'F8', scope: ['F-PBI-018A repository/static/local-fixture aggregation only'],
    baseline: baseline.scope, baselineCapturedAt: baseline.capturedAt,
    baselineSnapshotSha256: fileHash('tests/fixtures/epic-f-f8-file-baseline.json'),
    preservedRuntimeBaseline: 'tests/fixtures/epic-f-f7-runtime-baseline.json',
    files, runtimeThemeDelta: 'none', performanceThresholdChange: false });
console.log(`F8 exact delta: ${files.length} files; no runtime/theme changes; manifest self hash excluded`);
