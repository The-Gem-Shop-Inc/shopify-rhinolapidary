# J2/G4 Phase C live acceptance

Date: 2026-11-18
Status: `PASS` for the unpublished preview runtime; not a production approval.

## Evidence basis

Phase C deployed corrective candidate `78e435cf53ef09e96a78e567c2d90fb39c76c37e7fd31ca5d04a7ab4e3510efe` from commit `830737b83da8827fafc813cc2045a7a396579f5c`. The manifest SHA-256 is `718790ba49f8078ab1d2e3401cf4832923ac2182b5312720356bb4d23f1cbe1c`.

The source evidence remains outside Git at:

`C:\Users\dajem\AppData\Local\RhinoLapidary\evidence\j2-g4-phase-c-acceptance\2026-11-18T15-05-13.4017093Z`

The external acceptance summary SHA-256 is `9c90e0e4a466599eb89962a7f95110890ca78678242c3d4e07588ad46adbf18b`. The committed machine-readable synopsis is `docs/qa/evidence/j2-g4/phase-c-acceptance/acceptance-summary.json`; it records hashes for the integrity, catalog/media/responsive, cart/fulfillment, and final-identity source files.

## Identity and exact readback

- Shop: `gid://shopify/Shop/79279947973`.
- Preview theme: `158631198917`, `UNPUBLISHED`.
- Protected production theme: `158579622085`, `MAIN`.
- Published storefront locales: English only.
- Seven Phase C runtime files: 7/7 exact SHA-256.
- Five unchanged dependencies: 5/5 exact SHA-256.
- Unrelated assets: 457/457 exact.
- Unexpected additions: zero; deletions: zero.

The final complete CLI pull contained 464 files and passed the independent Phase C readback validator after browser testing.

## Live behavior

The catalog/media/responsive run executed from `2026-11-18T15:21:27.867Z` to `15:22:20.236Z`. It completed the catalog, directory, machine-media, navigation, and responsive surfaces before its combined harness encountered a test-code error while reading an optional cart progress element. That raw run remains classified `FAIL_HARNESS_INCOMPLETE`; it is not rewritten. The isolated cart/fulfillment continuation ran from `15:22:51.012Z` to `15:23:10.313Z` and passed with no failures. The aggregate acceptance uses the completed evidence from both runs.

Photographic `/collections/all`, sorting, filtering, pagination, the governed `?view=directory` route, `/collections/machines`, and mobile/desktop navigation disclosure passed. The live directory correctly failed closed to neutral Product content under expired classification authority.

Machine media results were:

- Approved photographs loaded for BeadMaster 6", LapMaster 12", LapMaster 18", SawMaster 18", ShapeMaster 6", and TrimMaster.
- Accessible neutral fallbacks rendered for EM-1 Machine and SawMaster 24".
- BeadMaster used the same governed photograph on `/collections/all` and `/collections/machines`.
- No compatibility or specification claim was inferred from collection membership or media readiness.

The native shipping and pickup radios retained one group name, accessible labels and descriptions, arrow-key operation, and correct panel visibility. Prohibited `aria-controls` and `aria-expanded` were absent. Storefront serious or critical axe findings were zero. Shopify preview-bar findings were recorded separately because they were not theme storefront nodes.

Responsive coverage exercised 320, 390, 768, 1024, and 1440 pixels at normal text, doubled text, and 200% browser zoom. No visible facets or drawer overflow remained, and no global overflow clipping was introduced. Focus and dismissal remained operable. The focused 320-pixel diagnostic confirmed text reflow (`innerWidth` equaled `scrollWidth`) rather than document overflow.

The preview retained `cart_type=notification`. Add, increment, decrement, remove, multiple Product rows, header badge, notification, cart page, accessible toast states, reduced motion, keyboard dismissal, and no-false-success handling passed. The isolated cart was cleared. No live drawer claim is made.

The browser environment was Windows, Node `v24.13.0`, Playwright `1.61.1`, Shopify CLI `4.9.4`, and Playwright bundled Chromium in authenticated headless preview sessions. Screenshots include `machines-run7.png`, `directory-run7.png`, the run-7 navigation and responsive matrix, and `cart-fulfillment-run8.png` under the external evidence root.

## Preserved history and limitations

These earlier outcomes remain independent and unchanged:

- Phase B exact transport: `FAILED_EXACT_READBACK`.
- Phase B successor integrity: `PASS_SUCCESSOR_SEMANTIC_READBACK`.
- Initial live catalog: `FAIL`.
- Initial live cart: `PARTIAL`.
- Initial live accessibility: `FAIL`.

Phase C acceptance does not install the proposed Shopify navigation, approve production publication, renew Product classification or compatibility authority, suppress the 2,100 Theme Check `MatchingTranslations` errors, or resolve unrelated production gates. No quotation, Draft Order, checkout, order, customer, menu, collection, Product, production theme, or publication mutation occurred during acceptance.
