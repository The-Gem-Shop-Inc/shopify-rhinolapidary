# Epic F nonpersistent equivalent CSS Shopify browser validation

**The browser validation ran against one new nonpersistent session. All 32 machine-shell rendering/responsive cells passed; the full-page accessibility result is not clean.** Every axe violation and focus-indicator failure targets Shopify's PBarNextFrame preview toolbar. Those findings remain visible and are not suppressed. Native provider parity also has a harness qualification: the tested transaction guard blocked read-only checkout preload JavaScript. No release approval is granted.

The [sanitized evidence](../qa/evidence/epic-f/nonpersistent-equivalent-css-browser-validation.json) contains all 32 cells, 16 text-enlargement runs, eight actual Chromium zoom runs, keyboard order/focus, axe nodes, native Product/pickup/payment observations, JSON-LD graph/property evidence, console/network inventories and fresh persistence comparisons. The [previous attempt evidence](../qa/evidence/epic-f/nonpersistent-equivalent-css-preview.json) remains historical evidence; its URL-loss failure is superseded by this completed browser run.

## Runner and single-session orchestration

Developer tooling: scripts/run-epic-f-nonpersistent-shopify-preview.js, with scripts/lib/epic-f-nonpersistent-preview.js, scripts/lib/epic-f-preview-browser.js, a passive response observer and scripts/test-epic-f-nonpersistent-shopify-preview.js. It regenerates the exact approved payload, asserts the target/role/production exclusion, reserves a one-session receipt, captures CLI streams, keeps its event loop alive through awaited state hooks, passes the URL in memory directly to Playwright, sanitizes evidence and disposes the URL. No stdin/URL copy, credential file, trace, screenshot or credential-bearing environment/argument is used.

Local tests pass for redaction of URLs/identifiers/encoded and nested error values; preservation of session query parameters; one-session cap; production exclusion; Product/file drift rejection; exact payload hash; local observer preload; closed-stdin lifecycle; compact/pretty/ANSI JSON; success JSON written only to stderr; and transaction guards. Local preflight runs with --verify-only and creates no preview.

Two orchestration issues were resolved locally. First, a Windows NODE_OPTIONS preload path failed before CLI startup: **zero remote requests and zero sessions**. The observer now loads through a direct Node --require argument, tested before any create reservation. Then CLI 4.8.3 wrote success JSON to stderr, which the initial parser omitted. The successful response remained in the orchestrator's memory. A local debugger callback recovered it inside that same process, then performed the browser handoff without exporting the URL or issuing another create. Durable parsing now consumes both streams, including ANSI/pretty formatting. Debugger clients and child handles were closed after testing.

The external read-only hook writes request-before, request-post-create and request-final markers under the ignored run directory. A read adapter supplies fresh state-before/state-post-create/state-final snapshots containing only the validated shop/theme/file/Product queries. The hook verifies freshness and complete pagination and compares full records. This run's recovered callback used request-after-browser/state-after-browser for its final hook; all three required reads passed. Future operators must supply these read hooks; no mutable Admin adapter is embedded.

## Payload, CSS authority and fidelity

Authoritative assets/rhino-custom.css remains **46,005 bytes**, SHA256 **32f44d332f5b1d51b95213292c54d6e5c17751ebf4e79878eba4e2c17ce5f961**. The established hazard scan reran and passed without changes: no url(), import, charset, source-map, closing-style, Liquid/template delimiters or external-base dependency. Only media/keyframes at-rules occur.

Layer A: the virtual snippet contains the exact CSS source once before HTML parsing, with only the single style wrapper and data-rhino-nonpersistent-preview-css marker. Extracted raw CSS hashes to authority. The repository CSS was not moved, renamed, split, normalized or inlined in production source.

The temporary layout replaces exactly one unconditional statement at theme.liquid:297: {{ 'rhino-custom.css' | asset_url | stylesheet_tag }} becomes {% render 'rhino-preview-inline-css' %}. It remains immediately after base.css and before component-cart-items.css. Original layout SHA256 **87086adef642d447d2cba82186641e93460d815549375bf608da035534cec5af**; temporary layout SHA256 **eb4f1b6b7fb3bf439a4091eba2969b79dc436d26ad6587ec31e199496919b396**. Reverse replacement reconstructs the original exactly. The original accepted 27-file complement gains the virtual snippet, for **28 source entries**, without any asset override. All approved source hashes and the real persistent deployment boundary remain unchanged.

Payload SHA256: **e7596e5e04423ca3b535a1d4fda123aa32be53859384a03fccb475bc62370d80**, exactly reproducing the prior accepted bytes. No direct asset override or HTTP-400 probe was repeated.

