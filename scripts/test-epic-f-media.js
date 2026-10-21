'use strict';
const assert = require('node:assert/strict');
const { evaluateMedia, fixtureLiquid } = require('./lib/epic-f-media');
const { galleryFixture, galleryDocument } = require('./lib/epic-f-gallery-fixtures');
let count = 0;
function check(name, run) { run(); count++; console.log(`PASS ${name}`); }
for (const [state, expected] of [['zero',0],['one',1],['multiple',2],['several',4],['video',2]]) check(state,()=>assert.equal(evaluateMedia(galleryFixture(state)).eligible.length,expected));
for (const state of ['duplicate','wrong-model','wrong-product','unapproved','rights-missing','alt-missing','claims-blocked','deleted','orphan','shared','expired','draft','unpublished']) check(state,()=>assert.equal(evaluateMedia(galleryFixture(state)).eligible.length,0));
for (const [name, mutate] of [
  ['real media GID',f=>f.items[0].mediaId='gid://shopify/MediaImage/123'],
  ['real asset URL',f=>f.items[0].source='https://cdn.shopify.com/real.jpg'],
  ['filename-derived approval',f=>delete f.items[0].exactModelUse],
  ['missing alt text',f=>f.items[0].alt=''],
  ['decorative inspection photo',f=>f.items[0].purpose='decorative'],
  ['alt HTML injection',f=>f.items[0].alt='<script>alert(1)</script>'],
  ['alt Liquid injection',f=>f.items[0].alt='{% endif %}'],
  ['missing dimensions',f=>delete f.items[0].width],
  ['internal audience',f=>f.items[0].audience='internal'],
  ['invalid expiry',f=>f.items[0].expiresAt='invalid'],
  ['nonfixture review reference',f=>f.items[0].rightsUse.reference='real-approval'],
  ['malformed item',f=>f.items=[null]],
  ['missing fixture boundary',f=>f.fixtureOnly=false],
]) check(name,()=>{const f=galleryFixture('one');mutate(f);assert.equal(evaluateMedia(f).eligible.length,0);});
check('compiler refuses real identities',()=>{const f=galleryFixture('one');f.items[0].assetIdentity='gid://shopify/MediaImage/123';assert.throws(()=>fixtureLiquid(f));});
check('duplicate canonical asset with another media ID',()=>{const f=galleryFixture('duplicate');f.items[1].mediaId='fixture-other';assert.equal(evaluateMedia(f).eligible.length,0);});
check('shared asset needs separate exact use review',()=>{const f=galleryFixture('shared');f.items[0].sharedUse={state:'approved',reference:'fixture:separate-exact-use'};assert.equal(evaluateMedia(f).eligible.length,1);});
const identities=require('../data/epic-e-product-identity.json').productIdentities;
check('SawMaster 24 and 36 shared reference remains blocked',()=>{
  const saws=identities.filter(p=>['sawmaster-24','sawmaster-36'].includes(p.handle));assert.equal(saws.length,2);
  const observed=require('../docs/qa/evidence/epic-f/2026-09-10-machine-admin-read.json').data.nodes.filter(p=>saws.some(s=>s.productGid===p.id));
  assert.equal(observed[0].media.nodes[0].id,observed[1].media.nodes[0].id);
  for(const p of observed){const f=galleryFixture('one');f.items[0].mediaId=p.media.nodes[0].id;assert.throws(()=>fixtureLiquid(f));}
  for(const product of saws){const f=galleryFixture('one');f.productGid=f.items[0].productGid=f.items[0].modelProductGid=product.productGid;f.items[0].observedProductGids=saws.map(p=>p.productGid);assert.equal(evaluateMedia(f).eligible.length,0);}
});
check('EM-1 embedded patent review blocks asset',()=>{const p=identities.find(p=>p.currentTitle==='EM-1 Machine');assert(p);const f=galleryFixture('claims-blocked');f.productGid=f.items[0].productGid=f.items[0].modelProductGid=p.productGid;assert.equal(evaluateMedia(f).eligible.length,0);});
check('TumbleMaster no-media is valid',()=>{const p=identities.find(p=>/TumbleMaster/.test(p.currentTitle));assert(p);const f=galleryFixture('zero');f.productGid=p.productGid;assert.equal(evaluateMedia(f).eligible.length,0);assert(galleryDocument('zero',{input:f}).includes('product--no-media'));});
check('approved alt is not replaced with title or filename',()=>{const f=galleryFixture('one');f.items[0].alt='';assert(!galleryDocument('one',{input:f}).includes('<media-gallery'));});
console.log(`${count} media contract checks passed; synthetic approvals cannot authorize Shopify media.`);
