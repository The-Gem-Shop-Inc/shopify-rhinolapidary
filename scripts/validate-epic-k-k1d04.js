'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { validateK1d03 } = require('./validate-epic-k-k1d03');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST = 'data/epic-k-k1d04p-release-manifest.json';
const READINESS = 'data/epic-k-k1d04p-release-readiness.json';
const AUDIT = 'docs/qa/evidence/epic-k/k1d04p-release-readiness-2026-11-05/current-shopify-audit.json';
const MATRIX = 'docs/qa/evidence/epic-k/k1d04p-release-readiness-2026-11-05/checkout-bypass-matrix.json';
const PREPARED = 'docs/qa/evidence/epic-k/k1d04p-release-readiness-2026-11-05/prepared-candidate-hashes.json';
const ENFORCEMENT = 'docs/qa/evidence/epic-k/k1d04p-release-readiness-2026-11-05/shipping-enforcement-audit.json';
const CONNECTED_ADMIN = 'docs/qa/evidence/epic-k/k1d04p-release-readiness-2026-11-05/connected-shopify-delivery-evidence-2026-11-05.json';
const CHECKOUT = 'docs/qa/evidence/epic-k/k1d04p-release-readiness-2026-11-05/checkout-enforcement-2026-11-05.json';
const CHECKOUT_CONFIRMATION = 'docs/qa/evidence/epic-k/k1d04p-release-readiness-2026-11-05/checkout-bypass-confirmation-2026-11-05.json';
const UNAVAILABLE_PICKUP = 'docs/qa/evidence/epic-k/k1d04p-release-readiness-2026-11-05/unavailable-pickup-checkout-2026-11-05.json';
const RECORD = 'docs/project/implementation-records/epic-k1d04p-production-release-readiness.md';

function readJson(relative) { return JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8')); }
function source(relative) { return fs.readFileSync(path.join(ROOT, relative), 'utf8'); }
function sha(relative) { return crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, relative))).digest('hex'); }

function validateEnforcementGate(enforcement, readiness, manifest, now = Date.now()) {
  const errors = [];
  if (enforcement.store?.canonicalDomain !== manifest.store || enforcement.store?.identityStatus !== 'PASS') {
    errors.push('Shipping enforcement audit belongs to the wrong or unverified Shopify store.');
  }
  const capturedAt = Date.parse(enforcement.capturedAt);
  if (!Number.isFinite(capturedAt) || now - capturedAt > 24 * 60 * 60 * 1000 || capturedAt - now > 5 * 60 * 1000) {
    errors.push('Shipping configuration-model identification is missing, stale, or future-dated.');
  }
  const model = enforcement.configurationModel;
  if (model?.status !== 'PASS' || !['LEGACY_DELIVERY_PROFILES_WITH_MARKETS_COUNTRY_COVERAGE', 'MARKET_DRIVEN_WITH_APP_PROFILE_SURFACE'].includes(model.classification)) {
    errors.push('Active Shopify shipping configuration model is not identified from a current ShopFeatures read.');
  }
  const inventory = enforcement.authoritativeConfigurationInventory;
  const profilePass = inventory?.profiles?.status === 'PASS';
  const marketPass = inventory?.markets?.status === 'PASS';
  const ratesPass = inventory?.rates?.status === 'PASS';
  const discountsPass = inventory?.shippingDiscounts?.status === 'PASS';
  const pickupPass = inventory?.pickupLocations?.status === 'PASS';
  const checkoutPass = enforcement.storefrontEvidence?.policyDisposition === 'PASS';
  const noBypass = enforcement.storefrontEvidence?.payableShippingBypassConclusion === 'NO_BYPASS_VERIFIED';
  const rollbackPass = enforcement.rollbackAuthority?.productionRestorePermission === 'PASS'
    && enforcement.rollbackAuthority?.productionDeleteFiveNewFilesPermission === 'PASS';
  const publicationPass = enforcement.gitPublication?.status === 'PASS'
    && enforcement.gitPublication?.remoteSha === manifest.publishedPreparationCommit;
  if (!publicationPass) errors.push('Release preparation commit is not proven published on the authorized branch.');
  const unresolved = !profilePass || !marketPass || !ratesPass || !discountsPass || !pickupPass || !checkoutPass || !noBypass || !rollbackPass;
  if (unresolved && !/BLOCKED|FAIL|REMEDIATION/.test(readiness.state)) {
    errors.push('Uninspected profiles/Markets, unsupported checkout conclusions, or rollback gaps must keep readiness explicitly blocked.');
  }
  if (enforcement.releaseDisposition?.productionReady === true && unresolved) {
    errors.push('Production readiness is unsupported while configuration, checkout, bypass, or rollback evidence is unresolved.');
  }
  if (enforcement.storefrontEvidence?.payableShippingBypassConclusion === 'PAYABLE_BYPASS_VERIFIED'
    && enforcement.releaseDisposition?.state !== 'FAIL_POLICY') {
    errors.push('A verified payable shipping bypass must be classified FAIL_POLICY.');
  }
  return errors;
}

