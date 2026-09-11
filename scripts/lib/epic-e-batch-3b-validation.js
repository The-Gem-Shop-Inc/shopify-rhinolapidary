const {fields} = require('./epic-e-batch-3b-fields');
const states=['approved','proposed','conflicting','blocked','not_compatible','deprecated','superseded'];
function validateTypedValue(spec, observation, commerceProof){
  const errors=[];
  if(observation.state!=='approved'||!observation.approvalDecisionId||observation.conflictIds?.length)errors.push('fact requires conflict-free owner approval');
  if(observation.ownerType!==spec.ownerType)errors.push('fact scope differs from field contract');
  if(observation.ownerType==='PRODUCTVARIANT'&&!commerceProof)errors.push('Variant fact requires proven commerce distinction');
  if(observation.physicalState!==spec.physicalState)errors.push('physical state mismatch');
  const values=spec.type.startsWith('list.')?observation.value:[observation.value];
  if(!Array.isArray(values)||!values.length)return [...errors,'typed list must be nonempty'];
  for(const v of values){
    if(spec.unit){
      if(typeof v?.value!=='number'||!Number.isFinite(v.value)||v.unit!==spec.unit)errors.push('typed numeric value and canonical unit required');
      if(v?.value<0||(!spec.key.endsWith('_min')&&v?.value===0))errors.push('invalid measurement range');
    }else if(spec.allowedValues&&!spec.allowedValues.includes(v))errors.push('value outside vocabulary');
  }
  if(new Set(values.map(v=>JSON.stringify(v))).size!==values.length)errors.push('duplicate typed list value');
  return errors;
}
function validateIncludedQuantities(productGids,quantities){
  if(new Set(productGids).size!==productGids.length)return ['duplicate included Product'];
  if(JSON.stringify([...productGids].sort())!==JSON.stringify(Object.keys(quantities).sort()))return ['included quantity keys must exactly match referenced Products'];
  if(Object.values(quantities).some(q=>!Number.isSafeInteger(q)||q<=0))return ['included quantities must be positive integers'];
  return [];
}
function validateTypedRange(min,max){
  if(min.value.unit!==max.value.unit||min.physicalState!==max.physicalState||min.productGid!==max.productGid||min.sourceId!==max.sourceId)return ['range endpoints must share unit, state, Product and source'];
  return min.value.value<=max.value.value?[]:['range minimum exceeds maximum'];
}
function reverseCompatibility(edges,{customerOnly=false}={}){
  const result={};
  for(const e of edges.filter(e=>e.state==='approved'&&e.scope==='PRODUCT'&&(!customerOnly||e.targetAvailability?.customerEligible===true)).sort((a,b)=>a.targetMachineProductGid.localeCompare(b.targetMachineProductGid)||a.dependentProductGid.localeCompare(b.dependentProductGid))){
    (result[e.targetMachineProductGid]??=[]).push(e.dependentProductGid);
  }
  return result;
}
function validateBatch(data, context){
  const errors=[];
  const check=(condition,message)=>{if(!condition)errors.push(message);};
  const {contract,matrix,measurement,components,resources,technical,packet}=data;
  const products=new Map(context.classification.mappings.map(p=>[p.productGid,p]));
  const variants=new Map(context.identity.variantIdentities.map(v=>[v.variantGid,v]));
  const sources=new Map(context.corpus.sources.map(s=>[s.sourceId,s]));
  const decision=(id,kind,entity)=>context.approvals?.some(a=>a.id===id&&a.kind===kind&&a.entity===entity&&a.state==='approved'&&a.owner&&a.evidenceIds?.length);
  const proof=e=>{
    check(contract.compatibility.proofKinds.includes(e.kind),'forbidden compatibility proof (family/title/tag/collection/inclusion/recommendation)');
    check(e.sourceId==='catalog-description'||sources.has(e.sourceId),'unknown compatibility evidence source');
    check(typeof e.location==='string'&&e.location.length>0&&typeof e.excerpt==='string'&&e.excerpt.length>0,'missing located compatibility evidence');
  };
  for(const output of Object.values(data))check(output.mutationAuthorized===false,'Admin mutation authorization forbidden');
  check(JSON.stringify(contract.phaseOrder)===JSON.stringify([['E-PBI-010','E-PBI-012','E-PBI-018B'],['E-PBI-011','E-PBI-013','E-PBI-014']]),'dependency order changed');
  check(contract.compatibility.direction==='dependent_product_to_machine_product'&&contract.compatibility.type==='list.product_reference'&&contract.compatibility.scope==='PRODUCT','canonical compatibility must use directed exact Product references');
  check(JSON.stringify(contract.compatibility.proofKinds)===JSON.stringify(['legacy_identifier_exact','explicit_description_statement','technical_document_exact']),'compatibility proof allowlist changed');
  check(contract.measurements.nativeShippingWeight==='PRODUCTVARIANT.inventoryItem.measurement.weight','native shipping weight ownership changed');
  check(new Set(contract.measurements.states.map(s=>s.state)).size===8,'measurement physical states collapsed');
  for(const s of ['net','assembled','operating_footprint','packaged','crate_outer','shipping','package_count','multi_package'])check(contract.measurements.states.some(x=>x.state===s),'missing physical state '+s);
  const storages=contract.measurements.states.map(s=>s.storage).filter(Boolean);
  check(new Set(storages).size===storages.length,'measurement physical states share storage');
  check(contract.fields.length===fields.length,'field inventory mismatch');
  for(const spec of fields){
    const f=contract.fields.find(f=>f.key===spec.key);
    check(f&&f.type===spec.type&&f.unit===spec.unit&&f.ownerType===spec.ownerType&&f.physicalState===spec.physicalState,'technical type/unit/scope/physical state mismatch '+spec.key);
    const r=context.registry.metafields.find(r=>r.key===spec.key&&r.namespace==='rhino');
    check(r&&r.type===spec.type&&r.ownerType===spec.ownerType&&r.cardinality===(spec.type.startsWith('list.')?'list':'one'),'registry type/cardinality/scope mismatch '+spec.key);
    if(spec.unit)check(r?.validationRules.some(v=>v.name==='canonical_unit'&&v.value===spec.unit),'registry canonical unit missing '+spec.key);
  }
  for(const f of context.registry.metafields){
    check(!/shipping_weight|shipment_weight|fulfillment_weight/.test(f.key),'native shipping weight duplicate');
    check((!['E-PBI-015','E-PBI-016','E-PBI-017'].includes(f.sourcePbi)||require('./epic-e-batch-3c-contract').isBatch3cDefinition(f))&&!/^E-PBI-0(?:2\d|[3-9]\d)/.test(f.sourcePbi),'future PBI definition outside authorized batch');
  }
  const scopeCheck=(row)=>{
    if(row.scope==='PRODUCTVARIANT'){
      const variant=variants.get(row.variantGid);
      check(variant&&variant.productGid===(row.productGid||row.dependentProductGid),'Variant identity or parent mismatch');
      check(context.variantArchitecture.currentOptionAudit.some(a=>a.productGid===variant?.productGid),'Variant fact requires proven Variant commerce distinction');
      check(row.commerceDecisionId==='PO-E-017'&&row.configurationCandidateId==='CONFIG-012','Variant fact requires explicit approved E-PBI-008 distinction');
    }
  };
  for(const f of technical.facts){
    const source=context.corpus.factObservations.find(s=>s.factId===f.factId);
    check(source&&JSON.stringify(source.value)===JSON.stringify(f.value)&&JSON.stringify(source.conflictIds)===JSON.stringify(f.conflictIds),'source fact value/conflict provenance changed');
    check(f.productGid===null||products.get(f.productGid)?.proposedProductClass==='machine','technical fact wrong Product identity');
    check(!f.valueApproved||(!f.conflictIds.length&&f.decisionState==='approved'&&decision(f.approvalDecisionId,'fact',f.factId)),'conflicting/unapproved fact cannot become approved value');
    scopeCheck(f);
  }
  check(technical.facts.length===context.corpus.factObservations.length&&new Set(technical.facts.map(f=>f.factId)).size===context.corpus.factObservations.length,'technical source observation coverage mismatch');
  const dep=[...products.values()].filter(p=>p.proposedProductClass!=='machine');
  check(matrix.coverage.length===dep.length&&new Set(matrix.coverage.map(p=>p.productGid)).size===dep.length&&dep.every(p=>matrix.coverage.some(r=>r.productGid===p.productGid)),'dependent Product coverage incomplete/duplicate');
  const keys=new Set();
  for(const edge of matrix.edges){
    const a=products.get(edge.dependentProductGid),b=products.get(edge.targetMachineProductGid);
    check(a&&b,'orphan compatibility reference');
    check(a&&a.proposedProductClass!=='machine'&&b?.proposedProductClass==='machine','compatibility wrong Product class');
    check(edge.dependentProductGid!==edge.targetMachineProductGid,'self compatibility reference');
    check(/^gid:\/\/shopify\/Product\/\d+$/.test(edge.targetMachineProductGid),'compatibility target must be exact Product GID');
    const target=context.snapshot.datasets.products.records.find(p=>p.id===edge.targetMachineProductGid);
    const published=Boolean(target?.publishedAt)&&Boolean(target?.resourcePublicationsV2?.nodes.some(p=>p.isPublished));
    check(edge.targetAvailability?.status===(target?.status||'MISSING')&&edge.targetAvailability?.published===published&&edge.targetAvailability?.customerEligible===(target?.status==='ACTIVE'&&published),'unavailable-machine detection differs from snapshot');
    const key=`${edge.dependentProductGid}:${edge.targetMachineProductGid}:${edge.scope}:${edge.variantGid}`;
    check(!keys.has(key),'duplicate compatibility reference');keys.add(key);
    check(states.includes(edge.state),'unknown relationship state');
    check(edge.evidence.length>0,'compatibility has no evidence');edge.evidence.forEach(proof);
    for(const e of edge.evidence){
      if(e.kind==='legacy_identifier_exact'){
        const row=context.extracted.workbookRows.find(r=>r.sourceId===e.sourceId&&`${r.sheet}!row ${r.row}`===e.location);
        check(row?.cells.some(c=>c.value.trim()===e.legacyIdentifier)&&row.cells.map(c=>`${c.cell}: ${c.value}`).join(' | ')===e.excerpt,'legacy compatibility evidence does not match actual source row');
        check(context.identity.variantIdentities.some(v=>v.productGid===edge.dependentProductGid&&v.legacyPartNumbers.includes(e.legacyIdentifier)),'legacy compatibility lacks exact dependent identity evidence');
      }
      if(e.kind==='explicit_description_statement'){
        const body=context.extracted.productDescriptions.find(p=>p.handle===a?.handle)?.bodyHtml.replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim()||'';
        check(body.includes(e.excerpt),'description compatibility excerpt not in source');
      }
    }
    scopeCheck(edge);
    if(edge.state==='approved'||edge.state==='not_compatible'){
      check(!edge.blocker&&!edge.conflictIds.length&&decision(edge.approvalDecisionId,'compatibility',edge.edgeId),'compatibility approval requires actual owner decision without conflict/blocker');
      check(!['automatic-feed-clamp','saw-vice-plate-set'].includes(a?.handle),'collapsed technical Product cannot approve compatibility');
      if(edge.state==='not_compatible')check(edge.evidence.some(e=>e.polarity==='negative'),'absence of evidence is not not_compatible');
    }
    if(edge.state==='approved'&&edge.scope==='PRODUCT')check((context.identity.variantIdentities.filter(v=>v.productGid===a?.productGid).length===1)||edge.allVariantsProven===true,'Variant-specific compatibility cannot become Product union');
    if(edge.supersededByEdgeId||edge.state==='superseded'){
      check(edge.state==='superseded'&&matrix.edges.some(e=>e.edgeId===edge.supersededByEdgeId&&e.edgeId!==edge.edgeId),'superseded edge requires an exact separate successor edge');
      let current=edge;const seen=new Set([edge.edgeId]);
      while(current?.supersededByEdgeId){check(!seen.has(current.supersededByEdgeId),'compatibility supersession cycle');if(seen.has(current.supersededByEdgeId))break;seen.add(current.supersededByEdgeId);current=matrix.edges.find(e=>e.edgeId===current.supersededByEdgeId);}
    }
  }
  for(const row of matrix.coverage)check(JSON.stringify(row.edgeIds)===JSON.stringify(matrix.edges.filter(e=>e.dependentProductGid===row.productGid).map(e=>e.edgeId)),'coverage edge IDs do not reconcile');
  check(matrix.statistics.dependentProducts===dep.length&&matrix.statistics.edges===matrix.edges.length,'relationship statistics mismatch');
  for(const state of states)check(matrix.statistics.byState[state]===matrix.edges.filter(e=>e.state===state).length,'relationship state counts mismatch');
  check(measurement.coverage.length===products.size&&new Set(measurement.coverage.map(r=>r.productGid)).size===products.size,'measurement Product coverage mismatch');
  check(measurement.nativeShippingWeights.length===variants.size&&new Set(measurement.nativeShippingWeights.map(r=>r.variantGid)).size===variants.size,'native weight Variant coverage mismatch');
  for(const row of measurement.coverage){
    check(products.has(row.productGid),'unknown measurement Product');
    check(row.packages.length===0,'unproven multi-package records fabricated');
  }
  for(const row of measurement.nativeShippingWeights){
    const native=context.snapshot.datasets.variants.records.find(v=>v.id===row.variantGid);
    check(native?.product.id===row.productGid&&JSON.stringify(native?.inventoryItem?.measurement?.weight||null)===JSON.stringify(row.weight),'native shipping weight observation changed');
  }
  for(const line of components.lines){
    check(products.has(line.productGid),'component owner identity invalid');
    check(line.componentProductGid===null||products.has(line.componentProductGid),'component Product reference invalid');
    check(contract.components.meanings.includes(line.meaning),'component meaning invalid');
    check(line.quantity===null||(Number.isSafeInteger(line.quantity)&&line.quantity>0),'component quantity must be positive integer');
    check(line.sourceId!=='compatibility'&&line.sourceId!=='recommendation','included component cannot be inferred from compatibility/recommendations');
    if(line.state==='approved')check(line.quantity!==null&&!line.conflictIds.length&&!line.blocker&&decision(line.approvalDecisionId,'component',line.lineId),'component approval requires BOM decision and quantity');
  }
  const resourceIds=new Set(resources.resources.map(r=>r.resourceId));
  check(resources.resources.length===sources.size&&resourceIds.size===sources.size,'resource corpus coverage mismatch');
  for(const r of resources.resources){
    const s=sources.get(r.sourceId);
    check(s&&r.fileGid===s.shopifyFileGid,'File resource identity does not match evidence entity');
    check(r.fileGid===null||/^gid:\/\/shopify\/(GenericFile|Video|MediaImage)\/\d+$/.test(r.fileGid),'invalid File resource identity');
    check(!('url' in r),'duplicate URL cannot be canonical File storage');
    check(r.candidateProductGids.every(g=>products.has(g)),'invalid resource Product identity');
    check(contract.resources.types.includes(r.resourceType)&&contract.resources.states.includes(r.status)&&contract.resources.visibility.includes(r.visibility),'resource type/state/visibility invalid');
    if(r.canonical)check(r.fileGid&&r.status==='current'&&!r.supersededBy&&r.revision&&r.language&&decision(r.approvalDecisionId,'resource',r.resourceId),'obsolete/superseded/unapproved resource cannot be canonical');
    if(r.visibility==='customer')check(r.canonical&&r.publicationApproved&&r.rights==='approved_publication'&&r.sourceRole==='canonical_resource','evidence File cannot automatically become customer download');
    if(r.visibility==='customer'&&r.resourceType==='video')check(/^gid:\/\/shopify\/MediaImage\/\d+$/.test(r.videoReadiness?.posterFileGid)&&r.videoReadiness?.captions==='approved'&&r.videoReadiness?.transcript==='approved'&&r.videoReadiness?.performance==='approved','video requires poster/caption/transcript/performance approval');
    if(r.supersededBy)check(resourceIds.has(r.supersededBy)&&r.supersededBy!==r.resourceId&&r.status==='superseded','invalid resource successor');
    const seen=new Set([r.resourceId]);let current=r;
    while(current?.supersededBy){check(!seen.has(current.supersededBy),'resource supersession cycle');if(seen.has(current.supersededBy))break;seen.add(current.supersededBy);current=resources.resources.find(x=>x.resourceId===current.supersededBy);}
  }
  for(const ref of resources.productReferences){
    const r=resources.resources.find(r=>r.resourceId===ref.resourceId);
    check(products.has(ref.productGid)&&r?.candidateProductGids.includes(ref.productGid),'resource reference applicability not proven');
    check(r?.canonical&&r.fileGid===ref.fileGid,'Product resource reference must use canonical existing File identity');
    if(ref.field!=='support_files')check(r?.visibility==='customer','support-only resource in customer field');
    check(['manual_files','diagram_files','instruction_files','video_files','support_files'].includes(ref.field)&&ref.field===`${r?.resourceType}_files`,'resource kind and Product field mismatch');
    if(ref.field==='video_files')check(/^gid:\/\/shopify\/Video\/\d+$/.test(ref.fileGid),'video File entity required');
  }
  check(packet.decisions.every(d=>d.state==='pending'&&d.approval===null),'generator cannot manufacture owner decisions');
  for(const text of context.productionSourceTexts||[]){
    const tokens=['metafieldDefinition'+'Create','metaobjectDefinition'+'Create','metafields'+'Set','metaobject'+'Upsert','product'+'Update','productVariants'+'BulkUpdate','file'+'Create','file'+'Update','file'+'Delete'];
    check(!tokens.some(t=>text.includes(t))&&!/\bfetch\s*\(|https?\.request\s*\(|\bmutation\s*\{/.test(text),'Admin mutation/network code forbidden');
  }
  return errors;
}
module.exports={validateBatch,reverseCompatibility,validateTypedValue,validateIncludedQuantities,validateTypedRange};
