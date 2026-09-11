# D-PBI-022 Implementation Record

## Status

Complete with deferred dependency.

## Classification

Homepage education entry implemented with a deferred broader-content dependency.

## Files Changed

- `templates/index.json`
- `data/navigation-spec.json`
- `data/homepage-section-outcomes.json`
- `data/homepage-content-claims-map.json`
- `tests/homepage-routes.spec.js`
- `tests/homepage-responsive.spec.js`
- `tests/homepage-accessibility.spec.js`
- `docs/rhino-lapidary-pbi-tracker-epic-d.md`
- This implementation record

## Source / Evidence

- Persistent preview theme `158631198917`
- `/pages/manuals` runtime inspection on 2026-08-26
- `data/navigation-spec.json#homepage-manuals`
- `data/rhino-section-patterns.json#homepage-link-group`
- `docs/brand/rhino-reassurance-microcopy.md`
- `docs/brand/rhino-legal-claims-rules.md`

The preview route returned HTTP 200, retained `/pages/manuals`, rendered the Manuals/Machine Manuals destination, exposed substantive machine-manual links, and showed no password, 404, or placeholder signal.

## Automation Added / Reused

- Reused `sections/rhino-homepage-links.liquid`.
- Added a focused homepage route test for exactly one approved Manuals action and no placeholder education actions.
- Added the module to existing conditional accessibility and responsive helpers.
- Reused existing navigation, outcome, claims, pattern, media, hardcoded-string, repository, theme-check, and performance validation.

## Validation Output

- Static governance and theme validation: PASS for navigation (27 routes / 3 rendered customer paths), homepage sections (12 modules), homepage content claims (28 items), brand claims (16 claims / 177 files), placeholder checks, Rhino sections and patterns, media manifest (43 entries), hardcoded strings, registers, theme repository, Theme Check (241 files / 0 offenses on the final strict preview push), and homepage performance (0 static/runtime violations or warnings).
- `npm run test:homepage-routes`: PASS, 12/12.
- `npm run test:homepage-responsive`: PASS, 8/8 viewport projects; 232 responsive assertions passed and 0 failed.
- `npm run test:homepage-accessibility`: PASS, 2/2; both desktop and mobile reports recorded 0 serious and 0 critical axe violations.
- `npm run test:homepage-performance`: PASS using the governed three-run median method.
- Regression suites: navigation PASS 48/48, smoke PASS 42/42, accessibility PASS 18/18 on the final exact rerun, and brand performance release PASS. Two preceding accessibility attempts each encountered a transient timeout on a different non-homepage desktop-WebKit route; the final full rerun and the focused diagnostic rerun passed.

## Preview Runtime Evidence

Pre-implementation route evidence:

- Preview theme: `158631198917`
- HTTP: `200`
- Final path: `/pages/manuals`
- Page title: `Machine Manuals | Rhino Lapidary`
- Main content: 328 normalized characters and 13 links, including named machine-manual destinations
- Password/404/placeholder signals: none

Post-push evidence:

- The first strict preview push attempted remote deletions and left the preview theme incomplete despite a zero CLI exit. Route QA detected the resulting preview 404 before acceptance. A read-only remote audit confirmed the condition, and the preview was fully restored from this repository with explicit `--path`, `--strict`, and `--nodelete`; the final push inspected 241 files with 0 Theme Check offenses. Production was never targeted.
- Homepage returned the preview storefront at `/` and rendered exactly one `[data-homepage-module-id="homepage-education-manuals"]` module.
- The module rendered exactly one action named `View manuals`; social-proof, video-demo, and inquiry-path modules each rendered zero instances.
- `/pages/manuals` continued to return HTTP 200 as `Machine Manuals | Rhino Lapidary` after the final preview restore/push.
- Mobile request samples: 131, 130, 129; median 130. Desktop request samples: 114, 124, 124; median 124.
- Mobile LCP median: 412 ms. Desktop LCP median: 476 ms. No immediate video embed, autoplay media, or third-party runtime host was recorded.

## Manual Checks

- Confirmed the destination is customer-facing, substantive, and organized by machine family.
- Confirmed the homepage design uses only `Manuals` and `View manuals`.
- Confirmed placement after current purchase and support modules.

## Blockers / Deferred Dependencies

- No approved learning center, buying guide, how-to article collection, or equivalent broader education destination exists.
- No technical advice or product recommendation was introduced.

## Acceptance Criteria

| Criterion | Result |
|---|---|
| Each rendered education card targets an approved destination. | PASS |
| Placeholder education topics are omitted. | PASS |
| Copy avoids unsupported technical advice. | PASS by governed copy inspection |
| Blog/article route coverage exists when required. | N/A; no blog/article action renders |

## Production Safety

Only preview theme `158631198917` is authorized for push. Production theme `158579622085` must remain unchanged and unpublished.

## Rollback Notes

Remove `homepage_education_manuals` from `templates/index.json`, restore the Manuals homepage reference to non-rendered, return the outcome to its prior planned state, push only preview, and rerun route, accessibility, responsive, and performance checks.
