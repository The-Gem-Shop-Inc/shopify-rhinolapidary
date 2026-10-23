'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = path.resolve(__dirname, '..', '..');
const US_STATES = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]);
const NON_CONTIGUOUS_STATES = new Set(['AK', 'HI']);
const REQUIRED_DECISION_IDS = [
    'K-DEC-001', 'K-DEC-002', 'K-DEC-003', 'K-DEC-004', 'K-DEC-005', 'K-DEC-006',
    'K-DEC-007', 'K-DEC-008', 'K-DEC-009', 'K-DEC-010', 'K-DEC-011', 'K-DEC-014',
    'K-DEC-015', 'K-DEC-016', 'K-DEC-017', 'K-DEC-018', 'K-DEC-019',
];
const REQUIRED_EVIDENCE_CATEGORIES = [
    'product_variant_pickup_eligibility',
    'grafton_inventory_location_readiness',
    'shipping_weights_package_characteristics',
    'approved_shipping_services_regions',
    'alaska_hawaii_rates',
    'carrier_insurance_options',
    'claims_contacts_responsibilities',
    'quotation_approval_scope_expiration',
];
const ROUTES = Object.freeze({
    ORDINARY_SHIPPING: 'ordinary_paid_shipping',
    QUOTATION: 'whole_cart_quotation_required',
    PICKUP: 'ordinary_grafton_pickup',
    BLOCKED: 'blocked_by_policy',
    EVIDENCE: 'operational_evidence_required',
});

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function createAjv() {
    return new Ajv2020({
        allErrors: true,
        strict: false,
        formats: {
            date: /^\d{4}-\d{2}-\d{2}$/,
            'date-time': (value) => Number.isFinite(Date.parse(value)),
        },
    });
}

function schemaErrors(schemaPath, value, label) {
    const validate = createAjv().compile(readJson(schemaPath));
    if (validate(value)) return [];
    return (validate.errors || []).map((error) => (
        `${label} schema ${error.instancePath || '/'} ${error.message}`
    ));
}

function duplicateValues(values) {
    return [...new Set(values.filter((value, index) => values.indexOf(value) !== index))];
}

function sameMembers(actual, expected) {
    return actual.length === expected.length
        && [...actual].sort().every((value, index) => value === [...expected].sort()[index]);
}

