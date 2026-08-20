require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const {
    getFixture,
    gotoUnlocked,
    loadFixtures,
} = require('./helpers/storefront');
const {
    storefrontUrl,
    isPasswordPage,
} = require('./helpers/storefront-auth');

const ROOT = process.cwd();
const RESULT_ROOT = path.join(ROOT, 'test-results', 'epic-c');
const BATCH_4_RESULT_ROOT = path.join(RESULT_ROOT, 'batch-4');
const navigationSpec = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/navigation-spec.json'), 'utf8'),
);
const navigationIA = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'data/global-navigation-ia.json'), 'utf8'),
);

test.describe.configure({ mode: 'serial' });
test.setTimeout(180_000);

function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function stripPreviewParams(url) {
    for (const param of [
        'preview_theme_id',
        'preview_key',
        '_fd',
        'pb',
    ]) {
        url.searchParams.delete(param);
    }
}

function displayUrl(rawUrl, origin) {
    if (!rawUrl) {
        return null;
    }

    try {
        const url = new URL(rawUrl, origin);
        stripPreviewParams(url);

        if (url.hostname === 'shopify.com' && url.pathname.startsWith('/authentication/')) {
            return `${url.origin}${url.pathname}`;
        }

        if (url.origin !== origin) {
            return `${url.origin}${url.pathname}`;
        }

        return `${url.pathname}${url.search}`;
    } catch {
        return rawUrl;
    }
}

function normalizedInternalPath(rawUrl, origin) {
    if (!rawUrl) {
        return null;
    }

    try {
        const url = new URL(rawUrl, origin);
        stripPreviewParams(url);

        if (url.origin !== origin) {
            return null;
        }

        return `${url.pathname}${url.search}`;
    } catch {
        return null;
    }
}

function pathWithoutQuery(value) {
    if (!value) {
        return value;
    }

    return value.split('?')[0];
}

function routeIdentityMatches(requestedPath, finalPath) {
    if (!requestedPath || !finalPath) {
        return false;
    }

    if (requestedPath === finalPath) {
        return true;
    }

    return (
        pathWithoutQuery(requestedPath) === pathWithoutQuery(finalPath)
        && !finalPath.includes('/password')
    );
}

function flattenItems(items = [], parentMenu = '') {
    return items.flatMap((item) => [
        {
            ...item,
            parentMenu,
        },
        ...flattenItems(item.items || [], parentMenu),
    ]);
}

function allIaItems() {
    return navigationIA.menus.flatMap((menu) => flattenItems(menu.items, menu.id));
}

const iaItems = allIaItems();
const navRoutes = navigationSpec.routes;
const STOREFRONT_PROBE_DELAY_MS = 200;

function matchingRoutes(normalizedPath) {
    if (!normalizedPath) {
        return [];
    }

    return navRoutes.filter((route) => (
        route.path === normalizedPath
        || (
            pathWithoutQuery(route.path) === pathWithoutQuery(normalizedPath)
            && !route.path.includes('?')
        )
    ));
}

function matchingIaItems(entry) {
    return iaItems.filter((item) => {
        if (!item.targetPath) {
            return false;
        }

        const itemPath = item.targetPath;

        if (/^https?:\/\//i.test(itemPath)) {
            return entry.absoluteDisplayUrl?.startsWith(itemPath);
        }

        if (item.sourceType === 'shopify_account') {
            return entry.normalizedPath?.startsWith(itemPath);
        }

        return (
            entry.normalizedPath === itemPath
            || pathWithoutQuery(entry.normalizedPath) === pathWithoutQuery(itemPath)
        );
    });
}

function isMobileProject(projectName) {
    return /mobile/i.test(projectName);
}

function expectedItemAppliesToProject(item, projectName) {
    const locations = item.expectedLocations || [];
    const mobile = isMobileProject(projectName);

    if (!item.expectedInRenderedChrome) {
        return false;
    }

    if (mobile && locations.includes('drawer')) {
        return true;
    }

    if (!mobile && locations.includes('header')) {
        return true;
    }

    return locations.some((location) => [
        'footer',
        'policy',
        'utility',
    ].includes(location));
}

