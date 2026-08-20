'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = path.resolve(__dirname, '..');
const PLAN_PATH = path.join(ROOT, 'data', 'epic-c-navigation-measurement-plan.json');
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'epic-c-navigation-measurement-plan.schema.json');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validateMeasurementPlan(plan) {
    const errors = [];
    const ajv = new Ajv2020({
        allErrors: true,
        strict: false,
    });
    const validate = ajv.compile(readJson(SCHEMA_PATH));

    if (!validate(plan)) {
        for (const error of validate.errors || []) {
            errors.push(`schema ${error.instancePath || '/'} ${error.message}`);
        }
    }

    if (plan.customTrackingImplementationAllowed !== false) {
        errors.push('customTrackingImplementationAllowed must remain false for C-PBI-028.');
    }

    const sections = plan.sections || [];
    const sectionIds = new Set(sections.map((section) => section.id));

    for (const requiredSection of [
        'native-reporting',
        'existing-approved-analytics',
        'proposed-custom-tracking',
    ]) {
        if (!sectionIds.has(requiredSection)) {
            errors.push(`Missing measurement section ${requiredSection}.`);
        }
    }

    const measures = sections.flatMap((section) => (
        (section.measures || []).map((measure) => ({
            ...measure,
            sectionId: section.id,
            trackingClass: section.trackingClass,
        }))
    ));
    const measureIds = new Set();

    for (const measure of measures) {
        if (measureIds.has(measure.id)) {
            errors.push(`Duplicate measurement id ${measure.id}.`);
        }

        measureIds.add(measure.id);

        if (/^TBD$/i.test(measure.owner.trim())) {
            errors.push(`${measure.id}: owner cannot be TBD.`);
        }

        if (
            measure.nativeVsCustom === 'custom_event_requires_approval'
            && measure.implementationStatus !== 'proposed_requires_analytics_owner_approval'
        ) {
            errors.push(`${measure.id}: proposed custom tracking requires proposed implementation status.`);
        }

        if (
            measure.nativeVsCustom !== 'custom_event_requires_approval'
            && /^rhino:/i.test(measure.metricName)
        ) {
            errors.push(`${measure.id}: rhino custom event names are allowed only in proposed custom tracking.`);
        }

        if (
            measure.trackingClass === 'proposed_custom_tracking'
            && !/approval/i.test(`${measure.source} ${measure.privacyConsentImplications} ${measure.implementationStatus}`)
        ) {
            errors.push(`${measure.id}: proposed custom tracking must state approval dependency.`);
        }

        if (
            measure.thresholdOrBaseline.type === 'baseline_required'
            && !measure.thresholdOrBaseline.baselineCollectionPeriod
        ) {
            errors.push(`${measure.id}: baseline_required measures need a baselineCollectionPeriod.`);
        }

        if (
            measure.thresholdOrBaseline.type === 'baseline_required'
            && !measure.thresholdOrBaseline.decisionDate
        ) {
            errors.push(`${measure.id}: baseline_required measures need a decisionDate.`);
        }
    }

    for (const requiredMeasure of [
        'header-search-usage',
        'search-zero-result-rate',
        'primary-menu-interaction',
        'machine-navigation-outcomes',
        'parts-consumables-navigation-outcomes',
        'footer-support-clicks',
        'policy-visits',
        'mobile-drawer-usage',
        'support-contact-conversion',
        'mobile-navigation-outcomes',
    ]) {
        if (!measureIds.has(requiredMeasure)) {
            errors.push(`Missing required measure ${requiredMeasure}.`);
        }
    }

    return errors;
}

function main() {
    const plan = readJson(PLAN_PATH);
    const errors = validateMeasurementPlan(plan);

    if (errors.length > 0) {
        console.error('Epic C navigation measurement plan validation failed.');

        for (const error of errors) {
            console.error(`- ${error}`);
        }

        process.exit(1);
        return;
    }

    const count = plan.sections.reduce((sum, section) => (
        sum + section.measures.length
    ), 0);

    console.log(
        `Epic C navigation measurement plan valid: ${count} measures, no tracking implementation authorized.`,
    );
}

if (require.main === module) {
    main();
}

module.exports = {
    validateMeasurementPlan,
};
