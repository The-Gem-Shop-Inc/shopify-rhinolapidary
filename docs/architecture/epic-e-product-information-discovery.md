# Epic E Product Information Architecture Discovery

**Epic:** E — Product Information Architecture  
**Discovery date:** 2026-08-28  
**Branch:** `dev` tracking `origin/dev`  
**Mode:** Repository audit plus read-only storefront observation; no Epic E implementation  
**Persistent preview theme:** `158631198917` (unpublished)  
**Production theme:** `158579622085` (main; read-only)  
**MVP boundary:** Epic O; Epics H, I, M, and N remain post-MVP

## 1. Executive Summary

The existing architecture is stronger than expected as governance and weaker than expected as implemented catalog data.

Strong, reusable foundations already exist for desired-state ownership, naming, machine-family identity, technical conflict preservation, product templates, filtering, media, claims, support resources, Admin change evidence, and preview-first release safety. At discovery time the repository had an unusually useful 39-row machine specification resolution register and a fully paginated 2026-08-20 Shopify Files audit. Batch 1 source analysis has since extended the canonical conflict register to C-001–C-041 without creating a competing register.

The current catalog does not implement most of that intent. A password-authenticated storefront observation on 2026-08-28 returned 119 published products and 122 variants. Product type is blank on all 119 products; 111 products have no tags; all 122 variants have blank SKU and barcode; 41 variants have zero or missing shipping weight; only one product has multiple variants; and 63 products expose technical facts in description HTML. The July 31 CSV snapshot has 122 products, no meaningful Shopify categories, no product types or tags, and fails the current product-data validator.

The proposed `rhino.product_class` and `machine_family` foundations are reusable, but the current string-list `rhino.compatibility` and JSON `rhino.machine_specs` proposals need to be superseded before implementation. Compatibility should use governed product references. Machine specifications should be atomic typed fields so facts can be validated, compared, migrated, and approved independently.

Discovery initially lacked an Admin token and preserved the 2026-08-28 Product Owner read-only handoff as external evidence. That limitation was superseded by the successful 2026-09-03 E-PBI-002 Admin API 2026-07 snapshot: 122 Products, 125 Variants, zero Product/Product Variant/Collection metafield definitions, zero metaobject definitions, 12 Collections, one delivery profile, three locations, one Market, and no query errors. Repository snapshots, external handoff evidence, and storefront observations remain distinct and dated.

## 2. Scope and Stop Condition

This artifact records discovery, recommendations, evidence gaps, and implementation handoff only. It does not authorize or perform:

- Shopify product, variant, collection, category, tag, SKU, barcode, weight, shipping, policy, metafield, metaobject, or Files changes.
- Theme or product-template implementation.
- Catalog migration or normalization.
- Epic F, G, H, I, J, K, L, M, N, O, or P implementation.

The corresponding backlog is in [the Epic E tracker](../rhino-lapidary-pbi-tracker-epic-e.md).

## 3. Evidence Sources Inspected

### Repository state and delivery architecture

- `package.json`, repository structure, current branch/status, recent commits, and theme environment configuration.
- `docs/Rhino Lapidary Storefront Backlog and Epics.md` and `docs/roadmap/rhino-mvp-sequencing.md`.
- `docs/rhino-lapidary-pbi-tracker-epic-d.md`, Epic D implementation records, release checklists, and finalization report.
- `docs/project/shopify-admin-change-evidence.md`, `docs/project/admin-change-record-template.md`, and `docs/admin/admin-dependency-register.json`.

### Product and custom-data architecture

- `docs/architecture/metafield-metaobject-architecture.md`.
- `docs/architecture/adr-0001-product-template-architecture.md`.
- `docs/architecture/adr-0002-collection-filtering-architecture.md`.
- `docs/architecture/cart-and-checkout-entry-architecture.md`.
- `data/product-data-rules.json`, `schemas/product-data-rules.schema.json`, and `scripts/validate-product-csv.js`.
- `data/metafield-metaobject-definitions.json`, its schema, and `scripts/validate-metafield-architecture.js`.
- `data/collection-filter-spec.json`, its schema, and `scripts/validate-filter-spec.js`.
- `templates/product.json`, `scripts/validate-product-templates.js`, and `scripts/validate-product-purchase-architecture.js`.
- `tests/fixtures/storefront-fixtures.json`, `data/launch-fixture-ownership.json`, and related validators.
- `data/product-export/products.csv` dated 2026-07-31.

### Identity, terminology, facts, claims, and legacy sources

- `docs/brand/rhino-product-naming-and-terminology.md`.
- `docs/brand/rhino-product-terminology-source-audit.md`.
- `docs/brand/rhino-machine-family-identifiers.md`.
- `data/product-name-normalization-proposal.json`.
- `docs/product/rhino-machine-specification-resolution-register.md`.
- `docs/brand/rhino-content-migration-rules.md`, `docs/brand/rhino-identity-architecture.md`, and `docs/brand/rhino-reassurance-microcopy.md`.
- `data/legal-claims-register.json` and `data/brand-content-migration-register.json`.
- The governed legacy source set under `docs/product/silica-gem/`: 22 XLSX files and 14 PDFs covering parts lists, ordering lists, exploded views, dimension drawings, pallet/crate data, and EM-1 material. These sources are evidence, not automatically current truth.

### Media, manuals, and support

- `data/media-manifest.json` and `schemas/media-manifest.schema.json`.
- `docs/media/media-asset-source-of-truth.md`.
- `docs/media/rhino-shopify-files-content-audit-2026-08-20.md`.
- `data/footer-support-resources.json` and C-PBI-019 support/manual inventory evidence.
- D-PBI-015, D-PBI-016, D-PBI-021, D-PBI-022, and D-PBI-025 handoffs.

### Current platform references

Official Shopify documentation was checked on 2026-08-28 for the current product taxonomy, product variants, inventory-item measurement/weight, metafield definition types, resource-reference metafields, metaobjects, Files references, and Storefront API access. Relevant references include:

- <https://shopify.dev/docs/api/admin-graphql/latest/objects/productcategory>
- <https://shopify.dev/docs/api/admin-graphql/latest/objects/productvariant>
- <https://shopify.dev/docs/api/admin-graphql/latest/objects/inventoryitem>
- <https://shopify.dev/docs/api/admin-graphql/latest/queries/metafielddefinitiontypes>
- <https://shopify.dev/docs/apps/build/metaobjects/data-modeling-with-metafields-and-metaobjects>
- <https://shopify.dev/docs/api/storefront/latest/unions/MetafieldReference>

## 4. Shopify and Store Evidence Inspected

