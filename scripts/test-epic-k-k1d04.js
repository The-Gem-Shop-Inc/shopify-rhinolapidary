'use strict';

const assert = require('node:assert/strict');
const {
  mergeCartDrawer,
  mergeEnglishLocale,
  mergeSettingsData,
  mergeSettingsSchema,
} = require('./prepare-epic-k-k1d04-release');

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

  console.log('Epic K1D-04 release merge tests: 4/4 passed.');
}

run();
