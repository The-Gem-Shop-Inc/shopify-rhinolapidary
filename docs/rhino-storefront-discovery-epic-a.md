# Rhino Lapidary Storefront Discovery and Epic A Backlog

Date: 2026-07-02

Scope: discovery and planning only. This document does not implement storefront behavior, change Shopify admin data, install apps, or refactor the theme.

## Source Summary

Repository evidence:

- Theme metadata declares Shopify Trade `15.5.0` in `config/settings_schema.json:4-6`.
- Git history has two commits: the first README commit on 2026-05-05 and a default theme import on 2026-07-01.
- The working tree was clean before this document was added.
- `shopify theme check` completed with 8 warnings across 7 files.

External evidence checked:

- Shopify Theme Store Trade page: https://themes.shopify.com/themes/trade/presets/trade
- Shopify Theme Check CLI docs: https://shopify.dev/docs/api/shopify-cli/theme/theme-check
- Shopify Theme Check configuration docs: https://shopify.dev/docs/storefronts/themes/tools/theme-check/configuration
- Shopify app blocks docs: https://shopify.dev/docs/storefronts/themes/architecture/blocks/app-blocks
- Shopify Search and Discovery filter docs: https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-filters
- Shopify Search and Discovery app listing: https://apps.shopify.com/search-and-discovery
- Rhino Lapidary current site: http://www.rhinolapidary.com/
- Rhino Lapidary shop: http://www.rhinolapidary.com/shop.html
- Rhino Lapidary policies: http://www.rhinolapidary.com/policies-and-procedures.html
- Rhino Lapidary EM-1 page: https://www.rhinolapidary.com/store/p1/em-1.html
- The Gem Shop Rhino collection: https://thegemshop.com/collections/rhino-lapidary
- The Gem Shop EM-1 product: https://thegemshop.com/products/rhino-lapidary-em-1-machine
- Competitor/reference checks included CabKing, Diamond Pacific, Covington Engineering, and Kingsley North public pages.

## Findings Report

### Repository Summary

Detected theme and version:

- The repository is Shopify Trade `15.5.0`, authored by Shopify, from `config/settings_schema.json:4-6`.
- Shopify's public Trade listing also reports version `15.5.0`, dated 2026-06-17, so the repo is current against the public Trade release as of this audit.

Apparent repository age:

- The repo appears very new. The only substantive theme commit is `f978a65` on 2026-07-01, described as `default theme`.
- The previous commit, `1f3f746` on 2026-05-05, only created the README.

Major customizations already present:

- No clear Rhino-specific Liquid, CSS, or JSON template customizations were found.
- `config/settings_data.json` contains admin/theme-editor choices such as color schemes, typography, cart type, predictive search, and header/footer group content.
- `assets/standard-actions-override.js` is a high-impact cart integration surface. It configures Shopify standard actions, refreshes cart sections, and publishes cart update events. It repeatedly references Dawn, which should be documented and tested in a Trade fork.

Areas still close to stock Trade:

- Homepage template content is still generic Trade demo copy, including `Welcome industry insiders`, `Grow your business with us`, repeated `Insert partner logo`, testimonial placeholders, and `Add educational content` in `templates/index.json:9-375`.
- Product template copy is still generic, including `Product features`, `Materials and care`, `Merchandising tips`, and `Other industry favorites` in `templates/product.json:21-91`.
- Header, footer, collection, search, product, cart, blog, article, customer account, and contact templates appear stock or near-stock.
- The theme includes many stock assets that do not support Rhino's brand, such as apparel/food/beauty icons and `sparkle.gif`.

Files or systems carrying most of the current behavior:

- Global layout and script loading: `layout/theme.liquid`.
- Theme settings and design tokens: `config/settings_schema.json` and `config/settings_data.json`.
- Homepage composition: `templates/index.json`.
- Product page composition: `templates/product.json`, `sections/main-product.liquid`, `sections/quick-order-list.liquid`.
- Product discovery: `sections/main-collection-product-grid.liquid`, `sections/main-search.liquid`, `snippets/facets.liquid`, `snippets/card-product.liquid`.
- Cart and quick ordering: `assets/standard-actions-override.js`, `assets/cart.js`, `assets/cart-notification.js`, `assets/quick-order-list.js`, `snippets/quick-order-list.liquid`.

Existing app integrations:

- The repo does not contain obvious third-party app snippets or hardcoded marketing tags.
- Several sections support `@app` blocks, including header, footer, product, featured product, article, newsletter, and the generic apps section.
- `layout/theme.liquid:66` renders `content_for_header`, so Shopify admin app embeds and pixels can still inject code outside the repo.
- The current The Gem Shop Rhino pages use multiple apps and pixels, but those are not present in this repository. They should not be copied blindly.

Existing design tokens:

- Color schemes are present in `config/settings_data.json`: light gray, white, warm taupe, dark gray-blue, and charcoal variants.
- Typography is set to DM Sans for headings and Jost for body copy in `config/settings_data.json`.
- These settings are reasonable starting points but do not yet form a distinct Rhino design system.

Existing reusable components:

- Trade stock components include product cards, facets, predictive search, quick-order lists, cart notification/drawer support, product media gallery, product disclosures, collapsible content, mega menu, localization selectors, and app block surfaces.
- Product disclosure support appears aligned with Trade 15.5.0's new disclosure functionality.

Existing technical debt:

- `README.md` contains only `# shopify-rhinolapidary`.
- No `.github` workflows, `package.json`, `.theme-check.yml`, `.shopifyignore`, `shopify.theme.toml`, or root `.gitignore` were found.
- JetBrains `.idea` files are tracked.
- `settings_data.json` is versioned without a documented policy for protecting live theme-editor settings.
- Theme Check warnings are present and not tracked as accepted upstream warnings versus project debt.
- Placeholder content remains in JSON templates.
- There is no documented upstream Trade update process, release workflow, rollback path, performance budget, accessibility baseline, app register, or admin dependency register.

Upgrade risks:

- The repo currently matches the latest public Trade version, but there is no recorded clean upstream baseline or diff strategy.
- Future Rhino changes could be difficult to separate from Shopify upstream updates unless custom files, settings, and app/admin dependencies are inventoried now.
- `assets/standard-actions-override.js` depends on DOM custom elements and cart section contracts. If Trade changes cart markup or Shopify standard action behavior, cart refreshes could regress.
- Quick-order Liquid uses newer/complex cart line item constructs and contains Theme Check disables/TODOs in inherited snippets; this should be treated as a sensitive surface.