function validateContracts({ decisions, policy, evidence, scenarios } = {}) {
    const errors = [];
    if (!decisions) decisions = readJson('data/epic-k-provisional-decisions.json');
    if (!policy) policy = readJson('data/epic-k-fulfillment-policy.json');
    if (!evidence) evidence = readJson('data/epic-k-operational-evidence-requirements.json');

    errors.push(...schemaErrors('schemas/epic-k-provisional-decisions.schema.json', decisions, 'decisions'));
    errors.push(...schemaErrors('schemas/epic-k-fulfillment-policy.schema.json', policy, 'policy'));
    errors.push(...schemaErrors('schemas/epic-k-operational-evidence.schema.json', evidence, 'evidence'));
    if (scenarios) errors.push(...schemaErrors('schemas/epic-k-policy-scenarios.schema.json', scenarios, 'scenarios'));

    const decisionIds = (decisions.decisions || []).map((decision) => decision.id);
    if (!sameMembers(decisionIds, REQUIRED_DECISION_IDS)) {
        errors.push(`decision set must contain exactly: ${REQUIRED_DECISION_IDS.join(', ')}`);
    }
    for (const id of duplicateValues(decisionIds)) errors.push(`duplicate decision id: ${id}`);
    if ((decisions.decisions || []).some((decision) => decision.status !== 'provisional')) {
        errors.push('every Epic K decision must remain provisional in K1A');
    }
    if (!sameMembers(policy.decisionContract?.decisionIds || [], REQUIRED_DECISION_IDS)) {
        errors.push('policy decision references must match the complete provisional decision set');
    }
    if (policy.decisionContract?.version !== decisions.version) {
        errors.push('policy and decision contract versions must match');
    }
    if (policy.shipping?.freeShippingAllowed !== false) {
        errors.push('K-DEC-001 requires free shipping to be rejected for shipped orders');
    }
    if (policy.shipping?.machineShipment?.route !== 'approved_whole_cart_quotation_before_payment') {
        errors.push('K-DEC-002 requires a whole-cart quotation before machine-shipment payment');
    }
    if (policy.pickup?.unknownEligibility !== 'not_approved') {
        errors.push('unknown pickup eligibility must not default to approval');
    }
    if (policy.quotation?.validity?.durationDefined !== false) {
        errors.push('K1A must not invent a quotation validity duration');
    }
    if (policy.enforcement?.liveCheckoutEnforcement !== false
        || policy.enforcement?.shopifyConfigurationCompliance !== 'unverified') {
        errors.push('repository policy must not claim live Shopify enforcement or compliance');
    }
    if (policy.enforcement?.realProductEligibilityEstablished !== false) {
        errors.push('K1A has no authoritative real Product or Variant eligibility register');
    }
    if (policy.insurance?.missingCostBehavior !== 'cannot_be_selected_or_represented_as_free') {
        errors.push('missing insurance cost must not be represented as free coverage');
    }
    if (policy.claims?.uninsuredRemediesCategoricallyEliminated !== false) {
        errors.push('policy must not claim that no insurance categorically eliminates all remedies');
    }
    if (policy.claims?.rhinoNotificationRequired !== true
        || policy.claims?.designatedContactProcessRequired !== true) {
        errors.push('claims instructions must require Rhino notification and a designated contact process');
    }

    const categories = (evidence.requirements || []).map((requirement) => requirement.category);
    if (!sameMembers(categories, REQUIRED_EVIDENCE_CATEGORIES)) {
        errors.push(`evidence requirements must contain exactly: ${REQUIRED_EVIDENCE_CATEGORIES.join(', ')}`);
    }
    for (const requirement of evidence.requirements || []) {
        if (requirement.syntheticDataMaySatisfy !== false) {
            errors.push(`${requirement.id || 'evidence requirement'} must reject synthetic readiness evidence`);
        }
        if (requirement.status !== 'missing_external_evidence') {
            errors.push(`${requirement.id || 'evidence requirement'} cannot be marked satisfied in K1A`);
        }
    }

    if (scenarios) {
        if (scenarios.fixtureType !== 'synthetic_only' || scenarios.realProductClaimsAllowed !== false) {
            errors.push('scenario fixtures must be synthetic and cannot establish real Product claims');
        }
        const serialized = JSON.stringify(scenarios);
        if (/gid:\/\/shopify\//i.test(serialized)) {
            errors.push('synthetic scenario fixtures must not contain Shopify GIDs');
        }
        for (const scenario of scenarios.routingCases || []) {
            for (const item of scenario.cart?.items || []) {
                if (!/^SYNTHETIC-[A-Z0-9-]+$/.test(item.id || '')) {
                    errors.push(`${scenario.id || 'scenario'} has a non-synthetic item identifier`);
                }
            }
        }
    }
    return errors;
}

function result(route, policyEligible, reasons, extra = {}) {
    return {
        route,
        policyEligible,
        shopifyCheckoutEnforceable: 'unverified',
        paymentAuthorized: false,
        reasons,
        ...extra,
    };
}

