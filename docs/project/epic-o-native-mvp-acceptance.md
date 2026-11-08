# Epic O native MVP acceptance packet

**Scope:** O-PBI-004, O-PBI-005, and the selected native-MVP slice of O-PBI-020
**Release authorization:** Not granted
**Production publication:** Not granted
**Customer data:** Prohibited; all repository fixtures are synthetic

## Current disposition

The existing theme account entry is sufficient for new customer accounts and requires no production Liquid change. Repository contracts and synthetic verification are implemented. Shopify-hosted authenticated integration, manual assistive-technology review, inaccessible configuration inventory, and production readback remain pending. O-PBI-020 cannot be Complete from this packet alone.

## PBI evidence status

| PBI | Current evidence status | Claim allowed |
|---|---|---|
| O-PBI-001 | Minimum audit evidence collected; implementation path verified; additional inventory incomplete | New-account path verified; PBI not Complete |
| O-PBI-002 | Post-MVP policy dependency | Does not block native orders/profile/addresses; ownership remains unresolved |
| O-PBI-003 | MVP architecture selected | Native/no-new-app for this MVP only |
| O-PBI-004 | Repository implementation verified; native integration pending | Existing route delegation needs no theme change; no live account completion claim |
| O-PBI-005 | Eleven synthetic current-catalog/cart contracts pass; native integration pending | Contract readiness only; no live Buy again behavior claim |
| O-PBI-020 | Scoped packet assembled; production acceptance blocked | Not Complete; no publication/release claim |

## Acceptance matrix

| Area | Automated | Simulated | Manual/live requirement | Status |
|---|---|---|---|---|
| Repository/Admin separation | Audit and native validators | N/A | Re-read before release | Pass repository / pending release |
| Account mode/store identity/sign-in | Snapshot schema and negative fixtures | N/A | Revalidate before release | Verified fresh until expiry |
| Anonymous account entry | Static source and Playwright fixture | Shopify redirect destination | Confirm no loop and intended return on preview | Automated pass / integration pending |
| Orders and order status | Semantic empty/paginated fixtures | Synthetic order cards/statuses | Authorized synthetic customer on Shopify-hosted pages | Simulated only |
| Profile and addresses | Address action fixtures | Synthetic profile/addresses | Add/edit/delete/default with authorized synthetic account | Simulated only |
| Account navigation/return | Route/static contract | Synthetic account navigation and recovery | Inspect active menu/configuration and return destination | Partial / configuration Unverified |
| Buy again current catalog | Eleven deterministic scenarios | Test-only reconciliation model | Authorized synthetic order for visible/hidden, partial, duplicate, and recovery behavior | Contract pass / integration pending |
| Cart synchronization | Epic J single-server-cart/current-Variant invariants | Added/failed/adjusted fixture outcomes | Confirm resulting Shopify cart and editable quantities | Contract pass / integration pending |
| Privacy/authorization | PII/secret/customer-GID negative fixtures | No real customer data | Cross-account denial with controlled synthetic accounts; no screenshots with details | Automated safeguards / live pending |
| Keyboard/focus/names/landmarks | Playwright focus and semantic assertions | Synthetic account pages | Keyboard and focus on Shopify-hosted pages | Simulated pass / live pending |
| Automated axe | Playwright axe on anonymous, orders, and error states | Synthetic markup | Axe on Shopify-hosted pages; separate provider-owned findings | Simulated pass / live pending |
| Screen reader | N/A | Semantic contract only | NVDA + Chrome/Firefox and VoiceOver + Safari review | Blocked/pending human review |
| Zoom | 200% at all required widths; 400% applicable action check | Synthetic markup | Browser zoom on Shopify-hosted pages | Simulated pass / live pending |
| Responsive widths | 320, 360, 390, 768, 1024, 1440 px | Synthetic markup | Native pages including long text and menu overflow | Simulated pass / live pending |
| Errors/recovery | Network, unavailable destination, partial add, navigation recovery fixtures | Synthetic status/focus recovery | Native outage and partial-add behavior | Contract pass / live pending |
| Performance/global chrome | Zero production runtime bytes added; existing route source unchanged | N/A | Re-run global chrome and account-page measurements | No new runtime cost / integration pending |
| Deferred capability absence | Native contract and authorization boundaries | N/A | Inspect active extensions/menu/flows | Repository pass / Admin inventory inaccessible |
| Rollback | No theme runtime change and no Admin mutation | N/A | For later configuration publication, capture pre-state and Shopify reversal rules | Repository N/A / release plan pending |

## Buy again fixture matrix

The executable fixture covers: fully available orders; mixed available/unavailable Variants; deleted/unpublished Variants; current-price changes; quantity-limit changes; sold-out Variants; duplicate activation; partial additions; network failures; navigation recovery; and accessible failure/status reporting.

The invariant is strict: current Product/Variant state, current price, current availability, and current quantity constraints govern additions. Historical order terms are display history only. Successful additions remain visible/editable when another line fails. Order history never proves ownership, fit, registration, or warranty.

## Release prerequisites

1. Revalidate O-EVID-001 before expiry/release and capture the exact supported Admin API version through a method that exposes it.
2. Complete read-only app/extension, active/draft configuration, customer-account menu, Buy again visibility, and Flow inventories.
3. Use controlled synthetic customer/order fixtures under separately authorized nonproduction or safe store procedures; never real customer records.
4. Run the Shopify-hosted anonymous/authenticated, keyboard, screen-reader, axe, zoom, responsive, partial-add, duplicate, and recovery matrix.
5. Run relevant Epic J, global chrome accessibility, and performance gates against the exact release candidate.
6. Record exact pre-change state, rollback steps, monitoring owner, and post-publication readback.
7. Confirm no deferred account extension, ownership, registration, warranty, service, commercial, personalization, alert, comparison, or lifecycle feature is active.
8. Obtain separate production publication/release authorization.

## Rollback boundary

This repository batch adds no production runtime behavior, so its source rollback is removal of contracts/tests/docs if rejected. A later Admin configuration publication requires a distinct rollback plan and current Shopify reversal guidance. Storewide account mode must never be treated as preview-theme isolated.
