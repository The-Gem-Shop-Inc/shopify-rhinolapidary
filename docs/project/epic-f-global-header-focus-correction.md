# Global header focus correction — 2026-10-06

The merchant sticky-header obstruction is corrected on both Preview and MAIN. All eight formerly failing 390 px/200% text cells pass; the complete assigned-route text matrix passes **16/16**. Current machine-shell accessibility passes. **F014B-FOCUS-CURRENT is COMPLETE**, while overall F-PBI-014B remains **PARTIAL_FUTURE_LIVE_STATES_ONLY**. F-PBI-015B is **READY_FOR_AUTHORIZED_CERTIFICATION**, not executed.

Authorization: `delegated_development_override`, bounded to one reviewed runtime file, Preview-first deployment, MAIN in-place deployment, read-only browser/Admin verification and exact header rollback. No Product, assignment, Epic E, payment, pickup, inventory, Variant or factual mutation was authorized or performed. No theme publication or replacement occurred.

## Root cause and exact correction

The current Trade header uses a centered mobile fallback brand (`Rhino Lapidary`), rather than a configured logo, in a `1fr 2fr 1fr` grid. Mobile drawer/icons occupy the outside columns; desktop navigation is hidden below its existing breakpoint. At root 20 px, rem-based icon footprints, link spacing and horizontal padding grow. At 390 px, measured grid columns are approximately 64 / 60 / 168 px; horizontal header padding is 60 px on each side. The middle link's own padding leaves a very narrow text column. Existing `word-break: break-word` lets the fallback brand wrap almost character by character, giving a 550 px brand box, 558 px header and approximately 560 px sticky section.

The merchant sticky section stays at top 0, z-index 3. Keyboard scrolling positions the footer Search text and native View sample plans target near y=500; the tall header paints over them. Deep hit testing reaches HEADER/brand instead of the focused control. This is a real global-theme defect, independent of axe, provider ownership and Preview tooling. Existing sticky-header JavaScript records header geometry on initialization/breakpoint events; no additional measurement JavaScript is needed for this correction.

Only `sections/header.liquid` changes, inside its existing `{%- style -%}` block, after the section-header rule and before the existing min-width 750 px rule:

```diff
+  @media screen and (max-width: 749px) {
+    .section-header {
+      position: relative;
+      top: 0;
+    }
+  }
+
```

Below 750 CSS px, the section participates in ordinary document flow and scrolls away with its content. At 750 px and above, its existing sticky behavior remains. This deliberately also makes normal mobile navigation nonsticky. Normal mobile geometry/content is unchanged; the 390 px header remains 52 px plus its section border. The enlarged header can still be approximately 560 px tall, but no longer overlays focused content.

No font size, enlargement factor, transform, meaningful overflow/clipping, brand text, navigation visibility, focusability, focused-control z-index, spacing, grid, schema or runtime JavaScript was changed. Focus tests use the unchanged painted-text/deep-shadow hit-test algorithm. No viewport, ownership signature, hit-test threshold or PBI acceptance language was weakened.

| Runtime path | Original SHA256 | Corrected SHA256 |
| --- | --- | --- |
| `sections/header.liquid` | `3ea5ea10e95cd75766d6d52470fe4fdde93913f0d94838aed6745938d632d572` | `e9e34d8dae4c59cf5040b010339e2124e46d71f89d960d80f1a9ef1589d93339` |

The insertion count is exactly one. Removing the exact insertion reconstructs both targets' original bodies. Original focus algorithm SHA256 remains `fccbe4cdb743f0918897ef8c8c111af233a12479960100218e89b98b73bee4ff`.

## Before-state, backup and deployment

Fresh read-only Admin checks confirmed MAIN **158579622085 / shopify-rhinolapidary/main / MAIN**, 422 file records, and Preview **158631198917 / Rhino Lapidary - Preview / UNPUBLISHED**, 426 records. Both had the identical original header. Complete inventories and exact original/intended header bodies, MD5s and SHA256s are stored in [authorization and rollback evidence](../qa/evidence/epic-f/header-focus-correction-2026-10-06/deployment-authorization-and-rollback.json). Configuration credentials were not retained; only safe header presentation settings were recorded.

