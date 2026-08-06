'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const {
    STORAGE_STATE_PATH,
    getStorefrontAuthStats,
    gotoUnlocked,
    isPasswordPage,
    resetStorefrontAuthStats,
    storefrontUrl,
    unlockStorefront,
} = require('./helpers/storefront-auth');
const {
    assertMetadataRouteReady,
    readMetadata,
} = require('../scripts/validate-social-metadata');
const {
    assertMeasurableStorefrontPage,
} = require('../scripts/validate-brand-performance-budget');

test.describe.configure({ mode: 'serial' });

const originalEnv = {
    PREVIEW_URL: process.env.PREVIEW_URL,
    PREVIEW_BASE_URL: process.env.PREVIEW_BASE_URL,
    PREVIEW_THEME_ID: process.env.PREVIEW_THEME_ID,
    STOREFRONT_PASSWORD: process.env.STOREFRONT_PASSWORD,
};

function restoreEnv() {
    for (const [key, value] of Object.entries(originalEnv)) {
        if (typeof value === 'undefined') {
            delete process.env[key];
        } else {
            process.env[key] = value;
        }
    }
}

function clearAuthState() {
    fs.rmSync(STORAGE_STATE_PATH, { force: true });
}

function parseCookies(header = '') {
    return Object.fromEntries(
        header
            .split(';')
            .map((part) => part.trim().split('='))
            .filter(([key, value]) => key && typeof value !== 'undefined'),
    );
}

function sendHtml(response, html, status = 200, headers = {}) {
    response.writeHead(status, {
        'content-type': 'text/html; charset=utf-8',
        ...headers,
    });
    response.end(html);
}

function createPasswordPage(origin, message = '') {
    return `<!doctype html>
<html lang="en">
<head>
<title>Password</title>
<link rel="canonical" href="${origin}/password">
</head>
<body>
<h1>Opening soon</h1>
<p>Enter using password</p>
${message ? `<p>${message}</p>` : ''}
<form action="/password" method="post">
<label>Password <input name="password" type="password"></label>
<button type="submit">Enter</button>
</form>
</body>
</html>`;
}

async function startAuthServer(password = 'test-password') {
    let submissionCount = 0;

    const server = http.createServer((request, response) => {
        const host = request.headers.host;
        const origin = `http://${host}`;
        const requestUrl = new URL(request.url, origin);
        const cookies = parseCookies(request.headers.cookie || '');
        const unlocked = cookies.storefront_auth === 'valid';

        if (requestUrl.pathname === '/password' && request.method === 'POST') {
            let body = '';
            request.on('data', (chunk) => {
                body += chunk.toString();
            });
            request.on('end', () => {
                submissionCount += 1;
                const params = new URLSearchParams(body);

                if (params.get('password') === password) {
                    response.writeHead(302, {
                        'set-cookie': 'storefront_auth=valid; Path=/; HttpOnly',
                        location: '/',
                    });
                    response.end();
                    return;
                }

                sendHtml(
                    response,
                    createPasswordPage(origin, 'Incorrect password'),
                    200,
                );
            });
            return;
        }

        if (requestUrl.pathname === '/password') {
            sendHtml(response, createPasswordPage(origin));
            return;
        }

        if (requestUrl.pathname === '/form-detect') {
            sendHtml(
                response,
                '<!doctype html><html lang="en"><body><form><input name="password" type="password"></form></body></html>',
            );
            return;
        }

        if (requestUrl.pathname === '/body-detect') {
            sendHtml(
                response,
                '<!doctype html><html lang="en"><body><p>Opening soon. Enter using password.</p></body></html>',
            );
            return;
        }

        if (!unlocked) {
            response.writeHead(302, { location: '/password' });
            response.end();
            return;
        }

        const canonical = `${origin}${requestUrl.pathname}`;
        sendHtml(
            response,
            `<!doctype html>
<html lang="en">
<head>
<title>Unlocked ${requestUrl.pathname}</title>
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="${requestUrl.pathname.startsWith('/products/') ? 'product' : 'website'}">
</head>
<body>
<main><h1>Unlocked storefront</h1><a href="/products/test">Product</a></main>
</body>
</html>`,
        );
    });

    await new Promise((resolve) => {
        server.listen(0, '127.0.0.1', resolve);
    });

    const address = server.address();

    return {
        origin: `http://127.0.0.1:${address.port}`,
        getSubmissionCount: () => submissionCount,
        close: () => new Promise((resolve) => server.close(resolve)),
    };
}

test.beforeEach(() => {
    resetStorefrontAuthStats();
    clearAuthState();
});

test.afterEach(() => {
    clearAuthState();
    restoreEnv();
});

test('PREVIEW_URL and PREVIEW_BASE_URL are both supported', () => {
    delete process.env.PREVIEW_BASE_URL;
    delete process.env.PREVIEW_THEME_ID;
    process.env.PREVIEW_URL =
        'https://preview.example.test?preview_theme_id=111&preview_key=abc&utm_source=ignored';

    expect(storefrontUrl('/products/test')).toBe(
        'https://preview.example.test/products/test?preview_theme_id=111&preview_key=abc',
    );

    delete process.env.PREVIEW_URL;
    process.env.PREVIEW_BASE_URL =
        'https://base.example.test?preview_theme_id=222&preview_key=def';

    expect(storefrontUrl('/collections/machines')).toBe(
        'https://base.example.test/collections/machines?preview_theme_id=222&preview_key=def',
    );
});

