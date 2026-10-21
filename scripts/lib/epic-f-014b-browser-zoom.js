'use strict';
// True Chromium browser zoom; authenticated pages run in an in-memory incognito
// context. An anonymous, intercepted controller tab supplies per-origin zoom.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
async function createZoom(width=1280){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'rhino-014b-zoom-')),extension=path.join(root,'extension');fs.mkdirSync(extension);
 fs.writeFileSync(path.join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'Anonymous local 014B browser zoom',version:'1.0',permissions:['tabs'],background:{service_worker:'worker.js'}}));fs.writeFileSync(path.join(extension,'worker.js'),'chrome.runtime.onInstalled.addListener(()=>{});');
 let persistent;try{
 persistent=await chromium.launchPersistentContext(path.join(root,'profile'),{channel:'chromium',headless:true,viewport:null,args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,`--window-size=${width},1000`,'--disk-cache-size=0']});
 const worker=persistent.serviceWorkers()[0]||await persistent.waitForEvent('serviceworker');
 const controllerPath='/__rhino_local_014b_zoom_controller__';let controllerRequests=0;
 await persistent.route('**/*',r=>{if(new URL(r.request().url()).pathname===controllerPath){controllerRequests++;return r.fulfill({contentType:'text/html',body:'<!doctype html><title>Anonymous local browser zoom controller</title>'});}return r.abort();});
 const controller=await persistent.newPage(),context=await persistent.browser().newContext({viewport:null,acceptDownloads:false});
 async function set(origin,factor){const url=origin+controllerPath;if(controller.url()!==url)await controller.goto(url);return worker.evaluate(async({url,factor})=>{const t=(await chrome.tabs.query({})).find(t=>t.url===url&&!t.incognito);if(!t)throw Error('Anonymous zoom controller missing');await chrome.tabs.setZoom(t.id,factor);return chrome.tabs.getZoom(t.id);},{url,factor});}
 return {context,set,method:'chrome.tabs.setZoom_per_origin_inherited_by_memory_only_context',async close(){await context.clearCookies();await context.close();const cookies=await persistent.cookies();assert.equal(cookies.length,0,'Anonymous persistent controller received cookies');await persistent.close();persistent=null;cleanup();return {authenticatedContext:'IN_MEMORY_INCOGNITO',anonymousProfileCookieCount:0,controllerRequestsFulfilledLocally:controllerRequests,anonymousProfileRemoved:true};}};
 }catch(e){if(persistent)await persistent.close();cleanup();throw e;}
 function cleanup(){const resolved=path.resolve(root);assert.equal(path.dirname(resolved),path.resolve(os.tmpdir()));assert.ok(path.basename(resolved).startsWith('rhino-014b-zoom-'));fs.rmSync(resolved,{recursive:true,force:true});}
}
module.exports={createZoom};
