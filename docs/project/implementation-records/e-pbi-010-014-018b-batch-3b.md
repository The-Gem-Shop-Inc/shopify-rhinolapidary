# Epic E Batch 3B — typed data and reference architecture

Completed repository work on `dev`, 2026-09-08. This resumes the E-PBI-009 foundation without rebuilding its governance. Definition architecture approval is separate from approval of any Product fact, relationship, BOM, or customer resource.

| PBI | Status | Remaining dependency |
|---|---|---|
| E-PBI-010 | Complete: atomic architecture | Technical approval of conflicting current machine facts |
| E-PBI-011 | Complete: physical-state architecture | Technical/Operations measurements and packing revision |
| E-PBI-012 | Complete: reference architecture and enforcement | Individual fit approval belongs to 013 |
| E-PBI-013 | Evidence complete; human-blocked | Actual Technical/Product Owner review of generated edges remains an unchecked acceptance criterion |
| E-PBI-014 | Complete at architecture level | C-040 BOM, quantities, optional commercial truth and merchandising decisions |
| E-PBI-018B | Complete at architecture level | Canonical File/version/language/rights and publication decisions |

Phase A defines 010, 012 and 018B first. Phase B consumes those contracts for 011, 013 and 014. The integrated validator covers all six. There were no Shopify Admin calls or mutations, no value population, and no storefront/theme work in this batch. Existing unrelated working-tree changes were preserved. E-PBI-015–017 and 020+ were not implemented.

## Atomic technical inventory

The [canonical registry](../../../data/metafield-metaobject-definitions.json) contains these 17 new approved desired-state technical definitions. All are `PRODUCT`, applicable only to machines, under namespace `rhino`; none is a Variant definition. Owner roles, conditional applicability, evidence authority, consumers, access and migration rules are attached to each definition. Technical owns the facts, Product Owner owns business approval, and Admin/Engineering owns implementation.

| Keys | Shopify type | Canonical unit/vocabulary |
|---|---|---|
| `input_voltage` | `voltage` | `volts` |
| `input_frequencies` | `list.frequency` | `hertz`; explicit discrete ratings only |
| `motor_power` | `power` | `horsepower`; confirm source convention before conversion |
| `motor_speed` | `rotational_speed` | `revolutions_per_minute` |
| `wheel_speed_min`, `wheel_speed_max` | `rotational_speed` | `revolutions_per_minute` |
| `flex_shaft_speed_min`, `flex_shaft_speed_max` | `rotational_speed` | `revolutions_per_minute` |
| `blade_diameter_min`, `blade_diameter_max` | `dimension` | `inches` |
| `wheel_diameter` | `dimension` | `inches` |
| `blade_arbor_diameter`, `wheel_arbor_diameter` | `dimension` | `inches` |
| `water_reservoir_capacity` | `volume` | `us_gallons`, after Technical confirms gallon convention |
| `cutting_oil_fill_min`, `cutting_oil_fill_max` | `volume` | `us_gallons`, operating fill rather than tank capacity |
| `water_system_type` | `single_line_text_field` | `recirculating_filtered`; no inferred default |

