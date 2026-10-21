'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs');
const E = require('./lib/epic-e-owner-response-adapter'), J = require('./lib/epic-j-j0'), S = require('./lib/epic-j-j1-protection');
const results = [];
function test(name, kind, fn) { try { fn(); results.push({ name, kind, status: 'PASS' }); } catch (e) { results.push({ name, kind, status: 'FAIL', reason: e.message }); } }
test('Exact J1 successor and unchanged historical sources', 'positive', () => S.verify());
const baseline = E.read(J.CONTRACT);
test('Historical J0 guard still rejects two changed runtime files', 'negative', () => assert.throws(() => J.protectedState(baseline), /Protected cart/));
for (const path of ['assets/product-form.js', 'assets/component-cart-items.css']) {
  const r = E.read(S.MANIFEST).runtime.find(r => r.path === path);
  test('Exact reviewed native source ' + path, 'positive', () => S.nativeSurfaceMatches(path, r.oldNormalizedSha256, fs.readFileSync(path, 'utf8')));
  test('Reject further runtime drift ' + path, 'negative', () => assert.throws(() => S.nativeSurfaceMatches(path, r.oldNormalizedSha256, fs.readFileSync(path, 'utf8') + '\n/* arbitrary change */')));
  test('Reject unknown predecessor ' + path, 'negative', () => assert.throws(() => S.nativeSurfaceMatches(path, 'unknown', fs.readFileSync(path, 'utf8'))));
}
test('Reject unapproved runtime file', 'negative', () => assert.throws(() => S.nativeSurfaceMatches('assets/base.css', 'unknown', fs.readFileSync('assets/base.css', 'utf8'))));
test('Current receipt/source remains valid without extension', 'positive', () => J.verifySource(baseline, E.read(baseline.adminRead)));
test('Expired authority fails closed', 'negative', () => assert.throws(() => J.verifySource(baseline, E.read(baseline.adminRead), Date.parse(baseline.receiptExpiresAt) + 1)));
test('Native identity and positive-price cart fixtures', 'positive', () => J.verifyFixture(E.read('tests/fixtures/epic-j-cart.json'), E.read(baseline.adminRead)));
test('No invented purchase restriction or checkout entitlement', 'positive', () => J.verifyPolicy(baseline.policy, E.read('data/epic-j-business-decisions.json').decisions));
test('Native machine source guard accepts exact successor', 'positive', () => { process.env.RHINO_J_SOURCE_SUCCESSOR = 'J1-2026-10-20-NATIVE-CART'; assert.deepEqual(require('./validate-epic-f-machine').validateArchitecture(), []); });
test('Native machine guard still rejects arbitrary Product changes', 'negative', () => assert(require('./validate-epic-f-machine').validateArchitecture({ 'assets/product-form.js': fs.readFileSync('assets/product-form.js', 'utf8') + '\n// bad' }).length));
J.write('j1-readiness-tests.json', { results, passed: results.filter(r => r.status === 'PASS').length, failed: results.filter(r => r.status === 'FAIL').length, positive: results.filter(r => r.kind === 'positive').length, negative: results.filter(r => r.kind === 'negative').length });
console.log(JSON.stringify(results)); process.exitCode = results.some(r => r.status === 'FAIL') ? 1 : 0;
