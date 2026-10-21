# G-PBI-002 / G-PBI-003 — Batch G2 implementation

2026-10-16. **Repository implementation and local browser checks are complete; deployed G2 preview verification is BLOCKED. Neither PBI is formally COMPLETE.** Preview pushing stopped before execution because existing F native/default-template snapshot validators fail on the G2 Product template integration. No historical tests, receipts or bound F runtime were changed to bypass them.

All evidence below is under [g2-2026-10-16](../../qa/evidence/epic-g/g2-2026-10-16). [Architecture and operating contract](../../architecture/epic-g-product-release-contract.md).

## A. Exact file changes

| File | Change / reason |
|---|---|
| templates/product.json | Modified: native SKU block uses existing custom_liquid extension point; conditional fit block after description/before Share. Other purchase settings/blocks remain native. |
| snippets/rhino-g-product-detail.liquid | Created: governed G-role marker, translated native SKU label, exact selectable value, whole-row blank suppression. |
| snippets/rhino-g-product-fit.liquid | Created/generated: approval-bound exact identities/sets, runtime class/Variant/publication/time guards and conditional named links. |
| assets/rhino-g-product.css | Created: G-only native gallery hit geometry, SKU collapse/selectability, compact fit list using native tokens. |
| assets/rhino-g-fit.js | Created: hidden-by-default interval/parent-identity guard; expiry/pageshow/visibility suppression. No network or commerce state. |
| data/epic-g-product-release.json | Created/generated: current G1 projection, source/provenance digests, receipt/observation interval and input hash. Repository evidence, not a public asset. |
| scripts/lib/epic-g-product-release.js | Created: deterministic live G1 projection/build/verification; no new authority registry or client. |
| scripts/build-epic-g-product-release.js | Created: explicit current-read compiler entry point. |
| scripts/test-epic-g-product-release.js | Created: 27 deterministic projection/SKU/invalid-state tests. |
| scripts/validate-epic-g-products.js | Created: exact theme allowlist, protected hashes, source verification, native integration and all-G local projection coverage. |
| scripts/validate-epic-g-products-browser.js | Created: read-only baseline, explicitly labeled overlay, or actual deployed-preview mode; mobile/desktop, axe, native Variant/gallery/fit and machine checks. |
| scripts/lib/epic-g-product-browser-overlay.js | Created: test-only LiquidJS rendering over the captured live model; never deployed-render proof. |
| scripts/test-epic-g-product-runtime-overlay.js | Created: browser-only SKU response fixtures, native quantity/error/unavailable and client-expiry checks; cart POST intercepted locally. |
| scripts/deploy-epic-g-products-preview.js | Created: gated five-file preview-only push command. Not executed. No MAIN/publish branch. |
| .theme-check.yml | Modified: two precise OrphanedSnippet exceptions for JSON custom_liquid render strings; integration independently enforced. No complexity suppression. |
| package.json | Modified: build:epic-g-product-release, test:epic-g-products, validate:epic-g-products, test:epic-g-products:browser, test:epic-g-products:runtime-fixtures. |
| docs/architecture/epic-g-product-release-contract.md | Created: public/private authority boundary, native integration, expiry/caching limits and deployment contract. |
| docs/rhino-lapidary-pbi-tracker-epic-g.md | Modified: separate repository/preview/partial statuses; acceptance boxes stay open. |
| docs/project/epic-g-proposed-backlog.json | Modified: separate repository implementation and formal/deployment status for 002/003. |
| docs/project/implementation-records/g-pbi-002-003-batch-g2.md | Created: this report. |

New audit/test evidence is listed in files-manifest.json. Unrelated uncommitted work was preserved. No main-product, product-info, product-form, machine template, machine renderer, homepage, global navigation, description, price or inventory file was edited by G2.

## B. Product behavior

The ordinary Product template and shared main-product section remain. Native Variant selection, selected ID, URL, quantity, price, availability, purchase controls, errors and Related products are retained. G2 does not decide purchasing from aggregate Admin inventory. All six zero prices remain unchanged.

Blank native SKU now collapses the complete row, with no empty accessible label. Populated values are escaped, selectable and labeled using the existing locale. The unchanged Trade product-info fragment updater copies the SKU and toggles hidden after Variant changes; there is no second SKU manager. Four browser fixture transitions proved empty → A → empty → B → C. Fixture values never left the local browser response overlay.