| Evidence | Date | Source class | Scope | Limits |
|---|---|---|---|---|
| Epic D Admin current-state snapshot | 2026-08-20 | Live Shopify Admin captured previously through read-only GraphQL | Themes, menus, collections, machine collection, pages, policies, first Files page | Does not contain complete products, variants, definitions, metafield values, metaobjects, inventory, or delivery profiles |
| Full Shopify Files audit | 2026-08-20 | Live Shopify Admin captured previously, fully paginated | 867 Files plus association, alt, duplicate, format, size, and governance analysis | Reference coverage outside direct product media remains incomplete |
| Product CSV export | 2026-07-31 | Repository snapshot/export | 122 products, 125 rows, standard CSV fields | Stale; excludes current custom-data definition/value truth and differs from current publication state |
| Published product observation | 2026-08-28 | Password-authenticated storefront `/products.json` | 119 published products and 122 storefront-visible variants | Not Admin evidence; excludes draft/archived products, custom data, categories, delivery profiles, and full inventory state |
| Machines collection observation | 2026-08-28 | Password-authenticated storefront collection JSON | 8 published machine products | Collection membership is merchandising evidence, not canonical class or compatibility evidence |

Fresh Admin GraphQL was unavailable because no Admin access-token variable was configured and Shopify CLI had no stored app authentication. Credentials were never printed. No attempt was made to acquire new authorization or mutate Admin.

The 2026-08-28 Product Owner handoff is preserved at `docs/qa/evidence/epic-e/2026-08-28-product-owner-admin-handoff.json`. It reports zero Product definitions, zero Product Variant definitions, and zero metaobject definitions; Collection definitions were not queried. It also records that `jademaster`, `sawmaster-36`, and `tumblemaster` were inspected, but the exact returned statuses were not included in the handoff. These observations supersede the discovery-time “unknown” definition state as external evidence only; they are not represented as a newly reproduced Admin snapshot.

## 5. Quantified Current State

### Fresh storefront-exposed metrics — full published catalog, not a sample

| Metric | Result | Coverage |
|---|---:|---:|
| Published products | 119 | 100% of storefront response |
| Published variants | 122 | 100% of storefront response |
| Vendor `Rhino Lapidary` | 119 | 100% of products |
| Nonblank product type | 0 | 0% of products |
| Products with any tag | 8 | 6.7% of products |
| Tagless products | 111 | 93.3% of products |
| Products with multiple variants | 1 (`saw-blade`, four `Size` values) | 0.8% of products |
| Variants with SKU | 0 | 0% of variants |
| Variants with barcode | 0 | 0% of variants |
| Variants with positive weight | 81 | 66.4% of variants |
| Variants with zero/missing weight | 41 | 33.6% of variants |
| Products with technical terms in HTML | 63 | 52.9% of products |
| Products with blank description | 5 | 4.2% of products |
| Products with no product image | 25 | 21.0% of products |
| Published products in Machines collection | 8 | Observed collection set |

The eight published machine handles are `beadmaster`, `em-1`, `lapmaster-12`, `lapmaster-18`, `sawmaster-18`, `sawmaster-24`, `shapemaster`, and `trimmaster`. The current tags on these products are merchandising labels only: `Saw`, `Shaping`, and `Flat Lap`.

The July export contains three products not then published through `/products.json`: `jademaster`, `sawmaster-36`, and `tumblemaster`. The 2026-09-03 snapshot supersedes that uncertainty and captures their dated Admin status directly; future drift remains possible and requires rerunning the read-only audit rather than manual status reconstruction.

### July 31 export metrics — full export, stale baseline

| Metric | Result |
|---|---:|
| Products / rows | 122 / 125 |
| Meaningful Shopify category | 0; 84 blank and 38 `Uncategorized` |
| Product type / tags | 122 blank / 122 blank |
| SKU / barcode | 125 blank / 125 blank |
| Positive / zero variant weight | 81 / 44 |
| Products with technical terms in HTML | 64 |
| Products with blank description | 8 |
| Products with at least one missing image alt | 95 |
| Zero-price products | 8 |

`node scripts/validate-product-csv.js data/product-export/products.csv` fails for 95 products with missing alt text and eight zero-price products. The validator does not yet test category quality, class coverage, SKU/barcode uniqueness, weight coverage, variant consistency, reference integrity, or HTML-only facts.

## 6. Existing Automation Assessment

### Reusable now

| Automation | Result on 2026-08-28 | Reuse/extension assessment |
|---|---|---|
| `validate:registers` | Pass | Reuse schema-validation framework; add Epic E registers/schemas later |
| `validate:metafields` | Pass | Reuse cross-register checks; extend to full desired-state semantics and Admin drift |
| `validate:filters` | Pass, six planned filters | Reuse contract; H remains post-MVP and current sources need revision |
| `validate:product-templates` | Pass; specialized templates absent and optional | Reuse for F/G; absence is not an Epic E defect |
| `validate:product-purchase` | Pass | Reuse for J; normal purchase path remains intact |
| `validate:data-architecture` | Pass | Reuse aggregate pattern; current pass proves internal consistency only |
| `validate:fixtures` | Pass on required preview routes | Reuse live route/auth harness |
| `validate:media` | Pass with warning; 43 entries, 867 Files audited | Reuse governance; extend product/file relationship coverage |
| `validate:footer-support` | Pass; 19 resources, four globally safe | Reuse manuals/support inventory |
| `validate:brand-claims` | Pass; 16 claims, 14 blocked | Reuse claim gate for product migrations and F/L |

### Existing defects or missing enforcement

- `validate:launch-fixtures` fails before validation because it reads `tests/fixtures/storefront-fixture.json`; the repository file is `storefront-fixtures.json`.
- The metafield validator proves only that planned filters point to planned definitions. It does not prove definitions or values exist in Admin.
- The product CSV validator treats legacy tags as class authority and has no SKU, barcode, weight, category, relationship, or drift checks.
- No current read-only Admin catalog snapshot tool is represented in package scripts.
- No safe migration dry run, orphan reference check, HTML-fact report, or aggregate Epic E finalization runner exists.

These gaps are PBIs, not fixes in this discovery assignment.

## 7. Source Hierarchy for Epic E

| Fact class | Canonical authority | Repository role | Non-authority |
|---|---|---|---|
| Product/variant existence and commerce state | Current Shopify Admin product/variant record | Read-only snapshot and drift contract | Storefront absence alone for draft/archived conclusions |
| Product class and stable business identity | Approved Product Data register, then typed Admin field | Schema, allowed values, ownership, mapping | Tags, titles, or collection membership alone |
| SKU/barcode | Approved Product Data/Operations identifier source | Uniqueness and coverage rules | Agent-generated formats or title matching |
| Technical specifications | Current manufacturer/engineering evidence approved by Technical Owner | Fact register, provenance, conflict status | Description HTML, legacy catalog, or unit conversion alone |
| Compatibility | Approved product-to-machine relationship matrix | Canonical direction and reference validation | Similar title, family label, dimensions, tag, or collection |
| Shipping/freight | Current operations/shipping configuration plus approved physical facts | Governance and snapshot/drift evidence | Legacy policy copy or package estimates |
| Warranty/support | Approved policy/class and named business/legal/support owners | Class register and claim gates | Universalized legacy duration or contact copy |
| Manuals/diagrams/media | Shopify Files/product media after rights/version approval | Manifest, mapping, and reference governance | Theme assets or detached Files status alone |
| Lead time/availability | Current operational system or Admin availability process | Rule/owner documentation | Durable free-text product claim |

