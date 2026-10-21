'use strict';
const fs = require('node:fs');
const http = require('node:http');
const base = require('./epic-f-machine-fixtures');
const { fixtureLiquid } = require('./epic-f-media');
const seed = require('../../tests/fixtures/epic-f-gallery.json');
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const read = f => fs.readFileSync(f, 'utf8');
function galleryFixture(state = 'one') {
  const f = structuredClone(seed);
  const second = { ...structuredClone(f.items[0]), assetIdentity: 'urn:rhino:fixture:media:side', mediaId: 'fixture-side', source: '/fixture-media/side.svg', alt: 'Synthetic test object, side view.' };
  const video = { ...structuredClone(f.items[0]), assetIdentity: 'urn:rhino:fixture:media:video', mediaId: 'fixture-video', source: '/fixture-media/video.svg', type: 'external_video', alt: 'Synthetic test object video poster.' };
  if (['multiple', 'oversized-secondary', 'eager-secondary', 'duplicate-script'].includes(state)) f.items.push(second);
  if (state === 'several') {
    f.items.push(second);
    for (const name of ['side-two', 'side-three']) {
      f.items.push({ ...structuredClone(second), assetIdentity: `urn:rhino:fixture:media:${name}`, mediaId: `fixture-${name}`, source: `/fixture-media/${name}.svg`, alt: `Synthetic test object, ${name} view.` });
      f.existingAssets.push(`urn:rhino:fixture:media:${name}`);
    }
  }
  if (['video', 'eager-video', 'autoplay'].includes(state)) f.items.push(video);
  if (state === 'zero') f.items = [];
  if (state === 'duplicate') f.items.push(structuredClone(f.items[0]));
  if (state === 'wrong-model') f.items[0].modelProductGid = 'gid://shopify/Product/8905785868485';
  if (state === 'wrong-product') f.items[0].productGid = 'gid://shopify/Product/8905785868485';
  if (state === 'unapproved') f.items[0].exactModelUse.state = 'proposed';
  if (state === 'rights-missing') delete f.items[0].rightsUse;
  if (state === 'alt-missing') delete f.items[0].altApproval;
  if (state === 'claims-blocked') f.items[0].embeddedClaims.state = 'blocked';
  if (state === 'deleted') f.items[0].lifecycle = 'deleted';
  if (state === 'orphan') f.existingAssets = [];
  if (state === 'shared') f.items[0].observedProductGids = [f.productGid, 'gid://shopify/Product/8905785868485'];
  if (state === 'expired') f.items[0].expiresAt = '2020-01-01T00:00:00Z';
  if (['draft', 'unpublished'].includes(state)) f.productState = state;
  return f;
}
function configureEngine(ctx, input, allowFixtures = true) {
  const e = base.engine(ctx, {}, allowFixtures ? { 'rhino-product-media-eligibility.liquid': fixtureLiquid(input) } : {});
  const images = new Map();
  const args = values => Object.fromEntries(values.filter(Array.isArray));
  e.registerFilter('image_url', (image, ...options) => {
    image = image.preview_image || image;
    const a = args(options), width = Math.min(a.width || image.width, image.width);
    const url = `${image.src}?width=${width}`;
    images.set(url, { ...image, width, height: Math.round(width / image.aspect_ratio) });
    return url;
  });
  e.registerFilter('image_tag', (url, ...options) => {
    const image = images.get(url), a = args(options);
    const widths = String(a.widths || image.width).split(',').map(Number).filter(w => w <= image.width);
    return `<img src="${esc(url)}" srcset="${widths.map(w => `${image.src}?width=${w} ${w}w`).join(', ')}" sizes="${esc(a.sizes || '100vw')}" width="${image.width}" height="${image.height}" alt="${esc(a.alt ?? image.alt)}" ${a.loading ? `loading="${a.loading}"` : ''} ${a.class ? `class="${a.class}"` : ''} ${a.id ? `id="${a.id}"` : ''}>`;
  });
  e.registerFilter('external_video_url', (media, ...options) => `http://video.fixture.invalid/embed/${media.id}?autoplay=${args(options).autoplay ? 1 : 0}`);
  e.registerFilter('external_video_tag', (url, ...options) => `<iframe src="${esc(url)}" class="${esc(args(options).class)}" title="Synthetic fixture video" loading="lazy" allowfullscreen></iframe>`);
  return e;
}
function galleryDocument(state, options = {}) {
  const input = options.input || galleryFixture(state);
  const ctx = base.contextFor('tracked-available', { productId: input.productGid.split('/').pop() });
  ctx.request.host = 'machine.local';
  ctx.product.media = input.items.map(i => ({ id: i.mediaId, alt: i.alt, media_type: i.type, aspect_ratio: i.width / i.height,
    preview_image: { src: i.source, width: i.width, height: i.height, aspect_ratio: i.width / i.height, alt: i.alt }, host: 'youtube', external_id: i.mediaId }));
  ctx.product.selected_or_first_available_variant.featured_media = ctx.product.media[0] || null;
  // Native mobile thumbnails are a presentation fixture; live F2 template is unchanged.
  ctx.section.settings = { ...ctx.section.settings, mobile_thumbnails: 'show' };
  const e = configureEngine(ctx, input, options.allowFixtures !== false);
  const body = ['draft', 'unpublished'].includes(state) ? '<h1>Page not found</h1>' : e.parseAndRenderSync(base.normalize(read('sections/main-product.liquid')), ctx);
  let doc = base.documentFor('tracked-available').replace(/<main id="MainContent">[\s\S]*?<\/main>/, `<main id="MainContent"><section id="shopify-section-machine" class="shopify-section">${body}</section></main>`)
    .replace('</head>', `<script>window.accessibilityStrings={imageAvailable:'Image [index] is available'};</script></head>`);
  if (state === 'eager-secondary') doc = doc.replaceAll('loading="lazy"', 'loading="eager"');
  if (state === 'eager-video') doc = doc.replace('</main>', '<iframe src="http://video.fixture.invalid/embed/eager?autoplay=0" title="Negative eager fixture"></iframe></main>');
  if (state === 'autoplay') doc = doc.replace('</main>', '<video autoplay muted></video></main>');
  if (state === 'duplicate-script') doc = doc.replace('</main>', '<script src="/assets/product-info.js" defer></script></main>');
  if (state === 'sync-third-party') doc = doc.replace('</head>', '<script src="http://unapproved.fixture.invalid/test.js"></script></head>');
  return doc;
}
function imageBody(name, state, width) {
  const oversized = width > 416 && ((state === 'oversized-hero' && name === 'front') || (state === 'oversized-secondary' && name === 'side'));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="#eee"/><rect x="150" y="150" width="900" height="600" fill="#777"/><text x="200" y="470" font-size="72">LOCAL TEST ${name}</text>${oversized ? '<!--' + 'x'.repeat(600000) + '-->' : ''}</svg>`;
}
async function startFixtureServer(state, options = {}) {
  const requests = [];
  const doc = options.document ?? galleryDocument(state, options);
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://localhost');
    let body, type = 'text/html', status = 200;
    if (/^\/assets\/[a-z0-9.-]+$/.test(u.pathname) && fs.existsSync('.' + u.pathname)) {
      body = fs.readFileSync('.' + u.pathname); type = u.pathname.endsWith('.js') ? 'application/javascript' : 'text/css';
    } else if (/^\/fixture-media\/(front|side|side-two|side-three|video)\.svg$/.test(u.pathname)) {
      body = imageBody(u.pathname.split('/').pop().split('.')[0], state, Number(u.searchParams.get('width'))); type = 'image/svg+xml';
    } else if (u.searchParams.get('section_id') === 'pickup-availability' && options.pickupBody !== undefined) {
      body = options.pickupBody; status = options.pickupStatus || 200;
    } else if (u.pathname === base.contextFor('tracked-available').product.url) {
      body = doc; status = ['draft', 'unpublished'].includes(state) ? 404 : 200;
    } else if (u.pathname === '/favicon.ico') { body = ''; status = 204; }
    else { body = '<h1>Not found</h1>'; status = 404; }
    requests.push({ path: req.url, bytes: Buffer.byteLength(body), status });
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(body) });
    res.end(body);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  return { origin, url: origin + base.contextFor('tracked-available').product.url, requests, close: () => new Promise(resolve => server.close(resolve)) };
}
async function mountGallery(page, state, options = {}) {
  const server = await startFixtureServer(state, options);
  const external = [], errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === server.origin) return route.continue();
    external.push(url.href);
    return route.fulfill({ body: url.pathname.endsWith('.js') ? '' : '<!doctype html><title>Synthetic provider fixture</title><button>Play fixture</button>', contentType: url.pathname.endsWith('.js') ? 'text/javascript' : 'text/html' });
  });
  await page.goto(server.url);
  return { ...server, external, errors };
}
module.exports = { galleryFixture, galleryDocument, startFixtureServer, mountGallery };
