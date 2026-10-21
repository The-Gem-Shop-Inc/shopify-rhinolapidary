# G4 targeted recovery

Technical acceptance: **PASS** within bounded preview QA. Commercial launch: **BLOCKED**. Production deployable: **false**.

All 31 directed links were observed at 390px and 1440px; 150 complete observations include 137 earlier actual passes and 13 corrective reads. Responsive QA: 12/12, including 10 retained passes and two corrective cases; four real 200% zoom cases pass. Fit lease: 2026-10-20T17:06:42.312Z. Original owner expiry: 2026-10-22T20:26:37.102Z.

The original integrated command remains exit 1 / FAIL in docs/qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/g4-qa/integrated-report.json. Its two failed stages have separately recorded corrective executions. Historical failures and samples remain present.

| Command | Exit | Final status |
| --- | --- | --- |
| `npm.cmd run validate:epic-g-foundation -- --read docs/qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/admin-read.json --output docs/qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/g4-qa/current-foundation.json` | 0 | PASS |
| `npm.cmd run validate:epic-g-foundation -- --read docs/qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/admin-read.json --output docs/qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/current-foundation.json` | 0 | PASS |
| `npm.cmd run test:epic-g-foundation` | 0 | PASS |
| `npm.cmd run test:epic-g-products` | 0 | PASS |
| `npm.cmd run test:epic-g-recovery-protection` | 0 | PASS |
| `npm.cmd run validate:product-templates` | 0 | PASS |
| `npm.cmd run validate:product-purchase` | 0 | PASS |
| `npm.cmd run validate:registers` | 0 | PASS |
| `npm.cmd run validate:metafields` | 0 | PASS |
| `npm.cmd run validate:theme-architecture` | 0 | PASS |
| `npm.cmd run theme:check` | 0 | PASS |
| `npm.cmd run validate:epic-f-machine` | 0 | PASS |
| `npm.cmd run validate:epic-f-context-delivery` | 0 | PASS |
| `npm.cmd run validate:epic-f-facts` | 0 | PASS |
| `npm.cmd run validate:epic-f-gallery` | 0 | PASS |
| `npm.cmd run validate:epic-f-support-resources` | 0 | PASS |
| `npm.cmd run validate:rhino-style-contract` | 0 | PASS |
| `npm.cmd run test:epic-f-consumer` | 0 | PASS |
| `npm.cmd run validate:epic-f-consumer` | 0 | PASS |
| `npm.cmd run test:epic-g-machine-routes` | 0 | PASS |
| `npm.cmd run test:epic-g-catalog` | 0 | PASS |
| `npm.cmd run test:epic-g-catalog:deployment` | 0 | PASS |
| `npm.cmd run test:epic-g-catalog:entry` | 0 | PASS |
| `npm.cmd run validate:epic-g-machine-routes` | 0 | PASS |
| `npm.cmd run validate:epic-g-catalog` | 0 | PASS |
| `node scripts/test-epic-f-final-owner-release.js` | 0 | PASS |
| `node scripts/validate-epic-g-owner-sources.js` | 0 | PASS |
| `npm.cmd run test:epic-g-integrated` | 0 | PASS |
| `npm.cmd run validate:epic-g-products` | 0 | PASS |
| `npm.cmd exec playwright test -- --config=playwright.machine.config.js` | 0 | PASS |
| `npm.cmd exec playwright test -- --config=playwright.machine-gallery.config.js` | 0 | PASS |
| `node scripts/validate-epic-g-machine-routes-browser.js --deployed --current-read docs/qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/admin-read.json` | 0 | PASS |
| `node scripts/test-epic-g-fit-refresh.js --readback` | 0 | PASS |
| `npm.cmd run validate:epic-g-products` | 0 | PASS |
| `npm.cmd run test:epic-g-fit:preview -- --resume docs/qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/g4-qa/regression-writes/epic-g/g2-recovery-2026-10-16/deployed-fit-coverage.json --pace-ms 1800` | 0 | PASS |
| `npm.cmd run test:epic-g-catalog:browser -- --current-read docs/qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/admin-read.json --targeted` | 0 | PASS |
| `node scripts/test-epic-g-product-runtime-overlay.js --deployed` | 0 | PASS |
| `npm.cmd run test:epic-g-integrated:browser -- --resume docs/qa/evidence/epic-g/g4-recovery-2026-10-20T16-05-52-182Z/g4-responsive-recheck/responsive-browser.json` | 0 | PASS |
| `node scripts/probe-epic-g-zoom-viewport.js` | 0 | PASS |
| `node scripts/probe-epic-g-anonymous-cart.js` | 0 | PASS |
| `npm.cmd run test:epic-g-integrated` | 0 | PASS |

See integrated-report.json for exact logs, original executions, timestamps, hashes, approval proof, protected source manifest and remaining exceptions.
