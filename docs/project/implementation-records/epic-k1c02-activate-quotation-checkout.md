# Epic K1C-02 — Activate Quotation Checkout and Preserve Immediate Pickup Payment

Date: 2026-10-27

Branch: `epic-k/k1c02-activate-quotation-checkout`

Baseline: `68a583d17483112f2c90bf4a47fcedd1c6f3884c`

Parent PBI: `K-PBI-003`

## Outcome

K1C-02-R corrected the pickup policy and preview implementation, then reran the checkout surface against current Shopify data. Production activation stopped at the staff-intake confirmation gate. Production theme `158579622085` was not changed or published. The October 27 snapshot below predates the Product Owner's separately authorized Admin API removal of the obsolete $8 Standard and $15 Express rates later that day; K1C-02-R-UI did not recreate or delete any rate.

The Product Owner's governing instruction now uses a default rule: an active Product may use immediate pickup when Shopify's live pickup endpoint confirms the complete cart at the configured Grafton location, unless an explicit Product or Variant exclusion applies. Inventory transfers and unavailable preparation arrangements fail closed. The empty allowlist was removed. This policy change does not create evidence receipts: K-EVID-001 and K-EVID-002 remain blocked operational records.

## Sanitized live audit

Authenticated Admin GraphQL reads used API version `2026-10` and verified the permanent store identity before collecting configuration. Restricted raw responses remain outside Git at `LocalAppData/RhinoLapidary/restricted-evidence/epic-k-k1c02-2026-10-27`. The sanitized repository record is `data/epic-k-k1c02-activation-status-2026-10-27.json`.

- Themes: production theme `158579622085` remains live; preview theme `158631198917` remains unpublished.
- Shipping at the recorded pre-removal audit time: the General profile assigned 114 Variants. Its contiguous-US zone had $8 Standard and $15 Express rates, while its Alaska/Hawaii quotation zone had no methods. The machinery quotation profile assigned 11 Variants across the 50 states and had no methods. The Product Owner reports that the two obsolete General rates were removed and the resulting profiles verified through the Admin API on October 27; this historical snapshot is not an instruction to recreate them.
- Discounts and Markets: no active discount nodes were returned; the only active Market covers the United States.
- Pickup: Shopify location `1411 6th Ave` is the configured Grafton location. It is active, fulfills online orders, ships inventory, has pickup enabled, and states one-business-day preparation excluding weekends. The other two locations have pickup disabled.
- Inventory: 13 Variants have positive Grafton inventory; three belong to active Products. No audited machine has positive Grafton inventory. These facts do not confer pickup approval.

No unrelated configuration was changed.

## Controlled draft invoice verification

A controlled internal draft used two representative Product lines, a synthetic address, and a synthetic $12.34 custom shipping charge. This amount was test data for Shopify's draft-order calculation path and is not a Rhino shipping price or approval.

Shopify accepted the two lines and custom shipping charge, reconciled a $4,042.00 merchandise subtotal to a $4,054.34 total, calculated $0.00 tax for the controlled address, marked the draft ready, and generated an HTTPS invoice payment URL. The payment page returned HTTP 200. The invoice was never sent, the draft was never completed, and no payment was submitted or processed. The controlled draft and controlled customer were deleted successfully with zero user errors after the activation gate blocked.

This proves that Shopify can represent and expose payment for an approved custom shipping line after staff builds a draft. It does not prove that a real quotation has operations approval, that the tax result generalizes to another address, or that live checkout enforcement is compliant.

## Preview verification and rate limiting

The preview runner now respects `Retry-After`, uses bounded 10/20/40-second fallback backoff, serializes browser work, and avoids repeated Product requests. Shopify's password endpoint continued returning HTTP 429, so the same unpublished theme was exercised through Shopify CLI's authenticated theme development proxy with the configured storefront password.

Two current active Variants with positive Grafton inventory produced one complete cart. At 1440×1000 and 390×844, the quotation contained both Variant identities and quantities, the Grafton checkout control enabled only after both live pickup endpoint responses named `1411 6th Ave`, accelerated checkout remained absent, and no horizontal overflow occurred. A nonavailable machine remains fail closed; no machine currently has positive Grafton inventory, so an actual machine pickup cart could not be formed.

