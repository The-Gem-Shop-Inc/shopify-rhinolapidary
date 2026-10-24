'use strict';

const crypto = require('node:crypto');
const { schemaErrors } = require('./epic-k-evidence-drift');

const EXPECTED_SOURCE_STATUSES = Object.freeze({
    'source.apiVersion': 'verified',
    'source.sourceVerificationStatus': 'verified',
    'source.mappingAcceptanceStatus': 'partial',
    'source.collectionAuthorizationStatus': 'verified',
    'source.operationalAuthorityStatus': 'requires_operational_evidence',
    'profiles[]': 'verified',
    'profiles[].assignedProductRefs': 'verified',
    'profiles[].machineShipmentMode': 'requires_operational_evidence',
    'zones[]': 'verified',
    'rates[]': 'verified',
    'rates[].operationalApproval': 'requires_operational_evidence',
    'discounts[]': 'verified',
    'discounts[].shippingEffect': 'partial',
    'markets[]': 'verified',
    'markets[].checkoutAvailabilityEvidence': 'partial',
    'pickup[]': 'verified',
    'pickup[].eligibilityAssignmentStatus': 'unavailable',
    'pickup[].inventoryReadinessStatus': 'requires_operational_evidence',
    'products[].requiresShipping': 'verified',
    'products[].shippingWeight': 'verified',
    'products[].classification': 'requires_operational_evidence',
    'products[].shopifyInventoryStatus': 'verified',
    'products[].pickupEligibility': 'unavailable',
    'products[].packages': 'unavailable',
});

const EXPECTED_STATUS_COUNTS = Object.freeze({
    verified: 13,
    partial: 3,
    requires_operational_evidence: 5,
    unavailable: 3,
});

const EXPECTED_LIMITATION_PATHS = Object.freeze(Object.entries(EXPECTED_SOURCE_STATUSES)
    .filter(([, status]) => status !== 'verified')
    .map(([path]) => path));

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
    if (unknown.length) errors.push(`${label} contains unknown paths: ${unknown.join(', ')}`);
    if (missing.length) errors.push(`${label} is missing paths: ${missing.join(', ')}`);
}

function countStatuses(entries, key) {
    return entries.reduce((counts, entry) => {
        const status = entry[key];
        counts[status] = (counts[status] || 0) + 1;
        return counts;
    }, {});
}

