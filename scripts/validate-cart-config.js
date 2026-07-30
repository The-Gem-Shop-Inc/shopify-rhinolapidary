const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const settingsPath = path.join(ROOT, 'config/settings_data.json');

if (!fs.existsSync(settingsPath)) {
    console.error('config/settings_data.json not found.');
    process.exit(1);
}

const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
const current = settings.current || {};
const cartType = current.cart_type;

const expected = process.env.EXPECTED_CART_TYPE || 'notification';

const errors = [];

if (cartType !== expected) {
    errors.push(`Expected cart_type "${expected}", got "${cartType}".`);
}

const requiredFiles = [
    'assets/cart-notification.js',
    'snippets/cart-notification.liquid',
    'templates/cart.json',
];

for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(ROOT, file))) {
        errors.push(`Missing required cart file: ${file}`);
    }
}

if (errors.length > 0) {
    console.error('Cart configuration validation failed.');
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exit(1);
}

console.log(`Cart configuration validation passed. cart_type=${cartType}`);