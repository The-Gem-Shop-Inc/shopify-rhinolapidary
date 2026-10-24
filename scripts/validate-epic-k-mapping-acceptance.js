'use strict';

const { readJson } = require('./lib/epic-k-policy');
const { validateMappingAcceptance } = require('./lib/epic-k-mapping-acceptance');
const { validateEpicKShopifyAudit } = require('./validate-epic-k-shopify-audit');
const { validateRemediationPreflight } = require('./validate-epic-k-remediation-preflight');

function validateCommittedMappingAcceptance() {
    const receipt = readJson('data/epic-k-shopify-mapping-acceptance-2026-10-24.json');
    const mapping = readJson('data/epic-k-shopify-source-mapping.json');
    const snapshot = readJson('data/epic-k-shopify-config-snapshot-2026-10-24.json');
    const provenance = readJson('data/epic-k-shopify-audit-provenance-2026-10-24.json');
    const evidenceGap = readJson('data/epic-k-evidence-gap-report.json');
    const currentDrift = readJson('data/epic-k-shopify-configuration-drift-report-2026-10-24.json');
    const result = validateMappingAcceptance(receipt, mapping, snapshot, provenance, evidenceGap, currentDrift);
    result.errors.push(...validateEpicKShopifyAudit().errors.map((error) => `historical audit: ${error}`));
    result.errors.push(...validateRemediationPreflight().errors.map((error) => `historical remediation projection: ${error}`));
    return result;
}

function main() {
    const result = validateCommittedMappingAcceptance();
    if (result.errors.length) {
        console.error('Epic K bounded mapping acceptance validation failed.');
        for (const error of result.errors) console.error(`- ${error}`);
        process.exitCode = 1;
        return;
    }
    console.log('Epic K complete Product Owner mapping design acceptance: valid.');
    console.log(`${result.acceptedDefinitionCount} mapping definitions accepted; ${result.evidenceLimitationCount} evidence limitations remain explicit.`);
    console.log('Source classifications: 13 verified, 3 partial, 5 require operational evidence, 3 unavailable.');
    console.log('Operational evidence: 8/8 BLOCKED; live checkout enforcement: UNVERIFIED; K-PBI-002: partial.');
}

if (require.main === module) main();

module.exports = { validateCommittedMappingAcceptance };
