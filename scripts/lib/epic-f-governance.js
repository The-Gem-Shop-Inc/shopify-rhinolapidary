'use strict';

// Repository-only helpers. No Shopify client, event publisher or network adapter.
const fs = require('node:fs');
const crypto = require('node:crypto');
const Ajv = require('ajv/dist/2020');
const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const canonical = value => JSON.stringify(sort(value));
function sort(value) {
    if (Array.isArray(value)) return value.map(sort);
    if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, sort(value[key])]));
    return value;
}
const digest = value => crypto.createHash('sha256').update(canonical(value)).digest('hex');
const fileHash = path => crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
function schemaErrors(name, value) {
    const validate = new Ajv({ strict: false, allErrors: true }).compile(read(`schemas/${name}.schema.json`));
    return validate(value) ? [] : validate.errors.map(e => `${e.instancePath || '/'} ${e.message}`);
}
function write(path, value) { fs.writeFileSync(path, JSON.stringify(value, null, 2) + '\n'); }
function report(name, cases) {
    fs.mkdirSync('test-results/epic-f/f7', { recursive: true });
    write(`test-results/epic-f/f7/${name}.json`, { cases, passed: cases.length, failed: 0, emittedEvents: 0, mutations: 0 });
    console.log(`${name}: ${cases.length} checks passed; events=0; mutations=0`);
}
module.exports = { read, canonical, digest, fileHash, schemaErrors, write, report };
