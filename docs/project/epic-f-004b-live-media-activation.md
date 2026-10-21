# F-PBI-004B — bounded live development media activation

Six exact current Product images are active on their assigned machine pages. F-PBI-004B is **PARTIAL_DEVELOPMENT_MEDIA_ACTIVE**; F-PBI-004 remains **PARTIAL_LIVE_MEDIA_REVIEW_REQUIRED**. EM-1 and SawMaster24 remain REVIEW_REQUIRED. Final launch rights/content quality and media completeness are not approved.

F-PBI-015B remains **BLOCKED_MEASUREMENT_INTEGRITY**, annotated **PARKED_RELEASE_GATE**. It does not block continued implementation and remains mandatory for F-PBI-018B, which is **NOT_READY**. No RecorderV4 work or live performance certification ran.

## Decision and fresh reconciliation

F-DEC-002-DEV is **APPROVED_BOUNDED_DEVELOPMENT**, under delegated_development_override. The exact current ready/accessibly rendered Shopify media association may authorize display on that same Product during development. This does not authorize new uploads, cross-Product reuse, homepage/advertising use, licensing beyond the existing Product context, specifications, compatibility assertions or final launch approval. No facts were extracted from filenames, labels, captions or photos.

Initial media audit:2026-10-10T20:17:20.976Z. Resumed fresh all11-machine audit: **2026-10-12T17:44:42.003Z**. The six alt updates had completed before interruption; the resumed work verified them and made zero further alt writes. Nine downloaded original image identities/content hashes are unchanged.

[Current media inventory](../qa/evidence/epic-f/004b-live-media-2026-10-10/resume-2026-10-12/media-current.json) includes exact GIDs, status/publication, suffix, media type/status/source/dimensions/alt/update time and Variant associations. [Resume reconciliation](../qa/evidence/epic-f/004b-live-media-2026-10-10/resume-2026-10-12/resume-reconciliation.json) covers all122 protected Products, eight assignments, three exclusions, both themes and image content.

| Product | Product GID suffix | Current media | Eligible for this development activation | Disposition |
| --- | --- | --- | --- | --- |
| BeadMaster 6" | 8905779937477 | 1 | 1 | ELIGIBLE_CURRENT_PRODUCT_MEDIA |
| EM-1 Machine | 8905780756677 | 1 | 0 | REVIEW_REQUIRED |
| JadeMaster, 14" | 8905781248197 | 1 | 0 | Excluded; no activation |
| LapMaster 12" | 8905781412037 | 1 | 1 | ELIGIBLE_CURRENT_PRODUCT_MEDIA |
| LapMaster 18" | 8905781477573 | 1 | 1 | ELIGIBLE_CURRENT_PRODUCT_MEDIA |
| SawMaster 18" | 8905784131781 | 1 | 1 | ELIGIBLE_CURRENT_PRODUCT_MEDIA |
| SawMaster 24" | 8905784197317 | 1 | 0 | REVIEW_REQUIRED |
| SawMaster, 36" | 8905784262853 | 1 | 0 | Excluded; no activation |
| ShapeMaster 6" | 8905784328389 | 1 | 1 | ELIGIBLE_CURRENT_PRODUCT_MEDIA |
| TrimMaster | 8905785344197 | 1 | 1 | ELIGIBLE_CURRENT_PRODUCT_MEDIA |
| TumbleMaster | 8905785868485 | 0 | 0 | Excluded; INELIGIBLE_MISSING |

Six assigned Products have one eligible image each; EM-1 and SawMaster24 have zero. No Product has multiple eligible images. Product videos found:0; none activated. JadeMaster, SawMaster36 and TumbleMaster retain their excluded assignment scope.

EM-1 media33451101683909 visibly contains prominent unapproved patent/technical marketing claims and stays held. SawMaster24 media33451117871301 is also attached to excluded SawMaster36; changing its blank File alt would affect that excluded context. No independent shared exact-model use/alt review is approved. Neither photo was cropped, replaced, duplicated, copied or granted.

## Exact alt edits and grants

