'use strict';
const fs = require('node:fs');
const { build, bytes } = require('./lib/epic-f-consumer');
const { artifact, liquid } = build();
fs.writeFileSync('data/epic-f-consumer-release.json', bytes(artifact));
fs.writeFileSync('snippets/rhino-product-consumer-route.liquid', liquid);
console.log(`Generated F1 routing for ${artifact.routes.length} exact Products; zero fact grants.`);
