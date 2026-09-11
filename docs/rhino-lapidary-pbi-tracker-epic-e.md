# Rhino Lapidary Epic E PBI Handoff Package

**Epic:** Epic E — Product Information Architecture  
**Source backlog:** [Rhino Lapidary Storefront Backlog and Epics.md](Rhino%20Lapidary%20Storefront%20Backlog%20and%20Epics.md)  
**Discovery:** [Epic E Product Information Architecture Discovery](architecture/epic-e-product-information-discovery.md)  
**Created:** 2026-08-28  
**Status:** Epic E architecture and migration planning substantially complete; live migration and human-owned value closure deferred. Batch 4A completed 2026-09-09; E-PBI-025 is NOT complete.
**MVP boundary:** Epic O; H, I, M, and N are post-MVP

## Current Batch 4A status — 2026-09-09

| PBI | Current scope status |
|---|---|
| 001–012 | Complete at established architecture/governance scope; field/value approval remains distinct |
| 013 | Evidence complete / human compatibility approval blocked |
| 014 | Architecture complete / BOM and component values blocked |
| 015 | Architecture complete / operational assignments blocked |
| 016 | Architecture complete / Legal/Business/Support values blocked |
| 017 | Architecture complete / Operations timing decision blocked |
| 018A | Complete |
| 018B | Architecture complete / canonical resources and rights blocked |
| 019 | Complete; current hashes, freshness, rollback and per-plan GO validation extended |
| 020 | Planned: 38 approved definition intents / mutation unauthorized |
| 021 | Five independent plans: 122 class values, 3 approved Category values; remaining candidates excluded / mutation unauthorized |
| 022 | Eight bounded domain plans; approved value sets empty / mutation unauthorized |
| 023 | Eight bounded domain plans; approved value sets empty / mutation unauthorized |
| 024 | Complete: aggregate repository, Admin, migration and reference gates with adversarial tests |
| 025 | NOT COMPLETE: applicable migration execution, after-state checks and human approvals outstanding |

[Batch 4A implementation and validation](project/implementation-records/e-pbi-024-batch-4a.md) · [Reviewer handoff](project/epic-e-deferred-decision-handoff.md) · [Domain-level downstream readiness](project/epic-e-downstream-readiness.md)

Historical batch summaries below retain their dated scope; the table above is the current project status.

## Agent and Admin Safety Rules

1. Read the assigned PBI, discovery report, dependencies, and listed evidence before editing.
2. Product data and custom data are store-level. The preview theme does not isolate Product, Variant, Collection, Files, policy, shipping, metafield, or metaobject mutations.
3. Do not mutate Admin until the PBI explicitly permits it and records a read audit, before snapshot, exact scope, deterministic input, dry run, Product Owner/Admin approval, rollback, post-mutation validation, after snapshot, and drift plan.
4. Never infer specifications, compatibility, SKU, barcode, warranty, freight, lead time, safety, region eligibility, included contents, or support promises.
5. Preserve unresolved source values. A unit conversion or title match is not conflict resolution.
6. Use standard Shopify fields before custom data; typed atomic fields before JSON; references before names; metaobjects only for reusable multi-field entities.
7. Keep tags and collections noncanonical unless a PBI explicitly proves a narrower operational purpose.
8. Do not implement F/G/J/K/L/O/P customer experiences within an Epic E PBI.
9. No production theme or store publication is authorized by this tracker.

## Epic E Outcome

Epic E establishes a governed, measurable product-data foundation so later MVP work can identify products and variants, display approved machine facts, validate compatibility, prepare shipping/freight behavior, link warranty/support resources, and support ownership/reordering without relying on titles, tags, collection membership, or description HTML.

## September 3 Evidence Snapshot — Historical Baseline

- Current read-only Admin snapshot (2026-09-03, API 2026-07): 122 products and 125 variants; deterministic audit completed with no query errors.
- Product type: blank on all 122 products. Shopify taxonomy category: 81 blank and 41 explicitly `Uncategorized`, therefore zero meaningful assignments.
- SKU and barcode: blank on all 125 variants.
- Shipping weight: 81 positive and 44 zero/missing variants.
- Variant architecture: one multi-variant product (`saw-blade`, four Size values).
- Technical terms occur in 63 product descriptions.
- July export: 122 products, no meaningful Shopify categories, 95 products with missing image alt, eight zero-price products.
- Machine specification register: 41 conflicts/decisions after E-PBI-018A added C-040/C-041 without resolving them.
- Shopify Files audit: 867 Files, 867 missing alt, 95 directly associated with current product media.
- The 2026-09-03 snapshot reproduces zero Product, Product Variant, and Collection metafield definitions and zero metaobject definitions. It also records 12 collections, one delivery profile, three locations, and one Market.

## Approved Batch 1 Status

| PBI | Status | Executable evidence |
|---|---|---|
| E-PBI-001 | Complete | `data/epic-e-source-governance.json` and validator |
| E-PBI-002 | Complete | Read-only audit plus validated 2026-09-03 live Admin snapshot, schema, and pagination/error/redaction tests |
| E-PBI-003 | Complete for 2026-09-03 evidence | Machine-readable gap/conflict register regenerated from the current snapshot |
| E-PBI-018A | Complete | 110-source corpus/index, direct document/spreadsheet/drawing analysis, schema, validator |
| E-PBI-019 | Complete | Mutation-plan schema/linter, template, and negative tests; no mutation executed |

## Batch 2B.1 Final Status — 2026-09-04

| PBI | Status | Remaining human decision |
|---|---|---|
| E-PBI-004 | Complete | 122 Product Owner-approved rows, zero blocked: 11 machine, 54 replacement part, 39 consumable, 18 accessory |
| E-PBI-005 | Governance complete; Category/Vendor population not authorized | 79 specific taxonomy rows, 43 justified broad fallbacks, zero unresolved; 11 unambiguous Vendor corrections proposed and zero ambiguous |
| E-PBI-006 | Complete | None for the identifier architecture; a new Rhino business ID remains unjustified |
| E-PBI-007 | SKU governance/authority complete; population not authorized | Rhino issuer and opaque `RH-######` scheme approved; 121 initial registry values proposed, two semantic blockers, two draft/non-sellable deferrals, zero approved/populated values |
| E-PBI-008 | Complete | No current restructure decision; future alternate machine configurations require independent commerce evidence |

`data/epic-e-product-owner-decisions.json`, `data/rhino-commerce-sku-registry.json`, and `data/metafield-metaobject-definitions.json` are human-owned governance surfaces. Generated classification, identity, Vendor, configuration, variant-architecture, and custom-data diff evidence consumes them. `requiredTagsByProductClass` remains deprecated. E-PBI-009 remains complete. Batch 3B status and evidence are recorded below; architecture approval does not approve Product data values.

## Batch 3B Status — 2026-09-08

| PBI | Repository status | Remaining owner work |
|---|---|---|
| E-PBI-010 | Architecture complete | atomic technical architecture; all conflicting values remain unapproved. |
| E-PBI-011 | Architecture complete | physical-state architecture; custom measurement values and missing native weights remain owner-blocked. |
| E-PBI-012 | Architecture complete | canonical exact-reference model and enforcement; no fit values populated. |
| E-PBI-013 | Evidence complete / human-blocked | 111 dependents covered, 42 candidate edges (38 proposed, 4 blocked), zero owner-approved. Human review acceptance remains open. |
| E-PBI-014 | Architecture complete | C-040 BOM values and optional/recommended decisions remain unapproved. |
| E-PBI-018B | Architecture complete | canonical File/version/rights decisions remain owner-blocked. |

[Full implementation, counts, validation and ranked decisions](project/implementation-records/e-pbi-010-014-018b-batch-3b.md). The canonical registry contains 40 Product metafields, zero Variant metafields, and one metaobject; 38 approved architectures, one proposed grit concept, and two deprecated definitions.

## Full Epic E Backlog

| PBI | Title | Priority | Effort | Implementation mode | MVP consumers | Depends on |
|---|---|:---:|:---:|---|---|---|
| E-PBI-001 | Establish the Epic E source hierarchy and decision-state contract | P0 | S | Repository/code | F,G,J,K,L,O,P | — |
| E-PBI-002 | Build and run a complete read-only Admin catalog snapshot | P0 | L | Mixed read-only | All MVP consumers | 001 |
| E-PBI-003 | Create the measurable catalog gap and conflict register | P0 | M | Repository/code | All MVP consumers | 001,002,018A |
| E-PBI-004 | Approve the canonical product-class taxonomy and catalog mapping | P0 | M | Product Owner/business evidence | F,G,J,K,L,O,P | 002,003 |
| E-PBI-005 | Govern category, type, vendor, tags, and collection roles | P0 | S | Measurement/governance | F,G,J | 002-004 |
| E-PBI-006 | Audit existing identifiers, then define stable product/model/family identity only where needed | P0 | M | Mixed | F,G,L,O,P | 003,004,018A |
| E-PBI-007 | Define SKU governance and conditional barcode requirements | P0 | M | Mixed | G,J,L,O | 002,004,006 |
| E-PBI-008 | Approve product-versus-variant configuration rules after technical evidence | P0 | M | Mixed | F,G,J,K,O | 002,004,006,007,018A |
| E-PBI-009 | Upgrade the desired-state custom-data registry and schema | P0 | L | Repository/code | F,G,J,K,L,O | 004-008 |
| E-PBI-010 | Define atomic machine technical and electrical fields | P0 | L | Mixed | F,J,K,L,O | 006,008,009 |
| E-PBI-011 | Define net, shipping, and package measurement architecture | P0 | L | Mixed | F,J,K | 008-010 |
| E-PBI-012 | Define canonical compatibility reference architecture | P0 | M | Repository/code | F,G,J,L,O | 004,006,009 |
| E-PBI-013 | Generate and approve the parts, consumables, and accessories relationship matrix | P0 | L | Mixed automation + human evidence | F,G,J,L,O | 004,006,007,012,018A |
| E-PBI-014 | Model included, optional, and recommended components | P1 | M | Mixed | F,G,J,L | 004,006,009,012 |
| E-PBI-015 | Define freight, shipping, pickup, and regional product data | P0 | L | Mixed | F,J,K,O,P | 002,004,008,011 |
| E-PBI-016 | Define warranty, service, repair, and support relationships | P0 | L | Mixed | F,L,O,P | 004,006,009 |
| E-PBI-017 | Separate lead time and availability from durable product facts | P1 | M | Measurement/governance | F,J,K,O | 002,008,015 |
| E-PBI-018A | Build the machine technical evidence corpus and source index | P0 | L | Repository/code + read-only Shopify Files evidence | F,G,J,K,L,O | 001,002 |
| E-PBI-018B | Define product-to-manual, diagram, video, and support references | P1 | L | Mixed | F,G,L,O | 002,006,009,018A |
| E-PBI-019 | Establish the safe Admin mutation and migration playbook | P0 | M | Repository/code | All MVP consumers | 001-003 |
| E-PBI-020 | Create approved custom-data definitions in Admin | P1 | M | Shopify Admin | F,G,J,K,L,O | 009-019, PO GO |
| E-PBI-021 | Migrate canonical class and identity fields | P1 | L | Mixed | F,G,J,L,O | 004-009,019,020 |
| E-PBI-022 | Populate approved technical and physical facts — split into bounded mutation domains before authorization | P1 | XL | Mixed | F,J,K,L | 010,011,015,019-021 |
| E-PBI-023 | Populate approved relationships/files/warranty/freight — split into bounded mutation domains before authorization | P1 | XL | Mixed | F,G,J,K,L,O,P | 012-018B,019-021 |
| E-PBI-024 | Add aggregate Epic E data-quality and Admin-drift gates | P0 | L | Repository/code | All MVP consumers | 003-019; each source PBI owns its local enforcement |
| E-PBI-025 | Run aggregate Epic E QA and Product Owner finalization | P0 | M | Measurement/governance | F,G,J,K,L,O | 020-024 |

