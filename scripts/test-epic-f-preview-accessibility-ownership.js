'use strict';
const assert=require('node:assert/strict'),{chromium}=require('@playwright/test');
const {axe,previewToolbarOwnership}=require('./lib/epic-f-preview-browser');
(async()=>{
 const browser=await chromium.launch({headless:true}),context=await browser.newContext(),page=await context.newPage();let passed=0;
 try{
  await context.route('https://cdn.shopify.com/shopifycloud/preview-bar/index.html',route=>route.fulfill({contentType:'text/html',body:'<button class="VersionIndependentToolbarButton"></button>'}));
  await context.route('http://cleanup-ownership.local/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html lang="en"><head><title>Ownership fixture</title></head><body><main><h1>Storefront</h1><button id="merchant">Quantity</button><shopify-payment-terms></shopify-payment-terms></main><iframe id="PBarNextFrame" src="https://cdn.shopify.com/shopifycloud/preview-bar/index.html"></iframe></body></html>'}));
  await page.goto('http://cleanup-ownership.local/');
  const ownership=await previewToolbarOwnership(page);assert.equal(ownership.verified,true);passed++;
  const full=await axe(page),scoped=await axe(page,ownership.selector);assert.ok(full.counts.critical>0&&full.counts.serious>0);assert.equal(scoped.clean,true);passed++;
  await page.locator('#merchant').evaluate(e=>e.textContent='');assert.ok((await axe(page,ownership.selector)).counts.critical>0);passed++;
  await page.locator('#merchant').evaluate(e=>e.textContent='Quantity');
  await page.locator('shopify-payment-terms').evaluate(e=>{const root=e.attachShadow({mode:'open'});root.innerHTML='<button></button>';});
  assert.ok((await axe(page,ownership.selector)).counts.critical>0);passed++;
  await page.locator('shopify-payment-terms').evaluate(e=>e.shadowRoot.innerHTML='<button>Provider terms</button>');
  await page.evaluate(()=>{const frame=document.createElement('iframe');frame.id='AppFrame';document.querySelector('main').append(frame);});
  const app=await axe(page,ownership.selector);assert.ok(app.violations.some(v=>v.id==='frame-title'&&v.nodes.some(n=>JSON.stringify(n.target).includes('AppFrame'))));passed++;
  await page.locator('#PBarNextFrame').evaluate(e=>e.src='/merchant-app');await page.waitForTimeout(100);
  assert.equal((await previewToolbarOwnership(page)).verified,false);passed++;
  console.log(JSON.stringify({passed,failed:0,exclusion:'Only structurally proven Shopify preview iframe',merchantAndProviderAndAppViolationsRetained:true}));
 }finally{await context.close();await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
