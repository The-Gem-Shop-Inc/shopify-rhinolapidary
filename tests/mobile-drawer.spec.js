require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const {
    gotoUnlocked,
} = require('./helpers/storefront');

const RESULT_ROOT = path.join(process.cwd(), 'test-results', 'epic-c', 'batch-2');
const mobileEvidence = [];
const globalNavigationIa = JSON.parse(
    fs.readFileSync(path.join(process.cwd(), 'data', 'global-navigation-ia.json'), 'utf8'),
);
const previewMenuIsolationDependency = globalNavigationIa.dependencies?.find(
    (dependency) => dependency.id === 'dep-preview-menu-isolation',
);

test.describe.configure({ mode: 'serial' });
test.setTimeout(150_000);

const mobileViewports = [
    { id: 'small-mobile', width: 360, height: 800 },
    { id: 'standard-mobile', width: 390, height: 844 },
    { id: 'large-mobile', width: 430, height: 932 },
    { id: 'tablet-portrait', width: 768, height: 1024 },
];

function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function hasTechnicalIdentifier(value) {
    return /\b(?:gid:\/\/|variant[_ -]?id|product[_ -]?id|collection[_ -]?id|metafield|metaobject|shopify--|default title)\b/i
        .test(value);
}

async function openDrawerWithKeyboard(page) {
    const trigger = page.locator('summary.header__icon--menu').first();

    await trigger.focus();
    await expect(trigger).toBeFocused();
    await page.keyboard.press('Enter');
    await page.locator('#menu-drawer').waitFor({
        state: 'visible',
        timeout: 10_000,
    });
    await page.waitForTimeout(650);

    return trigger;
}

async function waitForDrawerClosed(page) {
    await expect
        .poll(async () => page.locator('#Details-menu-drawer-container').evaluate((element) => (
            element.hasAttribute('open')
        )))
        .toBe(false);
}

async function drawerState(page) {
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
                width: Math.round(rect.width * 100) / 100,
                height: Math.round(rect.height * 100) / 100,
                top: Math.round(rect.top * 100) / 100,
                bottom: Math.round(rect.bottom * 100) / 100,
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

        const trigger = document.querySelector('summary.header__icon--menu');
        const container = document.querySelector('#Details-menu-drawer-container');
        const drawer = document.querySelector('#menu-drawer');
        const topItems = [...document.querySelectorAll('.menu-drawer__navigation > .menu-drawer__menu > li > a, .menu-drawer__navigation > .menu-drawer__menu > li > details > summary')]
            .filter(visible)
            .map((element) => ({
                text: textFor(element),
                rect: rectFor(element),
                ariaExpanded: element.getAttribute('aria-expanded') || '',
            }));
        const account = document.querySelector('.menu-drawer__account');
        const headerAccount = document.querySelector('a.header__icon--account');
        const localizationControls = [...document.querySelectorAll('.menu-drawer__localization button')]
            .filter(visible)
            .map((element) => ({
                text: textFor(element),
                ariaExpanded: element.getAttribute('aria-expanded') || '',
                rect: rectFor(element),
            }));

        return {
            trigger: {
                visible: visible(trigger),
                ariaLabel: trigger?.getAttribute('aria-label') || '',
                ariaExpanded: trigger?.getAttribute('aria-expanded') || '',
                rect: rectFor(trigger),
            },
            drawerVisible: visible(drawer),
            activeElementInsideDrawerContainer: Boolean(container?.contains(document.activeElement)),
            activeElementText: textFor(document.activeElement),
            bodyClasses: document.body.className,
            topItems,
            nestedSummaryCount: document.querySelectorAll('#menu-drawer .menu-drawer__navigation details > summary').length,
            account: {
                present: Boolean(account),
                visible: visible(account),
                text: textFor(account),
                rect: rectFor(account),
            },
            headerAccount: {
                present: Boolean(headerAccount),
                visible: visible(headerAccount),
                text: textFor(headerAccount),
                ariaLabel: headerAccount?.getAttribute('aria-label') || '',
                rect: rectFor(headerAccount),
            },
            localizationControls,
            horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        };
    });
}

test.afterAll(() => {
    fs.mkdirSync(RESULT_ROOT, { recursive: true });
    fs.writeFileSync(
        path.join(RESULT_ROOT, 'mobile-drawer-behavior.json'),
        `${JSON.stringify({
            suite: 'mobile-drawer',
            previewThemeId: process.env.PREVIEW_THEME_ID || null,
            route: '/',
            results: mobileEvidence,
        }, null, 2)}\n`,
    );
});

