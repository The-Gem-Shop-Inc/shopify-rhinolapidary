const {test,expect,chromium}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const fs=require('node:fs'),path=require('node:path');
const {supportDocument,supportFixture}=require('../scripts/lib/epic-f-support-resources-fixtures');
const {mountGallery}=require('../scripts/lib/epic-f-gallery-fixtures');
async function mount(page,state,options={}){return mountGallery(page,'zero',{document:supportDocument(state,options)});}
async function assertShell(page){
  await expect(page.locator('h1')).toHaveCount(1);await expect(page.getByRole('main')).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await expect(page.locator('product-form form')).toHaveCount(1);
  const axe=await new AxeBuilder({page}).analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
}
for(const width of [320,390,768,1440])for(const state of ['zero','support','downloads','video','long'])test(`${width}px ${state}: support and resources semantics`,async({page})=>{
  await page.setViewportSize({width,height:900});const f=await mount(page,state);try{
    await assertShell(page);expect(f.errors).toEqual([]);expect(f.external).toEqual([]);
    expect(f.requests.some(r=>String(r).includes('/fixture-downloads/'))).toBe(false);
    const modules=page.locator('.rhino-machine-support,.rhino-machine-resources');
    if(state==='zero'){await expect(modules).toHaveCount(0);return;}
    for(const module of await modules.all()){
      await expect(module.locator('h2')).toHaveCount(1);
      expect(await module.evaluate(e=>!!(document.querySelector('.rhino-machine-contact').compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    }
    for(const row of await page.locator('.rhino-machine-support .rhino-machine-fact-row').all()){await expect(row.locator('dt')).not.toBeEmpty();await expect(row.locator('dd')).not.toBeEmpty();}
    for(const control of await page.locator('.rhino-machine-resources a,.rhino-machine-resources button').all()){
      await expect(control).toHaveAccessibleName(/Synthetic/);
      await expect(page.locator('#'+await control.getAttribute('aria-describedby'))).not.toBeEmpty();
    }
    await expect(page.locator('.rhino-machine-resources iframe')).toHaveCount(0);
    await expect(page.locator('[autoplay]')).toHaveCount(0);
  }finally{await f.close();}
});
test('keyboard order, visible focus and neutral Contact distinction',async({page})=>{
 const f=await mount(page,'combined');try{
  for(const label of ['Warranty issuer','Warranty administrator','Repair provider','Manufacturer','Marketed brand'])await expect(page.locator('.rhino-machine-support dt').filter({hasText:new RegExp('^'+label+'$')})).toHaveCount(1);
  await expect(page.locator('.rhino-machine-contact')).toHaveAccessibleName('Contact');
  await page.locator('.rhino-machine-contact').focus();
  for(const control of await page.locator('.rhino-machine-support a,.rhino-machine-resources a,.rhino-machine-resources button').all()){
   await page.keyboard.press('Tab');await expect(control).toBeFocused();
   expect(await control.evaluate(e=>[getComputedStyle(e),getComputedStyle(e,'::after')].some(s=>(s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0)||s.boxShadow!=='none'))).toBe(true);
  }
 }finally{await f.close();}
});
test('missing destination preserves facts without an empty CTA',async({page})=>{
 const f=await mount(page,'no-destination');try{await expect(page.locator('.rhino-machine-support')).toContainText('Synthetic Issuer');await expect(page.locator('.rhino-machine-support a, .rhino-machine-support button')).toHaveCount(0);await expect(page.locator('.rhino-machine-contact')).toHaveAttribute('href','/pages/contact');await assertShell(page);}finally{await f.close();}
});
test('suppressed support resources leave no focus shells',async({page})=>{
 const fixture=supportFixture('one',{mutate:({packet})=>packet.resources[0].resourceType='support'});const f=await mount(page,'one',{fixture});try{await expect(page.locator('.rhino-machine-resources')).toHaveCount(0);await assertShell(page);}finally{await f.close();}
});
test('native deferred video: keyboard activation, provider only on interaction, focus, no autoplay',async({page})=>{
 const f=await mount(page,'video');try{
  expect(f.external).toEqual([]);await expect(page.locator('iframe')).toHaveCount(0);
  const button=page.getByRole('button',{name:/Load video: Synthetic video/});await button.focus();await page.keyboard.press('Enter');
  const iframe=page.locator('.rhino-machine-resource-video iframe');await expect(iframe).toHaveCount(1);await expect(iframe).toBeFocused();
  await expect.poll(()=>f.external.length).toBe(1);expect(f.external[0]).toContain('autoplay=0');
  await expect(button).toBeHidden();await expect(iframe).toHaveAttribute('width','960');await expect(iframe).toHaveAttribute('height','540');
  await expect(page.locator('[autoplay]')).toHaveCount(0);await page.keyboard.press('Tab');expect(f.errors).toEqual([]);
 }finally{await f.close();}
});
for(const width of [320,390,768,1440])test(`${width}px 200% text enlargement`,async({page},info)=>{
 await page.setViewportSize({width,height:900});const f=await mount(page,'long');try{await page.addStyleTag({content:'html { font-size:125% !important; }'});await assertShell(page);await info.attach('text-enlargement',{body:JSON.stringify({method:'root font 62.5% to 125%; not browser zoom',width}),contentType:'application/json'});}finally{await f.close();}
});
test('actual Chromium 200% browser zoom reflows support and resources',async({},info)=>{
  const extension=info.outputPath('zoom-extension');fs.mkdirSync(extension,{recursive:true});
  fs.writeFileSync(path.join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'F6 local zoom evidence',version:'1.0',permissions:['tabs'],background:{service_worker:'worker.js'}}));
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

