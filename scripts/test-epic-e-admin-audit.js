const assert=require('assert/strict');
const {runAdminAudit,assertReadOnlyOperations}=require('./lib/epic-e-admin-audit');
const response=(payload,status=200)=>({ok:status>=200&&status<300,status,json:async()=>payload});
(async()=>{
  assertReadOnlyOperations();
  const calls=[];
  const paged=await runAdminAudit({shopDomain:'fixture.myshopify.com',accessToken:'fixture-token-not-secret',only:['products'],now:()=>new Date('2026-09-02T12:00:00Z'),fetchImpl:async(_url,options)=>{const body=JSON.parse(options.body);calls.push(body.variables.after);return response({data:{products:{nodes:[{id:`gid://shopify/Product/${calls.length}`}],pageInfo:{hasNextPage:calls.length===1,endCursor:calls.length===1?'cursor-1':null}}},extensions:{cost:{throttleStatus:{currentlyAvailable:999,restoreRate:100}}}})}});
  assert.deepEqual(calls,[null,'cursor-1']); assert.equal(paged.datasets.products.recordCount,2); assert.equal(paged.datasets.products.pageCount,2); assert.equal(paged.datasets.products.resultState,'nonzero');
  const zero=await runAdminAudit({
    shopDomain:'fixture.myshopify.com', accessToken:'fixture-token-not-secret', only:['metaobjectDefinitions'],
    fetchImpl:async()=>response({data:{metaobjectDefinitions:{nodes:[],pageInfo:{hasNextPage:false,endCursor:null}}}})
  });
  assert.equal(zero.datasets.metaobjectDefinitions.resultState,'zero_definitions');
  const denied=await runAdminAudit({shopDomain:'fixture.myshopify.com',accessToken:'fixture-token-not-secret',only:['markets'],fetchImpl:async()=>response({errors:[{message:'Access denied for markets field'}]})});
  assert.equal(denied.datasets.markets.resultState,'inaccessible_scope'); assert.equal(denied.datasets.markets.errorCount,1);
  const failed=await runAdminAudit({shopDomain:'fixture.myshopify.com',accessToken:'fixture-token-not-secret',only:['locations'],fetchImpl:async()=>response({errors:[{message:'Unexpected resolver failure'}]})});
  assert.equal(failed.datasets.locations.resultState,'query_failure');
  const httpFailed=await runAdminAudit({shopDomain:'fixture.myshopify.com',accessToken:'fixture-token-not-secret',only:['locations'],fetchImpl:async()=>response({message:'Upstream failure'},503)});
  assert.equal(httpFailed.datasets.locations.resultState,'query_failure'); assert.equal(httpFailed.errors[0].kind,'http');
  const brokenCursor=await runAdminAudit({shopDomain:'fixture.myshopify.com',accessToken:'fixture-token-not-secret',only:['products'],fetchImpl:async()=>response({data:{products:{nodes:[],pageInfo:{hasNextPage:true,endCursor:null}}}})});
  assert.equal(brokenCursor.datasets.products.resultState,'query_failure');
  const nestedTruncation=await runAdminAudit({shopDomain:'fixture.myshopify.com',accessToken:'fixture-token-not-secret',only:['products'],fetchImpl:async()=>response({data:{products:{nodes:[{id:'gid://shopify/Product/1',media:{nodes:[],pageInfo:{hasNextPage:true,endCursor:'nested'}}}],pageInfo:{hasNextPage:false,endCursor:null}}}})});
  assert.equal(nestedTruncation.datasets.products.resultState,'query_failure'); assert.equal(nestedTruncation.errors[0].kind,'pagination');
  assert(!JSON.stringify(paged).includes('fixture-token-not-secret'));
  console.log('Epic E Admin audit tests passed: deterministic pagination, nested truncation, zero-definition state, scope denial, GraphQL/HTTP failure, cursor failure, and redaction.');
})().catch((error)=>{console.error(error);process.exit(1)});