Missing documentation, tooling, and safeguards:

- Missing development setup, Shopify CLI usage, theme preview/deploy workflow, branch policy, release notes, admin dependency checklist, app dependency checklist, CI checks, visual regression tests, storefront smoke tests, performance gates, accessibility gates, and PR review checklist.

### Current Experience Summary

Homepage:

- Checked-in Shopify homepage is generic Trade B2B demo content, not Rhino-specific.
- The current public Rhino site instead leads with the EM-1 and explains the "Everything Machine" positioning. That stronger product story is not represented in the repo.

Primary navigation:

- Header uses the admin menu handle `main-menu`, desktop mega menu behavior, sticky reduced-logo header, country/language selectors, and customer avatar settings.
- Actual menu labels, hierarchy, compatibility paths, and Rhino/The Gem Shop routing require Shopify admin inspection.

Search:

- Predictive search is enabled in settings and `layout/theme.liquid` loads `predictive-search.js`.
- Collection and search templates support filtering and sorting, but filter quality depends on Search and Discovery/admin data.

Collection browsing:

- `templates/collection.json` uses filtering, sorting, 20 products per page, 5 desktop columns, 2 mobile columns, and bulk quick add.
- The current The Gem Shop Rhino collection exposes only broad filters such as availability, price, and product type. Rhino likely needs machine family, compatibility, grit, diameter, voltage, consumable type, and application filters.

Product comparison:

- No comparison table, spec matrix, machine chooser, or compatibility checker exists in the repo.

Product pages:

- `sections/main-product.liquid` supports variants, buy buttons, custom Liquid, product disclosures, rating, and app blocks.
- The current `templates/product.json` does not include standard `variant_picker` or `buy_buttons` blocks. It relies on title, price, description, stock collapsible tabs, share, disclosures, quick order list, and related products. This may be intentional for Trade but is risky for expensive machinery unless verified against preview and checkout behavior.

Machine pages:

- No dedicated machine product template exists. EM-1, Sawmaster, Lapmaster, Beadmaster, Shapemaster, and Trimmaster need stronger specs, included parts, media, freight, warranty, voltage, replacement parts, and setup/support structures.

Accessory and consumable pages:

- Quick-order and SKU display are useful foundations, but compatibility metadata is not visible in the theme repo. Customers will struggle if replacement parts are not tied to machine families and setup use cases.

Cart:

- `settings_data.json` sets `cart_type` to `notification`, while cart drawer assets and drawer rendering are conditionally supported.
- Cart behavior is affected by Shopify standard events, `standard-actions-override.js`, cart notification, and quick-order scripts.

Checkout transition:

- Checkout is Shopify-admin controlled. Shipping, freight, local pickup, taxes, policies, and payment/financing cannot be verified from this repo.

Mobile:

- Trade is responsive, but no local preview or screenshot testing is configured. High-density product grids, quick-order lists, mega menus, and expensive product detail pages need mobile-specific QA.

Account experience:

- Customer account templates are present and likely stock. Header customer avatar is enabled. Wholesale, dealer, school, club, and institutional customer flows require admin discovery.

Support and contact:

- `templates/page.contact.json` has generic contact copy and references a Shopify Files image, not a repo asset.
- Current public Rhino contact information points customers to The Gem Shop in Cedarburg, WI and also identifies Silica-Gem. The relationship needs to be clear on the Shopify storefront.

Warranty and returns:

- The repo does not contain policy content. The public Rhino site has detailed shipping, damage, returns, and warranty copy that needs a Shopify policy/admin migration plan and legal review.

Educational content:

- Checked-in theme uses stock education placeholders. Existing Rhino/YouTube and The Gem Shop lapidary education content should be inventoried before creating new content.

Post-purchase guidance:

- No post-purchase onboarding, machine setup, maintenance, troubleshooting, replacement part routing, or warranty registration flow appears in the repo.

### Brand Summary

Existing logo treatments:

- No logo asset is committed to the repo. `settings_data.json` leaves `logo` unset and uses a small `logo_width` value.
- Current live Rhino materials include Rhino-specific branding outside the repo.

Existing colors:

- The checked-in palette uses light gray, white, taupe, charcoal, and dark gray-blue.
- It suggests an industrial direction but is not yet distinctive or clearly connected to Rhino armor, lapidary machinery, stone, water, or technical precision.

Existing typography:

- Current settings use DM Sans headings and Jost body text.
- This is readable but generic; no technical spec hierarchy, machine label style, or editorial education hierarchy has been defined.

Existing iconography:

- The asset folder contains many stock Trade icons, including food, apparel, beauty, and shoe icons that do not fit Rhino.
- No technical Rhino icon system, compatibility icons, machine family marks, voltage/freight/warranty icons, or lapidary process icons are present.

Existing photography style:

- The repo contains almost no real product imagery. `sparkle.gif` is the only notable raster asset in `assets/`.
- Product imagery currently lives in Shopify Files or other sites. The Gem Shop and Rhino pages have EM-1, setup, and product media that should be audited for quality, licensing, dimensions, and migration readiness.

Existing voice and terminology:

- Checked-in theme voice is generic B2B Trade copy.
- Current public Rhino copy emphasizes the EM-1, machine engineering, water filtration, variable speed, torque, attachments, and the Silica-Gem/The Gem Shop partnership.

Inconsistencies and identity ambiguity:

- Rhino Lapidary, The Gem Shop, and Silica-Gem are all legitimate parts of the story, but their roles are not yet encoded clearly in the Shopify theme.
- Customers need to know who manufactures, fulfills, supports, warranties, and repairs equipment.

Missing brand decisions:

- Final logo usage, color system, type scale, icon style, product media rules, diagram/technical illustration style, comparison table styling, warranty/support trust marks, and Rhino/The Gem Shop identity architecture remain undecided.

### Risk Summary

