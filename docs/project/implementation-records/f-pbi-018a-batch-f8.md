# F-PBI-018A — Batch F8 repository readiness packet

F-PBI-018A is complete for repository/static/local-fixture aggregation. F-PBI-018 remains Partial. F-PBI-018B is Open/not ready and has not been performed. Epic F repository architecture is substantially complete; live activation/release is not complete or authorized. Epic E is not closed by this packet.

F8 adds reporting, schemas, validators, adversarial tests, evidence and tracker updates. It consumes the actual F1–F7 artifacts. Safe suppression remains successful repository behavior, while fact approval, migration, activation, customer presentation and release certification remain separate dimensions. The packet uses repositoryAggregatePassed and never a global ready/releaseReady flag.

## Reviewable artifacts

- [Readiness packet](../../../data/epic-f-machine-page-readiness.json)
- [Readiness schema](../../../schemas/epic-f-machine-page-readiness.schema.json)
- [Readiness contract/source pins](../../../data/epic-f-machine-page-readiness-contract.json)
- [Validator](../../../scripts/validate-epic-f-machine-page-readiness.js)
- [Adversarial tests](../../../scripts/test-epic-f-machine-page-readiness.js)
- [F8 validation evidence](../../qa/evidence/epic-f/batch-f8-validation.json)
- [Exact F7-relative manifest](../epic-f-batch-f8-file-manifest.json)

## All 11 machines

Every row has repository renderers complete for the seven factual modules, value state blocked, migration/reconciliation blocked, activation not granted and repository customer modules suppressed. Eligible values/current live suffixes are null. Actual Shopify customer presentation and parity remain unverified. Approved desired Product class is recorded separately from unverified live classification migration. Historical states below are September observations, not current Admin assertions.

| Machine | Exact Product GID | Historical Product state | F7 planning disposition | Current eligible / executable |
|---|---|---|---|---|
| BeadMaster 6" | gid://shopify/Product/8905779937477 | ACTIVE; historical_published | Conditional future candidate | 0 / 0 |
| EM-1 Machine | gid://shopify/Product/8905780756677 | ACTIVE; historical_published | Conditional future candidate | 0 / 0 |
| JadeMaster, 14" | gid://shopify/Product/8905781248197 | ACTIVE; unpublished | Explicit exclusion | 0 / 0 |
| LapMaster 12" | gid://shopify/Product/8905781412037 | ACTIVE; historical_published | Conditional future candidate | 0 / 0 |
| LapMaster 18" | gid://shopify/Product/8905781477573 | ACTIVE; historical_published | Conditional future candidate | 0 / 0 |
| SawMaster 18" | gid://shopify/Product/8905784131781 | ACTIVE; historical_published | Conditional future candidate | 0 / 0 |
| SawMaster 24" | gid://shopify/Product/8905784197317 | ACTIVE; historical_published | Conditional future candidate | 0 / 0 |
| SawMaster, 36" | gid://shopify/Product/8905784262853 | DRAFT; unpublished | Explicit exclusion | 0 / 0 |
| ShapeMaster 6" | gid://shopify/Product/8905784328389 | ACTIVE; historical_published | Conditional future candidate | 0 / 0 |
| TrimMaster | gid://shopify/Product/8905785344197 | ACTIVE; historical_published | Conditional future candidate | 0 / 0 |
| TumbleMaster | gid://shopify/Product/8905785868485 | DRAFT; unpublished | Explicit exclusion | 0 / 0 |

## Domain readiness

