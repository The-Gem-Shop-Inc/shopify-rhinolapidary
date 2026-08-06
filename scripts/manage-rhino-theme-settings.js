'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const PLAN_PATH = path.join(
    ROOT,
    'data',
    'rhino-launch-theme-settings.json',
);

const SCHEMA_PATH = path.join(
    ROOT,
    'config',
    'settings_schema.json',
);

const SETTINGS_PATH = path.join(
    ROOT,
    'config',
    'settings_data.json',
);

const OUTPUT_DIRECTORY = path.join(
    ROOT,
    'test-results',
    'rhino-theme-settings',
);

function fail(messages) {
    const list = Array.isArray(messages)
        ? messages
        : [messages];

    console.error(
        `Rhino theme settings validation failed:\n- ${list.join('\n- ')}`,
    );

    process.exitCode = 1;
}

function readJson(filePath) {
    try {
        return JSON.parse(
            fs.readFileSync(filePath, 'utf8'),
        );
    } catch (error) {
        throw new Error(
            `Could not read ${path.relative(ROOT, filePath)}: ${error.message}`,
        );
    }
}

function deepClone(value) {
    return JSON.parse(
        JSON.stringify(value),
    );
}

function deepEqual(left, right) {
    return JSON.stringify(left)
        === JSON.stringify(right);
}

function buildSchemaIndex(schema) {
    const index = new Map();

    for (const group of schema) {
        for (const setting of group.settings || []) {
            if (setting.id) {
                index.set(setting.id, setting);
            }
        }
    }

    return index;
}

function flattenPlannedChanges(plan) {
    const changes = new Map();
    const metadata = new Map();

    for (const group of plan.changeGroups || []) {
        for (
            const [id, value] of
            Object.entries(group.changes || {})
            ) {
            if (changes.has(id)) {
                throw new Error(
                    `Setting "${id}" appears in more than one change group.`,
                );
            }

            changes.set(id, value);

            metadata.set(id, {
                group: group.id,
                owner: group.owner,
                rationale: group.rationale,
                rollback: group.rollback,
            });
        }
    }

    return {
        changes,
        metadata,
    };
}

function isHexColor(value) {
    return (
        typeof value === 'string'
        && /^#[0-9a-f]{6}$/i.test(value)
    );
}

function validateRange(setting, value) {
    const violations = [];

    if (typeof value !== 'number') {
        return [
            `${setting.id} must be numeric.`,
        ];
    }

    if (
        typeof setting.min === 'number'
        && value < setting.min
    ) {
        violations.push(
            `${setting.id} is below its minimum of ${setting.min}.`,
        );
    }

    if (
        typeof setting.max === 'number'
        && value > setting.max
    ) {
        violations.push(
            `${setting.id} is above its maximum of ${setting.max}.`,
        );
    }

    if (
        typeof setting.step === 'number'
        && typeof setting.min === 'number'
    ) {
        const steps = (
            value - setting.min
        ) / setting.step;

        if (
            Math.abs(
                steps - Math.round(steps),
            ) > 1e-8
        ) {
            violations.push(
                `${setting.id} does not align to step ${setting.step}.`,
            );
        }
    }

    return violations;
}

function validateSettingValue(setting, value) {
    switch (setting.type) {
        case 'range':
            return validateRange(setting, value);

        case 'checkbox':
            return typeof value === 'boolean'
                ? []
                : [`${setting.id} must be boolean.`];

        case 'select': {
            const allowed = new Set(
                (setting.options || []).map(
                    (option) => option.value,
                ),
            );

            return allowed.has(value)
                ? []
                : [
                    `${setting.id} has unsupported value "${value}". `
                    + `Allowed values: ${[...allowed].join(', ')}.`,
                ];
        }

        case 'font_picker':
            return (
                typeof value === 'string'
                && value.trim() !== ''
            )
                ? []
                : [`${setting.id} must contain a font-picker handle.`];

        case 'color_scheme':
            return /^scheme-\d+$/.test(value)
                ? []
                : [`${setting.id} must reference a scheme-* ID.`];

        default:
            return [];
    }
}

