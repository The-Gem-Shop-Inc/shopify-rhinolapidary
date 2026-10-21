# E-MUT-021 Product classification execution

Current implementation record for the authorization dated **2026-10-05**. E-MUT-021 is **EXECUTED_AND_RECONCILED**, with **122/122** exact approved live Shopify classifications. This record supersedes prior blocked planning states operationally; historical snapshots, approval slots, plans/input hashes, E-MUT-020 execution evidence and F1–F8 manifests remain intact.

The plan-specific authorization uses **delegated_development_override**, input SHA256 `d1aa54a482f1ac786f8e616eede866c790ebe123f8d557dfb6b2c0de076614e1`, exactly 122 approved rows, and only `metafieldsSet` for PRODUCT `rhino.product_class`. No generic bypass was added. The existing definition `gid://shopify/MetafieldDefinition/298658201797` and its four choices were freshly verified and never changed. Technical values, other Product/Variant fields, definitions, relationships/resources, templates, theme pushes, production publication, payment/analytics configuration and transactional actions were prohibited. Kevin/Vejdi technical decisions were not consumed.

The [fresh read provenance](../qa/evidence/epic-e/E-MUT-021-2026-10-05-read-provenance.json) records before **2026-10-05T19:55:46.342Z → 2026-10-05T19:56:22.047Z** and after **2026-10-05T20:00:13.502Z → 2026-10-05T20:00:36.574Z**. Shop `gid://shopify/Shop/79279947973`, `sz5dnk-nf.myshopify.com`. All 18 audit datasets were exhausted, including 122 Products, 125 Variants, definitions, publications, media, inventory, fulfillment, policies and files. The connector does not expose its effective API version: recorded as null. Exact validated query sources and hashes are retained.

Before comparison: **ABSENT 122; EXACT_MATCH 0; CONFLICT 0**. The [journal](../qa/evidence/epic-e/E-MUT-021-2026-10-05-journal.json) records five sequential deterministic batches of **25/25/25/25/22**. Each batch re-read exact owners, persisted the planned cursor, supplied `compareDigest:null` to guarantee absent-only creation, checked all returned owners/types/values/definition IDs, and stopped on GraphQL/user errors. Batches have independent before/receipt files. Created 122, reused 0, failed 0, userErrors 0, retries 0. Throttle information was not exposed; batching and durable checks were sequential. A subsequent read-only compare would require zero writes.

The [reconciliation](../qa/evidence/epic-e/E-MUT-021-2026-10-05-reconciliation.json) confirms **machine 11; replacement_part 54; consumable 39; accessory 18**, with no missing, invalid or duplicate classifications. Only product_class data changed. Title/handle/type/category/vendor/tags/description/SEO/status/publications/media/templateSuffix and every other metafield remain identical. All 125 Variants, prices and inventory records remain exact. Other Rhino values, compatibility/BOM/resource values and family records introduced: **0**. All 38 E-MUT-020 definitions remain unchanged; four deferred registry contracts remain outside that definition execution scope. The existing Admin drift gate passed.

Product `updatedAt` is recorded separately as bookkeeping: 121 advanced in the first after-read. The remaining Product `gid://shopify/Product/8905785671877` advanced from `2026-09-02T15:28:08Z` to `2026-10-05T20:01:48Z` by the final read. Protected data and classification remained exact; the precise timing cause was not independently established. The observation is preserved, not hidden as whole-record byte equality.

## Exact governed machine classifications

| Product GID | Diagnostic title | Live value | Metafield GID |
|---|---|---|---|
| `gid://shopify/Product/8905779937477` | BeadMaster 6" | machine | `gid://shopify/Metafield/71185426317509` |
| `gid://shopify/Product/8905780756677` | EM-1 Machine | machine | `gid://shopify/Metafield/71185428021445` |
| `gid://shopify/Product/8905781248197` | JadeMaster, 14" | machine | `gid://shopify/Metafield/71185427759301` |
| `gid://shopify/Product/8905781412037` | LapMaster 12" | machine | `gid://shopify/Metafield/71185427660997` |
| `gid://shopify/Product/8905781477573` | LapMaster 18" | machine | `gid://shopify/Metafield/71185427628229` |
| `gid://shopify/Product/8905784131781` | SawMaster 18" | machine | `gid://shopify/Metafield/71185431855301` |
| `gid://shopify/Product/8905784197317` | SawMaster 24" | machine | `gid://shopify/Metafield/71185431822533` |
| `gid://shopify/Product/8905784262853` | SawMaster, 36" | machine | `gid://shopify/Metafield/71185431789765` |
| `gid://shopify/Product/8905784328389` | ShapeMaster 6" | machine | `gid://shopify/Metafield/71185431756997` |
| `gid://shopify/Product/8905785344197` | TrimMaster | machine | `gid://shopify/Metafield/71185433755845` |
| `gid://shopify/Product/8905785868485` | TumbleMaster | machine | `gid://shopify/Metafield/71185433526469` |

## Current Epic F eligibility

