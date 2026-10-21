const {test,expect,chromium}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const fs=require('node:fs'),path=require('node:path');
const {factDocument,createFixture}=require('../scripts/lib/epic-f-fact-fixtures');
const {mountGallery}=require('../scripts/lib/epic-f-gallery-fixtures');
async function mount(page,state,options={}){return mountGallery(page,'zero',{document:factDocument(state,options)});}
async function assertShell(page) {
  await expect(page.locator('h1')).toHaveCount(1);await expect(page.getByRole('main')).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await expect(page.locator('product-form form')).toHaveCount(1);
  const axe=await new AxeBuilder({page}).analyze();expect(axe.violations.filter(v=>['serious','critical'].includes(v.impact))).toEqual([]);
}
for(const width of [320,390,768,1440])for(const state of ['zero','specifications','long','contents','large-contents'])test(`${width}px ${state}: semantic facts, contents and no overflow`,async({page},info)=>{
  await page.setViewportSize({width,height:900});const fixture=await mount(page,state);
  try {
    await assertShell(page);expect(fixture.errors).toEqual([]);expect(fixture.external).toEqual([]);
    if(state==='zero'){await expect(page.locator('.rhino-machine-facts')).toHaveCount(0);return;}
    for(const dl of await page.locator('.rhino-machine-facts dl').all()){
      const rows=dl.locator('.rhino-machine-fact-row');expect(await rows.count()).toBeGreaterThan(0);
      for(const row of await rows.all()){await expect(row.locator('dt')).toHaveCount(1);await expect(row.locator('dd')).toHaveCount(1);await expect(row.locator('dd')).not.toBeEmpty();}
    }
    await expect(page.locator('.rhino-machine-facts table')).toHaveCount(0);
    const contact=page.locator('.rhino-machine-contact');
    expect(await contact.evaluate(e=>!!(e.compareDocumentPosition(document.querySelector('.rhino-machine-facts'))&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
    for(const li of await page.locator('.rhino-machine-component').all()){
      const q=await li.getAttribute('aria-describedby');if(q)await expect(page.locator('#'+q)).toContainText(/Quantity: [1-9]/);
      for(const a of await li.locator('a:visible').all())await expect(a).toHaveAccessibleName(/Synthetic catalog component/);
    }
    for(const list of await page.locator('.rhino-machine-contents-list').all())expect(await list.locator('li').count()).toBeGreaterThan(0);
    await info.attach('F-PBI-014B-partial',{body:JSON.stringify({width,state,scope:'specification/contents fixture evidence only',liveParity:false}),contentType:'application/json'});
  }finally{await fixture.close();}
});
test('contents names and meanings remain distinct; keyboard order follows source',async({page})=>{
  const f=await mount(page,'contents');try{
    for(const name of ['Included catalog items','Included components','Not included','Optional items','Recommended items'])await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
    await page.locator('.rhino-machine-contact').focus();await page.keyboard.press('Tab');
    const links=page.locator('.rhino-machine-contents a:visible');await expect(links.first()).toBeFocused();
    for(let i=1;i<await links.count();i++){await page.keyboard.press('Tab');await expect(links.nth(i)).toBeFocused();}
    await expect(page.locator('.rhino-machine-contents button,.rhino-machine-contents form')).toHaveCount(0);
  }finally{await f.close();}
});
test('suppressed orphan leaves no empty card or focus target',async({page})=>{
  const fixture=createFixture('contents',{mutateRows:rs=>{for(const r of rs)r.conflictIds=['C-040'];}});
  const f=await mount(page,'contents',{fixture});try{await expect(page.locator('.rhino-machine-contents,.rhino-machine-component')).toHaveCount(0);await assertShell(page);}finally{await f.close();}
});
for(const width of [320,390,768,1440])test(`${width}px 200% text enlargement of long facts and contents`,async({page},info)=>{
  await page.setViewportSize({width,height:900});const f=await mount(page,'long');try{
    await page.addStyleTag({content:'html { font-size: 125% !important; }'});await assertShell(page);
    await info.attach('text-enlargement',{body:JSON.stringify({method:'root font 62.5% to 125%; text enlargement, not browser zoom',width}),contentType:'application/json'});
  }finally{await f.close();}
});
test('actual Chromium 200% browser zoom reflows populated long modules',async({},info)=>{
  const extension=info.outputPath('zoom-extension');fs.mkdirSync(extension,{recursive:true});
  fs.writeFileSync(path.join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'F4 local zoom evidence',version:'1.0',permissions:['tabs'],background:{service_worker:'worker.js'}}));
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
