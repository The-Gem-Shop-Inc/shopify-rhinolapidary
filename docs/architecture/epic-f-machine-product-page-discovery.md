# Epic F — Machine Product Pages discovery

**Date:** 2026-09-10  
**Handoff verified:** 2026-09-11 against saved September 10 observations; no new live-state assertion.  
**Branch:** `dev`  
**Status:** Discovery and proposed PBI handoff only. No Epic F storefront implementation, theme push/publication, Product assignment, data mutation, form submission or purchase occurred.

Epic F continues the Trade 15.5.0 Rhino implementation. Recommend one shared `product.machine.json`, extending the existing purchase/gallery components and adding a small set of conditional, structured-data modules. Architecture and shell development can proceed while individual fact modules remain suppressed. Epic E governance and all 15 deferred decision groups remain unchanged.

## Evidence and authority

- [Master backlog](../Rhino%20Lapidary%20Storefront%20Backlog%20and%20Epics.md), [Epic E tracker](../rhino-lapidary-pbi-tracker-epic-e.md), [Batch 4A report](../project/implementation-records/e-pbi-024-batch-4a.md), [Epic E readiness](../../data/epic-e-downstream-readiness.json), [deferred decisions](../project/epic-e-deferred-decision-handoff.md), and all 44 plan/input files were consumed. The discovery [source/validation record](../qa/evidence/epic-f/2026-09-10-repository-audit.json) hashes 71 sources.
- Current, schema-validated, read-only connector queries inspected the **11 exact Product GIDs classified as machine by approved E-PBI-004 mappings**. Titles, tags and collections were not used to select machines. [Product/media read](../qa/evidence/epic-f/2026-09-10-machine-admin-read.json), [definitions/Pages read](../qa/evidence/epic-f/2026-09-10-definitions-pages-read.json), [Variant inventory read](../qa/evidence/epic-f/2026-09-10-machine-inventory-read.json), [delivery/pickup read](../qa/evidence/epic-f/2026-09-10-operational-read.json).
- The connector reports `sz5dnk-nf.myshopify.com`, with primary domain `https://rhino-lapidary.myshopify.com`. Exact EM-1 GID and subsequently all 11 governed machine GIDs matched. The domain difference was verified before consuming Product data.
- Browser observations used configured unpublished theme **158631198917**, confirmed through `Shopify.theme`. All 11 routes were inspected at **390, 768 and 1440 CSS px**: 33 observations, including nine expected 404 observations for three unavailable Products. [Runtime evidence](../qa/evidence/epic-f/2026-09-10-preview-observations.json). Local-to-preview source parity was not independently certified; no theme push was performed.
- [Supplemental evidence](../qa/evidence/epic-f/2026-09-10-interaction-observations.json) covers 320 px, gallery keyboard behavior, text enlargement, structured data and all manual routes. No cart or contact form was submitted.
- The Chrome DevTools MCP/CLI performance path was unavailable. Existing Playwright/Chromium and the repository's observer-based measurement approach were used instead. These are discovery measurements, not Lighthouse, field INP, three-run release medians or a full accessibility certification.
- Targeted reads do **not** replace the complete Epic E reconciliation. The existing [Admin gate](../qa/evidence/epic-f/2026-09-10-epic-e-admin-gate.json), run at 21:14 UTC, returned **exit 2 / admin_stale**. The September 3 snapshot expired at 17:52 UTC and lacks eight required datasets. No Epic E migration becomes executable.
- The connector schema rejected historical `Shop.shippingPolicy/refundPolicy/termsOfService` and `DeliveryProfile.coversAllItems` selections. Discovery omitted unsupported selections and inspected public policy routes instead. Existing Epic E scripts were left unchanged; its next complete audit must validate against its actual API version.

## Current architecture: extend and preserve

Only `templates/product.json` exists. It orders `main-product`, `disclosures`, and `related-products`. Main blocks are title, price, SKU, inventory, variant picker, quantity, buy buttons, description and share. There are no configured Product app blocks, Custom Liquid blocks, complementary-product blocks or Rhino Product sections. `config/settings_data.json` contains no configured app-embed blocks; this does not prove the absence of Admin-controlled apps or pixels.

