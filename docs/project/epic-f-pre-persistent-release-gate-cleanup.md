# Epic F pre-persistent release gate cleanup

The cleanup passed its authorized repository and nonpersistent Shopify gates. This is an implementation record, not a new PBI or release approval. Theme Check exits 0, the F1–F8 aggregate passes, the corrected preview passed all 32 shell cells, storefront-owned axe is clean, and observed provider parity is verified without harness interference. Full-preview axe and keyboard findings remain blocked by Shopify's injected toolbar. Persistent Shopify mutation count is **0**.

The [sanitized execution evidence](../qa/evidence/epic-f/pre-persistent-release-gate-cleanup.json) retains every corrected route/width cell, both axe surfaces, keyboard observations, request inventory, errors, the initial ownership probe, local regressions, source hashes and fresh persistence snapshots. The [explicit source binding](../qa/evidence/epic-f/release-gate-cleanup-source-binding.json) records the approved complexity extraction and new preview dependencies. Previous implementation records, F1–F8 manifests, baseline fixtures, rollout/readiness data and the original shell preparation remain immutable historical evidence.

## Network guard and runner

The previous guard treated every `/checkout` or `/checkouts` path as a transaction. That wrongly blocked 114 passive native GET requests for `/checkouts/internal/preloads.js`. The corrected developer-only guard classifies HTTP method, resource type, navigation status and preload/prefetch metadata before evaluating purpose. Native static GET resources under `/checkouts/internal/` are allowed when passive. Metadata does not bypass prohibitions.

Cart mutations, Contact submission, checkout navigation/actions and order submissions remain blocked. The guard also blocks unrequested PDF/document/archive downloads, governed resource paths, eager video-provider requests and unexpected F analytics requests or payloads. Explicit downloads are cancelled. Passive provider resources and existing native analytics remain classified separately. A transient browser observer records unexpected F publish/domain-event names; it forwards observed native publisher calls unchanged and stores no request bodies or customer payloads. No production analytics instrumentation or configuration was added.

Deterministic guard tests: **43 passed / 0 failed** — 18 allowed, 25 blocked. Coverage includes CSS/script/font/image preload, native assets, passive payment resources, ordinary assets, prefetch metadata, transactions, documents, video providers, F analytics publish/request/payload, encoded payloads and alternate Contact actions. Secret-redaction, one-session cap, target exclusion, exact payload, fresh persistence hooks, closed-stdin lifecycle and stdout/stderr parsing tests passed.

The reusable runner remains `scripts/run-epic-f-nonpersistent-shopify-preview.js`. Its `--cleanup` mode performs both accessibility scans. `--source-binding=docs/qa/evidence/epic-f/release-gate-cleanup-source-binding.json` explicitly opts into the reviewed source delta; the historical payload mode rejects changed sources. CLI success stays in memory and is handed directly to Playwright. No signed URL is used in arguments, environment variables, artifacts, traces, screenshots or reports.

## Complexity refactors and source boundary

Each refactor extracts an existing cohesive presentation block with explicit inputs. No customer copy, factual authority, eligibility, purchase/cart/filter behavior, native payment terms or accessibility semantics were changed. Main-product's machine routing, native form, pickup, projections, JSON-LD and schema remain intact. Card links, image/media, pricing, badges and disclosures remain intact. Facets taxonomy, filtering, active values and sort behavior remain intact.

| Original file | Extraction | Complexity before | After | New snippet complexity |
|---|---|---:|---:|---:|
| `sections/main-product.liquid` | `snippets/product-inventory.liquid` | 129 | 120 | 10 |
| `snippets/card-product.liquid` | `snippets/card-product-placeholder.liquid` | 122 | 112 | 11 |
| `snippets/facets.liquid` | `snippets/facets-mobile.liquid` | 136 | 94 | 43 |

Inventory inputs: Product, block and section. Placeholder-card inputs: ratio, height/image-shape flags, placeholder image/vendor/price state; native global settings remain available. Mobile-facets inputs: results, filtering/sorting flags, filter type, sort value, results URL, presentation and section.

