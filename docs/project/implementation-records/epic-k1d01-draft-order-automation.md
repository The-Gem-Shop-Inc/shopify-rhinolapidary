# Epic K1D-01 — Draft-order quotation automation

Date: 2026-10-28

Repository state: `REPOSITORY_READY_INTEGRATION_BLOCKED`

Store: `rhino-lapidary.myshopify.com`

## Outcome

K1D-01 now has a tested, host-neutral server endpoint contract for creating one open Shopify Draft Order per shipped-cart quotation. The endpoint uses Admin GraphQL API `2026-10` `draftOrderCreate`, adds `Unquoted` and deterministic reconciliation tags, preserves verified variant lines, quantities, public line properties, customer contact and US shipping address data, delivery instructions, discount codes, and staff-review notes. It never accepts a client price or supplies a shipping line, never sends an invoice, never processes payment, never completes a draft, and never reserves inventory.

The endpoint is not active. This repository contained no Shopify app, server runtime, app proxy, hosted secret store, offline Admin token, protected-customer-data approval, durable database, or durable rate limiter. Inventing any of those would make the integration insecure and unverifiable. The working native Shopify contact form therefore remains the only active shipping-quotation path and is now explicitly labelled as an email fallback that does not confirm Draft Order creation. Eligible Grafton pickup remains native checkout and the endpoint rejects `fulfillment: pickup` before any Admin query or mutation.

## Architecture decision

The smallest integration consistent with the existing theme is an authenticated Shopify app proxy at `/apps/rhino-quote-draft` backed by a separately hosted application endpoint:

1. Shopify forwards the same-origin storefront POST and signs the query parameters.
2. The endpoint verifies the hexadecimal app-proxy signature in constant time, verifies the exact shop, and accepts timestamps no more than five minutes old.
3. A durable limiter applies five attempts per shop/client minute before the request can reach Admin GraphQL.
4. The endpoint accepts at most 32 KiB, 50 cart lines, 1,000 units per line, 20 public properties per line, and five discount codes. Price, subtotal, shipping, discount override, and total fields are rejected.
5. `read_products` verifies that every supplied Variant GID exists and belongs to an active Product. Quantities are bounded positive integers. No client-supplied merchandise price is used.
6. A durable store atomically claims a shop-plus-quotation-reference key and records a canonical payload hash. A different payload using the same reference is a conflict.
7. `draftOrderCreate` runs only for the claim owner. The input contains no `shippingLine`, price override, inventory reservation, payment, completion, or invoice operation.
8. A successful record is returned only after Shopify confirms an `OPEN` draft with the expected `Unquoted` and reconciliation tags, no invoice timestamp, and no shipping line.
9. A browser timeout can safely retry because an in-progress or completed durable record suppresses another mutation. An uncertain Admin result is never replayed blindly: the endpoint first searches the deterministic `K1D-*` draft tag and exact quotation-reference attribute. If no draft can be reconciled, it returns an uncertain error and creates nothing else.

An app proxy is appropriate because it gives the theme a same-origin route while keeping the app secret and offline Admin token on the server. Shopify documents that an app-proxy signature proves the shop through which a request arrived, not the identity of the shopper; the endpoint therefore limits its authority to creating an unquoted draft from verified catalog Variants and does not change store configuration.

## Shopify API constraints

Current stable Admin GraphQL is `2026-10`. `DraftOrderInput` supports `discountCodes` and `acceptAutomaticDiscounts`; the endpoint sends codes to Shopify for validation and asks Shopify to recalculate automatic discounts. The staff note explicitly requires subtotal review because current discount eligibility can differ from the cart state.

Draft line `sellingPlanId` support begins in API `2027-01`, according to Shopify's October 28, 2026 changelog. K1D-01 does not silently convert those lines to one-time purchases or trust a browser price override. A selling-plan request returns `SELLING_PLAN_UNSUPPORTED` and keeps the email fallback available. Moving to `2027-01` requires a separate version review and acceptance test because only recurring and prepaid plans are initially supported.

Official references inspected:

- <https://shopify.dev/docs/apps/build/online-store/app-proxies/authenticate-app-proxies>
- <https://shopify.dev/docs/apps/build/security/app-server/authenticate-every-request>
- <https://shopify.dev/docs/api/admin-graphql/2026-10>
- <https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftordercreate>
- <https://shopify.dev/docs/api/admin-graphql/2026-04/input-objects/DraftOrderInput>
- <https://shopify.dev/docs/api/usage/access-scopes>
- <https://shopify.dev/changelog/posts/add-selling-plans-to-draft-order-line-items-with-the-admin-graphql-api>

## Repository implementation

Server contract:

- `server/epic-k-draft-order/core.js`
- `server/epic-k-draft-order/endpoint.js`

Governance and tests:

- `data/epic-k-k1d01-draft-order-automation.json`
- `schemas/epic-k-k1d01-draft-order-automation.schema.json`
- `scripts/validate-epic-k-draft-order.js`
- `scripts/test-epic-k-draft-order.js`
- `scripts/test-epic-k-quote-mode-browser.js`
- `scripts/validate-json-registers.js`
- `package.json`

Controlled fallback disclosure:

- `snippets/rhino-quote-checkout.liquid`
- `locales/en.default.json`

