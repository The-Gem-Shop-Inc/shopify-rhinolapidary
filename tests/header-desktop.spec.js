require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const {
    gotoUnlocked,
} = require('./helpers/storefront');

const RESULT_ROOT = path.join(process.cwd(), 'test-results', 'epic-c', 'batch-2');
const desktopEvidence = [];

test.describe.configure({ mode: 'serial' });
test.setTimeout(120_000);

const desktopViewports = [
    { id: 'desktop-breakpoint', width: 990, height: 768 },
    { id: 'tablet-landscape', width: 1024, height: 768 },
    { id: 'small-desktop', width: 1280, height: 720 },
    { id: 'standard-desktop', width: 1440, height: 900 },
    { id: 'wide-desktop', width: 1920, height: 1080 },
];

function round(value) {
    return Math.round(value * 100) / 100;
}

function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function hasTechnicalIdentifier(value) {
    return /\b(?:gid:\/\/|variant[_ -]?id|product[_ -]?id|collection[_ -]?id|metafield|metaobject|shopify--|default title)\b/i
        .test(value);
}

async function collectHeaderMetrics(page) {
    return page.evaluate(() => {
        function visible(element) {
            if (!element) {
                return false;
            }

            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);

            return (
                rect.width > 0
                && rect.height > 0
                && style.display !== 'none'
                && style.visibility !== 'hidden'
            );
        }

        function rectFor(element) {
            if (!element) {
                return null;
            }

            const rect = element.getBoundingClientRect();

            return {
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            };
        }

        function textFor(element) {
            if (!element) {
                return '';
            }

            return (
                element.innerText
                || element.getAttribute('aria-label')
                || element.textContent
                || ''
            ).replace(/\s+/g, ' ').trim();
        }

        function control(selector) {
            const element = document.querySelector(selector);

            return {
                present: Boolean(element),
                visible: visible(element),
                text: textFor(element),
                ariaLabel: element?.getAttribute('aria-label') || '',
                href: element?.getAttribute('href') || '',
                rect: rectFor(element),
            };
        }

        const header = document.querySelector('header.header');
        const controls = [...document.querySelectorAll('header.header a, header.header summary, header.header button')]
            .filter((element) => visible(element) && !element.closest('.search-modal'))
            .map((element) => ({
                element,
                label: textFor(element),
                selector: element.id || element.className || element.tagName.toLowerCase(),
                rect: rectFor(element),
            }));
        const overlappingVisibleControls = [];

        for (let leftIndex = 0; leftIndex < controls.length; leftIndex += 1) {
            for (let rightIndex = leftIndex + 1; rightIndex < controls.length; rightIndex += 1) {
                const leftControl = controls[leftIndex];
                const rightControl = controls[rightIndex];

                if (
                    leftControl.element.contains(rightControl.element)
                    || rightControl.element.contains(leftControl.element)
                ) {
                    continue;
                }

                const leftRect = leftControl.rect;
                const rightRect = rightControl.rect;
                const overlaps = (
                    leftRect.left < rightRect.right
                    && leftRect.right > rightRect.left
                    && leftRect.top < rightRect.bottom
                    && leftRect.bottom > rightRect.top
                );

                if (overlaps) {
                    overlappingVisibleControls.push({
                        left: leftControl.label || leftControl.selector,
                        right: rightControl.label || rightControl.selector,
                    });
                }
            }
        }

        const navigationItems = [...document.querySelectorAll('.header__inline-menu a, .header__inline-menu summary')]
            .filter(visible)
            .map((element) => ({
                label: textFor(element),
                rect: rectFor(element),
                clipped: element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight,
            }));

        return {
            header: {
                present: Boolean(header),
                rect: rectFor(header),
                position: header ? window.getComputedStyle(header.closest('.section-header') || header).position : '',
            },
            horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
            logo: control('.header__heading-link'),
            navigation: {
                visible: visible(document.querySelector('.header__inline-menu')),
                items: navigationItems,
            },
            search: control('summary.header__icon--search'),
            account: control('a.header__icon--account'),
            cart: control('a.header__icon--cart'),
            localizationControls: [...document.querySelectorAll('.desktop-localization-wrapper button')]
                .filter(visible)
                .map((element) => ({
                    text: textFor(element),
                    ariaExpanded: element.getAttribute('aria-expanded') || '',
                    rect: rectFor(element),
                })),
            cartNotificationPresent: Boolean(document.querySelector('cart-notification')),
            overlappingVisibleControls,
        };
    });
}

function roundedMetrics(metrics) {
    const roundRect = (rect) => {
        if (!rect) {
            return null;
        }

        return Object.fromEntries(
            Object.entries(rect).map(([key, value]) => [key, round(value)]),
        );
    };

    return {
        ...metrics,
        header: {
            ...metrics.header,
            rect: roundRect(metrics.header.rect),
        },
        logo: {
            ...metrics.logo,
            rect: roundRect(metrics.logo.rect),
        },
        navigation: {
            ...metrics.navigation,
            items: metrics.navigation.items.map((item) => ({
                ...item,
                rect: roundRect(item.rect),
            })),
        },
        search: {
            ...metrics.search,
            rect: roundRect(metrics.search.rect),
        },
        account: {
            ...metrics.account,
            rect: roundRect(metrics.account.rect),
        },
        cart: {
            ...metrics.cart,
            rect: roundRect(metrics.cart.rect),
        },
        localizationControls: metrics.localizationControls.map((item) => ({
            ...item,
            rect: roundRect(item.rect),
        })),
    };
}