for (const viewport of mobileViewports) {
    test(`mobile drawer opens, traps focus, and closes at ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize({
            width: viewport.width,
            height: viewport.height,
        });

        await gotoUnlocked(page, '/', `mobile drawer ${viewport.id}`);
        await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});

        const trigger = page.locator('summary.header__icon--menu').first();
        await expect(trigger).toBeVisible();
        await expect(trigger).toHaveAttribute('aria-label', /menu/i);

        await openDrawerWithKeyboard(page);
        let state = await drawerState(page);

        expect(state.drawerVisible).toBe(true);
        expect(state.trigger.ariaExpanded).toBe('true');
        expect(state.activeElementInsideDrawerContainer).toBe(true);
        expect(state.bodyClasses).toContain('overflow-hidden-tablet');
        expect(state.horizontalOverflow).toBe(false);
        expect(state.topItems.length).toBeGreaterThan(0);

        for (const item of state.topItems) {
            expect(normalizeText(item.text).length).toBeGreaterThan(0);
            expect(hasTechnicalIdentifier(item.text)).toBe(false);
            expect(item.rect.height).toBeGreaterThanOrEqual(44);
        }

        expect(state.trigger.rect.width).toBeGreaterThanOrEqual(44);
        expect(state.trigger.rect.height).toBeGreaterThanOrEqual(44);

        for (let index = 0; index < state.topItems.length + 5; index += 1) {
            await page.keyboard.press('Tab');
            const focusInsideDrawer = await page.evaluate(() => (
                document.querySelector('#Details-menu-drawer-container')?.contains(document.activeElement)
            ));
            expect(focusInsideDrawer).toBe(true);
        }

        if (state.account.visible) {
            expect(state.account.visible).toBe(true);
            expect(state.account.text).toMatch(/log in|account/i);
            expect(state.account.rect.height).toBeGreaterThanOrEqual(44);
        } else if (state.account.present) {
            expect(state.headerAccount.visible).toBe(true);
            expect(state.headerAccount.text || state.headerAccount.ariaLabel).toMatch(/log in|account/i);
            expect(state.headerAccount.rect.height).toBeGreaterThanOrEqual(44);
        }

        for (const control of state.localizationControls) {
            expect(normalizeText(control.text).length).toBeGreaterThan(0);
            expect(control.rect.height).toBeGreaterThanOrEqual(44);
        }

        await trigger.click();
        await expect(page.locator('#menu-drawer')).not.toBeVisible();
        await waitForDrawerClosed(page);
        await expect(trigger).toBeFocused();
        state = await drawerState(page);
        expect(state.trigger.ariaExpanded).toBe('false');
        expect(state.bodyClasses).not.toContain('overflow-hidden-tablet');

        await openDrawerWithKeyboard(page);
        await page.keyboard.press('Escape');
        await page.waitForTimeout(450);
        await expect(page.locator('#menu-drawer')).not.toBeVisible();
        await waitForDrawerClosed(page);
        await expect(trigger).toBeFocused();
        state = await drawerState(page);
        expect(state.trigger.ariaExpanded).toBe('false');
        expect(state.bodyClasses).not.toContain('overflow-hidden-tablet');

        const axeResults = await new AxeBuilder({ page })
            .exclude('#PBarNextFrame')
            .analyze();
        const blockingViolations = axeResults.violations.filter((violation) => (
            ['serious', 'critical'].includes(violation.impact)
        ));

        expect(
            blockingViolations,
            JSON.stringify(blockingViolations, null, 2),
        ).toEqual([]);

        mobileEvidence.push({
            viewport,
            state,
            axeSeriousCriticalViolations: blockingViolations.length,
        });
    });
}

test('mobile nested drawer navigation follows the Trade submenu contract when Admin menu data provides children', async ({ page }, testInfo) => {
    if (previewMenuIsolationDependency && previewMenuIsolationDependency.status !== 'resolved') {
        const blockedEvidence = {
            viewport: { id: 'standard-mobile', width: 390, height: 844 },
            status: 'blocked',
            blocker: previewMenuIsolationDependency.description,
            dependencyId: previewMenuIsolationDependency.id,
        };

        fs.mkdirSync(RESULT_ROOT, { recursive: true });
        fs.writeFileSync(
            path.join(RESULT_ROOT, 'mobile-drawer-nested-blocker.json'),
            `${JSON.stringify(blockedEvidence, null, 2)}\n`,
        );

        testInfo.annotations.push({
            type: 'blocked',
            description: blockedEvidence.blocker,
        });
        test.skip(true, blockedEvidence.blocker);
    }

    await page.setViewportSize({
        width: 390,
        height: 844,
    });

    await gotoUnlocked(page, '/', 'mobile nested drawer');
    await page.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});

    await openDrawerWithKeyboard(page);

    const nestedSummary = page.locator('#menu-drawer .menu-drawer__navigation details > summary').first();
    const nestedCount = await nestedSummary.count();

    if (nestedCount === 0) {
        const blockedEvidence = {
            viewport: { id: 'standard-mobile', width: 390, height: 844 },
            status: 'blocked',
            blocker: 'Current preview menu did not render a nested mobile drawer disclosure.',
            renderedTopLevelItems: await page
                .locator('.menu-drawer__navigation > .menu-drawer__menu > li')
                .evaluateAll((items) => items.map((item) => item.innerText.replace(/\s+/g, ' ').trim())),
        };

        fs.mkdirSync(RESULT_ROOT, { recursive: true });
        fs.writeFileSync(
            path.join(RESULT_ROOT, 'mobile-drawer-nested-blocker.json'),
            `${JSON.stringify(blockedEvidence, null, 2)}\n`,
        );

        testInfo.annotations.push({
            type: 'blocked',
            description: blockedEvidence.blocker,
        });
        test.skip(true, blockedEvidence.blocker);
    }

    await expect(nestedSummary).toHaveText(/Catalog/);
    await nestedSummary.click();
    const submenu = nestedSummary.locator('xpath=following-sibling::*[contains(@class, "menu-drawer__submenu")]').first();
    await expect(submenu).toBeVisible();

    const submenuLinks = await submenu.locator('a:visible').evaluateAll((links) => (
        links.map((link) => ({
            label: (link.innerText || link.textContent || '').replace(/\s+/g, ' ').trim(),
            href: link.getAttribute('href'),
        }))
    ));
    expect(submenuLinks).toEqual([
        { label: 'Saws', href: '/collections/machines' },
        { label: 'Laps', href: '/collections/machines' },
        { label: 'Shaping', href: '/collections/machines' },
    ]);

    const closeButton = submenu.locator('.menu-drawer__close-button').first();
    await expect(closeButton).toBeVisible();
    await expect(closeButton).toHaveText(/Catalog/);
    await closeButton.click();
    await expect(nestedSummary).toBeFocused();
});
