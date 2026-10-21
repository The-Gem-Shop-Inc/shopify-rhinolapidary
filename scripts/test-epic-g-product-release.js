'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),{Liquid}=require('liquidjs'),G=require('./lib/epic-g-foundation'),R=require('./lib/epic-g-product-release'),E=require('./lib/epic-e-owner-response-adapter');
const fixture=E.read('tests/fixtures/epic-g-foundation.json'),tests=[];
const engine=new Liquid({strictFilters:true});
let now=Date.parse(fixture.asOf);
engine.registerFilter('date',(value,format)=>{if(format==='%s')return Math.floor((value==='now'?now:Date.parse(value))/1000);return value;});
engine.registerFilter('t',value=>value==='products.product.sku'?'SKU':value);
engine.registerFilter('asset_url',value=>'/assets/'+value);
engine.registerFilter('stylesheet_tag',value=>'<link rel="stylesheet" href="'+value+'">');
const strip=source=>source.replace(/{% doc %}[\s\S]*?{% enddoc %}/g,'');
function setup(mutate=()=>{}){
 const f=structuredClone(fixture);mutate(f);
 for(const [name,root]of [['products','products'],['variants','productVariants']]){const d=f.envelope.snapshot.datasets[name];d.recordCount=d.records.length;f.envelope.operations.find(o=>o.query===require('./lib/epic-g-admin-read').OPERATIONS[name]).response.data[root].nodes=d.records;}
 const report=G.assess(G.fixtureAuthority(f.authority),f.envelope,{asOf:f.asOf}),release=R.project(report,f.envelope);
 const models=new Map(f.envelope.snapshot.datasets.products.records.map(p=>[p.id,{id:Number(p.id.split('/').pop()),handle:p.handle,title:p.title,url:'/products/'+p.handle,published_at:p.publishedAt,metafields:{rhino:{}},variants:f.envelope.snapshot.datasets.variants.records.filter(v=>v.product.id===p.id).map(v=>({id:Number(v.id.split('/').pop())}))}]));
 for(const p of f.envelope.snapshot.datasets.products.records)for(const m of p.metafields.nodes.filter(m=>m.namespace==='rhino'))models.get(p.id).metafields.rhino[m.key]={type:m.type,value:m.type==='list.product_reference'?m.jsonValue.map(id=>models.get(id)).filter(Boolean):m.jsonValue};
 return {f,report,release,models,source:R.compile(release)};
}
function render(state,handle){const product=[...state.models.values()].find(p=>p.handle===handle);return engine.parseAndRenderSync(strip(state.source),{product,section:{id:'fixture'},heading:'Fits these machines'});}
function test(name,fn){try{fn();tests.push({name,status:'PASS'});}catch(e){tests.push({name,status:'FAIL',error:e.message});console.error(name,e.stack);}}
now=Date.parse(fixture.asOf)+1000;
test('single approved machine renders one named link',()=>{const s=setup(),html=render(s,'trim-saw-6');assert(html.includes('/products/em-1'));assert.equal((html.match(/data-rhino-g-machine=/g)||[]).length,1);assert(html.includes('Fits these machines'));});
test('Automatic Feed Clamp renders exactly two approved machine identities',()=>{const s=setup(),html=render(s,'automatic-feed-clamp');assert(html.includes('/products/sawmaster-18'));assert(html.includes('/products/sawmaster-24'));assert.equal((html.match(/data-rhino-g-machine=/g)||[]).length,2);});
test('reordered native membership preserves deterministic exact-ID link order',()=>{const s=setup();[...s.models.values()].find(p=>p.handle==='automatic-feed-clamp').metafields.rhino.compatible_machines.value.reverse();const html=render(s,'automatic-feed-clamp');assert(html.indexOf('/products/sawmaster-18')<html.indexOf('/products/sawmaster-24'));});
test('approved unpublished JadeMaster emits no empty Fits module',()=>{const s=setup();assert.equal(s.report.products.find(p=>p.productGid.endsWith('/8905780003013')).compatibility.sourceApproved,true);assert.equal(render(s,'belt-guard-jademaster'),'');});
test('Saw Vice and absent fit emit no module',()=>{const s=setup();assert.equal(render(s,'saw-vice-plate-set'),'');assert.equal(render(s,'arbor-wrench'),'');});
test('source list mismatch rejects surviving subset at Liquid boundary',()=>{const s=setup(),m=[...s.models.values()].find(p=>p.handle==='automatic-feed-clamp');m.metafields.rhino.compatible_machines.value.pop();assert.equal(render(s,'automatic-feed-clamp'),'');});
test('duplicate reference fails whole list',()=>{const s=setup(),m=[...s.models.values()].find(p=>p.handle==='automatic-feed-clamp');m.metafields.rhino.compatible_machines.value.push(m.metafields.rhino.compatible_machines.value[0]);assert.equal(render(s,'automatic-feed-clamp'),'');});
test('wrong source class suppresses Liquid projection',()=>{const s=setup();[...s.models.values()].find(p=>p.handle==='automatic-feed-clamp').metafields.rhino.product_class.value='accessory';assert.equal(render(s,'automatic-feed-clamp'),'');});
test('wrong target class suppresses whole module without surviving subset',()=>{const s=setup();[...s.models.values()].find(p=>p.handle==='sawmaster-24').metafields.rhino.product_class.value='accessory';assert.equal(render(s,'automatic-feed-clamp'),'');});
test('orphaned target suppresses whole module',()=>{const s=setup(),m=[...s.models.values()].find(p=>p.handle==='automatic-feed-clamp');m.metafields.rhino.compatible_machines.value[1]=null;assert.equal(render(s,'automatic-feed-clamp'),'');});
test('missing approval generates no compatible claim',()=>{const s=setup(f=>f.authority.rows=f.authority.rows.filter(r=>!r.targetGid.endsWith('/8905779871941')));assert.equal(render(s,'automatic-feed-clamp'),'');});
test('revoked approval generates no compatible claim',()=>{const s=setup(f=>f.authority.rows.find(r=>r.targetGid.endsWith('/8905779871941')).valueState='revoked');assert.equal(render(s,'automatic-feed-clamp'),'');});
test('expired source produces no materialized eligible pages',()=>{const s=setup(f=>f.asOf=f.authority.receipt.expiresAt);assert.equal(s.release.pages.length,0);});
test('recompiling the same observation cannot extend the presentation lease',()=>{const s=setup(),later=new Date(Date.parse(s.release.validatedAt)+600000).toISOString();assert.equal(R.project(s.report,s.f.envelope,{validatedAt:later}).expiresAt,s.release.expiresAt);});
test('render-time presentation expiry rejects cached source markup',()=>{const s=setup(),prior=now;now=Date.parse(s.release.expiresAt);assert.equal(render(s,'automatic-feed-clamp'),'');now=prior;});
test('future source time is suppressed',()=>{const s=setup(),prior=now;now=Date.parse(s.release.validatedAt)-1000;assert.equal(render(s,'automatic-feed-clamp'),'');now=prior;});
test('wrong relationship type is suppressed',()=>{const s=setup();[...s.models.values()].find(p=>p.handle==='automatic-feed-clamp').metafields.rhino.compatible_machines.type='list.single_line_text_field';assert.equal(render(s,'automatic-feed-clamp'),'');});
test('changed exact source Variant membership is suppressed',()=>{const s=setup();[...s.models.values()].find(p=>p.handle==='automatic-feed-clamp').variants.push({id:999001});assert.equal(render(s,'automatic-feed-clamp'),'');});
test('changed exact target Variant membership suppresses the whole module',()=>{const s=setup();[...s.models.values()].find(p=>p.handle==='sawmaster-24').variants.push({id:999002});assert.equal(render(s,'automatic-feed-clamp'),'');});
test('target unpublication with unchanged full fit set hides only that destination',()=>{const s=setup();[...s.models.values()].find(p=>p.handle==='sawmaster-24').published_at=null;const html=render(s,'automatic-feed-clamp');assert(html.includes('/products/sawmaster-18'));assert(!html.includes('/products/sawmaster-24'));});
test('all targets unpublished omits the whole heading',()=>{const s=setup();for(const h of ['sawmaster-18','sawmaster-24'])[...s.models.values()].find(p=>p.handle===h).published_at=null;assert.equal(render(s,'automatic-feed-clamp'),'');});
test('future target publication is not a customer destination',()=>{const s=setup();[...s.models.values()].find(p=>p.handle==='em-1').published_at='2100-01-01T00:00:00Z';assert.equal(render(s,'trim-saw-6'),'');});
test('changed target handle rejects the complete module',()=>{const s=setup();[...s.models.values()].find(p=>p.handle==='sawmaster-24').handle='unapproved-alias';assert.equal(render(s,'automatic-feed-clamp'),'');});
test('unknown exact source Product identity cannot reuse a handle',()=>{const s=setup();[...s.models.values()].find(p=>p.handle==='automatic-feed-clamp').id=999003;assert.equal(render(s,'automatic-feed-clamp'),'');});
test('SKU blank suppresses row and empty label; populated values remain exact',()=>{
 const source=strip(fs.readFileSync('snippets/rhino-g-product-detail.liquid','utf8')).replace(/{%- capture g_role -%}[\s\S]*?{%- endcapture -%}/,"{%- assign g_role = 'accessory' -%}");
 for(const sku of [null,'Fixture-a&b','Fixture-Two']){const html=engine.parseAndRenderSync(source,{product:{selected_or_first_available_variant:{sku}},section:{id:'fixture'}});if(!sku){assert(/class="product__sku hidden"/.test(html));assert(!html.includes('SKU:'));assert(!html.includes('data-rhino-g-sku-value'));}else{assert(!/product__sku hidden/.test(html));assert(html.includes(sku.replace('&','&amp;')));assert(html.includes('SKU:'));}}
});
test('native fragment update lifecycle remains the sole SKU state updater',()=>{const js=fs.readFileSync('assets/product-info.js','utf8');assert(js.includes("updateSourceFromDestination('Sku', ({ classList }) => classList.contains('hidden'))"));assert(!fs.readFileSync('assets/rhino-g-fit.js','utf8').includes('Sku'));});
test('machine template, shared section and scripts match captured baseline',()=>{const b=E.read('docs/qa/evidence/epic-g/g2-2026-10-16/repository-before.json');for(const path of ['templates/product.machine.json','sections/main-product.liquid','assets/product-info.js','assets/product-form.js','snippets/product-thumbnail.liquid'])assert.equal(E.hash(fs.readFileSync(path)),b.theme.find(r=>r.path===path).sha256);});
const out={suite:'G2 projection/SKU contract units; not deployed-browser proof',passed:tests.filter(t=>t.status==='PASS').length,failed:tests.filter(t=>t.status==='FAIL').length,tests};const i=process.argv.indexOf('--output');if(i>=0)fs.writeFileSync(process.argv[i+1],JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out,null,2));if(out.failed)process.exitCode=1;
