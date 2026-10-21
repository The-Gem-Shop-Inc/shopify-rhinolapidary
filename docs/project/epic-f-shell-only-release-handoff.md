# Rhino Lapidary machine-page Shell-Only Release Execution Handoff

**State: preparation only. All execution authorizations are false.** No new Epic F PBI. The [Activation Readiness Review](epic-f-activation-readiness-review.md) and its [September 30 Admin audit](../qa/evidence/epic-f/activation-review-admin-audit.json) are the evidence authority. This document does not execute an E migration, push a theme, assign a Product template, activate facts or begin F-PBI-018B.

The smallest supported route through the existing contracts is larger than eight Product class writes: **E-MUT-020's full current 38-definition input, then E-MUT-021's catalog-wide 122-class input**, followed by a bounded preview code deployment and separately approved assignment of the eight F7 candidates. There is no supported F-only row subset executor. Machine-family **definitions** are included indirectly in the existing E-MUT-020 route; machine-family **records/membership values** are unnecessary for the shell and remain blocked/out of scope.

The [preparation index](../../data/epic-f-shell-only-release-preparation.json) records exact source hashes, migration row identities, deployment paths/hashes and the existing approval authorities. It is a read-only projection, not a new mutation plan, approval registry or executable input. Current plans are unchanged.

## Ready to ask for approval

The proposed scope, write boundaries and owner choices are concrete enough to review. **Execution GO is not yet ready:** fresh complete evidence, revalidated existing inputs, target-theme file backups/comparison and separately authorized execution work are still needed. Do not approve the expired observation as a before-read.

### Proposed eight-Product scope

| Product | Exact Product GID | Preview route | Exact E-MUT-021 row |
|---|---|---|---|
| BeadMaster 6" | gid://shopify/Product/8905779937477 | /products/beadmaster | product_class:gid://shopify/Product/8905779937477 |
| EM-1 Machine | gid://shopify/Product/8905780756677 | /products/em-1 | product_class:gid://shopify/Product/8905780756677 |
| LapMaster 12" | gid://shopify/Product/8905781412037 | /products/lapmaster-12 | product_class:gid://shopify/Product/8905781412037 |
| LapMaster 18" | gid://shopify/Product/8905781477573 | /products/lapmaster-18 | product_class:gid://shopify/Product/8905781477573 |
| SawMaster 18" | gid://shopify/Product/8905784131781 | /products/sawmaster-18 | product_class:gid://shopify/Product/8905784131781 |
| SawMaster 24" | gid://shopify/Product/8905784197317 | /products/sawmaster-24 | product_class:gid://shopify/Product/8905784197317 |
| ShapeMaster 6" | gid://shopify/Product/8905784328389 | /products/shapemaster | product_class:gid://shopify/Product/8905784328389 |
| TrimMaster | gid://shopify/Product/8905785344197 | /products/trimmaster | product_class:gid://shopify/Product/8905785344197 |

Each listed class row has exact approved desired value `machine`, authority PO-E-001 and historical before value absent/null. Intended template suffix is `machine`; every current observed suffix is null. Fresh evidence must replace that observation before execution. The eight are proposals, not eligible/executable targets: **current eligible=0; executable=0; both GO roles=false**. No Product-specific deterministic reason was found to reduce the eight-candidate proposal; shared execution prerequisites remain blocked for all eight.

Exclusions remain **JadeMaster** `gid://shopify/Product/8905781248197`, **SawMaster 36** `gid://shopify/Product/8905784262853`, **TumbleMaster** `gid://shopify/Product/8905785868485`. A status change does not remove an exclusion. Catalog-wide E classification includes these Products but does not assign their templates or authorize their publication.

### Shell behavior and zero grants

Permitted structural behavior: native Product identity/price, native Variant and quantity controls, native buy/sold-out behavior, native pickup, neutral Contact and suppressed factual modules. Native pickup/availability are not F operational promises. Native shipping-policy/tax/provider surfaces remain native and need integration review; they confer no warranty/freight approval.

Expected factual grants **before and after** are zero for each domain: media, specifications, contents, contextual/compatibility, delivery/timing, warranty/service, manuals, diagrams/instructions, videos and customer support_files. No fallback copy, legacy descriptions, recommendations, media captions or manual-derived values may populate an empty module. No custom financing promise is permitted.

## Exact minimum Epic E work under existing contracts

**A — Runtime definition need:** the approved classification path uses `CD-MF-001`, PRODUCT `rhino.product_class`, `single_line_text_field`, closed choices `machine/replacement_part/consumable/accessory`, public-read intent. The shell's generated routing snippet uses exact repository-approved GIDs; it does not read `machine_family` or technical metafields. Runtime simplicity does not waive F7 migration gates.

**B — Supported definition execution scope:** F7's policy requires `definitionMigrationVerified`, `productClassMigrationVerified`, `completeCurrentEReconciliation` and `consumerEligibilityVerified`; it does not enumerate a reduced definition list. The existing E-MUT-020 input contains all 38 approved missing definitions. The generator has no row selector; the validator compares generated bytes; `verifyAfterPlan` verifies **every input row**, and the F consumer accepts only hashed owning receipts. Therefore this handoff uses the **full existing E-MUT-020 input**, not a convenient product_class-only plan. This is the smallest supported existing route, not a claim that all 38 are read by the shell.

