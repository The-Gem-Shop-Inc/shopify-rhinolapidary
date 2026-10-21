'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const E=require('./epic-e-owner-response-adapter'),G=require('./epic-g-foundation');
const STATES=['PASS','FAIL','BLOCKED','DEFERRED','NOT APPLICABLE'];
function aggregate(rows){assert(rows.every(r=>STATES.includes(r.status)));if(rows.some(r=>r.status==='FAIL'))return 'FAIL';if(rows.some(r=>r.status==='BLOCKED'))return 'BLOCKED';if(rows.some(r=>r.status==='PASS'))return 'PASS';return rows.some(r=>r.status==='DEFERRED')?'DEFERRED':'NOT APPLICABLE';}
function dir(){const d=process.env.RHINO_G4_EVIDENCE_DIR;assert(d,'G4 evidence directory required');const full=path.resolve(d),base=path.resolve('docs/qa/evidence/epic-g');assert(full.startsWith(base+path.sep)&&path.basename(full).startsWith('g4-'),'Unique G4 evidence location required');return d;}
function write(name,value){const target=path.join(dir(),name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(value,null,2)+'\n');return value;}
function commercial(envelope,ledger=E.read('data/epic-g-commercial-decisions.json')){
 const old=E.read('docs/qa/evidence/epic-g/g3b-2026-10-19/admin-read.json'),variants=envelope.snapshot.datasets.variants.records,prior=old.snapshot.datasets.variants.records;
 const approved=ledger.rows.filter(r=>r.status==='APPLIED');assert.equal(approved.length,4);
 require('./epic-g-native-successor').verify(envelope);
 const changes=[];
 for(const v of variants){const b=prior.find(b=>b.id===v.id);assert(b,'Unknown Variant');if(b.price!==v.price){const decision=approved.find(r=>r.variantGid===v.id&&r.productGid===v.product.id);assert(decision&&v.price===decision.approvedPrice,'UNAUTHORIZED_COMMERCIAL_PRICE_CHANGE '+v.id);changes.push({productGid:v.product.id,variantGid:v.id,before:b.price,after:v.price,authorization:ledger.decisionSource});}}
 for(const r of ledger.rows){const v=variants.find(v=>v.id===r.variantGid);assert(v&&v.product.id===r.productGid,'COMMERCIAL_IDENTITY_MISMATCH');assert.equal(v.price,r.status==='APPLIED'?r.approvedPrice:(r.expectedNativePrice??r.observedPrice),'COMMERCIAL_STATE_DRIFT');if(r.status!=='APPLIED'){assert.equal(r.commercialReady,false);assert.equal(r.purchaseMitigationExecuted,false);}}
 assert.equal(ledger.mappingApproved,false);assert.equal(ledger.technicalQAAllowed,true);
 return {status:'PASS',appliedChanges:changes,rows:ledger.rows.map(r=>({...r,observedPrice:variants.find(v=>v.id===r.variantGid).price})),launchStatus:'BLOCKED',launchBlockers:ledger.rows.filter(r=>!r.commercialReady),mutations:0};
}
// Observe all actual native prices even when the strict authorization verifier fails.
function observeCommercial(envelope){
 const ledger=E.read('data/epic-g-commercial-decisions.json'),variants=envelope.snapshot.datasets.variants.records;
 let result;try{result=commercial(envelope,ledger);}catch(e){result={status:'FAIL',reason:e.message,launchStatus:'BLOCKED',mutations:0};}
 const prior=E.read('docs/qa/evidence/epic-g/g3b-2026-10-19/admin-read.json').snapshot.datasets.variants.records;
 result.nativePriceChanges=variants.flatMap(v=>{const b=prior.find(x=>x.id===v.id);if(!b||b.price===v.price)return [];const r=ledger.rows.find(x=>x.variantGid===v.id&&x.productGid===v.product.id);return [{productGid:v.product.id,variantGid:v.id,before:b.price,after:v.price,approved:r?.status==='APPLIED'&&r.approvedPrice===v.price,updatedAt:v.updatedAt}];});
 result.rows=ledger.rows.map(r=>({...r,observedPrice:variants.find(v=>v.id===r.variantGid)?.price??null}));result.launchBlockers=result.rows.filter(r=>!r.commercialReady);return result;
}
// Exact current-price successor of historical browser assertions. Default historical
// tests remain byte-for-byte comparisons; this opt-in never changes historical data.
function currentNativeExpected(before,envelope){
 const ledger=E.read('data/epic-g-commercial-decisions.json');
 const out=structuredClone(before),r=ledger.rows.find(r=>r.status==='APPLIED'&&r.productGid===before.productGid);
 out.jsonLd=out.jsonLd.map(s=>JSON.parse(s));
 if(!r)return out;
 require('./epic-g-native-successor').verify(envelope);
 if(r.approvedTitle){assert.equal(out.title,r.previousTitle);out.title=r.approvedTitle;for(const schema of out.jsonLd){if(schema['@type']==='Product'){assert.equal(schema.name,r.previousTitle);schema.name=r.approvedTitle;}if(schema['@type']==='BreadcrumbList')for(const item of schema.itemListElement||[])if(new URL(item.item,'https://rhino-lapidary.myshopify.com').pathname==='/products/'+r.handle){assert.equal(item.name,r.previousTitle);item.name=r.approvedTitle;}}}

 assert.equal('gid://shopify/ProductVariant/'+before.variantId,r.variantGid);
 assert(before.price.includes('$0.00'),'Known historical zero-price baseline required');out.price=before.price.replaceAll('$0.00','$'+r.approvedPrice);
 let changed=0;
 for(const schema of out.jsonLd){if(schema['@type']!=='Product')continue;for(const offer of [schema.offers].flat()){assert(offer);const id=new URL(offer.url,'https://rhino-lapidary.myshopify.com').searchParams.get('variant');assert.equal('gid://shopify/ProductVariant/'+id,r.variantGid);assert.equal(offer.priceCurrency,'USD');assert.equal(offer.price,'0.00');offer.price=r.approvedPrice;changed++;}}
 assert.equal(changed,1);return out;
}
function assertCurrentNative(actual,before,envelope){const expected=currentNativeExpected(before,envelope),observed={...actual,jsonLd:actual.jsonLd.map(s=>JSON.parse(s))};assert.deepEqual(observed,expected,'Native/F output regression beyond exact approved price changes');}
function current(read){const envelope=E.read(read);assert.deepEqual(require('../validate-epic-g-foundation').validateRead(envelope),[]);const report=G.assess(G.loadAuthority(),envelope);assert(report.source.current&&report.reconciliation.complete&&report.reconciliation.liveAdmin,'Current exact G1 reconciliation required');assert.equal(report.reconciliation.publicationDrift.length,0);require('./epic-g-native-successor').verify(envelope);return {envelope,report};}
function remoteProductTemplate(text){return require('./epic-g-current-protection').assertTemplate(text.replace(/^\s*\/\*[\s\S]*?\*\/\s*/,''));}
function themeBody(node,inventoryChecksum){
 assert.equal(node.checksumMd5,inventoryChecksum,'Stored body/inventory checksum mismatch '+node.filename);
 const text=node.body.content,stored=node.filename.startsWith('templates/')&&node.filename.endsWith('.json')?text.replace(/^\s*\/\*[\s\S]*?\*\/\s*/,''):text;
 const md5=require('node:crypto').createHash('md5').update(stored).digest('hex');
 // Shopify's settings-data read representation is not the stored-byte checksum
 // representation. Protect its unchanged stored checksum, without claiming raw
 // equality. Templates instead have a reproducible generated-header transform.
 if(node.filename!=='config/settings_data.json')assert.equal(md5,inventoryChecksum,'Stored representation mismatch '+node.filename);
 return {path:node.filename,sha256:E.hash(text),storedChecksumMd5:inventoryChecksum,bodyRepresentationMd5:md5,representation:node.filename==='config/settings_data.json'?'Unchanged stored checksum; separate formatted API body digest, no raw-byte equality claim':'Verified stored representation; templates omit generated API header'};
}
function remote(){
 const d=dir(),old='docs/qa/evidence/epic-g/g3b-2026-10-19/';
 const results=[];for(const [id,name]of [['158579622085','main'],['158631198917','preview']]){
  const now=E.read(d+'/inventory-'+id+'.json'),prior=E.read(old+name+'-inventory-after-entry.json');
  assert.equal(now.id,prior.id);assert.equal(now.role,name==='main'?'MAIN':'UNPUBLISHED');assert.equal(now.pages.at(-1).hasNextPage,false);const expected=structuredClone(prior.nodes);if(name==='preview'&&fs.existsSync(d+'/fit-readback-proof.json')){const receipt=require('./epic-g-fit-refresh').verifyReadback(d);const row=expected.find(n=>n.filename===receipt.file);assert.equal(row.checksumMd5,receipt.beforeMd5);row.checksumMd5=receipt.afterMd5;}assert.deepEqual(now.nodes,expected,'Theme inventory drift '+id);
  const bodies=E.read(d+'/files-'+id+'.json').data.theme;assert.equal(bodies.id,now.id);assert.equal(bodies.files.pageInfo.hasNextPage,false);
  const keys=require('./epic-g-catalog').FILES.concat(require('./epic-g-catalog-entry').FILES,['assets/rhino-storefront.js','templates/product.json','snippets/rhino-g-product-detail.liquid','snippets/rhino-g-product-fit.liquid','assets/rhino-g-product.css','assets/rhino-g-fit.js']);
  const hashes=bodies.files.nodes.map(n=>themeBody(n,now.nodes.find(r=>r.filename===n.filename)?.checksumMd5));
  if(name==='preview')for(const p of keys){const row=hashes.find(h=>h.path===p);assert(row,'Missing remote body '+p);if(p==='templates/product.json'){remoteProductTemplate(bodies.files.nodes.find(n=>n.filename===p).body.content);row.representation='Exact G2 native template structure; unchanged remote checksum preserves Shopify generated header/formatting';}else assert.equal(row.sha256,E.hash(fs.readFileSync(p)),'Preview source drift '+p);}
  results.push({id,role:now.role,files:now.nodes.length,capturedAt:now.capturedAt,fullInventoryUnchanged:JSON.stringify(now.nodes)===JSON.stringify(prior.nodes),authorizedFitRefresh:name==='preview'&&fs.existsSync(d+'/fit-readback-proof.json')?E.read(d+'/fit-readback-proof.json'):null,bodyHashes:hashes});
 }return {status:'PASS',themes:results,previewWrites:0,MAINWrites:0,publications:0};
}
function protectedFiles(){
 const allowed=['package.json','docs/project/epic-g-required-decisions.md','docs/rhino-lapidary-pbi-tracker-epic-g.md','docs/project/epic-g-proposed-backlog.json','scripts/validate-epic-g-machine-routes-browser.js','scripts/lib/epic-g-product-browser-overlay.js','scripts/test-epic-g-product-runtime-overlay.js'];
 const before=E.read(dir()+'/repository-before.json'),changed=[],missing=[];
 for(const r of before.files){if(!fs.existsSync(r.path)){missing.push(r.path);continue;}const sha256=E.hash(fs.readFileSync(r.path));if(sha256!==r.sha256)changed.push({path:r.path,beforeSha256:r.sha256,afterSha256:sha256});}
 if(process.env.RHINO_G4_TARGETED_RECOVERY==='1')allowed.push('data/epic-g-commercial-decisions.json','data/epic-g-native-successor.json','data/epic-g-product-release.json','snippets/rhino-g-product-fit.liquid','scripts/lib/epic-g-integrated.js','scripts/validate-epic-g-integrated.js','scripts/test-epic-g-integrated.js','scripts/validate-epic-g-products.js','scripts/deploy-epic-g-products-preview.js','scripts/validate-epic-g-catalog-browser.js','scripts/validate-epic-g-machine-routes-browser.js','scripts/validate-epic-g-integrated-browser.js','scripts/deploy-epic-g-catalog-preview.js','scripts/test-epic-g-catalog-deployment.js','scripts/probe-epic-g-zoom-viewport.js');
 const unauthorized=changed.filter(r=>!allowed.includes(r.path));
 const out={status:missing.length||unauthorized.length?'FAIL':'PASS',checked:before.files.length,changed,missing,unauthorized,historicalEvidenceChanged:changed.filter(r=>r.path.startsWith('docs/qa/evidence/')),historicalRecovery:'DEFERRED — original G3B two-PNG exception remains unchanged; current task baseline is distinct'};
 write('protected-files.json',out);return out;
}
function captureBaseline(){
 const target=dir()+'/repository-before.json';if(fs.existsSync(target))return;
 const files=[],own=path.resolve(dir());function walk(d){for(const n of fs.readdirSync(d,{withFileTypes:true})){if(['.git','node_modules','.idea','test-results','playwright-report'].includes(n.name))continue;const p=path.join(d,n.name);if(path.resolve(p)===own)continue;if(n.isDirectory())walk(p);else files.push({path:p.replaceAll('\\','/').replace(/^\.\//,''),sha256:E.hash(fs.readFileSync(p))});}}walk('.');write('repository-before.json',{at:new Date().toISOString(),files});
}
function splitAxe(violations,provider){
 const verified=provider?.origin==='https://cdn.shopify.com'&&provider.path==='/shopifycloud/preview-bar/index.html'&&provider.scriptVerified===true;
 const providerOnly=v=>verified&&v.nodes.length>0&&v.nodes.every(target=>Array.isArray(target)&&target[0]==='#PBarNextFrame');
 return {storefront:violations.filter(v=>!providerOnly(v)),provider:violations.filter(providerOnly),providerVerified:verified};
}
function paintedShadow(value){return [...String(value).matchAll(/rgba?\(([^)]+)\)([^,]*)/g)].some(m=>{const rgba=m[1].split(',').map(Number),lengths=m[2].match(/-?[\d.]+px/g)||[];return(rgba.length<4||rgba[3]>0.05)&&lengths.some(x=>Math.abs(parseFloat(x))>0);});}
module.exports={STATES,aggregate,dir,write,commercial,observeCommercial,currentNativeExpected,assertCurrentNative,current,remote,protectedFiles,captureBaseline,remoteProductTemplate,themeBody,splitAxe,paintedShadow};
