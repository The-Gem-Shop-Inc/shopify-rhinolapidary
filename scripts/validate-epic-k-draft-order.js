'use strict';

const fs = require('fs');
const path = require('path');
const Ajv2020 = require('ajv/dist/2020');
const { API_VERSION, validatePayload } = require('../server/epic-k-draft-order/core');
const { CREATE_DRAFT_MUTATION } = require('../server/epic-k-draft-order/endpoint');

const ROOT = path.resolve(__dirname, '..');
const CONTRACT_PATH = 'data/epic-k-k1d01-draft-order-automation.json';
const SCHEMA_PATH = 'schemas/epic-k-k1d01-draft-order-automation.schema.json';

function read(relativePath) { return fs.readFileSync(path.join(ROOT, relativePath), 'utf8'); }
function readJson(relativePath) { return JSON.parse(read(relativePath)); }

function validateDraftOrderAutomation() {
  const errors = [];
  const contract = readJson(CONTRACT_PATH);
  const ajv = new Ajv2020({ allErrors: true, strict: true, formats: { date: /^\d{4}-\d{2}-\d{2}$/ } });
  const validate = ajv.compile(readJson(SCHEMA_PATH));
  if (!validate(contract)) errors.push(...validate.errors.map((entry) => `${entry.instancePath || '/'} ${entry.message}`));
  if (API_VERSION !== contract.shopify.apiVersion) errors.push('Endpoint and contract API versions differ.');
  if (contract.state === 'REPOSITORY_READY_INTEGRATION_BLOCKED' && Object.values(contract.activation).some(Boolean)) {
    errors.push('A repository-ready blocked contract cannot claim any activation milestone.');
  }

  const endpoint = read('server/epic-k-draft-order/endpoint.js');
  const core = read('server/epic-k-draft-order/core.js');
  const snippet = read('snippets/rhino-quote-checkout.liquid');
  const browserJs = read('assets/rhino-quote-mode.js');
  const layout = read('layout/theme.liquid');
  const publicSources = `${snippet}\n${browserJs}`;
  if (!snippet.includes("form 'contact'")) errors.push('Native Shopify contact-form fallback is not present.');
  if (!layout.includes('{{ content_for_header }}')) errors.push('layout/theme.liquid must preserve content_for_header.');
  if (/SHOPIFY_(?:ADMIN_)?ACCESS_TOKEN|shpat_|X-Shopify-Access-Token/i.test(publicSources)) {
    errors.push('A browser or Liquid file appears to contain an Admin API credential.');
  }
  if (!core.includes("payload.fulfillment !== 'shipping'")) errors.push('Pickup requests must fail closed before draft creation.');
  if (!endpoint.includes('verifyAppProxyUrl')) errors.push('The endpoint must authenticate the app proxy before processing.');
  if (!endpoint.includes('idempotencyStore.claim')) errors.push('The endpoint must use a durable atomic idempotency claim.');
  if (!endpoint.includes('findDraftsByTag')) errors.push('Uncertain mutations must reconcile before retry.');
  if (!CREATE_DRAFT_MUTATION.includes('draftOrderCreate')) errors.push('The endpoint must use draftOrderCreate.');
  if (/draftOrderInvoiceSend|draftOrderComplete|orderTransaction|payment/i.test(CREATE_DRAFT_MUTATION)) {
    errors.push('The mutation must not invoice, complete, or process payment.');
  }
  if (/shippingLine\s*:|reserveInventoryUntil\s*:|priceOverride\s*:/.test(core)) {
    errors.push('The draft input builder must not set shipping, inventory reservation, or price overrides.');
  }
  if (!contract.dependencies.every((entry) => entry.state === 'BLOCKED')) errors.push('Outstanding integration dependencies must remain explicit.');

  try {
    validatePayload({ fulfillment: 'pickup' });
    errors.push('Pickup payload validation unexpectedly passed.');
  } catch (error) {
    if (error.code !== 'PICKUP_NOT_ALLOWED') errors.push('Pickup payload failed for an unexpected reason.');
  }
  return { errors, contract };
}

function main() {
  const result = validateDraftOrderAutomation();
  if (result.errors.length) {
    console.error('Epic K K1D-01 draft-order validation failed.');
    result.errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }
  console.log(`Epic K K1D-01 draft-order contract: valid ${result.contract.state}.`);
}

if (require.main === module) main();
module.exports = { CONTRACT_PATH, SCHEMA_PATH, validateDraftOrderAutomation };
