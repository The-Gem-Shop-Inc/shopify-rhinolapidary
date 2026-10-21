'use strict';
const assert = require('node:assert/strict');
const { evaluateRun, mediansFor, strictMedian, policyLimits, policyHash, metricNames, attributeResource } = require('./lib/epic-f-performance');
const Ajv = require('ajv/dist/2020');
const budget = require('../data/brand-performance-budget.json');
const baseline = require('../tests/fixtures/epic-f-performance-policy-baseline.json');
assert.equal(policyHash(budget), baseline.existingPolicySha256, 'existing performance budget changed');
assert.deepEqual(budget.machineProduct.thresholds, baseline.thresholdReferences, 'machine thresholds changed');
assert.equal(budget.machineProduct.releasePolicy.minimumMobileRuns,3);
const validate = new Ajv({strict:false,allErrors:true}).compile(require('../schemas/epic-f-performance-measurement.schema.json'));
const metric = value=>({status:'measured',value});
const route='/products/beadmaster', url='http://127.0.0.1:1234'+route;
function seed() {
  const sample={ timestamp:'2026-09-17T00:00:00Z', fixtureOnly:true, galleryState:'zero', environment:{kind:'local-fixture',theme:{id:null,name:null,verified:false}},
    identity:{requestedUrl:url,resolvedUrl:url,requestedRoute:route,resolvedRoute:route,productGid:'gid://shopify/Product/8905779937477',template:'product.machine'},
    navigation:{completed:true,status:200,pageKind:'product',password:false,challenge:false},viewport:{profile:'mobile',width:390,height:900,deviceScaleFactor:1},
    policy:{cache:'cold-no-store',throttling:{id:'none-local-fixture'},settleMs:budget.runtime.settleMs,settlePolicy:'unit contract only'},
    networkObservation:'complete',resources:[{url,type:'Document',bytes:1000,status:200,completed:true,attribution:'first-party'}],
    metrics:Object.fromEntries(metricNames.map(n=>[n,metric(n==='lcpMs'?100:n==='initialTransferBytes'?1000:n==='requestCount'?1:0)])),
    media:{dimensionsValid:true,secondaryLazy:true,firstScreenSources:[]},duplicateProductScripts:0,blockingMetric:'unit example of governed proxy' };
  return {schemaVersion:1,stage:'fixture-regression',requestedRuns:1,samples:[sample],medians:mediansFor([sample]),aggregationLabel:'synthetic unit record; not a measurement'};
}
let count=0;
function check(name,fn){fn();count++;console.log(`PASS ${name}`);}
check('valid explicit measured zero / local identity',()=>{const r=seed();assert(validate(r),JSON.stringify(validate.errors));assert.deepEqual(evaluateRun(r),[]);});
for(const [name,mutate,pattern] of [
  ['missing metric is not zero',r=>delete r.samples[0].metrics.cls,'missing/unsupported'],
  ['unsupported metric is not zero',r=>r.samples[0].metrics.tbtMs={status:'unsupported',value:null},'missing/unsupported'],
  ['404 cannot count as Product',r=>r.samples[0].navigation.status=404,'navigation'],
  ['navigation failure',r=>r.samples[0].navigation.completed=false,'navigation'],
  ['error page',r=>r.samples[0].navigation.pageKind='error','non-Product'],
  ['password page',r=>r.samples[0].navigation.password=true,'password'],
  ['challenge page',r=>r.samples[0].navigation.challenge=true,'challenge'],
  ['non-Product route',r=>r.samples[0].identity.resolvedRoute='/pages/contact','route'],
  ['wrong template',r=>r.samples[0].identity.template='product','template'],
  ['unknown Product',r=>r.samples[0].identity.productGid='gid://shopify/Product/1','unknown Product'],
  ['missing environment',r=>delete r.samples[0].environment,'environment'],
  ['missing network',r=>r.samples[0].resources=[],'network'],
  ['unfinished network',r=>r.samples[0].resources[0].completed=false,'network'],
  ['fabricated zero transfer',r=>r.samples[0].metrics.initialTransferBytes.value=0,'accounting mismatch'],
  ['oversized initial image',r=>r.samples[0].metrics.maxImageBytes.value=policyLimits('mobile').maxImageBytes+1,'maxImageBytes: budget'],
  ['oversized secondary',r=>r.samples[0].secondaryInspection={observation:'complete',maxImageBytes:600000},'secondary image budget'],
  ['eager secondary',r=>r.samples[0].media.secondaryLazy=false,'eagerly'],
  ['eager video iframe',r=>r.samples[0].metrics.immediateVideoIframeCount.value=1,'immediateVideoIframeCount: budget'],
  ['eager provider without iframe',r=>r.samples[0].resources.push({url:'https://www.youtube.com/embed/x',type:'Fetch',bytes:1,status:200,completed:true,attribution:'third-party'}),'eager video provider'],
  ['autoplay',r=>r.samples[0].metrics.autoplayMediaCount.value=1,'autoplayMediaCount: budget'],
  ['synchronous third party',r=>r.samples[0].metrics.synchronousThirdPartyScriptCount.value=1,'synchronousThirdPartyScriptCount: budget'],
  ['duplicate Product initialization',r=>r.samples[0].duplicateProductScripts=1,'duplicate Product'],
  ['dimensions missing',r=>r.samples[0].media.dimensionsValid=false,'dimensions'],
  ['malformed sample set',r=>r.samples=null,'malformed sample'],
  ['null sample',r=>r.samples=[null],'malformed sample'],
  ['fewer runs than requested',r=>r.requestedRuns=3,'run count'],
  ['incorrect median',r=>r.medians.lcpMs=0,'median'],
  ['fixture cannot certify preview',r=>r.stage='preview-diagnostic','fixture-only'],
  ['one run cannot certify release',r=>r.stage='release-certification','at least three'],
]) check(name,()=>{const r=seed();mutate(r);assert(evaluateRun(r).some(e=>e.includes(pattern)),JSON.stringify(evaluateRun(r)));});
check('release sample count, actual theme, throttle and median contract',()=>{
  const r=seed();r.stage='release-certification';r.requestedRuns=3;r.authorizationRef='unit:authorization';r.widgetDecisionRef='unit:accepted-dependency';
  const s=r.samples[0];s.fixtureOnly=false;s.environment={kind:'preview',theme:{id:'unit-theme',name:'unit only',verified:true}};
  s.identity.requestedUrl=s.identity.resolvedUrl='https://unit-test.invalid'+route;s.resources[0].url=s.identity.requestedUrl;
  s.policy.throttling={id:'slow-4g',latencyMs:150,downloadBytesPerSecond:200000,uploadBytesPerSecond:90000,cpuSlowdown:4};
  r.samples=[s,structuredClone(s),structuredClone(s)];r.samples[1].metrics.lcpMs.value=200;r.samples[2].metrics.lcpMs.value=150;r.medians=mediansFor(r.samples);
  assert.equal(r.medians.lcpMs,150);assert.deepEqual(evaluateRun(r),[]);assert(validate(r),JSON.stringify(validate.errors));
  r.samples[0].environment.theme.verified=false;assert(evaluateRun(r).some(e=>e.includes('theme identity')));
});
check('strict median rejects absent values and sorts numerically',()=>{assert.equal(strictMedian([300,100,200]),200);assert.equal(strictMedian([10,20]),15);for(const bad of [[],[1,undefined],[1,NaN],[1,'2']])assert.throws(()=>strictMedian(bad));});
check('schema cannot omit observation or routing identity',()=>{const r=seed();delete r.samples[0].metrics.cls;assert(!validate(r));});
check('native/provider/preview/Rhino attribution',()=>{
  for(const [url,expected] of [['https://shop.app/pay/wallet','native-payment-provider'],['https://cdn.shopify.com/shopify-preview-bar.js','preview-tooling'],['http://127.0.0.1:1234/assets/rhino-custom.css','rhino-theme'],['http://127.0.0.1:1234/assets/global.js','native-trade-theme'],['https://unknown.invalid/tool.js','third-party']])assert.equal(attributeResource({url},'http://127.0.0.1:1234'),expected);
});
console.log(`${count} performance contract checks passed; existing policy hash and machine threshold references unchanged.`);