## 8. Product Class Taxonomy Analysis

| Proposed class | Current evidence | Current identification | Reliability | MVP effect | Migration need |
|---|---|---|---|---|---|
| Machine | Eight currently published products in Machines collection; 11 machine rows in naming proposal | Collection plus title/family names and sparse tags | Medium for observed eight; collection is not canonical | F, J, K, L, O, P | Yes—assign canonical class after full Admin audit |
| Replacement part | 15 rows in naming proposal; many part-like current titles and empty parts collections | Title/catalog context, occasional family name | Low to medium; exact-title proposal matches 15 current products | G, J, L, O | Yes—complete handle-level mapping and compatibility evidence |
| Consumable | 13 rows proposed historically, but only one current exact-title match; many wheel/disc/paste products remain unmapped | Title terms and merchandising context | Low | G, J, O | Yes—Product Owner/Product Data classification required |
| Accessory | Six proposal rows, four current exact-title matches | Title/catalog context | Low to medium | G, F, J, O | Yes—separate accessory from included component and replacement part |
| Kit/bundle | Backlog requires investigation; no reliable current class evidence | Possible titles/packs only | Unknown | G, J, O | Decision and audit required before defining launch class |
| Service/support item | No current product evidence; manuals are pages/Files | None | High evidence that current manuals are not products | L/P only if a future purchasable service exists | Do not create product class without actual product evidence |

The 45-row naming proposal contains 11 machines, 15 replacement parts, 13 consumables, and six accessories, but only 28 rows match current published titles exactly: eight machines, 15 replacement parts, one consumable, and four accessories. This is a matching metric, not proof that the other 91 published products are unclassifiable.

Recommended canonical class storage is a validated product metafield such as `rhino.product_class`. Product type can support Admin operations, but should not carry the complete business taxonomy. Collections remain merchandising membership; tags remain optional operational hints.

## 9. Current-State Gap Matrix

Abbreviations: `P` = product, `V` = variant, `MO` = metaobject, `PR` = product reference, `FR` = file reference, `RG` = repository governance. Currentness is `SF-28` for the complete 2026-08-28 published storefront observation, `CSV-31` for the complete 2026-07-31 export, and `ADM-20` for the prior 2026-08-20 Admin evidence.

### 9.1 Evidence, coverage, reliability, and conflict

| ID | Data concept / applicable classes | Current evidence and date | Current Shopify representation | Current repository representation | Coverage | Reliability | Conflict | Source owner |
|---|---|---|---|---|---|---|---|---|
| G01 | Title, handle, status, publication / all products | SF-28; CSV-31; ADM-20 sample | Standard Product | Export, naming proposal, fixtures | Published complete; Admin state partial | High for observed values | Three July products no longer published | Product Data/Admin |
| G02 | Shopify category / all sellable products | CSV-31 | 84 blank, 38 `Uncategorized` | No approved mapping | Missing | High for stale baseline | No category taxonomy decision | Product Data |
| G03 | Product type and vendor / all | SF-28, CSV-31 | Type blank; vendor uniform Rhino | Rules require columns only | Type missing; vendor complete | High | None on vendor; type strategy absent | Product Data/Admin |
| G04 | Canonical product class / all | SF-28 collections/tags; naming proposal | No verified typed class | Proposed `rhino.product_class`; legacy tag rules | Partial/unknown | Low outside eight machines and exact-title proposal matches | Tags/collections/title conflate roles | Product Owner/Product Data |
| G05 | Tags and collections / all | SF-28; ADM-20 | Sparse tags; merchandising collections, many empty parts collections | Filter/navigation registers | Partial | Medium for membership; low for classification | Preview/Admin route and membership drift possible | Merchandising/Admin |
| G06 | Family/model/admin identity / machines and dependents | Family register, naming proposal, 39 conflicts | Names/titles; no verified structured values | Approved family keys; proposed admin identifiers | Partial | Medium | Jade/SawMaster 36/TumbleMaster and model-size gaps | Product/Technical |
| G07 | Variant options / purchasable configurations | SF-28 | Only `saw-blade` uses four `Size` variants; all others default | Variant rules in naming/ADRs | Complete for published observation | High | Electrical/variable-speed distinctions unresolved | Product Data/Operations |
| G08 | SKU and barcode / all variants | SF-28, CSV-31 | 0/122 SKU; 0/122 barcode | No approved format/source | Missing | High | Uniqueness unknowable until values exist | Operations/Product Data |
| G09 | Inventory/purchasability / all variants | CSV-31; storefront availability only | Standard variant/inventory state | Purchase validator | Admin coverage unknown | Medium/unknown | Eight zero-price rows in stale export | Merchandising/Operations |
| G10 | Shipping weight / all shippable variants | SF-28 | Standard inventory-item/variant weight exposed as grams | CSV validator does not enforce coverage | 81/122 positive; 41 zero/missing | High for storefront-exposed value | Weight meaning/state not documented | Operations |
| G11 | Net machine weight / machines | Conflict register and legacy sources | Mostly HTML; no verified typed field | Conflicts C-005, 009, 015, 017, 021, 026, 031 | Partial | Low until state reconciled | Catalog vs pallet/drawing values | Technical/Operations |
| G12 | Assembled and package dimensions / machines, freight items | Drawings/workbook/HTML | HTML or nowhere; no standard per-product dimension fields observed | 39-row conflict register | Partial | Low to medium | Physical states mixed; SawMaster 36 probable typo | Technical/Operations |
| G13 | Voltage, phase, frequency / machines | HTML plus Turkish/English sources | HTML; no actual voltage variants observed | Conflicts C-004, 008, 014, 016, 020, 024, 029 | Partial | Low | 110 V vs 220/230 V may be market variants | Technical/Operations |
| G14 | Motor power/speed and optional speed / machines | HTML and technical sources | HTML only | Conflicts C-003, 007, 012, 013, 018, 019, 022, 023, 028 | Partial | Low | Multiple sellable motor packages unresolved | Technical |
| G15 | Wheel/blade/arbor/grit / machines and consumables | HTML, part lists, one Size variant | Variant only for saw-blade; otherwise HTML/title | Naming and conflict registers; proposed `grit` | Partial | Low to medium | Model size versus capacity; Q450/Q600 equivalence | Technical/Product Data |
| G16 | Water system/capacity / machines | HTML, pallet workbook, manuals | HTML only | Conflict evidence and legacy documents | Partial | Low to medium | Source/version/market not confirmed | Technical |
| G17 | Applications, materials, skill level / machines and consumables | HTML/legacy marketing | HTML/titles | Backlog only; claims rules | Partial/unknown | Low | Marketing wording can overclaim capability | Technical/Content |
| G18 | Included components / machines | HTML, parts lists, EM-1 material | HTML only | Conflict register and migration rules | Partial | Low | Included versus optional/purchasable unclear | Technical/Product Data |
| G19 | Optional components/recommended accessories / machines/accessories | HTML and proposal | Names only; no references | ADR proposal | Partial | Low | Optional speed/accessory/configuration conflated | Product/Technical |
| G20 | Compatibility, replacement parts, consumables / G ecosystem | Empty part collections, titles, part lists | No verified references; proposed string list only | Naming/family rules forbid inference | Missing/partial | Low | Name/tag/collection inference unsafe | Technical/Support/Product Data |
| G21 | Warranty class/duration / all | Legacy policy and claims register | Policy pages; no product mapping observed | Claims 007/008 blocked; microcopy source map | Missing product mapping | Medium for policy evidence, low for applicability | One-year and 90-day terms cannot be universalized | Legal/Business/Product Data |
| G22 | Freight/parcel/pickup / shippable products | Weight data, shipping policy, D021 | Policy/weight; delivery profile unknown | Claims 012/016 blocked; microcopy rules | Partial/unknown | Low without Admin/operations audit | Durable facts and temporary rates/timing mixed | Operations |
| G23 | Lead time/availability / all | Legacy copy and current availability | Availability; free-text timing not governed | Claims register blocks durable promises | Unknown | Low | Temporary state presented as durable fact risk | Operations |
| G24 | Assembly/safety/region restrictions / machines | Legacy copy/policies only | HTML/policy/market config unknown | Claims and migration rules | Missing/unknown | Low | Certification, safety, international claims blocked | Technical/Legal/Operations |
| G25 | Narrative and HTML-only facts / all | SF-28 | Description HTML | Migration/claim rules | 63/119 have technical terms; five blank | Medium as observation, low as authority | Many facts conflict with technical sources | Content/Product Data |
| G26 | Product media and alt / all | SF-28; ADM-20; Files audit | Product media/Files | Media manifest/source-of-truth | 25/119 no image; observed machine and Files alt empty | High | Association and rights/version gaps | Media/Product Data |
| G27 | Manuals and diagrams / machines/support | ADM-20 pages; Files audit; support register | Pages and Files; product references not observed | 19 support resources; legacy PDFs | Partial | Medium | Published/hidden/version/rights conflict | Support/Technical/Media |
| G28 | Video / machines/support | Files audit: 37 hosted videos | Files/media; product relations unverified | Media manifest queues | Partial | Medium for existence, low for approved relation | Duplicates, size, captions, rights, performance | Media/Technical |
| G29 | FAQ/support relationship / all | Pages/contact/manual routes | Pages only; no product relation observed | Footer support and identity governance | Partial | Medium | Support/warranty owner unresolved | Support/Business |

