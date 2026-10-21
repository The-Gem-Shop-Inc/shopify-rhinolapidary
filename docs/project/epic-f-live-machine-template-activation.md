# Epic F live machine-template activation — 2026-10-05

The existing MAIN theme now contains the bounded machine-shell implementation. Exactly eight approved F7 Products have `templateSuffix = machine`; all 16 normal-route checks at 390 px and 1440 px passed. The three exclusions remain unassigned. This completes F-PBI-017B at the explicitly authorized live-development scope; final release signoff remains outstanding.

## Authority and identities

Authorization mode: `delegated_development_override`. The explicit Product Owner task authorizes the exact current MAIN dependency closure, eight suffix-only writes, verification, and bounded automatic rollback. It does not globally replace independent approvals. Historical F7/F8 false-GO states and E-MUT/Preview records were preserved.

- MAIN: **158579622085**, **shopify-rhinolapidary/main**, **MAIN**; fresh complete inventory before deployment: 406 files; final: 422.
- Preview: **158631198917**, **Rhino Lapidary - Preview**, **UNPUBLISHED**; 426 file records unchanged.
- Repository commit: `c803d44697de39c0b12b939ec9b03580d867cb03`; working source hashes are individually bound, rather than inferred from this commit.
- Deployment canonical plan SHA256: `54b2acd1a0b3cc911066c05e58657ca77c2ff2fb4809bb20c70d78a9000ecf42`.
- Assignment canonical authorization SHA256: `6373ff69839c2531a1495abbfc36a13aedae65e952fd64d70c26db18a513e363`.
- Historical F7 plan identity: `F-017A-machine-template-v1`; embedded plan hash: `e69138cf06cdab34f7560058d156dfe0f4f042cc94d395582dd55fde1cfd7146`.
- Exact fresh protected Product snapshots and per-row immediate before-reads are bound in [assignment-authorization.json](../qa/evidence/epic-f/live-activation-2026-10-05/assignment-authorization.json).

Neither theme was published. The existing MAIN was selectively modified in place. The Preview theme, payment configuration, storefront password configuration, definitions, Product classification and factual values were not changed. No cart, Contact, checkout or order action was submitted.

## Dependency closure and shared-file review

The trace starts at `templates/product.machine.json`, follows main-product and its route/projection/media/description/structured-data dependencies, and includes the changed card/cart/search/social surfaces needed to prevent governed machine facts or media escaping through shared fallback paths. Six nil-projection module snippets must exist because their render calls are unconditional even when no factual markup is granted. Inventory and card-placeholder extractions preserve default Product behavior.

28 files were deployed: 12 existing shared files updated and 16 files created. Every changed path has an exact rollback body or a bounded task-created deletion instruction.