**C — Eight class rows:** the scope table identifies them exactly; each desired value is `machine`. They are eight rows within the 122-row owning input, not an independent migration.

**D/E — Catalog-wide class execution:** E-MUT-021's generator iterates all approved mappings; registry CD-MF-001 requires complete current catalog coverage of 122; the validator and Batch 4A tests preserve that coverage. `--plan=E-MUT-021` selects the **domain**, not Product rows. No existing supported `--products`, row-selector or partial-scope executor was found. The completion scope is all 122 approved Products: 11 machines, 54 replacement parts, 39 consumables and 18 accessories. Exact GID/value/decision rows are indexed from the owning input in the preparation index.

This does **not** require one atomic Shopify transaction. The owning plan explicitly allows bounded batches, success journaling, throttle-aware resume and completion of unresolved deterministic rows. Partial progress is not a reconciled whole-plan receipt and does not satisfy F7. Do not invent an eight-Product F migration to bypass full coverage.

**Contract/test sources:** [Batch 4A generator](../../scripts/build-epic-e-batch-4a.js), lines 73–93 (ordered approved definitions, all approved class mappings, domain input and rollback); [validator](../../scripts/validate-epic-e-batch-4a.js), lines 20 and 35 (exact generated artifact and 122 coverage); [tests](../../scripts/test-epic-e-batch-4a.js), lines 12 and 15 (122 class/38 definition assertions); [after-state verifier](../../scripts/lib/epic-e-readiness.js), `verifyAfterPlan`; [F consumer](../../scripts/lib/epic-f-consumer.js), `loadContext/evaluate`; [F7 policy](../../data/epic-f-machine-template-rollout-policy.json), `prerequisites`.

### machine_family classification

**Required before shell assignment indirectly through the currently supported full E-MUT-020 receipt.** CD-MO-001 `machine_family` and CD-MF-002 PRODUCT `rhino.machine_family` are two of that input's rows. CD-MF-002 depends on the exact returned/audited CD-MO-001 definition GID. The shell renderer itself does not require family data. E-MUT-025 family records/references and FAMILY-MAPPINGS approval are **required only for later family activation**, not this shell route. No family instance or Product membership value is included here.

This is a tooling/receipt consequence of the sources above, not an invented F7 family eligibility boolean. A future narrower definition execution would need an explicitly supported owning E contract; this handoff neither creates nor approves one.

### Exact E-MUT-020 definition identities

The full ordered list is also hashed in the preparation index. All metafields below are owner PRODUCT, namespace `rhino`; CD-MO-001 is the metaobject type. Desired types/access/validations/descriptions come unchanged from the owning input/registry, not a new definition specification.

| Definition ID | Exact key/type identity |
|---|---|
| CD-MO-001 | METAOBJECT type machine_family |
| CD-MF-001 | product_class |
| CD-MF-002 | machine_family → CD-MO-001 |
| CD-MF-010 | input_voltage |
| CD-MF-011 | input_frequencies |
| CD-MF-012 | motor_power |
| CD-MF-013 | motor_speed |
| CD-MF-014 / 015 | wheel_speed_min / wheel_speed_max |
| CD-MF-016 / 017 | flex_shaft_speed_min / flex_shaft_speed_max |
| CD-MF-018 / 019 | blade_diameter_min / blade_diameter_max |
| CD-MF-020 | wheel_diameter |
| CD-MF-021 / 022 | blade_arbor_diameter / wheel_arbor_diameter |
| CD-MF-023 | water_reservoir_capacity |
| CD-MF-024 / 025 | cutting_oil_fill_min / cutting_oil_fill_max |
| CD-MF-026 | water_system_type |
| CD-MF-027 | net_weight |
| CD-MF-028 / 029 / 030 | assembled_length / assembled_width / assembled_height |
| CD-MF-031 / 032 / 033 | crate_length / crate_width / crate_height |
| CD-MF-034 | compatible_machines |
| CD-MF-035 / 036 / 037 | included_products / included_quantities / noncatalog_components |
| CD-MF-039 / 040 | optional_products / recommended_products |
| CD-MF-041 / 042 / 043 / 044 / 045 | manual_files / diagram_files / instruction_files / video_files / support_files |

Creating an approved definition does not approve/populate its factual value, grant Product media/resource use or make support_files customer-permitted. Blocked/unapproved registry definitions outside these 38 are excluded.

### Future E-MUT-020 execution envelope

