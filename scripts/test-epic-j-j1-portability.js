'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),P=require('./lib/epic-j-j1-portability-v1');
const args=process.argv.slice(2),get=k=>args[args.indexOf(k)+1],out=get('--evidence'),scratch=get('--scratch');
if(!args.includes('--evidence')||!args.includes('--scratch'))throw new Error('Explicit unique --evidence and --scratch required');
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'reservation.json'),JSON.stringify({at:new Date().toISOString()}),{flag:'wx'});
const cases=[
 ['local-present','positive',0,null],['all-private-absent','positive',0,null],['required-public-present','positive',0,null],['runtime-accepted','positive',0,null],['summaries-accepted','positive',0,null],['portable-fixture','positive',0,null],
 ['missing-source','negative',1,'REQUIRED_FILE_MISSING'],['runtime-drift','negative',1,'PROTECTED_SOURCE_DRIFT'],['j1-manifest-drift','negative',1,'ANCHOR_DRIFT'],['private-drift','negative',1,'PRIVATE_EVIDENCE_DRIFT'],
 ['eleventh-exclusion','negative',1,'ANCHOR_DRIFT'],['changed-exclusion','negative',1,'ANCHOR_DRIFT'],['summary-substitution','negative',1,'PUBLIC_EVIDENCE_DRIFT'],['private-publication','negative',1,'PRIVATE_EVIDENCE_PUBLICATION'],
 ['credential-publication','negative',1,'PUBLICATION_CREDENTIAL_OR_UNREADABLE_PATH'],['path-manipulation','negative',1,'INVALID_PATH'],['broad-exclusion','negative',1,'ANCHOR_DRIFT'],['schema-eleventh','negative',1,'SCHEMA_INVALID'],
 ['missing-public','negative',1,'REQUIRED_FILE_MISSING'],['owner-receipt-drift','negative',1,'PROTECTED_SOURCE_DRIFT'],['commercial-drift','negative',1,'PROTECTED_SOURCE_DRIFT'],
 ['local-private-absent','negative',1,'PRIVATE_EVIDENCE_REQUIRED_LOCALLY'],['unapproved-file','negative',1,'UNCLASSIFIED_FILE'],['broad-path','negative',1,'INVALID_PATH']
];
const results=[];
for(const [scenario,kind,exit,reason]of cases){
 const root=scenario==='portable-fixture'?scratch:process.cwd();
 const r=cp.spawnSync(process.execPath,[path.resolve('tests/fixtures/epic-j-portability-case.cjs'),scenario,root],{encoding:'utf8',maxBuffer:4*1024*1024,windowsHide:true});
 let report;try{report=JSON.parse(r.stdout.trim());}catch{report={status:'FAIL',reasonCode:'INVALID_CHILD_REPORT'};}
 const status=r.status===exit&&(!reason||report.reasonCode===reason)?'PASS':'FAIL';
 results.push({scenario,kind,expectedExitCode:exit,actualExitCode:r.status,expectedReason:reason,report,status});
 console.log(JSON.stringify({scenario,status,actualExitCode:r.status,reasonCode:report.reasonCode||null}));
}
const result={schemaVersion:1,successor:P.ID,results,passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length,positive:cases.filter(c=>c[1]==='positive').length,negative:cases.filter(c=>c[1]==='negative').length};
fs.writeFileSync(path.join(out,'tests.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});process.exitCode=result.failed?1:0;
