# K1D-04P production release readiness

Date: 2026-11-05  
Store: `sz5dnk-nf.myshopify.com`  
MAIN theme: `158579622085`  
Accepted preview theme: `158631198917`  
State: **prepared; production mutation not authorized; blocking preconditions remain**

## Current production assessment

Authenticated read-only operations reverified the canonical Basic-plan store, MAIN and unpublished theme roles, all 125 current Variants, and Draft Orders `#D2` and `#D3`. All 125 Variants currently report `requiresShipping: true`; 79 belong to active Products, and no non-gift-card Variant is flagged as a Requires-shipping bypass. `#D2` and `#D3` remain `OPEN`, `Unquoted`, uninvoiced, uncompleted, unreserved, and without a shipping line.

The quotation app intentionally has only its narrow proxy, Product, and Draft Order scopes. It cannot read delivery profiles, Markets, locations/pickup, or discounts. Consequently, the October 27 snapshot is preserved as history but is not treated as proof of current configuration. A current Shopify Functions query is accessible and returns zero functions.

The production storefront still exposes native cart checkout surfaces and direct `/checkout` reaches Shopify checkout. The accepted two-Variant cart returned no Ajax shipping rates for Wisconsin, Alaska, Hawaii, or Canada, but this bounded result cannot prove every delivery profile or app entry point safe. Hidden buttons are not server-side enforcement. On this Basic store, a custom app cannot supply a Shopify Function as the missing validation layer; the same-window profile/Markets audit must prove that shipped carts cannot receive a payable rate while eligible Grafton pickup remains available.

## Minimal release manifest

The authoritative hash-pinned manifest is `data/epic-k-k1d04p-release-manifest.json`. It contains exactly 11 paths:

- Five new K1D assets/snippets: the Draft client, quote-mode JavaScript/CSS, quotation checkout, and pickup eligibility.
- Two exact repository replacements: `main-cart-footer.liquid` and `buy-buttons.liquid`.
- Four generated merges based on a fresh MAIN pull: cart drawer, English locale, settings schema, and settings data.

The production cart drawer, locale, schema, and settings contain live differences unrelated to K1D. They must not be replaced with preview or repository copies. The builder preserves the current live files and applies only these transformations:

1. Cart drawer: replace the shipping-at-checkout note with the merchandise-only note and replace its checkout button with a cart-review link.
2. English locale: set only `sections.cart.quote_mode` from the accepted repository source.
3. Settings schema: insert one checkbox after `show_cart_note`, default `false`.
4. Settings data: add only `current.rhino_quote_draft_automation_enabled: true`.

No template, app block, non-English locale, Product section, or unrelated preference is in the manifest.

## Employee quotation checklist

1. In Shopify Admin, open **Orders → Drafts** and filter for tag `Unquoted`.
2. Match the customer-visible `KQ-…` reference and deterministic `K1D-…` reconciliation tag. Stop and escalate if more than one draft matches.
3. Verify every merchandise line, quantity, public line property, customer contact, destination, address type, liftgate, insurance, access instructions, and cart note.
4. Determine packaging and the actual charge using Rhino's approved carrier workflow. Do not infer a price from the storefront.
5. Add the actual custom shipping charge to the draft; review insurance and access requirements.
6. Apply the approved `Quoted` staff status/tag procedure while retaining the reference and reconciliation tag.
7. Review the complete draft, then send Shopify's native invoice exactly once.
8. Let Shopify collect payment through its normal invoice checkout. Do not manually complete, fulfill, or reserve inventory unless the ordinary approved order procedure calls for it.

Missing operational input remains tracked under K-PBI-002: authoritative carrier/packaging rules, insurance handling thresholds, the final `Quoted` tag ownership procedure, and confirmation that each employee role can edit drafts and send invoices. None was invented in this batch.

## Activation preconditions

Activation must stop unless all conditions hold in the same release window:

1. Product Owner release authorization names MAIN theme `158579622085`, the 11-file manifest, the one-key automation enablement, and any separately enumerated shipping-profile remediation found by preflight.
2. A fresh selective MAIN pull exactly matches every `expectedProductionSha256` in the manifest and confirms all five new files are absent.
3. Staff-authenticated Admin inspection records all delivery profiles, assigned products/locations, zones and rates, applicable backup rates, Markets shipping, Grafton pickup, and installed checkout entry apps.
4. No `$8 Standard`, `$15 Express`, international shipping, or other payable shipped rate exists for any covered cart. Alaska/Hawaii remain quotation-only; the contiguous 48-state policy remains quotation-only; eligible Grafton pickup remains native checkout.
5. The operator can delete the five files that were absent before release, which is required for exact rollback.
6. All K1D-04 and regression gates pass, and a second person verifies the candidate/backup manifests and hashes.

## Exact backup and candidate preparation

Use a new local directory outside the repository for each release attempt. Do not reuse the November 5 audit pull.

