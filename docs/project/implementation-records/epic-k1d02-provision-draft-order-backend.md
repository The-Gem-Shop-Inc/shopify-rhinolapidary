# Epic K1D-02 — Provision quotation Draft Order backend

## Outcome

Repository preparation is complete and external provisioning is blocked pending owner authorization and credentials. No existing Rhino-specific application host, Shopify app configuration, durable store, or deployable backend was present. The existing Admin API scripts are operator-side audit tools and are not a safe runtime to reuse. K1D-02 therefore packages the host-neutral K1D-01 endpoint as a dedicated Cloudflare Worker with D1 storage.

No Cloudflare service was provisioned, no Shopify app was created or installed, no secret was set, no Worker was deployed, no storefront client was activated, and no live Draft Order was created. Preview theme `158631198917` and production theme `158579622085` were not changed or published. Shipping rates and pickup settings were not touched.

The Product Owner's human confirmation that the existing native Shopify contact-form email reached Rhino staff is now recorded. That proves the fallback intake path only; it is not classified as automated Draft Order acceptance.

## Architecture

- `server/epic-k-draft-order/worker.mjs` is the Cloudflare Workers entry point and reuses K1D-01 `core.js` and `endpoint.js` directly.
- Web Crypto/Node crypto, standard `Request`/`Response`, and GraphQL `fetch` bundle successfully under compatibility date `2026-10-28` with Wrangler `4.155.0`.
- The Worker accepts the proxy destination only at `/shopify/app-proxy/quote`. K1D-01 authenticates the Shopify HMAC signature, exact shop, and timestamp before accepting the request.
- D1 stores only operational claim metadata, payload hashes, quote references, Shopify draft IDs/names, and hashed rate keys. It does not store the submitted customer payload.
- A unique D1 primary key and unique quotation reference make the initial claim atomic. `CLAIMED` work can be retried only after a lease expires. Immediately before `draftOrderCreate`, the endpoint durably fences the operation as `MUTATING`. An expired mutation fence becomes `UNCERTAIN`, which can only reconcile by deterministic Shopify tag and exact quote attribute; it can never issue a blind second mutation.
- Confirmed Shopify rejections become `FAILED_RETRYABLE`. Confirmed draft creation stores both the GraphQL Draft Order ID and Shopify staff name such as `#D1234`. Automated success cannot be rendered without that staff identifier.
- A D1 atomic upsert enforces five signed attempts per shop/client hash per minute.
- The app uses Shopify's current client-credentials grant for a server-side integration acting on a store in the same organization. The Worker exchanges the configured Client ID and secret for a scoped token and reuses that token within the quotation request. A copied legacy custom-app token is neither expected nor supported.
- The native contact form remains the truthful active path. The storefront contains no call to `/apps/rhino-quote-draft`; pickup continues through native checkout.

## Shopify requirements

The app version must request exactly the capabilities used by this batch:

- `read_products` to verify every submitted Variant against current Shopify data;
- `write_draft_orders` to query/reconcile and create Draft Orders;
- `write_app_proxy` to configure `/apps/rhino-quote-draft`.

Draft Orders contain protected customer data. The app must request Level 2 access for name, email, phone, and address, with the quotation-processing purpose and data-handling answers completed before live use. A development-store allowance is not production approval.

Current sources checked on October 28, 2026:

- <https://shopify.dev/docs/apps/build/dev-dashboard/create-apps-using-dev-dashboard>
- <https://shopify.dev/docs/apps/build/cli-for-apps/app-configuration>
- <https://shopify.dev/docs/apps/build/online-store/app-proxies>
- <https://shopify.dev/docs/apps/build/online-store/app-proxies/authenticate-app-proxies>
- <https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials-grant>
- <https://shopify.dev/docs/api/usage/access-scopes>
- <https://shopify.dev/docs/apps/launch/protected-customer-data>

## Required owner-authorized setup

Do not run these steps until the owner authorizes Cloudflare provisioning, Shopify app creation/installation, and one controlled Draft Order.

1. In the Shopify Dev Dashboard, select the organization that owns Rhino Lapidary. Confirm both the app and `rhino-lapidary.myshopify.com` belong to that organization; otherwise the client-credentials grant will return `shop_not_permitted` and a separate authorization-code implementation is required.
2. Go to **Apps > Create app > Start from Dev Dashboard**, name it **Rhino Quotation Drafts**, and create it.
3. In the app, go to **API access requests > Protected customer data access**. Request Level 2 fields name, email, phone, and address, record the quotation-processing purposes, and submit/save the required data-protection answers.
4. In Cloudflare, authenticate the correct Rhino-owned account without committing credentials:

   ```powershell
   npx wrangler login
   npx wrangler whoami
   npx wrangler d1 create rhino-quotation-drafts
   ```

5. Copy `config/wrangler.epic-k-draft-order.jsonc` to an environment-specific configuration or replace its two explicit placeholders with the returned D1 database ID and the Shopify Client ID. Keep the app secret out of the file.
6. Apply the schema remotely, set the secret interactively, and deploy:

   ```powershell
   npx wrangler d1 migrations apply rhino-quotation-drafts --remote --config config/wrangler.epic-k-draft-order.jsonc
   npx wrangler secret put SHOPIFY_API_SECRET --config config/wrangler.epic-k-draft-order.jsonc
   npx wrangler deploy --config config/wrangler.epic-k-draft-order.jsonc
   ```