The controlled contact form reached Shopify's anti-bot site-configuration check, but automation could not complete the challenge and no `/contact` POST occurred. The configured Shopify contact email exists, but delivery of the complete quotation to staff is therefore unconfirmed. The runner did not bypass the challenge or log the address.

## K1C-02-R-UI layout repair — October 28, 2026

The blocking layout defect came from two nested width constraints. Trade applies `width: 35rem` to each direct cart-footer child at 750px and wider, which limited `.cart__blocks` to 350px. Epic K then placed the shipping route and pickup route inside that width using `grid-template-columns: minmax(0, 2fr) minmax(28rem, 1fr)`. The pickup minimum consumed almost the entire parent, leaving the shipping route—and its nested form—as a character-wide strip.

The repair gives the quote-mode footer a full-width, single-column parent region; uses responsive, auto-fitting choice cards; and moves the contact form into its own region below both choices. Shipping and pickup are explicit radio choices. Selecting shipping reveals the form, selecting pickup hides it without resetting entered values, and Shopify's native contact form remains the submission owner. The field grid uses two columns only from 900px and one column below that. No quotation policy, cart payload, pickup policy, CAPTCHA behavior, or checkout suppression was changed.

Changed storefront files:

- `sections/main-cart-footer.liquid`
- `snippets/rhino-quote-checkout.liquid`
- `assets/rhino-quote-mode.css`
- `assets/rhino-quote-mode.js`

Regression and preview tooling changed in `scripts/test-epic-k-quote-mode-browser.js`, `scripts/validate-epic-k-quote-mode.js`, and `scripts/verify-epic-k-k1c02-preview.js`. The browser matrix covers 1440, 1024, 768, 390, and 320 CSS pixels plus a 720px reduced CSS viewport representing 1440px at 200% zoom. Each cell asserts card, heading, form, field, and submit-button geometry; form placement; horizontal containment; selection switching; and pickup restoration. It captures both shipping and pickup screenshots.

Repository validation passed: Epic K policy 73/73; quote-mode policy 40/40 plus browser 13/13; K1C-02 safety 10/10; cart configuration; Product purchase architecture; theme architecture; JSON registers; JavaScript syntax; and the approved English Theme Check projection (165 files, zero offenses). The full multilingual Theme Check still reports the previously governed missing Epic K translations in 50 unpublished locale catalogs, so it is not the approved release scope.

The persistent preview received only the four storefront files above using `--only`, `--nodelete`, `--strict`, and no publish flag. Exact readback hashes were:

- `assets/rhino-quote-mode.css`: `c63773a964bded50de55ee60336926568d28771a1a3e684efa143857c1036e1b`
- `assets/rhino-quote-mode.js`: `1872ffa9f21061f2bd2c57d5fcbf9694e2b67a9b73ee97dca32740e0b388c5fa`
- `sections/main-cart-footer.liquid`: `61ff85c3ab0df57fd34e2df1691c7923b5c740800643dd0b7fb5c421740c3ff2`
- `snippets/rhino-quote-checkout.liquid`: `191bc1570fbe72fa8a09b41f8bc15806d66fab97645c0e202a34dd5e2436cdf7`

Deployed preview geometry passed all six cells. At 1440px, the two cards were 638px each and the form region was 1300px. At 768px, cards were 322px each and fields reflowed to a 624–626px single column. At 390px and 320px, cards stacked; the 320px cards were 286px, the form was 290px, and visible controls were 256–258px. Every document width equaled its viewport width. Both live Variant pickup responses named `1411 6th Ave`, enabling exactly one native pickup checkout; accelerated checkout count stayed zero. No contact form, checkout, payment, or order was submitted.

Accessibility checks confirmed explicit labels, natural DOM/focus order with no positive `tabindex`, 44px choice-label targets, 20px or larger radio controls, visible native validation, a fully visible submission button, and value retention while switching fulfillment modes. Screenshot evidence and the sanitized geometry summary are under `docs/qa/evidence/epic-k/k1c02-layout-repair-2026-10-28/`; deployed results are in `preview/verification-summary.json`.

