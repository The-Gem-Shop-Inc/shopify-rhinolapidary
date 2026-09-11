const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');

const root = process.cwd();
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/epic-e-source-governance.json'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas/epic-e-source-governance.schema.json'), 'utf8'));
const ajv = new Ajv2020({ allErrors: true, strict: false, formats: { date: true } });
const validate = ajv.compile(schema);
const errors = [];

if (!validate(data)) errors.push(...(validate.errors || []).map((error) => `${error.instancePath} ${error.message}`));
const domainNames = data.domains.map((entry) => entry.domain);
if (new Set(domainNames).size !== domainNames.length) errors.push('domain names must be unique');
for (const domain of data.domains) {
  for (const ref of domain.crossReferences) {
    if (!fs.existsSync(path.join(root, ref))) errors.push(`${domain.domain}: missing cross-reference ${ref}`);
  }
}

if (errors.length) {
  console.error('Epic E source governance validation failed.');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log(`Epic E source governance validation passed: ${data.domains.length} domains and ${data.decisionStates.length} shared decision states.`);
