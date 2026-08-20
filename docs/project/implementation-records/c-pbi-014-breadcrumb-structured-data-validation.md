# C-PBI-014 Implementation Record

## Status

Complete after finalization reconciliation.

## Summary

- Added `tests/breadcrumbs.spec.js`.
- The suite robustly locates `BreadcrumbList` from JSON object, array, and
  `@graph` structured-data containers.
- Tests compare visible breadcrumb labels/order/hrefs with JSON-LD item names,
  positions, and URLs.
- Tests assert homepage breadcrumb absence, current crumb `aria-current="page"`,
  no self-link on the current crumb, and preview-parameter-free canonical and
  breadcrumb URLs.

## Covered Routes

- `/`
- `/products/left-moss-pad`
- `/collections/machines`
- `/search?q=rhino`
- `/pages/contact`
- `/cart`
- `/policies/privacy-policy`

## Finalization Reconciliation - 2026-08-18

- The previous blog/article blocker was broader than the PBI acceptance criteria.
- C-PBI-014 launch scope is product, collection, search, page/contact, cart if implemented, and policy routes.
- Rhino does not intend to use Shopify blog functionality for launch, so no blog or article fixture is required to close C-PBI-014.
- Generic blog/article support may remain in the breadcrumb snippet, but it is not a launch-closing requirement.
- Final validation: `npm run test:breadcrumbs` passed `30/30` across desktop Chromium, mobile Chromium, and desktop WebKit.
- Final required routes covered: product, collection, search, contact page, cart, Privacy policy, Refund policy, Shipping policy, and Legal notice.

## Evidence

- `test-results/epic-c/batch-3/breadcrumbs.json`

## Validation

- `npm run test:breadcrumbs`: `30 passed`.

## Future C-PBI-025 Input

C-PBI-025 requires the breadcrumb test suite and final route evidence, but not nonlaunch blog/article fixtures.
