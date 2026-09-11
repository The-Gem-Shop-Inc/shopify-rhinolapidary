const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');

const root = process.cwd();
const relativePath = process.argv[2] || 'docs/qa/evidence/epic-e/2026-09-03-epic-e-admin-snapshot.json';
const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas/epic-e-admin-snapshot.schema.json'), 'utf8'));
const snapshot = JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
const validate = new Ajv2020({ allErrors: true, strict: false, formats: { 'date-time': true } }).compile(schema);
const errors = [];

if (!validate(snapshot)) errors.push(...(validate.errors || []).map((error) => `${error.instancePath} ${error.message}`));
for (const [name, dataset] of Object.entries(snapshot.datasets)) {
  const definitionDataset = name.endsWith('MetafieldDefinitions') || name === 'metaobjectDefinitions';
  if (dataset.queryStatus === 'not_queried' && dataset.resultState !== 'not_queried') errors.push(`${name}: not_queried query must retain not_queried result`);
  if (dataset.queryStatus === 'success' && dataset.recordCount !== dataset.records.length) errors.push(`${name}: recordCount does not match records`);
  if (definitionDataset && dataset.queryStatus === 'success' && dataset.recordCount === 0 && dataset.resultState !== 'zero_definitions') errors.push(`${name}: empty successful definition query must say zero_definitions`);
  if (dataset.queryStatus === 'inaccessible_scope' && dataset.resultState !== 'inaccessible_scope') errors.push(`${name}: inaccessible query/result states disagree`);
  if (dataset.queryStatus === 'query_failure' && dataset.resultState !== 'query_failure') errors.push(`${name}: failed query/result states disagree`);
}
if (!snapshot.readOnly || !snapshot.redacted) errors.push('snapshot must be read-only and redacted');
if (/X-Shopify-Access-Token|shpat_|accessToken/i.test(JSON.stringify(snapshot))) errors.push('snapshot failed credential redaction guard');

if (errors.length) {
  console.error(`Epic E Admin snapshot validation failed for ${relativePath}.`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Epic E Admin snapshot validation passed for ${relativePath}: ${snapshot.sourceKind}, ${Object.keys(snapshot.datasets).length} dataset states.`);
