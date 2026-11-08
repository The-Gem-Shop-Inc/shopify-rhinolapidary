'use strict';

const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');

const root = path.resolve(__dirname, '..', '..');
const paths = {
  snapshot: path.join(root, 'data', 'epic-o-account-capability-snapshot-2026-11-07.json'),
  schema: path.join(root, 'schemas', 'epic-o-account-capability-snapshot.schema.json'),
  queries: path.join(root, 'data', 'epic-o-read-only-query-inventory.json'),
  authorization: path.join(root, 'docs', 'project', 'epic-o-authorization-record.json'),
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const isDateTime = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value));

function schemaValidator() {
  const ajv = new Ajv2020({allErrors: true, strict: false});
  ajv.addFormat('date-time', {type: 'string', validate: isDateTime});
  return ajv.compile(readJson(paths.schema));
}

function sensitiveContentErrors(value) {
  const text = JSON.stringify(value);
  const patterns = [
    ['Shopify access token', /shp(?:at|ca|ss)_[A-Za-z0-9_]+/i],
    ['private key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ['customer GID', /gid:\/\/shopify\/(?:Customer|Order|MailingAddress)\//i],
    ['email address', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
    ['credential-bearing URL', /https?:\/\/[^\s"/]+:[^\s"@]+@/i],
    ['private URL query or fragment', /https?:\/\/[^\s"]+[?#][^\s"]+/i],
  ];
  return patterns.filter(([, pattern]) => pattern.test(text)).map(([label]) => `Artifact contains prohibited ${label}.`);
}

function validateSnapshot(snapshot, queryInventory, options = {}) {
  const errors = [];
  const warnings = [];
  const validateSchema = schemaValidator();
  if (!validateSchema(snapshot)) {
    errors.push(...validateSchema.errors.map((error) => `Schema ${error.instancePath || '/'} ${error.message}.`));
  }

  const now = new Date(options.now || Date.now());
  const observed = new Date(snapshot.observedAt);
  const expires = new Date(snapshot.expiresAt);
  if (!isDateTime(snapshot.observedAt) || !isDateTime(snapshot.expiresAt)) {
    errors.push('Observation and expiry must be valid date-times.');
  } else {
    if (observed >= expires) errors.push('Evidence expiry must be after observation.');
    if (now > expires) errors.push('Evidence is stale and cannot satisfy implementation readiness.');
    if (observed > now) errors.push('Evidence observation cannot be in the future.');
  }

  const store = snapshot.canonicalStore || {};
  if (store.expectedMyshopifyDomain !== 'sz5dnk-nf.myshopify.com' ||
      store.observedMyshopifyDomain !== store.expectedMyshopifyDomain || store.identityVerified !== true) {
    errors.push('Canonical store identity mismatch.');
  }

  const requiredVerified = [
    ['account mode', snapshot.configuration?.accountMode],
    ['login-link visibility', snapshot.configuration?.loginLinksVisible],
    ['checkout login requirement', snapshot.configuration?.loginRequiredAtCheckout],
  ];
  for (const [label, finding] of requiredVerified) {
    if (!finding || finding.evidenceState !== 'verified' || finding.value === null || finding.value === undefined) {
      errors.push(`Missing ${label} must not be represented as verified.`);
    }
  }

  const mode = snapshot.configuration?.accountMode?.value;
  if (!['CLASSIC', 'NEW_CUSTOMER_ACCOUNTS'].includes(mode)) errors.push('Account mode must use the Shopify enum.');
  if (mode === 'CLASSIC' && snapshot.completeness?.implementationPathConfirmed === true) {
    errors.push('A CLASSIC finding cannot confirm the new customer account implementation path.');
  }
  if (snapshot.completeness?.implementationPathConfirmed === true && mode !== 'NEW_CUSTOMER_ACCOUNTS') {
    errors.push('Native new-account implementation readiness requires NEW_CUSTOMER_ACCOUNTS.');
  }

  const inventory = snapshot.additionalInventory || {};
  const apps = inventory.installedAppsAndExtensions || {};
  const segments = inventory.customerSegments || {};
  if (apps.paginationComplete === true && apps.permissionState !== 'permitted') {
    errors.push('An inaccessible app inventory cannot be described as complete.');
  }
  if (segments.paginationComplete === true &&
      (segments.permissionState !== 'permitted' || !Number.isInteger(segments.pages) || segments.pages < 1)) {
    errors.push('Segment pagination completeness requires permitted access and at least one traversed page.');
  }
  if (snapshot.completeness?.additionalInventoryComplete === true &&
      (apps.paginationComplete !== true || inventory.shopifyFlow?.workflowInventory === 'unverified' ||
       inventory.customerAccountMenu?.rhinoConfiguration === 'unverified')) {
    errors.push('Partial or inaccessible additional inventories cannot be described as complete.');
  }
  if (snapshot.api?.versionEvidenceState === 'verified' && !snapshot.api?.exactAdminApiVersion) {
    errors.push('Missing exact API version must not be represented as verified.');
  }
  if (snapshot.completeness?.oPbi001Complete === true &&
      (snapshot.completeness.additionalInventoryComplete !== true || snapshot.api?.versionEvidenceState !== 'verified')) {
    errors.push('O-PBI-001 cannot be Complete while required evidence remains inaccessible or unverified.');
  }

  if (snapshot.zeroMutationAssertion !== true || queryInventory?.zeroMutationAssertion !== true) {
    errors.push('Zero mutation assertion is required.');
  }
  const ids = new Set();
  for (const operation of queryInventory?.operations || []) {
    if (ids.has(operation.id)) errors.push(`Duplicate query inventory ID ${operation.id}.`);
    ids.add(operation.id);
    if (operation.operationType !== 'query') errors.push(`${operation.id} is not an allowed read-only query operation.`);
    if (/mutation/i.test(operation.operationName || '')) errors.push(`${operation.id} has a mutation-shaped operation name.`);
    if (operation.customerRecordsRead !== false) errors.push(`${operation.id} must assert that customer records were not read.`);
    if (operation.rawResponseStored !== false) errors.push(`${operation.id} must not store a raw response.`);
  }
  if (!(queryInventory?.operations || []).some((operation) => operation.operationName === 'RhinoEpicOAccountAudit')) {
    errors.push('Minimum account audit query is missing from the inventory.');
  }

  errors.push(...sensitiveContentErrors(snapshot), ...sensitiveContentErrors(queryInventory));
  if (snapshot.dataHandling?.containsCustomerPii !== false || snapshot.dataHandling?.containsSecrets !== false ||
      snapshot.dataHandling?.containsPrivateUrls !== false || snapshot.dataHandling?.rawApiResponseStored !== false) {
    errors.push('Data handling assertions must reject PII, secrets, private URLs, and raw responses.');
  }

  if (snapshot.api?.versionEvidenceState === 'unverified') warnings.push('Exact Admin API version is not exposed by the connector.');
  if (apps.permissionState === 'access-denied') warnings.push('Installed app and extension inventory is inaccessible.');
  if (inventory.checkoutAndAccountsConfiguration?.publicationState === 'unverified') warnings.push('Checkout/accounts publication state is unverified.');
  if (inventory.customerAccountMenu?.rhinoConfiguration === 'unverified') warnings.push('Customer account menu configuration is unverified.');
  if (inventory.buyAgain?.rhinoVisibility === 'unverified') warnings.push('Rhino Buy again visibility is unverified.');
  if (inventory.shopifyFlow?.workflowInventory === 'unverified') warnings.push('Shopify Flow workflow inventory is unverified.');

  const readyForNativeRepositoryWork = errors.length === 0 &&
    mode === 'NEW_CUSTOMER_ACCOUNTS' &&
    snapshot.configuration?.loginLinksVisible?.value === true &&
    snapshot.minimumQuery?.success === true &&
    snapshot.completeness?.implementationPathConfirmed === true;

  return {errors, warnings, readyForNativeRepositoryWork};
}

module.exports = {
  paths,
  readJson,
  sensitiveContentErrors,
  validateSnapshot,
};
