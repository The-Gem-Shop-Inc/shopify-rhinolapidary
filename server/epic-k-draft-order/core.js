'use strict';

const crypto = require('crypto');

const API_VERSION = '2026-10';
const MAX_BODY_BYTES = 32 * 1024;
const MAX_LINES = 50;
const MAX_QUANTITY_PER_LINE = 1000;
const MAX_PROPERTIES_PER_LINE = 20;
const MAX_DISCOUNT_CODES = 5;
const APP_PROXY_MAX_AGE_SECONDS = 300;
const SHOP_DOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/;
const REFERENCE_PATTERN = /^KQ-[A-Z0-9]{6,32}-[1-9][0-9]{0,4}$/;
const CART_TOKEN_PATTERN = /^[A-Za-z0-9_-]{8,255}$/;
const US_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
]);
const FORBIDDEN_FINANCIAL_FIELDS = new Set([
  'price', 'unitPrice', 'linePrice', 'originalPrice', 'subtotal', 'total',
  'shippingCharge', 'shippingLine', 'appliedDiscount', 'priceOverride',
]);

class QuoteRequestError extends Error {
  constructor(code, message, status = 400, retryable = false) {
    super(message);
    this.name = 'QuoteRequestError';
    this.code = code;
    this.status = status;
    this.retryable = retryable;
  }
}

function stringValue(value, name, { required = false, max = 255 } = {}) {
  if (value === undefined || value === null) {
    if (required) throw new QuoteRequestError('INVALID_REQUEST', `${name} is required.`);
    return '';
  }
  if (typeof value !== 'string') throw new QuoteRequestError('INVALID_REQUEST', `${name} must be text.`);
  const normalized = value.trim();
  if (required && !normalized) throw new QuoteRequestError('INVALID_REQUEST', `${name} is required.`);
  if (normalized.length > max) throw new QuoteRequestError('PAYLOAD_LIMIT', `${name} is too long.`, 413);
  return normalized;
}

function assertNoFinancialFields(value, path = 'request') {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertNoFinancialFields(entry, `${path}[${index}]`));
    return;
  }
  for (const [key, entry] of Object.entries(value)) {
    if (FORBIDDEN_FINANCIAL_FIELDS.has(key)) {
      throw new QuoteRequestError('CLIENT_PRICE_REJECTED', `${path}.${key} must not be supplied.`, 422);
    }
    assertNoFinancialFields(entry, `${path}.${key}`);
  }
}

function normalizeVariantId(value) {
  const raw = stringValue(value, 'items[].variantId', { required: true, max: 80 });
  if (/^[1-9][0-9]*$/.test(raw)) return `gid://shopify/ProductVariant/${raw}`;
  if (/^gid:\/\/shopify\/ProductVariant\/[1-9][0-9]*$/.test(raw)) return raw;
  throw new QuoteRequestError('INVALID_CART', 'Each cart line must contain a valid Shopify ProductVariant ID.', 422);
}

function normalizeSellingPlanId(value) {
  if (value === undefined || value === null || value === '') return null;
  const raw = stringValue(value, 'items[].sellingPlanId', { max: 80 });
  if (/^[1-9][0-9]*$/.test(raw)) return `gid://shopify/SellingPlan/${raw}`;
  if (/^gid:\/\/shopify\/SellingPlan\/[1-9][0-9]*$/.test(raw)) return raw;
  throw new QuoteRequestError('INVALID_CART', 'The selling plan identifier is invalid.', 422);
}

