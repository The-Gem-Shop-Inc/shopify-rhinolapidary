'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const {
    readRegister,
    validateSourceText,
} = require('./validate-brand-claims');

const ROOT = path.resolve(__dirname, '..');
const MAP_PATH = path.join(ROOT, 'data', 'homepage-content-claims-map.json');
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'homepage-content-claims-map.schema.json');
const OUTCOMES_PATH = path.join(ROOT, 'data', 'homepage-section-outcomes.json');

function readJson(filePath) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function validateHomepageContentClaimsMap(options = {}) {
    const map = options.map || readJson(MAP_PATH);
    const schema = options.schema || readJson(SCHEMA_PATH);
    const outcomes = options.outcomes || readJson(OUTCOMES_PATH);
    const legalClaims = options.legalClaims || readRegister();
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    const validate = ajv.compile(schema);
    const errors = [];

    if (!validate(map)) {
        for (const error of validate.errors || []) {
            errors.push(`schema${error.instancePath}: ${error.message}`);
        }
    }

    const ids = new Set();
    const moduleIds = new Set((outcomes.modules || []).map((module) => module.id));
    const claimStatuses = new Map(
        (legalClaims.claims || []).map((claim) => [claim.id, claim.status]),
    );

    for (const item of map.contentItems || []) {
        if (ids.has(item.id)) {
            errors.push(`Duplicate homepage content item id: ${item.id}`);
        }

        ids.add(item.id);

        if (!moduleIds.has(item.moduleId)) {
            errors.push(`${item.id}: unknown homepage module ${item.moduleId}.`);
        }

        for (const claimId of item.legalClaimIds || []) {
            if (!claimStatuses.has(claimId)) {
                errors.push(`${item.id}: unknown legal claim ID ${claimId}.`);
            }
        }

        if (['blocked', 'unknown'].includes(item.approvalStatus) && !item.blocker.trim()) {
            errors.push(`${item.id}: blocked or unknown content requires a blocker.`);
        }

        if (item.approvalStatus === 'approved') {
            for (const field of ['sourceOwner', 'approver', 'source']) {
                if (!item[field].trim()) {
                    errors.push(`${item.id}: approved content requires ${field}.`);
                }
            }

            for (const claimId of item.legalClaimIds || []) {
                const status = claimStatuses.get(claimId);

                if (!['approved', 'approved_plain_use'].includes(status)) {
                    errors.push(`${item.id}: approved content references unresolved claim ${claimId}.`);
                }
            }
        }

        if (item.safeNeutralFallback) {
            errors.push(
                ...validateSourceText(
                    `data/homepage-content-claims-map.json#${item.id}.safeNeutralFallback`,
                    item.safeNeutralFallback,
                    legalClaims,
                ),
            );
        }
    }

    return {
        errors,
        itemCount: (map.contentItems || []).length,
    };
}

function main() {
    const result = validateHomepageContentClaimsMap();

    if (result.errors.length > 0) {
        console.error('Homepage content claims map validation failed.');

        for (const error of result.errors) {
            console.error(`- ${error}`);
        }

        process.exit(1);
        return;
    }

    console.log(`Homepage content claims map validation passed for ${result.itemCount} content items.`);
}

if (require.main === module) {
    main();
}

module.exports = {
    validateHomepageContentClaimsMap,
};