## Downstream Dependency Table

| Epic | MVP status | Epic E dependency | Required before consumer starts? | Blocking Epic E PBIs | Notes |
|---|---|---|---|---|---|
| F | MVP | Class/identity, variants, technical/electrical/physical facts, components, freight, warranty, files | Yes for trustworthy content population | 004,006,008-11,014-18B,020-23 | Layout exploration can precede final values; customer facts cannot |
| G | MVP | Class, SKU, compatibility, relation matrix, file/diagram links | Yes | 004,006,007,009,012-14,018A,018B,020,021,023,024 | Compatibility is critical path |
| J | MVP | Variant identity, class behavior, weight/freight, lead-time ownership | Yes for decision-critical behavior | 004,007,008,011,015,017,021-24 | No tag/title-derived warnings |
| K | MVP | Shipping weight, packages/dimensions, freight/region/pickup rules | Yes | 011,015,017,022-24 | Admin shipping config remains operational authority |
| L | MVP | Stable product/model identity, warranty class, support/files/parts relations | Yes | 006,007,012,016,018A,018B,021,023,024 | Legal/business evidence remains human |
| O | MVP boundary | Stable product/variant/machine identity, compatibility, manuals, reorderable products | Yes | 006,007,012,018A,018B,021,023,024 | Zero SKU coverage is a major blocker |
| P | MVP if applicable | Product/machine references for product, quote, freight, warranty, repair, or parts forms | Only for product-aware forms | 004,006,015,016,021,023 | General contact can remain independent |
| H | POST MVP | Class/category and typed filterable fields | No unless shared architecture prevents debt | 004,005,009,010 | No discovery/filter UX in Epic E |
| I | POST MVP | Atomic comparable specs and approved conflicts | No unless shared architecture prevents debt | 009-11 | No comparison UX in MVP |
| M | POST MVP | Applications/materials/manual/support relationships | No unless shared architecture prevents debt | 009,010,018B | No learning-center expansion in Epic E |
| N | POST MVP | Warranty/claims/media architecture | No unless shared architecture prevents debt | 016,018B | No review/social-proof scope in Epic E |

## Provisional Development Batches

These are planning recommendations only. They do not authorize Admin writes or PBI implementation.

### Batch 1 — Current truth, technical evidence, and mutation safety — implemented

**PBIs:** E-PBI-001, E-PBI-002, E-PBI-003, E-PBI-018A, and E-PBI-019.

Why together: later classification, identity, variant, technical, physical, and relationship decisions need one state vocabulary, reproducible Admin truth, mined source evidence, measurable gaps, and an enforceable mutation gate.

The initial credential blocker was superseded by the successful read-only 2026-09-03 Admin run: 122 products, 125 variants, zero custom-data definitions in every queried owner type, and no query errors. The 2026-08-28 handoff remains historical evidence only.

Modes: repository/code, read-only Admin, Product Owner/business evidence. No writes.

Batch validation: schema-validated source/index/gap/mutation artifacts, deterministic Admin pagination/error tests, official Shopify 2026-07 GraphQL validation, negative mutation-plan fixtures, and full-catalog metrics from the checked-in snapshot.

### Batch 2A — Classification, identity, and SKU governance — repository implementation complete

**PBIs:** coordinated E-PBI-004/005 and E-PBI-006/007 only. E-PBI-008 was not implemented; its governed decision packet was produced as a dependency handoff.

Why together: classification and Shopify mechanism roles are one planning unit; identity must audit existing model/part/SKU/GID/legacy identifiers before adding any new Rhino ID; SKU remains P0 while barcodes stay conditional; variant decisions consume the new technical corpus.

Blockers: row-level classification/taxonomy approval, SKU source ownership, and owner confirmation of consequential commercial-configuration questions. The E-PBI-002 run is no longer blocked. No Admin definitions or values were created.

Modes: repository/code plus technical/operations evidence.

Batch validation: schemas and tests enforce the closed class vocabulary, evidence-aware complete mapping, taxonomy audit identity, noncanonical tag/collection roles, GID/alias identity, SKU case/duplicate/blank rules, prohibited derived SKUs, and optional barcode state.

### Batch 2B — Approval ingestion, integrity repair, and variant architecture — implemented

> Historical 2026-09-03 state; conflicting decision conclusions are superseded by Batch 2B.1 below.

**PBIs:** E-PBI-004 through E-PBI-008. E-PBI-009 was not implemented.

The governed Product Owner overlay approves 121 classifications and the single explicit catalog-scope block. Generation now derives Saw Blade option text, prices, and weights from the same Admin records; semantically validates conflict family associations; preserves current 6/8/14/18 Size variants; preserves CONFIG-013–022 as separate products; and prohibits speculative variants for CONFIG-001–011. SKU identifiers remain aliases/candidates rather than commerce SKUs. No Admin or theme mutation occurred.

Batch validation includes schema validation, snapshot/approval digest checks, unknown-GID rejection, source-backed SKU gates, option value/combination reconciliation, semantic conflict-family checks, no-mutation decisions, and the E-PBI-009 stop line.

### Batch 2B.1 — Product Owner decision reconciliation and SKU authority finalization — implemented

**PBIs:** correction/finalization of E-PBI-004 through E-PBI-008 only. E-PBI-009 was not implemented.

The governed Product Owner overlay now produces 122 approved classifications and zero blockers. Purple Jade Bead Strand is a functional JadeMaster auto-stop/travel-control component and is approved as `replacement_part`. SKU authority belongs to the Rhino Lapidary governed commerce SKU registry, owned by Product Data / Product Owner with Operations downstream. The opaque `RH-######` architecture is approved; 121 registry values are proposed, no value is approved or populated, and only `automatic-feed-clamp` and `saw-vice-plate-set` remain SKU-blocked because size-specific technical identifiers prove collapsed physical distinctions.

Taxonomy now has 79 specific, 43 justified broad-fallback, and zero unresolved candidates. EM-1 maps to Multifunction Power Tools, JadeMaster to Masonry & Tile Saws, and TumbleMaster to Rotary Polishers & Buffers while their business meanings remain separate. All 11 unambiguous third-party marketed-brand rows have desired Vendor proposals and zero rows require redundant Product Owner review. CONFIG-001–022 dispositions are unchanged. No Admin or theme mutation occurred.

### Batch 3A — E-PBI-009 desired-state custom-data registry and schema — implemented

The existing canonical `data/metafield-metaobject-definitions.json` registry was upgraded in place to schema version 2. It now records definition identity, Shopify scope/type/cardinality, canonical role, shared Epic E decision and lifecycle states, Product-class applicability, evidence and owner roles, concrete MVP/post-MVP consumers, access intent, structured validations, migration/deprecation rules, and hashed snapshot reconciliation. Approved foundations are `rhino.product_class`, the `machine_family` metaobject, and `rhino.machine_family` Product reference. The former string compatibility and opaque machine JSON proposals are deprecated; grit remains proposed. Future E-PBI-010–018B domains have dependency entries only and no speculative keys.

The deterministic dry-run diff consumes the 2026-09-03 Admin API 2026-07 snapshot and reports three creates, three desired-but-not-approved/deferred concepts, and zero no-ops, conflicts, incompatible types, unexpected live definitions, or inaccessible definition datasets. Snapshot freshness is explicit and never becomes a perpetual zero-definition claim. E-PBI-019 remains the mandatory mutation-plan gate before E-PBI-020. E-PBI-010 was not implemented, and no Admin, definition, value, theme, or publication mutation occurred.

### Batch 3 — Typed field and relationship contracts

**PBIs:** E-PBI-009 through E-PBI-017 and E-PBI-018B in dependency-sized slices; E-PBI-013 begins with generated candidates from E-PBI-018A.

Why together: these domains require coordinated Technical, Operations, Legal, Support, Media, and Product evidence before later Admin rollout.

Blockers: compatibility matrix, BOMs, freight/package rules, warranty classes, support ownership, canonical Files mapping, and lead-time owner.

Modes: primarily Product Owner/business evidence and measurement/governance with repository contract work.

Batch validation: every relation has owner/evidence, temporary operational values have freshness rules, legal claims remain blocked without approval, and file references preserve canonical Files storage.

E-PBI-020 through E-PBI-023 remain a later, separate mutation tranche requiring explicit Product Owner GO after these batches. E-PBI-022 and E-PBI-023 must be split into bounded mutation domains before either can be authorized. E-PBI-024 is the later aggregate/drift gate; every architecture PBI owns reasonable schema/validator/test coverage when its contract lands. H/I/M/N customer-facing implementation remains post-MVP and did not expand these batches.

---

## E-PBI-001 Establish the Epic E Source Hierarchy and Decision-State Contract

**Epic:** Epic E — Product Information Architecture  
**Work area:** Architecture / Governance  
**Type:** Discovery  
**Priority:** P0  
**Impact:** High  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** E1 — Evidence and identity  
**Suggested GitHub labels:** `epic: e`, `area: product-data`, `area: documentation`, `type: discovery`, `priority: p0`

### Problem or opportunity

Product facts currently span Admin, HTML, CSV, legacy manufacturer material, registers, policies, and Files. Later agents need a deterministic authority and conflict process.

### Evidence

The discovery report began with 39 governed specification conflicts; E-PBI-018A added C-040/C-041 through the existing register. Stale CSV/live publication drift and multiple legal/operational owner gates remain.

### Proposed outcome

