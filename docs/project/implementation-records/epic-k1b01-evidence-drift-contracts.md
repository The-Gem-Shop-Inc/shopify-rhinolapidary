# Epic K1B-01 operational evidence and configuration drift contracts

**Date:** 2026-10-23

**PBI:** K-PBI-002 (partial repository foundation)

**Base:** `epic-k/k1a-fulfillment-policy-contracts` at `7bd20d4bf6c90f5dbe2399168fc4daf889d7536f`

**Implementation branch:** `epic-k/k1b01-evidence-drift-contracts`

**Authority:** Repository contracts, deterministic validators, synthetic fixtures, tests, and this record only

## Outcome and boundaries

K1B-01 adds an offline intake contract for the eight existing `K-EVID-*` requirements and a normalized intermediate contract for a future, separately authorized Shopify configuration audit. It does not change the accepted K1A policy or routing evaluator.

All committed configuration examples and receipt examples are synthetic. The authoritative intake file contains no receipts. The deterministic gap report therefore leaves all eight requirements `BLOCKED`. The synthetic configuration report demonstrates comparison behavior only and leaves live checkout enforcement `UNVERIFIED` and operational readiness `BLOCKED`.

No Shopify Admin API, Shopify CLI, storefront, theme, customer, order, or carrier system was accessed. No business approval was created or renewed. The expired Epic E/F authority remains expired, and Epic J, G, and L ownership boundaries remain unchanged.

## Implemented contracts

- `data/epic-k-evidence-receipts.json` is the versioned intake register. A receipt records its `K-EVID-*` requirement, category, authoritative owner role, sanitized source reference, exact subject identifiers and scope, collection time, verification status, explicit validity information, supported facts, and assertions. The initial register is intentionally empty.
- `schemas/epic-k-evidence-receipts.schema.json` rejects malformed receipts and unsupported categories. It supports partial or available evidence without treating either as accepted.
- `schemas/epic-k-shopify-config-snapshot.schema.json` defines a sanitized normalized representation for profiles and assignments, zones, rates, shipping promotions, markets, pickup locations, Product logistics, completeness, provenance, collection time, and explicit validity. It is not a representation of an actual Shopify API response.
- `schemas/epic-k-evidence-drift-report.schema.json` requires the explicit states `PASS`, `FAIL`, `BLOCKED`, and `UNVERIFIED`, plus the global statement that live checkout enforcement is `UNVERIFIED`.

## Verification behavior

`scripts/lib/epic-k-evidence-drift.js` supplies two pure assessments with explicit clock input:

1. `verifyEvidence` validates receipt structure, requirement/category ownership, complete scope, acceptance status, explicit validity intervals, duplicate IDs, duplicate source/subject receipts, and conflicting assertions. Missing, partial, expired, unsupported, or synthetic evidence cannot satisfy a readiness gate. No universal evidence lifetime is inferred.
2. `assessConfigurationDrift` compares a normalized snapshot with the provisional K1A policy. It checks zero-cost and threshold free-shipping paths, incomplete discount evidence, machine/profile assignments, Grafton pickup eligibility and readiness, 50-state and international zone scope, Alaska/Hawaii approval, Product shipping weights and package status, and source freshness.

A domain-level `PASS` means that the supplied complete dataset passed that comparison only. Shipping profiles alone do not prove every checkout bypass is blocked. A configured zone does not prove a market is available to checkout. An active pickup location does not prove Product eligibility or inventory readiness.

## Deterministic reports

- `data/epic-k-evidence-gap-report.json`: authoritative intake comparison, `BLOCKED`; all eight `K-EVID-*` requirements are missing accepted receipts.
- `tests/fixtures/epic-k-synthetic-config-drift-report.json`: synthetic comparison, five scoped domain checks `PASS` and evidence freshness `UNVERIFIED`; overall result `UNVERIFIED`, operational readiness `BLOCKED`, live checkout enforcement `UNVERIFIED`.

Both files are reproduced exactly by `npm run validate:epic-k-evidence`. A stale committed report fails validation.

## Synthetic fixture inventory

`tests/fixtures/epic-k-evidence-drift-fixtures.json` contains:

- one synthetic, structurally valid receipt and parameterized cases for missing or unsupported ownership, unsupported scope, duplicates, conflicts, expiration, partial evidence, available-but-unaccepted evidence, and synthetic authority attempts;
- one complete normalized synthetic snapshot with synthetic profiles, 50-state zone, paid rates, Alaska/Hawaii approval markers, market, Grafton pickup state, and synthetic Product logistics;
- parameterized drift cases for zero-cost and threshold free shipping, missing discounts, permissive or missing machine profiles, unknown pickup eligibility, missing location readiness, an international zone without market evidence, unapproved Alaska rates, missing or zero weights, and expired snapshot evidence.