function validateK1d04() {
  const errors = [];
  for (const file of [MANIFEST, READINESS, AUDIT, MATRIX, PREPARED, ENFORCEMENT, CONNECTED_ADMIN,
    CHECKOUT, CHECKOUT_CONFIRMATION, UNAVAILABLE_PICKUP, RECORD]) {
    if (!fs.existsSync(path.join(ROOT, file))) errors.push(`Missing K1D-04 artifact: ${file}`);
  }
  if (errors.length) return { errors };

  const manifest = readJson(MANIFEST);
  const readiness = readJson(READINESS);
  const audit = readJson(AUDIT);
  const matrix = readJson(MATRIX);
  const prepared = readJson(PREPARED);
  const enforcement = readJson(ENFORCEMENT);
  const connectedAdmin = readJson(CONNECTED_ADMIN);
  const checkout = readJson(CHECKOUT);
  const checkoutConfirmation = readJson(CHECKOUT_CONFIRMATION);
  const unavailablePickup = readJson(UNAVAILABLE_PICKUP);
  const record = source(RECORD);
  const packageJson = readJson('package.json');

  if (manifest.store !== 'sz5dnk-nf.myshopify.com' || manifest.sourceThemeId !== '158631198917'
    || manifest.destinationThemeId !== '158579622085' || manifest.destinationRole !== 'live') {
    errors.push('Release manifest store/source/destination identity is incorrect.');
  }
  if (manifest.files.length !== 11 || new Set(manifest.files.map((entry) => entry.path)).size !== 11) {
    errors.push('Release manifest must contain exactly 11 unique dependency-complete files.');
  }
  if (manifest.files.some((entry) => entry.path.startsWith('templates/') || entry.path.includes('non-default'))
    || manifest.fullThemePushAllowed || manifest.publishCommandAllowed || manifest.activationAuthorized) {
    errors.push('Manifest exceeds the scoped, unauthorized English-only preparation boundary.');
  }
  const settingsData = manifest.files.find((entry) => entry.path === 'config/settings_data.json');
  if (!settingsData || settingsData.operation !== 'set_single_current_key_true_on_live_copy'
    || settingsData.allowedMutation !== 'current.rhino_quote_draft_automation_enabled: absent -> true'
    || manifest.settingsDataReplacementAllowed) {
    errors.push('settings_data must be a one-key merge and never a preview/repository replacement.');
  }
  for (const entry of manifest.files.filter((item) => item.sourceSha256)) {
    if (sha(entry.path) !== entry.sourceSha256) errors.push(`Repository source hash drifted: ${entry.path}`);
  }
  if (manifest.rollback.restoreExistingFromExactBackup.length !== 6
    || manifest.rollback.deleteFilesAbsentBeforeRelease.length !== 5) {
    errors.push('Rollback manifest must restore six prior files and delete five previously absent files.');
  }
  errors.push(...validateEnforcementGate(enforcement, readiness, manifest));
  if (readiness.state !== 'READY_FOR_OWNER_RELEASE_AUTHORIZATION'
    || enforcement.releaseDisposition?.state !== 'READY_FOR_OWNER_RELEASE_AUTHORIZATION'
    || enforcement.releaseDisposition?.productionReady !== true) {
    errors.push('Closed preparation gates must report READY_FOR_OWNER_RELEASE_AUTHORIZATION without claiming activation.');
  }
  if (prepared.productionMutationPerformed || prepared.destinationThemeId !== manifest.destinationThemeId
    || prepared.files.length !== manifest.files.length
    || prepared.files.some((entry) => !/^[a-f0-9]{64}$/.test(entry.sha256))) {
    errors.push('Sanitized local candidate preparation evidence is incomplete or claims a production write.');
  }

  if (readiness.productionActivationComplete || readiness.productionMutationPerformed
    || readiness.authorization.productionThemeMutationAuthorized
    || readiness.authorization.shippingConfigurationMutationAuthorized) {
    errors.push('K1D-04P must not claim authorization, mutation, or activation.');
  }
  if (!readiness.acceptedBaseline.k1d02tPreserved || !readiness.acceptedBaseline.k1d03aPreserved
    || !readiness.acceptedBaseline.draftD2Untouched || !readiness.acceptedBaseline.draftD3Untouched) {
    errors.push('Accepted K1D-02T/K1D-03A evidence must remain preserved.');
  }
  if (readiness.blockingPreconditions.length !== 0
    || readiness.activationPreconditions?.length !== 4
    || !readiness.activationPreconditions.every((entry) => entry.requiredBeforeProductionMutation)) {
    errors.push('Readiness must distinguish closed preparation blockers from four production-window preconditions.');
  }

  const profileAssignments = connectedAdmin.deliveryProfiles?.reduce((sum, profile) => sum + profile.assignedVariantCount, 0);
  const zones = connectedAdmin.deliveryProfiles?.flatMap((profile) => profile.zones || []) || [];
  if (connectedAdmin.store !== manifest.store
    || connectedAdmin.provenance?.independentlyReproducedByThisEnvironment !== false
    || connectedAdmin.provenance?.canonicalStoreVerifiedByConnectedIntegration !== true
    || connectedAdmin.totals?.deliveryProfileCount !== 2
    || connectedAdmin.totals?.zoneCount !== 3
    || profileAssignments !== 125
    || zones.some((zone) => zone.activeShippingMethodCount !== 0
      || zone.carrierParticipantDefinitionCount !== 0 || zone.rateDefinitionCount !== 0)
    || connectedAdmin.markets?.activeCount !== 1
    || connectedAdmin.markets?.nodes?.[0]?.countryCodes?.join(',') !== 'US'
    || connectedAdmin.discounts?.configuredCount !== 0
    || connectedAdmin.discounts?.additionalPages !== false) {
    errors.push('Connected Shopify evidence provenance or zero-method profile/Market/discount inventory is incomplete.');
  }

  if (checkout.store !== manifest.store || checkout.scenarios?.length !== 5
    || checkout.scenarios.some((scenario) => scenario.rates?.methodCount !== 0
      || !Object.values(scenario.cart?.requiresShippingByVariant || {}).every(Boolean)
      || scenario.checkout?.payableShippingBypassObserved !== false)
    || checkout.scenarios.filter((scenario) => scenario.destination !== 'canada')
      .some((scenario) => scenario.checkout?.selectedDeliveryContext !== 'GRAFTON_PICKUP')
    || checkout.scenarios.find((scenario) => scenario.destination === 'canada')?.checkout?.payButtonEnabled !== false
    || checkout.operations?.quotationProxyPosts !== 0 || checkout.operations?.contactPosts !== 0
    || checkout.operations?.paymentOrCompletionPosts !== 0 || checkout.operations?.paymentSubmitted
    || checkout.operations?.orderCompleted || checkout.operations?.draftOrderCreatedOrModified) {
    errors.push('Live checkout evidence does not prove zero shipping methods with payment limited to Grafton pickup.');
  }
  if (checkoutConfirmation.scenarios?.length !== 1
    || checkoutConfirmation.scenarios[0].checkout?.selectedDeliveryContext !== 'GRAFTON_PICKUP'
    || checkoutConfirmation.scenarios[0].checkout?.payableShippingBypassObserved !== false
    || unavailablePickup.unavailablePickupDisposition !== 'NOT_APPLICABLE_CURRENT_STATE'
    || unavailablePickup.unavailablePickupSearch?.checkedCount !== 71
    || unavailablePickup.unavailablePickupSearch?.line !== null) {
    errors.push('Pickup-context confirmation or unavailable-inventory current-state evidence is incomplete.');
  }

  if (audit.store?.canonicalDomain !== 'sz5dnk-nf.myshopify.com' || audit.store?.identityVerified !== true
    || !audit.themes?.some((theme) => theme.id === '158579622085' && theme.role === 'live')
    || !audit.themes?.some((theme) => theme.id === '158631198917' && theme.role === 'unpublished')) {
    errors.push('Current authenticated audit does not confirm store and theme roles.');
  }
  if (audit.variants?.nonGiftCardRequiresShippingFalseCount !== 0 || audit.variants?.potentialBypassVariants?.length !== 0) {
    errors.push('Current Product audit contains Requires-shipping bypass Variants.');
  }
  if (audit.conclusions?.currentAdminConfigurationFullyAudited !== false
    || audit.configuration?.deliveryProfiles?.queryStatus !== 'inaccessible_current_app_scope') {
    errors.push('Readiness must not misclassify the narrow-scope Admin audit as complete.');
  }
  if (audit.safety?.productionThemeWrites !== 0 || audit.safety?.shippingConfigurationWrites !== 0
    || audit.safety?.draftOrdersCreatedOrModified !== 0 || audit.safety?.proxyPosts !== 0
    || audit.safety?.contactPosts !== 0 || audit.safety?.paymentsCollected !== 0 || audit.safety?.ordersCompleted !== 0) {
    errors.push('K1D-04 audit crossed a prohibited mutation boundary.');
  }
  if (!audit.acceptedDrafts?.every((draft) => draft.status === 'OPEN' && draft.unquotedTagPresent
    && draft.shippingLineAbsent && draft.invoiceAbsent && draft.completionAbsent && draft.reservationAbsent)) {
    errors.push('Accepted Draft Orders #D2/#D3 are not proven preserved.');
  }
  if (!matrix.cases?.some((entry) => entry.case === 'direct_checkout_navigation' && entry.status === 'PASS')
    || !matrix.cases?.some((entry) => entry.case === 'requires_shipping_misconfiguration' && entry.status === 'PASS_ZERO_FLAGGED')) {
    errors.push('Checkout matrix must preserve direct-checkout and Requires-shipping enforcement findings.');
  }

  for (const signal of ['--allow-live', '--nodelete', 'rollback.deleteFilesAbsentBeforeRelease', 'Do not use `theme publish`',
    'current.rhino_quote_draft_automation_enabled=true', 'Production activation is not complete']) {
    if (!record.includes(signal)) errors.push(`Release procedure is missing: ${signal}`);
  }
  if (/shpat_|SHOPIFY_API_SECRET\s*=|password\s*=\s*["'][^"']+/i.test([
    record, source(MANIFEST), source(READINESS), source(AUDIT), source(CONNECTED_ADMIN), source(CHECKOUT),
  ].join('\n'))) {
    errors.push('K1D-04 artifacts appear to contain a secret.');
  }
  if (!packageJson.scripts['validate:epic-k-k1d04'] || !packageJson.scripts['test:epic-k-k1d04']) {
    errors.push('K1D-04 package commands are missing.');
  }
  const prior = validateK1d03();
  errors.push(...prior.errors.map((error) => `K1D-03 regression: ${error}`));
  return { errors, manifest, readiness };
}

function main() {
  const result = validateK1d04();
  if (result.errors.length) {
    console.error('Epic K1D-04 production readiness validation failed.');
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log('Epic K1D-04 production readiness: valid preparation, 0 production mutations.');
  console.log('K1D-04 is READY_FOR_OWNER_RELEASE_AUTHORIZATION; production activation remains unperformed and unauthorized.');
}

if (require.main === module) main();
module.exports = { validateEnforcementGate, validateK1d04 };
