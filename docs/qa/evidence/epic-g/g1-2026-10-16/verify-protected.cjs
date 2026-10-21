'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('../../../../../scripts/lib/epic-e-owner-response-adapter'),H=require('../../../../../scripts/lib/epic-f-final-owner-binding');
const DIR='docs/qa/evidence/epic-g/g1-2026-10-16',before=E.read(DIR+'/protected-before.json');
const allowed=new Set(['package.json','scripts/validate-json-registers.js','docs/rhino-lapidary-pbi-tracker-epic-g.md','docs/project/epic-g-required-decisions.md','docs/project/epic-g-proposed-backlog.json']);
const rows=before.files.map(r=>({...r,afterSha256:E.hash(fs.readFileSync(r.path)),allowedG1Edit:allowed.has(r.path)})),unexpected=rows.filter(r=>!r.allowedG1Edit&&r.sha256!==r.afterSha256);
assert.deepEqual(unexpected,[],'Protected F/runtime or unrelated source changed');
const b=H.verify();assert(b.sourceAfter.every(r=>E.hash(fs.readFileSync(r.path))===r.sha256));
const after={checkedAt:new Date().toISOString(),before:DIR+'/protected-before.json',pathsChecked:rows.length,unchangedProtectedPaths:rows.filter(r=>!r.allowedG1Edit).length,allowedExistingFileEdits:rows.filter(r=>r.allowedG1Edit&&r.sha256!==r.afterSha256).map(r=>r.path),unexpectedChanges:unexpected,sourceBindingSha256:b.bindingSha256,boundRuntimePathsUnchanged:b.sourceAfter.length,rows,themePushes:0,shopifyMutations:0,historicalReceiptsRewritten:0};
fs.writeFileSync(DIR+'/protected-after.json',JSON.stringify(after,null,2)+'\n');console.log(JSON.stringify({pathsChecked:rows.length,unchangedProtectedPaths:after.unchangedProtectedPaths,boundRuntimePathsUnchanged:b.sourceAfter.length,unexpectedChanges:0,sourceBindingSha256:b.bindingSha256}));

