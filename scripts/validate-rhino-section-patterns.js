'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const REGISTRY_PATH = path.join(
    ROOT,
    'data',
    'rhino-section-patterns.json',
);

const SECTIONS_DIRECTORY = path.join(
    ROOT,
    'sections',
);

const VALID_STATUS = new Set([
    'approved',
    'planned',
    'retired',
]);

const VALID_IMPLEMENTATIONS = new Set([
    'trade_first',
    'rhino_section',
    'rhino_section_or_block',
]);

const VALID_JS_POLICIES = new Set([
    'none',
    'click_to_load_only',
    'none_until_approved',
]);

const CUSTOMER_TEXT_SETTING_TYPES = new Set([
    'text',
    'textarea',
    'richtext',
    'inline_richtext',
]);

function fail(messages) {
    const list = Array.isArray(messages)
        ? messages
        : [messages];

    console.error(
        `Rhino section pattern validation failed:\n- ${list.join('\n- ')}`,
    );

    process.exitCode = 1;
}

function readJson(filePath) {
    return JSON.parse(
        fs.readFileSync(filePath, 'utf8'),
    );
}

function getRhinoSectionFiles() {
    if (!fs.existsSync(SECTIONS_DIRECTORY)) {
        return [];
    }

    return fs
        .readdirSync(
            SECTIONS_DIRECTORY,
            {
                withFileTypes: true,
            },
        )
        .filter(
            (entry) => (
                entry.isFile()
                && /^rhino-.*\.liquid$/i.test(entry.name)
            ),
        )
        .map(
            (entry) => path.join(
                SECTIONS_DIRECTORY,
                entry.name,
            ),
        );
}

function extractSchema(source, relativePath) {
    const match = source.match(
        /\{%\s*schema\s*%\}([\s\S]*?)\{%\s*endschema\s*%\}/i,
    );

    if (!match) {
        throw new Error(
            `${relativePath} has no schema block.`,
        );
    }

    try {
        return JSON.parse(match[1]);
    } catch (error) {
        throw new Error(
            `${relativePath} contains invalid schema JSON: ${error.message}`,
        );
    }
}

function collectSettings(schema) {
    const settings = [
        ...(schema.settings || []),
    ];

    for (const block of schema.blocks || []) {
        settings.push(
            ...(block.settings || []),
        );
    }

    return settings;
}

function isLocaleKey(value) {
    return (
        typeof value === 'string'
        && value.startsWith('t:')
    );
}