- Existing plan: [E-MUT-020](../../data/epic-e-migration-plans/E-MUT-020-definitions.json), SHA256 `191445f8511123ba64903ae514d24e3043a5da2d5345cc6c57b1f73b3d866551`.
- Existing input: [definitions input](../../data/epic-e-migration-plans/E-MUT-020-definitions-input.json), SHA256 `c211f7c6258eedea6eed7d0ce64bb9272c70160f91d11b08e770474f2cd43edb`.
- Exact shop: `gid://shopify/Shop/79279947973`, `sz5dnk-nf.myshopify.com`. Domain allowlist remains `metafieldDefinition`, `metaobjectDefinition`; exact intended writes are the 38 approved input rows above in dependency order. No values, family records, Product fields or theme changes bundled.
- Expected before: absent definitions from dated evidence; refresh and compare every exact identity/type/access/validation/dependency before GO. Existing definitions must become verified no-ops or drift requiring re-review, never delete/recreate. A fresh snapshot may change the owning generated input/hash; GO must bind the **then-current** hash, not these historical before rows.
- Expected after: exact approved definitions, access/validations and returned definition GIDs reconciled; all 38 original desired identities accounted for, dependency GID resolved without fabrication. No factual values populated.
- Approval slots: existing plan `approvals` → Product Owner and Shopify Admin Owner, both `granted=false`, timestamps/evidence null. Future governed records must bind planId, inputSha256, ownerRole, decision=GO and recordedAt. **authorization=false** in this preparation; no adapter invoked.
- Current blockers: no complete fresh E Admin audit; compare-before-write not revalidated; both GO roles absent; reference GID ordering unresolved; execution/decision state blocked. Existing tools prepare/validate/read; they do not provide a migration executor. Separately authorized execution work must address that under existing E scope.
- Rollback: existing `compensating_mutation` plan and exact per-row records. Record created GIDs; compensate only this run's creations after proving zero values/inbound references, reverse dependency order and no concurrent drift. Otherwise retain definitions and request separately approved compensation. Deletion/recreation cannot preserve identity after references exist.
- Post-write: record success/error journal and exact returned IDs; requery complete after state, save `docs/qa/evidence/epic-e/E-MUT-020-after-admin-snapshot.json`, run the owning read-only drift comparison and save `E-MUT-020-after-drift.json`. Top-level GraphQL/transport/userErrors fail the relevant batch; HTTP 200 is not success.

### Future E-MUT-021 execution envelope

- Existing plan: [E-MUT-021](../../data/epic-e-migration-plans/E-MUT-021-product_class.json), SHA256 `4ca2e89b2497268977ca8015b9b5353fc1757f252e78b7247ebb0c29c9a16f9d`.
- Existing input: [class input](../../data/epic-e-migration-plans/E-MUT-021-product_class-input.json), SHA256 `d1aa54a482f1ac786f8e616eede866c790ebe123f8d557dfb6b2c0de076614e1`.
- Scope: all 122 exact approved GID/value rows from that input; eight shell rows highlighted above. Same exact shop ID/domain. Write allowlist **`PRODUCT.metafields.rhino.product_class` only**. No title/handle/category/Vendor/SKU/price/inventory/status/publication/template/media mutation.
- Expected before: owning per-row absent/value/metafieldGid records must be freshly read. September 30 confirms absent class only for the 11 machines; it does not establish current before state for the other 111 Products. Abort/re-review unknown/missing owners, identity drift, conflicting values or concurrent changes.
- Expected after: each of 122 approved values present with exact type/value and owner identity, existing metafield IDs preserved where present; no unrelated changes. No technical/family/BOM/compatibility/operational/warranty/resource values populated.
- Both GO slots reuse the existing plan `approvals`; currently false/null. GO binds refreshed plan/input/hash and dated owner evidence after definition verification. **authorization=false**. Current blockers: all E-MUT-020 blockers as applicable, definitions not created/verified, complete catalog before-read absent, compare-before-write and both GO roles missing; no executor in the repository planning tools.
- Rollback: existing `partially_reversible` per-row compensation. Restore prior value on the same Product/metafield identity only after comparison with this run's after value. For prior absence remove only this run's created value, preserving unrelated/concurrent data. Separate compensation approval; no guessed rollback values. Bounded journaling/resume is supported in intent; the full 122-row completion gate remains.
- Post-write: complete exact owner/metafield after-read, journal/hash, `E-MUT-021-after-admin-snapshot.json` and owning `E-MUT-021-after-drift.json`, unchanged native/protected fields. Reconcile all rows before F eligibility/assignment GO.

### Required receipts and freshness

Existing E freshness is the exact **seven-day** complete-snapshot policy, not F7's 900 seconds. Execution also requires compare-before-write against actual current values; this handoff does not extend either policy. `assessAdmin(..., refreshAvailable=true)` requires error-free, duplicate-free complete records for all 16 datasets: products, variants, Product/Variant/Collection definitions, metaobject definitions, deliveryProfiles, locations, markets, variantFulfillment, deliveryConfiguration, pickupConfiguration, marketRegions, policyPages, shopPolicies, files, machineFamilies. Current baseline scope is 122 Products/125 Variants; new/missing identities require drift review. The narrow September 30 read cannot satisfy it.

For each of E-MUT-020 and 021, the existing plan must bind real hashed fresh `currentReadSnapshot`, deterministic input, before/rollback and passed dry-run artifacts; dated dual GO records; success IDs/journal; hashed `afterSnapshot` and `driftValidation.expectedArtifact`; completed execution and passed drift state. `verifyAfterPlan` must return `matchesExpectedState=true` for the full owning rows, with no unexpected native changes. Refresh owning E Admin/downstream readiness truthfully: definitions/class verified, blocked factual lanes still blocked. There is no requirement to complete every blocked factual migration merely to obtain a complete read.

Owning read-only commands for future evidence (not executed against a live after state here):

```text
node scripts/validate-epic-e-admin-snapshot.js <fresh-snapshot-path>
node scripts/validate-epic-e-batch-4a.js --plan=E-MUT-020
node scripts/validate-epic-e-batch-4a.js --plan=E-MUT-021
node scripts/run-epic-e-gates.js --mode=admin --plan=E-MUT-020 --as-of=<actual-UTC> --before=<fresh-before-path> --snapshot=<020-after-path> --output=<020-drift-path>
node scripts/run-epic-e-gates.js --mode=admin --plan=E-MUT-021 --as-of=<actual-UTC> --before=<fresh-before-path> --snapshot=<021-after-path> --output=<021-drift-path>
```

