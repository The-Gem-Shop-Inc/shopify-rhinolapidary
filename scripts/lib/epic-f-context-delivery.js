'use strict';
const {classification,evaluate,evaluateProjectionRecord}=require('./epic-f-consumer');
const {projectFacts,safeText}=require('./epic-f-facts');
const {validateOwnerInputs,resolveLeadTime}=require('./epic-e-batch-3c');
const validatePacket=new (require('ajv/dist/2020'))({strict:false,allErrors:true}).compile(require('../../schemas/epic-f-context-delivery.schema.json'));
const validateOperational=new (require('ajv/dist/2020'))({strict:false,allErrors:true}).compile(require('../../schemas/epic-e-batch-3c-owner-decisions.schema.json'));
const validateProjection=new (require('ajv/dist/2020'))({strict:false,allErrors:true}).compile(require('../../schemas/epic-f-context-delivery-projection.schema.json'));
const classes=['accessory','consumable','replacement_part'];
function contentsGids(contents){return new Set(contents.flatMap(g=>g.items.map(i=>i.source?.targetGid).filter(Boolean)));}
function scopeText(context,scope,ownerGid,page){
  if(!safeText(scope.label))return null;
  if(scope.kind==='PRODUCT')return !scope.variantGid&&!scope.configurationId?scope.label:null;
  if(scope.kind==='PRODUCTVARIANT')return !scope.configurationId&&context.identity.variantIdentities.some(v=>v.variantGid===scope.variantGid&&v.productGid===ownerGid)?'Dependent variant: '+scope.label:null;
  if(scope.kind==='CONFIGURATION')return !scope.variantGid&&scope.configurationId&&scope.configurationId===page.configurationId?'Configuration: '+scope.label:null;
  return null;
}
function policyRoute(policy,asOf,fixtureOnly){
  return policy&&policy.requestedRoute==='/policies/shipping-policy'&&policy.resolvedRoute===policy.requestedRoute&&policy.status===200&&policy.identity==='shipping-policy'&&
    policy.environment===(fixtureOnly?'local-fixture':'production')&&Date.parse(policy.observedAt)<=Date.parse(asOf)&&Date.parse(asOf)<Date.parse(policy.expiresAt)?policy.requestedRoute:null;
}
// Bounded reverse view over supplied governed edges, never a catalog discovery query.
// Original dependent -> machine identities and provenance remain on every card.
function reverseProjection(context,packet,page,facts,asOf){
  if(!validatePacket(packet)||classification(context,packet.machineProductGid)!=='machine'||!context.fixtureOnly)return {cards:[],suppressed:[{reason:'invalid_reverse_projection_input_or_runtime_adapter'}]};
  const cards=[],suppressed=[],seen=contentsGids(facts.contents);
  const reject=(edge,reason)=>suppressed.push({edgeId:edge.edgeId,targetGid:edge.dependentProductGid,reason});
  for(const edge of packet.edges){
    if(packet.edges.filter(e=>e.edgeId===edge.edgeId||e.dependentProductGid===edge.dependentProductGid).length!==1){reject(edge,'duplicate_edge_or_target');continue;}
    if(edge.targetMachineProductGid!==packet.machineProductGid||edge.dependentProductGid===packet.machineProductGid){reject(edge,'wrong_target_or_self');continue;}
    if(seen.has(edge.dependentProductGid)){reject(edge,'contents_precedence');continue;}
    const targetClass=classification(context,edge.dependentProductGid);
    if(!classes.includes(targetClass)||(edge.meaning==='contextual_accessory'&&targetClass!=='accessory')||(edge.meaning==='contextual_consumable'&&targetClass!=='consumable')){reject(edge,'wrong_class');continue;}
    if(!evaluateProjectionRecord(context,edge,asOf)){reject(edge,'edge_ineligible');continue;}
    if(edge.meaning==='compatible'){
      const q={productGid:edge.dependentProductGid,domain:'compatibility',field:'PRODUCT.metafields.rhino.compatible_machines'};
      const rows=context.bundles.compatibility.rows.filter(r=>r.rowId===edge.sourceRowId&&r.targetGid===q.productGid&&r.field===q.field);
      if(!evaluate(context,q,asOf).eligible||rows.length!==1||rows[0].approvalDecisionId!==edge.approvalDecisionId||!Array.isArray(rows[0].desired)||!rows[0].desired.includes(packet.machineProductGid)){reject(edge,'missing_positive_dependent_edge');continue;}
    }else if(edge.sourceRowId!==null){reject(edge,'context_is_not_compatibility');continue;}
    const scope=scopeText(context,edge.scope,edge.dependentProductGid,page);
    if(!scope){reject(edge,'scope_not_expressible');continue;}
    const identity=context.identity.productIdentities.find(p=>p.productGid===edge.dependentProductGid);
    const targets=context.projectionProducts?.filter(p=>p.id===edge.dependentProductGid)||[],target=targets[0];
    if(targets.length!==1||!identity||target.handle!==identity.handle||target.status!=='ACTIVE'||!target.publishedAt||target.customerVisible!==true||target.lifecycle!=='current'||Date.parse(target.observedAt)>Date.parse(asOf)||!(Date.parse(asOf)<Date.parse(target.expiresAt))||!safeText(target.title)||/compatible|fits?\b/i.test(target.title)){reject(edge,'orphan_or_invisible_target');continue;}
    cards.push({product:{id:edge.dependentProductGid.split('/').pop(),title:target.title,url:'/products/'+identity.handle,featured_media:null},meaning:edge.meaning,scope,source:structuredClone(edge)});
  }
  return {cards,suppressed};
}
function projectContextDelivery(context,packet,page={},asOf=new Date().toISOString()){
  const out={fixture_only:context.fixtureOnly===true,product_gid:packet?.machineProductGid,contextual:[],delivery:[],policy:null,suppressed:[]};
  if(!validatePacket(packet)){out.suppressed.push({reason:'invalid_packet',errors:structuredClone(validatePacket.errors)});return out;}
  if(classification(context,packet.machineProductGid)!=='machine'||!context.fixtureOnly){out.suppressed.push({reason:'no_approved_runtime_adapter'});return out;}
  const facts=projectFacts(context,packet.machineProductGid,asOf);
  const reverse=reverseProjection(context,packet,page,facts,asOf);out.contextual=reverse.cards;out.suppressed.push(...reverse.suppressed);
  const input=context.operationalInput,ec=context.operationalContext;
  let operationalErrors=['no_operational_authority'];
  try{if(input&&ec&&validateOperational(input))operationalErrors=validateOwnerInputs(input,ec,asOf);}catch{operationalErrors=['malformed_operational_authority'];}
  for(const record of packet.operations){
    const reject=reason=>out.suppressed.push({recordId:record.recordId,reason});
    if(packet.operations.filter(r=>r.kind===record.kind).length!==1){reject('conflicting_operational_records');continue;}
    if(record.productGid!==packet.machineProductGid||!evaluateProjectionRecord(context,record,asOf)||operationalErrors.length){reject('operational_ineligible');continue;}
    const scope=scopeText(context,record.scope,record.productGid,page);
    // Variant timing cannot leak across native selection changes. No new controller.
    if(!scope||record.scope.kind!=='PRODUCT'){reject('operational_scope_not_expressible');continue;}
    const value=record.value;let display=null;
    if(record.kind==='region'){
      const source=input.regionRules.filter(r=>r.ruleId===value.ruleId&&r.productGid===record.productGid&&r.approvalDecisionId===record.approvalDecisionId);
      if(source.length===1&&JSON.stringify(source[0])===JSON.stringify(value))display={country:value.countryCode,subdivision:value.subdivision,permission:value.permission,kind:value.kind};
    }
    if(record.kind==='timing'){
      const sources=input.leadTimeSources.filter(s=>s.sourceId===value.sourceId), values=input.leadTimeProjections.filter(p=>p.projectionId===value.projectionId);
      if(sources.length===1&&values.length===1&&JSON.stringify(values[0])===JSON.stringify(value)&&value.productGid===record.productGid&&value.approvalDecisionId===record.approvalDecisionId&&value.scope==='PRODUCT'){
        const timing=resolveLeadTime(value,sources[0],input,ec,asOf);
        if(timing.state==='current')display={min:value.minDays,max:value.maxDays,unit:value.timeBasis,event:value.event};
      }
    }
    // Handling and pickup permission have no approved customer adapter. Native
    // pickup remains independently authoritative; crate facts stay in F4.
    if(display)out.delivery.push({kind:record.kind,value:display,scope,source:structuredClone(record)});else reject('unsupported_or_invalid_operational_value');
  }
  out.policy=policyRoute(packet.policy,asOf,context.fixtureOnly);
  if(packet.policy&&!out.policy)out.suppressed.push({reason:'invalid_policy_route'});
  if(!validateProjection(out))throw new Error('Invalid F5 projection: '+JSON.stringify(validateProjection.errors));
  return out;
}
module.exports={projectContextDelivery,reverseProjection,contentsGids,scopeText,policyRoute,validatePacket};
