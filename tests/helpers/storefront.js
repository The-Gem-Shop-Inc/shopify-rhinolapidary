const fs = require('fs');
const path = require('path');
const { expect } = require('@playwright/test');

function loadFixtures() {
    return JSON.parse(
        fs.readFileSync(
            path.join(process.cwd(), 'tests/fixtures/storefront-fixtures.json'),
            'utf8'
        )
    );
}

function storefrontUrl(routePath) {
    if (!process.env.PREVIEW_URL) {
        throw new Error('PREVIEW_URL must be set.');
    }

    const base = new URL(process.env.PREVIEW_URL);
    const target = new URL(routePath, base.origin);

    const allowedPreviewParams = new Set([
        'preview_theme_id',
        'preview_key'
    ]);

    for (const [key, value] of base.searchParams.entries()) {
        if (allowedPreviewParams.has(key) && !target.searchParams.has(key)) {
            target.searchParams.set(key, value);
        }
    }

    return target.toString();
}

async function gotoStorefront(page, routePath, label = routePath) {
    const response = await page.goto(storefrontUrl(routePath), {
        waitUntil: 'domcontentloaded',
    });

    expect(
        response?.status(),
        `${label} return HTTP ${response?.status()} at ${page.url()}`
    ).toBeLessThan(400);

    return response;
}

async function isPasswordPage(page) {
    const body = await page.locator('body').innerText().catch(() => '');

    return /enter using password|enter store using password|opening soon/i.test(body);
}

async function unlockStorefront(page) {
    await gotoStorefront(page, '/', 'password unlock homepage');

    if (!(await isPasswordPage(page))) {
        return;
    }

    const password = process.env.STOREFRONT_PASSWORD;

    if (!password) {
        throw new Error(
            'Storefront is password protected. Set STOREFRONT_PASSWORD in .env.'
        );
    }

    const revealPasswordForm = page.getByRole('button', {
        name: /enter using password/i,
    });

    if (await revealPasswordForm.isVisible().catch(() => false)) {
        await revealPasswordForm.click();
    }

    const passwordInput = page
        .locator('input[name="password"], input[type="password"]')
        .first();

    await expect(passwordInput, 'Password input should be visible').toBeVisible();

    await passwordInput.fill(password);

    const submit = page
        .getByRole('button', { name: /^enter$/i })
        .or(page.locator('button[type="submit"]'))
        .first();

    await submit.click();

    await page.waitForLoadState('domcontentloaded');

    expect(
        await isPasswordPage(page),
        'Storefront remained on password page after submitting password'
    ).toBe(false);
}

async function gotoUnlocked(page, routePath, label = routePath) {
    await gotoStorefront(page, routePath, label);

    if (await isPasswordPage(page)) {
        await unlockStorefront(page);
        await gotoStorefront(page, routePath, label);
    }

    expect(
        await isPasswordPage(page),
        `${label} is still showing the password page`
    ).toBe(false);
}

function getFixture(name) {
    const fixtures = loadFixtures();
    const fixture = fixtures.fixtures?.[name];

    if (!fixture) {
        throw new Error(`Missing storefront fixture "${name}".`);
    }

    if (!fixture.path || !fixture.path.startsWith('/')) {
        throw new Error(
            `Storefront fixture "${name}" must have a path beginning with "/". Got: ${fixture.path}`
        );
    }

    return fixture;
}

module.exports = {
    loadFixtures,
    getFixture,
    storefrontUrl,
    gotoStorefront,
    gotoUnlocked,
    unlockStorefront,
    isPasswordPage,
};