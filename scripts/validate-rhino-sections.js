const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const sectionsDir = path.join(ROOT, 'sections');

const errors = [];
const warnings = [];

function extractSchema(liquid) {
    const match = liquid.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);

    if (!match) {
        return null;
    }

    return JSON.parse(match[1]);
}

if (fs.existsSync(sectionsDir)) {
    for (const file of fs.readdirSync(sectionsDir)) {
        if (!file.startsWith('rhino-') || !file.endsWith('.liquid')) {
            continue;
        }

        const relativePath = `sections/${file}`;
        const content = fs.readFileSync(path.join(sectionsDir, file), 'utf8');

        let schema;

        try {
            schema = extractSchema(content);
        } catch (error) {
            errors.push(`${relativePath}: invalid JSON schema: ${error.message}`);
            continue;
        }

        if (!schema) {
            errors.push(`${relativePath}: missing {% schema %}`);
            continue;
        }

        if (!schema.name || schema.name.includes('TODO')) {
            errors.push(`${relativePath}: schema.name is missing or contains TODO`);
        }

        if (!Array.isArray(schema.presets) || schema.presets.length === 0) {
            warnings.push(`${relativePath}: no presets.defined; confirm this is intentional.`);
        }

        const settings = Array.isArray(schema.settings) ? schema.settings : [];

        for (const setting of settings) {
            if (!setting.id) {
                errors.push(`${relativePath}: setting missing id`);
            }

            if (!setting.label || /todo|placeholder/i.test(setting.label)) {
                errors.push(`${relativePath}: setting "${setting.id || 'unknown'}" has missing/placeholder label`);
            }

            if (typeof setting.default === 'string' && /lorem ipsum|todo|placeholder/i.test(setting.default)) {
                errors.push(`${relativePath}: setting "${setting.id}" has placeholder default`);
            }
        }
    }
}

if (errors.length > 0) {
    console.error('Rhino section validation failed.');

    for (const error of errors) {
        console.error(`- ${error}`);
    }

    process.exit(1);
}

if (warnings.length > 0) {
    console.warn('Rhino section validation warnings:');

    for (const warning of warnings) {
        console.warn(`- ${warning}`);
    }
}

console.log('Rhino section validation passed.');