| Domain | Owning PBI | Implementation | Fact/value | Reconciliation | Authorization | Repository presentation | Shopify parity | Release certification |
|---|---|---|---|---|---|---|---|---|
| machine_shell | F-PBI-002 | complete | not_applicable | not_applicable | not_applicable | not_applicable | unverified | blocked |
| native_purchase | F-PBI-003 | complete | not_applicable | not_applicable | not_applicable | not_applicable | unverified | blocked |
| contact | F-PBI-012 | complete | not_applicable | not_applicable | not_applicable | not_applicable | unverified | blocked |
| media | F-PBI-004A, F-PBI-004B | complete | blocked | blocked | not_granted | suppressed | unverified | blocked |
| specifications | F-PBI-006A, F-PBI-006B | complete | blocked | blocked | not_granted | suppressed | unverified | blocked |
| contents | F-PBI-007A, F-PBI-007B | complete | blocked | blocked | not_granted | suppressed | unverified | blocked |
| contextual | F-PBI-008A, F-PBI-008B | complete | blocked | blocked | not_granted | suppressed | unverified | blocked |
| delivery | F-PBI-009A, F-PBI-009B | complete | blocked | blocked | not_granted | suppressed | unverified | blocked |
| warranty | F-PBI-010A, F-PBI-010B | complete | blocked | blocked | not_granted | suppressed | unverified | blocked |
| resources | F-PBI-011A, F-PBI-011B | complete | blocked | blocked | not_granted | suppressed | unverified | blocked |
| payment_decision | F-PBI-013 | partial | blocked | not_applicable | not_granted | not_applicable | unverified | blocked |
| accessibility | F-PBI-014A, F-PBI-014B | partial | not_applicable | not_applicable | not_applicable | not_applicable | unverified | blocked |
| performance | F-PBI-015A, F-PBI-015B | complete | not_applicable | not_applicable | not_applicable | not_applicable | unverified | deferred |
| measurement_contract | F-PBI-016 | complete | not_applicable | not_applicable | not_applicable | not_applicable | not_applicable | blocked |
| measurement_instrumentation | F-PBI-016 | not_started | blocked | not_applicable | not_granted | not_applicable | unverified | blocked |
| rollout_plan | F-PBI-017A | complete | not_applicable | not_applicable | not_applicable | not_applicable | not_applicable | blocked |
| rollout_execution | F-PBI-017B | not_started | blocked | blocked | not_granted | not_applicable | unverified | blocked |
| claim_containment | F-PBI-005 | complete | not_applicable | not_applicable | not_applicable | not_applicable | unverified | blocked |
| product_json_ld | F-PBI-005 | complete | not_applicable | not_applicable | not_applicable | not_applicable | unverified | blocked |

Native Product purchase/Variant availability, native pickup and payment terms are preserved surfaces, not F factual grants. Contact is a neutral route/context implementation; no Contact form, checkout or order submission occurred. Media rights/model/alt approval, technical facts, BOM, fit, operational promises, warranty/service and canonical resources remain blocked and suppressed in the repository release projection. Payment/installment decision F-PBI-013 / F-DEC-001 remains open.

## Actual grants

| Domain | Before | Current | Actual customer release source |
|---|---|---|---|
| media | 0 | 0 | data/epic-f-media-release.json |
| specifications | 0 | 0 | data/epic-f-consumer-release.json |
| contents | 0 | 0 | data/epic-f-consumer-release.json |
| contextual | 0 | 0 | data/epic-f-consumer-release.json |
| delivery | 0 | 0 | data/epic-f-consumer-release.json |
| warranty | 0 | 0 | data/epic-f-consumer-release.json |
| manuals | 0 | 0 | data/epic-f-consumer-release.json |
| diagrams_instructions | 0 | 0 | data/epic-f-consumer-release.json |
| videos | 0 | 0 | data/epic-f-consumer-release.json |
| support_files | 0 | 0 | data/epic-f-consumer-release.json |

Consumer total before/current: 0/0. Media before/current: 0/0. Fixture values are excluded. Any unexpected nonzero row fails closed with its exact domain/source, including unknown domains. Current live Admin values are unverified; repository zero counts do not claim a new live audit. Diagrams/instructions and video share the upstream resource domain; every row count is exactly zero, so no unsupported nonzero-grant classification is inferred.

## Evidence freshness and Epic E

Packet generation/assessment: 2026-09-30T15:48:42.398Z. Source observation dates and SHA256 provenance are separate fields. No live query was run and no source timestamp was changed.

- docs/qa/evidence/epic-e/2026-09-03-epic-e-admin-snapshot.json: observed 2026-09-03T17:52:28.268Z; freshness boundary 2026-09-10T17:52:28.268Z; **stale**. Historical Epic E dataset snapshot. Epic E maximumAgeDaysForMutationPlanning=7.
- docs/qa/evidence/epic-f/2026-09-10-machine-admin-read.json: observed 2026-09-10T21:05:58.000Z; freshness boundary 2026-09-10T21:20:58.000Z; **stale**. 11 exact machines; incomplete protected-field/theme/publication execution coverage. F7 before-read maximum age 900 seconds; historical incomplete read never authorizes execution.

Fresh Admin evidence is required for machine identity/template/purchase/contact integration, governed fact domains, payment/widget parity, accessibility, performance, containment and rollout execution. Historical snapshots remain usable as historical inputs only. Epic E desired definitions/class approvals do not prove migration. Complete current E reconciliation, definitions migration, Product-class migration, exact current identity and consumer eligibility prerequisites all remain false.

