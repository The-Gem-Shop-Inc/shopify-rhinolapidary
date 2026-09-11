# Metafield and Metaobject Architecture

## Contract and boundary

`data/metafield-metaobject-definitions.json` is the single canonical desired-state custom-data registry. Schema version 2 makes definition identity, Shopify type/cardinality, applicability, lifecycle/decision state, evidence, ownership, consumers, access intent, validations, migration, and dated Admin reconciliation executable rather than descriptive.

The registry never authorizes Shopify mutation. An approved registry row is only eligible for a later E-PBI-019 mutation plan and E-PBI-020 definition-creation batch. Product/Variant values require still-later authorization.

Native Shopify fields remain native: title, handle, status, Product Category, Product Type, Vendor, Variant options, price, compare-at price, SKU, barcode, shipping weight, inventory, publication, and collection membership may not be duplicated as Rhino metafields.

## Approved foundations

Three desired definitions are approved:

- `PRODUCT:rhino.product_class` — one `single_line_text_field` with Shopify `choices` validation for `machine`, `replacement_part`, `consumable`, and `accessory`. It is required for all 122 current catalog Products and consumed by F/G/J/K/L/O. Tags, collections, Product Type, title, and handle are prohibited value authorities.
- `METAOBJECT:machine_family` — a reusable family entity with `name` and `description` fields. Reuse across Products, navigation, and support contexts justifies a metaobject rather than copied text.
- `PRODUCT:rhino.machine_family` — one `metaobject_reference` to the approved family entity. Membership is conditional on governed evidence and is not identity, compatibility proof, or a container for technical facts.

The Product-class definition is launch-required. The family definitions are approved foundations but are not required for launch and do not authorize family value population.

## Preserved non-approved concepts

- `rhino.compatibility` as `list.single_line_text_field` is deprecated, noncanonical, inaccessible to customer consumers, and forbidden for new values. E-PBI-012 owns its replacement relation architecture.
- `rhino.machine_specs` as opaque JSON is deprecated, noncanonical, and forbidden for new values. E-PBI-010 owns atomic technical/electrical replacements.
- `rhino.grit` remains a proposed legacy registry concept. Its current text type is evidence, not an approved final contract; it cannot enter a definition plan until type, vocabulary, and value authority are approved.

Future domains E-PBI-010 through E-PBI-018B are represented only as planned dependencies. No speculative namespace, key, type, or final relation was created.

## Typed-data and lifecycle rules

- Prefer standard Shopify fields, then typed atomic metafields, then reusable justified metaobjects.
- Prefer references to duplicated names and use lists only for true cardinality.
- Use Product references for exact Product relations only after their owning PBI approves them.
- Do not use tags or collections as custom-data substitutes.
- Do not serialize unknown or conflicting evidence as approved values.
- Deprecated definitions require a replacement definition or owning replacement PBI and preserve migration/rollback history.
- Approved and launch-required definitions require evidence, approval, operational, and Admin/Engineering ownership; `TBD` is rejected.

## Snapshot reconciliation and dry run

`data/epic-e-custom-data-definition-diff.json` compares the approved registry to the hashed 2026-09-03 Admin API 2026-07 snapshot. The snapshot observed zero Product, Product Variant, Collection, and metaobject definitions. The resulting dry run reports three `create` candidates, three non-approved/deferred concepts, and zero no-ops, conflicts, incompatible types, unexpected live definitions, or inaccessible datasets.

The zero-definition observation is dated, not perpetual. The registry permits a maximum snapshot age of seven days for mutation planning and requires refresh after 2026-09-10T17:52:28.268Z, on query errors, or whenever E-PBI-019 determines drift could invalidate a plan. Fixture tests cover no-op, conflict, incompatible type, unexpected/deprecated live state, inaccessible datasets, and staleness without fabricating those states in the real artifact.

## Safety

E-PBI-009 generated no GraphQL mutation document and created no Shopify definition or value. The repository diff is a prerequisite input only; E-PBI-019 remains mandatory before E-PBI-020.
# Batch 3B continuation — 2026-09-08

The [Batch 3B contract](../../data/epic-e-batch-3b-contracts.json) now supplies the approved technical, measurement, compatibility, component and File-reference definitions to the E-PBI-009 registry. The [implementation report](../project/implementation-records/e-pbi-010-014-018b-batch-3b.md) records exact fields, evidence gaps, migration paths, validation and independent PBI statuses. Historical Batch 3A counts below describe the earlier baseline; current counts are 40 Product metafields, zero Variant metafields and one metaobject, with 38 approved architectures, one proposed and two deprecated.

Only definitions are approved as repository architecture. All generated fit/BOM/File assignments and conflicting values remain unapproved. E-PBI-013 is evidence-complete and human-blocked. No Shopify Admin or storefront work occurred in Batch 3B.
