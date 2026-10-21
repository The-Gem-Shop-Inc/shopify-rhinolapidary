'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),P=require('./lib/epic-g-current-protection'),E=require('./lib/epic-e-owner-response-adapter');
const tests=[];function test(name,fn){try{fn();tests.push({name,passed:true});}catch(e){tests.push({name,passed:false,error:e.message});}}
test('exact authorized template delta passes',()=>P.assertTemplate());
for(const name of ['title','price','inventory','variant-picker','quantity-selector','buy-buttons','description','share','sku','rhino-g-fit'])test('reject removed block '+name,()=>{const t=P.expectedTemplate();delete t.sections.main.blocks[name];assert.throws(()=>P.assertTemplate(JSON.stringify(t)));});
for(const [name,change]of Object.entries({
 'reordered native blocks':t=>t.sections.main.block_order.reverse(),
 'unexpected block':t=>t.sections.main.blocks.injected={type:'custom_liquid',settings:{custom_liquid:'Unsupported'}},
 'dynamic checkout enabled':t=>t.sections.main.blocks['buy-buttons'].settings.show_dynamic_checkout=true,
 'quantity setting':t=>t.sections.main.blocks['quantity-selector'].settings.injected=true,
 'Variant picker changed':t=>t.sections.main.blocks['variant-picker'].settings.picker_type='dropdown',
 'price block changed':t=>t.sections.main.blocks.price.type='custom_liquid',
 'share changed':t=>t.sections.main.blocks.share.settings.share_label='Unsupported',
 'Related products semantics':t=>t.sections['related-products'].settings.heading='Compatible products',
 'gallery settings changed':t=>t.sections.main.settings.image_zoom='none',
 'unapproved fit call':t=>t.sections.main.blocks['rhino-g-fit'].settings.custom_liquid+='Unsupported',
 'section removal':t=>delete t.sections.disclosures,
 'section reordering':t=>t.order.reverse()
}))test('reject '+name,()=>{const t=P.expectedTemplate();change(t);assert.throws(()=>P.assertTemplate(JSON.stringify(t)));});
test('unknown template predecessor is rejected',()=>assert.throws(()=>P.surfaceMatches(P.TEMPLATE,'unknown')));
test('current approved release verifies without changing historical files',()=>{const r=P.currentRelease();assert.equal(r.binding,E.read(require('./lib/epic-f-final-owner-binding').BINDING).bindingSha256);assert(r.customerGrants>0&&r.media>0);});
test('historical zero facts/context are reproduced separately',()=>{
 const C=require('./lib/epic-f-consumer'),b=E.read(require('./lib/epic-f-final-owner-binding').BINDING),saved=process.env.RHINO_EPIC_F_OWNER_BINDING;delete process.env.RHINO_EPIC_F_OWNER_BINDING;
 try{for(const [path,body]of [['snippets/rhino-product-fact-projection.liquid',C.buildFactProjection()],['snippets/rhino-product-context-delivery-projection.liquid',C.buildContextDeliveryProjection()]]){const r=b.runtimeDelta.find(r=>r.path===path);assert.equal(E.hash(r.originalBody),r.oldSha256);assert.equal(body,r.originalBody);}assert.equal(E.read('data/epic-f-consumer-release.json').grants.length,0);}finally{process.env.RHINO_EPIC_F_OWNER_BINDING=saved;}
});
test('changed owner release grant is rejected',()=>{const read=E.read;try{E.read=path=>{const x=read(path);if(path===require('./lib/epic-f-customer-release').RELEASE)x.grants.pop();return x;};assert.throws(()=>require('./lib/epic-f-customer-release').verifyRelease());}finally{E.read=read;}});
test('actual bound machine renderer regression is rejected',()=>{const read=fs.readFileSync,target='snippets/rhino-owner-approved-facts.liquid';try{fs.readFileSync=function(path,...args){const value=read.call(fs,path,...args);return String(path).replaceAll('\\','/').endsWith(target)?(typeof value==='string'?value+'Unsupported':Buffer.concat([value,Buffer.from('Unsupported')])):value;};assert.throws(()=>require('./lib/epic-f-final-owner-binding').verify());}finally{fs.readFileSync=read;}});
const literal=require('./validate-rhino-style-contract').findLiteralColorsOutsideRoot;
test('native foreground tuple is a governed reference, not a literal color',()=>assert.deepEqual(literal('.x{border:1px solid rgba(var(--color-foreground), .2)}'),[]));
for(const value of ['#fff','rgb(1,2,3)','rgba(1,2,3,.2)','hsl(0,0%,0%)','rgba(var(--unknown), .2)','rgba(var(--color-foreground, #fff), .2)','rgba(var(--color-foreground), 1.2)'])test('style rejects '+value,()=>assert(literal('.x{color:'+value+'}').length));
const Guard=require('./deploy-epic-g-products-preview');
function inputs(){const at='2026-10-16T12:00:00Z';return {now:Date.parse(at),inventory:{capturedAt:at,id:'gid://shopify/OnlineStoreTheme/158631198917',name:'Rhino Lapidary - Preview',role:'UNPUBLISHED'},main:{capturedAt:at,id:'gid://shopify/OnlineStoreTheme/158579622085',role:'MAIN'},gates:[...Guard.REQUIRED,...['playwright.machine.config.js','playwright.machine-gallery.config.js'].map(c=>'npm.cmd exec playwright test -- --config='+c)].map(command=>({command,exitCode:0})),baseline:{completedAt:at,failures:[],cells:Array.from({length:22},()=>({machine:true}))},bodies:{capturedAt:at,data:{theme:{id:'gid://shopify/OnlineStoreTheme/158631198917',role:'UNPUBLISHED',files:{pageInfo:{hasNextPage:false},nodes:[{filename:P.TEMPLATE,body:{content:JSON.stringify(P.nativeTemplate())}}]}}}}};}
test('preview guard accepts exact reviewed inputs without writing',()=>Guard.checkInputs(inputs()));
for(const [name,mutate]of Object.entries({
 'MAIN as target':x=>x.inventory.id=x.main.id,'published preview':x=>x.inventory.role='MAIN',
 'stale identity':x=>x.inventory.capturedAt='2026-10-15T12:00:00Z','wrong MAIN identity':x=>x.main.id=x.inventory.id,
 'missing named gate':x=>x.gates.shift(),'failed gate':x=>x.gates[0].exitCode=1,
 'duplicate gate':x=>x.gates.push(x.gates[0]),'only eight machine coverage':x=>x.baseline.cells=x.baseline.cells.slice(0,16),
 'baseline regression':x=>x.baseline.failures.push('regression'),'truncated backup':x=>x.bodies.data.theme.files.pageInfo.hasNextPage=true,
 'unrelated overwrite':x=>x.bodies.data.theme.files.nodes.push({filename:'templates/index.json'}),
 'changed remote native template':x=>x.bodies.data.theme.files.nodes[0].body.content='{}'
}))test('preview guard rejects '+name,()=>{const x=inputs();mutate(x);assert.throws(()=>Guard.checkInputs(x));});
const out={passed:tests.filter(t=>t.passed).length,failed:tests.filter(t=>!t.passed).length,tests,AdminMutations:0};const dir=process.env.RHINO_G2_EVIDENCE_DIR||'docs/qa/evidence/epic-g/g2-recovery-2026-10-16';fs.writeFileSync(dir+'/protection-tests.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out,null,2));if(out.failed)process.exitCode=1;