Inherited owning blockers remain B3B-D03 technical, B3B-D05 measurements, B3B-D04 BOM/recommendations, B3B-D02 and PO-E-012/013 compatibility, B3C-D01 fulfillment, B3C-D02 pickup/region, B3C-D04 availability/timing, B3C-D03 warranty/service (blocked), and B3B-D06 canonical resources (pending). The packet retains the full F downstream rows, plan IDs and deferred decision states. No decisions were reopened or solved.

## Claims and Product JSON-LD

F1 source scans and rendered/customer negatives are inherited, including all 11 saved machine identities, description bypasses, title/tag/collection classification fallbacks, Custom Liquid, encoded/hidden claims, search/card/cart surfaces and Product JSON-LD. F3–F6 preserve typed domain/resource/media suppression. Product descriptions, titles, tags, collections, Vendor, Product Type, media captions/filenames, manuals/resources, recommendations, shipping profile/rate names and legal policy prose remain containment review surfaces; repository/saved source coverage is not a fresh Admin policy audit.

Local JSON-LD tests retain native Product identity and valid Offers, while suppressed technical/relationship/support facts and unreviewed description/media fallback are absent. Live structured-data parity remains unverified. Historical 37 description claim matches remain unresolved/unapproved and suppressed by repository release behavior; existing live pages are not newly certified safe.

## Accessibility and performance

F2 shell covers 320/360/390/768/1024/1440/1920 px. F3 gallery, F4 specs/contents, F5 contextual/delivery and F6 support/resources cover 320/390/768/1440 px. Evidence retains keyboard/source order, visible focus, semantic relationships, modal entry/containment/return, native deferred-video interaction and zero serious/critical axe findings in tested local states. F2/F4/F5/F6 record 200% root-font enlargement separately from actual Chromium chrome.tabs.setZoom(2), verified viewport and DPR reflow; gallery retains modal/inspection coverage and inherited shell zoom. Global chrome and cross-origin/provider limitations remain visible.

F-PBI-014B remains Open/Partial: approved live media parity, actual Shopify-rendered integration/release parity and release-only journeys remain unproved. Passing fixtures do not certify the live release.

F-PBI-015A harness is complete and local regression passed. F3 states: zero/one/multiple/several/video plus expected failures for oversized hero/secondary, eager secondary/video, autoplay, synchronous third-party, duplicate script and draft/error identity. F4: zero/specifications/long/contents/large-contents. F5: zero/small/large/delivery/combined. F6: zero/support/downloads/video/combined. Each is tested locally on mobile/desktop where recorded; deliberately invalid F3 cases are expected rejections, not passing budget samples.

Budgets remain LCP 2500 ms, CLS 0.1, TBT proxy 200 ms, initial transfer 2097152 bytes, requests 120 mobile/130 desktop; image totals 512000/921600 bytes and largest/first-screen image limits 358400/512000 bytes. Video/autoplay/synchronous third-party limits remain zero. Full source budgets and observations are retained. These are cold/no-store, unthrottled single local observations with 1500 ms settle; F8 creates no new fixture, release median or production result. F-PBI-015B remains Deferred.

## Measurement and rollout

Measurement contract implementation is complete; instrumentation remains blocked. Four singular native owner reservations remain, with zero actual assigned owners and unresolved U owner/consent/tooling decisions. No events were emitted; analytics is not reported active.

F7 rollout plan hash: e69138cf06cdab34f7560058d156dfe0f4f042cc94d395582dd55fde1cfd7146. Intended suffix: machine. Assessed Products: 11. Conditional future candidates: eight. Exclusions: JadeMaster, SawMaster 36, TumbleMaster. Current eligible targets: zero. Executable targets: zero. Product Owner GO: false. Shopify Admin Owner GO: false. Execution remains blocked/not authorized.

Before execution, a fresh complete bounded read must be no older than 900 seconds and must cover exact identity, status/publications, template/classification, theme/environment and protected-field digests. Future write allowlist is only templateSuffix. Rollback planning preserves exact historical null versus empty/custom prior suffix values; executable rollback requires the new complete before-read and both bounded GO roles. Production-theme publication authorization remains false and is never bundled with assignment.

## Historical diagnostics

- Launch fixture ownership: exactly search and consumableProduct; historical diagnostic exit 1.
- Product CSV: exactly 103 findings, 95 missing image alt and eight nonpositive prices; historical diagnostic exit 1.
- Description claims: 37 historical matches, suppressed/unapproved.
- Manuals hub: seven historically broken destinations; not rechecked live.

