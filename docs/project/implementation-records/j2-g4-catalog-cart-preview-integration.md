# J2/G4 catalog-cart preview integration

**The local integration is implemented and regression-tested. No Git publication, preview deployment, Shopify publication, or Admin mutation is authorized or performed.**

## Source and recovery verification

- Worktree: `C:\rlcc`
- Branch: `integration/catalog-cart-preview`
- HEAD and J2 base: `0edacc2799be0be8592b424799e2af2be5a1a165`
- G4 source: `a53daec8ffbbbdcd6c5acba1da7770fa23ec3a12`
- Foundation: `414288a16fe7123b06c3433f0063ba402fc35e83`
- Origin: `https://github.com/The-Gem-Shop-Inc/shopify-rhinolapidary.git`
- Git `core.longpaths`: `true`

The integration worktree and branch were resumed in place; neither was recreated. G4's committed delta was applied to the committed J2 base without staging or committing. The original, Epic O, J2, and G4 worktrees were fingerprinted before integration and are checked again at completion.

## Shared-file resolution

The only file changed by both branches is `sections/main-collection-product-grid.liquid`.

Its deterministic combined successor removes the G3B `rhino_g_index` substitution, so `/collections/all` always uses the native photographic Product grid and its normal filters, sorting, 20-item pagination, empty state, image fallback, and Product-card purchase behavior. The former governed text directory remains available only through the explicit `collection.directory.json` alternate template at `/collections/all?view=directory`; `sort_by` is never a view selector.

The same combined section retains J2's bulk quick-add initialization exactly once:

- `component-cart-feedback-toast.css`
- `cart-feedback-toast.js`
- `quick-add-bulk.js`
- `quantity-popover.js`
- `price-per-item.js`
- `quick-order-list.js`
- the `cart-feedback-toast` snippet after the collection component

J2-owned coordinator, cart, toast, and Product-title files are byte-identical to J2 except for this explicitly resolved shared file. G4 does not duplicate or replace the cart coordinator or toast. The integration validator reconstructs the expected successor from the two committed branches and rejects drift, missing initialization, duplicates, extra branch overlap, staged changes, or a changed J2/G4 source file.

## Navigation coexistence

The repository-side catalog hierarchy is:

1. All Products -> `/collections/all`
2. Machines -> `/collections/machines`
3. Replacement Parts -> `/collections/all?view=directory#g-replacement-parts`
4. Consumables -> `/collections/all?view=directory#g-consumables`
5. Accessories -> `/collections/all?view=directory#g-accessories`

Only All Products and Machines are asserted as verified collection identities. The remaining links are governed directory anchors, not invented collection handles or inferred Product memberships. Theme header and drawer logic adds an explicit, duplicate-suppressed All Products child when Catalog is a disclosure parent.

The separately proposed preview-menu mutation targets only `preview-primary-navigation-menu`. Its exact before/after states and rollback are recorded in `data/j2-g4-preview-deployment-manifest.json`. Production `main-menu` is forbidden, and no menu or collection mutation was executed.

## Combined regression results

- Combined J2/G4 Playwright using the current worktree's real cart/toast and catalog CSS assets: 6/6 pass. It covers default/sorted/filtered/paginated/directory routes, anchors, photographic quick-add, badge/drawer/cart agreement, rapid multi-Product serialization, collection navigation, rejected/uncertain feedback, keyboard disclosure, mobile, 200% theme text sizing, missing-image fallback, and axe serious/critical checks.
- J2 Playwright, desktop and mobile: 20/20 pass. This covers add, increment, decrement, remove, cart synchronization, ambiguous/failing requests, confirmed state, cart badge, toast status, keyboard dismissal, reduced motion, high zoom, and auto-dismiss.
- G4 browser fixtures: 8/8 pass at 320, 390, 768, 1024, and 1440 pixels. This covers default photo cards, sorting/filter persistence, pagination, directory isolation, empty state, missing-image fallback, representative quantity controls, keyboard/touch navigation, 200% text, and axe serious/critical checks.
- Historical G catalog units using the exact integration section oracle: 41/41 pass.
- Historical G catalog entry/header/drawer units: 14/14 pass.
- Integration structure, JSON registers, offline G foundation, navigation/IA, theme architecture, CSS/storefront JS/Rhino sections, Product templates, Product purchase, and `git diff --check`: pass.
- Theme Check on a fresh theme-only copy: 2,100 `MatchingTranslations` errors and three `OrphanedSnippet` warnings repository-wide; zero direct offenses are located in the 17 manifest theme files. This existing global gate is retained as a required disposition, not suppressed or weakened.
- Historical source bindings remain visibly red: G catalog and machine-route validators reject the authorized G4 navigation-register provenance change; the G2 presentation lease is expired; and F machine validation reports inherited baseline drift in `assets/product-form.js` and `snippets/buy-buttons.liquid`. None was rebuilt or weakened by this integration.
- Live preview/browser verification: not run because deployment is not authorized.

## Preview package and next authorized step

`data/j2-g4-preview-deployment-manifest.json` contains the exact 17-file selective theme package, SHA-256 hashes, five unchanged dependency hashes, no-delete policy, target preflight, read-back requirements, rollback, widths/routes, cart acceptance, and menu plan. Its target theme ID intentionally remains null.

The incomplete photographic category hierarchy is documented separately in `docs/project/implementation-records/j2-g4-tiered-navigation-gap-report.md`. All Products and Machines are the only verified photographic destinations; Replacement Parts, Consumables, and Accessories remain governed directory anchors pending separately approved collection identities and membership.

After separate authorization, first read the intended target and prove it is `UNPUBLISHED`; retain exact pre-upload bodies and hashes; upload only the manifest files with no remote deletes; read them back and compare hashes; then run the recorded route, viewport, accessibility, and J2 quantity/toast checks. Publication and Shopify Admin menu work require independent authorization.
