'use strict';

const fs = require('node:fs');

const PRODUCTS = [
  { variantId: 101, productId: 1001, title: 'Diamond Blade' },
  { variantId: 202, productId: 2002, title: 'Saw Vice' },
  { variantId: 303, productId: 1001, title: 'Diamond Blade' },
];

function cartFrom(state) {
  const items = PRODUCTS.flatMap((product) => {
    const quantity = state.quantities.get(product.variantId) || 0;
    return quantity
      ? [
          {
            id: product.variantId,
            variant_id: product.variantId,
            product_id: product.productId,
            key: `fixture-${product.variantId}`,
            quantity,
            product_title: product.title,
          },
        ]
      : [];
  });
  return {
    token: 'epic-j-j2-fixture',
    currency: 'USD',
    items,
    item_count: items.reduce((total, item) => total + item.quantity, 0),
  };
}

function cartIconSection(cart) {
  return `<div id="shopify-section-cart-icon-bubble" class="shopify-section">
    <span class="svg-wrapper">Cart</span><span class="visually-hidden">Cart</span>
    ${
      cart.item_count
        ? `<div class="cart-count-bubble"><span aria-hidden="true">${cart.item_count}</span><span class="visually-hidden">${cart.item_count} items</span></div>`
        : ''
    }
  </div>`;
}

function cartDrawerSection(cart) {
  return `<div id="shopify-section-cart-drawer" class="shopify-section"><div class="drawer__inner" data-drawer-count="${cart.item_count}">Drawer quantity ${cart.item_count}</div></div>`;
}

function sectionsFor(cart, mode = 'success') {
  const sections = {
    'cart-icon-bubble': cartIconSection(cart),
    'cart-drawer': cartDrawerSection(cart),
  };
  if (mode === 'missing-sections') delete sections['cart-icon-bubble'];
  if (mode === 'malformed-sections') {
    sections['cart-icon-bubble'] = '<p>Missing section wrapper</p>';
    sections['cart-drawer'] = null;
  }
  return sections;
}

function quantityControl(product, quantity) {
  return `<quick-add-bulk
    id="quick-add-bulk-${product.variantId}-main"
    data-index="${product.variantId}"
    data-product-title="${product.title}"
  >
    <quantity-input class="quantity cart-quantity">
      <button class="quantity__button" name="minus" type="button">−</button>
      <input
        class="quantity__input"
        data-quantity-variant-id="${product.variantId}"
        data-cart-quantity="${quantity}"
        data-index="${product.variantId}"
        id="Quantity-${product.variantId}"
        type="number"
        value="${quantity}"
        min="0"
        data-min="1"
        max="20"
        step="1"
        aria-label="Quantity for ${product.title}"
      >
      <button class="quantity__button" name="plus" type="button">+</button>
      <div class="progress-bar-container hidden" aria-hidden="true"></div>
    </quantity-input>
  </quick-add-bulk>`;
}

function toastMarkup() {
  return `<cart-feedback-toast
    data-pending="Updating cart — [product]"
    data-added="Added to cart — [product]"
    data-updated="Quantity updated — [product]: [quantity]"
    data-removed="Removed from cart — [product]"
    data-rejected="Cart update rejected — [product]: [error]"
    data-uncertain="Cart update status uncertain — [product]. Check your cart before trying again."
    data-cart-count-one="1 item"
    data-cart-count-other="[count] items"
    hidden
  >
    <div class="cart-feedback-toast__surface" data-cart-feedback-surface>
      <p class="cart-feedback-toast__message" data-cart-feedback-message></p>
      <span class="visually-hidden" role="status" aria-live="polite" aria-atomic="true" data-cart-feedback-live></span>
      <button type="button" class="cart-feedback-toast__dismiss" aria-label="Dismiss cart update message" data-cart-feedback-dismiss>×</button>
      <span class="cart-feedback-toast__progress" aria-hidden="true"></span>
    </div>
  </cart-feedback-toast>`;
}