Exact diagnostic signatures are hash-bound and drift fails the repository check. Their resolution belongs to separate owners and is not required to pass 018A. Older resolved ownership counts are not restored.

## Validation and F8 delta

Run npm run validate:epic-f-batch-f8. It runs the readiness validator and 66 adversarial tests, then F7 once (recursively retaining F1–F6), Theme Check and git diff --check. Fresh nested execution evidence is distinct from immutable historical source evidence. The final F8 evidence lists every command/exit, F1–F7 results and exact packet hash. Historical expected diagnostic failures retain exit 1 separately from required passing regressions.

Build the exact manifest with node scripts/build-epic-f-batch-f8-manifest.js and verify it with node scripts/validate-epic-f-batch-f8-manifest.js. The F7 file-state reconstruction was captured on resume before further F8 edits, with inherited F7 hashes/source pins verified; its actual capture time is separate from the earlier governance baseline. This baseline separates all prior uncommitted F1–F7 theme changes from F8. Every F8 created/modified artifact has SHA256 before/after values; only manifest self hash is excluded to prevent circular hashing. The manifest is the exact created/modified file list.

F8 storefront runtime/theme delta: none. New storefront requests: zero. New runtime JavaScript: zero. New CSS: zero. Performance threshold change: No. Product template assignments remain unchanged by this batch; current actual assignments were not reread.

| Action performed | F8 |
|---|---|
| shopifyAdminMutation | No |
| productTemplateAssignment | No |
| productDataMutation | No |
| filePagePolicyMutation | No |
| analyticsPixelConsentChange | No |
| shippingLocationChange | No |
| previewThemePush | No |
| productionThemePush | No |
| productionPublication | No |
| productPublication | No |
| checkoutOrderContactSubmission | No |

## Before F-PBI-018B can run

- Current complete relevant Admin evidence.
- Applicable owner decisions and migrations/reconciliation for concrete selected release scope.
- Separately authorized F-PBI-017B assignment if selected scope requires it.
- Authorized Shopify-rendered preview/live verification.
- Remaining F-PBI-014B parity evidence.
- F-PBI-015B release performance certification.
- Owner signoffs for concrete activated domains.
- Explicit production go/no-go outside F8.

Concrete selected release scope must preserve all nonselected suppressed domains. Warranty/service also needs policy/class/exact Product role mapping and applicable E-PBI-016 migration; resources need B3B-D06/E-PBI-018B exact Product/File/canonical version, language/rights/publication review, valid destinations and Product-surface video/media approval. Remaining media/spec/BOM/context/operational grants need their owning decisions and separate B-scope activation authorization. U instrumentation needs its separate owner/consent/tooling decision. F8 stops at repository aggregation: neither F-PBI-017B nor F-PBI-018B is executed.


The first complete F8 invocation returned exit 1 solely because two tracker status lines introduced by F8 retained trailing whitespace. All actual F1–F7 suite checks and Theme Check passed; all browser tests passed (58 shell, 32 gallery, 27 facts, 32 context/delivery, 29 support/resources). The [original whitespace findings](../../qa/evidence/epic-f/batch-f8-first-diff-check.json), failed invocation and every nested command exit remain archived in [first-attempt evidence](../../qa/evidence/epic-f/batch-f8-first-attempt.json). After removing those two spaces, npm run validate:epic-f-batch-f8 -- --recheck-diff-only reruns the readiness checks and Theme Check, verifies unchanged packet/source/runtime hashes and complete original suite evidence, then reruns git diff --check. It records a separate recovery gate; it never rewrites the original F2–F7 invocation exits or reruns the complete Playwright fleet merely for Markdown whitespace. The default runner continues to invoke the full F7 aggregate.


Final F8 repository aggregate result: **Passed, exit 0**. Final validation commands/exits:

| Command | Exit |
|---|---|
| npm run validate:epic-f-machine-page-readiness | 0 |
| npm run test:epic-f-machine-page-readiness | 0 |
| npm run recheck:epic-f-batch-f8-regression | 0 |
| npm run theme:check | 0 |
| git diff --check | 0 |

The recovered F1–F7 repository regression gate passed. Original raw invocation exits remain F1=0 and F2–F7=1 from propagated git diff --check exit 2; all substantive suite checks passed, and the fresh diff-only recovery exits 0. Theme Check inspected 415 files with no offenses. The manifest validator also checks every F8 before/after hash and exact file-set coverage. No live/release state was promoted.