| Protected source | Previous SHA256 | Post-cleanup SHA256 |
|---|---|---|
| `sections/main-product.liquid` | `49af6088a45eba18dcf25d0fd0cccc79bbab4d64ee7a4c1e2e2d80f6d867fa3d` | `c482aa06d6705589587e47b4d354cc0637e8de1cc77e652c7c88510563111de3` |
| `snippets/card-product.liquid` | `f2e5707b95ed27dca38bda8e94c01280efd860e2681ed1b094529be47ee954e9` | `f2f0fe4c960d6f19c9de87767614fede2b745450f90e9fc6624685f29b61d877` |
| `snippets/facets.liquid` | `10ca3c8b139b5d1b39b00ded57a3b42e00368356a0865f13f7f82d85e97a1de9` | `e17207ee60dcf8331ce74e60d7ec8f89380cb9a10c7537a650b8b66f5e0d8cb6` |

The source binding also contains the three new snippet hashes. Replacing each exact render statement with its extracted body reconstructs the previous raw source hash. The extraction guard permits only these three fixed paths/render contracts, validates comment-only prefixes and both current source/snippet hashes, and rejects other drift. Twelve negative checks and 264 before/after Liquid comparisons passed: 24 inventory states, 24 real/placeholder card states and 216 collection/search facets states.

F7/F8 validators accept this exact proof only with `RHINO_EPIC_F_CLEANUP_BINDING=docs/qa/evidence/epic-f/release-gate-cleanup-source-binding.json`. Historical pins are unchanged. The current byte changes are recorded explicitly; semantic-equivalence validation does not imply byte identity. Deployment preparation must account for the new dependencies during any separately authorized future release review.

Two trailing spaces at tracker lines 697 and 781 were removed. Tracker statuses were not changed. Other edits are developer tooling, regression tests and this new evidence; production CSS/JS and F projections were not refactored.

## Local/static regression

| Command/check | Result |
|---|---|
| `npm run validate:epic-f-batch-f8` with the explicit cleanup binding | exit 0; F1–F8 required checks pass |
| Machine shell / native purchase / actual local zoom Playwright | 58 passed |
| Gallery Playwright | 32 passed |
| Facts Playwright | 27 passed |
| Context/delivery Playwright | 32 passed |
| Support/resources Playwright | 29 passed |
| `node scripts/test-epic-f-release-cleanup-extractions.js` | exit 0; 264 comparisons and 12 drift checks |
| `node scripts/test-epic-f-cleanup-facets-browser.js` | exit 0; six mobile/desktop cells |
| `node scripts/test-epic-f-preview-network-guard.js` | exit 0; 43 cases |
| `node scripts/test-epic-f-preview-accessibility-ownership.js` | exit 0; six ownership/retention cases |
| `node scripts/test-epic-f-nonpersistent-shopify-preview.js` | exit 0 |
| Filter spec / search discovery | exit 0 |
| Hardcoded strings / registers/schemas / affected contracts | exit 0 within aggregate |
| Explicit CLI 4.8.3 `theme check --path . --fail-level warning --output json` | exit 0; output `[]` |
| `git diff --check` | exit 0 |

The facets browser test uses actual repository `global.js`/`facets.js` with local GET response fixtures, covering vertical/horizontal/drawer layouts, mobile and desktop Product Type filtering and Recently Added sorting. Early fixture-harness failures are retained in the initial local execution logs; the corrected fixture and final local gate passed. Browser suites have zero unexpected, skipped or flaky tests. Existing fixture performance regressions ran with unchanged budgets; F-PBI-015B release certification did not run.

Theme Check's maximum remains **120**; `.theme-check.yml` is unchanged. No warning suppression or threshold increase was introduced. The former three-warning static-quality blocker is cleared by this explicit repository invocation.

## One nonpersistent preview and transport fidelity

Exactly **one additional preview session** was created after local gates passed. Target: `158631198917`, Rhino Lapidary - Preview, **UNPUBLISHED**, store `sz5dnk-nf.myshopify.com`. Production `158579622085` was excluded. Sanitized command: `shopify theme preview --store=sz5dnk-nf.myshopify.com --theme=158631198917 --overrides=<ignored-run-directory>/overrides.json --json`; CLI **4.8.3**, CI auto-upgrade suppression and instrumentation opt-out.

