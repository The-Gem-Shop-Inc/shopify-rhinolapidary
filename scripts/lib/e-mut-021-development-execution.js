'use strict';
const fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const INPUT='data/epic-e-migration-plans/E-MUT-021-product_class-input.json';
const INPUT_SHA='d1aa54a482f1ac786f8e616eede866c790ebe123f8d557dfb6b2c0de076614e1';
const AUTH='docs/qa/evidence/epic-e/E-MUT-021-2026-10-05-execution-authorization.json';
const DEFINITION='gid://shopify/MetafieldDefinition/298658201797';
const VALUES=['machine','replacement_part','consumable','accessory'];
const EXPECTED={machine:11,replacement_part:54,consumable:39,accessory:18};
const read=p=>JSON.parse(fs.readFileSync(p));
const hash=v=>crypto.createHash('sha256').update(v).digest('hex');
const distribution=rows=>Object.fromEntries(VALUES.map(v=>[v,rows.filter(r=>r.desired===v).length]));
function authorize(auth=read(AUTH),bundle=read(INPUT)){
 assert.equal(hash(fs.readFileSync(INPUT)),INPUT_SHA);assert.equal(auth.planId,'E-MUT-021');assert.equal(bundle.planId,'E-MUT-021');assert.equal(bundle.domain,'product_class');
 assert.equal(auth.approvalMode,'delegated_development_override');assert.equal(auth.inputSha256,INPUT_SHA);assert.equal(auth.approvalDate,'2026-10-05');assert.equal(auth.approvedRowCount,122);
 assert.equal(auth.productOwnerDecision,'GO — complete approved 122-Product classification set');assert.equal(auth.delegatedAuthorityOverride.explicit,true);assert.equal(auth.shop.id,'gid://shopify/Shop/79279947973');assert.equal(auth.shop.domain,'sz5dnk-nf.myshopify.com');
 assert.equal(auth.definitionGid,DEFINITION);assert.deepEqual(auth.authorizedMutations,['metafieldsSet']);assert.deepEqual(auth.allowedWrite,{ownerType:'PRODUCT',namespace:'rhino',key:'product_class',type:'single_line_text_field',values:VALUES});
 assert.equal(auth.compareBeforeWriteRequired,true);assert.equal(auth.compareAndSetAbsentRequired,true);assert.equal(auth.maximumBatchSize,25);assert.equal(auth.historicalApprovalsRewritten,false);
 assert.equal(bundle.rows.length,122);assert.equal(new Set(bundle.rows.map(r=>r.targetGid)).size,122);assert.equal(new Set(bundle.rows.map(r=>r.rowId)).size,122);assert.deepEqual(distribution(bundle.rows),EXPECTED);
 for(const ref of bundle.inputs)assert.equal(hash(fs.readFileSync(ref.path)),ref.sha256,'Historical authority drift: '+ref.path);
 const classification=read('data/epic-e-product-classification.json');
 for(const row of bundle.rows){assert.equal(row.domain,'product_class');assert.equal(row.kind,'value');assert.equal(row.field,'PRODUCT.metafields.rhino.product_class');assert.equal(row.valueState,'approved');assert.deepEqual(row.conflictIds,[]);assert.match(row.targetGid,/^gid:\/\/shopify\/Product\/\d+$/);assert.ok(VALUES.includes(row.desired));
  const m=classification.mappings.filter(m=>m.productGid===row.targetGid);assert.equal(m.length,1);assert.equal(m[0].classDecisionState,'approved');assert.equal(m[0].proposedProductClass,row.desired);assert.equal(m[0].approvalDecisionId,row.approvalDecisionId);}
 return bundle;
}
function verifyDefinition(response){const d=response.data.metafieldDefinition;assert.equal(response.data.shop.id,'gid://shopify/Shop/79279947973');assert.equal(response.data.shop.myshopifyDomain,'sz5dnk-nf.myshopify.com');assert.equal(d.id,DEFINITION);assert.equal(d.ownerType,'PRODUCT');assert.equal(d.namespace,'rhino');assert.equal(d.key,'product_class');assert.equal(d.type.name,'single_line_text_field');assert.deepEqual(d.validations,[{name:'choices',value:JSON.stringify(VALUES)}]);assert.equal(d.access.storefront,'PUBLIC_READ');assert.equal(d.access.customerAccount,'NONE');return d;}
function classify(row,product){assert.ok(product,'Missing exact Product '+row.targetGid);assert.equal(product.id,row.targetGid);const values=product.metafields?product.metafields.nodes.filter(m=>m.namespace==='rhino'&&m.key==='product_class'):(product.productClass?[product.productClass]:[]);
 if(values.length===0)return {rowId:row.rowId,productGid:row.targetGid,approved:row.desired,state:'ABSENT',existing:null};
 const m=values[0],exact=values.length===1&&m.type==='single_line_text_field'&&m.value===row.desired&&m.jsonValue===row.desired&&m.definition?.id===DEFINITION&&(!m.owner||m.owner.id===row.targetGid);
 return {rowId:row.rowId,productGid:row.targetGid,approved:row.desired,state:exact?'EXACT_MATCH':'CONFLICT',existing:values};
}
function mutationInput(row,product,bundle=authorize()){const planned=bundle.rows.find(r=>r.rowId===row.rowId);assert.deepEqual(row,planned,'Unapproved row');assert.equal(classify(row,product).state,'ABSENT','Never overwrite an existing value');return {ownerId:row.targetGid,namespace:'rhino',key:'product_class',type:'single_line_text_field',value:row.desired,compareDigest:null};}
function verifyMutation(result,inputs){assert.ok(!result.errors?.length);const p=result.data?.metafieldsSet;assert.ok(p);assert.deepEqual(p.userErrors,[]);assert.equal(p.metafields.length,inputs.length);for(const input of inputs){const rows=p.metafields.filter(m=>m.owner?.id===input.ownerId);assert.equal(rows.length,1);const m=rows[0];assert.equal(m.namespace,'rhino');assert.equal(m.key,'product_class');assert.equal(m.type,input.type);assert.equal(m.value,input.value);assert.equal(m.jsonValue,input.value);assert.equal(m.definition.id,DEFINITION);assert.match(m.id,/^gid:\/\/shopify\/Metafield\/\d+$/);}return p.metafields;}
function complete(snapshot){assert.equal(snapshot.shopDomain,'sz5dnk-nf.myshopify.com');assert.deepEqual(snapshot.errors,[]);for(const name of ['products','variants']){const d=snapshot.datasets[name];assert.equal(d.queryStatus,'success');assert.equal(d.errorCount,0);assert.equal(d.recordCount,d.records.length);assert.equal(new Set(d.records.map(p=>p.id)).size,d.records.length);for(const record of d.records){function inspect(v){if(!v||typeof v!=='object')return;if(v.pageInfo)assert.equal(v.pageInfo.hasNextPage,false,'Nested pagination incomplete');for(const x of Object.values(v))inspect(x);}inspect(record);}}assert.equal(snapshot.datasets.products.recordCount,122);return snapshot;}
module.exports={INPUT,INPUT_SHA,AUTH,DEFINITION,VALUES,EXPECTED,read,hash,distribution,authorize,verifyDefinition,classify,mutationInput,verifyMutation,complete};
