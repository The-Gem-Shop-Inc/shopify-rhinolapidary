'use strict';
// Read-only browser evidence. Credentials and cookies remain in this process only.
const fs = require('node:fs'), assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { classifyRequest } = require('./lib/epic-f-preview-network-guard');
const { PRODUCTS, hash, normalize, canonicalSheet } = require('./lib/epic-f-nonpersistent-preview');
const { axe, previewToolbarOwnership, localReference } = require('./lib/epic-f-preview-browser');
const DIR = 'docs/qa/evidence/epic-f/live-activation-2026-10-05';
const ROOT = 'https://sz5dnk-nf.myshopify.com';
const NON_MACHINE = [
  {kind:'default_replacement_part',route:'/products/anchor-rod-set'},
  {kind:'consumable',route:'/products/bonded-diamond-wheel-220'},
  {kind:'accessory',route:'/products/screw-on-flat-lap'},
  {kind:'collection',route:'/collections/all'},
  {kind:'search',route:'/search?q=wheel&type=product'},
  {kind:'cart',route:'/cart'},
];
const sanitize = value => String(value).replace(/https?:\/\/[^\s"'<>]+/g,'[URL_REDACTED]').replace(/shp[a-z]+_[A-Za-z0-9_-]+/gi,'[TOKEN_REDACTED]').replace(/(?:preview_key|password|token|signature)=[^\s&"'<>]+/gi,'[CREDENTIAL_REDACTED]');
const sanitizeEvidence=(value,key)=>typeof value==='string'?key==='origin'?(value.includes('.shopifypreview.com')?'[SIGNED_PREVIEW_HOST_REDACTED]':value):sanitize(value):Array.isArray(value)?value.map(v=>sanitizeEvidence(v)):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k,sanitizeEvidence(v,k)])):value;
const safe = value => { const u = new URL(value); return {origin:u.hostname.endsWith('.shopifypreview.com')?'[SIGNED_PREVIEW_HOST_REDACTED]':u.origin,path:u.pathname,queryNames:[...u.searchParams.keys()]}; };
async function computedSourceParity(page) {
  return page.evaluate(async css=>{
    const link=Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(e=>e.href.includes('/rhino-custom.css'));if(!link)return {passed:false,reason:'Missing real asset'};
    const frozen=document.createElement('style');frozen.textContent='*,*::before,*::after{animation-play-state:paused!important;transition:none!important}';document.head.append(frozen);
    const elements=Array.from(document.querySelectorAll('header,header *,main,main *,footer,footer *'));
    const capture=()=>elements.map(e=>{const style=getComputedStyle(e);return Object.fromEntries(Array.from(style).filter(k=>!k.startsWith('--')).map(k=>[k,style.getPropertyValue(k)]));});
    const before=capture(),reference=document.createElement('style');reference.textContent=css;link.after(reference);link.disabled=true;
    try {await new Promise(requestAnimationFrame);const after=capture(),differences=[];for(let i=0;i<elements.length;i++)for(const key of Object.keys(before[i]))if(before[i][key]!==after[i][key])differences.push({element:elements[i].tagName,id:elements[i].id,property:key,before:before[i][key],after:after[i][key]});return {passed:differences.length===0,elementCount:elements.length,standardComputedPropertiesCompared:before.reduce((sum,o)=>sum+Object.keys(o).length,0),differences,scope:'Same actual rendered storefront DOM; exact authoritative CSS temporarily substituted at the original cascade site, then removed. Custom-property whitespace excluded; every resolved standard property compared.'};}
    finally {link.disabled=false;reference.remove();frozen.remove();}
  },fs.readFileSync('assets/rhino-custom.css','utf8'));
}
async function domContract(page) {
  return page.evaluate(() => {
    const text = e => e?.textContent?.replace(/\s+/g,' ').trim() || '';
    const visible = e => !!e && e.getBoundingClientRect().width>0 && e.getBoundingClientRect().height>0 && getComputedStyle(e).visibility!=='hidden';
    const product = document.querySelector('main product-info');
    const shell = product?.matches('.rhino-machine-shell') ? product : null;
    const rect = e => { if(!e)return null;const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,visible:visible(e)}; };
    const price=product?.querySelector('[id^="price-"]'),quantity=product?.querySelector('[name="quantity"]'),purchase=product?.querySelector('[name="add"]'),terms=product?.querySelector('shopify-payment-terms'),contact=product?.querySelector('.rhino-machine-contact');
    const governed = ['.product__media-wrapper','media-gallery','product-modal','.product__description','.rhino-machine-facts','.rhino-machine-resources','.rhino-machine-support','[id^="MachineSpecs-"]','[id^="MachineContents-"]','[id^="MachineContext-"]','[id^="MachineDelivery-"]','[id^="MachineSupport-"]','[id^="MachineResources-"]','[data-support-files]','video','model-viewer'];
    const graphs=[],graphErrors=[];
    for(const s of document.querySelectorAll('script[type="application/ld+json"]'))try{graphs.push(JSON.parse(s.textContent));}catch{graphErrors.push('invalid JSON-LD');}
    const productGraphs=[];const walk = obj => {if(!obj||typeof obj!=='object')return;if(obj['@type']==='Product'||Array.isArray(obj['@type'])&&obj['@type'].includes('Product'))productGraphs.push(obj);for(const v of Object.values(obj))if(v&&typeof v==='object')Array.isArray(v)?v.forEach(walk):walk(v);};graphs.forEach(walk);
    const graphEvidence=productGraphs.map(g=>({types:g['@type'],properties:Object.keys(g).sort(),name:g.name,offerProperties:(Array.isArray(g.offers)?g.offers:[g.offers]).filter(Boolean).map(o=>Object.keys(o).sort())}));
    const cards=Array.from(document.querySelectorAll('main .product-card-wrapper')).map(e=>({title:text(e.querySelector('.card__heading')),url:e.querySelector('.card__heading a')?.getAttribute('href')?.split('?')[0],price:text(e.querySelector('.price')),imageCount:e.querySelectorAll('img').length}));
    return {path:location.pathname,queryNames:[...new URL(location.href).searchParams.keys()],title:text(document.querySelector('main h1')),productTitle:text(product?.querySelector('h1')),productId:product?.dataset.productId,shellCount:document.querySelectorAll('product-info.rhino-machine-shell').length,
      price:text(price),quantity:quantity?.value,variantId:product?.querySelector('product-form input[name="id"]')?.value,variantOptionCount:product?.querySelectorAll('variant-selects option,variant-selects input[type="radio"]').length||0,purchase:purchase?{text:text(purchase),disabled:purchase.disabled,visible:visible(purchase)}:null,
      contact:contact?{text:text(contact),href:contact.getAttribute('href')||contact.querySelector('a')?.getAttribute('href'),visible:visible(contact)}:null,
      terms:terms?{rendered:true,visible:visible(terms),variantId:terms.getAttribute('variant-id'),text:text(terms),shadowText:text(terms.shadowRoot)}:null,
      pickup:product?.querySelector('pickup-availability')?{present:true,available:product.querySelector('pickup-availability').hasAttribute('available'),text:text(product.querySelector('pickup-availability')),visible:visible(product.querySelector('pickup-availability'))}:null,
      description:product?.querySelector('.product__description')?.innerHTML||null,galleryImages:product?.querySelectorAll('media-gallery img').length||0,
      governedCounts:Object.fromEntries(governed.map(s=>[s,shell?.querySelectorAll(s).length||0])),bodyProductModals:document.querySelectorAll('product-modal').length,
      emptyShellHeadings:Array.from(shell?.querySelectorAll('h1,h2,h3,h4,h5,h6')||[]).filter(e=>!text(e)).length,
      metaDescription:document.querySelector('meta[name="description"]')?.content||null,ogImage:document.querySelector('meta[property="og:image"]')?.content||null,ogDescription:document.querySelector('meta[property="og:description"]')?.content||null,
      graphEvidence,graphErrors,header:{present:!!document.querySelector('header.header'),links:Array.from(document.querySelectorAll('header.header a[href]'),e=>({text:text(e),href:e.getAttribute('href')}))},footer:{present:!!document.querySelector('footer.footer'),links:Array.from(document.querySelectorAll('footer.footer a[href]'),e=>({text:text(e),href:e.getAttribute('href')}))},cards,
      filterControls:document.querySelectorAll('facet-filters-form input,facet-filters-form select,menu-drawer .mobile-facets input').length,cartHeading:text(document.querySelector('main .title')),cartItems:document.querySelectorAll('main .cart-item').length,
      horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,documentWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth,
      boxes:{title:rect(product?.querySelector('.product__title')),price:rect(price),quantity:rect(quantity),purchase:rect(purchase),contact:rect(contact),terms:rect(terms)},
      liquidErrors:/Liquid (?:error|syntax error)/i.test(document.body.textContent),previewInlineStyles:document.querySelectorAll('[data-rhino-nonpersistent-preview-css]').length,
      rhinoLinks:Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(e=>e.href.includes('/rhino-custom.css')).length,computed:contact?{contactDisplay:getComputedStyle(contact).display,titleOverflowWrap:getComputedStyle(product.querySelector('.product__title')).overflowWrap}:null};
  });
}
async function readOnlyInteractions(page,width) {
  const result={mobileNavigation:null,predictiveSearch:null,cartUi:null,keyboard:[]};
  if(width===390) {
    const toggle=page.locator('header-drawer > details > summary').first();
    if(await toggle.count()) {await toggle.click();await page.waitForTimeout(250);result.mobileNavigation={opened:await page.locator('header-drawer > details').first().getAttribute('open')!==null,linkCount:await page.locator('header-drawer a').count()};await page.keyboard.press('Escape');}
  }
  const searchToggle=page.locator('header details-modal summary').first();
  if(await searchToggle.count()) {
    await searchToggle.click();const input=page.locator('header input[type="search"]:visible').first();
    if(await input.count()) {await input.fill('wheel');await page.waitForTimeout(1500);result.predictiveSearch={query:'wheel',resultCount:await page.locator('#predictive-search-results li').count(),expanded:await input.getAttribute('aria-expanded')};await input.fill('');}
    await page.keyboard.press('Escape');
  }
  const cart=page.locator('#cart-icon-bubble');result.cartUi={headerLinkPresent:await cart.count()===1,drawerPresent:await page.locator('cart-drawer').count()>0,notificationPresent:await page.locator('cart-notification').count()>0};
  if(result.cartUi.drawerPresent) {await cart.click();await page.waitForTimeout(200);result.cartUi.drawerOpened=await page.locator('cart-drawer').evaluate(e=>e.classList.contains('active'));await page.keyboard.press('Escape');}
  await page.evaluate(()=>{document.activeElement?.blur();document.body.setAttribute('tabindex','-1');document.body.focus();});
  for(let i=0;i<42;i++) {
    await page.keyboard.press('Tab');result.keyboard.push(await page.evaluate(()=>{let e=document.activeElement;while(e?.shadowRoot?.activeElement)e=e.shadowRoot.activeElement;const s=e?getComputedStyle(e):null;return {tag:e?.tagName,role:e?.getAttribute('role'),name:e?.getAttribute('aria-label')||e?.getAttribute('name')||e?.textContent?.replace(/\s+/g,' ').trim().slice(0,100),insideStorefront:!!e?.closest('header,main,footer'),outline:s?.outlineStyle,outlineWidth:s?.outlineWidth,boxShadow:s?.boxShadow};}));
  }
  return result;
}
async function run(mode, options={}) {
  assert.ok(['baseline','post-push','canary','assigned','post-assignment','alternate','pre-assignment-normal','excluded-normal'].includes(mode));
  const isMachineMode=['canary','assigned','alternate'].includes(mode);
  const reference=isMachineMode?await localReference(fs.readFileSync('assets/rhino-custom.css','utf8')):null;
  if(reference)assert.equal(reference.equal,true,'Authoritative CSS external/inline local CSSOM reference');
  const browser=await chromium.launch({headless:true});let password=null,cookies=null;const cells=[];const startedAt=new Date().toISOString();
  const authentication={required:false,cookiesPersisted:false,passwordSettingsChanged:false};
  try {
    const auth=await browser.newContext({acceptDownloads:false});
    try {const p=await auth.newPage();await p.goto(ROOT,{waitUntil:'load',timeout:60000});if(new URL(p.url()).pathname==='/password'){authentication.required=true;password=require('dotenv').parse(fs.readFileSync('.env')).STOREFRONT_PASSWORD;assert.ok(password,'Existing storefront password unavailable');const r=await auth.request.post(new URL('/password',p.url()).toString(),{form:{password},maxRedirects:0});assert.ok([200,302,303].includes(r.status()));await p.goto(ROOT,{waitUntil:'load',timeout:60000});assert.notEqual(new URL(p.url()).pathname,'/password');}cookies=await auth.cookies();}finally{password=null;await auth.close();}
    const excludedIds=require('./lib/epic-f-live-machine-activation').EXCLUSIONS;
    const excludedScenarios=mode==='excluded-normal'?JSON.parse(fs.readFileSync(DIR+'/products-task-after.json')).products.filter(p=>excludedIds.includes(p.id)).map(p=>({gid:p.id,id:p.id.split('/').pop(),handle:p.handle,route:'/products/'+p.handle})):null;
    const scenarios=mode==='excluded-normal'?excludedScenarios:mode==='canary'?[PRODUCTS[0]]:['assigned','pre-assignment-normal'].includes(mode)?PRODUCTS:mode==='alternate'?[PRODUCTS[0],options.excluded]:NON_MACHINE;
    assert.ok(scenarios.every(Boolean));
    for(const product of scenarios) for(const width of mode==='pre-assignment-normal'?[390]:[390,1440]) {
      const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:false});await context.addCookies(cookies);
      const page=await context.newPage(),network={requests:[],blocked:[],failed:[],httpErrors:[],consoleErrors:[],pageErrors:[],downloads:[]},css=[];const pending=[];
      await context.route('**/*',async route=>{const r=route.request();const decision=classifyRequest({url:r.url(),method:r.method(),resourceType:r.resourceType(),headers:r.headers(),isNavigation:r.isNavigationRequest(),postData:r.postData()});const record={...safe(r.url()),method:r.method(),type:r.resourceType(),decision};network.requests.push(record);if(decision.action==='BLOCK'){network.blocked.push(record);await route.abort();}else await route.continue();});
      page.on('console',m=>{if(m.type()==='error')network.consoleErrors.push(sanitize(m.text()));});page.on('pageerror',e=>network.pageErrors.push(sanitize(e.message)));page.on('requestfailed',r=>network.failed.push({...safe(r.url()),error:sanitize(r.failure()?.errorText||'')}));
      page.on('download',async d=>{network.downloads.push({...safe(d.url()),cancelled:true});await d.cancel();});
      page.on('response',r=>{if(r.status()>=400)network.httpErrors.push({...safe(r.url()),status:r.status()});if(new URL(r.url()).pathname.endsWith('/rhino-custom.css'))pending.push((async()=>{const body=await r.text();css.push({...safe(r.url()),status:r.status(),sha256:hash(body),lfSha256:hash(normalize(body)),lfSourceMatches:normalize(body)===normalize(fs.readFileSync('assets/rhino-custom.css','utf8')),transport:'REAL_SHOPIFY_CDN_ASSET'});})());});
      const target=new URL(product.memoryOnlyUrl||product.route,ROOT);if(mode==='alternate')target.searchParams.set('view','machine');
      const response=await page.goto(target.toString(),{waitUntil:'load',timeout:60000});await page.waitForTimeout(1500);await Promise.all(pending);
      const dom=await domContract(page),isMachine=isMachineMode;const errors=[];
      if(isMachine){const actual=await page.evaluate(source=>{const sheet=Array.from(document.styleSheets).find(s=>s.href?.includes('/rhino-custom.css'));if(!sheet)return null;return eval('('+source+')')(sheet);},canonicalSheet.toString());const canonicalHash=actual?hash(JSON.stringify(actual)):null;const computedParity=await computedSourceParity(page);for(const response of css){response.canonicalCssomHash=canonicalHash;response.referenceCssomHash=reference.externalHash;response.canonicalMatches=canonicalHash===reference.externalHash;response.computedSourceParity=computedParity;response.serializationQualification='Shopify normal CDN minification changes CSSOM serialization; source identity is separately proved by Admin stored checksum and exact source readback.';}}
      if(response?.status()!==(mode==='excluded-normal'?404:200))errors.push('HTTP');if(dom.liquidErrors)errors.push('Liquid error');if(network.pageErrors.length)errors.push('page error');if(network.blocked.length)errors.push('prohibited network request');if(dom.horizontalOverflow)errors.push('horizontal overflow');
      if(mode==='excluded-normal'&&(dom.shellCount!==0||dom.productId||dom.queryNames.includes('view')))errors.push('Excluded machine normal-route activation');
      if(mode==='pre-assignment-normal'&&(dom.shellCount!==0||dom.productId!==product.id||!dom.productTitle||!dom.price||!dom.purchase?.visible||dom.queryNames.includes('view')))errors.push('native normal-route visibility before assignment');
      if(isMachine) {
        if(dom.shellCount!==1||dom.productId!==product.id)errors.push('machine template');
        if(dom.rhinoLinks!==1||dom.previewInlineStyles!==0||css.length!==1||!css[0].computedSourceParity.passed||dom.computed?.contactDisplay!=='flex'||dom.computed?.titleOverflowWrap!=='anywhere')errors.push('real repository CSS');
        if(!dom.productTitle||!dom.price||dom.quantity!=='1'||!dom.variantId||!dom.purchase?.visible)errors.push('native Product shell');
        if(!dom.contact?.visible||dom.contact.text!=='Contact'||dom.contact.href!=='/pages/contact')errors.push('Contact');if(!dom.terms?.rendered||!dom.terms.visible)errors.push('native payment terms');
        if(Object.values(dom.governedCounts).some(n=>n!==0)||dom.bodyProductModals!==0||dom.emptyShellHeadings)errors.push('governed factual DOM');
        const allowedProduct=['@context','@type','@id','productID','name','url','offers'];const allowedOffer=['@type','@id','url','identifier','price','priceCurrency','availability'];
        if(dom.graphErrors.length||dom.graphEvidence.length!==1||dom.graphEvidence.some(g=>g.properties.some(p=>!allowedProduct.includes(p))||g.offerProperties.some(props=>props.some(p=>!allowedOffer.includes(p)))))errors.push('JSON-LD containment');
        // Existing brand-only social fallback is authorized; Product media/description claims are not.
        if(dom.metaDescription||dom.ogDescription||dom.ogImage&&!dom.ogImage.includes('/rhino-og-default.jpg'))errors.push('governed metadata fallback');
      }
      let fullAxe=null,storefrontAxe=null,ownership=null;
      if(isMachine||mode==='pre-assignment-normal'||product.kind==='default_replacement_part') {ownership=await previewToolbarOwnership(page);fullAxe=await axe(page);storefrontAxe=ownership.verified?await axe(page,ownership.selector):fullAxe;if(!storefrontAxe.clean)errors.push('merchant-owned serious/critical accessibility');}
      let interactions=null;if(product.kind==='default_replacement_part'||mode==='canary')interactions=await readOnlyInteractions(page,width);
      if(dom.description!==null){dom.descriptionSha256=hash(dom.description);delete dom.description;}
      if(dom.ogImage)dom.ogImagePath=new URL(dom.ogImage,page.url()).pathname;
      const cell={kind:product.kind||'machine',handle:product.handle,gid:product.gid,width,url:safe(target.toString()),status:errors.length?'FAIL':'PASS',errors,httpStatus:response?.status(),dom,css,fullAxe,storefrontAxe,toolbarOwnership:ownership,interactions,network,performance:await page.evaluate(()=>({classification:'LIVE_DEVELOPMENT_DIAGNOSTIC',releaseCertification:false,navigation:performance.getEntriesByType('navigation').map(e=>({duration:e.duration,domContentLoaded:e.domContentLoadedEventEnd,load:e.loadEventEnd})),resourceCount:performance.getEntriesByType('resource').length}))};cells.push(cell);
      console.log(`${mode}: ${product.handle||product.kind}/${width} ${cell.status}${errors.length?' ('+errors.join(', ')+')':''}`);await context.close();
    }
  }finally{password=null;cookies=null;await browser.close();}
  const result={scope:'AUTHORIZED_LIVE_DEVELOPMENT_ACTIVATION',mode,startedAt,completedAt:new Date().toISOString(),authentication,reference,transactionalActions:0,cells,passed:cells.filter(c=>c.status==='PASS').length,failed:cells.filter(c=>c.status==='FAIL').length};
  fs.mkdirSync(DIR,{recursive:true});const serialized=JSON.stringify(sanitizeEvidence(result),null,2);JSON.parse(serialized);
  // URL inventories have query names only; sanitization also protects provider errors/axe HTML.
  fs.writeFileSync(`${DIR}/browser-${mode}.json`,serialized+'\n');assert.equal(result.failed,0,'Bounded live browser gate failed; inspect sanitized evidence');return result;
}
if(require.main===module)(async()=>{
  let excluded=null;
  try {if(process.argv[2]==='alternate')excluded=await require('./lib/epic-f-live-excluded-preview').excludedPreview();await run(process.argv[2],{excluded});}
  finally {if(excluded)excluded.memoryOnlyUrl=null;}
})().catch(e=>{console.error(sanitize(e.message));process.exitCode=1;});
module.exports={run,domContract,sanitize,sanitizeEvidence,safe,NON_MACHINE};
