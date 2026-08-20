require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const {
    getFixture,
    gotoUnlocked,
    loadFixtures,
} = require('./helpers/storefront');

const ROOT = process.cwd();
const RESULT_ROOT = path.join(ROOT, 'test-results', 'epic-c', 'batch-5');
const footerGroup = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'sections', 'footer-group.json'), 'utf8'),
);
const accessibilityEvidence = [];

test.describe.configure({ mode: 'serial' });
test.setTimeout(180_000);

function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function isMobileProject(projectName) {
    return /mobile/i.test(projectName);
}

function viewportForProject(projectName) {
    if (isMobileProject(projectName)) {
        return {
            id: 'mobile-390',
            width: 390,
            height: 844,
        };
    }

    return {
        id: 'desktop-1440',
        width: 1440,
        height: 900,
    };
}

function routePlan() {
    const fixtures = loadFixtures();

    return [
        {
            id: 'homepage',
            category: 'homepage',
            path: getFixture('homepage').path,
            expectsBreadcrumb: false,
        },
        {
            id: 'collection',
            category: 'collection',
            path: getFixture('collection').path,
            expectsBreadcrumb: true,
        },
        {
            id: 'search',
            category: 'search',
            path: getFixture('search').path,
            expectsBreadcrumb: true,
        },
        {
            id: 'product',
            category: 'product',
            path: getFixture('simpleProduct').path,
            expectsBreadcrumb: true,
        },
        {
            id: 'cart',
            category: 'cart',
            path: getFixture('cart').path,
            expectsBreadcrumb: true,
        },
        {
            id: 'contact',
            category: 'contact',
            path: fixtures.fixtures.contact?.path || '/pages/contact',
            expectsBreadcrumb: true,
        },
        {
            id: 'policy',
            category: 'policy',
            path: '/policies/privacy-policy',
            expectsBreadcrumb: true,
        },
        {
            id: 'refund-policy',
            category: 'policy',
            path: '/policies/refund-policy',
            expectsBreadcrumb: true,
        },
        {
            id: 'shipping-policy',
            category: 'policy',
            path: '/policies/shipping-policy',
            expectsBreadcrumb: true,
        },
        {
            id: 'legal-notice',
            category: 'policy',
            path: '/policies/legal-notice',
            expectsBreadcrumb: true,
        },
        {
            id: 'manual-em-1',
            category: 'support',
            path: '/pages/em-1-manual',
            expectsBreadcrumb: true,
        },
    ];
}

function record(entry) {
    accessibilityEvidence.push({
        generatedAt: new Date().toISOString(),
        ...entry,
    });
}

async function visibleNameFailures(page, selector) {
    return page.locator(selector).evaluateAll((elements) => {
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

        function nameFor(element) {
            const labelledby = element.getAttribute('aria-labelledby');
            const labelledbyText = labelledby
                ? labelledby
                    .split(/\s+/)
                    .map((id) => document.getElementById(id)?.textContent || '')
                    .join(' ')
                : '';

            return (
                element.getAttribute('aria-label')
                || labelledbyText
                || element.innerText
                || element.textContent
                || ''
            ).replace(/\s+/g, ' ').trim();
        }

        return elements
            .filter(visible)
            .map((element, index) => ({
                index,
                tagName: element.tagName.toLowerCase(),
                className: String(element.className || ''),
                href: element.getAttribute('href') || '',
                name: nameFor(element),
            }))
            .filter((entry) => entry.name.length === 0);
    });
}

async function axeChrome(page, context) {
    const results = await new AxeBuilder({ page })
        .exclude('#PBarNextFrame')
        .analyze();
    const serious = results.violations.filter((violation) => (
        violation.impact === 'serious'
    ));
    const critical = results.violations.filter((violation) => (
        violation.impact === 'critical'
    ));

    record({
        ...context,
        status: serious.length === 0 && critical.length === 0
            ? 'passed'
            : 'failed',
        axeSeriousCount: serious.length,
        axeCriticalCount: critical.length,
        axeViolationIds: [...serious, ...critical].map((violation) => violation.id),
    });

    expect(
        [...serious, ...critical],
        JSON.stringify([...serious, ...critical], null, 2),
    ).toEqual([]);
}

