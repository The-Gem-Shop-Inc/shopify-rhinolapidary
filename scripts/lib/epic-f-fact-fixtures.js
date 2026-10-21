'use strict';
const fs=require('node:fs');
const consumer=require('./epic-f-consumer');
const {requiredDatasets}=require('./epic-e-readiness');
const {domains}=require('./epic-e-migration-domains');
const {projectFacts,fieldPath}=require('./epic-f-facts');
const base=require('./epic-f-machine-fixtures');
const upstream=require('../../data/epic-e-batch-3b-contracts.json');
const asOf='2026-09-18T12:00:00.000Z';
let sourceContext;
function createFixture(state='populated',options={}) {
  sourceContext ||= consumer.loadContext();
  const context=structuredClone(sourceContext);context.fixtureOnly=true;
  // Simulate an explicitly customer-authorized future crate review only in this
  // isolated context. The real E registry currently denies its public audience.
  for(const d of context.registry.metafields.filter(f=>f.key.startsWith('crate_')))d.accessIntent.storefront='public_read';
  const productGid='gid://shopify/Product/8905779937477';
  const catalog=context.identity.productIdentities.filter(p=>['replacement_part','consumable','accessory'].includes(consumer.classification(context,p.productGid))).slice(0,20);
  const rows=[];
  function add(key,desired,meta={}) {
    const def=context.registry.metafields.find(f=>f.key===key&&f.namespace==='rhino');
    const domain=domains.find(d=>d.fieldAllowlist.includes(fieldPath(key))).key;
    const typed=upstream.fields.find(f=>f.key===key);
    rows.push({rowId:'fixture:'+key,kind:'metafield',targetGid:productGid,domain,field:fieldPath(key),type:def.type,desired,before:{metafieldGid:null},valueState:'approved',approvalDecisionId:'fixture:upstream-'+key,conflictIds:[],
      provenance:{sourceId:'fixture:technical-source',sourceValue:typeof desired?.value==='number'?String(desired.value):structuredClone(desired),sourceUnit:typed?.unit??null,physicalState:typed?.physicalState??null,configurationId:'fixture:configuration-a',configurationLabel:'Synthetic configuration A',conversionRuleId:null,...meta}});
  }
  if(!['zero','contents','large-contents'].includes(state)) {
    add('input_voltage',{value:17,unit:'volts'});
    if(state!=='one-key') {
      for(const [key,value,unit] of [['wheel_diameter',3.25,'inches'],['motor_speed',137,'revolutions_per_minute'],['wheel_speed_min',0,'revolutions_per_minute'],['wheel_speed_max',97,'revolutions_per_minute'],['flex_shaft_speed_min',11,'revolutions_per_minute'],['flex_shaft_speed_max',103,'revolutions_per_minute'],['blade_diameter_min',2.5,'inches'],['blade_diameter_max',4.75,'inches'],['wheel_arbor_diameter',0.375,'inches'],['blade_arbor_diameter',0.625,'inches'],['assembled_length',15.125,'inches'],['assembled_width',9.5,'inches'],['assembled_height',13.25,'inches'],['net_weight',19.25,'pounds'],['crate_length',22.5,'inches'],['crate_width',16.25,'inches'],['crate_height',20.125,'inches'],['water_reservoir_capacity',1.25,'us_gallons'],['cutting_oil_fill_min',0.75,'us_gallons'],['cutting_oil_fill_max',1.75,'us_gallons'],['motor_power',0.375,'horsepower']]) add(key,{value,unit},key==='motor_power'?{unitQualification:'mechanical'}:{});
      add('input_frequencies',[{value:47,unit:'hertz'},{value:63,unit:'hertz'}],{sourceValue:['47','63']});
      add('water_system_type','recirculating_filtered');
    }
  }
  if(['populated','contents','large-contents','long'].includes(state)) {
    const count=state==='large-contents'?12:2, included=catalog.slice(0,count).map(p=>p.productGid);
    add('included_products',included);add('included_quantities',Object.fromEntries(included.map((gid,i)=>[gid,i+1])));
    add('optional_products',[catalog[14].productGid]);add('recommended_products',[catalog[15].productGid]);
    add('noncatalog_components',[{label:'Synthetic loose component',quantity:2,meaning:'included'},{label:'Synthetic excluded component',quantity:1,meaning:'not_included'},{label:'Synthetic optional component',quantity:1,meaning:'optional'}]);
  }
  if(state==='long')for(const r of rows)r.provenance.configurationLabel='Synthetic configuration '+ 'LongUnbrokenContext'.repeat(35);
  options.mutateRows?.(rows,catalog);
  const before=consumer.read(context.plans.product_class.currentReadSnapshot.path);
  before.capturedAt=asOf;before.errors=[];
  for(const key of requiredDatasets){const records=before.datasets[key]?.records||[];before.datasets[key]={queryStatus:'success',errorCount:0,recordCount:records.length,records};}
  for(const [i,p] of catalog.entries()) {
    const target=before.datasets.products.records.find(r=>r.id===p.productGid);
    Object.assign(target,{title:'Synthetic catalog component '+(i+1)+(state==='long'?' '+ 'LongProductName'.repeat(25):''),status:'ACTIVE',publishedAt:asOf,customerVisible:true});
  }
  for(const domain of new Set(rows.map(r=>r.domain))) {
    const domainRows=rows.filter(r=>r.domain===domain);
    context.bundles[domain].rows=domainRows;
    context.before[domain]=structuredClone(before);context.after[domain]=structuredClone(before);
    for(const targetGid of new Set(domainRows.map(r=>r.targetGid))) {
      const target=context.after[domain].datasets.products.records.find(p=>p.id===targetGid);
      if(target)target.metafields={nodes:domainRows.filter(r=>r.targetGid===targetGid).map((r,i)=>({id:'gid://shopify/Metafield/'+(9000000000+i),namespace:'rhino',key:r.field.split('.').pop(),type:r.type,jsonValue:r.desired}))};
    }
    context.receiptsCurrent[domain]=true;
    context.plans[domain].executionStatus='completed';context.plans[domain].driftValidation.status='passed';
    context.plans[domain].approvals.forEach(a=>Object.assign(a,{granted:true,recordedAt:asOf,evidence:'fixture:upstream-simulation'}));
    Object.assign(context.readiness.rows.find(r=>r.consumer==='F'&&r.domain===domain),{safe_for_customer_fact_rendering:true,value_blocked:false,admin_mutation_required:false,admin_reconciliation_required:false});
  }
  consumer.simulateFixtureApprovals(context,rows);
  options.mutateContext?.(context,rows,catalog);
  return {context,productGid,rows,catalog,asOf,projection:projectFacts(context,productGid,asOf)};
}
function factDocument(state='populated',options={}) {
  const f=options.fixture||createFixture(state,options);
  if(f.context.fixtureOnly!==true)throw new Error('Fixture context required');
  const ctx=base.contextFor('tracked-available');ctx.request.host='machine.local';
  ctx.fixture_projection=f.projection;
  options.adversarial?.(ctx);
  const translations=state==='long'?{'products.product.machine_facts.fields.input_voltage':'LongSpecificationLabel'.repeat(22)}:{};
  const gate=`{% if request.host == 'machine.local' and fixture_projection.fixture_only %}{% assign fixture_gid = 'gid://shopify/Product/' | append: product.id %}{% if fixture_gid == fixture_projection.product_gid %}{% render 'rhino-machine-specifications', projection: fixture_projection %}{% render 'rhino-machine-contents', projection: fixture_projection %}{% endif %}{% endif %}`;
  const engine=base.engine(ctx,translations,options.allowFixtures===false?{}:{'rhino-product-fact-projection.liquid':gate});
  const body=engine.parseAndRenderSync(base.normalize(fs.readFileSync('sections/main-product.liquid','utf8')),ctx);
  return base.documentFor('tracked-available').replace(/<main id="MainContent">[\s\S]*?<\/main>/,`<main id="MainContent">${body}</main>`);
}
module.exports={createFixture,factDocument,asOf};