| File | Operation | Machine/runtime reason | Intended source SHA256 |
| --- | --- | --- | --- |
| `assets/rhino-custom.css` | updated | The reviewed CSS adds machine-scoped reflow and Contact rules; existing global rules are unchanged. | `32f44d332f5b1d51b95213292c54d6e5c17751ebf4e79878eba4e2c17ce5f961` |
| `layout/theme.liquid` | updated | Classification-aware Product SEO-description containment at the existing head load site; real CSS link retained. | `87086adef642d447d2cba82186641e93460d815549375bf608da035534cec5af` |
| `locales/en.default.json` | updated | Native neutral machine Contact translation; additive future module labels only, all old values preserved. | `1c9b35a463badc81f9b84c0e690b70c644c80f974338138875df761b281e792f` |
| `locales/en.default.schema.json` | updated | Shared main-product machine_contact schema label. Additional homepage schema labels are additive and inactive on existing sections. | `8009bbec50222d4d8e9bb160f03e53ca00fd15e8be5b938070f1a8c52f7bfdd9` |
| `sections/cart-notification-product.liquid` | updated | Prevent machine-image fallback in the native purchase notification; all non-machine image behavior unchanged. | `7e775b942acae3ea9b6f76dce09fd7881dcf687271c8e365aece510fb41e652f` |
| `sections/main-cart-items.liquid` | updated | Prevent machine-image fallback in native cart lines; non-machine cart behavior unchanged. | `d043f0d8ddc3148076866e19bae02efd52db7dbf7ee1ca7f19ea2cf832850cc6` |
| `sections/main-product.liquid` | updated | Assigned machine section with native form, quantity, purchase, pickup, payment_terms, neutral Contact, and zero-grant projections; default native blocks preserved. | `c482aa06d6705589587e47b4d354cc0637e8de1cc77e652c7c88510563111de3` |
| `sections/predictive-search.liquid` | updated | Prevent governed machine-media fallback in predictive Product results; other results preserved. | `1f05232069cb26cdc28b4736ac6e681b863865f30c97740503231be030658575` |
| `snippets/card-product.liquid` | updated | Prevent machine-card and quick-add media fallback across collection/search surfaces; non-machine cards preserved. | `f2f0fe4c960d6f19c9de87767614fede2b745450f90e9fc6624685f29b61d877` |
| `snippets/cart-drawer.liquid` | updated | Prevent machine cart-line media fallback; non-machine drawer behavior preserved. | `c1091354befbffa1bc0ed114d978377c436b8dc47e8e9eb348a843845d619c9a` |
| `snippets/meta-tags.liquid` | updated | Prevent technical description and governed image claims in Product social metadata. | `ebe74785f747771721b4ab7678f78a1a6e45be3a6c5f600bf04612c01cc2ca52` |
| `snippets/product-media-modal.liquid` | updated | main-product invokes this unconditionally: zero-grant machines must not retain a hidden populated native media modal. | `97744048cb27bb56e323eaeee7307901331cb9f90c145d24cf2cc3861c3565ef` |
| `snippets/rhino-machine-contents.liquid` | created | Directly invoked nil-projection module: file must exist even though it outputs no customer factual markup. | `daefb3ad5757bf38cbaa0a372a42e8ef0b2283c716387f286c9a9f831d0802fd` |
| `snippets/rhino-machine-contextual.liquid` | created | Directly invoked nil-projection module: file must exist even though it outputs no customer factual markup. | `da07184dd3b1b621d2980b50c2e2aed9d40ce6ec75414d31eb48d0566437fe0b` |
| `snippets/rhino-machine-delivery.liquid` | created | Directly invoked nil-projection module: file must exist even though it outputs no customer factual markup. | `1703a28753259ec81943fabafe89d883cf9ef975f12db9c337f66bc926a18ff9` |
| `snippets/rhino-machine-resources.liquid` | created | Directly invoked nil-projection module: file must exist even though it outputs no customer factual markup. | `0726da0a37eb47db309a4d3f376554b1c3ddf120091393933f1ab244960c7018` |
| `snippets/rhino-machine-specifications.liquid` | created | Directly invoked nil-projection module: file must exist even though it outputs no customer factual markup. | `39ed3f9e1968db38d373ebf56c6c96b0ba2c1cefc2a16128a41dcbb0a42f4e74` |
| `snippets/rhino-machine-support.liquid` | created | Directly invoked nil-projection module: file must exist even though it outputs no customer factual markup. | `9226eeee5163438988478d985782a25d6facc8354b4cc67a376009989fe24b1f` |
| `snippets/rhino-product-consumer-route.liquid` | created | Exact governed Product identity plus live product_class route; classification never grants facts. | `62fbf208573b7800de0b30046940eaa1e7a445acb77aa42b32c7e558ee7c9bbd` |
| `snippets/rhino-product-context-delivery-projection.liquid` | created | Direct machine section projection dependency; generated nil projection grants zero facts. | `273479d996cb7f3dd3112a575734781750964c6e0bce936e4decf816170cf915` |
| `snippets/rhino-product-description.liquid` | created | Retain legacy descriptions only for the three approved non-machine classes. | `fd7af1f35621fd0c393f528cc40eb1c7ff16cfe81517525c2446363ef21b7d0c` |
| `snippets/rhino-product-fact-projection.liquid` | created | Direct machine section projection dependency; generated nil projection grants zero facts. | `502dbe69a03afa1a248b5eb033d2502855670d22975bc9aa4acccf4949c34431` |
| `snippets/rhino-product-media-eligibility.liquid` | created | No real machine media grants; used by the section and modal to suppress native fallback. | `4cd2ad166af64c8083b27a5531c52d63eb9a418bba435731e94fd868dec16056` |
| `snippets/rhino-product-structured-data.liquid` | created | Product/Offer identity allowlist for machine JSON-LD; native non-machine structured data retained. | `2ea5c3cc0f467b4ca9e14a4802622adb035b782b4c9a4e2fbc723e8864dcad5c` |
| `snippets/rhino-product-support-resources-projection.liquid` | created | Direct machine section projection dependency; generated nil projection grants zero facts. | `70c7226c5376af3693dadc3bb5b377a7096764e201aa0a7d5f44aa3ea8658b25` |
| `templates/product.machine.json` | created | Six-block machine shell template: title, price, Variant, quantity, native purchase, neutral Contact. | `1527450e3324c0240a93618ea3a0a8371ec94dcbc0efb8d02719d0d290b652af` |
| `snippets/product-inventory.liquid` | created | The shared main-product inventory block was extracted for complexity cleanup; required to preserve existing default Product rendering. | `36de2da4743a045416f800f2638879b1d41c007ed9f825d55530e0a6a61d8fb9` |
| `snippets/card-product-placeholder.liquid` | created | The shared card fallback was extracted for complexity cleanup; required to preserve empty/native placeholder cards. | `b36b75fb04a96ee49d4304e7c834a0b666004729f84aa2080b503f4a5a0fef56` |

