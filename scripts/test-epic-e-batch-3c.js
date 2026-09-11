const assert=require('assert/strict');
const fs=require('fs');
const {build}=require('./build-epic-e-batch-3c');
const {digest,reconcileFulfillment,validateOwnerInputs,validateRegistry3c,resolveLeadTime,resolveAvailability}=require('./lib/epic-e-batch-3c');
const {runAdminAudit,assertReadOnlyOperations}=require('./lib/epic-e-admin-audit');
const {OPERATIONAL_OPERATIONS}=require('./lib/epic-e-operational-audit');
const copy=structuredClone,asOf='2026-09-09T16:14:00.000Z';
const {input:empty,context,base}=build({asOf,writeOutputs:false});
let checks=0;const test=(name,fn)=>{try{fn();checks++;}catch(e){throw new Error(name+': '+e.message);}};
const checkInputs=x=>validateOwnerInputs(x,context,asOf);
function approve(input,kind,subject,roles){const decisionId='fixture-'+input.approvals.length;input.approvals.push({decisionId,kind,subjectId:subject,ownerRoles:roles,decisionState:'approved',sourceIds:['repo-policy-pdf'],approvedAt:asOf});return decisionId;}
const v=base.datasets.variants.records[0],product=context.products.find(p=>p.id===v.product.id),pid='gid://shopify/DeliveryProfile/1';
const success=records=>({queryStatus:'success',resultState:'nonzero',records,recordCount:records.length,pageCount:1,errorCount:0});
function fixture(){
 const input=copy(empty),snapshot=copy(base),profile={id:pid,name:'Fixture',coversAllItems:false,profileLocationGroups:[]};
 input.fulfillmentAssignments.push({assignmentId:'A1',productGid:product.id,fulfillmentClass:'freight',expectedProfileGids:[pid],approvalDecisionId:approve(input,'fulfillment','A1',['Operations','Product Owner'])});
 input.profileCapabilities.push({profileGid:pid,allowedHandlingClasses:['freight'],configurationSha256:digest(profile),approvalDecisionId:approve(input,'profile_capability',pid,['Operations','Admin/Engineering'])});
 snapshot.datasets.variantFulfillment=success([{...v,deliveryProfile:{id:pid},availableForSale:true,product}]);snapshot.datasets.deliveryConfiguration=success([profile]);
 return {input,snapshot,profile};
}
const state=f=>reconcileFulfillment(f.snapshot,base,f.input,asOf).rows.find(r=>r.variantGid===v.id).state;
test('baseline does not infer profile membership',()=>assert.equal(reconcileFulfillment(base,base,empty,asOf).statistics.unassessed,125));
test('approved hash-bound handling aligns',()=>assert.equal(state(fixture()),'aligned'));
for(const [name,mutate,expected]of [
 ['wrong exact profile',f=>f.input.fulfillmentAssignments[0].expectedProfileGids=['gid://shopify/DeliveryProfile/2'],'contradiction'],
 ['handling mismatch',f=>f.input.profileCapabilities[0].allowedHandlingClasses=['parcel'],'contradiction'],
 ['configuration drift',f=>f.profile.name='Changed','unassessed'],
 ['global override',f=>f.profile.coversAllItems=true,'unassessed'],
 ['no approved expectation',f=>f.input.approvals=[],'unassessed'],
 ['missing shippable profile',f=>f.snapshot.datasets.variantFulfillment.records[0].deliveryProfile=null,'missing_profile'],
 ['missing Variant',f=>f.snapshot.datasets.variantFulfillment.records=[],'missing_profile'],
 ['scope failure',f=>f.snapshot.datasets.variantFulfillment.queryStatus='inaccessible_scope','unassessed'],
 ['partial configuration',f=>f.snapshot.datasets.deliveryConfiguration.errorCount=1,'unassessed'],
 ['duplicate membership',f=>f.snapshot.datasets.variantFulfillment.records.push(copy(f.snapshot.datasets.variantFulfillment.records[0])),'unassessed'],
 ['stale audit',f=>f.snapshot.capturedAt='2026-08-01T00:00:00Z','stale']])test(name,()=>{const f=fixture();mutate(f);assert.equal(state(f),expected);});
