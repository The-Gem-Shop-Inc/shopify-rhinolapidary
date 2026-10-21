# F-PBI-014B assigned-route accessibility closure/disposition — 2026-10-06

**Decision: PARTIAL.** Actual assigned normal-route responsive reflow and true Chromium 200% browser zoom pass. At 390 px with 200% root/text enlargement, the merchant-owned sticky header becomes approximately 560 px tall and obscures the footer Search link and native payment-terms focus target on all eight Products. This is an actual visual/focus defect despite zero axe findings; it is not a Shopify preview-toolbar or external-provider exclusion. No theme or Product mutation was performed.

## Source and assignment authority

Fresh read-only Admin before-read: 2026-10-06T19:14:11.805Z–2026-10-06T19:14:13.622Z. Final read: 2026-10-06T19:42:19.277Z–2026-10-06T19:42:20.584Z. Theme **158579622085**, **shopify-rhinolapidary/main**, **MAIN**. All 28 activation-bound files match the intended source hashes/checksums and exact source or documented CRLF/generated-JSON serialization equivalence. All eight approved suffixes are `machine`; JadeMaster, SawMaster 36 and TumbleMaster remain null. All 11 governed machines have `rhino.product_class=machine`, one Variant and no other populated rhino fields.

The final read is identical to the before-read across all queried theme/file/Product/Variant records. Persistent Shopify mutations: **0**. No theme push, publication, Product/metafield/configuration change, cart operation, Contact submission, checkout or order occurred. Password authentication used the existing configuration and remained in memory. No cookies, storageState, traces, signed URLs or credentials were retained.

The previous source-bound 390/1440 normal-route matrix remains immutable and reused: 16 cells. New 320/768 coverage adds 16 cells for a combined **32/32** four-width matrix. Additional 360/1024/1920 checks on BeadMaster and LapMaster 12 cover the historical seven-width representative scope: six further cells. New base-responsive evidence: **22/22 passed**.

## Exact routes and enlarged-state matrix

Every actual Product navigation uses its normal live route; no `view=machine` or `preview_theme_id` is used.

| Product / normal route | Additional 320 / 768 | 200% text 390 | 200% text 1440 | True zoom, physical 1280 | Purchase state |
| --- | --- | --- | --- | --- | --- |
| BeadMaster 6" — `/products/beadmaster` | PASS / PASS | FAIL: header hides focus | PASS | PASS (1258→629 CSS px) | SOLD_OUT |
| EM-1 Machine — `/products/em-1` | PASS / PASS | FAIL: header hides focus | PASS | PASS (1258→629 CSS px) | SOLD_OUT |
| LapMaster 12" — `/products/lapmaster-12` | PASS / PASS | FAIL: header hides focus | PASS | PASS (1258→629 CSS px) | PURCHASABLE |
| LapMaster 18" — `/products/lapmaster-18` | PASS / PASS | FAIL: header hides focus | PASS | PASS (1258→629 CSS px) | PURCHASABLE |
| SawMaster 18" — `/products/sawmaster-18` | PASS / PASS | FAIL: header hides focus | PASS | PASS (1258→629 CSS px) | SOLD_OUT |
| SawMaster 24" — `/products/sawmaster-24` | PASS / PASS | FAIL: header hides focus | PASS | PASS (1258→629 CSS px) | SOLD_OUT |
| ShapeMaster 6" — `/products/shapemaster` | PASS / PASS | FAIL: header hides focus | PASS | PASS (1258→629 CSS px) | SOLD_OUT |
| TrimMaster — `/products/trimmaster` | PASS / PASS | FAIL: header hides focus | PASS | PASS (1258→629 CSS px) | SOLD_OUT |

Text enlargement runs all eight Products at 390 and 1440 px: **16 cells**, measured root/body/title 2× in all 16; ordinary shell geometry/reflow **16/16**; full applicable accessibility **8/16 passed, 8 failed** due to the mobile focus obstruction. The title wraps, price/quantity/purchase controls/Contact/payment terms remain rendered, and no horizontal document scrolling, shell clipping or shell-block overlap was introduced. Header/footer presence alone is not sufficient to pass global focus visibility.

