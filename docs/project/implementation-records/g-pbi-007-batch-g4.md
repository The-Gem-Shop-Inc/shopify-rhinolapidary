# G-PBI-007 — Epic G4 integrated QA

October 20, 2026. Repository implementation delivered; formal acceptance remains open. No production deployment or catalog mutation is authorized or performed.

Current evidence: [final consolidated JSON](../../qa/evidence/epic-g/g4-2026-10-20T15-36-36-895Z/handoff-report.json), [final command and criterion summary](../../qa/evidence/epic-g/g4-2026-10-20T15-36-36-895Z/handoff-report.md), [original full-run commands](../../qa/evidence/epic-g/g4-2026-10-20T15-36-36-895Z/commands.json) and [supplemental executions](../../qa/evidence/epic-g/g4-2026-10-20T15-36-36-895Z/supplemental-commands.json). The original full-run report remains unchanged. Paths below are relative to `docs/qa/evidence/epic-g/g4-2026-10-20T15-36-36-895Z/`.

## A. Scope and PBI status

G007 adds one orchestrator, five-state JSON/Markdown reporting, current read-only reconciliation, commercial drift assertions, protected theme/source comparisons, output isolation, additional responsive/zoom/focus coverage and bounded performance comparisons. It reuses the E paginator, G1 authority, G2 native template and recovery guards, G3A routes, G3B directory and F source binding. No second GraphQL client, identity registry, compatibility graph, approval service or commerce controller is introduced.

G001 remains COMPLETE; G002 and G004 remain COMPLETE within approved preview scope. G003 remains PARTIAL for private revocation/production operating policy, with current presentation expired. G005 remains functionally preview verified/PARTIAL for the historical evidence exception. G006 remains PARTIAL. G007 is repository implemented with blocked acceptance; completion requires the demonstrated outcomes in M. Optional G008/G009 and deferred G010 remain outside this implementation.

No customer-facing source change is required for G4. Existing-file edits are limited to package commands, test adapters, native-cart test bounds/cleanup and tracker/commercial records. Runtime assets, templates, homepage, approval records and historical receipts remain protected. No preview deployment allowance is expanded.

## B. Commercial decision ledger

[Exact ledger](../../../data/epic-g-commercial-decisions.json) and [G006 decision record](../epic-g-required-decisions.md) distinguish decision authority from observed Shopify state.

| Product | Product GID suffix / Variant GID suffix | Decision | Current USD |
| --- | --- | --- | ---: |
| Arbor Wrench | 8905779839173 / 46484253835461 | Approved/applied before G4 | 12.00 |
| Automatic Feed Clamp | 8905779871941 / 46484253966533 | Approved/applied before G4 | 65.50 |
| LapMaster Lap Bolt | 8905781575877 / 46484255867077 | Approved/applied before G4 | 5.75 |
| 6 in Trim Saw attachment | 8905779282117 / 46484253278405 | DEFERRED; unexpected current price | 75.00 |
| MR16 LED Bulb | 8905782558917 / 46484256948421 | DEFERRED procurement/specification/selling price | 0.00 |
| Saw Vice Plate Set | 8905784099013 / 46484258881733 | Received prices; Product/Variant mapping unapproved | 0.00 |

All identities use `gid://shopify/Product/` or `gid://shopify/ProductVariant/` as appropriate. No values are assigned by name or inferred compatibility.

Today's full capture observes the attachment changed from $0.00 to **$75.00**, native Variant `updatedAt=2026-10-20T15:30:28Z`. That change is outside the three approved updates in the supplied authorization; this task made no such write. The strict commercial verifier reports `UNAUTHORIZED_COMMERCIAL_PRICE_CHANGE gid://shopify/ProductVariant/46484253278405`. It means unapproved by the available authorization, not a claim identifying who changed Shopify. No rollback, purchase hold, publication action or automatic approval follows.