Layer B: Chromium **149.0.7827.55**, identical ordered/recursive CSS-rule algorithm on external, inline and Shopify stylesheets; only CRLF-to-LF normalization in cssText. Local external and inline canonical hashes match: **f96d742b575e8ff4e7917ca3106678ce2c23f9b58f5b6f65161be4d3b55d8b49**. Shopify matches this hash in **all 57 observed page loads** (smoke, 32 matrix cells, 16 enlargement runs, eight zoom runs). Each has exactly one inline Rhino stylesheet, correct cascade order, no external Rhino link and **zero persistent rhino-custom.css requests**. Representative computed Contact styles were active (normal desktop min-height 47px, red rgb(163,21,28), overflow-wrap anywhere).

Secondary LF-normalized text hash: **c73212100dd1bb763cd730cc1d76b8c37c7ac4de1d344e246bf7dc3facc2830f**; all browser text comparisons match. HTML normalizes 1,728 CRLF pairs to LF. Browser byte identity is not claimed, and no CSS-body transformation occurred in transport.

## Creation, smoke and responsive matrix

One remote create: Shopify CLI **4.8.3**, CI=1, shop sz5dnk-nf.myshopify.com, **158631198917 / Rhino Lapidary - Preview / UNPUBLISHED**. Production **158579622085** excluded. Command: shopify theme preview --store=sz5dnk-nf.myshopify.com --theme=158631198917 --overrides=<ignored-run-directory>/overrides.json --json.