| Text metric | Before | After |
| --- | --- | --- |
| Root | 10 CSS px | 20 CSS px |
| Body | 16 CSS px | 32 CSS px |
| Mobile title | 30 CSS px | 60 CSS px |
| Desktop title | 40 CSS px | 80 CSS px |

Native provider button text remains fixed at 13 CSS px during root-font simulation. This limitation is recorded rather than claiming every provider shadow font doubled. True browser zoom doubles its physical display size; its root simulation and actual browser zoom evidence are distinct.

## Actual Chromium browser zoom

True browser zoom uses the established `chrome.tabs.setZoom(..., 2)` extension API. An anonymous controller tab is fulfilled locally at the same origin; Chromium inherits its per-origin zoom into the authenticated **in-memory incognito context**. Default persistent controller/profile cookies are never imported and are verified empty before removal. Only the anonymous extension/profile uses temporary disk storage; all authentication remains in memory. Local positive tests prove this inheritance.

No CSS transform, root-font change, pinch/page-scale emulation, DPR emulation or viewport resizing is used to manufacture zoom. Recorded factor is 2, DPR changes 1→2, visualViewport.scale stays 1, root CSS font remains unchanged, and effective layout width halves.

| Zoom coverage | Effective viewport before → after | Cells | Result |
| --- | --- | --- | --- |
| All eight; physical window width 1280 | 1258 → 629 CSS px | 8 | PASS |
| BeadMaster and LapMaster 12; physical width 780 | 758 → 379 CSS px | 2 | PASS |


All **10/10** zoom cells pass reflow, native controls, Contact, provider terms, global UI and axe. Four additional full keyboard scans in zoomed contexts represent both sold-out and purchasable Products at both physical widths; **4/4 passed** with no sticky/fixed collisions. Anonymous profiles were removed after closure and retained zero authentication cookies.

## Complete applicable keyboard/focus and purchase states

Corrected full-document tab cycles cover skip link, header/nav/search/cart controls, breadcrumb/native shipping link, provider terms button, quantity minus/input/plus, enabled purchase control where present, Contact, Follow on Shop app markup, footer and policy links. Current Variant is represented by the single actual form Variant ID; no alternate selector is invented. Disabled Sold out buttons are semantically disabled and excluded from the tab sequence. Unavailable pickup has no displayed/focusable pickup control. Global navigation/search and desktop Catalog details are opened with keyboard, Tab enters their content, Escape closes through native animation, and focus returns to the trigger. No purchase or provider transaction button is activated.

Coverage is **24 full keyboard cells**: 16 text-enlarged cells on all eight Products, four baseline cells on BeadMaster/LapMaster 12 at mobile/desktop widths, and four true-zoom cells on those Products. Full cycles and logical Product orders: **24/24**. Skipped applicable controls: **0**. Unexpected traps: **0**. Quantity ArrowUp/ArrowDown increments 1→2 and restores 1 without a cart request. Missing computed focus indicators: **0**.

Actual focus visibility is **16/24 passed, 8 failed**. The eight failing cells are the 390 px text-enlarged states. Each has one merchant footer Search focus target hidden behind the sticky header and one native View sample plans target obscured by that same merchant header. Provider target ownership does not excuse a merchant-owned overlay. Purchasable LapMaster 12 and LapMaster 18 both remain enabled and tabbable in enlargement; six Sold out Products stay disabled. Product quantity, enabled Add to cart and Contact focus themselves pass even in the failing mobile state.

### Exact reproduced failure

At BeadMaster 390 px/root 20 px, the header rectangle is top 0, bottom 558 px; its sticky wrapper is 560 px tall. The brand text fallback wraps vertically. Footer Search spans y=455.28125–545.671875; its painted text midpoint y=499.78125 hits the header brand link instead of Search. The native terms button spans approximately y=477.6875–521.6875 and also hits HEADER during keyboard focus. The same failure is reproduced on all eight Products.

[Visual evidence](../qa/evidence/epic-f/014b-assigned-2026-10-06/mobile-200-text-focus.png) and [deep hit-test proof](../qa/evidence/epic-f/014b-assigned-2026-10-06/footer-focus-visual-probe.json) show actual merchant obstruction. This is recorded against existing Epic C/global-chrome ownership, without excluding it from the 014B result or creating a new Epic F PBI.

## Axe, provider, containment and errors

