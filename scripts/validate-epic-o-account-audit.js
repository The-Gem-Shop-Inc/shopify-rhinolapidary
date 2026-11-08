'use strict';

const fs = require('node:fs');
const {paths, readJson, validateSnapshot} = require('./lib/epic-o-account-audit');

const missing = Object.entries(paths).filter(([, file]) => !fs.existsSync(file));
if (missing.length) {
  console.error(`Epic O account audit validation failed: missing ${missing.map(([name]) => name).join(', ')}.`);
  process.exit(1);
}

const result = validateSnapshot(readJson(paths.snapshot), readJson(paths.queries), {
  now: process.env.EPIC_O_VALIDATION_TIME || '2026-11-08T04:00:00.000Z',
});

if (result.errors.length) {
  console.error('Epic O account audit validation failed.');
  result.errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('Epic O account audit validation passed: canonical store, fresh minimum query, NEW_CUSTOMER_ACCOUNTS, and zero mutations.');
  console.log(`Native repository implementation path: ${result.readyForNativeRepositoryWork ? 'READY' : 'NOT READY'}.`);
  result.warnings.forEach((warning) => console.log(`UNVERIFIED: ${warning}`));
}
