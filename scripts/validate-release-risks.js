const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const register = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/release-risk-register.json'), 'utf8')
);

const errors = [];
const ids = new Set();

for (const risk of register.risks) {
    if (ids.has(risk.id)) {
        errors.push(`Duplicate risk id: ${risk.id}`);
    }

    ids.add(risk.id);

    if (risk.severity === 'launch-blocking' && risk.status !== 'closed') {
        errors.push(`${risk.id}: launch-blocking risk must be closed before production launch`);
    }

    if (risk.status === 'accepted' && risk.severity === 'launch-blocking') {
        errors.push(`${risk.id}: launch-blocking risk cannot be accepted`);
    }

    if (!risk.mitigation || risk.mitigation.length < 10) {
        errors.push(`${risk.id}: mitigation is required`);
    }
}

if (errors.length > 0) {
    console.error('Release risk validation failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

console.log(`Release risk validation passed with ${register.risks.length} risks.`);