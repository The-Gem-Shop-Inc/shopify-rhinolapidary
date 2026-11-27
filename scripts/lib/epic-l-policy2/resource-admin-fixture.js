'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  DisabledOperationalActivationGate,
  ExactProductVariantCatalog,
} = require('./common');
const { READINESS_BLOCKERS } = require('./foundation');
const { ResourceRevisionGovernance } = require('./resource-governance');
const { ResourceAdministrationService } = require('./resource-administration');
const { ResourceEnrichmentService } = require('./resource-enrichment');

const PRODUCT_OWNER_PERMISSIONS = Object.freeze([
  'RESOURCE_ADMIN_IMPORT_B05',
  'RESOURCE_ADMIN_CREATE_DRAFT',
  'RESOURCE_ADMIN_CREATE_REVISION',
  'RESOURCE_ADMIN_EDIT_DETAILS',
  'RESOURCE_ADMIN_CORRECT_CLASSIFICATION',
  'RESOURCE_ADMIN_APPLY_ENRICHMENT',
  'RESOURCE_ADMIN_RESET',
  'RESOURCE_HISTORICAL_APPROVAL_ASSERT',
  'RESOURCE_ADMIN_APPROVE_INTERNAL',
  'RESOURCE_ADMIN_SUPERSEDE',
  'RESOURCE_ADMIN_RETIRE',
  'RESOURCE_ADMIN_EXPORT',
  'RESOURCE_ADMIN_IMPORT_ARCHIVE',
  'RESOURCE_REVISION_CREATE',
]);

const PRODUCT_OWNER_ACTOR = Object.freeze({
  actorId: 'B07_SYNTHETIC_PRODUCT_OWNER',
  context: 'ISOLATED_SYNTHETIC',
  productionIdentityVerified: false,
  permissions: PRODUCT_OWNER_PERMISSIONS,
});

const TECHNICAL_ACTOR = Object.freeze({
  actorId: 'B07_SYNTHETIC_KEVIN_AUTHORITY',
  context: 'ISOLATED_SYNTHETIC',
  productionIdentityVerified: false,
  permissions: ['RESOURCE_TECHNICAL_APPROVE'],
});

function loadJson(rootDir, relativePath) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, relativePath), 'utf8'));
}

function createB07ResourceAdminSystem({
  rootDir = path.resolve(__dirname, '../../..'),
  clock = () => new Date().toISOString(),
  factories = {},
  importB05 = true,
} = {}) {
  const snapshot = loadJson(rootDir, 'data/epic-l-policy2-shopify-product-snapshot-2026-11-23.json');
  const queue = loadJson(rootDir, 'data/epic-l-policy2-resource-approval-queue.json');
  const catalog = new ExactProductVariantCatalog(snapshot.products.flatMap((product) => product.variants.map((variant) => ({
    productGid: product.productGid,
    variantGid: variant.variantGid,
  }))));
  const authorityBindings = new Map([
    [PRODUCT_OWNER_ACTOR.actorId, new Set(PRODUCT_OWNER_PERMISSIONS)],
    [TECHNICAL_ACTOR.actorId, new Set(TECHNICAL_ACTOR.permissions)],
  ]);
  const authorize = (actor, permission) => actor?.context === 'ISOLATED_SYNTHETIC'
    && actor?.productionIdentityVerified === false
    && authorityBindings.get(actor.actorId)?.has(permission) === true;
  const activationGate = new DisabledOperationalActivationGate(READINESS_BLOCKERS);
  const governance = new ResourceRevisionGovernance({
    catalog,
    activationGate,
    authorize,
    technicalApprovalAuthority: {
      actorId: TECHNICAL_ACTOR.actorId,
      authorityRole: 'SYNTHETIC_TECHNICAL_APPROVER',
      synthetic: true,
    },
    clock,
    testMode: true,
    ...(factories.governance || {}),
  });
  const administration = new ResourceAdministrationService({
    resourceGovernance: governance,
    catalogSnapshot: snapshot,
    b05Queue: queue,
    authorize,
    clock,
    isolatedSyntheticMode: true,
    enrichment: new ResourceEnrichmentService({ rootDir }),
    ...(factories.administration || {}),
  });
  if (importB05) administration.importB05Candidates({
    actor: PRODUCT_OWNER_ACTOR,
    commandId: 'B07_BOOTSTRAP_IMPORT_B05_V1',
  });
  return {
    administration,
    governance,
    actors: { productOwner: PRODUCT_OWNER_ACTOR, technical: TECHNICAL_ACTOR },
    snapshot,
    queue,
    activation: activationGate.snapshot(),
  };
}

module.exports = {
  PRODUCT_OWNER_ACTOR,
  PRODUCT_OWNER_PERMISSIONS,
  TECHNICAL_ACTOR,
  createB07ResourceAdminSystem,
};
