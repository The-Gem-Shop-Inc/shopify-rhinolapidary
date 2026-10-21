# Epic F Activation Readiness Review

**Evidence assessment:** 2026-09-30T17:14:01.434Z. **Scope:** read-only review, not an implementation batch or activation authorization.

F-PBI-018A remains complete for repository scope; F-PBI-018 remains partial; F-PBI-018B remains open/not ready. The F8 repository aggregate passed. Live activation/release remains incomplete and unauthorized. No activation or execution PBI is technically ready with human GO as its only remaining prerequisite.

The fresh Admin audit succeeded. It confirms all 11 Products still use the default template, have no `rhino` Product metafields, and have no current governed Product definitions. The `machine_family` metaobject definition is absent. `templates/product.machine.json` is absent from all five deployed themes, including the main and preview themes. These are current observations, separate from the historical F8 snapshots. Existing default Product pages may still present historical descriptions or native media: repository suppression and zero F grants do **not** certify current deployed customer containment.

## Current Shopify read and freshness

The source is [activation-review-admin-audit.json](../qa/evidence/epic-f/activation-review-admin-audit.json). It records each exact GraphQL query, variables, response, completion timestamp and pagination. All queries were schema-discovered and validated read-only queries through `mcp__codex_apps__shopify_graphql_query`; no mutation operation was used.

- Shop: Rhino Lapidary, `gid://shopify/Shop/79279947973`, canonical `sz5dnk-nf.myshopify.com`; primary domain `https://rhino-lapidary.myshopify.com`.
- API/environment: Shopify Admin GraphQL through the merchant connector. The connector does not expose its negotiated API version; the audit leaves it null.
- Exact 11-Product read: 2026-09-30T17:08:12.748Z–17:08:13.700Z. Fields: ID/title/handle/status/suffix/updatedAt/publishedAt/onlineStoreUrl, all `rhino` Product metafields, media identities/alt/image metadata, publication membership and bounded native Variant availability/inventory policy. Each metafield/media/publication/Variant connection was exhausted; no additional pages remained.
- Definitions read: completed 17:13:48.427Z, all `rhino` PRODUCT metafield definitions and exact `machine_family` definition. No remaining page; zero definitions/null respectively.
- Themes read: completed 17:14:01.434Z, all five theme IDs/names/roles/update times and exact machine-template filename/checksum metadata. No remaining themes or file pages; zero matching files.
- Conservative freshness boundaries: Products expire at **17:23:13.700Z**, definitions at **17:28:48.427Z**, themes at **17:29:01.434Z**, using the existing F7 900-second policy. They were current at assessment; those windows elapsed during report preparation. Generating this report does not refresh them.

The bounded audit is not an F7 execution before-read: protected-field digests and complete execution/release evidence are missing. Immediately before any separately authorized execution, obtain the complete policy-required read and recheck drift, eligibility and both GO roles. No dependent accessory Products, Files/Pages/policies, live rights approvals, delivery/location configuration, analytics configuration or actual storefront journeys were audited. Publication membership is readable; customer behavior was not verified. Product `updatedAt` is a resource timestamp, not the observation timestamp; no independent resource version was exposed.

## All 11 machine Products

Every current suffix is **null**, intended suffix **machine**, and suffix drift against F7 is **unchanged**. All 11 require a suffix change if included in a separately approved assignment scope. None has satisfied execution prerequisites. The three exclusions remain exclusions despite Product status/publication observations.

