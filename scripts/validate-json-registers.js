const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = process.cwd();

const targets = [
    ...[
        'epic-e-batch-3b-contracts', 'epic-e-relationship-matrix',
        'epic-e-measurement-evidence', 'epic-e-component-evidence',
        'epic-e-resource-catalog', 'epic-e-technical-field-evidence',
        'epic-e-batch-3b-decision-packet', 'epic-e-batch-3b-extracted-evidence',
    ].map(name => ({ name, schemaPath: `schemas/${name}.schema.json`, dataPath: `data/${name}.json` })),
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
        name: 'homepage section outcomes',
        schemaPath: 'schemas/homepage-section-outcomes.schema.json',
        dataPath: 'data/homepage-section-outcomes.json',
    },
    {
        name: 'homepage content claims map',
        schemaPath: 'schemas/homepage-content-claims-map.schema.json',
        dataPath: 'data/homepage-content-claims-map.json',
    },
    {
        name: 'global navigation IA',
        schemaPath: 'schemas/global-navigation-ia.schema.json',
        dataPath: 'data/global-navigation-ia.json',
    },
    {
        name: 'footer support resources',
        schemaPath: 'schemas/footer-support-resources.schema.json',
        dataPath: 'data/footer-support-resources.json',
    },
    {
        name: 'localization market decision',
        schemaPath: 'schemas/localization-market-decision.schema.json',
        dataPath: 'data/localization-market-decision.json',
    },
    {
        name: 'Epic C navigation measurement plan',
        schemaPath: 'schemas/epic-c-navigation-measurement-plan.schema.json',
        dataPath: 'data/epic-c-navigation-measurement-plan.json',
    },
    {
        name: 'Epic D homepage measurement plan',
        schemaPath: 'schemas/epic-d-homepage-measurement-plan.schema.json',
        dataPath: 'data/epic-d-homepage-measurement-plan.json',
    },
    {
        name: 'Epic D homepage NFR readiness',
        schemaPath: 'schemas/epic-d-homepage-nfr-readiness.schema.json',
        dataPath: 'data/epic-d-homepage-nfr-readiness.json',
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
    {
        name: 'theme environments',
        schemaPath: 'schemas/theme-environments.schema.json',
        dataPath: 'data/theme-environments.json',
    },
    {
        name: 'launch fixture ownership',
        schemaPath: 'schemas/launch-fixture-ownership.schema.json',
        dataPath: 'data/launch-fixture-ownership.json',
    },
    {
        name: 'release risk register',
        schemaPath: 'schemas/release-risk-register.schema.json',
        dataPath: 'data/release-risk-register.json',
    },
    {
        name: 'Epic E source governance',
        schemaPath: 'schemas/epic-e-source-governance.schema.json',
        dataPath: 'data/epic-e-source-governance.json',
    },
    {
        name: 'Epic E technical source index',
        schemaPath: 'schemas/epic-e-technical-source-index.schema.json',
        dataPath: 'data/epic-e-technical-source-index.json',
    },
    {
        name: 'Epic E gap and conflict register',
        schemaPath: 'schemas/epic-e-gap-conflict-register.schema.json',
        dataPath: 'data/epic-e-gap-conflict-register.json',
    },
    {
        name: 'Epic E Admin mutation-plan template',
        schemaPath: 'schemas/epic-e-admin-mutation-plan.schema.json',
        dataPath: 'data/epic-e-admin-mutation-plan-template.json',
    },
    {
        name: 'Epic E product classification',
        schemaPath: 'schemas/epic-e-product-classification.schema.json',
        dataPath: 'data/epic-e-product-classification.json',
    },
    {
        name: 'Epic E product identity',
        schemaPath: 'schemas/epic-e-product-identity.schema.json',
        dataPath: 'data/epic-e-product-identity.json',
    },
    {
        name: 'Rhino commerce SKU registry',
        schemaPath: 'schemas/rhino-commerce-sku-registry.schema.json',
        dataPath: 'data/rhino-commerce-sku-registry.json',
    },
    {
        name: 'Epic E commercial configuration candidates',
        schemaPath: 'schemas/epic-e-commercial-configuration-candidates.schema.json',
        dataPath: 'data/epic-e-commercial-configuration-candidates.json',
    },
    {
        name: 'Epic E Product Owner decisions',
        schemaPath: 'schemas/epic-e-product-owner-decisions.schema.json',
        dataPath: 'data/epic-e-product-owner-decisions.json',
    },
    {
        name: 'Epic E conflict reference index',
        schemaPath: 'schemas/epic-e-conflict-reference-index.schema.json',
        dataPath: 'data/epic-e-conflict-reference-index.json',
    },
    {
        name: 'Epic E Vendor semantic audit',
        schemaPath: 'schemas/epic-e-vendor-semantic-audit.schema.json',
        dataPath: 'data/epic-e-vendor-semantic-audit.json',
    },
    {
        name: 'Epic E variant architecture',
        schemaPath: 'schemas/epic-e-variant-architecture.schema.json',
        dataPath: 'data/epic-e-variant-architecture.json',
    },
    {
        name: 'Epic E custom-data definition diff',
        schemaPath: 'schemas/epic-e-custom-data-definition-diff.schema.json',
        dataPath: 'data/epic-e-custom-data-definition-diff.json',
    },
].filter((target) => fs.existsSync(path.join(ROOT, target.schemaPath)) || fs.existsSync(path.join(ROOT, target.dataPath)));

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    formats: {
        date: /^\d{4}-\d{2}-\d{2}$/,
        'date-time': (value) => !Number.isNaN(Date.parse(value)),
        uri: (value) => {
            try {
                new URL(value);
                return true;
            } catch {
                return false;
            }
        },
    },
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
