'use strict';

const assert = require('node:assert/strict');
const E = require('./lib/epic-e-owner-response-adapter');
const { createRepository } = require('./lib/j2-g4-validator-repository');

const EVIDENCE = 'data/epic-g-g4-route-successor-evidence.json';
const INTEGRATION = '64ddfaadbcea98175940fd54d9cf198c443e39c3';
const BRANCH = 'integration/catalog-cart-preview';
const FOUNDATION = '414288a16fe7123b06c3433f0063ba402fc35e83';
const J2 = '0edacc2799be0be8592b424799e2af2be5a1a165';
const G4 = 'a53daec8ffbbbdcd6c5acba1da7770fa23ec3a12';

function validate({ repository = createRepository() } = {}) {
  assert.equal(repository.git('branch', '--show-current'), BRANCH, 'Wrong integration branch');
  assert(repository.commitExists(INTEGRATION), 'Immutable runtime integration commit is missing');
  assert(repository.isAncestor(INTEGRATION, 'HEAD'), 'Current branch does not descend from the immutable runtime integration commit');

  const evidence = JSON.parse(repository.read(EVIDENCE));
  assert.equal(evidence.schemaVersion, 1);
  assert.equal(evidence.identity, 'EPIC_G_G4_ROUTE_SUCCESSOR_REPOSITORY_BINDING_2026_11_08');
  assert.equal(evidence.scope, 'REPOSITORY_ONLY_PREVIEW_PREFLIGHT');
  assert.equal(evidence.integrationCommit, INTEGRATION);
  assert.equal(evidence.foundationCommit, FOUNDATION);
  assert.equal(evidence.j2Commit, J2);
  assert.equal(evidence.g4SourceCommit, G4);
  assert.equal(evidence.shopifyObservation, 'NOT_PERFORMED_IN_THIS_BATCH');
  assert.equal(evidence.shopifyMutations, 0);
  assert.equal(evidence.publicationChanges, 0);

  const expectedSeals = new Map([
    ['data/epic-g-machine-routes.json', '7154d499d10437ff199309787f223e65ed42fb7096e0e1ab42bd52f6ea2388cb'],
    ['data/epic-g-catalog-release.json', '910d0d64535d79cefb5210515d0f47988e49a7cf4e8cb5ee7a74c7a5d2d20624'],
    ['docs/architecture/epic-g-catalog-index-contract.md', '3ebb9a68899f525bb4f643cf338ef15bf9c97ebf670ff27094b495f7474306bb'],
  ]);
  assert.deepEqual(evidence.historicalSeals.map(({ path }) => path), [...expectedSeals.keys()], 'Historical receipt set changed');
  for (const seal of evidence.historicalSeals) {
    assert(repository.exists(seal.path), `${seal.path}: historical artifact missing`);
    assert.equal(seal.sha256, expectedSeals.get(seal.path), `${seal.path}: unexpected historical seal`);
    assert.equal(repository.hash(seal.path), seal.sha256, `${seal.path}: historical artifact changed`);
  }

  const machine = JSON.parse(repository.read('data/epic-g-machine-routes.json'));
  const catalog = JSON.parse(repository.read('data/epic-g-catalog-release.json'));
  assert.equal(E.digest(machine.routes), evidence.historicalSeals[0].semanticSha256);
  assert.equal(E.digest({ products: catalog.products, roles: catalog.roles, pages: catalog.pages, machines: catalog.machines }), evidence.historicalSeals[1].semanticSha256);
  assert.equal(machine.sourceBindingSha256, evidence.authority.sourceBindingSha256);
  assert.equal(catalog.sourceBindingSha256, evidence.authority.sourceBindingSha256);
  assert.equal(machine.expiresAt, evidence.historicalSeals[0].expiresAt);
  assert.equal(catalog.expiresAt, evidence.historicalSeals[1].expiresAt);
  assert(repository.now() > Date.parse(machine.expiresAt), 'Historical G3A receipt unexpectedly current');
  assert(repository.now() > Date.parse(catalog.expiresAt), 'Historical G3B receipt unexpectedly current');
  assert.equal(evidence.authority.renewed, false);
  assert.equal(evidence.authority.currentStatus, 'EXPIRED_FAILS_CLOSED');
  assert.equal(repository.hash(evidence.authority.catalogAuthorityPath), evidence.authority.catalogAuthoritySha256);

  const productReleasePath = 'data/epic-g-product-release.json';
  assert(repository.exists(productReleasePath), 'G2 presentation receipt missing');
  assert(repository.diffQuiet(INTEGRATION, productReleasePath), 'G2 presentation receipt differs from committed integration');
  const productRelease = JSON.parse(repository.read(productReleasePath));
  assert.equal(productRelease.fixtureOnly, false);
  assert(repository.now() > Date.parse(productRelease.expiresAt), 'G2 presentation authority must remain expired');
  assert(repository.diffQuiet(INTEGRATION, 'snippets/rhino-g-product-fit.liquid'), 'G2 fail-closed presentation changed');

  const historicalNavigation = machine.provenance.find(({ path }) => path === 'data/navigation-spec.json');
  assert(historicalNavigation);
  assert.equal(historicalNavigation.sha256, evidence.historicalSeals[0].historicalNavigationSpecSha256);
  assert.notEqual(repository.hash('data/navigation-spec.json'), historicalNavigation.sha256, 'Successor must not masquerade as the historical navigation register');

  const expectedBindings = [
    'data/epic-g-g4-catalog-navigation.json',
    'data/navigation-spec.json',
    'data/global-navigation-ia.json',
    'sections/main-collection-product-grid.liquid',
    'templates/collection.json',
    'templates/collection.directory.json',
    'sections/rhino-g-catalog-directory.liquid',
    'sections/rhino-g-catalog-navigation.liquid',
    'snippets/rhino-g-catalog-index.liquid',
  ];
  assert.deepEqual(evidence.bindings.map(({ path }) => path), expectedBindings, 'Successor binding set changed');
  for (const binding of evidence.bindings) {
    assert.equal(repository.hash(binding.path), binding.sha256, `${binding.path}: successor binding drift`);
    assert(repository.diffQuiet(INTEGRATION, binding.path), `${binding.path}: runtime differs from committed integration`);
  }

  assert.deepEqual(evidence.successorRoutes.map(({ route }) => route), [
    '/collections/all',
    '/collections/all?view=directory',
    '/collections/all?sort_by=price-ascending',
    '/collections/machines',
  ]);
  for (const route of evidence.successorRoutes) assert.match(route.currentShopifyStatus, /NOT_REOBSERVED|REVERIFICATION_REQUIRED/);
  assert(evidence.retainedAuthorityAssertions.some((claim) => /never inferred/.test(claim)), 'No-inference authority claim missing');
  assert(evidence.retainedAuthorityAssertions.some((claim) => /fails closed/.test(claim)), 'Fail-closed authority claim missing');
  assert(evidence.retainedAuthorityAssertions.some((claim) => /not renewed/.test(claim)), 'Historical non-renewal claim missing');
  assert(evidence.retainedAuthorityAssertions.some((claim) => /No source receipt, Product classification, compatibility edge/.test(claim)), 'No-false-compatibility claim missing');

  const section = repository.read('sections/main-collection-product-grid.liquid');
  assert(!section.includes('rhino_g_index'));
  for (const token of ["render 'card-product'", "render 'facets'", 'collection.sort_options', 'paginate collection.products by section.settings.products_per_page']) assert(section.includes(token));
  assert.equal(section.split('cart-feedback-toast.js').length - 1, 1);
  assert.equal(section.split("render 'cart-feedback-toast'").length - 1, 1);
  assert(repository.read('sections/rhino-g-catalog-directory.liquid').includes("render 'rhino-g-catalog-index'"));
  assert(repository.read('templates/collection.directory.json').includes('rhino-g-catalog-directory'));
  const navigation = repository.read('sections/rhino-g-catalog-navigation.liquid');
  assert(navigation.includes('routes.collections_url }}/machines'));
  for (const forbidden of ['/collections/replacement-parts', '/collections/consumables', '/collections/accessories']) assert(!navigation.includes(forbidden));

  return {
    identity: evidence.identity,
    head: repository.git('rev-parse', 'HEAD'),
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

module.exports = { BRANCH, EVIDENCE, FOUNDATION, G4, INTEGRATION, J2, createRepository, validate };
