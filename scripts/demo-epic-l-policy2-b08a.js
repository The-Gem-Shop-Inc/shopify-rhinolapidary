'use strict';

const { createB08ASubmissionSystem } = require('./lib/epic-l-policy2');

const system = createB08ASubmissionSystem();
const machine = system.catalogEntries[0];
const registration = system.ingestion.ingest({
  authentication: system.syntheticAuthentication,
  envelope: {
    envelopeVersion: '1.0.0',
    submissionType: 'REGISTRATION',
    delivery: { transportId: 'SYNTHETIC_FORM_FIXTURE', deliveryId: 'syn_delivery_demo_registration_001' },
    payload: { productGid: machine.productGid, variantGid: machine.variantGid, productVersion: machine.productVersion },
  },
});
const support = system.ingestion.ingest({
  authentication: system.syntheticAuthentication,
  envelope: {
    envelopeVersion: '1.0.0',
    submissionType: 'SUPPORT',
    delivery: { transportId: 'SYNTHETIC_FORM_FIXTURE', deliveryId: 'syn_delivery_demo_support_001' },
    payload: { category: 'TECHNICAL_GUIDANCE', registrationId: registration.result.targetReference },
  },
});

console.log(JSON.stringify({ mode: 'PRIVATE_SYNTHETIC_ONLY', registration, support, externalTransportEnabled: false, customerActivationPermitted: false }, null, 2));
