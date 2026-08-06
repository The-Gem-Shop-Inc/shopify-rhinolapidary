'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const AUTH_DIRECTORY = path.join(ROOT, 'test-results', 'storefront-auth');
const STORAGE_STATE_PATH = path.join(AUTH_DIRECTORY, 'storage-state.json');
const SUPPORTED_PREVIEW_QUERY_PARAMS = new Set([
    'preview_theme_id',
    'preview_key',
    '_fd',
    'pb',
]);

const authStats = {
    cachedStateApplied: 0,
    passwordSubmissions: 0,
    storageStateWrites: 0,
};

class StorefrontAuthError extends Error {
    constructor(message) {
        super(message);
        this.name = 'StorefrontAuthError';
    }
}

class StorefrontInvalidPasswordError extends StorefrontAuthError {
    constructor(message) {
        super(message);
        this.name = 'StorefrontInvalidPasswordError';
    }
}

class StorefrontChallengeError extends StorefrontAuthError {
    constructor(message) {
        super(message);
        this.name = 'StorefrontChallengeError';
    }
}

function requiredPreviewUrl() {
    const value = process.env.PREVIEW_URL || process.env.PREVIEW_BASE_URL;

    if (!value) {
        throw new StorefrontAuthError(
            'PREVIEW_URL or PREVIEW_BASE_URL must be set.',
        );
    }

    return new URL(value);
}

function storefrontUrl(routePath = '/') {
    const base = requiredPreviewUrl();
    const target = new URL(routePath || '/', base.origin);

    for (const [key, value] of base.searchParams.entries()) {
        if (
            SUPPORTED_PREVIEW_QUERY_PARAMS.has(key)
            && !target.searchParams.has(key)
        ) {
            target.searchParams.set(key, value);
        }
    }

    if (
        process.env.PREVIEW_THEME_ID
        && !target.searchParams.has('preview_theme_id')
    ) {
        target.searchParams.set(
            'preview_theme_id',
            process.env.PREVIEW_THEME_ID,
        );
    }

    return target.toString();
}

function pathnameFromUrl(rawUrl) {
    try {
        return new URL(rawUrl).pathname;
    } catch {
        return '';
    }
}

async function bodyText(page) {
    return page.locator('body').innerText({ timeout: 1500 }).catch(() => '');
}

async function hasVisiblePasswordForm(page) {
    return page
        .locator(
            [
                'form[action*="password"] input[name="password"]',
                'form[action*="password"] input[type="password"]',
                'input[name="password"]',
                'input[type="password"]',
            ].join(', '),
        )
        .first()
        .isVisible({ timeout: 1500 })
        .catch(() => false);
}

async function hasInvalidPasswordMessage(page, fallbackText = '') {
    const text = `${fallbackText}\n${await bodyText(page)}`;

    return (
        /incorrect password/i.test(text)
        || /password is incorrect/i.test(text)
        || /invalid password/i.test(text)
        || /wrong password/i.test(text)
    );
}

async function isChallengePage(page, response = null) {
    const status = response?.status?.() ?? 0;

    if (status === 429) {
        return true;
    }

    const pathname = pathnameFromUrl(page.url());

    if (/challenge|captcha/i.test(pathname)) {
        return true;
    }

    const text = await bodyText(page);

    return (
        /too many requests/i.test(text)
        || /captcha/i.test(text)
        || /security check/i.test(text)
        || /verify you are human/i.test(text)
        || /temporarily blocked/i.test(text)
        || /challenge/i.test(text)
    );
}

async function isPasswordPage(page) {
    if (pathnameFromUrl(page.url()) === '/password') {
        return true;
    }

    if (await hasVisiblePasswordForm(page)) {
        return true;
    }

    const text = await bodyText(page);

    return (
        /enter using password/i.test(text)
        || /enter store using password/i.test(text)
        || /opening soon/i.test(text)
        || /store password/i.test(text)
        || /password to enter/i.test(text)
    );
}

function readCachedStorageState() {
    if (!fs.existsSync(STORAGE_STATE_PATH)) {
        return null;
    }

    try {
        const state = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf8'));

        if (
            !Array.isArray(state.cookies)
            && !Array.isArray(state.origins)
        ) {
            return null;
        }

        return state;
    } catch {
        return null;
    }
}

async function applyCachedStorefrontState(context) {
    const state = readCachedStorageState();

    if (!state) {
        return false;
    }

    if (Array.isArray(state.cookies) && state.cookies.length > 0) {
        await context.addCookies(state.cookies);
    }

    if (Array.isArray(state.origins) && state.origins.length > 0) {
        await context.addInitScript((origins) => {
            const matchingOrigin = origins.find(
                (origin) => origin.origin === window.location.origin,
            );

            if (!matchingOrigin) {
                return;
            }

            for (const item of matchingOrigin.localStorage || []) {
                window.localStorage.setItem(item.name, item.value);
            }
        }, state.origins);
    }

    authStats.cachedStateApplied += 1;

    return true;
}

async function writeStorageState(context) {
    fs.mkdirSync(AUTH_DIRECTORY, { recursive: true });

    const temporaryPath = `${STORAGE_STATE_PATH}.${process.pid}.${Date.now()}.tmp`;
    const state = await context.storageState();

    try {
        fs.writeFileSync(
            temporaryPath,
            `${JSON.stringify(state, null, 2)}\n`,
            { flag: 'wx' },
        );
        fs.renameSync(temporaryPath, STORAGE_STATE_PATH);
    } catch (error) {
        fs.rmSync(temporaryPath, { force: true });
        throw error;
    }

    authStats.storageStateWrites += 1;

    return STORAGE_STATE_PATH;
}