- Accessibility: no baseline audit, no axe checks, no documented contrast targets, and no tested behavior for quick-order tables, mega menus, predictive search, forms, or cart notification.
- Mobile usability: no screenshot tests or viewport QA, and dense product-grid/quick-order patterns may not serve mobile visitors from YouTube, trade shows, or QR codes.
- Performance: no Lighthouse budget, image budget, app budget, CSS/JS budget, or app-embed review. `base.css` and core scripts are stock but app embeds can change performance materially.
- App-generated code: app blocks and `content_for_header` are supported, but installed apps, app embeds, and pixels are unknown.
- Duplicate/stale scripts: legacy Rhino/Weebly and The Gem Shop pages expose Google and app scripts that must not be duplicated blindly during migration.
- Theme-upgrade conflicts: no upstream Trade strategy exists.
- Fragile JavaScript: cart standard action override depends on specific custom elements, section IDs, and pub/sub events.
- Hardcoded content: homepage and product tabs still contain stock demo copy.
- Missing schema/settings: Rhino-specific product claims, support promises, freight notes, compatibility, and support content are not modeled in settings, metafields, or metaobjects.
- Missing fallbacks: no product media/fallback policy for expensive machines, manuals, or compatibility tables.
- Broken links/domains: direct HTTPS access to `www.rhinolapidary.com` failed from this workstation while HTTP succeeded. This needs DNS/TLS verification before launch.
- Unclear compatibility: replacement parts and consumables are not visibly tied to compatible machines in the theme.
- Legal/policy information: Shopify policies, warranty, returns, freight, damage claims, international availability, voltage, and repair terms require admin/legal verification.
- Analytics: repo has no hardcoded analytics, but Shopify pixels/admin settings are unknown. Legacy Weebly and The Gem Shop analytics must be audited to avoid double-counting.
- SEO: migration risk exists from Weebly and The Gem Shop Rhino URLs to a dedicated Rhino Shopify storefront, including canonical strategy, redirects, duplicate product copy, and structured data.
- Product data: current product filters appear broad on The Gem Shop. Rhino-specific product types, categories, tags, metafields, variants, SKUs, dimensions, weights, inventory, and shipping classes need validation.

## Shopify Admin Areas Requiring Human Inspection

The repository cannot verify Shopify admin configuration. Create discovery tasks or checklists for:

- Products
- Variants
- Categories
- Collections
- Product types
- Vendors
- Tags
- Metafields
- Metaobjects
- Navigation
- Markets
- Domains
- Customer accounts
- Checkout
- Shipping profiles
- Package settings
- Local pickup
- Taxes
- Policies
- Notifications
- Discounts
- Gift cards
- Files
- Blog posts
- Search and Discovery
- App embeds
- Installed apps
- Pixels and customer events
- Analytics
- Consent and privacy settings
- Google and social sales channels
- Shop channel
- Email configuration
- Forms
- Automations
- Redirects
- Users and permissions

## Epic A - Repository Health and Theme Architecture

Intent: make the Trade fork safe to customize, safe to deploy, and understandable before major Rhino storefront work begins.

Recommended labels:

- `epic: repository-health`
- `area: theme-architecture`
- `area: ci`
- `area: documentation`
- `area: shopify-admin`
- `area: performance`
- `area: accessibility`
- `type: discovery`
- `type: technical-debt`
- `type: test`
- `type: docs`

### A-001 Document the local development workflow

Priority: P0
Size: S
Labels: `type: docs`, `area: theme-architecture`

Problem:

- `README.md` only contains the repository name.

Scope:

- Document prerequisites, Shopify CLI usage, login/store selection, local preview commands, theme pull/push safety rules, and expected review workflow.

Acceptance criteria:

- README explains how to run a local preview without affecting production.
- README explains how to run Theme Check.
- README identifies the Shopify store, production theme, preview theme, and who owns access, without committing secrets.
- README links to the admin checklist and release checklist.

Evidence:

- `README.md`
- Shopify CLI detected locally as `3.94.3`.

### A-002 Record the Trade base version and upstream source

Priority: P0
Size: S
Labels: `type: docs`, `area: theme-architecture`

Problem:

- The theme version is present in schema but not documented as an architectural decision.

Scope:

- Add a short architecture note recording Trade `15.5.0`, the Shopify Theme Store URL, date verified, and expected update cadence.

Acceptance criteria:

- A developer can identify the upstream Trade version without opening theme schema.
- The note distinguishes Shopify upstream code from future Rhino customizations.
- The note includes the 2026-07-02 verification that Shopify lists Trade `15.5.0`.

Evidence:

- `config/settings_schema.json:4-6`
- https://themes.shopify.com/themes/trade/presets/trade

### A-003 Create an upstream-update strategy

Priority: P0
Size: M
Labels: `type: docs`, `area: theme-architecture`

Problem:

- There is no process for applying future Trade releases after Rhino customization begins.

Scope:

- Define how to obtain a clean Trade release, compare it with this fork, review conflicts, and test before deployment.

Acceptance criteria:

- Strategy covers minor Trade updates, emergency patches, and rollback.
- Strategy defines who approves upstream merges.
- Strategy includes required tests before and after an upstream merge.
- Strategy states how `settings_data.json` is handled during update work.

### A-004 Build an upstream-vs-Rhino customization inventory

Priority: P0
Size: M
Labels: `type: discovery`, `area: theme-architecture`

Problem:

- The current repo is mostly stock, but future customizations will become hard to audit without an inventory.

Scope:

- Create a table of files with columns for upstream status, Rhino modification status, owner, risk level, and test coverage.

Acceptance criteria:

- Every file under `layout`, `templates`, `sections`, `snippets`, `assets`, `config`, and `locales` is categorized.
- `assets/standard-actions-override.js` is categorized as a high-impact behavior surface whether upstream or locally modified.
- The inventory is updated as part of PR review when new custom files are added.

### A-005 Remove or ignore IDE project files from version control

Priority: P1
Size: S
Labels: `type: technical-debt`, `area: repository`

Problem:

- JetBrains `.idea` files are tracked and do not belong to the Shopify theme artifact.

Scope:

- Add a root `.gitignore`, remove tracked workspace-specific IDE files from Git, and document acceptable editor settings.

Acceptance criteria:

- `.idea` workspace/project files are no longer tracked unless a specific shared editor config is intentionally retained.
- `.gitignore` covers IDE folders, OS files, logs, local Shopify files, dependency folders, and generated test artifacts.
- No theme runtime files are removed.

### A-006 Add a `.shopifyignore` policy

Priority: P1
Size: S
Labels: `type: technical-debt`, `area: theme-architecture`

Problem:

- The repo lacks an explicit list of files that should not be uploaded to Shopify.

Scope:

- Add `.shopifyignore` after deciding which docs, local configs, screenshots, and test artifacts should remain local-only.

Acceptance criteria:

- Shopify uploads exclude repository-only files that should not become theme assets.
- The policy is documented in README.
- Required theme files are not ignored.

### A-007 Define `settings_data.json` ownership and safety rules

Priority: P0
Size: M
Labels: `type: docs`, `area: shopify-admin`

Problem:

- `settings_data.json` can overwrite live theme-editor settings if pushed carelessly.

