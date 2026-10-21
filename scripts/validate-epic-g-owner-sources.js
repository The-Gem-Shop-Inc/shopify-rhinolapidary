'use strict';
// Historical owner-proof tests stay historical; run their existing assertions
// with isolated outputs. No source approval or current catalog is rewritten.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),I=require('./lib/epic-g-integrated');
const suites=['test-epic-e-owner-response-adapter.js','test-epic-e-bom-owner-followup.js','test-epic-f-006b-amended.js','test-epic-f-final-owner-delta.js','test-epic-f-bom-contents-compiler.js','test-epic-f-owner-review.js'];
async function run(){
 const dir=I.dir(),rows=[],hook=path.resolve('scripts/lib/epic-g-integrated-evidence.js');fs.mkdirSync(dir+'/owner-source-logs',{recursive:true});
 for(const file of suites){
  const command='node scripts/'+file,row={command,startedAt:new Date().toISOString(),log:dir+'/owner-source-logs/'+file+'.txt'};
  const result=cp.spawnSync(process.execPath,['--require',hook,'scripts/'+file],{encoding:'utf8',windowsHide:true,timeout:120000,env:{...process.env,RHINO_G4_EVIDENCE_DIR:dir}});
  row.exitCode=result.status;row.status=result.error?'BLOCKED':result.status===0?'PASS':'FAIL';row.completedAt=new Date().toISOString();if(result.error)row.reason=result.error.message;
  fs.writeFileSync(row.log,command+'\n'+(result.stdout||'')+(result.stderr||'')+'\nEXIT_CODE='+result.status+'\n');rows.push(row);console.log(JSON.stringify(row));
 }
 I.write('owner-source-commands.json',{schemaVersion:1,scope:'Existing E/F owner-source assertions, isolated outputs; not a renewed receipt',commands:rows,status:I.aggregate(rows),catalogWrites:0});
 if(rows.some(r=>r.status==='FAIL'))process.exitCode=1;else if(rows.some(r=>r.status==='BLOCKED'))process.exitCode=2;return rows;
}
if(require.main===module)run().catch(e=>{console.error(e.stack);process.exitCode=1;});module.exports={run};
