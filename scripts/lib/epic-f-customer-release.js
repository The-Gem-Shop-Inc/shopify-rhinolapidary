'use strict';
// Customer release is derived exclusively from E's immutable approval + receipt.
// Compilation is pure; deployment and Shopify writes are separate operations.
const E=require('./epic-e-owner-response-adapter'),assert=require('node:assert/strict');
const {formatTyped}=require('./epic-f-facts');
const roles=require('../../data/epic-f-field-roles.json').fields;
const identity=require('../../data/epic-e-product-identity.json').productIdentities;
const classification=require('../../data/epic-e-product-classification.json').mappings;
const RELEASE='data/epic-f-customer-fact-release.json';
const FACT='snippets/rhino-owner-approved-facts.liquid',CONTEXT='snippets/rhino-owner-approved-context.liquid';
const q=s=>"'"+String(s).replace(/'/g,'&#39;')+"'";
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function eligibleRows(state) {
 assert(state&&state.receipt&&state.input&&state.products);
 const rows=state.input.rows.filter(r=>E.definition(r.field.split('.').pop()).accessIntent.storefront==='public_read'&&(r.domain==='compatibility'||r.domain==='included_components'||state.products.some(p=>p.id===r.targetGid&&p.templateSuffix==='machine')));
 return rows.filter(r=>{const role=roles.find(role=>role.fields.includes(r.field.split('.').pop()));if(!role||role.fields.length!==2)return true;const pair=role.fields.map(k=>rows.find(n=>n.targetGid===r.targetGid&&n.field.endsWith('.'+k)));return pair.every(Boolean)&&!!formatTyped(pair,role);});
}
function project(state) {
 const rows=eligibleRows(state),pages=[];
 for(const product of state.products.filter(p=>p.templateSuffix==='machine')) {
  const gid=product.id,specs=[];
  for(const role of roles) {
   const matching=role.fields.map(k=>rows.find(r=>r.targetGid===gid&&r.field.endsWith('.'+k)));
   if(!matching.every(Boolean))continue;
   const row=formatTyped(matching,role);if(row)specs.push({role,row,sourceRows:matching});
  }
  const members=rows.find(r=>r.targetGid===gid&&r.field.endsWith('.included_products')),quantities=rows.find(r=>r.targetGid===gid&&r.field.endsWith('.included_quantities'));
  const contents=[];if(members){assert(quantities&&require('./epic-f-facts').quantityMap(quantities.desired,members.desired));for(const partGid of members.desired){const part=state.products.find(p=>p.id===partGid);assert(part&&part.status==='ACTIVE'&&part.publishedAt);contents.push({line:{label:part.title,quantity:quantities.desired[partGid],componentProductGid:partGid},sourceRow:members});}}
  contents.push(...rows.filter(r=>r.targetGid===gid&&r.field.endsWith('.noncatalog_components')).flatMap(r=>r.desired.map(line=>({line,sourceRow:r}))));
  const cards=[];
  for(const r of rows.filter(r=>r.domain==='compatibility'&&r.desired.includes(gid))) {
   const part=state.products.find(p=>p.id===r.targetGid),ident=identity.find(p=>p.productGid===r.targetGid),cls=classification.find(p=>p.productGid===r.targetGid)?.proposedProductClass;
   if(!part||!ident||part.status!=='ACTIVE'||!part.publishedAt||part.handle!==ident.handle||!['replacement_part','consumable','accessory'].includes(cls)||/compatible|fits?\b/i.test(part.title))continue;
   cards.push({productGid:part.id,handle:part.handle,title:part.title,productClass:cls,sourceRow:r});
  }
  assert(cards.length+(members?.desired.length||0)<=20,'Native all_products lookup budget');
  pages.push({productGid:gid,handle:product.handle,title:product.title,specs,contents,cards});
 }
 return {rows,pages};
}
function liveChecks(row,index) {
 const key=row.field.split('.').pop(),base='product.metafields.rhino.'+key+'.value',prefix='rhino_owner_'+index,setup=[],checks=[`product.metafields.rhino.${key}.type == ${q(row.type)}`];
 // Liquid Measurement.unit exposes a symbol, not the Admin enum. These exact
 // representations were observed on the approved BeadMaster and EM-1 values.
 // No conversion or alternate physical unit is accepted.
 const symbols={voltage:{volts:'v'},frequency:{hertz:'hz'},rotational_speed:{revolutions_per_minute:'rpm'},power:{horsepower:'hp'},dimension:{inches:'in'},weight:{pounds:'lb'},volume:{us_gallons:'gal'}};
 if(['weight','volume','single_line_text_field'].includes(row.type)){
  const def=E.field(key);assert(def&&def.type===row.type,'Exact governed field/type required');
  if(row.type==='weight')assert.equal(key,'net_weight','Only governed NET weight supported');
  if(row.type==='volume')assert(['water_reservoir_capacity','cutting_oil_fill_min','cutting_oil_fill_max'].includes(key)&&row.desired.unit==='us_gallons','Approved US gallons only');
  if(row.type==='single_line_text_field'){assert.equal(key,'water_system_type');assert(def.allowedValues.includes(row.desired),'Unknown water enum');checks.push(`${base} == ${q(row.desired)}`);return {setup,checks};}
  assert(Number.isFinite(row.desired.value)&&row.desired.value>0&&row.desired.unit===def.unit,'Exact governed unit and positive value');
 }
 const symbol=unit=>{const value=symbols[row.type.replace(/^list\./,'')]?.[unit];assert(value,'Unobserved Liquid unit '+row.type+'/'+unit);return value;};
 if(row.type==='json') {
  assert.equal(row.desired.length,1);const item=row.desired[0];setup.push(`{%- assign ${prefix} = ${base} | first -%}`);
  checks.push(`${base}.size == 1`,`${prefix}.label == ${q(item.label)}`,`${prefix}.quantity == ${item.quantity}`,`${prefix}.meaning == ${q(item.meaning)}`);
 } else if(row.type.startsWith('list.')) {
  assert.equal(row.desired.length,1);setup.push(`{%- assign ${prefix} = ${base} | first -%}`,`{%- assign ${prefix}_unit = ${prefix}.unit | downcase -%}`);
  checks.push(`${base}.size == 1`,`${prefix}.value == ${row.desired[0].value}`,`${prefix}_unit == ${q(symbol(row.desired[0].unit))}`);
 } else {
  setup.push(`{%- assign ${prefix}_unit = ${base}.unit | downcase -%}`);
  checks.push(`${base}.value == ${row.desired.value}`,`${prefix}_unit == ${q(symbol(row.desired.unit))}`);
 }
 return {setup,checks};
}
function compile(state) {
 const p=project(state),expires=Math.floor(Date.parse(state.receipt.expiresAt)/1000),starts=Math.floor(Date.parse(state.receipt.reconciledAt)/1000),receiptHash=state.receiptHash||E.hash(require('fs').readFileSync(E.RECEIPT));
 const release={schemaVersion:1,mode:'OWNER_RECONCILED_CUSTOMER_RELEASE',fixtureOnly:false,source:{...state.input.source},receipt:{path:state.receiptPath||E.RECEIPT,sha256:receiptHash},expiresAt:state.receipt.expiresAt,
  grants:p.rows.map(r=>({rowId:r.rowId,productGid:r.targetGid,domain:r.domain,field:r.field,type:r.type,desired:r.desired,ownerDecisionId:r.ownerDecisionId,approvalDecisionId:r.approvalDecisionId,metafieldGid:state.receipt.proof.rows.find(n=>n.rowId===r.rowId).metafieldGid})),
  suppressedApprovedRows:state.input.rows.filter(r=>!p.rows.includes(r)).map(r=>({rowId:r.rowId,reason:E.definition(r.field.split('.').pop()).accessIntent.storefront!=='public_read'?'ADMIN_ONLY':'INCOMPLETE_CUSTOMER_RANGE'})),
  pageSummary:p.pages.map(page=>({productGid:page.productGid,handle:page.handle,specRows:page.specs.length,contentsLines:page.contents.length,compatibleCards:page.cards.length})),publicationRightsGranted:false,mediaChanged:false};
 const header=`{%- comment -%}\nGenerated from exact E owner responses and reconciled Product metafields.\nReceipt SHA256: ${receiptHash}\nNo candidate, crate, optional, resource or recommendation fallback.\n{%- endcomment -%}\n{%- assign rhino_owner_now = 'now' | date: '%s' | plus: 0 -%}\n{%- assign rhino_owner_gid = 'gid://shopify/Product/' | append: product.id -%}\n{%- if template.suffix == 'machine' and product.published_at != blank and product.metafields.rhino.product_class.value == 'machine' and rhino_owner_now >= ${starts} and rhino_owner_now < ${expires} -%}\n`;
 const facts=[header],context=[header],shards={};let index=0;
 for(const page of p.pages) {
  const factStart=facts.length,contextStart=context.length;
  facts.push(`{%- if rhino_owner_gid == ${q(page.productGid)} -%}`);
  if(page.specs.length) {
   facts.push('{%- assign rhino_owner_specs_present = false -%}');
   const admitted=page.specs.map(s=>{const checks=s.sourceRows.map(r=>liveChecks(r,index++)),flag='rhino_owner_spec_admitted_'+index;facts.push(...checks.flatMap(c=>c.setup),`{%- assign ${flag} = false -%}`,`{%- if ${checks.flatMap(c=>c.checks).join(' and ')} -%}{%- assign ${flag} = true -%}{%- assign rhino_owner_specs_present = true -%}{%- endif -%}`);return {...s,flag};});
   const rowMarkup=(s,surface)=>`{%- if ${s.flag} -%}<div class="rhino-machine-fact-row" data-rhino-owner-field="${s.role.id}" data-rhino-owner-surface="${surface}"><dt>{{ ${q(s.row.label_key)} | t | escape }}</dt><dd>${safe(s.row.display)}</dd></div>{%- endif -%}`;
   const keys=admitted.filter(s=>s.role.keyRole).slice(0,3);
   facts.push('{%- if rhino_owner_specs_present -%}');
   if(keys.length)facts.push(`{%- if ${keys.map(s=>s.flag).join(' or ')} -%}`,`<section class="rhino-machine-facts" aria-labelledby="OwnerKeySpecs-{{ section.id }}"><h2 id="OwnerKeySpecs-{{ section.id }}">{{ 'products.product.machine_facts.key' | t }}</h2><dl>`,...keys.map(s=>rowMarkup(s,'key')),'</dl></section>','{%- endif -%}');
   facts.push(`<section class="rhino-machine-facts" aria-labelledby="OwnerSpecs-{{ section.id }}"><h2 id="OwnerSpecs-{{ section.id }}">{{ 'products.product.machine_facts.details' | t }}</h2>`);
   for(const domain of [...new Set(admitted.map(s=>s.role.domain))]){const group=admitted.filter(s=>s.role.domain===domain);facts.push(`{%- if ${group.map(s=>s.flag).join(' or ')} -%}`,`<h3>{{ ${q('products.product.machine_facts.groups.'+domain)} | t }}</h3><dl>`,...group.map(s=>rowMarkup(s,'detail')),'</dl>','{%- endif -%}');}
   facts.push('</section>','{%- endif -%}');
  }
  if(page.contents.some(i=>i.sourceRow.rowId.startsWith('OCT14:'))){const B=require('./epic-f-bom-contents-compiler');shards[B.PATH]=B.compile(page,state);facts.push("{%- render 'rhino-owner-approved-contents-8905780756677', product: product, section: section -%}");}
  else for(const item of page.contents){const checks=liveChecks(item.sourceRow,index++);facts.push(...checks.setup,`{%- if ${checks.checks.join(' and ')} -%}`,`<section class="rhino-machine-facts" aria-labelledby="OwnerContents-{{ section.id }}"><h2 id="OwnerContents-{{ section.id }}">{{ 'products.product.machine_facts.included' | t }}</h2><ul role="list"><li data-rhino-owner-content="${safe(item.line.label)}">${safe(item.line.label)} <span class="rhino-machine-component-quantity">× ${item.line.quantity}</span></li></ul></section>`,'{%- endif -%}');}
  facts.push('{%- endif -%}');
  context.push(`{%- if rhino_owner_gid == ${q(page.productGid)} -%}`);
  if(page.cards.length) {
   context.push('{%- capture rhino_owner_context_items -%}');
   for(const card of page.cards) {
    const id=index++,variable='rhino_owner_part_'+id,nativeId=card.productGid.split('/').pop(),targets=card.sourceRow.desired.map(g=>g.split('/').pop()).sort().join(',');
    context.push(`{%- assign ${variable} = all_products[${q(card.handle)}] -%}`,`{%- assign ${variable}_targets = ${variable}.metafields.rhino.compatible_machines.value | map: 'id' | sort | join: ',' -%}`,
     `{%- if ${variable}.id == ${nativeId} and ${variable}.metafields.rhino.product_class.value == ${q(card.productClass)} and ${variable}.metafields.rhino.compatible_machines.type == 'list.product_reference' and ${variable}_targets == ${q(targets)} -%}`,
     `<li class="rhino-machine-component" data-rhino-owner-compatible="${nativeId}" aria-describedby="OwnerRelationship-{{ section.id }}-${id}"><h3 id="OwnerRelationship-{{ section.id }}-${id}">{{ 'products.product.machine_context.compatible' | t }}</h3>`,
     `{% assign rhino_owner_card_id = section.id | append: '-owner-${id}' %}{% render 'card-product', card_product: ${variable}, section_id: rhino_owner_card_id, skip_styles: true, quick_add: 'none', show_vendor: false, show_rating: false, show_secondary_image: false, extend_height: false, rhino_contents_context: true, rhino_owner_customer_context: true %}`,'</li>','{%- endif -%}');
   }
   context.push('{%- endcapture -%}',"{%- assign rhino_owner_context_items = rhino_owner_context_items | strip -%}",'{%- if rhino_owner_context_items != blank -%}',"{{ 'component-card.css' | asset_url | stylesheet_tag }}",'<section class="rhino-machine-facts rhino-machine-contextual" aria-labelledby="OwnerContext-{{ section.id }}"><h2 id="OwnerContext-{{ section.id }}">{{ \'products.product.machine_context.heading\' | t }}</h2><ul class="rhino-machine-contents-list" role="list">{{ rhino_owner_context_items }}</ul></section>','{%- endif -%}');
  }
  context.push('{%- endif -%}');
  const id=page.productGid.split('/').pop(),factBody=facts.splice(factStart).join('\n'),contextBody=context.splice(contextStart).join('\n');
  const factSnippet='rhino-owner-approved-facts-'+id;shards['snippets/'+factSnippet+'.liquid']=header+factBody+'\n{%- endif -%}\n';
  facts.push(`{%- if rhino_owner_gid == ${q(page.productGid)} -%}{%- render ${q(factSnippet)}, product: product, section: section -%}{%- endif -%}`);
  if(page.cards.length){const contextSnippet='rhino-owner-approved-context-'+id;shards['snippets/'+contextSnippet+'.liquid']=header+contextBody+'\n{%- endif -%}\n';context.push(`{%- if rhino_owner_gid == ${q(page.productGid)} -%}{%- render ${q(contextSnippet)}, product: product, section: section -%}{%- endif -%}`);}
 }
 facts.push('{%- endif -%}');context.push('{%- endif -%}');return {release,projection:p,shards,facts:facts.join('\n')+'\n',context:context.join('\n')+'\n'};
}
function verifyRelease(asOf){const state=require('./epic-e-final-owner-delta').loadCurrent(asOf);assert(state,'No reconciled owner release');const out=compile(state);assert.deepEqual(E.read(RELEASE),out.release);assert.equal(require('fs').readFileSync(FACT,'utf8'),out.facts);assert.equal(require('fs').readFileSync(CONTEXT,'utf8'),out.context);for(const [path,body]of Object.entries(out.shards))assert.equal(require('fs').readFileSync(path,'utf8'),body);return out;}
module.exports={RELEASE,FACT,CONTEXT,eligibleRows,project,liveChecks,compile,verifyRelease};
