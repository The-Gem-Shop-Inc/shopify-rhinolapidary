'use strict';
// Read-only/local certification disposition. This script never launches a storefront sample.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const os = require('node:os');
const { chromium } = require('@playwright/test');
const Ajv = require('ajv/dist/2020');
const P = require('./lib/epic-f-performance');
const M = require('./lib/epic-f-live-machine-activation');
const DIR = 'docs/qa/evidence/epic-f/015b-live-2026-10-06';
const CORRECTED = 'docs/qa/evidence/epic-f/header-focus-correction-2026-10-06';
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const hash = b => createHash('sha256').update(b).digest('hex');
const write = (n, value) => fs.writeFileSync(DIR + '/' + n, JSON.stringify(value, null, 2) + '\n');
const missing = () => Object.fromEntries(P.metricNames.map(n => [n, { status: 'missing', value: null }]));
function runtimeInventory() {
  const paths = [];
  function walk(p) { for (const e of fs.readdirSync(p, { withFileTypes: true })) { const name = p + '/' + e.name; if (e.isDirectory()) walk(name); else paths.push(name); } }
  for (const p of ['assets', 'layout', 'locales', 'sections', 'snippets', 'templates', 'config']) walk(p);
  return paths.sort().map(path => ({ path, sha256: hash(fs.readFileSync(path)) }));
}
function gate() {
  const binding = read(CORRECTED + '/source-binding.json');
  const { bindingSha256, ...body } = binding;
  assert.equal(binding.identity, 'GLOBAL_HEADER_FOCUS_CORRECTION_2026_10_06');
  assert.equal(bindingSha256, '7f9156cef929619f7e9fb38ee5f51e740c7d63fe0efdeaf4cc510eaf32b72e37');
  assert.equal(hash(JSON.stringify(body)), bindingSha256);
  assert.equal(binding.files.length, 29);
  const themes = read(DIR + '/themes-before.json');
  const main = themes.response.data.main;
  assert.ok(!themes.response.errors);
  assert.equal(main.id, 'gid://shopify/OnlineStoreTheme/158579622085');
  assert.equal(main.name, 'shopify-rhinolapidary/main');
  assert.equal(main.role, 'MAIN');
  assert.equal(main.files.pageInfo.hasNextPage, false);
  const previous = read(CORRECTED + '/themes-final.json').response.data.main;
  assert.deepEqual(main.files.nodes, previous.files.nodes, 'Remote live inventory drift');
  const checkedFiles = binding.files.map(f => {
    assert.equal(hash(fs.readFileSync(f.path)), f.sha256, 'Local source drift: ' + f.path);
    const actual = main.files.nodes.find(a => a.filename === f.path);
    const prior = previous.files.nodes.find(a => a.filename === f.path);
    assert.ok(actual && prior); assert.equal(actual.checksumMd5, prior.checksumMd5);
    return { path: f.path, sourceSha256: f.sha256, storedMd5: actual.checksumMd5, exactPreviouslyVerifiedStoredBinding: true };
  });
  const header = main.source.nodes.find(f => f.filename === 'sections/header.liquid');
  assert.equal(hash(header.body.content), 'e9e34d8dae4c59cf5040b010339e2124e46d71f89d960d80f1a9ef1589d93339');
  const catalog = read(DIR + '/catalog-before.json');
  assert.equal(catalog.paginationExhausted, true); assert.equal(catalog.products.length, 122);
  assert.deepEqual(catalog.products, read(CORRECTED + '/catalog-after.json').products, 'Product/Variant drift since corrected source review');
  function exhausted(value) { if (!value || typeof value !== 'object') return; if (value.pageInfo) assert.equal(value.pageInfo.hasNextPage, false); for (const v of Object.values(value)) exhausted(v); }
  const classes = {}, machines = [];
  for (const product of catalog.products) {
    exhausted(product);
    const rhino = product.metafields.nodes.filter(m => m.namespace === 'rhino');
    assert.equal(rhino.length, 1); assert.equal(rhino[0].key, 'product_class');
    const cls = rhino[0].jsonValue; classes[cls] = (classes[cls] || 0) + 1;
    if (cls === 'machine') {
      const assigned = M.PRODUCTS.some(p => p.gid === product.id);
      assert.equal(product.templateSuffix, assigned ? 'machine' : null);
      machines.push({ gid: product.id, handle: product.handle, suffix: product.templateSuffix, productClass: cls, variantGids: product.variants.nodes.map(v => v.id), status: product.status, publishedAt: product.publishedAt });
    }
  }
  assert.deepEqual(classes, { machine: 11, replacement_part: 54, consumable: 39, accessory: 18 });
  const current = read('data/epic-f-current-development-status.json');
  assert.equal(current.F_DEC_001, 'APPROVED_OPTION_A');
  assert.equal(current.F_PBI_017B, 'COMPLETE');
  assert.equal(current.F_PBI_014B_currentShell, 'PASS');
  assert.equal(current.F_PBI_014B_closedCriteria[0].id, 'F014B-FOCUS-CURRENT');
  assert.equal(current.F_PBI_014B_closedCriteria[0].state, 'COMPLETE');
  const result = { checkedAt: new Date().toISOString(), passed: true, mainTheme: { id: '158579622085', name: main.name, role: main.role }, completeFileInventory: main.files.nodes.length, checkedFiles, machines, distribution: classes, factualGrants: 0, F_DEC_001: current.F_DEC_001, sourceBindingIdentity: binding.identity, sourceBindingSha256: bindingSha256, beforeReadCompletedAt: catalog.completedAt, browserRouteIdentity: 'NOT_EXERCISED_NO_PERFORMANCE_SAMPLES', APIversion: 'Not exposed by connector' };
  write('before-drift-gate.json', result);
  if (!fs.existsSync(DIR + '/runtime-source-before.json')) write('runtime-source-before.json', runtimeInventory());
  return result;
}
function validateEvidence(record) {
  const schema = read('schemas/epic-f-performance-measurement.schema.json');
  const before = read(DIR + '/schema-before.json');
  const { $defs, ...root } = schema;
  assert.deepEqual(root, JSON.parse(before.body), 'Existing measurement schema must remain unchanged');
  assert.deepEqual(Object.keys($defs), ['certificationPreflight']);
  const ajv = new Ajv({ strict: false, allErrors: true });
  ajv.addSchema(schema, 'existing-f-performance');
  const validate = ajv.compile({ $ref: 'existing-f-performance#/$defs/certificationPreflight' });
  assert.ok(validate(record), JSON.stringify(validate.errors));
  assert.equal(record.sourceBinding.identity, 'GLOBAL_HEADER_FOCUS_CORRECTION_2026_10_06');
  assert.equal(record.sourceBinding.canonicalSha256, '7f9156cef929619f7e9fb38ee5f51e740c7d63fe0efdeaf4cc510eaf32b72e37');
  assert.equal(record.sourceBinding.headerSha256, 'e9e34d8dae4c59cf5040b010339e2124e46d71f89d960d80f1a9ef1589d93339');
  assert.equal(record.authorization.approvalMode, 'delegated_development_override');
  assert.deepEqual(record.profiles, { mobile: { width: 390, height: 900, deviceScaleFactor: 1 }, desktop: { width: 1440, height: 900, deviceScaleFactor: 1 } });
  assert.equal(record.policy.settleMs, 1500); assert.equal(record.policy.interRunDelayMs, 2500);
  const keys = new Set();
  for (const r of record.records) {
    const product = M.PRODUCTS.find(p => p.gid === r.productGid); assert.ok(product); assert.equal(r.route, product.route);
    const key = [r.productGid, r.profile, r.cache].join('|'); assert.ok(!keys.has(key)); keys.add(key);
    assert.equal(r.classification, r.profile === 'mobile' ? 'RELEASE_CERTIFICATION' : 'SUPPORTING_RELEASE_COMPARISON');
    assert.deepEqual(r.thresholds, P.policyLimits(r.profile)); assert.deepEqual(r.metrics, missing());
  }
  assert.equal(keys.size, 32);
  assert.ok(P.evaluateRun(record).length > 0, 'A preflight stop must never certify as a measured run');
  return { schemaValid: true, existingMeasuredRecordSchemaUnchanged: true, evaluateRunRejectsPreflightAsCertification: true, plannedRecords: 32, plannedSamples: 96, actualSamples: 0 };
}
async function build() {
  const beforeGate = gate();
  const budget = read('data/brand-performance-budget.json');
  const sourceBinding = read(CORRECTED + '/source-binding.json');
  const browser = await chromium.launch(); let version;
  try { version = browser.version(); } finally { await browser.close(); }
  const profiles = { mobile: { width: 390, height: 900, deviceScaleFactor: 1 }, desktop: { width: 1440, height: 900, deviceScaleFactor: 1 } };
  const records = M.PRODUCTS.flatMap(p => ['mobile', 'desktop'].flatMap(profile => ['cold', 'warm'].map(cache => ({ route: p.route, productGid: p.gid, profile, cache, classification: profile === 'mobile' ? 'RELEASE_CERTIFICATION' : 'SUPPORTING_RELEASE_COMPARISON', state: 'NOT_SAMPLED_PRECONDITION_BLOCKED', requestedRuns: 3, samples: [], medians: null, metrics: missing(), thresholds: P.policyLimits(profile), violations: ['PRECONDITION_APPROVED_CONCRETE_THROTTLE_UNRESOLVED'], identityVerification: { AdminIdentityAndAssignedSuffix: 'VERIFIED_BEFORE_READ', MAINBinding: 'VERIFIED_BEFORE_READ', actualHTTPAndDOM: 'NOT_EXERCISED_NO_SAMPLES' }, resourceAttribution: null, providerState: 'NOT_MEASURED' }))));
  const authorities = ['data/brand-performance-budget.json', 'docs/qa/rhino-brand-media-performance-budget.md', 'docs/project/epic-f-shell-only-release-handoff.md', 'scripts/lib/epic-f-performance.js', 'scripts/run-epic-f-machine-performance.js', 'scripts/test-epic-f-performance.js'].map(path => ({ path, sha256: hash(fs.readFileSync(path)) }));
  const record = {
    schemaVersion: 1, kind: 'F_PBI_015B_CERTIFICATION_PREFLIGHT', decision: 'BLOCKED_CONFIGURATION_NOT_SAMPLED',
    authorization: { approvalMode: 'delegated_development_override', authorizedAt: '2026-10-06', scope: 'CURRENT_ASSIGNED_ZERO_GRANT_MACHINE_SHELL_MEASUREMENT_ONLY', allowed: ['Read-only Admin/browser verification', 'Performance measurements after all protocol preconditions pass', 'Local developer tooling/evidence/status'], prohibited: ['Runtime or Shopify persistent mutation', 'Product/Variant/assignment/factual updates', 'Payment/pickup/inventory/analytics configuration', 'Theme writes/publication', 'F-PBI-018B signoff'] },
    sourceBinding: { identity: sourceBinding.identity, canonicalSha256: sourceBinding.bindingSha256, path: CORRECTED + '/source-binding.json', headerSha256: sourceBinding.files.find(f => f.path === 'sections/header.liquid').sha256, runtimeFiles: 29 },
    environment: { browser: 'Chromium', browserVersion: version, playwrightVersion: require('@playwright/test/package.json').version, nodeVersion: process.version, OS: { type: os.type(), release: os.release(), architecture: os.arch() }, browserLaunchedForVersionOnly: true, storefrontNavigations: 0, lighthouseInstalled: fs.existsSync('node_modules/lighthouse/package.json') },
    profiles, throttling: { status: 'UNRESOLVED_NO_APPROVED_CONCRETE_PROFILE', mobile: { latencyMs: null, downloadBytesPerSecond: null, uploadBytesPerSecond: null, cpuSlowdown: null }, desktop: { latencyMs: null, downloadBytesPerSecond: null, uploadBytesPerSecond: null, cpuSlowdown: null } },
    missingConfiguration: ['Approved latencyMs', 'Approved downloadBytesPerSecond', 'Approved uploadBytesPerSecond', 'Approved cpuSlowdown'],
    policy: { authorities, settlePolicy: 'navigation/load + document.fonts.ready + governed 1500ms settle', settleMs: budget.runtime.settleMs, interRunDelayMs: budget.runtime.interRunDelayMs, actualSettleTimings: null, actualInterRunDelays: null, cold: 'Existing fixture collector creates a new context, clears Chromium HTTP cache and disables caching. Not executed as a live certification policy.', warm: 'Existing machine collector has no warm-live implementation; no warm state was fabricated or executed.', resolveBeforeSampling: 'Freeze a concrete already-approved profile, then implement/verify bounded live cold and warm lifecycles under that profile.', numericTupleInUnitTest: '150ms/200000Bps/90000Bps/4x appears only in a synthetic unit contract; explicitly not adopted as an approved profile.', supportingLighthouseTargets: { mobilePerformance: 85, accessibility: 95, scores: null, collected: false }, fieldINP: { targetMs: 200, measured: false, substitutedByTBT: false }, TBTProxy: 'Established sum of max(0,longtask.duration - 50); not field INP or Lighthouse TBT', thresholdsChanged: false },
    plan: { routes: 8, profiles: 2, cacheStates: 2, samplesPerRecord: 3, plannedRecords: 32, plannedSamples: 96, attemptedSamples: 0, validSamples: 0, invalidSamples: 0, retriedSamples: 0 }, records, metrics: missing(),
    approvedComparableBaseline: 'NONE_AVAILABLE', beforeGate, persistentAfter: { state: 'PENDING_FINAL_READ' },
    validation: { schema: 'schemas/epic-f-performance-measurement.schema.json#/$defs/certificationPreflight', budgetEvaluation: 'NOT_RUN_NO_SAMPLES', LCPownership: null, resourceAttribution: null, providerPerformanceState: 'NOT_MEASURED', invalidRetryJournal: [], historicalDiagnosticsNotUsedAsBaselines: true },
    statusConsequences: { F_PBI_015B: 'BLOCKED_MISSING_APPROVED_THROTTLE_PROFILE', F_PBI_015: 'PARTIAL_CONTRACT_COMPLETE_LIVE_CERTIFICATION_NOT_EXECUTED', F_PBI_014B: 'PARTIAL_FUTURE_LIVE_STATES_ONLY', F014B_FOCUS_CURRENT: 'COMPLETE', F_PBI_017B: 'COMPLETE', F_PBI_018B: 'NOT_BEGUN_NOT_READY', budgetFailure: false, performanceCertified: false }
  };
  record.validation.proof = validateEvidence(record);
  write('certification.json', record);
  console.log(JSON.stringify({ liveDriftGate: 'PASS', certification: record.decision, attemptedSamples: 0, plannedSamples: 96, missing: record.missingConfiguration }));
  return record;
}
function finalize() {
  const beforeTheme = read(DIR + '/themes-before.json'), afterTheme = read(DIR + '/themes-after.json');
  const beforeCatalog = read(DIR + '/catalog-before.json'), afterCatalog = read(DIR + '/catalog-after.json');
  assert.deepEqual(afterTheme.response.data, beforeTheme.response.data, 'Theme/file/configuration drift during read-only task');
  assert.equal(afterCatalog.paginationExhausted, true);
  assert.deepEqual(afterCatalog.products, beforeCatalog.products, 'Product/Variant drift during read-only task');
  assert.deepEqual(runtimeInventory(), read(DIR + '/runtime-source-before.json'), 'Any storefront runtime diff is forbidden');
  const persistent = { checkedAt: new Date().toISOString(), beforeReadCompletedAt: beforeCatalog.completedAt, afterReadCompletedAt: afterCatalog.completedAt, mainSourceBindingUnchanged: true, allThemeAndFileRecordsUnchanged: true, ProductsVerified: 122, allQueriedProductAndVariantFieldsUnchanged: true, machineSuffixesUnchanged: 8, exclusionsUnchanged: 3, classificationsUnchanged: 122, factualGrants: 0, ProductMutations: 0, themeWrites: 0, publicationActions: 0, configurationChanges: 0, ShopifyPersistentMutations: 0, localRuntimeSourceChanged: false };
  write('persistent-no-change.json', persistent);
  const record = read(DIR + '/certification.json');
  record.persistentAfter = persistent;
  record.validation.proof = validateEvidence(record);
  write('certification.json', record);
  const paths = ['data/epic-f-current-development-status.json', 'data/epic-f-current-shopify-eligibility.json', 'docs/rhino-lapidary-pbi-tracker-epic-f.md'];
  if (!fs.existsSync(DIR + '/operational-before.json')) write('operational-before.json', paths.map(path => ({ path, sha256: hash(fs.readFileSync(path)), body: fs.readFileSync(path, 'utf8') })));
  const development = read(paths[0]), eligibility = read(paths[1]);
  const assessedAt = new Date().toISOString();
  const blocker = { state: 'BLOCKED_MISSING_APPROVED_THROTTLE_PROFILE', authorized: true, executed: false, certificationSamples: 0, missingConfiguration: record.missingConfiguration, evidence: DIR + '/certification.json', sourceBindingUnchanged: true, budgetsChanged: false, optimizationRequired: false, reason: 'No concrete approved network/CPU profile can be resolved. Stop before sampling, per task condition 10. Not a measured budget failure.' };
  Object.assign(development, { updatedAt: assessedAt, F_PBI_015B: blocker.state, F_PBI_015: 'PARTIAL_CONTRACT_COMPLETE_LIVE_CERTIFICATION_NOT_EXECUTED', F_PBI_015B_readiness: blocker, F_PBI_018B: 'NOT_BEGUN', releaseReadiness: 'NOT_READY', currentPerformanceCertification: DIR + '/certification.json' });
  development.releaseBlockers = ['F-PBI-015B concrete approved network/CPU profile unresolved; 96-sample certification not collected', 'F-PBI-018B selected-scope prerequisites/signoff remain unperformed; future populated-state accessibility criteria remain separate'];
  development.performanceTaskOperations = { task: 'F_PBI_015B_LIVE_CERTIFICATION_PREFLIGHT_2026_10_06', approvalMode: 'delegated_development_override', performanceSamples: 0, ShopifyPersistentMutations: 0, runtimeWrites: 0, themeWrites: 0, ProductWrites: 0, assignments: 0, publicationActions: 0, instrumentationEnabled: false };
  development.latestDevelopmentTask = development.performanceTaskOperations.task;
  development.themePushesThisTask = 0;
  development.ProductSuffixWritesThisTask = 0;
  development.otherProductDataWritesThisTask = 0;
  development.previewThemeUnchanged = true;
  fs.writeFileSync(paths[0], JSON.stringify(development, null, 2) + '\n');
  Object.assign(eligibility.F8, { F_PBI_015B: blocker.state, releaseReadiness: 'NOT_READY', releaseBlockers: development.releaseBlockers, currentPerformanceCertification: DIR + '/certification.json' });
  eligibility.performanceCertification = blocker;
  eligibility.operationsThisTask = development.performanceTaskOperations;
  eligibility.assessedAt = assessedAt;
  fs.writeFileSync(paths[1], JSON.stringify(eligibility, null, 2) + '\n');
  console.log(JSON.stringify({ decision: record.decision, validLiveSamples: 0, persistentShopifyMutations: 0, runtimeChanges: 0, F_PBI_018B: 'NOT_BEGUN_NOT_READY' }));
  return record;
}
if (require.main === module) (process.argv.includes('--finalize') ? Promise.resolve().then(finalize) : build()).catch(e => { console.error(e.message); process.exitCode = 1; });
module.exports = { DIR, CORRECTED, read, hash, write, missing, runtimeInventory, gate, validateEvidence, build, finalize };