| Machine | Exact Product GID | Current status | Online Store publishedAt / published channels | F7 planning scope |
|---|---|---|---|---|
| BeadMaster 6" | gid://shopify/Product/8905779937477 | ACTIVE | 2026-07-02T16:54:05Z / 4 | Conditional future candidate |
| EM-1 Machine | gid://shopify/Product/8905780756677 | ACTIVE | 2026-07-02T16:54:18Z / 4 | Conditional future candidate |
| JadeMaster, 14" | gid://shopify/Product/8905781248197 | ACTIVE | null / 1 | Explicit exclusion |
| LapMaster 12" | gid://shopify/Product/8905781412037 | ACTIVE | 2026-07-02T16:54:30Z / 4 | Conditional future candidate |
| LapMaster 18" | gid://shopify/Product/8905781477573 | ACTIVE | 2026-07-02T16:54:31Z / 4 | Conditional future candidate |
| SawMaster 18" | gid://shopify/Product/8905784131781 | ACTIVE | 2026-07-02T16:55:19Z / 4 | Conditional future candidate |
| SawMaster 24" | gid://shopify/Product/8905784197317 | ACTIVE | 2026-07-02T16:55:20Z / 4 | Conditional future candidate |
| SawMaster, 36" | gid://shopify/Product/8905784262853 | DRAFT | null / 0 | Explicit exclusion |
| ShapeMaster 6" | gid://shopify/Product/8905784328389 | ACTIVE | 2026-07-02T16:55:23Z / 4 | Conditional future candidate |
| TrimMaster | gid://shopify/Product/8905785344197 | ACTIVE | 2026-07-02T16:55:43Z / 4 | Conditional future candidate |
| TumbleMaster | gid://shopify/Product/8905785868485 | DRAFT | null / 0 | Explicit exclusion |

All `onlineStoreUrl` values are null; this does not negate a non-null publishing timestamp or prove a route inaccessible. JadeMaster's one published channel does not establish Online Store publication. All queried Variants report availableForSale=true and DENY inventory policy, including drafts; this does not prove actual purchase behavior, dispatch timing or customer visibility. Historical storefront evidence showed Sold out despite Admin aggregate availability. Exact current handles, update times, publication IDs, Variant IDs and null class values are in the machine-readable matrix.

## Ready for human decision / GO

**Ready for an existing human decision:** F-PBI-013/F-DEC-001 asks Business/Product Owner and Shopify Admin Owner to choose retaining native provider-owned `payment_terms` or suppressing them. Legal owns any additional explanatory claims. No dated choice was found. Native Shop Pay terms do not resolve the decision; this review changes neither the widget nor payment configuration.

F-DEC-002's exact-media-use decision and the existing U owner/consent/collector decisions can also be reviewed now. They do not provide activation GO. **Ready for GO alone:** none of F-PBI-004B/006B/007B/008B/009B/010B/011B/014B/015B/017B/018B or F-PBI-016 instrumentation.

## Needs machine expert or business decision

The owning handoff retains blocked states and original source states separately. B3B-D06 is pending in its source and blocked in the downstream handoff; B3C-D03 remains blocked. There is no newly approved expert packet. Lower-authority descriptions, manuals, photos, Vendor, filenames, working routes or native behaviors cannot settle these decisions.

| Existing PBI | Current state and independent blockers | Required owning decisions | Next safe action |
|---|---|---|---|
| F-PBI-004B media | Open/not ready; rights/use, factual alt, embedded claims, lifecycle/model approval and Shopify parity missing | F-DEC-002; applicable existing Media/Brand governance | Review the ten exact attachments below with their owners |
| F-PBI-006B specs | Open/not ready; exact value approval, migration, reconciliation, eligibility, authorization and parity missing | B3B-D03 technical; B3B-D05 measurements | Review exact Product/configuration technical values in existing packets |
| F-PBI-007B contents | Open/not ready; approved component identity/quantity and separate optional/noncatalog scope missing; migration/reconciliation pending | B3B-D04, C-040 | Review EM-1 manual/catalog/sales-list conflicts; retain null values |
| F-PBI-008B context | Open/not ready; no approved fit edges/recommendations; dependent target visibility and migration/reconciliation unverified | B3B-D02, PO-E-012, PO-E-013; B3B-D04 recommendations | Review existing exact edges without generating new fit claims |
| F-PBI-009B operations | Open/not ready; handling, pickup/region and timing have separate unapproved authorities | B3C-D01, B3C-D02, B3C-D04 | Review each operational decision independently |
| F-PBI-010B warranty | Open/not ready; distinct roles, policy revision, coverage, mappings/exceptions and destination unapproved | B3C-D03; B3B-D06 destination/resources | Review existing Support/Legal packet; Vendor is not warranty authority |
| F-PBI-011B resources | Open/not ready; no approved canonical resource; lifecycle/rights/publication/version/mapping missing | B3B-D06; F-DEC-002 where Product media/video use applies | Review exact File/resource and Product scope; support_files stay forbidden |
| F-PBI-013 payment | Open; business visibility decision required | F-DEC-001 | Prepare the existing retain/suppress choice for its owners |
| F-PBI-016 instrumentation | Contract complete; instrumentation blocked | Existing Epic U Analytics/Privacy ownership, consent and collector decisions | Review the existing U authority; emit/install nothing |