function assessFulfillment(scenario, policy = readJson('data/epic-k-fulfillment-policy.json')) {
    const items = scenario?.cart?.items || [];
    const request = scenario?.request || {};
    const destination = request.destination || {};
    if (items.length === 0) return result(ROUTES.BLOCKED, false, ['cart must contain at least one item']);
    if (destination.countryCode !== policy.shipping.geography.initialCountry) {
        return result(ROUTES.BLOCKED, false, ['international fulfillment is outside initial Epic K scope']);
    }
    if (!US_STATES.has(destination.subdivisionCode)) {
        return result(ROUTES.BLOCKED, false, ['destination is not one of the approved 50 US states']);
    }

    if (request.intent === 'pickup') {
        if (request.pickupLocation !== policy.pickup.location) {
            return result(ROUTES.BLOCKED, false, ['requested pickup location is not approved by policy']);
        }
        if (items.some((item) => item.pickupEligibility === 'rejected')) {
            return result(ROUTES.BLOCKED, false, ['every cart item must be explicitly pickup eligible']);
        }
        if (items.some((item) => item.pickupEligibility !== 'approved')) {
            return result(ROUTES.EVIDENCE, null, ['pickup eligibility evidence is missing for one or more cart items']);
        }
        if (request.locationReadiness !== 'approved') {
            return result(ROUTES.EVIDENCE, null, ['Grafton inventory and location readiness evidence is missing']);
        }
        return result(ROUTES.PICKUP, true, ['all cart items and the Grafton location are explicitly pickup approved']);
    }

    if (request.intent === 'rhino_delivery') {
        return result(ROUTES.QUOTATION, true, ['Rhino delivery requires an individually approved whole-cart quotation'], {
            quotationIntakeAllowed: true,
        });
    }
    if (request.intent !== 'shipment') {
        return result(ROUTES.BLOCKED, false, ['fulfillment intent is not recognized by the policy']);
    }

    const hasMachine = items.some((item) => item.kind === 'machine');
    const nonContiguous = NON_CONTIGUOUS_STATES.has(destination.subdivisionCode);
    if (hasMachine || nonContiguous) {
        const reasons = [];
        if (hasMachine) reasons.push('shipped machinery requires one approved quotation for the complete cart');
        if (nonContiguous) reasons.push('Alaska and Hawaii require separately approved rates and service before invoicing');
        return result(ROUTES.QUOTATION, true, reasons, {
            quotationIntakeAllowed: true,
            separateDestinationApprovalRequired: nonContiguous,
            quotationScope: 'complete_cart',
        });
    }

    if (request.shippingServiceApproval !== 'approved') {
        return result(ROUTES.EVIDENCE, null, ['approved shipping service and region evidence is missing']);
    }
    if (!request.shippingRate || request.shippingRate.status === 'missing') {
        return result(ROUTES.EVIDENCE, null, ['an absent paid shipping rate must not default to zero']);
    }
    if (request.shippingRate.status === 'free' || request.shippingRate.amountCents === 0) {
        return result(ROUTES.BLOCKED, false, ['free shipping is not an approved shipped-order option']);
    }
    if (request.shippingRate.status !== 'approved_paid'
        || !Number.isInteger(request.shippingRate.amountCents)
        || request.shippingRate.amountCents <= 0) {
        return result(ROUTES.BLOCKED, false, ['shipping rate is not an approved positive paid rate']);
    }
    return result(ROUTES.ORDINARY_SHIPPING, true, ['ordinary shipment has an approved paid rate and service']);
}

function normalizeQuoteScope(scenario) {
    const items = (scenario?.cart?.items || []).map((item) => ({
        id: item.id,
        kind: item.kind,
        quantity: item.quantity,
    })).sort((left, right) => left.id.localeCompare(right.id));
    const request = scenario?.request || {};
    return {
        cart: items,
        destination: {
            countryCode: request.destination?.countryCode || null,
            subdivisionCode: request.destination?.subdivisionCode || null,
        },
        deliveryRequirements: {
            designation: request.deliveryRequirements?.designation || null,
            liftgateRequired: request.deliveryRequirements?.liftgateRequired ?? null,
            accessInformation: request.deliveryRequirements?.accessInformation || null,
        },
        insuranceSelection: request.insuranceSelection || 'declined',
    };
}

function quoteScopeKey(scope) {
    return JSON.stringify(scope);
}

