'use strict';

const assert = require('node:assert/strict');
const {
    EXPECTED_EXTRAS,
    applyProjection,
    assertProposalAuthorityBoundary,
    fingerprint,
    identifyUsZone,
    identifyZeroCostRate,
    runRemediationPreflight,
} = require('./lib/epic-k-remediation-preflight');
const { schemaErrors } = require('./lib/epic-k-evidence-drift');
const { clone, readJson, US_STATES } = require('./lib/epic-k-policy');

const snapshot = readJson('data/epic-k-shopify-config-snapshot-2026-10-24.json');
const proposal = readJson('data/epic-k-shopify-remediation-proposal-2026-10-24.json');
const provenance = readJson('data/epic-k-shopify-audit-provenance-2026-10-24.json');
const evidenceGap = readJson('data/epic-k-evidence-gap-report.json');
const policy = readJson('data/epic-k-fulfillment-policy.json');
const tests = [];
function test(name, run) { tests.push({ name, run }); }
function rateCandidate(value = proposal) { return value.candidates.find((candidate) => candidate.id === 'K-REM-001'); }
function zoneCandidate(value = proposal) { return value.candidates.find((candidate) => candidate.id === 'K-REM-002'); }
function state(report, id) { return report.results.find((entry) => entry.id === id)?.state; }
function substate(report, id) { return report.results.find((entry) => entry.id === 'geography')?.findings?.find((entry) => entry.id === id)?.state; }

