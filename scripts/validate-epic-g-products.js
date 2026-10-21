'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('./lib/epic-e-owner-response-adapter'),R=require('./lib/epic-g-product-release');
const DIR=process.env.RHINO_G2_EVIDENCE_DIR||'docs/qa/evidence/epic-g/g2-recovery-2026-10-16';
const BASELINE_DIR='docs/qa/evidence/epic-g/g2-2026-10-16';
const FILES=['templates/product.json','snippets/rhino-g-product-detail.liquid','snippets/rhino-g-product-fit.liquid','assets/rhino-g-product.css','assets/rhino-g-fit.js'];
function verify(){
 const {release,report}=R.verify(),before=E.read(BASELINE_DIR+'/repository-before.json');
 const scan=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?scan(dir+'/'+e.name):[dir+'/'+e.name]);
 require('./lib/epic-g-machine-routes').verifyAsset();require('./lib/epic-g-catalog').verify();require('./lib/epic-g-catalog-entry').verify();
 const successors=require('./lib/epic-g-catalog').FILES.concat(require('./lib/epic-g-catalog-entry').FILES,['assets/rhino-storefront.js']);
 const currentTheme=['assets','config','layout','locales','sections','snippets','templates'].flatMap(scan),oldPaths=new Set(before.theme.map(r=>r.path));
 assert.deepEqual(currentTheme.filter(p=>!oldPaths.has(p)).sort(),FILES.concat(successors).filter((p,i,a)=>a.indexOf(p)===i&&!oldPaths.has(p)).sort(),'Unexpected new theme file');
 const template=JSON.parse(fs.readFileSync('templates/product.json','utf8').replace(/\/\*[\s\S]*?\*\//g,'')),section=template.sections.main;
 assert.equal(section.type,'main-product');assert.equal(section.blocks.sku.type,'custom_liquid');assert(section.blocks.sku.settings.custom_liquid.includes("render 'rhino-g-product-detail'"));
 assert(section.blocks['rhino-g-fit'].settings.custom_liquid.includes("render 'rhino-g-product-fit'"));
 for(const row of before.theme.filter(r=>!FILES.includes(r.path)&&!successors.includes(r.path)))assert.equal(E.hash(fs.readFileSync(row.path)),row.sha256,'Unrelated theme file changed: '+row.path);
 const protectedRows=before.protected.filter(r=>!['package.json','docs/rhino-lapidary-pbi-tracker-epic-g.md','docs/project/epic-g-proposed-backlog.json'].includes(r.path));
 for(const row of protectedRows)assert.equal(E.hash(fs.readFileSync(row.path)),row.sha256,'Protected source changed: '+row.path);
 require('./lib/epic-g-current-protection').assertTemplate();
 const binding=require('./lib/epic-f-final-owner-binding').verify();assert.equal(binding.bindingSha256,before.bindingSha256);
 const local=require('./lib/epic-g-product-browser-overlay').renderer(),native=E.read(release.input.path).snapshot.datasets.products.records;
 const coverage=report.products.filter(p=>p.gRoleEligible).map(p=>{
  const handle=native.find(n=>n.id===p.productGid).handle,html=local.fit(handle,'contract'),actual=[...html.matchAll(/data-rhino-g-machine="([0-9]+)"/g)].map(m=>'gid://shopify/Product/'+m[1]).sort();
  const expected=p.compatibility.targets.filter(t=>t.eligible).map(t=>t.productGid).sort();assert.deepEqual(actual,expected,'Whole-catalog local projection mismatch '+handle);
  return {productGid:p.productGid,handle,expected,actual};
 });
 fs.writeFileSync(DIR+'/local-projection-coverage.json',JSON.stringify({mode:'LOCAL_LIQUIDJS_NOT_SHOPIFY_RUNTIME',coverage},null,2)+'\n');
 return {validatedAt:new Date().toISOString(),sourceBindingSha256:binding.bindingSha256,sourceCurrent:report.source.current,
  approvedSources:release.pages.length,customerEdges:release.pages.flatMap(p=>p.targets.filter(t=>t.customerEligible)).length,
  expiresAt:release.expiresAt,receiptExpiresAt:release.receiptExpiresAt,files:FILES.map(path=>({path,sha256:E.hash(fs.readFileSync(path))})),
  protectedSourceFilesChecked:protectedRows.length,unrelatedThemeFilesChecked:before.theme.filter(r=>!FILES.includes(r.path)).length,
  localLiquidProductsChecked:coverage.length,ShopifyMutations:0,privateRevocationImmediateGuarantee:false};
}
if(require.main===module)try{const out=verify();fs.writeFileSync(DIR+'/repository-validation.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify(out,null,2));}catch(e){console.error(e.stack);process.exitCode=1;}
module.exports={verify,FILES,DIR};
