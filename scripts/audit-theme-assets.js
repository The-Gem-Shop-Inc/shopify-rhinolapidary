const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ASSETS_DIR = path.join(ROOT, 'assets');

const errors = [];
const warnings = [];

const allowedUnreferencedAssets = new Set([
    // Shopify/theme-editor loaded or intentionally retained.
    'rhino-custom.css',
    'rhino-storefront.js'
]);

function listFiles(dir, predicate) {
    if (!fs.existsSync(dir)) return [];

    const results = [];

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const absolute = path.join(dir, entry.name);
        const relative = path.relative(ROOT, absolute).split(path.sep).join('/');

        if (entry.isDirectory()) {
            results.push(...listFiles(absolute, predicate));
            continue;
        }

        if (predicate(relative)) {
            results.push(relative);
        }
    }

    return results;
}

function read(file) {
    return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

const cssJsAssets = listFiles(ASSETS_DIR, (file) =>
    file.endsWith('.css') || file.endsWith('.js')
);

const searchableFiles = listFiles(ROOT, (file) =>
    !file.includes('node_modules/') &&
    !file.includes('.git/') &&
    !file.includes('test-results/') &&
    !file.includes('playwright-report/') &&
    (
        file.endsWith('.liquid') ||
        file.endsWith('.json') ||
        file.endsWith('.js') ||
        file.endsWith('.css') ||
        file.endsWith('.md')
    )
);

for (const asset of cssJsAssets) {
    const basename = path.basename(asset);

    const references = searchableFiles.filter((file) => {
        if (file === asset) return false;
        return read(file).includes(basename);
    });

    if (references.length === 0 && !allowedUnreferencedAssets.has(basename)) {
        warnings.push(`${asset}: no repository references found`);
    }
}

const assetBasenames = new Map();

for (const asset of cssJsAssets) {
    const basename = path.basename(asset).toLowerCase();

    if (!assetBasenames.has(basename)) {
        assetBasenames.set(basename, []);
    }

    assetBasenames.get(basename).push(asset);
}

for (const [basename, matches] of assetBasenames.entries()) {
    if (matches.length > 1) {
        errors.push(`Duplicate asset basename "${basename}": ${matches.join(', ')}`);
    }
}

if (errors.length > 0) {
    console.error('Theme asset audit failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

if (warnings.length > 0) {
    console.warn('Theme asset audit warnings:');

    for (const warning of warnings) {
        console.warn(`- ${warning}`);
    }
}

console.log(`Theme asset audit passed with ${cssJsAssets.length} CSS/JS assets scanned.`);