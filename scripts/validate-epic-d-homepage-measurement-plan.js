'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = path.resolve(__dirname, '..');
const PLAN_PATH = path.join(ROOT, 'data', 'epic-d-homepage-measurement-plan.json');
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'epic-d-homepage-measurement-plan.schema.json');
const OUTCOMES_PATH = path.join(ROOT, 'data', 'homepage-section-outcomes.json');
const ANALYTICS_PLAN_PATH = path.join(ROOT, 'docs', 'analytics', 'analytics-migration-verification-plan.md');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validateHomepageMeasurementPlan(plan, options = {}) {
    const schema = options.schema || readJson(SCHEMA_PATH);
    const outcomes = options.outcomes || readJson(OUTCOMES_PATH);
    const analyticsPlanText = options.analyticsPlanText
        || fs.readFileSync(ANALYTICS_PLAN_PATH, 'utf8');
    const errors = [];
    const ajv = new Ajv2020({
        allErrors: true,
        strict: false,
    });
    const validate = ajv.compile(schema);

    if (!validate(plan)) {
        for (const error of validate.errors || []) {
            errors.push(`schema${error.instancePath}: ${error.message}`);
        }
    }

    if (plan.customTrackingImplementationAllowed !== false) {
        errors.push('customTrackingImplementationAllowed must remain false.');
    }

    if (!/duplicate/i.test(analyticsPlanText) || !/purchase tracking/i.test(analyticsPlanText)) {
        errors.push('Analytics migration plan duplicate ecommerce tracking rule could not be confirmed.');
    }

    const moduleIds = new Set((outcomes.modules || []).map((module) => module.id));
    const measureIds = new Set();
    const proposedEvents = new Set();

    for (const measure of plan.measures || []) {
        if (measureIds.has(measure.id)) {
            errors.push(`Duplicate homepage measurement id ${measure.id}.`);
        }

        measureIds.add(measure.id);

        if (!moduleIds.has(measure.homepageModuleId)) {
            errors.push(`${measure.id}: unknown homepage module ${measure.homepageModuleId}.`);
        }

        if (/^TBD$/i.test(measure.eventOwner.trim()) || /^TBD$/i.test(measure.businessProductOwner.trim())) {
            errors.push(`${measure.id}: owners cannot be TBD.`);
        }

        if (measure.customEventRequired) {
            errors.push(`${measure.id}: customEventRequired must remain false until a later approved analytics implementation PBI.`);
        }

        if (measure.proposedEventName) {
            if (proposedEvents.has(measure.proposedEventName)) {
                errors.push(`${measure.id}: duplicate proposed event ${measure.proposedEventName}.`);
            }

            proposedEvents.add(measure.proposedEventName);

            if (measure.implementationStatus === 'native_available_no_code') {
                errors.push(`${measure.id}: native-only implementation cannot define a proposed event name.`);
            }

            if (!/approval|proposal|no code|no tracking/i.test(`${measure.eventOwner} ${measure.privacyConsentImplications} ${measure.implementationStatus}`)) {
                errors.push(`${measure.id}: proposed custom event must state approval/no-code dependency.`);
            }
        }

        if (!measure.proposedEventName && measure.implementationStatus === 'proposal_only_no_code') {
            errors.push(`${measure.id}: proposal_only_no_code measures should name the proposed event or use native_available_no_code.`);
        }

        if (
            measure.eventualSuccessThresholdStatus === 'baseline_required'
            && !/28 days|four weeks|baseline/i.test(measure.baselinePeriod)
        ) {
            errors.push(`${measure.id}: baseline_required measure needs a concrete baseline period.`);
        }

        if (
            /purchase|checkout|add[- ]?to[- ]?cart|product view/i.test(measure.proposedEventName || '')
            || /purchase event|checkout event|add-to-cart event|product view event/i.test(measure.notes || '')
        ) {
            errors.push(`${measure.id}: homepage measurement plan must not introduce duplicate ecommerce tracking.`);
        }
    }

    for (const requiredMeasure of [
        'hero-cta-clicks',
        'customer-path-clicks',
        'machine-family-entry',
        'parts-entry',
        'consumables-entry',
        'support-contact-entry',
        'education-video-engagement',
        'newsletter-inquiry-starts',
        'homepage-to-product-continuation',
    ]) {
        if (!measureIds.has(requiredMeasure)) {
            errors.push(`Missing required homepage measure ${requiredMeasure}.`);
        }
    }

    return errors;
}

function main() {
    const plan = readJson(PLAN_PATH);
    const errors = validateHomepageMeasurementPlan(plan);

    if (errors.length > 0) {
        console.error('Epic D homepage measurement plan validation failed.');

        for (const error of errors) {
            console.error(`- ${error}`);
        }

        process.exit(1);
        return;
    }

    console.log(
        `Epic D homepage measurement plan valid: ${plan.measures.length} measures, no tracking implementation authorized.`,
    );
}

if (require.main === module) {
    main();
}

module.exports = {
    validateHomepageMeasurementPlan,
};
