# Epic E Batch 3C — fulfillment, warranty/support and availability

Implemented on `dev`, assessed at **2026-09-09 16:14 UTC**. E-PBI-015, E-PBI-016 and E-PBI-017 are **Complete at architecture level** under the authorized Batch 3C status rules. Product assignments, legal terms and an Operations timing process remain blocked. E-PBI-017's original process-approval checklist item remains unchecked; architecture completion does not invent that approval.

No Shopify Admin mutation, Product/Variant value population, File change, storefront or theme work occurred. All pre-existing working-tree edits were preserved. No Batch 3B evidence/value approvals were changed.

## Fulfillment — E-PBI-015

[Executable contracts](../../../data/epic-e-batch-3c-contracts.json) distinguish durable Product rules, physical shipment facts, native operational configuration, policy and temporary state. Native Variant shipping weight stays authoritative; existing E-PBI-011 net/assembled/crate definitions are reused. Nine packing observations and 44 missing/nonpositive native weights remain value evidence, with no invented package counts or multi-package records.

One desired Product definition is added: **`rhino.fulfillment_class`**, `single_line_text_field`, one value, **proposed**, Admin-only, Operations owner, consumers F/J/K/O/P. The proposed `parcel`/`freight` vocabulary comes from historical policy and a concrete fulfillment-consumer need. Neither vocabulary nor Product assignments are approved. Oversized, special-handling and pickup-only vocabulary and lift-gate, appointment, residential and assembly flags lack stable supporting evidence and are deferred. No Variant metafield is added.

[Reconciliation](../../../data/epic-e-fulfillment-reconciliation.json) covers all 125 Variants. Exact native profile membership is compared with approved expectations and Operations/Admin-approved handling capabilities bound to a SHA-256 of the audited profile configuration. A mismatch produces `contradiction`; missing coverage produces `missing_profile`; missing approvals, partial data or a changed configuration hash produce `unassessed`; stale evidence produces `stale`. A `coversAllItems` profile requires separate enforcement review. Names, aggregate counts and rate amounts cannot establish freight support. Profile identities remain internal dated operational bindings.

The dated September 3 snapshot observed one General profile with 125 aggregate Variants, three locations and one active US Market. **All 125 drift rows are unassessed**, with zero certified alignments or detected contradictions: detailed membership/configuration was not captured. Credentials were unavailable, so no live refresh ran. Its seven-day window expires **2026-09-10T17:52:28.268Z**; the builder accepts an explicit assessment timestamp and marks older evidence stale. A valid definition-snapshot window does not make inventory or shipping observations live checkout promises.

The existing audit now supports `--operational`: exact Variant/profile membership, profile groups/zones/methods/conditions, location pickup settings, location inventory quantities, market countries and policy pages/native policy bodies. It remains query-only, paginated and redacted. Nested limits, scope denial and repeated cursors fail closed. Small nested limits keep query cost bounded; larger stores need an approved nested-pagination extension before those datasets can be certified complete. `Market.regions` remains a deprecated read field in the pinned API; country observations never confer checkout eligibility.

Pickup requires separate Product business permission, an active location pickup setting and current inventory/checkout eligibility. Seven descriptions mention Wisconsin year-round and Arizona January/February. They remain historical evidence with no inferred Location GID mapping. Regional rules distinguish regulatory, commercial, temporary and policy authority; supported country/subdivision identifiers validate identities only. No electrical conflict or missing restriction creates regional eligibility. No international availability is approved.

## Warranty/support — E-PBI-016

[Warranty evidence](../../../data/epic-e-warranty-support-evidence.json) covers all 122 Products. **No warranty metafield or metaobject is justified yet.** Repository schemas model policy versions, reusable term classes and exact Product mappings for review. A later Shopify storage decision requires approved shared terms and an actual consumer need.

Policy versions carry effective dates, revision/lifecycle, exact resource or native ShopPolicy identity, source-content hash and separately evidenced issuer, administrator and repair-provider roles. Marketed brand and manufacturer remain separate identity concepts; no manufacturer is inferred. Same-entity service roles require explicit equality approval. Class terms carry duration/unit/trigger/exclusions, and Product mappings carry exceptions. Missing mappings, wrong revisions, obsolete/superseded policies and changed policy content fail validation.

Existing E-PBI-018B manual/diagram/support resources and governed contact/warranty/repair destinations are reused. Resource evidence is not automatically a customer download. The local policy PDF and indexed Shopify policy File are associated as candidates; binary identity and current canonical status are unproved. No URLs, phones, emails or addresses are copied into Product metafields.

