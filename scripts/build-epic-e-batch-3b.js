const fs = require('fs');
const crypto = require('crypto');
const {fields,technical,measurements,deferred} = require('./lib/epic-e-batch-3b-fields');
const read = p => JSON.parse(fs.readFileSync(p,'utf8'));
const write = (p,d) => fs.writeFileSync(p,JSON.stringify(d,null,2)+'\n');
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const registryPath = 'data/metafield-metaobject-definitions.json';
const registry = read(registryPath);
const corpus = read('data/epic-e-technical-source-index.json');
const extracted = read('data/epic-e-batch-3b-extracted-evidence.json');
const classification = read('data/epic-e-product-classification.json');
const identity = read('data/epic-e-product-identity.json');
const conflicts = read('data/epic-e-conflict-reference-index.json');
const snapshot = read(registry.adminReconciliation.snapshotPath);
const products = snapshot.datasets.products.records;
const variants = snapshot.datasets.variants.records;
const byGid = new Map(classification.mappings.map(p=>[p.productGid,p]));
const machines = identity.productIdentities.filter(p=>byGid.get(p.productGid).proposedProductClass==='machine');
// Established model aliases are explicit identity lookups, not family expansion.
const modelAliases = new Map(machines.map(p=>[p.existingRhinoModelDesignation,p.productGid]));
modelAliases.set('TrimMaster',modelAliases.get('TrimMaster 8'));
const sourceById = new Map(corpus.sources.map(s=>[s.sourceId,s]));
const counts = (rows,key,states) => Object.fromEntries(states.map(s=>[s,rows.filter(r=>r[key]===s).length]));
const stats = r => ({metafields:r.metafields.length,metaobjects:r.metaobjects.length,byOwnerType:counts(r.metafields,'ownerType',['PRODUCT','PRODUCTVARIANT','COLLECTION']),byDecisionState:counts([...r.metafields,...r.metaobjects],'decisionState',['approved','proposed','deprecated','blocked']),approvedLaunchRequired:[...r.metafields,...r.metaobjects].filter(d=>d.decisionState==='approved'&&d.requiredForLaunch).length,approvedWithTbdOwner:0});