All 28 historical machine-activation sources retain their protected hashes. The additive source binding contains those unchanged 28 files plus the corrected global header: **29 files**, identity `GLOBAL_HEADER_FOCUS_CORRECTION_2026_10_06`, canonical binding SHA256 `7f9156cef929619f7e9fb38ee5f51e740c7d63fe0efdeaf4cc510eaf32b72e37`. [Source binding](../qa/evidence/epic-f/header-focus-correction-2026-10-06/source-binding.json) explicitly records old → new hash, exact transform and authority hash. Historical activation, E-MUT, F7/F8 and 014B manifests are not rewritten. Current aggregate validation opts into this exact reviewed header proof; there is no generic hash/approval bypass.

Pinned Shopify CLI **4.8.3**, with auto-upgrade/analytics suppression, executed exactly:

```text
shopify theme push --store sz5dnk-nf.myshopify.com --theme 158631198917 --path . --only sections/header.liquid --nodelete --strict --json
shopify theme push --store sz5dnk-nf.myshopify.com --theme 158579622085 --path . --only sections/header.liquid --nodelete --strict --allow-live --json
```

Preview push: **exit 0**, 2026-10-06T20:33:02.996Z–20:33:43.763Z. Exact readback passed; MAIN remained original. Preview validation passed **34/34** ownership-scoped/comparative cells before MAIN authorization was consumed.

MAIN push: **exit 0**, 2026-10-06T20:51:45.701Z–20:52:07.237Z. Immediate exact source readback passed. Final complete readback confirms both corrected headers, unchanged inventories, and exact unchanged non-header file records. **Created files: 0. Updated files: one per theme. Unplanned changes: 0.** No `--publish`, full-theme push or theme replacement was used.

Rollback was **not invoked**. Exact original bodies remain available. The deployment tool rejects extra paths, source drift, stale/mismatched target roles, missing backups, MAIN deployment without passed Preview evidence and repeated push reservations. Its bounded rollback mode restores MAIN then Preview from these exact bodies, without touching assignments; this mode was not executed.

## Local proof and Preview qualification

Actual pre-fix live BeadMaster reproduction confirms both obstructed targets at 390 px/root 20 px. The deterministic local regression uses captured public Trade header/CSS, the original inline cascade position, the exact original/corrected source and the unchanged focus algorithm. Both pre-fix target tests fail as expected; both corrected target tests pass with visible indicators and owned painted hits. Normal 320/390/768/1440 geometry/overflow checks also pass: **6/6** cases. Actual storefront validation with the exact reviewed CSS insertion applied locally passes **40/40** representative machine/global cells.

Preview passes all eight exact 390 px/200% text failures, eight representative normal machine cells, twelve normal global cells and six enlarged global cells: **34/34**. Footer Search and native payment terms genuinely receive their painted-point hit; their failures are never excluded as tool noise.

Preview's full document is **not axe-clean**. Across 34 full-document scans, actual finding occurrences are **critical 10 / serious 58 / moderate 10 / minor 0**. Merchant storefront scope is **0 / 0 / 0 / 0**. The only exclusion is structurally verified `iframe#PBarNextFrame`, sourced from `https://cdn.shopify.com/shopifycloud/preview-bar/index.html`; no rule IDs, theme/app/provider markup or inconvenient merchant controls are excluded.

Raw toolbar focus failures and its pre-existing occlusion of some bottom policy/global links remain recorded. Attribution compares the same Preview DOM before/after removing and exactly restoring only the reviewed header CSSOM rule; no toolbar is hidden and the original focus algorithm is unchanged. Exact footer Search/payment targets must still pass independently. Eight deterministic attribution tests reject merchant-header hits, mixed hits, arbitrary app iframes, missing indicators, clipping and unverified tooling. Initial incorrect cross-theme baseline comparison and tooling observations are preserved separately; the final same-document proof replaces that comparison, not the underlying findings.

## Actual live assigned-route results

Every live navigation uses its normal URL, without `view=machine` or `preview_theme_id`; rendered `Shopify.theme.id` must equal MAIN. Real Rhino CSS loads once and preview inline CSS remains absent.

