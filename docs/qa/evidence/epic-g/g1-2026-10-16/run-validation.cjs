'use strict';
// Records exact repository-only commands. No Shopify mutation/deployment command is allowed.
const fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path');
const DIR='docs/qa/evidence/epic-g/g1-2026-10-16',commands=[
 'npm run test:epic-g-foundation -- --output '+DIR+'/tests.json',
 'npm run validate:epic-g-foundation -- --fixture --output '+DIR+'/fixture-readiness.json',
 'npm run validate:epic-g-foundation -- --read '+DIR+'/admin-read.json --output '+DIR+'/readiness.json',
 'npm run validate:registers',
 'npm run validate:metafields',
 'npm run validate:product-templates',
 'npm run test:epic-e-admin-audit',
 'npm run test:epic-e-batch-2b',
 'npm run test:epic-e-pbi-009',
 'npm run test:epic-e-batch-3b',
 'npm run test:epic-f-consumer',
 'npm run validate:epic-f-consumer',
 'npm run test:epic-f-context-delivery',
 'node scripts/test-epic-e-owner-response-adapter.js',
 'node scripts/test-epic-f-final-owner-delta.js',
 'node scripts/test-epic-f-final-owner-release.js'
];
const env={...process.env,RHINO_EPIC_F_OWNER_BINDING:'docs/qa/evidence/epic-f/final-006b-bom-delta-2026-10-15/source-binding.json'},results=[];
for(const [i,requestedCommand]of commands.entries()){
 const command=requestedCommand.replace(/^npm /,'npm.cmd ');
 const at=new Date().toISOString(),r=cp.spawnSync('powershell.exe',['-NoProfile','-Command',command],{encoding:'utf8',env,windowsHide:true,maxBuffer:16000000}),log=DIR+'/validation-'+String(i+1).padStart(2,'0')+'.txt';
 fs.writeFileSync(log,(r.stdout||'')+(r.stderr||''));const row={command,startedAt:at,completedAt:new Date().toISOString(),exitCode:r.status,error:r.error?.message||null,log};results.push(row);fs.writeFileSync(DIR+'/validation-commands.json',JSON.stringify({environment:{RHINO_EPIC_F_OWNER_BINDING:env.RHINO_EPIC_F_OWNER_BINDING},results},null,2)+'\n');console.log(JSON.stringify({command,exitCode:r.status}));
}
if(results.some(r=>r.exitCode!==0))process.exitCode=1;
