'use strict';
// Current operational disposition only. Historical manifests are verified, never rewritten.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const H = require('./lib/epic-f-header-focus-correction');
const M = require('./lib/epic-f-live-machine-activation');
const V = require('./lib/epic-f-014b-assigned-validation');
const { verify: readback } = require('./verify-epic-f-header-focus-readback');
const json = (p, value) => fs.writeFileSync(p, JSON.stringify(value, null, 2) + '\n');
const ref = n => ({ path: H.DIR + '/' + n, sha256: H.hash(fs.readFileSync(H.DIR + '/' + n)) });
const counts = cells => cells.reduce((a, c) => {
  for (const k of Object.keys(a)) a[k] += c.accessibility.counts[k];
  return a;
}, { critical: 0, serious: 0, moderate: 0, minor: 0 });
function noOtherCatalogWrites() {
  const before = H.read(H.DIR + '/catalog-before.json');
  const after = H.read(H.DIR + '/catalog-after.json');
  assert.equal(before.paginationExhausted, true);
  assert.equal(after.paginationExhausted, true);
  assert.deepEqual(after.shop, before.shop);
  assert.deepEqual(after.products, before.products, 'Any catalog/Variant change requires investigation');
  assert.equal(after.products.length, 122);
  const distribution = {};
  const machines = [];
  function exhausted(value) {
    if (!value || typeof value !== 'object') return;
    if (value.pageInfo) assert.equal(value.pageInfo.hasNextPage, false);
    for (const v of Object.values(value)) exhausted(v);
  }
  for (const p of after.products) {
    exhausted(p);
    const rhino = p.metafields.nodes.filter(m => m.namespace === 'rhino');
    assert.equal(rhino.length, 1, 'No other Rhino factual values may exist');
    assert.equal(rhino[0].key, 'product_class');
    assert.equal(rhino[0].definition.id, 'gid://shopify/MetafieldDefinition/298658201797');
    distribution[rhino[0].jsonValue] = (distribution[rhino[0].jsonValue] || 0) + 1;
    if (rhino[0].jsonValue === 'machine') {
      const assigned = M.PRODUCTS.some(t => t.gid === p.id);
      assert.equal(p.templateSuffix, assigned ? 'machine' : null);
      machines.push({ gid: p.id, title: p.title, suffix: p.templateSuffix, productClass: 'machine', VariantCount: p.variants.nodes.length });
    }
  }
  assert.deepEqual(distribution, { consumable: 39, replacement_part: 54, machine: 11, accessory: 18 });
  return { beforeRead: { startedAt: before.startedAt, completedAt: before.completedAt }, afterRead: { startedAt: after.startedAt, completedAt: after.completedAt }, records: 122, allQueriedProductAndVariantFieldsExactlyUnchanged: true, distribution, machines, ProductMutations: 0, classificationChanges: 0, otherRhinoValuesIntroduced: 0, protectedQuerySha256: H.hash(before.query), APIversion: 'Not exposed by the read-only connector' };
}
function summarize(cells) {
  const allConsole = cells.flatMap(c => c.log.consoleErrors);
  const beforeConsole = H.read(H.DIR + '/pre-fix-live-reproduction.json').log.consoleErrors;
  // Exact pre-fix evidence classifies existing response-header noise; errors remain retained.
  const beforeHeaderWarnings = beforeConsole.filter(s => /Invalid 'X-Frame-Options'/.test(s));
  const unexpected = [...new Set(allConsole)].filter(s => !/frame-ancestors|status of 403/.test(s) && !beforeHeaderWarnings.includes(s));
  assert.deepEqual(unexpected, [], 'Unexpected console error');
  for (const c of cells) {
    assert.equal(c.passed, true);
    assert.equal(c.log.pageErrors.length, 0);
    assert.equal(c.log.blocked.length, 0);
    assert.equal(c.log.downloads.length, 0);
    assert.equal(Boolean(c.dom.liquidErrors), false);
    if (c.global.navigation.firstMenuFocus) assert.equal(c.global.navigation.firstMenuFocus.visible, true);
  }
  return { cells: cells.length, passed: cells.filter(c => c.passed).length, axe: counts(cells), console: { knownProviderOccurrences: allConsole.length, distinct: [...new Set(allConsole)], exactPreFixHeaderWarnings: beforeHeaderWarnings, preFixEvidence: H.DIR + '/pre-fix-live-reproduction.json', classification: 'Known native Shop Pay CSP/403 noise plus exact pre-existing response-header warning. All actual errors retained; no theme/page/Liquid failure observed.', unexpected: 0, pageErrors: 0, LiquidErrors: 0, blockedRequests: 0, downloads: 0, failedRequests: cells.reduce((n, c) => n + c.log.failed.length, 0), httpErrors: cells.reduce((n, c) => n + c.log.httpErrors.length, 0) } };
}
function finalize() {
  H.verify();
  const binding = H.read(H.DIR + '/source-binding.json');
  const { bindingSha256, ...bindingBody } = binding;
  assert.equal(bindingSha256, H.hash(JSON.stringify(bindingBody)));
  assert.equal(binding.headerFocusAlgorithmSha256, H.hash(fs.readFileSync('scripts/lib/epic-f-014b-focus.js')));
  for (const f of binding.files) assert.equal(H.hash(fs.readFileSync(f.path)), f.sha256);
  const historicalManifest = H.read(V.DIR + '/evidence-manifest.json');
  const archivedCurrent = fs.existsSync(H.DIR + '/operational-state-before.json') ? H.read(H.DIR + '/operational-state-before.json') : null;
  const mutableCurrentArtifacts = { 'data/epic-f-current-development-status.json': 'development', 'data/epic-f-current-shopify-eligibility.json': 'eligibility' };
  for (const f of historicalManifest.files) {
    const currentHash = H.hash(fs.readFileSync(f.path));
    if (currentHash === f.sha256) continue;
    const key = mutableCurrentArtifacts[f.path];
    assert.ok(key && archivedCurrent, 'Historical 014B evidence must remain immutable');
    assert.equal(H.hash(JSON.stringify(archivedCurrent[key], null, 2) + '\n'), f.sha256, 'Original mutable operational revision must remain exactly reconstructable');
  }
  const finalTheme = readback('main', 'themes-final.json', 'final-readback-proof.json');
  const catalog = noOtherCatalogWrites();
  H.write('catalog-protected-comparison.json', catalog);
  const preview = H.read(H.DIR + '/preview-browser.json');
  const first = H.read(H.DIR + '/live-first-eight-browser.json');
  const regression = H.read(H.DIR + '/live-regression-browser.json');
  const desktopZoom = H.read(H.DIR + '/live-desktop-zoom-browser.json');
  for (const d of [preview, first, regression, desktopZoom]) {
    assert.equal(d.exception, undefined);
    assert.equal(d.failed, 0);
    assert.equal(d.focusAlgorithmSha256, binding.headerFocusAlgorithmSha256);
    assert.equal(d.secretDisposal.authenticationInMemoryOnly, true);
    assert.equal(d.secretDisposal.browserClosed, true);
  }
  assert.equal(preview.cells.length, 34);
  assert.equal(first.cells.length, 8);
  assert.equal(regression.cells.length, 58);
  assert.equal(desktopZoom.cells.length, 2);
  const text = regression.cells.filter(c => c.gid && c.state === 'TEXT_200_PERCENT');
  const zoom = [...regression.cells.filter(c => c.state === 'BROWSER_ZOOM_200_PERCENT'), ...desktopZoom.cells];
  const base = regression.cells.filter(c => c.gid && c.state === 'BASELINE');
  const nonMachine = regression.cells.filter(c => !c.gid);
  assert.equal(text.length, 16); assert.equal(zoom.length, 6); assert.equal(base.length, 8); assert.equal(nonMachine.length, 30);
  assert.ok(desktopZoom.cells.every(c => c.layout.width >= 990 && c.header.section.css.position === 'sticky'));
  const machine = [...first.cells, ...text, ...base, ...zoom];
  for (const p of M.PRODUCTS) for (const width of [390, 1440]) assert.ok(text.some(c => c.gid === p.gid && c.width === width));
  const current = H.read('data/epic-f-current-development-status.json');
  const eligibility = H.read('data/epic-f-current-shopify-eligibility.json');
  const previousDecision = H.read(V.DIR + '/acceptance-decision.json');
  assert.equal(V.contract().sha256, previousDecision.contract.sectionSha256, 'Do not alter the acceptance contract');
  const openCriteria = previousDecision.contract.openCriteria.filter(c => c.id !== 'F014B-FOCUS-CURRENT');
  assert.deepEqual(openCriteria.map(c => c.id), ['F014B-MEDIA-MODULE-FUTURE', 'F014B-RESOURCE-CONTEXT-FUTURE']);
  const fullPreviewAxe = preview.cells.reduce((a, c) => { for (const k of Object.keys(a)) a[k] += c.fullDocumentAccessibility.counts[k]; return a; }, { critical: 0, serious: 0, moderate: 0, minor: 0 });
  const allLive = [...first.cells, ...regression.cells, ...desktopZoom.cells];
  const summary = summarize(allLive);
  assert.equal(summary.axe.critical, 0); assert.equal(summary.axe.serious, 0);
  for (const c of machine) {
    assert.equal(c.focus.completeCycle, true);
    assert.equal(c.focus.skipped.length, 0);
    assert.equal(c.focus.merchantFocusFailures.length, 0);
    assert.equal(c.focus.logicalProductOrder, true);
    assert.ok(c.focus.providerFocusObservations.every(f => f.focusVisible && f.indicatorVisible && !f.occluded && !f.clipped));
    const actual = H.read(H.DIR + '/catalog-after.json').products.find(p => p.id === c.gid);
    assert.equal(c.dom.variantId, actual.variants.nodes[0].id.split('/').pop());
    assert.equal(c.dom.terms.variantId, c.dom.variantId);
    assert.equal(c.dom.contact.href, '/pages/contact');
    assert.equal(c.dom.terms.rendered, true);
    assert.equal(c.dom.previewInlineStyles, 0);
    assert.equal(c.dom.rhinoLinks, 1);
    assert.equal(c.dom.pickup.available, false);
  }
  const globals = nonMachine.map(c => ({ route: c.route, width: c.width, state: c.state, passed: c.passed, newFocusFailures: c.nonMachineBaselineComparison.newFocusFailures.length, retainedPreExistingFocusObservations: c.nonMachineBaselineComparison.retainedPreExistingFocusObservations.map(f => ({ name: f.name, key: f.key, indicatorVisible: f.indicatorVisible, clipped: f.clipped, occluded: f.occluded })), originalAlgorithmUnchanged: true }));
  H.write('non-machine-comparison.json', { state: 'NO_MATERIAL_REGRESSION', cells: globals, rawBaseline: ref('baseline-browser.json'), qualification: 'Pre-existing card-link computed-indicator observations and collection/search Page 1 tab-inventory observations remain visible in raw evidence. No new failures; no ownership or focus algorithm relaxation.' });
  const assessedAt = new Date().toISOString();
  const closedCriterion = { id: 'F014B-FOCUS-CURRENT', state: 'COMPLETE', assignedCurrentShell: 'PASS', firstFailingCells: 8, firstFailingCellsPassed: 8, fullTextCells: 16, fullTextCellsPassed: 16, evidence: H.DIR + '/acceptance-decision.json' };
  const decision = {
    assessedAt, approvalMode: 'delegated_development_override', F_PBI_014B: 'PARTIAL', disposition: 'PARTIAL_FUTURE_LIVE_STATES_ONLY', assignedShellCurrentState: 'PASS', sourceBinding: ref('source-binding.json'), bindingIdentity: binding.identity, bindingSha256,
    runtimeFilesChanged: [H.FILE], sourceChanges: binding.files.filter(f => f.changed), sourceExactTransformCount: 1,
    textEnlargementSemanticsChanged: false, focusAlgorithmUnchanged: true, thresholdsChanged: false,
    stickyBehavior: { below750CSSpx: 'NORMAL_DOCUMENT_FLOW_POSITION_RELATIVE', atOrAbove750CSSpx: 'EXISTING_STICKY_BEHAVIOR_UNCHANGED' },
    localPreFix: 'FAIL_REPRODUCED_BOTH_PAINTED_TARGETS', localCorrection: 'PASS_6_OF_6', localActualStorefrontRegression: 'PASS_40_OF_40',
    preview: { ...summarize(preview.cells), fullDocumentAxe: fullPreviewAxe, merchantScopeAxe: counts(preview.cells), fullDocumentQualification: 'SHOPIFY_PREVIEW_TOOLBAR_FINDINGS_RETAINED', exactOwnership: 'iframe#PBarNextFrame with https://cdn.shopify.com/shopifycloud/preview-bar/index.html structural source signature; no merchant/provider/rule exclusions', beforeAfterComparison: 'Same Preview DOM, exact seven-line header CSS rule removed/restored in CSSOM, ordered representation restored; original deep painted-focus algorithm unchanged' },
    formerlyFailingCells: first.cells.map(c => ({ route: c.route, width: c.width, state: c.state, passed: c.passed, footerSearch: c.focus.steps.find(f => f.category === 'footer' && f.name === 'Search'), paymentTermsFocus: c.focus.providerFocusObservations[0] })),
    text: { ...summarize(text), widths: [390, 1440], rootPx: [10, 20], bodyPx: [16, 32], mobileTitlePx: [30, 60], desktopTitlePx: [40, 80], providerFixedPxQualification: 'The native fixed-pixel shadow button remains 13 CSS px under root-font simulation. Real Chromium browser zoom doubles physical display size; no provider markup or configuration was changed.' },
    browserZoom: { ...summarize(zoom), factor: 2, method: 'chrome.tabs.setZoom; per-origin inherited into authenticated in-memory context', evidence: zoom.map(c => ({ route: c.route, physicalWidth: c.width, beforeWidth: c.before.width, effectiveWidth: c.layout.width, beforeDpr: c.before.dpr, afterDpr: c.layout.dpr, factor: c.zoomFactor, visualViewportScale: c.layout.visualViewportScale, rootFontUnchanged: c.layout.fonts.root === c.before.fonts.root })), secretDisposal: [...regression.zoomSecretDisposal, ...desktopZoom.zoomSecretDisposal] },
    keyboard: { currentMachineCells: machine.length, fullCycles: machine.length, skippedControls: 0, unexpectedTraps: 0, focusVisibleFailures: 0, merchantFocusOcclusions: 0, providerFocusOcclusions: 0, globalEnterEscapeFocusReturn: 'PASS' },
    baseResponsive: summarize(base), nonMachine: { ...summarize(nonMachine), scope: 'Replacement part, consumable, accessory, collection, search, cart; normal 320/390/768/1440 and 200% text 390', comparativeResult: 'NO_MATERIAL_REGRESSION', rawPreExistingObservationsRetained: true },
    live: summary, purchaseStates: { purchasableProducts: ['LapMaster 12"', 'LapMaster 18"'], soldOutProducts: 6, enabledPurchaseFocusVerified: true, disabledSoldOutPreserved: true, quantityArrowKeysRestored: true, transactionsSubmitted: 0 },
    Contact: { href: '/pages/contact', visibleFocus: 'PASS', submitted: false }, paymentTerms: { F_DEC_001: 'APPROVED_OPTION_A', currentVariantAssociation: 'PASS', focus: 'PASS', copyAndConfigurationChanged: false },
    governedFactualGrants: 0, claimsContainment: 'PASS_ALL_OBSERVED_MACHINE_STATES', ProductMutations: 0, catalogProtectedComparison: ref('catalog-protected-comparison.json'),
    themeChanges: { previewFilesUpdated: 1, mainFilesUpdated: 1, created: 0, unplanned: 0, publicationActions: 0, finalReadback: finalTheme }, rollbackInvoked: false,
    contract: { file: V.contract().file, sectionSha256: V.contract().sha256, criteriaUnchanged: true, closedCriteria: [closedCriterion], openCriteria },
    alternateVariant: previousDecision.currentVariant.alternateVariant, availablePickup: previousDecision.availablePickup,
    F_PBI_015B: { ...previousDecision.F_PBI_015B, state: 'READY_FOR_AUTHORIZED_CERTIFICATION', executed: false, recommendation: 'Authorize current assigned-shell performance certification bound to the corrected source binding. Retained future populated-state accessibility criteria do not prohibit measuring this current shell.' },
    F_PBI_017B: 'COMPLETE', F_PBI_018B: 'NOT_BEGUN', releaseReadiness: 'NOT_READY', nextAction: 'Separately authorize F-PBI-015B against the corrected source. No performance certification or final signoff performed.'
  };
  H.write('acceptance-decision.json', decision);
  if (!fs.existsSync(H.DIR + '/operational-state-before.json')) H.write('operational-state-before.json', { development: current, eligibility });
  const provenance = ['source-binding.json', 'deployment-authorization-and-rollback.json', 'main-readback-proof.json', 'final-readback-proof.json', 'catalog-protected-comparison.json', 'live-first-eight-browser.json', 'live-regression-browser.json', 'live-desktop-zoom-browser.json', 'acceptance-decision.json'].map(ref);
  const releaseBlockers = ['Literal 014B approved live media/resource/contextual journeys await approved populated states', 'F-PBI-015B source-bound current-shell performance certification is ready but not executed', 'F-PBI-018B selected release scope and signoff not performed'];
  Object.assign(current, { updatedAt: assessedAt, F_PBI_014B: 'PARTIAL', F_PBI_014B_disposition: decision.disposition, F_PBI_014B_currentShell: 'PASS', F_PBI_014B_closedCriteria: [closedCriterion], F_PBI_014B_unresolvedCriteria: openCriteria, F_PBI_014B_assignedRouteEvidence: H.DIR + '/acceptance-decision.json', F_PBI_015B: 'READY_FOR_AUTHORIZED_CERTIFICATION', F_PBI_015B_readiness: decision.F_PBI_015B, F_PBI_017B: 'COMPLETE', F_PBI_018B: 'NOT_BEGUN', releaseReadiness: 'NOT_READY', releaseBlockers, currentCorrectedRuntimeSourceBinding: H.DIR + '/source-binding.json', currentCorrectedLiveBoundFileCount: 29, globalHeaderCorrection: { sourceBindingSha256: bindingSha256, previewPush: H.DIR + '/preview-push.json', mainPush: H.DIR + '/main-push.json', finalThemeRead: H.DIR + '/themes-final.json', evidence: provenance, ProductMutations: 0, themeFileUpdates: 2, previewThemeChanged: true, rollbackInvoked: false } });
  const priorDevelopment = H.read(H.DIR + '/operational-state-before.json').development;
  current.historicalSourceBindings = { preview: priorDevelopment.sourceBinding, previewFiles: priorDevelopment.fileCount, live: priorDevelopment.liveSourceBinding, liveFiles: priorDevelopment.liveDeploymentFileCount };
  current.liveSourceBinding = H.DIR + '/source-binding.json';
  current.liveDeploymentEvidence = H.DIR + '/main-readback-proof.json';
  current.liveDeploymentFileCount = 29;
  current.sourceBindingRole = 'HISTORICAL_PERSISTENT_PREVIEW_32_FILE_DEPLOYMENT';
  current.themePushesThisTask = 2;
  current.ProductSuffixWritesThisTask = 0;
  current.otherProductDataWritesThisTask = 0;
  current.previewThemeUnchanged = false;
  current.latestDevelopmentTask = 'GLOBAL_HEADER_FOCUS_CORRECTION_2026_10_06';
  json('data/epic-f-current-development-status.json', current);
  eligibility.assessedAt = assessedAt;
  eligibility.assignedRouteAccessibility = { state: 'PARTIAL', disposition: decision.disposition, currentShell: 'PASS', evidence: H.DIR + '/acceptance-decision.json', closedCriteria: [closedCriterion], openCriteria, text: decision.text, zoom: decision.browserZoom, keyboard: decision.keyboard, axe: summary.axe, alternateVariant: decision.alternateVariant, availablePickup: decision.availablePickup, ProductMutationsThisCorrection: 0, themeFilesUpdatedThisCorrection: 2 };
  Object.assign(eligibility.F8, { F_PBI_014B: 'PARTIAL', F_PBI_015B: 'READY_FOR_AUTHORIZED_CERTIFICATION', F_PBI_017B: 'COMPLETE', F_PBI_018B: 'NOT_BEGUN', remainingAccessibilityGaps: openCriteria.map(c => c.missingRealState), releaseReadiness: 'NOT_READY', releaseBlockers, assignedRouteTextAccessibility: 'PASS_16_OF_16_CURRENT_SHELL', assignedRouteKeyboardFocus: 'PASS_ALL_APPLICABLE_CURRENT_SHELL', assignedRouteActualBrowserZoomCorrectionRegression: 'PASS_6_OF_6', correctedRuntimeSourceBinding: H.DIR + '/source-binding.json' });
  eligibility.globalHeaderCorrectionProvenance = provenance;
  eligibility.currentCatalogReverified = ref('catalog-protected-comparison.json');
  eligibility.theme.currentCorrectedRuntimeSourceBinding = H.DIR + '/source-binding.json';
  eligibility.theme.liveCurrentCorrectedBoundFileCount = 29;
  eligibility.theme.currentHeaderReadback = H.DIR + '/themes-final.json';
  eligibility.operationsThisTask = { task: binding.identity, ProductSuffixUpdates: 0, liveThemeSelectivePushes: 1, previewThemeSelectivePushes: 1, otherProductWrites: 0, definitionWrites: 0, factualWrites: 0, publicationActions: 0, transactions: 0 };
  eligibility.themePushes = 2;
  eligibility.theme.previewAllRecordsUnchanged = false;
  json('data/epic-f-current-shopify-eligibility.json', eligibility);
  console.log(JSON.stringify({ F_PBI_014B: decision.disposition, focusCriterion: 'COMPLETE', text: '16/16', first: '8/8', zoom: '6/6', axe: summary.axe, ProductMutations: 0, F_PBI_015B: 'READY_FOR_AUTHORIZED_CERTIFICATION' }));
  return decision;
}
if (require.main === module) finalize();
module.exports = { finalize, noOtherCatalogWrites };
