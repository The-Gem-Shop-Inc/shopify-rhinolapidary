'use strict';

const Ajv2020 = require('ajv/dist/2020');
const { parseTimestamp, readJson, US_STATES } = require('./epic-k-policy');

const STATES = Object.freeze({ PASS: 'PASS', FAIL: 'FAIL', BLOCKED: 'BLOCKED', UNVERIFIED: 'UNVERIFIED' });
const STATE_PRIORITY = { PASS: 0, UNVERIFIED: 1, BLOCKED: 2, FAIL: 3 };

function createAjv() {
    return new Ajv2020({
        allErrors: true,
        strict: false,
        formats: { 'date-time': (value) => parseTimestamp(value) !== null },
    });
}

function schemaErrors(schemaPath, value, label) {
    const validate = createAjv().compile(readJson(schemaPath));
    if (validate(value)) return [];
    return (validate.errors || []).map((error) => `${label} schema ${error.instancePath || '/'} ${error.message}`);
}

function summarize(results) {
    return results.reduce((counts, result) => {
        counts[result.state] += 1;
        return counts;
    }, { PASS: 0, FAIL: 0, BLOCKED: 0, UNVERIFIED: 0 });
}

function worstState(results) {
    return results.reduce((worst, result) => (
        STATE_PRIORITY[result.state] > STATE_PRIORITY[worst] ? result.state : worst
    ), STATES.PASS);
}

function sameMembers(actual, expected) {
    return actual.length === expected.length
        && [...actual].sort().every((value, index) => value === [...expected].sort()[index]);
}

function subjectKey(receipt) {
    return JSON.stringify({
        requirementId: receipt.requirementId,
        type: receipt.subject?.type,
        identifiers: [...(receipt.subject?.identifiers || [])].sort(),
        scope: [...(receipt.subject?.scope || [])].sort(),
    });
}

function receiptSemanticFindings(receipts, requirements, asOf) {
    const findings = new Map((requirements.requirements || []).map((requirement) => [requirement.id, []]));
    const requirementById = new Map((requirements.requirements || []).map((requirement) => [requirement.id, requirement]));
    const ids = new Set();
    const signatures = new Set();
    const assertionValues = new Map();
    const now = parseTimestamp(asOf);

    for (const receipt of receipts.receipts || []) {
        const target = findings.get(receipt.requirementId) || [];
        const requirement = requirementById.get(receipt.requirementId);
        if (!requirement) {
            target.push({ severity: STATES.FAIL, message: `${receipt.id}: unsupported evidence requirement ${receipt.requirementId}` });
            continue;
        }
        if (ids.has(receipt.id)) target.push({ severity: STATES.FAIL, message: `${receipt.id}: duplicate receipt id` });
        ids.add(receipt.id);
        const signature = `${receipt.requirementId}|${receipt.source?.reference}|${subjectKey(receipt)}`;
        if (signatures.has(signature)) target.push({ severity: STATES.FAIL, message: `${receipt.id}: duplicate source and subject receipt` });
        signatures.add(signature);

        if (receipt.category !== requirement.category) {
            target.push({ severity: STATES.FAIL, message: `${receipt.id}: category does not match ${requirement.id}` });
        }
        if (!requirement.authorityOwners.includes(receipt.ownerRole)) {
            target.push({ severity: STATES.FAIL, message: `${receipt.id}: ${receipt.ownerRole} is not an authoritative owner for ${requirement.id}` });
        }
        if (receipt.synthetic || receipts.synthetic) {
            target.push({ severity: STATES.BLOCKED, message: `${receipt.id}: synthetic evidence cannot confer operational authority` });
        }
        if (receipt.verificationStatus !== 'accepted') {
            target.push({ severity: STATES.BLOCKED, message: `${receipt.id}: evidence is available but not accepted` });
        }
        if (!receipt.support?.supportsRequirement || receipt.support?.coverage !== 'complete') {
            target.push({ severity: STATES.BLOCKED, message: `${receipt.id}: evidence scope is partial or unsupported` });
        }
        if (receipt.support?.coverage === 'complete'
            && !sameMembers(receipt.support?.supportedFacts || [], requirement.requiredFacts)) {
            target.push({ severity: STATES.FAIL, message: `${receipt.id}: supported facts do not exactly cover the requirement scope` });
        }
        if (receipt.validity?.kind === 'interval') {
            const validFrom = parseTimestamp(receipt.validity.validFrom);
            const expiresAt = parseTimestamp(receipt.validity.expiresAt);
            if (now === null) target.push({ severity: STATES.BLOCKED, message: `${receipt.id}: a valid assessment time is required` });
            else if (validFrom === null || expiresAt === null || validFrom >= expiresAt) {
                target.push({ severity: STATES.FAIL, message: `${receipt.id}: invalid authoritative validity interval` });
            } else if (now < validFrom || now >= expiresAt) {
                target.push({ severity: STATES.FAIL, message: `${receipt.id}: authoritative evidence is expired or not yet valid` });
            }
        }

        for (const assertion of receipt.assertions || []) {
            const key = `${subjectKey(receipt)}|${assertion.name}`;
            const value = JSON.stringify(assertion.value);
            if (assertionValues.has(key) && assertionValues.get(key) !== value) {
                target.push({ severity: STATES.FAIL, message: `${receipt.id}: assertion conflicts with another receipt for the same subject and scope` });
            } else assertionValues.set(key, value);
        }
        findings.set(receipt.requirementId, target);
    }
    return findings;
}