PO-E-012 concerns Automatic Feed Clamp identity; PO-E-013 concerns Saw Vice Plate Set identity. Both remain blocked before exact SKU/fit approval. Other retained handoff diagnostics include SKU-ALLOCATIONS/PO-E-041, FAMILY-MAPPINGS, CATEGORY-CANDIDATES/PO-E-005 and B3B-D07. They are not blanket requirements for every F domain or a shell-only scope.

### Media: exact observed candidates, zero eligible grants

All current media identities match the historical inventory. There are ten attachments and nine unique images; every alt is blank. Shopify media status READY proves processing, not rights, exact-model approval or customer use permission. No new qualifying approval was found.

| Product | Exact MediaImage GID | Additional retained concern |
|---|---|---|
| BeadMaster | gid://shopify/MediaImage/33451099455685 | Product use/alt/claim/lifecycle review unapproved |
| EM-1 | gid://shopify/MediaImage/33451101683909 | Historical patent wording; owner claim review absent |
| JadeMaster | gid://shopify/MediaImage/33451104075973 | Excluded; Product use approval absent |
| LapMaster 12 | gid://shopify/MediaImage/33451104895173 | Product use approval absent |
| LapMaster 18 | gid://shopify/MediaImage/33451105255621 | Product use approval absent |
| SawMaster 18 | gid://shopify/MediaImage/33451117576389 | Product use approval absent |
| SawMaster 24 | gid://shopify/MediaImage/33451117871301 | Shared with 36; exact-model scope unresolved |
| SawMaster 36 | gid://shopify/MediaImage/33451117871301 | Shared with 24; exclusion retained |
| ShapeMaster | gid://shopify/MediaImage/33451118428357 | Product use approval absent |
| TrimMaster | gid://shopify/MediaImage/33451123409093 | Product use approval absent |
| TumbleMaster | None | No media; exclusion retained |

Every candidate requires exact Product/media/use, rights, factual alt, embedded-claim and lifecycle approval. Homepage approval is not Product approval. Photos with staged tools/materials cannot establish inclusion. Fresh image metadata does not replace the historical visual review or establish legal claim approval.

### Facts, contents, context and operations

**eligibleLiveSpecificationGrants=0; eligibleLiveContentsGrants=0.** No exact approved technical values have all migration, reconciliation, consumer eligibility and activation prerequisites. No technical facts were inferred from manuals/descriptions/media. The contents evidence has 22 candidate lines, zero approved, 21 conflicting, and zero recommendations. C-040 retains six-wheel/manual versus sales-list says-six/lists-five and 60-versus-80-grit conflicts. Compatibility and recommendations do not establish box contents; optional and noncatalog component approval remain separate.

Compatibility has **42 existing edges: zero approved, 38 proposed, four blocked**. EDGE-001/002 connect Automatic Feed Clamp `8905779871941` to SawMaster 18/24; EDGE-005/006 connect Saw Vice Plate Set `8905784099013` to the same machines. Exact GIDs, scopes, Variant scope, blockers and source evidence remain in the matrix. No edge was added. No dependent Product was freshly queried, so current customer-visible dependent-target eligibility remains unverified even where machine publication is observed. None is migrated/reconciled or authorized for activation.

