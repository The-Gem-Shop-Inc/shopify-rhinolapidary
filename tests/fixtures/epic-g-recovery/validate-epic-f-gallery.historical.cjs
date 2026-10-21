'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const Ajv = require('ajv/dist/2020');
const { galleryDocument } = require('./lib/epic-f-gallery-fixtures');
const read = p => fs.readFileSync(p, 'utf8');
const ajv = new Ajv({ strict: false, allErrors: true });
for (const [schema, data] of [['media-release','data/epic-f-media-release.json'], ['gallery-fixtures','tests/fixtures/epic-f-gallery.json']]) {
  const validate = ajv.compile(JSON.parse(read(`schemas/epic-f-${schema}.schema.json`)));
  assert(validate(JSON.parse(read(data))), JSON.stringify(validate.errors));
}
assert.deepEqual(require('../data/epic-f-consumer-release.json').grants, []);
const liveMedia=require('./lib/epic-f-live-media-activation');
if(liveMedia.active())liveMedia.verifyBinding();
else assert.equal(read('snippets/rhino-product-media-eligibility.liquid').replace(/\r\n/g,'\n').trim(), `{%- comment -%}
Generated release boundary: F-DEC-002 unresolved; zero machine media grants.
F-PBI-004B must approve and separately authorize any nonempty release.
{%- endcomment -%}`);
for (const [file, hash] of Object.entries(require('../tests/fixtures/epic-f-gallery-native-baseline.json'))) {
  assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'), hash, `${file}: native controller/template changed`);
}
for (const file of ['sections/main-product.liquid','snippets/product-media-gallery.liquid','snippets/product-media-modal.liquid']) {
  const source = read(file);
  assert(source.includes("render 'rhino-product-media-eligibility'"), `${file}: eligibility gate missing`);
  assert(source.includes("rhino_consumer_route == 'machine'"), `${file}: consumer boundary missing`);
  assert(source.includes('rhino_media'), `${file}: filtered media required`);
}
for (const route of require('../data/epic-f-consumer-release.json').routes.filter(r=>r.productClass==='machine')) {
  const input = structuredClone(require('../tests/fixtures/epic-f-gallery.json'));
  input.productGid = route.productGid;
  input.items[0].productGid = input.items[0].modelProductGid = route.productGid;
  const html = galleryDocument('one', { input, allowFixtures: false });
  assert(!/<media-gallery|<product-modal|<img\b/.test(html), `${route.productGid}: shipped gate activated media`);
}
console.log('Gallery architecture: '+liveMedia.authorizedCount()+' exact development media grants; zero fact grants; synthetic grants cannot activate real media; native gallery/zoom/modal/purchase controllers and both Product templates unchanged.');