Approve one hierarchy for commerce state, classification, identity, technical facts, compatibility, shipping, warranty, lead time, and media, with the states `observed`, `proposed`, `approved`, `conflicting`, `blocked`, `deprecated`, and `superseded`.

### Scope

- Create an Epic E source-hierarchy artifact and decision log.
- Define owner/reviewer, evidence date, supersession, and conflict rules.
- Cross-reference existing brand, media, claims, Admin, and release governance.

### Out of scope

Resolving facts, changing schemas, or editing Admin.

### Acceptance criteria

- [x] Every Epic E domain has one canonical authority and fallback rule.
- [x] Unresolved values cannot become approved through conversion, majority, title match, or storefront presence.
- [x] Store-level mutation risk and Epic O MVP boundary are explicit.

### Implementation handoff

Repository/code. `data/epic-e-source-governance.json`, its schema, and validator are the machine-readable companion to the hierarchy already present in the discovery report.

### Success measure

Every later E PBI cites an authority and decision state without creating a competing register.

### Dependencies

None. Downstream: all Epic E PBIs and F/G/J/K/L/O/P.

### Risks/cautions

Do not label legacy or storefront evidence as current Admin truth.

### Testing/validation expectations

Documentation link checks and manual review against the discovery evidence inventory.

### Human/Admin dependencies

Product Owner approves decision-state semantics; no Admin access required.

### Automation opportunities

Later schema enums and validator checks in E-PBI-003/024.

### Downstream Epic consumers

**MVP:** F,G,J,K,L,O,P. **Post-MVP:** H,I,M,N.

### Blockers/open questions

Who is the final Product Data decision owner?

## E-PBI-002 Build and Run a Complete Read-Only Admin Catalog Snapshot

**Epic:** Epic E — Product Information Architecture  
**Work area:** Shopify Admin / QA  
**Type:** Discovery tooling  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** High  
**Suggested milestone:** E1 — Evidence and identity  
**Suggested GitHub labels:** `epic: e`, `area: shopify-admin`, `area: product-data`, `area: qa`, `type: discovery`, `priority: p0`

### Problem or opportunity

The discovery evidence could not establish draft/archived products, categories, definitions, metafield values, metaobjects, inventory state, delivery profiles, or full media relationships; the reusable audit now captures those fields with explicit result states.

### Evidence

The initial storefront/export discrepancy and discovery credential limitation were superseded by the successful 2026-09-03 full Admin snapshot (122 products, 125 variants, no query errors).

### Proposed outcome

Create a reusable, paginated, read-only GraphQL audit and durable redacted snapshot covering products, variants, options, identities, category/type/vendor/tags, collections, media, templates, publication, inventory/weight, definitions/values, metaobjects, Files references, and relevant delivery-profile identifiers.

### Scope

- Query all product statuses and variants with cost/throttle handling.
- Query definitions before values; capture GraphQL errors and access limits.
- Record API version, generated time, field coverage, counts, and source classification.
- Store no token, customer data, inventory secrets, or unnecessary financial data.

### Out of scope

Any mutation, bulk mutation, definition creation, or product edit.

### Acceptance criteria

- [x] Pagination totals reconcile and query errors or nested truncation are explicitly recorded by the audit and fixtures.
- [x] Snapshot distinguishes zero definitions, inaccessible scope, query failure, and not queried.
- [x] Current status of the three formerly uncertain products is captured in the dated 2026-09-03 snapshot.
- [x] Definition/value/metaobject coverage is explicit; the live snapshot reproduces zero Product, Variant, and Collection definitions and zero metaobject definitions.

### Implementation handoff

Mixed read-only: repository audit tool plus authorized Admin execution.

### Success measure

One command produces a dated snapshot and summary without exposing credentials.

### Dependencies

E-PBI-001; enables 003-025.

### Risks/cautions

Read only does not mean low sensitivity. Exclude customer/order data and never log headers.

### Testing/validation expectations

Fixture responses, pagination tests, error-path tests, schema validation, and token-leak scan.

### Human/Admin dependencies

Admin Owner supplies approved read scope and execution window.

### Automation opportunities

Scheduled or release-time drift snapshots after initial approval.

### Downstream Epic consumers

**MVP:** all. **Post-MVP:** H,I,M,N.

### Blockers/open questions

Artifact retention and rerun cadence remain governance questions; initial authorized execution is complete.

## E-PBI-003 Create the Measurable Catalog Gap and Conflict Register

**Epic:** Epic E — Product Information Architecture  
**Work area:** Product Data / QA  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** E1 — Evidence and identity  
**Suggested GitHub labels:** `epic: e`, `area: product-data`, `area: qa`, `type: improvement`, `priority: p0`

### Problem or opportunity

The machine register began Batch 1 with 39 rows and now contains C-001–C-041; catalog-wide coverage and evidence currentness require a machine-readable companion rather than copied conflict rows.

### Evidence

Current full-snapshot metrics include 0/125 SKU, 0/125 barcode, and 44/125 zero/missing Variant weights; HTML technical-fact detection remains separately labeled to its storefront/export evidence scope.

### Proposed outcome

Create a dated gap register/schema with entity IDs, source provenance, coverage, reliability, conflict state, owner, MVP/post-MVP consumers, human evidence, and blockers.

### Scope

- Import, do not duplicate, C-001–C-039 by reference.
- Record numerator/denominator and whether a metric is full-catalog or sample.
- Support product-, variant-, class-, and domain-level gaps.

### Out of scope

Resolving conflicts or populating fields.

### Acceptance criteria

- [x] The builder consumes the successful 2026-09-03 E-PBI-002 snapshot and the checked-in artifact contains full-catalog metrics.
- [x] Every gap has source date/currentness and owner.
- [x] Conflicting values remain individually preserved in the canonical C-register and are referenced from the gap register.
- [x] Schema/validator reject invalid metric arithmetic, unlabeled samples, and ownerless approved facts.

### Implementation handoff

Repository/code: JSON register, schema, generator, validator, and human-readable summary. After an authorized snapshot, run `npm run build:epic-e-gaps -- --admin-snapshot path/to/snapshot.json`.

### Success measure

Product Owner can sort blockers by F/G/J/K/L/O impact without re-auditing sources.

### Dependencies

001,002,018A; feeds all architecture and migration PBIs. Metrics retain their snapshot date and never imply perpetual Admin currentness.

### Risks/cautions

Avoid copying 867 Files rows or 39 conflict rows into a second uncontrolled source.

### Testing/validation expectations

Schema tests, metric-reconciliation tests, and `validate:registers` integration.

### Human/Admin dependencies

Domain owners assigned for unresolved facts.

### Automation opportunities

Coverage dashboard and before/after migration comparison.

### Downstream Epic consumers

**MVP:** all. **Post-MVP:** H,I,M,N.

### Blockers/open questions

Artifact retention and historical snapshot policy.

## E-PBI-004 Approve the Canonical Product-Class Taxonomy and Catalog Mapping

**Epic:** Epic E — Product Information Architecture  
**Work area:** Product / Product Data  
**Type:** Decision  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** E1 — Evidence and identity  
**Suggested GitHub labels:** `epic: e`, `area: product-data`, `needs-decision`, `priority: p0`

### Problem or opportunity

Product type is blank, tags are sparse, collections are merchandising, and most products lack reliable canonical class evidence.

### Evidence

Current evidence supports machines, replacement parts, consumables, and accessories; kits/bundles/services remain unproven or incomplete.

### Proposed outcome

Approve class definitions, distinctions, allowed values, ownership, and a handle-level mapping for every current Admin product.

### Scope

- Separate classification, merchandising, compatibility, navigation, and lifecycle state.
- Define rules for ambiguous parts/accessories/consumables and actual kits/bundles.
- Store the approved class in canonical `rhino.product_class`; E-PBI-009 now fully defines its desired Shopify definition contract.

### Out of scope

Admin population, collection changes, or H filter UX.

### Acceptance criteria

- [x] Every current product has one approved class: 122 approved and zero blocked.
- [x] Class vocabulary has definitions and examples/non-examples.
- [x] Tags and collections are not canonical.
- [x] Support pages/Files are not fabricated as products.

### Implementation handoff

Product Owner/business evidence; repository mapping artifact may be produced.

### Success measure

100% of audited products have a decision without title-only inference.

### Dependencies

002,003. E-PBI-004 and E-PBI-005 are one coordinated classification planning unit; together they block F,G,J,O and 006-016.

### Risks/cautions

Do not create a class only because the backlog names it.

### Testing/validation expectations

Allowed-value and handle-coverage checks.

### Human/Admin dependencies

Product Owner and Product Data Owner approval.

### Automation opportunities

Class-required field matrix and class-coverage gate.

### Downstream Epic consumers

**MVP:** F,G,J,K,L,O,P. **Post-MVP:** H,I,M,N.

### Blockers/open questions

Do true kits/bundles or purchasable services exist?

## E-PBI-005 Govern Category, Type, Vendor, Tags, and Collection Roles

**Epic:** Epic E — Product Information Architecture  
**Work area:** Product Data / Merchandising  
**Type:** Architecture  
**Priority:** P0  
**Impact:** Medium  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** E1 — Evidence and identity  
**Suggested GitHub labels:** `epic: e`, `area: product-data`, `area: merchandising`, `priority: p0`

### Problem or opportunity

The current snapshot has no meaningful Category assignment, blank Product Type, and a uniform `Rhino Lapidary` Vendor even where governed evidence identifies third-party marketed brands.

### Evidence

The 2026-09-03 snapshot has 122 products. The 2026-09-04 deepest-defensible taxonomy refinement produces 79 specific and 43 documented broad fallbacks with zero unresolved rows. The Vendor audit identifies 11 unambiguous marketed-brand corrections and zero ambiguous rows.

### Proposed outcome

Define the distinct operational roles and mapping policy for Shopify taxonomy category, product type, vendor, tags, and collections.

### Scope

- Category mapping uses valid current taxonomy nodes.
- Product type is optional operational grouping, not a duplicate class authority.
- Vendor remains standard Shopify data and means marketed product brand; manufacturer is not silently equated when distinct.
- Tags are temporary/admin hints; collections are merchandising/navigation.

### Out of scope

Admin edits, automated collections, Search & Discovery configuration, or H UX.

### Acceptance criteria

- [x] Every mechanism has one documented purpose/non-purpose.
- [x] Category mapping is evidence-based and version-aware.
- [x] `requiredTagsByProductClass` has an approved deprecation plan.
- [x] Product Type remains blank because no concrete consumer exists.
- [x] Vendor has one coherent semantic policy and an evidence-driven exception audit.

### Implementation handoff

Measurement/governance.

### Success measure

No later PBI uses a collection/tag as proof of class or compatibility.

