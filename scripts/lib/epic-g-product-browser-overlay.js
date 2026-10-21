'use strict';
// Test only. These local LiquidJS fragments do NOT prove Shopify Liquid execution.
const fs=require('node:fs'),{Liquid}=require('liquidjs'),E=require('./epic-e-owner-response-adapter'),R=require('./epic-g-product-release');
const clean=s=>s.replace(/{%[-]?\s*doc\s*[-]?%}[\s\S]*?{%[-]?\s*enddoc\s*[-]?%}/g,'');
function renderer({skuOnly=false}={}){
 const release=skuOnly?null:R.verify().release,native=skuOnly?{products:{records:[]},variants:{records:[]}}:E.read(release.input.path).snapshot.datasets;
 const models=new Map(native.products.records.map(p=>[p.id,{id:Number(p.id.split('/').pop()),handle:p.handle,title:p.title,url:'/products/'+p.handle,published_at:p.publishedAt,metafields:{rhino:{}},variants:native.variants.records.filter(v=>v.product.id===p.id).map(v=>({id:Number(v.id.split('/').pop()),sku:v.sku}))}]));
 for(const p of native.products.records)for(const m of p.metafields.nodes.filter(m=>m.namespace==='rhino'))models.get(p.id).metafields.rhino[m.key]={type:m.type,value:m.type==='list.product_reference'?m.jsonValue.map(id=>models.get(id)).filter(Boolean):m.jsonValue};
 const engine=new Liquid({jsTruthy:false});engine.registerFilter('t',()=> 'SKU');engine.registerFilter('asset_url',x=>x);engine.registerFilter('stylesheet_tag',()=> '');
 const detail=clean(fs.readFileSync('snippets/rhino-g-product-detail.liquid','utf8')).replace(/{%- capture g_role -%}[\s\S]*?{%- endcapture -%}/,"{%- assign g_role = 'accessory' -%}").replace(/<script[\s\S]*?<\/script>/g,'');
 return {sku(sku,id){return engine.parseAndRenderSync(detail,{product:{selected_or_first_available_variant:{sku}},section:{id}});},
 fit(handle,id){if(skuOnly)throw new Error('SKU-only fixture cannot authorize fit');return engine.parseAndRenderSync(clean(fs.readFileSync(R.LIQUID,'utf8')),{product:[...models.values()].find(p=>p.handle===handle),section:{id},heading:'Fits these machines'});}};
}
module.exports={renderer};
