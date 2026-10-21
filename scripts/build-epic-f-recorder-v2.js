'use strict';
// Reproducible QA-only derivation; historical recorder remains untouched.
const fs=require('node:fs'),assert=require('node:assert/strict');
let text=fs.readFileSync('scripts/lib/epic-f-live-performance-collector.js','utf8');
const start=text.indexOf('async function recorder('),end=text.indexOf('async function authenticate(');
assert.ok(start>0 && end>start);
text=text.slice(0,start)+"const N=require('./epic-f-live-performance-network-v2');\n"+text.slice(end);
function replace(from,to){assert.equal(text.split(from).length-1,1,'Unexpected derivation site: '+from.slice(0,80));text=text.replace(from,to);}
replace('async function collect(browser,product,profile,cache,cookies,usedContexts) {','async function collect(browser,product,profile,cache,cookies,usedContexts,options={}) {');
const setupStart=text.indexOf('    await context.addCookies(cookies);'),setupEnd=text.indexOf('    await installPerformanceObservers(page);');
assert.ok(setupEnd>setupStart);
text=text.slice(0,setupStart)+`    await context.addCookies(cookies);
    let primeObservation=null;
    const configure=async (page,clear)=>{
      const session=await context.newCDPSession(page);await session.send('Network.enable');
      if(clear){await session.send('Network.clearBrowserCache');cacheEvidence.cacheClearedAt=new Date().toISOString();}
      await session.send('Network.setCacheDisabled',{cacheDisabled:false});await session.send('Network.setBypassServiceWorker',{bypass:true});
      await session.send('Network.setBlockedURLs',{urls:['*/cart/add*','*/cart/change*','*/cart/update*','*/cart/clear*','*/checkout','*/checkout?*','*/orders/*','*.pdf*','*.docx*','*.zip*','*://*.youtube.com/*','*://*.youtube-nocookie.com/*','*://*.vimeo.com/*']});
      const applied=await T.apply(session),target=(await session.send('Target.getTargetInfo')).targetInfo;
      assert.ok(target.targetId);return {session,applied,targetId:target.targetId,pageId:crypto.randomUUID()};
    };
    const url=ORIGIN+product.route;
    if(cache==='warm'){
      const primePage=await context.newPage(),a=await configure(primePage,true);
      const identity={contextId:cacheEvidence.contextId,pageId:a.pageId,targetId:a.targetId,lifecycle:'PRIMING_LIFECYCLE'};
      const primeTraffic=[];
      // Diagnostic context observer identifies PAGE A by frame/page object, never URL.
      context.on('request',request=>{try{if(request.frame().page()===primePage)primeTraffic.push({url:safeUrl(request.url()),method:request.method(),resourceType:request.resourceType(),initiatedAt:new Date().toISOString(),provenance:identity,phase:primePage.isClosed()?'PRIME_CLOSE':'PRIME_ACTIVE',bytes:null});}catch{}});
      const primeNet=await N.recorder(primePage,a.session,identity);primeNet.start();
      cacheEvidence.prime={route:product.route,pageId:a.pageId,targetId:a.targetId,startedAt:new Date().toISOString(),completed:false};
      const response=await primePage.goto(url,{waitUntil:'load',timeout:120000});assert.equal(response.status(),200);assert.equal(new URL(primePage.url()).pathname,product.route);
      assert.equal(await primePage.locator('product-info.rhino-machine-shell').count(),1,'Warm prime substituted page');
      await primePage.evaluate(()=>document.fonts.ready);await primePage.waitForTimeout(1500);primeNet.cutoff();
      cacheEvidence.prime.completedAt=new Date().toISOString();cacheEvidence.prime.completed=true;cacheEvidence.productNavigationsBeforeMeasurement=1;
      primeObservation=await primeNet.stop();
      await primePage.close({runBeforeUnload:false});
      primeObservation.postWindow=primeNet.snapshot().postWindow;
      primeObservation.targetDiagnosticTraffic=primeTraffic;
      primeObservation.rows=primeObservation.rows.map(r=>({...r,url:safeUrl(r.url)}));
      primeObservation.unloadHandling='Page A recorder remains target-scoped through close; unload/post-window activity diagnostic only. No URL exclusion.';
      primeNet.dispose();cacheEvidence.prime.closedAt=new Date().toISOString();cacheEvidence.prime.closedBeforeMeasuredNavigation=true;cacheEvidence.sameBrowserContextCache=true;
    }
    const page=await context.newPage(),b=await configure(page,cache==='cold'),session=b.session,applied=b.applied;
    cacheEvidence.measuredPageId=b.pageId;cacheEvidence.measuredTargetId=b.targetId;
    if(options.beforeNavigation)await options.beforeNavigation(page,session);
`+text.slice(setupEnd);
replace('const net=await recorder(context,page,session);',"const net=await N.recorder(page,session,{contextId:cacheEvidence.contextId,pageId:b.pageId,targetId:b.targetId,lifecycle:'MEASURED_NAVIGATION_LIFECYCLE'});");
replace('T.cacheProof(cacheEvidence,usedContexts);','N.cacheProof(cacheEvidence,usedContexts);');
replace('const dom=await domContract(page);const drainStart=Date.now(),raw=await net.stop(),drainMs=Date.now()-drainStart;',"const dom=await domContract(page);const drainStart=Date.now(),networkLifecycle=await net.stop(),raw=networkLifecycle.rows,drainMs=Date.now()-drainStart;net.dispose();\n    if(options.afterWindow)await options.afterWindow(page,session,networkLifecycle);");
replace("if(raw.some(r=>r.bytes===null||!r.completed))integrity.push('Incomplete mandatory network totals');","if(raw.some(r=>r.bytes===null||r.terminalState==='UNRESOLVED')||networkLifecycle.ambiguity.length)integrity.push('Incomplete mandatory network totals or ambiguous request provenance');");
replace('return {sample,integrity,cacheEvidence,appliedThrottle:applied,', 'return {sample,integrity,cacheEvidence,primeObservation,networkLifecycle:{...networkLifecycle,rows:undefined},methodIdentity:\'EPIC_F_015B_LIVE_RECORDER_V2\',appliedThrottle:applied,');
replace("bounded 30000ms'","bounded 5000ms'");
replace('module.exports={ORIGIN,safeUrl,clean,authenticate,collect,recorder};','module.exports={ORIGIN,safeUrl,clean,authenticate,collect,recorder:N.recorder};');
fs.writeFileSync('scripts/lib/epic-f-live-performance-collector-v2.js',text.replace(/\r\n/g,'\n'));
const dir='docs/qa/evidence/epic-f/015b-recorder-v2-2026-10-07';
const profileTest=fs.readFileSync('scripts/test-epic-f-live-performance-profile.js','utf8').replace("const DIR = 'docs/qa/evidence/epic-f/015b-live-2026-10-07-restart-3';",'const DIR = '+JSON.stringify(dir)+';');
fs.writeFileSync('scripts/test-epic-f-live-performance-profile-v2.js',profileTest.replace(/\r\n/g,'\n'));
const gate=fs.readFileSync('scripts/lib/epic-f-live-performance-campaign.js','utf8').replace("const DIR='docs/qa/evidence/epic-f/015b-live-2026-10-07-restart-3';",'const DIR='+JSON.stringify(dir)+';').replace('function freeze(){','toolPaths.push(\'data/epic-f-performance-recorder-v2.json\',\'scripts/lib/epic-f-live-performance-network-v2.js\',\'scripts/lib/epic-f-live-performance-collector-v2.js\',\'scripts/lib/epic-f-live-performance-campaign-v2.js\',\'scripts/run-epic-f-live-performance-canary-v2.js\',\'scripts/build-epic-f-recorder-v2.js\',\'scripts/test-epic-f-live-performance-v2.js\',\'scripts/test-epic-f-live-performance-profile-v2.js\');\nfunction freeze(){');
fs.writeFileSync('scripts/lib/epic-f-live-performance-campaign-v2.js',gate.replace(/\r\n/g,'\n'));
console.log(JSON.stringify({derived:true,historicalRecorderModified:false}));