| Surface | Current implementation | Epic F direction |
|---|---|---|
| Main Product | Trade `sections/main-product.liquid` | Extend through shared blocks/snippets; keep the default template functioning |
| Gallery | Trade media gallery, thumbnails, modal, video/model support | Retain responsive image/loading and keyboard behavior; improve assets and mobile space |
| Purchase | Trade `product-form`, `product-info`, variant picker, price, quantity, buy buttons | Reuse the same selected Variant/form IDs and native availability behavior |
| Inventory | Native inventory block; hides when inventory is not Shopify-tracked | Preserve distinction between orderability and stock/timing promises |
| Pickup | `buy-buttons` invokes native pickup component | Reuse only native supported state; no free-text seasonal fallback |
| Financing | Trade `form | payment_terms` inside the price block | Native Shop Pay messaging currently renders; separate visibility review from proposed financing CTA |
| Related products | Shopify recommendation endpoint and existing Product card | Generic recommendation is not compatibility evidence |
| Complementary products | Available Trade block, not configured | Do not populate from inferred fit or use as a second canonical relationship system |
| Disclosures | Native `shopify.disclosure` references and conditional section | Not an Epic E warranty/freight authority or generic technical-spec store |
| Collapsible content | Trade collapsible blocks available, not configured | Use semantic details only for secondary groups; hide empty groups |
| Sticky behavior | Desktop sticky information/media columns | No dedicated mobile sticky purchase bar; add one only if measured benefit justifies it |
| Description/SEO | Raw Product HTML plus native `product | structured_data` | Both currently expose unreviewed copy; address visible and machine-readable surfaces together |
| Global chrome | Existing header/footer/breadcrumbs, branding, tokens | Reuse Epic B/C contracts and hand global defects back to C |

Git comparison against `trade-15.5.0-baseline` confirms purchase/gallery snippets, Product JS and main Product CSS remain upstream. `main-product.liquid` has narrow quantity-label accessibility changes, a Theme Check annotation, and removal of unused SEO assignment code. `product.json` was customized to retain standard purchase controls and disable dynamic checkout. Do not clone upstream gallery/forms or reintroduce quick-order as the machine purchase path.

[ADR-0001](adr-0001-product-template-architecture.md) is **Proposed**, not accepted. Its major-class template direction fits the current evidence. No discovered machine has a structural need for a separate full JSON template: every machine has one `Default Title` Variant, and family sizes are separate Products. Family membership is optional, not a launch dependency or compatibility proof.

## Machine inventory and gaps

The [machine-readable inventory](../project/epic-f-machine-inventory.json) preserves exact IDs, source times, publication, routes, prices, options, media, description findings, native observations and each module's readiness. The [human-readable inventory/gap matrix](../project/epic-f-machine-page-gap-matrix.md) covers all 11 machines.

Current read: eight published machines; JadeMaster active/unpublished; SawMaster 36 and TumbleMaster draft. All use the default template, have one Variant, blank SKU/barcode, Vendor `Rhino Lapidary`, an Uncategorized Category and zero Product metafields. Current Product/metaobject definitions are also zero. These are September 10 observations, not perpetual claims.

The three approved Category inputs and approved Product class/naming decisions remain repository decisions pending separately authorized migration. Current native titles are observations, not a reason to reopen approved naming decisions or automatically rename Products during F.

## Epic E consumability and visibility contract

Epic E still has 22 prepared non-executable plans: 38 approved definition intents, 122 approved class inputs and three approved Category inputs. No approved population adapter/value set exists for the remaining migration domains. Consume the current E artifacts, not historical prose counts in earlier architecture sections.

