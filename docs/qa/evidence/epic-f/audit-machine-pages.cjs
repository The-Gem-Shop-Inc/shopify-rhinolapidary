// Discovery only: reads the configured unpublished preview; never submits a purchase/contact form.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../../../..');
require(path.join(root,'node_modules/dotenv')).config({path:path.join(root,'.env'),quiet:true});
const {chromium}=require(path.join(root,'node_modules/playwright'));
const AxeBuilder=require(path.join(root,'node_modules/@axe-core/playwright')).default;
const auth=require(path.join(root,'tests/helpers/storefront-auth'));
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const machines=read('docs/qa/evidence/epic-f/2026-09-10-machine-admin-read.json').data.nodes;
const output=path.join(__dirname,'2026-09-10-preview-observations.json');
const cleanUrl=value=>{try{const u=new URL(value);return u.origin+u.pathname;}catch{return value;}};
const report={schemaVersion:1,startedAt:new Date().toISOString(),scope:'Read-only unpublished preview discovery; not release QA or Epic E reconciliation',method:'Headless Chromium; fresh browser context per viewport, browser cache disabled; native network/CPU speed; one sample per route/width. PerformanceObserver diagnostics, not Lighthouse or field INP.',samples:[],navigation:[],errors:[]};
const save=()=>fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const width of [390,768,1440]){
   const context=await browser.newContext({viewport:{width,height:width===1440?1000:844},deviceScaleFactor:1});
   const page=await context.newPage();
   await auth.gotoUnlocked(page,'/products/em-1','Epic F preview access');
   const theme=await page.evaluate(()=>window.Shopify?.theme);
   if(String(theme?.id)!==String(process.env.PREVIEW_THEME_ID)||theme.role!=='unpublished')throw new Error('Configured unpublished theme identity not confirmed');
   report.theme={id:theme.id,name:theme.name,role:theme.role};
   const client=await context.newCDPSession(page);
   await client.send('Network.enable');await client.send('Network.setCacheDisabled',{cacheDisabled:true});
   let requests=new Map();
   client.on('Network.responseReceived',e=>requests.set(e.requestId,{url:cleanUrl(e.response.url),type:e.type,status:e.response.status,mimeType:e.response.mimeType,encodedBytes:0}));
   client.on('Network.loadingFinished',e=>{const r=requests.get(e.requestId);if(r)r.encodedBytes=e.encodedDataLength;});
   await page.addInitScript(()=>{
    window.__epicFMetrics={lcpMs:null,clsObserved:0,longTaskBlockingMs:0};
    for(const type of ['largest-contentful-paint','layout-shift','longtask']){
     if(!PerformanceObserver.supportedEntryTypes.includes(type))continue;
     new PerformanceObserver(list=>{for(const e of list.getEntries()){
      if(type==='largest-contentful-paint')window.__epicFMetrics.lcpMs=e.startTime;
      if(type==='layout-shift'&&!e.hadRecentInput)window.__epicFMetrics.clsObserved+=e.value;
      if(type==='longtask')window.__epicFMetrics.longTaskBlockingMs+=Math.max(0,e.duration-50);
     }}).observe({type,buffered:true});
    }
   });
   for(const machine of machines){
    requests=new Map();
    const route='/products/'+machine.handle;
    try{
     const response=await page.goto(auth.storefrontUrl(route),{waitUntil:'load',timeout:45000});
     await page.waitForTimeout(1500);
     const sample={handle:machine.handle,productGid:machine.id,width,capturedAt:new Date().toISOString(),httpStatus:response?.status(),finalPath:new URL(page.url()).pathname};
     sample.dom=await page.evaluate(()=>{
      const main=document.querySelector('#MainContent'),info=document.querySelector('.product__info-container');
      const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};};
      const visible=el=>!!(el.getClientRects().length&&getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).display!=='none');
      return {title:document.title,h1:[...document.querySelectorAll('h1')].map(e=>e.textContent.trim()),mainText:main?.innerText||'',descriptionHtml:document.querySelector('.product__description')?.innerHTML||'',
       productInfoRect:rect(info),titleRect:rect(document.querySelector('.product__title')),price:document.querySelector('.product__info-container .price')?.innerText||null,
       buttons:[...document.querySelectorAll('product-form button[type="submit"]')].map(e=>({text:e.innerText.trim(),disabled:e.disabled,visible:visible(e),rect:rect(e)})),
       inventory:document.querySelector('.product__inventory')?.innerText?.trim()||null,inventoryVisible:!!document.querySelector('.product__inventory')&&visible(document.querySelector('.product__inventory')),
       quantity:document.querySelector('input[name="quantity"]')?{min:document.querySelector('input[name="quantity"]').min,value:document.querySelector('input[name="quantity"]').value,label:document.querySelector('input[name="quantity"]').getAttribute('aria-label')}:null,
       variantInputs:[...document.querySelectorAll('form[action*="/cart/add"] input[name="id"]')].map(e=>e.value),
       pickupText:document.querySelector('pickup-availability')?.innerText?.trim()||null,paymentTerms:document.querySelector('shopify-payment-terms')?.innerText||null,
       images:[...document.querySelectorAll('media-gallery img')].map(e=>({src:e.currentSrc||e.src,alt:e.getAttribute('alt'),naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight,widthAttribute:e.getAttribute('width'),heightAttribute:e.getAttribute('height'),loading:e.loading,objectFit:getComputedStyle(e).objectFit,rect:rect(e)})),
       headings:[...main?.querySelectorAll('h1,h2,h3,h4')||[]].map(e=>({level:e.tagName,text:e.innerText.trim()})),
       links:[...main?.querySelectorAll('a[href]')||[]].map(e=>({text:e.innerText.trim(),href:e.getAttribute('href')})),
       details:[...main?.querySelectorAll('details')||[]].map(e=>({summary:e.querySelector('summary')?.textContent?.trim(),open:e.open})),
       iframeSources:[...document.querySelectorAll('iframe')].map(e=>({src:e.src,title:e.title})),
       mediaAutoplay:[...document.querySelectorAll('video[autoplay],audio[autoplay]')].length,
       overflow:document.documentElement.scrollWidth>innerWidth,
       overflowingElements:[...main?.querySelectorAll('*')||[]].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.right>innerWidth+2&&getComputedStyle(e).position!=='fixed';}).slice(0,8).map(e=>({tag:e.tagName,class:e.className})),
       metrics:window.__epicFMetrics,paint:performance.getEntriesByType('paint').map(e=>({name:e.name,startTime:e.startTime})),
       resources:performance.getEntriesByType('resource').map(e=>({name:e.name,type:e.initiatorType,transferSize:e.transferSize,duration:e.duration}))};
     });
     for(const image of sample.dom.images)image.src=cleanUrl(image.src);
     for(const resource of sample.dom.resources)resource.name=cleanUrl(resource.name);
     for(const iframe of sample.dom.iframeSources)iframe.src=cleanUrl(iframe.src);
     sample.network=[...requests.values()];
     sample.performance={...sample.dom.metrics,requests:sample.network.length,transferBytes:sample.network.reduce((n,r)=>n+r.encodedBytes,0),imageBytes:sample.network.filter(r=>r.type==='Image').reduce((n,r)=>n+r.encodedBytes,0),largestImageBytes:Math.max(0,...sample.network.filter(r=>r.type==='Image').map(r=>r.encodedBytes)),scriptHosts:[...new Set(sample.network.filter(r=>r.type==='Script').map(r=>new URL(r.url).hostname))]};
     if(sample.httpStatus===200&&sample.dom.buttons.length){
      const axe=await new AxeBuilder({page}).include('#MainContent').analyze();sample.accessibility={scope:'#MainContent',violations:axe.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))})),incompleteChecks:axe.incomplete.map(v=>v.id)};
      if(width===390||['em-1','sawmaster-24','lapmaster-18'].includes(machine.handle)){
       const filename=`2026-09-10-${machine.handle}-${width}.png`;await page.screenshot({path:path.join(__dirname,filename)});sample.screenshot=filename;
      }
     }
     report.samples.push(sample);save();console.log(`${machine.handle} ${width}: HTTP ${sample.httpStatus}, ${sample.dom.buttons[0]?.text||'no purchase control'}, LCP ${Math.round(sample.performance.lcpMs||0)}ms`);
    }catch(e){report.errors.push({handle:machine.handle,width,error:e.name,message:cleanUrl(e.message.split('\n')[0])});save();}
   }
   if(width===390)for(const route of ['/pages/contact','/pages/manuals','/pages/warranty','/pages/shipping','/policies/shipping-policy','/policies/refund-policy']){
    const response=await page.goto(auth.storefrontUrl(route),{waitUntil:'domcontentloaded',timeout:30000});
    report.navigation.push({route,status:response?.status(),finalPath:new URL(page.url()).pathname,...await page.evaluate(()=>({h1:[...document.querySelectorAll('h1')].map(e=>e.innerText),text:document.querySelector('#MainContent')?.innerText||'',forms:[...document.querySelectorAll('#MainContent form')].map(f=>({action:f.getAttribute('action'),fields:[...f.querySelectorAll('input,textarea,select')].map(e=>({name:e.name,type:e.type}))}))}))});save();
   }
   await context.close();
  }
 }finally{report.finishedAt=new Date().toISOString();save();await browser.close();}
})().catch(e=>{console.error(e.name+': '+e.message.split('\n')[0]);process.exitCode=1;});
