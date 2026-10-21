'use strict';
// One-time, reviewable contract construction; never invoke automatically from validation.
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process'),crypto=require('node:crypto');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),read=p=>JSON.parse(fs.readFileSync(p));
const directory=fs.readFileSync('.git/epic-j-portability-evidence-path','utf8').trim(),start=read(directory+'/starting-state.json');
const j1=read('data/epic-j-j1-source-successor.json'),before=read(j1.before.path),privateManifest=read('data/epic-j-private-evidence-v1.json');
const privatePaths=new Set(privateManifest.entries.map(r=>r.path)),protectedPaths=new Set(read(j1.baseline.path).protectedSources.map(r=>r.path));
const requiredFiles=[],disposableFiles=[];
for(const [p,original]of Object.entries(start.sources)){
 if(privatePaths.has(p))continue;
 const disposable=!before[p]&&p.startsWith(j1.evidenceDirectory+'/')&&/\/(?:artifacts|cart-artifacts|machine-artifacts)\//.test(p);
 const classification=disposable?'DISPOSABLE_EXECUTION_OUTPUT':protectedPaths.has(p)||!p.startsWith('docs/qa/evidence/')||/\.(?:js|cjs|py|liquid|css)$/.test(p)||/owner-|receipt|source-binding|contract|reconciliation|approval|release|binding/.test(p)?'PROTECTED_APPLICATION_SOURCE':'PUBLIC_REPOSITORY_EVIDENCE';
 const row={path:p,sha256:original,classification,reason:disposable?'Exact generated J1 browser artifact; acceptance is recorded separately in immutable JSON reports. Never mandatory or publication-approved.':before[p]?'Preserve predecessor source/evidence identity, with only the already reviewed J1 deltas.':'Preserve the existing J0/J1 and reconciliation source/evidence identity.'};
 (disposable?disposableFiles:requiredFiles).push(row);
}
for(const e of privateManifest.entries){const p=e.safeSummary;requiredFiles.push({path:p,sha256:hash(fs.readFileSync(p)),classification:'PUBLIC_REPOSITORY_EVIDENCE',reason:'Minimal allowlisted historical summary; not regenerated acceptance.'});}
for(const n of fs.readdirSync(directory)){
 const p=directory+'/'+n;if(!fs.statSync(p).isFile())continue;
 requiredFiles.push({path:p,sha256:hash(fs.readFileSync(p)),classification:'PUBLIC_REPOSITORY_EVIDENCE',reason:'Metadata-only portability audit; independent evidence identity.'});
}
const implementationPaths=[
 'data/epic-j-private-evidence-v1.json','schemas/epic-j-private-evidence-v1.schema.json','schemas/epic-j-portability-v1.schema.json','schemas/epic-j-portable-summary-v1.schema.json',
 'scripts/lib/epic-j-evidence-scan.py','scripts/build-epic-j-portability-summaries.py','scripts/lib/epic-j-j1-portability-v1.js','scripts/lib/epic-j-j1-portable-activation.js',
 'scripts/validate-epic-j-j1-portable.js','scripts/test-epic-j-j1-portability.js','tests/fixtures/epic-j-portability-case.cjs','scripts/build-epic-j-portability-contract.js'
];
const implementation=implementationPaths.map(p=>{let b=fs.readFileSync(p);if(p==='scripts/lib/epic-j-j1-portability-v1.js')b=Buffer.from(b.toString('utf8').replace(/const CONTRACT_SHA256 = '[a-f0-9]{64}';/,"const CONTRACT_SHA256 = 'PORTABILITY_MANIFEST_PIN_PENDING';"));return{path:p,sha256:hash(b)};});
const c={schemaVersion:1,id:'J1-EVIDENCE-PORTABILITY-V1-2026-10-20',predecessor:{path:'data/epic-j-j1-source-successor.json',sha256:'6656356c225ee086c611381152d196b19e79782ba6dbe9a2ef07d14ad4f868db'},privateManifest:{path:'data/epic-j-private-evidence-v1.json',sha256:hash(fs.readFileSync('data/epic-j-private-evidence-v1.json'))},privateSchema:{path:'schemas/epic-j-private-evidence-v1.schema.json',sha256:hash(fs.readFileSync('schemas/epic-j-private-evidence-v1.schema.json'))},requiredFiles,disposableFiles,implementation,evidenceDirectory:directory,executionOutputRoot:directory+'/execution',receiptExpiresAt:'2026-10-22T20:26:37.102Z',authorization:'REPOSITORY_GOVERNANCE_AND_TESTING_ONLY_NO_GIT_OR_SHOPIFY_WRITES'};
const manifestPath='data/epic-j-j1-portability-v1.json';
if(fs.existsSync(manifestPath)){
 if(!process.argv.includes('--draft-revision'))throw new Error('Existing draft requires explicit --draft-revision; historical J0/J1 never rewritten');
 const old=hash(fs.readFileSync(manifestPath)),archive=directory+'/execution/draft-revisions';fs.mkdirSync(archive,{recursive:true});
 fs.copyFileSync(manifestPath,archive+'/contract-'+old+'.json',fs.constants.COPYFILE_EXCL);
 fs.copyFileSync('scripts/lib/epic-j-j1-portability-v1.js',archive+'/verifier-before-draft-'+Date.now()+'.js',fs.constants.COPYFILE_EXCL);
}
fs.writeFileSync(manifestPath,JSON.stringify(c,null,2)+'\n',{flag:process.argv.includes('--draft-revision')?'w':'wx'});
const verifier='scripts/lib/epic-j-j1-portability-v1.js';const text=fs.readFileSync(verifier,'utf8');
if(!/const CONTRACT_SHA256 = '(?:PORTABILITY_MANIFEST_PIN_PENDING|[a-f0-9]{64})';/.test(text))throw new Error('Missing explicit contract pin');
fs.writeFileSync(verifier,text.replace(/const CONTRACT_SHA256 = '(?:PORTABILITY_MANIFEST_PIN_PENDING|[a-f0-9]{64})';/,"const CONTRACT_SHA256 = '"+hash(fs.readFileSync(manifestPath))+"';"));
// Fresh scratch directory under .git, not a worktree and never staged. No private archives enter it.
const scratch=path.resolve('.git','epic-j-portable-scratch-'+Date.now());fs.mkdirSync(scratch);
const candidates=[...new Set([manifestPath,...implementationPaths,...requiredFiles.map(r=>r.path)])];
for(const p of candidates){if(privatePaths.has(p))throw new Error('Private evidence in candidate list');const target=path.join(scratch,p);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(p,target,fs.constants.COPYFILE_EXCL);}
const run=directory+'/execution';fs.mkdirSync(run,{recursive:true});
const suffix=process.argv.includes('--draft-revision')?'-final':'';
fs.writeFileSync(run+'/scratch'+suffix+'.json',JSON.stringify({scratch,kind:'SIMULATED_CLASSIFIED_FILE_SET_NOT_A_CLEAN_GIT_CHECKOUT',filesCopied:candidates.length,privateArchiveCopies:0,disposableCopies:0},null,2),{flag:'wx'});
fs.writeFileSync(run+'/publication-candidates'+suffix+'.json',JSON.stringify({paths:candidates},null,2),{flag:'wx'});
console.log(JSON.stringify({manifest:manifestPath,sha256:hash(fs.readFileSync(manifestPath)),required:requiredFiles.length,disposable:disposableFiles.length,scratch,candidates:candidates.length}));
