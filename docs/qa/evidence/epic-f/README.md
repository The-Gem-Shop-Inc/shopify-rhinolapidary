# Epic F discovery evidence

Observed September 10, 2026; handoff checked September 11. These are dated discovery observations, not perpetual storefront facts or a complete Epic E execution snapshot. Browser coverage is the configured unpublished preview, theme 158631198917. Production-theme parity and the custom-domain production experience were not certified.

## Handoff artifacts

- [Discovery and recommendations](../../../architecture/epic-f-machine-product-page-discovery.md)
- [Machine inventory JSON](../../../project/epic-f-machine-inventory.json)
- [Per-machine gap matrix](../../../project/epic-f-machine-page-gap-matrix.md)
- [Narrow decision packet](../../../project/epic-f-decision-packet.md)
- [18 proposed PBIs and dependency batches](../../../rhino-lapidary-pbi-tracker-epic-f.md)
- [Machine-readable proposed backlog](../../../project/epic-f-proposed-backlog.json)

## Evidence files

| File pattern | Scope |
|---|---|
| `2026-09-10-machine-admin-read.json` | Exact 11 governed machine Products, Variants, media, native fields and metafields |
| `2026-09-10-definitions-pages-read.json` | Product/metaobject definitions and Pages, including manual publication |
| `2026-09-10-machine-inventory-read.json` | Native inventory policy, weight and location quantities |
| `2026-09-10-operational-read.json` | Targeted delivery profile/location and native pickup reads; schema limitations retained |
| `2026-09-10-preview-observations.json` | 33 route/viewport samples, 24 Product-content axe checks, DOM/claims/media, initial-load diagnostics and support routes |
| `2026-09-10-interaction-observations.json` | Three representative 320 px/keyboard probes, text-size simulation, manual routes and supplemental EM-1 overflow attribution |
| `2026-09-10-*.png` | 14 preview screenshots: all eight published machines at 390 px and EM-1/LapMaster 18/SawMaster 24 at 768/1440 px |
| `2026-09-10-jademaster-source.jpg` | Existing image downloaded for internal inspection of an unpublished Product; not a newly approved asset |
| `2026-09-10-repository-audit.json` | Existing command outputs, unchanged claim rules applied to descriptions, 71 source hashes |
| `2026-09-10-epic-e-admin-gate.json` | Existing Admin gate: exit 2, expired/incomplete snapshot, mutation blocked |
| `handoff-validation.json` | Artifact integrity/coverage checks; not Product-page implementation tests |

## Commands and results

Run repository commands from the project root. Original stdout/stderr is retained in the repository-audit evidence.

| Command | Observed result |
|---|---|
| `node scripts/validate-product-templates.js` | Pass; machine template optional and absent |
| `node scripts/validate-product-purchase-architecture.js` | Pass |
| `node scripts/validate-brand-claims.js` | Pass at existing repository scan scope; Admin descriptions excluded by that scope |
| `node scripts/validate-product-csv.js data/product-export/products.csv` | Expected failure: 95 missing-alt and 8 nonpositive-price findings, unchanged |
| `node scripts/validate-launch-fixtures.js` | Expected failure: search, machineProduct, consumableProduct missing ownership |
| `node scripts/validate-brand-performance-budget.js` | Static repository budget passes; not a browser release result |
| `node docs/qa/evidence/epic-f/build-discovery-handoff.cjs` | Generated 11-machine inventory/matrix and 18 proposed PBIs from saved evidence |
| `node docs/qa/evidence/epic-f/validate-discovery-handoff.cjs` | All artifact checks pass; no network access |

`audit-machine-pages.cjs` and `audit-machine-interactions.cjs` are discovery browser probes using existing Playwright and storefront authentication. They navigate the preview and exercise gallery controls; no cart/contact submission or Admin write is implemented. Their dated output paths refer to this audit: use new dated paths for a future observation instead of overwriting historical evidence. The supplemental `textResizeCauseInspection` field was collected in a separate EM-1 probe; rerunning the interaction script alone does not reproduce that additional attribution.

Browser timings are single, unthrottled initial-load samples. They include preview and native widget overhead. No Lighthouse/three-run release median, field INP, full screen-reader certification or production-theme parity is claimed. Existing cart tests were not run because they submit cart changes.

## Stopping point

Only discovery documentation, evidence, audit helpers and the proposed handoff were created. No Epic F PBI was implemented. No Product/Variant/metafield/metaobject/File value, template assignment, delivery/payment configuration, theme publication or other production mutation occurred. Epic E approvals, source records and migration authorization remain unchanged.
