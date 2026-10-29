import endpointModule from './endpoint.js';
import adapterModule from './d1-adapters.js';

const { createDraftOrderEndpoint, createShopifyAdminClient, createShopifyClientCredentialsProvider } = endpointModule;
const { createD1IdempotencyStore, createD1RateLimiter } = adapterModule;

function configured(env) {
  const values = [
    env.QUOTE_DB,
    env.SHOPIFY_API_SECRET,
    env.SHOPIFY_APP_CLIENT_ID,
    env.SHOPIFY_SHOP_DOMAIN,
    env.SHOPIFY_API_VERSION,
  ];
  return values.every((value) => value && !String(value).startsWith('REPLACE_WITH_'));
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/health') {
      return json({ ok: configured(env), service: 'rhino-quotation-drafts' }, configured(env) ? 200 : 503);
    }
    if (url.pathname !== '/shopify/app-proxy/quote' && url.pathname !== '/shopify/app-proxy/quote/') {
      return json({ ok: false, code: 'NOT_FOUND' }, 404);
    }
    if (!configured(env)) return json({ ok: false, code: 'SERVICE_NOT_CONFIGURED' }, 503);

    const startedAt = Date.now();
    const requestId = crypto.randomUUID();
    let response;
    try {
      const handler = createDraftOrderEndpoint({
        appSecret: env.SHOPIFY_API_SECRET,
        shopDomain: env.SHOPIFY_SHOP_DOMAIN,
        adminClient: createShopifyAdminClient({
          shopDomain: env.SHOPIFY_SHOP_DOMAIN,
          accessTokenProvider: createShopifyClientCredentialsProvider({
            shopDomain: env.SHOPIFY_SHOP_DOMAIN,
            clientId: env.SHOPIFY_APP_CLIENT_ID,
            clientSecret: env.SHOPIFY_API_SECRET,
          }),
          apiVersion: env.SHOPIFY_API_VERSION,
        }),
        idempotencyStore: createD1IdempotencyStore(env.QUOTE_DB),
        rateLimiter: createD1RateLimiter(env.QUOTE_DB),
      });
      response = await handler(request);
      return response;
    } finally {
      console.log(JSON.stringify({
        event: 'quote_request_complete',
        requestId,
        status: response?.status || 500,
        durationMs: Date.now() - startedAt,
      }));
    }
  },
};
