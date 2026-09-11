# Epic E Batch 4A — aggregate gates and deferred migration handoff

**E-PBI-024 is Complete.** Epic E architecture and migration planning substantially complete; live migration and human-owned value closure deferred. E-PBI-025 is **not complete**.

Implemented on `dev`, assessed at `2026-09-09T22:12:21.000Z`. No Shopify query, Admin mutation, Product/Variant value population, File change, shipping configuration change or theme/storefront work occurred. The approved audit CLI stopped at its credential check without writing a snapshot. Web reads verified Shopify reference-definition validation and read-query shapes; they did not access the store.

## Aggregate results and current Admin authority

[Repository gate report](../../../data/epic-e-aggregate-gate-report.json) separates architecture, plan preparation, blocked values, Admin reconciliation and execution authorization. [Gate policy](../../../data/epic-e-aggregate-gate-contract.json) defines modes and exit codes:

| Mode | Result for this batch | Meaning |
|---|---|---|
| Repository | Pass, exit 0 | Existing Epic E suites plus new contracts and adversarial checks pass; missing values remain visible |
| Read-only Admin | Blocked, exit 2 | Credentials unavailable and detailed required datasets missing |
| Migration readiness | Plans prepared; execution blocked, exit 2 | Every plan lacks domain-specific Product Owner/Admin GO and current execution preconditions |
| All | Execution remains blocked | A repository pass never implies an executable migration |

The September 3 snapshot's seven-day window expires **2026-09-10T17:52:28.268Z**. It had not expired at assessment time; current reconciliation is **inaccessible**, not falsely labeled fresh/live. Future-dated negative tests prove expired evidence is rejected. The dated baseline observes 122 Products, 125 Variants, one delivery profile, three locations and one active US Market. None is asserted perpetually.

[Admin readiness](../../../data/epic-e-admin-readiness.json) carries exact freshness, dataset coverage, definition differences, native-field drift and delivery observations. The operational audit additionally supports Files and machine-family metaobjects for exact target checks. Scope denial, duplicate/partial records, failed queries and missing nested pages cannot certify completeness. The audit path remains query-only. No credentials were present to exercise the expanded query set against Shopify.

Native drift compares identity, status/publication, Category, Vendor, Product Type, options, SKU, barcode, inventory/weight and individual metafields. Missing Product/Variant identities are reported without title/handle substitution. Optional `--before`, `--snapshot` and `--plan` support read-only, bounded after-state comparisons; unexpected unrelated changes require review. No actual after-migration snapshot exists yet.

## E-PBI-020 — definitions

[E-MUT-020](../../../data/epic-e-migration-plans/E-MUT-020-definitions.json) prepares **38 definitions: 37 Product metafields and one machine-family metaobject**, zero Variant definitions. The approved registry remains unchanged at 41 Product metafields, zero Variant metafields and one metaobject: 38 approved, two proposed and two deprecated.

The dated diff reports **38 create intents, zero no-ops/conflicts and four deferred/non-approved definitions**. Only approved desired contracts enter the input. Each includes exact namespace/key or metaobject type, Shopify owner/type, validations, access, dependency order and captured before identity. Approval authority points to the real registry record; no approval-event ID is invented.