function verifyEvidence(receipts, requirements = readJson('data/epic-k-operational-evidence-requirements.json'), options = {}) {
    const assessedAt = options.asOf || receipts?.assessmentAsOf;
    const errors = [
        ...schemaErrors('schemas/epic-k-operational-evidence.schema.json', requirements, 'requirements'),
        ...schemaErrors('schemas/epic-k-evidence-receipts.schema.json', receipts, 'receipts'),
    ];
    if (errors.length) return { errors, report: null };

    const semantic = receiptSemanticFindings(receipts, requirements, assessedAt);
    const results = requirements.requirements.map((requirement) => {
        const matching = receipts.receipts.filter((receipt) => receipt.requirementId === requirement.id);
        const findings = semantic.get(requirement.id) || [];
        let state;
        let message;
        if (findings.some((finding) => finding.severity === STATES.FAIL)) {
            state = STATES.FAIL;
            message = findings.map((finding) => finding.message).join('; ');
        } else if (findings.length || matching.length === 0) {
            state = STATES.BLOCKED;
            message = findings.length
                ? findings.map((finding) => finding.message).join('; ')
                : `${requirement.id}: authoritative evidence receipt is missing`;
        } else {
            state = STATES.PASS;
            message = `${requirement.id}: accepted authoritative evidence covers the complete required scope`;
        }
        return {
            id: requirement.id,
            state,
            message,
            actions: state === STATES.PASS ? [] : [`Attach an accepted, owner-authorized receipt for ${requirement.category}.`],
        };
    });
    const overallState = worstState(results);
    return {
        errors: [],
        report: {
            schemaVersion: 1,
            reportType: 'evidence_gap',
            assessedAt,
            inputClassification: receipts.inputClassification,
            overallState,
            operationalReadiness: overallState === STATES.PASS ? STATES.UNVERIFIED : STATES.BLOCKED,
            liveCheckoutEnforcement: STATES.UNVERIFIED,
            summary: summarize(results),
            results,
        },
    };
}

function finding(id, state, message, actions = []) {
    return { id, state, message, actions };
}

