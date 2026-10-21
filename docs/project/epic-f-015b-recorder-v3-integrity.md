# F-PBI-015B Recorder V3 integrity disposition — 2026-10-10

**BLOCKED_MEASUREMENT_INTEGRITY.** Recorder V3 corrects the two verified V2 defects, but its single predeclared live cold probe is invalid under the unchanged complete-transfer contract. Six admitted Shopify-native telemetry requests explicitly ended in `Network.loadingFailed` with `net::ERR_ABORTED`, without authoritative transfer bytes. The runner stopped immediately: no retry, no warm measurement, no canary continuation, no performance decision, no optimization diagnosis, and no remaining90 campaign.

Authorization: `delegated_development_override`, QA/tooling only. Runtime source changes, theme pushes, Product changes, assignment changes, payment changes, analytics changes, factual grants, and Shopify persistent mutations: **0**. Performance budgets and approved throttle are unchanged. F-DEC-001 remains **APPROVED_OPTION_A**; native payment terms remain enabled.

## Frozen identities

| Identity | SHA256 |
| --- | --- |
| STORE SOURCE: `GLOBAL_HEADER_FOCUS_CORRECTION_2026_10_06` | `7f9156cef929619f7e9fb38ee5f51e740c7d63fe0efdeaf4cc510eaf32b72e37` |
| MEASUREMENT METHOD: `EPIC_F_015B_LIVE_RECORDER_V3` | `03611c152c662bcec5e1fee98435e3f6d92919b65a1a3daaefea87c3c63eb892` |
| Historical V2: `EPIC_F_015B_LIVE_RECORDER_V2` | `4f12de62602cad40a0dd2e13e6cb4d2ffa33c531ce5ecbc25529c7a8885ef3c7` |

V3 is additive. V1/V2 implementation and reports were not rewritten. [Binding](../qa/evidence/epic-f/015b-recorder-v3-2026-10-10/recorder-binding.json) hashes the V3 specification, collector, CDP ledger, guard, cache/campaign logic, performance schema, approved profile, and lifecycle/safety tests. The canonical method hash is SHA256 of the binding object serialized before its `sha256` field is added. [Frozen methodology](../qa/evidence/epic-f/015b-recorder-v3-2026-10-10/frozen-methodology.json) additionally protects the source/runtime and method inputs. No frozen code, profile, or source changed after the probe.

## Network authority and V2 corrections

V2 used Playwright Request timing to correlate CDP records. Throttled queue/start differences produced duplicate, unmatched, and ambiguous rows. V3 admits resources directly from the measured target's CDP Network session and attached child targets. CDP requestId is the chain identity; session provenance and redirect-leg ordinal disambiguate resources. Repeated requestWillBeSent with redirectResponse creates a new deterministic leg, while retaining the prior leg. Same URLs, simultaneous starts, identical wall times, different types/frames, and reordered events do not form identity joins.

There are **0 required Playwright-to-CDP timing matches**. The separate Playwright request log is `NON_AUTHORITATIVE_DIAGNOSTIC`; it cannot affect inventory, bytes, terminal state, validity, cache state, medians, or budgets. Its mismatch with CDP is not an integrity failure.

For successful final legs, transfer bytes come only from `Network.loadingFinished.encodedDataLength`. Intermediate redirect legs retain explicit CDP `redirectResponse.encodedDataLength`, since they do not have an individual loadingFinished event. Missing values remain null. response length, Content-Length, decoded bodies, dataReceived totals, cache flags, and Playwright observations cannot replace terminal bytes. Explicit measured zero is accepted; inferred zero is not. Explicit failures and unresolved lifecycles remain distinct, and either is invalid when mandatory authoritative bytes are missing.

The deprecated broad checkout/pay URL blocker is absent from V3's certification path. V3 observes requests without setBlockedURLs, routing, or Fetch interception. Ingress normalizes `String(type).toLowerCase()` and uppercase method. GET/HEAD passive checkout preload scripts classify `PASSIVE_RESOURCE`, including first-party and shop.app variants. Native telemetry and passive provider requests still count when admitted; no telemetry URL exclusion exists.