async function assertResponseUsable(response, page, label) {
    const status = response?.status?.() ?? 0;

    if (status === 429 || await isChallengePage(page, response)) {
        throw new StorefrontChallengeError(
            `${label} encountered Shopify throttling or challenge behavior at ${page.url()}.`,
        );
    }

    if (status >= 400) {
        throw new StorefrontAuthError(
            `${label} returned HTTP ${status} at ${page.url()}.`,
        );
    }
}

async function waitForStorefrontDocument(page, label) {
    await page.locator('body').waitFor({
        state: 'attached',
        timeout: 15_000,
    }).catch(async (error) => {
        const readyState = await page.evaluate(() => document.readyState).catch(() => '');

        throw new StorefrontAuthError(
            `${label} did not expose a storefront document body at ${page.url()} `
            + `(readyState: ${readyState || 'unknown'}): ${error.message}`,
        );
    });

    await page.waitForLoadState('load', { timeout: 15_000 }).catch(() => {});

    if (await isChallengePage(page)) {
        throw new StorefrontChallengeError(
            `${label} encountered Shopify throttling or challenge behavior at ${page.url()}.`,
        );
    }
}

async function submitPasswordWithRequest(page) {
    const password = process.env.STOREFRONT_PASSWORD;

    if (!password) {
        throw new StorefrontAuthError(
            'Storefront is password protected. Set STOREFRONT_PASSWORD.',
        );
    }

    authStats.passwordSubmissions += 1;

    const response = await page.context().request.post(
        storefrontUrl('/password'),
        {
            form: {
                password,
            },
            maxRedirects: 0,
            timeout: 45_000,
        },
    );

    if (response.status() === 429) {
        throw new StorefrontChallengeError(
            'Shopify returned HTTP 429 while submitting the storefront password.',
        );
    }

    const responseText = await response.text().catch(() => '');

    if (
        response.status() === 401
        || response.status() === 403
        || await hasInvalidPasswordMessage(page, responseText)
    ) {
        throw new StorefrontInvalidPasswordError(
            'Shopify rejected the storefront password. Verify STOREFRONT_PASSWORD.',
        );
    }

    return response;
}

async function unlockStorefront(page) {
    await applyCachedStorefrontState(page.context());

    let response = await page.goto(
        storefrontUrl('/'),
        {
            waitUntil: 'domcontentloaded',
            timeout: 60_000,
        },
    );

    await assertResponseUsable(response, page, 'Storefront unlock');
    await waitForStorefrontDocument(page, 'Storefront unlock');

    if (!(await isPasswordPage(page))) {
        return {
            response,
            url: page.url(),
            submittedPassword: false,
        };
    }

    await submitPasswordWithRequest(page);

    response = await page.goto(
        storefrontUrl('/'),
        {
            waitUntil: 'domcontentloaded',
            timeout: 60_000,
        },
    );

    await assertResponseUsable(response, page, 'Storefront unlock after password');
    await waitForStorefrontDocument(page, 'Storefront unlock after password');

    if (await hasInvalidPasswordMessage(page)) {
        throw new StorefrontInvalidPasswordError(
            'Shopify rejected the storefront password. Verify STOREFRONT_PASSWORD.',
        );
    }

    if (await isPasswordPage(page)) {
        throw new StorefrontAuthError(
            `Storefront remained on the password page after password submission at ${page.url()}.`,
        );
    }

    await writeStorageState(page.context());

    return {
        response,
        url: page.url(),
        submittedPassword: true,
    };
}

async function assertStorefrontPage(page, label = 'storefront route') {
    if (await isChallengePage(page)) {
        throw new StorefrontChallengeError(
            `${label} encountered Shopify throttling or challenge behavior at ${page.url()}.`,
        );
    }

    if (await isPasswordPage(page)) {
        throw new StorefrontAuthError(
            `${label} is still showing the storefront password page at ${page.url()}.`,
        );
    }

    return {
        url: page.url(),
        title: await page.title().catch(() => ''),
        passwordPage: false,
        visiblePasswordForm: await hasVisiblePasswordForm(page),
    };
}

async function gotoUnlocked(page, routePath, label = routePath) {
    await applyCachedStorefrontState(page.context());

    let response = await page.goto(
        storefrontUrl(routePath),
        {
            waitUntil: 'domcontentloaded',
            timeout: 60_000,
        },
    );

    await assertResponseUsable(response, page, label);
    await waitForStorefrontDocument(page, label);

    if (await isPasswordPage(page)) {
        await unlockStorefront(page);

        response = await page.goto(
            storefrontUrl(routePath),
            {
                waitUntil: 'domcontentloaded',
                timeout: 60_000,
            },
        );

        await assertResponseUsable(response, page, label);
        await waitForStorefrontDocument(page, label);
    }

    await assertStorefrontPage(page, label);

    return {
        response,
        url: page.url(),
    };
}

function resetStorefrontAuthStats() {
    authStats.cachedStateApplied = 0;
    authStats.passwordSubmissions = 0;
    authStats.storageStateWrites = 0;
}

function getStorefrontAuthStats() {
    return {
        ...authStats,
    };
}

module.exports = {
    AUTH_DIRECTORY,
    STORAGE_STATE_PATH,
    SUPPORTED_PREVIEW_QUERY_PARAMS,
    StorefrontAuthError,
    StorefrontChallengeError,
    StorefrontInvalidPasswordError,
    applyCachedStorefrontState,
    assertStorefrontPage,
    getStorefrontAuthStats,
    hasVisiblePasswordForm,
    isPasswordPage,
    pathnameFromUrl,
    resetStorefrontAuthStats,
    storefrontUrl,
    unlockStorefront,
    gotoUnlocked,
};
