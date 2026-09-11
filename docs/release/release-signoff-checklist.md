# Release Signoff Checklist

## Release

Date: 2026-08-18

Preview theme ID: `158631198917`

Preview theme name: `Rhino Lapidary - Preview`

Production theme ID: `158579622085`

Production theme role: `MAIN`

Owner: Pending human assignment

Release state: Ready for human signoff / GO candidate. Not approved for production publication.

## Epic D Homepage Signoff Addendum

Technical target: preview theme `158631198917` only. Production theme `158579622085` is not approved for change or publication.

Required commands:

```powershell
npm run qa:epic-d:static
npm run qa:epic-d:preview
npm run qa:epic-d:all
npm run validate:epic-d-finalization
```

| Area | Required result |
| --- | --- |
| Homepage routes | Passed |
| Responsive matrix and screenshots | Automated pass plus Product Owner review |
| Accessibility | Automated pass plus clean-preview keyboard/focus signoff |
| Performance | Three-run median pass; homepage request ceiling remains 130 |
| Why Rhino proof | Exactly three approved statements and source record |
| EM-1 video | Poster, focus, activation, stable layout, no initial provider request, no autoplay |
| Media and claims | Validators passed |
| Rollback | Repository revert and preview re-push with `--strict --nodelete` reviewed |
| D-PBI-032 | Explicit human GO required |

Current manual state: zoom, responsive visual layouts, hero crop/media judgment, and content/CTA clarity passed. Clean-preview keyboard/focus retest and the new video manual preview check remain pending. This addendum does not approve production.

## Epic C Technical Evidence

| Area | Evidence | Result |
| --- | --- | --- |
| Preview header menu isolation | Shopify Admin read-only query and `sections/header-group.json` show preview uses `preview-primary-navigation-menu`; production uses `main-menu` | Passed |
| Preview footer menu isolation | Shopify Admin read-only query and `sections/footer-group.json` show preview uses `preview-footer-menu`; production uses `footer` | Passed |
| Nested navigation | `Catalog` -> `Saws`, `Laps`, `Shaping` verified in preview drawer/desktop navigation | Passed |
| Policies | Privacy, Refund, Shipping, and Legal notice routes verified; `/sitemap.xml` verified | Passed; transient Shopify 503 on Shipping policy cleared on rerun |
| Manuals | EM-1, TrimMaster, and ShapeMaster published; hidden manuals inventoried and not globally exposed | Passed |
| Localization | United States launch; country/language selectors absent in header/drawer/footer | Passed |
| Accounts | Login/account affordance enabled and routed to Shopify customer authentication | Passed |
| Authentication | Shared `tests/helpers/storefront-auth.js` smoke coverage passed; no passwords in generated JSON | Passed |
| Accessibility | `npm run test:global-chrome-accessibility` and `npm run test:ally` passed | Passed |
| Responsive | `npm run qa:epic-c:responsive` passed | Passed |
| Performance | `npm run validate:global-chrome-performance` and `npm run test:brand-performance` passed | Passed |
| Finalization | `npm run qa:epic-c:static`, `npm run qa:epic-c:preview`, and `npm run validate:epic-c-finalization` required | Pending final runner evidence |

Primary evidence paths:

- `test-results/epic-c/batch-5/rendered-admin-reconciliation-probe.json`
- `test-results/epic-c/batch-5/responsive-global-chrome-qa.json`
- `test-results/epic-c/batch-5/brand-performance-static.json`
- `test-results/brand-performance/brand-performance-mobile.json`
- `test-results/epic-c/batch-5/global-chrome-accessibility-*.json`
- `test-results/epic-c/global-chrome-links-*.json`
- `test-results/epic-c/batch-5/epic-c-finalization.json`

## Required Automated Checks

```powershell
npm run validate:production-readiness
npm run qa:epic-c:static
npm run qa:epic-c:preview
npm run validate:epic-c-finalization
```

Result:

```text
npm run validate:production-readiness: Passed 2026-08-18 16:53 -05:00.
Initial navigation run saw a transient Shopify HTTP 503 on /policies/shipping-policy; focused rerun and full production readiness rerun passed.
npm run qa:epic-c:static: Passed 2026-08-18 16:55 -05:00.
npm run qa:epic-c:preview: Pending final runner execution.
npm run validate:epic-c-finalization: Pending final runner execution.
```

## Required Human Signoffs

| Area | Owner | Result | Notes |
| --- | --- | --- | --- |
| Product Owner | Pending | Pending | Must approve Epic C preview behavior and launch scope |
| Engineering Owner | Pending | Pending | Must approve repository/theme changes and rollback readiness |
| QA / Release Approver | Pending | Pending | Must approve evidence package and final QA results |
| Shopify Admin Owner | Pending | Pending | Must approve preview Admin state and confirm production isolation |
| Brand Owner | Pending | Pending | Must approve global chrome presentation |
| Content Owner | Pending | Pending | Must approve navigation labels, manual exposure, and no blog launch requirement |
| Legal / Claims Reviewer | Pending | Pending | Must approve policy/legal/claims state |
| Support / Business Owner | Pending | Pending | Must approve support/manual/customer-account launch behavior |

## Navigation Isolation Evidence

- Preview header: `preview-primary-navigation-menu`.
- Production header: `main-menu`.
- Preview footer link list: `preview-footer-menu`.
- Production footer link list: `footer`.
- Preview theme role: `UNPUBLISHED`.
- Production theme role: `MAIN`.

## Rollback

Rollback owner: Pending human assignment

Backup theme ID: Production remains `158579622085`; preview remains `158631198917`.

Rollback instructions:

1. Do not publish the preview theme unless a separate production release approval is recorded.
2. To revert the final CSS repair on preview only, restore the previous `assets/rhino-custom.css` from git and run:

```powershell
shopify theme push --environment preview --nodelete --only assets/rhino-custom.css --json
```

3. To revert preview Admin menu selections, use Shopify Admin theme editor for theme `158631198917` and restore header/footer menu settings to the prior approved preview state.
4. Do not edit production theme `158579622085` or production navigation menus as part of rollback unless a separate approved production rollback is opened.

Rollback instructions reviewed?

```text
Pending
```

## Production Safety

Preview theme published? no

Production theme modified? no

Production navigation modified? no

Production publish performed? no

## Final Decision

```text
Not approved yet
```

Approver: Pending

Date/time: Pending
