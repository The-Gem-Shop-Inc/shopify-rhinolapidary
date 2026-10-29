# Rhino Lapidary Epic K PBI Tracker

Source: `Rhino Lapidary Storefront Backlog and Epics.md`

## Current status

| Order | PBI | Title | Status | Evidence and remaining dependency |
|---:|---|---|---|---|
| 1 | K-PBI-001 | Fulfillment policy governance and decision traceability | Complete for repository governance | K1A contracts and Product Owner decisions are versioned and validated. |
| 2 | K-PBI-002 | Policy, operational evidence, and configuration validation | Partial | Offline policy, evidence intake, source mapping, October 24 audit, and drift/preflight gates exist. Eight operational evidence requirements remain blocked and live checkout enforcement remains unverified. |
| 3 | K-PBI-003 | Temporary shipping quotation checkout | K1D-02T controlled backend acceptance passed; ready for separate K1D-03 implementation | Authentic proxy creation produced exactly one `OPEN` draft `#D2` with `Unquoted` and deterministic reconciliation tags, correct lines/contact/delivery data, and no shipping line, invoice, payment, reservation, completion, Order, or fulfillment. The unchanged duplicate returned `#D2`; D1 remains `COMPLETED`, attempt `1`. The historical failed reference is preserved. The email fallback is active; storefront automation remains disabled and production theme `158579622085` remains unchanged and unpublished. |

## K1C-01 acceptance

Repository acceptance requires both `npm run test:epic-k-quote-mode` and `npm run validate:epic-k-quote-mode` to pass. The implementation preserves native cart quantities and Variant identities, prevents empty quotation submission, retains mixed carts as one request, collects required destination and delivery inputs, suppresses accelerated checkout bypasses, and never assigns a shipping price or invoice authorization.

Preview UI acceptance passes on persistent unpublished theme `158631198917` across desktop, tablet, mobile, and a 200%-zoom-equivalent viewport, with geometry assertions and screenshots. The Product Owner has now human-confirmed that the native Shopify contact-form quotation email reaches Rhino staff. That confirmation applies only to the email fallback and does not constitute automated Draft Order acceptance.

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
- CAPTCHA/contact recovery passes blocked-provider, timeout, returned-error, verified-success, safe-retry, verified-duplicate, and long-running-challenge simulations. The Product Owner subsequently human-confirmed successful staff delivery through the native contact form; the automated Draft Order path remains inactive.
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

## K1D-02 / K1D-02P backend provisioning checkpoint

- The selected isolated runtime remains Cloudflare Workers plus D1 and reuses the K1D-01 core/endpoint. D1 retains atomic unique claims, mutation fencing, reconciliation, and fixed-window rate limiting without storing the submitted customer payload.
- Authenticated Shopify CLI organization/store queries verified that app organization `224843363` (**Rhino Lapidary**) contains the target Basic store. The canonical Admin/API domain is `sz5dnk-nf.myshopify.com`; `rhino-lapidary.myshopify.com` is its primary storefront alias.
- D1 database `rhino-quotation-drafts` was created in ENAM and migration `0001_quote_backend.sql` was applied. Worker `rhino-quotation-drafts` is deployed and returns HTTP 200 from `/health`.
- The app secret is bound only as Cloudflare encrypted secret `SHOPIFY_API_SECRET`. Public configuration records the real D1 ID, canonical shop, and app client ID; no Admin credential is present in the repository or storefront.
- Shopify app **Rhino Quotation Drafts** and version `k1d02p-provisioned-2` were created/released with `read_products`, `write_draft_orders`, `write_app_proxy`, and `/apps/rhino-quote-draft`.
- A correctly signed direct request passed the deployed HMAC gate and reached pickup policy enforcement. This is not classified as Shopify-generated app-proxy evidence.
- At initial provisioning, client-credentials verification was blocked by Shopify's `app_not_installed` response. Installation, Level 2 protected customer fields, granted scopes, and the real Shopify-signed proxy were subsequently verified in K1D-02V and K1D-02V-R. Custom distribution is not used for this store-organization app.
- The Product Owner has human-confirmed staff receipt of the native contact-form quotation. Storefront automation stays disabled and the email fallback remains active.
- No controlled Draft Order was authorized or created. No preview/production theme mutation, publication, invoice, payment, completion, inventory reservation, shipping rate, or pickup-setting change occurred in K1D-02P.

## K1D-02V installed-app verification checkpoint

- Client credentials now succeed with a 24-hour token retained only in process memory. Admin GraphQL confirms installation `gid://shopify/AppInstallation/778440605893`, canonical domain `sz5dnk-nf.myshopify.com`, and primary alias `rhino-lapidary.myshopify.com`.
- The token and `currentAppInstallation` include `read_products`, `write_draft_orders`, and `write_app_proxy`; no required scope is missing.
- App metadata includes `read_customer_name`, `read_customer_email`, `read_customer_phone`, `read_customer_address`, and `read_customer_personal_data`. No customer record was queried.
- Shopify forwards `/apps/rhino-quote-draft` to the deployed Worker with signed canonical-shop parameters, but appends a trailing slash to `/shopify/app-proxy/quote/`. The Worker route guard accepts only `/shopify/app-proxy/quote`, so the authentic request returns `404 NOT_FOUND` before HMAC validation.
- Direct controls remain safe: valid signed pickup returns `409 PICKUP_NOT_ALLOWED`, invalid signature returns `401 UNAUTHORIZED`, and a correctly signed stale request returns `401 EXPIRED_REQUEST`.
- Worker health, both D1 operational tables, the encrypted `SHOPIFY_API_SECRET` binding, and the real-binding dry-run pass. The read-only D1 schema query made zero writes.
- Storefront automation remains disabled and the native email fallback remains active. No theme, Draft Order, customer, invoice, payment, completion, inventory, shipping rate, or pickup setting was changed.
- The diagnosed trailing-slash repair was completed in K1D-02V-R. A synthetic Draft Order remains separately owner-authorized.

