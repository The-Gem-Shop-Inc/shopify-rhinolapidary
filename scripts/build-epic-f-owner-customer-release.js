'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),E=require('./lib/epic-e-owner-response-adapter'),F=require('./lib/epic-f-customer-release');
const state=E.loadReconciled();assert(state,'Reconciled Shopify values required');const output=F.compile(state);
fs.writeFileSync(F.RELEASE,JSON.stringify(output.release,null,2)+'\n');fs.writeFileSync(F.FACT,output.facts);fs.writeFileSync(F.CONTEXT,output.context);
for(const [path,body]of Object.entries(output.shards))fs.writeFileSync(path,body);
const baseline=E.read(E.DIR+'/repository-before.json');
for(const [file,snippet]of [['snippets/rhino-product-fact-projection.liquid','rhino-owner-approved-facts'],['snippets/rhino-product-context-delivery-projection.liquid','rhino-owner-approved-context']]) {
 const prior=baseline.files.find(r=>r.path===file);assert(prior);fs.writeFileSync(file,prior.body+'\n{%- comment -%}Bounded current-owner release; exact E reconciliation remains separate from historical fixture architecture.{%- endcomment -%}\n{%- render \''+snippet+'\', product: product, section: section -%}\n');
}
F.verifyRelease();console.log(JSON.stringify({grants:output.release.grants.length,suppressedApproved:output.release.suppressedApprovedRows,pageSummary:output.release.pageSummary,runtimeFiles:5,mediaChanged:false}));
