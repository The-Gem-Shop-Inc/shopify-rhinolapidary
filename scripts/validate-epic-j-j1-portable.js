'use strict';
const fs = require('node:fs'), P = require('./lib/epic-j-j1-portability-v1');
try {
  const args = process.argv.slice(2), value = k => args[args.indexOf(k) + 1];
  const root = args.includes('--root') ? value('--root') : process.cwd();
  const mode = args.includes('--mode') ? value('--mode') : 'local';
  const result = args.includes('--publication-list') ? P.publication({ root, paths: JSON.parse(fs.readFileSync(value('--publication-list'), 'utf8')).paths }) : P.verify({ root, mode });
  console.log(JSON.stringify(result)); process.exitCode = result.status === 'PASS' ? 0 : 2;
} catch (e) { console.log(JSON.stringify({ schemaVersion: 1, status: 'FAIL', reasonCode: e.code || 'VALIDATOR_ERROR', ...(e.path ? { path: e.path } : {}) })); process.exitCode = 1; }