Scope:

- Decide whether `settings_data.json` is versioned as source-of-truth, treated as a snapshot, or protected by branch/review rules.

Acceptance criteria:

- README states when developers may pull or push settings data.
- Release checklist includes a settings backup step.
- PR checklist calls out any `settings_data.json` change.
- Admin-only changes are not silently overwritten by code deploys.

Evidence:

- `config/settings_data.json`

### A-008 Establish development, preview, and production theme workflow

Priority: P0
Size: M
Labels: `type: docs`, `area: release`

Problem:

- No documented environment workflow exists.

Scope:

- Define local development, shared preview, staging/review, production publishing, and rollback process.

Acceptance criteria:

- Workflow identifies theme IDs/names without committing secrets.
- Developers can test changes in preview before publishing.
- Publishing to production requires an explicit checklist and approval.
- Rollback path is documented.

### A-009 Add Theme Check configuration

Priority: P0
Size: S
Labels: `type: test`, `area: ci`

Problem:

- Theme Check runs but no project configuration exists.

Scope:

- Add `.theme-check.yml` or equivalent project configuration after deciding which warnings are accepted upstream debt versus project debt.

Acceptance criteria:

- `shopify theme check` runs consistently for all developers.
- Accepted warnings are documented with rationale.
- New warnings fail CI once CI is established.

Evidence:

- Shopify Theme Check docs: https://shopify.dev/docs/api/shopify-cli/theme/theme-check
- Configuration docs: https://shopify.dev/docs/storefronts/themes/tools/theme-check/configuration

### A-010 Resolve or explicitly document current Theme Check warnings

Priority: P1
Size: M
Labels: `type: technical-debt`, `area: ci`

Problem:

- Current Theme Check output reports 8 warnings across 7 files.

Scope:

- Review each warning and decide whether to fix, suppress, or track as upstream Trade debt.

Acceptance criteria:

- Each warning has a decision and owner.
- If fixed, behavior is validated on affected templates.
- If suppressed, suppression includes a short reason and upstream reference if applicable.
- CI has no unexplained warnings.

Evidence:

- `layout/password.liquid:40` unknown `scheme_classes`
- `layout/theme.liquid:82` unknown `scheme_classes`
- `sections/main-article.liquid:102` variable naming
- `sections/main-list-collections.liquid:20` variable naming
- `sections/main-product.liquid:601` unknown `continue`
- `sections/main-product.liquid:745` unused `seo_media`
- `sections/main-search.liquid:274` unused `product_settings`
- `snippets/quick-order-product-row.liquid:1` orphaned snippet

### A-011 Add CI for theme validation

Priority: P0
Size: M
Labels: `type: test`, `area: ci`

Problem:

- No `.github` workflow or automated repository validation exists.

Scope:

- Add GitHub Actions for Theme Check, JSON validation, and basic repository hygiene.

Acceptance criteria:

- Pull requests run Theme Check.
- Pull requests validate JSON files under `config`, `templates`, `sections`, and `locales`.
- CI fails on invalid Liquid/JSON or unexplained Theme Check warnings.
- Workflow does not require Shopify production credentials for read-only checks.

### A-012 Add a no-placeholder-content check

Priority: P1
Size: S
Labels: `type: test`, `area: ci`, `area: content`

Problem:

- Stock Trade placeholder copy remains in live-relevant templates.

Scope:

- Add a lightweight grep-based CI check or documented release checklist for known placeholder phrases.

Acceptance criteria:

- Checks catch phrases such as `Welcome industry insiders`, `Insert partner logo`, `Add a customer testimonial`, and `Add educational content`.
- The check runs before production publication.
- False positives are documented if intentional.

Evidence:

- `templates/index.json:9-375`
- `templates/product.json:21-91`

### A-013 Create a repository release checklist

Priority: P0
Size: S
Labels: `type: docs`, `area: release`

Problem:

- There is no release checklist for a Shopify theme that mixes code, settings, app embeds, and admin configuration.

Scope:

- Create a checklist covering branch state, Theme Check, preview testing, settings backup, app embed review, performance smoke test, accessibility smoke test, Shopify admin changes, and rollback.

Acceptance criteria:

- Release checklist is linked from README.
- The checklist names who approves publish.
- The checklist includes exact commands for verification.
- The checklist requires capture of production theme ID/name and backup date.

### A-014 Create a changelog or release notes template

Priority: P2
Size: S
Labels: `type: docs`, `area: release`

Problem:

- Future storefront changes will affect merchandising, admin data, and customer support but no release communication format exists.

Scope:

- Add a release notes template covering customer-facing changes, admin dependencies, known issues, rollback notes, and support talking points.

Acceptance criteria:

- Each production publish can be summarized for non-developers.
- Notes distinguish theme code changes from Shopify admin changes.
- Known post-release verification steps are included.

### A-015 Create a PR checklist for Shopify theme work

Priority: P1
Size: S
Labels: `type: docs`, `area: repository`

Problem:

- The repo lacks review rules for risky Shopify theme surfaces.

Scope:

- Add a PR checklist that asks about `settings_data.json`, app blocks, scripts, product templates, checkout/admin dependencies, accessibility, performance, and rollback.

Acceptance criteria:

- PR authors must identify touched templates/sections/assets.
- PR authors must say whether admin changes are required.
- PR authors must include preview links or screenshots for visual changes.
- PR authors must state test results.

### A-016 Add issue templates for PBIs and discovery tasks

Priority: P2
Size: S
Labels: `type: docs`, `area: repository`

Problem:

- The backlog will be transferred to GitHub, but no issue template exists.

Scope:

- Create issue templates for implementation PBIs, discovery PBIs, bugs, and admin tasks.

Acceptance criteria:

- Templates include problem, scope, acceptance criteria, dependencies, test plan, admin impact, and release notes impact.
- Templates support labels and priority.
- Templates are concise enough for routine use.

### A-017 Define file ownership and review requirements

Priority: P2
Size: S
Labels: `type: docs`, `area: repository`

Problem:

- No owner or reviewer expectations exist for high-impact files.

Scope:

- Add CODEOWNERS or a documented ownership matrix for theme architecture, product templates, cart/checkout-adjacent code, design tokens, and admin settings.

Acceptance criteria:

- Changes to cart, product pages, settings schema, and layout require explicit review.
- Ownership is documented even if GitHub CODEOWNERS is not adopted.
- Review requirements are linked from README.

### A-018 Document app dependency and app embed policy

Priority: P0
Size: M
Labels: `type: docs`, `area: apps`, `area: performance`

