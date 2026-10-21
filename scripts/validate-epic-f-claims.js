'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const Ajv = require('ajv/dist/2020');
const { read, bytes } = require('./lib/epic-f-consumer');
const { collectScannedFiles, stripComments, validateRenderedText } = require('./validate-brand-claims');
const { buildCleanup } = require('./build-epic-f-content-cleanup');

function scanProductSource(file, text) {
  const source = stripComments(text);
  const errors = [];
  if (/\b(?:product|card_product|item|result)(?:\.product)?(?:\.description(?:Html)?|\[['"]description['"]\])/.test(source) && file !== 'snippets/rhino-product-description.liquid') errors.push('Raw Product description bypass in ' + file);
  if (/\bproduct\s*\|\s*structured_data/.test(source) && file !== 'snippets/rhino-product-structured-data.liquid') errors.push('Native Product JSON-LD bypass in ' + file);
  let exactOwnerSource=false;
  const ownerBinding=require('./lib/epic-f-owner-activation-binding');
  if(/metafields(?:\.rhino|\[['"]rhino['"]\])/.test(source)&&ownerBinding.active())try{const b=ownerBinding.verify(),row=b.runtimeDelta.find(r=>r.path===file);exactOwnerSource=!!row&&row.sha256===require('./lib/epic-e-owner-response-adapter').hash(text);}catch{exactOwnerSource=false;}
  if (/metafields(?:\.rhino|\[['"]rhino['"]\])/.test(source)&&!exactOwnerSource) errors.push('F1 has no authorized technical metafield renderer: ' + file);
  if (/(?:product|card_product)\.(?:title|tags|collections|handle|vendor|type)\s*(?:contains|==)\s*['"](?:machine|machines|TrimMaster)/i.test(source)) errors.push('Classification fallback in ' + file);
  if (/tests\/fixtures|epic-f-consumer\.json/.test(source) && /^(?:layout|sections|snippets|templates|config)\//.test(file)) errors.push('Fixture import into theme: ' + file);
  return errors;
}
function run() {
  const errors = [];
  for (const absolute of collectScannedFiles()) {
    const file = require('node:path').relative(process.cwd(), absolute).replaceAll('\\', '/');
    errors.push(...scanProductSource(file, fs.readFileSync(absolute, 'utf8')));
  }
  const artifact = read('data/epic-f-content-cleanup-plan.json');
  const ajv = new Ajv();
  assert(ajv.validate(read('schemas/epic-f-content-cleanup-plan.schema.json'), artifact), JSON.stringify(ajv.errors));
  assert.equal(bytes(artifact), bytes(buildCleanup()), 'Cleanup plan/source drift');
  const fixture = read('tests/fixtures/epic-f-consumer.json');
  for (const text of fixture.customerNarratives) errors.push(...validateRenderedText('future-machine-narrative', text));
  assert.deepEqual(errors, []);
  console.log(`F1 Product source contract valid; ${artifact.rows.length} exact Products in unexecuted cleanup scope. Historical source claims remain unresolved.`);
}
if (require.main === module) run();
module.exports = { scanProductSource, run };
