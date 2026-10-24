'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { parseTimestamp } = require('./epic-k-policy');

const API_VERSION = '2026-10';
const STORE_DOMAIN = 'rhino-lapidary.myshopify.com';

function assertAuthorizedShopDomain(shopDomain) {
    if (typeof shopDomain !== 'string' || shopDomain !== STORE_DOMAIN) {
        const error = new Error(`Epic K collection is authorized only for ${STORE_DOMAIN}.`);
        error.code = 'UNAUTHORIZED_STORE';
        throw error;
    }
    return shopDomain;
}

function assertAssessmentChronology(collectedAt, assessmentTime) {
    const collected = parseTimestamp(collectedAt);
    const assessed = parseTimestamp(assessmentTime);
    if (collected === null) throw new Error('A valid strict ISO-8601 collectedAt timestamp is required.');
    if (assessed === null) throw new Error('A valid explicit strict ISO-8601 assessmentTime is required.');
    if (assessed <= collected) throw new Error('assessmentTime must be strictly after collectedAt.');
}

function verifyShopIdentity(access, expectedDomain = STORE_DOMAIN) {
    assertAuthorizedShopDomain(expectedDomain);
    const observedDomain = access?.shop?.myshopifyDomain;
    if (typeof observedDomain !== 'string' || !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(observedDomain)) {
        const error = new Error('Admin identity response omitted a valid myshopifyDomain.');
        error.code = 'STORE_IDENTITY_MISSING';
        throw error;
    }
    if (observedDomain !== expectedDomain) {
        const error = new Error('Admin identity does not match the authorized Rhino Shopify store.');
        error.code = 'STORE_IDENTITY_MISMATCH';
        throw error;
    }
    return {
        expectedDomain,
        observedDomain,
        verificationStatus: 'verified',
        verificationBasis: 'admin_graphql_shop_identity',
    };
}