Problem:

- The repo supports app blocks and app embeds, but installed apps are unknown and additional apps carry cost, performance, privacy, and maintenance risk.

Scope:

- Create an app register and policy for evaluating, approving, configuring, and removing apps.

Acceptance criteria:

- Every app has owner, purpose, cost, data access, storefront injection behavior, pages affected, performance impact, privacy impact, and removal plan.
- App blocks and app embeds are documented separately.
- The policy defaults to Shopify-native or free apps when practical.
- New apps require a justification and exit strategy.

Evidence:

- App block docs: https://shopify.dev/docs/storefronts/themes/architecture/blocks/app-blocks

### A-019 Audit all app block surfaces in the theme

Priority: P1
Size: M
Labels: `type: discovery`, `area: apps`, `area: theme-architecture`

Problem:

- Several sections support `@app`, but there is no map of where apps can inject storefront UI.

Scope:

- Inventory all sections that permit app blocks and identify which templates can render them.

Acceptance criteria:

- App block surfaces are listed by section and template.
- Each surface has guidance for allowed use.
- High-risk surfaces such as product pages, header, footer, and cart-adjacent areas are flagged.

### A-020 Create a third-party script and pixel register

Priority: P0
Size: M
Labels: `type: discovery`, `area: analytics`, `area: privacy`

Problem:

- The repository has no hardcoded analytics scripts, but Shopify admin pixels, app embeds, and migrated legacy scripts are unknown.

Scope:

- Inventory all scripts and pixels from Shopify admin, app embeds, Customer Events, Google/social sales channels, and any legacy migration source.

Acceptance criteria:

- Register lists source, owner, business purpose, data collected, consent behavior, pages affected, and removal process.
- Legacy Weebly/The Gem Shop analytics are checked for duplication risk.
- No production launch occurs with unowned analytics or duplicate purchase events.

### A-021 Create analytics migration and verification plan

Priority: P1
Size: M
Labels: `type: discovery`, `area: analytics`

Problem:

- Rhino currently has legacy web properties and The Gem Shop pages with analytics/app scripts. A Shopify migration could double-count or lose data.

Scope:

- Define desired GA4, Google Ads, Meta, Shopify Analytics, Search Console, consent, and event model.

Acceptance criteria:

- Legacy analytics IDs are identified and either retired or mapped.
- Purchase, add-to-cart, search, product view, and lead/contact events have one owner each.
- Test orders or preview events verify event firing without duplicate purchase events.

### A-022 Verify domain, DNS, and HTTPS launch requirements

Priority: P0
Size: M
Labels: `type: discovery`, `area: release`, `area: seo`

Problem:

- From this workstation, direct HTTPS requests to `www.rhinolapidary.com` failed while HTTP returned a Cloudflare/Weebly site. Launch depends on clean DNS and TLS.

Scope:

- Audit current DNS, Cloudflare/Weebly configuration, Shopify domain setup, redirects, canonical host, and SSL status.

Acceptance criteria:

- Root and `www` host strategy is documented.
- HTTP redirects to HTTPS on the canonical Shopify domain.
- Shopify domain verification and SSL status are confirmed.
- Legacy Weebly routes have a redirect plan.

### A-023 Create redirect and URL migration architecture

Priority: P1
Size: M
Labels: `type: discovery`, `area: seo`, `area: release`

Problem:

- Rhino currently has Weebly URLs and The Gem Shop URLs for overlapping products. Migration can create SEO duplication or broken links.

Scope:

- Inventory old Rhino URLs, The Gem Shop Rhino collection/product URLs, target Shopify URLs, canonical strategy, and redirect ownership.

Acceptance criteria:

- Redirect map includes homepage, shop, category, product, policy, about, contact, and educational URLs.
- Duplicated product copy between Rhino and The Gem Shop has a canonical decision.
- Launch checklist includes redirect import and spot checks.

### A-024 Define admin dependency register

Priority: P0
Size: M
Labels: `type: docs`, `area: shopify-admin`

Problem:

- Many storefront features depend on Shopify admin configuration not visible in the repo.

Scope:

- Create a register for products, collections, menus, markets, policies, shipping, app embeds, pixels, metafields, metaobjects, Search and Discovery, customer accounts, and checkout settings.

Acceptance criteria:

- Every admin dependency has owner, location, purpose, verification method, and release impact.
- Dependencies are linked from related PBIs.
- Unknown admin states are tracked as discovery tasks instead of assumptions.

### A-025 Define browser and device support baseline

Priority: P1
Size: S
Labels: `type: docs`, `area: qa`

Problem:

- No supported browser/device baseline exists.

Scope:

- Define desktop and mobile browser targets, minimum viewport widths, assistive technology considerations, and Shopify-supported browser assumptions.

Acceptance criteria:

- QA matrix includes mobile Safari, mobile Chrome, desktop Chrome, desktop Safari, desktop Edge, and relevant tablet viewports.
- The matrix identifies key journeys for each device class.
- Browser support is linked from test plans.

### A-026 Establish accessibility baseline

Priority: P0
Size: M
Labels: `type: test`, `area: accessibility`

Problem:

- No accessibility baseline or regression process exists.

Scope:

- Define WCAG target, manual keyboard checks, automated axe/Lighthouse checks, color contrast rules, form validation rules, and component-specific focus behavior.

Acceptance criteria:

- Baseline covers header/mega menu, predictive search, collection filters, product media gallery, quick-order list, cart notification/drawer, contact form, and account pages.
- Automated checks run on representative templates.
- Manual checklist is documented for release.

### A-027 Establish performance budget

Priority: P0
Size: M
Labels: `type: test`, `area: performance`

Problem:

- There is no performance budget for a theme that may add product media, videos, apps, and custom sections.

Scope:

- Define budgets for Lighthouse metrics, JS/CSS weight, image weight, app/script count, lazy loading, and critical template performance.

Acceptance criteria:

- Budgets cover homepage, collection, product, search, cart, and contact pages.
- App additions must include performance review.
- Release checklist includes performance smoke tests.

### A-028 Add storefront smoke tests

Priority: P1
Size: L
Labels: `type: test`, `area: qa`

Problem:

- No automated storefront smoke test exists.

Scope:

- Use Playwright or an agreed equivalent to test core pages and interactions against a preview theme.

Acceptance criteria:

- Smoke tests cover home, collection, search, product, quick order/add to cart, cart, contact, customer login, and policy pages.
- Tests use stable fixture handles documented in the repo.
- Tests can run locally and in CI against a preview URL.

