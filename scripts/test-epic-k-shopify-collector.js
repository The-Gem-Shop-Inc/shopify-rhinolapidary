'use strict';

const assert = require('node:assert/strict');
const {
    QUERIES,
    STORE_DOMAIN,
    assertReadOnlyQuery,
    collectConnection,
    collectShopifyConfiguration,
    normalizeShopifyConfiguration,
    queryAdmin,
    resolveRawRetentionDestination,
    stableRef,
} = require('./lib/epic-k-shopify-audit');
const { assessConfigurationDrift, schemaErrors } = require('./lib/epic-k-evidence-drift');
const { clone, readJson } = require('./lib/epic-k-policy');

const fixture = readJson('tests/fixtures/epic-k-shopify-collector-responses.json');
const tests = [];
function test(name, run) { tests.push({ name, run }); }
function base() { return clone(fixture.baseCollection); }
function snapshot(mutate = () => {}) { const input = base(); mutate(input); return normalizeShopifyConfiguration(input); }
function result(report, id) { return report.results.find((entry) => entry.id === id); }
function emptyRunQuery(identityDomain = STORE_DOMAIN, callLog = []) {
    return async (query) => {
        callLog.push(query);
        if (query === QUERIES.access) return { shop: identityDomain === null ? {} : { myshopifyDomain: identityDomain }, appInstallation: { accessScopes: [] } };
        const fields = [
            [QUERIES.discounts, 'discountNodes'], [QUERIES.markets, 'markets'], [QUERIES.locations, 'locations'],
            [QUERIES.variants, 'productVariants'], [QUERIES.functions, 'shopifyFunctions'], [QUERIES.profileIndex, 'deliveryProfiles'],
        ];
        const match = fields.find(([operation]) => operation === query);
        if (match) return { [match[1]]: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } };
        throw new Error('unexpected query');
    };
}

