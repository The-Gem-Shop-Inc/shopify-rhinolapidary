'use strict';

const fs = require('node:fs');
const {paths, readJson, validateNativeMvp} = require('./lib/epic-o-native-mvp');

const missing = Object.entries(paths).filter(([, file]) => !fs.existsSync(file));
if (missing.length) {
  console.error(`Epic O native MVP validation failed: missing ${missing.map(([name]) => name).join(', ')}.`);
  process.exit(1);
}

const result = validateNativeMvp(readJson(paths.contract), readJson(paths.fixtures), readJson(paths.snapshot), readJson(paths.authorization));
if (result.errors.length) {
  console.error('Epic O native MVP validation failed.');
  result.errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log('Epic O native MVP validation passed: native route delegation, no duplicate account stack, and eleven Buy again contract fixtures.');
  result.warnings.forEach((warning) => console.log(`PENDING INTEGRATION: ${warning}`));
}