### 9.2 Importance, consumers, canonical destination, and blockers

| ID | Customer / operational importance | MVP consumers | Post-MVP consumers | Proposed canonical storage | Canonical authority | Migration / validation | Human evidence and blocker |
|---|---|---|---|---|---|---|---|
| G01 | H / H | F,G,J,O,P | H,I,M,N | Standard Product fields | Admin + Product Data | Snapshot/drift, uniqueness, route fixtures | Confirm current unpublished statuses |
| G02 | M / H | F,G,J | H,I | Shopify Product category | Approved taxonomy mapping | Category coverage/valid-node audit | Category mapping owner |
| G03 | L / H | F,G,J | H | Standard vendor/type; class remains separate | Product Data | Allowed-value/coverage audit | Decide product-type operational use |
| G04 | H / H | F,G,J,K,L,O,P | H,I,M,N | Validated Product metafield | Product Owner class register | 100% class coverage; allowed values | Classify unmapped catalog |
| G05 | M / M | F,G | H,M | Tags noncanonical; collections merchandising | Merchandising | Detect use as authority; membership drift | Collection purpose/owner |
| G06 | H / H | F,G,L,O,P | H,I,M | Machine-family MO reference plus stable product/model identifier | Product/Technical | Key uniqueness and referential checks | Model identifiers and blocked families |
| G07 | H / H | F,G,J,K,O | H,I | Product options/variants only for real purchase distinctions | Product/Operations | Option consistency and variant completeness | Electrical/configuration matrix |
| G08 | M / H | G,J,L,O | H,I | Standard Variant SKU/barcode | Operations/Product Data | Blank/duplicate/format checks | Authoritative identifiers; GS1 need |
| G09 | H / H | F,G,J,K,O | H | Standard variant/inventory fields | Operations/Merchandising | Price, availability, tracking/policy audit | Current Admin snapshot |
| G10 | H / H | J,K | H | Standard inventory-item weight | Operations | Positive weight for shippable variants | Confirm weight is packaged shipping weight |
| G11 | H / H | F,K,L | I | Product net-weight typed metafield | Technical | Unit/type/provenance validation | Resolve physical state conflicts |
| G12 | H / H | F,K | I | Typed dimension metafields; variant scope when packaging varies | Technical/Operations | Required dimension sets and state labels | Approved drawings/packing sheets |
| G13 | H / H | F,J,K,L,O | H,I | Product technical fields; Variant option + V fields only if purchasable | Technical/Operations | Range/unit/variant alignment | Market electrical configuration matrix |
| G14 | H / M | F,L | I,M | Atomic typed P/V metafields | Technical | Units, provenance, conflict-state gates | Current motor BOM/configuration |
| G15 | H / H | F,G,J,O | H,I,M | Atomic P/V metafields and options when purchasable | Technical/Product Data | Unit/controlled-value checks | Capacity and consumable specs |
| G16 | M / M | F,L | I,M | Atomic product fields; file/manual refs for procedures | Technical | Unit and source validation | Current system specification |
| G17 | M / L | F,G | H,I,M | Controlled-list metafields only after vocabulary approval | Technical/Content | Allowed values; claims scan | Product applicability evidence |
| G18 | H / M | F,G,J,L | I,M | List of PRs for sellable items; governed component entity only if justified | Technical/Product Data | Orphan/duplication checks | Approved in-box BOM |
| G19 | H / M | F,G,J,O | I | List of PRs; variants only for actual selectable configuration | Product/Technical | Relationship/type validation | Approved accessory/option matrix |
| G20 | H / H | F,G,J,L,O | H,I,M | Canonical dependent-product → list of machine PRs; reverse derived | Technical/Support | Orphan/class/self/duplicate checks | Handle-level compatibility matrix |
| G21 | H / H | F,J,L,O | N | Product → warranty-class MO; full terms in approved policy/page | Legal/Business | Class coverage and policy-link validation | Warranty issuer/classes/exceptions |
| G22 | H / H | F,J,K,O,P | H | Standard weights/profiles plus typed fulfillment facts; ops system for rates | Operations | Completeness and Admin drift | Freight class, packages, pickup rules |
| G23 | H / H | F,J,K,O | H | External operational state or native availability; not durable free text | Operations | Freshness/expiry checks if synchronized | Named system/process owner |
| G24 | H / H | F,J,K,L,O | H,M | Typed flags/controlled lists plus approved pages/Files/Markets | Technical/Legal/Operations | Allowed country codes, claims, file refs | Approved safety/assembly/region rules |
| G25 | H / M | F,G,L | H,I,M,N | Narrative in HTML; facts duplicated from structured source only | Product Data/Content | HTML-fact detector and drift comparison | Resolve conflicts before rewrite |
| G26 | H / H | F,G,L | H,I,M,N | Product media; Files for governed reusable assets | Media/Product Data | Alt/rights/orphan/association checks | Rights and alt ownership |
| G27 | H / H | F,G,L,O | M | List of FRs from product; RG stores provenance/version | Technical/Support | File existence, version, product mapping | Approve canonical documents |
| G28 | M / M | F,L | M,N | Product media or approved video FR; RG owns rights/captions/performance | Media/Technical | Association, duplicate, caption/poster checks | Approve videos and accessibility assets |
| G29 | M / H | F,G,L,P | M,N | Page/MO references only when reusable structured content exists | Support/Business | Route/reference and ownership checks | Support owner/process/response policy |

