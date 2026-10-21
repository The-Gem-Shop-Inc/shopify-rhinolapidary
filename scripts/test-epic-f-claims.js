'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require('@playwright/test');
const { render } = require('./lib/epic-f-liquid-fixtures');
const { read, loadContext } = require('./lib/epic-f-consumer');
const { validateRenderedText } = require('./validate-brand-claims');
const { scanProductSource } = require('./validate-epic-f-claims');

function fixtureContext(product) {
  return { product, request: { page_type: 'product', origin: 'https://fixture.invalid' }, cart: { currency: { iso_code: 'USD' }, items: [] },
    shop: { name: 'Rhino Lapidary', description: 'CE certified' }, page_title: 'CE certified', page_description: product.description,
    canonical_url: 'https://fixture.invalid' + product.url,
    settings: {}, section: { id: 'fixture', settings: {}, blocks: [{ type: 'title', settings: {} }, { type: 'description', settings: {} },
      ...['text', 'custom_liquid', 'collapsible_tab', 'popup', 'icon-with-text'].map(type => ({ type,
        settings: { text: 'CE certified', custom_liquid: 'patented', content: 'CE certified', page: { title: 'patented', content: 'CE certified' } } }))] } };
}

async function run() {
  const c = loadContext();
  const nodes = read('docs/qa/evidence/epic-f/2026-09-10-machine-admin-read.json').data.nodes;
  const sourceFindings = [];
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => route.abort());
    for (const node of nodes) {
      sourceFindings.push(...validateRenderedText(node.id, node.descriptionHtml));
      const product = { id: node.id.split('/').pop(), title: node.title, url: '/products/' + node.handle,
        description: node.descriptionHtml + '<span hidden>CE certified</span>',
        featured_media: { id: 'unsafe-media', alt: 'patented', preview_image: { src: 'https://fixture.invalid/UNREVIEWED.jpg', alt: 'patented' } },
        featured_image: { src: 'https://fixture.invalid/UNREVIEWED.jpg' },
        media: [{ id: 'unsafe-media', media_type: 'model', alt: 'patented' }],
        metafields: { rhino: { input_voltage: { value: 999 }, machine_specs: 'CE certified' },
          shopify: { disclosure: { value: [{ title: { value: 'CE certified' }, content: 'patented',
            display_preferences: { value: { surfaces: ['product_page', 'cart'] } } }] } } },
        variants: [{ id: '100', url: '/products/' + node.handle + '?variant=100', price: 123456, available: true },
          { id: '101', url: '/products/' + node.handle + '?variant=101', price: 234567, available: false }] };
      product.selected_or_first_available_variant = product.variants[0];
      const context = fixtureContext(product);
      const head = render('layout/theme.liquid', context);
      const dom = render('sections/main-product.liquid', context);
      assert.equal(render('sections/disclosures.liquid', context).includes('CE certified'), false);
      const featured = render('sections/featured-product.liquid', { ...context, section: { ...context.section, settings: { product } } });
      const html = head.replace('</body>', dom + featured + '</body>');
      assert.deepEqual(validateRenderedText(node.id, html), []);
      assert(!html.includes('UNREVIEWED') && !html.includes('unsafe-media'));
      const lineItem = { key: 'fixture', product, image: { src: 'https://fixture.invalid/UNREVIEWED.jpg', alt: 'patented' },
        options_with_values: [], properties: {}, quantity: 1 };
      for (const file of ['snippets/card-product.liquid', 'sections/predictive-search.liquid', 'sections/main-cart-items.liquid',
        'snippets/cart-drawer.liquid', 'sections/cart-notification-product.liquid', 'snippets/quick-order-list-row.liquid']) {
        const output = render(file, { ...context, card_product: product, variant: { product }, item: product,
          image: lineItem.image, show_image: true, cart: { ...context.cart, items: [lineItem], item_count: 1 },
          predictive_search: { performed: true, resources: { products: [product], queries: [], collections: [], pages: [], articles: [] } } });
        assert.deepEqual(validateRenderedText(file, output), [], file);
        assert(!output.includes('UNREVIEWED'), file);
      }
      await page.setContent(html, { waitUntil: 'domcontentloaded' });
      const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
      const products = scripts.map(s => JSON.parse(s)).filter(s => s['@type'] === 'Product');
      assert.equal(products.length, 1, 'Main and featured Product cannot emit duplicate Product JSON-LD');
      const data = products[0];
      assert(!('description' in data) && !('image' in data));
      assert.equal(data.name, node.title);
      assert.equal(data.productID, node.id);
      assert.equal(data.offers[0].price, 1234.56);
      assert.equal(data.offers[1].price, 2345.67);
      assert.equal(data.offers[0].priceCurrency, 'USD');
      assert.equal(data.offers[0].availability, 'https://schema.org/InStock');
      assert.equal(data.offers[1].availability, 'https://schema.org/OutOfStock');
      assert(data.offers[1].url.endsWith('?variant=101'));
      assert.equal(await page.locator('meta[name="description"], meta[property="og:description"], meta[name="twitter:description"]').count(), 0);
      assert.deepEqual(validateRenderedText(node.id, await page.content()), []);
      fs.mkdirSync('test-results/epic-f/rendered', { recursive: true });
      fs.writeFileSync(`test-results/epic-f/rendered/${product.id}.html`, html);
    }
    assert(sourceFindings.length > 0, 'Historical Product source findings must remain visible');
    const attacks = ['<div hidden>CE certified</div>', '<meta content="patented" name="description">',
      '<script type="application/ld+json">{"description":"CE certified"}</script>',
      '<img alt="patent pending">', '<span>CE <b>certified</b></span>',
      '<meta content="CE&#32;certified">', '{"description":"CE \\u0063ertified"}'];
    for (const attack of attacks) assert(validateRenderedText('negative-fixture', attack).length, attack);
    for (const attack of ['{{ product.description }}', '{{ product.description | strip_html }}', '{{ product["description"] }}',
      '{{ product | structured_data }}', '{{ product.metafields.rhino.input_voltage.value }}',
      "{% if product.tags contains 'machine' %}", "{% if product.title == 'TrimMaster' %}",
      "{% if product.collections contains 'machines' %}", "{{ 'tests/fixtures/epic-f-consumer.json' }}"]) {
      assert(scanProductSource('snippets/unsafe-future-machine.liquid', attack).length, attack);
    }
    const machine = nodes[0];
    for (const product of [{ id: '1', title: 'TrimMaster', tags: ['machine'], collections: ['machines'], description: 'CE certified', url: '/products/trimmaster', variants: [] },
      { id: machine.id.split('/').pop(), title: 'Plain identity', description: 'CE certified', url: '/products/fixture', variants: [] }]) {
      const context = fixtureContext(product);
      assert.equal(render('snippets/rhino-product-description.liquid', context).trim(), '');
      assert.deepEqual(validateRenderedText('fixture', render('snippets/rhino-product-structured-data.liquid', context)), []);
    }
    const legacy = c.classification.mappings.find(m => m.proposedProductClass === 'consumable');
    const safe = fixtureContext({ id: legacy.productGid.split('/').pop(), title: 'Fixture identity', description: 'Neutral existing description', featured_image: { src: 'https://fixture.invalid/safe.jpg' } });
    assert(render('snippets/rhino-product-description.liquid', safe).includes('Neutral existing description'));
    assert(JSON.parse(render('snippets/rhino-product-structured-data.liquid', safe)).image.endsWith('/safe.jpg'));
    console.log(`F1 claims rendered tests passed: ${nodes.length} saved machine identities; ${attacks.length} hidden/encoded surface attacks; ${sourceFindings.length} historical source matches retained.`);
  } finally { await browser.close(); }
}
if (require.main === module) run().catch(e => { console.error(e); process.exitCode = 1; });
module.exports = { fixtureContext, run };
