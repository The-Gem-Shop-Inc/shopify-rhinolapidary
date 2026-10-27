'use strict';

const fs = require('node:fs');
const Ajv2020 = require('ajv/dist/2020');
const { readJson } = require('./lib/epic-k-policy');
const { verifyEvidence } = require('./lib/epic-k-evidence-drift');

const paths = {
    config: 'data/epic-k-temporary-quote-mode.json',
    schema: 'schemas/epic-k-temporary-quote-mode.schema.json',
    eligibility: 'snippets/rhino-quote-pickup-eligibility.liquid',
    checkout: 'snippets/rhino-quote-checkout.liquid',
    footer: 'sections/main-cart-footer.liquid',
    drawer: 'snippets/cart-drawer.liquid',
    notification: 'snippets/cart-notification.liquid',
    buyButtons: 'snippets/buy-buttons.liquid',
    quickOrder: 'snippets/quick-order-list.liquid',
    javascript: 'assets/rhino-quote-mode.js',
    stylesheet: 'assets/rhino-quote-mode.css',
};

function source(file) {
    return fs.readFileSync(file, 'utf8');
}

function validateQuoteMode() {
    const errors = [];
    const config = readJson(paths.config);
    const schema = readJson(paths.schema);
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    const valid = ajv.compile(schema)(config);
    if (!valid) errors.push(...ajv.errors.map((entry) => `${entry.instancePath || '/'} ${entry.message}`));

    const requirements = readJson('data/epic-k-operational-evidence-requirements.json');
    const receipts = readJson('data/epic-k-evidence-receipts.json');
    const evidence = verifyEvidence(receipts, requirements, { asOf: '2026-10-27T18:00:00.000Z' });
    errors.push(...evidence.errors);
    const pickupEvidence = evidence.report?.results.find((entry) => entry.id === 'K-EVID-001');
    const locationEvidence = evidence.report?.results.find((entry) => entry.id === 'K-EVID-002');
    if (pickupEvidence?.state !== 'PASS' && config.pickup.approvedVariantIds.length !== 0) {
        errors.push('Pickup Variant IDs require accepted K-EVID-001 evidence.');
    }
    if (locationEvidence?.state !== 'PASS' && config.pickup.currentReadiness !== 'blocked_missing_authoritative_receipts') {
        errors.push('Grafton readiness must remain blocked until K-EVID-002 passes.');
    }

    const eligibility = source(paths.eligibility);
    const registryIds = [...eligibility.matchAll(/\|([0-9]+)\|/g)].map((match) => match[1]);
    if (JSON.stringify(registryIds.sort()) !== JSON.stringify([...config.pickup.approvedVariantIds].sort())) {
        errors.push('Liquid pickup eligibility registry does not match the governed quote-mode contract.');
    }

    const checkout = source(paths.checkout);
    for (const signal of [
        "form 'contact'", 'contact[quotation_reference]', 'contact[cart_signature]', 'contact[email]',
        'contact[address_line_1]', 'contact[state]', 'contact[postal_code]', 'contact[delivery_type]',
        'contact[liftgate_required]', 'contact[access_information]', 'item.variant.id', 'item.quantity',
        'item.variant.store_availabilities', 'store_availability.pick_up_enabled', 'store_availability.available',
        "pickup_location_name contains 'grafton'", 'name="checkout" form="cart"',
    ]) {
        if (!checkout.includes(signal)) errors.push(`Quote checkout is missing required signal: ${signal}`);
    }
    if (!checkout.includes('Shipping charge: pending') || !checkout.includes('Invoice authorization: none')) {
        errors.push('Staff payload must explicitly keep shipping charge and invoice authorization pending.');
    }
    if (/free shipping|shipping charge:\s*\$?0/i.test(checkout)) errors.push('Quote checkout cannot promise free shipping.');

    const footer = source(paths.footer);
    if (!footer.includes("render 'rhino-quote-checkout'")) errors.push('Main cart footer must render the quote-mode decision surface.');
    if (footer.includes('content_for_additional_checkout_buttons')) errors.push('Cart accelerated checkout buttons must be suppressed.');
    if (footer.includes("'sections.cart.checkout' | t")) errors.push('Main cart cannot expose unconditional ordinary checkout.');

    const drawer = source(paths.drawer);
    const notification = source(paths.notification);
    if (/name=["']checkout["']/.test(drawer)) errors.push('Cart drawer cannot bypass the full-cart delivery choice.');
    if (/name=["']checkout["']/.test(notification)) errors.push('Cart notification cannot bypass the full-cart delivery choice.');
    if (!drawer.includes('sections.cart.quote_mode.review_delivery_options')) errors.push('Cart drawer must route to delivery choices.');
    if (!notification.includes('sections.cart.quote_mode.review_delivery_options')) errors.push('Cart notification must route to delivery choices.');

    const buyButtons = source(paths.buyButtons);
    if (/assign show_dynamic_checkout = true/.test(buyButtons)) errors.push('Product accelerated checkout must remain disabled during quote mode.');
    if (!buyButtons.includes('assign show_dynamic_checkout = false')) errors.push('Product accelerated checkout suppression is missing.');

    const quickOrder = source(paths.quickOrder);
    if (quickOrder.includes('shipping_at_checkout')) errors.push('Quick-order messaging cannot promise shipping calculation at checkout.');

    const javascript = source(paths.javascript);
    for (const signal of ['sessionStorage', "status: 'pending'", "status: 'submitted'", 'submit.disabled = true']) {
        if (!javascript.includes(signal)) errors.push(`Duplicate submission protection is missing: ${signal}`);
    }
    if (/X-Shopify-Access-Token|shpat_|gid:\/\/shopify\/Customer|Authorization:\s*Bearer/i.test(Object.values(paths).map(source).join('\n'))) {
        errors.push('Credential-bearing or customer-resource data is prohibited in quote-mode files.');
    }
    if (config.authority.liveCheckoutEnforcementVerified || config.authority.shopifyMutationAuthorized || config.authority.themePublicationAuthorized) {
        errors.push('Repository quote mode cannot claim live enforcement, Shopify mutation, or publication authority.');
    }

    return { errors, config, evidenceReport: evidence.report, registryIds };
}

function main() {
    const result = validateQuoteMode();
    if (result.errors.length) {
        console.error('Epic K temporary quote mode validation failed.');
        for (const error of result.errors) console.error(`- ${error}`);
        process.exitCode = 1;
        return;
    }
    console.log('Epic K temporary quote mode contracts and storefront integration: valid.');
    console.log(`Approved pickup Variant IDs: ${result.registryIds.length}; K-EVID-001 and K-EVID-002 remain BLOCKED.`);
    console.log('Shipping route: complete-cart quotation; invoice authorization: false; live checkout enforcement: UNVERIFIED.');
}

if (require.main === module) main();

module.exports = { paths, validateQuoteMode };
