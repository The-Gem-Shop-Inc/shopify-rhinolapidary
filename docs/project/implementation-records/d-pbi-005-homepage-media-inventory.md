# D-PBI-005 Implementation Record

## PBI

```text
PBI ID: D-PBI-005
Title: Inventory homepage media candidates and launch-critical asset gaps
Epic: D - Homepage Transformation
Type: Measurement/documentation plus governed media register
Owner: Media, Brand, Product Data, Accessibility, Performance, and Frontend Engineering
Date completed: 2026-08-20
Status: Complete with explicit media blockers
```

## Scope Completed

- Extended the existing media manifest with a `homepageInventory` section instead of creating a competing media source of truth.
- Added homepage candidate records for repository brand assets, Admin product/media candidates, and missing launch-critical media.
- Recorded module-level media dependencies and whether modules can launch without media, need media before launch, or can use a governed fallback.
- Extended media schema and validator to enforce homepage launch-readiness rules.
- Created a human-readable media inventory companion doc.
- Did not upload, replace, edit, crop, select, or commission media.

## Files Changed

- `data/media-manifest.json`
- `schemas/media-manifest.schema.json`
- `scripts/validate-media-manifest.js`
- `docs/brand/epic-d-homepage-media-inventory.md`
- `docs/project/implementation-records/d-pbi-005-homepage-media-inventory.md`

## Sources / Evidence

- `docs/brand/rhino-product-photography-art-direction.md`
- `docs/brand/rhino-video-system.md`
- `data/homepage-section-outcomes.json`
- `docs/qa/evidence/epic-d/2026-08-20-epic-d-admin-current-state-summary.json`
- Shopify Admin read-only product media and Files inventory.
- Current rendered homepage evidence showing no homepage content images.

## Automation Added Or Reused

- Extended `schemas/media-manifest.schema.json`.
- Extended `scripts/validate-media-manifest.js` to validate schema conformance, homepage candidate uniqueness, module references, fallback candidate references, and launch-ready media requirements.
- Reused `npm run validate:media`.

## Validation Evidence

```text
npm run validate:media: PASS; 43 media entries and 7 homepage media candidates.
Warning: assets/rhino-placeholder.svg proposed media file does not exist yet. This was pre-existing governed placeholder state and not introduced as launch-ready homepage media.
npm run validate:registers: PASS; media manifest schema valid.
```

## Shopify Admin Evidence

Read-only Admin inspection observed:

- Current homepage content renders no images.
- Machine collection has 11 products.
- Nine observed machine products have ready featured media; SawMaster 36 and TumbleMaster have no featured media.
- Observed machine featured media alt values are empty.
- First Shopify Files page contains 30 ready `image/jpeg` media records with empty alt values and mixed dimensions.

No Admin mutation was made.

## Preview Theme Identity

Preview theme `158631198917`, `Rhino Lapidary - Preview`, `UNPUBLISHED`.

## Production Safety Statement

No media was uploaded or changed in Admin or production. No visible homepage media was added.

## Unresolved Blockers

- No launch-ready first-screen product/workshop image.
- Admin media rights need confirmation.
- Admin media alt text is empty.
- Machine media crop safety and mobile crop behavior need review.
- SawMaster 36 and TumbleMaster lack observed featured media.
- No approved video poster, thumbnail, captions, transcript, URL, privacy, or performance evidence exists.

## Acceptance Criteria Result

| Acceptance criterion | Result |
|---|---|
| Repository-owned media and media manifest records audited. | PASS |
| Shopify Files/product media candidates recorded from read-only inspection. | PASS |
| Candidate records include source, ownership, rights, dimensions, format, module, role, alt, crop, performance, readiness, and blockers. | PASS |
| Launch readiness is not granted when rights/dimensions/crop/a11y/performance are unresolved. | PASS |
| Module media launch dependencies are recorded. | PASS |
| `npm run validate:media` ran. | PASS |

## Follow-Up Implications For Batch 2

Batch 2 first-screen work is blocked until a launch-ready product/workshop image exists or the module is explicitly scoped to launch without first-screen media. Product and family modules need media rights, alt text, crop, and mapping review before visible use.