test('query guard accepts named read-only queries', () => assert.doesNotThrow(() => assertReadOnlyQuery(QUERIES.variants)));
test('query guard rejects a mutation operation', () => assert.throws(() => assertReadOnlyQuery('mutation Unsafe { productDelete(input: {}) { deletedProductId } }'), /mutations are prohibited/i));
test('query guard rejects an omitted operation type', () => assert.throws(() => assertReadOnlyQuery('{ shop { name } }'), /query operations only/i));
test('incorrect destination fails before any network request', async () => {
    let networkCalls = 0;
    await assert.rejects(() => queryAdmin({
        shopDomain: 'other-shop.myshopify.com', token: 'synthetic-token', apiVersion: '2026-10', query: QUERIES.access,
        fetchImpl: async () => { networkCalls += 1; },
    }), /authorized only/i);
    assert.equal(networkCalls, 0);
});
test('malformed destination fails before any network request', async () => {
    let networkCalls = 0;
    await assert.rejects(() => queryAdmin({
        shopDomain: 'https://rhino-lapidary.myshopify.com', token: 'synthetic-token', apiVersion: '2026-10', query: QUERIES.access,
        fetchImpl: async () => { networkCalls += 1; },
    }), /authorized only/i);
    assert.equal(networkCalls, 0);
});
test('mismatched Admin identity stops collection after the identity query', async () => {
    const calls = [];
    await assert.rejects(() => collectShopifyConfiguration({
        shopDomain: STORE_DOMAIN, token: 'synthetic-token', collectedAt: '2026-10-24T12:30:00.000Z', assessmentTime: '2026-10-24T13:00:00.000Z',
        runQuery: emptyRunQuery('other-shop.myshopify.com', calls),
    }), /does not match/i);
    assert.equal(calls.length, 1);
});
test('missing Admin identity fails closed before dataset queries', async () => {
    const calls = [];
    await assert.rejects(() => collectShopifyConfiguration({
        shopDomain: STORE_DOMAIN, token: 'synthetic-token', collectedAt: '2026-10-24T12:30:00.000Z', assessmentTime: '2026-10-24T13:00:00.000Z',
        runQuery: emptyRunQuery(null, calls),
    }), /omitted a valid myshopifyDomain/i);
    assert.equal(calls.length, 1);
});
test('verified Rhino identity permits read-only dataset collection', async () => {
    const calls = [];
    const actual = await collectShopifyConfiguration({
        shopDomain: STORE_DOMAIN, token: 'synthetic-token', collectedAt: '2026-10-24T12:30:00.000Z', assessmentTime: '2026-10-24T13:00:00.000Z',
        runQuery: emptyRunQuery(STORE_DOMAIN, calls),
    });
    assert.equal(actual.source.identity.observedDomain, STORE_DOMAIN);
    assert.equal(actual.source.identity.verificationStatus, 'verified');
    assert(calls.length > 1);
});
test('failed identity verification cannot produce a Rhino snapshot', () => {
    const input = base();
    input.synthetic = false;
    input.source.shopDomain = STORE_DOMAIN;
    input.source.identity = { expectedDomain: STORE_DOMAIN, observedDomain: 'other-shop.myshopify.com', verificationStatus: 'verified', verificationBasis: 'admin_graphql_shop_identity' };
    assert.throws(() => normalizeShopifyConfiguration(input), /verified Rhino Admin identity/i);
});
test('stable references are deterministic and contain no Shopify GID', () => {
    assert.equal(stableRef('VARIANT', 'gid://shopify/ProductVariant/SYNTHETIC-1'), stableRef('VARIANT', 'gid://shopify/ProductVariant/SYNTHETIC-1'));
    assert(!stableRef('VARIANT', 'gid://shopify/ProductVariant/SYNTHETIC-1').includes('gid://'));
});
test('pagination exhausts every top-level page', async () => {
    let calls = 0;
    const output = await collectConnection(async (_query, variables) => {
        calls += 1;
        return { discountNodes: { nodes: [{ id: `SYNTHETIC-${calls}` }], pageInfo: { hasNextPage: calls === 1, endCursor: calls === 1 ? 'NEXT' : null } } };
    }, 'discounts', 'discountNodes');
    assert.equal(calls, 2);
    assert.equal(output.nodes.length, 2);
});
test('multiple profiles and Variant assignments normalize independently', () => {
    const actual = snapshot();
    assert.equal(actual.profiles.length, 2);
    assert.equal(actual.products.length, 2);
    assert.equal(actual.profiles.reduce((sum, profile) => sum + profile.assignedProductRefs.length, 0), 2);
});
test('fixed paid rates retain their documented amount', () => {
    const actual = snapshot();
    assert.equal(actual.rates[0].amountCents, 1200);
    assert.equal(actual.rates[0].effectivePriceStatus, 'verified_paid');
});
test('conditional zero rates become threshold free shipping', () => {
    const actual = snapshot((input) => {
        const method = input.datasets.profiles[0].groups[0].locationGroupZones.nodes[0].methodDefinitions.nodes[0];
        method.rateProvider.price.amount = '0.00';
        method.methodConditions = [{ field: 'TOTAL_PRICE', operator: 'GREATER_THAN_OR_EQUAL_TO', conditionCriteria: { amount: '70.00', currencyCode: 'USD' } }];
    });
    assert.equal(actual.rates[0].type, 'threshold_free');
    assert.equal(actual.rates[0].thresholdCents, 7000);
});
test('carrier-calculated final prices remain unverified', () => {
    const actual = snapshot((input) => {
        input.datasets.profiles[0].groups[0].locationGroupZones.nodes[0].methodDefinitions.nodes[0].rateProvider = {
            __typename: 'DeliveryParticipant', id: 'gid://shopify/DeliveryParticipant/SYNTHETIC', fixedFee: { amount: '0.00', currencyCode: 'USD' },
            carrierService: { id: 'gid://shopify/DeliveryCarrierService/SYNTHETIC', name: 'Synthetic Carrier', active: true }, participantServices: [], percentageOfRateFee: 0,
        };
    });
    assert.equal(actual.rates[0].type, 'carrier_calculated');
    assert.equal(actual.rates[0].effectivePriceStatus, 'unverified');
    assert.equal(actual.rates[0].amountCents, null);
});
test('active explicit free-shipping discounts normalize as zero shipping', () => {
    const actual = snapshot((input) => input.datasets.discounts.push({ id: 'gid://shopify/DiscountNode/SYNTHETIC-FREE', discount: { __typename: 'DiscountAutomaticFreeShipping', status: 'ACTIVE', discountClasses: ['SHIPPING'] } }));
    assert.equal(actual.discounts[0].shippingEffect, 'zero_shipping');
    assert.equal(actual.discounts[0].effectiveShippingPriceStatus, 'verified_zero');
});
test('active shipping Function effects remain unverified', () => {
    const actual = snapshot((input) => input.datasets.discounts.push({ id: 'gid://shopify/DiscountNode/SYNTHETIC-APP', discount: { __typename: 'DiscountAutomaticApp', status: 'ACTIVE', discountClasses: ['SHIPPING'], appDiscountType: { discountClasses: ['SHIPPING'] } } }));
    assert.equal(actual.discounts[0].shippingEffect, 'unverified');
});
test('international Market activation does not independently confirm checkout', () => {
    const actual = snapshot((input) => input.datasets.markets.push({ id: 'gid://shopify/Market/SYNTHETIC-CA', status: 'ACTIVE', conditions: { regionsCondition: { regions: { nodes: [{ __typename: 'MarketRegionCountry', code: 'CA' }] } } } }));
    assert.equal(actual.markets.find((market) => market.countryCodes.includes('CA')).checkoutAvailabilityEvidence, 'unverified');
});
test('inactive international Market remains absent rather than confirmed checkout', () => {
    const actual = snapshot((input) => input.datasets.markets.push({ id: 'gid://shopify/Market/SYNTHETIC-CA', status: 'DRAFT', checkoutAvailabilityEvidence: 'absent', conditions: { regionsCondition: { regions: { nodes: [{ __typename: 'MarketRegionCountry', code: 'CA' }] } } } }));
    const market = actual.markets.find((entry) => entry.countryCodes.includes('CA'));
    assert.equal(market.active, false);
    assert.equal(market.checkoutAvailabilityEvidence, 'absent');
});
test('separately confirmed international checkout evidence is preserved', () => {
    const actual = snapshot((input) => input.datasets.markets.push({ id: 'gid://shopify/Market/SYNTHETIC-CA', status: 'ACTIVE', checkoutAvailabilityEvidence: 'confirmed', conditions: { regionsCondition: { regions: { nodes: [{ __typename: 'MarketRegionCountry', code: 'CA' }] } } } }));
    assert.equal(actual.markets.find((market) => market.countryCodes.includes('CA')).checkoutAvailabilityEvidence, 'confirmed');
});
test('Alaska and Hawaii rates never acquire operational approval from Shopify', () => {
    const actual = snapshot();
    assert(actual.rates[0].subdivisionCodes.includes('AK'));
    assert(actual.rates[0].subdivisionCodes.includes('HI'));
    assert.equal(actual.rates[0].operationalApproval, 'missing');
});
test('pickup settings do not establish Product eligibility', () => {
    const actual = snapshot();
    assert.equal(actual.pickup[0].pickupEnabled, true);
    assert.equal(actual.pickup[0].eligibilityAssignmentStatus, 'missing');
    assert(actual.products.every((product) => product.pickupEligibility === 'unknown'));
});
test('positive inventory does not establish operations readiness', () => assert.equal(snapshot().pickup[0].inventoryReadinessStatus, 'missing'));
test('Shopify inventory availability is retained without becoming operations approval', () => {
    const actual = snapshot();
    assert(actual.products.every((product) => product.shopifyInventoryStatus === 'positive'));
    assert.equal(actual.pickup[0].inventoryReadinessStatus, 'missing');
});
test('zero shipping weight is preserved for deterministic failure', () => {
    const actual = snapshot((input) => { input.datasets.variants[0].inventoryItem.measurement.weight.value = 0; });
    assert.equal(actual.products[0].shippingWeight.value, 0);
    assert.equal(actual.products[0].shippingWeight.evidenceStatus, 'missing');
});
test('missing shipping weight remains explicitly null', () => {
    const actual = snapshot((input) => { input.datasets.variants[0].inventoryItem.measurement.weight = null; });
    assert.equal(actual.products[0].shippingWeight, null);
});
test('positive Shopify weight remains available rather than accepted', () => assert(snapshot().products.every((product) => product.shippingWeight.evidenceStatus === 'available')));
test('package characteristics remain missing when Shopify has no mapped source', () => assert(snapshot().products.every((product) => product.packageCharacteristicsStatus === 'missing' && product.packages.length === 0)));
test('partial Product collection remains partial after normalization', () => {
    const actual = snapshot((input) => { input.completeness.variants = 'partial'; });
    assert.equal(actual.source.datasetCompleteness.products, 'partial');
});
test('explicit collection failures are retained without raw identifiers', () => {
    const actual = snapshot((input) => input.failures.push({ dataset: 'discounts', state: 'inaccessible', code: 'ACCESS_DENIED', message: 'read_discounts unavailable' }));
    assert.deepEqual(actual.source.collectionFailures[0], { dataset: 'discounts', state: 'inaccessible', message: 'read_discounts unavailable' });
});
test('missing API permission produces an actionable collector failure', async () => {
    const runQuery = async (query) => {
        if (query === QUERIES.access) return { shop: { myshopifyDomain: STORE_DOMAIN }, appInstallation: { accessScopes: [] } };
        if (query === QUERIES.discounts) throw Object.assign(new Error('Access denied for discountNodes'), { code: 'ACCESS_DENIED' });
        const fields = [
            [QUERIES.markets, 'markets'], [QUERIES.locations, 'locations'], [QUERIES.variants, 'productVariants'], [QUERIES.functions, 'shopifyFunctions'], [QUERIES.profileIndex, 'deliveryProfiles'],
        ];
        const match = fields.find(([operation]) => operation === query);
        if (match) return { [match[1]]: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } };
        throw new Error('unexpected query');
    };
    const actual = await collectShopifyConfiguration({ token: 'synthetic-token', collectedAt: '2026-10-24T12:30:00.000Z', assessmentTime: '2026-10-24T13:00:00.000Z', runQuery });
    assert.equal(actual.completeness.discounts, 'missing');
    assert.equal(actual.failures.find((failure) => failure.dataset === 'discounts').state, 'inaccessible');
});
test('normalized snapshots conform to the repository schema', () => assert.deepEqual(schemaErrors('schemas/epic-k-shopify-config-snapshot.schema.json', snapshot(), 'collector snapshot'), []));
test('normalized snapshots contain no raw Shopify GIDs', () => assert(!/gid:\/\/shopify\//i.test(JSON.stringify(snapshot()))));
test('normalization keeps source verification separate from mapping and operational approval', () => {
    const actual = snapshot();
    assert.equal(actual.source.sourceVerificationStatus, 'synthetic');
    assert.equal(actual.source.mappingAcceptanceStatus, 'synthetic');
    assert.equal(actual.source.operationalAuthorityStatus, 'synthetic');
});
test('explicit invalid assessment time fails before normalization', () => assert.throws(
    () => snapshot((input) => { input.source.assessmentTime = 'not-a-clock'; }),
    /strict ISO-8601 assessmentTime/i,
));
test('assessment must occur strictly after collection', () => assert.throws(
    () => snapshot((input) => { input.source.assessmentTime = input.source.collectedAt; }),
    /strictly after collectedAt/i,
));
test('raw evidence is transient by default', () => assert.deepEqual(resolveRawRetentionDestination({}), { enabled: false, directory: null }));
test('raw evidence retention rejects an unapproved external destination', () => assert.throws(() => resolveRawRetentionDestination({
    destination: 'C:\\approved-restricted-storage\\epic-k', approved: false, repositoryRoot: process.cwd(),
}), /requires explicit approved-storage configuration/i));
test('raw evidence retention rejects an unsafe repository destination', () => assert.throws(() => resolveRawRetentionDestination({
    destination: process.cwd(), approved: true, repositoryRoot: process.cwd(),
}), /outside the repository/i));
test('approved external raw evidence destination is accepted without writing an artifact', () => {
    const external = 'C:\\approved-restricted-storage\\epic-k';
    const actual = resolveRawRetentionDestination({
        destination: external,
        approved: true,
        repositoryRoot: process.cwd(),
        existsSync: () => true,
        realpathSync: (value) => value,
        statSync: () => ({ isDirectory: () => true }),
    });
    assert.equal(actual.enabled, true);
    assert.equal(actual.directory, external);
});
test('expired snapshot evidence fails freshness assessment', () => {
    const actual = snapshot();
    actual.source.validity = { kind: 'interval', expiresAt: '2026-10-24T12:45:00.000Z' };
    const assessed = assessConfigurationDrift(actual, undefined, { asOf: '2026-10-24T13:00:00.000Z' });
    assert.equal(result(assessed.report, 'evidence_freshness').state, 'FAIL');
});
test('unknown Product classification blocks machine-shipping assessment', () => {
    const actual = assessConfigurationDrift(snapshot(), undefined, { asOf: '2026-10-24T13:00:00.000Z' });
    assert.equal(result(actual.report, 'machine_shipping').state, 'BLOCKED');
});
test('offline drift assessment never claims live checkout enforcement', () => {
    const actual = assessConfigurationDrift(snapshot(), undefined, { asOf: '2026-10-24T13:00:00.000Z' });
    assert.equal(actual.report.liveCheckoutEnforcement, 'UNVERIFIED');
    assert.equal(actual.report.operationalReadiness, 'BLOCKED');
});

(async () => {
    let passed = 0;
    for (const entry of tests) {
        try { await entry.run(); passed += 1; }
        catch (error) { console.error(`FAIL: ${entry.name}`); throw error; }
    }
    console.log(`Epic K Shopify collector tests passed: ${passed}/${tests.length}.`);
})().catch((error) => { console.error(error); process.exitCode = 1; });
