const {test,expect,chromium}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const fs=require('node:fs'),path=require('node:path');
const {contextDocument,contextualFixture,pickupResponse}=require('../scripts/lib/epic-f-context-delivery-fixtures');
const {mountGallery}=require('../scripts/lib/epic-f-gallery-fixtures');
async function mount(page,state,options={}){return mountGallery(page,'zero',{document:contextDocument(state,options),...(options.pickup?{pickupBody:options.pickup==='error'?'invalid native response':pickupResponse(options.pickup),pickupStatus:options.pickup==='error'?500:200}:{})});}
async function assertShell(page){
  await expect(page.locator('h1')).toHaveCount(1);await expect(page.getByRole('main')).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await expect(page.locator('product-form form')).toHaveCount(1);
  const axe=await new AxeBuilder({page}).analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
}
for(const width of [320,390,768,1440])for(const state of ['zero','small','large','delivery','long'])test(`${width}px ${state}: contextual and delivery semantics`,async({page})=>{
  await page.setViewportSize({width,height:900});const f=await mount(page,state);try{
    await assertShell(page);expect(f.errors).toEqual([]);expect(f.external).toEqual([]);
    const modules=page.locator('.rhino-machine-contextual,.rhino-machine-delivery');
    if(state==='zero'){await expect(modules).toHaveCount(0);return;}
    for(const module of await modules.all()){
      await expect(module.locator('h2')).toHaveCount(1);
      expect(await module.evaluate(e=>!!(document.querySelector('.rhino-machine-contact').compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    }
    for(const card of await page.locator('.rhino-machine-contextual li').all()){
      await expect(card.locator('a:visible')).toHaveAccessibleName(/Synthetic contextual item/);
      for(const id of (await card.getAttribute('aria-describedby')).split(' '))await expect(page.locator('#'+id)).not.toBeEmpty();
      await expect(card.locator('button,form')).toHaveCount(0);
    }
    for(const row of await page.locator('.rhino-machine-delivery .rhino-machine-fact-row').all()){await expect(row.locator('dt')).toHaveCount(1);await expect(row.locator('dd')).not.toBeEmpty();}
    if(['delivery','long'].includes(state))await expect(page.getByRole('link',{name:'Shipping policy',exact:true})).toHaveAttribute('href','/policies/shipping-policy');
  }finally{await f.close();}
});
test('keyboard hierarchy Contact, related cards, policy; meanings do not rely on color',async({page})=>{
  const f=await mount(page,'combined');try{
    for(const name of ['Contextual accessory','Contextual consumable','Approved compatibility'])await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
    await page.locator('.rhino-machine-contact').focus();
    for(const link of await page.locator('.rhino-machine-contextual a:visible,.rhino-machine-delivery a:visible').all()){await page.keyboard.press('Tab');await expect(link).toBeFocused();expect(await link.evaluate(e=>{return [getComputedStyle(e),getComputedStyle(e,'::after')].some(s=>(s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0)||s.boxShadow!=='none');})).toBe(true);}
  }finally{await f.close();}
});
test('suppressed and deduplicated relationships leave no focus shells',async({page})=>{
  const fixture=contextualFixture('small',{mutate:({packet})=>packet.edges[0].state='blocked'});const f=await mount(page,'small',{fixture});try{await expect(page.locator('.rhino-machine-contextual')).toHaveCount(0);await assertShell(page);}finally{await f.close();}
});
for(const pickup of ['available','unavailable','empty','null','error'])test(`native pickup ${pickup} remains independent`,async({page})=>{
  const f=await mount(page,'delivery',{pickup});try{
    await expect(page.locator('pickup-availability')).toHaveCount(1);
    await expect(page.locator('.rhino-machine-delivery pickup-availability,.rhino-machine-delivery button')).toHaveCount(0);
    if(pickup==='available')await expect(page.locator('pickup-availability')).toContainText('Pickup available');
    if(pickup==='unavailable')await expect(page.locator('pickup-availability')).toContainText('Pickup currently unavailable');
    if(pickup==='error')await expect(page.locator('pickup-availability button')).toContainText('Refresh');
    if(['empty','null'].includes(pickup))await expect(page.locator('pickup-availability')).not.toHaveAttribute('available','');
    await assertShell(page);expect(f.errors).toEqual([]);
    await page.locator('pickup-availability').evaluate(e=>e.update(null));await expect(page.locator('pickup-availability')).toBeEmpty();
  }finally{await f.close();}
});
for(const width of [320,390,768,1440])test(`${width}px 200% text enlargement`,async({page},info)=>{
  await page.setViewportSize({width,height:900});const f=await mount(page,'long');try{await page.addStyleTag({content:'html { font-size:125% !important; }'});await assertShell(page);await info.attach('text-enlargement',{body:JSON.stringify({method:'root font 62.5% to 125%; not browser zoom',width}),contentType:'application/json'});}finally{await f.close();}
});

test('actual Chromium 200% browser zoom reflows contextual and delivery modules',async({},info)=>{
  const extension=info.outputPath('zoom-extension');fs.mkdirSync(extension,{recursive:true});
  fs.writeFileSync(path.join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'F5 local zoom evidence',version:'1.0',permissions:['tabs'],background:{service_worker:'worker.js'}}));
  fs.writeFileSync(path.join(extension,'worker.js'),'chrome.runtime.onInstalled.addListener(()=>{});');
  const context=await chromium.launchPersistentContext(info.outputPath('profile'),{channel:'chromium',headless:true,viewport:null,args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--window-size=1280,1000']});
  let f;try{
    const worker=context.serviceWorkers()[0]||await context.waitForEvent('serviceworker');const page=await context.newPage();f=await mount(page,'long');
    const before=await page.evaluate(()=>({width:innerWidth,dpr:devicePixelRatio}));
    const zoom=await worker.evaluate(async()=>{const tab=(await chrome.tabs.query({})).find(t=>t.url.startsWith('http://127.0.0.1'));await chrome.tabs.setZoom(tab.id,2);return chrome.tabs.getZoom(tab.id);});expect(zoom).toBe(2);
    await expect.poll(()=>page.evaluate(()=>innerWidth)).toBeLessThanOrEqual(before.width/2+1);await assertShell(page);
    const after=await page.evaluate(()=>({width:innerWidth,dpr:devicePixelRatio}));expect(after.dpr).toBe(before.dpr*2);
    await info.attach('actual-browser-zoom',{body:JSON.stringify({method:'chrome.tabs.setZoom',zoom,before,after}),contentType:'application/json'});
  }finally{await context.close();if(f)await f.close();}
});
