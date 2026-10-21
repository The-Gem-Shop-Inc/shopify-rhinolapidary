'use strict';
// Read an existing unpublished Product preview URL directly into browser-process memory.
// No new preview session, Product mutation, credential file, or URL logging.
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
const CLI_DIST='C:/Users/dajem/AppData/Local/JetBrains/WebStorm2026.2/acp-agents/.runtimes/node/24.13.0/node_modules/@shopify/cli/dist/';
const QUERY='query LiveExcludedPreviewLinks($ids:[ID!]!){nodes(ids:$ids){...on Product{id title handle status publishedAt onlineStoreUrl onlineStorePreviewUrl templateSuffix}}}';
async function excludedPreview() {
  Object.assign(process.env,{SHOPIFY_CLI_NO_ANALYTICS:'1',OPT_OUT_INSTRUMENTATION:'true',CI:'1'});
  const auth=await import(pathToFileURL(CLI_DIST+'chunk-IAURXPUJ.js').href);
  const client=await import(pathToFileURL(CLI_DIST+'chunk-C2AA5NVP.js').href);
  let session=await auth.T('sz5dnk-nf.myshopify.com');
  let data;
  try{data=await client.b({query:QUERY,session,variables:{ids:['gid://shopify/Product/8905781248197']},version:'2026-10',responseOptions:{handleErrors:false}});}finally{session=null;}
  const p=data?.nodes?.[0];assert.equal(p?.id,'gid://shopify/Product/8905781248197');assert.equal(p.templateSuffix,null);assert.ok(p.onlineStorePreviewUrl);
  const result={id:p.id.split('/').pop(),gid:p.id,title:p.title,handle:p.handle,route:'/products/'+p.handle,memoryOnlyUrl:p.onlineStorePreviewUrl};data=null;return result;
}
module.exports={excludedPreview,QUERY};