// Explicit local registry maintenance only. Never emit an Admin payload or mutate values.
if (process.argv.includes('--update-registry')) {
  const previous = registry.statistics;
  for (const [i,spec] of fields.entries()) {
    const existing = registry.metafields.find(f=>f.key===spec.key&&f.namespace==='rhino');
    if (existing) continue; // Preserve authored governance on later builds.
    const field = structuredClone(registry.metafields[0]);
    Object.assign(field,{definitionId:`CD-MF-${String(i+10).padStart(3,'0')}`,key:spec.key,name:spec.key.replaceAll('_',' '),description:spec.description,type:spec.type,cardinality:spec.type.startsWith('list.')?'list':'one',sourcePbi:spec.sourcePbi,requiredForLaunch:false,usedForFiltering:false,definitionDependencies:['CD-MF-001']});
    const dependent = spec.key==='compatible_machines';
    const resource = spec.sourcePbi==='E-PBI-018B';
    field.applicability={entityType:'current_catalog_product',productClasses:dependent?['replacement_part','consumable','accessory']:resource||spec.key==='noncatalog_components'?['machine','replacement_part','consumable','accessory']:['machine'],requirement:'conditional',condition:spec.description};
    field.customDataJustification={purpose:spec.description,nativeFieldAssessment:'No native Product field expresses this exact technical state or governed reference. Shipping weight remains native Variant data.',duplicatesNativeField:false};
    field.evidence={authority:'data/epic-e-technical-source-index.json; docs/product/rhino-machine-specification-resolution-register.md; data/epic-e-batch-3b-contracts.json',evidenceOwners:resource?['Support','Technical','Media']:['Technical','Product Owner / Product Data']};
    field.ownership.operationalOwner=spec.sourcePbi==='E-PBI-011'?'Operations':resource?'Support':spec.key==='recommended_products'?'Product Owner / Product Data':'Technical';
    field.consumers={mvp:spec.sourcePbi==='E-PBI-011'?['F','J','K']:resource?['F','G','L','O']:['F','G','J','L','O'],postMvp:[]};
    if(spec.key==='support_files'||spec.physicalState==='crate_outer')field.accessIntent={admin:'merchant_read_write',storefront:'none',apiSurfaces:['admin']};
    field.validationRules=[{name:'batch_3b_contract',value:'data/epic-e-batch-3b-contracts.json',enforcement:'repository'},{name:'value_approval_separate',value:true,enforcement:'repository'}];
    if(spec.unit)field.validationRules.push({name:'canonical_unit',value:spec.unit,enforcement:'repository'});
    if(spec.allowedValues)field.validationRules.push({name:'choices',value:spec.allowedValues,enforcement:'shopify_definition'});
    field.allowedBehavior={allowedValues:spec.allowedValues,defaultValue:null,unknownOrConflictBehavior:'block_value_population'};
    field.migration={state:'new_definition',sourceDefinition:spec.sourcePbi==='E-PBI-010'?'PRODUCT:rhino.machine_specs':dependent?'PRODUCT:rhino.compatibility':null,replacementAuthorityPbi:null,replacementDefinitionId:null,coexistence:'Legacy observations stay in evidence until each fact/edge is separately approved; no blanket conversion.',valueMigrationRequired:false,rollbackConsiderations:'Preserve source provenance and any later before-state; removal of definitions with populated values requires E-PBI-019 review.'};
    field.cautions=['Definition architecture approval does not approve any Product values.','Repository validation and human value approval are mandatory before any later population.'];
    registry.metafields.push(field);
  }
  registry.metafields.find(f=>f.key==='compatibility').migration.replacementDefinitionId=registry.metafields.find(f=>f.key==='compatible_machines').definitionId;
  registry.metafields.find(f=>f.key==='machine_specs').migration.coexistence='Replace each JSON property through the explicit legacyMigration map in data/epic-e-batch-3b-contracts.json. Unmapped properties stay evidence-only; no blanket JSON migration.';
  registry.metafields.find(f=>f.key==='grit').cautions=['Future owner: Product Owner and Technical, Epic E abrasive attribute contract for the existing Epic G filter consumer. Grading standard and mixed-pack semantics remain unapproved; retain separate Products.'];
  for(const d of registry.plannedDomains)if(d.owningPbis.some(p=>fields.some(f=>f.sourcePbi===p))){d.definitionKeysApproved=true;d.decisionState='approved';d.notes='Batch 3B architecture approved under repository-only authorization; evidence values and human edge/resource decisions remain separate.';}
  registry.batchBoundary.nextPbiImplemented=true;
  registry.revision=2;
  registry.registryVersion='2026.09.08-epic-e-batch-3b';
  registry.approvedAt='2026-09-08';
  registry.generatedAt='2026-09-08T00:00:00.000Z';
  registry.statistics=stats(registry);
  write(registryPath,registry);
  if(!fs.existsSync('data/epic-e-batch-3b-registry-before.json'))write('data/epic-e-batch-3b-registry-before.json',{asOf:'2026-09-04',statistics:previous});
}

