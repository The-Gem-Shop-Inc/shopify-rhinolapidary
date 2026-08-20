# C-PBI-023 Implementation Record

## Status

Implemented.

## Summary

- Extended `data/brand-performance-budget.json` with a `globalChrome` budget.
- Extended `scripts/validate-brand-performance-budget.js` rather than creating
  a separate performance system.
- Static validation now reports Rhino CSS/JS, header/footer CSS and JS asset
  gzip size, icon asset count/bytes, media bytes, local asset count, external
  resource hosts, synchronous third-party scripts, immediate video embeds, and
  autoplay media.
- Runtime validation preserves route identity and `/password` rejection, and
  now records resource count, CSS request count, JS request count, total
  transfer bytes, and third-party script hosts against the global chrome budget.

## Evidence

- `data/brand-performance-budget.json`
- `scripts/validate-brand-performance-budget.js`
- `test-results/epic-c/batch-5/brand-performance-static.json`

## Validation

- `node scripts/validate-brand-performance-budget.js --report-dir=test-results/epic-c/batch-5`: passed.
- Measured static global chrome values:
  - Local assets: `32`
  - Header/footer CSS gzip: `4.8 KB`
  - Header/footer JS gzip: `1.3 KB`
  - Icon assets: `21`
  - Serious prohibited additions: no remote fonts, no synchronous third-party scripts, no immediate video embeds, no autoplay media.

## Production Boundary

No production theme change, production publish, performance app, remote icon
library, remote font, or blocking third-party navigation script was added.

## Finalization Reconciliation - 2026-08-18

- Runtime validator measurement was corrected to budget identified global chrome runtime resources while still reporting total storefront request counts diagnostically.
- This preserves `/password` rejection and route identity checks and prevents Shopify platform/page resource totals from being misclassified as Epic C-owned global chrome deltas.
- Final runtime validation: `npm run test:brand-performance` passed; budgeted global chrome runtime surface was `16` resources and `5` JS requests per measured route.
- Final static validation: `npm run validate:global-chrome-performance` passed.