| Product / route | First 390 px / 200% text | Full text 390 | Full text 1440 | Purchase state |
| --- | --- | --- | --- | --- |
| BeadMaster — `/products/beadmaster` | PASS | PASS | PASS | Sold out |
| EM-1 — `/products/em-1` | PASS | PASS | PASS | Sold out |
| LapMaster 12 — `/products/lapmaster-12` | PASS | PASS | PASS | Purchasable |
| LapMaster 18 — `/products/lapmaster-18` | PASS | PASS | PASS | Purchasable |
| SawMaster 18 — `/products/sawmaster-18` | PASS | PASS | PASS | Sold out |
| SawMaster 24 — `/products/sawmaster-24` | PASS | PASS | PASS | Sold out |
| ShapeMaster — `/products/shapemaster` | PASS | PASS | PASS | Sold out |
| TrimMaster — `/products/trimmaster` | PASS | PASS | PASS | Sold out |

The eight original failures run first: **8/8 PASS**. The full repeated text matrix passes **16/16**, with measured root 10→20, body 16→32, mobile title 30→60 and desktop title 40→80 CSS px. No machine horizontal overflow, content loss, hidden controls, material clipping or overlap is introduced. Footer Search and View sample plans are unobscured with visible indicators and owned deep painted hits in every applicable state.

Thirty-eight complete live machine keyboard cells cover first-failure checks, full text matrix, eight normal BeadMaster/LapMaster 12 cells at 320/390/768/1440 and six true-zoom cells. Full cycles/order pass **38/38**; skipped controls, unexpected traps, missing focus indicators, merchant focus occlusions and provider targets occluded by theme are all **0**. Skip/header/brand/navigation/search/cart, current Variant context, quantity, enabled purchase, Contact, native terms and footer/policy controls are covered. Mobile drawer, desktop Catalog and search open/Tab/Escape/focus-return checks pass. Disabled Sold out controls remain semantically disabled. Quantity ArrowUp/ArrowDown restores 1→2→1 without cart submission.

### Real Chromium zoom

BeadMaster (sold out) and LapMaster 12 (purchasable) each pass true 200% zoom at three physical widths, **6/6** cells:

| Physical width | Effective layout before → after | Header at 200% |
| --- | --- | --- |
| 780 | 758 → 379 CSS px | Normal flow |
| 1280 | 1258 → 629 CSS px | Normal flow |
| 2880 | 2858 → 1429 CSS px | Existing desktop sticky |

The existing `chrome.tabs.setZoom(..., 2)` method records factor 2, DPR 1→2, unchanged root CSS font, visualViewport.scale 1 and exact halved layout width. No viewport-only simulation, root enlargement, CSS transform or page-scale emulation substitutes for browser zoom. Anonymous extension/profile contexts retain no authentication cookies and are removed; authenticated contexts remain in memory. Native provider fixed-pixel shadow button text remains 13 CSS px under root-font simulation; actual browser zoom doubles its physical display. That distinction remains documented.

### Global and non-machine surfaces

After MAIN deployment, replacement part `/products/anchor-rod-set`, consumable `/products/bonded-diamond-wheel-220`, accessory `/products/screw-on-flat-lap`, `/collections/all`, native search and `/cart` pass **30/30 comparative cells**: normal 320/390/768/1440 plus enlarged 390. Header/brand/drawer, native actions, search, cart affordance, footer and policy behavior show no material regression. Account state is covered only where actually rendered. No cart, Contact, checkout or order submission occurs.

Pre-existing card-link computed-indicator observations and collection/search Page 1 tab-inventory observations remain in raw baseline/comparison evidence. No new failures or worsening is accepted; this focused task does not certify or fix unrelated pre-existing observations. The machine focus result remains strict, without such exceptions.

### Axe, native shell and containment

All **68 new live full-document scans** report **critical 0 / serious 0 / moderate 0 / minor 0**, without Preview or merchant/provider/app exclusions. Axe supplements the visual focus proof; it does not replace it.

Both actual purchasable Products retain enabled, visible/focusable purchase presentation; six sold-out Products retain disabled presentation. Price/title/current Variant/quantity pass. Every observed machine native form/provider Variant ID matches its fresh Admin Variant. Contact remains `/pages/contact`, readable/wrapped/focusable. F-DEC-001 stays approved Option A; native terms remain rendered/current-Variant-associated, readable and unobscured. No Rhino financing copy or payment configuration changes occur.

