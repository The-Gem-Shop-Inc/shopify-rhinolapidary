# J2/G4 Phase C live acceptance defect remediation

Date: 2026-11-17

Status: repository corrective candidate prepared; no Shopify Apply authorized or performed.

## Preserved history and scope

This record is additive. It does not replace or reclassify any earlier result:

- Original Phase B exact readback: `FAILED_EXACT_READBACK`.
- Shopify JSON successor integrity: `PASS_SUCCESSOR_SEMANTIC_READBACK`.
- First live catalog acceptance: `FAIL`.
- First live cart acceptance: `PARTIAL`.
- First live accessibility acceptance: `FAIL`.

The original Phase B candidate digest remains `c59f3d8ea6a9c4d62cf477e698ef341845066715b2a1007069c5402d745500ec`; its Apply binding is consumed and cannot authorize this candidate. The Phase C corrective manifest is `data/j2-g4-phase-c-corrective-manifest.json`.

Preserved external evidence:

- JSON investigation: `C:\Users\dajem\AppData\Local\RhinoLapidary\evidence\j2-g4-json-integrity\2026-11-17T15-27-06.7593529Z`.
- First live acceptance: `C:\Users\dajem\AppData\Local\RhinoLapidary\evidence\j2-g4-live-acceptance\2026-11-17T16-12-40.1983025Z`.
- First acceptance summary: `acceptance-summary.json` under that live-acceptance root.
- First catalog, cart, navigation, screenshot, and complete CLI theme evidence remain under its `browser` and `cli-preview-theme` children.

The five postdeployment investigation changes are preserved and reviewed with this candidate. No historical evidence file was edited.

## Defect A: machine Product card media

Read-only Admin GraphQL inspected the Machines collection through `collectionByIdentifier(handle: machines)`. It has eleven Admin members: eight ACTIVE published Products and three DRAFT Products. All eight live members have one READY featured image. The exact observation is retained in `data/j2-g4-phase-c-machine-media-audit.json`.

The blank collection cards were caused by `snippets/card-product.liquid`, which only assigned featured media for legacy replacement-part, consumable, or accessory routes. Shopify media was not missing. BeadMaster has READY 1440 by 1440 media `gid://shopify/MediaImage/33451099455685`, with the approved alt text `Rhino Lapidary BeadMaster machine, front view`.

The Product-page F authority already grants six exact machine images. Phase C preserves that protected source and adds a collection-card projection containing exactly the same source and grant predicates. A machine card renders its featured image only when Product ID, media ID, source path, alt text, dimensions, publication, and media type all match. It does not authorize secondary machine media or compatibility claims.

Eligible exact grants: BeadMaster, LapMaster 12, LapMaster 18, SawMaster 18, ShapeMaster 6, and TrimMaster. SawMaster 24 and EM-1 have READY featured media but do not satisfy an exact grant: both have blank alt text and neither is in the protected six-image grant. They therefore receive the accessible neutral machine fallback. No image from another Product is substituted.

The existing responsive `srcset`, `sizes`, dimensions, lazy loading, aspect-ratio behavior, quick-add semantics, Product title links, prices, and availability badges are retained. Empty approved-media alt values fall back to the exact Product title for legacy content; approved machine grants retain their governed alt text.

## Defect B: fulfillment radio ARIA

The live critical axe results were caused by disclosure-only ARIA on native radios. The markup supplied `aria-controls`, and JavaScript added `aria-expanded`; neither state is permitted for this native radio interaction.

Phase C retains two `input type="radio"` controls with one shared name, native labels, required/checked behavior, and `aria-describedby`. It removes `aria-controls`, never adds `aria-expanded`, and introduces data-only target/panel relationships. JavaScript shows exactly the selected shipping or pickup panel. Native arrow-key group behavior, card-click selection, field persistence, pickup verification, contact submission, Draft Order automation behavior, and all eligibility/payment rules remain unchanged.

The deterministic browser test verifies keyboard selection in both directions, selected-panel visibility, accessible names/descriptions, unique IDs, complete ARIA references, zero serious/critical axe findings in the quotation component, and no runtime errors.

## Defect C: enlarged-text horizontal overflow

The first live evidence measured two separate causes:

