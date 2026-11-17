'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { readSources, validateSources, cartAcceptanceFor } = require('./lib/j2-g4-phase-c-remediation');
const machineFixtures = require('./lib/epic-f-machine-fixtures');

const baseline = readSources();
const tests = [];
function test(name, run) { tests.push({ name, run }); }
function mutated(key, transform) { return { ...baseline, [key]: transform(baseline[key]) }; }
function rejects(key, transform, pattern) {
  const errors = validateSources(mutated(key, transform));
  assert.match(errors.join('\n'), pattern);
}

function renderCard({ id, handle, title, media, available = true, ownerContext = false }) {
  const context = machineFixtures.contextFor('tracked-available');
  const product = {
    ...context.product,
    id, handle, title, url: `/products/${handle}`, available, published_at: '2026-07-02T16:54:05Z',
    featured_media: media || null, media: media ? [media] : [], images: media ? [media] : [],
    compare_at_price: 0, variants_count: 1, quantity_price_breaks_configured: false,
  };
  Object.assign(context, {
    card_product: product,
    template: { name: 'collection', suffix: null },
    request: { ...context.request, host: 'phase-c.local', page_type: 'collection' },
    section: { id: 'phase-c-card', settings: { color_scheme: 'scheme-1' } },
    section_id: 'phase-c-card', media_aspect_ratio: 'adapt', image_shape: 'default', show_vendor: false,
    show_rating: false, show_secondary_image: true, lazy_load: true, skip_styles: true, quick_add: 'none',
    extend_height: true, horizontal_class: false, rhino_owner_customer_context: ownerContext,
  });
  const liquid = machineFixtures.engine(context);
  liquid.registerFilter('image_url', (value, options) => `/cdn/${value.id}.jpg?width=${options?.width || value.width}`);
  return liquid.parseAndRenderSync(machineFixtures.normalize(fs.readFileSync('snippets/card-product.liquid', 'utf8')), context);
}

function image(id, source, alt, width = 1440, height = 1440) {
  const preview = { src: source, alt, width, height, aspect_ratio: width / height };
  return { id, media_type: 'image', mediaContentType: 'IMAGE', alt, width, height, aspect_ratio: width / height, preview_image: preview, src: source };
}

test('Phase C repository source contract passes', () => assert.deepEqual(validateSources(baseline), []));
test('approved machine media retains the exact authority gate', () => {
  assert.match(baseline.card, /rhino_card_media_eligibility == 'eligible'/);
  assert.match(baseline.mediaAuthority, /8905779937477[\s\S]*33451099455685/);
});
test('BeadMaster is eligible on both collection card routes without route-specific bypasses', () => {
  assert.match(baseline.mediaAuthority, /Rhino Lapidary BeadMaster machine, front view/);
  assert.doesNotMatch(baseline.card, /collection\.handle|template\.suffix/);
});
test('BeadMaster collection card renders the exact approved responsive image', () => {
  const html = renderCard({
    id: '8905779937477', handle: 'beadmaster', title: 'BeadMaster 6"',
    media: image('33451099455685', 'https://cdn.shopify.com/s/files/1/0792/7994/7973/files/s886176631913542175_p78_i10_w1440.jpg?v=1783011248', 'Rhino Lapidary BeadMaster machine, front view'),
  });
  assert.match(html, /<img[\s\S]*Rhino Lapidary BeadMaster machine, front view/);
  assert.match(html, /165w[\s\S]*1066w/);
  assert.match(html, /loading="lazy"/);
  assert.doesNotMatch(html, /rhino-card-media-fallback/);
});
test('machine without an eligible image renders the neutral fallback instead of a blank region', () => {
  const html = renderCard({
    id: '8905784197317', handle: 'sawmaster-24', title: 'SawMaster 24"',
    media: image('33451117871301', 'https://cdn.shopify.com/s/files/1/0792/7994/7973/files/unapproved-sawmaster-24.jpg', ''),
  });
  assert.match(html, /rhino-card-media-fallback/);
  assert.match(html, /role="img" aria-label="SawMaster 24(?:&#34;|&quot;)"/);
  assert.doesNotMatch(html, /<img/);
});
test('machine with no featured media renders the neutral fallback', () => {
  const html = renderCard({ id: '8905780756677', handle: 'em-1', title: 'EM-1 Machine', media: null });
  assert.match(html, /rhino-card-media-fallback/);
  assert.match(html, /--ratio-percent: 100%/);
});
test('legacy accessory retains ordinary featured media', () => {
  const html = renderCard({
    id: '8905778888901', handle: 'screw-on-flat-lap', title: 'Screw-on Flat Lap',
    media: image('fixture-accessory-media', '/cdn/shop/files/accessory.jpg', ''),
  });
  assert.match(html, /<img/);
  assert.match(html, /alt="Screw-on Flat Lap"/);
  assert.doesNotMatch(html, /rhino-card-media-fallback/);
});
test('missing or unavailable machine media produces a neutral visible fallback', () => {
  assert.match(baseline.card, /elsif rhino_consumer_route == 'machine'[\s\S]*else[\s\S]*rhino_card_media_fallback = true/);
  assert.match(baseline.cardCss, /rhino-card-media-fallback[\s\S]*display:\s*flex/);
});
test('legacy accessories retain featured and secondary media behavior', () => {
  assert.match(baseline.card, /if rhino_legacy_content[\s\S]*assign rhino_card_media = card_product\.featured_media/);
  assert.match(baseline.card, /if rhino_legacy_content and card_product\.media\[1\]/);
});
test('blank media alt falls back to the exact Product title', () => assert.match(baseline.card, /alt="{{ rhino_card_media\.alt \| default: card_product\.title \| escape }}"/));
test('removing machine media authorization is rejected', () => rejects('card', (s) => s.replace("rhino_card_media_eligibility == 'eligible'", 'true'), /Only eligible machine/));
test('removing the neutral fallback is rejected', () => rejects('card', (s) => s.replace('rhino_card_media_fallback = true', 'rhino_card_media_fallback = false'), /neutral fallback/));
test('blank fallback accessibility is rejected', () => rejects('card', (s) => s.replace('role="img" aria-label="{{ card_product.title | escape }}"', 'aria-hidden="true"'), /accessible image name/));
test('unapproved machine secondary media is rejected', () => rejects('card', (s) => s.replace('rhino_legacy_content and card_product.media[1]', 'card_product.media[1]'), /secondary image/));
test('invented compatibility claims are rejected', () => rejects('card', (s) => `${s}\n<!-- Compatible with every machine -->`, /compatibility or fit/));

