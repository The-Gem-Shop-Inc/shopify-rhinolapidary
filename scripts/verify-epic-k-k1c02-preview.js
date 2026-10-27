'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('@playwright/test');

const STORE_ORIGIN = process.env.EPIC_K_STOREFRONT_ORIGIN?.trim() || 'https://sz5dnk-nf.myshopify.com';
const PREVIEW_THEME_ID = '158631198917';
const MAX_RATE_LIMIT_ATTEMPTS = 4;

function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

function retryAfterMs(response, attempt) {
    const header = response?.headers()?.['retry-after'];
    if (header) {
        const seconds = Number(header);
        if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
        const date = Date.parse(header);
        if (Number.isFinite(date)) return Math.max(0, date - Date.now());
    }
    return Math.min(60000, 10000 * (2 ** attempt));
}

async function withRateLimitRetry(label, operation) {
    let response;
    for (let attempt = 0; attempt < MAX_RATE_LIMIT_ATTEMPTS; attempt += 1) {
        response = await operation();
        if (response?.status() !== 429) return response;
        if (attempt === MAX_RATE_LIMIT_ATTEMPTS - 1) break;
        const waitMs = retryAfterMs(response, attempt);
        console.error(`${label} received HTTP 429; retrying in ${waitMs}ms (${attempt + 1}/${MAX_RATE_LIMIT_ATTEMPTS - 1}).`);
        await delay(waitMs);
    }
    throw new Error(`${label} remained rate limited after ${MAX_RATE_LIMIT_ATTEMPTS} attempts.`);
}

async function auth(browser) {
    const context = await browser.newContext({ acceptDownloads: false });
    let password;
    try {
        const page = await context.newPage();
        await withRateLimitRetry('Storefront authentication page', () => page.goto(STORE_ORIGIN, { waitUntil: 'load' }));
        if (new URL(page.url()).pathname === '/password') {
            password = require('dotenv').parse(fs.readFileSync('.env')).STOREFRONT_PASSWORD;
            assert.ok(password, 'STOREFRONT_PASSWORD is required for controlled preview verification.');
            const response = await withRateLimitRetry('Storefront password submission', () => context.request.post(`${STORE_ORIGIN}/password`, {
                form: { password }, maxRedirects: 0,
            }));
            assert.ok([200, 302, 303].includes(response.status()), `Storefront password submission failed with HTTP ${response.status()}.`);
            await withRateLimitRetry('Authenticated storefront', () => page.goto(STORE_ORIGIN, { waitUntil: 'load' }));
        }
        assert.notEqual(new URL(page.url()).pathname, '/password');
        return await context.cookies();
    } finally {
        password = null;
        await context.close();
    }
}

function requiredEnvironment(name) {
    const value = process.env[name]?.trim();
    assert.ok(value, `${name} is required for the controlled preview verification.`);
    return value;
}

async function selectPreview(page) {
    const response = await withRateLimitRetry('Preview selection', () => page.goto(`${STORE_ORIGIN}/?preview_theme_id=${PREVIEW_THEME_ID}`, { waitUntil: 'load' }));
    assert.ok(response?.ok(), 'The unpublished Epic K preview theme could not be opened.');
    assert.ok(
        ['127.0.0.1:9292', 'sz5dnk-nf.myshopify.com', 'rhino-lapidary.myshopify.com'].includes(new URL(page.url()).host),
        'Preview navigation left the verified Rhino Shopify storefront.',
    );
}

async function storefrontFetch(page, path, options = {}) {
    const result = await page.evaluate(async ({ requestPath, requestOptions }) => {
        const response = await fetch(requestPath, requestOptions);
        return { status: response.status, headers: Object.fromEntries(response.headers.entries()), body: await response.text() };
    }, { requestPath: path, requestOptions: options });
    return {
        status: () => result.status,
        headers: () => result.headers,
        json: async () => JSON.parse(result.body),
    };
}

