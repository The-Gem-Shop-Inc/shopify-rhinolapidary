const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = process.cwd();
const output = path.join(os.tmpdir(), `epic-e-gap-builder-${process.pid}.json`);
const relativeOutput = path.relative(root, output);
try {
  const run = spawnSync(process.execPath, ['scripts/build-epic-e-gap-conflict-register.js', '--admin-snapshot', 'tests/fixtures/epic-e-admin-snapshot.json', '--output', relativeOutput], { cwd: root, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr || run.stdout);
  const data = JSON.parse(fs.readFileSync(output, 'utf8'));
  assert.equal(data.metrics[0].scopeType, 'full_catalog');
  assert.equal(data.metrics[0].numerator, 1);
  assert.equal(data.metrics[0].denominator, 3);
  assert.equal(data.metrics[1].numerator, 2);
  assert.equal(data.metrics[4].numerator, 2);
  assert.equal(data.metrics[8].scopeType, 'stale_snapshot');
  assert.equal(data.gaps[0].coverage, 'complete');
  assert.equal(data.gaps[0].currentAdminState.status, 'observed');
  assert(data.inputs.some((entry) => entry.path === 'tests/fixtures/epic-e-admin-snapshot.json' && entry.scopeType === 'full_catalog'));
  console.log('Epic E gap builder fixture test passed: live Admin metrics are full-catalog while HTML evidence remains stale-snapshot scoped.');
} finally {
  if (fs.existsSync(output)) fs.unlinkSync(output);
}