| Product-page domain | Approved architecture | Current value/activation state | Safe interim behavior |
|---|---|---|---|
| Product class | `rhino.product_class` | All 122 approved; not migrated | Develop against explicit fixtures; no runtime title/tag classification |
| Machine family | `machine_family` reference/entity | No approved memberships or live instances | Native Product identity; omit family module |
| Key/full specs, electrical, water | Typed atomic Product fields | Definitions approved, no live values; technical decisions blocked | Omit unapproved rows and whole empty groups |
| Net/assembled/crate measurements | Separate typed fields and physical states | Human approval and migration pending | Omit values; do not reinterpret shipping weight as machine weight |
| Native shipping weight | Variant inventory measurement | Eight positive observations; three zero machine weights; corrections unapproved | Keep operational observations separate; no customer packing claim |
| Components | Exact included/optional/recommended lists, quantity map, noncatalog lines | All values blocked; EM-1 C-040 unresolved | No included-items list copied from HTML, manuals or media |
| Compatibility | Approved dependent-to-machine reference architecture | No approved edges; four blocked SawMaster edges remain blocked | Suppress fit assertions; neutral broader discovery handoff only |
| Fulfillment/pickup/region | E-PBI-015 contracts | Fulfillment field proposed; assignments/storage decisions incomplete | Native component state and verified neutral policy/contact routing only |
| Warranty/service | E-PBI-016 responsibility/evidence model | No approved Product mappings or general warranty route | Neutral Contact; no universal warranty or Vendor-derived manufacturer |
| Availability/timing | E-PBI-017 native observations and freshness policy | Current storefront state observed; timing authority unresolved | Native orderability/sold-out status; no lead-time promise |
| Manuals/diagrams/videos | Exact customer-visible File references and resource catalog | No approved canonical File mappings; live manual Pages are a separate route observation | Omit Product downloads; only already-governed, verified routes may be linked |
| Support Files | Approved definition with Admin-only access | Not a storefront source | Never render `support_files` through a customer resource module |
| SKU | Native Variant SKU, approved issuer scheme | Allocations proposed, none issued | Omit blank SKU; use exact native IDs internally |

Future rendering requires approved value authority, exact target identity, current/live reconciliation, successful applicable migration, valid typed value/reference, and permitted audience/lifecycle. A nonblank metafield alone is insufficient if an unaudited Admin edit could have populated it. E owns approvals and migrations; F owns the tested consumer boundary and suppression behavior. Repository JSON is not available directly to Liquid: the implementation must define a versioned, release-bound consumer eligibility artifact/adapter and its expiry/revocation behavior without creating a parallel approval authority or exposing evidence JSON. If current authority cannot be established, the affected fact module stays suppressed. Do not copy blocked values into theme settings, Custom Liquid, app blocks, static HTML or a new metafield.

## Candidate information hierarchy

1. **Identify and act:** native Product title/model, approved short purpose only when available, useful principal media, native price/availability, quantity and the normal purchase action; neutral Contact secondary action. Keep shipping-policy routing concise. Do not add key-spec placeholders above the fold.
2. **Judge suitability:** at most a small selection of approved key specs; then capabilities/approved narrative. The first screen must work when there are no trusted specs.
3. **Plan workshop and purchase:** full technical/setup information grouped as electrical/drive, working interface, water/fluid, and size/physical state; then clearly separated included and optional contents.
4. **Find contextual items:** approved accessories/consumables or recommendations with accurate labels. Hand full discovery to G.
5. **Prepare for delivery and ownership:** approved delivery/warranty information and current resources, with existing Contact routing. Hide empty subgroups and omit group navigation links when their destinations are absent.

These are customer tasks, not one section per master-backlog bullet. Candidate implementation uses the existing main Product plus roughly four reusable areas: suitability/setup, contents/contextual items, delivery/support, and resources. Split a section further only for independent ownership, data lifecycle or demonstrated layout need.

Mobile observations put the title below a nearly full-width image and the purchase button at y=742–786 px on a 390×844 viewport. The preview toolbar obscures part of that region; it is not customer storefront UI. Even without the toolbar, short screens require scrolling. Reduce the mobile media stage/vertical spacing while preserving the full machine, bring identity/action into a coherent reading order, and keep the technical detail below it. No new sticky JS is justified by discovery alone.

## Purchase and operational findings

- LapMaster 12/18 expose enabled Add to cart. Six other published machines expose disabled Sold out and Out of stock. JadeMaster/SawMaster 36/TumbleMaster routes return 404. No preorder, reserve, dedicated quote, alternate configured machine Variant, or purchasing-policy exception was evidenced.
- The existing cart architecture explicitly selects normal Trade purchase behavior. **High price does not change that decision.** Preserve native purchase controls when orderable and unavailable behavior otherwise; do not change stock or enable draft Products to make a fixture pass.
- Admin `availableForSale` is true on all 11 reads, including drafts. That field alone does not establish customer purchasability. All inventory-policy values are DENY; the LapMasters are untracked, while six published sold-out machines are tracked. Storefront eligibility, publication and selected Variant state matter.
- Current stock for the tracked machines is at Show Stock/Vejdi Booth, while the observed delivery profile location group contains only the zero-stock Cedarburg location. This is **consistent with**, not conclusive proof of, the storefront sold-out behavior. J/K and Admin own reconciliation of channel/location/rate behavior; F must not override Shopify eligibility.
- All 11 Variants belong to the same observed General profile. Its current domestic methods include $8 Standard, $15 Express and a $0 Standard condition at order total ≥$70; international carrier methods also exist. These are Admin observations, **not approved machine freight prices, free-shipping promises or destination eligibility**. No cart/checkout rate was requested. Hand this operational risk to the existing E/J/K owners rather than fixing configuration in F.
- The three current locations return null native pickup settings, and the Product pickup component renders no promise. Seven descriptions still claim Wisconsin year-round/Arizona Jan–Feb pickup. That copy cannot substitute for E-PBI-015 decisions.
- Shipping/refund policy routes return 200; `/pages/shipping` and `/pages/warranty` return 404. The shipping policy currently contains delivery-time, international-reach and detail-page-weight wording; do not paraphrase these into new Product promises. Existing neutral policy-route authority is distinct from authority for any individual statement.

