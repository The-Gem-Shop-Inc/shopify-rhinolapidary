'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),os=require('node:os');
const {chromium}=require('@playwright/test'),Ajv=require('ajv/dist/2020');
const C=require('./lib/epic-f-live-performance-collector-v3'),G=require('./lib/epic-f-live-performance-campaign-v3'),N=require('./lib/epic-f-live-performance-network-v3'),T=require('./lib/epic-f-live-performance-profile'),P=require('./lib/epic-f-performance'),M=require('./lib/epic-f-live-machine-activation');
const schema=new Ajv({allErrors:true,strict:false}).compile(G.read('schemas/epic-f-performance-measurement.schema.json'));
function freezeMethod(){
  assert.ok(!fs.existsSync(G.DIR+'/recorder-binding.json'),'V3 binding already frozen');
  for(const file of ['local-tests.json','profile-cache-tests.json','schema-safety-tests.json'])assert.equal(G.read(G.DIR+'/'+file).failed,0);
  const frozen=G.freeze();
  const body={identity:'EPIC_F_015B_LIVE_RECORDER_V3',specification:G.read('data/epic-f-performance-recorder-v3.json'),files:frozen.tooling};
  const binding={...body,sha256:G.hash(JSON.stringify(body))};
  G.write('recorder-binding.json',binding);G.write('frozen-methodology.json',frozen);
  console.log(JSON.stringify({frozen:true,identity:binding.identity,sha256:binding.sha256,liveSamples:0}));
}
function sampleSchema(sample){return schema({schemaVersion:1,stage:'release-certification',requestedRuns:1,samples:[sample],medians:null,aggregationLabel:'RELEASE_CERTIFICATION'});}
async function main(){
  assert.equal(process.argv.length,2,'Canary scope fixed; no overrides');
  assert.ok(!fs.existsSync(G.DIR+'/campaign-start.json'),'No restart or mixing a frozen V3 run');
  const gate=G.verifyBefore(),binding=G.read(G.DIR+'/recorder-binding.json'),frozen=G.read(G.DIR+'/frozen-methodology.json');
  const {sha256,...body}=binding;assert.equal(G.hash(JSON.stringify(body)),sha256);G.unchanged(frozen);
  const campaign={schemaVersion:1,startedAt:new Date().toISOString(),approvalMode:'delegated_development_override',methodIdentity:binding.identity,methodSha256:sha256,sourceBinding:gate,profileId:T.frozen.profileId,plannedSamples:6,fullCertificationSamples:96,attempted:0,valid:0,invalid:0,retries:0,records:[],attemptJournal:[],interRunDelays:[],probe:{predeclared:true,planned:1,attempted:0,valid:false,retainedAsColdSample1:false,noAutomaticRetry:true,identicalFrozenCertificationMethod:true},decision:'RUNNING',persistentShopifyMutations:0,fullCampaignRun:false};
  G.write('preflight.json',{checkedAt:new Date().toISOString(),gate,methodIdentity:binding.identity,methodSha256:sha256,CDP:T.parameters(),probe:campaign.probe,plannedSamples:6,remaining90AuthorizedThisTask:false});
  const browser=await chromium.launch({headless:true});let cookies,previousEnd;
  const usedContexts=new Set(),observations={cold:[],warm:[]},product=M.PRODUCTS.find(p=>p.gid==='gid://shopify/Product/8905779937477');
  assert.equal(product.route,'/products/beadmaster');campaign.environment={browser:browser.version(),Playwright:require('@playwright/test/package.json').version,Node:process.version,OS:os.type()+' '+os.release()};
  try{
    cookies=await C.authenticate(browser);G.unchanged(frozen);
    G.write('campaign-start.json',{startedAt:campaign.startedAt,frozenMethodology:frozen,methodSha256:sha256,sourceBindingSha256:gate.sourceBindingSha256,probePredeclared:true,authentication:'Separate unlock context; cookies only in memory; no authentication admitted into measured sample'});
    for(const cache of ['cold','warm'])for(let slot=1;slot<=3;slot++){
      const probe=cache==='cold'&&slot===1;let accepted=false;
      for(let retry=0;retry<=(probe?0:1);retry++){
        G.unchanged(frozen);
        if(previousEnd){const start=Date.now();await new Promise(r=>setTimeout(r,2500));campaign.interRunDelays.push({beforeAttempt:campaign.attempted+1,requestedMs:2500,actualMs:Date.now()-start});}
        campaign.attempted++;campaign.retries+=retry;if(probe)campaign.probe.attempted++;
        let result;try{result=await C.collect(browser,product,'mobile',cache,cookies,usedContexts);}catch(error){result={integrity:['Measurement exception: '+C.clean(error.message)]};}
        previousEnd=Date.now();
        if(!result.integrity.length){
          if(!sampleSchema(result.sample))result.integrity.push('Sample schema invalid: '+JSON.stringify(schema.errors));
          if(!result.wholePage||!Number.isFinite(result.wholePage.transferBytes)||!Number.isFinite(result.wholePage.requestCount))result.integrity.push('Missing whole-page observation');
          if(P.metricNames.some(name=>result.sample.metrics[name]?.status!=='measured'||!Number.isFinite(result.sample.metrics[name].value)))result.integrity.push('Missing required metric');
          if(result.sample.metrics.lcpMs.value<=0)result.integrity.push('Missing LCP candidate');
          if(result.sample.networkObservation!=='complete')result.integrity.push('Existing certification network-observation contract incomplete');
        }
        const name='attempt-'+String(campaign.attempted).padStart(3,'0')+'-beadmaster-mobile-'+cache+'.json';G.write(name,result);
        const attempt={attempt:campaign.attempted,cache,slot,probe,retry:!!retry,valid:result.integrity.length===0,evidence:G.DIR+'/'+name,integrity:result.integrity};campaign.attemptJournal.push(attempt);
        if(probe){Object.assign(campaign.probe,{valid:attempt.valid,evidence:attempt.evidence,invalidReason:attempt.valid?null:result.integrity,retainedAsColdSample1:attempt.valid});G.write('integrity-probe.json',{...campaign.probe,methodIdentity:binding.identity,methodSha256:sha256,sourceBindingSha256:gate.sourceBindingSha256});}
        if(!attempt.valid){campaign.invalid++;G.write('campaign.json',campaign);console.log(JSON.stringify(attempt));if(probe)throw Error('Single integrity probe invalid; no retry, warm or further canary permitted');if(result.safety?.length||result.networkLifecycle?.safety?.length)throw Error('Unexpected transaction/navigation: stop immediately');continue;}
        campaign.valid++;observations[cache].push(result);accepted=true;G.write('campaign.json',campaign);console.log(JSON.stringify({attempt:campaign.attempted,cache,slot,probe,integrity:'VALID',performanceGraded:false}));break;
      }
      if(!accepted)throw Error('Invalid canary slot and allowed retry; no further samples');
    }
    assert.equal(campaign.valid,6);
    // Only now evaluate individual samples and triplets; never grade a probe or
    // partial canary from historical performance or discard a valid slow sample.
    for(const cache of ['cold','warm']){
      const row={productGid:product.gid,route:product.route,profile:'mobile',cache,classification:'RELEASE_CERTIFICATION',observations:observations[cache]};
      row.record={schemaVersion:1,stage:'release-certification',requestedRuns:3,samples:row.observations.map(o=>o.sample),medians:P.mediansFor(row.observations.map(o=>o.sample)),aggregationLabel:'RELEASE_CERTIFICATION',authorizationRef:G.DIR+'/preflight.json',widgetDecisionRef:'data/epic-f-current-development-status.json#F_DEC_001'};
      assert.ok(schema(row.record),JSON.stringify(schema.errors));row.violations=P.evaluateRun(row.record).concat(row.observations.flatMap(o=>o.wholePage.violations));row.passed=row.violations.length===0;
      row.wholePageMedians={requestCount:P.strictMedian(row.observations.map(o=>o.wholePage.requestCount)),transferBytes:P.strictMedian(row.observations.map(o=>o.wholePage.transferBytes))};campaign.records.push(row);
    }
    G.unchanged(frozen);campaign.decision=N.canaryDecision(campaign.records,6);campaign.recorderIntegrity='RECORDER_INTEGRITY_CONFIRMED';campaign.canaryPerformance=campaign.decision==='CERTIFICATION_IN_PROGRESS'?'CANARY_PASS':'CANARY_PERFORMANCE_FAIL';campaign.remainingSamplesRequiredForSuccess=90;
  }catch(error){campaign.decision='BLOCKED_MEASUREMENT_INTEGRITY';campaign.error=C.clean(error.message);}
  finally{cookies=null;await browser.close();campaign.completedAt=new Date().toISOString();campaign.secretDisposal={cookiesPersisted:false,browserClosed:true};G.write('campaign.json',campaign);}
  console.log(JSON.stringify({decision:campaign.decision,probe:campaign.probe,attempted:campaign.attempted,valid:campaign.valid,invalid:campaign.invalid,retries:campaign.retries,fullCampaignRun:false}));
  process.exitCode=campaign.decision==='BLOCKED_MEASUREMENT_INTEGRITY'?3:campaign.decision==='FAILED_CERTIFICATION_OPTIMIZATION_REQUIRED'?2:0;
}
if(require.main===module){if(process.argv.length===3&&process.argv[2]==='--freeze'){try{freezeMethod();}catch(error){console.error(C.clean(error.message));process.exitCode=1;}}else main().catch(error=>{console.error(C.clean(error.message));process.exitCode=3;});}
module.exports={freezeMethod};