Preview theme `158631198917` remained unpublished after final readback. Production theme `158579622085` remained live; its pre/post `sections/main-cart-footer.liquid` hash stayed `50d68da1aeb8a1e7c736fbe6a04ae0f56eabe6aa14b3f331e503e944b19f197d`, and it does not contain the three Epic K quote assets. The Product Owner's verified October 27 rate removal was not repeated. A fresh Admin delivery-profile read was unavailable in this checkout because no Admin API token was present; the read-only collector failed closed before issuing a Shopify request.

## K1C-02-R-SUBMIT recovery — October 28, 2026

The indefinite pending state was caused by one-way client state. The quotation submit listener wrote `rhino-quote:pending`, disabled the button, and displayed the submitting message as soon as the native `submit` event passed browser validation. It released that state only when a later Shopify render set `form.posted_successfully?`. A failed or timed-out hCaptcha script, a returned contact-form error, or a restored page therefore had no path back to an enabled control. The blocked analytics requests were unrelated; the recovery code filters specifically for hCaptcha script hosts.

The repair retains Shopify's native `{% form 'contact' %}` action, generated `form_type` input, and normal browser submission. It adds no `fetch`, XHR, third-party form system, CAPTCHA bypass, or custom CAPTCHA protection call. `layout/theme.liquid` still emits the unmodified `{{ content_for_header }}` inside `<head>`, so Shopify continues to own CAPTCHA initialization and verification.

The client now treats submission as a small state machine. A completed marker is written only after Shopify renders `form.posted_successfully?`. Confirmed hCaptcha script failures and a bounded 30-second initialization stall clear the matching pending marker, remove `aria-busy`, present an assertive alert beside the submit button, preserve the live form fields, and re-enable a retry. A returned native form error or an unverified pending marker on the next render reveals the shipping form and provides the same recovery. `beforeunload` and `pagehide` stop the recovery timer once native navigation starts, which avoids enabling a second request while a contact navigation is in progress. A visible interactive hCaptcha challenge is exempt from the timeout and may remain open as long as the customer needs.

Changed storefront files:

- `assets/rhino-quote-mode.js`
- `assets/rhino-quote-mode.css`
- `snippets/rhino-quote-checkout.liquid`
- `locales/en.default.json`

Regression tooling changed in `scripts/test-epic-k-quote-mode-browser.js`, `scripts/validate-epic-k-quote-mode.js`, and `scripts/verify-epic-k-k1c02-preview.js`. The browser suite now simulates a blocked hCaptcha script, initialization timeout, returned contact failure, verified success, retry after confirmed failure, duplicate prevention after verified success, and an interactive challenge that remains open beyond the recovery timeout. Network interception is used for the provider and contact conditions. A separately blocked analytics script is ignored. The six layout viewports remain in the same suite.

Repository validation passed: Epic K quote policy 40/40; browser 19/19; K1C-02 safety 10/10; quote-mode contract validation; cart configuration; Product purchase architecture; theme architecture; JSON registers; JavaScript syntax; and the approved English Theme Check projection (165 files, zero offenses). The aggregate production-activation validator remains intentionally blocked because human staff email delivery is not yet confirmed.

The unpublished preview received only the four storefront files above with `--only`, `--nodelete`, `--strict`, and no publish flag. The first repository-root invocation stopped before upload on the already-governed unpublished-language translation findings; the successful invocation used the passing English projection. Readback produced these exact hashes, except that Shopify prepended its standard generated-file comment to the semantically exact English locale body:

- `assets/rhino-quote-mode.css`: `43fa1ef83bc1d1afe7cf4758ead6c889f876cddcb311b3168dcdbc20adecaf3e`
- `assets/rhino-quote-mode.js`: `aea002f0901b64e7938d20f3048a40ea5b320d4f47642a029605033d65c8019e`
- `snippets/rhino-quote-checkout.liquid`: `e7e9d9dede50b14065842f74a59c190efc99c4ffaec59ef86c1edfc722477c8f`
- `locales/en.default.json`: semantic body exact; deployed body hash `90b7ee1c90796fb6febb43f6f28956379ee390e2526562310a64ccd1dfa40034`