The two-page historical policy yields four blocked review candidates: base one-year coverage with exceptions, diamond-blade one-year terms, wet grinding/polishing tool 90-day terms and separately purchased motor 90-day terms. Included motors are not assigned the separately purchased motor warranty. Historical repair, shipping costs, exclusions and returns language remain claims evidence. Claims 006/007/008/009/012/013/014/015 are cross-referenced.

Eight brand/class review groups cover 122 Products, including 11 third-party brand candidates: DIALUX 2, KAAN ZIMPARA 1, Johnson Brothers Lapidary 4 and Nova Wheel 4. Current Vendor values are not rewritten. None inherits Rhino warranty. **All 122 warranty mappings remain blocked.**

## Availability — E-PBI-017

[Availability evidence](../../../data/epic-e-availability-evidence.json) retains native Product status/publication, inventory policy/tracking and contextual availability as operational authorities. The baseline has 125 `DENY` Variants, 8 tracked and 117 untracked; quantities and `availableForSale` were not audited. There are 122 unknown native availability rows and 3 rows associated with unpublished Products. Timing is unknown for all 125 Variants. `DENY` is not stock evidence; untracked is not unavailable; `CONTINUE` alone would not approve a preorder/backorder promise.

Operations is accountable, Product Owner approves semantics and Admin/Engineering owns any future integration. No actual maintainable timing source/update process was found. Indexed preorder/meeting DOCX Files are metadata evidence only, with no repository binary available; their names cannot establish a current preorder process. Historical 3–10-day and four-week claims remain blocked. No made-to-order behavior or source system is invented.

**No lead-time metafield or Shopify projection is added.** The future repository projection contract requires an approved source/process/consumer, owner, source timestamp, bounded expiry, update SLA, range, business/calendar-day basis and dispatch/delivery event. Product scope requires common timing; Variant scope requires exact parent identity, approved commerce distinction and independent fulfillment evidence. Consumption at or after expiry returns `unknown_no_timing_promise`; malformed/future timestamps also suppress timing. Missing timing never becomes “available now” or “unavailable.”

## Registry and definition reconciliation

| Count | Before | After |
|---|---:|---:|
| Product metafields | 40 | 41 |
| Variant metafields | 0 | 0 |
| Metaobjects | 1 | 1 |
| Approved | 38 | 38 |
| Proposed | 1 | 2 |
| Deprecated | 2 | 2 |
| Blocked definitions | 0 | 0 |

[Dry-run diff](../../../data/epic-e-custom-data-definition-diff.json), assessed September 9 against the September 3 zero-definition snapshot: **38 create candidates, 0 no-ops, 0 conflicts, 4 deferred/non-approved**. There is no executable mutation payload. Proposed fulfillment class and grit plus deprecated compatibility/machine JSON are deferred. The approved definitions are architecture approvals, not permission to create definitions or populate facts.

## Ranked human closure

[Machine-readable packet](../../../data/epic-e-batch-3c-decision-packet.json) contains four new decisions and all seven pending Batch 3B decisions, with affected identities and located evidence. Edit only the governed [owner-decision input](../../../data/epic-e-batch-3c-owner-decisions.json) for Batch 3C approvals; builders never write it. Approval records require identified owners, sources and timestamps. Batch 3B remains in its own approval process.

| Order | Decision | Required owner action |
|---|---|---|
| 1 | B3B-D01 | Technical/Product Owner: settle which size-specific technical item each Automatic Feed Clamp and Saw Vice Plate Set Product sells; these block identity/SKU/fit. |
| 2 | B3B-D05 | Operations/Technical: confirm physical states, packing revisions and axes; resolve 44 native weight gaps; provide package evidence only where real. |
| 3 | B3C-D01 | Operations/Product Owner/Admin: accept or revise parcel/freight vocabulary; review nine crate candidates first; approve exact assignments and configuration capabilities after the detailed audit. |
| 4 | B3C-D02 | Operations/Product Owner: confirm current pickup permission and seasonal process for the seven identified Products; identify any explicitly governed destination restrictions. |
| 5 | B3C-D03 | Legal/Business/Support/Product Owner: choose current policy revision, distinct service roles, four historical term buckets and Product exceptions; review third-party groups separately. |
| 6 | B3B-D06 | Support/Technical/Media/Legal: choose canonical resource/version, language and rights for 110 resources, including six duplicate groups; 74 have existing File GIDs, none is approved canonical. |
| 7 | B3C-D04 | Operations/Product Owner/Admin: choose native availability without timing promises or appoint a maintainable timing process with SLA/expiry/event/day semantics. |
| 8 | B3B-D03 | Technical: resolve source conflicts for machine facts, without creating speculative Variants. |
| 9 | B3B-D02 | Technical: review 42 fit edges (38 proposed, 4 blocked; zero approved), and evidence gaps for 71 dependent Products with no candidates. |
| 10 | B3B-D04 | Technical/Product Owner: resolve C-040 EM-1 BOM, exact component identities/quantities and optional contents. |
| 11 | B3B-D07 | Technical/Product Owner: settle abrasive grading and mixed-grit/pack semantics for the existing filter consumer; grit remains proposed. |

