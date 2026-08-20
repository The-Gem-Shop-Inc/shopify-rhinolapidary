'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('@playwright/test');
const {
    StorefrontChallengeError,
    gotoUnlocked,
} = require('../tests/helpers/storefront-auth');

try {
    require('dotenv').config();
} catch {
    // CI may provide environment variables directly.
}

const ROOT = path.resolve(__dirname, '..');
const RESULT_ROOT = path.join(ROOT, 'test-results', 'epic-c', 'batch-5');
const EVIDENCE_ROOT = path.join(ROOT, 'docs', 'qa', 'evidence', 'epic-c');
const DATE_PREFIX = new Date().toISOString().slice(0, 10);

function safeTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

const VIEWPORTS = [
    {
        id: 'mobile-360',
        width: 360,
        height: 800,
        required: true,
    },
    {
        id: 'mobile-390',
        width: 390,
        height: 844,
        required: true,
    },
    {
        id: 'tablet-768',
        width: 768,
        height: 1024,
        required: true,
    },
    {
        id: 'desktop-1440',
        width: 1440,
        height: 900,
        required: true,
    },
    {
        id: 'desktop-1920',
        width: 1920,
        height: 1080,
        required: true,
    },
];

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function routePlan() {
    const fixtures = readJson('tests/fixtures/storefront-fixtures.json').fixtures || {};

    return [
        {
            id: 'homepage',
            category: 'homepage',
            path: fixtures.homepage?.path || '/',
            required: true,
        },
        {
            id: 'collection',
            category: 'collection',
            path: fixtures.collection?.path,
            required: true,
            source: 'tests/fixtures/storefront-fixtures.json#collection',
        },
        {
            id: 'search',
            category: 'search',
            path: fixtures.search?.path,
            required: true,
            source: 'tests/fixtures/storefront-fixtures.json#search',
        },
        {
            id: 'product',
            category: 'product',
            path: fixtures.simpleProduct?.path,
            required: true,
            source: 'tests/fixtures/storefront-fixtures.json#simpleProduct',
        },
        {
            id: 'cart',
            category: 'cart',
            path: fixtures.cart?.path || '/cart',
            required: true,
            source: 'tests/fixtures/storefront-fixtures.json#cart',
        },
        {
            id: 'contact',
            category: 'contact',
            path: fixtures.contact?.path,
            required: true,
            source: 'tests/fixtures/storefront-fixtures.json#contact',
        },
        {
            id: 'policy',
            category: 'policy',
            path: '/policies/privacy-policy',
            required: true,
            source: 'data/navigation-spec.json#privacy-policy',
        },
        {
            id: 'refund-policy',
            category: 'policy',
            path: '/policies/refund-policy',
            required: true,
            source: 'data/navigation-spec.json#refund-policy',
        },
        {
            id: 'shipping-policy',
            category: 'policy',
            path: '/policies/shipping-policy',
            required: true,
            source: 'data/navigation-spec.json#shipping-policy',
        },
        {
            id: 'legal-notice',
            category: 'policy',
            path: '/policies/legal-notice',
            required: true,
            source: 'data/navigation-spec.json#legal-notice',
        },
        {
            id: 'manual-em-1',
            category: 'support',
            path: '/pages/em-1-manual',
            required: true,
            source: 'data/navigation-spec.json#manual-em-1',
        },
    ];
}

function safeFilePart(value) {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function relative(filePath) {
    return path.relative(ROOT, filePath).replaceAll('\\', '/');
}

async function screenshot(page, route, viewport, state) {
    fs.mkdirSync(EVIDENCE_ROOT, { recursive: true });
    const filePath = path.join(
        EVIDENCE_ROOT,
        `${DATE_PREFIX}-epic-c-${safeFilePart(route.id)}-${safeFilePart(viewport.id)}-${safeFilePart(state)}.png`,
    );

    await page.screenshot({
        path: filePath,
        fullPage: false,
    });

    return relative(filePath);
}

async function waitForSettledPage(page) {
    await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});
    await page.evaluate(async () => {
        if (document.fonts?.ready) {
            await document.fonts.ready;
        }
    }).catch(() => {});
    await page.waitForTimeout(250);
}

