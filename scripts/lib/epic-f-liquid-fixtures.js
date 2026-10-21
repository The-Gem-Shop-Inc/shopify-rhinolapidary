'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { Liquid } = require('liquidjs');

// Render repository Liquid. Only Shopify platform tags/filters unavailable in
// Node are emulated; routing, conditionals, captures, loops and snippets run unchanged.
function normalize(source) {
  return source.replace(/\{%[-]?\s*schema\s*[-]?%\}[\s\S]*?\{%[-]?\s*endschema\s*[-]?%\}/g, '')
    .replace(/\{%(-?)\s*(style|form|paginate)\b[^%]*%\}/g, '{% if true %}')
    .replace(/\{%(-?)\s*end(style|form|paginate)\s*-?%\}/g, '{% endif %}');
}
function render(file, context, overrides = {}) {
  const engine = new Liquid({ root: path.resolve('snippets'), extname: '.liquid', globals: context, jsTruthy: false });
  const impl = engine.options.fs;
  engine.options.fs = { ...impl, readFileSync: p => normalize(overrides[p.replaceAll('\\', '/')] ?? fs.readFileSync(p, 'utf8')) };
  for (const tag of ['section', 'sections', 'content_for']) engine.registerTag(tag, { render: () => '' });
  engine.registerFilter('json', v => JSON.stringify(v ?? null));
  engine.registerFilter('image_url', v => v?.src || v?.url || 'https://fixture.invalid/image.jpg');
  engine.registerFilter('image_tag', v => `<img src="${v}">`);
  engine.registerFilter('asset_url', v => `/assets/${v}`);
  engine.registerFilter('t', v => v);
  engine.registerFilter('standard_event_data', () => '{}');
  engine.registerFilter('structured_data', p => JSON.stringify({ '@type': 'Product', name: p.title, description: p.description,
    image: p.featured_image?.src, offers: [] }));
  return engine.parseAndRenderSync(normalize(overrides[file] ?? fs.readFileSync(file, 'utf8')), context);
}
module.exports = { render };
