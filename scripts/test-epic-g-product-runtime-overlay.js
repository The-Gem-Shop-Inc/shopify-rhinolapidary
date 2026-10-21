'use strict';
// Browser-only fixtures over read-only preview HTML. Never deployed-Shopify proof.
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium,expect}=require('@playwright/test');
const {auth}=require('./probe-epic-f-header-focus-correction'),{renderer}=require('./lib/epic-g-product-browser-overlay'),E=require('./lib/epic-e-owner-response-adapter');
const deployed=process.argv.includes('--deployed'),skuOnly=process.argv.includes('--sku-only');
const DIR=process.env.RHINO_G2_EVIDENCE_DIR||'docs/qa/evidence/epic-g/g2-recovery-2026-10-16',origin='https://sz5dnk-nf.myshopify.com',out={mode:deployed?'DEPLOYED_PREVIEW_WITH_LOCAL_SKU_CART_CLOCK_FIXTURES':'BROWSER_ONLY_OVERLAY_NOT_DEPLOYED',tests:[],readRequests:[],mockedWrites:[],actualCommerceWrites:0};
(async()=>{const browser=await chromium.launch({headless:true});try{
 const cookies=await auth(browser),context=await browser.newContext({viewport:{width:390,height:1000}});await context.addCookies(cookies);const page=await context.newPage(),render=renderer({skuOnly});
 const skus=['G2 Fixture - A','','G2 Fixture - B','G2 Fixture - C'];let skuIndex=0,mode='sku';
 await context.route('**/*',async route=>{
  const request=route.request(),u=new URL(request.url());
  if(!['GET','HEAD'].includes(request.method())&&/\/cart(?:\/|\.|$)|\/checkouts?|\/admin\//.test(u.pathname)){
   out.mockedWrites.push({method:request.method(),path:u.pathname});assert(u.pathname.startsWith('/cart/add'),'Unexpected write attempt');return route.fulfill({status:422,json:{status:422,description:'G2 browser fixture quantity rejected'}});
  }
return route.continue();
 });
 await page.exposeFunction('__g2TransformSection',(body,url,status)=>{
  const u=new URL(url);out.readRequests.push({path:u.pathname,sectionId:u.searchParams.get('section_id'),optionValues:u.searchParams.get('option_values'),httpStatus:status});assert.equal(status,200,'Current section read must succeed');
  body=body.replace(/<p\b[^>]*\bid="Sku-([^"]+)"[^>]*>[\s\S]*?<\/p>/g,(_,id)=>render.sku(mode==='sku'?skus[skuIndex++]:'',id));
  if(mode==='unavailable')body=body.replace(/(<script[^>]*data-selected-variant[^>]*>)[\s\S]*?(<\/script>)/,'$1null$2');return body;
 });
 await page.addInitScript(()=>{const nativeFetch=window.fetch;window.fetch=async function(...args){const response=await nativeFetch.apply(this,args),url=new URL(args[0]?.url||args[0],location.href);if(url.pathname==='/products/saw-blade'&&url.searchParams.has('section_id')){const body=await window.__g2TransformSection(await response.text(),url.toString(),response.status);return new Response(body,{status:response.status,statusText:response.statusText,headers:response.headers});}return response;};});
 await page.goto(origin+'/products/saw-blade?preview_theme_id=158631198917',{waitUntil:'load'});assert.equal(await page.evaluate(()=>String(Shopify.theme.id)),'158631198917');
 if(!deployed){
 const id=await page.locator('main product-info').getAttribute('data-section');await page.locator('[id^=Sku-]').evaluate((e,html)=>e.outerHTML=html,render.sku('',id));await page.addStyleTag({content:fs.readFileSync('assets/rhino-g-product.css','utf8')});
 }
 const row=page.locator('[id^=Sku-]'),input=page.locator('main product-form [name=id]');await expect(row).toBeHidden();assert.equal((await row.innerText()).trim(),'');
 const options=await page.locator('main variant-selects input[type=radio]').evaluateAll(es=>es.map(e=>e.id)),variants=['46484258652357','46484258685125','46484258717893','46484258750661'];
 for(const [n,index]of [1,0,2,3].entries()){
  await page.locator('main label[for="'+options[index]+'"]').first().click();await expect(input).toHaveValue(variants[index]);
  if(skus[n]){await expect(row).toBeVisible();await expect(row.locator('[data-rhino-g-sku-value]')).toHaveText(skus[n]);assert.equal(await row.locator('.visually-hidden').innerText(),'SKU:');assert.equal(await row.locator('[data-rhino-g-sku-value]').evaluate(e=>getComputedStyle(e).userSelect),'text');}
  else{await expect(row).toBeHidden();assert.equal(await row.locator('.visually-hidden').count(),0);assert.equal(await row.evaluate(e=>e.getBoundingClientRect().height),0);}
  assert.equal(new URL(page.url()).searchParams.get('variant'),variants[index]);out.tests.push({name:'Native fragment SKU transition '+n,sku:skus[n],variant:variants[index],passed:true});
 }
 await page.locator('[name=plus]').click();await expect(page.locator('main [name=quantity]')).toHaveValue('2');await page.locator('[name=minus]').click();await expect(page.locator('main [name=quantity]')).toHaveValue('1');
 await page.locator('main [name=add]').click();await expect(page.locator('product-form [role=alert]')).toHaveText('G2 browser fixture quantity rejected');await expect(page.locator('main [name=add]')).not.toHaveAttribute('aria-disabled','true');out.tests.push({name:'Native quantity and mocked 422 alert recovery',passed:true});
 mode='unavailable';await page.locator('main label[for="'+options[0]+'"]').first().click();await expect(page.locator('main [name=add]')).toHaveText('Unavailable');await expect(page.locator('main [name=add]')).toBeDisabled();out.tests.push({name:'Native unavailable Variant response',passed:true});
 if(!skuOnly){await page.goto(origin+'/products/automatic-feed-clamp?preview_theme_id=158631198917',{waitUntil:'load'});if(!deployed){const section=await page.locator('main product-info').getAttribute('data-section');await page.locator('[id^=Sku-]').evaluate((e,html)=>e.outerHTML=html,render.sku('',section));await page.locator('main .product__info-container').evaluate((e,html)=>{const share=e.querySelector('share-button');if(share)share.insertAdjacentHTML('beforebegin',html);else e.insertAdjacentHTML('beforeend',html);},render.fit('automatic-feed-clamp',section));await page.addStyleTag({content:fs.readFileSync('assets/rhino-g-product.css','utf8')});await page.addScriptTag({content:fs.readFileSync('assets/rhino-g-fit.js','utf8')});
 }
 await expect(page.locator('rhino-g-fit')).toBeVisible();const expiry=await page.locator('rhino-g-fit').getAttribute('data-expires-at');await page.locator('rhino-g-fit').evaluate(e=>e.dataset.expiresAt='invalid');await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await expect(page.locator('rhino-g-fit')).toBeHidden();await page.locator('rhino-g-fit').evaluate((e,value)=>e.dataset.expiresAt=value,expiry);await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await expect(page.locator('rhino-g-fit')).toBeVisible();out.tests.push({name:'Invalid lease fails closed; valid lease restores approved existing markup',passed:true});await page.clock.setFixedTime(new Date(expiry));await page.evaluate(()=>window.dispatchEvent(new Event('pageshow')));await expect(page.locator('rhino-g-fit')).toBeHidden();await expect(page.locator('main [name=add]')).toBeEnabled();out.tests.push({name:'Client expiry suppresses fit without disabling native commerce',passed:true});
 }else out.forwardFit={status:'BLOCKED',reason:'Expired presentation; SKU/commerce fixture remains independent'};
 await context.close();
}catch(e){out.error=e.stack;process.exitCode=1;}finally{await browser.close();out.completedAt=new Date().toISOString();fs.writeFileSync(DIR+'/runtime-overlay.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out,null,2));}})();