Every updated shared file has its fresh live checksum, exact original body, intended body, both hashes and a semantic rationale in [deployment-plan.json](../qa/evidence/epic-f/live-activation-2026-10-05/deployment-plan.json). The 12 exact before/after textual diffs are in its adjacent `diffs/` directory. Non-machine surfaces potentially touched are Product rendering, native cards, predictive search, cart lines, global metadata, and existing stylesheet/translation load sites. Existing global CSS rules and existing translation values remain unchanged.

The four exclusions from the prior 32-file Preview set are:

- `snippets/facets.liquid` — NOT_REQUIRED_FOR_MACHINE_ACTIVATION; Unrelated filter complexity extraction; live native facets remain intact.
- `snippets/facets-mobile.liquid` — NOT_REQUIRED_FOR_MACHINE_ACTIVATION; Unrelated filter complexity extraction; live native facets remain intact.
- `snippets/product-disclosures.liquid` — OPTIONAL_FUTURE_MODULE_ONLY; Machine template does not contain the disclosure block; all 11 fresh machine reads have no Shopify disclosure values. Existing native snippet is preserved.
- `snippets/cart-disclosure-indicator.liquid` — OPTIONAL_FUTURE_MODULE_ONLY; Machine template does not contain the disclosure block; all 11 fresh machine reads have no Shopify disclosure values. Existing native snippet is preserved.

Live `rhino-browser-assets` was already equivalent after CRLF normalization. Existing native media-gallery/media/thumbnail helpers were retained; the machine shell skips their ungranted gallery path. `assets/global.js` was not deployed: deferred-video behavior is unused with zero resource/video grants. The fixture-only specification-row helper is not a live dependency. No transformed theme layout, inline-preview CSS snippet, overrides JSON or preview-tool artifact was deployed.

## Exact backup, local gates and selective push

The complete fresh MAIN inventory and raw original bodies were captured before any mutation. Rollback bodies for 12 replacements are exact stored contents. For Shopify-generated JSON comment wrappers, original Git bodies were verified against both the live stored MD5 and parsed current JSON: `en.default.json` MD5 `19af69c3965def68f0aec8708ee00cc4`; `en.default.schema.json` MD5 `47f602b15c0f767c663a88f42ce656e2`. No live file was overwritten without a verified rollback body.

