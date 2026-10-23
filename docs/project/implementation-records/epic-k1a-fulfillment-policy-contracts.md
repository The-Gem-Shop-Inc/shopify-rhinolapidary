# Epic K1A freight and fulfillment policy contracts

## Disposition

K1A establishes repository-only, provisional freight and fulfillment policy contracts for K-PBI-001 and the offline foundation of K-PBI-002. The contracts are executable specifications. They do not change or prove Shopify shipping profiles, rates, pickup settings, Product records, draft orders, checkout behavior, notifications, or theme behavior.

All decisions remain `provisional`. Operational readiness is `not_established`; live Shopify configuration and checkout compliance are `unverified`.

## Repository baseline

- Repository: `The-Gem-Shop-Inc/shopify-rhinolapidary`
- Branch at start: `epic-j/j1-native-cart-recovery`
- Accepted starting commit: `15c53c8dc9ace8c6467286b8c912514a901394c8`
- Upstream at start: `origin/epic-j/j1-native-cart-recovery`, zero commits ahead and behind
- Theme architecture inspected only: Shopify Trade 15.5.0, native Product form, native cart form, native checkout button, and native pickup component
- Shopify access used by K1A: none
- Network mutations: none
- Theme changes or pushes: none

Pre-existing work was preserved. At start, `docs/project/implementation-records/j-pbi-008-technical-acceptance-review.md` had staged and worktree state, `docs/rhino-lapidary-pbi-tracker-epic-j.md` was modified, and Epic J evidence plus `scripts/validate-epic-j-preview-matrix.js` were untracked. K1A does not include or alter those paths.

No committed Epic K0 assessment, PBI proposal, decision packet, or handoff files existed. Per the K1A instruction, this implementation uses only the explicit provisional decisions supplied on October 23, 2026. It does not promote earlier uncommitted discussion into verified repository evidence.

## K1A files

1. `data/epic-k-provisional-decisions.json`
2. `data/epic-k-fulfillment-policy.json`
3. `data/epic-k-operational-evidence-requirements.json`
4. `schemas/epic-k-provisional-decisions.schema.json`
5. `schemas/epic-k-fulfillment-policy.schema.json`
6. `schemas/epic-k-operational-evidence.schema.json`
7. `schemas/epic-k-policy-scenarios.schema.json`
8. `scripts/lib/epic-k-policy.js`
9. `scripts/validate-epic-k-policy.js`
10. `scripts/test-epic-k-policy.js`
11. `tests/fixtures/epic-k-policy-scenarios.json`
12. `scripts/validate-json-registers.js`
13. `package.json`
14. `docs/project/implementation-records/epic-k1a-fulfillment-policy-contracts.md`

No Liquid, JavaScript theme asset, locale, template, section, snippet, Shopify configuration, or real Product/Variant registry is changed.

## Contract boundaries

`epic-k-provisional-decisions.json` records K-DEC-001 through K-DEC-011 and K-DEC-014 through K-DEC-019. Every row includes owners and external dependencies, remains provisional, and has the implementation effect `repository_policy_input_only`.

`epic-k-fulfillment-policy.json` is the deterministic policy input. It establishes these offline rules:

- Shipped orders cannot qualify through a free-shipping policy route.
- Ordinary parts and supplies require an approved positive paid rate and approved service evidence.
- Any shipped-machine cart requires one operations-approved quotation covering the whole cart before payment.
- Alaska and Hawaii accept quotation intake, while invoicing requires separately approved rates and confirmed service availability.
- International destinations and US territories are outside the initial scope unless separately approved in a future contract.
- Grafton pickup requires explicit eligibility for every item and explicit location readiness.
- Rhino delivery requires an individual quotation.
- Selected insurance requires documented availability, documented cost, and customer acceptance before invoicing.
- Quotations are invalid after expiration or a material cart, destination, delivery-requirement, or insurance-selection change.
- Numeric delivery estimates require operations authority.
- Claims instructions require Rhino notification and a designated contact process and cannot presume universal customer carrier-claim authority.
- Lack of purchased insurance does not categorically eliminate all customer remedies.

The contract also fixes `repositoryAssessmentOnly=true`, `liveCheckoutEnforcement=false`, `shopifyConfigurationCompliance=unverified`, and `realProductEligibilityEstablished=false`.

## Deterministic routing model

The pure `assessFulfillment` function returns one of five routes:

1. `ordinary_paid_shipping`
2. `whole_cart_quotation_required`
3. `ordinary_grafton_pickup`
4. `blocked_by_policy`
5. `operational_evidence_required`

Every result separately reports `shopifyCheckoutEnforceable=unverified`. Policy eligibility therefore cannot be mistaken for present checkout enforcement.

The pure `assessQuotation` function compares a canonical whole-cart scope. The scope includes item identity and quantity, destination, residential/commercial designation, liftgate choice, access information, and insurance selection. It rejects missing operations approval, the wrong approver role, expiration, material scope changes, incomplete Alaska/Hawaii evidence, and incomplete selected-insurance evidence.

The fixture contains only `SYNTHETIC-*` identifiers. Schema and semantic checks reject Shopify GIDs and prohibit fixtures from satisfying operational readiness.

