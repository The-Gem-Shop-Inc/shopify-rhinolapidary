'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=process.cwd(),V=require('../../scripts/lib/epic-j-j1-portability-v2'),P=require('../../scripts/lib/epic-j-j1-portability-v1');
const scenario=process.argv[2],output=process.argv[3],manifest=JSON.parse(fs.readFileSync(V.CONTRACT,'utf8')),decision=JSON.parse(fs.readFileSync(manifest.ownerDecision.path,'utf8'));
const io={exists:(p,full)=>fs.existsSync(full),read:(p,full)=>fs.readFileSync(full)};let mode='portable';
const c=JSON.parse(fs.readFileSync(P.CONTRACT,'utf8')),traces=JSON.parse(fs.readFileSync(c.privateManifest.path,'utf8')).entries;
if(scenario==='local-exact')mode='local';
if(['portable-no-traces','complete-source','runtime','private-absent'].includes(scenario))io.exists=(p,full)=>!traces.some(t=>t.path===p)&&p!==V.PRIVATE&&fs.existsSync(full);
let target;
if(scenario.startsWith('missing-document-'))target=decision.approved[Number(scenario.slice(-1))].path;
if(scenario==='missing-source')target='assets/cart.js';
if(scenario==='missing-public')target=traces[0].safeSummary;
if(scenario==='missing-clean-evidence')target=manifest.cleanCheckoutEvidence[0].path;
if(scenario==='missing-decision')target=manifest.ownerDecision.path;
if(target){const omitted=target;io.exists=(p,full)=>p!==omitted&&fs.existsSync(full);}
const changed={'js-runtime':'assets/product-form.js','css-runtime':'assets/component-cart-items.css','j1-manifest':'data/epic-j-j1-source-successor.json','j0-contract':'data/epic-j-j0-contract.json','v1-contract':P.CONTRACT,'owner-receipt':'docs/qa/evidence/epic-f/owner-response-activation-2026-10-13/reconciliation.json','commercial':'data/epic-g-commercial-decisions.json','compatibility':'data/epic-e-bom-owner-followup.json','changed-summary':traces[0].safeSummary};
if(scenario.startsWith('changed-document-'))target=decision.approved[Number(scenario.slice(-1))].path;else target=changed[scenario];
if(scenario==='runtime')target=undefined;
if(target)io.read=(p,full)=>p===target?Buffer.concat([fs.readFileSync(full),Buffer.from('\nsynthetic alteration')]):fs.readFileSync(full);
if(scenario==='private-altered'){io.exists=(p,full)=>p===V.PRIVATE||fs.existsSync(full);io.read=(p,full)=>p===V.PRIVATE?Buffer.from('Synthetic altered workbook; no historical private content'):fs.readFileSync(full);}
if(scenario==='trace-altered'){io.exists=(p,full)=>p===traces[0].path||fs.existsSync(full);io.read=(p,full)=>p===traces[0].path?Buffer.from('Synthetic altered trace'):fs.readFileSync(full);}
if(scenario==='checkout-drift')io.read=(p,full)=>p==='.gitattributes'?Buffer.from('"/**" -text\n'):fs.readFileSync(full);
if(scenario==='runtime-newline')io.read=(p,full)=>{const b=fs.readFileSync(full);return p==='assets/product-form.js'?Buffer.from(b.toString('utf8').includes('\r\n')?b.toString('utf8').replaceAll('\r\n','\n'):b.toString('utf8').replaceAll('\n','\r\n')):b;};
if(['decision-changed','decision-repository','decision-audience'].includes(scenario)){
 const d=structuredClone(decision);if(scenario==='decision-repository')d.repository='synthetic/other';else if(scenario==='decision-audience')d.audience='PRIVATE';else d.scope='Synthetic altered approval';
 io.read=(p,full)=>p===manifest.ownerDecision.path?Buffer.from(JSON.stringify(d)):fs.readFileSync(full);
}
if(['extra-exception','wildcard-exception','traversal-exception'].includes(scenario)){
 const d=structuredClone(manifest);d.businessException.path=scenario==='extra-exception'?'docs/product/sixth.xlsx':scenario==='wildcard-exception'?'docs/product/**':'../private.xlsx';
 io.read=(p,full)=>p===V.CONTRACT?Buffer.from(JSON.stringify(d)):fs.readFileSync(full);
}
try{
 let result;
 if(scenario==='approved-documents')result=V.publication({paths:decision.approved.map(r=>r.path)});
 else if(scenario==='private-publication')result=V.publication({paths:[V.PRIVATE]});
 else if(scenario==='trace-publication')result=V.publication({paths:[traces[0].path]});
 else if(scenario==='wrong-repository')result=V.publication({paths:decision.approved.map(r=>r.path),repository:'synthetic/other'});
 else if(scenario==='wrong-audience')result=V.publication({paths:decision.approved.map(r=>r.path),audience:'PRIVATE'});
 else if(['traversal','wildcard'].includes(scenario))result=V.publication({paths:[scenario==='traversal'?'../assets/cart.js':'docs/product/**']});
 else if(scenario==='unknown-source'){io.list=()=>[...c.requiredFiles.map(r=>r.path),'assets/unapproved-source.js'];result=V.verify({mode,io});}
 else if(['sixth-binary','credentials'].includes(scenario)){
   const file=output+'/'+(scenario==='sixth-binary'?'unapproved-sixth.pdf':'synthetic-public.json');fs.mkdirSync(path.dirname(file),{recursive:true});
   fs.writeFileSync(file,scenario==='sixth-binary'?'%PDF synthetic unapproved business document':JSON.stringify({headers:[{name:'Authorization',value:['Bear','er '].join('')+'synthetic-'+ 'x'.repeat(32)}]}));
   result=V.publication({paths:[file]});
 }else if(scenario==='private-alias-tree'){
   const text='100644 blob '+decision.private.historicalGitBlobOid+'\tsynthetic-renamed-business.xlsx\n';
   const tree=cp.execFileSync('git',['mktree','--missing'],{input:text,encoding:'utf8'}).trim();result=V.treeGate({tip:tree,security:false,checkSource:false});
 }else if(scenario==='private-staged-index'){
   const index=path.resolve('.git','epic-j-synthetic-private-index-'+process.pid);const env={...process.env,GIT_INDEX_FILE:index};
   cp.execFileSync('git',['read-tree','--empty'],{env});cp.execFileSync('git',['update-index','--add','--cacheinfo','100644',decision.private.historicalGitBlobOid,V.PRIVATE],{env});
   try{result=V.indexGate({indexFile:index});}finally{fs.unlinkSync(index);}
 }else result=V.verify({mode,io});
 console.log(JSON.stringify({scenario,...result}));process.exitCode=result.status==='PASS'?0:2;
}catch(e){console.log(JSON.stringify({scenario,status:'FAIL',reasonCode:e.code||'FIXTURE_ERROR',...(e.path?{path:e.path}:{})}));process.exitCode=1;}
