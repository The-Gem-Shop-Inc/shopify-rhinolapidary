'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { runRemediationPreflight, fingerprint } = require('./lib/epic-k-remediation-preflight');
const { schemaErrors } = require('./lib/epic-k-evidence-drift');
const { readJson } = require('./lib/epic-k-policy');

function validateRemediationPreflight() {
    const snapshot = readJson('data/epic-k-shopify-config-snapshot-2026-10-24.json');
    const currentReport = readJson('data/epic-k-shopify-configuration-drift-report-2026-10-24.json');
    const proposal = readJson('data/epic-k-shopify-remediation-proposal-2026-10-24.json');
    const expectedProjection = readJson('data/epic-k-shopify-remediation-projected-drift-report-2026-10-24.json');
    const provenance = readJson('data/epic-k-shopify-audit-provenance-2026-10-24.json');
    const evidenceGap = readJson('data/epic-k-evidence-gap-report.json');
    const policy = readJson('data/epic-k-fulfillment-policy.json');
    const errors = [
        ...schemaErrors('schemas/epic-k-shopify-config-snapshot.schema.json', snapshot, 'source snapshot'),
        ...schemaErrors('schemas/epic-k-shopify-audit-provenance.schema.json', provenance, 'source provenance'),
        ...schemaErrors('schemas/epic-k-fulfillment-policy.schema.json', policy, 'fulfillment policy'),
        ...schemaErrors('schemas/epic-k-evidence-drift-report.schema.json', currentReport, 'current drift report'),
        ...schemaErrors('schemas/epic-k-evidence-drift-report.schema.json', evidenceGap, 'evidence gap report'),
        ...schemaErrors('schemas/epic-k-remediation-proposal.schema.json', proposal, 'remediation proposal'),
        ...schemaErrors('schemas/epic-k-evidence-drift-report.schema.json', expectedProjection, 'projected drift report'),
    ];
    let result = null;
    if (!errors.length) {
        try {
            result = runRemediationPreflight(snapshot, proposal, provenance, evidenceGap, policy);
            assert.deepEqual(result.currentDrift, currentReport);
            assert.deepEqual(result.projectedDrift, expectedProjection);
        } catch (error) {
            errors.push(error.message);
        }
    }
    if (fingerprint(snapshot) !== proposal.source.snapshotFingerprintSha256) errors.push('committed source snapshot fingerprint changed');
    const implementation = fs.readFileSync('scripts/lib/epic-k-remediation-preflight.js', 'utf8');
    if (/\bqueryAdmin\b|\bfetch\s*\(|\bmutation\s+[A-Za-z_]/i.test(implementation)) {
        errors.push('remediation preflight must not contain Shopify collection or mutation execution code');
    }
    if (proposal.authority.executionAuthorized || proposal.authority.shopifyAccessAuthorized) errors.push('proposal cannot authorize execution or Shopify access');
    return { errors, result, evidenceGap };
}

function main() {
    const validation = validateRemediationPreflight();
    if (validation.errors.length) {
        console.error('Epic K remediation preflight validation failed.');
        for (const error of validation.errors) console.error(`- ${error}`);
        process.exitCode = 1;
        return;
    }
    const projected = validation.result.projectedDrift;
    console.log('Epic K remediation proposal and deterministic projection: valid.');
    console.log('Candidates: 2 proposal-only changes; Shopify access and mutations: 0.');
    console.log(`Projected drift: ${projected.overallState}; ${projected.summary.PASS} PASS, ${projected.summary.FAIL} FAIL, ${projected.summary.BLOCKED} BLOCKED, ${projected.summary.UNVERIFIED} aggregate UNVERIFIED.`);
    console.log(`Operational evidence: ${validation.evidenceGap.summary.BLOCKED}/8 BLOCKED; live checkout enforcement UNVERIFIED.`);
}

if (require.main === module) main();

module.exports = { validateRemediationPreflight };
