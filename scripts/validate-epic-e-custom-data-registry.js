const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const { sha256, validateRegistrySemantics } = require('./lib/epic-e-custom-data-contract');

const root = process.cwd();
const registryPath = process.argv[2] || 'data/metafield-metaobject-definitions.json';
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
const registry = readJson(registryPath);
const schema = readJson('schemas/metafield-metaobject-definitions.schema.json');
const ajv = new Ajv2020({ allErrors: true, strict: false, formats: { date: /^\d{4}-\d{2}-\d{2}$/, 'date-time': (value) => !Number.isNaN(Date.parse(value)) } });
const validate = ajv.compile(schema);
const errors = [];
if (!validate(registry)) errors.push(...(validate.errors || []).map((error) => `${error.instancePath} ${error.message}`));

const snapshotBytes = fs.readFileSync(path.join(root, registry.adminReconciliation.snapshotPath));
const snapshot = JSON.parse(snapshotBytes);
if (sha256(snapshotBytes) !== registry.adminReconciliation.snapshotSha256) errors.push('registry Admin snapshot SHA-256 does not match the checked-in file');
if (snapshot.capturedAt !== registry.adminReconciliation.capturedAt || snapshot.apiVersion !== registry.adminReconciliation.apiVersion) errors.push('registry Admin snapshot identity does not match the checked-in file');
for (const datasetName of ['productMetafieldDefinitions','variantMetafieldDefinitions','collectionMetafieldDefinitions','metaobjectDefinitions']) {
  const dataset = snapshot.datasets?.[datasetName];
  if (dataset?.queryStatus !== 'success' || dataset?.recordCount !== 0 || dataset?.errorCount !== 0) errors.push(`${datasetName}: expected the dated snapshot's successful zero-definition observation`);
}
errors.push(...validateRegistrySemantics(registry, {
  classification: readJson('data/epic-e-product-classification.json'),
  filters: readJson('data/collection-filter-spec.json'),
  sourceGovernance: readJson('data/epic-e-source-governance.json'),
  productRules: readJson('data/product-data-rules.json'),
  productionSourceTexts: [fs.readFileSync(path.join(root, 'scripts/build-epic-e-custom-data-definition-diff.js'), 'utf8')]
}));

if (errors.length) {
  console.error(`Epic E custom-data registry validation failed for ${registryPath}.`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Epic E custom-data registry validation passed: ${registry.statistics.metafields} metafields, ${registry.statistics.metaobjects} metaobject, ${registry.statistics.byDecisionState.approved} approved definitions, and no authorized mutation.`);
