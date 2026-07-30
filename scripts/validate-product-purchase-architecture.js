const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const productTemplatePath = path.join(ROOT, 'templates/product.json');
const mainProductPath = path.join(ROOT, 'sections/main-product.liquid');

const errors = [];

if (!fs.existsSync(productTemplatePath)) {
    errors.push('Missing templates/product.json');
}

if (!fs.existsSync(mainProductPath)) {
    errors.push('Missing sections/main-product.liquid');
}

if (errors.length === 0) {
    const productTemplate = JSON.parse(fs.readFileSync(productTemplatePath, 'utf8'));
    const mainProduct = fs.readFileSync(mainProductPath, 'utf8');

    const mainSection = productTemplate.sections?.main;

    if (!mainSection) {
        errors.push('templates/product.json is missing sections.main');
    } else {
        const blockTypes = Object.values(mainSection.blocks || {}).map((block) => block.type);

        for (const required of ['title', 'price', 'variant_picker', 'quantity_selector', 'buy_buttons']) {
            if (!blockTypes.includes(required)) {
                errors.push(`templates/product.json missing required purchase block: ${required}`);
            }
        }
    }

    const requiredLiquidSignals = [
        'product-form',
        'product_form_id',
        'buy_buttons',
        'variant_picker',
    ];

    for (const signal of requiredLiquidSignals) {
        if (!mainProduct.includes(signal)) {
            errors.push(`section/main-product.liquid missing expected purchase signal: ${signal}`);
        }
    }

    if (/quick-order/i.test(mainProduct) && !mainProduct.includes('product-form')) {
        errors.push('main-product appears to use quick-order without normal product-form support.');
    }
}

if (errors.length > 0) {
    console.error('Product purchase architecture validation failed.');
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exit(1);
}

console.log('Product purchase architecture validation passed.');