Saw Blade's native Size options 6/8/14/18 retain Variant IDs 46484258652357 / 46484258685125 / 46484258717893 / 46484258750661 and prices $15/$25/$75/$125. Each changed the actual native selected ID, price and URL. Water Guard remained Sold out and disabled according to native storefront state. A mocked 422 preserved the native alert and button recovery; no actual cart submission occurred.

Existing native guards already suppress absent description/media; G2 adds no empty resource or fit container and invents no text/media/manual. Arbor Wrench and Automatic Feed Clamp exercise missing media/description while retaining buying. No SKU, resource or fit absence invalidates purchasing.

Gallery root cause: section-main-product.css left the native button with zero geometry while its absolute pseudo-element covered the image. A G-scoped absolute overlay gives the same native button a real hit/focus area. Browser overlays measured 358×358 mobile and 583×583 desktop on Screw-on Flat Lap, with pointer opening, Enter opening, Escape closing and focus return. Hidden elements are excluded from interactive-control assertions; no alternative gallery was introduced. Machine pages have no G marker and remain unaffected.

## C. Forward-fit architecture

Actual complete Admin read → existing E paginator/transcript binding → G1 opaque authority/current E receipt/F binding → G1 full reference reconciliation → deterministic G release JSON/Liquid projection → ordinary Product custom_liquid block → Liquid exact current public values → hidden-by-default time-guarded element.

Build/release validates definition IDs/types, reconciliation proof, provenance, private source binding and receipt lifecycle. Runtime Liquid validates source exact Product/class/handle/Variants, field types, complete reference count/set, and every target's exact ID/class/handle/Variants before emitting anything. It never narrows a changed list to the surviving subset. Publication suppression on a technically valid unchanged set is intentionally separate. Links sort by exact Product ID and use current escaped native names/URLs. Included/optional/recommended fields and native Related products never grant fit. JSON-LD, metadata, breadcrumbs, badges, search and analytics were not modified.

## D. Eligibility and current reconciliation

Fresh authenticated Admin capture **19:40:27.437–19:40:51.343 UTC**, complete 13 Product and 13 Variant pages. See admin-read.json, connector-reads.json and foundation-report.json/.md.

- 122 Products / 125 Variants; G 111 / 114. Classes: 11 machine, 54 replacement_part, 39 consumable, 18 accessory.
- 39 approved values / 40 directed edges; 31 customer-eligible edges on 30 Products; nine approved edges target unpublished JadeMaster.
- 72 G Products have no approved fit. Two held Saw Vice relationships remain absent/ineligible.
- 114 blank G Variant SKUs, 24 G Products without media, five without descriptions, six zero-price Variants. Optional item attributes/resources remain absent and are not invented.
- Zero discovery-baseline differences, reference drift or publication drift.

| Case | Expected current eligible links | Actual local projection / browser overlay | Actual remote G2 |
|---|---|---|---|
| Automatic Feed Clamp, Product 8905779871941 | SawMaster 18 and SawMaster 24 | Exactly two exact destinations at both widths | Not deployed; zero new G2 links |
| Trim Saw 6 | EM-1 | One exact link | Not deployed |
| JadeMaster-only belt guard | None; approval remains valid data | No heading/link | Not deployed |
| Nine JadeMaster edges | Approved, data eligible, unpublished, customer ineligible | All withheld in all-G local coverage | Not deployed |
| Saw Vice Plate Set / two held edges | None | No fit claim | Not deployed |
| Other 72 without fit | No compatibility claim; ordinary purchasing | All 72 covered by deterministic projection validation; representative browser pages retain buying | Not deployed |

local-projection-coverage.json checks all **111 G Products** against G1's expected exact destination sets. This is LiquidJS validation, not evidence that Shopify executed the new snippet.

## E. Freshness and revocation

Historical F binding remains **b90bf2089788e77c04fbdd5bd1766bc4d03cfb9e358179884a47b74095be949b**. E receipt expiry remains **2026-10-22T20:26:37.102Z**. No receipt was renewed, replaced or rewritten.

