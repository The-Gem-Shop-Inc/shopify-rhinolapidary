'use strict';
// Platform HTTP responses only; all Product/cart markup and behavior use repository Trade sources.
const fs = require('node:fs');
const F = require('./epic-f-machine-fixtures');
const J = require('./epic-j-cart-fixtures');
const fixture = require('../../tests/fixtures/epic-j-cart.json');
const read = require('../../' + require('../../data/epic-j-j0-contract.json').adminRead);
const variants = read.snapshot.datasets.variants.records.filter(v => v.product.id === fixture.items[0].productGid);
const genericError = require('../../locales/en.default.json').sections.cart.cart_error;
function productDocument(selected = 0) {
  const ctx = F.contextFor('tracked-available', { template: '' });
  const pv = variants.map(v => ({ ...ctx.product.variants[0], id: v.id.split('/').pop(), title: v.title, price: Number(v.price) * 100 }));
  ctx.product = { ...ctx.product, id: fixture.items[0].productGid.split('/').pop(), title: 'Saw Blade', handle: 'saw-blade', url: '/products/saw-blade', variants: pv, selected_variant: pv[selected], selected_or_first_available_variant: pv[selected], price: pv[selected].price,
    options_with_values: [{ name: 'Size', position: 1, values: pv.map((v, i) => ({ id: String(100 + i), selected: i === selected, available: true, product_url: '/products/saw-blade', toString: () => v.title })) }] };
  ctx.routes.cart_url = '/cart';
  let doc = F.documentFor('tracked-available', { template: '' });
  const body = F.engine(ctx).parseAndRenderSync(F.normalize(fs.readFileSync('sections/main-product.liquid', 'utf8')), ctx);
  doc = doc.replace(/<main id="MainContent">[\s\S]*<\/main>/, '<main id="MainContent">' + body + '</main>');
  const notification = J.render('snippets/cart-notification.liquid', ctx);
  return doc.replace('</head>', '<link rel="stylesheet" href="/assets/component-cart-notification.css"><script>window.cartStrings={error:' + JSON.stringify(genericError) + '};</script><script src="/assets/cart-notification.js" defer></script></head>')
    .replace('</body>', '<a id="cart-icon-bubble" href="/cart">Cart</a>' + notification + '</body>');
}
function sections(state, key) {
  const count = state.reduce((n, v) => n + v.quantity, 0);
  return { 'cart-notification-product': '<div class="shopify-section"><div id="cart-notification-product-' + key + '">Saw Blade added</div></div>',
    'cart-notification-button': '<div class="shopify-section">View cart (' + count + ')</div>',
    'cart-icon-bubble': '<div class="shopify-section">Cart (' + count + ')</div>' };
}
function cartSections(items) {
  const ctx = J.context({ items, nativeRules: true });
  ctx.section = { id: 'main-cart-items', settings: { color_scheme: 'scheme-2' } };
  const main = J.render('sections/main-cart-items.liquid', ctx);
  ctx.section = { id: 'main-cart-footer', settings: { color_scheme: 'scheme-2' }, blocks: [{ type: 'subtotal', settings: {} }, { type: 'buttons', settings: {} }] };
  return { 'main-cart-items': main, 'main-cart-footer': J.render('sections/main-cart-footer.liquid', ctx),
    'cart-icon-bubble': '<div class="shopify-section">Cart</div>', 'cart-live-region-text': '<div class="shopify-section">Cart updated</div>' };
}
async function mount(page, { mode = 'success', initial = [] } = {}) {
  const state = { items: structuredClone(initial), mode, posts: [], errors: [], reads: [], rendered: 0 };
  page.on('pageerror', e => state.errors.push(e.message));
  const cart = () => ({ ...J.context({ items: state.items }).cart, currency: 'USD' });
  await page.route('**/*', async route => {
    const req = route.request(), url = new URL(req.url());
    if (url.hostname !== 'machine.local') return route.abort();
    if (url.pathname.startsWith('/assets/') && fs.existsSync('.' + url.pathname)) return route.fulfill({ body: fs.readFileSync('.' + url.pathname), contentType: url.pathname.endsWith('.js') ? 'application/javascript' : 'text/css' });
    if (url.pathname === '/cart/add.js') {
      state.posts.push(req.postData());
      if (state.mode === 'transport') return route.abort('failed');
      if (state.mode === '422') return route.fulfill({ status: 422, json: { status: 422, description: 'Fixture quantity rejected', message: 'Cart Error' } });
      const body = req.postData();
      const id = body.match(/name="id"\r\n\r\n([^\r]+)/)?.[1];
      const quantity = Number(body.match(/name="quantity"\r\n\r\n([^\r]+)/)?.[1] || 1);
      const source = fixture.items.find(v => v.variantId === id);
      if (!source) throw new Error('Unapproved fixture Variant ' + id);
      const line = state.items.find(v => v.variantId === id);
      if (line) line.quantity += quantity; else state.items.push({ ...source, quantity });
      const key = 'fixture-' + id;
      if (state.mode === 'invalid-json') return route.fulfill({ body: '{broken', contentType: 'application/json' });
      const result = { id: Number(id), key, quantity, sections: sections(state.items, key) };
      if (state.mode === 'missing-section') delete result.sections['cart-icon-bubble'];
      if (state.mode === 'null-section') result.sections['cart-icon-bubble'] = null;
      if (state.mode === 'malformed-section') result.sections['cart-icon-bubble'] = '<p>Missing native section root</p>';
      if (state.mode === 'wrong-line') result.sections['cart-notification-product'] = '<div id="cart-notification-product-other">Wrong line</div>';
      if (state.mode === 'missing-key') delete result.key;
      await new Promise(resolve => setTimeout(resolve, 100));
      return route.fulfill({ json: result });
    }
    if (['/cart.js', '/cart.json'].includes(url.pathname)) { state.reads.push(url.pathname); return route.fulfill({ json: cart() }); }
    if (url.pathname === '/cart/change.js') {
      state.posts.push(req.postData());
      if (state.mode === '422') return route.fulfill({ status: 422, json: { errors: 'Fixture inventory quantity unavailable' } });
      const { line, quantity } = JSON.parse(req.postData());
      if (quantity === 0) state.items.splice(line - 1, 1); else state.items[line - 1].quantity = quantity;
      return route.fulfill({ json: { ...cart(), sections: cartSections(state.items) } });
    }
    if (url.pathname === '/cart') return route.fulfill({ contentType: 'text/html', body: J.documentFor({ items: state.items, nativeRules: true }) });
    if (url.searchParams.get('section_id') === 'pickup-availability') return route.fulfill({ contentType: 'text/html', body: '<div class="shopify-section"></div>' });
    if (url.searchParams.has('section_id')) {
      const option = url.searchParams.has('option_values') ? Number(url.searchParams.get('option_values')) - 100
        : Math.max(0, variants.findIndex(v => v.id.endsWith('/' + url.searchParams.get('variant'))));
      const document = productDocument(option);
      return route.fulfill({ contentType: 'text/html', body: document });
    }
    if (url.pathname === '/products/saw-blade') return route.fulfill({ contentType: 'text/html', body: productDocument() });
    return route.abort();
  });
  await page.goto('http://machine.local/products/saw-blade');
  return state;
}
module.exports = { mount, productDocument, genericError, fixture };
