const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const inventory = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/design-token-inventory.json'), 'utf8')
);

const errors = [];
const names = new Set();

for (const token of inventory.tokens) {
    if (names.has(token.name)) {
        errors.push(`Duplicate design token: ${token.name}`);
    }

    names.add(token.name);

    if (!token.name.startsWith('--rhino-')) {
        errors.push(`${token.name}: Rhino tokens must start with --rhino-`);
    }

    if (token.status === 'active' && token.value.includes('TODO')) {
        errors.push(`${token.name}: active token cannot contain TODO`);
    }
}

if (errors.length > 0) {
    console.error('Design token validation failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

console.log(`Design token validation passed for ${inventory.tokens.length} tokens.`);