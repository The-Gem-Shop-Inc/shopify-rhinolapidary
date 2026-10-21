'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {chromium}=require('@playwright/test');
const dir='test-results/epic-f/release-gate-cleanup';
(async()=>{
 const browser=await chromium.launch({headless:true}),results=[];
 try{for(const type of ['vertical','horizontal','drawer'])for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage(),requests=[],errors=[];
  const fragment=fs.readFileSync(dir+'/facets-'+type+'.html','utf8');
  // Vertical desktop sorting belongs to the collection section, outside facets.
  const verticalSort=type==='vertical'?'<facet-filters-form><form id="FacetSortForm"><label for="SortBy">Sort by</label><select id="SortBy" name="sort_by"><option value="manual">Featured</option><option value="created-descending" selected>Recently Added</option></select></form></facet-filters-form>':'';
  const html='<!doctype html><html><head><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/assets/base.css"><link rel="stylesheet" href="/assets/component-facets.css"></head><body>'+verticalSort+fragment+'<div id="ProductGridContainer"><div class="collection"><ul id="product-grid" data-id="fixture-grid"><li>Fixture Product</li></ul></div></div><script src="/assets/global.js"></script><script src="/assets/facets.js"></script></body></html>';
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  await context.route('http://cleanup-facets.local/**',route=>{const u=new URL(route.request().url());if(u.pathname.startsWith('/assets/')){const p='assets/'+u.pathname.split('/').pop();return route.fulfill({body:fs.readFileSync(p),contentType:p.endsWith('.js')?'text/javascript':'text/css'});}if(u.searchParams.has('section_id'))requests.push({queryNames:[...u.searchParams.keys()],productTypes:u.searchParams.getAll('filter.p.product_type'),sort:u.searchParams.get('sort_by')});return route.fulfill({body:html,contentType:'text/html'});});
  await page.goto('http://cleanup-facets.local/collections/all');
  const mobile=width===390||type==='drawer';
  if(mobile){await page.locator('summary.mobile-facets__open-wrapper').click();await page.locator('[id^="Details-Mobile-filter.p.product_type"]').locator('summary').click();}
  const checkbox=page.locator(mobile?'#FacetFiltersFormMobile input[value="Accessory"]':'#FacetFiltersForm input[value="Accessory"]');
  const details=checkbox.locator('xpath=ancestor::details[1]');if(await details.count()&&await details.getAttribute('open')===null)await details.locator('summary').first().click();
  await checkbox.focus();await page.keyboard.press('Space');assert.equal(await checkbox.isChecked(),true,type+'/'+width+' checkbox keyboard selection');await page.waitForTimeout(1200);
  assert.ok(requests.some(r=>r.productTypes.includes('Accessory')),type+'/'+width+' Product Type AJAX filter missing: '+errors.join(';'));
  const sort=page.locator(mobile?'#SortBy-mobile':'#SortBy').first();
  await sort.selectOption('manual',{force:true});await page.waitForTimeout(1200);
  assert.ok(requests.some(r=>r.sort==='manual'),type+'/'+width+' sort update missing');
  await sort.selectOption('created-descending',{force:true});await page.waitForTimeout(1200);
  assert.ok(requests.some(r=>r.sort==='created-descending'),type+'/'+width+' Recently Added sort missing');
  assert.equal(errors.length,0,'Facet JS errors: '+errors.join(';'));
  results.push({type,width,productTypeAjaxPassed:true,recentlyAddedSortPassed:true,pageErrors:errors,requests});await context.close();
 }}finally{await browser.close();}
 fs.writeFileSync(dir+'/facets-browser.json',JSON.stringify({passed:true,cells:results},null,2)+'\n');console.log(JSON.stringify({passed:results.length,failed:0,scope:'Local rendered native facets with actual global.js/facets.js and fixture GET responses'}));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
