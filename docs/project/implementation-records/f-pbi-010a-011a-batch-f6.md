# Epic F Batch F6 — support and canonical resources

Scope: F-PBI-010A and F-PBI-011A repository/local-fixture implementation only. The parent 010/011 PBIs remain partial. Real customer grants remain zero. No live activation, Admin mutation, template assignment or theme push/publication is part of this batch.

## Manual checkpoint audit and corrections

The seven manual checkpoint files were read before modification. `npm run validate:epic-f-support-resources` and `node -e "require('./scripts/lib/epic-f-support-resources'); console.log('F6 projector loaded')"` both exited 0. The policy/class/mapping interface, E role vocabulary, E resource types/lifecycle/visibility, blocked/pending owner decisions and shared F approval mechanism were retained. The contract data and its schema remain byte-identical to the checkpoint.

Necessary corrections, rather than a rewrite:

- E requires separate subject-bound policy, class and mapping approvals. The manual projector incorrectly required all three approval IDs to equal the presentation envelope ID. F6 now consumes the existing E owner-input schema and validator, joins each approval to its exact subject, verifies source content hashes and retains all three approval IDs in internal projection provenance. Positive fixtures use in-memory E owner inputs, not another approval registry. Missing source authority suppresses facts; a missing public destination alone suppresses only the CTA. A null presentation duration omits that row without changing E's underlying class or asserting unlimited/no-duration coverage.
- Warranty destinations independently require public customer visibility, publication/rights approval and a customer-resource purpose. Internal, support-only, support-type and evidence-only source Files cannot escape through a warranty CTA even when separately approved structured warranty facts remain eligible.
- Input destination observations now admit negative route/purpose observations, so a bad warranty CTA does not discard independently eligible warranty facts. The projector validates exact purpose, route identity and freshness; relative paths reject backslashes, encoded traversal, query/fragment redirects and external schemes.
- The input schema/projector now requires explicit language/version review, matching presentation language/configuration, canonical-family identity, customer resource source role and exact destination/File identity. Duplicate/conflicting canonical versions suppress all candidates rather than selecting a winner.
- Video records carry reviewed captions/transcript, dimensions and a strictly synthetic embed destination. Supplied posters fail closed; the supported no-poster text activation path cannot bypass F-DEC-002. Output retains only the values needed by the native deferred renderer.
- Output schema requires empty arrays for nonfixture projections and still forbids resource type `support`. Malformed Product GIDs produce a null-identity empty diagnostic instead of throwing. Duplicate warranty mappings for the same Product and unsafe marketed-brand text are rejected.
- The manual validator was extended with generated-projection equality, zero-grant checks, preserved-surface hashes, single machine-only integration and native deferred-video checks. Package scripts were added; existing scripts were retained.

Checkpoint hashes, final hashes and the exact manual-file delta are in [development evidence](../../qa/evidence/epic-f/batch-f6-development-validation.json). The [file manifest](../epic-f-batch-f6-file-manifest.json) compares the completed F5 workspace, including the manual additions; it does not mistake earlier uncommitted F1–F5 work for F6 work.

## Eligibility and presentation

The deterministic release builder reuses the existing F consumer, rejects fixture/stale contexts, refuses nonzero grants, records the consumer hash and renders both new snippets with `nil`. No synthetic review can survive serialization into a release approval. The machine-only integration follows specifications/contents and contextual/delivery without moving title, price, Variant, quantity, purchase, pickup or Contact. Both Product template hashes remain unchanged.

Warranty fixtures use invented 17-month terms, never historical one-year/90-day evidence. Exact policy/class/revision/Product/approval joins, distinct evidenced roles, same-entity roles with independent evidence, third-party manufacturer with Rhino marketed brand, optional duration and Product exceptions are exercised. Wrong/missing/stale/proposed/expired/audience-denied/conflicting records fail closed. Vendor, Product prose, classes, price, brand grouping, generic policies, files and Contact cannot establish responsibility or duration. Missing/404/obsolete/wrong-purpose/wrong-identity/external destinations remove only the warranty CTA. Neutral `/pages/contact` remains independent and unchanged.

Resources preserve manual, diagram, instruction and video meanings. Current/canonical/customer state, exact Product/File/resource identity, review approvals, language/configuration and valid destinations are mandatory. Candidate/obsolete/superseded/internal/support-only/evidence-only records disappear. Reachable internal support Files remain forbidden even with otherwise positive flags. Filename/date/hash/duplicate-group/Page-title/model-text heuristics cannot authorize a resource. Three working legacy manual Pages do not become canonical Files; the seven historical broken routes remain negative fixtures without replacements or redirects.

Customer markup contains useful names/type associations, semantic warranty definition lists and no internal IDs/evidence paths. Empty sections disappear. Resource content cannot populate specifications, dimensions, electrical facts, compatibility, BOM, warranty, delivery, timing or JSON-LD. No new video framework, browser relationship fetch, preload, provider initialization or customer data behavior was added.

