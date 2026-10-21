'use strict';
const fs=require('node:fs');
const {buildFactProjection}=require('./lib/epic-f-consumer');
fs.writeFileSync('snippets/rhino-product-fact-projection.liquid',buildFactProjection());
console.log('Generated zero-grant fact projection from the existing F consumer; no activation.');
