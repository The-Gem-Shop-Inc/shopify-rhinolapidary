# C-PBI-013 Implementation Record

## Summary

- Added shared breadcrumb rendering in `snippets/rhino-breadcrumbs.liquid`.
- Rendered the snippet centrally in `layout/theme.liquid` immediately inside
  `#MainContent` before `content_for_layout`.
- Added scoped breadcrumb styling in `assets/rhino-custom.css`.
- Added breadcrumb locale keys across storefront locale JSON files.

## Rendering Location

Central layout rendering was selected because `request.page_type`, canonical URL,
and page-type objects are available there, the theme has no existing breadcrumb
markup, and this avoids duplicating breadcrumb markup across main sections.

## Evidence

- `test-results/epic-c/batch-3/breadcrumbs.json`
- `test-results/epic-c/batch-3/preview-push-and-rollback.json`

## Validation

- `npm run test:breadcrumbs`: passed implemented route assertions with blog and
  article fixture skips.
- `shopify theme check --fail-level warning`: passed.

## Rollback

Restore `layout/theme.liquid`, `snippets/rhino-breadcrumbs.liquid`,
`assets/rhino-custom.css`, and locale JSON files, then push only those runtime
theme files to preview theme `158631198917` with `--nodelete`.

