require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const {
    getFixture,
    gotoUnlocked,
    unlockStorefront,
} = require('./helpers/storefront');

const RESULT_ROOT = path.join(process.cwd(), 'test-results', 'epic-c', 'batch-3');
const utilityEvidence = [];

test.describe.configure({ mode: 'serial' });
test.setTimeout(150_000);

const utilityViewports = [
    { id: 'mobile-small', width: 360, height: 800 },
    { id: 'desktop-standard', width: 1440, height: 900 },
];

function normalizeText(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
}

async function addFixtureProduct(page) {
    await gotoUnlocked(page, getFixture('simpleProduct').path, 'utility product fixture');
    const addToCart = page.getByRole('button', { name: /add to cart/i }).first();

    await expect(addToCart).toBeVisible();
    await expect(addToCart).toBeEnabled();
    await addToCart.click();

    const countBubble = page.locator('.cart-count-bubble').first();
    await expect(countBubble).toBeVisible({ timeout: 15_000 });

    const countText = normalizeText(await countBubble.innerText());
    const match = countText.match(/\d+/);

    expect(countText).toMatch(/\d+/);

    return Number.parseInt(match[0], 10);
}

async function openMobileDrawer(page) {
    const trigger = page.locator('summary.header__icon--menu').first();

    if (await trigger.isVisible({ timeout: 1500 }).catch(() => false)) {
        await trigger.click();
        await page.locator('#menu-drawer').waitFor({ state: 'visible', timeout: 10_000 });
    }
}

async function visibleAccountLink(page) {
    const headerLink = page.locator('a.header__icon--account:visible').first();

    if (await headerLink.isVisible({ timeout: 1500 }).catch(() => false)) {
        return headerLink;
    }

    await openMobileDrawer(page);
    return page.locator('.menu-drawer__account:visible').first();
}

async function collectLocalizationState(page) {
    return page.evaluate(() => {
        function visible(element) {
            if (!element) return false;
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
        }

        function textFor(element) {
            return (element?.innerText || element?.getAttribute('aria-label') || element?.textContent || '').replace(/\s+/g, ' ').trim();
        }

        return [...document.querySelectorAll('.desktop-localization-wrapper button, .menu-drawer__localization button')]
            .filter(visible)
            .map((button) => ({
                text: textFor(button),
                ariaExpanded: button.getAttribute('aria-expanded') || '',
                ariaDescribedby: button.getAttribute('aria-describedby') || '',
            }));
    });
}

test.beforeEach(async ({ page }) => {
    await unlockStorefront(page);
});

test.afterAll(() => {
    fs.mkdirSync(RESULT_ROOT, { recursive: true });
    fs.writeFileSync(
        path.join(RESULT_ROOT, 'global-utilities.json'),
        `${JSON.stringify({
            suite: 'global-utilities',
            previewThemeId: process.env.PREVIEW_THEME_ID || null,
            results: utilityEvidence,
        }, null, 2)}\n`,
    );
});

for (const viewport of utilityViewports) {
    test(`search, account, cart, and localization utilities at ${viewport.width}px`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await gotoUnlocked(page, '/', `global utilities ${viewport.id}`);

        const origin = new URL(page.url()).origin;
        const searchToggle = page.locator('summary.header__icon--search:visible').first();
        await expect(searchToggle).toBeVisible();
        await expect(searchToggle).toHaveAttribute('aria-label', /search/i);
        await searchToggle.focus();
        await expect(searchToggle).toBeFocused();
        await page.keyboard.press('Enter');

        const searchModal = page.locator('.search-modal[role="dialog"]:visible').first();
        const searchInput = searchModal.locator('input[name="q"]').first();
        await expect(searchModal).toBeVisible();
        await expect(searchInput).toBeFocused();
        await expect(searchInput).toHaveAccessibleName(/search/i);

        const closeButton = searchModal.locator('.search-modal__close-button').first();
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
        expect(new URL(page.url()).pathname).toBe('/search');

        await gotoUnlocked(page, '/', `global utilities cart empty ${viewport.id}`);
        const cartLink = page.locator('a.header__icon--cart:visible').first();
        await expect(cartLink).toBeVisible();
        await expect(cartLink).toHaveAccessibleName(/cart/i);
        const emptyCartName = await cartLink.evaluate((element) => element.innerText || element.getAttribute('aria-label') || element.textContent || '');
        expect(normalizeText(emptyCartName)).toMatch(/cart/i);

        const nonemptyItemCount = await addFixtureProduct(page);
        await gotoUnlocked(page, '/', `global utilities cart nonempty ${viewport.id}`);
        const filledCartLink = page.locator('a.header__icon--cart:visible').first();
        await expect(filledCartLink).toBeVisible();
        await expect(filledCartLink).toHaveAccessibleName(/cart/i);
        await expect(page.locator('.cart-count-bubble').first()).toBeVisible();
        await expect(page.locator('.cart-count-bubble .visually-hidden').first()).toContainText(/item/i);
        expect(nonemptyItemCount).toBeGreaterThan(0);
        expect(await page.locator('cart-notification').count()).toBeGreaterThan(0);

        const accountLink = await visibleAccountLink(page);
        await expect(accountLink).toBeVisible();
        await expect(accountLink).toHaveAccessibleName(/log in|account/i);
        const accountHref = await accountLink.getAttribute('href');
        expect(accountHref).toMatch(/\/account|\/customer_authentication\/redirect|shopify\.com\/authentication/i);
        const accountUrl = new URL(accountHref, origin);
        expect(accountUrl.pathname).not.toBe('/password');

        const localizationControls = await collectLocalizationState(page);
        for (const control of localizationControls) {
            expect(normalizeText(control.text).length).toBeGreaterThan(0);
            expect(control.text).not.toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);
        }

        if (localizationControls.length > 0) {
            const localizationButton = page.locator('.desktop-localization-wrapper button:visible, .menu-drawer__localization button:visible').first();
            await localizationButton.focus();
            await expect(localizationButton).toBeFocused();
            await page.keyboard.press('Enter');
            await expect(localizationButton).toHaveAttribute('aria-expanded', 'true');
            await page.keyboard.press('Escape');
            await expect(localizationButton).toBeFocused();
        }

        utilityEvidence.push({
            viewport,
            search: { visible: true, submittedPath: '/search' },
            cart: {
                emptyAccessibleName: normalizeText(emptyCartName),
                nonemptyItemCount,
                countAnnouncementVisible: true,
                notificationElementPresent: true,
            },
            account: {
                visible: true,
                href: accountUrl.origin === origin ? accountUrl.pathname : `${accountUrl.origin}${accountUrl.pathname}`,
            },
            localization: {
                renderedControlCount: localizationControls.length,
                state: localizationControls.length > 0 ? 'rendered and operable' : 'suppressed by Shopify store option count',
                labels: localizationControls.map((control) => normalizeText(control.text)),
            },
        });
    });
}