async function focusState(page, locator) {
    await locator.evaluate((element) => {
        element.scrollIntoView({
            block: 'center',
            inline: 'center',
        });
    });
    await page.keyboard.press('Tab');
    await locator.focus();
    await expect(locator).toBeFocused();

    return locator.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const outlineWidth = Number.parseFloat(style.outlineWidth) || 0;
        const hasOutline = (
            outlineWidth > 0
            && style.outlineStyle !== 'none'
            && style.outlineColor !== 'transparent'
        );
        const hasShadow = (
            style.boxShadow
            && style.boxShadow !== 'none'
            && style.boxShadow !== 'rgba(0, 0, 0, 0) 0px 0px 0px 0px'
        );

        return {
            focused: document.activeElement === element,
            focusVisible: element.matches(':focus-visible') || element.classList.contains('focused'),
            outlineStyle: style.outlineStyle,
            outlineWidth,
            outlineColor: style.outlineColor,
            boxShadow: style.boxShadow,
            visible: rect.width > 0 && rect.height > 0,
            hasIndicator: hasOutline || hasShadow,
        };
    });
}

async function assertFocusIndicator(page, locator, context) {
    const state = await focusState(page, locator);

    record({
        ...context,
        status: state.focused && state.visible && state.hasIndicator
            ? 'passed'
            : 'failed',
        axeSeriousCount: null,
        axeCriticalCount: null,
        focusState: state,
    });

    expect(state.focused).toBe(true);
    expect(state.visible).toBe(true);
    expect(state.hasIndicator).toBe(true);
}

async function tabUntil(page, selector, maxTabs = 35) {
    for (let index = 0; index < maxTabs; index += 1) {
        const reached = await page.evaluate((targetSelector) => {
            const active = document.activeElement;

            return Boolean(active?.matches(targetSelector) || active?.closest(targetSelector));
        }, selector);

        if (reached) {
            return true;
        }

        await page.keyboard.press('Tab');
    }

    return page.evaluate((targetSelector) => {
        const active = document.activeElement;

        return Boolean(active?.matches(targetSelector) || active?.closest(targetSelector));
    }, selector);
}

async function openSearchWithKeyboard(page) {
    const searchToggle = page.locator('summary.header__icon--search:visible').first();

    await expect(searchToggle).toBeVisible();
    await expect(searchToggle).toHaveAccessibleName(/search/i);
    await searchToggle.focus();
    await expect(searchToggle).toBeFocused();
    await page.keyboard.press('Enter');

    const searchModal = page.locator('.search-modal[role="dialog"]:visible').first();
    const searchInput = searchModal.locator('input[name="q"]').first();

    await expect(searchModal).toBeVisible();
    await expect(searchModal).toHaveAccessibleName(/search/i);
    await expect(searchInput).toBeFocused();
    await expect(searchInput).toHaveAccessibleName(/search/i);

    return {
        searchToggle,
        searchModal,
        searchInput,
    };
}

async function closeSearchWithEscape(page, searchToggle, searchModal) {
    await page.keyboard.press('Escape');
    await expect(searchModal).not.toBeVisible();
    await expect(searchToggle).toBeFocused();
}

async function openDrawerWithKeyboard(page) {
    const trigger = page.locator('summary.header__icon--menu').first();

    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAccessibleName(/menu/i);
    await trigger.focus();
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Enter');
    await page.locator('#menu-drawer').waitFor({
        state: 'visible',
        timeout: 10_000,
    });
    await page.waitForTimeout(950);

    return trigger;
}

async function drawerFocusInside(page) {
    return page.evaluate(() => (
        document
            .querySelector('#Details-menu-drawer-container')
            ?.contains(document.activeElement) || false
    ));
}

async function collectLocalizationControls(page) {
    return page.evaluate(() => {
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

        function textFor(element) {
            return (
                element.innerText
                || element.getAttribute('aria-label')
                || element.textContent
                || ''
            ).replace(/\s+/g, ' ').trim();
        }

        return [...document.querySelectorAll(
            '.desktop-localization-wrapper button, '
            + '.menu-drawer__localization button, '
            + '.footer__localization button',
        )]
            .filter(visible)
            .map((button) => ({
                text: textFor(button),
                ariaExpanded: button.getAttribute('aria-expanded') || '',
                describedBy: button.getAttribute('aria-describedby') || '',
            }));
    });
}

