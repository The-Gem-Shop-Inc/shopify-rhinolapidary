'use strict';
// Disposable G1 role and G3A route consumer. No class/relationship approval originates here.
const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('./epic-e-owner-response-adapter'),G=require('./epic-g-foundation');
const DIR='docs/qa/evidence/epic-g/g3b-2026-10-19',READ=DIR+'/admin-read.json',RELEASE='data/epic-g-catalog-release.json',SIZE=150;
const ROLES=[{key:'replacement_part',label:'Replacement Parts',fragment:'g-replacement-parts'},{key:'consumable',label:'Consumables',fragment:'g-consumables'},{key:'accessory',label:'Accessories',fragment:'g-accessories'}];
const FILES=['sections/main-collection-product-grid.liquid','snippets/rhino-g-catalog-authority.liquid','snippets/rhino-g-catalog-index.liquid','assets/rhino-g-catalog.css','assets/rhino-g-catalog.js'];
const digest=path=>({path,sha256:E.hash(fs.readFileSync(path))}),number=id=>{assert(/^gid:\/\/shopify\/Product(?:Variant)?\/[0-9]+$/.test(id));return id.split('/').pop();},q=s=>{assert(!/['{}<>\r\n]/.test(String(s)));return "'"+s+"'";};
function project({report,envelope,baseline,machineContract,asOf=report.asOf}){
 assert(report.source.current,'Current governed source required');assert(report.reconciliation.paginationComplete&&report.reconciliation.classCoverageComplete,'Complete native identity/class reconciliation required');assert.deepEqual(baseline.failures,[]);assert.equal(baseline.themeId,'158631198917');
 const native=envelope.snapshot.datasets.products.records,variants=envelope.snapshot.datasets.variants.records,visible=report.products.filter(p=>p.published);
 assert.equal(new Set(baseline.order).size,baseline.order.length,'Duplicate catalog identity');assert.deepEqual(baseline.order.slice().sort(),visible.map(p=>p.productGid).sort(),'Public catalog coverage');assert(baseline.order.length<=25000,'Outside bounded Shopify pagination');
 const products=visible.map(p=>{const n=native.find(n=>n.id===p.productGid);assert(p.valid&&!p.consumerReasons.length,'Unapproved Product class/identity');assert(['machine',...G.G_CLASSES].includes(p.approvedClass));assert(n&&n.handle);return {productGid:p.productGid,handle:n.handle,role:p.approvedClass,variantGids:variants.filter(v=>v.product.id===p.productGid).map(v=>v.id).sort()};});
 const pages=[];for(let i=0;i<baseline.order.length;i+=SIZE)pages.push({page:pages.length+1,productGids:baseline.order.slice(i,i+SIZE)});
 const roles=ROLES.map(r=>{const ids=products.filter(p=>p.role===r.key).map(p=>p.productGid),first=pages.find(p=>p.productGids.some(id=>ids.includes(id)));return {...r,count:ids.length,firstPage:first?.page||null};});
 assert.equal(machineContract.themeId,'158631198917');
 const contextCurrent=Array.isArray(report.reconciliation.referenceDrift)&&!report.reconciliation.referenceDrift.length&&Array.isArray(report.reconciliation.publicationDrift)&&!report.reconciliation.publicationDrift.length;
 const machines=(contextCurrent?machineContract.routes:[]).filter(r=>r.customerEligible).map(r=>{const p=products.find(p=>p.productGid===r.machineProductGid);assert(p&&p.role==='machine');assert.equal(r.nativeProductUrl,'/products/'+p.handle);return {productGid:p.productGid,url:r.nativeProductUrl,fragment:r.fragment,expectedApprovedReverseCount:r.expectedApprovedReverseCount};});
 return {schemaVersion:1,fixtureOnly:report.mode==='OFFLINE_FIXTURE',validatedAt:asOf,host:'/collections/all',themeId:'158631198917',pageSize:SIZE,pageParameter:'page',sourceBindingSha256:report.source.bindingSha256,observationCapturedAt:report.source.snapshotCapturedAt,expiresAt:new Date(Math.min(Date.parse(report.source.expiresAt),Date.parse(report.source.snapshotExpiresAt))).toISOString(),receiptExpiresAt:report.source.expiresAt,machineExpiresAt:machineContract.expiresAt,machineSemanticSha256:E.digest(machineContract.routes),machineOmissionReasons:contextCurrent?[]:['CURRENT_COMPATIBILITY_OR_PUBLICATION_RECONCILIATION_FAILED'],publishedProducts:products.length,products:products.sort((a,b)=>a.productGid.localeCompare(b.productGid)),roles,pages,machines};
}
function current(asOf=new Date().toISOString()){
 const envelope=E.read(READ);assert.equal(envelope.sourceKind,'live_admin');assert.deepEqual(require('../validate-epic-g-foundation').validateRead(envelope),[]);const report=G.assess(G.loadAuthority(),envelope,{asOf});
 const machineContract=require('./epic-g-machine-routes').verify(),baseline=E.read(DIR+'/native-baseline.json');assert(Date.parse(baseline.startedAt)>=Date.parse(envelope.startedAt));
 return {envelope,report,baseline,machineContract,asOf};
}
function build(asOf=new Date().toISOString()){const input=current(asOf),release=project(input);release.input=digest(READ);release.membership=digest(DIR+'/native-baseline.json');release.provenance=['data/epic-e-product-classification.json','data/epic-e-product-identity.json','data/epic-e-product-owner-decisions.json',require('./epic-f-final-owner-binding').BINDING,require('./epic-e-final-owner-delta').RECEIPT].map(digest);return release;}
function compile(release) {
 const records = release.products.map((product) => {
  assert(/^[a-z0-9-]+$/.test(product.handle));
  assert(['machine', ...G.G_CLASSES].includes(product.role));

  return [
   number(product.productGid),
   product.handle,
   product.role,
   product.variantGids.map(number).sort().join(','),
  ].join(':');
 }).join('|');

 const out = [
  `{% doc %}
  Governed G1 role projection; no private tokens, fit graph or commerce policy.
  Classification is validated against approved exact Product and Variant identities.
  @param {string} mode - Projection operation
  @param {product} [product] - Current native Product
  @param {collection} [collection] - Current native catalog
  @param {object} [paginate] - The section's sole pager
  @param {string} [role] - Governed role key
{% enddoc %}`,
  "{%- assign g_now = 'now' | date: '%s' | plus: 0 -%}",
  "{%- case mode -%}",

  "{%- when 'role' -%}",
  `{%- assign g_records = ${q('|' + records + '|')} -%}`,
  "{%- assign g_key = '|' | append: product.id | append: ':' -%}",
  "{%- if g_records contains g_key -%}",
  "{%- assign g_record = g_records | split: g_key | last | split: '|' | first | split: ':' -%}",
  "{%- assign g_expected_variants = g_record[2] | split: ',' -%}",
  "{%- assign g_variants = product.variants | map: 'id' | sort | join: ',' -%}",
  "{%- assign g_published = product.published_at | date: '%s' | plus: 0 -%}",
  "{%- if product.handle == g_record[0] and product.published_at != blank and g_published <= g_now and product.metafields.rhino.product_class.type == 'single_line_text_field' and product.metafields.rhino.product_class.value == g_record[1] and product.variants.size == g_expected_variants.size and g_variants == g_record[2] -%}{{- g_record[1] -}}{%- endif -%}",
  "{%- endif -%}",

  "{%- when 'page' -%}",
  "{%- assign g_ids = collection.products | map: 'id' -%}",
  "{%- assign g_distinct_ids = g_ids | uniq -%}",
  "{%- if collection.handle == 'all' and paginate.page_param == 'page' and collection.products.size > 0 and collection.products.size <= 150 and g_distinct_ids.size == collection.products.size -%}eligible{%- endif -%}",

  "{%- when 'first-page' -%}",
  "{%- case role -%}",
 ];

 for (const role of release.roles) {
  if (role.firstPage) {
   out.push(`{%- when ${q(role.key)} -%}${role.firstPage}`);
  }
 }

 out.push(
     "{%- endcase -%}",
     "{%- when 'machine' -%}",

     // Machine context has a separate presentation approval.
     // Do not enable links to expired or missing machine anchors.
     `{%- if g_now < ${Math.floor(Date.parse(release.machineExpiresAt) / 1000)} -%}`,
     "{%- case product.id -%}",
 );

 for (const machine of release.machines) {
  out.push(
      `{%- when ${number(machine.productGid)} -%}${machine.fragment}`
  );
 }

 out.push(
     "{%- endcase -%}",
     "{%- endif -%}",
     "{%- endcase -%}"
 );

 return out.join('\n') + '\n';
}
function section(original=fs.readFileSync(DIR+'/main-collection-product-grid-before.liquid','utf8')){
 assert(original.includes('{%- paginate collection.products by section.settings.products_per_page -%}'));
 assert(!original.includes('rhino_g_index'));
 return original;
}


function verify() {
 const release = E.read(RELEASE);

 assert.equal(release.fixtureOnly, false);

 // Preserve the original approved source fingerprints.
 for (const ref of [
  release.input,
  release.membership,
  ...release.provenance,
 ]) {
  assert.equal(
      digest(ref.path).sha256,
      ref.sha256,
      `Catalog source provenance drift: ${ref.path}`
  );
 }

 // Verify the approved Product and Variant inventory.
 const productIds = release.products.map(p => p.productGid);
 const variantIds = release.products.flatMap(p => p.variantGids);
 const pageIds = release.pages.flatMap(p => p.productGids);

 assert.equal(release.publishedProducts, productIds.length);
 assert.equal(new Set(productIds).size, productIds.length);
 assert.equal(new Set(variantIds).size, variantIds.length);

 assert.deepEqual(
     pageIds.slice().sort(),
     productIds.slice().sort(),
     'Approved directory membership differs from release inventory'
 );

 const approvedRoles = new Set(['machine', ...G.G_CLASSES]);

 for (const product of release.products) {
  assert(approvedRoles.has(product.role));
  assert(/^gid:\/\/shopify\/Product\/\d+$/.test(product.productGid));
  assert(/^[a-z0-9-]+$/.test(product.handle));

  for (const variant of product.variantGids) {
   assert(/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variant));
  }
 }

 for (const role of release.roles) {
  const matching = release.products.filter(
      product => product.role === role.key
  );

  assert.equal(
      role.count,
      matching.length,
      `Incorrect approved count for ${role.key}`
  );

  const firstPage = release.pages.find(page =>
      page.productGids.some(id =>
          matching.some(product => product.productGid === id)
      )
  );

  assert.equal(role.firstPage, firstPage?.page ?? null);
 }

 // The generated Liquid must match the reviewed classification.
 assert.equal(
     fs.readFileSync('snippets/rhino-g-catalog-authority.liquid', 'utf8'),
     compile(release),
     'Catalog authority differs from approved compilation'
 );

 // Protect native collection structure, without requiring
 // later Epic J improvements to equal an October snapshot.
 const section = fs.readFileSync(FILES[0], 'utf8');

 const nativePager =
     '{%- paginate collection.products by section.settings.products_per_page -%}';

 assert(section.includes(nativePager));

 assert.equal(
     (section.match(/{%-?\s*paginate\s+collection\.products\b/g) || []).length,
     1,
     'Collection must retain exactly one native pagination owner'
 );

 assert(
     !section.includes('rhino_g_index'),
     'Catalog must not inject a second collection pager'
 );

 const schemaMatch = section.match(
     /{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/
 );

 assert(schemaMatch, 'Native collection schema missing');

 const schema = JSON.parse(schemaMatch[1]);
 assert(Array.isArray(schema.settings));

 const settingIds = new Set(
     schema.settings.filter(setting => setting.id).map(setting => setting.id)
 );

 for (const required of [
  'products_per_page',
  'quick_add',
  'enable_filtering',
  'enable_sorting',
 ]) {
  assert(
      settingIds.has(required),
      `Native collection setting missing: ${required}`
  );
 }

 return release;
}

module.exports={DIR,READ,RELEASE,SIZE,ROLES,FILES,number,digest,project,current,build,compile,section,verify};
