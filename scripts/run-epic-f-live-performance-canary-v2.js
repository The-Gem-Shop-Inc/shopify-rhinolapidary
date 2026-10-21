'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),os=require('node:os');
const {chromium}=require('@playwright/test'),Ajv=require('ajv/dist/2020');
const C=require('./lib/epic-f-live-performance-collector-v2'),G=require('./lib/epic-f-live-performance-campaign-v2'),N=require('./lib/epic-f-live-performance-network-v2'),T=require('./lib/epic-f-live-performance-profile'),P=require('./lib/epic-f-performance'),M=require('./lib/epic-f-live-machine-activation');
const schema=new Ajv({allErrors:true,strict:false}).compile(G.read('schemas/epic-f-performance-measurement.schema.json'));
async function main(){
 assert.equal(process.argv.length,2,'Canary scope is fixed; no override');fs.mkdirSync(G.DIR,{recursive:true});assert.ok(!fs.existsSync(G.DIR+'/campaign-start.json'),'Cannot silently restart/mix a frozen canary');
 for(const file of ['lifecycle-provenance-tests.json','profile-cache-tests.json','schema-evidence-tests.json'])assert.equal(G.read(G.DIR+'/'+file).failed,0);
 const gate=G.verifyBefore(),frozen=G.freeze(),method={identity:'EPIC_F_015B_LIVE_RECORDER_V2',specification:G.read('data/epic-f-performance-recorder-v2.json'),files:frozen.tooling};method.sha256=G.hash(JSON.stringify(method));G.write('recorder-binding.json',method);
 const preflight={approvalMode:'delegated_development_override',passed:true,checkedAt:new Date().toISOString(),sourceBinding:gate,recorderBinding:{identity:method.identity,sha256:method.sha256},profile:T.frozen,CDP:T.parameters(),sameThrottleBothViewports:true,maximumTerminalDrainMs:5000,coldTested:true,warmTwoTargetsTested:true,settleMs:1500,interRunDelayMs:2500,plannedSamples:6,fullCertificationRequires:96,remainingIfPass:90,approvedComparableBaseline:'NONE_AVAILABLE',invalidRetryPolicy:'At most one retry for invalid measurement only; never retry a valid budget failure',Lighthouse:'Not part of existing collector; not substituted; no installed supporting runner'};G.write('preflight.json',preflight);
 const browser=await chromium.launch({headless:true});let cookies;
 const campaign={schemaVersion:1,startedAt:new Date().toISOString(),approvalMode:'delegated_development_override',methodIdentity:method.identity,methodSha256:method.sha256,sourceBinding:gate,profileId:T.frozen.profileId,environment:{browser:browser.version(),Playwright:require('@playwright/test/package.json').version,Node:process.version,OS:os.type()+' '+os.release()+' '+os.arch()},plannedSamples:6,fullCertificationSamples:96,attempted:0,valid:0,invalid:0,retries:0,records:[],attemptJournal:[],interRunDelays:[],decision:'RUNNING',persistentShopifyMutations:0};
 const usedContexts=new Set();let previousEnd;
 try{
  cookies=await C.authenticate(browser);G.unchanged(frozen);G.write('campaign-start.json',{startedAt:campaign.startedAt,frozenMethodology:frozen,methodSha256:method.sha256,sourceBindingSha256:gate.sourceBindingSha256,authentication:'Only in-memory cookies; independent unlock context; no authentication requests admitted into samples'});
  const product=M.PRODUCTS.find(p=>p.gid==='gid://shopify/Product/8905779937477');assert.equal(product.route,'/products/beadmaster');
  for(const cache of ['cold','warm']){
   const row={productGid:product.gid,route:product.route,profile:'mobile',cache,classification:'RELEASE_CERTIFICATION',observations:[]};
   for(let slot=1;slot<=3;slot++){
    let valid=false;
    for(let retry=0;retry<=1;retry++){
     G.unchanged(frozen);if(previousEnd){const time=Date.now();await new Promise(r=>setTimeout(r,2500));campaign.interRunDelays.push({beforeAttempt:campaign.attempted+1,actualMs:Date.now()-time,requestedMs:2500});}
     campaign.attempted++;campaign.retries+=retry;let observed;
     try{observed=await C.collect(browser,product,'mobile',cache,cookies,usedContexts);}catch(e){observed={integrity:['Measurement exception: '+C.clean(e.message)]};}
     previousEnd=Date.now();const name='attempt-'+String(campaign.attempted).padStart(3,'0')+'-beadmaster-mobile-'+cache+'.json';G.write(name,observed);
     const item={attempt:campaign.attempted,slot,retry:!!retry,cache,evidence:G.DIR+'/'+name,valid:!observed.integrity.length,integrity:observed.integrity};campaign.attemptJournal.push(item);
     if(observed.integrity.length){campaign.invalid++;G.write('campaign.json',campaign);console.log(JSON.stringify(item));continue;}
     valid=true;campaign.valid++;row.observations.push(observed);console.log(JSON.stringify({attempt:campaign.attempted,cache,slot,state:'VALID',LCP:observed.sample.metrics.lcpMs.value,CLS:observed.sample.metrics.cls.value,TBT:observed.sample.metrics.tbtMs.value,requests:observed.wholePage.requestCount,violations:P.evaluateSample(observed.sample).concat(observed.wholePage.violations).length}));break;
    }
    if(!valid)throw Error('Repeated invalid canary slot; terminal request/provenance failure; no further samples authorized');
   }
   row.record={schemaVersion:1,stage:'release-certification',requestedRuns:3,samples:row.observations.map(o=>o.sample),medians:P.mediansFor(row.observations.map(o=>o.sample)),aggregationLabel:'RELEASE_CERTIFICATION',authorizationRef:G.DIR+'/preflight.json',widgetDecisionRef:'data/epic-f-current-development-status.json#F_DEC_001'};
   assert.ok(schema(row.record),JSON.stringify(schema.errors));row.violations=G.validateRecord(row).concat(row.observations.flatMap(o=>o.wholePage.violations));row.passed=!row.violations.length;row.wholePageMedians={requestCount:P.strictMedian(row.observations.map(o=>o.wholePage.requestCount)),transferBytes:P.strictMedian(row.observations.map(o=>o.wholePage.transferBytes))};campaign.records.push(row);G.write('campaign.json',campaign);
  }
  G.unchanged(frozen);campaign.decision=N.canaryDecision(campaign.records,campaign.valid);campaign.recorderIntegrity='RECORDER_INTEGRITY_CONFIRMED';campaign.canaryPerformance=campaign.decision==='CERTIFICATION_IN_PROGRESS'?'CANARY_PASS':'CANARY_PERFORMANCE_FAIL';campaign.remainingSamplesRequiredForSuccess=90;campaign.fullCampaignStoppedEarly=true;
 }catch(e){campaign.decision='BLOCKED_MEASUREMENT_INTEGRITY';campaign.error=C.clean(e.message);}
 finally{cookies=null;await browser.close();campaign.completedAt=new Date().toISOString();campaign.secretDisposal={cookiesPersisted:false,browserClosed:true,rawTracesPersisted:false};G.write('campaign.json',campaign);}
 console.log(JSON.stringify({decision:campaign.decision,attempted:campaign.attempted,valid:campaign.valid,invalid:campaign.invalid,records:campaign.records.length}));process.exitCode=campaign.decision==='BLOCKED_MEASUREMENT_INTEGRITY'?3:campaign.decision==='FAILED_CERTIFICATION_OPTIMIZATION_REQUIRED'?2:0;
}
if(require.main===module)main().catch(e=>{console.error(C.clean(e.message));process.exitCode=3;});
