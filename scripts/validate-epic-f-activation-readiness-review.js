'use strict';
const { read } = require('./lib/epic-f-governance');
const { validate, packetPath } = require('./lib/epic-f-activation-readiness-review');
try {
    const errors = validate(read(packetPath));
    if (errors.length) console.error(errors.join('\n'));
    else console.log('Activation review valid: 11 current exact Products; source-bound blockers; zero activation/mutation; F8 preserved.');
    process.exitCode = errors.length ? 1 : 0;
} catch (error) { console.error(error.stack); process.exitCode = 1; }
