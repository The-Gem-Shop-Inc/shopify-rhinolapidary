'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const consumer=require('./lib/epic-f-consumer'),contract=require('../data/epic-f-context-delivery-contract.json');
const {projectContextDelivery}=require('./lib/epic-f-context-delivery');
assert.equal(contract.runtimeActivation,false);assert.equal(contract.sourceDirection,'dependent-to-machine');assert.equal(contract.maxEdgesPerMachine,32);assert.deepEqual(contract.repeatRules,[]);
for(const [path,hash] of Object.entries(contract.preservedHashes))assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex'),hash,'F5 must preserve '+path);
assert.equal(fs.readFileSync('snippets/rhino-product-context-delivery-projection.liquid','utf8').replaceAll('\r\n','\n'),consumer.buildContextDeliveryProjection());
const context=consumer.loadContext();
for(const route of require('../data/epic-f-consumer-release.json').routes.filter(r=>r.productClass==='machine')){
  const p=projectContextDelivery(context,{schemaVersion:1,machineProductGid:route.productGid,edges:[],operations:[],policy:null});assert.equal(p.contextual.length+p.delivery.length,0);assert.equal(p.policy,null);
}
for(const name of ['contextual','delivery']){
  const text=fs.readFileSync('snippets/rhino-machine-'+name+'.liquid','utf8');assert(text.includes("request.host == 'machine.local' and projection.fixture_only"));assert(!/product\.description|product\.metafields|all_products|recommendations\.|<script|pickup-availability|inventory|shipping_weight/.test(text));
}
const card=fs.readFileSync('snippets/rhino-machine-contextual.liquid','utf8');assert(card.includes("render 'card-product'"));assert(card.includes("quick_add: 'none'"));assert(card.includes('rhino_contents_context: true'));
assert.equal(require('../data/epic-e-relationship-matrix.json').edges.filter(e=>e.targetModel.includes('SawMaster')&&e.state==='blocked').length,4);
assert.equal(require('../data/epic-f-consumer-release.json').grants.length,0);
const ajv=new (require('ajv/dist/2020'))({strict:false});for(const name of ['epic-f-context-delivery','epic-f-context-delivery-projection'])ajv.compile(require('../schemas/'+name+'.schema.json'));
console.log('F5 architecture valid: zero live grants, bounded reverse interface, shared consumer and native cards/pickup; preserved templates, purchase scripts and budgets.');
