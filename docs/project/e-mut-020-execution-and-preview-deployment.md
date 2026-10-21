# E-MUT-020 execution and persistent development preview

Current execution record for the Product Owner authorization dated **2026-10-05**. This record supersedes historical blocked planning states operationally; historical plans, snapshots, approval slots, manifests, and implementation records remain unchanged.

F-DEC-001 is **APPROVED_OPTION_A — OPTION_A_RETAIN_NATIVE_PAYMENT_TERMS**. The [current decision artifact](../../data/epic-f-current-decisions.json) records the Product Owner's approval. Existing native/provider-owned terms remain unchanged. The earlier eight-Product Shopify evidence covers current Variant synchronization, responsive reflow, 200% text enlargement, actual Chromium 200% browser zoom, and corrected provider parity. No Rhino financing/installment copy or payment configuration change is required or authorized.

E-MUT-020 uses a **delegated_development_override**, bound to input SHA256 `c211f7c6258eedea6eed7d0ce64bb9272c70160f91d11b08e770474f2cd43edb`. The [execution authorization](../qa/evidence/epic-e/E-MUT-020-2026-10-05-execution-authorization.json) records explicit approval of all seven structural groups and all 38 deterministic definition rows. It does not claim that two independent historical approvals existed. The plan-specific execution contract has no global `skipApprovals` option; normal approval architecture remains in force for other plans.

The authorized catalog write boundary is definitions only: `metaobjectDefinitionCreate` and `metafieldDefinitionCreate`. Product values, family records, compatibility/BOM edges, quantities, resource attachments, E-MUT-021, compensation/deletion, Product template assignments, payment/analytics configuration, and production theme writes/publication are excluded.

The fresh [before snapshot](../qa/evidence/epic-e/E-MUT-020-2026-10-05-before-admin-snapshot.json) and [after snapshot](../qa/evidence/epic-e/E-MUT-020-2026-10-05-after-admin-snapshot.json) exhaust all 18 audit datasets, including 122 Products, 125 Variants, Product/Variant/Collection definition inventories, all metaobject definitions, and family entries. The shop identity is `gid://shopify/Shop/79279947973`, domain `sz5dnk-nf.myshopify.com`. The connector does not expose the effective Admin API version; `apiVersion: null` states that limitation without inventing a version. The existing snapshot schema now allows this explicit unavailable value. [Read provenance](../qa/evidence/epic-e/E-MUT-020-2026-10-05-read-provenance.json) contains exact timestamps, query adaptations, supported types, and ownership mapping.

All 38 planned rows were **ABSENT**, with zero exact existing definitions and zero conflicts. The plan's deterministic order was preserved: machine-family definition, Product classification definition, dependent Product family-reference definition, then the remaining approved rows. The dependent validation uses the actual returned metaobject definition GID.

One initial create was rejected with `ADMIN_ACCESS_INPUT_NOT_ALLOWED`; it created nothing. Execution stopped and the error was diagnosed before retry. The approved identifiers are merchant-owned, so Shopify's API disallows app-only `access.admin` inputs and supplies `PUBLIC_READ_WRITE` Admin access. The corrected mapping omits app-only Admin/customer inputs, preserves exact identifiers/types/validations/storefront access, and verifies returned `customerAccount: NONE`. Merchant-owned data remains shared across installed apps, as [Shopify documents for metaobjects](https://shopify.dev/docs/apps/build/metaobjects#merchant-owned-metaobjects) and [metafields](https://shopify.dev/docs/apps/build/metafields#merchant-owned-metafields). The reconciliation helper recognizes this API representation of merchant read/write intent without changing desired definitions. Private/read-only Admin access, incorrect storefront access, and customer exposure remain conflicts and are tested.

The [execution journal](../qa/evidence/epic-e/E-MUT-020-2026-10-05-journal.json) preserves the rejected attempt, all successful inputs/responses, actual GIDs, per-row cursors, and final reconciliation state. Each metafield row also has an independent durable receipt under `docs/qa/evidence/epic-e/E-MUT-020-2026-10-05-rows/`. No successful definition was deleted or recreated.

E-MUT-020 is **EXECUTED_AND_RECONCILED**, with 38 created, zero reused, zero terminal failures/blocked rows, and 38/38 exact after-state matches. The [reconciliation result](../qa/evidence/epic-e/E-MUT-020-2026-10-05-reconciliation.json), [current definition inventory](../qa/evidence/epic-e/E-MUT-020-2026-10-05-definition-after-inventory.json), and [existing Epic E drift gate](../qa/evidence/epic-e/E-MUT-020-2026-10-05-after-drift.json) prove the result. All 122 Product and 125 Variant records remain exactly equal before/after; all 11 governed machines are included. Product values populated: **0**. Compatibility values: **0**. BOM/resource values: **0**. Machine-family entries: **0**. Crate fields and support_files retain storefront `NONE`; customer access is `NONE` for all definitions.

