'use strict';
const fs=require('node:fs');
const {chromium}=require('@playwright/test');
const {collectSample}=require('./run-epic-f-machine-performance');
const {factDocument}=require('./lib/epic-f-fact-fixtures');
const {mediansFor,evaluateRun,policyLimits}=require('./lib/epic-f-performance');
async function main(){
  if(process.argv.length>2)throw new Error('F4 permits local fixture measurements only');
  const browser=await chromium.launch();const results=[];
  try{for(const state of ['zero','specifications','long','contents','large-contents'])for(const profile of ['mobile','desktop']){
    const sample=await collectSample(browser,'f4-'+state,profile,{document:factDocument(state)});
    const record={schemaVersion:1,stage:'fixture-regression',requestedRuns:1,samples:[sample],medians:mediansFor([sample]),aggregationLabel:'single local F4 observation; not a release median'};
    const violations=evaluateRun(record);results.push({state,profile,violations,record});console.log(`${state}/${profile}: ${violations.length?'FAIL '+violations.join('; '):'pass'}; ${JSON.stringify(sample.metrics)}`);
  }}finally{await browser.close();}
  const report={scope:'local fixture only; no 015B certification',assessedAt:new Date().toISOString(),thresholdChanges:false,budgets:{mobile:policyLimits('mobile'),desktop:policyLimits('desktop')},results,exitCode:results.some(r=>r.violations.length)?1:0};
  fs.mkdirSync('test-results/epic-f/f4',{recursive:true});fs.writeFileSync('test-results/epic-f/f4/performance-runtime.json',JSON.stringify(report,null,2)+'\n');process.exitCode=report.exitCode;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
