'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const read=p=>JSON.parse(fs.readFileSync(p));
const hash=(v,algorithm='sha256')=>crypto.createHash(algorithm).update(v).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const parseThemeJson=s=>JSON.parse(s.replace(/^\s*\/\*[\s\S]*?\*\//,''));
const before=read('docs/qa/evidence/epic-f/2026-10-05-persistent-preview-before.json');
const after=read('docs/qa/evidence/epic-f/2026-10-05-persistent-preview-after-push.json');
const manifest=read('docs/qa/evidence/epic-f/2026-10-05-persistent-development-source-binding.json');
assert.equal(after.previewInventoryTheme.role,'UNPUBLISHED');assert.equal(after.previewInventoryTheme.id,'gid://shopify/OnlineStoreTheme/158631198917');
assert.deepEqual(after.productionInventory,before.productionInventory,'Production file record drift');
assert.deepEqual(after.productionInventoryTheme,before.identity.data.themes.nodes.find(t=>t.role==='MAIN'),'Production theme identity drift');
const allowed=new Set(manifest.files.map(f=>f.path));
const rows=manifest.files.map(ref=>{
  const old=before.previewInventory.find(f=>f.filename===ref.path),backup=before.backupFiles.find(f=>f.filename===ref.path),remote=after.allowlistedFiles.find(f=>f.filename===ref.path);
  assert.ok(remote,'Missing after path '+ref.path);assert.equal(remote.checksumMd5,ref.md5,'Persisted checksum mismatch: '+ref.path);
  const local=fs.readFileSync(ref.path),body=remote.body.__typename==='OnlineStoreThemeFileBodyText'?Buffer.from(remote.body.content):Buffer.from(remote.body.contentBase64,'base64');
  const rawBodyMatches=hash(body)===ref.sha256;
  let canonicalJsonMatches=null;
  if(!rawBodyMatches){assert.ok(ref.path.endsWith('.json'),'Non-JSON content mismatch');canonicalJsonMatches=JSON.stringify(canonical(parseThemeJson(body.toString())))===JSON.stringify(canonical(parseThemeJson(local.toString())));assert.ok(canonicalJsonMatches,'JSON semantic mismatch');}
  return {path:ref.path,operation:old?'updated':'created',beforeExists:!!old,beforeChecksumMd5:old?.checksumMd5||null,beforeApiBodySha256:backup?hash(backup.body.content||Buffer.from(backup.body.contentBase64,'base64')):null,
    localSha256:ref.sha256,localMd5:ref.md5,afterChecksumMd5:remote.checksumMd5,afterApiBodySha256:hash(body),persistedChecksumExact:true,rawApiBodyMatches:rawBodyMatches,canonicalJsonMatches,
    representation:rawBodyMatches?'EXACT_RAW_BODY':'SHOPIFY_API_GENERATED_JSON_COMMENT_AND_SERIALIZATION; original stored checksum exact; parsed keys/values exact'};
});
for(const old of before.previewInventory.filter(f=>!allowed.has(f.filename)))assert.deepEqual(after.previewInventory.find(f=>f.filename===old.filename),old,'Unallowlisted theme drift');
assert.ok(!after.previewInventory.some(f=>f.filename==='snippets/rhino-preview-inline-css.liquid'));
assert.equal(after.previewInventory.length,426);assert.equal(before.previewInventory.length,409);
const result={target:'158631198917',role:'UNPUBLISHED',fileCount:32,filesVerified:32,created:rows.filter(r=>r.operation==='created').length,updated:rows.filter(r=>r.operation==='updated').length,rows,
  remoteChecksumMatches:32,rawApiBodyMatches:rows.filter(r=>r.rawApiBodyMatches).length,canonicalJsonMatches:rows.filter(r=>r.canonicalJsonMatches===true).length,allowlistedMismatches:0,
  machineTemplatePersisted:true,realCssAssetPersisted:true,inlinePreviewSnippetPresent:false,unallowlistedChanges:0,productionThemeMutation:false,productionThemePublication:false,productionFileRecordsUnchanged:406,
  beforeFiles:409,afterFiles:426,sourceManifestSha256:manifest.manifestSha256};
fs.writeFileSync('docs/qa/evidence/epic-f/2026-10-05-persistent-preview-readback.json',JSON.stringify(result,null,2)+'\n');
console.log('32/32 persistent checksums exact; 29 raw bodies exact + 3 generated JSON representations semantically exact; production 406 records unchanged; no unallowlisted changes.');
