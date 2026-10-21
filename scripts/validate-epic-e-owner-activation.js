'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),Ajv=require('ajv/dist/2020'),E=require('./lib/epic-e-owner-response-adapter');
const schema=new Ajv({strict:false,allErrors:true}).compile(E.read('schemas/epic-e-completed-owner-responses.schema.json'));
const input=E.validateResponses();assert(schema(input),JSON.stringify(schema.errors));
const auth=E.read(E.DIR+'/execution-authorization.json');
assert.equal(auth.approvalMode,'delegated_development_override');assert.equal(auth.approvedRows,input.rows.length);assert.equal(auth.allowedMutation,'metafieldsSet');assert.equal(auth.compareAndSetAbsentRequired,true);assert.equal(auth.maximumBatchSize,25);
for(const ref of [...auth.code,auth.tests,auth.responseSource,auth.responseArtifact,...auth.plans.map(p=>p.input)])assert.equal(E.hash(fs.readFileSync(ref.path)),ref.sha256,'Frozen authorization/input drift '+ref.path);
for(const p of auth.plans){const b=E.read(p.input.path);assert.equal(b.rows.length,p.approvedRows);assert(b.rows.every(r=>E.ownerRowApproved(r,input)));assert.deepEqual(b.rollback,b.rows.map(r=>({rowId:r.rowId,restore:r.before})));}
const state=E.loadReconciled();if(state)require('./lib/epic-f-customer-release').verifyRelease();
console.log(JSON.stringify({schema:'passed',ownerRowAuthority:'passed',frozenInputs:'passed',approvedRows:input.rows.length,receipt:state?'RECONCILED':'NOT_EXECUTED',shippingWeight:false,mediaMutations:false}));
