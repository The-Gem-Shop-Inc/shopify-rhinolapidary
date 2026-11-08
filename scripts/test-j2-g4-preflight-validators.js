'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const integration = require('./validate-j2-g4-catalog-cart-integration');
const successor = require('./validate-epic-g-g4-route-successor-evidence');

const fixedNow = Date.parse('2026-11-08T12:00:00.000Z');

function repositoryFixture({ branch = integration.BRANCH, head, runtimeAncestor = true, runtimeStatus = '', files = {}, missing = [] } = {}) {
  const base = integration.createRepository();
  const replacements = new Map(Object.entries(files).map(([file, body]) => [file.replace(/\\/g, '/'), Buffer.from(body)]));
  const absent = new Set(missing.map((file) => file.replace(/\\/g, '/')));
  return integration.createRepository({
    readBuffer(file) {
      const key = file.replace(/\\/g, '/');
      if (replacements.has(key)) return replacements.get(key);
      return fs.readFileSync(file);
    },
    git(...args) {
      if (args[0] === 'branch' && args[1] === '--show-current') return branch;
      if (args[0] === 'rev-parse' && args[1] === 'HEAD' && head) return head;
      return base.git(...args);
    },
    isAncestor(ancestor, descendant) {
      if (ancestor === integration.INTEGRATION && descendant === 'HEAD') return runtimeAncestor;
      return base.isAncestor(ancestor, descendant);
    },
    runtimeStatus: () => runtimeStatus,
    exists(file) {
      if (absent.has(file.replace(/\\/g, '/'))) return false;
      return base.exists(file);
    },
    now: () => fixedNow,
  });
}

const tests = [];
function test(name, run) {
  tests.push({ name, run });
}

test('original runtime commit validates', () => {
  integration.validate({ repository: repositoryFixture({ head: integration.INTEGRATION }) });
});

test('evidence-only descendant validates', () => {
  integration.validate({ repository: repositoryFixture({ head: 'b37c0ebf1bc5238e7d8b95a20325e4c76ec392b6' }) });
});

test('clean committed checkout validates', () => {
  integration.validate({ repository: repositoryFixture({ runtimeStatus: '' }) });
});

test('incorrect branch fails', () => {
  assert.throws(() => integration.validate({ repository: repositoryFixture({ branch: 'unrelated/branch' }) }), /Wrong integration branch/);
});

test('branch without runtime ancestor fails', () => {
  assert.throws(() => integration.validate({ repository: repositoryFixture({ runtimeAncestor: false }) }), /does not descend/);
});

test('changed runtime file fails', () => {
  const file = 'assets/cart-feedback-toast.js';
  const body = `${fs.readFileSync(file, 'utf8')}\n// unauthorized runtime drift\n`;
  assert.throws(() => integration.validate({ repository: repositoryFixture({ files: { [file]: body } }) }), /source drift|manifest hash drift/);
});

test('changed successor source binding fails', () => {
  const file = 'data/navigation-spec.json';
  const body = `${fs.readFileSync(file, 'utf8')}\n`;
  assert.throws(() => integration.validate({ repository: repositoryFixture({ files: { [file]: body } }) }), /source drift|successor binding drift/);
});

test('mismatched manifest hash fails', () => {
  const file = 'data/j2-g4-preview-deployment-manifest.json';
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  manifest.themeFiles[0].sha256 = '0'.repeat(64);
  assert.throws(() => integration.validate({ repository: repositoryFixture({ files: { [file]: JSON.stringify(manifest) } }) }), /manifest hash drift/);
});

test('missing historical receipt fails', () => {
  assert.throws(
    () => successor.validate({ repository: repositoryFixture({ missing: ['data/epic-g-machine-routes.json'] }) }),
    /historical artifact missing/,
  );
});

test('expired authority cannot be promoted', () => {
  const file = successor.EVIDENCE;
  const evidence = JSON.parse(fs.readFileSync(file, 'utf8'));
  evidence.authority.renewed = true;
  evidence.authority.currentStatus = 'APPROVED';
  assert.throws(() => successor.validate({ repository: repositoryFixture({ files: { [file]: JSON.stringify(evidence) } }) }), /true !== false|Expected values to be strictly equal/);
});

test('uncommitted runtime changes cannot be hidden', () => {
  assert.throws(
    () => integration.validate({ repository: repositoryFixture({ runtimeStatus: ' M assets/cart-feedback-toast.js\0' }) }),
    /Unexpected uncommitted theme runtime change/,
  );
});

let failed = 0;
for (const row of tests) {
  try {
    row.run();
    console.log(`PASS ${row.name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${row.name}: ${error.stack}`);
  }
}
console.log(JSON.stringify({ passed: tests.length - failed, failed, total: tests.length }));
if (failed) process.exitCode = 1;
