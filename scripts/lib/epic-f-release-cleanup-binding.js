'use strict';
// Exact, reviewed extraction proof. Historical manifests are never rewritten.
const fs = require('node:fs'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const bindingPath = 'docs/qa/evidence/epic-f/release-gate-cleanup-source-binding.json';
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
const reviewed = {
  'sections/main-product.liquid': {snippet:'snippets/product-inventory.liquid',oldSha256:'49af6088a45eba18dcf25d0fd0cccc79bbab4d64ee7a4c1e2e2d80f6d867fa3d',replacement:"\r\n                  {%- render 'product-inventory', product: product, block: block, section: section -%}"},
  'snippets/card-product.liquid': {snippet:'snippets/card-product-placeholder.liquid',oldSha256:'f2e5707b95ed27dca38bda8e94c01280efd860e2681ed1b094529be47ee954e9',replacement:"\r\n  {% render 'card-product-placeholder', ratio: ratio, extend_height: extend_height, image_shape: image_shape, placeholder_image: placeholder_image, show_vendor: show_vendor, placeholder: placeholder %}"},
  'snippets/facets.liquid': {snippet:'snippets/facets-mobile.liquid',oldSha256:'10ca3c8b139b5d1b39b00ded57a3b42e00368356a0865f13f7f82d85e97a1de9',replacement:"\n  {% render 'facets-mobile', results: results, enable_filtering: enable_filtering, enable_sorting: enable_sorting, filter_type: filter_type, sort_by: sort_by, results_url: results_url, default_presentation: default_presentation, section: section %}"}
};
function binding() { const value=JSON.parse(fs.readFileSync(bindingPath, 'utf8'));assert.equal(value.extractions.length,3);assert.deepEqual(value.extractions.map(r=>r.path).sort(),Object.keys(reviewed).sort());return value; }
function verifyExtraction(row, read = p => fs.readFileSync(p, 'utf8')) {
  assert.ok(reviewed[row.path],'Unreviewed cleanup extraction');
  for(const [key,value]of Object.entries(reviewed[row.path]))assert.equal(row[key],value,'Reviewed extraction contract changed');
  assert.match(row.prefix,/^\{% comment %\}\r\n[^{}%]+\r\n\{%[-]? endcomment [-]?%\}$/,'Prefix must be a comment only');
  const source = read(row.path), snippet = read(row.snippet);
  assert.equal(hash(source), row.newSha256, 'Cleanup source drift: '+row.path);
  assert.equal(hash(snippet), row.snippetSha256, 'Cleanup snippet drift: '+row.snippet);
  assert.ok(snippet.startsWith(row.prefix));
  const body = snippet.slice(row.prefix.length);
  assert.equal(hash(body), row.bodySha256);
  assert.equal(source.split(row.replacement).length - 1, 1);
  const original = source.replace(row.replacement, body);
  assert.equal(hash(original), row.oldSha256, 'Extraction no longer reconstructs history');
  return original;
}
function historicalHashMatches(path, expected) {
  if (hash(fs.readFileSync(path)) === expected) return true;
  if (require('./epic-f-owner-activation-binding').historicalSourceMatches(path,expected)) return true;
  // Exact opt-in development media successor; all prior pins remain immutable.
  if (require('./epic-f-live-media-activation').historicalSourceMatches(path,expected)) return true;
  // Only this authorized header patch can supersede the historical global pin.
  // The original hash and exact rollback body remain immutable evidence.
  const headerBindingPath='docs/qa/evidence/epic-f/header-focus-correction-2026-10-06/source-binding.json';
  if(path==='sections/header.liquid'&&process.env.RHINO_EPIC_F_HEADER_FOCUS_BINDING===headerBindingPath){
    try {
      const H=require('./epic-f-header-focus-correction'),b=H.read(headerBindingPath);
      const {bindingSha256,...body}=b;assert.equal(hash(JSON.stringify(body)),bindingSha256);
      assert.equal(b.identity,'GLOBAL_HEADER_FOCUS_CORRECTION_2026_10_06');
      assert.equal(hash(fs.readFileSync(b.authorityPath)),b.authoritySha256);
      const proof=H.verify(),row=b.files.find(f=>f.path===path);
      assert.equal(row.oldSha256,expected);assert.equal(row.sha256,proof.rows[0].intendedSha256);
      assert.equal(row.sha256,hash(fs.readFileSync(path)));return true;
    } catch { return false; }
  }
  // Opt-in to this cleanup's exact proof, never silently replace a historical pin.
  if (process.env.RHINO_EPIC_F_CLEANUP_BINDING !== bindingPath) return false;
  try { const row=binding().extractions.find(r=>r.path===path); return !!row && row.oldSha256===expected && hash(verifyExtraction(row))===expected; } catch { return false; }
}
function approvedNewSnippet(path) {
  if (require('./epic-f-owner-activation-binding').approvedNewSnippet(path)) return true;
  if (process.env.RHINO_EPIC_F_CLEANUP_BINDING !== bindingPath) return false;
  try { const row=binding().extractions.find(r=>r.snippet===path); if(!row)return false; verifyExtraction(row); return true; } catch { return false; }
}
module.exports = { bindingPath, binding, verifyExtraction, historicalHashMatches, approvedNewSnippet };
