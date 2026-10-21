const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { mountGallery } = require('../scripts/lib/epic-f-gallery-fixtures');

for (const width of [320, 390, 768, 1440]) for (const [state, count] of [['zero', 0], ['one', 1], ['multiple', 2], ['video', 2]]) {
  test(`${width}px ${state}: native gallery layout, loading and accessibility`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const fixture = await mountGallery(page, state);
    try {
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.locator('#Slider-Gallery-machine > li')).toHaveCount(count);
      await expect(page.locator('product-form form')).toHaveCount(1);
      await expect(page.locator('[name=add]')).toBeEnabled();
      await expect(page.locator('.rhino-machine-contact')).toHaveAttribute('href', '/pages/contact');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      expect(await page.locator('main').innerText()).not.toMatch(/UNAPPROVED|included|compatible|certified|patent|BOM/i);
      expect(fixture.external).toEqual([]);
      await expect(page.locator('iframe, video[autoplay]')).toHaveCount(0);
      if (!count) {
        await expect(page.locator('.product--no-media')).toHaveCount(1);
        await expect(page.locator('.product__media-wrapper, img, media-gallery, product-modal')).toHaveCount(0);
      } else {
        await expect(page.locator('.product--no-media')).toHaveCount(0);
        for (const img of await page.locator('media-gallery img').all()) {
          await expect(img).toHaveAttribute('alt', /Synthetic test object/);
          expect(Number(await img.getAttribute('width'))).toBeGreaterThan(0);
          expect(Number(await img.getAttribute('height'))).toBeGreaterThan(0);
          await expect(img).toHaveAttribute('srcset', /\d+w/);
          await expect(img).toHaveAttribute('sizes', /vw/);
        }
        await expect(page.locator('.product-media-container').first()).toHaveClass(/media-fit-contain/);
        expect(await page.locator('.product-media-container').first().evaluate(e => e.getBoundingClientRect().width <= innerWidth)).toBe(true);
        const hero = page.locator('.product__media-list .product__media img').first();
        expect(await hero.getAttribute('loading')).not.toBe('lazy');
        expect(Number(new URL(await hero.getAttribute('src'), fixture.origin).searchParams.get('width'))).toBeLessThanOrEqual(1946);
        for (const img of await page.locator('.product__media-list > li:not(:first-child) img').all()) await expect(img).toHaveAttribute('loading', 'lazy');
      }
      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
      expect(fixture.errors).toEqual([]);
      await testInfo.attach('gallery-state', { body: JSON.stringify({ width, state, count, externalRequests: fixture.external.length }), contentType: 'application/json' });
    } finally { await fixture.close(); }
  });
}

test('native thumbnails, image zoom dialog, focus trap and return', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const fixture = await mountGallery(page, 'multiple');
  try {
    const thumbnails = page.locator('.thumbnail-list button.thumbnail');
    await expect(thumbnails).toHaveCount(2);
    await thumbnails.first().focus();
    await page.keyboard.press('Tab');
    await expect(thumbnails.last()).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(thumbnails.last()).toHaveAttribute('aria-current', 'true');
    const opener = page.locator('.product__media-item.is-active .product__media-toggle');
    await opener.focus();
    await page.keyboard.press('Enter');
    const modal = page.locator('product-modal');
    await expect(modal).toHaveAttribute('open', '');
    await expect(page.getByRole('dialog')).toBeFocused();
    await expect(modal.locator('img.active')).toHaveAttribute('alt', 'Synthetic test object, side view.');
    expect(await modal.locator('img.active').evaluate(e => e.getBoundingClientRect().width)).toBeGreaterThan(await page.locator('.product__media-item.is-active img').first().evaluate(e => e.getBoundingClientRect().width));
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab');
      expect(await page.locator(':focus').evaluate(e => !!e.closest('product-modal'))).toBe(true);
    }
    const axe = await new AxeBuilder({ page }).include('product-modal').analyze();
    expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact))).toEqual([]);
    await page.keyboard.press('Escape');
    await expect(modal).not.toHaveAttribute('open');
    await expect(opener).toBeFocused();
    await page.keyboard.press('Enter');
    await modal.getByRole('button', { name: 'Close' }).click();
    await expect(opener).toBeFocused();
    expect(fixture.errors).toEqual([]);
  } finally { await fixture.close(); }
});

test('video provider stays inert until native interaction, with autoplay prohibited', async ({ page }) => {
  const fixture = await mountGallery(page, 'video');
  try {
    expect(fixture.external).toEqual([]);
    await expect(page.locator('iframe')).toHaveCount(0);
    const templateSources = await page.locator('deferred-media template').evaluateAll(nodes => nodes.map(n => n.content.querySelector('iframe')?.src));
    expect(templateSources.length).toBeGreaterThan(0);
    expect(templateSources.every(src => src.includes('autoplay=0'))).toBe(true);
    await page.locator('.thumbnail-list button').last().focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('media-gallery iframe')).toHaveCount(1);
    await expect.poll(() => fixture.external.length).toBe(1);
    expect(fixture.external[0]).toContain('autoplay=0');
    expect(fixture.errors).toEqual([]);
  } finally { await fixture.close(); }
});

for (const state of ['duplicate', 'wrong-model', 'wrong-product', 'unapproved', 'rights-missing', 'alt-missing', 'claims-blocked', 'deleted', 'orphan', 'shared', 'expired']) {
  test(`${state} cannot populate the gallery`, async ({ page }) => {
    const fixture = await mountGallery(page, state);
    try {
      await expect(page.locator('media-gallery, product-modal, .product__media-wrapper')).toHaveCount(0);
      await expect(page.locator('.product--no-media')).toHaveCount(1);
      expect(fixture.requests.filter(r => r.path.startsWith('/fixture-media/'))).toEqual([]);
    } finally { await fixture.close(); }
  });
}
for (const state of ['draft', 'unpublished']) test(`${state} is a 404 routing state`, async ({ page }) => {
  const fixture = await mountGallery(page, state);
  try { await expect(page.locator('h1')).toHaveText('Page not found'); await expect(page.locator('media-gallery, product-form')).toHaveCount(0); }
  finally { await fixture.close(); }
});

test('fixture approvals cannot activate media through the shipped release boundary', async ({ page }) => {
  const fixture = await mountGallery(page, 'multiple', { allowFixtures: false });
  try { await expect(page.locator('media-gallery, product-modal')).toHaveCount(0); }
  finally { await fixture.close(); }
});