### A-029 Add visual regression testing strategy

Priority: P2
Size: L
Labels: `type: test`, `area: qa`, `area: design-system`

Problem:

- A distinctive storefront will need visual guardrails, especially when applying upstream Trade updates.

Scope:

- Define screenshot baselines for key templates and critical responsive states.

Acceptance criteria:

- Baselines cover desktop and mobile viewports.
- Tests include header/menu, homepage, collection filters, product page, quick-order table, cart, and contact page.
- Visual diffs are reviewed before release.

### A-030 Define fixture data for tests and previews

Priority: P1
Size: M
Labels: `type: docs`, `area: qa`, `area: shopify-admin`

Problem:

- Automated testing needs stable products, collections, and pages that may not exist yet in the Shopify admin.

Scope:

- Define required fixture handles for a machine, consumable, replacement part, collection, search query, page, and cart scenario.

Acceptance criteria:

- Fixture records are listed with required attributes and admin owner.
- Tests do not depend on random live products.
- Fixture data avoids destructive production changes.

### A-031 Create cart and quick-order architecture note

Priority: P0
Size: M
Labels: `type: docs`, `area: theme-architecture`, `area: cart`

Problem:

- Cart behavior spans Shopify standard events, a standard actions override, cart notification/drawer scripts, and quick-order Liquid/JS.

Scope:

- Document how cart state changes flow through the theme and which components must refresh.

Acceptance criteria:

- Note explains `layout/theme.liquid` script loading, `assets/standard-actions-override.js`, cart notification, cart drawer, and quick-order list interactions.
- Note identifies dependencies on section IDs, custom elements, and pub/sub events.
- Note includes a test matrix for add, update, remove, quick order, cart notification, drawer mode, and cart page.

Evidence:

- `layout/theme.liquid:32-60`
- `assets/standard-actions-override.js:19-142`

### A-032 Verify cart type strategy

Priority: P1
Size: M
Labels: `type: discovery`, `area: cart`, `area: ux`

Problem:

- Current settings use cart notification, while cart drawer code and override support drawer behavior.

Scope:

- Decide whether Rhino should use cart notification, drawer, page-only cart, or different behavior by purchase journey.

Acceptance criteria:

- Decision accounts for expensive machinery, quick reorder, mobile usability, freight messages, and warranty/support reassurance.
- Cart type is validated in preview.
- Required theme and admin settings are documented.

Evidence:

- `config/settings_data.json`
- `layout/theme.liquid:330`

### A-033 Verify product template purchase architecture

Priority: P0
Size: M
Labels: `type: discovery`, `area: product-page`, `area: cart`

Problem:

- `templates/product.json` lacks standard `variant_picker` and `buy_buttons` blocks, while relying on quick-order list and stock tabs.

Scope:

- Verify expected product-page buying behavior for machines, parts, and consumables in a preview theme.

Acceptance criteria:

- A user can add a simple product, multi-variant product, and expensive machine to cart from product pages or an intentional alternative path.
- If quick-order is the intended purchase path, that decision is documented and tested on mobile.
- If standard buy buttons are needed, a follow-up implementation PBI is created.

Evidence:

- `templates/product.json:21-117`
- `sections/main-product.liquid`

### A-034 Create product template architecture decision record

Priority: P1
Size: M
Labels: `type: docs`, `area: product-page`

Problem:

- Machines, accessories, consumables, replacement parts, manuals, and support content likely need different product page structures.

Scope:

- Decide product template types and the data model each requires.

Acceptance criteria:

- ADR defines at least machine, consumable, replacement part, accessory, and digital/support content template needs.
- ADR states which content belongs in theme settings, product metafields, metaobjects, product descriptions, or pages.
- ADR names required admin dependencies.

### A-035 Create collection and filtering architecture decision record

Priority: P1
Size: M
Labels: `type: docs`, `area: search-discovery`

Problem:

- Stock collection/search filtering is available, but Rhino needs technical product-discovery filters.

Scope:

- Define filter strategy for machine family, compatibility, application, grit, diameter, arbor size, voltage, consumable type, availability, price, and support status.

Acceptance criteria:

- ADR distinguishes Shopify product type, category, tags, variants, metafields, and Search and Discovery filters.
- ADR identifies which filters are customer-facing and which are admin-only.
- ADR includes Search and Discovery configuration dependencies.

Evidence:

- Shopify filter docs: https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-filters

### A-036 Document Search and Discovery dependency

Priority: P1
Size: M
Labels: `type: discovery`, `area: search-discovery`, `area: shopify-admin`

Problem:

- Search, recommendations, product boosts, synonyms, and filters are partly admin/app controlled.

Scope:

- Inspect or request inspection of Shopify Search and Discovery configuration.

Acceptance criteria:

- Current filters, synonyms, recommendations, product boosts, and analytics are documented.
- Gaps for Rhino-specific terminology and compatibility discovery are listed.
- Free Shopify-native Search and Discovery is evaluated before paid search/filter apps.

Evidence:

- Shopify Search and Discovery app listing: https://apps.shopify.com/search-and-discovery

### A-037 Define metafield and metaobject architecture

Priority: P0
Size: L
Labels: `type: docs`, `area: data-model`, `area: shopify-admin`

Problem:

- Product compatibility, specifications, warranty notes, freight requirements, included parts, manuals, and setup guidance are not modeled in the repo.

Scope:

- Define a first-pass Shopify data model for Rhino products.

Acceptance criteria:

- Data model identifies product metafields, variant metafields, collection metafields, metaobjects, and page/blog usage.
- Required fields include machine family, compatible machines, application, dimensions, voltage, motor specs, included accessories, consumable specs, manuals, videos, freight class/notes, warranty summary, replacement part relationships, and support notes where applicable.
- Data model avoids using tags for structured data when metafields are more appropriate.

### A-038 Create navigation architecture decision record

Priority: P1
Size: M
Labels: `type: docs`, `area: navigation`, `area: shopify-admin`

Problem:

- Header uses admin `main-menu`, but Rhino purchase journeys require intentional navigation.

Scope:

- Define desired menu structure for new users, experienced users, existing owners, support, education, wholesale/institutional buyers, and international visitors.

Acceptance criteria:

- ADR distinguishes global nav, mega menu, footer nav, utility links, support links, and account links.
- Admin menu dependencies are documented.
- Navigation avoids mixing The Gem Shop and Rhino identity without explanation.

### A-039 Define locale and internationalization strategy

Priority: P2
Size: M
Labels: `type: docs`, `area: localization`, `area: shopify-admin`

