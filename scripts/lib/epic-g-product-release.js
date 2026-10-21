'use strict';
// Materialized G1 projection following F's exact-ID/runtime-value/expiry pattern.
const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('./epic-e-owner-response-adapter'),G=require('./epic-g-foundation');
const {validateRead}=require('../validate-epic-g-foundation');
const RELEASE='data/epic-g-product-release.json',LIQUID='snippets/rhino-g-product-fit.liquid',LEASE_MS=60*60*1000;
const q=value=>{assert(!/['{}<>\r\n]/.test(value));return "'"+value+"'";};
const number=id=>{assert(/^gid:\/\/shopify\/Product(?:Variant)?\/[0-9]+$/.test(id));return id.split('/').pop();};
const ids=values=>values.map(number).sort().join(',');
function project(report,envelope,{validatedAt=report.asOf}={}){
 // Recompiling a captured read cannot renew this presentation lease.
 const until=new Date(Math.min(Date.parse(report.source.expiresAt),Date.parse(report.source.snapshotExpiresAt),Date.parse(report.source.snapshotCapturedAt)+LEASE_MS)).toISOString();
 const native=envelope.snapshot.datasets.products.records;
 const pages=report.products.filter(p=>p.gRoleEligible&&p.compatibility.dataEligible).map(p=>({
  productGid:p.productGid,handle:native.find(n=>n.id===p.productGid).handle,productClass:p.approvedClass,
  variantGids:p.variants.map(v=>v.variantGid).sort(),referenceGids:[...p.compatibility.approvedReferenceList].sort(),
  provenance:p.compatibility.provenance,sourceApproved:p.compatibility.sourceApproved,dataEligible:p.compatibility.dataEligible,
  targets:p.compatibility.targets.map(t=>({productGid:t.productGid,handle:t.handle,title:t.title,sourceApproved:t.approved,published:t.published,customerEligible:t.eligible,
   variantGids:report.products.find(p=>p.productGid===t.productGid).variants.map(v=>v.variantGid).sort()}))
 })).sort((a,b)=>a.productGid.localeCompare(b.productGid));
 return {schemaVersion:1,fixtureOnly:report.mode==='OFFLINE_FIXTURE',validatedAt,expiresAt:until,receiptExpiresAt:report.source.expiresAt,
  observationCapturedAt:report.source.snapshotCapturedAt,sourceBindingSha256:report.source.bindingSha256,
  approvalProvenanceSha256:E.digest(report.source.provenance),pages};
}
function compile(release){
 const proof=E.digest(release),start=Math.ceil(Date.parse(release.validatedAt)/1000),end=Math.floor(Date.parse(release.expiresAt)/1000);
 const lines=['{% doc %}\n  Materialized G1-approved forward fit. Public content only; no private tokens.\n  @param {product} product - Current Product.\n  @param {section} section - Native Product section.\n  @param {string} heading - Merchant-configured module heading.\n{% enddoc %}',
 '{%- comment -%}Called from product.json custom_liquid; Theme Check cannot trace that render. Projection SHA256: '+proof+'. Private revocation requires revalidation/deployment; immediate cache invalidation is not claimed.{%- endcomment -%}',
 "{%- assign g_now = 'now' | date: '%s' | plus: 0 -%}",
 "{%- assign g_source_published = product.published_at | date: '%s' | plus: 0 -%}",
 '{%- if heading != blank and g_now >= '+start+' and g_now < '+end+" and product.published_at != blank and g_source_published <= g_now and product.metafields.rhino.product_class.type == 'single_line_text_field' and product.metafields.rhino.compatible_machines.type == 'list.product_reference' -%}",
 '{%- assign g_expected_handle = nil -%}',
 '{%- case product.id -%}'];
 for(const page of release.pages.filter(p=>p.targets.some(t=>t.customerEligible))){
  const contracts='|'+page.targets.map(t=>number(t.productGid)+':'+t.handle+':'+ids(t.variantGids)).sort().join('|')+'|';
  const customerIds='|'+page.targets.filter(t=>t.customerEligible).map(t=>number(t.productGid)).sort().join('|')+'|';
  lines.push('{%- when '+number(page.productGid)+' -%}',
   '{%- assign g_expected_handle = '+q(page.handle)+' -%}',
   '{%- assign g_expected_class = '+q(page.productClass)+' -%}',
   '{%- assign g_expected_variants = '+q(ids(page.variantGids))+' -%}',
   '{%- assign g_expected_references = '+q(ids(page.referenceGids))+' -%}',
   '{%- assign g_expected_count = '+page.referenceGids.length+' -%}',
   '{%- assign g_target_contracts = '+q(contracts)+' -%}',
   '{%- assign g_customer_ids = '+q(customerIds)+' -%}');
 }
 lines.push('{%- endcase -%}',
 "{%- assign g_machines = product.metafields.rhino.compatible_machines.value | sort: 'id' -%}",
 "{%- assign g_references = g_machines | map: 'id' | join: ',' -%}",
 "{%- assign g_variants = product.variants | map: 'id' | sort | join: ',' -%}",
 '{%- if g_expected_handle != nil and product.handle == g_expected_handle and product.metafields.rhino.product_class.value == g_expected_class and product.metafields.rhino.compatible_machines.value.size == g_expected_count and g_references == g_expected_references and g_variants == g_expected_variants -%}',
 '{%- assign g_targets_valid = true -%}',
 '{%- for g_machine in g_machines -%}',
 "{%- assign g_machine_variants = g_machine.variants | map: 'id' | sort | join: ',' -%}",
 '{%- capture g_contract -%}|{{ g_machine.id }}:{{ g_machine.handle }}:{{ g_machine_variants }}|{%- endcapture -%}',
 "{%- unless g_target_contracts contains g_contract and g_machine.metafields.rhino.product_class.type == 'single_line_text_field' and g_machine.metafields.rhino.product_class.value == 'machine' -%}{%- assign g_targets_valid = false -%}{%- endunless -%}",
 '{%- endfor -%}',
 '{%- if g_targets_valid -%}{%- capture g_links -%}',
 '{%- for g_machine in g_machines -%}',
 '{%- capture g_machine_key -%}|{{ g_machine.id }}|{%- endcapture -%}',
 "{%- assign g_machine_published = g_machine.published_at | date: '%s' | plus: 0 -%}",
 '{%- if g_customer_ids contains g_machine_key and g_machine.published_at != blank and g_machine_published <= g_now -%}',
 '<li><a class="link" href="{{ g_machine.url | escape }}" data-rhino-g-machine="{{ g_machine.id }}">{{ g_machine.title | escape }}</a></li>',
 '{%- endif -%}{%- endfor -%}{%- endcapture -%}',
 "{%- assign g_links = g_links | strip -%}","{%- if g_links != blank -%}",
 '<rhino-g-fit hidden data-product-id="{{ product.id }}" data-valid-from="'+release.validatedAt+'" data-expires-at="'+release.expiresAt+'" data-projection="'+proof+'" role="region" aria-labelledby="GFit-{{ section.id }}">',
 '<h2 id="GFit-{{ section.id }}">{{ heading | escape }}</h2><ul role="list">{{ g_links }}</ul></rhino-g-fit>',
 '{%- endif -%}{%- endif -%}{%- endif -%}{%- endif -%}',
 '');return lines.join('\n')+'\n';
}
function build(readPath,{asOf=new Date().toISOString()}={}){
 const envelope=E.read(readPath);assert.deepEqual(validateRead(envelope),[]);
 const report=G.assess(G.loadAuthority(),envelope,{asOf});
 assert(report.reconciliation.complete&&report.reconciliation.liveAdmin&&!report.source.fixtureOnly,'Current E/F/G1 live eligibility required');
 const release={...project(report,envelope,{validatedAt:asOf}),input:{path:readPath,sha256:E.hash(fs.readFileSync(readPath))}};
 assert(Date.parse(asOf)<Date.parse(release.expiresAt),'G2 presentation lease requires a fresh actual Admin read');
 return {release,liquid:compile(release),report};
}
function verify(){
 const release=E.read(RELEASE);assert.equal(release.fixtureOnly,false);assert(Date.now()>=Date.parse(release.validatedAt)&&Date.now()<Date.parse(release.expiresAt),'G2 presentation lease expired');
 assert.equal(E.hash(fs.readFileSync(release.input.path)),release.input.sha256);
 const expected=build(release.input.path,{asOf:release.validatedAt});assert.deepEqual(release,expected.release);assert.equal(fs.readFileSync(LIQUID,'utf8'),expected.liquid);
 const current=G.assess(G.loadAuthority(),E.read(release.input.path));assert(current.reconciliation.complete&&current.source.current);
 return {release,report:current};
}
module.exports={RELEASE,LIQUID,LEASE_MS,project,compile,build,verify};
