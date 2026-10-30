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
    contract.hosting.diagnosticMigration,
    contract.shopify.appConfiguration,
    'server/epic-k-draft-order/core.js',
    'server/epic-k-draft-order/endpoint.js',
    'server/epic-k-draft-order/d1-adapters.js',
    'data/epic-k-k1d02t-acceptance-fixture.json',
    'scripts/run-epic-k-k1d02t-acceptance.js',
    'scripts/test-epic-k-k1d02t-acceptance-runner.js',
  ];
  requiredFiles.forEach((file) => { if (!fs.existsSync(path.join(ROOT, file))) errors.push(`Missing ${file}.`); });
  if (errors.length) return { errors, contract };

  const wrangler = json(contract.hosting.workerConfig);
  const packageJson = json('package.json');
  const worker = read(contract.hosting.entrypoint);
  const adapters = read('server/epic-k-draft-order/d1-adapters.js');
  const endpoint = read('server/epic-k-draft-order/endpoint.js');
  const migration = read(contract.hosting.migration);
  const diagnosticMigration = read(contract.hosting.diagnosticMigration);
  const acceptanceFixture = json('data/epic-k-k1d02t-acceptance-fixture.json');
  const acceptanceRunner = read('scripts/run-epic-k-k1d02t-acceptance.js');
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
  for (const method of ['claim', 'markMutationStarted', 'complete', 'markFinalRejection', 'markRetryableFailure', 'markUncertain', 'recordDiagnostic', 'consume']) {
    if (!adapters.includes(`async ${method}`)) errors.push(`D1 adapter is missing ${method}().`);
  }
  if (!migration.includes('idempotency_key TEXT PRIMARY KEY') || !migration.includes('quote_reference TEXT NOT NULL UNIQUE')) errors.push('Migration lacks atomic unique idempotency constraints.');
  if (!migration.includes("'MUTATING'") || !migration.includes("'UNCERTAIN'")) errors.push('Migration lacks safe ambiguous-mutation states.');
  if (!diagnosticMigration.includes('CREATE TABLE quote_submission_diagnostics') || !diagnosticMigration.includes('field_paths_json') || !diagnosticMigration.includes('classifications_json')) errors.push('Diagnostic migration lacks the sanitized Shopify outcome table.');
  if (/\bmessage\b/i.test(diagnosticMigration)) errors.push('Diagnostic migration must not persist arbitrary Shopify messages.');
  if (!endpoint.includes('userErrorDiagnostic') || !endpoint.includes('graphqlErrorDiagnostic') || !endpoint.includes("finalRejection: true")) errors.push('Endpoint lacks sanitized deterministic Shopify rejection handling.');
  if (!adapters.includes("prior.errorCode?.startsWith('FINAL_')") || !adapters.includes("state: 'REJECTED'")) errors.push('D1 idempotency adapter does not fence deterministic rejection from reacquisition.');
  if (Object.hasOwn(acceptanceFixture.customer || {}, 'email')) errors.push('Acceptance fixture must not commit the owner-controlled email.');
  if (acceptanceFixture.quoteReference !== contract.evidence.nextQuotationReference) errors.push('Acceptance fixture does not use the contracted corrected quotation reference.');
  if (!acceptanceRunner.includes('K1D02T_OWNER_EMAIL') || !acceptanceRunner.includes('K1D02T_PASSWORD_ROTATED') || !acceptanceRunner.includes('Reserved test email domains')) errors.push('Acceptance runner lacks secure email, rotation, or reserved-domain gates.');
  contract.shopify.requiredScopes.forEach((scope) => { if (!shopify.includes(scope)) errors.push(`Shopify app config lacks ${scope}.`); });
  if (!shopify.includes(`client_id = "${contract.shopify.clientId}"`)) errors.push('Shopify app config has the wrong Client ID.');
  if (!shopify.includes(`${contract.hosting.workerUrl}/health`)) errors.push('Shopify app config lacks the verified Worker health URL.');
  if (!shopify.includes('[app_proxy]') || !shopify.includes(`${contract.hosting.workerUrl}${contract.shopify.proxyDestinationPath}`)) errors.push('Shopify app config lacks the provisioned app proxy destination.');
  if (/shpat_|SHOPIFY_API_SECRET\s*[:=]\s*["'][^"']+/i.test(`${worker}\n${browserSources}`)) errors.push('A committed Admin credential appears in runtime or storefront source.');
  if (browserSources.includes('/apps/rhino-quote-draft')) {
    const themeSettings = json('config/settings_schema.json').flatMap((group) => group.settings || []);
    const activation = themeSettings.find((setting) => setting.id === 'rhino_quote_draft_automation_enabled');
    const k1d03Path = path.join(ROOT, 'data/epic-k-k1d03-storefront-readiness.json');
    const k1d03 = fs.existsSync(k1d03Path) ? json('data/epic-k-k1d03-storefront-readiness.json') : null;
    if (!activation || activation.default !== false) errors.push('K1D-03 storefront automation must default to disabled.');
    if (!k1d03?.acceptance?.backendIntegrationAccepted || !k1d03?.acceptance?.customerStorefrontFormIntegrated) {
      errors.push('The app-proxy storefront path requires an explicit K1D-03 integration-readiness contract.');
    }
    if (k1d03?.acceptance?.actualBrowserSubmissionAccepted !== false || k1d03?.production?.activated !== false) {
      errors.push('K1D-03 cannot promote live browser or production acceptance through the historical K1D-02 contract.');
    }
  }
  if (contract.state === 'CORRECTED_ACCEPTANCE_AWAITING_SECURE_INPUTS') {
    const requiredTrue = ['cloudflareAccountAuthorized', 'd1Provisioned', 'migrationApplied', 'workerDeployed', 'shopifyAppCreated', 'shopifyAppVersionReleased', 'shopifyAppInstalled', 'scopesConfigured', 'scopesGranted', 'protectedCustomerDataApproved', 'secretBound', 'appProxyReleased', 'clientCredentialsVerified', 'directSignedRequestVerified', 'invalidSignatureRejected', 'expiredSignatureRejected', 'shopifyProxyForwardingVerified', 'shopifyGeneratedProxyRequestVerified', 'proxyPathCompatibilityVerified'];
    const requiredFalse = ['storefrontClientEnabled', 'controlledDraftCreated', 'previewAccepted'];
    requiredTrue.forEach((key) => { if (contract.activation[key] !== true) errors.push(`Verified K1D-02T-R prerequisite ${key} must be true.`); });
    requiredFalse.forEach((key) => { if (contract.activation[key] !== false) errors.push(`Inactive K1D-02T-R milestone ${key} must remain false.`); });
    contract.shopify.requiredScopes.forEach((scope) => { if (!contract.shopify.grantedScopes.includes(scope)) errors.push(`Installed app is missing ${scope}.`); });
    for (const scope of ['read_customer_address', 'read_customer_email', 'read_customer_name', 'read_customer_personal_data', 'read_customer_phone']) {
      if (!contract.shopify.protectedCustomerScopeHandles.includes(scope)) errors.push(`Protected customer data configuration is missing ${scope}.`);
    }
    if (!contract.shopify.acceptedProxyDestinationPaths.includes(contract.shopify.proxyDestinationPath) || !contract.shopify.acceptedProxyDestinationPaths.includes(contract.shopify.observedProxyDestinationPath)) errors.push('Approved proxy paths must include both the configured and Shopify-observed exact paths.');
    if (!fs.existsSync(path.join(ROOT, contract.evidence.authenticProxyEvidence))) errors.push('Sanitized authentic proxy evidence is missing.');
    if (!contract.evidence.controlledDraftAuthorizationReceived || !contract.evidence.controlledDraftAttempted) errors.push('K1D-02T must record the bounded owner authorization and authentic attempt.');
    if (contract.evidence.controlledDraftCreated || contract.evidence.controlledDraftResult !== 'SHOPIFY_REJECTED') errors.push('Blocked K1D-02T must not claim a Draft Order was created or accepted.');
    if (contract.evidence.shopifyDraftCountForReference !== 0 || contract.evidence.d1ClaimState !== 'FAILED_RETRYABLE' || contract.evidence.d1AttemptCount !== 1) errors.push('Blocked K1D-02T must retain the zero-draft, one-attempt FAILED_RETRYABLE result.');
    if (!fs.existsSync(path.join(ROOT, contract.evidence.controlledDraftEvidence))) errors.push('Sanitized controlled Draft Order evidence is missing.');
    else {
      const acceptance = json(contract.evidence.controlledDraftEvidence);
      if (acceptance.status !== 'BLOCKED' || acceptance.draft !== null || acceptance.admin?.draftCountForReference !== 0) errors.push('Controlled acceptance evidence must retain the blocked zero-draft result.');
      if (acceptance.d1?.state !== 'FAILED_RETRYABLE' || acceptance.d1?.attemptCount !== 1 || acceptance.d1?.draftId !== null) errors.push('Controlled acceptance evidence does not match the failed D1 claim.');
      if (acceptance.safety?.draftsCreated !== 0 || acceptance.safety?.duplicateRequestAttempted !== false) errors.push('Controlled acceptance evidence must prove no draft and no duplicate attempt.');
      const serializedAcceptance = JSON.stringify(acceptance);
      if (/access_token|client_secret|SHOPIFY_API_SECRET|signature=|100 Test Avenue|\+12025550100|k1d02t-20261029@example\.invalid/i.test(serializedAcceptance)) errors.push('Controlled acceptance evidence contains prohibited credential, URL-signature, or full synthetic contact data.');
    }
    if (!contract.evidence.failedReferencePreserved || !contract.evidence.authorizationLimitUnconsumed || contract.evidence.correctedMutationAttempted) errors.push('K1D-02T-R must preserve the failed claim and retain the unused one-draft authorization.');
    if (contract.evidence.ownerControlledEmailProvided || contract.evidence.storefrontPasswordRotationConfirmed) errors.push('K1D-02T-R must remain blocked until secure email and password-rotation confirmations are supplied.');
    if (!fs.existsSync(path.join(ROOT, contract.evidence.repairEvidence))) errors.push('Sanitized K1D-02T-R repair evidence is missing.');
    else {
      const repair = json(contract.evidence.repairEvidence);
      if (repair.status !== 'DEPLOYED_AWAITING_CONTROLLED_INPUTS' || repair.failedAttempt?.shopifyDraftCount !== 0 || repair.failedAttempt?.claimModified !== false) errors.push('Repair evidence does not preserve the zero-draft failed attempt.');
      if (!repair.diagnostics?.tableVerified || repair.diagnostics?.rawMessagesPersisted || repair.diagnostics?.publicDiagnosticEndpointAdded) errors.push('Repair evidence does not prove safe diagnostic deployment.');
      if (repair.deployment?.workerVersionId !== contract.hosting.workerVersionId || repair.deployment?.healthStatus !== 200) errors.push('Repair deployment evidence differs from the Worker readiness contract.');
      if (repair.prerequisites?.controlledMutationAttempted || repair.prerequisites?.ownerControlledEmailProvided || repair.prerequisites?.storefrontPasswordRotationConfirmed) errors.push('Repair evidence must not claim the corrected controlled mutation prerequisites passed.');
      if (/password\s*[:=]|access_token|client_secret|signature=/i.test(JSON.stringify(repair))) errors.push('Repair evidence contains prohibited credential material.');
    }
    if (contract.readiness.repositoryValidation !== 'PASS' || contract.readiness.authenticProxyAcceptance !== 'AWAITING_SECURE_INPUTS' || contract.readiness.shopifyAdminAcceptance !== 'BLOCKED_NO_DRAFT' || contract.readiness.operationalReadiness !== 'BLOCKED' || contract.readiness.productionReadiness !== 'BLOCKED') errors.push('K1D-02T-R readiness dimensions do not match the deployed-but-blocked result.');
  } else if (contract.state === 'CONTROLLED_DRAFT_ACCEPTED') {
    const requiredTrue = ['cloudflareAccountAuthorized', 'd1Provisioned', 'migrationApplied', 'workerDeployed', 'shopifyAppCreated', 'shopifyAppVersionReleased', 'shopifyAppInstalled', 'scopesConfigured', 'scopesGranted', 'protectedCustomerDataApproved', 'secretBound', 'appProxyReleased', 'clientCredentialsVerified', 'directSignedRequestVerified', 'invalidSignatureRejected', 'expiredSignatureRejected', 'shopifyProxyForwardingVerified', 'shopifyGeneratedProxyRequestVerified', 'proxyPathCompatibilityVerified', 'controlledDraftCreated', 'previewAccepted'];
    requiredTrue.forEach((key) => { if (contract.activation[key] !== true) errors.push(`Accepted K1D-02T milestone ${key} must be true.`); });
    if (contract.activation.storefrontClientEnabled !== false) errors.push('K1D-03 storefront automation must remain disabled after K1D-02T acceptance.');
    if (!contract.evidence.failedReferencePreserved) errors.push('Accepted K1D-02T must preserve the original failed reference.');
    if (!contract.evidence.ownerControlledEmailProvided || !contract.evidence.storefrontPasswordRotationConfirmed || !contract.evidence.correctedMutationAttempted) errors.push('Accepted K1D-02T must record its secure runtime prerequisites and corrected attempt.');
    if (contract.evidence.authorizationLimitUnconsumed) errors.push('The one-Draft-Order authorization must be recorded as consumed after acceptance.');
    if (!contract.evidence.controlledDraftCreated || contract.evidence.controlledDraftResult !== 'ACCEPTED' || contract.evidence.shopifyDraftCountForReference !== 1) errors.push('Accepted K1D-02T must record exactly one created Draft Order.');
    if (contract.evidence.d1ClaimState !== 'COMPLETED' || contract.evidence.d1AttemptCount !== 1 || !contract.evidence.duplicateSuppressed) errors.push('Accepted K1D-02T must prove one completed D1 attempt and duplicate suppression.');
    if (!acceptanceRunner.includes('resume-completed') || acceptanceRunner.includes('customer { id }') || acceptanceRunner.includes('order { id name }')) errors.push('Acceptance continuation must reconcile the completed claim without requesting ungranted nested customer/order objects.');
    if (!fs.existsSync(path.join(ROOT, contract.evidence.controlledDraftEvidence))) errors.push('Sanitized successful Draft Order evidence is missing.');
    else {
      const acceptance = json(contract.evidence.controlledDraftEvidence);
      if (acceptance.status !== 'PASS' || acceptance.fixture?.quotationReference !== contract.evidence.acceptedQuotationReference) errors.push('Successful acceptance evidence has the wrong status or quotation reference.');
      if (acceptance.draft?.id !== contract.evidence.acceptedDraftId || acceptance.draft?.name !== contract.evidence.acceptedDraftName || acceptance.draft?.status !== 'OPEN') errors.push('Successful acceptance evidence differs from the accepted Shopify Draft Order.');
      if (!acceptance.draft?.tags?.includes('Unquoted') || !acceptance.draft?.tags?.includes(contract.evidence.acceptedReconciliationTag)) errors.push('Accepted Draft Order evidence lacks the required tags.');
      if (acceptance.admin?.draftCountForReference !== 1 || acceptance.admin?.appearsInOrdersDrafts !== true) errors.push('Admin acceptance evidence must show exactly one discoverable draft.');
      if (acceptance.d1?.state !== 'COMPLETED' || acceptance.d1?.attemptCount !== 1 || acceptance.d1?.draftId !== contract.evidence.acceptedDraftId || acceptance.d1?.payloadHashMatched !== true) errors.push('Successful acceptance evidence differs from the completed D1 claim.');
      if (acceptance.proxy?.firstResponse?.status !== 200 || acceptance.proxy?.firstResponse?.duplicate || acceptance.proxy?.duplicateResponse?.status !== 200 || acceptance.proxy?.duplicateResponse?.duplicate !== true || acceptance.proxy?.creationReconciledAfterImmediateAdminLag !== true) errors.push('Authentic proxy evidence does not prove reconciled creation and duplicate suppression.');
      const safety = acceptance.safety || {};
      if (safety.draftsCreated !== 1 || safety.invoiceSent || safety.paymentCollectedOrAuthorized || safety.shippingLineCreated || safety.inventoryReserved || safety.orderCompleted || safety.fulfillmentCreated || safety.customerCreatedOrAttached || safety.themeChanged || safety.storefrontClientEnabled || safety.emailFallbackActive !== true) errors.push('Successful acceptance safety boundaries are incomplete.');
      if (acceptance.draft?.shippingLineAbsent !== true || acceptance.draft?.invoiceAbsent !== true || acceptance.draft?.inventoryReservationAbsent !== true || acceptance.draft?.completedOrderAbsent !== true || acceptance.draft?.paymentAbsent !== true || acceptance.draft?.fulfillmentAbsent !== true || acceptance.draft?.customerCreateOrAttachInputAbsent !== true) errors.push('Draft readback does not prove every required non-action boundary.');
      const serializedAcceptance = JSON.stringify(acceptance);
      if (/access_token|client_secret|SHOPIFY_API_SECRET|signature=|password\s*[:=]|@[A-Za-z0-9.-]+\.[A-Za-z]{2,}|1 Acceptance Way/i.test(serializedAcceptance)) errors.push('Successful acceptance evidence contains prohibited credential or contact data.');
    }
    if (!fs.existsSync(path.join(ROOT, contract.evidence.historicalBlockedEvidence))) errors.push('Historical failed-attempt evidence was not preserved.');
    if (!fs.existsSync(path.join(ROOT, contract.evidence.repairEvidence))) errors.push('K1D-02T-R repair evidence was not preserved.');
    if (contract.readiness.repositoryValidation !== 'PASS' || contract.readiness.authenticProxyAcceptance !== 'PASS' || contract.readiness.shopifyAdminAcceptance !== 'PASS' || contract.readiness.operationalReadiness !== 'READY' || contract.readiness.productionReadiness !== 'BLOCKED') errors.push('K1D-02T readiness dimensions do not match accepted backend and disabled production activation.');
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