test('proposal conforms to its strict repository schema', () => assert.deepEqual(
    schemaErrors('schemas/epic-k-remediation-proposal.schema.json', proposal, 'remediation proposal'),
    [],
));
test('source fingerprint is exact and deterministic', () => assert.equal(fingerprint(snapshot), proposal.source.snapshotFingerprintSha256));
test('zero-cost rate identification is exact', () => assert.equal(identifyZeroCostRate(snapshot, rateCandidate()).id, 'RATE_30FCB2E66D59853D'));
test('US zone identification is exact', () => assert.equal(identifyUsZone(snapshot, zoneCandidate()).id, 'ZONE_8FBCE0BCBE55E5F2'));
test('twelve out-of-scope codes are identified exactly', () => {
    const zone = identifyUsZone(snapshot, zoneCandidate());
    assert.deepEqual(zone.subdivisionCodes.filter((code) => !US_STATES.has(code)).sort(), [...EXPECTED_EXTRAS]);
});
test('missing zero-cost rate fails closed', () => {
    const value = clone(snapshot);
    value.rates = value.rates.filter((rate) => rate.id !== rateCandidate().observed.targetRef);
    assert.throws(() => identifyZeroCostRate(value, rateCandidate()), /found 0/);
});
test('ambiguous zero-cost rate fails closed', () => {
    const value = clone(snapshot);
    const duplicate = clone(identifyZeroCostRate(value, rateCandidate()));
    duplicate.id = 'RATE_SYNTHETIC_DUPLICATE';
    value.rates.push(duplicate);
    assert.throws(() => identifyZeroCostRate(value, rateCandidate()), /found 2/);
});
test('missing US zone fails closed', () => {
    const value = clone(snapshot);
    value.zones = value.zones.filter((zone) => !zone.countryCodes.includes('US'));
    assert.throws(() => identifyUsZone(value, zoneCandidate()), /found 0/);
});
test('ambiguous US zone fails closed', () => {
    const value = clone(snapshot);
    const duplicate = clone(identifyUsZone(value, zoneCandidate()));
    duplicate.id = 'ZONE_SYNTHETIC_DUPLICATE';
    value.zones.push(duplicate);
    assert.throws(() => identifyUsZone(value, zoneCandidate()), /found 2/);
});
test('wrong store identity fails closed', () => {
    const value = clone(snapshot);
    value.source.storeRef = 'OTHER_STORE';
    assert.throws(() => applyProjection(value, proposal, provenance), /does not match RHINO_LAPIDARY/);
});
test('synthetic evidence cannot support operational remediation', () => {
    const value = clone(snapshot);
    value.synthetic = true;
    assert.throws(() => applyProjection(value, proposal, provenance), /Synthetic evidence cannot support/);
});
test('mismatched snapshot fingerprint fails closed', () => {
    const value = clone(proposal);
    value.source.snapshotFingerprintSha256 = '0'.repeat(64);
    assert.throws(() => applyProjection(snapshot, value, provenance), /fingerprint does not match/);
});
test('mismatched audit provenance fails closed', () => {
    const value = clone(provenance);
    value.auditId = 'K1B02-AUDIT-2026-10-23';
    assert.throws(() => applyProjection(snapshot, proposal, value), /do not describe the same/);
});
test('source snapshot remains unchanged after projection', () => {
    const before = JSON.stringify(snapshot);
    applyProjection(snapshot, proposal, provenance);
    assert.equal(JSON.stringify(snapshot), before);
});
test('projection removes only the identified zero-cost rate', () => {
    const { projected } = applyProjection(snapshot, proposal, provenance);
    assert.equal(projected.rates.length, snapshot.rates.length - 1);
    assert(!projected.rates.some((rate) => rate.id === 'RATE_30FCB2E66D59853D'));
    assert.deepEqual(projected.rates, snapshot.rates.filter((rate) => rate.id !== 'RATE_30FCB2E66D59853D'));
});
test('projection retains the observed $8 and $15 flat-rate evidence', () => {
    const { projected } = applyProjection(snapshot, proposal, provenance);
    assert.deepEqual(projected.rates.filter((rate) => [800, 1500].includes(rate.amountCents)), snapshot.rates.filter((rate) => [800, 1500].includes(rate.amountCents)));
});
test('projection leaves unresolved carrier-calculated rates unchanged', () => {
    const { projected } = applyProjection(snapshot, proposal, provenance);
    assert.deepEqual(projected.rates.filter((rate) => rate.type === 'carrier_calculated'), snapshot.rates.filter((rate) => rate.type === 'carrier_calculated'));
});
test('projection limits the US zone to exactly 50 states', () => {
    const { projected } = applyProjection(snapshot, proposal, provenance);
    const zone = projected.zones.find((entry) => entry.id === 'ZONE_8FBCE0BCBE55E5F2');
    assert.equal(zone.subdivisionCodes.length, 50);
    assert.deepEqual([...zone.subdivisionCodes].sort(), [...US_STATES].sort());
});
test('projection does not change Products, locations, Markets, or profiles', () => {
    const { projected } = applyProjection(snapshot, proposal, provenance);
    assert.deepEqual(projected.products, snapshot.products);
    assert.deepEqual(projected.pickup, snapshot.pickup);
    assert.deepEqual(projected.markets, snapshot.markets);
    assert.deepEqual(projected.profiles, snapshot.profiles);
});
test('projection does not change the international zone', () => {
    const { projected } = applyProjection(snapshot, proposal, provenance);
    assert.deepEqual(projected.zones.find((zone) => zone.id === 'ZONE_785DB7998C7D0FFA'), snapshot.zones.find((zone) => zone.id === 'ZONE_785DB7998C7D0FFA'));
});
test('projected drift retains all required blocked and unverified states', () => {
    const actual = runRemediationPreflight(snapshot, proposal, provenance, evidenceGap, policy);
    assert.equal(state(actual.projectedDrift, 'free_shipping'), 'BLOCKED');
    assert.equal(state(actual.projectedDrift, 'machine_shipping'), 'BLOCKED');
    assert.equal(state(actual.projectedDrift, 'pickup'), 'BLOCKED');
    assert.equal(substate(actual.projectedDrift, 'domestic_destination_scope'), 'PASS');
    assert.equal(substate(actual.projectedDrift, 'international_checkout_exposure'), 'UNVERIFIED');
    assert.equal(substate(actual.projectedDrift, 'ak_rate_approval'), 'FAIL');
    assert.equal(substate(actual.projectedDrift, 'hi_rate_approval'), 'FAIL');
    assert.equal(state(actual.projectedDrift, 'product_logistics'), 'FAIL');
    assert.equal(state(actual.projectedDrift, 'evidence_freshness'), 'BLOCKED');
    assert.equal(actual.projectedDrift.liveCheckoutEnforcement, 'UNVERIFIED');
});
test('projection preserves 44 zero-weight Variants and eight blocked evidence requirements', () => {
    const actual = runRemediationPreflight(snapshot, proposal, provenance, evidenceGap, policy);
    assert.equal(actual.invariants.zeroWeightVariantCount, 44);
    assert.equal(actual.invariants.operationalEvidenceBlockedCount, 8);
});
test('proposal remains distinct from authorized execution', () => {
    assert.doesNotThrow(() => assertProposalAuthorityBoundary(proposal));
    assert.equal(proposal.proposalState, 'proposal_only');
    assert.equal(proposal.authority.executionAuthorized, false);
    assert.equal(proposal.authority.shopifyAccessAuthorized, false);
});
test('projected report is explicitly classified as a simulation', () => {
    const actual = runRemediationPreflight(snapshot, proposal, provenance, evidenceGap, policy);
    assert.equal(actual.projectedDrift.inputClassification, 'sanitized_shopify_projection');
    assert.equal(actual.simulationOnly, true);
    assert.equal(actual.shopifyConfigurationChanged, false);
});
test('attempted execution authorization is rejected', () => {
    const value = clone(proposal);
    value.authority.executionAuthorized = true;
    assert.throws(() => assertProposalAuthorityBoundary(value), /must remain proposal_only/);
});
for (const key of ['replacementAmountCents', 'inventedWeight', 'operationalApproval', 'checkoutEvidence']) {
    test(`invented proposed field ${key} is rejected`, () => {
        const value = clone(proposal);
        rateCandidate(value).proposed[key] = key === 'operationalApproval' ? 'accepted' : 1;
        assert(schemaErrors('schemas/epic-k-remediation-proposal.schema.json', value, 'remediation proposal').length > 0);
        assert.throws(() => assertProposalAuthorityBoundary(value), /prohibited commercial or operational evidence fields/);
    });
}
test('repeated runs with the same explicit inputs are stable', () => {
    const first = runRemediationPreflight(snapshot, proposal, provenance, evidenceGap, policy);
    const second = runRemediationPreflight(snapshot, proposal, provenance, evidenceGap, policy);
    assert.deepEqual(first, second);
});

let passed = 0;
for (const entry of tests) {
    try {
        entry.run();
        passed += 1;
    } catch (error) {
        console.error(`FAIL: ${entry.name}`);
        throw error;
    }
}
console.log(`Epic K remediation preflight tests passed: ${passed}/${tests.length}.`);