Creation UTC: **2026-10-02T21:08:19.719Z–2026-10-02T21:08:24.759Z**. HTTP **200**, CLI exit **0**. Request ID: **994118d8-b3f6-46aa-88c2-ee9c6f1deea8-1790975302**. Preview identifier SHA256: **ed2bd721f1f84142f21ba2b8b89286f8dab0d2f277b4c500fc2b181906af5e74**. Signed URL retained only in process memory and discarded after testing.

The historical payload SHA remains `e7596e5e04423ca3b535a1d4fda123aa32be53859384a03fccb475bc62370d80`. Explicitly rebound preview payload: **1ea68738c4277ac6724bccd44c95ec1926325827cbe9eb35c45abd1529954757**, **32 source entries**. The accepted complement gains the three extracted snippets and the refactored facets source. The same layout load-site transform and virtual inline CSS snippet remain; no asset override was included or transport experiment performed. Temporary payloads stay under ignored `test-results`.

CSS authority is unchanged: `assets/rhino-custom.css`, SHA256 **32f44d332f5b1d51b95213292c54d6e5c17751ebf4e79878eba4e2c17ce5f961**. Hazard scan remains safe. The exact raw source appears once inside the wrapper. The sole layout statement at line 297, `{{ 'rhino-custom.css' | asset_url | stylesheet_tag }}`, is replaced virtually with the preview snippet between base.css and component-cart-items.css.

Local external/inline canonical CSSOM SHA and every corrected Shopify cell match **f96d742b575e8ff4e7917ca3106678ce2c23f9b58f5b6f65161be4d3b55d8b49**. LF-normalized text also matches. All 32 cells have one inline Rhino stylesheet, correct cascade position and zero stale persistent Rhino CSS requests. Transport remains **PREVIEW_HARNESS_ONLY**; production CSS architecture is unchanged.

The first ownership probe stopped because an additional version-sensitive toolbar CSS-class requirement matched no classes. Its exact Shopify CDN document signature was valid. While the URL was still in the orchestrator's memory, a local debugger callback loaded the corrected ownership classifier and resumed Playwright inside that same process. The initial probe and this recovery remain in evidence; additional preview creates were **0**. The current reusable classifier passes version-independent local tests.

## Shopify rendering, provider and network parity

All eight proposed Products passed at **320, 390, 768 and 1440 px: 32/32**. BeadMaster, EM-1, LapMaster 12/18, SawMaster 18/24, ShapeMaster and TrimMaster rendered the deterministic machine-shell contract using `view=machine`. JadeMaster, SawMaster 36 and TumbleMaster were excluded. Rendering is not assignment eligibility.

Native title/current Variant/price/quantity and purchase display passed. LapMaster 12/18 have enabled Add to cart displays; the six others have disabled Sold out displays. Quantity changed 1→2→1 without cart submission. Neutral Contact remains `/pages/contact` and was focused only. Governed factual/media modules and technical/resource fallbacks remain suppressed, including hidden populated DOM and empty factual wrappers. Native Product/Offer JSON-LD containment passed on all 32 cells.

**providerParity = verified**, scoped to observed native payment-terms rendering, synchronized current Variant and passive provider resource behavior without harness interference. Terms rendered/reflowed on all eight. Provider loader/client scripts, native preload scripts, pay-session/hop and native analytics paths are inventoried. All **64** `/checkouts/internal/preloads.js` GETs were allowed; **0** preload failures or HTTP errors, **0** harness-blocked requests and **0** unexpected/prohibited requests were observed across 4,408 guard observations.

There were zero transactional requests, governed document auto-fetches, eager video-provider requests, explicit downloads and F analytics requests/publish/domain events. The transient publish observer installed on all 32 pages. Request bodies were inspected for prohibited signatures in memory and never retained. Existing native analytics remain separately classified.