Definition dependencies are sorted deterministically. The machine-family reference must resolve the exact created/audited metaobject definition GID. Aggregate drift work exposed and corrected an E-PBI-009 comparison defect: a legitimate `metaobject_definition_id` binding was previously compared against an unresolved registry rule. Matching exact bindings now reconcile, and wrong bindings remain conflicts. This extends reconciliation without changing the architecture or registry values. Shopify documents this [reference-definition validation](https://shopify.dev/docs/apps/build/metafields/list-of-validation-options).

Rollback preserves returned identities. A definition created by a future run can be removed only after proving that it has no values or inbound dependencies. Otherwise, retain it and require an explicitly approved compensation plan; deleting/recreating reference identities is not a rollback shortcut.

## E-PBI-021 — independent identity/native domains

| Plan | Domain | Approved input rows | Excluded candidates |
|---|---|---:|---|
| E-MUT-021 / 021A | Product class | 122 | None; population remains unauthorized |
| E-MUT-022 / 021B | Shopify Category | 3 | 119 proposed taxonomy assignments |
| E-MUT-023 / 021C | Vendor | 0 | 11 marketed-brand corrections remain proposed under PO-E-016 |
| E-MUT-024 / 021D | Commerce SKU | 0 | 121 proposals, two identity blockers, two non-sellable deferrals |
| E-MUT-025 / 021E | Machine-family linkage | 0 | 31 observed/proposed memberships; no approved exact linkage or live metaobject GID binding |

The three Category values have explicit **PO-E-042/043/044** approval for EM-1, JadeMaster and TumbleMaster. Those approvals are preserved without promoting the other 119 candidates. Vendor evidence does not require redundant brand research under PO-E-016, but the proposed corrections still require their own reviewed migration GO. Family foundation approval is not blanket approval of Product membership, visibility or fit.

Each plan has its own allowlist, input hash, before state, rollback rows, after expectations and two empty GO slots. Domain-specific inputs exclude unrelated warranty/compatibility evidence from the class and definition plan hashes. Shared source-governance/registry or before-snapshot changes still require revalidation. Planning one domain never requires every other domain's value decisions to close.

## E-PBI-022 — eight bounded plans

All eight approved mutation sets are empty. Located source evidence and human blockers remain available; absence of an approved value never produces a conflict winner.

| Child PBI | Plan | Domain |
|---|---|---|
| 022A | E-MUT-026 | Electrical voltage/frequency |
| 022B | E-MUT-027 | Motor and operating speed |
| 022C | E-MUT-028 | Blade/wheel/mount |
| 022D | E-MUT-029 | Water/fluid |
| 022E | E-MUT-030 | Durable net/assembled measurements |
| 022F | E-MUT-031 | Crate/packing dimensions |
| 022G | E-MUT-032 | Native Variant shipping-weight corrections |
| 022H | E-MUT-033 | Fulfillment class |

The 81 positive native shipping weights are observations, not newly approved correction inputs. All 44 missing/nonpositive native weights remain gaps. Shipping weight cannot enter a metafield allowlist. Parcel/freight vocabulary is still proposed; no assignment is manufactured.

## E-PBI-023 — eight bounded plans

All eight approved mutation sets are empty. They require separate GO decisions; no combined 023 mutation is accepted.

| Child PBI | Plan | Domain |
|---|---|---|
| 023A | E-MUT-034 | Compatibility |
| 023B | E-MUT-035 | Included components and quantities |
| 023C | E-MUT-036 | Optional components |
| 023D | E-MUT-037 | Recommendations |
| 023E | E-MUT-038 | Customer manuals/files |
| 023F | E-MUT-039 | Diagrams/instructions/videos |
| 023G | E-MUT-040 | Warranty/support relationships |
| 023H | E-MUT-041 | Pickup/regional Product rules |

The four blocked SawMaster compatibility edges remain excluded. Warranty/support may reuse existing `support_files`; no new warranty object or Product terms field is invented. Pickup/regional rules have no approved Shopify storage field, so their plan explicitly requires that contract before any future executable input. Fulfillment class belongs only to 022H, avoiding overlapping ownership.

## Decision and reference handoff

[Human-readable handoff](../epic-e-deferred-decision-handoff.md) is ready to link from a future issue. [Machine-readable handoff](../../../data/epic-e-deferred-decision-handoff.json) preserves 15 ranked groups, original decision IDs/states, named Products, source artifacts, interim behavior, required approval and affected plans. Scheduling unavailability never waives a fact or GO.

| Owner | Decision groups |
|---|---:|
| Product Owner | 11 |
| Technical | 9 |
| Operations | 4 |
| Support | 2 |
| Legal/Business | 2 |
| Admin/Engineering | 2 |
| Media | 1 |

Shared-owner counts overlap. Priorities are the two ambiguous identities; SKU issuance; measurements/packing; fulfillment and pickup/regions; warranty/service; canonical resources/rights; timing authority; technical conflicts; compatibility; EM-1 BOM; exact family membership; remaining Category candidates; grit semantics. Grit and timing authority remain separate deferred contracts/processes, not invented migration domains.

[Reference graph](../../../data/epic-e-reference-graph.json) contains **304 evidence/identity edges**, including Variant parents, proposed family membership, compatibility, components and resource/File associations. Unresolved target slots remain explicitly unresolved. Canonical edges require authority; graph validation rejects wrong classes, orphan/malformed IDs, duplicate/self edges, inferred reverse/family fit, superseded resources and Vendor-only warranty responsibility. Native reference inspection also checks stored reference types, exact targets, duplicate IDs and missing owner approval. Existing local validators continue to own quantities, technical units, policy revisions, availability expiry and resource rights rules.

## Downstream readiness

[Domain matrix](../epic-e-downstream-readiness.md) and its [JSON counterpart](../../../data/epic-e-downstream-readiness.json) distinguish architecture, definition/plan readiness, partial or absent approved inputs, Admin work and customer rendering per domain.

| Consumer | Safe to begin | Deferred trusted facts |
|---|---|---|
| F | Product-page discovery, design and shell planning | Technical, BOM, warranty, freight, fit and downloads until approved and reconciled |
| G | Search/filter architecture and shell planning | Live class/category/SKU data, fit and unresolved grit semantics |
| J | Operational integration planning | Current fulfillment, weights, timing and regional rules |
| K | Shipping/availability contract planning | Live rates/configuration, handling, pickup, weights and timing |
| L | Support/resource interface planning | Canonical manuals/diagrams, compatibility and warranty/service responsibility |
| O | Ownership/reorder integration planning | Verified identity/SKU, fit, support and operational facts |
| P | Applicable support/fulfillment contract planning | Approved warranty, handling and regional facts |

**Epic F discovery/planning may begin before migration.** Shell/design work must omit unresolved claims or use visibly internal fixtures. No domain is declared safe for trusted customer fact rendering from these unmigrated or blocked repository values.

## Validation and retained findings

Commands run:

```text
node scripts/audit-epic-e-admin.js --operational
npm run build:epic-e-batch-4a -- --as-of=2026-09-09T22:12:21.000Z
node scripts/validate-epic-e-batch-4a.js --plan=E-MUT-021
npm run gate:epic-e -- --mode=repository --as-of=2026-09-09T22:12:21.000Z --output=data/epic-e-aggregate-gate-report.json
node scripts/run-epic-e-gates.js --mode=admin --as-of=2026-09-09T22:12:21.000Z
node scripts/run-epic-e-gates.js --mode=migration --as-of=2026-09-09T22:12:21.000Z
```

The repository gate runs `npm run validate:epic-e-batch-4a`, including every prior Epic E suite, **62 Batch 3B**, **67 Batch 3C** and **64 Batch 4A** positive/adversarial checks. New coverage includes all requested negative cases, hash-bound approvals/rollback, domain isolation, expiry, native references, exact definition dependency resolution, deterministic reruns and expected after-state comparisons. Admin and migration modes return **2 intentionally**. The audit credential failure also returns 2; no query ran.

The unchanged Product CSV validator reports exactly **103 findings: 95 missing image-alt texts and eight nonpositive prices**. The repository gate retains every individual finding. The authorized launch-fixture filename correction fixes the crash and exposes three existing ownership gaps: `search`, `machineProduct`, `consumableProduct`. Those are finalization findings, not silently removed assertions. The CSV, its validator, earlier value evidence, desired registry and theme files retain their pre-batch contents.

## Resumed completion

The resumed review reran the approved audit credential check; it still made no query. Availability/timing authority now has explicit blocked downstream rows for F/J/K/O and a domain decision count. Abrasive grit also remains counted outside mutation planning. The builder defaults to the current clock and retains `--as-of` for deterministic reproduction, so a later run cannot silently reuse a September 9 assessment. Three additional regression checks cover those behaviors. The previously missing exact file manifest is now present.

## Files and final state

New: 22 E-PBI-019 plan files and 22 bounded input/before/rollback/after-expectation files under `data/epic-e-migration-plans/`; aggregate policy/report, Admin readiness, migration readiness, reference graph, reviewer schedule/handoff and downstream readiness JSON; eight schemas; the Batch 4A builder/validator/test and gate runner; migration-domain/readiness/mutation-governance libraries; the reviewer handoff, downstream matrix, this record and read-only gate evidence reports.

Modified: `package.json`; existing mutation-plan CLI validator; operational audit query catalog; E-PBI-009 definition comparison; launch-fixture validator filename; Epic E tracker. A generated [file manifest](../epic-e-batch-4a-file-manifest.json) identifies exact paths.

Current PBI state: **001–012 Complete at established scope; 013 evidence complete/human-blocked; 014–017 and 018B architecture complete/values blocked; 018A and 019 Complete; 020–021 planned; 022–023 split/planned; 024 Complete; 025 NOT COMPLETE.**

Recommended next step while reviewers are away: Epic F discovery and contract-based planning. When reviewers return, close the narrowed decisions and obtain fresh read-only reconciliation plus independent Product Owner/Admin GO before any migration. Actual definition creation, native/value/reference population, after-state verification and finalization remain deferred. No mutation executor was introduced or run.
