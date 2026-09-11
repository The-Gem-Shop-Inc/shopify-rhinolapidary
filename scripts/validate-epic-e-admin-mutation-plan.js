const fs=require('fs');
const {validateMutationPlan}=require('./lib/epic-e-mutation-plan-governance');
const target=process.argv[2]||'data/epic-e-admin-mutation-plan-template.json';
const data=JSON.parse(fs.readFileSync(target,'utf8'));
const errors=validateMutationPlan(data);
if(errors.length){console.error(`Epic E mutation-plan validation failed for ${target}.\n${errors.map(e=>'- '+e).join('\n')}`);process.exitCode=1;}
else console.log(`Epic E mutation-plan validation passed for ${target} (${data.executionStatus}; no mutation executed).`);
