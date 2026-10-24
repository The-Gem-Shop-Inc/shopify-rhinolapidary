'use strict';

const crypto = require('node:crypto');
const { schemaErrors } = require('./epic-k-evidence-drift');

const EXPECTED_ACCEPTED_PATHS = Object.freeze([
    'source.apiVersion',
    'source.sourceVerificationStatus',
    'source.collectionAuthorizationStatus',
    'profiles[]',
    'profiles[].assignedProductRefs',
    'zones[]',
    'rates[]',
    'discounts[]',
    'markets[]',
    'pickup[]',
    'products[].requiresShipping',
    'products[].shippingWeight',
    'products[].shopifyInventoryStatus',
]);

const EXPECTED_UNRESOLVED = Object.freeze({
    'source.mappingAcceptanceStatus': 'partial',
    'source.operationalAuthorityStatus': 'requires_operational_evidence',
    'profiles[].machineShipmentMode': 'requires_operational_evidence',
    'rates[].operationalApproval': 'requires_operational_evidence',
    'discounts[].shippingEffect': 'partial',
    'markets[].checkoutAvailabilityEvidence': 'partial',
    'pickup[].eligibilityAssignmentStatus': 'unavailable',
    'pickup[].inventoryReadinessStatus': 'requires_operational_evidence',
    'products[].classification': 'requires_operational_evidence',
    'products[].pickupEligibility': 'unavailable',
    'products[].packages': 'unavailable',
});

