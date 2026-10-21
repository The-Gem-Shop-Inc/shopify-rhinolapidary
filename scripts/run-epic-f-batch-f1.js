'use strict';
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');

// Run every suite and preserve actual exit codes. Historical cross-Epic failures
// are reported separately, never rewritten as passing launch checks.
const required = [
  'validate:epic-f-consumer', 'test:epic-f-consumer', 'validate:epic-f-claims', 'test:epic-f-claims',
  'validate:registers', 'validate:product-templates', 'validate:product-purchase',
  'validate:brand-claims', 'test:brand-claims-validator', 'validate:metafields',
  'validate:epic-e-batch-2b1-registers', 'validate:epic-e-batch-4a-contracts',
  'validate:theme-repository', 'validate:theme-architecture', 'validate:storefront-js',
  'validate:settings-data', 'validate:fixtures', 'theme:check',
];
const diagnostics = ['validate:launch-fixtures', 'validate:product-data'];
const results = [];
for (const script of [...required, ...diagnostics]) {
  const extra = script === 'validate:product-data' ? ['--', 'data/product-export/products.csv'] : [];
  const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', script, ...extra], { encoding: 'utf8' });
  const row = { command: `npm run ${script}${extra.length ? ' ' + extra.join(' ') : ''}`, exitCode: result.status ?? 1, requiredForBatch: required.includes(script) };
  results.push(row);
  fs.mkdirSync('test-results/epic-f/validation', { recursive: true });
  fs.writeFileSync(`test-results/epic-f/validation/${script.replaceAll(':', '-')}.txt`, (result.stdout || '') + (result.stderr || ''));
  console.log(`${row.command}: exit ${row.exitCode}${row.requiredForBatch ? '' : ' (existing release diagnostic)'}`);
}
const social = spawnSync(process.execPath, ['scripts/validate-social-metadata-contract.js'], { encoding: 'utf8' });
results.push({ command: 'node scripts/validate-social-metadata-contract.js', exitCode: social.status ?? 1, requiredForBatch: true });
console.log(`node scripts/validate-social-metadata-contract.js: exit ${social.status}`);
fs.writeFileSync('test-results/epic-f/validation/social-metadata.txt', (social.stdout || '') + (social.stderr || ''));
const failed = results.some(r => r.requiredForBatch && r.exitCode !== 0);
const report = { schemaVersion: 1, assessedAt: new Date().toISOString(), batch: 'F1',
  architectureComplete: !failed, activationReady: false, adminMutationOccurred: false, themePushedOrPublished: false,
  results, exitCode: failed ? 1 : 0 };
fs.writeFileSync('test-results/epic-f/batch-f1-validation.json', JSON.stringify(report, null, 2) + '\n');
console.log(`Batch F1 repository gate: exit ${report.exitCode}; activation remains blocked. Full commands/results: test-results/epic-f/batch-f1-validation.json`);
process.exitCode = report.exitCode;
