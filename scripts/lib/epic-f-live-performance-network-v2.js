'use strict';
// QA only. Browser target isolation is the boundary; no telemetry URL exclusions.
const assert = require('node:assert/strict');
const { classifyRequest } = require('./epic-f-preview-network-guard');
const { safeUrl, clean } = require('./epic-f-live-performance-collector');
const DRAIN_MS = 5000;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const typeName = type => ({ document:'Document', stylesheet:'Stylesheet', script:'Script', image:'Image', font:'Font', xhr:'XHR', fetch:'Fetch', media:'Media', other:'Other' })[type] || type || 'Other';
function terminal(row) {
  if (row.failed && row.terminalObserved) return 'FAILED_WITH_CLASSIFIED_REASON';
  if (row.terminalObserved && Number.isFinite(row.bytes)) return 'COMPLETED_WITH_BYTES';
  return 'UNRESOLVED';
}
async function recorder(page, session, identity, options = {}) {
  assert.ok(identity.contextId && identity.pageId && identity.targetId && identity.lifecycle);
  const drainMs = options.drainMs ?? DRAIN_MS;
  assert.ok(drainMs >= 0 && drainMs <= DRAIN_MS);
  let active = false, windowStart = null, windowClose = null;
  const pw = [], cdp = [], postWindow = [], byRequest = new Map(), byId = new Map();
  const listeners = [];
  const on = (emitter, event, fn) => { emitter.on(event, fn); listeners.push(() => emitter.off(event, fn)); };
  const provenance = (membership, extra = {}) => ({ ...identity, membership, ...extra });
  on(session, 'Network.requestWillBeSent', e => {
    if (!active) { if (windowClose) postWindow.push({ url:safeUrl(e.request.url), ...provenance('POST_WINDOW', { requestId:e.requestId, frameId:e.frameId || null, loaderId:e.loaderId || null, timestamp:e.timestamp, wallTime:e.wallTime }) }); return; }
    const previous = byId.get(e.requestId);
    if (previous && e.redirectResponse) { previous.status=e.redirectResponse.status; previous.bytes=e.redirectResponse.encodedDataLength; previous.terminalObserved=true; previous.terminalEvent='CDP redirectResponse'; }
    const row = { url:e.request.url, method:e.request.method, type:e.type, id:e.requestId, sequence:cdp.filter(r=>r.id===e.requestId).length, wallTime:e.wallTime * 1000, timestamp:e.timestamp, frameId:e.frameId || null, loaderId:e.loaderId || null, initiator:e.initiator, received:0, bytes:null, cache:false, terminalObserved:false, failed:false, admittedAt:Date.now() };
    cdp.push(row); byId.set(e.requestId,row);
  });
  on(session, 'Network.requestWillBeSentExtraInfo', e => { const r=byId.get(e.requestId); if(r)r.appliedRule=e.appliedNetworkConditionsId || null; });
  on(session, 'Network.responseReceived', e => { const r=byId.get(e.requestId); if(r){ r.status=e.response.status; r.mimeType=e.response.mimeType; r.cache ||= !!(e.response.fromDiskCache || e.response.fromPrefetchCache); r.serviceWorker=e.response.fromServiceWorker; r.headerBytes=e.response.encodedDataLength; r.responseTiming=e.response.timing || null; } });
  on(session, 'Network.responseReceivedExtraInfo', e => { const r=byId.get(e.requestId); if(r && !r.status)r.status=e.statusCode; });
  on(session, 'Network.requestServedFromCache', e => { const r=byId.get(e.requestId); if(r)r.cache=true; });
  on(session, 'Network.dataReceived', e => { const r=byId.get(e.requestId); if(r)r.received += e.encodedDataLength; });
  on(session, 'Network.loadingFinished', e => { const r=byId.get(e.requestId); if(r){ r.bytes=Number.isFinite(e.encodedDataLength) ? e.encodedDataLength : null; r.terminalObserved=true; r.terminalEvent='Network.loadingFinished'; r.terminalAt=Date.now(); } });
  on(session, 'Network.loadingFailed', e => { const r=byId.get(e.requestId); if(r){ r.failed=true; r.failure=clean(e.errorText); r.blockedReason=e.blockedReason || null; r.terminalObserved=true; r.terminalEvent='Network.loadingFailed'; r.terminalAt=Date.now(); r.bytes=(Number.isFinite(r.headerBytes)?r.headerBytes:0)+r.received; r.byteSource='Explicit CDP terminal failure: observed response header plus encoded data received; no response payload invented'; } });
  // Page events contain this page's child frames, including OOPIFs. Never context-wide.
  on(page, 'request', request => {
    if (!active) return;
    const row={ request, url:request.url(), method:request.method(), type:typeName(request.resourceType()), bytes:null, terminalObserved:false, failed:false, status:0, admittedAt:Date.now(), frameUrl:null };
    try { assert.equal(request.frame().page(),page,'Foreign page admitted'); row.frameUrl=request.frame().url(); } catch(e) { if(e.code==='ERR_ASSERTION')throw e; }
    row.decision=classifyRequest({url:row.url,method:row.method,resourceType:request.resourceType(),isNavigation:request.isNavigationRequest(),postData:request.postData()});
    pw.push(row); byRequest.set(request,row);
  });
  on(page, 'response', response => { const r=byRequest.get(response.request()); if(r){r.status=response.status();r.mimeType=response.headers()['content-type'] || '';} });
  const finish = request => {
    const r=byRequest.get(request); if(!r)return;
    r.terminalObserved=true; r.failed=!!request.failure(); r.failure=clean(request.failure()?.errorText || ''); r.terminalEvent=r.failed?'Playwright.requestfailed':'Playwright.requestfinished'; r.terminalAt=Date.now();
    request.sizes().then(sizes => { r.sizes=sizes; r.bytes=Number.isFinite(sizes.responseHeadersSize) && Number.isFinite(sizes.responseBodySize) ? sizes.responseHeadersSize+sizes.responseBodySize : null; }).catch(()=>{r.sizeUnavailable=true;});
  };
  on(page,'requestfinished',finish); on(page,'requestfailed',finish);
  function snapshot() {
    const used=new Set(), ambiguity=[];
    const joined=pw.map((r,index)=>{
      // Not URL-only: target scope is fixed; correlate protocol wall time to public
      // Playwright request timing. Unique timestamp + method + URL identifies request.
      const time=r.request.timing().startTime;
      const candidates=cdp.filter(d=>!used.has(d) && d.url===r.url && d.method===r.method && Number.isFinite(time) && Math.abs(d.wallTime-time)<=2);
      let d=null;
      if(candidates.length===1){d=candidates[0];used.add(d);}
      else if(candidates.length>1)ambiguity.push({pageId:identity.pageId,requestOrdinal:index,reason:'Ambiguous target/time/method correlation'});
      return make(r,d,index);
    });
    for(const d of cdp)if(!used.has(d))joined.push(make(null,d,null));
    return {rows:joined,ambiguity,postWindow:[...postWindow]};
  }
  function make(p,d,index) {
    let bytes=p?.bytes ?? null, source='Playwright.Request.sizes (same page, all child frames)';
    const failed=!!(p?.failed || d?.failed), observed=!!(p?.terminalObserved || d?.terminalObserved);
    if(d?.cache && observed && !failed){bytes=0;source='Observed browser cache hit plus explicit terminal completion: zero network transfer';}
    else if(Number.isFinite(d?.bytes)){bytes=d.bytes;source=d.byteSource || 'CDP encodedDataLength';}
    const raw={url:p?.url || d.url,method:p?.method || d.method,type:p?.type || d.type,mimeType:p?.mimeType || d?.mimeType || '',status:p?.status || d?.status || 0,bytes,terminalObserved:observed,failed};
    const state=terminal(raw);
    const decision=p?.decision || classifyRequest({url:raw.url,method:raw.method,resourceType:raw.type,isNavigation:raw.type==='Document'});
    return {...raw,completed:observed,terminalState:state,terminalEvent:d?.terminalEvent || p?.terminalEvent || null,byteObservation:Number.isFinite(bytes)?'measured':'missing',byteSource:Number.isFinite(bytes)?source:null,cache:{servedFromCache:!!d?.cache,serviceWorker:!!d?.serviceWorker},appliedNetworkRule:d?.appliedRule || null,cdpCorrelated:!!d,CDPCompletionObserved:!!d?.terminalObserved,failure:p?.failure || d?.failure || '',blockedReason:d?.blockedReason || null,decision,startedAt:new Date(p?.admittedAt || d.admittedAt).toISOString(),provenance:provenance('MEASUREMENT_WINDOW',{requestId:d?.id || null,requestSequence:d?.sequence ?? null,playwrightRequestOrdinal:index,frameId:d?.frameId || null,frameUrl:p?.frameUrl ? safeUrl(p.frameUrl):null,loaderId:d?.loaderId || null,timestamp:d?.timestamp ?? null,wallTime:d?.wallTime ?? null,playwrightStartTime:p?.request.timing().startTime ?? null,correlation:d&&p?'same target; unique wall time ±2ms + method + URL':d?'CDP target request ID':'same-page Playwright request object (child-frame coverage)',initiator:d?.initiator?sanitizeInitiator(d.initiator):null,responseTiming:d?.responseTiming || null})};
  }
  return {
    start(){assert.equal(windowStart,null,'Recorder cannot be reused');active=true;windowStart=Date.now();},
    cutoff(){assert.ok(windowStart);active=false;windowClose ||= Date.now();return windowClose;},
    async stop(){if(active)this.cutoff();const started=Date.now(),deadline=started+drainMs;let result=snapshot();while(result.rows.some(r=>r.terminalState==='UNRESOLVED' || r.bytes===null) && Date.now()<deadline){await sleep(Math.min(25,Math.max(1,deadline-Date.now())));result=snapshot();}return {...result,window:{start:windowStart,close:windowClose,admittedCount:result.rows.length,metricsExtendedDuringDrain:false,maximumDrainMs:drainMs,actualDrainMs:Date.now()-started},postWindow:[...postWindow]};},
    snapshot,
    dispose(){listeners.forEach(remove=>remove());}
  };
}
function sanitizeInitiator(value){const out={type:value.type,url:value.url?safeUrl(value.url):null,lineNumber:value.lineNumber??null};if(value.stack)out.stack={callFrames:(value.stack.callFrames || []).map(f=>({functionName:f.functionName,scriptId:f.scriptId,url:f.url?safeUrl(f.url):null,lineNumber:f.lineNumber,columnNumber:f.columnNumber}))};return out;}
function cacheProof(proof, used) {
  assert.ok(proof.measuredPageId && proof.measuredTargetId);
  if(proof.cache==='warm'){assert.ok(proof.prime.pageId && proof.prime.targetId);assert.notEqual(proof.prime.pageId,proof.measuredPageId);assert.notEqual(proof.prime.targetId,proof.measuredTargetId);assert.equal(proof.prime.closedBeforeMeasuredNavigation,true);assert.equal(proof.sameBrowserContextCache,true);}
  return require('./epic-f-live-performance-profile').cacheProof(proof,used);
}
function canaryDecision(records, validCount) {
  if(validCount!==6 || records.length!==2 || records.some(r=>r.record.samples.length!==3))return 'BLOCKED_MEASUREMENT_INTEGRITY';
  assert.deepEqual(records.map(r=>r.cache),['cold','warm']);
  return records.some(r=>!r.passed)?'FAILED_CERTIFICATION_OPTIMIZATION_REQUIRED':'CERTIFICATION_IN_PROGRESS';
}
module.exports={DRAIN_MS,recorder,terminal,cacheProof,canaryDecision};
