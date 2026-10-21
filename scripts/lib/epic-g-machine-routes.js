'use strict';
// Consumer of the verified F projection. This module never reverses the G graph.
const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('./epic-e-owner-response-adapter'),G=require('./epic-g-foundation'),F=require('./epic-f-customer-release');
const DIR=process.env.RHINO_G3A_EVIDENCE_DIR||'docs/qa/evidence/epic-g/g3a-2026-10-19',READ=DIR+'/admin-read.json',CONTRACT='data/epic-g-machine-routes.json',ASSET='assets/rhino-storefront.js';
const digest=path=>({path,sha256:E.hash(fs.readFileSync(path))});
function verifyAsset(script=fs.readFileSync(ASSET,'utf8')){
 const before=fs.readFileSync(DIR+'/rhino-storefront-before.js','utf8');
 assert.equal(E.hash(before),'f4b187b74e258ae01db5142eac3d8d5a3adf7b8755f82f9fe4dee94a96b91486','Exact pre-G3A predecessor');
 assert(script.startsWith(before),'Preserve existing storefront JS byte prefix');
 assert.equal(E.hash(script.slice(before.length)),'fe57832fac64e14bdf213dd2478c56dc5916eaf58da3a3b96be95f5f52e1f2cb','Only the reviewed G3A entry extension is permitted');
 return true;
}
function project({report,products,projection,browser,asOf=report.asOf}){
 assert(report.source.current,'G1 source must be current');assert(report.reconciliation.complete,'Complete Admin reconciliation required');
 const expiresAt=new Date(Math.min(Date.parse(report.source.expiresAt),Date.parse(report.source.snapshotExpiresAt))).toISOString();
 assert(Date.parse(asOf)>=Date.parse(report.source.snapshotCapturedAt)&&Date.parse(asOf)<Date.parse(expiresAt),'Source lifecycle invalid');
 assert.deepEqual(browser.failures,[],'Actual Shopify baseline must pass');assert.equal(browser.overlay,false);assert.equal(browser.themeId,'158631198917');
 assert(Date.parse(browser.startedAt)>=Date.parse(report.source.snapshotCapturedAt)&&Date.parse(browser.completedAt)<=Date.parse(asOf),'Browser observation order');
 const routes=report.products.filter(p=>p.approvedClass==='machine').map(machine=>{
  const native=products.find(p=>p.id===machine.productGid),page=projection.pages.find(p=>p.productGid===machine.productGid),cards=page?.cards||[];
  const reasons=[...machine.consumerReasons];if(!machine.published)reasons.push('MACHINE_NOT_PUBLISHED');if(!cards.length)reasons.push('NO_APPROVED_REVERSE_ENTRIES');
  assert(native,'Machine native identity required');
  for(const card of cards){const source=report.products.find(p=>p.productGid===card.productGid),target=source?.compatibility.targets.find(t=>t.productGid===machine.productGid);assert(source?.gRoleEligible&&source.customerProductEligible&&source.compatibility.sourceApproved&&source.compatibility.dataEligible&&target?.eligible,'F reverse / G1 eligibility mismatch: '+card.productGid);assert.equal(products.find(p=>p.id===card.productGid)?.handle,card.handle,'Source handle drift');}
  assert.equal(new Set(cards.map(c=>c.productGid)).size,cards.length,'Duplicate F reverse card');
  const cells=browser.cells.filter(c=>c.productGid===machine.productGid);assert.deepEqual(cells.map(c=>c.width).sort((a,b)=>a-b),[390,1440],'Both viewport observations required');
  let fragment=null;
  for(const cell of cells){assert.equal(cell.published,machine.published,'Publication drift');assert.equal(cell.handle,native.handle,'Machine handle drift');assert.equal(cell.status,machine.published?200:404);
   if(machine.published){assert.equal(cell.dom.productGid,machine.productGid);assert.deepEqual(cell.dom.cards.map(c=>c.productGid).sort(),cards.map(c=>c.productGid).sort(),'F reverse projection equality');
    if(cards.length){assert.equal(cell.dom.fragmentUnique,1);assert(/^#OwnerContext-[A-Za-z0-9_-]+$/.test(cell.dom.fragment),'Existing F fragment required');if(fragment)assert.equal(cell.dom.fragment,fragment);fragment=cell.dom.fragment;}
   }
  }
  const cardHandles=cards.map(c=>c.handle),includedHandles=(page?.contents||[]).filter(c=>c.line.componentProductGid).map(c=>products.find(p=>p.id===c.line.componentProductGid)?.handle);assert(!includedHandles.includes(undefined));
  const uniqueHandles=[...new Set([...cardHandles,...includedHandles])].sort();assert(uniqueHandles.length<=20,'Native all_products unique handle budget');
  const customerEligible=machine.published&&!reasons.length&&cards.length>0;
  return {machineProductGid:machine.productGid,nativeProductUrl:machine.published?'/products/'+native.handle:null,observedNativeHandle:native.handle,templateSuffix:native.templateSuffix||null,fragment:customerEligible?fragment:null,published:machine.published,dataEligible:machine.valid&&machine.consumerReasons.length===0,customerEligible,expectedApprovedReverseCount:cards.length,omissionReasons:[...new Set(reasons)].sort(),lookupBudget:{reverse:cardHandles.length,included:includedHandles.length,uniqueHandles,limit:20,addedByG3A:0}};
 });
 for(const route of routes.filter(r=>r.customerEligible))assert(route.fragment&&route.nativeProductUrl);
 return {schemaVersion:1,consumer:'G-PBI-004',fixtureOnly:report.mode==='OFFLINE_FIXTURE',themeId:browser.themeId,scope:'UNPUBLISHED_PREVIEW',validatedAt:asOf,expiresAt,sourceBindingSha256:report.source.bindingSha256,receiptExpiresAt:report.source.expiresAt,observationCapturedAt:report.source.snapshotCapturedAt,browserObservedAt:browser.completedAt,routes};
}
function current(asOf=new Date().toISOString()){
 require('./epic-g-current-protection').activate();const envelope=E.read(READ);assert.equal(envelope.sourceKind,'live_admin');
 const errors=require('../validate-epic-g-foundation').validateRead(envelope);assert.deepEqual(errors,[]);
 const report=G.assess(G.loadAuthority(),envelope,{asOf});assert(report.source.current&&report.reconciliation.complete,'Current G1 source reconciliation required');
 return {report,products:envelope.snapshot.datasets.products.records,projection:F.verifyRelease(asOf).projection};
}
function build(browserPath=DIR+'/baseline-browser.json',asOf=new Date().toISOString()){
 const source=current(asOf),browser=E.read(browserPath),out=project({...source,browser,asOf});
 out.provenance=[digest(READ),digest(browserPath),digest(F.RELEASE),digest(require('./epic-f-final-owner-binding').BINDING),digest('data/navigation-spec.json'),digest('data/global-navigation-ia.json')];return out;
}
function verify(){const actual=E.read(CONTRACT),validate=new (require('ajv/dist/2020'))({allErrors:true,strict:false,formats:{'date-time':v=>Number.isFinite(Date.parse(v))}}).compile(E.read('schemas/epic-g-machine-routes.schema.json'));assert(validate(actual),JSON.stringify(validate.errors));for(const ref of actual.provenance)assert.equal(digest(ref.path).sha256,ref.sha256,'Route provenance drift');const expected=build(actual.provenance[1].path,actual.validatedAt);assert.deepEqual(actual,expected,'Route contract drift');current();assert(Date.now()<Date.parse(actual.expiresAt),'Route contract expired');
 verifyAsset();const script=fs.readFileSync(ASSET,'utf8');assert.equal(script.match(/const receiptExpiresAt = Date.parse\('([^']+)'\)/)?.[1],actual.receiptExpiresAt);
 const compiled=F.verifyRelease();for(const route of actual.routes.filter(r=>r.customerEligible)){const id=route.machineProductGid.split('/').pop(),bodies=Object.entries(compiled.shards).filter(([path])=>path.endsWith('-'+id+'.liquid')).map(([,body])=>body).join('\n'),handles=[...new Set([...bodies.matchAll(/all_products\['([^']+)'\]/g)].map(m=>m[1]))].sort();assert.deepEqual(handles,route.lookupBudget.uniqueHandles,'Compiled unique Product handle accounting');}
 return actual;
}
module.exports={DIR,READ,CONTRACT,ASSET,project,current,build,verify,verifyAsset,digest};