## 10. Material Conflict Audit

### Existing governed conflicts

The machine resolution register contains C-001 through C-039. It is the best current conflict source and must be reused rather than recreated.

| Conflict family | Affected entities | Sources in conflict | Resolution authority | MVP blocked |
|---|---|---|---|---|
| Voltage/market configuration | BeadMaster, ShapeMaster, TrimMaster, LapMaster 12/18, SawMaster 18/24 | Turkish technical rows at 220/230 V versus English/catalog at 110 V 60 Hz | Technical + Operations; current configuration matrix | F, J, K, L, O |
| Motor power/speed | BeadMaster, ShapeMaster, TrimMaster, LapMaster 18, SawMaster 18/24 | Parts/BOM rows versus catalog HTML | Technical; current sellable motor BOM | F, L; J/K if variant/fulfillment changes |
| Dimensions and weights by state | BeadMaster, ShapeMaster, TrimMaster, LapMaster 12/18, SawMaster 18/24/36 | Drawings, pallet/crate workbook, and catalog HTML | Technical + Operations | F, K |
| Blade/model/capacity representation | TrimMaster, SawMaster 18/24 | Product titles, `Q450/Q600`, inch sizes, and compatibility copy | Technical/Product Data | F, G, O |
| Optional variable speed | LapMaster 12/18 | Catalog option copy versus absence from cited part lists | Product/Technical/Operations | F, J, O |
| Missing product sources | SawMaster 36, JadeMaster, TumbleMaster | Catalog/pallet fragments with no complete current machine source | Product Owner + Technical/Business | F, G, K, L, O |
| Claims | EM-1 and machine catalog copy | Legacy certification, patent, torque, speed, safety, durability, packing, warranty, and international wording | Legal/Claims + Technical/Operations | F, K, L |

No agent-selected resolution is safe. Unit conversion does not resolve conflicting physical states or configurations.

### Catalog integrity conflicts

- The July export has 122 published/active products; the current published storefront has 119. Current Admin statuses for the three missing products are unknown.
- The repository says specialized machine/consumable templates are proposed, but current theme validation reports those templates absent and optional. This is not an implementation defect until F/G approves templates.
- The proposed `rhino.compatibility` string list conflicts with naming/family governance that requires explicit confirmed relations.
- `product-data-rules.json` makes tags the class gate, while the architecture documents say tags must not be canonical technical data.
- Current release artifacts still say the clean-preview keyboard/focus retest is pending, while the Product Owner supplied PASS evidence. This is an Epic D handoff documentation mismatch only; no Epic D file was changed.

## 11. Recommended Canonical Storage Model

| Domain | Scope/cardinality/type | Canonical destination | Why / owner / validation | Existing architecture disposition |
|---|---|---|---|---|
| Title, handle, status, publication, description, vendor, category, product type | P; scalar; standard types | Standard Product fields | Shopify-native commerce/admin fields; Product Data/Admin ownership; snapshot and allowed-value checks | Reuse |
| Price, SKU, barcode, inventory, requires shipping, taxable, selected options, shipping weight, variant media | V; scalar/standard | Standard Variant/InventoryItem fields | Commerce and fulfillment identity belong to purchasable variant; Operations/Product Data | Extend enforcement |
| Product class | P; one controlled value | `rhino.product_class` typed text with allowed choices | Business classification distinct from merchandising; Product Owner/Product Data | Reuse concept; supersede tag authority |
| Machine family | P; zero/one MO reference | `rhino.machine_family` → `machine_family` | Reusable identity across products and support resources; not compatibility proof | Reuse and extend |
| Stable model/admin identifier | P; one controlled text value | Product metafield plus RG identifier register | Needed for ownership/reordering independent of title; Product/Technical | Extend existing proposal |
| Technical specifications | P unless an actual variant differs; atomic typed values | Product/Variant metafields (`number_*`, `dimension`, `weight`, controlled text/list) | Field-level provenance, validation, display, and conflict state | Supersede opaque `machine_specs` JSON |
| Voltage/configuration | P descriptive only when uniform; V option + V field when purchasable | Product option and Variant metafields only for real configurations | Variant boundary follows SKU/price/inventory/fulfillment | Extend after evidence |
| Package dimensions | V where package differs; three typed dimensions per approved package state | Variant metafields; Shopify shipping package/profile and operational system remain fulfillment authority | Shopify native weight is not a full per-variant dimension model | New architecture PBI |
| Applications/materials/skill level | P; controlled lists | Product metafields after vocabulary approval | Cheap architecture now; H/M consumers later; no customer experience in MVP | Architecture now / consumer later |
| Compatibility | Dependent product; list of Product references | `rhino.compatible_machines` as `list.product_reference` | Exact, queryable relation; Technical/Support authority; reverse derived | Supersede string list |
| Replacement/consumable/accessory relationships | Machine/product lists only where semantics are curated recommendations or included items | List of Product references | Use references, not names; distinguish compatibility from recommendation and merchandising | Extend |
| Included components | Machine; list of PRs for catalog products | `rhino.included_products`; non-catalog component entity only if reuse justifies it | Avoid inventing products or sophisticated BOM metaobjects | Needs evidence/decision |
| Manuals and diagrams | P; lists of Files | `list.file_reference`; Files canonical, RG stores owner/version/rights | Keeps binaries out of theme repo and relationships explicit | Extend media governance |
| Videos | Product media or file reference; external video only when approved | Shopify product media/Files plus RG relationship metadata | Supports native media while retaining caption/poster/rights gates | Reuse/extend |
| FAQ/support resources | P; list of Page/MO references only when genuinely reusable | Shopify page or support-resource MO; RG ownership | Do not create metaobjects for one-off prose | Proposed, needs later evidence |
| Warranty | P; one warranty-class MO reference | Product → warranty-class MO; full terms in approved policy/page | Reusable multi-field/legal entity; avoids copied durations | New/extend claims architecture |
| Freight/parcel classification | P or V; controlled flag/class | Typed metafield plus native delivery profile/shipping configuration | Separate durable fact from rates, destinations, and policy | New architecture PBI |
| Lead time | Operational, time-varying | External operational system/native availability; synchronized field only with owner/expiry | Prevent stale promises | Supersede durable free text |
| Region restrictions | Product/variant rule plus market configuration | Markets/publication/shipping config; governed country-code list only if enforceable | Product fact and enforcement must agree | Needs Operations/Legal decision |
| Tags | Optional many strings | Tags only for temporary Admin workflows | No typed validation or referential integrity | Reuse only as noncanonical |
| Collections | Many memberships | Collections for navigation/merchandising | Membership is not class or compatibility | Confirm and reuse |
| Theme settings | None for product facts | Not appropriate | Theme settings are presentation, not product truth | Explicitly reject |