Across the corrected 32 cells: **66 console errors**, **0 page errors**, **0 Liquid errors**, **97 HTTP-error observations**, **161 failed-request observations**. These retain existing preview app/custom-pixel 404s, native accelerated-checkout 404s, a provider pay-hop 403/framing failure and native analytics/page-close aborts. One console 403 has an opaque source and remains unclassified. No Rhino-owned console/page regression was identified. Provider endpoint errors remain visible; no payment/checkout action or configuration change was used to test them.

## Accessibility ownership

The only excluded element in the merchant-scope axe scan is **`iframe#PBarNextFrame`**, validated uniquely as an IFRAME loading host **cdn.shopify.com**, document **/shopifycloud/preview-bar/index.html**. This is Shopify-injected preview tooling; no runtime theme source defines its ID. The exact source signature passed on every corrected cell. UI class names are supplemental because Shopify can version them.

Rhino and Trade content, global header/footer, storefront app frames/blocks and participating payment/provider markup remain inside the merchant scope. No axe rule ID was excluded. Local negative tests confirm that unnamed merchant buttons, provider shadow-DOM buttons and app iframes still produce findings, while an iframe with the wrong tool-document source fails ownership validation.

| Surface, across 32 scans | Critical | Serious | Moderate | Minor | Result |
|---|---:|---:|---:|---:|---|
| Full preview document | 16 | 48 | 16 | 0 | blocked_by_shopify_preview_toolbar |
| Merchant storefront ownership scope | 0 | 0 | 0 | 0 | passed |

Counts are repeated rule instances across pages. Mobile full-preview scans each have two serious findings; desktop scans each have one critical, one serious and one moderate finding. Every full-preview violation targets the preview iframe/content. Their node/rule details remain in evidence and are not erased or relabeled clean.

Keyboard/focus checks: **16 runs**, one mobile and one desktop per Product. Storefront Product order and indicators passed with **0** storefront failures. Toolbar iframe focus failures remain separately recorded: **56** repeated observations, 24 mobile and 32 desktop. Purchase, Contact and provider transaction controls were not activated.

## Persistence and remaining decisions

Fresh before/post-create/after-initial-probe/after-all-browser reads compare all **409 persistent file records** and all **11 Product records** exactly. Product suffixes, status, publications and rhino metafields are unchanged. The preview theme remains UNPUBLISHED; machine template and preview CSS snippet remain persistently absent. Persistent CSS MD5 remains **586746f7713bfcbb10d4724361f3a6ce**; persistent theme.liquid MD5 remains **057631df790907cc64d7cdcc06c6f7d5**. Theme updatedAt remains **2026-08-27T18:04:28Z**, independently of virtual session creation time. Playwright, debugger clients and the orchestrator closed; memory-only signed credentials were discarded.

**F-DEC-001 remains Open.** Option A retains existing native provider-owned payment_terms: eight-Product Shopify rendering/Variant synchronization and responsive evidence passed; the previous 200% text/actual-zoom evidence remains historical evidence, with unchanged active shell/CSS behavior. No Rhino financing copy or payment configuration mutation was introduced. Option A has the smaller implementation delta and requires no additional payment implementation. Option B requires a separately authorized F-PBI-013 code change; there is no existing simple suppression toggle. The Product Owner has not approved either option through this cleanup.

**F-PBI-014B remains Partial.** Local fixture accessibility passed; Shopify-rendered unassigned shell storefront-owned axe and keyboard checks passed. Full-preview accessibility remains blocked by the Shopify toolbar. Assigned-template/release-state parity remains outstanding. Native pickup was unavailable/hidden for every current Variant, so available pickup/drawer behavior remains untested. No alternate Variant options existed, so real alternate-Variant transitions remain untested. Future activated governed modules and their release journeys require their separate evidence/authorizations.

F-PBI-015B **Deferred**; F-PBI-017B **Blocked/not authorized**; F-PBI-018B **Not begun**; E-MUT-020 and E-MUT-021 **Not executed**. Product assignment, theme push/dev/share, publication, cart/Contact/checkout/order actions and analytics configuration: **No**. Persistent Shopify mutation: **0**. Live release remains unauthorized. This task stops after cleanup.
