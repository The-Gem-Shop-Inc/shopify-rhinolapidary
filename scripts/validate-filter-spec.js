const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const filterSpec = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/collection-filter-spec.json'), 'utf8'));
const adminRegister = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/admin/admin-dependency-register.json'), 'utf8'));

const adminIds = new Set(adminRegister.dependencies.map((dependency) => dependency.id));
const errors = [];

const ids = new Set();

for (const filter of filterSpec.filters) {
    if (ids.has(filter.id)) {
        errors.push(`Duplicate filter id: ${filter.id}`);
    }
    ids.add(filter.id);

    if (!adminIds.has(filter.adminDependency)) {
        errors.push(`${filter.id}: adminDependency ${filter.adminDependency} not found in admin dependency register`);
    }

    if (filter.customerFacing && filter.source === 'tag') {
        errors.push(`${filter.id}: customer-facing filters must not use tags as their primary source`);
    }

    if (['product-metafield', 'variant-metafield'].includes(filter.source)) {
        if (!filter.namespace || !filter.key) {
            errors.push(`${filter.id}: metafield filters require namespace and key`);
        }
    }

    if (filter.source === 'variant-option' && !filter.optionName) {
        errors.push(`${filter.id}: variant-option filters require optionName`);
    }
}

if (!filterSpec.filters.some((filter) => filter.id === 'availability' && filter.requiredForLaunch)) {
    errors.push('Launch filter set must include required availability filter');
}

if (!filterSpec.filters.some((filter) => filter.id === 'price' && filter.requiredForLaunch)) {
    errors.push('Launch filter set must include required price filter');
}

if (errors.length > 0) {
    console.error('Filter spec validation failed.');
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exit(1);
}

console.log(`Filter spec validation passed for ${filterSpec.filters.length} filters.`);