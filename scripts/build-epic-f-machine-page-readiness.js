'use strict';
const { write } = require('./lib/epic-f-governance');
const { build, validate, packetPath } = require('./lib/epic-f-machine-page-readiness');
const packet = build(new Date().toISOString());
const errors = validate(packet);
write(packetPath, packet);
if (errors.length) console.error(errors.join('\n'));
else console.log(`F8 packet generated: 11 machines; repository aggregate passed; live release not ready/not authorized`);
process.exitCode = errors.length ? 1 : 0;
