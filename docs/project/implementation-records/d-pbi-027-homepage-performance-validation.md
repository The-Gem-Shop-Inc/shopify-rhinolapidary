# D-PBI-027 Implementation Record

## Status

Complete with implementation dependency.

## Classification

Homepage performance budget and runtime baseline validation.

## Files Changed

- `data/brand-performance-budget.json`
- `scripts/validate-homepage-performance.js`
- `package.json`
- `docs/architecture/epic-d-homepage-source-hierarchy.md`

## Source / Evidence

- Existing `scripts/validate-brand-performance-budget.js`
- `docs/qa/storefront-quality-baseline.md`
- `data/media-manifest.json`
- `data/homepage-section-outcomes.json`
- Batch 1 current homepage audit

## Automation Added / Reused

- Added `npm run validate:homepage-performance`.
- Added `npm run test:homepage-performance`.
- Reused preview auth helpers.
- Added homepage budget fields for LCP, CLS, TBT, transfer size, request count, image bytes, first-screen media bytes, video iframes, autoplay media, third-party hosts, lazy noncritical media, and reserved first-screen dimensions.

## Validation Output

```text
npm run validate:homepage-performance: PASS; static violations 0.
npm run test:homepage-performance: PASS; runtime violations 0, warnings 2.
```

## Preview Runtime Evidence

- `test-results/epic-d/homepage-performance-static.json`
- `test-results/epic-d/homepage-performance-runtime.json`

Current runtime baseline from the passing report:

| Viewport | Requests | Transfer | LCP | CLS | TBT | Image bytes | First-screen media |
|---|---:|---:|---:|---:|---:|---:|---:|
| mobile-390 | 124 | 1,411,438 bytes | 532 ms | 0 | 0 ms | 0 | 0 |
| desktop-1440 | 126 | 1,435,596 bytes | 348 ms | 0 | 0 ms | 0 | 0 |

The request budget is 130 for mobile and desktop, based on the measured current preview baseline plus a small guard band. Zero homepage image media is recorded as current baseline only, not as a future target.

## Manual Checks

Manual Lighthouse or real-device performance review was not performed.

## Blockers

Future hero media remains blocked until a launch-ready candidate has rights, crop, alt, dimensions, and performance approval.

## Acceptance Criteria

| Criterion | Result |
|---|---|
| Homepage budgets are machine-readable. | PASS |
| Runtime report captures required metrics. | PASS |
| Hero media dimensions are conditionally required when implemented. | PASS |
| Noncritical media lazy loading is checked. | PASS |
| Immediate embeds, autoplay, third-party hosts, and oversized media fail. | PASS |

## Production Safety

Preview-only measurement. No optimization app installed. No production or Admin mutation occurred.

## D-PBI-008 / D-PBI-009 Implication

D-PBI-008 will fail if it adds autoplay, immediate video embeds, unapproved third-party hosts, oversized first-screen media, missing reserved dimensions, or excessive layout/performance cost.
