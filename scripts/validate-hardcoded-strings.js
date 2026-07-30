const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const allowlist = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/hardcoded-string-allowlist.json'), 'utf8')
);

const errors = [];
const warnings = [];

function read(file) {
    return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function exists(file) {
    return fs.existsSync(path.join(ROOT, file));
}

for (const entry of allowlist.allowlist) {
    if (!exists(entry.path)) {
        errors.push(`${entry.id}: allowlisted path does not exist: ${entry.path}`);
        continue;
    }

    if (!read(entry.path).includes(entry.string)) {
        warnings.push(`${entry.id}: allowlisted string no longer found in ${entry.path}`);
    }
}

const rhinoJsPath = 'assets/rhino-storefront.js';

if (exists(rhinoJsPath)) {
    const js = read(rhinoJsPath);

    const stringMatches = js.match(/(['"`])(?:(?=(\\?))\2.)*?\1/g) || [];
    const customerFacingCandidates = stringMatches
        .map((value) => value.slice(1, -1))
        .filter((value) =>
            value.length >= 8 &&
            !value.startsWith('rhino:') &&
            !value.includes('RhinoLapidary') &&
            !value.match(/^\\d+\\.\\d+\\.\\d+$/)
        );

    for (const candidate of customerFacingCandidates) {
        const allowed = allowlist.allowlist.some(
            (entry) => entry.path === rhinoJsPath && entry.string === candidate
        );

        if (!allowed) {
            warnings.push(`${rhinoJsPath}: possible hardcoded customer-facing string "${candidate}"`);
        }
    }
}

if (errors.length > 0) {
    console.error('Hardcoded string validation failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

if (warnings.length > 0) {
    console.warn('Hardcoded string validation warnings:');

    for (const warning of warnings) {
        console.warn(`- ${warning}`);
    }
}

console.log(`Hardcoded string validation passed with ${allowlist.allowlist.length} allowlist entries.`);