These are checks, not mutation commands. The current Batch 4A validator deliberately validates blocked/non-executable preparation; future completed/GO receipt integration must respect the owning E lifecycle, not merely edit flags until preparation checks look green. The F consumer's `loadContext` admits receipts only when before/after/drift files exist and match their SHA256 bindings; `evaluate` additionally checks freshness, exact approval/value/type, completed plan, passed drift and owning audience/readiness. Rebuild existing routing and zero-grant projections after source reconciliation; refresh their hashes. Do not populate grants or add an F approval registry.

## Preview deployment envelope

Target: **`158631198917` / `gid://shopify/OnlineStoreTheme/158631198917` — Rhino Lapidary - Preview**, role UNPUBLISHED, observed update `2026-08-27T18:04:28Z`. Source: September 30 theme audit and `shopify.theme.toml` preview environment. The machine template was absent. Production theme **`158579622085`** (`shopify-rhinolapidary/main`, MAIN) is explicitly excluded.

**Theme code push to this unpublished theme is theme-isolated. Product.templateSuffix assignment is a store-level Product mutation, NOT theme-isolated.** E definitions/class are also store-level. Published Products' assignments can affect production behavior even when only preview code was pushed; the production theme currently lacks this suffix. Both assignment owners must review that impact and actual production fallback behavior. Do not promise preview-only assignment or unchanged production presentation.

**Assignment-method prerequisite:** Shopify's Admin template dropdown lists templates available in the live theme. Since `product.machine.json` is absent there, preview deployment alone does not establish an Admin UI assignment path. The Admin API exposes `templateSuffix`, but the documentation does not establish that this shop can safely assign a suffix existing only in preview. Future 017B must verify its supported execution method and production implications before GO; this handoff does not authorize a trial write or production-theme workaround. Sources: [Shopify template assignment and preview instructions](https://help.shopify.com/en/manual/online-store/themes/theme-structure/templates), [ProductUpdateInput](https://shopify.dev/docs/api/admin-graphql/latest/input-objects/ProductUpdateInput).

After a separately approved preview push, the theme editor can inspect an alternate Product template with a selected Product without changing its assignment. That can provide an earlier structural inspection for these same eight Products. It does not prove assigned-route behavior, satisfy F7's assignment gates or constitute 014B/015B release certification. No editor inspection was performed here.

The whole starting-theme hash and existing dependency contents are **unknown**, not guessed. Before push approval: refresh exact shop/theme ID/role/update/version, capture a restorable before-theme backup and hashes/existence for every proposed path, inspect required native dependency compatibility and preserve target-owned settings/app embeds. Any drift, missing base dependency, unsupported block or wrong theme requires review/rebinding of the same proposed envelope. The 28-file list below is the exact proposed F code write boundary; it is conditional on the existing native base being verified. It is not proof that 28 blindly pushed files suffice on an uninspected theme.

### MUST DEPLOY FOR SHELL — exact proposed 28-file allowlist

```text
assets/rhino-custom.css
layout/theme.liquid
locales/en.default.json
locales/en.default.schema.json
sections/cart-notification-product.liquid
sections/main-cart-items.liquid
sections/main-product.liquid
sections/predictive-search.liquid
snippets/card-product.liquid
snippets/cart-disclosure-indicator.liquid
snippets/cart-drawer.liquid
snippets/meta-tags.liquid
snippets/product-disclosures.liquid
snippets/product-media-modal.liquid
snippets/rhino-machine-contents.liquid
snippets/rhino-machine-contextual.liquid
snippets/rhino-machine-delivery.liquid
snippets/rhino-machine-resources.liquid
snippets/rhino-machine-specifications.liquid
snippets/rhino-machine-support.liquid
snippets/rhino-product-consumer-route.liquid
snippets/rhino-product-context-delivery-projection.liquid
snippets/rhino-product-description.liquid
snippets/rhino-product-fact-projection.liquid
snippets/rhino-product-media-eligibility.liquid
snippets/rhino-product-structured-data.liquid
snippets/rhino-product-support-resources-projection.liquid
templates/product.machine.json
```

JSON-LD containment requires `rhino-product-structured-data`. Shared layout/meta/cart/search guards are included because F1 containment is broader than the Product section. Each is a whole repository file, not a line patch. Their hashes bind current planning sources; routing/projection files must be rebuilt and rebound after E reconciliation. Selecting payment suppression also requires a separately authorized code change/new hash, described below. No source file was changed in this task.

### Required native base — verify in place, do not blindly redeploy

Dependency tracing uses actual Liquid render/asset references, CSS asset references and header/footer groups, with F1–F7 manifests distinguishing governed changes. The exact hashed 127-file **static branch superset** is `previewEnvelope.nativeDependencyVerification` in the index; it is a verification inventory, not a second push allowlist. Native branches are conditional on preserved target settings and Product state. No native file may be silently added to the 28-file approval if absent/incompatible: stop and re-review the bounded deployment set.

