'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { classifyRequest } = require('./lib/epic-f-preview-network-guard');
const { PRODUCTS, hash, normalize } = require('./lib/epic-f-nonpersistent-preview');
async function run() {
  const computedOnly=process.argv.includes('--computed-smoke');
  const classificationSmoke=process.argv.includes('--classification-smoke');
  const pushed = JSON.parse(fs.readFileSync('docs/qa/evidence/epic-f/2026-10-05-persistent-preview-push.json'));
  assert.equal(pushed.exitCode,0);assert.equal(String(pushed.result.theme.id),'158631198917');
  const root=new URL(pushed.result.theme.preview_url); assert.equal(root.searchParams.get('preview_theme_id'),'158631198917');
  const browser=await chromium.launch({headless:true});const cells=[];
  let password=null,authCookies=null;
  const authentication={required:false,submitted:false,settingsChanged:false,cookiesPersisted:false};
  try {
    // Existing storefront credential, used only for this read-only browser session.
    // Do not use the legacy auth helper: it writes storageState to disk.
    const authContext=await browser.newContext({acceptDownloads:false});
    try {
      const authPage=await authContext.newPage();await authPage.goto(root.toString(),{waitUntil:'load',timeout:60000});
      if(new URL(authPage.url()).pathname==='/password') {
        authentication.required=true;
        password=require('dotenv').parse(fs.readFileSync('.env')).STOREFRONT_PASSWORD;
        assert.ok(password,'Existing STOREFRONT_PASSWORD required; no password configuration mutation allowed');
        const endpoint=new URL('/password',authPage.url());
        const response=await authContext.request.post(endpoint.toString(),{form:{password},maxRedirects:0,timeout:45000});
        authentication.httpStatus=response.status();authentication.submitted=true;
        assert.ok([200,302,303].includes(response.status()),'Existing storefront credential rejected');
        await authPage.goto(root.toString(),{waitUntil:'load',timeout:60000});
        assert.notEqual(new URL(authPage.url()).pathname,'/password','Storefront remained locked');
      }
      authCookies=await authContext.cookies();
    } finally {password=null;await authContext.close();}
    for(const product of PRODUCTS) for(const width of (classificationSmoke?[390]:[390,1440])) {
      if(computedOnly&&!((product.handle==='beadmaster'&&width===390)||(product.handle==='lapmaster-12'&&width===1440)))continue;
      const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:false});
      if(authCookies?.length)await context.addCookies(authCookies);
      const page=await context.newPage();const requests=[],blocked=[],pageErrors=[],consoleErrors=[],cssResponses=[];
      const safe=url=>{const u=new URL(url);return {origin:u.origin,path:u.pathname,queryNames:[...u.searchParams.keys()]};};
      page.on('pageerror',e=>pageErrors.push(String(e.message).replace(/https?:\/\/\S+/g,'[URL_REDACTED]')));
      page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text().replace(/https?:\/\/\S+/g,'[URL_REDACTED]'));});
      const cssPending=[];
      page.on('response',r=>{if(new URL(r.url()).pathname.endsWith('/rhino-custom.css'))cssPending.push((async()=>{const body=await r.text();cssResponses.push({...safe(r.url()),status:r.status(),sha256:hash(body),lfSha256:hash(normalize(body)),lfSourceMatches:normalize(body)===normalize(fs.readFileSync('assets/rhino-custom.css','utf8'))});})());});
      await context.route('**/*',async route=>{const r=route.request(), decision=classifyRequest({url:r.url(),method:r.method(),resourceType:r.resourceType(),headers:r.headers(),isNavigation:r.isNavigationRequest(),postData:r.postData()});const rec={...safe(r.url()),method:r.method(),resourceType:r.resourceType(),decision};requests.push(rec);if(decision.action==='BLOCK'){blocked.push(rec);await route.abort();}else await route.continue();});
      page.on('download',d=>d.cancel());
      const url=new URL(root);url.pathname=product.route;url.searchParams.set('view','machine');
      const response=await page.goto(url.toString(),{waitUntil:'load',timeout:60000});await page.waitForTimeout(1500);await Promise.all(cssPending);
      const dom=await page.evaluate(()=>{
        const shell=document.querySelector('product-info.rhino-machine-shell');
        const visible=e=>!!e&&e.getBoundingClientRect().width>0&&e.getBoundingClientRect().height>0&&getComputedStyle(e).visibility!=='hidden';
        const text=e=>e?.textContent?.replace(/\s+/g,' ').trim()||'';
        const forbidden=['media-gallery','product-modal','.product__media-wrapper','.product__description','.rhino-machine-facts','.rhino-machine-resources','.rhino-machine-support','[id^="MachineSpecs-"]','[id^="MachineContents-"]','[id^="MachineContext-"]','[id^="MachineDelivery-"]','[id^="MachineSupport-"]','[id^="MachineResources-"]','[data-support-files]','video','model-viewer'];
        const terms=shell?.querySelector('shopify-payment-terms');const contact=shell?.querySelector('.rhino-machine-contact');
        return {shellCount:document.querySelectorAll('product-info.rhino-machine-shell').length,productId:shell?.dataset.productId,title:text(shell?.querySelector('h1')),price:text(shell?.querySelector('[id^="price-"]')),quantity:shell?.querySelector('[name="quantity"]')?.value,
          purchasePresent:!!shell?.querySelector('[name="add"]'),contact:{visible:visible(contact),text:text(contact),href:contact?.querySelector('a')?.getAttribute('href')||contact?.getAttribute('href')},paymentTerms:{rendered:!!terms,visible:visible(terms),variant:terms?.getAttribute('variant-id')},
          governed:Object.fromEntries(forbidden.map(s=>[s,shell?.querySelectorAll(s).length||0])),previewInlineStyles:document.querySelectorAll('[data-rhino-nonpersistent-preview-css]').length,
          rhinoAssetLinks:Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(e=>e.href.includes('/rhino-custom.css')).length,
          liquidErrors:/Liquid error|Liquid syntax error/i.test(document.body.textContent),overflow:document.documentElement.scrollWidth>innerWidth+1,header:!!document.querySelector('header'),footer:!!document.querySelector('footer'),
          shellDisplay:shell?getComputedStyle(shell).display:null,
          rhinoComputed:{titleOverflowWrap:shell?.querySelector('.product__title')?getComputedStyle(shell.querySelector('.product__title')).overflowWrap:null,titleWhiteSpace:shell?.querySelector('.product__title')?getComputedStyle(shell.querySelector('.product__title')).whiteSpace:null,contactDisplay:contact?getComputedStyle(contact).display:null}};
      });
      const errors=[];if(response?.status()!==200)errors.push('HTTP');if(dom.shellCount!==1||dom.productId!==product.id)errors.push('machine template');
      if(dom.previewInlineStyles!==0||dom.rhinoAssetLinks!==1||cssResponses.length!==1||cssResponses[0].status!==200)errors.push('persistent CSS transport');
      if(!dom.title||!dom.price||dom.quantity!=='1'||!dom.purchasePresent)errors.push('native shell');if(!dom.contact.visible||!/Contact/i.test(dom.contact.text))errors.push('Contact');
      if(!dom.paymentTerms.rendered||!dom.paymentTerms.visible)errors.push('payment terms');if(Object.values(dom.governed).some(n=>n!==0))errors.push('governed activation');
      if(dom.liquidErrors||pageErrors.length)errors.push('Liquid/page errors');if(dom.overflow)errors.push('overflow');if(blocked.length)errors.push('prohibited request');
      if(dom.rhinoComputed.titleOverflowWrap!=='anywhere'||dom.rhinoComputed.titleWhiteSpace!=='normal'||dom.rhinoComputed.contactDisplay!=='flex')errors.push('active Rhino computed styles');
      const cell={product:product.title,gid:product.gid,width,status:errors.length?'FAIL':'PASS',errors,httpStatus:response?.status(),dom,cssResponses,requests,blocked,pageErrors,consoleErrors};cells.push(cell);await context.close();console.log(`${product.handle}/${width}: ${cell.status}`);
    }
  } finally {password=null;authCookies=null;await browser.close();}
  const result={scope:'PERSISTENT_UNPUBLISHED_DEVELOPMENT_PREVIEW_SMOKE',releaseCertification:false,authentication,cells,passed:cells.filter(c=>c.status==='PASS').length,failed:cells.filter(c=>c.status==='FAIL').length,transactionalActions:0,ProductAssignments:0};
  result.classificationMigration=classificationSmoke?'E-MUT-021':null;
  fs.writeFileSync(classificationSmoke?'docs/qa/evidence/epic-f/2026-10-05-e-mut-021-persistent-preview-smoke.json':computedOnly?'docs/qa/evidence/epic-f/2026-10-05-persistent-preview-computed-smoke.json':'docs/qa/evidence/epic-f/2026-10-05-persistent-preview-smoke.json',JSON.stringify(result,null,2)+'\n');assert.equal(result.failed,0,'Persistent preview smoke failed');
}
if(require.main===module)run().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={run};
