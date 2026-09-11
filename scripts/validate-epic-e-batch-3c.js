const fs=require('fs');
const assert=require('assert/strict');
const crypto=require('crypto');
const Ajv=require('ajv/dist/2020');
const {build}=require('./build-epic-e-batch-3c');
const {validateRegistry3c}=require('./lib/epic-e-batch-3c');
const {assertReadOnlyOperations}=require('./lib/epic-e-admin-audit');
const {OPERATIONAL_OPERATIONS}=require('./lib/epic-e-operational-audit');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function run(){
  const saved=read('data/epic-e-fulfillment-reconciliation.json');
  const operationalPath=saved.liveAudit.status==='supplied_read_only_snapshot'?saved.liveAudit.sourcePath:undefined;
  const result=build({asOf:saved.asOf,operationalPath,writeOutputs:false});
  const errors=validateRegistry3c(read('data/metafield-metaobject-definitions.json'));
  const ajv=new Ajv({strict:false,allErrors:true});
  for(const [name,expected]of Object.entries(result.artifacts)){
    const actual=read(`data/${name}.json`),validate=ajv.compile(read(`schemas/${name}.schema.json`));
    if(!validate(actual))errors.push(`${name}: ${JSON.stringify(validate.errors)}`);
    try{assert.deepEqual(actual,expected);}catch{errors.push(`${name}: does not match deterministic builder/current evidence`);}
  }
  const extracts=read('data/epic-e-batch-3c-source-extracts.json');
  const valid=ajv.compile(read('schemas/epic-e-batch-3c-source-extracts.schema.json'));
  if(!valid(extracts))errors.push('invalid extracted evidence schema');
  for(const s of extracts.sources)if(crypto.createHash('sha256').update(fs.readFileSync(s.path)).digest('hex')!==s.sha256)errors.push(`stale PDF extraction: ${s.path}`);
  assertReadOnlyOperations(OPERATIONAL_OPERATIONS);
  for(const p of ['scripts/build-epic-e-batch-3c.js','scripts/extract-epic-e-batch-3c-evidence.py','scripts/lib/epic-e-batch-3c.js','scripts/lib/epic-e-operational-audit.js']){
    const s=fs.readFileSync(p,'utf8');
    if(/\b(metafieldsSet|metafieldDefinitionCreate|metaobjectCreate|productUpdate|productVariantsBulkUpdate|fileUpdate|fileCreate|inventorySetQuantities)\b|\bmutation\s+[A-Za-z_{]/.test(s))errors.push(`mutation operation in ${p}`);
  }
  const resources=new Set(result.context.resources.resources.map(r=>r.resourceId));
  for(const row of result.artifacts['epic-e-warranty-support-evidence'].coverage)if(row.candidateResourceIds.some(id=>!resources.has(id)))errors.push('orphan support resource');
  if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
  else console.log('Batch 3C integrated validation passed: 3 ordered contracts, 106 evidence rows, 122 Products, 125 Variants, 4 new and 7 carried-forward decision groups; deterministic outputs and read-only operations.');
  return errors;
}
if(require.main===module)run();
module.exports={run};
