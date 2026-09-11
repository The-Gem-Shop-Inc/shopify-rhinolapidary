// Discovery probes only. No cart, checkout, contact submission or Admin mutation.
const fs=require('fs'),path=require('path'),root=path.resolve(__dirname,'../../../..');
require(path.join(root,'node_modules/dotenv')).config({path:path.join(root,'.env'),quiet:true});
const {chromium}=require(path.join(root,'node_modules/playwright'));
const auth=require(path.join(root,'tests/helpers/storefront-auth'));
const report={capturedAt:new Date().toISOString(),method:'Chromium keyboard gallery probes and 320 CSS-pixel reflow; 200% text-size simulation is not OS/browser zoom certification.',interactions:[],manualRoutes:[]};
(async()=>{const browser=await chromium.launch({headless:true});try{
 const context=await browser.newContext({viewport:{width:320,height:800}}),page=await context.newPage();
 for(const handle of ['em-1','lapmaster-18','sawmaster-24']){
  await auth.gotoUnlocked(page,'/products/'+handle);await page.waitForTimeout(500);
  const data={handle,reflow:await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,h1:document.querySelector('h1')?.textContent,duplicateIds:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((id,i,a)=>a.indexOf(id)!==i),jsonLd:[...document.querySelectorAll('script[type="application/ld+json"]')].map(e=>{try{return JSON.parse(e.textContent)}catch{return null}}),descriptionMeta:document.querySelector('meta[name="description"]')?.content}))};
  const opener=page.locator('media-gallery modal-opener button').first();
  if(await opener.count()){
   await opener.focus();await page.keyboard.press('Enter');await page.waitForTimeout(250);
   data.modalOpened=await page.locator('product-modal[open]').count()>0;
   data.focusAfterOpen=await page.evaluate(()=>({tag:document.activeElement?.tagName,label:document.activeElement?.getAttribute('aria-label'),insideModal:!!document.activeElement?.closest('product-modal')}));
   await page.keyboard.press('Escape');await page.waitForTimeout(100);
   data.modalClosed=await page.locator('product-modal[open]').count()===0;data.focusReturned=await opener.evaluate(e=>e===document.activeElement);
  }
  await page.addStyleTag({content:'html { font-size: 125% !important; }'});
  data.doubleText=await page.evaluate(()=>({rootFontSize:getComputedStyle(document.documentElement).fontSize,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth}));
  report.interactions.push(data);
 }
 const pages=JSON.parse(fs.readFileSync(path.join(__dirname,'2026-09-10-definitions-pages-read.json'))).data.pages.nodes.filter(p=>p.handle.includes('manual'));
 for(const entry of pages){const response=await page.goto(auth.storefrontUrl('/pages/'+entry.handle),{waitUntil:'domcontentloaded',timeout:30000});report.manualRoutes.push({handle:entry.handle,status:response.status(),publishedAt:entry.publishedAt,h1:await page.locator('h1').allTextContents()});}
}finally{fs.writeFileSync(path.join(__dirname,'2026-09-10-interaction-observations.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}})().catch(e=>{console.error(e.name+': '+e.message.split('\n')[0]);process.exitCode=1;});
