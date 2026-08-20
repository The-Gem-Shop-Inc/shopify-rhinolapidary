'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = path.resolve(__dirname, '..');
const REGISTER_PATH = path.join(ROOT, 'data', 'footer-support-resources.json');
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'footer-support-resources.schema.json');
const CLAIMS_PATH = path.join(ROOT, 'data', 'legal-claims-register.json');
const NAVIGATION_IA_PATH = path.join(ROOT, 'data', 'global-navigation-ia.json');

const BLOCKING_APPROVAL_STATUSES = new Set([
    'needs_review',
    'needs_content',
    'needs_legal',
    'needs_technical_review',
    'blocked',
]);

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function collectNavigationItemIds(items = [], ids = new Set()) {
    for (const item of items) {
        ids.add(item.id);
        collectNavigationItemIds(item.items || [], ids);
    }

    return ids;
}

function validDestination(value) {
    return (
        typeof value === 'string'
        && (
            value.startsWith('/')
            || /^https?:\/\//i.test(value)
        )
    );
}

function validateFooterSupportResources(register) {
    const errors = [];
    const ids = new Set();
    const claimIds = new Set(readJson(CLAIMS_PATH).claims.map((claim) => claim.id));
    const navigation = readJson(NAVIGATION_IA_PATH);
    const navigationItemIds = navigation.menus.reduce((all, menu) => (
        collectNavigationItemIds(menu.items, all)
    ), new Set());

    if (fs.existsSync(SCHEMA_PATH)) {
        const ajv = new Ajv2020({
            allErrors: true,
            strict: false,
        });
        const validate = ajv.compile(readJson(SCHEMA_PATH));

        if (!validate(register)) {
            for (const error of validate.errors || []) {
                errors.push(`schema ${error.instancePath || '/'} ${error.message}`);
            }
        }
    }

    for (const resource of register.resources || []) {
        const trace = resource.id || '(blank resource)';

        if (ids.has(resource.id)) {
            errors.push(`Duplicate support resource ID: ${resource.id}`);
        }

        ids.add(resource.id);

        if (resource.safeForGlobalNavigation && !validDestination(resource.intendedDestination)) {
            errors.push(`${trace}: safe global resource requires a concrete destination.`);
        }

        if (resource.safeForGlobalNavigation && resource.blockers.length > 0) {
            errors.push(`${trace}: safe global resource cannot have blockers.`);
        }

        if (
            resource.safeForGlobalNavigation
            && [
                resource.technicalApproval,
                resource.legalApproval,
                resource.contentApproval,
            ].some((status) => BLOCKING_APPROVAL_STATUSES.has(status))
        ) {
            errors.push(`${trace}: safe global resource has blocking approval status.`);
        }

        if (
            [
                'approved',
                'approved_current_limited',
            ].includes(resource.globalNavigationStatus)
            && resource.safeForGlobalNavigation !== true
        ) {
            errors.push(`${trace}: approved navigation status requires safeForGlobalNavigation true.`);
        }

        if (
            [
                'manual',
                'setup',
                'technical_download',
                'specification',
                'parts_help',
            ].includes(resource.category)
            && resource.safeForGlobalNavigation
            && resource.technicalApproval !== 'approved'
        ) {
            errors.push(`${trace}: technical support/download resources require technical approval.`);
        }

        for (const claimId of resource.claimIds || []) {
            if (!claimIds.has(claimId)) {
                errors.push(`${trace}: unknown legal claim ${claimId}.`);
            }
        }

        for (const itemId of resource.navigationItemIds || []) {
            if (!navigationItemIds.has(itemId)) {
                errors.push(`${trace}: unknown navigation item ${itemId}.`);
            }
        }
    }

    return errors;
}

function main() {
    const register = readJson(REGISTER_PATH);
    const errors = validateFooterSupportResources(register);

    if (errors.length > 0) {
        console.error('Footer support resource validation failed.');

        for (const error of errors) {
            console.error(`- ${error}`);
        }

        process.exit(1);
    }

    const safeCount = register.resources.filter((resource) => (
        resource.safeForGlobalNavigation
    )).length;

    console.log(
        `Footer support resources valid: ${register.resources.length} resources, `
        + `${safeCount} safe for global navigation.`,
    );
}

if (require.main === module) {
    main();
}

module.exports = {
    validateFooterSupportResources,
};
