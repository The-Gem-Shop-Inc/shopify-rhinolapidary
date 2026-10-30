'use strict';

const fs = require('node:fs');
const Ajv2020 = require('ajv/dist/2020');
const { readJson } = require('./lib/epic-k-policy');

const READINESS_PATH = 'data/epic-k-k1d03-storefront-readiness.json';
const SCHEMA_PATH = 'schemas/epic-k-k1d03-storefront-readiness.schema.json';
const VIEWPORTS = [
  '1440-desktop', '1024-desktop-tablet', '768-tablet', '390-mobile', '320-mobile', '1440-at-200-percent-equivalent',
];

function source(path) { return fs.readFileSync(path, 'utf8'); }

function validateK1d03() {
  const errors = [];
  const readiness = readJson(READINESS_PATH);
  const schema = readJson(SCHEMA_PATH);
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
  if (!validate(readiness)) {
    errors.push(...validate.errors.map((entry) => `${entry.instancePath || '/'} ${entry.message}`));
  }

  const settingsSchema = readJson('config/settings_schema.json');
  const automationSettings = settingsSchema.flatMap((group) => group.settings || [])
    .filter((setting) => setting.id === 'rhino_quote_draft_automation_enabled');
  if (automationSettings.length !== 1 || automationSettings[0].type !== 'checkbox' || automationSettings[0].default !== false) {
    errors.push('Draft Order automation must have exactly one checkbox theme setting that defaults to disabled.');
  }
  const settingsData = readJson('config/settings_data.json');
  if (settingsData.current.rhino_quote_draft_automation_enabled !== false) {
    errors.push('Repository theme settings must keep Draft Order automation disabled by default.');
  }

  const liquid = source('snippets/rhino-quote-checkout.liquid');
  for (const signal of [
    'settings.rhino_quote_draft_automation_enabled', 'data-proxy-endpoint="/apps/rhino-quote-draft"',
    'contact[first_name]', 'contact[last_name]', 'data-rhino-draft-submit', 'data-rhino-email-submit',
    'Email fallback - not stored as a Shopify Draft Order', 'data-rhino-draft-confirmation',
    'REFERENCE_PENDING', 'item.variant.id', 'item.quantity', 'item.properties', 'item.selling_plan_allocation',
    'cart.note', 'data-rhino-pickup-checkout', 'name="checkout" form="cart"',
  ]) {
    if (!liquid.includes(signal)) errors.push(`K1D-03 Liquid integration is missing: ${signal}`);
  }
  if (/cart\.token/.test(liquid)) errors.push('Raw Shopify cart tokens must not be rendered into public quotation markup.');

  const section = source('sections/main-cart-footer.liquid');
  const clientIndex = section.indexOf("rhino-quote-draft-client.js");
  const modeIndex = section.indexOf("rhino-quote-mode.js");
  if (clientIndex < 0 || modeIndex < 0 || clientIndex > modeIndex) {
    errors.push('The Draft Order client must load before the quote-mode custom element.');
  }
  if (section.includes('content_for_additional_checkout_buttons')) {
    errors.push('Accelerated checkout must remain suppressed for quotation carts.');
  }

  const client = source('assets/rhino-quote-draft-client.js');
  const mode = source('assets/rhino-quote-mode.js');
  for (const signal of [
    'safeCartToken', 'fingerprint', 'decideIdentity', 'storedInShopifyAdmin === true',
    'STAFF_IDENTIFIER_PATTERN', 'SUBMISSION_IN_PROGRESS', "state: 'uncertain'", 'discountRepresentation',
  ]) {
    if (!client.includes(signal) && !mode.includes(signal)) errors.push(`K1D-03 client safety contract is missing: ${signal}`);
  }
  for (const signal of [
    "this.submissionState = 'validating'", "this.submissionState = 'submitting'", "this.submissionState = 'confirmed'",
    "this.submissionState = 'failed'", "this.submissionState = 'uncertain'", "this.submissionState = 'fallback'",
    "fetch(this.dataset.proxyEndpoint", 'this.fetchCart()', 'this.cartBaseline', 'reportValidity()',
  ]) {
    if (!mode.includes(signal)) errors.push(`K1D-03 state machine is missing: ${signal}`);
  }
  const storefrontSources = [liquid, section, client, mode].join('\n');
  if (/X-Shopify-Access-Token|SHOPIFY_API_SECRET|shpat_|draftOrderCreate|draftOrderInvoiceSend|draftOrderComplete/i.test(storefrontSources)) {
    errors.push('Storefront code must not contain Admin credentials or direct Draft Order mutations.');
  }
  if (/unitPrice|linePrice|shippingLine|shippingCharge|priceOverride/.test(client)) {
    errors.push('The browser payload builder must not send merchandise or shipping price overrides.');
  }

  const english = readJson('locales/en.default.json').sections?.cart?.quote_mode || {};
  for (const key of [
    'first_name', 'last_name', 'submit_draft', 'submit_email_fallback', 'email_fallback_explanation',
    'cart_changed', 'fallback_required', 'uncertain', 'rejected', 'draft_confirmed_status',
    'draft_success_heading', 'draft_success_next', 'success_body',
  ]) {
    if (typeof english[key] !== 'string' || !english[key].trim()) errors.push(`English K1D-03 copy is missing: ${key}`);
  }

  if (readiness.acceptance.actualBrowserSubmissionAccepted !== false) {
    errors.push('Actual customer browser submission cannot be accepted without a separately authorized live Draft Order.');
  }
  if (readiness.production.activated || readiness.production.themeChanged || readiness.production.automationEnabled) {
    errors.push('K1D-03 must not claim or perform production activation.');
  }
  if (readiness.authorization.liveDraftOrderCreationAuthorized) {
    errors.push('K1D-03 must preserve the consumed live Draft Order authorization boundary.');
  }

  for (const viewport of VIEWPORTS) {
    const screenshot = `docs/qa/evidence/epic-k/k1d03-storefront-2026-10-30/mocked/shipping-${viewport}.png`;
    if (!fs.existsSync(screenshot) || fs.statSync(screenshot).size < 1000) {
      errors.push(`Mocked browser geometry screenshot is missing: ${screenshot}`);
    }
  }
  if (readiness.preview.automationEnabled) {
    const deploymentPath = 'docs/qa/evidence/epic-k/k1d03-storefront-2026-10-30/preview-deployment.json';
    if (!fs.existsSync(deploymentPath)) errors.push('Preview deployment/readback evidence is missing.');
    else {
      const deployment = readJson(deploymentPath);
      if (deployment.preview?.themeId !== readiness.preview.themeId || deployment.preview?.role !== 'unpublished'
        || deployment.preview?.automationEnabled !== true || deployment.preview?.files?.some((file) => file.exactReadback === false || file.semanticReadback === false)) {
        errors.push('Preview deployment evidence does not confirm unpublished, enabled, exact scoped readback.');
      }
      if (deployment.production?.themeId !== readiness.production.themeId || deployment.production?.changed !== false
        || deployment.production?.draftClientPresent !== false || deployment.production?.automationEnabled !== false) {
        errors.push('Production readback must remain unchanged with Draft Order automation absent.');
      }
      if (deployment.operations?.liveDraftOrdersCreated !== 0 || deployment.operations?.themePublished !== false) {
        errors.push('Deployment evidence must confirm zero live drafts and no publication.');
      }
    }
    const summaryPath = 'docs/qa/evidence/epic-k/k1d03-storefront-2026-10-30/preview-mocked/verification-summary.json';
    if (!fs.existsSync(summaryPath)) errors.push('Deployed preview verification summary is missing.');
    else {
      const summary = readJson(summaryPath);
      if (summary.themeId !== readiness.preview.themeId || summary.proxyMode !== 'PLAYWRIGHT_INTERCEPTED_MOCK') {
        errors.push('Deployed preview evidence does not identify the approved theme and mocked proxy boundary.');
      }
      if (summary.liveDraftOrdersCreated !== 0 || summary.liveContactRequestsSubmitted !== 0 || summary.actualAjaxCartCompared !== true) {
        errors.push('Deployed preview evidence must use an actual Ajax cart without a live Draft Order or contact submission.');
      }
    }
    for (const viewport of VIEWPORTS) {
      const screenshot = `docs/qa/evidence/epic-k/k1d03-storefront-2026-10-30/preview-mocked/shipping-${viewport}.png`;
      if (!fs.existsSync(screenshot) || fs.statSync(screenshot).size < 1000) {
        errors.push(`Deployed preview screenshot is missing: ${screenshot}`);
      }
    }
  }

  return { errors, readiness };
}

function main() {
  const result = validateK1d03();
  if (result.errors.length) {
    console.error('Epic K1D-03 storefront integration validation failed.');
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Epic K1D-03 storefront integration: valid ${result.readiness.state}.`);
  console.log('Backend/proxy/controlled draft: accepted; storefront: integrated with mocked browser acceptance.');
  console.log('Actual browser Draft Order submission and production activation: not accepted.');
}

if (require.main === module) main();

module.exports = { READINESS_PATH, SCHEMA_PATH, validateK1d03 };
