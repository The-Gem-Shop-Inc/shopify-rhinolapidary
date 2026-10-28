'use strict';

const crypto = require('crypto');
const {
  API_VERSION,
  MAX_BODY_BYTES,
  QuoteRequestError,
  buildDraftOrderInput,
  idempotencyIdentity,
  payloadHash,
  validatePayload,
  verifyAppProxyUrl,
  verifyVariantNodes,
} = require('./core');

const VERIFY_VARIANTS_QUERY = `#graphql
  query VerifyQuoteVariants($ids: [ID!]!) {
    nodes(ids: $ids) {
      __typename
      ... on ProductVariant {
        id
        availableForSale
        product { status }
      }
    }
  }
`;

const CREATE_DRAFT_MUTATION = `#graphql
  mutation CreateUnquotedDraft($input: DraftOrderInput!) {
    draftOrderCreate(input: $input) {
      draftOrder {
        id
        name
        status
        tags
        invoiceSentAt
        shippingLine { id }
      }
      userErrors { field message }
    }
  }
`;

const FIND_DRAFT_QUERY = `#graphql
  query FindUnquotedDraft($query: String!) {
    draftOrders(first: 5, query: $query, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        name
        status
        tags
        invoiceSentAt
        shippingLine { id }
        customAttributes { key value }
      }
    }
  }
`;

class AdminRequestError extends Error {
  constructor(message, { confirmedFailure = false, retryAfter = null } = {}) {
    super(message);
    this.name = 'AdminRequestError';
    this.confirmedFailure = confirmedFailure;
    this.retryAfter = retryAfter;
  }
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
  });
}

function publicError(error) {
  if (error instanceof QuoteRequestError) {
    return json({ ok: false, code: error.code, message: error.message, retryable: error.retryable }, error.status);
  }
  return json({
    ok: false,
    code: 'SUBMISSION_FAILED',
    message: 'The draft order could not be confirmed. Your cart and entered details remain available. Please retry later or use the email quotation fallback.',
    retryable: true,
  }, 503);
}

function successBody(reference, staffIdentifier, duplicate = false) {
  if (!staffIdentifier) throw new Error('A confirmed Shopify Draft Order staff identifier is required.');
  return {
    ok: true,
    storedInShopifyAdmin: true,
    status: 'draft_created',
    reference,
    staffIdentifier,
    duplicate,
    message: `Quotation ${reference} is stored in Shopify Admin as Unquoted draft ${staffIdentifier}. No invoice was sent and no payment was collected.`,
  };
}

function requireDependencies(options) {
  const missing = [];
  if (!options?.appSecret) missing.push('appSecret');
  if (!options?.shopDomain) missing.push('shopDomain');
  if (!options?.adminClient) missing.push('adminClient');
  if (!options?.idempotencyStore) missing.push('idempotencyStore');
  if (!options?.rateLimiter) missing.push('rateLimiter');
  if (missing.length) throw new Error(`K1D-01 endpoint is not configured: ${missing.join(', ')}`);
  for (const method of ['claim', 'markMutationStarted', 'complete', 'markRetryableFailure', 'markUncertain']) {
    if (typeof options.idempotencyStore[method] !== 'function') throw new Error(`Durable idempotency store must implement ${method}().`);
  }
  if (typeof options.rateLimiter.consume !== 'function') throw new Error('Durable rate limiter must implement consume().');
}

function clientAddress(request) {
  const value = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  return crypto.createHash('sha256').update(value).digest('hex');
}

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';
  if (!/^application\/json(?:;|$)/i.test(contentType)) throw new QuoteRequestError('INVALID_CONTENT_TYPE', 'Use application/json.', 415);
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    throw new QuoteRequestError('PAYLOAD_LIMIT', 'The quotation request is too large.', 413);
  }
  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY_BYTES) throw new QuoteRequestError('PAYLOAD_LIMIT', 'The quotation request is too large.', 413);
  try {
    return validatePayload(JSON.parse(raw));
  } catch (error) {
    if (error instanceof SyntaxError) throw new QuoteRequestError('INVALID_JSON', 'The quotation request is not valid JSON.');
    throw error;
  }
}

function assertCreatedDraft(draft, idempotencyTag) {
  if (!draft?.id || !draft?.name || draft.status !== 'OPEN') throw new AdminRequestError('Shopify did not confirm an open draft.');
  if (!Array.isArray(draft.tags) || !draft.tags.includes('Unquoted') || !draft.tags.includes(idempotencyTag)) {
    throw new AdminRequestError('Shopify did not confirm the required draft tags.');
  }
  if (draft.invoiceSentAt || draft.shippingLine) throw new AdminRequestError('The created draft contains an unexpected invoice or shipping line.');
  return draft;
}