## Specs and component presentation

Use a shared typed formatter for Key Specs and Full Specs. Candidate key fields are approved working diameter, input voltage/frequency, motor power and assembled size; choose only applicable, approved values, cap the summary, and omit it completely when none qualify. A diameter alone does not prove compatible tools or materials.

Use a semantic definition list for one machine's label/value facts, grouped with meaningful headings. A table is appropriate only for actual tabular relationships, with caption and row/column headers. Permit long labels/values to wrap on mobile; do not implement a comparison table. No empty rows, placeholder zeros, fabricated ranges or unknown-as-`N/A` labels.

Preserve source-approved units and distinctions: motor speed versus wheel/flex-shaft speed; input frequency versus rpm; blade versus wheel diameter/arbor; water reservoir versus oil fill; net versus assembled/crate/shipping state. Convert only under Epic E's approved convention; horsepower standard and US/Imperial gallon ambiguity remain blocked. A range requires matching source, configuration, physical state and unit. No unsupported operating footprint, package count or multi-package specification gets a new F field.

Included catalog items use `included_products` plus the exact-GID positive-integer `included_quantities` companion map. Noncatalog lines retain `included`, `not_included` and `optional` meanings. Recommendations remain independently approved merchandising. Never turn inclusion into fit, or fit into inclusion. The EM-1 description, manual and visible accessories do not settle C-040.

For contextual fit, E stores **dependent Product → machine Product**. A reverse view may derive only approved positive edges, without storing fabricated reciprocal relations. No runtime reverse resolver is evidenced in this theme. F must depend on a governed exact-ID reverse projection supplied through the shared F/G consumer contract, or suppress the module. Do not scan `collections.all`, tags or titles in Liquid. Direct optional/recommended lists are not that reverse fit resolver. G owns broader search, filtering, diagrams-based parts discovery and compatibility journeys; I owns later comparison.

## Warranty, resources, media and claims

There is no approved Product warranty/service mapping and no general warranty page. `support_files` is Admin-only. Keep a neutral Contact route; do not expose staff resources or invent a customer warranty object/field. Vendor is marketed brand, not legal manufacturer, issuer, administrator or repair provider.

The Manuals hub returns 200 but links to **seven 404 manual pages**. EM-1, ShapeMaster and TrimMaster manual Pages return 200. Publication alone does not approve their technical contents, current BOM, rights or canonical File status. F may use already-governed route links only after exact applicability/route checks; L owns repairing the broader directory. A working legacy Page is not an approved File download. Resource cards must eventually enforce exact model, current revision, language, rights, audience, accessible link name/file metadata and valid target. Omit internal/support-only/obsolete/superseded resources. Diagrams require useful text equivalents; videos require click-to-load, an approved poster, keyboard behavior and applicable captions/transcript.

All ten attached machine images have blank alt text; there are nine unique image GIDs because SawMaster 24 and draft SawMaster 36 share one. TumbleMaster has no image. EM-1 is 2489×2189; the other attached images are 1440×1440. Every published machine has only one image: no gallery proves rear connections, controls, workshop scale, packing or exact included contents. Current images show machine fronts/oblique work areas, often staged with stones/blades/attachments. None establishes inclusion or safe operating practice. No machine Product video exists in the read media lists.