function normalizeProperties(value) {
  if (value === undefined || value === null) return [];
  const entries = Array.isArray(value)
    ? value.map((entry) => [entry?.name, entry?.value])
    : Object.entries(value);
  if (entries.length > MAX_PROPERTIES_PER_LINE) {
    throw new QuoteRequestError('PAYLOAD_LIMIT', `A line can contain at most ${MAX_PROPERTIES_PER_LINE} properties.`, 413);
  }
  const properties = [];
  for (const [rawName, rawValue] of entries) {
    const name = stringValue(rawName, 'line property name', { required: true, max: 255 });
    if (name.startsWith('_')) continue;
    const propertyValue = stringValue(rawValue, `line property ${name}`, { max: 1000 });
    if (propertyValue) properties.push({ key: name, value: propertyValue });
  }
  return properties;
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new QuoteRequestError('INVALID_CART', 'A nonempty shipping cart is required.', 422);
  }
  if (items.length > MAX_LINES) {
    throw new QuoteRequestError('PAYLOAD_LIMIT', `A quotation can contain at most ${MAX_LINES} cart lines.`, 413);
  }
  return items.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new QuoteRequestError('INVALID_CART', 'Every cart line must be an object.', 422);
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_LINE) {
      throw new QuoteRequestError('INVALID_CART', `Line quantities must be integers from 1 to ${MAX_QUANTITY_PER_LINE}.`, 422);
    }
    return {
      variantId: normalizeVariantId(item.variantId),
      quantity: item.quantity,
      properties: normalizeProperties(item.properties),
      sellingPlanId: normalizeSellingPlanId(item.sellingPlanId),
    };
  });
}

function normalizeDiscountCodes(value) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > MAX_DISCOUNT_CODES) {
    throw new QuoteRequestError('PAYLOAD_LIMIT', `At most ${MAX_DISCOUNT_CODES} discount codes are accepted.`, 413);
  }
  return [...new Set(value.map((code) => stringValue(code, 'discount code', { required: true, max: 255 })))];
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new QuoteRequestError('INVALID_REQUEST', 'A JSON quotation request is required.');
  }
  assertNoFinancialFields(payload);
  if (payload.fulfillment !== 'shipping') {
    throw new QuoteRequestError('PICKUP_NOT_ALLOWED', 'Pickup carts must continue through Shopify checkout and cannot create quotation drafts.', 409);
  }

  const quoteReference = stringValue(payload.quoteReference, 'quoteReference', { required: true, max: 48 }).toUpperCase();
  if (!REFERENCE_PATTERN.test(quoteReference)) {
    throw new QuoteRequestError('INVALID_REQUEST', 'The quotation reference is invalid.');
  }
  const cartToken = stringValue(payload.cartToken, 'cartToken', { required: true, max: 255 });
  if (!CART_TOKEN_PATTERN.test(cartToken)) throw new QuoteRequestError('INVALID_CART', 'The cart reference is invalid.', 422);

  const items = normalizeItems(payload.items);
  if (items.some((item) => item.sellingPlanId)) {
    throw new QuoteRequestError(
      'SELLING_PLAN_UNSUPPORTED',
      'This cart contains a selling plan that Shopify Draft Orders cannot preserve in API version 2026-10. Use the email quotation fallback so staff can review it without changing the merchandise total.',
      422,
    );
  }

  const customer = payload.customer;
  const address = payload.shippingAddress;
  const delivery = payload.delivery;
  if (!customer || typeof customer !== 'object' || !address || typeof address !== 'object' || !delivery || typeof delivery !== 'object') {
    throw new QuoteRequestError('INVALID_REQUEST', 'Customer, shipping address, and delivery details are required.');
  }
  const email = stringValue(customer.email, 'customer.email', { required: true, max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new QuoteRequestError('INVALID_REQUEST', 'customer.email is invalid.');
  const provinceCode = stringValue(address.provinceCode, 'shippingAddress.provinceCode', { required: true, max: 2 }).toUpperCase();
  if (!US_STATE_CODES.has(provinceCode)) throw new QuoteRequestError('INVALID_REQUEST', 'A valid two-letter US state is required.');
  if (address.countryCode !== 'US') throw new QuoteRequestError('INVALID_REQUEST', 'Only United States quotation intake is supported.');
  if (!['residential', 'commercial'].includes(delivery.addressType)) {
    throw new QuoteRequestError('INVALID_REQUEST', 'delivery.addressType must be residential or commercial.');
  }
  if (typeof delivery.liftgateRequired !== 'boolean' || typeof delivery.insuranceRequested !== 'boolean') {
    throw new QuoteRequestError('INVALID_REQUEST', 'Liftgate and insurance choices must be explicit.');
  }

  return {
    fulfillment: 'shipping',
    quoteReference,
    cartToken,
    items,
    discountCodes: normalizeDiscountCodes(payload.discountCodes),
    customer: {
      firstName: stringValue(customer.firstName, 'customer.firstName', { required: true, max: 255 }),
      lastName: stringValue(customer.lastName, 'customer.lastName', { required: true, max: 255 }),
      email,
      phone: stringValue(customer.phone, 'customer.phone', { max: 32 }),
      company: stringValue(customer.company, 'customer.company', { max: 255 }),
    },
    shippingAddress: {
      address1: stringValue(address.address1, 'shippingAddress.address1', { required: true, max: 255 }),
      address2: stringValue(address.address2, 'shippingAddress.address2', { max: 255 }),
      city: stringValue(address.city, 'shippingAddress.city', { required: true, max: 255 }),
      provinceCode,
      zip: stringValue(address.zip, 'shippingAddress.zip', { required: true, max: 32 }),
      countryCode: 'US',
    },
    delivery: {
      addressType: delivery.addressType,
      liftgateRequired: delivery.liftgateRequired,
      accessInformation: stringValue(delivery.accessInformation, 'delivery.accessInformation', { required: true, max: 2000 }),
      insuranceRequested: delivery.insuranceRequested,
    },
    cartNote: stringValue(payload.cartNote, 'cartNote', { max: 2000 }),
  };
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
}

function payloadHash(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(canonicalize(payload))).digest('hex');
}

