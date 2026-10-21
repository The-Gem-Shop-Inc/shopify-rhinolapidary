'use strict';

const fs = require('node:fs');
const { read, canonical, digest, fileHash, schemaErrors } = require('./epic-f-governance');
const policyPath = 'data/epic-f-machine-template-rollout-policy.json';
const beforePath = 'tests/fixtures/epic-f-machine-template-before.json';
const planPath = 'data/epic-f-machine-template-rollout-plan.json';
const identity = read('data/epic-e-product-identity.json');
const classifications = read('data/epic-e-product-classification.json');
const same = (a, b) => canonical(a) === canonical(b);
const without = (value, keys) => Object.fromEntries(Object.entries(value).filter(([key]) => !keys.includes(key)));
const snapshotDigest = snapshot => digest(without(snapshot, ['digest']));
const planDigest = plan => digest(without(plan, ['planHash']));
const machineGids = () => classifications.mappings.filter(m => m.classDecisionState === 'approved' && m.proposedProductClass === 'machine').map(m => m.productGid).sort();

function validatePolicy(policy) {
    const errors = schemaErrors('epic-f-machine-template-rollout-policy', policy);
    if (errors.length) return errors;
    if (!same(policy.targetGids, machineGids())) errors.push('exact governed machine set mismatch');
    for (const [path, hash] of Object.entries(policy.sourceAuthorities)) {
        if (!fs.existsSync(path) || fileHash(path) !== hash) errors.push(`authority drift: ${path}; re-review required`);
    }
    if (!fs.existsSync(policy.repositoryTemplate)) errors.push('machine template missing');
    return errors;
}

function validateBefore(snapshot, expected, policy, { now = new Date().toISOString(), fresh = false } = {}) {
    const errors = schemaErrors('epic-f-machine-template-before', snapshot);
    if (errors.length) return errors;
    if (snapshot.digest !== snapshotDigest(snapshot)) errors.push('before hash mismatch');
    if (snapshot.shop !== policy.shop) errors.push('shop mismatch');
    if (!same(snapshot.products.map(p => p.productGid).sort(), policy.targetGids)) errors.push('missing, unexpected, duplicate or non-machine Product');
    if (!Number.isFinite(Date.parse(snapshot.observedAt))) errors.push('invalid before timestamp');
    if (snapshot.theme.repositoryPath !== policy.repositoryTemplate || !fs.existsSync(policy.repositoryTemplate) || fileHash(policy.repositoryTemplate) !== snapshot.theme.sha256) errors.push('missing or changed machine template');
    if (expected) {
        for (const field of ['shop', 'environment', 'theme', 'products']) if (!same(snapshot[field], expected[field])) errors.push(`before drift: ${field}; re-review required`);
    }
    for (const product of snapshot.products) {
        const mapping = classifications.mappings.find(m => m.productGid === product.productGid);
        if (!mapping || mapping.proposedProductClass !== 'machine' || mapping.classDecisionState !== 'approved' || product.classification.sourceDigest !== digest(mapping) || product.classification.decisionId !== mapping.approvalDecisionId || !identity.productIdentities.some(p => p.productGid === product.productGid)) errors.push('classification/identity drift');
    }
    if (snapshot.evidenceKind === 'historical_fixture') {
        const sourcePath = 'docs/qa/evidence/epic-f/2026-09-10-machine-admin-read.json';
        const source = read(sourcePath);
        if (snapshot.sourcePath !== sourcePath || snapshot.sourceSha256 !== fileHash(sourcePath) || Date.parse(snapshot.observedAt) !== Date.parse(source.capturedAt) || snapshot.shop !== source.data.shop.myshopifyDomain) errors.push('historical source identity/hash/time mismatch');
        for (const product of snapshot.products) {
            const node = source.data.nodes.find(n => n.id === product.productGid);
            if (!node || product.status !== node.status || product.templateSuffix !== node.templateSuffix || product.publication.publishedAt !== node.publishedAt || product.publication.onlineStoreUrl !== node.onlineStoreUrl || product.classification.liveValue !== null || product.fieldCoverageComplete) errors.push('historical Product evidence mismatch');
            if (node) for (const [field, hash] of Object.entries(product.protectedFieldDigests)) {
                if (hash !== (Object.hasOwn(node, field) ? digest(node[field]) : null)) errors.push('historical protected-field evidence mismatch');
            }
        }
    }
    if (fresh) {
        const age = Date.parse(now) - Date.parse(snapshot.observedAt);
        if (!Number.isFinite(age) || age < 0 || age > policy.beforeRead.maxAgeSeconds * 1000) errors.push('stale/future before read');
        if (snapshot.evidenceKind !== 'fresh_bounded_read' || snapshot.environment !== 'shopify-admin') errors.push('historical/fixture evidence is not an execution read');
        if (!fs.existsSync(snapshot.sourcePath) || fileHash(snapshot.sourcePath) !== snapshot.sourceSha256) errors.push('before source hash mismatch');
        if (!snapshot.theme.adminThemeId || !snapshot.theme.adminTemplateExists) errors.push('Admin theme/template existence unverified');
        for (const p of snapshot.products) {
            if (!p.fieldCoverageComplete || Object.values(p.protectedFieldDigests).some(v => !v) || !p.publication.publicationsDigest) errors.push('incomplete before mutable-field/publication coverage');
            if ((!p.updatedAt && !p.resourceVersion) || (p.updatedAt && (!Number.isFinite(Date.parse(p.updatedAt)) || Date.parse(p.updatedAt) > Date.parse(snapshot.observedAt)))) errors.push('missing/invalid Admin resource version');
            if (p.classification.liveValue !== 'machine') errors.push('live product_class prerequisite missing');
            if (!policy.exclusions.some(e => e.productGid === p.productGid) && (p.status !== 'ACTIVE' || !p.publication.publishedAt || p.publication.customerVisibility !== 'verified_visible')) errors.push('future target status/publication/customer visibility unverified');
        }
    }
    return errors;
}