test('preview query parameters survive route construction', () => {
    delete process.env.PREVIEW_BASE_URL;
    process.env.PREVIEW_URL =
        'https://preview.example.test?preview_theme_id=111&preview_key=abc&_fd=0&pb=1&utm_source=ignored';
    process.env.PREVIEW_THEME_ID = '999';

    const url = new URL(
        storefrontUrl('/search?q=rhino&preview_key=route-key'),
    );

    expect(url.pathname).toBe('/search');
    expect(url.searchParams.get('q')).toBe('rhino');
    expect(url.searchParams.get('preview_theme_id')).toBe('111');
    expect(url.searchParams.get('preview_key')).toBe('route-key');
    expect(url.searchParams.get('_fd')).toBe('0');
    expect(url.searchParams.get('pb')).toBe('1');
    expect(url.searchParams.has('utm_source')).toBe(false);
});

test('password-page detection recognizes URL, form, and body text', async ({ page }) => {
    const server = await startAuthServer();

    try {
        process.env.PREVIEW_URL = server.origin;

        await page.goto(`${server.origin}/password`);
        await expect(await isPasswordPage(page)).toBe(true);

        await page.goto(`${server.origin}/form-detect`);
        await expect(await isPasswordPage(page)).toBe(true);

        await page.goto(`${server.origin}/body-detect`);
        await expect(await isPasswordPage(page)).toBe(true);
    } finally {
        await server.close();
    }
});

test('successful unlock writes storage state and a fresh context reuses it', async ({ browser, page }) => {
    const password = 'unlock-secret';
    const server = await startAuthServer(password);

    try {
        process.env.PREVIEW_URL = server.origin;
        process.env.STOREFRONT_PASSWORD = password;

        const result = await unlockStorefront(page);

        expect(result.submittedPassword).toBe(true);
        expect(server.getSubmissionCount()).toBe(1);
        expect(fs.existsSync(STORAGE_STATE_PATH)).toBe(true);

        const context = await browser.newContext();
        const secondPage = await context.newPage();

        await gotoUnlocked(secondPage, '/products/test', 'cached product');

        expect(server.getSubmissionCount()).toBe(1);
        expect(getStorefrontAuthStats().cachedStateApplied).toBeGreaterThan(0);

        await context.close();
    } finally {
        await server.close();
    }
});

test('stale cached state falls back to password submission', async ({ page }) => {
    const password = 'stale-state-secret';
    const server = await startAuthServer(password);

    try {
        process.env.PREVIEW_URL = server.origin;
        process.env.STOREFRONT_PASSWORD = password;

        const domain = new URL(server.origin).hostname;
        fs.mkdirSync(path.dirname(STORAGE_STATE_PATH), { recursive: true });
        fs.writeFileSync(
            STORAGE_STATE_PATH,
            `${JSON.stringify({
                cookies: [
                    {
                        name: 'storefront_auth',
                        value: 'stale',
                        domain,
                        path: '/',
                        expires: Math.floor(Date.now() / 1000) + 3600,
                        httpOnly: true,
                        secure: false,
                        sameSite: 'Lax',
                    },
                ],
                origins: [],
            }, null, 2)}\n`,
        );

        await gotoUnlocked(page, '/products/test', 'stale state product');

        expect(server.getSubmissionCount()).toBe(1);
        expect(await isPasswordPage(page)).toBe(false);
    } finally {
        await server.close();
    }
});

test('social metadata refuses to validate the password page', async ({ page }) => {
    const server = await startAuthServer();

    try {
        await page.goto(`${server.origin}/password`);
        const metadata = await readMetadata(page);

        await expect(
            assertMetadataRouteReady(
                page,
                { name: 'product', expectedType: 'product' },
                '/products/test',
                metadata,
            ),
        ).rejects.toThrow(/password/i);
    } finally {
        await server.close();
    }
});

test('performance measurement refuses to measure the password page', async ({ page }) => {
    const server = await startAuthServer();

    try {
        await page.goto(`${server.origin}/password`);

        await expect(
            assertMeasurableStorefrontPage(
                page,
                { name: 'homepage', resolvedPath: '/' },
                `${server.origin}/`,
            ),
        ).rejects.toThrow(/Refusing to measure homepage/i);
    } finally {
        await server.close();
    }
});

test('generated JSON reports do not include the storefront password value', async ({ page }) => {
    const password = `json-secret-${Date.now()}`;
    const server = await startAuthServer(password);
    const reportPath = path.join(
        'test-results',
        'storefront-auth',
        'auth-harness-report.json',
    );

    try {
        process.env.PREVIEW_URL = server.origin;
        process.env.STOREFRONT_PASSWORD = password;

        const result = await unlockStorefront(page);

        fs.mkdirSync(path.dirname(reportPath), { recursive: true });
        fs.writeFileSync(
            reportPath,
            `${JSON.stringify({
                url: result.url,
                submittedPassword: result.submittedPassword,
                storageStatePath: STORAGE_STATE_PATH,
                stats: getStorefrontAuthStats(),
            }, null, 2)}\n`,
        );

        for (const filePath of [reportPath, STORAGE_STATE_PATH]) {
            expect(fs.readFileSync(filePath, 'utf8')).not.toContain(password);
        }
    } finally {
        fs.rmSync(reportPath, { force: true });
        await server.close();
    }
});
