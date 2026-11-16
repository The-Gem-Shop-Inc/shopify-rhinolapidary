'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const manifest = readJson('data/j2-g4-preview-deployment-manifest.json');
const preparation = readJson('data/j2-g4-preview-deployment-preparation.json');

assert.equal(preparation.schemaVersion, 1);
assert.equal(preparation.identity, 'J2_G4_PREVIEW_DEPLOYMENT_PREPARATION_2026_11_16');
assert.equal(preparation.status, 'PHASE_A_LOCALE_RECONCILED_PLAN_READY_APPLY_NOT_AUTHORIZED');
assert.equal(preparation.authorization.shopifyWrites, false);
assert.equal(preparation.authorization.deploymentExecuted, false);
assert.equal(preparation.authorization.rollbackExecuted, false);
assert.equal(preparation.authorization.menuMutationExecuted, false);
assert.equal(preparation.authorization.collectionMutationExecuted, false);
assert.equal(preparation.authorization.publicationExecuted, false);

assert.equal(preparation.repository.branch, 'integration/catalog-cart-preview');
assert.equal(preparation.repository.immutableRuntimeCommit, manifest.source.integrationCommit);
assert.equal(preparation.repository.immutableRuntimeAncestor, true);
assert.deepEqual(preparation.repository.runtimeDiffAfterImmutableCommit, [{
  path: 'locales/en.default.json',
  jsonPath: 'sections.cart.quote_mode.email_fallback_explanation',
  disposition: 'AUTHORIZED_EXACT_SUCCESSOR_DELTA',
}]);
assert.equal(preparation.repository.validatorRepairCommit, '2040122f2eb9eb428c7cf15dd9d328890d2ac271');

assert.equal(preparation.shopify.shop.id, 'gid://shopify/Shop/79279947973');
assert.equal(preparation.shopify.shop.myshopifyDomain, 'sz5dnk-nf.myshopify.com');
assert.equal(preparation.shopify.previewTheme.id, 'gid://shopify/OnlineStoreTheme/158631198917');
assert.equal(preparation.shopify.previewTheme.role, 'UNPUBLISHED');
assert.equal(preparation.shopify.productionTheme.id, 'gid://shopify/OnlineStoreTheme/158579622085');
assert.equal(preparation.shopify.productionTheme.role, 'MAIN');
assert.equal(preparation.shopify.identityGate, 'PASS');

const comparisons = preparation.runtimePackage.comparisons;
assert.equal(comparisons.length, 17);
assert.equal(new Set(comparisons.map(({ path: file }) => file)).size, 17);
assert.deepEqual(comparisons.map(({ path: file }) => file), manifest.themeFiles.map(({ path: file }) => file));
assert.equal(comparisons.filter(({ operation }) => operation === 'ADDITION').length, 7);
assert.equal(comparisons.filter(({ operation }) => operation === 'REPLACEMENT').length, 10);
assert.equal(comparisons.filter(({ operation }) => operation === 'UNCHANGED').length, 0);
assert.equal(comparisons.filter(({ owner }) => owner === 'J2').length, 8);
assert.equal(comparisons.filter(({ owner }) => owner === 'G4').length, 8);
assert.equal(comparisons.filter(({ owner }) => owner === 'J2+G4').length, 1);

for (const [index, record] of comparisons.entries()) {
  const expected = manifest.themeFiles[index];
  assert.equal(record.candidateSha256, expected.sha256, `${record.path}: preparation/manifest hash mismatch`);
  assert.equal(hash(record.path), record.candidateSha256, `${record.path}: local candidate hash mismatch`);
  assert.equal(fs.statSync(path.join(root, record.path)).size, record.candidateSize, `${record.path}: candidate size mismatch`);
  if (record.remoteExists) {
    assert.equal(record.operation, 'REPLACEMENT');
    assert.match(record.remoteSha256, /^[a-f0-9]{64}$/);
    assert.notEqual(record.remoteSha256, record.candidateSha256, `${record.path}: replacement unexpectedly unchanged`);
  } else {
    assert.equal(record.operation, 'ADDITION');
    assert.equal(record.remoteSize, null);
    assert.equal(record.remoteSha256, null);
  }
}