function buildPlan(policy, before) {
    const errors = [...validatePolicy(policy), ...validateBefore(before, null, policy)];
    if (errors.length) throw new Error(errors.join('\n'));
    const assessments = [...before.products].sort((a, b) => a.productGid.localeCompare(b.productGid)).map(product => {
        const excluded = policy.exclusions.find(e => e.productGid === product.productGid);
        const visible = product.status === 'ACTIVE' && !!product.publication.publishedAt;
        const futureCandidate = !excluded && visible;
        const change = futureCandidate ? { productGid: product.productGid, field: 'templateSuffix', before: product.templateSuffix, after: policy.intendedSuffix } : null;
        return {
            productGid: product.productGid,
            label: identity.productIdentities.find(p => p.productGid === product.productGid).currentTitle,
            assessed: true, observedTemplateSuffix: product.templateSuffix, intendedTemplateSuffix: policy.intendedSuffix,
            status: product.status, publication: product.publication, classificationReadiness: 'blocked',
            eligibility: excluded ? 'excluded' : 'blocked', futureCandidate,
            reasons: [ ...(excluded ? [excluded.reason] : []), ...(!visible ? ['draft or unpublished; do not change status/publication'] : []),
                ...Object.entries(policy.prerequisites).filter(([, ready]) => !ready).map(([key]) => key),
                'fresh complete bounded before-read required', 'Product Owner GO absent', 'Shopify Admin Owner GO absent', 'F7 execution not authorized' ],
            mutationWouldBeRequiredIfAuthorized: futureCandidate && product.templateSuffix !== policy.intendedSuffix,
            allowedChange: change, rollbackValue: product.templateSuffix
        };
    });
    const plan = {
        $schema: '../schemas/epic-f-machine-template-rollout-plan.schema.json', schemaVersion: 1,
        planId: policy.planId, policyDigest: digest(policy), beforeDigest: before.digest, templateSha256: before.theme.sha256,
        assessments, futureCandidateGids: assessments.filter(p => p.futureCandidate).map(p => p.productGid), eligibleTargetGids: [],
        proposedWriteSet: assessments.filter(p => p.mutationWouldBeRequiredIfAuthorized).map(p => p.allowedChange),
        rollback: assessments.filter(p => p.mutationWouldBeRequiredIfAuthorized).map(p => ({ productGid: p.productGid, field: 'templateSuffix', expectedAssignedValue: policy.intendedSuffix, restore: p.rollbackValue })),
        mutationsProduced: 0, productionThemePublicationAuthorized: false, executionAuthorized: false,
        approvalState: 'both_absent_not_granted', evidenceState: 'historical_incomplete_not_execution_evidence'
    };
    plan.planHash = planDigest(plan);
    return plan;
}

function validateWriteSet(writes, before, policy) {
    if (!Array.isArray(writes)) return ['missing write set'];
    const errors = [], seen = new Set();
    for (const write of writes) {
        if (!same(Object.keys(write).sort(), ['after', 'before', 'field', 'productGid']) || write.field !== 'templateSuffix' || write.after !== 'machine') errors.push('write set must contain templateSuffix only');
        const prior = before.products.find(p => p.productGid === write.productGid);
        if (!prior || seen.has(write.productGid) || policy.exclusions.some(e => e.productGid === write.productGid) || prior.status !== 'ACTIVE' || !prior.publication.publishedAt) errors.push('invalid/excluded assignment target');
        if (!Object.hasOwn(write, 'before') || !prior || write.before !== prior.templateSuffix) errors.push('missing or ambiguous rollback value');
        if (write.before === write.after) errors.push('no-op template assignment forbidden');
        seen.add(write.productGid);
    }
    return errors;
}

function validateRollback(rollback, writes, before) {
    if (!Array.isArray(rollback) || rollback.length !== writes.length) return ['rollback coverage mismatch'];
    const errors = [];
    for (const write of writes) {
        const records = rollback.filter(r => r.productGid === write.productGid);
        const prior = before.products.find(p => p.productGid === write.productGid);
        if (!prior || records.length !== 1 || !same(records[0], { productGid: write.productGid, field: 'templateSuffix', expectedAssignedValue: write.after, restore: prior.templateSuffix })) errors.push('rollback must preserve exact observed suffix, including null/empty/custom values');
    }
    return errors;
}