for (const route of routePlan()) {
    test(`${route.id} global chrome default state has landmarks, names, and no serious axe violations`, async ({ page }, testInfo) => {
        const project = testInfo.project.name;
        const viewport = viewportForProject(project);

        await page.setViewportSize({
            width: viewport.width,
            height: viewport.height,
        });
        await gotoUnlocked(page, route.path, `${route.id} global chrome a11y`);
        await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});

        await expect(page.getByRole('banner').first()).toBeVisible();
        await expect(page.getByRole('main').first()).toBeVisible();
        await expect(page.getByRole('contentinfo').first()).toBeVisible();

        if (route.expectsBreadcrumb) {
            await expect(page.getByRole('navigation', { name: /breadcrumb/i })).toBeVisible();
        } else {
            await expect(page.getByRole('navigation', { name: /breadcrumb/i })).toHaveCount(0);
        }

        const missingNames = [
            ...await visibleNameFailures(page, 'header a, header summary, header button'),
            ...await visibleNameFailures(page, 'footer a, footer button, footer input'),
            ...await visibleNameFailures(page, 'nav.rhino-breadcrumb a'),
        ];

        record({
            project,
            route: route.id,
            routeCategory: route.category,
            viewport: viewport.id,
            component: 'global-chrome',
            state: 'default',
            status: missingNames.length === 0 ? 'passed' : 'failed',
            axeSeriousCount: null,
            axeCriticalCount: null,
            missingAccessibleNames: missingNames,
        });

        expect(
            missingNames,
            `Global chrome controls without meaningful names:\n${JSON.stringify(missingNames, null, 2)}`,
        ).toEqual([]);

        await axeChrome(page, {
            project,
            route: route.id,
            routeCategory: route.category,
            viewport: viewport.id,
            component: 'global-chrome',
            state: 'default',
        });
    });
}

test('desktop header, primary navigation, search, mega menu, and footer keyboard states are accessible', async ({ page }, testInfo) => {
    test.skip(isMobileProject(testInfo.project.name), 'Desktop-only global chrome accessibility path.');

    const project = testInfo.project.name;
    const viewport = viewportForProject(project);

    await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
    });
    await gotoUnlocked(page, '/', 'desktop global chrome accessibility');
    await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});

    const reachedNavigation = await tabUntil(page, '.header__inline-menu');

    record({
        project,
        route: 'homepage',
        routeCategory: 'homepage',
        viewport: viewport.id,
        component: 'desktop-primary-navigation',
        state: 'tab-reach',
        status: reachedNavigation ? 'passed' : 'failed',
        axeSeriousCount: null,
        axeCriticalCount: null,
    });

    expect(reachedNavigation).toBe(true);

    const navigationItems = page.locator('.header__inline-menu a:visible, .header__inline-menu summary:visible');
    const navigationItemCount = await navigationItems.count();
    expect(navigationItemCount).toBeGreaterThan(0);

    for (let index = 0; index < navigationItemCount; index += 1) {
        const item = navigationItems.nth(index);
        await expect(item).toHaveAccessibleName(/.+/);
        await assertFocusIndicator(page, item, {
            project,
            route: 'homepage',
            routeCategory: 'homepage',
            viewport: viewport.id,
            component: 'desktop-primary-navigation',
            state: `focus-${index}`,
        });
    }

    await assertFocusIndicator(page, page.locator('summary.header__icon--search:visible').first(), {
        project,
        route: 'homepage',
        routeCategory: 'homepage',
        viewport: viewport.id,
        component: 'search-trigger',
        state: 'focus',
    });
    await assertFocusIndicator(page, page.locator('a.header__icon--cart:visible').first(), {
        project,
        route: 'homepage',
        routeCategory: 'homepage',
        viewport: viewport.id,
        component: 'cart-affordance',
        state: 'focus',
    });

    const accountLink = page.locator('a.header__icon--account:visible').first();
    if (await accountLink.isVisible({ timeout: 1500 }).catch(() => false)) {
        await expect(accountLink).toHaveAccessibleName(/log in|account/i);
        await assertFocusIndicator(page, accountLink, {
            project,
            route: 'homepage',
            routeCategory: 'homepage',
            viewport: viewport.id,
            component: 'account-affordance',
            state: 'focus',
        });
    }

    const search = await openSearchWithKeyboard(page);
    await axeChrome(page, {
        project,
        route: 'homepage',
        routeCategory: 'homepage',
        viewport: viewport.id,
        component: 'search-ui',
        state: 'open',
    });
    await closeSearchWithEscape(page, search.searchToggle, search.searchModal);

    const megaSummary = page.locator('details.mega-menu > summary:visible').first();

    if (await megaSummary.count() === 0 || !await megaSummary.isVisible({ timeout: 1500 }).catch(() => false)) {
        record({
            project,
            route: 'homepage',
            routeCategory: 'homepage',
            viewport: viewport.id,
            component: 'mega-menu',
            state: 'open',
            status: 'blocked',
            blocker: 'No rendered desktop mega menu fixture is available.',
            axeSeriousCount: null,
            axeCriticalCount: null,
        });
    } else {
        await megaSummary.focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('.mega-menu__content:visible').first()).toBeVisible();
        await axeChrome(page, {
            project,
            route: 'homepage',
            routeCategory: 'homepage',
            viewport: viewport.id,
            component: 'mega-menu',
            state: 'open',
        });
        await page.keyboard.press('Escape');
        await expect(megaSummary).toBeFocused();
    }

    const footerLinks = page.locator('footer a:visible');
    const firstFooterLink = footerLinks.first();
    await expect(firstFooterLink).toBeVisible();
    await expect(firstFooterLink).toHaveAccessibleName(/.+/);
    await assertFocusIndicator(page, firstFooterLink, {
        project,
        route: 'homepage',
        routeCategory: 'homepage',
        viewport: viewport.id,
        component: 'footer-navigation',
        state: 'focus',
    });
});

