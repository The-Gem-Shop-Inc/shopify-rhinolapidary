# Epic K1D-03 — connect storefront shipping quotations to Draft Orders

Date: October 30, 2026

## K1D-03 implementation outcome before live acceptance

The existing complete-cart shipping quotation form is integrated with the accepted `/apps/rhino-quote-draft` app proxy on unpublished preview theme `158631198917`. The repository setting defaults disabled; preview alone is configured enabled. Production theme `158579622085` was not changed or published. No live Draft Order, invoice, payment, completion, reservation, fulfillment, customer, shipping-rate, pickup-setting, or app-configuration mutation occurred.

The K1D-02T result remains historical and unchanged: authentic proxy Draft Order `#D2` is accepted, and its consumed authorization was not reused.

## Storefront contract

On intentional automated submission, the browser retrieves the current locale-aware Ajax cart and compares its canonical material state with the page-open baseline. The payload contains fulfillment `shipping`, a durable quotation reference, a one-way hashed cart token, every cart line in order, native Variant GIDs, quantities, public properties, supported discount-code strings, cart note, explicit customer first/last names and contact fields, US address, delivery type, liftgate boolean, access information, and insurance boolean.

The payload contains no merchandise price, shipping price, applied amount, invoice instruction, payment term, completion, reservation, or fulfillment operation. Duplicate Variant IDs with different properties remain separate lines. The backend remains authoritative for active Product/Variant availability and Shopify pricing.

Selling-plan lines fail closed because API `2026-10` cannot preserve them. Discount codes are sent only when the Ajax representation is faithful; an observed coded discount without its code fails closed. Both cases direct the customer to the explicit native Shopify contact-form alternative without erasing form or cart data.

## Identity and result handling

References use `KQ-<96-bit-random>-<quantity>` and are bound to a SHA-256 fingerprint of canonical cart and quotation fields. An unchanged safe retry reuses its reference; a materially new eligible request receives a new reference. Confirmed cart state is restored after refresh. `submitting` and `uncertain` states block both automated and email submission even when the fingerprint is unchanged, preventing a second request under another reference.

Only a 2xx response containing `storedInShopifyAdmin: true`, the exact valid reference, and a valid `#D*` staff identifier displays Draft Order success. A confirmed duplicate displays the recovered identifier. Rate limiting, a known in-progress response, and explicitly retryable pre-confirmation rejection keep the same reference. Timeouts, malformed success, 5xx results, or reference mismatch become uncertain and are never automatically retried.

## Native fallback and pickup

The Shopify `{% form 'contact' %}` route and native CAPTCHA remain intact. The email button is a separate intentional action, identifies itself as not stored in Shopify Admin, creates its own cryptographic reference at submit time, and retains complete cart details. Automated success disables the email action. Native success copy explicitly says no Draft Order was created.

Grafton pickup remains the K1C native checkout path. Whole-cart Product/Variant policy and live pickup availability still gate the checkout button; one-business-day preparation copy remains; accelerated checkout remains suppressed. Selecting pickup never contacts the Draft Order proxy.

## Validation and deployment

- `npm run test:epic-k-k1d03`: 20/20 client plus 13/13 mocked browser checks passed.
- `npm run validate:epic-k-k1d03`: passed `PREVIEW_DEPLOYED_AWAITING_LIVE_BROWSER_ACCEPTANCE`.
- K1C quote mode: 40/40 policy and 20/20 browser checks passed; K1C-02 10/10 passed and remains `BLOCKED` for production.
- K1D-02: endpoint 18/18, D1 8/8, Worker router 15/15, and readiness validation passed `CONTROLLED_DRAFT_ACCEPTED`.
- JSON registers, cart configuration, Product purchase architecture, and theme architecture passed.
- Approved English Theme Check projection: 165 files, zero offenses. Unapproved locale catalogs were not expanded.
- Offline mocked screenshots passed at 1440, 1024, 768, 390, 320, and a 720px 200%-zoom equivalent.
- Deployed preview mocked verification passed the same six viewports using the actual Shopify Ajax cart. The browser intercepted the only app-proxy request and returned a mock confirmation; zero real proxy forwarding, live Draft Orders, or contact submissions occurred.

The scoped push uploaded the draft client, quote-mode JavaScript/CSS, checkout snippet, cart footer, settings schema, and English locale to preview theme `158631198917`, then set only that theme's `rhino_quote_draft_automation_enabled` value to `true`. Exact remote readback matched the six non-locale code/schema files; the English locale was semantically exact after Shopify's generated header. Theme role remained `unpublished`.

Production readback retained the historical cart-footer hash `50d68da1aeb8a1e7c736fbe6a04ae0f56eabe6aa14b3f331e503e944b19f197d`, no `rhino-quote-draft-client.js`, and no automation value.

Evidence is under `docs/qa/evidence/epic-k/k1d03-storefront-2026-10-30/`. Mocked evidence is not live acceptance.

## Historical remaining gate before K1D-03A

At the original K1D-03 handoff, actual customer-browser acceptance still required a new, explicit authorization for exactly one real unpaid, uninvoiced Draft Order after staff agreed on the controlled cart/contact inputs. That gate was subsequently completed by K1D-03A as recorded below. Production activation remains separate and was not authorized by K1D-03A.

## K1D-03A live acceptance addendum

The remaining customer-browser gate was completed under a separate Product Owner authorization. The actual preview storefront assembled the two accepted Variants through Shopify's Ajax cart, generated reference `KQ-6D418804E7DCD1FEEAAAC48E-3` in the deployed K1D-03 client, and sent exactly one unmocked POST through `/apps/rhino-quote-draft`.

Shopify created `#D3` (`gid://shopify/DraftOrder/1268053901509`). Admin and D1 reconciliation found exactly one matching `OPEN`, `Unquoted` draft and a `COMPLETED` claim with attempt count `1`, the deterministic `K1D-39cdf268c2679815a90475fc` tag, and matching payload hash. Both Variant identities, quantities, public properties, contact, destination, commercial delivery type, liftgate, insurance, access instructions, and cart note matched. No shipping line, invoice, payment, completed Order, fulfillment, or inventory reservation exists.

The customer-visible response initially displayed the correct reference and `#D3`. Refresh then exposed a presentation-only defect: confirmed local state was recovered, but the enclosing shipping panel reset hidden. The fix makes `showConfirmed` select the shipping fulfillment choice before exposing the confirmation. A new mocked regression reproduces the refresh path and asserts that no second proxy or contact request occurs.

Only `assets/rhino-quote-mode.js` was uploaded to unpublished preview theme `158631198917`. Exact remote readback matched SHA-256 `e0fafee0f67f0edf2f5ee0de6ec0586cb3d236f7966ebd4c8e051b5fbfff6837`. Recovery of the existing `#D3` browser state and a further refresh both displayed the confirmation with zero additional proxy POSTs and zero contact submissions. Production theme `158579622085` remained unchanged and published production activation was not attempted.

Final regression passed: K1D-03 client 20/20 and browser 13/13; quote-mode policy 40/40 and browser 20/20; K1C-02 10/10; K1D-02 endpoint 18/18, D1 8/8, and Worker router 15/15. K1D-03, K1D-02, registers, cart configuration, Product purchase, and theme-architecture validators all passed. The approved English Theme Check projection inspected 165 files with zero offenses.

K1D-03A is accepted. K1D-04 may proceed only under its separate production-activation authorization. Sanitized evidence is under `docs/qa/evidence/epic-k/k1d03a-storefront-2026-10-30/`.
