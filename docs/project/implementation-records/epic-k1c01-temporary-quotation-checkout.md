# Epic K1C-01 — Temporary Shipping Quotation Checkout

Date: 2026-10-27

Branch: `epic-k/k1c01-temporary-quote-checkout`

Baseline: `e49323d6993f4141c185333fcb49d468fbd195ce`

Parent PBI: `K-PBI-003`

## Repository baseline and integration choice

The repository is a Shopify Trade theme with Node-based offline validators. It contains no hosted application, authenticated server runtime, database, webhook receiver, or existing Admin GraphQL integration capable of securely creating draft orders. Theme assets cannot hold an Admin token. K1C-01 therefore uses Shopify's native contact form for the smallest reliable quotation intake and leaves draft-order creation to staff.

The Product Owner's October 27 direction temporarily routes every shipped cart through one whole-cart quotation before payment. This is encoded as a bounded overlay in `data/epic-k-temporary-quote-mode.json`; it does not rewrite the historical K1A policy contract or manufacture operational evidence.

## Storefront behavior

The full cart now presents two routes:

- **Ship my order — Request a shipping quote:** A native Shopify contact form collects name, email, optional phone/company, US street destination, one of the 50 states, ZIP code, residential/commercial designation, an explicit liftgate answer, access information, and interest in documented insurance options. Its hidden staff payload includes the reference, every server-rendered Variant ID and quantity, SKU when available, merchandise totals, line and cart discounts, and explicit statements that shipping cost and invoice authorization are pending.
- **Pick up in Grafton — Continue to checkout:** The ordinary Shopify checkout button renders only when every cart Variant appears in the governed pickup registry and every Variant's live `store_availabilities` contains an enabled, available location whose name contains `Grafton`. Unknown eligibility and missing availability fail closed. The customer-facing preparation statement is one business day, excluding weekends.

Product dynamic checkout, cart accelerated checkout, cart-notification checkout, and cart-drawer checkout are suppressed or routed to the full cart so that customers reach the delivery choice first. Add to Cart, cart notification, item identity, quantities, discounts, notes, removal, and native cart updates remain intact.

## Current pickup dependency

The committed eligibility registry is empty because K-EVID-001 remains blocked. K-EVID-002 also remains blocked, and the October 24 sanitized Shopify snapshot records three active locations with pickup disabled. As a result, the repository correctly renders the immediate pickup route unavailable for current evidence. This is a fail-closed operational dependency, not an implementation default that may be overridden from weight, inventory, tags, or unapproved Product data.

Before pickup can be enabled, the Product/Variant owner must attach accepted eligibility evidence, Grafton operations must attach a current readiness receipt, the governed Variant registry must be regenerated, and a separately authorized Shopify audit must confirm enabled pickup plus actual availability at the exact Grafton location.

## Duplicate and privacy handling

The native form uses a cart-derived request reference and cart signature. Browser session storage contains only that reference, signature, and pending/submitted state. It stores no name, email, address, phone number, or access information. The submit button disables during submission, a successfully submitted unchanged cart is blocked from repeat submission in the same session, an interrupted pending submission may retry, and a materially changed cart receives a new submission scope.

Shopify receives customer information through the native contact endpoint. No customer information, browser storage, token, raw Admin response, or credential is written to repository files or console logs.

## Staff draft-order procedure

1. Open the Shopify contact notification and locate the `KQ-*` reference.
2. Check the cart signature for a prior intake, then verify every Variant ID, quantity, selling plan, and public line property against the current Shopify catalog. Reconfirm any discount before reproducing it.
3. Review machinery, Alaska/Hawaii, residential/commercial, liftgate, access, insurance, package, carrier, and other applicable Epic K requirements.
4. Establish the actual package or crate plan, supported carrier service, and approved shipping charge. Record the quotation approver and validity period.
5. Create one Shopify draft order containing the complete validated cart and customer destination.
6. Apply only discounts that remain valid and add the approved shipping line. Never substitute a zero charge for missing rate evidence.
7. Record any offered insurance option and documented cost selected by the customer.
8. Send the Shopify invoice only after shipping operations approves the complete quotation. A material cart, destination, access, service, or insurance change requires renewed approval.

## Rollback

Revert the K1C-01 commit to restore the prior cart footer, cart-notification checkout, cart-drawer checkout, Product dynamic-checkout setting behavior, and prior shipping-at-checkout text. Remove no Shopify data because this batch performs no Shopify operation. If a later preview deployment occurs, deploy the preceding accepted theme commit to that same unpublished theme after separate authorization.

## Customer and merchant impact

Repository theme behavior changed, but no live or preview theme was uploaded. No Shopify Product, Variant, cart, customer, shipping, pickup, order, draft order, invoice, payment, location, rate, Market, or theme setting was accessed or changed. No customer experience changed in Shopify during this batch.

## Verification

All repository checks completed with exit code 0:

- `npm run test:epic-k-quote-mode`: 36 deterministic policy tests and 10 Chromium storefront tests passed. Browser coverage includes 1440, 390, and 360 pixel viewports.
- `npm run validate:epic-k-quote-mode`: contract, evidence boundary, pickup registry, theme route, duplicate guard, and prohibited-claim checks passed.
- `npm run test:epic-k-evidence-intake`: 53/53 passed; intake validation passed and the eight-request report reproduced without creating a receipt.
- `npm run test:epic-k-evidence`: 62/62 passed; evidence validation passed.
- `npm run test:epic-k-mapping-acceptance`: 31/31 passed; mapping acceptance validation passed.
- `npm run test:epic-k-remediation-preflight`: 30/30 passed; remediation preflight validation passed.
- `npm run validate:epic-k-k1b02`: 73 policy, 62 evidence/drift, and 43 collector tests passed together with the K1A, K1B-01, and K1B-02 validators.
- `npm run validate:registers`, `npm run validate:cart-config`, `npm run validate:product-purchase`, and `npm run validate:theme-architecture`: passed.

The Shopify AI Toolkit Liquid validator could not start because its installed bundle lacks `@shopify/theme-check-common`. The installed Shopify CLI Theme Check inspected the complete theme and reported no offenses against the ten changed theme files. Its overall exit code was 1 because each new English key is absent from the repository's 50 non-default locale catalogs: 1,200 `MatchingTranslations` errors across unchanged locale files. K1C-01 supplies approved English copy only; translation and acceptance of non-English customer copy remains a localization dependency before those languages can expose this workflow.

## Status

K1C-01 satisfies its bounded repository implementation and automated acceptance. It awaits separately authorized preview deployment and acceptance. Quotation intake uses synthetic/offline verification until deployed. Current immediate pickup readiness is blocked. Live checkout enforcement remains unverified. `K-PBI-002`, `K-PBI-003`, and Epic K remain incomplete.
