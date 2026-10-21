'use strict';
const fs=require('node:fs'),http=require('node:http'),assert=require('node:assert/strict'),{EventEmitter}=require('node:events');
const {chromium}=require('@playwright/test'),N=require('./lib/epic-f-live-performance-network-v2'),T=require('./lib/epic-f-live-performance-profile');
const DIR='docs/qa/evidence/epic-f/015b-recorder-v2-2026-10-07';
const tests=[];
function check(name,fn){fn();tests.push({name,passed:true});}
async function lifecycle(){
 const page=new EventEmitter(),session=new EventEmitter(),identity={contextId:'context-test',pageId:'B',targetId:'target-B',lifecycle:'MEASURED_NAVIGATION_LIFECYCLE'};
 const net=await N.recorder(page,session,identity,{drainMs:60});net.start();
 const request=(id,url='/native-telemetry',target=session)=>target.emit('Network.requestWillBeSent',{requestId:id,frameId:'frame-B',loaderId:'loader-B',timestamp:10,wallTime:Date.now()/1000,type:'Fetch',request:{url:'http://localhost'+url,method:'GET'},initiator:{type:'script',stack:{callFrames:[{scriptId:'1',url:'http://localhost/theme.js',functionName:'nativeTelemetry',lineNumber:1,columnNumber:1}]}}});
 request('normal','/asset.css');request('telemetry');request('drain');request('unresolved');request('failed');request('missing');
 session.emit('Network.loadingFinished',{requestId:'normal',encodedDataLength:200});session.emit('Network.loadingFinished',{requestId:'telemetry',encodedDataLength:42});session.emit('Network.loadingFailed',{requestId:'failed',errorText:'net::ERR_BLOCKED_BY_RESPONSE'});session.emit('Network.loadingFinished',{requestId:'missing'});
 net.cutoff();request('late','/after-window');setTimeout(()=>session.emit('Network.loadingFinished',{requestId:'drain',encodedDataLength:123}),15);
 const result=await net.stop(),rows=result.rows,by=id=>rows.find(r=>r.provenance.requestId===id);
 check('measured normal resource counts',()=>assert.equal(by('normal').bytes,200));
 check('measured telemetry counts without URL exclusion',()=>assert.equal(by('telemetry').bytes,42));
 check('admitted request finishes during terminal drain',()=>assert.equal(by('drain').terminalState,'COMPLETED_WITH_BYTES'));
 check('unresolved admitted request invalidates completeness',()=>assert.equal(by('unresolved').terminalState,'UNRESOLVED'));
 check('post-window request not admitted',()=>{assert.equal(rows.length,6);assert.equal(result.postWindow[0].requestId,'late');});
 check('explicit loadingFailed distinct from unresolved',()=>{assert.equal(by('failed').terminalState,'FAILED_WITH_CLASSIFIED_REASON');assert.notEqual(by('failed').terminalEvent,null);});
 check('missing encoded bytes remain null despite loadingFinished',()=>{assert.equal(by('missing').bytes,null);assert.equal(by('missing').terminalState,'UNRESOLVED');});
 check('provenance retains target frame loader ID timestamp and initiator',()=>{const p=by('normal').provenance;assert.equal(p.targetId,'target-B');assert.equal(p.frameId,'frame-B');assert.equal(p.loaderId,'loader-B');assert.equal(p.initiator.stack.callFrames[0].functionName,'nativeTelemetry');});
 check('bounded drain freezes metric/request window',()=>{assert.equal(result.window.maximumDrainMs,60);assert.equal(result.window.metricsExtendedDuringDrain,false);assert.ok(result.window.actualDrainMs<500);});net.dispose();
}
function cache(){
 const cold={cache:'cold',contextId:'cold-1',independentFreshContext:true,targetRoute:'/products/beadmaster',measuredRoute:'/products/beadmaster',serviceWorkers:'fresh-context; CDP bypass; no inherited registrations',cacheDisabled:false,cacheClearedAt:'2026-10-07T10:00:00Z',measuredAt:'2026-10-07T10:00:05Z',productNavigationsBeforeMeasurement:0,prime:null,cacheClearedAfterPrime:false,measuredPageId:'B',measuredTargetId:'target-B'};
 const warm={...cold,cache:'warm',contextId:'warm-1',productNavigationsBeforeMeasurement:1,sameBrowserContextCache:true,prime:{route:cold.targetRoute,pageId:'A',targetId:'target-A',startedAt:'2026-10-07T10:00:01Z',completedAt:'2026-10-07T10:00:02Z',completed:true,closedBeforeMeasuredNavigation:true}};
 check('cold policy unchanged and valid',()=>N.cacheProof(cold));check('warm requires isolated A/B sharing one context',()=>N.cacheProof(warm));
 for(const [name,patch]of[['warm without prime',{prime:null}],['wrong prime route',{prime:{...warm.prime,route:'/products/em-1'}}],['clear after prime',{cacheClearedAfterPrime:true}],['cold with prior navigation',{...cold,productNavigationsBeforeMeasurement:1}],['missing cache state',{cache:undefined}],['same target A/B',{measuredTargetId:'target-A'}],['same page A/B',{measuredPageId:'A'}],['unclosed prime',{prime:{...warm.prime,closedBeforeMeasuredNavigation:false}}],['CDN cached does not establish warm',{productNavigationsBeforeMeasurement:0,prime:null}]])check('reject '+name,()=>assert.throws(()=>N.cacheProof({...warm,...patch})));
 check('reject reused measured context',()=>assert.throws(()=>N.cacheProof(cold,new Set(['cold-1']))));
 check('no telemetry URL blacklist in V2 recorder',()=>assert.ok(!/monorail|produce_batch|otlp/.test(fs.readFileSync('scripts/lib/epic-f-live-performance-network-v2.js','utf8'))));
 const records=[{cache:'cold',passed:false,record:{samples:[1,2,3]}},{cache:'warm',passed:true,record:{samples:[1,2,3]}}];
 check('mandatory canary failure sufficient without remaining 90',()=>assert.equal(N.canaryDecision(records,6),'FAILED_CERTIFICATION_OPTIMIZATION_REQUIRED'));
 check('passing canary cannot certify full 96',()=>assert.equal(N.canaryDecision(records.map(r=>({...r,passed:true})),6),'CERTIFICATION_IN_PROGRESS'));
 check('missing samples cannot be certified',()=>assert.equal(N.canaryDecision(records,5),'BLOCKED_MEASUREMENT_INTEGRITY'));
}
async function browserTest(){
 let assets=0;const telemetry=[];
 const server=http.createServer((req,res)=>{if(req.url==='/asset.js'){assets++;res.writeHead(200,{'Content-Type':'application/javascript','Cache-Control':'public,max-age=3600'});res.end('window.localAssetLoaded=true;');}else if(req.url.startsWith('/.well-known/')){telemetry.push(req.url);res.end('native diagnostic receipt');}else{res.writeHead(200,{'Content-Type':'text/html','Cache-Control':'no-store'});res.end('<h1>Two target cache test</h1><script src="/asset.js"></script><script>fetch("/.well-known/native-measured-telemetry");addEventListener("pagehide",()=>navigator.sendBeacon("/.well-known/prime-unload-telemetry","prime"));</script>');}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch(),url='http://127.0.0.1:'+server.address().port+'/products/beadmaster';
 try{
  const c=await browser.newContext(),a=await c.newPage(),sa=await c.newCDPSession(a);await sa.send('Network.enable');await sa.send('Network.clearBrowserCache');await sa.send('Network.setCacheDisabled',{cacheDisabled:false});await sa.send('Network.setBypassServiceWorker',{bypass:true});const ap=await T.apply(sa),ta=(await sa.send('Target.getTargetInfo')).targetInfo.targetId;
  const na=await N.recorder(a,sa,{contextId:'local-warm',pageId:'A',targetId:ta,lifecycle:'PRIMING_LIFECYCLE'});na.start();await a.goto(url);await a.evaluate(()=>document.fonts.ready);await a.waitForTimeout(1500);na.cutoff();const prime=await na.stop(),first=assets;await a.close();na.dispose();
  const b=await c.newPage(),sb=await c.newCDPSession(b);await sb.send('Network.enable');await sb.send('Network.setCacheDisabled',{cacheDisabled:false});await sb.send('Network.setBypassServiceWorker',{bypass:true});const bp=await T.apply(sb),tb=(await sb.send('Target.getTargetInfo')).targetInfo.targetId;
  const nb=await N.recorder(b,sb,{contextId:'local-warm',pageId:'B',targetId:tb,lifecycle:'MEASURED_NAVIGATION_LIFECYCLE'});nb.start();await b.goto(url);await b.evaluate(()=>document.fonts.ready);await b.waitForTimeout(1500);nb.cutoff();const measured=await nb.stop();
  check('actual page B receives A-warmed HTTP cache',()=>{assert.equal(assets,first);assert.ok(measured.rows.find(r=>r.url.endsWith('/asset.js')).cache.servedFromCache);});
  check('actual prime unload telemetry occurred but is not in B record',()=>{assert.ok(telemetry.includes('/.well-known/prime-unload-telemetry'));assert.ok(!measured.rows.some(r=>r.url.includes('prime-unload-telemetry')));});
  check('actual page B telemetry counted',()=>assert.ok(measured.rows.some(r=>r.url.includes('native-measured-telemetry'))));
  check('actual target IDs differ and measured provenance is exclusively B',()=>{assert.notEqual(ta,tb);assert.ok(measured.rows.every(r=>r.provenance.targetId===tb));});
  check('all local measured request terminal and byte evidence complete',()=>{assert.equal(measured.ambiguity.length,0);assert.ok(measured.rows.every(r=>r.bytes!==null&&r.terminalState!=='UNRESOLVED'));assert.equal(measured.rows.length,3);});
  check('actual acknowledged throttle rule belongs to measured document',()=>assert.equal(measured.rows.find(r=>r.type==='Document').appliedNetworkRule,bp.ruleId));
  const details={browser:browser.version(),assetRequests:first,assetRequestsAfterWarm:assets,prime,measured,primeTelemetryObserved:telemetry,appliedPrime:ap,appliedMeasured:bp};nb.dispose();await c.close();
  const fresh=await browser.newContext(),p=await fresh.newPage(),s=await fresh.newCDPSession(p);await s.send('Network.enable');await s.send('Network.clearBrowserCache');await T.apply(s);await p.goto(url);check('fresh cold sample cannot inherit earlier context cache',()=>assert.equal(assets,first+1));await fresh.close();return details;
 }finally{await browser.close();await new Promise(r=>server.close(r));}
}
async function main(){fs.mkdirSync(DIR,{recursive:true});await lifecycle();cache();const actual=await browserTest();fs.writeFileSync(DIR+'/lifecycle-provenance-tests.json',JSON.stringify({assessedAt:new Date().toISOString(),passed:tests.length,failed:0,tests,actualChromium:actual,ShopifySamples:0},null,2)+'\n');console.log(JSON.stringify({passed:tests.length,failed:0,actualLocalRows:actual.measured.rows.length,primeUnloadObserved:true}));}
if(require.main===module)main().catch(e=>{console.error(e.stack);process.exitCode=1;});
