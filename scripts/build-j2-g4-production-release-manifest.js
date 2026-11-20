'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const release = require('./lib/j2-g4-production-release');

const value = (name) => {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
};

const repositoryRoot = path.resolve(__dirname, '..');
const productionRoot = path.resolve(value('production-root') || '');
const previewRoot = path.resolve(value('preview-root') || '');
const candidateRoot = path.resolve(value('candidate-root') || '');
const output = path.resolve(value('output') || path.join(repositoryRoot, 'data/j2-g4-production-release-manifest.json'));
assert(value('production-root'), 'Missing --production-root');
assert(value('preview-root'), 'Missing --preview-root');
assert(value('candidate-root'), 'Missing --candidate-root');
assert(path.relative(repositoryRoot, candidateRoot).startsWith('..'), 'Candidate root must remain outside Git');

const built = release.buildCandidate({
  repositoryRoot,
  productionRoot,
  previewRoot,
  candidateRoot,
  localizationDisposition: 'ENGLISH_ONLY_REMOVE_INACTIVE_STOREFRONT_LOCALES',
});

const manifest = {
  schemaVersion: 1,
  releaseId: 'J2-G4-PRODUCTION-RC1',
  status: 'BLOCKED_PENDING_PRODUCT_OWNER_LOCALIZATION_AND_RELEASE_AUTHORIZATION',
  generatedAt: new Date().toISOString(),
  source: {
    repository: 'https://github.com/The-Gem-Shop-Inc/shopify-rhinolapidary.git',
    branch: 'integration/catalog-cart-preview',
    runtimeCommit: release.EXPECTED_SOURCE_COMMIT,
    previewAcceptanceDigest: '78e435cf53ef09e96a78e567c2d90fb39c76c37e7fd31ca5d04a7ab4e3510efe',
  },
  target: {
    shopGid: release.SHOP_GID,
    store: release.STORE,
    productionThemeId: release.PRODUCTION_THEME_ID,
    acceptedPreviewThemeId: release.PREVIEW_THEME_ID,
    releaseVehicle: 'NEW_UNPUBLISHED_SERVER_SIDE_DUPLICATE_OF_CURRENT_PRODUCTION',
    fullPreviewPublicationAllowed: false,
    directLivePushAllowed: false,
  },
  transaction: {
    digestAlgorithm: 'SHA-256 of recursively key-sorted binding JSON; JSON theme files use semantic hashes after Shopify comment removal',
    digest: built.transactionDigest,
    acceptedPathCount: built.paths.length,
    changedPathCount: built.fileRecords.filter(({ operation }) => operation !== 'VERIFY_NO_CHANGE').length,
    verifiedNoChangeDependencyCount: built.fileRecords.filter(({ operation }) => operation === 'VERIFY_NO_CHANGE').length,
    localeDeletionCount: built.localeDeletions.length,
    settingsMutationCount: 0,
    menuMutationCount: 0,
    productMutationCount: 0,
    collectionMutationCount: 0,
  },
  candidate: {
    derivation: 'Fresh complete production pull, accepted preview overlay only for the dependency-closed J2/G4/Phase-C paths, then approved English-only storefront-locale disposition.',
    predecessorInventory: { fileCount: built.predecessorInventory.fileCount, digest: built.predecessorInventory.digest },
    previewInventory: { fileCount: built.previewInventory.fileCount, digest: built.previewInventory.digest },
    inventory: { fileCount: built.candidateInventory.fileCount, digest: built.candidateInventory.digest },
    files: built.fileRecords,
  },
  navigation: {
    assignedHandleOnProduction: built.settings.production.menuHandle,
    assignedHandleOnPreview: built.settings.preview.menuHandle,
    acceptedSemanticDigest: 'fac77a7d367cb372738516cb6917f696dcdeadc61cd9aaa04f6a4d539cc06f15',
    productionMainMenuMutationAllowed: false,
    menuMutationRequired: false,
    disposition: 'The shared accepted menu is already assigned to both themes; verify read-only and preserve it.',
  },
  settings: {
    production: built.settings.production,
    preview: built.settings.preview,
    disposition: 'Preserve the production-derived settings exactly; no settings_data or settings_schema upload is in scope.',
  },
  localization: {
    publishedLanguages: ['en'],
    proposedDisposition: 'ENGLISH_ONLY_REMOVE_INACTIVE_STOREFRONT_LOCALES_FROM_STAGING_CANDIDATE',
    productOwnerApprovalRequired: true,
    approved: false,
    deletedOnlyFromFutureStagingCandidate: built.localeDeletions,
    repositorySourcesRetained: true,
    rollbackBodiesRetainedInProductionArchive: true,
    themeCheckRequiredAfterDisposition: true,
  },
  productAuthority: {
    renewalRequiredForThisRelease: false,
    state: 'EXPIRED_FAILS_CLOSED',
    customerClaimsAllowed: false,
    basicBrowsingAndPurchaseRequired: true,
    acceptance: 'Directory must expose neutral native product links only; categorized sections and compatibility claims must remain absent.',
  },
  epicK: {
    successorBindingRequired: true,
    redesignAllowed: false,
    compatibility: built.kCompatibility,
    currentProductionConfiguration: {
      cartType: built.settings.production.cartType,
      quoteAutomationEnabled: built.settings.production.quoteAutomationEnabled,
    },
    requiredFreshEvidence: ['staging quotation regression', 'shipping and pickup configuration read', 'no new commitment text'],
  },
  rollback: {
    baselineThemeId: release.PRODUCTION_THEME_ID,
    completeProductionArchiveRequired: true,
    predecessorInventoryDigest: built.predecessorInventory.digest,
    oldProductionThemeMustRemainUnpublishedAfterPublish: true,
    automaticRollbackAllowed: false,
    separateProductOwnerAuthorizationRequired: true,
  },
  authorization: {
    stageAuthorized: false,
    publishAuthorized: false,
    rollbackAuthorized: false,
    previewAuthorizationReusable: false,
    futureStageAuthorizationValue: built.futureStageAuthorizationValue,
    boundTransactionDigest: built.transactionDigest,
  },
  acceptance: {
    baseline: 'docs/project/implementation-records/j2-g4-phase-c-live-acceptance.md and j2-g4-phase-e-navigation-acceptance.md',
    required: [
      'catalog media, filtering, sorting, pagination and neutral directory',
      'add, increment, decrement, remove, synchronized quantities and accessible toast',
      'quotation interface regression with current production configuration',
      'desktop and mobile accepted navigation without mutation',
      'responsive and accessibility checks with zero serious or critical storefront findings',
      'no categorized Product role, compatibility or machine-fit claims',
      'critical production settings and unrelated semantic inventory unchanged',
    ],
  },
};

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ output, candidateRoot, transactionDigest: built.transactionDigest, futureStageAuthorizationValue: built.futureStageAuthorizationValue, changedPaths: manifest.transaction.changedPathCount, localeDeletions: manifest.transaction.localeDeletionCount }));
