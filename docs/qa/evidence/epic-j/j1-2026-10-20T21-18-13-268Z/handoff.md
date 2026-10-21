# Epic J1 engineering handoff

J-PBI-001 and J-PBI-002: **COMPLETED for the authorized repository engineering scope**. Changed-preview acceptance remains **NOT VERIFIED**. No production or commercial readiness claim; J-PBI-008 remains PROPOSED.

## 1. Defects before and after

J-DEF-001: the corrected pre-edit fixture reports a hidden native error wrapper after transport rejection. The successor displays the existing translated cart error in the native `role=alert`, restores controls, keeps selected Variant/quantity, prevents concurrent submissions and never retries an uncertain POST. Complete native section roots and exact added-line key are validated before any cart-update publication or fragment replacement. Incomplete/malformed JSON or section responses close a prior notice and show a recoverable error; native cart navigation reconciles server state, including a POST that succeeded despite an invalid response. Native 422, unavailable/sold-out and no-JavaScript forms remain covered.

J-DEF-002: J0 actual preview/MAIN recorded 504px scroll width and approximately 494px quantity right edge at enlarged mobile text. The equivalent local native fixture reproduces 385px/395px overflow at 360px/390px; font/platform context differs, so these are not claimed as identical live measurements. After the scoped reflow, document/cart content fits every tested width, words/subtotal wrap naturally and native controls remain operable. Desktop item/control geometry is exactly unchanged at both text sizes.

Original J0 reports/screenshots and all failed J1 attempts are preserved. Initial J1 fixture attempts exposed platform adapter issues (native refresh without option_values, and a synthetic maximum enabling an unnamed desktop quantity-rule button). These were corrected only in fixtures; runtime remained unchanged for the corrected before run. The artificial quantity-rule finding was not suppressed through axe exclusions.

## 2. Exact changed repository files

| Path | Purpose |
| --- | --- |
| `assets/product-form.js` | J001: display native translated role=alert error for rejected/invalid responses; one in-flight submission; validate all requested section roots before publication/render; close stale notice; preserve native 422/sold-out and never auto-retry. |
| `assets/component-cart-items.css` | J002: mobile full-cart two-column reflow, full-width quantity row and natural subtotal wrapping. No reduced font, hidden content, header, desktop or inactive drawer redesign. |
| `tests/epic-j-cart.spec.js` | Opt-in J1 cases and explicit repository-only live skips; supply the native translated global missing from the older platform fixture; assert visible error for J1. |
| `scripts/lib/epic-j-cart-fixtures.js` | Parameterize server items and native null quantity maximum; retain original default fixture behavior. |
| `scripts/validate-epic-f-machine.js` | One narrowly scoped opt-in native-source successor adapter; original expected hashes and arbitrary-source negative remain intact. |
| `docs/rhino-lapidary-pbi-tracker-epic-j.md` | Record current owner authorization and local implementation separately above retained J0 proposal; J008 remains proposed. |
| `scripts/lib/epic-j-j1-fixtures.js` | Reuse F/J Liquid and native scripts; emulate Product add, complete/incomplete sections, exact four Saw Blade Size identities, server cart changes and navigation on .local only. |
| `scripts/lib/epic-j-j1-protection.js` | Pin reviewed successor manifest, predecessor/rollback hashes, exact repository deltas, all other starting files and all 730 J0 protected sources. |
| `scripts/test-epic-j-j1-readiness.js` | Seven positive/eight negative successor, drift, policy and lifecycle assertions. |
| `scripts/run-epic-j-j1.js` | Existing Playwright/npm orchestration, unique evidence, exact command exits and repository-only mode. No second cart/GraphQL/approval system. |
| `tests/epic-j-j1.spec.js` | 22 J1 browser cases: failure/recovery, duplicate submission, complete-fragment rejection, Size line identity, native state/history/section refresh, focus and six layout/axe cells. |
| `data/epic-j-j1-source-successor.json` | Reviewed exact J1 source identities, before/after hashes and rollback sources; no receipt/grant/deployment authority. |

