# Proposed Epic J1 assignment — use only after PBI review

This is the next assignable engineering prompt, **not authorization to implement during J0**. Review J-PBI-001 and J-PBI-002 first. No additional broad discovery or business-pricing review is needed to begin those repository fixes once approved.

## Objective and reproduced conditions

Implement only **J-PBI-001** and **J-PBI-002** from the [Epic J tracker](../rhino-lapidary-pbi-tracker-epic-j.md).

1. **J-DEF-001, high:** reject the native Product form's `/cart/add` fetch in an offline fixture. The Add button recovers, but `.product-form__error-message-wrapper` stays hidden. `assets/product-form.js` catches/logs the error without invoking its existing error-message handler. Display and announce an existing translated generic error, restore controls, and preserve the selected Variant/quantity. Do not automatically retry a POST whose outcome is unknown; never risk duplicate additions. Keep native 422 and sold-out behavior intact.
2. **J-DEF-002, high:** add an isolated positive-price Saw Blade line, visit `/cart` at 360px or 390px, and double the computed root font size. `document.documentElement.scrollWidth` becomes **504px**; the quantity control right edge is **494px**. Item/Variant text also wraps excessively in its remaining grid space. The same overflow reproduces on unchanged MAIN at 390px. Correct only cart-specific layout so text, prices and quantity controls remain readable and operable. The inherited 558px global header is a separate Epic C issue.

Evidence: [J0 integrated run](../qa/evidence/epic-j/j0-2026-10-20T17-13-15-800Z/integrated-01/report.json), its `product-transport-diagnostic.json`, `cart-live-390.json`, `cart-live-360.json`, and screenshots including `cart-main-390-text200.png`.

## Precise proposed file scope

Customer-facing repository allowance: **assets/product-form.js** and **assets/component-cart-items.css** only. Use native translated error strings; keep the CSS scoped to the cart. No global `base.css`, header, machine/Product template, configuration or locale change is anticipated. If reproduction proves another runtime file necessary, document that exact new allowance and governing source contract before expanding scope.

Test allowance: `tests/epic-j-cart.spec.js`, `scripts/lib/epic-j-cart-fixtures.js`, and the existing native Product/machine purchase fixtures/tests as needed for transport-error coverage. Permit J-specific test/report files and a separately recorded, explicitly reviewed **two-file source successor**. Keep J0's original contract and evidence immutable. Existing E/F/G and native baseline hash guards must recognize only the exact reviewed successor through their proper protection contracts; do not rewrite historical expected hashes or broadly ignore runtime drift.

## Required acceptance and regression

- A rejected native fetch produces a visible, announced recoverable error; the selected Variant/quantity stays exact, controls recover, and one user submit never becomes multiple POSTs.
- Existing native 422 and unavailable/sold-out behavior remain correct. Cart updates, two distinct Size Variants, subtotal, removal and history behavior retain their J0 passes.
- At 360/390/1440 and 200% text, cart controls and item/Variant text remain usable without horizontal overflow. Preserve normal desktop layout, dialog focus return and the inactive drawer fixture.
- Run `npm.cmd run test:epic-j-readiness`, `npm.cmd run test:epic-j-cart`, relevant `test:machine-shell`/purchase fixtures, `validate:product-purchase`, `validate:theme-architecture`, registers and Theme Check. Use fresh uniquely named evidence directories. The J0 guard should reject unexplained source changes until the reviewed exact successor is supplied.
- For deployed-preview validation, require a separately authorized preview workflow with exact file allowance, rollback bytes, fresh source/theme reads and readback. **This prompt authorizes no theme push or publication.** Local native fixtures can demonstrate the fixes before that separate deployment decision.
- Keep all real cart tests isolated, prove initial emptiness, and verify explicit cleanup. Do not add MR16/Saw Vice, submit checkout, enter payment data or create an order.

Keep J003–J007 optional feature work, K shipping configuration, L service policy and O accounts/history outside J1. Do not renew the October 22 E/F receipt, refresh G2 fit, alter compatibility, or close the existing G003/G005/G006 exceptions.
