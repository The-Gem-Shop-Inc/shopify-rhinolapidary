'use strict';
// Narrow successor of the existing G2 preview workflow: one existing fit file.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const E=require('./epic-e-owner-response-adapter'),R=require('./epic-g-product-release');
const FILE=R.LIQUID,PREVIEW='gid://shopify/OnlineStoreTheme/158631198917',MAIN='gid://shopify/OnlineStoreTheme/158579622085';
const md5=s=>crypto.createHash('md5').update(s).digest('hex');
function checkInputs(x){
 const {inventory,main,bodies,gates,baseline,readPath,files=[FILE],now=Date.now()}=x;
 assert.deepEqual(files,[FILE],'Fit refresh file allowance is exactly one existing snippet');
 assert.equal(inventory.id,PREVIEW);assert.equal(inventory.role,'UNPUBLISHED');assert.equal(main.id,MAIN);assert.equal(main.role,'MAIN');
 assert.equal(inventory.name,'Rhino Lapidary - Preview');assert.equal(main.name,'shopify-rhinolapidary/main');
 for(const r of [inventory,main,bodies])assert(now>=Date.parse(r.capturedAt)&&now-Date.parse(r.capturedAt)<300000,'Fresh theme observation within five minutes required');
 assert.equal(inventory.pages.at(-1).hasNextPage,false);assert.equal(main.pages.at(-1).hasNextPage,false);
 for(const [n,name] of [[inventory,'preview'],[main,'main']])assert.deepEqual(n.nodes,E.read('docs/qa/evidence/epic-g/g3b-2026-10-19/'+name+'-inventory-after-entry.json').nodes,'Unapproved remote predecessor drift');
 const body=bodies.data.theme;assert.equal(body.id,PREVIEW);assert.equal(body.role,'UNPUBLISHED');assert.equal(body.files.pageInfo.hasNextPage,false);assert.deepEqual(body.files.nodes.map(n=>n.filename),[FILE]);
 const old=body.files.nodes[0];assert.equal(old.checksumMd5,inventory.nodes.find(n=>n.filename===FILE).checksumMd5);assert.equal(md5(old.body.content),old.checksumMd5,'Rollback bytes must reproduce stored checksum');
 assert(gates.every(r=>r.exitCode===0),'Every preflight command must pass');
 const required=require('../deploy-epic-g-products-preview').REQUIRED.concat(['playwright.machine.config.js','playwright.machine-gallery.config.js'].map(c=>'npm.cmd exec playwright test -- --config='+c));
 for(const cmd of required)assert.equal(gates.filter(g=>g.command===cmd&&g.exitCode===0).length,1,'Missing or duplicated predeployment gate '+cmd);
 const current=require('./epic-g-integrated').current(readPath),verified=R.verify();assert.equal(verified.release.input.path,readPath);assert.equal(current.report.counts.customerEdges,31);
 assert.equal(baseline.themeId,'158631198917');assert.equal(baseline.overlay,false);assert.deepEqual(baseline.failures,[]);assert.equal(baseline.cells.length,22);assert(Date.parse(baseline.startedAt)>=Date.parse(current.envelope.startedAt));assert(Date.parse(baseline.completedAt)<=now);
 for(const machine of current.report.products.filter(p=>p.approvedClass==='machine'))for(const width of [390,1440]){const rows=baseline.cells.filter(c=>c.productGid===machine.productGid&&c.width===width);assert.equal(rows.length,1,'Exact eleven-machine/two-viewport baseline required');assert(!rows[0].error);assert.equal(rows[0].published,machine.published);assert.equal(rows[0].status,machine.published?200:404);}
 assert.equal(verified.release.receiptExpiresAt,'2026-10-22T20:26:37.102Z');assert(now<Date.parse(verified.release.expiresAt));
 const fresh=R.build(readPath,{asOf:verified.release.validatedAt});assert.equal(fs.readFileSync(FILE,'utf8'),fresh.liquid);
 return {file:FILE,beforeMd5:old.checksumMd5,beforeSha256:E.hash(old.body.content),beforeBody:old.body.content,afterMd5:md5(fresh.liquid),afterSha256:E.hash(fresh.liquid),releaseSha256:E.hash(fs.readFileSync(R.RELEASE)),expiresAt:verified.release.expiresAt,receiptExpiresAt:verified.release.receiptExpiresAt,sourceBindingSha256:verified.release.sourceBindingSha256};
}
function inputs(dir){const bodies=E.read(dir+'/fit-files-before.json');return {inventory:E.read(dir+'/fit-preview-before.json'),main:E.read(dir+'/fit-main-before.json'),bodies,gates:E.read(dir+'/predeployment-gates.json'),baseline:E.read(dir+'/fit-machine-baseline.json'),readPath:E.read(R.RELEASE).input.path};}
function command(root='.'){return ['theme','push','--store','sz5dnk-nf.myshopify.com','--theme','158631198917','--path',root,'--only',FILE,'--nodelete','--strict','--json'];}
function validateCommand(args){assert.deepEqual(args,command(args[args.indexOf('--path')+1]));assert.equal(args.filter(x=>x==='--only').length,1);assert(!args.includes('--allow-live')&&!args.includes('--publish'));return true;}
async function run(dir){
 const tests=E.read(dir+'/fit-refresh-tests.json');assert.equal(tests.failed,0);assert(tests.negative>=10,'Negative deployment guards must pass before push');
 const info=checkInputs(inputs(dir)),rollbackRoot=path.join(dir,'rollback-theme');
 for(const p of ['assets','config','layout','locales','sections','snippets','templates'])fs.cpSync(p,path.join(rollbackRoot,p),{recursive:true});
 fs.writeFileSync(path.join(rollbackRoot,FILE),info.beforeBody);assert.equal(md5(fs.readFileSync(path.join(rollbackRoot,FILE))),info.beforeMd5);
 const args=command();validateCommand(args);const rollbackCommand=command(rollbackRoot);validateCommand(rollbackCommand);
 const plan={schemaVersion:1,authorization:'Direct Product Owner targeted G4 recovery; bounded current fit refresh only',at:new Date().toISOString(),themeId:PREVIEW,role:'UNPUBLISHED',files:[FILE],...info,rollback:{root:rollbackRoot,file:path.join(rollbackRoot,FILE),sha256:info.beforeSha256,md5:info.beforeMd5,command:['shopify',...rollbackCommand]},command:['shopify',...args],gateSha256:E.hash(fs.readFileSync(dir+'/predeployment-gates.json')),catalogWrites:0,MAINWrites:0,publication:false};
 fs.writeFileSync(dir+'/fit-deployment-plan.json',JSON.stringify(plan,null,2)+'\n');fs.writeFileSync(dir+'/fit-push-reservation.json',JSON.stringify({at:plan.at,afterSha256:plan.afterSha256})+'\n',{flag:'wx'});
 // All safety checks and exact rollback bytes exist before the CLI is invoked.
 const {CLI,cleanEnv}=require('../deploy-epic-f-header-focus-correction'),cp=require('node:child_process');let stdout='',stderr='';const startedAt=new Date().toISOString(),child=cp.spawn(process.execPath,[CLI,...args],{env:cleanEnv(),windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout.on('data',s=>stdout+=s);child.stderr.on('data',s=>stderr+=s);
 const exitCode=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});const sanitize=s=>s.replace(/shp[a-z]+_[A-Za-z0-9_-]+/gi,'[TOKEN_REDACTED]').replace(/https?:\/\/[^\s"'<>]*shopifypreview\.com[^\s"'<>]*/gi,'[SIGNED_PREVIEW_REDACTED]');
 fs.writeFileSync(dir+'/fit-push.json',JSON.stringify({startedAt,completedAt:new Date().toISOString(),command:plan.command,exitCode,stdout:sanitize(stdout),stderr:sanitize(stderr),files:[FILE],catalogWrites:0,MAINWrites:0,publication:false},null,2)+'\n');assert.equal(exitCode,0,'Read remote state before any retry');console.log(JSON.stringify({theme:PREVIEW,files:[FILE],exitCode,expiresAt:info.expiresAt,publication:false}));return plan;
}
function reconcile(dir){
 const p=E.read(dir+'/fit-deployment-plan.json');assert.equal(p.themeId,PREVIEW);assert.deepEqual(p.files,[FILE]);assert.equal(p.releaseSha256,E.hash(fs.readFileSync(R.RELEASE)));assert.equal(E.hash(p.beforeBody),p.beforeSha256);assert.equal(md5(p.beforeBody),p.beforeMd5);assert.equal(E.hash(fs.readFileSync(p.rollback.file)),p.beforeSha256);assert.equal(E.read(dir+'/fit-push.json').exitCode,0);
 const a=E.read(dir+'/fit-preview-before.json'),b=E.read(dir+'/inventory-158631198917.json'),m=E.read(dir+'/fit-main-before.json'),n=E.read(dir+'/inventory-158579622085.json');assert.equal(b.role,'UNPUBLISHED');assert.equal(n.role,'MAIN');assert.deepEqual(n.nodes,m.nodes,'MAIN drift');
 const expected=structuredClone(a.nodes),row=expected.find(r=>r.filename===FILE);assert.equal(row.checksumMd5,p.beforeMd5);row.checksumMd5=p.afterMd5;assert.deepEqual(b.nodes,expected,'Unrelated preview file changed');
 const body=E.read(dir+'/files-158631198917.json').data.theme.files.nodes.find(r=>r.filename===FILE);assert.equal(body.checksumMd5,p.afterMd5);assert.equal(E.hash(body.body.content),p.afterSha256);assert.equal(body.body.content,fs.readFileSync(FILE,'utf8'));
 return {status:'PASS',file:FILE,beforeMd5:p.beforeMd5,afterMd5:p.afterMd5,beforeSha256:p.beforeSha256,afterSha256:p.afterSha256,releaseSha256:p.releaseSha256,previewAssetWrites:1,MAINWrites:0,publication:false,unrelatedPreviewChanges:0,MAINFiles:n.nodes.length,previewFiles:b.nodes.length,expiresAt:p.expiresAt,receiptExpiresAt:p.receiptExpiresAt,planSha256:E.hash(fs.readFileSync(dir+'/fit-deployment-plan.json'))};
}
function verifyReadback(dir){const r=reconcile(dir),proof=E.read(dir+'/fit-readback-proof.json');assert.deepEqual(proof,r);return r;}
module.exports={FILE,PREVIEW,MAIN,checkInputs,inputs,command,validateCommand,run,reconcile,verifyReadback,md5};
