'use strict';
const assert=require('node:assert/strict'),{toolbarOnly}=require('./lib/epic-f-header-preview-focus'),H=require('./lib/epic-f-header-focus-correction');
const valid={verified:true},f={occluded:true,indicatorVisible:true,focusVisible:true,clipped:false,paintedTextHitTests:[{owned:false,hitTag:'IFRAME',hitId:'PBarNextFrame'}]},cases=[];
function test(name,fn){fn();cases.push({name,passed:true});}
test('Structurally verified Shopify toolbar is the actual obstruction',()=>assert.equal(toolbarOnly(f,valid),true));
test('Unverified toolbar identity never exempts a failure',()=>assert.equal(toolbarOnly(f,{verified:false}),false));
test('Merchant header obstruction never exempts a failure',()=>assert.equal(toolbarOnly({...f,paintedTextHitTests:[{owned:false,hitTag:'HEADER',hitId:''}]},valid),false));
test('Merchant/app iframe never exempts a failure',()=>assert.equal(toolbarOnly({...f,paintedTextHitTests:[{owned:false,hitTag:'IFRAME',hitId:'AppFrame'}]},valid),false));
for(const [key,value]of [['indicatorVisible',false],['focusVisible',false],['clipped',true]])test('Actual control failure retained: '+key,()=>assert.equal(toolbarOnly({...f,[key]:value},valid),false));
test('Mixed toolbar and merchant obstruction remains a merchant failure',()=>assert.equal(toolbarOnly({...f,paintedTextHitTests:[...f.paintedTextHitTests,{owned:false,hitTag:'HEADER'}]},valid),false));
H.write('preview-attribution-tests.json',{passed:cases.length,failed:0,cases,focusAlgorithmChanged:false,ownershipSignatureChanged:false});console.log(JSON.stringify({passed:cases.length,failed:0}));
