# J2/G4 preview deployment preparation and rollback readiness

Date: November 16, 2026
Disposition: **Phase A prepared; locale preserved; Apply mode remains unauthorized**

No Shopify write, upload, deletion, publication, menu edit, collection change, staging, commit, or push occurred.

## Repository and candidate

The verified worktree is `C:\rlcc` on `integration/catalog-cart-preview` at `2040122f2eb9eb428c7cf15dd9d328890d2ac271`. `64ddfaadbcea98175940fd54d9cf198c443e39c3` remains the immutable provenance anchor and an ancestor of HEAD. The current worktree candidate is not byte-identical to that commit: it contains one explicitly approved successor delta at `sections.cart.quote_mode.email_fallback_explanation` in `locales/en.default.json`. No future commit identity is asserted. The G4 source commit remains in its protected source worktree; the validator proves exact G4 nonshared bodies and the deterministic shared-section successor.

The manifest contains exactly 17 deployable files: eight J2, eight G4, and one shared collection section. The deployment candidate digest is `c59f3d8ea6a9c4d62cf477e698ef341845066715b2a1007069c5402d745500ec`; the current manifest file SHA-256 is `c7836d2c0990095317f729ce1cdd80d2e502e97c07b120a68d00fe6b127fba30`. All candidate hashes and sizes, five dependency hashes, the single toast initialization/mount, source authority boundaries, and repository-only exclusions validate.

## Shopify identity and remote comparison

Fresh Admin reads verified canonical shop `gid://shopify/Shop/79279947973` / `sz5dnk-nf.myshopify.com`, primary domain `rhino-lapidary.myshopify.com`, preview `gid://shopify/OnlineStoreTheme/158631198917` / Rhino Lapidary - Preview / `UNPUBLISHED`, and production `gid://shopify/OnlineStoreTheme/158579622085` / shopify-rhinolapidary/main / `MAIN`.

The 17-file comparison is machine-readable in `data/j2-g4-preview-deployment-preparation.json`: ten replacements, seven additions, zero unchanged. The absent paths are unchanged from the prior audit. All five unchanged dependencies match. The earlier audit's body hashes are not present in the task input or this branch, so the report does not invent a body-level prior/current comparison; the new hashes are the baseline for the future transaction.

Shopify metadata reported a different `size` from its exact text body for `locales/en.default.json` and `templates/collection.json`. Exact body bytes independently matched between the fresh theme filesystem read and the external rollback files. Metadata MD5 and metadata size were not substituted for local SHA-256.

## Rollback archive

The archive is outside all Git worktrees:

`C:\Users\dajem\AppData\Local\RhinoLapidary\rollback\shop-79279947973\theme-158631198917\2026-11-16T18-31-49.6370986Z`

It contains exact bodies for the ten replacement targets, seven explicit absence markers, shop/theme identity, byte sizes, SHA-256 values, and a machine-readable inventory. It contains no credentials or customer data. Validate it with:

```powershell
node scripts/validate-j2-g4-rollback-archive.js "C:\Users\dajem\AppData\Local\RhinoLapidary\rollback\shop-79279947973\theme-158631198917\2026-11-16T18-31-49.6370986Z"
```

A future rollback must restore the ten exact bodies, delete only the seven paths proved previously absent, read back every result, and reverify hashes/absence. It requires separate authorization and a fresh identity/predecessor check.

## Preview menu transaction proposal

Fresh menu `gid://shopify/Menu/257402405061` (`preview-primary-navigation-menu`) is:

- Home → `/`
- Catalog → `/collections`
  - Saws → `/collections/saws` (`gid://shopify/Collection/364020531397`)
  - Laps → `/collections/flat-laps` (`gid://shopify/Collection/364020564165`)
  - Shaping → `/collections/shaping` (`gid://shopify/Collection/364020596933`)
- Manuals → `/pages/manuals`
- Contact → `/pages/contact`

Proposed Catalog children, leaving every other item unchanged:

- All Products → `/collections/all`
- Machines → `/collections/machines` (`gid://shopify/Collection/355080962245`)
- Replacement Parts → `/collections/all?view=directory#g-replacement-parts`
- Consumables → `/collections/all?view=directory#g-consumables`
- Accessories → `/collections/all?view=directory#g-accessories`

The desktop mega menu and mobile drawer inject All Products only when Catalog lacks a child whose URL equals `routes.all_products_collection_url`; the explicit proposed child suppresses the injected duplicate in both. Desktop uses the native details/summary mega-menu disclosure. Mobile uses the native nested details drawer and back button. Rollback is the exact fresh tree above, but only after an immediate pre-mutation read proves it is still current. `main-menu` is excluded.

The historical repository contract's `before` tree does not match current Shopify. It remains sealed; this fresh evidence supersedes it only for preparation and does not renew authority.

## Collections and localization

All 11 named collections still exist and are published to Online Store. Eight are nonempty; three machine-part collections are empty and must not be promoted. Four desired broad category handles still do not exist. The revised gap report distinguishes route availability from membership and compatibility approval.

English remains the only published locale. Structural comparison proves that all 526 current preview leaves and values are preserved, exactly seven nonempty J2 toast leaves are added, and the candidate contains 533 leaves. The restored quote explanation matches the preview byte-for-value. A fresh Theme Check still produces 2,100 `MatchingTranslations` errors in 30 files, including the retained 210 errors for seven toast keys across 30 unpublished locale files. Its complete JSON report is retained outside the repository and hash-bound by `data/j2-g4-preview-theme-check-exception.json`. Theme Check did not pass.

## Exact future deployment transaction

Installed CLI `4.9.4` and current official Shopify CLI documentation expose the same selective flags. The command below is a plan only and was not executed:

Immediately before any transaction, run the read-only theme selectors and repeat the Admin GraphQL shop identity query. Abort unless the CLI rows and GraphQL IDs/roles exactly match this report:

```powershell
shopify theme list --store sz5dnk-nf.myshopify.com --id 158631198917 --json --no-input
shopify theme list --store sz5dnk-nf.myshopify.com --id 158579622085 --json --no-input
```

```powershell
shopify theme push --store sz5dnk-nf.myshopify.com --theme 158631198917 --path C:\rlcc --only assets/cart-feedback-toast.js --only assets/component-cart-feedback-toast.css --only assets/quick-add-bulk.js --only assets/quick-order-list.js --only locales/en.default.json --only sections/main-collection-product-grid.liquid --only snippets/card-product.liquid --only snippets/cart-feedback-toast.liquid --only snippets/quick-order-list.liquid --only assets/rhino-g-catalog-navigation.css --only sections/rhino-g-catalog-directory.liquid --only sections/rhino-g-catalog-navigation.liquid --only snippets/header-drawer.liquid --only snippets/header-mega-menu.liquid --only snippets/rhino-g-catalog-index.liquid --only templates/collection.directory.json --only templates/collection.json --nodelete --json --no-input
```

Omission of `--strict` is valid only through the exact candidate-bound English-only unpublished-preview exception. Apply mode also requires the exact authorization value and an explicit exception switch; neither is inferred from this preparation report.

Run the authorized read-only plan with:

```powershell
& C:\rlcc\scripts\deploy-j2-g4-preview.ps1
```

The verified Plan result is ten replacements, seven additions, zero deletions, five matching dependencies, a current rollback archive, and no Shopify changes.

The future Apply shape is:

```powershell
& C:\rlcc\scripts\deploy-j2-g4-preview.ps1 -Mode Apply -AuthorizationValue 'J2G4-PREVIEW-APPLY-652f19f217978fbaa62c383e468c5d936b94523b9d85f325e807aa64894a3a0c' -ApproveThemeCheckException
```

This command is prepared but not authorized or executed. Its value binds the exact 17-file candidate and manifest, shop and theme IDs, rollback inventory, Theme Check report, and the selective no-delete/production-excluded scope. The earlier `fdbc7020...` and `8117c027...` values are explicitly invalid. The current value becomes invalid if any bound premise changes.