All other new output is isolated under this evidence directory. Package scripts, global CSS/header, Product templates, locales, cart settings and checkout configuration are unchanged.

## 3. Source governance

Successor **J1-2026-10-20-NATIVE-CART**; manifest SHA-256 `6656356c225ee086c611381152d196b19e79782ba6dbe9a2ef07d14ad4f868db`. J0 contract SHA-256 `469e8a0582d31ba9fbb8c407281132c6ac9bf84aaa256b3c802b2ff49068b82a` remains immutable.

| Runtime file | Before SHA-256 | After SHA-256 |
| --- | --- | --- |
| assets/product-form.js | `aac169636e4bea2fe681b2263bc83126c816976cb434a8409a0b3c3dc1b4dd7f` | `da08afa153574f787a24ba5575c8e62cc5c40f344c3e84dadb66edee722b5ce7` |
| assets/component-cart-items.css | `0cffb73c727e544750d944e8c3bbedda1ff4539c88c25aee106b602747f0cc9a` | `a2765fd6ba70f84801291b2b8615b6e099568b690a22b758baacde021b1a3e9c` |

Rollback bytes are the exact predecessor copies named in the manifest. They are repository rollback sources, not a substitute for fresh remote-theme rollback bytes. J1 verifies 5518 starting files and all 730 protected J0 sources, permitting only six exact reviewed repository changes (two runtime files, two test/harness files, tracker update and one-line native guard adapter). All existing historical evidence and owner/relationship records remain unchanged. The verifier pins its manifest; its own source checksum replaces only the manifest pin literal with the documented placeholder to avoid a circular digest. This exception never applies to runtime or historical sources.

The original J0 guard still FAILS against the successor: 40 of 41 unit cases pass (all 32 negative cases pass), and its unchanged-source positive rejects the successor. The old task guard also rejects authorized changes. These original failures are retained under `historical-j0-guard/`; they are not rewritten as passes. The J1 successor supplies separate acceptance. Native F validation recognizes J1 only with `RHINO_J_SOURCE_SUCCESSOR=J1-2026-10-20-NATIVE-CART`; unknown predecessor, further JS/CSS changes and arbitrary native Product changes still fail. Historical G deployment allowances do not grant J1 deployment.

## 4. Tests and command outcomes

J1 source tests: **15/15** (seven positive, eight negative). Cart suite: **33 PASS / 3 SKIPPED**, including 22 J1 and 11 retained J0 offline cases. Skips are actual-preview cases because the changed code is undeployed. Machine suite: original **57 PASS / 1 FAIL** (60-second browser-zoom API timeout); the exact unchanged zoom test passed **1/1** on a focused rerun. The original integrated J1 runner remains **FAIL, exit 1**; local assertion coverage is satisfied by its passing cases and the retained focused rerun, not by deleting the failed sample.

