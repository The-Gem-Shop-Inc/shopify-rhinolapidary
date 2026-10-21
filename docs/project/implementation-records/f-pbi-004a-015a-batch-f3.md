# Epic F Batch F3 — gallery architecture and performance regression

Authorized scope: F-PBI-004A and F-PBI-015A, repository and deterministic local fixtures only. F1/F2 contracts remain authoritative. No Admin operation, Product/media/alt mutation, template assignment, theme push or publication occurred.

## Result and evidence

004A and 015A are complete for repository scope when the aggregate gate passes. The parent 004/015 PBIs remain partial. [Validation report](../../qa/evidence/epic-f/batch-f3-validation.json) records each command and actual exit code, gallery test totals, F1/F2 regression, historical diagnostics and measured fixture observations. [Full local performance records](../../qa/evidence/epic-f/batch-f3-performance-runtime.json) retain individual observations, resource attribution, policies and negative-case failures. [Exact file manifest](../epic-f-batch-f3-file-manifest.json) distinguishes this batch from pre-existing uncommitted F1/F2 work.

Run `npm run validate:epic-f-batch-f3`. It runs gallery architecture/media contract tests, gallery Playwright/axe, strict performance contract tests and local runtime measurement; then unchanged brand/homepage performance checks and the F2 aggregate (including F1), followed by `git diff --check`. Historical diagnostic exit codes are preserved separately. No preview or Admin command is included.

The completed suites cover 38 media contract cases, 34 performance contract cases, 32 gallery browser cases, 18 local performance cases (10 expected passes and eight intended failures), and all 58 inherited F2 browser cases. [Development validation attempts](../../qa/evidence/epic-f/batch-f3-development-validation.json) preserve corrected failures and the optional Shopify skill wrapper's missing `@shopify/theme-check-common` dependency; the required repository Shopify CLI Theme Check succeeds independently.

## Media eligibility and architecture

The deployable media gate is empty, and its release register requires zero grants. All 11 governed machine Products remain suppressed, including current nonblank attachments. Description/technical fact grants remain zero. No actual Product asset or alt was edited. No stock image, placeholder, fabricated customer diagram or fallback is emitted.

The synthetic fixture schema binds exact Product GID, canonical fixture asset identity/media ID, exact model/use reference, rights/use reference, explicit factual alt and approval, audience/publication, embedded-claim review, lifecycle, expiry and asset existence. References demonstrate the existing B media/F-DEC-002 review boundary; they grant no real rights. Product inspection imagery requires informative approved alt and cannot be relabeled decorative. Blank alt, filename/title-derived approval and unsafe HTML/Liquid values fail closed. No alt is inferred from Product prose, tags, OCR or AI.

`fixtureLiquid` can only produce in-memory fixture-host/synthetic-ID conditions. It refuses real media GIDs/canonical identities; it never writes to theme snippets. Its review dates and expiry are deterministic fixture inputs, not current live evidence. The deployed gate is separately pinned to empty. A future real-release compiler is outside 004A.

Coverage includes zero/one/multiple/several images, mixed image/video, wrong Product/model, duplicates, shared use, absent rights/alt, embedded claims, deleted/orphaned/expired references and draft/unpublished routes. SawMaster 24/36's observed shared MediaImage GID is asserted from the historical read and refused by the fixture compiler; synthetic shared-use fixtures require separate exact-use review. EM-1's embedded patent review remains blocked. TumbleMaster's no-media state remains valid. No image supplies BOM, compatibility, certification or included-item text.

Trade's existing Liquid gallery/modal/thumbnail/media snippets consume the projection. Native gallery, modal, zoom, global, Product-form and Product-info JavaScript are hash-pinned unchanged. The default and machine template files are also hash-pinned unchanged. Image sizing preserves source aspect, native responsive sources and explicit dimensions; machine fit is contain. The hero request is bounded to the existing 1946px source ceiling; secondary images remain lazy. Both gallery and modal video templates use autoplay false. No new gallery controller exists.

Playwright covers 320/390/768/1440px zero/one/multiple/video layouts, purchase/Contact hierarchy, no overflow, thumbnail keyboard traversal, modal focus entry/containment/return, open/close, inspection zoom, accessible controls and axe serious/critical checks. A video provider request/iframe is absent initially and appears only after native keyboard interaction; the synthetic provider is intercepted locally. F2's separate seven-width/zoom/shell tests remain in regression. These gallery results are evidence for later 014B, not completion of it.