function assessQuotation(scenario, quotation, { now = '2026-10-23T12:00:00.000Z', policy } = {}) {
    const fulfillment = assessFulfillment(scenario, policy);
    const reasons = [...fulfillment.reasons];
    let canInvoice = true;
    if (fulfillment.route !== ROUTES.QUOTATION) {
        return { ...fulfillment, canInvoice: false, quotationStatus: 'not_required_for_route' };
    }
    if (!quotation || quotation.status !== 'operations_approved') {
        canInvoice = false;
        reasons.push('operations approval is required before invoicing');
    }
    if (quotation?.approvedBy?.role !== 'warehouse_or_shipping_operations') {
        canInvoice = false;
        reasons.push('quotation approver must be warehouse or shipping operations');
    }
    if (!quotation?.scope || quoteScopeKey(quotation.scope) !== quoteScopeKey(normalizeQuoteScope(scenario))) {
        canInvoice = false;
        reasons.push('quotation scope does not match the current cart, destination, delivery requirements, and insurance selection');
    }
    if (!quotation?.expiresAt || Date.parse(quotation.expiresAt) <= Date.parse(now)) {
        canInvoice = false;
        reasons.push('quotation is expired or has no valid operations-defined expiration');
    }
    if (NON_CONTIGUOUS_STATES.has(scenario.request.destination.subdivisionCode)
        && (quotation?.destinationApproval?.rateApproved !== true
            || quotation?.destinationApproval?.serviceAvailabilityConfirmed !== true)) {
        canInvoice = false;
        reasons.push('Alaska or Hawaii requires an approved rate and confirmed service availability');
    }
    if (scenario.request.insuranceSelection === 'selected') {
        const insurance = quotation?.insurance;
        if (insurance?.availabilityDocumented !== true
            || insurance?.costDocumented !== true
            || !Number.isInteger(insurance?.amountCents)
            || insurance.amountCents < 0
            || insurance?.customerAccepted !== true) {
            canInvoice = false;
            reasons.push('selected insurance requires documented availability and cost plus customer acceptance');
        }
    }
    return {
        ...fulfillment,
        paymentAuthorized: canInvoice,
        canInvoice,
        quotationStatus: canInvoice ? 'approved_for_invoice' : 'renewal_or_evidence_required',
        reasons,
    };
}

const NUMERIC_DELIVERY_ESTIMATE = /\b\d+(?:\s*[-–]\s*\d+)?\s*(?:business\s*)?(?:hours?|days?|weeks?)\b/i;

function validateContentClaims(claims, policy = readJson('data/epic-k-fulfillment-policy.json')) {
    const errors = [];
    for (const claim of claims || []) {
        if (claim.claimType === 'delivery_estimate'
            && NUMERIC_DELIVERY_ESTIMATE.test(claim.text || '')
            && claim.authority?.status !== 'approved_operations') {
            errors.push(`${claim.id}: numeric delivery estimate requires operations approval`);
        }
        if (claim.claimType === 'carrier_claims') {
            if (claim.rhinoNotificationRequired !== true) {
                errors.push(`${claim.id}: carrier claims instructions must require Rhino notification`);
            }
            if (!claim.designatedContactProcess || !String(claim.designatedContactProcess).trim()) {
                errors.push(`${claim.id}: carrier claims instructions require a designated contact process`);
            }
        }
        if (claim.uninsuredRemediesEliminated === true) {
            errors.push(`${claim.id}: policy cannot categorically eliminate all remedies when insurance is not purchased`);
        }
        if (claim.claimType !== 'delivery_estimate'
            && !policy.contentGovernance.unrelatedNumberCategories.includes(claim.claimType)
            && NUMERIC_DELIVERY_ESTIMATE.test(claim.text || '')) {
            errors.push(`${claim.id}: numeric time statement has no governed content category`);
        }
    }
    return errors;
}

module.exports = {
    REQUIRED_DECISION_IDS,
    REQUIRED_EVIDENCE_CATEGORIES,
    ROUTES,
    US_STATES,
    assessFulfillment,
    assessQuotation,
    clone,
    normalizeQuoteScope,
    readJson,
    validateContentClaims,
    validateContracts,
};
