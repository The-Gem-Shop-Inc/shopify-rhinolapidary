'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const DIR='docs/qa/evidence/epic-f/header-focus-correction-2026-10-06';
const FILE='sections/header.liquid';
const ANCHOR='  @media screen and (min-width: 750px) {\n    .section-header {';
const PATCH='  @media screen and (max-width: 749px) {\n    .section-header {\n      position: relative;\n      top: 0;\n    }\n  }\n\n';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const md5=b=>crypto.createHash('md5').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const write=(name,value)=>{fs.mkdirSync(DIR,{recursive:true});fs.writeFileSync(DIR+'/'+name,JSON.stringify(value,null,2)+'\n');};
function transform(before){assert.equal(before.split(ANCHOR).length-1,1);assert.equal(before.includes(PATCH),false);return before.replace(ANCHOR,PATCH+ANCHOR);}
function verify(){const b=read(DIR+'/themes-before.json');assert.equal(b.shop.myshopifyDomain,'sz5dnk-nf.myshopify.com');const local=fs.readFileSync(FILE,'utf8');const rows=[];
 for(const [name,id,role,title]of [['main','158579622085','MAIN','shopify-rhinolapidary/main'],['preview','158631198917','UNPUBLISHED','Rhino Lapidary - Preview']]){const t=b[name];assert.equal(t.id,'gid://shopify/OnlineStoreTheme/'+id);assert.equal(t.role,role);assert.equal(t.name,title);assert.equal(t.files.pageInfo.hasNextPage,false);const old=t.source.nodes.find(f=>f.filename===FILE);assert.ok(old);assert.equal(md5(old.body.content),old.checksumMd5,'Exact rollback body checksum');assert.equal(local,transform(old.body.content),'Only reviewed CSS insertion permitted');rows.push({name,id,role,path:FILE,exists:true,originalBody:old.body.content,beforeSha256:hash(old.body.content),beforeMd5:old.checksumMd5,intendedBody:local,intendedSha256:hash(local),intendedMd5:md5(local)});}
 const oldActivation=read('docs/qa/evidence/epic-f/live-activation-2026-10-05/deployment-plan.json');for(const f of oldActivation.files)assert.equal(hash(fs.readFileSync(f.path)),f.intendedSha256,'Unrelated activation source drift');
 return {approvalMode:'delegated_development_override',scope:'GLOBAL_HEADER_CURRENT_FOCUS_CORRECTION_ONLY',authorizedAt:'2026-10-06',path:FILE,rows,changedFileCount:1,patch:PATCH,productsAuthorized:false,publicationAuthorized:false,performanceCertificationAuthorized:false};}
module.exports={DIR,FILE,ANCHOR,PATCH,hash,md5,read,write,transform,verify};
