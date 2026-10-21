'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Liquid } = require('liquidjs');
const fixtures = require('../../tests/fixtures/epic-f-machine-shell.json');
const identity = require('../../data/epic-e-product-identity.json');
const release = require('../../data/epic-f-consumer-release.json');
const read = f => fs.readFileSync(f, 'utf8');
const json = f => JSON.parse(read(f));
const machine = identity.productIdentities.find(p => release.routes.some(r => r.productGid === p.productGid && r.productClass === 'machine'));
const variantIdentity = identity.variantIdentities.find(v => v.productGid === machine.productGid);
const escape = s => String(s).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
// Only unavailable Shopify platform APIs are emulated. Repository Liquid,
// snippets, forms' attributes, native CSS and native browser scripts execute.
function normalize(source) {
  return source.replace(/\{%[-]?\s*schema\s*[-]?%\}[\s\S]*?\{%[-]?\s*endschema\s*[-]?%\}/g, '')
    .replace(/\{%[-]?\s*style\s*[-]?%\}/g, '<style>').replace(/\{%[-]?\s*endstyle\s*[-]?%\}/g, '</style>')
    .replace(/\{%[-]?\s*form\b([\s\S]*?)%\}/g, (_, args) => {
      const id = args.match(/\bid:\s*([\w]+)/)?.[1];
      const cls = args.match(/\bclass:\s*'([^']+)'/)?.[1] || '';
      return `<form method="post" action="/cart/add" id="{{ ${id} }}" class="${cls}" ${args.includes('novalidate:') ? 'novalidate' : ''}>`;
    }).replace(/\{%[-]?\s*endform\s*[-]?%\}/g, '</form>');
}
function engine(context, translations = {}, overrides = {}) {
  const e = new Liquid({ root: path.resolve('snippets'), extname: '.liquid', globals: context, jsTruthy: false });
  e.options.fs = { ...e.options.fs, readFileSync: p => normalize(overrides[path.basename(p)] ?? read(p)) };
  const locale = json('locales/en.default.json');
  e.registerFilter('t', (key, ...args) => {
    let value = translations[key] || key.split('.').reduce((v, k) => v?.[k], locale) || key;
    for (const arg of args) if (Array.isArray(arg)) value = value.replaceAll(new RegExp(`{{\\s*${arg[0]}\\s*}}`, 'g'), String(arg[1]));
    return value;
  });
  e.registerFilter('asset_url', v => '/assets/' + v);
  e.registerFilter('stylesheet_tag', v => `<link rel="stylesheet" href="${escape(v)}">`);
  e.registerFilter('inline_asset_content', v => read('assets/' + v));
  e.registerFilter('json', v => JSON.stringify(v ?? null));
  e.registerFilter('money', v => '$' + (Number(v) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 }));
  e.registerFilter('money_with_currency', v => '$' + (Number(v) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 }) + ' USD');
  e.registerFilter('money_amount', v => Number(v) / 100);
  e.registerFilter('item_count_for_variant', () => 0);
  e.registerFilter('standard_event_data', () => '{}');
  e.registerFilter('payment_terms', () => ''); // Provider output deliberately not fabricated.
  e.registerFilter('font_face', () => '');
  e.registerFilter('structured_data', p => JSON.stringify({ '@type': 'Product', name: p.title, description: p.description }));
  return e;
}
function contextFor(stateId, { selected = 0, long = false, template = 'machine', productId } = {}) {
  const state = fixtures.states.find(s => s.id === stateId);
  if (!state) throw new Error('Unknown fixture');
  const id = variantIdentity.variantGid.split('/').pop();
  const variants = [id, '999000000002'].map((id, i) => ({ id, available: state.available, price: long ? 123456789012 : 250000 + i * 100,
    inventory_management: state.management, inventory_quantity: state.stock, inventory_policy: state.policy,
    quantity_rule: { min: 1, max: 5, increment: 1 }, store_availabilities: [], featured_media: { id: 77 }, title: `Option ${i + 1}` }));
  const chosen = state.variantMissing ? null : variants[selected];
  const values = variants.map((v, i) => ({ id: String(100 + i), selected: i === selected, available: v.available,
    product_url: '/products/' + machine.handle, toString: () => long ? `Long fixture option ${i + 1} ` + 'Label'.repeat(25) : v.title }));
  const product = { id: productId || machine.productGid.split('/').pop(), title: long ? 'Long fixture machine ' + 'Title'.repeat(35) : 'Fixture machine',
    handle: machine.handle, url: '/products/' + machine.handle, available: true, price: 1,
    selected_or_first_available_variant: chosen, selected_variant: chosen, variants,
    has_only_default_variant: false, options_with_values: [{ name: 'Fixture option', position: 1, values }],
    description: 'UNAPPROVED_DESCRIPTION', media: template ? [{ id: 77, media_type: 'image', src: 'UNAPPROVED_MEDIA' }] : [], images: [],
    metafields: { rhino: { input_voltage: { value: 'UNAPPROVED_FACT' } } } };
  const source = json(`templates/product${template ? '.' + template : ''}.json`).sections.main;
  const settings = json('config/settings_data.json').current;
  return { state, product, template: { suffix: template }, form: {},
    section: { id: 'machine', settings: source.settings, blocks: source.block_order.map(id => ({ id, ...source.blocks[id] })) },
    settings, cart: { items: [], currency: { iso_code: 'USD' } }, shop: { name: 'Rhino Lapidary', shipping_policy: { body: '' } },
    request: { page_type: 'product', origin: 'http://machine.local' }, routes: { root_url: '/', cart_add_url: '/cart/add.js' } };
}
function renderSection(stateId, options = {}) {
  const ctx = contextFor(stateId, options);
  return engine(ctx, options.translations).parseAndRenderSync(normalize(read('sections/main-product.liquid')), ctx);
}
function themeStyle(ctx) {
  // Use the actual layout's style block with Shopify color/font drops adapted locally.
  const color = hex => { const s = String(hex || '#ffffff'); const n = parseInt(s.slice(1), 16); return { red: n >> 16 & 255, green: n >> 8 & 255, blue: n & 255, toString: () => s }; };
  ctx.settings = { ...ctx.settings, type_body_font: { family: 'Arial', fallback_families: 'sans-serif', weight: 400, style: 'normal' },
    type_header_font: { family: 'Arial', fallback_families: 'sans-serif', weight: 700, style: 'normal' },
    color_schemes: Object.entries(ctx.settings.color_schemes).map(([id, s]) => ({ id, settings: Object.fromEntries(Object.entries(s.settings).map(([k, v]) => [k, /^#[a-f0-9]{6}$/i.test(v) ? color(v) : v])) })) };
  return engine(ctx).parseAndRenderSync(normalize(read('layout/theme.liquid').match(/{% style %}[\s\S]*?{% endstyle %}/)[0]), ctx);
}
function documentFor(stateId, options = {}) {
  const ctx = contextFor(stateId, options);
  const body = ctx.state.routeStatus ? '<h1>Page not found</h1>' : renderSection(stateId, options);
  const scripts = ['constants.js', 'pubsub.js', 'global.js', 'details-disclosure.js'];
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Machine shell fixture</title>
    ${themeStyle(ctx)}<link rel="stylesheet" href="/assets/base.css"><link rel="stylesheet" href="/assets/rhino-custom.css">
    <script>window.routes={cart_add_url:'/cart/add.js',cart_url:'/cart'};window.variantStrings={addToCart:'Add to cart',soldOut:'Sold out',unavailable:'Unavailable'};window.shopUrl='http://machine.local';</script>
    ${scripts.map(s => `<script src="/assets/${s}" defer></script>`).join('')}</head><body><main id="MainContent">${body}</main></body></html>`;
}
async function mount(page, stateId, options = {}) {
  const requests = [], errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', async route => {
    const u = new URL(route.request().url());
    if (u.hostname !== 'machine.local') return route.abort();
    if (/^\/assets\/[\w.-]+$/.test(u.pathname) && fs.existsSync('.' + u.pathname)) return route.fulfill({ body: read('.' + u.pathname), contentType: u.pathname.endsWith('.js') ? 'text/javascript' : 'text/css' });
    if (u.pathname === '/cart/add.js') {
      requests.push(route.request().postData());
      return route.fulfill({ status: options.cartError ? 422 : 200, json: options.cartError ? { status: 422, description: 'Fixture quantity rejected' } : { id: 1, quantity: 2 } });
    }
    if (u.pathname === '/cart') return route.fulfill({ body: '<!doctype html><title>Fixture cart</title><main>Fixture cart</main>', contentType: 'text/html' });
    if (u.pathname === '/pages/contact') return route.fulfill({ body: '<!doctype html><title>Contact route fixture</title><main><h1>Contact</h1></main>', contentType: 'text/html' });
    if (u.searchParams.get('section_id') === 'pickup-availability') return route.fulfill({ body: '<div class="shopify-section"></div>', contentType: 'text/html' });
    if (u.searchParams.has('section_id')) {
      const value = u.searchParams.get('option_values');
      return route.fulfill({ body: renderSection(value === '102' ? 'invalid-variant' : value === '103' ? 'zero-deny' : stateId, { ...options, selected: value === '101' ? 1 : 0 }), contentType: 'text/html' });
    }
    if (u.pathname === contextFor(stateId).product.url) return route.fulfill({ status: contextFor(stateId).state.routeStatus || 200, body: documentFor(stateId, options), contentType: 'text/html' });
    return route.abort();
  });
  await page.goto('http://machine.local' + contextFor(stateId).product.url);
  return { requests, errors };
}
module.exports = { fixtures, machine, variantIdentity, contextFor, renderSection, documentFor, mount, engine, normalize, themeStyle };
