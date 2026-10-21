# Epic F Shopify Nonpersistent Machine Shell Preview Validation

**Result: BLOCKED_PREVIEW_CREATION_HTTP_400.** The installed CLI supports the requested virtual preview mechanism, but Shopify rejected both bounded preview requests. No preview ID or URL was returned. No Product route or browser cell was tested; Shopify shell integration remains unverified. This is not a new PBI, F-PBI-017B or F-PBI-018B.

The [machine-readable evidence](../qa/evidence/epic-f/nonpersistent-shell-preview-validation.json) records exact read intervals, queries, file identities/checksums, before/after Product records, source hashes and all 32 unexecuted responsive cells. The [captured CLI help](../qa/evidence/epic-f/nonpersistent-shell-preview-cli-help.txt) contains no authentication values.

## CLI and nonpersistent capability gate

Initial `shopify version` returned **4.7.1**, exit 0. `shopify theme preview --help` unexpectedly triggered the CLI's enabled automatic local upgrade to **4.8.3**, then printed help and exited 0. No explicit install/upgrade command was separately invoked. This changed the local CLI installation, not Shopify or repository theme code. Subsequent commands used process-local `CI=1`, which suppresses automatic upgrades.

Effective version check returned **4.8.3**, exit 0. Its help confirms `theme preview`, required `--overrides`, explicit `-t/--theme`, `--store`, `--json` and optional preview-ID reuse. Help alone does not explain persistence or the override schema. The installed preview command implementation, SHA256-bound in the evidence, parses the JSON and sends it to `/theme_preview.json?preview_theme_id=<id>`; it does not invoke a theme-file writer or push command.

