# Rhino Lapidary Shopify theme preview HTTP 400 diagnostic

**Cause isolated: the preview endpoint rejects `assets/rhino-custom.css` as outside an allowed directory.** The exact server response is:

```json
{"error":"File path 'assets/rhino-custom.css' is not in an allowed directory"}
```

The unused snippet, identical existing snippet, machine template alone, and template plus main-product section all succeed. The remaining **27 original entries succeed together**. The CSS entry fails alone, even when replaced by a valid 25-byte CSS comment. This is a **preview-overrides-specific server directory restriction**, not evidence of invalid Rhino CSS, a general account/service failure, or a payload-size limit. The complete allowed-directory set was not discovered, and no other asset path was tested.

This task is diagnosis only. No new PBI, source fix, persistent deployment, Product assignment, migration or browser/release validation occurred. See [complete sanitized evidence](../qa/evidence/epic-f/theme-preview-400-diagnostic.json) and the [exact tested minimal reproduction](../qa/evidence/epic-f/theme-preview-assets-minimal-repro.json).

## Environment and original payload inspection

- Shopify CLI **4.8.3**, confirmed locally; Node **v24.13.0**; Windows **10.0.26200** (`Microsoft Windows 10.0.26200`). No further upgrade/install or reauthentication was run. Subsequent CLI processes use `CI=1` to suppress auto-upgrades.
- Store explicitly selected: **sz5dnk-nf.myshopify.com**, shop `gid://shopify/Shop/79279947973`, Rhino Lapidary; primary storefront rhino-lapidary.myshopify.com.
- Only target: **158631198917**, `gid://shopify/OnlineStoreTheme/158631198917`, **Rhino Lapidary - Preview**, **UNPUBLISHED**. Production **158579622085** excluded.
- Existing CLI authentication reached the selected theme without a new login or scope request. Human account identity, session cookies and credentials were not collected.
- Original file preserved unchanged: `test-results/epic-f/nonpersistent-preview/overrides.json`.
- SHA256: **f12c00fa6c91e5730aa1e6277ce162479b4ecd963419a2ceffea2583a9dc2a2c**.
- Raw file **482,453 bytes**; CLI's compact serialized request **481,899 bytes**; source content **443,147 bytes**.
- Valid UTF-8, **no BOM**, valid JSON; top-level keys exactly `metadata`, `theme_changes`; metadata exactly `{"version":"0.1.0"}`.
- Exactly **28 entries**, each with only `source` and nonempty string content. A recursive token scanner detected **no duplicate object keys**. No null/empty operations, unsupported properties, local/absolute paths, `./` or `theme/` prefixes, or backslashes occurred. All keys are relative Shopify theme paths with forward slashes.
- Largest individual source: `sections/main-product.liquid`, **107,147 bytes**. The evidence lists every path, operation, size, content hash and path check. Original payload hash matches the prior failure manifest; it was not normalized or rebound.

The original envelope matches Shopify's [documented overrides shape](https://shopify.dev/docs/storefronts/themes/tools/cli/theme-preview-overrides). That documentation describes virtual in-memory changes, optional metadata, full-source replacement, merge and diff operations. The observed server restriction is narrower than accepting every syntactically valid theme path; no new property or arbitrary metadata version was introduced.

## Installed CLI behavior and hidden error detail

Installed package root:

```text
C:/Users/dajem/AppData/Local/JetBrains/WebStorm2026.2/acp-agents/.runtimes/node/24.13.0/node_modules/@shopify/cli
```

The evidence hashes these unchanged local implementation files:

| File under package root | Relevant behavior |
|---|---|
| dist/cli/commands/theme/preview.js | Command entry module |
| dist/chunk-NS7QRCJF.js | Preview parser, serializer, request and error handling |
| dist/chunk-5VBEPL4S.js | Theme lookup/selection |
| dist/chunk-N34YKDEK.js | Numeric/name matching and general theme-role filter |

