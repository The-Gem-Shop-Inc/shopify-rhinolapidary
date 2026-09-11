const fs=require('fs'),assert=require('assert/strict');
const Ajv=require('ajv/dist/2020');
const {build,bytes}=require('./build-epic-e-batch-4a');
const {validateGraph,validatePlanBundle,validateReadiness,executionBlockers}=require('./lib/epic-e-readiness');
const {validateMutationPlan}=require('./lib/epic-e-mutation-plan-governance');
function run(){
 const saved=JSON.parse(fs.readFileSync('data/epic-e-admin-readiness.json'));
 const r=build({asOf:saved.asOf,snapshotPath:saved.refreshDisposition==='supplied_read_only_audit'?saved.sourcePath:undefined,writeOutputs:false}),errors=[];
 const requestedPlan=process.argv.find(a=>a.startsWith('--plan='))?.slice(7);
 if(requestedPlan&&!r.plans.some(p=>p.planId===requestedPlan))throw new Error('Unknown bounded plan ID');
 const ajv=new Ajv({allErrors:true,strict:false,formats:{'date-time':true}});
 const schemas=new Map();
 for(const name of ['epic-e-aggregate-gate-contract','epic-e-deferred-review-schedule']){
  const validate=ajv.compile(JSON.parse(fs.readFileSync(`schemas/${name}.schema.json`)));
  if(!validate(JSON.parse(fs.readFileSync(`data/${name}.json`))))errors.push(`${name}: invalid governing input schema`);
 }
 for(const [p,expected]of Object.entries(r.artifacts)){
  if(requestedPlan&&!p.includes(`/epic-e-migration-plans/${requestedPlan}-`))continue;
  if(!fs.existsSync(p)){errors.push('missing artifact '+p);continue;}
  if(fs.readFileSync(p,'utf8')!==(typeof expected==='string'?expected:bytes(expected)))errors.push('stale or modified generated artifact '+p);
  if(typeof expected==='string')continue;
  const name=p.includes('/epic-e-migration-plans/')?(p.endsWith('-input.json')?'epic-e-migration-input':'epic-e-admin-mutation-plan'):p.slice(5,-5);
  const schemaPath=`schemas/${name}.schema.json`;
  if(!schemas.has(name))schemas.set(name,ajv.compile(JSON.parse(fs.readFileSync(schemaPath))));
  const validate=schemas.get(name);if(!validate(expected))errors.push(`${p}: ${JSON.stringify(validate.errors)}`);
 }
 for(let i=0;i<r.plans.length;i++){
  if(requestedPlan&&r.plans[i].planId!==requestedPlan)continue;
  errors.push(...validateMutationPlan(r.plans[i],{asOf:saved.asOf}));
  errors.push(...validatePlanBundle(r.plans[i],r.bundles[i],r.context));
  if(!executionBlockers(r.plans[i],r.bundles[i],r.admin).includes('mutation_unauthorized'))errors.push('execution authorization was silently granted');
 }
 if(!requestedPlan)errors.push(...validateGraph(r.graph),...validateReadiness(r.readiness));
 if(r.handoff.reviewScheduling.waivesApprovals||r.handoff.decisions.some(d=>d.waived||d.currentState!=='blocked'))errors.push('owner unavailability cannot waive decisions');
 if(r.context.classification.mappings.length!==122||r.context.classification.mappings.some(m=>m.classDecisionState!=='approved'))errors.push('122 approved class coverage required');
 if(r.plans.length!==22)errors.push('independent domain plan coverage missing');
 const required=['PO-E-012','PO-E-013','B3B-D02','B3B-D03','B3B-D04','B3B-D05','B3B-D06','B3B-D07','B3C-D01','B3C-D02','B3C-D03','B3C-D04','SKU-ALLOCATIONS'];
 for(const id of required)if(!r.handoff.decisions.some(d=>d.decisionId===id))errors.push('lost deferred decision '+id);
 for(const p of ['scripts/build-epic-e-batch-4a.js','scripts/lib/epic-e-readiness.js','scripts/lib/epic-e-migration-domains.js'])if(/\b(metafieldsSet|metafieldDefinitionCreate|metaobjectCreate|productUpdate|productVariantsBulkUpdate|fileUpdate|inventorySetQuantities)\b|\bmutation\s+(?:[A-Za-z_]\w*\s*(?:\(|\{)|\{)/.test(fs.readFileSync(p,'utf8')))errors.push('mutation operation introduced in '+p);
 if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
 else console.log(`Batch 4A validation passed: ${requestedPlan?1:r.plans.length} independent E-PBI-019 plan(s), ${requestedPlan?'bounded domain checked':r.graph.edges.length+' graph edges and '+r.handoff.decisions.length+' deferred groups checked'}; execution unauthorized.`);
 return {errors,result:r};
}
if(require.main===module)run();
module.exports={run};