Core native dependencies include `assets/product-info.js`, `product-form.js`, `pickup-availability.js`; `constants.js`, `pubsub.js`, `global.js`, `standard-actions-override.js`; base/main-product/price/accordion/slider/rating/deferred-media/pickup CSS; Variant-picker/swatch CSS and snippets; `price`/`unit-price`/`buy-buttons`/`loading-spinner` and quantity/control SVGs. Layout/global chrome additionally depends on existing header/footer groups and sections, cart notification/drawer/disclosure helpers, predictive search, localization, browser assets, breadcrumbs, `rhino-storefront.js`, native cart CSS/JS and brand/social assets. Layout preserves existing native StandardEvents behavior; this is not F analytics instrumentation authorization.

Settings/schema checks: `main-product` includes the machine_contact block schema; English schema key `sections.main-product.blocks.machine_contact.name` and storefront key `products.product.machine_contact` are in the allowlist locales. Native settings must support `color_schemes.scheme-1`, typography/body scale, cart/search and existing header/footer groups. **Do not push `config/settings_data.json` or replace app embeds.** Inspect existing settings_schema/settings_data and group files; preserve target configuration. The selected preview test scope is the default English routes. Other locale keys/files are retained in repository and target; they are not approved for a broader multilingual release by this handoff.

### PRESENT IN REPOSITORY BUT NOT REQUIRED FOR ZERO-GRANT SHELL

Other F1 customer surfaces outside the selected shell paths (for example featured-product/quick-order-list-row), non-English locale files, optional share/complementary/volume/gift-card/model branches, fixture data/schemas/scripts and documentation do not become deployment requirements merely because a batch manifest lists them. The branch inventory preserves them for dependency inspection where the target's native configuration actually uses them; do not activate those template blocks or invent shell copy.

### FACT-ACTIVATION-ONLY machine paths

`snippets/rhino-machine-specification-row.liquid`; gallery/media/thumbnail snippets; media-gallery/product-modal/product-model scripts, model-viewer CSS and model/play/zoom assets are dormant on the zero-grant machine path. The hover/magnify branch is disabled by the template's lightbox setting. Gallery media grants remain zero. Six top-level fact renderers **are** deployed because the zero projections call them, but their guarded inner row/card/resource paths remain dormant. Their presence is not activation.

### Future push approval and rollback

`themePushAuthorization=false`, `bundledProductMutation=false`. Ask separately for only the verified preview theme, final bounded paths/hashes and unchanged target settings. Require current Theme Check (`shopify theme check --fail-level warning`) and applicable local/source containment checks before approval. Use explicit file targeting and preserve non-allowlisted files; never an unbounded whole-repository push or production target. No CLI push command was run here.

After authorized push, reread exact target file identities/checksums/bodies as necessary and compare every allowlisted path with final staged source; verify machine template/section/snippets/locales/assets exist, no Liquid errors, and no non-allowlisted theme/config files changed. Capture actual resulting theme version/update time; this does not assign Products. Rollback/redeploy uses the saved **target** versions and recorded prior absence, on the same unpublished theme only, with separate authority for any compensating removal of newly introduced paths. Preserve concurrent edits and production; do not use a broad delete/recreate or publish a backup theme.

## Needs owner decision first — F-DEC-001

Exactly two choices remain open; `choice=null`. Neither adds Rhino-authored financing/installment copy.

| Choice | Implementation/code consequence | Admin mutation | Accessibility and parity consequences |
|---|---|---|---|
| A. Retain native provider-owned payment_terms | Existing main-product price block's installment Product form and `form \| payment_terms` remain. No new toggle/code needed. | No payment/provider configuration mutation; separately approved preview code deployment still needed | Verify provider output, focus/keyboard/zoom, Variant updates and request attribution in actual Shopify; no universal eligibility promise |
| B. Suppress native payment_terms on machine pages | There is **no existing suppression toggle** in the machine template/section schema. A future separately authorized F-PBI-013 Liquid change must guard the entire installment form/wrapper by machine-template scope; preserve native terms elsewhere. Rebind main-product hash and rerun affected local/parity checks. | No payment/provider configuration mutation; theme code changes only | Verify no empty installment wrapper, terms/focus targets or reappearance on Variant/AJAX section updates. Native `product-info.js` references installment inputs; actual parity must verify absence is handled |

Owners: Business/Product Owner and Shopify Admin Owner; Legal reviews additional explanatory claims, which are not proposed. Existing `show_dynamic_checkout=false` controls accelerated checkout, **not** payment_terms visibility; do not misuse it as the suppression decision. A retain/suppress choice is not E execution GO, push approval or assignment GO.

## Future F-PBI-017B assignment envelope — existing plan only

Consume [F7 plan](../../data/epic-f-machine-template-rollout-plan.json) and [policy](../../data/epic-f-machine-template-rollout-policy.json), ID `F-017A-machine-template-v1`, current plan hash `e69138cf06cdab34f7560058d156dfe0f4f042cc94d395582dd55fde1cfd7146`. Proposed targets are exactly the eight listed Products; exclusions stay intact; suffix `machine`; exact write allowlist **templateSuffix only**; bundled actions empty; authorization=false.

Before future assignment, read **all 11** governed Products and exact preview theme immediately before execution, age ≤900 seconds, `evidenceKind=fresh_bounded_read`, environment shopify-admin, exact shop/source digest. Include status; all publications/customer visibility and publicationsDigest; suffix with null/empty distinction; approved class identity/decision/sourceDigest and actual live `machine`; updatedAt/resource version; exact theme ID/template existence and repository SHA256; full protected field coverage.