| Product GID suffix | Exact MediaImage GID suffix | Before alt | Reviewed/after alt |
| --- | --- | --- | --- |
| 8905779937477 | 33451099455685 | Blank | Rhino Lapidary BeadMaster machine, front view |
| 8905781412037 | 33451104895173 | Blank | Rhino Lapidary LapMaster machine, view from above |
| 8905781477573 | 33451105255621 | Blank | Rhino Lapidary LapMaster machine, angled view |
| 8905784131781 | 33451117576389 | Blank | Rhino Lapidary SawMaster machine with the lid open, angled view |
| 8905784328389 | 33451118428357 | Blank | Rhino Lapidary ShapeMaster machine, angled front view |
| 8905785344197 | 33451123409093 | Blank | Rhino Lapidary TrimMaster machine, angled front view |

Alt-only fileUpdate used id and alt for six exact unshared media IDs; userErrors:0. No originalSource, filename, associations or other Product fields were written. [Before/proposed alt plan](../qa/evidence/epic-f/004b-live-media-2026-10-10/alt-change-plan.json) and [mutation receipt](../qa/evidence/epic-f/004b-live-media-2026-10-10/alt-mutation-result.json) remain unchanged. Fresh after-read confirms identical reviewed alts.

Six exact grants in data/epic-f-media-release.json preserve Product/media GIDs, IMAGE/READY state, source URL, dimensions, media update time, customer-development audience, delegated approval mode, fresh observedAt, visual review and F-DEC-002-DEV provenance. finalLaunchApproved remains false. Synthetic fixture approvals cannot authorize Shopify media.

## Reviewed storefront delta and deployment

Current binding: **EPIC_F_CURRENT_PRODUCT_MEDIA_DEVELOPMENT_2026_10_12**, SHA256 **666ff15b4d98916426299eae85dbea783535321d88ea5d77035e57c0054216ac**. It additively supersedes the October10 candidate5ecd70c8ae6197d7c92055a122b24bccd7878cfa403113282ab834ac55ffb2a4 and the Preview-only candidate837374a4dcda5537cf19c75f27b92894dabce3b95d2acc302b2817c62d194b8e. The latter was never deployed to MAIN; its failed Preview observation and source remain archived. The previous global header binding7f9156cef929619f7e9fb38ee5f51e740c7d63fe0efdeaf4cc510eaf32b72e37 remains historical evidence.

Only runtime file changed: **snippets/rhino-product-media-eligibility.liquid**. Its exact compiled gate checks assigned machine template, current publication, exact Product/media IDs, IMAGE type, source identity, reconciled media/preview alt and dimensions. Current association is supplied by the Product media loop; filenames never establish ownership. No native gallery/controller/CSS/template redesign was made. No other runtime file changed from the task before snapshot.

Preview158631198917 UNPUBLISHED received this one-file delta first; all16 normal-route checks passed before MAIN158579622085 was updated with the same reviewed bytes. Neither theme was published, replaced or deleted. Readbacks verify exact source and0 unplanned file changes. [Preview readback](../qa/evidence/epic-f/004b-live-media-2026-10-10/resume-2026-10-12/preview-readback-proof.json) / [MAIN readback](../qa/evidence/epic-f/004b-live-media-2026-10-10/resume-2026-10-12/main-readback-proof.json).

Rollback remains separately executable from source-binding.json runtimeDelta.originalBody and previousReleaseBody: restore the old empty eligibility snippet on Preview, validate, then restore the same single file on MAIN and revert local grants to suppressed. Safe descriptive alts may remain; reverting alts would require exact compare-before-write using the archived six-ID before values. No rollback was invoked.

## Live validation and accessibility

All eight normal Product routes passed at390px and1440px: **16/16**. All eight390px routes passed200% text enlargement: **8/8**. Actual Chromium200% browser zoom passed on all eight: **8/8**. MAIN merchant axe: critical0 /serious0, including open media modals. Preview excludes only the structurally verified Shopify preview-toolbar iframe; native payment/provider content remains in the merchant audit.

Real eligible one-image states passed visible informative alt, responsive dimensions/srcset, single native gallery/modal, keyboard opening, modal focus containment, Escape, keyboard close and focus return/release. There is no permanent trapped focus after closing. Native inspection image decoding passes. Thumbnail traversal is not applicable to the actual single-image states; no synthetic extra image was created. No autoplay, video/provider media embed or duplicate gallery scripts appeared.

Title/price/purchase hierarchy, Contact and native payment terms remain present. No horizontal overflow, Liquid/page errors or unapproved factual modules were found. Description fallback remains absent; Product JSON-LD remains native commerce identity/Offer data without technical/media/relationship claims. Social metadata retains the governed default brand image. F-DEC-001 remains APPROVED_OPTION_A.

