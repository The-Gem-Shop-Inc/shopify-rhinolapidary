'use strict';
// This authorization is specific to this F7 development activation, never a generic approval bypass.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {PRODUCTS}=require('./epic-f-nonpersistent-preview');
const {canonical}=require('./epic-f-governance');
const DIR='docs/qa/evidence/epic-f/live-activation-2026-10-05';
const PLAN=DIR+'/deployment-plan.json';
const TARGET='158579622085',PREVIEW='158631198917';
const EXCLUSIONS=['gid://shopify/Product/8905781248197','gid://shopify/Product/8905784262853','gid://shopify/Product/8905785868485'];
const EXCLUDED_PATHS=['snippets/facets.liquid','snippets/facets-mobile.liquid','snippets/product-disclosures.liquid','snippets/cart-disclosure-indicator.liquid'];
const BINDING='docs/qa/evidence/epic-f/2026-10-05-persistent-development-source-binding.json';
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const md5=v=>crypto.createHash('md5').update(v).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const digest=v=>hash(canonical(v));
const planDigest=p=>digest(Object.fromEntries(Object.entries(p).filter(([k])=>k!=='planSha256')));
const parseJson=s=>JSON.parse(s.replace(/\/\*[\s\S]*?\*\//g,''));
// Pagination cursors are response-navigation metadata, not protected Product data.
// hasNextPage remains part of the completeness assertion; every returned node is preserved.
const protectedComparable=(value,parent)=>Array.isArray(value)?value.map(v=>protectedComparable(v,parent)):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).filter(([k])=>!(parent==='pageInfo'&&k==='endCursor')).map(([k,v])=>[k,protectedComparable(v,k)])):value;
function validatePlan(plan,{sourceRead=p=>fs.readFileSync(p),now=Date.now()}={}){
  assert.equal(plan.approvalMode,'delegated_development_override');assert.equal(plan.scope,'F-PBI-017B_BOUNDED_LIVE_DEVELOPMENT_ACTIVATION');
  assert.equal(plan.targetTheme.id,TARGET);assert.equal(plan.targetTheme.role,'MAIN');assert.equal(plan.previewTheme.id,PREVIEW);assert.equal(plan.previewTheme.role,'UNPUBLISHED');
  assert.equal(plan.planSha256,planDigest(plan));assert.equal(plan.publicationAuthorized,false);assert.equal(plan.factualWritesAuthorized,false);
  assert.deepEqual(plan.targetProducts,PRODUCTS.map(p=>p.gid));assert.deepEqual(plan.excludedProducts,EXCLUSIONS);
  const binding=read(BINDING),expected=binding.files.filter(f=>!EXCLUDED_PATHS.includes(f.path));
  assert.deepEqual(plan.files.map(f=>f.path),expected.map(f=>f.path));assert.equal(plan.files.length,28);assert.equal(new Set(plan.files.map(f=>f.path)).size,28);
  assert.ok(now-Date.parse(plan.beforeCompletedAt)<60*60*1000,'Fresh theme snapshot required');
  for(const a of plan.authorities)assert.equal(hash(sourceRead(a.path)),a.sha256,'Authority drift: '+a.path);
  for(const f of plan.files){assert.match(f.path,/^(?:assets|layout|locales|sections|snippets|templates)\/[a-zA-Z0-9_.-]+$/);assert.ok(!/preview-inline|overrides|password/.test(f.path));
    const authority=binding.files.find(r=>r.path===f.path);assert.equal(f.intendedSha256,authority.sha256);assert.equal(hash(sourceRead(f.path)),f.intendedSha256,'Source drift: '+f.path);assert.equal(hash(f.intendedBody),f.intendedSha256);assert.equal(md5(f.intendedBody),f.intendedRawMd5);
    if(f.existedBefore){assert.equal(typeof f.originalBody,'string');assert.equal(hash(f.originalBody),f.originalBodySha256);assert.equal(typeof f.rollbackUploadBody,'string');assert.equal(hash(f.rollbackUploadBody),f.rollbackUploadSha256);assert.equal(md5(f.rollbackUploadBody),f.beforeChecksumMd5,'Exact rollback checksum required');if(f.path.endsWith('.json'))assert.deepEqual(parseJson(f.originalBody),parseJson(f.rollbackUploadBody));else assert.equal(f.rollbackUploadBody,f.originalBody);}
    else {assert.equal(f.originalBody,null);assert.equal(f.beforeChecksumMd5,null);assert.equal(f.rollbackAction,'delete_only_task_created_file');}
  }
  return plan;
}
function validateCommand(plan,args,{rollback=false,workspace='.',now=Date.now()}={}){
  validatePlan(plan,{now});assert.deepEqual(args.slice(0,2),['theme','push']);assert.equal(args[args.indexOf('--theme')+1],TARGET);assert.equal(args[args.indexOf('--path')+1],workspace);
  const only=args.flatMap((a,i)=>a==='--only'?[args[i+1]]:[]);assert.deepEqual(only,plan.files.map(f=>f.path));
  const allowed=new Set(['--store','--theme','--path','--only','--nodelete','--strict','--allow-live','--json']);for(const a of args.filter(a=>a.startsWith('--')))assert.ok(allowed.has(a),'Unplanned CLI option');
  for(const required of ['--allow-live','--json'])assert.ok(args.includes(required));
  if(!rollback){assert.ok(args.includes('--nodelete'));assert.ok(args.includes('--strict'));assert.equal(workspace,'.');}
  else {assert.ok(!args.includes('--nodelete'));const resolved=path.resolve(workspace),boundary=path.resolve('test-results/epic-f-live-activation/rollback');assert.equal(resolved,boundary);for(const f of plan.files){const dest=path.join(resolved,f.path);if(f.existedBefore)assert.equal(hash(fs.readFileSync(dest)),f.rollbackUploadSha256);else assert.equal(fs.existsSync(dest),false);}}
}
function verifyAssignment(product,authorization,now=Date.now()){
  assert.equal(authorization.approvalMode,'delegated_development_override');assert.equal(authorization.planId,'F-PBI-017B');assert.equal(authorization.liveThemeId,TARGET);assert.equal(authorization.liveMachineTemplateVerified,true);
  assert.ok(now-Date.parse(authorization.beforeReadCompletedAt)<=900000,'Stale F7 before-read');assert.deepEqual(authorization.targetProducts,PRODUCTS.map(p=>p.gid));assert.deepEqual(authorization.excludedProducts,EXCLUSIONS);
  assert.ok(PRODUCTS.some(p=>p.gid===product.id));assert.ok(!EXCLUSIONS.includes(product.id));assert.equal(product.templateSuffix,null);assert.equal(product.status,'ACTIVE');assert.ok(product.publishedAt);assert.equal(product.metafields.nodes.find(m=>m.namespace==='rhino'&&m.key==='product_class')?.value,'machine');
  const expected=authorization.products.find(p=>p.id===product.id);assert.ok(expected);assert.equal(digest(protectedComparable(product)),digest(protectedComparable(expected)),'Immediate protected Product drift');
  return {id:product.id,templateSuffix:'machine'};
}
module.exports={DIR,PLAN,TARGET,PREVIEW,PRODUCTS,EXCLUSIONS,EXCLUDED_PATHS,BINDING,hash,md5,read,digest,planDigest,parseJson,protectedComparable,validatePlan,validateCommand,verifyAssignment};
