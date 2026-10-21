'use strict';
const fs = require('node:fs');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const hash = (bytes, algorithm = 'sha256') => crypto.createHash(algorithm).update(bytes).digest('hex');
const read = p => JSON.parse(fs.readFileSync(p));
const preparationPath = 'data/epic-f-shell-only-release-preparation.json';
const cleanupPath = 'docs/qa/evidence/epic-f/release-gate-cleanup-source-binding.json';
const prep = read(preparationPath), cleanup = read(cleanupPath);
for (const row of cleanup.extractions) require('./lib/epic-f-release-cleanup-binding').verifyExtraction(row);
const files = prep.previewEnvelope.deploymentFiles.map(ref => {
  const extraction = cleanup.extractions.find(r => r.path === ref.path);
  if (extraction) assert.equal(extraction.oldSha256, ref.sha256);
  return {path:ref.path,sha256:extraction?.newSha256 || ref.sha256};
});
for (const source of cleanup.additionalPreviewSources) if (!files.some(r => r.path === source.path)) files.push(source);
assert.equal(files.length, 32);
assert.equal(new Set(files.map(r => r.path)).size, 32);
for (const row of files) {
  assert.match(row.path, /^(assets|layout|locales|sections|snippets|templates)\/[a-z0-9_.-]+$/);
  assert.ok(!row.path.includes('preview-inline'));
  const bytes = fs.readFileSync(row.path); assert.equal(hash(bytes), row.sha256, 'Source drift: ' + row.path);
  row.md5 = hash(bytes, 'md5'); row.bytes = bytes.length;
}
assert.equal(files.find(r => r.path === 'assets/rhino-custom.css').sha256, '32f44d332f5b1d51b95213292c54d6e5c17751ebf4e79878eba4e2c17ce5f961');
assert.ok(fs.readFileSync('layout/theme.liquid','utf8').includes("{{ 'rhino-custom.css' | asset_url | stylesheet_tag }}"));
const output = {schemaVersion:1,kind:'PERSISTENT_DEVELOPMENT_PREVIEW_SOURCE_BINDING',targetThemeId:'158631198917',requiredRole:'UNPUBLISHED',shopDomain:'sz5dnk-nf.myshopify.com',
  sourceAuthorities:[preparationPath,cleanupPath].map(path=>({path,sha256:hash(fs.readFileSync(path))})), fileCount:files.length,
  files, manifestSha256:hash(JSON.stringify(files)), transport:'REAL_REPOSITORY_CSS_ASSET', noVirtualInlineSnippet:true, noProductionPublication:true};
const path = 'docs/qa/evidence/epic-f/2026-10-05-persistent-development-source-binding.json';
fs.writeFileSync(path, JSON.stringify(output,null,2)+'\n'); console.log(JSON.stringify(output));
