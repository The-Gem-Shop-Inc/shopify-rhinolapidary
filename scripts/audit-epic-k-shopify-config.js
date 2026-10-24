'use strict';

require('dotenv').config({ quiet: true });
const path = require('node:path');
const {
    API_VERSION,
    STORE_DOMAIN,
    collectShopifyConfiguration,
    normalizeShopifyConfiguration,
    writeRestrictedJson,
} = require('./lib/epic-k-shopify-audit');

async function main() {
    const assessmentTimeArg = process.argv.find((value) => value.startsWith('--assessment-time='));
    const assessmentTime = assessmentTimeArg?.slice('--assessment-time='.length);
    if (!assessmentTime) throw new Error('Usage: npm run audit:epic-k-shopify -- --assessment-time=<ISO-8601>');
    const collection = await collectShopifyConfiguration({
        shopDomain: process.env.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_ADMIN_SHOP || STORE_DOMAIN,
        token: process.env.SHOPIFY_ADMIN_ACCESS_TOKEN,
        apiVersion: process.env.EPIC_K_SHOPIFY_API_VERSION || API_VERSION,
        assessmentTime,
    });
    const rawPath = writeRestrictedJson(path.join('test-results', 'epic-k', 'k1b02', 'restricted-admin-collection.json'), collection);
    const snapshot = normalizeShopifyConfiguration(collection);
    const sanitizedPath = writeRestrictedJson(path.join('test-results', 'epic-k', 'k1b02', 'sanitized-shopify-snapshot.json'), snapshot);
    console.log(`Restricted raw collection: ${rawPath}`);
    console.log(`Sanitized normalized snapshot candidate: ${sanitizedPath}`);
    console.log('No Shopify mutation was executed. Review the sanitized candidate before attaching it to repository evidence.');
}

main().catch((error) => {
    console.error(`Epic K read-only Shopify audit failed: ${error.code || 'ERROR'}: ${error.message}`);
    process.exitCode = error.code === 'MISSING_CREDENTIAL' ? 2 : 1;
});
