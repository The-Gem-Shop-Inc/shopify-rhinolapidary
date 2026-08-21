# D-PBI-002 Implementation Record

## PBI

```text
PBI ID: D-PBI-002
Title: Audit current homepage sections, content, routes, media, and Admin state
Epic: D - Homepage Transformation
Type: Measurement/documentation
Owner: Frontend Engineering and QA
Date completed: 2026-08-20
Status: Complete
```

## Scope Completed

- Audited actual repository homepage state from `templates/index.json`.
- Captured rendered persistent preview screenshots at 360, 390, 768, 1440, and 1920 px widths.
- Recorded rendered homepage section order, visible content, CTA destinations, images, app blocks, placeholder status, desktop/mobile behavior, and repository/preview match.
- Performed read-only Shopify Admin/theme inspection for theme identity, template checksums, Theme Editor group files, menus, collections, machine products, pages, policies, files/media, and app/embed observable state.
- Recorded route, media, automated coverage, and gaps without fixing current-state findings.

## Files Changed

- `docs/architecture/epic-d-homepage-current-state-audit.md`
- `docs/qa/evidence/epic-d/2026-08-20-epic-d-admin-current-state-summary.json`
- `docs/qa/evidence/epic-d/2026-08-20-epic-d-homepage-mobile-360-current-state.png`
- `docs/qa/evidence/epic-d/2026-08-20-epic-d-homepage-mobile-390-current-state.png`
- `docs/qa/evidence/epic-d/2026-08-20-epic-d-homepage-tablet-768-current-state.png`
- `docs/qa/evidence/epic-d/2026-08-20-epic-d-homepage-desktop-1440-current-state.png`
- `docs/qa/evidence/epic-d/2026-08-20-epic-d-homepage-desktop-1920-current-state.png`
- `docs/project/implementation-records/d-pbi-002-homepage-current-state-audit.md`

## Sources / Evidence

- `templates/index.json`
- `test-results/epic-d/homepage-preview-current-state.json`
- `docs/qa/evidence/epic-d/2026-08-20-epic-d-admin-current-state-summary.json`
- Shopify Admin read-only GraphQL query results validated before execution.
- `docs/qa/manual-qa-evidence-process.md`

## Automation Added Or Reused

- Reused Playwright preview auth helper for rendered evidence capture.
- Added durable Admin summary JSON under `docs/qa/evidence/epic-d/`.

## Validation Evidence

```text
npm run test:homepage-routes: PASS; 3 passed.
npm run test:navigation: PASS; 36 passed.
npm run test:smoke: PASS; 42 passed.
npm run test:ally: PASS; 18 passed.
```

## Shopify Admin Evidence

Read-only inspection performed. No Shopify Admin mutation was made.

Observed:

- Preview theme `158631198917`, `Rhino Lapidary - Preview`, `UNPUBLISHED`.
- Production theme `158579622085`, `shopify-rhinolapidary/main`, `MAIN`.
- `shopify.theme.toml` currently configures preview `158631198917` and keeps production as placeholder `PUBLISHED_THEME_ID`; the production ID was taken from the read-only Admin `MAIN` theme query.
- Preview, production, and repository `templates/index.json` share checksum `071bd7ee26e6d984ddec3a03671499e3`.
- Preview header group uses `preview-primary-navigation-menu`.
- Preview footer group uses `preview-footer-menu`.
- App installation inventory was read-blocked by available scope; rendered homepage app block count was 0.

Rollback note: no Admin change occurred, so rollback is not required. Future Admin changes must record before/after state, location, theme ID, rollback steps, and validation.

## Production Safety Statement

Production was inspected read-only for identity and homepage template checksum. No production theme or production Admin state was changed.

## Unresolved Blockers

- Preview header menu nested Saws/Laps/Shaping currently all point to `/collections/machines`; recorded as current-state Admin discrepancy.
- App installation inventory remains read-blocked by scope.
- Current homepage heading renders as `h2` with class `h1`; recorded as current state, not fixed in Batch 1.
- Shop Pay hop 403 responses appeared in screenshot capture response logs; homepage content still rendered.

## Acceptance Criteria Result

| Acceptance criterion | Result |
|---|---|
| Audit links repository homepage configuration to rendered preview evidence. | PASS |
| Every current homepage link is resolved or listed as blocked. | PASS |
| Current media and missing media are recorded. | PASS |
| Admin-owned dependencies are listed with owner and rollback notes. | PASS |

## Follow-Up Implications For Batch 2

Batch 2 should not assume header/menu, Admin media, manual-page, policy, or product-media state beyond this audit. Discrepancies should be resolved through governed route/media/content work, not silent fixes.
