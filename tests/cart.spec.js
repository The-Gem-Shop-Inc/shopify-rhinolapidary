require('dotenv').config();

const { test, expect } = require('@playwright/test');
const {
    getFixture,
    gotoUnlocked,
    unlockStorefront,
} = require('./helpers/storefront');

test.describe.configure({ mode: 'serial' });

async function getCartState(page) {
    let lastError;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
            return await page.evaluate(async () => {
                const response = await fetch('/cart.js', {
                    credentials: 'same-origin',
                    headers: {
                        Accept: 'application/json',
                    },
                });

                const text = await response.text();

                if (
                    response.status === 429 &&
                    /Verifying your connection/i.test(text)
                ) {
                    throw new Error(
                        'SHOPIFY_CONNECTION_CHALLENGE: HTTP 429 on /cart.js. ' +
                        'Live storefront acceptance is blocked by Shopify; ' +
                        'no cart or quotation behavior has been certified by this request.'
                    );
                }

                if (!response.ok) {
                    throw new Error(`GET /cart.js failed with ${response.status}: ${text.slice(0, 300)}`);
                }

                return JSON.parse(text);
            });
        } catch (error) {
            lastError = error;

            if (
                String(error.message).includes('SHOPIFY_CONNECTION_CHALLENGE') ||
                !String(error.message).includes('429')
            ) {
                throw error;
            }

            await page.waitForTimeout(1_500 * attempt);
        }
    }

    throw lastError;
}

async function getSelectedVariantId(page) {
    const variantInput = page
        .locator('form[action*="/cart/add"] [name="id"], [name="id"]')
        .first();

    await expect(
        variantInput,
        'Could not find selected variant input/select named "id" on product page.'
    ).toBeAttached();

    const value = await variantInput.inputValue();

    if (!value) {
        throw new Error('Selected variant id was empty.');
    }

    return value;
}

async function seedFixtureProductViaAjax(page) {
    const productPath = getFixture('simpleProduct').path;

    await gotoUnlocked(page, productPath, 'simple product');

    const variantId = await getSelectedVariantId(page);

    const addResult = await page.evaluate(async ({ variantId }) => {
        const response = await fetch('/cart/add.js', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: variantId,
                quantity: 1,
            }),
        });

        const text = await response.text();

        return {
            ok: response.ok,
            status: response.status,
            body: text,
        };
    }, { variantId });

    expect(
        addResult.ok,
        `POST /cart/add.js failed with ${addResult.status}: ${addResult.body.slice(0, 500)}`
    ).toBe(true);

    const cart = await getCartState(page);

    expect(
        cart.item_count,
        `Cart should contain at least one item after AJAX seed. Cart: ${JSON.stringify(cart, null, 2)}`
    ).toBeGreaterThan(0);

    return cart;
}

async function addFixtureProductToCartThroughUi(page) {
    const productPath = getFixture('simpleProduct').path;

    await gotoUnlocked(page, productPath, 'simple product');

    const bodyText = await page.locator('body').innerText();

    expect(
        bodyText,
        'Product fixture appears to be password page, 404 page, or non-product page'
    ).not.toMatch(/opening soon|enter using password|404 not found/i);

    const addToCartButton = page.getByRole('button', {
        name: /add to cart/i,
    }).first();

    await expect(
        addToCartButton,
        [
            `No enabled Add to cart button found for fixture product: ${productPath}`,
            'Check that the product is active, published to Online Store, has price/inventory as needed,',
            'and that templates/product.json includes buy_buttons.',
        ].join('\n')
    ).toBeVisible();

    await expect(addToCartButton).toBeEnabled();

    await addToCartButton.click();

    await expect.poll(
        async () => {
            const cart = await getCartState(page);
            return cart.item_count;
        },
        {
            timeout: 10_000,
            message: 'Cart item_count did not increase after clicking Add to cart.',
        }
    ).toBeGreaterThan(0);

    return await getCartState(page);
}

test.beforeEach(async ({ page }) => {
    await unlockStorefront(page);
});

test('product can be added to cart and cart page shows item', async ({ page }) => {
    const cart = await addFixtureProductToCartThroughUi(page);
    const firstItem = cart.items[0];

    await gotoUnlocked(page, '/cart', 'cart');

    await expect(page.locator('body')).toContainText(/cart/i);

    await expect(
        page.locator('body'),
        `Cart page should contain product title from /cart.js: ${firstItem.product_title}`
    ).toContainText(firstItem.product_title);
});

test('cart exposes the shipping quotation workflow', async ({ page }) => {
    const cart = await seedFixtureProductViaAjax(page);

    expect(cart.item_count).toBeGreaterThan(0);

    await gotoUnlocked(page, '/cart', 'shipping quotation');

    const quoteMode = page.locator('rhino-quote-mode');
    const shippingChoice = page.locator('#RhinoFulfillmentShipping');
    const shippingPanel = page.locator('#RhinoShippingQuotePanel');
    const pickupPanel = page.locator('#RhinoPickupPanel');

    await expect(quoteMode).toBeVisible();
    await expect(shippingChoice).toBeVisible();

    // The customer must select a fulfillment route first.
    await shippingChoice.check();

    await expect(shippingChoice).toBeChecked();
    await expect(shippingPanel).toBeVisible();
    await expect(pickupPanel).toBeHidden();

    // Shipping uses a quotation request, not native checkout.
    const quoteForm = page.locator('#RhinoShippingQuoteForm');
    const emailSubmit = quoteForm.locator('[data-rhino-email-submit]');

    await expect(quoteForm).toBeAttached();
    await expect(emailSubmit).toBeVisible();
    await expect(emailSubmit).toBeEnabled();

    // Draft automation is configured in this staging theme.
    const automationEnabled = await quoteMode.getAttribute('data-automation-enabled');

    if (automationEnabled === 'true') {
        await expect(quoteForm.locator('[data-rhino-draft-submit]')).toBeVisible();
    }

    // No submission is performed by this test.
});

test('cart exposes checkout only through the pickup route when eligible items selected', async ({ page }) => {
    const cart = await seedFixtureProductViaAjax(page);

    expect(cart.item_count).toBeGreaterThan(0);

    await gotoUnlocked(page, '/cart', 'pickup checkout');

    const quoteMode = page.locator('rhino-quote-mode');
    const pickupChoice = page.locator('#RhinoFulfillmentPickup');
    const pickupPanel = page.locator('#RhinoPickupPanel');
    const shippingPanel = page.locator('#RhinoShippingQuotePanel');

    await expect(quoteMode).toBeVisible();
    await expect(pickupChoice).toBeVisible();

    await pickupChoice.check();

    await expect(pickupChoice).toBeChecked();
    await expect(pickupPanel).toBeVisible();
    await expect(shippingPanel).toBeHidden();

    const checkout = pickupPanel.locator('[data-rhino-pickup-checkout]');
    const pickupStatus = pickupPanel.locator('[data-rhino-pickup-status]');

    await expect(checkout).toBeVisible();
    await expect(checkout).toHaveAttribute('name', 'checkout');
    await expect(checkout).toHaveAttribute('form', 'cart');
    await expect(pickupStatus).toBeVisible();

    const policyAllowed = await quoteMode.getAttribute('data-pickup-policy-allowed');

    if (policyAllowed !== 'true') {
        // An ineligible cart must never enable pickup checkout
        await expect(checkout).toBeDisabled();
    }

    // When policy allows pickup, live inventory verification determines whether checkout becomes enabled.
    // Do not click checkout or create an order.
});