Handling B3C-D01, pickup/region B3C-D02 and timing B3C-D04 remain separate Operations/Product Owner decisions. The owning B3C approvals array is empty. Weight/profile/rate/crate observations confer no freight approval; working native pickup confers no seasonal pickup policy; absent restrictions confer no worldwide promise; native inventory confers no dispatch timing.

Warranty B3C-D03 still needs manufacturer where applicable, issuer, administrator, repair provider, policy revision/class/coverage, exact Product mapping/exceptions and a customer-safe destination. Historical one-year/90-day wording remains unapproved observation. All approval-dependent role/value fields stay null in the review.

The resource catalog indexes 110 records, 74 existing File identities and ten content-associated candidates; **canonicalApproved=0**. B3B-D06 must approve exact Product/File/type/version/lifecycle/language/rights/publication/customer visibility/destination; Product-surface media/video approval is additional where applicable. Neither newest upload, filename/hash nor a working legacy Page determines canonical status. No File/Page currentness audit was run. Customer `support_files` remain forbidden.

## Needs data migration / reconciliation

The approved architecture is substantially complete. That does not complete Epic E execution. PO-E-001 approves class `machine` for all 11 Products, but every live class value is absent. E-MUT-020 has 38 approved desired-definition rows; E-MUT-021 has 122 approved catalog classification rows. These are repository counts, not a 122-Product live audit. Both existing plans retain absent Product Owner/Admin Owner GO and unsatisfied execution prerequisites. The historical migration-readiness artifact says admin_inaccessible; this review supersedes that access limitation only for its bounded datasets and does not rewrite the historical artifact.

The matrix separates 19 relevant E domains: definitions, product_class, machine_family, electrical, motor_speed, tool_mount, water_fluid, durable_measurements, crate_measurements, fulfillment_class, compatibility, included_components, optional_components, recommendations, customer_manuals, diagrams_instructions_videos, warranty_support, pickup_region and availability_authority. For each it records desired-value approval, current definition observation, migration, after-state reconciliation, consumer eligibility and activation authority separately. Definitions/product_class have approved repository values; other relevant factual/family domains remain owner blocked. Governed live values are absent on the 11 machines; selected-scope migration and verified after-state consumer reconciliation remain required. Pickup/timing also lack approved durable owner contracts. Native category/Vendor/SKU migration conclusions were not invented from this audit.

| Exact migration plan | Relevant domain | Owning value blocker |
|---|---|---|
| E-MUT-020 / 021 / 025 | Definitions / product_class / machine_family | Definitions and class approved; family mappings blocked |
| E-MUT-026 / 027 / 028 / 029 | Electrical / motor speed / tool mount / water-fluid | B3B-D03 |
| E-MUT-030 / 031 | Durable / crate measurements | B3B-D05 |
| E-MUT-033 | Fulfillment | B3C-D01 |
| E-MUT-034 | Compatibility | B3B-D02, PO-E-012, PO-E-013 |
| E-MUT-035 / 036 / 037 | Included / optional / recommendations | B3B-D04; C-040 contents conflict |
| E-MUT-038 / 039 | Manuals / diagrams-instructions-videos | B3B-D06 |
| E-MUT-040 | Warranty/support | B3C-D03, B3B-D06 |
| E-MUT-041 | Pickup/region | B3C-D02 |
| No approved durable timing population plan | Timing/availability authority | B3C-D04 |

No verified execution/after-state receipt was found in the inspected owning migration artifacts; fresh absence observations are not successful migration receipts. Relevant definitions, approved exact values, separately authorized migrations, reconciled after-state and a current F eligibility build remain prerequisites. No migration was performed here.

## Needs current Shopify read

This review obtains the bounded current Product/definition/theme observations requested above. Release-current evidence still requires applicable complete datasets and freshness; unqueried Files/policies/dependent Products/consent/operations must not be called current. The consumer release's September expiry is retained; this review does not refresh the actual consumer release or build activation grants.

