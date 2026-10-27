'use strict';

const Ajv2020 = require('ajv/dist/2020');
const { readJson } = require('./lib/epic-k-policy');
const { validateQuoteMode } = require('./validate-epic-k-quote-mode');

const STATUS_PATH = 'data/epic-k-k1c02-activation-status-2026-10-27.json';
const SCHEMA_PATH = 'schemas/epic-k-k1c02-activation-status.schema.json';

function validateStatus(status = readJson(STATUS_PATH)) {
    const errors = [];
    const schema = readJson(SCHEMA_PATH);
    const ajv = new Ajv2020({ allErrors: true, strict: true });
    const validate = ajv.compile(schema);
    if (!validate(status)) errors.push(...validate.errors.map((entry) => `${entry.instancePath || '/'} ${entry.message}`));

    const quote = validateQuoteMode();
    errors.push(...quote.errors);
    const evidence = quote.evidenceReport.results;
    const locationReadiness = evidence.find((entry) => entry.id === 'K-EVID-002');
    if (locationReadiness?.state !== 'PASS' && status.activation?.operationalReadiness === 'PASS') {
        errors.push('Operational readiness cannot pass while K-EVID-002 is blocked.');
    }
    if (status.activation?.state === 'ACTIVE') {
        if (!status.verification?.contactSubmissionConfirmed) errors.push('Activation requires a confirmed quotation contact submission.');
        if (status.activation.liveCheckoutEnforcement !== 'PASS') errors.push('Activation requires a passing live checkout matrix.');
        if (!status.activation.productionThemePublished) errors.push('Activation requires the verified production theme release.');
        if (!status.audit.pickup.graftonActive || !status.audit.pickup.graftonPickupEnabled) {
            errors.push('Activation requires the live Grafton location and pickup service to be enabled.');
        }
        if (status.audit.pickup.activeVariantsWithPositiveGraftonInventory === 0) {
            errors.push('Activation requires at least one active Variant with positive live Grafton inventory.');
        }
    }
    if (!status.activation?.productionThemePublished && status.activation?.shippingRatesRemoved?.length) {
        errors.push('Shipping rates cannot be removed before the quotation storefront is published.');
    }
    if (status.verification?.draftInvoice?.invoiceSent || status.verification?.draftInvoice?.paymentProcessed) {
        errors.push('The controlled draft verification must not send an invoice or process payment.');
    }
    if (!status.verification?.draftInvoice?.draftDeleted || !status.verification?.draftInvoice?.testCustomerDeleted) {
        errors.push('Controlled QA objects must be removed after a blocked activation.');
    }
    return errors;
}

function main() {
    const errors = validateStatus();
    if (errors.length) {
        console.error('Epic K1C-02 activation status validation failed.');
        for (const error of errors) console.error(`- ${error}`);
        process.exitCode = 1;
        return;
    }
    console.log(`Epic K1C-02 activation status: valid ${resultState()}.`);
}

function resultState() { return readJson(STATUS_PATH).activation.state; }

if (require.main === module) main();

module.exports = { STATUS_PATH, SCHEMA_PATH, validateStatus };
