'use strict';
const assert = require('node:assert/strict');
const { classifyRequest } = require('./lib/epic-f-preview-network-guard');
const cases = [];
function test(label, action, request) { cases.push({label, action}); assert.equal(classifyRequest(request).action, action, label); }
for (const [resourceType, ext] of [['stylesheet','css'],['script','js'],['font','woff2'],['image','webp']]) {
  test(resourceType+' preload','ALLOW',{url:'https://cdn.shopify.com/assets/native.'+ext,method:'GET',resourceType,headers:{purpose:'preload'}});
  test(resourceType+' ordinary asset','ALLOW',{url:'https://store.invalid/assets/native.'+ext,method:'GET',resourceType});
  test(resourceType+' native checkout preload','ALLOW',{url:'https://store.invalid/checkouts/internal/native.'+ext,method:'GET',resourceType});
}
test('exact previously blocked preload','ALLOW',{pathname:'/checkouts/internal/preloads.js',method:'GET',resourceType:'script'});
test('payment resource preload','ALLOW',{url:'https://shop.app/pay/assets/payment.js',method:'GET',resourceType:'script',headers:{'sec-purpose':'prefetch;prerender'}});
test('prefetch metadata','ALLOW',{pathname:'/cdn/native.js',method:'GET',resourceType:'other',headers:{purpose:'prefetch'}});
test('ordinary storefront document','ALLOW',{pathname:'/products/beadmaster',method:'GET',resourceType:'document',isNavigation:true});
for (const pathname of ['/cart/add.js','/cart/change.js','/cart/update.js','/cart/clear.js','/contact','/orders']) test(pathname+' POST','BLOCK',{pathname,method:'POST',resourceType:'fetch'});
for (const pathname of ['/checkout','/checkouts/id','/checkouts/internal/preloads.js']) test(pathname+' navigation','BLOCK',{pathname,method:'GET',resourceType:'document',isNavigation:true,headers:{purpose:'preload'}});
test('checkout action','BLOCK',{pathname:'/checkouts/id',method:'POST',resourceType:'fetch'});
for (const pathname of ['/files/manual.pdf','/files/instructions.docx','/downloads/opaque','/support_files/opaque']) test(pathname,'BLOCK',{pathname,method:'GET',resourceType:'fetch',headers:{purpose:'preload'}});
test('PDF accept','BLOCK',{pathname:'/opaque',method:'GET',resourceType:'fetch',headers:{accept:'application/pdf'}});
test('explicit download without interaction','BLOCK',{pathname:'/opaque',method:'GET',resourceType:'other',explicitDownload:true});
for (const host of ['www.youtube.com','www.youtube-nocookie.com','player.vimeo.com','fast.wistia.net']) test(host+' eager iframe','BLOCK',{url:'https://'+host+'/embed/id',method:'GET',resourceType:'document'});
test('F analytics path','BLOCK',{pathname:'/events/machine_resource_open',method:'POST',resourceType:'fetch'});
test('F analytics payload','BLOCK',{pathname:'/analytics/collect',method:'POST',resourceType:'fetch',postData:'{"event":"machine_resource_open"}'});
test('native analytics remains classified separately','ALLOW',{pathname:'/analytics/collect',method:'POST',resourceType:'fetch',postData:'{"event":"page_viewed"}'});
test('encoded F analytics payload','BLOCK',{pathname:'/analytics/collect',method:'POST',resourceType:'fetch',postData:'event=rhino%3Amachine%3Aresource-activate'});
test('F analytics publish flag','BLOCK',{pathname:'/',eventName:'rhino:machine:resource-activate'});
test('Contact body on alternate action','BLOCK',{pathname:'/',method:'POST',resourceType:'document',postData:'form_type=contact'});
test('malformed encoding does not break passive guard','ALLOW',{pathname:'/assets/%zz.js',method:'GET',resourceType:'script'});
console.log(JSON.stringify({passed:cases.length,failed:0,allowed:cases.filter(c=>c.action==='ALLOW').length,blocked:cases.filter(c=>c.action==='BLOCK').length}));
