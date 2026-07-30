const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');

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
    {
        name: 'search discovery desired state',
        schemaPath: 'schemas/search-discovery-desired-state.schema.json',
        dataPath: 'data/search-discovery-desired-state.json',
    },
    {
        name: 'metafield and metaobject definitions',
        schemaPath: 'schemas/metafield-metaobject-definitions.schema.json',
        dataPath: 'data/metafield-metaobject-definitions.json',
    },
    {
        name: 'navigation spec',
        schemaPath: 'schemas/navigation-spec.schema.json',
        dataPath: 'data/navigation-spec.json',
    },
    {
        name: 'design token inventory',
        schemaPath: 'schemas/design-token-inventory.schema.json',
        dataPath: 'data/design-token-inventory.json',
    },
    {
        name: 'storefront event contracts',
        schemaPath: 'schemas/storefront-event-contracts.schema.json',
        dataPath: 'data/storefront-event-contracts.json',
    },
    {
        name: 'stock asset ledger',
        schemaPath: 'schemas/stock-asset-ledger.schema.json',
        dataPath: 'data/stock-asset-ledger.json',
    },
    {
        name: 'media manifest',
        schemaPath: 'schemas/media-manifest.schema.json',
        dataPath: 'data/media-manifest.json',
    },
    {
        name: 'stock Trade remnants',
        schemaPath: 'schemas/stock-trade-remnants.schema.json',
        dataPath: 'data/stock-trade-remnants.json',
    },
    {
        name: 'hardcoded string allowlist',
        schemaPath: 'schemas/hardcoded-string-allowlist.schema.json',
        dataPath: 'data/hardcoded-string-allowlist.json',
    },
].filter((target) => fs.existsSync(path.join(ROOT, target.schemaPath)) || fs.existsSync(path.join(ROOT, target.dataPath)));

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
});
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