# Epic K1C-02 — Activate Quotation Checkout and Preserve Immediate Pickup Payment

Date: 2026-10-27

Branch: `epic-k/k1c02-activate-quotation-checkout`

Baseline: `68a583d17483112f2c90bf4a47fcedd1c6f3884c`

Parent PBI: `K-PBI-003`

## Outcome

K1C-01 passed its repository tests and was uploaded as a ten-file partial release to unpublished preview theme `158631198917`. Production activation stopped at the required pickup and preview gates. Production theme `158579622085` was not changed or published, and the existing $8 Standard and $15 Express rates were not removed.

The fail-closed result is required by the accepted K1C-01 contract. The governed pickup registry contains no Variant IDs because no accepted K-EVID-001 receipt defines exact Product or Variant eligibility. Shopify currently has Grafton pickup enabled and three active Variants with positive Grafton inventory, but configuration and inventory do not supply the missing eligibility approval. K-EVID-002 also remains blocked because the repository has no accepted warehouse readiness, inventory ownership, or pickup procedure receipt.

## Sanitized live audit

Authenticated Admin GraphQL reads used API version `2026-10` and verified the permanent store identity before collecting configuration. Restricted raw responses remain outside Git at `LocalAppData/RhinoLapidary/restricted-evidence/epic-k-k1c02-2026-10-27`. The sanitized repository record is `data/epic-k-k1c02-activation-status-2026-10-27.json`.

- Themes: production theme `158579622085` remains live; preview theme `158631198917` remains unpublished.
- Shipping: the General profile assigns 114 Variants. Its contiguous-US zone has active $8 Standard and $15 Express rates, while its Alaska/Hawaii quotation zone has no methods. The machinery quotation profile assigns 11 Variants across the 50 states and has no methods.
- Discounts and Markets: no active discount nodes were returned; the only active Market covers the United States.
- Pickup: Grafton is active, fulfills online orders, ships inventory, has pickup enabled, and states one-business-day preparation excluding weekends. The other two locations have pickup disabled.
- Inventory: 13 Variants have positive Grafton inventory; three belong to active Products. No audited machine has positive Grafton inventory. These facts do not confer pickup approval.

No unrelated configuration was changed.

## Controlled draft invoice verification

A controlled internal draft used two representative Product lines, a synthetic address, and a synthetic $12.34 custom shipping charge. This amount was test data for Shopify's draft-order calculation path and is not a Rhino shipping price or approval.

Shopify accepted the two lines and custom shipping charge, reconciled a $4,042.00 merchandise subtotal to a $4,054.34 total, calculated $0.00 tax for the controlled address, marked the draft ready, and generated an HTTPS invoice payment URL. The payment page returned HTTP 200. The invoice was never sent, the draft was never completed, and no payment was submitted or processed. The controlled draft and controlled customer were deleted successfully with zero user errors after the activation gate blocked.

This proves that Shopify can represent and expose payment for an approved custom shipping line after staff builds a draft. It does not prove that a real quotation has operations approval, that the tax result generalizes to another address, or that live checkout enforcement is compliant.

## Preview verification

The unpublished theme received only the K1C-01 files. Static and fixture-based verification continued to pass. During the authenticated live preview run, Shopify returned HTTP 429 for controlled Product and Ajax-cart requests. The live runner therefore did not submit the contact form, did not accept the desktop/mobile matrix, and did not claim that the designated contact destination received a complete cart.

The preview rate limit is recorded separately from the pickup authority blocker. A later rerun must use the committed `verify:epic-k-k1c02-preview` command with controlled environment inputs. It must confirm the complete mixed cart, quotation success acknowledgement, mobile and desktop rendering, and the absence of enabled checkout controls while pickup eligibility remains unresolved.

## Production activation gate

The activation sequence requires all of the following before changing the live theme or rates:

1. Attach accepted K-EVID-001 evidence listing exact pickup-eligible Product and Variant identities, then regenerate and validate the governed registry.
2. Attach accepted K-EVID-002 evidence for Grafton readiness, inventory ownership, and pickup procedures.
3. Rerun the unpublished preview matrix without HTTP 429 responses and confirm that the complete quotation reaches the Shopify store contact destination.
4. Confirm at least one all-eligible, in-stock cart reaches native Grafton pickup checkout and that a mixed or ineligible cart cannot.
5. Publish the verified K1C theme through the normal release workflow.
6. Remove exactly the $8 Standard and $15 Express definitions from the General Domestic zone. Preserve both profiles, domestic zones, the Alaska/Hawaii separation, the machinery no-rate behavior, Grafton pickup, Markets, and Shopify Payments.
7. Rerun direct checkout, cart permalink, express-control, pickup, shipping, Alaska/Hawaii, international, and approved draft-invoice scenarios without completing payment.

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

Production rollback is not required because neither the production theme nor shipping configuration changed. The raw prechange configuration and controlled-operation responses are in the restricted external directory above. If the unpublished preview needs to be restored, push the corresponding ten files from predecessor commit `e49323d6993f4141c185333fcb49d468fbd195ce` to preview theme `158631198917`; do not publish that rollback implicitly.

The exact rate baseline for a future authorized rollback is General / Domestic / Standard $8 USD and Express $15 USD, both unconditional flat rates. A future mutation batch must capture the real Shopify method identifiers outside Git immediately before deletion and verify the profile and zone relationship again.

## Customer and merchant impact

No customer-facing theme was published. No shipping rate, profile, zone, Market, pickup setting, inventory, Product, payment configuration, order, or customer record remains changed. The unpublished preview theme changed. A controlled draft and controlled customer existed temporarily and were deleted. No invoice was sent and no customer payment was processed.

## Status

K1C-02 is `BLOCKED`, not active. K1C-01 remains repository-complete and uploaded to the unpublished preview. `K-PBI-003`, `K-PBI-002`, and Epic K remain incomplete. Operational readiness is `BLOCKED`; live checkout enforcement is `UNVERIFIED`.
