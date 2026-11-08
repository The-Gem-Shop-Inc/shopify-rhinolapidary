'use strict';

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

const styles = `
  *, *::before, *::after { box-sizing: border-box; }
  html { overflow-wrap: anywhere; }
  body { margin: 0; color: #171717; background: #fff; font: 1rem/1.5 system-ui, sans-serif; }
  a, button { min-block-size: 44px; }
  a { color: #124b74; }
  a:focus-visible, button:focus-visible { outline: 3px solid #c54800; outline-offset: 3px; }
  header, main { inline-size: min(100%, 72rem); margin-inline: auto; padding: 1rem; }
  header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; }
  .account-entry, nav a, button { display: inline-flex; align-items: center; padding: .65rem .85rem; }
  nav ul { display: flex; flex-wrap: wrap; gap: .5rem 1rem; padding: 0; list-style: none; }
  .orders, .addresses { display: grid; gap: 1rem; padding: 0; list-style: none; }
  .card { min-inline-size: 0; padding: 1rem; border: 1px solid #777; border-radius: .25rem; }
  .actions { display: flex; flex-wrap: wrap; gap: .5rem; }
  .status { padding: 1rem; border-inline-start: .35rem solid #c54800; background: #fff4ea; }
  @media (min-width: 48rem) { .orders, .addresses { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
`;

function accountEntryHtml(state) {
  const link = state.accountLinkVisible
    ? `<a class="account-entry" href="${escapeHtml(state.destination || '/account')}">${escapeHtml(state.label || 'Account')}</a>`
    : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rhino Lapidary synthetic account entry</title><style>${styles}</style></head><body><header><a href="/">Rhino Lapidary</a>${link}</header><main><h1>Store</h1><p>Browse the synthetic storefront fixture.</p></main></body></html>`;
}

function authenticatedAccountHtml(state) {
  const orders = (state.orders || []).map((order) => `<li class="card"><h2><a href="/account/orders/${escapeHtml(order.reference)}">Order ${escapeHtml(order.reference)}</a></h2><p>Status: <strong>${escapeHtml(order.status)}</strong></p><a href="/account/orders/${escapeHtml(order.reference)}">View order</a></li>`).join('');
  const empty = state.orders?.length === 0 ? `<section aria-labelledby="empty-orders"><h2 id="empty-orders">No orders yet</h2><a href="${escapeHtml(state.emptyAction?.destination)}">${escapeHtml(state.emptyAction?.label)}</a></section>` : '';
  const addresses = (state.profile?.addresses || []).map((address) => `<li class="card"><h2>${escapeHtml(address.label)}</h2><p>${address.default ? 'Current default' : 'Saved address'}</p><div class="actions"><button type="button">Edit address</button><button type="button">Delete address</button>${address.default ? '' : '<button type="button">Set as default</button>'}</div></li>`).join('');
  const pagination = state.pagination ? `<nav aria-label="Order pages"><ul><li><a href="?page=${state.pagination.currentPage - 1}" rel="prev">Previous</a></li><li>Page ${state.pagination.currentPage} of ${state.pagination.totalPages}</li><li><a href="?page=${state.pagination.currentPage + 1}" rel="next">Next</a></li></ul></nav>` : '';
  const error = state.error ? `<section id="error-summary" class="status" role="alert" tabindex="-1"><h2>We couldn't load that account destination</h2><p>${escapeHtml(state.error)}</p><div class="actions"><button id="retry" type="button">Try again</button><a href="/">Return to store</a></div></section><script>document.getElementById('error-summary').focus()</script>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rhino Lapidary synthetic customer account</title><style>${styles}</style></head><body><header><a href="/">Return to Rhino Lapidary</a><a class="account-entry" href="/account">Account</a></header><main><nav aria-label="Customer account"><ul><li><a href="/account">Orders</a></li><li><a href="/account/profile">Profile and addresses</a></li><li><a href="/account/logout">Log out</a></li></ul></nav><h1>${escapeHtml(state.heading || 'Profile and addresses')}</h1>${error}<section aria-labelledby="orders-heading"><h2 id="orders-heading">Order history</h2>${orders ? `<ul class="orders">${orders}</ul>` : empty}</section>${pagination}<section aria-labelledby="addresses-heading"><h2 id="addresses-heading">Saved addresses</h2><button type="button">Add address</button>${addresses ? `<ul class="addresses">${addresses}</ul>` : '<p>No saved addresses.</p>'}</section><p class="status" id="account-status" aria-live="polite">Account actions use synthetic data in this fixture.</p></main></body></html>`;
}

module.exports = {accountEntryHtml, authenticatedAccountHtml};
