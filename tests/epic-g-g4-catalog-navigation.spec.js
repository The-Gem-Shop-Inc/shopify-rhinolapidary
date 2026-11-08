'use strict';

const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const plan = require('../data/epic-g-g4-catalog-navigation.json');

const widths = [320, 390, 768, 1024, 1440];
const catalogChildren = plan.adminMenuPlan.after.find(({ label }) => label === 'Catalog').children;

function fixture({ empty = false } = {}) {
  const links = catalogChildren.map(({ label, route }) => `<li><a href="${route}">${label}</a></li>`).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rhino Lapidary Products</title>
<style>
*{box-sizing:border-box}body{margin:0;font:16px/1.5 system-ui;color:#172019}a,button,summary,select{font:inherit}a:focus-visible,button:focus-visible,summary:focus-visible,select:focus-visible{outline:3px solid #164f2d;outline-offset:3px}.page{max-width:1200px;margin:auto;padding:16px}header details{position:relative}header ul,.catalog-nav ul{display:flex;flex-wrap:wrap;gap:8px 20px;list-style:none;padding:0}.catalog-nav a,header a,summary{display:inline-block;padding:12px 4px}.controls{display:flex;flex-wrap:wrap;gap:16px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;padding:0;list-style:none}.card{border:1px solid #667;padding:12px;min-width:0}.card img{display:block;max-width:100%;height:auto}.missing-media{aspect-ratio:1;background:#e8ece8;display:grid;place-items:center}.pagination{display:flex;gap:16px}@media(min-width:750px){.grid{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:749px){header ul,.catalog-nav ul{display:grid;grid-template-columns:minmax(0,1fr)}}
</style></head><body><header class="page"><details><summary>Catalog</summary><ul>${links}</ul></details></header>
<main class="page"><h1>Products</h1><nav class="catalog-nav" aria-label="Catalog categories"><ul>${links}</ul></nav>
<div class="controls"><label>Filter <select><option>All</option><option>Available</option></select></label><label>Sort <select><option>Featured</option><option>Price</option></select></label></div>
${empty ? '<p role="status">No products found. Use fewer filters.</p>' : `<ul class="grid" id="product-grid"><li class="card"><a href="/products/diamond-blade"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23ccd8cc'/%3E%3C/svg%3E" alt="Diamond Blade"></a><h2>Diamond Blade</h2><p>$15.00</p><label>Quantity <input type="number" min="0" value="0"></label><button type="button">Add</button></li><li class="card"><a href="/products/arbor-wrench"><div class="missing-media" aria-hidden="true">No image</div><h2>Arbor Wrench</h2></a><p>$12.00</p><p>Available</p></li></ul><nav aria-label="Pagination"><div class="pagination"><a href="/collections/all?page=1" aria-current="page">1</a><a href="/collections/all?page=2">2</a></div></nav>`}
<section id="g-replacement-parts"><h2>Replacement Parts</h2></section><section id="g-consumables"><h2>Consumables</h2></section><section id="g-accessories"><h2>Accessories</h2></section></main>
<script>document.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.body.dataset.lastRoute=a.getAttribute('href')}));document.querySelector('.card button')?.addEventListener('click',e=>{const input=e.currentTarget.previousElementSibling.querySelector('input');input.value=String(Number(input.value)+1)});</script></body></html>`;
}

for (const width of widths) {
  test(`catalog remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.setContent(fixture());
    await expect(page.getByRole('heading', { level: 1, name: 'Products' })).toBeVisible();
    await expect(page.locator('#product-grid .card')).toHaveCount(2);
    await expect(page.getByRole('navigation', { name: 'Catalog categories' }).getByRole('link')).toHaveCount(5);
    const geometry = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth }));
    expect(geometry.scroll).toBeLessThanOrEqual(geometry.viewport);
  });
}

test('Catalog disclosure and All Products work by keyboard and touch', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.setContent(fixture());
  const summary = page.getByText('Catalog', { exact: true });
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('header details')).toHaveAttribute('open', '');
  await page.keyboard.press('Tab');
  await expect(page.locator('header a').first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('body')).toHaveAttribute('data-last-route', '/collections/all');
  await summary.tap();
  await summary.tap();
  await page.locator('header a').first().tap();
  await expect(page.locator('body')).toHaveAttribute('data-last-route', '/collections/all');
});

test('zoom, focus, fallback, empty state and accessibility remain usable', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.setContent(fixture());
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  const allProducts = page.getByRole('navigation', { name: 'Catalog categories' }).getByRole('link', { name: 'All Products' });
  await allProducts.focus();
  await expect(allProducts).toBeFocused();
  await expect(page.getByText('No image')).toBeVisible();
  const geometry = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.viewport);
  const axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([]);
  await page.setContent(fixture({ empty: true }));
  await expect(page.getByRole('status')).toContainText('No products found');
});

test('representative quantity control remains functional in the photographic grid fixture', async ({ page }) => {
  await page.setContent(fixture());
  const quantity = page.getByLabel('Quantity');
  await expect(quantity).toHaveValue('0');
  await page.getByRole('button', { name: 'Add' }).click();
  await expect(quantity).toHaveValue('1');
});
