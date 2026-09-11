const crypto=require('crypto');
const {contracts,isBatch3cDefinition}=require('./epic-e-batch-3c-contract');
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const stamp=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(value)&&Number.isFinite(Date.parse(value));
const approval=(input,id,kind,subject,roles)=>input.approvals.some(a=>a.decisionId===id&&a.kind===kind&&a.subjectId===subject&&a.decisionState==='approved'&&a.sourceIds?.length&&a.approvedAt&&roles.every(r=>a.ownerRoles?.includes(r)));
function freshness(snapshot,asOf){
  if(!stamp(snapshot.capturedAt))return {capturedAt:snapshot.capturedAt||null,asOf,expiresAt:null,state:'invalid'};
  const expiry=new Date(Date.parse(snapshot.capturedAt)+7*86400000).toISOString();
  return {capturedAt:snapshot.capturedAt,asOf,expiresAt:expiry,state:!stamp(asOf)||Date.parse(asOf)<Date.parse(snapshot.capturedAt)?'invalid':Date.parse(asOf)>Date.parse(expiry)?'stale':'within_seven_day_window'};
}
function reconcileFulfillment(snapshot,base,input,asOf){
  const age=freshness(snapshot,asOf),vd=snapshot.datasets.variantFulfillment,cd=snapshot.datasets.deliveryConfiguration;
  const membershipComplete=vd?.queryStatus==='success'&&vd.errorCount===0&&new Set(vd.records.map(r=>r.id)).size===vd.records.length;
  const configurationComplete=cd?.queryStatus==='success'&&cd.errorCount===0&&new Set(cd.records.map(r=>r.id)).size===cd.records.length;
  const variants=base.datasets.variants.records;
  const profiles=configurationComplete?cd.records:base.datasets.deliveryProfiles.records;
  const globalProfiles=profiles.filter(p=>p.coversAllItems===true);
  const rows=variants.map(v=>{
    const live=membershipComplete?vd.records.find(r=>r.id===v.id):null;
    const assignment=input.fulfillmentAssignments.find(a=>a.variantGid===v.id)||input.fulfillmentAssignments.find(a=>a.productGid===v.product.id&&!a.variantGid);
    const decisionApproved=assignment&&approval(input,assignment.approvalDecisionId,'fulfillment',assignment.assignmentId,['Operations','Product Owner']);
    const profile=profiles.find(p=>p.id===live?.deliveryProfile?.id);
    const reasons=[];
    let state='unassessed';
    if(age.state!=='within_seven_day_window'){state='stale';reasons.push('Audit is stale or invalid; do not certify current enforcement.');}
    else if(!membershipComplete){reasons.push('Variant-to-profile identity was not audited; aggregate counts cannot establish membership.');}
    else if(!live){state='missing_profile';reasons.push('Current Variant is absent from the complete operational audit.');}
    else if(live.inventoryItem?.requiresShipping&&!live.deliveryProfile){state='missing_profile';reasons.push('Shippable Variant has no observed profile.');}
    else if(!decisionApproved){reasons.push('No approved Product handling/profile expectation.');}
    else if(!configurationComplete){reasons.push('Profile zones, locations, conditions and methods are not completely audited.');}
    else if(!profile){state='missing_profile';reasons.push('Observed profile identity is absent from configuration audit.');}
    else if(!assignment.expectedProfileGids.includes(profile.id)){state='contradiction';reasons.push('Exact native profile differs from approved Product expectation.');}
    else {
      const capability=input.profileCapabilities.find(c=>c.profileGid===profile.id&&approval(input,c.approvalDecisionId,'profile_capability',c.profileGid,['Operations','Admin/Engineering']));
      if(globalProfiles.length)reasons.push('coversAllItems profile requires explicit checkout enforcement review; assigned profile alone cannot certify handling.');
      else if(!capability||capability.configurationSha256!==digest(profile))reasons.push('No approved profile capability mapping matching the current configuration hash.');
      else if(!capability.allowedHandlingClasses.includes(assignment.fulfillmentClass)){state='contradiction';reasons.push('Approved handling requirement is unsupported by this native profile configuration.');}
      else {state='aligned';reasons.push('Approved handling and exact profile binding agree; actual checkout rates and destination eligibility remain native.');}
    }
    return {variantGid:v.id,productGid:v.product.id,requiresShipping:v.inventoryItem.requiresShipping,observedProfileGid:live?.deliveryProfile?.id||null,expectedProfileGids:decisionApproved?assignment.expectedProfileGids:[],fulfillmentClass:decisionApproved?assignment.fulfillmentClass:null,state,reasons};
  });
  const known=new Set(variants.map(v=>v.id));
  return {freshness:age,membershipComplete,configurationComplete,rows,unexpectedVariantGids:membershipComplete?vd.records.filter(v=>!known.has(v.id)).map(v=>v.id):[],profileObservations:profiles,globalOverrideProfileGids:globalProfiles.map(p=>p.id),statistics:Object.fromEntries(contracts.fulfillment.driftStates.map(s=>[s,rows.filter(r=>r.state===s).length]))};
}
function leadTimeErrors(value,source,input,context){
  const e=[];
  if(!source||!approval(input,source.approvalDecisionId,'lead_time_source',source.sourceId,['Operations','Product Owner']))e.push('lead time requires approved source owner/process');
  if(!source?.owner||!source?.process||!source?.consumer||!Number.isInteger(source?.maxAgeSeconds)||source.maxAgeSeconds<=0||!Number.isInteger(source?.updateSlaSeconds)||source.updateSlaSeconds<=0||source.updateSlaSeconds>source.maxAgeSeconds)e.push('lead time source requires maintainable process, freshness and update SLA');
  if(!stamp(value.sourceUpdatedAt)||!stamp(value.expiresAt)||Date.parse(value.expiresAt)<=Date.parse(value.sourceUpdatedAt)||Date.parse(value.expiresAt)>Date.parse(value.sourceUpdatedAt)+(source?.maxAgeSeconds||0)*1000)e.push('lead time requires valid timestamp and bounded expiry');
  if(value.fallback!=='unknown_no_timing_promise')e.push('stale lead time requires safe unknown fallback');
  if(!Number.isInteger(value.minDays)||value.minDays<0||!Number.isInteger(value.maxDays)||value.maxDays<value.minDays||!['calendar_days','business_days'].includes(value.timeBasis)||!['dispatch','delivery'].includes(value.event))e.push('lead time range/event/unit invalid');
  if(value.owner!==source?.owner||!approval(input,value.approvalDecisionId,'lead_time_projection',value.projectionId,['Operations']))e.push('lead time projection owner approval missing');
  if(!context.products.some(p=>p.id===value.productGid))e.push('lead time Product identity invalid');
  if(!['PRODUCT','PRODUCTVARIANT'].includes(value.scope))e.push('timing scope invalid');
  if(value.scope==='PRODUCTVARIANT'){
    const v=context.variants.find(v=>v.id===value.variantGid&&v.product.id===value.productGid);
    if(!v||!context.variantArchitecture.currentOptionAudit.some(a=>a.productGid===value.productGid)||!value.fulfillmentEvidenceIds?.length||!approval(input,value.commerceDecisionId,'variant_timing',value.variantGid,['Operations','Product Owner']))e.push('Variant timing requires proven commerce distinction and independent fulfillment evidence');
  }else if(value.variantGid)e.push('Product timing cannot conceal a Variant override');
  return e;
}
function resolveLeadTime(value,source,input,context,now){
  if(!value)return {state:'unknown',timing:null,reason:'no_authoritative_timing'};
  const errors=leadTimeErrors(value,source,input,context);
  if(!stamp(now)||Date.parse(now)<Date.parse(value.sourceUpdatedAt))errors.push('invalid/future source timestamp');
  if(errors.length)return {state:'unknown',timing:null,reason:'invalid_projection',errors};
  if(Date.parse(now)>=Date.parse(value.expiresAt))return {state:'unknown',timing:null,reason:'stale_projection'};
  return {state:'current',timing:{minDays:value.minDays,maxDays:value.maxDays,timeBasis:value.timeBasis,event:value.event},reason:'approved_fresh_operational_evidence'};
}
function resolveAvailability(product,variant,asOf,capturedAt){
  if(freshness({capturedAt},asOf).state!=='within_seven_day_window')return 'unknown';
  if(product.status!=='ACTIVE'||!product.publishedAt)return 'not_published';
  if(typeof variant?.availableForSale!=='boolean')return 'unknown';
  return variant.availableForSale?'available_for_sale':'unavailable_for_sale';
}
function validateOwnerInputs(input,context,asOf){
  const errors=[],check=(ok,message)=>{if(!ok)errors.push(message);};
  const productSet=new Set(context.products.map(p=>p.id));
  const variants=new Map(context.variants.map(v=>[v.id,v]));
  const resources=new Map(context.resources.resources.map(r=>[r.resourceId,r]));
  const approved=(id,kind,subject,roles)=>approval(input,id,kind,subject,roles);
  for(const [key,id]of Object.entries({approvals:'decisionId',fulfillmentAssignments:'assignmentId',profileCapabilities:'profileGid',pickupRules:'productGid',policyVersions:'policyId',warrantyClasses:'classId',warrantyMappings:'productGid',leadTimeSources:'sourceId',leadTimeProjections:'projectionId'}))check(new Set(input[key].map(x=>x[id])).size===input[key].length,`duplicate ${key} identity`);
  for(const key of ['fulfillmentAssignments','leadTimeProjections'])check(new Set(input[key].map(x=>x.variantGid||x.productGid)).size===input[key].length,`ambiguous ${key} scope`);
  for(const a of input.approvals)check(a.sourceIds.every(id=>context.evidenceIds.has(id))&&stamp(a.approvedAt)&&Date.parse(a.approvedAt)<=Date.parse(asOf),'approval source or timestamp invalid');
  for(const a of input.fulfillmentAssignments){
    check(productSet.has(a.productGid)&&(!a.variantGid||variants.get(a.variantGid)?.product.id===a.productGid),'fulfillment entity identity invalid');
    if(a.variantGid)check(context.variantArchitecture.currentOptionAudit.some(v=>v.productGid===a.productGid)&&a.fulfillmentEvidenceIds?.length&&a.fulfillmentEvidenceIds.every(id=>context.evidenceIds.has(id))&&approved(a.commerceDecisionId,'variant_fulfillment',a.variantGid,['Operations','Product Owner']),'Variant handling requires proven commerce and fulfillment distinction');
    check(['parcel','freight'].includes(a.fulfillmentClass),'unsupported fulfillment vocabulary');
    check(approved(a.approvalDecisionId,'fulfillment',a.assignmentId,['Operations','Product Owner']),'fulfillment requires owner evidence');
    check(!['carrier','rate','inventoryCount','leadTime','deliveryProfileGid'].some(k=>k in a),'native configuration/inventory cannot be durable Product fact');
    check(a.expectedProfileGids.length>0&&a.expectedProfileGids.every(id=>/^gid:\/\/shopify\/DeliveryProfile\/\d+$/.test(id)),'expected profile identity invalid');
  }
  for(const c of input.profileCapabilities)check(approved(c.approvalDecisionId,'profile_capability',c.profileGid,['Operations','Admin/Engineering'])&&/^[a-f0-9]{64}$/.test(c.configurationSha256),'profile capability needs approved configuration hash');
  for(const r of input.pickupRules){
    check(productSet.has(r.productGid)&&['allowed','not_allowed'].includes(r.permission),'pickup Product permission invalid');
    check(r.evidenceBasis==='explicit_business_rule'&&approved(r.approvalDecisionId,'pickup',r.ruleId,['Operations','Product Owner']),'pickup cannot be inferred from location existence');
  }
  for(const r of input.regionRules){
    check(productSet.has(r.productGid),'region Product identity invalid');
    check(['regulatory','commercial','temporary','policy'].includes(r.kind)&&r.evidenceBasis==='explicit_regional_rule','electrical/Vendor/family inference cannot establish region restriction');
    check(/^[A-Z]{2}$/.test(r.countryCode)&&context.supportedCountries.includes(r.countryCode),'region requires supported country identity');
    check(r.subdivision===null||context.supportedSubdivisions.includes(r.subdivision),'region requires supported subdivision identity');
    check(approved(r.approvalDecisionId,'region',r.ruleId,['Operations','Product Owner']),'region requires explicit owner evidence');
    if(r.kind==='temporary')check(stamp(r.expiresAt)&&Date.parse(r.expiresAt)>Date.parse(asOf),'temporary regional rule requires current expiry');
  }
  for(const p of input.policyVersions){
    check(stamp(p.effectiveFrom)&&(!p.effectiveTo||stamp(p.effectiveTo)&&Date.parse(p.effectiveTo)>Date.parse(p.effectiveFrom)),'policy effective dates invalid');
    check(Boolean(p.revision)&&['current','obsolete','superseded'].includes(p.lifecycle),'policy revision/lifecycle missing');
    check(approved(p.approvalDecisionId,'policy',p.policyId,['Legal/Business','Support']),'warranty policy requires Legal/Business and Support owner evidence');
    check(Boolean(p.issuer)&&Boolean(p.administrator)&&Boolean(p.repairProvider)&&p.roleEvidence&&['issuer','administrator','repairProvider'].every(role=>p.roleEvidence[role]?.length&&p.roleEvidence[role].every(id=>context.evidenceIds.has(id))),'issuer/administrator/service roles cannot collapse or default from Vendor');
    if(new Set([p.issuer,p.administrator,p.repairProvider]).size<3)check(p.explicitRoleEquality===true,'equal warranty roles require explicit approval');
    check(p.sourceIds.length>0&&p.sourceIds.every(id=>context.evidenceIds.has(id)),'policy source identity invalid');
    const resource=resources.get(p.resourceId);
    const native=context.nativePolicies.find(n=>n.id===p.nativePolicyGid);
    check(Boolean(resource)||Boolean(native),'policy must reference a governed resource or audited native policy');
    check(Boolean(resource)!==Boolean(native),'policy requires one unambiguous source authority');
    check(p.sourceSha256===(resource?resource.contentHash:native?digest(native):null),'policy revision must bind exact source content hash');
    if(p.lifecycle==='current')check(resource?resource.canonical&&resource.status==='current'&&!resource.supersededBy:!!native,'obsolete/evidence-only resource cannot be current policy');
    if(p.lifecycle==='superseded')check(input.policyVersions.some(q=>q.policyId===p.supersededBy&&q.policyId!==p.policyId),'superseded policy requires exact successor');
  }
  for(const c of input.warrantyClasses){
    const p=input.policyVersions.find(p=>p.policyId===c.policyId&&p.revision===c.policyRevision);
    check(p&&p.lifecycle==='current'&&Date.parse(p.effectiveFrom)<=Date.parse(asOf)&&(!p.effectiveTo||Date.parse(p.effectiveTo)>Date.parse(asOf)),'obsolete/superseded/expired policy cannot act as current warranty terms');
    check(Number.isInteger(c.durationValue)&&c.durationValue>0&&['days','months','years'].includes(c.durationUnit)&&c.trigger&&approved(c.approvalDecisionId,'warranty_class',c.classId,['Legal/Business','Product Owner']),'warranty duration requires approved class/policy/owner evidence');
  }
  for(const m of input.warrantyMappings){
    const c=input.warrantyClasses.find(c=>c.classId===m.classId);
    check(productSet.has(m.productGid)&&c&&approved(m.approvalDecisionId,'warranty_mapping',m.productGid,['Legal/Business','Product Owner']),'warranty mapping requires exact approved Product/class identity');
    const brand=context.brandByGid[m.productGid];
    if(brand&&brand!=='Rhino Lapidary')check(m.thirdPartyResponsibilityConfirmed===true,'third-party Vendor cannot automatically inherit Rhino warranty');
    check(Array.isArray(m.exceptions),'Product-specific warranty exceptions must be explicit');
  }
  for(const s of input.leadTimeSources)check(approved(s.approvalDecisionId,'lead_time_source',s.sourceId,['Operations','Product Owner'])&&s.updateSlaSeconds<=s.maxAgeSeconds,'unapproved or unmaintainable timing source');
  for(const p of input.leadTimeProjections){
    check(!p.fulfillmentEvidenceIds||p.fulfillmentEvidenceIds.every(id=>context.evidenceIds.has(id)),'Variant timing evidence identity invalid');
    errors.push(...leadTimeErrors(p,input.leadTimeSources.find(s=>s.sourceId===p.sourceId),input,context));
  }
  return errors;
}
function validateRegistry3c(registry){
  const errors=[];
  const candidates=registry.metafields.filter(f=>['E-PBI-015','E-PBI-016','E-PBI-017'].includes(f.sourcePbi));
  if(candidates.length!==1||!isBatch3cDefinition(candidates[0]))errors.push('Batch 3C permits only the proposed fulfillment_class definition');
  for(const f of registry.metafields)if(/^(shipping_weight|carrier|shipping_rate|delivery_profile_id|inventory_count|lead_time|warranty_duration|support_email|support_phone)$/.test(f.key))errors.push('native/operational/unsupported promise duplicated as Product custom data');
  if([...registry.metafields,...registry.metaobjects].some(f=>/^E-PBI-(02\d|0[3-9]\d)/.test(f.sourcePbi||'')))errors.push('future mutation/population PBI cannot enter Batch 3C');
  if(registry.metaobjects.some(m=>['E-PBI-015','E-PBI-016','E-PBI-017'].includes(m.sourcePbi)))errors.push('unjustified warranty/operational metaobject');
  return errors;
}
module.exports={contracts,isBatch3cDefinition,digest,approval,freshness,reconcileFulfillment,leadTimeErrors,resolveLeadTime,resolveAvailability,validateOwnerInputs,validateRegistry3c};