function entryMatchesExpectedItem(entry, item) {
    if (!entry.visible) {
        return false;
    }

    const labelsMatch = normalizeText(entry.label) === normalizeText(item.label);

    if (!labelsMatch) {
        return false;
    }

    if (!item.targetPath) {
        return false;
    }

    if (/^https?:\/\//i.test(item.targetPath)) {
        return entry.absoluteDisplayUrl?.startsWith(item.targetPath);
    }

    if (item.sourceType === 'shopify_account') {
        return entry.normalizedPath?.startsWith(item.targetPath);
    }

    return (
        entry.normalizedPath === item.targetPath
        || pathWithoutQuery(entry.normalizedPath) === pathWithoutQuery(item.targetPath)
    );
}

function classifyElement(element) {
    if (element.closest('footer .policies')) {
        return 'policy';
    }

    if (element.closest('footer')) {
        return 'footer';
    }

    if (element.closest('header-drawer')) {
        return 'drawer';
    }

    if (element.closest('.mega-menu__content')) {
        return 'mega-menu';
    }

    if (
        element.matches('.header__icon--search, .header__icon--cart, .header__icon--account')
        || element.closest('.header__icons')
    ) {
        return 'utility';
    }

    if (element.closest('header')) {
        return 'header';
    }

    return 'unknown';
}

async function openMobileDrawerIfAvailable(page) {
    const drawerToggle = page.locator('summary.header__icon--menu').first();

    if (await drawerToggle.isVisible({ timeout: 1500 }).catch(() => false)) {
        await drawerToggle.click();
        await page.locator('#menu-drawer').waitFor({
            state: 'visible',
            timeout: 5000,
        }).catch(() => {});
    }
}

async function openMobileNestedMenuIfAvailable(page) {
    const nestedSummary = page.locator('#menu-drawer .menu-drawer__navigation details > summary:visible').first();

    if (await nestedSummary.isVisible({ timeout: 1500 }).catch(() => false)) {
        await nestedSummary.click();
        await page.locator('#menu-drawer .menu-drawer__submenu:visible').first().waitFor({
            state: 'visible',
            timeout: 5000,
        }).catch(() => {});
    }
}

async function openDesktopMenusIfPresent(page) {
    await page.evaluate(() => {
        for (const details of document.querySelectorAll('details.mega-menu')) {
            details.setAttribute('open', '');
        }
    });
}

