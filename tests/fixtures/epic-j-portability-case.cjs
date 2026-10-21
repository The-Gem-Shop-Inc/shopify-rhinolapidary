'use strict';
// Child-process fixture: reports classifications only. No real authentication data is copied.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const P=require('../../scripts/lib/epic-j-j1-portability-v1');
const scenario=process.argv[2],root=process.argv[3]||process.cwd();
const manifest=JSON.parse(fs.readFileSync(path.join(root,P.CONTRACT)));
const privateManifest=JSON.parse(fs.readFileSync(path.join(root,manifest.privateManifest.path)));
const privatePaths=new Set(privateManifest.entries.map(r=>r.path));
const firstPrivate=privateManifest.entries[0].path;
const summary=privateManifest.entries[0].safeSummary;
const io={exists:(p,full)=>fs.existsSync(full),read:(p,full)=>fs.readFileSync(full)};
let mode='local';
if(['all-private-absent','portable-fixture'].includes(scenario)){mode='portable';io.exists=(p,full)=>!privatePaths.has(p)&&fs.existsSync(full);}
if(scenario==='local-private-absent')io.exists=(p,full)=>!privatePaths.has(p)&&fs.existsSync(full);
if(scenario==='unapproved-file')io.list=()=>[...manifest.requiredFiles.map(r=>r.path),'assets/unapproved-synthetic.js'];
const omit={ 'missing-source':'assets/cart.js','missing-public':summary };
if(omit[scenario])io.exists=(p,full)=>p!==omit[scenario]&&fs.existsSync(full);
const alter={ 'runtime-drift':'assets/product-form.js','j1-manifest-drift':'data/epic-j-j1-source-successor.json','summary-substitution':summary,'owner-receipt-drift':'docs/qa/evidence/epic-f/owner-response-activation-2026-10-13/reconciliation.json','commercial-drift':'data/epic-g-commercial-decisions.json' };
if(alter[scenario])io.read=(p,full)=>p===alter[scenario]?Buffer.concat([fs.readFileSync(full),Buffer.from('\nfixture alteration')]):fs.readFileSync(full);
if(scenario==='private-drift'){
 const archive=cp.spawnSync('python',['-c',"import io,zipfile,sys;b=io.BytesIO();z=zipfile.ZipFile(b,'w');z.writestr('fixture.txt','Synthetic unrelated archive');z.close();sys.stdout.buffer.write(b.getvalue())"]);
 if(archive.status!==0)throw new Error('Synthetic archive fixture unavailable');
 io.read=(p,full)=>p===firstPrivate?archive.stdout:fs.readFileSync(full);
}
if(['eleventh-exclusion','changed-exclusion','broad-exclusion'].includes(scenario)){
 const changed=structuredClone(privateManifest);
 if(scenario==='eleventh-exclusion')changed.entries.push({...changed.entries[0],path:'docs/qa/unapproved-eleventh.zip'});
 if(scenario==='changed-exclusion')changed.entries[0].originalSha256='0'.repeat(64);
 if(scenario==='broad-exclusion')changed.entries[0].path='docs/qa/**';
 io.read=(p,full)=>p===manifest.privateManifest.path?Buffer.from(JSON.stringify(changed)):fs.readFileSync(full);
}
try{
 let result;
 if(scenario==='private-publication')result=P.publication({root,paths:[firstPrivate]});
 else if(scenario==='credential-publication'){
  const p=manifest.executionOutputRoot+'/fixtures/synthetic-public.json';
  fs.mkdirSync(path.dirname(path.join(root,p)),{recursive:true});
  const value=['Bear','er '].join('')+'synthetic-'+ 'x'.repeat(32);
  fs.writeFileSync(path.join(root,p),JSON.stringify({headers:[{name:'Authorization',value}]}));
  result=P.publication({root,paths:[p]});
 }else if(scenario==='path-manipulation')result=P.publication({root,paths:['../assets/product-form.js']});
 else if(scenario==='broad-path')result=P.publication({root,paths:['docs/qa/**']});
 else if(scenario==='schema-eleventh'){
  P.schema({...privateManifest,entries:[...privateManifest.entries,privateManifest.entries[0]]},JSON.parse(fs.readFileSync(path.join(root,manifest.privateSchema.path))));
  result={status:'PASS'};
 }else{
  result=P.verify({root,mode,io});
  if(scenario==='runtime-accepted'&&result.originalJ1!=='J1-2026-10-20-NATIVE-CART')throw new Error('Wrong runtime successor');
  if(scenario==='summaries-accepted'&&privateManifest.entries.length!==10)throw new Error('Missing safe summaries');
 }
 console.log(JSON.stringify({scenario,...result}));process.exitCode=result.status==='PASS'?0:2;
}catch(e){console.log(JSON.stringify({scenario,status:'FAIL',reasonCode:e.code||'FIXTURE_ERROR',...(e.path?{path:e.path}:{})}));process.exitCode=1;}