[MAIN route/media evidence](../qa/evidence/epic-f/004b-live-media-2026-10-10/resume-2026-10-12/main-browser.json) / [actual browser zoom evidence](../qa/evidence/epic-f/004b-live-media-2026-10-10/resume-2026-10-12/main-zoom-browser.json) / [Preview route evidence](../qa/evidence/epic-f/004b-live-media-2026-10-10/resume-2026-10-12/preview-browser.json).

## F014B and release disposition

F014B-MEDIA-MODULE-FUTURE advances to **PARTIAL_REAL_ONE_MEDIA_PARITY**: actual real one-image modal/inspection/responsive/accessibility states are now evidenced. The literal multiple-image and populated-module states remain unproven; all assigned Products have at most one eligible image and no factual module is active. The parent criterion remains open. F014B-RESOURCE-CONTEXT-FUTURE is unchanged, and F014B overall remains partial.

The parked performance blocker remains a final release gate. Live certification must be rerun against the final stabilized media/content source after measurement integrity is solved in a separately authorized phase. This media task ran existing local regression budgets only, without changing thresholds or initiating a certification campaign.

## Remaining activation map

| PBI | Decisions | Approved/current/migrated values | Readiness and exact missing dependency | Kevin/Vejdi input | Next executable action |
| --- | --- | --- | --- | --- | --- |
| F-PBI-006B specifications | B3B-D03, B3B-D05 | 0 /0 /0 | NOT_READY. Technical and Operations must approve exact Product/configuration electrical, motor/tool speed, mount/fluid values and net/assembled/crate states, axes and packing revision. Do not use photos or descriptions as facts. | Yes: technical answers from Kevin/Vejdi or their designated technical authority; Operations also required for packed states. | Review the existing technical/measurement conflict packet with the domain owners, approve a bounded exact-GID value set, then prepare its existing migration plans. |
| F-PBI-007B contents/BOM | B3B-D04, C-040 | 0 /0 /0 | NOT_READY. Resolve EM-1 six-wheel versus five-line contents and60-versus80-grit C-040 conflict; approve exact catalog component IDs, quantities and included versus optional commercial contents. | Yes: Kevin/Vejdi technical/commercial confirmation plus Product Owner contents approval. | Review C-040 and the existing22 component candidates; approve exact BOM/quantities before E-MUT-035/036 execution. |
| F-PBI-008B contextual/compatibility | B3B-D02, PO-E-012, PO-E-013, B3B-D04 | 0 /0 /0 | NOT_READY. Approve exact dependent-to-machine edges independently of optional/recommended commercial relationships. Resolve Automatic Feed Clamp and Saw Vice Plate Set size identity; four SawMaster edges remain blocked. | Yes: Kevin/Vejdi fit/identity answers or designated technical authority; Product Owner recommendation approval separately. | Review38 proposed edges and four blocked edges; approve a bounded exact-GID subset and resolve the two dependent identities. |
| F-PBI-009B operations/delivery | B3C-D01, B3C-D02, B3C-D04 | 0 /0 /0 | NOT_READY. Approve exact handling assignments, current pickup permission/location/season process and regional restrictions. Choose native availability without timing promises or appoint an actual maintained timing source, semantics, SLA and expiry. | Kevin/business Operations input required, or appointed owner; Vejdi input only where supplier/technical handling evidence is needed. Named assignments are not established by the repository role register. | Obtain Operations/Product Owner handling/pickup/availability decisions; then prepare E-MUT-033/041 and the governed timing adapter only if an approved source exists. |
| F-PBI-010B warranty/support | B3C-D03, B3B-D06 | 0 /0 /0 | NOT_READY. Approve current policy revision, issuer/administrator/repair-provider roles, exact coverage mappings/exceptions and customer-safe destination. Historical policy prose is not approval. | Kevin/business owner and Support/Legal input required, or appointed authorities; Vejdi where actual supplier/repair obligations require confirmation. | Review the four pre-extracted coverage buckets with Support/Legal/Product Owner and confirm exact current Product mappings before E-MUT-040. |
| F-PBI-011B resources | B3B-D06 | 0 /0 /0 | NOT_READY. Approve canonical File/version per exact Product, resource type, language, rights/publication, lifecycle and destination; review duplicates. support_files remains forbidden. Development Product-photo grants do not approve manuals, videos or resource reuse. | Yes where Kevin/Vejdi must confirm current manuals/version/exact model; Support/Media/Legal publication and rights approvals separately. | Review the existing110 indexed resource candidates and six duplicate groups; choose an approved canonical exact-GID subset before E-MUT-038/039. |

