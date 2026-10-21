'use strict';
// Bounded read-only diagnostics, explicitly NOT certification samples.
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
const C=require('./lib/epic-f-live-performance-collector-v2'),G=require('./lib/epic-f-live-performance-campaign-v2'),M=require('./lib/epic-f-live-machine-activation');
const {owner}=require('./finalize-epic-f-live-performance-certification');
function initDetails(){
 const node=n=>n?{tag:n.tagName,id:n.id||null,className:typeof n.className==='string'?n.className:null,text:n.textContent?.trim().slice(0,120)||null}:null;
 window.__rhinoDiagnostic={longTasks:[],layoutShifts:[],LCP:[],fontsReadyMs:null,timeOrigin:performance.timeOrigin};
 new PerformanceObserver(list=>{for(const e of list.getEntries())window.__rhinoDiagnostic.longTasks.push({startTime:e.startTime,duration:e.duration,name:e.name,attribution:e.attribution?.map(a=>({name:a.name,containerType:a.containerType,containerName:a.containerName,containerId:a.containerId,containerSrc:a.containerSrc}))||[]});}).observe({type:'longtask',buffered:true});
 new PerformanceObserver(list=>{for(const e of list.getEntries())window.__rhinoDiagnostic.layoutShifts.push({startTime:e.startTime,value:e.value,hadRecentInput:e.hadRecentInput,sources:(e.sources||[]).map(s=>({node:node(s.node),previousRect:s.previousRect.toJSON(),currentRect:s.currentRect.toJSON()}))});}).observe({type:'layout-shift',buffered:true});
 new PerformanceObserver(list=>{for(const e of list.getEntries())window.__rhinoDiagnostic.LCP.push({startTime:e.startTime,renderTime:e.renderTime,loadTime:e.loadTime,size:e.size,url:e.url||null,node:node(e.element)});}).observe({type:'largest-contentful-paint',buffered:true});
 document.fonts.ready.then(()=>{window.__rhinoDiagnostic.fontsReadyMs=performance.now();});
}
function safeTrace(events){
 const allow=/^(RunTask|ThreadControllerImpl::RunTask|FunctionCall|EvaluateScript|v8\.(?:execute|compile)|EventDispatch|GCEvent|MajorGC|MinorGC|V8\.GC|Layout|UpdateLayoutTree|Paint|ParseHTML|ResourceSendRequest|navigationStart|firstContentfulPaint|largestContentfulPaint::Candidate|LayoutShift|TracingStartedInBrowser|thread_name|process_name)$/;
 const fields=new Set(['url','scriptName','functionName','scriptId','lineNumber','columnNumber','frame','frameId','type','navigationId','documentLoaderURL','nodeId','isMainFrame','had_recent_input','score','weighted_score_delta','cumulative_score','processId','frames','name','callFrames']);
 const filter=value=>{if(Array.isArray(value))return value.map(filter);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>fields.has(k)).map(([k,v])=>[k,filter(v)]));if(typeof value==='string'&&/^https?:/.test(value))return C.safeUrl(value);return value;};
 return events.filter(e=>allow.test(e.name)).map(e=>({name:e.name,cat:e.cat,ph:e.ph,pid:e.pid,tid:e.tid,ts:e.ts,dur:e.dur??null,args:{data:filter(e.args?.data||{}),...filter(e.args||{})}}));
}
function cpuAttribution(profile){
 const nodes=new Map(profile.nodes.map(n=>[n.id,n])),parents=new Map();for(const n of profile.nodes)for(const child of n.children||[])parents.set(child,n.id);
 let time=profile.startTime;const groups={},functions={},samples=[];
 for(let i=0;i<(profile.samples||[]).length;i++){
  const node=nodes.get(profile.samples[i]),delta=profile.timeDeltas?.[i];if(!Number.isFinite(delta))continue;time+=delta;
  let attributed=node,depth=0;while(attributed&&!attributed.callFrame?.url&&parents.has(attributed.id)){attributed=nodes.get(parents.get(attributed.id));depth++;}
  const frame=attributed?.callFrame,url=frame?.url || null,category=url?owner({url,attribution:'unknown'}):'unknown-browser-or-native';
  groups[category]=(groups[category]||0)+delta/1000;
  const key=category+' '+(frame?.functionName||node?.callFrame?.functionName||'(unknown)')+' '+(url?C.safeUrl(url):'[NO_SCRIPT_URL]');functions[key]=(functions[key]||0)+delta/1000;
  samples.push({endTimestampUs:time,durationUs:delta,nodeId:node?.id,scriptId:frame?.scriptId||null,url:url?C.safeUrl(url):null,functionName:frame?.functionName||node?.callFrame?.functionName||null,owner:category,ancestorDepth:depth});
 }
 return {method:'CDP sampled main-target JavaScript call stacks; nearest URL-bearing ancestor if leaf lacks URL. Sampling share is not causal savings or entire long-task ownership.',groupsMs:groups,topFunctions:Object.entries(functions).sort((a,b)=>b[1]-a[1]).slice(0,35).map(([functionIdentity,ms])=>({functionIdentity,ms})),samples};
}
function taskAttribution(trace,frameId){
 const start=trace.find(e=>e.name==='TracingStartedInBrowser');const frame=start?.args?.data?.frames?.find(f=>f.frame===frameId),pid=frame?.processId;
 const thread=trace.find(e=>e.name==='thread_name'&&e.pid===pid&&e.args.name==='CrRendererMain');
 const tasks=trace.filter(e=>['RunTask','ThreadControllerImpl::RunTask'].includes(e.name)&&e.dur>=50000&&(!pid||e.pid===pid)&&(!thread||e.tid===thread.tid));
 return {mainProcessId:pid??null,mainThreadId:thread?.tid??null,mainFrameId:frameId,scopeProven:!!pid&&!!thread,tasks:tasks.map(e=>{
  const children=trace.filter(n=>n.pid===e.pid&&n.tid===e.tid&&n.ts>=e.ts&&n.ts<(e.ts+e.dur)&&['FunctionCall','EvaluateScript','v8.execute','EventDispatch','Layout','UpdateLayoutTree'].includes(n.name));
  return {startTimestampUs:e.ts,durationMs:e.dur/1000,tbtContributionMs:Math.max(0,e.dur/1000-50),nestedEvents:children.map(n=>({name:n.name,startTimestampUs:n.ts,durationMs:n.dur===null?null:n.dur/1000,scriptUrl:n.args.data.url||n.args.data.scriptName||null,functionName:n.args.data.functionName||null,owner:(n.args.data.url||n.args.data.scriptName)?owner({url:n.args.data.url||n.args.data.scriptName,attribution:'unknown'}):'UNATTRIBUTED_EVENT'}))};
 })};
}
function requests(observation){
 const groups={},hosts={},types={};for(const r of observation.sample.resources){const category=owner(r),host=new URL(r.url).hostname;for(const [key,map]of[[category,groups],[host,hosts],[r.type,types]]){map[key]||={requests:0,bytes:0,completed:0,failed:0,unresolved:0};map[key].requests++;map[key].bytes=r.bytes===null?null:map[key].bytes===null?null:map[key].bytes+r.bytes;map[key].completed+=Number(r.terminalState==='COMPLETED_WITH_BYTES');map[key].failed+=Number(r.failed||r.status>=400);map[key].unresolved+=Number(r.terminalState==='UNRESOLVED');}}
 assert.equal(Object.values(groups).reduce((sum,g)=>sum+g.requests,0),observation.wholePage.requestCount);return {groups,hosts,types,unknown:groups['unknown-third-party']?.requests||0,allIncluded:true};
}
async function main(){
 const campaign=G.read(G.DIR+'/campaign.json');assert.equal(campaign.decision,'FAILED_CERTIFICATION_OPTIMIZATION_REQUIRED');assert.equal(campaign.valid,6);const frozen=G.read(G.DIR+'/campaign-start.json').frozenMethodology;G.unchanged(frozen);
 assert.ok(!fs.existsSync(G.DIR+'/diagnostic-summary.json'),'No unbounded repeat diagnostics');
 const browser=await chromium.launch(),results=[];let cookies;
 try{
  cookies=await C.authenticate(browser);
  for(const gid of ['gid://shopify/Product/8905779937477','gid://shopify/Product/8905781412037']){
   G.unchanged(frozen);const product=M.PRODUCTS.find(p=>p.gid===gid);let details,trace,cpu,frameId;
   const observation=await C.collect(browser,product,'mobile','cold',cookies,new Set(),{
    beforeNavigation:async(page,session)=>{await page.addInitScript(initDetails);await session.send('Profiler.enable');await session.send('Profiler.setSamplingInterval',{interval:1000});await session.send('Profiler.start');await session.send('Tracing.start',{categories:'devtools.timeline,disabled-by-default-devtools.timeline,toplevel,v8,blink.user_timing',transferMode:'ReturnAsStream'});},
    afterWindow:async(page,session)=>{
     details=await page.evaluate(()=>({...window.__rhinoDiagnostic,navigation:performance.getEntriesByType('navigation')[0]?.toJSON(),currentFontStatus:document.fonts.status,documentFontFamily:getComputedStyle(document.body).fontFamily}));
     frameId=(await session.send('Page.getFrameTree')).frameTree.frame.id;cpu=(await session.send('Profiler.stop')).profile;
     const ready=new Promise(resolve=>session.once('Tracing.tracingComplete',resolve));await session.send('Tracing.end');const {stream}=await ready;assert.ok(stream);let raw='';while(true){const chunk=await session.send('IO.read',{handle:stream});raw+=chunk.base64Encoded?Buffer.from(chunk.data,'base64').toString('utf8'):chunk.data;if(chunk.eof)break;}await session.send('IO.close',{handle:stream});trace=safeTrace(JSON.parse(raw).traceEvents);raw=null;
    }
   });
   const result={classification:'NONCERTIFYING_PERFORMANCE_DIAGNOSTIC',sourceBindingSha256:campaign.sourceBinding.sourceBindingSha256,recorderBindingSha256:campaign.methodSha256,route:product.route,productGid:gid,profile:'mobile',cache:'cold',traceOverheadQualified:true,observation,details,requestAttribution:requests(observation),cpuAttribution:cpuAttribution(cpu),taskAttribution:taskAttribution(trace,frameId),sanitizedTrace:trace};
   // URLs only in sanitized form; diagnostic details never contain cookies/headers/POST data.
   for(const task of details.longTasks)for(const a of task.attribution)if(a.containerSrc)a.containerSrc=C.safeUrl(a.containerSrc);
   for(const e of details.LCP)if(e.url)e.url=C.safeUrl(e.url);if(details.navigation?.name)details.navigation.name=C.safeUrl(details.navigation.name);
   G.write('diagnostic-'+product.handle+'.json',result);results.push({route:product.route,longTasks:details.longTasks.length,tbtProxyMs:details.longTasks.reduce((sum,t)=>sum+Math.max(0,t.duration-50),0),requests:result.requestAttribution,CPU:result.cpuAttribution.groupsMs,traceMainScopeProven:result.taskAttribution.scopeProven,integrity:observation.integrity});console.log(JSON.stringify({route:product.route,diagnosticOnly:true,longTasks:details.longTasks.length,requests:observation.wholePage.requestCount,traceEvents:trace.length,traceMainScopeProven:result.taskAttribution.scopeProven}));
   await new Promise(r=>setTimeout(r,2500));
  }
  G.unchanged(frozen);G.write('diagnostic-summary.json',{assessedAt:new Date().toISOString(),classification:'NONCERTIFYING_PERFORMANCE_DIAGNOSTIC',sourceBindingUnchanged:true,budgetsChanged:false,persistentMutations:0,results,traceSanitization:'Allowlisted execution/layout/resource events and scalar fields; no headers, cookies, postData, response bodies, arbitrary args, or query values persisted',rawTracePersisted:false});
 }finally{cookies=null;await browser.close();}
}
if(require.main===module)main().catch(e=>{console.error(C.clean(e.message));process.exitCode=1;});
module.exports={requests,cpuAttribution,taskAttribution,safeTrace};
