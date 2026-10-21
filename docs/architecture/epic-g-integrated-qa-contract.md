# Epic G4 integrated QA contract

G-PBI-007 consumes existing E/F/G tests and approvals. It does not approve data, refresh a fit presentation, mutate catalog data or deploy theme files.

Run `npm.cmd run validate:epic-g-integrated -- --evidence <unique-g4-directory> --read <actual-admin-envelope>`. Use a new `docs/qa/evidence/epic-g/g4-*` directory for every run. Authenticated connector captures are normalized through the existing `audit:epic-g-admin --connector-log ... --output ...` and E paginator. Without `--read`, the runner attempts that existing authenticated audit; absent credentials or theme evidence remains BLOCKED. It cannot invoke the host's MCP connector from Node and never substitutes fixture data for a live observation.

Prepare current theme identity/inventory/body evidence using the existing authenticated read transport. The expected files are `inventory-158579622085.json`, `inventory-158631198917.json` and corresponding `files-<id>.json`, plus `theme-operations.json` and `shop-identity-read.json`. Their timestamps and raw responses remain evidence, not renewed observations. Copying capture inputs for a corrected run preserves their original timestamps and transcript hashes. The runner refuses to overwrite a completed run.

The command emits `integrated-report.json`, its JSON-schema-validated summary, `integrated-report.md`, `commands.json`, individual command logs, current protection evidence and scoped fixture/browser reports. States are PASS, FAIL, BLOCKED, DEFERRED and NOT APPLICABLE. Exit 0 means technical PASS; 1 means FAIL; 2 means BLOCKED. Business launch readiness is separate. A failed command retains its actual exit; the known expired G2 release validator is BLOCKED, never relabeled PASS.

Static suites run with two workers; actual browser suites run sequentially. New coverage supplements the existing catalog, machine, purchase, gallery, SKU and invalid-source suites. No overlay is actual Shopify proof. Populated native-SKU and 422/unavailable transitions use explicitly labeled local fixtures; actual Admin SKUs remain blank. Native cart success is one isolated add/remove with verified cleanup, never an order or a purchase involving unresolved zero-price Products.

## Current source and commercial changes

G1 checks complete Product/Variant pagination, exact approved class/identities, complete compatibility sets, target publication, E/F source integrity and receipt lifecycle. E's `compareNative` intentionally excludes native price; G1 reports price changes separately in `commercialDrift`. The three exact owner-approved applied prices are validated by `data/epic-g-commercial-decisions.json`; all other changed prices are rejected. That six-row commercial ledger is not a Product identity registry or compatibility authority.

Historical browser reproduction remains the default G3A behavior. Its opt-in `--current-read` mode verifies fresh G1 evidence and permits only the three approved native price strings and exact Variant-offer USD price changes. Every other Product/native/F field remains compared; JSON-LD is compared semantically in that current-state mode. Negative tests reject changed Variant, quantity, title and currency. Historical baselines and receipts are never edited.

The SKU-only fixture path no longer invokes the unrelated expired fit renderer. Its factory cannot render fit. Default fit-renderer behavior remains subject to the existing release verifier. If a separately authorized current fit release is available, the integrated runner executes the existing actual preview fit suite; otherwise that exact current-render criterion remains BLOCKED and previous deployed fit coverage remains historical.

## Remote representations and protection

Both complete theme inventories must match G3B's last reconciled state. MAIN must remain MAIN; preview must remain UNPUBLISHED. All relevant returned body checksums must match those inventories. Liquid/JS/CSS bodies are hashed exactly. Shopify's generated leading comment on JSON templates is removed only to reproduce their stored checksum; the default Product JSON additionally passes the existing exact G2 native-template structural contract. This is not a wildcard JSON exemption.

The settings-data read body is a formatted API representation that did not reproduce its stored checksum. Its returned stored checksum must still equal the unchanged full inventory; the API body SHA-256 is recorded separately, with no claim of raw-byte equivalence. No settings write occurs. Negative fixtures prove settings-checksum drift, unauthorized runtime bytes, removed Variant block, added block and changed purchase setting are rejected.

Current local protection compares all pre-existing files with the G4 task baseline. Only the explicit repository test/documentation changes are allowed; runtime assets and earlier evidence must remain unchanged. `epic-g-integrated-evidence.js` redirects synchronous, Promise, callback and stream writes into the current G4 directory. Tests deliberately attempt historical paths and traversal. Reads and assertions are untouched. The two unrecovered G3B PNG exceptions remain open in their original record and are not used to fail unrelated current journeys.

## Accessibility and performance limits

Additional actual preview coverage uses 360px, 390px and 1440px, 200% root text, keyboard/pointer focus, hit testing against sticky headers, native controls and full-page axe. Real Chromium 200% browser zoom uses a disposable test-only extension calling `chrome.tabs.setZoom/getZoom`; it is neither CSS zoom nor pinch scaling and is never deployed. See [Playwright extension testing](https://playwright.dev/docs/chrome-extensions) and [Chrome tabs zoom API](https://developer.chrome.com/docs/extensions/reference/api/tabs).

Serious/critical accessibility findings remain failures; inherited issues require specific evidence and cross-Epic ownership. Approximate 558px enlarged header and EM-1 moderate contents heading order are not claimed fixed. New test surfaces do not authorize global navigation reconstruction.

Performance reuses existing observers, resource attribution, median function and budgets. Three cold samples per Product/machine/theme/viewport are retained, including outliers; MAIN provides an unchanged runtime baseline. Catalog results reuse the actual G3B browser measurement and its original native-grid baseline. This is bounded preview QA, not F performance-integrity certification or final F release signoff.