7. Check `https://<worker-host>/health`; it must return HTTP 200 without exposing a token or secret. An unsigned POST to the proxy destination must return 401.
8. In **Dev Dashboard > Apps > Rhino Quotation Drafts > Versions > Create version**, set the Worker host, Admin API version `2026-10`, scopes `read_products,write_draft_orders,write_app_proxy`, and app proxy destination `https://<worker-host>/shopify/app-proxy/quote` with prefix `apps` and subpath `rhino-quote-draft`. Release the version, then select **Install app** and approve it for Rhino Lapidary.
9. For CLI-managed configuration instead, first link the Dev Dashboard app and validate the generated config, then merge the reviewed blocks from `config/shopify.app.epic-k-draft-order.template.toml` and deploy a version:

   ```powershell
   shopify app config link --client-id <client-id> --file-name epic-k-draft-order
   shopify app config validate --config epic-k-draft-order
   shopify app deploy --config epic-k-draft-order
   ```

10. Verify the granted scopes returned by the client-credentials exchange. Do not proceed if the store is out of organization, a scope is missing, protected-data access is not available, or the proxy signature check fails.
11. Only then implement the K1D-03 preview client activation, keeping the email fallback visible. Run one owner-authorized shipping quotation and inspect the resulting Admin Draft Order before retrying the same reference and exercising pickup.

## Controlled preview acceptance checklist

Live acceptance must record actual Admin evidence, not mocked test output:

- one `OPEN` Draft Order with `Unquoted` and deterministic reconciliation tags;
- Shopify staff identifier returned to the storefront and matching the inspected draft;
- exact Variants, quantities, public line properties, customer contact, shipping address, delivery instructions, and quotation reference;
- no shipping line, invoice, payment, completion, or inventory reservation;
- a repeat of the identical quotation returns the same stored draft and creates no duplicate;
- an eligible Grafton pickup uses native checkout and creates no draft;
- a selling-plan cart stays on the email fallback under API `2026-10`;
- the manual email fallback remains correctly distinguished from Admin storage.

## Validation evidence

- Wrangler dry-run: pass; Worker bundle `45.82 KiB`, gzip `11.46 KiB`, with only `QUOTE_DB`, shop domain, API version, and Client ID bindings reported.
- Local D1 migration: pass; five statements applied to the isolated local database.
- K1D endpoint tests: pass, 16/16, including variants, quantities, properties, discounts, selling-plan fallback, pickup rejection, API rejection/retry, duplicate/concurrent requests, timeout reconciliation, malformed/expired/out-of-shop signatures, scope checks, and prohibited mutation checks.
- D1 adapter tests: pass, 6/6, including concurrent claims, idempotency conflicts, confirmed retry, expired mutation uncertainty, stored staff identifier, and rate exhaustion.
- Epic K policy/evidence/collector/remediation/mapping/intake/quote-mode validations: pass. Existing governance truth remains explicit: eight operational evidence categories and live checkout enforcement are still blocked/unverified.
- Quote-mode browser tests: pass, 20/20. K1C-02 activation safety tests: pass, 10/10 after updating the historical test fixture for the new human-confirmed contact state.
- Cart configuration, product purchase architecture, theme architecture, JSON registers, and JavaScript syntax: pass.
- Approved English Theme Check projection: pass, 165 files and zero offenses. The full multilingual scan still reports 1,320 previously governed missing Epic K translations across 30 unpublished locale files and is not the approved release scope.
- `npm audit --audit-level=high`: pass, zero vulnerabilities after updating the transitive `fast-uri` package within the existing `ajv` range.
- Repository validator: only the four pre-existing tracked Epic F `.log` evidence files fail the no-tracked-log rule; K1D-02 did not change those files.

## Changed files

- Runtime: `.gitignore`, `server/epic-k-draft-order/endpoint.js`, `server/epic-k-draft-order/d1-adapters.js`, `server/epic-k-draft-order/worker.mjs`, `migrations/epic-k-draft-order/0001_quote_backend.sql`.
- Deploy templates: `config/wrangler.epic-k-draft-order.jsonc`, `config/shopify.app.epic-k-draft-order.template.toml`.
- Contracts: `data/epic-k-k1d02-backend-readiness.json`, `schemas/epic-k-k1d02-backend-readiness.schema.json`, `data/epic-k-k1c02-activation-status-2026-10-27.json`.
- Tests/validation: `scripts/test-epic-k-draft-order.js`, `scripts/test-epic-k-d1-adapters.js`, `scripts/test-epic-k-k1c02.js`, `scripts/validate-epic-k-k1d02.js`, `scripts/validate-json-registers.js`, `package.json`, `package-lock.json`.
- Records: `docs/rhino-lapidary-pbi-tracker-epic-k.md`, this implementation record.

## Production readiness

Not production ready. Repository/runtime preparation is complete, but hosting, app ownership, installation, granted scopes, protected customer data, secrets, live proxy authentication, and controlled preview acceptance are all unverified. K1D-03 should be authorized only after those dependencies are satisfied. Production publication remains prohibited.
