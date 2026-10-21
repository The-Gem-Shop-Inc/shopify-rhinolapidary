'use strict';
const release = require('../../data/epic-f-consumer-release.json');
const { validateRenderedText } = require('../validate-brand-claims');
const fixtureAsset = /^urn:rhino:fixture:media:[a-z0-9-]+$/;
const fixtureId = /^fixture-[a-z0-9-]+$/;
const approved = v => v?.state === 'approved' && /^fixture:[a-z0-9-]+$/.test(v.reference || '');
function evaluateMedia(input, now = '2026-09-17T00:00:00Z') {
  if (input?.fixtureOnly !== true || !Array.isArray(input.items)) return { eligible: [], rejected: [{ reason: 'fixture-contract-required' }] };
  const eligible = [], rejected = [];
  for (const item of input.items) {
    if (!item || typeof item !== 'object') { rejected.push({ reasons: ['malformed-item'] }); continue; }
    const reasons = [];
    if (!fixtureAsset.test(item.assetIdentity || '') || !fixtureId.test(item.mediaId || '') || !/^\/fixture-media\/[a-z0-9-]+\.svg$/.test(item.source || '')) reasons.push('non-fixture-asset');
    if (!release.routes.some(r => r.productGid === item.productGid && r.productClass === 'machine') || item.productGid !== input.productGid) reasons.push('wrong-product');
    if (item.modelProductGid !== item.productGid || !approved(item.exactModelUse)) reasons.push('exact-model-use');
    if (!approved(item.rightsUse)) reasons.push('rights-use');
    if (!approved(item.altApproval) || typeof item.alt !== 'string' || !item.alt.trim() || item.alt.length > 300 || /[<>{}\r\n]/.test(item.alt)) reasons.push('alt-approval');
    if (!approved(item.embeddedClaims)) reasons.push('embedded-claim-review');
    if (validateRenderedText('media-alt', typeof item.alt === 'string' ? item.alt : '').length) reasons.push('unsupported-alt-claim');
    if (input.productState !== 'published' || item.audience !== 'customer' || !approved(item.publication)) reasons.push('publication');
    if (item.lifecycle !== 'current' || !Array.isArray(input.existingAssets) || !input.existingAssets.includes(item.assetIdentity) || !Number.isFinite(Date.parse(item.expiresAt)) || Date.parse(item.expiresAt) <= Date.parse(now)) reasons.push('lifecycle');
    if (item.purpose !== 'product-inspection' || !['image', 'external_video'].includes(item.type)) reasons.push('unsupported-purpose-or-type');
    if (!Number.isInteger(item.width) || item.width <= 0 || !Number.isInteger(item.height) || item.height <= 0) reasons.push('dimensions');
    if (input.items.filter(other => other && (other.assetIdentity === item.assetIdentity || other.mediaId === item.mediaId)).length > 1) reasons.push('duplicate-asset');
    if (item.observedProductGids && (!Array.isArray(item.observedProductGids) || (item.observedProductGids.some(gid => gid !== item.productGid) && !approved(item.sharedUse)))) reasons.push('shared-asset-use');
    if (reasons.length) rejected.push({ assetIdentity: item.assetIdentity, reasons });
    else eligible.push(item);
  }
  return { eligible, rejected };
}
function fixtureLiquid(input) {
  // Deliberately never writes to snippets/. Synthetic media IDs cannot identify a
  // Shopify asset. A real release compiler is outside 004A and fails closed.
  if (input?.fixtureOnly !== true || !Array.isArray(input.items) || input.items.some(i => !i || !fixtureAsset.test(i.assetIdentity || '') || !fixtureId.test(i.mediaId || ''))) throw new Error('Cannot compile real media activation');
  const { eligible } = evaluateMedia(input);
  const quote = value => "'" + value.replaceAll("'", '&#39;') + "'";
  return eligible.map(item => `{% if request.host == 'machine.local' and product.id == ${quote(item.productGid.split('/').pop())} and media.id == ${quote(item.mediaId)} and media.alt == ${quote(item.alt)} and media.preview_image.alt == ${quote(item.alt)} and media.preview_image.src == ${quote(item.source)} %}eligible{% endif %}`).join('');
}
module.exports = { evaluateMedia, fixtureLiquid };
