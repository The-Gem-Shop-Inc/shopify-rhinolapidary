const fs=require('fs');
const crypto=require('crypto');
const Ajv=require('ajv/dist/2020');
const {validateBatch}=require('./lib/epic-e-batch-3b-validation');
const paths={contract:'data/epic-e-batch-3b-contracts.json',matrix:'data/epic-e-relationship-matrix.json',measurement:'data/epic-e-measurement-evidence.json',components:'data/epic-e-component-evidence.json',resources:'data/epic-e-resource-catalog.json',technical:'data/epic-e-technical-field-evidence.json',packet:'data/epic-e-batch-3b-decision-packet.json'};
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
function load(){
  const data=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,read(p)]));
  const registry=read('data/metafield-metaobject-definitions.json');
  const context={registry,classification:read('data/epic-e-product-classification.json'),identity:read('data/epic-e-product-identity.json'),variantArchitecture:read('data/epic-e-variant-architecture.json'),corpus:read('data/epic-e-technical-source-index.json'),snapshot:read(registry.adminReconciliation.snapshotPath),approvals:[],productionSourceTexts:['scripts/build-epic-e-batch-3b.js','scripts/extract-epic-e-batch-3b-evidence.py','scripts/lib/epic-e-batch-3b-fields.js','scripts/build-epic-e-custom-data-definition-diff.js'].map(p=>fs.readFileSync(p,'utf8'))};
  context.extracted=read('data/epic-e-batch-3b-extracted-evidence.json');
  return {data,context};
}
function run(){
  const {data,context}=load(),errors=[];
  const ajv=new Ajv({strict:false,allErrors:true});
  for(const [key,path] of Object.entries(paths)){
    const schema=read(path.replace('data/','schemas/').replace('.json','.schema.json'));
    const validate=ajv.compile(schema);
    if(!validate(data[key]))errors.push(...validate.errors.map(e=>`${key}${e.instancePath}: ${e.message}`));
    for(const input of data[key].inputs){
      const current=crypto.createHash('sha256').update(fs.readFileSync(input.path)).digest('hex');
      if(current!==input.sha256)errors.push(`${key}: stale input ${input.path}`);
    }
  }
  const extraction=read('data/epic-e-batch-3b-extracted-evidence.json');
  const validateExtraction=ajv.compile(read('schemas/epic-e-batch-3b-extracted-evidence.schema.json'));
  if(!validateExtraction(extraction))errors.push(...validateExtraction.errors.map(e=>`extraction${e.instancePath}: ${e.message}`));
  for(const [property,path] of [['sourceIndexSha256','data/epic-e-technical-source-index.json'],['csvSha256','data/product-export/products.csv']])if(extraction[property]!==crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex'))errors.push('Stale extracted evidence: '+path);
  errors.push(...validateBatch(data,context));
  if(errors.length){console.error(errors.map(e=>'- '+e).join('\n'));process.exitCode=1;}
  else console.log(`Batch 3B integrated validation passed: ${data.contract.fields.length} fields, ${data.matrix.coverage.length} dependent Products, ${data.matrix.edges.length} unapproved edges, ${data.resources.resources.length} resources; no mutations.`);
  return errors;
}
if(require.main===module)run();
module.exports={load,paths,run};
