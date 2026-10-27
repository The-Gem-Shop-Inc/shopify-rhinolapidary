# Rhino Lapidary Epic K PBI Tracker

Source: `Rhino Lapidary Storefront Backlog and Epics.md`

## Current status

| Order | PBI | Title | Status | Evidence and remaining dependency |
|---:|---|---|---|---|
| 1 | K-PBI-001 | Fulfillment policy governance and decision traceability | Complete for repository governance | K1A contracts and Product Owner decisions are versioned and validated. |
| 2 | K-PBI-002 | Policy, operational evidence, and configuration validation | Partial | Offline policy, evidence intake, source mapping, October 24 audit, and drift/preflight gates exist. Eight operational evidence requirements remain blocked and live checkout enforcement remains unverified. |
| 3 | K-PBI-003 | Temporary shipping quotation checkout | Repository complete; desktop/mobile preview UI passed; production activation blocked | K1C-02-R replaced the empty allowlist with the approved active-Product, live-Grafton-availability, all-item rule and explicit exclusions. Three active Variants currently pass Shopify's pickup endpoint; desktop and 390px preview checks pass with no accelerated checkout. Shopify's contact anti-bot challenge prevented the controlled `/contact` submission, so staff intake remains unconfirmed. No production theme or rate changed. |

## K1C-01 acceptance

Repository acceptance requires both `npm run test:epic-k-quote-mode` and `npm run validate:epic-k-quote-mode` to pass. The implementation preserves native cart quantities and Variant identities, prevents empty quotation submission, retains mixed carts as one request, collects required destination and delivery inputs, suppresses accelerated checkout bypasses, and never assigns a shipping price or invoice authorization.

Preview UI acceptance now passes for desktop and mobile using Shopify's theme development proxy. Final intake acceptance remains open until a controlled human-verified contact submission confirms that Shopify delivers the reference, complete cart, customer details, and delivery inputs to the configured staff destination.

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
- Grafton pickup is enabled with one-business-day preparation. The approved default rule uses active Product status, the live Shopify pickup-availability endpoint, whole-cart eligibility, and explicit exclusions; three active Variants currently pass that bounded check. K-EVID-001 and K-EVID-002 remain blocked operational records.
- Desktop and mobile preview UI checks pass. Automated contact submission is blocked by Shopify's anti-bot challenge, and no live machine has positive Grafton inventory for a machinery pickup cart.
- Production activation remains blocked; the $8 Standard and $15 Express rates remain active and live checkout enforcement remains unverified.
- K-PBI-002 and Epic K remain incomplete.