### Dependencies

002-004; informs 009,021,024.

### Risks/cautions

Taxonomy can evolve; record node IDs and full names with audit date.

### Testing/validation expectations

Valid taxonomy node, allowed type/vendor, and noncanonical-use lint checks.

### Human/Admin dependencies

Product Data and Merchandising approval.

### Automation opportunities

Category drift and class/category mismatch report.

### Downstream Epic consumers

**MVP:** F,G,J. **Post-MVP:** H,I.

### Blockers/open questions

Product Type has no demonstrated consumer. No additional Product Owner business-semantic decision remains for taxonomy or the 11 Vendor exceptions. Category and Vendor population remain unapproved and no Admin change is authorized.

## E-PBI-006 Define Stable Product, Model, and Machine-Family Identity

**Epic:** Epic E — Product Information Architecture  
**Work area:** Product Data / Technical  
**Type:** Architecture  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** E1 — Evidence and identity  
**Suggested GitHub labels:** `epic: e`, `area: product-data`, `area: technical`, `priority: p0`

### Problem or opportunity

Titles and handles are not sufficient stable identity for ownership, manuals, service, or reorder workflows.

### Evidence

Approved machine-family keys exist, but JadeMaster/SawMaster 36/TumbleMaster have gaps and the naming proposal's admin identifiers are not implemented.

### Proposed outcome

Audit existing model, part, SKU, Shopify GID, handle, family, and legacy identifiers first. Define an additional immutable Rhino business identifier only if that audit proves one is necessary.

### Scope

- Reuse machine-family keys and casing decisions.
- Record issuer, stability, and fitness of existing identifiers before proposing another identifier.
- Define model identity without encoding unresolved specs.
- Define handle/title change and legacy alias rules.

### Out of scope

Renaming products, handles, or assigning SKUs.

### Acceptance criteria

- [x] Identity remains stable when title/handle changes.
- [x] Family identity is not compatibility proof.
- [x] Every identifier has issuer/source, scope, mutability, and uniqueness rule.
- [x] No new Rhino identifier is introduced without a documented unmet need that existing model, part, SKU, Shopify GID, handle, family, and legacy identifiers cannot satisfy.

### Implementation handoff

Mixed repository and Product/Technical evidence.

### Success measure

F/G/L/O can reference a product/model without fuzzy title matching.

### Dependencies

003,004,018A; precedes 007,008,012,018B,021.

### Risks/cautions

Do not invent a format or encode voltage/capacity before confirmation.

### Testing/validation expectations

Identifier uniqueness, allowed pattern, legacy alias, and family-reference tests.

### Human/Admin dependencies

Product/Technical approval of identifier source.

### Automation opportunities

GID/handle/identifier mapping and orphan detection.

### Downstream Epic consumers

**MVP:** F,G,L,O,P. **Post-MVP:** H,I,M.

### Blockers/open questions

Authoritative identifier issuer/system.

## E-PBI-007 Define and Source SKU and Barcode Governance

**Epic:** Epic E — Product Information Architecture  
**Work area:** Product Data / Operations  
**Type:** Decision  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High on gap; Low on values  
**Suggested milestone:** E1 — Evidence and identity  
**Suggested GitHub labels:** `epic: e`, `area: product-data`, `area: operations`, `needs-decision`, `priority: p0`

### Problem or opportunity

Every current storefront-visible variant has blank SKU and barcode, blocking dependable identity and operational integrations.

### Evidence

SF-28: 0/122 SKU and 0/122 barcode. CSV-31: 0/125 for both.

### Proposed outcome

Approve the authoritative SKU source, uniqueness/case rules, legacy identifiers, class requirements, and safe population inputs. Define barcode requirements only where a demonstrated business or integration need exists.

### Scope

- Define rules; do not invent or populate identifiers.
- Document the business/integration consumer before requiring a barcode; otherwise record barcode as optional/not required.
- Specify duplicate, blank, reserved, changed, and retired handling.

### Out of scope

Renumbering, label generation, QR implementation, or Admin edits.

### Acceptance criteria

- [x] SKU policy and readiness state cover every audited variant.
- [x] Barcode is explicitly optional because no demonstrated consumer exists.
- [x] Deterministic source, history, duplicate, approval, and rollback requirements are documented.
- [x] Eleven valid legacy/order/component identifiers across seven products are preserved as aliases/history; no legacy component identifier is promoted to a sold-set SKU.
- [x] Rhino commerce-SKU authority and the opaque `RH-######` scheme are approved; the registry contains 121 initial proposals and zero approved/populated values.

### Implementation handoff

Mixed Product Data/Operations evidence and repository governance.

### Success measure

No future agent generates SKUs/barcodes from titles.

### Dependencies

002,004,006; blocks G,J,L,O and 008/021.

### Risks/cautions

Identifier mutation can break ERP, fulfillment, service, or order-history workflows.

### Testing/validation expectations

Blank/duplicate/case/pattern and before/after mapping tests.

### Human/Admin dependencies

Product Data / Product Owner owns the Rhino commerce SKU registry; Operations is a downstream consumer. Integration/Operations must still provide evidence before any barcode requirement changes.

### Automation opportunities

Duplicate SKU/barcode and change-detection reports.

### Downstream Epic consumers

**MVP:** G,J,L,O. **Post-MVP:** H/I where identity joins are needed.

### Blockers/open questions

SKU authority and architecture are resolved. Specific value approval/population remains future work. `automatic-feed-clamp` and `saw-vice-plate-set` remain explicitly blocked pending an authorized catalog-restructuring decision; SawMaster 36 and TumbleMaster are deferred while non-sellable. Barcode stays optional.

## E-PBI-008 Approve Product-Versus-Variant Configuration Rules

**Epic:** Epic E — Product Information Architecture  
**Work area:** Product Data / Commerce  
**Type:** Architecture  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** E1 — Evidence and identity  
**Suggested GitHub labels:** `epic: e`, `area: variants`, `area: product-data`, `priority: p0`

### Problem or opportunity

The catalog mostly uses default variants, while source conflicts suggest—but do not prove—voltage, motor, speed, size, grit, diameter, arbor, and pack configurations.

### Evidence

Only `saw-blade` has multiple variants. Seven machine families have 110 V versus 220/230 V conflicts.

### Proposed outcome

Approve decision rules and an audit for when a fact is descriptive Product data versus a purchasable Variant option affecting SKU, inventory, price, fulfillment, or media.

### Scope

- Preserve the current saw-blade Size variants pending completeness fixes.
- Evaluate actual sold configurations with Technical/Operations evidence.
- Define option naming/value/unit rules and prohibited overloaded options.

### Out of scope

Variant creation/deletion/restructure or product splitting/merging.

### Acceptance criteria

- [x] Every current non-default option maps to a real commerce distinction; Saw Blade Size reconciles exactly to 6, 8, 14, and 18 inches and distinct prices.
- [x] Descriptive/conflicting specs are not made variants; CONFIG-001–011 preserve current structure without speculative variants.
- [x] Actual variant fields have executable SKU/price/weight/inventory completeness requirements. Saw Blade price passes; SKU and positive shipping weight remain governed gaps.
- [x] CONFIG-013–022 preserve established separate-product structures without product split/merge or variant mutation.

### Implementation handoff

Mixed audit and business/technical evidence.

### Success measure

No migration creates speculative voltage or configuration variants.

### Dependencies

002,004,006,007,018A; explicitly outside Batch 1 and informs 009-011,015,017,021-023.

### Risks/cautions

Variant restructuring affects orders, URLs, inventory, fulfillment, and app integrations.

### Testing/validation expectations

Option consistency, duplicate combination, required commerce fields, and overloaded-option checks.

### Human/Admin dependencies

Technical/Operations confirmation of corpus-derived configuration candidates; owners do not recreate evidence already indexed by E-PBI-018A.

### Automation opportunities

Variant audit and product/variant-scope mismatch detector.

### Downstream Epic consumers

**MVP:** F,G,J,K,O. **Post-MVP:** H,I.

### Blockers/open questions

No alternate electrical/motor/size configuration is authorized from technical conflict alone. Any future configuration must show independent commerce state and receive a superseding Product Owner decision.

## E-PBI-009 Upgrade the Desired-State Custom-Data Registry and Schema

**Epic:** Epic E — Product Information Architecture  
**Work area:** Repository / Custom Data  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** Medium  
**Suggested milestone:** E2 — Typed data contracts  
**Suggested GitHub labels:** `epic: e`, `area: metafields`, `area: metaobjects`, `area: qa`, `priority: p0`

### Problem or opportunity

Before Batch 3A, the registry had four metafields, one metaobject, `owner: TBD`, minimal metadata, string compatibility, and opaque machine JSON. That baseline is superseded by the completed schema-version-2 contract below.

### Evidence

`validate:metafields` passes internal references but cannot prove Admin state or safe semantics.

### Proposed outcome

Version the desired-state registry/schema to represent typed fields, access, cardinality, validations, class applicability, evidence/operational owners, visibility, consumers, migration/deprecation, and Admin snapshot identity.

### Scope

- Retain `rhino.product_class` and machine-family foundation.
- Deprecate string compatibility and machine JSON in favor of E-PBI-010/012 fields.
- Add source provenance and required/optional rules by class.

### Out of scope

Creating definitions or values in Admin.

### Acceptance criteria

- [x] Schema and semantic validation reject `TBD` owners for approved/launch-required definitions.
- [x] Every definition has type/cardinality/scope/access/owner/consumer/migration metadata.
- [x] Deprecations name replacements and transition rules.
- [x] Native Shopify fields cannot be duplicated without a distinct, approved metadata purpose.
- [x] Product class and machine-family foundations are fully represented.
- [x] Deterministic desired-versus-Admin dry-run diff generation works and remains E-PBI-019/E-PBI-020 gated.

### Implementation handoff

Repository/code: data, schema, validator, tests, and architecture documentation.

### Success measure

The registry is sufficient to generate a deterministic dry-run definition diff.

### Dependencies

004-008; extended by 010-018; precedes 020.

### Risks/cautions

Namespace/key and type choices are difficult to reverse; verify against current Admin first.

### Testing/validation expectations

Positive/negative schema fixtures, type/cardinality/access validation, and definition-reference checks.

### Human/Admin dependencies

None remain for E-PBI-009. A fresh read-only Admin snapshot and explicit approvals remain prerequisites for any later E-PBI-020 mutation plan.

### Automation opportunities

Definition diff generator and GraphQL mutation plan generator (dry run only until E-PBI-020).

### Downstream Epic consumers

**MVP:** F,G,J,K,L,O. **Post-MVP:** H,I,M,N.

### Blockers/open questions

