'use strict';
// Repository-only acceptance. No credentials, network clients, deployments or live cart mode.
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process'), assert = require('node:assert/strict');
const J = require('./lib/epic-j-j0'), S = require('./lib/epic-j-j1-protection');
(async () => {
  const args = process.argv.slice(2), root = args[args.indexOf('--evidence') + 1];
  assert(args.includes('--evidence') && root, 'Explicit unique --evidence directory required');
  process.env.RHINO_J_EVIDENCE_DIR = root; J.directory();
  fs.mkdirSync(root, { recursive: true });
  fs.writeFileSync(root + '/reservation.json', JSON.stringify({ at: new Date().toISOString(), mode: 'REPOSITORY_ONLY' }), { flag: 'wx' });
  const commands = [];
  async function command(label, command, env = {}) {
    const row = { label, command, startedAt: new Date().toISOString(), log: root + '/' + label + '.txt' };
    const log = fs.openSync(row.log, 'wx');
    row.exitCode = await new Promise((resolve, reject) => {
      const child = cp.spawn('cmd.exe', ['/d', '/s', '/c', command], { windowsHide: true, env: { ...process.env, RHINO_J_LIVE: '0', RHINO_J_LOCAL_ONLY: '1', RHINO_J_J1: '1', RHINO_J_SOURCE_SUCCESSOR: 'J1-2026-10-20-NATIVE-CART', PLAYWRIGHT_JSON_OUTPUT_NAME: path.resolve(root, label + '-playwright.json'), ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
      child.stdout.on('data', data => fs.writeSync(log, data)); child.stderr.on('data', data => fs.writeSync(log, data));
      child.once('error', reject); child.once('exit', code => resolve(code));
    });
    fs.closeSync(log); row.completedAt = new Date().toISOString(); row.status = row.exitCode === 0 ? 'PASS' : 'FAIL'; commands.push(row); console.log(JSON.stringify(row));
  }
  await command('j1-source-and-negative-tests', 'node scripts/test-epic-j-j1-readiness.js');
  await command('native-cart-browser', 'npm.cmd run test:epic-j-cart -- --output ' + root + '/cart-artifacts --reporter=line,json');
  await command('native-machine-guard', 'npm.cmd run validate:epic-f-machine');
  await command('native-machine-browser', 'npm.cmd run test:machine-shell -- --output ' + root + '/machine-artifacts --reporter=line,json');
  let protection; try { protection = S.verify(); } catch (e) { protection = { status: 'FAIL', reason: e.message }; }
  const report = { schemaVersion: 1, scope: 'J1_REPOSITORY_ENGINEERING_ONLY', completedAt: new Date().toISOString(), commands, protection,
    status: commands.every(c => c.exitCode === 0) && !protection.reason ? 'PASS' : 'FAIL',
    actualChangedPreview: 'NOT VERIFIED — no deployment authorized', productionAuthorized: false, J_PBI_008: 'PROPOSED_NOT_COMPLETE',
    operations: { adminReads: 0, adminMutations: 0, themeReads: 0, themeWrites: 0, publications: 0, realCartPosts: 0, checkoutSubmissions: 0, orders: 0, liveCleanup: 'NOT APPLICABLE — all cart requests intercepted on .local fixture hosts' } };
  J.write('report.json', report); console.log('J1 repository status: ' + report.status); process.exitCode = report.status === 'PASS' ? 0 : 1;
})().catch(e => { console.error(e.stack); process.exitCode = 1; });
