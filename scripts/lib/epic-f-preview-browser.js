'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { PRODUCTS, hash, normalize, safeUrl, routeUrl, canonicalSheet, isTransactionRequest } = require('./epic-f-nonpersistent-preview');
const { classifyRequest } = require('./epic-f-preview-network-guard');

async function localReference(css) {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext();
    await context.route('http://rhino-css-reference.local/**', route => route.fulfill(route.request().url().endsWith('/authority.css')
      ? { status: 200, contentType: 'text/css; charset=utf-8', body: css }
      : { status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><html><head><link rel="stylesheet" href="/authority.css"><style data-rhino-nonpersistent-preview-css>' + css + '</style></head><body></body></html>' }));
    const page = await context.newPage(); await page.goto('http://rhino-css-reference.local/', { waitUntil: 'load' });
    const result = await page.evaluate(source => {
      const canonical = eval('(' + source + ')');
      const inline = document.querySelector('[data-rhino-nonpersistent-preview-css]');
      return { external: canonical(document.styleSheets[0]), inline: canonical(inline.sheet), text: inline.textContent };
    }, canonicalSheet.toString());
    const externalHash = hash(JSON.stringify(result.external)), inlineHash = hash(JSON.stringify(result.inline));
    return { algorithm: 'ordered_recursive_css_rules_v1_CRLF_to_LF_only', browserVersion: browser.version(),
      externalHash, inlineHash, equal: externalHash === inlineHash, ruleCount: result.external.length,
      lfSourceSha256: hash(normalize(css)), inlineTextSha256: hash(result.text), lfSourceTextMatches: result.text === normalize(css) };
  } finally { await browser.close(); }
}
function attachNetwork(page, signedHost, redact) {
  const log = { requests: [], failures: [], httpErrors: [], consoleErrors: [], pageErrors: [], preventedTransactions: [] };
  const classify = url => {
    const host = new URL(url).hostname;
    if (/youtube|youtu\.be|vimeo|wistia/.test(host)) return 'VIDEO_PROVIDER';
    if (/shopify|shop\.app|shopifysvc|shopifypreview/.test(host)) return 'SHOPIFY_NATIVE_OR_PREVIEW';
    if (host === signedHost) return 'PREVIEW_STOREFRONT';
    if (/paypal|affirm|klarna|stripe/.test(host)) return 'NATIVE_PAYMENT_PROVIDER';
    if (/google|facebook|tiktok|bing|pinterest/.test(host)) return 'THIRD_PARTY_ANALYTICS';
    return 'THIRD_PARTY_OR_STORE';
  };
  page.on('request', request => log.requests.push({ ...safeUrl(request.url(), signedHost), type: request.resourceType(), method: request.method(), owner: classify(request.url()) }));
  page.on('requestfailed', request => log.failures.push({ ...safeUrl(request.url(), signedHost), owner: classify(request.url()), error: redact.text(request.failure()?.errorText || '') }));
  page.on('response', response => { if (response.status() >= 400) log.httpErrors.push({ ...safeUrl(response.url(), signedHost), status: response.status(), owner: classify(response.url()) }); });
  page.on('console', message => { if (message.type() === 'error') log.consoleErrors.push({ text: redact.text(message.text()), location: message.location().url ? safeUrl(message.location().url, signedHost) : null }); });
  page.on('pageerror', error => log.pageErrors.push({ text: redact.text(error.message), stack: redact.text(error.stack || '') }));
  return log;
}
async function preventTransactions(context, redact) {
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    const decision = classifyRequest({ url: request.url(), method: request.method(), resourceType: request.resourceType(), headers: request.headers(), isNavigation: request.isNavigationRequest(), postData: request.postData() });
    const record = { method: request.method(), type: request.resourceType(), ...safeUrl(request.url(), context.__signedHost), ...decision };
    context.__guardObservations.push(record);
    if (decision.action === 'BLOCK') {
      context.__prevented.push(record); await route.abort('blockedbyclient');
    } else await route.continue();
  });
  context.__prevented = []; context.__guardObservations = []; context.__redactor = redact;
}
async function inspect(page, css, reference, product, log) {
  const count = await page.locator('style[data-rhino-nonpersistent-preview-css]').count();
  let cssom = null, styleText = null;
  if (count === 1) {
    cssom = await page.locator('style[data-rhino-nonpersistent-preview-css]').evaluate((element, source) => eval('(' + source + ')')(element.sheet), canonicalSheet.toString());
    styleText = await page.locator('style[data-rhino-nonpersistent-preview-css]').textContent();
  }
  const dom = await page.evaluate(() => {
    const shell = document.querySelector('product-info.rhino-machine-shell');
    const visible = e => !!e && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0 && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none';
    const text = e => e?.textContent?.replace(/\s+/g, ' ').trim() || '';
    const brief = e => e ? { tag: e.tagName.toLowerCase(), id: e.id, text: text(e), visible: visible(e) } : null;
    const style = document.querySelector('style[data-rhino-nonpersistent-preview-css]');
    const order = Array.from(document.querySelectorAll('head style,head link[rel="stylesheet"]'), e => e === style ? 'preview-inline' : e.tagName === 'STYLE' ? 'inline' : (e.getAttribute('href') || '').split('?')[0].split('/').pop());
    const title = shell?.querySelector('h1'), price = shell?.querySelector('[id^="price-"]'), quantity = shell?.querySelector('input[name=quantity]');
    const buy = shell?.querySelector('[name=add]'), contact = shell?.querySelector('.rhino-machine-contact'), pickup = shell?.querySelector('pickup-availability');
    const terms = shell?.querySelector('shopify-payment-terms');
    const variant = shell?.querySelector('product-form input[name=id]');
    const options = Array.from(shell?.querySelectorAll('variant-selects input[type=radio],variant-selects select') || [], e => ({ tag: e.tagName, name: e.name, value: e.value, checked: e.checked, disabled: e.disabled, label: text(e.labels?.[0]) }));
    const governedSelectors = ['.product__media-wrapper', 'media-gallery', 'product-modal', '.product__description', '.rhino-machine-facts', '.rhino-machine-resources', '.rhino-machine-resource-video', '.rhino-machine-support', '[id^="MachineSpecs-"]', '[id^="MachineKeySpecs-"]', '[id^="MachineContents-"]', '[id^="MachineContext-"]', '[id^="MachineDelivery-"]', '[id^="MachineSupport-"]', '[id^="MachineResources-"]', '[data-support-files]', '[data-rhino-support-files]', 'video', 'model-viewer'];
    const governedCounts = Object.fromEntries(governedSelectors.map(selector => [selector, shell?.querySelectorAll(selector).length || 0]));
    const emptyHeadings = Array.from(shell?.querySelectorAll('h1,h2,h3,h4,h5,h6') || []).filter(e => !text(e)).map(e => e.outerHTML.slice(0,200));
    const emptyCards = Array.from(shell?.querySelectorAll('.card,.rhino-machine-component,.rhino-machine-facts') || []).filter(e => !text(e) && !e.querySelector('img,video')).map(e => e.className);
    const mainText = text(shell);
    const suspectClaims = mainText.match(/UNAPPROVED|PLACEHOLDER|lorem ipsum|\b(?:horsepower|rpm|input voltage|warranty|bill of materials|included components|shipping in \d+|delivery in \d+|technical specifications|owner.s manual|support_files)\b/gi) || [];
    const boxes = {};
    const selectors = { title: '.product__title', price: '[id^="price-"]', variant: 'variant-selects', quantity: '[id^="Quantity-Form-"]', purchase: 'product-form', pickup: 'pickup-availability', contact: '.rhino-machine-contact', terms: 'shopify-payment-terms' };
    const clipped = [];
    for (const [key, selector] of Object.entries(selectors)) {
      const e = shell?.querySelector(selector); if (!visible(e)) continue; const r = e.getBoundingClientRect();
      boxes[key] = { left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height };
      if (r.left < -1 || r.right > innerWidth + 1 || e.scrollWidth > e.clientWidth + 2) clipped.push({ key, scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,left:r.left,right:r.right });
    }
    for (const e of Array.from(shell?.querySelectorAll('h1,.price-item,.button,.form__label,label') || []).filter(visible)) {
      if (e.scrollWidth > e.clientWidth + 2) clipped.push({ key:e.tagName.toLowerCase()+'.'+e.className,scrollWidth:e.scrollWidth,clientWidth:e.clientWidth });
    }
    const overlaps = [];
    const keys = Object.keys(boxes);
    for (let i=0;i<keys.length;i++) for(let j=i+1;j<keys.length;j++) {
      const a=boxes[keys[i]],b=boxes[keys[j]],ae=shell.querySelector(selectors[keys[i]]),be=shell.querySelector(selectors[keys[j]]);
      if(ae.contains(be)||be.contains(ae))continue;
      if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1)overlaps.push([keys[i],keys[j]]);
    }
    const ids = Array.from(document.querySelectorAll('[id]'), e=>e.id); const duplicateIds = [...new Set(ids.filter((id,i)=>ids.indexOf(id)!==i))];
    const scriptNames = Array.from(document.scripts, e=>(e.getAttribute('src')||'').split('?')[0].split('/').pop()).filter(Boolean);
    const controllerScripts = Object.fromEntries(['product-info.js','product-form.js','quantity-input.js','pickup-availability.js'].map(name=>[name,scriptNames.filter(n=>n===name).length]));
    const focusable = e => !!e && (e.matches('a[href],button,input,select,textarea,[tabindex]') && e.tabIndex>=0 && !e.disabled);
    const termsShadow = terms?.shadowRoot;
    const termsRect = terms?.getBoundingClientRect();
    const cssComputed = e=>{if(!e)return null;const s=getComputedStyle(e);return {width:s.width,minHeight:s.minHeight,fontSize:s.fontSize,color:s.color,display:s.display,overflowWrap:s.overflowWrap};};
    return { shellCount:document.querySelectorAll('product-info.rhino-machine-shell').length,mainCount:document.querySelectorAll('main').length,h1Count:document.querySelectorAll('main h1').length,noMediaCount:document.querySelectorAll('.product--no-media').length,
      productId:shell?.getAttribute('data-product-id'),title:brief(title),price:brief(price),quantity:quantity?{value:quantity.value,min:quantity.min,max:quantity.max,step:quantity.step,visible:visible(quantity),labels:Array.from(quantity.labels||[],text)}:null,
      variant:{selectedId:variant?.value||null,selectorCount:shell?.querySelectorAll('variant-selects').length||0,options},purchase:buy?{text:text(buy),disabled:buy.disabled,visible:visible(buy),type:buy.type}:null,
      contact:contact?{...brief(contact),href:contact.getAttribute('href')}:null,
      pickup:pickup?{elementPresent:true,visible:visible(pickup),available:pickup.hasAttribute('available'),variantId:pickup.getAttribute('data-variant-id'),text:text(pickup),buttons:Array.from(pickup.querySelectorAll('button'),e=>({text:text(e),visible:visible(e)}))}:null,
      paymentTerms:terms?{elementPresent:true,visible:visible(terms),text:text(terms),shadowText:text(termsShadow),variantId:terms.getAttribute('variant-id'),attributes:Array.from(terms.attributes,a=>[a.name,a.value]).filter(([name])=>!['url','shopify-meta'].includes(name)),focusable:focusable(terms),lightFocusable:Array.from(terms.querySelectorAll('a,button,[tabindex]'),e=>({tag:e.tagName,text:text(e),focusable:focusable(e)})),shadowFocusable:Array.from(termsShadow?.querySelectorAll('a,button,[tabindex]')||[],e=>({tag:e.tagName,text:text(e),focusable:focusable(e)})),rect:termsRect?{width:termsRect.width,height:termsRect.height}:null,domAfterPrice:!!price&&(price.compareDocumentPosition(terms)&Node.DOCUMENT_POSITION_FOLLOWING)!==0}:null,
      suppression:{governedCounts,emptyHeadings,emptyCards,suspectClaims,hiddenPopulatedGovernedCount:Object.values(governedCounts).reduce((a,b)=>a+b,0)},
      layout:{width:innerWidth,dpr:devicePixelRatio,documentScrollWidth:document.documentElement.scrollWidth,horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,clipped,overlaps,boxes},
      css:{styleOrder:order,inlineIndex:order.indexOf('preview-inline'),styleInHead:style?.parentElement===document.head,externalRhinoLinks:Array.from(document.querySelectorAll('link[href*="rhino-custom.css"]')).length,computed:{rhinoRed:getComputedStyle(document.documentElement).getPropertyValue('--rhino-color-red-700').trim(),contact:cssComputed(contact),shell:cssComputed(shell)}},
      globals:{headerPresent:!!document.querySelector('header.header'),footerPresent:!!document.querySelector('footer.footer'),headerVisible:visible(document.querySelector('header.header')),footerVisible:visible(document.querySelector('footer.footer')),cartLink:document.querySelector('#cart-icon-bubble')?.getAttribute('href'),cartNotificationPresent:!!document.querySelector('cart-notification'),predictiveSearchPresent:!!document.querySelector('predictive-search'),policyLinks:Array.from(document.querySelectorAll('footer a[href*="/policies/"]'),e=>({text:text(e),href:e.getAttribute('href')})),controllerScripts,duplicateIds,productFormCount:shell?.querySelectorAll('product-form').length||0,quantityInputCount:shell?.querySelectorAll('quantity-input').length||0},
      liquidErrors:document.body.innerText.match(/Liquid (?:error|syntax error)[^\n]*/gi)||[] };
  });
  const cssHash = cssom ? hash(JSON.stringify(cssom)) : null;
  const index=dom.css.inlineIndex, order=dom.css.styleOrder;
  const stale=log.requests.filter(r=>/rhino-custom\.css/i.test(r.path));
  const fidelity={styleCount:count,canonicalHash:cssHash,referenceHash:reference.externalHash,canonicalMatches:cssHash===reference.externalHash,
    lfTextSha256:styleText===null?null:hash(styleText),lfSourceSha256:reference.lfSourceSha256,lfSourceTextMatches:styleText===normalize(css),byteIdentityClaimed:false,
    cascadePositionMatches:index>0&&order[index-1]==='base.css'&&order[index+1]==='component-cart-items.css',styleInHead:dom.css.styleInHead,staleRhinoRequestCount:stale.length,externalRhinoLinkCount:dom.css.externalRhinoLinks,representativeRhinoStylesActive:dom.css.computed.rhinoRed.length>0};
  const template=dom.shellCount===1&&dom.mainCount===1&&dom.h1Count===1&&dom.noMediaCount===1&&dom.contact?.text==='Contact'&&dom.contact.href==='/pages/contact'&&dom.productId===product.id;
  const suppression=Object.values(dom.suppression.governedCounts).every(n=>n===0)&&!dom.suppression.emptyHeadings.length&&!dom.suppression.emptyCards.length&&!dom.suppression.suspectClaims.length;
  const native=!!dom.title?.visible&&!!dom.price?.visible&&!!dom.price.text&&!!dom.variant.selectedId&&!!dom.quantity?.visible&&!!dom.purchase?.visible;
  return { dom, fidelity, templateRendered:template, suppressionPassed:suppression,nativeDisplayPassed:native,
    fidelityPassed:count===1&&fidelity.canonicalMatches&&fidelity.lfSourceTextMatches&&fidelity.cascadePositionMatches&&fidelity.styleInHead&&!stale.length&&!fidelity.externalRhinoLinkCount&&fidelity.representativeRhinoStylesActive,
    layoutPassed:!dom.layout.horizontalOverflow&&!dom.layout.clipped.length&&!dom.layout.overlaps.length };
}
async function jsonLd(page, product) {
  return page.evaluate(({id})=>{
    const graphs=[],errors=[];
    const allowedProduct=['@context','@type','@id','productID','name','url','offers'];
    const allowedOffer=['@type','@id','url','identifier','price','priceCurrency','availability'];
    function visit(value){if(Array.isArray(value))return value.forEach(visit);if(!value||typeof value!=='object')return;
      if(value['@type']){const type=value['@type'];const types=Array.isArray(type)?type:[type];
        const graph={types,properties:Object.keys(value),productId:value.productID||null,name:value.name||null,offerCount:Array.isArray(value.offers)?value.offers.length:value.offers?1:0};
        if(types.includes('Product')){graph.expectedProductId=value.productID==='gid://shopify/Product/'+id;graph.blockedProperties=Object.keys(value).filter(k=>!allowedProduct.includes(k));graph.offers=(Array.isArray(value.offers)?value.offers:[value.offers]).filter(Boolean).map(o=>({type:o['@type'],properties:Object.keys(o),blockedProperties:Object.keys(o).filter(k=>!allowedOffer.includes(k)),price:o.price,currency:o.priceCurrency,availability:o.availability,identifier:o.identifier,urlValid:typeof o.url==='string'&&/^https?:\/\//.test(o.url),nativeIdentityValid:typeof o.price==='number'&&o.price>=0&&/^[A-Z]{3}$/.test(o.priceCurrency||'')&&/^https:\/\/schema.org\/(?:InStock|OutOfStock)$/.test(o.availability||'')}));}
        graphs.push(graph);
      }
      for(const [key,child]of Object.entries(value))if(key!=='@context')visit(child);
    }
    for(const script of document.querySelectorAll('script[type="application/ld+json"]')){try{visit(JSON.parse(script.textContent));}catch(e){errors.push(e.message);}}
    const productGraphs=graphs.filter(g=>g.types.includes('Product'));
    return {graphs,parseErrors:errors,productGraphCount:productGraphs.length,contained:!errors.length&&productGraphs.length===1&&productGraphs.every(g=>g.expectedProductId&&!g.blockedProperties.length&&g.offers.length&&g.offers.every(o=>o.type==='Offer'&&!o.blockedProperties.length&&o.nativeIdentityValid&&o.urlValid)),metadata:{title:document.title,descriptionPresent:!!document.querySelector('meta[name=description]'),productOgImages:document.querySelectorAll('meta[property="og:image"],meta[property="og:image:secure_url"]').length}};
  },{id:product.id});
}
async function axe(page, exclusion = null) {
  let builder = new AxeBuilder({page});
  if (exclusion) builder = builder.exclude(exclusion);
  const result=await builder.analyze();
  const counts={critical:0,serious:0,moderate:0,minor:0,unknown:0};
  for(const v of result.violations)counts[v.impact||'unknown']++;
  return {counts,clean:counts.critical===0&&counts.serious===0,violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,help:v.help,nodeCount:v.nodes.length,nodes:v.nodes.map(n=>({target:n.target,html:n.html,failureSummary:n.failureSummary}))}))};
}
async function keyboard(page) {
  // Tab only; no Enter/Space on transaction, Contact or provider controls.
  await page.evaluate(()=>{document.activeElement?.blur();window.scrollTo(0,0);document.body.setAttribute('tabindex','-1');document.body.focus();});
  const steps=[];let repeated=false;
  for(let i=0;i<100;i++){
    await page.keyboard.press('Tab');
    const step=await page.evaluate(()=>{
      let e=document.activeElement;while(e?.shadowRoot?.activeElement)e=e.shadowRoot.activeElement;
      if(!e||e===document.body)return {category:'body'};
      const shell=e.closest('product-info')||e.getRootNode()?.host?.closest('product-info');
      let target=e.matches('input[type=radio]')?e.labels?.[0]||e:e;
      if(e.classList.contains('shopify-cleanslate'))target=e;
      const s=getComputedStyle(target),r=target.getBoundingClientRect();
      let category=e.closest('header')?'header':e.closest('footer')?'footer':shell?'product':'global';
      if(e.closest('variant-selects'))category='variant';else if(e.closest('quantity-input'))category='quantity';else if(e.name==='add')category='purchase';else if(e.matches('.rhino-machine-contact'))category='Contact';else if(e.closest('pickup-availability, pickup-availability-drawer'))category='pickup';else if(e.closest('shopify-payment-terms')||e.getRootNode()?.host?.matches('shopify-payment-terms'))category='paymentTerms';
      return {tag:e.tagName,id:e.id,name:e.name||null,text:(e.getAttribute('aria-label')||e.labels?.[0]?.textContent||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,160),category,focusVisible:e.matches(':focus-visible'),outline:s.outlineStyle,outlineWidth:s.outlineWidth,boxShadow:s.boxShadow,indicatorVisible:(s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0)||s.boxShadow!=='none',rect:{left:r.left,right:r.right,width:r.width,height:r.height},innerWidth};
    });
    steps.push(step);
    if(i>3&&JSON.stringify(step)===JSON.stringify(steps[0])){repeated=true;break;}
  }
  await page.evaluate(()=>document.body.removeAttribute('tabindex'));
  const productOrder=steps.filter(s=>['variant','quantity','purchase','pickup','Contact','paymentTerms'].includes(s.category)).map(s=>s.category);
  const firstContact=productOrder.indexOf('Contact'),firstQuantity=productOrder.indexOf('quantity'),firstPurchase=productOrder.indexOf('purchase');
  return {steps,cycleObserved:repeated,productOrder,logicalProductOrder:firstQuantity>=0&&firstContact>firstQuantity&&(firstPurchase<0||firstPurchase<firstContact),invisibleIndicators:steps.filter(s=>s.category!=='body'&&!s.indicatorVisible),purchaseControlsActivated:false,contactActivated:false};
}
async function nativeUpdates(page) {
  const before=await page.locator('product-info').evaluate(e=>({id:e.querySelector('product-form input[name=id]')?.value,quantity:e.querySelector('input[name=quantity]')?.value,termsId:e.querySelector('shopify-payment-terms')?.getAttribute('variant-id'),price:e.querySelector('[id^=price-]')?.textContent?.trim()}));
  const quantity=page.locator('product-info input[name=quantity]');
  await page.locator('product-info quantity-input button[name=plus]').click();const plus=await quantity.inputValue();
  await page.locator('product-info quantity-input button[name=minus]').click();const minus=await quantity.inputValue();
  const radios=page.locator('product-info variant-selects input[type=radio]:not(:checked):not(:disabled)');
  const select=page.locator('product-info variant-selects select');let variantAction='NO_ALTERNATE_NATIVE_OPTION';
  if(await radios.count()){await radios.first().check();variantAction='NATIVE_RADIO_CHANGE';await page.waitForTimeout(1800);}
  else if(await select.count()){const options=await select.first().locator('option').evaluateAll(es=>es.filter(e=>!e.disabled&&!e.selected).map(e=>e.value));if(options.length){await select.first().selectOption(options[0]);variantAction='NATIVE_SELECT_CHANGE';await page.waitForTimeout(1800);}}
  const after=await page.locator('product-info').evaluate(e=>({id:e.querySelector('product-form input[name=id]')?.value,quantity:e.querySelector('input[name=quantity]')?.value,termsId:e.querySelector('shopify-payment-terms')?.getAttribute('variant-id'),price:e.querySelector('[id^=price-]')?.textContent?.trim(),machineShell:e.classList.contains('rhino-machine-shell'),contact:!!e.querySelector('.rhino-machine-contact'),pickupVariant:e.querySelector('pickup-availability')?.getAttribute('data-variant-id')}));
  return {before,after,quantity:{plus,minus,restored:minus===before.quantity,incremented:Number(plus)>Number(before.quantity)},variantAction,variantChanged:before.id!==after.id,providerTermsSynchronize:!after.termsId||after.termsId===after.id,pickupSynchronizes:!after.pickupVariant||after.pickupVariant===after.id};
}
async function globalUtilities(page) {
  const result={cartMutation:false,contactSubmission:false,policyLinkNavigation:false};
  const menu=page.locator('summary.header__icon--menu');
  if(await menu.count()&&await menu.isVisible()){await menu.click();result.mobileMenu={opened:await page.locator('#menu-drawer').isVisible(),links:await page.locator('#menu-drawer a').count()};await page.keyboard.press('Escape');}
  const search=page.locator('details-modal.header__search summary').first();
  if(await search.count()&&await search.isVisible()){
    await search.click();const input=page.locator('details-modal.header__search input[type=search]:visible').first();
    if(await input.count()){await input.fill('BeadMaster');await page.waitForTimeout(1000);result.search={readOnly:true,query:'BeadMaster',predictiveResultCount:await page.locator('[id^=predictive-search-option]').count(),expanded:await input.getAttribute('aria-expanded')};await input.fill('');}
    await page.keyboard.press('Escape');
  }else result.search={status:'NO_VISIBLE_NATIVE_SEARCH_TRIGGER'};
  return result;
}
function networkAssertions(log) {
  return {staleRhinoCss:log.requests.filter(r=>/rhino-custom\.css/i.test(r.path)),videoProviders:log.requests.filter(r=>r.owner==='VIDEO_PROVIDER'),documentDownloads:log.requests.filter(r=>/\.(pdf|docx?|zip)(?:$|\/)/i.test(r.path)),FAnalyticsRequests:log.requests.filter(r=>/epic[-_]f|rhino[-_]machine[-_]event|machine_(?:resource|video|gallery|specification)/i.test(r.path)),nativeAnalytics:log.requests.filter(r=>/analytics|collect|monorail|pixel/i.test(r.path)),previewRequests:log.requests.filter(r=>r.origin==='[SIGNED_PREVIEW_HOST_REDACTED]')};
}
async function runBrowser({signedUrl,css,reference,redact,progress}) {
  const signedHost=new URL(signedUrl).hostname;
  const result={smoke:null,cells:[],textEnlargement:[],browserZoom:[],keyboard:[],nativeUpdates:[],globalUtilities:[],allPassed:false};
  const browser=await chromium.launch({headless:true});
  const context=await browser.newContext({viewport:{width:390,height:900}});context.__signedHost=signedHost;
  await preventTransactions(context,redact);
  async function open(product,width){await context.setDefaultTimeout(15000);const page=await context.newPage();await page.setViewportSize({width,height:1000});const log=attachNetwork(page,signedHost,redact);let response;
    try{response=await page.goto(routeUrl(signedUrl,product.route),{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(2000);const check=await inspect(page,css,reference,product,log);return {page,log,response,check};}
    catch(error){await page.close();throw error;}
  }
  try {
    const smoke=await open(PRODUCTS[0],390);
    result.smoke={product:PRODUCTS[0].gid,route:PRODUCTS[0].route+'?view=machine',httpStatus:smoke.response.status(),...smoke.check,network:networkAssertions(smoke.log),log:smoke.log};
    result.smoke.passed=result.smoke.httpStatus===200&&smoke.check.templateRendered&&smoke.check.fidelityPassed&&smoke.check.nativeDisplayPassed&&!smoke.check.dom.liquidErrors.length&&!smoke.log.pageErrors.length;
    progress({phase:'smoke',passed:result.smoke.passed,fidelity:smoke.check.fidelityPassed,template:smoke.check.templateRendered});await smoke.page.close();
    if(!result.smoke.passed){result.stopReason='SMOKE_FAILED';return result;}
    for(const product of PRODUCTS)for(const width of [320,390,768,1440]){
      const opened=await open(product,width);const {page,log,check,response}=opened;
      try{
        const structuredData=await jsonLd(page,product),accessibility=await axe(page),network=networkAssertions(log);
        const cell={gid:product.gid,title:product.title,route:product.route+'?view=machine',width,httpStatus:response.status(),...check,structuredData,accessibility,network,log};
        cell.passed=response.status()===200&&check.templateRendered&&check.fidelityPassed&&check.suppressionPassed&&check.nativeDisplayPassed&&check.layoutPassed&&structuredData.contained&&accessibility.clean&&!log.pageErrors.length&&!check.dom.liquidErrors.length&&!network.videoProviders.length&&!network.documentDownloads.length&&!network.FAnalyticsRequests.length;
        result.cells.push(cell);progress({phase:'responsive',product:product.handle,width,passed:cell.passed,axe:accessibility.counts});
        if(width===1440){result.keyboard.push({gid:product.gid,...await keyboard(page)});result.nativeUpdates.push({gid:product.gid,...await nativeUpdates(page)});if(product===PRODUCTS[0])result.globalUtilities.push({gid:product.gid,...await globalUtilities(page)});}
      }finally{await page.close();}
    }
    for(const product of PRODUCTS)for(const width of [390,1440]){
      const {page,log,check:before}=await open(product,width);
      try{await page.evaluate(()=>document.documentElement.style.fontSize=parseFloat(getComputedStyle(document.documentElement).fontSize)*2+'px');const after=await inspect(page,css,reference,product,log);const accessibility=await axe(page);
        const observation={gid:product.gid,width,method:'root_font_200_percent_not_browser_zoom',beforeTitleFont:before.dom.title?await page.locator('product-info h1').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)/2):null,afterTitleFont:await page.locator('product-info h1').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)),...after,accessibility,log};
        observation.passed=after.layoutPassed&&after.nativeDisplayPassed&&after.fidelityPassed&&accessibility.clean;result.textEnlargement.push(observation);progress({phase:'text-enlargement',product:product.handle,width,passed:observation.passed});
      }finally{await page.close();}
    }
    result.preventedTransactions=context.__prevented;
  }catch(error){result.stopReason='BROWSER_CHECK_EXCEPTION';result.error=redact.text(error.stack||error.message);return result;}
  finally{await context.close();await browser.close();}
  // Chromium's extension API changes true browser zoom. Profile/extension are
  // ephemeral OS-temp artifacts, outside the repository, removed on close.
  const tempRoot=fs.mkdtempSync(path.join(os.tmpdir(),'rhino-nonpersistent-zoom-'));
  const extension=path.join(tempRoot,'extension');fs.mkdirSync(extension);
  fs.writeFileSync(path.join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'Rhino local browser zoom',version:'1.0',permissions:['tabs'],background:{service_worker:'worker.js'}}));
  fs.writeFileSync(path.join(extension,'worker.js'),'chrome.runtime.onInstalled.addListener(() => {});');
  let zoomContext;
  try{
    zoomContext=await chromium.launchPersistentContext(path.join(tempRoot,'profile'),{channel:'chromium',headless:true,viewport:null,args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`,'--window-size=1280,1000','--disk-cache-size=0','--disable-application-cache']});
    zoomContext.__signedHost=signedHost;await preventTransactions(zoomContext,redact);
    const worker=zoomContext.serviceWorkers()[0]||await zoomContext.waitForEvent('serviceworker');
    for(const product of PRODUCTS){const page=await zoomContext.newPage();const log=attachNetwork(page,signedHost,redact);
      try{await page.goto(routeUrl(signedUrl,product.route),{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(1500);
        await worker.evaluate(async()=>{for(const tab of await chrome.tabs.query({}))if(tab.url.startsWith('http'))await chrome.tabs.setZoom(tab.id,1);});
        const before=await page.evaluate(()=>({width:innerWidth,dpr:devicePixelRatio}));
        const zoom=await worker.evaluate(async()=>{const tab=(await chrome.tabs.query({active:true})).find(t=>t.url.startsWith('http'));if(!tab)throw Error('No active zoom tab');await chrome.tabs.setZoom(tab.id,2);return chrome.tabs.getZoom(tab.id);});
        await page.waitForTimeout(300);const after=await page.evaluate(()=>({width:innerWidth,dpr:devicePixelRatio,scrollWidth:document.documentElement.scrollWidth}));
        const check=await inspect(page,css,reference,product,log),accessibility=await axe(page),focus=await keyboard(page);
        const observation={gid:product.gid,method:'chrome.tabs.setZoom',zoom,before,after,...check,accessibility,focus,log};
        observation.passed=zoom===2&&after.width<=before.width/2+1&&after.dpr===before.dpr*2&&check.layoutPassed&&check.fidelityPassed&&check.nativeDisplayPassed&&accessibility.clean&&!focus.invisibleIndicators.length;
        result.browserZoom.push(observation);progress({phase:'browser-zoom',product:product.handle,passed:observation.passed,zoom});
      }finally{await page.close();}
    }
    result.preventedTransactions.push(...zoomContext.__prevented);
  }catch(error){result.stopReason='BROWSER_ZOOM_EXCEPTION';result.error=redact.text(error.stack||error.message);return result;}
  finally{
    if(zoomContext)await zoomContext.close();
    const resolved=path.resolve(tempRoot),expectedParent=path.resolve(os.tmpdir());
    if(path.dirname(resolved)!==expectedParent||!path.basename(resolved).startsWith('rhino-nonpersistent-zoom-'))throw Error('Temporary-profile cleanup boundary invalid');
    fs.rmSync(resolved,{recursive:true,force:true});result.ephemeralZoomProfileRemoved=true;
  }
  result.allPassed=result.cells.length===32&&result.cells.every(c=>c.passed)&&result.textEnlargement.every(c=>c.passed)&&result.browserZoom.length===8&&result.browserZoom.every(c=>c.passed)&&result.keyboard.every(k=>k.logicalProductOrder&&!k.invisibleIndicators.length)&&result.nativeUpdates.every(u=>u.quantity.incremented&&u.quantity.restored&&u.after.machineShell&&u.after.contact&&u.providerTermsSynchronize&&u.pickupSynchronizes)&&!result.preventedTransactions.length;
  return result;
}
async function previewToolbarOwnership(page) {
  const iframe = page.locator('iframe#PBarNextFrame');
  if (await iframe.count() !== 1) return {verified:false, reason:'Expected exactly one preview tooling iframe'};
  const attributes = await iframe.evaluate(e=>({id:e.id,tag:e.tagName,src:e.getAttribute('src'),position:getComputedStyle(e).position}));
  const frame = await iframe.elementHandle().then(e=>e.contentFrame());
  const signatures = frame ? await frame.locator('._GrabberButton, .Online-Store-UI-BottomSheet').count() : 0;
  const source = attributes.src ? safeUrl(new URL(attributes.src,page.url()).toString(),new URL(page.url()).hostname) : null;
  const signatureSource = source?.origin==='https://cdn.shopify.com' && source.path==='/shopifycloud/preview-bar/index.html';
  // Unique injected iframe ID + exact Shopify-owned origin/tool document.
  // UI class names vary by preview-bar version and are supplemental evidence.
  return {verified:signatureSource, selector:'iframe#PBarNextFrame',id:attributes.id,tag:attributes.tag,position:attributes.position,source,shopifyUiSignatureCount:signatures,structuralSourceSignature:signatureSource,excludedRules:[],onlyInjectedToolingExcluded:true};
}
async function runCleanupBrowser({signedUrl,css,reference,redact,progress}) {
  const browser=await chromium.launch({headless:true}),context=await browser.newContext({acceptDownloads:false});
  context.__signedHost=new URL(signedUrl).hostname;
  const result={kind:'PRE_PERSISTENT_RELEASE_GATE_CLEANUP',smoke:null,cells:[],keyboard:[],nativeUpdates:[],downloads:[],allPassed:false};
  await preventTransactions(context,redact);
  await context.addInitScript(()=>{
    window.__rhinoCleanupPublishObservation={installed:false,unexpectedNames:[],domEvents:[]};
    const state=window.__rhinoCleanupPublishObservation;
    for(const name of ['rhino:machine:contact-activate','rhino:machine:resource-activate','rhino:machine:context-navigate','rhino:machine:delivery-navigate'])document.addEventListener(name,()=>state.domEvents.push(name),true);
    const poll=setInterval(()=>{const analytics=window.Shopify?.analytics;if(!analytics||typeof analytics.publish!=='function'||state.installed)return;
      const original=analytics.publish;try{analytics.publish=function(name,...args){if(/^rhino:machine:/.test(name)){state.unexpectedNames.push(name);return Promise.resolve();}return Reflect.apply(original,this,[name,...args]);};state.installed=analytics.publish!==original;if(state.installed)clearInterval(poll);}catch{}},50);
  });
  try {
    for(const product of PRODUCTS) for(const width of [320,390,768,1440]) {
      const page=await context.newPage();await page.setViewportSize({width,height:1000});
      const log=attachNetwork(page,context.__signedHost,redact);
      page.on('download',async download=>{result.downloads.push({gid:product.gid,width,...safeUrl(download.url(),context.__signedHost),cancelled:true});await download.cancel();});
      try {
        const response=await page.goto(routeUrl(signedUrl,product.route),{waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForTimeout(2500);
        const check=await inspect(page,css,reference,product,log),ownership=await previewToolbarOwnership(page);
        const full=await axe(page),storefront=ownership.verified?await axe(page,ownership.selector):null;
        const structuredData=await jsonLd(page,product),network=networkAssertions(log);
        const publishObservation=await page.evaluate(()=>window.__rhinoCleanupPublishObservation);
        const row={gid:product.gid,title:product.title,route:product.route+'?view=machine',width,httpStatus:response.status(),...check,ownership,fullPreviewAxe:full,storefrontOwnedAxe:storefront,structuredData,network,publishObservation,log};
        row.passed=response.status()===200&&check.templateRendered&&check.fidelityPassed&&check.nativeDisplayPassed&&check.suppressionPassed&&check.layoutPassed&&structuredData.contained&&ownership.verified&&storefront?.clean&&!log.pageErrors.length&&!check.dom.liquidErrors.length;
        result.cells.push(row);progress({phase:'cleanup-cell',product:product.handle,width,passed:row.passed,fullAxe:full.counts,storefrontAxe:storefront?.counts||null,ownership:ownership.verified});
        if(!result.smoke){result.smoke={...row,passed:response.status()===200&&check.templateRendered&&check.fidelityPassed&&check.nativeDisplayPassed&&!log.pageErrors.length&&!check.dom.liquidErrors.length};if(!result.smoke.passed){result.stopReason='SMOKE_FAILED';return result;}}
        if(width===390||width===1440){const focus=await keyboard(page);result.keyboard.push({gid:product.gid,width,...focus,storefrontInvisibleIndicators:focus.invisibleIndicators.filter(s=>s.id!=='PBarNextFrame'),previewToolInvisibleIndicators:focus.invisibleIndicators.filter(s=>s.id==='PBarNextFrame'),ownershipVerified:ownership.verified});}
        if(width===1440)result.nativeUpdates.push({gid:product.gid,...await nativeUpdates(page)});
        if(!ownership.verified){result.stopReason='OWNERSHIP_SIGNATURE_UNVERIFIED';return result;}
      }finally{await page.close();}
    }
    result.preventedRequests=context.__prevented;result.guardObservations=context.__guardObservations;
    result.nativePreloads=result.guardObservations.filter(r=>r.path==='/checkouts/internal/preloads.js');
    const unexpected=result.preventedRequests.length+result.downloads.length+result.cells.reduce((n,r)=>n+r.publishObservation.unexpectedNames.length+r.publishObservation.domEvents.length,0);
    result.providerParity=unexpected?'failed':result.nativePreloads.length&&result.nativePreloads.every(r=>r.action==='ALLOW')&&result.cells.every(r=>r.dom.paymentTerms?.visible)&&result.nativeUpdates.every(r=>r.providerTermsSynchronize)?'verified':'qualified';
    result.providerParityDefinition='Observed native rendering and synchronized Variant, allowed passive requests, zero harness interference. Upstream HTTP/CSP failures remain separately reported; this is not provider business approval.';
    result.allPassed=result.cells.length===32&&result.cells.every(r=>r.passed)&&result.keyboard.every(k=>k.logicalProductOrder&&!k.storefrontInvisibleIndicators.length)&&result.providerParity==='verified'&&!unexpected;
  }catch(error){result.stopReason='CLEANUP_BROWSER_EXCEPTION';result.error=redact.text(error.stack||error.message);}
  finally{await context.close();await browser.close();signedUrl=null;}
  return result;
}
module.exports={localReference,runBrowser,runCleanupBrowser,axe,previewToolbarOwnership};
