'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),os=require('node:os');
const {chromium}=require('@playwright/test');
const C=require('./lib/epic-f-live-performance-collector'),G=require('./lib/epic-f-live-performance-campaign'),T=require('./lib/epic-f-live-performance-profile'),P=require('./lib/epic-f-performance'),M=require('./lib/epic-f-live-machine-activation');
async function main(){
 assert.equal(process.argv.length,2,'No scope/profile overrides permitted');fs.mkdirSync(G.DIR,{recursive:true});
 assert.equal(fs.existsSync(G.DIR+'/campaign-start.json'),false,'Existing campaign cannot be silently restarted/mixed');
 const profileTests=G.read(G.DIR+'/profile-cache-tests.json'),recorderTests=G.read(G.DIR+'/recorder-tests.json'),cutoffTests=G.read(G.DIR+'/cutoff-tests.json'),beaconTests=G.read(G.DIR+'/beacon-tests.json');assert.equal(profileTests.failed,0);assert.equal(recorderTests.failed,0);assert.equal(cutoffTests.failed,0);assert.equal(beaconTests.failed,0);assert.equal(beaconTests.preFixReproduction,false);
 const gate=G.verifyBefore(),frozen=G.freeze();
 const preflight={approvalMode:'delegated_development_override',approvedAt:'2026-10-07',scope:'CURRENT_ASSIGNED_ZERO_GRANT_MACHINE_SHELL',sourceBinding:gate,profile:T.frozen,profileSha256:G.hash(fs.readFileSync('data/epic-f-performance-profiles.json')),cold:'Independent fresh context, authentication cookies only, HTTP cache cleared, cache enabled, no inherited service-worker state and CDP bypass; first Product navigation measured',warm:'Independent fresh context, clear before same-route prime, load/fonts/1500ms, retain cache, second same-route Product navigation measured',settleMs:1500,interRunDelayMs:2500,plannedSamples:96,plannedRecords:32,cacheTestsPassed:profileTests.passed,recorderTestsPassed:recorderTests.passed,passed:true,frozenMethodology:frozen,invalidRetryPolicy:'At most one retry per invalid sample slot with independent context and unchanged methodology. Valid budget-failing samples never retried. Repeated invalid slot stops campaign as BLOCKED_MEASUREMENT_INTEGRITY.',Lighthouse:'Not part of existing custom machine collector; no installed Lighthouse. Supporting targets retained; no scores fabricated.',approvedComparableBaseline:'NONE_AVAILABLE'};
 G.write('preflight.json',preflight);
 const browser=await chromium.launch({headless:true});let cookies;
 const campaign={schemaVersion:1,startedAt:new Date().toISOString(),approvalMode:'delegated_development_override',sourceBinding:gate,profileId:T.frozen.profileId,profileSha256:preflight.profileSha256,environment:{browser:'Chromium',version:browser.version(),Playwright:require('@playwright/test/package.json').version,Node:process.version,OS:os.type()+' '+os.release()+' '+os.arch()},plannedSamples:96,plannedRecords:32,attempted:0,valid:0,invalid:0,retries:0,records:[],attemptJournal:[],interRunDelays:[],decision:'RUNNING',persistentShopifyMutations:0};
 const usedContexts=new Set();let previousEnd;
 try{
   cookies=await C.authenticate(browser);G.unchanged(frozen);G.write('campaign-start.json',{startedAt:campaign.startedAt,profileId:T.frozen.profileId,sourceBindingSha256:gate.sourceBindingSha256,frozenMethodology:frozen,authentication:'Separate unlock context; only memory cookies; no credential persistence',campaignRestartAuthorized:false});
   for(const product of M.PRODUCTS)for(const profile of ['mobile','desktop'])for(const cache of ['cold','warm']){
     const row={productGid:product.gid,route:product.route,profile,cache,classification:profile==='mobile'?'RELEASE_CERTIFICATION':'SUPPORTING_RELEASE_COMPARISON',observations:[],violations:[]};
     for(let slot=1;slot<=3;slot++){
       let valid=false;
       for(let attempt=1;attempt<=2;attempt++){
         G.unchanged(frozen);if(previousEnd){const start=Date.now();await new Promise(r=>setTimeout(r,2500));campaign.interRunDelays.push({beforeAttempt:campaign.attempted+1,requestedMs:2500,actualMs:Date.now()-start});}
         campaign.attempted++;if(attempt>1)campaign.retries++;
         let observed;
         try{observed=await C.collect(browser,product,profile,cache,cookies,usedContexts);}catch(e){observed={integrity:['Measurement exception: '+C.clean(e.message)]};}
         previousEnd=Date.now();const name=`attempt-${String(campaign.attempted).padStart(3,'0')}-${product.handle}-${profile}-${cache}.json`;G.write(name,observed);
         campaign.attemptJournal.push({attempt:campaign.attempted,slot,retry:attempt>1,productGid:product.gid,route:product.route,profile,cache,evidence:G.DIR+'/'+name,valid:!observed.integrity.length,integrity:observed.integrity});
         if(observed.integrity.length){campaign.invalid++;G.write('campaign.json',campaign);console.log(JSON.stringify({attempt:campaign.attempted,route:product.route,profile,cache,slot,state:'INVALID',reason:observed.integrity}));continue;}
         valid=true;campaign.valid++;row.observations.push(observed);const violations=P.evaluateSample(observed.sample).concat(observed.wholePage.violations);console.log(JSON.stringify({attempt:campaign.attempted,route:product.route,profile,cache,slot,state:violations.length?'VALID_WITH_CONTRACT_VIOLATIONS':'VALID_PASS',LCP:observed.sample.metrics.lcpMs.value,requests:observed.wholePage.requestCount,violations:violations.length}));break;
       }
       if(!valid)throw Error('Repeated invalid measurement slot; campaign stopped without fabricating observations');
     }
     row.record={schemaVersion:1,stage:profile==='mobile'?'release-certification':'preview-diagnostic',requestedRuns:3,samples:row.observations.map(o=>o.sample),medians:P.mediansFor(row.observations.map(o=>o.sample)),aggregationLabel:row.classification,authorizationRef:G.DIR+'/preflight.json',widgetDecisionRef:'data/epic-f-current-development-status.json#F_DEC_001'};
     row.violations=G.validateRecord(row).concat(row.observations.flatMap(o=>o.wholePage.violations));
     row.wholePageMedians={requestCount:P.strictMedian(row.observations.map(o=>o.wholePage.requestCount)),transferBytes:P.strictMedian(row.observations.map(o=>o.wholePage.transferBytes))};
     row.passed=!row.violations.length;campaign.records.push(row);G.write('campaign.json',campaign);
   }
   G.unchanged(frozen);assert.equal(campaign.valid,96);assert.equal(campaign.records.length,32);campaign.decision=campaign.records.every(r=>r.passed)?'COMPLETE':'FAILED_CERTIFICATION_OPTIMIZATION_REQUIRED';
 }catch(e){campaign.decision='BLOCKED_MEASUREMENT_INTEGRITY';campaign.error=C.clean(e.message);}
 finally{cookies=null;await browser.close();campaign.completedAt=new Date().toISOString();campaign.secretDisposal={browserClosed:true,cookiesPersisted:false,credentialsPersisted:false,traces:0,HARs:0};G.write('campaign.json',campaign);}
 console.log(JSON.stringify({decision:campaign.decision,attempted:campaign.attempted,valid:campaign.valid,invalid:campaign.invalid,retries:campaign.retries,records:campaign.records.length}));
 process.exitCode=campaign.decision==='COMPLETE'?0:campaign.decision==='FAILED_CERTIFICATION_OPTIMIZATION_REQUIRED'?2:3;
}
if(require.main===module)main().catch(e=>{console.error(C.clean(e.message));process.exitCode=3;});
