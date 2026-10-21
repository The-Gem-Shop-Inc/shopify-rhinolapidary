'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const R=require('./lib/epic-f-owner-review'),V=require('./validate-epic-f-owner-review');
const {createFixture}=require('./lib/epic-f-fact-fixtures');
const {projectFacts}=require('./lib/epic-f-facts');
const original=R.read('data/epic-f-006b-owner-value-review.json'),tests=[];
const test=(name,fn)=>{fn();tests.push({name,status:'passed'});};
const fresh=()=>structuredClone(original);
function confirm(row,value,extra={}) {
  const response={...row.reviewerResponse,action:'CORRECT_VALUE',canonicalValue:value,applicabilityConfirmed:true,reviewer:'SIMULATION ONLY',reviewerRole:row.decisionId==='B3B-D03'?['Technical']:['Technical','Operations'],reviewedAt:'2026-10-12T20:00:00.000Z',evidenceRef:'fixture:OWNER_CONFIRMED',sourceId:'fixture:owner-source',configurationId:'fixture:current-config',configurationLabel:'Simulation only',unitQualification:row.canonicalUnit==='horsepower'?'mechanical':row.canonicalUnit==='us_gallons'?'US':null,physicalStateConfirmed:true,conflictsResolved:true,axisMapping:{length:'fixture:x',width:'fixture:y',height:'fixture:z'},includedAssemblies:'SIMULATION: machine only',fluidState:'SIMULATION: dry',packingRevision:'fixture:packing-a',...extra};
  Object.assign(row,{decisionState:'OWNER_CONFIRMED',currentOwnerDecision:response.action,reviewedAt:response.reviewedAt,reviewerRole:response.reviewerRole,reviewerResponse:response});return row;
}
const pick=(x,key,machine='bead')=>x.rows.find(r=>r.rowId===machine+':'+key);
test('three lane schemas and exact source candidates validate',()=>assert.equal(V.validate().approvedRows,0));
test('pending candidate never projects approved rows or customer facts',()=>{assert(R.migrationProjection(original.rows).every(p=>p.rows.length===0));assert(R.renderProjection(original.rows,original.machines).every(p=>p.customerVisibleSpecRows===0));});
test('unknown remains absent',()=>{const x=fresh(),r=pick(x,'input_voltage');r.decisionState='UNKNOWN_DEFER';r.reviewerResponse.action='UNKNOWN_DEFER';assert.equal(V.validate(x).approvedRows,0);});
test('one approved field is independent of every unresolved field',()=>{const x=fresh();confirm(pick(x,'input_voltage'),{value:17,unit:'volts'});assert.equal(V.validate(x).approvedRows,1);assert.equal(R.renderProjection(x.rows,x.machines)[0].customerVisibleSpecRows,1);});
test('schema rejects invented Product GID',()=>{const x=fresh();pick(x,'input_voltage').productGid='gid://shopify/Product/1';assert.throws(()=>V.validate(x));});
test('unit registry mismatch fails',()=>{const x=fresh();pick(x,'input_voltage').canonicalUnit='inches';assert.throws(()=>V.validate(x));});
test('unknown conflict ID fails',()=>{const x=fresh();pick(x,'input_voltage').conflictIds=['C-999'];assert.throws(()=>V.validate(x));});
test('unknown source ID fails',()=>{const x=fresh();pick(x,'input_voltage').sourceIds=['invented'];assert.throws(()=>V.validate(x));});
test('pending row cannot contain an approval response',()=>{const x=fresh();pick(x,'input_voltage').reviewerResponse.action='APPROVE_CANDIDATE';assert.throws(()=>V.validate(x));});
test('unsigned approval fails',()=>{const x=fresh();confirm(pick(x,'input_voltage'),{value:17,unit:'volts'},{reviewer:null});assert.throws(()=>V.validate(x));});
test('delegate cannot replace Technical truth',()=>{const x=fresh();confirm(pick(x,'input_voltage'),{value:17,unit:'volts'},{reviewerRole:['Product Owner']});assert.throws(()=>V.validate(x));});
test('unresolved conflict cannot project',()=>{const x=fresh();confirm(pick(x,'input_voltage'),{value:17,unit:'volts'},{conflictsResolved:false});assert.throws(()=>V.validate(x));});
test('candidate selection requires exact canonical match',()=>{const x=fresh(),r=pick(x,'input_voltage');confirm(r,{value:17,unit:'volts'},{action:'SELECT_CANDIDATE',candidateId:r.candidateValues[0].candidateId});r.currentOwnerDecision='SELECT_CANDIDATE';assert.throws(()=>V.validate(x));});
test('canonical property ordering does not change exact candidate approval',()=>{const x=fresh(),r=pick(x,'input_voltage'),c=r.candidateValues[0];confirm(r,{unit:c.canonicalValue.unit,value:c.canonicalValue.value},{action:'APPROVE_CANDIDATE',candidateId:c.candidateId,sourceId:c.sourceId});r.currentOwnerDecision='APPROVE_CANDIDATE';assert.equal(V.validate(x).approvedRows,1);});
test('kW evidence cannot be approved as hp implicitly',()=>{const x=fresh(),r=pick(x,'motor_power');confirm(r,{value:1,unit:'horsepower'},{action:'APPROVE_CANDIDATE',candidateId:r.candidateValues[0].candidateId});r.currentOwnerDecision='APPROVE_CANDIDATE';assert.throws(()=>V.validate(x));});
test('ambiguous hp standard fails closed',()=>{const x=fresh();confirm(pick(x,'motor_power'),{value:1,unit:'horsepower'},{unitQualification:null});assert.throws(()=>V.validate(x));});
test('ambiguous gallon standard fails closed',()=>{const x=fresh();confirm(pick(x,'water_reservoir_capacity','em'),{value:1,unit:'us_gallons'},{unitQualification:null});assert.throws(()=>V.validate(x));});
test('unsupported water vocabulary rejected',()=>{const x=fresh();confirm(pick(x,'water_system_type','em'),'generic_water');assert.throws(()=>V.validate(x));});
test('range one endpoint never renders',()=>{const x=fresh();confirm(pick(x,'wheel_speed_min','em'),{value:0,unit:'revolutions_per_minute'});assert.equal(R.migrationProjection(x.rows).flatMap(p=>p.rows).length,0);});
test('reversed range never projects',()=>{const x=fresh();confirm(pick(x,'wheel_speed_min','em'),{value:200,unit:'revolutions_per_minute'});confirm(pick(x,'wheel_speed_max','em'),{value:100,unit:'revolutions_per_minute'});assert.equal(R.renderProjection(x.rows,x.machines).find(p=>p.label==='EM-1').customerVisibleSpecRows,0);});
test('different range configuration never projects',()=>{const x=fresh();confirm(pick(x,'wheel_speed_min','em'),{value:0,unit:'revolutions_per_minute'});confirm(pick(x,'wheel_speed_max','em'),{value:100,unit:'revolutions_per_minute'},{configurationId:'fixture:other'});assert.equal(R.migrationProjection(x.rows).flatMap(p=>p.rows).length,0);});
test('paired approved range renders one row',()=>{const x=fresh();confirm(pick(x,'wheel_speed_min','em'),{value:0,unit:'revolutions_per_minute'});confirm(pick(x,'wheel_speed_max','em'),{value:100,unit:'revolutions_per_minute'});assert.equal(R.renderProjection(x.rows,x.machines).find(p=>p.label==='EM-1').customerVisibleSpecRows,1);});
test('measurement missing axis remains blocked',()=>{const x=fresh();confirm(pick(x,'assembled_length'),{value:1,unit:'inches'},{axisMapping:null});assert.throws(()=>V.validate(x));});
test('missing evidence does not establish applicability',()=>{const x=fresh();confirm(pick(x,'blade_diameter_min','em'),{value:1,unit:'inches'},{applicabilityConfirmed:false});assert.throws(()=>V.validate(x));});
test('crate packing revision is required',()=>{const x=fresh();confirm(pick(x,'crate_length'),{value:1,unit:'inches'},{packingRevision:null});assert.throws(()=>V.validate(x));});
test('approved crate stays Admin-only',()=>{const x=fresh();confirm(pick(x,'crate_length'),{value:1,unit:'inches'});const p=R.renderProjection(x.rows,x.machines)[0];assert.equal(p.customerVisibleSpecRows,0);assert.equal(p.adminOnlyRows,1);});
test('actual F consumer allows one synthetic approved electrical row',()=>assert.equal(createFixture('one-key').projection.spec_groups.flatMap(g=>g.rows).length,1));
test('actual F renderer rejects proposed synthetic row',()=>assert.equal(createFixture('one-key',{mutateRows:rs=>rs[0].valueState='proposed'}).projection.spec_groups.length,0));
test('actual F consumer denies crates under current access intent',()=>{const f=createFixture('specifications');for(const d of f.context.registry.metafields.filter(d=>d.key.startsWith('crate_')))d.accessIntent.storefront='none';const p=projectFacts(f.context,f.productGid,f.asOf);assert(!p.spec_groups.some(g=>g.id==='crate_measurements'));});
const simulations=[];
for(const m of original.machines.filter(m=>m.assigned)) {
  const x=fresh();for(const r of x.rows.filter(r=>r.productGid===m.productGid&&r.applicability!=='NOT_APPLICABLE')) {
    const value=r.canonicalType==='single_line_text_field'?'recirculating_filtered':r.canonicalType==='list.frequency'?[{value:47,unit:'hertz'}]:{value:r.fieldKey.endsWith('_min')?(r.canonicalType==='rotational_speed'?0:1):r.canonicalType==='rotational_speed'?97:17,unit:r.canonicalUnit};
    confirm(r,value);
  }
  const p=R.renderProjection(x.rows,[m])[0];simulations.push({productGid:m.productGid,label:m.label,allSelectedCustomerFieldsHypotheticallyConfirmed:p.customerVisibleSpecRows,allSelectedAdminOnlyFieldsHypotheticallyConfirmed:p.adminOnlyRows,simulationOnly:true,valuesPersisted:false});
}
test('simulation reports eight assigned Products and never persists invented values',()=>{assert.equal(simulations.length,8);assert(simulations.every(p=>p.simulationOnly&&p.valuesPersisted===false));});
fs.writeFileSync(R.DIR+'/synthetic-projection-tests.json',JSON.stringify({simulationOnly:true,tests,passed:tests.length,productRowCountScenarios:simulations,allUnknownActualRendering:R.renderProjection(original.rows,original.machines.filter(m=>m.assigned)).map(({productGid,label,customerVisibleSpecRows})=>({productGid,label,customerVisibleSpecRows})),arbitrarySubsetCommand:'node scripts/preview-epic-f-owner-responses.js <reviewed-response-file.json>'},null,2)+'\n');
console.log(JSON.stringify({passed:tests.length,failed:0,simulatedProducts:simulations.length,actualApprovedRows:0}));