function fingerprint(value) {
    return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function duplicateValues(values) {
    const seen = new Set();
    const duplicates = new Set();
    for (const value of values) {
        if (seen.has(value)) duplicates.add(value);
        seen.add(value);
    }
    return [...duplicates].sort();
}

function comparePathSet(actual, expected, label, errors) {
    const duplicates = duplicateValues(actual);
    if (duplicates.length) errors.push(`${label} contains duplicate paths: ${duplicates.join(', ')}`);
    const actualSet = new Set(actual);
    const expectedSet = new Set(expected);
    const unknown = [...actualSet].filter((path) => !expectedSet.has(path)).sort();
    const missing = [...expectedSet].filter((path) => !actualSet.has(path)).sort();
    if (unknown.length) errors.push(`${label} contains unknown or ineligible paths: ${unknown.join(', ')}`);
    if (missing.length) errors.push(`${label} is missing paths: ${missing.join(', ')}`);
}

function validateMappingAcceptance(receipt, mapping, snapshot, provenance, evidenceGap, currentDrift) {
    const errors = [
        ...schemaErrors('schemas/epic-k-shopify-mapping-acceptance.schema.json', receipt, 'mapping acceptance receipt'),
        ...schemaErrors('schemas/epic-k-shopify-source-mapping.schema.json', mapping, 'source mapping'),
        ...schemaErrors('schemas/epic-k-shopify-config-snapshot.schema.json', snapshot, 'sanitized snapshot'),
        ...schemaErrors('schemas/epic-k-shopify-audit-provenance.schema.json', provenance, 'audit provenance'),
        ...schemaErrors('schemas/epic-k-evidence-drift-report.schema.json', evidenceGap, 'evidence gap report'),
        ...schemaErrors('schemas/epic-k-evidence-drift-report.schema.json', currentDrift, 'configuration drift report'),
    ];
    if (errors.length) return { errors, acceptedCount: 0, unresolvedCount: 0 };

    const mappingPaths = mapping.mappings.map((entry) => entry.normalizedPath);
    const mappingDuplicates = duplicateValues(mappingPaths);
    if (mappingDuplicates.length) errors.push(`source mapping contains duplicate paths: ${mappingDuplicates.join(', ')}`);
    if (mapping.mappings.length !== 24) errors.push(`source mapping must retain 24 entries; found ${mapping.mappings.length}`);

    const mappingByPath = new Map(mapping.mappings.map((entry) => [entry.normalizedPath, entry]));
    const verifiedPaths = mapping.mappings.filter((entry) => entry.status === 'verified').map((entry) => entry.normalizedPath);
    const unresolvedPaths = mapping.mappings.filter((entry) => entry.status !== 'verified').map((entry) => entry.normalizedPath);
    comparePathSet(verifiedPaths, EXPECTED_ACCEPTED_PATHS, 'verified source mappings', errors);
    comparePathSet(unresolvedPaths, Object.keys(EXPECTED_UNRESOLVED), 'unresolved source mappings', errors);

    const acceptedPaths = receipt.acceptedMappings.map((entry) => entry.normalizedPath);
    comparePathSet(acceptedPaths, EXPECTED_ACCEPTED_PATHS, 'accepted mappings', errors);
    for (const entry of receipt.acceptedMappings) {
        const source = mappingByPath.get(entry.normalizedPath);
        if (!source) errors.push(`${entry.normalizedPath}: accepted path is absent from the source mapping`);
        else if (source.status !== 'verified') errors.push(`${entry.normalizedPath}: ${source.status} mapping cannot be accepted by the verified subset receipt`);
        if (entry.sourceStatus !== source?.status) errors.push(`${entry.normalizedPath}: receipt status does not match the source mapping`);
    }

    const receiptUnresolvedPaths = receipt.unresolvedMappings.map((entry) => entry.normalizedPath);
    comparePathSet(receiptUnresolvedPaths, Object.keys(EXPECTED_UNRESOLVED), 'unresolved receipt mappings', errors);
    for (const entry of receipt.unresolvedMappings) {
        const expectedStatus = EXPECTED_UNRESOLVED[entry.normalizedPath];
        const source = mappingByPath.get(entry.normalizedPath);
        if (!source) errors.push(`${entry.normalizedPath}: unresolved path is absent from the source mapping`);
        if (expectedStatus && entry.sourceStatus !== expectedStatus) errors.push(`${entry.normalizedPath}: unresolved status must remain ${expectedStatus}`);
        if (source && entry.sourceStatus !== source.status) errors.push(`${entry.normalizedPath}: receipt status does not match the source mapping`);
    }

    const links = receipt.sourceLinks;
    if (links.sourceMapping.contractId !== mapping.contractId || links.sourceMapping.version !== mapping.version) {
        errors.push('source mapping identity or version does not match the receipt');
    }
    if (links.sanitizedSnapshot.contractId !== snapshot.contractId || links.sanitizedSnapshot.version !== snapshot.snapshotVersion) {
        errors.push('sanitized snapshot identity or version does not match the receipt');
    }
    if (links.auditProvenance.contractId !== provenance.contractId || links.auditProvenance.auditId !== provenance.auditId) {
        errors.push('audit provenance identity does not match the receipt');
    }
    if (links.sourceMapping.fingerprint.value !== fingerprint(mapping)) errors.push('source mapping fingerprint mismatch');
    if (links.sanitizedSnapshot.fingerprint.value !== fingerprint(snapshot)) errors.push('sanitized snapshot fingerprint mismatch');
    if (links.auditProvenance.fingerprint.value !== fingerprint(provenance)) errors.push('audit provenance fingerprint mismatch');

    if (mapping.productOwnerMappingAcceptanceStatus !== 'pending') errors.push('whole source mapping register acceptance must remain pending');
    if (snapshot.source.mappingAcceptanceStatus !== 'pending') errors.push('snapshot whole-register mapping acceptance must remain pending');
    if (provenance.productOwnerMappingAcceptanceStatus !== 'pending') errors.push('audit provenance whole-register mapping acceptance must remain pending');
    if (receipt.boundaries.entireRegisterAcceptanceStatus !== 'pending') errors.push('receipt must not promote the entire mapping register');

    const evidenceResults = evidenceGap.results || [];
    if (evidenceGap.summary?.BLOCKED !== 8 || evidenceResults.length !== 8 || evidenceResults.some((entry) => entry.state !== 'BLOCKED')) {
        errors.push('all eight operational evidence requirements must remain BLOCKED');
    }
    if (evidenceGap.operationalReadiness !== 'BLOCKED') errors.push('operational readiness must remain BLOCKED');
    if (evidenceGap.liveCheckoutEnforcement !== 'UNVERIFIED') errors.push('evidence report checkout enforcement must remain UNVERIFIED');
    if (currentDrift.operationalReadiness !== 'BLOCKED') errors.push('configuration drift operational readiness must remain BLOCKED');
    if (currentDrift.liveCheckoutEnforcement !== 'UNVERIFIED') errors.push('configuration drift checkout enforcement must remain UNVERIFIED');
    const freshness = currentDrift.results.find((entry) => entry.id === 'evidence_freshness');
    if (freshness?.state !== 'BLOCKED') errors.push('existing whole-register mapping freshness gate must remain BLOCKED');

    if (receipt.authority.newBusinessDecisionCreated !== false || JSON.stringify(receipt).includes('K-DEC-020')) {
        errors.push('bounded technical mapping acceptance must not create K-DEC-020 or another business decision');
    }
    if (receipt.boundaries.shopifyOperationsPerformed !== false) errors.push('receipt cannot record a Shopify operation');
    if (receipt.boundaries.businessDecisionsChanged !== false) errors.push('receipt cannot change Epic K business decisions');

    return {
        errors,
        acceptedCount: receipt.acceptedMappings.length,
        unresolvedCount: receipt.unresolvedMappings.length,
    };
}

module.exports = {
    EXPECTED_ACCEPTED_PATHS,
    EXPECTED_UNRESOLVED,
    fingerprint,
    validateMappingAcceptance,
};
