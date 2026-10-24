'use strict';

const assert = require('node:assert/strict');
const {
    assessConfigurationDrift,
    schemaErrors,
    verifyEvidence,
} = require('./lib/epic-k-evidence-drift');
const { readJson } = require('./lib/epic-k-policy');

function validateEpicKEvidence() {
    const requirements = readJson('data/epic-k-operational-evidence-requirements.json');
    const receipts = readJson('data/epic-k-evidence-receipts.json');
    const fixtures = readJson('tests/fixtures/epic-k-evidence-drift-fixtures.json');
    const expectedGap = readJson('data/epic-k-evidence-gap-report.json');
    const expectedDrift = readJson('tests/fixtures/epic-k-synthetic-config-drift-report.json');
    const errors = [];

    const evidence = verifyEvidence(receipts, requirements, { asOf: expectedGap.assessedAt });
    errors.push(...evidence.errors);
    if (evidence.report) {
        errors.push(...schemaErrors('schemas/epic-k-evidence-drift-report.schema.json', evidence.report, 'evidence gap report'));
        if (evidence.report.summary.FAIL > 0) errors.push('authoritative evidence intake contains invalid or conflicting receipts');
        try { assert.deepEqual(evidence.report, expectedGap); } catch { errors.push('committed evidence gap report is not deterministic or is stale'); }
    }

    const drift = assessConfigurationDrift(fixtures.baseSnapshot, undefined, { asOf: fixtures.assessmentTime });
    errors.push(...drift.errors);
    if (drift.report) {
        errors.push(...schemaErrors('schemas/epic-k-evidence-drift-report.schema.json', drift.report, 'configuration drift report'));
        try { assert.deepEqual(drift.report, expectedDrift); } catch { errors.push('committed synthetic configuration drift report is not deterministic or is stale'); }
    }

    if (/gid:\/\/shopify\//i.test(JSON.stringify(fixtures))) {
        errors.push('synthetic fixtures must not contain Shopify resource identifiers');
    }
    if (fixtures.fixtureType !== 'synthetic_only' || fixtures.authorityEffect !== 'none'
        || fixtures.containsRealShopifyData !== false) {
        errors.push('K1B-01 fixtures must remain synthetic and confer no authority');
    }
    if (fixtures.fixtureGeneratedAt === fixtures.assessmentTime) {
        errors.push('fixture generation time and explicit assessment time must remain distinct');
    }
    if (evidence.report?.liveCheckoutEnforcement !== 'UNVERIFIED'
        || drift.report?.liveCheckoutEnforcement !== 'UNVERIFIED') {
        errors.push('offline reports must leave live Shopify checkout enforcement UNVERIFIED');
    }
    return { errors, evidenceReport: evidence.report, driftReport: drift.report };
}

function main() {
    const result = validateEpicKEvidence();
    if (result.errors.length) {
        console.error('Epic K evidence and configuration drift validation failed.');
        for (const error of result.errors) console.error(`- ${error}`);
        process.exitCode = 1;
        return;
    }
    console.log('Epic K evidence receipt and normalized snapshot contracts: valid.');
    console.log(`Evidence readiness: ${result.evidenceReport.overallState}; ${result.evidenceReport.summary.BLOCKED} requirements BLOCKED.`);
    console.log(`Synthetic configuration comparison: ${result.driftReport.overallState}; live checkout enforcement UNVERIFIED.`);
    console.log('Operational readiness remains BLOCKED; K1B-01 synthetic fixtures make no live Shopify compliance claim.');
}

if (require.main === module) main();

module.exports = { validateEpicKEvidence };