The generated presentation lease ends **2026-10-16T20:40:27.437Z**, one hour after the actual read capture, bounded additionally by G1/receipt expiry. Recompiling the same observation cannot extend it. A later release needs a new actual read and still-valid approval. Current artifact expiry is intentional; it must not be pushed later without revalidation.

Source validation rejects stale/revoked/expired approvals and mismatched complete lists. Release verification reproduces the artifact and verifies its input/source hashes. The unexecuted deployment wrapper requires freshness, current source, reviewed hashes, passing gates and an existing unpublished target. Liquid checks time and current native values at uncached render. Client time guard suppresses cached/open markup at expiry and page/visibility return without changing commerce; a browser clock fixture demonstrated this.

**PARTIAL:** private revocation is not visible to Liquid. Shopify caching, browser clock error and suspended scripts prevent guaranteed immediate expiry/revocation suppression. No-JavaScript leaves fit hidden. The lease reduces exposure under normal clocks; it does not prove absolute suppression. Sustained production delivery needs an approved revalidation/operating cadence or other policy; no network service/proxy was added. No production release is authorized.

## F. Tests, exact commands and exits

Detailed stdout/stderr and exits are preserved in validation-commands.json, supplemental-validation-commands.json, final-validation-commands.json and final-projection-validation.json. No historical failure was relabeled as passed.

| Command | Final exit | Result |
|---|---:|---|
| npm.cmd run test:epic-g-foundation | 0 | 43 pass / 0 fail |
| npm.cmd run validate:epic-g-foundation -- --read docs/qa/evidence/epic-g/g2-2026-10-16/admin-read.json --output docs/qa/evidence/epic-g/g2-2026-10-16/foundation-report.json | 0 | Actual current Admin reconciliation, complete pagination |
| node scripts/build-epic-g-product-release.js --read docs/qa/evidence/epic-g/g2-2026-10-16/admin-read.json | 0 | 39 approved sources / 31 customer edges; no mutation |
| npm.cmd run test:epic-g-products -- --output docs/qa/evidence/epic-g/g2-2026-10-16/unit-tests.json | 0 | 27 pass / 0 fail |
| npm.cmd run validate:epic-g-products | 0 | 111 local projections, protected source/allowlist checks |
| npm.cmd run validate:registers | 0 | Register validation |
| npm.cmd run validate:metafields | 0 | Metafield contract validation |
| npm.cmd run validate:product-templates | 0 | Native/default architecture |
| npm.cmd run validate:product-purchase | 0 | Native purchase architecture |
| npm.cmd run validate:theme-architecture | 0 | Navigation/tokens/CSS/JS/sections |
| npm.cmd run theme:check | 0 | Zero offenses after focused fixes |
| npm.cmd run test:epic-f-consumer | 0 | 22 cases |
| npm.cmd run validate:epic-f-consumer | 0 | Current consumer valid |
| npm.cmd run test:epic-f-facts | 0 | 67 checks |
| npm.cmd run test:epic-f-context-delivery | 0 | 88 checks |
| npm.cmd run test:epic-f-media | 0 | 38 checks |
| npm.cmd run test:epic-f-support-resources | 0 | 177 checks |
| node scripts/test-epic-e-owner-response-adapter.js | 0 | 32 checks |
| node scripts/test-epic-f-final-owner-delta.js | 0 | 13 checks |
| node scripts/test-epic-f-final-owner-release.js | 0 | Nine checks; current release/binding retained |
| npm.cmd run test:epic-e-admin-audit | 0 | Existing paginator/negative cases |
| npm.cmd run test:epic-e-pbi-009 | 0 | Existing custom-data contracts |
| npm.cmd exec playwright test -- --config=playwright.machine.config.js | 0 | 58 pass / 0 fail, local machine fixtures |
| npm.cmd exec playwright test -- --config=playwright.machine-gallery.config.js | 0 | 32 pass / 0 fail, local gallery fixtures |
| node scripts/validate-epic-g-products-browser.js --baseline | 0 | 34 actual unchanged-preview page cells |
| node scripts/validate-epic-g-products-browser.js --overlay | 0 | 34 browser overlay/machine cells; not deployed G2 proof |
| node scripts/validate-epic-g-products-browser.js --overlay --g-only | 0 | Final 18 G overlay cells; 18 axe analyses, zero violations |
| node scripts/test-epic-g-product-runtime-overlay.js | 0 | Seven browser-only fixture checks; one intercepted local cart POST |
| node node_modules/@playwright/test/cli.js test tests/accessibility.spec.js --project=desktop-chromium --project=mobile-chromium --grep=product | 0 | Two existing actual-preview Product axe tests; baseline theme |
| git diff --check -- .theme-check.yml templates/product.json package.json | 0 | Scoped whitespace validation |

