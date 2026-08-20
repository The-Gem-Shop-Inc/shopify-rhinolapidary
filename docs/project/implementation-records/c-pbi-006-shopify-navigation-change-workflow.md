# C-PBI-006 Implementation Record

## PBI

```text
PBI ID: C-PBI-006
Title: Define Shopify Admin Menu Change and Rollback Workflow
Epic: C - Global Header, Navigation, and Footer
Type: Admin process documentation
Owner: Product Owner, Shopify Admin, Release Owner, and Frontend Engineering
Date completed: 2026-08-06
```

## Summary

- Created the Shopify navigation change workflow.
- Documented `main-menu` and `footer` handles, before/after evidence, route and IA updates, validation, rollback, release notes, and production boundaries.
- Linked existing admin evidence, release note, manual QA, and rollback templates.

## Repository Evidence

- `docs/development/shopify-navigation-change-workflow.md`
- `README.md`
- `docs/rhino-lapidary-pbi-tracker-epic-c.md`

## Validation Evidence

Commands:

```powershell
npm run validate:registers
python scripts/validate-theme-repository.py
```

Observed Batch 1 result:

```text
npm run validate:registers: passed
python scripts/validate-theme-repository.py: passed
shopify theme check --fail-level warning: passed
```

## Shopify Admin Evidence

No Shopify Admin change was made. The workflow defines evidence required for future admin changes.

## Risks and Follow-Ups

- C-PBI-025 must enforce this workflow as a required Epic C finalization input.
- Production navigation changes remain blocked until explicit release approval.
