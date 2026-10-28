'use strict';

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');

const ROOT = path.resolve(__dirname, '..');
const CONTRACT_PATH = 'data/epic-k-k1d02-backend-readiness.json';
const SCHEMA_PATH = 'schemas/epic-k-k1d02-backend-readiness.schema.json';

function read(relativePath) { return fs.readFileSync(path.join(ROOT, relativePath), 'utf8'); }
function json(relativePath) { return JSON.parse(read(relativePath)); }

function validateK1d02() {
  const errors = [];
  const contract = json(CONTRACT_PATH);
  const validate = new Ajv2020({ allErrors: true, strict: true, formats: { date: /^\d{4}-\d{2}-\d{2}$/ } }).compile(json(SCHEMA_PATH));
  if (!validate(contract)) errors.push(...validate.errors.map((entry) => `${entry.instancePath || '/'} ${entry.message}`));

  const requiredFiles = [
    contract.hosting.workerConfig,
    contract.hosting.entrypoint,
    contract.hosting.migration,
    contract.shopify.appConfigurationTemplate,
    'server/epic-k-draft-order/core.js',
    'server/epic-k-draft-order/endpoint.js',
    'server/epic-k-draft-order/d1-adapters.js',
  ];
  requiredFiles.forEach((file) => { if (!fs.existsSync(path.join(ROOT, file))) errors.push(`Missing ${file}.`); });
  if (errors.length) return { errors, contract };

  const wrangler = json(contract.hosting.workerConfig);
  const packageJson = json('package.json');
  const worker = read(contract.hosting.entrypoint);
  const adapters = read('server/epic-k-draft-order/d1-adapters.js');
  const migration = read(contract.hosting.migration);
  const shopify = read(contract.shopify.appConfigurationTemplate);
  const browserSources = `${read('assets/rhino-quote-mode.js')}\n${read('snippets/rhino-quote-checkout.liquid')}`;

  if (wrangler.compatibility_date !== contract.hosting.compatibilityDate) errors.push('Worker compatibility date differs from the readiness contract.');
  if (!wrangler.d1_databases?.some((binding) => binding.binding === 'QUOTE_DB')) errors.push('Worker config lacks the QUOTE_DB binding.');
  if (wrangler.d1_databases?.some((binding) => binding.database_id !== 'REPLACE_WITH_D1_DATABASE_ID')) errors.push('Repository config must not claim an unverified remote D1 ID.');
  if (!wrangler.observability?.logs?.enabled || !wrangler.observability?.traces?.enabled) errors.push('Worker logs and traces must be explicitly enabled.');
  if (packageJson.devDependencies?.wrangler !== '4.155.0') errors.push('The validated Wrangler version must remain exact.');
  if (!worker.includes("from './endpoint.js'") || !worker.includes('createDraftOrderEndpoint')) errors.push('Worker must reuse the host-neutral K1D-01 endpoint.');
  if (!worker.includes("from './d1-adapters.js'") || !worker.includes('QUOTE_DB')) errors.push('Worker must bind the D1 adapters.');
  for (const method of ['claim', 'markMutationStarted', 'complete', 'markRetryableFailure', 'markUncertain', 'consume']) {
    if (!adapters.includes(`async ${method}`)) errors.push(`D1 adapter is missing ${method}().`);
  }
  if (!migration.includes('idempotency_key TEXT PRIMARY KEY') || !migration.includes('quote_reference TEXT NOT NULL UNIQUE')) errors.push('Migration lacks atomic unique idempotency constraints.');
  if (!migration.includes("'MUTATING'") || !migration.includes("'UNCERTAIN'")) errors.push('Migration lacks safe ambiguous-mutation states.');
  contract.shopify.requiredScopes.forEach((scope) => { if (!shopify.includes(scope)) errors.push(`Shopify template lacks ${scope}.`); });
  if (!shopify.includes('[app_proxy]') || !shopify.includes(contract.shopify.proxyDestinationPath)) errors.push('Shopify template lacks the expected app proxy destination.');
  if (/shpat_|SHOPIFY_API_SECRET\s*[:=]\s*["'][^"']+/i.test(`${worker}\n${browserSources}`)) errors.push('A committed Admin credential appears in runtime or storefront source.');
  if (browserSources.includes('/apps/rhino-quote-draft')) errors.push('Storefront automation must remain disabled until the provisioned backend is verified.');
  if (contract.state === 'REPOSITORY_READY_PROVISIONING_BLOCKED' && Object.values(contract.activation).some(Boolean)) errors.push('Blocked readiness cannot claim activation milestones.');

  const contact = json('data/epic-k-k1c02-activation-status-2026-10-27.json');
  if (!contact.verification?.contactSubmissionConfirmed) errors.push('Human-confirmed native contact email evidence has not been recorded.');
  return { errors, contract };
}

function main() {
  const result = validateK1d02();
  if (result.errors.length) {
    console.error('Epic K K1D-02 backend readiness validation failed.');
    result.errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(`Epic K K1D-02 backend readiness: valid ${result.contract.state}.`);
}

if (require.main === module) main();
module.exports = { CONTRACT_PATH, SCHEMA_PATH, validateK1d02 };
