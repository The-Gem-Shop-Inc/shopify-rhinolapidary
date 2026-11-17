# J2/G4 postdeployment JSON integrity investigation

## Status and historical boundary

The 2026-11-16 Phase B result remains `FAILED_EXACT_READBACK`. Its external `phase-b-failure.json` has SHA-256 `650277a6fde20d5b52809458d8c53f2b3533d6496b1350ebf632d42249978153`. The proposed successor result is separate: `PASS_SUCCESSOR_SEMANTIC_READBACK`. It is not an approved production policy and does not amend, replace, or reclassify Phase B.

The current preview is theme `158631198917`, `Rhino Lapidary - Preview`, role `UNPUBLISHED`. Production is theme `158579622085`, `shopify-rhinolapidary/main`, role `MAIN`. The Admin GraphQL read and Shopify CLI theme list agree. Production `updatedAt` remains `2026-11-06T00:22:36Z`; preview `updatedAt` is the deployment time, `2026-11-16T22:39:41Z`. English is the only published locale.

## Exact JSON discrepancy

Admin GraphQL `OnlineStoreThemeFileBodyText.content` and Shopify CLI 4.9.4 `theme pull` are byte-identical for all three files. Retrieval transport therefore does not cause the mismatch.

| Path | Candidate bytes / SHA-256 | Remote bytes / SHA-256 | Exact cause |
| --- | --- | --- | --- |
| `locales/en.default.json` | 29,651 / `4ae6abd1bddabb80aa33866759b939b9c4b4860ab98e42ef345f2d49ac0379aa` | 30,017 / `22e726241cf587a43540feeccd0548f4895ff56c4a23b15406ce19bc9bf86a48` | Shopify prepended its 366-byte language-editor generated-file comment. |
| `templates/collection.directory.json` | 539 / `400aadbbf12a0d32072a764f400175602cf441cded428122dcb84457d27ea6e5` | 902 / `5ef5784253d8b08de0c7efbe1efeb6aaf22804272f47a0867f4f63d8f8ddc8b3` | Shopify prepended its 363-byte theme-editor generated-file comment. |
| `templates/collection.json` | 997 / `d94ded71fe171c5a131a1ef45c1861067d4864673c6da3cf08738ea10450e653` | 1,360 / `aa657cc002fc992af5c5dd4067837d1a39955292b85edc7af165a8ecaff4ef95` | Shopify prepended its 363-byte theme-editor generated-file comment. |

For every file the complete candidate byte sequence is the complete remote suffix. Common-prefix length is zero because the remote starts with `/`; common-suffix length equals the full candidate length. The generated headers use LF. Shopify preserved all candidate bytes after the header, including LF in the locale and `collection.json`, and CRLF in `collection.directory.json`. There is no indentation, object-order, Unicode-escape, line-ending, value, or API-versus-CLI difference in the candidate body.

The semantic digests are:

- locale: `3f23e4688e56b2b1e4b8d963fca0718bbc4b47b92d1193bda87dd9822ab4b3b6`
- directory template: `aa2c654f5de707f71dd3fb4821263dac5dd6ce77c59d049701f90827956b6233`
- collection template: `403094bd99c2db2133fc88d3114f1ebd93101a8775861a82e4a3c516049c06df`

## Successor integrity contract

`scripts/validate-j2-g4-theme-readback.js` remains unchanged and continues to require exact SHA-256 equality for every runtime file and dependency. `scripts/validate-j2-g4-theme-readback-successor.js` is separately identifiable and applies this proposed policy:

1. Rehash the exact manifest and all committed candidate bytes. Recompute and bind candidate digest `c59f3d8ea6a9c4d62cf477e698ef341845066715b2a1007069c5402d745500ec`.
2. Require exact SHA-256 for every JavaScript, Liquid, CSS, dependency, and every runtime file other than the three named JSON paths.
3. For each named JSON path, accept exact SHA-256 or perform strict semantic verification while retaining source SHA-256, remote SHA-256, sizes, and semantic digest.
4. Decode UTF-8 in fatal mode. Permit no comments except the exact known Shopify language-editor or theme-editor leading block header. Reject trailing content.
5. Parse with a recursive-descent JSON parser that rejects duplicate decoded object keys at every depth.
6. Canonicalize with explicit type tags. Sort object members by decoded key using deterministic JavaScript ordinal string ordering. Preserve array order. Preserve exact strings, booleans, and null. Normalize JSON numbers as arbitrary-length decimal coefficient plus base-10 exponent, so equivalent spellings compare equally without IEEE-754 rounding.
7. SHA-256 the UTF-8 canonical representation. Equality requires the complete canonical structures and digests to match.
8. Apply path-specific locale and collection contracts, validate live identities and roles, verify the historical failure record, and compare the complete current inventory to the pre-upload inventory.