test('valid governed expectation',()=>assert.deepEqual(checkInputs(fixture().input),[]));
for(const key of ['carrier','rate','inventoryCount','leadTime','deliveryProfileGid'])test('no durable '+key,()=>{const f=fixture();f.input.fulfillmentAssignments[0][key]='bad';assert(checkInputs(f.input).length);});
test('duplicate owner inputs rejected',()=>{const f=fixture();f.input.fulfillmentAssignments.push(copy(f.input.fulfillmentAssignments[0]));assert(checkInputs(f.input).some(e=>e.includes('duplicate')));});
for(const basis of ['location_exists','electrical_voltage','family_membership'])test('no inferred pickup '+basis,()=>{const i=copy(empty);i.pickupRules.push({ruleId:'P',productGid:product.id,permission:'allowed',evidenceBasis:basis,approvalDecisionId:approve(i,'pickup','P',['Operations','Product Owner'])});assert(checkInputs(i).length);});
for(const basis of ['electrical_voltage','absence_of_restriction','active_market'])test('no inferred region '+basis,()=>{const i=copy(empty);i.regionRules.push({ruleId:'R',productGid:product.id,kind:'regulatory',countryCode:'US',subdivision:null,evidenceBasis:basis,approvalDecisionId:approve(i,'region','R',['Operations','Product Owner'])});assert(checkInputs(i).length);});
const registry=JSON.parse(fs.readFileSync('data/metafield-metaobject-definitions.json'));
test('minimal registry',()=>assert.deepEqual(validateRegistry3c(registry),[]));
for(const key of ['shipping_weight','carrier','shipping_rate','inventory_count','lead_time','warranty_duration','support_phone'])test('reject metafield '+key,()=>{const r=copy(registry);r.metafields.push({key});assert(validateRegistry3c(r).length);});
test('no future approved definition',()=>{const r=copy(registry);r.metafields.find(f=>f.key==='fulfillment_class').decisionState='approved';assert(validateRegistry3c(r).length);});
test('E-PBI-020 cannot enter registry',()=>{const r=copy(registry);r.metafields.push({sourcePbi:'E-PBI-020',key:'future'});assert(validateRegistry3c(r).length);});
test('Variant handling requires independent proof',()=>{const f=fixture();f.input.fulfillmentAssignments[0].variantGid=v.id;assert(checkInputs(f.input).some(e=>e.includes('Variant handling')));});
function warranty(){const i=copy(empty),c=copy(context);c.resources.resources.push({resourceId:'policy-fixture',canonical:true,status:'current',supersededBy:null,contentHash:'a'.repeat(64)});c.evidenceIds.add('policy-fixture');
 i.policyVersions.push({policyId:'P1',revision:'1',lifecycle:'current',effectiveFrom:'2026-01-01T00:00:00Z',effectiveTo:null,issuer:'Issuer',administrator:'Admin',repairProvider:'Repair',roleEvidence:{issuer:['repo-policy-pdf'],administrator:['repo-policy-pdf'],repairProvider:['repo-policy-pdf']},sourceIds:['repo-policy-pdf'],resourceId:'policy-fixture',approvalDecisionId:approve(i,'policy','P1',['Legal/Business','Support'])});
 i.policyVersions[0].sourceSha256='a'.repeat(64);
 i.warrantyClasses.push({classId:'W1',policyId:'P1',policyRevision:'1',durationValue:1,durationUnit:'years',trigger:'purchase_date',exclusions:[],approvalDecisionId:approve(i,'warranty_class','W1',['Legal/Business','Product Owner'])});
 i.warrantyMappings.push({productGid:product.id,classId:'W1',exceptions:[],thirdPartyResponsibilityConfirmed:true,approvalDecisionId:approve(i,'warranty_mapping',product.id,['Legal/Business','Product Owner'])});return {i,c};}
test('explicit warranty policy/class/mapping passes',()=>{const {i,c}=warranty();assert.deepEqual(validateOwnerInputs(i,c,asOf),[]);});
test('policy content drift invalidates revision',()=>{const {i,c}=warranty();i.policyVersions[0].sourceSha256='b'.repeat(64);assert(validateOwnerInputs(i,c,asOf).some(e=>e.includes('content hash')));});
test('unknown country cannot establish eligibility',()=>{const i=copy(empty);i.regionRules.push({ruleId:'R',productGid:product.id,kind:'commercial',countryCode:'ZZ',subdivision:null,evidenceBasis:'explicit_regional_rule',approvalDecisionId:approve(i,'region','R',['Operations','Product Owner'])});assert(checkInputs(i).some(e=>e.includes('country identity')));});
for(const [name,mutate]of [
 ['unapproved duration',f=>f.i.approvals=[]],['obsolete policy',f=>f.i.policyVersions[0].lifecycle='obsolete'],['superseded policy',f=>f.i.policyVersions[0].lifecycle='superseded'],['wrong revision',f=>f.i.warrantyClasses[0].policyRevision='2'],['expired terms',f=>f.i.policyVersions[0].effectiveTo='2026-02-01T00:00:00Z'],['no issuer evidence',f=>f.i.policyVersions[0].roleEvidence.issuer=[]],['silent role collapse',f=>f.i.policyVersions[0].issuer='Admin'],['orphan resource',f=>f.i.policyVersions[0].resourceId='missing'],['evidence File is not current terms',f=>f.c.resources.resources.at(-1).canonical=false],['third party does not inherit Rhino',f=>{f.c.brandByGid[product.id]='DIALUX';f.i.warrantyMappings[0].thirdPartyResponsibilityConfirmed=false;}]])test(name,()=>{const f=warranty();mutate(f);assert(validateOwnerInputs(f.i,f.c,asOf).length);});
