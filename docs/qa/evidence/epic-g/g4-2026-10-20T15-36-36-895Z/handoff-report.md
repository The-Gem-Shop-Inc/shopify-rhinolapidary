# Epic G4 final handoff

Repository implemented: **true**. Automated integration passing: **false**. Actual preview fully verified: **false**. Current compatibility/role authority valid: **true**, expires **2026-10-22T20:26:37.102Z**. Production deployable: **false**. Formally complete: **false**.

Technical QA: **FAIL**, caused by attachment price/offer drift outside the three authorized changes. Current forward-fit rendering: **BLOCKED**, expired G2 presentation. Commercial launch: **BLOCKED**; all three unresolved decisions remain open. Native zero-price G Variants: **2**, not the expected 3.

Commands: 42 PASS / 1 FAIL / 1 BLOCKED. Integrated matrix: 36 PASS (9 positive / 27 negative). Six additional E/F owner-source child suites PASS. 111 G destinations, 22 machine cases, nine responsive cases and three actual browser zoom cases tested; the attachment alone fails exact protected native price/offer comparison. All performance budgets, cart cleanup and source/output protection pass.

Closing Admin observation 2026-10-20T15:51:20.088Z through 2026-10-20T15:51:43.142Z found no changes during this rerun. Current session: 60 read-only Admin data queries, four native cart POSTs (two isolated carts), both empty at completion; zero catalog/theme/publication/order writes. Earlier interrupted cart total is unknown.

The original full-run report remains unchanged. The owner-source wrapper and native viewport screenshot follow-up were executed separately and then added to the default orchestrator. Their underlying checks passed; no second full run is claimed. Exact child records, timestamps, source hashes, raw measurements and immutable parent report accompany this handoff.

| Command | Exit | Status |
| --- | --- | --- |
| `npm.cmd run validate:epic-g-foundation -- --read docs/qa/evidence/epic-g/g4-2026-10-20T15-36-36-895Z/admin-read.json --output docs/qa/evidence/epic-g/g4-2026-10-20T15-36-36-895Z/current-foundation.json` | 0 | PASS |
| `npm.cmd run test:epic-g-foundation` | 0 | PASS |
| `npm.cmd run test:epic-g-products` | 0 | PASS |
| `npm.cmd run test:epic-g-recovery-protection` | 0 | PASS |
| `npm.cmd run test:epic-g-machine-routes` | 0 | PASS |
| `npm.cmd run test:epic-g-machine-entry:fixtures` | 0 | PASS |
| `npm.cmd run test:epic-g-catalog` | 0 | PASS |
| `npm.cmd run test:epic-g-catalog:deployment` | 0 | PASS |
| `npm.cmd run test:epic-g-catalog:entry` | 0 | PASS |
| `npm.cmd run test:epic-f-consumer` | 0 | PASS |
| `npm.cmd run test:epic-f-facts` | 0 | PASS |
| `npm.cmd run test:epic-f-context-delivery` | 0 | PASS |
| `npm.cmd run test:epic-f-support-resources` | 0 | PASS |
| `npm.cmd run test:epic-f-media` | 0 | PASS |
| `npm.cmd run validate:epic-f-machine` | 0 | PASS |
| `npm.cmd run validate:epic-f-context-delivery` | 0 | PASS |
| `npm.cmd run validate:epic-f-facts` | 0 | PASS |
| `npm.cmd run validate:epic-f-gallery` | 0 | PASS |
| `npm.cmd run validate:epic-f-support-resources` | 0 | PASS |
| `npm.cmd run validate:epic-g-machine-routes` | 0 | PASS |
| `npm.cmd run validate:epic-g-catalog` | 0 | PASS |
| `npm.cmd run validate:product-templates` | 0 | PASS |
| `npm.cmd run validate:product-purchase` | 0 | PASS |
| `npm.cmd run validate:registers` | 0 | PASS |
| `npm.cmd run validate:metafields` | 0 | PASS |
| `npm.cmd run validate:navigation` | 0 | PASS |
| `npm.cmd run validate:global-navigation-ia` | 0 | PASS |
| `npm.cmd run validate:theme-architecture` | 0 | PASS |
| `npm.cmd run validate:rhino-style-contract` | 0 | PASS |
| `npm.cmd run validate:brand-performance` | 0 | PASS |
| `npm.cmd run theme:check` | 0 | PASS |
| `node scripts/test-epic-f-final-owner-release.js` | 0 | PASS |
| `npm.cmd run test:epic-g-integrated` | 0 | PASS |
| `npm.cmd run validate:epic-g-products` | 1 | BLOCKED |
| `npm.cmd run test:machine-shell` | 0 | PASS |
| `npm.cmd run test:machine-gallery` | 0 | PASS |
| `npm.cmd run test:epic-g-catalog:browser` | 0 | PASS |
| `node scripts/validate-epic-g-machine-routes-browser.js --deployed --current-read docs/qa/evidence/epic-g/g4-2026-10-20T15-36-36-895Z/admin-read.json` | 1 | FAIL |
| `node scripts/test-epic-g-product-runtime-overlay.js --deployed --sku-only` | 0 | PASS |
| `npm.cmd run test:epic-g-integrated:browser` | 0 | PASS |
| `npm.cmd run test:epic-g-integrated:performance` | 0 | PASS |
| `node scripts/probe-epic-g-anonymous-cart.js` | 0 | PASS |
| `node scripts/validate-epic-g-owner-sources.js` | 0 | PASS |
| `node scripts/probe-epic-g-zoom-viewport.js` | 0 | PASS |