The previous closing read on October 19 observed three zero-price G Variants and no during-QA drift. Today's actual count is **two**, rather than the expected three. All **three unresolved commercial exceptions** remain launch blockers. A nonzero native price does not resolve the deferred attachment decision.

Received Saw Vice model prices remain JadeMaster 14": $38; SawMaster 18": $110; SawMaster 24": $120; SawMaster 36": $140. No four-Product/four-Variant structure is approved and no price is assigned to the generic Variant. The distinct TrimMaster machine's $1,150 does not price the attachment. MR16 specifications, third-party prices and applicability remain uninferred. Accepted deferral allows technical QA; it conveys no free-sale or commercial launch authority.

## C. Integrated test architecture

Run `npm.cmd run validate:epic-g-integrated -- --evidence <new docs/qa/evidence/epic-g/g4-* directory> --read <authenticated Admin envelope>`.

Without `--read`, the existing authenticated audit is attempted; missing credentials remain BLOCKED. Theme captures are read-only prerequisites. The command never silently substitutes offline fixtures for live evidence. See [the contract](../../architecture/epic-g-integrated-qa-contract.md).

The runner executes existing npm commands and focused browser scripts, with two static workers and sequential browsers. Each log records the exact command, timestamps, exit code and status. JSON reports validate against `schemas/epic-g-integrated-report.schema.json`. Exit codes are 0 PASS, 1 FAIL, 2 BLOCKED. DEFERRED and NOT APPLICABLE are explicit criterion states; no unavailable prerequisite becomes PASS.

The full invocation completed with exit **1**: **40 PASS / 1 FAIL / 1 BLOCKED** across 42 commands. The separately executed owner-source wrapper (six child suites, all PASS) and native viewport probe (three cases, PASS) bring consolidated top-level executions to **42 PASS / 1 FAIL / 1 BLOCKED**. Both supplemental commands are now in the default orchestrator. Their individual checks, syntax checks and JSON-register validation passed; a second full browser run after those two additive dispatch lines is not claimed. `supplemental-commands.json` preserves that distinction.

G4 source additions are `validate-epic-g-integrated.js`, its integrated browser/performance validators, `test-epic-g-integrated.js`, `lib/epic-g-integrated.js`, `lib/epic-g-integrated-evidence.js`, `validate-epic-g-owner-sources.js`, `probe-epic-g-zoom-viewport.js`, the integrated schema/contract, ledger and implementation/cross-Epic reports. Existing G2/G3A test adapters permit only approved current price successors and independent SKU fixtures. No runtime file is added or changed by G4.

Unit scenario counts are explicit positive/negative cases. Legacy suites retain named matrices and command-reported counts; their summed output is not advertised as a deduplicated assertion total. Controlled unit inputs are labeled fixtures. Today's raw Admin observation is assessed separately and retains its commercial failure. Ordinary native assertions continue independently; the attachment's own unauthorized price still fails its exact historical successor comparison.

Every run has a unique directory. A process preload redirects synchronous, Promise, callback and stream evidence writes into `regression-writes/` in the active run; reads and assertions stay unchanged. Traversal and asynchronous screenshot-style attempts are negative tests. The completed-run guard refuses a report overwrite. Earlier failed and interrupted G4 runs remain intact.