test.afterAll(() => {
    fs.mkdirSync(RESULT_ROOT, { recursive: true });
    fs.writeFileSync(
        path.join(RESULT_ROOT, 'desktop-header-behavior.json'),
        `${JSON.stringify({
            suite: 'header-desktop',
            previewThemeId: process.env.PREVIEW_THEME_ID || null,
            route: '/',
            results: desktopEvidence,
        }, null, 2)}\n`,
    );
});

for (const viewport of desktopViewports) {
    test(`desktop header hierarchy is stable at ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize({
            width: viewport.width,
            height: viewport.height,
        });

        await gotoUnlocked(page, '/', `desktop header ${viewport.id}`);
        await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});
        await page.evaluate(async () => {
            if (document.fonts?.ready) {
                await document.fonts.ready;
            }
        }).catch(() => {});

        const metrics = await collectHeaderMetrics(page);
        desktopEvidence.push({
            viewport,
            metrics: roundedMetrics(metrics),
        });

        expect(metrics.header.present).toBe(true);
        expect(metrics.header.rect.height).toBeGreaterThanOrEqual(44);
        expect(metrics.horizontalOverflow).toBe(false);
        expect(metrics.overlappingVisibleControls).toEqual([]);

        expect(metrics.logo.visible).toBe(true);
        expect(metrics.logo.href).toBe('/');

        expect(metrics.navigation.visible).toBe(true);
        expect(metrics.navigation.items.map((item) => item.label)).toEqual([
            'Home',
            'Catalog',
            'Manuals',
            'Contact',
        ]);

        for (const item of metrics.navigation.items) {
            expect(normalizeText(item.label).length).toBeGreaterThan(0);
            expect(hasTechnicalIdentifier(item.label)).toBe(false);
            expect(item.clipped).toBe(false);
        }

        expect(metrics.search.visible).toBe(true);
        expect(metrics.search.ariaLabel).toMatch(/search/i);
        expect(metrics.search.rect.width).toBeGreaterThanOrEqual(44);
        expect(metrics.search.rect.height).toBeGreaterThanOrEqual(44);

        if (metrics.account.present) {
            expect(metrics.account.visible).toBe(true);
            expect(metrics.account.text || metrics.account.ariaLabel).toMatch(/log in|account/i);
        }

        expect(metrics.cart.visible).toBe(true);
        expect(metrics.cart.text || metrics.cart.ariaLabel).toMatch(/cart/i);
        expect(metrics.cartNotificationPresent).toBe(true);
    });
}

test('desktop search opens, submits, closes, and returns focus', async ({ page }) => {
    await page.setViewportSize({
        width: 1440,
        height: 900,
    });

    await gotoUnlocked(page, '/', 'desktop search behavior');
    await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});

    const searchToggle = page.locator('summary.header__icon--search').first();
    const searchModal = page.locator('.search-modal[role="dialog"]').first();
    const searchInput = page.locator('.search-modal input[name="q"]').first();
    const closeButton = page.locator('.search-modal__close-button').first();

    await searchToggle.focus();
    await expect(searchToggle).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(searchModal).toBeVisible();
    await expect(searchInput).toBeFocused();

    await closeButton.click();
    await expect(searchModal).not.toBeVisible();
    await expect(searchToggle).toBeFocused();

    await searchToggle.focus();
    await page.keyboard.press('Enter');
    await expect(searchInput).toBeFocused();
    await searchInput.fill('rhino');

    await Promise.all([
        page.waitForURL(/\/search\?q=rhino/),
        page.keyboard.press('Enter'),
    ]);

    await expect(page.locator('main, #MainContent').first()).toContainText(/search/i);
});

test('sticky desktop header keeps utility controls reachable after scroll', async ({ page }) => {
    await page.setViewportSize({
        width: 1440,
        height: 900,
    });

    await gotoUnlocked(page, '/', 'desktop sticky header');
    await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});

    await page.evaluate(() => window.scrollTo(0, Math.min(document.body.scrollHeight, 900)));
    await page.waitForTimeout(300);

    const stickyState = await page.evaluate(() => {
        const sectionHeader = document.querySelector('.section-header');
        const search = document.querySelector('summary.header__icon--search');
        const headerRect = sectionHeader?.getBoundingClientRect();
        const searchRect = search?.getBoundingClientRect();

        return {
            sectionHeaderClasses: sectionHeader?.className || '',
            sectionHeaderTop: headerRect?.top || 0,
            searchVisibleInViewport: Boolean(
                searchRect
                && searchRect.top >= 0
                && searchRect.bottom <= window.innerHeight
            ),
        };
    });

    expect(stickyState.sectionHeaderClasses).toContain('shopify-section-header-sticky');
    expect(Math.abs(stickyState.sectionHeaderTop)).toBeLessThanOrEqual(1);
    expect(stickyState.searchVisibleInViewport).toBe(true);
});
