# Epic K1B-03A — Offline configuration remediation preflight

Date: 2026-10-24
Branch: `epic-k/k1b03a-remediation-preflight`
Baseline: `226785454b4b84daa60f7dfd6cd294bda3a31454`
Parent PBI: `K-PBI-002` (`PARTIAL`)

## Scope and authority

K1B-03A models two configuration corrections against an isolated copy of the October 24 sanitized Shopify snapshot. It contains no Shopify query, credential, GraphQL mutation, Admin automation, checkout transaction, or executable configuration-change script. The proposal state is `proposal_only`; execution and Shopify access are explicitly unauthorized.

The source snapshot remains [`data/epic-k-shopify-config-snapshot-2026-10-24.json`](../../../data/epic-k-shopify-config-snapshot-2026-10-24.json). Its canonical SHA-256 fingerprint is `1af808e320832c642cab0dbec5a3e8afaf2995e97d224e496a97acf7917b0ab2`. The validator rejects a different store, synthetic evidence, ambiguous targets, or provenance that does not match audit `K1B02-AUDIT-2026-10-24`.

## Observed defects and candidate changes

The machine-readable proposal is [`data/epic-k-shopify-remediation-proposal-2026-10-24.json`](../../../data/epic-k-shopify-remediation-proposal-2026-10-24.json), governed by [`schemas/epic-k-remediation-proposal.schema.json`](../../../schemas/epic-k-remediation-proposal.schema.json).

| Candidate | Observed evidence | Proposal-only transformation | Policy basis |
|---|---|---|---|
| `K-REM-001` | `RATE_30FCB2E66D59853D` is the sole active `threshold_free` rate with `amountCents=0` and `thresholdCents=7000` | Remove that rate from the isolated projection. A future approved batch may remove or deactivate the rule. No replacement is selected. | Provisional `K-DEC-001` |
| `K-REM-002` | `ZONE_8FBCE0BCBE55E5F2` is the sole US zone and contains `AA, AE, AP, AS, DC, FM, GU, MH, MP, PR, PW, VI` beyond the approved 50 states | Replace only the projected zone subdivision list with the canonical 50 states | Provisional `K-DEC-003`, `K-DEC-004`, `K-DEC-019` |

The projection preserves the observed $8 and $15 flat-rate records as configuration evidence. It leaves both carrier-calculated rates unresolved, retains Alaska and Hawaii, and makes no change to the international zone, Products, locations, Markets, pickup data, profiles, inventory, weights, or operational authority.

## Current and projected drift

The deterministic projected report is [`data/epic-k-shopify-remediation-projected-drift-report-2026-10-24.json`](../../../data/epic-k-shopify-remediation-projected-drift-report-2026-10-24.json).

| Domain | Current | Projected | Bounded interpretation |
|---|---|---|---|
| Free shipping | `FAIL` | `BLOCKED` | The observed $0 threshold path is absent, but carrier-calculated final prices remain unverified; the projection cannot establish a positive charge for every cart. |
| Machine shipping | `BLOCKED` | `BLOCKED` | Product classification and quotation enforcement remain unresolved. |
| Grafton pickup | `BLOCKED` | `BLOCKED` | Location mapping, Product eligibility, and readiness remain unresolved. |
| Geography aggregate | `FAIL` | `FAIL` | Domestic scope becomes `PASS`; international checkout remains `UNVERIFIED`; Alaska and Hawaii approval findings remain `FAIL`. |
| Product logistics | `FAIL` | `FAIL` | All 125 Product/Variant records are unchanged, including 44 zero-weight shippable Variants. |
| Evidence freshness | `BLOCKED` | `BLOCKED` | Product Owner mapping acceptance remains pending. |
| Live checkout enforcement | `UNVERIFIED` | `UNVERIFIED` | No integration or checkout test occurred. |

The projection proves that the two pure transformations produce the expected repository comparison when applied to the committed sanitized evidence. It does not prove that Shopify currently has the projected configuration, that another free-shipping path cannot exist, that every checkout route is controlled, or that any shipping service, rate, pickup route, Product measurement, or operational approval is commercially ready.

## Required authority before a future Shopify change

An eventual Admin batch requires all of the following:

1. Explicit Product Owner authorization for the exact removal or deactivation of `RATE_30FCB2E66D59853D` and removal of the twelve named subdivision codes from `ZONE_8FBCE0BCBE55E5F2`.
2. Fresh authorized read-only evidence confirming both targets still exist and match unambiguously immediately before mutation.
3. An authorized Shopify Admin operator and an approved change window.
4. Shipping-operations review of service impact, including the possibility that carts lose a usable rate.
5. Shipping-operations confirmation that Alaska and Hawaii remain quotation-intake destinations while invoicing stays blocked until separate rates and service availability are approved.
6. Reviewed rollback evidence and a separately authorized postchange verification plan.

K1B-03A supplies none of those approvals.

## Operational evidence still required

All eight existing `K-EVID-*` requirements remain `BLOCKED`: Product/Variant pickup eligibility; Grafton readiness; packed weights and package characteristics; approved shipping services and regions; Alaska/Hawaii rates; insurance options; claims contacts and responsibilities; and quotation approval, scope, and expiration. The evidence receipt register is unchanged.

## Future rollback and verification checklist

Before any authorized mutation:

- Capture the complete target rate definition, condition, profile, zone, active state, amount, threshold, and currency.
- Capture the complete US zone membership plus associated profile, rate, and Market relationships.
- Store restricted raw evidence outside Git under an approved retention process.
- Record the approving Product Owner, operations reviewer, Admin operator, change time, and rollback owner.

After any authorized mutation:

- Collect a fresh sanitized read-only snapshot and confirm the two exact intended changes.
- Confirm the $8 and $15 observations, carrier-calculated definitions, Products, locations, Markets, international zone, Alaska, and Hawaii were not unintentionally changed.
- Rerun the Epic K drift and remediation validators.
- Verify effective checkout behavior in a separately authorized integration batch without assuming configuration inspection proves checkout enforcement.
- If verification fails, restore the captured rate or subdivision membership through a separately authorized rollback.

## Verification

The new tests cover exact target selection, ambiguity and absence failures, store and provenance gates, source immutability, domain preservation, invented evidence rejection, stable repeated output, and proposal-versus-execution boundaries.

| Command | Exit | Result |
|---|---:|---|
| `npm run test:epic-k-remediation-preflight` | 0 | 30/30 passed |
| `npm run validate:epic-k-remediation-preflight` | 0 | Proposal, projection, evidence boundary, and zero-Shopify-operation gates passed |

K1B-03A satisfies its bounded offline preflight scope. `K-PBI-002` and Epic K remain incomplete.
