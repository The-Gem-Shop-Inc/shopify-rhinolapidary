'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{chromium}=require('@playwright/test'),Axe=require('@axe-core/playwright').default;
const {auth}=require('./probe-epic-f-header-focus-correction'),E=require('./lib/epic-e-owner-response-adapter'),R=require('./lib/epic-g-product-release');
const DIR=process.env.RHINO_G2_EVIDENCE_DIR||'docs/qa/evidence/epic-g/g2-recovery-2026-10-16',THEME='158631198917',ORIGIN='https://sz5dnk-nf.myshopify.com';
const args=process.argv.slice(2),phase=args.includes('--baseline')?'baseline':args.includes('--overlay')?'local-overlay':'preview',out={phase,themeId:THEME,startedAt:new Date().toISOString(),cells:[],blockedWrites:[],mockedCommerce:[],failures:[]};
const handles=['automatic-feed-clamp','screw-on-flat-lap','arbor-wrench','trim-saw-6','saw-blade','water-guard','belt-guard-jademaster','saw-vice-plate-set','magnetic-resin-disc-220'];
const outputFile=DIR+'/'+phase+(args.includes('--machines-only')?'-machines-axe':'')+'-browser.json';
const overlay=phase==='local-overlay'?require('./lib/epic-g-product-browser-overlay').renderer():null;
const snapshot=E.read(E.read(R.RELEASE).input.path),native=snapshot.snapshot.datasets.products.records;
const roleReport=require('./lib/epic-g-foundation').assess(require('./lib/epic-g-foundation').loadAuthority(),snapshot);
const machines=roleReport.products.filter(p=>p.approvedClass==='machine').map(p=>{const n=native.find(n=>n.id===p.productGid),f=E.read('data/epic-f-customer-fact-release.json').pageSummary.find(f=>f.productGid===p.productGid);return {productGid:p.productGid,handle:n.handle,published:p.published,templateSuffix:n.templateSuffix,specRows:f?.specRows||0,contentsLines:f?.contentsLines||0,compatibleCards:f?.compatibleCards||0};});
async function dom(page){return page.evaluate(()=>{
 const info=document.querySelector('main product-info'),text=e=>e?.innerText?.trim()||null,rect=e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height};};
 const buy=info?.querySelector('[name=add]'),sku=info?.querySelector('[id^=Sku-]');
 return {themeId:String(window.Shopify?.theme?.id),productId:info?.dataset.productId,title:text(info?.querySelector('h1')),price:text(info?.querySelector('[id^=price-]')),
 purchase:buy?{text:text(buy),disabled:buy.disabled}:null,variantId:info?.querySelector('product-form [name=id]')?.value,quantity:info?.querySelector('[name=quantity]')?.value,
 sku:{text:text(sku),hidden:!sku||getComputedStyle(sku).display==='none',height:sku?rect(sku).height:0},
 fit:Array.from(info?.querySelectorAll('rhino-g-fit:not([hidden]) a')||[],e=>({id:e.dataset.rhinoGMachine,href:e.getAttribute('href'),text:text(e)})),
 specs:Array.from(info?.querySelectorAll('[data-rhino-owner-field][data-rhino-owner-surface=detail]')||[],e=>({field:e.dataset.rhinoOwnerField,text:text(e)})),
 contents:Array.from(info?.querySelectorAll('[data-rhino-owner-content]')||[],e=>e.dataset.rhinoOwnerContent),
 reverse:Array.from(info?.querySelectorAll('[data-rhino-owner-compatible]')||[],e=>e.dataset.rhinoOwnerCompatible),
 machineGallery:Array.from(info?.querySelectorAll('.product__media-wrapper img')||[]).filter(e=>e.getBoundingClientRect().width>0).map(e=>({alt:e.alt,src:e.getAttribute('src')?.split('?')[0]})),
 breadcrumbs:Array.from(document.querySelectorAll('[aria-label*="readcrumb"] a'),e=>({text:text(e),href:e.getAttribute('href')})),
 schema:Array.from(document.querySelectorAll('script[type="application/ld+json"]'),e=>e.textContent.trim()),
 metaDescription:document.querySelector('meta[name=description]')?.content||null,
 overflow:document.documentElement.scrollWidth>innerWidth+1,
 galleryButtons:Array.from(info?.querySelectorAll('.product__media-toggle')||[],e=>({label:e.textContent.trim(),...rect(e),display:getComputedStyle(e).display})),
 gAssets:Array.from(document.querySelectorAll('script[src],link[href]'),e=>e.src||e.href).filter(s=>/rhino-g-/.test(s)),
 skuMarkup:sku?.outerHTML||null,
 headerHeight:document.querySelector('header')?.getBoundingClientRect().height};
 });}
