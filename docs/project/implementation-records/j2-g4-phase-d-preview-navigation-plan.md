# J2/G4 Phase D preview navigation plan

Date: 2026-11-18
Status: validated read-only plan; Shopify mutation not authorized.

## Current predecessor and assignment

Read-only Admin GraphQL returned preview menu `gid://shopify/Menu/257402405061`, handle `preview-primary-navigation-menu`. Its exact tree is Home; Catalog (`COLLECTIONS`, `/collections`) with Saws, Laps, and Shaping; Manuals; Contact. Item IDs, resource IDs, types, URLs, tags, and order are preserved in `data/j2-g4-preview-menu-transition.json`.

Preview theme `gid://shopify/OnlineStoreTheme/158631198917` remains `UNPUBLISHED`. Its current `sections/header-group.json` has MD5 `73a12cee8736b2f3935d0d777800176a` and assigns `preview-primary-navigation-menu` with desktop type `mega`. Production theme `158579622085` remains `MAIN`; production menu `gid://shopify/Menu/254120886469` (`main-menu`) is excluded.

## Authority reconciliation

Authenticated live preview reads found all three directory fragments, but the directory was `data-governed="false"`, exposed no `section[data-role]` category groups, and rendered the same neutral 79-Product list.

- Replacement Parts targets the neutral heading “Browse Products”.
- Consumables targets “Product groups are being verified…”.
- Accessories targets “Use the Product page for current options and availability.”

Those anchors are safe fail-closed content, but they do not fulfill the category promises in the proposed menu labels. Replacement Parts, Consumables, and Accessories therefore remain `PLANNED_NOT_APPROVED_FOR_APPLY`. No role, membership, or compatibility authority is renewed.

## Alternatives and recommendation

Alternative A preserves Saws, Flat Laps, and Shaping beneath Machines. Alternative B removes those three existing customer destinations and uses the original flat G4 hierarchy. Neither alternative is eligible exactly as originally written because both include the three unsupported role-category labels. Alternative A also makes Machines a disclosure-only parent in Trade's mobile drawer, so `/collections/machines` is not directly reachable from that item.

The recommendation follows Alternative A's preservation principle with an accessible, governed flat subset:

```text
Catalog
  All Products
  Machines
  Saws
  Laps
  Shaping
```

Home, Manuals, and Contact remain unchanged. Live authenticated reads returned HTTP 200, the exact preview theme ID, and photographic cards for All Products, Machines, Saws, Flat Laps, and Shaping. The flat subset keeps every approved collection directly reachable in both the Trade mega-menu and mobile drawer without a runtime theme change. Separate post-Apply keyboard and touch verification remains mandatory.

## Duplicate suppression

The deployed header snippets inject All Products only when Catalog lacks an exact `/collections/all` child. Fixtures cover the current menu, an explicit All Products item, nested Machines collections, duplicate exact URLs, and query/fragment directory URLs. The transition validator rejects duplicate exact destinations before Apply; directory URLs remain distinct and do not suppress All Products. No runtime theme change is needed for the governed proposed tree.

## Transaction boundary

The transition artifact, schema, validator, negative tests, and `scripts/manage-j2-g4-preview-navigation.ps1` prepare Plan, Apply, Verify, and Rollback. The artifact permanently records `mutationAuthorized=false`. Apply and Rollback require distinct exact authorization values, fresh external evidence, a clean synchronized repository, target-menu identity, preview assignment, role checks, and production exclusion. The supported Admin GraphQL `menuUpdate` mutation for API `2026-07` is used only by future authorized modes.

The captured predecessor identity digest is `d1e45e55133062ca8012a1af50b2e99ff5e680be783815d09d1c92433e1dd846`; the accessible proposed-tree semantic digest is `fac77a7d367cb372738516cb6917f696dcdeadc61cd9aaa04f6a4d539cc06f15`; and the complete transition digest is `5e4c296c9e62bf75ead635032cf33e559ade8c0c11c9020a3b5392e57e869ae0`.

Plan is the only currently authorized mode:

```powershell
& .\scripts\manage-j2-g4-preview-navigation.ps1 -Mode Plan -LiveEvidencePath '<fresh-external-predecessor-evidence.json>'
```

A future Apply requires the Product Owner to authorize this exact binding and command; it is not authorized by this record:

```powershell
& .\scripts\manage-j2-g4-preview-navigation.ps1 -Mode Apply -LiveEvidencePath '<fresh-external-predecessor-evidence.json>' -AuthorizationValue 'J2G4-PHASE-D-PREVIEW-MENU-APPLY-5e4c296c9e62bf75ead635032cf33e559ade8c0c11c9020a3b5392e57e869ae0' -ConfirmMenuMutation
```

Rollback is independently bound to the exact captured predecessor and likewise remains unauthorized:

```powershell
& .\scripts\manage-j2-g4-preview-navigation.ps1 -Mode Rollback -LiveEvidencePath '<fresh-external-proposed-evidence.json>' -RollbackAuthorizationValue 'J2G4-PHASE-D-PREVIEW-MENU-ROLLBACK-a346150610b3ddfd7e032f253449837eec1b8e8530b34cb1b1a0ebe18d80da33' -ConfirmMenuMutation
```

This Phase D run performs Plan only. It does not edit Shopify navigation or any theme, Product, collection, publication, customer, checkout, order, or production resource.
