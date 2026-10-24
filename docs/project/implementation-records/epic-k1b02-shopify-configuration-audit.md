# Epic K1B-02 — Authorized Shopify configuration audit

Date: 2026-10-24
Branch: `epic-k/k1b02-shopify-configuration-audit`
Baseline: `b2fc52a4feaee5a12bf788ab23dcffca138236b4`
Scope: repository collector, normalized mapping, authenticated read-only collection, sanitized evidence, deterministic drift assessment, and tests

## Baseline and boundaries

The baseline commit exactly matched the required accepted K1B-01-R commit. The working tree already contained staged, modified, and untracked Epic J work. K1B-02 preserved those files and excludes them from its commit.

The audit used an authenticated Shopify connector whose connected store identity matched `rhino-lapidary.myshopify.com`. It executed Admin GraphQL `query` operations only. No GraphQL mutation, Shopify CLI store operation, theme operation, checkout, order, draft order, payment, customer action, or configuration change occurred.

The repository's existing Epic E local Admin collector defaults to API `2026-07`. The connected Shopify schema reported Admin API `2026-10`, which is the version recorded for this audit and the default for the new K1B-02 collector. The source mapping records the version boundary rather than treating the two schemas as interchangeable. During schema verification, `DeliveryCountry.code` required the 2026-10 object selection `{ countryCode restOfWorld }`. Query cost also required Product Variant and delivery-profile collection to be split and paginated.

## Source mapping

[`data/epic-k-shopify-source-mapping.json`](../../../data/epic-k-shopify-source-mapping.json) maps every normalized domain to its Admin GraphQL source, read permission, transformation, pagination rule, Shopify authority limit, operational owner dependency, and inaccessible-field behavior. Its schema is [`schemas/epic-k-shopify-source-mapping.schema.json`](../../../schemas/epic-k-shopify-source-mapping.schema.json).

The mapping was verified against the connected schema and Shopify's versioned Admin GraphQL documentation for `deliveryProfiles`, `discountNodes`, `markets`, `locations`, `InventoryItem`, and `DeliveryMethodDefinition`. The mapping deliberately leaves these facts unresolved:

Shopify source verification is recorded separately from Product Owner acceptance of the normalization mapping. The October 24 source mapping is verified, its Product Owner mapping acceptance remains `pending`, read-only collection was authorized, and operational authority remains `blocked`.

- Shipping profiles do not prove quotation-only checkout enforcement.
- An active Market or shipping zone does not prove successful checkout availability.
- Carrier-calculated rates do not reveal every customer's final shipping price.
- Shopify inventory does not confer warehouse pickup readiness.
- Shopify Product data does not renew expired Epic E/F classification or packed-measurement authority.
- No reliable Product/Variant pickup-approval source was identified.
- No complete per-Variant package or crate-dimension source was identified.

## Reproducible read-only procedure

The reusable collector is [`scripts/audit-epic-k-shopify-config.js`](../../../scripts/audit-epic-k-shopify-config.js), backed by [`scripts/lib/epic-k-shopify-audit.js`](../../../scripts/lib/epic-k-shopify-audit.js). It:

1. Requires a valid explicit `--assessment-time`.
2. Requires `SHOPIFY_ADMIN_ACCESS_TOKEN` and the authorized store domain.
3. Rejects every operation that is not an explicit GraphQL `query` and rejects any document containing `mutation`.
4. Uses Admin API `2026-10` unless `EPIC_K_SHOPIFY_API_VERSION` explicitly selects another reviewed version.
5. Exhausts top-level pagination and treats absent cursors, access failures, query failures, and partial datasets as failures rather than clean absence.
6. Does not persist raw Admin responses by default. Explicit retention requires an existing, approved absolute directory outside the repository, configured with `EPIC_K_RAW_EVIDENCE_DIRECTORY` and `EPIC_K_RAW_EVIDENCE_APPROVED=true`.
7. Replaces Shopify GIDs with deterministic prefixed references before producing a sanitized snapshot candidate.

Command:

```powershell
npm run audit:epic-k-shopify -- --assessment-time=2026-10-24T14:29:27.286Z
```