function idempotencyIdentity(shop, payload) {
  const digest = crypto.createHash('sha256')
    .update(`${shop}\0${payload.quoteReference}`)
    .digest('hex');
  return { key: `epic-k:k1d01:${digest}`, tag: `K1D-${digest.slice(0, 24)}` };
}

function appProxyMessage(searchParams) {
  const grouped = new Map();
  for (const [key, value] of searchParams.entries()) {
    if (key === 'signature') continue;
    const values = grouped.get(key) || [];
    values.push(value);
    grouped.set(key, values);
  }
  return [...grouped.entries()]
    .map(([key, values]) => `${key}=${values.join(',')}`)
    .sort()
    .join('');
}

function verifyAppProxyUrl(urlValue, { appSecret, expectedShop, now = Date.now(), maxAgeSeconds = APP_PROXY_MAX_AGE_SECONDS }) {
  if (!appSecret) throw new Error('SHOPIFY_API_SECRET is required.');
  const url = new URL(urlValue);
  const signature = url.searchParams.get('signature') || '';
  if (!/^[a-f0-9]{64}$/i.test(signature)) throw new QuoteRequestError('UNAUTHORIZED', 'The storefront request could not be authenticated.', 401);
  const calculated = crypto.createHmac('sha256', appSecret).update(appProxyMessage(url.searchParams)).digest('hex');
  const suppliedBuffer = Buffer.from(signature.toLowerCase(), 'hex');
  const calculatedBuffer = Buffer.from(calculated, 'hex');
  if (suppliedBuffer.length !== calculatedBuffer.length || !crypto.timingSafeEqual(suppliedBuffer, calculatedBuffer)) {
    throw new QuoteRequestError('UNAUTHORIZED', 'The storefront request could not be authenticated.', 401);
  }
  const shop = (url.searchParams.get('shop') || '').toLowerCase();
  if (!SHOP_DOMAIN_PATTERN.test(shop) || shop !== expectedShop.toLowerCase()) {
    throw new QuoteRequestError('UNAUTHORIZED', 'The storefront request is for an unexpected shop.', 401);
  }
  const timestamp = Number(url.searchParams.get('timestamp'));
  const nowSeconds = Math.floor(now / 1000);
  if (!Number.isInteger(timestamp) || Math.abs(nowSeconds - timestamp) > maxAgeSeconds) {
    throw new QuoteRequestError('EXPIRED_REQUEST', 'The storefront request has expired. Refresh the page and try again.', 401, true);
  }
  return { shop, loggedInCustomerId: url.searchParams.get('logged_in_customer_id') || null };
}

