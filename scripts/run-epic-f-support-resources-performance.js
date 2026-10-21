'use strict';
const fs=require('node:fs');
const {chromium}=require('@playwright/test');
const {collectSample}=require('./run-epic-f-machine-performance');
const {supportDocument}=require('./lib/epic-f-support-resources-fixtures');
const {mediansFor,evaluateRun,policyLimits}=require('./lib/epic-f-performance');
async function main(){
  if(process.argv.length>2)throw new Error('F6 permits local fixture measurements only');
  const browser=await chromium.launch();const results=[];
  try{for(const state of ['zero','support','downloads','video','combined'])for(const profile of ['mobile','desktop']){
    const sample=await collectSample(browser,'f6-'+state,profile,{document:supportDocument(state)});
    const record={schemaVersion:1,stage:'fixture-regression',requestedRuns:1,samples:[sample],medians:mediansFor([sample]),aggregationLabel:'single local F6 observation; not a release median'};
    const violations=evaluateRun(record);
    if(sample.resources.some(r=>new URL(r.url).pathname.startsWith('/fixture-downloads/')))violations.push('resource documents fetched before interaction');
    if(sample.resources.some(r=>new URL(r.url).hostname==='video.fixture.invalid'))violations.push('resource video provider requested before interaction');
    results.push({state,profile,violations,record});console.log(`${state}/${profile}: ${violations.length?'FAIL '+violations.join('; '):'pass'}; ${JSON.stringify(sample.metrics)}`);
  }}finally{await browser.close();}
  const report={scope:'local fixture only; no 015B certification',assessedAt:new Date().toISOString(),thresholdChanges:false,budgets:{mobile:policyLimits('mobile'),desktop:policyLimits('desktop')},results,exitCode:results.some(r=>r.violations.length)?1:0};
  fs.mkdirSync('test-results/epic-f/f6',{recursive:true});fs.writeFileSync('test-results/epic-f/f6/performance-runtime.json',JSON.stringify(report,null,2)+'\n');process.exitCode=report.exitCode;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
