'use strict';
// QA only. No storefront runtime imports or persistent Shopify writer.
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {installPerformanceObservers}=require('../validate-brand-performance-budget');
const P=require('./epic-f-performance'),T=require('./epic-f-live-performance-profile');
const {expectedNavigation}=require('./epic-f-live-performance-guard-v3');
const {domContract}=require('../smoke-epic-f-live-machine-activation');
const ORIGIN='https://rhino-lapidary.myshopify.com';
const measured=value=>({status:'measured',value});
const safeUrl=value=>{try{const u=new URL(value);return u.origin+u.pathname+(u.search?'?'+[...u.searchParams.keys()].sort().map(k=>encodeURIComponent(k)+'=[REDACTED]').join('&'):'');}catch{return '[URL_REDACTED]';}};
const clean=value=>String(value).replace(/https?:\/\/[^\s"'<>]+/g,'[URL_REDACTED]').replace(/shp[a-z]+_[\w-]+/gi,'[TOKEN_REDACTED]').replace(/(?:password|token|signature|preview_key)=[^\s&]+/gi,'[REDACTED]');
const N=require('./epic-f-live-performance-network-v3');
async function authenticate(browser) {
  const context=await browser.newContext({acceptDownloads:false,serviceWorkers:'block'});let password;
  try{const page=await context.newPage();await page.goto(ORIGIN,{waitUntil:'load',timeout:120000});if(new URL(page.url()).pathname==='/password'){password=require('dotenv').parse(fs.readFileSync('.env')).STOREFRONT_PASSWORD;assert.ok(password,'Existing in-memory authentication unavailable');const unlock=new URL('/password',page.url());assert.ok(['sz5dnk-nf.myshopify.com','rhino-lapidary.myshopify.com'].includes(unlock.hostname));const response=await context.request.post(unlock.toString(),{form:{password},maxRedirects:0});assert.ok([200,302,303].includes(response.status()));await page.goto(ORIGIN,{waitUntil:'load',timeout:120000});assert.notEqual(new URL(page.url()).pathname,'/password');}return await context.cookies();}finally{password=null;await context.close();}
}
async function collect(browser,product,profile,cache,cookies,usedContexts,options={}) {
  const v=T.frozen.viewportProfiles[profile],context=await browser.newContext({viewport:{width:v.width,height:v.height},deviceScaleFactor:1,acceptDownloads:false,reducedMotion:'reduce'});
  const cacheEvidence={cache,contextId:crypto.randomUUID(),independentFreshContext:true,targetRoute:product.route,measuredRoute:product.route,serviceWorkers:'fresh-context; CDP bypass; no inherited registrations',cacheDisabled:false,cacheClearedAt:null,cacheClearedAfterPrime:false,productNavigationsBeforeMeasurement:0,prime:null,measuredAt:null,authentication:'Only in-memory cookies copied from separate unlock context; no authentication or Product navigation in measured context before cache initialization.'};
  const log={consoleErrors:[],pageErrors:[],downloads:[],navigation:[]};let net=null,primeNet=null;const safety=[];
  const violate=detail=>{safety.push(detail);void context.close().catch(()=>{});};
  const navigationObserver=page=>page.on('framenavigated',frame=>{if(frame===page.mainFrame()){const actual=frame.url();log.navigation.push({url:safeUrl(actual),expected:expectedNavigation(actual,ORIGIN+product.route)});if(actual!=='about:blank'&&!expectedNavigation(actual,ORIGIN+product.route))violate({classification:'PROHIBITED_MAIN_FRAME_NAVIGATION',url:safeUrl(actual)});}});
  try{
    await context.addCookies(cookies);
    let primeObservation=null;
    const configure=async (page,clear)=>{
      const session=await context.newCDPSession(page);await session.send('Network.enable');
      if(clear){await session.send('Network.clearBrowserCache');cacheEvidence.cacheClearedAt=new Date().toISOString();}
      await session.send('Network.setCacheDisabled',{cacheDisabled:false});await session.send('Network.setBypassServiceWorker',{bypass:true});
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
      navigationObserver(primePage);primeNet=await N.recorder(primePage,a.session,identity,{onViolation:violate});primeNet.start();
      cacheEvidence.prime={route:product.route,pageId:a.pageId,targetId:a.targetId,startedAt:new Date().toISOString(),completed:false};
      const response=await primePage.goto(url,{waitUntil:'load',timeout:120000});assert.equal(response.status(),200);assert.equal(new URL(primePage.url()).pathname,product.route);
      assert.equal(await primePage.locator('product-info.rhino-machine-shell').count(),1,'Warm prime substituted page');
      await primePage.evaluate(()=>document.fonts.ready);await primePage.waitForTimeout(1500);primeNet.cutoff();
      cacheEvidence.prime.completedAt=new Date().toISOString();cacheEvidence.prime.completed=true;cacheEvidence.productNavigationsBeforeMeasurement=1;
      primeObservation=await primeNet.stop();
      // Explicit unmeasured disposal navigation keeps A's target alive long
      // enough to retain pagehide/unload requests with A provenance.
      await primePage.goto('about:blank',{waitUntil:'load',timeout:30000});
      await primePage.close({runBeforeUnload:false});
      primeObservation.afterCloseLedger=primeNet.snapshot();primeObservation.postWindow=primeObservation.afterCloseLedger.postWindow;
      primeObservation.targetDiagnosticTraffic=primeTraffic.map(r=>({...r,classification:'NON_AUTHORITATIVE_DIAGNOSTIC'}));
      primeObservation.rows=primeObservation.rows.map(r=>({...r,url:safeUrl(r.url)}));
      primeObservation.unloadHandling='Page A recorder remains target-scoped through close; unload/post-window activity diagnostic only. No URL exclusion.';
      primeNet.dispose();cacheEvidence.prime.closedAt=new Date().toISOString();cacheEvidence.prime.closedBeforeMeasuredNavigation=true;cacheEvidence.sameBrowserContextCache=true;
    }
    const page=await context.newPage(),b=await configure(page,cache==='cold'),session=b.session,applied=b.applied;
    cacheEvidence.measuredPageId=b.pageId;cacheEvidence.measuredTargetId=b.targetId;
    if(options.beforeNavigation)await options.beforeNavigation(page,session);
    await installPerformanceObservers(page);
    await session.send('Performance.enable');await page.addInitScript(()=>{window.__rhinoV3Entries={lcp:[],cls:[],tasks:[]};window.__rhinoV3Observers=[];for(const [type,key]of [['largest-contentful-paint','lcp'],['layout-shift','cls'],['longtask','tasks']]){const record=entries=>window.__rhinoV3Entries[key].push(...entries.map(e=>({startTime:e.startTime,duration:e.duration,value:e.value,hadRecentInput:e.hadRecentInput})));const observer=new PerformanceObserver(list=>record(list.getEntries()));observer.observe({type,buffered:true});window.__rhinoV3Observers.push({observer,record});}window.__rhinoLCPEntries=[];new PerformanceObserver(list=>{for(const e of list.getEntries())window.__rhinoLCPEntries.push({startTime:e.startTime,tag:e.element?.tagName,id:e.element?.id||null,className:typeof e.element?.className==='string'?e.element.className:null,text:e.element?.textContent?.trim().slice(0,150)||null,url:e.url||null});}).observe({type:'largest-contentful-paint',buffered:true});});
    navigationObserver(page);net=await N.recorder(page,session,{contextId:cacheEvidence.contextId,pageId:b.pageId,targetId:b.targetId,lifecycle:'MEASURED_NAVIGATION_LIFECYCLE'},{onViolation:violate});
    page.on('console',m=>{if(m.type()==='error')log.consoleErrors.push(clean(m.text()));});page.on('pageerror',e=>log.pageErrors.push(clean(e.message)));page.on('download',async d=>{log.downloads.push(safeUrl(d.url()));await d.cancel();});
    cacheEvidence.measuredAt=new Date().toISOString();N.cacheProof(cacheEvidence,usedContexts);net.start();
    const start=Date.now(),response=await page.goto(url,{waitUntil:'load',timeout:120000}),loadedAt=Date.now();const fontsReadyMs=await page.evaluate(async()=>{await document.fonts.ready;return performance.now();});const fontsReadyAt=Date.now();await page.waitForTimeout(1500);const settledAt=Date.now();const cutoffMetrics=(await session.send('Performance.getMetrics')).metrics;const navigationStart=cutoffMetrics.find(m=>m.name==='NavigationStart')?.value;const cutoffTimestamp=cutoffMetrics.find(m=>m.name==='Timestamp')?.value;assert.ok(Number.isFinite(navigationStart)&&Number.isFinite(cutoffTimestamp));const metricCutoffMs=(cutoffTimestamp-navigationStart)*1000;net.cutoff(cutoffTimestamp);
    const detail=await page.evaluate(cutoff=>{
      const info=document.querySelector('product-info'),scripts=[...document.scripts].filter(s=>s.src),productScripts=scripts.filter(s=>/\/(?:product-info|product-form|media-gallery|product-modal)\.js/.test(s.src));
      const images=[...document.images],first=images.filter(i=>{const r=i.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0;}).map(i=>i.currentSrc);
      for(const {observer,record}of window.__rhinoV3Observers){record(observer.takeRecords());observer.disconnect();}const entries=window.__rhinoV3Entries;const latest=entries.lcp.filter(e=>e.startTime<=cutoff).at(-1);const metrics={...window.__rhinoPerformance,lcpMs:latest?.startTime??null,observations:{...window.__rhinoPerformance.observations,lcpMs:latest?'measured':'missing'},cls:entries.cls.filter(e=>e.startTime<=cutoff&&!e.hadRecentInput).reduce((sum,e)=>sum+e.value,0),tbtMs:entries.tasks.filter(e=>e.startTime+e.duration<=cutoff).reduce((sum,e)=>sum+Math.max(0,e.duration-50),0)};
      return {metricCutoffMs:cutoff,theme:window.Shopify?.theme||null,performance:metrics,lcpEntries:window.__rhinoLCPEntries.filter(e=>e.startTime<=cutoff),firstScreen:first,videoIframes:[...document.querySelectorAll('iframe')].filter(i=>/youtube|vimeo|wistia|video/i.test(i.src)).length,allIframes:document.querySelectorAll('iframe').length,autoplay:document.querySelectorAll('video[autoplay],audio[autoplay],iframe[src*="autoplay=1"]').length,previewToolbar:document.querySelectorAll('#PBarNextFrame,iframe[src*="preview-bar"],iframe[src*="preview_bar"]').length,synchronousScripts:scripts.filter(s=>new URL(s.src).origin!==location.origin&&!s.defer&&!s.async&&s.type!=='module').map(s=>s.src),duplicateProductScripts:productScripts.length-new Set(productScripts.map(s=>s.src)).size,dimensionsValid:images.every(i=>{const r=i.getBoundingClientRect();return !r.width||!r.height||Number(i.getAttribute('width'))>0&&Number(i.getAttribute('height'))>0;}),reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
    },metricCutoffMs);
    const dom=await domContract(page);const drainStart=Date.now(),networkLifecycle=await net.stop(),raw=networkLifecycle.rows,drainMs=Date.now()-drainStart;net.dispose();
    networkLifecycle.metricCutoffMs=detail.metricCutoffMs;networkLifecycle.metricCutoffTimestamp=cutoffTimestamp;
    if(options.afterWindow)await options.afterWindow(page,session,networkLifecycle);
    const integrity=[];
    if(response?.status()!==200||new URL(page.url()).origin!==ORIGIN||new URL(page.url()).pathname!==product.route||new URL(page.url()).search)integrity.push('HTTP/origin/route substitution');
    if(dom.productId!==product.id||dom.shellCount!==1||detail.theme?.id!==158579622085||detail.theme?.role!=='main'||detail.previewToolbar)integrity.push('Wrong Product/theme/assigned template or toolbar');
    if(dom.liquidErrors||log.pageErrors.length||log.downloads.length)integrity.push('Page/Liquid/download error');
    if(Object.values(dom.governedCounts).some(Boolean)||dom.description||dom.bodyProductModals)integrity.push('Zero-grant containment');
    if(!detail.performance||['lcpMs','cls','tbtMs'].some(k=>detail.performance.observations[k]!=='measured'))integrity.push('Performance observers incomplete');
    if(!N.integrity(networkLifecycle))integrity.push('Incomplete mandatory CDP network totals or invalid CDP identity/safety');
    if(safety.length)integrity.push('Unexpected transaction or main-frame navigation');
    const mainRequest=raw.find(r=>r.url===url&&r.type==='Document');if(mainRequest?.appliedNetworkRule!==applied.ruleId)integrity.push('Measured document missing effective throttle rule');
    if(raw.some(r=>r.decision.action==='INVALIDATE'))integrity.push('Forbidden transactional request observed');
    const {summary,resources}=P.resourceMetrics(raw.map(r=>({...r,bytes:r.bytes})),ORIGIN);
    // Keep every attempt in evidence. Contract metrics retain existing successful-resource
    // summary semantics; additional whole-page totals include failed/provider attempts.
    const validByteTotals=raw.every(r=>r.bytes!==null),allRequests=raw.length,wholeBytes=validByteTotals?raw.reduce((s,r)=>s+r.bytes,0):null;
    const metrics={...Object.fromEntries(['lcpMs','cls','tbtMs'].map(k=>[k,{status:detail.performance?.observations[k]||'missing',value:detail.performance?.observations[k]==='measured'?detail.performance[k]:null}])),initialTransferBytes:measured(summary.totalTransferBytes),imageBytes:measured(summary.imageBytes),maxImageBytes:measured(summary.maxImageBytes),firstScreenMediaBytes:measured(resources.filter(r=>detail.firstScreen.includes(r.url)).reduce((s,r)=>s+r.bytes,0)),requestCount:measured(summary.resourceCount),immediateVideoIframeCount:measured(detail.videoIframes),autoplayMediaCount:measured(detail.autoplay),thirdPartyScriptHostCount:measured(summary.thirdPartyScriptHosts.length),synchronousThirdPartyScriptCount:measured(detail.synchronousScripts.length)};
    if(!validByteTotals)for(const k of ['initialTransferBytes','imageBytes','maxImageBytes','firstScreenMediaBytes'])metrics[k]={status:'missing',value:null};
    const safeResources=resources.map(r=>({...r,url:safeUrl(r.url)}));
    const sample={timestamp:cacheEvidence.measuredAt,fixtureOnly:false,galleryState:'zero-governed-grants',environment:{kind:'production',theme:{id:'158579622085',name:'shopify-rhinolapidary/main',verified:detail.theme?.id===158579622085},providerOutput:'Approved Option A; native payment_terms included',sourceBinding:'7f9156cef929619f7e9fb38ee5f51e740c7d63fe0efdeaf4cc510eaf32b72e37'},identity:{requestedUrl:url,resolvedUrl:page.url(),requestedRoute:product.route,resolvedRoute:new URL(page.url()).pathname,productGid:product.gid,template:'product.machine'},navigation:{completed:!!response,status:response?.status()??null,pageKind:dom.shellCount===1?'product':'error',password:new URL(page.url()).pathname==='/password',challenge:await page.locator('form[action*="challenge"],#challenge').count()>0},viewport:{profile,...v},policy:{throttling:{id:'approved-mobile-profile',approvalRef:'data/epic-f-performance-profiles.json',profileId:T.frozen.profileId,latencyMs:562.5,downloadBytesPerSecond:184320,uploadBytesPerSecond:84375,cpuSlowdown:4,packetLoss:0},cache,settleMs:1500,settlePolicy:'load + document.fonts.ready + governed 1500 ms; no user interaction'},networkObservation:raw.every(r=>r.completed&&!r.failed&&r.status>0&&r.status<400&&r.bytes!==null)?'complete':'missing',resources:safeResources,metrics,media:{dimensionsValid:detail.dimensionsValid,secondaryLazy:true,firstScreenSources:detail.firstScreen.map(safeUrl)},duplicateProductScripts:detail.duplicateProductScripts,blockingMetric:'sum of max(0,longtask.duration - 50); established TBT proxy, not field INP or Lighthouse TBT'};
    const wholePageViolations=[];if(allRequests>P.policyLimits(profile).requestCount)wholePageViolations.push(`whole-page requestCount: budget ${P.policyLimits(profile).requestCount} exceeded (${allRequests})`);if(wholeBytes>P.policyLimits(profile).initialTransferBytes)wholePageViolations.push('whole-page transfer budget exceeded');
    return {sample,integrity,cacheEvidence,primeObservation,networkLifecycle:{...networkLifecycle,rows:undefined},methodIdentity:'EPIC_F_015B_LIVE_RECORDER_V3',metricCutoffMs:detail.metricCutoffMs,safety,appliedThrottle:applied,timings:{start,loadedAt,fontsReadyAt,fontsReadyMs,settledAt,navigationLoadMs:loadedAt-start,actualSettleMs:settledAt-fontsReadyAt,postCutoffDrainMs:drainMs,postCutoffPolicy:'No new requests included; LCP/CLS/TBT snapshot frozen at cutoff; only already captured requests allowed to finish, bounded 5000ms'},LCP:detail.lcpEntries.map(e=>({...e,url:e.url?safeUrl(e.url):null})),DOM:{theme:detail.theme,productId:dom.productId,shellCount:dom.shellCount,contact:dom.contact,terms:dom.terms,purchase:dom.purchase,governedCounts:dom.governedCounts,previewToolbar:detail.previewToolbar,reducedMotion:detail.reducedMotion},log,wholePage:{requestCount:allRequests,transferBytes:wholeBytes,failedAttempts:raw.filter(r=>r.failed||r.status>=400).length,incomplete:raw.filter(r=>!r.completed||r.bytes===null).map(r=>safeUrl(r.url)),violations:wholePageViolations},cacheIndicators:{resourcesFromCache:raw.filter(r=>r.cache.servedFromCache).length,authoritativeCDPResources:raw.length,requiredPlaywrightTimingMatches:0,totalResources:raw.length}};
  }catch(error){return {methodIdentity:'EPIC_F_015B_LIVE_RECORDER_V3',integrity:['Measurement exception: '+clean(error.message)],cacheEvidence,safety,log,networkLifecycle:net?.snapshot()||null,primeObservation:primeNet?.snapshot()||null};}finally{net?.dispose();primeNet?.dispose();await context.close();}
}
module.exports={ORIGIN,safeUrl,clean,authenticate,collect,recorder:N.recorder};