```powershell
$releaseRoot = Join-Path $env:TEMP ("rhino-k1d04-release-" + (Get-Date -Format 'yyyyMMdd-HHmmss'))
$mainPull = Join-Path $releaseRoot 'main-before'
$package = Join-Path $releaseRoot 'package'
New-Item -ItemType Directory -Path $mainPull | Out-Null

shopify theme pull --store sz5dnk-nf.myshopify.com --theme 158579622085 --path $mainPull --only assets/rhino-quote-draft-client.js --only assets/rhino-quote-mode.js --only assets/rhino-quote-mode.css --only snippets/rhino-quote-checkout.liquid --only snippets/rhino-quote-pickup-eligibility.liquid --only sections/main-cart-footer.liquid --only snippets/buy-buttons.liquid --only snippets/cart-drawer.liquid --only locales/en.default.json --only config/settings_schema.json --only config/settings_data.json

node scripts/prepare-epic-k-k1d04-release.js --production-root=$mainPull --output-root=$package
```

The builder fails closed on any live or repository hash drift. It creates:

- `package/candidate/`: the only directory eligible for upload;
- `package/backup/`: byte-for-byte copies of the six previously existing files;
- `package/preparation.json`: candidate hashes, backup hashes, prior-absence records, order, and rollback targets.

Store the release package in Rhino's access-controlled operational evidence location before mutation. It contains theme configuration, so do not place it in a public artifact or commit it.

## Ordered production mutation after authorization

Editing MAIN is itself a production mutation. After all preconditions pass, run one selective push from the generated candidate. Do not use `theme publish`, do not upload the preview theme, and do not push the repository root.

```powershell
shopify theme push --store sz5dnk-nf.myshopify.com --theme 158579622085 --path (Join-Path $package 'candidate') --allow-live --nodelete --only assets/rhino-quote-draft-client.js --only assets/rhino-quote-mode.js --only assets/rhino-quote-mode.css --only snippets/rhino-quote-checkout.liquid --only snippets/rhino-quote-pickup-eligibility.liquid --only snippets/buy-buttons.liquid --only snippets/cart-drawer.liquid --only locales/en.default.json --only config/settings_schema.json --only sections/main-cart-footer.liquid --only config/settings_data.json
```

The generated settings-data file is based on the fresh live copy and changes one current key only. It is deliberately last in the manifest order so the automation switch is not enabled before its code and schema exist.

Immediately perform a second selective pull to `main-after`, hash all 11 files, and compare them to `package/preparation.json`. Confirm the theme list still identifies `158579622085` as MAIN and `158631198917` as unpublished.

## Smoke tests and monitoring

Use synthetic carts and mocks for Draft writes until a separately authorized post-release real quotation exists. Verify at 1440, 1024, 768, 390, 320, and 200%-zoom equivalent:

- shipping form fields, keyboard/focus/status behavior, explicit email fallback, and persistent confirmation recovery;
- selling-plan and unsupported-discount fallback without an automated POST;
- no Product Buy it now, cart-drawer checkout, cart accelerated checkout, or other theme checkout control for shipping;
- whole-cart Grafton eligibility produces native checkout and unavailable/mixed carts do not;
- direct `/checkout` and installed app entry points cannot offer a payable shipping method for contiguous states, Alaska, Hawaii, or international destinations;
- no proxy POST occurs merely by loading, refreshing, changing modes, or testing pickup.

Monitor Worker errors, D1 failed/uncertain claims, duplicate-reference diagnostics, Draft creation count, support reports, and Shopify checkout-no-rate behavior. Roll back immediately for JavaScript/Liquid failure, missing/duplicate cart lines, unintended proxy POST, lost fallback, pickup regression, any payable shipping bypass, non-English exposure, or hash/readback mismatch.

## Exact rollback

1. Stop new automated submissions first by restoring the backed-up `config/settings_data.json` to MAIN.
2. Selectively restore the other five pre-existing files from `package/backup/` with `theme push --allow-live --nodelete --only ...`.
3. In Shopify Admin **Online Store → Themes → MAIN → Edit code**, delete exactly the five paths listed by `rollback.deleteFilesAbsentBeforeRelease` in `preparation.json`. Do not delete any other file. The installed app deliberately has no `write_themes` scope, so no unapproved API deletion route is assumed.
4. Pull all 11 targets again. Each restored file must match its recorded original SHA-256; each previously absent file must be absent.
5. Rerun the storefront cart/pickup checks and confirm automation is absent/disabled. Reconcile any in-flight reference read-only; never resubmit it under a new reference.

Rollback restores the actual prior MAIN state. Merely toggling the feature setting is not accepted as rollback.

## Product Owner authorization package

The single release decision should authorize, in one statement:

> Deploy the hash-verified K1D-04 candidate described by `data/epic-k-k1d04p-release-manifest.json` to MAIN theme `158579622085`, including the single merged setting `current.rhino_quote_draft_automation_enabled=true`, after all K1D-04 preconditions and gates pass. Do not publish another theme, overwrite unrelated settings, create a test Draft Order, send an invoice, collect payment, or alter shipping configuration except for any separately itemized remediation included in this authorization. Use the recorded exact-backup rollback on any trigger.

