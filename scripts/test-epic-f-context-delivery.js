'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {contextualFixture,contextDocument,asOf}=require('./lib/epic-f-context-delivery-fixtures');
const {projectContextDelivery,reverseProjection,policyRoute}=require('./lib/epic-f-context-delivery');
const consumer=require('./lib/epic-f-consumer');
const evidence=[];function test(name,run){run();evidence.push({name,status:'passed'});console.log('PASS '+name);}
test('zero modules and live deployment remain empty',()=>{assert.equal(contextualFixture('zero').projection.contextual.length,0);assert(!contextDocument('zero').includes('class="rhino-machine-facts rhino-machine-contextual'));assert(!contextDocument('combined',{allowFixtures:false}).includes('class="rhino-machine-facts rhino-machine-delivery'));});
test('accessory consumable compatibility are distinct',()=>assert.deepEqual(contextualFixture().projection.contextual.map(x=>x.meaning),['contextual_accessory','contextual_consumable','compatible']));
test('small and large contextual sets',()=>{assert.equal(contextualFixture('small').projection.contextual.length,1);assert.equal(contextualFixture('large').projection.contextual.length,12);});
for(const [name,mutate] of Object.entries({
 'duplicate edge':p=>p.edges.push(structuredClone(p.edges[0])),
 'duplicate target with distinct edge':p=>p.edges.push({...structuredClone(p.edges[0]),edgeId:'fixture:duplicate'}),
 'self reference':p=>p.edges[0].dependentProductGid=p.machineProductGid,
 'wrong machine':p=>p.edges[0].targetMachineProductGid='gid://shopify/Product/1',
 'wrong dependent GID':p=>p.edges[0].dependentProductGid='gid://shopify/Product/1',
 'stale edge':p=>p.edges[0].expiresAt='2026-09-18T11:00:00Z',
 'future edge':p=>p.edges[0].effectiveAt='2026-09-19T11:00:00Z',
 'proposed edge':p=>p.edges[0].state='proposed',
 'blocked edge':p=>p.edges[0].state='blocked',
 'conflict edge':p=>p.edges[0].conflictIds=['C-040'],
 'internal edge':p=>p.edges[0].audience='internal',
 'inactive edge':p=>p.edges[0].activation='inactive',
 'missing source authority':p=>p.edges[0].sourceIds=[],
 'generic recommendation is not compatibility':p=>p.edges[0].meaning='generic_recommendation',
 'incompatible configuration':p=>p.edges[0].scope={kind:'CONFIGURATION',variantGid:null,configurationId:'fixture:other',label:'Synthetic size B'},
 'unknown Variant':p=>p.edges[0].scope={kind:'PRODUCTVARIANT',variantGid:'gid://shopify/ProductVariant/1',configurationId:null,label:'Synthetic option'},
}))test(name,()=>{const f=contextualFixture('small',{mutate:({packet})=>mutate(packet)});assert.equal(f.projection.contextual.length,0);assert(f.projection.suppressed.length);});
for(const [name,mutate] of Object.entries({
 missing:(c,id)=>c.projectionProducts=c.projectionProducts.filter(p=>p.id!==id),
 deleted:(c,id)=>c.projectionProducts.find(p=>p.id===id).lifecycle='deleted',
 unpublished:(c,id)=>c.projectionProducts.find(p=>p.id===id).publishedAt=null,
 draft:(c,id)=>c.projectionProducts.find(p=>p.id===id).status='DRAFT',
 audience:(c,id)=>c.projectionProducts.find(p=>p.id===id).customerVisible=false,
 stale:(c,id)=>c.projectionProducts.find(p=>p.id===id).expiresAt='2020-01-01T00:00:00Z',
 'wrong class':(c,id)=>c.classification.mappings.find(p=>p.productGid===id).proposedProductClass='machine',
 'wrong handle binding':(c,id)=>c.projectionProducts.find(p=>p.id===id).handle='similar-product',
}))test(name+' target suppressed and diagnosed',()=>{const f=contextualFixture('small',{mutate:({packet,context})=>mutate(context,packet.edges[0].dependentProductGid)});assert.equal(f.projection.contextual.length,0);assert(f.projection.suppressed.length);});
test('tampered registered fixture cannot confer authority',()=>assert.equal(contextualFixture('small',{afterApproval:({packet})=>packet.edges[0].sourceIds=['fixture:changed']}).projection.contextual.length,0));
test('wrong approved positive source edge rejected',()=>{const f=contextualFixture('combined',{mutate:({packet})=>packet.edges[2].sourceRowId='fixture:missing'});assert.equal(f.projection.contextual.length,2);});
test('compatibility requires consumer migration reconciliation',()=>{const f=contextualFixture('combined',{mutate:({context})=>context.receiptsCurrent.compatibility=false});assert.equal(f.projection.contextual.length,2);});
test('scope preserves dependent Variant identity without selecting it',()=>{const f=contextualFixture('combined',{mutate:({packet,context})=>{const e=packet.edges[2],v=context.identity.variantIdentities.find(v=>v.productGid===e.dependentProductGid);e.scope={kind:'PRODUCTVARIANT',variantGid:v.variantGid,configurationId:null,label:'Synthetic dependent option'};}});const c=f.projection.contextual[2];assert(c.scope.startsWith('Dependent variant:'));assert(!c.product.url.includes('?'));assert.equal(c.source.scope.kind,'PRODUCTVARIANT');});
test('configuration scope stays explicit',()=>{const f=contextualFixture('combined',{mutate:({packet,page})=>packet.edges[2].scope={kind:'CONFIGURATION',configurationId:page.configurationId,variantGid:null,label:'Synthetic arbor configuration'}});assert(f.projection.contextual[2].scope.includes('Configuration:'));});
for(const meaning of ['included','optional','recommended','not_included'])test('contents precedence '+meaning,()=>{const f=contextualFixture('small');const gid=f.packet.edges[0].dependentProductGid;const r=reverseProjection(f.context,f.packet,f.page,{contents:[{meaning,items:[{source:{targetGid:gid}}]}]},asOf);assert.equal(r.cards.length,0);assert.equal(r.suppressed[0].reason,'contents_precedence');});
test('actual F4 contents deduplicated by exact GID',()=>{const f=contextualFixture('combined',{contents:true});assert(!f.projection.contextual.some(x=>x.source.dependentProductGid===f.catalog[0].productGid));assert(f.projection.suppressed.some(x=>x.reason==='contents_precedence'));});
test('equal title never deduplicates different GIDs',()=>{const f=contextualFixture('small');const r=reverseProjection(f.context,f.packet,f.page,{contents:[{meaning:'noncatalog',items:[{label:f.projection.contextual[0].product.title,source:{}}]}]},asOf);assert.equal(r.cards.length,1);});
for(const e of require('../data/epic-e-relationship-matrix.json').edges.filter(e=>e.state==='blocked'&&e.targetModel.includes('SawMaster')))test('historical SawMaster '+e.edgeId+' stays blocked',()=>{assert.equal(e.approvalDecisionId,null);const c=consumer.loadContext();assert(!consumer.evaluate(c,{productGid:e.dependentProductGid,domain:'compatibility',field:'PRODUCT.metafields.rhino.compatible_machines'}).eligible);const f=contextualFixture('small',{mutate:({packet})=>Object.assign(packet.edges[0],{edgeId:e.edgeId,dependentProductGid:e.dependentProductGid,targetMachineProductGid:e.targetMachineProductGid,state:'blocked',approvalDecisionId:null})});assert.equal(f.projection.contextual.length,0);});
test('live consumer cannot publish fixture projections',()=>{const f=contextualFixture();assert.throws(()=>consumer.buildContextDeliveryProjection(f.context));f.context.fixtureOnly=false;const p=projectContextDelivery(f.context,f.packet,f.page,asOf);assert.equal(p.contextual.length+p.delivery.length,0);assert.equal(p.policy,null);});
test('approved region and fresh timing use existing E authority',()=>{const f=contextualFixture('delivery');assert.equal(f.projection.delivery.length,2);assert.equal(f.projection.delivery[0].value.permission,'allowed');assert.deepEqual(f.projection.delivery[1].value,{min:13,max:17,unit:'business_days',event:'dispatch'});});
for(const [name,mutate] of Object.entries({
 'missing region authority':f=>f.context.operationalInput.approvals=[],
 'expired timing':f=>f.packet.operations[1].value.expiresAt='2026-09-18T11:00:00Z',
 'missing timing':f=>f.context.operationalInput.leadTimeProjections=[],
 'malformed timing':f=>f.packet.operations[1].value.minDays='13',
 'wrong timing unit':f=>f.packet.operations[1].value.timeBasis='hours',
 'wrong timing Product':f=>f.packet.operations[1].value.productGid='gid://shopify/Product/1',
 'wrong timing configuration':f=>f.packet.operations[1].scope={kind:'CONFIGURATION',configurationId:'fixture:other',variantGid:null,label:'Other configuration'},
 'future timing observation':f=>f.packet.operations[1].value.sourceUpdatedAt='2027-01-01T00:00:00Z',
 'unsupported timing event':f=>f.packet.operations[1].value.event='backorder',
 'expired operational authority':f=>f.packet.operations[1].expiresAt='2026-09-18T11:00:00Z',
 'denied operational audience':f=>f.packet.operations[1].audience='internal',
 'source update process missing':f=>f.context.operationalInput.leadTimeSources[0].process='',
 'wrong operational Product':f=>f.packet.operations[1].productGid='gid://shopify/Product/1',
}))test(name,()=>{const f=contextualFixture('delivery',{mutate});assert(!f.projection.delivery.some(x=>x.kind==='timing'));assert(f.projection.suppressed.length);});
test('timing expires at consumption without rebuild',()=>{const f=contextualFixture('delivery');const p=projectContextDelivery(f.context,f.packet,f.page,'2026-09-18T13:00:00Z');assert.equal(p.delivery.length,0);assert.equal(p.policy,null);});
for(const [name,change] of Object.entries({'404':{status:404},redirect:{resolvedRoute:'/pages/contact'},'wrong identity':{identity:'privacy-policy'},external:{requestedRoute:'https://example.com/'},expired:{expiresAt:'2020-01-01T00:00:00Z'},'wrong environment':{environment:'production'}}))test('policy route '+name,()=>{const f=contextualFixture('policy',{mutate:({packet})=>Object.assign(packet.policy,change)});assert.equal(f.projection.policy,null);assert(f.projection.suppressed.some(x=>x.reason==='invalid_policy_route'));});
test('valid neutral policy link is only a link',()=>{const f=contextualFixture('policy');assert.equal(f.projection.delivery.length,0);assert.equal(policyRoute(f.packet.policy,asOf,true),'/policies/shipping-policy');assert(contextDocument('policy').includes('>Shipping policy</a>'));});
for(const field of ['description','title','tags','collections','vendor','type','media','captions','manual','resources','custom_liquid','recommendations','shipping_profile','rate_name','inventory_quantity','inventory_policy','shipping_weight','available','policy_prose'])test('no fallback from '+field,()=>{const html=contextDocument('zero',{adversarial:ctx=>ctx.product[field]='ADVERSARIAL compatible free freight pickup tomorrow'});assert(!html.includes('class="rhino-machine-facts rhino-machine-contextual'));assert(!html.includes('class="rhino-machine-facts rhino-machine-delivery'));});
test('no contextual or operational JSON-LD additions',()=>{const html=contextDocument('combined');for(const [,s] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))assert(!/Synthetic|compatible|shippingDetails|hasPart|13|DE"/.test(s));});
test('generic recommendation traffic remains separately attributable',()=>assert.equal(require('./lib/epic-f-performance').attributeResource({url:'http://machine.local/recommendations/products.json?product_id=1'},'http://machine.local'),'native-recommendations'));
test('oversized reverse request fails bounded interface',()=>{const f=contextualFixture('small',{mutate:({packet})=>packet.edges=Array.from({length:33},()=>structuredClone(packet.edges[0]))});assert.equal(f.projection.contextual.length,0);assert.equal(f.projection.suppressed[0].reason,'invalid_packet');assert.equal(reverseProjection(f.context,f.packet,f.page,{contents:[]},asOf).cards.length,0);});
test('customer projection cannot be forged from fixture output',()=>{const v=new(require('ajv/dist/2020'))({strict:false}).compile(require('../schemas/epic-f-context-delivery-projection.schema.json'));const p=contextualFixture().projection;p.fixture_only=false;assert(!v(p));});
fs.mkdirSync('test-results/epic-f/f5',{recursive:true});fs.writeFileSync('test-results/epic-f/f5/contract-tests.json',JSON.stringify({fixtureOnly:true,checks:evidence},null,2)+'\n');console.log(evidence.length+' F5 contract checks passed');