function documentFor(state, { drawer = true } = {}) {
  const cart = cartFrom(state);
  return `<!doctype html>
  <html lang="en"><head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Epic J2 collection cart fixture</title>
    <style>
      :root { --color-foreground: 18,18,18; --color-background: 255,255,255; --color-button: 20,80,60; --text-boxes-radius: .4rem; font-size: 10px; }
      body { margin: 0; font: 1.6rem/1.5 Arial,sans-serif; }
      .visually-hidden { position:absolute!important; width:1px!important; height:1px!important; padding:0!important; margin:-1px!important; overflow:hidden!important; clip:rect(0,0,0,0)!important; white-space:nowrap!important; border:0!important; }
      .hidden { display:none!important; }
      header, main { padding: 1.6rem; }
      #cart-icon-bubble { display: inline-flex; gap: .6rem; min-height: 4.4rem; align-items: center; }
      .collection-quick-add-bulk { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1.6rem; padding:0; list-style:none; }
      quick-add-bulk { min-width:0; padding:1rem; border:.1rem solid #ccc; }
      quantity-input { display:flex; max-width:18rem; }
      .quantity__button { min-width:4.4rem; min-height:4.4rem; }
      .quantity__input { min-width:0; width:7rem; text-align:center; }
    </style>
    <link rel="stylesheet" href="/assets/component-cart-feedback-toast.css">
    <script>
      window.routes={cart_url:'/cart',cart_update_url:'/cart/update.js'};
      window.cartStrings={error:'Fixture cart service unavailable'};
      window.quickOrderListStrings={min_error:'Minimum [min]',max_error:'Maximum [max]',step_error:'Step [step]'};
      window.StandardEvents={};
    </script>
    ${['constants.js', 'pubsub.js', 'global.js', 'cart-feedback-toast.js', 'quick-add-bulk.js']
      .map((asset) => `<script src="/assets/${asset}" defer></script>`)
      .join('')}
  </head><body>
    <header><a id="cart-icon-bubble" href="/cart">${cartIconSection(cart).replace(/^.*?class="shopify-section">|<\/div>$/gs, '')}</a></header>
    <main>
      <h1>Collection</h1>
      <ul class="collection-quick-add-bulk" data-id="main">
        ${PRODUCTS.slice(0, 2)
          .map((product) => `<li>${quantityControl(product, state.quantities.get(product.variantId) || 0)}</li>`)
          .join('')}
      </ul>
      ${drawer ? `<div id="CartDrawer"><div class="drawer__inner" data-drawer-count="${cart.item_count}">Drawer quantity ${cart.item_count}</div></div>` : ''}
    </main>
    ${toastMarkup()}
  </body></html>`;
}

async function mount(page, options = {}) {
  const state = {
    quantities: new Map(PRODUCTS.map(({ variantId }) => [variantId, 0])),
    mode: options.mode || 'success',
    updateDelays: [...(options.updateDelays || [])],
    requests: [],
    completions: [],
    activeRequests: 0,
    maxActiveRequests: 0,
    errors: [],
    failReconciliation: Boolean(options.failReconciliation),
  };
  page.on('pageerror', (error) => state.errors.push(error.message));

  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname !== 'collection.local') return route.abort();

    if (url.pathname.startsWith('/assets/')) {
      const path = `.${url.pathname}`;
      if (!fs.existsSync(path)) return route.fulfill({ status: 404, body: 'Missing fixture asset' });
      return route.fulfill({
        body: fs.readFileSync(path),
        contentType: path.endsWith('.js') ? 'application/javascript' : 'text/css',
      });
    }

    if (url.pathname === '/cart/update.js') {
      const body = JSON.parse(request.postData());
      const requestRecord = { updates: body.updates, started: Date.now() };
      state.requests.push(requestRecord);
      state.activeRequests += 1;
      state.maxActiveRequests = Math.max(state.maxActiveRequests, state.activeRequests);

      if (state.mode === 'validation-error') {
        state.activeRequests -= 1;
        return route.fulfill({ status: 422, json: { errors: 'Fixture quantity rejected' } });
      }
      if (state.mode === 'network-rejected') {
        state.activeRequests -= 1;
        return route.abort('failed');
      }

      Object.entries(body.updates).forEach(([variantId, quantity]) => {
        state.quantities.set(Number(variantId), Number(quantity));
      });
      const snapshot = cartFrom(state);
      const delay = state.updateDelays.shift() || 0;
      if (delay) await new Promise((resolve) => setTimeout(resolve, delay));

      state.activeRequests -= 1;
      state.completions.push(Number(Object.keys(body.updates)[0]));
      if (state.mode === 'network-applied') return route.abort('failed');
      if (state.mode === 'invalid-json') return route.fulfill({ body: '{broken', contentType: 'application/json' });

      return route.fulfill({
        json: { ...snapshot, sections: sectionsFor(snapshot, state.mode) },
      });
    }

    if (url.pathname === '/cart.js') {
      if (state.failReconciliation) return route.abort('failed');
      return route.fulfill({ json: cartFrom(state) });
    }

    if (url.pathname === '/collections/tools' && url.searchParams.has('sections')) {
      return route.fulfill({ json: sectionsFor(cartFrom(state), 'success') });
    }

    if (url.pathname === '/cart') {
      const cart = cartFrom(state);
      return route.fulfill({
        contentType: 'text/html',
        body: `<!doctype html><html lang="en"><title>Cart</title><body><p id="cart-page-count">${cart.item_count}</p></body></html>`,
      });
    }

    if (url.pathname === '/collections/tools') {
      return route.fulfill({ contentType: 'text/html', body: documentFor(state, options) });
    }

    return route.abort();
  });

  await page.goto('http://collection.local/collections/tools');
  return {
    state,
    cart: () => cartFrom(state),
    setQuantity(variantId, quantity) {
      state.quantities.set(Number(variantId), Number(quantity));
    },
    setMode(mode) {
      state.mode = mode;
    },
  };
}

module.exports = { mount, PRODUCTS };
