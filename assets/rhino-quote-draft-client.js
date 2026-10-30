(function attachRhinoQuoteDraftClient(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RhinoQuoteDraftClient = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createRhinoQuoteDraftClient() {
  'use strict';

  const ACTIVE_REQUEST_KEY = 'rhino-quote:k1d03:active';
  const STAFF_IDENTIFIER_PATTERN = /^#D[1-9][0-9]*$/;
  const REFERENCE_PATTERN = /^KQ-[A-Z0-9]{6,32}-[1-9][0-9]{0,4}$/;

  function canonicalize(value) {
    if (Array.isArray(value)) return value.map(canonicalize);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }

  function canonicalJson(value) {
    return JSON.stringify(canonicalize(value));
  }

  function publicProperties(properties) {
    if (!properties || typeof properties !== 'object' || Array.isArray(properties)) return {};
    return Object.fromEntries(Object.entries(properties)
      .filter(([key, value]) => key && !key.startsWith('_') && value !== null && value !== undefined && String(value).trim()));
  }

  function sellingPlanId(item) {
    const id = item?.selling_plan_allocation?.selling_plan?.id ?? item?.selling_plan_allocation?.selling_plan_id ?? item?.selling_plan;
    if (id === null || id === undefined || id === '') return null;
    const text = String(id);
    return text.startsWith('gid://shopify/SellingPlan/') ? text : `gid://shopify/SellingPlan/${text}`;
  }

  function normalizeItems(cart) {
    if (!Array.isArray(cart?.items) || cart.items.length === 0) throw new Error('INVALID_CART');
    return cart.items.map((item) => {
      const rawVariantId = item.variant_id ?? item.variantId ?? item.id;
      const variantId = String(rawVariantId || '');
      if (!/^[1-9][0-9]*$/.test(variantId) && !/^gid:\/\/shopify\/ProductVariant\/[1-9][0-9]*$/.test(variantId)) {
        throw new Error('INVALID_CART');
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1) throw new Error('INVALID_CART');
      return {
        variantId: variantId.startsWith('gid://') ? variantId : `gid://shopify/ProductVariant/${variantId}`,
        quantity: item.quantity,
        properties: publicProperties(item.properties),
        sellingPlanId: sellingPlanId(item),
      };
    });
  }

  function discountCodes(cart) {
    const codes = Array.isArray(cart?.discount_codes)
      ? cart.discount_codes.filter((entry) => entry?.applicable !== false).map((entry) => String(entry?.code || '').trim()).filter(Boolean)
      : [];
    return [...new Set(codes)];
  }

  function discountRepresentation(cart) {
    const codes = discountCodes(cart);
    const applications = [
      ...(Array.isArray(cart?.cart_level_discount_applications) ? cart.cart_level_discount_applications : []),
      ...(Array.isArray(cart?.items) ? cart.items.flatMap((item) => item.line_level_discount_allocations || []) : []),
    ];
    if (codes.length > 5) return { supported: false, reason: 'TOO_MANY_DISCOUNT_CODES', codes };
    const unrepresentedCode = applications.some((application) => {
      const type = application?.discount_application?.type || application?.type;
      const title = application?.discount_application?.title || application?.title || '';
      return type === 'discount_code' && !codes.includes(title);
    });
    return { supported: !unrepresentedCode, reason: unrepresentedCode ? 'DISCOUNT_CODE_UNREPRESENTED' : null, codes };
  }

  function cartMaterial(cart) {
    return {
      items: normalizeItems(cart),
      discountCodes: discountCodes(cart),
      note: String(cart?.note || ''),
    };
  }

  function formMaterial(values) {
    return {
      customer: {
        firstName: String(values.firstName || '').trim(),
        lastName: String(values.lastName || '').trim(),
        email: String(values.email || '').trim().toLowerCase(),
        phone: String(values.phone || '').trim(),
        company: String(values.company || '').trim(),
      },
      shippingAddress: {
        address1: String(values.address1 || '').trim(),
        address2: String(values.address2 || '').trim(),
        city: String(values.city || '').trim(),
        provinceCode: String(values.provinceCode || '').trim().toUpperCase(),
        zip: String(values.zip || '').trim(),
        countryCode: 'US',
      },
      delivery: {
        addressType: String(values.addressType || '').trim().toLowerCase(),
        liftgateRequired: values.liftgateRequired === true,
        accessInformation: String(values.accessInformation || '').trim(),
        insuranceRequested: values.insuranceRequested === true,
      },
    };
  }

  function buildPayload({ cart, values, quoteReference, cartToken }) {
    const discounts = discountRepresentation(cart);
    if (!discounts.supported) throw new Error(discounts.reason);
    return {
      fulfillment: 'shipping',
      quoteReference,
      cartToken,
      items: normalizeItems(cart),
      discountCodes: discounts.codes,
      ...formMaterial(values),
      cartNote: String(cart?.note || ''),
    };
  }

  function bytesToHex(bytes) {
    return [...bytes].map((value) => value.toString(16).padStart(2, '0')).join('');
  }

  async function sha256(value, cryptoApi = globalThis.crypto) {
    if (!cryptoApi?.subtle) throw new Error('CRYPTO_UNAVAILABLE');
    const bytes = new TextEncoder().encode(String(value));
    return bytesToHex(new Uint8Array(await cryptoApi.subtle.digest('SHA-256', bytes)));
  }

  async function fingerprint(cart, values, cryptoApi) {
    return sha256(canonicalJson({ cart: cartMaterial(cart), form: formMaterial(values) }), cryptoApi);
  }

  async function safeCartToken(rawToken, cryptoApi) {
    if (!rawToken) throw new Error('INVALID_CART');
    return `K1D03_${(await sha256(rawToken, cryptoApi)).slice(0, 48)}`;
  }

  function createReference(totalQuantity, cryptoApi = globalThis.crypto) {
    if (!cryptoApi?.getRandomValues) throw new Error('CRYPTO_UNAVAILABLE');
    const bytes = new Uint8Array(12);
    cryptoApi.getRandomValues(bytes);
    const random = bytesToHex(bytes).toUpperCase();
    const suffix = Math.max(1, Math.min(99999, Number(totalQuantity) || 1));
    return `KQ-${random}-${suffix}`;
  }

  function decideIdentity(active, nextFingerprint, totalQuantity, cryptoApi) {
    if (active && ['submitting', 'uncertain'].includes(active.state)) {
      return { reference: active.reference || null, reuse: false, blocked: true, state: 'uncertain' };
    }
    if (active?.fingerprint === nextFingerprint && REFERENCE_PATTERN.test(active.reference || '')) {
      return { reference: active.reference, reuse: true, blocked: false, state: active.state };
    }
    return { reference: createReference(totalQuantity, cryptoApi), reuse: false, blocked: false, state: 'prepared' };
  }

  function classifyResponse(status, body) {
    if (status >= 200 && status < 300
      && body?.storedInShopifyAdmin === true
      && REFERENCE_PATTERN.test(body?.reference || '')
      && STAFF_IDENTIFIER_PATTERN.test(body?.staffIdentifier || '')) {
      return { kind: 'confirmed', reference: body.reference, staffIdentifier: body.staffIdentifier, duplicate: body.duplicate === true };
    }
    if (status === 429) return { kind: 'recoverable', code: 'RATE_LIMITED' };
    if (status === 202 && body?.code === 'SUBMISSION_IN_PROGRESS') {
      return { kind: 'recoverable', code: 'SUBMISSION_IN_PROGRESS' };
    }
    if (status >= 400 && status < 500 && body?.retryable === true) {
      return { kind: 'recoverable', code: String(body?.code || 'REQUEST_RETRYABLE') };
    }
    if (status >= 400 && status < 500) return { kind: 'rejected', code: String(body?.code || 'REQUEST_REJECTED') };
    return { kind: 'uncertain', code: 'UNCONFIRMED_RESULT' };
  }

  return {
    ACTIVE_REQUEST_KEY,
    REFERENCE_PATTERN,
    STAFF_IDENTIFIER_PATTERN,
    buildPayload,
    canonicalJson,
    cartMaterial,
    classifyResponse,
    createReference,
    decideIdentity,
    discountRepresentation,
    fingerprint,
    formMaterial,
    normalizeItems,
    publicProperties,
    safeCartToken,
  };
});