None for the repository contract. The dated snapshot observed no live namespace/key collisions; later mutation planning must refresh it after the governed freshness window or on query/drift failure.

## E-PBI-010 Define Atomic Machine Technical and Electrical Fields

**Batch 3B status (2026-09-08):** Complete — atomic technical architecture; all conflicting values remain unapproved.  
**Evidence:** [Batch 3B implementation and decision report](project/implementation-records/e-pbi-010-014-018b-batch-3b.md)

**Epic:** Epic E — Product Information Architecture  
**Work area:** Technical Product Data  
**Type:** Architecture  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** Medium  
**Suggested milestone:** E2 — Typed data contracts  
**Suggested GitHub labels:** `epic: e`, `area: technical`, `area: metafields`, `needs-evidence`, `priority: p0`

### Problem or opportunity

Machine facts are buried in HTML or grouped JSON, preventing field-level approval and validation.

### Evidence

The conflict register records unresolved voltage, frequency, motor power/speed, blade/wheel size, water systems, and optional configuration facts.

### Proposed outcome

Define atomic P/V fields with units, allowed values, applicability, source provenance, conflict state, and customer/operational visibility.

### Scope

- Electrical, motor/power/speed, capacity, arbor/mounting, water system, applications/materials, skill/assembly/safety architecture.
- Variant scope only where E-PBI-008 proves a purchasable configuration.
- Mark H/I/M-only consumers without adding their UX to MVP.

### Out of scope

Choosing conflict winners, populating facts, or product-page rendering.

### Acceptance criteria

- [x] Every field has unit/type/scope/class/owner/source rules.
- [x] Conflict and unknown states cannot be serialized as approved values.
- [x] JSON is not the sole canonical store for filterable/trusted facts.

### Implementation handoff

Mixed repository schema and Technical evidence.

### Success measure

F can display each approved fact without parsing HTML or JSON blobs.

### Dependencies

006,008,009; informs 011,015,022,024.

### Risks/cautions

Do not split fields so finely that Admin becomes unusable; group presentation separately from storage.

### Testing/validation expectations

Unit/range/enum/scope and evidence-state tests.

### Human/Admin dependencies

Technical Owner resolves configuration and field semantics.

### Automation opportunities

Conflict-to-field coverage and HTML drift report.

### Downstream Epic consumers

**MVP:** F,J,K,L,O. **Post-MVP:** H,I,M.

### Blockers/open questions

Authoritative machine configuration data sheets.

## E-PBI-011 Define Net, Shipping, and Package Measurement Architecture

**Batch 3B status (2026-09-08):** Complete — physical-state architecture; custom measurement values and missing native weights remain owner-blocked.  
**Evidence:** [Batch 3B implementation and decision report](project/implementation-records/e-pbi-010-014-018b-batch-3b.md)

**Epic:** Epic E — Product Information Architecture  
**Work area:** Product Data / Shipping  
**Type:** Architecture  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** Medium  
**Suggested milestone:** E2 — Typed data contracts  
**Suggested GitHub labels:** `epic: e`, `area: shipping`, `area: product-data`, `priority: p0`

### Problem or opportunity

Net, assembled, catalog, package, crate, and shipping measurements are conflated, and 41 current variants have zero/missing shipping weight.

### Evidence

Conflicts C-005/009/015/017/021/026/031/034 preserve incompatible physical states and a likely SawMaster 36 typo.

### Proposed outcome

Define named physical states, Product-versus-Variant scope, Shopify standard shipping weight use, typed dimensions, multi-package exception strategy, and operational authority.

### Scope

- Net weight, assembled dimensions, packaged dimensions, shipping weight, package count/type, and revision/source.
- Shopify delivery package/profile integration boundaries.

### Out of scope

Freight rates, Admin weights, silent corrections, or unit-derived conflict resolution.

### Acceptance criteria

- [x] Each measurement states physical state and unit.
- [x] Shipping weight uses the native variant/inventory-item field where applicable.
- [x] Package dimensions remain variant-scoped when fulfillment differs.
- [x] Multi-package items cannot be flattened without an approved rule.

### Implementation handoff

Mixed Technical/Operations evidence and registry design.

### Success measure

K can distinguish machine footprint from the shipment used for rates/handling.

### Dependencies

008-010; informs 015,022,024.

### Risks/cautions

Incorrect weight/dimensions create financial and delivery risk.

### Testing/validation expectations

Positive weight, complete dimension set, unit/state/source, and class-required coverage tests.

### Human/Admin dependencies

Approved drawings and packing sheets.

### Automation opportunities

Coverage report and conflicting-state detector.

### Downstream Epic consumers

**MVP:** F,J,K. **Post-MVP:** I.

### Blockers/open questions

Whether any product ships in multiple packages or configurations.

## E-PBI-012 Define Canonical Compatibility Reference Architecture

**Batch 3B status (2026-09-08):** Complete — canonical exact-reference model and enforcement; no fit values populated.  
**Evidence:** [Batch 3B implementation and decision report](project/implementation-records/e-pbi-010-014-018b-batch-3b.md)

**Epic:** Epic E — Product Information Architecture  
**Work area:** Product Relationships  
**Type:** Architecture  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** E2 — Typed data contracts  
**Suggested GitHub labels:** `epic: e`, `area: compatibility`, `area: metafields`, `priority: p0`

### Problem or opportunity

Current names/tags/collections cannot safely establish fit, and planned string compatibility has no referential integrity.

### Evidence

Family governance explicitly says identity is not proof of compatibility; D-PBI-015/016 defer structured relations to E/G.

### Proposed outcome

Use dependent product → `list.product_reference` compatible machines as the canonical direction, derive reverse views, and define validation and lifecycle rules.

### Scope

- Parts, consumables, and accessories.
- Exact Product/model scope, successor/deprecated product behavior, unknown status, and evidence link.
- Separate compatibility from recommendations and collection membership.

### Out of scope

Populating relationships, compatibility selector UI, or machine-page rendering.

### Acceptance criteria

- [x] String names/tags/collections cannot satisfy compatibility.
- [x] One canonical direction prevents reciprocal drift.
- [x] Self, duplicate, orphan, wrong-class, unavailable-machine, and evidence gaps are detectable.

### Implementation handoff

Repository/code architecture and validator contract.

### Success measure

G/O can resolve fit through exact references without title matching.

### Dependencies

004,006,009; precedes 013/014/023/024.

### Risks/cautions

References to the wrong Shopify product are worse than missing values; require owner evidence.

### Testing/validation expectations

Reference graph fixtures and reverse-derivation tests.

### Human/Admin dependencies

Technical/Support evidence required for values, not architecture.

### Automation opportunities

Orphan/class/reciprocal drift and compatibility coverage reports.

### Downstream Epic consumers

**MVP:** F,G,J,L,O. **Post-MVP:** H,I,M.

### Blockers/open questions

Whether compatibility is model-level, product-level, or variant-level for each class.

## E-PBI-013 Approve the Parts, Consumables, and Accessories Relationship Matrix

**Batch 3B status (2026-09-08):** Evidence complete / human-blocked — 111 dependents covered, 42 candidate edges (38 proposed, 4 blocked), zero owner-approved. Human review acceptance remains open.  
**Evidence:** [Batch 3B implementation and decision report](project/implementation-records/e-pbi-010-014-018b-batch-3b.md)

**Epic:** Epic E — Product Information Architecture  
**Work area:** Technical / Support / Product Data  
**Type:** Evidence  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** Low until human evidence  
**Suggested milestone:** E3 — Operational evidence  
**Suggested GitHub labels:** `epic: e`, `area: compatibility`, `needs-evidence`, `priority: p0`

### Problem or opportunity

No complete handle-level compatibility source exists for the current catalog.

### Evidence

Part lists and titles suggest relations, but current architecture prohibits inference; many part collections are empty.

### Proposed outcome

Generate a versioned candidate relation matrix from the E-PBI-018A evidence corpus, then have human owners approve unresolved or consequential edges linking each dependent product/variant to exact machine product/model identifiers with source, revision, owner, and status.

### Scope

- Parts, consumables, accessories, replacements/successors where proven.
- Machine-generate evidence-rich candidates from parts lists, diagrams, manuals, and governed identifiers before human review.
- Explicit `confirmed`, `not compatible`, `unknown`, and `deprecated` states.

### Out of scope

Admin population, recommendations, UI, or inferred reciprocal values.

### Acceptance criteria

- [x] Every approved edge cites evidence and owner.
- [ ] Human owners review generated candidates and are not required to recreate all relationships manually.
- [x] Unknown is preserved and not omitted as implied compatibility.
- [x] All current dependent products are covered or explicitly blocked.

### Implementation handoff

Mixed repository automation plus Technical/Support/Product Data approval.

### Success measure

No G compatibility relation depends on a name fragment.

### Dependencies

004,006,007,012,018A; precedes 023.

### Risks/cautions

Bad compatibility causes wrong orders, machine damage, and support liability.

### Testing/validation expectations

Entity/reference/evidence coverage and duplicate/conflict tests.

### Human/Admin dependencies

Technical, Support, Product Data approval.

### Automation opportunities

Corpus-to-candidate generation, matrix-to-Admin diff, and orphan relation report.

### Downstream Epic consumers

**MVP:** F,G,J,L,O. **Post-MVP:** H,I,M.

### Blockers/open questions

Authoritative manufacturer/engineering relation source.

## E-PBI-014 Model Included, Optional, and Recommended Components

**Batch 3B status (2026-09-08):** Complete at architecture level — C-040 BOM values and optional/recommended decisions remain unapproved.  
**Evidence:** [Batch 3B implementation and decision report](project/implementation-records/e-pbi-010-014-018b-batch-3b.md)

**Epic:** Epic E — Product Information Architecture  
**Work area:** Product Relationships  
**Type:** Architecture  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** E3 — Operational evidence  
**Suggested GitHub labels:** `epic: e`, `area: product-data`, `area: merchandising`, `needs-evidence`, `priority: p1`

### Problem or opportunity

HTML and legacy documents blur in-box contents, optional configurations, accessories, and recommendations.

### Evidence

EM-1 and machine descriptions list included items; optional variable speed is unresolved; no references exist.

### Proposed outcome

Define separate relation semantics using Product references for catalog items and introduce a reusable component metaobject only if non-catalog reusable entities justify it.

### Scope

- Included, not included, optional, and recommended distinctions.
- Quantity, evidence, and availability semantics where needed.

### Out of scope

Bundles, cross-sell UI, or creating placeholder products/metaobjects.

### Acceptance criteria

- [x] Each relation has distinct customer meaning and owner.
- [x] Included items are not inferred from compatibility.
- [x] Metaobjects require demonstrated reuse/structure.

### Implementation handoff

