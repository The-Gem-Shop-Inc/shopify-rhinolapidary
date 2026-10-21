'use strict';
const fs=require('node:fs'),cp=require('node:child_process'),DIR='docs/qa/evidence/epic-g/g1-2026-10-16';
const commands=[
 'npm.cmd run test:epic-g-foundation -- --output '+DIR+'/tests.json',
 'npm.cmd run validate:epic-g-foundation -- --fixture --output '+DIR+'/fixture-readiness.json',
 'npm.cmd run validate:epic-g-foundation -- --read '+DIR+'/admin-read.json --output '+DIR+'/readiness.json',
 'node '+DIR+'/verify-protected.cjs',
 'git diff --check -- package.json scripts/lib/epic-e-admin-audit.js scripts/validate-json-registers.js docs/rhino-lapidary-pbi-tracker-epic-g.md docs/project/epic-g-required-decisions.md docs/project/epic-g-proposed-backlog.json'
],rows=[];
for(const [i,command]of commands.entries()){const r=cp.spawnSync('powershell.exe',['-NoProfile','-Command',command],{encoding:'utf8',windowsHide:true,maxBuffer:16000000}),log=DIR+'/final-validation-'+(i+1)+'.txt';fs.writeFileSync(log,(r.stdout||'')+(r.stderr||''));rows.push({command,exitCode:r.status,log});console.log(JSON.stringify({command,exitCode:r.status}));}
fs.writeFileSync(DIR+'/final-validation-commands.json',JSON.stringify({completedAt:new Date().toISOString(),results:rows},null,2)+'\n');if(rows.some(r=>r.exitCode!==0))process.exitCode=1;

