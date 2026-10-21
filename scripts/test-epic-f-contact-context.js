'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { validateContext } = require('./lib/epic-f-contact-context');
const identity = require('../data/epic-e-product-identity.json');
const release = require('../data/epic-f-consumer-release.json');
let positive = 0, negative = 0;
for (const r of release.routes.filter(r => r.productClass === 'machine')) {
  const p = identity.productIdentities.find(p => p.productGid === r.productGid);
  const v = identity.variantIdentities.find(v => v.productGid === r.productGid);
  const valid = { productGid: p.productGid, productRoute: '/products/' + p.handle, variantGid: v.variantGid };
  assert.deepEqual(validateContext(valid), valid); positive++;
  const { variantGid, ...withoutVariant } = valid;
  assert.deepEqual(validateContext(withoutVariant), withoutVariant); positive++;
  for (const bad of [null, [], 'customer text', { ...valid, productGid: 'gid://shopify/Product/1' },
    { ...valid, variantGid: 'gid://shopify/ProductVariant/1' },
    { ...valid, variantGid: identity.variantIdentities.find(v => v.productGid !== p.productGid).variantGid },
    ...['https://evil.invalid', '//evil.invalid', '/pages/contact', valid.productRoute + '?redirect=https://evil.invalid', valid.productRoute + '#x', '/products/%2e%2e', valid.productRoute + '\n', '<script>', '/products/another'].map(productRoute => ({ ...valid, productRoute })),
    ...['email', 'message', 'redirect', 'return_to', 'price', 'available', 'compatibility', '__proto__'].map(key => JSON.parse(JSON.stringify(valid).replace(/}$/, `,"${key}":"customer data"}`))),
    { ...valid, productGid: [p.productGid] }, { ...valid, productGid: p.productGid + '" onclick="alert(1)' }, { ...valid, variantGid: null }]) {
    assert.throws(() => validateContext(bad)); negative++;
  }
}
for (const dir of ['assets', 'sections', 'snippets', 'layout', 'templates']) for (const file of fs.readdirSync(dir)) {
  if (!/\.(js|liquid|json)$/.test(file)) continue;
  assert(!fs.readFileSync(`${dir}/${file}`, 'utf8').includes('epic-f-contact-context'), 'Adapter must remain dormant');
}
console.log(`Dormant Contact context: ${positive} valid cases; ${negative} security negatives rejected. No submitted context or intake activated.`);