test('mobile drawer, nested disclosures, search, account, cart, localization, and footer states are accessible', async ({ page }, testInfo) => {
    test.skip(!isMobileProject(testInfo.project.name), 'Mobile-only drawer accessibility path.');

    const project = testInfo.project.name;
    const viewport = viewportForProject(project);

    await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
    });
    await gotoUnlocked(page, '/', 'mobile global chrome accessibility');
    await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});

    const trigger = await openDrawerWithKeyboard(page);
    await expect(await drawerFocusInside(page)).toBe(true);

    const drawerItems = page.locator('#menu-drawer a:visible, #menu-drawer summary:visible, #menu-drawer button:visible');
    const drawerItemCount = await drawerItems.count();
    expect(drawerItemCount).toBeGreaterThan(0);

    for (let index = 0; index < Math.min(drawerItemCount, 8); index += 1) {
        await page.keyboard.press('Tab');
        await expect(await drawerFocusInside(page)).toBe(true);
    }

    await axeChrome(page, {
        project,
        route: 'homepage',
        routeCategory: 'homepage',
        viewport: viewport.id,
        component: 'mobile-drawer',
        state: 'open',
    });

    const nestedSummary = page.locator('#menu-drawer .menu-drawer__navigation details > summary:visible').first();
    let nestedSubmenuOpened = false;

    if (await nestedSummary.count() === 0 || !await nestedSummary.isVisible({ timeout: 1500 }).catch(() => false)) {
        record({
            project,
            route: 'homepage',
            routeCategory: 'homepage',
            viewport: viewport.id,
            component: 'nested-mobile-disclosure',
            state: 'open',
            status: 'blocked',
            blocker: 'No rendered nested mobile menu fixture is available.',
            axeSeriousCount: null,
            axeCriticalCount: null,
        });
    } else {
        await nestedSummary.focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#menu-drawer .menu-drawer__submenu:visible').first()).toBeVisible();
        nestedSubmenuOpened = true;
        await axeChrome(page, {
            project,
            route: 'homepage',
            routeCategory: 'homepage',
            viewport: viewport.id,
            component: 'nested-mobile-disclosure',
            state: 'open',
        });
    }

    const drawerAccount = page.locator('.menu-drawer__account:visible, a.header__icon--account:visible').first();
    if (await drawerAccount.isVisible({ timeout: 1500 }).catch(() => false)) {
        await expect(drawerAccount).toHaveAccessibleName(/log in|account/i);
    }

    const localizationControls = await collectLocalizationControls(page);
    record({
        project,
        route: 'homepage',
        routeCategory: 'homepage',
        viewport: viewport.id,
        component: 'localization-controls',
        state: localizationControls.length > 0 ? 'rendered' : 'shopify-suppressed',
        status: 'passed',
        axeSeriousCount: null,
        axeCriticalCount: null,
        renderedControlCount: localizationControls.length,
        labels: localizationControls.map((control) => normalizeText(control.text)),
    });

    for (const control of localizationControls) {
        expect(normalizeText(control.text).length).toBeGreaterThan(0);
    }

    if (nestedSubmenuOpened) {
        await page.keyboard.press('Escape');
        await expect(page.locator('#menu-drawer')).toBeVisible();
        await expect(page.locator('#menu-drawer .menu-drawer__submenu:visible')).toHaveCount(0);
        await expect(nestedSummary.locator('xpath=..')).toHaveJSProperty('open', false);
        await expect(nestedSummary).toBeFocused();
    }

    await page.keyboard.press('Escape');
    await page.waitForTimeout(450);
    await expect(page.locator('#menu-drawer')).not.toBeVisible();
    await expect(trigger).toBeFocused();

    const search = await openSearchWithKeyboard(page);
    await axeChrome(page, {
        project,
        route: 'homepage',
        routeCategory: 'homepage',
        viewport: viewport.id,
        component: 'mobile-search-ui',
        state: 'open',
    });
    await closeSearchWithEscape(page, search.searchToggle, search.searchModal);

    await expect(page.locator('a.header__icon--cart:visible').first()).toHaveAccessibleName(/cart/i);
});

