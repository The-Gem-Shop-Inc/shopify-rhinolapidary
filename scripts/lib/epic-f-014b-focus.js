'use strict';
async function keyboard(page){
 const initial=await page.evaluate(()=>{
  const identities=new WeakMap();let next=0;const key=e=>{if(!identities.has(e))identities.set(e,(e.id?'#'+e.id:e.tagName)+'@'+(++next));return identities.get(e);};
  const inventory=()=>{const rows=[];function scan(root){for(const e of root.querySelectorAll('*')){if(e.shadowRoot)scan(e.shadowRoot);if(e.tabIndex<0||e.disabled||!e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;if(e.matches('input[type=radio]')&&!e.checked&&document.querySelector(`input[type=radio][name="${e.name}"]:checked`))continue;const r=e.getBoundingClientRect();if(r.width&&r.height)rows.push({key:key(e),tag:e.tagName,name:(e.getAttribute('aria-label')||e.labels?.[0]?.textContent||e.textContent||'').trim().slice(0,160)});}}scan(document);return rows;};
  window.__f014Focus={key,inventory};const expected=inventory(),old=document.body.getAttribute('tabindex');document.body.setAttribute('tabindex','-1');document.body.focus();window.scrollTo(0,0);return {expected,old};
 });
 const steps=[];let cycled=false;
 for(let i=0;i<160;i++){
  await page.keyboard.press('Tab');await page.waitForTimeout(120);
  const row=await page.evaluate(()=>{
   let e=document.activeElement;while(e?.shadowRoot?.activeElement)e=e.shadowRoot.activeElement;if(!e||e===document.body)return {body:true};
   const host=e.getRootNode().host,target=e.matches('input[type=radio]')?e.labels?.[0]||e:e,s=getComputedStyle(target),r=target.getBoundingClientRect();
   let outerHost=host;while(outerHost?.getRootNode().host)outerHost=outerHost.getRootNode().host;
   const colorVisible=v=>!/(?:rgba\([^)]*,\s*0\)|transparent)/.test(v);
   const shadowVisible=v=>v!=='none'&&colorVisible(v)&&!/ 0px 0px 0px 0px(?:,|$)/.test(v);
   let indicator=(s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0&&colorVisible(s.outlineColor))||shadowVisible(s.boxShadow);
   if(target.matches('input[name=quantity]'))indicator=indicator||shadowVisible(getComputedStyle(target.closest('quantity-input'),'::after').boxShadow);
   const ranges=[];const walker=document.createTreeWalker(target,NodeFilter.SHOW_TEXT);let text;while(text=walker.nextNode()){
    if(!text.textContent.trim())continue;
    // An accessible-name span with CSS clip:rect(0 0 0 0) has no painted text.
    // Its label remains in the focus/name evidence; its unpainted Range boxes
    // must not be mistaken for the visible plus/minus button's hit target.
    let painted=true;for(let parent=text.parentElement;parent;parent=parent.parentElement){const css=getComputedStyle(parent),clip=css.clip.match(/-?\d+(?:\.\d+)?/g);if(css.display==='none'||css.visibility==='hidden'||parseFloat(css.opacity)===0||(css.clip!=='auto'&&clip?.length===4&&clip.every(n=>Number(n)===0))||css.clipPath==='inset(50%)'){painted=false;break;}if(parent===target)break;}
    if(!painted)continue;const range=document.createRange();range.selectNodeContents(text);for(const box of range.getClientRects())if(box.width>1&&box.height>1)ranges.push(box);
   }
   const rects=ranges.length?ranges:[r];const hits=rects.filter(box=>box.bottom>0&&box.top<innerHeight).map(box=>{
    const x=Math.max(0,Math.min(innerWidth-1,box.left+box.width/2)),y=Math.max(0,Math.min(innerHeight-1,box.top+box.height/2));let hit=document.elementFromPoint(x,y);while(hit?.shadowRoot){const inner=hit.shadowRoot.elementFromPoint(x,y);if(!inner||inner===hit)break;hit=inner;}
    return {owned:!!hit&&(hit===target||target.contains(hit)||hit.contains(target)||hit===outerHost),hitTag:hit?.tagName,hitId:hit?.id,point:{x,y},textBox:{left:box.left,right:box.right,top:box.top,bottom:box.bottom}};
   });
   const occluded=hits.length===0||hits.some(h=>!h.owned);
   const composedHost=host||e;let category=e.closest('header')||composedHost.closest('header')?'header':e.closest('footer')||composedHost.closest('footer')?'footer':e.closest('product-info')||composedHost.closest('product-info')?'Product':'global';
   const providerOwned=!!host?.matches('shopify-payment-terms');
   if(providerOwned)category='provider_terms';else if(e.closest('quantity-input'))category='quantity';else if(e.name==='add')category='purchase';else if(e.matches('.rhino-machine-contact'))category='Contact';else if(e.classList.contains('skip-to-content-link'))category='skip';
   return {key:window.__f014Focus.key(e),tag:e.tagName,category,providerOwned,name:(e.getAttribute('aria-label')||e.labels?.[0]?.textContent||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,160),outline:s.outlineStyle,outlineWidth:s.outlineWidth,boxShadow:s.boxShadow,indicatorVisible:indicator,focusVisible:e.matches(':focus-visible'),clipped:r.left<-1||r.right>innerWidth+1||r.top<-1||r.bottom>innerHeight+1,occluded,paintedTextHitTests:hits,rect:{left:r.left,right:r.right,top:r.top,bottom:r.bottom},hrefPath:e.getAttribute('href')?.split('?')[0],merchantFocusable:e.tabIndex>=0&&!e.disabled};
  });
  if(!row.body&&steps.some(s=>s.key===row.key)){cycled=row.key===steps.find(s=>!s.body)?.key;steps.push({...row,repeated:true});break;}steps.push(row);
 }
 const expected=await page.evaluate(old=>{if(old===null)document.body.removeAttribute('tabindex');else document.body.setAttribute('tabindex',old);const expected=window.__f014Focus.inventory();delete window.__f014Focus;return expected;},initial.old);
 const unique=steps.filter(s=>!s.body&&!s.repeated),seen=new Set(unique.map(s=>s.key)),skipped=expected.filter(e=>!seen.has(e.key)),failures=unique.filter(s=>!s.providerOwned&&(!s.indicatorVisible||s.clipped||s.occluded||!s.focusVisible)),productOrder=unique.filter(s=>['quantity','purchase','Contact','provider_terms'].includes(s.category));
 return {identityMethod:'WeakMap_per_actual_control_not_mutable_DOM_index',occlusionMethod:'Painted_text_line_boxes_and_deep_shadow_hit_tests',completeCycle:cycled,steps,expected,initialExpectedCount:initial.expected.length,finalExpectedCount:expected.length,skipped,merchantFocusFailures:failures,providerFocusObservations:unique.filter(s=>s.providerOwned),productOrder:productOrder.map(s=>({category:s.category,name:s.name})),logicalProductOrder:productOrder.findIndex(s=>s.category==='quantity')>=0&&productOrder.findIndex(s=>s.category==='Contact')>productOrder.findIndex(s=>s.category==='quantity'),transactionalActivation:false};
}
module.exports={keyboard};