The approved silent EM-1 homepage video is a **separate, surface-specific candidate for reuse**, not an approved Product File reference. Reuse the existing click-to-load implementation pattern after Product-surface approval; do not copy an eager iframe. Photography must follow B-018's shot list and existing Media/Brand review. Do not generate decorative imagery. The current EM-1 image includes patent wording; CE marks are visible on some machine photographs. A photographed mark is not certification evidence. Source/rights and exact-model review must precede a replacement/launch asset decision; do not conceal disputed claims through crops.

Applying the **unchanged** brand-claim rules to live description HTML produces **37 pattern/prohibited-wording matches across all eight published machines** (overlapping matches are not 37 distinct decisions). Findings include certification (SawMaster 18/24), patents (EM-1/SawMasters), torque and broad performance guarantees, BeadMaster speed claims and safe-packing claims. Additional review flags include rust guarantees, safety/user-error prevention, optional variable-speed wording, blade exclusion and shipping/pickup language. Those are inherited conflicts/claims, not newly approved facts.

Default brand validation scans theme/governed repository files and currently passes; it omits Admin Product description bodies. Product JSON-LD repeats the unreviewed descriptions. Plan a source-bound claims gate covering visible copy, metadata/social descriptions, JSON-LD, media labels and downloads. Suppression of raw HTML on the machine template does not, by itself, fix native structured-data leakage. Approved concise narrative can be prepared, but disputed assertions must be omitted rather than softened. Any later Product/SEO/media update requires separately authorized Admin scope and before/rollback evidence.

## Contact and financing boundaries

`/pages/contact` is a live native Shopify form with Name, Email, Phone number and Comment; it has no machine/Variant context fields. No dedicated quote process or Shopify Forms integration is evidenced. Reuse neutral Contact now. A future Product-aware handoff can propose an allowlisted context containing Product GID, optional selected Variant GID and relative Product route, validated against an exact identity source, visibly editable, and escaped. Query parameters must never establish price, fit, freight or identity authority. The native form currently does not consume such parameters. P owns intake, consent, spam/routing/retention/follow-up decisions; do not submit the form during discovery or build a second quote backend.

The first-screen browser inspection confirms native Shop Pay installment amounts via Trade `payment_terms` and `shop.app` scripts. The repository's proposed financing route remains blocked and there is no approved custom financing CTA. Obtain Business/Admin confirmation of the **existing native widget's** intended visibility/eligibility before adopting it into the machine layout. Do not copy its observed installment amount into theme copy or promise financing for all machines. This is a narrow new display-policy question, not authority to alter payment configuration or replace checkout with quoting.

## Responsive, accessibility and performance findings

All eight published pages were inspected at 390/768/1440 px. No horizontal overflow or axe violations were found in `#MainContent` in those 24 samples. Three representative pages also fit at 320 px under normal text sizing; media modal Enter/Escape, focus entry and return worked. No duplicate IDs were found in those supplemental pages. Native quantity controls expose a Product-specific accessible label.

Doubling the theme's root text size to 20 px at 320 px produced **355 px document width** on all three representatives. A further EM-1 probe found `#MainContent` remained 320 px: this is a document/global-chrome integration issue requiring attribution, not a proven broken spec table. Hidden share fallback content also needs open-state testing. This simulation does not certify actual browser zoom, screen-reader operation, touch-target compliance or all focus paths. Future F modules do not yet exist; their long-value/download/accordion tests are planned, not passed.

| Width | Published pages | LCP diagnostic range | Maximum observed CLS sum | Initial image bytes | Requests including preview/native widgets |
|---|---:|---:|---:|---:|---:|
| 390 | 8 | 560–1052 ms | 0.0135 | 14,763–32,679 | 195–220 |
| 768 | 8 | 440–604 ms | 0.0303 | 31,301–69,182 | 190–214 |
| 1440 | 8 | 596–916 ms | 0.0079 | 63,937–154,666 | 192–217 |

No observed long-task blocking contribution occurred during these initial sampling windows. Largest total transfer was 2,061,444 bytes. No initial machine video/autoplay was observed. Those fast lab loads do not certify the full budget: one unthrottled sample per route/width, preview toolbar traffic, cross-origin widgets and absence of interaction limit interpretation. Request totals exceed the existing global-chrome thresholds; `shop.app` is outside the budget's allowed-host suffixes. Attribute native payment/preview costs before changing code or asking for a budget exception. Do not claim a field INP result or numerical savings. [web.dev](https://web.dev/articles/vitals) distinguishes lab observations from field metrics.