Problem:

- Trade includes many locale files and country/language selectors are enabled, but actual international availability, voltage, shipping, and support are unknown.

Scope:

- Decide supported languages, markets, currencies, international messaging, and translation ownership.

Acceptance criteria:

- Enabled selectors match actual Markets configuration.
- International buyers see clear voltage, shipping, customs, warranty, and regional support guidance.
- Locale file changes are owned and reviewed.

### A-040 Create design token inventory and governance

Priority: P1
Size: M
Labels: `type: docs`, `area: design-system`

Problem:

- Current colors and fonts are settings, not a governed design system.

Scope:

- Inventory existing colors, typography, spacing, radii, shadows, buttons, badges, forms, and product card styles.

Acceptance criteria:

- Tokens are documented with current value, source, usage, and proposed Rhino role.
- Decisions distinguish existing Trade defaults from Rhino brand proposals.
- Token changes require preview screenshots and accessibility checks.

Evidence:

- `config/settings_data.json`
- `config/settings_schema.json`

### A-041 Define CSS architecture for Rhino customizations

Priority: P1
Size: M
Labels: `type: docs`, `area: css`, `area: theme-architecture`

Problem:

- Before adding Rhino visual design, the project needs a clear place and naming pattern for custom CSS.

Scope:

- Decide whether to extend existing section/component CSS files or create Rhino-specific CSS entrypoints.

Acceptance criteria:

- CSS architecture identifies global tokens, components, sections, templates, and one-off exceptions.
- Naming guidance avoids collisions with upstream Trade.
- CSS changes can be reviewed separately from upstream code when practical.

### A-042 Audit duplicate and dead CSS/JS assets

Priority: P2
Size: M
Labels: `type: discovery`, `area: performance`, `area: technical-debt`

Problem:

- The asset folder includes many stock files, and future work should not accumulate unused CSS/JS.

Scope:

- Create a referenced/unreferenced asset inventory for CSS, JS, images, SVGs, and GIFs.

Acceptance criteria:

- Every asset is categorized as referenced, app/platform required, stock but unused, Rhino candidate, or removal candidate.
- No asset is removed until preview testing confirms it is unused.
- Removal candidates are converted into implementation PBIs.

### A-043 Audit stock icon and illustration assets

Priority: P2
Size: S
Labels: `type: discovery`, `area: design-system`, `area: performance`

Problem:

- The repo carries stock icons that do not fit lapidary machinery.

Scope:

- Identify irrelevant food, apparel, beauty, and generic stock icons and define what technical icons Rhino actually needs.

Acceptance criteria:

- Irrelevant stock assets are listed.
- Required Rhino icon categories are proposed, such as warranty, freight, voltage, water, grit, arbor, diameter, compatibility, manual, support, and replacement part.
- Implementation/removal is deferred to future PBIs.

### A-044 Define JavaScript architecture and event contracts

Priority: P1
Size: M
Labels: `type: docs`, `area: javascript`, `area: theme-architecture`

Problem:

- JS behavior spans stock Trade, Shopify standard events, cart overrides, quick order, predictive search, facets, and product media.

Scope:

- Document where JavaScript lives, what custom elements exist, what global objects are expected, and how new JS should be added.

Acceptance criteria:

- Architecture note lists key JS assets and their owned templates/sections.
- It documents event contracts for cart, product forms, predictive search, facets, and quick-order behavior.
- It includes guidance for avoiding brittle DOM selectors when custom Rhino JS is added.

### A-045 Create a Custom Liquid and app embed guardrail

Priority: P1
Size: S
Labels: `type: docs`, `area: apps`, `area: shopify-admin`

Problem:

- Custom Liquid and app embeds can bypass repository review.

Scope:

- Define when Custom Liquid is allowed, who approves it, and how it is documented.

Acceptance criteria:

- Every Custom Liquid block in production has a corresponding register entry.
- App embeds and Custom Liquid have owner, purpose, code/source, and rollback path.
- Release checklist requires review of changed app embeds/custom Liquid.

### A-046 Create media asset source-of-truth rules

Priority: P1
Size: M
Labels: `type: docs`, `area: media`, `area: shopify-admin`

Problem:

- Product and brand media live outside the repo or in Shopify Files; the repo does not define ownership, naming, dimensions, or licensing.

Scope:

- Define how machine photos, diagrams, videos, manuals, icons, and illustrations are stored, named, optimized, and referenced.

Acceptance criteria:

- Media policy distinguishes repo assets, Shopify Files, product media, YouTube/Vimeo embeds, and downloadable files.
- Policy includes alt text, dimensions, compression, file naming, and licensing checks.
- EM-1/Rhino current media is inventoried before migration.

### A-047 Define structured data and SEO architecture

Priority: P1
Size: M
Labels: `type: docs`, `area: seo`, `area: data-model`

Problem:

- Trade has stock product and organization structured data, but Rhino migration needs URL, canonical, product, video, FAQ, breadcrumb, and organization clarity.

Scope:

- Audit current structured data and define future SEO architecture.

Acceptance criteria:

- Existing JSON-LD locations are inventoried.
- Organization identity clarifies Rhino, The Gem Shop, and Silica-Gem roles.
- Product schema data requirements are mapped to Shopify fields/metafields.
- Redirect/canonical decisions are linked.

Evidence:

- `sections/header.liquid`
- `sections/main-product.liquid`
- `snippets/meta-tags.liquid`

### A-048 Create security and privacy review checklist

Priority: P1
Size: M
Labels: `type: docs`, `area: privacy`, `area: apps`

Problem:

- App scripts, pixels, customer events, forms, and third-party embeds can affect privacy and compliance.

Scope:

- Create a checklist for third-party scripts, app permissions, customer data, consent mode, forms, embedded videos, and analytics.

Acceptance criteria:

- Checklist is used before installing apps or enabling embeds.
- It documents data collected, vendor, consent behavior, retention, and removal.
- It is linked from app dependency policy and release checklist.

### A-049 Define Shopify admin access and permissions policy

Priority: P1
Size: S
Labels: `type: docs`, `area: shopify-admin`, `area: security`

Problem:

- Theme work often requires admin access, but no access policy is documented.

Scope:

- Define who needs store admin access, theme permissions, app permissions, product/content permissions, and production publish authority.

Acceptance criteria:

- Access levels are mapped to roles.
- Least-privilege expectations are documented.
- User and permission review is included in the admin checklist.

### A-050 Document policy, notification, and support content dependencies

