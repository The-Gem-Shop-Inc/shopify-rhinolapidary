'use strict';
const fs = require('node:fs');
const { read, hash, bytes, loadContext, classification } = require('./lib/epic-f-consumer');
const { validateRenderedText } = require('./validate-brand-claims');

function buildCleanup() {
  const source = 'docs/qa/evidence/epic-f/2026-09-10-machine-admin-read.json';
  const observation = read(source);
  const context = loadContext();
  return { schemaVersion: 1, planId: 'F1-CONTENT-CLEANUP', state: 'proposed_not_executable', mutationAuthorized: false,
    source: { path: source, sha256: hash(fs.readFileSync(source)), capturedAt: observation.capturedAt },
    owners: ['Content / Brand', 'Product Owner', 'Shopify Admin Owner', 'Legal / Claims'],
    requiredBeforeExecution: ['Fresh exact-GID Product and SEO before-state read', 'Approved omission scope and dated Product Owner/Admin GO',
      'Bounded mutation plan with input hashes, dry run, rollback and after verification under existing Admin change governance'],
    externalExposure: 'Theme containment cannot remove Shopify-hosted Product JSON/API/feed or app-controlled copies. Native cleanup and external verification remain blocked pending separately governed execution.',
    rows: observation.data.nodes.map(p => {
      if (classification(context, p.id) !== 'machine') throw new Error('Cleanup input has wrong Product/class');
      return { productGid: p.id, fields: [
        { field: 'Product.descriptionHtml', proposedValue: '', beforeState: 'dated_observation', beforeSha256: hash(p.descriptionHtml) },
        { field: 'Product.seo.description', proposedValue: '', beforeState: 'not_queried', beforeSha256: null },
        { field: 'Product.seo.title', proposedValue: '', beforeState: 'not_queried', beforeSha256: null },
      ], sourceClaimFindings: validateRenderedText(p.id, p.descriptionHtml),
      mediaReviewIds: p.media.nodes.map(m => m.id), mediaDisposition: 'suppressed_in_theme_pending_F-DEC-002; no_media_mutation_proposed' };
    }) };
}
if (require.main === module) {
  fs.writeFileSync('data/epic-f-content-cleanup-plan.json', bytes(buildCleanup()));
  console.log('Generated proposed exact-GID content omission scope; no executable mutation.');
}
module.exports = { buildCleanup };
