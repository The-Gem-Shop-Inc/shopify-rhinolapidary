# Epic K1D-02 / K1D-02P / K1D-02V / K1D-02V-R / K1D-02T / K1D-02T-R — Provision and verify quotation Draft Order backend

## Outcome

Rhino-specific infrastructure and Shopify installation are verified, but the automated Draft Order path remains inactive. Shopify issued a client-credentials token for **Rhino Quotation Drafts**, and read-only Admin GraphQL returned installation `gid://shopify/AppInstallation/778440605893`, canonical domain `sz5dnk-nf.myshopify.com`, and primary storefront alias `rhino-lapidary.myshopify.com`. The token and `currentAppInstallation` both grant `read_products`, `write_draft_orders`, and `write_app_proxy`.

Cloudflare D1 database `rhino-quotation-drafts` was created in ENAM, migration `0001_quote_backend.sql` was applied, and Worker `rhino-quotation-drafts` was deployed. The Worker reports healthy at `https://rhino-quotation-drafts.mayhemmojomeister.workers.dev/health`. The Shopify app secret exists only as the encrypted Cloudflare `SHOPIFY_API_SECRET` binding. It is absent from source, Liquid, browser JavaScript, command output, and committed configuration.

Shopify app version `k1d02p-provisioned-2` is released and installed with Admin API `2026-10`, `read_products`, `write_draft_orders`, `write_app_proxy`, and `/apps/rhino-quote-draft`. The token lifetime was `86399` seconds; the token existed only in process memory and was never printed or persisted. App metadata grants the protected-data handles for name, email, phone, address, and protected personal data. No customer record was queried.

The authentic app proxy is now verified. The route guard accepts exactly `/shopify/app-proxy/quote` and `/shopify/app-proxy/quote/`; it does not normalize or prefix-match other paths. Shopify forwarded `/apps/rhino-quote-draft` to the trailing-slash destination with signed canonical-shop parameters, the Worker authenticated the request, and the existing quotation policy returned `409 PICKUP_NOT_ALLOWED` for the deliberately invalid pickup payload. Direct invalid-signature and expired-request controls continue to return `401`.

K1D-02T is **BLOCKED**. Tobi explicitly authorized one synthetic unpaid and uninvoiced Draft Order. The controlled shipping fixture passed the read-only store, scope, Variant, and zero-prior-state preflight, then an authentic storefront request reached the existing `draftOrderCreate` path. Shopify returned `422 SHOPIFY_REJECTED`. Admin reconciliation found zero drafts with the deterministic tag and reference; D1 records one `FAILED_RETRYABLE` attempt with no draft ID or name. No duplicate request was sent.

K1D-02T-R deployed the diagnostic correction without issuing another Draft Order mutation. Worker version `9aadbca9-4711-46fc-8279-3be8051cf3e0` now distinguishes mutation `userErrors`, deterministic top-level GraphQL/HTTP rejection, throttling, and uncertain transport outcomes. D1 migration `0002_draft_diagnostics.sql` adds a private diagnostic table containing only the quotation identity, outcome category, allowlisted field paths/classifications, HTTP status, and timestamp. Raw Shopify messages and customer data are not persisted or exposed, and no public diagnostic route exists. Deterministic input rejection is final-fenced from reacquisition; ambiguous mutation outcomes retain reconciliation behavior.

No Draft Order, customer, invoice, payment, completion, inventory reservation, shipping line, theme upload, production publication, shipping-rate change, or pickup-setting change occurred. The working native contact-form email path remains the only active quotation intake and is still truthfully distinguished from Admin storage.

## Provisioned resources