`theme preview` verifies that the overrides file exists, reads it and runs `JSON.parse`. It performs no client-side operation/path/template/locale-schema validation or metadata-version check. It serializes the parsed object with `JSON.stringify`, without introducing fields or rewriting source strings.

It resolves the theme ID/name first, converts the actual ID to a string and posts JSON to **`/theme_preview.json?preview_theme_id=158631198917`**. The general theme list admits live/unpublished/development roles; this command has no separate unpublished-only gate. Our wrapper independently checked the precise UNPUBLISHED target before any request. Exact name selection also resolved to **158631198917**, proved by the observed request path. No alternate theme was used.

For non-OK responses, the implementation throws status/statusText **before reading the body**. Thus `--json` does not expose failed-response JSON and `--verbose` exposes request/response metadata and request IDs, but **not the server error body**. Successful responses are parsed for error/url/preview_identifier. No explicit payload-size maximum or metadata version expectation appears in the preview implementation. Update requests encode preview_identifier; no updates were attempted.

A temporary external Node response observer attached only to this endpoint's response. It did not modify installed packages, issue additional requests, inspect/save authentication headers or change serialization. The response body was gzip-compressed; after decompression the observer retained only sanitized error fields. The recovered body was **79 bytes**, carried in a **100-byte gzip response**. It supplied the path error above, with no separate error code. Request identifiers below are public diagnostic IDs, not session credentials.

## Diagnostic attempt matrix

All requests used explicit store/target and `--json`. `--verbose` was used only for the already-failing full payload and the failing same-theme-name check. Every set's command, UTC interval, sorted paths, SHA256, raw/serialized bytes, source bytes, largest entry, response and request ID is in the evidence.

| Set | Contents | Files | Raw JSON bytes | Exit / HTTP | Preview request ID |
|---|---|---:|---:|---|---|
| Probe A | Unused virtual Liquid comment snippet | 1 | 191 | 0 / 200 | ca477c62-1473-414b-9275-b5809b9b6941-1790804605 |
| Probe B | Current remote loading-spinner snippet, identical source | 1 | 483 | 0 / 200 | e12fffe7-3456-4914-8963-0b796a974af6-1790804711 |
| Probe C | Exact product.machine.json source | 1 | 1,977 | 0 / 200 | 9e69addd-2934-45b3-898a-c92f449317ae-1790804718 |
| Probe D | Template + exact main-product section | 2 | 117,653 | 0 / 200 | 9b3d0cfa-2fe0-417a-b0b2-a33fbaf52733-1790804762 |
| Full observed | Original 28-file artifact, exact original hash | 28 | 482,453 | 1 / 400 | 50f05cfd-e18f-4d5c-b60b-9ee197b47abf-1790804767 |
| Split 01 | Known-pass D + first sorted 13 additions | 15 | 462,451 | 1 / 400; names CSS path | 29e173b1-e962-42ea-8379-055c4190770b-1790804809 |
| Isolation 02 | Original CSS source alone | 1 | 49,660 | 1 / 400; same path error | 41fdc74a-9a03-44db-afe2-932432c7b483-1790804848 |
| Complement 03 | All original files except CSS | 27 | 432,865 | 0 / 200 | 2e13e633-d56e-41bd-93a0-29bd07f246f6-1790804852 |
| Metadata 04 | CSS singleton, metadata omitted | 1 | 49,616 | 1 / 400; same path error | 07c3e604-afad-4d4c-9ca6-07751b043dc2-1790804889 |
| Identifier 05 | CSS singleton, exact same-theme name | 1 | 49,660 | 1 / 400; same resolved ID/error | 30fdc6c5-06a6-4b81-bdd8-1417bc42c4db-1790804892 |
| Tiny CSS 06 | Same asset path, valid CSS comment only | 1 | 156 | 1 / 400; same path error | c5525da0-9d82-4bf9-9764-eb775393810e-1790804960 |

