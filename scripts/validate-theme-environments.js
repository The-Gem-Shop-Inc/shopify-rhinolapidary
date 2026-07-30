const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/theme-environments.json'), 'utf8'));

const names = new Set(config.environments.map((environment) => environment.name));
const errors = [];

for (const required of ['local', 'preview', 'production']) {
    if (!names.has(required)) {
        errors.push(`Missing required theme environment: ${required}`);
    }
}

const production = config.environments.filter((environment) => environment.production);

if (production.length !== 1) {
    errors.push(`Exactly one environment must be production. Found: ${production.length}`);
}

const preview = config.environments.find((environment) => environment.name === 'preview');

if (preview && !preview.requiresPreviewUrl) {
    errors.push('preview environment must require PREVIEW_URL.');
}

if (errors.length > 0) {
    console.error('Theme environment validation failed.');
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exit(1);
}

console.log('Theme environment validation passed.');