## 12. Variant Architecture Findings

- Current evidence supports retaining the existing four-size `saw-blade` variant architecture because `Size` is a purchasable distinction. Its variants still lack SKU, barcode, and positive weight.
- Current evidence does not support converting voltage, electrical configuration, machine size, motor package, or variable speed into variants yet. The sources suggest possibilities, not current purchasable configurations.
- Grit, diameter, arbor/mounting, and pack size should become variants only when they select a real inventory/SKU/price/fulfillment combination. The current catalog often models grits and wheel sizes as separate products.
- Descriptive specifications remain Product fields when all variants share them. Variant fields are required when a true purchasable configuration differs.
- No variant restructuring is authorized before the identity and configuration evidence PBIs are approved.

## 13. Relationship Model

The canonical compatibility direction should be dependent product → compatible machine products. Parts, consumables, and accessories list exact machine Product references. Machine-page reverse lists are derived at read/render time or materialized only by repeatable automation; they should not be independently hand-maintained.

Separate relations are required because they answer different questions:

- `compatible_machines`: technical fit, Technical/Support approved.
- `replacement_for` or successor: lifecycle relation, Product/Support approved.
- `included_products`: in-box contents, Technical/Product approved.
- `recommended_accessories`: curated recommendation, Merchandising/Product approved.
- Collection membership: navigation/merchandising only.

No relation should be inferred from family names, titles, tags, collections, matching dimensions, or a family icon.

## 14. Existing Architecture Disposition

### Confirmed and reusable

- Repository owns desired-state specifications; Admin owns live definitions and values.
- Standard Shopify fields precede metafields.
- Variant options represent actual purchasable distinctions.
- Tags are not authoritative technical data.
- Machine family is orientation, not compatibility proof.
- Product media stays in product media; manuals/diagrams stay in Files or approved external storage; theme assets are UI only.
- Admin changes require evidence and rollback.
- Claims, warranty, freight, and support language remain owner-gated.

### Reusable but needs extension

- `rhino.product_class`, `machine_family`, product-template ADR, collection/filter ADR, CSV validation, custom-data registry/schema, Admin dependency register, launch fixtures, media manifest, support register, naming proposal, and technical conflict register.
- Extend registry fields to include description, scope, cardinality, access, allowed values, validations, required classes, evidence owner, operational owner, customer visibility, MVP/post-MVP consumers, deprecation/replacement, and Admin definition ID/snapshot state.

### Implemented but incomplete

- Catalog descriptions, weights, media, manuals/pages, and collections exist, but structured classification, identity, compatibility, warranty, freight, and file relationships are missing or unknown.
- The product-data validator enforces a small subset and currently fails the stale export.
- The Files audit is comprehensive for existence but not for all cross-surface references.

### Proposed and not yet approved

- Specialized product templates, filter set, custom-data definitions, machine-family metaobject, and product-class values.

### Supersede before implementation

- `rhino.compatibility` as `list.single_line_text_field` → governed `list.product_reference`.
- `rhino.machine_specs` JSON → atomic typed fields, with temporary migration compatibility only.
- Tag-based class requirements → typed class field; tags remain noncanonical hints.

### Needs Product Owner or human decision

- Complete product-class mapping, stable identifier/SKU source, category/type strategy, actual variant configurations, technical conflict resolution, compatibility matrix, component BOMs, warranty classes, freight/package rules, lead-time owner, regional rules, and approved file relationships.

## 15. Human and Product Owner Evidence Requests

