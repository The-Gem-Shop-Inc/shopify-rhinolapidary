'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('./lib/epic-e-owner-response-adapter'),F=require('./lib/epic-f-customer-release'),H=require('./lib/epic-f-owner-activation-binding');
const before=E.read(E.DIR+'/repository-before.json'),parent=before.sourceBinding;assert.equal(parent.bindingSha256,'666ff15b4d98916426299eae85dbea783535321d88ea5d77035e57c0054216ac');
if(fs.existsSync(E.DIR+'/additional-qa-before.json'))for(const row of E.read(E.DIR+'/additional-qa-before.json').files)if(!before.files.some(r=>r.path===row.path))before.files.push(row);
const hash=path=>E.hash(fs.readFileSync(path)),runtimeDelta=H.RUNTIME.map(path=>{
 let old=before.files.find(r=>r.path===path);
 if(!old&&parent.StorefrontSource.some(r=>r.path===path)){
  const expected=parent.StorefrontSource.find(r=>r.path===path).sha256,remote=E.read(E.DIR+'/themes-before.json').response.data.main.source.nodes.find(r=>r.filename===path)?.body.content;
  let body=remote;
  if(E.hash(body??'')!==expected&&path==='snippets/card-product.liquid')body=fs.readFileSync(path,'utf8').replace("{%- if rhino_legacy_content and rhino_owner_customer_context != true -%}","{%- if rhino_legacy_content -%}");
  assert.equal(E.hash(body??''),expected,'Cannot recover exact predecessor '+path);old={path,sha256:expected,body};
 }
 return {path,oldSha256:old?.sha256??null,originalBody:old?.body??null,sha256:hash(path)};
});
const qaDelta=before.files.filter(r=>!H.RUNTIME.includes(r.path)&&hash(r.path)!==r.sha256).map(r=>({path:r.path,oldSha256:r.sha256,originalBody:r.body,sha256:hash(r.path)}));
const sourceAfter=parent.StorefrontSource.map(r=>({path:r.path,sha256:hash(r.path)}));for(const r of runtimeDelta.filter(r=>!sourceAfter.some(p=>p.path===r.path)))sourceAfter.push({path:r.path,sha256:r.sha256});
const provenancePaths=[E.SOURCE,E.RESPONSES,E.RECEIPT,E.DIR+'/execution-authorization.json',F.RELEASE,'scripts/lib/epic-e-owner-response-adapter.js','scripts/lib/epic-e-readiness.js','scripts/lib/epic-f-facts.js','scripts/lib/epic-f-customer-release.js','scripts/lib/epic-f-owner-activation-binding.js','scripts/build-epic-f-owner-customer-release.js','schemas/epic-e-completed-owner-responses.schema.json'];
provenancePaths.push('scripts/deploy-epic-f-owner-activation.js','scripts/validate-epic-f-owner-live-browser.js','scripts/finalize-epic-f-owner-local-validation.js');
if(fs.existsSync(E.DIR+'/liquid-live-representation-em-1.json'))provenancePaths.push('scripts/probe-epic-f-owner-liquid.js',E.DIR+'/liquid-live-representation-beadmaster.json',E.DIR+'/liquid-live-representation-em-1.json');
const body={identity:'EPIC_F_RECONCILED_OWNER_FACTS_DEVELOPMENT_2026_10_13',createdAt:new Date().toISOString(),approvalMode:'delegated_development_override',parentSourceBindingSha256:parent.bindingSha256,mediaDecisionUnchanged:'F-DEC-002-DEV',runtimeDelta,qaDelta,sourceAfter,provenance:provenancePaths.map(path=>({path,sha256:hash(path)})),sourceScope:'Exact reconciled completed-owner Product facts; no performance or final signoff',grants:F.verifyRelease().release.grants.length};
const binding={...body,bindingSha256:E.hash(JSON.stringify(body))};fs.writeFileSync(H.BINDING,JSON.stringify(binding,null,2)+'\n');process.env.RHINO_EPIC_F_OWNER_BINDING=H.BINDING;H.verify();
const consumer=require('./lib/epic-f-consumer'),context=consumer.loadContext({ownerResponses:true}),input=E.validateResponses(),rows=input.rows.map(r=>({rowId:r.rowId,productGid:r.targetGid,domain:r.domain,field:r.field,...consumer.evaluate(context,{productGid:r.targetGid,domain:r.domain,field:r.field})}));
assert.equal(rows.filter(r=>r.eligible).length,68);fs.writeFileSync('data/epic-f-owner-customer-eligibility.json',JSON.stringify({sourceBindingSha256:binding.bindingSha256,rows,beforeGrants:0,afterGrants:68},null,2)+'\n');
console.log(JSON.stringify({bindingSha256:binding.bindingSha256,runtimeFiles:runtimeDelta.length,qaFiles:qaDelta.length,consumerEligible:rows.filter(r=>r.eligible).length}));
