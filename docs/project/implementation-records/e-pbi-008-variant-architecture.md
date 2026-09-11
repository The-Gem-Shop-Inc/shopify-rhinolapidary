# E-PBI-008 — Product-versus-variant architecture implementation record

**Implemented:** 2026-09-03  
**Mode:** repository architecture and validation only  
**Admin/theme mutation:** none

## Outcome

`data/epic-e-variant-architecture.json` establishes that a Product option exists only for a real customer-selectable commerce distinction on one Product with an enforceable relationship to commerce state. Conflicting technical facts, theoretical model differences, and possible market builds do not create Variants.

CONFIG-001–011 preserve current structure without speculative Variants. CONFIG-012 preserves the Saw Blade `Size` option and reconciles Product option values and Variant `selectedOptions` to `6"`, `8"`, `14"`, and `18"`; prices are $15, $25, $75, and $125. CONFIG-013–022 preserve established separate products. No split, merge, option change, or Variant restructure is authorized.

The current option audit records complete positive prices, blank SKUs, and zero shipping weights for all four Saw Blade Variants. SKU becomes required only after E-PBI-007 establishes a commerce SKU authority. Positive shipping weight remains an operational gap. Per-location inventory quantities were not needed, so the E-PBI-002 query was not extended.

## Integrity repairs

- Saw Blade option text, values, prices, and weights now derive from the same snapshot records; hard-coded `10"` was removed.
- Product option values must equal Variant selected-option values; duplicate or missing combinations fail.
- C-040/C-041 remain EM-1 included-components/water evidence and cannot migrate to JadeMaster or TumbleMaster.
- JadeMaster uses C-036/C-037; TumbleMaster uses C-038/C-039.
- C-019 was additionally removed from LapMaster 12 and correctly associated with LapMaster 18.
- Conflict IDs are checked against a generated canonical index and explicit per-configuration mapping, not ordinal/range logic.

## E-PBI-009 handoff

E-PBI-009 is ready for a separately authorized repository-contract batch. It may consume approved Product class decisions, Vendor semantics, the no-new-business-ID conclusion, Variant scope rules, the current option audit, and CONFIG dispositions. It may not consume speculative facts, unapproved SKUs, compatibility relationships, or create Admin definitions/values.

## Validation

The Batch 2B builder, schemas, semantic validator, and negative fixtures cover approval authority, source hashes/digests, GID existence, option reconciliation, conflict-family association, identity/SKU separation, no-mutation dispositions, and the E-PBI-009 stop line.
