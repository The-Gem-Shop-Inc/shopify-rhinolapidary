'use strict';
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const folder='test-results/epic-f/f4';fs.mkdirSync(folder,{recursive:true});
const results=[];
for(const script of ['validate:epic-f-facts','test:epic-f-facts','test:machine-facts','test:machine-fact-performance','validate:epic-f-batch-f3']) {
  const p=spawnSync(process.execPath,[process.env.npm_execpath,'run',script],{encoding:'utf8'});
  const log=`${folder}/${script.replaceAll(':','-')}.txt`;fs.writeFileSync(log,(p.stdout||'')+(p.stderr||'')+(p.error?String(p.error):''));
  results.push({command:`npm run ${script}`,exitCode:p.status??1,required:true,scope:script.endsWith('f3')?'F1-F3 regression':'F4 repository',log});console.log(`${script}: exit ${p.status??1}`);
}
const diff=spawnSync('git',['diff','--check'],{encoding:'utf8'});fs.writeFileSync(`${folder}/git-diff-check.txt`,(diff.stdout||'')+(diff.stderr||''));results.push({command:'git diff --check',exitCode:diff.status??1,required:true});
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const f3=read('test-results/epic-f/f3/batch-f3-validation.json'),browser=read(`${folder}/playwright.json`),performance=read(`${folder}/performance-runtime.json`);
const release=read('data/epic-f-consumer-release.json');
const exitCode=results.every(r=>r.exitCode===0)&&release.grants.length===0?0:1;
const report={batch:'F4',assessedAt:new Date().toISOString(),exitCode,scope:'repository and isolated synthetic local fixtures only',
  status:{'F-PBI-006A':exitCode?'checks failed':'complete repository scope','F-PBI-007A':exitCode?'checks failed':'complete repository scope','F-PBI-006B':'open; not ready','F-PBI-007B':'open; not ready','F-PBI-004B':'open; blocked by F-DEC-002','F-PBI-013':'open; F-DEC-001 unresolved','F-PBI-014B':'open; F4 specification/contents partial evidence only','F-PBI-015B':'deferred; not run'},
  results,contracts:read(`${folder}/contract-tests.json`),browser:browser.stats,
  performance:{budgets:performance.budgets,observations:performance.results.map(r=>({state:r.state,profile:r.profile,metrics:r.record.samples[0].metrics,violations:r.violations})),record:'test-results/epic-f/f4/performance-runtime.json',fixtureOnly:true,releaseCertification:false},thresholdChanges:false,
  regression:{f1:f3.f1Regression,f2:f3.f2Regression,f3:f3.results},factGrants:{before:0,after:release.grants.length},
  historicalDiagnostics:f3.historicalDiagnostics,historicalComparison:f3.historicalComparison,historicalDescriptionClaimMatches:f3.historicalDescriptionClaimMatches,
  deferred:['006B: Epic E technical/measurement approval and value adapters, migration, fresh complete reconciliation, customer audience and F eligibility; separate activation authorization','007B: Epic E component/BOM approval including C-040 resolution, exact-GID quantities, migration, fresh reconciliation, customer visibility and F eligibility; separate activation authorization','004B approved live media activation','014B approved live media parity, contextual items, delivery/pickup, warranty/support, resources/downloads/video and later disclosure/details journeys','013/F-DEC-001 decision; payment terms unchanged','015B actual Shopify preview/release performance certification','Epic P routing/privacy/retention and intake activation','Inherited Epic E approvals/migrations/reconciliation; no questions reopened'],
  previewOnlyChecks:'not run; not authorized',adminOnlyChecks:'not run; not authorized',
  adminMutationOccurred:false,productMetafieldMetaobjectMutationOccurred:false,productTemplateAssignmentOccurred:false,themePushedOrPublished:false};
fs.writeFileSync(`${folder}/batch-f4-validation.json`,JSON.stringify(report,null,2)+'\n');console.log(`F4 gate: exit ${exitCode}; 006B/007B not ready, 013/014B open, 015B deferred. No live mutations.`);process.exitCode=exitCode;