Existing validators still failing, preserved unmodified:

| Command | Exit | Exact issue / disposition |
|---|---:|---|
| npm.cmd run validate:epic-f-machine | 1 | Native baseline hash changed: templates/product.json. This is the authorized G2 integration, but the legacy F check does not support it; preview STOP. |
| npm.cmd run validate:epic-f-context-delivery | 1 | F5 preservation hash pins the same default template; also historical zero-release assumptions. Preview STOP. |
| npm.cmd run validate:epic-f-facts | 1 | Expects historical zero-fact projection, omitting the already approved owner-facts renderer. Current owner-release tests pass. |
| npm.cmd run validate:epic-f-gallery | 1 | Expects historical zero-media grants rather than current six governed grants. Bound renderer is unchanged. |
| npm.cmd run validate:epic-f-support-resources | 1 | Historical preservation hashes for default template and already activated F projections. Current support tests pass. |
| npm.cmd run validate:rhino-style-contract | 1 | Existing rgba(var(--color-foreground)) in untouched rhino-custom.css; new G CSS has no literal colors. |

The first Theme Check run returned 1 for two JSON-string render calls marked orphaned and generated complexity 680. The compiler was simplified into data assignments plus one generic validator (no complexity suppression); precise trace exceptions cover the two JSON render calls. Final Theme Check exits 0. A refactoring intermediate unit run had 6 passes/11 failures due trailing whitespace; output trimming was corrected, final 27/0.

Bundled Shopify skill validation was attempted with `node C:/Users/dajem/.codex/plugins/cache/openai-curated-remote/shopify/4.1.2/skills/shopify/scripts/validate.mjs --api liquid --help`, exit 1: missing package @shopify/theme-check-common. It could not load; not counted as successful validation. The installed Shopify CLI Theme Check did run successfully. No system policy or dependency was silently changed.

First generic Product accessibility launcher (`npm.cmd exec playwright test -- tests/accessibility.spec.js --project=desktop-chromium --project=mobile-chromium --grep "product has"`) returned 1/no tests found due shell argument handling. The exact structured Node retry above ran two tests and passed. Initial browser response-overlays using route.fetch received 429; a later locator was ambiguous. Both diagnostic failures are retained in runtime-overlay-api-fetch-attempt.json / runtime-overlay-locator-attempt.json. The corrected browser-native fetch wrapper and main-scoped locators passed; no live Product data was changed.

## G. Browser evidence

