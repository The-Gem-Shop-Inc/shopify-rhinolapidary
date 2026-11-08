# J2/G4 integrated evidence reconciliation and preview preflight

**Repository evidence is reconciled for preview preparation; Shopify identity, file state, rendering, and menu state remain unobserved in this batch. No deployment or Admin mutation was performed.**

## Candidate identity

- Worktree: `C:\rlcc`
- Branch: `integration/catalog-cart-preview`
- Committed integration: `64ddfaadbcea98175940fd54d9cf198c443e39c3`
- J2 ancestor: `0edacc2799be0be8592b424799e2af2be5a1a165`
- G4 content source: `a53daec8ffbbbdcd6c5acba1da7770fa23ec3a12`
- Foundation: `414288a16fe7123b06c3433f0063ba402fc35e83`

The integration commit has J2 as its single parent. G4 is verified by exact nonshared file content plus the deterministic shared-section successor, not by merge ancestry.

The original, J2, and G4 worktree fingerprints remain unchanged. Epic O was independently advanced outside this batch to clean commit `00634d04984b7fe58ba2eb2e7fa870a38b674fcd` (`feat(epic-o): audit and validate native account MVP`). This batch did not enter, edit, stage, or commit that worktree; the manifest retains both its earlier preparation fingerprint and the current read-only observation.

## Historical and successor route evidence

The G3A machine contract and G3B catalog release remain byte-sealed. Both expired on 2026-10-22 and neither is rebuilt, renewed, or represented as a current Shopify observation.

G3B's former presentation requirements made the unfiltered `/collections/all` request the 150-item text directory, used `sort_by` to escape to photographic cards, removed photographs and quick-add from the default view, and labeled the additive header child `Parts and supplies`. G4 intentionally supersedes those presentation choices.

The following authority requirements remain unchanged: roles and compatibility cannot be inferred; Product and Variant identities remain governed; missing collection handles stay suppressed; the directory uses one pager and fails closed; machine identities, fragments, and omission reasons remain the sealed G3A semantics.

`data/epic-g-g4-route-successor-evidence.json` binds the committed repository implementation for `/collections/all`, `/collections/all?view=directory`, sorting-only query behavior, and `/collections/machines`. It labels every current Shopify route state as unobserved or requiring role reverification. It therefore resolves repository provenance without rewriting historical receipts or inventing live proof.

## Failure classification

| Finding | Classification | Preview impact | Disposition |
| --- | --- | --- | --- |
| Historical G catalog and machine-route provenance mismatch | Intentional contract change awaiting successor evidence; not a runtime regression | Historical validators remain red by design; successor validator is the current repository preflight | Keep historical artifacts sealed; use the additive successor binding |
| G3A/G3B authority expiry | Preexisting, genuinely blocking for current governed role and machine-context claims | Photographic catalog/cart testing can proceed, but the governed directory must be expected to fail closed until a fresh authorized reconciliation | Fresh Admin/source read and a separately authorized authority renewal are required for current role claims |
| G2 presentation lease expiry | Preexisting authority issue | Blocks current G2 fit/presentation claims; does not alter native catalog cards or J2 cart mechanics | Separate Epic G authority maintenance; do not renew in this batch |
| Epic F native source drift | Preexisting issue in `assets/product-form.js` and `snippets/buy-buttons.liquid` | Outside the collection integration; include a machine Product smoke test before accepting preview | Separate Epic F maintenance; no files changed here |
| 2,100 MatchingTranslations errors | Existing repository-wide localization gate, including committed locale-key expansion | Blocks a strict all-theme green claim; English preview runtime remains separately testable | Product Owner disposition and localization maintenance required; no rule weakened |
| Three OrphanedSnippet warnings on the isolated theme-only scan | Preexisting, scan-boundary-dependent maintenance warning; the fresh repository-root scan reports zero warnings | Does not enter the 17-file selective upload and is not a catalog/cart runtime regression | Retain both results; perform separate cleanup only after ownership review |

## Manifest and upload boundary

The preview manifest contains exactly 17 theme files. Every current SHA-256 matches the committed candidate checkout, every path is clean relative to integration commit `64ddfaa`, and the five unchanged dependencies match their recorded hashes. Repository tests, evidence, planning JSON, documentation, and validator scripts are excluded from the upload. The shared collection section contains one toast script reference and one toast render.

The target theme ID remains deliberately unbound. Previously recorded preview `158631198917` must be freshly proven `UNPUBLISHED`; production `158579622085` must be freshly identified and excluded. Preview menu work is a separate operation and is not authorized.

## Later authorized preview procedure

1. Read the current store/theme inventory without mutation. Confirm preview `158631198917` exists with role `UNPUBLISHED`; confirm production `158579622085` and exclude it from all commands.
2. Read all 17 target paths from the preview, retaining exact bodies, checksums, existence state, theme ID, role, and timestamp. Abort on pagination, partial reads, identity drift, or an unexpected role.
3. Re-run repository integration, successor-evidence, manifest, J2/G4 browser, navigation, JSON, Theme Check, and diff gates from the same candidate. Obtain explicit disposition for the retained Theme Check failures.
4. With separate deployment authorization, upload only the 17 manifest paths using strict selective and no-delete behavior. Do not upload repository-only files, settings data, planning JSON, tests, or evidence.
5. Read all 17 paths back. Compare exact expected hashes/bodies and confirm the rest of the theme inventory is unchanged.
6. Test `/collections/all`, sorting, filtering, pagination, empty results, missing images, `/collections/all?view=directory`, directory anchors, and `/collections/machines` at 320, 390, 768, 1024, and 1440 pixels.
7. Exercise add, increment, decrement, remove, rapid multi-Product updates, header badge, cart drawer, cart page, confirmed/rejected/uncertain toast states, keyboard, touch, reduced motion, 200% text/zoom, focus, overflow, and axe serious/critical results.
8. Record route/theme identity, screenshots or structured browser results, console/Liquid failures, file readback, cart outcomes, accessibility results, and whether expired authority produced the expected neutral directory fallback.
9. On failure, stop before publication or menu mutation. Restore exact saved bodies for prior files and delete only paths proved absent before upload; read back and verify the rollback inventory.

## Collection hierarchy follow-up

All Products and Machines are the only approved photographic collection destinations. Before activating Replacement Parts, Consumables, Accessories, or a subgroup, obtain an exact Shopify collection GID/handle/title, current publication/channel status, nonempty membership, membership rule or curated list, authoritative Product GIDs and classifications, explicit exclusions, and compatibility evidence wherever a label implies fit. Then validate the route and menu target on the unpublished preview. No handle, membership, or Admin collection is created by this reconciliation.
