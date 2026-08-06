# B-035 Preview Brand Slice Plan Implementation Record

## PBI

```text
PBI ID: B-035
Title: Plan first brand implementation slice for preview only
Epic: B
Type: Preview implementation planning
Owner: Product, Brand, Engineering, Shopify Admin, QA, Release, Content, Media, Legal, Support, and Cart
Date completed: 2026-08-06
```

## Summary

```text
- Added the machine-readable preview brand slice plan.
- Added the stakeholder-readable preview implementation slice document.
- Defined six included preview surfaces and nineteen excluded surfaces.
- Defined fixture coverage, go/no-go categories, rollback, and stable follow-up rollout keys.
- Explicitly blocked production publishing and kept the slice as a plan only.
```

## Repository evidence

Files added or changed:

```text
- data/rhino-preview-brand-slice.json
- docs/brand/rhino-preview-implementation-slice.md
- data/rhino-brand-style-guide-requirements.json
- docs/brand/rhino-brand-style-guide.md
- scripts/validate-epic-b-finalization.js
- docs/rhino-lapidary-pbi-tracker-epic-b-v2.md
- README.md
- docs/project/implementation-records/b-035-preview-brand-slice-plan.md
```

Commit or PR:

```text
- Not created in this workspace.
```

## Validation evidence

Commands run:

```powershell
npm run validate:epic-b-finalization
```

Results:

```text
- validate:epic-b-finalization: passed; preview slice includes required surfaces, exclusions, fixtures, go/no-go categories, follow-ups, and rollback steps.
```

## Shopify Admin evidence

```text
Admin area: Not applicable
Setting changed: None
Screenshot/evidence path: Not applicable
Rollback note: Remove the preview slice JSON/Markdown and related tracker/index references if this planning artifact is rolled back.
```

## Risks and follow-ups

```text
Known risks:
- The actual preview implementation still requires persistent preview access, fixture route confirmation, settings snapshots, and manual QA evidence.
- The plan intentionally excludes production publish, policy migration, product renaming, compatibility, technical specifications, video embeds, and broad content migration.

Follow-up PBIs:
- BRAND-PREVIEW-01
- BRAND-PREVIEW-02
- BRAND-PREVIEW-03
- BRAND-PREVIEW-04
- BRAND-PREVIEW-05
- BRAND-PREVIEW-06
- BRAND-PREVIEW-07

Risk register entries:
- None added.
```

## Done confirmation

```text
- Acceptance criteria met for a preview-only implementation plan.
- Required static validation passed.
- No Shopify Admin or production changes were made.
```