- Cloudflare Worker: `rhino-quotation-drafts`; deployed version `e5183957-a0b4-43ab-bf31-744b0492548d`.
- Worker URL: `https://rhino-quotation-drafts.mayhemmojomeister.workers.dev`.
- D1 database: `rhino-quotation-drafts`; ID `2a63307d-b07f-43f1-a6be-85418781fb6c`; region `ENAM`.
- D1 schema: `quote_submission_claims`, `quote_rate_windows`, and Cloudflare migration metadata.
- Shopify organization: `224843363`, **Rhino Lapidary**.
- Shopify app: `gid://shopify/App/441243762689`, **Rhino Quotation Drafts**; public client ID `9c9b22ce5705afd68d8d934744223857`.
- Released Shopify app version: `k1d02p-provisioned-2`; version ID `1185803927553`.
- Persisted non-secret configurations: `config/wrangler.epic-k-draft-order.jsonc` and `config/shopify.app.epic-k-draft-order.toml`.

## Verification performed

- Organization: authenticated Shopify CLI organization/store queries returned organization `224843363` for both the app context and the canonical store `sz5dnk-nf.myshopify.com`; the latter has primary domain `rhino-lapidary.myshopify.com` and Shopify Basic plan.
- Hosting: Wrangler dry-run bundled the existing K1D-01 core and endpoint against the real D1 binding. Remote migration application succeeded, and a read-only schema query confirmed both application tables.
- Secret: `wrangler secret list` confirmed one encrypted `SHOPIFY_API_SECRET` binding without revealing its value.
- Health: the deployed Worker returned HTTP `200` and `{"ok":true,"service":"rhino-quotation-drafts"}`.
- Signature gate: a direct request signed with the app secret reached the deployed policy layer and returned `409 PICKUP_NOT_ALLOWED` for an intentionally non-shipping payload. This proves the deployed HMAC/shop/timestamp gate accepted the request; it is not evidence of a Shopify-generated proxy request.
- Installation/client credentials: Shopify issued a 24-hour token, Admin GraphQL returned installation `gid://shopify/AppInstallation/778440605893`, and the canonical/primary domains matched the recorded store identity.
- Granted Admin scopes: the token grants exactly `read_products`, `write_draft_orders`, and `write_app_proxy`; `currentAppInstallation` also returned their implied read handles.
- Protected customer data: app metadata includes `read_customer_name`, `read_customer_email`, `read_customer_phone`, `read_customer_address`, and `read_customer_personal_data`. No customer object was read.
- Authentic proxy: Shopify forwarded the password-unlocked storefront POST to Worker version `e5183957-a0b4-43ab-bf31-744b0492548d` with the canonical shop, `path_prefix`, timestamp, and a redacted signature. The observed `/shopify/app-proxy/quote/` destination reached the existing authenticated handler and returned `409 PICKUP_NOT_ALLOWED` with `cache-control: no-store`.
- Negative controls: direct invalid signature returned `401 UNAUTHORIZED`; direct correctly signed stale timestamp returned `401 EXPIRED_REQUEST`; all diagnostic responses used `cache-control: no-store` and exposed no credential.
- Route regression: both exact approved paths return `409 PICKUP_NOT_ALLOWED` when correctly signed and `401` for invalid or stale signatures. Additional segments, repeated separators, and encoded path variants remain `404 NOT_FOUND`. The test harness fails on any Admin request or idempotency/mutation access.
- Controlled acceptance: authorized and attempted once through the authentic storefront app proxy. Shopify confirmed rejection, Admin returned zero matching drafts, and D1 retained `FAILED_RETRYABLE`, attempt count `1`, with no draft ID/name. No retry or duplicate request occurred.

## Required next implementation action

No Shopify owner configuration action remains for installation, scopes, protected customer fields, or app-proxy routing. To resume K1D-02T, the owner must confirm that the previously exposed storefront password was rotated and supply an owner-controlled deliverable email through `K1D02T_OWNER_EMAIL`. The runner then performs a clean read-only preflight for new reference `KQ-K1D02TR20261029-2` before it can submit. The original rejection reason is not recoverable: migration `0002` was deployed after the failed request, and the historical row deliberately contains only `ADMIN_REJECTED`. The `.invalid` email remains a plausible inference, not an established fact.