async function collectGeometry(page, stateId) {
    return page.evaluate((state) => {
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
                top: Math.round(rect.top * 100) / 100,
                right: Math.round(rect.right * 100) / 100,
                bottom: Math.round(rect.bottom * 100) / 100,
                left: Math.round(rect.left * 100) / 100,
                width: Math.round(rect.width * 100) / 100,
                height: Math.round(rect.height * 100) / 100,
            };
        }

        function textFor(element) {
            return (
                element?.innerText
                || element?.getAttribute('aria-label')
                || element?.textContent
                || ''
            ).replace(/\s+/g, ' ').trim();
        }

        function overlap(left, right) {
            return (
                left.left < right.right
                && left.right > right.left
                && left.top < right.bottom
                && left.bottom > right.top
            );
        }

        function pairOverlaps(entries) {
            const pairs = [];

            for (let leftIndex = 0; leftIndex < entries.length; leftIndex += 1) {
                for (let rightIndex = leftIndex + 1; rightIndex < entries.length; rightIndex += 1) {
                    const left = entries[leftIndex];
                    const right = entries[rightIndex];

                    if (left.element.contains(right.element) || right.element.contains(left.element)) {
                        continue;
                    }

                    if (overlap(left.rect, right.rect)) {
                        pairs.push({
                            left: left.label || left.selector,
                            right: right.label || right.selector,
                        });
                    }
                }
            }

            return pairs;
        }

        const header = document.querySelector('header.header');
        const sectionHeader = document.querySelector('.section-header');
        const footer = document.querySelector('footer');
        const drawer = document.querySelector('#menu-drawer');
        const breadcrumb = document.querySelector('nav.rhino-breadcrumb');
        const searchModal = document.querySelector('.search-modal[role="dialog"]');
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const headerControls = [...document.querySelectorAll(
            'header.header a, header.header summary, header.header button',
        )]
            .filter((element) => visible(element) && !element.closest('.search-modal'))
            .map((element) => ({
                element,
                selector: element.id || element.className || element.tagName.toLowerCase(),
                label: textFor(element),
                rect: rectFor(element),
                clipped: element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight,
            }));

        const navItems = [...document.querySelectorAll(
            '.header__inline-menu a, .header__inline-menu summary, '
            + '#menu-drawer a, #menu-drawer summary, #menu-drawer button',
        )]
            .filter(visible)
            .map((element) => ({
                element,
                selector: element.id || element.className || element.tagName.toLowerCase(),
                label: textFor(element),
                rect: rectFor(element),
                clipped: element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight,
            }));

        const footerColumns = [...document.querySelectorAll(
            'footer .footer-block, footer .footer__content-bottom-wrapper, footer .footer__localization',
        )]
            .filter(visible)
            .map((element, index) => ({
                index,
                label: textFor(element).slice(0, 80),
                rect: rectFor(element),
                overflowX: element.scrollWidth > element.clientWidth + 1,
            }));

        const headerRect = rectFor(header);
        const drawerRect = rectFor(drawer);
        const searchRect = rectFor(searchModal);
        const sectionHeaderRect = rectFor(sectionHeader);
        const activeRect = rectFor(document.activeElement);
        const activeText = textFor(document.activeElement);
        const focusedOutsideHeader =
            Boolean(document.activeElement)
            && document.activeElement !== document.body
            && !sectionHeader?.contains(document.activeElement)
            && visible(document.activeElement);

        const failures = [];

        if (document.documentElement.scrollWidth > viewportWidth + 1) {
            failures.push('horizontal-page-overflow');
        }

        const overlappingHeaderControls = pairOverlaps(headerControls);
        if (overlappingHeaderControls.length > 0) {
            failures.push('header-controls-overlap');
        }

        if (navItems.some((item) => item.clipped)) {
            failures.push('navigation-label-clipped');
        }

        const overlappingNavItems = pairOverlaps(navItems);
        if (overlappingNavItems.length > 0) {
            failures.push('menu-labels-overlap');
        }

        if (
            drawerRect
            && visible(drawer)
            && (
                drawerRect.left < -1
                || drawerRect.right > viewportWidth + 1
                || drawerRect.bottom > viewportHeight + 1
            )
        ) {
            failures.push('drawer-clipped');
        }

        if (
            searchRect
            && visible(searchModal)
            && (
                searchRect.left < -1
                || searchRect.right > viewportWidth + 1
                || searchRect.bottom > viewportHeight + 1
            )
        ) {
            failures.push('search-modal-clipped');
        }

        if (footer && footer.scrollWidth > viewportWidth + 1) {
            failures.push('footer-overflows-viewport');
        }

        if (footerColumns.some((column) => column.overflowX)) {
            failures.push('footer-column-overflow');
        }

        if (
            state === 'sticky-header'
            && focusedOutsideHeader
            && activeRect
            && sectionHeaderRect
            && activeRect.top < sectionHeaderRect.bottom
        ) {
            failures.push('sticky-header-obscures-focused-control');
        }

        return {
            state,
            viewport: {
                width: viewportWidth,
                height: viewportHeight,
                scrollWidth: document.documentElement.scrollWidth,
            },
            horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 1,
            header: {
                present: Boolean(header),
                visible: visible(header),
                rect: headerRect,
                sectionRect: sectionHeaderRect,
                overlappingControls: overlappingHeaderControls,
            },
            navigation: {
                itemCount: navItems.length,
                clippedItems: navItems
                    .filter((item) => item.clipped)
                    .map((item) => item.label || item.selector),
                overlappingItems: overlappingNavItems,
            },
            drawer: {
                visible: visible(drawer),
                rect: drawerRect,
            },
            search: {
                visible: visible(searchModal),
                rect: searchRect,
            },
            breadcrumb: {
                visible: visible(breadcrumb),
                rect: rectFor(breadcrumb),
                overflowX: breadcrumb
                    ? breadcrumb.scrollWidth > breadcrumb.clientWidth + 1
                    : false,
            },
            footer: {
                present: Boolean(footer),
                visible: visible(footer),
                rect: rectFor(footer),
                columns: footerColumns.map(({ element, ...column }) => column),
            },
            activeElement: {
                text: activeText,
                rect: activeRect,
                focusedOutsideHeader,
            },
            failures,
        };
    }, stateId);
}

