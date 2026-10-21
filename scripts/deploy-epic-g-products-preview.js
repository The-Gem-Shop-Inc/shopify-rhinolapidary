'use strict';
// This command can update only the existing unpublished preview and these five files.
const fs=require('node:fs'),assert=require('node:assert/strict'),cp=require('node:child_process');
const E=require('./lib/epic-e-owner-response-adapter'),V=require('./validate-epic-g-products'),{CLI,cleanEnv}=require('./deploy-epic-f-header-focus-correction');
const REQUIRED=['test:epic-g-foundation','test:epic-g-products','test:epic-g-recovery-protection','validate:epic-g-products','validate:product-templates','validate:product-purchase','validate:registers','validate:metafields','validate:theme-architecture','theme:check','validate:epic-f-machine','validate:epic-f-context-delivery','validate:epic-f-facts','validate:epic-f-gallery','validate:epic-f-support-resources','validate:rhino-style-contract','test:epic-f-consumer','validate:epic-f-consumer'].map(n=>'npm.cmd run '+n);
function checkInputs({inventory,main,gates,baseline,bodies,now=Date.now()}){
 assert.equal(inventory.id,'gid://shopify/OnlineStoreTheme/158631198917');assert.equal(inventory.name,'Rhino Lapidary - Preview');assert.equal(inventory.role,'UNPUBLISHED');
 assert.equal(main.id,'gid://shopify/OnlineStoreTheme/158579622085');assert.equal(main.role,'MAIN');
 for(const item of [inventory,main,bodies])assert(now-Date.parse(item.capturedAt)>=0&&now-Date.parse(item.capturedAt)<300000,'Re-read theme identity/inventory/bodies before deployment');
 assert.equal(bodies.data.theme.id,inventory.id);assert.equal(bodies.data.theme.role,'UNPUBLISHED');assert.equal(bodies.data.theme.files.pageInfo.hasNextPage,false);
 assert(gates.every(r=>r.exitCode===0),'Every predeployment command must pass');for(const command of REQUIRED)assert.equal(gates.filter(r=>r.command===command&&r.exitCode===0).length,1,'Missing/repeated gate '+command);
 for(const config of ['playwright.machine.config.js','playwright.machine-gallery.config.js'])assert(gates.some(r=>r.command==='npm.cmd exec playwright test -- --config='+config&&r.exitCode===0),'Missing machine browser suite');
 assert(baseline.completedAt);assert.deepEqual(baseline.failures,[]);assert.equal(baseline.cells.filter(c=>c.machine).length,22,'All eleven machine routes need both viewport baselines');
 const files=bodies.data.theme.files.nodes;assert(files.every(f=>V.FILES.includes(f.filename)),'Unexpected backup file');
 for(const f of files.filter(f=>f.filename!=='templates/product.json'))assert.equal(E.hash(f.body.content),E.hash(fs.readFileSync(f.filename)),'Unreviewed existing G file would be overwritten');
 const template=files.find(f=>f.filename==='templates/product.json');assert(template?.body?.content,'Rollback template source required');
 assert.deepEqual(JSON.parse(template.body.content.replace(/\/\*[\s\S]*?\*\//g,'')),require('./lib/epic-g-current-protection').nativeTemplate(),'Remote Product template differs from reviewed native baseline');
 return true;
}
async function run(){
 const verified=V.verify(),inventory=E.read(V.DIR+'/preview-inventory-before.json'),main=E.read(V.DIR+'/main-inventory-before.json'),gates=E.read(V.DIR+'/predeployment-gates.json'),baseline=E.read(V.DIR+'/baseline-browser.json'),bodies=E.read(V.DIR+'/preview-files-before.json');
 checkInputs({inventory,main,gates,baseline,bodies});
 const args=['theme','push','--store','sz5dnk-nf.myshopify.com','--theme','158631198917','--path','.','--nodelete','--strict','--json',...V.FILES.flatMap(f=>['--only',f])];
 const plan={at:new Date().toISOString(),themeId:'158631198917',role:'UNPUBLISHED',files:verified.files.map(f=>{const old=bodies.data.theme.files.nodes.find(r=>r.filename===f.path);return {...f,beforeMd5:old?.checksumMd5||null,beforeSha256:old?E.hash(old.body.content):null,previouslyAbsent:!old};}),command:['shopify',...args],approvalDigest:E.digest(E.read('data/epic-g-product-release.json')),gatesSha256:E.hash(fs.readFileSync(V.DIR+'/predeployment-gates.json')),rollback:{source:V.DIR+'/preview-files-before.json',sha256:E.hash(fs.readFileSync(V.DIR+'/preview-files-before.json')),procedure:'Push only the saved original templates/product.json to the same unpublished preview using --only and --nodelete; new unreferenced G assets may remain. Never synchronize the theme.'},authorization:'User Epic G2 recovery preview-only instruction',AdminMutations:0,publication:false};
 fs.writeFileSync(V.DIR+'/preview-deployment-plan.json',JSON.stringify(plan,null,2)+'\n');
 fs.writeFileSync(V.DIR+'/push-reservation.json',JSON.stringify(plan)+'\n',{flag:'wx'});
 let stdout='',stderr='';const child=cp.spawn(process.execPath,[CLI,...args],{env:cleanEnv(),windowsHide:true,stdio:['ignore','pipe','pipe']});child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
 const exitCode=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve);});
 const clean=s=>s.replace(/shp[a-z]+_[A-Za-z0-9_-]+/gi,'[TOKEN_REDACTED]').replace(/https?:\/\/[^\s"'<>]*shopifypreview\.com[^\s"'<>]*/gi,'[SIGNED_PREVIEW_REDACTED]');
 fs.writeFileSync(V.DIR+'/preview-push.json',JSON.stringify({...plan,completedAt:new Date().toISOString(),exitCode,stdout:clean(stdout),stderr:clean(stderr)},null,2)+'\n');
 assert.equal(exitCode,0,'Read back remote state before any retry');console.log(JSON.stringify({exitCode,themeId:plan.themeId,files:V.FILES,publication:false}));
}
module.exports={checkInputs,REQUIRED};
if(require.main===module)(async()=>{
 if(!process.argv.includes('--fit-only'))return run();
 const F=require('./lib/epic-g-fit-refresh'),dir=process.argv[process.argv.indexOf('--evidence')+1];
 if(process.argv.includes('--check')){const info=F.checkInputs(F.inputs(dir));console.log(JSON.stringify({status:'PASS',file:info.file,expiresAt:info.expiresAt,themeWrites:0,catalogWrites:0}));return info;}
 return F.run(dir);
})().catch(e=>{console.error(e.stack);process.exitCode=1;});