const evidencePaths=['data/epic-e-technical-source-index.json','data/epic-e-batch-3b-extracted-evidence.json','data/epic-e-product-identity.json','data/epic-e-product-classification.json','data/epic-e-variant-architecture.json','data/epic-e-conflict-reference-index.json','data/footer-support-resources.json',registry.adminReconciliation.snapshotPath];
const base={schemaVersion:1,generatedAt:'2026-09-08T00:00:00.000Z',inputs:evidencePaths.map(path=>({path,sha256:hash(path)})),mutationAuthorized:false};
const legacyMigration = {voltage:['input_voltage'],frequency:['input_frequencies'],motor_power:['motor_power'],motor_speed:['motor_speed'],speed_range:['wheel_speed_min','wheel_speed_max','flex_shaft_speed_min','flex_shaft_speed_max'],blade_size:['blade_diameter_min','blade_diameter_max'],wheel_size:['wheel_diameter'],arbor:['blade_arbor_diameter','wheel_arbor_diameter'],water_system:['water_system_type','water_reservoir_capacity'],dimensions:['assembled_length','assembled_width','assembled_height'],net_weight:['net_weight'],shipping_weight:['native:inventoryItem.measurement.weight']};
const contract={...base,$schema:'../schemas/epic-e-batch-3b-contracts.schema.json',phaseOrder:[['E-PBI-010','E-PBI-012','E-PBI-018B'],['E-PBI-011','E-PBI-013','E-PBI-014']],fields:fields.map(f=>({...f,definitionId:registry.metafields.find(d=>d.key===f.key)?.definitionId||null,definitionDecisionState:'approved',valueApprovalRequired:true})),deferred,legacyMigration,
  factPolicy:{authority:'E-PBI-001 source hierarchy; current engineering source plus Technical approval. Description HTML is lower-authority candidate evidence.',unknown:'absent; repository blocked record',conflicting:'preserve all original observations and conflict IDs; never serialize an approved value',variantScope:'requires exact current Variant GID and approved E-PBI-008 commerce distinction; no current machine Variant technical definitions',range:'endpoints must share source, configuration, physical state and unit; minimum <= maximum',unitConversion:'Retain source value/unit. Require confirmed US/Imperial gallons and horsepower standard before conversion; canonical formatting is never customer display text.'},
  compatibility:{direction:'dependent_product_to_machine_product',type:'list.product_reference',scope:'PRODUCT',variantException:'A Product assertion means all purchased variants fit. Saw Blade Size-specific evidence stays Variant-scoped in repository; no Product union and no Variant definition until exact fit is proven.',states:['approved','proposed','conflicting','blocked','not_compatible','deprecated','superseded'],proofKinds:['legacy_identifier_exact','explicit_description_statement','technical_document_exact'],unknown:'No evidence is blocked/unknown, never not_compatible.',negative:'not_compatible requires explicit negative evidence and owner approval; never serialize negative edges as positive references.',successor:'An exact approved successor mapping does not inherit fit. Reapprove each replacement edge with provenance.',orphans:'Missing target blocks publication and later population; preserve historical GID and source.',unpublished:'Retain support evidence but suppress customer links; do not redirect to an inferred successor.',duplicates:'Reject self references, duplicate scoped edges and machine-to-machine canonical fit.',reverse:'Derive only approved positive edges, sorted by target GID then dependent GID; no stored reciprocal copy.',forbiddenProof:['title','handle','tag','collection','family','recommendation','included_component']},
  measurements:{nativeShippingWeight:'PRODUCTVARIANT.inventoryItem.measurement.weight',states:[{state:'net',storage:'rhino.net_weight',truth:'durable',owner:'Technical / Operations'},{state:'assembled',storage:'rhino.assembled_length/width/height',truth:'durable',owner:'Technical'},{state:'operating_footprint',storage:null,truth:'durable',owner:'Technical'},{state:'packaged',storage:null,truth:'fulfillment_specific',owner:'Operations'},{state:'crate_outer',storage:'rhino.crate_length/width/height',truth:'fulfillment_specific',owner:'Operations'},{state:'shipping',storage:'native Variant weight',truth:'fulfillment_specific',owner:'Operations'},{state:'package_count',storage:null,truth:'fulfillment_specific',owner:'Operations'},{state:'multi_package',storage:null,truth:'fulfillment_specific',owner:'Operations'}],packageRecordShape:{required:['packageId','kind','length','width','height','sourceId','packingRevision','decisionState'],kind:['carton','crate','pallet'],dimensions:'typed positive dimension; outer package axes',count:'positive integer equal to records.length when count approved',weight:'no duplicate canonical package shipping weight; source observations only'},multiPackagePolicy:'No records without explicit package identity/count evidence. A singular crate heading does not prove package count. Actual order packing may differ and must not overwrite durable product facts.'},
  components:{meanings:['included','not_included','optional','recommended'],membership:'Catalog membership uses native Product reference lists; included_quantities is an exact-GID keyed positive integer companion map, not a second membership authority.',noncatalog:'Product-local JSON lines {label, quantity, meaning}; justified by counted EM-1 tools and explicit battery exclusion. Not a reusable component entity; never create placeholder Products/metaobjects.',approval:'Technical and Product Owner approve included/excluded/optional truth; Product Owner approves recommendations separately.',optionalConfiguration:'Unproven options such as C-018 remain repository evidence; do not create variants.',compatibility:'Never derive inclusion or recommendations from fit, or fit from inclusion/recommendations.'},
  resources:{metadataStorage:'Governed repository resource catalog keyed by sourceId and existing File GID. Native Files own binary identity; no duplicate canonical URL or new metaobject is needed.',types:['manual','diagram','instruction','video','support'],states:['candidate','current','obsolete','superseded'],visibility:['customer','support_only','internal'],currentGate:'Exact applicable Product, owner decision, rights/publication approval, version/language review and current status required. No newest-filename/upload-date heuristic.',supportOnly:'support_files access is Admin only; other references admit only approved customer-visible current resources.',supersession:'Preserve predecessor sourceId/File GID; require explicit successor link and prohibit cycles.',duplicates:'Exact hash groups are binary evidence, not canonical-version approval; probable video groups remain unconfirmed.',notInScope:'Warranty, repair promises and service contracts remain E-PBI-016.'}};
