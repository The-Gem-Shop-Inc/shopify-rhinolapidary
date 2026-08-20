require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const {
    getFixture,
    gotoUnlocked,
    storefrontUrl,
} = require('./helpers/storefront');

const RESULT_ROOT = path.join(process.cwd(), 'test-results', 'epic-c', 'batch-3');
const breadcrumbEvidence = [];
const breadcrumbBlockers = [];

test.describe.configure({ mode: 'serial' });
test.setTimeout(120_000);

const governedRoutes = [
    { id: 'product', path: getFixture('simpleProduct').path, expectedFirst: 'Home' },
    { id: 'collection', path: getFixture('collection').path, expectedFirst: 'Home' },
    { id: 'search', path: getFixture('search').path, expectedFirst: 'Home' },
    { id: 'page-contact', path: getFixture('contact').path, expectedFirst: 'Home' },
    { id: 'cart', path: getFixture('cart').path, expectedFirst: 'Home' },
    { id: 'privacy-policy', path: '/policies/privacy-policy', expectedFirst: 'Home' },
    { id: 'refund-policy', path: '/policies/refund-policy', expectedFirst: 'Home' },
    { id: 'shipping-policy', path: '/policies/shipping-policy', expectedFirst: 'Home' },
    { id: 'legal-notice', path: '/policies/legal-notice', expectedFirst: 'Home' },
];

function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function cleanUrl(rawUrl, origin) {
    const url = new URL(rawUrl, origin);

    for (const key of ['preview_theme_id', 'preview_key', '_fd', 'pb']) {
        url.searchParams.delete(key);
    }

    if (url.pathname === '/search') {
        url.search = '';
    }

    if (url.origin === origin) {
        return `${url.pathname}${url.search}`;
    }

    return `${url.origin}${url.pathname}${url.search}`;
}

function canonicalPath(rawUrl, origin) {
    return cleanUrl(rawUrl, origin).split('?')[0];
}

function collectBreadcrumbListsFromJsonLd(values) {
    const lists = [];

    function visit(value) {
        if (!value) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach(visit);
            return;
        }

        if (typeof value !== 'object') {
            return;
        }

        if (value['@type'] === 'BreadcrumbList' || (Array.isArray(value['@type']) && value['@type'].includes('BreadcrumbList'))) {
            lists.push(value);
        }

        if (value['@graph']) {
            visit(value['@graph']);
        }
    }

    values.forEach(visit);

    return lists;
}

async function collectBreadcrumbState(page) {
    return page.evaluate(() => {
        function textFor(element) {
            return (element?.innerText || element?.textContent || '').replace(/\s+/g, ' ').trim();
        }

        const navs = [...document.querySelectorAll('nav[aria-label="Breadcrumb"]')];
        const nav = navs[0];
        const items = nav
            ? [...nav.querySelectorAll('li')].map((item) => {
                const link = item.querySelector('a');

                return {
                    text: textFor(item).replace(/\s*\/\s*$/, '').trim(),
                    href: link?.getAttribute('href') || null,
                    current: item.getAttribute('aria-current') === 'page',
                    linked: Boolean(link),
                };
            })
            : [];
        const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')]
            .map((script) => script.textContent || '');
        const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';

        return {
            visibleNavCount: navs.length,
            items,
            scripts,
            canonical,
            bodyText: document.body.innerText.slice(0, 500),
        };
    });
}

test.afterAll(() => {
    fs.mkdirSync(RESULT_ROOT, { recursive: true });
    fs.writeFileSync(
        path.join(RESULT_ROOT, 'breadcrumbs.json'),
        `${JSON.stringify({
            suite: 'breadcrumbs',
            previewThemeId: process.env.PREVIEW_THEME_ID || null,
            results: breadcrumbEvidence,
            blockers: breadcrumbBlockers,
        }, null, 2)}\n`,
    );
});

test('homepage deliberately omits breadcrumbs and BreadcrumbList JSON-LD', async ({ page }) => {
    await gotoUnlocked(page, '/', 'homepage breadcrumbs absence');
    const state = await collectBreadcrumbState(page);
    const parsed = state.scripts.map((value) => JSON.parse(value));
    const breadcrumbLists = collectBreadcrumbListsFromJsonLd(parsed);

    expect(state.visibleNavCount).toBe(0);
    expect(breadcrumbLists).toHaveLength(0);

    breadcrumbEvidence.push({
        id: 'homepage',
        path: '/',
        expected: 'hidden',
        visibleNavCount: state.visibleNavCount,
        breadcrumbListCount: breadcrumbLists.length,
    });
});

for (const route of governedRoutes) {
    test(`${route.id} breadcrumb markup matches BreadcrumbList JSON-LD`, async ({ page }) => {
        await gotoUnlocked(page, route.path, `${route.id} breadcrumbs`);
        await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});

        const state = await collectBreadcrumbState(page);
        const origin = new URL(page.url()).origin;

        expect(state.bodyText).not.toMatch(/404 Not Found|opening soon|enter using password/i);
        expect(state.visibleNavCount).toBe(1);
        expect(state.items.length).toBeGreaterThanOrEqual(2);
        expect(normalizeText(state.items[0].text)).toBe(route.expectedFirst);

        const currentItems = state.items.filter((item) => item.current);
        expect(currentItems).toHaveLength(1);
        expect(currentItems[0].linked).toBe(false);

        for (const item of state.items) {
            expect(normalizeText(item.text).length).toBeGreaterThan(0);
            expect(normalizeText(item.text)).not.toMatch(/gid:\/\/|variant[_ -]?id|product[_ -]?id|collection[_ -]?id|metafield/i);
        }

        const parsed = state.scripts.map((value) => JSON.parse(value));
        const breadcrumbLists = collectBreadcrumbListsFromJsonLd(parsed);
        expect(breadcrumbLists).toHaveLength(1);

        const listItems = breadcrumbLists[0].itemListElement;
        expect(listItems).toHaveLength(state.items.length);

        listItems.forEach((item, index) => {
            expect(item.position).toBe(index + 1);
            expect(normalizeText(item.name)).toBe(normalizeText(state.items[index].text));

            const structuredPath = cleanUrl(item.item, origin);
            expect(structuredPath).not.toMatch(/preview_theme_id|preview_key|_fd|pb|\/password/i);
            expect(structuredPath).not.toMatch(/^https?:\/\/(?![^/]*rhino-lapidary\.myshopify\.com)/i);

            if (state.items[index].href) {
                expect(cleanUrl(state.items[index].href, origin)).toBe(structuredPath);
            }
        });

        const canonical = canonicalPath(state.canonical, origin);
        const currentStructuredPath = canonicalPath(listItems[listItems.length - 1].item, origin);
        expect(currentStructuredPath).toBe(canonical);
        expect(state.canonical).not.toMatch(/preview_theme_id|preview_key|_fd|pb/i);

        breadcrumbEvidence.push({
            id: route.id,
            path: route.path,
            finalUrl: cleanUrl(page.url(), origin),
            canonical,
            visibleLabels: state.items.map((item) => normalizeText(item.text)),
            structuredLabels: listItems.map((item) => normalizeText(item.name)),
            visibleNavCount: state.visibleNavCount,
            breadcrumbListCount: breadcrumbLists.length,
        });
    });
}