## Required installation and hosting

Before storefront activation, the owner must provide or approve all of the following:

1. An HTTPS application host with a supported Node/Web Request runtime. The exported endpoint is framework-neutral and must be mounted at the app proxy destination.
2. A Shopify app installed only on `rhino-lapidary.myshopify.com`, with one proxy configured from storefront `/apps/rhino-quote-draft` to the hosted endpoint.
3. Granted `write_draft_orders`, `read_products`, and app-proxy configuration access (`write_app_proxy`). `write_draft_orders` permits draft creation; its write scope also covers draft reads used for reconciliation. No order, payment, fulfillment, customer-write, or theme-write scope is required by the endpoint.
4. Shopify protected-customer-data configuration and approval appropriate for email, phone, and shipping address fields on the production store.
5. The app shared secret and an offline Admin API access token stored only in the host's secret manager. Neither value may enter Liquid, browser JavaScript, source control, logs, or response bodies.
6. A durable database adapter implementing atomic `claim`, `complete`, `markRetryableFailure`, and `markUncertain` operations with a unique idempotency key, plus a durable `consume` rate-limiter adapter. In-memory or browser/session storage is prohibited outside tests.
7. Operational logging that records reference, state transitions, Shopify request IDs, and sanitized error classes without customer details, secrets, query signatures, or tokens.

## Acceptance status

Repository policy, unit, contract, and existing quote-browser regressions are runnable through:

```text
npm run validate:epic-k-k1d01
npm run test:epic-k-k1d01
npm run test:epic-k-quote-mode
npm run validate:epic-k-quote-mode
npm run validate:epic-k-k1c02
npm run test:epic-k-k1c02
npm run validate:cart-config
npm run validate:product-purchase
npm run validate:theme-architecture
npm run validate:registers
```

End-to-end browser interception against the new path, a real Draft Order, Admin inspection, and preview screenshots remain blocked because no endpoint is hosted and no app installation or credential is available. The browser regression nevertheless proves the active fallback is the native contact form, is visibly distinguished from Admin storage, and selecting pickup does not call the draft proxy.

No preview upload occurred in this batch because activating or presenting an unavailable endpoint would be misleading. Preview theme `158631198917` and production theme `158579622085` were not published. No shipping profile, rate, pickup setting, invoice, payment, order, customer, inventory reservation, or real Draft Order was changed.

## Preview acceptance gate

After the dependencies above exist, a separate controlled preview batch must:

1. mount the endpoint and prove invalid signatures, stale signatures, cross-shop requests, payload limits, abuse limits, inactive Variants, and pickup requests fail closed;
2. intercept single-line, multi-line, quantity, property, discount, API rejection, client timeout, uncertain Admin timeout, retry, and duplicate cases in a real browser;
3. create a real `OPEN` draft tagged `Unquoted` and inspect its lines, quantities, public properties, email, address, notes, attributes, discounts, and reference in Shopify Admin;
4. prove there is no shipping line, invoice timestamp, completed order, payment, or inventory reservation;
5. prove eligible Grafton pickup still performs only native checkout and creates no draft;
6. keep the contact fallback available until Product Owner and staff acceptance is recorded.

Production readiness is **blocked**. The repository contract is ready for integration, but it is not a deployed backend and must not be represented as one.

## Validation executed

The October 28 repository run produced these results:

- `npm run validate:epic-k-policy` — pass; live checkout enforcement remains intentionally `UNVERIFIED`.
- `npm run test:epic-k-policy` — pass, 73/73.
- `npm run validate:epic-k-quote-mode` — pass.
- `npm run test:epic-k-quote-mode` — pass, 40/40 policy and 20/20 browser tests across the retained responsive matrix. The K1D browser assertion confirms the native contact action, explicit email-only disclosure, and zero draft-proxy requests when pickup is selected.
- `npm run validate:epic-k-k1c02` — pass with the existing activation state `BLOCKED`.
- `npm run test:epic-k-k1c02` — pass, 10/10.
- `npm run validate:epic-k-k1d01` — pass with `REPOSITORY_READY_INTEGRATION_BLOCKED`.
- `npm run test:epic-k-k1d01` — pass, 13/13 covering a single item, multiple Variants, quantities, public properties, discount recalculation, selling-plan exception, pickup rejection, invalid/inactive cart data, Admin rejection and retry, durable duplicate suppression, client-timeout retry, uncertain-result reconciliation, unreconciled timeout safety, proxy authentication, timestamp, size and abuse limits, and absence of invoice/payment/completion mutations.
- `npm run validate:cart-config` — pass.
- `npm run validate:product-purchase` — pass.
- `npm run validate:theme-architecture` — pass.
- `npm run validate:registers` — pass, including the K1D contract/schema pair.
- Shopify Theme Check on the approved English projection — pass, 165 files and zero offenses after applying the repository `.theme-check.yml` allowlist.
- `npm run validate:theme-repository` — pre-existing unrelated failure only: four already tracked Epic F evidence `.log` files violate the repository's no-tracked-log rule. K1D did not alter those files.

The browser evidence directory used for this repository-only run was an operating-system temporary directory and was intentionally not committed as preview evidence. No deployed-preview evidence exists because the endpoint dependencies are absent.
