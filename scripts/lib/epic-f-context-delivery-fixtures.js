'use strict';
const fs=require('node:fs');
const consumer=require('./epic-f-consumer'),base=require('./epic-f-machine-fixtures');
const {createFixture}=require('./epic-f-fact-fixtures');
const {projectContextDelivery}=require('./epic-f-context-delivery');
const asOf='2026-09-18T12:00:00.000Z',expiresAt='2026-09-18T13:00:00.000Z';
const machine='gid://shopify/Product/8905779937477';
let classificationContext;
const scope=()=>({kind:'PRODUCT',variantGid:null,configurationId:null,label:'Product scope'});
const authority=id=>({approvalDecisionId:'fixture:'+id,state:'approved',audience:'customer',lifecycle:'current',activation:'fixture-only',sourceIds:['fixture:review-source'],effectiveAt:asOf,expiresAt,conflictIds:[]});
function contextualFixture(state='combined',options={}){
  classificationContext ||= consumer.loadContext();
  const packet={schemaVersion:1,machineProductGid:machine,edges:[],operations:[],policy:null};
  let f=createFixture(options.contents?'contents':'zero',{mutateRows:(rows,catalog)=>{
    if(!['zero','delivery','policy'].includes(state)){
      const targets=[catalog.find(p=>consumer.classification(classificationContext,p.productGid)==='accessory'),catalog.find(p=>consumer.classification(classificationContext,p.productGid)==='consumable'),...catalog.slice(6,20)].filter((p,i,a)=>p&&a.findIndex(x=>x?.productGid===p.productGid)===i);
      const total=state==='large'?12:state==='small'?1:3;
      for(const [i,p] of targets.slice(0,total).entries()){
        const meaning=i===0?'contextual_accessory':i===1?'contextual_consumable':'compatible',id='relationship-'+i;
        const edge={...authority(id),edgeId:'fixture:'+id,dependentProductGid:p.productGid,targetMachineProductGid:machine,meaning,scope:scope(),sourceRowId:meaning==='compatible'?'fixture:row-'+i:null};
        packet.edges.push(edge);
        if(meaning==='compatible')rows.push({rowId:edge.sourceRowId,kind:'metafield',targetGid:p.productGid,domain:'compatibility',field:'PRODUCT.metafields.rhino.compatible_machines',type:'list.product_reference',desired:[machine],before:{metafieldGid:null},valueState:'approved',approvalDecisionId:edge.approvalDecisionId,conflictIds:[]});
      }
    }
    options.mutateRows?.(rows,catalog);
  }});
  const c=f.context,input=structuredClone(require('../../data/epic-e-batch-3c-owner-decisions.json'));
  const approve=(decisionId,kind,subjectId,ownerRoles)=>input.approvals.push({decisionId,kind,subjectId,decisionState:'approved',sourceIds:['fixture:review-source'],approvedAt:asOf,ownerRoles});
  if(['delivery','combined','long'].includes(state)){
    const region={ruleId:'fixture:region',productGid:machine,kind:'commercial',permission:'allowed',countryCode:'DE',subdivision:null,evidenceBasis:'explicit_regional_rule',expiresAt:null,approvalDecisionId:'fixture:region'};
    input.regionRules.push(region);approve('fixture:region','region',region.ruleId,['Operations','Product Owner']);
    packet.operations.push({...authority('region'),recordId:'fixture:region',productGid:machine,kind:'region',scope:scope(),value:region});
    const source={sourceId:'fixture:timing-source',owner:'Operations',process:'Synthetic hourly review',consumer:'F',maxAgeSeconds:3600,updateSlaSeconds:1800,approvalDecisionId:'fixture:timing-source'};
    input.leadTimeSources.push(source);approve(source.approvalDecisionId,'lead_time_source',source.sourceId,['Operations','Product Owner']);
    const timing={projectionId:'fixture:timing',sourceId:source.sourceId,owner:'Operations',productGid:machine,scope:'PRODUCT',sourceUpdatedAt:asOf,expiresAt,fallback:'unknown_no_timing_promise',minDays:13,maxDays:17,timeBasis:'business_days',event:'dispatch',approvalDecisionId:'fixture:timing'};
    input.leadTimeProjections.push(timing);approve(timing.approvalDecisionId,'lead_time_projection',timing.projectionId,['Operations']);
    packet.operations.push({...authority('timing'),recordId:'fixture:timing',productGid:machine,kind:'timing',scope:scope(),value:timing});
  }
  if(['policy','delivery','combined','long'].includes(state))packet.policy={requestedRoute:'/policies/shipping-policy',resolvedRoute:'/policies/shipping-policy',status:200,identity:'shipping-policy',observedAt:asOf,expiresAt,environment:'local-fixture'};
  const snapshot=consumer.read(c.plans.product_class.currentReadSnapshot.path);
  c.projectionProducts=f.catalog.map((p,i)=>({id:p.productGid,handle:p.handle,title:'Synthetic contextual item '+i+(state==='long'?' '+ 'LongProductName'.repeat(35):''),status:'ACTIVE',publishedAt:asOf,customerVisible:true,lifecycle:'current',observedAt:asOf,expiresAt}));
  c.operationalInput=input;c.operationalContext={products:snapshot.datasets.products.records,variants:snapshot.datasets.variants.records,variantArchitecture:require('../../data/epic-e-variant-architecture.json'),resources:require('../../data/epic-e-resource-catalog.json'),evidenceIds:new Set(['fixture:review-source']),supportedCountries:['DE'],supportedSubdivisions:[]};
  const page={configurationId:'fixture:configuration-a'};
  if(state==='long')for(const r of [...packet.edges,...packet.operations])r.scope.label='Synthetic approved scope '+ 'LongUnbrokenScope'.repeat(45);
  options.mutate?.({packet,context:c,page,rows:f.rows,catalog:f.catalog});
  consumer.simulateFixtureApprovals(c,[...f.rows,...packet.edges,...packet.operations]);
  options.afterApproval?.({packet,context:c,page});
  return {...f,packet,page,asOf,projection:projectContextDelivery(c,packet,page,options.asOf||asOf)};
}
function contextDocument(state='combined',options={}){
  const f=options.fixture||contextualFixture(state,options),ctx=base.contextFor('tracked-available');ctx.request.host='machine.local';ctx.fixture_context_delivery=f.projection;
  if(options.pickup&&!['empty','null'].includes(options.pickup))ctx.product.selected_or_first_available_variant.store_availabilities=[{pick_up_enabled:true,available:options.pickup==='available'}];
  options.adversarial?.(ctx);
  const gate=`{% if request.host == 'machine.local' and fixture_context_delivery.fixture_only %}{% assign fixture_gid = 'gid://shopify/Product/' | append: product.id %}{% if fixture_gid == fixture_context_delivery.product_gid %}{% render 'rhino-machine-contextual', projection: fixture_context_delivery %}{% render 'rhino-machine-delivery', projection: fixture_context_delivery %}{% endif %}{% endif %}`;
  const engine=base.engine(ctx,{},options.allowFixtures===false?{}:{'rhino-product-context-delivery-projection.liquid':gate});
  const body=engine.parseAndRenderSync(base.normalize(fs.readFileSync('sections/main-product.liquid','utf8')),ctx);
  return base.documentFor('tracked-available').replace(/<main id="MainContent">[\s\S]*?<\/main>/,`<main id="MainContent">${body}</main>`);
}
function pickupResponse(state){
  if(['empty','null'].includes(state))return '<div class="shopify-section"></div>';
  const ctx=base.contextFor('tracked-available');ctx.product_variant={...ctx.product.selected_or_first_available_variant,product:ctx.product,store_availabilities:[{pick_up_enabled:true,available:state==='available',pick_up_time:'',location:{name:'Synthetic pickup location',address:{address1:'Fixture address',city:'Fixture city',country:'Germany'},phone:''}}]};
  const engine=base.engine(ctx);engine.registerFilter('format_address',()=>'<p>Fixture address</p>');
  return '<div class="shopify-section">'+engine.parseAndRenderSync(base.normalize(fs.readFileSync('sections/pickup-availability.liquid','utf8')),ctx)+'</div>';
}
module.exports={contextualFixture,contextDocument,pickupResponse,asOf};
