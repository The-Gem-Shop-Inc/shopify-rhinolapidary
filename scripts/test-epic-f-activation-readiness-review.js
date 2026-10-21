'use strict';
const assert = require('node:assert/strict');
const { read, write } = require('./lib/epic-f-governance');
const { validateSnapshot, build, packetPath } = require('./lib/epic-f-activation-readiness-review');
const original = read(packetPath), expected = build(original.generatedAt);
assert.deepEqual(validateSnapshot(original, expected), []);
const row = (p, id) => p.rows.find(r => r.pbi === id);
const negatives = [
    ['stale Admin labeled current', p => { p.admin.freshness[0].observedAt = '2026-09-10T21:08:07.450Z'; }],
    ['expired read labeled current at generation', p => { p.admin.freshnessAtGeneration[0].state = 'current'; }],
    ['blocked decision approved', p => { p.unresolvedDecisions[0].currentState = 'approved'; }],
    ['proposed value approved', p => { p.relationships.edges.find(e => e.state === 'proposed').state = 'approved'; }],
    ['unreconciled value reconciled', p => { p.epicE[0].afterStateReconciled = true; }],
    ['fixture grant promoted real', p => { p.realGrants.counts[0].current = 1; }],
    ['conditional candidate executable', p => { p.machines[0].executable = true; }],
    ['missing GO authorized', p => { row(p, 'F-PBI-017B').activationAuthorization = 'granted'; }],
    ['local accessibility becomes live parity', p => { p.accessibility.currentShopifyMachineParity = 'verified'; }],
    ['local performance becomes certification', p => { p.performance.releaseCertification = 'complete'; }],
    ['renderer becomes activation', p => { row(p, 'F-PBI-006B').technicallyReadyExceptHumanGo = true; }],
    ['Vendor becomes warranty authority', p => { p.warranty.vendorIsAuthority = true; }],
    ['working Page becomes canonical File', p => { p.resources.workingPageIsCanonicalFile = true; }],
    ['native pickup becomes business approval', p => { p.operations[1].nativeBehaviorIsBusinessApproval = true; }],
    ['native terms resolve decision', p => { p.payment.nativeTermsAreDecisionApproval = true; }],
    ['draft omitted', p => { p.machines = p.machines.filter(m => m.status !== 'DRAFT'); }],
    ['duplicate exact Product', p => { p.machines[1] = structuredClone(p.machines[0]); }],
    ['unknown exact Product', p => { p.machines[0].productGid = 'gid://shopify/Product/1'; }],
    ['classification source becomes migration', p => { p.machines[0].productClass.currentValue = 'machine'; p.machines[0].productClass.migration = 'reconciled'; }],
    ['one GO role suffices', p => { p.rollout.GO[0].granted = true; }],
    ['exclusion removed', p => { p.rollout.exclusions.pop(); }],
    ['instrumentation active', p => { p.measurement.instrumentationReady = true; p.measurement.active = true; }],
    ['014B complete', p => { row(p, 'F-PBI-014B').currentStatus = 'complete'; }],
    ['018B complete', p => { row(p, 'F-PBI-018B').currentStatus = 'complete'; }],
    ['historical hash drift', p => { p.evidence[0].sha256 = '0'.repeat(64); }],
    ['missing source', p => { p.evidence.pop(); }],
    ['deployed template invented', p => { p.rollout.templatePresentThemeCount = 1; }],
    ['publication authorized', p => { p.safety.productionPublication = true; }],
    ['global ready invented', p => { p.ready = true; }]
];
const results = negatives.map(([name, mutate]) => {
    const packet = structuredClone(original); mutate(packet);
    assert.ok(validateSnapshot(packet, expected).length, `False promotion accepted: ${name}`);
    return { name, rejected: true };
});
write('docs/qa/evidence/epic-f/activation-review-adversarial-tests.json', {
    observedAt: new Date().toISOString(), exitCode: 0, baselinePassed: true, negatives: results, mutations: 0, emittedEvents: 0
});
console.log(`Activation review: valid source projection and ${results.length} false promotions rejected.`);
