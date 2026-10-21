'use strict';
// Explicit successor. Historical V1/J1/J0 code and data are never patched.
const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const P = require('./epic-j-j1-portability-v1');
const ID = 'J1-EVIDENCE-PORTABILITY-V2-2026-10-21';
const CONTRACT = 'data/epic-j-j1-portability-v2.json';
const CONTRACT_SHA256 = '0fb90ff6db236be723abe1101159b3350e04bf259ed3444091a4e3792eaa8493';
const PRIVATE = 'docs/product/AMER\u0130KA ROCK SHOPS.xlsx';
const PRIVATE_SHA = 'cb74336c9584d8a52d92fd1d791650d730ae50c058cc1867f3a11fb81958968c';
const CLEAN_EVIDENCE = 'docs/qa/evidence/epic-f/006b-worksheet-review-2026-10-15/diff.log';
const CLEAN_EVIDENCE_SHA = '7851d1ed5cb2898278b72a87051c13f1c14573ee4e79764fcf2b6d451a23291e';
const REPOSITORY = 'The-Gem-Shop-Inc/shopify-rhinolapidary';
const fail = (code, file) => { throw new P.IntegrityError(code, file); };
function load(root, io = {}) {
  let fast;
  const bytes = p => { if(fast)return fast.bytes(p); P.canonical(p); const full = P.file(root, p); try { return io.read ? io.read(p, full) : fs.readFileSync(full); } catch { fail('REQUIRED_FILE_MISSING', p); } };
  const exists = p => { if(fast)return fast.exists(p); P.canonical(p); const full = P.file(root, p); return io.exists ? io.exists(p, full) : fs.existsSync(full); };
  const raw = bytes(CONTRACT); if (P.hash(raw) !== CONTRACT_SHA256) fail('V2_CONTRACT_DRIFT', CONTRACT);
  const v2 = JSON.parse(raw);
  if (v2.id !== ID || v2.predecessor.path !== P.CONTRACT || v2.predecessor.sha256 !== '7841693dc348cf47ee481da8d5b32faa285fd046c2eefa0002bf9385705cfffd') fail('UNKNOWN_V1_PREDECESSOR');
  const legacy = P.load(root, io); // checks original schemas, manifests, predecessor coverage and implementation pins
  fast = legacy.r;
  const implementation = new Map(v2.implementation.map(r => [r.path, r]));
  for (const row of v2.implementation) {
    P.canonical(row.path); let b = bytes(row.path);
    if (row.path === 'scripts/lib/epic-j-j1-portability-v2.js') b = Buffer.from(b.toString('utf8').replace(CONTRACT_SHA256, 'V2_MANIFEST_PIN_PENDING'));
    if (P.hash(b) !== row.sha256) fail('V2_IMPLEMENTATION_DRIFT', row.path);
  }
  const schemaPath = 'schemas/epic-j-portability-v2.schema.json';
  if (!implementation.has(schemaPath)) fail('V2_SCHEMA_MISSING');
  P.schema(v2, JSON.parse(bytes(schemaPath)));
  if (!exists(v2.ownerDecision.path)) fail('OWNER_DECISION_MISSING', v2.ownerDecision.path);
  const decisionBytes = bytes(v2.ownerDecision.path), decision = JSON.parse(decisionBytes);
  if (decision.repository !== REPOSITORY || decision.audience !== 'PUBLIC') fail('OWNER_SCOPE_INVALID');
  if (P.hash(decisionBytes) !== v2.ownerDecision.sha256) fail('OWNER_DECISION_DRIFT', v2.ownerDecision.path);
  if (decision.approvalDate !== '2026-10-21' || decision.id !== 'PO-J1-DOCUMENT-DISTRIBUTION-2026-10-21' || decision.approved.length !== 4) fail('OWNER_DECISION_INVALID');
  if (decision.private.path !== PRIVATE || decision.private.sha256 !== PRIVATE_SHA || decision.private.disposition !== 'PRIVATE_RELOCATED_DO_NOT_PUBLISH') fail('INVALID_BUSINESS_EXCEPTION');
  const privateRequired = legacy.c.requiredFiles.find(r => r.path === PRIVATE);
  if (privateRequired?.sha256 !== PRIVATE_SHA || v2.businessException.path !== PRIVATE || v2.businessException.sha256 !== PRIVATE_SHA) fail('INVALID_BUSINESS_EXCEPTION');
  if (v2.cleanCheckoutEvidence.length !== 1 || v2.cleanCheckoutEvidence[0].path !== CLEAN_EVIDENCE || v2.cleanCheckoutEvidence[0].sha256 !== CLEAN_EVIDENCE_SHA) fail('CLEAN_CHECKOUT_EVIDENCE_INVALID');
  const visibility = JSON.parse(bytes(decision.visibilityEvidence));
  if (visibility.nameWithOwner !== REPOSITORY || visibility.visibility !== 'PUBLIC' || visibility.isPrivate !== false) fail('REPOSITORY_VISIBILITY_INVALID');
  const traces = legacy.privateManifest.entries;
  if (v2.privateTraceGitIdentities.length !== 10 || new Set(v2.privateTraceGitIdentities.map(r=>r.path)).size !== 10 || v2.privateTraceGitIdentities.some(r => !traces.some(t => t.path === r.path && t.originalSha256 === r.sha256))) fail('PRIVATE_TRACE_SET_DRIFT');
  for (const approved of decision.approved) {
    if (legacy.c.requiredFiles.find(r => r.path === approved.path)?.sha256 !== approved.sha256) fail('APPROVED_DOCUMENT_IDENTITY_INVALID', approved.path);
  }
  const required = [...legacy.c.requiredFiles.filter(r => r.path !== PRIVATE), ...legacy.c.implementation, { path: P.CONTRACT, sha256: v2.predecessor.sha256 },
    ...v2.cleanCheckoutEvidence, ...v2.implementation, v2.ownerDecision];
  // Exact checkout serialization restores historical Windows working bytes without changing any old hash.
  // No wildcard, custom filter, evidence exclusion or arbitrary content transformation is permitted.
  const allowedPaths=new Set([...required.map(r=>r.path),CONTRACT]),checkoutPaths=new Set(),checkoutCrlf=new Set();
  for(const line of bytes('.gitattributes').toString('utf8').split(/\r?\n/)){
    if(!line||line.startsWith('#'))continue;
    const match=line.match(/^("(?:[^"\\]|\\.)*") (-text|text eol=crlf) -filter -ident -working-tree-encoding$/);
    if(!match)fail('INVALID_CHECKOUT_RULE');const p=JSON.parse(match[1]).slice(1);P.canonical(p);
    if(!allowedPaths.has(p)||checkoutPaths.has(p))fail('INVALID_CHECKOUT_RULE',p);checkoutPaths.add(p);
    if(match[2]==='text eol=crlf')checkoutCrlf.add(p);
  }
  if(checkoutPaths.size!==allowedPaths.size)fail('CHECKOUT_COVERAGE_GAP');
  return { ...legacy, v2, decision, required, bytes, exists, checkoutCrlf };
}
function normalized(p, b) {
  if (p === 'scripts/lib/epic-j-j1-portability-v1.js') return Buffer.from(b.toString('utf8').replace('7841693dc348cf47ee481da8d5b32faa285fd046c2eefa0002bf9385705cfffd', 'PORTABILITY_MANIFEST_PIN_PENDING'));
  if (p === 'scripts/lib/epic-j-j1-portability-v2.js') return Buffer.from(b.toString('utf8').replace(CONTRACT_SHA256, 'V2_MANIFEST_PIN_PENDING'));
  return b;
}
function verify({ root = process.cwd(), mode = 'local', io } = {}) {
  if (!['local', 'portable'].includes(mode)) fail('INVALID_MODE');
  const state = load(root, io), { c, v2, required, bytes, exists, privateManifest } = state;
  const seen = new Set();
  for (const row of required) {
    P.canonical(row.path); if (seen.has(row.path)) continue; seen.add(row.path);
    if (!exists(row.path)) fail('REQUIRED_FILE_MISSING', row.path);
    if (P.hash(normalized(row.path, bytes(row.path))) !== row.sha256) fail('PROTECTED_SOURCE_DRIFT', row.path);
  }
  if (exists(PRIVATE) && P.hash(bytes(PRIVATE)) !== PRIVATE_SHA) fail('PRIVATE_BUSINESS_DRIFT', PRIVATE);
  let tracePresent = 0, traceAbsent = 0;
  for (const row of privateManifest.entries) {
    if (exists(row.path)) { if (P.hash(bytes(row.path)) !== row.originalSha256) fail('PRIVATE_EVIDENCE_DRIFT', row.path); tracePresent++; }
    else if (mode === 'portable' && row.absencePermittedInPortableValidation) traceAbsent++;
    else fail('PRIVATE_EVIDENCE_REQUIRED_LOCALLY', row.path);
    const summary = JSON.parse(bytes(row.safeSummary));
    P.schema(summary, JSON.parse(bytes('schemas/epic-j-portable-summary-v1.schema.json')));
    if (summary.original.path !== row.path || summary.original.sha256 !== row.originalSha256 || summary.governingSuccessor !== P.ID || summary.kind !== 'OBSERVED_HISTORICAL_METADATA_NOT_REGENERATED_MEASUREMENTS') fail('INVALID_SAFE_SUMMARY', row.safeSummary);
  }
  for (const row of c.disposableFiles) if (exists(row.path) && P.hash(bytes(row.path)) !== row.sha256) fail('HISTORICAL_DISPOSABLE_DRIFT', row.path);
  const known = new Set([...seen, CONTRACT, PRIVATE, ...privateManifest.entries.map(r => r.path), ...c.disposableFiles.map(r => r.path)]);
  const files = io?.list ? io.list() : cp.execFileSync('rg', ['--files','--hidden','-g','!.git','-g','!node_modules','-g','!test-results','-g','!playwright-report'], { cwd:root, encoding:'utf8', maxBuffer:30*1024*1024 }).trim().split(/\r?\n/).filter(Boolean).map(p => p.replaceAll('\\','/'));
  for (const p of files) { P.canonical(p); if (!known.has(p) && !p.startsWith(c.executionOutputRoot + '/')) fail('UNCLASSIFIED_FILE', p); }
  return { schemaVersion:2, status:'PASS', successor:ID, predecessor:P.ID, mode, requiredChecked:seen.size, businessPrivateAbsent:!exists(PRIVATE), privatePresent:tracePresent, privateAbsent:traceAbsent, approvedDocuments:4, publicationAuthorized:false, deploymentAuthorized:false };
}
function privateCheck(state, p, hash, oid) {
  P.canonical(p);
  if (p.toLowerCase() === PRIVATE.toLowerCase()) fail('PRIVATE_BUSINESS_PUBLICATION', p);
  if (state.privateManifest.entries.some(t => t.path.toLowerCase() === p.toLowerCase())) fail('PRIVATE_EVIDENCE_PUBLICATION', p);
  if (hash === PRIVATE_SHA || oid === state.decision.private.historicalGitBlobOid) fail('PRIVATE_BUSINESS_BYTES_PUBLICATION', p);
  if (state.privateManifest.entries.some(t => t.originalSha256 === hash) || state.v2.privateTraceGitIdentities.some(t => t.gitBlobOid === oid)) fail('PRIVATE_EVIDENCE_BYTES_PUBLICATION', p);
  if ((/(^|\/)\.env(?:\.|$)/.test(p) && p !== '.env.example') || /(^|\/)(node_modules|\.shopify|\.idea|test-results|playwright-report)(\/|$)/.test(p)) fail('LOCAL_CONFIGURATION_PUBLICATION', p);
  if (state.c.disposableFiles.some(t => t.path === p)) fail('DISPOSABLE_PUBLICATION', p);
}
function publication({ root = process.cwd(), paths, repository = REPOSITORY, audience = 'PUBLIC' } = {}) {
  if (repository !== REPOSITORY || audience !== 'PUBLIC') fail('PUBLICATION_SCOPE_INVALID');
  const state = load(root);
  if (!Array.isArray(paths) || new Set(paths.map(p => P.canonical(p).toLowerCase())).size !== paths.length) fail('INVALID_PUBLICATION_LIST');
  for (const p of paths) privateCheck(state, p);
  verify({ root, mode:'portable' });
  for (const p of paths) privateCheck(state, p, P.hash(state.bytes(p)));
  const scan = P.scan(root, paths);
  if (scan.results.length !== paths.length || scan.results.some((r,i) => r.path !== paths[i])) fail('INCOMPLETE_SECURITY_SCAN');
  const expected = new Map(state.required.map(r => [r.path,r])); expected.set(CONTRACT,{sha256:CONTRACT_SHA256});
  for (const row of scan.results) {
    if (row.status === 'REJECT') fail('PUBLICATION_CREDENTIAL_OR_UNREADABLE_PATH', row.path);
    if (row.review.some(r => r !== 'BUSINESS_BINARY_REQUIRES_HUMAN_REVIEW')) fail('PUBLICATION_BINARY_INSPECTION_REQUIRED', row.path);
    if (row.status === 'REVIEW' && !state.decision.approved.some(r => r.path === row.path && r.sha256 === P.hash(state.bytes(row.path))) ) fail('UNAPPROVED_BUSINESS_BINARY', row.path);
    const known = expected.get(row.path);
    if (!known) fail('UNAPPROVED_PUBLICATION_ARTIFACT', row.path);
    if (P.hash(normalized(row.path, state.bytes(row.path))) !== known.sha256) fail('PUBLICATION_SOURCE_DRIFT', row.path);
  }
  return {schemaVersion:2,status:'PASS',scanned:paths.length,approvedBusinessDocuments:scan.results.filter(r => r.status === 'REVIEW').length,publicationAuthorized:true,repository,audience,deploymentAuthorized:false};
}
function git(root,args,options={}) { return cp.execFileSync('git',args,{cwd:root,encoding:'utf8',maxBuffer:64*1024*1024,...options}); }
function entries(root,tree) { return git(root,['ls-tree','-r','-z',tree]).split('\0').filter(Boolean).map(line => {const [head,p]=line.split('\t');const [mode,type,oid]=head.split(' ');return {path:p,mode,type,oid};}); }
function indexGate({root=process.cwd(),indexFile}={}) {
  const state=load(root), env={...process.env,...(indexFile?{GIT_INDEX_FILE:path.resolve(indexFile)}:{})};
  const rows=git(root,['ls-files','--stage','-z'],{env}).split('\0').filter(Boolean);
  for(const line of rows){const [head,p]=line.split('\t');privateCheck(state,p,undefined,head.split(' ')[1]);}
  return {status:'PASS',indexEntries:rows.length};
}
function treeGate({root=process.cwd(),tip='HEAD',base='c803d44697de39c0b12b939ec9b03580d867cb03',security=true,checkSource=true}={}) {
  const state=load(root), baseEntries=new Map(entries(root,base).map(r=>[r.path,r.oid]));
  const allowed=new Set([...state.required.map(r=>r.path),CONTRACT]);
  const commits=git(root,['cat-file','-t',tip]).trim()==='tree'?[]:git(root,['rev-list','--reverse',base+'..'+tip]).trim().split(/\r?\n/).filter(Boolean);
  const trees=commits.length?commits:[tip], blobs=new Map(); let inspected=0;
  for(const commit of trees)for(const r of entries(root,commit)){
    privateCheck(state,r.path,undefined,r.oid); if(r.type!=='blob'||r.mode==='120000'||r.mode==='160000')fail('UNSUPPORTED_PUBLICATION_ENTRY',r.path);
    if(!allowed.has(r.path)&&baseEntries.get(r.path)!==r.oid)fail('UNAPPROVED_COMMITTED_ARTIFACT',r.path);
    const key=r.oid+':'+r.path;if(baseEntries.get(r.path)!==r.oid&&!blobs.has(key))blobs.set(key,r);inspected++;
  }
  if(checkSource){
    verify({root,mode:'portable'});const final=new Map(entries(root,tip).map(r=>[r.path,r.oid]));
    for(const row of [...state.required,{path:CONTRACT,sha256:CONTRACT_SHA256}]){
      let b=state.bytes(row.path);
      if(state.checkoutCrlf.has(row.path)){
        const text=b.toString('utf8');if(!Buffer.from(text).equals(b))fail('CHECKOUT_ENCODING_UNSUPPORTED',row.path);
        b=Buffer.from(text.replaceAll('\r\n','\n'));
      }
      const oid=require('node:crypto').createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
      if(final.get(row.path)!==oid)fail('COMMITTED_SOURCE_MISMATCH',row.path);
    }
  }
  if(security){
    // Stream only new blob bytes to the local scanner through a temporary Git worktree file set supplied by the caller.
    // Require all new tree identities to exist exactly at their committed path before scanning; intermediate variants are scanned from git via the companion scanner.
    const r=cp.spawnSync('python',[path.join(root,'scripts/lib/epic-j-git-blob-scan-v2.py')],{cwd:root,input:JSON.stringify({root,blobs:[...blobs.values()]}),encoding:'utf8',maxBuffer:16*1024*1024,windowsHide:true});
    if(r.status!==0)fail('GIT_BLOB_SCANNER_UNAVAILABLE');const report=JSON.parse(r.stdout);
    if(report.results.length!==blobs.size)fail('INCOMPLETE_GIT_BLOB_SCAN');
    for(const row of report.results){
      privateCheck(state,row.path,row.sha256,row.oid);
      if(row.status==='REJECT')fail('PUBLICATION_CREDENTIAL_OR_UNREADABLE_PATH',row.path);
      if(row.review.some(r=>r!=='BUSINESS_BINARY_REQUIRES_HUMAN_REVIEW'))fail('PUBLICATION_BINARY_INSPECTION_REQUIRED',row.path);
      if(row.status==='REVIEW'&&!state.decision.approved.some(a=>a.path===row.path&&a.sha256===row.sha256))fail('UNAPPROVED_BUSINESS_BINARY',row.path);
    }
  }
  return {schemaVersion:2,status:'PASS',tip:git(root,['rev-parse',tip]).trim(),base,commitsChecked:commits.length,treeEntriesChecked:inspected,newBlobPathIdentitiesChecked:blobs.size,newUniqueBlobsChecked:new Set([...blobs.values()].map(r=>r.oid)).size,securityScan:security,committedSourceVerified:checkSource,privateWorkbookCopies:0,privateTraceCopies:0};
}
function nativeSurfaceMatches(fileName, oldHash, text) {
  verify({mode:process.env.RHINO_J_PORTABILITY_MODE||'portable'});
  const {j1}=load(process.cwd()),r=j1.runtime.find(r=>r.path===fileName);
  if(!r||r.oldNormalizedSha256!==oldHash||P.hash(text.replaceAll('\r\n','\n'))!==r.normalizedSha256)fail('UNREVIEWED_NATIVE_SOURCE',fileName);
  return true;
}
module.exports={ID,CONTRACT,PRIVATE,PRIVATE_SHA,REPOSITORY,load,verify,publication,indexGate,treeGate,privateCheck,normalized,nativeSurfaceMatches};
