# C-PBI-012 Implementation Record

## Summary

- Created the Epic C breadcrumb architecture and source rules.
- Defined rendering, hidden page types, product ancestry, URL normalization,
  mobile placement, accessibility semantics, and JSON-LD ownership.
- Recorded blog and article fixture coverage as blocked until valid fixture
  routes exist.

## Evidence

- `docs/architecture/epic-c-breadcrumb-architecture.md`
- `README.md`
- `docs/architecture/epic-c-global-chrome-source-hierarchy.md`

## Validation

- `npm run validate:registers`: passed
- `npm run check:placeholders`: passed
- `npm run validate:hardcoded-strings`: passed
- `shopify theme check --fail-level warning`: passed

## Future C-PBI-025 Input

C-PBI-025 must require this architecture document before Epic C finalization.

