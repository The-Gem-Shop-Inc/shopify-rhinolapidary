# C-PBI-015 Implementation Record

## Status

Complete for repository footer IA governance.

## Summary

- Extended `data/global-navigation-ia.json` with footer group metadata and a
  repository-only `footer-governed-model`.
- Preserved the current shared Shopify `footer` menu state separately from the
  proposed governed model.
- Added footer-specific IA schema fields and validator checks for footer groups,
  policy-object type, external destination approval, sensitive claim linkage,
  support resource references, owner, status, route, and dependency rules.
- Added validator regression cases for footer-specific failures.

## Acceptance

- Footer IA appears in the global navigation IA register.
- Each footer item has route status, owner, source, launch state, and dependency
  data.
- Sensitive footer claim relationships cite the legal claims register.
- Missing pages and policies are explicit dependencies.

## Evidence

- `data/global-navigation-ia.json`
- `schemas/global-navigation-ia.schema.json`
- `scripts/validate-global-navigation-ia.js`
- `scripts/test-global-navigation-ia-validator.js`
- `docs/architecture/epic-c-footer-support-ia.md`
- `test-results/epic-c/batch-4/footer-ia-validation.json`

## Validation

- `npm run validate:global-navigation-ia`: passed.
- `npm run test:global-navigation-ia-validator`: passed.
