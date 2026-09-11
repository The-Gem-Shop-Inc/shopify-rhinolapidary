const fs=require('fs'),cp=require('child_process');
const {build}=require('./build-epic-e-batch-4a');
const {assessAdmin,compareNative,executionBlockers,verifyAfterPlan}=require('./lib/epic-e-readiness');
const arg=k=>process.argv.find(a=>a.startsWith(`--${k}=`))?.slice(k.length+3);
function run(){
 const mode=arg('mode')||'repository',asOf=arg('as-of')||new Date().toISOString();
 if(!['repository','admin','migration','all'].includes(mode))throw new Error('Modes: repository, admin, migration, all');
 const snapshotPath=arg('snapshot'),beforePath=arg('before');
 const r=build({asOf,snapshotPath,writeOutputs:false});
 const checks=[];
 if(['admin','migration'].includes(mode)){
  const result=cp.spawnSync(process.execPath,['scripts/validate-epic-e-batch-4a.js'],{encoding:'utf8'});
  checks.push({name:'aggregate_artifact_integrity',status:result.status===0?'passed':'failed',exitCode:result.status,detail:result.status===0?'Checked-in plans, hashes and deferred decisions validated.':(result.stdout||'')+(result.stderr||'')});
 }
 if(['repository','all'].includes(mode)){
  const npm=process.env.npm_execpath;
  const result=npm?cp.spawnSync(process.execPath,[npm,'run','validate:epic-e-batch-4a'],{encoding:'utf8'}):cp.spawnSync(process.platform==='win32'?'npm.cmd':'npm',['run','validate:epic-e-batch-4a'],{encoding:'utf8',shell:process.platform==='win32'});
  checks.push({name:'all_existing_and_batch4a_contracts_and_tests',status:result.status===0?'passed':'failed',exitCode:result.status,detail:result.status===0?'Previous Epic E suites and Batch 4A checks passed.':(result.stdout||'')+(result.stderr||'')});
 }
 const diagnostics=[];
 for(const [name,args]of [['product_csv',['scripts/validate-product-csv.js','data/product-export/products.csv']],['launch_fixture_ownership',['scripts/validate-launch-fixtures.js']]]){
  const res=cp.spawnSync(process.execPath,args,{encoding:'utf8'}),lines=((res.stdout||'')+'\n'+(res.stderr||'')).split(/\r?\n/).filter(l=>l.startsWith('- '));
  diagnostics.push({name,exitCode:res.status,findingCount:lines.length,findings:lines,blockingAt:'applicable release/finalization scope; separate from repository architecture readiness'});
 }
 const admin=assessAdmin(r.snapshot,asOf,Boolean(snapshotPath));
 const before=beforePath?JSON.parse(fs.readFileSync(beforePath)):null;
 const execution=r.plans.map((p,i)=>({planId:p.planId,domain:p.mutationDomain,planPrepared:true,approvedRows:r.bundles[i].rows.length,executable:false,blockers:executionBlockers(p,r.bundles[i],admin)}));
 const architectureReady=checks.every(c=>c.status==='passed');
 const comparison=before?compareNative(before,r.snapshot):r.artifacts['data/epic-e-admin-readiness.json'].nativeDrift;
 const referenceFailures=[...r.graph.liveTargets.filter(t=>t.state==='missing_target'),...r.graph.nativeReferences.filter(t=>t.state!=='observed_present')];
 const definitionFailures=r.artifacts['data/epic-e-admin-readiness.json'].definitionDiff.entries.filter(e=>['conflict','incompatible_type','unexpected_live_definition'].includes(e.action));
 const requestedPlan=arg('plan'),planSummary=requestedPlan?r.artifacts['data/epic-e-migration-readiness.json'].plans.find(p=>p.planId===requestedPlan):null;
 if(requestedPlan&&!planSummary)throw new Error('Unknown bounded plan');
 const planAfterVerification=planSummary&&before?verifyAfterPlan(JSON.parse(fs.readFileSync(planSummary.inputPath)),before,r.snapshot,r.artifacts['data/epic-e-admin-readiness.json'].definitionDiff):null;
 const driftReviewRequired=(planAfterVerification?!planAfterVerification.matchesExpectedState:comparison.changes.length>0)||referenceFailures.length>0||definitionFailures.length>0;
 const blocked=mode==='admin'&&(!admin.currentReconciliationUsable||driftReviewRequired)||['migration','all'].includes(mode)&&execution.some(p=>p.blockers.length);
 const exitCode=!architectureReady?1:blocked?2:0;
 const report={schemaVersion:1,mode,asOf,scope:'full 122 Product / 125 Variant repository baseline; current live completeness requires successful read audit',architectureReady:checks.length?architectureReady:'not_rerun_in_this_mode',migrationPlanPrepared:true,valueBlockedDomains:[...new Set(r.readiness.filter(row=>row.value_blocked).map(row=>row.domain))],admin,mutationAuthorized:false,checks,diagnostics,execution,beforeAfter:comparison,planAfterVerification,driftReviewRequired,referenceFailures,definitionFailures,exitCode,result:exitCode===1?'contract_failure':exitCode===2?'execution_or_Admin_blocked':mode==='admin'?'read_only_Admin_reconciled':'repository_architecture_ready_with_explicit_deferred_values'};
 const output=arg('output');if(output)fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));process.exitCode=exitCode;return report;
}
if(require.main===module)run();
module.exports={run};