| Required scenario | Existing/additional coverage |
| --- | --- |
| 1 missing class coverage | G1 foundation; G3B compiler incomplete-classification fixtures |
| 2 Product/Variant drift | G1 exact identity/membership; G2 recovery; G3B Variant additions/replacement |
| 3 unapproved compatibility | G1 revoked/missing approvals; G2 release; F binding |
| 4 complete set mismatch | G1 changed multi-machine list; G2 whole-list rejection |
| 5 unpublished targets | G1 JadeMaster suppression; G2 fixture and actual machine routes |
| 6 expired source/receipt | G1 exclusive cutoff, stale reads; G2 lease validator; F lifecycle negatives |
| 7 invalid fragments | G3A route/deployment fixtures and actual unique focusable fragment checks |
| 8 missing/duplicate roles | G3B exact role membership and complete page fixtures |
| 9 pagination truncation | Existing 20/21/50/51/122/150/151/250/251/451 growth fixtures |
| 10 Variant/purchase regression | G2 native-template guard; G3A protected DOM; Saw Blade selection/cart |
| 11 absent SKU/media/description | G1 optional absences; G3B actual 111 destinations; local SKU transitions |
| 12 false sold-out assertion | Actual Water Guard/EM-1 disabled state; native unavailable fixture |
| 13 keyboard/focus | Catalog keyboard traversal, role controls, machine fragments, modal focus return |
| 14 enlarged-text obstruction | 360/390/1440 root-text cases plus actual Chromium browser zoom |
| 15 MAIN/unrelated modifications | Full remote inventories, local source hashes and deployment guards |
| 16 unauthorized price | Exact three-row authorization plus deterministic unrelated/attachment drift fixtures |
| 17 deferred decisions | Strict ledger readiness/mapping tests; native observations never imply approval |
| 18 overwritten evidence | Sync/async/callback/stream/traversal isolation and historical source checks |

## D. Catalog and identity

Fresh authenticated capture uses the existing E audit paginator: **13 Product pages + 13 Variant pages**, no nested truncation, duplicate identities or cursor errors. See `admin-connector-log.json`, `admin-read.json` and `current-foundation.json`.

Initial observation: **2026-10-20T15:36:47.241Z** through **2026-10-20T15:37:11.457Z**. Closing observation: **2026-10-20T15:51:20.088Z** through **2026-10-20T15:51:43.142Z**. Every captured Product/Variant field was compared between the two reads, with **zero during-rerun changes**; the pre-existing attachment drift remains explicit.

| Class | Products | Variants | Published Products |
| --- | ---: | ---: | ---: |
| replacement_part | 54 | 54 | 54 |
| consumable | 39 | 42 | 39 |
| accessory | 18 | 18 | 18 |
| machine | 11 | 11 | 8 |
| Total | 122 | 125 | 119 |
| G classes only | 111 | 114 | 111 |

The compatibility source contains 39 approved values, 40 directed edges and 31 currently published-target edges; nine JadeMaster target edges remain data-approved/customer-suppressed. Seventy-two G Products have no approved compatibility. Two held Saw Vice relationships remain suppressed. All 114 G Variant SKUs are blank; 24 G Products lack media and five lack descriptions. None is invented or excluded from native browsing.

Three authorized zero-to-priced changes are accounted for by exact Product/Variant IDs, plus the separately failed attachment drift in B. No class, relationship, identity or publication drift is normalized.

## E. Navigation and compatibility

The actual preview journey enters **Catalog → Parts and supplies → Replacement Parts / Consumables / Accessories**, preserving the native Catalog disclosure. The G3B browser suite verifies unique current role entries, exact native destinations/owned Variants, no photographic directory replacement elsewhere, no-JavaScript navigation, and the native sorted collection/pager outside the special index. Growth beyond current catalog size remains fixture evidence.

Reverse expectations are computed from current approved F projection and exact G identities, with historical counts only as a comparison: EM-1 12, LapMaster 18 7, TrimMaster 10, SawMaster 18 1, SawMaster 24 1. Five machine paths total 31 reverse entries/30 unique Products. Actual heading, fragment uniqueness, pointer/keyboard links, direct URLs and focus are checked; all eleven machine routes, including unpublished 404 cases, remain covered.

Single/multiple approved forward fit, Automatic Feed Clamp's two SawMaster destinations, unpublished JadeMaster, held Saw Vice, missing fit and changed/unapproved complete sets reuse G1/G2 tests. **Current eligible forward-link rendering is BLOCKED** by the deployed G2 lease expired October 16. Actual suppression is expected, and ordinary purchase controls remain operable. Historical `g2-recovery-2026-10-16/deployed-fit-coverage.json` is retained as historical only. No projection refresh, receipt extension or preview write occurs.

