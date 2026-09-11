# E-PBI-004–007 Classification and Identity Governance

**Implemented:** 2026-09-03; Product Owner decision reconciliation finalized 2026-09-04  
**Scope:** Repository governance only; no Shopify Admin or theme mutation  
**Evidence baseline:** `docs/qa/evidence/epic-e/2026-09-03-epic-e-admin-snapshot.json` (122 products, 125 variants, API 2026-07)

## Outcome

The coordinated classification unit now has 122 Product Owner-approved snapshot-relative mappings using the closed four-value `rhino.product_class` vocabulary: 11 machines, 54 replacement parts, 39 consumables, and 18 accessories. There are zero class blockers. Shopify Product Type remains blank because no concrete consumer was found. Vendor remains native Shopify data. Tags and collections are explicitly noncanonical, and the former `requiredTagsByProductClass` rule is deprecated.

The coordinated identity unit distinguishes Shopify GID, family, model, part/order number, and SKU roles. The prior naming proposal's 31 generated `admin_identifier` strings remain discarded historical proposals. No additional Rhino business ID is justified. Rhino is the approved commerce-SKU issuer using the opaque `RH-######` scheme. The human-owned registry covers all 125 variants with 121 initial proposals, two explicit semantic blockers, and two deferred non-sellable variants. No SKU value is approved or populated. Barcode remains optional because no consumer is evidenced.

`data/epic-e-commercial-configuration-candidates.json` is an evidence packet for E-PBI-008. It records 22 candidate decision groups, covering machine conflicts, existing Saw Blade variants, and current separate-product families with grit/side/size/profile/pack distinctions, but neither decides nor implements variant changes.

## Validation

- `npm run build:epic-e-batch-2a`
- `npm run validate:epic-e-batch-2a`
- `git diff --check`

The Batch 2A validator owns class vocabulary/coverage/evidence checks, taxonomy audit identity, identifier uniqueness and aliases, SKU blank/case/duplicate/derivation rules, optional barcode behavior, and E-PBI-008 packet conflict references.

## Safety

No product, variant, category, Product Type, Vendor, tag, collection, SKU, barcode, custom-data definition/value, File, shipping configuration, inventory, price, status, theme, or publication state was changed.

## Batch 2B approval and integrity supplement — 2026-09-03

> Historical Batch 2B conclusion. The conflicting Purple Jade, SKU-authority, taxonomy, and Vendor-review statements below are superseded by the Batch 2B.1 finalization section.

The human-owned approval surface is `data/epic-e-product-owner-decisions.json`; generated registers are not an approval edit surface. The builder verifies the exact Admin snapshot hash and 119-row proposal digest before merging approvals. It produces 121 approved class mappings and one Product Owner-approved catalog-scope block for `purple-jade-bead-strand`. Both knob products are approved as `replacement_part`.

E-PBI-005 now defines Shopify Vendor as marketed product brand, keeps Product Type blank, preserves tags and collections as noncanonical, and narrows taxonomy review to 119 proposals (70 specific, 49 justified broad fallbacks) plus three unresolved machine rows. Eleven Vendor exceptions require later Product Owner review; no Vendor or Category value was changed.

E-PBI-006 remains complete: no additional Rhino business ID is justified. E-PBI-007 governance is complete but commerce SKU authority is unresolved. Three identifiers are approved only as legacy/order aliases, four sold-product rows contain multiple constituent or model-specific identifiers, 116 variants have no source, two are presently nonpurchasable, and zero commerce SKUs are approved. The corrected LapMaster source maps `YL-450-T12`/`YL-450-T13` to the pulleys and rejects `YL-450-04T`/`YL-450-05T` as fixer components.

Validation rejects stale approval baselines, unknown Product/Variant GIDs, invented classes/SKUs, technical-number-to-SKU promotion, Product Type/tag/collection authority, and unauthorized mutation flags. No Shopify Admin or theme mutation occurred.

## Batch 2B.1 Product Owner decision reconciliation — 2026-09-04

`data/epic-e-product-owner-decisions.json` supersedes the obsolete Purple Jade blocker without changing the snapshot hash or 119-row bulk proposal digest. `purple-jade-bead-strand` is approved as `replacement_part` because it is a functional JadeMaster component controlling stone travel before the auto-stop switch. The generated register now reports 122 approved and zero blocked classifications.

E-PBI-005 governance is complete. The approved Vendor meaning is marketed product brand, not automatically legal manufacturer. All 11 unambiguous third-party evidence rows produce desired Vendor changes: DIALUX (2), KAAN ZIMPARA (1), Johnson Brothers Lapidary (4), and Nova Wheel (4); zero rows remain ambiguous. Taxonomy is 79 specific, 43 justified broad fallbacks, and zero unresolved. The broad rows are: `belt-guard-jademaster`, `brass-sprayer`, `debris-guard`, `dialux-polishing-paste`, `dialux-superfinishing-paste`, `drain-plug-jademaster`, `drain-plug-trimmaster`, `jademaster-feet`, `flexible-shaft`, `flexible-shaft-attachment`, `flexible-shaft-bit-turntable`, `flexible-shaft-pack`, `flexible-water-spout`, `left-arbor-shaft`, `metal-spindle-left`, `metal-spindle-pair`, `metal-spindle-right`, `power-feed-bearings-set`, `power-grip-belt`, `lapmaster-pulleys`, `jademaster-pulleys`, `trimmaster-pulleys`, `purple-jade-bead-strand`, `right-arbor-shaft`, `right-plexiglass-spray-guard`, `rotation-table`, `rotational-lock`, `rotational-lock-handle`, `lapmaster-feet`, `saw-table`, `sled-release-handle`, `thumb-spindle-knob`, `trim-saw-accessories-knob`, `trimmaster-feet`, `trimmaster-belt-guard`, `plexiglass-insert`, `trimmaster-splash-guard-front`, `trimmaster-splash-guard-upper`, `trimmaster-straight-edge-guide`, `water-guard`, `water-pump`, `wrist-rest`, and `wrist-rest-knob`.

The exact approved machine mappings are EM-1 → `Hardware > Tools > Multifunction Power Tools` (`ha-15-38`), JadeMaster → `Hardware > Tools > Saws > Masonry & Tile Saws` (`ha-15-62-6`), and TumbleMaster → `Hardware > Tools > Polishers & Buffers > Rotary Polishers & Buffers` (`ha-15-51-2`). Their separate business meanings remain `multi-purpose lapidary machine`, `rock saw`, and `tumbler`.

E-PBI-007 SKU authority and scheme governance are complete. `data/rhino-commerce-sku-registry.json` is the human-owned issuance ledger; generated identity evidence consumes it by Variant GID. A one-time deterministic bootstrap reserved 121 proposals, after which catalog sorting cannot rebuild issued values. LapMaster and TrimMaster pulleys each receive one new sold-set proposal while retaining their two constituent identifiers. `automatic-feed-clamp` and `saw-vice-plate-set` remain blocked because the evidence identifies distinct 18-inch/24-inch parts collapsed into one Product; no restructuring is authorized. Eleven valid legacy/order/component identifiers across seven products remain preserved, and the two LapMaster fixer-number misassociations remain explicitly rejected.

E-PBI-008 remains complete and unchanged: CONFIG-001–011 prohibit speculative Variants, CONFIG-012 preserves current 6/8/14/18-inch Size Variants, and CONFIG-013–022 preserve separate Products. At this Batch 2B.1 handoff, E-PBI-009 had not started; it was subsequently completed as the separately authorized repository-only Batch 3A recorded in `e-pbi-009-custom-data-registry.md`.
