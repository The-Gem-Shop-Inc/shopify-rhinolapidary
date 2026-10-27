# Rhino Lapidary Epic K PBI Tracker

Source: `Rhino Lapidary Storefront Backlog and Epics.md`

## Current status

| Order | PBI | Title | Status | Evidence and remaining dependency |
|---:|---|---|---|---|
| 1 | K-PBI-001 | Fulfillment policy governance and decision traceability | Complete for repository governance | K1A contracts and Product Owner decisions are versioned and validated. |
| 2 | K-PBI-002 | Policy, operational evidence, and configuration validation | Partial | Offline policy, evidence intake, source mapping, October 24 audit, and drift/preflight gates exist. Eight operational evidence requirements remain blocked and live checkout enforcement remains unverified. |
| 3 | K-PBI-003 | Temporary shipping quotation checkout | Repository complete; preview verification and operational pickup blocked | K1C-01 implements whole-cart Shopify contact-form quotation intake, conditional all-item Grafton pickup checkout, accelerated-checkout suppression, 46 focused policy/browser tests, and staff handoff. No accepted K-EVID-001 Product/Variant eligibility or K-EVID-002 Grafton readiness receipt exists; the October 24 snapshot records pickup disabled. Theme deployment and Shopify configuration were not authorized. |

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
- K-PBI-002 and Epic K remain incomplete.
