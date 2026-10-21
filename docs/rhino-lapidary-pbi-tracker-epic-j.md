# Rhino Lapidary — Epic J PBI tracker

**J1 update, October 20, 2026:** The Product Owner authorized repository implementation of J-PBI-001 and J-PBI-002. Both fixes are implemented with local native-fixture acceptance; changed-preview verification remains pending a separate deployment authorization. The J0 proposal and its structured planning register below are retained as the historical baseline. Current source authority is the separately pinned `data/epic-j-j1-source-successor.json`. J-PBI-008 remains PROPOSED, not complete. See [J1 engineering handoff](qa/evidence/epic-j/j1-2026-10-20T21-18-13-268Z/handoff.md).

**J0: architecture, executable baseline and planning delivered. Later PBIs: PROPOSED, pending Product Owner review. No customer-facing implementation or deployment is authorized by this tracker.**

The active cart is native Trade notification plus full cart page. Basic/optional accounts are verified. Current regression acceptance remains FAIL on mobile enlarged text; J-DEF-001 also records a missing Product transport-error announcement. Neither was fixed in J0. G003 private revocation/operations, G005 historical screenshots and G006 commercial exceptions remain open; G007 bounded technical QA was accepted.

[Architecture and A–L assessment](architecture/epic-j-cart-checkout-baseline.md) · [Structured PBI register](project/epic-j-proposed-backlog.json) · [Conditional decisions](project/epic-j-business-decisions.md) · [Proposed first engineering batch](project/epic-j-first-engineering-batch.md)

| PBI | Title | Dependencies | MVP | Batch | State |
| --- | --- | --- | --- | --- | --- |
| J-PBI-001 | Harden native cart failure recovery and state synchronization | J0 | Yes | J1 | Proposed |
| J-PBI-002 | Make active cart notification and page controls readable and accessible | J-PBI-001 | Yes | J1 | Proposed |
| J-PBI-003 | Consume approved equipment delivery context in the cart | J-PBI-001 | Optional / conditional | J2 AFTER K AUTHORITY | Proposed |
| J-PBI-004 | Add approved optional notes and purchase support guidance | J-PBI-001, J-PBI-002 | Optional / conditional | J2 OPTIONAL | Proposed |
| J-PBI-005 | Apply explicitly approved Product-level commercial dispositions | J-PBI-001 | Optional / conditional | J2 AFTER G006 | Proposed |
| J-PBI-006 | Clarify approved discount and accelerated checkout entry | J-PBI-002 | Optional / conditional | J3 OPTIONAL | Proposed |
| J-PBI-007 | Prepare bounded cart relationship guidance if approved | J-PBI-001 | Optional / conditional | DEFER UNTIL G003 POLICY | Proposed |
| J-PBI-008 | Validate integrated cart handoff and release boundaries | J-PBI-001, J-PBI-002 | Yes | J4 | Proposed |

Only J001/J002 and integrated J008 are current cart MVP engineering work. Optional branches are gated only if selected; K logistics and L service operations keep their own ownership. O accounts/history is outside Epic J.

## J-PBI-001 — Harden native cart failure recovery and state synchronization

**State:** PROPOSED_PENDING_REVIEW. Implementation authorized: false. **User value:** Customers receive a clear failure and can safely retry without wrong quantities or duplicate additions.

**Existing baseline:** Native notification, /cart/change and 422 recovery exist; transport rejection in product-form catch logs an error without invoking its visible error handler.

**Scope:**

- Reproduce transport rejection, malformed/failed section response and stale navigation state
- Correct only demonstrated error/retry defects using native endpoints and fragments

**Exclusions:** New cart engine; Shipping policy; Account requirement.

**Dependencies:** J0. **MVP:** Yes. **Recommended batch:** J1.

**Acceptance criteria:**

- [ ] Selected Variant/quantity submits once
- [ ] Transport failure produces a visible announced error and restores operable controls
- [ ] 422 update preserves last successful quantity and line ownership
- [ ] Back/forward and section refresh show server cart state

**Automated verification:**

- Existing J0 fixtures plus live isolated success/cleanup
- Inject rejected fetch and invalid response without contacting cart backend

**Relevant existing files:** `assets/product-form.js`, `assets/cart.js`, `assets/cart-notification.js`.

**Admin / human decisions:** No new business decision. Product Owner review of this proposed PBI is required before its implementation.

## J-PBI-002 — Make active cart notification and page controls readable and accessible

**State:** PROPOSED_PENDING_REVIEW. Implementation authorized: false. **User value:** Keyboard and enlarged-text customers can inspect items and reach native checkout.

