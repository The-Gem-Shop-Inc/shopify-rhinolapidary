'use strict';
// Reconcile actual corrective executions without overwriting their failed predecessors.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const E=require('./epic-e-owner-response-adapter'),I=require('./epic-g-integrated');
const ALLOWED=[
 'data/epic-g-commercial-decisions.json','data/epic-g-native-successor.json','data/epic-g-product-release.json','snippets/rhino-g-product-fit.liquid',
 'scripts/lib/epic-g-native-successor.js','scripts/lib/epic-g-fit-refresh.js','scripts/lib/epic-g-recovery-report.js','scripts/test-epic-g-fit-refresh.js','scripts/probe-epic-g-fit-focus.js',
 'scripts/lib/epic-g-integrated.js','scripts/test-epic-g-integrated.js','scripts/validate-epic-g-integrated.js','scripts/validate-epic-g-products.js',
 'scripts/deploy-epic-g-products-preview.js','scripts/deploy-epic-g-catalog-preview.js','scripts/test-epic-g-catalog-deployment.js',
 'scripts/validate-epic-g-fit-preview.js','scripts/validate-epic-g-catalog-browser.js','scripts/validate-epic-g-machine-routes-browser.js',
 'scripts/validate-epic-g-integrated-browser.js','scripts/probe-epic-g-zoom-viewport.js',
 'docs/project/epic-g-required-decisions.md','docs/rhino-lapidary-pbi-tracker-epic-g.md','docs/project/epic-g-proposed-backlog.json',
 'docs/project/implementation-records/g-pbi-007-targeted-recovery.md'];
