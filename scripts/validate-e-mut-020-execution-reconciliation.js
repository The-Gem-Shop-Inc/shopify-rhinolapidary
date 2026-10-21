'use strict';
const fs = require('node:fs'), assert = require('node:assert/strict');
const {authorize,classify,hash} = require('./lib/e-mut-020-development-execution');
const {compareNative,verifyAfterPlan} = require('./lib/epic-e-readiness');
const {buildDefinitionDiff} = require('./lib/epic-e-custom-data-contract');
const read = p => JSON.parse(fs.readFileSync(p));
const beforePath = 'docs/qa/evidence/epic-e/E-MUT-020-2026-10-05-before-admin-snapshot.json';
const afterPath = 'docs/qa/evidence/epic-e/E-MUT-020-2026-10-05-after-admin-snapshot.json';
const before = read(beforePath), after = read(afterPath), bundle = authorize();
const rows = classify(after); assert.equal(rows.length,38); assert.ok(rows.every(r=>r.beforeState==='EXACT_MATCH'));
const native = compareNative(before,after); assert.deepEqual(native.changes,[]);
for (const dataset of ['products','variants']) assert.deepEqual(after.datasets[dataset].records,before.datasets[dataset].records, 'Native record drift: '+dataset);
assert.equal(after.datasets.products.records.reduce((n,p)=>n+p.metafields.nodes.filter(m=>m.namespace==='rhino').length,0),0);
assert.deepEqual(after.datasets.machineFamilies.records,[]);
const machineIds=read('data/epic-e-product-classification.json').mappings.filter(r=>r.proposedProductClass==='machine').map(r=>r.productGid);
assert.equal(machineIds.length,11);
for(const id of machineIds)assert.ok(after.datasets.products.records.some(p=>p.id===id),'Governed machine missing: '+id);
const accessInventory=read('docs/qa/evidence/epic-e/E-MUT-020-2026-10-05-definition-after-inventory.json').response.data;
assert.equal(accessInventory.metafieldDefinitions.pageInfo.hasNextPage,false);
assert.equal(accessInventory.metaobjectDefinitions.pageInfo.hasNextPage,false);
assert.equal(accessInventory.metafieldDefinitions.nodes.length,37);
assert.ok(accessInventory.metafieldDefinitions.nodes.every(d=>d.metafieldsCount===0&&d.access.customerAccount==='NONE'));
assert.ok(accessInventory.metaobjectDefinitions.nodes.every(d=>d.access.customerAccount==='NONE'));
const definitionDiff = buildDefinitionDiff(read('data/metafield-metaobject-definitions.json'),after,{asOf:'2026-10-05'});
const verification = verifyAfterPlan(bundle,before,after,definitionDiff); assert.ok(verification.matchesExpectedState);
const journal = read('docs/qa/evidence/epic-e/E-MUT-020-2026-10-05-journal.json');
for (const row of rows) assert.equal(row.existingGid,journal.reconciledIds[row.rowId]);
const result={planId:'E-MUT-020',state:'EXECUTED_AND_RECONCILED',definitionRows:38,definitionRowsReconciled:38,ProductValuesPopulated:0,
  compatibilityValuesCreated:0,bomResourceValuesCreated:0,machineFamilyRecordsCreated:0,rows,verification,native,
  comparedProducts:122,comparedVariants:125,all11GovernedMachinesIncluded:true,
  sources:[beforePath,afterPath].map(path=>({path,sha256:hash(fs.readFileSync(path))})),
  apiVersionExposed:false,apiSurface:'Shopify connector Admin GraphQL',approvalMode:'delegated_development_override',E_MUT_021Executed:false};
fs.writeFileSync('docs/qa/evidence/epic-e/E-MUT-020-2026-10-05-reconciliation.json',JSON.stringify(result,null,2)+'\n');
console.log('E-MUT-020: EXECUTED_AND_RECONCILED; 38/38 exact; zero Product/Variant record changes; zero values/records populated.');