The interactive connector used for this audit did not expose its token to the repository process. Its raw responses were processed transiently and were not persisted. The committed snapshot contains no raw Shopify GIDs, credentials, customer data, location addresses, or authentication headers. A future retained raw export must remain outside Git in access-controlled, encrypted storage with a retention and redaction review.

## Collection completeness and provenance

The committed provenance is [`data/epic-k-shopify-audit-provenance-2026-10-24.json`](../../../data/epic-k-shopify-audit-provenance-2026-10-24.json).

| Dataset | Result | Records | Pages | Authority limit |
|---|---:|---:|---:|---|
| Store identity and granted access | Complete | 1 | 1 | Confirms the connected store and query access only |
| Shipping profiles, assignments, zones, and methods | Complete | 1 profile; 122 Products; 5 methods | 15 | Does not prove quotation enforcement |
| Discounts | Complete | 0 | 1 | Does not negate shipping-profile zero-cost rates |
| Markets | Complete | 1 | 1 | Does not prove checkout availability |
| Locations and pickup configuration | Complete | 3 | 1 | Does not prove Product eligibility or operations readiness |
| Product Variant logistics | Partial | 125 | 5 | Classification and packed package authority unavailable |
| Shopify Functions | Complete | 0 | 1 | No installed Function was returned by this query |
| Package/crate characteristics | Unsupported | 0 | 5 Product pages inspected | Requires independent Product/warehouse evidence |

All final connections were exhausted without remaining pagination cursors. Three initial read-only discovery operations were corrected before final collection: one 2026-10 field-shape mismatch and two query-cost overages. They made no mutation and did not reduce final dataset completeness.

## Confirmed Shopify configuration

The schema-valid sanitized snapshot is [`data/epic-k-shopify-config-snapshot-2026-10-24.json`](../../../data/epic-k-shopify-config-snapshot-2026-10-24.json).

- One General delivery profile was returned. It contained 122 Product assignments covering 125 Variants. Its profile data does not establish quotation enforcement for machinery.
- The Domestic zone included the 50 states plus District of Columbia, territories, and armed-forces destination codes. Its active methods were an $8 Standard rate, a $0 Standard rate when order price is at least $70, and a $15 Express rate.
- An International zone included 27 countries. Active USPS and DHL Express carrier-calculated methods were configured. Their final effective prices were unavailable and remain `UNVERIFIED`.
- No DiscountNode and no Shopify Function record was returned.
- One active United States Market was returned. No active international Market was returned. The audit did not execute checkout, so international checkout availability remains `UNVERIFIED` despite the configured international zone.
- Three locations were returned. None had `localPickupSettingsV2`; no location was treated as approved Grafton pickup, and no Product pickup eligibility was inferred.
- All 125 Variants required shipping. Forty-four had a configured weight of zero and 81 had a positive configured weight. Eight Variants reported positive tracked aggregate inventory, 117 were untracked, and 21 had at least one location with positive available quantity in the collected inventory-level data. These Shopify inventory states do not establish Grafton readiness. Positive Shopify weights remain `available`, not accepted packed-weight evidence. Package and crate characteristics remain missing.
- Product type was blank across the collected Variants. K1B-02 did not reuse expired Epic E/F authority to classify real Products as machines, parts, accessories, or consumables.

These are current configuration observations from the authorized read-only collection. They are not operational approvals, carrier commitments, checkout test results, or customer promises.

## Drift assessment

The deterministic report is [`data/epic-k-shopify-configuration-drift-report-2026-10-24.json`](../../../data/epic-k-shopify-configuration-drift-report-2026-10-24.json).

| Domain | State | Evidence and consequence |
|---|---|---|
| Free shipping | `FAIL` | The active $0 Standard rate at the $70 threshold contradicts provisional K-DEC-001. No setting was changed. |
| Machine shipping | `BLOCKED` | Product classification authority and quotation enforcement evidence are absent. A profile assignment cannot prove all shipped machinery is quoted before payment. |
| Grafton pickup | `BLOCKED` | No returned location had pickup enabled, no authoritative Grafton mapping exists, and Product eligibility plus readiness receipts are missing. |
| Geography | `FAIL` | The Domestic zone contains `AA, AE, AP, AS, DC, FM, GU, MH, MP, PR, PW, VI`, which is a confirmed configured-scope discrepancy. International checkout remains independently `UNVERIFIED`, and Alaska/Hawaii operational rate approvals remain absent. |
| Product logistics | `FAIL` | Forty-four shippable Variants have zero configured weight. Positive values do not satisfy packed-weight or package authority. |
| Evidence freshness | `BLOCKED` | Collection chronology is valid and Shopify source identity is verified, but Product Owner acceptance of the normalization mapping remains pending. Collection authorization does not confer mapping or operational approval. |