The series ran **2026-09-30T21:43:22.626Z–21:49:22.480Z**. There were **11 bounded attempts**, including the staged probes, one full reproduction, three split/isolation/complement tests, and three explanatory controls. Five creates succeeded, six failed. No 28-file manual retry fleet, preview update or cumulative-session assumption was used.

The previous full-payload verbose request ID was **d7be7f21-973f-4ded-a2e8-4e14c5a0d9ca-1790798017**. Its hidden body was not retroactively recovered; the new split/isolation controls recovered the exact error and explain the reproducible original failure.

Signed preview URLs/identifiers are not retained in durable evidence. Results retain only creation success and identifier hashes. A signed hostname briefly appeared in the first probe's transient tool output; its saved value was immediately redacted and excluded from durable evidence. No authentication token, cookie or private header was stored by this diagnostic.

## Isolated rule, size and file-type conclusions

The smallest failing **file set** is one file: `assets/rhino-custom.css`. The smallest tested failing **payload** is **156 raw / 115 serialized bytes**, with just **25 source bytes**. The smallest passing payload is Probe A, **191 raw / 150 serialized bytes**. Largest known pass is **432,865 raw / 432,330 serialized bytes**, containing all other 27 files. These observations do not establish a size ceiling: a tiny request fails while a much larger request passes. No official limit is invented.

The implicated file is CSS, valid UTF-8 without BOM, with a valid relative forward-slash path of **23 characters**. The server reports a directory rejection rather than a CSS grammar, Liquid, JSON-template, locale or section-schema error. The comment-only test demonstrates that the rejection does not require the original CSS contents. Main-product/template and both default English locale files were accepted; locale merge tests and template-source repairs were therefore unnecessary. Acceptance at preview creation is not browser rendering, accessibility or release proof.

Removing metadata once did not affect the failure. Numeric ID versus exact name resolved the same preview theme and gave the same failure. The account/service can create previews for supported paths; no reauthentication or production-theme experiment is warranted by this evidence.

Classification: **B — preview-overrides-specific limitation**, implemented as **E — an undocumented server directory validator**. The CLI has a separate observability deficiency: it discards non-OK response detail. No request-serialization defect or invalid repository source was demonstrated.

## Corrective action and faithful-shell limitation

**No repository source patch is needed to explain/fix the 400 itself.** Preserve valid CSS and the existing 28-file deployment boundary. The 27-file passing diagnostic intentionally omitted CSS; it is not a rebound shell plan or approval to validate/release that incomplete scope.

The current persistent preview CSS is **43,270 bytes**, MD5 **586746f7713bfcbb10d4724361f3a6ce**, SHA256 **780a8b4e558406ad9d80606f680617841e81d1f5436cf4e78612aebf49569b1f**. Repository CSS is **46,005 bytes**, SHA256 **32f44d332f5b1d51b95213292c54d6e5c17751ebf4e79878eba4e2c17ce5f961**; the contents differ even after line-ending normalization. Simply dropping the asset cannot prove a faithful preview of the completed shell.

The appropriate next diagnostic/corrective lane is to ask Shopify to clarify or support virtual asset paths and improve CLI failed-response reporting. A separately reviewed equivalent CSS transport in permitted virtual files could be evaluated later, with source/hash and rendering-equivalence checks; none was designed, approved or implemented here. Repeating the unchanged rejected payload is not justified. Another nonpersistent attempt is justified only when supported asset behavior changes or a concrete reviewed equivalent CSS strategy exists. No persistent fallback is proposed.

Bounded public searches of the Shopify CLI repository and Developer Community for the precise signature found no exact relevant indexed issue. This is not a claim that none exists. No issue/support message was submitted.

## Ready-to-file reproduction packet

For Shopify support / the CLI team:

