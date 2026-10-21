'use strict';
// Epic E owns factual approval. No browser values, descriptions or F booleans
// can manufacture a row accepted by this adapter.
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const registry=require('../../data/metafield-metaobject-definitions.json');
const contract=require('../../data/epic-e-batch-3b-contracts.json');
const {domains}=require('./epic-e-migration-domains');
const SOURCE='docs/project/completed-worksheet-decisions-transcribed.md';
const DIR='docs/qa/evidence/epic-f/owner-response-activation-2026-10-13';
const RESPONSES='data/epic-e-completed-owner-responses.json';
const RECEIPT=DIR+'/reconciliation.json';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const canonical=v=>v===null||typeof v!=='object'?JSON.stringify(v):Array.isArray(v)?'['+v.map(canonical).join(',')+']':'{'+Object.keys(v).filter(k=>v[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';
const digest=v=>hash(canonical(v??null));
const models={
 'BeadMaster 6':'8905779937477','EM-1':'8905780756677','JadeMaster 14':'8905781248197','LapMaster 12':'8905781412037','LapMaster 18':'8905781477573','SawMaster 18':'8905784131781','SawMaster 24':'8905784197317','SawMaster 36':'8905784262853','ShapeMaster 6':'8905784328389','TrimMaster 8':'8905785344197','TumbleMaster':'8905785868485'};
const gid=m=>'gid://shopify/Product/'+models[m];
const field=k=>contract.fields.find(f=>f.key===k);
const definition=k=>registry.metafields.find(f=>f.ownerType==='PRODUCT'&&f.namespace==='rhino'&&f.key===k);
function prepare(text=fs.readFileSync(SOURCE,'utf8')) {
 const identity=require('../../data/epic-e-product-identity.json').productIdentities, matrix=require('../../data/epic-e-relationship-matrix.json'),bom=require('../../data/epic-e-component-evidence.json');
 const rows=[],holds=[],ownerAssertions=[],resolvedEdges=[];
 const sourceHash=hash(text),lineFor=m=>text.split(/\r?\n/).find(l=>l.startsWith('- '+m+':'));
 function add(model,key,value,line,meta={}) {
  const d=field(key),ownerGid=gid(model),owning=domains.find(d=>d.fieldAllowlist.includes('PRODUCT.metafields.rhino.'+key));
  assert(identity.some(p=>p.productGid===ownerGid));assert(d&&owning&&definition(key));
  const typed=d.type==='single_line_text_field'||['json','list.product_reference'].includes(d.type)?value:d.type.startsWith('list.')?value.map(v=>({value:v,unit:d.unit})):{value,unit:d.unit};
  rows.push({rowId:'TEAM:'+ownerGid.split('/').pop()+':'+key,kind:'value',targetGid:ownerGid,domain:owning.key,planId:'E-MUT-'+String(owning.code).padStart(3,'0'),field:'PRODUCT.metafields.rhino.'+key,type:d.type,desired:typed,valueState:'approved',approvalDecisionId:'TEAM-WORKSHEET:'+sourceHash,conflictIds:[],resolvedConflictIds:meta.conflictIds||[],ownerDecisionId:owning.decisionIds[0],sourceExcerpt:line,
    provenance:{sourceId:'completed-team-worksheet-transcription',sourceValue:d.type==='single_line_text_field'||['json','list.product_reference'].includes(d.type)?typed:Array.isArray(typed)?typed.map(v=>String(v.value)):String(typed.value),sourceUnit:d.unit,physicalState:d.physicalState,configurationId:'CURRENT_PRODUCT:'+ownerGid,configurationLabel:'Current Product configuration',conversionRuleId:null,...meta}});
 }
 for(const model of Object.keys(models)) {
  const line=lineFor(model);if(!line)continue;
  ownerAssertions.push({productGid:gid(model),model,sourceExcerpt:line,sourceState:'COMPLETED_OWNER_TRANSCRIPTION'});
  const v=line.match(/(?:^|[ ;:]\s*)(\d+(?:\.\d+)?) V\b/);if(v)add(model,'input_voltage',Number(v[1]),line);
  const hz=line.match(/\/ (\d+) Hz\b/);if(hz)add(model,'input_frequencies',[Number(hz[1])],line);
  const speed=line.match(/motor speed (\d+) rpm\b/);if(speed)add(model,'motor_speed',Number(speed[1]),line);
  if(model.startsWith('SawMaster')&&!speed){const s=line.match(/; (\d+) rpm\b/);if(s)add(model,'motor_speed',Number(s[1]),line);}
  const hp=line.match(/(?:motor power |; )(\d+(?:\.\d+)?) hp\b/);
  if(hp&&text.includes('Horsepower convention: manufacturer nameplate horsepower.'))add(model,'motor_power',Number(hp[1]),line,{unitQualification:'manufacturer_nameplate'});
  const kw=line.match(/(\d+(?:\.\d+)?) kW\b/);if(kw)holds.push({productGid:gid(model),field:'motor_power',sourceExcerpt:line,reason:'Source approves kW; canonical field is horsepower. No independently approved hp value or conversion.'});
  for(const [pattern,keys]of [[/wheel operating range (\d+)-(\d+) rpm\b/,['wheel_speed_min','wheel_speed_max']],[/flexible-shaft range handwritten (\d+)-(\d+) rpm\b/,['flex_shaft_speed_min','flex_shaft_speed_max']]]){
   const r=line.match(pattern);if(r){assert(Number(r[1])<=Number(r[2]));keys.forEach((k,i)=>add(model,k,Number(r[i+1]),line));}
  }
  for(const [key,re]of [['wheel_diameter',/wheel diameter (\d+(?:\.\d+)?) in\b/],['wheel_arbor_diameter',/wheel arbor (\d+(?:\.\d+)?) in\b/]]){const r=line.match(re);if(r)add(model,key,Number(r[1]),line);}
  if(model.startsWith('SawMaster')){const r=line.match(/(\d+) mm and (\d+) in marked as the same nominal blade size/);if(r)add(model,'blade_diameter_max',Number(r[2]),line,{unitQualification:'owner_confirmed_nominal_equivalence',sourceMetricObservation:r[1]+' mm'});}
 }
 const em=lineFor('EM-1');
 for(const [key,reason]of [['motor_speed','<=5000 rpm is a bound, not an exact rated primary-motor scalar'],['input_frequencies','Frequency was not definitively answered'],['water_reservoir_capacity','3.5 gal has no confirmed US gallon convention'],['water_system_type','Filtration and adjustable outlets do not directly prove recirculating_filtered semantics']])holds.push({productGid:gid('EM-1'),field:key,sourceExcerpt:em,reason});
 for(const [model,key,reason]of [['LapMaster 18','net_weight','105 lb NET assertion retained; fluid fill and installed-accessory measurement conditions required by the field remain unanswered'],['SawMaster 36','assembled_dimensions','72 in corrects the first printed dimension; length/width/height axes and assembled inclusions remain unconfirmed']])holds.push({productGid:gid(model),field:key,sourceExcerpt:text.split(/\r?\n/).find(l=>l.startsWith('- '+model+' '+(key==='net_weight'?'net weight':'assembled'))),reason});
 assert(text.includes('All 38 non-blocked compatibility relationships in the prior worksheet were marked Approve.'));
 assert(text.includes('one physical clamp fits both SawMaster 18 and SawMaster 24'));
 const eligible=matrix.edges.filter(e=>e.state==='proposed'||e.dependentProductGid==='gid://shopify/Product/8905779871941');assert.equal(eligible.length,40);
 for(const e of eligible)resolvedEdges.push({...e,state:'approved',approvalDecisionId:'TEAM-WORKSHEET:'+sourceHash,identityResolved:e.dependentProductGid==='gid://shopify/Product/8905779871941'?'PO-E-012_ONE_CURRENT_PHYSICAL_CLAMP':null});
 for(const dependent of [...new Set(eligible.map(e=>e.dependentProductGid))].sort()) {
  const selected=eligible.filter(e=>e.dependentProductGid===dependent),key='compatible_machines',d=definition(key);
  rows.push({rowId:'TEAM:'+dependent.split('/').pop()+':'+key,kind:'value',targetGid:dependent,domain:'compatibility',planId:'E-MUT-034',field:'PRODUCT.metafields.rhino.'+key,type:d.type,desired:selected.map(e=>e.targetMachineProductGid).sort(),valueState:'approved',approvalDecisionId:'TEAM-WORKSHEET:'+sourceHash,conflictIds:[],resolvedConflictIds:dependent==='gid://shopify/Product/8905779871941'?['PO-E-012']:[],ownerDecisionId:'B3B-D02',sourceExcerpt:'All 38 non-blocked relationships approved; one physical feed clamp fits both SawMaster 18/24',edgeIds:selected.map(e=>e.edgeId)});
 }
 holds.push(...matrix.edges.filter(e=>e.dependentProductGid==='gid://shopify/Product/8905784099013').map(e=>({edgeId:e.edgeId,productGid:e.dependentProductGid,field:'compatible_machines',reason:'PO-E-013: physically different sets; combined current Product lacks one exact machine identity'})));
 assert(text.includes('Moss filtration pads explicitly annotated quantity 2.'));
 const moss=bom.lines.find(l=>l.lineId==='EM1-17');assert.equal(moss.productGid,gid('EM-1'));assert.equal(moss.componentProductGid,null);
 add('EM-1','noncatalog_components',[{label:moss.label,quantity:2,meaning:'included'}],'Moss filtration pads explicitly annotated quantity 2.');
 const contents=bom.lines.filter(l=>l.productGid===gid('EM-1')).map(l=>({...l,ownerMeaning:'included',ownerQuantity:l.lineId===moss.lineId?2:null,ownerComponentProductGid:l.lineId==='EM1-01'?'gid://shopify/Product/8905778430149':l.componentProductGid,sourceState:'OWNER_INCLUDED_QUANTITY_PENDING'}));
 assert(identity.some(p=>p.productGid==='gid://shopify/Product/8905778430149'&&p.handle==='bonded-diamond-wheel-80'));
 for(const l of contents.filter(l=>l.ownerQuantity===null))holds.push({productGid:l.productGid,lineId:l.lineId,field:l.ownerComponentProductGid?'included_products/included_quantities':'noncatalog_components',reason:'Inclusion confirmed; positive quantity is not explicitly confirmed. Prior checklist numerals are not promoted from inclusion alone.'});
 return {schemaVersion:1,authority:'COMPLETED_TEAM_WORKSHEET_ACCEPTED_IN_AUTHORIZED_DEVELOPMENT_TASK',source:{path:SOURCE,sha256:sourceHash},approvalMode:'delegated_development_override',rows:rows.sort((a,b)=>a.planId.localeCompare(b.planId)||a.rowId.localeCompare(b.rowId)),holds,ownerAssertions,contents,resolvedCompatibilityEdges:resolvedEdges,
  resourceOwnerEvidence:{canonicalDuplicateChoices:['LapMaster 12.pdf','LapMaster 18.pdf','BeadMaster.pdf','TrimMaster.pdf'],equivalentVideoPairs:[['003','004'],['017','018']],publicationApproved:false,languageApproved:false,currentVersionApproved:false,customerActivation:false},gritHandoff:{standard:'CAMI',numberConvention:'Manufacturer printed grit number',mixedGritPolicy:'Every included grit value',valueExecution:false,reason:'Existing deferred abrasive attribute contract requires later separately governed architecture; no current approved grit Product definition.'}};
}
function validateResponses(input=read(RESPONSES)) {
 assert.deepEqual(input,prepare(),'Owner-response rows differ from exact deterministic transcription decisions');
 assert.equal(hash(fs.readFileSync(input.source.path)),input.source.sha256);
 const identities=require('../../data/epic-e-product-identity.json').productIdentities;
 const seen=new Set();for(const r of input.rows){assert(!seen.has(r.rowId));seen.add(r.rowId);assert(identities.some(p=>p.productGid===r.targetGid));const key=r.field.split('.').pop(),d=definition(key),dom=domains.find(d=>d.key===r.domain);assert(d&&dom.fieldAllowlist.includes(r.field));assert.equal(r.type,d.type);assert.deepEqual(r.conflictIds,[]);
  if(r.type==='list.product_reference')assert(Array.isArray(r.desired)&&r.desired.length&&new Set(r.desired).size===r.desired.length&&r.desired.every(g=>identities.some(p=>p.productGid===g)&&g!==r.targetGid));
  if(r.type==='json')assert(Array.isArray(r.desired)&&r.desired.every(l=>Object.keys(l).sort().join(',')==='label,meaning,quantity'&&l.meaning==='included'&&Number.isSafeInteger(l.quantity)&&l.quantity>0));
  if(field(key)?.unit){const values=Array.isArray(r.desired)?r.desired:[r.desired];assert(values.every(v=>Number.isFinite(v.value)&&v.unit===field(key).unit&&(r.type==='rotational_speed'?v.value>=0:v.value>0)));}
 }
 return input;
}
function catalogComplete(snapshot){assert.equal(snapshot.products.length,122);assert.equal(new Set(snapshot.products.map(p=>p.id)).size,122);assert(snapshot.paginationExhausted);for(const p of snapshot.products){function walk(v){if(!v||typeof v!=='object')return;if(v.pageInfo)assert.equal(v.pageInfo.hasNextPage,false);Object.values(v).forEach(walk);}walk(p);}return snapshot;}
function normalizedActual(type,value) {
 // Shopify scalar measurements serialize enum names in uppercase; lists can
 // retain lowercase units. Normalize casing only, never synonyms or quantities.
 if(type==='json'||type==='list.product_reference')return value;
 const measurement=v=>v&&typeof v==='object'&&!Array.isArray(v)&&typeof v.unit==='string'?{...v,unit:v.unit.toLowerCase()}:v;
 return Array.isArray(value)?value.map(measurement):measurement(value);
}
function compareRow(row,product) {assert.equal(product?.id,row.targetGid);const ms=product.metafields.nodes.filter(m=>m.namespace==='rhino'&&m.key===row.field.split('.').pop());assert(ms.length<=1);if(!ms.length)return {state:'ABSENT',metafield:null};const m=ms[0];return {state:m.type===row.type&&isDeepStrictEqual(normalizedActual(m.type,m.jsonValue),row.desired)?'EXACT':'CONFLICT',metafield:m};}
function mutationInput(row,product,approved=validateResponses().rows) {assert(approved.some(r=>isDeepStrictEqual(row,r)),'Unapproved row');const c=compareRow(row,product);assert.notEqual(c.state,'CONFLICT','Never overwrite an unapproved conflicting value');if(c.state==='EXACT')return null;return {ownerId:row.targetGid,namespace:'rhino',key:row.field.split('.').pop(),type:row.type,value:JSON.stringify(row.desired),compareDigest:null};}
function reconcile(before,after,approved=validateResponses().rows) {
 catalogComplete(before);catalogComplete(after);const allowed=new Set(approved.map(r=>r.targetGid+'|'+r.field.split('.').pop())),owners=new Set(approved.map(r=>r.targetGid));
 const clean=p=>{const q=structuredClone(p);if(owners.has(p.id))delete q.updatedAt;q.metafields.nodes=q.metafields.nodes.filter(m=>!allowed.has(p.id+'|'+m.key)||m.namespace!=='rhino');return require('./epic-f-live-machine-activation').protectedComparable(q);};
 assert.deepEqual(before.products.map(clean),after.products.map(clean),'Unexpected protected Product/Variant/media/native field change');
 const rows=approved.map(r=>{const p=after.products.find(p=>p.id===r.targetGid),c=compareRow(r,p);assert.equal(c.state,'EXACT','After-state mismatch '+r.rowId);const prior=compareRow(r,before.products.find(p=>p.id===r.targetGid));assert.notEqual(prior.state,'CONFLICT');if(prior.metafield)assert.equal(prior.metafield.id,c.metafield.id);return {rowId:r.rowId,planId:r.planId,domain:r.domain,targetGid:r.targetGid,field:r.field,desiredDigest:digest(r.desired),metafieldGid:c.metafield.id,type:c.metafield.type,definitionGid:c.metafield.definition.id,identityPreserved:true};});
 return {scope:'BOUNDED_PRODUCT_METAFIELD_RECONCILIATION',rows,protectedProducts:122,protectedVariants:before.products.reduce((n,p)=>n+p.variants.nodes.length,0),unexpectedProtectedChanges:0,wholeAdminStateClaim:false};
}
function loadReconciled(asOf=new Date().toISOString()) {
 if(!fs.existsSync(RECEIPT))return null;
 const input=validateResponses(),receipt=read(RECEIPT);assert.equal(receipt.responseSha256,hash(fs.readFileSync(RESPONSES)));
 for(const ref of [receipt.before,receipt.after,receipt.definitionsBefore,receipt.definitionsAfter,receipt.journal])assert.equal(hash(fs.readFileSync(ref.path)),ref.sha256,'Receipt/source drift '+ref.path);
 assert(Date.parse(asOf)>=Date.parse(receipt.reconciledAt)&&Date.parse(asOf)<Date.parse(receipt.expiresAt),'Reconciliation stale');
 const proof=reconcile(read(receipt.before.path),read(receipt.after.path),input.rows);assert.deepEqual(proof,receipt.proof);
 assert.deepEqual(read(receipt.definitionsBefore.path).response.data.metafieldDefinitions.nodes,read(receipt.definitionsAfter.path).response.data.metafieldDefinitions.nodes);
 const journal=read(receipt.journal.path);assert.equal(journal.failed.length,0);assert.equal(journal.completed.length,input.rows.length);
 assert(input.rows.every(r=>journal.completed.some(j=>j.rowId===r.rowId&&j.desiredDigest===digest(r.desired)&&j.metafieldGid===proof.rows.find(p=>p.rowId===r.rowId).metafieldGid)));
 return {input,receipt,products:read(receipt.after.path).products};
}
function ownerRowApproved(row,responses) {
 try{const verified=validateResponses(responses);const {before,...candidate}=row;return verified.rows.some(r=>isDeepStrictEqual(r,candidate));}catch{return false;}
}
module.exports={SOURCE,DIR,RESPONSES,RECEIPT,read,hash,digest,canonical,prepare,validateResponses,catalogComplete,compareRow,normalizedActual,mutationInput,reconcile,loadReconciled,ownerRowApproved,field,definition};
