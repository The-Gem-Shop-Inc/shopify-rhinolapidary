'use strict';
const fs = require('node:fs');
const { execFileSync } = require('node:child_process');
const { read, fileHash } = require('./lib/epic-f-governance');
function validateManifest() {
    const errors = [], path = 'docs/project/epic-f-batch-f8-file-manifest.json';
    const manifest = read(path), baseline = read('tests/fixtures/epic-f-f8-file-baseline.json');
    if (manifest.baselineSnapshotSha256 !== fileHash('tests/fixtures/epic-f-f8-file-baseline.json')) errors.push('F8 baseline hash drift');
    const rows = manifest.files.filter(f => f.path !== path);
    const changed = [];
    const current = [...new Set(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8' }).trim().split(/\r?\n/))];
    for (const p of current) if (p !== path && fs.existsSync(p) && fs.statSync(p).isFile() && fileHash(p) !== baseline.files[p]) changed.push(p);
    for (const p of Object.keys(baseline.files)) if (!fs.existsSync(p)) changed.push(p);
    if (JSON.stringify(rows.map(f => f.path).sort()) !== JSON.stringify(changed.sort())) errors.push('F8 manifest missing or extra changed files');
    for (const row of rows) {
        if ((baseline.files[row.path] ?? null) !== row.beforeSha256) errors.push(`F7 before hash drift: ${row.path}`);
        if ((fs.existsSync(row.path) ? fileHash(row.path) : null) !== row.afterSha256) errors.push(`F8 after hash drift: ${row.path}`);
        if (/^(assets|layout|locales|sections|snippets|templates|config)\//.test(row.path)) errors.push(`F8 runtime delta forbidden: ${row.path}`);
    }
    return errors;
}
if (require.main === module) {
    try {
        const errors = validateManifest();
        if (errors.length) console.error(errors.join('\n')); else console.log('Exact F8 delta manifest valid; all before/after hashes verified; no runtime/theme delta.');
        process.exitCode = errors.length ? 1 : 0;
    } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { validateManifest };
