'use strict';
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const folder='test-results/epic-f/f3';
fs.mkdirSync(folder,{recursive:true});
const results=[];
function run(script, category) {
  const args=[process.env.npm_execpath,'run',script];
  const p=spawnSync(process.execPath,args,{encoding:'utf8'});
  const log=`${folder}/${script.replaceAll(':','-')}.txt`;
  fs.writeFileSync(log,(p.stdout||'')+(p.stderr||'')+(p.error?String(p.error):''));
  results.push({command:`npm run ${script}`,exitCode:p.status??1,category,log});
  console.log(`${script}: exit ${p.status??1}`);
}
for(const script of ['validate:epic-f-gallery','test:epic-f-media','test:epic-f-performance','test:machine-gallery','test:machine-performance'])run(script,'required F3 repository');
for(const script of ['validate:brand-performance','validate:homepage-performance','validate:epic-f-batch-f2'])run(script,'F1/F2 and existing performance regression');
const diff=spawnSync('git',['diff','--check'],{encoding:'utf8'});
fs.writeFileSync(`${folder}/git-diff-check.txt`,(diff.stdout||'')+(diff.stderr||''));
results.push({command:'git diff --check',exitCode:diff.status??1,category:'required F3 repository'});
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const f2=read('test-results/epic-f/f2/batch-f2-validation.json');
const gallery=read(`${folder}/gallery-playwright.json`);
const performance=read(`${folder}/performance-runtime.json`);
const exitCode=results.every(r=>r.exitCode===0)?0:1;
const report={batch:'F3',assessedAt:new Date().toISOString(),scope:'repository + isolated local fixtures only',exitCode,
  status:{'F-PBI-004A':exitCode?'checks failed':'complete repository scope','F-PBI-004B':'blocked; F-DEC-002 unresolved; separate activation authorization required','F-PBI-015A':exitCode?'checks failed':'complete repository scope','F-PBI-015B':'deferred; preview/release certification not run','F-PBI-014B':'open; gallery-specific fixture evidence only','F-PBI-013':'open; F-DEC-001 unresolved'},
  results,f1Regression:f2.f1RequiredRegression,f2Regression:f2.results,gallery:gallery.stats,
  performance:{budgets:performance.budgets,observations:performance.results.map(r=>({state:r.state,profile:r.profile,expected:r.expected,expectedResult:r.expectedResult,violations:r.violations,metrics:r.record.samples[0].metrics,secondaryInspection:r.record.samples[0].secondaryInspection})),fullRecord:'test-results/epic-f/f3/performance-runtime.json',releaseCertification:false},
  thresholdChanges:false,historicalDiagnostics:f2.historicalDiagnostics,historicalComparison:f2.historicalComparison,
  historicalDescriptionClaimMatches:{count:37,status:'historical, suppressed, not approved'},
  deferred:['F-DEC-002 exact asset/model/use, rights, alt, embedded claims, publication and lifecycle approvals plus 004B activation','F-DEC-001/F-PBI-013 native payment decision or explicit release dependency acceptance','F-PBI-014B populated module/media journeys','F-PBI-015B actual Shopify renderer/theme/environment, representative media, throttled cache/settle policy, >=3 mobile samples and median, provider attribution and owner exception review','Epic P Contact routing/privacy/retention/intake ownership','Inherited Epic E fact approvals, migrations and reconciliation; no questions reopened'],
  previewOnlyChecks:'not run; not authorized',adminOnlyChecks:'not run; not authorized',globalChrome:'Epic C ownership; no unrelated changes',
  adminMutationOccurred:false,productMediaOrAltMutationOccurred:false,productTemplateAssignmentOccurred:false,themePushedOrPublished:false};
fs.writeFileSync(`${folder}/batch-f3-validation.json`,JSON.stringify(report,null,2)+'\n');
console.log(`F3 gate: exit ${exitCode}; 004B blocked, 015B deferred, 013/014B open. No live checks or mutations.`);
process.exitCode=exitCode;