Fresh identity and locale evidence is intentionally external to Git. After an authorized Admin GraphQL read writes a short-lived identity snapshot outside the repository, validate and normalize it with:

```powershell
& C:\rlcc\scripts\new-j2-g4-preview-live-evidence.ps1 -AdminEvidencePath '<external-admin-read.json>'
```

The collector requires Admin evidence no older than five minutes, rechecks theme roles and the exact remote English locale through Shopify CLI, and writes `validated-*.json` under `%LOCALAPPDATA%\RhinoLapidary\evidence\j2-g4-preview\live`. Plan and Apply automatically select the newest external validated snapshot and reject evidence older than 15 minutes. No tracked file must be rewritten for freshness.

For an authorized future readback, create a new empty external directory and run this exact bounded pull for the 17 candidates plus five dependencies:

```powershell
shopify theme pull --store sz5dnk-nf.myshopify.com --theme 158631198917 --path "<new-empty-readback-theme-root>" --only assets/cart-feedback-toast.js --only assets/component-cart-feedback-toast.css --only assets/quick-add-bulk.js --only assets/quick-order-list.js --only locales/en.default.json --only sections/main-collection-product-grid.liquid --only snippets/card-product.liquid --only snippets/cart-feedback-toast.liquid --only snippets/quick-order-list.liquid --only assets/rhino-g-catalog-navigation.css --only sections/rhino-g-catalog-directory.liquid --only sections/rhino-g-catalog-navigation.liquid --only snippets/header-drawer.liquid --only snippets/header-mega-menu.liquid --only snippets/rhino-g-catalog-index.liquid --only templates/collection.directory.json --only templates/collection.json --only assets/rhino-g-catalog.css --only assets/rhino-g-catalog.js --only snippets/rhino-g-catalog-authority.liquid --only assets/quantity-popover.js --only assets/price-per-item.js --nodelete --no-input
```

Then run:

```powershell
node scripts/validate-j2-g4-theme-readback.js "<fresh-readback-theme-root>"
```

The transaction must also compare complete before/after theme inventories and reject every unrelated filename/checksum change. CLI exit zero is not acceptance. Any identity, role, file-set, readback hash, dependency, or unrelated-inventory discrepancy stops the transaction and invokes the separately authorized controlled rollback. No menu mutation occurs until browser acceptance passes.

The Admin GraphQL `themeFilesUpsert` mutation can batch 17 files but requires `write_themes` and Shopify exemption. It is not the prepared transport.

## Browser acceptance contract

Deterministic fixtures currently pass: integrated 6/6, J2 desktop/mobile 20/20, and G4 8/8. These are not live Shopify observations.

After an authorized upload and exact readback, verify the unpublished preview at 320, 390, 768, 1024, and 1440 px:

1. `/collections/all` defaults to photographic cards; sorting, filtering, pagination, missing-image fallback, and empty states work.
2. `/collections/all?view=directory`, its three approved category anchors, `/collections/machines`, and collection navigation work without unsupported classification claims.
3. Bulk quick-add, increment, decrement, removal, rapid multi-Product updates, header badge, cart drawer, and cart page remain synchronized to confirmed server state.
4. Success, rejected, and uncertain toasts announce accurately; no uncertain/rejected outcome announces false success.
5. Keyboard focus, polite atomic announcements, dismiss behavior, reduced motion, desktop mega menu, and mobile drawer all work.
6. At 200% zoom there is no critical horizontal overflow and focus remains visible; representative routes have zero critical/serious axe findings.
7. Expired Product-role, machine-context, fit, and compatibility authority remains fail closed. Native photographic catalog and cart behavior can pass independently.

## Validation and blockers

Integration, successor evidence, 11-case preflight regression, navigation, global navigation, JSON registers, architecture, Product purchase, and all three deterministic browser suites pass. Theme Check remains the deliberate 2,100-error failure.

Remaining gates are: separate exact Apply authorization that explicitly accepts the bound Theme Check exception; a fresh live evidence read within the Apply freshness window; successful exact readback and complete unrelated-inventory comparison; live browser acceptance; separate preview-menu authorization; and renewed authority for any governed classification or compatibility claims.