The corresponding [Shopify override documentation](https://shopify.dev/docs/storefronts/themes/tools/cli/theme-preview-overrides) specifies virtual, in-memory overrides without permanent Shopify file changes, including full replacement using `theme_changes[path].source` and virtual creation of absent paths. This documented operation matches the installed implementation. The [command reference](https://shopify.dev/docs/api/shopify-cli/theme/theme-preview) confirms explicit theme selection and preview output. No unsupported syntax or persistent deployment substitute was used.

**Capability: supported. Nonpersistence: documented; failed attempts empirically left persistent state unchanged. A successful preview's nonpersistence was not empirically established because no preview was created.**

## Exact target and fresh persistent before state

- Shop: `gid://shopify/Shop/79279947973`, Rhino Lapidary, canonical `sz5dnk-nf.myshopify.com`; primary storefront `https://rhino-lapidary.myshopify.com`.
- Preview: **158631198917 / gid://shopify/OnlineStoreTheme/158631198917**, **Rhino Lapidary - Preview**, **UNPUBLISHED**, updated `2026-08-27T18:04:28Z`. Fresh identity gate passed.
- Excluded production theme: **158579622085**, `shopify-rhinolapidary/main`, MAIN; different ID, no preview request targeted it.
- Complete persistent file inventory before preview completed **2026-09-30T19:51:06.772Z**: 409 files, no further page. Exact query/interval and full file metadata are retained in evidence.
- `templates/product.machine.json`: absent.
- `sections/main-product.liquid`: MD5 `bef0e52b2c50ba04ba27f232c7209b68`, 103925 bytes.
- `layout/theme.liquid`: MD5 `057631df790907cc64d7cdcc06c6f7d5`, 23653 bytes.

These are actual fresh observations, not relabeled September snapshots or an assignment execution before-read. The connector's API version and theme resource version were not exposed; neither is fabricated. The theme's updatedAt is available and recorded.

## Local boundary and remote native base

The unchanged [handoff](epic-f-shell-only-release-handoff.md) and [preparation index](../../data/epic-f-shell-only-release-preparation.json) supplied the exact 28-file boundary. Every local SHA256 matched before creation; the existing handoff validator passed. No expected hash was rebound and no file was added to the override scope.

Read-only native verification covered the existing 127-file inventory plus settings verification paths, **129 unique remote files** in three filename batches of at most 50. All were present; each connection ended with hasNextPage=false. There were **123 matching text bodies after line-ending normalization**. The only differing text bodies were target-owned `config/settings_data.json`, `sections/header-group.json` and `sections/footer-group.json`; they were inspected for compatibility and preserved. Binary inventory members were verified through remote identity/content-type/checksum metadata.

Required native Product-form/info/price/Variant/quantity/buy/pickup, global/pubsub/constants, cart/search and header/footer dependencies were present and compatible with the local shell. Settings schema matched after line-ending normalization. Target cart mode is notification, predictive search enabled, scheme-1 and scheme-4 exist, body scale 100, and the target header/footer groups resolve to their existing native sections and preview menus. Settings and group files were **verification only**, not overrides or uploads.

The temporary artifact is `test-results/epic-f/nonpersistent-preview/overrides.json`, generated **2026-09-30T19:51:05.806Z**, SHA256 `f12c00fa6c91e5730aa1e6277ce162479b4ecd963419a2ceffea2583a9dc2a2c`. It contains only documented metadata version 0.1.0 and 28 `theme_changes` full-source operations. Its companion manifest records each path/SHA256 and target identity; the durable evidence includes that manifest. Source commit is `c803d44697de39c0b12b939ec9b03580d867cb03`; individual hashes also bind existing uncommitted repository sources. No Product/Admin operation is included.

## Preview requests and stop condition

First attempt started **2026-09-30T19:51:43.983Z**:

```text
shopify theme preview --store=sz5dnk-nf.myshopify.com --theme=158631198917 --overrides=test-results/epic-f/nonpersistent-preview/overrides.json --json
```

Exit **1**: `Theme preview request failed with status 400: Bad Request`. No preview identifier or URL. An immediate complete persistent inventory read verified unchanged state.

One diagnostic retry used the identical command/payload with `--verbose`. It also exited **1**, HTTP **400**, with no preview identifier or URL. The rejection response was logged at **2026-09-30T19:53:38.398Z**, request ID `d7be7f21-973f-4ded-a2e8-4e14c5a0d9ca-1790798017`. The installed implementation exposes status/statusText but not the failed response's validation reason. The cause is **unresolved**; payload size, permissions or backend support are not asserted as explanations.

Raw diagnostic/auth-related output stays under ignored test-results and is not copied into durable evidence. No preview token or authentication secret is committed. No further preview attempts, payload expansion, assignment experiment, remote repair or persistent fallback occurred.

## Exact Product scope and responsive results

Fresh all-11 Product before-read completed **2026-09-30T19:46:39.836Z**; final after-read completed **19:55:26.838Z**. Every selected Product below was ACTIVE, suffix null, with zero rhino metafields before and after. Publication records and all other queried fields were identical. Admin state does not establish native storefront purchase availability.

| Product | Exact Product GID | Planned alternate route | 320 | 390 | 768 | 1440 |
|---|---|---|---|---|---|---|
| BeadMaster 6" | gid://shopify/Product/8905779937477 | /products/beadmaster?view=machine | Not run | Not run | Not run | Not run |
| EM-1 Machine | gid://shopify/Product/8905780756677 | /products/em-1?view=machine | Not run | Not run | Not run | Not run |
| LapMaster 12" | gid://shopify/Product/8905781412037 | /products/lapmaster-12?view=machine | Not run | Not run | Not run | Not run |
| LapMaster 18" | gid://shopify/Product/8905781477573 | /products/lapmaster-18?view=machine | Not run | Not run | Not run | Not run |
| SawMaster 18" | gid://shopify/Product/8905784131781 | /products/sawmaster-18?view=machine | Not run | Not run | Not run | Not run |
| SawMaster 24" | gid://shopify/Product/8905784197317 | /products/sawmaster-24?view=machine | Not run | Not run | Not run | Not run |
| ShapeMaster 6" | gid://shopify/Product/8905784328389 | /products/shapemaster?view=machine | Not run | Not run | Not run | Not run |
| TrimMaster | gid://shopify/Product/8905785344197 | /products/trimmaster?view=machine | Not run | Not run | Not run | Not run |

**0 of 32 cells executed.** These are planned route selectors, not tested URLs. No returned preview context exists to merge into them; no ordinary production route was tested as a substitute. HTTP 200, machine-template rendering, shell DOM identity and alternate selector behavior were not observed.

Exclusions preserved: JadeMaster `gid://shopify/Product/8905781248197` (ACTIVE, null suffix, publishedAt null); SawMaster 36 `gid://shopify/Product/8905784262853` and TumbleMaster `gid://shopify/Product/8905785868485` (DRAFT, null suffix, publishedAt null). All have zero rhino metafields and unchanged queried publication state. They were read for safety verification only, with no rendering eligibility claim.

## Browser and factual evidence: not collected

| Requested evidence | Actual result |
|---|---|
| Machine template / native title, Variant, price, quantity, buy/sold-out | Not tested; no preview exists |
| Native pickup / neutral Contact | Not tested; no cart/contact actions performed |
| Zero media/specs/contents/context/delivery/warranty/resources; no empty wrappers/fallbacks | Not verified on Shopify; repository zero-grant evidence remains unchanged |
| payment_terms / provider requests, focus, Variant update, wrapping/zoom | Not observed; F-DEC-001 remains open; retain-native code unchanged |
| JSON-LD graph types/properties / metadata containment | Not observed; null evidence, not a passing containment result |
| Header/footer/breadcrumb/cart/search/policy/app integration | Native files verified only; actual rendering/interactions not tested |
| 200% root-font text enlargement | Not run |
| Actual Chromium 200% browser zoom / layout / DPR | Not run; not substituted with text enlargement or page-scale emulation |
| Keyboard order / visible focus / native control behavior | Not run |
| Axe serious / critical / lesser findings | Not run; counts are null, **not zero** |
| Console errors / page errors / failed storefront requests | No browser capture; unknown, **not zero** |
| Initial/provider/preview-tool/Rhino/Trade network inventory | No browser capture; CLI request rejection is separate from storefront network evidence |
| Eager media/video/downloads, F instrumentation, duplicate initialization, Liquid errors | Not assessed in rendered Shopify output |
| Performance | Not collected; no diagnostics, release medians or certification |

Repository governed grant counts remain zero separately for media, specifications, contents, contextual/compatibility, delivery/timing, warranty/service, manuals, diagrams/instructions, videos and customer support_files. This is not actual preview suppression proof. No grant, fallback copy, suppression implementation or payment configuration was changed.

## After-state proof and cleanup

Final complete persistent theme inventory completed **2026-09-30T19:55:26.213Z**. All **409 file identities/checksums/sizes/update timestamps** match before, as does theme identity/role/update time. Machine template remains absent; the main-product and layout MD5 values above remain unchanged. The comparison also matched the immediate after-first-attempt inventory. No preview-session timestamp/version was returned to confuse with persistent file state.

Final all-11 Product read matches the before-read for exact identity/title/handle, status, suffix, updatedAt, publishedAt, onlineStoreUrl, all queried publication records and rhino metafield values/digests. Both publication and metafield connections were complete, with no remaining pages. This proves unchanged queried state over the attempt interval; it does not claim a broader full Admin reconciliation.

No session was returned, so no session expiry/removal action exists. No theme or file was deleted. Complete equality checks and source validation passed; preview execution itself failed and remains explicitly blocked.

## Status consequences and remaining work

Repository shell remains unchanged/complete. **014B stays open/partial, with no new Shopify browser evidence from this run.** All planned alternate-template shell checks, enlargement/actual zoom, keyboard/axe/global/provider integration remain outstanding; actual assignment-state and final release journeys remain separate even after a future successful virtual preview. Approved-live-media parity remains outside zero-grant scope.

015B remains deferred; the virtual environment would permit only NONPERSISTENT_PREVIEW_DIAGNOSTIC observations, not certification. 017B remains blocked/not authorized pending a supported production-safe assignment sequence; alternate rendering cannot prove assignment safety. 018B was not begun. E-MUT-020's full 38-definition input and E-MUT-021's full 122-Product classification completion contract remain unchanged and unexecuted. No PBI state or tracker was changed, and Epic F live release remains incomplete.

Files added: this report, the validation JSON and captured CLI help. Ephemeral payload, manifest, read responses and diagnostic helpers/logs remain under ignored test-results. Local validation includes existing handoff validation, persistent-state equality, evidence/source/secret guards and git whitespace checks; exact commands/exits are recorded in evidence.

**Persistent Shopify mutation: No. E-MUT-020/021 execution: No. Product template assignment: No. Theme push: No. Production publication: No. Analytics/pixel configuration: No. Add-to-cart, Contact submission, checkout, order: No.**
