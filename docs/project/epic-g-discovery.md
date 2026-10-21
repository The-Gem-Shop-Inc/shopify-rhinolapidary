# Epic G discovery — Parts, Accessories, and Consumables

**Date:** 2026-10-15. **Status:** DISCOVERY_AND_PBI_GENERATION_ONLY. No G implementation, Shopify mutation, theme push, Product/Variant creation, or release signoff.
**Recommendation:** Keep Trade's ordinary Product template. Add approved forward-fit information, reuse F's reverse machine links, and provide a small role/reorder index on an existing route. Seven implementation PBIs, two optional contract PBIs, one deferred catalog PBI; see the [G tracker](../rhino-lapidary-pbi-tracker-epic-g.md).

## Authority and continuation

The feature-space authority is [Epic G in the master backlog](../Rhino%20Lapidary%20Storefront%20Backlog%20and%20Epics.md#epic-g--parts-accessories-and-consumables). The [active F handoff](implementation-records/epic-f-active-development-handoff.md) supersedes historical F tracker introductions claiming zero grants or no activation. The [MVP sequencing decision](../roadmap/rhino-mvp-sequencing.md) keeps O as the boundary; H/I/M/N remain post-O. After G, continue to **Epic J**, then the applicable K/L/O work; F closure is not a prerequisite.

Do not interpret older E relationship/component counts as live: those registers preserve candidate history. Consume current owner approvals, reconciliation, Product references, and publication independently. Product titles, descriptions, tags, productType, Shopify categories, collections and machine-family names do not authorize fit.

## Fresh evidence and limits

Evidence directory: [epic-g](../qa/evidence/epic-g/). Reads used the connected Shopify Admin query tool, schema discovery and its pre-execution validation flow; no CLI login, scopes or write command was needed. The validation helper returned “validation skipped”; the query tool performed execution-time validation and returned successful data. There were 13 Product pages of ten records or fewer, with complete nested connections, plus definitions/metaobjects, collections/Pages/menus/themes, ordinary template bodies, and all 45 bound MAIN runtime checksums.

The canonical shop is **gid://shopify/Shop/79279947973**, **sz5dnk-nf.myshopify.com**; its primary domain is **https://rhino-lapidary.myshopify.com**. No claim is made that RhinoLapidary.com DNS/public launch is complete. Browser observations used authenticated MAIN theme **158579622085**, not a local fixture or unpublished preview. The Chrome DevTools CLI was unavailable; the existing repository Playwright and axe dependencies provided the browser fallback.

Evidence files:

- [Admin Products](../qa/evidence/epic-g/2026-10-15-admin-products.json): exact Product/Variant GIDs, class, title/handle, description, options, SKU/barcode, prices, inventory tracking/quantity/policy, media, status/publications, suffixes, Rhino metafields and observed collections/tags/types/categories.
- [Definitions](../qa/evidence/epic-g/2026-10-15-admin-definitions.json), [routes](../qa/evidence/epic-g/2026-10-15-admin-routes.json), [MAIN files](../qa/evidence/epic-g/2026-10-15-admin-theme.json), [45 runtime checksums](../qa/evidence/epic-g/2026-10-15-admin-binding.json).
- [Derived discovery inventory and exact edge lists](../qa/evidence/epic-g/2026-10-15-discovery-summary.json): includes all 111 nonmachine identities, the 72 without compatibility, affected abrasive identities, zero prices and source comparisons.
- [Browser route observations](../qa/evidence/epic-g/2026-10-15-browser.json), [interaction observations](../qa/evidence/epic-g/2026-10-15-interactions.json). Discovery harnesses live alongside evidence; they are not G implementation or a production validator.
- [Owner decision packet](epic-g-required-decisions.md) contains only the six currently zero-priced sellable Products.

Bound F source **b90bf2089788e77c04fbdd5bd1766bc4d03cfb9e358179884a47b74095be949b** self-verifies; all local bound references match; all 45 MAIN source-file MD5s match local bytes. The Product JSON differs in raw serialization but is semantically equal. MAIN homepage JSON **differs semantically**: it has only the introductory section, whereas local D work includes additional sections/fallbacks. Do not claim local homepage fallback modules are currently live, or push the whole local homepage as incidental G work.

The release has **133 grants**, **83 assigned-page spec rows**, **27 EM-1 contents lines**, **39 compatibility grants representing 40 directed edges**, and **six approved machine image grants**. Existing factual receipt expiry is **2026-10-22T20:26:37.102Z**; this discovery read does not renew it. G must preserve that freshness/expiry model.

## 1. Catalog and ordinary Product-page verification

| Current class | Products | Variants | Active / Online Store published | Default template | With image media | Missing description | Approved fit Products / edges |
|---|---:|---:|---:|---:|---:|---:|---:|
| replacement_part | 54 | 54 | 54 / 54 | 54 | 37 | 3 | 28 / 29 |
| consumable | 39 | 42 | 39 / 39 | 39 | 37 | 1 | 4 / 4 |
| accessory | 18 | 18 | 18 / 18 | 18 | 13 | 1 | 7 / 7 |
| machine | 11 | 11 | 9 / 8 | 3; eight machine suffix | 10 attached; governed subset six | 3 | target class |
| Total | **122** | **125** | **120 / 119** | | | | |

All 122 class values match the approved E classifications. No class is inferred. The 111 nonmachines have 114 Variants; Saw Blade accounts for the three additional Variants.

All three G classes currently use **templates/product.json → sections/main-product.liquid**. It already configures title, price, SKU, inventory, native Variant picker, quantity, buy buttons, description/share, disclosures, and native Related products. Native dynamic checkout is disabled in this template. No concrete requirement justifies consumable/accessory/replacement-part templates. ADR-0001's class-specific templates were proposals, not an instruction to create them; G-PBI-001 should document the evidenced default-template decision without revising machine architecture.

Actual sampled behavior:

| Aspect | Replacement parts | Consumables | Accessories |
|---|---|---|---|
| Identity / price | Clear title and native price; Automatic Feed Clamp/Saw Vice sampled at $0 | Clear price; Saw Blade Size changes exact Variant and price | Clear price; Arbor Wrench sampled at $0 |
| Purchase | Native quantity and Add to cart; Water Guard correctly disables purchase as Sold out | Native quantity/Add to cart; all four Saw Blade options work | Native quantity/Add to cart |
| Description | Existing prose shown unchanged; some Products completely blank | Existing prose shown; Saw Blade has no description | Existing prose shown; Arbor Wrench blank |
| Media | Legacy attached media shown, or no-media layout | Existing media shown; two magnetic resin discs have none | Existing media shown, or no-media layout |
| SKU | No populated SKU; empty SKU container/accessibility label remains | Same | Same |
| Fit | No structured “Fits these machines,” including the two-machine clamp | None, including approved consumable relationships | None |
| Navigation | Direct-load breadcrumb is Home / Product; no class/machine return path | Same | Same |

Native Related products is observed recommendation output, **not** an approved optional/recommended relationship or proof of compatibility. Do not relabel those cards as fitting. Existing legacy description text is not a source for selector attributes or new fit claims.

The browser covers representative images, missing images, missing descriptions, approved/missing/unpublished-machine compatibility, multiple-machine fit, four native Size Variants, available and sold-out states. Automated evidence checks MAIN route state, Product identity, price, native controls, basic keyboard focus, overflow and axe. It does not prove successful checkout or manual screen-reader conformance.

## 2. Compatibility readiness and reverse feasibility

Canonical live representation: **rhino.compatible_machines**, **list.product_reference**, **PUBLIC_READ**. Thirty-nine exact Product values match the current approved F release grants. All targets are exact machine-class Products. Forty edges, no duplicate/orphan targets; **72 of 111 G Products have no approved relationship**. Absence means unknown, never incompatible.

| Exact machine target | Product GID | Edges | Customer destination today |
|---|---|---:|---|
| EM-1 | gid://shopify/Product/8905780756677 | 12 | Published; F already renders 12 reverse cards |
| SawMaster 18 | gid://shopify/Product/8905784131781 | 1 | Published; one existing reverse card |
| SawMaster 24 | gid://shopify/Product/8905784197317 | 1 | Published; one existing reverse card |
| JadeMaster | gid://shopify/Product/8905781248197 | 9 | Active/unpublished; withhold customer fit links |
| LapMaster 18 | gid://shopify/Product/8905781477573 | 7 | Published; seven existing reverse cards |
| TrimMaster | gid://shopify/Product/8905785344197 | 10 | Published; ten existing reverse cards |

**Automatic Feed Clamp**, gid://shopify/Product/8905779871941, fits both exact SawMaster Products under its approved two-reference value. This does not make fit generally symmetric. BeadMaster, LapMaster 12, ShapeMaster, SawMaster 36 and TumbleMaster have zero incoming approved edges. JadeMaster's nine edges remain approved data while its customer destination is withheld.

Reverse discovery is **already partly shipped**: F's owner release compiler projects dependent → machine fit into machine-page cards on five published machines, totaling **31 customer-visible edges across 30 distinct G Products**. G should expose/reuse that result and its machine-context entry points. It must not build a parallel graph or reverse it into a new technical assertion. A standalone all-machine parts landing page is unnecessary for MVP.

Safeguards: exact source/target GIDs and current handles; approved class, current owner grant and receipt; exact full live reference-list match; source/target publication; no inferred family expansion; expire/suppress stale facts; source removal/drift removes projection. F's EM-1 view already budgets 12 reverse products plus eight included catalog Product references, conservatively filling its 20-lookup budget. Do not add uncapped cross-machine lookups. Shopify documents a **20 unique handle** all_products limit; use collection traversal or bounded existing context instead ([official all_products reference](https://shopify.dev/docs/api/liquid/objects/all_products)).

**Saw Vice Plate Set**, gid://shopify/Product/8905784099013, has **no live fit references**. PO-E-013 anticipates an existing-product SawMaster 18 identity and a new SawMaster 24 identity, but the new GID is absent and technical differences remain pending. Both edges remain unavailable/deferred. Do not describe the unsplit item as fitting either machine. Its split is G-relevant catalog maintenance, not a prerequisite to the other 40 edges.

## 3. Routes and reorder: smallest useful destination

Fresh Admin finds 11 collections, 13 Pages, five menus. No aggregate G collections or dedicated parts Page exist.

| Existing route | Fresh behavior / representation | G use |
|---|---|---|
| /collections/all | 200, native general catalog | Smallest existing host for a narrowly scoped role/reorder index |
| /collections/em-1-parts | 200; 49 Products: 20 parts, 18 consumables, 11 accessories | Existing browse destination only; 37 members lack approved fit, so do not call all 49 compatible |
| /collections/trimmaster-parts | 200; zero Products | Do not advertise as useful parts discovery; machine page already has ten exact products |
| /collections/jademaster-parts | 200; zero Products | Do not expose an empty or unpublished-machine fit journey |
| /collections/18-lapmaster-parts | 200; zero Products | Prefer LapMaster 18's existing seven reverse links |
| /collections/blades-wheels | 200; 11 consumables; tag-based membership | Narrow browse link only, not all consumables and not fit authority |
| /collections/flexible-shaft-accessories | 200; 24 Products, of mixed governed classes | Optional existing browse link; name/membership does not prove exact fit |
| /collections/parts, /collections/replacement-parts, /collections/accessories, /collections/consumables | 404 | Observed candidates only, not approved destinations |
| /pages/parts-for-my-machine | 404 | Observed candidate only; do not publish this invented contract |

Actual MAIN menu is Home/Catalog/Saws/Laps/Shaping/Manuals/Contact; no G role or machine-parts path. MAIN homepage has Shop machines and Contact, no direct G Product link; the local D-PBI-016 Contact fallback is **not present on MAIN**. Integrate eventual G links through the existing navigation/route registers, with bounded live/preview parity review; do not deploy unrelated D modules.

Evaluate in the requested order:

1. Existing native routes: machine Product pages solve approved machine → parts; existing narrow collections do not cover every consumable.
2. Lightweight governed Page: possible later, but requires a new published Page identity; unnecessary today.
3. Machine-context links: prefer for “Parts for my machine”; five published target machines have usable results.
4. Small theme surface: recommended for simple anonymous reorder — **a class-grouped link index on /collections/all**, paired with concise navigation/homepage entry links. Proposed fragment IDs are implementation details to validate, not live approved routes. Retain native purchase pages and pagination; no new collection, Page, search service, faceting or account dependency.
5. Complex discovery platform: defer to H.

The role index must traverse actual current Product objects, validate governed class/identity, and cover all three roles without title parsing. Do not fetch 111 Products through all_products. Native collection pagination supports a page size up to 250, but ordinary unpaginated iteration can omit records; use explicit bounded pagination and test membership/completeness ([official paginate reference](https://shopify.dev/docs/api/liquid/tags/paginate)). Do not add a second conflicting pager, duplicate full image grids, or silently lose items when growth exceeds the current 122. Prefer a compact link list; decide pagination integration in G-PBI-005. This is a three-role index with machine-context links, not a new storefront filtering platform.

Reorder MVP is public Product/Variant links plus ordinary quantity/purchase. It does not need saved ownership, order history, subscriptions, SKU allocation, or a new Product. Preserve selected Variant URLs where useful; public Shopify numeric IDs must not be displayed as commerce SKUs.

## 4. SKU, inventory, price and commercial readiness

**SKU/barcode:** 0/114 G Variants have values; 0/125 catalog Variants have values. Native SKU blocks are configured already. E-PBI-007 established the approved issuer and opaque RH-###### scheme (PO-E-040/041), but the registry has **121 proposals, zero approved values, two blocked allocations, two deferred nonsellable allocations**. Do not expose proposed RH identifiers or legacy technical part aliases as issued SKUs.

MVP treatment: suppress the complete empty SKU row, show/select the native SKU when a real approved allocation exists, and let buyers/support share Product URL/title and selected Variant meanwhile. G-PBI-002 validates both blank and populated fixture states. E owns value approval/population; missing SKUs limit SKU-led reorder, not Product-link-led reorder or all of G. This explicitly narrows older E tracker language calling zero SKU coverage a universal blocker; the upstream policy is preserved, and any O integration requiring SKUs must settle that dependency then. No barcode is required by current PO-E-015.

**Inventory:** G has one tracked Variant (Water Guard), 113 untracked; inventoryPolicy DENY on all. Aggregate quantities are not a stock claim: 100 G Variants show quantity zero but untracked items can be orderable. Water Guard's aggregate quantity one / availableForSale true becomes **Out of stock / disabled Sold out on MAIN**. Use the native market/location-aware purchase state. Never create “low stock,” shipping dates, backorder permission or replacement intervals from aggregate quantity or Product class.

**Price:** six G Products have $0 Variants, all active/published and Admin-available. All six are directly observed with enabled Add to cart in the [targeted browser check](../qa/evidence/epic-g/2026-10-15-zero-price-browser.json). The [small decision packet](epic-g-required-decisions.md) lists exact identities and permits explicit deferral. The Product Owner must confirm intentional free sale, provide approved prices, or explicitly exclude/hold those exact items before claiming their commercial launch readiness. No automatic repricing or hold is authorized. This blocks the affected Product's readiness portion of G-PBI-006, not foundation, fit architecture or unrelated Products. Saw Vice's price decision is separate from its deferred split.

## 5. Attributes and B3B-D07

The 111 G Products have only **product_class** and, on 39 Products, **compatible_machines** in the Rhino namespace. G Variant metafields are empty. Optional/recommended/included/resource/family definitions exist but do not have G values.

| Candidate capability | Governed live state | Minimum upstream work | MVP disposition |
|---|---|---|---|
| Grit | No field/values; nine abrasive Products plus EM-1 in B3B-D07 | E/Technical approve grading system, unit/vocabulary, product vs Variant scope, mixed-grit/pack semantics, exact values and provenance; then create approved contract/definitions and migrate | Defer selector |
| Diameter | No G measurement field/values; machine blade/wheel dimensions exist | Distinguish sellable item diameter from supported machine range; approve units, scope and exact Product/Variant values | Defer cross-Product selector |
| Arbor/mount | No G values; machine blade/wheel arbor fields exist | Typed mounting geometry/thread/interface contract, units and scope; approved exact item values; preserve blade vs wheel meaning | Defer selector |
| Blade type | No governed type vocabulary/values | Technical closed vocabulary and per-item approval | Defer selector/education |
| Wheel type | No governed type vocabulary/values | Same, independently scoped | Defer selector/education |
| Saw Blade native Size | Existing four Variants: 6, 8, 14, 18 inches; exact Variant IDs/prices | No new field for the existing native option; test native selection | Preserve now; not a catalog-wide diameter filter |

Do not parse any candidate attribute from titles/descriptions/tags; do not copy machine operating dimensions onto sellable parts or infer fit from matching dimensions.

**B3B-D07** remains pending in the originating decision packet and blocked/temporarily unavailable in the E deferred handoff. It has not been approved by the later F electrical/tool-mount/BOM work. Exact affected Products:

| Product GID | Current title |
|---|---|
| gid://shopify/Product/8905778331845 | 6 in Bonded Diamond Wheel, 220 grit |
| gid://shopify/Product/8905778430149 | 6 in Bonded Diamond Wheel, 80 grit |
| gid://shopify/Product/8905778659525 | 6 in Magnetic Hard Disc, 80 grit |
| gid://shopify/Product/8905778757829 | 6 in Magnetic Resin Bond Disc, 220 grit |
| gid://shopify/Product/8905778823365 | 6 in Magnetic Resin Bond Disc, 600 grit |
| gid://shopify/Product/8905778921669 | 6 in Resin Bond Diamond Wheel, 1200 grit |
| gid://shopify/Product/8905778987205 | 6 in Resin Bond Diamond Wheel, 280 grit |
| gid://shopify/Product/8905779052741 | 6 in Resin Bond Diamond Wheel, 3000 grit |
| gid://shopify/Product/8905779118277 | 6 in Resin Bond Diamond Wheel, 600 grit |
| gid://shopify/Product/8905780756677 | EM-1 Machine |

It blocks **future structured grit semantics/selectors**, not displaying existing titles, buying existing Products, approved fit, or anonymous reorder. The existing separate Products remain intact. Keep this out of the immediate owner packet.

## 6. Media, descriptions, resources and families

- G has **88 image attachments on 87 Products**, all 88 Admin alt fields blank. Twenty-four G Products lack media: 17 parts, two consumables, five accessories. Existing legacy nonmachine media is allowed by F's consumer routing; six governed machine image grants are a separate scope, not the total G gallery entitlement. [Dedicated geometry evidence](../qa/evidence/epic-g/2026-10-15-media-browser.json) confirms visible loaded primary images on the sampled wheel/flat lap and visible primary Saw Blade media; hidden thumbnails are not counted as broken visible images. The configured native lightbox toggle buttons have **0 × 0 geometry** on these samples. G-PBI-002 should establish usable native image interaction or an intentional plain-image state, without a new gallery system.
- Five descriptions are blank: Arbor Wrench, Automatic Feed Clamp, LapMaster Lap Bolt, Saw Blade, Saw Vice Plate Set. Exact GIDs, missing-media rows and full inventory are in the discovery JSON. No demand for catalog-wide marketing copy or new images.
- Rendering must collapse missing media/description/fit/resource modules safely. Actual absence of description + image + useful SKU leaves the clamp difficult to identify; its approved fit is higher value than a marketing rewrite.
- **Zero G manual_files/diagram_files/instruction_files/video_files/support_files values**; no approved G resource links can ship today. The E catalog's 110 indexed resources / 74 File identities / zero canonical approvals are historical corpus counts, not fresh Files approval. B3B-D06 and F/L resource contracts still require exact canonical File, Product association, current revision, audience, rights and publication approval. Do not expose support_files as customer instructions.
- Machine-family definition is public, but fresh Admin has zero machine_family metaobjects and no Product family references. Group only by exact published machine identity; no family expansion.
- Included Products/quantities and noncatalog components are currently an EM-1 machine BOM concern; preserve the 27 approved lines, eight exact catalog member references and their quantities. Inclusion is not a G fit grant or recommendation. optional_products and recommended_products are defined but unpopulated; no approved recommendation edges were discovered. Do not invent relationship metaobjects: native Product-reference architecture already covers MVP.

## 7. Actual UX gaps and validation limits

Highest value gaps are: no ordinary-page structured fit; hidden G entry/reorder paths; empty legacy machine-parts collections despite usable exact reverse links elsewhere; blank SKU announcements and no commerce values; the six zero prices; missing identity media for some items and zero-size configured lightbox controls; generic Related products alongside no fit evidence.

Thirty-five initial route/viewport observations include eight G Product samples at 390/1440, existing/404 destinations, homepage, EM-1 and TrimMaster. Twenty main-region axe runs have zero violations. Twelve completed interaction cells add 360/390/1440 coverage for Water Guard sold-out, native Saw Blade selection/prices, complete-document axe and text enlargement; all 12 full-document axe runs have zero violations. Six targeted zero-price cells and three media geometry cells bring discovery to **56 browser observations**. The first two interaction attempts encountered harness locator issues (duplicate transient labels and a hidden media control); evidence is retained and the harness targets visible controls on rerun. Locator failures alone are not classified as storefront defects; the separate media probe establishes the zero-size configured control concern. No successful lightbox interaction is claimed.

No baseline horizontal overflow was found. **200% root-text testing reveals a global header height increase (63 → 558px at 360px)** even when there is no horizontal overflow; the enlarged brand wraps heavily. Treat this as a specific shared-chrome readability/focus follow-up for C consumed by G-PBI-007, not proof of full accessible reflow or a reason to reopen F signoff. Baseline screenshot is [automatic-feed-clamp-baseline](../qa/evidence/epic-g/mobile-automatic-feed-clamp-baseline.png); the earlier mobile clamp screenshot is a **200% text** capture. Automated axe alone cannot certify this behavior.

The raw DOM price text contains hidden Sale/Sold out labels. Visible native purchase state and the rendered price are authoritative for the observations; do not count hidden text as a contradictory visible sold-out state. Tests do not add to cart, place orders, change inventory, or access customer accounts. Successful checkout belongs to J.

## 8. Current-state gap matrix

Legend: I = IMPLEMENT_PRE_MVP; C = PREPARE_CONTRACT_ONLY; D = DEFER_POST_MVP; N = NOT_NEEDED. Each row names Shopify representation, repository support and exact gating condition. “No” under required means G can reach its MVP outcome without that feature.

| Source G feature | Current state | Customer value | Data readiness | Shopify representation | Repository support | Exact blocker | MVP required? | Disposition | Owner / PBI |
|---|---|---|---|---|---|---|---|---|---|
| Ordinary Product detail | Existing native purchase works; blank fields remain | Identify/buy item | Native data present; six prices unresolved | Default Product/Variant | main-product, native blocks | Conditional empty-row behavior and targeted commercial review | Yes | I | G-002/006 |
| Compatibility selectors | Exact machine relationships on 39 Products | Find item for known machine | 31 published-target edges usable | compatible_machines refs | F reverse compiler/cards | Ordinary-page/entry wiring absent | Yes, narrow exact-machine links only | I | G-003/004 |
| Fits these machines | Missing on G pages | Confirm approved fit | 40 approved edges; nine target-unpublished | list.product_reference | F/E grants and guard conventions | Forward renderer/approval and publication gates | Yes | I | G-003 |
| Parts for my machine | Five machine pages already list exact products | Reach existing compatible items | Existing 31 visible edges | Machine Product pages | F owner context shards | Discoverable entry/anchors and empty handling | Yes | I | G-004/005 |
| Machine-to-part relationship metaobjects | No such model needed | Relationship integrity | Existing exact refs sufficient | Product metafield, derived reverse | E references/F projection | None requiring a new metaobject | No | N | Preserve E/F |
| Consumable reorder | Ordinary Product buying works; no role entry | Repeat public purchase | 39 consumables/42 Variants | Existing /collections/all and Product URLs | Native forms; D/C route registers | Role index/entry not implemented | Yes | I | G-005 |
| Grit selectors | No approved field/value | Technical narrowing | B3B-D07 pending | Future E governed attribute | Candidate packet only | Grading system/mixed pack/scope/value approval | No | C; selector D | G-008 / E, H |
| Diameter selectors | Machine facts; no G facts | Choose exact dimensions | Existing Saw Blade Size only | Native option today; future item dimension | E typed machine fields | Per-item scope/units/value approvals | No, preserve Size | C; selector D | G-002/008 / E, H |
| Arbor/mount selectors | Machine blade/wheel facts only | Avoid wrong interface | No G item contract/values | Future typed item/interface values | E tool-mount contracts | Geometry/thread/item scope and approvals | No | C; selector D | G-008 / E, H |
| Blade-type education | Legacy prose only | Understand exact item | No governed vocabulary | Product prose/resources if approved | Existing description renderer | Technical approval for new claims | No | D | M; exact item instructions L |
| Wheel-type education | Same | Understand exact item | No governed vocabulary | Same | Same | Same | No | D | M / E |
| Comparison tables | No G-specific need proven | Broader buying choice | Not required to buy known part | Future content/tool | I deferred | Comparative authority/tool outside scope | No | D | I |
| Replacement intervals | No approved values | Maintenance scheduling | Unsupported | Future governed claim | E state model only | Technical usage/lifetime authority | No | D | L / M |
| Recommended quantities | Only exact included quantities for EM-1 | Plan extra purchases | No recommended quantity approval | Existing included_quantities ≠ recommendations | F BOM distinct meanings | Recommendation source/value approval | No | D | G later / E; J if cart upsell |
| Multipacks | No approved new commerce requirement | Bulk purchase | No pack/unit/price mapping | Future approved Product/Variant | E Variant policy | Commercial unit/stock/pricing approvals | No | D | G later / J |
| Bundles | No approved bundle setup | Combined purchase | No required architecture | Future bundle commerce | No active G bundle | Composition/price/inventory policy | No | D | G later / J |
| Frequently bought together | Native Related products only | Cross-sell | No approved recommendations | recommended_products empty | F separates meanings | Owner relationships; cart behavior | No | D | H/J |
| Subscriptions | Not implemented | Repeat delivery | No operational/commercial justification | Future selling plans/app | None required now | Terms, fulfillment and billing feasibility | No | D | G later / J/O |
| Back-in-stock alerts | Native Sold out only | Availability notification | No approved app/process | Future app/process | Native sold-out works | Owner/process/consent choice | No | D | G later / P/J |
| Low-stock indicators | One tracked G Variant; aggregate misleading | Urgency/availability | Inadequate for new claims | Native inventory only | Existing inventory block | Location/policy truth; no urgency policy | No additional feature | N | Preserve native / J,K |
| SKU visibility | Block exists, no approved values | Support/reorder identity | 0/114 values; scheme approved | Native Variant.sku | main-product SKU block, E registry | Empty-row behavior; allocation approval separately | Yes when populated; safe blank now | I | G-001/002; E population |
| Technical drawings | No approved G reference | Installation/identity | B3B-D06 unresolved | diagram_files | Existing F/L resource contract | Exact canonical File/revision/rights/audience | No | C; activation later | G-009 / L,E |
| Installation instructions | No approved G reference | Correct assembly | Same | instruction_files | Existing resource architecture | Same, plus exact Product applicability | No | C; activation later | G-009 / L,E |
| QR on machines | No implementation | Direct future fit route | Route contracts must stabilize | Physical code → existing URL | G route/identity handoff | Physical rollout/URL lifecycle | No | D | G later / L,O |
| QR in manuals | Same | Contextual repeat visit | Manual/version route unapproved | Canonical manual/URL | L resource contracts | Canonical resource + URL lifecycle | No | D | L |
| Saved ownership | Not a G capability today | Personalized parts | Identity handoff possible | Future account ownership | E exact identities | O account/ownership design | No in G | C handoff only | O |
| Quick reorder from history | No G implementation | Repeat past order | Native Variant identity retained | Future authenticated orders | Existing Product links | O order/history/access policy | No in G | C handoff only | O |
| Workflow accessory kits | No approved kit | Simplify setup | No composition/commerce approval | Future kit commerce | E relationships distinguish roles | Owner kit contents/price/stock | No | D | G later / J |
| Starter kits | Same | Initial setup | Same | Same | Same | Same | No | D | G later / I,J |
| Maintenance kits | Same | Routine upkeep | Same; no intervals | Same | Same | Same | No | D | G later / L,J |
| Machine-specific setup kits | Same | Machine setup | Compatibility alone insufficient | Same | Same | Exact kit composition/commerce | No | D | G later / I,J |
| Product media | 87/111 have attached images; all alt blank | Identify item | Legacy attachments exist | Native Product.media | Existing legacy class routing | Targeted meaningful identity/alt review | Safe media/no-media required | I behavior; polish D | G-002/007; E media owner |
| Optional/recommended relationships | Defined, no G values | Suggested extras | No current approvals | optional_products/recommended_products | E/F semantics | Exact owner values | No | D | H/J; E authority |
| Broad search/filter/collection platform | Existing native generic catalog | Broad discovery | Outside G | Native Search & Discovery etc. | H backlog | Explicit post-O sequencing | No | D | H |
| Catalog-wide normalization/new Products | Existing 111 sufficient for most journeys | Maintenance | Not essential to core journeys | Admin catalog | E governance and split preparation | Exact future business dependency | No | D | E/G maintenance; G-010 split |
| Data/route/browser validation | F/E tools exist; no G-specific coverage contract | Avoid false fit and broken paths | Sufficient current evidence | Read-only audit + theme tests | Reuse existing harnesses | Future implementation of G assertions | Yes | I | G-001/007 |

## 9. Minimal outcome, batches, risks and owner work

Required before G MVP handoff: approved current-source/class/relationship gate; safe default Product detail and SKU blank state; forward “Fits these machines”; discoverable existing machine reverse paths; anonymous role/reorder entry; explicit handling of the six price decisions; scoped mobile/accessibility/native purchase regression.

Not required: a new template, collection tree, relationship metaobject, new machine/part Product, account, subscription, bundle, filter platform, kit, QR rollout, approved grit vocabulary, complete media/copy corpus, or F signoff.

Proposed **10 PBIs**: **001–007 IMPLEMENT_PRE_MVP**, **008–009 PREPARE_CONTRACT_ONLY** (optional parallel handoffs, not G release blockers), **010 DEFER_POST_MVP** (Saw Vice split). The other commercial ideas remain explicit matrix deferrals; they are not padded into implementation tickets.

| Batch | PBIs | Dependency / useful deliverable |
|---|---|---|
| G1 foundation | 001 | Fresh-source, approval, role, drift, inventory/SKU/media evidence contract; planning only here |
| G2 Product + fit | 002,003 | After 001; native empty-state/SKU behavior and exact fit on existing default page |
| G3 discovery/reorder | 004,005 | 004 consumes 001/003 plus existing F reverse output; 005 consumes 001/004, existing routes and C/D registers |
| G4 commercial + integrated QA | 006,007 | 006 targeted price decisions may run in parallel from G1; 007 validates completed 001–006 without requiring deferred features |
| Contract preparation | 008,009 | Optional, bounded E/L/H/O handoffs; never delay G2/G3 |
| Deferred catalog | 010 | Explicit split authorization and exact new identity later; no G hard dependency |

Highest risks: **G-003** can assert false fit if approval/publication/expiry are weakened; **G-005** can become H or exceed Liquid/pagination limits; **G-006** cannot certify six zero-priced Products without a real owner decision; **G-007** must distinguish aggregate Admin availability, visible native state and text-enlargement usability. G-004's risk is duplicating F or exceeding existing lookup budgets; reuse is the mitigation.

**First implementation batch:** G1 / G-PBI-001 only. Start from this fresh evidence, encode assertions and a current drift refresh, record the default-template decision, and retain F history. Then G2 provides the first customer-visible improvement. Do not start with visual polish or a catalog cleanup campaign.

Immediate human decisions: only the six-item zero-price group. No decision on grit, diameter, mount, SKU allocation, family population, content, bundles or Saw Vice creation is needed to begin the core G batch. A user answer is not presumed from time elapsed. For any later launch-dependent omission, require an explicit scoped disposition; the planner has not applied a hold.

## 10. Explicit downstream handoffs and parked F work

- **H after O:** generic filters/facets, Search & Discovery/predictive search, sorting/merchandising, full collections, global recommendations and eventual attribute filters. G provides exact relationship/role contracts and existing routes.
- **O:** saved machine ownership, account-aware parts and history reorder; carry Product/Variant/machine GIDs, current eligibility/availability, URL/Variant identity, approval/freshness, and unknown/deleted/unpublished behavior. Do not build ownership/account state in G.
- **E:** optional future item attributes, approved SKU value allocation/population, exact compatibility approvals, resources and machine families. No second registry/graph.
- **J:** native cart/checkout validation, pricing outcomes, future pack/bundle/cart upsell/subscription commerce. G only preserves native controls and records affected rows.
- **K:** location/market availability, shipping/freight/pickup; aggregate stock does not authorize a fulfillment claim.
- **L:** current canonical instructions/drawings/manuals, installation/support and future maintenance/QR-manual work.
- **C/D:** bounded links and route registration; shared header text enlargement; MAIN/local homepage parity. No full homepage/chrome rollout in G.
- **I/M/N after O:** broad comparison/buying guidance, education and conversion/social proof respectively.
- **P/U:** future alert consent/process and measurement ownership; no new app, messaging or analytics installation.
- **F-PBI-008B Saw Vice split/two edges:** deferred/G-relevant only. **LapMaster variable speed** and **40-gallon TumbleMaster** remain deferred catalog enhancements, not G blockers.
- **F-PBI-014B future media/resource states:** consume only when real states appear. **F-PBI-015B** remains BLOCKED_MEASUREMENT_INTEGRITY / PARKED_RELEASE_GATE. **F-PBI-018B** remains NOT_READY / deferred final F signoff. None was executed or reopened.

## 11. Stop condition and evidence status

This package recommends work; no PBI is implemented or marked complete. It is neither an F closure nor an MVP release certificate. Evidence validation and final write accounting are in [validation.json](../qa/evidence/epic-g/validation.json). No Shopify mutation or theme push occurred; no Products, Variants, collections, Pages, metaobjects, bundles, subscriptions, QR or account features were created.