The separately authorized preview deployment targets only theme `158631198917`, **Rhino Lapidary - Preview**, required role **UNPUBLISHED**. The fresh role inventory identifies current production theme `158579622085`, `shopify-rhinolapidary/main`, role **MAIN**, which is excluded. The [before-state/rollback artifact](../qa/evidence/epic-f/2026-10-05-persistent-preview-before.json) contains full inventories for both themes and exact remote content for every existing allowlisted file. Fifteen allowlisted paths existed; seventeen were absent.

The [persistent source binding](../qa/evidence/epic-f/2026-10-05-persistent-development-source-binding.json) derives 32 exact paths/hashes from the historical 28-file shell preparation plus the explicitly reviewed cleanup extraction boundary. It uses real repository `layout/theme.liquid` and `assets/rhino-custom.css`, including current extracted runtime snippets. CSS SHA256 remains `32f44d332f5b1d51b95213292c54d6e5c17751ebf4e79878eba4e2c17ce5f961`. Manifest SHA256 is `2c068978e8210c3c79df35257ce66db4626fb8561df25bf69fb44ef3ad1d0f1e`. Virtual inline snippets, transformed layout, overrides JSON, signed-session tooling, unrelated files, and remote deletions are excluded.

The single selective persistent push completed successfully on 2026-10-05, from 19:14:41.731Z to 19:15:13.131Z, using Shopify CLI 4.8.3. CLI exit: **0**. The command supplied every path below through a separate `--only`, with `--nodelete --strict --json`; it supplied no publication/live flags. Seventeen paths were created and fifteen updated. The runner initially exited 1 because strict Theme Check emitted `[]` before the deployment JSON. Its corrected parser recovered the original retained output without another push; the receipt preserves both results.


The [push receipt](../qa/evidence/epic-f/2026-10-05-persistent-preview-push.json) and [readback](../qa/evidence/epic-f/2026-10-05-persistent-preview-readback.json) verify **32/32 stored checksums** against repository source. Twenty-nine returned bodies also match raw SHA256. Shopify adds generated comments/serialization to the three JSON API bodies; their stored upload checksums and parsed keys/values match exactly. No allowlisted content mismatch exists. The persistent preview now has 426 files (409 before), including product.machine and all cleanup snippets. No unallowlisted file changed and no inline-preview snippet is present.

## Reconciled definition identities