The existing `validateBefore` checks the live machine class for all 11 rows, including exclusions; eight migrated class rows alone cannot satisfy that check. Exclusions remain excluded from assignment. Also resolve the assignment-method prerequisite above: neither an available preview template nor the API input field alone proves an executable, safe assignment path.

The protected digests are title, descriptionHtml, variants, options, vendor, category, tags, metafields, media, seo, shippingProfile, publications, status, publishedAt, onlineStoreUrl. Variant/options digests must cover protected price/SKU/barcode/inventory/inventory policy/weight/configuration; no aggregate substitutes. Every digest must be non-null, fieldCoverageComplete=true. Nonexcluded targets must be ACTIVE with publishedAt and **verified_visible** customer state; September's null URL/native availability is insufficient. Fresh drift may block individual candidates; do not silently omit a Product from the approved exact target set.

E migration and refreshed eligibility will intentionally change previously hashed sources; the old historical plan cannot be made executable simply by flipping GO flags. Re-review/rebaseline the **same existing F7 planning contract**, preserving exact scope/exclusions, with new source/before/policy/plan hashes when authorized. No second rollout plan is created here. `validatePlan` currently compares the historical fixture; `executionBlockers` always retains a separately authorized 017B implementation/execution blocker. The current module is a pure validator, not an execution adapter. Future 017B execution work must provide the authorized path and bind real human evidence; repository readiness does not supply it.

Both existing policy approval slots must bind then-current planId/planHash, exact eight target GIDs, complete beforeDigest and dated role-owned GO evidence after the before-read. If the read expires while approvals are obtained, refresh/re-review/rebind. One role alone is insufficient.

Rollback prior suffix is **observed null for all 11**, but executable rollback must use each exact **fresh** prior suffix; never hardcode the September value. Only restore this run's assigned suffix after comparing current value and protected fields; preserve null versus empty/custom values and abort on concurrent drift. After-read all 11; `validateAfter` verifies the eight suffixes, excluded unchanged suffixes and identical protected/native data, with only legitimate update/version advancement. Rollback authority is explicit, not presumed.

**Assignment is store-level, NOT theme-isolated**, even though preview deployment is theme-isolated. The approval includes that published-Product impact and production fallback verification; production theme publication remains separately false.

## Dependency-safe future execution order

These are future gated actions, not steps executed by this task:

1. Select/document F-DEC-001 A or B. If B, separately authorize and verify its bounded existing-PBI code change before freezing deployment hashes.
2. Obtain a fresh complete E read, compare exact definitions/catalog identities and refresh/revalidate existing E inputs/rollback hashes under owning E lifecycle. These steps precede migration GO; the September audit is not sufficient.
3. Obtain separate dual GO for E-MUT-020 and its exact current input hash, plus explicit execution authority/path.
4. Execute the existing full applicable definition input in dependency order; journal progress/errors and preserve returned IDs.
5. Fresh after-read, definition diff and full E-MUT-020 reconciliation/receipt.
6. Re-read/revalidate catalog class before state after definitions; obtain separate dual GO for E-MUT-021/current input hash.
7. Execute bounded batches/resume for the complete 122 approved class rows; no unrelated fields.
8. Fresh after-read and full class reconciliation/receipt; update owning source bindings/readiness without closing blocked facts.
9. Rebuild existing F routing/zero-grant consumer eligibility/projections and validate current E/class prerequisites; rebind deployment hashes. Facts remain suppressed.
10. Fresh exact preview/theme-file/base/settings audit and backup; Theme Check and source/fixture checks; separately approve final preview file set.
11. Push only the approved bounded file set to the unpublished preview theme, with no Product mutation bundled.
12. Verify exact pushed files, preserved base/settings and resulting preview identity. Optional theme-editor alternate-template inspection may happen without assignment. Resolve the supported assignment method and production fallback implications before store-level assignment GO; the Admin UI's live-theme dropdown restriction is not bypassed by preview deployment.
13. Obtain complete fresh F7 protected before-read for all 11; verify current visibility, class, theme/template, no unexplained drift and rollback readiness; rebaseline/review existing F7 contract as necessary.
14. Obtain both role-owned exact-plan/target/before GO records and separate 017B assignment authorization within freshness; refresh/rebind if necessary.
15. Assign only the eight approved exact Products, templateSuffix only, using the separately authorized execution path.
16. Complete after-read/unchanged-field verification; record rollback readiness and compensate only if separately authorized.
17. Run authorized Shopify-rendered shell-only parity and applicable F-PBI-014B journeys.
18. Run separately authorized selected-scope F-PBI-015B release performance using unchanged budgets/protocol.
19. Begin F-PBI-018B only when separately authorized and its selected-scope evidence/owner signoffs exist.
20. Separate production go/no-go; no publication permission flows from any preceding GO.

Preview base inspection and owner decisions can proceed independently during preparation. Deployment does not technically consume live class values in Liquid routing, but this handoff retains the E-first ordering needed by the existing assignment contract and hash refresh, rather than prematurely pushing stale projections.

## Shell claim containment proof and future preview matrix

