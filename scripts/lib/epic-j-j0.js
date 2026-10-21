'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const E=require('./epic-e-owner-response-adapter');
const CONTRACT='data/epic-j-j0-contract.json';
function directory(){const p=process.env.RHINO_J_EVIDENCE_DIR;assert(p,'RHINO_J_EVIDENCE_DIR required');const base=path.resolve('docs/qa/evidence/epic-j');assert(path.resolve(p).startsWith(base+path.sep),'Isolated Epic J evidence required');return p;}
function outputPath(name){const p=path.resolve(directory(),name);assert(p.startsWith(path.resolve(directory())+path.sep),'Historical/traversal output denied');return p;}
function write(name,value){const p=outputPath(name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(value,null,2)+'\n',{flag:'wx'});}
function requestAllowed({pathname,method='GET',resourceType='document',navigation=false}){
 if(pathname==='/checkouts/internal/preloads.js'&&method==='GET'&&resourceType==='script'&&!navigation)return true;
 if(/\/(checkouts?|payments?|orders?|admin|account)(\/|$)/.test(pathname))return false;
 return true;
}
function verifyPolicy(policy,decisions){
 assert.equal(policy.promises.length,0,'J0 authorizes no new shipping, compatibility or service promise');
 assert.equal(policy.accountRequired,false);assert.equal(policy.zeroPriceRestriction,false);assert.equal(policy.compatibilityInference,false);assert.equal(policy.inCheckoutUI,false,'Basic does not entitle checkout-step UI extensions');assert.equal(policy.checkoutBrandingAPI,false);
 for(const promise of policy.promises){const approval=decisions.find(d=>d.id===promise.decisionId);assert(approval&&approval.status==='APPROVED'&&approval.approvedText===promise.text,'Unapproved commercial/shipping/service promise');}
}
function verifyRegister(register,decisions){
 const ids=new Set(register.items.map(p=>p.id));assert.equal(ids.size,register.items.length);assert(register.items.length>=6&&register.items.length<=10);
 for(const p of register.items){for(const key of ['id','title','userValue','baseline','scope','exclusions','dependencies','acceptanceCriteria','verification','files','decisionIds','mvp','batch'])assert(p[key]!==undefined,'Missing PBI field '+key);for(const id of p.dependencies)assert(id==='J0'||ids.has(id),'Unknown PBI dependency');for(const id of p.decisionIds)assert(decisions.some(d=>d.id===id),'Absent required decision '+id);assert.equal(p.implementationAuthorized,false,'J0 cannot authorize later implementation');}
}
function verifyInventory(actual,expected){assert.equal(actual.id,expected.id);assert.equal(actual.role,expected.role);assert.equal(actual.pages.at(-1).hasNextPage,false,'Truncated theme inventory');assert.deepEqual(actual.nodes,expected.nodes,'MAIN or unrelated preview modification');}
function verifyFixture(cart,read){
 assert.equal(cart.currency,'USD');const ids=new Set();for(const i of cart.items.concat(cart.machine?[cart.machine]:[])){assert(!ids.has(i.variantId),'Duplicate fixture identity');ids.add(i.variantId);const v=read.snapshot.datasets.variants.records.find(v=>v.id==='gid://shopify/ProductVariant/'+i.variantId);assert(v&&v.product.id===i.productGid,'Incorrect Variant ownership');assert.equal(i.priceCents,Math.round(Number(v.price)*100),'Fixture price drift');assert(i.quantity>0);}
}
function verifySource(contract,read,asOf=Date.now()){
 assert(asOf<Date.parse(contract.receiptExpiresAt),'E/F owner receipt expired');assert(asOf>=Date.parse(read.startedAt)&&asOf<Date.parse(read.startedAt)+7*86400000,'Admin evidence expired');
 assert.deepEqual(require('../validate-epic-g-foundation').validateRead(read),[],'Incomplete or altered Admin observation');
 const I=require('./epic-g-integrated'),current=I.current(contract.adminRead);require('./epic-g-native-successor').verify(read);return current;
}
function protectedState(contract){
 const missing=[],changed=[];for(const r of contract.protectedSources){if(!fs.existsSync(r.path))missing.push(r.path);else if(E.hash(fs.readFileSync(r.path))!==r.sha256)changed.push(r.path);}assert.deepEqual(missing,[],'Protected source missing');assert.deepEqual(changed,[],'Protected cart/Product/E/F/G source drift');return {status:'PASS',checked:contract.protectedSources.length,missing,changed};
}
function taskProtection(contract=E.read(CONTRACT)){
 const before=E.read(contract.evidenceDirectory+'/repository-before.json'),changed=[],missing=[];
 for(const r of before.files){if(!fs.existsSync(r.path))missing.push(r.path);else if(E.hash(fs.readFileSync(r.path))!==r.sha256)changed.push(r.path);}
 const unauthorized=changed.filter(p=>p!=='package.json');
 if(changed.includes('package.json')){const pkg=E.read('package.json');for(const k of ['validate:epic-j-readiness','test:epic-j-readiness','test:epic-j-cart','validate:epic-j-j0'])delete pkg.scripts[k];const text=JSON.stringify(pkg,null,2)+'\n',expected=before.files.find(p=>p.path==='package.json').sha256;assert([text,text.replaceAll('\n','\r\n')].some(s=>E.hash(s)===expected),'Unrelated package change');}
 const known=new Set(before.files.map(r=>r.path)),added=[];function walk(d){for(const n of fs.readdirSync(d,{withFileTypes:true})){if(['.git','node_modules','.idea','test-results','playwright-report'].includes(n.name))continue;const p=require('node:path').join(d,n.name).replaceAll('\\','/').replace(/^\.\//,'');if(p.startsWith('docs/qa/evidence/epic-j/'))continue;if(n.isDirectory())walk(p);else if(!known.has(p))added.push(p);}}walk('.');const extra=added.filter(p=>!/^data\/epic-j-|^scripts\/(lib\/)?(epic-j-|test-epic-j-|validate-epic-j-|run-epic-j-|measure-epic-j-|recover-epic-j-)|^tests\/(fixtures\/)?epic-j-|^docs\/(project\/|architecture\/)?(epic-j-|rhino-lapidary-pbi-tracker-epic-j)/.test(p));assert.deepEqual(extra,[],'Unapproved new source');assert.deepEqual(missing,[]);assert.deepEqual(unauthorized,[],'Historical or existing source modified');return {status:'PASS',baselineAt:before.at,checked:before.files.length,changed,added,missing,unauthorized,historicalEvidenceChanged:changed.filter(p=>p.startsWith('docs/qa/evidence/')),customerFacingChanges:0};
}
function validate({contract=E.read(CONTRACT),policy=contract.policy,register=E.read('docs/project/epic-j-proposed-backlog.json'),decisions=E.read('data/epic-j-business-decisions.json').decisions,read=E.read(contract.adminRead),checkDisk=true}={}){
 const results=[];function check(id,fn){try{const details=fn();results.push({id,status:'PASS',details});}catch(e){results.push({id,status:/expired|unavailable/.test(e.message)?'BLOCKED':'FAIL',reason:e.message});}}
 check('protected-cart-product-and-approval-sources',()=>checkDisk?protectedState(contract):{fixtureOnly:true});
 check('native-cart-routes',()=>{const t=JSON.parse(fs.readFileSync('templates/cart.json'));assert.equal(t.sections['cart-items'].type,'main-cart-items');assert.equal(t.sections['cart-footer'].type,'main-cart-footer');const s=fs.readFileSync('assets/product-form.js','utf8');assert(s.includes('this.variantIdInput.disabled = false')&&s.includes('routes.cart_add_url'));assert(fs.readFileSync('sections/main-cart-footer.liquid','utf8').includes('name="checkout"'));});
 check('policy-and-plan-boundaries',()=>{const c=E.read(contract.capabilities);assert.equal(c.response.data.shop.myshopifyDomain,'sz5dnk-nf.myshopify.com');assert.equal(c.response.data.shop.plan.publicDisplayName,'Basic');assert.equal(c.response.data.shop.plan.shopifyPlus,false);assert.notEqual(c.response.data.shop.customerAccounts,'REQUIRED');assert(Date.now()<Date.parse(c.capturedAt)+7*86400000,'Plan evidence expired');verifyPolicy(policy,decisions);});
 check('decision-dependencies-and-PBIs',()=>verifyRegister(register,decisions));
 check('fixture-native-identity',()=>verifyFixture(E.read('tests/fixtures/epic-j-cart.json'),read));
 check('current-E-F-G-authority',()=>{const c=verifySource(contract,read);return {expiresAt:c.report.source.expiresAt,counts:c.report.counts,nativeSuccessor:'PASS'};});
 check('remote-theme-protection',()=>{for(const id of ['158579622085','158631198917'])verifyInventory(E.read(directory()+'/inventory-'+id+'.json'),E.read(contract.themeBaseline+'/closing-inventory-'+id+'.json'));});
 return {schemaVersion:1,at:new Date().toISOString(),status:results.some(r=>r.status==='FAIL')?'FAIL':results.some(r=>r.status==='BLOCKED')?'BLOCKED':'PASS',results,scope:'ENGINEERING_BASELINE_NO_J_IMPLEMENTATION',customerFacingChanges:0};
}
module.exports={CONTRACT,directory,outputPath,write,requestAllowed,verifyPolicy,verifyRegister,verifyInventory,verifyFixture,verifySource,protectedState,taskProtection,validate};