## F. Native commerce

Existing browser suites traverse all 111 G Product destinations and preserve the G2 native template and F machine surfaces. Saw Blade retains four Size options, Variant IDs **46484258652357 / 46484258685125 / 46484258717893 / 46484258750661**, prices **$15 / $25 / $75 / $125**, native URL synchronization and quantity +/- behavior.

Native availability uses the visible rendered Add to cart state. Water Guard and EM-1 are sold out; aggregate Admin availability never substitutes for the button state. Blank SKU markup is hidden/unannounced. Selected populated/blank SKU transitions and deliberate 422/unavailable error recovery are explicitly local fixtures over native controllers, with no backend cart mutations.

The isolated real anonymous cart adds Saw Blade Variant **46484258652357**, quantity **2**, unit price **1500 cents**, receives HTTP 200, removes through the native cart control with HTTP 200, and verifies `item_count=0`. `cart-preflight.json` preserves today's preflight independently of the final runner's cart record. Failed native removal cannot be converted to PASS by recovery cleanup. No unresolved attachment/MR16/Saw Vice purchase is attempted; no paid order or checkout occurs.

## G. Accessibility

Actual preview coverage includes **360px, 390px, 1440px**, nine page/viewport combinations, 200% root text, three real 200% Chromium browser-zoom cases, accessible headings/link names, keyboard traversal, visible settled focus, pointer hit testing, fragment header obstruction, quantity/purchase operation and native modal focus return. Browser zoom uses a disposable local extension with `chrome.tabs.setZoom/getZoom`, not CSS scaling; no extension is deployed to Shopify.

The inherited enlarged header measures approximately **558px** at mobile 200% root text, reproduced on unchanged MAIN. It remains **G4-C-001, Epic C, high usability concern, OPEN**. Current tested role and purchase controls remain reachable, with no new G clipping. This does not certify the shared header for production.

Visual inspection found native-zoom **full-page screenshot cropping in the test capture**, despite passing DOM geometry. Those original screenshots are retained. A separate `Page.captureScreenshot` capture without a clip records the actual **1418 × 902 physical viewport** for a **709px CSS viewport at zoom 2**, with all four control corners hit-tested and visible. The three new `*-native-viewport.png` artifacts and `zoom-viewport.json` confirm readable, fully visible Catalog, purchase and Contact controls; the Catalog fragment retains focus below the header. No screenshot was edited or replaced.

EM-1's moderate `heading-order` in the F contents renderer is reproduced on unchanged MAIN: **G4-F-001, Epic F, OPEN**. It is not a new G regression. [Cross-Epic defects](../epic-g-cross-epic-defects.md) records exact targets, ownership and bounded follow-up.

Raw axe findings inside Shopify's verified CDN preview toolbar remain preserved as **G4-P-001, provider-owned serious/critical findings, OPEN**. They are absent on the clean MAIN ownership probe. Classification requires the exact provider iframe origin/path and matching injected script; mixed or unverified targets remain storefront failures. No serious/critical storefront-owned finding is waived. The original failed attribution/focus reports remain evidence; corrected negative tests reject false provider attribution and transparent focus shadows.

## H. Performance

The runner reuses `validate-brand-performance-budget` observers, resource accounting, median function and current budgets. Product and machine measurements take **three cold samples** for Saw Blade/EM-1 at 390/1440 on both actual MAIN and preview: 24 samples, all retained. The current G3B catalog suite contributes three samples per viewport plus its recorded native-grid baseline. Medians, raw outliers and thresholds are in `performance.json`; the final result table is appended below.

There are no G4 runtime code changes. Main/preview differences describe bounded runtime observations, not causal proof that G introduced a regression. The appropriate catalog baseline is its original unchanged photographic grid, including DOM/image/transfer comparisons. No failed sample is discarded to improve medians. This is not F-015B recorder-integrity certification or final release signoff.