- At 1024 pixels and 200% text, the horizontal facet form used `1fr max-content max-content`; the sorting and Product-count tracks could not shrink, pushing the form and count beyond the viewport.
- At 768 pixels and 200% text, the 40rem header offcanvas became 800 CSS pixels. The same width and transformed submenu geometry contributed to the overflow. The tablet breakpoint also retained the desktop facet row.

Phase C uses shrink-safe facet tracks. Between 990 and 1199 pixels, the Product count moves to its own wrapping row and facet gaps contract without reducing text size. Between 750 and 989 pixels, the existing mobile filter/sort disclosure replaces the desktop row. Long active-filter labels can wrap. The header offcanvas is `min(40rem, 100vw)` with border-box sizing. No global overflow hiding or interactive clipping is introduced.

The browser regression executes 320, 390, 768, 1024, and 1440 pixel cells at normal text, 200% text, and a deterministic 200% browser-zoom equivalent. It asserts document width, visible overflowing elements, drawer geometry, desktop/mobile disclosure choice, keyboard opening, focus styling, sorting, zero/large counts, and long labels.

## Cart acceptance reconciliation

`cart_type` remains `notification`. This corrective batch does not add a cart drawer or change Shopify configuration.

The corrected contract is configuration-aware:

- `notification`: live notification synchronization and cart-page synchronization are required; live drawer coverage is not claimed.
- `drawer`: drawer synchronization and cart-page synchronization are required.
- `page`: cart-page synchronization is required.

The successful prior add, increment, decrement, remove, rapid/concurrent update, server-confirmed quantity, header badge, cart page, notification, and toast evidence remains historical evidence. It is not represented as a new live acceptance run.

## Corrective release and rollback boundary

The corrective candidate contains seven runtime paths: six modifications and one new dependency. Exact deployed and candidate hashes, byte lengths, difference descriptions, test commands, production exclusion, and the candidate digest are in the Phase C manifest. Candidate digest: `78e435cf53ef09e96a78e567c2d90fb39c76c37e7fd31ca5d04a7ab4e3510efe`.

No upload is authorized by the manifest. Before any future Apply, a fresh complete read-only pull of the then-current unpublished preview must produce a new timestamped rollback archive, inventory, and exact hashes. The historical Phase B rollback archive must not be overwritten or reused as the current-state rollback baseline.

Product Owner release disposition on 2026-11-17 is fail-closed: use the six exact existing F-DEC-002-DEV current-Product media grants and use the neutral fallback for EM-1 and SawMaster 24. This disposition does not create a new grant, renew historical fit or directory authority, authorize final production launch rights, or infer any Product fact from media readiness. A fresh read confirmed the six exact Product/media/source/dimension/alt/status predicates and confirmed the two fallback Products remain outside the grant set.

The separate transaction tool is `scripts/deploy-j2-g4-phase-c-preview.ps1`. It defaults to Plan and contains independent CaptureRollback, Apply, and Readback modes. Plan requires a clean committed candidate, current unpublished-theme identity, a full 463-file remote match to the fresh Phase C rollback inventory, six exact predecessors, one exact absence, five exact dependencies, English-only publication, and the retained Theme Check exception. Apply is implemented but requires a new commit/inventory/candidate-bound authorization plus a separate `-AuthorizeStrictOmission` switch; the consumed Phase B authorization is rejected. Readback requires exact hashes for all seven Phase C runtime files and exact preservation of every unrelated asset. No automatic rollback exists.

The fresh current-preview rollback baseline was captured read-only at `C:\Users\dajem\AppData\Local\RhinoLapidary\rollback\shop-79279947973\theme-158631198917\2026-11-17T22-21-52.8675553Z`. It contains all 463 remote files, exact bodies for the six replacements, and an absence marker for `snippets/rhino-product-card-media-eligibility.liquid`. Its complete inventory digest is `664ac210088a2bac7bdc589e91a6beff8071203d8c559266536e3fadfc726932`; the inventory file SHA-256 is `49d6215511e1b40548985d37026cb861cdabb356cde915ce713486b60d7c69cc`. The historical Phase B rollback archive was not modified.

## Future targeted live acceptance procedure

