'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createB01Foundation, permissionAuthorizer } = require('./foundation');
const {
  InMemorySubmissionReceiptStore,
  SubmissionIngestionService,
  SyntheticSubmissionAuthenticator,
} = require('./submission-ingestion');

const SYNTHETIC_CREDENTIAL = 'synthetic-credential-b08a-customer-001';
const SYNTHETIC_PRINCIPAL = Object.freeze({
  principalId: 'syn_principal_b08a_customer_001',
  customerReference: 'cus_synthetic_b08a_customer_001',
  notificationDestinationReference: 'dst_synthetic_b08a_customer_001',
  synthetic: true,
  authorityScope: 'ISOLATED_B08A_SUBMISSION_ONLY',
});

function loadMachineCatalog(rootDir) {
  const snapshot = JSON.parse(fs.readFileSync(path.join(rootDir, 'data', 'epic-l-policy2-shopify-product-snapshot-2026-11-23.json'), 'utf8'));
  return snapshot.products
    .filter((product) => product.technicalProductClass === 'machine')
    .flatMap((product) => product.variants.map((variant) => ({
      productGid: product.productGid,
      variantGid: variant.variantGid,
      productVersion: product.title,
      productTitle: product.title,
      variantTitle: variant.title,
    })));
}

function createB08ASubmissionSystem({
  rootDir = path.resolve(__dirname, '..', '..', '..'),
  clock,
  afterDomainHook,
  notificationTransport,
  identifiers = {},
} = {}) {
  const catalogEntries = loadMachineCatalog(rootDir);
  const foundation = createB01Foundation({
    rootDir,
    catalogEntries,
    clock,
    transport: notificationTransport,
    identifiers,
    testMode: true,
  });
  const authenticator = new SyntheticSubmissionAuthenticator({
    testMode: true,
    principals: { [SYNTHETIC_CREDENTIAL]: SYNTHETIC_PRINCIPAL },
  });
  const receiptStore = new InMemorySubmissionReceiptStore({ authorize: permissionAuthorizer, clock, ...identifiers.submission });
  const ingestion = new SubmissionIngestionService({
    registration: foundation.registration,
    supportIntake: foundation.supportIntake,
    receiptStore,
    authenticator,
    activationGate: foundation.activationGate,
    clock,
    testMode: true,
    afterDomainHook,
  });
  return {
    ...foundation,
    ingestion,
    receiptStore,
    authenticator,
    catalogEntries,
    syntheticAuthentication: Object.freeze({ credential: SYNTHETIC_CREDENTIAL }),
    syntheticPrincipal: SYNTHETIC_PRINCIPAL,
  };
}

module.exports = {
  SYNTHETIC_CREDENTIAL,
  SYNTHETIC_PRINCIPAL,
  createB08ASubmissionSystem,
  loadMachineCatalog,
};
