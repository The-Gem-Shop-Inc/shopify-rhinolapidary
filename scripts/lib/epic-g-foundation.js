'use strict';
// G consumes E/F authority. No graph, approvals, commerce policy or runtime Liquid is written here.
const fs=require('node:fs'),assert=require('node:assert/strict');
const E=require('./epic-e-owner-response-adapter'),F=require('./epic-f-consumer');
const {freshness}=require('./epic-e-batch-3c'),{compareNative}=require('./epic-e-readiness');
const {paginationProblems}=require('./epic-g-admin-read');
const PRODUCT=/^gid:\/\/shopify\/Product\/[0-9]+$/,VARIANT=/^gid:\/\/shopify\/ProductVariant\/[0-9]+$/;
const G_CLASSES=['replacement_part','consumable','accessory'],CLASSES=['machine',...G_CLASSES];
const RELATIONS={compatible:'compatible_machines',included:'included_products',optional:'optional_products',recommended:'recommended_products'};
const RESOURCE_KEYS=['manual_files','diagram_files','instruction_files','video_files','support_files'];
const ATTRIBUTE_KEYS=['grit','diameter','arbor_mount','blade_type','wheel_type'];
const privateAuthorities=new WeakMap();
const sorted=a=>[...new Set(a)].sort(),same=(a,b)=>E.digest(a)===E.digest(b),referenceSet=a=>Array.isArray(a)?[...a].sort():null;
const field=(p,key)=>(p?.metafields?.nodes||[]).filter(m=>m.namespace==='rhino'&&m.key===key);
const published=p=>!!(p&&p.status==='ACTIVE'&&p.publishedAt&&p.resourcePublicationsV2?.nodes?.some(r=>r.publication?.name==='Online Store'&&r.isPublished===true));
const ref=path=>({path,sha256:E.hash(fs.readFileSync(path))});
function seal(data){const token=Object.freeze({fixtureOnly:data.fixtureOnly});privateAuthorities.set(token,data);return token;}
function loadAuthority() {
 const D=require('./epic-e-final-owner-delta'),H=require('./epic-f-final-owner-binding'),R=require('./epic-f-customer-release');
 const provenance=[],errors=[];let receipt=null,state=null,release=null,shop=null,binding=null;
 const add=path=>{provenance.push(ref(path));return E.read(path);};
 try {
  receipt=add(D.RECEIPT);binding=add(H.BINDING);
  if(Date.now()>=Date.parse(receipt.reconciledAt)&&Date.now()<Date.parse(receipt.expiresAt))H.verify();
  const {bindingSha256,...body}=binding;assert.equal(E.hash(JSON.stringify(body)),bindingSha256,'Binding digest');
  // Verify immutable evidence even after expiry. This historical-time integrity check
  // grants no present eligibility; every evaluation below separately checks current time.
  for(const r of [...binding.provenance,...binding.sourceAfter,...binding.runtimeDelta,...binding.qaDelta])assert.equal(E.hash(fs.readFileSync(r.path)),r.sha256,'Bound source drift');
  state=D.loadCurrent(receipt.reconciledAt);
  release=add(R.RELEASE);const compiled=R.compile(state);
  assert.deepEqual(compiled.release,release,'Customer grant/source drift');
  assert.equal(fs.readFileSync(R.FACT,'utf8'),compiled.facts);assert.equal(fs.readFileSync(R.CONTEXT,'utf8'),compiled.context);
  for(const [path,body]of Object.entries(compiled.shards))assert.equal(fs.readFileSync(path,'utf8'),body);
  shop=add(receipt.after.path).shop;
  provenance.push(...receipt.refs);
 }catch(error){errors.push('SOURCE_INTEGRITY_FAILED');}
 const classes={classification:add('data/epic-e-product-classification.json'),identity:add('data/epic-e-product-identity.json'),decisions:add('data/epic-e-product-owner-decisions.json')};
 return seal({fixtureOnly:false,classes,receipt,release,shop,binding,errors,provenance:[...new Map(provenance.map(r=>[r.path,r])).values()],
  rows:state?.input.rows||[],holds:state?.input.holds||[],sourceProducts:state?.products||[],rowApproved:row=>!!state?.input.rows.some(r=>same(r,row)),receiptPath:D.RECEIPT});
}
function fixtureAuthority(data) {
 assert.equal(data.fixtureOnly,true,'Fixtures cannot authorize live consumers');
 assert(data.rows.every(r=>String(r.approvalDecisionId).startsWith('fixture:')),'Only fixture approval identifiers');
 return seal({...structuredClone(data),rowApproved:r=>r.valueState==='approved'&&!r.conflictIds?.length,provenance:[],errors:[],receiptPath:'fixture:receipt'});
}
function getAuthority(token,envelope) {
 const a=privateAuthorities.get(token);
 if(!a)return {errors:['AUTHORITY_UNVERIFIED'],rows:[],sourceProducts:[],provenance:[]};
 if(a.fixtureOnly&&envelope.sourceKind!=='fixture')return {...a,errors:['FIXTURE_AUTHORITY_ON_LIVE_DATA']};
 return a;
}
function sourceState(a,envelope,asOf) {
 const reasons=[...(a.errors||[])],now=Date.parse(asOf),receipt=a.receipt;
 if(!receipt||!Number.isFinite(Date.parse(receipt.reconciledAt))||!Number.isFinite(Date.parse(receipt.expiresAt))||Date.parse(receipt.expiresAt)<=Date.parse(receipt.reconciledAt))reasons.push('RECEIPT_INVALID');
 else if(!Number.isFinite(now)||now<Date.parse(receipt.reconciledAt))reasons.push('RECEIPT_NOT_YET_VALID');
 else if(now>=Date.parse(receipt.expiresAt))reasons.push('RECEIPT_EXPIRED');
 for(const r of a.provenance||[]){try{if(E.hash(fs.readFileSync(r.path))!==r.sha256)reasons.push('SOURCE_DRIFT');}catch{reasons.push('SOURCE_DRIFT');}}
 const age=freshness(envelope.snapshot||{},asOf);
 if(age.state!=='within_seven_day_window'||now>=Date.parse(age.expiresAt))reasons.push('ADMIN_OBSERVATION_STALE');
 reasons.push(...paginationProblems(envelope));
 if(envelope.recordedConnectorLog){try{const r=envelope.recordedConnectorLog,log=E.read(r.path);if(E.hash(fs.readFileSync(r.path))!==r.sha256||
  !same(log.operations,envelope.operations)||!same(log.shop,envelope.shop)||log.startedAt!==envelope.startedAt||log.completedAt!==envelope.completedAt)reasons.push('ADMIN_READ_PROVENANCE_DRIFT');}catch{reasons.push('ADMIN_READ_PROVENANCE_DRIFT');}}
 if(!same(a.shop,envelope.shop)||envelope.snapshot?.shopDomain!==a.shop?.myshopifyDomain)reasons.push('WRONG_SHOP');
 if(!['live_admin','fixture'].includes(envelope.sourceKind)||envelope.sourceKind!==envelope.snapshot?.sourceKind)reasons.push('ADMIN_SOURCE_KIND_INVALID');
 return {reasons:sorted(reasons),current:!reasons.length,receiptPath:a.receiptPath||null,reconciledAt:receipt?.reconciledAt||null,expiresAt:receipt?.expiresAt||null,
  snapshotCapturedAt:envelope.snapshot?.capturedAt||null,snapshotExpiresAt:age.expiresAt,checkedAt:asOf,fixtureOnly:!!a.fixtureOnly,
  bindingSha256:a.binding?.bindingSha256||null,provenance:a.provenance};
}
function productRole(a,p) {
 const reasons=[],id=p?.id,approved=PRODUCT.test(id||'')&&a.classes?F.classification(a.classes,id):null,ms=field(p,'product_class');
 if(!PRODUCT.test(id||''))reasons.push('PRODUCT_ID_INVALID');
 if(!approved||!CLASSES.includes(approved))reasons.push('PRODUCT_IDENTITY_OR_CLASS_UNAPPROVED');
 const identity=a.classes?.identity.productIdentities.find(r=>r.productGid===id);
 if(identity&&identity.handle!==p.handle)reasons.push('PRODUCT_HANDLE_CHANGED');
 if(ms.length!==1||ms[0]?.type!=='single_line_text_field')reasons.push('CLASS_VALUE_INVALID');
 else if(ms[0].jsonValue!==approved)reasons.push('CLASS_CHANGED');
 const prior=a.sourceProducts.find(r=>r.id===id),before=field(prior,'product_class')[0];
 if(before?.definition?.id&&ms[0]?.definition?.id!==before.definition.id)reasons.push('CLASS_DEFINITION_CHANGED');
 return {productGid:id,approvedClass:approved,observedClass:ms[0]?.jsonValue??null,reasons:sorted(reasons),valid:!reasons.length};
}
function variantMembershipErrors(a,p,variants){
 const expected=(a.classes?.identity.variantIdentities||[]).filter(v=>v.productGid===p.id).map(v=>v.variantGid),actual=variants.filter(v=>v.product?.id===p.id).map(v=>v.id);
 return same(referenceSet(expected),referenceSet(actual))?[]:['VARIANT_MEMBERSHIP_CHANGED'];
}
function relationship(a,p,role,products,variants,source) {
 const key='compatible_machines',ms=field(p,key),rows=a.rows.filter(r=>r.targetGid===p.id&&r.domain==='compatibility'&&r.field==='PRODUCT.metafields.rhino.'+key);
 const row=rows.length===1?rows[0]:null,reasons=[...source.reasons,...role.reasons];
 const grants=a.release?.grants?.filter(r=>r.productGid===p.id&&r.domain==='compatibility'&&r.field==='PRODUCT.metafields.rhino.'+key)||[];
 let approved=!!(row&&row.valueState==='approved'&&a.rowApproved(row)&&row.type==='list.product_reference'&&Array.isArray(row.desired)&&row.desired.length&&
  grants.length===1&&same(grants[0].desired,row.desired)&&grants[0].rowId===row.rowId&&grants[0].approvalDecisionId===row.approvalDecisionId);
 if(!row)reasons.push(grants.length?'APPROVAL_REVOKED':'APPROVAL_MISSING');
 else if(!approved)reasons.push('APPROVAL_REVOKED');
 if(rows.length>1)reasons.push('APPROVAL_DUPLICATE');
 if(!G_CLASSES.includes(role.approvedClass))reasons.push('COMPATIBILITY_SOURCE_CLASS_UNSUPPORTED');
 if((a.holds||[]).some(h=>h.productGid===p.id&&h.field===key)){approved=false;reasons.push('RELATIONSHIP_BLOCKED_BY_SOURCE');}
 const m=ms.length===1?ms[0]:null,values=m?.jsonValue;
 if(ms.length>1)reasons.push('COMPATIBILITY_FIELD_DUPLICATE');
 if(!m)reasons.push('RELATIONSHIP_VALUE_ABSENT');
 else if(m.type!=='list.product_reference'||!Array.isArray(values))reasons.push('RELATIONSHIP_TYPE_UNSUPPORTED');
 if(Array.isArray(values)){
  if(new Set(values).size!==values.length)reasons.push('REFERENCE_DUPLICATE');
  if(values.some(v=>typeof v!=='string'||!PRODUCT.test(v)))reasons.push('REFERENCE_ID_UNSUPPORTED');
  if(row&&!same(referenceSet(values),referenceSet(row.desired)))reasons.push('REFERENCE_LIST_CHANGED');
 }
 const proof=a.receipt?.proof?.rows?.find(r=>r.rowId===row?.rowId);
 if(row&&(!proof||proof.desiredDigest!==E.digest(row.desired)||proof.metafieldGid!==m?.id||proof.definitionGid!==m?.definition?.id))reasons.push('RECONCILIATION_PROOF_MISMATCH');
 const targets=(Array.isArray(values)?sorted(values.filter(v=>typeof v==='string')):[]).map(id=>{
  const target=products.find(p=>p.id===id),tr=[],known=!!a.classes?.identity.productIdentities.some(p=>p.productGid===id);
  if(!known)tr.push('REFERENCE_UNKNOWN');
  if(!target)tr.push('REFERENCE_ORPHAN');
  const targetRole=target?productRole(a,target):null;
  if(targetRole){tr.push(...targetRole.reasons,...variantMembershipErrors(a,target,variants));if(targetRole.approvedClass!=='machine')tr.push('TARGET_CLASS_UNSUPPORTED');}
  return {productGid:id,handle:target?.handle||null,title:target?.title||null,known,present:!!target,technicalReasons:sorted(tr),published:published(target)};
 });
 for(const t of targets)reasons.push(...t.technicalReasons);
 const dataEligible=approved&&reasons.length===0,sourcePublished=published(p);
 const customerTargets=targets.map(t=>{const r=[...reasons,...t.technicalReasons];if(!sourcePublished)r.push('SOURCE_NOT_PUBLISHED');if(!t.published)r.push('TARGET_NOT_PUBLISHED');return {...t,approved,eligible:dataEligible&&sourcePublished&&t.published,reasons:sorted(r)};});
 return {meaning:'compatible',field:'rhino.'+key,sourceApproved:approved,liveReferenceList:values??null,approvedReferenceList:row?.desired??null,
  dataEligible,customerEligible:customerTargets.some(t=>t.eligible),reasons:sorted(reasons),targets:customerTargets,
  provenance:row?{rowId:row.rowId,approvalDecisionId:row.approvalDecisionId,ownerDecisionId:row.ownerDecisionId,receiptPath:a.receiptPath,metafieldGid:proof?.metafieldGid||null}:null};
}
function evaluateProduct(a,p,products,variants,source) {
 const role=productRole(a,p),vs=variants.filter(v=>v.product?.id===p.id),variantRoles=vs.map(v=>{
  const known=a.classes?.identity.variantIdentities.filter(r=>r.variantGid===v.id&&r.productGid===p.id)||[];
  return {variantGid:v.id,valid:VARIANT.test(v.id)&&known.length===1,reasons:VARIANT.test(v.id)&&known.length===1?[]:['VARIANT_IDENTITY_UNAPPROVED']};
 });
 const issues=sorted([...role.reasons,...variantMembershipErrors(a,p,variants),...(!vs.length?['PRODUCT_VARIANTS_ABSENT']:[]),...variantRoles.flatMap(v=>v.reasons)]);
 const compatibility=relationship(a,p,{...role,reasons:issues},products,variants,source);
 const gRoleEligible=role.valid&&G_CLASSES.includes(role.approvedClass)&&source.current&&issues.length===0;
 return {...role,published:published(p),gRoleEligible,customerProductEligible:gRoleEligible&&published(p),
  consumerReasons:sorted([...source.reasons,...issues]),variants:variantRoles,compatibility,
  relationships:Object.fromEntries(Object.entries(RELATIONS).map(([meaning,key])=>[meaning,{field:'rhino.'+key,observed:field(p,key)[0]?.jsonValue??null,grantsFitAuthority:meaning==='compatible'}])),
  optionalAbsences:{skuVariantGids:vs.filter(v=>!v.sku?.trim()).map(v=>v.id),media:!p.media?.nodes?.length,description:!p.descriptionHtml?.trim(),
   itemAttributes:ATTRIBUTE_KEYS.filter(k=>!field(p,k).length),resources:RESOURCE_KEYS.filter(k=>!field(p,k).length)},
  nativeCommerce:{action:'PRESERVE_NATIVE_SHOPIFY',disabledByG:false,adminVariantObservations:vs.map(v=>({variantGid:v.id,sku:v.sku,price:v.price,
   inventoryQuantity:v.inventoryQuantity??null,inventoryTracked:v.inventoryItem?.tracked??null,inventoryPolicy:v.inventoryPolicy,aggregateAvailable:v.availableForSale??null})),
   qualification:'Aggregate inventory/availability is observation, not a storefront purchase or fulfillment decision.'}};
}
function nativeSnapshot(products,variants){return {datasets:{products:{queryStatus:'success',records:products},variants:{queryStatus:'success',records:variants}}};}
function assess(token,envelope,{asOf=new Date().toISOString(),baseline=null}={}) {
 const a=getAuthority(token,envelope),source=sourceState(a,envelope,asOf),products=envelope.snapshot?.datasets?.products?.records||[],variants=envelope.snapshot?.datasets?.variants?.records||[];
 const productRows=products.map(p=>evaluateProduct(a,p,products,variants,source));
 // Invalid/orphan Variants must be accounted for even when they cannot join a Product.
 const identityProblems=variants.filter(v=>!VARIANT.test(v.id)||!products.some(p=>p.id===v.product?.id)||!a.classes?.identity.variantIdentities.some(x=>x.variantGid===v.id&&x.productGid===v.product?.id)).map(v=>({variantGid:v.id,productGid:v.product?.id??null,reason:'VARIANT_IDENTITY_UNAPPROVED'}));
 const g=productRows.filter(p=>G_CLASSES.includes(p.approvedClass)),approvedRows=a.rows.filter(r=>r.domain==='compatibility'&&r.valueState==='approved'&&a.rowApproved?.(r));
 const currentVariants=new Map(variants.map(v=>[v.id,v])),counts={products:products.length,variants:variants.length,gProducts:g.length,gVariants:g.reduce((n,p)=>n+p.variants.length,0),
  approvedCompatibilityValues:approvedRows.length,approvedEdges:approvedRows.reduce((n,r)=>n+(Array.isArray(r.desired)?r.desired.length:0),0),
  dataEligibleValues:g.filter(p=>p.compatibility.dataEligible).length,customerEdges:g.reduce((n,p)=>n+p.compatibility.targets.filter(t=>t.eligible).length,0),
  approvedUnpublishedTargetEdges:g.reduce((n,p)=>n+p.compatibility.targets.filter(t=>p.compatibility.dataEligible&&!t.published).length,0),
  productsWithoutApprovedCompatibility:g.filter(p=>!p.compatibility.sourceApproved).length,
  missingGSkus:g.reduce((n,p)=>n+p.optionalAbsences.skuVariantGids.length,0),missingGMedia:g.filter(p=>p.optionalAbsences.media).length,missingGDescriptions:g.filter(p=>p.optionalAbsences.description).length,
  zeroPricedGVariants:g.flatMap(p=>p.variants).filter(v=>Number(currentVariants.get(v.variantGid)?.price)===0).length};
 const byClass=Object.fromEntries(CLASSES.map(c=>{const ps=productRows.filter(p=>p.approvedClass===c);return[c,{products:ps.length,variants:ps.reduce((n,p)=>n+p.variants.length,0),gRoleEligible:ps.filter(p=>p.gRoleEligible).length,published:ps.filter(p=>p.published).length}];}));
 const beforeVariants=a.sourceProducts.flatMap(p=>(p.variants?.nodes||[]).map(v=>({...v,product:{id:p.id,handle:p.handle}})));
 const nativeDrift=compareNative(nativeSnapshot(a.sourceProducts,beforeVariants),nativeSnapshot(products,variants));
 const publicationDrift=products.filter(p=>{const q=a.sourceProducts.find(r=>r.id===p.id);return !q||q.status!==p.status||q.publishedAt!==p.publishedAt;}).map(p=>({productGid:p.id,status:p.status,publishedAt:p.publishedAt}));
 const referenceDrift=productRows.filter(p=>p.compatibility.reasons.some(r=>['REFERENCE_LIST_CHANGED','RECONCILIATION_PROOF_MISMATCH','RELATIONSHIP_TYPE_UNSUPPORTED','REFERENCE_DUPLICATE'].includes(r))||
  (p.compatibility.sourceApproved&&p.compatibility.liveReferenceList===null)||
  (!p.compatibility.sourceApproved&&p.compatibility.liveReferenceList!==null)).map(p=>({productGid:p.productGid,reasons:p.compatibility.reasons}));
 const expectedIds=new Set(a.sourceProducts.map(p=>p.id)),currentIds=new Set(products.map(p=>p.id));
 const missingProducts=[...expectedIds].filter(id=>!currentIds.has(id)),unknownProducts=products.filter(p=>!expectedIds.has(p.id)).map(p=>p.id);
 const missingVariants=beforeVariants.filter(v=>!currentVariants.has(v.id)).map(v=>v.id);
 const sourceClassErrors=productRows.filter(p=>!p.valid).map(p=>({productGid:p.productGid,reasons:p.reasons}));
 const classCoverageComplete=sourceClassErrors.length===0&&identityProblems.length===0&&!missingProducts.length&&!unknownProducts.length&&!missingVariants.length;
 const observedBaseline=baseline?{products:baseline.totalProducts,variants:baseline.totalVariants,gProducts:baseline.productInventory.length,
  gVariants:baseline.productInventory.reduce((n,p)=>n+p.variantGids.length,0),approvedCompatibilityValues:baseline.compatibility.coveredProducts,
  approvedEdges:baseline.compatibility.approvedEdges,productsWithoutApprovedCompatibility:baseline.compatibility.productsWithoutRelationships,
  missingGMedia:baseline.productInventory.filter(p=>p.mediaAttachments===0).length}:null;
 const baselineDifferences=observedBaseline?Object.entries(observedBaseline).filter(([k,v])=>counts[k]!==v).map(([metric,prior])=>({metric,baseline:prior,current:counts[metric]})):[];
 const commercialDrift=variants.flatMap(v=>{const prior=beforeVariants.find(p=>p.id===v.id);return prior&&prior.price!==v.price?[{variantGid:v.id,field:'price',before:prior.price,after:v.price}]:[];});
 return {schemaVersion:1,contract:'epic-g-foundation',mode:envelope.sourceKind==='fixture'?'OFFLINE_FIXTURE':'CAPTURED_ADMIN_READ',asOf,source,counts,byClass,
  reconciliation:{complete:source.current&&classCoverageComplete&&referenceDrift.length===0,liveAdmin:envelope.sourceKind==='live_admin'&&!a.fixtureOnly,
   paginationComplete:!paginationProblems(envelope).length,classCoverageComplete,identityProblems,missingProducts,missingVariants,unknownProducts,sourceClassErrors,referenceDrift,publicationDrift,
   nativeDrift,commercialDrift,baselineDifferences,baselineAuthority:false},
  products:productRows,operations:{readRequests:envelope.operations?.length||0,mutations:0,themePushes:0},nativeCommercePolicy:'G never disables native commerce; optional absence and unsupported fit gate only their own G consumer.'};
}
function summaryMarkdown(report) {
 const c=report.counts;return '# Epic G foundation readiness\n\n'+
 '**Mode:** '+report.mode+'; **current Admin reconciled:** '+(report.reconciliation.liveAdmin&&report.reconciliation.complete)+'; **contract validation passed:** '+report.reconciliation.complete+'; **as of:** '+report.asOf+'\n\n'+
 '- Products / Variants: '+c.products+' / '+c.variants+'; G: '+c.gProducts+' / '+c.gVariants+'.\n'+
 '- Approved compatibility values / edges: '+c.approvedCompatibilityValues+' / '+c.approvedEdges+'; customer edges: '+c.customerEdges+'; approved unpublished-target edges: '+c.approvedUnpublishedTargetEdges+'.\n'+
 '- Missing G SKUs / media / descriptions: '+c.missingGSkus+' / '+c.missingGMedia+' / '+c.missingGDescriptions+'; zero-price Variants: '+c.zeroPricedGVariants+'.\n'+
 '- Receipt expiry: '+report.source.expiresAt+'; receipt is never renewed by a G read.\n'+
 '- Source/read blockers: '+(report.source.reasons.join(', ')||'none')+'.\n'+
 '- Baseline differences: '+report.reconciliation.baselineDifferences.length+'; reference drift: '+report.reconciliation.referenceDrift.length+'; publication drift: '+report.reconciliation.publicationDrift.length+'.\n'+
 '- Shopify reads / mutations / theme pushes: '+report.operations.readRequests+' / 0 / 0.\n\n'+
 'Optional absences are per-Product evidence, not inferred values or purchase restrictions. Complete machine-readable results accompany this summary.\n';
}
module.exports={G_CLASSES,CLASSES,RELATIONS,RESOURCE_KEYS,ATTRIBUTE_KEYS,loadAuthority,fixtureAuthority,assess,summaryMarkdown};
