Latest disposition, 2026-10-07: **BLOCKED_MEASUREMENT_INTEGRITY** after the approved profile was applied. See the [resumption record](#authorized-resumption--2026-10-07) below. The historical 2026-10-06 stopped-run narrative and evidence remain preserved.

# F-PBI-015B live performance certification — pre-sampling disposition

Date: 2026-10-06. Authorization: `delegated_development_override`, measurement and read-only verification only, for the current assigned zero-grant machine shell.

**Decision: BLOCKED_CONFIGURATION_NOT_SAMPLED.** No live performance sample was attempted. This is an unresolved mandatory protocol prerequisite, not an observed budget failure or an optimization conclusion. F-PBI-015B cannot be certified from this record.

## Exact protocol blocker

The unchanged authority is `data/brand-performance-budget.json`, B-030 in `docs/qa/rhino-brand-media-performance-budget.md`, the F-PBI-015A contract, and `scripts/lib/epic-f-performance.js`. The budget specifies “Slow 4G or explicitly approved mobile profile; record exact parameters” without a concrete network/CPU tuple. The existing release handoff explicitly records: “Existing protocol provides no fixed numerical Slow-4G parameters, so none are fabricated here.” See [release handoff](epic-f-shell-only-release-handoff.md), performance checks around line 282.

Repository searches found no approved numerical profile. The tuple `150 ms / 200000 download B/s / 90000 upload B/s / CPU 4×` occurs in a synthetic unit-test contract (`scripts/test-epic-f-performance.js`), not an approved browser configuration. It was not adopted. Environment configuration keys did not identify a performance profile. No browser preset, Lighthouse default, or guessed network value was substituted.

The missing configuration is **approved latency, download throughput, upload throughput, and CPU slowdown**. Effective mobile and desktop network/CPU settings remain null. Per task condition 10, sampling stopped before any storefront performance navigation. The existing machine collector is also local-fixture-only and has no live warm-cache implementation. That limitation is recorded rather than represented as measured warm data.

## Source and protected-state gate

Certification authority remains `GLOBAL_HEADER_FOCUS_CORRECTION_2026_10_06`, canonical SHA256 `7f9156cef929619f7e9fb38ee5f51e740c7d63fe0efdeaf4cc510eaf32b72e37`. Corrected `sections/header.liquid` SHA256 remains `e9e34d8dae4c59cf5040b010339e2124e46d71f89d960d80f1a9ef1589d93339`. No binding was regenerated.

Fresh read-only Admin reconciliation confirmed MAIN `158579622085`, `shopify-rhinolapidary/main`, role MAIN; Preview `158631198917`, `Rhino Lapidary - Preview`, role UNPUBLISHED. The complete inventories contain 422 MAIN and 426 Preview file records. All 29 certification-bound local source hashes match; the persistent MAIN file inventory matches the prior exact deployed readback, including all bound checksums. The fresh raw header body also hashes to the approved corrected header. The final read confirms both complete inventories unchanged.

The fresh complete catalog before-read finished `2026-10-06T21:30:53.195Z`; the after-read finished `2026-10-06T21:37:21.822Z`. All 122 exact Product/Variant records queried by the protected contract are unchanged; pagination and nested connections were exhausted. Distribution remains 11 machine, 54 replacement_part, 39 consumable, 18 accessory. The eight candidates retain suffix `machine`; JadeMaster, SawMaster 36 and TumbleMaster retain null. All 11 machine classifications remain `machine`; other governed factual grants remain zero. F-DEC-001 remains approved Option A. API version was not exposed by the connector.

These checks establish Admin/source identity. Actual measured HTTP/DOM identity, challenge/password guards, LCP ownership and preview-toolbar absence are **NOT_EXERCISED**, because no performance navigation occurred. Prior browser evidence is preserved but does not substitute for a current performance sample.

## Planned matrix and environment

| Normal assigned route | Exact Product GID | Current suffix | Planned samples | Collected |
| --- | --- | --- | ---: | ---: |
| `/products/beadmaster` | `gid://shopify/Product/8905779937477` | machine | 12 | 0 |
| `/products/em-1` | `gid://shopify/Product/8905780756677` | machine | 12 | 0 |
| `/products/lapmaster-12` | `gid://shopify/Product/8905781412037` | machine | 12 | 0 |
| `/products/lapmaster-18` | `gid://shopify/Product/8905781477573` | machine | 12 | 0 |
| `/products/sawmaster-18` | `gid://shopify/Product/8905784131781` | machine | 12 | 0 |
| `/products/sawmaster-24` | `gid://shopify/Product/8905784197317` | machine | 12 | 0 |
| `/products/shapemaster` | `gid://shopify/Product/8905784328389` | machine | 12 | 0 |
| `/products/trimmaster` | `gid://shopify/Product/8905785344197` | machine | 12 | 0 |

The structured evidence enumerates every one of the 32 route/profile/cache records separately, with three planned samples each: **96 planned, 0 attempted, 0 valid, 0 invalid, 0 retries**. Sixteen mobile triplets are planned as RELEASE_CERTIFICATION; sixteen desktop triplets are SUPPORTING_RELEASE_COMPARISON. Completed records: zero of either type. No records or historical observations were pooled.

Mobile is 390×900 DPR 1; desktop is 1440×900 DPR 1. The required sequence remains navigation/load, `document.fonts.ready`, 1500 ms settle, and 2500 ms inter-run delay. Actual timings are null. No cold or warm live context was executed. The fixture collector's new-context/cache-clear/cache-disabled behavior is documented as existing fixture behavior, not a live warm policy.

Version inspection only: Chromium 149.0.7827.55, Playwright 1.61.1, Node v24.13.0, Windows_NT 10.0.26300 x64, Shopify CLI 4.8.3. Chromium was launched only to obtain its version and closed without navigating the storefront. Lighthouse is not installed and no Lighthouse supporting run was attempted.

## Unchanged budget and missing measurements

| Metric | Mobile limit | Desktop limit | Samples / worst / medians |
| --- | ---: | ---: | --- |
| LCP | 2500 ms | 2500 ms | NOT_MEASURED |
| CLS | 0.10 | 0.10 | NOT_MEASURED |
| Established long-task TBT proxy | 200 ms | 200 ms | NOT_MEASURED |
| Initial transfer | 2,097,152 bytes | 2,097,152 bytes | NOT_MEASURED |
| Total image transfer | 512,000 bytes | 921,600 bytes | NOT_MEASURED |
| Largest image | 358,400 bytes | 512,000 bytes | NOT_MEASURED |
| First-screen media | 358,400 bytes | 512,000 bytes | NOT_MEASURED |
| Request count | 120 | 130 | NOT_MEASURED |
| Immediate video iframe | 0 | 0 | NOT_MEASURED |
| Autoplay | 0 | 0 | NOT_MEASURED |
| Unowned immediate third-party script hosts | 0 | 0 | NOT_MEASURED |
| Synchronous third-party scripts | 0 | 0 | NOT_MEASURED |

Missing metrics use explicit missing status and null values, never numeric zero. Sample arrays are empty and medians null. There is no individual budget pass/failure, route violation comparison, LCP element classification, resource inventory, unknown-host count, reduced-motion observation or layout-shift measurement. Each planned record carries the protocol-precondition violation; it is not a measured budget violation.

Native/provider payment terms remain approved Option A and would be included in whole-page cost. Provider, Shopify/native, Rhino/theme, telemetry and unknown-host costs are all **NOT_MEASURED**, not excluded or reported as zero. Historical Shop Pay CSP/frame restrictions, `/pay/hop` 403 and X-Frame-Options warnings remain recorded in prior evidence; this task did not collect a new console sample or compare their frequency.

Lighthouse targets remain mobile performance ≥85 and accessibility ≥95; current scores are null. Field INP ≤200 ms remains a field target. The established long-task TBT proxy was not relabeled as INP. No approved genuinely comparable release baseline was found: `approvedComparableBaseline = NONE_AVAILABLE`. Local F15A and live-development diagnostic observations are not release medians; no >10% regression calculation was invented.

## Evidence integrity and validation

See [machine-readable preflight](../qa/evidence/epic-f/015b-live-2026-10-06/certification.json), [before drift gate](../qa/evidence/epic-f/015b-live-2026-10-06/before-drift-gate.json), [final no-change comparison](../qa/evidence/epic-f/015b-live-2026-10-06/persistent-no-change.json), and [validation results](../qa/evidence/epic-f/015b-live-2026-10-06/validation.json).

Developer tooling adds `scripts/validate-epic-f-015b-certification-preflight.js` and its deterministic negative tests. The existing performance schema is extended only with `$defs.certificationPreflight` for an explicit unsupported-state stop. The original measured-record root, sample requirements, stages, budgets and `evaluateRun` semantics remain unchanged. The evidence validator rejects a certification-pass label, fabricated zero metrics or medians, reduced samples, source/profile/settle drift, record pooling and desktop standalone certification. `evaluateRun` rejects this preflight record as a measured certificate.

Historical F15A, deployment, header-correction and prior 014B evidence remain immutable. Exact previous current-status/tracker bodies are archived in `operational-before.json`; the current additive status supersedes their operational performance readiness only. Local regression fixtures and their observations are not live certification samples.

| Validation command / check | Result |
| --- | --- |
| `node scripts/validate-epic-f-015b-certification-preflight.js` | exit 0; drift gate passes; mandatory profile stop recorded |
| `node scripts/test-epic-f-015b-certification-preflight.js` | exit 0; 17/17 integrity checks |
| `node scripts/test-epic-f-performance.js` | exit 0; 34/34 existing contract checks |
| `node scripts/validate-epic-f-015b-certification-preflight.js --finalize` | exit 0; complete protected before/after comparison |
| `npm run validate:epic-f-batch-f8` with both existing cleanup/corrected-header binding environment paths | exit 0; F1–F8 required regression gates pass |
| CLI 4.8.3 `theme check --path . --fail-level warning --output json` | exit 0; 0 errors, 0 warnings |
| Final source freeze, structured evidence validator and secret scan | pass; no runtime drift or retained credentials |
| `git diff --check` | exit 0 |

The F1 aggregate retains two existing non-required diagnostic exits: `validate:launch-fixtures` and `validate:product-data -- data/product-export/products.csv` each exit 1. They are visible in the saved aggregate report, retain their original non-required classification, and are not live performance samples or ignored required gates. Historical F8 static packet status text is likewise preserved; current operational status is additive and does not rewrite it.

No signed preview URL, storefront password, token, cookie, authentication state, Playwright trace, HAR or screenshot was created for this task. No storefront authentication was needed. Runtime sources, budget authorities and protected Shopify state remain unchanged. Persistent Shopify mutations: **0**; theme writes, Product/Variant writes, suffix assignments, publication/configuration changes and analytics activation: **0**.

## Current disposition and next action

F-PBI-015B is **BLOCKED_MISSING_APPROVED_THROTTLE_PROFILE**, not COMPLETE and not FAILED_CERTIFICATION/OPTIMIZATION_REQUIRED. F-PBI-015 remains Partial: repository measurement contract complete, live certification not executed. F014B-FOCUS-CURRENT stays COMPLETE; current shell accessibility stays PASS; F-PBI-014B remains PARTIAL_FUTURE_LIVE_STATES_ONLY with its two future populated-state criteria unchanged. F-PBI-017B stays COMPLETE. F-PBI-018B remains NOT_BEGUN / NOT_READY; no selected-scope signoff was performed. E-MUT-020/021 remain reconciled and F-DEC-001 remains approved Option A.

Technical facts, measurements, compatibility, BOM/contents, recommendations, fulfillment/pickup/timing, warranty/service and resources remain separate incomplete Epic E/future-content domains. They were not populated or used to block current-shell sampling.

Next action: resolve and review a concrete numerical network/CPU profile under the existing performance policy, freeze its approval/configuration, and implement/verify the bounded live cold/warm recorder and supporting-run requirements. Recheck this unchanged source binding before collecting the complete 96 samples. Do not optimize runtime, loosen budgets, change assignments or execute F-PBI-018B from this disposition.

## Authorized resumption — 2026-10-07

**Final decision: BLOCKED_MEASUREMENT_INTEGRITY.** The numerical profile is approved, implemented and tested. Configuration is resolved. The complete 96-sample campaign cannot certify because both attempts at the first warm slot lack a mandatory native unload-beacon transfer total. No missing value is replaced with zero, no telemetry request is excluded, and no runtime optimization is performed. The current campaign's BeadMaster mobile cold triplet has complete measurement observations and fails several unchanged budgets; it is a partial observation, not a certificate for all eight routes.

Authorization remains `delegated_development_override`, measurement and developer tooling only. The current MAIN is `158579622085 / shopify-rhinolapidary/main / MAIN`; Preview remains `158631198917 / Rhino Lapidary - Preview / UNPUBLISHED`. The source binding remains `GLOBAL_HEADER_FOCUS_CORRECTION_2026_10_06`, SHA256 `7f9156cef929619f7e9fb38ee5f51e740c7d63fe0efdeaf4cc510eaf32b72e37`, with all 29 runtime files and corrected header unchanged.

### Approved and applied profile

The durable authority is [epic-f-performance-profiles.json](../../data/epic-f-performance-profiles.json), profile `RHINO_LIGHTHOUSE_SLOW_4G_2026_10`, approved 2026-10-07 under delegated development authority. The reference identity is 150 ms RTT, 1.6 Mbps down, 750 Kbps up, zero packet loss and CPU 4×. Actual request-level values are **562.5 ms latency, 1474.56 Kbps down, 675 Kbps up and CPU 4×**. Decimal Kbps ×1000 ÷8 gives exactly **184320 download bytes/sec and 84375 upload bytes/sec**. The same network and CPU values apply to both 390×900 DPR1 and 1440×900 DPR1.

The collector calls `Network.emulateNetworkConditionsByRule` with an empty global URL pattern, online state and packetLoss 0; `Network.overrideNetworkState` with the same effective values; and `Emulation.setCPUThrottlingRate` with rate 4. Evidence retains exact command values/acknowledgements, returned rule ID and measured document association with that rule. Unsupported commands or missing rule acknowledgements fail closed. CDP has no numerical CPU-setting getter; verification comprises exact acknowledged command parameters plus deterministic tests. No simulated Lighthouse result is claimed. See the [CDP Network reference](https://chromedevtools.github.io/devtools-protocol/tot/Network/#method-emulateNetworkConditionsByRule) for request-level rules and throughput units.

Local tests pass: **22 profile/cache checks, 5 recorder checks, 4 capture-cutoff checks and 5 beacon completion checks**. Actual Chromium tests prove request-rule association, enforced latency and same-context cached-asset reuse. Negative checks reject missing/wrong-route warm primes, cache clearing after prime, previously navigated cold contexts, reused measured contexts, missing cache labels and CDN cache alone. They reject silent unthrottled fallback and profile drift. The beacon test also reproduces the earlier recorder defect before its correction.

### Cache and observation method

Each measured sample starts in a fresh independent context with a generated evidence ID. Storefront unlock occurs in a separate context; only cookies are copied in memory. The unlock page is not a prime or performance sample. Cold clears HTTP cache and performs one measured Product navigation. Warm clears before one unmeasured same-route prime, retains that context/cache, then measures the second same-route navigation. No context is reused between measured samples. Fresh context storage and CDP service-worker bypass prevent inherited service-worker/cache state. Playwright request routing is not used because it disables HTTP caching.

Every navigation retains load → fonts ready → 1500 ms settle; inter-run delay is 2500 ms. At cutoff the performance snapshot and new-request capture are frozen. Already captured requests may drain for at most 30000 ms, without adding later requests or extending the LCP/CLS/TBT observation window. The cutoff tests prove this separation. Request inventory includes every captured request, including failed/native/provider/telemetry attempts. Cached responses are explicitly identified; actual zero cache transfer is distinct from missing bytes.

The requested and resolved canonical normal URLs are `https://rhino-lapidary.myshopify.com/products/...`, without preview or template queries. This domain is the live store's resolved canonical Shopify domain, not a different theme/session. Every accepted current observation verifies HTTP 200, exact BeadMaster GID, normal route, MAIN ID/role, machine-shell structure, no toolbar, native terms/controls and zero governed DOM modules. No transaction or Product control interaction occurs.

### Restart and invalid-attempt journal

| Campaign directory suffix | Attempted | Collector initially marked valid | Accepted into current campaign | Disposition |
| --- | ---: | ---: | ---: | --- |
| `015b-live-2026-10-07` | 2 | 0 | 0 | Invalid sandbox-service-worker errors and incomplete totals; earlier authentication stop also retained |
| `015b-live-2026-10-07-restart-1` | 5 | 3 | 0 | Recorder completion gap and alias-origin identity failure; invalidated |
| `015b-live-2026-10-07-restart-2` | 5 | 3 | 0 | Alias-to-canonical origin mismatch violates the existing URL contract; warm totals still incomplete; invalidated |
| `015b-live-2026-10-07-restart-3` | 5 | 3 | 3 complete observations | Canonical URL identity passes; warm slot fails integrity twice; stopped |

Total task sampling attempts: **17**. Current methodology: **5 attempted, 3 valid measurement observations, 2 invalid warm attempts, 1 retry**. No slow valid sample was discarded within its methodology. When collector corrections were needed, whole campaigns were invalidated and restarted from sample 1 under new frozen tooling hashes. Earlier methodology results are preserved but never pooled into current medians. The six earlier collector-labelled valid observations are not accepted certification data, including because the existing validator detected alias-origin mismatch. The original authentication stop collected zero samples.

Exact frozen collector/profile/source files are hashed per campaign. Current tooling binding SHA is recorded in [summary.json](../qa/evidence/epic-f/015b-live-2026-10-07-restart-3/summary.json). The current collector/profile/budgets/runtime remain unchanged after sample 1.

### Exact unsupported warm observation

Both current warm attempts include an allowed native POST to `/.well-known/shopify/monorail/unstable/produce_batch`. HTTP status is observed as 200, but neither Playwright nor the correlated page CDP record provides completion/encoded transfer before the 30000 ms drain expires. Whole-page transfer therefore remains null. HTTP 200 alone does not prove completion or bytes. The endpoint is neither a transaction nor new F instrumentation; it is native telemetry. It is retained in request counts and evidence, not blocked or ignored. No server behavior, packet loss or payload size is inferred.

Warm cache procedure is implemented and tested; **complete live warm resource observation is not supported by this campaign's recorder for that unload request**. Increasing settle timing, excluding the request, estimating its bytes, or mixing recorder versions would invalidate the defined methodology. The deterministic single retry also fails, so further slots are not collected.

### Complete planned matrix and current observations

The unchanged plan remains eight normal routes × two viewport profiles × cold/warm × three samples = **96 samples / 32 triplets**. [matrix.json](../qa/evidence/epic-f/015b-live-2026-10-07-restart-3/matrix.json) explicitly records every planned combination. One mobile cold triplet is measured and fails; the BeadMaster mobile warm record is blocked; thirty other records remain unattempted after the integrity stop. There are **zero passed mobile certificates and zero desktop supporting triplets**. The other seven routes are not claimed measured. No full-campaign median exists.

| Metric, BeadMaster mobile cold only | Sample 1 | Sample 2 | Sample 3 | Median | Unchanged limit |
| --- | ---: | ---: | ---: | ---: | ---: |
| LCP ms | 2548 | 2540 | 2492 | 2540 | 2500 |
| CLS | 0.1125314865 | 0.0561099780 | 0.0561099780 | 0.0561099780 | 0.10 |
| TBT proxy ms | 2106 | 1943 | 1878 | 1943 | 200 |
| Contract successful-resource transfer bytes | 638844 | 637619 | 634050 | 637619 | 2097152 |
| Contract successful-resource requests | 124 | 119 | 123 | 123 | 120 |
| Whole-page requests, including failures/telemetry | 133 | 126 | 130 | 130 | 120 |

Whole-page transfer maximum is **645132 bytes**, median **641618 bytes**, including observed failed/provider costs. Exact per-sample totals are in the summary/attempt files. Existing `resourceMetrics` retains its successful-resource summary semantics; supplemental whole-page totals include **all** captured requests and enforce the same absolute budgets independently. Failed requests are never used to improve the reported whole-page count. The original evaluator also reports its unchanged failed-network-observation gate, separately from absolute budget violations.

Image transfer, largest image, first-screen image/media transfer, immediate machine video iframe, autoplay, unowned third-party script hosts and synchronous third-party scripts are measured **0 in these three current cold samples only**. The initial zero-grant page has no image requests; these are observed zeros, not missing metrics. All uncollected matrix metrics/medians remain missing/null. The LCP element is the Product title H1 `BeadMaster 6"` in each sample. All three cold samples violate TBT and whole-page request limits; LCP fails samples 1/2 and CLS fails sample 1.

### Whole-page ownership, provider and baseline

[attribution.json](../qa/evidence/epic-f/015b-live-2026-10-07-restart-3/attribution.json) retains original contract attribution and adds deterministic host/path/local-asset classification per sample, without changing `evaluateRun` or resource budgets. Counts and bytes reconcile to the complete observed whole-page totals.

- Native payment/provider: **45–46 requests / 93695–95014 bytes per current cold sample**.
- Trade runtime: **33 requests / 65613–65648 bytes**.
- Rhino runtime: **2 requests / 1455–1471 bytes**.
- Native Shopify CDN: **10 requests / 137870–142531 bytes**.
- Native Shopify first-party: **16 requests / 292253–292573 bytes**.
- Native telemetry: **20–26 requests / 45716–48172 bytes**.
- Unknown/unclassified resources: **0** in the three complete current cold inventories.

These ranges are descriptive per-sample attribution, not pooled release metrics. Payment terms remain visible, current-Variant associated and included in cost under F-DEC-001 Option A. Known Shop Pay CSP/403 errors are retained; current canonical observations have no page/Liquid errors or transaction/download attempt. The Playwright-induced sandbox service-worker errors belonged to the invalidated first methodology and disappeared after the QA correction. No financing, pixel or consent configuration changed.

`approvedComparableBaseline = NONE_AVAILABLE` remains unchanged; no >10% comparison uses local singles or prior development diagnostics. Field INP is not measured, and TBT proxy is not INP. Existing custom machine collection does not invoke Lighthouse; scores are not fabricated, and the referenced ≥85 performance / ≥95 accessibility targets remain unchanged. Browser 149.0.7827.55, Playwright 1.61.1, Node v24.13.0, Windows_NT 10.0.26300 x64 are recorded in the campaign.

### Safety, validation and operational state

[Final protected comparison](../qa/evidence/epic-f/015b-live-2026-10-07-restart-3/persistent-no-change.json) confirms all 29 runtime sources, complete MAIN/Preview file inventories and source bodies, all 122 queried Product/Variant protected records/classifications, eight assignments and three exclusions unchanged. Factual grants remain zero. Theme/Product/configuration/publication mutations are **0**. Cookies/passwords remain in memory and browser handles are closed; no traces, HARs, screenshots or signed preview credentials are retained.

Validation commands/results are recorded in [validation.json](../qa/evidence/epic-f/015b-live-2026-10-07-restart-3/validation.json). Local profile/cache/recorder/cutoff/beacon checks pass 36/36. Existing performance contract checks pass 34/34. The current evidence validator verifies unchanged source/tooling/profile hashes, cache contexts, per-request throttle association, record schema, individual violations, exact medians, invalid exclusion and final protected state. Theme Check CLI 4.8.3 remains exit 0 with zero errors/warnings. Historical static/local fixture observations are not performance certification data.

| Final validation | Exit / result |
| --- | --- |
| Profile/cache tests | 0; 22 checks |
| All-frame recorder tests | 0; 5 checks |
| Cutoff/drain tests | 0; 4 checks |
| Beacon completion tests | 0; 5 checks, plus preserved pre-fix reproduction |
| Existing performance contract tests | 0; 34 checks |
| Historical preflight integrity tests | 0; 17 checks |
| Current measurement evidence/source/persistence validator | 0; evidence valid, certificate blocked |
| F1–F8 aggregate with cleanup and corrected-header bindings | 0; required regressions pass |
| CLI 4.8.3 full repository Theme Check | 0; zero errors/warnings |
| Final git diff check and managed-file credential scan | 0 / pass |

The collector's nonzero execution result is intentional for the integrity stop, not a passing certificate. Two pre-existing non-required F1 diagnostics (`validate:launch-fixtures` and Product CSV validation) remain exit 1 and are retained separately. Earlier static manifests, original stopped-run evidence and historical approval states are not rewritten. Original report/status bodies are archived before the additive update. An asynchronous first-campaign tooling-body backup overlap was detected; exact earlier QA bodies were reconstructed from the reviewed diff and verified against all nine original frozen hashes, with that correction explicitly disclosed in `tooling-body-backup-race.json`.

F-PBI-015B is **BLOCKED_MEASUREMENT_INTEGRITY**, not Complete and not blocked by numerical configuration. F-PBI-015 remains Partial, with live certification incomplete. The observed cold budget violations remain visible as a preliminary optimization decision packet; no whole-campaign optimization certification outcome is asserted from incomplete coverage. F-PBI-014B remains PARTIAL_FUTURE_LIVE_STATES_ONLY; F014B-FOCUS-CURRENT remains Complete. F-PBI-017B remains Complete. F-PBI-018B remains NOT_BEGUN / NOT_READY. No signoff is executed. E-MUT-020/021 and approved Option A remain unchanged; future technical/media/resource/context domains remain separate.

Next action: correct and prove request completion/byte capture across native warm unload-beacon lifecycles using a reviewed QA recorder, without dropping telemetry or changing the profile/window/budgets. Bind that recorder and restart all 96 samples from sample 1. Use the cold attribution/violations for subsequent optimization planning; do not optimize live runtime from this task.


## Recorder V2 repair and bounded canary — 2026-10-07

**BLOCKED_MEASUREMENT_INTEGRITY.** Separate PAGE A/PAGE B cache-preserving target isolation and a 5000ms terminal drain pass local tests, but the first live cold slot and its allowed retry are invalid. Zero current samples are accepted; no warm live sample is attempted. Public Playwright response-start timing does not equal CDP requestWillBeSent wall time under throttling, producing uncorrelated duplicates. Inherited CDP URL blocking also fails passive native checkout preload resources, whose byte evidence remains null. The native preload classifier receives uppercase CDP resource types for CDP-only rows and misclassifies them.

No additional live sampling or diagnostics are performed after this integrity stop. The historical valid cold triplet and previous null-byte warm attempts are preserved unchanged. Current performance medians are absent, rather than zero. All 29 runtime source files, both themes and all 122 protected Product/Variant records remain unchanged. Source binding stays `7f9156cef929619f7e9fb38ee5f51e740c7d63fe0efdeaf4cc510eaf32b72e37`; F-DEC-001 remains approved Option A.

See [complete V2 disposition](epic-f-015b-recorder-v2-integrity.md) and [evidence](../qa/evidence/epic-f/015b-recorder-v2-2026-10-07/summary.json). The conditional performance optimization packet is not produced because Recorder V2 live integrity is unconfirmed; the user's explicit section 31 stop applies. Next action is a QA-only timing/precise preload guard correction with expanded negative tests, then a new frozen bounded canary.
