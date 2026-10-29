# Epic K1D-02 / K1D-02P / K1D-02V / K1D-02V-R — Provision and verify quotation Draft Order backend

## Outcome

Rhino-specific infrastructure and Shopify installation are verified, but the automated Draft Order path remains inactive. Shopify issued a client-credentials token for **Rhino Quotation Drafts**, and read-only Admin GraphQL returned installation `gid://shopify/AppInstallation/778440605893`, canonical domain `sz5dnk-nf.myshopify.com`, and primary storefront alias `rhino-lapidary.myshopify.com`. The token and `currentAppInstallation` both grant `read_products`, `write_draft_orders`, and `write_app_proxy`.

Cloudflare D1 database `rhino-quotation-drafts` was created in ENAM, migration `0001_quote_backend.sql` was applied, and Worker `rhino-quotation-drafts` was deployed. The Worker reports healthy at `https://rhino-quotation-drafts.mayhemmojomeister.workers.dev/health`. The Shopify app secret exists only as the encrypted Cloudflare `SHOPIFY_API_SECRET` binding. It is absent from source, Liquid, browser JavaScript, command output, and committed configuration.

Shopify app version `k1d02p-provisioned-2` is released and installed with Admin API `2026-10`, `read_products`, `write_draft_orders`, `write_app_proxy`, and `/apps/rhino-quote-draft`. The token lifetime was `86399` seconds; the token existed only in process memory and was never printed or persisted. App metadata grants the protected-data handles for name, email, phone, address, and protected personal data. No customer record was queried.

The authentic app proxy is now verified. The route guard accepts exactly `/shopify/app-proxy/quote` and `/shopify/app-proxy/quote/`; it does not normalize or prefix-match other paths. Shopify forwarded `/apps/rhino-quote-draft` to the trailing-slash destination with signed canonical-shop parameters, the Worker authenticated the request, and the existing quotation policy returned `409 PICKUP_NOT_ALLOWED` for the deliberately invalid pickup payload. Direct invalid-signature and expired-request controls continue to return `401`.

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
- Live acceptance: not run. The owner has not yet separately authorized creation of the controlled synthetic Draft Order.

## Required next implementation action

No Shopify owner configuration action remains for installation, scopes, protected customer fields, or app-proxy routing. K1D-02T may begin only after the owner explicitly authorizes one controlled synthetic shipping quotation. The repair and successful nonmutating proxy verification do not authorize a draft.

Official references checked October 29, 2026:

- <https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard>
- <https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant>
- <https://shopify.dev/docs/apps/launch/distribution/select-distribution-method>
- <https://shopify.dev/docs/apps/build/online-store/app-proxies>
- <https://shopify.dev/docs/apps/build/online-store/app-proxies/authenticate-app-proxies>
- <https://shopify.dev/docs/apps/launch/protected-customer-data>
- <https://developers.cloudflare.com/d1/wrangler-commands/>
- <https://developers.cloudflare.com/workers/configuration/secrets/>

## Controlled acceptance checklist (not yet run)

- one Shopify-confirmed `OPEN` draft with `Unquoted` and deterministic reconciliation tags;
- correct Variants, quantities, public line properties, customer contact, shipping address, delivery instructions, and quotation reference;
- no shipping line, invoice, payment, completion, or inventory reservation;
- retry of the same reference returns the same draft and creates no duplicate;
- eligible Grafton pickup continues to native checkout and creates no draft;
- selling-plan exception remains on the email fallback;
- native contact email fallback remains active and is not described as Shopify Admin storage.

## Validation evidence

The October 29 K1D-02V-R validation produced these results:

- K1D-02 readiness validator: pass in `READY_FOR_CONTROLLED_DRAFT_TEST`.
- K1D endpoint tests: 16/16; D1 adapter tests: 6/6; exact Worker router tests: 15/15.
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

Mocked tests remain automated evidence only and are not classified as live acceptance. The live installation, token/scopes, protected-data metadata, proxy forwarding/path mismatch, Worker health, D1 schema, secret binding, and direct signature controls are the actual verification evidence listed above.

## Production readiness

Ready for K1D-02T authorization, but not production ready. Installation, client credentials, required scopes, protected customer data, Worker health, D1 schema, encrypted secret binding, exact routing, and authentic Shopify-generated proxy authentication all pass. The sole remaining blocker is explicit owner authorization for one controlled synthetic Draft Order acceptance test. Production theme `158579622085` remains unchanged and unpublished, storefront automation remains disabled, and the native email fallback remains active.