async function recordState(page, report, route, viewport, stateId, options = {}) {
    const geometry = await collectGeometry(page, stateId);
    const screenshotPath = options.screenshot
        ? await screenshot(page, route, viewport, stateId)
        : null;
    const status = geometry.failures.length === 0
        ? 'passed'
        : 'failed';

    const state = {
        id: stateId,
        status,
        screenshot: screenshotPath,
        geometry,
        requiredWidthFailure: geometry.failures.some((failure) => (
            /overflow|overlap|clipped|obscures/.test(failure)
        )),
    };

    report.states.push(state);

    return state;
}

async function openSearch(page) {
    const toggle = page.locator('summary.header__icon--search:visible').first();

    if (!await toggle.isVisible({ timeout: 1000 }).catch(() => false)) {
        return false;
    }

    await toggle.click();
    await page.locator('.search-modal[role="dialog"]:visible').waitFor({
        state: 'visible',
        timeout: 5000,
    });
    await page.waitForTimeout(250);

    return true;
}

async function closeSearch(page) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.locator('.search-modal[role="dialog"]:visible').waitFor({
        state: 'hidden',
        timeout: 5000,
    }).catch(() => {});
}

async function openMobileDrawer(page) {
    const trigger = page.locator('summary.header__icon--menu').first();

    if (!await trigger.isVisible({ timeout: 1000 }).catch(() => false)) {
        return false;
    }

    await trigger.click();
    await page.locator('#menu-drawer').waitFor({
        state: 'visible',
        timeout: 5000,
    });
    await page.waitForTimeout(700);

    return true;
}

async function closeMobileDrawer(page) {
    await page.keyboard.press('Escape').catch(() => {});
    await page.locator('#menu-drawer').waitFor({
        state: 'hidden',
        timeout: 5000,
    }).catch(() => {});
}

async function openMegaMenu(page) {
    const summary = page.locator('details.mega-menu > summary:visible').first();

    if (!await summary.isVisible({ timeout: 1000 }).catch(() => false)) {
        return false;
    }

    await summary.click();
    await page.locator('.mega-menu__content:visible').first().waitFor({
        state: 'visible',
        timeout: 5000,
    });
    await page.waitForTimeout(250);

    return true;
}

async function closeMegaMenu(page) {
    await page.keyboard.press('Escape').catch(() => {});
}

async function openNestedDrawer(page) {
    const nestedSummary = page.locator('#menu-drawer .menu-drawer__navigation details > summary:visible').first();

    if (!await nestedSummary.isVisible({ timeout: 1000 }).catch(() => false)) {
        return false;
    }

    await nestedSummary.click();
    await page.locator('#menu-drawer .menu-drawer__submenu:visible').first().waitFor({
        state: 'visible',
        timeout: 5000,
    });
    await page.waitForTimeout(300);

    return true;
}

