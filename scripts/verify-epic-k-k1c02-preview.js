'use strict';

const assert = require('node:assert/strict');
const { chromium } = require('@playwright/test');
const { auth } = require('./probe-epic-f-header-focus-correction');

const STORE_ORIGIN = 'https://sz5dnk-nf.myshopify.com';
const PREVIEW_THEME_ID = '158631198917';

function requiredEnvironment(name) {
    const value = process.env[name]?.trim();
    assert.ok(value, `${name} is required for the controlled preview verification.`);
    return value;
}

async function selectPreview(page) {
    const response = await page.goto(`${STORE_ORIGIN}/?preview_theme_id=${PREVIEW_THEME_ID}`, { waitUntil: 'load' });
    assert.ok(response?.ok(), 'The unpublished Epic K preview theme could not be opened.');
    assert.ok(
        ['sz5dnk-nf.myshopify.com', 'rhino-lapidary.myshopify.com'].includes(new URL(page.url()).host),
        'Preview navigation left the verified Rhino Shopify storefront.',
    );
}

async function replaceCart(page, items) {
    const before = await page.context().request.get(`${STORE_ORIGIN}/cart.js`, { headers: { Accept: 'application/json' } });
    assert.equal(before.status(), 200);
    assert.equal((await before.json()).item_count, 0, 'Controlled verification requires an isolated empty cart.');
    for (const item of items) {
        const productResponse = await page.goto(`${STORE_ORIGIN}/products/${item.handle}?preview_theme_id=${PREVIEW_THEME_ID}`, { waitUntil: 'load' });
        const variantInput = page.locator('main product-form [name="id"]');
        assert.ok(
            await variantInput.count(),
            `Product route ${item.handle} did not expose the native purchase form (HTTP ${productResponse?.status()}, path ${new URL(page.url()).pathname}).`,
        );
        assert.equal(await variantInput.inputValue(), item.id);
        const quantity = page.locator('main input[name="quantity"]');
        if (await quantity.count()) await quantity.fill(String(item.quantity));
        const added = page.waitForResponse((response) => new URL(response.url()).pathname === '/cart/add.js' && response.request().method() === 'POST');
        await page.locator('main [name="add"]').click();
        const response = await added;
        assert.equal(response.status(), 200, `Native Add to Cart failed for ${item.handle}.`);
    }
    const cart = await page.context().request.get(`${STORE_ORIGIN}/cart.js`, { headers: { Accept: 'application/json' } });
    assert.equal(cart.status(), 200);
    const result = await cart.json();
    assert.equal(result.items.length, items.length);
    return result;
}

async function inspectCart(page, expectedItems) {
    const response = await page.goto(`${STORE_ORIGIN}/cart`, { waitUntil: 'networkidle' });
    assert.ok(response?.ok(), 'Preview cart did not load successfully.');
    await page.locator('rhino-quote-mode').waitFor();
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
            referencePresent: /^KQ-[A-Z0-9]+-[1-9][0-9]*$/.test(quote.dataset.reference || ''),
            body,
            enabledCheckoutCount: enabledCheckout.length,
            dynamicCheckoutCount: dynamicCheckout.length,
            disabledPickup,
            horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        };
    });
    assert.equal(result.referencePresent, true);
    assert.equal(result.cartSignature.split('|').length, expectedItems.length);
    assert.match(result.body, /Shipping charge: pending Rhino staff packaging and carrier quotation\./);
    assert.match(result.body, /Invoice authorization: none\. Do not invoice before shipping approval\./);
    for (const item of expectedItems) {
        assert.match(result.body, new RegExp(`Variant ID: ${item.id}[^\\n]*Quantity: ${item.quantity}`));
    }
    assert.equal(result.enabledCheckoutCount, 0, 'An enabled native checkout control bypasses the fail-closed pickup gate.');
    assert.equal(result.dynamicCheckoutCount, 0, 'An accelerated checkout control bypasses quotation mode.');
    assert.equal(result.disabledPickup, true, 'Pickup must remain blocked while the approved eligibility registry is empty.');
    assert.equal(result.horizontalOverflow, false, 'Quotation mode overflows the responsive viewport.');
    return result;
}

async function submitControlledContact(page, expectedItems) {
    const email = requiredEnvironment('EPIC_K_QA_EMAIL');
    const contactRequest = page.waitForRequest((request) => request.method() === 'POST' && new URL(request.url()).pathname === '/contact');
    await page.locator('#RhinoQuoteName').fill('Epic K QA');
    await page.locator('#RhinoQuoteEmail').fill(email);
    await page.locator('#RhinoQuoteAddress1').fill('Synthetic QA address');
    await page.locator('#RhinoQuoteCity').fill('Grafton');
    await page.locator('#RhinoQuoteState').selectOption('WI');
    await page.locator('#RhinoQuotePostalCode').fill('53024');
    await page.locator('input[name="contact[delivery_type]"][value="Commercial"]').check();
    await page.locator('input[name="contact[liftgate_required]"][value="No"]').check();
    await page.locator('#RhinoQuoteAccess').fill('Controlled internal verification; no special access limitations.');
    await page.locator('[data-rhino-quote-submit]').click();
    const request = await contactRequest;
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
    const accessoryVariantId = requiredEnvironment('EPIC_K_ACCESSORY_VARIANT_ID');
    const machineVariantId = requiredEnvironment('EPIC_K_MACHINE_VARIANT_ID');
    assert.match(accessoryVariantId, /^[0-9]+$/);
    assert.match(machineVariantId, /^[0-9]+$/);
    const items = [
        { id: accessoryVariantId, handle: 'saw-blade', quantity: 2 },
        { id: machineVariantId, handle: 'sawmaster-18', quantity: 1 },
    ];
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
            await replaceCart(page, items);
            const inspection = await inspectCart(page, items);
            results.viewports.push({ viewport, ...inspection, body: undefined, cartSignature: '[SANITIZED]' });
            if (viewport.width === 1440 && process.argv.includes('--submit-contact')) {
                results.contact = await submitControlledContact(page, items);
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

module.exports = { inspectCart, replaceCart, selectPreview };