| Command | Exit | Evidence |
| --- | --- | --- |
| `npm.cmd run validate:epic-j-readiness` | 1 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/historical-j0-guard/readiness.txt |
| `npm.cmd run test:epic-j-readiness` | 1 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/historical-j0-guard/governance-negative-tests.txt |
| `npm.cmd run validate:cart-config` | 0 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/historical-j0-guard/cart-config.txt |
| `npm.cmd run validate:product-purchase` | 0 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/historical-j0-guard/purchase-architecture.txt |
| `npm.cmd run validate:theme-architecture` | 0 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/historical-j0-guard/theme-architecture.txt |
| `npm.cmd run validate:registers` | 0 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/historical-j0-guard/registers.txt |
| `npm.cmd run theme:check` | 0 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/historical-j0-guard/theme-check.txt |
| `node scripts/test-epic-j-j1-readiness.js` | 0 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/acceptance-01/j1-source-and-negative-tests.txt |
| `npm.cmd run test:epic-j-cart -- --output docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/acceptance-01/cart-artifacts --reporter=line,json` | 0 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/acceptance-01/native-cart-browser.txt |
| `npm.cmd run validate:epic-f-machine` | 0 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/acceptance-01/native-machine-guard.txt |
| `npm.cmd run test:machine-shell -- --output docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/acceptance-01/machine-artifacts --reporter=line,json` | 1 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/acceptance-01/native-machine-browser.txt |
| `npm.cmd run validate:product-purchase` | 0 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/final-static/product-purchase.txt |
| `npm.cmd run validate:theme-architecture` | 0 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/final-static/theme-architecture.txt |
| `npm.cmd run validate:registers` | 0 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/final-static/registers.txt |
| `npm.cmd run theme:check` | 0 | docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/final-static/theme-check.txt |
| `node --check assets/product-form.js` | 0 | JSON command record / focused rerun |
| `node --check scripts/lib/epic-j-cart-fixtures.js` | 0 | JSON command record / focused rerun |
| `node --check scripts/lib/epic-j-j1-fixtures.js` | 0 | JSON command record / focused rerun |
| `node --check scripts/lib/epic-j-j1-protection.js` | 0 | JSON command record / focused rerun |
| `node --check scripts/run-epic-j-j1.js` | 0 | JSON command record / focused rerun |
| `node --check scripts/test-epic-j-j1-readiness.js` | 0 | JSON command record / focused rerun |
| `node --check scripts/validate-epic-f-machine.js` | 0 | JSON command record / focused rerun |
| `node --check tests/epic-j-cart.spec.js` | 0 | JSON command record / focused rerun |
| `node --check tests/epic-j-j1.spec.js` | 0 | JSON command record / focused rerun |
| `npm.cmd run test:machine-shell -- --grep "Chromium actual browser zoom" --output docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/machine-zoom-rerun/artifacts --reporter=line,json` | 0 | JSON command record / focused rerun |
| `git apply --check --reverse docs/qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/j1-workspace.patch` | 0 | JSON command record / focused rerun |

Final Theme Check: **499 files, zero offenses**. Nine final JS syntax checks pass. The skill toolkit helper printed a missing `@shopify/theme-check-common` error despite process exit 0; this auxiliary validation is **BLOCKED**, not PASS. Repository Shopify CLI Theme Check remains independently verified.

Before reproductions: first attempt 2 pass/5 fail with fixture errors; corrected pre-edit run 4 pass/3 expected defect failures. Product recovery first run 6 pass/3 fixture refresh failures; corrected run 9 pass. Mobile run 6 pass; earlier complete cart run 26 pass/3 remote skips; added native update run 7 pass. Exact raw logs/Playwright JSON are retained in their unique subdirectories.

Reproduce current local acceptance with `node scripts/run-epic-j-j1.js --evidence docs/qa/evidence/epic-j/<new-unique-directory>`. It uses existing npm/Playwright infrastructure and refuses reuse; no credential or live-cart mode is added. Original J0 commands retain their historical meaning.

## 5. Accessibility and cart geometry

| Viewport | Text/root | Before scroll | After scroll | Quantity right | Serious/critical axe |
| --- | --- | --- | --- | --- | --- |
| 360 | 100% / 10px | 360 | 360 | 157 | 0 |
| 360 | 200% / 20px | 385 | 360 | 312 | 0 |
| 390 | 100% / 10px | 390 | 390 | 157 | 0 |
| 390 | 200% / 20px | 395 | 390 | 312 | 0 |
| 1440 | 100% / 10px | 1440 | 1440 | 1042 | 0 |
| 1440 | 200% / 20px | 1440 | 1440 | 1048.125 | 0 |

Screenshots and complete geometry/axe JSON are in `acceptance-01/`. Product and Variant names, unit/line prices, quantities, labeled removal, subtotal and standard checkout are verified. Quantity actions exercise native 422 restoration at each width/text setting. Notification focus names/trap/Escape/return and hidden-control exclusion pass across all six cells. The inactive drawer retains its existing fixture coverage and is not activated. No font-size reduction, clipping or overflow hiding is used.

