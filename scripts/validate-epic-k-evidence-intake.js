'use strict';

const fs = require('node:fs');
const { readJson } = require('./lib/epic-k-policy');
const {
    renderDepartmentalRequestReport,
    validateIntakeManifest,
    validateSubmissionCandidate,
} = require('./lib/epic-k-evidence-intake');

const REPORT_PATH = 'docs/project/epic-k-operational-evidence-request-report.md';
const PREPARATION_AS_OF = '2026-10-24T23:59:59.000Z';

function argumentValue(name) {
    const index = process.argv.indexOf(name);
    return index >= 0 ? process.argv[index + 1] : undefined;
}

function validateCommittedIntake() {
    const manifest = readJson('data/epic-k-evidence-intake-manifest.json');
    const requirements = readJson('data/epic-k-operational-evidence-requirements.json');
    const receipts = readJson('data/epic-k-evidence-receipts.json');
    const evidenceGap = readJson('data/epic-k-evidence-gap-report.json');
    const mapping = readJson('data/epic-k-shopify-source-mapping.json');
    const mappingAcceptance = readJson('data/epic-k-shopify-mapping-acceptance-2026-10-24.json');
    const result = validateIntakeManifest(manifest, requirements, receipts, evidenceGap, mapping, mappingAcceptance, { asOf: PREPARATION_AS_OF });
    const expectedReport = renderDepartmentalRequestReport(manifest, requirements);
    const committedReport = fs.existsSync(REPORT_PATH) ? fs.readFileSync(REPORT_PATH, 'utf8') : null;
    if (committedReport !== expectedReport) result.errors.push('departmental evidence request report is missing or stale; run npm run generate:epic-k-evidence-requests');
    return { result, manifest, requirements };
}

function main() {
    const { result, manifest, requirements } = validateCommittedIntake();
    const submissionPath = argumentValue('--submission');
    if (submissionPath) {
        const asOf = argumentValue('--as-of');
        const candidate = readJson(submissionPath);
        const submission = validateSubmissionCandidate(candidate, manifest, requirements, { asOf });
        result.errors.push(...submission.errors.map((error) => `submission: ${error}`));
        if (!submission.errors.length) console.log(`Submission candidate: ${submission.submissionState}; operational readiness remains BLOCKED.`);
    }
    if (result.errors.length) {
        console.error('Epic K operational evidence intake validation failed.');
        for (const error of result.errors) console.error(`- ${error}`);
        process.exitCode = 1;
        return;
    }
    console.log('Epic K operational evidence intake manifest and departmental report: valid.');
    console.log(`${result.requestCount} evidence requests; ${result.blockedCount}/8 operational requirements remain BLOCKED.`);
    console.log(`Current receipt register entries: ${result.receiptCount}; live checkout enforcement: UNVERIFIED; K-PBI-002: partial.`);
}

if (require.main === module) main();

module.exports = { validateCommittedIntake };