**Existing baseline:** J0 reproduces populated cart overflow to 504px at 360px/390px under 200% root text, with quantity right edge 494px. Active notification/focus recovery and desktop cart pass. No J0 runtime source change.

**Scope:**

- Correct only evidenced cart-specific focus, announcement or clipping defects
- Keep notification and full cart coherent with native control labeling

**Exclusions:** Activating drawer; Global header redesign; New checkout UI.

**Dependencies:** J-PBI-001. **MVP:** Yes. **Recommended batch:** J1.

**Acceptance criteria:**

- [ ] 360/390/1440 and 200% text remain usable
- [ ] Escape closes dialog and returns focus
- [ ] Hidden dialog controls never receive focus
- [ ] Item/Variant link names and subtotal remain readable
- [ ] Serious/critical storefront findings fail acceptance; inherited C/F/provider findings retain separate ownership

**Automated verification:**

- J0 Playwright/axe and keyboard checks
- Native modal, Product and gallery regression

**Relevant existing files:** `snippets/cart-notification.liquid`, `assets/component-cart-notification.css`, `sections/main-cart-items.liquid`, `sections/main-cart-footer.liquid`, `assets/component-cart.css`, `assets/component-cart-items.css`.

**Admin / human decisions:** No new business decision. Product Owner review of this proposed PBI is required before its implementation.

## J-PBI-003 — Consume approved equipment delivery context in the cart

**State:** PROPOSED_PENDING_REVIEW. Implementation authorized: false. **User value:** Machine buyers see accurate delivery context without an invented freight quote.

**Existing baseline:** Native shipping/tax note exists; shipping profile/rate/pickup/lead-time policy is not verified by J0.

**Scope:**

- After K approval, render minimal exact-Product logistics context and approved contact route
- Preserve mixed machine/consumable line identities and native checkout

**Exclusions:** Calculate freight; Change profiles/rates/taxes; Geographic promises; Native compatibility inference.

**Dependencies:** J-PBI-001. **MVP:** Optional/conditional. **Recommended batch:** J2 AFTER K AUTHORITY.

**Acceptance criteria:**

- [ ] Each message binds approved exact Product authority
- [ ] Missing/expired authority suppresses optional content without disabling native cart
- [ ] Mixed carts retain quantities/prices
- [ ] No unsupported free freight/pickup/lead-time claim

**Automated verification:**

- Approved/missing/expired copy fixtures
- Read-only K configuration reconciliation
- Cart responsive regressions

**Relevant existing files:** `sections/main-cart-items.liquid`, `sections/main-cart-footer.liquid`.

**Admin / human decisions:** J-DEC-001; see the conditional decision record. No configuration or feature is approved by its presence here.

## J-PBI-004 — Add approved optional notes and purchase support guidance

**State:** PROPOSED_PENDING_REVIEW. Implementation authorized: false. **User value:** Customers can supply useful instructions or reach the approved contact channel.

**Existing baseline:** Native cart-note implementation exists but show_cart_note is false; no approved PO/tax-exempt workflow.

**Scope:**

- Enable/configure optional native notes only after owner disposition
- Use approved L service/contact resources for PO or tax-exempt guidance

**Exclusions:** Guarantee exemption; Accept PO payment; Mandatory notes; New service policy.

**Dependencies:** J-PBI-001, J-PBI-002. **MVP:** Optional/conditional. **Recommended batch:** J2 OPTIONAL.

**Acceptance criteria:**

- [ ] Notes save/reload using /cart/update and error recovery
- [ ] Optional note does not gate checkout
- [ ] Approved resources are accessible; missing resource omitted

**Automated verification:**

- Native note save/error fixture
- Live isolated cart cleanup
- L route and copy validation

**Relevant existing files:** `sections/main-cart-footer.liquid`, `assets/cart.js`, `config/settings_data.json`.

**Admin / human decisions:** J-DEC-002; see the conditional decision record. No configuration or feature is approved by its presence here.

## J-PBI-005 — Apply explicitly approved Product-level commercial dispositions

**State:** PROPOSED_PENDING_REVIEW. Implementation authorized: false. **User value:** Affected buyers receive an accurate owner-approved disposition.

**Existing baseline:** MR16 and generic Saw Vice are native $0.00 with enabled purchase; neither free sale nor a hold is approved.

**Scope:**

- After G006 decisions, implement only exact Product/Variant actions and approved wording
- Keep pricing, policy and compatibility authority separate

**Exclusions:** Price-threshold cart blocking; Invented mitigation; Catalog changes without separate authorization.

**Dependencies:** J-PBI-001. **MVP:** Optional/conditional. **Recommended batch:** J2 AFTER G006.

**Acceptance criteria:**

