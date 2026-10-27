# Epic K1C-02 — Activate Quotation Checkout and Preserve Immediate Pickup Payment

Date: 2026-10-27

Branch: `epic-k/k1c02-activate-quotation-checkout`

Baseline: `68a583d17483112f2c90bf4a47fcedd1c6f3884c`

Parent PBI: `K-PBI-003`

## Outcome

K1C-02-R corrected the pickup policy and preview implementation, then reran the checkout surface against current Shopify data. Production activation stopped at the staff-intake confirmation gate. Production theme `158579622085` was not changed or published, and the existing $8 Standard and $15 Express rates were not removed.

The Product Owner's governing instruction now uses a default rule: an active Product may use immediate pickup when Shopify's live pickup endpoint confirms the complete cart at the configured Grafton location, unless an explicit Product or Variant exclusion applies. Inventory transfers and unavailable preparation arrangements fail closed. The empty allowlist was removed. This policy change does not create evidence receipts: K-EVID-001 and K-EVID-002 remain blocked operational records.

## Sanitized live audit

Authenticated Admin GraphQL reads used API version `2026-10` and verified the permanent store identity before collecting configuration. Restricted raw responses remain outside Git at `LocalAppData/RhinoLapidary/restricted-evidence/epic-k-k1c02-2026-10-27`. The sanitized repository record is `data/epic-k-k1c02-activation-status-2026-10-27.json`.

- Themes: production theme `158579622085` remains live; preview theme `158631198917` remains unpublished.
- Shipping: the General profile assigns 114 Variants. Its contiguous-US zone has active $8 Standard and $15 Express rates, while its Alaska/Hawaii quotation zone has no methods. The machinery quotation profile assigns 11 Variants across the 50 states and has no methods.
- Discounts and Markets: no active discount nodes were returned; the only active Market covers the United States.
- Pickup: Shopify location `1411 6th Ave` is the configured Grafton location. It is active, fulfills online orders, ships inventory, has pickup enabled, and states one-business-day preparation excluding weekends. The other two locations have pickup disabled.
- Inventory: 13 Variants have positive Grafton inventory; three belong to active Products. No audited machine has positive Grafton inventory. These facts do not confer pickup approval.

No unrelated configuration was changed.

## Controlled draft invoice verification

A controlled internal draft used two representative Product lines, a synthetic address, and a synthetic $12.34 custom shipping charge. This amount was test data for Shopify's draft-order calculation path and is not a Rhino shipping price or approval.

Shopify accepted the two lines and custom shipping charge, reconciled a $4,042.00 merchandise subtotal to a $4,054.34 total, calculated $0.00 tax for the controlled address, marked the draft ready, and generated an HTTPS invoice payment URL. The payment page returned HTTP 200. The invoice was never sent, the draft was never completed, and no payment was submitted or processed. The controlled draft and controlled customer were deleted successfully with zero user errors after the activation gate blocked.

This proves that Shopify can represent and expose payment for an approved custom shipping line after staff builds a draft. It does not prove that a real quotation has operations approval, that the tax result generalizes to another address, or that live checkout enforcement is compliant.

## Preview verification and rate limiting

The preview runner now respects `Retry-After`, uses bounded 10/20/40-second fallback backoff, serializes browser work, and avoids repeated Product requests. Shopify's password endpoint continued returning HTTP 429, so the same unpublished theme was exercised through Shopify CLI's authenticated theme development proxy with the configured storefront password.

Two current active Variants with positive Grafton inventory produced one complete cart. At 1440×1000 and 390×844, the quotation contained both Variant identities and quantities, the Grafton checkout control enabled only after both live pickup endpoint responses named `1411 6th Ave`, accelerated checkout remained absent, and no horizontal overflow occurred. A nonavailable machine remains fail closed; no machine currently has positive Grafton inventory, so an actual machine pickup cart could not be formed.

The controlled contact form reached Shopify's anti-bot site-configuration check, but automation could not complete the challenge and no `/contact` POST occurred. The configured Shopify contact email exists, but delivery of the complete quotation to staff is therefore unconfirmed. The runner did not bypass the challenge or log the address.

## Production activation gate

The activation sequence requires all of the following before changing the live theme or rates:

1. Complete one controlled human-assisted anti-bot challenge and confirm the complete request reaches the configured staff contact destination.
2. Confirm the reference, both cart lines and quantities, destination, delivery type, liftgate answer, access statement, and insurance selection in the received staff record.
3. Publish the verified K1C theme through the normal release workflow.
4. Remove exactly the $8 Standard and $15 Express definitions from the General Domestic zone. Preserve both profiles, domestic zones, the Alaska/Hawaii separation, the machinery no-rate behavior, Grafton pickup, Markets, and Shopify Payments.
5. Rerun direct checkout, pickup, shipping, Alaska/Hawaii, international, and approved draft-invoice scenarios without completing payment.

Rates must not be removed before the quotation storefront is live. The quotation storefront must not be published while the approved pickup route cannot be demonstrated.

## Staff procedure

1. Open the Shopify contact notification and locate the `KQ-*` reference.
2. Verify every Variant, quantity, destination, delivery type, liftgate response, access note, and requested insurance option against the complete cart.
3. Determine packaging and the applicable carrier charge, then record the operations approval and quotation validity.
4. Open or create one Shopify draft order for the complete cart and customer destination.
5. Apply the actual approved shipping charge and only those discounts still valid.
6. Review merchandise, shipping, taxes, insurance selections, and the final total.
7. Send the Shopify invoice only after the complete quotation is approved.
8. Fulfill only after Shopify records payment. Renew approval after any material cart, destination, access, service, insurance, or validity change.

## Rollback

Production rollback is not required because neither the production theme nor shipping configuration changed. Fresh K1C-02-R restricted evidence is under `LocalAppData/RhinoLapidary/restricted-evidence/epic-k-k1c02r-2026-10-27`. The unpublished preview was restored and synchronized after a scoped CLI invocation exposed incomplete remote assets; the full local theme was pushed back with remote deletion disabled before testing resumed.

The exact rate baseline for a future authorized rollback is General / Domestic / Standard $8 USD and Express $15 USD, both unconditional flat rates. A future mutation batch must capture the real Shopify method identifiers outside Git immediately before deletion and verify the profile and zone relationship again.

## Customer and merchant impact

No customer-facing theme was published. No shipping rate, profile, zone, Market, pickup setting, inventory, Product, payment configuration, order, or customer record remains changed. The unpublished preview theme changed. A controlled draft and controlled customer existed temporarily and were deleted. No invoice was sent and no customer payment was processed.

## Status

K1C-02 remains `BLOCKED`, not active. Repository and desktop/mobile preview UI acceptance pass; staff intake delivery does not. `K-PBI-003`, `K-PBI-002`, and Epic K remain incomplete. All eight operational evidence requirements remain blocked, and live checkout enforcement remains unverified.
