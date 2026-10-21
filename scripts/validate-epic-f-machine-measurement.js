'use strict';
const { read } = require('./lib/epic-f-governance');
const { validateContract, validateRuntime } = require('./lib/epic-f-machine-measurement');
const errors = [...validateContract(read('data/epic-f-machine-measurement-contract.json')), ...validateRuntime()];
if (errors.length) console.error(errors.join('\n'));
else console.log('Measurement contract ready; four singular U native owner slots (assignments unresolved); four optional questions; instrumentation blocked; runtime/budgets unchanged; zero emissions.');
process.exitCode = errors.length ? 1 : 0;
