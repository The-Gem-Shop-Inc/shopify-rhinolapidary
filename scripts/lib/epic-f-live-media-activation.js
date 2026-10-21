'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const BASE='docs/qa/evidence/epic-f/004b-live-media-2026-10-10',DIR=BASE+'/resume-2026-10-12';
const FILE='snippets/rhino-product-media-eligibility.liquid',RELEASE='data/epic-f-media-release.json',BINDING=DIR+'/source-binding-revision-2.json';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const write=(name,value)=>fs.writeFileSync(DIR+'/'+name,JSON.stringify(value,null,2)+'\n');
const TARGETS=['8905779937477','8905780756677','8905781412037','8905781477573','8905784131781','8905784197317','8905784328389','8905785344197'].map(id=>'gid://shopify/Product/'+id);
function validateRelease(release,snapshot=read(DIR+'/media-after-alt.json')){
 const errors=[],decision=read(BASE+'/development-decision.json'),reviews=read(BASE+'/visual-media-review.json'),catalog=read(DIR+'/catalog-before.json');
 const error=s=>errors.push(s);if(release.schemaVersion!==1||release.authority!=='F-DEC-002-DEV'||release.mode!=='development-current-product')error('Development decision/mode required');
 if(decision.state!=='APPROVED_BOUNDED_DEVELOPMENT'||decision.approvalMode!=='delegated_development_override'||decision.scope.finalLaunchRightsOrCompleteness!==false)error('Bounded development decision required');
 if(release.observedAt!==snapshot.completedAt||!Number.isFinite(Date.parse(release.observedAt))||Date.parse(release.observedAt)>Date.now())error('Fresh Admin observation identity required');
 if(!Array.isArray(release.grants)||release.grants.length!==6){error('Exact six reviewed development grants required');return errors;}
 const seen=new Set();
 for(const g of release.grants){
  if(!TARGETS.includes(g.productGid))error('Wrong/excluded Product');
  const key=g.productGid+'|'+g.mediaGid;if(seen.has(key))error('Duplicate grant');seen.add(key);
  const p=snapshot.products.find(p=>p.id===g.productGid),m=p?.media.nodes.find(m=>m.id===g.mediaGid),review=reviews.products.find(p=>p.productGid===g.productGid)?.items.find(m=>m.mediaGid===g.mediaGid);
  if(!p||p.status!=='ACTIVE'||!p.publishedAt||p.templateSuffix!=='machine')error('Current published assigned Product required');
  if(!m)error('INELIGIBLE_WRONG_PRODUCT or missing current association');
  if(m?.mediaContentType!=='IMAGE'||g.mediaType!=='IMAGE')error('INELIGIBLE_UNSUPPORTED_TYPE');
  if(m?.status!=='READY'||m?.fileStatus!=='READY'||g.status!=='READY'||g.fileStatus!=='READY')error('INELIGIBLE_STATUS');
  if(!review||review.reviewState!=='PASS'||review.classification!=='ELIGIBLE_CURRENT_PRODUCT_MEDIA')error('REVIEW_REQUIRED');
  if(!m?.image||m.image.width!==g.width||m.image.height!==g.height||m.image.url!==g.sourceUrl||m.updatedAt!==g.mediaUpdatedAt)error('Current media identity/dimensions drift');
  const owners=catalog.products.filter(p=>p.media.nodes.some(m=>m.id===g.mediaGid));if(owners.length!==1||owners[0].id!==g.productGid)error('Shared media alt scope needs independent review');
  if(typeof g.alt!=='string'||!g.alt.trim()||g.alt.length>300||/[<>{}\r\n]/.test(g.alt)||g.alt!==review?.proposedAlt||m?.alt!==g.alt||m?.image?.altText!==g.alt)error('Approved descriptive alt reconciliation required');
  if(require('../validate-brand-claims').validateRenderedText('media-alt',g.alt||'').length)error('Unsupported alt claim');
  if(g.audience!=='customer-development'||g.approvalMode!=='delegated_development_override'||g.decisionId!=='F-DEC-002-DEV'||g.observedAt!==snapshot.completedAt||g.visualReview!==BASE+'/visual-media-review.json'||g.finalLaunchApproved!==false)error('Development provenance required');
 }
 const approved=reviews.products.flatMap(p=>p.items.filter(m=>m.reviewState==='PASS').map(m=>p.productGid+'|'+m.mediaGid)).sort();if(JSON.stringify([...seen].sort())!==JSON.stringify(approved))error('Grant scope differs from exact reviewed inventory');
 return errors;
}
function compile(release){
 const errors=validateRelease(release);assert.deepEqual(errors,[]);
 const quote=s=>{assert.equal(typeof s,'string');assert.ok(!/[\r\n{}<>]/.test(s));return "'"+s.replaceAll("'",'&#39;')+"'";};
 const urls=release.grants.map(g=>new URL(g.sourceUrl)),prefixes=[...new Set(urls.map(u=>u.pathname.split('/files/').slice(0,-1).join('/files/')+'/'))];assert.equal(prefixes.length,1);
 const prefix=prefixes[0];
 const lines=['{%- comment -%}','Generated exact F-DEC-002-DEV current-Product development grants.','Final launch rights/content quality remain separately reviewable. No facts or cross-Product authority.','{%- endcomment -%}',"{%- assign rhino_product_id = product.id | append: '' -%}","{%- assign rhino_media_id = media.id | append: '' -%}","{%- assign rhino_media_store_prefix = request.host | prepend: '//' | append: '/cdn/shop/' -%}",`{%- assign rhino_media_source = media.preview_image.src | remove_first: 'https:' | remove_first: 'http:' | remove_first: ${quote('//cdn.shopify.com'+prefix)} | remove_first: rhino_media_store_prefix | remove_first: '/cdn/shop/' | remove_first: ${quote(prefix)} -%}`,"{%- if template.suffix == 'machine' and product.published_at != blank and media.media_type == 'image' -%}"];
 for(const g of release.grants){const u=new URL(g.sourceUrl),relative=u.pathname.slice(prefix.length),versioned=relative+u.search;lines.push("  {%- assign rhino_media_source_matches = false -%}",`  {%- if rhino_media_source == ${quote(versioned)} or rhino_media_source == ${quote(relative)} -%}{%- assign rhino_media_source_matches = true -%}{%- endif -%}`,`  {%- if rhino_product_id == ${quote(g.productGid.split('/').pop())} and rhino_media_id == ${quote(g.mediaGid.split('/').pop())} and media.alt == ${quote(g.alt)} and media.preview_image.alt == ${quote(g.alt)} and rhino_media_source_matches and media.preview_image.width == ${g.width} and media.preview_image.height == ${g.height} -%}eligible{%- endif -%}`);}
 lines.push('{%- endif -%}');return lines.join('\n')+'\n';
}
function verifyBinding(){
 const b=read(BINDING),{bindingSha256,...body}=b;assert.equal(hash(JSON.stringify(body)),bindingSha256);assert.equal(b.identity,'EPIC_F_CURRENT_PRODUCT_MEDIA_DEVELOPMENT_2026_10_12');assert.equal(b.decisionId,'F-DEC-002-DEV');assert.equal(b.runtimeDelta.length,1);assert.equal(b.runtimeDelta[0].path,FILE);
 for(const p of b.provenance)assert.ok(hash(fs.readFileSync(p.path))===p.sha256||require('./epic-f-owner-activation-binding').historicalSourceMatches(p.path,p.sha256),'Media authority drift '+p.path);
 const release=read(RELEASE);assert.deepEqual(validateRelease(release),[]);assert.equal(fs.readFileSync(FILE,'utf8'),compile(release));
 const old=read('docs/qa/evidence/epic-f/header-focus-correction-2026-10-06/source-binding.json'),{bindingSha256:oldHash,...oldBody}=old;assert.equal(hash(JSON.stringify(oldBody)),oldHash);assert.equal(oldHash,b.previousSourceBindingSha256);
 for(const row of old.files){const delta=b.runtimeDelta.find(d=>d.path===row.path),expected=delta?delta.sha256:row.sha256;assert.ok(hash(fs.readFileSync(row.path))===expected||require('./epic-f-owner-activation-binding').historicalSourceMatches(row.path,expected),'Unrelated runtime change '+row.path);if(delta)assert.equal(delta.oldSha256,row.sha256);}
 assert.equal(hash(b.runtimeDelta[0].originalBody),b.runtimeDelta[0].oldSha256);assert.equal(hash(b.previousReleaseBody),b.previousReleaseSha256);
 return b;
}
function active(){return process.env.RHINO_EPIC_F_MEDIA_BINDING===BINDING;}
function historicalSourceMatches(path,expected){
 if(!active())return false;try{const b=verifyBinding();if(path===FILE)return b.runtimeDelta[0].oldSha256===expected;if(path===RELEASE)return b.previousReleaseSha256===expected;
 if(path==='sections/header.liquid'&&process.env.RHINO_EPIC_F_HEADER_FOCUS_BINDING==='docs/qa/evidence/epic-f/header-focus-correction-2026-10-06/source-binding.json')return read(process.env.RHINO_EPIC_F_HEADER_FOCUS_BINDING).files.find(f=>f.path===path).oldSha256===expected;
 return false;}catch{return false;}
}
function authorizedCount(){if(!active())return 0;verifyBinding();return read(RELEASE).grants.length;}
module.exports={BASE,DIR,FILE,RELEASE,BINDING,TARGETS,read,write,hash,validateRelease,compile,verifyBinding,active,historicalSourceMatches,authorizedCount};