All eight retain one Variant and native pickup `available=false`; unavailable pickup presentation stays suppressed. No alternate Variant or available-pickup state is manufactured. Their accepted current-catalog coverage limitations remain, without claiming future-state coverage.

Zero factual grants remain **0**. Every observed machine state suppresses specifications, BOM, compatibility, supplemental delivery/warranty/service, manuals/resources/diagrams/instructions/videos/support files, factual gallery, populated hidden media modal and legacy description fallback. Native Product/Offer identity containment remains valid; the header patch never changes projection/schema/metadata code.

## Console, network and persistent no-change proof

Live logs retain **126 known native/provider console occurrences**, across three types: Shop Pay frame-ancestors/CSP, HTTP 403, and an invalid ALLOW-FROM X-Frame-Options warning. The third type is explicitly present in the actual **pre-fix** reproduction; it is not a new header regression. Initial finalization stopped on this unclassified warning, then exact before-state evidence established its pre-existing classification. No focus/assertion threshold was relaxed. All raw messages remain in evidence.

Rhino/theme page errors **0**, Liquid errors **0**, unexpected console types **0**. Live failed-request records are classified rather than discarded: 231 aborted native monorail batches, 137 aborted native collect calls, five aborted Shopify error-observation calls, and 61 native Shop Pay responses blocked by browser policy. The 61 HTTP error records are native `/pay/hop` 403 responses. These records do not imply a new Rhino error or new analytics instrumentation; the only runtime change is header CSS. Payment/purchase display continues to pass.

Guard-blocked requests **0**; document downloads **0**; no cart mutation, Contact submission, checkout/order action, eager governed video/document/resource or factual media activation. Existing native telemetry is retained/classified separately. No pixel/analytics configuration was changed.

Fresh full catalog before-read: **2026-10-06T20:04:05.957Z–20:05:43.890Z**. Final read: **2026-10-06T21:00:19.901Z–21:00:44.025Z**, 25 pages, 122 exact Products, all nested pagination exhausted. All queried Product/Variant fields are exactly unchanged, including updatedAt, suffix, title/handle/description, tags, vendor/type/category, SEO, publication/status, media identity, options, price/inventory/SKU/barcode/measurements and all returned metafields.

Classification remains **machine 11 / replacement_part 54 / consumable 39 / accessory 18**. Eight machine suffixes remain `machine`; JadeMaster, SawMaster 36 and TumbleMaster remain null. All queried Rhino values remain product_class only. Product mutations **0**; other factual/relationship/resource values introduced **0**. Theme file updates are the two authorized header writes, not zero total Shopify writes.

## Validation and current disposition

| Check / command | Result |
| --- | --- |
| Actual pre-fix focus reproduction | Expected obstruction reproduced on both targets |
| `node scripts/test-epic-f-header-focus-correction.js` | Exit 0; 6 cases, pre-fix failure retained |
| `node scripts/run-epic-f-header-focus-validation.js local` | Exit 0; final 40/40 (valid passed cells retained under unchanged source/algorithm) |
| `npm run validate:epic-f-batch-f7` with explicit cleanup/header binding | Exit 0; required F1–F7 aggregate passes |
| F8 readiness validator and adversarial tests under new binding | Exit 0; 66 tests |
| `node scripts/validate-epic-f-header-focus-gates.js` / `--final` | Both exit 0; header/global JS/CSS/navigation, ownership, claims, registers, F8, Theme Check and diff gates |
| `node scripts/test-epic-f-header-preview-attribution.js` | Exit 0; 8 negative/positive cases |
| `node scripts/run-epic-f-header-focus-validation.js preview --resume-preview` | Exit 0; final 34/34, full toolbar findings retained |
| `node scripts/deploy-epic-f-header-focus-correction.js preview` / `main` | Both exit 0; one file per target |
| Readback validator; immediate and final full inventories | Exit 0; exact corrected bodies, no unplanned records |
| `node scripts/run-epic-f-header-focus-validation.js live-first-eight` | Exit 0; 8/8 |
| `node scripts/run-epic-f-header-focus-validation.js live-regression` | Exit 0; 58/58 including full 16 text cells |
| `node scripts/run-epic-f-header-focus-validation.js live-desktop-zoom` | Exit 0; 2/2 additional effective desktop zoom cells |
| `node scripts/finalize-epic-f-header-focus-correction.js` | Exit 0; contract/source/catalog/focus/disposition/current readiness |
| `node scripts/test-global-navigation-ia-validator.js` | Exit 0 |
| `node scripts/validate-hardcoded-strings.js` | Exit 0; pre-existing selector/event-string heuristics and unused allowlist warnings retained separately |
| `node scripts/validate-json-registers.js` | Exit 0 after current status updates |
| CLI 4.8.3 `theme check --path . --fail-level warning --output json` | Exit 0; **0 errors / 0 warnings**, unchanged thresholds |
| `git diff --check` | Exit 0 |