This procedure is prepared only for execution after a separately authorized Phase C upload. Repository fixture results must not be recorded as Shopify observations.

1. Create a new external evidence root under `C:\Users\dajem\AppData\Local\RhinoLapidary\evidence\j2-g4-phase-c-live-acceptance\<UTC timestamp>` and record the committed Phase C digest, manifest SHA-256, rollback inventory SHA-256, upload response, and exact Readback result.
2. Run `scripts/deploy-j2-g4-phase-c-preview.ps1 -Mode Readback` with fresh external read-only identity evidence and the Phase C rollback archive. Require 7/7 exact corrective hashes, all unrelated assets unchanged, preview UNPUBLISHED, and production MAIN.
3. In isolated authenticated preview sessions, assert `window.Shopify.theme.id` is `158631198917` on every page. Test `/collections/all` and `/collections/machines`; BeadMaster must show the same governed photograph on both routes. BeadMaster, LapMaster 12, LapMaster 18, SawMaster 18, ShapeMaster 6, and TrimMaster must show their exact governed photographs. EM-1 and SawMaster 24 must show the accessible neutral fallback. All eight cards must have a visible media region.
4. Exercise sorting, filtering, pagination, and quick-add regression without inferring machine compatibility. Preserve screenshots, computed media source/alt/dimensions, console logs, and route/theme provenance.
5. On the quotation interaction, run keyboard ArrowRight/ArrowLeft selection for shipping and pickup, confirm the selected panel and accessible descriptions, dismiss or complete no checkout, and run axe. Serious and critical findings for the repaired controls must both be zero.
6. At widths 320, 390, 768, 1024, and 1440, test normal text, 200% text, and real browser zoom. At 768 verify the open/closed offcanvas remains within the viewport and keyboard dismissible; at 1024 verify facets, sorting, and Product count wrap without document overflow. Record document width and offending-element measurements, not screenshots alone.
7. Because `cart_type=notification`, test add, increment, decrement, remove, rapid/concurrent changes, server-confirmed quantity, notification, header badge, cart page, toast announcement/timing/dismissal, and rejected/uncertain responses. Do not claim live drawer coverage.
8. Stop and preserve evidence on any deterministic critical failure. Do not upload again, publish, change menus or collections, enter checkout, or roll back without a new authorization.

## Validation

Phase C-specific deterministic results:

- Source and Liquid rendering regressions: 26/26 PASS.
- Responsive/interaction browser cells: quotation interaction plus 15/15 layout cells PASS.
- Corrective release negative tests: 15/15 PASS, plus the deployment Plan contract.
- Corrective manifest exact local/current-preview validation: PASS.

Broader validation results:

- J2/G4 integrated Playwright suite: 6/6 PASS.
- J2 desktop/mobile collection-cart Playwright suite: 20/20 PASS.
- Epic K quote source/unit suite: 40/40 PASS; quote browser suite: 20/20 PASS.
- G4 route-successor evidence validator: PASS; catalog entry tests: 14/14 PASS.
- Theme architecture, navigation, design-token, CSS, storefront-JavaScript, section, and notification cart-configuration validators: PASS.
- Locale reconciliation semantics: 8/8 applicable checks PASS against the preserved 526-leaf predeployment locale. Its ninth repository-state fixture is Phase B-bound and rejects the authorized Phase C source changes.
- Theme Check ran unsuppressed: 575 files inspected, with the preserved 2,100 `MatchingTranslations` errors across 30 unpublished locale files.
- Git whitespace check: PASS after line-ending normalization.

The immutable Phase B integration/preflight validator, Phase B readback-successor fixture, and legacy G4 provenance fixture reject the Phase C working tree because their sealed source hashes describe earlier candidates. Those failures were retained and were not weakened or rewritten. The live-only Epic J cart suite was not run because no `PREVIEW_BASE_URL`/`PREVIEW_URL` was supplied; deterministic J2 coverage passed and this repository run is not represented as a new live Shopify acceptance.

Repository fixture results do not constitute a successful live Shopify acceptance.

## Shopify mutation statement

This Phase C work used read-only Admin GraphQL only. Shopify mutations, theme uploads, Product media changes, publications, menu changes, collection changes, rollbacks, checkout, order creation, and customer access: zero.
