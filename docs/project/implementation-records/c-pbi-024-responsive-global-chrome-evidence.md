# C-PBI-024 Implementation Record

## Status

Complete.

## Summary

- Added the responsive evidence plan at
  `docs/qa/epic-c-responsive-global-chrome-evidence-plan.md`.
- Added `scripts/run-epic-c-responsive-qa.js`.
- Captured and verified the Epic B viewport vocabulary:
  `mobile-360`, `mobile-390`, `tablet-768`, `desktop-1440`, and
  `desktop-1920`.
- Used existing homepage, collection, search, product, cart, contact, and
  policy route records.
- Recorded mega-menu and nested-drawer states as blocked by the existing
  preview menu isolation dependency when no real nested fixture rendered.

## Runtime Defect Found and Fixed

Initial responsive QA found sticky header focus obstruction on the breadcrumb
`Home` link for the contact route at `mobile-360` and `desktop-1440`.

Fix:

- Added `scroll-margin-top` to `.rhino-breadcrumb__link` in
  `assets/rhino-custom.css`.
- Pushed only `assets/rhino-custom.css` to preview theme `158631198917` with
  `--nodelete`.

## Evidence

- `docs/qa/epic-c-responsive-global-chrome-evidence-plan.md`
- `scripts/run-epic-c-responsive-qa.js`
- `test-results/epic-c/batch-5/responsive-global-chrome-qa.json`
- `test-results/epic-c/batch-5/preview-css-push-rollback.json`
- Screenshots under `docs/qa/evidence/epic-c/`

## Validation

- Before fix: `2` required width failures.
- After fix: `35` route/viewport combinations passed with dependency-recorded
  blocked states; `0` required width failures.

## Finalization Reconciliation - 2026-08-18

- Regenerated responsive evidence after preview Admin menu/footer/policy/manual/localization/account blockers were resolved.
- Current run covered `55` route/viewport combinations and `495` component states.
- Result: `55` route/viewport combinations passed, `490` states passed, `5` states not applicable, `0` required width failures.
- Evidence includes actual nested mobile drawer, desktop mega/dropdown state, current footer policy links, account affordance, localization selector absence, and published manual route coverage.
- Final validation: `npm run qa:epic-c:responsive` passed.

## Production Boundary

Production theme `158579622085` was not pushed, published, modified, or used
for preview QA.
