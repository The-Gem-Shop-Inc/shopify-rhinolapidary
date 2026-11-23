'use strict';

const crypto = require('node:crypto');

class Policy2DomainError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
  }
}

class AuthorizationError extends Policy2DomainError {}
class ConflictError extends Policy2DomainError {}
class ValidationError extends Policy2DomainError {}
class TransitionError extends Policy2DomainError {}
class ActivationError extends Policy2DomainError {}

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.freeze(value);
  for (const child of Object.values(value)) deepFreeze(child);
  return value;
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function requireValue(condition, code, message, details) {
  if (!condition) throw new ValidationError(code, message, details);
}

function requireAuthorization(authorize, actor, permission, resource) {
  if (!actor || typeof actor.actorId !== 'string' || !authorize(actor, permission, resource)) {
    throw new AuthorizationError('AUTHORIZATION_REQUIRED', `Permission ${permission} is required`, {
      permission,
    });
  }
}

function createOpaqueIdentifier(bytes = 16, prefix = '') {
  requireValue(Number.isInteger(bytes) && bytes >= 16, 'INSUFFICIENT_IDENTIFIER_ENTROPY', 'Opaque identifiers require at least 16 random bytes');
  return `${prefix}${crypto.randomBytes(bytes).toString('base64url')}`;
}

function validateProductGid(value) {
  requireValue(/^gid:\/\/shopify\/Product\/\d+$/.test(value || ''), 'INVALID_PRODUCT_GID', 'A canonical Shopify Product GID is required');
}

function validateVariantGid(value) {
  requireValue(/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(value || ''), 'INVALID_VARIANT_GID', 'A canonical Shopify ProductVariant GID is required');
}

class ExactProductVariantCatalog {
  constructor(entries = []) {
    this.relationships = new Map();
    for (const entry of entries) this.add(entry.productGid, entry.variantGid);
  }

  add(productGid, variantGid) {
    validateProductGid(productGid);
    validateVariantGid(variantGid);
    if (!this.relationships.has(productGid)) this.relationships.set(productGid, new Set());
    this.relationships.get(productGid).add(variantGid);
  }

  assertRelationship(productGid, variantGid) {
    validateProductGid(productGid);
    validateVariantGid(variantGid);
    requireValue(this.relationships.get(productGid)?.has(variantGid), 'INVALID_PRODUCT_VARIANT_RELATIONSHIP', 'Variant is not registered to the exact Product identity', {
      productGid,
      variantGid,
    });
  }

  hasRelationship(productGid, variantGid) {
    return this.relationships.get(productGid)?.has(variantGid) === true;
  }
}

class DisabledOperationalActivationGate {
  constructor(blockers = []) {
    this.status = 'BLOCKED';
    this.blockers = [...blockers];
  }

  assertPermitted() {
    throw new ActivationError('CUSTOMER_ACTIVATION_DISABLED', 'B01 is synthetic-only and cannot activate customer services', {
      blockers: [...this.blockers],
    });
  }

  snapshot() {
    return { status: this.status, customerActivationPermitted: false, blockers: [...this.blockers] };
  }
}

module.exports = {
  ActivationError,
  AuthorizationError,
  ConflictError,
  DisabledOperationalActivationGate,
  ExactProductVariantCatalog,
  Policy2DomainError,
  TransitionError,
  ValidationError,
  clone,
  createOpaqueIdentifier,
  deepFreeze,
  requireAuthorization,
  requireValue,
  stableStringify,
  validateProductGid,
  validateVariantGid,
};
