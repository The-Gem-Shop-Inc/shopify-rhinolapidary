# C-PBI-011 Implementation Record

## Status

Complete after finalization reconciliation.

## Evidence

- Published theme `158579622085` renders Header menu binding `main-menu`.
- Persistent preview theme `158631198917` renders Header menu binding `main-menu`.
- Shopify menus are store resources, so editing `main-menu` would affect the published theme.
- Admin GraphQL inspection was unavailable because `shopify store execute` reported no stored app authentication.

Evidence file:

- `test-results/epic-c/batch-2/header-settings-safety-gate.json`

## Admin Changes

No Shopify Navigation Admin menu changes were performed.

## Recommendation

Product Owner and Shopify Admin should approve a separately named preview menu handle, then update the IA register, source hierarchy, Admin workflow, and rollback record before creating or selecting it. A reasonable candidate handle is `rhino-preview-main-menu`, but it is not approved by this record.

## Rollback

No menu rollback is required because no menu was edited. If a future approved preview menu is created, rollback must restore preview theme `158631198917` Header menu selection to the prior value and delete or archive the preview-only menu only after confirming it is not consumed elsewhere.

## Finalization Reconciliation - 2026-08-18

- The old `main-menu` isolation blocker is no longer current.
- Shopify Admin now assigns preview theme `158631198917` header menu `preview-primary-navigation-menu`.
- Production theme `158579622085` remains assigned to `main-menu`.
- Current preview nested branch: `Catalog` -> `Saws`, `Laps`, `Shaping`, all targeting `/collections/machines`.
- Admin menu resources were inspected read-only; no production navigation mutation was performed.
- Evidence: `test-results/epic-c/batch-5/rendered-admin-reconciliation-probe.json`, `sections/header-group.json`, and Shopify Admin read-only theme/file query on 2026-08-18.
- Validation: `npm run test:header-desktop`, `npm run test:mobile-drawer`, and `npm run test:global-chrome-links` passed.