function verifyVariantNodes(items, nodes) {
  if (!Array.isArray(nodes) || nodes.length !== new Set(items.map((item) => item.variantId)).size) {
    throw new QuoteRequestError('INVALID_CART', 'Shopify could not verify every cart variant.', 422);
  }
  const byId = new Map(nodes.map((node) => [node?.id, node]));
  for (const item of items) {
    const node = byId.get(item.variantId);
    if (!node || node.__typename !== 'ProductVariant' || node.product?.status !== 'ACTIVE' || node.availableForSale !== true) {
      throw new QuoteRequestError('INVALID_CART', 'One or more cart variants are no longer available from an active Shopify product.', 422);
    }
  }
  return items.map((item) => ({ ...item, availableForSale: byId.get(item.variantId).availableForSale === true }));
}

function buildDraftOrderInput(payload, idempotencyTag) {
  const warnings = [];
  if (payload.discountCodes.length) warnings.push('Discount codes are recalculated by Shopify; staff must review the resulting merchandise subtotal.');
  warnings.push('Automatic discounts are recalculated by Shopify; staff must compare the draft before invoicing.');
  const note = [
    'SHIPPING QUOTATION REQUEST — UNQUOTED',
    `Quote reference: ${payload.quoteReference}`,
    'Shipping charge: pending staff packaging and carrier quotation.',
    'Do not send an invoice, collect payment, reserve inventory, or complete this draft until the quotation is approved.',
    `Delivery address type: ${payload.delivery.addressType}`,
    `Liftgate required: ${payload.delivery.liftgateRequired ? 'Yes' : 'No'}`,
    `Insurance options requested: ${payload.delivery.insuranceRequested ? 'Yes' : 'No'}`,
    `Delivery access information: ${payload.delivery.accessInformation}`,
    payload.cartNote ? `Cart note: ${payload.cartNote}` : null,
    ...warnings.map((warning) => `STAFF REVIEW: ${warning}`),
  ].filter(Boolean).join('\n');

  const shippingAddress = {
    firstName: payload.customer.firstName,
    lastName: payload.customer.lastName,
    company: payload.customer.company || undefined,
    phone: payload.customer.phone || undefined,
    address1: payload.shippingAddress.address1,
    address2: payload.shippingAddress.address2 || undefined,
    city: payload.shippingAddress.city,
    provinceCode: payload.shippingAddress.provinceCode,
    zip: payload.shippingAddress.zip,
    countryCode: 'US',
  };
  return {
    email: payload.customer.email,
    phone: payload.customer.phone || undefined,
    shippingAddress,
    lineItems: payload.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      ...(item.properties.length ? { customAttributes: item.properties } : {}),
    })),
    tags: ['Unquoted', idempotencyTag],
    customAttributes: [
      { key: 'Quotation reference', value: payload.quoteReference },
      { key: 'Delivery address type', value: payload.delivery.addressType },
      { key: 'Liftgate required', value: payload.delivery.liftgateRequired ? 'Yes' : 'No' },
      { key: 'Insurance options requested', value: payload.delivery.insuranceRequested ? 'Yes' : 'No' },
    ],
    note,
    acceptAutomaticDiscounts: true,
    allowDiscountCodesInCheckout: true,
    ...(payload.discountCodes.length ? { discountCodes: payload.discountCodes } : {}),
  };
}

module.exports = {
  API_VERSION,
  APP_PROXY_MAX_AGE_SECONDS,
  MAX_BODY_BYTES,
  QuoteRequestError,
  appProxyMessage,
  buildDraftOrderInput,
  idempotencyIdentity,
  payloadHash,
  validatePayload,
  verifyAppProxyUrl,
  verifyVariantNodes,
};
