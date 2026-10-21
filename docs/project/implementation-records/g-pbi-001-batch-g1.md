# G-PBI-001 — Batch G1 implementation record

**Date:** 2026-10-16. **Recommended status:** COMPLETE for the bounded repository foundation.
**Scope:** G-PBI-001 only. G2 UI/navigation, G-PBI-006 commerce execution, Shopify mutations and theme deployment were not performed.

## 1. Files created or modified

Created:

- scripts/lib/epic-g-foundation.js — thin E/F eligibility/readiness consumer.
- scripts/lib/epic-g-admin-read.js — narrow Product/Variant reads through E's existing paginator and transport injection.
- scripts/audit-epic-g-admin.js — existing-credential capture or digest-bound connected-tool transcript import.
- scripts/validate-epic-g-foundation.js and scripts/test-epic-g-foundation.js.
- schemas/epic-g-foundation-read.schema.json, epic-g-foundation-report.schema.json and epic-g-foundation-fixture.schema.json.
- tests/fixtures/epic-g-foundation.json — explicitly offline nine-Product/nine-Variant fixture; fixture approval IDs cannot authorize live data.
- [ADR-0002](../../architecture/adr-0002-epic-g-default-product-template.md) and [consumer contract](../../architecture/epic-g-foundation-contract.md).
- [G1 evidence directory](../../qa/evidence/epic-g/g1-2026-10-16/): raw reads, normalized read, queries, readiness JSON/Markdown, tests, exact command logs, operation accounting and protected-file checks.
- This implementation record.

Modified:

- scripts/lib/epic-e-admin-audit.js: optional read-only operation overrides and pageSize; existing defaults retained.
- scripts/validate-json-registers.js: one additional isolated G fixture schema target.
- package.json: audit:epic-g-admin, validate:epic-g-foundation and test:epic-g-foundation scripts.
- docs/rhino-lapidary-pbi-tracker-epic-g.md and docs/project/epic-g-proposed-backlog.json: G-PBI-001 completion/evidence only; all other PBIs remain proposed.
- docs/project/epic-g-required-decisions.md: received commercial information, explicitly separated from mapping approval and applied Shopify state.

Existing dirty workspace work was preserved. No machine-template, F consumer/compiler/renderer, homepage, theme asset, price, SKU allocation or historical receipt source was edited.

## 2. Architecture reused from E/F

- Epic F classification() consumes E class mappings, exact Product/Variant identities and Product Owner decisions.
- Epic E final owner delta loader verifies approval rows and the complete historical reconciliation/receipt chain.
- F binding verification and pure release compilation verify the deployed-source lineage and current owner grants.
- E freshness() and compareNative() provide observation freshness and protected native/metafield comparison.
- E runAdminAudit() supplies authenticated fetch integration, pagination, errors and snapshot structure. G adds two narrow enriched existing query shapes, not a second Shopify client.
- Existing native compatible_machines, included_products, optional_products and recommended_products fields retain independent meanings. No new graph or approval registry is created.

The observed F binding remains b90bf2089788e77c04fbdd5bd1766bc4d03cfb9e358179884a47b74095be949b. It is verified evidence, not perpetual authorization. The receipt remains unchanged and expires **2026-10-22T20:26:37.102Z**.

## 3. Eligibility contract behavior

The public authority token is opaque and held privately. Serialization/forgery and fixture authority applied to live data fail closed.

Product/Variant IDs, Product handles, current governed class/type/definition, Variant membership and exact complete Product-reference sets are checked. Reordering a set is allowed; duplicates, changed multi-machine membership, unknown/orphan references, missing approvals, stale/expired evidence, unsupported fields and reconciliation proof drift reject fit. A changed list never renders just its surviving approved subset.

sourceApproved, dataEligible, published and customerEligible are distinct. JadeMaster's nine edges remain approved current data with no customer destination. Saw Vice's two held relationships remain absent/ineligible; their expected absence is not drift, but populating either without authority is.

Included/optional/recommended observations never become fit grants. Optional SKU/media/description/attribute/resource absences are recorded per Product. nativeCommerce always preserves native Shopify behavior and never imposes a purchase hold or infers storefront availability from aggregate inventory.

Reasons are deterministic sorted unique uppercase codes. See the consumer contract and negative tests for examples. Current Admin and offline fixture modes are explicit. Replaying reads preserves original observation timestamps; no report regenerates approval or freshness.