async function recordBlocked(report, stateId, blocker, dependencyId = null) {
    report.states.push({
        id: stateId,
        status: 'blocked',
        blocker,
        dependencyId,
        requiredWidthFailure: false,
    });
}

async function runRouteViewport(page, route, viewport) {
    const report = {
        route: {
            id: route.id,
            category: route.category,
            path: route.path,
            required: route.required,
            source: route.source || null,
        },
        viewport,
        states: [],
        status: 'passed',
    };

    if (!route.path) {
        report.status = route.required ? 'failed' : 'blocked';
        report.states.push({
            id: 'route-load',
            status: route.required ? 'failed' : 'blocked',
            blocker: `Missing route fixture for ${route.id}.`,
            requiredWidthFailure: false,
        });
        return report;
    }

    await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
    });
    await gotoUnlocked(page, route.path, `responsive ${route.id} ${viewport.id}`);
    await waitForSettledPage(page);

    await recordState(page, report, route, viewport, 'default-header', {
        screenshot: true,
    });

    await page.evaluate(() => window.scrollTo(0, Math.min(document.body.scrollHeight, 900)));
    await page.waitForTimeout(350);

    const mainFocusTarget = page.locator('main a:visible, main button:visible, main input:visible').first();
    if (await mainFocusTarget.isVisible({ timeout: 1000 }).catch(() => false)) {
        await mainFocusTarget.focus();
    }

    await recordState(page, report, route, viewport, 'sticky-header', {
        screenshot: true,
    });

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);

    if (viewport.width >= 990) {
        await recordState(page, report, route, viewport, 'desktop-primary-navigation');

        if (await openMegaMenu(page)) {
            await recordState(page, report, route, viewport, 'mega-menu-open', {
                screenshot: true,
            });
            await closeMegaMenu(page);
        } else {
            await recordBlocked(
                report,
                'mega-menu-open',
                'No rendered mega menu state exists for this viewport.',
            );
        }
    } else if (await openMobileDrawer(page)) {
        await recordState(page, report, route, viewport, 'mobile-drawer-open', {
            screenshot: true,
        });

        if (await openNestedDrawer(page)) {
            await recordState(page, report, route, viewport, 'nested-drawer-open', {
                screenshot: true,
            });
        } else {
            await recordBlocked(
                report,
                'nested-drawer-open',
                'No rendered nested mobile drawer state exists for this viewport.',
            );
        }

        await closeMobileDrawer(page);
    } else {
        await recordBlocked(
            report,
            'mobile-drawer-open',
            'Mobile drawer trigger is not rendered for this viewport.',
        );
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(250);

    if (await openSearch(page)) {
        await recordState(page, report, route, viewport, 'search-open', {
            screenshot: true,
        });
        await closeSearch(page);
    } else {
        await recordBlocked(report, 'search-open', 'Search trigger is not rendered.');
    }

    const breadcrumb = page.locator('nav.rhino-breadcrumb').first();

    if (await breadcrumb.isVisible({ timeout: 1000 }).catch(() => false)) {
        await breadcrumb.evaluate((element) => element.scrollIntoView({
            block: 'center',
        }));
        await recordState(page, report, route, viewport, 'breadcrumb-region', {
            screenshot: true,
        });
    } else {
        report.states.push({
            id: 'breadcrumb-region',
            status: route.id === 'homepage' ? 'not_applicable' : 'blocked',
            blocker: route.id === 'homepage'
                ? 'Homepage intentionally omits breadcrumbs.'
                : 'Breadcrumb region is not rendered.',
            requiredWidthFailure: false,
        });
    }

    const footer = page.locator('footer').first();
    await footer.evaluate((element) => element.scrollIntoView({
        block: 'start',
    }));
    await page.waitForTimeout(250);
    await recordState(page, report, route, viewport, 'footer-top', {
        screenshot: true,
    });

    await footer.evaluate((element) => element.scrollIntoView({
        block: 'end',
    }));
    await page.waitForTimeout(250);
    await recordState(page, report, route, viewport, 'footer-bottom', {
        screenshot: true,
    });

    const localizationControls = await page.evaluate(() => {
        function visible(element) {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);

            return (
                rect.width > 0
                && rect.height > 0
                && style.display !== 'none'
                && style.visibility !== 'hidden'
            );
        }

        return [...document.querySelectorAll(
            '.desktop-localization-wrapper button, .menu-drawer__localization button, .footer__localization button',
        )]
            .filter(visible)
            .map((button) => ({
                text: (button.innerText || button.textContent || button.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
                ariaExpanded: button.getAttribute('aria-expanded') || '',
            }));
    });

    report.states.push({
        id: 'localization-controls',
        status: 'passed',
        state: localizationControls.length > 0
            ? 'rendered'
            : 'shopify-suppressed',
        renderedControlCount: localizationControls.length,
        labels: localizationControls.map((control) => control.text),
        requiredWidthFailure: false,
    });

    const failedStates = report.states.filter((state) => state.status === 'failed');

    if (failedStates.length > 0) {
        report.status = 'failed';
    } else if (report.states.some((state) => state.status === 'blocked')) {
        report.status = 'passed_with_blocked_states';
    }

    return report;
}

