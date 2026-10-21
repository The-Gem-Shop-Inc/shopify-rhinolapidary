'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const M=require('./lib/epic-f-live-machine-activation');
function validate(){const plan=M.read(M.PLAN),after=M.read(M.DIR+'/live-after-push-raw.json'),before=M.read(M.DIR+'/theme-before-inventory.json');
 const checks=plan.files.map(f=>{
  const r=after.files.find(r=>r.filename===f.path);assert.ok(r);const json=f.path.endsWith('.json'),normalize=s=>s.replace(/\r\n/g,'\n');
  const sourceMatch=json?M.digest(M.parseJson(r.body.content))===M.digest(M.parseJson(f.intendedBody)):normalize(r.body.content)===normalize(f.intendedBody);
  return {path:f.path,checksumMatches:[f.intendedRawMd5,f.intendedLfMd5].includes(r.checksumMd5),storedChecksumMd5:r.checksumMd5,rawSourceBodyEqual:r.body.content===f.intendedBody,sourceMatch,comparison:json?'Exact intended stored MD5 plus parsed JSON equality; Shopify generated comment is serialization only':'Exact raw source bytes where retained, otherwise CRLF-to-LF only; exact intended raw/LF MD5'};
 });
 const unplanned=after.inventory.filter(r=>!plan.files.some(f=>f.path===r.filename)&&(!before.live.files.find(f=>f.filename===r.filename)||before.live.files.find(f=>f.filename===r.filename).checksumMd5!==r.checksumMd5));
 const missing=before.live.files.filter(f=>!after.inventory.some(r=>r.filename===f.filename));
 const result={assessedAt:new Date().toISOString(),checks,filesVerified:checks.filter(c=>c.checksumMatches&&c.sourceMatch).length,unplannedChanges:unplanned,missingFiles:missing,inventoryCount:after.inventory.length,machineTemplatePresent:after.inventory.some(f=>f.filename==='templates/product.machine.json'),previewInlineSnippetPresent:after.inventory.some(f=>f.filename==='snippets/rhino-preview-inline-css.liquid')};
 fs.writeFileSync(M.DIR+'/live-source-readback.json',JSON.stringify(result,null,2)+'\n');assert.equal(result.filesVerified,28);assert.equal(unplanned.length,0);assert.equal(missing.length,0);assert.equal(result.previewInlineSnippetPresent,false);console.log(JSON.stringify({verified:result.filesVerified,unplanned:unplanned.length,missing:missing.length,machineTemplatePresent:result.machineTemplatePresent}));return result;
}
if(require.main===module)validate();module.exports={validate};
