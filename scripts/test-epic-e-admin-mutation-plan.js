const fs=require('fs');const os=require('os');const path=require('path');const cp=require('child_process');const assert=require('assert/strict');
const root=process.cwd();const base=JSON.parse(fs.readFileSync(path.join(root,'data/epic-e-admin-mutation-plan-template.json')));const temp=path.join(os.tmpdir(),'rhino-epic-e-mutation-plan-test.json');
function run(plan){fs.writeFileSync(temp,JSON.stringify(plan));return cp.spawnSync(process.execPath,['scripts/validate-epic-e-admin-mutation-plan.js',temp],{cwd:root,encoding:'utf8'});}
assert.equal(run(base).status,0);
const missing={...base};delete missing.fieldAllowlist;assert.notEqual(run(missing).status,0);
const oversized={...base,targetPbi:'E-PBI-022'};assert.notEqual(run(oversized).status,0);
const falselyApproved=JSON.parse(JSON.stringify(base));falselyApproved.executionStatus='approved';assert.notEqual(run(falselyApproved).status,0);
fs.unlinkSync(temp);console.log('Epic E mutation-plan negative tests passed: missing safety metadata, unsplit E-PBI-022, and approval without GO are rejected.');