Existing preview: **158631198917**, UNPUBLISHED, Rhino Lapidary - Preview. Example [read-only preview URL](https://sz5dnk-nf.myshopify.com/products/automatic-feed-clamp?preview_theme_id=158631198917). **This URL does not contain G2 implementation.**

baseline-browser.json: nine G pages plus eight current machines at 390 and 1440 pixels, 34/34 pass. local-overlay-browser-with-machines.json: 34/34 overlay/machine cells. Final local-overlay-browser.json: nine G pages × two widths = 18/18; all 18 main-content axe analyses have zero violations. Existing whole-page serious/critical Product axe tests passed at desktop/mobile on the unchanged preview. Tests supplement axe with keyboard/focus, pointer media interaction, exact fit names/headings, Variant IDs/prices/URL, quantity, sold-out/unavailable and 200% text assertions.

At 200% text the header still reaches **558 px** on 390 px viewport, with no horizontal overflow. This severe existing header expansion is recorded, not fixed or declared globally accessible. G2 does not reconstruct global navigation. Existing machine suites additionally cover actual 200% Chromium zoom.

Screenshots are named local-overlay-automatic-feed-clamp-390.png, local-overlay-screw-on-flat-lap-390.png and local-overlay-water-guard-390.png. They show locally injected fragments over read-only preview HTML; they are not deployed previews. Actual G2 Shopify Liquid/custom_liquid setting execution, all-31-link deployed coverage and deployed accessibility remain BLOCKED.

## H. Shopify and theme operations

shopify-operations.json records **37 actual read-only Admin data queries**: 13 Product pages, 13 Variant pages, one theme identity query, two targeted theme-body queries, four full-inventory queries before and four after. Five schema reads, one docs search and four GraphQL helper calls make **47 Shopify connector invocations**. Validation helpers reported skipped; successful query execution validated operations. Existing authenticated connector/E paginator was reused. No second Shopify client was introduced.

**Admin mutations 0; Product/Variant/metafield/collection/Page/price/inventory/SKU/publication writes 0; Product/Variant creation 0. Theme pushes 0; theme settings writes 0; publications 0.** The push wrapper was never executed. One cart POST in the browser fixture was fulfilled locally with a synthetic 422, actual cart writes 0. Browser storefront/CDN reads and existing password authentication are separate; their per-resource HTTP totals were not instrumented and are not claimed complete.

The only planned theme deployment contains the five files in repository-validation.json, each SHA256 recorded. No deployed-file manifest is claimed. A later push requires fresh target/inventory/source evidence and passing/reconciled gates; no wholesale sync or MAIN authorization is implied.

## I. Protected state

repository-before.json / repository-after.json and protected-state.json show **105 protected source paths unchanged**; the only three allowed changes in that protected inventory are package.json and the two G tracker/backlog files. **442 existing unrelated theme files are byte-identical**; only existing templates/product.json changed and four G theme files were added. Existing F bound runtime, facts/specifications/media/BOM/reverse renderer, G1 code, receipts, machine assignments/source template and purchase scripts remain exact.

Remote full inventories before/after show **all 438 MAIN files unchanged** and **all 442 preview files unchanged**, with roles preserved. Settings and homepage hashes remain different between themes as previously observed; no synchronization occurred. Eight machine pages retain exact specification/contents/reverse-card counts and zero G markers at both widths. Historical F test evidence remains bound and unchanged after related suites. F-PBI-015B and F-PBI-018B were not reopened.

## J. Recommended PBI status

| PBI | Repository implemented | Local/browser fixtures | G2 preview verified | Production deployed / customer visible | Formally complete |
|---|---|---|---|---|---|
| G-PBI-002 | Yes | Passed | **BLOCKED**, template preservation guards | No / No | **No** |
| G-PBI-003 | Yes | Passed; all 111 local projections reconcile | **BLOCKED** | No / No | **No; private revocation/absolute expiry criterion PARTIAL** |

Acceptance checkboxes stay open because fixture/overlay success is not deployed Shopify proof. Current remote G2 links are zero. No business approval is needed for native blank-safe behavior or the existing approved fit set; the blockers are validation/release architecture, not a new owner worksheet.

## K. Remaining work and G3 handoff

1. Resolve the legacy F default-template snapshot assertions for the authorized G2 delta while preserving native commerce and machine invariants. Current-owner assertions must continue to verify the existing bound release; do not replace receipts or weaken tests. This task stopped the affected deployment rather than reinterpreting a failed gate as passed.
2. After that resolution, capture a fresh actual Admin read and preview inventory, regenerate the observation-bound lease, verify the five file hashes, deploy only to 158631198917, read back bodies and the complete inventory, then run the browser harness without --overlay. Prove SKU/media/empty content and all current eligible links through actual Shopify execution. Do not deploy to MAIN.
3. Explicitly resolve the operating policy for sustained fit revalidation and the acceptance limit for caching/private revocation. Until then G-PBI-003's immediate suppression criterion stays PARTIAL. At source receipt expiry withhold fit; no renewal by report generation.
4. G3 remains **G-PBI-004/005**: reuse the existing F reverse projection for bounded machine-context paths, then a small existing-route role/reorder entry. No G3 implementation occurred. G-PBI-006 commercial work remains separate; missing SKUs/attributes, JadeMaster publication and Saw Vice split do not block safe ordinary buying.

No H/I/J/K/L/M/N/O implementation, owner worksheet, catalog creation or production deployment was performed.