UTC interval **2026-10-02T19:28:12.753Z–2026-10-02T19:28:22.305Z**. HTTP **200**, CLI exit **0**. Request ID **6c29584e-2c15-45bf-bfcf-a400cd068463-1790969300**. Preview identifier SHA256 **b2a73fa7d32a1377b62afff04e644bed614cb589c9a47ba64fd5db56b430efa7**; complete signed URL SHA256 **70d47529932d14318e06e3bd7f2dddd5b246ac303dea0d7b3b22155bae5be258**. URL origin is retained only as [SIGNED_PREVIEW_HOST_REDACTED]; original path /; no original query parameters. Route construction preserves query state and adds view=machine. Shopify describes this operation as [virtual in-memory overrides without permanent theme-file changes](https://shopify.dev/docs/storefronts/themes/tools/cli/theme-preview-overrides).

BeadMaster smoke passed HTTP/routing, product-info.rhino-machine-shell, matching Product ID, single main/h1, product--no-media, neutral Contact block, CSS fidelity and visible native title/price/quantity/purchase display, with zero Liquid/page errors. This proves the alternate machine template; HTTP 200 alone was not used. No templateSuffix was assigned.

In this matrix, **Pass / findings** means machine-template routing, fidelity, native display, suppression, JSON-LD and measured layout passed; full-page axe still reports preview-toolbar findings.

| Product | 320 px | 390 px | 768 px | 1440 px |
|---|---|---|---|---|
| BeadMaster 6" | Pass / findings | Pass / findings | Pass / findings | Pass / findings |
| EM-1 Machine | Pass / findings | Pass / findings | Pass / findings | Pass / findings |
| LapMaster 12" | Pass / findings | Pass / findings | Pass / findings | Pass / findings |
| LapMaster 18" | Pass / findings | Pass / findings | Pass / findings | Pass / findings |
| SawMaster 18" | Pass / findings | Pass / findings | Pass / findings | Pass / findings |
| SawMaster 24" | Pass / findings | Pass / findings | Pass / findings | Pass / findings |
| ShapeMaster 6" | Pass / findings | Pass / findings | Pass / findings | Pass / findings |
| TrimMaster | Pass / findings | Pass / findings | Pass / findings | Pass / findings |

Required/executed **32/32**; shell rendering/layout **32/32 pass**; combined accessibility-clean acceptance **0/32**. No measured horizontal overflow, clipping or overlap in the tested shell controls. Header/footer were present and visible across the matrix. No empty factual headings/cards/wrappers or hidden populated governed modules were found. JadeMaster, SawMaster 36 and TumbleMaster remain excluded.

## Zero grants, native display and structured data

Actual Shopify output has zero governed machine-media/factual activation: media-gallery/modal/wrapper, specification/contents/context/delivery/support/resource sections, diagrams/instructions, videos and customer support-files markup were absent. No technical-description or manual/resource fallback was rendered. This is integration evidence, not fixture evidence.

| Product | Native price | Selected Variant | Purchase display | Native provider text observed |
|---|---|---|---|---|
| BeadMaster 6" | $2,350.00 USD | 46484254032069 | Sold out (disabled) | From $212.11/mo with Shop |
| EM-1 Machine | $4,000.00 USD | 46484254949573 | Sold out (disabled) | From $361.03/mo with Shop |
| LapMaster 12" | $1,650.00 USD | 46484255637701 | Add to cart | From $148.93/mo with Shop |
| LapMaster 18" | $2,850.00 USD | 46484255703237 | Add to cart | From $257.24/mo with Shop |
| SawMaster 18" | $5,250.00 USD | 46484258914501 | Sold out (disabled) | From $473.86/mo with Shop |
| SawMaster 24" | $6,600.00 USD | 46484258980037 | Sold out (disabled) | From $595.70/mo with Shop |
| ShapeMaster 6" | $2,750.00 USD | 46484259111109 | Sold out (disabled) | From $248.21/mo with Shop |
| TrimMaster | $1,150.00 USD | 46484260290757 | Sold out (disabled) | From $103.80/mo with Shop |

Every Product has one current native Variant and no alternate native option control. Selected IDs match pickup and payment_terms IDs. Variant transitions are therefore **not applicable/unexercised**, not fabricated. Quantity +/− changes 1→2→1 on all eight without cart submission. LapMaster 12 and 18 have enabled Add to cart; the six others display disabled Sold out. Native price DOM also contains Trade's hidden sale/sold-out labels; the table records current prices and actual purchase-button state.

Pickup element exists on all eight but is not available/visible and has no rendered pickup controls for the current Variant. No available pickup/drawer scenario was exercised, and no business pickup-region policy or F-PBI-009B approval is inferred. Contact is neutral text Contact with /pages/contact, no contextual/intake fields; it was focused, never submitted or activated.

Native/provider-owned payment_terms appeared after price and before quantity/purchase. The host is not focusable; its open shadow DOM contains a focusable provider button. Provider copy is observed evidence only, not authored financing content or F-DEC-001 approval. Text and controls reflowed at all widths, text enlargement and real zoom. The current Variant ID is synchronized; alternate-Variant update behavior is unexercised because no alternatives exist. Native Shop payment scripts/analytics appeared; accelerated-checkout/pixel/framing failures and harness preload interception are retained below.

All 32 JSON-LD inspections parse successfully and retain one native Product/Offer graph with the expected Product/Variant IDs, numerical price, USD currency and a valid native availability enum. Product properties: @context, @type, @id, productID, name, url, offers. Offer properties: @type, @id, url, identifier, price, priceCurrency, availability. No blocked specification/BOM/compatibility/warranty/delivery/resource/media properties appeared. Organization and BreadcrumbList/ListItem graphs remain. URLs were validated in memory and redacted before storage. Metadata Product descriptions are absent; default social-image elements remain. Social-image contents beyond those DOM flags were not re-fetched or independently audited.

## Enlargement, actual zoom, keyboard and axe

200% root/text enlargement: all eight Products at 390 and 1440 px (**16/16 measured layout passes**), root font doubled, reflow, visible Product controls and no measured overflow/clipping/overlap. Representative computed Contact text grows **15→30px**, compared against the same Product/viewport baseline cell. The raw beforeTitleFont field is derived as afterTitleFont/2 and is not an independent title baseline. This is separate from zoom.

Actual Chromium zoom: chrome.tabs.setZoom reports **2** for all eight. Effective viewport **1258→629**, DPR **1→2**, scrollWidth **629**. **8/8 layout passes**; native controls and provider terms remain visible, with no measured clipping/overlap. No viewport-resize/CSS-transform/pinch substitution was used. The OS-temp extension/profile was outside the repository and removed after Chromium closed.

Tab order and visible indicators passed for the native header/footer, provider control, quantity, enabled purchase buttons and Contact. Disabled Sold out buttons correctly skip the tab sequence. No Variant alternatives or available pickup controls exist to tab through. The only recorded missing focus indicators are the Shopify PBarNextFrame iframe: **32 repeated normal keyboard observations**, **39 repeated zoom observations**. No transactional/provider/Contact activation occurred.

Full-page axe, with no exclusion/suppression:

| Widths | Critical | Serious | Moderate | Minor |
|---|---:|---:|---:|---:|
| 320 / 390 | 0 | 2 | 0 | 0 |
| 768 / 1440 | 1 | 1 | 1 | 0 |

Across 32 cells: **critical 16, serious 48, moderate 16, minor 0**, counting repeated rule instances across pages, not distinct defects. All targets are inside/on Shopify's PBarNextFrame preview toolbar. Across all 56 axe runs:

| Rule | Impact | Repeated rule instances | Node instances | Ownership |
|---|---|---:|---:|---|
| aria-dialog-name | serious | 32 | 32 | Shopify preview toolbar |
| frame-title | serious | 56 | 56 | Shopify preview toolbar |
| button-name | critical | 24 | 24 | Shopify preview toolbar |
| region | moderate | 24 | 72 | Shopify preview toolbar |

Rhino-owned violations observed: **0**. Full-page clean gate: **FAIL** because critical/serious are not zero. Preview-toolbar unnamed dialog/iframe/button, non-landmark content and focus-indicator defects are retained; they were not removed to obtain a passing count. F-PBI-014B remains Partial.

## Global integration, network and limitations

Header/footer and global CSS/JS rendered across all cells. One ProductInfo/ProductForm/pickup controller script and one ProductForm/quantity-input instance were present; no duplicate IDs were found. quantity-input is defined in native global JS, not a separate quantity-input.js load. Cart link and native cart-notification markup were present; no cart mutation or cart transaction was executed. Read-only BeadMaster predictive search expanded and returned 11 option elements. Footer privacy/shipping/refund/legal links were present; policy navigation and mobile drawer interaction were not separately exercised.

Across 57 page loads: **232 console errors**, **0 page errors**, **0 Liquid errors**, **173 HTTP error observations**, **401 failed-request observations**. These counts include repeated preview/provider failures and page-close analytics aborts. Evidence retains every observation and ownership classification:

- Shopify preview toolbar: axe/focus findings above.
- Existing Shopify app/custom pixel sandbox: 404 routes on the signed preview origin; no pixel configuration was changed.
- Native payment/preview provider: accelerated-checkout 404, framing CSP and 403 observations.
- Harness: **114 intercepted GET /checkouts/internal/preloads.js requests**, producing blocked-by-client console errors.
- Native analytics/page teardown: collect/monorail requests and aborted requests at page closure; no new F instrumentation introduced.

The harness's broad transaction guard mistakenly treated native read-only preload JavaScript as checkout initiation. This qualifies provider/network parity. Durable tooling now allows native GET script/stylesheet assets under /checkouts/internal while still blocking actual checkout navigation and cart/Contact/order mutations; local regression tests pass. **The corrected guard was not retested on Shopify**, because the one allowed session is complete and its URL discarded. No real transactional request was attempted; all interceptions were read-only native preloads. The exact tested browser-tooling hash is retained separately from corrected tooling.

All matrix pages have zero stale Rhino CSS requests, deferred-video provider requests and eager PDF/document-download requests. No governed Product media DOM appeared. One common store-image path was observed across routes; its exact DOM owner was not captured, so it is retained without claiming it is Product-gallery media. Request-path checks detected no F analytics endpoints. Native analytics are classified separately. Analytics payload bodies were not collected/inspected, so this is not an event-payload certification. No duplicate F Product-controller initialization was observed.

No performance samples, release medians, threshold changes or F-PBI-015B certification were produced.

## Persistence, static tooling and status

Fresh before/post-create/after-all-browser snapshots compare all **409** file records and all **11** Product records exactly. Product templateSuffix/status/publications/rhino metafields/update timestamps are unchanged. All eight remain ACTIVE with suffix null and zero rhino metafields; exclusions are unchanged. Persistent CSS MD5 **586746f7713bfcbb10d4724361f3a6ce**, persistent theme.liquid MD5 **057631df790907cc64d7cdcc06c6f7d5**. Machine template and preview CSS snippet remain persistently absent. Theme updatedAt stays **2026-08-27T18:04:28Z**; virtual-session creation time is distinct from persistent updatedAt, and full-record comparisons support the conclusion.

CLI package files still match their prior hashes. Explicit CLI 4.8.3 repository Theme Check remains **exit 1 / zero errors / three LiquidComplexity warnings**, threshold 120: main-product line 104 **129**, card-product line 597 **122**, facets line 865 **136**. These are a separate pre-persistent-push static-quality blocker. No runtime refactor or threshold adjustment occurred; they did not cause preview transport failure.

Rendering integration is verified nonpersistently with the qualifications above; no unconditional clean-validation VERIFIED_NONPERSISTENT status is granted. Transport remains **PREVIEW_HARNESS_ONLY**; repository production CSS architecture remains **UNCHANGED**. F-PBI-014B **Partial** with substantial actual Shopify unassigned-shell evidence; outstanding full-page preview accessibility, qualified provider baseline, unexercised Variant/available-pickup states and separate assigned-template/release parity are recorded. F-PBI-015B **Deferred**; F-PBI-017B **Blocked/not authorized**; F-PBI-018B **Not begun**; E-MUT-020/E-MUT-021 **Not executed**; F-DEC-001 **Open**; live release **Not authorized**.

Persistent Shopify mutation **No / 0**; E-MUT-020 **No**; E-MUT-021 **No**; Product assignment **No**; theme push/dev/share **No**; production publication **No**; cart/Contact/checkout/order actions **No**; analytics configuration **No**. The task stops here. No Epic E migration, Product assignment, new PBI, additional preview session or release signoff follows.
