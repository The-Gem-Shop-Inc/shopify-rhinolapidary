const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const templateRules = [
    {
        file: 'templates/product.json',
        requiredMainBlocks: ['title', 'price', 'variant_picker', 'quantity_selector', 'buy_buttons'],
        allowMissingIfAbsent: false,
    },
    {
        file: 'templates/product.machine.json',
        requiredMainBlocks: ['title', 'price'],
        allowMissingIfAbsent: true,
    },
    {
        file: 'templates/product.consumable.json',
        requiredMainBlocks: ['title', 'price', 'variant_picker', 'quantity_selector', 'buy_buttons'],
        allowMissingIfAbsent: true,
    },
    {
        file: 'templates/product.accessory.json',
        requiredMainBlocks: ['title', 'price', 'variant_picker', 'quantity_selector', 'buy_buttons'],
        allowMissingIfAbsent: true,
    },
    {
        file: 'templates/product.replacement-part.json',
        requiredMainBlocks: ['title', 'price', 'variant_picker', 'quantity_selector', 'buy_buttons'],
        allowMissingIfAbsent: true,
    },
];

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf-8'));
}

function getMainSection(template) {
    const mainSection = template.sections?.main;
    if (!mainSection) {
        return null;
    }
    return mainSection;
}

function blockTypes(section) {
    return Object.values(section.blocks || {}).map((block) => block.type);
}

const errors = [];

for (const rule of templateRules) {
    const absolutePath = path.join(ROOT, rule.file);

    if (!fs.existsSync(absolutePath)) {
        if (!rule.allowMissingIfAbsent) {
            errors.push(`${rule.file}: template is required`);
        } else {
            console.log(`${rule.file}: optional template not present`);
        }
        continue;
    }

    const template = readJson(rule.file);
    const main = getMainSection(template);

    if (!main) {
        errors.push(`${rule.file}: missing sections.main`);
        continue;
    }

    const types = blockTypes(main);

    for (const requiredType of rule.requiredMainBlocks) {
        if (!types.includes(requiredType)) {
            errors.push(`${rule.file}: missing main block type "${requiredType}"`);
        }
    }

    if (!Array.isArray(main.block_order)) {
        errors.push(`${rule.file}: sections.main.block_order must be an array`);
    }
}

if (errors.length > 0) {
    console.error('Product template validation failed.');
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exit(1);
}

console.log('Product template validation passed.');