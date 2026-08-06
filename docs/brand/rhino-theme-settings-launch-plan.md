# Rhino Theme Settings Launch Plan

**PBI:** B-026  
**Status:** Approved and machine readable  
**Profile:** `data/rhino-launch-theme-settings.json`

## Workflow

1. Pull or otherwise capture the current preview theme settings.
2. Commit or securely retain the pre-change snapshot.
3. Run:

   `npm run validate:rhino-theme-settings-plan`

4. Generate the candidate and rollback files:

   `npm run generate:rhino-theme-settings-candidate`

5. Review the candidate diff.
6. Apply the listed values only to the preview theme.
7. Upload the approved logo and favicon through image-picker settings.
8. Pull the preview settings into the repository.
9. Review the actual `settings_data.json` diff.
10. Run:

    `npm run check:rhino-theme-settings`

11. Test the preview theme.
12. Add an admin-change record and release-note entry.
13. Do not publish during this PBI.

## Repository-owned decisions

The repository owns:

- approved palette
- typography choice
- page width
- spacing strategy
- radii
- borders
- elevation
- animation behavior
- card style
- badge presentation

## Merchant or admin-owned values

The admin owns the actual Shopify image-picker references for:

- logo
- favicon
- future brand image

Authoritative social URLs remain deferred until ownership is confirmed.

## Rollback

Rollback requires:

1. restoring the preview theme's previous settings,
2. restoring the prior committed snapshot when applicable,
3. reverting associated CSS or media changes,
4. rerunning settings and storefront validation.

## Completion condition

B-026 is complete when:

- the plan validates,
- a candidate and rollback snapshot are generated,
- every setting has ownership and rationale,
- no production theme state is changed,
- the preview implementation PBI can consume the plan.