This package is not yet eligible for that authorization: the complete current Admin configuration audit, direct-checkout enforcement proof, and rollback delete capability remain blocking preconditions. Production activation is not complete.

## Validation result

- `test:epic-k-k1d04`: pass, 12/12 focused merge, exact rollback, publication, freshness, store-identity, model-identification, checkout-conclusion, and readiness-claim cases.
- `validate:epic-k-k1d04`: pass; correctly reports zero production mutations and the remaining blockers.
- K1D-03: pass, client 20/20 and mocked browser 13/13; validator pass.
- K1D-02: pass, endpoint 18/18, D1 8/8, Worker router 15/15; validator pass.
- Quote mode/K1C: pass, policy 40/40, browser 20/20, K1C-02 safety 10/10; both validators pass.
- Registers, cart configuration, Product purchase, and theme architecture: pass.
- Established English Theme Check projection: pass, 165 files and zero offenses.
- Unrestricted multilingual Theme Check: expected governed failure, 1,890 `MatchingTranslations` errors in 30 unapproved locale files. No non-English translations were invented or released.

The expanded live accessory/machine/mixed-cart probe could not replace the successful current snapshot because a later browser session was rejected at Shopify's storefront password gate. It issued no quotation, contact, payment, or Admin mutation. Those matrix rows remain explicitly marked for a same-window rerun rather than being inferred from the accepted two-Variant result.

## K1D-04P-R publication and shipping-enforcement addendum

Git publication is resolved. The authorized fetch showed both local and remote branch tips at `7aea10667b7f7f7f2ed7e30c0b2fa12a617f95a5`; ancestry passed, the single ordinary push returned `Everything up-to-date`, and a final `ls-remote` readback returned the same SHA. No rebase, amend, force push, alternate branch, or ruleset change occurred. GitHub's status history records Git Operations degradation on November 4, while current Git Operations are operational; the prior `commit_refs_rules` responses are therefore not treated as a repository rule finding.

The current `Shop.features` read identifies Rhino's shipping model without broadening app scopes:

- `marketDrivenShipping: false`
- `deliveryProfiles: true`
- `unifiedMarkets: true`

The authoritative merchant-rate surface is therefore the legacy hierarchy **delivery profile → location group → zone → method**. Markets remain necessary to audit active countries and subdivisions, but Market shipping options are not Rhino's active merchant-rate model. App-owned delivery profiles would still require separate inspection if any exist.

The existing quotation app returns access denied for `deliveryProfiles`, `markets`, `locations`, and `discountNodes`. The persisted browser has no authenticated staff Admin session. Profile, zone, market, method, fallback-rate, shipping-discount, pickup-location, and profile-assignment counts are therefore `BLOCKED_ACCESS`, not zero. Exact staff navigation and evidence requirements are recorded in `shipping-enforcement-audit.json`; the application scopes remain unchanged.

Fresh storefront attempts corrected the earlier authentication diagnosis: the rotated password can authenticate, but repeated Ajax cart setup encountered Shopify `429` throttling and a later `422` cart-add response before the complete representative matrix could be captured. The harness now honors `Retry-After`, checks the cart before any rate-limited add retry, starts scenarios from fresh carts, and stops on partial or rejected outcomes. Accessory, machine, consumable, replacement-part, mixed, low/high value, Illinois, United Kingdom, discount, multi-location, and whole-cart pickup cases remain `BLOCKED_TEST` or `BLOCKED_ACCESS`. A reachable `/checkout` URL alone is not classified as a policy failure, and no payable bypass is claimed without a delivery method.

Rollback preparation improved without touching Shopify: the automated test now creates a local release fixture, restores the six previously existing files byte-for-byte, deletes the five files previously absent, and verifies unrelated settings survive. Selective production pull proves backup read access. Production restore and code-file deletion permission remain `BLOCKED_ACCESS` because neither a write nor an authenticated Admin permission check was authorized or available.

Disposition remains `BLOCKED_ACCESS_AND_BLOCKED_TEST`. No exact shipping remediation can be proposed until the active profiles and rates are inspected. If a payable method is found, a later proposal must name its profile, location group, zone, method, present condition/value, intended state, checkout consequence, rollback, validation, and Product Owner authorization; no speculative rate change is included here.

## References

- [Shopify CLI theme push](https://shopify.dev/docs/api/shopify-cli/theme/theme-push)
- [Shopify CLI theme workflows](https://shopify.dev/docs/storefronts/themes/tools/cli)
- [Delivery profiles query](https://shopify.dev/docs/api/admin-graphql/2026-07/queries/deliveryProfiles)
- [Cart and checkout validation](https://shopify.dev/docs/apps/build/checkout/cart-checkout-validation)
- [Shopify Functions availability](https://shopify.dev/docs/apps/build/functions)
- [Dynamic checkout behavior](https://help.shopify.com/en/manual/online-store/dynamic-checkout/dynamic-checkout)
- [Theme file deletion API requirements](https://shopify.dev/docs/api/admin-graphql/latest/mutations/themeFilesDelete)