test('native fulfillment radios have no disclosure-only ARIA', () => {
  assert.doesNotMatch(baseline.quote, /aria-controls/);
  assert.doesNotMatch(baseline.quoteJs, /aria-expanded/);
});
test('adding aria-controls to a radio is rejected', () => rejects('quote', (s) => s.replace('value="shipping"', 'value="shipping" aria-controls="RhinoShippingQuotePanel"'), /cannot use aria-controls/));
test('adding aria-expanded in JavaScript is rejected', () => rejects('quoteJs', (s) => `${s}\nchoice.setAttribute('aria-expanded', 'true');`, /cannot receive aria-expanded/));
test('breaking the panel data relationship is rejected', () => rejects('quote', (s) => s.replace('data-rhino-fulfillment-panel="pickup"', 'data-broken-panel="pickup"'), /panels must each/));

test('facets reject fixed non-shrinking grid tracks', () => rejects('facetsCss', (s) => s.replace('grid-template-columns: minmax(0, 1fr) minmax(0, max-content) minmax(0, max-content)', 'grid-template-columns: 1fr max-content max-content'), /shrink-safe/));
test('drawer rejects viewport-unbounded rem width', () => rejects('menuDrawerCss', (s) => s.replace('width: min(40rem, 100vw)', 'width: 40rem'), /constrained to the viewport/));
test('global overflow clipping is rejected', () => rejects('facetsCss', (s) => `${s}\nhtml, body { overflow-x: hidden; }`, /cannot hide global/));

test('notification configuration requires notification and cart-page acceptance only', () => assert.deepEqual(cartAcceptanceFor('notification'), {
  cartType: 'notification', notificationRequired: true, drawerRequired: false, cartPageRequired: true,
}));
test('drawer configuration requires drawer and cart-page acceptance', () => assert.deepEqual(cartAcceptanceFor('drawer'), {
  cartType: 'drawer', notificationRequired: false, drawerRequired: true, cartPageRequired: true,
}));
test('unsupported cart configuration is fail-closed', () => assert.throws(() => cartAcceptanceFor('modal'), /Unsupported cart_type/));
test('switching the corrective candidate to drawer is rejected', () => rejects('settings', (s) => s.replace('"cart_type": "notification"', '"cart_type": "drawer"'), /retain notification/));

let passed = 0;
for (const entry of tests) {
  try { entry.run(); passed += 1; }
  catch (error) { console.error(`FAIL: ${entry.name}`); throw error; }
}
console.log(`J2/G4 Phase C deterministic source regressions passed: ${passed}/${tests.length}.`);