F-PBI-017B remains **open/blocked/not authorized**. F7 plan hash is `e69138cf06cdab34f7560058d156dfe0f4f042cc94d395582dd55fde1cfd7146`; intended suffix `machine`; 11 assessed; eight conditional future candidates; three exclusions; **current eligible=0, executable=0**. Product Owner GO=false; Shopify Admin Owner GO=false; production theme publication authorization=false. Template suffix drift=0. Current exact identity is observed, but definitions/class migrations, consumer eligibility, deployed template, complete protected before-read and both GO approvals are missing. The only assignment write allowlist remains `templateSuffix`; historical null rollback values are retained, with actual rollback execution readiness dependent on the fresh complete before-read and GO. This audit is not GO and does not make a candidate executable.

## Needs preview / release validation

**F-PBI-014B remains open/partial.** F2–F6 local regression evidence passed with zero serious/critical axe findings in tested scopes. Shell widths: 320/360/390/768/1024/1440/1920; module widths: 320/390/768/1440. Shell/specs-contents/context-delivery/support-resource evidence includes 200% root-font enlargement and actual Chromium 200% zoom with layout/DPR checks. Gallery inherits shell enlargement/zoom evidence plus separate gallery zoom inspection and modal/focus coverage. Keyboard/focus passed locally. Fixture coverage is substantial, but actual Shopify-rendered global chrome/provider integration, approved live media parity and release-only journeys remain unproven.

Plan the selected-scope native purchase/sold-out/Variant states, neutral Contact route/context integration, cart/global header/footer, provider terms/native pickup, suppressed-empty and genuinely approved module/media states, downloads/gallery focus/modal behavior, widths/enlargement/actual zoom and axe coverage. Journeys needing submissions require separate authorization; this review submitted nothing. Existing P ownership for specialized Product-aware Contact remains unresolved; the shell cannot promise quote/reserve behavior.

**F-PBI-018B remains open/not ready.** It needs a concrete release scope, complete current relevant Admin evidence, applicable owner value approvals, migrations/reconciliation and consumer eligibility, applicable deployed template and actual assignment, authorized Shopify-rendered preview/live verification, remaining 014B evidence, 015B release certification, selected-domain owner signoffs and separate production go/no-go. A shell-only scope avoids factual activation dependencies for omitted domains; it does not bypass the existing F7 definition/class prerequisites, payment decision, native integration, parity/certification or release ownership.

## Intentionally deferred

**F-PBI-015B remains deferred.** The harness is ready and F3–F6 local regression passed. F3 covers zero/one/multiple/several/video media and deliberate oversized/eager/autoplay/third-party/duplicate/draft failures; F4 covers zero/specs/long/contents/large contents; F5 zero/small/large/delivery/combined; F6 zero/support/downloads/video/combined. These are single local fixture observations, not release medians or production results.

Certification currently lacks selected release scope, an authorized deployed preview/release target, applicable template assignment and actual integration/parity. No certification was run. Existing `data/brand-performance-budget.json` and source-bound F performance protocols remain unchanged; no new fixture/harness, requests, JavaScript, CSS or threshold changes were introduced.

F-PBI-016's contract is complete while actual instrumentation remains blocked, not merely deferred for convenience. Four native owner slots remain singular; all four actual owner assignments and consent approvals are unresolved, collector mapping and deduplication identity unverified. U/Analytics and Privacy ownership govern activation. `instrumentationReady=false`; no adapter was installed, event emitted or live analytics test run. Existing native analytics configuration was not audited or described as disabled.

## Smallest truthful next step and dependency order

A shell-only machine-page release is technically conceivable because the repository shell and safe suppression exist. It is not authorized or immediately executable. The smallest safe action now is to prepare a concrete shell-only scope against the **existing eight F7 future candidates**, review the already-approved desired definitions/class values and existing E-MUT-020/021 prerequisites, and prepare the F-DEC-001 owner choice. There is no presently eligible F activation mutation. Any future selected target set must satisfy the existing plan/policy's exact scope, drift and GO rules; this review creates no new rollout plan.

