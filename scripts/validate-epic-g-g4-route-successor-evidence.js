'use strict';

const assert = require('node:assert/strict');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const E = require('./lib/epic-e-owner-response-adapter');

const EVIDENCE = 'data/epic-g-g4-route-successor-evidence.json';
const INTEGRATION = '64ddfaadbcea98175940fd54d9cf198c443e39c3';
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const read = (file) => fs.readFileSync(file, 'utf8');
const git = (...args) => cp.execFileSync('git', args, { encoding: 'utf8' }).trim();

function validate() {
  const evidence = JSON.parse(read(EVIDENCE));
  assert.equal(evidence.schemaVersion, 1);
  assert.equal(evidence.identity, 'EPIC_G_G4_ROUTE_SUCCESSOR_REPOSITORY_BINDING_2026_11_08');
  assert.equal(evidence.scope, 'REPOSITORY_ONLY_PREVIEW_PREFLIGHT');
  assert.equal(evidence.integrationCommit, INTEGRATION);
  assert.equal(git('rev-parse', 'HEAD'), INTEGRATION);
  assert.equal(evidence.shopifyObservation, 'NOT_PERFORMED_IN_THIS_BATCH');
  assert.equal(evidence.shopifyMutations, 0);
  assert.equal(evidence.publicationChanges, 0);

  const expectedSeals = new Map([
    ['data/epic-g-machine-routes.json', '7154d499d10437ff199309787f223e65ed42fb7096e0e1ab42bd52f6ea2388cb'],
    ['data/epic-g-catalog-release.json', '910d0d64535d79cefb5210515d0f47988e49a7cf4e8cb5ee7a74c7a5d2d20624'],
    ['docs/architecture/epic-g-catalog-index-contract.md', '3ebb9a68899f525bb4f643cf338ef15bf9c97ebf670ff27094b495f7474306bb'],
  ]);
  for (const seal of evidence.historicalSeals) {
    assert.equal(seal.sha256, expectedSeals.get(seal.path), `${seal.path}: unexpected historical seal`);
    assert.equal(hash(seal.path), seal.sha256, `${seal.path}: historical artifact changed`);
  }

  const machine = JSON.parse(read('data/epic-g-machine-routes.json'));
  const catalog = JSON.parse(read('data/epic-g-catalog-release.json'));
  assert.equal(E.digest(machine.routes), evidence.historicalSeals[0].semanticSha256);
  assert.equal(E.digest({ products: catalog.products, roles: catalog.roles, pages: catalog.pages, machines: catalog.machines }), evidence.historicalSeals[1].semanticSha256);
  assert.equal(machine.sourceBindingSha256, evidence.authority.sourceBindingSha256);
  assert.equal(catalog.sourceBindingSha256, evidence.authority.sourceBindingSha256);
  assert(Date.now() > Date.parse(machine.expiresAt), 'Historical G3A receipt unexpectedly current');
  assert(Date.now() > Date.parse(catalog.expiresAt), 'Historical G3B receipt unexpectedly current');
  assert.equal(evidence.authority.renewed, false);
  assert.equal(evidence.authority.currentStatus, 'EXPIRED_FAILS_CLOSED');
  assert.equal(hash(evidence.authority.catalogAuthorityPath), evidence.authority.catalogAuthoritySha256);

  const historicalNavigation = machine.provenance.find(({ path }) => path === 'data/navigation-spec.json');
  assert(historicalNavigation);
  assert.equal(historicalNavigation.sha256, evidence.historicalSeals[0].historicalNavigationSpecSha256);
  assert.notEqual(hash('data/navigation-spec.json'), historicalNavigation.sha256, 'Successor must not masquerade as the historical navigation register');

  for (const binding of evidence.bindings) {
    assert.equal(hash(binding.path), binding.sha256, `${binding.path}: successor binding drift`);
    assert.equal(cp.spawnSync('git', ['diff', '--quiet', INTEGRATION, '--', binding.path]).status, 0, `${binding.path}: runtime differs from committed integration`);
  }

  assert.deepEqual(evidence.successorRoutes.map(({ route }) => route), [
    '/collections/all',
    '/collections/all?view=directory',
    '/collections/all?sort_by=price-ascending',
    '/collections/machines',
  ]);
  for (const route of evidence.successorRoutes) assert.match(route.currentShopifyStatus, /NOT_REOBSERVED|REVERIFICATION_REQUIRED/);

  const section = read('sections/main-collection-product-grid.liquid');
  assert(!section.includes('rhino_g_index'));
  for (const token of ["render 'card-product'", "render 'facets'", 'collection.sort_options', 'paginate collection.products by section.settings.products_per_page']) assert(section.includes(token));
  assert.equal(section.split('cart-feedback-toast.js').length - 1, 1);
  assert.equal(section.split("render 'cart-feedback-toast'").length - 1, 1);
  assert(read('sections/rhino-g-catalog-directory.liquid').includes("render 'rhino-g-catalog-index'"));
  assert(read('templates/collection.directory.json').includes('rhino-g-catalog-directory'));
  const navigation = read('sections/rhino-g-catalog-navigation.liquid');
  assert(navigation.includes('routes.collections_url }}/machines'));
  for (const forbidden of ['/collections/replacement-parts', '/collections/consumables', '/collections/accessories']) assert(!navigation.includes(forbidden));

  return {
    identity: evidence.identity,
    integrationCommit: INTEGRATION,
    historicalArtifactsSealed: evidence.historicalSeals.length,
    successorRoutes: evidence.successorRoutes.length,
    repositoryBindings: evidence.bindings.length,
    ShopifyObservations: 0,
    ShopifyMutations: 0,
    authorityRenewed: false,
  };
}

if (require.main === module) {
  try {
    console.log(JSON.stringify(validate()));
  } catch (error) {
    console.error(error.stack);
    process.exitCode = 1;
  }
}

module.exports = { EVIDENCE, validate };
