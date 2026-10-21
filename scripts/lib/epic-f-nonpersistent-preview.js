'use strict';
// Developer tooling only. No storefront imports and no persistent Shopify writer.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { canonical } = require('./epic-f-governance');
const CSS_SHA = '32f44d332f5b1d51b95213292c54d6e5c17751ebf4e79878eba4e2c17ce5f961';
const PAYLOAD_SHA = 'e7596e5e04423ca3b535a1d4fda123aa32be53859384a03fccb475bc62370d80';
const TARGET = '158631198917';
const PRODUCTION = '158579622085';
const STORE = 'sz5dnk-nf.myshopify.com';
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const read = filename => JSON.parse(fs.readFileSync(filename, 'utf8'));
const fileHash = filename => hash(fs.readFileSync(filename));
const normalize = text => text.replace(/\r\n?/g, '\n');
const PRODUCTS = [
  ['8905779937477', 'BeadMaster 6"', 'beadmaster'],
  ['8905780756677', 'EM-1 Machine', 'em-1'],
  ['8905781412037', 'LapMaster 12"', 'lapmaster-12'],
  ['8905781477573', 'LapMaster 18"', 'lapmaster-18'],
  ['8905784131781', 'SawMaster 18"', 'sawmaster-18'],
  ['8905784197317', 'SawMaster 24"', 'sawmaster-24'],
  ['8905784328389', 'ShapeMaster 6"', 'shapemaster'],
  ['8905785344197', 'TrimMaster', 'trimmaster'],
].map(([id, title, handle]) => ({ id, gid: `gid://shopify/Product/${id}`, title, handle, route: `/products/${handle}` }));
function redactor() {
  let secrets = [];
  return {
    register(...values) { for (const value of values.filter(Boolean)) secrets.push(String(value), encodeURIComponent(String(value))); },
    clear() { secrets = []; },
    text(input) {
      let value = String(input);
      for (const secret of secrets.sort((a, b) => b.length - a.length)) value = value.split(secret).join('[PREVIEW_SECRET_REDACTED]');
      return value.replace(/https?:\/\/[^\s"'<>]+/gi, '[URL_REDACTED]')
        .replace(/(?:[a-z0-9-]+\.)*shopifypreview\.com/gi, '[SIGNED_PREVIEW_HOST_REDACTED]')
        .replace(/shp[a-z]+_[a-z0-9_-]+/gi, '[TOKEN_REDACTED]')
        .replace(/(?:authorization|set-cookie|cookie|bearer)\s*[:=]\s*[^\n]*/gi, '[CREDENTIAL_REDACTED]');
    },
    clean(input) {
      if (typeof input === 'string') return this.text(input);
      if (Array.isArray(input)) return input.map(v => this.clean(v));
      if (input && typeof input === 'object') return Object.fromEntries(Object.entries(input).map(([k, v]) => [this.text(k), this.clean(v)]));
      return input;
    },
    assertClean(text) { for (const secret of secrets) assert.ok(!String(text).includes(secret), 'Credential persistence prevented'); },
  };
}
function safeUrl(input, signedHost = '') {
  const url = new URL(input);
  return { origin: url.hostname === signedHost || /shopifypreview\.com$/i.test(url.hostname) ? '[SIGNED_PREVIEW_HOST_REDACTED]' : url.origin,
    path: url.pathname, queryNames: [...new Set(url.searchParams.keys())] };
}
function routeUrl(signedUrl, route) {
  assert.ok(PRODUCTS.some(p => p.route === route), 'Product route outside eight-product scope');
  const url = new URL(signedUrl); url.pathname = route; url.searchParams.set('view', 'machine'); return url.toString();
}
// The same browser-side function is used for external, inline and Shopify sheets.
function canonicalSheet(sheet) {
  function serialize(rule) {
    const value = { type: rule.type, cssText: rule.cssText.replace(/\r\n?/g, '\n') };
    if (rule.cssRules) value.children = Array.from(rule.cssRules, serialize);
    return value;
  }
  return Array.from(sheet.cssRules, serialize);
}
function prepare(directory, bindingPath = null) {
  const bytes = fs.readFileSync('assets/rhino-custom.css');
  assert.equal(hash(bytes), CSS_SHA, 'Authoritative CSS changed');
  const css = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes);
  const patterns = { url: /\burl\s*\(/gi, import: /@import\b/gi, charset: /@charset\b/gi, sourceMappingURL: /sourceMappingURL/gi,
    closingStyle: /<\/style/gi, liquidOutput: /\{\{/g, liquidTag: /\{%/g, templateComment: /\{#/g, htmlComment: /<!--|-->/g, nul: /\0/g };
  const scans = Object.fromEntries(Object.entries(patterns).map(([name, regex]) => [name, [...css.matchAll(regex)].map(m => ({ offset: m.index, line: css.slice(0, m.index).split('\n').length, text: m[0] }))]));
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const decoded = withoutComments.replace(/\\([a-f0-9]{1,6})\s?|\\([^\r\n])/gi, (_, hex, char) => hex ? String.fromCodePoint(parseInt(hex, 16) || 0xfffd) : char);
  const escapedHazards = [...decoded.matchAll(/\burl\s*\(|@import\b|@charset\b/gi)].map(m => m[0]);
  const atRules = [...new Set([...withoutComments.matchAll(/@[a-z-]+/gi)].map(m => m[0].toLowerCase()))];
  const safe = Object.values(scans).every(v => !v.length) && !escapedHazards.length && atRules.every(v => ['@media', '@keyframes'].includes(v)) && !css.startsWith('\ufeff');
  assert.ok(safe, 'Inline-transport hazard result changed');
  const preparationPath = 'data/epic-f-shell-only-release-preparation.json';
  const preparation = read(preparationPath); const refs = preparation.previewEnvelope.deploymentFiles;
  const cleanup = bindingPath ? read(bindingPath) : null;
  if (cleanup) {
    assert.equal(bindingPath, require('./epic-f-release-cleanup-binding').bindingPath);
    assert.equal(cleanup.priorPayloadSha256, PAYLOAD_SHA);
    for (const row of cleanup.extractions) require('./epic-f-release-cleanup-binding').verifyExtraction(row);
  }
  assert.equal(refs.length, 28); const changes = {};
  for (const ref of refs) { const row=cleanup?.extractions.find(r=>r.path===ref.path); if(row)assert.equal(row.oldSha256,ref.sha256); assert.equal(fileHash(ref.path),row?.newSha256||ref.sha256, `Approved source drift: ${ref.path}`); if (ref.path !== 'assets/rhino-custom.css') changes[ref.path] = { source: fs.readFileSync(ref.path, 'utf8') }; }
  if(cleanup) for(const ref of cleanup.additionalPreviewSources){assert.equal(fileHash(ref.path),ref.sha256);assert.ok(!changes[ref.path]);changes[ref.path]={source:fs.readFileSync(ref.path,'utf8')};}
  const original = changes['layout/theme.liquid'].source;
  const statement = "{{ 'rhino-custom.css' | asset_url | stylesheet_tag }}";
  const replacement = "{% render 'rhino-preview-inline-css' %}";
  assert.equal(original.split(statement).length - 1, 1);
  const transformed = original.replace(statement, replacement);
  assert.equal(transformed.replace(replacement, statement), original); assert.ok(!transformed.includes('rhino-custom.css'));
  const start = '<style data-rhino-nonpersistent-preview-css>', end = '</style>';
  const snippet = start + css + end; assert.equal(snippet.split(css).length - 1, 1); assert.equal(hash(snippet.slice(start.length, -end.length)), CSS_SHA);
  changes['layout/theme.liquid'].source = transformed; changes['snippets/rhino-preview-inline-css.liquid'] = { source: snippet };
  const payload = JSON.stringify({ metadata: { version: '0.1.0' }, theme_changes: changes }, null, 2) + '\n';
  const expectedPayloadSha = cleanup?.payloadSha256 || PAYLOAD_SHA, expectedFiles = cleanup?.fileCount || 28;
  assert.equal(hash(payload), expectedPayloadSha, 'Approved payload bytes changed'); assert.equal(Object.keys(changes).length, expectedFiles);
  assert.ok(!Object.keys(changes).some(p => p.startsWith('assets/')));
  assert.ok(!/shp[a-z]+_[A-Za-z0-9_-]{12,}|-----BEGIN .*PRIVATE KEY-----|Bearer\s+[A-Za-z0-9._-]{20,}/.test(payload));
  fs.mkdirSync(directory, { recursive: true }); const payloadPath = path.join(directory, 'overrides.json'); fs.writeFileSync(payloadPath, payload);
  return { css, payloadPath, proof: { safety: { cssInlineTransportSafe: safe, scans, escapedHazards, atRules },
    layerA: { cssRawSha256: CSS_SHA, bytes: bytes.length, sourceIncludedExactlyOnce: true, extractedCssSha256: CSS_SHA, wrapperOnly: true },
    payloadSha256: expectedPayloadSha, fileCount: expectedFiles, explicitSourceBinding: bindingPath, files: Object.entries(changes).map(([path, op]) => ({ path, sha256: hash(op.source) })),
    layout: { line: 297, statement, replacement, replacementCount: 1, originalSha256: hash(original), transformedSha256: hash(transformed), onlyExpectedChange: true },
    preparationSha256: fileHash(preparationPath), sources: refs } };
}
function assertState(snapshot, reference) {
  for (const key of ['identity', 'inventory', 'products']) assert.ok(snapshot[key]?.response?.data && !snapshot[key].response.errors, `Read failed: ${key}`);
  const identity = snapshot.identity.response.data;
  assert.equal(identity.shop.id, 'gid://shopify/Shop/79279947973');
  assert.equal(identity.preview.id, `gid://shopify/OnlineStoreTheme/${TARGET}`);
  assert.equal(identity.preview.name, 'Rhino Lapidary - Preview'); assert.equal(identity.preview.role, 'UNPUBLISHED');
  assert.notEqual(identity.preview.id, `gid://shopify/OnlineStoreTheme/${PRODUCTION}`);
  const files = snapshot.inventory.response.data.theme.files;
  assert.ok(!files.pageInfo.hasNextPage && !identity.preview.files.pageInfo.hasNextPage); assert.equal(files.nodes.length, 409);
  assert.ok(!files.nodes.some(f => ['templates/product.machine.json', 'snippets/rhino-preview-inline-css.liquid'].includes(f.filename)));
  const products = snapshot.products.response.data.nodes; assert.equal(products.length, 11);
  assert.ok(products.every(p => !p.metafields.pageInfo.hasNextPage && !p.resourcePublications.pageInfo.hasNextPage));
  if (reference) for (const key of ['identity', 'inventory', 'products']) assert.equal(canonical(snapshot[key].response.data), canonical(reference[key].response.data), `Persistent drift: ${key}`);
  return { allFileRecordsUnchanged: !!reference, allProductRecordsUnchanged: !!reference, files: 409, products: 11,
    css: files.nodes.find(f => f.filename === 'assets/rhino-custom.css'), layout: files.nodes.find(f => f.filename === 'layout/theme.liquid'),
    machineTemplateAbsent: true, inlineSnippetAbsent: true, themeUpdatedAt: identity.preview.updatedAt,
    stateDigests: Object.fromEntries(['identity', 'inventory', 'products'].map(k => [k, hash(canonical(snapshot[k].response.data))])) };
}
function reserveSession(directory) {
  // Durable receipt prevents automatic recreation after a crash; no reset/retry path.
  fs.writeFileSync(path.join(directory, 'one-session-cap.json'), JSON.stringify({ reservedAt: new Date().toISOString(), target: TARGET, cap: 1 }) + '\n', { flag: 'wx' });
}
function isTransactionRequest({ pathname, method, resourceType }) {
  // Native, read-only provider assets do not initiate a checkout. Blocking them
  // would alter the provider surface being observed by this diagnostic.
  const nativeReadOnlyAsset = /\/checkouts\/internal\/[^/]+\.(?:js|css)$/.test(pathname) && method === 'GET' && ['script', 'stylesheet'].includes(resourceType);
  return (!nativeReadOnlyAsset && /\/(?:checkout|checkouts)(?:\/|$)/.test(pathname)) || /\/cart\/(?:add|change|update|clear)(?:\.js)?$/.test(pathname) ||
    (method !== 'GET' && method !== 'HEAD' && /\/(?:cart|contact|orders)(?:\/|$)/.test(pathname));
}
module.exports = { CSS_SHA, PAYLOAD_SHA, TARGET, PRODUCTION, STORE, PRODUCTS, hash, read, fileHash, normalize, redactor, safeUrl, routeUrl, canonicalSheet, prepare, assertState, reserveSession, isTransactionRequest };