**52 full-document axe scans:** critical **0**, serious **0**, moderate **0**, minor **0**. These actual normal-route pages contain no Shopify preview toolbar; no merchant, Trade, app, provider shadow markup or rule was excluded. Existing ownership tests still reject unlabelled merchant/app/provider controls and exclude only a structurally proven Shopify-owned preview iframe. Axe does not certify the observed visual focus occlusion.

F-DEC-001 remains **APPROVED_OPTION_A**. Payment terms render and associate with the actual current Variant in all 72 newly observed browser cells. Text/zoom layout and provider readability remain valid; mobile text-enlarged provider focus accessibility is qualified by the merchant header obstruction. No Rhino financing copy or payment configuration changes were made.

Console: **124** observed known native Shop Pay frame-ancestors/CSP and HTTP403 errors, two distinct messages; no unexpected console errors, page errors or Liquid errors. This noise remains separate from the actual sticky-header defect. Failed requests and HTTP errors are retained by origin/path/query names in the evidence. Harness-blocked requests: 0; document downloads: 0; no cart/Contact/checkout/order request or eager governed video/resource request.

Zero-grant containment passes in every observed responsive/enlarged/zoomed state: no technical specs, BOM, compatibility, supplemental delivery/warranty/service, resources/manuals/diagrams/instructions/videos/support files, factual gallery, populated hidden media modal or legacy description fallback. Header/footer, cart affordance, policy links and native predictive search remain; only the specified mobile text-focus obstruction fails. Contact remains `/pages/contact`, readable/wrapped/focusable, with visible focus and no form submission.

## Unavailable real-state disposition and literal acceptance

`alternateVariantState = NOT_AVAILABLE_IN_CURRENT_F7_PRODUCT_SCOPE`. All eight have one real Variant. Exact Admin Variant IDs match native form and provider IDs in all 72 observations; no artificial options were created. The current 014B acceptance language does not mandate a real alternate Variant regardless of catalog state. Unavailability is an accepted limitation of this current shell scope, not evidence that a future alternate-Variant update journey passed. A future actual additional Variant makes that journey testable.

`availablePickupState = NOT_AVAILABLE_IN_CURRENT_F7_PRODUCT_SCOPE`. Every native pickup element has `available=false`; unavailable presentation remains hidden. The current contract does not require an available pickup configuration regardless of actual catalog/store state. This is an accepted current-state limitation, not live available-pickup coverage. A future legitimate pickup/inventory/location state would make it testable; none was manufactured.

F-PBI-014B remains **PARTIAL** for three precise criteria, without weakening its acceptance language:

- **F014B-FOCUS-CURRENT** — “Touch targets, visible focus and screen-reader labels cover purchase, resource and contextual links.” At 390px with root text 200%, sticky merchant header is approximately 560px tall and obscures the footer Search link and native payment-terms View sample plans focus target on all eight Products. **Needed:** Separately authorized global-header responsive fix, followed by source-bound assigned-route revalidation. No Product data change is needed.
- **F014B-MEDIA-MODULE-FUTURE** — “Modal Enter/Escape/focus return and disclosure keyboard behavior hold with one/multiple media and populated/empty modules.” All eight have zero governed factual/media/resource grants. Modal and populated module DOM are correctly absent. Fixtures cannot establish live assigned-route parity. **Needed:** Future owner-approved Epic E values/resources/media and corresponding explicit F grants activated within an authorized release scope; then test the actual live journeys.
- **F014B-RESOURCE-CONTEXT-FUTURE** — “Touch targets, visible focus and screen-reader labels cover purchase, resource and contextual links.” Resource/contextual projections are suppressed with zero grants; no real links exist to keyboard-test. **Needed:** Future approved migration and activation of real resource/contextual links, followed by keyboard/labels/touch-target/axe testing.

The current task’s requirement that every focusable merchant control remain visible behind sticky/fixed UI fails now. Separately, the existing broad 014B contract explicitly retains live one/multiple-media/modal and populated-resource/contextual journeys. Zero grants correctly suppress those states; local fixtures do not establish assigned live parity. Epic E incompleteness does not invalidate the shell measurements, but it cannot be treated as successful live populated-module testing. Historical criteria/checkmarks and pre-assignment evidence remain unchanged.

