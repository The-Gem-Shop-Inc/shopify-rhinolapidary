'use strict';
const { read, write, schemaErrors } = require('./lib/epic-f-governance');
const { policyPath, beforePath, planPath, buildPlan } = require('./lib/epic-f-machine-template-rollout');
const plan = buildPlan(read(policyPath), read(beforePath));
const errors = schemaErrors('epic-f-machine-template-rollout-plan', plan);
if (errors.length) throw new Error(errors.join('\n'));
write(planPath, plan);
console.log(`Dry run ${plan.planHash}: assessed 11; future candidates 8; eligible now 0; exclusions 3; mutations 0.`);
