'use strict';

const crypto = require('node:crypto');
const { assessConfigurationDrift } = require('./epic-k-evidence-drift');
const { clone, US_STATES } = require('./epic-k-policy');

const EXPECTED_STORE = 'RHINO_LAPIDARY';
const EXPECTED_EXTRAS = Object.freeze(['AA', 'AE', 'AP', 'AS', 'DC', 'FM', 'GU', 'MH', 'MP', 'PR', 'PW', 'VI']);
const CANDIDATE_IDS = Object.freeze(['K-REM-001', 'K-REM-002']);

function fingerprint(value) {
    return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function sameJson(left, right) {
    return JSON.stringify(left) === JSON.stringify(right);
}

function sameMembers(left, right) {
    return left.length === right.length
        && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function byId(report, id) {
    return report.results.find((entry) => entry.id === id);
}

function subfinding(report, resultId, findingId) {
    return byId(report, resultId)?.findings?.find((entry) => entry.id === findingId);
}

function candidateById(proposal, id) {
    const matches = proposal.candidates.filter((candidate) => candidate.id === id);
    if (matches.length !== 1) throw new Error(`Proposal must contain exactly one ${id} candidate.`);
    return matches[0];
}

function assertProposalAuthorityBoundary(proposal) {
    if (proposal.proposalState !== 'proposal_only'
        || proposal.authority?.executionAuthorized !== false
        || proposal.authority?.shopifyAccessAuthorized !== false
        || proposal.authority?.operationalEvidenceAccepted !== false) {
        throw new Error('Remediation preflight must remain proposal_only with execution, Shopify access, and operational acceptance disabled.');
    }
    if (!sameMembers(proposal.candidates.map((candidate) => candidate.id), CANDIDATE_IDS)
        || proposal.candidates.some((candidate) => candidate.proposalState !== 'proposal_only')) {
        throw new Error('Remediation preflight must contain only the two adopted proposal-only candidates.');
    }
    const forbiddenProposedKeys = /(?:amount|price|weight|dimension|insurance|operationalApproval|checkoutEvidence)/i;
    for (const candidate of proposal.candidates) {
        const keys = [];
        const visit = (value) => {
            if (!value || typeof value !== 'object') return;
            for (const [key, child] of Object.entries(value)) {
                keys.push(key);
                visit(child);
            }
        };
        visit(candidate.proposed);
        const invented = keys.filter((key) => forbiddenProposedKeys.test(key));
        if (invented.length) throw new Error(`${candidate.id}: proposed configuration contains prohibited commercial or operational evidence fields: ${invented.join(', ')}`);
    }
}

function assertSourceAuthority(snapshot, proposal, provenance) {
    const actualFingerprint = fingerprint(snapshot);
    if (snapshot.synthetic || proposal.source.synthetic) throw new Error('Synthetic evidence cannot support a real configuration remediation proposal.');
    if (snapshot.source.storeRef !== EXPECTED_STORE || proposal.source.storeRef !== EXPECTED_STORE || provenance.storeRef !== EXPECTED_STORE) {
        throw new Error('Remediation source store identity does not match RHINO_LAPIDARY.');
    }
    if (snapshot.source.sourceVerificationStatus !== 'verified' || provenance.collection?.storeIdentityVerified !== true) {
        throw new Error('Verified Shopify source identity is required for the remediation preflight.');
    }
    if (proposal.source.snapshotFingerprintSha256 !== actualFingerprint
        || proposal.candidates.some((candidate) => candidate.observed.snapshotFingerprintSha256 !== actualFingerprint)) {
        throw new Error('Proposal snapshot fingerprint does not match the supplied sanitized snapshot.');
    }
    if (proposal.source.auditId !== provenance.auditId
        || proposal.source.collectedAt !== snapshot.source.collectedAt
        || proposal.source.assessedAt !== snapshot.source.assessmentTime
        || provenance.collectedAt !== snapshot.source.collectedAt
        || provenance.assessedAt !== snapshot.source.assessmentTime) {
        throw new Error('Proposal, snapshot, and audit provenance do not describe the same collection and assessment.');
    }
    if (proposal.source.mappingAcceptanceStatus !== 'pending'
        || snapshot.source.mappingAcceptanceStatus !== 'pending'
        || provenance.productOwnerMappingAcceptanceStatus !== 'pending') {
        throw new Error('K1B-03A must preserve pending Product Owner mapping acceptance.');
    }
    return actualFingerprint;
}

function identifyZeroCostRate(snapshot, candidate) {
    const matches = snapshot.rates.filter((rate) => rate.active
        && rate.type === 'threshold_free'
        && rate.amountCents === 0
        && rate.thresholdCents === 7000
        && rate.effectivePriceStatus === 'verified_zero');
    if (matches.length !== 1) throw new Error(`Expected exactly one active zero-cost 7000-cent threshold rate; found ${matches.length}.`);
    const target = matches[0];
    if (target.id !== candidate.observed.targetRef) throw new Error('Zero-cost rate reference does not match the proposal.');
    const expectedCurrent = candidate.observed.currentValue;
    for (const key of ['active', 'type', 'amountCents', 'thresholdCents', 'currencyCode']) {
        if (target[key] !== expectedCurrent[key]) throw new Error(`Zero-cost rate ${key} does not match observed proposal evidence.`);
    }
    const paidRefs = candidate.proposed.preserveObservedPaidRateRefs;
    const paidRates = snapshot.rates.filter((rate) => paidRefs.includes(rate.id));
    if (paidRates.length !== 2
        || !sameMembers(paidRates.map((rate) => rate.amountCents), [800, 1500])
        || paidRates.some((rate) => rate.type !== 'flat' || rate.effectivePriceStatus !== 'verified_paid')) {
        throw new Error('Observed $8 and $15 flat-rate evidence does not match the proposal preservation scope.');
    }
    return target;
}

function identifyUsZone(snapshot, candidate) {
    const matches = snapshot.zones.filter((zone) => sameMembers(zone.countryCodes, ['US']));
    if (matches.length !== 1) throw new Error(`Expected exactly one US shipping zone; found ${matches.length}.`);
    const target = matches[0];
    if (target.id !== candidate.observed.targetRef) throw new Error('US zone reference does not match the proposal.');
    if (!sameMembers(target.subdivisionCodes, candidate.observed.currentValue.subdivisionCodes)) {
        throw new Error('US zone subdivisions do not match the observed proposal evidence.');
    }
    const extras = target.subdivisionCodes.filter((code) => !US_STATES.has(code)).sort();
    if (!sameMembers(extras, EXPECTED_EXTRAS)
        || !sameMembers(extras, candidate.observed.currentValue.outOfScopeSubdivisionCodes)
        || !sameMembers(extras, candidate.proposed.removedSubdivisionCodes)) {
        throw new Error('US zone does not contain exactly the twelve reviewed out-of-scope codes.');
    }
    const approvedStates = [...US_STATES].sort();
    if (!sameMembers(candidate.proposed.subdivisionCodes, approvedStates)) {
        throw new Error('Proposed US zone scope must contain exactly the approved 50 states.');
    }
    return target;
}

function applyProjection(snapshot, proposal, provenance) {
    assertProposalAuthorityBoundary(proposal);
    const sourceFingerprint = assertSourceAuthority(snapshot, proposal, provenance);
    const rateCandidate = candidateById(proposal, 'K-REM-001');
    const zoneCandidate = candidateById(proposal, 'K-REM-002');
    const zeroRate = identifyZeroCostRate(snapshot, rateCandidate);
    const usZone = identifyUsZone(snapshot, zoneCandidate);
    const projected = clone(snapshot);
    projected.rates = projected.rates.filter((rate) => rate.id !== zeroRate.id);
    const projectedUsZone = projected.zones.find((zone) => zone.id === usZone.id);
    projectedUsZone.subdivisionCodes = [...zoneCandidate.proposed.subdivisionCodes];
    return { projected, sourceFingerprint, zeroRate, usZone };
}

function assertProjectionPreservation(source, projected, zeroRate, usZone) {
    const preservedDomains = ['source', 'profiles', 'discounts', 'markets', 'pickup', 'products'];
    for (const domain of preservedDomains) {
        if (!sameJson(source[domain], projected[domain])) throw new Error(`Projection changed out-of-scope ${domain} data.`);
    }
    const sourceInternational = source.zones.filter((zone) => zone.id !== usZone.id);
    const projectedInternational = projected.zones.filter((zone) => zone.id !== usZone.id);
    if (!sameJson(sourceInternational, projectedInternational)) throw new Error('Projection changed the international zone.');
    const sourcePreservedRates = source.rates.filter((rate) => rate.id !== zeroRate.id);
    if (!sameJson(sourcePreservedRates, projected.rates)) throw new Error('Projection changed a rate outside K-REM-001.');
    if (source.products.filter((product) => product.requiresShipping && product.shippingWeight?.value === 0).length !== 44
        || projected.products.filter((product) => product.requiresShipping && product.shippingWeight?.value === 0).length !== 44) {
        throw new Error('Projection must preserve the 44 observed zero-weight shippable Variants.');
    }
}

function runRemediationPreflight(snapshot, proposal, provenance, evidenceGapReport, policy) {
    const sourceBefore = JSON.stringify(snapshot);
    const current = assessConfigurationDrift(snapshot, policy, { asOf: proposal.source.assessedAt });
    if (current.errors.length) throw new Error(`Current snapshot drift assessment failed: ${current.errors.join('; ')}`);
    const { projected, sourceFingerprint, zeroRate, usZone } = applyProjection(snapshot, proposal, provenance);
    assertProjectionPreservation(snapshot, projected, zeroRate, usZone);
    if (JSON.stringify(snapshot) !== sourceBefore) throw new Error('Projection mutated the source snapshot.');
    const projectedAssessment = assessConfigurationDrift(projected, policy, { asOf: proposal.source.assessedAt });
    if (projectedAssessment.errors.length) throw new Error(`Projected drift assessment failed: ${projectedAssessment.errors.join('; ')}`);
    const report = {
        ...projectedAssessment.report,
        inputClassification: 'sanitized_shopify_projection',
    };
    const expectations = proposal.projectionExpectations;
    const checks = [
        [byId(report, 'free_shipping')?.state, expectations.freeShipping, 'free shipping'],
        [subfinding(report, 'geography', 'domestic_destination_scope')?.state, expectations.domesticDestinationScope, 'domestic destination scope'],
        [subfinding(report, 'geography', 'international_checkout_exposure')?.state, expectations.internationalCheckoutExposure, 'international checkout exposure'],
        [subfinding(report, 'geography', 'ak_rate_approval')?.state, expectations.alaskaRateApproval, 'Alaska rate approval'],
        [subfinding(report, 'geography', 'hi_rate_approval')?.state, expectations.hawaiiRateApproval, 'Hawaii rate approval'],
        [byId(report, 'machine_shipping')?.state, expectations.machineShipping, 'machine shipping'],
        [byId(report, 'pickup')?.state, expectations.pickup, 'pickup'],
        [byId(report, 'product_logistics')?.state, expectations.productLogistics, 'product logistics'],
        [byId(report, 'evidence_freshness')?.state, expectations.evidenceFreshness, 'evidence freshness'],
        [report.liveCheckoutEnforcement, expectations.liveCheckoutEnforcement, 'live checkout enforcement'],
    ];
    for (const [actual, expected, label] of checks) {
        if (actual !== expected) throw new Error(`Projected ${label} state ${actual} does not match expected ${expected}.`);
    }
    if (projected.rates.some((rate) => rate.id === zeroRate.id || (rate.active && rate.amountCents === 0 && rate.thresholdCents === 7000))) {
        throw new Error('Projected configuration still contains the reviewed zero-cost threshold path.');
    }
    const projectedUsZone = projected.zones.find((zone) => zone.id === usZone.id);
    if (!sameMembers(projectedUsZone.subdivisionCodes, [...US_STATES])) throw new Error('Projected US zone does not contain exactly 50 states.');
    if (evidenceGapReport.summary?.BLOCKED !== expectations.blockedOperationalEvidenceCount
        || evidenceGapReport.operationalReadiness !== 'BLOCKED') {
        throw new Error('All eight operational evidence requirements must remain blocked.');
    }
    return {
        proposalId: proposal.proposalId,
        proposalState: proposal.proposalState,
        simulationOnly: true,
        shopifyConfigurationChanged: false,
        sourceFingerprint,
        assessmentTime: proposal.source.assessedAt,
        identifiedTargets: {
            zeroCostRateRef: zeroRate.id,
            usZoneRef: usZone.id,
            removedSubdivisionCodes: [...EXPECTED_EXTRAS],
        },
        currentDrift: current.report,
        projectedDrift: report,
        projectedSnapshot: projected,
        invariants: {
            sourceSnapshotUnchanged: JSON.stringify(snapshot) === sourceBefore,
            zeroCostThresholdPathAbsent: true,
            usZoneContainsExactlyFiftyStates: true,
            nonTargetRatesUnchanged: true,
            productsUnchanged: true,
            locationsUnchanged: true,
            marketsUnchanged: true,
            internationalZoneUnchanged: true,
            zeroWeightVariantCount: 44,
            operationalEvidenceBlockedCount: evidenceGapReport.summary.BLOCKED,
            mappingAcceptanceStatus: projected.source.mappingAcceptanceStatus,
            liveCheckoutEnforcement: report.liveCheckoutEnforcement,
            executionAuthorized: proposal.authority.executionAuthorized,
        },
    };
}

module.exports = {
    CANDIDATE_IDS,
    EXPECTED_EXTRAS,
    applyProjection,
    assertProposalAuthorityBoundary,
    fingerprint,
    identifyUsZone,
    identifyZeroCostRate,
    runRemediationPreflight,
};
