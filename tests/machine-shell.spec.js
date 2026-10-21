const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { fixtures, mount, contextFor } = require('../scripts/lib/epic-f-machine-fixtures');

async function assertReflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  for (const selector of ['h1', '.price-item:visible', '.product-form__submit', '.rhino-machine-contact', '.product-form__input label']) {
    for (const el of await page.locator(selector).all()) {
      if (!await el.isVisible()) continue;
      expect(await el.evaluate(e => e.scrollWidth <= e.clientWidth + 2)).toBe(true);
    }
  }
}
for (const width of fixtures.widths) for (const state of fixtures.states.filter(s => !s.routeStatus)) {
  test(`${width}px ${state.id}: hierarchy, focus, no media, reflow and axe`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    const { errors, requests } = await mount(page, state.id);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.locator('product-form form')).toHaveCount(1);
    await expect(page.locator('product-info')).toHaveCount(1);
    await expect(page.locator('product-info')).toHaveClass(/rhino-machine-shell/);
    await expect(page.locator('.product--no-media')).toHaveCount(1);
    await expect(page.locator('.product__media-wrapper, media-gallery, product-modal, .product__description, details, [href^="#"]')).toHaveCount(0);
    expect(await page.locator('main').innerText()).not.toMatch(/UNAPPROVED|quote|preorder|backorder|reserve/i);
    const button = page.locator('[name=add]');
    await expect(button).toHaveText(state.button);
    if (state.button === 'Add to cart') await expect(button).toBeEnabled();
    else await expect(button).toBeDisabled();
    await expect(page.locator('[id=price-machine]')).toHaveAttribute('role', 'status');
    await expect(page.getByRole('spinbutton')).toHaveAccessibleName(/Quantity/);
    await expect(page.locator('pickup-availability')).toHaveCount(1);
    const order = ['h1', '#price-machine', 'variant-selects', '#Quantity-Form-machine', 'product-form', '.rhino-machine-contact'];
    expect(await page.evaluate(selectors => selectors.every((s, i) => !i || !!(document.querySelector(selectors[i-1]).compareDocumentPosition(document.querySelector(s)) & Node.DOCUMENT_POSITION_FOLLOWING)), order)).toBe(true);
    const focusOrder = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press('Tab');
      const el = page.locator(':focus');
      if (!await el.count()) continue;
      const tag = await el.evaluate(e => e.tagName);
      expect(await el.evaluate(e => !!(e.getAttribute('aria-label') || e.textContent.trim() || e.labels?.length))).toBe(true);
      expect(await el.evaluate(e => {
        const target = e.matches('input[type=radio]') ? e.nextElementSibling : e;
        const s = getComputedStyle(target);
        return (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none';
      }), `visible focus on ${tag}`).toBe(true);
      focusOrder.push(await el.evaluate(e => e.matches('input[type=radio]') ? 'variant' : e.name || e.textContent.trim()));
      if (await el.getAttribute('href') === '/pages/contact') break;
    }
    expect(focusOrder).toEqual(['variant', 'minus', 'quantity', 'plus', ...(state.button === 'Add to cart' ? ['add'] : []), 'Contact']);
    await assertReflow(page);
    const axe = await new AxeBuilder({ page }).include('main').analyze();
    expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
    expect(errors).toEqual([]);
    expect(requests).toEqual([]);
  });
}
for (const width of fixtures.widths) test(`${width}px long content and 200% text enlargement`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 1000 });
  await mount(page, 'tracked-available', { long: true, translations: { 'products.product.add_to_cart': 'Add this selected fixture machine to the shopping cart' } });
  await assertReflow(page);
  const before = await page.locator('h1').evaluate(e => parseFloat(getComputedStyle(e).fontSize));
  await page.evaluate(() => document.documentElement.style.fontSize = `${parseFloat(getComputedStyle(document.documentElement).fontSize) * 2}px`);
  expect(await page.locator('h1').evaluate(e => parseFloat(getComputedStyle(e).fontSize))).toBe(before * 2);
  await assertReflow(page);
  const axe = await new AxeBuilder({ page }).include('main').analyze();
  expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
  await testInfo.attach('text-enlargement', { body: JSON.stringify({ width, method: 'root-font 200% text enlargement; not browser zoom', before, after: before * 2 }), contentType: 'application/json' });
});

test('Contact uses the approved route without context or intake enhancement', async ({ page }) => {
  await mount(page, 'tracked-available');
  await expect(page.locator('.rhino-machine-contact')).toHaveAttribute('href', '/pages/contact');
  await expect(page.locator('input[name^="contact["]')).toHaveCount(0);
  await page.locator('.rhino-machine-contact').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('http://machine.local/pages/contact');
});

test('default Product template remains a native non-machine purchase page', async ({ page }) => {
  const { errors } = await mount(page, 'tracked-available', { template: '', productId: '8905779413189' });
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.rhino-machine-shell, .rhino-machine-contact')).toHaveCount(0);
  await expect(page.locator('[name=add]')).toBeEnabled();
  await expect(page.locator('.product__description')).toContainText('UNAPPROVED_DESCRIPTION');
  expect(errors).toEqual([]);
});

module.exports = { assertReflow };
