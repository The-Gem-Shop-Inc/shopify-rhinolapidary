# F-PBI-015B Recorder V2 repair and bounded canary disposition

Date: 2026-10-07. Authorization: `delegated_development_override`, QA tooling and read-only measurements only.

**Decision: BLOCKED_MEASUREMENT_INTEGRITY.** The target-isolated warm design passes local Chromium testing, but the first live cold canary slot and its one allowed retry both fail mandatory recorder integrity. Sampling stops with two attempts, zero accepted samples, two invalid samples and one retry. No cold or warm triplet is complete; no current medians exist. The six-sample canary and full campaign are not certified.

The previous valid BeadMaster cold triplet remains unchanged and remains diagnostic evidence. It is not discarded or pooled with this new method. No optimization packet is produced from invalid V2 observations: the task's explicit section 31 stop applies. No further Shopify performance navigation or diagnostic trace is collected after the repeated invalid slot.

## Source and method identities

Storefront: `GLOBAL_HEADER_FOCUS_CORRECTION_2026_10_06`, canonical SHA256 `7f9156cef929619f7e9fb38ee5f51e740c7d63fe0efdeaf4cc510eaf32b72e37`. Corrected header SHA256 remains `e9e34d8dae4c59cf5040b010339e2124e46d71f89d960d80f1a9ef1589d93339`. All 29 bound runtime files and the complete local runtime inventory remain unchanged.

QA method: `EPIC_F_015B_LIVE_RECORDER_V2`, canonical method SHA256 `4f12de62602cad40a0dd2e13e6cb4d2ffa33c531ce5ecbc25529c7a8885ef3c7`. The method binds its specification, approved profile, collector/provenance/cache code, policy/schema dependencies and local tests. See [recorder binding](../qa/evidence/epic-f/015b-recorder-v2-2026-10-07/recorder-binding.json). The frozen code was not patched or restarted after these attempts. The runner rejects a repeat against its existing campaign-start artifact.

Environment: Chromium 149.0.7827.55, Playwright 1.61.1, Node v24.13.0, Windows_NT 10.0.26300 x64. Approved profile stays `RHINO_LIGHTHOUSE_SLOW_4G_2026_10`: reference RTT150ms/down1.6Mbps/up750Kbps/CPU4×/loss0; effective CDP latency562.5ms/down184320B/s/up84375B/s/CPU4×/loss0. Same approved profile remains intended for both viewports; this bounded task measures only mobile390×900DPR1.

## Original warm defect and implemented lifecycle

The old collector listens to BrowserContext request events and reloads the priming page as the measured page. Primed-document unload telemetry can therefore enter the measured record. Its HTTP200 response lacks completed byte evidence before finalization. Those historical bytes remain null.

V2 uses a fresh context per sample. Warm PAGE A primes the exact Product route under the approved throttle and load → fonts.ready →1500ms sequence. Its separate recorder closes admission and drains. A is closed. PAGE B is created in the same BrowserContext, retaining HTTP cache, receives its own CDP session and the same throttle, and measures its first navigation to that same route. Priming telemetry is retained with `PRIMING_LIFECYCLE` provenance; no telemetry URL exclusion exists. PAGE B telemetry initiated in its measurement window remains included.

Cold retains fresh independent context, cache clear, no Product prime, service-worker bypass, approved throttle and one measured Product navigation. Both cache states use the improved terminal accounting. The new 5000ms drain changes terminal accounting consistently, without changing the cold cache/navigation/settle policy.

Admission begins immediately before measured navigation and freezes after load, fonts.ready and1500ms. LCP/CLS/TBT snapshots freeze at cutoff. New post-window requests are diagnostic only. The drain resolves admitted requests into `COMPLETED_WITH_BYTES`, `FAILED_WITH_CLASSIFIED_REASON` or `UNRESOLVED`. Explicit failure is not treated as missing terminal lifecycle. Missing bytes remain null even if a failure event exists. Actual attempted drain durations were5013ms and5019ms, including timer/event-loop scheduling overhead around the fixed5000ms deadline.

## Local evidence and live failure

Local checks pass: lifecycle/provenance32, approved profile/cache22, existing measurement schema3. The actual two-page Chromium test observes the prime unload beacon, proves it does not enter B's record, proves B telemetry still counts, and proves B receives the A-warmed asset from browser cache. Existing performance contract34 checks pass; seven later redaction/safety/disposition checks pass. Local tests do not substitute for live integrity.

The live canary fails before warm sampling for two additional QA defects that the local suite did not cover:

1. V2 correlates Playwright public `request.timing().startTime` directly with CDP `requestWillBeSent.wallTime`. Under actual request throttling, Playwright uses `(response.timing.requestTime - requestWillBeSent.timestamp + requestWillBeSent.wallTime) ×1000`. Queue/start differences leave many entries unmatched and duplicated. The second attempt also contains one ambiguous pair. Its208/239 recorded request entries are **invalid inventories**, not valid whole-page counts or budget evidence. The installed implementation is visible at `node_modules/playwright-core/lib/coreBundle.js:35881`.
2. Inherited deprecated CDP URL wildcard blocking fails native `/checkouts/internal/preloads.js` requests with reason `inspector`. A separate V2 CDP-only row supplies uppercase `Script` to a guard expecting lowercase `script`, producing a false checkout-action classification. Both the first-party and shop.app preload requests have Playwright terminal failures with unavailable size evidence and no valid correlation to their CDP terminal failure rows. Their bytes remain null and whole-page transfer remains null.

