# Final Epic F006B / EM-1 BOM delta

Authorized project-owner clarifications dated 2026-10-15 supplement the Kevin/Avery worksheet. These new decisions are attributed to the authorized project owner/user, not Kevin or Avery. No PDF was re-ingested, no prior116-row migration repeated, and no BOM architecture/type-guard work redone.

Starting source `e8e2e5adc08699e30306c4b37acb4d964a8343062a19e3d134f91b9a9378473a`. Current source `b90bf2089788e77c04fbdd5bd1766bc4d03cfb9e358179884a47b74095be949b`. Owner amendment `data/epic-e-final-006b-bom-owner-amendment.json`, SHA256 `52dafdb26228bb5b59c18c8c837a2767a51703a8a374aa670258c6320a18ad31`.

| Plan | Written | Reconciled | No-op |
|---|---:|---:|---:|
| E-MUT-026 | 2 | 2 | 0 |
| E-MUT-027 | 3 | 3 | 0 |
| E-MUT-028 | 2 | 3 | 1 |
| E-MUT-029 | 1 | 1 | 0 |
| E-MUT-035 | 2 | 2 | 0 |

Eight new fields and two approved BOM companion replacements. EM-1 blade maximum6in was an exact no-op. All original116 technical desired values remain exact. No unexpected conflicts occurred.

| Final decision | Before | Reconciled result |
|---|---|---|
| BeadMaster motor output | absent; held0.55kW candidate |1 hp, explicit new owner value, no conversion |
| SawMaster18 motor output | absent; held1.8kW candidate |1 hp, explicit new owner value, no conversion |
| EM-1 primary rated motor speed | absent |3000 rpm, independent scalar |
| EM-1 blade size | minimum absent, maximum6in |min6/max6in, shared source/config/unit; storefront **6 in**, never 6–6 in |
| EM-1 water reservoir | absent; historical unit hold |3.5 US gal |
| JadeMaster electrical | absent |110 V and[60 Hz] |
| JadeMaster arbor | role unresolved |blade arbor 1 in; wheel arbor absent |
| TumbleMaster motor output/speed | absent |OWNER_UNKNOWN_SUPPRESSED; no write, grant or repeat question |

The prior remaining-owner list had10 unresolved field decisions. All are now dispositioned: eight determinate decisions and two intentional unknowns. Current decision state is [data/epic-f-final-owner-decision-status.json](../../data/epic-f-final-owner-decision-status.json); the sealed historical list remains unchanged. JadeMaster/TumbleMaster remain excluded and unassigned.

## Contents

The normalized27-line BOM was copied from its current governed record and only the two pending quantities completed. Existing25 lines and package children are unchanged. Left Moss Pad GID8905782034629 ×1 and Right Moss Pad GID8905783574725 ×1 render once each. Moss Filtration Pads ×2 remains a separate noncatalog line. Only included_products and included_quantities were replaced using fresh CAS digests. noncatalog_components is unchanged. All27 memberships have exact positive quantities. EM-1 uses eight catalog lookups plus12 compatibility lookups, within the existing20 bound.

## Release and verification

Customer grants127→133; assigned detail specification rows78→83; EM-1 contents25→27. Compatibility remains40 directed edges and media six photos. New receipt expiry 2026-10-22T20:26:37.102Z derives from the fresh complete192-value Shopify read/reconciliation, not timestamp-only renewal.

No formatter, Product template, gallery, contents/compatibility renderer or type guard changed. Three QA/current-receipt routing integrations select the additive final-delta receipt. The current architecture requires refreshed generated receipt headers/guards in16 existing snippets; these were deployed Preview first, then the identical bounded delta to MAIN, no full-theme push or publication.

Preview and MAIN each pass16 normal route cells: all eight assigned Products at390/1440, plus200%text. Newly changed assigned routes also pass true200%browser zoom. Axe critical0/serious0, no page/Liquid errors. Correct units, exact6in blade,27 contents, distinct moss identities, unchanged media/compatibility, Contact/payment/purchase and Admin-only suppression are verified. The protected122-Product/125-Variant comparison has zero unauthorized changes. Shipping weight, inventory, definitions, assignments, media and titles/descriptions changed0.

Targeted validation:13 delta tests,9 current-release tests,67 existing specification/contents tests,22 consumer tests, JSON registers, Theme Check zero offenses, git diff --check and credential scan. The bundled skill validator could not run because @shopify/theme-check-common is missing; its exit1 is retained. Independent installed Shopify Theme Check and real Preview/MAIN checks passed. No tests or thresholds were weakened.

## Status reassessment

**F-PBI-006B COMPLETE** for current governed technical/measurement activation. Its literal criteria require only approved/current typed facts, safe empty/unknown suppression, small key/grouped detail sets, separate physical meanings, coherent endpoints/units/source/configuration and wrapping/accessibility. They do not require every possible field to contain a value. All five criteria have evidence in [status-reassessment.json](../qa/evidence/epic-f/final-006b-bom-delta-2026-10-15/status-reassessment.json). TumbleMaster unknowns are final suppressed dispositions, not pending owner work.

**F-PBI-007B COMPLETE** for the governed current EM-1 BOM scope: all27 exact memberships/quantities, distinct meanings, exact currently published catalog identities, source-authorized C040 resolution and safe empty sets. Separate LapMaster variable-speed Variant implementation is not an E036/BOM blocker. No E036/037 write or optional/recommended activation occurred.

F008B remains PARTIAL_APPROVED_COMPATIBILITY_ACTIVE: both Saw Vice edges await the exact catalog split. F014B remains PARTIAL_FUTURE_LIVE_STATES_ONLY. F015B remains BLOCKED_MEASUREMENT_INTEGRITY / PARKED_RELEASE_GATE; F018B NOT_READY. No performance or final signoff work occurred.

Remaining non006B work: exact Saw Vice split catalog/price/SKU/inventory/weight/media inputs and any additional technical differences; LapMaster variable-speed Variant commercial/inventory/Variant-aware facts; separate Files/Media rights and remaining media review. The future40-gal Product remains preparation-only. Recommended next task: finish the exact Saw Vice catalog-split implementation inputs, then execute a separately bounded split/compatibility activation when determinate.

Detailed before/after fields, ownership, normalized BOM and hashes are in [summary.json](../qa/evidence/epic-f/final-006b-bom-delta-2026-10-15/summary.json), approved input, plan receipts, reconciliation, validation and evidence manifest in the same directory.