function main() {
    const violations = [];
    const registry = readJson(REGISTRY_PATH);

    if (registry.schemaVersion !== 1) {
        violations.push(
            'schemaVersion must equal 1.',
        );
    }

    if (!Array.isArray(registry.patterns)) {
        violations.push(
            'patterns must be an array.',
        );
    }

    const patterns = new Map();

    for (
        const [index, pattern] of
        (registry.patterns || []).entries()
        ) {
        const label = pattern.id || `pattern ${index + 1}`;

        if (
            !pattern.id
            || !/^[a-z][a-z0-9-]*$/.test(pattern.id)
        ) {
            violations.push(
                `${label}: id must use lowercase kebab-case.`,
            );
        }

        if (patterns.has(pattern.id)) {
            violations.push(
                `${label}: duplicate pattern ID.`,
            );
        }

        patterns.set(pattern.id, pattern);

        if (!VALID_STATUS.has(pattern.status)) {
            violations.push(
                `${label}: unsupported status "${pattern.status}".`,
            );
        }

        if (
            !VALID_IMPLEMENTATIONS.has(
                pattern.preferredImplementation,
            )
        ) {
            violations.push(
                `${label}: unsupported preferredImplementation.`,
            );
        }

        if (
            !VALID_JS_POLICIES.has(
                pattern.javascriptPolicy,
            )
        ) {
            violations.push(
                `${label}: unsupported javascriptPolicy.`,
            );
        }

        if (
            !Array.isArray(pattern.contentSources)
            || pattern.contentSources.length === 0
        ) {
            violations.push(
                `${label}: contentSources must contain at least one source.`,
            );
        }

        for (const field of [
            'name',
            'launchPriority',
            'emptyBehavior',
            'notes',
        ]) {
            if (
                typeof pattern[field] !== 'string'
                || pattern[field].trim() === ''
            ) {
                violations.push(
                    `${label}: ${field} is required.`,
                );
            }
        }

        for (const field of [
            'merchantAddable',
            'requiresProductContext',
        ]) {
            if (typeof pattern[field] !== 'boolean') {
                violations.push(
                    `${label}: ${field} must be boolean.`,
                );
            }
        }
    }

    for (const filePath of getRhinoSectionFiles()) {
        const relativePath = path
            .relative(ROOT, filePath)
            .replaceAll('\\', '/');

        const source = fs.readFileSync(
            filePath,
            'utf8',
        );

        const marker = source.match(
            /Rhino section pattern:\s*([a-z0-9-]+)/i,
        );

        if (!marker) {
            violations.push(
                `${relativePath}: missing "Rhino section pattern: ..." marker.`,
            );

            continue;
        }

        const patternId = marker[1].toLowerCase();
        const pattern = patterns.get(patternId);

        if (!pattern) {
            violations.push(
                `${relativePath}: unknown pattern "${patternId}".`,
            );
        } else if (pattern.status === 'retired') {
            violations.push(
                `${relativePath}: uses retired pattern "${patternId}".`,
            );
        }

        if (
            !/class\s*=\s*["'][^"']*\brhino-section\b/i
                .test(source)
        ) {
            violations.push(
                `${relativePath}: root markup must include class "rhino-section".`,
            );
        }

        if (/<h1\b/i.test(source)) {
            violations.push(
                `${relativePath}: reusable sections must not render an h1.`,
            );
        }

        if (/<style\b/i.test(source)) {
            violations.push(
                `${relativePath}: inline style blocks are prohibited.`,
            );
        }

        if (/\sstyle\s*=\s*["']/i.test(source)) {
            violations.push(
                `${relativePath}: inline style attributes are prohibited.`,
            );
        }

        if (/<script\b/i.test(source)) {
            violations.push(
                `${relativePath}: inline script blocks are prohibited.`,
            );
        }

        if (
            /<iframe\b[^>]*\bsrc\s*=\s*["']https?:/i
                .test(source)
        ) {
            violations.push(
                `${relativePath}: immediately loaded external iframe found.`,
            );
        }

        if (
            /\ball_products\s*\[/i.test(source)
            || /\/products\/[a-z0-9-]+/i.test(source)
        ) {
            violations.push(
                `${relativePath}: contains a hardcoded product reference.`,
            );
        }

        let schema;

        try {
            schema = extractSchema(
                source,
                relativePath,
            );
        } catch (error) {
            violations.push(error.message);
            continue;
        }

        if (!isLocaleKey(schema.name)) {
            violations.push(
                `${relativePath}: schema name must be a locale key.`,
            );
        }

        if (
            pattern?.merchantAddable
            && (
                !Array.isArray(schema.presets)
                || schema.presets.length === 0
            )
        ) {
            violations.push(
                `${relativePath}: merchant-addable pattern requires a preset.`,
            );
        }

        const settingIds = new Set();

        for (const setting of collectSettings(schema)) {
            if (setting.id) {
                if (
                    !/^[a-z][a-z0-9_]*$/.test(setting.id)
                ) {
                    violations.push(
                        `${relativePath}: setting ID "${setting.id}" must use snake_case.`,
                    );
                }

                if (settingIds.has(setting.id)) {
                    violations.push(
                        `${relativePath}: duplicate setting ID "${setting.id}".`,
                    );
                }

                settingIds.add(setting.id);
            }

            if (
                setting.label
                && !isLocaleKey(setting.label)
            ) {
                violations.push(
                    `${relativePath}: label for "${setting.id || setting.type}" must be a locale key.`,
                );
            }

            if (
                setting.info
                && !isLocaleKey(setting.info)
            ) {
                violations.push(
                    `${relativePath}: info for "${setting.id || setting.type}" must be a locale key.`,
                );
            }

            if (
                ['liquid', 'custom_liquid'].includes(
                    setting.type,
                )
            ) {
                violations.push(
                    `${relativePath}: Custom Liquid settings are prohibited.`,
                );
            }

            if (
                CUSTOMER_TEXT_SETTING_TYPES.has(
                    setting.type,
                )
                && typeof setting.default === 'string'
                && setting.default.trim() !== ''
            ) {
                violations.push(
                    `${relativePath}: customer-facing setting "${setting.id}" must not contain placeholder default copy.`,
                );
            }
        }

        for (const block of schema.blocks || []) {
            if (
                typeof block.type !== 'string'
                || !/^[a-z][a-z0-9_-]*$/.test(block.type)
            ) {
                violations.push(
                    `${relativePath}: invalid block type "${block.type}".`,
                );
            }

            if (
                block.name
                && !isLocaleKey(block.name)
            ) {
                violations.push(
                    `${relativePath}: block "${block.type}" name must be a locale key.`,
                );
            }
        }
    }

    if (violations.length > 0) {
        fail(violations);
        return;
    }

    console.log(
        `Rhino section pattern validation passed: `
        + `${patterns.size} patterns and `
        + `${getRhinoSectionFiles().length} implemented Rhino section(s).`,
    );
}

try {
    main();
} catch (error) {
    fail(error.stack || error.message);
}