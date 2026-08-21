# D-PBI-004 Implementation Record

## PBI

```text
PBI ID: D-PBI-004
Title: Map homepage content sources, owners, and claim approvals
Epic: D - Homepage Transformation
Type: Measurement/documentation plus governed register
Owner: Content, Product, Legal, Operations, Support, Media, and Frontend Engineering
Date completed: 2026-08-20
Status: Complete with explicit deferred dependencies
```

## Scope Completed

- Created a machine-readable homepage content/claims map rather than relying on prose alone.
- Created JSON Schema and validator for homepage content classes, module references, approvers, legal claim references, safe neutral fallbacks, and blockers.
- Created a human-readable content claims map.
- Extended brand claims validation to scan the new governed homepage content map.
- Did not author new commercial or legal claims.

## Files Changed

- `data/homepage-content-claims-map.json`
- `schemas/homepage-content-claims-map.schema.json`
- `scripts/validate-homepage-content-claims-map.js`
- `scripts/validate-brand-claims.js`
- `scripts/validate-json-registers.js`
- `docs/brand/epic-d-homepage-content-claims-map.md`
- `package.json`
- `docs/project/implementation-records/d-pbi-004-homepage-content-claims-map.md`

## Sources / Evidence

- `data/legal-claims-register.json`
- `data/homepage-section-outcomes.json`
- `templates/index.json`
- `docs/brand/rhino-brand-positioning.md`
- `docs/brand/rhino-brand-voice-and-copy.md`
- `docs/brand/rhino-reassurance-microcopy.md`
- `docs/brand/rhino-video-system.md`
- Shopify Admin read-only current-state observations from D-PBI-002.

## Automation Added Or Reused

- `npm run validate:homepage-content-claims`
- `schemas/homepage-content-claims-map.schema.json`
- `scripts/validate-homepage-content-claims-map.js`
- `npm run validate:brand-claims` now scans `data/homepage-content-claims-map.json`.
- `npm run validate:registers` now validates the content claims map schema.

## Validation Evidence

```text
npm run validate:homepage-content-claims: PASS; 19 content items.
npm run validate:brand-claims: PASS; 16 claims and 175 customer-facing/governed files scanned.
npm run check:placeholders: PASS.
npm run validate:registers: PASS; homepage content claims map valid.
```

## Shopify Admin Evidence

Read-only Admin evidence from D-PBI-002 informed route/content observations. No Admin mutation was made.

## Preview Theme Identity

Preview theme `158631198917`, `Rhino Lapidary - Preview`, `UNPUBLISHED`.

## Production Safety Statement

No production theme or Admin state was changed. No visible homepage copy was changed.

## Unresolved Blockers

- First-screen promise is blocked.
- Why Rhino proof is blocked.
- Support, warranty, freight, shipping, pickup, financing, dealer, institutional, testimonial, review, and video language remains blocked or draft.
- Product statements need product data and technical review before homepage use.

## Acceptance Criteria Result

| Acceptance criterion | Result |
|---|---|
| Proposed homepage content classes are mapped. | PASS |
| Source, owner, approver, sensitivity, claim references, fallback, and blockers are recorded. | PASS |
| No new commercial/legal claims were invented. | PASS |
| Existing legal-claims register remains the claim authority. | PASS |
| Required validators ran. | PASS |

## Follow-Up Implications For Batch 2

Batch 2 cannot promote blocked content classes into visible modules. It needs business/legal/product decisions for hero promise, product statements, support, warranty, freight, financing, dealer/institutional paths, testimonials/reviews, and video.
