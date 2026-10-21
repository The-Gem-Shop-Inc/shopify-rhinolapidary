'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const M=require('./lib/epic-f-live-machine-activation'),{command,parse}=require('./deploy-epic-f-live-machine-template');
const plan=M.read(M.PLAN),clone=()=>structuredClone(plan),cases=[];
// Replay the immutable completed plan at its recorded execution time. Real writes
// always use the validator's current-time default and fresh remote before-read.
const validationAt=Date.parse(M.read(M.DIR+'/live-push.json').startedAt);
const validatePlan=p=>M.validatePlan(p,{now:validationAt});
const validateCommand=(p,args,options={})=>M.validateCommand(p,args,{...options,now:validationAt});
function test(name,fn){fn();cases.push({name,result:'PASS'});}
function reject(name,mutate){test(name,()=>{const p=clone();mutate(p);p.planSha256=M.planDigest(p);assert.throws(()=>validatePlan(p));});}
test('Approved exact closure',()=>validatePlan(plan));test('Forward exact selective CLI',()=>validateCommand(plan,command(plan)));
test('Expired theme before-read rejects a new operation',()=>assert.throws(()=>M.validatePlan(plan,{now:Date.parse(plan.beforeCompletedAt)+3600001})));
test('Bounded rollback exact originals and only new-path deletion',()=>validateCommand(plan,command(plan,true),{rollback:true,workspace:'test-results/epic-f-live-activation/rollback'}));
reject('Different live theme rejected',p=>p.targetTheme.id=M.PREVIEW);reject('Non-MAIN role rejected',p=>p.targetTheme.role='UNPUBLISHED');reject('Unplanned theme path rejected',p=>p.files.push({...p.files[0],path:'assets/global.js'}));reject('Missing existing rollback body rejected',p=>p.files.find(f=>f.existedBefore).rollbackUploadBody=null);reject('Source hash drift rejected',p=>p.files[0].intendedSha256='0'.repeat(64));reject('Stored original checksum drift rejected',p=>p.files.find(f=>f.existedBefore).beforeChecksumMd5='0'.repeat(32));reject('Product exclusion assignment rejected',p=>p.targetProducts[0]=M.EXCLUSIONS[0]);reject('Publication authorization rejected',p=>p.publicationAuthorized=true);reject('Global approval bypass rejected',p=>p.approvalMode='skipApprovals');
for(const flag of ['--publish','--live','--unpublished','--ignore'])test('Forbidden CLI '+flag,()=>assert.throws(()=>validateCommand(plan,[...command(plan),flag])));
test('Forward deletion rejected',()=>assert.throws(()=>validateCommand(plan,command(plan).filter(a=>a!=='--nodelete'))));test('Full push rejected',()=>assert.throws(()=>validateCommand(plan,['theme','push','--theme',M.TARGET,'--path','.','--nodelete','--strict','--allow-live','--json'])));
test('CLI strict prefix parser',()=>{
  const result=parse('[]\n'+JSON.stringify({theme:{id:Number(M.TARGET),role:'live'}}));
  assert.equal(result.theme.role,'live');
});
test('CLI asset errors rejected',()=>{
  const stdout=JSON.stringify({theme:{id:Number(M.TARGET),role:'live',errors:{x:['Liquid error']}}});
  assert.throws(()=>parse(stdout));
});
const product=M.read(M.DIR+'/products-task-before.json').products.find(p=>p.id===M.PRODUCTS[0].gid),authorization={approvalMode:'delegated_development_override',planId:'F-PBI-017B',liveThemeId:M.TARGET,liveMachineTemplateVerified:true,beforeReadCompletedAt:new Date().toISOString(),targetProducts:M.PRODUCTS.map(p=>p.gid),excludedProducts:M.EXCLUSIONS,products:[product]};
test('Only id and suffix in assignment',()=>assert.deepEqual(M.verifyAssignment(product,authorization),{id:product.id,templateSuffix:'machine'}));test('Stale Product read rejected',()=>assert.throws(()=>M.verifyAssignment(product,{...authorization,beforeReadCompletedAt:'2026-01-01T00:00:00Z'})));test('Immediate suffix drift rejected',()=>assert.throws(()=>M.verifyAssignment({...product,templateSuffix:'other'},authorization)));test('Immediate protected field drift rejected',()=>assert.throws(()=>M.verifyAssignment({...product,title:'changed'},authorization)));test('No classification rejects assignment',()=>assert.throws(()=>M.verifyAssignment({...product,metafields:{nodes:[]}},authorization)));
const {sanitize}=require('./smoke-epic-f-live-machine-activation');test('Browser evidence removes secret URL values',()=>{const secret='https://secret.shopifypreview.com/products/x?preview_key=test-secret&token=test-token';assert.ok(!sanitize(secret).includes('test-secret'));assert.ok(!sanitize(secret).includes('test-token'));});
test('HTML quote redaction preserves valid JSON and hides signed host',()=>{const {sanitizeEvidence}=require('./smoke-epic-f-live-machine-activation');const value={origin:'https://fixture.shopifypreview.com',html:'<iframe src="https://fixture.shopifypreview.com/x?preview_key=fixture-secret" sandbox="allow-same-origin">'};const serialized=JSON.stringify(sanitizeEvidence(value));const parsed=JSON.parse(serialized);assert.equal(parsed.origin,'[SIGNED_PREVIEW_HOST_REDACTED]');assert.ok(!serialized.includes('fixture-secret'));assert.ok(!serialized.includes('fixture.shopifypreview.com'));assert.ok(parsed.html.includes('sandbox="allow-same-origin"'));});
test('Equivalent pagination cursor serialization is not Product drift',()=>{const changed=structuredClone(product);changed.resourcePublicationsV2.pageInfo.endCursor='equivalent-pagination-only';assert.deepEqual(M.verifyAssignment(changed,authorization),{id:product.id,templateSuffix:'machine'});});
test('Publication drift remains rejected',()=>{const changed=structuredClone(product);changed.resourcePublicationsV2.nodes[0].isPublished=false;assert.throws(()=>M.verifyAssignment(changed,authorization));});
test('Incomplete pagination remains rejected as drift',()=>{const changed=structuredClone(product);changed.resourcePublicationsV2.pageInfo.hasNextPage=true;assert.throws(()=>M.verifyAssignment(changed,authorization));});
test('Business JSON named endCursor remains protected',()=>{const value={jsonValue:{endCursor:'business-value'}};assert.deepEqual(M.protectedComparable(value),value);});
test('Current completed operational F7/readiness record is source-bound',()=>{const report=M.read('data/epic-f-current-shopify-eligibility.json');assert.equal(report.F7.state,'COMPLETE');assert.equal(report.assignedTargetCount,8);assert.equal(report.exclusionCount,3);assert.equal(report.executableTargetCount,0);assert.equal(report.F8.F_PBI_018B,'NOT_BEGUN');assert.equal(report.F8.realFactualGrants,0);assert.deepEqual(report.consumer.grants,[]);for(const ref of report.provenance)assert.equal(M.hash(fs.readFileSync(ref.path)),ref.sha256);});
const result={passed:cases.length,failed:0,cases,planSha256:plan.planSha256,assessedAt:new Date().toISOString()};fs.writeFileSync(M.DIR+'/local-execution-contract-tests.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({passed:result.passed,failed:0}));
