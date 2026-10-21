# Epic G4 integrated QA

Technical QA: **FAIL**. Automated commands passing: false. Actual preview verified: false. Current authority valid: true. Commercial launch: **BLOCKED**. Production deployable: **false**. Formally complete: false.

Observation: {"path":"docs/qa/evidence/epic-g/g4-2026-10-19T21-08-49-283Z/admin-read.json","sourceKind":"live_admin","startedAt":"2026-10-19T20:54:18.150Z","completedAt":"2026-10-19T20:54:45.575Z","queries":26}.

| Criterion | Status |
| --- | --- |
| current-catalog-authority | PASS |
| exact-commercial-observation | PASS |
| commercial-gid://shopify/ProductVariant/46484253278405 | DEFERRED |
| commercial-gid://shopify/ProductVariant/46484256948421 | DEFERRED |
| commercial-gid://shopify/ProductVariant/46484258881733 | BLOCKED |
| theme-identities-and-drift | FAIL |
| current-forward-fit-render | BLOCKED |
| historical-PNG-recovery | DEFERRED |
| optional-selectors-and-account-reorder | NOT APPLICABLE |
| current-output-and-source-protection | PASS |

| Command | Exit | Status | Log |
| --- | --- | --- | --- |
| `npm.cmd run test:epic-g-foundation` | 0 | PASS | [test-epic-g-foundation](logs/test-epic-g-foundation.txt) |
| `npm.cmd run test:epic-g-products` | 0 | PASS | [test-epic-g-products](logs/test-epic-g-products.txt) |
| `npm.cmd run test:epic-g-recovery-protection` | 0 | PASS | [test-epic-g-recovery-protection](logs/test-epic-g-recovery-protection.txt) |
| `npm.cmd run test:epic-g-machine-routes` | 0 | PASS | [test-epic-g-machine-routes](logs/test-epic-g-machine-routes.txt) |
| `npm.cmd run test:epic-g-machine-entry:fixtures` | 0 | PASS | [test-epic-g-machine-entry-fixtures](logs/test-epic-g-machine-entry-fixtures.txt) |
| `npm.cmd run test:epic-g-catalog` | 0 | PASS | [test-epic-g-catalog](logs/test-epic-g-catalog.txt) |
| `npm.cmd run test:epic-g-catalog:deployment` | 0 | PASS | [test-epic-g-catalog-deployment](logs/test-epic-g-catalog-deployment.txt) |
| `npm.cmd run test:epic-g-catalog:entry` | 0 | PASS | [test-epic-g-catalog-entry](logs/test-epic-g-catalog-entry.txt) |
| `npm.cmd run test:epic-f-consumer` | 0 | PASS | [test-epic-f-consumer](logs/test-epic-f-consumer.txt) |
| `npm.cmd run test:epic-f-facts` | 0 | PASS | [test-epic-f-facts](logs/test-epic-f-facts.txt) |
| `npm.cmd run test:epic-f-context-delivery` | 0 | PASS | [test-epic-f-context-delivery](logs/test-epic-f-context-delivery.txt) |
| `npm.cmd run test:epic-f-support-resources` | 0 | PASS | [test-epic-f-support-resources](logs/test-epic-f-support-resources.txt) |
| `npm.cmd run test:epic-f-media` | 0 | PASS | [test-epic-f-media](logs/test-epic-f-media.txt) |
| `npm.cmd run validate:epic-f-machine` | 0 | PASS | [validate-epic-f-machine](logs/validate-epic-f-machine.txt) |
| `npm.cmd run validate:epic-f-context-delivery` | 0 | PASS | [validate-epic-f-context-delivery](logs/validate-epic-f-context-delivery.txt) |
| `npm.cmd run validate:epic-f-facts` | 0 | PASS | [validate-epic-f-facts](logs/validate-epic-f-facts.txt) |
| `npm.cmd run validate:epic-f-gallery` | 0 | PASS | [validate-epic-f-gallery](logs/validate-epic-f-gallery.txt) |
| `npm.cmd run validate:epic-f-support-resources` | 0 | PASS | [validate-epic-f-support-resources](logs/validate-epic-f-support-resources.txt) |
| `npm.cmd run validate:epic-g-machine-routes` | 0 | PASS | [validate-epic-g-machine-routes](logs/validate-epic-g-machine-routes.txt) |
| `npm.cmd run validate:epic-g-catalog` | 0 | PASS | [validate-epic-g-catalog](logs/validate-epic-g-catalog.txt) |
| `npm.cmd run validate:product-templates` | 0 | PASS | [validate-product-templates](logs/validate-product-templates.txt) |
| `npm.cmd run validate:product-purchase` | 0 | PASS | [validate-product-purchase](logs/validate-product-purchase.txt) |
| `npm.cmd run validate:registers` | 0 | PASS | [validate-registers](logs/validate-registers.txt) |
| `npm.cmd run validate:metafields` | 0 | PASS | [validate-metafields](logs/validate-metafields.txt) |
| `npm.cmd run validate:navigation` | 0 | PASS | [validate-navigation](logs/validate-navigation.txt) |
| `npm.cmd run validate:global-navigation-ia` | 0 | PASS | [validate-global-navigation-ia](logs/validate-global-navigation-ia.txt) |
| `npm.cmd run validate:theme-architecture` | 0 | PASS | [validate-theme-architecture](logs/validate-theme-architecture.txt) |
| `npm.cmd run validate:rhino-style-contract` | 0 | PASS | [validate-rhino-style-contract](logs/validate-rhino-style-contract.txt) |
| `npm.cmd run validate:brand-performance` | 0 | PASS | [validate-brand-performance](logs/validate-brand-performance.txt) |
| `npm.cmd run theme:check` | 0 | PASS | [theme-check](logs/theme-check.txt) |
| `node scripts/test-epic-f-final-owner-release.js` | 0 | PASS | [current-final-owner-release](logs/current-final-owner-release.txt) |
| `npm.cmd run test:epic-g-integrated` | 0 | PASS | [g4-negative-matrix](logs/g4-negative-matrix.txt) |
| `npm.cmd run validate:epic-g-products` | 1 | BLOCKED | [g2-presentation-lifecycle](logs/g2-presentation-lifecycle.txt) |
| `npm.cmd run test:machine-shell` | 0 | PASS | [machine-shell-fixtures](logs/machine-shell-fixtures.txt) |
| `npm.cmd run test:machine-gallery` | 0 | PASS | [gallery-fixtures](logs/gallery-fixtures.txt) |
| `npm.cmd run test:epic-g-catalog:browser` | null | BLOCKED | [catalog-deployed](logs/catalog-deployed.txt) |
| `node scripts/validate-epic-g-machine-routes-browser.js --deployed --current-read docs/qa/evidence/epic-g/g4-2026-10-19T21-08-49-283Z/admin-read.json` | null | BLOCKED | [machine-deployed](logs/machine-deployed.txt) |
| `node scripts/test-epic-g-product-runtime-overlay.js --deployed --sku-only` | null | BLOCKED | [sku-runtime-fixtures](logs/sku-runtime-fixtures.txt) |
| `npm.cmd run test:epic-g-integrated:browser` | null | BLOCKED | [responsive-enlargement](logs/responsive-enlargement.txt) |
| `npm.cmd run test:epic-g-integrated:performance` | null | BLOCKED | [performance](logs/performance.txt) |
| `node scripts/probe-epic-g-anonymous-cart.js` | null | BLOCKED | [anonymous-native-cart](logs/anonymous-native-cart.txt) |

Machine-readable details, raw samples and failure conditions accompany this report. Deferred business decisions and historical recovery are distinct from current technical assertions. Expired current forward-fit rendering remains blocked, never counted as passed.
