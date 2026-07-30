const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/stock-asset-ledger.json'), 'utf8'));

const errors = [];
const warnings = [];

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

const stockAssetCandidates = listFiles(path.join(ROOT, 'assets'), (file) =>
    file.endsWith('.svg') ||
    file.endsWith('.png') ||
    file.endsWith('.jpg') ||
    file.endsWith('.jpeg') ||
    file.endsWith('.webp')
);

const ledgerPaths = new Set(ledger.assets.map((asset) => asset.path));

for (const asset of ledger.assets) {
    if (!fs.existsSync(path.join(ROOT, asset.path))) {
        warnings.push(`${asset.path}: listed in stock asset ledger but file does not exist`);
    }

    if (asset.origin === 'shopify-trade' && asset.decision === 'keep' && !asset.notes) {
        errors.push(`${asset.path}: kept stock Trade asset must explain why`);
    }
}

for (const candidate of stockAssetCandidates) {
    if (!ledgerPaths.has(candidate)) {
        warnings.push(`${candidate}: visual asset not listed in data/stock-asset-ledger.json`);
    }
}

if (errors.length > 0) {
    console.error('Stock asset validation failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

if (warnings.length > 0) {
    console.warn('Stock asset validation warnings:');

    for (const warning of warnings) {
        console.warn(`- ${warning}`);
    }
}

console.log(`Stock asset validation passed with ${ledger.assets.length} ledger entries.`);