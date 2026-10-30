'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('@playwright/test');

const STORE_ORIGIN = process.env.EPIC_K_STOREFRONT_ORIGIN?.trim() || 'https://sz5dnk-nf.myshopify.com';
const PREVIEW_THEME_ID = '158631198917';
const MAX_RATE_LIMIT_ATTEMPTS = 4;
const OUTPUT_DIR = process.env.EPIC_K_PREVIEW_LAYOUT_EVIDENCE_DIR
    || 'docs/qa/evidence/epic-k/k1c02-layout-repair-2026-10-28/preview';
const VIEWPORTS = [
    { label: '1440-desktop', width: 1440, height: 1000 },
    { label: '1024-desktop-tablet', width: 1024, height: 900 },
    { label: '768-tablet', width: 768, height: 900 },
    { label: '390-mobile', width: 390, height: 844 },
    { label: '320-mobile', width: 320, height: 800 },
    { label: '1440-at-200-percent-equivalent', width: 720, height: 900 },
];

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
            const response = await withRateLimitRetry('Storefront password submission', async () => {
                if (new URL(page.url()).pathname !== '/password') {
                    await page.goto(`${STORE_ORIGIN}/password`, { waitUntil: 'load' });
                }
                await page.locator('password-modal summary').click();
                const passwordInput = page.locator('form[action$="/password"] input[name="password"]');
                await passwordInput.waitFor({ state: 'visible' });
                await passwordInput.evaluate((input, value) => {
                    input.value = value;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }, password);
                const [navigation] = await Promise.all([
                    page.waitForNavigation({ waitUntil: 'load' }),
                    page.locator('form[action$="/password"] button[name="commit"]').click(),
                ]);
                return navigation;
            });
            assert.ok(response?.ok(), `Storefront password submission failed with HTTP ${response?.status()}.`);
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
    await page.locator('#RhinoFulfillmentShipping').check();
    await page.locator('#RhinoShippingQuotePanel').waitFor({ state: 'visible' });
    await page.locator('#RhinoQuoteFirstName').fill('Preview');
    await page.locator('#RhinoQuoteLastName').fill('Layout verification');
    const result = await page.evaluate(() => {
        const quote = document.querySelector('rhino-quote-mode');
        const body = quote?.querySelector('textarea[name="contact[body]"]')?.value || '';
        const enabledCheckout = [...document.querySelectorAll('[name="checkout"]')]
            .filter((element) => !element.disabled && element.getAttribute('aria-disabled') !== 'true');
        const dynamicCheckout = document.querySelectorAll('.shopify-payment-button, [data-shopify-buttoncontainer]');
        const disabledPickup = [...quote.querySelectorAll('button[disabled]')]
            .some((element) => /pickup/i.test(element.textContent));
        const rect = (element) => {
            const value = element.getBoundingClientRect();
            return { left: value.left, right: value.right, top: value.top, bottom: value.bottom, width: value.width };
        };
        const cards = [...quote.querySelectorAll('[data-rhino-fulfillment-card]')].map((card) => {
            const heading = card.querySelector('h3');
            const range = document.createRange();
            range.selectNodeContents(heading);
            return {
                ...rect(card),
                headingWidth: rect(heading).width,
                maximumHeadingLineWidth: Math.max(...[...range.getClientRects()].map((line) => line.width)),
            };
        });
        const controls = [...quote.querySelectorAll(
            '#RhinoShippingQuotePanel input:not([type="hidden"]):not([type="radio"]):not([type="checkbox"]), '
            + '#RhinoShippingQuotePanel select, #RhinoShippingQuotePanel textarea:not([hidden]), '
            + '#RhinoShippingQuotePanel [data-rhino-quote-submit]',
        )].map((element) => ({ id: element.id, name: element.name, ...rect(element) }));
        return {
            cartSignature: quote.dataset.cartSignature,
            reference: quote.dataset.reference,
            referencePending: /assigned when you submit/i.test(quote.querySelector('[data-rhino-reference-display]')?.textContent || ''),
            body,
            enabledCheckoutCount: enabledCheckout.length,
            dynamicCheckoutCount: dynamicCheckout.length,
            disabledPickup,
            horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
            geometry: {
                viewport: document.documentElement.clientWidth,
                content: document.documentElement.scrollWidth,
                cards,
                controls,
                panel: rect(quote.querySelector('#RhinoShippingQuotePanel')),
                submit: rect(quote.querySelector('[data-rhino-quote-submit]')),
            },
        };
    });
    assert.equal(result.reference, '', 'A raw cart-derived reference must not be rendered before intentional submission.');
    assert.equal(result.referencePending, true, 'The pending quotation-reference explanation is missing.');
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
    const practicalCardWidth = Math.min(320, result.geometry.viewport - 40);
    assert.equal(result.geometry.cards.length, 2, 'Both fulfillment choices must render.');
    for (const card of result.geometry.cards) {
        assert.ok(card.width >= practicalCardWidth, `Fulfillment card collapsed to ${card.width}px.`);
        assert.ok(card.headingWidth >= Math.min(180, card.width - 70), `Fulfillment heading collapsed to ${card.headingWidth}px.`);
        assert.ok(card.maximumHeadingLineWidth >= Math.min(150, card.width - 90), 'Fulfillment heading wraps into character-sized lines.');
    }
    const cardsBottom = Math.max(...result.geometry.cards.map((card) => card.bottom));
    assert.ok(result.geometry.panel.top >= cardsBottom, 'Shipping form must render below both fulfillment choices.');
    const practicalControlWidth = Math.min(240, result.geometry.viewport - 80);
    assert.ok(result.geometry.controls.length >= 11, 'Complete quotation controls are not visible.');
    for (const control of result.geometry.controls) {
        assert.ok(control.width >= practicalControlWidth, `${control.id || control.name} collapsed to ${control.width}px.`);
        assert.ok(control.left >= -1 && control.right <= result.geometry.viewport + 1, `${control.id || control.name} leaves the viewport.`);
    }
    assert.ok(result.geometry.submit.width >= practicalControlWidth, 'Quotation submit button is too narrow.');
    await page.locator('#RhinoFulfillmentPickup').check();
    assert.equal(await page.locator('#RhinoShippingQuotePanel').isHidden(), true, 'Pickup selection must hide the shipping form.');
    assert.equal(await page.locator('[data-rhino-pickup-status]').isVisible(), true, 'Pickup status must remain visible.');
    assert.equal(await page.locator('[data-rhino-pickup-checkout]').isVisible(), true, 'Pickup checkout control must remain visible.');
    await page.locator('#RhinoFulfillmentShipping').check();
    assert.equal(await page.locator('#RhinoQuoteFirstName').inputValue(), 'Preview', 'Switching fulfillment choices erased entered information.');
    assert.equal(await page.locator('#RhinoQuoteLastName').inputValue(), 'Layout verification', 'Switching fulfillment choices erased entered information.');
    return result;
}

