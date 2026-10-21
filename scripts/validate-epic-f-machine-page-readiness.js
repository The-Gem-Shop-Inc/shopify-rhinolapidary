'use strict';
const { read } = require('./lib/epic-f-governance');
const { validate, packetPath } = require('./lib/epic-f-machine-page-readiness');
try {
    const errors = validate(read(packetPath));
    if (errors.length) console.error(errors.join('\n'));
    else console.log('F8 repository packet valid: 11 exact machines; independent dimensions; stale Admin; zero grants; activation/release blocked.');
    process.exitCode = errors.length ? 1 : 0;
} catch (error) { console.error(error.message); process.exitCode = 1; }
