'use strict';
const { read } = require('./lib/epic-f-governance');
const { planPath, policyPath, beforePath, validatePlan, executionBlockers } = require('./lib/epic-f-machine-template-rollout');
const plan = read(planPath), policy = read(policyPath), before = read(beforePath);
const errors = validatePlan(plan, policy, before);
if (!executionBlockers(plan, policy, before, new Date().toISOString()).length) errors.push('F7 must not be executable');
if (errors.length) console.error(errors.join('\n'));
else console.log(`Rollout plan ready: ${plan.planHash}; all 11 assessed; eight conditional future candidates; zero eligible/executable; rollback exact; both GO absent; publication forbidden.`);
process.exitCode = errors.length ? 1 : 0;
