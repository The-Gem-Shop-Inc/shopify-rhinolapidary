'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Ajv2020 = require('ajv/dist/2020');
const {
  identityDigest,
  semanticDigest,
  transitionDigest,
  validateDocument,
  validateLiveEvidence,
} = require('./lib/j2-g4-preview-menu-transition');

const ROOT = path.resolve(__dirname, '..');
const DOCUMENT_PATH = path.join(ROOT, 'data', 'j2-g4-preview-menu-transition.json');
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'j2-g4-preview-menu-transition.schema.json');

function parseArgs(argv) {
  const options = { liveEvidencePath: null, expectedState: 'predecessor', maxAgeMinutes: null };
  for (const arg of argv) {
    if (arg.startsWith('--live-evidence=')) options.liveEvidencePath = arg.slice('--live-evidence='.length);
    else if (arg.startsWith('--expected-state=')) options.expectedState = arg.slice('--expected-state='.length);
    else if (arg.startsWith('--max-age-minutes=')) options.maxAgeMinutes = Number(arg.slice('--max-age-minutes='.length));
    else throw new Error(`Unknown argument ${arg}`);
  }
  return options;
}

function validate(options = {}) {
  const document = JSON.parse(fs.readFileSync(DOCUMENT_PATH, 'utf8'));
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  const schemaValid = ajv.validate(schema, document);
  assert(schemaValid, ajv.errorsText(ajv.errors, { separator: '\n' }));
  validateDocument(document);

  let live = null;
  if (options.liveEvidencePath) {
    const evidencePath = path.resolve(options.liveEvidencePath);
    assert(!evidencePath.toLowerCase().startsWith(ROOT.toLowerCase() + path.sep), 'Live Shopify evidence must remain outside Git');
    live = JSON.parse(fs.readFileSync(evidencePath, 'utf8'));
    const observed = Date.parse(live.observedAt);
    assert(Number.isFinite(observed), 'Live evidence observedAt is invalid');
    const maxAgeMinutes = options.maxAgeMinutes ?? document.evidence.freshnessLimitMinutes;
    const ageMinutes = (Date.now() - observed) / 60000;
    assert(ageMinutes >= 0 && ageMinutes <= maxAgeMinutes, `Live evidence is stale (${ageMinutes.toFixed(1)} minutes; limit ${maxAgeMinutes})`);
    validateLiveEvidence(document, live, options.expectedState || 'predecessor');
  }

  return {
    result: 'PASS',
    transitionId: document.transitionId,
    mutationAuthorized: document.mutationAuthorized,
    predecessorTreeIdentitySha256: identityDigest(document.predecessor.tree),
    proposedTreeSemanticSha256: semanticDigest(document.recommendation.approvedProposedTree),
    transitionSha256: transitionDigest(document),
    liveEvidence: live ? 'PASS' : 'NOT_REQUESTED',
    expectedState: live ? options.expectedState : null,
  };
}

if (require.main === module) {
  try {
    console.log(JSON.stringify(validate(parseArgs(process.argv.slice(2)))));
  } catch (error) {
    console.error(error.stack);
    process.exitCode = 1;
  }
}

module.exports = { validate };