function validatePlan(plan, policy = read(policyPath), before = read(beforePath)) {
    const errors = [...schemaErrors('epic-f-machine-template-rollout-plan', plan), ...validatePolicy(policy)];
    if (errors.length) return errors;
    errors.push(...validateBefore(before, read(beforePath), policy));
    if (plan.planHash !== planDigest(plan)) errors.push('plan hash mismatch');
    errors.push(...validateWriteSet(plan.proposedWriteSet, before, policy), ...validateRollback(plan.rollback, plan.proposedWriteSet, before));
    if (!errors.length && !same(plan, buildPlan(policy, before))) errors.push('dry-run projection differs from exact before/policy input');
    return errors;
}

function validatePrerequisites(prerequisites) {
    const expected = Object.keys(read(policyPath).prerequisites);
    return expected.filter(key => prerequisites?.[key] !== true).map(key => `prerequisite blocked: ${key}`);
}

// Pure authorization validation only. No operation in this module executes writes.
// Like E-PBI-019, GO must be evidence-bound to exact role/plan/input/time.
function validateApprovals(approvals, plan, before, now, evidenceRecords = []) {
    const errors = [];
    if (!Array.isArray(approvals) || approvals.length !== 2) return ['exactly two owner approval slots required'];
    for (const role of ['Product Owner', 'Shopify Admin Owner']) {
        const slots = approvals.filter(a => a.role === role), a = slots[0];
        if (slots.length !== 1 || !a.granted) { errors.push(`${role} GO absent`); continue; }
        const time = Date.parse(a.recordedAt);
        if (!Number.isFinite(time) || !Number.isFinite(Date.parse(now)) || time > Date.parse(now) || time < Date.parse(before.observedAt)) errors.push(`${role} GO timestamp invalid`);
        if (a.planHash !== plan.planHash || a.beforeDigest !== before.digest || !same(a.targetGids, plan.futureCandidateGids)) errors.push(`${role} GO plan/hash/target/before mismatch`);
        const records = evidenceRecords.filter(r => r.path === a.evidence && r.ownerRole === role && r.decision === 'GO' && r.planId === plan.planId && r.planHash === a.planHash && r.beforeDigest === a.beforeDigest && r.recordedAt === a.recordedAt && same(r.targetGids, a.targetGids));
        if (!a.evidence || records.length !== 1) errors.push(`${role} human decision evidence absent/mismatched`);
    }
    return errors;
}

function executionBlockers(plan, policy, before, now) {
    return [...validatePlan(plan, policy, before), ...validateBefore(before, null, policy, { now, fresh: true }),
        ...validatePrerequisites(policy.prerequisites), ...validateApprovals(policy.approvals, plan, before, now),
        'F7 repository-only scope: F-PBI-017B requires separately authorized implementation and execution'];
}

function validateAfter(before, after, targetGids, policy) {
    const errors = [...schemaErrors('epic-f-machine-template-before', before), ...schemaErrors('epic-f-machine-template-before', after)];
    if (errors.length) return errors;
    if (after.digest !== snapshotDigest(after)) errors.push('after hash mismatch');
    if (!same(before.products.map(p => p.productGid).sort(), after.products.map(p => p.productGid).sort()) || before.shop !== after.shop || before.environment !== after.environment || !same(before.theme, after.theme)) errors.push('after scope/shop/environment/theme drift');
    if (!Number.isFinite(Date.parse(after.observedAt)) || Date.parse(after.observedAt) < Date.parse(before.observedAt)) errors.push('invalid after timestamp');
    if (new Set(targetGids).size !== targetGids.length || targetGids.some(gid => !before.products.some(p => p.productGid === gid) || policy.exclusions.some(e => e.productGid === gid))) errors.push('invalid after target set');
    for (const prior of before.products) {
        const next = after.products.find(p => p.productGid === prior.productGid);
        if (!next) { errors.push('Product missing after assignment'); continue; }
        if (!prior.fieldCoverageComplete || !next.fieldCoverageComplete || Object.values(prior.protectedFieldDigests).some(v => !v) || Object.values(next.protectedFieldDigests).some(v => !v)) errors.push('incomplete before/after coverage');
        if (!same(without(prior, ['templateSuffix', 'updatedAt', 'resourceVersion']), without(next, ['templateSuffix', 'updatedAt', 'resourceVersion']))) errors.push('unrelated Product field changed');
        if (next.templateSuffix !== (targetGids.includes(prior.productGid) ? policy.intendedSuffix : prior.templateSuffix)) errors.push('unexpected after template suffix');
    }
    return errors;
}
module.exports = { policyPath, beforePath, planPath, snapshotDigest, planDigest, buildPlan, validatePolicy, validateBefore, validatePlan, validateWriteSet, validateRollback, validatePrerequisites, validateApprovals, executionBlockers, validateAfter };
