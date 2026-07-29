const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

const ROOT = process.cwd();

const targets = [
    {
        name: 'admin dependency register',
        schemaPath: 'schemas/admin-dependency-register.schema.json',
        dataPath: 'docs/admin/admin-dependency-register.json',
    },
    {
        name: 'storefront fixtures',
        schemaPath: 'schemas/storefront-fixtures.schema.json',
        dataPath: 'tests/fixtures/storefront-fixtures.json',
    },
    {
        name: 'product data rules',
        schemaPath: 'schemas/product-data-rules.schema.json',
        dataPath: 'data/product-data-rules.json',
    },
    {
        name: 'collection filter spec',
        schemaPath: 'schemas/collection-filter-spec.schema.json',
        dataPath: 'data/collection-filter-spec.json',
    },
].filter((target) => fs.existsSync(path.join(ROOT, target.schemaPath)) || fs.existsSync(path.join(ROOT, target.dataPath)));

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

const ajv = new Ajv({ allErrors: true });
let failed = false;

for (const target of targets) {
    const schemaExists = fs.existsSync(path.join(ROOT, target.schemaPath));
    const dataExists = fs.existsSync(path.join(ROOT, target.dataPath));

    if (!schemaExists || !dataExists) {
        console.error(`${target.name}: missing ${schemaExists ? target.dataPath : target.schemaPath}`);
        failed = true;
        continue;
    }

    const schema = readJson(target.schemaPath);
    const data = readJson(target.dataPath);
    const validate = ajv.compile(schema);

    if (!validate(data)) {
        console.error(`${target.name}: invalid`);
        console.error(validate.errors);
        failed = true;
        continue;
    }

    console.log(`${target.name}: valid`);
}

if (failed) {
    process.exit(1);
}