function timing(){const i=copy(empty),s={sourceId:'source',owner:'Operations',process:'Daily approved fixture dispatch review',consumer:'Fixture support estimate',maxAgeSeconds:3600,updateSlaSeconds:1800,approvalDecisionId:approve(i,'lead_time_source','source',['Operations','Product Owner'])};const p={projectionId:'T1',sourceId:s.sourceId,owner:s.owner,scope:'PRODUCT',productGid:product.id,sourceUpdatedAt:asOf,expiresAt:'2026-09-09T17:14:00.000Z',fallback:'unknown_no_timing_promise',minDays:1,maxDays:3,timeBasis:'business_days',event:'dispatch',approvalDecisionId:approve(i,'lead_time_projection','T1',['Operations'])};return {i,s,p};}
test('fresh owned timing',()=>{const f=timing();assert.equal(resolveLeadTime(f.p,f.s,f.i,context,asOf).state,'current');});
test('expiry suppresses timing at boundary',()=>{const f=timing();assert.deepEqual(resolveLeadTime(f.p,f.s,f.i,context,f.p.expiresAt),{state:'unknown',timing:null,reason:'stale_projection'});});
for(const [name,mutate]of [['missing source',f=>f.s=null],['no process',f=>f.s.process=''],['unbounded expiry',f=>f.p.expiresAt='2027-01-01T00:00:00Z'],['unsafe fallback',f=>f.p.fallback='available_now'],['future timestamp',f=>f.p.sourceUpdatedAt='2026-09-10T00:00:00Z'],['speculative Variant',f=>{f.p.scope='PRODUCTVARIANT';f.p.variantGid=v.id;}],['source without owner approval',f=>f.i.approvals=[]],['negative timing',f=>f.p.minDays=-1]])test(name,()=>{const f=timing();mutate(f);assert.equal(resolveLeadTime(f.p,f.s,f.i,context,asOf).state,'unknown');});
test('unknown differs from unavailable',()=>{const p={status:'ACTIVE',publishedAt:asOf};assert.equal(resolveAvailability(p,{},asOf,asOf),'unknown');assert.equal(resolveAvailability(p,{availableForSale:false},asOf,asOf),'unavailable_for_sale');assert.equal(resolveAvailability(p,{availableForSale:true},asOf,asOf),'available_for_sale');});
test('stale inventory does not certify availability',()=>assert.equal(resolveAvailability({status:'ACTIVE',publishedAt:asOf},{availableForSale:true},asOf,'2026-08-01T00:00:00Z'),'unknown'));
test('query-only operational audit',()=>assertReadOnlyOperations(OPERATIONAL_OPERATIONS));
test('mutation rejection',()=>assert.throws(()=>assertReadOnlyOperations({bad:'mutation Bad { productUpdate { id } }'})));
(async()=>{
 const response=data=>({ok:true,status:200,json:async()=>data});
 const options={shopDomain:'fixture.myshopify.com',accessToken:'fixture-not-secret',operational:true};
 const audit=await runAdminAudit({...options,only:['shopPolicies'],fetchImpl:async()=>response({data:{shop:{shippingPolicy:{id:'gid://shopify/ShopPolicy/1'}}}})});
 test('singleton native policies audited',()=>assert.equal(audit.datasets.shopPolicies.recordCount,1));
 const truncated=await runAdminAudit({...options,only:['deliveryConfiguration'],fetchImpl:async()=>response({data:{deliveryProfiles:{nodes:[{id:pid,groups:{nodes:[],pageInfo:{hasNextPage:true,endCursor:'nested'}}}],pageInfo:{hasNextPage:false,endCursor:null}}}})});
 test('nested operational truncation fails closed',()=>assert.equal(truncated.datasets.deliveryConfiguration.queryStatus,'query_failure'));
 const repeated=await runAdminAudit({...options,only:['variantFulfillment'],fetchImpl:async()=>response({data:{productVariants:{nodes:[],pageInfo:{hasNextPage:true,endCursor:'same'}}}})});
 test('repeated cursor terminates audit',()=>assert.equal(repeated.datasets.variantFulfillment.queryStatus,'query_failure'));
 console.log(`Batch 3C: ${checks} positive and adversarial checks passed; no network requests.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