Repository proof is source-bound to F1–F8 plus the readiness review; current production containment is not claimed. `rhino-product-media-eligibility` has no eligible output; main-product filters media to none, removes gallery column and skips media/gallery scripts. Product-media-modal is still called but its zero-media wrapper guard suppresses it. The three generated fact/context/support projections set their inputs to nil. All six top-level factual renderers require `request.host == 'machine.local'` and fixture_only plus nonempty data; they emit no section/heading/card/resource under Shopify zero-grant conditions. Description/disclosure guards deny machine fallback. Native JSON-LD retains Product/Offer identity/price/availability while excluding description/media/spec/relationship/support fallbacks; layout/meta tags prevent governed description/media social fallback.

The lightweight handoff validator reuses the review/F8 validator and directly renders the unchanged zero-grant projections/media/JSON-LD for all eight GIDs with a Shopify preview host. These are repository checks, not Shopify parity or certification. Current live default descriptions/media remain outside this containment proof. The future assigned preview machine template is the verification environment.

Every one of the eight routes in the scope table receives the following matrix. Use `https://rhino-lapidary.myshopify.com<route>?preview_theme_id=158631198917` subject to actual resolved shop/host/theme verification; clean performance URLs may additionally use the existing `pb=0&_fd=0` convention. A query parameter is not proof of actual template/theme identity.

| Check | Exact acceptance/scenario |
|---|---|
| Route/Product/template | HTTP 200 Product page, correct exact GID/handle; actual assigned product.machine DOM/section identity; no password/challenge/editor substitute |
| Native title/price | Approved native identity, current actual selected Variant/currency/price; no copied technical values |
| Variant/quantity | Current native availability/selection/URL/price updates; min/max/increment and quantity controls; one-default-Variant state where current; long/multiple/unavailable states only where genuinely applicable |
| Buy/native sold out | Correct actual Shopify state and disabled/enabled controls; never override from Admin availableForSale; no checkout/order submission |
| Pickup | Native eligibility/location rendering/absence and keyboard behavior; no seasonal/region/timing policy inference |
| Contact | Neutral /pages/contact navigation/label/context behavior under existing P scope; no quote/reserve promise; no contact submission |
| Payment | Native provider-owned terms retained for A; entire form/wrapper absent and remains absent on Variant updates for B; no custom finance copy |
| Suppression | Zero grants in each factual domain; no machine image/gallery/modal/media scripts, specs/contents/context/delivery/warranty/resources; no empty factual headings/wrappers/placeholders/fallback copy |
| JSON-LD/metadata | One correct native Product/Offer graph; governed description/media/spec/BOM/compatibility/warranty/freight/region/timing/resource facts absent in structured/social fallback |
| Global integration | Header/footer/breadcrumb/cart/predictive search, native policy links and provider output; no fact leaks in relevant Product/cart cards or disclosures; preserved target settings |
| Responsive | Each Product at 320, 390, 768 and 1440 CSS pixels: no overflow/clipping/overlap; native controls usable |
| Enlargement/zoom | 200% text enlargement and separately actual Chromium 200% browser zoom with layout/DPR evidence; correct reflow, controls and focus |
| Keyboard/axe | Logical focus order, visible focus, native dialogs/menus/provider controls where present; zero serious/critical axe findings in stated scope |
| Edges | Long current titles/price/native quantity, no-media and available/sold-out states; no fixture modifications to real Products to manufacture scenarios; retain unsupported/inapplicable evidence explicitly |

Minimum viewport cells: **8 × 4 = 32**; enlargement/zoom/keyboard/axe and native-state evidence remain distinct within each applicable Product. Future cart writes/add-to-cart/contact/checkout journeys need explicit separate interaction authorization; this handoff authorizes none. Unproven release-only journeys stay open. Shell parity can satisfy only its selected scope; full 014B's approved-live-media criteria remain open if factual media are deferred.

## F-PBI-015B selected shell-only certification plan — not run

Exact eight routes are above. Use the unchanged [budget](../../data/brand-performance-budget.json), [protocol](../qa/rhino-brand-media-performance-budget.md) and [F performance validator](../../scripts/lib/epic-f-performance.js). Profiles reuse local harness dimensions: mobile **390×900 DPR1**, desktop **1440×900 DPR1**. Settle: load + document.fonts.ready + **1500 ms**; inter-run delay **2500 ms**. Use Slow 4G, or a separately approved mobile profile; freeze/record exact latency/download/upload/CPU parameters before sampling. Existing protocol provides no fixed numerical Slow-4G parameters, so none are fabricated here.

Plan **three samples per route/profile/cache state**, cold and warm where supported: eight routes × two profiles × two cache states × three = **96 planned samples**, zero collected. Cold means clean context/cache; warm means a recorded same-policy warmed navigation/context. Where warm is unsupported, document it and obtain scope review rather than label cold data warm. Use distinct records per route/profile/cache with identical environment/Variant/gallery/provider policy within a record; never pool routes, desktop/mobile, cold/warm or historical local samples. Compute exact per-metric medians; the current validator also requires every individual sample to pass.

Important existing validator limit: `evaluateRun` requires ≥3 **mobile** samples in every release-certification record and identical viewport signatures across a record. Thus mobile triplets are release-certification records; desktop triplets are **preview-diagnostic supporting comparisons**, not falsely labeled standalone release certification. The current F3 runner accepts local fixtures only, so it is not a live certification command. Separately authorized 015B execution must use the existing measurement contract/validator with actual Shopify evidence; no new harness is created here and this limitation is not silently changed.

