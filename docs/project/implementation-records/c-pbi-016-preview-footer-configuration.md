# C-PBI-016 Implementation Record

## Status

Complete after finalization reconciliation.

## Summary

- Confirmed preview theme `158631198917` and production theme `158579622085`
  both reference Shopify Navigation menu handle `footer` in
  `sections/footer-group.json`.
- Did not edit the shared `footer` menu.
- Did not create a preview footer menu.
- Did not change footer Liquid, footer settings, Shopify policies, products,
  collections, markets, localization, or social settings.
- Prepared the governed footer IA model for a future isolated preview menu.

## Acceptance

- Footer groups and safe destinations are defined in repository governance.
- The Admin configuration portion is blocked because editing `footer` would
  affect production-visible navigation.
- No unsupported footer copy was added.

## Evidence

- `docs/architecture/epic-c-footer-support-ia.md`
- `data/global-navigation-ia.json`
- `test-results/epic-c/batch-4/footer-menu-isolation.json`
- `test-results/epic-c/batch-4/preview-push-rollback.json`

## Validation

- Shared menu safety gate: blocked.
- Preview push: not performed because no footer runtime/configuration file
  change was safe or required.

## Finalization Reconciliation - 2026-08-18

- The old shared `footer` menu blocker is no longer current.
- Shopify Admin now assigns preview theme `158631198917` footer link list menu `preview-footer-menu`.
- Production theme `158579622085` remains assigned to footer menu `footer`.
- Dynamic policy rendering now exposes the real published policies: Privacy policy, Shipping policy, Refund policy, and Legal notice.
- Footer localization selectors are intentionally disabled for the United States launch decision.
- No unsupported warranty, freight, support, social, or international copy was introduced.
- Runtime repair: `assets/rhino-custom.css` now scopes policy rich-text contrast overrides to `.shopify-policy__body`; pushed only to preview with `shopify theme push --environment preview --nodelete --only assets/rhino-custom.css --json`.
- Evidence: `test-results/epic-c/batch-5/rendered-admin-reconciliation-probe.json`, `test-results/epic-c/global-chrome-links-*.json`, and `test-results/epic-c/batch-5/global-chrome-accessibility-*.json`.
