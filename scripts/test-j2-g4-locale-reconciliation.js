'use strict';

const assert = require('node:assert/strict');
const cp = require('node:child_process');
const fs = require('node:fs');
const integration = require('./validate-j2-g4-catalog-cart-integration');
const locale = require('./validate-j2-g4-locale-reconciliation');

const remotePath = process.argv[2];
assert(remotePath, 'Usage: node scripts/test-j2-g4-locale-reconciliation.js <fresh-remote-en.default.json>');
const integrationText = cp.execFileSync('git', ['show', `${integration.INTEGRATION}:${integration.LOCALE}`], { encoding: 'utf8' });
const candidateText = fs.readFileSync(integration.LOCALE, 'utf8');
const remoteText = fs.readFileSync(remotePath, 'utf8');

const clone = (text) => JSON.parse(JSON.stringify(locale.parseJsonc(text)));
const serialize = (value) => JSON.stringify(value, null, 2);
const setPath = (value, dotted, replacement) => {
  const parts = dotted.split('.');
  const leaf = parts.pop();
  let cursor = value;
  for (const part of parts) cursor = cursor[part];
  cursor[leaf] = replacement;
};
const removePath = (value, dotted) => {
  const parts = dotted.split('.');
  const leaf = parts.pop();
  let cursor = value;
  for (const part of parts) cursor = cursor[part];
  delete cursor[leaf];
};
const run = (candidate = candidateText) => locale.compareCandidate({ candidateText: candidate, integrationText, remoteText });

const tests = [
  ['all 526 original preview translations are preserved', () => assert.equal(run().preservedRemoteLeaves, 526)],
  ['exactly seven J2 toast keys are added', () => assert.equal(run().addedToastKeys, 7)],
  ['candidate contains exactly 533 leaves', () => assert.equal(run().candidateLeaves, 533)],
  ['no original preview value is altered', () => assert.equal(run().changedRemoteValues, 0)],
  ['quote explanation matches the authorized text exactly', () => {
    const value = locale.parseJsonc(candidateText).sections.cart.quote_mode.email_fallback_explanation;
    assert.equal(value, integration.AUTHORIZED_QUOTE);
  }],
  ['emptying the quote explanation fails', () => {
    const candidate = clone(candidateText);
    setPath(candidate, integration.QUOTE_KEY, '');
    assert.throws(() => run(serialize(candidate)), /Authorized quote explanation mismatch|changed/);
  }],
  ['altering another locale value fails', () => {
    const candidate = clone(candidateText);
    candidate.general.password_page.login_form_heading += ' unauthorized';
    assert.throws(() => run(serialize(candidate)), /unauthorized integration-locale deviation|changed/);
  }],
  ['removing a toast key fails', () => {
    const candidate = clone(candidateText);
    removePath(candidate, locale.TOAST_PATHS[0]);
    assert.throws(() => run(serialize(candidate)), /533|key set|toast/);
  }],
  ['a clean future commit containing only the approved reconciliation validates', () => {
    const base = integration.createRepository();
    const repository = integration.createRepository({
      git(...args) {
        if (args[0] === 'branch' && args[1] === '--show-current') return integration.BRANCH;
        if (args[0] === 'rev-parse' && args[1] === 'HEAD') return 'f'.repeat(40);
        return base.git(...args);
      },
      runtimeStatus: () => '',
      isAncestor(ancestor, descendant) {
        if (ancestor === integration.INTEGRATION && descendant === 'HEAD') return true;
        return base.isAncestor(ancestor, descendant);
      },
    });
    integration.validate({ repository });
  }],
];

let failed = 0;
for (const [name, test] of tests) {
  try {
    test();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL ${name}: ${error.stack}`);
  }
}
console.log(JSON.stringify({ passed: tests.length - failed, failed, total: tests.length }));
if (failed) process.exitCode = 1;