## 4. Current catalog reconciliation

Actual connected Admin reads ran during G1: 13 Product pages and 13 Variant pages, all exhausted, with no partial nested connections. Shop identity matches the existing E receipt. Connector API version is not exposed and is recorded as null.

| Observation | Current G1 result |
|---|---:|
| Products / Variants | 122 / 125 |
| machine / replacement_part / consumable / accessory | 11 / 54 / 39 / 18 |
| G Products / Variants | 111 / 114 |
| G role-eligible Products | 54 parts / 39 consumables / 18 accessories |
| Approved compatibility values / directed edges | 39 / 40 |
| Customer-eligible edges | 31 |
| Approved unpublished-target edges | 9 |
| G Products without approved compatibility | 72 |
| Missing native G SKUs | 114 |
| Zero-priced G Variants | 6 |
| G Products without media / description | 24 / 5 |
| Class, reference, publication, native, commercial and discovery-count drift | 0 |

[Machine-readable readiness](../../qa/evidence/epic-g/g1-2026-10-16/readiness.json) includes exact per-Product/Variant coverage, missing optional attributes/resources, inventory observations, source provenance and expiry. [Compact summary](../../qa/evidence/epic-g/g1-2026-10-16/readiness.md) distinguishes current Admin reconciliation from fixture validation.

Counts are observations, not permanent authority. New/removed Products, Variants, classes or references are compared against E identities/approval and the historical discovery baseline. Unapproved changes cannot enter G by matching a title, tag, type, description, collection or family.

## 5. Negative tests

**43/43 tests passed.** Required scenarios include:

- Removed/revoked approval and expired/future/invalid receipt.
- Changed Product class or handle; title/tag/type inference cannot repair it.
- Missing/orphaned machine, unknown Product reference, duplicate reference, wrong reference type and proof/definition drift.
- Changed multi-machine list, including rejecting its otherwise valid subset.
- Unpublished source/target, with JadeMaster's approval retained separately from visibility.
- Unsupported Saw Vice reference and correct handling of expected absence.
- Included/optional/recommended references forbidden from granting compatibility.
- Optional SKU/media/description/resource absence without disabling native commerce.
- Missing/unknown source or target Variant membership.
- Incomplete outer/nested/repeated pagination, Admin errors, wrong shop and invalid accounting schema.
- Fixture isolation, forged authority, read transport unavailable, mutation/unknown dataset override rejection.
- Recorded observation timestamps preserved on reprocessing; discovery count differences do not create authority.

[Test evidence](../../qa/evidence/epic-g/g1-2026-10-16/tests.json) names each case and outcome. Existing E/F test implementations were not weakened or edited.

## 6. Commands and exit codes

Windows validation uses npm.cmd to select the installed npm executable without PowerShell script-policy changes. These are the exact successful command forms; evidence directory below is docs/qa/evidence/epic-g/g1-2026-10-16.

| Command | Exit |
|---|---:|
| npm.cmd run test:epic-g-foundation -- --output docs/qa/evidence/epic-g/g1-2026-10-16/tests.json | 0 |
| npm.cmd run validate:epic-g-foundation -- --fixture --output docs/qa/evidence/epic-g/g1-2026-10-16/fixture-readiness.json | 0 |
| npm.cmd run validate:epic-g-foundation -- --read docs/qa/evidence/epic-g/g1-2026-10-16/admin-read.json --output docs/qa/evidence/epic-g/g1-2026-10-16/readiness.json | 0 |
| npm.cmd run validate:registers | 0 |
| npm.cmd run validate:metafields | 0 |
| npm.cmd run validate:product-templates | 0 |
| npm.cmd run test:epic-e-admin-audit | 0 |
| npm.cmd run test:epic-e-batch-2b | 0 |
| npm.cmd run test:epic-e-pbi-009 | 0 |
| npm.cmd run test:epic-e-batch-3b | 0 |
| npm.cmd run test:epic-f-consumer | 0 |
| npm.cmd run validate:epic-f-consumer | 0 |
| npm.cmd run test:epic-f-context-delivery | 0 |
| node scripts/test-epic-e-owner-response-adapter.js | 0 |
| node scripts/test-epic-f-final-owner-delta.js | 0 |
| node scripts/test-epic-f-final-owner-release.js | 0 |
| node docs/qa/evidence/epic-g/g1-2026-10-16/verify-protected.cjs | 0 |