async function replaceCart(page, items) {
    for (const item of items) {
        const productResponse = await withRateLimitRetry(`Product ${item.handle}`, () => page.goto(
            `${STORE_ORIGIN}/products/${item.handle}?preview_theme_id=${PREVIEW_THEME_ID}`,
            { waitUntil: 'load' },
        ));
        assert.ok(productResponse?.ok(), `Product route ${item.handle} failed with HTTP ${productResponse?.status()}.`);
        const variantInput = page.locator('main product-form [name="id"]');
        assert.ok(await variantInput.count(), `Product route ${item.handle} did not expose the native purchase form.`);
        assert.equal(await variantInput.inputValue(), String(item.id));
        const quantity = page.locator('main input[name="quantity"]');
        if (await quantity.count()) await quantity.fill(String(item.quantity));
        const observedPosts = [];
        const observePost = (request) => { if (request.method() === 'POST') observedPosts.push(new URL(request.url()).pathname); };
        page.on('request', observePost);
        let added;
        try {
            [added] = await Promise.all([
                page.waitForResponse((response) => (
                    new URL(response.url()).pathname.includes('/cart/add') && response.request().method() === 'POST'
                ), { timeout: 15000 }),
                page.locator('main [name="add"]').click(),
            ]);
        }
        catch { throw new Error(`Native Add to Cart response missing for ${item.handle}; observed POST paths: ${observedPosts.join(',') || 'none'}.`); }
        finally { page.off('request', observePost); }
        assert.equal(added.status(), 200, `Native Add to Cart failed for ${item.handle} with HTTP ${added.status()}.`);
    }
}