Overall configuration drift is `FAIL`. Operational readiness remains `BLOCKED`, and live checkout enforcement remains `UNVERIFIED`.

## Operational evidence separation

No new authoritative operational receipt was supplied. The existing eight requirements remain unchanged:

| Requirement | Status | Owner dependency |
|---|---|---|
| K-EVID-001 Product/Variant pickup eligibility | `BLOCKED` | Epic E/F Product owners and Product Owner |
| K-EVID-002 Grafton inventory/location readiness | `BLOCKED` | Grafton or inventory operations |
| K-EVID-003 shipping weights/package characteristics | `BLOCKED` | Epic E/F Product owners and warehouse operations |
| K-EVID-004 approved shipping services/regions | `BLOCKED` | Shipping operations |
| K-EVID-005 Alaska/Hawaii rates | `BLOCKED` | Shipping operations and finance |
| K-EVID-006 carrier insurance options | `BLOCKED` | Shipping operations and finance |
| K-EVID-007 claims contacts/responsibilities | `BLOCKED` | Customer service and shipping operations |
| K-EVID-008 quotation approval/scope/expiration | `BLOCKED` | Warehouse or shipping operations |

The Shopify snapshot is configuration evidence. It does not satisfy any of these operational requirements.

## Automated tests

[`tests/fixtures/epic-k-shopify-collector-responses.json`](../../../tests/fixtures/epic-k-shopify-collector-responses.json) contains synthetic Admin-response shapes only. It exercises multiple profiles and assignments, pagination, permission failures, fixed and conditional rates, carrier uncertainty, free-shipping discounts, shipping Functions, international Market states, Alaska/Hawaii approval separation, pickup/inventory authority boundaries, weights, packages, partial datasets, failed queries, explicit clocks, sanitization, and the live-enforcement boundary.

`npm run test:epic-k-collector` now contains 43 independent positive and negative tests. `npm run test:epic-k-evidence` contains 62 tests. `npm run validate:epic-k-shopify-audit` validates the mapping, snapshot, provenance, deterministic report, zero-mutation invariant, eight blocked evidence categories, sanitization, chronology, authority boundaries, and expected live findings.

## K1B-02-R audit safety corrections

Review of K1B-02 identified six repository defects. This correction batch made no Shopify query and preserved the October 24 sanitized observations.

1. The collector accepted a configurable destination without enforcing the authorized store and did not fail closed on `shop.myshopifyDomain`. It now validates the exact destination before any request, verifies the returned Rhino identity before subsequent queries, and refuses to normalize unverified or mismatched live evidence.
2. Geography used one precedence chain, so international uncertainty masked confirmed domestic scope drift and Alaska/Hawaii approval gaps. The stable `geography` result now aggregates independent domestic scope, international checkout, Alaska approval, and Hawaii approval findings.
3. An active `reduced_shipping` discount could pass without proof that its effective charge stayed positive. The contract now requires an explicit effective-price status, and the evaluator blocks unknown effects.
4. The standalone collector persisted raw Admin responses under `test-results` by default. Raw processing is now transient by default; optional retention requires explicit approval and an existing external directory that resolves outside the repository.
5. Normalization treated nonsynthetic Shopify data as an approved mapping. Source verification, Product Owner mapping acceptance, collection authorization, and operational authority are now separate contract fields. The October 24 mapping acceptance remains pending and all external authority remains blocked.
6. Timestamp checks used permissive parsing and did not fully enforce chronology. Collection and assessment use the shared strict parser; assessment must follow collection, and a failed chronology gate cannot pass freshness.

Regression coverage includes wrong destination before network access, missing and mismatched identity, failed normalization after identity failure, transient raw handling, unsafe retention paths, strict clock ordering, unresolved reduced-shipping effects, independent geography findings, all 12 configured out-of-scope codes, Alaska/Hawaii visibility, and concurrent geographic discrepancies.

