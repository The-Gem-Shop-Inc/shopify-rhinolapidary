'use strict';

const US_STATE_CODES = new Set([
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]);

function normalizedItems(cart) {
    return Array.isArray(cart?.items) ? cart.items : [];
}

function validLine(item) {
    return typeof item?.variantId === 'string'
        && /^[0-9]+$/.test(item.variantId)
        && Number.isInteger(item.quantity)
        && item.quantity > 0;
}

function assessCart(cart) {
    const items = normalizedItems(cart);
    const complete = items.length > 0 && items.every(validLine);
    const pickupEligible = complete && items.every((item) => item.pickupEligibility === 'approved');
    const graftonAvailable = complete && items.every((item) => item.graftonPickup?.enabled === true && item.graftonPickup?.available === true);
    return {
        itemCount: items.reduce((count, item) => count + (Number.isInteger(item.quantity) ? item.quantity : 0), 0),
        completeCartValid: complete,
        quotationRequestAllowed: complete,
        quotationScope: complete ? 'complete_cart' : 'none',
        pickupCheckoutAllowed: pickupEligible && graftonAvailable,
        pickupEligibility: pickupEligible ? 'approved_for_every_item' : 'blocked',
        graftonAvailability: graftonAvailable ? 'available_for_every_item' : 'blocked',
        liveCheckoutEnforcement: 'UNVERIFIED',
    };
}

function text(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function validateQuoteRequest(request, cart) {
    const errors = [];
    const assessment = assessCart(cart);
    if (!assessment.quotationRequestAllowed) errors.push('A nonempty cart with valid Variant identities and positive integer quantities is required.');
    for (const field of ['name', 'email', 'address1', 'city', 'postalCode', 'accessInformation']) {
        if (!text(request?.[field])) errors.push(`${field} is required.`);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text(request?.email))) errors.push('email is invalid.');
    if (request?.country !== 'US') errors.push('Only United States quotation intake is supported.');
    if (!US_STATE_CODES.has(request?.state)) errors.push('state must identify one of the 50 United States.');
    if (!['residential', 'commercial'].includes(request?.deliveryType)) errors.push('deliveryType must be residential or commercial.');
    if (typeof request?.liftgateRequired !== 'boolean') errors.push('liftgateRequired must be explicitly true or false.');
    if (request?.shippingCharge !== undefined) errors.push('A customer quotation request cannot set a shipping charge.');
    if (request?.invoiceAuthorized === true) errors.push('A customer quotation request cannot authorize an invoice.');
    return { valid: errors.length === 0, errors, assessment };
}

function cartSignature(cart) {
    return normalizedItems(cart)
        .map((item) => `${item.variantId}:${item.quantity}`)
        .sort()
        .join('|');
}

function buildStaffPayload(request, cart, reference) {
    const validation = validateQuoteRequest(request, cart);
    if (!validation.valid) throw new Error(validation.errors.join(' '));
    return {
        reference,
        customer: {
            name: text(request.name),
            email: text(request.email),
            phone: text(request.phone) || null,
        },
        destination: {
            address1: text(request.address1),
            address2: text(request.address2) || null,
            city: text(request.city),
            state: request.state,
            postalCode: text(request.postalCode),
            country: 'US',
        },
        delivery: {
            type: request.deliveryType,
            liftgateRequired: request.liftgateRequired,
            accessInformation: text(request.accessInformation),
            insuranceOptionsRequested: request.insuranceOptionsRequested === true,
        },
        items: normalizedItems(cart).map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
        cartSignature: cartSignature(cart),
        shippingCharge: null,
        invoiceAuthorized: false,
        staffAction: 'validate_products_package_carrier_charge_then_create_shopify_draft_order',
    };
}

function duplicateSubmissionState(previous, signature) {
    if (!previous || previous.cartSignature !== signature) return 'NEW';
    if (previous.status === 'submitted') return 'DUPLICATE_BLOCKED';
    return 'RETRY_ALLOWED';
}

module.exports = {
    US_STATE_CODES,
    assessCart,
    buildStaffPayload,
    cartSignature,
    duplicateSubmissionState,
    validateQuoteRequest,
};