Mixed architecture and Product/Technical BOM evidence.

### Success measure

F/G can state box contents and options without ambiguous prose.

### Dependencies

004,006,009,012; precedes 023.

### Risks/cautions

In-box claims affect customer expectations and fulfillment disputes.

### Testing/validation expectations

Reference class, quantity, duplicate, availability, and evidence checks.

### Human/Admin dependencies

Approved machine BOM and merchandising owner.

### Automation opportunities

BOM/reference completeness and unsupported HTML-claim detection.

### Downstream Epic consumers

**MVP:** F,G,J,L. **Post-MVP:** I,M.

### Blockers/open questions

Which included components are current catalog products?

## E-PBI-015 Define Freight, Shipping, Pickup, and Regional Product Data

**Batch 3C status (2026-09-09):** Complete at architecture level; fulfillment assignments, pickup/region rules and profile capabilities remain Operations-blocked.

Implementation: [Batch 3C architecture and validation record](project/implementation-records/e-pbi-015-017-batch-3c.md). Definition approval and Product-value approval are separate.

**Epic:** Epic E — Product Information Architecture  
**Work area:** Operations / Shipping  
**Type:** Architecture  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** Low until operations evidence  
**Suggested milestone:** E3 — Operational evidence  
**Suggested GitHub labels:** `epic: e`, `area: shipping`, `area: operations`, `needs-decision`, `priority: p0`

### Problem or opportunity

Durable product facts, live shipping configuration, policy, rates, pickup eligibility, and region restrictions are currently mixed or unknown.

### Evidence

The September 3 audit observed one profile, three locations and one active US Market; it did not capture exact Variant membership or pickup settings. Batch 3B identifies 44 missing/nonpositive native weights. Batch 3C indexes historical freight/pickup/policy evidence without approving assignments.

### Proposed outcome

Define typed fulfillment class/freight flags and package facts while keeping rates, profiles, markets, pickup processes, and temporary restrictions in their operational authorities.

### Scope

- Parcel/freight/oversized classification, packages, lift-gate/appointment facts where durable, pickup eligibility, region codes, assembly/handling flags.
- Mapping to native shipping/Markets configuration and policy.

### Out of scope

Rates, profile mutation, customer copy, quote forms, or universal region promises.

### Acceptance criteria

- [x] Every field is classified as durable fact, operational configuration, policy, or temporary state.
- [x] Product data and enforcement cannot silently disagree.
- [x] Preview-theme testing is not described as Admin isolation.

### Implementation handoff

Mixed Operations evidence, Admin read audit, and registry design.

### Success measure

J/K can determine which facts are safe to use and which must be resolved live.

### Dependencies

002,004,008,011; informs 017,022,023.

### Risks/cautions

Incorrect freight and region data create cost, delivery, and legal risk.

### Testing/validation expectations

Class/package/weight completeness, country-code, configuration-drift, and claims tests.

### Human/Admin dependencies

Operations/Admin Owner provides profiles, package rules, pickup and market decisions.

### Automation opportunities

Product-to-delivery-profile drift and freight completeness audit.

### Downstream Epic consumers

**MVP:** F,J,K,O,P. **Post-MVP:** H.

### Blockers/open questions

Current carrier/profile/pickup/region rules.

## E-PBI-016 Define Warranty, Service, Repair, and Support Relationships

**Batch 3C status (2026-09-09):** Complete at architecture level; current policy terms, entity roles and Product mappings remain Legal/Business/Support-blocked.

Implementation: [Batch 3C architecture and validation record](project/implementation-records/e-pbi-015-017-batch-3c.md). Definition approval and Product-value approval are separate.

**Epic:** Epic E — Product Information Architecture  
**Work area:** Legal / Support / Product Data  
**Type:** Architecture  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** Low until owner approval  
**Suggested milestone:** E3 — Operational evidence  
**Suggested GitHub labels:** `epic: e`, `area: warranty`, `area: support`, `area: legal`, `priority: p0`

### Problem or opportunity

Legacy one-year and 90-day terms cannot be universalized, and warranty/support roles remain partially unresolved.

### Evidence

Claims 007/008/014 are blocked; the identity architecture lacks precise warranty provider/administrator approval.

### Proposed outcome

Define reusable warranty classes, Product-to-class mapping, policy linkage, issuer/administrator/service owner, exceptions, and support-resource relationships.

### Scope

- Warranty-class metaobject criteria and policy/page authority.
- Support/repair owner and manual/parts relations.
- Product-specific exceptions and lifecycle state.

### Out of scope

Publishing warranty copy, registration forms, notifications, or service promises.

### Acceptance criteria

- [x] No duration exists without approved class and policy.
- [x] Warranty issuer, administrator, service owner, and exclusions are distinct.
- [x] Product mapping and policy links are validation-ready.

### Implementation handoff

Mixed Legal/Business/Support evidence and repository architecture.

### Success measure

F/L/O can resolve the applicable governed terms without copied product prose.

### Dependencies

004,006,009; informs 023/024.

### Risks/cautions

Warranty data is a legal promise; do not infer from price/class.

### Testing/validation expectations

Class coverage, policy route, owner, effective-date, exception, and claim checks.

### Human/Admin dependencies

Legal, Business, Support, Admin approval.

### Automation opportunities

Expired/unmapped warranty class and policy drift checks.

### Downstream Epic consumers

**MVP:** F,L,O,P. **Post-MVP:** N.

### Blockers/open questions

Warranty provider/administrator and class mapping.

## E-PBI-017 Separate Lead Time and Availability From Durable Product Facts

**Batch 3C status (2026-09-09):** Complete at architecture level under the Batch 3C status rule; Operations has not appointed a maintainable timing source/process. No lead-time projection is approved.

Implementation: [Batch 3C architecture and validation record](project/implementation-records/e-pbi-015-017-batch-3c.md). Definition approval and Product-value approval are separate.

**Epic:** Epic E — Product Information Architecture  
**Work area:** Operations / Product Data  
**Type:** Architecture  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** E3 — Operational evidence  
**Suggested GitHub labels:** `epic: e`, `area: operations`, `area: availability`, `priority: p1`

### Problem or opportunity

Lead time is time-varying operational state but legacy content can present it as a durable product promise.

### Evidence

Claims governance blocks 3–10 day and four-week promises; no current source owner/system is identified.

### Proposed outcome

Choose the operational authority and define whether a synchronized storefront field is allowed, with freshness, expiry, fallback, and unavailable-state behavior.

### Scope

- Native availability, preorder/backorder state, lead-time class/range, update SLA, and fallback.
- Product/variant scope where a configuration differs.

### Out of scope

Populating lead times, cart copy, preorder implementation, or customer notifications.

### Acceptance criteria

- [x] No lead time is treated as timeless free text.
- [x] Any synchronized value has source timestamp/expiry and safe fallback.
- [ ] An actual timing process owner, source and update SLA are approved — explicit B3C-D04 value/process blocker; Operations is the accountable role.

### Implementation handoff

Measurement/governance with Operations decision.

### Success measure

F/J/K/O never display stale timing because a description was not updated.

### Dependencies

002,008,015; informs 023/024.

### Risks/cautions

Stale timing is a customer promise and conversion/support risk.

### Testing/validation expectations

Freshness, expiry, variant-scope, and fallback tests.

### Human/Admin dependencies

Operations source system/process owner.

### Automation opportunities

Staleness alert and source synchronization audit.

### Downstream Epic consumers

**MVP:** F,J,K,O. **Post-MVP:** H.

### Blockers/open questions

Authoritative operational system and acceptable SLA.

## E-PBI-018A Build the Machine Technical Evidence Corpus and Source Index

**Epic:** Epic E — Product Information Architecture  
**Work area:** Technical Evidence / Media / Product Data  
**Type:** Evidence tooling  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** High  
**Suggested milestone:** E1 — Evidence and identity  
**Suggested GitHub labels:** `epic: e`, `area: technical`, `area: media`, `area: product-data`, `area: qa`, `priority: p0`

### Problem or opportunity

Technical facts and relationships must be mined from the complete Files audit and repository legacy sources before owners are asked to recreate them manually.

### Evidence

The existing Files audit covers 867 objects and exact document duplicates; the repository contains 36 local PDFs/XLSX files. Direct analysis found current candidate facts in Shopify-hosted EM-1, LapMaster 12, and SawMaster 18 instructions and two new conflicts, C-040/C-041.

### Proposed outcome

Maintain a governed, schema-validated source index that separates document evidence, canonical downloadable resources, and future Product-to-File references; preserve candidate facts and relationships with source locations and review state.

### Scope

- Index the full relevant Files rows and every repository technical source without duplicating the complete 867-row audit.
- Hash local sources, preserve Files GIDs/URLs and duplicate groups, inspect accessible PDFs/drawings/spreadsheets/manuals, and record candidate observations.
- Generate candidate compatibility/component relationship groups; never approve or migrate them automatically.
- Reassess E-REQ-003/005/006/007/008/011/013.

### Out of scope

Approving facts, selecting a canonical customer download, creating a Product File-reference metafield, uploading/deleting Files, or mutating products.

### Acceptance criteria

- [x] Source, fact, relationship, conflict, duplicate, authority, supersession, and human-review states are schema validated.
- [x] Dimension drawings are visually inspected and spreadsheet sheets/tables are inspected.
- [x] Candidate relationships cite evidence and cannot be represented as approved.
- [x] New conflicts use the existing C-register rather than a competing register.
- [x] Human requests are reduced or narrowed based on actual evidence.

### Implementation handoff

Repository/code plus read-only Shopify Files evidence. Implemented in `data/epic-e-technical-source-index.json` and its builder/schema/validator.

### Success measure

Later PBIs can consume evidence candidates and ask owners only for confirmation, conflict resolution, or genuinely absent facts.

### Dependencies

001 and read-only evidence from 002. Feeds 003,006,008,010,011,012,013,014,018B.

### Risks/cautions

Filename matches, document counts, old revisions, and legacy part numbers are not proof of current sellable configuration or compatibility.

### Testing/validation expectations

Schema, referential integrity, hash/path, extraction-state arithmetic, duplicate-group, conflict-ID, and candidate-only relationship checks.

### Human/Admin dependencies

Technical/Operations/Support owners approve consequential candidates later; no Admin write access.

### Automation opportunities

Future content extraction and current-document drift can extend the existing builder without replacing the index.

### Downstream Epic consumers

**MVP:** F,G,J,K,L,O. **Post-MVP:** H,I,M,N architecture only; no customer-facing work before Epic O.

### Blockers/open questions

Current engineering revisions and shipped configurations remain human decisions where sources conflict.

## E-PBI-018B Define Product-to-Manual, Diagram, Video, and Support References

