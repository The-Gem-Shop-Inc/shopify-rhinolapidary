'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const args=process.argv.slice(2),out=args[args.indexOf('--evidence')+1];if(!args.includes('--evidence')||!out)throw new Error('Explicit isolated --evidence required');
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'reservation.json'),JSON.stringify({at:new Date().toISOString()}),{flag:'wx'});
const cases=[...['local-exact','approved-documents','private-absent','portable-no-traces','complete-source','runtime'].map(s=>[s,'positive',0,null]),
 ['private-staged-index','negative',1,'PRIVATE_BUSINESS_PUBLICATION'],['private-alias-tree','negative',1,'PRIVATE_BUSINESS_BYTES_PUBLICATION'],['private-publication','negative',1,'PRIVATE_BUSINESS_PUBLICATION'],['trace-publication','negative',1,'PRIVATE_EVIDENCE_PUBLICATION'],['private-altered','negative',1,'PRIVATE_BUSINESS_DRIFT'],
 ...[0,1,2,3].map(i=>['missing-document-'+i,'negative',1,'REQUIRED_FILE_MISSING']),...[0,1,2,3].map(i=>['changed-document-'+i,'negative',1,'PROTECTED_SOURCE_DRIFT']),
 ['wrong-repository','negative',1,'PUBLICATION_SCOPE_INVALID'],['wrong-audience','negative',1,'PUBLICATION_SCOPE_INVALID'],['decision-repository','negative',1,'OWNER_SCOPE_INVALID'],['decision-audience','negative',1,'OWNER_SCOPE_INVALID'],['missing-decision','negative',1,'OWNER_DECISION_MISSING'],['decision-changed','negative',1,'OWNER_DECISION_DRIFT'],
 ['sixth-binary','negative',1,'UNAPPROVED_BUSINESS_BINARY'],['extra-exception','negative',1,'V2_CONTRACT_DRIFT'],['wildcard-exception','negative',1,'V2_CONTRACT_DRIFT'],['traversal-exception','negative',1,'V2_CONTRACT_DRIFT'],
 ['js-runtime','negative',1,'PROTECTED_SOURCE_DRIFT'],['css-runtime','negative',1,'PROTECTED_SOURCE_DRIFT'],['j1-manifest','negative',1,'ANCHOR_DRIFT'],['j0-contract','negative',1,'HISTORICAL_CONTRACT_DRIFT'],['v1-contract','negative',1,'PORTABILITY_CONTRACT_DRIFT'],['missing-source','negative',1,'REQUIRED_FILE_MISSING'],['missing-public','negative',1,'REQUIRED_FILE_MISSING'],['changed-summary','negative',1,'PROTECTED_SOURCE_DRIFT'],['owner-receipt','negative',1,'PROTECTED_SOURCE_DRIFT'],['commercial','negative',1,'PROTECTED_SOURCE_DRIFT'],['compatibility','negative',1,'PROTECTED_SOURCE_DRIFT'],['trace-altered','negative',1,'PRIVATE_EVIDENCE_DRIFT'],['credentials','negative',1,'PUBLICATION_CREDENTIAL_OR_UNREADABLE_PATH'],['traversal','negative',1,'INVALID_PATH'],['wildcard','negative',1,'INVALID_PATH'],['unknown-source','negative',1,'UNCLASSIFIED_FILE']];
const results=[];
for(const [scenario,kind,exit,reason]of cases){
 if(scenario==='local-exact'&&!fs.existsSync(JSON.parse(fs.readFileSync('data/epic-j-private-evidence-v1.json','utf8')).entries[0].path)){
   results.push({scenario,kind,status:'NOT APPLICABLE',reason:'Private local originals deliberately absent from clean published checkout; portable acceptance tested separately.'});continue;
 }
 const r=cp.spawnSync(process.execPath,['tests/fixtures/epic-j-portability-v2-case.cjs',scenario,out+'/fixtures'],{encoding:'utf8',maxBuffer:2*1024*1024,windowsHide:true});let report;
 try{report=JSON.parse(r.stdout.trim());}catch{report={reasonCode:'INVALID_CHILD_REPORT'};}
 const ok=r.status===exit&&(!reason||report.reasonCode===reason);results.push({scenario,kind,expectedExitCode:exit,actualExitCode:r.status,expectedReason:reason,report,status:ok?'PASS':'FAIL'});
 fs.writeFileSync(path.join(out,'tests.json'),JSON.stringify({results,passed:results.filter(r=>r.status==='PASS').length,failed:results.filter(r=>r.status==='FAIL').length},null,2)+'\n');
 console.log(JSON.stringify({scenario,status:ok?'PASS':'FAIL',actualExitCode:r.status,actualReason:report.reasonCode||null}));
}
process.exitCode=results.some(r=>r.status==='FAIL')?1:0;