function validatePlan(
    plan,
    schema,
) {
    const violations = [];
    const schemaIndex =
        buildSchemaIndex(schema);

    if (plan.schemaVersion !== 1) {
        violations.push(
            'Plan schemaVersion must equal 1.',
        );
    }

    if (
        !Array.isArray(plan.changeGroups)
        || plan.changeGroups.length === 0
    ) {
        violations.push(
            'changeGroups must contain at least one group.',
        );
    }

    const {
        changes,
        metadata,
    } = flattenPlannedChanges(plan);

    for (const [id, value] of changes) {
        const setting = schemaIndex.get(id);

        if (!setting) {
            violations.push(
                `Planned setting "${id}" does not exist in settings_schema.json.`,
            );

            continue;
        }

        violations.push(
            ...validateSettingValue(
                setting,
                value,
            ),
        );

        const record = metadata.get(id);

        for (const field of [
            'owner',
            'rationale',
            'rollback',
        ]) {
            if (
                typeof record[field] !== 'string'
                || record[field].trim() === ''
            ) {
                violations.push(
                    `${id} has no inherited ${field}.`,
                );
            }
        }
    }

    const manualIds = new Set();
    const deferredIds = new Set();

    for (const item of plan.manualSettings || []) {
        if (!schemaIndex.has(item.id)) {
            violations.push(
                `Manual setting "${item.id}" does not exist in settings_schema.json.`,
            );
        }

        if (changes.has(item.id)) {
            violations.push(
                `${item.id} cannot be both automatic and manual.`,
            );
        }

        manualIds.add(item.id);
    }

    for (const item of plan.deferredSettings || []) {
        if (!schemaIndex.has(item.id)) {
            violations.push(
                `Deferred setting "${item.id}" does not exist in settings_schema.json.`,
            );
        }

        if (
            changes.has(item.id)
            || manualIds.has(item.id)
        ) {
            violations.push(
                `${item.id} cannot be deferred and changed elsewhere.`,
            );
        }

        deferredIds.add(item.id);
    }

    const requiredColorFields = [
        'background',
        'background_gradient',
        'text',
        'button',
        'button_label',
        'secondary_button_label',
        'shadow',
    ];

    const schemes =
        plan.colorSchemeGroup?.schemes;

    if (
        !schemes
        || typeof schemes !== 'object'
    ) {
        violations.push(
            'colorSchemeGroup.schemes is required.',
        );
    } else {
        for (
            const [schemeId, scheme] of
            Object.entries(schemes)
            ) {
            if (!/^scheme-\d+$/.test(schemeId)) {
                violations.push(
                    `Invalid color-scheme ID "${schemeId}".`,
                );
            }

            for (const field of requiredColorFields) {
                if (
                    !Object.prototype.hasOwnProperty.call(
                        scheme,
                        field,
                    )
                ) {
                    violations.push(
                        `${schemeId} is missing "${field}".`,
                    );

                    continue;
                }

                if (
                    field !== 'background_gradient'
                    && !isHexColor(scheme[field])
                ) {
                    violations.push(
                        `${schemeId}.${field} must be a six-digit hex color.`,
                    );
                }

                if (
                    field === 'background_gradient'
                    && typeof scheme[field] !== 'string'
                ) {
                    violations.push(
                        `${schemeId}.background_gradient must be a string.`,
                    );
                }
            }
        }
    }

    return {
        violations,
        changes,
    };
}

function applyPlan(
    settingsDocument,
    plan,
    changes,
) {
    const candidate =
        deepClone(settingsDocument);

    if (
        !candidate.current
        || typeof candidate.current !== 'object'
    ) {
        throw new Error(
            'settings_data.json does not contain a current object.',
        );
    }

    for (const [id, value] of changes) {
        candidate.current[id] = value;
    }

    candidate.current.color_schemes =
        candidate.current.color_schemes || {};

    for (
        const [schemeId, settings] of
        Object.entries(
            plan.colorSchemeGroup.schemes,
        )
        ) {
        candidate.current.color_schemes[schemeId] = {
            settings: deepClone(settings),
        };
    }

    return candidate;
}

function compareCurrent(
    settingsDocument,
    plan,
    changes,
) {
    const drift = [];
    const current =
        settingsDocument.current || {};

    for (const [id, expected] of changes) {
        const actual = current[id];

        if (!deepEqual(actual, expected)) {
            drift.push({
                id,
                expected,
                actual,
            });
        }
    }

    for (
        const [schemeId, expected] of
        Object.entries(
            plan.colorSchemeGroup.schemes,
        )
        ) {
        const actual =
            current.color_schemes
                ?.[schemeId]
                ?.settings;

        if (!deepEqual(actual, expected)) {
            drift.push({
                id: `color_schemes.${schemeId}`,
                expected,
                actual,
            });
        }
    }

    return drift;
}

function writeCandidateAndRollback(
    original,
    candidate,
) {
    fs.mkdirSync(
        OUTPUT_DIRECTORY,
        {
            recursive: true,
        },
    );

    const rollbackPath = path.join(
        OUTPUT_DIRECTORY,
        'settings_data.rollback.json',
    );

    const candidatePath = path.join(
        OUTPUT_DIRECTORY,
        'settings_data.candidate.json',
    );

    fs.writeFileSync(
        rollbackPath,
        `${JSON.stringify(original, null, 2)}\n`,
    );

    fs.writeFileSync(
        candidatePath,
        `${JSON.stringify(candidate, null, 2)}\n`,
    );

    console.log(
        `Rollback snapshot: ${path.relative(ROOT, rollbackPath)}`,
    );

    console.log(
        `Candidate snapshot: ${path.relative(ROOT, candidatePath)}`,
    );
}

function main() {
    const args = new Set(
        process.argv.slice(2),
    );

    const supportedArgs = new Set([
        '--validate-plan',
        '--candidate',
        '--check',
    ]);

    for (const arg of args) {
        if (!supportedArgs.has(arg)) {
            throw new Error(
                `Unknown argument: ${arg}`,
            );
        }
    }

    const plan = readJson(PLAN_PATH);
    const schema = readJson(SCHEMA_PATH);
    const settings = readJson(SETTINGS_PATH);

    const {
        violations,
        changes,
    } = validatePlan(
        plan,
        schema,
    );

    if (violations.length > 0) {
        fail(violations);
        return;
    }

    console.log(
        `Rhino theme settings plan valid: `
        + `${changes.size} automatic settings, `
        + `${plan.manualSettings.length} manual settings, `
        + `${plan.deferredSettings.length} deferred settings.`,
    );

    if (args.has('--candidate')) {
        const candidate = applyPlan(
            settings,
            plan,
            changes,
        );

        writeCandidateAndRollback(
            settings,
            candidate,
        );
    }

    if (args.has('--check')) {
        const drift = compareCurrent(
            settings,
            plan,
            changes,
        );

        if (drift.length > 0) {
            fail(
                drift.map(
                    (entry) => (
                        `${entry.id}: expected `
                        + `${JSON.stringify(entry.expected)}, found `
                        + `${JSON.stringify(entry.actual)}`
                    ),
                ),
            );

            return;
        }

        console.log(
            'Committed settings_data.json matches the Rhino preview launch profile.',
        );
    }
}

try {
    main();
} catch (error) {
    fail(error.stack || error.message);
}