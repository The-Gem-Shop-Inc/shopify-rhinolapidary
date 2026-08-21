'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const REGISTER_PATH = path.join(
    ROOT,
    'data',
    'legal-claims-register.json',
);

const CUSTOMER_FACING_DIRECTORIES = [
    'layout',
    'sections',
    'snippets',
    'templates',
    'locales',
    'config',
];

const GOVERNED_CLAIM_SOURCE_FILES = [
    'data/global-navigation-ia.json',
    'data/footer-support-resources.json',
    'data/localization-market-decision.json',
    'data/homepage-content-claims-map.json',
];

const CUSTOMER_FACING_EXTENSIONS = new Set([
    '.css',
    '.html',
    '.js',
    '.json',
    '.liquid',
]);

const VALID_STATUSES = new Set([
    'approved_plain_use',
    'approved',
    'needs_review',
    'blocked',
    'retired',
]);

function walk(directory) {
    if (!fs.existsSync(directory)) {
        return [];
    }

    const files = [];

    for (
        const entry of fs.readdirSync(
            directory,
            {
                withFileTypes: true,
            },
        )
    ) {
        const absolutePath = path.join(
            directory,
            entry.name,
        );

        if (entry.isDirectory()) {
            files.push(...walk(absolutePath));
        } else if (entry.isFile()) {
            files.push(absolutePath);
        }
    }

    return files;
}

function stripComments(source) {
    return source
        .replace(
            /\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/gi,
            '',
        )
        .replace(
            /<!--[\s\S]*?-->/g,
            '',
        )
        .replace(
            /\/\*[\s\S]*?\*\//g,
            '',
        );
}

function compilePattern(pattern, claimId) {
    try {
        return new RegExp(pattern, 'gi');
    } catch (error) {
        throw new Error(
            `${claimId} contains invalid regex "${pattern}": ${error.message}`,
        );
    }
}

function lineNumber(source, index) {
    return source.slice(0, index).split('\n').length;
}

function readRegister(registerPath = REGISTER_PATH) {
    return JSON.parse(
        fs.readFileSync(registerPath, 'utf8'),
    );
}

function validateRegisterShape(register) {
    const violations = [];
    const ids = new Set();

    if (register.schemaVersion !== 1) {
        violations.push('schemaVersion must equal 1.');
    }

    if (!Array.isArray(register.claims)) {
        violations.push('claims must be an array.');
    }

    for (const claim of register.claims || []) {
        if (!claim.id || ids.has(claim.id)) {
            violations.push(
                `Missing or duplicate claim ID: ${claim.id || '(blank)'}`,
            );
        }

        ids.add(claim.id);

        if (!VALID_STATUSES.has(claim.status)) {
            violations.push(
                `${claim.id}: unsupported status "${claim.status}".`,
            );
        }

        for (const field of [
            'label',
            'category',
            'owner',
            'reviewer',
            'reviewTrigger',
            'notes',
        ]) {
            if (
                typeof claim[field] !== 'string'
                || claim[field].trim() === ''
            ) {
                violations.push(
                    `${claim.id}: ${field} is required.`,
                );
            }
        }

        for (const field of [
            'patterns',
            'approvedWording',
            'prohibitedWording',
            'allowedSurfaces',
            'sourcePaths',
        ]) {
            if (!Array.isArray(claim[field])) {
                violations.push(
                    `${claim.id}: ${field} must be an array.`,
                );
            }
        }

        for (const sourcePath of claim.sourcePaths || []) {
            if (!fs.existsSync(path.resolve(ROOT, sourcePath))) {
                violations.push(
                    `${claim.id}: source path does not exist: ${sourcePath}`,
                );
            }
        }

        for (const pattern of claim.patterns || []) {
            compilePattern(pattern, claim.id);
        }
    }

    return violations;
}

function validateSourceText(relativePath, sourceText, register) {
    const violations = [];
    const source = stripComments(sourceText);

    for (const claim of register.claims || []) {
        const shouldBlock = [
            'blocked',
            'needs_review',
            'retired',
        ].includes(claim.status);

        for (const patternText of claim.patterns || []) {
            const pattern = compilePattern(
                patternText,
                claim.id,
            );

            for (const match of source.matchAll(pattern)) {
                if (!shouldBlock) {
                    continue;
                }

                violations.push(
                    `${relativePath}:${lineNumber(source, match.index)} `
                    + `contains ${claim.status} claim ${claim.id}: "${match[0]}"`,
                );
            }
        }

        for (const prohibited of claim.prohibitedWording || []) {
            if (!prohibited) {
                continue;
            }

            const index = source
                .toLowerCase()
                .indexOf(prohibited.toLowerCase());

            if (index >= 0) {
                violations.push(
                    `${relativePath}:${lineNumber(source, index)} `
                    + `contains prohibited wording for ${claim.id}: "${prohibited}"`,
                );
            }
        }
    }

    return violations;
}

function collectScannedFiles() {
    const directoryFiles = CUSTOMER_FACING_DIRECTORIES
        .flatMap((directory) => (
            walk(path.join(ROOT, directory))
        ))
        .filter((filePath) => (
            CUSTOMER_FACING_EXTENSIONS.has(
                path.extname(filePath).toLowerCase(),
            )
        ));

    const governedFiles = GOVERNED_CLAIM_SOURCE_FILES
        .map((filePath) => path.join(ROOT, filePath))
        .filter((filePath) => fs.existsSync(filePath));

    return [
        ...directoryFiles,
        ...governedFiles,
    ];
}

function validateBrandClaims(options = {}) {
    const register = options.register || readRegister(options.registerPath);
    const violations = validateRegisterShape(register);
    const files = options.files || collectScannedFiles();

    for (const filePath of files) {
        const relativePath = path
            .relative(ROOT, filePath)
            .replaceAll('\\', '/');

        const source = fs.readFileSync(
            filePath,
            'utf8',
        );

        violations.push(
            ...validateSourceText(relativePath, source, register),
        );
    }

    return {
        violations,
        claimCount: (register.claims || []).length,
        fileCount: files.length,
    };
}

function main() {
    const result = validateBrandClaims();

    if (result.violations.length > 0) {
        console.error(
            `Brand claims validation failed:\n- ${
                result.violations.join('\n- ')
            }`,
        );
        process.exitCode = 1;
        return;
    }

    console.log(
        `Brand claims valid: ${result.claimCount} claims; `
        + `${result.fileCount} customer-facing and governed files scanned.`,
    );
}

if (require.main === module) {
    main();
}

module.exports = {
    GOVERNED_CLAIM_SOURCE_FILES,
    collectScannedFiles,
    readRegister,
    stripComments,
    validateBrandClaims,
    validateRegisterShape,
    validateSourceText,
};
