const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('@playwright/test');
const { getFixture, gotoUnlocked } = require('./helpers/storefront');

test.setTimeout(90000);

test('release quotation creates a confirmed Shopify Draft Order', async ({ page }) => {
    expect(process.env.RHINO_RELEASE_DRAFT_TEST,
        'Explicit release test authorization required.').toBe('ONE_TEST_DRAFT');

    const evidenceDir = path.join(process.cwd(), 'test-results', 'release');
    const marker = path.join(evidenceDir, 'jg-draft-attempt.json');
    const resultPath = path.join(evidenceDir, 'jg-draft-result.json');

    if (fs.existsSync(marker)) {
        throw new Error('A quotation test was already attempted. Inspect its outcome before another submission.');
    }

    // Seed one real catalog variant into this isolated browser cart.
    await gotoUnlocked(page, getFixture('simpleProduct').path);

    const variantId = await page.locator('form[action*="/cart/add"] [name="id"], [name="id"]')
        .first().inputValue();

    expect(variantId).toMatch(/^\d+$/);

    const added = await page.evaluate(async (id) => {
        const response = await fetch('/cart/add.js', {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, quantity: 1 })
        });

        return { ok: response.ok, status: response.status };
    }, variantId);

    expect(added.ok, `Cart seed HTTP ${added.status}`).toBe(true);

    await gotoUnlocked(page, '/cart', 'quotation release test');

    const quote = page.locator('rhino-quote-mode');

    await expect(quote).toHaveAttribute('data-automation-enabled', 'true');

    await page.locator('#RhinoFulfillmentShipping').check();
    await expect(page.locator('#RhinoShippingQuotePanel')).toBeVisible();

    // Reserved example.com email: no real customer is contacted.
    await page.locator('#RhinoQuoteFirstName').fill('Rhino');
    await page.locator('#RhinoQuoteLastName').fill('Release QA');
    await page.locator('#RhinoQuoteEmail').fill('rhino-release-qa@example.com');
    await page.locator('#RhinoQuoteCompany').fill('Rhino Lapidary QA');
    await page.locator('#RhinoQuoteAddress1').fill('1411 6th Ave');
    await page.locator('#RhinoQuoteCity').fill('Grafton');
    await page.locator('#RhinoQuoteState').selectOption('WI');
    await page.locator('#RhinoQuotePostalCode').fill('53024');

    await page.locator('input[name="contact[delivery_type]"][value="Commercial"]').check();
    await page.locator('input[name="contact[liftgate_required]"][value="No"]').check();
    await page.locator('#RhinoQuoteAccess').fill(
        'RELEASE QA ONLY. Do not invoice, ship, fulfill, or contact.'
    );

    const draftButton = quote.locator('[data-rhino-draft-submit]');

    await expect(draftButton).toBeVisible();
    await expect(draftButton).toBeEnabled();

    // Prevent accidental repetition, including after uncertain responses.
    fs.mkdirSync(evidenceDir, { recursive: true });
    fs.writeFileSync(marker, JSON.stringify({
        attemptedAt: new Date().toISOString(),
        targetTheme: process.env.PREVIEW_THEME_ID,
        operation: 'ONE_STOREFRONT_DRAFT_TEST',
    }, null, 2), { flag: 'wx' });

    const proxyResponse = page.waitForResponse(
        response => {
            const url = new URL(response.url());
            return url.pathname === '/apps/rhino-quote-draft'
                && response.request().method() === 'POST';
        }, { timeout: 60000 }
    );

    await draftButton.click();

    const response = await proxyResponse;
    const body = await response.json().catch(() => null);

    const evidence = {
        checkAt: new Date().toISOString(),
        themeId: process.env.PREVIEW_THEME_ID,
        httpStatus: response.status(),
        storedInShopifyAdmin: body?.storedInShopifyAdmin === true,
        reference: body?.reference || null,
        staffIdentifier: body?.staffIdentifier || null,
        errorCode: body?.code || null,
    };

    fs.writeFileSync(resultPath, JSON.stringify(evidence, null, 2) + '\n');

    expect(response.ok(), `Proxy status: ${response.status()}`).toBe(true);
    expect(body?.storedInShopifyAdmin).toBe(true);
    expect(body?.reference).toMatch(/^KQ-[A-Z0-9]+-\d+$/);
    expect(body?.staffIdentifier).toMatch(/^#D[1-9]\d*$/);

    await expect(page.locator('[data-rhino-draft-confirmation]')).toBeVisible();

    console.log('Release quotation evidence:', evidence);
});