## K1D-02V-R app-proxy routing repair checkpoint

- Root cause was the Worker route guard's single exact comparison: Shopify forwarded the configured destination as `/shopify/app-proxy/quote/`, while the Worker allowed only `/shopify/app-proxy/quote`.
- Worker routing now allows exactly those two paths. Additional segments, repeated separators, and encoded path variants remain rejected; HMAC, canonical-shop, timestamp, rate-limit, idempotency, Draft Order, and customer-data code did not change.
- Automated router verification passes 15/15 across both approved paths, valid/invalid/stale signatures, malformed paths, and zero-Admin/zero-mutation assertions. K1D endpoint tests remain 16/16 and D1 adapter tests remain 6/6.
- Only Worker `rhino-quotation-drafts` was redeployed, as version `e5183957-a0b4-43ab-bf31-744b0492548d`. No Shopify app configuration or theme was changed.
- The authentic storefront POST through `/apps/rhino-quote-draft` reached `/shopify/app-proxy/quote/` with Shopify's signed canonical-shop parameters and returned `409 PICKUP_NOT_ALLOWED` from the existing policy layer. Sanitized evidence is retained under `docs/qa/evidence/epic-k/k1d02v-r-2026-10-29/`.
- At the K1D-02V-R checkpoint, K1D-02T still required explicit owner authorization and no draft existed. That later authorization produced accepted draft `#D2`; storefront automation remains disabled and the native email fallback remains active.

## K1D-02T controlled Draft Order acceptance checkpoint

- Tobi authorized one synthetic unpaid and uninvoiced Draft Order plus the owner-controlled runtime email. Password rotation was human-confirmed before browser authentication.
- The failed reference remains unchanged at zero Shopify drafts and one `FAILED_RETRYABLE` D1 attempt. Corrected reference `KQ-K1D02TR20261029-2` passed zero-state preflight with both Variants active and available.
- Authentic proxy creation produced `#D2` (`gid://shopify/DraftOrder/1267908313285`). It is `OPEN` and tagged `Unquoted` plus `K1D-d4a71c89ba75fd8252a0abe4`.
- Admin readback matched both Variant IDs, quantities `1` and `2`, public property keys/values, approved runtime contact, US destination, delivery attributes, and staff note. Shopify applied no discount.
- Shipping line, invoice, inventory reservation, and completion are absent. The mutation input has no customer linkage, shipping line, payment terms, or reservation; the endpoint contains no completion, payment, customer, order, or fulfillment mutation.
- Immediate Admin tag search lagged the successful creation response. The runner stopped without retry, then positively reconciled `#D2` and the completed D1 claim before sending the unchanged request. The duplicate returned `#D2`; exactly one draft remains and D1 is `COMPLETED`, attempt `1`.
- Sanitized success evidence is `docs/qa/evidence/epic-k/k1d02t-2026-10-29/acceptance-success.json`. Storefront automation remains disabled, the native email fallback remains active, and K1D-03 has not started.

## K1D-02T-R rejection-diagnostic repair checkpoint

- A read-only Admin query reverified that failed reference `KQ-K1D02T20261029-1` and tag `K1D-e1dc123a1a160094e8314dc7` match zero drafts. Its D1 claim remains `FAILED_RETRYABLE`, attempt `1`, without a draft ID/name; no old payload, claim, or evidence was changed.
- D1 migration `0002_draft_diagnostics.sql` created the private `quote_submission_diagnostics` table. It stores only quotation identity, outcome category, sanitized field paths, safe classifications, HTTP status, and assessment time. Arbitrary Shopify messages and customer values are discarded.
- The endpoint now distinguishes mutation input rejection, deterministic top-level GraphQL/HTTP rejection, throttling, and uncertain transport/server outcomes. Deterministic input rejection is final-fenced and cannot reacquire the same key; uncertain mutation results still reconcile before any further mutation. Public proxy errors remain generic, and no diagnostic endpoint was added.
- The corrected fixture uses `KQ-K1D02TR20261029-2` and a new cart token, retains the approved Variants/quantities/properties, and removes optional phone/company/address2. The actual test email is accepted only through `K1D02T_OWNER_EMAIL`; reserved test domains are rejected by the acceptance runner without changing ordinary production email validation.
- Browser execution now requires explicit rotation confirmation for the previously exposed storefront password and redacts the password, controlled email, credentials, and authenticated URLs from failures. The runner creates no traces, screenshots, or videos.
- Worker `rhino-quotation-drafts` version `9aadbca9-4711-46fc-8279-3be8051cf3e0` is deployed and healthy. All three D1 tables are verified. K1D tests pass 18/18, D1 8/8, router 15/15, and acceptance runner 10/10.
- The original Shopify rejection reason is not established because the sanitized diagnostic table did not exist during the failed attempt. No discovery mutation was issued after deployment.
- The rotation/email gates were satisfied and the one authorized corrected mutation passed. K1D-02T-R diagnostics remain deployed; no additional mutation or discovery retry occurred.