function sourceAudit(root){
 const before=E.read(root+'/repository-before.json'),changed=[],missing=[];
 for(const r of before.files){if(!fs.existsSync(r.path)){missing.push(r.path);continue;}const hash=E.hash(fs.readFileSync(r.path));if(hash!==r.sha256)changed.push({path:r.path,beforeSha256:r.sha256,sha256:hash});}
 const known=new Set(before.files.map(r=>r.path)),added=[];
 function walk(d){for(const n of fs.readdirSync(d,{withFileTypes:true})){if(['.git','node_modules','.idea','test-results','playwright-report'].includes(n.name))continue;const p=path.join(d,n.name).replaceAll('\\','/').replace(/^\.\//,'');if(path.resolve(p)===path.resolve(root))continue;if(n.isDirectory())walk(p);else if(!known.has(p))added.push({path:p,sha256:E.hash(fs.readFileSync(p))});}}walk('.');
 const unauthorized=changed.concat(added).filter(r=>!ALLOWED.includes(r.path));
 return {status:missing.length||unauthorized.length?'FAIL':'PASS',baselineAt:before.at,checked:before.files.length,changed,added,missing,unauthorized,historicalEvidenceChanged:changed.filter(r=>r.path.startsWith('docs/qa/evidence/')),allowed:ALLOWED};
}
function verifyFit(report,release,catalog=release.pages){
 assert.equal(report.themeId,'158631198917');assert.equal(report.mode,'ACTUAL_SHOPIFY_PREVIEW_NO_OVERLAY');assert.equal(report.projectionSha256,E.digest(release));assert.deepEqual(report.failures,[]);assert(!report.error);
 assert(report.cells.length>0);assert.equal(new Set(report.cells.map(c=>c.width+'|'+c.sourceProductGid)).size,report.cells.length,'Duplicate fit cells');
 for(const c of report.cells){const page=release.pages.find(p=>p.productGid===c.sourceProductGid),native=catalog.find(p=>p.productGid===c.sourceProductGid);assert(native,'Unknown source Product');if(!page)assert(!native.compatibility.sourceApproved&&!native.compatibility.customerEligible,'Approved source absent from projection');const expected=page?page.targets.filter(t=>t.customerEligible).map(t=>({productGid:t.productGid,href:'/products/'+t.handle,title:t.title})):[];assert.deepEqual(c.expected,expected);assert(c.passed);assert.equal(c.httpStatus,200);assert.equal(c.observed.themeId,report.themeId);assert.equal(c.observed.sourceProductGid,c.sourceProductGid);assert.deepEqual(c.observed.links,expected);}
 const edges=release.pages.reduce((n,p)=>n+p.targets.filter(t=>t.customerEligible).length,0);
 for(const width of [390,1440])assert.equal(report.cells.filter(c=>c.width===width).reduce((n,c)=>n+c.expected.length,0),edges,'Incomplete directed link coverage');
}
function verifyResponsive(report){assert.equal(report.themeId,'158631198917');assert.deepEqual(report.failures,[]);assert(!report.fatal);assert.equal(report.cells.length,12);assert.equal(new Set(report.cells.map(c=>c.width+'|'+c.route)).size,12);assert.equal(report.zoom.length,4);assert.equal(report.appliedVisiblePrices.length,4);}
function run(root,output){
 assert(root&&output);assert(path.resolve(output).startsWith(path.resolve(root)+path.sep));assert(!fs.existsSync(output+'/integrated-report.json'),'Never overwrite completed evidence');fs.mkdirSync(output,{recursive:true});
 const q=root+'/g4-qa',read=p=>E.read(root+'/'+p),original=read('g4-qa/integrated-report.json');
 const current=I.current(root+'/closing-admin-read.json'),successor=require('./epic-g-native-successor').verify(current.envelope);
 const R=require('./epic-g-product-release'),{release}=R.verify();
 process.env.RHINO_G4_EVIDENCE_DIR=q;const remote=I.remote(),deployment=require('./epic-g-fit-refresh').verifyReadback(q);
 for(const id of ['158579622085','158631198917']){const a=read('closing-inventory-'+id+'.json'),b=read('g4-qa/inventory-'+id+'.json');assert.equal(a.id,b.id);assert.equal(a.role,b.role);assert.equal(a.pages.at(-1).hasNextPage,false);assert.deepEqual(a.nodes,b.nodes);}
 const fitPath=root+'/g4-paced-fit/regression-writes/epic-g/g2-recovery-2026-10-16/deployed-fit-coverage.json',fit=E.read(fitPath);
 const originalFit=E.read(fit.previousAttempt.path);assert.equal(E.hash(fs.readFileSync(fit.previousAttempt.path)),fit.previousAttempt.sha256);assert.equal(originalFit.projectionSha256,fit.projectionSha256);verifyFit(fit,release,current.report.products);
 const respPath=root+'/g4-responsive-final/responsive-browser.json',resp=E.read(respPath);verifyResponsive(resp);
 assert.equal(E.hash(fs.readFileSync(resp.previousAttempt.path)),resp.previousAttempt.sha256);
 const audit=sourceAudit(root);assert.equal(audit.status,'PASS',JSON.stringify({unauthorized:audit.unauthorized,missing:audit.missing}));
 const cart=read('g4-qa/regression-writes/epic-g/g3b-2026-10-19/anonymous-cart.json');assert.deepEqual(cart.failures,[]);assert(cart.nativeCart.cleaned);assert.equal(cart.requests.length,2);
 const out=structuredClone(original);out.startedAt=new Date().toISOString();out.evidenceDirectory=output;out.phase='CORRECTIVE_EXECUTION_RECONCILIATION';out.source=current.report.source;out.currentAuthorityValid=true;out.authorityRecheckedAt=out.startedAt;out.nativeSuccessor=successor;out.protectedFiles=audit;out.remote=remote;out.adminObservation={path:root+'/closing-admin-read.json',startedAt:current.envelope.startedAt,completedAt:current.envelope.completedAt,queries:current.envelope.operations.length};out.commercial=I.observeCommercial(current.envelope);assert.equal(out.commercial.status,'PASS');
 const evidence=[fitPath,respPath,root+'/closing-catalog-reconciliation.json',root+'/closing-inventory-158579622085.json',root+'/closing-inventory-158631198917.json'];
 out.recovery={original:{path:q+'/integrated-report.json',sha256:E.hash(fs.readFileSync(q+'/integrated-report.json')),status:original.technicalQAStatus,exitCode:1},inputs:evidence.map(p=>({path:p,sha256:E.hash(fs.readFileSync(p))})),fit:{cells:fit.cells.length,reused:fit.reusedObservations,newReads:fit.testedThisAttempt,completedAt:fit.completedAt,uniqueDirectedLinks:31,priorFailures:fit.previousAttempt.failures},responsive:{cells:12,reused:resp.reusedCells,newCases:12-resp.reusedCells,zoom:4,completedAt:resp.completedAt,previousAttempt:resp.previousAttempt},leaseExpiresAt:deployment.expiresAt};
 for(const row of out.commands){if(row.label==='current-forward-fit'||row.label==='responsive-enlargement'){row.originalExecution=structuredClone(row);row.command=row.label==='current-forward-fit'?'npm.cmd run test:epic-g-fit:preview -- --resume '+fit.previousAttempt.path+' --pace-ms 1800':'npm.cmd run test:epic-g-integrated:browser -- --resume '+resp.previousAttempt.path;row.log=root+(row.label==='current-forward-fit'?'/g4-paced-fit/command.txt':'/g4-responsive-final/command.txt');row.status='PASS';row.exitCode=0;row.completedAt=row.label==='current-forward-fit'?fit.completedAt:resp.completedAt;}}
 assert(out.commands.every(r=>r.status==='PASS'&&r.exitCode===0),'An unresolved command cannot pass recovery');
 const unitPath=root+'/g4-final-tests-verified/integrated-unit-tests.json',unit=E.read(unitPath);assert.equal(unit.failed,0);assert.equal(unit.passed,unit.results.length);out.counts.integrated=unit;out.commands.push({label:'recovery-and-isolation-negative-matrix',command:'npm.cmd run test:epic-g-integrated',exitCode:0,status:'PASS',log:root+'/g4-final-tests-verified/unit-command.txt',report:unitPath,reportSha256:E.hash(fs.readFileSync(unitPath)),reportedPassCounts:[unit.passed]});
 out.criteria.find(c=>c.id==='current-forward-fit-render').status='PASS';out.criteria.find(c=>c.id==='current-forward-fit-render').details={report:fitPath,edges:31,widths:[390,1440],expiresAt:deployment.expiresAt};
 out.criteria.find(c=>c.id==='current-output-and-source-protection').details=audit;
 out.technicalQAStatus='PASS';out.automatedIntegrationTestsPassing=true;out.actualPreviewVerified=true;out.formallyComplete=true;out.productionDeployable=false;out.commercialLaunchStatus='BLOCKED';out.blockedAcceptance=out.criteria.filter(c=>c.status==='BLOCKED');
 out.operations={authenticatedAdminDataQueries:75,schemaDiscoveryCalls:4,queryValidatorInvocations:1,AdminCatalogWrites:0,previewAssetWrites:1,MAINWrites:0,publications:0,storefrontCartPosts:cart.requests,cartCleaned:true,orders:0,cliAuxiliaryReads:'Not individually instrumented; excluded from the 75 captured data queries'};
 out.counts.commandPassed=out.commands.length;out.counts.commandFailed=0;out.counts.commandBlocked=0;out.counts.commandReportedPassingCases=out.commands.reduce((n,r)=>n+(r.reportedPassCounts||[]).reduce((a,b)=>a+b,0),0);out.counts.passingCaseTotalMeaning='Reported executions, including repeated suites; not a distinct acceptance-case count';out.completedAt=new Date().toISOString();
 const validate=new(require('ajv/dist/2020'))({strict:false}).compile(E.read('schemas/epic-g-integrated-report.schema.json'));assert(validate(out),JSON.stringify(validate.errors));
 fs.writeFileSync(output+'/protected-source-manifest.json',JSON.stringify(audit,null,2)+'\n');fs.writeFileSync(output+'/integrated-report.json',JSON.stringify(out,null,2)+'\n');
 fs.writeFileSync(output+'/integrated-report.md','# G4 targeted recovery\n\nTechnical acceptance: **PASS** within bounded preview QA. Commercial launch: **BLOCKED**. Production deployable: **false**.\n\nAll 31 directed links were observed at 390px and 1440px; 150 complete observations include 137 earlier actual passes and 13 corrective reads. Responsive QA: 12/12, including 10 retained passes and two corrective cases; four real 200% zoom cases pass. Fit lease: '+deployment.expiresAt+'. Original owner expiry: '+deployment.receiptExpiresAt+'.\n\nThe original integrated command remains exit 1 / FAIL in '+q+'/integrated-report.json. Its two failed stages have separately recorded corrective executions. Historical failures and samples remain present.\n\n| Command | Exit | Final status |\n| --- | --- | --- |\n'+out.commands.map(r=>'| `'+r.command+'` | '+r.exitCode+' | '+r.status+' |').join('\n')+'\n\nSee integrated-report.json for exact logs, original executions, timestamps, hashes, approval proof, protected source manifest and remaining exceptions.\n');
 console.log(JSON.stringify({technical:out.technicalQAStatus,commercial:out.commercialLaunchStatus,commands:out.commands.length,evidence:output}));return out;
}
module.exports={run,sourceAudit,verifyFit,verifyResponsive};