Numeric unchanged effective limits: LCP ≤2500 ms; CLS ≤0.10; TBT ≤200 ms; initial transfer ≤2,097,152 bytes; mobile/desktop images ≤512,000/921,600 bytes; largest image and first-screen media ≤358,400/512,000 bytes; requests ≤120/130; zero initial video iframes/autoplay/unowned third-party script hosts/synchronous third-party scripts. Global/header/footer assets count even with no machine media. Retain referenced Lighthouse targets (mobile performance ≥85, accessibility ≥95); field INP ≤200 ms is a field target, not fabricated from lab TBT.

Failure/hold criteria: wrong route/GID/theme/template, password/challenge/error page; incomplete/failed network or missing metrics; wrong sample count/median/policy; budget excess; duplicate Product initialization; eager video/provider request outside allowed ownership; decorative LCP without approval; attribution/ownership/privacy gaps; reduced-motion or layout-shift regression. >10% regression against an **approved comparable baseline** requires investigation even if absolute targets pass. No new preview baseline was captured; local F15A singles are not release baseline medians. Capture an authorized actual preview before-change baseline or obtain explicit baseline disposition when unavailable; do not invent it.

Record whole-page bytes/requests and attribute native-payment-provider, preview tooling, native recommendations, Rhino theme, Trade/native Shopify, first-party and third-party resources using the existing attribution code. Bind authorizationRef, F-DEC-001 widgetDecisionRef, actual theme ID/name, commit/source hashes, route, device/cache/throttle, provider state, timestamps, samples/medians and reviewer. Do not ignore provider/global requests to make the shell pass.

## Not part of shell release / future fact activation

Independent owner lanes remain open: F-DEC-002 exact media rights/use/alt/claims; B3B-D03 technical; B3B-D05 measurements; B3B-D04/C-040 BOM; B3B-D02 and PO-E-012/013 compatibility; B3C-D01/D02/D04 operations; B3C-D03 warranty; B3B-D06 canonical resources; FAMILY-MAPPINGS; existing U Analytics/Privacy owner/consent/collector/deduplication. Do not make shell preparation depend on approving their factual values. Approved **definition creation** in E-MUT-020 does not activate any of these lanes.

Future factual activation still needs each exact approved value/asset, applicable E adapter/migration/reconciliation, current consumer eligibility, explicit corresponding B-scope owner authorization and Shopify parity. Actual U instrumentation remains blocked; native commerce owner reservations stay singular. No analytics/pixel/consent configuration or event testing is bundled. No media/File/alt/Page/policy/Product-publication/shipping/location mutation is bundled.

## Human approval checklist — separate decisions, no broad GO

| Future decision/action | Required explicit approval | Current authorization |
|---|---|---|
| F-DEC-001 | Business/Product Owner + Shopify Admin Owner choose A or B; any B code implementation separately bounded | Undecided / false |
| E-MUT-020 execution | Existing Product Owner + Shopify Admin Owner slots; exact refreshed full-domain input/hash, before state and rollback; execution path | False |
| E-MUT-021 execution | Separate existing dual slots; full 122-class scope/hash, after definitions and refreshed before state | False |
| Preview theme push | Explicit target 158631198917, final bounded file hashes/backups/settings boundary; no Product changes | False |
| F-PBI-017B assignment | Separate Product Owner/Admin Owner exact current plan/target/before GO; explicit store-level impact and templateSuffix-only writes | False |
| Any factual B activation | Exact domain/Products/values/assets and their owners after applicable E reconciliation | False; not shell scope |
| F-PBI-014B/015B journeys/certification | Authorized actual preview/integration scope and interactions; unchanged performance protocol | False; planning only |
| F-PBI-018B signoff | Separate selected-scope release evidence/owner signoffs after parity/certification | False; not begun |
| Production publication | Separate concrete production go/no-go; never implied by preview/migration/assignment | False |

## Validation and unchanged state

Lightweight validator: `node scripts/validate-epic-f-shell-only-release-handoff.js`. It checks the exact eight/three scope, zero grants, existing plan/input hashes/row sets, preview/production distinction, required file hashes, store-level assignment boundary, false authorization slots and undecided F-DEC-001; directly renders suppression/JSON-LD using existing Liquid helpers and reuses review/F8 validation. No new adversarial framework/schema/rollout plan is introduced.

Additional local commands: existing bounded E-MUT-020/021 preparation validators, existing F7 plan validator, `git diff --check`, and no-index whitespace checks on newly added files. Actual commands/exits and source/output hashes are recorded in [shell-only-release-handoff-validation.json](../qa/evidence/epic-f/shell-only-release-handoff-validation.json). No live certification or browser fleet is run. Existing Theme Check evidence is consumed; a fresh Theme Check remains a prerequisite for any future push.

Durable files added: this document; `data/epic-f-shell-only-release-preparation.json`; `scripts/validate-epic-f-shell-only-release-handoff.js`; validation evidence. Existing review/F1–F8/E sources and PBI states remain unchanged. Shopify Admin mutation **No**; Product assignment/data mutation **No**; preview push **No**; production push/publication **No**; F-PBI-018B **not begun**; runtime/theme modification **none**.
