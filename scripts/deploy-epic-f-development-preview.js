'use strict';
// Persistent development deployment only; target and exact source boundary are fixed.
const fs = require('node:fs'), assert = require('node:assert/strict'), cp = require('node:child_process');
const { hash, authorize } = require('./lib/e-mut-020-development-execution');
const read = p => JSON.parse(fs.readFileSync(p));
const TARGET = '158631198917';
const manifestPath = 'docs/qa/evidence/epic-f/2026-10-05-persistent-development-source-binding.json';
function parsePushResult(stdout) {
  // --strict emits Theme Check JSON before the --json deployment result.
  const candidates=[];
  try {candidates.push(JSON.parse(stdout));} catch {
    for(const line of stdout.split(/\r?\n/))try{candidates.push(JSON.parse(line));}catch{}
  }
  const result=candidates.filter(v=>v?.theme);
  assert.equal(result.length,1,'Expected exactly one deployment JSON object');
  assert.equal(String(result[0].theme.id),TARGET);assert.equal(result[0].theme.role,'unpublished');return result[0];
}
function verify() {
  authorize();
  const reconciliation = read('docs/qa/evidence/epic-e/E-MUT-020-2026-10-05-reconciliation.json');
  assert.equal(reconciliation.state, 'EXECUTED_AND_RECONCILED'); assert.equal(reconciliation.definitionRowsReconciled, 38);
  for (const ref of reconciliation.sources) assert.equal(hash(fs.readFileSync(ref.path)),ref.sha256);
  const manifest = read(manifestPath); assert.equal(manifest.targetThemeId,TARGET); assert.equal(manifest.fileCount,32);
  for (const ref of manifest.sourceAuthorities) assert.equal(hash(fs.readFileSync(ref.path)),ref.sha256);
  assert.equal(hash(JSON.stringify(manifest.files)),manifest.manifestSha256);
  for (const ref of manifest.files) assert.equal(hash(fs.readFileSync(ref.path)),ref.sha256,'Source drift: '+ref.path);
  assert.ok(!manifest.files.some(r=>/preview-inline|overrides\.json/.test(r.path)));
  const before = read('docs/qa/evidence/epic-f/2026-10-05-persistent-preview-before.json');
  assert.ok(Date.now()-Date.parse(before.completedAt)<60*60*1000,'Stale target/backup');
  const themes = before.identity.data.themes; assert.equal(themes.pageInfo.hasNextPage,false);
  const target = themes.nodes.find(t=>t.id===`gid://shopify/OnlineStoreTheme/${TARGET}`);
  assert.equal(target.name,'Rhino Lapidary - Preview'); assert.equal(target.role,'UNPUBLISHED');
  const live=themes.nodes.filter(t=>t.role==='MAIN'); assert.equal(live.length,1); assert.notEqual(live[0].id,target.id);
  for(const row of manifest.files){const remote=before.previewInventory.find(f=>f.filename===row.path);const backup=before.backupFiles.find(f=>f.filename===row.path);assert.equal(!!remote,!!backup,'Backup gap: '+row.path);if(remote){assert.equal(remote.checksumMd5,backup.checksumMd5);assert.ok(['OnlineStoreThemeFileBodyText','OnlineStoreThemeFileBodyBase64'].includes(backup.body?.__typename));}}
  assert.deepEqual(read('test-results/e-mut-020-development/theme-check.json'),[],'Theme Check must have zero findings');
  const regression=read('test-results/epic-f/f8/batch-f8-validation.json');
  assert.equal(regression.exitCode,0,'Current F1–F8 aggregate required');
  assert.ok(Date.now()-Date.parse(regression.assessedAt)<60*60*1000,'Fresh F1–F8 aggregate required');
  return manifest;
}
async function run() {
  const manifest=verify();
  const cli='C:/Users/dajem/AppData/Local/JetBrains/WebStorm2026.2/acp-agents/.runtimes/node/24.13.0/node_modules/@shopify/cli/bin/run.js';
  const args=[cli,'theme','push','--store','sz5dnk-nf.myshopify.com','--theme',TARGET,'--path','.',...manifest.files.flatMap(r=>['--only',r.path]),'--nodelete','--strict','--json'];
  const cleanEnv=Object.fromEntries(Object.entries(process.env).filter(([key])=>!/^SHOPIFY_FLAG_/i.test(key)));
  Object.assign(cleanEnv,{CI:'1',SHOPIFY_CLI_NO_ANALYTICS:'1',SHOPIFY_CLI_AUTO_UPGRADE:'0',SHOPIFY_CLI_DISABLE_AUTO_UPGRADE:'1',OPT_OUT_INSTRUMENTATION:'true'});
  assert.ok(!args.some(a=>['--live','--publish','--allow-live','--unpublished'].includes(a)));
  const version=cp.spawnSync(process.execPath,[cli,'version'],{env:cleanEnv,encoding:'utf8'});assert.equal(version.status,0);assert.match(version.stdout,/4\.8\.3/);
  const directory='test-results/e-mut-020-development';
  fs.writeFileSync(directory+'/persistent-push-reservation.json',JSON.stringify({target:TARGET,reservedAt:new Date().toISOString(),manifestSha256:manifest.manifestSha256})+'\n',{flag:'wx'});
  const startedAt=new Date().toISOString(); let stdout='',stderr='';
  const child=cp.spawn(process.execPath,args,{env:cleanEnv,stdio:['ignore','pipe','pipe'],windowsHide:true});
  child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
  const exitCode=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
  const sanitize=s=>String(s).replace(/shp[a-z]+_[A-Za-z0-9_-]+/gi,'[TOKEN_REDACTED]').replace(/(?:authorization|set-cookie|cookie)\s*[:=][^\r\n]*/gi,'[CREDENTIAL_REDACTED]').replace(/https?:\/\/[^\s"'<>]*shopifypreview\.com[^\s"'<>]*/gi,'[SIGNED_PREVIEW_REDACTED]');
  let result,parseError;try{result=parsePushResult(stdout);}catch(error){result=null;parseError=error.message;}
  const record={startedAt,completedAt:new Date().toISOString(),cliVersion:'4.8.3',command:['shopify',...args.slice(1)],target:TARGET,requiredRole:'UNPUBLISHED',fileCount:32,manifestSha256:manifest.manifestSha256,exitCode,result,parseError,stdout:sanitize(stdout),stderr:sanitize(stderr),productionMutation:false,publication:false};
  fs.writeFileSync('docs/qa/evidence/epic-f/2026-10-05-persistent-preview-push.json',sanitize(JSON.stringify(record,null,2))+'\n');
  stdout='';stderr='';
  assert.equal(exitCode,0,'Preview push failed; inspect sanitized evidence before any retry');assert.equal(String(result?.theme?.id),TARGET);assert.equal(result.theme.role,'unpublished');
  console.log(JSON.stringify({exitCode,theme:result.theme,fileCount:32}));
}
if(require.main===module){if(process.argv.includes('--verify-only')){verify();console.log('Persistent deployment boundary verified; no remote write.');}else if(process.argv.includes('--run'))run().catch(e=>{console.error(e.message);process.exitCode=1;});else throw new Error('Use --verify-only or --run');}
module.exports={verify,parsePushResult};
