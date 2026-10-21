'use strict';
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { median, isAllowedHost, summarizeResources } = require('../validate-brand-performance-budget');
const budget = require('../../data/brand-performance-budget.json');
const identities = require('../../data/epic-e-product-identity.json');
const release = require('../../data/epic-f-consumer-release.json');
const validateRecord = new (require('ajv/dist/2020'))({ strict: false, allErrors: true }).compile(require('../../schemas/epic-f-performance-measurement.schema.json'));
const metricNames = ['lcpMs', 'cls', 'tbtMs', 'initialTransferBytes', 'imageBytes', 'maxImageBytes', 'firstScreenMediaBytes', 'requestCount', 'immediateVideoIframeCount', 'autoplayMediaCount', 'thirdPartyScriptHostCount', 'synchronousThirdPartyScriptCount'];
const readPath = (o, path) => path.split('.').reduce((v, k) => v?.[k], o);
function policyLimits(profile, policy = budget) {
  assert(['mobile', 'desktop'].includes(profile));
  return Object.fromEntries(metricNames.map(name => {
    const key = ['initialTransferBytes', 'imageBytes', 'maxImageBytes', 'firstScreenMediaBytes', 'requestCount'].includes(name) ? profile + name[0].toUpperCase() + name.slice(1) : name;
    const refs = policy.machineProduct.thresholds[key];
    assert(Array.isArray(refs) && refs.length > 0, `Missing budget ${key}`);
    const limits = refs.map(ref => readPath(policy, ref));
    assert(limits.every(v => Number.isFinite(v) && v >= 0), `Invalid budget ${key}`);
    return [name, Math.min(...limits)];
  }));
}
function strictMedian(values) {
  assert(Array.isArray(values) && values.length && values.every(v => typeof v === 'number' && Number.isFinite(v)), 'Malformed median sample set');
  return median(values);
}
function attributeResource(resource, origin) {
  const u = new URL(resource.url), base = new URL(origin);
  if (/(?:^|\.)(?:shop\.app|shopify\.com|shopifysvc\.com)$/.test(u.hostname) && /payment|installment|shop-pay|pay\/|wallet/.test(u.pathname)) return 'native-payment-provider';
  if (/preview|theme-editor|shopify-preview-bar/.test(u.pathname)) return 'preview-tooling';
  if (u.origin === base.origin && /^\/(?:[a-z]{2}(?:-[A-Z]{2})?\/)?recommendations\/products(?:\.json)?$/.test(u.pathname)) return 'native-recommendations';
  if (u.origin === base.origin && /^\/assets\/rhino-/.test(u.pathname)) return 'rhino-theme';
  if (u.origin === base.origin && /^\/assets\//.test(u.pathname)) return 'native-trade-theme';
  if (u.origin === base.origin && /^\/fixture-media\//.test(u.pathname)) return 'synthetic-fixture-media';
  if (u.origin === base.origin) return 'first-party';
  if (/video\.fixture\.invalid/.test(u.hostname)) return 'synthetic-video-provider';
  if (isAllowedHost(u.hostname, budget, base.hostname)) return 'native-shopify';
  return 'third-party';
}
function resourceMetrics(resources, origin) {
  const summary = summarizeResources(resources, budget, new URL(origin).hostname);
  return { summary, resources: resources.map(r => ({ ...r, attribution: attributeResource(r, origin) })) };
}
function evaluateSample(sample) {
  if (!sample || typeof sample !== 'object' || Array.isArray(sample)) return ['malformed sample'];
  const errors = [];
  const add = (test, message) => { if (!test) errors.push(message); };
  add(['local-fixture', 'preview', 'production'].includes(sample.environment?.kind), 'missing environment identity');
  add(typeof sample.timestamp === 'string' && Number.isFinite(Date.parse(sample.timestamp)), 'missing timestamp');
  add(sample.navigation?.status === 200 && sample.navigation?.completed === true, 'navigation failure or HTTP error');
  add(sample.navigation?.pageKind === 'product' && !sample.navigation?.password && !sample.navigation?.challenge, 'non-Product/error/password/challenge page');
  const id = sample.identity;
  const known = identities.productIdentities.find(p => p.productGid === id?.productGid);
  add(known && release.routes.some(r => r.productGid === id?.productGid && r.productClass === 'machine'), 'unknown Product identity');
  add(id?.template === 'product.machine', 'wrong template identity');
  add(known && id.requestedRoute === '/products/' + known.handle && id.resolvedRoute === id.requestedRoute, 'wrong route identity');
  try {
    const requested = new URL(id.requestedUrl), resolved = new URL(id.resolvedUrl);
    add(requested.origin === resolved.origin && requested.pathname === id.requestedRoute && resolved.pathname === id.resolvedRoute, 'URL/route mismatch');
    if (sample.environment?.kind === 'local-fixture') add(['127.0.0.1', 'localhost'].includes(requested.hostname) && sample.fixtureOnly === true, 'local fixture identity mismatch');
    else add(!['127.0.0.1', 'localhost', 'machine.local'].includes(requested.hostname) && sample.fixtureOnly === false, 'fixture masquerading as live');
  } catch { errors.push('missing requested/resolved URL'); }
  add(sample.viewport && ['mobile', 'desktop'].includes(sample.viewport.profile) && sample.viewport.width > 0 && sample.viewport.height > 0 && sample.viewport.deviceScaleFactor > 0, 'missing viewport/device profile');
  add(sample.policy?.cache && sample.policy?.throttling?.id && sample.policy?.settleMs === budget.runtime.settleMs, 'missing cache/throttling/settle policy');
  add(sample.networkObservation === 'complete' && Array.isArray(sample.resources) && sample.resources.length > 0 && sample.resources.every(r => r.completed && !r.failed && r.status > 0 && r.status < 400 && Number.isFinite(r.bytes) && r.bytes >= 0 && r.attribution), 'missing or failed network observations');
  if (Array.isArray(sample.resources)) {
    try {
      const { summary, resources } = resourceMetrics(sample.resources, id.requestedUrl);
      for (const [name, expected] of Object.entries({ initialTransferBytes: summary.totalTransferBytes, imageBytes: summary.imageBytes, maxImageBytes: summary.maxImageBytes, requestCount: summary.resourceCount, thirdPartyScriptHostCount: summary.thirdPartyScriptHosts.length })) {
        add(sample.metrics?.[name]?.value === expected, `${name}: resource accounting mismatch`);
      }
      add(resources.every((r, i) => r.attribution === sample.resources[i].attribution), 'host attribution mismatch');
      add(resources.every(r => !/(^|\.)(youtube\.com|youtube-nocookie\.com|ytimg\.com|vimeo\.com|vimeocdn\.com|video\.fixture\.invalid)$/.test(new URL(r.url).hostname)), 'eager video provider request');
    } catch { errors.push('malformed resource observations'); }
  }
  const limits = policyLimits(sample.viewport?.profile === 'desktop' ? 'desktop' : 'mobile');
  for (const name of metricNames) {
    const metric = sample.metrics?.[name];
    add(metric?.status === 'measured' && typeof metric.value === 'number' && Number.isFinite(metric.value) && metric.value >= 0, `${name}: missing/unsupported observation`);
    if (metric?.status === 'measured') add(metric.value <= limits[name], `${name}: budget ${limits[name]} exceeded (${metric.value})`);
  }
  add(sample.metrics?.lcpMs?.value > 0, 'LCP requires an observed candidate');
  add(sample.media?.dimensionsValid === true, 'media dimensions missing');
  add(sample.media?.secondaryLazy === true, 'noncritical media eagerly loaded');
  add(sample.duplicateProductScripts === 0, 'duplicate Product script initialization');
  if (sample.secondaryInspection) add(sample.secondaryInspection.maxImageBytes <= limits.maxImageBytes && sample.secondaryInspection.observation === 'complete', 'secondary image budget exceeded or unobserved');
  return errors;
}
function mediansFor(samples) {
  return Object.fromEntries(metricNames.map(name => [name, strictMedian(samples.map(s => s.metrics[name].value))]));
}
function evaluateRun(record) {
  const errors = [];
  if (!record || typeof record !== 'object') return ['malformed record'];
  if (!validateRecord(record)) errors.push('measurement schema invalid: ' + JSON.stringify(validateRecord.errors));
  if (!Array.isArray(record.samples) || !record.samples.length || !Number.isInteger(record.requestedRuns) || record.requestedRuns < 1 || record.samples.length !== record.requestedRuns) return ['malformed sample set or run count'];
  if (record.samples.some(s => !s || typeof s !== 'object' || Array.isArray(s))) return ['malformed sample'];
  for (const s of record.samples) errors.push(...evaluateSample(s));
  if (!['fixture-regression', 'preview-diagnostic', 'release-certification'].includes(record.stage)) errors.push('unknown measurement stage');
  if (record.stage === 'fixture-regression' && record.samples.some(s => s.environment?.kind !== 'local-fixture' || !s.fixtureOnly)) errors.push('fixture stage environment mismatch');
  if (record.stage !== 'fixture-regression' && record.samples.some(s => s.fixtureOnly || s.environment?.kind === 'local-fixture')) errors.push('fixture-only run cannot certify live performance');
  if (record.stage === 'release-certification') {
    if (record.samples.filter(s => s.viewport?.profile === 'mobile').length < budget.machineProduct.releasePolicy.minimumMobileRuns) errors.push('release requires at least three representative mobile runs');
    if (!record.authorizationRef || !record.widgetDecisionRef) errors.push('release authorization/native-widget dependency missing');
    for (const s of record.samples) {
      if (!s.environment?.theme?.verified || !s.environment.theme.id || !s.environment.theme.name) errors.push('actual theme identity missing');
      const t = s.policy?.throttling;
      if (!['cold', 'warm', 'cold-no-store'].includes(s.policy?.cache)) errors.push('release cache policy missing');
      if (!['slow-4g', 'approved-mobile-profile'].includes(t?.id) || !(t?.latencyMs > 0) || !(t?.downloadBytesPerSecond > 0) || !(t?.uploadBytesPerSecond > 0) || !(t?.cpuSlowdown >= 1) || (t.id === 'approved-mobile-profile' && !t.approvalRef)) errors.push('release throttling profile missing');
    }
  }
  const signatures = record.samples.map(s => JSON.stringify([s.identity, s.viewport, s.policy, s.environment, s.galleryState]));
  if (new Set(signatures).size !== 1) errors.push('samples do not share route/environment/profile/media policy');
  try { assert.deepEqual(record.medians, mediansFor(record.samples)); } catch { errors.push('incorrect median calculation or malformed metric samples'); }
  return errors;
}
function policyHash(policy) { const { machineProduct, ...existing } = policy; return createHash('sha256').update(JSON.stringify(existing)).digest('hex'); }
module.exports = { metricNames, policyLimits, strictMedian, evaluateSample, evaluateRun, mediansFor, resourceMetrics, attributeResource, policyHash };