This is an internal deterministic format, not RFC 8785. Its object-key order is JavaScript ordinal UTF-16 order, not Unicode code-point order. It intentionally treats numerically equal JSON spellings such as `1`, `1.0`, and `1e0` as the same number. It rejects exponents outside JavaScript safe-integer range for deterministic resource bounds. It does not interpret arbitrary JSONC, comments, schema defaults, Liquid behavior, or Shopify routing. Semantic equality proves JSON data equality only; live routing and browser behavior remain separate acceptance gates.

## Verified content and inventory

The successor result is 14 exact runtime matches plus three authorized semantic JSON matches. All five unchanged dependencies match exact SHA-256. The pre-upload inventory has 456 files; the current preview has 463. Exactly seven authorized additions exist. All 446 unrelated assets match their pre-upload SHA-256, with zero missing and zero unexpected paths. The current 463-file CLI pull also matches the retained Phase B `post-upload-theme` bodies.

The locale has 533 leaves. All 526 pre-upload preview leaves are present with exact values. The only additions are the seven nonempty `sections.cart_feedback.*` toast leaves. The quotation explanation equals the approved text exactly. The store still publishes English only.

`templates/collection.json` contains `banner`, `catalog-navigation`, then `product-grid`; every banner and product-grid setting matches the candidate. `templates/collection.directory.json` contains `banner`, `catalog-navigation`, then `product-directory`, with no additional configuration. This proves stored configuration, not live route selection.

## Read-only deployment reconciliation

`scripts/deploy-j2-g4-preview.ps1` now has `VerifyExistingDeployment`, independent of `Plan` and `Apply`. It rejects an Apply authorization value and the Apply Theme Check switch, accepts fresh external read-only Admin GraphQL evidence, uses only `theme list` and `theme pull`, and runs the successor validator. It contains no push, publish, delete, menu, collection, rollback, or production mutation in this mode. Plan and Apply behavior, the original exact validator, rollback archive, and historical failure record remain intact.

## Live acceptance continuation (prepared, not executed)

Live browser acceptance must not start until the Product Owner approves using the proposed successor contract for this existing unpublished preview. No new theme push is needed or permitted merely to remove Shopify's generated comments.

Create a new evidence directory; do not reuse a Phase B or historical Epic G/J directory:

```powershell
$stamp = [DateTimeOffset]::UtcNow.ToString('yyyy-MM-ddTHH-mm-ss.fffffffZ')
$integrityEvidence = Join-Path $env:LOCALAPPDATA "RhinoLapidary\evidence\j2-g4-live-acceptance\$stamp"
$cartEvidence = "C:\rlcc\docs\qa\evidence\epic-j\j2-g4-live-$stamp"
New-Item -ItemType Directory -Path $integrityEvidence,$cartEvidence | Out-Null
```

First repeat the fresh Admin GraphQL identity/body read and CLI pull, then run:

```powershell
& .\scripts\deploy-j2-g4-preview.ps1 `
  -Mode VerifyExistingDeployment `
  -LiveEvidencePath "$integrityEvidence\api-read.json" `
  -ExistingReadbackRoot "$integrityEvidence\cli-preview-theme" |
  Tee-Object "$integrityEvidence\verify-existing-deployment.txt"
```

After successor-policy approval, the existing actual-preview cart continuation is:

```powershell
$env:RHINO_J_LIVE = '1'
$env:RHINO_J_EVIDENCE_DIR = $cartEvidence
npx playwright test tests/epic-j-cart.spec.js `
  --grep "actual preview isolated native cart" `
  --project=desktop-chromium --workers=1 `
  --reporter=json | Set-Content "$cartEvidence\playwright-cart.json" -Encoding utf8NoBOM
```

The catalog/directory continuation must use a new live J2/G4 runner or a reviewed manual Playwright session against theme `158631198917`; the old G3B live catalog runner expects the superseded governed-directory default and must not be misrepresented as J2/G4 acceptance. Evidence belongs under `$integrityEvidence\browser` and must cover 320, 390, 768, 1024, and 1440 px; `/collections/all`; sorting/filtering/pagination; `?view=directory` and its three anchors; `/collections/machines`; bulk quick-add and concurrent updates; badge/drawer/page/toasts; keyboard, reduced motion, 200% zoom, axe serious/critical; and expired authority remaining fail-closed. Each navigation must assert `Shopify.theme.id === '158631198917'`. Cart tests must begin with an isolated empty cart, block checkout/account/order/admin navigation, and clean up only their own cart lines.
