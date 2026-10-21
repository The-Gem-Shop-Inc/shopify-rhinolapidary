# G-PBI-005: native catalog role directory

The intended host is the existing canonical `/collections/all` route. Trade currently paginates its image grid by 20. Fresh read-only traversal accounts for 119 published Products across six native pages: 111 G Products plus eight published machines. Admin has 122 Products/125 Variants; three machines remain unpublished. The four proposed aggregate role collection routes still return 404 and are not destinations.

## Pagination decision, before theme editing

Use **one existing `paginate collection.products` block**, selecting 150 items for the canonical text directory and the original configured page size everywhere else. Do not add an independent pager or duplicate image grid. Keep the native grid's inner implementation/settings unchanged in the alternate branch. Explicit sorting, filtering/tag views and other collections retain native behavior. Provide an ordinary native all-Products view link using Shopify's existing sorting parameter.

150 is selected to show the current 119 published identities and all 111 G links together, with modest room for growth; it is not Shopify's 250 maximum. No Product images, prices, quick-add controls or native card controllers load for this text directory. Actual preview performance must validate the choice against the original 20-card surface. If it fails, retain repository work and reduce/reassess the page size before release.

Each page is traversed in **three explicit loops of at most 50 items**, offsets 0/50/100. This avoids assuming an ordinary loop can iterate 150 times. The native paginate object remains the only pager and uses its existing `page` parameter. The approved source projection records current public membership/order, exact Product/Variant identities and each role's first page. Later pages retain role choices and links to those actual role targets. Fixtures cover 20/50/150/250 boundaries and catalogs larger than the chosen page size. The index never uses `all_products`.

Official references: [paginate](https://shopify.dev/docs/api/liquid/tags/paginate), [pagination depth](https://shopify.dev/docs/storefronts/themes/best-practices/performance/limit-pagination-depth). Shopify allows page sizes up to 250 but recommends smaller typical image collections. This text-only decision still requires actual rendering/coverage/performance proof. Catalogs exceeding Shopify's 25,000-item traversal limit require a new scoped decision; no H platform is introduced here.

## Authority and safe browsing

G1 verifies current E/F source integrity, exact E identities/Variants, governed class definitions/values and current publication. Roles are never inferred from names, tags, types, collections or price. The G3B release is a disposable consumer projection, not a new approval registry. Liquid reconciles each page's complete identity set and each Product's exact ID/handle/class/Variants before role labels are emitted. A changed or unknown row fails the role surface closed instead of silently filtering a supposedly complete list.

Native current Product links remain usable through a neutral text catalog fallback if the role projection is unavailable, expired or drifted. That fallback makes no role or compatibility claims, preserves one pager and provides recovery targets for incoming role fragments. Other collection views retain Trade's native grid, facets and controls.

The current G1 contract requires a valid governing source receipt for its approved role consumer. G3B honors it rather than weakening G1. This is independent of G2's expired one-hour **fit presentation** lease: G3B never verifies, refreshes or deploys that G2 projection. Receipt/source invalidity suppresses approval-dependent role/machine claims; it does not disable native Product browsing or purchasing.

Machine context links consume only G3A's verified route semantics and currently encountered published machine objects. They point to the exact existing F heading; they add no compatibility edges or machine Product lookups. No unavailable JadeMaster/SawMaster36/TumbleMaster link or Saw Vice grant is introduced.

Navigation register additions are projection-consumer metadata. If those legitimate additions change G3A's recorded navigation provenance, reproduce its route contract with the existing compiler, preserving the previous artifact in G3B evidence and asserting identical routes, binding and expiration. This neither rewrites historical evidence nor renews any receipt/observation. Production fragments must be reverified on their own target theme.

The six unresolved commercial Products remain normal named links. The index does not show zero prices, promotions or purchase restrictions. Native Product price, Variant, quantity, availability and error behavior remain authoritative. Commercial launch readiness remains G-PBI-006; integrated QA remains G-PBI-007. Neither is implemented here.

## Observed navigation gap and bounded extension

Fresh MAIN inspection contradicted the assumed direct Catalog link: Catalog is a native disclosure containing Saws, Laps and Shaping; the homepage currently links only Shop machines and Contact. Neither reaches `/collections/all`. See `catalog-entry-check.json` and `main-catalog-entry-discovery.json` in the G3B evidence directory. This is a necessary entry gap, rather than a reason to restructure navigation.

Add exactly one **Parts and supplies** child under that existing Catalog disclosure, using the configured preview mega menu and mobile drawer. Preserve every existing child and all top-level navigation. If Admin later supplies an existing `/collections/all` child, suppress the additive child to avoid duplicates. Both native snippet predecessors match the repository baseline and the remote preview; none occurs in the active final-owner, media or header-focus binding manifests. `epic-g-catalog-entry.js` enforces the exact additive successor. Its separate two-file deployment guard cannot write the homepage, header section, settings, Admin menus, G2 fit or MAIN.

The original five-file catalog allowance remains separate. The two entry snippets require their own fresh inventories, native bodies, complete gates, rollback and remote readback. The route registers distinguish this theme child from Shopify Admin menu items and record preview visibility separately from MAIN. Production still needs a separately authorized, target-specific verification.

Actual Shopify rendering exposed a leading newline around LiquidDoc snippet results. Normalize whitespace at the page/role/first-page/fragment render boundaries. Do not normalize native class values or loosen identity/reference comparisons. The captured initial failure and diagnostic deployment remain separate evidence; a newline fixture and a changed native-class fixture protect this distinction.