Before push: explicit Shopify CLI 4.8.3 full-repository Theme Check exit 0, zero errors/warnings; F1–F8 aggregate exit 0; machine/default Product/card/search/facets/cart, claims-containment and schema/register regressions passed; diff check exit 0. Thresholds and rules were unchanged. The plan/command validator rejects extra files, target/role mismatch, source/authority drift, missing backups, forward deletion, publication and unrestricted pushes.

The exact sanitized push was:

```text
shopify theme push --store sz5dnk-nf.myshopify.com --theme 158579622085 --path . --only assets/rhino-custom.css --only layout/theme.liquid --only locales/en.default.json --only locales/en.default.schema.json --only sections/cart-notification-product.liquid --only sections/main-cart-items.liquid --only sections/main-product.liquid --only sections/predictive-search.liquid --only snippets/card-product.liquid --only snippets/cart-drawer.liquid --only snippets/meta-tags.liquid --only snippets/product-media-modal.liquid --only snippets/rhino-machine-contents.liquid --only snippets/rhino-machine-contextual.liquid --only snippets/rhino-machine-delivery.liquid --only snippets/rhino-machine-resources.liquid --only snippets/rhino-machine-specifications.liquid --only snippets/rhino-machine-support.liquid --only snippets/rhino-product-consumer-route.liquid --only snippets/rhino-product-context-delivery-projection.liquid --only snippets/rhino-product-description.liquid --only snippets/rhino-product-fact-projection.liquid --only snippets/rhino-product-media-eligibility.liquid --only snippets/rhino-product-structured-data.liquid --only snippets/rhino-product-support-resources-projection.liquid --only templates/product.machine.json --only snippets/product-inventory.liquid --only snippets/card-product-placeholder.liquid --nodelete --strict --allow-live --json
```

CLI 4.8.3; started 2026-10-05T20:44:08.649Z; completed 2026-10-05T20:44:29.448Z; exit 0. All 28 intended paths read back successfully. MAIN has persistent `product.machine.json` and the real `rhino-custom.css`; all required snippets are present. Zero unplanned file changes and zero Preview file-record changes were found by full-inventory comparison.

Stored source equivalence accepts raw bytes or CRLF-to-LF normalization. Generated JSON header serialization is accepted only with intended stored checksum and parsed JSON equality. Initial over-strict serialization harness observations remain preserved rather than rewritten.

## Baseline and pre-assignment verification

The pre-push baseline covers `/products/anchor-rod-set` (default replacement part), `/products/bonded-diamond-wheel-220` (consumable), `/products/screw-on-flat-lap` (accessory), `/collections/all`, native `/search`, and `/cart`, each at 390 and 1440 px: 12 cells. Evidence captures native Product controls, card content, layout, header/footer, mobile navigation, predictive search, cart presentation, console/page errors, and representative default Product axe. No cart contents were changed.

Post-push and post-assignment presentation/control comparisons passed 12/12 each. Search membership is **qualified**, not exact backend-ranking parity: one first-page non-machine result changed from `/products/jademaster-feet` to `/products/screw-on-flat-lap`; 20 common non-machine cards remained identical and page size stayed equal. Native main-search/search configuration was not deployed, and all protected non-machine catalog records are unchanged. No material customer presentation/control regression was observed.

Description wrapper whitespace changed only outside protected Product HTML. Chromium reconstruction proves original/current innerHTML hashes against the exact prior 22-space/20-space wrapper and the new rendering; trimmed original Product description HTML and classes are identical on all six sampled Product cells. Customer copy and meaningful DOM content did not change.

Before assigning any Product, MAIN alternate-template smoke passed four cells: BeadMaster and excluded JadeMaster at both widths. Jade is unpublished, so its existing native Product preview context was used in process memory; no new preview session was created. BeadMaster and merchant-owned Jade storefront axe: zero critical/serious/moderate/minor. Jade full-preview findings were retained: mobile 0 critical/2 serious/0 moderate/0 minor; desktop 1 critical/1 serious/1 moderate/0 minor. The only scoped exclusion was Shopify-owned `iframe#PBarNextFrame` with source `https://cdn.shopify.com/shopifycloud/preview-bar/index.html`. Merchant, app and payment-provider markup was retained.

