# Rhino Lapidary Epic K PBI Tracker

Source: `Rhino Lapidary Storefront Backlog and Epics.md`

## Current status

| Order | PBI | Title | Status | Evidence and remaining dependency |
|---:|---|---|---|---|
| 1 | K-PBI-001 | Fulfillment policy governance and decision traceability | Complete for repository governance | K1A contracts and Product Owner decisions are versioned and validated. |
| 2 | K-PBI-002 | Policy, operational evidence, and configuration validation | Partial | Offline policy, evidence intake, source mapping, October 24 audit, and drift/preflight gates exist. Eight operational evidence requirements remain blocked and live checkout enforcement remains unverified. |
| 3 | K-PBI-003 | Temporary shipping quotation checkout | K1D-01 repository endpoint ready; integration and production activation blocked | K1C contact recovery remains active. K1D-01 adds a tested, host-neutral authenticated app-proxy endpoint contract for one `Unquoted` Shopify Draft Order per shipped quotation, with Shopify-side Variant verification, durable idempotency/reconciliation interfaces, bounded abuse controls, and no invoice, payment, shipping line, reservation, or completion operation. No app, host, proxy, offline token, durable store, protected-customer-data approval, or granted scope exists in this repository, so the endpoint is not active and the native contact form remains the explicitly labelled email fallback. Production theme `158579622085` was unchanged; the obsolete rates were not recreated. |

## K1C-01 acceptance

Repository acceptance requires both `npm run test:epic-k-quote-mode` and `npm run validate:epic-k-quote-mode` to pass. The implementation preserves native cart quantities and Variant identities, prevents empty quotation submission, retains mixed carts as one request, collects required destination and delivery inputs, suppresses accelerated checkout bypasses, and never assigns a shipping price or invoice authorization.

Preview UI acceptance now passes on persistent unpublished theme `158631198917` across desktop, tablet, mobile, and a 200%-zoom-equivalent viewport, with geometry assertions and screenshots. Final intake acceptance remains open until a controlled human-verified contact submission confirms that Shopify delivers the reference, complete cart, customer details, and delivery inputs to the configured staff destination.

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
- The Product Owner reports that the obsolete $8 Standard and $15 Express rates were removed directly through the Admin API on October 27 and the resulting profiles were verified. K1C-02-R-UI did not repeat that deletion or recreate either rate. The committed October 27 activation snapshot predates this separate operation and remains historical evidence.
- Grafton pickup is enabled with one-business-day preparation. The approved default rule uses active Product status, the live Shopify pickup-availability endpoint, whole-cart eligibility, and explicit exclusions; three active Variants currently pass that bounded check. K-EVID-001 and K-EVID-002 remain blocked operational records.
- Desktop, tablet, mobile, and 200%-zoom-equivalent preview UI checks pass with no horizontal overflow, practical card/control widths, intact pickup presentation, and retained form values when switching choices. Automated contact submission remains intentionally deferred to the human acceptance test, and no live machine has positive Grafton inventory for a machinery pickup cart.
- CAPTCHA/contact recovery passes blocked-provider, timeout, returned-error, verified-success, safe-retry, verified-duplicate, and long-running-challenge simulations. The deployed preview recovery check sent zero contact POSTs, preserved entered data, exposed an accessible alert, and restored the submit control. No successful staff delivery is claimed.
- Production activation remains blocked; the obsolete rates must not be recreated, the production theme remains unchanged, and production checkout enforcement remains unverified.
- K-PBI-002 and Epic K remain incomplete.

## K1D-01 draft-order automation checkpoint

- The selected architecture is an authenticated Shopify app proxy backed by a separately hosted server endpoint. Admin credentials never enter Liquid or browser JavaScript.
- The repository endpoint verifies the app-proxy signature, exact shop and timestamp; enforces body, line, quantity, property, discount-code and rate limits; verifies active Variant identities through Admin GraphQL; rejects client financial fields; and rejects pickup before any Admin operation.
- Draft input uses API `2026-10` `draftOrderCreate`, `Unquoted` plus a deterministic reconciliation tag, native Variant lines, quantities, public line properties, customer email/phone, US shipping address, delivery notes, quote attributes, discount codes, and automatic-discount recalculation. It supplies no shipping line and invokes no invoice, payment, completion, order, or reservation operation.
- Durable idempotency is an explicit required adapter with an atomic shop/reference claim and payload hash. Network-uncertain mutations reconcile the deterministic tag and exact reference before returning success and never issue an automatic second mutation.
- API `2026-10` cannot attach a selling plan to a draft line. Those requests fail closed to the email fallback; they are not silently converted or price-overridden. Shopify added bounded selling-plan support in `2027-01`, which requires a later approved API upgrade and acceptance pass.
- The active contact-form path now identifies itself as an email fallback and its success copy explicitly says it does not confirm a Shopify Draft Order. Pickup remains native checkout.
- Integration remains blocked on an HTTPS host, installed Shopify app and proxy, granted `write_draft_orders`, `read_products`, and `write_app_proxy`, protected-customer-data approval, server-side secrets, a durable database/idempotency adapter, and a durable rate limiter. Real preview/browser/Admin verification cannot start before those exist.
- No preview or production deployment, app installation, Admin mutation, real draft, invoice, payment, customer, order, inventory reservation, rate change, pickup-setting change, or theme publication occurred in K1D-01 repository preparation.
