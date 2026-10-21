# Epic F owner-decision preparation: verification and handoff

Current live source binding: `666ff15b4d98916426299eae85dbea783535321d88ea5d77035e57c0054216ac` (`EPIC_F_CURRENT_PRODUCT_MEDIA_DEVELOPMENT_2026_10_12`). Fresh protected read completed 2026-10-12 19:44:28 UTC. MAIN/Preview sources, all 29 bound runtime files, all 122 protected Products/Variants and all 11 media associations match the current media baseline. Eight assignments remain machine; three remain null. Classifications are 11 machine / 54 replacement_part / 39 consumable / 18 accessory; other factual values 0.

All 38 E-MUT-020 definitions are verified live: 37 Product definitions plus machine_family. Their IDs, types and access intent reconcile. Historical September definition-absence observations are not current blockers.

Shopify mutations 0; runtime/theme/media/alt/grant/assignment changes 0; performance sampling 0. Historical E packets and the 177-file current media evidence seal are unchanged. 512 protected repository files match the captured baseline.

Technical review: **B3B-D03 92 rows; B3B-D05 77 rows**. 48 single candidates; 11 multiple consistent-source rows; 57 conflicts; 33 missing; 20 outside the explicit field condition. N/A here describes the EM-1-specific field scope, not an owner-approved factual value. 95 other conditional Product/field combinations stay suppressed and are not requested as extra homework. No candidate is owner-confirmed.

Technical response scope: BeadMaster 6; EM-1; JadeMaster 14; LapMaster 12; LapMaster 18; SawMaster 18; SawMaster 24; SawMaster 36; ShapeMaster 6; TrimMaster 8; TumbleMaster. Operations measurement scope: BeadMaster 6; EM-1; JadeMaster 14; LapMaster 12; LapMaster 18; SawMaster 18; SawMaster 24; SawMaster 36; ShapeMaster 6; TrimMaster 8; TumbleMaster. Missing-source fields allow N/A or unknown rather than forcing values.

| Plan | Candidate rows | Owner-confirmed | Conflict | Missing | N/A | Execution-ready |
|---|---:|---:|---:|---:|---:|---:|
| E-MUT-026 electrical | 16 | 0 | 7 | 6 | 0 | 0 |
| E-MUT-027 motor_speed | 19 | 0 | 14 | 7 | 20 | 0 |
| E-MUT-028 tool_mount | 14 | 0 | 5 | 4 | 0 | 0 |
| E-MUT-029 water_fluid | 4 | 0 | 1 | 2 | 0 | 0 |
| E-MUT-030 durable_measurements | 36 | 0 | 30 | 8 | 0 | 0 |
| E-MUT-031 crate_measurements | 27 | 0 | 0 | 6 | 0 | 0 |

Resume verification completed 2026-10-13 15:34:19 UTC: all 38 definitions, both themes, 11 machine media inventories and 122 protected Products/Variants remain exact. No unexpected drift was found; the candidate packets retain their original evidence and observation dates.

Candidate counts mean exact Product/field rows with evidence, not individual source observations. Conflicts are included in the candidate count. All previews remain non-executable. Crate values are Admin-only; E-MUT-032 is outside this task. Native shipping gaps and packing column-F observations are retained separately in shipping-weight-separate-context.json.

Partial approval is supported per exact Product/field; no domain-wide completeness gate exists. Paired ranges require both endpoints with matching provenance. Dimensions need explicit axes, assemblies/accessories, fluid state and packing revision for crates. Included membership and the exact-GID quantity map form a companion join. Domain authorization will bind only the selected approved rows.

Minimum useful review: one exact customer-readable scalar can produce one row for one assigned Product. Recommended first batch is voltage + rated frequency for eight assigned Products (**16 field decisions**), yielding two rows each if approved and reconciled. Other unknowns do not block that subset.

| Assigned machine | Actual approved spec rows | Hypothetical all-selected customer rows | Admin-only packing rows |
|---|---:|---:|---:|
| BeadMaster 6 | 0 | 10 | 3 |
| EM-1 | 0 | 16 | 3 |
| LapMaster 12 | 0 | 8 | 3 |
| LapMaster 18 | 0 | 8 | 3 |
| SawMaster 18 | 0 | 11 | 3 |
| SawMaster 24 | 0 | 11 | 3 |
| ShapeMaster 6 | 0 | 10 | 3 |
| TrimMaster 8 | 0 | 10 | 3 |

Hypothetical counts come from explicitly simulated OWNER_CONFIRMED fixture responses, not candidate rendering. Invented fixture values are never persisted as factual inputs. Arbitrary reviewed subsets can be previewed with `node scripts/preview-epic-f-owner-responses.js <reviewed-response-file.json>`.