## Fresh F7 before-read, canary and assignments

All 11 machines were freshly protected-read from **2026-10-05T20:54:06.560Z to 20:54:07.460Z**, plus Variant/fulfillment reads at 20:54:50.522–20:54:56.072Z. The first canary write began within 900 seconds (approximately 369 seconds after the completed Product read). Each subsequent write had its independent immediate compare-before-write. All eight candidate suffixes were null; all three exclusion suffixes were null; all 11 live classifications were `machine`.

BeadMaster was the deterministic canary. Only `id` and `templateSuffix: machine` were sent. The immediate first mobile observation saw the cached prior default template while desktop rendered the assigned shell. The remaining seven writes were held. One bounded read-only propagation confirmation then passed both widths at the normal URL. No repeat mutation was issued and no persistent render/control/factual/accessibility failure remained. The initial observation is preserved in `browser-canary-initial-propagation-observation.json`.

| Product GID | Product | Before | After | Returned updatedAt | Receipt |
| --- | --- | --- | --- | --- | --- |
| `gid://shopify/Product/8905779937477` | BeadMaster 6" | null | machine | 2026-10-05T21:00:16Z | success; userErrors empty |
| `gid://shopify/Product/8905780756677` | EM-1 Machine | null | machine | 2026-10-05T21:03:40Z | success; userErrors empty |
| `gid://shopify/Product/8905781412037` | LapMaster 12" | null | machine | 2026-10-05T21:03:45Z | success; userErrors empty |
| `gid://shopify/Product/8905781477573` | LapMaster 18" | null | machine | 2026-10-05T21:03:50Z | success; userErrors empty |
| `gid://shopify/Product/8905784131781` | SawMaster 18" | null | machine | 2026-10-05T21:03:56Z | success; userErrors empty |
| `gid://shopify/Product/8905784197317` | SawMaster 24" | null | machine | 2026-10-05T21:04:08Z | success; userErrors empty |
| `gid://shopify/Product/8905784328389` | ShapeMaster 6" | null | machine | 2026-10-05T21:04:13Z | success; userErrors empty |
| `gid://shopify/Product/8905785344197` | TrimMaster | null | machine | 2026-10-05T21:04:18Z | success; userErrors empty |

Every independent request/response and rollback suffix is retained in [assignment-journal.json](../qa/evidence/epic-f/live-activation-2026-10-05/assignment-journal.json); its cursor is 8 and state is `COMPLETE_AND_RECONCILED`.

The fresh all-catalog after-read (21:05:02.758–21:05:08.115Z) and reconciliation covers 122 Products, 125 Variants and 125 fulfillment records. Exactly eight suffixes changed, with their expected Product.updatedAt bookkeeping. All other protected fields are identical: titles, handles, descriptions, types/categories/vendor/tags, SEO, status/publications, media, variants/prices/inventory and every rhino metafield. The 114 other Products are unchanged. Pagination `pageInfo.endCursor` response encoding is metadata only; nodes, publication state and completeness remain protected. Negative tests continue to reject business JSON, publication and incompleteness drift.

| Exclusion | Product GID | Before/after suffix | Normal URL observation |
| --- | --- | --- | --- |
| JadeMaster, 14" | `gid://shopify/Product/8905781248197` | null / null | unchanged unavailable route (404) at both widths |
| SawMaster, 36" | `gid://shopify/Product/8905784262853` | null / null | unchanged unavailable route (404) at both widths |
| TumbleMaster | `gid://shopify/Product/8905785868485` | null / null | unchanged unavailable route (404) at both widths |