function summarize(results) {
    return results.reduce((summary, result) => {
        summary.totalRouteViewports += 1;
        summary.byStatus[result.status] = (summary.byStatus[result.status] || 0) + 1;

        for (const state of result.states) {
            summary.totalStates += 1;
            summary.statesByStatus[state.status] = (summary.statesByStatus[state.status] || 0) + 1;

            if (state.requiredWidthFailure) {
                summary.requiredWidthFailures += 1;
            }
        }

        return summary;
    }, {
        totalRouteViewports: 0,
        totalStates: 0,
        requiredWidthFailures: 0,
        byStatus: {},
        statesByStatus: {},
    });
}

async function main() {
    fs.mkdirSync(RESULT_ROOT, { recursive: true });
    fs.mkdirSync(EVIDENCE_ROOT, { recursive: true });

    const browser = await chromium.launch({
        headless: true,
    });
    const page = await browser.newPage();
    const results = [];
    let environmentBlocked = false;

    try {
        for (const route of routePlan()) {
            for (const viewport of VIEWPORTS) {
                try {
                    results.push(await runRouteViewport(page, route, viewport));
                } catch (error) {
                    const blocked = error instanceof StorefrontChallengeError
                        || /challenge|captcha|429|throttling/i.test(error.message);

                    results.push({
                        route,
                        viewport,
                        status: blocked ? 'environment_blocked' : 'failed',
                        error: error.message,
                        states: [
                            {
                                id: 'route-load',
                                status: blocked ? 'environment_blocked' : 'failed',
                                blocker: blocked
                                    ? 'Shopify/Cloudflare preview challenge blocked responsive QA.'
                                    : error.message,
                                requiredWidthFailure: false,
                            },
                        ],
                    });

                    environmentBlocked = environmentBlocked || blocked;
                }
            }
        }
    } finally {
        await browser.close();
    }

    const report = {
        generatedAt: new Date().toISOString(),
        previewThemeId: process.env.PREVIEW_THEME_ID || null,
        evidenceRoot: relative(EVIDENCE_ROOT),
        resultRoot: relative(RESULT_ROOT),
        viewports: VIEWPORTS,
        routes: routePlan(),
        results,
        summary: summarize(results),
        approvalRule: 'Required width overflow, clipping, overlap, or sticky-focus obstruction failures block approval.',
    };

    const reportJson = `${JSON.stringify(report, null, 2)}\n`;
    const reportPath = path.join(RESULT_ROOT, 'responsive-global-chrome-qa.json');
    const timestampedReportPath = path.join(
        RESULT_ROOT,
        `responsive-global-chrome-qa-${safeTimestamp()}.json`,
    );

    fs.writeFileSync(reportPath, reportJson);
    fs.writeFileSync(timestampedReportPath, reportJson);

    console.log(`Epic C responsive QA report: ${relative(reportPath)}`);
    console.log(JSON.stringify(report.summary, null, 2));

    if (environmentBlocked) {
        process.exitCode = 2;
        return;
    }

    if (
        report.summary.byStatus.failed
        || report.summary.statesByStatus.failed
        || report.summary.requiredWidthFailures
    ) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(`Epic C responsive QA failed: ${error.stack || error.message}`);
    process.exitCode = /challenge|captcha|429|throttling/i.test(error.message)
        ? 2
        : 1;
});