English keys were propagated using the repository's locale structure convention. Non-English values are parity fallbacks, not reviewed translations. Hardcoded-string and nested Theme Check locale validation remain required.

## Executable results and performance

The [aggregate evidence](../../qa/evidence/epic-f/batch-f6-validation.json) records exact commands/exit codes, 177 contract checks, 29 browser checks, ten performance observations and nested F1–F5 results. Shopify CLI Theme Check is explicitly recorded through F6 → F5 → F4 → F3 → F2 → F1. The optional installed skill wrapper cannot start because `@shopify/theme-check-common` is missing; this packaging diagnostic does not replace the required CLI gate.

Browser coverage includes 320/390/768/1440 px, long text, semantic role labels, useful link names/type associations, keyboard/source order, visible focus, CTA suppression, empty-shell suppression, native deferred video keyboard activation and focus return to normal tab order. No provider iframe/request exists before interaction; activation creates one local intercepted provider request with `autoplay=0`. Serious/critical axe findings are zero in tested shell states. Text enlargement is separately labeled root-font simulation; actual Chromium 200% zoom is verified using `chrome.tabs.setZoom`, viewport reflow and device-pixel-ratio change.

F-PBI-014B receives support/resources partial evidence only. Remaining scope: approved live media parity, actual Shopify-rendered integration/release parity where required, and release-only journeys not proven by local fixtures. Local evidence is not full live accessibility certification.

Performance uses the unchanged F-PBI-015A collector, network recorder and budget evaluator. Five states run once on mobile and desktop: zero modules, support, multiple downloads, video before interaction and combined. Full request attribution/metrics are in [performance evidence](../../qa/evidence/epic-f/batch-f6-performance-runtime.json). These are cold-cache, unthrottled local single observations with the existing settle policy, not release medians. No payment/provider traffic is fabricated.

| Fixture | Initial transfer bytes (each profile) | Requests | Mobile / desktop LCP (ms) | Mobile / desktop TBT proxy (ms) |
|---|---:|---:|---:|---:|
| zero | 295982 | 20 | 164 / 96 | 3 / 0 |
| support | 297825 | 20 | 88 / 80 | 0 / 0 |
| downloads | 297072 | 20 | 84 / 72 | 0 / 0 |
| video | 296930 | 20 | 64 / 72 | 0 / 0 |
| combined | 299623 | 20 | 72 / 144 | 0 / 20 |

All measured CLS/image bytes, initial video iframes, autoplay and synchronous third-party scripts were zero. TBT proxy ranged from 0 to 20 ms against the unchanged 200 ms budget. No document download or video provider request occurred before interaction. Applicable budgets remain LCP 2500 ms, CLS 0.1, TBT proxy 200 ms, initial transfer 2097152 bytes, requests 120 mobile/130 desktop; existing image limits remain unchanged. **Performance threshold changes: No.** F-PBI-015B remains deferred.

## Remaining activation and ownership

- **010A:** complete repository/local-fixture scope. **010B:** open/not ready. Requires B3C-D03/E-PBI-016 current policy revision, issuer/administrator/repair-provider responsibility, historical coverage exceptions and third-party review, exact Product mappings, approved wording/values/destinations, audience, applicable migration/reconciliation, F eligibility and separate activation. B3C-D03 remains **blocked**; no expert decision was inferred.
- **011A:** complete repository/local-fixture scope. **011B:** open/not ready. Requires B3B-D06/E-PBI-018B exact canonical File/version/type/model/language, duplicate review, rights/publication, current destination, applicable migration/reconciliation, Product-surface video/media permission, F eligibility and separate activation. B3B-D06 remains **pending**.
- **013/F-DEC-001:** open. Native payment terms unchanged. All earlier B-scope activations remain open/not ready. P owns intake/privacy/retention; L owns support processes and resource directory/route repairs; J/K own operational corrections. Inherited E approvals/migrations/reconciliation remain unchanged; no questions reopened. No 016–018 work begun.

Real grants before → after: warranty/service **0 → 0**; manuals **0 → 0**; diagrams/instructions **0 → 0**; videos **0 → 0**; customer `support_files` **0 → 0**, structurally forbidden.

Historical diagnostics remain separate: search and consumableProduct fixture ownership gaps; 103 Product CSV findings including missing alt/nonpositive price; 37 historical description claim matches remain unapproved; seven broken Manuals-hub destinations remain unrepaired. Signature checks remain enforced.

Shopify Admin mutation: **No**. Product/metafield/metaobject mutation: **No**. Page/File/policy mutation: **No**. Shipping/delivery/pickup/location mutation: **No**. Product template assignment: **No**. Preview/production push/publication: **No**.
