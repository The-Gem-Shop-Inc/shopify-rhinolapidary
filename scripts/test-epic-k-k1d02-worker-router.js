'use strict';

const assert = require('assert/strict');
const crypto = require('crypto');
const path = require('path');
const { pathToFileURL } = require('url');

const SECRET = 'synthetic-app-secret';
const SHOP = 'sz5dnk-nf.myshopify.com';
const APPROVED_PATHS = ['/shopify/app-proxy/quote', '/shopify/app-proxy/quote/'];
const UNEXPECTED_PATHS = [
  '/shopify/app-proxy/quote/extra',
  '/shopify/app-proxy/quote//',
  '/shopify/app-proxy//quote',
  '/shopify//app-proxy/quote',
  '/shopify/app-proxy/%71uote',
  '/shopify/app-proxy/quote%2F',
];

function proxyUrl(pathname, { timestamp = Math.floor(Date.now() / 1000), signature } = {}) {
  const params = new URLSearchParams({
    shop: SHOP,
    logged_in_customer_id: '',
    path_prefix: '/apps/rhino-quote-draft',
    timestamp: String(timestamp),
  });
  const grouped = new Map();
  for (const [key, value] of params.entries()) {
    const values = grouped.get(key) || [];
    values.push(value);
    grouped.set(key, values);
  }
  const message = [...grouped.entries()].map(([key, values]) => `${key}=${values.join(',')}`).sort().join('');
  params.set('signature', signature || crypto.createHmac('sha256', SECRET).update(message).digest('hex'));
  return `https://rhino-quotation-drafts.example.invalid${pathname}?${params}`;
}

function request(url) {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': '192.0.2.25' },
    body: JSON.stringify({ fulfillment: 'pickup' }),
  });
}

function diagnosticDb() {
  const calls = { rateLimit: 0, idempotency: 0 };
  return {
    calls,
    prepare(sql) {
      if (sql.includes('quote_submission_claims')) {
        calls.idempotency += 1;
        throw new Error('Router verification must not reach idempotency or Draft Order handling.');
      }
      const statement = {
        bind() { return statement; },
        async run() { return { meta: { changes: 0 } }; },
        async first() {
          if (!sql.includes('quote_rate_windows')) throw new Error('Unexpected D1 query during router verification.');
          calls.rateLimit += 1;
          return { request_count: 1 };
        },
      };
      return statement;
    },
  };
}

async function responseBody(response) { return response.json(); }

async function main() {
  const workerUrl = pathToFileURL(path.resolve(__dirname, '../server/epic-k-draft-order/worker.mjs')).href;
  const worker = (await import(workerUrl)).default;
  const db = diagnosticDb();
  const env = {
    QUOTE_DB: db,
    SHOPIFY_API_SECRET: SECRET,
    SHOPIFY_APP_CLIENT_ID: 'synthetic-client-id',
    SHOPIFY_SHOP_DOMAIN: SHOP,
    SHOPIFY_API_VERSION: '2026-10',
  };
  const originalFetch = global.fetch;
  let adminRequests = 0;
  global.fetch = async () => {
    adminRequests += 1;
    throw new Error('Router verification must not call Shopify Admin.');
  };

  try {
    for (const pathname of APPROVED_PATHS) {
      const valid = await worker.fetch(request(proxyUrl(pathname)), env);
      assert.equal(valid.status, 409, `${pathname} must reach the quotation policy layer.`);
      assert.equal((await responseBody(valid)).code, 'PICKUP_NOT_ALLOWED');

      const invalid = await worker.fetch(request(proxyUrl(pathname, { signature: '0'.repeat(64) })), env);
      assert.equal(invalid.status, 401, `${pathname} must not bypass signature verification.`);
      assert.equal((await responseBody(invalid)).code, 'UNAUTHORIZED');

      const expired = await worker.fetch(request(proxyUrl(pathname, { timestamp: Math.floor(Date.now() / 1000) - 3600 })), env);
      assert.equal(expired.status, 401, `${pathname} must not bypass timestamp verification.`);
      assert.equal((await responseBody(expired)).code, 'EXPIRED_REQUEST');
    }

    for (const pathname of UNEXPECTED_PATHS) {
      const response = await worker.fetch(request(proxyUrl(pathname)), env);
      assert.equal(response.status, 404, `${pathname} must remain outside the route allowlist.`);
      assert.equal((await responseBody(response)).code, 'NOT_FOUND');
    }

    assert.equal(db.calls.rateLimit, APPROVED_PATHS.length, 'Only authenticated approved paths may reach rate limiting.');
    assert.equal(db.calls.idempotency, 0, 'No router verification request may reach idempotency or mutation handling.');
    assert.equal(adminRequests, 0, 'No router verification request may call Shopify Admin.');
    console.log('Epic K K1D-02V-R Worker router tests passed: 15/15.');
  } finally {
    global.fetch = originalFetch;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