| Request | Exact question | Affected products/classes and current gap | Requested owner | MVP blocked | Workaround | Suggested evidence |
|---|---|---|---|---|---|---|
| E-REQ-001 | **Resolved.** Preserve drift monitoring for status/publication values. | The 2026-09-03 E-PBI-002 snapshot captures all 122 products, including `jademaster`, `sawmaster-36`, and `tumblemaster` | Admin audit execution owner | None | Continue scheduled/read-before-write audits | Regenerate the governed snapshot before a mutation |
| E-REQ-002 | **Resolved for classification.** `purple-jade-bead-strand` is a functional JadeMaster travel/auto-stop component and therefore `replacement_part`. | Batch 2B.1 Product Owner overlay approves all 122 classifications | Product Owner + Product Data | None for E-PBI-004; later Admin population still requires separate GO | Classification architecture complete; no fifth class invented | Edit only `data/epic-e-product-owner-decisions.json` through a superseding governed decision |
| E-REQ-003 | **Authority resolved; value population remains.** Rhino Lapidary's governed commerce SKU registry is the issuer, using opaque `RH-######` values scoped to sellable Shopify Variants. | 0/125 current Shopify SKUs; repository registry has 121 proposals, two semantic blockers, and two non-sellable deferrals | Product Data / Product Owner; Operations downstream | G,J,L,O | Repository architecture may proceed; SKU population remains unauthorized | Approve governed allocation rows, resolve two blocked collapsed products, then use a separately authorized mutation plan |
| E-REQ-004 | Reopen barcode governance only if a POS, scanning, fulfillment, marketplace, manufacturer GTIN, or label consumer emerges. | 0/125 current barcodes and no repository/operations consumer evidence | Operations/Product Data | None currently | Barcode remains optional | Consumer requirement plus issuer/standard and variant mapping |
| E-REQ-005 | For each current machine and market, which voltage, phase, frequency, motor power/speed, and optional configurations are actually sold, and which create variants? | Conflicts C-003/004/007/008/012-14/016/018-20/022-24/028-29 | Technical/Manufacturer + Operations | F,J,K,L,O | Keep facts blocked; no variants created | Versioned configuration matrix tied to model/SKU/market |
| E-REQ-006 | Approve assembled dimensions, net weight, package/crate dimensions, and shipping weight by physical state and sellable variant. | Conflicts C-005/009/015/017/021/026/031/034; 41 zero weights | Technical + Operations | F,K | Architecture and validation can proceed without values | Signed drawing/packing sheet with units, revision, model/SKU |
| E-REQ-007 | For every part, consumable, and accessory, which exact machine product/model/SKU is compatibility-approved? | No structured compatibility; names/collections unsafe | Technical + Support + Product Data | G,L,O and parts of F/J | Products remain purchasable only with neutral uncertainty handling | Handle-to-machine-handle relation CSV with evidence/revision |
| E-REQ-008 | What is included in the box, optional, and recommended for each machine? | HTML and part lists conflict or lack status | Technical + Product Owner | F,G,J,L | Omit claims until approved | Machine BOM with item status and catalog handle/part number |
| E-REQ-009 | Which variants are parcel/freight, what packages and weights apply, and what pickup/region constraints are enforced? | Delivery profiles/config unavailable; legacy promises blocked | Operations + Admin Owner | J,K,O,P | Safe neutral policy link only | Shipping profile/export, package sheet, region/pickup matrix |
| E-REQ-010 | Define warranty classes, duration/exceptions, issuer/administrator, repair/support owner, and approved policy linkage. | Claims 007/008/014 blocked; universal term unsafe | Business + Legal + Support | F,L,O,P | Generic neutral warranty link only | Approved policy/class matrix with product mapping |
| E-REQ-011 | Which manual, diagram, and video is canonical for each current product/model, with revision, rights, publication, captions, and obsolete status? | 867 Files; duplicates; incomplete product relations | Technical + Support + Media | F,G,L,O | Existing manuals index remains; no new product claims | File GID/URL mapping with version, rights, product/model |
| E-REQ-012 | Which system owns lead time and availability, how fresh must it be, and may storefront data expose it? | Legacy time promises blocked; no operational owner | Operations | F,J,K,O | Use native availability only | Process/SLA document and API/export if available |
| E-REQ-013 | Approve assembly, safety, supported-material, skill-level, and regional-restriction facts per class/product. | Current evidence is legacy/marketing and legally sensitive | Technical + Legal + Operations | F,K,L | Define fields now; leave values absent | Approved product data sheet or controlled mapping |

## 16. Downstream Dependency Map

| Epic | MVP status | Epic E dependency | Required before consumer starts? | Notes |
|---|---|---|---|---|
| F | MVP | Class, family/model identity, variants, technical/electrical/physical specs, components, freight, warranty, files | Yes for trustworthy machine-page implementation; shell/design work may start earlier | Do not render unresolved facts |
| G | MVP | Class, SKU/identity, compatibility, relationship direction, consumable/accessory/part distinctions, files | Yes | Compatibility is a hard blocker |
| J | MVP | Variant identity/purchasability, class behavior, shipping/freight and lead-time state | Yes for decision-critical cart behavior | Avoid warnings based on tags/names |
| K | MVP | Shipping weight, packages/dimensions, freight class, region/pickup and lead-time ownership | Yes | Product data is store-level; preview theme does not isolate mutation |
| L | MVP | Product identity, warranty class, support owner, manuals/diagrams, replacement relationships | Yes | Legal and business approval remains human |
| O | MVP boundary | Stable product/variant/model identity, machine ownership keys, compatibility, manuals, reorderable relations | Yes | Empty SKU is a major blocker |
| P | MVP if applicable | Product/machine identifiers and freight/warranty/support context for quote/inquiry forms | Only for forms that reference products | General contact can remain independent |
| H | POST MVP | Class/category/filterable typed fields | No, unless defining cheap durable fields now prevents migration debt | No filter UX in Epic E |
| I | POST MVP | Comparable atomic specs and approved conflict-free facts | No, except typed architecture now | No comparison UI in MVP |
| M | POST MVP | Applications/materials/manuals/support relationships | No, except durable field/file references now | No learning-center scope in Epic E |
| N | POST MVP | Warranty/claims/media relationship architecture | No, except legal-safe shared architecture | No reviews/social proof scope in Epic E |

## 17. Ranked MVP Risks

1. **Identity failure:** zero SKUs and no complete stable product/model identity block G, J, L, and O.
2. **Unsafe compatibility:** no explicit relationships block G and can cause incorrect orders/support outcomes.
3. **Conflicting machine facts:** 41 governed conflicts block trustworthy F and key K/L decisions.
4. **Physical-data gaps:** 41 variants have zero/missing weight; package dimensions and physical states are unresolved, blocking K.
5. **No reproduced current Admin truth:** the external handoff reports zero Product/Variant definitions and zero metaobject definitions, but exact product status, values, inventory, Collection definitions, delivery profiles, locations, and Markets have not been reproduced by the Batch 1 audit.
6. **Classification gap:** all product types are blank and most products lack reliable class evidence, blocking class-specific F/G/J behavior.
7. **Policy/owner gap:** warranty, freight, regional, lead-time, and support facts remain human-approval dependent.
8. **Media/file relationship gap:** 867 Files are audited but not safely mapped to products; all audited Files have missing alt.
9. **Architecture drift:** passing repository validators currently cannot detect whether Admin implements the desired state.
10. **Store-level mutation risk:** preview-theme testing cannot isolate product data, definitions, Files, collections, shipping, or policies.

## 18. Epic D Handoff Observation

The Product Owner supplied PASS evidence for keyboard/focus, 200% zoom, mobile/tablet/desktop/wide layout, hero crop/media judgment, and content/CTA clarity. The repository represents most visual items as passed, but `docs/release/epic-d-finalization-report.md`, `docs/release/release-signoff-checklist.md`, and `data/epic-d-homepage-nfr-readiness.json` still describe the clean-preview keyboard/focus retest as pending. There is no D-PBI-032 implementation record containing the newly supplied Vivaldi/Edge/Playwright details.

This is a documentation handoff observation only. Epic D was not reopened or modified.

## 19. Production Safety Statement

- Shopify Admin mutations: **No**.
- Production theme mutations or publication: **No**.
- Preview theme mutations: **No**.
- Product or variant data changed: **No**.
- Metafields or metaobjects created/modified: **No**.
- Collections, SKUs, barcodes, options, weights, shipping data, Files, policies, or compatibility relationships changed: **No**.
- Credentials, tokens, or passwords printed: **No**.

