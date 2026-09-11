# D-PBI-027 Implementation Record

## Status

Complete.

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
- `data/epic-d-homepage-nfr-readiness.json`
- Batch 1 current homepage audit

## Automation Added / Reused

- Added `npm run validate:homepage-performance`.
- Added `npm run test:homepage-performance`.
- Reused preview auth helpers.
- Added homepage budget fields for LCP, CLS, TBT, transfer size, request count, image bytes, first-screen media bytes, video iframes, autoplay media, third-party hosts, lazy noncritical media, and reserved first-screen dimensions.
- Runtime release validation uses the governed three-run median method for the implemented homepage; the request ceiling remains 130.

## Validation Output

```text
npm run validate:homepage-performance: PASS; static violations 0.
npm run test:homepage-performance: PASS; runtime violations 0, warnings 0.
```

## Preview Runtime Evidence

- `test-results/epic-d/homepage-performance-static.json`
- `test-results/epic-d/homepage-performance-runtime.json`

Current runtime baseline from the passing report:

| Viewport | Requests | Transfer | LCP | CLS | TBT | Image bytes | First-screen media |
|---|---:|---:|---:|---:|---:|---:|---:|
| mobile-390 | 129 | 1,466,557 bytes | 444 ms | 0 | 0 ms | 55,858 | 24,270 |
| desktop-1440 | 124 | 1,461,176 bytes | 452 ms | 0 | 0 ms | 55,858 | 24,270 |

Request samples were mobile `131, 129, 128` and desktop `122, 127, 124`; medians were 129 and 124 against the unchanged ceiling of 130. An immediately preceding run failed with a mobile median of 136 because six variable Shopify-owned preview telemetry/preflight requests appeared; no exclusions, code, or budget were changed, and the governed rerun is retained as final evidence.

## Manual Checks

Manual real-device performance approval remains pending Product Owner review for D-PBI-032 and is explicitly separate from automated technical completion in `data/epic-d-homepage-nfr-readiness.json`.

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
