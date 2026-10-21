'use strict';
// Current acceptance adapter. Historical F source files/receipts are not rewritten.
const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('./epic-e-owner-response-adapter');
const TEMPLATE='templates/product.json',FIXTURE='tests/fixtures/epic-g-recovery/native-product.json';
const before=E.read('docs/qa/evidence/epic-g/g2-2026-10-16/repository-before.json');
function nativeTemplate(){const text=fs.readFileSync(FIXTURE,'utf8');assert.equal(E.hash(text),require('../../tests/fixtures/epic-f-native-baseline.json')[TEMPLATE]);return JSON.parse(text);}
function expectedTemplate(){const t=nativeTemplate(),m=t.sections.main;m.blocks.sku={type:'custom_liquid',settings:{custom_liquid:"{% render 'rhino-g-product-detail', product: product, section: section %}"}};
 m.blocks['rhino-g-fit']={type:'custom_liquid',settings:{custom_liquid:"{% render 'rhino-g-product-fit', product: product, section: section, heading: 'Fits these machines' %}"}};
 m.block_order.splice(m.block_order.indexOf('description')+1,0,'rhino-g-fit');return t;}
function assertTemplate(text=fs.readFileSync(TEMPLATE,'utf8')){assert.deepEqual(JSON.parse(text),expectedTemplate(),'Only the two exact G2 extensions may differ from native Product architecture');return true;}
function activate(){
 const B=require('./epic-f-final-owner-binding');const binding=B.verify();
 for(const [key,value]of Object.entries({RHINO_EPIC_F_OWNER_BINDING:B.BINDING,RHINO_EPIC_F_MEDIA_BINDING:require('./epic-f-live-media-activation').BINDING,RHINO_EPIC_F_HEADER_FOCUS_BINDING:'docs/qa/evidence/epic-f/header-focus-correction-2026-10-06/source-binding.json'})){
  assert(!process.env[key]||process.env[key]===value,'Unexpected binding selector '+key);process.env[key]=value;
 }
 require('./epic-f-customer-release').verifyRelease();require('./epic-f-live-media-activation').verifyBinding();return binding;
}
function surfaceMatches(path,oldHash,text=fs.readFileSync(path,'utf8')){
 if(path===TEMPLATE){const known=[require('../../tests/fixtures/epic-f-native-baseline.json')[TEMPLATE],before.theme.find(r=>r.path===TEMPLATE).sha256];assert(known.includes(oldHash),'Unknown historical default template baseline');assertTemplate(text);return true;}
 const B=require('./epic-f-final-owner-binding'),binding=B.verify(),delta=[...binding.runtimeDelta,...binding.qaDelta].find(r=>r.path===path);
 // The full current binding is verified above; only a recorded predecessor can succeed.
 if(delta?.originalBody&&delta.oldSha256===oldHash){assert.equal(E.hash(delta.originalBody),oldHash);assert.equal(E.hash(text),delta.sha256);return true;}
 return false;
}
function currentRelease(){activate();assertTemplate();const out=require('./epic-f-customer-release').verifyRelease();return {binding:require('./epic-f-final-owner-binding').verify().bindingSha256,customerGrants:out.release.grants.length,media:E.read('data/epic-f-media-release.json').grants.length,pages:out.release.pageSummary};}
module.exports={TEMPLATE,FIXTURE,nativeTemplate,expectedTemplate,assertTemplate,activate,surfaceMatches,currentRelease};
