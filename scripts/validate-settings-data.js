const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const settingsPath = path.join(ROOT, 'config/settings_data.json');

if (!fs.existsSync(settingsPath)) {
    console.error('Missing config/settings_data.json');
    process.exit(1);
}

const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const errors = [];
const warnings = [];

if (!settings.current) {
    errors.push('settings_data.json must contain current settings.');
}

const current = settings.current || {};

if (current.cart_type && !['drawer', 'notification', 'page'].includes(current.cart_type)) {
    errors.push(`Unexpected cart_type: ${current.cart_type}`);
}

const serialized = JSON.stringify(settings);

if (/lorem ipsum|todo|placeholder/i.test(serialized)) {
    warnings.push('settings_data.json contains possible placeholder/TODO text.');
}

if (/custom_liquid/i.test(serialized)) {
    warnings.push('settings_data.json appears to contain Custom Liquid; verify theme-editor-code-register.md.');
}

if (/enabled"\s*:\s*true/i.test(serialized) && /app/i.test(serialized)) {
    warnings.push('settings_data.json may contain enabled app embed/app settings; verify app register.');
}

if (errors.length > 0) {
    console.error('settings_data validation failed.');
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exit(1);
}

if (warnings.length > 0) {
    console.warn('settings_data validation warnings:');
    for (const warning of warnings) {
        console.warn(`- ${warning}`);
    }
}

console.log('settings_data validation passed.');