Earlier Epic E identity closure also retains **121 proposed SKU allocations** and unresolved exact-identity decisions. The approved native SKU authority is not an approval of every proposed allocation. Humans should decide the narrowed uncertainties above; they need not recreate the automated catalog, Admin tables, packing cells, policy text or candidate matrix.

## Validation and implementation files

Commands: `python scripts/extract-epic-e-batch-3c-evidence.py`; `npm run build:epic-e-batch-3c`; `npm run validate:epic-e-batch-3c`; `npm run validate:product-data -- data/product-export/products.csv`.

The integrated command preserves every previous Epic E validation, including all 62 Batch 3B adversarial checks, and adds 67 Batch 3C positive/adversarial checks. The builder deterministically regenerates 106 located evidence rows from 15 PDFs, descriptions and governance records. Validation compares current evidence hashes, rebuilt output, schemas and query-only operations. Mock audits exercise singleton policies, nested truncation and repeated cursor termination without network access.

Existing Product CSV validation remains at **103 failures: 95 missing image alt texts and 8 nonpositive prices**. CSV content, its validator and storefront/theme files are unchanged from the start of this batch. Existing npm environment warnings are unrelated.

New files:

- `data/epic-e-batch-3c-{contracts,evidence,decision-packet,owner-decisions,registry-before,source-extracts}.json`
- `data/epic-e-{fulfillment-reconciliation,warranty-support-evidence,availability-evidence}.json`
- Eight matching schemas for contracts, evidence, packet, owner decisions, source extracts, fulfillment, warranty and availability.
- `scripts/extract-epic-e-batch-3c-evidence.py`, `scripts/build-epic-e-batch-3c.js`, `scripts/validate-epic-e-batch-3c.js`, `scripts/test-epic-e-batch-3c.js`
- `scripts/lib/epic-e-batch-3c.js`, `scripts/lib/epic-e-batch-3c-contract.js`, `scripts/lib/epic-e-operational-audit.js`
- This implementation record.

Modified: canonical registry and generated definition diff; `package.json`; `scripts/audit-epic-e-admin.js` and its library; E-PBI-009/Batch 3B boundary validators to permit exactly the proposed Batch 3C definition; E-PBI-009 deferred-count test while retaining the original three deferred assertions; Epic E tracker. No Batch 3B field/value artifact was rebuilt or promoted.

## Readiness and next batch

E-PBI-009 through E-PBI-018B architecture is **substantially complete**. E-PBI-013 still requires actual compatibility owner review; architecture completion does not close that acceptance criterion. Warranty terms, handling assignments, physical/technical facts and canonical resources remain explicitly blocked at the value layer.

A consolidated human-decision closure pass is ready. E-PBI-020 has 38 dry-run architecture candidates, but execution remains unauthorized and requires the E-PBI-019 reviewed plan, applicable owner sign-off and a fresh/error-free definition reconciliation. Proposed/deprecated definitions must be excluded. E-PBI-021 is ready for bounded class/identity migration planning, with exact approved identity values and verified created definitions required before execution; unresolved identity and SKU allocations remain excluded.

Recommended next large batch: **consolidated Epic E decision closure plus detailed read-only operational reconciliation, followed by E-PBI-019 mutation-plan preparation**. Keep actual definition creation and migration as separately authorized execution steps.

API shape verification used Shopify's official [ProductVariant](https://shopify.dev/docs/api/admin-graphql/latest/objects/ProductVariant), [DeliveryProfile](https://shopify.dev/docs/api/admin-graphql/latest/objects/DeliveryProfile) and [Location](https://shopify.dev/docs/api/admin-graphql/latest/objects/Location) documentation. Native operational observations remain dated; documentation does not establish this store's live configuration.
