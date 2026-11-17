'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const MANIFEST_PATH = 'data/j2-g4-phase-c-corrective-manifest.json';
const PHASE_B_DIGEST = 'c59f3d8ea6a9c4d62cf477e698ef341845066715b2a1007069c5402d745500ec';
const sha256 = (body) => crypto.createHash('sha256').update(body).digest('hex');

function validate(manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')), read = (file) => fs.readFileSync(file)) {
  const errors = [];
  const fail = (condition, message) => { if (!condition) errors.push(message); };
  fail(manifest.releaseId === 'J2-G4-PHASE-C-CORRECTIVE-RC1', 'Corrective release identity mismatch.');
  fail(manifest.historicalEvidence.phaseBTransport === 'FAILED_EXACT_READBACK', 'Historical Phase B failure was reclassified.');
  fail(manifest.historicalEvidence.phaseBCandidateDigest === PHASE_B_DIGEST, 'Historical Phase B digest changed.');
  fail(manifest.historicalEvidence.phaseBApplyBindingConsumed === true, 'Consumed Phase B Apply binding is not preserved.');
  fail(manifest.authorization.uploadAuthorized === false, 'Corrective manifest cannot authorize an upload.');
  fail(manifest.authorization.phaseBApplyTokenReusable === false, 'Corrective manifest cannot reuse the Phase B Apply token.');
  fail(manifest.target.productionExcluded === true && manifest.target.productionThemeId === '158579622085', 'Production exclusion is missing.');
  fail(manifest.target.previewThemeId === '158631198917' && manifest.target.requiredPreviewRole === 'UNPUBLISHED', 'Preview identity or role mismatch.');
  fail(manifest.rollback.requiredBeforeAnyFutureApply === true && manifest.rollback.mustUseNewTimestampedArchive === true
    && manifest.rollback.historicalArchiveMayBeOverwritten === false, 'Fresh non-overwriting rollback requirements are incomplete.');
  fail(manifest.cartAcceptance.retainedCartType === 'notification' && manifest.cartAcceptance.liveDrawerCoverageClaimedForThisPreview === false,
    'Cart acceptance must remain configuration-aware.');

  const sorted = [...manifest.runtimeFiles].sort((a, b) => a.path.localeCompare(b.path));
  fail(sorted.length === 7, 'Corrective release must contain exactly seven runtime paths.');
  const tuples = [];
  for (const entry of sorted) {
    let body;
    try { body = read(entry.path); } catch (error) { errors.push(`${entry.path}: ${error.message}`); continue; }
    fail(sha256(body) === entry.candidateSha256, `${entry.path}: candidate SHA-256 mismatch.`);
    fail(body.length === entry.candidateBytes, `${entry.path}: candidate byte length mismatch.`);
    tuples.push(`${entry.path}\0${sha256(body)}\0${body.length}\n`);

    const remotePath = path.join(manifest.currentPreviewSnapshot, ...entry.path.split('/'));
    const remoteExists = fs.existsSync(remotePath);
    if (entry.operation === 'ADD') {
      fail(!remoteExists && entry.deployedSha256 === null && entry.deployedBytes === null,
        `${entry.path}: authorized addition already exists or has a deployed digest.`);
    } else {
      fail(remoteExists, `${entry.path}: deployed comparison body is missing.`);
      if (remoteExists) {
        const remote = fs.readFileSync(remotePath);
        fail(sha256(remote) === entry.deployedSha256, `${entry.path}: deployed SHA-256 mismatch.`);
        fail(remote.length === entry.deployedBytes, `${entry.path}: deployed byte length mismatch.`);
        fail(entry.deployedSha256 !== entry.candidateSha256, `${entry.path}: manifest claims a modification without a byte difference.`);
      }
    }
  }
  const calculatedCandidateDigest = sha256(tuples.join(''));
  fail(calculatedCandidateDigest === manifest.candidateDigest,
    `Corrective candidate digest mismatch: expected ${manifest.candidateDigest}, calculated ${calculatedCandidateDigest}.`);
  fail(manifest.candidateDigest !== PHASE_B_DIGEST, 'Corrective candidate cannot reuse the Phase B digest.');
  fail(JSON.stringify(manifest.newDependencies) === JSON.stringify(['snippets/rhino-product-card-media-eligibility.liquid']),
    'New dependency accounting mismatch.');
  return errors;
}

function main() {
  const errors = validate();
  if (errors.length) {
    console.error('J2/G4 Phase C corrective release validation failed.');
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  console.log(`J2/G4 Phase C corrective release candidate valid: ${manifest.runtimeFiles.length} paths; digest ${manifest.candidateDigest}.`);
  console.log('Upload authorization: false; required role: UNPUBLISHED; production excluded; fresh rollback archive required before any future Apply.');
}

if (require.main === module) main();
module.exports = { validate, MANIFEST_PATH, PHASE_B_DIGEST };
