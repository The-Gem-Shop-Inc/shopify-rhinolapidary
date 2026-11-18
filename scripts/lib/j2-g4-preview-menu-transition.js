'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const EXPECTED = Object.freeze({
  shopGid: 'gid://shopify/Shop/79279947973',
  menuGid: 'gid://shopify/Menu/257402405061',
  menuHandle: 'preview-primary-navigation-menu',
  previewThemeGid: 'gid://shopify/OnlineStoreTheme/158631198917',
  previewThemeId: '158631198917',
  productionThemeGid: 'gid://shopify/OnlineStoreTheme/158579622085',
  productionMenuHandle: 'main-menu',
});

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function identityDigest(tree) {
  return sha256(Buffer.from(canonicalJson(tree), 'utf8'));
}

function semanticTree(tree) {
  return tree.map((item) => {
    const normalized = {
      title: item.title,
      type: item.type,
      url: item.url ?? null,
      resourceId: item.resourceId ?? null,
      tags: item.tags || [],
      items: semanticTree(item.items || []),
    };
    return normalized;
  });
}

function semanticDigest(tree) {
  return sha256(Buffer.from(canonicalJson(semanticTree(tree)), 'utf8'));
}

function transitionDigest(document) {
  return sha256(Buffer.from(canonicalJson({
    schemaVersion: document.schemaVersion,
    transitionId: document.transitionId,
    apiVersion: document.api.apiVersion,
    mutation: document.api.mutation,
    shopGid: document.shop.gid,
    menuGid: document.target.previewMenu.gid,
    previewThemeGid: document.target.previewTheme.gid,
    productionMenuHandle: document.target.protectedProductionMenu.handle,
    predecessorIdentityDigest: identityDigest(document.predecessor.tree),
    proposedSemanticDigest: semanticDigest(document.recommendation.approvedProposedTree),
  }), 'utf8'));
}

function rollbackAuthorizationDigest(document) {
  return sha256(Buffer.from(`${transitionDigest(document)}\0${identityDigest(document.rollback.tree)}\n`, 'utf8'));
}

function walk(items, visitor, depth = 1) {
  for (const item of items) {
    visitor(item, depth);
    walk(item.items || [], visitor, depth + 1);
  }
}

