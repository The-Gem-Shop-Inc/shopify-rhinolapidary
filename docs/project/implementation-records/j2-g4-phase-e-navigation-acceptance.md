# J2/G4 Phase E preview navigation acceptance

Date: 2026-11-18
Status: preview navigation runtime PASS; corrected proposed-state verification PASS; production publication not authorized.

## Transition and Shopify result

Phase E applied the previously approved Phase D transition `J2-G4-PHASE-D-PREVIEW-NAVIGATION-RC1` to preview menu `gid://shopify/Menu/257402405061` (`preview-primary-navigation-menu`) only. The predecessor identity digest was `d1e45e55133062ca8012a1af50b2e99ff5e680be783815d09d1c92433e1dd846`, proposed semantic digest was `fac77a7d367cb372738516cb6917f696dcdeadc61cd9aaa04f6a4d539cc06f15`, and transition digest was `5e4c296c9e62bf75ead635032cf33e559ade8c0c11c9020a3b5392e57e869ae0`.

The single authorized `menuUpdate` returned no `userErrors`. It preserved Home, Catalog, Saws, Laps, Shaping, Manuals, and Contact item identities and created only:

- All Products: `gid://shopify/MenuItem/677696798917`
- Machines: `gid://shopify/MenuItem/677696831685`

Catalog now has the exact direct children All Products, Machines, Saws, Laps, and Shaping. Replacement Parts, Consumables, and Accessories remain excluded because live directory reads remain fail-closed and do not provide governed categorized content. Production menu `gid://shopify/Menu/254120886469` (`main-menu`) was unchanged.

## Live acceptance

Authenticated testing used actual unpublished preview theme `158631198917`.

- Desktop at 1024 and 1440 pixels: PASS for disclosure, close/reopen, Tab and Shift+Tab, focus visibility, exact five links, route navigation, duplicate suppression, and overflow.
- Mobile/tablet at 320, 390, and 768 pixels: PASS for touch and keyboard disclosure, Catalog Back behavior, close/reopen, focus restoration, exact five links, route navigation, duplicate suppression, and overflow.
- `/collections/all`, `/collections/machines`, `/collections/saws`, `/collections/flat-laps`, and `/collections/shaping`: HTTP 200, exact preview theme identity, and photographic Product presentation.
- Automated storefront accessibility: zero serious or critical findings on all five tested surfaces. Separate findings inside Shopify's preview-bar iframe are not storefront markup and remain recorded in the raw evidence.

The immutable Phase E evidence root is `C:\Users\dajem\AppData\Local\RhinoLapidary\evidence\j2-g4-phase-e-navigation\2026-11-18T22-22-05.4432170Z`. Verified records include:

| Record | SHA-256 |
| --- | --- |
| `predecessor-evidence.json` | `186e379409d06198a46cb739ad1b24e164c9bb4c1a194eb8059512addff6c9e2` |
| `menu-update-response.json` | `44e071430203ad759d03fbba46b7d22a44dc700e910a61e39e82ee545b9d4176` |
| `postmutation-evidence.json` | `dde677a6e0460b814253424107726329e71967496764df542bd0e00680a2b2a3` |
| `live-navigation-results.json` | `70d084dfd1b72e27d5b14092272b7db11e591b87c721f427854cdbcdbb5dbf23` |
| `postmutation-verification-result.json` | `6187d55b2b2c18c802727e9acb12baf04a4852ed00df08c5e91cf19e21d12358` |

## Validator correction and follow-up verification

The original Phase E committed Verify run remains a historical failure. Its proposed-state path incorrectly required `injected=true`, which is the predecessor contract. Phase E1 makes the assertion state-aware: predecessor evidence requires one theme-injected All Products link on desktop and mobile; proposed evidence requires one explicit Shopify link and no theme injection on both surfaces. No Liquid or theme runtime file changed.

The transition suite passes 25/25, including ten direct `validateLiveEvidence` cases for both valid states, reversed injection flags, zero/two exact links, an invalid state, and proposed semantic drift. Fresh read-only Admin, CLI theme-file, desktop, mobile, route, and authority evidence is under `C:\Users\dajem\AppData\Local\RhinoLapidary\evidence\j2-g4-phase-e1-navigation\2026-11-18T23-20-22.1510558Z`:

| Record | SHA-256 |
| --- | --- |
| `browser-observations.json` | `79d5056bf6c411e1e8cabe927e74509d6020088d57f0c36dfb5e9d0c61f5061a` |
| `proposed-state-evidence.json` | `62b4cffec9faa63f1a3d99fb21b1dfd487b188841bf861b6d6f9d3393e952b70` |
| `theme-assignment-pull/sections/header-group.json` | `5ca22429542ebdf61222c13b57b100512890b0dfb87f2ab2f5439be3fbd08b16` |

The corrected committed `manage-j2-g4-preview-navigation.ps1 -Mode Verify` path returns `VERIFY PASS` against the honest proposed-state evidence. The semantic digest remains `fac77a7d367cb372738516cb6917f696dcdeadc61cd9aaa04f6a4d539cc06f15`; desktop and mobile each report exactly one All Products link with `injected=false`.

## Release boundary

Phase C preview runtime and Phase E preview navigation runtime are accepted only on the unpublished preview. This record does not renew Product classification or compatibility authority, approve production publication, suppress the 2,100 Theme Check `MatchingTranslations` findings, or satisfy unrelated production readiness gates. Phase E1 performed read-only Shopify verification only: zero menu, theme, Product, collection, customer, checkout, order, rollback, publication, or production mutations.