| Surface / viewport | Preview LCP ms | MAIN LCP ms | Preview CLS | Preview TBT ms | Result |
| --- | ---: | ---: | ---: | ---: | --- |
| Catalog / 390 | 808 | Original grid baseline | 0.000116 | 1 | PASS |
| Catalog / 1440 | 656 | Original grid baseline | 0.000140 | 0 | PASS |
| Saw Blade / 390 | 740 | 716 | 0.011591 | 34 | PASS |
| EM-1 / 390 | 748 | 736 | 0.046258 | 19 | PASS |
| Saw Blade / 1440 | 760 | 748 | 0.003583 | 0 | PASS |
| EM-1 / 1440 | 696 | 656 | 0.012760 | 1 | PASS |

Limits are LCP **2500ms**, CLS **0.1**, TBT **200ms** plus existing resource/image budgets, all passing. All **30 raw samples** (24 Product/machine + six catalog) remain present; none exceeds these vital limits. Catalog DOM falls from 1652 to 729/731, images from 17 to zero, and measured total transfer from 1,484,826/1,484,606 to 1,234,464/1,241,797 bytes at 390/1440. No G4 performance regression is demonstrated within these bounds.

## I. Governance and drift

Fresh MAIN identity remains **158579622085 / MAIN**; preview remains **158631198917 / UNPUBLISHED**. All **438 MAIN and 450 preview** filename/checksum entries equal the last G3B deployment state, with complete pagination. Relevant body checks cover G3B assets/menu entry, G3A runtime, G2 template/fit/SKU, F machine/native purchase, settings, layout and homepage.

Exact Liquid/JS/CSS bodies are protected by digests. JSON template readback strips only Shopify's generated leading comment for the stored representation and additionally verifies exact G2 blocks/settings. Settings readback retains its unchanged remote stored checksum and separately records its API body digest; formatted API bytes are not falsely claimed identical to stored bytes. Negative cases reject changed settings checksum, runtime bytes, removed/added blocks and altered native purchase settings.

Source binding remains **b90bf2089788e77c04fbdd5bd1766bc4d03cfb9e358179884a47b74095be949b**. The unchanged owner receipt expires **2026-10-22T20:26:37.102Z**. Read freshness and receipt lifecycle are separate. No automatic renewal occurs; exclusive-boundary fixtures fail closed. Optional role/fit expiry cannot disable ordinary native Product browsing/purchasing.

E's general `compareNative` field list excludes price, but the historical owner-response adapter's `reconcile` also compares full protected Product/Variant records and **does bind native price**. The existing owner-source negative test explicitly rejects price changes. Historical receipts are not reevaluated as permission to rewrite their old prices. G's current-state successor instead binds a new timestamped Admin observation, retains the original source/receipt, records each exact Variant price delta and permits only the three owner-authorized changes. The unexpected fourth delta fails that current-state reconciliation; it cannot renew or invalidate technical compatibility by inference.

Historical G3A protected DOM/JSON-LD also includes prices. Its opt-in current-read successor permits only those three exact approved price/offer changes; all other native fields remain strict. The new $75 attachment change therefore remains a deterministic native successor failure, with historical receipts and screenshots unchanged. `native-price-reconciliation.json` records the exact changed fields and proof boundaries. The additional six E/F owner-source suites and their exact executions are preserved in `owner-source-commands.json`.

## J. Shopify accounting

This resumed observation performs **26 initial catalog + 8 theme/shop/currency + 26 closing catalog = 60 authenticated read-only data queries**. Four schema-discovery calls and one validation call are separate tooling operations; the validator deferred validation to query execution. Query timestamps and complete responses are recorded. The shop identity file derives from the theme query and is not counted twice. The original full-run report counts its initial 34 prerequisite reads; the consolidated report adds the separately captured closing 26.

