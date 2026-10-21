'use strict';
const assert = require('node:assert/strict');
const { read, digest, canonical, schemaErrors, report } = require('./lib/epic-f-governance');
const { policyPath, beforePath, planPath, snapshotDigest, planDigest, buildPlan, validatePolicy, validateBefore, validatePlan, validateWriteSet, validateRollback, validatePrerequisites, validateApprovals, executionBlockers, validateAfter } = require('./lib/epic-f-machine-template-rollout');
const policy = read(policyPath), before = read(beforePath), plan = read(planPath);
const cases = [], clone = structuredClone;
function check(name, test) { test(); cases.push(name); }
function badPolicy(name, mutate) { check(name, () => { const p = clone(policy); mutate(p); assert.ok(validatePolicy(p).length); }); }
function badPlan(name, mutate) { check(name, () => { const p = clone(plan); mutate(p); p.planHash = planDigest(p); assert.ok(validatePlan(p).length); }); }
function drift(name, mutate, options = {}) { check(name, () => { const b = clone(before); mutate(b); b.digest = snapshotDigest(b); assert.ok(validateBefore(b, before, policy, options).length); }); }
check('valid repository plan', () => assert.deepEqual(validatePlan(plan), []));
check('identical inputs produce identical semantic and byte output', () => assert.equal(canonical(buildPlan(policy, before)), canonical(buildPlan(policy, clone(before)))));
check('valid historical before is usable for construction only', () => assert.deepEqual(validateBefore(before, before, policy), []));
check('exact 11 assessed, eight conditional future candidates, zero eligible, zero writes executed', () => { assert.equal(plan.assessments.length, 11); assert.equal(plan.futureCandidateGids.length, 8); assert.deepEqual(plan.eligibleTargetGids, []); assert.equal(plan.mutationsProduced, 0); });
check('already intended suffix creates no proposed write or rollback', () => {
    const b = clone(before); b.evidenceKind = 'synthetic_contract_fixture'; b.products[0].templateSuffix = 'machine'; b.digest = snapshotDigest(b);
    const p = buildPlan(policy, b);
    assert.deepEqual(schemaErrors('epic-f-machine-template-rollout-plan', p), []);
    assert.equal(p.proposedWriteSet.length, 7); assert.equal(p.rollback.length, 7);
    assert.equal(p.assessments.find(r => r.productGid === b.products[0].productGid).mutationWouldBeRequiredIfAuthorized, false);
});
badPolicy('target selected by title instead of GID', p => { p.selector = 'title'; p.targetGids[0] = 'BeadMaster'; });
drift('non-machine Product', b => b.products[0].productGid = 'gid://shopify/Product/8905778331845');
drift('missing Product', b => b.products.pop());
drift('duplicate Product', b => b.products[1] = clone(b.products[0]));
drift('unexpected Product added', b => b.products.push(clone(b.products[0])));
drift('wrong shop', b => b.shop = 'wrong.myshopify.com');
check('stale read blocks freshness without relying on other errors', () => assert.ok(validateBefore(before, before, policy, { fresh: true, now: '2026-09-29T00:00:00Z' }).includes('stale/future before read')));
drift('changed template suffix', b => b.products[0].templateSuffix = 'legacy-custom');
drift('changed Product status', b => b.products[0].status = 'DRAFT');
drift('changed publication', b => b.products[0].publication.publishedAt = null);
drift('changed classification', b => b.products[0].classification.liveValue = 'accessory');
drift('changed classification evidence', b => b.products[0].classification.sourceDigest = '0'.repeat(64));
drift('missing machine template', b => b.theme.repositoryPath = 'templates/product.missing.json');
drift('changed template bytes', b => b.theme.sha256 = '0'.repeat(64));
badPolicy('invalid intended suffix', p => p.intendedSuffix = 'Machine');
badPlan('draft Product accidentally eligible', p => p.assessments.find(r => r.status === 'DRAFT').eligibility = 'eligible');
for (const exclusion of policy.exclusions) badPlan(`${exclusion.reason.split(':')[0]} accidentally eligible`, p => { const row = p.assessments.find(r => r.productGid === exclusion.productGid); row.futureCandidate = true; row.eligibility = 'blocked'; p.futureCandidateGids.push(row.productGid); });
for (const exclusion of policy.exclusions) check(`write-set identity excludes ${exclusion.productGid}`, () => {
    const writes = clone(plan.proposedWriteSet); writes[0].productGid = exclusion.productGid;
    assert.ok(validateWriteSet(writes, before, policy).includes('invalid/excluded assignment target'));
});
badPolicy('exclusion state changed requires review', p => p.exclusions.pop());
check('all prerequisite slots true passes pure prerequisite shape check, does not authorize', () => assert.deepEqual(validatePrerequisites(Object.fromEntries(Object.keys(policy.prerequisites).map(k => [k, true]))), []));
for (const key of Object.keys(policy.prerequisites)) check(`missing prerequisite: ${key}`, () => { const p = Object.fromEntries(Object.keys(policy.prerequisites).map(k => [k, true])); delete p[key]; assert.deepEqual(validatePrerequisites(p), [`prerequisite blocked: ${key}`]); });
check('incomplete E reconciliation remains blocked', () => assert.ok(validatePrerequisites(policy.prerequisites).includes('prerequisite blocked: completeCurrentEReconciliation')));
check('missing before-state', () => assert.ok(validateBefore({}, null, policy).length));
badPlan('missing rollback value', p => delete p.rollback[0].restore);
badPlan('rollback incorrectly assumes product.json', p => p.rollback[0].restore = 'product');
check('rollback preserves custom prior suffix', () => { const b = clone(before), writes = clone(plan.proposedWriteSet), rollback = clone(plan.rollback); b.products.find(p => p.productGid === writes[0].productGid).templateSuffix = 'legacy-special'; writes[0].before = 'legacy-special'; rollback[0].restore = 'legacy-special'; assert.deepEqual(validateRollback(rollback, writes, b), []); rollback[0].restore = null; assert.ok(validateRollback(rollback, writes, b).length); });
check('rollback distinguishes null from empty suffix', () => { const rollback = clone(plan.rollback); rollback[0].restore = ''; assert.ok(validateRollback(rollback, plan.proposedWriteSet, before).length); });
for (const field of ['price', 'sku', 'vendor', 'metafield', 'status', 'publication']) check(`write set rejects ${field}`, () => { const writes = clone(plan.proposedWriteSet); writes[0].field = field; assert.ok(validateWriteSet(writes, before, policy).includes('write set must contain templateSuffix only')); });
check('write set rejects incidental extra property', () => { const writes = clone(plan.proposedWriteSet); writes[0].price = '1.00'; assert.ok(validateWriteSet(writes, before, policy).length); });
check('GO absent', () => assert.deepEqual(validateApprovals(policy.approvals, plan, before, '2026-09-29T00:00:00Z'), ['Product Owner GO absent', 'Shopify Admin Owner GO absent']));
for (const role of ['Product Owner', 'Shopify Admin Owner']) check(`only ${role} GO present cannot authorize`, () => { const slots = clone(policy.approvals); slots.find(a => a.role === role).granted = true; const other = role === 'Product Owner' ? 'Shopify Admin Owner' : 'Product Owner'; assert.ok(validateApprovals(slots, plan, before, '2026-09-29T00:00:00Z').includes(`${other} GO absent`)); });
check('GO plan hash mismatch', () => { const slots = clone(policy.approvals); slots[0].granted = true; slots[0].planHash = '0'.repeat(64); assert.ok(validateApprovals(slots, plan, before, '2026-09-29T00:00:00Z').includes('Product Owner GO plan/hash/target/before mismatch')); });
check('plan hash mismatch', () => { const p = clone(plan); p.planHash = '0'.repeat(64); assert.ok(validatePlan(p).includes('plan hash mismatch')); });
check('before hash mismatch', () => { const b = clone(before); b.digest = '0'.repeat(64); assert.ok(validateBefore(b, before, policy).includes('before hash mismatch')); });
// An isolated complete comparison fixture proves the after-state comparison can
// pass; it is never supplied to GO, persisted as Admin evidence, or executed.
const comparisonBefore = clone(before);
comparisonBefore.evidenceKind = 'synthetic_contract_fixture';
for (const p of comparisonBefore.products) {
    p.fieldCoverageComplete = true;
    for (const field of Object.keys(p.protectedFieldDigests)) p.protectedFieldDigests[field] ||= digest({ field, fixtureOnly: true });
}
comparisonBefore.digest = snapshotDigest(comparisonBefore);
const comparisonAfter = clone(comparisonBefore);
for (const p of comparisonAfter.products) if (plan.futureCandidateGids.includes(p.productGid)) p.templateSuffix = 'machine';
comparisonAfter.digest = snapshotDigest(comparisonAfter);
check('valid exact after comparison fixture', () => assert.deepEqual(validateAfter(comparisonBefore, comparisonAfter, plan.futureCandidateGids, policy), []));
for (const field of ['title', 'variants', 'vendor', 'metafields', 'publications', 'shippingProfile']) check(`after unrelated ${field} change rejected`, () => { const a = clone(comparisonAfter); a.products[0].protectedFieldDigests[field] = digest('changed'); a.digest = snapshotDigest(a); assert.ok(validateAfter(comparisonBefore, a, plan.futureCandidateGids, policy).includes('unrelated Product field changed')); });
check('after status change rejected', () => { const a = clone(comparisonAfter); a.products[0].status = 'DRAFT'; a.digest = snapshotDigest(a); assert.ok(validateAfter(comparisonBefore, a, plan.futureCandidateGids, policy).length); });
check('after suffix mismatch rejected', () => { const a = clone(comparisonAfter); a.products[0].templateSuffix = null; a.digest = snapshotDigest(a); assert.ok(validateAfter(comparisonBefore, a, plan.futureCandidateGids, policy).includes('unexpected after template suffix')); });
check('historical incomplete coverage cannot prove after state', () => assert.ok(validateAfter(before, before, [], policy).includes('incomplete before/after coverage')));
badPolicy('production publication authorization forbidden', p => p.productionThemePublicationAuthorized = true);
badPolicy('production publish bundled into plan', p => p.bundledActions = ['themePublish']);
badPlan('production publish bundled into dry run', p => p.productionThemePublicationAuthorized = true);
check('F7 always blocks execution independently of green architecture', () => assert.ok(executionBlockers(plan, policy, before, '2026-09-29T00:00:00Z').some(e => e.includes('F7 repository-only'))));
report('rollout-tests', cases);