const dependencies = preparation.runtimePackage.unchangedDependencies;
assert.equal(dependencies.length, 5);
assert.deepEqual(dependencies.map(({ path: file }) => file), manifest.unchangedRuntimeDependencies.map(({ path: file }) => file));
for (const [index, dependency] of dependencies.entries()) {
  assert.equal(dependency.expectedSha256, manifest.unchangedRuntimeDependencies[index].sha256);
  assert.equal(dependency.remoteSha256, dependency.expectedSha256);
  assert.equal(dependency.status, 'MATCH');
}
assert.equal(preparation.runtimePackage.toastInitializationCount, 1);
assert.equal(preparation.runtimePackage.toastMountCount, 1);
assert.equal(preparation.runtimePackage.repositoryOnlyFilesExcluded, true);
assert.equal(preparation.runtimePackage.candidateDigest, manifest.deploymentCandidate.digest);

assert.equal(preparation.rollback.outsideRepository, true);
assert.equal(preparation.rollback.existingBodies, 10);
assert.equal(preparation.rollback.missingMarkers, 7);
assert.equal(preparation.rollback.exactBodySha256Verified, true);
assert.equal(preparation.rollback.status, 'COMPLETE_VALIDATED');

assert.equal(preparation.collections.records.length, 11);
assert.deepEqual(preparation.collections.records.map(({ count }) => count), [11, 6, 2, 4, 49, 11, 18, 24, 0, 0, 0]);
assert(preparation.collections.records.every(({ published }) => published));
assert(preparation.collections.records.every(({ membershipPaginationComplete }) => membershipPaginationComplete));
assert.deepEqual(preparation.collections.missingHandles, ['replacement-parts', 'parts', 'consumables', 'accessories']);

assert.equal(preparation.menu.handle, 'preview-primary-navigation-menu');
assert.equal(preparation.menu.productionHandleExcluded, 'main-menu');
assert.deepEqual(preparation.menu.current[1].children.map(({ title }) => title), ['Saws', 'Laps', 'Shaping']);
assert.deepEqual(preparation.menu.proposed[1].children.map(({ title }) => title), ['All Products', 'Machines', 'Replacement Parts', 'Consumables', 'Accessories']);
assert.equal(preparation.menu.proposed[1].children[1].resourceId, 'gid://shopify/Collection/355080962245');

assert.deepEqual(preparation.localization.publishedLocales, [{ locale: 'en', name: 'English', primary: true, published: true }]);
assert.equal(preparation.localization.toastKeys.length, 7);
assert.equal(preparation.localization.englishToastKeysNonempty, 7);
assert.equal(preparation.localization.remoteLeafCount, 526);
assert.equal(preparation.localization.candidateLeafCount, 533);
assert.equal(preparation.localization.remoteLeavesPreserved, 526);
assert.equal(preparation.localization.remoteValuesModified, 0);
assert.equal(preparation.localization.quoteExplanationRestoredExactly, true);
assert.equal(preparation.localization.themeCheck.errors, 2100);
assert.equal(preparation.localization.themeCheck.matchingTranslations, 2100);
assert.equal(preparation.localization.themeCheck.toastKeyErrors, 210);
assert.equal(preparation.authority.renewed, false);
assert.equal(preparation.authority.g2G3Receipts, 'EXPIRED_FAILS_CLOSED');

