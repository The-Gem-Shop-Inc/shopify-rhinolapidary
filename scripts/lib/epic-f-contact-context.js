'use strict';
// Dormant repository contract. Never imported by storefront assets or Contact.
const identity = require('../../data/epic-e-product-identity.json');
const release = require('../../data/epic-f-consumer-release.json');
function validateContext(input) {
  if (!input || Object.getPrototypeOf(input) !== Object.prototype) throw new Error('Object required');
  const keys = Reflect.ownKeys(input);
  if (keys.some(k => !['productGid', 'variantGid', 'productRoute'].includes(k))) throw new Error('Unknown context key');
  if (keys.some(k => typeof input[k] !== 'string')) throw new Error('String values required');
  const { productGid, variantGid, productRoute } = input;
  if (!/^gid:\/\/shopify\/Product\/[1-9]\d*$/.test(productGid || '')) throw new Error('Invalid Product GID');
  if (!release.routes.some(r => r.productGid === productGid && r.productClass === 'machine')) throw new Error('Unknown governed machine');
  const product = identity.productIdentities.find(p => p.productGid === productGid);
  if (!product || !/^\/products\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(productRoute || '') || productRoute !== `/products/${product.handle}`) throw new Error('Invalid Product route');
  if (variantGid !== undefined && (!/^gid:\/\/shopify\/ProductVariant\/[1-9]\d*$/.test(variantGid) ||
    !identity.variantIdentities.some(v => v.variantGid === variantGid && v.productGid === productGid))) throw new Error('Unknown or mismatched Variant');
  return Object.freeze({ productGid, ...(variantGid === undefined ? {} : { variantGid }), productRoute });
}
module.exports = { validateContext };