Cart-specific fixtures omit the global header; the inherited Epic C approximately 558px enlarged header remains open and cannot be claimed resolved by these measurements. Epic F moderate heading order and J0 provider-owned preview-toolbar findings remain separately recorded. Cart tests use root text enlargement; the separate machine browser-zoom rerun is not represented as actual cart-preview zoom certification. No actual-preview performance measurement of the new assets is claimed.

## 6. Cart and Shopify accounting

**Zero** real cart POSTs, Shopify Admin reads/mutations, theme reads/writes, publications, checkout submissions, payment inputs or orders in J1. Native fixture HTTP responses are intercepted on `machine.local`/`j0.local`, with external requests aborted. No customer cart/session is touched; live cleanup is NOT APPLICABLE and there is no unresolved live cart. The explicit emulated quantity/removal case performs five fixture POSTs and ends empty; uncertain-response cases deliberately leave only disposable in-memory fixture state and reconcile it through a GET/navigation, never an automatic retry. MR16 and Saw Vice are never added.

The immutable J0 Admin capture (17:14:27.595–17:14:50.648 UTC October 20) still passes existing freshness, native successor, identity/class/reference/publication and receipt checks at this execution. Owner expiration remains **October 22, 2026, 20:26:37.102 UTC**. Fit presentation remains expired at **October 20, 17:06:42.312 UTC**; no projection refresh or authority renewal. No current native price/title write or compatibility claim is introduced. MAIN/preview inventories are **not reobserved during J1**: the latest J0 438/450 readback is historical evidence only. Any future preview batch requires fresh readback, even though this batch performed no remote writes.

## 7. Git handoff

Starting branch `dev`, HEAD `c803d44697de39c0b12b939ec9b03580d867cb03`, **741** existing working-tree entries. Current branch `epic-j/j1-native-cart-recovery`; HEAD unchanged. Index comparison: **unchanged**. **No commit SHA; push SKIPPED.** The existing J0 contract, J0 harness and native F fixture/guard prerequisites are uncommitted and absent from HEAD (exact list in `git-publication.json`). A self-contained commit would require staging unrelated foundation work outside J1; a partial dependency commit would not be independently executable. No stash/reset/discard/broad restage was used.

`j1-workspace.patch` contains exactly the twelve authorized source/test/successor/tracker deltas against the preserved starting workspace. `git apply --check --reverse` passes without applying it. `before/` and `repository-before.json` preserve original bytes and hashes. Reconcile/commit the pre-existing foundation separately, then apply/check and commit J1 on that reviewed base. This is a Git dependency blocker, not Shopify deployment approval.

## 8. Remaining work and status recommendation

Both authorized fixes are implemented and pass local functional/accessibility acceptance. No J1 functional failure remains after the unchanged zoom rerun; its original timeout stays in the execution record. Changed-preview acceptance and production release remain unverified/unauthorized. Optional J003–J007 features are untouched, and **J008 is not complete**. G003 operating/private revocation policy, G005 unrecovered historical screenshots, G006 MR16 $0/specification and generic Saw Vice $0/mapping remain open. No arbitrary zero-price restriction, free-sale approval, account requirement, freight/tax/accessory promise or K/L policy is inferred.

## 9. Exact next preview-validation batch

Separately authorize only `assets/product-form.js` and `assets/component-cart-items.css` to unpublished preview **158631198917**, after resolving the Git foundation dependency. Read fresh complete MAIN/preview identities/inventories and the two remote rollback bodies; pin reviewed J1 hashes, exact file allowance and rollback guard; deploy/read back only those files if separately approved. MAIN **158579622085** and publication remain prohibited.

Validate native Product error/success/Variant behavior and four Saw Blade Size choices, isolated positive-price cart quantities/two lines/history/removal with final server-verified empty cleanup, six viewport/text cells, dialog focus and storefront-owned axe. Keep injected transport/malformed-response faults intercepted/offline. Measure cart geometry independently from the inherited header, run existing bounded performance checks, and reconcile final remote inventories. This is a proposed next scope, not authorization granted by J1.