Jade remains ACTIVE but unpublished; SawMaster 36 and TumbleMaster remain DRAFT/unpublished. Their normal unavailable routes passed 6/6 expected-404 checks. These are availability checks, not invented live default-page render evidence.

## Actual assigned normal-route verification

No normal-route cell uses `view=machine` or `preview_theme_id`. All eight assigned Products prove the machine structural signature and canonical Product path with native title/current Variant/price/quantity, purchase display, neutral Contact, provider terms, header/footer and no horizontal overflow.

| Product | 390 px | 1440 px | Purchase display | Current native Variant |
| --- | --- | --- | --- | --- |
| BeadMaster 6" | PASS | PASS | Sold out (disabled) | `46484254032069` |
| EM-1 Machine | PASS | PASS | Sold out (disabled) | `46484254949573` |
| LapMaster 12" | PASS | PASS | Add to cart | `46484255637701` |
| LapMaster 18" | PASS | PASS | Add to cart | `46484255703237` |
| SawMaster 18" | PASS | PASS | Sold out (disabled) | `46484258914501` |
| SawMaster 24" | PASS | PASS | Sold out (disabled) | `46484258980037` |
| ShapeMaster 6" | PASS | PASS | Sold out (disabled) | `46484259111109` |
| TrimMaster | PASS | PASS | Sold out (disabled) | `46484260290757` |

Normal-route matrix: **16/16 passed**. Neutral Contact is visible and points to `/pages/contact`; no form was submitted. Native pickup element is present on every candidate but `available=false` and its unavailable presentation is hidden. No available-pickup state or alternate Variant was synthesized. Native provider payment terms are visible in their native position, with matching current Variant IDs; shadow presentation displays “From …/mo with Shop.” All Products currently have one Variant. F-DEC-001 remains **APPROVED_OPTION_A**; no Rhino financing copy or payment configuration changes.

All 16 full normal live documents and storefront-owned scopes had **0 critical, 0 serious, 0 moderate, 0 minor axe findings**. Purchase controls were observed without activation; read-only global interactions passed. Sampled global tab-order evidence remains separate from complete assigned-machine keyboard coverage. This advances assigned-template normal-route parity, but full assigned-route 200% text/actual browser zoom and complete keyboard-state coverage still require the separate F-PBI-014B gate. Prior unassigned-shell enlargement/zoom evidence is retained without being relabeled assigned-route coverage.

Zero governed factual grants remain: no factual gallery, descriptions/legacy technical fallback, populated hidden modal, specifications, BOM/contents, compatibility, delivery/timing, warranty/service, resources/manuals/diagrams/instructions/video or customer support_files. Structured data retains only allowed native Product/Offer identity, price/availability and canonical URL properties. Recorded Product properties are `@context`, `@id`, `@type`, `name`, `offers`, `productID`, `url`; Offer properties are `@id`, `@type`, `availability`, `identifier`, `price`, `priceCurrency`, `url`. Governed technical/media/resource properties are absent. Social metadata retains the authorized brand-only `rhino-og-default.jpg` fallback. Machine collection/search/cart media fallback containment is active.

## Native stylesheet, provider/network and diagnostics

The authoritative raw repository CSS SHA256 is `32f44d332f5b1d51b95213292c54d6e5c17751ebf4e79878eba4e2c17ce5f961`. Admin readback proves exact stored source. Actual pages use the normal Shopify asset link; no preview-only inline stylesheet is present. Shopify CDN minification changes serialization: CDN body SHA256 `e159da746723dc39995e9810413184f9c93c764a7fa8af1ba7fc3b4970821a44`; CDN CSSOM hash `db1fce97e0fa8435ed0e39e46df2780e171b0f658376333d025e62340033b483`; raw local CSSOM hash `f96d742b575e8ff4e7917ca3106678ce2c23f9b58f5b6f65161be4d3b55d8b49`. Exact native-CDN serialized CSSOM identity is **not claimed**.