function validateStatusCounts(actual, errors) {
    for (const [status, expected] of Object.entries(EXPECTED_STATUS_COUNTS)) {
        if ((actual[status] || 0) !== expected) errors.push(`${status} source classification count must remain ${expected}`);
    }
    const unknown = Object.keys(actual).filter((status) => !(status in EXPECTED_STATUS_COUNTS));
    if (unknown.length) errors.push(`unexpected source classifications: ${unknown.sort().join(', ')}`);
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
    if (errors.length) return { errors, acceptedDefinitionCount: 0, evidenceLimitationCount: 0, classificationCounts: {} };

    const expectedPaths = Object.keys(EXPECTED_SOURCE_STATUSES);
    const mappingPaths = mapping.mappings.map((entry) => entry.normalizedPath);
    comparePathSet(mappingPaths, expectedPaths, 'source mapping definitions', errors);
    if (mapping.mappings.length !== 24) errors.push(`source mapping must retain 24 definitions; found ${mapping.mappings.length}`);
    const mappingByPath = new Map(mapping.mappings.map((entry) => [entry.normalizedPath, entry]));
    for (const [path, expectedStatus] of Object.entries(EXPECTED_SOURCE_STATUSES)) {
        const source = mappingByPath.get(path);
        if (source && source.status !== expectedStatus) errors.push(`${path}: source classification must remain ${expectedStatus}`);
    }
    const classificationCounts = countStatuses(mapping.mappings, 'status');
    validateStatusCounts(classificationCounts, errors);

    const acceptedPaths = receipt.acceptedMappingDefinitions.map((entry) => entry.normalizedPath);
    comparePathSet(acceptedPaths, expectedPaths, 'accepted mapping definitions', errors);
    for (const entry of receipt.acceptedMappingDefinitions) {
        const source = mappingByPath.get(entry.normalizedPath);
        const expectedStatus = EXPECTED_SOURCE_STATUSES[entry.normalizedPath];
        if (!source) errors.push(`${entry.normalizedPath}: accepted definition is absent from the source mapping`);
        if (entry.designAcceptance !== 'accepted') errors.push(`${entry.normalizedPath}: mapping design must be accepted`);
        if (expectedStatus && entry.sourceVerificationStatus !== expectedStatus) {
            errors.push(`${entry.normalizedPath}: accepted design must preserve source classification ${expectedStatus}`);
        }
        if (source && entry.sourceVerificationStatus !== source.status) {
            errors.push(`${entry.normalizedPath}: receipt classification does not match the source mapping`);
        }
    }
    validateStatusCounts(countStatuses(receipt.acceptedMappingDefinitions, 'sourceVerificationStatus'), errors);

    const limitationPaths = receipt.evidenceLimitations.map((entry) => entry.normalizedPath);
    comparePathSet(limitationPaths, EXPECTED_LIMITATION_PATHS, 'evidence limitations', errors);
    for (const entry of receipt.evidenceLimitations) {
        const expectedStatus = EXPECTED_SOURCE_STATUSES[entry.normalizedPath];
        if (expectedStatus === 'verified') errors.push(`${entry.normalizedPath}: verified mapping cannot be an evidence limitation`);
        if (expectedStatus && entry.sourceVerificationStatus !== expectedStatus) {
            errors.push(`${entry.normalizedPath}: evidence limitation must preserve source classification ${expectedStatus}`);
        }
        if (entry.designAcceptance !== 'accepted' || entry.limitationStatus !== 'outstanding') {
            errors.push(`${entry.normalizedPath}: design acceptance and outstanding evidence limitation must remain distinct`);
        }
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

    if (mapping.version !== '1.2.0' || mapping.productOwnerMappingAcceptanceStatus !== 'accepted') {
        errors.push('authoritative mapping version 1.2.0 must record complete Product Owner design acceptance');
    }
    if (receipt.mappingDesignAcceptanceStatus !== 'accepted' || !receipt.boundaries.designApprovalComplete) {
        errors.push('receipt must record complete mapping design acceptance');
    }
    if (receipt.authority.additionalProductOwnerApprovalRequired !== false) {
        errors.push('no additional Product Owner mapping design approval is required');
    }
    if (snapshot.source.mappingAcceptanceStatus !== 'pending'
        || provenance.productOwnerMappingAcceptanceStatus !== 'pending'
        || receipt.application.historicalSnapshotAcceptanceStatus !== 'pending'
        || receipt.application.historicalAuditProvenanceAcceptanceStatus !== 'pending'
        || receipt.application.historicalReportsRewritten !== false) {
        errors.push('historical October 24 acceptance metadata and reports must remain unchanged');
    }

    const evidenceResults = evidenceGap.results || [];
    if (evidenceGap.summary?.BLOCKED !== 8 || evidenceResults.length !== 8 || evidenceResults.some((entry) => entry.state !== 'BLOCKED')) {
        errors.push('all eight operational evidence requirements must remain BLOCKED');
    }
    if (evidenceGap.operationalReadiness !== 'BLOCKED' || currentDrift.operationalReadiness !== 'BLOCKED') {
        errors.push('operational readiness must remain BLOCKED');
    }
    if (evidenceGap.liveCheckoutEnforcement !== 'UNVERIFIED' || currentDrift.liveCheckoutEnforcement !== 'UNVERIFIED') {
        errors.push('live checkout enforcement must remain UNVERIFIED');
    }
    const freshness = currentDrift.results.find((entry) => entry.id === 'evidence_freshness');
    if (freshness?.state !== 'BLOCKED') errors.push('historical drift evidence freshness result must remain BLOCKED');

    if (receipt.authority.newBusinessDecisionCreated !== false || JSON.stringify(receipt).includes('K-DEC-020')) {
        errors.push('mapping design acceptance must not create K-DEC-020 or another business decision');
    }
    if (receipt.boundaries.shopifyAccessAuthorized
        || receipt.boundaries.shopifyMutationsAuthorized
        || receipt.boundaries.shopifyOperationsPerformed) {
        errors.push('mapping design acceptance cannot authorize or record Shopify operations');
    }
    if (receipt.boundaries.businessDecisionsChanged !== false) errors.push('receipt cannot change Epic K business decisions');

    return {
        errors,
        acceptedDefinitionCount: receipt.acceptedMappingDefinitions.length,
        evidenceLimitationCount: receipt.evidenceLimitations.length,
        classificationCounts,
    };
}

module.exports = {
    EXPECTED_LIMITATION_PATHS,
    EXPECTED_SOURCE_STATUSES,
    EXPECTED_STATUS_COUNTS,
    fingerprint,
    validateMappingAcceptance,
};