write('data/epic-e-batch-3b-contracts.json',contract);

// Preserve technical observations without resolving conflicts or transforming them into values.
const facts=corpus.factObservations.map(f=>({...f,productGid:modelAliases.get(f.candidateProductModel)||null,valueApproved:false}));
write('data/epic-e-technical-field-evidence.json',{...base,facts,conflictCoverage:conflicts.conflicts.map(c=>({...c,fieldKeys:fields.filter(f=>f.conflictIds.includes(c.conflictId)).map(f=>f.key),disposition:fields.some(f=>f.conflictIds.includes(c.conflictId))?'field_architecture_defined_value_blocked':'preserved_for_owning_domain'}))});

// Phase B depends on the deterministic Phase A contracts above.
const edges=[];
const addEdge=(dependent,target,evidence,blocking=null)=>{
  let edge=edges.find(e=>e.dependentProductGid===dependent&&e.targetMachineProductGid===target);
  if(!edge){edge={edgeId:`EDGE-${String(edges.length+1).padStart(3,'0')}`,dependentProductGid:dependent,targetMachineProductGid:target,targetModel:machines.find(m=>m.productGid===target)?.existingRhinoModelDesignation,scope:'PRODUCT',variantGid:null,state:blocking?'blocked':'proposed',evidence:[],confidence:'medium',decisionOwner:'Technical / Product Owner',approvalDecisionId:null,conflictIds:[],blocker:blocking};edges.push(edge);}
  edge.evidence.push(evidence);
  if(blocking){edge.state='blocked';edge.blocker=blocking;}
};
for(const v of identity.variantIdentities){
  if(byGid.get(v.productGid).proposedProductClass==='machine')continue;
  for(const legacy of v.skuCandidates.filter(c=>c.sourceRole==='legacy_order_or_part_number')){
    for(const row of extracted.workbookRows.filter(r=>r.cells.some(c=>c.value.trim()===legacy.value))){
      const rel=corpus.candidateRelationships.find(r=>r.relationshipType==='compatible_part_candidate'&&r.sourceIds.includes(row.sourceId));
      if(!rel)continue;
      addEdge(v.productGid,modelAliases.get(rel.targetMachineModel),{kind:'legacy_identifier_exact',sourceId:row.sourceId,location:`${row.sheet}!row ${row.row}`,revision:sourceById.get(row.sourceId).documentRevision,excerpt:row.cells.map(c=>`${c.cell}: ${c.value}`).join(' | '),legacyIdentifier:legacy.value,identityDecisionId:legacy.approvalDecisionId},v.skuRegistryState==='blocked'?'Current Product collapses size-specific technical items; resolve PO-E-012/PO-E-013 before any compatibility approval.':null);
    }
  }
}
// Read exact model mentions from actual description statements only. These remain lower-authority proposals.
const aliases=[['EM-1',/\bEM-1\b/i],['TrimMaster 8',/\bTrimMaster\b/i],['JadeMaster 14',/\bJadeMaster\b/i],['LapMaster 18',/(?:\b18["”' ]+LapMaster\b|\bLapMaster\s+18\b)/i],['LapMaster 12',/(?:\b12["”' ]+LapMaster\b|\bLapMaster\s+12\b)/i],['SawMaster 18',/\bSawMaster\s+18\b/i],['SawMaster 24',/\bSawMaster\s+24\b/i]];
for(const p of classification.mappings.filter(p=>p.proposedProductClass!=='machine')){
  const description=extracted.productDescriptions.find(d=>d.handle===p.handle);
  const body=description?.bodyHtml.replace(/<[^>]*>/g,' ').replace(/&[^;]+;/g,' ').replace(/\s+/g,' ').trim()||'';
  for(const [model,pattern] of aliases){
    const sentence=body.split(/(?<=[.!?])\s+/).find(s=>pattern.test(s)&&/\b(for|fit\w*|attach\w*|mount\w*|onto|used|using|on|cover\w*|secur\w*|operat\w*)\b/i.test(s));
    if(sentence)addEdge(p.productGid,modelAliases.get(model),{kind:'explicit_description_statement',sourceId:'catalog-description',location:`data/product-export/products.csv: ${p.handle}: Body (HTML)`,revision:'July export',excerpt:sentence,legacyIdentifier:null,identityDecisionId:null});
  }
}
for(const e of edges){
  e.supersededByEdgeId=null;
  const strong=e.evidence.some(x=>x.kind==='legacy_identifier_exact'&&x.identityDecisionId)&&e.state==='proposed';
  e.confidence=strong?'high':'medium';
  e.reviewReadiness=strong?'approval_ready_exact_legacy_identity':e.state==='blocked'?'identity_decision_required':'technical_confirmation_of_description_required';
  const target=products.find(p=>p.id===e.targetMachineProductGid);
  const published=Boolean(target?.publishedAt)&&Boolean(target?.resourcePublicationsV2?.nodes.some(p=>p.isPublished));
  e.targetAvailability={status:target?.status||'MISSING',published,customerEligible:target?.status==='ACTIVE'&&published};
}
const coverage=classification.mappings.filter(p=>p.proposedProductClass!=='machine').map(p=>({productGid:p.productGid,handle:p.handle,productClass:p.proposedProductClass,edgeIds:edges.filter(e=>e.dependentProductGid===p.productGid).map(e=>e.edgeId),state:edges.some(e=>e.dependentProductGid===p.productGid&&e.state==='proposed')?'proposed':'blocked',blocker:edges.some(e=>e.dependentProductGid===p.productGid)?'Owner fit approval required.':'No exact current model/part association established; no negative fit inference.'}));
const familyCoverage=machines.map(m=>({productGid:m.productGid,model:m.existingRhinoModelDesignation,family:m.machineFamilyKey,candidateEdges:edges.filter(e=>e.targetMachineProductGid===m.productGid).length,approvedEdges:0}));
write('data/epic-e-relationship-matrix.json',{...base,coverage,edges,familyCoverage,unresolvedDocumentGroups:corpus.candidateRelationships.filter(r=>!r.relationshipType.includes('compatible_part')).map(r=>({...r,disposition:r.relationshipType==='component_candidate'?'E-PBI-014 only; no fit inference':'Requires exact catalog mount/size evidence; do not match Product titles.'})),statistics:{dependentProducts:coverage.length,productsWithCandidates:coverage.filter(p=>p.edgeIds.length).length,productsWithoutCandidates:coverage.filter(p=>!p.edgeIds.length).length,edges:edges.length,byState:counts(edges,'state',contract.compatibility.states)}});

const packingSource=corpus.sources.find(s=>s.sourceId==='repo-maki-na-palet-o-lc-u-leri-ve-ag-irliklari1-xlsx');
const packingAliases={"LAPMASTER 12''":'LapMaster 12',"BEADMASTER 6''":'BeadMaster 6',"SHAPEMASTER 6''":'ShapeMaster 6',"TRIMMASTER 8''":'TrimMaster 8',"LAPMASTER 18''":'LapMaster 18',"SAWMASTER 18''":'SawMaster 18',"SAWMASTER 24''":'SawMaster 24',"SAWMASTER 36''":'SawMaster 36',"JADE 14''":'JadeMaster 14'};
const packingObservations=extracted.workbookRows.filter(r=>r.sourceId===packingSource.sourceId&&r.row>2).map(r=>({sourceId:r.sourceId,location:`${r.sheet}!row ${r.row}`,productGid:modelAliases.get(packingAliases[r.cells.find(c=>c.cell.startsWith('B'))?.value.trim()])||null,rawCells:r.cells,physicalColumns:{C:'assembled',D:'crate_outer',E:'net',F:'shipping_observation_only',G:'tank_capacity'},state:'blocked',blocker:'Operations must confirm packing revision, physical axes and current sellable package; all original source cells preserved.'}));
const measurementCoverage=products.map(p=>({productGid:p.id,handle:p.handle,productClass:byGid.get(p.id).proposedProductClass,variantGids:variants.filter(v=>v.product.id===p.id).map(v=>v.id),factIds:facts.filter(f=>f.productGid===p.id&&['machine_dimensions','net_weight'].includes(f.domain)).map(f=>f.factId),packingLocations:packingObservations.filter(r=>r.productGid===p.id).map(r=>r.location),missingApprovedStates:['net','assembled','operating_footprint','packaged','crate_outer','package_count','multi_package'],packages:[]}));
for(const row of measurementCoverage){
  const body=extracted.productDescriptions.find(d=>d.handle===row.handle)?.bodyHtml.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()||'';
  row.descriptionMeasurementExcerpts=body.split(/(?<=[.!?])\s+/).filter(s=>/\d/.test(s)&&/\b(weight|weigh\w*|pound|lbs?|inch|dimension|long|wide|height|width|length)\b/i.test(s)).map(excerpt=>({excerpt,sourceLocation:`products.csv: ${row.handle}: Body (HTML)`,physicalState:'unspecified_lower_authority'}));
  row.missingEvidenceStates=['operating_footprint','packaged','package_count','multi_package'];
  if(!row.packingLocations.length)row.missingEvidenceStates.push('crate_outer');
  if(!row.packingLocations.length&&!row.factIds.some(id=>facts.find(f=>f.factId===id)?.domain==='net_weight'))row.missingEvidenceStates.push('net');
  if(!row.packingLocations.length&&!row.factIds.some(id=>facts.find(f=>f.factId===id)?.domain==='machine_dimensions'))row.missingEvidenceStates.push('assembled');
}
const weights=variants.map(v=>({variantGid:v.id,productGid:v.product.id,weight:v.inventoryItem?.measurement?.weight||null,state:Number(v.inventoryItem?.measurement?.weight?.value)>0?'observed_positive':'blocked_missing_or_zero',approvedByBatch:false}));
write('data/epic-e-measurement-evidence.json',{...base,packingObservations,coverage:measurementCoverage,nativeShippingWeights:weights,statistics:{products:products.length,variants:variants.length,positiveNativeWeights:weights.filter(w=>w.state==='observed_positive').length,missingNativeWeights:weights.filter(w=>w.state==='blocked_missing_or_zero').length,productsWithPackingObservations:measurementCoverage.filter(p=>p.packingLocations.length).length,approvedCustomMeasurements:0,packageRecords:0}});

const em=extracted.productDescriptions.find(d=>d.handle==='em-1');
const includedText=em.bodyHtml.split('Included with purchase:')[1];
const componentLines=[...includedText.matchAll(/<p>(.*?)<\/p>/gs)].map((m,i)=>({lineId:`EM1-${String(i+1).padStart(2,'0')}`,productGid:modelAliases.get('EM-1'),componentProductGid:null,label:m[1].replace(/<[^>]*>/g,''),quantity:null,meaning:'included',state:'conflicting',sourceId:'catalog-description',location:'em-1 Body (HTML): Included with purchase',conflictIds:['C-040'],approvalDecisionId:null,blocker:'Candidate BOM line; exact catalog identity, quantity and current manual/sales-list discrepancy require approval.'}));
const exactComponentCandidates={'EM1-02':'bonded-diamond-wheel-220','EM1-03':'resin-diamond-wheel-280','EM1-04':'resin-diamond-wheel-600','EM1-05':'resin-diamond-wheel-1200','EM1-06':'resin-diamond-wheel-3000'};
for(const line of componentLines){
  if(exactComponentCandidates[line.lineId])line.componentProductGid=products.find(p=>p.handle===exactComponentCandidates[line.lineId]).id;
  const count=line.label.match(/^x(\d+)\s/i);
  if(count)line.quantity=Number(count[1]);
}
componentLines[0].blocker='Catalog BOM says 60 grit, while the current catalog Product is 80 grit. Do not substitute it; resolve C-040 against the manual and sales list.';
const battery=classification.mappings.find(p=>p.handle==='magnifying-glass-arm');
componentLines.push({lineId:'BATTERY-EXCLUSION',productGid:battery.productGid,componentProductGid:null,label:'Batteries',quantity:null,meaning:'not_included',state:'proposed',sourceId:'catalog-description',location:'magnifying-glass-arm Body (HTML): Batteries not included',conflictIds:[],approvalDecisionId:null,blocker:'Explicit noncatalog exclusion; quantity unspecified, never fabricate a component Product.'});
write('data/epic-e-component-evidence.json',{...base,lines:componentLines,corpusObservations:facts.filter(f=>f.domain==='included_components'),optionalConfigurationConflicts:conflicts.conflicts.filter(c=>['C-018','C-019','C-022','C-027','C-032'].includes(c.conflictId)),recommendations:[],statistics:{candidateLines:componentLines.length,approved:0,conflicting:componentLines.filter(l=>l.state==='conflicting').length,recommendations:0},decision:'C-040: compare manual six-wheel BOM, sales list that says six but lists five, and catalog six grit lines; approve current purchased contents and map exact component Products/quantities. Recommendations require separate Product Owner decisions.'});

const resourceRows=corpus.sources.map(s=>({resourceId:s.sourceId,fileGid:s.shopifyFileGid,sourceId:s.sourceId,resourceType:s.evidenceClass==='manual'?'manual':/diagram|drawing/.test(s.evidenceClass)?'diagram':s.evidenceClass==='video'?'video':'support',revision:s.documentRevision,language:null,status:'candidate',supersededBy:null,canonical:false,candidateProductGids:[...new Set(facts.filter(f=>f.sourceIds.includes(s.sourceId)&&f.productGid).map(f=>f.productGid))],associationBasis:facts.some(f=>f.sourceIds.includes(s.sourceId))?'content_observation':'metadata_only_no_exact_product_assignment',candidateModelLabel:s.candidateProductModel,owner:'Support / Technical / Media',rights:s.rightsState,publicationApproved:false,visibility:s.rightsState==='internal_or_restricted'?'internal':'support_only',approvalDecisionId:null,contentHash:s.contentHash,duplicateGroup:s.duplicateGroup,sourceRole:'evidence_only',blocker:!s.shopifyFileGid?'Repository source has no proven Shopify File identity; no upload authorized.':'Canonical version, rights, language and exact model applicability require owner approval.'}));
for(const r of resourceRows)r.videoReadiness={posterFileGid:null,captions:r.resourceType==='video'?'unknown':'not_applicable',transcript:r.resourceType==='video'?'unknown':'not_applicable',performance:r.resourceType==='video'?'not_assessed':'not_applicable'};
const pageReconciliation=read('data/footer-support-resources.json').resources.filter(r=>r.category==='manual').map(r=>({resourceRegisterId:r.id,existingRoute:r.intendedDestination,existingTechnicalApproval:r.technicalApproval,existingGlobalVisibility:r.safeForGlobalNavigation,blockers:r.blockers,fileIdentityApproved:false,disposition:'Existing page visibility is preserved as evidence. Page approval does not identify or approve a canonical File/version.'}));
const duplicateGroups=[...new Set(resourceRows.map(r=>r.duplicateGroup).filter(Boolean))].map(group=>({group,resourceIds:resourceRows.filter(r=>r.duplicateGroup===group).map(r=>r.resourceId),evidenceQuality:group.startsWith('DOC-EXACT')?'audited_exact_duplicate':'probable_not_hash_confirmed',canonicalChosen:false}));
const hashGroups=[...new Set(resourceRows.map(r=>r.contentHash).filter(Boolean))].map(hash=>({hash,resourceIds:resourceRows.filter(r=>r.contentHash===hash).map(r=>r.resourceId)})).filter(g=>g.resourceIds.length>1);
write('data/epic-e-resource-catalog.json',{...base,resources:resourceRows,duplicateGroups,hashGroups,pageReconciliation,statistics:{indexed:resourceRows.length,existingFileIdentities:resourceRows.filter(r=>r.fileGid).length,contentAssociatedCandidates:resourceRows.filter(r=>r.candidateProductGids.length).length,canonicalApproved:0,duplicateGroups:duplicateGroups.length,hashDuplicateGroups:hashGroups.length},productReferences:[]});

const grit=products.filter(p=>/grit/i.test(p.title+' '+(extracted.productDescriptions.find(d=>d.handle===p.handle)?.bodyHtml||''))).map(p=>({productGid:p.id,handle:p.handle,observedGritTokens:[...new Set([...(p.title+' '+(extracted.productDescriptions.find(d=>d.handle===p.handle)?.bodyHtml||'')).matchAll(/\b(\d+)\s*grit\b/gi)].map(m=>m[1]))],state:byGid.get(p.id).proposedProductClass==='consumable'?'proposed':'excluded_component_mentions_only',gradingStandard:null,scope:'PRODUCT',variantRestructureAuthorized:false}));
const decisions=[
 {id:'B3B-D01',rank:1,owners:['Technical','Product Owner'],question:'Resolve the existing Automatic Feed Clamp and Saw Vice Plate Set size-specific identities (PO-E-012 / PO-E-013). Which technical item does each current Product sell?',rows:coverage.filter(p=>['automatic-feed-clamp','saw-vice-plate-set'].includes(p.handle)).map(p=>p.productGid),impact:'SKU identity and any fit edge for these Products remain blocked.'},
 {id:'B3B-D02',rank:2,owners:['Technical'],question:'Approve or reject the exact legacy-identifier edges, then review the lower-authority explicit description edges by model; supply evidence only for the remaining unknowns.',rows:edges.map(e=>e.edgeId),impact:'E-PBI-013 requires actual owner review; no generated edge is owner-approved.',unknownProductGids:coverage.filter(p=>!p.edgeIds.length).map(p=>p.productGid)},
 {id:'B3B-D03',rank:3,owners:['Technical'],question:'Resolve current electrical/motor/tool-speed/mount/reservoir facts in the existing conflict register. Confirm horsepower and gallon conventions; do not invent machine configurations.',rows:[...new Set(technical.flatMap(f=>f.conflictIds))],impact:'Typed architecture is ready; technical values remain blocked.'},
 {id:'B3B-D04',rank:4,owners:['Technical','Product Owner'],question:'Resolve C-040 EM-1 current BOM, exact catalog component identities and quantities against manual, sales list and description. Confirm optional commercial contents separately.',rows:['C-040',...componentLines.map(l=>l.lineId)],impact:'Included contents and recommendations cannot be populated from compatibility.'},
 {id:'B3B-D05',rank:5,owners:['Operations','Technical'],question:'Confirm net/assembled/crate physical states, axes and packing revision; supply actual missing native shipping weights and package counts. Multi-package records require direct evidence.',rows:weights.filter(w=>w.state==='blocked_missing_or_zero').map(w=>w.variantGid),impact:'44 native weights and all custom measurement approvals remain outstanding; packing evidence is already extracted by cell.'},
 {id:'B3B-D06',rank:6,owners:['Support','Technical','Media','Legal/Business'],question:'Choose current canonical File/version per exact model and resource type, confirm language and rights/publication. Review duplicate groups; select no winner by upload date.',rows:resourceRows.filter(r=>r.fileGid).map(r=>r.resourceId),impact:'No customer download reference is approved. Internal sources remain restricted.'},
 {id:'B3B-D07',rank:7,owners:['Product Owner','Technical'],question:'For the future abrasive attribute contract, approve grading standard and mixed-grit/pack semantics for the existing G filter consumer.',rows:grit.map(g=>g.productGid),impact:'Legacy grit stays proposed; current separate Products remain unchanged.'}
];
write('data/epic-e-batch-3b-decision-packet.json',{...base,decisions:decisions.map(d=>({...d,state:'pending',approval:null})),grit,status:{'E-PBI-010':'architecture_complete','E-PBI-011':'architecture_complete','E-PBI-012':'architecture_complete','E-PBI-013':'evidence_complete_human_blocked','E-PBI-014':'architecture_complete_values_blocked','E-PBI-018B':'architecture_complete_resources_blocked'}});
console.log(`Batch 3B: ${fields.length} field contracts; ${coverage.length} dependent Products; ${edges.length} candidate edges; ${resourceRows.length} evidence resources. No values approved or mutations authorized.`);