function normalizeDestination(url) {
  if (!url) return null;
  const parsed = new URL(url, 'https://sz5dnk-nf.myshopify.com');
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

function isExactAllProducts(url) {
  return normalizeDestination(url) === '/collections/all';
}

function countExactAllProducts(items) {
  let count = 0;
  walk(items, (item) => { if (isExactAllProducts(item.url)) count += 1; });
  return count;
}

function findItem(items, title) {
  let found = null;
  walk(items, (item) => { if (item.title === title) found = item; });
  return found;
}

function menuUpdateItem(item) {
  const result = {};
  if (item.id) result.id = item.id;
  result.title = item.title;
  result.type = item.type;
  if (item.url !== null && item.url !== undefined) result.url = item.url;
  if (item.resourceId !== null && item.resourceId !== undefined) result.resourceId = item.resourceId;
  result.tags = item.tags || [];
  result.items = (item.items || []).map(menuUpdateItem);
  return result;
}

function menuUpdateVariables(document, tree) {
  return {
    id: document.target.previewMenu.gid,
    title: document.target.previewMenu.title,
    handle: document.target.previewMenu.handle,
    items: tree.map(menuUpdateItem),
  };
}

function assertTreeDepth(tree) {
  walk(tree, (_item, depth) => assert(depth <= 3, `Shopify menus support at most three levels; found level ${depth}`));
}

function assertUniqueDestinations(tree) {
  const destinations = new Map();
  walk(tree, (item) => {
    const destination = normalizeDestination(item.url);
    if (!destination) return;
    assert(!destinations.has(destination), `Duplicate menu destination ${destination}: ${destinations.get(destination)} and ${item.title}`);
    destinations.set(destination, item.title);
  });
}

function validateDocument(document) {
  assert.equal(document.schemaVersion, 1);
  assert.equal(document.shop.gid, EXPECTED.shopGid);
  assert.equal(document.target.previewMenu.gid, EXPECTED.menuGid);
  assert.equal(document.target.previewMenu.handle, EXPECTED.menuHandle);
  assert.equal(document.target.previewTheme.gid, EXPECTED.previewThemeGid);
  assert.equal(document.target.previewTheme.numericId, EXPECTED.previewThemeId);
  assert.equal(document.target.previewTheme.requiredRole, 'UNPUBLISHED');
  assert.equal(document.target.previewTheme.assignedMenuHandle, EXPECTED.menuHandle);
  assert.equal(document.target.protectedProductionTheme.gid, EXPECTED.productionThemeGid);
  assert.equal(document.target.protectedProductionTheme.requiredRole, 'MAIN');
  assert.equal(document.target.protectedProductionMenu.handle, EXPECTED.productionMenuHandle);
  assert.equal(document.target.productionMutationAllowed, false);
  assert.equal(document.mutationAuthorized, false);
  assert.equal(document.api.apiVersion, '2026-07');
  assert.equal(document.api.mutation, 'menuUpdate');
  assert.equal(document.api.requiredScope, 'write_online_store_navigation');
  assert(document.evidence.freshnessLimitMinutes > 0);

  assertTreeDepth(document.predecessor.tree);
  assertTreeDepth(document.recommendation.approvedProposedTree);
  assertTreeDepth(document.rollback.tree);
  assert.deepEqual(document.rollback.tree, document.predecessor.tree, 'Rollback must restore the exact captured predecessor');
  assertUniqueDestinations(document.recommendation.approvedProposedTree);
  assert.equal(countExactAllProducts(document.recommendation.approvedProposedTree), 1, 'Approved menu must contain exactly one exact /collections/all link');

  const catalog = findItem(document.recommendation.approvedProposedTree, 'Catalog');
  assert(catalog, 'Approved menu is missing Catalog');
  assert.deepEqual(catalog.items.map(({ title }) => title), ['All Products', 'Machines', 'Saws', 'Laps', 'Shaping']);
  const machines = findItem(catalog.items, 'Machines');
  assert(machines, 'Approved menu is missing Machines');
  assert.deepEqual(machines.items, [], 'Machines must remain a direct mobile navigation link');

  const blockedLabels = ['Replacement Parts', 'Consumables', 'Accessories'];
  for (const label of blockedLabels) {
    assert.equal(findItem(document.recommendation.approvedProposedTree, label), null, `${label} must remain outside the approved mutation`);
    const authority = document.categoryAuthority.find((entry) => entry.label === label);
    assert(authority, `Missing authority record for ${label}`);
    assert.equal(authority.menuEligible, false);
    assert.equal(authority.meaningfulCategorizedContent, false);
    assert.equal(authority.authorityState, 'EXPIRED_FAIL_CLOSED_NEUTRAL_DIRECTORY');
  }

  assert.equal(document.digests.predecessorTreeIdentitySha256, identityDigest(document.predecessor.tree));
  assert.equal(document.digests.proposedTreeSemanticSha256, semanticDigest(document.recommendation.approvedProposedTree));
  assert.equal(document.digests.transitionSha256, transitionDigest(document));
  assert.equal(document.authorization.futureApplyAuthorizationValue, `J2G4-PHASE-D-PREVIEW-MENU-APPLY-${document.digests.transitionSha256}`);
  assert.equal(document.rollback.futureAuthorizationValue, `J2G4-PHASE-D-PREVIEW-MENU-ROLLBACK-${rollbackAuthorizationDigest(document)}`);
  return document;
}

function validateLiveEvidence(document, evidence, expectedState) {
  assert.equal(evidence.readOnly, true);
  assert.equal(evidence.shopifyMutations, 0);
  assert.equal(evidence.shop.id, EXPECTED.shopGid);
  assert.equal(evidence.shop.myshopifyDomain, document.shop.myshopifyDomain);
  assert.equal(evidence.previewTheme.id, EXPECTED.previewThemeGid);
  assert.equal(evidence.previewTheme.role, 'UNPUBLISHED');
  assert.equal(evidence.productionTheme.id, EXPECTED.productionThemeGid);
  assert.equal(evidence.productionTheme.role, 'MAIN');
  assert.equal(evidence.previewMenu.id, EXPECTED.menuGid);
  assert.equal(evidence.previewMenu.handle, EXPECTED.menuHandle);
  assert.equal(evidence.previewThemeAssignment.menuHandle, EXPECTED.menuHandle);
  assert.equal(evidence.previewThemeAssignment.menuTypeDesktop, 'mega');
  assert.equal(evidence.previewThemeAssignment.checksumMd5, document.evidence.previewHeaderGroupMd5);
  assert.equal(evidence.productionMenu.id, document.target.protectedProductionMenu.gid);
  assert.equal(evidence.productionMenu.handle, EXPECTED.productionMenuHandle);
  assert.equal(evidence.publishedLocales.length, 1);
  assert.equal(evidence.publishedLocales[0].locale, 'en');
  assert.equal(evidence.publishedLocales[0].published, true);

  const requiredCollections = new Map(document.destinationResources.map((entry) => [entry.gid, entry]));
  for (const collection of evidence.collections) {
    const required = requiredCollections.get(collection.id);
    if (!required) continue;
    assert.equal(collection.handle, required.handle);
  }
  assert.equal(evidence.collections.filter(({ id }) => requiredCollections.has(id)).length, requiredCollections.size);
  for (const route of document.recommendation.requiredRouteChecks) {
    const observed = evidence.routeChecks.find((entry) => entry.route === route);
    assert(observed, `Missing route evidence for ${route}`);
    assert.equal(observed.status, 200, `${route} did not return 200`);
    assert.equal(observed.previewThemeId, EXPECTED.previewThemeId, `${route} used the wrong theme`);
    assert.equal(observed.photographic, true, `${route} is not photographic`);
  }
  for (const authority of document.categoryAuthority) {
    const observed = evidence.categoryAuthorityChecks.find((entry) => entry.label === authority.label);
    assert(observed, `Missing live authority evidence for ${authority.label}`);
    assert.equal(observed.route, authority.route);
    assert.equal(observed.status, 200);
    assert.equal(observed.previewThemeId, EXPECTED.previewThemeId);
    assert.equal(observed.governed, false);
    assert.equal(observed.categorizedSectionCount, 0);
    assert(observed.productLinkCount > 0);
    assert.equal(observed.meaningfulCategorizedContent, false);
  }
  for (const surface of ['desktop', 'mobile']) {
    const suppression = evidence.duplicateSuppressionCurrentMenu[surface];
    assert(suppression, `Missing ${surface} duplicate-suppression evidence`);
    assert.equal(suppression.exactAllProductsCount, 1);
    assert.equal(suppression.injected, true);
  }

  if (expectedState === 'predecessor') {
    assert.equal(identityDigest(evidence.previewMenu.items), document.digests.predecessorTreeIdentitySha256, 'Live predecessor identity digest drift');
  } else if (expectedState === 'proposed') {
    assert.equal(semanticDigest(evidence.previewMenu.items), document.digests.proposedTreeSemanticSha256, 'Live proposed semantic digest drift');
    assert.equal(countExactAllProducts(evidence.previewMenu.items), 1);
  } else {
    throw new Error(`Unknown expected state ${expectedState}`);
  }
  return evidence;
}

module.exports = {
  EXPECTED,
  canonicalJson,
  countExactAllProducts,
  identityDigest,
  menuUpdateVariables,
  normalizeDestination,
  rollbackAuthorizationDigest,
  semanticDigest,
  transitionDigest,
  validateDocument,
  validateLiveEvidence,
};