## Content governance

Content assessment uses explicit claim categories. A numeric duration in a `delivery_estimate` claim requires `approved_operations` authority. Numbers in governed unrelated categories such as `machine_specification` and `quotation_expiration` are not treated as delivery estimates.

No customer-facing copy is created. The content checks define what future copy contracts must prove.

## Required external evidence

The evidence contract records all eight categories as `missing_external_evidence`, with `syntheticDataMaySatisfy=false`:

| Evidence | Authority | Blocks |
|---|---|---|
| Exact Product/Variant pickup eligibility | Epic E Product Data, Epic F, Grafton operations | Real Product pickup claims and checkout readiness |
| Grafton inventory/location readiness | Grafton and inventory operations | Pickup activation |
| Packed weights and package characteristics | Epic E/F and shipping operations | Rate configuration and Product logistics claims |
| Approved shipping services and regions | Shipping operations | Ordinary-shipping readiness and rate configuration |
| Alaska and Hawaii rates/service | Shipping operations and finance | AK/HI invoice and payment authorization |
| Carrier insurance options and cost | Shipping operations and finance | Insurance selection on real quotations |
| Claims contacts and filing responsibilities | Shipping, customer service, Epic L | Claims copy and notification readiness |
| Quote approver, scope, and expiration | Warehouse/shipping operations | Real invoice and draft-order handoff |

Expired Epic E/F authority is not renewed. Epic E/F retain ownership of Product facts. Epic J optional PBIs, G003/G005/G006, MR16/Saw Vice decisions, the Epic C header defect, navigation decisions, and Epic L warranty ownership remain unchanged.

## Automated validation

Commands added:

```powershell
npm run validate:epic-k-policy
npm run test:epic-k-policy
npm run validate:epic-k-k1a
```

The validator exits nonzero for schema or semantic drift, prints actionable messages, requires no credentials, performs no network access, and reports missing operational evidence independently from repository validity.

K1A validation results at handoff:

| Command | Exit | Result |
|---|---:|---|
| `npm run validate:epic-k-policy` | 0 | 3 contracts, 16 synthetic routing scenarios, and the claims baseline valid; 8 external evidence categories remain missing |
| `npm run test:epic-k-policy` | 0 | 43/43 positive and negative checks passed |
| `npm run validate:epic-k-k1a` | 0 | Aggregate policy validation and 43/43 tests passed |
| `npm run validate:registers` | 0 | All four new Epic K schema targets and all existing register targets valid |
| `npm run validate:cart-config` | 0 | Existing cart architecture valid; `cart_type=notification` |
| `npm run validate:product-purchase` | 0 | Existing Product purchase architecture valid |
| `npm run validate:theme-architecture` | 0 | Navigation, 102 design tokens, CSS, storefront JS, and Rhino section checks passed |

No browser, preview, live checkout, Admin configuration, notification, package, rate, or Product integration check is represented as passed.

## PBI status

| PBI | K1A status | Basis |
|---|---|---|
| K-PBI-001 | `COMPLETE_FOR_K1A_REPOSITORY_SCOPE` | Versioned provisional decision/policy contracts, source status, boundaries, dependencies, and deterministic governance checks exist |
| K-PBI-002 | `PARTIAL_OFFLINE_FOUNDATION_COMPLETE` | Schemas, validator, synthetic routes, negative tests, evidence gate, and register integration exist; fresh Shopify evidence and integration checks remain unverified |
| Epic K operational readiness | `BLOCKED_BY_EXTERNAL_EVIDENCE` | Eight authoritative evidence categories are attached as explicit requirements and remain missing |
| Shopify checkout compliance | `UNVERIFIED` | No live checkout or Admin configuration test occurred |

Epic K is not complete.

## Why offline validation does not prove checkout compliance

The evaluator receives synthetic facts supplied by a test. It cannot establish which real Products are machines or pickup eligible, whether Grafton can fulfill them, which rate Shopify will return, whether the current free-shipping rule is still active, whether profiles combine in mixed carts, or whether staff can produce an approved draft-order invoice. A valid repository policy proves that the intended rules are internally consistent and fail closed. Shopify compliance requires fresh read-only configuration evidence followed by separately authorized operational configuration and integration acceptance.

## Recommended K1B scope

K1B should remain evidence-first and read-only:

1. Ingest a current, exact Product/Variant logistics eligibility register owned by Epic E/F without renewing expired approvals by date edit.
2. Attach Grafton inventory, staffing, and location-readiness evidence from operations.
3. Attach packed-weight/package evidence and approved service/region evidence.
4. Record Alaska/Hawaii rate approvals without embedding prices in the policy contract.
5. Record carrier insurance options, costs, and applicable services in an operations-owned evidence artifact.
6. Record the Rhino contact process and carrier-specific claim responsibility with Epic L.
7. Define operations approvers and quotation expiration issuance without inventing a universal duration.
8. Add a read-only, redacted Shopify configuration snapshot and drift adapter that reports present enforcement gaps.

K1B should not change shipping profiles, rates, pickup settings, Products, checkout, draft orders, notifications, or theme code unless those actions receive separate authorization.
