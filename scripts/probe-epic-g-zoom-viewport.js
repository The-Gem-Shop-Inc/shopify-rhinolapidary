'use strict';
// Playwright's full-page clip at native browser zoom may crop physical pixels.
// Preserve those originals; independently capture the actual viewport with no clip.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{chromium}=require('@playwright/test'),I=require('./lib/epic-g-integrated'),{auth}=require('./probe-epic-f-header-focus-correction');
async function run(){
 const out={mode:'ACTUAL_NATIVE_BROWSER_ZOOM_VIEWPORT',startedAt:new Date().toISOString(),themeId:'158631198917',cells:[],failures:[],cartWrites:0};
 const login=await chromium.launch({headless:true});let cookies;try{cookies=await auth(login);}finally{await login.close();}
 const extension=path.resolve(I.dir()+'/zoom-extension'),context=await chromium.launchPersistentContext('',{channel:'chromium',headless:true,viewport:null,args:['--window-size=1440,1000','--disable-extensions-except='+extension,'--load-extension='+extension]});
 try{
  await context.addCookies(cookies);await context.route('**/*',r=>{if(!['GET','HEAD'].includes(r.request().method())&&/\/cart(?:\/|\.|$)|\/checkouts?|\/admin\//.test(new URL(r.request().url()).pathname))return r.abort();return r.continue();});
  const p=await context.newPage(),worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker'),cdp=await context.newCDPSession(p);
  for(const route of ['/collections/all','/products/saw-blade','/products/em-1','/products/trim-saw-6']){
   const row={route};out.cells.push(row);
   try{
    const response=await p.goto('https://sz5dnk-nf.myshopify.com'+route+'?preview_theme_id='+out.themeId,{waitUntil:'load',timeout:45000});assert.equal(response.status(),200);assert.equal(await p.evaluate(()=>String(Shopify.theme.id)),out.themeId);
    row.zoom=await worker.evaluate(async()=>{const t=(await chrome.tabs.query({})).find(t=>t.url?.includes('myshopify.com'));await chrome.tabs.setZoom(t.id,2);return chrome.tabs.getZoom(t.id);});assert.equal(row.zoom,2);await p.waitForTimeout(350);
    if(route==='/products/trim-saw-6'){row.title=await p.locator('main h1').innerText();assert.equal(row.title,require('./lib/epic-e-owner-response-adapter').read('data/epic-g-commercial-decisions.json').rows.find(r=>r.productGid.endsWith('/8905779282117')).approvedTitle);}
    row.geometry=await p.evaluate(()=>({innerWidth,innerHeight,devicePixelRatio,scrollWidth:document.documentElement.scrollWidth}));assert(row.geometry.scrollWidth<=row.geometry.innerWidth+1);
    const selector=route==='/collections/all'?'nav[aria-label="Product groups"] a[href="#g-consumables"]':route==='/products/em-1'?'.rhino-machine-contact':'main [name=add]',control=p.locator(selector).first();
    await control.evaluate(e=>e.scrollIntoView({block:'center'}));await p.keyboard.press('Tab');await control.focus();await p.waitForTimeout(350);
    row.control=await control.evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e),points=[[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],[r.right-2,r.bottom-2]],hits=points.map(([x,y])=>{const h=document.elementFromPoint(x,y);return h===e||e.contains(h);});return {name:e.getAttribute('aria-label')||e.textContent.trim(),rect:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height},fontSize:s.fontSize,active:document.activeElement===e,focusVisible:e.matches(':focus-visible'),cornersUnobstructed:hits,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth};});
    const r=row.control.rect;assert(row.control.name&&row.control.active&&row.control.focusVisible);assert(r.left>=0&&r.right<=row.geometry.innerWidth&&r.top>=0&&r.bottom<=row.geometry.innerHeight);assert(row.control.cornersUnobstructed.every(Boolean),'Control edge clipping or obstruction');
    if(route==='/collections/all'){await p.keyboard.press('Enter');await p.waitForTimeout(200);row.fragment=await p.locator('#g-consumables').evaluate(e=>{const r=e.getBoundingClientRect(),h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {focused:document.activeElement===e,visible:h===e||e.contains(h),top:r.top};});assert(row.fragment.focused&&row.fragment.visible&&row.fragment.top>=0);}
    row.layout=await cdp.send('Page.getLayoutMetrics');const capture=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:false});row.screenshot=I.dir()+'/zoom200-'+route.split('/').pop()+'-native-viewport.png';fs.writeFileSync(row.screenshot,Buffer.from(capture.data,'base64'));row.status='PASS';
   }catch(e){row.status='FAIL';row.error=e.message;out.failures.push({route,error:e.message});}
   await worker.evaluate(async()=>{const t=(await chrome.tabs.query({})).find(t=>t.url?.includes('myshopify.com'));await chrome.tabs.setZoom(t.id,1);});
  }
 }finally{await context.close();out.completedAt=new Date().toISOString();I.write('zoom-viewport.json',out);}
 console.log(JSON.stringify({cells:out.cells.length,failures:out.failures}));assert.deepEqual(out.failures,[]);return out;
}
if(require.main===module)run().catch(e=>{console.error(e.stack);process.exitCode=1;});module.exports={run};