Instead, every machine cell compares every resolved standard computed CSS property on the actual storefront DOM with the exact source temporarily substituted at the same cascade site. Representative mobile cells cover 366 elements / 172,752 resolved values with zero differences; every observed cell passed. The temporary reference is removed immediately, returning the normal native asset link. Custom-property whitespace is excluded; its resolved standard-property effects remain compared. Secondary passive CSS fetches from axe are not duplicate active stylesheets.

No Liquid/page errors, blocked native preload requests, governed document/download auto-fetch, eager video providers, unapproved machine media or F analytics emission occurred. Native Shopify/app/provider requests were inventoried separately. All 32 console errors in the assigned matrix are the known Shop Pay CSP/frame and `/pay/hop` HTTP 403 noise (two per cell), also observed before activation; native purchase presentation remains intact. These do not meet the authorized rollback condition absent material worsening.

Optional `LIVE_DEVELOPMENT_DIAGNOSTIC`: 16 navigation samples, 937.1–2855.6 ms. These are neither release medians nor F-PBI-015B certification. Budgets were not changed.

## Rollback state and current readiness

Rollback was **not invoked**: no attributable material persistent failure met the stop conditions. Exact rollback bodies remain in the deployment plan and ignored rollback workspace; suffix rollback state is in the assignment authorization/journal. If required, order is suffix restoration and verification, then exact original shared files and deletion only of the 16 task-created paths, checksum verification and default Product smoke. The rollback command is separately allowlisted and requires Product restoration evidence. Production publication and Preview publication are both false.

| Current gate | State |
| --- | --- |
| E-MUT-020 | EXECUTED_AND_RECONCILED, 38/38 definitions; unchanged |
| E-MUT-021 | EXECUTED_AND_RECONCILED, 122/122 classifications; unchanged |
| F-DEC-001 | APPROVED_OPTION_A |
| F-PBI-014B | PARTIAL; assigned normal-route parity advanced, remaining enlargement/zoom/keyboard/provider coverage and unavailable-state disposition |
| F-PBI-015B | DEFERRED |
| F-PBI-017B | COMPLETE at authorized live-development activation scope, eight assigned / three excluded |
| F-PBI-018B | NOT BEGUN / NOT READY; final release signoff not performed |

Current eligibility: eight assigned/reconciled targets, three exclusions, zero remaining executable assignments. F8 readiness remains NOT_READY because 014B coverage/state-gap disposition, representative 015B certification and 018B selected-scope owner signoff remain. Technical facts, measurements/dimensions, compatibility, BOM/contents, recommendations, fulfillment/pickup/timing, warranty/service and resources remain independent incomplete Epic E domains.

## Product Owner visual links

