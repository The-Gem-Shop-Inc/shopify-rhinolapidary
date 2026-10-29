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
  const validate = new Ajv2020({ allErrors: true, strict: true, formats: { date: /^\d{4}-\d{2}-\d{2}$/, 'date-time': /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/ } }).compile(json(SCHEMA_PATH));
  if (!validate(contract)) errors.push(...validate.errors.map((entry) => `${entry.instancePath || '/'} ${entry.message}`));

  const requiredFiles = [
    contract.hosting.workerConfig,
    contract.hosting.entrypoint,
    contract.hosting.migration,
    contract.shopify.appConfiguration,
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
  const shopify = read(contract.shopify.appConfiguration);
  const browserSources = `${read('assets/rhino-quote-mode.js')}\n${read('snippets/rhino-quote-checkout.liquid')}`;

  if (wrangler.compatibility_date !== contract.hosting.compatibilityDate) errors.push('Worker compatibility date differs from the readiness contract.');
  const d1 = wrangler.d1_databases?.find((binding) => binding.binding === contract.hosting.d1Binding);
  if (!d1) errors.push('Worker config lacks the contracted D1 binding.');
  if (d1?.database_name !== contract.hosting.d1DatabaseName || d1?.database_id !== contract.hosting.d1DatabaseId) errors.push('Worker D1 binding differs from the provisioned database evidence.');
  if (wrangler.vars?.SHOPIFY_SHOP_DOMAIN !== contract.shopify.canonicalShop) errors.push('Worker must target the canonical Shopify Admin domain.');
  if (wrangler.vars?.SHOPIFY_APP_CLIENT_ID !== contract.shopify.clientId) errors.push('Worker Client ID differs from the provisioned Shopify app.');
  if (!wrangler.secrets?.required?.includes('SHOPIFY_API_SECRET')) errors.push('Worker config must declare SHOPIFY_API_SECRET as a required secret binding.');
  if (!wrangler.observability?.logs?.enabled || !wrangler.observability?.traces?.enabled) errors.push('Worker logs and traces must be explicitly enabled.');
  if (packageJson.devDependencies?.wrangler !== '4.155.0') errors.push('The validated Wrangler version must remain exact.');
  if (!worker.includes("from './endpoint.js'") || !worker.includes('createDraftOrderEndpoint')) errors.push('Worker must reuse the host-neutral K1D-01 endpoint.');
  if (!worker.includes("from './d1-adapters.js'") || !worker.includes('QUOTE_DB')) errors.push('Worker must bind the D1 adapters.');
  if (!worker.includes("url.pathname !== '/shopify/app-proxy/quote' && url.pathname !== '/shopify/app-proxy/quote/'")) errors.push('Worker must allow exactly the configured app-proxy path with or without one trailing slash.');
  if (/url\.pathname\.startsWith\([^\n]*app-proxy/i.test(worker)) errors.push('Worker app-proxy routing must not use permissive prefix matching.');
  for (const method of ['claim', 'markMutationStarted', 'complete', 'markRetryableFailure', 'markUncertain', 'consume']) {
    if (!adapters.includes(`async ${method}`)) errors.push(`D1 adapter is missing ${method}().`);
  }
  if (!migration.includes('idempotency_key TEXT PRIMARY KEY') || !migration.includes('quote_reference TEXT NOT NULL UNIQUE')) errors.push('Migration lacks atomic unique idempotency constraints.');
  if (!migration.includes("'MUTATING'") || !migration.includes("'UNCERTAIN'")) errors.push('Migration lacks safe ambiguous-mutation states.');
  contract.shopify.requiredScopes.forEach((scope) => { if (!shopify.includes(scope)) errors.push(`Shopify app config lacks ${scope}.`); });
  if (!shopify.includes(`client_id = "${contract.shopify.clientId}"`)) errors.push('Shopify app config has the wrong Client ID.');
  if (!shopify.includes(`${contract.hosting.workerUrl}/health`)) errors.push('Shopify app config lacks the verified Worker health URL.');
  if (!shopify.includes('[app_proxy]') || !shopify.includes(`${contract.hosting.workerUrl}${contract.shopify.proxyDestinationPath}`)) errors.push('Shopify app config lacks the provisioned app proxy destination.');
  if (/shpat_|SHOPIFY_API_SECRET\s*[:=]\s*["'][^"']+/i.test(`${worker}\n${browserSources}`)) errors.push('A committed Admin credential appears in runtime or storefront source.');
  if (browserSources.includes('/apps/rhino-quote-draft')) errors.push('Storefront automation must remain disabled until the provisioned backend is verified.');
  if (contract.state === 'READY_FOR_CONTROLLED_DRAFT_TEST') {
    const requiredTrue = ['cloudflareAccountAuthorized', 'd1Provisioned', 'migrationApplied', 'workerDeployed', 'shopifyAppCreated', 'shopifyAppVersionReleased', 'shopifyAppInstalled', 'scopesConfigured', 'scopesGranted', 'protectedCustomerDataApproved', 'secretBound', 'appProxyReleased', 'clientCredentialsVerified', 'directSignedRequestVerified', 'invalidSignatureRejected', 'expiredSignatureRejected', 'shopifyProxyForwardingVerified', 'shopifyGeneratedProxyRequestVerified', 'proxyPathCompatibilityVerified'];
    const requiredFalse = ['storefrontClientEnabled', 'controlledDraftCreated', 'previewAccepted'];
    requiredTrue.forEach((key) => { if (contract.activation[key] !== true) errors.push(`Verified K1D-02V-R milestone ${key} must be true.`); });
    requiredFalse.forEach((key) => { if (contract.activation[key] !== false) errors.push(`Inactive K1D-02V-R milestone ${key} must remain false.`); });
    contract.shopify.requiredScopes.forEach((scope) => { if (!contract.shopify.grantedScopes.includes(scope)) errors.push(`Installed app is missing ${scope}.`); });
    for (const scope of ['read_customer_address', 'read_customer_email', 'read_customer_name', 'read_customer_personal_data', 'read_customer_phone']) {
      if (!contract.shopify.protectedCustomerScopeHandles.includes(scope)) errors.push(`Protected customer data configuration is missing ${scope}.`);
    }
    if (!contract.shopify.acceptedProxyDestinationPaths.includes(contract.shopify.proxyDestinationPath) || !contract.shopify.acceptedProxyDestinationPaths.includes(contract.shopify.observedProxyDestinationPath)) errors.push('Approved proxy paths must include both the configured and Shopify-observed exact paths.');
    if (!fs.existsSync(path.join(ROOT, contract.evidence.authenticProxyEvidence))) errors.push('Sanitized authentic proxy evidence is missing.');
    if (contract.evidence.controlledDraftAuthorizationReceived || contract.evidence.controlledDraftCreated) errors.push('K1D-02V-R must not record Draft Order authorization or creation.');
  }

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