| Row | Identity | Actual Shopify GID |
|---|---|---|
| CD-MO-001 | `METAOBJECT:machine_family` | `gid://shopify/MetaobjectDefinition/25406406853` |
| CD-MF-001 | `PRODUCT:rhino.product_class` | `gid://shopify/MetafieldDefinition/298658201797` |
| CD-MF-002 | `PRODUCT:rhino.machine_family` | `gid://shopify/MetafieldDefinition/298658234565` |
| CD-MF-010 | `PRODUCT:rhino.input_voltage` | `gid://shopify/MetafieldDefinition/298658267333` |
| CD-MF-011 | `PRODUCT:rhino.input_frequencies` | `gid://shopify/MetafieldDefinition/298658300101` |
| CD-MF-012 | `PRODUCT:rhino.motor_power` | `gid://shopify/MetafieldDefinition/298658332869` |
| CD-MF-013 | `PRODUCT:rhino.motor_speed` | `gid://shopify/MetafieldDefinition/298658365637` |
| CD-MF-014 | `PRODUCT:rhino.wheel_speed_min` | `gid://shopify/MetafieldDefinition/298658398405` |
| CD-MF-015 | `PRODUCT:rhino.wheel_speed_max` | `gid://shopify/MetafieldDefinition/298658431173` |
| CD-MF-016 | `PRODUCT:rhino.flex_shaft_speed_min` | `gid://shopify/MetafieldDefinition/298658463941` |
| CD-MF-017 | `PRODUCT:rhino.flex_shaft_speed_max` | `gid://shopify/MetafieldDefinition/298658496709` |
| CD-MF-018 | `PRODUCT:rhino.blade_diameter_min` | `gid://shopify/MetafieldDefinition/298659119301` |
| CD-MF-019 | `PRODUCT:rhino.blade_diameter_max` | `gid://shopify/MetafieldDefinition/298659152069` |
| CD-MF-020 | `PRODUCT:rhino.wheel_diameter` | `gid://shopify/MetafieldDefinition/298659184837` |
| CD-MF-021 | `PRODUCT:rhino.blade_arbor_diameter` | `gid://shopify/MetafieldDefinition/298659217605` |
| CD-MF-022 | `PRODUCT:rhino.wheel_arbor_diameter` | `gid://shopify/MetafieldDefinition/298659250373` |
| CD-MF-023 | `PRODUCT:rhino.water_reservoir_capacity` | `gid://shopify/MetafieldDefinition/298659381445` |
| CD-MF-024 | `PRODUCT:rhino.cutting_oil_fill_min` | `gid://shopify/MetafieldDefinition/298659610821` |
| CD-MF-025 | `PRODUCT:rhino.cutting_oil_fill_max` | `gid://shopify/MetafieldDefinition/298659840197` |
| CD-MF-026 | `PRODUCT:rhino.water_system_type` | `gid://shopify/MetafieldDefinition/298660069573` |
| CD-MF-027 | `PRODUCT:rhino.net_weight` | `gid://shopify/MetafieldDefinition/298660102341` |
| CD-MF-028 | `PRODUCT:rhino.assembled_length` | `gid://shopify/MetafieldDefinition/298660135109` |
| CD-MF-029 | `PRODUCT:rhino.assembled_width` | `gid://shopify/MetafieldDefinition/298660167877` |
| CD-MF-030 | `PRODUCT:rhino.assembled_height` | `gid://shopify/MetafieldDefinition/298660200645` |
| CD-MF-031 | `PRODUCT:rhino.crate_length` | `gid://shopify/MetafieldDefinition/298660233413` |
| CD-MF-032 | `PRODUCT:rhino.crate_width` | `gid://shopify/MetafieldDefinition/298660266181` |
| CD-MF-033 | `PRODUCT:rhino.crate_height` | `gid://shopify/MetafieldDefinition/298660298949` |
| CD-MF-034 | `PRODUCT:rhino.compatible_machines` | `gid://shopify/MetafieldDefinition/298660331717` |
| CD-MF-035 | `PRODUCT:rhino.included_products` | `gid://shopify/MetafieldDefinition/298660364485` |
| CD-MF-036 | `PRODUCT:rhino.included_quantities` | `gid://shopify/MetafieldDefinition/298660397253` |
| CD-MF-037 | `PRODUCT:rhino.noncatalog_components` | `gid://shopify/MetafieldDefinition/298660430021` |
| CD-MF-039 | `PRODUCT:rhino.optional_products` | `gid://shopify/MetafieldDefinition/298660462789` |
| CD-MF-040 | `PRODUCT:rhino.recommended_products` | `gid://shopify/MetafieldDefinition/298660495557` |
| CD-MF-041 | `PRODUCT:rhino.manual_files` | `gid://shopify/MetafieldDefinition/298660528325` |
| CD-MF-042 | `PRODUCT:rhino.diagram_files` | `gid://shopify/MetafieldDefinition/298660561093` |
| CD-MF-043 | `PRODUCT:rhino.instruction_files` | `gid://shopify/MetafieldDefinition/298660593861` |
| CD-MF-044 | `PRODUCT:rhino.video_files` | `gid://shopify/MetafieldDefinition/298660626629` |
| CD-MF-045 | `PRODUCT:rhino.support_files` | `gid://shopify/MetafieldDefinition/298660659397` |

## Persistent deployment allowlist

- `assets/rhino-custom.css`
- `layout/theme.liquid`
- `locales/en.default.json`
- `locales/en.default.schema.json`
- `sections/cart-notification-product.liquid`
- `sections/main-cart-items.liquid`
- `sections/main-product.liquid`
- `sections/predictive-search.liquid`
- `snippets/card-product.liquid`
- `snippets/cart-disclosure-indicator.liquid`
- `snippets/cart-drawer.liquid`
- `snippets/meta-tags.liquid`
- `snippets/product-disclosures.liquid`
- `snippets/product-media-modal.liquid`
- `snippets/rhino-machine-contents.liquid`
- `snippets/rhino-machine-contextual.liquid`
- `snippets/rhino-machine-delivery.liquid`
- `snippets/rhino-machine-resources.liquid`
- `snippets/rhino-machine-specifications.liquid`
- `snippets/rhino-machine-support.liquid`
- `snippets/rhino-product-consumer-route.liquid`
- `snippets/rhino-product-context-delivery-projection.liquid`
- `snippets/rhino-product-description.liquid`
- `snippets/rhino-product-fact-projection.liquid`
- `snippets/rhino-product-media-eligibility.liquid`
- `snippets/rhino-product-structured-data.liquid`
- `snippets/rhino-product-support-resources-projection.liquid`
- `templates/product.machine.json`
- `snippets/product-inventory.liquid`
- `snippets/card-product-placeholder.liquid`
- `snippets/facets-mobile.liquid`
- `snippets/facets.liquid`