function assessConfigurationDrift(snapshot, policy = readJson('data/epic-k-fulfillment-policy.json'), options = {}) {
    const assessedAt = options.asOf || snapshot?.source?.collectedAt;
    const errors = [
        ...schemaErrors('schemas/epic-k-shopify-config-snapshot.schema.json', snapshot, 'snapshot'),
        ...schemaErrors('schemas/epic-k-fulfillment-policy.schema.json', policy, 'policy'),
    ];
    if (errors.length) return { errors, report: null };
    const complete = snapshot.source.datasetCompleteness;
    const results = [];

    const zeroRates = snapshot.rates.filter((rate) => rate.active && (rate.amountCents === 0 || rate.type === 'threshold_free'));
    const zeroDiscounts = snapshot.discounts.filter((discount) => discount.active && discount.shippingEffect === 'zero_shipping');
    if (zeroRates.length || zeroDiscounts.length) {
        results.push(finding('free_shipping', STATES.FAIL, 'Supplied configuration contains an active zero-cost or threshold-based free-shipping path.', ['Review the identified rate or promotion under K-DEC-001.']));
    } else if (complete.rates !== 'complete' || complete.discounts !== 'complete') {
        results.push(finding('free_shipping', STATES.BLOCKED, 'Rate or promotional-discount evidence is incomplete; absence of a supplied free-shipping rule is not proof of compliance.', ['Collect complete rate and shipping-discount datasets.']));
    } else {
        results.push(finding('free_shipping', STATES.PASS, 'No zero-cost or threshold-based free-shipping path appears in the supplied complete datasets.'));
    }

    const machines = snapshot.products.filter((product) => product.classification === 'machine');
    const profileById = new Map(snapshot.profiles.map((profile) => [profile.id, profile]));
    const permissiveMachines = machines.filter((product) => profileById.get(product.profileId)?.machineShipmentMode === 'ordinary_checkout_possible');
    const missingMachineProfiles = machines.filter((product) => !profileById.has(product.profileId));
    if (permissiveMachines.length) {
        results.push(finding('machine_shipping', STATES.FAIL, 'A supplied machine assignment points to a profile that may expose ordinary shipping checkout.', ['Verify all machine assignments and checkout bypass controls.']));
    } else if (complete.profiles !== 'complete' || complete.products !== 'complete' || missingMachineProfiles.length) {
        results.push(finding('machine_shipping', STATES.BLOCKED, 'Machine Product or shipping-profile assignment evidence is incomplete.', ['Collect complete Product-to-profile assignments.']));
    } else {
        results.push(finding('machine_shipping', STATES.PASS, 'Supplied machine assignments use quotation-required profiles; profiles alone do not prove every checkout bypass is blocked.'));
    }

    const grafton = snapshot.pickup.find((location) => location.code === policy.pickup.location);
    const unknownPickup = snapshot.products.some((product) => product.pickupEligibility === 'unknown');
    if (complete.pickup !== 'complete' || !grafton || !grafton.active || !grafton.pickupEnabled) {
        results.push(finding('pickup', STATES.BLOCKED, 'Grafton pickup configuration or location evidence is missing.', ['Collect location, pickup-setting, and readiness evidence.']));
    } else if (grafton.eligibilityAssignmentStatus !== 'complete' || grafton.inventoryReadinessStatus !== 'accepted' || unknownPickup) {
        results.push(finding('pickup', STATES.BLOCKED, 'An active location does not establish complete Product eligibility or inventory readiness.', ['Attach Product eligibility and Grafton readiness receipts.']));
    } else {
        results.push(finding('pickup', STATES.PASS, 'Supplied pickup configuration has explicit Product eligibility and location-readiness states.'));
    }

    const internationalZones = snapshot.zones.filter((zone) => zone.countryCodes.some((country) => country !== 'US'));
    const suppliedUsStates = new Set(snapshot.zones
        .filter((zone) => zone.countryCodes.includes('US'))
        .flatMap((zone) => zone.subdivisionCodes));
    const outsideFiftyStates = [...suppliedUsStates].filter((code) => !US_STATES.has(code));
    const missingUsStates = [...US_STATES].filter((code) => !suppliedUsStates.has(code));
    const nonContiguousRates = snapshot.rates.filter((rate) => rate.active && rate.subdivisionCodes.some((code) => code === 'AK' || code === 'HI'));
    const unapprovedNonContiguous = nonContiguousRates.filter((rate) => rate.operationalApproval !== 'accepted' || rate.serviceAvailability !== 'confirmed');
    if (internationalZones.length) {
        results.push(finding('geography', STATES.FAIL, 'A supplied shipping zone includes destinations outside the initial United States scope; zone presence does not prove an active international checkout market.', ['Verify market activation separately and reconcile the zone with K-DEC-004.']));
    } else if (outsideFiftyStates.length || (complete.zones === 'complete' && missingUsStates.length)) {
        results.push(finding('geography', STATES.FAIL, 'The supplied complete zone scope does not match the approved 50-state geography.', ['Reconcile state and territory scope with K-DEC-003 and K-DEC-004.']));
    } else if (unapprovedNonContiguous.length) {
        results.push(finding('geography', STATES.FAIL, 'Supplied Alaska or Hawaii rates lack accepted operational approval or confirmed service availability.', ['Attach separate Alaska and Hawaii rate and service approvals.']));
    } else if (complete.zones !== 'complete' || complete.markets !== 'complete' || complete.rates !== 'complete') {
        results.push(finding('geography', STATES.BLOCKED, 'Zone, market, or rate evidence is incomplete, so checkout geography cannot be established.', ['Collect complete zones, markets, and rate scope.']));
    } else {
        results.push(finding('geography', STATES.PASS, 'Supplied destinations remain within the 50-state scope and Alaska/Hawaii rates carry separate approval evidence.'));
    }

    const shippable = snapshot.products.filter((product) => product.requiresShipping);
    const invalidWeights = shippable.filter((product) => !product.shippingWeight || product.shippingWeight.value <= 0);
    const incompletePackages = shippable.filter((product) => !['complete', 'synthetic_complete'].includes(product.packageCharacteristicsStatus));
    if (invalidWeights.length) {
        results.push(finding('product_logistics', STATES.FAIL, 'One or more supplied shippable Products have missing or zero shipping weight.', ['Obtain authoritative packed weights through Epic E/F ownership.']));
    } else if (complete.products !== 'complete') {
        results.push(finding('product_logistics', STATES.BLOCKED, 'The supplied Product logistics dataset is incomplete.', ['Collect complete Product logistics records.']));
    } else if (incompletePackages.length) {
        results.push(finding('product_logistics', STATES.UNVERIFIED, 'Weights are present, but package characteristics are incomplete; dimensional weight and package count cannot be inferred.', ['Attach packed package characteristics.']));
    } else {
        results.push(finding('product_logistics', STATES.PASS, 'Supplied Product records contain positive weights and explicit package-characteristic status.'));
    }

    const asOf = parseTimestamp(assessedAt);
    const expiration = snapshot.source.validity.kind === 'interval' ? parseTimestamp(snapshot.source.validity.expiresAt) : null;
    if (snapshot.source.validity.kind === 'interval' && (asOf === null || expiration === null || expiration <= asOf)) {
        results.push(finding('evidence_freshness', STATES.FAIL, 'The supplied snapshot is expired or cannot be evaluated against its authoritative validity interval.', ['Collect a fresh authorized snapshot.']));
    } else if (snapshot.synthetic) {
        results.push(finding('evidence_freshness', STATES.UNVERIFIED, 'Synthetic input validates the comparison engine only; its Shopify mapping and business authority are unverified.', ['Run a separately authorized, sanitized Shopify collection and approve its mapping.']));
    } else if (snapshot.source.mappingStatus !== 'approved_mapping_attached'
        || snapshot.source.authorityStatus !== 'accepted') {
        results.push(finding('evidence_freshness', STATES.BLOCKED, 'Snapshot mapping or collector authority is not accepted.', ['Approve the Shopify-to-normalized mapping and collection authority.']));
    } else if (snapshot.source.validity.kind === 'none_established') {
        results.push(finding('evidence_freshness', STATES.UNVERIFIED, 'No authoritative validity interval exists; no universal expiration period is inferred.', ['Have the source owner establish any applicable validity rule.']));
    } else {
        results.push(finding('evidence_freshness', STATES.PASS, 'Snapshot provenance and its explicit validity interval are usable for this comparison.'));
    }

    return {
        errors: [],
        report: {
            schemaVersion: 1,
            reportType: 'configuration_drift',
            assessedAt,
            inputClassification: snapshot.synthetic ? 'synthetic_fixture' : 'sanitized_future_shopify_audit',
            overallState: worstState(results),
            operationalReadiness: snapshot.synthetic ? STATES.BLOCKED : STATES.UNVERIFIED,
            liveCheckoutEnforcement: STATES.UNVERIFIED,
            summary: summarize(results),
            results,
        },
    };
}

module.exports = {
    STATES,
    assessConfigurationDrift,
    createAjv,
    schemaErrors,
    verifyEvidence,
};
