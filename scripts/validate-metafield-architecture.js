const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const definitions = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/metafield-metaobject-definitions.json'), 'utf8')
);

const filters = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/collection-filter-spec.json'), 'utf8')
);

const metafieldIds = new Set(
    definitions.metafields.map((field) => `${field.ownerType === 'PRODUCT' ? 'product' : field.ownerType === 'PRODUCTVARIANT' ? 'variant' : field.ownerType.toLowerCase()}:${field.namespace}.${field.key}`)
);

const errors = [];

for (const filter of filters.filters) {
    if (filter.source === 'product-metafield') {
        const id = `product:${filter.namespace}.${filter.key}`;
        if (!metafieldIds.has(id)) {
            errors.push(`Filter "${filter.id}" references missing product metafield ${filter.namespace}.${filter.key}`);
        }
    }

    if (filter.source === 'variant-metafield') {
        const id = `variant:${filter.namespace}.${filter.key}`;
        if (!metafieldIds.has(id)) {
            errors.push(`Filter "${filter.id}" references missing variant metafield ${filter.namespace}.${filter.key}`);
        }
    }
}

for (const field of definitions.metafields) {
    if (field.usedForFiltering) {
        const referenced = filters.filters.some((filter) =>
            filter.namespace === field.namespace &&
            filter.key === field.key &&
            (
                (field.ownerType === 'product' && filter.source === 'product-metafield') ||
                (field.ownerType === 'PRODUCT' && filter.source === 'product-metafield') ||
                (field.ownerType === 'variant' && filter.source === 'variant-metafield') ||
                (field.ownerType === 'PRODUCTVARIANT' && filter.source === 'variant-metafield')
            )
        );

        if (!referenced) {
            errors.push(`Metafield ${field.ownerType}:${field.namespace}.${field.key} is marked usedForFiltering but no filter references it.`);
        }
    }
}

for (const filter of filters.filters) {
    if (!filter.requiredForLaunch || !['product-metafield', 'variant-metafield'].includes(filter.source)) continue;
    const ownerType = filter.source === 'product-metafield' ? 'PRODUCT' : 'PRODUCTVARIANT';
    const definition = definitions.metafields.find((field) => field.ownerType === ownerType && field.namespace === filter.namespace && field.key === filter.key);
    if (definition?.decisionState !== 'approved') errors.push(`Launch filter "${filter.id}" cannot depend on unapproved ${ownerType}:${filter.namespace}.${filter.key}.`);
}

if (errors.length > 0) {
    console.error('Metafield architecture validation failed.');
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exit(1);
}

console.log('Metafield architecture validation passed.');