These measurement types and unit spellings were checked against the current [Shopify data type reference](https://shopify.dev/docs/apps/build/metafields/list-of-data-types). A printed 50–60 Hz range is not automatically converted into two approved discrete ratings. Wheel and flex-shaft speeds cannot overwrite motor speed. Range validation requires common source, Product, physical state and unit, with ordered endpoints. Typed values remain machine-readable; display formatting is not canonical storage.

Electrical phase has no located observation in the analyzed corpus. Generic capacity, generic speed ranges, operational clearances, applications/materials/skill/safety vocabularies and speculative optional configurations are deferred. C-018 does not establish a purchased variable-speed Variant. The existing Saw Blade Size variants and all separate grit/side/size/profile/pack Products remain unchanged.

The [technical evidence register](../../../data/epic-e-technical-field-evidence.json) preserves all 19 E-PBI-018A observations and all 41 conflict-register references. No conflict was resolved. The [contract](../../../data/epic-e-batch-3b-contracts.json) gives `rhino.machine_specs` an explicit property-to-field migration map; unknown properties remain evidence-only. Physical properties route to 011, shipping weight to the native field, and ambiguous speed/arbor properties require owner classification before migration.

## Measurements

Seven approved Product definitions: `rhino.net_weight` (`weight`, pounds), `rhino.assembled_length/width/height`, and `rhino.crate_length/width/height` (`dimension`, inches). Net/assembled facts are durable; crate dimensions are Operations-owned standard packing facts requiring a packing revision and are Admin-only. Technical axes, installed assemblies and fluid fill must be specified before approval. There is no generic dimensions field.

Eight distinct repository states are defined: net, assembled, operating footprint, packaged, outer crate, shipping, package count and multi-package. Only source-supported custom states receive definitions. Operating footprint, non-crate packaging and package count have no approved definitions or invented records. If a future approved purchased configuration changes packaging, Variant-scoped fields and exact E-PBI-008 evidence are required before population; the present Product fields may not conceal differing Variant fulfillment states.

Actual shipping weight remains native `ProductVariant.inventoryItem.measurement.weight`; no duplicate custom field exists. Per-package weight observations are not a competing canonical shipping weight. Multiple packages require explicit package identity/count evidence and cannot be flattened silently.

The [measurement evidence](../../../data/epic-e-measurement-evidence.json) covers all 122 Products and 125 Variants, retaining source cells and lower-authority dimensional description excerpts. Nine machines have packing-sheet observations. Native weights are 81 positive observations and 44 zero/missing. All custom measurement approvals remain outstanding; there are zero package records. Each Product lists missing approved states and missing physically classified evidence separately. Source descriptions with unclassified dimensions do not establish assembled or packaged dimensions.

## Compatibility and relationship matrix

`PRODUCT:rhino.compatible_machines` is `list.product_reference`, directed **dependent Product → exact machine Product**. Legacy `rhino.compatibility` is deprecated and explicitly references its replacement definition. No strings are translated into approved fit merely by matching a title, handle, family, tag or collection.

A Product-level edge asserts fit for every purchased Variant. Size-specific Saw Blade evidence stays in repository Variant evidence until exact mounting/size fit and commerce scope are approved; no Product-level union or speculative Variant field is created. Reverse views are derived deterministically from approved positive edges; customer derivation suppresses unavailable targets. No reciprocal copy is stored.

Unknown is explicit and never means not compatible. Negative edges require explicit negative evidence and approval. Deprecated/superseded edges preserve history; successors never inherit fit. Deleted/orphan targets block population. Unpublished targets remain in support evidence but cannot produce customer links.

| Matrix metric | Count |
|---|---:|
| Current dependent Products | 111: 54 replacement parts, 39 consumables, 18 accessories |
| Products with candidate edges | 40 |
| Products without an exact candidate, explicitly blocked/unknown | 71 |
| Candidate edges | 42 |
| Proposed | 38 |
| Blocked by collapsed Product identity | 4 |
| Approved / conflicting / explicitly not compatible / deprecated / superseded | 0 each |
| Approval-ready exact legacy identity edges | 5 |

The [matrix](../../../data/epic-e-relationship-matrix.json) includes exact GIDs, model, scope, source revision/location, excerpt, legacy identifiers, confidence, owner, blocker and publication state. Five unambiguous legacy candidates are ready for owner review: LapMaster pulleys → LapMaster 18; TrimMaster pulleys, feet, belt guard and plexiglass insert → TrimMaster 8 (`EDGE-003`, `004`, `007`, `008`, `009`). The other 33 proposed edges use explicit lower-authority description statements and need Technical confirmation. Family-only mentions are not expanded.

| Machine | Candidate edges |
|---|---:|
| EM-1 | 12 |
| JadeMaster 14 | 9 |
| LapMaster 18 | 7 |
| TrimMaster 8 | 10 |
| SawMaster 18 / 24 | 2 each, all identity-blocked |
| BeadMaster 6, ShapeMaster 6, LapMaster 12, SawMaster 36, TumbleMaster | 0 each; unknown preserved |

Automatic Feed Clamp `gid://shopify/Product/8905779871941` and Saw Vice Plate Set `gid://shopify/Product/8905784099013` retain two blocked size-specific candidates each. PO-E-012 and PO-E-013 must establish what the existing sold Product means. No fit to both machines is approved.

## Components

Five approved Product definitions: `included_products` (`list.product_reference`), `included_quantities` (`json`), `noncatalog_components` (`json`), `optional_products` and `recommended_products` (both `list.product_reference`). No component metaobject or placeholder Product is justified.

The quantity JSON is a positive-integer map whose keys must match the included Product references exactly; it cannot assert membership independently. A flat reference list cannot carry quantities, which justifies this bounded companion representation. Noncatalog JSON is limited to local counted component lines with explicit included/not-included/optional meaning; it is not an opaque machine specification bundle or a reusable identity. No catalog exclusion field is created without catalog exclusion evidence.

Included and optional relationships need Technical/Product Owner commercial approval. Recommendations need Product Owner merchandising approval and cannot become fit evidence. Likewise compatibility never supplies box contents. Optional machine configurations remain evidence until separately proven commerce decisions.

The [component packet](../../../data/epic-e-component-evidence.json) preserves 21 conflicting EM-1 BOM lines plus one explicit battery exclusion. Five wheel lines have exact candidate Product GIDs; three explicit `x2` quantities are extracted without approval. The 60-grit line is not mapped to the current 80-grit Product. C-040 remains blocked: the manual lists six wheels, the sales document says six but enumerates five and differs on grit, and the catalog has its own contents list. There are no approved components or recommendations.

## Files and resources

Five approved Product definitions, each `list.file_reference`: `manual_files`, `diagram_files`, `instruction_files`, `video_files`, `support_files`. Support references are Admin-only. Customer lists require current canonical resources with exact Product applicability, confirmed rights/publication, language and version decisions. File GIDs own binary identity; URLs are not duplicated as canonical custom data.

The [resource catalog](../../../data/epic-e-resource-catalog.json) separates evidence source, canonical resource metadata and Product-to-File assignment. Version, language, visibility, rights, owner, supersession and video readiness stay in the governed repository catalog keyed by source/File identity; no extra metaobject is needed. Resources marked obsolete/superseded cannot masquerade as current. Videos need poster, captions, transcript and performance approval before customer use.

110 sources indexed; 74 existing File identities; 10 sources with exact candidate Product association from content observations; zero approved canonical resources and zero Product-to-File assignments. Four audited exact-document duplicate groups and two probable-video groups contain 12 records. Locally hashed files have no additional duplicate group. No canonical winner or supersession is inferred from hash duplication, filename or upload date.

Existing support governance retains three published manual-page routes (EM-1, TrimMaster, ShapeMaster) and seven hidden routes. Their page approval is preserved, but it does not identify a canonical File/version. No page or File state was changed.

## Grit

Nine current grit-bearing consumable Products were inspected; EM-1 grit mentions are separately excluded because they describe included components. The existing Epic G filter is a real consumer, and current separate Products establish Product scope. Grading standard and mixed-grit semantics remain unapproved. `rhino.grit` stays proposed; its future owner is Product Owner/Technical under a dedicated Epic E abrasive-attribute contract supporting G. It is not absorbed into machine technical fields.

## Registry and dry run

| Owner / decision | Before Batch 3B | After |
|---|---:|---:|
| Product metafields | 5 (2 approved, 1 proposed, 2 deprecated) | 40 (37 approved, 1 proposed, 2 deprecated) |
| Variant metafields | 0 | 0 |
| Metaobjects | 1 approved | 1 approved |
| All approved definitions | 3 | 38 |
| All proposed / deprecated / blocked | 1 / 2 / 0 | 1 / 2 / 0 |

The [dry-run diff](../../../data/epic-e-custom-data-definition-diff.json) reports 38 create candidates and three desired-not-approved records; all no-op, conflict, incompatible-type, unexpected-live, deprecated-live and inaccessible counts are zero. Nothing was executed. The September 3 API 2026-07 zero-definition snapshot remains within its seven-day policy on September 8; it expires for mutation planning after September 10 at 17:52:28.268 UTC. Later execution still requires current evidence and E-PBI-019/020 authorization.

## Validation and reproducibility

- `npm run build:epic-e-batch-3b`: offline extraction, candidate generation and dated definition diff; passed. Python requires the already-installed `openpyxl` package. No credential or network dependency.
- `npm run validate:epic-e-batch-3b`: all previous Epic E batches 1, 2A, 2B, 2B.1 and PBI-009 checks, JSON registers, metafield reconciliation, new integrated validator and adversarial tests; passed.
- `node scripts/test-epic-e-batch-3b.js`: 62 checks passed, including valid approval/typed-value examples and rejection of invalid type/unit/scope, unproven Variants, conflicts, native weight duplication, collapsed measurement states, forbidden fit evidence, self/duplicate/orphan/wrong-class references, hidden target drift, invented approval, invalid quantities, BOM inference, invalid File identities, obsolete resources, evidence downloads, video readiness gaps, future PBIs and mutation/network code.
- `node scripts/validate-product-csv.js data/product-export/products.csv`: existing 103 failures remain: 95 missing image-alt assertions and eight nonpositive-price assertions. Before/after diagnostics match exactly. The CSV and its validator were not edited in this batch.
- Candidate and diff regeneration produced byte-for-byte identical outputs. Scoped `git diff --check` passed; Git reported only the repository's normal LF/CRLF conversion notices.

The E-PBI-009 regression that formerly hard-coded three creates now checks one create per approved definition and independently asserts all three original foundations remain approved. The original future-PBI test still rejects an uncontracted E-PBI-010 field; approved Batch 3B fields require an exact authorized key/type contract. E-PBI-015–017 and 020+ definitions are rejected regardless of planned-domain flags.

## Ranked remaining decisions

The [machine-readable decision packet](../../../data/epic-e-batch-3b-decision-packet.json) enumerates the exact affected GIDs, edge IDs, conflicts and resources. All seven decisions are pending, with no fabricated approval.

1. **Technical / Product Owner:** resolve PO-E-012 and PO-E-013 for Clamp and Vice Plate identity; unlock SKU and consequential fit decisions.
2. **Technical / Product Owner:** approve/reject the five exact legacy edges; confirm the 33 description candidates by model. Supply missing technical associations for the 71 explicitly unknown Products. Do not recreate the already-extracted matrix.
3. **Technical:** resolve the cited electrical, motor, speed, mount and reservoir conflict rows; confirm horsepower/gallon conventions and current sellable configurations.
4. **Technical / Product Owner:** resolve C-040 current EM-1 box contents, quantity and exact component identities. Confirm optional commercial meanings separately from recommendations.
5. **Operations / Technical:** approve physical axes/states and current packing revision for nine machines; address the exact 44 missing native Variant weights; supply package count/multi-package evidence only where it exists.
6. **Support / Technical / Media / Legal-Business:** review the ten content-associated resource candidates first, then model/type gaps and six duplicate groups. Confirm exact canonical version, language, rights/publication and video readiness. Page visibility alone is insufficient.
7. **Product Owner / Technical:** approve abrasive grading vocabulary and mixed-grit semantics for the future G-consumed grit contract.

Recommended next large batch: a separately authorized repository-only E-PBI-015/016/017 architecture batch, consuming this measurement/resource contract while owners resolve the ranked value decisions above. Keep Admin definition creation and all value population behind separate E-PBI-019/020 approval.

## Files delivered

New data: `epic-e-batch-3b-contracts`, `epic-e-batch-3b-extracted-evidence`, `epic-e-batch-3b-registry-before`, `epic-e-batch-3b-decision-packet`, `epic-e-technical-field-evidence`, `epic-e-measurement-evidence`, `epic-e-relationship-matrix`, `epic-e-component-evidence`, and `epic-e-resource-catalog` under `data/`. Eight corresponding contract/extraction/evidence/packet schemas were added under `schemas/`.

New tooling: `scripts/extract-epic-e-batch-3b-evidence.py`, `scripts/build-epic-e-batch-3b.js`, `scripts/validate-epic-e-batch-3b.js`, `scripts/test-epic-e-batch-3b.js`, `scripts/lib/epic-e-batch-3b-fields.js`, and `scripts/lib/epic-e-batch-3b-validation.js`.

Updated: canonical registry and schema, generated definition diff, Product data rules and schema, shared custom-data semantic validator and regression test, JSON register validator, `package.json`, Epic E tracker, architecture documentation and this implementation report. All changes are repository architecture/evidence/validation/documentation; no theme assets, templates, Liquid, or storefront scripts were changed by this batch.