async function submitControlledContact(page, expectedItems) {
    const email = requiredEnvironment('EPIC_K_QA_EMAIL');
    await page.locator('#RhinoQuoteFirstName').fill('Epic K');
    await page.locator('#RhinoQuoteLastName').fill('QA');
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

async function verifyCaptchaFailureRecovery(page) {
    await page.locator('#RhinoQuoteFirstName').fill('Preview');
    await page.locator('#RhinoQuoteLastName').fill('Recovery verification');
    await page.locator('#RhinoQuoteEmail').fill('preview-recovery@example.invalid');
    await page.locator('#RhinoQuoteAddress1').fill('Synthetic QA address');
    await page.locator('#RhinoQuoteCity').fill('Grafton');
    await page.locator('#RhinoQuoteState').selectOption('WI');
    await page.locator('#RhinoQuotePostalCode').fill('53024');
    await page.locator('input[name="contact[delivery_type]"][value="Commercial"]').check();
    await page.locator('input[name="contact[liftgate_required]"][value="No"]').check();
    await page.locator('#RhinoQuoteAccess').fill('Controlled recovery verification; no request is submitted.');
    assert.equal(await page.locator('#RhinoShippingQuoteForm').evaluate((form) => form.checkValidity()), true);

    const contactPosts = [];
    const observeRequest = (request) => {
        if (request.method() === 'POST' && new URL(request.url()).pathname === '/contact') contactPosts.push(request.url());
    };
    page.on('request', observeRequest);
    await page.route('https://js.hcaptcha.com/**', (route) => route.abort('failed'));
    try {
        await page.locator('#RhinoShippingQuoteForm').evaluate((form) => {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            const script = document.createElement('script');
            script.src = 'https://js.hcaptcha.com/1/api.js?epic-k-recovery-verification';
            document.head.append(script);
        });
        await page.locator('[data-rhino-quote-status][role="alert"]').waitFor({ timeout: 5000 });
        const result = await page.locator('rhino-quote-mode').evaluate((element) => ({
            state: element.submissionState,
            disabled: element.querySelector('[data-rhino-quote-submit]').disabled,
            pending: sessionStorage.getItem('rhino-quote:pending'),
            completed: sessionStorage.getItem(`rhino-quote:${element.dataset.cartSignature}`),
            status: element.querySelector('[data-rhino-quote-status]').textContent,
            namePreserved: element.querySelector('#RhinoQuoteFirstName').value === 'Preview'
              && element.querySelector('#RhinoQuoteLastName').value === 'Recovery verification',
        }));
        assert.equal(result.state, 'failed');
        assert.equal(result.disabled, false);
        assert.equal(result.pending, null);
        assert.equal(result.completed, null);
        assert.equal(result.namePreserved, true);
        assert.match(result.status, /security verification could not be completed/i);
        assert.equal(contactPosts.length, 0, 'Recovery verification must not submit a real contact request.');
        return { ...result, status: 'accessible_error_present', customerDataLoggedByRunner: false, contactPosts: 0 };
    } finally {
        page.off('request', observeRequest);
        await page.unroute('https://js.hcaptcha.com/**');
    }
}

async function run() {
    const pickupItems = JSON.parse(requiredEnvironment('EPIC_K_PICKUP_ITEMS_JSON'));
    assert.ok(Array.isArray(pickupItems) && pickupItems.length >= 2, 'EPIC_K_PICKUP_ITEMS_JSON must contain at least two live Grafton-available items.');
    for (const item of pickupItems) {
        assert.match(String(item.id), /^[0-9]+$/);
        assert.ok(Number.isInteger(item.quantity) && item.quantity > 0);
    }
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    const browser = await chromium.launch({ headless: true });
    let cookies;
    const results = { themeId: PREVIEW_THEME_ID, mode: 'unpublished_preview', viewports: [], recovery: null, contact: null };
    try {
        cookies = await auth(browser);
        const viewports = process.argv.includes('--desktop-only') ? [VIEWPORTS[0]] : VIEWPORTS;
        for (const viewport of viewports) {
            const context = await browser.newContext({ viewport, acceptDownloads: false });
            await context.addCookies(cookies);
            const page = await context.newPage();
            await selectPreview(page);
            await replaceCart(page, pickupItems);
            const inspection = await inspectCart(page, pickupItems, true);
            const shippingScreenshot = `${OUTPUT_DIR}/shipping-${viewport.label}.png`;
            const pickupScreenshot = `${OUTPUT_DIR}/pickup-${viewport.label}.png`;
            await page.screenshot({ path: shippingScreenshot, fullPage: true });
            await page.locator('#RhinoFulfillmentPickup').check();
            await page.screenshot({ path: pickupScreenshot, fullPage: true });
            await page.locator('#RhinoFulfillmentShipping').check();
            results.viewports.push({
                viewport,
                screenshots: { shipping: shippingScreenshot, pickup: pickupScreenshot },
                pickupAndQuote: { ...inspection, body: undefined, reference: '[SANITIZED]', cartSignature: '[SANITIZED]' },
            });
            if (viewport.width === 1440 && process.argv.includes('--submit-contact')) {
                results.contact = await submitControlledContact(page, pickupItems);
            }
            if (viewport.width === 1440 && process.argv.includes('--verify-recovery')) {
                results.recovery = await verifyCaptchaFailureRecovery(page);
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
