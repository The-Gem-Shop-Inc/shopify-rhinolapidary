# G4 photographic catalog and tiered collection navigation

**Repository implementation complete; preview and Shopify Admin remain unchanged.**

## Branch and authority boundary

- Branch: `epic-g/g4-photo-catalog-navigation`
- Worktree: `C:\Users\dajem\WebstormProjects\shopify-rhinolapidary-epic-g4`
- Base: `origin/feat/epic-l-l1a-foundation` at `414288a16fe7123b06c3433f0063ba402fc35e83`
- No Shopify Admin mutation, preview deployment, publication, production theme change, commit, push, or J2/O worktree change is part of G4.

## Root cause and retained G3B value

G3B made the unfiltered, unsorted `/collections/all` request a special view selector. The section replaced Trade's normal Product grid with a 150-item text directory; adding `sort_by` bypassed that condition and exposed the photo cards. This inverted the desired shopping priority and overloaded a commerce sort parameter as a view switch.

The directory itself remains useful. It preserves exact governed role groupings for 111 G Products, machine-context links from the G3A contract, no-SKU anonymous access, a neutral fallback when authority drifts, one native pager, and no inferred compatibility. G4 therefore retains the existing authority/index/assets as the explicit secondary `collection.directory.json` experience.

## Before and after

Before:

- `/collections/all` → text Product directory.
- `/collections/all?sort_by=...` → native photographic Product cards.
- Catalog disclosure child → `Parts and supplies`.
- Saws, Laps, and Shaping all duplicated `/collections/machines`.

After repository implementation:

- `/collections/all` → native photographic Product cards, filters, sorting, 20-item pagination, bulk quick-add, prices, availability, native image/text fallback, and existing F/G Product-card rules.
- `/collections/all?view=directory` → the retained governed text directory through Shopify's supported alternate-template mechanism.
- Catalog disclosure gets an explicit duplicate-suppressed `All Products` child in the theme header and drawer.
- The catalog page displays All Products, Machines, and the three secondary governed directory destinations.
- No `sort_by` value selects a view.

## Collection evidence

Verified destinations are `/collections/all` and the published `/collections/machines`. Repository evidence records `/collections/replacement-parts`, `/collections/parts`, `/collections/consumables`, and `/collections/accessories` as 404/unapproved. `/collections/em-1-parts` is not compatibility or complete role authority. G4 creates none of these collections and renders no link to them.

Replacement Parts, Consumables, and Accessories therefore remain exact anchors in the governed secondary directory. They are not represented as collection handles and do not infer membership.

## Proposed Shopify Admin menu mutation — approval required

Target only the verified preview menu handle `preview-primary-navigation-menu`; never edit production `main-menu` in this batch.

Replace the current Catalog children:

1. Parts and supplies → `/collections/all`
2. Saws → `/collections/machines`
3. Laps → `/collections/machines`
4. Shaping → `/collections/machines`

with:

1. All Products → `/collections/all`
2. Machines → `/collections/machines`
3. Replacement Parts → `/collections/all?view=directory#g-replacement-parts`
4. Consumables → `/collections/all?view=directory#g-consumables`
5. Accessories → `/collections/all?view=directory#g-accessories`

Catalog remains a disclosure parent. Rollback is the exact recorded four-child before tree. The machine-type labels are removed because they all resolve to one destination rather than verified subdivisions. Exact machine-type collections can be introduced only after separate collection identity and membership approval.

## J2 coexistence

The only shared G4/J2 file is `sections/main-collection-product-grid.liquid`.

When the branches are integrated, retain G4's removal of the `rhino_g_index` substitution and retain all J2 additions inside the bulk quick-add path:

- `component-cart-feedback-toast.css`
- `cart-feedback-toast.js`
- `quick-add-bulk.js`, `quantity-popover.js`, `price-per-item.js`, and `quick-order-list.js`
- the `cart-feedback-toast` snippet rendered for bulk quick-add
- J2's `data-product-title` and cart/toast JavaScript changes in their J2-owned files

G4 must not replace, duplicate, or reimplement J2's cart coordinator or toast. Integrated acceptance must start at `/collections/all` without `sort_by`, use a visible single-Variant bulk quantity control, and verify add, increment, decrement, remove, confirmed input/cart badge state, and J2 toast feedback.

## Preview verification plan — not executed

After separate deployment authorization, upload only the scoped theme successor to a non-production preview. Verify default, sorted, filtered, paginated, empty, and directory URLs at 320, 390, 768, 1024, and 1440 pixels. Exercise header/drawer disclosure by keyboard and touch, direct directory fragments, missing-image text fallback, bulk quick-add, J2 feedback after integration, 200% text zoom, focus visibility, overflow, and axe. Read back every uploaded file and compare the preview menu before any separately approved Admin mutation.

## Validation results

Passing repository and fixture checks:

- G4 structural validator: pass, including section-schema ID dedupe, route suppression, protected G/J2 sources, alternate template, and exact shared-file ledger.
- G4 unit tests: 6/6.
- G4 Playwright browser fixtures: 8/8 across 320, 390, 768, 1024, and 1440 pixels, keyboard, touch, 200% text, axe serious/critical, empty state, missing-image fallback, pagination, and representative quantity input.
- J2 Playwright suite, executed from its clean worktree with output redirected to a temporary directory: 20/20 across desktop and mobile. Add, increment, decrement, remove, reconciliation, confirmed quantities, cart badge, toast status, focus, reduced motion, zoom, and auto-dismiss pass.
- Exact J2 section patch applies cleanly to the G4 worktree with `git apply --check`; the integration simulator retains the photographic grid plus all J2 toast/quick-add initialization.
- Historical G catalog unit suite: 41/41 with the old evidence write suppressed.
- Historical G Catalog header/drawer suite: 14/14 with the old evidence write suppressed.
- Offline Epic G foundation fixture: pass.
- Navigation spec, global navigation IA, IA validator regression, JSON registers, theme architecture, CSS, storefront JS, Rhino sections, Product templates, and Product purchase architecture: pass.
- Fresh full-theme Theme Check copy: zero offenses in G4 catalog files. Repository total remains 1,890 errors and 3 warnings in other files.

Known source-binding failures retained, not weakened:

- Live G foundation validation requires a new explicit Admin read; only the offline fixture was run.
- G2 Product presentation lease is expired.
- G machine/catalog validation rejects navigation-register provenance drift after the authorized G4 route-contract changes.
- F consumer validation lacks the local ignored `data/product-export/products.csv` input.
- F machine validation reports inherited native baseline drift in `assets/product-form.js` and `snippets/buy-buttons.liquid`.
- F gallery/facts/context/support validators report inherited `locales/en.default.json` owner-binding drift.
- Repository-wide Theme Check fails on the inherited localization backlog; no locale file is changed by G4.

No live storefront, preview theme, Shopify Admin menu, production theme, or production menu was changed or verified.