Deployed preview verification passed at 1440, 1024, 768, 390, 320, and a 720px 200%-zoom equivalent. Every viewport retained the layout-repair geometry, zero horizontal overflow, the complete form, and the Grafton pickup workflow; one native pickup checkout enabled only after both live availability checks and accelerated checkout remained absent. At 320px, the card, form, and minimum control widths remained 286px, 290px, and 256px. A deployed, intercepted hCaptcha failure produced an accessible alert, re-enabled submit, cleared pending state, preserved the entered name, recorded no completion, and made zero `/contact` POSTs. Screenshots and the sanitized summary are under `docs/qa/evidence/epic-k/k1c02-submit-recovery-2026-10-28/preview/`.

Preview theme `158631198917` remains unpublished. Production theme `158579622085` remains live and unchanged; its `sections/main-cart-footer.liquid` hash stayed `50d68da1aeb8a1e7c736fbe6a04ae0f56eabe6aa14b3f331e503e944b19f197d`. Shipping profiles and rates were not read, written, recreated, or deleted in this batch. No real contact request, checkout, invoice, payment, order, or customer record was created. Human quotation delivery remains unaccepted.

## Production activation gate

The activation sequence requires all of the following before changing the live theme or rates:

1. Complete one controlled human-assisted anti-bot challenge and confirm the complete request reaches the configured staff contact destination.
2. Confirm the reference, both cart lines and quantities, destination, delivery type, liftgate answer, access statement, and insurance selection in the received staff record.
3. Publish the verified K1C theme through the normal release workflow.
4. Treat the Product Owner's October 27 removal of the $8 Standard and $15 Express definitions as complete. Do not repeat the deletion or recreate either rate; preserve both profiles, domestic zones, the Alaska/Hawaii separation, the machinery no-rate behavior, Grafton pickup, Markets, and Shopify Payments.
5. Rerun direct checkout, pickup, shipping, Alaska/Hawaii, international, and approved draft-invoice scenarios without completing payment.

The historical rate-removal gate has been completed outside this repository batch. Production publication remains blocked until the human contact submission succeeds; K1C-02-R-SUBMIT stops at the verified unpublished preview.

## Staff procedure

1. Open the Shopify contact notification and locate the `KQ-*` reference.
2. Verify every Variant, quantity, destination, delivery type, liftgate response, access note, and requested insurance option against the complete cart.
3. Determine packaging and the applicable carrier charge, then record the operations approval and quotation validity.
4. Open or create one Shopify draft order for the complete cart and customer destination.
5. Apply the actual approved shipping charge and only those discounts still valid.
6. Review merchandise, shipping, taxes, insurance selections, and the final total.
7. Send the Shopify invoice only after the complete quotation is approved.
8. Fulfill only after Shopify records payment. Renew approval after any material cart, destination, access, service, insurance, or validity change.

## Rollback

Production rollback is not required because neither the production theme nor shipping configuration changed. Fresh K1C-02-R restricted evidence is under `LocalAppData/RhinoLapidary/restricted-evidence/epic-k-k1c02r-2026-10-27`. The unpublished preview was restored and synchronized after a scoped CLI invocation exposed incomplete remote assets; the full local theme was pushed back with remote deletion disabled before testing resumed.

The historical pre-removal rate baseline was General / Domestic / Standard $8 USD and Express $15 USD, both unconditional flat rates. It is retained only as audit history and must not be used to recreate either obsolete rate without a new explicit Product Owner authorization.

## Customer and merchant impact

No customer-facing theme was published. K1C-02-R-SUBMIT changed no shipping rate, profile, zone, Market, pickup setting, inventory, Product, payment configuration, order, or customer record. The unpublished preview theme changed. The Product Owner's separate October 27 removal of the obsolete rates remains in force. A controlled draft and controlled customer existed temporarily during the earlier activation preflight and were deleted. No invoice was sent and no customer payment was processed.

## Status

K1C-02-R-SUBMIT is complete on the unpublished preview. K1C-02 production activation remains `BLOCKED`, not active, only at the human staff-intake confirmation and later release gates. Repository, responsive preview UI, and recoverable submission-state acceptance pass; staff intake delivery does not. `K-PBI-003`, `K-PBI-002`, and Epic K remain incomplete. All eight operational evidence requirements remain blocked, and production checkout enforcement remains unverified.