const upload = preparation.deploymentTransaction.uploadCommand;
const args = upload.args;
assert.equal(upload.executed, false);
assert.equal(args[0], 'theme');
assert.equal(args[1], 'push');
assert.equal(args[args.indexOf('--store') + 1], 'sz5dnk-nf.myshopify.com');
assert.equal(args[args.indexOf('--theme') + 1], '158631198917');
assert.equal(args[args.indexOf('--path') + 1], 'C:\\rlcc');
assert(args.includes('--nodelete'));
assert(!args.includes('--strict'));
assert(args.includes('--json'));
assert(args.includes('--no-input'));
assert(!args.includes('--live'));
assert(!args.includes('--allow-live'));
assert(!args.includes('--publish'));
assert(!args.includes('--unpublished'));
const only = args.flatMap((value, index) => value === '--only' ? [args[index + 1]] : []);
assert.deepEqual(only, manifest.themeFiles.map(({ path: file }) => file));
assert.equal(preparation.deploymentTransaction.wholeThemeUploadRejected, true);
assert.equal(preparation.deploymentTransaction.remoteDeletionRejected, true);
assert.equal(preparation.deploymentTransaction.exitCodeAloneSufficient, false);
assert.deepEqual(preparation.deploymentTransaction.liveEvidence, {
  storage: 'EXTERNAL_LOCALAPPDATA_ONLY',
  collector: 'scripts/new-j2-g4-preview-live-evidence.ps1',
  adminEvidenceMaximumAgeMinutes: 5,
  planAndApplyMaximumAgeMinutes: 15,
  trackedSnapshotRequired: false,
});
assert(fs.existsSync(path.join(root, preparation.deploymentTransaction.liveEvidence.collector)));
assert(fs.existsSync(path.join(root, 'scripts/test-j2-g4-deployment-authorization.js')));
const exception = readJson('data/j2-g4-preview-theme-check-exception.json');
assert.equal(exception.status, 'PREPARED_REQUIRES_SEPARATE_PRODUCT_OWNER_AUTHORIZATION');
assert.equal(exception.authorized, false);
assert.equal(exception.candidate.digest, manifest.deploymentCandidate.digest);
assert.equal(exception.candidate.localeSha256, manifest.themeFiles.find(({ path: file }) => file === 'locales/en.default.json').sha256);
assert.equal(exception.target.themeId, '158631198917');
assert.equal(exception.target.requiredRole, 'UNPUBLISHED');
assert.equal(exception.themeCheck.status, 'FAIL_RETAINED_NOT_PASSED');
assert.equal(exception.themeCheck.errors, 2100);
assert.equal(hash('data/j2-g4-preview-deployment-manifest.json'), exception.candidate.manifestFileSha256);
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(exception.themeCheck.completeReportPath)).digest('hex'), exception.themeCheck.completeReportSha256);
assert.equal(exception.deploymentScope.mode, 'selective_files_only');
assert.equal(exception.deploymentScope.themeFileCount, 17);
assert.equal(exception.deploymentScope.candidateDigest, manifest.deploymentCandidate.digest);
assert.equal(exception.deploymentScope.nodeleteRequired, true);
assert.equal(exception.deploymentScope.remoteDeletionAllowed, false);
assert.equal(exception.deploymentScope.productionThemeAllowed, false);
const scopeInput = `${exception.deploymentScope.mode}|${exception.deploymentScope.themeFileCount}|${exception.candidate.digest}|nodelete=true|remoteDeletionAllowed=false|productionThemeAllowed=false`;
const scopeDigest = crypto.createHash('sha256').update(scopeInput).digest('hex');
assert.equal(scopeDigest, exception.deploymentScope.digest);
const bindingInput = [
  exception.identity,
  exception.target.shopGid,
  exception.target.themeGid,
  exception.candidate.digest,
  exception.candidate.manifestFileSha256,
  exception.rollback.inventorySha256,
  exception.themeCheck.completeReportSha256,
  scopeDigest,
].join('|');
const bindingDigest = crypto.createHash('sha256').update(bindingInput).digest('hex');
assert.equal(exception.binding.digest, bindingDigest);
assert.equal(exception.binding.authorizationValue, `J2G4-PREVIEW-APPLY-${bindingDigest}`);
assert.equal(preparation.deploymentTransaction.authorizationBinding.value, exception.binding.authorizationValue);
assert.deepEqual(preparation.deploymentTransaction.authorizationBinding.previousValuesInvalidated, exception.binding.invalidatedAuthorizationValues);
assert.equal(preparation.deploymentTransaction.authorizationBinding.nodeleteBound, true);
assert.equal(preparation.deploymentTransaction.authorizationBinding.productionThemeAllowed, false);

assert.deepEqual(preparation.browserAcceptance.widths, [320, 390, 768, 1024, 1440]);
assert.equal(preparation.browserAcceptance.livePreviewStatus, 'NOT_RUN_NO_DEPLOYMENT');
assert.equal(preparation.validation.integration, 'PASS');
assert.equal(preparation.validation.successorEvidence, 'PASS');
assert.equal(preparation.validation.preflightRegression, '11/11 PASS');
assert.equal(preparation.validation.localeRegression, '9/9 PASS');
assert.equal(preparation.validation.authorizationRegression, '2/2 PASS');
assert.equal(preparation.validation.planMode, 'PASS_NO_SHOPIFY_CHANGES');
assert.equal(preparation.validation.themeCheck, 'FAIL_RETAINED_2100_ERRORS');

console.log(JSON.stringify({
  identity: preparation.identity,
  candidateFiles: comparisons.length,
  additions: 7,
  replacements: 10,
  dependencies: dependencies.length,
  collections: preparation.collections.records.length,
  rollbackStatus: preparation.rollback.status,
  uploadExecuted: upload.executed,
  validation: 'PASS',
}));
