'use strict';
const assert = require('node:assert/strict');
const frozen = require('../../data/epic-f-performance-profiles.json');
const kbpsToBytes = value => value * 1000 / 8;
function parameters(profile = frozen) {
  assert.equal(profile.profileId, 'RHINO_LIGHTHOUSE_SLOW_4G_2026_10');
  assert.deepEqual(profile.effective, { requestLatencyMs: 562.5, downloadThroughputKbps: 1474.56, uploadThroughputKbps: 675, cpuSlowdownMultiplier: 4, packetLoss: 0 });
  const network = { offline: false, latency: profile.effective.requestLatencyMs, downloadThroughput: kbpsToBytes(profile.effective.downloadThroughputKbps), uploadThroughput: kbpsToBytes(profile.effective.uploadThroughputKbps) };
  assert.equal(network.downloadThroughput, 184320); assert.equal(network.uploadThroughput, 84375);
  return { network, rule: { urlPattern: '', latency: network.latency, downloadThroughput: network.downloadThroughput, uploadThroughput: network.uploadThroughput, packetLoss: 0 }, cpu: { rate: 4 } };
}
async function apply(session) {
  const p = parameters();
  const rule = await session.send('Network.emulateNetworkConditionsByRule', { offline: false, matchedNetworkConditions: [p.rule] });
  assert.equal(rule.ruleIds?.length, 1, 'Missing acknowledged throttle rule; no unthrottled fallback');
  await session.send('Network.overrideNetworkState', p.network);
  await session.send('Emulation.setCPUThrottlingRate', p.cpu);
  return { profileId: frozen.profileId, appliedAt: new Date().toISOString(), network: p.network, cpu: p.cpu, packetLoss: 0, ruleId: rule.ruleIds[0], acknowledged: true, verificationMethod: 'Exact CDP command acknowledgements plus per-request appliedNetworkConditionsId; local actual-network self-test. CDP exposes no numerical CPU getter.' };
}
function cacheProof(proof, usedContexts = new Set()) {
  assert.ok(proof && ['cold', 'warm'].includes(proof.cache), 'Missing cache state');
  assert.ok(proof.contextId && !usedContexts.has(proof.contextId), 'Reused measured context');
  assert.equal(proof.independentFreshContext, true);
  assert.equal(proof.measuredRoute, proof.targetRoute);
  assert.equal(proof.serviceWorkers, 'fresh-context; CDP bypass; no inherited registrations');
  assert.equal(proof.cacheDisabled, false, 'Warm-capable HTTP cache must remain enabled');
  assert.ok(proof.measuredAt && proof.cacheClearedAt);
  if (proof.cache === 'cold') {
    assert.equal(proof.productNavigationsBeforeMeasurement, 0, 'Cold Product navigation already primed');
    assert.equal(proof.prime, null);
  } else {
    assert.equal(proof.productNavigationsBeforeMeasurement, 1);
    assert.ok(proof.prime?.completed, 'Warm has no completed prime');
    assert.equal(proof.prime.route, proof.targetRoute, 'Wrong priming route');
    assert.ok(Date.parse(proof.cacheClearedAt) <= Date.parse(proof.prime.startedAt));
    assert.ok(Date.parse(proof.prime.completedAt) <= Date.parse(proof.measuredAt));
    assert.equal(proof.cacheClearedAfterPrime, false, 'Warm cleared after prime');
  }
  usedContexts.add(proof.contextId);
  return true;
}
module.exports = { frozen, kbpsToBytes, parameters, apply, cacheProof };
