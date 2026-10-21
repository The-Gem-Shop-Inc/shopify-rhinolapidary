'use strict';
require('node:fs').writeFileSync('snippets/rhino-product-support-resources-projection.liquid', require('./lib/epic-f-consumer').buildSupportResourcesProjection());
console.log('Generated zero-grant F6 projection. No Shopify data changed.');