## Performance contract

Four stages remain distinct: static architecture, local fixture/runtime regression, preview diagnostic, release certification. F3 completes only the first two. The executable collector accepts local fixtures only. The future record schema supports all environments, requested/resolved Product URLs/routes, exact Product/template, verified theme identity when available, viewport/device, throttling, cache/settle, timestamp, run count, individual samples, median and host attribution.

| Budget | Mobile | Desktop |
|---|---:|---:|
| LCP | 2500ms | 2500ms |
| CLS | 0.1 | 0.1 |
| Established long-task TBT proxy | 200ms | 200ms |
| Initial transfer | 2,097,152 bytes | 2,097,152 bytes |
| Initial image transfer | 512,000 bytes | 921,600 bytes |
| Maximum individual image | 358,400 bytes | 512,000 bytes |
| First-screen media | 358,400 bytes | 512,000 bytes |
| Requests | 120 | 130 |
| Immediate video iframe / autoplay / third-party script hosts / synchronous third-party scripts | 0 | 0 |

Threshold changes: **No**. The machine scope takes the minimum of referenced approved brand/homepage/global limits; an original-policy hash and exact reference map prevent silent relaxation. No savings are claimed. Local runs use 390px and 1440px profiles, no throttling, cold/no-store cache, load plus fonts-ready plus the governed 1500ms settle interval. They are single local observations, not release medians. The long-task excess metric is the existing TBT proxy, not Lighthouse TBT or field INP.

Resources are measured over loopback HTTP through the shared CDP recorder, including actual response transfer bytes and request completion. First-screen sources and post-thumbnail secondary costs are recorded separately. Browser lazy loading can fetch nearby secondary images before interaction; those bytes are counted rather than assumed absent. Synthetic SVGs deliberately represent test costs only; these figures do not predict actual photography or Shopify/provider costs.

Normal zero/one/multiple/several/video fixtures run on mobile and desktop. Oversized hero/secondary, eager secondary/provider, autoplay, synchronous third party, duplicate Product-script and 404 fixtures must fail for their intended violation. Unit negatives also cover absent/unsupported measurements, false zero resource totals, navigation/error/password/challenge/non-Product pages, bad template/route/Product/environment, malformed observations, mismatched runs, insufficient release samples and incorrect medians. Missing observations are distinct from measured zero. Runtime observations carry schema status and cannot masquerade as preview certification.

Attribution distinguishes Rhino theme, native Trade, first-party, native Shopify, native payment/provider, preview tooling, synthetic media/video and other third parties. Native `payment_terms` remains untouched; the local platform adapter returns no provider output and states this limitation. 015B must measure actual payment/provider traffic after the 013 decision or explicit acceptance as a release dependency.

## Remaining work and human decisions

- **004B blocked:** F-DEC-002 must supply exact asset/model/use permission, rights/use, approved factual alt, applicable embedded-claim review (including EM-1), publication/lifecycle/currentness, and separately authorized activation. Sharing an attachment never supplies exact-use permission.
- **015B deferred:** separately authorize an actual Shopify-rendered machine route/environment, verify actual theme identity, use representative proposed-release gallery/native-widget states and the approved throttling/cache/settle policy; record at least three representative mobile samples and correct median, native/provider/preview attribution, and owner review of concrete exceptions. Local fixtures cannot satisfy this gate.
- **014B open:** later approved media and modal parity, populated/long specifications, included/optional contents, contextual items, delivery/pickup, warranty/support, resources/downloads/video, and later details/disclosure keyboard journeys.
- **013/F-DEC-001 open:** no financing decision, authored copy, CTA, destination or provider change.
- **Epic P open:** Contact intake routing/privacy/retention ownership; F2 link stays neutral and context adapter dormant.
- **Inherited Epic E:** approvals, migrations and reconciliation remain with their existing owners; no questions reopened.

Unchanged diagnostics: search and consumableProduct fixture ownership gaps; 103 historical Product CSV missing-alt/nonpositive-price findings; 37 historical Product-description claim matches remain suppressed and unapproved. Global header/footer issues remain Epic C's responsibility. No unrelated chrome or later conditional modules were implemented. Stop after F3.
