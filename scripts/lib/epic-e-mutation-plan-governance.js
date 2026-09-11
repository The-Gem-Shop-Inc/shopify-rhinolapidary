const fs=require('fs'),path=require('path'),crypto=require('crypto');
const Ajv=require('ajv/dist/2020');
const {assessAdmin}=require('./epic-e-readiness');
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function validateMutationPlan(data,{root=process.cwd(),asOf=new Date().toISOString()}={}){
 const errors=[],schema=JSON.parse(fs.readFileSync(path.join(root,'schemas/epic-e-admin-mutation-plan.schema.json')));
 const validate=new Ajv({allErrors:true,strict:false}).compile(schema);
 if(!validate(data))return validate.errors.map(e=>`${e.instancePath} ${e.message}`);
 if(['E-PBI-022','E-PBI-023'].includes(data.targetPbi))errors.push('Oversized E-PBI-022/023 must be split before authorization');
 for(const role of ['Product Owner','Shopify Admin Owner'])if(data.approvals.filter(a=>a.role===role).length!==1)errors.push(`exactly one ${role} approval slot required`);
 const artifacts=[data.currentReadSnapshot,data.deterministicInput,data.beforeState,data.rollback.artifact,data.dryRun.artifact];
 for(const a of artifacts)if(a.sha256){const p=path.resolve(root,a.path);if(!fs.existsSync(p)||hash(p)!==a.sha256)errors.push(`stale or missing artifact: ${a.path}`);}
 if(['approved','completed'].includes(data.executionStatus)){
  for(const a of artifacts)if(!a.sha256||/^REQUIRED:/.test(a.path))errors.push('approved execution requires hashed real before/input/rollback/dry-run artifacts');
  for(const a of data.approvals){
   if(!a.granted||!a.recordedAt||!a.evidence){errors.push(`${a.role} GO missing`);continue;}
   const p=path.resolve(root,a.evidence);let record;try{record=JSON.parse(fs.readFileSync(p));}catch{errors.push('GO evidence must be a real governed decision record');continue;}
   if(record.planId!==data.planId||record.inputSha256!==data.deterministicInput.sha256||record.ownerRole!==a.role||record.decision!=='GO'||record.recordedAt!==a.recordedAt||!Number.isFinite(Date.parse(a.recordedAt))||Date.parse(a.recordedAt)>Date.parse(asOf))errors.push('GO is not bound to this exact plan/input/role/time');
  }
  if(data.dryRun.status!=='passed')errors.push('approved execution requires passed dry run');
  if(data.fieldAllowlist.some(f=>/^REQUIRED:|NO_APPROVED/.test(f)))errors.push('no approved exact field allowlist');
  try{const snapshot=JSON.parse(fs.readFileSync(path.resolve(root,data.currentReadSnapshot.path)));if(!snapshot.readOnly||!snapshot.redacted||!assessAdmin(snapshot,asOf,true).currentReconciliationUsable)errors.push('stale/incomplete Admin snapshot cannot authorize execution');}catch{errors.push('current Admin snapshot unavailable');}
 }
 return errors;
}
module.exports={validateMutationPlan};