test('footer newsletter accessibility state is governed by current footer configuration', async ({ page }, testInfo) => {
    const project = testInfo.project.name;
    const viewport = viewportForProject(project);
    const newsletterEnabled = footerGroup.sections.footer.settings.newsletter_enable === true;

    await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
    });
    await gotoUnlocked(page, '/', 'footer newsletter accessibility');

    const newsletterForm = page.locator('footer form#ContactFooter, footer .newsletter-form').first();

    if (!newsletterEnabled) {
        await expect(newsletterForm).toHaveCount(0);
        record({
            project,
            route: 'homepage',
            routeCategory: 'homepage',
            viewport: viewport.id,
            component: 'footer-newsletter',
            state: 'disabled-by-footer-group',
            status: 'documented',
            axeSeriousCount: null,
            axeCriticalCount: null,
            source: 'sections/footer-group.json newsletter_enable=false',
        });
        return;
    }

    await expect(newsletterForm).toBeVisible();
    const email = newsletterForm.locator('input[type="email"]').first();
    const submit = newsletterForm.locator('button[type="submit"]').first();

    await expect(email).toHaveAccessibleName(/email/i);
    await expect(submit).toHaveAccessibleName(/subscribe|submit/i);
    await submit.click();
    await expect(email).toHaveAttribute('required', '');

    record({
        project,
        route: 'homepage',
        routeCategory: 'homepage',
        viewport: viewport.id,
        component: 'footer-newsletter',
        state: 'enabled-labels-and-required-state',
        status: 'passed',
        axeSeriousCount: null,
        axeCriticalCount: null,
    });
});

test.afterAll(() => {
    const project = accessibilityEvidence[0]?.project || 'unknown';
    fs.mkdirSync(RESULT_ROOT, { recursive: true });
    fs.writeFileSync(
        path.join(RESULT_ROOT, `global-chrome-accessibility-${project}.json`),
        `${JSON.stringify({
            suite: 'global-chrome-accessibility',
            previewThemeId: process.env.PREVIEW_THEME_ID || null,
            results: accessibilityEvidence,
            summary: accessibilityEvidence.reduce((summary, entry) => {
                summary.total += 1;
                summary.byStatus[entry.status] = (summary.byStatus[entry.status] || 0) + 1;

                if (entry.axeSeriousCount) {
                    summary.axeSeriousCount += entry.axeSeriousCount;
                }

                if (entry.axeCriticalCount) {
                    summary.axeCriticalCount += entry.axeCriticalCount;
                }

                return summary;
            }, {
                total: 0,
                axeSeriousCount: 0,
                axeCriticalCount: 0,
                byStatus: {},
            }),
        }, null, 2)}\n`,
    );
});
