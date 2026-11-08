'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {sensitiveContentErrors} = require('./epic-o-account-audit');

const root = path.resolve(__dirname, '..', '..');
const paths = {
  contract: path.join(root, 'data', 'epic-o-native-mvp-contract.json'),
  fixtures: path.join(root, 'tests', 'fixtures', 'epic-o-native-account.json'),
  snapshot: path.join(root, 'data', 'epic-o-account-capability-snapshot-2026-11-07.json'),
  authorization: path.join(root, 'docs', 'project', 'epic-o-authorization-record.json'),
  header: path.join(root, 'sections', 'header.liquid'),
  drawer: path.join(root, 'snippets', 'header-drawer.liquid'),
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const read = (file) => fs.readFileSync(file, 'utf8');

function evaluateBuyAgainScenario(scenario) {
  const lines = scenario.lines || [];
  if (scenario.navigationInterrupted) {
    return {added: {}, failed: [], status: 'navigation-recovery', returnDestination: 'order-detail'};
  }
  if (scenario.networkFailure) {
    return {added: {}, failed: lines.map((line) => line.key), status: 'network-error', recoverable: true, liveRegion: 'polite'};
  }

  const added = {};
  const failed = [];
  const adjusted = [];
  const priceUsed = {};
  for (const line of lines) {
    if (line.state !== 'available' || !Number.isInteger(line.maxAllowed) || line.maxAllowed < 1) {
      failed.push(line.key);
      continue;
    }
    const quantity = Math.min(line.requestedQuantity, line.maxAllowed);
    if (quantity < line.requestedQuantity) adjusted.push(line.key);
    added[line.key] = quantity;
    priceUsed[line.key] = line.currentPrice;
  }

  let status = failed.length && Object.keys(added).length ? 'partial' : failed.length ? 'failed' : adjusted.length ? 'adjusted' : 'complete';
  const result = {added, failed, status, currentCatalogStateUsed: true, historicalTermsPromised: false, liveRegion: 'polite'};
  if (adjusted.length) result.adjusted = adjusted;
  if (Object.keys(priceUsed).length) result.priceUsed = priceUsed;
  if ((scenario.activationCount || 1) > 1) result.acceptedActivations = 1;
  if (failed.length) result.focusTarget = 'reorder-status';
  return result;
}

function validateNativeMvp(contract, fixtures, snapshot, authorization) {
  const errors = [];
  const warnings = [];
  if (authorization?.recordId !== 'O-AUTH-001' || authorization?.authorized?.repositoryImplementationForOPbi004And005WhenPrerequisitesSatisfied !== true) {
    errors.push('Later Product Owner authorization for O-PBI-004/005 is missing.');
  }
  if (authorization?.planningSnapshotRemainsHistorical !== true || authorization?.supersedesPlanningAuthorizationFlags !== false) {
    errors.push('The dated planning snapshot must remain historical and unmodified by later authorization.');
  }
  if (snapshot?.configuration?.accountMode?.value !== 'NEW_CUSTOMER_ACCOUNTS' ||
      snapshot?.configuration?.accountMode?.evidenceState !== 'verified') {
    errors.push('Verified NEW_CUSTOMER_ACCOUNTS evidence is required.');
  }
  if (contract?.architecture?.mvp !== 'native-shopify-no-new-application') errors.push('MVP architecture must remain native Shopify with no new application.');
  for (const key of ['renderNewAccountPagesInLiquid', 'customAuthentication', 'customSessionManagement', 'customOrderFetching', 'customAddressPersistence', 'customReorderEngine']) {
    if (contract?.architecture?.[key] !== false) errors.push(`Architecture boundary ${key} must be false.`);
  }
  if (contract?.architecture?.themeChangesRequired !== false) errors.push('No theme change is justified by the verified native route delegation.');

  const header = read(paths.header);
  const drawer = read(paths.drawer);
  for (const [label, source] of [['desktop header', header], ['mobile drawer', drawer]]) {
    for (const token of ['shop.customer_accounts_enabled', 'routes.account_url', 'routes.account_login_url', 'customer.account_fallback', 'customer.log_in', 'rel="nofollow"']) {
      if (!source.includes(token)) errors.push(`${label} is missing account-entry token ${token}.`);
    }
  }
  if (!header.includes('class="header__icon header__icon--account link focus-inset')) errors.push('Desktop account entry must retain the governed focus class.');
  if (!drawer.includes('class="menu-drawer__account link focus-inset')) errors.push('Mobile account entry must retain the governed focus class.');

  const accountIds = new Set((fixtures.accountStates || []).map((state) => state.id));
  const requiredAccountIds = [
    'anonymous-entry', 'authenticated-empty-orders', 'authenticated-multiple-order-pages',
    'address-actions', 'unavailable-destination', 'account-link-hidden-by-platform',
  ];
  for (const id of requiredAccountIds) if (!accountIds.has(id)) errors.push(`Missing account fixture ${id}.`);

  const scenarioIds = new Set((fixtures.buyAgainScenarios || []).map((scenario) => scenario.id));
  const requiredScenarioIds = [
    'fully-available-previous-order', 'mixed-available-unavailable', 'deleted-or-unpublished-variants',
    'changed-current-prices', 'changed-quantity-limits', 'sold-out-variants', 'duplicate-activation',
    'partial-cart-additions', 'network-failure', 'navigation-recovery', 'accessible-failure-status-reporting',
  ];
  for (const id of requiredScenarioIds) if (!scenarioIds.has(id)) errors.push(`Missing Buy again fixture ${id}.`);
  if ((fixtures.buyAgainScenarios || []).length !== requiredScenarioIds.length) errors.push('Buy again fixtures must contain exactly the eleven approved scenarios.');

  for (const scenario of fixtures.buyAgainScenarios || []) {
    const result = evaluateBuyAgainScenario(scenario);
    for (const [key, expected] of Object.entries(scenario.expected || {})) {
      if (JSON.stringify(result[key]) !== JSON.stringify(expected)) {
        errors.push(`${scenario.id} expected ${key}=${JSON.stringify(expected)} but computed ${JSON.stringify(result[key])}.`);
      }
    }
    if (result.historicalTermsPromised === true) errors.push(`${scenario.id} promises historical terms.`);
  }

  for (const invariant of ['purchaseDoesNotEstablishOwnership', 'orderHistoryDoesNotEstablishCompatibility', 'orderHistoryDoesNotEstablishRegistration', 'orderHistoryDoesNotEstablishWarrantyEligibility', 'syntheticFixturesOnly']) {
    if (contract?.privacyInvariants?.[invariant] !== true) errors.push(`Required privacy invariant ${invariant} is missing.`);
  }
  errors.push(...sensitiveContentErrors(fixtures));

  if ((contract.integrationVerificationPending || []).length < 6) errors.push('Native integration limitations must remain explicit.');
  if (contract.nativeCapabilities?.buyAgain?.includes('visibility-unverified')) warnings.push('Buy again visibility remains pending safe Admin inspection.');
  if (contract.nativeCapabilities?.accountNavigation?.includes('configuration-unverified')) warnings.push('Customer account menu remains pending safe Admin inspection.');
  warnings.push('Synthetic fixtures validate Rhino contracts, not live Shopify-hosted customer behavior.');

  return {errors, warnings};
}

module.exports = {paths, readJson, evaluateBuyAgainScenario, validateNativeMvp};
