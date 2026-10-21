'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {buildFactProjection,loadContext}=require('./lib/epic-f-consumer');
const {projectFacts}=require('./lib/epic-f-facts');
const {domains}=require('./lib/epic-e-migration-domains');
const roles=require('../data/epic-f-field-roles.json');
const upstream=require('../data/epic-e-batch-3b-contracts.json');
const validate=new (require('ajv/dist/2020'))({strict:false}).compile(require('../schemas/epic-f-field-roles.schema.json'));
assert(validate(roles),JSON.stringify(validate.errors));
assert.equal(new Set(roles.fields.map(r=>r.id)).size,roles.fields.length);
for(const r of roles.fields){
  assert.equal(r.id,r.fields[0].replace(/_min$/,''));assert.equal(r.labelKey,'products.product.machine_facts.fields.'+r.id);
  if(r.fields.length===2)assert.deepEqual(r.fields,[r.id+'_min',r.id+'_max']);
  for(const key of r.fields){assert(upstream.fields.some(f=>f.key===key&&f.definitionDecisionState==='approved'));assert(domains.find(d=>d.key===r.domain)?.fieldAllowlist.includes('PRODUCT.metafields.rhino.'+key));}
}
assert.equal(roles.keyLimit,3);assert.deepEqual(roles.conversions,[]);
assert.deepEqual(roles.contents,[{field:'included_products',domain:'included_components',meaning:'included',quantityRequired:true},{field:'optional_products',domain:'optional_components',meaning:'optional',quantityRequired:false},{field:'recommended_products',domain:'recommendations',meaning:'recommended',quantityRequired:false}]);
const normalize=s=>s.replaceAll('\r\n','\n');
assert.equal(normalize(fs.readFileSync('snippets/rhino-product-fact-projection.liquid','utf8')),buildFactProjection());
const c=loadContext();
for(const route of require('../data/epic-f-consumer-release.json').routes.filter(r=>r.productClass==='machine')){const p=projectFacts(c,route.productGid);assert.equal(p.key_specs.length+p.spec_groups.length+p.contents.length,0);}
assert.deepEqual(require('../data/epic-f-consumer-release.json').grants,[]);
for(const file of ['snippets/rhino-machine-specifications.liquid','snippets/rhino-machine-contents.liquid']){const s=fs.readFileSync(file,'utf8');assert(s.includes("request.host == 'machine.local' and projection.fixture_only"));assert(!/product\.description|product\.metafields|all_products|Custom Liquid|machine_specs/.test(s));}
const spec=fs.readFileSync('snippets/rhino-machine-specifications.liquid','utf8');assert.equal((spec.match(/render 'rhino-machine-specification-row'/g)||[]).length,2);
const contents=fs.readFileSync('snippets/rhino-machine-contents.liquid','utf8');assert(contents.includes("render 'card-product'"));assert(contents.includes("quick_add: 'none'"));
assert(!/metafields|gid:\/\/|machine_specs/.test(fs.readFileSync('templates/product.machine.json','utf8')));
console.log('F4 architecture valid: shared F consumer, one formatter, exact-GID contents, zero real fact grants; no template fact store or live activation.');
