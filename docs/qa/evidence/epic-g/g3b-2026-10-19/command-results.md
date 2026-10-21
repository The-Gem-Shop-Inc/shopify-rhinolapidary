# G3B command results

Predeployment gates retain original source hashes. Final metadata and actual Shopify browser runs are separate. Fixture commands use the QA-output preloader where appropriate. This table does not relabel the two known diagnostics as passes. Original failed attempts remain in their attempt directories.

| Phase | Exact command | Exit | Log |
| --- | --- | --- | --- |
| Predeployment | `npm.cmd run test:epic-g-products` | 0 | [test-epic-g-products.txt](test-epic-g-products.txt) |
| Predeployment | `npm.cmd run test:epic-g-foundation` | 0 | [test-epic-g-foundation.txt](test-epic-g-foundation.txt) |
| Predeployment | `npm.cmd run test:epic-g-recovery-protection` | 0 | [test-epic-g-recovery-protection.txt](test-epic-g-recovery-protection.txt) |
| Predeployment | `npm.cmd run test:epic-g-catalog` | 0 | [test-epic-g-catalog.txt](test-epic-g-catalog.txt) |
| Predeployment | `npm.cmd run test:epic-g-catalog:deployment` | 0 | [test-epic-g-catalog-deployment.txt](test-epic-g-catalog-deployment.txt) |
| Predeployment | `npm.cmd run test:epic-g-catalog:entry` | 0 | [test-epic-g-catalog-entry.txt](test-epic-g-catalog-entry.txt) |
| Predeployment | `npm.cmd run test:epic-g-machine-routes` | 0 | [test-epic-g-machine-routes.txt](test-epic-g-machine-routes.txt) |
| Predeployment | `npm.cmd run validate:epic-g-machine-routes` | 0 | [validate-epic-g-machine-routes.txt](validate-epic-g-machine-routes.txt) |
| Predeployment | `npm.cmd run validate:product-templates` | 0 | [validate-product-templates.txt](validate-product-templates.txt) |
| Predeployment | `npm.cmd run validate:epic-g-catalog` | 0 | [validate-epic-g-catalog.txt](validate-epic-g-catalog.txt) |
| Predeployment | `npm.cmd run validate:product-purchase` | 0 | [validate-product-purchase.txt](validate-product-purchase.txt) |
| Predeployment | `npm.cmd run validate:metafields` | 0 | [validate-metafields.txt](validate-metafields.txt) |
| Predeployment | `npm.cmd run validate:registers` | 0 | [validate-registers.txt](validate-registers.txt) |
| Predeployment | `npm.cmd run validate:navigation` | 0 | [validate-navigation.txt](validate-navigation.txt) |
| Predeployment | `npm.cmd run validate:global-navigation-ia` | 0 | [validate-global-navigation-ia.txt](validate-global-navigation-ia.txt) |
| Predeployment | `npm.cmd run validate:rhino-style-contract` | 0 | [validate-rhino-style-contract.txt](validate-rhino-style-contract.txt) |
| Predeployment | `npm.cmd run validate:brand-performance` | 0 | [validate-brand-performance.txt](validate-brand-performance.txt) |
| Predeployment | `npm.cmd run validate:theme-architecture` | 0 | [validate-theme-architecture.txt](validate-theme-architecture.txt) |
| Predeployment | `npm.cmd run validate:epic-f-machine` | 0 | [validate-epic-f-machine.txt](validate-epic-f-machine.txt) |
| Predeployment | `npm.cmd run validate:epic-f-context-delivery` | 0 | [validate-epic-f-context-delivery.txt](validate-epic-f-context-delivery.txt) |
| Predeployment | `npm.cmd run theme:check` | 0 | [theme-check.txt](theme-check.txt) |
| Predeployment | `npm.cmd run validate:epic-f-facts` | 0 | [validate-epic-f-facts.txt](validate-epic-f-facts.txt) |
| Predeployment | `npm.cmd run validate:epic-f-gallery` | 0 | [validate-epic-f-gallery.txt](validate-epic-f-gallery.txt) |
| Predeployment | `npm.cmd run validate:epic-f-support-resources` | 0 | [validate-epic-f-support-resources.txt](validate-epic-f-support-resources.txt) |
| Predeployment | `npm.cmd run test:machine-gallery` | 0 | [test-machine-gallery.txt](test-machine-gallery.txt) |
| Predeployment | `npm.cmd run test:machine-shell` | 0 | [test-machine-shell.txt](test-machine-shell.txt) |
| Verified metadata | `npm.cmd run validate:registers` | 0 | [final-validate-registers.txt](final-validate-registers.txt) |
| Verified metadata | `npm.cmd run validate:navigation` | 0 | [final-validate-navigation.txt](final-validate-navigation.txt) |
| Verified metadata | `npm.cmd run validate:global-navigation-ia` | 0 | [final-validate-global-navigation-ia.txt](final-validate-global-navigation-ia.txt) |
| Verified metadata | `npm.cmd run validate:epic-g-machine-routes` | 0 | [final-validate-epic-g-machine-routes.txt](final-validate-epic-g-machine-routes.txt) |
| Verified metadata | `npm.cmd run validate:epic-g-catalog` | 0 | [final-validate-epic-g-catalog.txt](final-validate-epic-g-catalog.txt) |
| Verified metadata | `npm.cmd run test:epic-g-catalog` | 0 | [final-test-epic-g-catalog.txt](final-test-epic-g-catalog.txt) |
| Verified metadata | `npm.cmd run test:epic-g-catalog:entry` | 0 | [final-test-epic-g-catalog-entry.txt](final-test-epic-g-catalog-entry.txt) |
| Verified metadata | `npm.cmd run test:epic-g-machine-routes` | 0 | [final-test-epic-g-machine-routes.txt](final-test-epic-g-machine-routes.txt) |
| Supplemental fixture | `npm.cmd run test:epic-g-machine-entry:fixtures` | 0 | [machine-entry-fixtures.txt](machine-entry-fixtures.txt) |
| Supplemental fixture | `npm.cmd run test:epic-f-consumer` | 0 | [f-consumer-tests.txt](f-consumer-tests.txt) |
| Current owner release | `node --require ./scripts/lib/epic-g-test-evidence.js scripts/test-epic-f-final-owner-release.js` | 0 | [f-final-owner-tests.txt](f-final-owner-tests.txt) |
| Actual deployed | `node scripts/validate-epic-g-catalog-browser.js` | 0 | [deployed-browser-command.txt](deployed-browser-command.txt) |
| Actual deployed | `node --require ./scripts/lib/epic-g-test-evidence.js scripts/validate-epic-g-machine-routes-browser.js --deployed` | 0 | [machine-browser-final-command.txt](machine-browser-final-command.txt) |
| Actual native cart | `node scripts/probe-epic-g-anonymous-cart.js` | 0 | [anonymous-cart-command.txt](anonymous-cart-command.txt) |
| Verified metadata | `node scripts/register-epic-g-catalog-routes.js --verified` | 0 | Console / saved route artifact |
| Separate expired G2 diagnostic | `npm.cmd run validate:epic-g-products` | 1 | [expired-g2-fit-diagnostic.txt](expired-g2-fit-diagnostic.txt) |
| Strict final protection: historical PNG failures | `node scripts/report-epic-g-catalog.js` | 1 | [protection-command.txt](protection-command.txt) |

The toolkit Liquid helper exit 1 (missing @shopify/theme-check-common) is separately preserved in toolkit-liquid-validation.txt; actual CLI Theme Check exit 0 is above. Two synchronous/asynchronous evidence isolation fixtures passed after the screenshot-write defect was identified; output-isolation-tests.json records the assertions.
