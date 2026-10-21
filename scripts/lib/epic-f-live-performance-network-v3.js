'use strict';
const assert = require('node:assert/strict');
const { EventEmitter } = require('node:events');
const { classifyRequest } = require('./epic-f-live-performance-guard-v3');
const { safeUrl, clean } = require('./epic-f-live-performance-collector');
const T = require('./epic-f-live-performance-profile');
const DRAIN_MS = 5000;
const legacyType = type => ({ script:'Script', document:'Document', stylesheet:'Stylesheet', image:'Image', font:'Font', xhr:'XHR', fetch:'Fetch', media:'Media', preflight:'Preflight', other:'Other' })[type] || 'Other';
const measuredBytes = value => Number.isFinite(value) && value >= 0 ? value : null;
function sanitizeInitiator(value = {}) {
  const out = { type: value.type || null, url: value.url ? safeUrl(value.url) : null, lineNumber: value.lineNumber ?? null };
  if (value.stack) out.stack = { callFrames: (value.stack.callFrames || []).map(f => ({ functionName:f.functionName, scriptId:f.scriptId, url:f.url ? safeUrl(f.url) : null, lineNumber:f.lineNumber, columnNumber:f.columnNumber })) };
  return out;
}
function terminal(row) { return row.failed ? 'FAILED_WITH_CLASSIFIED_REASON' : row.terminalObserved && row.bytes !== null ? 'COMPLETED_WITH_BYTES' : 'UNRESOLVED'; }
async function recorder(page, session, identity, options = {}) {
  assert.ok(identity.contextId && identity.pageId && identity.targetId && identity.lifecycle);
  const drainMs = options.drainMs ?? DRAIN_MS;
  assert.ok(drainMs >= 0 && drainMs <= DRAIN_MS);
  const rows = [], latest = new Map(), issues = [], postWindow = [], safety = [], listeners = [], children = new Set(), targetSetups=[], eventEvidence=[];
  let active = false, started = null, closed = null, closeTimestamp = null;
  const on = (emitter, event, fn) => { emitter.on(event, fn); listeners.push(() => emitter.off(event, fn)); };
  function invalid(detail) { safety.push(detail); options.onViolation?.(detail); }
  function attach(emitter, scope) {
    for(const event of ['Network.requestWillBeSent','Network.responseReceived','Network.responseReceivedExtraInfo','Network.loadingFinished','Network.loadingFailed'])on(emitter,event,e=>eventEvidence.push({event,sessionId:scope.sessionId,targetId:scope.targetId,requestId:e.requestId,timestamp:e.timestamp??null,url:e.request?.url?safeUrl(e.request.url):e.response?.url?safeUrl(e.response.url):null,status:e.response?.status??e.statusCode??null,encodedDataLength:e.encodedDataLength??null,membership:active?'MEASUREMENT_WINDOW':closed?'POST_WINDOW_DIAGNOSTIC':'BEFORE_WINDOW_DIAGNOSTIC'}));
    const chainKey = requestId => scope.sessionId + ':' + requestId;
    const current = e => {
      const key=chainKey(e.requestId),direct=latest.get(key);if(direct)return direct;
      // An OOPIF document starts in its parent's Network session and finishes
      // in the child target. CDP requestId + exact frame/target ID proves this
      // handoff. No URL, timing, or Playwright identity participates.
      const candidates=[...new Set(latest.values())].filter(r=>r.id===e.requestId&&r.provenance.targetId!==scope.targetId&&(r.provenance.frameId===scope.targetId||/worker/.test(scope.targetType)&&r.provenance.targetId===scope.parentTargetId&&r.resourceType==='script'));
      if(candidates.length===1){const row=candidates[0];latest.set(key,row);row.targetHandoffs ||= [];row.targetHandoffs.push({sessionId:scope.sessionId,targetId:scope.targetId,proof:/worker/.test(scope.targetType)?'Exact CDP requestId and child worker parentTargetId equals original targetId':'Exact CDP requestId and original frameId equals child targetId'});return row;}
      if(candidates.length>1)issues.push({requestId:e.requestId,reason:'Ambiguous CDP child document handoff'});
      return null;
    };
    on(emitter, 'Network.requestWillBeSent', e => {
      const key = chainKey(e.requestId), previous = current(e);
      // Redirect response terminalizes its old leg, even if the new leg starts
      // after cutoff. Its explicit CDP encoded length is retained separately.
      if (previous && e.redirectResponse) {
        Object.assign(previous, { status:e.redirectResponse.status, mimeType:e.redirectResponse.mimeType || '', bytes:measuredBytes(e.redirectResponse.encodedDataLength), byteSource:'CDP redirectResponse.encodedDataLength (redirect leg has no loadingFinished)', terminalObserved:true, terminalEvent:'Network.requestWillBeSent.redirectResponse', terminalTimestamp:e.timestamp, redirectTo:safeUrl(e.request.url) });
      } else if (previous && previous.provenance.targetId !== scope.targetId && previous.targetHandoffs?.some(h=>h.targetId===scope.targetId)) {
        return; // Same document request announced again after an explicit target handoff.
      } else if (previous) {
        issues.push({ requestId:e.requestId, sessionId:scope.sessionId, reason:'Repeated requestWillBeSent without redirect evidence' });
        return;
      }
      const type = String(e.type || 'other').toLowerCase(), method = String(e.request.method || 'GET').toUpperCase();
      const decision = classifyRequest({ url:e.request.url, method, resourceType:type, hasPostData:e.request.hasPostData, postData:e.request.postData, isNavigation:type === 'document',isMainFrame:e.frameId===identity.targetId&&scope.targetType==='page' });
      const leg = previous ? previous.leg + 1 : 0;
      const row = { url:e.request.url, method, resourceType:type, type:legacyType(type), id:e.requestId, leg, resourceKey:key + ':' + leg,
        status:0, mimeType:'', bytes:null, byteSource:null, terminalObserved:false, terminalEvent:null, terminalTimestamp:null, failed:false,
        failure:'', blockedReason:null, decision, bodyPresent:decision.bodyPresent, encodedDataReceived:0, dataEvents:[],
        cache:{ servedFromCache:false, fromDiskCache:false, fromPrefetchCache:false, serviceWorker:false }, appliedNetworkRule:null,
        provenance:{ ...identity, ...scope, membership:active ? 'MEASUREMENT_WINDOW' : 'POST_WINDOW_DIAGNOSTIC', requestId:e.requestId, redirectOrdinal:leg, requestSequence:leg,
          frameId:e.frameId || null, loaderId:e.loaderId || null, documentURL:e.documentURL ? safeUrl(e.documentURL) : null,
          timestamp:e.timestamp ?? null, wallTime:e.wallTime ?? null, initiator:sanitizeInitiator(e.initiator), authority:'CDP_REQUEST_ID_ONLY' },
        startedAt:new Date().toISOString() };
      latest.set(key, row);
      if (active) rows.push(row); else if (closed) postWindow.push(row);
      if (decision.action === 'INVALIDATE') invalid({ ...row, url:safeUrl(row.url), ownership:require('../finalize-epic-f-live-performance-certification').owner({url:row.url,attribution:'unknown'}) });
    });
    on(emitter, 'Network.requestWillBeSentExtraInfo', e => { const r=current(e); if(r)r.appliedNetworkRule=e.appliedNetworkConditionsId || null; });
    on(emitter, 'Network.responseReceived', e => { const r=current(e); if(r){ r.status=e.response.status; r.mimeType=e.response.mimeType; r.responseTiming=e.response.timing || null; r.cache.fromDiskCache=!!e.response.fromDiskCache; r.cache.fromPrefetchCache=!!e.response.fromPrefetchCache; r.cache.serviceWorker=!!e.response.fromServiceWorker; } });
    on(emitter, 'Network.responseReceivedExtraInfo', e => { const r=current(e);if(r){r.responseExtraInfoStatus=e.statusCode;if(!r.status)r.status=e.statusCode;if(!r.mimeType)r.mimeType=String(e.headers?.['content-type']||e.headers?.['Content-Type']||'').split(';')[0];} });
    on(emitter, 'Network.requestServedFromCache', e => { const r=current(e); if(r)r.cache.servedFromCache=true; });
    on(emitter, 'Network.dataReceived', e => { const r=current(e); if(r){r.encodedDataReceived+=e.encodedDataLength || 0;r.dataEvents.push({timestamp:e.timestamp,encodedDataLength:e.encodedDataLength,dataLength:e.dataLength});} });
    on(emitter, 'Network.loadingFinished', e => { const r=current(e); if(r)Object.assign(r,{bytes:measuredBytes(e.encodedDataLength),byteSource:measuredBytes(e.encodedDataLength) !== null ? 'Network.loadingFinished.encodedDataLength' : null,terminalObserved:true,terminalEvent:'Network.loadingFinished',terminalTimestamp:e.timestamp ?? null,terminalTargetId:scope.targetId,terminalSessionId:scope.sessionId}); });
    on(emitter, 'Network.loadingFailed', e => { const r=current(e); if(r){Object.assign(r,{bytes:null,byteSource:null,failed:true,failure:clean(e.errorText),blockedReason:e.blockedReason || null,terminalObserved:true,terminalEvent:'Network.loadingFailed',terminalTimestamp:e.timestamp ?? null});if(e.blockedReason === 'inspector'&&r.provenance.membership==='MEASUREMENT_WINDOW')issues.push({requestId:e.requestId,sessionId:scope.sessionId,reason:'Unexpected inspector block; harness must never block passive resources'});} });
    if (options.childTargets !== false) {
      on(emitter, 'Target.attachedToTarget', e => {
        const child = new EventEmitter(), pending = new Map(); let commandId = 0;
        child.send = (method, params = {}) => new Promise((resolve,reject) => {
          const id=++commandId;pending.set(id,{resolve,reject});
          pending.get(id).method=method;emitter.send('Target.sendMessageToTarget',{sessionId:e.sessionId,message:JSON.stringify({id,method,params})}).catch(error=>{pending.delete(id);reject(error);});
        });
        on(emitter,'Target.receivedMessageFromTarget', message => { if(message.sessionId !== e.sessionId)return;const data=JSON.parse(message.message);if(data.id){const p=pending.get(data.id);pending.delete(data.id);if(p)data.error?p.reject(new Error(p.method+': '+data.error.message)):p.resolve(data.result);}else child.emit(data.method,data.params); });
        attach(child,{sessionId:scope.sessionId+'/'+e.sessionId,targetId:e.targetInfo.targetId,parentTargetId:scope.targetId,targetType:e.targetInfo.type});
        const setupEvidence={targetId:e.targetInfo.targetId,parentTargetId:scope.targetId,targetType:e.targetInfo.type,complete:false};targetSetups.push(setupEvidence);
        const setup=(async()=>{
          await child.send('Network.enable');await child.send('Network.setCacheDisabled',{cacheDisabled:false});await child.send('Network.setBypassServiceWorker',{bypass:true});
          if(/worker/.test(e.targetInfo.type)){
            // Chromium workers support actual request throttling ByRule, but
            // not overrideNetworkState (navigator emulation) or page CPU APIs.
            // The reviewed 4x main/iframe CPU policy stays on those page targets.
            const p=T.parameters(),rule=await child.send('Network.emulateNetworkConditionsByRule',{offline:false,matchedNetworkConditions:[p.rule]});
            assert.equal(rule.ruleIds?.length,1,'Missing worker network rule acknowledgement');
            let cpu;try{await child.send('Emulation.setCPUThrottlingRate',p.cpu);cpu={...p.cpu,acknowledged:true};}catch(error){if(!/Not supported|wasn't found|not found|only supported for pages, not workers/i.test(error.message))throw error;cpu={status:'UNSUPPORTED_ON_WORKER',reason:clean(error.message),mainAndIframeCPU4xUnchanged:true};}
            setupEvidence.applied={profileId:T.frozen.profileId,network:p.network,ruleId:rule.ruleIds[0],navigatorOverride:'Unsupported on worker; actual network ByRule used',cpu};
          }else setupEvidence.applied=await T.apply(child);
          await child.send('Target.setAutoAttach',{autoAttach:true,waitForDebuggerOnStart:true,flatten:false});
          setupEvidence.complete=true;
        })().catch(error=>{issues.push({targetId:e.targetInfo.targetId,reason:'Child CDP setup failed: '+clean(error.message)});}).finally(async()=>{try{await child.send('Runtime.runIfWaitingForDebugger');}catch(error){issues.push({targetId:e.targetInfo.targetId,reason:clean(error.message)});}});
        children.add(setup);setup.finally(()=>children.delete(setup));
      });
    }
  }
  attach(session,{sessionId:'root',targetId:identity.targetId,parentTargetId:null,targetType:'page'});
  if(options.childTargets !== false)await session.send('Target.setAutoAttach',{autoAttach:true,waitForDebuggerOnStart:true,flatten:false});
  // Optional Playwright diagnostics have no Request timing, sizes, or joins.
  const diagnosticRequests=[];
  on(page,'request', request => { diagnosticRequests.push({classification:'NON_AUTHORITATIVE_DIAGNOSTIC',url:safeUrl(request.url()),method:request.method(),resourceType:String(request.resourceType()).toLowerCase(),observedAt:new Date().toISOString()}); });
  function snapshot() {
    const serialize = row => ({...row,url:safeUrl(row.url),completed:row.terminalObserved,terminalState:terminal(row),byteObservation:row.bytes === null ? 'missing' : 'measured',CDPCompletionObserved:row.terminalObserved});
    return {rows:rows.map(serialize),postWindow:postWindow.map(serialize),ambiguity:[...issues],safety:[...safety],duplicateKeys:rows.length-new Set(rows.map(r=>r.resourceKey)).size,authoritativeLedger:'CDP_ONLY',requiredPlaywrightTimingMatches:0,diagnosticRequests:[...diagnosticRequests],targetSetups:targetSetups.map(s=>({...s})),eventEvidence:[...eventEvidence]};
  }
  return {
    start(){assert.equal(started,null);active=true;started=Date.now();},
    cutoff(cdpTimestamp){assert.ok(started);active=false;closed ||= Date.now();if(Number.isFinite(cdpTimestamp)){closeTimestamp=cdpTimestamp;for(let i=rows.length-1;i>=0;i--)if(rows[i].provenance.timestamp>cdpTimestamp){const [row]=rows.splice(i,1);row.provenance.membership='POST_WINDOW_DIAGNOSTIC';postWindow.unshift(row);}}return closed;},
    async stop(){if(active)this.cutoff();const start=Date.now(),deadline=start+drainMs;while((rows.some(r=>terminal(r)==='UNRESOLVED') || children.size) && Date.now()<deadline)await new Promise(r=>setTimeout(r,Math.min(25,Math.max(1,deadline-Date.now()))));return {...snapshot(),window:{start:started,close:closed,closeTimestamp,admittedCount:rows.length,metricsExtendedDuringDrain:false,maximumDrainMs:drainMs,actualDrainMs:Date.now()-start}};},
    snapshot,dispose(){listeners.forEach(remove=>remove());}
  };
}
function cacheProof(proof, used) {
  assert.ok(proof.measuredPageId && proof.measuredTargetId);
  if(proof.cache==='warm'){assert.ok(proof.prime?.pageId && proof.prime.targetId);assert.notEqual(proof.prime.pageId,proof.measuredPageId);assert.notEqual(proof.prime.targetId,proof.measuredTargetId);assert.equal(proof.prime.closedBeforeMeasuredNavigation,true);assert.equal(proof.sameBrowserContextCache,true);}
  return T.cacheProof(proof,used);
}
function integrity(ledger) { return ledger.rows.length>0 && ledger.duplicateKeys===0 && ledger.ambiguity.length===0 && ledger.safety.length===0 && ledger.rows.every(r=>r.bytes!==null && r.terminalState!=='UNRESOLVED'); }
function canaryDecision(records, validCount) {
  if(validCount!==6 || records.length!==2 || records.some(r=>r.record.samples.length!==3))return 'BLOCKED_MEASUREMENT_INTEGRITY';
  assert.deepEqual(records.map(r=>r.cache),['cold','warm']);
  return records.some(r=>!r.passed)?'FAILED_CERTIFICATION_OPTIMIZATION_REQUIRED':'CERTIFICATION_IN_PROGRESS';
}
module.exports={DRAIN_MS,recorder,terminal,cacheProof,canaryDecision,integrity,legacyType};