Verification on 2026-10-24:

| Command | Exit | Result |
|---|---:|---|
| `npm run validate:epic-k-evidence` | 0 | Contracts valid; 8/8 operational requirements blocked |
| `npm run test:epic-k-evidence` | 0 | 62/62 passed |
| `npm run validate:epic-k-k1b01` | 0 | K1A 73/73 and evidence 62/62 passed |
| `npm run validate:epic-k-k1a` | 0 | 73/73 passed |
| `npm run validate:registers` | 0 | 69 schema/data targets valid |
| `npm run validate:cart-config` | 0 | Passed; `cart_type=notification` |
| `npm run validate:product-purchase` | 0 | Product purchase architecture passed |
| `npm run validate:theme-architecture` | 0 | 31 routes, 102 tokens, CSS, one storefront event, and Rhino sections passed |
| `npm run validate:epic-k-shopify-audit` | 0 | Mapping, sanitized snapshot, provenance, chronology, authority boundaries, deterministic drift, and zero-impact invariants passed; 3 FAIL, 3 BLOCKED, 0 aggregate UNVERIFIED findings |
| `npm run validate:epic-k-k1b02` | 0 | Aggregate K1A, K1B-01, audit, 73/73 policy tests, 62/62 evidence tests, and 43/43 collector tests passed |
| `npm run test:epic-k-collector` | 0 | 43/43 passed |

The recurring npm warning about `min-release-age` is environmental and did not affect exit codes.

## Customer and merchant impact

No action affected Shopify data, customer experience, orders, payments, checkout, inventory, shipping settings, Markets, pickup, themes, or publication. The audit executed read-only queries and created repository artifacts only.

## PBI status

| PBI | Status | Basis |
|---|---|---|
| K-PBI-002 | `PARTIAL_CONFIGURATION_AUDIT_COMPLETE` | Source mapping, collector, adapter, authenticated snapshot, drift report, and tests exist; operational evidence, policy remediation, and checkout integration acceptance remain incomplete |
| Epic K operational readiness | `BLOCKED` | All eight external evidence requirements remain blocked |
| Shopify configuration compliance | `FAIL_WITH_BLOCKED_AND_UNVERIFIED_DOMAINS` | Confirmed free-shipping, domestic destination-scope, and zero-weight discrepancies coexist with blocked/unverified routing domains |
| Shopify checkout enforcement | `UNVERIFIED` | No checkout transaction or separately authorized integration assessment occurred |

K-PBI-002 and Epic K are not complete.

## Required business and Admin follow-up

1. Product Owner and shipping/finance owners must decide the remediation order for the confirmed $70 zero-cost shipping rate. This audit does not authorize its removal.
2. Shipping operations and finance must provide separate accepted Alaska and Hawaii service/rate evidence before invoicing.
3. Product Owner must decide whether the configured international zone should remain while international fulfillment is outside initial scope; a later checkout audit must establish actual exposure.
4. Epic E/F Product owners and warehouse operations must renew authoritative classification, packed weights, and package/crate characteristics without reusing expired receipts.
5. Operations must identify the Grafton Shopify location, establish readiness, and approve explicit Product/Variant eligibility before pickup can be enabled.
6. Shipping operations must define approved services, carrier-calculated-rate handling, insurance choices, and quote validity evidence.
7. Customer service and shipping operations must approve claims contacts and responsibilities.
8. Product Owner must explicitly accept or reject the verified Shopify-to-normalized mapping; read-only audit authorization does not supply that acceptance.

## Recommended next dependency-ordered batch

K1B-03 should attach authoritative operational receipts without changing Shopify: first Product classification and logistics ownership, then Grafton location/eligibility readiness, then shipping-service and Alaska/Hawaii approvals, followed by insurance, claims, and quotation-owner evidence. After those receipts pass, a separately authorized K1C configuration-remediation plan can propose removal of the confirmed free-shipping path and safe machine/pickup routing changes. A later checkout integration assessment should validate mixed carts, quotation bypass resistance, Market exposure, and effective carrier/discount behavior without paid transactions.
