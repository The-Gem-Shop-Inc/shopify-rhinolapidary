'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  mergeCartDrawer,
  mergeEnglishLocale,
  mergeSettingsData,
  mergeSettingsSchema,
} = require('./prepare-epic-k-k1d04-release');
const { validateEnforcementGate } = require('./validate-epic-k-k1d04');

function pathsChanged(before, after, prefix = '') {
  if (JSON.stringify(before) === JSON.stringify(after)) return [];
  if (!before || !after || typeof before !== 'object' || typeof after !== 'object') return [prefix];
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  return [...keys].flatMap((key) => pathsChanged(before[key], after[key], prefix ? `${prefix}.${key}` : key));
}

function run() {
  const liveDrawer = `before unrelated-live-marker
<small class="tax-note caption-large rte">shipping at checkout</small>
between
<button
            type="submit"
            id="CartDrawer-Checkout"
            class="cart__checkout-button button"
            name="checkout"
            form="CartDrawer-Form"
          >Checkout</button>
after`;
  const drawer = mergeCartDrawer(liveDrawer);
  assert.match(drawer, /unrelated-live-marker/);
  assert.match(drawer, /quote_mode\.merchandise_total_note/);
  assert.match(drawer, /quote_mode\.review_delivery_options/);
  assert.doesNotMatch(drawer, /name="checkout"/);

  const liveLocale = { general: { custom: 'preserve' }, sections: { cart: { title: 'Cart', quote_mode: { old: 'old' } } } };
  const repoLocale = { sections: { cart: { quote_mode: { submit_draft: 'Submit', success: 'Saved' } } } };
  const locale = mergeEnglishLocale(liveLocale, repoLocale);
  assert.deepEqual(pathsChanged(liveLocale, locale), [
    'sections.cart.quote_mode.old',
    'sections.cart.quote_mode.submit_draft',
    'sections.cart.quote_mode.success',
  ]);
  assert.equal(locale.general.custom, 'preserve');

  const liveSchema = [{ name: 'Cart', settings: [{ type: 'checkbox', id: 'show_cart_note', default: false }, { type: 'text', id: 'merchant_live_setting' }] }];
  const schema = mergeSettingsSchema(liveSchema);
  assert.equal(schema[0].settings[1].id, 'rhino_quote_draft_automation_enabled');
  assert.equal(schema[0].settings[1].default, false);
  assert.equal(schema[0].settings[2].id, 'merchant_live_setting');
  assert.throws(() => mergeSettingsSchema(schema), /already contains/);

  const liveSettings = { current: { merchant_live_setting: 'keep' }, presets: { Default: { custom: true } } };
  const settings = mergeSettingsData(liveSettings);
  assert.deepEqual(pathsChanged(liveSettings, settings), ['current.rhino_quote_draft_automation_enabled']);
  assert.equal(settings.current.merchant_live_setting, 'keep');
  assert.deepEqual(settings.presets, liveSettings.presets);
  assert.throws(() => mergeSettingsData(settings), /already exists/);

  const manifest = require('../data/epic-k-k1d04p-release-manifest.json');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rhino-k1d04-rollback-'));
  const original = new Map();
  for (const entry of manifest.files) {
    const target = path.join(root, entry.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (entry.expectedProductionSha256) {
      const content = `original:${entry.path}`;
      fs.writeFileSync(target, content);
      original.set(entry.path, content);
    }
    fs.writeFileSync(target, `released:${entry.path}`);
  }
  for (const entry of manifest.rollback.restoreExistingFromExactBackup) {
    fs.writeFileSync(path.join(root, entry), original.get(entry));
  }
  for (const entry of manifest.rollback.deleteFilesAbsentBeforeRelease) {
    fs.rmSync(path.join(root, entry));
  }
  for (const [entry, content] of original) assert.equal(fs.readFileSync(path.join(root, entry), 'utf8'), content);
  for (const entry of manifest.rollback.deleteFilesAbsentBeforeRelease) assert.equal(fs.existsSync(path.join(root, entry)), false);
  assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
  assert.match(path.basename(root), /^rhino-k1d04-rollback-/);
  fs.rmSync(root, { recursive: true, force: true });

  const enforcement = require('../docs/qa/evidence/epic-k/k1d04p-release-readiness-2026-11-05/shipping-enforcement-audit.json');
  const readiness = require('../data/epic-k-k1d04p-release-readiness.json');
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const now = Date.parse(enforcement.capturedAt) + 60 * 1000;
  assert.equal(validateEnforcementGate(enforcement, readiness, manifest, now).length, 0);
  const wrongStore = clone(enforcement);
  wrongStore.store.canonicalDomain = 'wrong-store.myshopify.com';
  assert.match(validateEnforcementGate(wrongStore, readiness, manifest, now).join('\n'), /wrong or unverified/);
  const stale = clone(enforcement);
  stale.capturedAt = new Date(now - 25 * 60 * 60 * 1000).toISOString();
  assert.match(validateEnforcementGate(stale, readiness, manifest, now).join('\n'), /stale/);
  const unidentified = clone(enforcement);
  unidentified.configurationModel.status = 'BLOCKED_ACCESS';
  assert.match(validateEnforcementGate(unidentified, readiness, manifest, now).join('\n'), /not identified/);
  const falseReadyState = clone(readiness);
  falseReadyState.state = 'READY_FOR_PRODUCTION';
  const unresolvedEnforcement = clone(enforcement);
  unresolvedEnforcement.authoritativeConfigurationInventory.profiles.status = 'BLOCKED_ACCESS';
  assert.match(validateEnforcementGate(unresolvedEnforcement, falseReadyState, manifest, now).join('\n'), /explicitly blocked/);
  const falseReadyClaim = clone(enforcement);
  falseReadyClaim.authoritativeConfigurationInventory.rates.status = 'BLOCKED_ACCESS';
  falseReadyClaim.releaseDisposition.productionReady = true;
  assert.match(validateEnforcementGate(falseReadyClaim, readiness, manifest, now).join('\n'), /unsupported/);
  const bypass = clone(enforcement);
  bypass.storefrontEvidence.payableShippingBypassConclusion = 'PAYABLE_BYPASS_VERIFIED';
  assert.match(validateEnforcementGate(bypass, readiness, manifest, now).join('\n'), /FAIL_POLICY/);
  const unpublished = clone(enforcement);
  unpublished.gitPublication.remoteSha = '0000000000000000000000000000000000000000';
  assert.match(validateEnforcementGate(unpublished, readiness, manifest, now).join('\n'), /not proven published/);

  const pickupPayment = clone(enforcement);
  pickupPayment.storefrontEvidence.completedRepresentativeMatrix.domesticDirectCheckoutContext = 'GRAFTON_PICKUP_ONLY';
  pickupPayment.storefrontEvidence.payableShippingBypassConclusion = 'NO_BYPASS_VERIFIED';
  assert.equal(validateEnforcementGate(pickupPayment, readiness, manifest, now).length, 0);

  console.log('Epic K1D-04 release, rollback, and evidence-gate tests: 13/13 passed.');
}

run();
