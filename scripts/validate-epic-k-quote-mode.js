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
    layout: 'layout/theme.liquid',
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
    if (pickupEvidence?.state === 'PASS' || locationEvidence?.state === 'PASS') {
        errors.push('K1C activation must not promote K-EVID-001 or K-EVID-002 receipts.');
    }

    const eligibility = source(paths.eligibility);
    const exclusionTokens = eligibility.split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => /^\|(variant:[0-9]+|product:[a-z0-9-]+)\|$/.test(line))
        .map((line) => line.slice(1, -1));
    const governedTokens = [
        ...config.pickup.excludedVariantIds.map((id) => `variant:${id}`),
        ...config.pickup.excludedProductHandles.map((handle) => `product:${handle}`),
    ];
    if (JSON.stringify(exclusionTokens.sort()) !== JSON.stringify(governedTokens.sort())) {
        errors.push('Liquid pickup exclusion registry does not match the governed quote-mode contract.');
    }

    const checkout = source(paths.checkout);
    for (const signal of [
        "form 'contact'", 'contact[quotation_reference]', 'contact[cart_signature]', 'contact[email]',
        'contact[address_line_1]', 'contact[state]', 'contact[postal_code]', 'contact[delivery_type]',
        'contact[liftgate_required]', 'contact[access_information]', 'item.variant.id', 'item.quantity',
        'variant_exclusion_token', 'product_exclusion_token', 'data-pickup-variants',
        'data-pickup-location="1411 6th Ave"', 'name="checkout" form="cart"',
        'data-rhino-fulfillment-choice', 'id="RhinoShippingQuotePanel"',
        'data-has-errors=', 'data-string-captcha-failed=', 'aria-atomic="true"',
    ]) {
        if (!checkout.includes(signal)) errors.push(`Quote checkout is missing required signal: ${signal}`);
    }
    if (!checkout.includes('Shipping charge: pending') || !checkout.includes('Invoice authorization: none')) {
        errors.push('Staff payload must explicitly keep shipping charge and invoice authorization pending.');
    }
    if (/free shipping|shipping charge:\s*\$?0/i.test(checkout)) errors.push('Quote checkout cannot promise free shipping.');

    const footer = source(paths.footer);
    if (!footer.includes("render 'rhino-quote-checkout'")) errors.push('Main cart footer must render the quote-mode decision surface.');
    if (!footer.includes('cart__footer--quote-mode') || !footer.includes('cart__blocks--quote-mode')) {
        errors.push('Main cart footer must expose the full-width quote-mode layout hooks.');
    }
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
    for (const signal of [
        'sessionStorage', "status: 'pending'", "status: 'submitted'", 'submit.disabled = true',
        'variants/${variantId}/?section_id=pickup-availability', '.pickup-availability-list__item h3',
        'results.every(Boolean)', "window.addEventListener('error'", 'submissionTimeoutMs = 30000',
        'hasVisibleCaptchaChallenge', 'failSubmission', 'removeMatchingPending',
    ]) {
        if (!javascript.includes(signal)) errors.push(`Duplicate submission protection is missing: ${signal}`);
    }
    if (/fetch\([^\n]*contact|XMLHttpRequest|Shopify\.captcha\.protect/.test(javascript)) {
        errors.push('Quotation recovery cannot replace or rewire Shopify native contact/CAPTCHA submission.');
    }
    if (!javascript.includes('setupFulfillmentChoices') || !javascript.includes("formRegion.hidden = selected !== 'shipping'")) {
        errors.push('Fulfillment choices must reveal the separate shipping form without resetting its fields.');
    }
    const stylesheet = source(paths.stylesheet);
    for (const signal of ['cart__footer--quote-mode', 'rhino-quote-mode__form-region', 'minmax(min(100%, 32rem), 1fr)', 'rhino-quote-mode__status--error']) {
        if (!stylesheet.includes(signal)) errors.push(`Responsive quote layout is missing required signal: ${signal}`);
    }
    if (stylesheet.includes('minmax(0, 2fr) minmax(28rem, 1fr)')) {
        errors.push('Quote choices cannot restore the fixed 28rem pickup column that compressed the shipping route.');
    }
    if (/X-Shopify-Access-Token|shpat_|gid:\/\/shopify\/Customer|Authorization:\s*Bearer/i.test(Object.values(paths).map(source).join('\n'))) {
        errors.push('Credential-bearing or customer-resource data is prohibited in quote-mode files.');
    }
    const layout = source(paths.layout);
    if (!/<head[\s>][\s\S]*{{\s*content_for_header\s*}}[\s\S]*<\/head>/i.test(layout)) {
        errors.push('theme.liquid must preserve the unmodified content_for_header output inside head for Shopify CAPTCHA.');
    }
    if (config.authority.liveCheckoutEnforcementVerified) {
        errors.push('The contract cannot claim live checkout enforcement before post-activation verification.');
    }

    const english = readJson('locales/en.default.json');
    const quoteMode = english?.sections?.cart?.quote_mode;
    const requiredEnglishKeys = [
        'heading', 'intro', 'shipping_heading', 'shipping_explanation', 'pickup_heading',
        'pickup_time', 'pickup_checking', 'pickup_available', 'pickup_blocked', 'pickup_checkout', 'pickup_unavailable',
        'submit_quote', 'success_heading', 'success_body_html', 'review_delivery_options',
        'captcha_failed', 'submission_failed', 'challenge_waiting',
    ];
    for (const key of requiredEnglishKeys) {
        if (typeof quoteMode?.[key] !== 'string' || !quoteMode[key].trim()) errors.push(`Published English quote-mode key is missing: ${key}`);
    }
    if (JSON.stringify(config.storefront.publishedLocaleScope) !== JSON.stringify(['en'])) {
        errors.push('The release locale scope must match the verified published English locale.');
    }

    return { errors, config, evidenceReport: evidence.report, exclusionTokens };
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
    console.log(`Explicit pickup exclusions: ${result.exclusionTokens.length}; K-EVID-001 and K-EVID-002 remain BLOCKED.`);
    console.log('Published locale scope: en; untranslated unpublished locale catalogs remain warnings.');
    console.log('Shipping route: complete-cart quotation; invoice authorization: false; live checkout enforcement: UNVERIFIED.');
}

if (require.main === module) main();

module.exports = { paths, validateQuoteMode };