async function collectVisibleChromeEntries(page, pageId, stateId) {
    const origin = new URL(page.url()).origin;

    return page.evaluate(({ currentPageId, currentOrigin }) => {
        function visible(element) {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);

            return (
                rect.width > 0
                && rect.height > 0
                && style.visibility !== 'hidden'
                && style.display !== 'none'
            );
        }

        function labelFor(element) {
            return (
                element.innerText
                || element.getAttribute('aria-label')
                || element.textContent
                || ''
            ).replace(/\s+/g, ' ').trim();
        }

        function locationFor(element) {
            if (element.closest('footer .policies')) {
                return 'policy';
            }

            if (element.closest('footer')) {
                return 'footer';
            }

            if (element.closest('header-drawer')) {
                return 'drawer';
            }

            if (element.closest('.mega-menu__content')) {
                return 'mega-menu';
            }

            if (
                element.matches('.header__icon--search, .header__icon--cart, .header__icon--account')
                || element.closest('.header__icons')
            ) {
                return 'utility';
            }

            if (element.closest('header')) {
                return 'header';
            }

            return 'unknown';
        }

        function sourceCategoryFor(element, location) {
            if (location === 'policy') {
                return 'shopify_policy';
            }

            if (element.closest('.header__inline-menu, header-drawer nav, .footer-block--menu')) {
                return 'shopify_navigation';
            }

            if (element.matches('.header__heading-link') || element.closest('.footer__copyright')) {
                return 'theme_route';
            }

            if (element.matches('.header__icon--cart')) {
                return 'theme_route';
            }

            if (element.matches('.header__icon--account') || element.closest('.menu-drawer__account')) {
                return 'shopify_account';
            }

            if (element.matches('.header__icon--search')) {
                return 'repository_route';
            }

            if (element.closest('.list-social')) {
                return 'external_social';
            }

            return 'unknown';
        }

        function activeStateFor(element) {
            if (element.getAttribute('aria-current')) {
                return element.getAttribute('aria-current');
            }

            if (
                String(element.className || '').includes('active')
                || String(element.className || '').includes('--active')
            ) {
                return String(element.className || '');
            }

            return '';
        }

        function elementPath(element) {
            const parts = [];
            let current = element;

            while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 5) {
                const id = current.id ? `#${current.id}` : '';
                const className = String(current.className || '')
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((part) => `.${part}`)
                    .join('');
                parts.unshift(`${current.tagName.toLowerCase()}${id}${className}`);
                current = current.parentElement;
            }

            return parts.join(' > ');
        }

        return [...document.querySelectorAll('header a, header summary, footer a')].map((element, index) => {
            const location = locationFor(element);
            const rawHref = element.getAttribute('href');
            let controlTargetPath = null;

            if (!rawHref && element.matches('.header__icon--search')) {
                controlTargetPath = '/search';
            }

            return {
                id: `${currentPageId}-${index}`,
                pageId: currentPageId,
                kind: rawHref ? 'link' : 'control',
                element: elementPath(element),
                label: labelFor(element),
                rawHref,
                controlTargetPath,
                location,
                sourceCategory: sourceCategoryFor(element, location),
                visible: visible(element),
                activeState: activeStateFor(element),
                absoluteDisplayUrl: rawHref
                    ? (() => {
                        try {
                            const url = new URL(rawHref, currentOrigin);

                            if (url.origin !== currentOrigin) {
                                return `${url.origin}${url.pathname}`;
                            }

                            return `${url.pathname}${url.search}`;
                        } catch {
                            return rawHref;
                        }
                    })()
                    : null,
            };
        });
    }, {
        currentPageId: `${pageId}-${stateId}`,
        currentOrigin: origin,
    });
}

async function collectChromeEntries(page, pageId, projectName) {
    if (isMobileProject(projectName)) {
        await openMobileDrawerIfAvailable(page);
        const drawerEntries = await collectVisibleChromeEntries(page, pageId, 'drawer-open');
        await openMobileNestedMenuIfAvailable(page);
        const nestedDrawerEntries = await collectVisibleChromeEntries(page, pageId, 'nested-drawer-open');

        return [
            ...drawerEntries,
            ...nestedDrawerEntries,
        ];
    }

    await openDesktopMenusIfPresent(page);
    return collectVisibleChromeEntries(page, pageId, 'desktop-open');
}

