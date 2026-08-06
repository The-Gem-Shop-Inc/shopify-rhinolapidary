'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

const CSS_PATH = path.join(
    ROOT,
    'assets',
    'rhino-custom.css',
);

const TOKEN_INVENTORY_PATH = path.join(
    ROOT,
    'data',
    'design-token-inventory.json',
);

const TOKEN_NAME_FIELDS = [
    'name',
    'token',
    'cssVariable',
    'css_variable',
    'customProperty',
    'custom_property',
];

const TOKEN_VALUE_FIELDS = [
    'value',
    'currentValue',
    'current_value',
    'approvedValue',
    'approved_value',
    'implementedValue',
    'implemented_value',
];

function fail(messages) {
    const list = Array.isArray(messages)
        ? messages
        : [messages];

    console.error(
        `Rhino style contract validation failed:\n- ${list.join('\n- ')}`,
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

function stripCssComments(source) {
    return source.replace(
        /\/\*[\s\S]*?\*\//g,
        '',
    );
}

function normalizeCssValue(value) {
    return String(value)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ',')
        .replace(/\(\s+/g, '(')
        .replace(/\s+\)/g, ')');
}

function extractCustomPropertyDeclarations(source) {
    const declarations = new Map();

    for (
        const match of source.matchAll(
        /(--rhino-[a-z0-9-]+)\s*:\s*([^;]+);/gi,
    )
        ) {
        const name = match[1].toLowerCase();
        const value = match[2].trim();

        if (!declarations.has(name)) {
            declarations.set(name, []);
        }

        declarations.get(name).push(value);
    }

    return declarations;
}

function parseRootTokenBlock(blockSource, blockLabel) {
    const tokens = new Map();

    for (
        const match of blockSource.matchAll(
        /(--rhino-[a-z0-9-]+)\s*:\s*([^;]+);/gi,
    )
        ) {
        const name = match[1].toLowerCase();
        const value = match[2].trim();

        if (
            tokens.has(name)
            && normalizeCssValue(tokens.get(name))
            !== normalizeCssValue(value)
        ) {
            throw new Error(
                `${name} has conflicting values inside ${blockLabel}: `
                + `"${tokens.get(name)}" and "${value}".`,
            );
        }

        tokens.set(name, value);
    }

    return tokens;
}

function extractRootTokens(source) {
    const rootBlocks = [
        ...source.matchAll(
            /:root\s*\{([\s\S]*?)\}/gi,
        ),
    ];

    if (rootBlocks.length === 0) {
        throw new Error(
            'rhino-custom.css does not contain a :root token block.',
        );
    }

    /*
     * The first :root block is the canonical base token set recorded in
     * data/design-token-inventory.json.
     *
     * Later :root blocks may override existing tokens inside responsive media
     * queries. They may not introduce new global tokens.
     */
    const baseTokens = parseRootTokenBlock(
        rootBlocks[0][1],
        'the base :root block',
    );

    for (
        let index = 1;
        index < rootBlocks.length;
        index += 1
    ) {
        const overrideTokens = parseRootTokenBlock(
            rootBlocks[index][1],
            `responsive :root block ${index}`,
        );

        for (const name of overrideTokens.keys()) {
            if (!baseTokens.has(name)) {
                throw new Error(
                    `${name} is first declared in responsive :root block ${index}. `
                    + 'Declare every global token in the base :root block before '
                    + 'overriding it responsively.',
                );
            }
        }
    }

    return baseTokens;
}

function extractUsedTokens(source) {
    return new Set(
        [...source.matchAll(
            /var\(\s*(--rhino-[a-z0-9-]+)/gi,
        )].map((match) => match[1].toLowerCase()),
    );
}

function firstField(object, fieldNames) {
    for (const field of fieldNames) {
        if (
            Object.prototype.hasOwnProperty.call(
                object,
                field,
            )
            && object[field] !== null
            && object[field] !== ''
        ) {
            return object[field];
        }
    }

    return undefined;
}

function extractInventoryTokens(document) {
    const tokens = new Map();
    const visited = new Set();

    function register(name, value, status, sourceObject) {
        if (
            typeof name !== 'string'
            || !name.startsWith('--rhino-')
        ) {
            return;
        }

        const normalizedName = name.toLowerCase();

        const record = {
            name: normalizedName,
            value:
                value === undefined
                    ? undefined
                    : String(value),
            status:
                typeof status === 'string'
                    ? status.toLowerCase()
                    : '',
            sourceObject,
        };

        const previous = tokens.get(normalizedName);

        if (
            previous?.value !== undefined
            && record.value !== undefined
            && normalizeCssValue(previous.value)
            !== normalizeCssValue(record.value)
        ) {
            throw new Error(
                `Token inventory contains conflicting values for ${normalizedName}.`,
            );
        }

        tokens.set(normalizedName, {
            ...previous,
            ...record,
            value:
                record.value === undefined
                    ? previous?.value
                    : record.value,
        });
    }

    function visit(node, keyHint = '') {
        if (
            node === null
            || node === undefined
        ) {
            return;
        }

        if (
            typeof node !== 'object'
        ) {
            if (
                typeof keyHint === 'string'
                && keyHint.startsWith('--rhino-')
            ) {
                register(
                    keyHint,
                    node,
                    '',
                    node,
                );
            }

            return;
        }

        if (visited.has(node)) {
            return;
        }

        visited.add(node);

        if (
            typeof keyHint === 'string'
            && keyHint.startsWith('--rhino-')
        ) {
            register(
                keyHint,
                firstField(node, TOKEN_VALUE_FIELDS),
                node.status,
                node,
            );
        }

        const name = firstField(
            node,
            TOKEN_NAME_FIELDS,
        );

        if (
            typeof name === 'string'
            && name.startsWith('--rhino-')
        ) {
            register(
                name,
                firstField(node, TOKEN_VALUE_FIELDS),
                node.status,
                node,
            );
        }

        for (const [key, value] of Object.entries(node)) {
            visit(value, key);
        }
    }

    visit(document);

    return tokens;
}

function removeRootBlocks(source) {
    return source.replace(
        /:root\s*\{[\s\S]*?\}/gi,
        '',
    );
}

function findLiteralColorsOutsideRoot(source) {
    const withoutRoot = removeRootBlocks(source);

    const matches = withoutRoot.match(
        /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)/gi,
    );

    return [...new Set(matches || [])];
}

function validateKeyframeNames(source) {
    return [...source.matchAll(
        /@keyframes\s+([a-z0-9_-]+)/gi,
    )]
        .map((match) => match[1])
        .filter(
            (name) => !name.startsWith('rhino-'),
        );
}

function main() {
    const violations = [];

    if (!fs.existsSync(CSS_PATH)) {
        fail('assets/rhino-custom.css does not exist.');
        return;
    }

    if (!fs.existsSync(TOKEN_INVENTORY_PATH)) {
        fail('data/design-token-inventory.json does not exist.');
        return;
    }

    const rawCss = fs.readFileSync(
        CSS_PATH,
        'utf8',
    );

    const css = stripCssComments(rawCss);
    const rootTokens = extractRootTokens(css);
    const declarations =
        extractCustomPropertyDeclarations(css);
    const usedTokens = extractUsedTokens(css);

    const inventory = extractInventoryTokens(
        readJson(TOKEN_INVENTORY_PATH),
    );

    for (const [name, value] of rootTokens) {
        const record = inventory.get(name);

        if (!record) {
            violations.push(
                `${name} exists in :root but is absent from the design-token inventory.`,
            );

            continue;
        }

        if (
            record.value !== undefined
            && normalizeCssValue(record.value)
            !== normalizeCssValue(value)
        ) {
            violations.push(
                `${name} differs between CSS and the inventory: `
                + `CSS="${value}", inventory="${record.value}".`,
            );
        }
    }

    for (const name of usedTokens) {
        if (!declarations.has(name)) {
            violations.push(
                `${name} is used through var() but is never declared.`,
            );
        }
    }

    for (const name of declarations.keys()) {
        if (!/^--rhino-[a-z][a-z0-9-]*$/.test(name)) {
            violations.push(
                `${name} does not follow the Rhino custom-property naming contract.`,
            );
        }
    }

    const literalColors =
        findLiteralColorsOutsideRoot(css);

    if (literalColors.length > 0) {
        violations.push(
            'Literal colors were found outside :root: '
            + literalColors.join(', ')
            + '. Move them into governed --rhino-* tokens.',
        );
    }

    if (/!important\b/i.test(css)) {
        violations.push(
            'rhino-custom.css contains !important.',
        );
    }

    if (/@import\b/i.test(css)) {
        violations.push(
            'rhino-custom.css contains @import. Load owned CSS through theme.liquid.',
        );
    }

    if (/url\(\s*["']?https?:\/\//i.test(css)) {
        violations.push(
            'rhino-custom.css contains an external URL.',
        );
    }

    const invalidKeyframes =
        validateKeyframeNames(css);

    if (invalidKeyframes.length > 0) {
        violations.push(
            'Unprefixed keyframes found: '
            + invalidKeyframes.join(', '),
        );
    }

    if (
        !/rhino-custom\.css/.test(
            fs.readFileSync(
                path.join(ROOT, 'layout', 'theme.liquid'),
                'utf8',
            ),
        )
    ) {
        violations.push(
            'layout/theme.liquid does not load rhino-custom.css.',
        );
    }

    if (violations.length > 0) {
        fail(violations);
        return;
    }

    console.log(
        [
            'Rhino style contract passed.',
            `Global tokens: ${rootTokens.size}.`,
            `All custom properties: ${declarations.size}.`,
            `Referenced tokens: ${usedTokens.size}.`,
            `Inventory token records found: ${inventory.size}.`,
        ].join(' '),
    );
}

try {
    main();
} catch (error) {
    fail(error.stack || error.message);
}