[Source-bound dependency map](../qa/evidence/epic-f/004b-live-media-2026-10-10/resume-2026-10-12/remaining-activation-map.json) records each upstream E-MUT plan and role-based decision. E-MUT-020/021 definitions/classification are complete and are not reopened. Admin access is currently available; historical plan admin_inaccessible flags are not a current blocker. No governed specifications, measurements, BOM, compatibility/recommendations, delivery/timing, warranty or resource values were activated.

## Validation commands and durable evidence

| Command | Final exit |
| --- | --- |
| node scripts/validate-epic-f-gallery.js | 0 |
| node scripts/test-epic-f-live-media-activation.js | 0 |
| node scripts/test-epic-f-media.js | 0 |
| node scripts/build-epic-f-machine-page-readiness.js | 0 |
| node scripts/validate-json-registers.js | 0 |
| npm run validate:epic-f-batch-f8 | 0 |
| node scripts/validate-epic-f-live-media-browser.js preview | 0 |
| node scripts/deploy-epic-f-live-media.js preview / main | 0 /0 |
| node scripts/validate-epic-f-live-media-browser.js main | 0 |
| node scripts/validate-epic-f-live-media-zoom.js | 0 |
| Finalizer, protected comparison, credential scan, JSON registers and git diff --check | 0 |

Media activation tests127 passed; existing media contract38 passed; gallery fixtures32 passed; F8 adversarial readiness66 passed. Current F1–F8 aggregate and Theme Check pass under the exact media/header/cleanup binding. One earlier aggregate attempt failed because F6 still pinned the eligibility snippet to its empty historical version; that attempt is preserved in aggregate-first-attempt. The check now recognizes only the exact authorized media path/hash/decision. Wrong hash, unrelated path and absent-authorization cases remain rejected. Other baselines and all budgets are unchanged.

Created: F-DEC-002-DEV decision/evidence, current audits, visual reviews, exact alt receipt, six-grant schema/compiler/semantic tests, source binding, bounded deployment/browser/zoom/finalization/reporting tools and dependency map. Modified: media release/schema, the one eligibility snippet, narrowly bound aggregate validators, current readiness/decision/status registers and tracker. All unrelated dirty workspace source is preserved. [Evidence manifest](../qa/evidence/epic-f/004b-live-media-2026-10-10/resume-2026-10-12/evidence-manifest.json) enumerates exact files/hashes.

Product data mutations outside alt:0; assignment changes:0; new uploads:0; factual grants:0; payment/analytics configuration changes:0. Total authorized persistent writes in this task are six MediaImage alts, two Preview updates of the same eligibility file, and one MAIN update. The first Preview candidate kept photos suppressed because its URL representation check was too strict; the corrected equivalent-source representation checks retain all Product/media/alt/type/dimension requirements. No further alt writes occurred on resume. Final launch is not approved.

Recommended next Epic F batch: prepare bounded006B owner/value decisions from the existing technical/measurement packet, with007B C-040 and008B exact-fit decisions in independent lanes. Continue customer-facing implementation when its domain inputs are approved and reconciled; leave015B parked as a release gate.

Final all11-media reconciliation completed: 2026-10-12T18:56:00.586Z. The final protected122-Product/Variant comparison has zero drift since the resumed before-read.

Shopify Liquid source representation correction follows the [official image object documentation](https://shopify.dev/docs/api/liquid/objects/image#image-src). Exact Product/media IDs and reconciled alt/type/dimensions remain mandatory.

The optional October5 eligibility prerequisite regression initially rejected the legitimately changed eligibility file. Its historical facts/receipts remain unchanged; only the exact current media successor may satisfy that historical source pin under explicit binding. The68 prerequisite checks now pass. The failed check is retained in final-checks-first-attempt.json.

Two initial browser-zoom harness attempts are retained: one addressed the original store alias rather than the redirected origin, and one inspected an image before its new responsive source decoded. The final true browser-zoom run uses the actual origin and completed image decode, with8/8 passes. No zoom workaround was deployed to the storefront.
