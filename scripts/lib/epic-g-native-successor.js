'use strict';
// A native-field successor of immutable G evidence, never a compatibility grant.
const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('./epic-e-owner-response-adapter');
const MANIFEST='data/epic-g-native-successor.json';
function verify(envelope,manifest=E.read(MANIFEST)){
 assert.equal(manifest.scope,'APPROVED_NATIVE_TITLE_AND_FOUR_PRICES');assert.equal(manifest.compatibilityApproval,false);
 assert.equal(E.hash(fs.readFileSync(manifest.predecessor.path)),manifest.predecessor.sha256,'Native predecessor evidence changed');
 const before=E.read(manifest.predecessor.path),ledger=E.read('data/epic-g-commercial-decisions.json'),approved=ledger.rows.filter(r=>r.status==='APPLIED');assert.equal(approved.length,4);
 const normalized=structuredClone(envelope.snapshot.datasets),seen=new Set();
 for(const c of manifest.changes){
  const key=c.dataset+'|'+c.id+'|'+c.field;assert(!seen.has(key),'Duplicate native successor field');seen.add(key);
  const row=approved.find(r=>c.dataset==='products'?r.productGid===c.id:r.variantGid===c.id);assert(row,'Unapproved native owner');
  if(c.field==='price'){assert.equal(c.dataset,'variants');assert.equal(c.before,'0.00');assert.equal(c.after,row.approvedPrice);}
  else if(c.field==='title'){assert.equal(c.dataset,'products');assert.equal(c.before,row.previousTitle);assert.equal(c.after,row.approvedTitle);}
  else if(c.field==='displayName'){assert.equal(c.dataset,'variants');assert(row.approvedTitle);assert.equal(c.before,row.previousTitle+' - Default Title');assert.equal(c.after,row.approvedTitle+' - Default Title');}
  else{assert.equal(c.field,'updatedAt');assert(Number.isFinite(Date.parse(c.after)));}
  const old=before.snapshot.datasets[c.dataset].records.find(r=>r.id===c.id),now=normalized[c.dataset].records.find(r=>r.id===c.id);assert(old&&now,'Native identity missing');assert.deepEqual(old[c.field],c.before);assert.deepEqual(now[c.field],c.after,'Native successor drift '+key);now[c.field]=structuredClone(c.before);
 }
 for(const name of ['products','variants'])assert.deepEqual(normalized[name].records,before.snapshot.datasets[name].records,'Unapproved native '+name+' drift beyond exact successor');
 assert.equal(manifest.changes.filter(c=>c.field==='price').length,4);assert.equal(manifest.changes.filter(c=>c.field==='title').length,1);
 return {status:'PASS',manifest:MANIFEST,manifestSha256:E.hash(fs.readFileSync(MANIFEST)),predecessor:manifest.predecessor,exactChanges:manifest.changes,compatibilityApproval:false,receiptRenewed:false};
}
module.exports={MANIFEST,verify};
