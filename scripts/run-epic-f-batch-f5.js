'use strict';
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const folder='test-results/epic-f/f5';fs.mkdirSync(folder,{recursive:true});
const results=[];
for(const script of ['validate:epic-f-context-delivery','test:epic-f-context-delivery','test:machine-context-delivery','test:machine-context-delivery-performance','validate:epic-f-batch-f4']){
  const p=spawnSync(process.execPath,[process.env.npm_execpath,'run',script],{encoding:'utf8'}),log=`${folder}/${script.replaceAll(':','-')}.txt`;
  fs.writeFileSync(log,(p.stdout||'')+(p.stderr||'')+(p.error?String(p.error):''));results.push({command:`npm run ${script}`,exitCode:p.status??1,required:true,scope:script.endsWith('f4')?'F1-F4 regression':'F5 repository',log});console.log(`${script}: exit ${p.status??1}`);
}
const diff=spawnSync('git',['diff','--check'],{encoding:'utf8'});fs.writeFileSync(`${folder}/git-diff-check.txt`,(diff.stdout||'')+(diff.stderr||''));results.push({command:'git diff --check',exitCode:diff.status??1,required:true});
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const f4=read('test-results/epic-f/f4/batch-f4-validation.json'),browser=read(`${folder}/playwright.json`),performance=read(`${folder}/performance-runtime.json`),release=read('data/epic-f-consumer-release.json');
const exitCode=results.every(r=>r.exitCode===0)&&release.grants.length===0?0:1;
const report={batch:'F5',assessedAt:new Date().toISOString(),exitCode,scope:'repository and isolated synthetic local fixtures only',
  status:{'F-PBI-008A':exitCode?'checks failed':'complete repository scope','F-PBI-009A':exitCode?'checks failed':'complete repository scope','F-PBI-008B':'open; not ready','F-PBI-009B':'open; not ready','F-PBI-013':'open; F-DEC-001 unresolved','F-PBI-014B':'open; contextual/delivery fixture evidence only','F-PBI-015B':'deferred; not run'},
  results,contracts:read(`${folder}/contract-tests.json`),browser:browser.stats,regression:{...f4.regression,f4:f4.results},
  performance:{budgets:performance.budgets,observations:performance.results.map(r=>({state:r.state,profile:r.profile,metrics:r.record.samples[0].metrics,violations:r.violations})),record:'test-results/epic-f/f5/performance-runtime.json',fixtureOnly:true,releaseCertification:false},thresholdChanges:false,
  factGrants:{before:0,after:release.grants.length,newDomains:Object.fromEntries(['contextual_accessory','contextual_consumable','compatibility','handling','pickup_scope','region','timing'].map(domain=>[domain,{before:0,after:0}]))},
  historicalDiagnostics:f4.historicalDiagnostics,historicalComparison:f4.historicalComparison,historicalDescriptionClaimMatches:f4.historicalDescriptionClaimMatches,
  deferred:['008B exact approved dependent-to-machine/context edges, customer scope/audience, current identities, migration/reconciliation, approved runtime reverse adapter and separate activation','009B E-PBI-015/017 owner/source/operational approvals, fresh evidence, applicable migration/reconciliation, routes, consumer eligibility and separate activation','004B approved live media activation','006B and 007B approved live fact activation','014B approved live media parity, warranty/support, resources/downloads/video and later disclosure/details journeys','013/F-DEC-001 decision; native payment terms unchanged','015B actual Shopify preview/release certification','Epic P intake/privacy/retention ownership','Inherited Epic E approvals/migrations/reconciliation; no questions reopened','J/K/Admin operational corrections'],
  previewOnlyChecks:'not run; not authorized',adminOnlyChecks:'not run; not authorized',adminMutationOccurred:false,shippingDeliveryPickupMutationOccurred:false,productMetafieldMetaobjectMutationOccurred:false,productTemplateAssignmentOccurred:false,themePushedOrPublished:false};
fs.writeFileSync(`${folder}/batch-f5-validation.json`,JSON.stringify(report,null,2)+'\n');console.log(`F5 gate: exit ${exitCode}; 008B/009B not ready, 013/014B open, 015B deferred. No live mutations.`);process.exitCode=exitCode;
