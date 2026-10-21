'use strict';

const fs = require('node:fs');
const Ajv = require('ajv/dist/2020');

const contract = require('../data/epic-f-support-resources-contract.json');
const contractSchema = require('../schemas/epic-f-support-resources-contract.schema.json');
const batch3b = require('../data/epic-e-batch-3b-contracts.json');
const batch3bDecisions = require('../data/epic-e-batch-3b-decision-packet.json');
const batch3cDecisions = require('../data/epic-e-batch-3c-decision-packet.json');
const resourceCatalog = require('../data/epic-e-resource-catalog.json');
const { contracts: batch3c } = require('./lib/epic-e-batch-3c-contract');
const packetSchema = require('../schemas/epic-f-support-resources.schema.json');
const projectionSchema = require('../schemas/epic-f-support-resources-projection.schema.json');

const errors = [];

function fail(message) {
    errors.push(message);
}

function sameMembers(actual, expected) {
    return (
        Array.isArray(actual) &&
        Array.isArray(expected) &&
        actual.length === expected.length &&
        [...actual].sort().every((value, index) => value === [...expected].sort()[index])
    );
}

const ajv = new Ajv({
    strict: false,
    allErrors: true
});

const validateContract = ajv.compile(contractSchema);
const validatePacketSchema = ajv.compile(packetSchema);
const validateProjectionSchema = ajv.compile(projectionSchema);

if (
    typeof validatePacketSchema !== 'function' ||
    typeof validateProjectionSchema !== 'function'
) {
    fail('F6 packet/projection schemas did not compile');
}

if (!validateContract(contract)) {
    for (const error of validateContract.errors || []) {
        fail(
            `Contract schema ${error.instancePath || '/'} ${error.message || 'is invalid'}`
        );
    }
}

/*
 * Upstream files are architectural authorities
 * F6 consumes them; it does not redefine their semantics.
 */
for (const path of Object.values(contract.upstream)) {
    if (!fs.existsSync(path)) {
        fail(`Missing upstream F6 authority: ${path}`);
    }
}

/*
 * Warranty / service ownership
 */
const warrantyDecision = batch3cDecisions.decisions.find(
    decision => decision.id === contract.warranty.decisionId
);

if (!warrantyDecision) {
    fail(`Missing upstream decision ${contract.warranty.decisionId}`);
} else {
    if (warrantyDecision.pbi !== contract.warranty.sourcePbi) {
        fail(
            `${contract.warranty.decisionId} must remain owned by ${contract.warranty.sourcePbi}`
        );
    }

    if (
        warrantyDecision.decisionState !==
        contract.warranty.currentExpectedDecisionState
    ) {
        fail(
            `${contract.warranty.decisionId} upstream state changed from ` +
            `${contract.warranty.currentExpectedDecisionState} to ` +
            `${warrantyDecision.decisionState}; review F-PBI-010B before changing F6`
        );
    }

    if (
        warrantyDecision.decisionState !== 'approved' &&
        warrantyDecision.approvalDecisionId !== null
    ) {
        fail(
            `${contract.warranty.decisionId} has an approval ID without an approved state`
        );
    }
}

if (!sameMembers(contract.warranty.roles, batch3c.warranty.roles)) {
    fail(
        'F6 warranty roles must exactly match the Epic E warranty role contract'
    );
}

if (
    batch3c.warranty.storageDecision !==
    'No new Shopify warranty definition or metaobject. Reusable current terms and entity ownership are not approved. Repository typed policy/class/mapping references support review; approved resource delivery reuses E-PBI-018B.'
) {
    fail(
        'Epic E warranty storage decision has changed; review F6 before proceeding'
    );
}

if (
    contract.warranty.newShopifyDefinitionAllowed !== false ||
    contract.warranty.newWarrantyMetaobjectAllowed !== false
) {
    fail('F6 must not create a Shopify warranty definition or metaobject');
}

if (contract.warranty.neutralContactRoute !== '/pages/contact') {
    fail('F6 neutral Contact route must remain /pages/contact');
}

if (contract.warranty.warrantyDestinationFallbackAllowed !== false) {
    fail('Neutral Contact must not become a warranty destination fallback');
}

/*
 * Resource governance
 */
const resourceDecision = batch3bDecisions.decisions.find(
    decision => decision.id === contract.resources.decisionId
);

if (!resourceDecision) {
    fail(`Missing upstream decision ${contract.resources.decisionId}`);
} else {
    if (
        resourceDecision.state !==
        contract.resources.currentExpectedDecisionState
    ) {
        fail(
            `${contract.resources.decisionId} upstream state changed from ` +
            `${contract.resources.currentExpectedDecisionState} to ` +
            `${resourceDecision.state}; review F-PBI-011B before changing F6`
        );
    }

    if (
        resourceDecision.state !== 'approved' &&
        resourceDecision.approval !== null
    ) {
        fail(
            `${contract.resources.decisionId} has approval evidence without an approved state`
        );
    }
}

if (!sameMembers(contract.resources.types, batch3b.resources.types)) {
    fail('F6 resource types must exactly match Epic E');
}

if (!sameMembers(contract.resources.states, batch3b.resources.states)) {
    fail('F6 resource lifecycle states must exactly match Epic E');
}

if (!sameMembers(contract.resources.visibility, batch3b.resources.visibility)) {
    fail('F6 resource visibility states must exactly match Epic E');
}

