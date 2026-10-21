'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('./lib/epic-e-owner-response-adapter'),V=require('./validate-epic-g-products'),{reconcile}=require('./reconcile-epic-g-preview');
const tests=[];
for(const [name,mutate]of Object.entries({
 'changed JSON purchase setting':x=>{const row=x.data.theme.files.nodes.find(r=>r.filename==='templates/product.json'),header=row.body.content.match(/^\/\*[\s\S]*?\*\/\r?\n/)[0],t=JSON.parse(row.body.content.slice(header.length));t.sections.main.blocks['buy-buttons'].settings.show_dynamic_checkout=true;row.body.content=header+JSON.stringify(t);},
 'changed Liquid claim':x=>x.data.theme.files.nodes.find(r=>r.filename==='snippets/rhino-g-product-fit.liquid').body.content+='Unsupported',
 'unexpected warning':x=>x.data.theme.files.nodes.find(r=>r.filename==='templates/product.json').body.content='/* Unsupported */\n{}',
 'MAIN readback':x=>x.data.theme.id='gid://shopify/OnlineStoreTheme/158579622085',
 'preview publication':x=>x.data.theme.role='MAIN',
 'missing uploaded asset':x=>x.data.theme.files.nodes.pop()
})){
 const read=E.read;try{E.read=path=>{const x=read(path);if(path===V.DIR+'/preview-files-after.json')mutate(x);return x;};assert.throws(()=>reconcile());tests.push({name,passed:true});}finally{E.read=read;}
}
fs.writeFileSync(V.DIR+'/readback-negative-tests.json',JSON.stringify({passed:tests.length,failed:0,tests,themeWrites:0},null,2)+'\n');console.log(JSON.stringify({passed:tests.length,failed:0}));
