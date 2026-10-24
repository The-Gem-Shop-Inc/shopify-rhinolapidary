'use strict';

const { readJson } = require('./lib/epic-k-policy');
const { validateMappingAcceptance } = require('./lib/epic-k-mapping-acceptance');

function validateCommittedMappingAcceptance() {
    const receipt = readJson('data/epic-k-shopify-mapping-acceptance-2026-10-24.json');
    const mapping = readJson('data/epic-k-shopify-source-mapping.json');
    const snapshot = readJson('data/epic-k-shopify-config-snapshot-2026-10-24.json');
    const provenance = readJson('data/epic-k-shopify-audit-provenance-2026-10-24.json');
    const evidenceGap = readJson('data/epic-k-evidence-gap-report.json');
    const currentDrift = readJson('data/epic-k-shopify-configuration-drift-report-2026-10-24.json');
    return validateMappingAcceptance(receipt, mapping, snapshot, provenance, evidenceGap, currentDrift);
}

function main() {
    const result = validateCommittedMappingAcceptance();
    if (result.errors.length) {
        console.error('Epic K bounded mapping acceptance validation failed.');
        for (const error of result.errors) console.error(`- ${error}`);
        process.exitCode = 1;
        return;
    }
    console.log('Epic K bounded Product Owner technical mapping acceptance: valid.');
    console.log(`${result.acceptedCount} verified mappings accepted; ${result.unresolvedCount} mappings retain their prior unresolved classifications.`);
    console.log('Operational evidence: 8/8 BLOCKED; live checkout enforcement: UNVERIFIED; K-PBI-002: partial.');
}

if (require.main === module) main();

module.exports = { validateCommittedMappingAcceptance };