Fixtures contain no Shopify GIDs, customer addresses, credentials, draft orders, private insurance documents, or unredacted exports. Restricted raw evidence collected in a future batch must remain in approved restricted storage; only redacted references, digests, and sanitized summaries may enter the repository.

## Actual evidence gaps

The canonical report requires authoritative receipts for all eight categories:

1. `K-EVID-001` — exact Product/Variant pickup eligibility from established Epic E/F and Grafton owners. Expired E/F authority is not renewed here.
2. `K-EVID-002` — Grafton location, inventory, and operating readiness.
3. `K-EVID-003` — packed weights, package count, dimensions, units, and inclusions through Epic E/F and shipping ownership.
4. `K-EVID-004` — approved paid services, regions, Product eligibility, and service limitations.
5. `K-EVID-005` — separately approved Alaska and Hawaii rates and confirmed availability.
6. `K-EVID-006` — carrier insurance availability, documented cost, applicable service, and selection handling.
7. `K-EVID-007` — Rhino contact process, carrier filing responsibility, and internal Rhino-delivery claims process through Shipping, Customer Service, and Epic L.
8. `K-EVID-008` — named quotation approver, complete scope, destination and delivery inputs, insurance selection, and expiration.

## Shopify datasets required by a future authorized audit

A future read-only collection needs sanitized, point-in-time datasets for:

- delivery/shipping profiles, every Product or Variant assignment, default/fallback assignment behavior, and unassigned Products;
- shipping zones, countries, states, territories, rate definitions, thresholds, conditions, carrier-calculated services, and profile relationships;
- automatic discounts, discount codes, app-managed promotions, scripts or functions, and any other rule capable of reducing shipping to zero;
- Markets country availability and evidence linking a configured market to actual checkout availability;
- locations, Grafton pickup activation, pickup eligibility rules, inventory routing/readiness, and Product/Variant availability;
- Product and Variant `requires shipping` state, shipping weights and units, classifications, and any source for package count or dimensions;
- store package definitions and relevant fulfillment/location ownership;
- API version, query or export definition, collection time, sanitized source reference, collector role, dataset completeness, and any owner-defined validity interval.

## Shopify assumptions still requiring verification

The batch does not assume an Admin API shape. K1B-02 must verify which current authorized API surfaces or sanitized Admin exports expose profile assignments, zone/rate conditions, discount sources, pickup configuration, Markets availability, Product logistics, package definitions, and plan-dependent capabilities. It must also verify whether app-managed rates or discounts are visible in those sources, how fallback profile assignment works, and which settings can demonstrate checkout exposure. None of these mappings is established by the normalized schema.

## Commands and results

The dedicated commands are:

```powershell
npm run validate:epic-k-evidence
npm run test:epic-k-evidence
npm run validate:epic-k-k1b01
```

Final verification results:

| Command | Exit | Result |
| --- | ---: | --- |
| `npm run validate:epic-k-evidence` | 0 | Contracts and deterministic reports valid; 8 evidence requirements `BLOCKED` |
| `npm run test:epic-k-evidence` | 0 | 33/33 tests passed |
| `npm run validate:epic-k-k1a` | 0 | 16 routing scenarios and 73/73 policy tests passed |
| `npm run validate:epic-k-k1b01` | 0 | K1A plus K1B-01 validation and test gate passed |
| `npm run validate:registers` | 0 | All registered JSON contracts valid |
| `npm run validate:cart-config` | 0 | Cart configuration passed (`cart_type=notification`) |
| `npm run validate:product-purchase` | 0 | Product purchase architecture passed |
| `npm run validate:theme-architecture` | 0 | Navigation, design tokens, CSS, storefront JS, and Rhino sections passed |

The recurring npm warning about the future removal of the `min-release-age` environment configuration did not affect exit status. No browser, live checkout, Shopify integration, or operational readiness test was run or reported as passed.

## Status and next batch

K-PBI-002 remains **partial**. Repository receipt intake, normalized snapshot, comparison states, deterministic reports, and synthetic regression coverage are implemented. Current Shopify configuration, operational evidence, live checkout behavior, and actual Product readiness remain blocked or unverified.

Recommended K1B-02 scope is a separately authorized, read-only collection and attachment batch:

1. approve the current Shopify source surfaces, API version or sanitized export method, access scope, redaction rules, and evidence owners;
2. collect all datasets listed above without mutations and record completeness and provenance;
3. document the mapping from each source field to the normalized snapshot contract;
4. attach sanitized evidence receipts from established owners, preserving expired E/F status until those owners explicitly renew it;
5. run the offline evidence and drift assessments, triage `FAIL`, `BLOCKED`, and `UNVERIFIED` results, and retain live checkout enforcement as unverified until a separately authorized integration assessment is completed.
