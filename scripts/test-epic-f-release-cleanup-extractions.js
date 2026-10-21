'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const { binding, bindingPath, verifyExtraction, historicalHashMatches, approvedNewSnippet }=require('./lib/epic-f-release-cleanup-binding');
const { engine, normalize, contextFor }=require('./lib/epic-f-machine-fixtures');
const clean=s=>s.replace(/\s+/g,' ').trim();
function makeEngine(ctx){const e=engine(ctx),locale=JSON.parse(fs.readFileSync('locales/en.default.json'));
 e.registerFilter('t',(key,...args)=>{let value=key.split('.').reduce((v,k)=>v?.[k],locale)||key;const named=Object.fromEntries(args.filter(Array.isArray));if(typeof value==='object')value=value[Number(named.count)===1?'one':'other'];for(const [k,v]of Object.entries(named))value=value.replaceAll(new RegExp('{{\\s*'+k+'\\s*}}','g'),String(v));return value;});return e;
}
let comparisons=0;
function compare(row,ctx){
 const original=verifyExtraction(row), e=makeEngine(ctx);
 const before=e.parseAndRenderSync(normalize(original),ctx),after=e.parseAndRenderSync(normalize(fs.readFileSync(row.path,'utf8')),ctx);
 if(clean(after)!==clean(before)){
  const a=clean(after),b=clean(before);let i=0;while(a[i]===b[i]&&i<Math.min(a.length,b.length))i++;
  throw new Error(row.path+' output changed at '+i+': '+JSON.stringify({before:b.slice(i-70,i+120),after:a.slice(i-70,i+120)}));
 }comparisons++;
 return after;
}
const b=binding();assert.equal(b.extractions.length,3);
for(const row of b.extractions){
 assert.throws(()=>verifyExtraction({...row,replacement:row.replacement+'{{ product.description }}'}),/contract changed/);
 assert.throws(()=>verifyExtraction({...row,prefix:row.prefix+'{{ product.description }}'}),/comment only/);
 assert.throws(()=>verifyExtraction(row,p=>fs.readFileSync(p,'utf8')+(p===row.snippet?'<!-- unexpected -->':'')),/drift/);
 assert.throws(()=>verifyExtraction(row,p=>fs.readFileSync(p,'utf8')+(p===row.path?'\nchanged':'')),/drift/);
 delete process.env.RHINO_EPIC_F_CLEANUP_BINDING;assert.equal(historicalHashMatches(row.path,row.oldSha256),false);
 process.env.RHINO_EPIC_F_CLEANUP_BINDING=bindingPath;assert.equal(historicalHashMatches(row.path,row.oldSha256),true);
 assert.equal(historicalHashMatches(row.path,'0'.repeat(64)),false);assert.equal(approvedNewSnippet(row.snippet),true);
}
assert.equal(approvedNewSnippet('snippets/not-reviewed.liquid'),false);
const main=b.extractions.find(r=>r.path==='sections/main-product.liquid');
for(const management of ['shopify',null])for(const stock of [0,1,100])for(const policy of ['deny','continue'])for(const show of [false,true]){
 const ctx=contextFor('tracked-available');ctx.product.selected_or_first_available_variant.inventory_management=management;ctx.product.selected_or_first_available_variant.inventory_quantity=stock;ctx.product.selected_or_first_available_variant.inventory_policy=policy;
 ctx.section.blocks.push({id:'inventory',type:'inventory',settings:{text_style:'subtitle',inventory_threshold:10,show_inventory_quantity:show},shopify_attributes:'data-block="inventory"'});
 compare(main,ctx);
}
const card=b.extractions.find(r=>r.path==='snippets/card-product.liquid');
for(const placeholder of [true,false])for(const aspect of ['square','portrait'])for(const vendor of [true,false])for(const quick of ['none','standard','bulk']){
 const ctx=contextFor('tracked-available');const p={...ctx.product,featured_media:{src:'/fixture-image.jpg',width:600,height:600,aspect_ratio:1,alt:'Fixture'},variants_count:1,compare_at_price:300000};
 Object.assign(ctx,{card_product:placeholder?null:p,section_id:'fixture-card',media_aspect_ratio:aspect,image_shape:'default',show_vendor:vendor,extend_height:true,placeholder_image:'product-apparel-2',quick_add:quick,show_rating:true,show_secondary_image:true});
 compare(card,ctx);
}
const facet=b.extractions.find(r=>r.path==='snippets/facets.liquid');
function facetContext({type='vertical',filtering=true,sorting=true,search=false,presentation='text',priceState=0}={}){
 const ctx=contextFor('tracked-available');
 const productType={label:'Product Type',type:'list',presentation,param_name:'filter.p.product_type',operator:'OR',url_to_remove:'?sort_by=created-descending',active_values:[{label:'Machine',url_to_remove:'?sort_by=created-descending'}],values:[{label:'Machine',value:'Machine',count:2,active:true,param_name:'filter.p.product_type'},{label:'Accessory',value:'Accessory',count:1,active:false,param_name:'filter.p.product_type'}]};
 const price={label:'Price',type:'price_range',param_name:'filter.v.price',url_to_remove:'?sort_by=created-descending',active_values:[],min_value:{value:priceState?10000:null,param_name:'filter.v.price.gte'},max_value:{value:priceState===2?30000:null,param_name:'filter.v.price.lte'},range_max:60000};
 Object.assign(ctx,{results:{id:'fixture-collection',handle:'all',url:search?null:'/collections/all',terms:search?'Fixture search':null,results_count:search?2:null,products_count:2,all_products_count:3,filters:[productType,price],sort_by:'created-descending',default_sort_by:'manual',sort_options:[{name:'Featured',value:'manual'},{name:'Recently Added',value:'created-descending'}]},enable_filtering:filtering,enable_sorting:sorting,filter_type:type,paginate:{pages:1},template:{name:search?'search':'collection'}});
 return ctx;
}
for(const type of ['vertical','horizontal','drawer'])for(const filtering of [true,false])for(const sorting of [true,false])for(const search of [true,false])for(const presentation of ['text','image','swatch'])for(const priceState of [0,1,2])compare(facet,facetContext({type,filtering,sorting,search,presentation,priceState}));
const folder='test-results/epic-f/release-gate-cleanup';fs.mkdirSync(folder,{recursive:true});
for(const type of ['vertical','horizontal','drawer']){const ctx=facetContext({type}),html=makeEngine(ctx).parseAndRenderSync(normalize(fs.readFileSync(facet.path,'utf8')),ctx);fs.writeFileSync(folder+'/facets-'+type+'.html',html);}
console.log(JSON.stringify({passed:true,renderedComparisons:comparisons,inventoryCases:24,cardCases:24,facetsCases:216,negativeDriftChecks:12,historicalManifestsRewritten:false}));