The [current Shopify eligibility](../qa/evidence/epic-f/2026-10-05-e-mut-021-current-eligibility.json) consumes actual post-smoke Admin values, exact approved mappings and source-bound E-MUT-020/021 receipts. Fixture classification is not used. Runtime routing/projection files were not regenerated. F7 historical plans remain historical; this current projection supersedes their definition/classification prerequisites, while preserving their exclusions and lack of assignment authorization. F8 current aggregation records approved native terms, complete repository/unpublished shell, Partial 014B, Deferred 015B, blocked/unexecuted 017B and unbegun 018B. Governed factual grants remain **0**.

| Candidate | Live class | Definitions | Grants | Preview template | Suffix | Live template | Assignment |
|---|---|---:|---:|---|---|---|---|
| BeadMaster 6" | machine | 38/38 | 0 | Present | null | Absent | Blocked; GO absent |
| EM-1 Machine | machine | 38/38 | 0 | Present | null | Absent | Blocked; GO absent |
| LapMaster 12" | machine | 38/38 | 0 | Present | null | Absent | Blocked; GO absent |
| LapMaster 18" | machine | 38/38 | 0 | Present | null | Absent | Blocked; GO absent |
| SawMaster 18" | machine | 38/38 | 0 | Present | null | Absent | Blocked; GO absent |
| SawMaster 24" | machine | 38/38 | 0 | Present | null | Absent | Blocked; GO absent |
| ShapeMaster 6" | machine | 38/38 | 0 | Present | null | Absent | Blocked; GO absent |
| TrimMaster | machine | 38/38 | 0 | Present | null | Absent | Blocked; GO absent |

The exclusions remain: **JadeMaster, 14"** (`gid://shopify/Product/8905781248197`), **SawMaster, 36"** (`gid://shopify/Product/8905784262853`), **TumbleMaster** (`gid://shopify/Product/8905785868485`). All three are machine-classified, but excluded from F7. Conditional candidates: **8**; assignment-eligible targets: **0**; executable targets: **0**. A fresh complete protected before-read (maximum 900 seconds under the existing contract) and exact target-bound assignment authorization are required again for any future activation.

## Persistent preview verification

Preview `158631198917`, **Rhino Lapidary - Preview**, remains **UNPUBLISHED** with 426 files. Live `158579622085`, role **MAIN**, has 406 files. All 32 local deployment-source hashes and persistent preview checksums match E-MUT-020 binding. The real machine template, CSS and extracted dependencies remain present; no inline-preview snippet is present. Source drift: 0. Theme pushes/new preview sessions this task: **0**. Both complete theme inventories and identities remained unchanged through the final read completed 2026-10-05T20:07:27.665Z.

The [persistent smoke](../qa/evidence/epic-f/2026-10-05-e-mut-021-persistent-preview-smoke.json) tested all eight candidates at 390 px: **8/8 passed**. Machine structure, normal asset CSS, representative computed styles, title/price/quantity/purchase display, neutral Contact, native payment terms and zero factual modules passed. Page/Liquid errors: 0. Guard-blocked requests: 0. Sixteen existing Shop Pay/provider console errors (CSP framing restriction and 403, two per cell) remain recorded. No cart/Contact/checkout/order action occurred. Storefront password and cookies stayed in process memory; existing configuration was unchanged. This is bounded development smoke, not full 014B/015B release certification.

