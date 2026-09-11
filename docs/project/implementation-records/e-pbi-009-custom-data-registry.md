# E-PBI-009 Desired-State Custom-Data Registry and Schema

**Completed:** 2026-09-04  
**Scope:** Repository contract only  
**Stop line:** E-PBI-010 not implemented; no Shopify Admin mutation

## Outcome

The existing `data/metafield-metaobject-definitions.json` registry was upgraded in place from four minimally described Product metafields and one minimally described metaobject, all with `owner: TBD`, to a governed schema-version-2 contract. The registry now contains five Product metafield concepts and one metaobject: three approved, one proposed, two deprecated, and zero blocked. Product Variant and Collection definition counts remain zero.

Approved desired definitions are:

- `PRODUCT:rhino.product_class`, a required canonical `single_line_text_field` with Shopify `choices` for the approved four-value class vocabulary.
- `METAOBJECT:machine_family`, a reusable two-field family entity justified by shared use across Products, navigation, and support contexts.
- `PRODUCT:rhino.machine_family`, a conditional `metaobject_reference` that centralizes family membership without asserting identity, compatibility, or technical facts.

The legacy `rhino.compatibility` string list is deprecated under E-PBI-012 replacement authority. The legacy `rhino.machine_specs` JSON is deprecated under E-PBI-010 replacement authority. Neither is customer-facing or permitted new values. `rhino.grit` remains proposed because its final type, vocabulary, and value authority are not yet approved.

## Admin reconciliation and migration boundary

The generated `data/epic-e-custom-data-definition-diff.json` binds the registry and the read-only 2026-09-03 Admin API 2026-07 snapshot by SHA-256. The snapshot observed zero Product, Product Variant, Collection, and metaobject definitions without query errors. The real dry run therefore reports three `create`, three `desired_not_approved`, and zero for no-op, conflict, incompatible type, unexpected live, deprecated-still-live, and inaccessible/not-audited.

The snapshot is current for repository reconciliation as of 2026-09-04. The registry's seven-day mutation-planning freshness policy requires a refresh after 2026-09-10T17:52:28.268Z, on query errors, or when E-PBI-019 drift checks require it. A create result is not execution authority: E-PBI-019 and E-PBI-020 remain mandatory.

## Validation

Schema and semantic validation cover unique owner/namespace/key identity, Product-class vocabulary and 122-row evidence, owner roles, consumers, access, type/cardinality, native-field exclusions, deprecated replacement authority, future-PBI isolation, justified metaobjects, filter references, registry statistics, snapshot hashes, freshness, and all diff states. Negative tests reject all required unsafe cases, including native SKU/Vendor/Category/shipping-weight duplicates and any Admin mutation code in production diff tooling.

## Safety

No Shopify Admin query or mutation was executed. No metafield/metaobject definition, Product/Variant value, SKU, Category, Vendor, theme, publication, or production state was changed. No E-PBI-010 field was designed.
