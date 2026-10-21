'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),{EventEmitter}=require('node:events');
const {chromium}=require('@playwright/test');
const N=require('./lib/epic-f-live-performance-network-v3'),Guard=require('./lib/epic-f-live-performance-guard-v3'),T=require('./lib/epic-f-live-performance-profile');
const DIR='docs/qa/evidence/epic-f/015b-recorder-v3-2026-10-10';
const tests=[];function check(group,name,fn){fn();tests.push({group,name,passed:true});}
const identity={contextId:'unit-context',pageId:'B',targetId:'B-target',lifecycle:'MEASURED_NAVIGATION_LIFECYCLE'};
async function ledgerTests(){
  const page=new EventEmitter(),cdp=new EventEmitter(),net=await N.recorder(page,cdp,identity,{drainMs:40,childTargets:false});
  let seq=0;const request=(id,options={})=>cdp.emit('Network.requestWillBeSent',{requestId:id,frameId:options.frame||'main',loaderId:'loader',documentURL:'https://fixture.invalid/products/beadmaster',timestamp:10+seq++/100,wallTime:100,...options,type:options.type||'Script',request:{url:options.url||'https://fixture.invalid/same.js',method:'get',...options.request}});
  const finish=(id,bytes=100)=>cdp.emit('Network.loadingFinished',{requestId:id,timestamp:20,encodedDataLength:bytes});
  net.start();
  for(const [id,opts] of [['a',{}],['b',{}],['c',{type:'XHR'}],['d',{frame:'child'}],['e',{wallTime:100.00001}],['f',{timestamp:1}],['g',{timestamp:15}]]){request(id,opts);finish(id);}
  request('redirect',{url:'https://fixture.invalid/redirect'});request('redirect',{url:'https://fixture.invalid/final.js',redirectResponse:{status:302,mimeType:'text/html',encodedDataLength:67}});finish('redirect',200);
  request('cache');cdp.emit('Network.requestServedFromCache',{requestId:'cache'});cdp.emit('Network.responseReceived',{requestId:'cache',response:{status:200,mimeType:'text/javascript',fromDiskCache:true,fromPrefetchCache:true,fromServiceWorker:false}});finish('cache',0);
  request('drain');request('unresolved');request('missing');finish('missing',undefined); // default finish arg would be 100; explicitly omit field below
  cdp.emit('Network.loadingFinished',{requestId:'missing',timestamp:20});
  request('failed');cdp.emit('Network.dataReceived',{requestId:'failed',timestamp:12,encodedDataLength:9,dataLength:20});cdp.emit('Network.loadingFailed',{requestId:'failed',timestamp:21,errorText:'net::ERR_BLOCKED_BY_RESPONSE',blockedReason:'corp-not-same-origin'});
  request('not-zero');cdp.emit('Network.responseReceived',{requestId:'not-zero',response:{status:200,mimeType:'text/javascript',fromDiskCache:true}});cdp.emit('Network.loadingFinished',{requestId:'not-zero',timestamp:22});
  // Timing accessor throws if the certification ledger even attempts a join.
  page.emit('request',{url:()=> 'https://fixture.invalid/unmatched.js',method:()=> 'GET',resourceType:()=> 'Script',timing:()=>{throw Error('Timing join forbidden');},sizes:()=>{throw Error('Sizes authority forbidden');}});
  net.cutoff();request('late');setTimeout(()=>finish('drain',321),5);
  const result=await net.stop(),by=(id,leg=0)=>result.rows.find(r=>r.id===id&&r.leg===leg);
  for(const [name,fn] of [
    ['ordinary loadingFinished authoritative bytes',()=>assert.equal(by('a').bytes,100)],
    ['same URL twice retains independent CDP IDs',()=>assert.notEqual(by('a').resourceKey,by('b').resourceKey)],
    ['simultaneous same URL and wall time distinct',()=>assert.equal(result.rows.filter(r=>r.id==='a'||r.id==='b').length,2)],
    ['same URL different resource types',()=>assert.equal(by('c').resourceType,'xhr')],
    ['same URL different frames',()=>assert.equal(by('d').provenance.frameId,'child')],
    ['near-identical wall time never merged',()=>assert.ok(by('e'))],
    ['throttle event ordering never joins timing',()=>assert.ok(by('f')&&by('g'))],
    ['redirect leg ordinals preserve chain',()=>assert.equal(result.rows.filter(r=>r.id==='redirect').length,2)],
    ['redirect response terminalizes previous leg',()=>assert.equal(by('redirect').bytes,67)],
    ['final redirect leg has only one record',()=>assert.equal(by('redirect',1).bytes,200)],
    ['cache indicators from CDP',()=>assert.equal(by('cache').cache.servedFromCache,true)],
    ['disk and prefetch cache evidence retained',()=>assert.ok(by('cache').cache.fromDiskCache&&by('cache').cache.fromPrefetchCache)],
    ['no duplicate authoritative keys',()=>assert.equal(result.duplicateKeys,0)],
    ['no ambiguous timing identity',()=>assert.equal(result.ambiguity.length,0)],
    ['Playwright diagnostic mismatch cannot enter inventory',()=>assert.ok(!result.rows.some(r=>r.url.includes('unmatched')))],
    ['zero required Playwright timing matches',()=>assert.equal(result.requiredPlaywrightTimingMatches,0)],
    ['target/frame/loader/timestamps/initiator retained',()=>{const p=by('a').provenance;assert.ok(p.targetId&&p.frameId&&p.loaderId);assert.equal(p.wallTime,100);assert.ok(p.initiator);}]
  ])check('request-identity',name,fn);
  for(const [name,fn] of [
    ['terminal drain completes admitted request',()=>assert.equal(by('drain').bytes,321)],
    ['explicit measured zero accepted',()=>assert.equal(by('cache').bytes,0)],
    ['missing encodedDataLength stays null',()=>assert.equal(by('missing').bytes,null)],
    ['loadingFailed distinct from unresolved',()=>assert.equal(by('failed').terminalState,'FAILED_WITH_CLASSIFIED_REASON')],
    ['dataReceived cannot supply failed transfer',()=>assert.equal(by('failed').bytes,null)],
    ['cache indication cannot invent zero bytes',()=>assert.equal(by('not-zero').bytes,null)],
    ['unresolved request invalidates sample',()=>assert.equal(N.integrity(result),false)],
    ['post-window request not admitted',()=>assert.ok(!by('late'))],
    ['post-window incomplete request diagnostic only',()=>assert.equal(result.postWindow.find(r=>r.id==='late').provenance.membership,'POST_WINDOW_DIAGNOSTIC')],
    ['drain does not extend metrics',()=>assert.equal(result.window.metricsExtendedDuringDrain,false)]
  ])check('transfer-integrity',name,fn);net.dispose();
  for(const [name,event] of [['duplicate ID without redirect','duplicate'],['harness inspector passive block','block']]){
    const p=new EventEmitter(),s=new EventEmitter(),n=await N.recorder(p,s,identity,{drainMs:0,childTargets:false});n.start();const e={requestId:'id',type:'Script',request:{url:'https://fixture.invalid/checkouts/internal/preloads.js',method:'GET'}};s.emit('Network.requestWillBeSent',e);
    if(event==='duplicate')s.emit('Network.requestWillBeSent',e);else s.emit('Network.loadingFailed',{requestId:'id',errorText:'inspector',blockedReason:'inspector'});
    n.cutoff();const o=await n.stop();check(event==='duplicate'?'request-identity':'transfer-integrity',name+' is fail-closed',()=>assert.equal(N.integrity(o),false));n.dispose();
  }
  const p=new EventEmitter(),s=new EventEmitter(),n=await N.recorder(p,s,identity,{drainMs:0,childTargets:false});n.start();s.emit('Network.requestWillBeSent',{requestId:'ok',type:'Script',request:{url:'https://fixture.invalid/a.js',method:'GET'}});s.emit('Network.loadingFinished',{requestId:'ok',encodedDataLength:0});n.cutoff();s.emit('Network.requestWillBeSent',{requestId:'late',type:'Fetch',request:{url:'https://fixture.invalid/late',method:'GET'}});check('transfer-integrity','incomplete post-window traffic cannot invalidate complete ledger',()=>assert.equal(N.integrity(n.snapshot()),true));s.emit('Network.loadingFailed',{requestId:'late',errorText:'inspector',blockedReason:'inspector'});check('transfer-integrity','post-window failure cannot invalidate measured transfer completeness',()=>assert.equal(N.integrity(n.snapshot()),true));n.dispose();
  const pp=new EventEmitter(),ss=new EventEmitter(),nn=await N.recorder(pp,ss,identity,{drainMs:0,childTargets:false});nn.start();ss.emit('Network.requestWillBeSent',{requestId:'redirect-after',type:'Script',request:{url:'https://fixture.invalid/redirect',method:'GET'}});nn.cutoff();ss.emit('Network.requestWillBeSent',{requestId:'redirect-after',type:'Script',redirectResponse:{status:302,encodedDataLength:40},request:{url:'https://fixture.invalid/after',method:'GET'}});check('request-identity','post-window redirect terminalizes old leg without admitting new leg',()=>{const o=nn.snapshot();assert.equal(o.rows.length,1);assert.equal(o.rows[0].bytes,40);assert.equal(o.postWindow.length,1);assert.equal(N.integrity(o),true);});nn.dispose();
  const pc=new EventEmitter(),sc=new EventEmitter(),nc=await N.recorder(pc,sc,identity,{drainMs:0,childTargets:false});nc.start();sc.emit('Network.requestWillBeSent',{requestId:'late-clock',timestamp:50,type:'Fetch',request:{url:'https://fixture.invalid/late-clock',method:'GET'}});nc.cutoff(40);check('request-identity','CDP metric timestamp excludes event newer than cutoff',()=>{const o=nc.snapshot();assert.equal(o.rows.length,0);assert.equal(o.postWindow[0].provenance.membership,'POST_WINDOW_DIAGNOSTIC');});nc.dispose();
}
function guardTests(){
  const passes=[
    ['/checkouts/internal/preloads.js','Script','GET'],['https://shop.app/checkouts/internal/preloads.js','Script','GET'],
    ['/checkouts/internal/preloads.js','script','HEAD'],['https://shop.app/pay/payment-terms.js','Script','GET'],
    ['/assets/product-info.js','Script','GET'],['/assets/theme.css','Stylesheet','GET'],['/preload','Fetch','GET'],
    ['/font.woff2','Font','GET'],['/image.png','Image','GET'],['/pay/preload','XHR','GET'],
    ['/telemetry','Fetch','POST'],['https://monorail-edge.shopifysvc.com/v1/produce','Fetch','POST'],
    ['/pay/metrics','Fetch','GET'],['/assets/checkout-helper.js','Script','GET']
    ,['https://shop.app/pay/payment-terms','Fetch','POST'],['https://shop.app/pay/metrics','Fetch','POST']
  ];
  for(const [url,type,method]of passes)check('guard',method+' '+type+' '+url+' passes',()=>assert.equal(Guard.classifyRequest({url:new URL(url,'https://fixture.invalid').href,resourceType:type,method,hasPostData:method==='POST'}).classification,'PASSIVE_RESOURCE'));
  for(const endpoint of ['/cart/add.js','/cart/change.js','/cart/update.js','/cart/clear.js','/contact','/checkout','/checkouts/action','/orders','/account','/pay/transaction'])check('guard','POST '+endpoint+' invalidates',()=>assert.equal(Guard.classifyRequest({url:'https://fixture.invalid'+endpoint,resourceType:'Fetch',method:'post',hasPostData:true}).classification,'TRANSACTION'));
  check('guard','GET checkout main document navigation invalidates',()=>assert.equal(Guard.classifyRequest({url:'https://fixture.invalid/checkout',resourceType:'Document',method:'GET',isNavigation:true,isMainFrame:true}).classification,'TRANSACTION'));
  check('guard','passive payment iframe document not a transaction',()=>assert.equal(Guard.classifyRequest({url:'https://shop.app/pay/payment-terms',resourceType:'Document',method:'GET',isNavigation:true,isMainFrame:false}).classification,'PASSIVE_RESOURCE'));
  check('guard','uppercase normalized at ingress',()=>{const r=Guard.classifyRequest({url:'https://fixture.invalid/checkouts/internal/preloads.js',resourceType:'SCRIPT',method:'head'});assert.equal(r.resourceType,'script');assert.equal(r.method,'HEAD');});
  for(const dest of ['/checkout','/cart/add','/challenge','/account/login','/error','/products/other','https://shop.app/pay/transaction'])check('guard','main-frame departure '+dest,()=>assert.equal(Guard.expectedNavigation(new URL(dest,'https://fixture.invalid').href,'https://fixture.invalid/products/beadmaster'),false));
  check('guard','expected Product main navigation allowed',()=>assert.equal(Guard.expectedNavigation('https://fixture.invalid/products/beadmaster','https://fixture.invalid/products/beadmaster'),true));
  for(const file of ['scripts/lib/epic-f-live-performance-collector-v3.js','scripts/lib/epic-f-live-performance-network-v3.js'])check('guard','no interception in '+file,()=>assert.ok(!/setBlockedURLs|Fetch\.enable|\.route\(|\.abort\(|\.fulfill\(/.test(fs.readFileSync(file,'utf8'))));
  check('guard','CDP ledger contains no timing/sizes join',()=>assert.ok(!/\.timing\(|\.sizes\(|playwrightStartTime|cdpCorrelated/.test(fs.readFileSync('scripts/lib/epic-f-live-performance-network-v3.js','utf8'))));
  const record={record:{samples:[1,2,3]}};check('decision','six valid mandatory failure suffices without remaining90',()=>assert.equal(N.canaryDecision([{...record,cache:'cold',passed:false},{...record,cache:'warm',passed:true}],6),'FAILED_CERTIFICATION_OPTIMIZATION_REQUIRED'));
  check('decision','passing canary cannot mark full certification complete',()=>assert.equal(N.canaryDecision([{...record,cache:'cold',passed:true},{...record,cache:'warm',passed:true}],6),'CERTIFICATION_IN_PROGRESS'));
  check('decision','five valid samples cannot be graded',()=>assert.equal(N.canaryDecision([],5),'BLOCKED_MEASUREMENT_INTEGRITY'));
}
function cacheTests(){
  const cold={cache:'cold',contextId:'cold',independentFreshContext:true,targetRoute:'/products/beadmaster',measuredRoute:'/products/beadmaster',serviceWorkers:'fresh-context; CDP bypass; no inherited registrations',cacheDisabled:false,cacheClearedAt:'2026-10-10T10:00:00Z',measuredAt:'2026-10-10T10:00:05Z',productNavigationsBeforeMeasurement:0,prime:null,cacheClearedAfterPrime:false,measuredPageId:'B',measuredTargetId:'B'};
  const warm={...cold,cache:'warm',contextId:'warm',sameBrowserContextCache:true,productNavigationsBeforeMeasurement:1,prime:{route:cold.targetRoute,pageId:'A',targetId:'A',startedAt:'2026-10-10T10:00:01Z',completedAt:'2026-10-10T10:00:02Z',completed:true,closedBeforeMeasuredNavigation:true}};
  check('cache','valid independent cold',()=>N.cacheProof(cold));check('cache','valid same-context two-page warm',()=>N.cacheProof(warm));
  for(const [name,patch]of [['missing prime',{prime:null}],['wrong route',{prime:{...warm.prime,route:'/products/other'}}],['same target',{measuredTargetId:'A'}],['same page',{measuredPageId:'A'}],['unclosed prime',{prime:{...warm.prime,closedBeforeMeasuredNavigation:false}}],['clear after prime',{cacheClearedAfterPrime:true}],['cold primed',{...cold,productNavigationsBeforeMeasurement:1}]])check('cache',name+' rejected',()=>assert.throws(()=>N.cacheProof({...warm,...patch})));
  check('cache','context reuse rejected',()=>assert.throws(()=>N.cacheProof(cold,new Set(['cold']))));
}
async function browserTests(){
  const hits={},received=[];let port;
  const server=http.createServer((req,res)=>{const u=new URL(req.url,'http://fixture.invalid');hits[u.pathname]=(hits[u.pathname]||0)+1;received.push({path:u.pathname,method:req.method});
    if(u.pathname==='/redirect'){res.writeHead(302,{Location:'/final.js'});res.end('redirect');}
    else if(u.pathname==='/frame'){res.setHeader('Content-Type','text/html');res.end('<script src="/checkouts/internal/preloads.js"></script><script>fetch("/same-url",{cache:"no-store"});</script>');}
    else if(u.pathname==='/worker.js'){res.setHeader('Content-Type','application/javascript');res.end('fetch("/worker-resource").then(()=>postMessage("ready"));');}
    else if(u.pathname==='/products/beadmaster'){res.setHeader('Content-Type','text/html');res.setHeader('Cache-Control','no-store');res.end('<h1>BeadMaster fixture</h1><script src="/cache.js"></script><script src="/checkouts/internal/preloads.js"></script><script src="/redirect"></script><iframe src="http://localhost:'+port+'/frame"></iframe><script>window.fixtureReady=new Promise(resolve=>{const worker=new Worker("/worker.js");worker.onmessage=()=>resolve();});Promise.all([fetch("/same-url",{cache:"no-store"}),fetch("/same-url",{cache:"no-store"})]);fetch("/measured-telemetry",{method:"POST",body:"fixture"});addEventListener("pagehide",()=>navigator.sendBeacon("/prime-unload-telemetry","prime"));</script>');}
    else {res.setHeader('Content-Type',u.pathname.endsWith('.js')?'application/javascript':'text/plain');if(u.pathname==='/cache.js')res.setHeader('Cache-Control','public,max-age=3600');res.end(u.pathname.endsWith('.js')?'window.fixtureLoaded=true;':'fixture');}
  });await new Promise(r=>server.listen(0,'0.0.0.0',r));port=server.address().port;
  const browser=await chromium.launch({args:['--site-per-process']}),url='http://127.0.0.1:'+port+'/products/beadmaster';
  const results=[];
  async function setup(context,page,clear,id,lifecycle){const session=await context.newCDPSession(page);await session.send('Network.enable');if(clear)await session.send('Network.clearBrowserCache');await session.send('Network.setCacheDisabled',{cacheDisabled:false});await session.send('Network.setBypassServiceWorker',{bypass:true});const applied=await T.apply(session),targetId=(await session.send('Target.getTargetInfo')).targetInfo.targetId;const net=await N.recorder(page,session,{contextId:'local-context',pageId:id,targetId,lifecycle});return {session,net,applied,targetId};}
  try{
    const context=await browser.newContext({viewport:{width:390,height:900},deviceScaleFactor:1});
    const a=await context.newPage(),prime=await setup(context,a,true,'A','PRIMING_LIFECYCLE');const primeTraffic=[];context.on('request',request=>{try{if(request.frame().page()===a)primeTraffic.push({url:request.url(),targetId:prime.targetId,lifecycle:'PRIMING_LIFECYCLE',classification:'NON_AUTHORITATIVE_DIAGNOSTIC'});}catch{}});prime.net.start();await a.goto(url);await a.evaluate(()=>document.fonts.ready);await a.waitForTimeout(1500);prime.net.cutoff();const primeResult=await prime.net.stop();const first=hits['/cache.js'];await a.goto('about:blank');await a.close();await new Promise(r=>setTimeout(r,100));const primeFinal={...prime.net.snapshot(),targetDiagnosticTraffic:primeTraffic};prime.net.dispose();
    const b=await context.newPage(),measured=await setup(context,b,false,'B','MEASURED_NAVIGATION_LIFECYCLE');measured.net.start();await b.goto(url);await b.evaluate(()=>document.fonts.ready);await b.waitForTimeout(1500);measured.net.cutoff();const result=await measured.net.stop();fs.writeFileSync(DIR+'/real-chromium-working.json',JSON.stringify(result,null,2));
    check('real-chromium','0 duplicate authoritative keys under throttle',()=>assert.equal(result.duplicateKeys,0));
    check('real-chromium','0 ambiguous authoritative identities',()=>assert.equal(result.ambiguity.length,0,JSON.stringify(result.ambiguity)));
    check('real-chromium','0 passive preload inspector blocks',()=>assert.ok(result.rows.filter(r=>r.url.includes('/checkouts/internal/preloads.js')).every(r=>!r.failed&&r.blockedReason===null&&r.decision.classification==='PASSIVE_RESOURCE')));
    check('real-chromium','throttled simultaneous same URL distinct CDP IDs',()=>assert.ok(result.rows.filter(r=>r.url.includes('/same-url')).length>=3));
    check('real-chromium','child-frame requests have authoritative CDP evidence',()=>assert.ok(result.rows.some(r=>r.provenance.targetType==='iframe'&&r.url.includes('/checkouts/internal/preloads.js'))));
    check('real-chromium','OOPIF document terminal handoff uses exact CDP identity',()=>{const doc=result.rows.find(r=>r.type==='Document'&&r.url.includes('/frame'));assert.ok(doc.targetHandoffs?.length);assert.equal(doc.terminalTargetId,doc.provenance.frameId);assert.equal(result.rows.filter(r=>r.id===doc.id).length,1);});
    check('real-chromium','worker-owned passive fetch included by CDP target ancestry',()=>assert.ok(result.rows.some(r=>r.provenance.targetType==='worker'&&r.url.includes('/worker-resource'))));
    check('real-chromium','worker fetch receives approved actual request latency',()=>{const r=result.rows.find(r=>r.provenance.targetType==='worker'&&r.url.includes('/worker-resource'));assert.ok(r.terminalTimestamp-r.provenance.timestamp>=0.5,JSON.stringify(r));});
    check('real-chromium','redirect chain one row per leg',()=>{const r=result.rows.find(r=>r.url.endsWith('/redirect'));assert.ok(r);const chain=result.rows.filter(x=>x.id===r.id&&x.provenance.sessionId===r.provenance.sessionId);assert.equal(chain.length,2);assert.ok(chain[1].url.endsWith('/final.js'));});
    check('real-chromium','complete terminal authoritative byte evidence',()=>assert.ok(N.integrity(result),JSON.stringify(result.rows.filter(r=>r.bytes===null))));
    check('real-chromium','warm B receives A cache without clearing',()=>{assert.equal(hits['/cache.js'],first);const r=result.rows.find(r=>r.url.endsWith('/cache.js'));assert.ok(r.cache.servedFromCache||r.cache.fromDiskCache);assert.equal(r.bytes,0);});
    check('real-chromium','prime unload telemetry occurred and retained',()=>{assert.ok(received.some(r=>r.path==='/prime-unload-telemetry'));assert.ok(primeTraffic.some(r=>r.url.includes('prime-unload-telemetry')));});
    check('real-chromium','prime unload excluded from B by target provenance',()=>assert.ok(!result.rows.some(r=>r.url.includes('prime-unload-telemetry'))));
    check('real-chromium','measured telemetry POST still counts',()=>assert.ok(result.rows.some(r=>r.url.includes('/measured-telemetry')&&r.method==='POST')));
    check('real-chromium','all child targets belong to measured B ancestry',()=>assert.ok(result.rows.every(r=>r.provenance.pageId==='B')));
    check('real-chromium','per-document approved throttle acknowledged',()=>assert.equal(result.rows.find(r=>r.type==='Document').appliedNetworkRule,measured.applied.ruleId));
    measured.net.dispose();await context.close();
    const fresh=await browser.newContext(),p=await fresh.newPage(),cold=await setup(fresh,p,true,'cold','MEASURED_NAVIGATION_LIFECYCLE');cold.net.start();await p.goto(url);await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);cold.net.cutoff();const coldResult=await cold.net.stop();
    check('real-chromium','fresh cold context cannot inherit warm asset',()=>assert.equal(hits['/cache.js'],first+1));cold.net.dispose();await fresh.close();
    results.push({browser:browser.version(),prime:primeResult,primeCloseDiagnostics:primeFinal,measured:result,cold:coldResult,received,hits});return results;
  }finally{await browser.close();await new Promise(r=>server.close(r));}
}
async function main(){fs.mkdirSync(DIR,{recursive:true});await ledgerTests();guardTests();cacheTests();const actual=await browserTests();const groups={};for(const t of tests)groups[t.group]=(groups[t.group]||0)+1;fs.writeFileSync(DIR+'/local-tests.json',JSON.stringify({assessedAt:new Date().toISOString(),passed:tests.length,failed:0,groups,tests,actualChromium:actual,ShopifySamples:0},null,2)+'\n');console.log(JSON.stringify({passed:tests.length,failed:0,groups,duplicateAuthoritativeRows:0,ambiguousAuthoritativeRows:0,passivePreloadBlocks:0,ShopifySamples:0}));}
if(require.main===module)main().catch(e=>{fs.mkdirSync(DIR,{recursive:true});fs.writeFileSync(DIR+'/local-tests-failed.json',JSON.stringify({failed:1,error:e.message,tests},null,2));console.error(e.stack);process.exitCode=1;});
