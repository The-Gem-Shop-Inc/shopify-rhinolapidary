'use strict';

const assert = require('node:assert/strict');
const { QUERIES, assertReadOnlyQuery } = require('./lib/epic-k-shopify-audit');
const { assessConfigurationDrift, schemaErrors } = require('./lib/epic-k-evidence-drift');
const { parseTimestamp, readJson } = require('./lib/epic-k-policy');

function validateEpicKShopifyAudit() {
    const mapping = readJson('data/epic-k-shopify-source-mapping.json');
    const snapshot = readJson('data/epic-k-shopify-config-snapshot-2026-10-24.json');
    const expectedDrift = readJson('data/epic-k-shopify-configuration-drift-report-2026-10-24.json');
    const provenance = readJson('data/epic-k-shopify-audit-provenance-2026-10-24.json');
    const evidenceGap = readJson('data/epic-k-evidence-gap-report.json');
    const errors = [
        ...schemaErrors('schemas/epic-k-shopify-source-mapping.schema.json', mapping, 'source mapping'),
        ...schemaErrors('schemas/epic-k-shopify-config-snapshot.schema.json', snapshot, 'sanitized snapshot'),
        ...schemaErrors('schemas/epic-k-evidence-drift-report.schema.json', expectedDrift, 'live drift report'),
        ...schemaErrors('schemas/epic-k-shopify-audit-provenance.schema.json', provenance, 'audit provenance'),
    ];
    for (const [name, query] of Object.entries(QUERIES)) {
        try { assertReadOnlyQuery(query); } catch (error) { errors.push(`${name}: ${error.message}`); }
    }
    const committed = JSON.stringify({ mapping, snapshot, expectedDrift, provenance });
    if (/gid:\/\/shopify\//i.test(committed)) errors.push('committed K1B-02 artifacts contain a raw Shopify GID');
    if (/shpat_|shpca_|x-shopify-access-token/i.test(committed)) errors.push('committed K1B-02 artifacts contain a credential marker');
    const collectedAt = parseTimestamp(snapshot.source.collectedAt);
    const assessedAt = parseTimestamp(snapshot.source.assessmentTime);
    if (collectedAt === null || assessedAt === null || assessedAt <= collectedAt) errors.push('assessment time must be valid and strictly after collection time');
    if (snapshot.source.assessmentTime !== expectedDrift.assessedAt || expectedDrift.assessedAt !== provenance.assessedAt) {
        errors.push('snapshot, drift report, and provenance assessment times must match');
    }
    const actual = assessConfigurationDrift(snapshot, undefined, { asOf: snapshot.source.assessmentTime });
    errors.push(...actual.errors);
    if (actual.report) {
        try { assert.deepEqual(actual.report, expectedDrift); } catch { errors.push('committed live drift report is stale or non-deterministic'); }
        const states = Object.fromEntries(actual.report.results.map((entry) => [entry.id, entry.state]));
        const expected = {
            free_shipping: 'FAIL', machine_shipping: 'BLOCKED', pickup: 'BLOCKED', geography: 'FAIL',
            product_logistics: 'FAIL', evidence_freshness: 'BLOCKED',
        };
        try { assert.deepEqual(states, expected); } catch { errors.push('live audit domain classifications differ from the reviewed K1B-02 evidence'); }
        if (actual.report.liveCheckoutEnforcement !== 'UNVERIFIED') errors.push('live checkout enforcement must remain UNVERIFIED');
        if (actual.report.operationalReadiness !== 'BLOCKED') errors.push('operational readiness must remain BLOCKED');
        const geography = actual.report.results.find((entry) => entry.id === 'geography');
        const domestic = geography?.findings?.find((entry) => entry.id === 'domestic_destination_scope');
        const international = geography?.findings?.find((entry) => entry.id === 'international_checkout_exposure');
        const requiredCodes = ['AA', 'AE', 'AP', 'AS', 'DC', 'FM', 'GU', 'MH', 'MP', 'PR', 'PW', 'VI'];
        if (domestic?.state !== 'FAIL' || !requiredCodes.every((code) => domestic.message.includes(code))) errors.push('geography must preserve all 12 confirmed out-of-scope US zone codes');
        if (international?.state !== 'UNVERIFIED') errors.push('international checkout exposure must remain UNVERIFIED');
        if (!['FAIL', 'BLOCKED'].includes(geography?.findings?.find((entry) => entry.id === 'ak_rate_approval')?.state)
            || !['FAIL', 'BLOCKED'].includes(geography?.findings?.find((entry) => entry.id === 'hi_rate_approval')?.state)) {
            errors.push('Alaska and Hawaii approval gaps must remain visible');
        }
    }
    if (provenance.collection.mutationCount !== 0) errors.push('audit provenance must record zero Shopify mutations');
    if (Object.values(provenance.customerAndMerchantImpact).some(Boolean)) errors.push('read-only audit must record no customer or merchant impact');
    if (evidenceGap.summary?.BLOCKED !== 8 || evidenceGap.operationalReadiness !== 'BLOCKED') errors.push('all eight operational evidence requirements must remain blocked');
    if (snapshot.products.length !== 125) errors.push('sanitized snapshot must retain all 125 collected Variant relationships');
    if (snapshot.products.filter((product) => product.shippingWeight?.value === 0).length !== 44) errors.push('sanitized snapshot must retain the confirmed 44 zero-weight Variants');
    if (snapshot.products.some((product) => !product.shopifyInventoryStatus || !Array.isArray(product.inventoryLocationRefs))) errors.push('sanitized snapshot must retain Shopify inventory status and sanitized location relationships');
    if (!mapping.mappings.some((entry) => entry.status === 'unavailable') || !mapping.mappings.some((entry) => entry.status === 'requires_operational_evidence')) {
        errors.push('source mapping must preserve unavailable and operational-evidence boundaries');
    }
    if (mapping.sourceVerificationStatus !== 'verified' || mapping.productOwnerMappingAcceptanceStatus !== 'accepted' || mapping.version !== '1.2.0') {
        errors.push('Current source verification and complete Product Owner mapping design acceptance must remain distinct and explicit');
    }
    if (snapshot.source.mappingAcceptanceStatus !== 'pending' || snapshot.source.operationalAuthorityStatus !== 'blocked') {
        errors.push('normalization must not promote Shopify data into mapping or operational approval');
    }
    return { errors, snapshot, report: actual.report, provenance, evidenceGap };
}

function main() {
    const result = validateEpicKShopifyAudit();
    if (result.errors.length) {
        console.error('Epic K Shopify configuration audit validation failed.');
        for (const error of result.errors) console.error(`- ${error}`);
        process.exitCode = 1;
        return;
    }
    console.log('Epic K Shopify source mapping, sanitized snapshot, provenance, and drift report: valid.');
    console.log(`Live sanitized snapshot: ${result.snapshot.profiles.length} profile, ${result.snapshot.rates.length} rates, ${result.snapshot.products.length} Variants.`);
    console.log(`Configuration drift: ${result.report.overallState}; ${result.report.summary.FAIL} FAIL, ${result.report.summary.BLOCKED} BLOCKED, ${result.report.summary.UNVERIFIED} UNVERIFIED.`);
    console.log(`Operational evidence: ${result.evidenceGap.summary.BLOCKED}/8 BLOCKED; live checkout enforcement UNVERIFIED.`);
    console.log('Shopify mutations and customer or merchant impact: 0.');
}

if (require.main === module) main();

module.exports = { validateEpicKShopifyAudit };
