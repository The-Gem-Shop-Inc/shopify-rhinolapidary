const {freshness,digest}=require('./epic-e-batch-3c');
const {domains}=require('./epic-e-migration-domains');
const requiredDatasets=['products','variants','productMetafieldDefinitions','variantMetafieldDefinitions','collectionMetafieldDefinitions','metaobjectDefinitions','deliveryProfiles','locations','markets','variantFulfillment','deliveryConfiguration','pickupConfiguration','marketRegions','policyPages','shopPolicies','files','machineFamilies'];
function assessAdmin(snapshot,asOf,refreshAvailable=false){
 const age=freshness(snapshot,asOf);
 const missingDatasets=requiredDatasets.filter(k=>{const d=snapshot.datasets[k];return d?.queryStatus!=='success'||d?.errorCount!==0||!Array.isArray(d?.records)||d.recordCount!==d.records.length||d.records.filter(r=>r.id).length!==new Set(d.records.filter(r=>r.id).map(r=>r.id)).size;});
 return {snapshotCapturedAt:snapshot.capturedAt,asOf,expiresAt:age.expiresAt,temporalState:age.state,refreshAvailable,missingDatasets,queryErrors:snapshot.errors?.length||0,
  state:age.state!=='within_seven_day_window'?'admin_stale':!refreshAvailable?'admin_inaccessible':missingDatasets.length||snapshot.errors?.length?'admin_incomplete':'admin_reconciled',
  currentReconciliationUsable:age.state==='within_seven_day_window'&&refreshAvailable&&!missingDatasets.length&&!snapshot.errors?.length,perpetualStateClaim:false};
}
function compareNative(before,after){
 const changes=[],coverage=[];
 const paths={products:['handle','status','publishedAt','vendor','category','productType','options'],variants:['product','selectedOptions','sku','barcode','inventoryPolicy','inventoryItem']};
 for(const [dataset,fields]of Object.entries(paths)){
  if(before.datasets[dataset]?.queryStatus!=='success'||after.datasets[dataset]?.queryStatus!=='success'){coverage.push({dataset,state:'unassessed'});continue;}
  const prior=new Map(before.datasets[dataset].records.map(r=>[r.id,r])),next=new Map(after.datasets[dataset].records.map(r=>[r.id,r]));
  coverage.push({dataset,state:'compared',before:prior.size,after:next.size});
  for(const [id,p]of prior){const q=next.get(id);if(!q){changes.push({dataset,id,field:'identity',state:'missing_target',before:id,after:null,rewriteAllowed:false});continue;}
   for(const field of fields)if(digest(p[field]??null)!==digest(q[field]??null))changes.push({dataset,id,field,state:'changed',before:p[field]??null,after:q[field]??null,rewriteAllowed:false});
   const pm=new Map((p.metafields?.nodes||[]).map(m=>[`${m.namespace}.${m.key}`,m])),qm=new Map((q.metafields?.nodes||[]).map(m=>[`${m.namespace}.${m.key}`,m]));
   for(const key of new Set([...pm.keys(),...qm.keys()])){
    const clean=m=>m?{id:m.id,type:m.type,jsonValue:m.jsonValue}:null;
    if(digest(clean(pm.get(key)))!==digest(clean(qm.get(key))))changes.push({dataset,id,field:'metafields.'+key,state:'changed',before:clean(pm.get(key)),after:clean(qm.get(key)),rewriteAllowed:false});
   }
  }
  for(const [id]of next)if(!prior.has(id))changes.push({dataset,id,field:'identity',state:'new_target',before:null,after:id,rewriteAllowed:false});
 }
 return {coverage,changes,interpretation:'Snapshot-to-snapshot observations only. A missing or changed identity is never remapped by title, handle or family.'};
}
function validateGraph(graph){
 const errors=[],nodes=new Map(graph.nodes.map(n=>[n.id,n])),seen=new Set();
 if(nodes.size!==graph.nodes.length)errors.push('duplicate graph node');
 for(const n of graph.nodes)if(['Product','ProductVariant'].includes(n.entityType)&&!new RegExp(`^gid://shopify/${n.entityType}/[0-9]+$`).test(n.id))errors.push('invalid Product/Variant graph identity');
 for(const e of graph.edges){
  const source=nodes.get(e.source),target=nodes.get(e.target),key=[e.kind,e.source,e.target].join('|');
  if(!e.source||!source)errors.push('missing/orphan source GID');
  if(!e.target){if(e.state==='approved'||e.canonical)errors.push('approved relation missing target GID');continue;}
  if(!target)errors.push('orphan reference target');
  if(e.source===e.target&&e.kind!=='resource_applicability')errors.push('prohibited self relation');
  if(seen.has(key))errors.push('duplicate graph edge');seen.add(key);
  if(e.kind==='compatibility'){
   if(source?.entityType!=='Product'||!['replacement_part','consumable','accessory'].includes(source.productClass)||target?.productClass!=='machine')errors.push('compatibility wrong Product class');
   if(e.state==='approved'&&!e.humanApprovalVerified)errors.push('generated compatibility approval lacks human authority');
   if(e.inferredReverse||e.evidenceBasis==='family')errors.push('inferred reciprocal/family compatibility');
  }
  if(['included','optional','recommended'].includes(e.kind)&&target?.entityType!=='Product')errors.push('component reference must be exact Product');
  if(e.kind==='family_membership'&&target?.entityType!=='machine_family')errors.push('family reference must target governed family entity');
  if(e.canonical&&(e.state!=='approved'||!e.humanApprovalVerified))errors.push('canonical relation lacks approval');
  if(e.canonical&&target&&(target.lifecycle==='superseded'||target.lifecycle==='obsolete'||target.publicationApproved===false||target.available===false))errors.push('unavailable/superseded target cannot be canonical');
  if(e.canonical&&source&&['superseded','obsolete'].includes(source.lifecycle))errors.push('superseded source resource cannot be canonical');
  if(e.evidenceBasis==='upload_date'&&e.canonical)errors.push('canonical File cannot be inferred from upload date');
  if(e.kind==='warranty'&&e.evidenceBasis==='vendor')errors.push('Vendor cannot establish warranty responsibility');
 }
 return errors;
}
function executionBlockers(plan,bundle,admin,{mutationAuthorized=false,inputsCurrent=true,afterVerified=false}={}){
 const blockers=[];
 if(!mutationAuthorized)blockers.push('mutation_unauthorized');
 if(!admin.currentReconciliationUsable)blockers.push(admin.state);
 if(!inputsCurrent)blockers.push('stale_inputs');
 for(const role of ['Product Owner','Shopify Admin Owner'])if(!plan.approvals.some(a=>a.role===role&&a.granted&&a.recordedAt&&a.evidence))blockers.push(`missing_${role}_GO`);
 if(!bundle.rows.length)blockers.push('no_approved_values');
 if(!plan.rollback?.artifact?.sha256||!bundle.rollback?.length&&bundle.rows.length)blockers.push('rollback_incomplete');
 if(bundle.rows.some(r=>r.valueState!=='approved'))blockers.push('unapproved_value');
 if(bundle.preconditions.some(p=>!p.satisfied))blockers.push('unsatisfied_preconditions');
 if(plan.dryRun.status!=='passed')blockers.push('dry_run_required');
 if(afterVerified)blockers.push('already_applied_verify_idempotent_no_op');
 return blockers;
}
function validatePlanBundle(plan,bundle,context){
 const errors=[],d=domains.find(d=>d.key===plan.mutationDomain);
 if(!d||d.targetPbi!==plan.targetPbi)errors.push('unknown or giant unsplit mutation domain');
 if(d&&digest(plan.fieldAllowlist)!==digest(d.fieldAllowlist))errors.push('domain allowlist changed');
 if(!plan.rollback?.artifact?.sha256||!bundle.rollback)errors.push('missing rollback');
 if(plan.executionStatus!=='blocked'||plan.decisionState!=='blocked'||plan.approvals.some(a=>a.granted))errors.push('Batch 4A cannot approve execution or GO');
 if(bundle.mutationAuthorized||bundle.executable)errors.push('Batch 4A mutation set must be non-executable');
 const defs=context.definitions,products=new Set(context.products.map(p=>p.id)),variants=new Set(context.variants.map(p=>p.id));
 const seen=new Set();
 for(const row of bundle.rows){
  if(row.domain!==d?.key||!d?.fieldAllowlist.includes(row.field))errors.push('unrelated mutation entered bounded domain');
  if(row.valueState!=='approved'||row.conflictIds?.length)errors.push('blocked/proposed/conflicting value entered migration');
  if(seen.has(row.rowId))errors.push('duplicate migration row');seen.add(row.rowId);
  if(row.kind==='definition'){
   const def=defs.find(f=>f.definitionId===row.definitionId);
   if(!def||def.decisionState!=='approved'||digest(def)!==digest(row.desiredContract))errors.push('definition is not approved exact desired contract');
  }else if(!products.has(row.targetGid)&&!variants.has(row.targetGid))errors.push('missing exact target GID');
  if(row.domain==='commerce_sku'&&!context.sku.allocations.some(a=>a.variantGid===row.targetGid&&a.sku===row.desired&&a.issuanceState==='approved'))errors.push('proposed SKU cannot become approved migration');
  if(row.domain==='product_class'&&!context.classification.mappings.some(m=>m.productGid===row.targetGid&&m.classDecisionState==='approved'&&m.proposedProductClass===row.desired&&m.approvalDecisionId===row.approvalDecisionId))errors.push('class approval mismatch');
  if(row.domain==='category'&&!context.decisions.decisions.taxonomy.productDecisions.some(m=>m.productGid===row.targetGid&&m.taxonomyCategoryId===row.desired&&m.decisionState==='approved'))errors.push('Category candidate has no exact approval');
  if(!['definitions','product_class','category'].includes(row.domain))errors.push('domain has no currently approved population input adapter; owner closure required');
  if(row.domain==='shipping_weight'&&row.field!=='ProductVariant.inventoryItem.measurement.weight')errors.push('native shipping weight cannot become metafield');
  if(!bundle.rollback?.some(r=>r.rowId===row.rowId&&digest(r.restore)===digest(row.before)))errors.push('row rollback missing or differs from before state');
 }
 if(bundle.rows.length!==bundle.rollback?.length)errors.push('rollback coverage differs from mutation set');
 return errors;
}
function validateReadiness(rows){
 const errors=[];for(const r of rows){
  if(r.safe_for_customer_fact_rendering&&(r.value_blocked||r.admin_reconciliation_required||r.admin_mutation_required))errors.push('blocked/unmigrated fact marked customer-safe');
  if(r.value_ready&&r.approvedRows===0)errors.push('architecture ready confused with value ready');
 }return errors;
}
function rowAction(row,current){
 if(digest(current)===digest(row.desiredContract||row.desired))return 'no_op';
 return digest(current)===digest(row.before)?'apply_after_GO':'precondition_failed';
}
function inspectSnapshotReferences(snapshot,context){
 const rows=[];
 for(const dataset of ['products','variants'])for(const owner of snapshot.datasets[dataset]?.records||[])for(const m of owner.metafields?.nodes||[]){
  if(!/reference$/.test(m.type))continue;
  const targets=m.type.startsWith('list.')?m.jsonValue:[m.jsonValue];
  if(!Array.isArray(targets)){rows.push({ownerGid:owner.id,key:m.key,state:'invalid_reference_list'});continue;}
  const seen=new Set();
  for(const targetGid of targets){
   let state='observed_present';const targetDataset=m.type.endsWith('product_reference')?'products':m.type.endsWith('variant_reference')?'variants':m.type.endsWith('file_reference')?'files':'machineFamilies';
   const expected=targetDataset==='products'?'Product':targetDataset==='variants'?'ProductVariant':targetDataset==='machineFamilies'?'Metaobject':'(?:GenericFile|MediaImage|Video)';
   if(typeof targetGid!=='string'||!new RegExp(`^gid://shopify/${expected}/[0-9]+$`).test(targetGid))state='invalid_reference_identity';
   else if(seen.has(targetGid))state='duplicate_reference';
   else if(owner.id===targetGid)state='self_reference';
   else if(snapshot.datasets[targetDataset]?.queryStatus!=='success')state='target_not_audited';
   else if(!snapshot.datasets[targetDataset].records.some(r=>r.id===targetGid))state='missing_target';
   else if(m.key==='compatible_machines'){
    if(!context.classification.mappings.some(p=>p.productGid===targetGid&&p.proposedProductClass==='machine'))state='wrong_product_class';
    else if(!context.matrix.edges.some(e=>e.dependentProductGid===owner.id&&e.targetMachineProductGid===targetGid&&e.state==='approved'&&e.approvalDecisionId))state='unapproved_compatibility';
   }else if(targetDataset==='files'&&!context.resources.resources.some(r=>r.fileGid===targetGid&&r.canonical&&r.status==='current'&&r.publicationApproved&&r.approvalDecisionId))state='unapproved_canonical_file';
   seen.add(targetGid);rows.push({ownerGid:owner.id,key:m.key,targetGid,state});
  }
 }
 return rows;
}
function verifyAfterPlan(bundle,before,after,definitionDiff){
 const rows=bundle.rows.map(row=>{
  if(row.kind==='definition')return {rowId:row.rowId,matches:definitionDiff.entries.some(e=>e.definitionId===row.definitionId&&e.action==='no_op')};
  const dataset=row.targetGid.includes('/ProductVariant/')?'variants':'products',owner=after.datasets[dataset]?.records.find(p=>p.id===row.targetGid);
  let actual,identityPreserved=true;
  if(row.field.includes('.metafields.')){const key=row.field.split('.metafields.')[1],m=owner?.metafields?.nodes.find(m=>`${m.namespace}.${m.key}`===key);actual=m?.jsonValue;identityPreserved=!row.before.metafieldGid||row.before.metafieldGid===m?.id;}
  else if(row.field==='Product.category')actual=owner?.category?.id;
  else if(row.field==='Product.vendor')actual=owner?.vendor;
  else if(row.field==='ProductVariant.sku')actual=owner?.sku;
  return {rowId:row.rowId,matches:!!owner&&identityPreserved&&digest(actual??null)===digest(row.desired),identityPreserved};
 });
 const changes=compareNative(before,after).changes;
 const unexpectedChanges=changes.filter(c=>!bundle.rows.some(row=>row.targetGid===c.id&&row.field.slice(row.field.indexOf('.')+1)===c.field));
 return {rows,unexpectedChanges,matchesExpectedState:rows.length>0&&rows.every(r=>r.matches)&&!unexpectedChanges.length,meaning:'Read-only expected-state comparison; not proof of authorization or execution by this batch.'};
}
module.exports={requiredDatasets,assessAdmin,compareNative,validateGraph,executionBlockers,validatePlanBundle,validateReadiness,rowAction,inspectSnapshotReferences,verifyAfterPlan};