function matchingReconciledDraft(drafts, idempotencyTag, reference) {
  return (drafts || []).find((draft) => (
    draft?.tags?.includes('Unquoted')
    && draft.tags.includes(idempotencyTag)
    && draft.status === 'OPEN'
    && !draft.invoiceSentAt
    && !draft.shippingLine
    && draft.customAttributes?.some((entry) => entry.key === 'Quotation reference' && entry.value === reference)
  ));
}

function createDraftOrderEndpoint(options) {
  requireDependencies(options);
  const now = options.now || (() => Date.now());

  return async function handleDraftOrderRequest(request) {
    try {
      if (request.method !== 'POST') return json({ ok: false, code: 'METHOD_NOT_ALLOWED', message: 'POST is required.' }, 405, { allow: 'POST' });
      const proxy = verifyAppProxyUrl(request.url, {
        appSecret: options.appSecret,
        expectedShop: options.shopDomain,
        now: now(),
      });
      const rateKey = `${proxy.shop}:${clientAddress(request)}`;
      const rate = await options.rateLimiter.consume({ key: rateKey, limit: 5, windowSeconds: 60, now: now() });
      if (!rate?.allowed) {
        return json({ ok: false, code: 'RATE_LIMITED', message: 'Too many quotation attempts. Please wait and retry.', retryable: true }, 429, {
          'retry-after': String(rate?.retryAfterSeconds || 60),
        });
      }

      const payload = await readPayload(request);
      const identity = idempotencyIdentity(proxy.shop, payload);
      const hash = payloadHash(payload);
      const claim = await options.idempotencyStore.claim({
        key: identity.key,
        payloadHash: hash,
        reference: payload.quoteReference,
        now: now(),
      });

      if (claim?.state === 'COMPLETED') return json(successBody(payload.quoteReference, claim.record?.draftName, true));
      if (claim?.state === 'CONFLICT') {
        return json({ ok: false, code: 'IDEMPOTENCY_CONFLICT', message: 'This quotation reference is already associated with different cart details.' }, 409);
      }
      if (claim?.state === 'IN_PROGRESS') {
        return json({ ok: false, code: 'SUBMISSION_IN_PROGRESS', message: 'This quotation is still being confirmed. Wait before retrying.', retryable: true }, 202, { 'retry-after': '3' });
      }
      if (claim?.state === 'UNCERTAIN') {
        const drafts = await options.adminClient.findDraftsByTag(identity.tag);
        const recovered = matchingReconciledDraft(drafts, identity.tag, payload.quoteReference);
        if (!recovered) {
          return json({
            ok: false,
            code: 'SUBMISSION_UNCERTAIN',
            message: 'Shopify has not yet confirmed whether the draft was created. No second draft was attempted. Please retry later or contact Rhino with the quotation reference.',
            retryable: true,
            reference: payload.quoteReference,
          }, 503, { 'retry-after': '10' });
        }
        await options.idempotencyStore.complete({ key: identity.key, payloadHash: hash, draftId: recovered.id, draftName: recovered.name, now: now() });
        return json(successBody(payload.quoteReference, recovered.name, true));
      }
      if (claim?.state !== 'ACQUIRED') throw new Error('Durable idempotency store returned an unsupported claim state.');

      try {
        const uniqueIds = [...new Set(payload.items.map((item) => item.variantId))];
        const variantNodes = await options.adminClient.verifyVariants(uniqueIds);
        verifyVariantNodes(payload.items, variantNodes);
        const draftInput = buildDraftOrderInput(payload, identity.tag);
        await options.idempotencyStore.markMutationStarted({ key: identity.key, payloadHash: hash, now: now() });
        const result = await options.adminClient.createDraft(draftInput);
        if (result.userErrors?.length) {
          const message = result.userErrors.map((entry) => entry.message).join(' ');
          throw new AdminRequestError(message || 'Shopify rejected the draft order.', { confirmedFailure: true });
        }
        const draft = assertCreatedDraft(result.draftOrder, identity.tag);
        await options.idempotencyStore.complete({ key: identity.key, payloadHash: hash, draftId: draft.id, draftName: draft.name, now: now() });
        return json(successBody(payload.quoteReference, draft.name));
      } catch (error) {
        if (error instanceof QuoteRequestError || error?.confirmedFailure === true) {
          await options.idempotencyStore.markRetryableFailure({ key: identity.key, payloadHash: hash, code: error.code || 'ADMIN_REJECTED', now: now() });
          if (error instanceof QuoteRequestError) throw error;
          return json({
            ok: false,
            code: 'SHOPIFY_REJECTED',
            message: 'Shopify rejected the draft order. Your cart and entered details remain available; correct the issue or use the email quotation fallback.',
            retryable: true,
          }, 422);
        }
        await options.idempotencyStore.markUncertain({ key: identity.key, payloadHash: hash, code: 'ADMIN_RESULT_UNCERTAIN', now: now() });
        throw error;
      }
    } catch (error) {
      return publicError(error);
    }
  };
}