async function inspectCart(page, expectedItems, pickupExpected) {
    const response = new URL(page.url()).pathname === '/cart'
        ? null
        : await withRateLimitRetry('Cart inspection', () => page.goto(`${STORE_ORIGIN}/cart`, { waitUntil: 'networkidle' }));
    if (response) assert.ok(response.ok(), 'Preview cart did not load successfully.');
    try {
        await page.locator('rhino-quote-mode').waitFor({ timeout: 8000 });
    } catch {
        const body = (await page.locator('body').innerText()).replace(/\s+/g, ' ').slice(0, 500);
        throw new Error(`Quotation surface missing at ${new URL(page.url()).pathname}; response ${response?.status() ?? 'existing page'}; body: ${body}`);
    }
    if (pickupExpected) await page.locator('[data-rhino-pickup-checkout]:not([disabled])').waitFor({ timeout: 15000 });
    const result = await page.evaluate(() => {
        const quote = document.querySelector('rhino-quote-mode');
        const body = quote?.querySelector('textarea[name="contact[body]"]')?.value || '';
        const enabledCheckout = [...document.querySelectorAll('[name="checkout"]')]
            .filter((element) => !element.disabled && element.getAttribute('aria-disabled') !== 'true');
        const dynamicCheckout = document.querySelectorAll('.shopify-payment-button, [data-shopify-buttoncontainer]');
        const disabledPickup = [...quote.querySelectorAll('button[disabled]')]
            .some((element) => /pickup/i.test(element.textContent));
        return {
            cartSignature: quote.dataset.cartSignature,
            reference: quote.dataset.reference,
            referencePresent: /^KQ-[A-Z0-9_-]*-[1-9][0-9]*$/.test(quote.dataset.reference || ''),
            body,
            enabledCheckoutCount: enabledCheckout.length,
            dynamicCheckoutCount: dynamicCheckout.length,
            disabledPickup,
            horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
    });
    assert.equal(result.referencePresent, true, `Unexpected quotation reference format: ${result.reference}`);
    assert.equal(result.cartSignature.split('|').length, expectedItems.length);
    assert.match(result.body, /Shipping charge: pending Rhino staff packaging and carrier quotation\./);
    assert.match(result.body, /Invoice authorization: none\. Do not invoice before shipping approval\./);
    for (const item of expectedItems) {
        assert.match(result.body, new RegExp(`Variant ID: ${item.id}[^\\n]*Quantity: ${item.quantity}`));
    }
    assert.equal(result.enabledCheckoutCount, pickupExpected ? 1 : 0, 'Native checkout visibility does not match whole-cart Grafton eligibility.');
    assert.equal(result.dynamicCheckoutCount, 0, 'An accelerated checkout control bypasses quotation mode.');
    assert.equal(result.disabledPickup, !pickupExpected, 'Pickup state does not match live whole-cart Grafton availability.');
    assert.equal(result.horizontalOverflow, false, 'Quotation mode overflows the responsive viewport.');
    return result;
}

async function submitControlledContact(page, expectedItems) {
    const email = requiredEnvironment('EPIC_K_QA_EMAIL');
    await page.locator('#RhinoQuoteName').fill('Epic K QA');
    await page.locator('#RhinoQuoteEmail').fill(email);
    await page.locator('#RhinoQuoteAddress1').fill('Synthetic QA address');
    await page.locator('#RhinoQuoteCity').fill('Grafton');
    await page.locator('#RhinoQuoteState').selectOption('WI');
    await page.locator('#RhinoQuotePostalCode').fill('53024');
    await page.locator('input[name="contact[delivery_type]"][value="Commercial"]').check();
    await page.locator('input[name="contact[liftgate_required]"][value="No"]').check();
    await page.locator('#RhinoQuoteAccess').fill('Controlled internal verification; no special access limitations.');
    assert.equal(await page.locator('#RhinoShippingQuoteForm').evaluate((form) => form.checkValidity()), true, 'Controlled contact form is invalid.');
    const observedPosts = [];
    const observePost = (request) => { if (request.method() === 'POST') observedPosts.push(new URL(request.url()).pathname); };
    page.on('request', observePost);
    let request;
    try {
        [request] = await Promise.all([
            page.waitForRequest((candidate) => candidate.method() === 'POST' && new URL(candidate.url()).pathname === '/contact', { timeout: 15000 }),
            page.locator('[data-rhino-quote-submit]').click(),
        ]);
    } catch {
        throw new Error(`Controlled contact submission did not reach /contact; observed POST paths: ${observedPosts.join(',') || 'none'}.`);
    } finally {
        page.off('request', observePost);
    }
    const submittedBody = request.postData() || '';
    for (const item of expectedItems) {
        assert.match(decodeURIComponent(submittedBody.replace(/\+/g, ' ')), new RegExp(`Variant ID: ${item.id}[^\\n&]*Quantity: ${item.quantity}`));
    }
    await page.waitForLoadState('networkidle');
    const success = page.locator('[data-rhino-quote-success]');
    await success.waitFor();
    assert.equal(await success.isVisible(), true);
    return {
        destination: 'shopify_store_contact_destination',
        completeCartSubmitted: true,
        successAcknowledgement: true,
        customerDataLoggedByRunner: false,
    };
}

async function run() {
    const pickupItems = JSON.parse(requiredEnvironment('EPIC_K_PICKUP_ITEMS_JSON'));
    assert.ok(Array.isArray(pickupItems) && pickupItems.length >= 2, 'EPIC_K_PICKUP_ITEMS_JSON must contain at least two live Grafton-available items.');
    for (const item of pickupItems) {
        assert.match(String(item.id), /^[0-9]+$/);
        assert.ok(Number.isInteger(item.quantity) && item.quantity > 0);
    }
    const browser = await chromium.launch({ headless: true });
    let cookies;
    const results = { themeId: PREVIEW_THEME_ID, mode: 'unpublished_preview', viewports: [], contact: null };
    try {
        cookies = await auth(browser);
        const viewports = process.argv.includes('--desktop-only')
            ? [{ width: 1440, height: 1000 }]
            : [{ width: 1440, height: 1000 }, { width: 390, height: 844 }];
        for (const viewport of viewports) {
            const context = await browser.newContext({ viewport, acceptDownloads: false });
            await context.addCookies(cookies);
            const page = await context.newPage();
            await selectPreview(page);
            await replaceCart(page, pickupItems);
            const inspection = await inspectCart(page, pickupItems, true);
            results.viewports.push({ viewport, pickupAndQuote: { ...inspection, body: undefined, reference: '[SANITIZED]', cartSignature: '[SANITIZED]' } });
            if (viewport.width === 1440 && process.argv.includes('--submit-contact')) {
                results.contact = await submitControlledContact(page, pickupItems);
            }
            await context.close();
        }
    } finally {
        cookies = null;
        await browser.close();
    }
    console.log(JSON.stringify(results, null, 2));
}

if (require.main === module) {
    run().catch((error) => {
        console.error(error.stack || error.message);
        process.exitCode = 1;
    });
}

module.exports = { inspectCart, replaceCart, selectPreview, retryAfterMs, withRateLimitRetry };