## Development preview

[Shopify Theme Editor](https://sz5dnk-nf.myshopify.com/admin/themes/158631198917/editor) · [Stable preview root](https://sz5dnk-nf.myshopify.com?preview_theme_id=158631198917)

- [BeadMaster 6"](https://sz5dnk-nf.myshopify.com/products/beadmaster?preview_theme_id=158631198917&view=machine)
- [EM-1 Machine](https://sz5dnk-nf.myshopify.com/products/em-1?preview_theme_id=158631198917&view=machine)
- [LapMaster 12"](https://sz5dnk-nf.myshopify.com/products/lapmaster-12?preview_theme_id=158631198917&view=machine)
- [LapMaster 18"](https://sz5dnk-nf.myshopify.com/products/lapmaster-18?preview_theme_id=158631198917&view=machine)
- [SawMaster 18"](https://sz5dnk-nf.myshopify.com/products/sawmaster-18?preview_theme_id=158631198917&view=machine)
- [SawMaster 24"](https://sz5dnk-nf.myshopify.com/products/sawmaster-24?preview_theme_id=158631198917&view=machine)
- [ShapeMaster 6"](https://sz5dnk-nf.myshopify.com/products/shapemaster?preview_theme_id=158631198917&view=machine)
- [TrimMaster](https://sz5dnk-nf.myshopify.com/products/trimmaster?preview_theme_id=158631198917&view=machine)

These links intentionally force `view=machine` on the **UNPUBLISHED** theme. Product assignments remain unchanged. This is the ongoing visual development surface; it does not replace the live theme. The store remains password protected: existing storefront authentication is required, and no password configuration changed.

## Persistent preview smoke and final state

All eight Products passed at 390 and 1440 px: **16/16 cells**. Two supplementary representative computed-style cells passed. The persisted machine template, ordinary Rhino stylesheet asset, neutral Contact, current native payment terms, title/price/quantity/purchase display, responsive layout, header/footer, and zero governed grants passed. No preview-only inline transport appeared. No transactional action occurred. The first unauthenticated attempt encountered the storefront password gate; that failed attempt remains separately recorded. The successful run used the existing password only in process memory, with no persisted cookies or authentication settings changes.

Page/Liquid errors: **0**. Harness-blocked requests: **0**. The main 16-cell run retained **32 provider console errors** (a Shop Pay CSP frame restriction and HTTP 403 per cell); these are not hidden or described as a clean provider console. No Rhino page error occurred. This bounded development smoke is not F-PBI-014B or F-PBI-015B certification.

The source asset is exact in persistent storage. Shopify serves its normal minified CDN representation, including a source-map comment; browser response bytes and ordered CSSOM serialization differ from the source. The separate CDN diagnostic therefore records unequal raw/CSSOM hashes, rather than claiming byte or whole-CSSOM identity. Representative Rhino computed styles are active on actual preview pages. No CSS source or architecture was changed to accommodate CDN processing.

The [final read after all browser work](../qa/evidence/epic-e/E-MUT-020-2026-10-05-final-post-smoke-state.json), completed 2026-10-05T19:28:17.802Z, exhausted Products, Variants, and both theme inventories. All **122 Products and 125 Variants** remain unchanged, including all eleven governed machines, suffixes, status/publication, and rhino values. Preview files match the verified post-push state. All **406 production file records and live theme identity** remain unchanged. Preview remains UNPUBLISHED. Product-value, compatibility, BOM/resource, family-record, Product-assignment, production-mutation, and publication counts remain zero.

## Validation

| Command | Exit | Result |
|---|---:|---|
| `node scripts/test-e-mut-020-development-execution.js` | 0 | 52 tests passed |
| `node scripts/validate-epic-e-batch-4a.js --plan=E-MUT-020` | 0 | historical deterministic plan valid; current authorization separate |
| `node scripts/validate-epic-e-batch-4a.js` | 0 | architecture gates passed |
| `node scripts/test-epic-e-batch-4a.js` | 0 | 64 tests passed |
| `node scripts/test-epic-e-custom-data-contract.js` | 0 | contract tests passed |
| `node scripts/test-epic-e-admin-mutation-plan.js` | 0 | normal multi-approval architecture retained |
| `node scripts/validate-e-mut-020-execution-reconciliation.js` | 0 | 38/38, zero Product values |
| `node scripts/run-epic-e-gates.js --mode=admin --plan=E-MUT-020 --before=docs/qa/evidence/epic-e/E-MUT-020-2026-10-05-before-admin-snapshot.json --snapshot=docs/qa/evidence/epic-e/E-MUT-020-2026-10-05-after-admin-snapshot.json --output=docs/qa/evidence/epic-e/E-MUT-020-2026-10-05-after-drift.json` | 0 | admin_reconciled; separate historical CSV/fixture ownership diagnostics retained |
| `RHINO_EPIC_F_CLEANUP_BINDING=docs/qa/evidence/epic-f/release-gate-cleanup-source-binding.json npm run validate:epic-f-batch-f8` | 0 | F1-F8 aggregate; 178 local Playwright tests passed |
| `node scripts/validate-json-registers.js` | 0 | register/schema validation passed |
| `node scripts/validate-hardcoded-strings.js` | 0 | existing namespace/selector warnings retained |
| `Shopify CLI 4.8.3 theme check --path . --fail-level warning --output json` | 0 | []: zero errors; zero warnings; threshold unchanged |
| `node scripts/validate-epic-f-persistent-preview-readback.js` | 0 | 32/32 stored checksums exact |
| `node scripts/smoke-epic-f-persistent-development-preview.js` | 0 | 16/16 persistent mobile/desktop cells |
| `node scripts/smoke-epic-f-persistent-development-preview.js --computed-smoke` | 0 | 2/2 representative computed-style cells |
| `git diff --check` | 0 | no whitespace errors |

Theme Check is zero errors, zero warnings, exit 0 at the unchanged warning fail level. The F1–F8 aggregate passed with 178 local browser tests. Historical CSV drift (103) and fixture-ownership diagnostics (2) remain separate from the passing E-MUT-020 Admin reconciliation. Existing hardcoded-string warnings remain visible. No release performance medians or live certification were generated.

## Current boundaries and next dependency

- F_DEC_001: **APPROVED_OPTION_A**
- E_MUT_020: **EXECUTED_AND_RECONCILED**
- E_MUT_021: **NOT_EXECUTED**
- repositoryShell: **COMPLETE_UNCHANGED**
- persistentPreviewDeployment: **COMPLETE**
- machineTemplateOnPreviewTheme: **PRESENT**
- productionTheme: **UNCHANGED**
- ProductTemplateAssignments: **UNCHANGED**
- F_PBI_014B: **PARTIAL**
- F_PBI_015B: **DEFERRED**
- F_PBI_017B: **BLOCKED_NOT_EXECUTED**
- F_PBI_018B: **NOT_BEGUN**
- liveProductionRelease: **NOT_AUTHORIZED**

F-PBI-014B retains assigned-template/release-state parity and real available-pickup/alternate-Variant gaps where those states are unavailable. Existing local and ownership-scoped accessibility evidence is preserved; this smoke does not replace it.

E-MUT-021 now has its required `rhino.product_class` definition, GID `gid://shopify/MetafieldDefinition/298658201797`. Its historical deterministic plan contains 122 approved mappings and zero unresolved candidates. It remains **not executed**: execution requires separate E-MUT-021 authorization under its normal gate and a fresh compare-before-write. No Kevin/Vejdi technical answers are required for the classification step. No classification values were populated.

The [consolidated execution summary](../qa/evidence/epic-e/E-MUT-020-2026-10-05-development-execution-summary.json) lists every new execution/evidence/tooling artifact and validation. Current status is recorded additively in `data/epic-e-current-execution-status.json` and `data/epic-f-current-development-status.json`. Historical plans, approval slots, manifests, and reports remain intact. Storefront runtime files were deployed from the existing cleanup binding and were not changed by this execution. The supporting changes are the bounded execution contract/tests, explicit unavailable-API-version schema representation, merchant-owned access reconciliation, source binding/deploy/readback/smoke tooling, and current decision/status/evidence files.

The final local audit verified all three historical authority hashes and all 32 deployed source hashes, and found zero token, credential-field, or signed-preview-URL patterns across the new task evidence/tooling. Stable preview_theme_id links are intentionally retained. See [final local audit](../qa/evidence/epic-e/E-MUT-020-2026-10-05-final-local-audit.json).
