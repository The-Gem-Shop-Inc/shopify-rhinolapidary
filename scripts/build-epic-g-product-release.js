'use strict';
const fs=require('node:fs'),R=require('./lib/epic-g-product-release');
const i=process.argv.indexOf('--read');if(i<0)throw new Error('Supply --read <current G1 read>');
const out=R.build(process.argv[i+1]);
fs.writeFileSync(R.RELEASE,JSON.stringify(out.release,null,2)+'\n');fs.writeFileSync(R.LIQUID,out.liquid);
console.log(JSON.stringify({sources:out.release.pages.length,customerEdges:out.release.pages.flatMap(p=>p.targets.filter(t=>t.customerEligible)).length,expiresAt:out.release.expiresAt,ShopifyMutations:0}));

