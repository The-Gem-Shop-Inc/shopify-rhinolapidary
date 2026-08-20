# C-PBI-022 Implementation Record

## Status

Complete.

## Summary

- Added `tests/global-chrome-accessibility.spec.js`.
- Covered desktop header, primary navigation, search UI, account/cart
  affordances, breadcrumb navigation, footer links, policy links, localization
  state, mobile drawer, and disabled footer newsletter state.
- Ran axe without suppressing contrast, ARIA, label, or focus rules. The only
  excluded node remains Shopify preview admin iframe `#PBarNextFrame`.
- Recorded conditional blockers for mega menu and nested drawer fixtures tied
  to C-PBI-011 / `dep-preview-menu-isolation`.

## Evidence

- `tests/global-chrome-accessibility.spec.js`
- `test-results/epic-c/batch-5/global-chrome-accessibility-desktop-chromium.json`
- `test-results/epic-c/batch-5/global-chrome-accessibility-mobile-chromium.json`

## Validation

- Focused run: `18 passed`, `2 skipped`.
- Axe serious violations: `0`.
- Axe critical violations: `0`.
- Footer newsletter state: disabled by `sections/footer-group.json`.

## Remaining Dependencies

- C-PBI-011 preview menu isolation is required before a real mega menu and
  nested mobile drawer fixture can be fully exercised.

## Finalization Reconciliation - 2026-08-18

- The old mega/nested dependency is resolved by the preview Admin menu `preview-primary-navigation-menu`.
- Accessibility coverage now exercises desktop header, mega/dropdown navigation, mobile nested drawer, search, account, cart, footer, policy links, and published manual/support links where rendered.
- Localization selectors are intentionally absent and verified as absent.
- A real policy content contrast defect was fixed with scoped `.shopify-policy__body` CSS in `assets/rhino-custom.css`, pushed only to preview theme `158631198917`.
- Final validation: `npm run test:global-chrome-accessibility` passed `26/26` with `2` expected project-specific skips; no serious or critical axe violations remained.
- Broader validation: `npm run test:ally` passed `18/18`.
