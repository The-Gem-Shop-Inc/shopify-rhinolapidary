'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { fixtures, renderSection } = require('./lib/epic-f-machine-fixtures');
const nativeBaseline = require('../tests/fixtures/epic-f-native-baseline.json');
const read = f => fs.readFileSync(f, 'utf8');
const hash = s => crypto.createHash('sha256').update(s.replaceAll('\r\n', '\n')).digest('hex');
function validateArchitecture(overrides = {}) {
  const get = f => overrides[f] ?? read(f);
  const errors = [];
  for (const [file, sha] of Object.entries(nativeBaseline)) if (hash(get(file)) !== sha) errors.push(`Native baseline changed: ${file}`);
  const template = JSON.parse(get('templates/product.machine.json'));
  const main = template.sections.main;
  const expectedMain = JSON.parse(get('templates/product.json')).sections.main;
  const ids = ['title', 'price', 'variant-picker', 'quantity-selector', 'buy-buttons'];
  expectedMain.blocks = Object.fromEntries(ids.map(id => [id, expectedMain.blocks[id]]));
  expectedMain.blocks.contact = { type: 'machine_contact', settings: {} };
  expectedMain.block_order = [...ids, 'contact'];
  expectedMain.settings.enable_sticky_info = false;
  try { assert.deepEqual(template, { sections: { main: expectedMain }, order: ['main'] }); }
  catch { errors.push('Machine template must contain only the approved native presentation settings'); }
  if (JSON.stringify(template.order) !== '["main"]' || Object.keys(template.sections).length !== 1 || main.type !== 'main-product') errors.push('One shared main-product required');
  const types = main.block_order.map(k => main.blocks[k]?.type);
  if (JSON.stringify(types) !== JSON.stringify(['title', 'price', 'variant_picker', 'quantity_selector', 'buy_buttons', 'machine_contact']) || Object.keys(main.blocks).length !== 6) errors.push('Machine hierarchy/allowlist violated');
  if (main.settings.enable_sticky_info || main.blocks['buy-buttons'].settings.show_dynamic_checkout) errors.push('Unexpected sticky/dynamic controller');
  if (/gid:\/\/|\/products\/|metafields|custom_liquid|description|media_url/i.test(get('templates/product.machine.json'))) errors.push('Template is not a fact store');
  if (fs.readdirSync('templates').filter(f => /^product\.machine.*\.json$/.test(f)).length !== 1) errors.push('Multiple machine templates');
  const source = get('sections/main-product.liquid');
  if (!source.includes("{{ form | payment_terms }}") || !source.includes("render 'buy-buttons'") || !source.includes('show_pickup_availability: true')) errors.push('Native purchase boundary changed');
  if (!source.includes("if template.suffix == 'machine'")) errors.push('Machine presentation must be scoped');
  const contact = source.split("when 'machine_contact'")[1]?.split("when 'inventory'")[0] || '';
  if (!contact.includes('href="/pages/contact"') || !contact.includes("'products.product.machine_contact' | t") || /\?|context|input|form|settings\./.test(contact)) errors.push('Contact must remain neutral and context-free');
  if (JSON.parse(get('locales/en.default.json')).products.product.machine_contact !== 'Contact') errors.push('Neutral Contact label required');
  return errors;
}
function validateFixtures(input) {
  assert.equal(input.fixtureOnly, true);
  assert.deepEqual(input.widths, [320, 360, 390, 768, 1024, 1440, 1920]);
  assert.deepEqual(input.states.map(s => s.id), ['tracked-available', 'tracked-unavailable', 'zero-deny', 'untracked-available', 'invalid-variant', 'quantity-rule-soldout', 'draft', 'unpublished']);
  assert(input.states.filter(s => s.routeStatus).every(s => s.routeStatus === 404));
  assert.equal(input.states.find(s => s.id === 'zero-deny').available, false);
  assert.equal(input.states.find(s => s.id === 'untracked-available').management, null);
}
function run() {
  assert.deepEqual(validateArchitecture(), []);
  validateFixtures(fixtures);
  const defaultTemplate = JSON.parse(read('templates/product.json'));
  delete defaultTemplate.sections.main.blocks['buy-buttons'];
  assert(validateArchitecture({ 'templates/product.json': JSON.stringify(defaultTemplate) }).some(e => e.includes('Native baseline')));
  const machine = JSON.parse(read('templates/product.machine.json'));
  machine.sections.main.blocks.title.type = 'custom_liquid';
  assert(validateArchitecture({ 'templates/product.machine.json': JSON.stringify(machine) }).length > 0);
  assert(validateArchitecture({ 'assets/product-form.js': read('assets/product-form.js') + '\n// changed purchasing\n' }).length > 0);
  assert.throws(() => validateFixtures({ ...fixtures, widths: [390] }));
  for (const state of fixtures.states.filter(s => !s.routeStatus)) {
    const html = renderSection(state.id);
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    assert(!/UNAPPROVED_DESCRIPTION|UNAPPROVED_MEDIA|UNAPPROVED_FACT/.test(html));
    assert(!/<media-gallery|product__media-wrapper|product__description/.test(html));
  }
  const nonMachine = renderSection('tracked-available', { template: '', productId: '8905779413189' });
  assert(nonMachine.includes('UNAPPROVED_DESCRIPTION'), 'Non-machine description path remains functional');
  assert(!nonMachine.includes('rhino-machine-contact'));
  console.log('Machine architecture, fixture and negative regression checks passed; native/default/Contact baseline unchanged.');
}
if (require.main === module) run();
module.exports = { validateArchitecture, validateFixtures };