Objective dependency order:

1. Select bounded release scope. Obtain existing machine-expert/business approvals only for facts chosen for activation; omitted factual domains stay suppressed. Resolve the native payment visibility decision and applicable release ownership.
2. Review approved E inputs; separately authorize and execute applicable existing definition/value migrations, then verify/reconcile after-state. Definitions/class remain required under F7 even for shell-only assignment.
3. Rebuild fresh source-bound F consumer/media eligibility for the approved scope. Zero grants can remain the intentional shell-only result.
4. Separately authorize deployment to a concrete preview theme and exact template assignment. Require current complete protected before-read, no plan drift, approved exact targets and both GO roles. No production permission is implied.
5. Obtain actual Shopify-rendered parity and the remaining applicable 014B evidence.
6. Run separately authorized 015B release performance certification using unchanged budgets/protocol.
7. Obtain 018B aggregate signoff and concrete activated-domain owner signoffs.
8. Make a separate explicit production go/no-go decision.

Independent lanes: payment visibility; exact-media rights/use/alt/claims; technical/measurements; BOM; compatibility/ambiguous dependent identities; warranty/operations; canonical resources; U owner/consent/collector/deduplication; and read-only E/class/shell scope planning. Canonical resources and warranty destinations share dependencies; BOM does not follow from compatibility; instrumentation does not follow from template assignment. No subjective priority ranking is assigned.

## Grants, diagnostics and evidence limits

Actual governed release grants before/current are **0/0 in every domain**: media, specifications, contents, contextual, delivery, warranty, manuals, diagrams/instructions, videos and support_files. Fixtures were excluded. Fresh Product values are also absent, but this does not erase native/default-theme content or certify it safe.

Historical diagnostics are retained without resolving or promoting them: launch fixture ownership `search` and `consumableProduct`; Product CSV 103 findings (95 missing alt, eight nonpositive price); 37 historical description claim matches suppressed/unapproved in governed outputs; seven broken Manuals-hub destinations. F1 claims containment and Product JSON-LD containment passed for repository/local outputs, retaining valid native Product identity/Offers and omitting governed technical/relationship/support fallbacks. Current deployed containment/parity remains unverified.

The [matrix](../../data/epic-f-activation-readiness-review.json) binds 141 source hashes, including F8/F1–F7 evidence, owning E decisions/plans, current read, actual release artifacts, rollout, measurement/U and unchanged budgets. The [schema](../../schemas/epic-f-activation-readiness-review.schema.json) and validator enforce independent dimensions and compare the whole projection to actual sources. Review-specific adversarial checks cover false promotions; the existing F8 validator and adversarial suite are reused. Browser fleets and release certification are not rerun.

## Files and validation

Only review files are added: data matrix; schema; current Admin audit; library; validator; adversarial tests; their evidence; this report; validation evidence. Exact hashes/commands/exits are recorded in [activation-review-validation.json](../qa/evidence/epic-f/activation-review-validation.json). PBI completion states, tracker, F1–F8 sources and storefront/runtime files are unchanged.

Commands: `node scripts/validate-epic-f-activation-readiness-review.js`; `node scripts/test-epic-f-activation-readiness-review.js`; `node scripts/test-epic-f-machine-page-readiness.js` (existing F8 negatives); `git diff --check`. The review validator also invokes existing F8 source/runtime/schema validation. Every final command exits 0. Existing F8 Theme Check and F1–F7 aggregate evidence remain source-bound; no theme changes require a second full browser/Theme Check fleet.

Shopify Admin mutation: **No**. Template assignment: **No**. Product/Variant/metafield/metaobject/data/media/alt/File/Page/policy mutation: **No**. Analytics/pixel/consent or shipping/location configuration: **No**. Preview/production theme push, publication or Product publication: **No**. F-PBI-017B/018B execution or B-scope activation: **No**. No new PBI, storefront/runtime delta, performance threshold change or release authorization.
