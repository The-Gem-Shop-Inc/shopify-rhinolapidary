'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const {DIR,read,digest}=require('./lib/epic-f-live-machine-activation');
function compare(mode){assert.ok(['post-push','post-assignment'].includes(mode));const before=read(DIR+'/browser-baseline.json'),after=read(DIR+'/browser-'+mode+'.json'),cells=[];
 for(const a of before.cells){const b=after.cells.find(c=>c.kind===a.kind&&c.width===a.width);assert.ok(b,'Missing baseline cell');const differences=[];
  for(const key of ['title','productTitle','productId','price','quantity','variantId','variantOptionCount','purchase','galleryImages','header','footer','filterControls','cartItems'])if(digest(a.dom[key]??null)!==digest(b.dom[key]??null))differences.push(key);
  let descriptionWrapperWhitespaceOnly=false;
  if(a.dom.descriptionSha256!==b.dom.descriptionSha256){
    const proof=read(DIR+'/description-whitespace-equivalence.json');const row=proof.rows.find(r=>r.kind===a.kind&&r.width===a.width);
    descriptionWrapperWhitespaceOnly=proof.passed&&row?.beforeReconstructionMatches&&row.afterReconstructionMatches&&row.contentMatches&&row.classesUnchanged&&row.beforeRawDomSha256===a.dom.descriptionSha256&&row.afterRawDomSha256===b.dom.descriptionSha256;
    if(!descriptionWrapperWhitespaceOnly)differences.push('description content/structure');
  }
  const nonMachineCards=rows=>rows.filter(r=>!['/products/beadmaster','/products/em-1','/products/lapmaster-12','/products/lapmaster-18','/products/sawmaster-18','/products/sawmaster-24','/products/shapemaster','/products/trimmaster','/products/jademaster','/products/sawmaster-36','/products/tumblemaster'].includes(r.url));
  const beforeCards=nonMachineCards(a.dom.cards),afterCards=nonMachineCards(b.dom.cards);let nativeSearchMembershipChange=null;
  if(digest(beforeCards)!==digest(afterCards)){
    if(a.kind==='search'){
      // Native relevance results can reorder/reindex when Shopify updates Product.updatedAt.
      // Require unchanged common Product output, equal page size, and a complete protected catalog proof.
      const common=beforeCards.filter(c=>afterCards.some(d=>d.url===c.url));const changed=common.filter(c=>digest(c)!==digest(afterCards.find(d=>d.url===c.url)));
      const reconciliation=read(DIR+'/product-reconciliation.json');
      if(changed.length||common.length<beforeCards.length-1||beforeCards.length!==afterCards.length||reconciliation.unexpectedProductChanges!==0||reconciliation.errors.length)differences.push('non-machine cards');
      else nativeSearchMembershipChange={classification:'NATIVE_SEARCH_RESULT_MEMBERSHIP_QUALIFICATION',commonCardsUnchanged:common.length,removed:beforeCards.filter(c=>!afterCards.some(d=>d.url===c.url)).map(c=>c.url),added:afterCards.filter(c=>!beforeCards.some(d=>d.url===c.url)).map(c=>c.url),pageSizeUnchanged:true,rankingParity:'qualified',sourceReason:'main-search and search configuration were not deployed/changed; all 122 Product protected fields remain identical; the eight authorized suffix updates change native updatedAt and can trigger native indexing. Backend ranking itself is not claimed unchanged.'};
    }else differences.push('non-machine cards');
  }
  for(const name of ['title','price','quantity','purchase']){const x=a.dom.boxes[name],y=b.dom.boxes[name];if(x&&y&&['x','y','width','height'].some(k=>Math.abs(x[k]-y[k])>2))differences.push('material '+name+' layout');}
  if(a.interactions&&b.interactions)for(const k of ['mobileNavigation','predictiveSearch','cartUi'])if(digest(a.interactions[k])!==digest(b.interactions[k]))differences.push(k);
  if(b.network.pageErrors.length||b.dom.liquidErrors||b.dom.horizontalOverflow||b.storefrontAxe&&!b.storefrontAxe.clean)differences.push('render/accessibility');
  cells.push({kind:a.kind,width:a.width,status:differences.length?'FAIL':'PASS',differences,nativeSearchMembershipChange,descriptionWrapperWhitespaceOnly,beforeTitle:a.dom.title,afterTitle:b.dom.title,knownProviderConsoleBefore:a.network.consoleErrors.length,knownProviderConsoleAfter:b.network.consoleErrors.length,machineCardMediaSuppression:'intentional claims-containment change; non-machine card output compared separately'});
 }
 const result={mode,assessedAt:new Date().toISOString(),before:DIR+'/browser-baseline.json',after:DIR+'/browser-'+mode+'.json',cells,passed:cells.filter(c=>c.status==='PASS').length,failed:cells.filter(c=>c.status==='FAIL').length};fs.writeFileSync(DIR+'/non-machine-comparison-'+mode+'.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));assert.equal(result.failed,0,'Non-machine material regression; rollback authorized');return result;
}
if(require.main===module)compare(process.argv[2]);module.exports={compare};
