'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {createFixture,factDocument}=require('./lib/epic-f-fact-fixtures');
const {projectFacts,formatTyped,quantityMap}=require('./lib/epic-f-facts');
const consumer=require('./lib/epic-f-consumer');
const roles=require('../data/epic-f-field-roles.json');
const validate=new (require('ajv/dist/2020'))({strict:false,allErrors:true}).compile(require('../schemas/epic-f-fact-projection.schema.json'));
const evidence=[];
function test(name,run){run();evidence.push({name,status:'passed'});console.log('PASS '+name);}
const has=(p,key)=>p.spec_groups.some(g=>g.rows.some(r=>r.source.some(s=>s.field.endsWith('.'+key))));
const count=(p,meaning)=>p.contents.find(g=>g.meaning===meaning)?.items.length||0;
test('zero surfaces disappear',()=>{const f=createFixture('zero');assert(validate(f.projection));assert(!/class="rhino-machine-facts/.test(factDocument('zero')));});
test('one key and bounded multiple keys share formatted row',()=>{assert.equal(createFixture('one-key').projection.key_specs.length,1);const f=createFixture();assert.equal(f.projection.key_specs.length,3);assert.equal(f.projection.spec_groups.length,6);for(const r of f.projection.key_specs)assert(f.projection.spec_groups.some(g=>g.rows.includes(r)));assert(validate(f.projection),JSON.stringify(validate.errors));});
test('integer decimal range zero and precision',()=>{const p=createFixture().projection;const values=p.spec_groups.flatMap(g=>g.rows.map(r=>r.display));for(const v of ['17 V','3.25 in','0–97 rpm','15.125 in'])assert(values.includes(v),v);assert(!values.includes('17.00 V'));});
test('explicit source trailing precision preserved',()=>{const p=createFixture('one-key',{mutateRows:rs=>rs[0].provenance.sourceValue='17.00'}).projection;assert.equal(p.key_specs[0].display,'17.00 V');});
const scalarNegatives={
  absent:r=>r.desired=null,
  'wrong metafield type':r=>r.type='number_decimal',
  'malformed number':r=>r.desired.value='17 volts',
  'range where scalar required':r=>r.desired={min:1,max:3,unit:'volts'},
  'ambiguous unit':r=>r.desired.unit='V?',
  'wrong physical state':r=>r.provenance.physicalState='crate_outer',
  'unsupported conversion':r=>r.provenance.conversionRuleId='unapproved-conversion',
  'conflicting source':r=>r.conflictIds=['fixture:conflict'],
  'proposed value':r=>r.valueState='proposed',
  'wrong domain':r=>r.domain='motor_speed',
  'wrong field':r=>r.field='PRODUCT.metafields.rhino.unapproved_field',
  'wrong Product GID':r=>r.targetGid='gid://shopify/Product/1',
  'unauthorized value':r=>r.approvalDecisionId=null,
  'missing configuration':r=>r.provenance.configurationId='',
  'missing source decimal':r=>delete r.provenance.sourceValue,
  'floating point artifact differs from source':r=>{r.desired.value=0.30000000000000004;r.provenance.sourceValue='0.3';},
};
for(const [name,mutate] of Object.entries(scalarNegatives))test(name,()=>{const p=createFixture('one-key',{mutateRows:rs=>mutate(rs[0])}).projection;assert(!has(p,'input_voltage'));});
for(const [name,mutate] of Object.entries({
  'missing range endpoint':rs=>rs.splice(rs.findIndex(r=>r.field.endsWith('.wheel_speed_max')),1),
  'incompatible endpoint dimension':rs=>{const r=rs.find(r=>r.field.endsWith('.wheel_speed_max'));r.type='dimension';r.desired.unit='inches';},
  'mixed endpoint units':rs=>rs.find(r=>r.field.endsWith('.wheel_speed_max')).desired.unit='revolutions_per_second',
  'different endpoint configuration':rs=>rs.find(r=>r.field.endsWith('.wheel_speed_max')).provenance.configurationId='fixture:b',
  'different endpoint source':rs=>rs.find(r=>r.field.endsWith('.wheel_speed_max')).provenance.sourceId='fixture:other',
  'reversed range':rs=>{const r=rs.find(r=>r.field.endsWith('.wheel_speed_min'));r.desired.value=500;r.provenance.sourceValue='500';},
}))test(name,()=>assert(!has(createFixture('specifications',{mutateRows:mutate}).projection,'wheel_speed_min')));
test('scalar cannot stand in for a complete range',()=>{const f=createFixture();const role=roles.fields.find(r=>r.id==='wheel_speed');assert.equal(formatTyped([f.rows.find(r=>r.field.endsWith('.wheel_speed_min'))],role),null);});
test('motor wheel flex shaft and arbor meanings stay separate',()=>{const p=createFixture().projection;for(const key of ['motor_speed','wheel_speed_min','flex_shaft_speed_min','blade_arbor_diameter','wheel_arbor_diameter','net_weight','assembled_length','crate_length'])assert(has(p,key));for(const key of roles.unsupported)assert(!has(p,key));});
test('ambiguous horsepower fails closed',()=>assert(!has(createFixture('specifications',{mutateRows:rs=>delete rs.find(r=>r.field.endsWith('.motor_power')).provenance.unitQualification}).projection,'motor_power')));
test('assembled crate net and shipping states cannot be aliased',()=>{const p=createFixture('specifications',{mutateRows:rs=>{for(const r of rs){if(r.field.endsWith('.assembled_length'))r.provenance.physicalState='crate_outer';if(r.field.endsWith('.crate_length'))r.provenance.physicalState='assembled';if(r.field.endsWith('.net_weight'))r.provenance.physicalState='shipping';}}}).projection;for(const k of ['assembled_length','crate_length','net_weight'])assert(!has(p,k));});
test('ambiguous gallon fails closed',()=>assert(!has(createFixture('specifications',{mutateRows:rs=>rs.find(r=>r.field.endsWith('.water_reservoir_capacity')).desired.unit='gal'}).projection,'water_reservoir_capacity')));
test('two technical configurations cannot become one Product value',()=>{const p=createFixture('one-key',{mutateRows:rs=>rs.push({...structuredClone(rs[0]),rowId:'fixture:second',provenance:{...rs[0].provenance,configurationId:'fixture:b'}})}).projection;assert.equal(p.key_specs.length,0);});
test('configuration preserved and long values supported',()=>{const p=createFixture('long').projection;assert(p.key_specs.every(r=>r.configuration.includes('LongUnbrokenContext')));assert(validate(p));});
for(const [name,mutate] of Object.entries({
  'stale source':c=>c.inputsCurrent=false,
  'stale reconciliation':c=>c.receiptsCurrent.electrical=false,
  'denied activation':c=>c.plans.electrical.approvals.forEach(a=>a.granted=false),
  'denied audience':c=>c.registry.metafields.find(f=>f.key==='input_voltage').accessIntent.storefront='none',
  'after state drift':c=>c.after.electrical.datasets.products.records.find(p=>p.id==='gid://shopify/Product/8905779937477').metafields.nodes[0].jsonValue={value:999,unit:'volts'},
}))test(name,()=>assert(!has(createFixture('one-key',{mutateContext:mutate}).projection,'input_voltage')));
test('expired receipt',()=>{const f=createFixture('one-key');assert(!has(projectFacts(f.context,f.productGid,'2026-10-01T00:00:00Z'),'input_voltage'));});
test('nonblank live data without source row is unauthorized',()=>{const f=createFixture('one-key');f.context.bundles.electrical.rows=[];assert(!has(projectFacts(f.context,f.productGid,f.asOf),'input_voltage'));});
test('real context stays empty; fixtures cannot publish',()=>{const f=createFixture();assert.throws(()=>consumer.buildFactProjection(f.context));f.context.fixtureOnly=false;const p=projectFacts(f.context,f.productGid,f.asOf);assert.equal(p.key_specs.length+p.spec_groups.length+p.contents.length,0);assert(validate(p));assert(!factDocument('populated',{allowFixtures:false}).includes('class="rhino-machine-facts'));});
test('included exact-GID quantities and all distinct meanings',()=>{const f=createFixture('contents');for(const [meaning,n] of [['included',2],['noncatalog',1],['not_included',1],['optional',2],['recommended',1]])assert.equal(count(f.projection,meaning),n);assert.deepEqual(f.projection.contents[0].items.map(i=>i.quantity),[1,2]);});
for(const [name,mutate] of Object.entries({
  'missing quantity join':rs=>rs.splice(rs.findIndex(r=>r.field.endsWith('.included_quantities')),1),
  'zero quantity':rs=>Object.keys(rs.find(r=>r.field.endsWith('.included_quantities')).desired).forEach(k=>rs.find(r=>r.field.endsWith('.included_quantities')).desired[k]=0),
  'negative quantity':rs=>Object.values(rs).filter(r=>r.field.endsWith('.included_quantities')).forEach(r=>r.desired[Object.keys(r.desired)[0]]=-1),
  'decimal quantity':rs=>{const r=rs.find(r=>r.field.endsWith('.included_quantities'));r.desired[Object.keys(r.desired)[0]]=1.5;},
  'duplicate quantity mapping':rs=>{const r=rs.find(r=>r.field.endsWith('.included_quantities')),k=Object.keys(r.desired)[0];r.desired=`{"${k}":1,"${k}":1}`;},
  'conflicting quantity mapping':rs=>{const r=rs.find(r=>r.field.endsWith('.included_quantities')),k=Object.keys(r.desired)[0];r.desired=`{"${k}":1,"${k}":2}`;},
  'unauthorized quantity':rs=>rs.find(r=>r.field.endsWith('.included_quantities')).approvalDecisionId=null,
  'wrong quantity target':rs=>{const r=rs.find(r=>r.field.endsWith('.included_quantities'));r.desired={'gid://shopify/Product/1':1};},
  'C-040 still blocked':rs=>rs.filter(r=>r.domain==='included_components').forEach(r=>r.conflictIds=['C-040']),
}))test(name,()=>assert.equal(count(createFixture('contents',{mutateRows:mutate}).projection,'included'),0));
test('one included Product',()=>{const f=createFixture('contents',{mutateRows:rs=>{const r=rs.find(r=>r.field.endsWith('.included_products'));r.desired=r.desired.slice(0,1);rs.find(r=>r.field.endsWith('.included_quantities')).desired={[r.desired[0]]:3};}});assert.equal(count(f.projection,'included'),1);});
test('conflicting semantic sets suppress the Product in both sets',()=>{const f=createFixture('contents',{mutateRows:rs=>rs.find(r=>r.field.endsWith('.optional_products')).desired=rs.find(r=>r.field.endsWith('.included_products')).desired.slice(0,1)});assert.equal(count(f.projection,'included'),1);assert.equal(count(f.projection,'optional'),1);});
for(const [name,mutate] of Object.entries({
  deleted:(c,gid)=>{for(const a of [...Object.values(c.after),...Object.values(c.before)]){a.datasets.products.records=a.datasets.products.records.filter(p=>p.id!==gid);a.datasets.products.recordCount=a.datasets.products.records.length;}},
  unpublished:(c,gid)=>{for(const a of [...Object.values(c.after),...Object.values(c.before)]){const p=a.datasets.products.records.find(p=>p.id===gid);if(p)p.publishedAt=null;}},
  'wrong class':(c,gid)=>{const m=c.classification.mappings.find(p=>p.productGid===gid);m.proposedProductClass='machine';},
  'unavailable audience':(c,gid)=>{for(const a of Object.values(c.after)){const p=a.datasets.products.records.find(p=>p.id===gid);if(p)p.customerVisible=false;}},
}))test(name+' reference suppressed without replacement',()=>{const f=createFixture('contents',{mutateContext:(c,rs,catalog)=>mutate(c,catalog[0].productGid)});assert(!f.projection.contents.flatMap(g=>g.items).some(i=>i.source.targetGid===f.catalog[0].productGid));assert(f.projection.suppressed.some(s=>s.targetGid===f.catalog[0].productGid));assert.equal(count(f.projection,'included'),1);});
test('noncatalog name match stays plain unlinked component',()=>{const f=createFixture('contents',{mutateRows:rs=>rs.find(r=>r.field.endsWith('.noncatalog_components')).desired=[{label:'Synthetic catalog component 1',quantity:2,meaning:'included'}]});const item=f.projection.contents.find(g=>g.meaning==='noncatalog').items[0];assert.equal(item.product,undefined);assert.equal(item.label,'Synthetic catalog component 1');});
test('stale contents are suppressed',()=>assert.equal(count(createFixture('contents',{mutateContext:c=>c.receiptsCurrent.included_components=false}).projection,'included'),0));
test('arbitrary description/tag/title/media/manual/Custom Liquid cannot populate modules',()=>{
  for(const field of ['description','tags','title','media','captions','manual','resources','custom_liquid']) {
    const html=factDocument('zero',{adversarial:c=>{c.product[field]=field==='media'?[{id:77,alt:'UNAPPROVED_FACT',caption:'UNAPPROVED_FACT'}]:'UNAPPROVED_FACT 17 V included tools';}});
    assert(!html.includes('class="rhino-machine-facts'),field);
  }
});
test('structured data has no specification or BOM additions',()=>{const html=factDocument('populated');const scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];assert(scripts.length);for(const [,s]of scripts)assert(!/additionalProperty|hasPart|Synthetic|17 V|included_products/.test(s));});
test('quantity map rejects orphan keys without inferred defaults',()=>assert.equal(quantityMap({'gid://shopify/Product/1':2},[]),null));
test('escaped duplicate quantity aliases fail closed',()=>assert.equal(quantityMap(String.raw`{"gid://shopify/Product/1":1,"gid://shopify/Product/\u0031":2}`,['gid://shopify/Product/1']),null));
test('malformed noncatalog entry suppresses safely',()=>{const f=createFixture('contents',{mutateRows:rs=>rs.find(r=>r.field.endsWith('.noncatalog_components')).desired=[{label:'Synthetic plain line',quantity:2,meaning:'included'},null]});assert(!f.projection.contents.flatMap(g=>g.items).some(i=>!i.product&&!i.label));});
test('unknown catalog GID does not resolve by name or handle',()=>{const f=createFixture('contents',{mutateRows:rs=>{rs.find(r=>r.field.endsWith('.included_products')).desired=['gid://shopify/Product/1'];rs.find(r=>r.field.endsWith('.included_quantities')).desired={'gid://shopify/Product/1':2};}});assert.equal(count(f.projection,'included'),0);assert(f.projection.suppressed.some(s=>s.targetGid==='gid://shopify/Product/1'));});
test('default native card preserves price and heading; contents card is contextual',()=>{
  const base=require('./lib/epic-f-machine-fixtures'),ctx=base.contextFor('tracked-available');ctx.card={...createFixture('contents').projection.contents[0].items[0].product,price:2500,available:true};const e=base.engine(ctx);
  const ordinary=e.parseAndRenderSync("{% render 'card-product', card_product: card, skip_styles: true, section_id: 'ordinary', quick_add: 'none' %}",ctx);
  const contents=e.parseAndRenderSync("{% render 'card-product', card_product: card, skip_styles: true, section_id: 'contents', quick_add: 'none', rhino_contents_context: true %}",ctx);
  assert(ordinary.includes('<h3'));assert(ordinary.includes('$25.00'));assert(contents.includes('<h4'));assert(!contents.includes('$25.00'));
});
test('forged customer projection rejected by schema',()=>{const p=createFixture().projection;p.fixture_only=false;assert(!validate(p));});
fs.mkdirSync('test-results/epic-f/f4',{recursive:true});fs.writeFileSync('test-results/epic-f/f4/contract-tests.json',JSON.stringify({fixtureOnly:true,checks:evidence},null,2)+'\n');
console.log(`${evidence.length} specification/contents contract tests passed.`);