function createShopifyClientCredentialsProvider({
  shopDomain,
  clientId,
  clientSecret,
  requiredScopes = ['read_products', 'write_draft_orders', 'write_app_proxy'],
  fetchImpl = fetch,
}) {
  if (!shopDomain || !clientId || !clientSecret) throw new Error('Shop domain, client ID, and client secret are required server-side.');
  let requestToken;
  return async function accessToken() {
    if (!requestToken) {
      requestToken = (async () => {
        let response;
        try {
          response = await fetchImpl(`https://${shopDomain}/admin/oauth/access_token`, {
            method: 'POST',
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'client_credentials' }),
          });
        } catch {
          throw new AdminRequestError('Shopify authentication is temporarily unavailable.', { confirmedFailure: true });
        }
        if (!response.ok) throw new AdminRequestError('Shopify rejected the application credentials.', { confirmedFailure: true });
        let body;
        try { body = await response.json(); } catch { throw new AdminRequestError('Shopify returned an invalid authentication result.', { confirmedFailure: true }); }
        const grantedScopes = new Set(String(body.scope || '').split(',').map((scope) => scope.trim()).filter(Boolean));
        if (!body.access_token || requiredScopes.some((scope) => !grantedScopes.has(scope))) {
          throw new AdminRequestError('The installed app is missing a required access scope.', { confirmedFailure: true });
        }
        return body.access_token;
      })();
    }
    return requestToken;
  };
}

function createShopifyAdminClient({ shopDomain, accessToken, accessTokenProvider, apiVersion = API_VERSION, fetchImpl = fetch }) {
  if (!shopDomain || (!accessToken && !accessTokenProvider)) throw new Error('A shop domain and server-side Admin API token provider are required.');
  const endpoint = `https://${shopDomain}/admin/api/${apiVersion}/graphql.json`;

  async function execute(query, variables) {
    let response;
    try {
      const resolvedAccessToken = accessTokenProvider ? await accessTokenProvider() : accessToken;
      response = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-shopify-access-token': resolvedAccessToken },
        body: JSON.stringify({ query, variables }),
      });
    } catch (error) {
      if (error instanceof AdminRequestError) throw error;
      throw new AdminRequestError('The Shopify Admin API result is uncertain.');
    }
    const retryAfter = response.headers.get('retry-after');
    if (response.status === 429) throw new AdminRequestError('Shopify rate limited the request.', { confirmedFailure: true, retryAfter });
    if (response.status === 401 || response.status === 403 || response.status === 400) {
      throw new AdminRequestError('Shopify rejected the Admin API request.', { confirmedFailure: true });
    }
    if (!response.ok) throw new AdminRequestError('The Shopify Admin API result is uncertain.');
    let body;
    try { body = await response.json(); } catch { throw new AdminRequestError('The Shopify Admin API result is uncertain.'); }
    if (body.errors?.length) {
      const confirmedFailure = body.errors.every((entry) => ['ACCESS_DENIED', 'GRAPHQL_VALIDATION_FAILED'].includes(entry.extensions?.code));
      throw new AdminRequestError('Shopify returned a GraphQL error.', { confirmedFailure });
    }
    return body.data;
  }

  return {
    async verifyVariants(ids) {
      const data = await execute(VERIFY_VARIANTS_QUERY, { ids });
      return data?.nodes || [];
    },
    async createDraft(input) {
      const data = await execute(CREATE_DRAFT_MUTATION, { input });
      return data?.draftOrderCreate || { draftOrder: null, userErrors: [{ message: 'Missing Shopify mutation result.' }] };
    },
    async findDraftsByTag(tag) {
      const data = await execute(FIND_DRAFT_QUERY, { query: `tag:${tag}` });
      return data?.draftOrders?.nodes || [];
    },
  };
}

module.exports = {
  AdminRequestError,
  CREATE_DRAFT_MUTATION,
  FIND_DRAFT_QUERY,
  VERIFY_VARIANTS_QUERY,
  createDraftOrderEndpoint,
  createShopifyAdminClient,
  createShopifyClientCredentialsProvider,
};
