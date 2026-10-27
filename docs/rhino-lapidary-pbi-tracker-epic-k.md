# Rhino Lapidary Epic K PBI Tracker

Source: `Rhino Lapidary Storefront Backlog and Epics.md`

## Current status

| Order | PBI | Title | Status | Evidence and remaining dependency |
|---:|---|---|---|---|
| 1 | K-PBI-001 | Fulfillment policy governance and decision traceability | Complete for repository governance | K1A contracts and Product Owner decisions are versioned and validated. |
| 2 | K-PBI-002 | Policy, operational evidence, and configuration validation | Partial | Offline policy, evidence intake, source mapping, October 24 audit, and drift/preflight gates exist. Eight operational evidence requirements remain blocked and live checkout enforcement remains unverified. |
| 3 | K-PBI-003 | Temporary shipping quotation checkout | Repository complete; unpublished preview uploaded; production activation blocked | K1C-01 implements whole-cart Shopify contact-form quotation intake, conditional all-item Grafton pickup checkout, accelerated-checkout suppression, 46 focused policy/browser tests, and staff handoff. K1C-02 verified current Admin configuration and the controlled draft-invoice path, then uploaded the ten scoped files to unpublished preview theme `158631198917`. No accepted K-EVID-001 Product/Variant eligibility or K-EVID-002 Grafton readiness receipt exists, and Shopify returned HTTP 429 during live preview cart verification. Production theme and shipping rates remain unchanged. |

## K1C-01 acceptance

Repository acceptance requires both `npm run test:epic-k-quote-mode` and `npm run validate:epic-k-quote-mode` to pass. The implementation preserves native cart quantities and Variant identities, prevents empty quotation submission, retains mixed carts as one request, collects required destination and delivery inputs, suppresses accelerated checkout bypasses, and never assigns a shipping price or invoice authorization.

Preview acceptance remains open. It requires a separately authorized unpublished-theme deployment and confirmation that Shopify contact notifications include the reference, complete cart, customer details, and delivery inputs without exposing personal information in logs. Immediate Grafton pickup acceptance additionally requires accepted K-EVID-001 and K-EVID-002 receipts plus Shopify pickup configuration that exposes current Grafton availability for every eligible Variant.

The English storefront workflow is implemented. The repository's 50 non-default locale catalogs do not yet contain approved translations for the new copy; those languages must not expose K1C-01 until localized content is supplied and validated.

## Preserved boundaries

- The 24 Product Owner-approved Shopify source mapping definitions remain unchanged.
- The October 24 audit, drift report, and remediation proposal remain historical evidence.
- All eight operational evidence requirements remain blocked.
- K1B-03A remains proposal only.
- No Shopify mutation, draft order, invoice, payment, theme push, or publication occurred in K1C-01.

## K1C-02 activation checkpoint

- Current Shopify configuration was collected through authenticated read-only Admin GraphQL after store identity verification. The sanitized status and rollback baseline are in `data/epic-k-k1c02-activation-status-2026-10-27.json`.
- A controlled two-line draft accepted a synthetic custom shipping charge and generated a payment URL. No invoice was sent, no payment was submitted, and the draft and test customer were deleted.
- The K1C-01 files were pushed only to the persistent unpublished preview theme. Production theme `158579622085` was not modified or published.
- The $8 Standard and $15 Express rates remain configured. Removing them before the quotation storefront and immediate pickup route both pass would leave an incomplete customer path.
- Grafton pickup is enabled in Shopify with one-business-day preparation, but the governed eligibility registry remains empty. Inventory and location settings cannot replace accepted K-EVID-001 and K-EVID-002 receipts.
- Production activation remains blocked; live checkout enforcement remains unverified.
- K-PBI-002 and Epic K remain incomplete.