Initial F8 historical-pin failure is preserved: an intentional runtime change required the new additive, exact-proof source binding before the aggregate could pass. No old manifest was rebound. Existing F1's explicitly nonrequired launch-fixture/product-export diagnostic exits remain 1 and visible in aggregate evidence; required gates all pass. The skill's separate validation helper could not resolve its bundled theme-check dependency; no installed package was modified, and official pinned CLI full-repository validation passed instead. These tooling/diagnostic qualifications are separate from the corrected runtime result.

Current status:

- **F014B-FOCUS-CURRENT:** COMPLETE; current assigned shell PASS.
- **F014B-MEDIA-MODULE-FUTURE:** retained/open for real approved one/multiple-media/modal and populated-module journeys.
- **F014B-RESOURCE-CONTEXT-FUTURE:** retained/open for real approved live resource/contextual links.
- **F-PBI-014B:** PARTIAL_FUTURE_LIVE_STATES_ONLY; literal acceptance contract unchanged.
- **F-PBI-015B:** READY_FOR_AUTHORIZED_CERTIFICATION; no certification executed.
- **F-PBI-017B:** COMPLETE; assignments unchanged.
- **F-PBI-018B:** NOT_BEGUN / NOT_READY; performance and selected-scope readiness/signoff remain.
- **F-DEC-001:** APPROVED_OPTION_A. **E-MUT-020/021:** EXECUTED_AND_RECONCILED, unchanged.

Developer tooling: `scripts/lib/epic-f-header-focus-correction.js`, `scripts/lib/epic-f-header-preview-focus.js`, `scripts/probe-epic-f-header-focus-correction.js`, `scripts/test-epic-f-header-focus-correction.js`, `scripts/test-epic-f-header-preview-attribution.js`, `scripts/run-epic-f-header-focus-validation.js`, `scripts/deploy-epic-f-header-focus-correction.js`, `scripts/verify-epic-f-header-focus-readback.js`, `scripts/validate-epic-f-header-focus-gates.js`, and `scripts/finalize-epic-f-header-focus-correction.js`. The existing developer-only cleanup-binding helper gains only this exact opt-in header proof. Current development/Shopify eligibility JSON and an additive tracker section reference the decision; no historical report is rewritten.

Sanitized evidence lives under `docs/qa/evidence/epic-f/header-focus-correction-2026-10-06/`; [acceptance decision](../qa/evidence/epic-f/header-focus-correction-2026-10-06/acceptance-decision.json), [final readback](../qa/evidence/epic-f/header-focus-correction-2026-10-06/final-readback-proof.json), [protected catalog comparison](../qa/evidence/epic-f/header-focus-correction-2026-10-06/catalog-protected-comparison.json) and its evidence manifest provide file-by-file hashes. Temporary public fixtures/logs/reservations stay under ignored test-results. No password, authenticated cookie, storageState, signed URL or trace is retained.

Historical 014B's manifest also referenced two mutable current-status JSON files. Those authorized operational revisions are superseded here; their exact original bytes are reconstructable from `operational-state-before.json` and still match their old manifest hashes. The other 23 historical QA entries remain byte-identical, and the old manifest itself is unchanged. This distinction is recorded in `historical-preservation-proof.json`; old current-status hashes are not falsely represented as still current.

Next action: separately authorize F-PBI-015B certification of the current assigned shell, bound to the corrected source identity/hash above. Stop here; no performance certification, catalog-fact activation or final release signoff is performed.