The three G checks were repeated after final G-only changes; latest tests report 43 passes. [Full command log](../../qa/evidence/epic-g/g1-2026-10-16/validation-commands.json) and [final command log](../../qa/evidence/epic-g/g1-2026-10-16/final-validation-commands.json) contain exact commands, exit codes and output paths, including the scoped git diff --check command (exit 0).

The first launcher attempt used npm through Windows PowerShell, where npm.ps1 was rejected before execution by existing script policy. All 13 affected npm commands returned 1; the three direct Node commands returned 0. [Preserved attempt log](../../qa/evidence/epic-g/g1-2026-10-16/launcher-attempt-commands.json) records this. The corrected npm.cmd run passed every command; no policy was bypassed or changed. No dependency failure was silently skipped. The unavailable environment Admin token was handled through actual connected-tool reads, not fixture substitution.

No browser/UI or deployment validation is claimed: no runtime UI changed. No parked F performance or final-release gate was reopened.

## 7. Shopify operation accounting

[Operation accounting](../../qa/evidence/epic-g/g1-2026-10-16/shopify-operations.json):

- 26 actual read-only Admin data queries: Product and Variant pagination.
- Three schema-read tool calls: QueryRoot, Product and ProductVariant.
- One documentation search and one GraphQL validation-helper call.
- The helper reported validation skipped; actual query execution validated the operations and returned successful results.
- Total Shopify tool invocations: 31. **Mutations: 0. Product/Variant/collection creation: 0.**
- Local normalization, validators and tests perform no additional Shopify requests.

The exact queries, variables, cursors, timestamps and returned data are preserved in connector-reads.json. The normalized envelope is bound to that transcript's SHA256. Read-only operation assertions reject mutations before transport.

## 8. Theme deployment accounting

**Theme pushes: 0. Publications: 0. Theme settings writes: 0.** No homepage, forward-fit UI or role navigation was implemented. ADR-0002 records continued use of templates/product.json and sections/main-product.liquid; no template assignments or specialized templates were created.

## 9. Protected F/runtime verification

[Before](../../qa/evidence/epic-g/g1-2026-10-16/protected-before.json) and [after](../../qa/evidence/epic-g/g1-2026-10-16/protected-after.json) checks cover 109 existing paths. The five allowed documentation/package/register edits are separated from **104 unchanged protected paths**. All **45 bound runtime paths** match their original hashes. Binding, source receipts, F source/compiler/renderer and machine architecture remain unchanged.

Existing F delta/release test commands reproduce deterministic historical test outputs; those outputs still match the existing F evidence manifest hashes. No historical receipt was renewed/replaced/rewritten. F-PBI-015B and F-PBI-018B stay parked/deferred.

## 10. Partial or blocked acceptance

**None for G-PBI-001's defined repository/current-read scope.** Its four tracker criteria are demonstrated.

Remaining observations are not G1 implementation failures: missing SKUs/media/descriptions/optional attributes/resources; nine unpublished JadeMaster destinations; two blocked Saw Vice edges; six zero prices. Their functionality/owner dependencies remain separate.

Received commercial information ($12 Arbor Wrench, $65.50 Automatic Feed Clamp, $5.75 LapMaster Lap Bolt; MR16 replacement/resale pending; unresolved Saw Vice mapping; no Trim Saw price) was recorded only as decision evidence. There is no approved new Product/Variant mapping or applied price change, and no invented purchase restriction. G-PBI-006 remains unimplemented.

## 11. Recommended status

**G-PBI-001 COMPLETE — bounded repository foundation, with actual current Admin reconciliation.** This does not complete Epic G or authorize future deployment, extend the receipt, certify checkout, or close Epic F.

## 12. Next batch

Proceed to **G2: G-PBI-002 and G-PBI-003**: safe ordinary Product/SKU/empty-state behavior and approved forward “Fits these machines.” Consume this foundation, native purchase controls and current E/F receipt; refresh observations when stale and stop fit at receipt expiry.

Do not wait for optional attributes, SKU allocation, Saw Vice creation, LapMaster variable-speed Variants, future 40-gallon TumbleMaster, F closure or parked release gates. Commercial decisions remain G-PBI-006; broader discovery is H after O and ownership/history reorder is O. No next batch was implemented here.