1. CLI 4.8.3; Node v24.13.0; Windows 10.0.26200; existing authenticated store sz5dnk-nf.myshopify.com; target 158631198917, UNPUBLISHED. Do not use production or create a theme.
2. Use the [156-byte tested reproduction](../qa/evidence/epic-f/theme-preview-assets-minimal-repro.json), SHA256 **a4b2b15c6e4a1911acb88f9e5a1d5eabeeb89ba07128224e94d8417195719f9a**:

```json
{
  "metadata": {"version": "0.1.0"},
  "theme_changes": {
    "assets/rhino-custom.css": {"source": "/* rhino preview probe */"}
  }
}
```

The compact illustrative formatting above differs from the hashed pretty-printed fixture; use the linked fixture for exact byte reproduction.

```text
shopify theme preview --store=sz5dnk-nf.myshopify.com --theme=158631198917 --overrides=docs/qa/evidence/epic-f/theme-preview-assets-minimal-repro.json --json
```

3. Observed POST `/theme_preview.json?preview_theme_id=158631198917`: HTTP 400, JSON error naming an unallowed directory; request **c5525da0-9d82-4bf9-9764-eb775393810e-1790804960**, captured during **2026-09-30T21:49:19.990Z–21:49:22.480Z**. The equivalent unused `snippets/rhino-preview-probe.liquid` comment request passes.
4. Ask: what directory allowlist applies to virtual overrides; how can a theme asset be virtually overridden; can documentation describe the restriction; can CLI error handling expose sanitized server error detail instead of discarding the body? Provide the successful/failed control hashes and request IDs above. Include no signed URLs, sessions or headers.

The packet is prepared only; no external filing occurred.

## Persistent-state proof and local validation

Fresh before reads completed **21:42:47.185Z–21:42:47.382Z** on September 30; final reads completed **21:50:09.670Z–21:50:09.985Z**. Exact full queries, pagination and before/after records are in evidence. All connections ended without a remaining page.

- All **11** Product records match for identity, title/handle, status, null templateSuffix, updatedAt, publishedAt, onlineStoreUrl, complete queried publications and absent rhino metafields. Exclusions remain exclusions. No Product was assigned or published.
- All **409** persistent theme file records match for filename/checksum/size/update timestamp. `product.machine.json` and the unused probe snippet remain persistently absent. Main-product/layout checksums and theme identity/role/update timestamp remain unchanged. A complete after-A read also matched the before inventory.
- Successful virtual session creation is distinct from persistent mutation. Five sessions were created; their credentials were discarded, no updates or underlying theme/file deletions ran, and no expiry duration is invented.
- The original failed artifact, the 28 source hashes, installed package hashes and prior E/F/review authorities remain unchanged.

Existing handoff/source validator passes. Theme Check under the upgraded CLI needs a precise qualification: the default invocation inspected only 2 files and is not repository evidence. The explicit repository-path invocation inspected **423 files**, with **0 errors and 3 LiquidComplexity warnings**, and exited **1** at warning fail-level: main-product line 104 (129), card-product line 597 (122), facets line 865 (136), against threshold 120. These are separate static findings; they do not explain the asset-directory rejection. No threshold or source was changed to silence them. Local evidence/secret/hash checks and git whitespace checks are recorded with their actual exits.

Files added: this document; `docs/qa/evidence/epic-f/theme-preview-400-diagnostic.json`; `docs/qa/evidence/epic-f/theme-preview-assets-minimal-repro.json`. Diagnostic payloads/helpers remain under ignored test-results. No runtime/theme or installed-package modification occurred.

**014B remains partial; 015B deferred; 017B blocked; 018B not begun; E-MUT-020 and E-MUT-021 unexecuted; F-DEC-001 open.** No browser or release evidence was collected. Persistent Shopify mutation **No**; theme push/dev/share/publication **No**; development theme creation **No**; Product assignment **No**; Admin GraphQL mutation **No**; Epic E migration **No**; production publication **No**.
