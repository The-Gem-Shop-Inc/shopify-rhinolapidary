'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),Ajv=require('ajv/dist/2020');
const R=require('./lib/epic-f-owner-review');
function validate(review=R.read('data/epic-f-006b-owner-value-review.json')) {
  const ajv=new Ajv({strict:false,allErrors:true}),check=ajv.compile(R.read('schemas/epic-f-owner-value-review.schema.json'));
  assert(check(review),JSON.stringify(check.errors));
  const ids=new Set(require('../data/epic-e-product-identity.json').productIdentities.map(p=>p.productGid)),expected=R.read(R.DIR+'/media-current.json').products;
  assert.equal(new Set(review.machines.map(m=>m.productGid)).size,11);
  assert.deepEqual(review.machines.map(m=>m.productGid).sort(),expected.map(p=>p.id).sort());
  const sourceIds=new Set(review.sources.map(s=>s.sourceId)),conflictIds=new Set(require('../data/epic-e-conflict-reference-index.json').conflicts.map(c=>c.conflictId));
  assert.equal(new Set(review.rows.map(r=>r.rowId)).size,review.rows.length);
  assert.equal(new Set(review.rows.map(r=>r.productGid+'|'+r.fieldKey)).size,review.rows.length);
  for(const input of review.inputs)assert.equal(R.hash(input.path),input.sha256,'Historical input changed: '+input.path);
  for(const row of review.rows) {
    assert(ids.has(row.productGid));assert(review.machines.some(m=>m.productGid===row.productGid&&m.label===row.productDiagnosticLabel));
    const field=R.field(row.fieldKey),definition=R.definition(row.fieldKey),domain=R.owningDomain(row.fieldKey);
    assert(field&&definition&&domain);assert.equal(row.canonicalType,definition.type);assert.equal(row.canonicalUnit,field.unit);assert.equal(row.physicalState,field.physicalState);
    assert.equal(row.customerReadable,definition.accessIntent.storefront==='public_read');assert.equal(row.planId,'E-MUT-'+String(domain.code).padStart(3,'0'));assert.equal(row.domain,domain.key);
    assert.equal(row.decisionId,domain.code<30?'B3B-D03':'B3B-D05');
    assert(row.sourceIds.every(s=>sourceIds.has(s)));assert(row.conflictIds.every(c=>conflictIds.has(c)));
    assert.equal(new Set(row.candidateValues.map(c=>c.candidateId)).size,row.candidateValues.length);
    assert(row.candidateValues.every(c=>sourceIds.has(c.sourceId)&&row.sourceIds.includes(c.sourceId)&&c.sourceLocation));
    for(const option of ['APPROVE_CANDIDATE','CORRECT_VALUE','NOT_APPLICABLE','UNKNOWN_DEFER'])assert(row.decisionOptions.includes(option));
    if(row.decisionState==='PENDING_OWNER'){assert.equal(row.reviewerResponse.action,null);assert.equal(row.currentOwnerDecision,null);assert.equal(row.reviewedAt,null);assert.equal(row.reviewerRole,null);}
    if(row.decisionState==='NOT_APPLICABLE')assert.equal(row.sourceState,'NOT_APPLICABLE');
    if(row.decisionState==='UNKNOWN_DEFER'){assert.equal(row.reviewerResponse.action,'UNKNOWN_DEFER');assert.equal(row.reviewerResponse.canonicalValue,null);}
    if(row.decisionState==='OWNER_CONFIRMED'){assert.equal(row.currentOwnerDecision,row.reviewerResponse.action);assert.equal(row.reviewedAt,row.reviewerResponse.reviewedAt);assert.deepEqual(row.reviewerRole,row.reviewerResponse.reviewerRole);R.approvedRow(row);}
    if(row.fieldKey.startsWith('crate_'))assert.equal(row.customerReadable,false);
  }
  for(const r of review.conditionalNotRequested){assert(ids.has(r.productGid));assert(R.field(r.fieldKey));assert(!review.rows.some(row=>row.productGid===r.productGid&&row.fieldKey===r.fieldKey));}
  const projections=R.migrationProjection(review.rows);assert(projections.every(p=>!p.executable&&p.executionReadyRowCount===0));
  if(review.rows.every(r=>r.decisionState!=='OWNER_CONFIRMED'))assert.deepEqual(R.read('data/epic-f-006b-migration-preview.json').plans,projections,'Persisted migration counts/rows differ');
  for(const [lane,name,schema] of [['007B','bom','bom'],['008B','compatibility','compatibility']]) {
    const file='data/epic-f-'+(lane==='007B'?'007b-bom':'008b-compatibility')+'-owner-review.json',x=R.read(file),valid=ajv.compile(R.read('schemas/epic-f-'+schema+'-owner-review.schema.json'));
    assert(valid(x),JSON.stringify(valid.errors));assert.equal(R.hash(x.source.path),x.source.sha256);
    const original=R.read(x.source.path)[lane==='007B'?'lines':'edges'];assert.equal(x.rows.length,original.length);
    for(let i=0;i<x.rows.length;i++){const row=x.rows[i];for(const [key,value] of Object.entries(original[i]))assert.deepEqual(row[key],value,'Candidate evidence changed '+key);assert(ids.has(row.productGid||row.dependentProductGid));if(row.componentProductGid)assert(ids.has(row.componentProductGid));if(row.targetMachineProductGid)assert(review.machines.some(m=>m.productGid===row.targetMachineProductGid));assert(Object.values(row.reviewerResponse).every(v=>v===null),'Unreviewed parallel row marked answered');}
  }
  return {schema:'passed',exactGids:'passed',fieldDefinitions:'passed',canonicalUnits:'passed',decisionStates:'passed',sourceConflictReferences:'passed',migrationProjection:'passed',technicalRows:review.rows.length,approvedRows:projections.reduce((a,p)=>a+p.rows.length,0)};
}
if(require.main===module)try{console.log(JSON.stringify(validate(process.argv[2]?R.read(process.argv[2]):undefined)));}catch(e){console.error(e.message);process.exitCode=1;}
module.exports={validate};