const expectedFields = {
    manual: 'manual_files',
    diagram: 'diagram_files',
    instruction: 'instruction_files',
    video: 'video_files',
    support: 'support_files'
};

for (const [type, key] of Object.entries(expectedFields)) {
    if (contract.resources.resourceFields[type] !== key) {
        fail(`F6 resource field for ${type} must be ${key}`);
    }

    const upstreamField = batch3b.fields.find(field => field.key === key);

    if (!upstreamField) {
        fail(`Missing Epic E resource field ${key}`);
        continue;
    }

    if (
        upstreamField.sourcePbi !== 'E-PBI-018B' ||
        upstreamField.type !== 'list.file_reference' ||
        upstreamField.ownerType !== 'PRODUCT' ||
        upstreamField.definitionDecisionState !== 'approved' ||
        upstreamField.valueApprovalRequired !== true
    ) {
        fail(`Epic E resource field ${key} no longer matches the F6 contract`);
    }
}

if (contract.resources.supportFieldCustomerVisible !== false) {
    fail('support_files must remain customer-ineligible');
}

/*
 * Current catalog safety.
 *
 * Candidate evidence is allowed to exist, but nothing currently present may be
 * treated as a customer grant merely because it has a File GID or reachable
 * binary.
 */
for (const resource of resourceCatalog.resources || []) {
    if (resource.visibility === 'support_only' || resource.visibility === 'internal') {
        if (
            resource.sourceRole !== 'evidence_only' &&
            resource.resourceType === 'support'
        ) {
            fail(
                `Restricted support resource ${resource.resourceId} unexpectedly has ` +
                `sourceRol ${resource.sourceRole}`
            );
        }
    }

    if (resource.status !== 'current' && resource.canonical === true) {
        fail(`Non-current resource ${resource.resourceId} must not be canonical`);
    }

    if (
        resource.visibility !== 'customer' &&
        resource.publicationApproved === true
    ) {
        fail(`Non-customer resource ${resource.resourceId} must not be publication-approved`);
    }
}

/*
 * F-PBI-010A / 011A repository boundary.
 */
if (contract.runtimeActivation !== false) {
    fail('F6 runtime activation must remain disabled in A scope');
}

if (
    contract.release.realWarrantyGrantCount !== 0 ||
    contract.release.realResourceGrantCount !== 0
) {
    fail('F6 A scope must begin with zero real warranty/resource grants');
}

if (
    contract.release.adminMutationAuthorized ||
    contract.release.productMutationAuthorized ||
    contract.release.fileMutationAuthorized ||
    contract.release.pageMutationAuthorized ||
    contract.release.themePushAuthorized
) {
    fail('F6 A scope cannot authorize live mutation or theme push');
}

// Architecture enforcement supplements (and does not replace) the manual checkpoint.
const crypto = require('node:crypto');
const consumer = require('./lib/epic-f-consumer');
for (const [path, hash] of Object.entries(require('../tests/fixtures/epic-f-support-resources-baseline.json'))) {
    const liveMedia = require('./lib/epic-f-live-media-activation');
    const exactDevelopmentMedia = path === liveMedia.FILE && liveMedia.historicalSourceMatches(path, hash);
    const exactOwnerSuccessor=require('./lib/epic-f-owner-activation-binding').historicalSourceMatches(path,hash);
    if (crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex') !== hash && !exactDevelopmentMedia && !exactOwnerSuccessor) fail('F6 changed preserved surface: ' + path);
}
if (require('../data/epic-f-consumer-release.json').grants.length !== 0) fail('Unexpected real grants: stop; activation is not authorized');
if (fs.readFileSync('snippets/rhino-product-support-resources-projection.liquid', 'utf8').replaceAll('\r\n', '\n') !== consumer.buildSupportResourcesProjection()) fail('F6 generated projection is stale');
const main = fs.readFileSync('sections/main-product.liquid', 'utf8');
if ((main.match(/render 'rhino-product-support-resources-projection'/g) || []).length !== 1) fail('F6 must integrate exactly once');
if (!/if rhino_consumer_route == 'machine'[\s\S]*?rhino-product-fact-projection[\s\S]*?rhino-product-context-delivery-projection[\s\S]*?rhino-product-support-resources-projection/.test(main)) fail('F6 must follow existing machine-only projections');
for (const name of ['support', 'resources']) {
    const text = fs.readFileSync('snippets/rhino-machine-' + name + '.liquid', 'utf8');
    if (!text.includes("request.host == 'machine.local' and projection.fixture_only")) fail('F6 fixture rendering must remain isolated');
    if (/product\.(?:description|metafields|vendor|tags)|shop\.|support_files|<script|all_products|autoplay[=\s]/.test(text)) fail('Forbidden F6 authority/controller: ' + name);
}
const resources = fs.readFileSync('snippets/rhino-machine-resources.liquid', 'utf8');
if (!/<deferred-media[\s\S]*?<template>\s*<iframe[\s\S]*?<\/template>/.test(resources)) fail('Use native deferred video and inert template');
if (projectionSchema.$defs.resourceProjection.properties.type.enum.includes('support')) fail('support_files must be structurally customer-ineligible');

if (errors.length) {
    console.error('Epic F support/resources validation failed:');
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exitCode = 1;
} else {
    console.log(
        'Epic F support/resources contract validation passed. ' +
        'F-PBI-010A/011A architecture only; live grants remain zero.'
    );
}