[Theme Editor](https://sz5dnk-nf.myshopify.com/admin/themes/158631198917/editor) · [Preview root](https://sz5dnk-nf.myshopify.com?preview_theme_id=158631198917)

- [BeadMaster 6"](https://sz5dnk-nf.myshopify.com/products/beadmaster?preview_theme_id=158631198917&view=machine)
- [EM-1 Machine](https://sz5dnk-nf.myshopify.com/products/em-1?preview_theme_id=158631198917&view=machine)
- [LapMaster 12"](https://sz5dnk-nf.myshopify.com/products/lapmaster-12?preview_theme_id=158631198917&view=machine)
- [LapMaster 18"](https://sz5dnk-nf.myshopify.com/products/lapmaster-18?preview_theme_id=158631198917&view=machine)
- [SawMaster 18"](https://sz5dnk-nf.myshopify.com/products/sawmaster-18?preview_theme_id=158631198917&view=machine)
- [SawMaster 24"](https://sz5dnk-nf.myshopify.com/products/sawmaster-24?preview_theme_id=158631198917&view=machine)
- [ShapeMaster 6"](https://sz5dnk-nf.myshopify.com/products/shapemaster?preview_theme_id=158631198917&view=machine)
- [TrimMaster](https://sz5dnk-nf.myshopify.com/products/trimmaster?preview_theme_id=158631198917&view=machine)

Links remain stable and force `view=machine`; existing storefront authentication is required. No credential is included.

## Next activation decision

The exact remaining technical blocker is that `product.machine` exists on the unpublished preview but is absent from the current live theme. Product suffix is store-level; it does not select the unpublished theme. [Shopify documents](https://help.shopify.com/en/manual/online-store/themes/theme-structure/templates) that normal Admin assignment lists use the live theme and that deleted assigned templates fall back to the default. This supports an **inference** of default Product fallback if a machine suffix were stored while its live template is absent; this exact hypothetical was not mutated.

[ProductUpdateInput](https://shopify.dev/docs/api/admin-graphql/2026-10/input-objects/ProductUpdateInput) exposes templateSuffix as String but does not document acceptance/rejection for a suffix absent from live. Therefore API acceptance is **not established**; no experimental assignment was attempted. The [decision evidence](../qa/evidence/epic-f/2026-10-05-e-mut-021-template-activation-decision.json) preserves this qualification.

Recommended next action: prepare and authorize a selective deployment plan for the machine template and reviewed dependency closure into the **existing live theme**, with exact source diff, remote backup/rollback and default-Product/non-machine/global regression. This can avoid publishing the entire preview theme, but shared sections/CSS may affect live pages, so safety must be reviewed before any production write. Only afterward consider separately authorized, fresh-read-bound F7 assignment of the eight candidates. Continue using current preview links until that decision. No production deployment, assignment or publication was authorized or executed here.

## Validation and remaining boundaries

| Command | Exit / result |
|---|---|
| `node scripts/validate-epic-e-batch-2b.js` | 0 |
| `node scripts/validate-epic-e-batch-4a.js --plan=E-MUT-021` | 0 |
| `node scripts/test-epic-e-admin-mutation-plan.js` | 0 |
| `node scripts/test-epic-e-batch-4a.js` | 0 |
| `node scripts/validate-epic-f-consumer.js` | 0 |
| `node scripts/test-epic-f-consumer.js` | 0 |
| `node scripts/validate-epic-f-machine-template-rollout-plan.js` | 0 |
| `node scripts/test-epic-f-machine-template-rollout-plan.js` | 0 |
| `node scripts/validate-epic-f-machine-page-readiness.js` | 1; initial unbound invocation; corrected bound command below passed |
| `node scripts/validate-json-registers.js` | 0 |
| `node scripts/validate-hardcoded-strings.js` | 0 |
| `RHINO_EPIC_F_CLEANUP_BINDING=docs/qa/evidence/epic-f/release-gate-cleanup-source-binding.json node scripts/validate-epic-f-machine-page-readiness.js` | 0 |
| `node scripts/test-e-mut-021-development-execution.js` | 0; 151 passed |
| `node scripts/test-e-mut-021-reconciliation.js` | 0; 11 passed |
| `node scripts/validate-e-mut-021-execution-reconciliation.js` | 0 |
| `node scripts/run-epic-e-gates.js --mode=admin --plan=E-MUT-021 --before=docs/qa/evidence/epic-e/E-MUT-021-2026-10-05-before-admin-snapshot.json --snapshot=docs/qa/evidence/epic-e/E-MUT-021-2026-10-05-after-admin-snapshot.json --output=docs/qa/evidence/epic-e/E-MUT-021-2026-10-05-after-drift.json` | 0 |
| `node scripts/refresh-epic-f-current-shopify-eligibility.js` | 0 |
| `node scripts/test-epic-f-current-shopify-eligibility.js` | 0; 68 passed |
| `node scripts/smoke-epic-f-persistent-development-preview.js --classification-smoke` | 0; 8 passed |
| `Shopify CLI 4.8.3 theme check --path . --fail-level warning --output json` | 0 |
| `git diff --check` | 0 |

Theme Check: zero errors, zero warnings, exit 0 at the unchanged warning fail level. F8 requires the established cleanup binding; the initial unbound result and passing corrected invocation are both retained. Existing CSV/fixture ownership and hardcoded-string diagnostics remain separate. Historical validators still describe their original authorization state; the new bounded execution journal is the operational authority.

Epic E remains incomplete outside classification/definitions: technical facts; measurements/dimensions; compatibility; BOM/contents; recommendations; fulfillment/pickup/timing; warranty/service; resources. F-DEC-001 remains **APPROVED_OPTION_A**. F-PBI-014B remains **Partial**, preserving local/storefront-owned accessibility and toolbar ownership evidence plus assigned/release parity and unavailable real Variant/pickup gaps. F-PBI-015B remains **Deferred**, F-PBI-017B **Blocked/not executed**, and F-PBI-018B **Not begun**. Product assignments, live-theme mutation and production publication: **0**.

The [consolidated summary](../qa/evidence/epic-e/E-MUT-021-2026-10-05-development-execution-summary.json) inventories all evidence/tooling/current-status files and source hashes. New tooling is the exact-plan execution contract and tests, reconciliation and corruption tests, current live eligibility projection/tests, and a new smoke output mode that preserves E-MUT-020 evidence. Current status artifacts are updated; historical plans and runtime source files are unchanged.

The [final local audit](../qa/evidence/epic-e/E-MUT-021-2026-10-05-final-local-audit.json) verified historical authorities, E-MUT-020 snapshot hashes and all 32 runtime source hashes unchanged. Across new task evidence/tooling it found zero token, credential-field or signed-preview-URL patterns. Stable preview links are intentionally retained. All 122 final suffixes remain null.