Official references checked October 29, 2026:

- <https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard>
- <https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant>
- <https://shopify.dev/docs/apps/launch/distribution/select-distribution-method>
- <https://shopify.dev/docs/apps/build/online-store/app-proxies>
- <https://shopify.dev/docs/apps/build/online-store/app-proxies/authenticate-app-proxies>
- <https://shopify.dev/docs/apps/launch/protected-customer-data>
- <https://developers.cloudflare.com/d1/wrangler-commands/>
- <https://developers.cloudflare.com/workers/configuration/secrets/>

## K1D-02T controlled acceptance result

- Authorization: pass; limited to one synthetic unpaid, uninvoiced Draft Order.
- Repository/live preflight: pass; both Variants were active and available, canonical shop and scopes matched, and no prior Shopify draft or D1 claim existed.
- Authentic proxy submission: reached the production handler; Shopify returned `422 SHOPIFY_REJECTED`.
- Shopify Admin reconciliation: zero drafts for quotation reference `KQ-K1D02T20261029-1` and deterministic tag `K1D-e1dc123a1a160094e8314dc7`.
- D1 reconciliation: `FAILED_RETRYABLE`, attempt count `1`, no draft ID/name, matching payload hash.
- Duplicate/idempotency acceptance: not run because the first creation failed; sending a duplicate after a confirmed failure would not prove completed-claim reuse.
- Draft content and Admin inspection: blocked because no Draft Order exists.
- Safety: no draft, customer, shipping line, invoice, payment, inventory reservation, completion, Order, or fulfillment was created. Storefront automation remains disabled and the email fallback remains active.
- Sanitized evidence: `docs/qa/evidence/epic-k/k1d02t-2026-10-29/acceptance-blocked.json`.

## K1D-02T-R diagnostic repair

- Read-only Admin reconciliation reverified zero drafts for failed reference `KQ-K1D02T20261029-1`; D1 remains `FAILED_RETRYABLE`, attempt `1`, with no draft ID/name. The claim and historical evidence were not changed or backfilled.
- `draftOrderCreate.userErrors.field` is sanitized into allowlisted paths such as `input.email`; messages are discarded. Safe classifications such as `INVALID_EMAIL` are derived without retaining values.
- Top-level GraphQL codes are allowlisted. `ACCESS_DENIED` and `GRAPHQL_VALIDATION_FAILED` are deterministic; `THROTTLED` remains retryable; unknown/internal/network/5xx outcomes remain uncertain and reconcile before another mutation.
- A deterministic Shopify input rejection receives the same generic public `422 SHOPIFY_REJECTED` response with `retryable: false`, while D1 returns `REJECTED` on the same idempotency key rather than reacquiring it.
- The corrected fixture commits no email, uses a new reference/cart token, retains both Variants/quantities/properties, removes optional phone/company/address2, and accepts the email only from a secure runtime variable. Reserved `.invalid`, `.test`, `.example`, localhost, and example domains are rejected only by the acceptance runner, not by production customer validation.
- The runner requires exact password-rotation and unused-authorization confirmations before browser launch. Error output redacts the password, controlled email, tokens, secrets, and authenticated URLs; it starts no trace, screenshot, or video recording.
- Migration `0002_draft_diagnostics.sql` and Worker version `9aadbca9-4711-46fc-8279-3be8051cf3e0` are live. Health is HTTP `200`; all three D1 tables are present. Sanitized deployment evidence: `docs/qa/evidence/epic-k/k1d02t-r-2026-10-29/repair-deployment.json`.
- No corrected Draft Order mutation ran because password rotation and the owner-controlled email have not been confirmed.

The following acceptance requirements remain unproven until a corrected authorized fixture succeeds:

- one Shopify-confirmed `OPEN` draft with `Unquoted` and deterministic reconciliation tags;
- correct Variants, quantities, public line properties, customer contact, shipping address, delivery instructions, and quotation reference;
- no shipping line, invoice, payment, completion, or inventory reservation;
- retry of the same reference returns the same draft and creates no duplicate;
- eligible Grafton pickup continues to native checkout and creates no draft;
- selling-plan exception remains on the email fallback;
- native contact email fallback remains active and is not described as Shopify Admin storage.

## Validation evidence

The October 29 K1D-02V-R and K1D-02T validation produced these results:

- K1D-02 readiness validator: pass in `CORRECTED_ACCEPTANCE_AWAITING_SECURE_INPUTS`.
- K1D-02T acceptance-runner tests: 10/10, including reserved domains, secure email injection, password rotation, unused authorization, and secret redaction.
- K1D endpoint tests: 18/18; D1 adapter tests: 8/8; exact Worker router tests: 15/15.
- Wrangler `4.155.0` dry-run: pass against the real D1 ID, canonical shop, API `2026-10`, and public app client ID.
- Epic K policy: valid; policy fixtures 73/73.
- Quote-mode contract: valid; policy fixtures 40/40; browser fixtures 20/20 across the retained responsive matrix.
- K1C-02 activation safety: valid `BLOCKED`; fixtures 10/10.
- Cart configuration, Product purchase architecture, theme architecture, and JSON registers: pass.
- Shopify Theme Check on the approved English projection: 165 files, zero offenses.
- Scoped credential scan: no token or credential value; only the required secret-binding name and validator patterns are present.
- Fresh Worker health read: HTTP `200` with `{"ok":true,"service":"rhino-quotation-drafts"}`.
- Client credentials: pass; token lifetime `86399`; zero required scopes missing; zero required identity mismatches.
- Protected customer data configuration: pass for name, email, phone, address, and protected personal data; zero customer records queried.
- Authentic Shopify proxy forwarding and end-to-end signature gate: pass on `/shopify/app-proxy/quote/`; Shopify-generated signed pickup returned `409 PICKUP_NOT_ALLOWED`.
- Direct HMAC controls: valid signed pickup `409 PICKUP_NOT_ALLOWED`; invalid signature `401 UNAUTHORIZED`; stale signed request `401 EXPIRED_REQUEST`.
- Remote D1 schema: pass for `quote_submission_claims` and `quote_rate_windows`; read-only query made zero writes.
- Encrypted binding: `SHOPIFY_API_SECRET` exists as `secret_text`; no value was returned.
- K1D-02T-R final checks: Worker health HTTP `200`; all three D1 tables present with zero read writes; failed claim unchanged at one attempt; current Worker version is `9aadbca9-4711-46fc-8279-3be8051cf3e0`.
- Scoped repository checks: K1D-02T path-limited `git diff --check` passed; credential-value scan covered ten scoped files with zero findings. The unrelated Epic J trailing-whitespace finding remains outside this task and was not modified.

Mocked tests remain automated evidence only and are not classified as live acceptance. The live installation, token/scopes, protected-data metadata, proxy forwarding/path mismatch, Worker health, D1 schema, secret binding, and direct signature controls are the actual verification evidence listed above.

## Readiness disposition

- Repository validation: **PASS** after the K1D-02T runner and blocked-state contract updates.
- Authentic proxy acceptance: **AWAITING SECURE INPUTS**; proxy authentication/routing and the diagnostic repair pass, but no corrected mutation was authorized without the rotated-password confirmation and owner-controlled email.
- Shopify Admin acceptance: **BLOCKED** because no Draft Order exists to inspect.
- Operational readiness: **BLOCKED** until one controlled draft succeeds and duplicate suppression is demonstrated.
- Production readiness: **BLOCKED**. K1D-03 is not started, production theme `158579622085` remains unchanged and unpublished, storefront automation remains disabled, and the native email fallback remains active.
