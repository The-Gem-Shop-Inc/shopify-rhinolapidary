'use strict';
// QA only. No storefront runtime imports or persistent Shopify writer.
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {installPerformanceObservers}=require('../validate-brand-performance-budget');
const P=require('./epic-f-performance'),T=require('./epic-f-live-performance-profile');
const {classifyRequest}=require('./epic-f-preview-network-guard');
const {domContract}=require('../smoke-epic-f-live-machine-activation');
const ORIGIN='https://rhino-lapidary.myshopify.com';
const measured=value=>({status:'measured',value});
const safeUrl=value=>{try{const u=new URL(value);return u.origin+u.pathname+(u.search?'?'+[...u.searchParams.keys()].sort().map(k=>encodeURIComponent(k)+'=[REDACTED]').join('&'):'');}catch{return '[URL_REDACTED]';}};
const clean=value=>String(value).replace(/https?:\/\/[^\s"'<>]+/g,'[URL_REDACTED]').replace(/shp[a-z]+_[\w-]+/gi,'[TOKEN_REDACTED]').replace(/(?:password|token|signature|preview_key)=[^\s&]+/gi,'[REDACTED]');
const N=require('./epic-f-live-performance-network-v2');
async function authenticate(browser) {
  const context=await browser.newContext({acceptDownloads:false,serviceWorkers:'block'});let password;
  try{const page=await context.newPage();await page.goto(ORIGIN,{waitUntil:'load',timeout:120000});if(new URL(page.url()).pathname==='/password'){password=require('dotenv').parse(fs.readFileSync('.env')).STOREFRONT_PASSWORD;assert.ok(password,'Existing in-memory authentication unavailable');const unlock=new URL('/password',page.url());assert.ok(['sz5dnk-nf.myshopify.com','rhino-lapidary.myshopify.com'].includes(unlock.hostname));const response=await context.request.post(unlock.toString(),{form:{password},maxRedirects:0});assert.ok([200,302,303].includes(response.status()));await page.goto(ORIGIN,{waitUntil:'load',timeout:120000});assert.notEqual(new URL(page.url()).pathname,'/password');}return await context.cookies();}finally{password=null;await context.close();}
}
async function collect(browser,product,profile,cache,cookies,usedContexts,options={}) {
  const v=T.frozen.viewportProfiles[profile],context=await browser.newContext({viewport:{width:v.width,height:v.height},deviceScaleFactor:1,acceptDownloads:false,reducedMotion:'reduce'});
  const cacheEvidence={cache,contextId:crypto.randomUUID(),independentFreshContext:true,targetRoute:product.route,measuredRoute:product.route,serviceWorkers:'fresh-context; CDP bypass; no inherited registrations',cacheDisabled:false,cacheClearedAt:null,cacheClearedAfterPrime:false,productNavigationsBeforeMeasurement:0,prime:null,measuredAt:null,authentication:'Only in-memory cookies copied from separate unlock context; no authentication or Product navigation in measured context before cache initialization.'};
  const log={consoleErrors:[],pageErrors:[],downloads:[]};
  try{
    await context.addCookies(cookies);
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
    await installPerformanceObservers(page);
    await page.addInitScript(()=>{window.__rhinoLCPEntries=[];new PerformanceObserver(list=>{for(const e of list.getEntries())window.__rhinoLCPEntries.push({startTime:e.startTime,tag:e.element?.tagName,id:e.element?.id||null,className:typeof e.element?.className==='string'?e.element.className:null,text:e.element?.textContent?.trim().slice(0,150)||null,url:e.url||null});}).observe({type:'largest-contentful-paint',buffered:true});});
    const net=await N.recorder(page,session,{contextId:cacheEvidence.contextId,pageId:b.pageId,targetId:b.targetId,lifecycle:'MEASURED_NAVIGATION_LIFECYCLE'});
    page.on('console',m=>{if(m.type()==='error')log.consoleErrors.push(clean(m.text()));});page.on('pageerror',e=>log.pageErrors.push(clean(e.message)));page.on('download',async d=>{log.downloads.push(safeUrl(d.url()));await d.cancel();});
    cacheEvidence.measuredAt=new Date().toISOString();N.cacheProof(cacheEvidence,usedContexts);net.start();
    const start=Date.now(),response=await page.goto(url,{waitUntil:'load',timeout:120000}),loadedAt=Date.now();await page.evaluate(()=>document.fonts.ready);const fontsReadyAt=Date.now();await page.waitForTimeout(1500);const settledAt=Date.now();net.cutoff();
    const detail=await page.evaluate(()=>{
      const info=document.querySelector('product-info'),scripts=[...document.scripts].filter(s=>s.src),productScripts=scripts.filter(s=>/\/(?:product-info|product-form|media-gallery|product-modal)\.js/.test(s.src));
      const images=[...document.images],first=images.filter(i=>{const r=i.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0;}).map(i=>i.currentSrc);
      return {theme:window.Shopify?.theme||null,performance:window.__rhinoPerformance,lcpEntries:window.__rhinoLCPEntries,firstScreen:first,videoIframes:[...document.querySelectorAll('iframe')].filter(i=>/youtube|vimeo|wistia|video/i.test(i.src)).length,allIframes:document.querySelectorAll('iframe').length,autoplay:document.querySelectorAll('video[autoplay],audio[autoplay],iframe[src*="autoplay=1"]').length,previewToolbar:document.querySelectorAll('#PBarNextFrame,iframe[src*="preview-bar"],iframe[src*="preview_bar"]').length,synchronousScripts:scripts.filter(s=>new URL(s.src).origin!==location.origin&&!s.defer&&!s.async&&s.type!=='module').map(s=>s.src),duplicateProductScripts:productScripts.length-new Set(productScripts.map(s=>s.src)).size,dimensionsValid:images.every(i=>{const r=i.getBoundingClientRect();return !r.width||!r.height||Number(i.getAttribute('width'))>0&&Number(i.getAttribute('height'))>0;}),reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
    });
    const dom=await domContract(page);const drainStart=Date.now(),networkLifecycle=await net.stop(),raw=networkLifecycle.rows,drainMs=Date.now()-drainStart;net.dispose();
    if(options.afterWindow)await options.afterWindow(page,session,networkLifecycle);
    const integrity=[];
    if(response?.status()!==200||new URL(page.url()).origin!==ORIGIN||new URL(page.url()).pathname!==product.route||new URL(page.url()).search)integrity.push('HTTP/origin/route substitution');
    if(dom.productId!==product.id||dom.shellCount!==1||detail.theme?.id!==158579622085||detail.theme?.role!=='main'||detail.previewToolbar)integrity.push('Wrong Product/theme/assigned template or toolbar');
    if(dom.liquidErrors||log.pageErrors.length||log.downloads.length)integrity.push('Page/Liquid/download error');
    if(Object.values(dom.governedCounts).some(Boolean)||dom.description||dom.bodyProductModals)integrity.push('Zero-grant containment');
    if(!detail.performance||['lcpMs','cls','tbtMs'].some(k=>detail.performance.observations[k]!=='measured'))integrity.push('Performance observers incomplete');
    if(raw.some(r=>r.bytes===null||r.terminalState==='UNRESOLVED')||networkLifecycle.ambiguity.length)integrity.push('Incomplete mandatory network totals or ambiguous request provenance');
    const mainRequest=raw.find(r=>r.url===url&&r.type==='Document');if(mainRequest?.appliedNetworkRule!==applied.ruleId)integrity.push('Measured document missing effective throttle rule');
    if(raw.some(r=>r.decision.action==='BLOCK'))integrity.push('Forbidden request attempted');
    const {summary,resources}=P.resourceMetrics(raw.map(r=>({...r,bytes:r.bytes})),ORIGIN);
    // Keep every attempt in evidence. Contract metrics retain existing successful-resource
    // summary semantics; additional whole-page totals include failed/provider attempts.
    const validByteTotals=raw.every(r=>r.bytes!==null),allRequests=raw.length,wholeBytes=validByteTotals?raw.reduce((s,r)=>s+r.bytes,0):null;
    const metrics={...Object.fromEntries(['lcpMs','cls','tbtMs'].map(k=>[k,{status:detail.performance?.observations[k]||'missing',value:detail.performance?.observations[k]==='measured'?detail.performance[k]:null}])),initialTransferBytes:measured(summary.totalTransferBytes),imageBytes:measured(summary.imageBytes),maxImageBytes:measured(summary.maxImageBytes),firstScreenMediaBytes:measured(resources.filter(r=>detail.firstScreen.includes(r.url)).reduce((s,r)=>s+r.bytes,0)),requestCount:measured(summary.resourceCount),immediateVideoIframeCount:measured(detail.videoIframes),autoplayMediaCount:measured(detail.autoplay),thirdPartyScriptHostCount:measured(summary.thirdPartyScriptHosts.length),synchronousThirdPartyScriptCount:measured(detail.synchronousScripts.length)};
    if(!validByteTotals)for(const k of ['initialTransferBytes','imageBytes','maxImageBytes','firstScreenMediaBytes'])metrics[k]={status:'missing',value:null};
    const safeResources=resources.map(r=>({...r,url:safeUrl(r.url)}));
    const sample={timestamp:cacheEvidence.measuredAt,fixtureOnly:false,galleryState:'zero-governed-grants',environment:{kind:'production',theme:{id:'158579622085',name:'shopify-rhinolapidary/main',verified:detail.theme?.id===158579622085},providerOutput:'Approved Option A; native payment_terms included',sourceBinding:'7f9156cef929619f7e9fb38ee5f51e740c7d63fe0efdeaf4cc510eaf32b72e37'},identity:{requestedUrl:url,resolvedUrl:page.url(),requestedRoute:product.route,resolvedRoute:new URL(page.url()).pathname,productGid:product.gid,template:'product.machine'},navigation:{completed:!!response,status:response?.status()??null,pageKind:dom.shellCount===1?'product':'error',password:new URL(page.url()).pathname==='/password',challenge:await page.locator('form[action*="challenge"],#challenge').count()>0},viewport:{profile,...v},policy:{throttling:{id:'approved-mobile-profile',approvalRef:'data/epic-f-performance-profiles.json',profileId:T.frozen.profileId,latencyMs:562.5,downloadBytesPerSecond:184320,uploadBytesPerSecond:84375,cpuSlowdown:4,packetLoss:0},cache,settleMs:1500,settlePolicy:'load + document.fonts.ready + governed 1500 ms; no user interaction'},networkObservation:raw.every(r=>r.completed&&!r.failed&&r.status>0&&r.status<400&&r.bytes!==null)?'complete':'missing',resources:safeResources,metrics,media:{dimensionsValid:detail.dimensionsValid,secondaryLazy:true,firstScreenSources:detail.firstScreen.map(safeUrl)},duplicateProductScripts:detail.duplicateProductScripts,blockingMetric:'sum of max(0,longtask.duration - 50); established TBT proxy, not field INP or Lighthouse TBT'};
    const wholePageViolations=[];if(allRequests>P.policyLimits(profile).requestCount)wholePageViolations.push(`whole-page requestCount: budget ${P.policyLimits(profile).requestCount} exceeded (${allRequests})`);if(wholeBytes>P.policyLimits(profile).initialTransferBytes)wholePageViolations.push('whole-page transfer budget exceeded');
    return {sample,integrity,cacheEvidence,primeObservation,networkLifecycle:{...networkLifecycle,rows:undefined},methodIdentity:'EPIC_F_015B_LIVE_RECORDER_V2',appliedThrottle:applied,timings:{start,loadedAt,fontsReadyAt,settledAt,navigationLoadMs:loadedAt-start,actualSettleMs:settledAt-fontsReadyAt,postCutoffDrainMs:drainMs,postCutoffPolicy:'No new requests included; LCP/CLS/TBT snapshot frozen at cutoff; only already captured requests allowed to finish, bounded 5000ms'},LCP:detail.lcpEntries.map(e=>({...e,url:e.url?safeUrl(e.url):null})),DOM:{theme:detail.theme,productId:dom.productId,shellCount:dom.shellCount,contact:dom.contact,terms:dom.terms,purchase:dom.purchase,governedCounts:dom.governedCounts,previewToolbar:detail.previewToolbar,reducedMotion:detail.reducedMotion},log,wholePage:{requestCount:allRequests,transferBytes:wholeBytes,failedAttempts:raw.filter(r=>r.failed||r.status>=400).length,incomplete:raw.filter(r=>!r.completed||r.bytes===null).map(r=>safeUrl(r.url)),violations:wholePageViolations},cacheIndicators:{resourcesFromCache:raw.filter(r=>r.cache.servedFromCache).length,CDPCorrelated:raw.filter(r=>r.cdpCorrelated).length,totalResources:raw.length}};
  }finally{await context.close();}
}
module.exports={ORIGIN,safeUrl,clean,authenticate,collect,recorder:N.recorder};
