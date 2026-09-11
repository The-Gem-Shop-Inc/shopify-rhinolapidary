const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const { sha256, validateDiffSemantics } = require('./lib/epic-e-custom-data-contract');

const root = process.cwd();
const diffPath = process.argv[2] || 'data/epic-e-custom-data-definition-diff.json';
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.resolve(root, relativePath), 'utf8'));
const diff = readJson(diffPath);
const registry = readJson('data/metafield-metaobject-definitions.json');
const snapshot = readJson(registry.adminReconciliation.snapshotPath);
const schema = readJson('schemas/epic-e-custom-data-definition-diff.schema.json');
const ajv = new Ajv2020({ allErrors: true, strict: false, formats: { date: /^\d{4}-\d{2}-\d{2}$/, 'date-time': (value) => !Number.isNaN(Date.parse(value)) } });
const validate = ajv.compile(schema);
const errors = [];
if (!validate(diff)) errors.push(...(validate.errors || []).map((error) => `${error.instancePath} ${error.message}`));
if (diff.registry.sha256 !== sha256(fs.readFileSync(path.join(root, 'data/metafield-metaobject-definitions.json')))) errors.push('diff registry hash is stale');
if (diff.adminSnapshot.sha256 !== sha256(fs.readFileSync(path.join(root, registry.adminReconciliation.snapshotPath)))) errors.push('diff Admin snapshot hash is stale');
errors.push(...validateDiffSemantics(diff, registry, snapshot));

if (errors.length) {
  console.error(`Epic E custom-data definition diff validation failed for ${diffPath}.`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Epic E custom-data definition diff validation passed: ${diff.summary.create} create, ${diff.summary.no_op} no-op, ${diff.summary.conflict + diff.summary.incompatible_type} conflicts, ${diff.summary.unexpected_live_definition} unexpected live, and ${diff.summary.desired_not_approved} deferred/non-approved.`);
