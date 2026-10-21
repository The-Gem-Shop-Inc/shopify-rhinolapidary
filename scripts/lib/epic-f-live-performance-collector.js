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
async function recorder(context,page,session) {
  let active=false, rows=[],pending=new Set();const cdpRows=[],byId=new Map();
  session.on('Network.requestWillBeSent',e=>{if(!active)return;const row={url:e.request.url,method:e.request.method,type:e.type,id:e.requestId,received:0,cache:false};cdpRows.push(row);byId.set(e.requestId,row);});
  session.on('Network.requestWillBeSentExtraInfo',e=>{const row=byId.get(e.requestId);if(row)row.appliedRule=e.appliedNetworkConditionsId||null;});
  session.on('Network.responseReceived',e=>{const row=byId.get(e.requestId);if(row){row.status=e.response.status;row.mimeType=e.response.mimeType;row.cache=row.cache||!!(e.response.fromDiskCache||e.response.fromPrefetchCache);row.serviceWorker=e.response.fromServiceWorker;row.headerBytes=e.response.encodedDataLength;}});
  session.on('Network.responseReceivedExtraInfo',e=>{const row=byId.get(e.requestId);if(row&&!row.status)row.status=e.statusCode;});
  session.on('Network.requestServedFromCache',e=>{const row=byId.get(e.requestId);if(row)row.cache=true;});
  session.on('Network.dataReceived',e=>{const row=byId.get(e.requestId);if(row)row.received+=e.encodedDataLength;});
  session.on('Network.loadingFinished',e=>{const row=byId.get(e.requestId);if(row){row.bytes=e.encodedDataLength;row.complete=true;}});
  session.on('Network.loadingFailed',e=>{const row=byId.get(e.requestId);if(row){row.failed=true;row.error=e.errorText;row.complete=true;row.partialEncodedBytes=row.received;}});
  const track=promise=>{pending.add(promise);promise.finally(()=>pending.delete(promise));};
  context.on('request',request=>{if(!active)return;const decision=classifyRequest({url:request.url(),method:request.method(),resourceType:request.resourceType(),isNavigation:request.isNavigationRequest(),postData:request.postData()});rows.push({request,url:request.url(),method:request.method(),type:request.resourceType(),decision,startedAt:new Date().toISOString(),status:0,completed:false,failed:false,bytes:null});});
  context.on('response',response=>{const row=rows.find(r=>r.request===response.request());if(row){row.status=response.status();row.mimeType=response.headers()['content-type']||'';}});
  const finish=request=>{const row=rows.find(r=>r.request===request);if(!row)return;track((async()=>{row.completed=true;row.failed=!!request.failure();row.failure=clean(request.failure()?.errorText||'');try{const sizes=await request.sizes();row.playwrightSizes={responseHeadersSize:sizes.responseHeadersSize,responseBodySize:sizes.responseBodySize};row.bytes=sizes.responseHeadersSize+sizes.responseBodySize;}catch{row.sizeUnavailable=true;}})());};
  context.on('requestfinished',finish);context.on('requestfailed',finish);
  function allCompleted(){const used=new Set();return rows.every(r=>{const d=cdpRows.find(x=>!used.has(x)&&x.url===r.url&&x.method===r.method);if(d)used.add(d);return r.completed||d?.complete;});}
  return {start(){active=true;rows=[];cdpRows.length=0;byId.clear();},cutoff(){active=false;},async stop(){active=false;const deadline=Date.now()+30000;while(!allCompleted()&&Date.now()<deadline)await new Promise(r=>setTimeout(r,100));await Promise.allSettled([...pending]);const used=new Set();return rows.map(r=>{
    const d=cdpRows.find(x=>!used.has(x)&&x.url===r.url&&x.method===r.method);if(d)used.add(d);
    let bytes=r.bytes,source='Playwright.Request.sizes (all frames)';if(d?.cache&&r.completed&&!r.failed){bytes=0;source='CDP cache hit; zero network transfer (loadingFinished may report cached body length)';}else if(d&&Number.isFinite(d.bytes)){bytes=d.bytes;source='CDP encodedDataLength';}else if(d?.failed&&d.complete){bytes=(d.headerBytes||0)+d.received;source='CDP failed-request observed response header + encoded data bytes; no synthetic response payload';}
    return {url:r.url,method:r.method,type:({document:'Document',stylesheet:'Stylesheet',script:'Script',image:'Image',font:'Font',xhr:'XHR',fetch:'Fetch',media:'Media',other:'Other'})[r.type]||'Other',mimeType:r.mimeType||d?.mimeType||'',status:r.status||d?.status||0,completed:!!(r.completed||d?.complete),failed:!!(r.failed||d?.failed),bytes,byteObservation:bytes===null?'missing':'measured',byteSource:source,cache:{servedFromCache:!!d?.cache,serviceWorker:!!d?.serviceWorker},appliedNetworkRule:d?.appliedRule||null,cdpCorrelated:!!d,CDPCompletionObserved:!!d?.complete,failure:r.failure,decision:r.decision,startedAt:r.startedAt};
  });}};
}
async function authenticate(browser) {
  const context=await browser.newContext({acceptDownloads:false,serviceWorkers:'block'});let password;
  try{const page=await context.newPage();await page.goto(ORIGIN,{waitUntil:'load',timeout:120000});if(new URL(page.url()).pathname==='/password'){password=require('dotenv').parse(fs.readFileSync('.env')).STOREFRONT_PASSWORD;assert.ok(password,'Existing in-memory authentication unavailable');const unlock=new URL('/password',page.url());assert.ok(['sz5dnk-nf.myshopify.com','rhino-lapidary.myshopify.com'].includes(unlock.hostname));const response=await context.request.post(unlock.toString(),{form:{password},maxRedirects:0});assert.ok([200,302,303].includes(response.status()));await page.goto(ORIGIN,{waitUntil:'load',timeout:120000});assert.notEqual(new URL(page.url()).pathname,'/password');}return await context.cookies();}finally{password=null;await context.close();}
}
async function collect(browser,product,profile,cache,cookies,usedContexts) {
  const v=T.frozen.viewportProfiles[profile],context=await browser.newContext({viewport:{width:v.width,height:v.height},deviceScaleFactor:1,acceptDownloads:false,reducedMotion:'reduce'});
  const cacheEvidence={cache,contextId:crypto.randomUUID(),independentFreshContext:true,targetRoute:product.route,measuredRoute:product.route,serviceWorkers:'fresh-context; CDP bypass; no inherited registrations',cacheDisabled:false,cacheClearedAt:null,cacheClearedAfterPrime:false,productNavigationsBeforeMeasurement:0,prime:null,measuredAt:null,authentication:'Only in-memory cookies copied from separate unlock context; no authentication or Product navigation in measured context before cache initialization.'};
  const log={consoleErrors:[],pageErrors:[],downloads:[]};
  try{
    await context.addCookies(cookies);const page=await context.newPage(),session=await context.newCDPSession(page);await session.send('Network.enable');
    await session.send('Network.clearBrowserCache');await session.send('Network.setCacheDisabled',{cacheDisabled:false});await session.send('Network.setBypassServiceWorker',{bypass:true});cacheEvidence.cacheClearedAt=new Date().toISOString();
    // No Playwright routing: it disables the browser HTTP cache. Block only prohibited
    // action/document/video URL patterns at CDP; all allowed requests remain observable.
    await session.send('Network.setBlockedURLs',{urls:['*/cart/add*','*/cart/change*','*/cart/update*','*/cart/clear*','*/checkout','*/checkout?*','*/orders/*','*.pdf*','*.docx*','*.zip*','*://*.youtube.com/*','*://*.youtube-nocookie.com/*','*://*.vimeo.com/*']});
    const applied=await T.apply(session);
    const url=ORIGIN+product.route;
    if(cache==='warm'){
      cacheEvidence.prime={route:product.route,startedAt:new Date().toISOString(),completed:false};
      const response=await page.goto(url,{waitUntil:'load',timeout:120000});assert.equal(response.status(),200);assert.equal(new URL(page.url()).pathname,product.route);
      assert.equal(await page.locator('product-info.rhino-machine-shell').count(),1,'Warm prime substituted page');
      await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1500);cacheEvidence.prime.completedAt=new Date().toISOString();cacheEvidence.prime.completed=true;cacheEvidence.productNavigationsBeforeMeasurement=1;
    }
    await installPerformanceObservers(page);
    await page.addInitScript(()=>{window.__rhinoLCPEntries=[];new PerformanceObserver(list=>{for(const e of list.getEntries())window.__rhinoLCPEntries.push({startTime:e.startTime,tag:e.element?.tagName,id:e.element?.id||null,className:typeof e.element?.className==='string'?e.element.className:null,text:e.element?.textContent?.trim().slice(0,150)||null,url:e.url||null});}).observe({type:'largest-contentful-paint',buffered:true});});
    const net=await recorder(context,page,session);
    page.on('console',m=>{if(m.type()==='error')log.consoleErrors.push(clean(m.text()));});page.on('pageerror',e=>log.pageErrors.push(clean(e.message)));page.on('download',async d=>{log.downloads.push(safeUrl(d.url()));await d.cancel();});
    cacheEvidence.measuredAt=new Date().toISOString();T.cacheProof(cacheEvidence,usedContexts);net.start();
    const start=Date.now(),response=await page.goto(url,{waitUntil:'load',timeout:120000}),loadedAt=Date.now();await page.evaluate(()=>document.fonts.ready);const fontsReadyAt=Date.now();await page.waitForTimeout(1500);const settledAt=Date.now();net.cutoff();
    const detail=await page.evaluate(()=>{
      const info=document.querySelector('product-info'),scripts=[...document.scripts].filter(s=>s.src),productScripts=scripts.filter(s=>/\/(?:product-info|product-form|media-gallery|product-modal)\.js/.test(s.src));
      const images=[...document.images],first=images.filter(i=>{const r=i.getBoundingClientRect();return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0;}).map(i=>i.currentSrc);
      return {theme:window.Shopify?.theme||null,performance:window.__rhinoPerformance,lcpEntries:window.__rhinoLCPEntries,firstScreen:first,videoIframes:[...document.querySelectorAll('iframe')].filter(i=>/youtube|vimeo|wistia|video/i.test(i.src)).length,allIframes:document.querySelectorAll('iframe').length,autoplay:document.querySelectorAll('video[autoplay],audio[autoplay],iframe[src*="autoplay=1"]').length,previewToolbar:document.querySelectorAll('#PBarNextFrame,iframe[src*="preview-bar"],iframe[src*="preview_bar"]').length,synchronousScripts:scripts.filter(s=>new URL(s.src).origin!==location.origin&&!s.defer&&!s.async&&s.type!=='module').map(s=>s.src),duplicateProductScripts:productScripts.length-new Set(productScripts.map(s=>s.src)).size,dimensionsValid:images.every(i=>{const r=i.getBoundingClientRect();return !r.width||!r.height||Number(i.getAttribute('width'))>0&&Number(i.getAttribute('height'))>0;}),reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches};
    });
    const dom=await domContract(page);const drainStart=Date.now(),raw=await net.stop(),drainMs=Date.now()-drainStart;
    const integrity=[];
    if(response?.status()!==200||new URL(page.url()).origin!==ORIGIN||new URL(page.url()).pathname!==product.route||new URL(page.url()).search)integrity.push('HTTP/origin/route substitution');
    if(dom.productId!==product.id||dom.shellCount!==1||detail.theme?.id!==158579622085||detail.theme?.role!=='main'||detail.previewToolbar)integrity.push('Wrong Product/theme/assigned template or toolbar');
    if(dom.liquidErrors||log.pageErrors.length||log.downloads.length)integrity.push('Page/Liquid/download error');
    if(Object.values(dom.governedCounts).some(Boolean)||dom.description||dom.bodyProductModals)integrity.push('Zero-grant containment');
    if(!detail.performance||['lcpMs','cls','tbtMs'].some(k=>detail.performance.observations[k]!=='measured'))integrity.push('Performance observers incomplete');
    if(raw.some(r=>r.bytes===null||!r.completed))integrity.push('Incomplete mandatory network totals');
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
    return {sample,integrity,cacheEvidence,appliedThrottle:applied,timings:{start,loadedAt,fontsReadyAt,settledAt,navigationLoadMs:loadedAt-start,actualSettleMs:settledAt-fontsReadyAt,postCutoffDrainMs:drainMs,postCutoffPolicy:'No new requests included; LCP/CLS/TBT snapshot frozen at cutoff; only already captured requests allowed to finish, bounded 30000ms'},LCP:detail.lcpEntries.map(e=>({...e,url:e.url?safeUrl(e.url):null})),DOM:{theme:detail.theme,productId:dom.productId,shellCount:dom.shellCount,contact:dom.contact,terms:dom.terms,purchase:dom.purchase,governedCounts:dom.governedCounts,previewToolbar:detail.previewToolbar,reducedMotion:detail.reducedMotion},log,wholePage:{requestCount:allRequests,transferBytes:wholeBytes,failedAttempts:raw.filter(r=>r.failed||r.status>=400).length,incomplete:raw.filter(r=>!r.completed||r.bytes===null).map(r=>safeUrl(r.url)),violations:wholePageViolations},cacheIndicators:{resourcesFromCache:raw.filter(r=>r.cache.servedFromCache).length,CDPCorrelated:raw.filter(r=>r.cdpCorrelated).length,totalResources:raw.length}};
  }finally{await context.close();}
}
module.exports={ORIGIN,safeUrl,clean,authenticate,collect,recorder};