**Batch 3B status (2026-09-08):** Complete at architecture level — canonical File/version/rights decisions remain owner-blocked.  
**Evidence:** [Batch 3B implementation and decision report](project/implementation-records/e-pbi-010-014-018b-batch-3b.md)

**Epic:** Epic E — Product Information Architecture  
**Work area:** Media / Support / Product Data  
**Type:** Architecture  
**Priority:** P1  
**Impact:** High  
**Effort:** L  
**Confidence:** Medium  
**Suggested milestone:** E3 — Operational evidence  
**Suggested GitHub labels:** `epic: e`, `area: media`, `area: support`, `area: files`, `priority: p1`

### Problem or opportunity

Files and manual pages exist, but canonical product/model relations, versions, rights, captions, and obsolete states are incomplete.

### Evidence

867 Files are audited; 772 are not directly product-media associated; four exact document duplicate pairs and video duplicate queues exist; all Files lack alt.

### Proposed outcome

Use Product list-of-File references for approved manuals/diagrams, product media/File references for videos, and repository governance for provenance/version/rights/alt/captions/obsolete status.

### Scope

- Canonical storage, product relation, presentation, and governance as separate concerns.
- Current published/hidden manual pages and support-resource register reconciliation.

### Out of scope

Copying Files to theme assets, deleting duplicates, uploading, publishing, or building L/M UI.

### Acceptance criteria

- [x] Every approved relation cites product/model, file GID, version, owner, rights, and public state.
- [x] Detached or duplicate status alone never authorizes deletion.
- [x] Video requires poster/caption/transcript/performance state.

### Implementation handoff

Mixed Media/Support evidence and repository reference contract.

### Success measure

F/G/L/O can retrieve the correct current resource by exact reference.

### Dependencies

002,006,009,018A; informs 023/024.

### Risks/cautions

Files may be referenced by hidden pages, metafields, apps, or unpublished themes.

### Testing/validation expectations

File existence, type, rights, version, product mapping, orphan, duplicate, and accessibility checks.

### Human/Admin dependencies

Technical/Support/Media approval and Admin read access.

### Automation opportunities

Cross-surface reference crawler and obsolete-version report.

### Downstream Epic consumers

**MVP:** F,G,L,O. **Post-MVP:** M,N.

### Blockers/open questions

Canonical document/video mapping and rights owners. Evidence use, canonical binary storage, and Product-to-File storefront reference remain separate decisions.

## E-PBI-019 Establish the Safe Admin Mutation and Migration Playbook

**Batch 4A status:** Complete. Batch 4A extends the existing linter with real input hashes, rollback coverage, fresh complete Admin prerequisites and hash-bound Product Owner/Admin GO.

See [the independent domain plans and gate report](project/implementation-records/e-pbi-024-batch-4a.md).

**Epic:** Epic E — Product Information Architecture  
**Work area:** Release / Shopify Admin  
**Type:** Governance  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** E1 — Evidence and identity  
**Suggested GitHub labels:** `epic: e`, `area: shopify-admin`, `area: release`, `priority: p0`

### Problem or opportunity

Product data cannot be isolated by the preview theme, and bulk changes can corrupt identifiers, fulfillment, relations, and legal facts.

### Evidence

Existing Admin evidence rules are generic; Epic E requires before/after catalog snapshots, deterministic inputs, dry runs, and reference-aware rollback.

### Proposed outcome

Create the mandatory workflow and record template for definitions, values, variants, IDs, Files, collections, and shipping-related changes.

### Scope

- Read first, before snapshot, exact mutation scope, deterministic source, dry run, approval, rollback, test strategy, post-validation, after snapshot, drift detection.
- Idempotency, partial failure, GraphQL errors/userErrors, throttling, and resumability.

### Out of scope

Executing a mutation or approving production/store changes.

### Acceptance criteria

- [x] Every mutation plan must name all required safety stages or the linter rejects it.
- [x] Rollback preserves IDs/references and distinguishes reversible, partially reversible, and irreversible changes.
- [x] Product Owner/Admin GO is separately recorded and required before an executable plan can pass.

### Implementation handoff

Repository/code documentation and dry-run contract.

### Success measure

E-PBI-020–023 cannot execute without machine-verifiable inputs and snapshots.

### Dependencies

001-003; blocks all Admin writes.

### Risks/cautions

CSV rollback is not sufficient for all custom data, publications, Files, or relationships.

### Testing/validation expectations

Dry-run fixture, idempotency, partial-failure, redaction, and rollback-plan checks.

### Human/Admin dependencies

Admin Owner and Product Owner approve workflow.

### Automation opportunities

Mutation-plan linter and snapshot diff.

### Downstream Epic consumers

**MVP:** all. **Post-MVP:** shared Admin safety.

### Blockers/open questions

Approved rollback retention and execution authority.

## E-PBI-020 Create Approved Custom-Data Definitions in Admin

**Batch 4A status:** Planned / mutation not authorized. E-MUT-020 includes only the 38 approved desired definitions.

See [the independent domain plans and gate report](project/implementation-records/e-pbi-024-batch-4a.md).

**Epic:** Epic E — Product Information Architecture  
**Work area:** Shopify Admin / Custom Data  
**Type:** Implementation  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** E4 — Approved Admin rollout  
**Suggested GitHub labels:** `epic: e`, `area: shopify-admin`, `area: metafields`, `needs-admin`, `priority: p1`

### Problem or opportunity

Repository desired state does not establish live definitions, access, validation, or metaobjects.

### Evidence

Current Admin definition/value state is unknown; the existing register is proposed only.

### Proposed outcome

After explicit GO, create/update only approved definitions in deterministic batches and reconcile the after snapshot to desired state.

### Scope

- Approved P/V/Collection definitions and justified metaobject definitions.
- Definition access/validations and Admin evidence records.
- Start with a reversible pilot subset.

### Out of scope

Product values, migrations, storefront rendering, Search & Discovery, or unapproved definitions.

### Acceptance criteria

- [ ] Read/before/dry-run/GO/rollback/after/drift stages pass.
- [ ] GraphQL errors and userErrors are zero.
- [ ] Exact Admin IDs and definition diff are captured.
- [ ] No production theme mutation occurs.

### Implementation handoff

Shopify Admin. Store-level mutation; Product Owner GO required.

### Success measure

Live definitions exactly match the approved registry for the scoped subset.

### Dependencies

009-019 and explicit GO; precedes 021-023.

### Risks/cautions

Namespace/key/type mistakes are costly; some changes require new-key migration, not in-place edits.

### Testing/validation expectations

Definition GraphQL readback, access/validation diff, Liquid/Storefront visibility test where applicable.

### Human/Admin dependencies

Product Owner/Admin Owner approval and credentials.

### Automation opportunities

Idempotent definition planner/executor with dry-run default.

### Downstream Epic consumers

**MVP:** F,G,J,K,L,O. **Post-MVP:** H,I,M,N.

### Blockers/open questions

Final registry approval and live namespace collisions.

## E-PBI-021 Migrate Canonical Class and Identity Fields

**Batch 4A status:** Planned / mutation not authorized. E-PBI-021A–E separate Product class, Category, Vendor, commerce SKU and machine-family linkage.

See [the independent domain plans and gate report](project/implementation-records/e-pbi-024-batch-4a.md).

**Epic:** Epic E — Product Information Architecture  
**Work area:** Product Data / Shopify Admin  
**Type:** Migration  
**Priority:** P1  
**Impact:** High  
**Effort:** L  
**Confidence:** Low until mapping approval  
**Suggested milestone:** E4 — Approved Admin rollout  
**Suggested GitHub labels:** `epic: e`, `area: migration`, `area: product-data`, `needs-admin`, `priority: p1`

### Problem or opportunity

F/G/J/L/O cannot rely on typed class and stable identity until approved values exist in Admin.

### Evidence

Type is blank; tags/collections are noncanonical; all SKUs are blank.

### Proposed outcome

Populate approved class, stable product/model/family identity, category/type policy, and authorized SKU/barcode values from deterministic mappings.

### Scope

- Pilot, validate, then class-based batches.
- Preserve handles/titles unless a separate PBI authorizes them.
- Record skipped/blocked products explicitly.

### Out of scope

Inventing identifiers, compatibility, technical values, or title normalization.

### Acceptance criteria

- [ ] All ten Admin safety stages pass.
- [ ] Input has owner approval and before values.
- [ ] After audit reports coverage/duplicates/conflicts and no unintended fields changed.

### Implementation handoff

Mixed repository migration tool and Admin execution.

### Success measure

Approved scoped products reach 100% class/identity coverage with zero duplicates.

### Dependencies

004-009,019,020; enables F/G/L/O foundations.

### Risks/cautions

SKU/identity changes can affect integrations and historical workflows.

### Testing/validation expectations

Dry-run diff, idempotency, field allowlist, duplicate identity, reference, and rollback tests.

### Human/Admin dependencies

Approved mappings and explicit mutation GO.

### Automation opportunities

Deterministic batch migration and after-snapshot reconciliation.

### Downstream Epic consumers

**MVP:** F,G,J,L,O,P. **Post-MVP:** H,I,M.

### Blockers/open questions

Complete class/identifier/SKU mapping.

## E-PBI-022 Populate Approved Technical and Physical Facts

**Batch 4A status:** Split into E-PBI-022A–H bounded domain plans / mutation not authorized. All current approved value sets are empty; no conflict winner selected.

See [the independent domain plans and gate report](project/implementation-records/e-pbi-024-batch-4a.md).

**Epic:** Epic E — Product Information Architecture  
**Work area:** Technical Product Data / Admin  
**Type:** Migration  
**Priority:** P1  
**Impact:** High  
**Effort:** XL  
**Confidence:** Low until evidence  
**Suggested milestone:** E4 — Approved Admin rollout  
**Suggested GitHub labels:** `epic: e`, `area: migration`, `area: technical`, `needs-admin`, `priority: p1`

### Problem or opportunity

Machine specs and physical facts remain in HTML/conflicts and cannot safely power F/K.

### Evidence

C-001–C-039 include unresolved electrical, motor, dimensions, weights, capacity, and claims; 41 variants lack positive weight.

### Proposed outcome

Populate only approved atomic fields and native shipping weights, preserving unresolved facts as blocked register entries rather than guessed values.

Planning disposition: split this PBI into smaller technical, electrical, and physical-measurement mutation domains before any implementation authorization. The E-PBI-019 linter rejects the unsplit `E-PBI-022` target.

### Scope

- Class/model batches, beginning with the best-evidenced active machine.
- Product/Variant scope per E-PBI-008.
- HTML drift report; no automatic copy rewrite.

### Out of scope

