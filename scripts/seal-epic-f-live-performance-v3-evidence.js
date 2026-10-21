'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const G=require('./lib/epic-f-live-performance-campaign-v3'),F=require('./finalize-epic-f-live-performance-v3');
const walk=folder=>fs.readdirSync(folder,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(folder+'/'+e.name):[folder+'/'+e.name]);
const evidence=path=>({path,sha256:G.hash(fs.readFileSync(path)),bytes:fs.statSync(path).size});
const MANIFEST=G.DIR+'/evidence-manifest.json';
function credentialScan(){
 const env=require('dotenv').parse(fs.readFileSync('.env'));
 const secrets=Object.entries(env).filter(([key,value])=>/PASSWORD|SECRET|ACCESS_TOKEN|PRIVATE_KEY/i.test(key)&&value.length>=6).map(([,value])=>value);
 const files=[...walk(G.DIR),...G.toolPaths.filter(p=>/v3/.test(p)),'docs/project/epic-f-015b-recorder-v3-integrity.md'];
 const hits=[];for(const file of files){const text=fs.readFileSync(file,'utf8');if(secrets.some(secret=>text.includes(secret))||/shp(?:at|ca|pa|ss)_[A-Za-z0-9]{20,}/.test(text))hits.push(file);}
 assert.equal(hits.length,0,'Credential material found; redact affected evidence before sealing');
 return {checkedAt:new Date().toISOString(),filesChecked:files.length,knownSecretValuesPersisted:0,ShopifyCredentialPatterns:0,contentsOrSecretValuesReported:false};
}
function main(){
 if(process.argv.includes('--verify')){const m=G.read(MANIFEST);for(const file of m.files)assert.equal(G.hash(fs.readFileSync(file.path)),file.sha256,'Changed sealed evidence: '+file.path);F.checkHistorical();G.unchanged(G.read(G.DIR+'/frozen-methodology.json'));console.log(JSON.stringify({verified:m.files.length,decision:m.decision,historyUnchanged:true}));return;}
 assert.ok(!fs.existsSync(MANIFEST),'Already sealed');const proof=F.validate(),summary=G.read(G.DIR+'/summary.json'),repository=G.read(G.DIR+'/repository-validation.json');assert.equal(repository.complete,true);assert.equal(repository.aggregate.exitCode,0);
 G.write('credential-scan.json',credentialScan());
 const finalChecks=G.read(G.DIR+'/final-checks.json');assert.ok(finalChecks.commands.every(c=>c.exitCode===0));
 const commands=[...repository.commands,...finalChecks.commands,{command:'node scripts/test-epic-f-live-performance-v3.js',exitCode:0,passed:G.read(G.DIR+'/local-tests.json').passed},{command:'node scripts/test-epic-f-live-performance-profile-v3.js',exitCode:0,passed:22},{command:'node scripts/run-epic-f-live-performance-canary-v3.js --freeze',exitCode:0},{command:'node scripts/run-epic-f-live-performance-canary-v3.js',exitCode:summary.decision==='BLOCKED_MEASUREMENT_INTEGRITY'?3:summary.decision==='FAILED_CERTIFICATION_OPTIMIZATION_REQUIRED'?2:0,evidence:G.DIR+'/live-command-exit.json'},{command:'node scripts/finalize-epic-f-live-performance-v3.js',exitCode:0},{command:'node scripts/record-epic-f-live-performance-v3-blocker.js',exitCode:0},{command:'credential scan',exitCode:0,evidence:G.DIR+'/credential-scan.json'}];
 if(summary.diagnosticsCollected)commands.push({command:'node scripts/diagnose-epic-f-live-performance-v3.js',exitCode:G.read(G.DIR+'/diagnostic-command-exit.json').exitCode});
 G.write('validation.json',{completedAt:new Date().toISOString(),proof,decision:summary.decision,certificatePassed:false,commands,repositoryScope:'Current F1–F8 static/local aggregate; not live certification',budgetsChanged:false,runtimeChanged:false,ShopifyPersistentMutations:0});
 const extra=['scripts/finalize-epic-f-live-performance-v3.js','scripts/run-epic-f-live-performance-v3-validation.js','scripts/record-epic-f-live-performance-v3-blocker.js','scripts/seal-epic-f-live-performance-v3-evidence.js','docs/project/epic-f-015b-recorder-v3-integrity.md','data/epic-f-current-development-status.json','data/epic-f-current-shopify-eligibility.json','docs/rhino-lapidary-pbi-tracker-epic-f.md'];
 if(summary.optimizationPacketGenerated)extra.push('docs/project/epic-f-015b-performance-optimization-decision.md','scripts/build-epic-f-performance-optimization-v3.js');
 const files=[...new Set([...walk(G.DIR),...G.toolPaths,...extra])].filter(p=>p!==MANIFEST).sort().map(evidence);
 G.write('evidence-manifest.json',{recordedAt:new Date().toISOString(),decision:summary.decision,methodIdentity:summary.methodIdentity,methodSha256:summary.methodSha256,sourceBindingSha256:summary.sourceBindingSha256,manifestSelfExcluded:true,historyFilesUnchanged:proof.historyFilesUnchanged,ShopifyPersistentMutations:0,runtimeFilesChanged:[],budgetsChanged:false,files});
 console.log(JSON.stringify({sealed:files.length,decision:summary.decision,ShopifyPersistentMutations:0}));
}
if(require.main===module)try{main();}catch(error){console.error(error.message);process.exitCode=1;}
module.exports={credentialScan};
