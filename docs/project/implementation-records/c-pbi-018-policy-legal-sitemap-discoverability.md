# C-PBI-018 Implementation Record

## Status

Complete.

## Summary

- Extended `tests/global-chrome-links.spec.js` with focused footer policy and
  sitemap validation.
- Added `npm run test:footer-policy-sitemap`.
- Captured Admin policy evidence showing only `Privacy policy` is currently
  published.
- Recorded missing refund, terms, shipping, contact-information, and
  accessibility policy destinations as legal/Admin dependencies.

## Acceptance

- Test implementation verifies rendered internal footer policy links, password
  page avoidance, 404 avoidance, route identity, and `/sitemap.xml` XML sitemap
  response.
- Full acceptance requires runtime execution against the authenticated preview.

## Evidence

- `tests/global-chrome-links.spec.js`
- `data/global-navigation-ia.json`
- `test-results/epic-c/batch-4/policy-admin-evidence.json`
- `test-results/epic-c/batch-4/footer-policy-sitemap-*.json`

## Validation

- `npm run test:footer-policy-sitemap`: pass or blocked result recorded in
  `test-results/epic-c/batch-4/validation-summary.json`.

## Finalization Reconciliation - 2026-08-18

- The old statement that only Privacy policy is published is no longer current.
- Current published policy routes discovered from Shopify Admin and verified in preview:
  - `/policies/privacy-policy`
  - `/policies/refund-policy`
  - `/policies/shipping-policy`
  - `/policies/legal-notice`
- Terms of service and contact-information policy routes are not published and are not required by Epic C.
- `/sitemap.xml` resolves as XML and does not fall through to password, 404, or unrelated content.
- Final validation: `npm run test:global-chrome-links` passed `6/6`; `npm run test:breadcrumbs` passed policy breadcrumb coverage across three projects.
- Evidence: `test-results/epic-c/batch-5/rendered-admin-reconciliation-probe.json`, `test-results/epic-c/global-chrome-links-*.json`, and `test-results/epic-c/batch-4/footer-policy-sitemap-*.json`.
