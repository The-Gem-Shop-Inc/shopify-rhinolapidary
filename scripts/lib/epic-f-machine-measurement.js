'use strict';

const fs = require('node:fs');
const { read, schemaErrors, fileHash } = require('./epic-f-governance');
const { historicalHashMatches, approvedNewSnippet } = require('./epic-f-release-cleanup-binding');
const { safeRelativeRoute } = require('./epic-f-support-resources');
const identity = read('data/epic-e-product-identity.json');
const classes = read('data/epic-e-product-classification.json');
const nativeIds = ['product_view', 'add_to_cart', 'begin_checkout', 'purchase'];
const nativeDedup = 'One reserved native owner slot per commerce action; F emissions forbidden; U must verify collector event identity before activation';
const optionalDedup = 'One collector per approved activation; collector-issued interaction identity plus eventId; no new customer/session identity in F payload';
const optional = {
    contact: ['rhino:machine:contact-activate', 'F-MQ-CONTACT'],
    resources: ['rhino:machine:resource-activate', 'F-MQ-RESOURCE'],
    contextual: ['rhino:machine:context-navigate', 'F-MQ-CONTEXT'],
    delivery: ['rhino:machine:delivery-navigate', 'F-MQ-DELIVERY']
};

function validateContract(contract, registry = read('data/storefront-event-contracts.json')) {
    const errors = schemaErrors('epic-f-machine-measurement-contract', contract);
    if (errors.length) return errors;
    const events = [...contract.nativeEvents, ...contract.optionalEvents];
    if (new Set(events.map(e => e.eventId)).size !== events.length) errors.push('duplicate event ownership');
    if (new Set(contract.businessQuestions.map(q => q.id)).size !== contract.businessQuestions.length) errors.push('duplicate business question');
    for (const id of nativeIds) {
        const records = events.filter(e => e.eventId === id);
        if (records.length !== 1 || records[0].name !== id || !records[0].native || records[0].ownerSlot !== `U/native/${id}` || records[0].emissionByF) errors.push(`native owner reservation violation: ${id}`);
    }
    for (const event of events) {
        if (!contract.businessQuestions.some(q => q.id === event.businessQuestionId)) errors.push('business question missing');
        if (!event.reportingOwner || !event.baselineOwner) errors.push('reporting/baseline owner missing');
        if (!event.consentResolved && event.instrumentationState !== 'instrumentation_blocked') errors.push('unresolved consent must block instrumentation');
        if (event.deduplication.strategy !== (event.native ? nativeDedup : optionalDedup)) errors.push('deduplication responsibility/strategy changed');
        const surface = event.eventId === 'begin_checkout' ? 'Shopify native checkout transition (J/U-owned)' : event.eventId === 'purchase' ? 'Shopify native checkout completion (J/U-owned)' : 'templates/product.machine.json';
        if (event.sourceSurface !== surface) errors.push('event source surface mismatch');
    }
    for (const [module, [id, question]] of Object.entries(optional)) {
        const rows = contract.optionalEvents.filter(e => e.module === module);
        if (rows.length !== 1 || rows[0].eventId !== id || rows[0].name !== id || rows[0].ownerSlot !== `U/optional/${module}` || rows[0].businessQuestionId !== question || rows[0].native || rows[0].decisionBoundary !== 'destination_activation') errors.push(`invalid optional decision event: ${module}`);
    }
    // The shared registry owns registration; it references this contract. A second
    // commerce/custom definition cannot acquire ownership through either registry.
    if (!registry.measurementContracts?.includes('data/epic-f-machine-measurement-contract.json')) errors.push('missing shared registry reference');
    for (const event of registry.events) {
        if (events.some(e => e.name === event.name) || /machine[_:-](view|add[_:-]to[_:-]cart|purchase)|product[_:-]view|add[_:-]to[_:-]cart|begin[_:-]checkout|purchase/i.test(event.name)) errors.push('duplicate native or measurement emission registration');
    }
    for (const path of contract.authorities) if (!fs.existsSync(path)) errors.push(`missing U governance authority: ${path}`);
    return errors;
}

// Validates a hypothetical activation; does not emit or return a publishable event.
// Fixture authority is usable ONLY in this unit-contract mode. No release adapter.
function validateActivation(payload, { fixture, moduleActive = false, release = false, action = null } = {}) {
    const errors = schemaErrors('epic-f-machine-measurement-payload', payload);
    if (errors.length) return errors;
    if (release || !fixture?.fixtureOnly) errors.push('instrumentation_blocked; fixture authority cannot grant release instrumentation');
    if (!moduleActive) errors.push('suppressed module cannot produce an event');
    if (action !== 'destination_activation') errors.push('not a customer decision boundary');
    const product = identity.productIdentities.find(p => p.productGid === payload.productGid);
    const classification = classes.mappings.find(p => p.productGid === payload.productGid);
    if (!product || classification?.classDecisionState !== 'approved' || classification.proposedProductClass !== 'machine' || payload.productGid !== fixture?.productGid) errors.push('invalid exact machine Product identity');
    if (!safeRelativeRoute(payload.destinationRoute)) errors.push('unsafe relative destination');
    if (payload.variantGid && !identity.variantIdentities.some(v => v.variantGid === payload.variantGid && v.productGid === payload.productGid)) errors.push('wrong Variant/Product pair');
    if (payload.module === 'contact' && payload.destinationRoute !== '/pages/contact') errors.push('noncanonical Contact route');
    if (payload.module === 'delivery' && payload.destinationRoute !== '/policies/shipping-policy') errors.push('noncanonical policy route');
    if (payload.module === 'resources') {
        const matches = fixture?.resources.filter(r => r.active && r.resourceId === payload.resourceId && r.productGid === payload.productGid && r.route === payload.destinationRoute && (!payload.variantGid || r.variantGid === payload.variantGid)) || [];
        if (matches.length !== 1) errors.push('invalid resource identity/scope/destination');
    }
    if (payload.module === 'contextual') {
        const target = identity.productIdentities.find(p => p.productGid === payload.targetProductGid);
        const matches = fixture?.relationships.filter(r => r.active && r.relationshipId === payload.relationshipId && r.productGid === payload.productGid && r.targetProductGid === payload.targetProductGid && r.route === payload.destinationRoute) || [];
        if (!target || target.productGid === payload.productGid || payload.destinationRoute !== `/products/${target.handle}` || matches.length !== 1) errors.push('invalid contextual target/relationship');
    }
    return errors;
}

function validateRuntime() {
    const baseline = read('tests/fixtures/epic-f-f7-runtime-baseline.json');
    const errors = [];
    for (const [path, hash] of Object.entries(baseline.files)) {
        if (!fs.existsSync(path) || !historicalHashMatches(path, hash)) errors.push(`F6 runtime/budget drift: ${path}`);
    }
    function inspect(folder) {
        for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
            const path = `${folder}/${entry.name}`;
            if (entry.isDirectory()) inspect(path);
            else if (!(path in baseline.files) && !approvedNewSnippet(path)) errors.push(`new storefront runtime file: ${path}`);
        }
    }
    for (const folder of ['assets', 'layout', 'sections', 'snippets', 'templates', 'locales', 'config']) inspect(folder);
    return errors;
}
module.exports = { validateContract, validateActivation, validateRuntime };