- [ ] No action without exact Product-level authority
- [ ] Unaffected zero-price fixture remains native
- [ ] Authorized disposition is tested across Product and cart entry paths
- [ ] No account requirement or inferred compatibility

**Automated verification:**

- Positive exact-authority and missing/mismatched/expired authority negatives
- Native Variant and cart regressions

**Relevant existing files:** `sections/main-cart-items.liquid`, `sections/main-cart-footer.liquid`, `snippets/buy-buttons.liquid`.

**Admin / human decisions:** J-DEC-003; see the conditional decision record. No configuration or feature is approved by its presence here.

## J-PBI-006 — Clarify approved discount and accelerated checkout entry

**State:** PROPOSED_PENDING_REVIEW. Implementation authorized: false. **User value:** Customers understand native checkout choices without misleading payment promises.

**Existing baseline:** Product dynamic checkout is disabled; cart footer has conditional provider-supplied accelerated controls and discount application display, not a custom code form.

**Scope:**

- Retain native checkout unless owner approves a specific placement change
- Explain approved discount workflow through existing eligible surfaces

**Exclusions:** Install app; Enable payment provider; Create discount; Basic checkout-step UI; Checkout Branding API.

**Dependencies:** J-PBI-002. **MVP:** Optional/conditional. **Recommended batch:** J3 OPTIONAL.

**Acceptance criteria:**

- [ ] Current Basic entitlement is verified
- [ ] Provider controls appear only when Shopify supplies them
- [ ] Keyboard-visible standard checkout remains available
- [ ] No fake discount or financing claim

**Automated verification:**

- Conditional provider fixture
- Native checkout visibility and non-submission guard
- Plan negative fixtures

**Relevant existing files:** `sections/main-cart-footer.liquid`, `snippets/buy-buttons.liquid`.

**Admin / human decisions:** J-DEC-004; see the conditional decision record. No configuration or feature is approved by its presence here.

## J-PBI-007 — Prepare bounded cart relationship guidance if approved

**State:** PROPOSED_PENDING_REVIEW. Implementation authorized: false. **User value:** Customers receive precise relationship guidance without a false compatibility claim.

**Existing baseline:** Approved fit is lease-bound; current G2 presentation is expired. Native Related products is separate.

**Scope:**

- Define an opt-in exact-relationship consumer after G003 operating policy and owner copy approval
- Retain full-list and target-publication checks

**Exclusions:** New compatibility graph; Infer incompatibility from absent fit; Required accessory inference; Cross-selling as fit.

**Dependencies:** J-PBI-001. **MVP:** Optional/conditional. **Recommended batch:** DEFER UNTIL G003 POLICY.

**Acceptance criteria:**

- [ ] Expired/incomplete/unpublished authority suppresses guidance
- [ ] Native buying survives relationship expiry
- [ ] Compatible/included/optional/recommended retain separate meanings

**Automated verification:**

- Reuse G1/G2 exact-set and lifecycle negatives
- Cart mixed-line fixtures
- No network approval proxy

**Relevant existing files:** `sections/main-cart-items.liquid`.

**Admin / human decisions:** J-DEC-005; see the conditional decision record. No configuration or feature is approved by its presence here.

## J-PBI-008 — Validate integrated cart handoff and release boundaries

**State:** PROPOSED_PENDING_REVIEW. Implementation authorized: false. **User value:** A reviewed cart change has reproducible technical evidence and explicit launch limitations.

**Existing baseline:** J0 supplies baseline tooling and protected-state checks; production and K/L/G release decisions remain separate.

**Scope:**

- Re-run accepted implemented PBI paths using J0 tools
- Verify source/plan/current inventories, accessibility and bounded performance
- Create reviewed file allowance and rollback only in a separately authorized deployment batch

**Exclusions:** Deploy as part of J0; Renew receipts; Close G003/G005/G006; Implement O accounts.

**Dependencies:** J-PBI-001, J-PBI-002. **MVP:** Yes. **Recommended batch:** J4.

**Acceptance criteria:**

- [ ] All reviewed MVP technical criteria pass with exact logs/cleanup
- [ ] Optional unapproved features are deferred rather than false failures
- [ ] Commercial, K/L operational and production authorization remain distinct
- [ ] Historical evidence and MAIN/unrelated preview bytes remain unchanged

**Automated verification:**

- npm.cmd run validate:epic-j-j0 with fresh isolated evidence
- Theme Check, Product/machine regressions and read-only inventories

**Relevant existing files:** `scripts/run-epic-j-j0.js`, `tests/epic-j-cart.spec.js`, `scripts/lib/epic-j-j0.js`.

**Admin / human decisions:** No new business decision. Product Owner review of this proposed PBI is required before its implementation.
