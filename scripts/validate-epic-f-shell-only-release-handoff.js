'use strict';

// Local planning validation only: reuse existing E/F/review authorities.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { read, fileHash, digest, canonical } = require('./lib/epic-f-governance');
const { render } = require('./lib/epic-f-liquid-fixtures');
const reviewContract = require('./lib/epic-f-activation-readiness-review');
const dataPath = 'data/epic-f-shell-only-release-preparation.json';
const docPath = 'docs/project/epic-f-shell-only-release-handoff.md';
function same(actual, expected, message) { assert.equal(canonical(actual), canonical(expected), message); }
function bound(ref) { assert.equal(fileHash(ref.path), ref.sha256, `Source/file drift: ${ref.path}`); }
function run() {
    const p = read(dataPath), doc = fs.readFileSync(docPath, 'utf8');
    const plan = read('data/epic-f-machine-template-rollout-plan.json');
    const policy = read('data/epic-f-machine-template-rollout-policy.json');
    const review = read(reviewContract.packetPath), audit = read(reviewContract.auditPath);
    assert.deepEqual(reviewContract.validate(review), [], 'Review/F8 authority validation');
    bound(p.authority); bound(p.adminObservation);
    same(p.proposedScope.map(s => s.productGid), plan.futureCandidateGids, 'Exactly the existing eight candidates');
    assert.equal(p.proposedScope.length, 8); assert.equal(new Set(p.proposedScope.map(s => s.productGid)).size, 8);
    same(p.exclusions, policy.exclusions, 'Three exclusions retained'); assert.equal(p.exclusions.length, 3);
    assert.equal(p.currentEligibleTargetCount, 0); assert.equal(p.currentExecutableTargetCount, 0);
    same(p.zeroGrants, Object.fromEntries(review.realGrants.counts.map(g => [g.domain, 0])), 'No fact grants');
    same(Object.values(p.authorizations), Array(8).fill(false), 'Separate approvals remain false');
    assert.ok(Object.values(p.actionsPerformed).every(v => v === false), 'No runtime/live action');
    assert.equal(p.sourceObservationExpired, true);
    assert.equal(p.expectedShopId, audit.shop.id); assert.equal(p.expectedShopId, 'gid://shopify/Shop/79279947973');
    const defs = read('data/epic-e-migration-plans/E-MUT-020-definitions-input.json');
    const classes = read('data/epic-e-migration-plans/E-MUT-021-product_class-input.json');
    for (const [envelope, input, id] of [[p.definitionEnvelope, defs, 'E-MUT-020'], [p.classEnvelope, classes, 'E-MUT-021']]) {
        bound(envelope.plan); bound(envelope.input);
        const source = read(envelope.plan.path);
        assert.equal(envelope.planId, id); assert.equal(source.planId, id); assert.equal(input.planId, id);
        assert.equal(envelope.input.path, source.deterministicInput.path);
        assert.equal(envelope.input.sha256, source.deterministicInput.sha256);
        assert.equal(envelope.scope, 'full_existing_domain_input'); assert.equal(envelope.rowCount, input.rows.length);
        assert.equal(envelope.rowSetSha256, digest(input.rows)); assert.equal(envelope.authorization, false);
        same(envelope.writeAllowlist, source.fieldAllowlist); same(source.approvals.map(a => a.granted), [false, false]);
        assert.equal(envelope.approvalSlotsSource, envelope.plan.path + '#/approvals');
        assert.equal(envelope.afterSnapshot, source.afterSnapshot.path);
        assert.equal(envelope.reconciliationArtifact, source.driftValidation.expectedArtifact.path);
        assert.ok(input.rows.every(r => r.valueState === 'approved'));
    }
    assert.equal(defs.rows.length, 38); assert.equal(classes.rows.length, 122);
    same(p.definitions, defs.rows.map(r => ({ rowId: r.rowId, ownerType: r.desiredContract.ownerType,
        namespace: r.desiredContract.namespace, key: r.desiredContract.key, type: r.desiredContract.type, dependencies: r.dependencies })));
    same(p.classScope.approvedRows, classes.rows.map(r => ({ rowId: r.rowId, productGid: r.targetGid,
        value: r.desired, approvalDecisionId: r.approvalDecisionId })));
    assert.equal(p.classScope.catalogWide, true); assert.equal(p.classScope.subsetExecutorAvailable, false);
    assert.equal(p.machineFamily.runtimeReadsFamily, false); assert.equal(p.machineFamily.familyValueMigrationRequired, false);
    assert.equal(p.machineFamily.classification, 'required_before_shell_assignment_via_full_E_MUT_020_receipt');
    for (const s of p.proposedScope) {
        const source = classes.rows.find(r => r.targetGid === s.productGid);
        assert.equal(s.approvedClassRowId, source.rowId); assert.equal(s.approvedClassValue, 'machine');
        const current = review.machines.find(m => m.productGid === s.productGid);
        assert.equal(s.route, '/products/' + current.currentIdentity.handle); assert.equal(s.currentSuffixObservation, null);
        assert.ok(doc.includes(s.productGid) && doc.includes(s.route));
    }
    const t = p.previewEnvelope;
    const actualTheme = audit.queries.find(q => q.dataset === 'currentThemeRead').data.themes.nodes.find(t => t.id === p.previewEnvelope.themeId);
    assert.equal(t.themeNumericId, '158631198917'); assert.equal(t.name, actualTheme.name); assert.equal(t.role, 'UNPUBLISHED');
    assert.equal(t.observedUpdatedAt, actualTheme.updatedAt); assert.equal(t.currentWholeThemeHash, null);
    assert.notEqual(t.themeId, t.productionThemeExcluded); assert.equal(t.isolation, 'theme_isolated');
    assert.equal(t.authorization, false); assert.equal(t.bundledProductMutation, false);
    const blocks = [...doc.matchAll(/```text\n([\s\S]*?)```/g)].map(m => m[1].trim().split('\n'));
    const list = blocks.find(lines => lines.includes('templates/product.machine.json'));
    same(t.deploymentFiles.map(f => f.path), list, 'Document/deployment file list agrees'); assert.equal(list.length, 28);
    assert.ok(!list.some(f => f.startsWith('config/'))); assert.equal(new Set(list).size, list.length);
    [...t.deploymentFiles, ...t.nativeDependencyVerification, ...t.notRequiredForZeroGrantMachinePath].forEach(bound);
    assert.ok(list.includes('snippets/rhino-product-structured-data.liquid'));
    const a = p.assignmentEnvelope; bound(a.plan); bound(a.policy);
    assert.equal(a.planId, plan.planId); assert.equal(a.planHash, plan.planHash);
    same(a.targetGids, plan.futureCandidateGids); same(a.exclusions, policy.exclusions);
    same(a.writeAllowlist, ['templateSuffix']); assert.equal(a.intendedSuffix, 'machine');
    assert.equal(a.isolation, 'store_level_Product_mutation_NOT_theme_isolated'); assert.equal(a.authorization, false);
    same(a.freshBeforeReadPolicy, policy.beforeRead); assert.equal(a.futurePriorSuffixMustComeFromFreshRead, true);
    assert.equal(a.existingF7ExecutionAdapterAvailable, false);
    assert.equal(a.assignmentMethodValidation, 'unresolved_Admin_UI_live_theme_template_constraint_API_execution_behavior_unverified');
    assert.equal(a.productionFallbackValidation, 'required_before_GO_not_proven_by_preview_deployment');
    assert.ok(doc.includes('Assignment-method prerequisite') && doc.includes('live theme'));
    assert.equal(p.paymentDecision.id, 'F-DEC-001'); assert.equal(p.paymentDecision.state, 'open');
    assert.equal(p.paymentDecision.choice, null); assert.equal(p.paymentDecision.choices.length, 2);
    assert.equal(p.paymentDecision.customFinancingCopyAllowed, false); assert.equal(p.paymentDecision.suppressionToggleExists, false);
    assert.equal(p.performance.executionAuthorized, false); bound(p.performance.budget); bound(p.performance.protocol);
    same(p.performance.routes, p.proposedScope.map(s => s.route)); assert.equal(p.performance.sampleCountPlanned, 96);
    assert.equal(p.performance.desktopStage, 'preview-diagnostic'); assert.equal(p.performance.mobileStage, 'release-certification');
    let containmentRenders = 0;
    function empty(file, context) { assert.equal(render('snippets/' + file + '.liquid', context).trim(), '', file); containmentRenders++; }
    for (const scope of p.proposedScope) {
        const product = { id: scope.productGid.split('/').pop(), title: scope.label, url: scope.route,
            description: 'BLOCKED_FACT_SENTINEL', media: [], variants: [{ id: 'fixture-only-native-offer', url: scope.route, price: 10000, available: false }] };
        const context = { product, request: { host: 'rhino-lapidary.myshopify.com', origin: 'https://rhino-lapidary.myshopify.com', page_type: 'product' },
            section: { id: 'shell-only-local-proof' }, cart: { currency: { iso_code: 'USD' } }, projection: null };
        for (const projection of ['rhino-product-fact-projection', 'rhino-product-context-delivery-projection', 'rhino-product-support-resources-projection',
            'rhino-product-media-eligibility', 'product-media-modal', 'rhino-product-description', 'product-disclosures']) empty(projection, context);
        const json = JSON.parse(render('snippets/rhino-product-structured-data.liquid', context)); containmentRenders++;
        assert.equal(json.productID, scope.productGid); assert.equal(json.name, scope.label); assert.ok(json.offers.length);
        assert.ok(!JSON.stringify(json).includes('BLOCKED_FACT_SENTINEL'));
        assert.ok(!['description', 'image', 'isAccessoryOrSparePartFor', 'additionalProperty', 'hasPart', 'warranty'].some(k => Object.hasOwn(json, k)));
    }
    for (const leaf of ['specifications', 'contents', 'contextual', 'delivery', 'support', 'resources']) {
        empty('rhino-machine-' + leaf, { request: { host: 'rhino-lapidary.myshopify.com' },
            projection: { fixture_only: true, key_specs: [{}], contents: [{}], contextual: [{}], delivery: [{}], warranty: [{}], resources: [{}] } });
    }
    console.log(`Shell handoff valid: eight proposals, three exclusions, full 38/122 E inputs, 28 preview files, ${containmentRenders} local containment renders; authorizations=false; no live actions.`);
    return { containmentRenders };
}
if (require.main === module) {
    try { run(); } catch (error) { console.error(error.stack); process.exitCode = 1; }
}
module.exports = { run, dataPath, docPath };
