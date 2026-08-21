# D-PBI-006 Implementation Record

## PBI

```text
PBI ID: D-PBI-006
Title: Define homepage destination route contract without inventing handles
Epic: D - Homepage Transformation
Type: Context-aware repository work
Owner: Frontend Engineering and Shopify Admin Owner
Date completed: 2026-08-20
Status: Complete with explicit blocked route dependencies
```

## Scope Completed

- Extended the existing `data/navigation-spec.json` route source of truth instead of creating a parallel route register.
- Added homepage route governance fields to the navigation schema and validator.
- Covered both currently rendered homepage CTAs.
- Recorded unresolved homepage route classes as blocked without paths.
- Added a homepage-specific Playwright route test and package command.

## Files Changed

- `data/navigation-spec.json`
- `schemas/navigation-spec.schema.json`
- `scripts/validate-navigation-spec.js`
- `tests/homepage-routes.spec.js`
- `package.json`
- `docs/project/implementation-records/d-pbi-006-homepage-route-contract.md`

## Sources / Evidence

- `templates/index.json`
- `test-results/epic-d/homepage-preview-current-state.json`
- `docs/qa/evidence/epic-d/2026-08-20-epic-d-admin-current-state-summary.json`
- `docs/architecture/epic-c-global-chrome-source-hierarchy.md`
- `data/homepage-section-outcomes.json`
- Shopify Admin read-only menus, pages, collections, and policies.

## Automation Added Or Reused

- Extended `schemas/navigation-spec.schema.json`.
- Extended `scripts/validate-navigation-spec.js` with schema validation, homepage module reference checks, blocked route no-path checks, and current CTA coverage.
- Added `tests/homepage-routes.spec.js`.
- Added `npm run test:homepage-routes`.
- Reused `npm run test:navigation`.

## Validation Evidence

```text
npm run validate:navigation: PASS; 21 routes.
npm run test:navigation: PASS; 36 passed.
npm run test:homepage-routes: PASS; 3 passed.
npm run validate:registers: PASS; navigation spec valid.
```

## Shopify Admin Evidence

Read-only Admin inspection observed:

- Current homepage CTAs render to `/collections/machines` and `/pages/contact`.
- Preview menu `preview-primary-navigation-menu` exists and currently maps nested Saws/Laps/Shaping to `/collections/machines`.
- Admin collections include `machines`, `saws`, `flat-laps`, `shaping`, and empty family parts collections.
- Published page `/pages/manuals` exists, but is observed only and not approved as a homepage destination in Batch 1.

No Admin mutation was made.

## Preview Theme Identity

Preview theme `158631198917`, `Rhino Lapidary - Preview`, `UNPUBLISHED`.

## Production Safety Statement

Production was not used as validation target and was not changed.

## Unresolved Blockers

Blocked route records without invented URLs:

- `homepage-parts`
- `homepage-accessories`
- `homepage-consumables`
- `homepage-featured-machine-product`
- `homepage-education`
- `homepage-quote-inquiry`
- `homepage-financing`
- `homepage-dealer-institutional`

Observed but not approved for homepage:

- `homepage-manuals` at `/pages/manuals`.

## Acceptance Criteria Result

| Acceptance criterion | Result |
|---|---|
| Existing Epic C route architecture inspected and extended. | PASS |
| Homepage route records support owner/status/module/identity/fixture/blocker fields. | PASS |
| Current rendered homepage CTAs are covered. | PASS |
| Required approved homepage routes resolve in preview. | PASS |
| Draft/blocked routes do not become customer-facing links or invented handles. | PASS |
| Required navigation commands ran. | PASS |

## Follow-Up Implications For Batch 2

Batch 2 may use only approved current homepage route IDs unless owners approve additional destinations and the route contract is updated with preview-resolving paths.