Architecture handoff gap: `scripts/lib/epic-f-consumer.js:evaluate` only recognizes non-classification approval in fixtureOnly contexts; `snippets/rhino-product-fact-projection.liquid` currently has no live technical release. A governed E owner-response adapter, domain reconciliation and customer-only release compiler are required after factual review. Existing typed formatters/renderers support partial data; no renderer redesign was identified or attempted.

007B: 22 existing component candidates (21 EM-1 lines under C-040 and one separately retained accessory battery exclusion). Three C-040 owner questions: current six/five-wheel count, 60/80-grit exact identity, and 280-grit inclusion. Every applicable line still needs included/excluded/optional status and quantity. The 80-grit Product GID is 8905778430149; it is not substituted for the unresolved 60-grit line. Two optional-configuration questions C-018/C-022 remain separate. No approved optional or recommendation relationship exists.

008B: 38 proposed directed edges + 4 blocked edges. PO-E-012 Automatic Feed Clamp and PO-E-013 Saw Vice Plate Set remain PENDING_IDENTITY_OWNER_RESPONSE. SawMaster 18/24 edges EDGE-001/002/005/006 retain their blocks. No reciprocity, compatibility, optional membership or recommendation was inferred. E-MUT-037 has zero existing recommendation candidates and remains a separate Product Owner lane.

Prepared reviewer packets:

- [006B technical and measurements](../../../../project/epic-f-006b-owner-value-decision-preparation.md)
- [007B contents/BOM](../../../../project/epic-f-007b-bom-owner-review.md)
- [008B compatibility/context](../../../../project/epic-f-008b-compatibility-owner-review.md)

Current preparation dispositions:

- F-PBI-006B: OWNER_VALUE_REVIEW_PREPARED_AWAITING_TECHNICAL_OPERATIONS_RESPONSE
- F-PBI-007B: OWNER_CONTENTS_REVIEW_PREPARED_AWAITING_TECHNICAL_PRODUCT_OWNER_RESPONSE
- F-PBI-008B: OWNER_FIT_REVIEW_PREPARED_AWAITING_TECHNICAL_IDENTITY_RESPONSE
- F-PBI-015B: BLOCKED_MEASUREMENT_INTEGRITY / PARKED_RELEASE_GATE
- F-PBI-018B: NOT_READY

After Kevin/Vejdi/Operations respond: ingest dated exact responses; validate identity, canonical units, configurations, ranges and measurement axes; prepare only approved selected owning-plan rows; implement the missing E approval adapter; fresh before-read; compare-before-write; execute separately authorized supported domain plans; after-read/reconcile; refresh F eligibility and compile only reconciled customer facts. Preview→MAIN validation applies only if a runtime delta is then required. No E-MUT-026–031 or E-MUT-034–037 was executed here.

Validation: 30 owner/schema/projection tests passed; F1–F8 aggregate exit 0; Theme Check exit 0, errors 0, warnings 0.

| Command | Exit |
|---|---:|
| `C:\Users\dajem\AppData\Local\JetBrains\WebStorm2026.2\acp-agents\.runtimes\node\24.13.0\node.exe scripts/validate-epic-f-owner-review.js` | 0 |
| `C:\Users\dajem\AppData\Local\JetBrains\WebStorm2026.2\acp-agents\.runtimes\node\24.13.0\node.exe scripts/test-epic-f-owner-review.js` | 0 |
| `C:\Users\dajem\AppData\Local\JetBrains\WebStorm2026.2\acp-agents\.runtimes\node\24.13.0\node.exe scripts/preview-epic-f-owner-responses.js` | 0 |
| `C:\Users\dajem\AppData\Local\JetBrains\WebStorm2026.2\acp-agents\.runtimes\node\24.13.0\node.exe scripts/validate-json-registers.js` | 0 |
| `git -c core.safecrlf=false diff --check` | 0 |
| `C:\Users\dajem\AppData\Local\JetBrains\WebStorm2026.2\acp-agents\.runtimes\node\24.13.0\node.exe scripts/seal-epic-f-live-media-evidence.js --verify` | 0 |
| `npm run validate:epic-f-batch-f8 (current cleanup/header/media binding environment)` | 0 |
| `npm run theme:check (inside F8 aggregate)` | 0 |

Artifacts: three Markdown reviewer packets; three machine-readable lane inputs; three schemas; owner-review builder, validator, non-executable response preview and synthetic tests; additive readiness index; fresh live definition/theme/catalog/media reads; protected-state comparison; migration and renderer projections; validation and credential-scan evidence. Authoritative E inputs, historical packets, current media and runtime source were preserved.