## Performance/readiness consequence

F-PBI-015B remains **DEFERRED**, not executed. Its literal dependency list is F-PBI-002–012 applicable modules, F-PBI-013 widget outcome and B-030 performance governance; it does **not** explicitly require overall 014B Complete. Unavailable alternate Variant/pickup and inactive future factual journeys do not prohibit a separately authorized, source-bound current-shell performance measurement. However, the real header defect blocks accessibility/release readiness, and a runtime correction would require a newly bound performance certificate. Recommendation: fix/revalidate that defect before release performance certification. No performance samples, medians or certification were produced here.

F-PBI-017B stays **COMPLETE**. F-PBI-018B stays **NOT_BEGUN**, readiness **NOT_READY**. F-DEC-001 stays approved Option A. E-MUT-020/021 completion is unchanged. Technical facts, measurements, compatibility, BOM, recommendations, fulfillment/timing, warranty/service and resources remain separate incomplete domains with zero grants.

## Harness integrity and validation

Initial observations are preserved. The first focus inventory used mutable DOM indexes; late Shopify/provider insertions changed those indexes and generated false skipped controls/cycle failures. WeakMap IDs now track actual controls. Wrapped-link focus is tested at painted text line boxes using deep shadow hit tests. CSS-clipped screen-reader-only label Range boxes are excluded from painted geometry, while their accessible names remain tested. A 300 ms navigation observation preceded the native 400 ms close animation; the revised observation waits through completion. None of these changes suppresses actual merchant/provider failures. All eight mobile header obstructions remain failures.

Developer tooling created: `scripts/lib/epic-f-014b-assigned-validation.js`, `scripts/lib/epic-f-014b-browser-zoom.js`, `scripts/lib/epic-f-014b-focus.js`, `scripts/run-epic-f-014b-assigned-accessibility.js`, `scripts/run-epic-f-014b-focus-confirmation.js`, `scripts/test-epic-f-014b-assigned-accessibility.js`, and `scripts/finalize-epic-f-014b-assigned-accessibility.js`. Current operational eligibility/development status and an additive tracker section reference the disposition. No repository theme runtime file was changed. Historical execution/source/readiness manifests remain immutable.

Validation results:

| Command/check | Exit / result |
| --- | --- |
| Fresh Admin source/assignment binding and final no-change comparison | PASS; 28 files / 11 Products; 0 mutations |
| `node scripts/run-epic-f-014b-assigned-accessibility.js` | 1; preserved initial DOM-index focus harness observations, valid responsive/text geometry/zoom results |
| `node scripts/run-epic-f-014b-focus-confirmation.js` | 1; final actual 8 mobile focus failures retained, 16 keyboard cells passed |
| `node scripts/test-epic-f-014b-assigned-accessibility.js` | 0; 25 deterministic contract/zoom/focus/negative cases |
| `node scripts/test-epic-f-preview-accessibility-ownership.js` | 0; 6 cases, merchant/app/provider failures retained |
| `node scripts/test-epic-f-claims.js` | 0; 11 saved identities / 7 adversarial surfaces |
| `node scripts/validate-json-registers.js` | 0 |
| `node scripts/finalize-epic-f-014b-assigned-accessibility.js` | 0; records PARTIAL accurately |
| CLI 4.8.3 `theme check --path . --fail-level warning --output json` | 0; zero errors/warnings; no threshold change |
| `git diff --check` | 0 |


Evidence: [acceptance-decision.json](../qa/evidence/epic-f/014b-assigned-2026-10-06/acceptance-decision.json), [browser matrix](../qa/evidence/epic-f/014b-assigned-2026-10-06/browser-validation.json), [corrected focus matrix](../qa/evidence/epic-f/014b-assigned-2026-10-06/focus-validation.json), fresh before/after Admin snapshots, binding, persistent no-change proof, local contract tests, visual proof, Theme Check, validation summary and evidence manifest. All credential material remains outside durable evidence.

Next action: separately authorize the focused global-header responsive correction, then rerun the eight failing 390 px/200% text keyboard cells under a fresh source binding. Preserve future approved media/resource/contextual parity as exact deferred live-state criteria. Do not populate facts or alter the catalog just to pass tests. Stop here; no 015B execution or 018B signoff is performed.