Priority: P1
Size: M
Labels: `type: discovery`, `area: shopify-admin`, `area: support`

Problem:

- Warranty, returns, freight, damage claims, support, repairs, and post-purchase guidance are central to Rhino trust but mostly admin/content dependent.

Scope:

- Inventory where policy and support content should live: Shopify policies, pages, email notifications, product metafields, metaobjects, and theme sections.

Acceptance criteria:

- Current Rhino policy content is mapped to Shopify admin destinations.
- Legal review owner is identified.
- Notification templates that need warranty/freight/support language are listed.
- Future implementation PBIs are created for theme display needs.

Evidence:

- http://www.rhinolapidary.com/policies-and-procedures.html

### A-051 Establish product data quality gates

Priority: P0
Size: M
Labels: `type: docs`, `area: data-model`, `area: shopify-admin`

Problem:

- Product discovery and trust depend on clean product data, but there are no gates for required fields.

Scope:

- Define required product, variant, media, metafield, and shipping data for each product class.

Acceptance criteria:

- Product classes include machines, consumables, accessories, replacement parts, manuals/downloads, and support items if applicable.
- Required fields include SKU, inventory policy, dimensions/weight, shipping/freight notes, compatibility, media, warranty summary, and support contact where relevant.
- Launch checklist blocks production if high-value machine products lack required data.

### A-052 Create a Shopify admin discovery checklist issue

Priority: P0
Size: S
Labels: `type: discovery`, `area: shopify-admin`

Problem:

- Admin configuration cannot be inferred safely from the repository.

Scope:

- Create a GitHub issue or checklist to inspect all admin areas listed in this document.

Acceptance criteria:

- Checklist includes products, variants, categories, collections, product types, vendors, tags, metafields, metaobjects, navigation, markets, domains, customer accounts, checkout, shipping profiles, package settings, local pickup, taxes, policies, notifications, discounts, gift cards, files, blog posts, Search and Discovery, app embeds, installed apps, pixels/customer events, analytics, consent/privacy, Google/social sales channels, Shop channel, email configuration, forms, automations, redirects, and users/permissions.
- Each admin area has owner, current-state notes, risk rating, and follow-up PBIs.

### A-053 Define backup and rollback procedures

Priority: P0
Size: M
Labels: `type: docs`, `area: release`

Problem:

- Shopify theme changes and admin settings can be difficult to roll back if not backed up intentionally.

Scope:

- Define how and when to duplicate themes, export theme files, back up settings, and roll back a failed publish.

Acceptance criteria:

- Procedure covers code rollback and admin/theme-editor rollback.
- Procedure is executable by a developer who did not perform the original release.
- Release checklist requires proof of backup before publish.

### A-054 Create a production launch readiness gate

Priority: P0
Size: M
Labels: `type: docs`, `area: release`, `area: qa`

Problem:

- A stock-looking theme could be accidentally launched before core customer trust, policy, product data, and checkout dependencies are ready.

Scope:

- Define minimum launch gates for placeholder content, product purchase paths, support/warranty/policy content, freight/shipping configuration, redirects, analytics, accessibility, performance, and mobile QA.

Acceptance criteria:

- Launch readiness checklist is separate from routine release checklist.
- Checklist explicitly blocks launch if stock Trade placeholders remain.
- Checklist requires sign-off from business/admin, engineering, and support stakeholders.

### A-055 Create architecture decision log

Priority: P2
Size: S
Labels: `type: docs`, `area: theme-architecture`

Problem:

- Many upcoming decisions will affect long-term maintainability.

Scope:

- Add a lightweight ADR directory and template.

Acceptance criteria:

- Template includes context, decision, alternatives considered, consequences, owner, and review date.
- First ADRs cover upstream Trade strategy, settings ownership, product templates, filtering/data model, cart strategy, and app policy.

### A-056 Define documentation index and ownership

Priority: P2
Size: S
Labels: `type: docs`, `area: repository`

Problem:

- As documentation grows, it needs an index and owners.

Scope:

- Create a docs index that links workflow, release, admin dependencies, app register, ADRs, test plans, and brand/design-system docs.

Acceptance criteria:

- New contributors can find the right document from README.
- Each document has owner and last reviewed date.
- Stale docs have a review cadence.

### A-057 Create a known stock Trade remnants ledger

Priority: P1
Size: M
Labels: `type: discovery`, `area: content`, `area: design-system`

Problem:

- Stock Trade remnants undermine the goal of a distinctive Rhino storefront.

Scope:

- Inventory generic copy, stock icons, placeholder images, default headings, demo link lists, demo sections, and non-Rhino tone.

Acceptance criteria:

- Each remnant has file/admin location, severity, customer impact, and owner.
- Ledger distinguishes code-repo remnants from theme-editor/admin content.
- Future brand/content PBIs can draw directly from the ledger.

### A-058 Create a Rhino custom section/block strategy

Priority: P1
Size: M
Labels: `type: docs`, `area: theme-architecture`, `area: design-system`

Problem:

- Rhino will likely need reusable sections for machine specs, compatibility, included parts, videos, support promises, freight, and education. Without a strategy, one-off sections can accumulate.

Scope:

- Define when to create new sections/blocks versus using Trade sections, product metafields, metaobjects, or custom Liquid.

Acceptance criteria:

- Strategy defines section naming, schema setting conventions, block patterns, content source rules, and reuse expectations.
- It includes guidance for machine-specific versus ecosystem-wide sections.
- It avoids hardcoding product data that belongs in admin/metafields.

### A-059 Define hardcoded string and locale strategy

Priority: P2
Size: M
Labels: `type: docs`, `area: localization`, `area: theme-architecture`

Problem:

- Future custom sections may hardcode customer-facing strings and make localization/admin editing harder.

Scope:

- Decide which strings belong in locale files, section settings, product data, or hardcoded code.

Acceptance criteria:

- New reusable sections use locale entries or settings where appropriate.
- Admin-editable marketing/support content is not buried in Liquid.
- Locale strategy aligns with the internationalization decision.

### A-060 Audit generated and local-only files before first production push

Priority: P1
Size: S
Labels: `type: discovery`, `area: repository`, `area: release`

Problem:

- The repository already contains local IDE files, and future tests/docs may create artifacts that should not upload to Shopify.

Scope:

- Audit tracked files and ignored files before first production publish.

Acceptance criteria:

- Tracked files are limited to intentional source and documentation.
- Generated screenshots, reports, logs, node/vendor folders, local configs, and editor files are ignored or removed from tracking.
- The audit result is recorded in release notes.