async function visit(page,handle){const response=await page.goto(ORIGIN+'/products/'+handle+'?preview_theme_id='+THEME,{waitUntil:'load',timeout:45000});const machine=machines.find(p=>p.handle===handle);assert.equal(response.status(),machine&&!machine.published?404:200);if(machine&&!machine.published)return {...await dom(page),routeStatus:response.status()};await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>String(window.Shopify?.theme?.id)),THEME);if(overlay&&!machines.some(p=>p.handle===handle)){const id=await page.locator('main product-info').getAttribute('data-section');await page.locator('[id^=Sku-]').evaluate((e,html)=>e.outerHTML=html,overlay.sku('',id));await page.locator('main product-info .product__info-container').evaluate((e,html)=>{const share=e.querySelector('share-button');if(share)share.insertAdjacentHTML('beforebegin',html);else e.insertAdjacentHTML('beforeend',html);},overlay.fit(handle,id));await page.addStyleTag({content:fs.readFileSync('assets/rhino-g-product.css','utf8')});await page.addScriptTag({content:fs.readFileSync('assets/rhino-g-fit.js','utf8')});}return dom(page);}
(async()=>{
 if(phase!=='baseline'){const verified=R.verify();out.projectionSha256=E.digest(verified.release);out.presentationExpiresAt=verified.release.expiresAt;}
 const browser=await chromium.launch({headless:true});
 try{
 const cookies=await auth(browser);
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:1000},acceptDownloads:false});await context.addCookies(cookies);
  await context.route('**/*',async r=>{const q=r.request(),u=new URL(q.url());if(!['GET','HEAD'].includes(q.method())&&/\/cart(?:\/|\.|$)|\/checkouts?|\/admin\//.test(u.pathname)){out.blockedWrites.push({method:q.method(),path:u.pathname});return r.abort();}return r.continue();});
  const page=await context.newPage();
  for(const handle of [...(args.includes('--machines-only')?[]:handles),...(args.includes('--g-only')?[]:machines.map(p=>p.handle))]){
   const cell={handle,width};try{
    cell.dom=await visit(page,handle);assert(!cell.dom.overflow);
    if(phase!=='baseline'&&!machines.some(p=>p.handle===handle)){
     assert(cell.dom.sku.hidden&&cell.dom.sku.height===0,'Blank SKU must collapse');
     assert(!cell.dom.schema.some(s=>/Fits these machines/.test(s)));assert(!/Fits these machines/.test(cell.dom.metaDescription||''));
     const a=await new Axe({page}).include('main').analyze();cell.axe=a.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));assert.deepEqual(cell.axe,[]);
     if(handle==='water-guard')assert(cell.dom.purchase.disabled&&cell.dom.purchase.text==='Sold out');
     else assert.equal(cell.dom.purchase.disabled,false);
     if(['arbor-wrench','automatic-feed-clamp','saw-vice-plate-set'].includes(handle))assert(cell.dom.price.includes('$0.00'),'No commercial restriction/repricing');
     if(handle==='automatic-feed-clamp'){assert.deepEqual(cell.dom.fit.map(t=>t.href),['/products/sawmaster-18','/products/sawmaster-24']);await page.locator('rhino-g-fit a').first().focus();await page.keyboard.press('Tab');cell.fitKeyboard=await page.evaluate(()=>({text:document.activeElement.textContent.trim(),outline:getComputedStyle(document.activeElement).outlineStyle}));assert(cell.fitKeyboard.text.includes('SawMaster'));assert.notEqual(cell.fitKeyboard.outline,'none');}
     if(['belt-guard-jademaster','saw-vice-plate-set','arbor-wrench','magnetic-resin-disc-220','saw-blade'].includes(handle))assert.equal(cell.dom.fit.length,0);
     if(handle==='trim-saw-6')assert.deepEqual(cell.dom.fit.map(t=>t.href),['/products/em-1']);
     if(handle==='screw-on-flat-lap'){
      const buttons=page.locator('main .product__modal-opener--image .product__media-toggle:visible');assert(await buttons.count()>0,'Native image interaction needs real geometry');
      const button=buttons.first(),box=await button.boundingBox();assert(box.width>=44&&box.height>=44);await button.click();await page.waitForTimeout(150);assert.equal(await page.locator('product-modal[open]').count(),1);await page.keyboard.press('Escape');assert.equal(await page.locator('product-modal[open]').count(),0);
      await page.keyboard.press('Tab');await button.focus();await page.keyboard.press('Enter');assert.equal(await page.locator('product-modal[open]').count(),1);await page.keyboard.press('Escape');assert(await button.evaluate(e=>e===document.activeElement));cell.gallery={pointer:true,keyboard:true,focusReturned:true,box};
     }
     if(handle==='saw-blade'){
      const ids=await page.locator('main variant-selects input[type=radio]').evaluateAll(es=>es.map(e=>e.id));cell.variantSelections=[];
      for(const id of ids){await page.locator('main label[for="'+id+'"]').first().click();await page.waitForTimeout(1200);cell.variantSelections.push(await dom(page));}
      assert.deepEqual(cell.variantSelections.map(d=>d.variantId),['46484258652357','46484258685125','46484258717893','46484258750661']);for(const [i,price]of [15,25,75,125].entries())assert(cell.variantSelections[i].price.includes('$'+price+'.00'));
      assert(new URL(page.url()).searchParams.get('variant')==='46484258750661');assert(cell.variantSelections.every(d=>!d.purchase.disabled));
     }
     if(width===390&&['automatic-feed-clamp','screw-on-flat-lap','water-guard'].includes(handle)){
      await page.screenshot({path:DIR+'/'+phase+'-'+handle+'-390.png',fullPage:true});
      await page.evaluate(()=>document.documentElement.style.fontSize=parseFloat(getComputedStyle(document.documentElement).fontSize)*2+'px');
      cell.text200={overflow:await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),headerHeight:await page.locator('header').evaluate(e=>e.getBoundingClientRect().height)};
      assert(!cell.text200.overflow);assert(cell.text200.headerHeight<650,'Do not worsen known enlarged header wrapping');
     }
    }
    if(machines.some(p=>p.handle===handle)){
     const expected=machines.find(p=>p.handle===handle);cell.machine=expected;if(phase==='preview'&&args.includes('--machine-axe')&&expected.published){const axe=await new Axe({page}).include('main').analyze();cell.axe=axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}));assert.deepEqual(cell.axe,[]);}assert.equal(cell.dom.gAssets.length,0);if(!expected.published){assert.equal(cell.dom.routeStatus,404);assert.equal(await page.locator('main product-info').count(),0);}else{assert.equal('gid://shopify/Product/'+cell.dom.productId,expected.productGid);assert(cell.dom.title&&cell.dom.price&&cell.dom.purchase&&cell.dom.variantId);}assert.equal(cell.dom.specs.length,expected.specRows);assert.equal(cell.dom.contents.length,expected.contentsLines);assert.equal(cell.dom.reverse.length,expected.compatibleCards);assert.equal(await page.locator('[data-rhino-g-detail],rhino-g-fit').count(),0);
    }
    if(phase==='preview'&&machines.some(p=>p.handle===handle)){const previous=E.read(DIR+'/baseline-browser.json').cells.find(c=>c.handle===handle&&c.width===width);for(const key of ['productId','title','price','purchase','variantId','quantity','specs','contents','reverse','machineGallery','schema','metaDescription','gAssets'])assert.deepEqual(cell.dom[key],previous.dom[key],'Machine baseline changed: '+key);}
    cell.passed=true;
   }catch(e){cell.passed=false;cell.error=e.message;out.failures.push({handle,width,error:e.message});}
   out.cells.push(cell);fs.writeFileSync(outputFile,JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({phase,handle,width,passed:cell.passed,error:cell.error}));
  }
  await context.close();
 }
 }finally{await browser.close();out.completedAt=new Date().toISOString();fs.writeFileSync(outputFile,JSON.stringify(out,null,2)+'\n');}
 if(out.failures.length)process.exitCode=1;
})().catch(e=>{console.error(e.stack);process.exitCode=1;});

