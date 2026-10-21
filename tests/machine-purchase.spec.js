const { test, expect } = require('@playwright/test');
const { mount, contextFor, fixtures } = require('../scripts/lib/epic-f-machine-fixtures');

test('valid quantity submits exactly the selected Variant once through native product-form', async ({ page }) => {
  const { requests, errors } = await mount(page, 'tracked-available');
  await page.locator('label[for="machine-1-1"]').click();
  const id = contextFor('tracked-available', { selected: 1 }).product.selected_or_first_available_variant.id;
  await expect(page.locator('product-form [name=id]')).toHaveValue(id);
  await expect(page.locator('#product-form-installment-machine [name=id]')).toHaveValue(id);
  await page.getByRole('spinbutton').fill('2');
  await page.locator('[name=add]').click();
  await expect(page).toHaveURL(/\/cart$/);
  expect(requests).toHaveLength(1);
  expect(requests[0].match(/name="id"/g)).toHaveLength(1);
  expect(requests[0]).toContain(`\r\n\r\n${id}\r\n`);
  expect(requests[0]).toContain('name="quantity"\r\n\r\n2\r\n');
  expect(errors).toEqual([]);
});

test('native quantity controls and invalid-quantity response retain error semantics', async ({ page }) => {
  const { requests, errors } = await mount(page, 'tracked-available', { cartError: true });
  await page.locator('[name=plus]').click();
  await expect(page.getByRole('spinbutton')).toHaveValue('2');
  await page.locator('[name=minus]').click();
  await expect(page.getByRole('spinbutton')).toHaveValue('1');
  await page.getByRole('spinbutton').fill('9');
  expect(await page.getByRole('spinbutton').evaluate(e => e.validity.rangeOverflow)).toBe(true);
  await page.locator('[name=add]').click();
  await expect(page.getByRole('alert')).toHaveText('Fixture quantity rejected');
  await expect(page.locator('[name=add]')).not.toHaveAttribute('aria-disabled', 'true');
  expect(requests).toHaveLength(1);
  expect(requests[0]).toContain('name="quantity"\r\n\r\n9\r\n');
  expect(errors).toEqual([]);
});

test('native Variant changes use section response state, including unavailable and recovery', async ({ page }) => {
  const { requests, errors } = await mount(page, 'tracked-available');
  // Shopify option combinations are fixture response inputs; use the existing
  // picker event path and real product-info section-response processing.
  for (const [option, label] of [['103', 'Sold out'], ['102', 'Unavailable'], ['101', 'Add to cart']]) {
    await page.locator('input[type=radio]').last().evaluate((e, value) => { e.dataset.optionValueId = value; e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, option);
    await expect(page.locator('[name=add]')).toHaveText(label);
    if (label === 'Add to cart') await expect(page.locator('[name=add]')).toBeEnabled();
    else await expect(page.locator('[name=add]')).toBeDisabled();
    await expect(page.locator('media-gallery, product-modal, .product__media-wrapper, .product__description')).toHaveCount(0);
    await expect(page.locator('.product--no-media')).toHaveCount(1);
  }
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
});

for (const state of fixtures.states.filter(s => s.routeStatus)) test(`${state.id} route stays unavailable`, async ({ page }) => {
  const { requests } = await mount(page, state.id);
  await expect(page.locator('h1')).toHaveText('Page not found');
  await expect(page.locator('product-info, form, [name=add]')).toHaveCount(0);
  expect(requests).toEqual([]);
});

test('no-JavaScript retains basic native form action, Variant ID and quantity', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await mount(page, 'tracked-available');
  await expect(page.locator('product-form form')).toHaveAttribute('method', 'post');
  await expect(page.locator('product-form form')).toHaveAttribute('action', '/cart/add');
  await expect(page.locator('product-form [name=id]')).toHaveValue(contextFor('tracked-available').product.selected_or_first_available_variant.id);
  await expect(page.getByRole('spinbutton')).toHaveAttribute('form', 'product-form-machine');
  await expect(page.locator('[name=add]')).toBeEnabled();
  await expect(page.locator('.rhino-machine-contact')).toHaveAttribute('href', '/pages/contact');
  await ctx.close();
});