async function resolveEntry(context, entry, origin) {
    if (entry.kind === 'control') {
        return {
            ...entry,
            normalizedPath: entry.controlTargetPath,
            destinationType: 'control',
            responseStatus: null,
            redirectDestination: null,
            classification: 'valid_destination',
            representedInRouteContract: matchingRoutes(entry.controlTargetPath).length > 0,
            routeContractIds: matchingRoutes(entry.controlTargetPath).map((route) => route.id),
            launchRequired: matchingRoutes(entry.controlTargetPath).some((route) => route.requiredForLaunch),
            iaItemIds: matchingIaItems({
                ...entry,
                normalizedPath: entry.controlTargetPath,
            }).map((item) => item.id),
        };
    }

    const rawHref = entry.rawHref || '';

    if (/^(?:#|tel:|mailto:|javascript:)/i.test(rawHref)) {
        return {
            ...entry,
            normalizedPath: null,
            destinationType: 'typed_non_route',
            responseStatus: null,
            redirectDestination: null,
            classification: 'typed_non_route',
            representedInRouteContract: false,
            routeContractIds: [],
            launchRequired: false,
            iaItemIds: [],
        };
    }

    let parsed;

    try {
        parsed = new URL(rawHref, origin);
    } catch {
        return {
            ...entry,
            normalizedPath: null,
            destinationType: 'invalid_url',
            responseStatus: null,
            redirectDestination: null,
            classification: 'unresolved_destination',
            representedInRouteContract: false,
            routeContractIds: [],
            launchRequired: false,
            iaItemIds: [],
        };
    }

    stripPreviewParams(parsed);

    const sameStore = parsed.origin === origin;
    const normalizedPath = sameStore
        ? `${parsed.pathname}${parsed.search}`
        : null;
    const entryForMatching = {
        ...entry,
        normalizedPath,
        absoluteDisplayUrl: `${parsed.origin}${parsed.pathname}`,
    };
    const routeMatches = matchingRoutes(normalizedPath);
    const iaMatches = matchingIaItems(entryForMatching);
    const iaAllowsExternal = iaMatches.some((item) => item.externalAllowed);

    if (!sameStore) {
        let responseStatus = null;
        let classification = iaAllowsExternal
            ? 'valid_destination'
            : 'unresolved_external';

        try {
            const response = await context.request.get(parsed.toString(), {
                maxRedirects: 0,
                timeout: 5000,
            });
            responseStatus = response.status();
        } catch {
            if (!iaAllowsExternal) {
                classification = 'unresolved_external';
            }
        }

        return {
            ...entry,
            normalizedPath: null,
            absoluteDisplayUrl: `${parsed.origin}${parsed.pathname}`,
            destinationType: 'external',
            responseStatus,
            redirectDestination: null,
            classification,
            representedInRouteContract: false,
            routeContractIds: [],
            launchRequired: iaMatches.some((item) => item.requiredForLaunch),
            iaItemIds: iaMatches.map((item) => item.id),
        };
    }

    if (
        entry.sourceCategory === 'shopify_account'
        || parsed.pathname.startsWith('/customer_authentication/')
    ) {
        const response = await context.request.get(
            storefrontUrl(`${parsed.pathname}${parsed.search}`),
            {
                maxRedirects: 0,
                timeout: 5000,
            },
        );
        const location = response.headers().location || '';

        return {
            ...entry,
            normalizedPath,
            destinationType: 'shopify_account',
            responseStatus: response.status(),
            redirectDestination: location
                ? displayUrl(location, origin)
                : null,
            classification: iaAllowsExternal
                ? 'valid_destination'
                : 'unresolved_destination',
            representedInRouteContract: routeMatches.length > 0,
            routeContractIds: routeMatches.map((route) => route.id),
            launchRequired: routeMatches.some((route) => route.requiredForLaunch)
                || iaMatches.some((item) => item.requiredForLaunch),
            iaItemIds: iaMatches.map((item) => item.id),
        };
    }

    const probe = await context.newPage();
    let response = null;
    let responseStatus = null;
    let finalPath = null;
    let title = '';
    let passwordPage = false;
    let has404 = false;
    let hasPlaceholder = false;

    try {
        response = await probe.goto(
            storefrontUrl(`${parsed.pathname}${parsed.search}`),
            {
                waitUntil: 'domcontentloaded',
                timeout: 30000,
            },
        );
        responseStatus = response?.status?.() ?? null;
        title = await probe.title().catch(() => '');
        passwordPage = await isPasswordPage(probe).catch(() => false);
        const finalUrl = new URL(probe.url());
        stripPreviewParams(finalUrl);
        finalPath = `${finalUrl.pathname}${finalUrl.search}`;
        const body = await probe.locator('body').innerText({
            timeout: 1500,
        }).catch(() => '');
        has404 = /404 Not Found|Page not found|not found/i.test(body);
        hasPlaceholder = /Welcome to our store|You're set up for success|Add a customer testimonial|Talk about your brand|Image with text/i.test(body);
    } finally {
        await probe.close();
    }

    await new Promise((resolve) => {
        setTimeout(resolve, STOREFRONT_PROBE_DELAY_MS);
    });

    let classification = 'valid_destination';

    if (passwordPage || finalPath === '/password') {
        classification = 'password_page';
    } else if ((responseStatus || 0) >= 400 || has404) {
        classification = 'not_found';
    } else if (!routeIdentityMatches(normalizedPath, finalPath)) {
        classification = 'unrelated_storefront';
    } else if (hasPlaceholder) {
        classification = 'placeholder_destination';
    }

    return {
        ...entry,
        normalizedPath,
        destinationType: 'internal',
        responseStatus,
        redirectDestination: finalPath && finalPath !== normalizedPath
            ? finalPath
            : null,
        finalPath,
        title,
        classification,
        representedInRouteContract: routeMatches.length > 0,
        routeContractIds: routeMatches.map((route) => route.id),
        launchRequired: routeMatches.some((route) => route.requiredForLaunch)
            || iaMatches.some((item) => item.requiredForLaunch),
        iaItemIds: iaMatches.map((item) => item.id),
    };
}

function summarize(entries) {
    const summary = {
        total: entries.length,
        byLocation: {},
        byDestinationType: {},
        byClassification: {},
        internal: 0,
        external: 0,
        valid: 0,
        redirecting: 0,
        notFound: 0,
        password: 0,
        unresolved: 0,
    };

    for (const entry of entries) {
        summary.byLocation[entry.location] = (summary.byLocation[entry.location] || 0) + 1;
        summary.byDestinationType[entry.destinationType] = (summary.byDestinationType[entry.destinationType] || 0) + 1;
        summary.byClassification[entry.classification] = (summary.byClassification[entry.classification] || 0) + 1;

        if (entry.destinationType === 'internal') {
            summary.internal += 1;
        }

        if (entry.destinationType === 'external') {
            summary.external += 1;
        }

        if (entry.classification === 'valid_destination') {
            summary.valid += 1;
        }

        if (entry.redirectDestination) {
            summary.redirecting += 1;
        }

        if (entry.classification === 'not_found') {
            summary.notFound += 1;
        }

        if (entry.classification === 'password_page') {
            summary.password += 1;
        }

        if (/unresolved/.test(entry.classification)) {
            summary.unresolved += 1;
        }
    }

    return summary;
}

function auditRoutes() {
    const fixtures = loadFixtures();
    const routes = [
        {
            id: 'homepage',
            path: '/',
        },
        {
            id: 'collection',
            path: getFixture('collection').path,
        },
        {
            id: 'search',
            path: '/search?q=rhino',
        },
        {
            id: 'product',
            path: getFixture('simpleProduct').path,
        },
        {
            id: 'cart',
            path: '/cart',
        },
        {
            id: 'contact',
            path: fixtures.fixtures.contact?.path || '/pages/contact',
        },
        {
            id: 'policy-privacy',
            path: '/policies/privacy-policy',
        },
        {
            id: 'policy-refund',
            path: '/policies/refund-policy',
        },
        {
            id: 'policy-shipping',
            path: '/policies/shipping-policy',
        },
        {
            id: 'policy-legal-notice',
            path: '/policies/legal-notice',
        },
        {
            id: 'manual-em-1',
            path: '/pages/em-1-manual',
        },
    ];

    return routes;
}

function candidateRouteProbeRoutes() {
    return [
        {
            id: 'home',
            path: '/',
            expected: 'valid_destination',
        },
        {
            id: 'catalog',
            path: '/collections',
            expected: 'valid_destination',
        },
        {
            id: 'machines',
            path: '/collections/machines',
            expected: 'valid_destination',
        },
        {
            id: 'search-query',
            path: '/search?q=rhino',
            expected: 'valid_destination',
        },
        {
            id: 'search-page',
            path: '/search',
            expected: 'valid_destination',
        },
        {
            id: 'cart',
            path: '/cart',
            expected: 'valid_destination',
        },
        {
            id: 'contact',
            path: '/pages/contact',
            expected: 'valid_destination',
        },
        {
            id: 'privacy-policy',
            path: '/policies/privacy-policy',
            expected: 'valid_destination',
        },
        {
            id: 'refund-policy',
            path: '/policies/refund-policy',
            expected: 'valid_destination',
        },
        {
            id: 'shipping-policy',
            path: '/policies/shipping-policy',
            expected: 'valid_destination',
        },
        {
            id: 'legal-notice',
            path: '/policies/legal-notice',
            expected: 'valid_destination',
        },
        {
            id: 'manual-em-1',
            path: '/pages/em-1-manual',
            expected: 'valid_destination',
        },
        {
            id: 'sitemap',
            path: '/sitemap.xml',
            expected: 'valid_destination',
        },
        {
            id: 'simple-product',
            path: getFixture('simpleProduct').path,
            expected: 'valid_destination',
        },
        {
            id: 'machine-product',
            path: getFixture('machineProduct').path,
            expected: 'valid_destination',
        },
        {
            id: 'consumables-candidate',
            path: '/collections/consumables',
            expected: 'not_found',
            dependency: 'dep-consumables-route',
        },
        {
            id: 'accessories-candidate',
            path: '/collections/accessories',
            expected: 'not_found',
            dependency: 'dep-accessories-route',
        },
        {
            id: 'replacement-parts-candidate',
            path: '/collections/replacement-parts',
            expected: 'not_found',
            dependency: 'dep-replacement-parts-route',
        },
        {
            id: 'parts-candidate',
            path: '/collections/parts',
            expected: 'not_found',
            dependency: 'dep-replacement-parts-route',
        },
        {
            id: 'support-candidate',
            path: '/pages/support',
            expected: 'not_found',
            dependency: 'dep-support-route',
        },
        {
            id: 'manuals-index-candidate',
            path: '/pages/manuals',
            expected: 'not_found',
        },
        {
            id: 'warranty-candidate',
            path: '/pages/warranty',
            expected: 'not_found',
            dependency: 'dep-warranty-route',
        },
        {
            id: 'shipping-candidate',
            path: '/pages/shipping',
            expected: 'not_found',
            dependency: 'dep-shipping-route',
        },
        {
            id: 'accessibility-statement-candidate',
            path: '/pages/accessibility-statement',
            expected: 'not_found',
            dependency: 'future-policy-admin-dependency',
        },
        {
            id: 'terms-policy-candidate',
            path: '/policies/terms-of-service',
            expected: 'not_found',
        },
        {
            id: 'contact-information-policy-candidate',
            path: '/policies/contact-information',
            expected: 'not_found',
        },
    ];
}

async function probeRoute(page, route) {
    const response = await page.goto(
        storefrontUrl(route.path),
        {
            waitUntil: 'domcontentloaded',
            timeout: 60_000,
        },
    );
    await page.locator('body').waitFor({
        state: 'attached',
        timeout: 15_000,
    }).catch(() => {});

    const origin = new URL(page.url()).origin;
    const finalUrl = new URL(page.url());
    stripPreviewParams(finalUrl);

    const responseStatus = response?.status?.() ?? null;
    const passwordPage = await isPasswordPage(page).catch(() => false);
    const body = await page.locator('body').innerText({
        timeout: 1500,
    }).catch(() => '');
    const finalPath = `${finalUrl.pathname}${finalUrl.search}`;
    const notFound = /404 Not Found|Page not found|not found/i.test(body)
        || (responseStatus || 0) >= 400;

    let classification = 'valid_destination';

    if (passwordPage || finalPath === '/password') {
        classification = 'password_page';
    } else if (notFound) {
        classification = 'not_found';
    } else if (!routeIdentityMatches(route.path, finalPath)) {
        classification = 'unrelated_storefront';
    }

    return {
        id: route.id,
        requestedPath: route.path,
        expected: route.expected,
        dependency: route.dependency || null,
        status: responseStatus,
        finalUrl: displayUrl(page.url(), origin),
        finalPath,
        title: await page.title().catch(() => ''),
        passwordPage,
        classification,
        blocker: classification === 'not_found' && route.dependency
            ? route.dependency
            : null,
    };
}

async function writeRouteProbeEvidence(page) {
    const routes = [];

    for (const route of candidateRouteProbeRoutes()) {
        routes.push(await probeRoute(page, route));
        await page.waitForTimeout(STOREFRONT_PROBE_DELAY_MS);
    }

    const report = {
        generatedAt: new Date().toISOString(),
        project: 'desktop-chromium',
        routes,
        summary: routes.reduce((summary, route) => {
            summary.total += 1;
            summary.byClassification[route.classification] = (
                summary.byClassification[route.classification] || 0
            ) + 1;

            if (route.blocker) {
                summary.blockers += 1;
            }

            return summary;
        }, {
            total: 0,
            blockers: 0,
            byClassification: {},
        }),
    };

    fs.mkdirSync(RESULT_ROOT, {
        recursive: true,
    });
    fs.writeFileSync(
        path.join(RESULT_ROOT, 'route-probe.json'),
        `${JSON.stringify(report, null, 2)}\n`,
    );

    const unexpected = routes.filter((route) => (
        route.expected
        && route.classification !== route.expected
    ));

    expect(
        unexpected,
        `Unexpected route probe classifications:\n${
            unexpected.map((route) => (
                `- ${route.id}: expected ${route.expected}, found ${route.classification} at ${route.finalPath}`
            )).join('\n')
        }`,
    ).toEqual([]);
}

test('rendered global chrome links resolve and match the IA contract', async ({ page }, testInfo) => {
    const projectName = testInfo.project.name;
    const pageReports = [];
    const allEntries = [];
    const resolutionCache = new Map();

    function cacheKey(entry) {
        return [
            entry.kind,
            entry.rawHref || entry.controlTargetPath || '',
            entry.sourceCategory,
        ].join('|');
    }

    function resolutionFields(entry, resolved) {
        const fields = { ...resolved };

        for (const key of Object.keys(entry)) {
            delete fields[key];
        }

        return fields;
    }

    for (const route of auditRoutes()) {
        const navigation = await gotoUnlocked(
            page,
            route.path,
            `global chrome audit ${route.id}`,
        );

        await expect(page.locator('body')).not.toContainText('404 Not Found');

        const collected = await collectChromeEntries(
            page,
            route.id,
            projectName,
        );
        const origin = new URL(navigation.url).origin;
        const resolvedEntries = [];

        for (const entry of collected) {
            const key = cacheKey(entry);

            if (!resolutionCache.has(key)) {
                const resolved = await resolveEntry(page.context(), entry, origin);
                resolutionCache.set(key, resolutionFields(entry, resolved));
                resolvedEntries.push(resolved);
                continue;
            }

            resolvedEntries.push({
                ...entry,
                ...resolutionCache.get(key),
            });
        }

        pageReports.push({
            id: route.id,
            requestedPath: route.path,
            finalUrl: displayUrl(page.url(), origin),
            title: await page.title(),
            entries: resolvedEntries,
        });
        allEntries.push(...resolvedEntries);
        await page.waitForTimeout(STOREFRONT_PROBE_DELAY_MS);
    }

    const expectedItems = iaItems.filter((item) => (
        item.requiredForLaunch
        && expectedItemAppliesToProject(item, projectName)
    ));
    const missingExpectedItems = expectedItems.filter((item) => (
        !allEntries.some((entry) => entryMatchesExpectedItem(entry, item))
    ));

    const brokenEntries = allEntries.filter((entry) => [
        'password_page',
        'not_found',
        'unrelated_storefront',
        'placeholder_destination',
        'unresolved_destination',
        'unresolved_external',
    ].includes(entry.classification));

    const report = {
        generatedAt: new Date().toISOString(),
        project: projectName,
        pages: pageReports,
        summary: summarize(allEntries),
        requiredExpectedItems: expectedItems.map((item) => item.id),
        missingExpectedItems: missingExpectedItems.map((item) => item.id),
        brokenEntries: brokenEntries.map((entry) => ({
            pageId: entry.pageId,
            label: entry.label,
            rawHref: displayUrl(entry.rawHref, new URL(page.url()).origin),
            normalizedPath: entry.normalizedPath,
            location: entry.location,
            classification: entry.classification,
            responseStatus: entry.responseStatus,
            redirectDestination: entry.redirectDestination,
            routeContractIds: entry.routeContractIds,
            iaItemIds: entry.iaItemIds,
        })),
    };

    fs.mkdirSync(RESULT_ROOT, {
        recursive: true,
    });
    fs.writeFileSync(
        path.join(
            RESULT_ROOT,
            `global-chrome-links-${projectName}.json`,
        ),
        `${JSON.stringify(report, null, 2)}\n`,
    );

    expect(
        missingExpectedItems,
        `Missing required IA items in rendered chrome: ${missingExpectedItems.map((item) => item.id).join(', ')}`,
    ).toEqual([]);

    expect(
        brokenEntries,
        `Broken rendered global chrome destinations:\n${
            brokenEntries.map((entry) => (
                `- ${entry.pageId} ${entry.location} ${entry.label}: ${entry.classification} ${entry.normalizedPath || entry.rawHref}`
            )).join('\n')
        }`,
    ).toEqual([]);

    if (projectName === 'desktop-chromium') {
        await writeRouteProbeEvidence(page);
    }
});

test('footer policy links and sitemap resolve with strict route identity', async ({ page, context }, testInfo) => {
    const navigation = await gotoUnlocked(
        page,
        '/',
        'footer policy and sitemap audit',
    );
    const origin = new URL(navigation.url).origin;

    const policyLinks = await page.locator('footer .policies a').evaluateAll((links) => (
        links.map((link, index) => ({
            index,
            label: (link.innerText || link.textContent || '').replace(/\s+/g, ' ').trim(),
            href: link.getAttribute('href'),
        }))
    ));

    expect(policyLinks, 'At least one dynamic footer policy link should render.').not.toEqual([]);

    const policyResults = [];

    for (const link of policyLinks) {
        const parsed = new URL(link.href, origin);
        stripPreviewParams(parsed);
        const normalizedPath = parsed.origin === origin
            ? `${parsed.pathname}${parsed.search}`
            : null;
        const result = {
            label: link.label,
            rawHref: link.href,
            normalizedPath,
            status: null,
            finalPath: null,
            passwordPage: false,
            classification: 'valid_destination',
        };

        if (!normalizedPath || !parsed.pathname.startsWith('/policies/')) {
            result.classification = 'unrelated_storefront';
            policyResults.push(result);
            continue;
        }

        const probe = await context.newPage();

        try {
            const response = await probe.goto(
                storefrontUrl(normalizedPath),
                {
                    waitUntil: 'domcontentloaded',
                    timeout: 60_000,
                },
            );
            result.status = response?.status?.() ?? null;
            result.passwordPage = await isPasswordPage(probe).catch(() => false);
            const finalUrl = new URL(probe.url());
            stripPreviewParams(finalUrl);
            result.finalPath = `${finalUrl.pathname}${finalUrl.search}`;
            const body = await probe.locator('body').innerText({
                timeout: 1500,
            }).catch(() => '');
            const notFound = /404 Not Found|Page not found|not found/i.test(body)
                || (result.status || 0) >= 400;

            if (result.passwordPage || result.finalPath === '/password') {
                result.classification = 'password_page';
            } else if (notFound) {
                result.classification = 'not_found';
            } else if (!routeIdentityMatches(normalizedPath, result.finalPath)) {
                result.classification = 'unrelated_storefront';
            }
        } finally {
            await probe.close();
        }

        policyResults.push(result);
    }

    const sitemapResponse = await context.request.get(
        storefrontUrl('/sitemap.xml'),
        {
            timeout: 60_000,
        },
    );
    const sitemapBody = await sitemapResponse.text();
    const sitemapResult = {
        requestedPath: '/sitemap.xml',
        status: sitemapResponse.status(),
        contentType: sitemapResponse.headers()['content-type'] || '',
        validXmlSitemap: /<(?:sitemapindex|urlset)\b/i.test(sitemapBody)
            && !/<html\b/i.test(sitemapBody),
    };

    const report = {
        generatedAt: new Date().toISOString(),
        project: testInfo.project.name,
        policyLinks: policyResults,
        sitemap: sitemapResult,
    };

    fs.mkdirSync(BATCH_4_RESULT_ROOT, {
        recursive: true,
    });
    fs.writeFileSync(
        path.join(
            BATCH_4_RESULT_ROOT,
            `footer-policy-sitemap-${testInfo.project.name}.json`,
        ),
        `${JSON.stringify(report, null, 2)}\n`,
    );

    const brokenPolicies = policyResults.filter((result) => (
        result.classification !== 'valid_destination'
    ));

    expect(
        brokenPolicies,
        `Broken footer policy links:\n${
            brokenPolicies.map((result) => (
                `- ${result.label}: ${result.classification} ${result.normalizedPath || result.rawHref}`
            )).join('\n')
        }`,
    ).toEqual([]);

    expect(sitemapResult.status, 'sitemap.xml should resolve.').toBeLessThan(400);
    expect(sitemapResult.validXmlSitemap, 'sitemap.xml should be XML sitemap content, not storefront HTML.').toBe(true);
});