The failure is not a valid performance budget result. It is not the previously observed prime unload beacon: warm PAGE A/B live execution was not reached. See [exact request/frame/loader/target evidence](../qa/evidence/epic-f/015b-recorder-v2-2026-10-07/invalid-lifecycle-diagnosis.json). The current protocol exposes absolute URLPattern block/allow semantics; a future QA correction must locally prove native passive assets pass while transaction navigation remains blocked. See [CDP Network](https://chromedevtools.github.io/devtools-protocol/tot/Network/) and the [protocol BlockPattern specification](https://raw.githubusercontent.com/ChromeDevTools/devtools-protocol/master/json/browser_protocol.json).

## Historical valid cold diagnostic remains intact

| Metric | Sample1 | Sample2 | Sample3 | Median | Budget |
|---|---:|---:|---:|---:|---:|
| LCP ms |2548|2540|2492|2540|2500|
| CLS |0.1125314865|0.0561099780|0.0561099780|0.0561099780|0.10|
| TBT proxy ms |2106|1943|1878|1943|200|
| Whole-page requests |133|126|130|130|120|

All three historical cold samples fail TBT and whole-page request budgets. Samples1–2 fail LCP; sample1 fails CLS. Images were0B. Worst whole-page transfer645132B, median641618B. Historical LCP was Product H1 text. Historical network attribution recorded45–46 native-payment-provider requests,33 Trade requests and2 Rhino requests. These figures are historical measured request shares, not main-thread ownership or causal optimization savings.

The historical evidence files are verified unchanged against their existing manifest:73 archived evidence files, zero changed. Current invalid attempts enter no medians. A genuinely comparable approved baseline remains `NONE_AVAILABLE`.

## Persistent-state proof

Fresh before catalog read completed2026-10-07T17:45:27.511Z; fresh after completed2026-10-07T17:54:03.360Z. Both reads exhaust25 Product pages and all protected nested connections. All122 exact protected Product/Variant records are unchanged. Classification remains11 machine/54 replacement_part/39 consumable/18 accessory. Eight suffixes remainmachine; the three exclusions remainnull. Other Rhino values/factual grants remainzero.

MAIN158579622085, `shopify-rhinolapidary/main`, remainsMAIN with422 file records. Preview158631198917, `Rhino Lapidary - Preview`, remainsUNPUBLISHED with426 file records. Entire inventories and all29 raw MAIN bound source bodies compare exactly before/after. No theme pushes, Product writes, suffix assignments, configuration changes, analytics enablement or publication occurred. Password authentication used only the existing separate unlock context and memory cookies; credentials were not persisted.

F-DEC-001 staysAPPROVED_OPTION_A; native payment_terms were not suppressed. F014B current focus remainsComplete/current shellPASS and overallPartial future live states only. F017B remainsComplete. F015B remainsBlocked measurement integrity; F015 remainsPartial with live certification incomplete. F018B remainsNot begun/Not ready.

## Tooling and evidence

New QA-only files: `data/epic-f-performance-recorder-v2.json`; `scripts/build-epic-f-recorder-v2.js`; `scripts/lib/epic-f-live-performance-network-v2.js`; derived collector/campaign V2 modules; profile V2 and lifecycle V2 tests; bounded canary runner; V2 safety tests; V2 evidence validator/finalizer; bounded diagnostic tool prepared with a six-valid-sample failure prerequisite but **not executed**. Historical recorder/profile/budget/schema implementations remain untouched.

New evidence folder: [015b-recorder-v2-2026-10-07](../qa/evidence/epic-f/015b-recorder-v2-2026-10-07/summary.json). It contains tests, method binding, preflight, before/after snapshots, two invalid attempts, invalid lifecycle diagnosis, prior cold diagnostic preservation, safety/persistent checks, current status before bodies and the final validation/manifest. Current development/eligibility JSON and tracker/certification narrative receive additive operational updates; old evidence is preserved.

## Requested disposition

| Item | Result |
|---|---|
|1 Recorder identity/hash|EPIC_F_015B_LIVE_RECORDER_V2 /4f12de62602cad40a0dd2e13e6cb4d2ffa33c531ce5ecbc25529c7a8885ef3c7|
|2 Original lifecycle cause|Context-wide recorder admits prime-page unload traffic during same-page warm navigation|
|3 Warm isolation|Separate A/B targets, same warmed context; locally proven, live warm not reached|
|4 Drain|5000ms fixed terminal deadline; metrics/request admission frozen|
|5 Lifecycle/provenance tests|32 pass|
|6 Profile/cache/schema|22+3 pass; existing performance contract34 pass|
|7 Prime telemetry retained|Yes in local actual Chromium proof; no live warm prime collected|
|8 Prime exclusion by provenance|Yes, target/page boundary; no URL exclusion|
|9 Measured telemetry counted|Yes; retained in measured inventories, whose full integrity failed|
|10 Cold material change|Cache/navigation/settle unchanged; shared improved terminal/provenance accounting|
|11 Canary attempted|2|
|12 Canary valid|0|
|13 Invalid/retry|2 invalid /1 retry|
|14 Cold triplet|Incomplete; first slot +retry invalid|
|15 Warm triplet|Not attempted after integrity stop|
|16–23 Current cold/warm LCP/CLS/TBT/request samples and medians|No accepted observations or medians; invalid raw attempts retained; prior valid cold triplet shown separately above|
|24 Other current budget violations|Not graded from invalid records|
|25 Recorder integrity|Not confirmed on Shopify|
|26 Canary performance|Invalid/not graded|
|27 Remaining samples|Six valid canary samples still needed;96 current-method samples required for full success. Remaining90 is conditional on a valid passing canary|
|28 Full campaign stopped early|Yes; never started|
|29 TBT ownership|No new diagnostic collected; historical TBT failure retained, ownership not inferred|
|30 Request ownership|Historical45–46 provider/33Trade/2Rhino retained; V2 duplicate inventories not used for ownership decisions|
|31 LCP breakdown|Historical H1 identity retained; no valid V2 phase diagnosis|
|32 CLS attribution|Historical sample1 violation retained; no source attribution inferred from invalid V2|
|33 Priority|Correct QA timing identity and precise CDP guard; no storefront optimization recommendation|
|34 F-DEC-001|Approved OptionA unchanged; provider cost not excluded|
|35 Budgets changed|No|
|36 Runtime changed|No|
|37 Shopify persistent mutations|0|
|38 F015B|BLOCKED_MEASUREMENT_INTEGRITY|
|39 F015|PARTIAL_CONTRACT_COMPLETE_LIVE_CERTIFICATION_INCOMPLETE|
|40 F018B|NOT_BEGUN /NOT_READY|
|41 Validation|See [validation.json](../qa/evidence/epic-f/015b-recorder-v2-2026-10-07/validation.json); saved canary decision is integrity stop, runner declares exit3, prior actual process exit was not persisted; evidence validator exit0|
|42 Files/evidence|QA files and evidence listed above; current operational status updated additively|
|43 Next action|QA-only protocol timing and precise native-preload guard correction, expanded negative tests, then a freshly frozen bounded canary|

Do not restart96, optimize storefront source, alter native payment terms, change thresholds or begin018B signoff from this disposition.

## Interrupted-session completion — 2026-10-10

The required F1–F8 repository aggregate finished before shutdown at 2026-10-07T18:09:09.040Z with exit0. Its seven underlying regression evidence hashes still match. Theme Check completed with zero findings. The interrupted work was the final validation record and evidence manifest, which are now completed by `node scripts/complete-epic-f-live-performance-v2-evidence.js`. This completion runs no Shopify navigation, certification sample, diagnostic trace, authentication or fresh Admin read. The persistent-state comparison remains the October7 before/after evidence; it does not claim a new October10 audit.

The stopped Recorder V2 artifacts and all73 historical evidence files remain byte-for-byte unchanged. Derived validator outputs from this completion are saved separately under [completion-2026-10-10](../qa/evidence/epic-f/015b-recorder-v2-2026-10-07/completion-2026-10-10/preservation.json). The completed [validation record](../qa/evidence/epic-f/015b-recorder-v2-2026-10-07/validation.json) retains command exits, saved test results, exact incomplete lifecycles and the reused successful repository aggregate. The [SHA256 evidence manifest](../qa/evidence/epic-f/015b-recorder-v2-2026-10-07/evidence-manifest.json) binds the report, current operational statuses, QA source and evidence. Verify it with `node scripts/complete-epic-f-live-performance-v2-evidence.js --verify`.

Both invalid attempts contain zero requests labeled `UNRESOLVED`; each instead has two explicit `Playwright.requestfailed` / `FAILED_WITH_CLASSIFIED_REASON` preload requests with `failure=inspector`, `bytes=null` and no correlated CDP request ID. Their measured targets are `9905769E13EC648412DC5035B073E3A2` and `4444C55BD2EC0B04677BC60ACA01A2C1`, respectively. The paths are the first-party and `shop.app` `/checkouts/internal/preloads.js`. Missing transfer evidence invalidates each sample even with a known terminal failure. Attempt2 also has ambiguous correlation for Playwright request ordinal118. Its208/239 inventory sizes remain invalid and are not request-budget observations.

Disposition remains `BLOCKED_MEASUREMENT_INTEGRITY`; the original section31 stop is honored. No optimization packet or performance certification decision is produced. Next work is a separate QA timing-correlation and precise passive-preload guard correction, expanded local negative tests, and a new frozen six-sample canary. The current task ends with this stopped-run disposition.
