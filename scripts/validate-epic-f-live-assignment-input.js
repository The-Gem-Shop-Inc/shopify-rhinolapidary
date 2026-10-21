'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const M=require('./lib/epic-f-live-machine-activation');
function validate(gid){const auth=M.read(M.DIR+'/assignment-authorization.json'),plan=M.validatePlan(M.read(M.PLAN));
 assert.equal(auth.authorizationSha256,M.digest(Object.fromEntries(Object.entries(auth).filter(([k])=>k!=='authorizationSha256'))));assert.equal(auth.liveDeploymentPlanSha256,plan.planSha256);assert.equal(M.hash(fs.readFileSync(auth.protectedBeforePath)),auth.protectedBeforeSha256);assert.equal(M.hash(fs.readFileSync(auth.visibilityEvidence.path)),auth.visibilityEvidence.sha256);assert.equal(M.hash(fs.readFileSync('data/epic-f-machine-template-rollout-plan.json')),auth.historicalF7PlanFileSha256);
 const id=gid.split('/').pop();assert.match(id,/^\d+$/);const immediate=M.read(M.DIR+'/immediate-before-'+id+'.json');assert.ok(Date.now()-Date.parse(immediate.completedAt)<30000,'Immediate compare-before-write must be current');assert.equal(immediate.product.id,gid);const input=M.verifyAssignment(immediate.product,auth);assert.deepEqual(Object.keys(input).sort(),['id','templateSuffix']);return input;
}
if(require.main===module)console.log(JSON.stringify(validate(process.argv[2])));module.exports={validate};
