'use strict';
// Repository/local validation only. No live performance navigation.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawnSync}=require('node:child_process');
const G=require('./lib/epic-f-live-performance-campaign-v3');
assert.equal(process.argv.length,2);
const npm=path.join(path.dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');assert.ok(fs.existsSync(npm));
const env={...process.env,RHINO_EPIC_F_CLEANUP_BINDING:'docs/qa/evidence/epic-f/release-gate-cleanup-source-binding.json',RHINO_EPIC_F_HEADER_FOCUS_BINDING:'docs/qa/evidence/epic-f/header-focus-correction-2026-10-06/source-binding.json'};
const commands=[];
for(const [executable,args]of [
 [process.execPath,['scripts/test-epic-f-live-performance-v3-safety.js']],
 [process.execPath,['scripts/test-epic-f-performance.js']],
 [process.execPath,['scripts/validate-json-registers.js']],
 ['python',['scripts/validate-theme-repository.py']],
 [process.execPath,[npm,'run','validate:epic-f-batch-f8']],
 ['git',['-c','core.safecrlf=false','diff','--check']]
]){
 const name=args.includes('validate:epic-f-batch-f8')?'npm run validate:epic-f-batch-f8':[(executable===process.execPath?'node':executable),...args].join(' ');
 console.log('Running '+name);
 const startedAt=new Date().toISOString(),result=spawnSync(executable,args,{env,encoding:'utf8',maxBuffer:32*1024*1024});
 const log=G.DIR+'/validation-command-'+String(commands.length+1)+'.txt';fs.writeFileSync(log,(result.stdout||'')+(result.stderr||'')+(result.error?String(result.error):''));
 commands.push({command:name,startedAt,completedAt:new Date().toISOString(),exitCode:result.status,log});G.write('repository-validation.json',{assessedAt:new Date().toISOString(),complete:false,commands,newLiveSamples:0});
 console.log(name+': exit '+result.status);assert.equal(result.status,0,'Required validation failed; see '+log);
}
const aggregate=G.read('test-results/epic-f/f8/batch-f8-validation.json');assert.equal(aggregate.exitCode,0);
G.write('f8-current-aggregate.json',aggregate);
G.write('repository-validation.json',{assessedAt:new Date().toISOString(),complete:true,commands,aggregate: {exitCode:aggregate.exitCode,evidence:G.DIR+'/f8-current-aggregate.json'},localLedgerTests:G.read(G.DIR+'/local-tests.json').groups,approvedProfileCacheTests:G.read(G.DIR+'/profile-cache-tests.json').passed,newLiveSamples:0});
console.log(JSON.stringify({complete:true,requiredCommandsPassed:commands.length,currentF1F8Aggregate:0,newLiveSamples:0}));