Safety comes from no transactional automation plus observation and immediate invalidation/context disposal upon meaningful mutation or prohibited navigation evidence. The runner only authenticates in memory, creates pages, navigates, and observes. It does not click purchase/checkout controls, submit forms, change quantity, or transact. Mutation endpoints are assessed with method, body presence, resource/document context, and navigation semantics; pathname substrings alone do not identify transactions. The main frame must remain on the expected Product route. Passive provider iframe documents are distinct from a main-frame transaction departure.

Child target setup records CDP provenance and the same network profile. Main/iframe CPU is4×. Worker network emulation is acknowledged through Network.emulateNetworkConditionsByRule; Chromium reports CPU emulation unsupported for workers, and that response is retained without inventing success. Cross-session terminal handoff uses exact CDP requestId plus frame/target ancestry, never approximate timestamps.

Protocol references: [CDP Network](https://chromedevtools.github.io/devtools-protocol/tot/Network/) and [CDP Target](https://chromedevtools.github.io/devtools-protocol/tot/Target/).

## Lifecycle, cache, cutoff, and drain

Every measured sample has a fresh independent BrowserContext, the inherited service-worker policy, and the approved mobile390×900 DPR1 profile. `RHINO_LIGHTHOUSE_SLOW_4G_2026_10`: reference RTT150ms, downstream1.6Mbps, upstream750Kbps, CPU4×, packet loss0; effective CDP latency562.5ms, downstream184320B/s, upstream84375B/s, CPU4×.

Cold clears cache, has no Product prime, creates a measured Page/CDP session, and performs one governed Product navigation. Warm primes the exact same Product route on PageA, waits load + fonts.ready +1500ms, closes admission, drains, and retains prime diagnostics. PageA is disposed through an unmeasured about:blank navigation before close so unload traffic can be recorded before its CDP target detaches. PageB then starts with a fresh Page/session/ledger in the same BrowserContext, without clearing cache. This teardown does not add requests to the measured PageB record. The context is disposed after measurement. Cold semantics remain materially unchanged.

The measured window starts immediately before the Product navigation and closes after load + fonts.ready +1500ms. At cutoff, LCP/CLS/TBT and admitted request IDs freeze. CDP's Performance monotonic timestamp also prevents a newer request delivered during cutoff handling from entering measured totals. Newly initiated traffic is `POST_WINDOW_DIAGNOSTIC`. The maximum terminal drain is **5000ms**, only for admitted IDs; it cannot extend metrics, admit requests, alter cache, or count post-window bytes. Drain stops early once admitted lifecycles reach explicit terminals.

Prime unload telemetry is retained with prime-target/document provenance. It is excluded from PageB totals because of lifecycle/target provenance, never URL. PageB telemetry remains counted. Real Chromium fixtures demonstrate cache reuse, measured telemetry, prime unload separation, context isolation, redirects, simultaneous same-URL requests, passive native-style preloads, out-of-process iframe resources, and worker lifecycle handoffs. Live warm sampling was not attempted after the failed cold probe.

## Local validation

| Suite | Final result |
| --- | --- |
| CDP request identity, including redirects and cutoff timestamp |20 passed |
| Transfer integrity / terminal drain / failure versus unresolved |13 passed |
| Guard, uppercase ResourceType, passive requests, prohibited actions |40 passed |
| Certification finalizer decision rules |3 passed |
| Cache policy and negative provenance tests |10 passed |
| Real Chromium lifecycle fixtures |17 passed |
| Combined V3 ledger/lifecycle suite |**103 passed,0 failed** |
| Approved throttle/profile/cache suite |**22 passed,0 failed** |
| Schema/evidence/safety suite |**12 passed,0 failed** |
| Existing F performance contract |**34 passed** |
| Current F1–F8 local/static aggregate |**exit0** |
| Theme Check within the current aggregate |**0 findings** |

Local fixture authoritative duplicate rows:0; ambiguous rows:0; passive preload blocks:0; URL-specific telemetry suppressions:0. Earlier local development failures remain in `local-tests-failed.json`, superseded by the final passing result. Repository validation's earlier19-identity-test snapshot preceded one additional final cutoff test; the frozen final suite has20 identity tests and103 total. Neither snapshot is live certification evidence.

## Fresh source and persistent-state gate

Immediately before the probe: theme read completed2026-10-10T19:48:10.291Z; catalog read completed19:48:41.294Z; gate passed19:49:51.187Z. MAIN158579622085 is MAIN. All29 bound runtime files match exactly; eight machine assignments and three null exclusions match; classification reconciles to11 machine /54 replacement_part /39 consumable /18 accessory across122 Products. Other factual grants:0.

After-state theme inventory and source bodies equal the before read. The fully paginated25-page catalog after read completed19:56:47.635Z; all122 protected Product/Variant snapshots equal the before read, including assignments/exclusions. The finalizer verifies the frozen method/source inputs and hashes of **122 historical evidence/report files**. This task does not claim that the pre-existing dirty workspace belongs to V3: no storefront runtime file was edited by this task.

## Single live probe and exact remaining blocker

The predeclared cold probe used the identical frozen certification method, expected route `/products/beadmaster`, Product gid8905779937477, mobile390×900 DPR1, and bound MAIN/template. Exactly1 probe attempted;0 valid;1 invalid;0 retries. It was not retained as cold sample1. No subsequent live page measurement ran.

The authoritative inventory contains136 admitted rows,0 duplicate keys,0 ambiguous identities,0 prohibited request/navigation observations, and0 passive inspector blocks. Both previously blocked Script preloads now complete with status200 and `Network.loadingFinished`: first-party3692B, shop.app482B. They classify PASSIVE_RESOURCE. The probe fails because six different admitted Fetch rows have explicit terminal failure and bytesnull:

| CDP requestId | Endpoint | Response status | Terminal evidence | Bytes |
| --- | --- | --- | --- | --- |
|6784.161 | `/api/collect` |204 | loadingFailed / net::ERR_ABORTED |null |
|6784.171 | `/.well-known/shopify/monorail/unstable/produce_batch` |200 | loadingFailed / net::ERR_ABORTED |null |
|6784.180 | same native endpoint |200 | loadingFailed / net::ERR_ABORTED |null |
|6784.181 | same native endpoint |200 | loadingFailed / net::ERR_ABORTED |null |
|6784.184 | same native endpoint |200 | loadingFailed / net::ERR_ABORTED |null |
|6784.185 | same native endpoint |200 | loadingFailed / net::ERR_ABORTED |null |

All six belong to measured target/frame `EA6E46DEF444FD4CBE73E9296F94A8E5`, loader `FB8EE1301963A308A2E04F7AE2293293`. Initiator stacks identify Shopify perf-kit for collect and Shopify wpm for monorail, through Shopify shop_events_listener. They are current-page traffic, not prime unload traffic. These terminal failures were captured before measured context disposal. `blockedReason` is null, not inspector. HTTP response status is not proof of whole transfer completion. Their precise abort cause is not established by this CDP evidence.

Unresolved admitted lifecycles:0. Failed admitted lifecycles without authoritative bytes:6. Whole-page transfer:null. Maximum drain5000ms; actual1177ms, ending after the remaining lifecycles terminalized. [Exact retained lifecycles and initiators](../qa/evidence/epic-f/015b-recorder-v3-2026-10-10/invalid-lifecycle-diagnosis.json) distinguish explicit failures from unresolved requests.

Raw invalid-probe metrics remain in its original attempt file for transparency, including inherited provisional budget fields. They do not enter medians or establish a current certification failure. V3 canary performance is **INVALID_NOT_GRADED**. No ownership/performance diagnosis or optimization packet was authorized by a valid six-sample result.

## Historical diagnostic evidence, unchanged and separate

| Metric | Historical valid cold samples | Median |
| --- | --- | --- |
| LCPms |2548 /2540 /2492 |2540 |
| CLS |0.112531 /0.056110 /0.056110 |0.056110 |
| TBT proxy ms |2106 /1943 /1878 |1943 |
| Requests |133 /126 /130 |130 |

This remains valid historical diagnostic evidence. It is not V3 evidence, is not pooled with the invalid probe, and does not grade the current canary. Historical null-byte samples also remain unchanged.

## Required final disposition

| Requested item | Result |
| --- | --- |
|1 V3 identity/hash |EPIC_F_015B_LIVE_RECORDER_V3 /03611c152c662bcec5e1fee98435e3f6d92919b65a1a3daaefea87c3c63eb892 |
|2 CDP-only authority |Yes |
|3 Playwright timing correlation retained |No |
|4–5 Duplicate/ambiguous authoritative rows |0 /0 locally and in the probe |
|6 Passive preload classification |PASSIVE_RESOURCE |
|7 Native preloads blocked by harness |No; both completed with bytes |
|8 Guard normalization |Lowercase resource type, uppercase method; passed |
|9 Transaction safety |No transactional automation; observe, invalidate, dispose on prohibited evidence |
|10 Prime A/B isolation |Local real Chromium passed; live warm not run |
|11 Drain |5000ms maximum;1177ms probe actual |
|12 Request identity |20 passed |
|13 Guard |40 passed |
|14 Transfer integrity |13 passed |
|15 Real Chromium |17 passed; total V3 suite103 |
|16 Fresh source drift gate |Passed;29 files,122 Products,8 assignments,3 exclusions,0 facts |
|17 Live probes attempted |1 |
|18 Probe valid |No |
|19 Invalid reason |Six explicit net::ERR_ABORTED terminals lack authoritative bytes |
|20 Retained as cold sample1 |No |
|21 Cold canary valid samples |0; triplet incomplete |
|22 Warm canary valid samples |0; not attempted; triplet incomplete |
|23 Invalid/retried canary samples |1 invalid probe;0 retries; no continuation |
|24–31 Cold/warm LCP,CLS,TBT,requests values and medians |N/A: neither triplet complete; no certification medians |
|32 Other budget violations |Not graded from invalid evidence |
|33 Recorder integrity |Not confirmed live; BLOCKED_MEASUREMENT_INTEGRITY |
|34 Canary performance |INVALID_NOT_GRADED |
|35 Remaining campaign samples |96 valid samples still required for success;6 canary +90 conditional remainder |
|36 Full campaign run |No |
|37 Historical evidence preserved |Yes;122 baseline files verified unchanged |
|38 Optimization packet |No; valid-canary-failure condition not reached |
|39 Runtime source changed |No |
|40 Shopify persistent mutations |0 |
|41 Budgets changed |No; throttle unchanged |
|42 F-PBI-015B |BLOCKED_MEASUREMENT_INTEGRITY |
|43 F-PBI-015 |PARTIAL_CONTRACT_COMPLETE_LIVE_CERTIFICATION_INCOMPLETE |
|44 F-PBI-018B |NOT_READY; execution NOT_BEGUN |
|45 Files |Additive V3 specification/tooling, evidence/report; operational status registers/tracker updated |
|46 Validation exits |Local/repository checks0; single live probe3, the intended blocked disposition; finalizer0 |
|47 Recommended action |Resolve complete authoritative accounting for admitted native aborted lifecycles before a separately frozen probe; retain nulls and strict contract |

F-PBI-014B remains PARTIAL_FUTURE_LIVE_STATES_ONLY; F-PBI-017B remains COMPLETE. F-DEC-001 remains APPROVED_OPTION_A. Certification success still requires96 valid samples; a valid mandatory triplet failure suffices to establish failure without the remaining90. Tests encode this distinction without weakening individual-sample budgets.

## Validation commands and evidence

The recorded command exits are in [validation.json](../qa/evidence/epic-f/015b-recorder-v3-2026-10-10/validation.json). Local checks, current F1–F8 aggregate, approved profile/cache, schema, JSON registers, repository hygiene, Theme Check, diff check, source/history verification, and credential scan pass. The single live command's actual Node exit3 is preserved in `live-command-exit.json`; the outer shell adapter's nonzero exit is not a second attempt.

Created: V3 specification; guard, CDP network collector, campaign, additive build script, frozen runner, three test suites, prepared conditional diagnostic runner, validation/finalization/blocker/sealing tools, this report, and the complete [V3 evidence directory](../qa/evidence/epic-f/015b-recorder-v3-2026-10-10/summary.json). Modified only operational reporting in `data/epic-f-current-development-status.json`, `data/epic-f-current-shopify-eligibility.json`, and the Epic F tracker. [Evidence manifest](../qa/evidence/epic-f/015b-recorder-v3-2026-10-10/evidence-manifest.json) enumerates hashes and exact paths; the prior operational versions are archived in `operational-before.json`.

Stop disposition: no retry, warm sample, extra Shopify trace, optimization implementation, policy relaxation, or full campaign. The next authorized tooling phase must establish why these admitted native requests fail and how authoritative complete-transfer evidence can be obtained under the existing contract. No bytes may be coerced to zero and no native request may be excluded to force a valid result.
