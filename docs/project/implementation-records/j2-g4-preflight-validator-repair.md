# J2/G4 preflight validator repair

## Scope and immutable runtime

This repair changes repository-only validation and explanatory evidence. The deployable J2/G4 runtime remains the immutable integration snapshot `64ddfaadbcea98175940fd54d9cf198c443e39c3`. The manifest's `source.head` and `source.integrationCommit` identify that runtime snapshot; they do not identify the latest evidence-only descendant commit.

The validators now require the active `integration/catalog-cart-preview` branch to descend from the runtime snapshot. They independently verify all 17 manifest hashes, the five unchanged dependency hashes, exact J2/G4 composition, the deterministic shared section, successor source bindings, historical receipt seals, and the absence of uncommitted theme-runtime changes. Evidence-only descendants no longer fail merely because `HEAD` advanced.

## Localization baseline comparison

The same installed Shopify Theme Check command was run against temporary `git archive` exports. No worktree was switched or modified.

| Baseline | MatchingTranslations errors | Files | Toast-key errors |
| --- | ---: | ---: | ---: |
| Foundation `414288a` | 1,890 | 30 | 0 |
| J2 `0edacc2` | 2,100 | 30 | 210 |
| Integrated runtime `64ddfaa` | 2,100 | 30 | 210 |

J2 added seven nonempty keys under `sections.cart_feedback` in `locales/en.default.json`: `pending`, `added`, `updated`, `removed`, `rejected`, `uncertain`, and `dismiss`. Thirty non-default locale files lack all seven, producing 30 × 7 = 210 new errors. G4 and the evidence reconciliation add no translation keys and no further `MatchingTranslations` failures.

The toast binds every new key through Liquid, uses a polite atomic status region, suppresses an empty computed message, and initializes its custom element once. The J2 browser suite verifies confirmed, rejected, uncertain, keyboard, reduced-motion, and zoom announcements. There is no explicit localized semantic fallback inside the JavaScript when an active non-default locale lacks a key; therefore the 210 errors remain a real production localization gate and are not described as a full pass.

## Selective upload recommendation

Uploading the 17-file package to a target already matching the committed J2/runtime locale baseline introduces no additional repository-detectable translation errors. Uploading `locales/en.default.json` to a foundation-equivalent target introduces the 210 J2 errors unless the corresponding non-default locale keys are supplied separately. Because the preview theme was not read in this batch, its current locale baseline is unknown.

Preview testing in the store's default English locale may proceed only after the remaining repository and Shopify authorization gates are satisfied and the Product Owner explicitly accepts the retained Theme Check failure. Production release should remain blocked until the seven messages have approved translations for every published locale, or the store's actual published-locale scope is authoritatively established and validated. Theme Check was not suppressed and no locale file was changed by this repair.

## Validation results

- Route successor validator: pass; three historical artifacts sealed, four successor routes, nine repository bindings, zero Shopify observations or mutations, authority not renewed.
- Integrated validator: pass on descendant `b37c0ebf1bc5238e7d8b95a20325e4c76ec392b6`; runtime snapshot remains `64ddfaadbcea98175940fd54d9cf198c443e39c3`.
- Validator regression matrix: 11/11 pass, including wrong branch, missing ancestry, runtime drift, source-binding drift, manifest mismatch, missing receipt, authority promotion, and hidden runtime-status negatives.
- Integrated browser suite: 6/6 pass.
- J2 desktop/mobile browser suite: 20/20 pass.
- G4 browser fixture suite: 8/8 pass, including photographic quick-add quantity controls.
- JSON registers, navigation specification, global navigation IA, and theme architecture: pass. The section validator retains two informational no-preset warnings for the G4 directory and navigation sections.
- Standalone G4 source-branch validator: expected branch-context failure because it requires `epic-g/g4-photo-catalog-navigation`; it is not rewritten or weakened for the integration branch.
- Scoped Git whitespace check: pass.