function assertReadOnlyQuery(query) {
    const source = String(query || '').replace(/^\s*#[^\n]*$/gm, '').trim();
    if (/\bmutation\b/i.test(source)) throw new Error('GraphQL mutations are prohibited in the Epic K audit.');
    if (!/^query\b/i.test(source)) throw new Error('Epic K audit permits GraphQL query operations only.');
}

function stableRef(prefix, rawId) {
    if (!rawId) return `${prefix}_MISSING`;
    let hash = 0xcbf29ce484222325n;
    for (const char of String(rawId)) {
        hash ^= BigInt(char.codePointAt(0));
        hash = BigInt.asUintN(64, hash * 0x100000001b3n);
    }
    return `${prefix}_${hash.toString(16).padStart(16, '0').toUpperCase()}`;
}

async function queryAdmin({ shopDomain, token, apiVersion, query, variables = {}, fetchImpl = fetch }) {
    assertAuthorizedShopDomain(shopDomain);
    assertReadOnlyQuery(query);
    const response = await fetchImpl(`https://${shopDomain}/admin/api/${apiVersion}/graphql.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': token },
        body: JSON.stringify({ query, variables }),
    });
    const payload = await response.json();
    if (!response.ok || payload.errors) {
        const detail = payload.errors?.map((error) => error.message).join('; ') || `HTTP ${response.status}`;
        const error = new Error(detail);
        error.code = response.status === 401 || response.status === 403 ? 'ACCESS_DENIED' : 'QUERY_FAILED';
        throw error;
    }
    return payload.data;
}

const QUERIES = Object.freeze({
    access: `query EpicKAuditAccess { shop { id myshopifyDomain currencyCode ianaTimezone } appInstallation { accessScopes { handle } } }`,
    profileIndex: `query EpicKAuditDeliveryProfileIndex($first: Int!, $after: String) { deliveryProfiles(first: $first, after: $after) { pageInfo { hasNextPage endCursor } nodes { id name default coversAllItems profileLocationGroups { locationGroup { id } } } } }`,
    profileItems: `query EpicKAuditProfileItems($profileId: ID!, $first: Int!, $after: String) { deliveryProfile(id: $profileId) { profileItems(first: $first, after: $after) { pageInfo { hasNextPage endCursor } nodes { product { id handle productType tags } variants(first: 50) { pageInfo { hasNextPage endCursor } nodes { id sku } } } } } }`,
    profileConfiguration: `query EpicKAuditProfileConfiguration($profileId: ID!, $groupId: ID!) { deliveryProfile(id: $profileId) { profileLocationGroups(locationGroupId: $groupId) { locationGroup { id locations(first: 50, includeInactive: true, includeLegacy: true) { pageInfo { hasNextPage endCursor } nodes { id name isActive } } } locationGroupZones(first: 50) { pageInfo { hasNextPage endCursor } nodes { zone { id name countries { code { countryCode restOfWorld } provinces { code } } } methodDefinitions(first: 50) { pageInfo { hasNextPage endCursor } nodes { id name active methodConditions { field operator conditionCriteria { ... on MoneyV2 { amount currencyCode } ... on Weight { value unit } } } rateProvider { __typename ... on DeliveryRateDefinition { id price { amount currencyCode } } ... on DeliveryParticipant { id fixedFee { amount currencyCode } percentageOfRateFee carrierService { id name active supportsServiceDiscovery } participantServices { name active } } } } } } } } } }`,
    discounts: `query EpicKAuditDiscounts($first: Int!, $after: String) { discountNodes(first: $first, after: $after) { pageInfo { hasNextPage endCursor } nodes { id discount { __typename ... on DiscountAutomaticFreeShipping { title status startsAt endsAt discountClasses } ... on DiscountCodeFreeShipping { title status startsAt endsAt discountClasses maximumShippingPrice { amount currencyCode } } ... on DiscountAutomaticApp { title status startsAt endsAt discountClasses appDiscountType { title functionId discountClasses } } ... on DiscountCodeApp { title status startsAt endsAt discountClasses appDiscountType { title functionId discountClasses } } ... on DiscountAutomaticBasic { title status startsAt endsAt discountClasses } ... on DiscountCodeBasic { title status startsAt endsAt discountClasses } ... on DiscountAutomaticBxgy { title status startsAt endsAt discountClasses } ... on DiscountCodeBxgy { title status startsAt endsAt discountClasses } } } } }`,
    markets: `query EpicKAuditMarkets($first: Int!, $after: String) { markets(first: $first, after: $after) { pageInfo { hasNextPage endCursor } nodes { id name status type conditions { regionsCondition { regions(first: 50) { pageInfo { hasNextPage endCursor } nodes { __typename id name ... on MarketRegionCountry { code } ... on MarketRegionSubdivision { code country { code } } } } } } delivery { shipping { isEnabled } } } } }`,
    locations: `query EpicKAuditLocations($first: Int!, $after: String) { locations(first: $first, after: $after, includeInactive: true, includeLegacy: true) { pageInfo { hasNextPage endCursor } nodes { id name isActive fulfillsOnlineOrders shipsInventory hasActiveInventory localPickupSettingsV2 { pickupTime } } } }`,
    variants: `query EpicKAuditProductVariants($first: Int!, $after: String) { productVariants(first: $first, after: $after) { pageInfo { hasNextPage endCursor } nodes { id sku inventoryQuantity sellableOnlineQuantity deliveryProfile { id } product { id handle productType tags status } inventoryItem { id requiresShipping tracked measurement { weight { value unit } } inventoryLevels(first: 10) { pageInfo { hasNextPage endCursor } nodes { location { id } quantities(names: ["available"]) { name quantity } } } } } } }`,
    functions: `query EpicKAuditFunctions($first: Int!, $after: String) { shopifyFunctions(first: $first, after: $after) { pageInfo { hasNextPage endCursor } nodes { id title apiType apiVersion appKey handle } } }`,
});

async function collectConnection(runQuery, operation, field, variables = {}, pageSize = 50) {
    const nodes = [];
    let after = null;
    let pages = 0;
    do {
        const data = await runQuery(QUERIES[operation], { ...variables, first: pageSize, after });
        const connection = data?.[field];
        if (!connection) throw new Error(`${operation}: response omitted ${field}`);
        nodes.push(...(connection.nodes || []));
        pages += 1;
        if (!connection.pageInfo?.hasNextPage) return { nodes, pages, complete: true };
        after = connection.pageInfo.endCursor;
        if (!after) throw new Error(`${operation}: pagination cursor missing`);
    } while (pages < 1000);
    throw new Error(`${operation}: pagination safety limit reached`);
}

async function collectShopifyConfiguration(options = {}) {
    const shopDomain = options.shopDomain || STORE_DOMAIN;
    assertAuthorizedShopDomain(shopDomain);
    const apiVersion = options.apiVersion || API_VERSION;
    const clock = options.clock || (() => new Date().toISOString());
    const collectedAt = options.collectedAt || clock();
    const assessmentTime = options.assessmentTime;
    const token = options.token;
    if (!token) throw Object.assign(new Error('SHOPIFY_ADMIN_ACCESS_TOKEN is required for live collection.'), { code: 'MISSING_CREDENTIAL' });
    assertAssessmentChronology(collectedAt, assessmentTime);
    const runQuery = options.runQuery || ((query, variables) => queryAdmin({ shopDomain, token, apiVersion, query, variables }));
    const failures = [];
    const datasets = { profiles: [], discounts: [], markets: [], locations: [], variants: [], functions: [] };
    const completeness = Object.fromEntries(Object.keys(datasets).map((key) => [key, 'missing']));
    const access = await runQuery(QUERIES.access, {});
    const identity = verifyShopIdentity(access, shopDomain);
    const collect = async (key, operation, field, pageSize = 50) => {
        try {
            const result = await collectConnection(runQuery, operation, field, {}, pageSize);
            datasets[key] = result.nodes;
            completeness[key] = result.complete ? 'complete' : 'partial';
        } catch (error) {
            failures.push({ dataset: key, state: error.code === 'ACCESS_DENIED' ? 'inaccessible' : 'missing', code: error.code || 'QUERY_FAILED', message: error.message });
        }
    };
    await collect('discounts', 'discounts', 'discountNodes');
    await collect('markets', 'markets', 'markets');
    await collect('locations', 'locations', 'locations');
    await collect('variants', 'variants', 'productVariants', 25);
    await collect('functions', 'functions', 'shopifyFunctions');
    if (datasets.markets.some((market) => market.conditions?.regionsCondition?.regions?.pageInfo?.hasNextPage)) {
        completeness.markets = 'partial';
        failures.push({ dataset: 'markets', state: 'partial', code: 'NESTED_PAGINATION', message: 'A Market regions connection has additional uncollected pages.' });
    }
    if (datasets.variants.some((variant) => variant.inventoryItem?.inventoryLevels?.pageInfo?.hasNextPage)) {
        completeness.variants = 'partial';
        failures.push({ dataset: 'variants', state: 'partial', code: 'NESTED_PAGINATION', message: 'A Variant inventory-level connection has additional uncollected pages.' });
    }
    try {
        const index = await collectConnection(runQuery, 'profileIndex', 'deliveryProfiles');
        for (const profile of index.nodes) {
            const itemNodes = [];
            let itemAfter = null;
            let itemPages = 0;
            do {
                const data = await runQuery(QUERIES.profileItems, { profileId: profile.id, first: 10, after: itemAfter });
                const connection = data?.deliveryProfile?.profileItems;
                if (!connection) throw new Error('profileItems response missing');
                itemNodes.push(...(connection.nodes || []));
                itemPages += 1;
                if (!connection.pageInfo?.hasNextPage) break;
                itemAfter = connection.pageInfo.endCursor;
                if (!itemAfter) throw new Error('profileItems pagination cursor missing');
            } while (itemPages < 1000);
            if (itemPages >= 1000) throw new Error('profileItems pagination safety limit reached');
            if (itemNodes.some((item) => item.variants?.pageInfo?.hasNextPage)) {
                failures.push({ dataset: 'profiles', state: 'partial', code: 'NESTED_PAGINATION', message: 'A profile Product has additional uncollected Variant assignment pages.' });
            }
            const groups = [];
            for (const entry of profile.profileLocationGroups || []) {
                const data = await runQuery(QUERIES.profileConfiguration, { profileId: profile.id, groupId: entry.locationGroup.id });
                const group = data?.deliveryProfile?.profileLocationGroups?.[0];
                groups.push(group);
                if (group?.locationGroup?.locations?.pageInfo?.hasNextPage
                    || group?.locationGroupZones?.pageInfo?.hasNextPage
                    || group?.locationGroupZones?.nodes?.some((zone) => zone.methodDefinitions?.pageInfo?.hasNextPage)) {
                    failures.push({ dataset: 'profiles', state: 'partial', code: 'NESTED_PAGINATION', message: 'A delivery-profile location, zone, or method connection has additional uncollected pages.' });
                }
            }
            datasets.profiles.push({ ...profile, items: itemNodes, groups });
        }
        completeness.profiles = failures.some((failure) => failure.dataset === 'profiles') ? 'partial' : 'complete';
    } catch (error) {
        failures.push({ dataset: 'profiles', state: 'missing', code: error.code || 'QUERY_FAILED', message: error.message });
    }
    return {
        schemaVersion: 1,
        contractId: 'epic-k-shopify-read-only-collection',
        synthetic: false,
        source: { shopDomain, apiVersion, collectedAt, assessmentTime, identity, access },
        completeness,
        failures,
        datasets,
    };
}

function getAt(object, dottedPath) {
    return dottedPath.split('.').reduce((value, key) => value?.[key], object);
}

function amountCents(money) {
    if (!money || money.amount === null || money.amount === undefined) return null;
    const value = Number(money.amount);
    return Number.isFinite(value) ? Math.round(value * 100) : null;
}

function normalizeWeight(weight) {
    if (!weight) return null;
    const units = { GRAMS: 'g', KILOGRAMS: 'kg', OUNCES: 'oz', POUNDS: 'lb', g: 'g', kg: 'kg', oz: 'oz', lb: 'lb' };
    return { value: Number(weight.value), unit: units[weight.unit], evidenceStatus: Number(weight.value) > 0 ? 'available' : 'missing' };
}

function assertVerifiedCollectionIdentity(collection) {
    const identity = collection?.source?.identity;
    if (collection?.synthetic) {
        const trustedSynthetic = identity?.verificationStatus === 'verified'
            && identity?.verificationBasis === 'trusted_test_fixture'
            && typeof identity.expectedDomain === 'string'
            && identity.expectedDomain === identity.observedDomain
            && identity.expectedDomain.endsWith('.invalid');
        if (!trustedSynthetic) throw new Error('Synthetic normalization requires an explicitly trusted matching test identity.');
        return;
    }
    assertAuthorizedShopDomain(collection?.source?.shopDomain);
    if (identity?.verificationStatus !== 'verified'
        || identity.verificationBasis !== 'admin_graphql_shop_identity'
        || identity.expectedDomain !== STORE_DOMAIN
        || identity.observedDomain !== STORE_DOMAIN) {
        throw new Error('A verified Rhino Admin identity is required before normalization.');
    }
}

function normalizeShopifyConfiguration(collection) {
    assertVerifiedCollectionIdentity(collection);
    assertAssessmentChronology(collection.source.collectedAt, collection.source.assessmentTime);
    const profiles = [];
    const zones = [];
    const rates = [];
    const zoneSeen = new Set();
    for (const profile of collection.datasets.profiles || []) {
        const profileId = stableRef('PROFILE', profile.id);
        const assignedProductRefs = [];
        for (const item of profile.items || []) for (const variant of item.variants?.nodes || []) assignedProductRefs.push(stableRef('VARIANT', variant.id));
        profiles.push({ id: profileId, name: profile.name, assignedProductRefs: [...new Set(assignedProductRefs)].sort(), machineShipmentMode: 'unverified' });
        for (const group of profile.groups || []) for (const entry of group?.locationGroupZones?.nodes || []) {
            const zoneId = stableRef('ZONE', entry.zone.id);
            const countries = (entry.zone.countries || []).filter((country) => !country.code?.restOfWorld);
            const countryCodes = [...new Set(countries.map((country) => country.code?.countryCode).filter(Boolean))].sort();
            const subdivisionCodes = [...new Set(countries
                .filter((country) => country.code?.countryCode === 'US')
                .flatMap((country) => (country.provinces || []).map((province) => province.code))
                .filter(Boolean))].sort();
            if (!zoneSeen.has(zoneId)) {
                zones.push({ id: zoneId, countryCodes, subdivisionCodes });
                zoneSeen.add(zoneId);
            }
            for (const method of entry.methodDefinitions?.nodes || []) {
                const fixed = method.rateProvider?.price;
                const carrier = method.rateProvider?.carrierService;
                const cents = amountCents(fixed);
                const threshold = (method.methodConditions || []).find((condition) => condition.field === 'TOTAL_PRICE' && condition.operator === 'GREATER_THAN_OR_EQUAL_TO');
                const isZero = cents === 0;
                rates.push({
                    id: stableRef('RATE', method.id),
                    profileId,
                    zoneIds: [zoneId],
                    type: carrier ? 'carrier_calculated' : (isZero && threshold ? 'threshold_free' : 'flat'),
                    active: Boolean(method.active),
                    amountCents: carrier ? null : cents,
                    effectivePriceStatus: carrier ? 'unverified' : (isZero ? 'verified_zero' : cents > 0 ? 'verified_paid' : 'unverified'),
                    ...(threshold ? { thresholdCents: amountCents(threshold.conditionCriteria) } : {}),
                    currencyCode: fixed?.currencyCode || method.rateProvider?.fixedFee?.currencyCode || null,
                    subdivisionCodes,
                    operationalApproval: 'missing',
                    serviceAvailability: 'unverified',
                });
            }
        }
    }
    const discounts = (collection.datasets.discounts || []).map((node) => {
        const discount = node.discount || {};
        const active = discount.status === 'ACTIVE';
        const classes = [...(discount.discountClasses || []), ...(discount.appDiscountType?.discountClasses || [])];
        let shippingEffect = 'none';
        if (/FreeShipping/.test(discount.__typename || '')) shippingEffect = 'zero_shipping';
        else if (active && classes.includes('SHIPPING')) shippingEffect = 'unverified';
        const effectiveShippingPriceStatus = shippingEffect === 'zero_shipping'
            ? 'verified_zero'
            : shippingEffect === 'none' ? 'not_applicable' : 'unverified';
        return { id: stableRef('DISCOUNT', node.id), active, shippingEffect, effectiveShippingPriceStatus };
    });
    const markets = (collection.datasets.markets || []).map((market) => ({
        id: stableRef('MARKET', market.id),
        countryCodes: [...new Set((market.conditions?.regionsCondition?.regions?.nodes || []).map((region) => region.__typename === 'MarketRegionCountry' ? region.code : region.country?.code).filter(Boolean))].sort(),
        active: market.status === 'ACTIVE',
        checkoutAvailabilityEvidence: ['confirmed', 'absent'].includes(market.checkoutAvailabilityEvidence)
            ? market.checkoutAvailabilityEvidence
            : 'unverified',
    })).filter((market) => market.countryCodes.length);
    const pickup = (collection.datasets.locations || []).map((location) => ({
        id: stableRef('LOCATION', location.id),
        code: stableRef('SHOPIFY_LOCATION', location.id),
        active: Boolean(location.isActive),
        pickupEnabled: Boolean(location.localPickupSettingsV2),
        eligibilityAssignmentStatus: 'missing',
        inventoryReadinessStatus: 'missing',
    }));
    const products = (collection.datasets.variants || []).map((variant) => {
        const quantity = variant.inventoryQuantity;
        const tracked = variant.inventoryItem?.tracked;
        const shopifyInventoryStatus = tracked === false ? 'untracked'
            : Number.isInteger(quantity) ? (quantity > 0 ? 'positive' : 'zero') : 'unverified';
        const inventoryLocationRefs = (variant.inventoryItem?.inventoryLevels?.nodes || [])
            .filter((level) => (level.quantities || []).some((entry) => entry.name === 'available' && entry.quantity > 0))
            .map((level) => stableRef('LOCATION', level.location?.id));
        return {
            ref: stableRef('VARIANT', variant.id),
            classification: 'unknown',
            requiresShipping: Boolean(variant.inventoryItem?.requiresShipping),
            profileId: stableRef('PROFILE', variant.deliveryProfile?.id),
            pickupEligibility: 'unknown',
            shopifyInventoryStatus,
            inventoryLocationRefs: [...new Set(inventoryLocationRefs)].sort(),
            shippingWeight: normalizeWeight(variant.inventoryItem?.measurement?.weight),
            packageCharacteristicsStatus: 'missing',
            packages: [],
        };
    });
    const failures = (collection.failures || []).map((failure) => ({ dataset: failure.dataset, state: failure.state, message: failure.message }));
    const completeness = collection.completeness || {};
    return {
        schemaVersion: 1,
        contractId: 'epic-k-normalized-shopify-config-snapshot',
        snapshotVersion: '1.2.0',
        synthetic: Boolean(collection.synthetic),
        source: {
            system: 'normalized_shopify_configuration',
            storeRef: collection.synthetic ? 'SYNTHETIC_SHOP' : 'RHINO_LAPIDARY',
            apiVersion: collection.source.apiVersion,
            mappingStatus: collection.synthetic ? 'synthetic_contract_only' : 'source_verified_mapping_pending_acceptance',
            sourceVerificationStatus: collection.synthetic ? 'synthetic' : 'verified',
            mappingAcceptanceStatus: collection.synthetic ? 'synthetic' : 'pending',
            collectionAuthorizationStatus: collection.synthetic ? 'synthetic' : 'authorized',
            operationalAuthorityStatus: collection.synthetic ? 'synthetic' : 'blocked',
            collectedAt: collection.source.collectedAt,
            assessmentTime: collection.source.assessmentTime,
            collectorAuthority: collection.synthetic ? 'SYNTHETIC-K1B02-TEST' : 'PRODUCT_OWNER_AUTHORIZED_READ_ONLY_AUDIT_2026_10_24',
            authorityStatus: collection.synthetic ? 'synthetic' : 'accepted',
            sanitized: true,
            sanitizationStatus: collection.synthetic ? 'synthetic_only' : 'raw_identifiers_replaced',
            validity: { kind: 'none_established' },
            datasetCompleteness: {
                profiles: completeness.profiles || 'missing',
                zones: completeness.profiles || 'missing',
                rates: completeness.profiles || 'missing',
                discounts: completeness.discounts || 'missing',
                markets: completeness.markets || 'missing',
                pickup: completeness.locations || 'missing',
                products: completeness.variants === 'complete' ? 'partial' : (completeness.variants || 'missing'),
            },
            collectionFailures: failures,
        },
        profiles: profiles.sort((a, b) => a.id.localeCompare(b.id)),
        zones: zones.sort((a, b) => a.id.localeCompare(b.id)),
        rates: rates.sort((a, b) => a.id.localeCompare(b.id)),
        discounts: discounts.sort((a, b) => a.id.localeCompare(b.id)),
        markets: markets.sort((a, b) => a.id.localeCompare(b.id)),
        pickup: pickup.sort((a, b) => a.id.localeCompare(b.id)),
        products: products.sort((a, b) => a.ref.localeCompare(b.ref)),
    };
}

function writeRestrictedJson(relativePath, value) {
    const target = path.resolve(relativePath);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
    return target;
}

function isPathInside(parent, candidate) {
    const relative = path.relative(parent, candidate);
    return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

function resolveRawRetentionDestination(options = {}) {
    const destination = options.destination;
    if (!destination) return { enabled: false, directory: null };
    if (options.approved !== true) throw new Error('Raw evidence retention requires explicit approved-storage configuration.');
    if (!path.isAbsolute(destination)) throw new Error('Raw evidence retention destination must be an absolute path.');
    const existsSync = options.existsSync || fs.existsSync;
    const realpathSync = options.realpathSync || fs.realpathSync;
    const statSync = options.statSync || fs.statSync;
    if (!existsSync(destination)) throw new Error('Approved raw evidence destination does not exist.');
    const directory = realpathSync(destination);
    if (!statSync(directory).isDirectory()) throw new Error('Approved raw evidence destination must be a directory.');
    const repositoryRoot = realpathSync(options.repositoryRoot || process.cwd());
    if (isPathInside(repositoryRoot, directory)) throw new Error('Raw evidence destination must be outside the repository.');
    return { enabled: true, directory };
}

module.exports = {
    API_VERSION,
    QUERIES,
    STORE_DOMAIN,
    assertAssessmentChronology,
    assertAuthorizedShopDomain,
    assertReadOnlyQuery,
    assertVerifiedCollectionIdentity,
    collectConnection,
    collectShopifyConfiguration,
    normalizeShopifyConfiguration,
    queryAdmin,
    resolveRawRetentionDestination,
    stableRef,
    verifyShopIdentity,
    writeRestrictedJson,
};
