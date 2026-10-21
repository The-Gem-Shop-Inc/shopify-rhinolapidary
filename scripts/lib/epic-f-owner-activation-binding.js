'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('./epic-e-owner-response-adapter');
const BINDING=E.DIR+'/source-binding.json';
const PARENT='docs/qa/evidence/epic-f/004b-live-media-2026-10-10/resume-2026-10-12/source-binding-revision-2.json';
const RUNTIME=['snippets/rhino-product-fact-projection.liquid','snippets/rhino-product-context-delivery-projection.liquid','snippets/rhino-owner-approved-facts.liquid','snippets/rhino-owner-approved-context.liquid','snippets/card-product.liquid',
 ...['8905779937477','8905780756677','8905781412037','8905781477573','8905784131781','8905784197317','8905784328389','8905785344197'].map(id=>'snippets/rhino-owner-approved-facts-'+id+'.liquid'),
 ...['8905780756677','8905781477573','8905784131781','8905784197317','8905785344197'].map(id=>'snippets/rhino-owner-approved-context-'+id+'.liquid')];
const active=()=>process.env.RHINO_EPIC_F_OWNER_BINDING===require('./epic-f-final-owner-binding').BINDING||process.env.RHINO_EPIC_F_OWNER_BINDING===BINDING||process.env.RHINO_EPIC_F_OWNER_BINDING===require('./epic-f-bom-owner-binding').BINDING||process.env.RHINO_EPIC_F_OWNER_BINDING===require('./epic-f-006b-binding').BINDING;
let verifiedCache=null;
function verify(){
 if(process.env.RHINO_EPIC_F_OWNER_BINDING===require('./epic-f-final-owner-binding').BINDING)return require('./epic-f-final-owner-binding').verify();
 if(process.env.RHINO_EPIC_F_OWNER_BINDING===require('./epic-f-006b-binding').BINDING)return require('./epic-f-006b-binding').verify();
 if(process.env.RHINO_EPIC_F_OWNER_BINDING===require('./epic-f-bom-owner-binding').BINDING)return require('./epic-f-bom-owner-binding').verify();
 const b=E.read(BINDING),{bindingSha256,...body}=b;assert.equal(E.hash(JSON.stringify(body)),bindingSha256);assert.equal(b.identity,'EPIC_F_RECONCILED_OWNER_FACTS_DEVELOPMENT_2026_10_13');assert.equal(b.parentSourceBindingSha256,'666ff15b4d98916426299eae85dbea783535321d88ea5d77035e57c0054216ac');
 assert.deepEqual(b.runtimeDelta.map(r=>r.path).sort(),RUNTIME.slice().sort());
 const parent=E.read(PARENT),{bindingSha256:parentHash,...parentBody}=parent;assert.equal(E.hash(JSON.stringify(parentBody)),parentHash);assert.equal(parentHash,b.parentSourceBindingSha256);
 for(const ref of [...b.provenance,...b.sourceAfter])assert.equal(E.hash(fs.readFileSync(ref.path)),ref.sha256,'Owner source/release drift '+ref.path);
 for(const d of [...b.runtimeDelta,...b.qaDelta]){assert.equal(E.hash(fs.readFileSync(d.path)),d.sha256);if(d.oldSha256)assert.equal(E.hash(d.originalBody),d.oldSha256);}
 for(const ref of parent.provenance.filter(r=>r.path!=='scripts/lib/epic-f-live-media-activation.js'))assert.equal(E.hash(fs.readFileSync(ref.path)),ref.sha256,'Protected media authority changed');
 assert.equal(E.hash(fs.readFileSync('snippets/rhino-product-media-eligibility.liquid')),parent.runtimeDelta[0].sha256);
 const fingerprint=E.digest({bindingSha256,refs:[...b.provenance,...b.sourceAfter,...parent.provenance.filter(r=>r.path!=='scripts/lib/epic-f-live-media-activation.js')].map(r=>({path:r.path,sha256:E.hash(fs.readFileSync(r.path))}))});
 if(verifiedCache?.fingerprint===fingerprint){const now=Date.now();assert(now>=verifiedCache.reconciledAt&&now<verifiedCache.expiresAt,'Owner reconciliation stale');return b;}
 const state=E.loadReconciled();assert(state);require('./epic-f-customer-release').verifyRelease();
 verifiedCache={fingerprint,reconciledAt:Date.parse(state.receipt.reconciledAt),expiresAt:Date.parse(state.receipt.expiresAt)};
 return b;
}
function historicalSourceMatches(path,expected){
 if(!active())return false;
 try{const b=verify(),row=[...b.runtimeDelta,...b.qaDelta].find(r=>r.path===path);if(!row||!row.oldSha256)return false;if(row.oldSha256===expected)return true;
  // Preserve the earlier card extraction proof against its recorded predecessor.
  if(path==='snippets/card-product.liquid'){
   const cleanup=E.read('docs/qa/evidence/epic-f/release-gate-cleanup-source-binding.json').extractions.find(r=>r.path===path);
   if(cleanup.oldSha256===expected){const original=require('./epic-f-release-cleanup-binding').verifyExtraction(cleanup,p=>p===path?row.originalBody:fs.readFileSync(p,'utf8'));return E.hash(original)===expected;}
  }
  return false;
 }catch{return false;}
}
function approvedNewSnippet(path){
 if(!active())return false;
 try{const b=verify();if(b.runtimeDelta.some(r=>r.path===path&&r.oldSha256===null))return true;
  const extraction=E.read('docs/qa/evidence/epic-f/release-gate-cleanup-source-binding.json').extractions.find(r=>r.snippet===path),delta=extraction&&b.runtimeDelta.find(r=>r.path===extraction.path);
  if(!extraction||!delta)return false;
  assert.equal(E.hash(fs.readFileSync(path)),extraction.snippetSha256);
  const original=require('./epic-f-release-cleanup-binding').verifyExtraction(extraction,p=>p===delta.path?delta.originalBody:fs.readFileSync(p,'utf8'));
  return E.hash(original)===extraction.oldSha256;
 }catch{return false;}
}
module.exports={BINDING,PARENT,RUNTIME,active,verify,historicalSourceMatches,approvedNewSnippet};
