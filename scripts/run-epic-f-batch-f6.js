'use strict';
const fs=require('node:fs'),{spawnSync}=require('node:child_process');
const folder='test-results/epic-f/f6';fs.mkdirSync(folder,{recursive:true});
const results=[];
for(const script of ['validate:epic-f-support-resources','test:epic-f-support-resources','test:machine-support-resources','test:machine-support-resources-performance','validate:hardcoded-strings','validate:epic-f-batch-f5']){
 const p=spawnSync(process.execPath,[process.env.npm_execpath,'run',script],{encoding:'utf8'}),log=`${folder}/${script.replaceAll(':','-')}.txt`;
 fs.writeFileSync(log,(p.stdout||'')+(p.stderr||'')+(p.error?String(p.error):''));results.push({command:`npm run ${script}`,exitCode:p.status??1,required:true,scope:script.endsWith('f5')?'F1-F5 regression':'F6 repository',log});console.log(`${script}: exit ${p.status??1}`);
}
const diff=spawnSync('git',['diff','--check'],{encoding:'utf8'});fs.writeFileSync(`${folder}/git-diff-check.txt`,(diff.stdout||'')+(diff.stderr||''));results.push({command:'git diff --check',exitCode:diff.status??1,required:true});
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const f5=read('test-results/epic-f/f5/batch-f5-validation.json'),f1=read('test-results/epic-f/batch-f1-validation.json');
const browser=read(`${folder}/playwright.json`),performance=read(`${folder}/performance-runtime.json`),contracts=read(`${folder}/contract-tests.json`),release=read('data/epic-f-consumer-release.json');
const themeCheck=f1.results.find(r=>r.command==='npm run theme:check');
const exitCode=results.every(r=>r.exitCode===0)&&themeCheck?.exitCode===0&&release.grants.length===0&&contracts.brokenManualRoutes.length===7?0:1;
const report={batch:'F6',assessedAt:new Date().toISOString(),exitCode,scope:'repository and isolated synthetic local fixtures only',
 status:{'F-PBI-010A':exitCode?'checks failed':'complete repository/local-fixture scope','F-PBI-011A':exitCode?'checks failed':'complete repository/local-fixture scope','F-PBI-010B':'open; not ready','F-PBI-011B':'open; not ready','F-PBI-013':'open; F-DEC-001 unresolved','F-PBI-014B':'open; support/resources local partial evidence only','F-PBI-015B':'deferred; not run','B3C-D03':'blocked','B3B-D06':'pending'},
 results,themeCheck:{...themeCheck,nestedPath:'F6 → F5 → F4 → F3 → F2 → F1'},contracts,browser:browser.stats,regression:{...f5.regression,f5:f5.results},
 performance:{budgets:performance.budgets,observations:performance.results.map(r=>({state:r.state,profile:r.profile,metrics:r.record.samples[0].metrics,violations:r.violations})),record:`${folder}/performance-runtime.json`,fixtureOnly:true,releaseCertification:false},thresholdChanges:false,
 factGrants:{before:0,after:release.grants.length,newDomains:Object.fromEntries(['warranty_service','manual','diagram_instruction','video','support_files_customer_forbidden'].map(domain=>[domain,{before:0,after:0}]))},
 historicalDiagnostics:f5.historicalDiagnostics,historicalComparison:f5.historicalComparison,historicalDescriptionClaimMatches:f5.historicalDescriptionClaimMatches,brokenManualRoutes:{unchanged:true,source:'data/epic-e-resource-catalog.json; historical discovery',routes:contracts.brokenManualRoutes,liveRecheck:false},
 deferred:['010B B3C-D03/E-PBI-016 policy, class, exact Product mapping, independently evidenced roles, customer scope/destination, applicable migration/reconciliation and separate activation','011B B3B-D06/E-PBI-018B exact Product/File and canonical version, language/rights/publication review, valid destinations, Product-surface video/media approval, migration/reconciliation and separate activation','004B/006B/007B/008B/009B unchanged and not ready','014B approved live media parity, actual Shopify-rendered integration/release parity and release-only journeys not proven locally','013/F-DEC-001 unresolved; native payment terms unchanged','015B actual Shopify preview/release certification','Epic P intake/privacy/retention ownership','Inherited Epic E approvals/migrations/reconciliation; no questions reopened','J/K operational corrections; L support/resource destination ownership'],
 previewOnlyChecks:'not run; not authorized',adminOnlyChecks:'not run; not authorized',adminMutationOccurred:false,pageFilePolicyMutationOccurred:false,productMetafieldMetaobjectMutationOccurred:false,productTemplateAssignmentOccurred:false,themePushedOrPublished:false};
fs.writeFileSync(`${folder}/batch-f6-validation.json`,JSON.stringify(report,null,2)+'\n');console.log(`F6 gate: exit ${exitCode}; 010B/011B not ready; 013/014B open; 015B deferred. No live mutations.`);process.exitCode=exitCode;
