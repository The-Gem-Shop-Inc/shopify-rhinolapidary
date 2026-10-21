'use strict';
// Reuses E's authenticated fetch/pagination/error handling; this is not a second Shopify client.
const assert=require('node:assert/strict');
const {isDeepStrictEqual}=require('node:util');
const E=require('./epic-e-admin-audit');
const OPERATIONS={
 products:E.OPERATIONS.products.replace('query EpicEProducts','query EpicGProducts').replace('{ products(', '{ shop { id myshopifyDomain } products(')
  .replace('id title handle status','id title handle descriptionHtml status')
  .replace(/collections\(first: 50\) \{ nodes \{ id handle title \} pageInfo \{ hasNextPage endCursor \} \} /,'')
  .replace('media(first: 100)','media(first: 10)').replace('metafields(first: 100)','metafields(first: 50)')
  .replace('resourcePublicationsV2(first: 50)','resourcePublicationsV2(first: 10)').replace('publication { id }','publication { id name }'),
 variants:E.OPERATIONS.variants.replace('query EpicEVariants','query EpicGVariants').replace('{ productVariants(', '{ shop { id myshopifyDomain } productVariants(')
  .replace('sku barcode price','sku barcode price inventoryQuantity availableForSale').replace('metafields(first: 100)','metafields(first: 20)')
};
E.assertReadOnlyOperations(OPERATIONS);
async function capture({shop,execute,accessToken,apiVersion=null,now=()=>new Date()}) {
 assert(execute||accessToken,'Admin read transport unavailable');
 const startedAt=now().toISOString(),operations=[];
 const fetchImpl=async(_url,request)=>{
  const {query,variables}=JSON.parse(request.body);
  assert(Object.values(OPERATIONS).includes(query),'Unplanned read');E.assertReadOnlyOperations({query});
  const at=now().toISOString(),native=execute?null:await fetch(_url,request),response=execute?await execute({query,variables}):await native.json();
  operations.push({startedAt:at,completedAt:now().toISOString(),query,variables,response,httpStatus:native?.status??200});
  if(response.data?.shop)assert.deepEqual(response.data.shop,shop,'Wrong Shopify shop');
  return {ok:native?.ok??true,status:native?.status??200,json:async()=>response};
 };
 // E's fetch adapter requires a credential presence check even for an injected connector.
 // The sentinel is never a credential and is never transmitted by this adapter.
 const snapshot=await E.runAdminAudit({shopDomain:shop.myshopifyDomain,accessToken:execute?'injected-read-transport':accessToken,fetchImpl,now,apiVersion,only:['products','variants'],operationOverrides:OPERATIONS,pageSize:10});
 return {schemaVersion:1,sourceKind:'live_admin',transport:'existing_epic_e_admin_audit',startedAt,completedAt:now().toISOString(),shop,snapshot,operations,mutations:0};
}
async function replayConnector(transcript) {
 assert.equal(transcript.transport,'Shopify connector graphql_query');assert.equal(transcript.sourceKind,'live_admin');
 let index=0;
 const envelope=await capture({shop:transcript.shop,now:()=>new Date(transcript.startedAt),execute:async request=>{
  const recorded=transcript.operations[index++];assert(recorded,'Missing connector response');
  assert.deepEqual({query:recorded.query,variables:recorded.variables},request,'Recorded cursor/query differs');
  return recorded.response;
 }});
 assert.equal(index,transcript.operations.length,'Unconsumed connector responses');
 envelope.startedAt=transcript.startedAt;envelope.completedAt=transcript.completedAt;envelope.operations=transcript.operations;
 envelope.transport='Shopify connector graphql_query via existing E audit paginator';envelope.apiVersionExposed=false;
 return envelope;
}
function paginationProblems(envelope) {
 const errors=[];
 if(!envelope||!Array.isArray(envelope.operations)||envelope.operations.length===0)return ['ADMIN_PAGINATION_INCOMPLETE'];
 if(envelope.sourceKind==='live_admin'){
  const start=Date.parse(envelope.startedAt),end=Date.parse(envelope.completedAt);
  if(!Number.isFinite(start)||!Number.isFinite(end)||end<start||envelope.snapshot?.capturedAt!==envelope.startedAt)errors.push('ADMIN_CAPTURE_TIME_INVALID');
  for(const op of envelope.operations){const a=Date.parse(op.startedAt),b=Date.parse(op.completedAt);if(!Number.isFinite(a)||!Number.isFinite(b)||a<start||b<a||b>end)errors.push('ADMIN_CAPTURE_TIME_INVALID');}
 }
 for(const [name,root]of [['products','products'],['variants','productVariants']]){
  const ops=envelope.operations.filter(o=>o.query===OPERATIONS[name]),dataset=envelope.snapshot?.datasets?.[name],seen=new Set(),nodes=[];
  let cursor=null,exhausted=false;
  if(!ops.length||dataset?.queryStatus!=='success'||dataset.errorCount||dataset.recordCount!==dataset.records?.length||dataset.pageCount!==ops.length)errors.push('ADMIN_PAGINATION_INCOMPLETE');
  for(const op of ops){
   if(exhausted||op.variables?.after!==cursor||op.variables?.first!==10)errors.push('ADMIN_PAGINATION_INCOMPLETE');
   const data=op.response?.data;
   if(op.response?.errors?.length||op.httpStatus&&op.httpStatus!==200||!isDeepStrictEqual(data?.shop,envelope.shop))errors.push('ADMIN_RESPONSE_INVALID');
   const connection=data?.[root];
   if(!Array.isArray(connection?.nodes)||typeof connection?.pageInfo?.hasNextPage!=='boolean'){errors.push('ADMIN_PAGINATION_INCOMPLETE');continue;}
   nodes.push(...connection.nodes);
   function nested(v){if(!v||typeof v!=='object')return;if(v.pageInfo&&(typeof v.pageInfo.hasNextPage!=='boolean'||v.pageInfo.hasNextPage))errors.push('ADMIN_NESTED_PAGINATION_INCOMPLETE');for(const [k,x]of Object.entries(v))if(k!=='pageInfo')nested(x);}
   connection.nodes.forEach(nested);
   const info=connection.pageInfo;exhausted=info.hasNextPage===false;cursor=info.endCursor;
   if(!exhausted&&(!cursor||seen.has(cursor)))errors.push('ADMIN_PAGINATION_INCOMPLETE');seen.add(cursor);
  }
  if(!exhausted||!isDeepStrictEqual(nodes,dataset?.records))errors.push('ADMIN_PAGINATION_INCOMPLETE');
  if(new Set(nodes.map(p=>p.id)).size!==nodes.length)errors.push('ADMIN_DUPLICATE_IDENTITY');
 }
 if(envelope.snapshot?.errors?.length)errors.push('ADMIN_RESPONSE_INVALID');
 if(envelope.operations.some(o=>!Object.values(OPERATIONS).includes(o.query)))errors.push('UNPLANNED_SHOPIFY_OPERATION');
 return [...new Set(errors)].sort();
}
module.exports={OPERATIONS,capture,replayConnector,paginationProblems};