[Live Theme Editor](https://sz5dnk-nf.myshopify.com/admin/themes/158579622085/editor) · [Preview Theme Editor](https://sz5dnk-nf.myshopify.com/admin/themes/158631198917/editor) · [Unpublished Preview root](https://sz5dnk-nf.myshopify.com?preview_theme_id=158631198917)

Existing storefront password protection remains in place. Normal live URLs need no alternate-template query. Preview comparison links intentionally force the machine view on the unpublished development theme.

| Product | Normal live Product | Preview comparison |
| --- | --- | --- |
| BeadMaster 6" | [Open live](https://sz5dnk-nf.myshopify.com/products/beadmaster) | [Open Preview](https://sz5dnk-nf.myshopify.com/products/beadmaster?preview_theme_id=158631198917&view=machine) |
| EM-1 Machine | [Open live](https://sz5dnk-nf.myshopify.com/products/em-1) | [Open Preview](https://sz5dnk-nf.myshopify.com/products/em-1?preview_theme_id=158631198917&view=machine) |
| LapMaster 12" | [Open live](https://sz5dnk-nf.myshopify.com/products/lapmaster-12) | [Open Preview](https://sz5dnk-nf.myshopify.com/products/lapmaster-12?preview_theme_id=158631198917&view=machine) |
| LapMaster 18" | [Open live](https://sz5dnk-nf.myshopify.com/products/lapmaster-18) | [Open Preview](https://sz5dnk-nf.myshopify.com/products/lapmaster-18?preview_theme_id=158631198917&view=machine) |
| SawMaster 18" | [Open live](https://sz5dnk-nf.myshopify.com/products/sawmaster-18) | [Open Preview](https://sz5dnk-nf.myshopify.com/products/sawmaster-18?preview_theme_id=158631198917&view=machine) |
| SawMaster 24" | [Open live](https://sz5dnk-nf.myshopify.com/products/sawmaster-24) | [Open Preview](https://sz5dnk-nf.myshopify.com/products/sawmaster-24?preview_theme_id=158631198917&view=machine) |
| ShapeMaster 6" | [Open live](https://sz5dnk-nf.myshopify.com/products/shapemaster) | [Open Preview](https://sz5dnk-nf.myshopify.com/products/shapemaster?preview_theme_id=158631198917&view=machine) |
| TrimMaster | [Open live](https://sz5dnk-nf.myshopify.com/products/trimmaster) | [Open Preview](https://sz5dnk-nf.myshopify.com/products/trimmaster?preview_theme_id=158631198917&view=machine) |

## Implementation files and validation

Developer tooling created: `scripts/lib/epic-f-live-machine-activation.js`, `scripts/lib/epic-f-live-excluded-preview.js`, `scripts/build-epic-f-live-machine-deployment-plan.js`, `scripts/deploy-epic-f-live-machine-template.js`, `scripts/smoke-epic-f-live-machine-activation.js`, `scripts/validate-epic-f-live-source-readback.js`, `scripts/compare-epic-f-live-non-machine.js`, `scripts/prove-epic-f-live-description-equivalence.js`, `scripts/prepare-epic-f-live-assignment-authorization.js`, `scripts/validate-epic-f-live-assignment-input.js`, `scripts/reconcile-epic-f-live-machine-activation.js`, `scripts/finalize-epic-f-live-machine-activation.js`, and `scripts/test-epic-f-live-machine-activation.js`. Existing current eligibility refresh tooling gained a guard against stale historical-snapshot overwrites after activation. No repository storefront runtime source was changed by this task; all 32 prior persistent source-bound hashes remained unchanged.

Current operational artifacts updated additively: `data/epic-f-current-shopify-eligibility.json`, `data/epic-f-current-development-status.json`, `data/epic-e-current-execution-status.json`, and the current section of `docs/rhino-lapidary-pbi-tracker-epic-f.md`. This implementation record and the complete sanitized evidence directory are new. Historical authorities and reports were not rewritten.

Evidence directory: [activation-summary.json](../qa/evidence/epic-f/live-activation-2026-10-05/activation-summary.json), with exact backups/diffs/plan, Theme Check, local tests, baseline, alternate smoke, assignment authorization/journal/immediate before-reads, all-catalog protected snapshots/reconciliation, 16 assigned cells, default regressions, exclusions, final inventories and current readiness. Sanitized initial harness/caching observations are retained beside corrected results. See `validation-summary.json` for all commands/exits and evidence manifest for exact files/hashes.

Validation completed: F1–F8 aggregate exit 0 (including machine fixtures/rollout/claims); 33 live execution-contract tests; network guard 43 cases (18 allow / 25 block); complexity extraction 264 rendering comparisons plus 12 negative drift cases; local facets six cells; Product purchase/cart/search/filter/register/hardcoded-string validators; fresh F7 before/after contract checks; full protected-field reconciliation; 28-file readback; alternate smoke four cells; normal assigned smoke 16 cells; default/global comparisons 12 cells; excluded normal routes six cells; explicit Theme Check zero errors/warnings exit 0; git diff --check exit 0. Hardcoded-string tooling retains five existing informational warnings, separately from clean Theme Check. No tests or thresholds were weakened.

Next recommended step: complete or formally disposition the remaining actual assigned-route F-PBI-014B coverage/state gaps, then separately authorize F-PBI-015B representative release certification before F-PBI-018B signoff. No further persistent work, factual migration, excluded assignment or publication is executed by this record.
