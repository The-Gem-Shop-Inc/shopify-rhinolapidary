'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { readJson } = require('./lib/epic-k-policy');
const { renderDepartmentalRequestReport } = require('./lib/epic-k-evidence-intake');

const OUTPUT = 'docs/project/epic-k-operational-evidence-request-report.md';

function generateEvidenceRequestReport() {
    const manifest = readJson('data/epic-k-evidence-intake-manifest.json');
    const requirements = readJson('data/epic-k-operational-evidence-requirements.json');
    const content = renderDepartmentalRequestReport(manifest, requirements);
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
    fs.writeFileSync(OUTPUT, content, 'utf8');
    return { output: OUTPUT, requestCount: manifest.requests.length };
}

function main() {
    const result = generateEvidenceRequestReport();
    console.log(`Epic K departmental evidence request report generated: ${result.output}`);
    console.log(`Requests: ${result.requestCount}; accepted receipts created: 0.`);
}

if (require.main === module) main();

module.exports = { generateEvidenceRequestReport, OUTPUT };