Today's cart preflight and final runner use **four POSTs total**, two isolated native add/remove cycles, both verified empty. No catalog writes, price writes, Product/Variant creation, inventory/SKU/class/grant changes, preview asset writes, MAIN writes, theme publications, order creation or checkout operations occur. No production deployment occurs.

Earlier G4 reads remain timestamped in their original directories. The interrupted October 19 run lacks a completed final cart/report record; its operation count cannot be invented from today's independent clean cart. Its available browser/performance results remain historical.

## K. Historical evidence

The original preservation incident remains open: `deployed-sawmaster-18-1440.png` and `deployed-trimmaster-1440.png` in G3A were overwritten by G3B. Their original SHA-256 values are **c026ef5f0b1d01ee47fbefcc1e5cf0ee7642182e7b9e8fb6962b77fabbb10a90** and **efedf2814aaa418f331b764db4ce8f875fc96e0ce2c8b24aecf4c4f672b106f0**. Exact original bytes remain unrecovered.

The original `g3b-2026-10-19/screenshot-preservation-audit.json` and failure record are unchanged. No replacement is created under either old name and neither expected hash is rewritten. Current positive/negative output isolation can PASS while historical recovery stays DEFERRED/open; unrelated customer journeys do not fail merely because those old bytes cannot be recovered.

## L. Remaining release blockers

| Category | Remaining condition |
| --- | --- |
| Current drift | Attachment $75 price lacks approval in the supplied decision record; deterministic commercial/native successor failure |
| Approval lifecycle | Current forward-fit render blocked by expired G2 presentation; owner receipt still valid only until October 22 cutoff |
| Deferred business | Attachment decision, MR16 procurement/price, Saw Vice exact four-model commerce mapping; G006 PARTIAL |
| Production operations | G003 private revocation and operating policy PARTIAL; no production authority in this batch |
| Historical evidence | G005 two original PNG contents unrecovered; formal exception open |
| Inherited accessibility | Epic C 558px enlarged header; Epic F moderate heading order; provider preview toolbar findings |
| Parked release gates | F-015B measurement integrity and F-018B final release remain parked/deferred |

Business deferral itself is not a technical failure. Unauthorized current price drift is a separate failed protection criterion. No business review is required to deliver or run this technical implementation.

## M. G-PBI-007 recommendation

| Recommendation field | Verified result |
| --- | --- |
| Repository implemented | **true** |
| Automated integration tests passing | **false** overall; 36/36 matrix cases PASS, one actual native price/offer criterion FAIL |
| Actual preview verified | **false** for complete acceptance; 111 Product routes, 22 machine cases, nine responsive cases, three browser-zoom and three native-viewport cases exercised |
| Current authority valid | **true** for exact compatibility/roles; unchanged expiry October 22, 20:26:37.102 UTC |
| Production deployable | **false** |
| Formally complete | **false** |
| Blocked acceptance | Current eligible forward-fit rendering under expired G2 presentation |
| Failed acceptance | Unapproved attachment price delta and its native visible/structured offer comparison |
| Commercial launch | **BLOCKED**; three unresolved commercial exceptions |

The integrated command exits **1**. Current source/output protection PASS covers 4857 run-baseline files; the independent original-task check covers **4491** pre-existing files with **zero runtime or historical-evidence modifications**. Owner/source receipts and MAIN remain unchanged. **Do not recommend formally COMPLETE, commercially ready or production deployable.**

## N. Epic G handoff

Proceed with independent Epic J work using exact native Variant/price/availability behavior and this exception ledger. The smallest remaining G follow-up is to reconcile the attachment change against explicit owner evidence, exercise an expressly authorized bounded current-fit projection within the existing preview contract, and rerun only affected acceptance plus final protection checks.

Keep G006 deferred decisions, G003 operating policy, G005 historical exception and the scoped C/F accessibility defects visible. No catalog split, unpublish, purchase restriction, receipt renewal, global navigation redesign or parked F gate is added. H/I/M/N remain post-O; O accounts/history and G008/G009 optional interfaces are not implemented here.
