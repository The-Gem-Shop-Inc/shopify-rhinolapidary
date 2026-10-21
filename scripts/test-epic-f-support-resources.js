'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs');
const { supportFixture, supportDocument, resource, machine, asOf } = require('./lib/epic-f-support-resources-fixtures');
const { projectSupportResources, validateProjection, safeRelativeRoute } = require('./lib/epic-f-support-resources');
const consumer = require('./lib/epic-f-consumer');
const results = [];
function test(name, fn) { try { fn(); results.push({ name, pass: true }); } catch (e) { results.push({ name, pass: false, error: e.message }); console.error(name, e); } }
const mutateWarranty = fn => supportFixture('support', { mutate: ({ packet, context }) => fn(packet.warranty[0], packet, context) }).projection;
const mutateResource = fn => supportFixture('one', { mutate: ({ packet, context, page }) => fn(packet.resources[0], packet, context, page) }).projection;
test('zero facts and real grant count', () => { const p = supportFixture('zero').projection; assert.equal(p.warranty.length + p.resources.length, 0); assert.equal(require('../data/epic-f-consumer-release.json').grants.length, 0); });
test('Product-specific policy/class/mapping, third-party roles and duration', () => { const w = supportFixture('support').projection.warranty[0]; assert.equal(w.duration.value, 17); assert.equal(w.duration.unit, 'months'); assert.notEqual(w.roles.manufacturer, w.roles.marketed_brand); assert.equal(new Set([w.roles.issuer,w.roles.administrator,w.roles.repair_provider]).size,3); assert.equal(w.exceptions.length,1); });
test('same entity requires separately evidenced roles', () => { const p = supportFixture('support', { sameEntity: true }).projection; assert.equal(p.warranty.length,1); });
test('no duration does not invent one', () => { const p=mutateWarranty(w=>{w.class.durationValue=null;w.class.durationUnit=null;}); assert.equal(p.warranty[0].duration,null); });
const warrantyNegatives = {
  'wrong Product': w=>w.productGid='gid://shopify/Product/1',
  'duplicate record': (w,p)=>p.warranty.push(structuredClone(w)),
  'conflicting second mapping': (w,p)=>p.warranty.push({...structuredClone(w),recordId:'fixture:second'}),
  'mapping class mismatch': w=>w.mapping.classId='fixture:other',
  'class policy mismatch': w=>w.class.policyId='fixture:other',
  'policy revision mismatch': w=>w.class.policyRevision='different',
  'approval mismatch': w=>w.policy.approvalDecisionId='fixture:other',
  'class approval mismatch': w=>w.class.approvalDecisionId='fixture:other',
  'mapping approval mismatch': w=>w.mapping.approvalDecisionId='fixture:other',
  'missing policy source authority': w=>{w.policy.resourceId=null;w.policy.nativePolicyGid=null;},
  'source content hash mismatch': w=>w.policy.sourceSha256='0'.repeat(64),
  'missing issuer evidence': w=>w.policy.roleEvidence=w.policy.roleEvidence.filter(e=>e.role!=='warrantyIssuer'),
  'missing administrator evidence': w=>w.policy.roleEvidence=w.policy.roleEvidence.filter(e=>e.role!=='warrantyAdministrator'),
  'missing repair evidence': w=>w.policy.roleEvidence=w.policy.roleEvidence.filter(e=>e.role!=='repairProvider'),
  'stale policy': w=>w.policy.lifecycle='obsolete',
  'future effective policy': w=>w.policy.effectiveFrom='2099-01-01T00:00:00Z',
  'expired policy': w=>w.policy.effectiveTo=asOf,
  'expired authority': w=>w.expiresAt=asOf,
  'audience denied': w=>w.audience='internal',
  'proposed': w=>w.state='proposed',
  'conflicts': w=>w.conflictIds=['fixture:conflict'],
  'duration missing unit': w=>w.class.durationUnit=null,
  'duration missing value': w=>w.class.durationValue=null,
  'duration zero': w=>w.class.durationValue=0,
  'duration invalid unit': w=>w.class.durationUnit='forever',
  'malformed trigger': w=>w.class.trigger='<script>bad</script>',
  'invalid exclusion': w=>w.class.exclusions=['<b>promise</b>'],
  'invalid exception': w=>w.mapping.exceptions=[''],
  'unsafe brand': w=>w.marketedBrand='<b>brand</b>',
  'stale upstream': (w,p,c)=>c.inputsCurrent=false
};
for (const [name,fn] of Object.entries(warrantyNegatives)) test('warranty rejects '+name,()=>assert.equal(mutateWarranty(fn).warranty.length,0));
const routeNegatives = {
  missing:w=>w.destination=null,
  '404':w=>w.destination.status=404,
  'redirect mismatch':w=>w.destination.resolvedRoute='/pages/other',
  external:w=>w.destination.requestedRoute=w.destination.resolvedRoute='https://evil.example/warranty',
  'wrong identity':w=>w.destination.identity='fixture:wrong',
  stale:w=>w.destination.expiresAt=asOf,
  'wrong purpose':w=>w.destination.purpose='refund',
  'absent historic warranty':w=>{w.destination.requestedRoute=w.destination.resolvedRoute='/pages/warranty';w.destination.status=404;}
};
for(const [name,fn] of Object.entries(routeNegatives))test('CTA only suppressed: '+name,()=>{const p=mutateWarranty(fn);assert.equal(p.warranty.length,1);assert.equal(p.warranty[0].destination,null);});
test('valid exact warranty destination',()=>assert.equal(supportFixture('support').projection.warranty[0].destination,'/fixture-support/warranty'));
for(const [name,fn] of Object.entries({internal:r=>r.visibility='internal',support_only:r=>r.visibility='support_only',support_files:r=>r.resourceType='support',evidence_only:r=>r.sourceRole='evidence_only',publication:r=>r.publicationApproved=false,rights:r=>r.rights='blocked'}))test('warranty CTA cannot leak restricted source: '+name,()=>{const p=supportFixture('support',{mutate:({context})=>fn(context.operationalContext.resources.resources[0])}).projection;assert.equal(p.warranty.length,1);assert.equal(p.warranty[0].destination,null);});
test('positive warranty passes E owner schema/validator with separate subject approvals',()=>{const f=supportFixture('support');const validate=new (require('ajv/dist/2020'))({strict:false}).compile(require('../schemas/epic-e-batch-3c-owner-decisions.schema.json'));assert(validate(f.context.operationalInput));assert.deepEqual(require('./lib/epic-e-batch-3c').validateOwnerInputs(f.context.operationalInput,f.context.operationalContext,asOf),[]);assert.equal(new Set([f.packet.warranty[0].policy.approvalDecisionId,f.packet.warranty[0].class.approvalDecisionId,f.packet.warranty[0].mapping.approvalDecisionId]).size,3);});
for(const [name,fn] of Object.entries({
  'missing E owner approval':c=>c.operationalInput.approvals.pop(),
  'malformed E context':c=>c.operationalContext={},
  'wrong E approval subject':c=>c.operationalInput.approvals[0].subjectId='fixture:wrong',
  'wrong E approval kind':c=>c.operationalInput.approvals[0].kind='region',
  'missing E owner role':c=>c.operationalInput.approvals[0].ownerRoles=[],
  'stale E policy source':c=>c.operationalContext.resources.resources[0].status='obsolete',
  'changed E source hash':c=>c.operationalContext.resources.resources[0].contentHash='0'.repeat(64),
  'unapproved equal roles':c=>{c.operationalInput.policyVersions[0].explicitRoleEquality=false;}
}))test('upstream warranty rejects '+name,()=>{const p=supportFixture('support',{sameEntity:true,mutate:({context})=>fn(context)}).projection;assert.equal(p.warranty.length,0);});
for(const route of ['//evil.example','/\\evil.example','/%2e%2e/private','/a/../b','/a?redirect=x','javascript:alert(1)'])test('unsafe route '+route,()=>assert.equal(safeRelativeRoute(route),false));
for(const state of ['one','downloads','video','combined'])test('approved synthetic '+state,()=>{const p=supportFixture(state).projection;assert.equal(p.resources.length,{one:1,downloads:3,video:1,combined:4}[state]);});
const resourceNegatives = {
  'wrong Product':r=>r.productGid='gid://shopify/Product/1',
  'missing applicability':r=>r.applicableProductGids=['gid://shopify/Product/1'],
  'duplicate resource ID':(r,p)=>p.resources.push({...structuredClone(r),recordId:'fixture:other',fileIdentity:'fixture:file:other'}),
  'duplicate File identity':(r,p)=>p.resources.push({...structuredClone(r),resourceId:'fixture:other',recordId:'fixture:other'}),
  'conflicting canonical version':(r,p)=>p.resources.push({...structuredClone(r),resourceId:'fixture:other',fileIdentity:'fixture:file:other',version:'synthetic-r2',recordId:'fixture:other'}),
  'exact File mismatch':r=>r.destination.fileIdentity='fixture:file:wrong',
  candidate:r=>r.status='candidate',obsolete:r=>r.status='obsolete',superseded:r=>r.status='superseded',
  'HTTP 200 obsolete':r=>{r.status='obsolete';r.destination.status=200;},
  'canonical false':r=>r.canonical=false,
  'owner missing':r=>r.ownerApproved=false,'rights missing':r=>r.rightsApproved=false,'publication missing':r=>r.publicationApproved=false,
  'audience wrong':r=>r.audience='staff','language missing':r=>r.language='', 'language wrong':r=>r.language='fr', 'language invalid':r=>r.language='English!', 'language unreviewed':r=>r.languageReviewed=false,
  'version missing':r=>r.version='', 'version invalid':r=>r.version='<b>r1</b>', 'version unreviewed':r=>r.versionReviewed=false,
  'wrong configuration':r=>r.configurationId='fixture:other',
  'missing target':r=>r.destination=null, '404':r=>r.destination.status=404,
  'redirect wrong identity':r=>r.destination.resolvedRoute='/fixture-downloads/wrong.pdf',
  'wrong resource identity':r=>r.destination.identity='fixture:wrong',
  'unsafe external URL':r=>r.destination.requestedRoute=r.destination.resolvedRoute='https://evil.example/private',
  'stale route':r=>r.destination.expiresAt=asOf,
  'internal':r=>r.visibility='internal','support only':r=>r.visibility='support_only','evidence only':r=>r.sourceRole='evidence_only',
  'support current canonical reachable approved':r=>r.resourceType='support',
  'support internal':r=>{r.resourceType='support';r.visibility='internal';},
  'support evidence':r=>{r.resourceType='support';r.sourceRole='evidence_only';},
  'missing accessible name':r=>r.title=''
};
for(const [name,fn] of Object.entries(resourceNegatives))test('resource rejects '+name,()=>assert.equal(mutateResource(fn).resources.length,0));
test('configuration scoped resource matches only explicit page scope',()=>{const p=mutateResource((r,p,c,page)=>{r.configurationId=page.configurationId='fixture:config';});assert.equal(p.resources.length,1);});
for(const key of ['filename','uploadDate','contentHash','duplicateGroup','candidateModelLabel','pageTitle'])test('canonical inference denied: '+key,()=>{const p=mutateResource(r=>{r.canonical=false;r[key]='latest-approved-looking';});assert.equal(p.resources.length,0);});
test('working legacy Page does not approve a canonical File',()=>assert.equal(mutateResource(r=>{r.canonical=false;r.destination.requestedRoute=r.destination.resolvedRoute='/pages/legacy-manual';}).resources.length,0));
const brokenRoutes=['12-in-lapmaster','18-in-lapmaster','18-in-sawmaster','24-in-sawmaster','36-in-sawmaster','jademaster','beadmaster'].map(x=>'/pages/'+x+'-manual');
test('seven broken manual signatures match unchanged E reconciliation',()=>assert.deepEqual(require('../data/epic-e-resource-catalog.json').pageReconciliation.filter(r=>!r.existingGlobalVisibility).map(r=>r.existingRoute).sort(),[...brokenRoutes].sort()));
for(const route of ['/pages/em-1-manual','/pages/shapemaster-manual','/pages/trimmaster-manual'])test('working historical Page is not canonical: '+route,()=>assert.equal(mutateResource(r=>{r.canonical=false;r.destination.requestedRoute=r.destination.resolvedRoute=route;}).resources.length,0));
for(const route of brokenRoutes)test('historic broken manual '+route,()=>{const p=mutateResource(r=>{r.destination.requestedRoute=r.destination.resolvedRoute=route;r.destination.status=404;});assert.equal(p.resources.length,0);assert(p.suppressed.some(s=>s.reason==='invalid_resource_destination'));});
for(const [name,fn] of Object.entries({homepage:v=>v.productSurfaceApproved=false,autoplay:v=>v.autoplay=true,eager:v=>v.eagerProvider=true,captions:v=>v.captionsReviewed=false,transcript:v=>v.transcriptReviewed=false,poster:v=>{v.posterIdentity='fixture:unapproved-machine-photo';v.posterApproved=true;},dimensions:v=>v.width=0}))test('video rejects '+name,()=>{const p=supportFixture('video',{mutate:({packet})=>fn(packet.resources[0].video)}).projection;assert.equal(p.resources.length,0);});
test('forged fixture packet cannot populate a real context',()=>{const f=supportFixture('combined');const p=projectSupportResources(consumer.loadContext(),f.packet,asOf);assert.equal(p.warranty.length+p.resources.length,0);});
test('output schema forbids customer support type and nonfixture grants',()=>{const p=supportFixture('one').projection;p.resources[0].type='support';assert.equal(validateProjection(p),false);p.resources[0].type='manual';p.fixture_only=false;assert.equal(validateProjection(p),false);});
test('tampering after shared approval digest is rejected',()=>{const p=supportFixture('combined',{afterApproval:({packet})=>{packet.warranty[0].class.durationValue=99;packet.resources[0].title='Changed';}}).projection;assert.equal(p.warranty.length,0);assert(!p.resources.some(r=>r.type==='manual'));});
test('invalid Product GID returns empty diagnostic, not an exception',()=>{const f=supportFixture('zero');assert.equal(projectSupportResources(f.context,{...f.packet,machineProductGid:'bad'},asOf).product_gid,null);});
test('release builder refuses fixture and stale contexts',()=>{assert.throws(()=>consumer.buildSupportResourcesProjection(supportFixture().context));const c=consumer.loadContext();c.inputsCurrent=false;assert.throws(()=>consumer.buildSupportResourcesProjection(c));assert(consumer.buildSupportResourcesProjection().includes('assign rhino_support_resources = nil'));});
for(const key of ['vendor','title','description','tags','product_type','collections','refund_policy','return_policy','shipping_policy','terms','privacy_policy','contact','files','historical_one_year','historical_90_days','product_class','price','brand_group','manual_body','diagram_text','video_transcript','filename','page_title','resource_metadata','custom_liquid'])test('incidental input cannot populate any module: '+key,()=>{
  const f=supportFixture('zero',{mutate:({context})=>context[key]='ADVERSARIAL warranty 99 years, included motor, compatible, free freight'});
  assert.equal(f.projection.warranty.length+f.projection.resources.length,0);
  assert.equal(f.projection.product_gid,machine);
});
// Renderer assertions run once presentation exists; they are required by the aggregate.
if(fs.existsSync('snippets/rhino-machine-support.liquid')){
  test('zero modules preserve neutral Contact and no placeholder',()=>{const html=supportDocument('zero');assert(html.includes('href="/pages/contact"'));assert(!html.includes('class="rhino-machine-facts rhino-machine-support"'));assert(!html.includes('class="rhino-machine-facts rhino-machine-resources"'));});
  test('deployable nil projection cannot render fixture values',()=>{const html=supportDocument('combined',{allowFixtures:false});assert(!html.includes('Synthetic Issuer'));assert(!html.includes('Synthetic manual guide'));});
  test('resource body cannot populate specs/BOM/context/delivery/JSON-LD',()=>{const html=supportDocument('zero',{adversarial:ctx=>{for(const key of ['description','tags','vendor','manual_body','diagram_text','video_transcript','resource_metadata','custom_liquid'])ctx.product[key]='ADVERSARIAL_RESOURCE_FACT';}});assert(!html.includes('ADVERSARIAL_RESOURCE_FACT'));assert(!/"hasPart"|"warranty"/.test(html));});
  test('rendered approved modules hide internal IDs and keep meanings',()=>{const html=supportDocument('combined');assert(html.includes('Synthetic Issuer'));assert(!html.includes('fixture:policy'));assert(!html.includes('fixture:file:'));assert(!html.includes('approvalDecisionId'));});
  for(const key of ['vendor','title','description','tags','collections','product_type','media_captions','generic_policy','manual_text','upload_filename','upload_date','custom_liquid'])test('Liquid incidental input cannot populate F6: '+key,()=>{const html=supportDocument('zero',{adversarial:ctx=>{ctx.product[key]='ADVERSARIAL_F6';}});assert(!html.includes('class="rhino-machine-facts rhino-machine-support"'));assert(!html.includes('class="rhino-machine-facts rhino-machine-resources"'));});
  test('approved resource projection supplies no facts to earlier modules or structured data',()=>{const html=supportDocument('combined');for(const name of ['specifications','contents','contextual','delivery'])assert(!html.includes('rhino-machine-facts rhino-machine-'+name));for(const block of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))assert(!/Synthetic|warranty|hasPart|manual|resource/.test(block[1]));});
}
fs.mkdirSync('test-results/epic-f/f6',{recursive:true});
fs.writeFileSync('test-results/epic-f/f6/contract-tests.json',JSON.stringify({results,passed:results.filter(r=>r.pass).length,failed:results.filter(r=>!r.pass).length,brokenManualRoutes:brokenRoutes},null,2)+'\n');
console.log(`F6 contracts: ${results.filter(r=>r.pass).length} passed; ${results.filter(r=>!r.pass).length} failed`);process.exitCode=results.some(r=>!r.pass)?1:0;