Resolving evidence, changing variants, rewriting descriptions, or F UI.

### Acceptance criteria

- [ ] Every written value cites approved evidence/revision/owner.
- [ ] Conflicting/unknown values are skipped and reported.
- [ ] After snapshot and class-required coverage pass.
- [ ] No unrelated product field changes.

### Implementation handoff

Mixed deterministic migration and Admin execution; explicit GO per batch.

### Success measure

Approved active-machine facts are structured with zero unresolved-value substitutions.

### Dependencies

010,011,015,019-021.

### Risks/cautions

Incorrect specs or shipping facts create safety, legal, and cost exposure.

### Testing/validation expectations

Dry-run, field allowlist, units/ranges, scope, evidence, HTML conflict, and rollback tests.

### Human/Admin dependencies

Technical/Operations approvals and Admin GO.

### Automation opportunities

Evidence-to-field importer with unresolved skip report.

### Downstream Epic consumers

**MVP:** F,J,K,L. **Post-MVP:** H,I,M.

### Blockers/open questions

Technical conflict resolution and packing evidence.

## E-PBI-023 Populate Approved Relationships, Files, Warranty, and Freight Data

**Batch 4A status:** Split into E-PBI-023A–H bounded domain plans / mutation not authorized. All current approved value sets are empty; all four blocked SawMaster edges excluded.

See [the independent domain plans and gate report](project/implementation-records/e-pbi-024-batch-4a.md).

**Epic:** Epic E — Product Information Architecture  
**Work area:** Product Relationships / Admin  
**Type:** Migration  
**Priority:** P1  
**Impact:** High  
**Effort:** XL  
**Confidence:** Low until evidence  
**Suggested milestone:** E4 — Approved Admin rollout  
**Suggested GitHub labels:** `epic: e`, `area: migration`, `area: compatibility`, `area: shipping`, `area: warranty`, `priority: p1`

### Problem or opportunity

Compatibility, components, Files, warranty, freight, region, and lead-time relationships are absent or unverified.

### Evidence

No structured product references exist in available evidence; claims and Files governance block inference or reuse without approval.

### Proposed outcome

Populate approved relations and classes in domain-specific, reversible batches from governed matrices.

Planning disposition: split this PBI into smaller compatibility, components, Files, warranty/support, freight, and regional mutation domains before any implementation authorization. The E-PBI-019 linter rejects the unsplit `E-PBI-023` target.

### Scope

- Compatibility first, then components, approved files, warranty class, and durable fulfillment facts.
- Separate mutation plans and GO decisions by domain.
- Derive reverse relations rather than double-entering them.

### Out of scope

UI, file deletion/upload, policies, shipping rates, form implementation, or temporary lead times without a live owner.

### Acceptance criteria

- [ ] Every edge/value has evidence, owner, deterministic input, and exact target GID.
- [ ] Orphan/wrong-class/self/duplicate checks pass.
- [ ] After snapshots show no reciprocal drift or unrelated changes.

### Implementation handoff

Mixed code/Admin with separate explicit GO per domain.

### Success measure

Approved scoped products have trustworthy exact references and policy/operations mappings.

### Dependencies

012-018B,019-021.

### Risks/cautions

Incorrect references and legal/operational classes can be more harmful than missing data.

### Testing/validation expectations

Reference graph, file existence, warranty/policy, freight/configuration, staleness, dry-run/idempotency, and rollback checks.

### Human/Admin dependencies

Technical, Support, Media, Legal, Operations, Product Owner, Admin Owner.

### Automation opportunities

Domain-specific migration generators and after-state drift audits.

### Downstream Epic consumers

**MVP:** F,G,J,K,L,O,P. **Post-MVP:** H,I,M,N.

### Blockers/open questions

All E-REQ-007 through E-REQ-013 evidence.

## E-PBI-024 Add Epic E Data-Quality, Reference, and Admin-Drift Gates

**Batch 4A status:** Complete at aggregate-gate implementation scope. Repository contracts pass; current Admin reconciliation and every mutation remain blocked explicitly.

See [the independent domain plans and gate report](project/implementation-records/e-pbi-024-batch-4a.md).

**Epic:** Epic E — Product Information Architecture  
**Work area:** Repository / QA / CI  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** L  
**Confidence:** High  
**Suggested milestone:** E2/E3 — Validation  
**Suggested GitHub labels:** `epic: e`, `area: qa`, `area: ci`, `area: product-data`, `priority: p0`

### Problem or opportunity

Current validators can pass while Admin remains unpopulated and the catalog lacks identity, class, weights, and relations.

### Evidence

At discovery, `validate:data-architecture` passed, the CSV gate failed, and `validate:launch-fixtures` crashed on a singular/plural filename mismatch. Batch 4A fixes that lookup; the validator now reports the existing `search`, `machineProduct` and `consumableProduct` ownership gaps. The 103 CSV findings remain independently reported.

### Proposed outcome

Add the aggregate and Admin-drift gate across validators delivered by individual Epic E architecture PBIs. E-PBI-024 is not the first enforcement point for their rules.

### Scope

- Extend rather than replace existing validators.
- Aggregate each architecture PBI's own schema, validator, semantic checks, and negative fixtures.
- Fix the launch-fixture filename defect only within this authorized PBI.
- Add aggregate Epic E static/read-only modes and negative fixtures.

### Out of scope

Changing facts to make tests pass or running Admin mutations.

### Acceptance criteria

- [x] Each included architecture contract already has reasonable local executable enforcement owned by its source PBI.
- [x] Blank/duplicate SKU/barcode, weight gaps, class/category coverage, variant consistency, and HTML-only facts are reported.
- [x] Reference/warranty/freight/file rules are validated as their schemas land.
- [x] Drift compares live/snapshot to registry without logging secrets.
- [x] Full-catalog and sample metrics are labeled.

### Implementation handoff

Repository/code and CI.

### Success measure

A passing repository mode means the architecture and bounded plans meet their contracts, with blocked values explicitly reported. Admin and migration modes separately require current reconciliation and execution prerequisites; a repository pass does not certify either. Availability/timing and abrasive grit remain visible even though they have no approved population plan.

### Dependencies

003-019; evolves alongside Batch 2/3 and precedes 025.

### Risks/cautions

Do not make unknown human facts hard failures before the applicable class/PBI declares them required.

### Testing/validation expectations

Positive/negative fixtures, deterministic output, exit codes, redaction, stale-snapshot handling, and regression tests.

### Human/Admin dependencies

Owners approve severity/launch thresholds; read credentials only for live mode.

### Automation opportunities

Aggregate runner, drift comparison, and CI severity orchestration; domain validation remains owned by the PBI that defines the domain.

### Downstream Epic consumers

**MVP:** all. **Post-MVP:** shared architecture checks.

### Blockers/open questions

The aggregate gate contract separates architecture checks from current Admin/migration prerequisites. CSV and launch-fixture ownership findings remain applicable release/finalization blockers. Human value closure, current read access and domain-specific GO are still outstanding.

## E-PBI-025 Run Aggregate Epic E QA and Product Owner Finalization

**Batch 4A status:** NOT COMPLETE. Finalization is prepared only; applicable 020–023 execution, verified after states and human-owned approvals remain unsatisfied.

See [the independent domain plans and gate report](project/implementation-records/e-pbi-024-batch-4a.md).

**Epic:** Epic E — Product Information Architecture  
**Work area:** QA / Release / Product  
**Type:** Finalization  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** E5 — Finalization  
**Suggested GitHub labels:** `epic: e`, `area: qa`, `area: release`, `needs-signoff`, `priority: p0`

### Problem or opportunity

Downstream epics need a clear statement of what is implemented, approved, blocked, and safe to consume.

### Evidence

Epic D established aggregate static/preview/finalization patterns; Epic E additionally needs Admin snapshot and migration reconciliation.

### Proposed outcome

Run the aggregate gate, reconcile all Admin changes and human evidence, publish a final dependency/blocker report, and obtain Product Owner approval before F/G/J/K/L/O consume declared data.

### Scope

- Static registry/schema/tests, current read-only Admin snapshot, after-state drift, migration records, conflict/evidence status, MVP dependency readiness, and production safety.
- Record partial-domain acceptance without claiming blocked domains complete.

### Out of scope

Publishing production theme, implementing downstream UI, or resolving missing business evidence by waiver.

### Acceptance criteria

- [ ] E-PBI-024 aggregate gate passes for approved required scope.
- [ ] Every Admin change has before/after/rollback evidence.
- [ ] Remaining blockers are mapped to F/G/J/K/L/O and owners.
- [ ] Product Owner signoff states exactly which classes/domains are consumable.

### Implementation handoff

Measurement/governance with read-only Admin verification.

### Success measure

Downstream agents can start without rediscovering source authority or consuming unresolved facts.

### Dependencies

020-024 and applicable human approvals.

### Risks/cautions

Do not mark Epic E complete because schemas exist or a subset migrated.

### Testing/validation expectations

Aggregate runner, artifact freshness, Admin drift, unresolved blocker, and production-safety assertions.

### Human/Admin dependencies

Product Owner, Product Data, Technical, Operations, Legal, Support, Media, Admin, and QA signoff as applicable.

### Automation opportunities

Finalization report generator and downstream readiness matrix.

### Downstream Epic consumers

**MVP:** F,G,J,K,L,O,P as applicable. **Post-MVP:** H,I,M,N remain deferred.

### Blockers/open questions

Final required coverage thresholds by class/domain.

## Admin-Only, Code, Mixed, and Human Work Summary

| Mode | PBIs |
|---|---|
| Repository/code | 001,003,009,012,019,024 |
| Shopify Admin | 020 |
| Mixed repository/Admin | 002,006-008,010,011,014-018,021-023 |
| Product Owner/business evidence | 004,007,013 and human inputs to 006,008,010,011,014-018 |
| Measurement/governance | 005,017,025 |

## Automation Summary

### Existing automation to reuse

- JSON register/schema validation, metafield/filter cross-checks, product CSV validation, product-template/purchase checks, preview authentication and fixtures, media and support-resource validation, claims scans, Admin evidence templates, and Epic aggregate runner patterns.

### New automation represented by PBIs

- Full read-only Admin snapshot (002).
- Gap/conflict metric register (003).
- Identity, class, category, variant, SKU/barcode, and measurement checks (004-011,024).
- Reference graph and evidence validation (012-014,018,024).
- Freight, warranty, region, lead-time, and freshness checks (015-017,024).
- Definition and migration dry-run/diff tooling (019-023).
- Aggregate Epic E finalization (025).

## Stop Condition

This tracker is a planning handoff. Do not begin E-PBI-001 or any other PBI until Product Owner planning review approves a dependency-first implementation batch.
