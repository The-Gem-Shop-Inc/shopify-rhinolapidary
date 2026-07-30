const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/stock-trade-remnants.json'), 'utf8'));

const errors = [];
const warnings = [];

const ids = new Set();

for (const remnant of ledger.remnants) {
    if (ids.has(remnant.id)) {
        errors.push(`Duplicate stock remnant id: ${remnant.id}`);
    }

    ids.add(remnant.id);

    if (!fs.existsSync(path.join(ROOT, remnant.path))) {
        warnings.push(`${remnant.id}: path does not exist: ${remnant.path}`);
    }

    if (
        remnant.decision === 'keep' &&
        remnant.status !== 'accepted'
    ) {
        errors.push(`${remnant.id}: decision "keep" requires status "accepted"`);
    }

    if (
        remnant.decision.includes('before-launch') &&
        ['accepted', 'replaced', 'removed'].includes(remnant.status)
    ) {
        warnings.push(`${remnant.id}: before-launch decision may be stale because status is ${remnant.status}`);
    }

    if (
        remnant.status === 'accepted' &&
        (!remnant.notes || remnant.notes.length < 10)
    ) {
        errors.push(`${remnant.id}: accepted remnant requires explanatory notes`);
    }
}

if (errors.length > 0) {
    console.error('Stock Trade remnants validation failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

if (warnings.length > 0) {
    console.warn('Stock Trade remnants validation warnings:');

    for (const warning of warnings) {
        console.warn(`- ${warning}`);
    }
}

console.log(`Stock Trade remnants validation passed with ${ledger.remnants.length} entries.`);