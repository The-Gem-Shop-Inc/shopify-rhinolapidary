'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const REGISTER_PATH = path.join(
    ROOT,
    'data',
    'brand-content-migration-register.json',
);
const CLAIMS_REGISTER_PATH = path.join(
    ROOT,
    'data',
    'legal-claims-register.json',
);

const DECISIONS = new Set([
    'reuse',
    'rewrite',
    'leave_and_summarize',
    'reference_only',
    'retire',
    'blocked',
]);

const STATUSES = new Set([
    'needs_review',
    'approved',
    'blocked',
    'completed',
]);

const VERIFICATION = new Set([
    'required',
    'approved',
    'blocked',
    'not_applicable',
]);

const RIGHTS = new Set([
    'owned',
    'licensed',
    'owned_or_controlled_needs_confirmation',
    'reuse_permission_required',
    'prohibited',
    'unknown',
]);

function fail(message) {
    console.error(message);
    process.exitCode = 1;
}

function nonEmptyString(value) {
    return (
        typeof value === 'string'
        && value.trim().length > 0
    );
}

function main() {
    const register = JSON.parse(
        fs.readFileSync(REGISTER_PATH, 'utf8'),
    );
    const claimsRegister = JSON.parse(
        fs.readFileSync(CLAIMS_REGISTER_PATH, 'utf8'),
    );

    const violations = [];
    const ids = new Set();
    const sourceKeys = new Set();
    const legalClaimIds = new Set(
        (claimsRegister.claims || []).map((claim) => claim.id),
    );

    if (register.schemaVersion !== 1) {
        violations.push('schemaVersion must equal 1.');
    }

    if (!Array.isArray(register.entries)) {
        violations.push('entries must be an array.');
    }

    for (const [index, entry] of (
        register.entries || []
    ).entries()) {
        const label = entry.id || `entry ${index + 1}`;

        for (const field of [
            'id',
            'sourceSystem',
            'sourceType',
            'sourceUrl',
            'destinationType',
            'decision',
            'status',
            'canonicalOwner',
            'rightsStatus',
            'technicalVerification',
            'legalVerification',
            'mediaReview',
            'owner',
            'notes',
        ]) {
            if (!nonEmptyString(entry[field])) {
                violations.push(
                    `${label}: ${field} is required.`,
                );
            }
        }

        if (ids.has(entry.id)) {
            violations.push(
                `${label}: duplicate ID.`,
            );
        }

        ids.add(entry.id);

        const sourceKey = `${entry.sourceSystem}|${entry.sourceUrl}`;

        if (sourceKeys.has(sourceKey)) {
            violations.push(
                `${label}: duplicate source system and URL.`,
            );
        }

        sourceKeys.add(sourceKey);

        if (!DECISIONS.has(entry.decision)) {
            violations.push(
                `${label}: unsupported decision "${entry.decision}".`,
            );
        }

        if (!STATUSES.has(entry.status)) {
            violations.push(
                `${label}: unsupported status "${entry.status}".`,
            );
        }

        if (!RIGHTS.has(entry.rightsStatus)) {
            violations.push(
                `${label}: unsupported rightsStatus "${entry.rightsStatus}".`,
            );
        }

        for (const field of [
            'technicalVerification',
            'legalVerification',
            'mediaReview',
        ]) {
            if (!VERIFICATION.has(entry[field])) {
                violations.push(
                    `${label}: unsupported ${field} "${entry[field]}".`,
                );
            }
        }

        if (typeof entry.redirectRequired !== 'boolean') {
            violations.push(
                `${label}: redirectRequired must be boolean.`,
            );
        }

        if (!Array.isArray(entry.claims)) {
            violations.push(
                `${label}: claims must be an array.`,
            );
        } else {
            for (const claimId of entry.claims) {
                if (!legalClaimIds.has(claimId)) {
                    violations.push(
                        `${label}: unknown legal claim ID "${claimId}".`,
                    );
                }
            }
        }

        if (
            ['approved', 'completed'].includes(entry.status)
        ) {
            if (
                ['unknown', 'prohibited', 'reuse_permission_required']
                    .includes(entry.rightsStatus)
            ) {
                violations.push(
                    `${label}: approved migration lacks usable rights.`,
                );
            }

            for (const field of [
                'technicalVerification',
                'legalVerification',
                'mediaReview',
            ]) {
                if (
                    !['approved', 'not_applicable'].includes(entry[field])
                ) {
                    violations.push(
                        `${label}: approved migration has unresolved ${field}.`,
                    );
                }
            }

            if (
                ['reuse', 'rewrite'].includes(entry.decision)
                && !nonEmptyString(entry.destinationPath)
            ) {
                violations.push(
                    `${label}: approved destinationPath is required.`,
                );
            }

            if (
                entry.canonicalOwner === 'unresolved'
            ) {
                violations.push(
                    `${label}: canonical owner is unresolved.`,
                );
            }
        }

        if (
            entry.decision === 'retire'
            && entry.redirectRequired !== true
        ) {
            violations.push(
                `${label}: retired content must explicitly require a redirect or document why not.`,
            );
        }
    }

    if (violations.length > 0) {
        fail(
            `Brand content migration validation failed:\n- ${
                violations.join('\n- ')
            }`,
        );
        return;
    }

    console.log(
        `Brand content migration register valid: ${register.entries.length} entries.`,
    );
}

main();
