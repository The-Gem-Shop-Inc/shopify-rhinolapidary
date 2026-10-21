'use strict';
require('node:fs').writeFileSync('snippets/rhino-product-context-delivery-projection.liquid',require('./lib/epic-f-consumer').buildContextDeliveryProjection());
console.log('Generated zero-grant F5 projection. No Shopify data changed.');
