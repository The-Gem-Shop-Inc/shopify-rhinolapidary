'use strict';
// Discovery evidence only. No theme changes or commerce transactions.
const fs=require('node:fs'),{chromium}=require('@playwright/test'),AxeBuilder=require('@axe-core/playwright').default;
const {auth}=require('../../../../scripts/probe-epic-f-header-focus-correction');
const DIR='docs/qa/evidence/epic-g',snap=JSON.parse(fs.readFileSync(DIR+'/2026-10-15-admin-products.json'));
const cls=p=>p.metafields.nodes.find(m=>m.namespace==='rhino'&&m.key==='product_class')?.jsonValue;
const handles=['bonded-diamond-wheel-220','magnetic-resin-disc-220','screw-on-flat-lap','automatic-feed-clamp','saw-vice-plate-set','belt-guard-jademaster'];
for(const c of ['replacement_part','accessory','consumable']){const p=snap.products.find(p=>cls(p)===c&&!p.descriptionHtml);if(p&&!handles.includes(p.handle))handles.push(p.handle);}
const routes=['/','/collections/all','/collections/em-1-parts','/collections/trimmaster-parts','/collections/jademaster-parts','/collections/18-lapmaster-parts','/collections/blades-wheels','/collections/flexible-shaft-accessories','/collections/parts','/collections/replacement-parts','/collections/accessories','/collections/consumables','/pages/parts-for-my-machine','/products/em-1','/products/trimmaster'];
(async()=>{
const browser=await chromium.launch({headless:true}),out={startedAt:new Date().toISOString(),scope:'MAIN authenticated storefront; read-only navigation',browserTool:'repository Playwright (chrome-devtools CLI unavailable)',cells:[],blockedCommerceRequests:[],writes:0};
try{
const cookies=await auth(browser);
for(const width of [390,1440]){
const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:false});await context.addCookies(cookies);
await context.route('**/*',async r=>{const q=r.request(),u=new URL(q.url());if((q.method()!=='GET'&&q.method()!=='HEAD')&&(/\/cart(?:\/|\.|$)|\/checkout|\/admin\//.test(u.pathname))){out.blockedCommerceRequests.push({method:q.method(),path:u.pathname});return r.abort();}return r.continue();});
const page=await context.newPage();
for(const route of [...handles.map(h=>'/products/'+h),...(width===390?routes:routes.filter(r=>['/','/collections/em-1-parts','/collections/trimmaster-parts','/products/em-1'].includes(r)))]){
const cell={route,width};
try{
const response=await page.goto('https://sz5dnk-nf.myshopify.com'+route,{waitUntil:'load',timeout:45000});cell.status=response.status();await page.waitForTimeout(400);
cell.dom=await page.evaluate(()=>{
const text=e=>e?.textContent?.replace(/\s+/g,' ').trim()||null,visible=e=>!!e&&!!e.getBoundingClientRect().width&&getComputedStyle(e).visibility!=='hidden',main=document.querySelector('main'),p=main?.querySelector('product-info'),buy=p?.querySelector('[name="add"]');
return {path:location.pathname,theme:String(window.Shopify?.theme?.id),title:text(main?.querySelector('h1')),productId:p?.dataset.productId,price:text(p?.querySelector('[id^="price-"]')),sku:text(p?.querySelector('.product__sku')),skuVisible:visible(p?.querySelector('.product__sku')),inventory:text(p?.querySelector('[id^="Inventory-"]')),description:text(p?.querySelector('.product__description')),images:Array.from(p?.querySelectorAll('.product__media-wrapper img')||[],e=>({alt:e.alt,loaded:e.complete&&e.naturalWidth>0})),purchase:buy?{text:text(buy),disabled:buy.disabled}:null,quantity:p?.querySelector('[name="quantity"]')?.value,variantId:p?.querySelector('product-form [name="id"]')?.value,breadcrumbs:Array.from(document.querySelectorAll('[aria-label*="readcrumb"] a'),e=>({text:text(e),href:e.getAttribute('href')})),compatibilityHeadings:Array.from(main?.querySelectorAll('h2,h3')||[]).filter(e=>/compatib|fits|machine/i.test(text(e)||'')).map(text),reverseCards:Array.from(main?.querySelectorAll('[data-rhino-owner-compatible]')||[],e=>({productId:e.dataset.rhinoOwnerCompatible,href:e.querySelector('a')?.getAttribute('href')})),productLinks:[...new Set(Array.from(main?.querySelectorAll('a[href*="/products/"]')||[],e=>e.getAttribute('href')))],partsLinks:Array.from(document.querySelectorAll('header a,footer a,main a'),e=>({text:text(e),href:e.getAttribute('href')})).filter(e=>/part|consumab|accessor/i.test(e.text||'')),emptyText:text(main)?.slice(0,1200),overflow:document.documentElement.scrollWidth>innerWidth+1,liquidError:/Liquid (?:error|syntax error)/i.test(main?.innerText||'')};
});
if(route.startsWith('/products/')&&handles.includes(route.split('/').pop())||route==='/collections/em-1-parts'||route==='/collections/trimmaster-parts'){
const a=await new AxeBuilder({page}).include('main').analyze();cell.axe={violations:a.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))}))};
const q=page.locator('main product-info input[name=quantity]');if(await q.count()){await q.focus();cell.quantityAccessibleName=await q.getAttribute('aria-label');await page.keyboard.press('Tab');cell.nextFocus=await page.evaluate(()=>({tag:document.activeElement.tagName,text:document.activeElement.textContent.trim().slice(0,100),outline:getComputedStyle(document.activeElement).outlineStyle}));}
if(width===390){await page.evaluate(()=>document.documentElement.style.fontSize=parseFloat(getComputedStyle(document.documentElement).fontSize)*2+'px');cell.text200Overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);}
}
if(width===390&&['/products/automatic-feed-clamp','/products/magnetic-resin-disc-220','/collections/trimmaster-parts','/'].includes(route))await page.screenshot({path:DIR+'/mobile-'+(route==='/'?'home':route.split('/').pop())+'.png',fullPage:true});
}catch(e){cell.error=e.message;}
out.cells.push(cell);console.log(JSON.stringify({route,width,status:cell.status,title:cell.dom?.title,purchase:cell.dom?.purchase,axe:cell.axe?.violations.map(v=>v.id),overflow:cell.dom?.overflow,error:cell.error}));
fs.writeFileSync(DIR+'/2026-10-15-browser.json',JSON.stringify(out,null,2)+'\n');
}
await context.close();
}
}finally{await browser.close();out.completedAt=new Date().toISOString();fs.writeFileSync(DIR+'/2026-10-15-browser.json',JSON.stringify(out,null,2)+'\n');}
})().catch(e=>{console.error(e.message);process.exitCode=1});