Retain the approved [brand budget](../../data/brand-performance-budget.json) and [three-run/median policy](../qa/rhino-brand-media-performance-budget.md): LCP ≤2500 ms, CLS ≤0.1, Lighthouse TBT proxy ≤200 ms, mobile initial images ≤512000 bytes, desktop ≤921600 bytes, click-to-load videos, no new synchronous third-party script. A proper F harness must keep expired/missing metrics visible, separate 404 from Product samples, identify preview/native overhead, measure representative larger galleries and require owner-approved exceptions without weakening existing rules. Liquid/CSS/native behavior is the default; no carousel/sticky-library replacement is justified.

## Existing tests and proposed automation

`validate:product-templates` passes because class templates are optional; if a machine template exists it currently requires only title and price. The fixture register expects TrimMaster on `product.machine`, although the template is absent and current assignment is default. The generic Product smoke test exercises `simpleProduct`, not all machines. Cart tests exercise writes and were intentionally not run in this discovery. Generic axe, global-chrome, navigation and brand performance coverage exist, but do not prove F facts or assignment correctness.

Unchanged discovery checks: Product template/purchase architecture, default brand claims and static performance pass. CSV still fails with **95 missing-alt and eight nonpositive-price findings**. The eight handles remain `tumblemaster`, `saw-vice-plate-set`, `mr16`, `lapmaster-bolt`, `jademaster`, `automatic-feed-clamp`, `arbor-wrench`, `trim-saw-6`. Current Admin JadeMaster price is 2495, but that does not rewrite the historical CSV or its failing assertion. Launch fixture ownership still fails for `search`, `machineProduct`, `consumableProduct`.

Plan executable tests for approved class/assignment, native selected-Variant purchase states, missing/proposed/conflicting/expired fact suppression, wrong type/unit and mixed ranges, exact reference and audience checks, no HTML/tag/title fallback, module order and empty-section suppression, component meanings/quantity joins, 320–1920 px/zoom/keyboard, media alt, canonical download routes, click-to-load videos, visible and JSON-LD claims, price/CSV findings, three-run performance, and a complete machine-route matrix. Positive cases must use explicitly internal fixtures; never approve repository facts merely to obtain a green rendering test. Live cart tests require separately scoped later authorization and must not buy unavailable/draft Products.

Analytics must reuse the [existing ownership/migration model](../analytics/analytics-migration-verification-plan.md) and proposed event contracts. Native Product view/add-to-cart/checkout/purchase events need one owner. Candidate F-only interactions are neutral contact click, approved resource click, contextual item click and optional spec/disclosure expansion. Specify Product/Variant GID, module, approved resource ID and relative destination; never include customer PII or free-form inquiry text. No pixel, analytics library or custom event has been installed or emitted by F. U owns tooling/consent/duplicate-event verification; expansion counts alone do not demonstrate purchase confidence.

## Handoff and stopping point

The [artifact validation](../qa/evidence/epic-f/handoff-validation.json) passes: 71 consumed source hashes unchanged, 11 exact machine identities, 18 complete proposed PBI records, resolved local handoff links, 33 retained route/viewport observations, complete pagination within the targeted reads, and preserved CSV/fixture failures. The [evidence index](../qa/evidence/epic-f/README.md) records commands, limitations and generated artifacts.

The [decision packet](../project/epic-f-decision-packet.md) asks only narrow remaining design/commercial/media/measurement questions and links inherited E decisions instead of re-eliciting them. The [18 proposed PBIs and batches](../rhino-lapidary-pbi-tracker-epic-f.md) separate shell work, conditional feature work, Admin rollout and release approval. Every PBI remains **Proposed / not implemented**.

Cross-Epic owners: G contextual reverse-read interface and full parts discovery; J/K current location/profile/checkout and delivery risk; L manual directory and service/policy destinations; P owned contextual inquiry and any specialized quote flow; U analytics ownership; C global text-resize overflow; I comparison, M educational content and N reviews/projects remain post-MVP. O consumes stable ownership/resources later. F can link approved destinations but does not implement these broader experiences.

Next: review the proposed architecture and implement the foundation batch only after separate authorization. Human absence does not block source-bound fixtures, shell design or suppression tests. It continues to block facts and any activation requiring those facts. Production, preview publication, Shopify value/definition mutations and execution of Epic E plans remain unauthorized by this discovery.