## 20. Files Created by This Discovery

- `docs/architecture/epic-e-product-information-discovery.md`
- `docs/rhino-lapidary-pbi-tracker-epic-e.md`

No other repository file is intended to be changed by Epic E discovery.

## 21. Batch 1 Implementation Supplement — 2026-09-02

This supplement records the approved implementation of E-PBI-001, E-PBI-002 tooling, E-PBI-003, E-PBI-018A, and E-PBI-019. It extends the discovery record; it does not replace the evidence classifications or authorize an Admin mutation.

### Source hierarchy hardening

`data/epic-e-source-governance.json` is the machine-readable companion to the hierarchy in this report. It covers commerce state, classification, identity, SKU/barcode, technical/electrical facts, physical/package facts, relationships/components, freight/shipping, warranty/claims, lead time, media/resources, and mutation evidence. Every later Epic E schema reuses the shared decision states `observed`, `proposed`, `approved`, `conflicting`, `blocked`, `deprecated`, and `superseded`. Existing claims, media, Admin evidence, terminology, and conflict registers remain authoritative within their domains.

### Read-only Admin audit

`scripts/audit-epic-e-admin.js` and its schema implement deterministic, paginated Shopify Admin reads for catalog, variant, custom-data, collection, delivery-profile, location, and Market evidence while excluding customer/order data. Dataset results distinguish `zero_definitions`, `inaccessible_scope`, `query_failure`, and `not_queried`. Fixture tests cover pagination, empty datasets, access failures, transport/query failures, broken cursors, and redaction. The query set was validated against Shopify Admin GraphQL API version `2026-07`. Execution remained blocked on 2026-09-02 because no Admin credential was available; the exact authorized command is recorded in `docs/qa/evidence/epic-e/2026-09-02-admin-snapshot-execution-blocker.md`.

### Technical evidence corpus

`data/epic-e-technical-source-index.json` indexes 110 relevant sources: 36 repository PDFs/XLSX files, all 37 generic documents from the complete Files audit, and all 37 hosted videos. Fifty-four sources were content-analyzed, 56 are metadata-only, none of the indexed URLs/paths were classified inaccessible during this pass, and six duplicate groups were preserved. The corpus records 19 candidate fact observations and 10 candidate compatibility/component relationship groups. Fact-level evidence supports or further documents C-002, C-005, C-009, C-015–C-018, C-021, C-023–C-026, and C-031; it contradicts values involved in C-002, C-017, C-023, C-024, and C-026; and it adds C-040/C-041 to the existing conflict register. No candidate is approved merely from filename, count, or legacy presence.

The corpus narrows E-REQ-003, E-REQ-007, E-REQ-011, and E-REQ-013 to owner confirmation of evidence-rich candidates. E-REQ-005, E-REQ-006, and E-REQ-008 remain genuine source conflicts, not requests to recreate the underlying documents. In particular, EM-1 instruction sources disagree on included wheel count/grits and water-reservoir capacity.

### Gap register and mutation safety

`data/epic-e-gap-conflict-register.json` contains generated metrics and governed gaps with explicit scope/currentness labels. Batch 1 originally preserved stale/subset labels because E-PBI-002 could not run; Batch 2A superseded that blocker with the successful 2026-09-03 full-catalog snapshot and regenerated metrics. `data/epic-e-admin-mutation-plan-template.json` extends the existing Admin change-evidence process with a schema/linter for deterministic inputs, allowlists, dry run, GO evidence, before/after state, rollback class, partial-failure recovery, idempotency, `userErrors`, throttling/resume, and drift checks. Unsplit E-PBI-022 or E-PBI-023 plans are rejected. No Admin or theme mutation was executed.

## 22. Batch 2A Implementation Supplement — 2026-09-03

The E-PBI-002 audit was successfully executed read-only against Admin API 2026-07 and preserved as `docs/qa/evidence/epic-e/2026-09-03-epic-e-admin-snapshot.json`. It contains 122 products and 125 variants without query errors. It reproduced zero Product, Product Variant, and Collection metafield definitions and zero metaobject definitions. The gap register was regenerated from this full-catalog snapshot.

`data/epic-e-product-classification.json` covers every snapshot product. After Batch 2B.1 decision reconciliation it records 122 approved class mappings and zero blockers using only `machine`, `replacement_part`, `consumable`, and `accessory`. The official Shopify Product Taxonomy 2026-08 audit has 79 specific candidates, 43 justified broad fallbacks, and zero unresolved rows. Product Type remains blank because repository search found no concrete consumer. Vendor remains native. Tags and collections remain noncanonical, and the legacy tag-authority rule is deprecated in `data/product-data-rules.json`.

`data/epic-e-product-identity.json` inventories Shopify GIDs, handles/titles, governed family/model aliases, legacy order/part-number candidates, and variant SKU/barcode state. No additional immutable Rhino business ID is justified. The 31 generated `admin_identifier` values in the older naming proposal remain discarded. Batch 2B.1 approves Rhino SKU authority and the opaque `RH-######` scheme; `data/rhino-commerce-sku-registry.json` covers all 125 variants with 121 proposed values, two explicit semantic blockers, two deferred non-sellable rows, and zero approved/populated commerce SKUs. Barcode remains optional because no operational/integration consumer was found.

## 23. Batch 3A E-PBI-009 Supplement — 2026-09-04

The canonical `data/metafield-metaobject-definitions.json` registry is upgraded to schema version 2 rather than replaced. It contains five Product metafield concepts and one metaobject concept: three approved desired definitions (`rhino.product_class`, `rhino.machine_family`, and `machine_family`), one proposed grit definition, and two deprecated legacy definitions (`rhino.compatibility` string list and `rhino.machine_specs` JSON). There are no Product Variant or Collection metafield definitions. Owner roles, consumers, applicability, access, validations, lifecycle, migration, and dated Admin reconciliation are now mandatory and executable.

Future E-PBI-010–018B domains appear only in a planned-domain dependency register; their keys and types remain unapproved. Native Product/Variant commerce fields are explicitly excluded from custom-data duplication. The generated read-only definition diff binds the registry and 2026-09-03 Admin snapshot by SHA-256 and reports three create candidates and three non-approved/deferred concepts against the observed zero-definition state. This is a dated observation, not a perpetual Admin claim, and does not bypass E-PBI-019 or authorize E-PBI-020.

`data/epic-e-commercial-configuration-candidates.json` preserves 22 evidence-rich decision groups for E-PBI-008: 11 machine-specific groups, the existing Saw Blade size variants, and ten current separate-product families with grit, side, size, profile, or pack distinctions. It does not equate conflicting specifications with sellable configurations and makes no variant decision or Admin change. Schemas, a deterministic builder, validator, and negative tests enforce Batch 2A locally rather than postponing enforcement to E-PBI-024.
