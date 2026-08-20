# Shopify Navigation Change Workflow

**Epic:** C - Global Header, Navigation, and Footer  
**PBIs:** C-PBI-006, future C-PBI-011 and footer/admin PBIs  
**Status:** Batch 1 admin workflow  
**Created:** 2026-08-06

This workflow governs Shopify Admin navigation changes for the Rhino Lapidary
storefront. It does not authorize a menu change by itself.

## Navigation Handles

| Handle | Surface | Current source | Owner |
|---|---|---|---|
| `main-menu` | Header desktop menu and mobile drawer | [sections/header-group.json](../../sections/header-group.json) | Product Owner and Shopify Admin |
| `footer` | Footer link-list block | [sections/footer-group.json](../../sections/footer-group.json) | Product Owner, Shopify Admin, Legal, Content, and Support |

Support, dealer, financing, international, and social-link ownership remains
unresolved unless a later PBI records a named owner and approved source.

## Admin Location

Use:

```text
Shopify Admin -> Online Store -> Navigation
```

Then edit only the intended handle, usually `main-menu` or `footer`.

## Production Boundary

Preview changes may be prepared only on the persistent preview theme and must
not be applied to production until a release PBI records approval. A production
navigation change is blocked without matching route contract, IA register, and
rollback evidence.

## Before State

Before changing a menu, capture:

- Date and time.
- Store and preview theme ID.
- Menu handle.
- Full existing menu labels and URLs.
- Screenshot or export/manual record of the menu in Shopify Admin.
- Rendered storefront screenshot for desktop and mobile.
- Current `data/navigation-spec.json` route state.
- Current `data/global-navigation-ia.json` item state.
- Related PBI and approver.

Store admin evidence under:

```text
docs/project/admin-change-records/
```

Use [admin-change-record-template.md](../project/admin-change-record-template.md)
and follow [shopify-admin-change-evidence.md](../project/shopify-admin-change-evidence.md).

## Change Procedure

1. Confirm the PBI authorizes an admin navigation change.
2. Verify the destination route already exists in authenticated preview.
3. Update [data/global-navigation-ia.json](../../data/global-navigation-ia.json)
   with label, owner, source, status, dependencies, and route contract ID.
4. Update [data/navigation-spec.json](../../data/navigation-spec.json) for
   verified launch routes.
5. Make the Shopify Admin menu change on the preview menu handle only.
6. Capture after-state Admin evidence.
7. Verify rendered desktop header, mobile drawer, footer, and policy links.
8. Run required automated checks.
9. Record rollback steps and any unresolved blockers.

Do not create collection handles, product handles, page handles, policy text,
support URLs, social URLs, warranty claims, freight promises, dealer labels,
financing labels, or international availability statements from assumption.

## After State

After changing a menu, capture:

- Menu handle and final label/URL hierarchy.
- Admin screenshot or export/manual record.
- Rendered desktop screenshot.
- Rendered mobile drawer screenshot.
- Footer screenshot when `footer` changed.
- `test-results/epic-c/` global chrome link report path.
- Route validation output.
- Accessibility, smoke, claims, and performance results required by the PBI.

## Required Validation

Run these commands after a preview navigation change:

```powershell
npm run validate:global-navigation-ia
npm run validate:navigation
npm run test:navigation
npm run test:global-chrome-links
npm run check:placeholders
npm run validate:hardcoded-strings
npm run validate:brand-claims
npm run test:smoke
npm run test:ally
npm run test:brand-performance:release
npm run validate:registers
python scripts/validate-theme-repository.py
shopify theme check --fail-level warning
```

If a browser command cannot run because preview credentials or fixture routes
are missing, record the missing requirement. Do not replace a browser result
with a static approximation.

## Rollback

Navigation rollback must be executable by a person who did not make the change.

1. Open Shopify Admin -> Online Store -> Navigation.
2. Open the changed handle, usually `main-menu` or `footer`.
3. Restore the before-state labels, order, nesting, and URLs.
4. Restore matching repository route/IA changes if they were only supporting
   the reverted admin state.
5. Rerun route and global chrome link validation.
6. Capture rollback evidence under `docs/project/admin-change-records/`.

Use [backup-and-rollback-procedures.md](../release/backup-and-rollback-procedures.md)
for production rollback context and [rollback-drill-template.md](../release/rollback-drill-template.md)
when rehearsing rollback.

## Release Notes

Navigation/menu changes require release notes.

Every navigation release note must list:

- Menu handle changed.
- Customer-facing label changes.
- Route additions/removals.
- Shopify Admin evidence path.
- Validation commands and results.
- Production rollback steps.
- Known unresolved destinations.

Use [release-notes-template.md](../release/release-notes-template.md).

## Acceptance Rule

No Shopify Admin navigation change is accepted without:

- Matching `data/global-navigation-ia.json` entries.
- Matching `data/navigation-spec.json` route entries when routes are active.
- Before-state evidence.
- After-state evidence.
- Rollback evidence.
- Passing route and global chrome link validation.
- Release note coverage when production is affected.

## Future C-PBI-025 Input

C-PBI-025 must treat this workflow as a required finalization input and fail
Epic C closure if it is missing or no longer links the IA register, route
contract, admin evidence process, validation commands, and rollback process.
