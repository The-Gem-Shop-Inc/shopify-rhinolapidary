# Rhino Stock Icon Asset Audit

**PBI:** B-011
**Generated from:** repository source audit
**Audit date:** 2026-08-04
**Ledger:** [data/stock-asset-ledger.json](../../data/stock-asset-ledger.json)
**Icon governance:** [rhino-icon-system.md](rhino-icon-system.md)
**Media governance:** [media-asset-source-of-truth.md](../media/media-asset-source-of-truth.md)

This report records the B-011 icon-specific rationale and dynamic-reference evidence that the current stock asset ledger schema cannot represent directly. The ledger keeps its existing schema and maps the B-011 dispositions to the closest allowed `decision` value.

## Implementation Update

On 2026-08-04, the first production-ready repository-owned Rhino icon set was
implemented for future Rhino components:

- 34 assets named `assets/rhino-icon-{name}.svg`
- `snippets/rhino-icon.liquid` as the explicit-name render path
- `data/media-manifest.json` records for the new Rhino-owned SVG assets
- `scripts/validate-rhino-icons.js` as the automated icon contract test

Existing Shopify Trade icons, dynamic `icon-accordion` options, and source SVGs
were not replaced or deleted. The stock icon replacement work remains a
surface-by-surface migration task.

## Scope

- Scanned 287 Liquid, JSON, CSS, and JavaScript files under `assets`, `blocks`, `config`, `layout`, `locales`, `sections`, `snippets`, `templates`, and `data`.
- Inventoried 85 stock icon assets: 83 `icon*.svg` files plus `loading-spinner.svg` and `square.svg`.
- Added 4 non-icon stock visual remnants to the stock asset ledger for register completeness; these are excluded from icon counts.
- Did not edit Shopify product records, handles, source SVG/GIF assets, or `data/media-manifest.json`.
- Replaced the obsolete starter ledger row for `assets/icon.svg`; that file does not exist in the repository.

## Summary

| Metric | Count |
|---|---:|
| Total icon assets | 85 |
| Referenced icons | 85 |
| Icons with direct inline references | 42 |
| Icons with dynamic schema references | 43 |
| Icons with CSS or URL selector dependencies | 16 |
| Unreferenced upstream icon assets | 0 |
| Replacement candidates | 43 |
| Assets safe to retire | 0 |

## Disposition Mapping

| B-011 disposition | Ledger `decision` | Use in this audit |
|---|---|---|
| `retain` | `keep` | Not used; no inventoried icon is final Rhino-owned artwork. |
| `retain_as_upstream` | `keep` | Inherited Trade utility, state, media-control, social, and form-control icons. |
| `replace_when_touched` | `replace` | Dynamic Trade product icons and non-icon stock visuals that should remain until their owning surface is touched. |
| `rhino_replacement_planned` | `replace` | Dynamic Trade product icons currently standing in for launch-critical Rhino semantic icons. |
| `unreferenced_upstream_asset` | `review` | Not used; every stock icon is directly or dynamically referenced. |
| `retire` | `remove` | Not used; no stock icon is safe to retire while direct and dynamic references remain. |

## Dynamic Reference Evidence

The dynamic renderer builds asset names from settings values with `icon | replace: '_', '-' | prepend: 'icon-' | append: '.svg'`. These dynamic references are treated as active references even when no literal filename appears in a template.

- Renderer: `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`
- Render call sites: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- Dynamic option schemas: `sections/collapsible-content.liquid:302-477`; `sections/main-product.liquid:1024-1199`, `sections/main-product.liquid:1269-1444`, `sections/main-product.liquid:1545-1720`, `sections/main-product.liquid:1745-1920`, `sections/main-product.liquid:1945-2120`

## Launch-Critical Rhino Icon Gaps Found During Source Audit

| Category | Gap |
|---|---|
| Product classification | No final Rhino-owned icon assets exist for machine, replacement part, accessory, consumable, manual/document, or kit/bundle. `assets/icon-box.svg` and `assets/icon-clipboard.svg` are only upstream placeholders. |
| Technical information | No final Rhino-owned icon assets exist for motor/power, speed, diameter, arbor, grit, dimensions, weight, water, blade, wheel/disc, included component, or optional component. `assets/icon-lightning-bolt.svg`, `assets/icon-ruler.svg`, and `assets/icon-stopwatch.svg` are only upstream placeholders for part of this set. |
| Compatibility and ownership | No final Rhino-owned icon assets exist for compatible, not compatible, machine family, replacement, installed-on-machine, or multiple-machine compatibility states. `assets/icon-check-mark.svg` is only an upstream placeholder and must not imply compatibility without structured data. |
| Delivery and support | No final Rhino-owned icon assets exist for freight, parcel delivery, pickup, international review, warranty, support, repair, replacement parts, shipping damage, return, or documentation. `assets/icon-truck.svg`, `assets/icon-plane.svg`, `assets/icon-map-pin.svg`, `assets/icon-return.svg`, and `assets/icon-chat-bubble.svg` are only upstream placeholders. |
| Machine family concepts | No final Rhino-owned family icon files exist for EM-1, BeadMaster, ShapeMaster, TrimMaster, LapMaster, SawMaster, or JadeMaster. TumbleMaster remains unavailable and has no storefront icon requirement. |

## Issues and Ambiguities

- Some `inline_asset_content` references omit the `.svg` extension. They are preserved as recorded and were not changed in this audit:
  - `assets/icon-3d-model.svg`: `snippets/product-media.liquid:113 (icon-3d-model)`
  - `assets/icon-3d-model.svg`: `snippets/product-media.liquid:57 (icon-3d-model)`
  - `assets/icon-error.svg`: `sections/main-password-header.liquid:84 (icon-error)`
- The source audit originally found no repository-owned final Rhino icon assets. The implementation update above supersedes that gap for future Rhino components, but existing Trade product icon options remain in place until their owning surfaces are redesigned.
- Dynamic product icon options are broad Shopify Trade defaults and include food, apparel, beauty, pet, and generic lifestyle concepts that do not fit Rhino lapidary semantics. They remain referenced by schema until product block icon options are redesigned.

## Icon Inventory

### assets/icon-3d-model.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `snippets/product-media-gallery.liquid:168`, `snippets/product-media-gallery.liquid:277`, `snippets/product-media.liquid:113`, `snippets/product-media.liquid:57`, `snippets/product-thumbnail.liquid:114`, `snippets/product-thumbnail.liquid:163`, `snippets/product-thumbnail.liquid:71`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/section-main-product.css:1123`, `assets/section-main-product.css:1148`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-account.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/header.liquid:263`, `sections/header.liquid:267`, `sections/main-account.liquid:22`, `snippets/header-drawer.liquid:151`, `snippets/header-drawer.liquid:157`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-apple.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:309`, `sections/main-product.liquid:1031`, `sections/main-product.liquid:1276`, `sections/main-product.liquid:1552`, `sections/main-product.liquid:1752`, `sections/main-product.liquid:1952`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-arrow.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/announcement-bar.liquid:105`, `sections/announcement-bar.liquid:45`, `sections/email-signup-banner.liquid:110`, `sections/featured-product.liquid:474`, `sections/footer.liquid:208`, `sections/main-article.liquid:89`, `sections/main-product.liquid:696`, `sections/multicolumn.liquid:139`, `sections/newsletter.liquid:89`, `sections/predictive-search.liquid:237`, `snippets/card-collection.liquid:102`, `snippets/card-collection.liquid:111`, `snippets/card-collection.liquid:138`, `snippets/card-collection.liquid:147`, `snippets/card-collection.liquid:161`, `snippets/card-product.liquid:316`, `snippets/card-product.liquid:510`, `snippets/facets.liquid:537`, `snippets/facets.liquid:550`, `snippets/facets.liquid:679`, `snippets/facets.liquid:692`, `snippets/header-drawer.liquid:34`, `snippets/header-drawer.liquid:48`, `snippets/header-drawer.liquid:74`, `snippets/header-drawer.liquid:89`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/base.css:2254`, `assets/base.css:633`, `assets/base.css:637`, `assets/base.css:638`, `assets/base.css:643`, `assets/base.css:648`, `assets/component-facets.css:920`, `assets/component-predictive-search.css:213`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-banana.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:313`, `sections/main-product.liquid:1035`, `sections/main-product.liquid:1280`, `sections/main-product.liquid:1556`, `sections/main-product.liquid:1756`, `sections/main-product.liquid:1956`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-bottle.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:317`, `sections/main-product.liquid:1039`, `sections/main-product.liquid:1284`, `sections/main-product.liquid:1560`, `sections/main-product.liquid:1760`, `sections/main-product.liquid:1960`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-box.svg

- Disposition: `rhino_replacement_planned`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:321`, `sections/main-product.liquid:1043`, `sections/main-product.liquid:1288`, `sections/main-product.liquid:1564`, `sections/main-product.liquid:1764`, `sections/main-product.liquid:1964`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Product classification, kit/bundle, and parcel/package semantics need Rhino-specific treatment.

### assets/icon-caret.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/announcement-bar.liquid:124`, `sections/announcement-bar.liquid:69`, `sections/collapsible-content.liquid:88`, `sections/collection-list.liquid:109`, `sections/collection-list.liquid:93`, `sections/featured-blog.liquid:150`, `sections/featured-blog.liquid:166`, `sections/featured-collection.liquid:177`, `sections/featured-collection.liquid:194`, `sections/main-account.liquid:101`, `sections/main-account.liquid:129`, `sections/main-addresses.liquid:115`, `sections/main-addresses.liquid:129`, `sections/main-addresses.liquid:278`, `sections/main-addresses.liquid:294`, `sections/main-addresses.liquid:345`, `sections/main-addresses.liquid:373`, `sections/main-collection-product-grid.liquid:74`, `sections/main-product.liquid:223`, `sections/main-product.liquid:569`, `sections/main-product.liquid:637`, `sections/main-product.liquid:671`, `sections/main-search.liquid:180`, `sections/multicolumn.liquid:157`, `sections/multicolumn.liquid:171`, `sections/slideshow.liquid:203`, `sections/slideshow.liquid:238`, `sections/slideshow.liquid:44`, `sections/slideshow.liquid:79`, `snippets/cart-drawer.liquid:496`, `snippets/country-localization.liquid:41`, `snippets/facets.liquid:159`, `snippets/facets.liquid:315`, `snippets/facets.liquid:419`, `snippets/facets.liquid:752`, `snippets/facets.liquid:859`, `snippets/header-drawer.liquid:37`, `snippets/header-drawer.liquid:77`, `snippets/header-dropdown-menu.liquid:26`, `snippets/header-dropdown-menu.liquid:54`, `snippets/header-mega-menu.liquid:26`, `snippets/language-localization.liquid:17`, `snippets/pagination.liquid:28`, `snippets/pagination.liquid:70`, `snippets/product-disclosures.liquid:98`, `snippets/product-media-gallery.liquid:136`, `snippets/product-media-gallery.liquid:152`, `snippets/product-media-gallery.liquid:197`, `snippets/product-media-gallery.liquid:327`, `snippets/product-variant-picker.liquid:90`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/base.css:2836`, `assets/base.css:2889`, `assets/base.css:2893`, `assets/base.css:672`, `assets/component-accordion.css:13`, `assets/component-accordion.css:45`, `assets/component-cart-drawer.css:329`, `assets/component-disclosures.css:137`, `assets/component-disclosures.css:148`, `assets/component-disclosures.css:158`, `assets/component-facets.css:1046`, `assets/component-facets.css:1084`, `assets/component-facets.css:118`, `assets/component-facets.css:1218`, `assets/component-facets.css:263`, `assets/component-facets.css:935`, `assets/component-facets.css:98`, `assets/component-localization-form.css:336`, `assets/component-localization-form.css:409`, `assets/component-localization-form.css:79`, `assets/component-menu-drawer.css:124`, `assets/component-pagination.css:42`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-carrot.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:325`, `sections/main-product.liquid:1047`, `sections/main-product.liquid:1292`, `sections/main-product.liquid:1568`, `sections/main-product.liquid:1768`, `sections/main-product.liquid:1968`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-cart-empty.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/cart-icon-bubble.liquid:2`, `sections/header.liquid:290`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-cart.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/cart-icon-bubble.liquid:4`, `sections/header.liquid:292`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-chat-bubble.svg

- Disposition: `rhino_replacement_planned`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:329`, `sections/main-product.liquid:1051`, `sections/main-product.liquid:1296`, `sections/main-product.liquid:1572`, `sections/main-product.liquid:1772`, `sections/main-product.liquid:1972`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Support and repair communication need Rhino-specific service iconography.

### assets/icon-check-mark.svg

- Disposition: `rhino_replacement_planned`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:333`, `sections/main-product.liquid:1055`, `sections/main-product.liquid:1300`, `sections/main-product.liquid:1576`, `sections/main-product.liquid:1776`, `sections/main-product.liquid:1976`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Compatibility, included component, and positive confirmation states require structured-data-safe Rhino treatment.

### assets/icon-checkmark.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `snippets/cart-notification.liquid:24`, `snippets/country-localization.liquid:112`, `snippets/country-localization.liquid:141`, `snippets/facets.liquid:274`, `snippets/facets.liquid:643`, `snippets/gift-card-recipient-form.liquid:28`, `snippets/language-localization.liquid:38`, `snippets/quick-order-list.liquid:160`, `snippets/quick-order-list.liquid:252`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/component-cart-notification.css:79`, `assets/component-facets.css:1032`, `assets/component-facets.css:1041`, `assets/component-facets.css:529`, `assets/component-facets.css:539`, `assets/component-localization-form.css:324`, `assets/section-main-product.css:1432`, `assets/section-main-product.css:1442`, `assets/section-main-product.css:1491`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-clipboard.svg

- Disposition: `rhino_replacement_planned`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:337`, `sections/main-product.liquid:1059`, `sections/main-product.liquid:1304`, `sections/main-product.liquid:1580`, `sections/main-product.liquid:1780`, `sections/main-product.liquid:1980`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Manual, document, documentation, and specification record semantics need Rhino-specific treatment.

### assets/icon-close-small.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `snippets/facets.liquid:103`, `snippets/facets.liquid:353`, `snippets/facets.liquid:369`, `snippets/facets.liquid:798`, `snippets/facets.liquid:815`, `snippets/facets.liquid:87`, `snippets/facets.liquid:911`, `snippets/facets.liquid:928`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/base.css:2961`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-close.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/collage.liquid:182`, `sections/main-cart-items.liquid:383`, `sections/main-password-header.liquid:43`, `sections/main-password-header.liquid:56`, `sections/main-product.liquid:720`, `sections/pickup-availability.liquid:64`, `snippets/card-product.liquid:262`, `snippets/card-product.liquid:336`, `snippets/card-product.liquid:463`, `snippets/cart-disclosure-indicator.liquid:85`, `snippets/cart-drawer.liquid:42`, `snippets/cart-drawer.liquid:440`, `snippets/cart-drawer.liquid:73`, `snippets/cart-notification.liquid:33`, `snippets/country-localization.liquid:82`, `snippets/facets.liquid:474`, `snippets/header-drawer.liquid:16`, `snippets/header-search.liquid:102`, `snippets/header-search.liquid:23`, `snippets/product-media-modal.liquid:26`, `snippets/quick-order-list-row.liquid:242`, `snippets/share-button.liquid:41`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/base.css:2740`, `assets/base.css:2747`, `assets/component-localization-form.css:213`, `assets/component-search.css:61`, `assets/section-password.css:192`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-copy.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `snippets/share-button.liquid:47`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-dairy-free.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:345`, `sections/main-product.liquid:1067`, `sections/main-product.liquid:1312`, `sections/main-product.liquid:1588`, `sections/main-product.liquid:1788`, `sections/main-product.liquid:1988`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-dairy.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:341`, `sections/main-product.liquid:1063`, `sections/main-product.liquid:1308`, `sections/main-product.liquid:1584`, `sections/main-product.liquid:1784`, `sections/main-product.liquid:1984`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-discount.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-cart-footer.liquid:52`, `sections/main-cart-items.liquid:183`, `sections/main-order.liquid:227`, `sections/main-order.liquid:237`, `sections/main-order.liquid:99`, `snippets/cart-drawer.liquid:238`, `snippets/cart-drawer.liquid:520`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-dryer.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:349`, `sections/main-product.liquid:1071`, `sections/main-product.liquid:1316`, `sections/main-product.liquid:1592`, `sections/main-product.liquid:1792`, `sections/main-product.liquid:1992`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-error.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/contact-form.liquid:41`, `sections/contact-form.liquid:93`, `sections/email-signup-banner.liquid:117`, `sections/footer.liquid:215`, `sections/main-activate-account.liquid:28`, `sections/main-activate-account.liquid:66`, `sections/main-activate-account.liquid:92`, `sections/main-article.liquid:145`, `sections/main-article.liquid:207`, `sections/main-article.liquid:241`, `sections/main-article.liquid:273`, `sections/main-cart-items.liquid:412`, `sections/main-login.liquid:55`, `sections/main-login.liquid:88`, `sections/main-password-header.liquid:84`, `sections/main-register.liquid:124`, `sections/main-register.liquid:25`, `sections/main-register.liquid:99`, `sections/main-reset-password.liquid:29`, `sections/main-reset-password.liquid:67`, `sections/main-reset-password.liquid:93`, `sections/newsletter.liquid:96`, `snippets/buy-buttons.liquid:34`, `snippets/cart-drawer.liquid:471`, `snippets/gift-card-recipient-form.liquid:125`, `snippets/gift-card-recipient-form.liquid:165`, `snippets/gift-card-recipient-form.liquid:199`, `snippets/gift-card-recipient-form.liquid:39`, `snippets/gift-card-recipient-form.liquid:92`, `snippets/quick-order-list-row.liquid:318`, `snippets/quick-order-list-row.liquid:427`, `snippets/quick-order-list.liquid:296`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-eye.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:353`, `sections/main-product.liquid:1075`, `sections/main-product.liquid:1320`, `sections/main-product.liquid:1596`, `sections/main-product.liquid:1796`, `sections/main-product.liquid:1996`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-facebook.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-password-footer.liquid:19`, `snippets/header-drawer.liquid:213`, `snippets/social-icons.liquid:17`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-filter.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `snippets/facets.liquid:455`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-fire.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:357`, `sections/main-product.liquid:1079`, `sections/main-product.liquid:1324`, `sections/main-product.liquid:1600`, `sections/main-product.liquid:1800`, `sections/main-product.liquid:2000`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-gluten-free.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:361`, `sections/main-product.liquid:1083`, `sections/main-product.liquid:1328`, `sections/main-product.liquid:1604`, `sections/main-product.liquid:1804`, `sections/main-product.liquid:2004`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-hamburger.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `snippets/header-drawer.liquid:15`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/base.css:2741`, `assets/base.css:2751`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-heart.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:365`, `sections/main-product.liquid:1087`, `sections/main-product.liquid:1332`, `sections/main-product.liquid:1608`, `sections/main-product.liquid:1808`, `sections/main-product.liquid:2008`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-info.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-cart-items.liquid:245`, `sections/main-cart-items.liquid:330`, `snippets/cart-drawer.liquid:386`, `snippets/quick-order-list-row.liquid:209`, `snippets/quick-order-list-row.liquid:301`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-instagram.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-password-footer.liquid:39`, `snippets/header-drawer.liquid:233`, `snippets/social-icons.liquid:27`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-inventory-status.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-product.liquid:157`, `sections/main-product.liquid:169`, `sections/main-product.liquid:183`, `sections/main-product.liquid:188`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/section-main-product.css:1211`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-iron.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:369`, `sections/main-product.liquid:1091`, `sections/main-product.liquid:1336`, `sections/main-product.liquid:1612`, `sections/main-product.liquid:1812`, `sections/main-product.liquid:2012`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-leaf.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:373`, `sections/main-product.liquid:1095`, `sections/main-product.liquid:1340`, `sections/main-product.liquid:1616`, `sections/main-product.liquid:1816`, `sections/main-product.liquid:2016`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-leather.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:377`, `sections/main-product.liquid:1099`, `sections/main-product.liquid:1344`, `sections/main-product.liquid:1620`, `sections/main-product.liquid:1820`, `sections/main-product.liquid:2020`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-lightning-bolt.svg

- Disposition: `rhino_replacement_planned`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:381`, `sections/main-product.liquid:1103`, `sections/main-product.liquid:1348`, `sections/main-product.liquid:1624`, `sections/main-product.liquid:1824`, `sections/main-product.liquid:2024`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Voltage, motor, and power semantics need Rhino-specific technical iconography.

### assets/icon-lipstick.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:385`, `sections/main-product.liquid:1107`, `sections/main-product.liquid:1352`, `sections/main-product.liquid:1628`, `sections/main-product.liquid:1828`, `sections/main-product.liquid:2028`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-lock.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:389`, `sections/main-product.liquid:1111`, `sections/main-product.liquid:1356`, `sections/main-product.liquid:1632`, `sections/main-product.liquid:1832`, `sections/main-product.liquid:2032`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-map-pin.svg

- Disposition: `rhino_replacement_planned`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:393`, `sections/main-product.liquid:1115`, `sections/main-product.liquid:1360`, `sections/main-product.liquid:1636`, `sections/main-product.liquid:1836`, `sections/main-product.liquid:2036`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Pickup and local availability semantics need Rhino-specific delivery iconography.

### assets/icon-minus.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/featured-product.liquid:207`, `sections/main-cart-items.liquid:262`, `sections/main-product.liquid:272`, `snippets/cart-drawer.liquid:313`, `snippets/quantity-input.liquid:18`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-nut-free.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:397`, `sections/main-product.liquid:1119`, `sections/main-product.liquid:1364`, `sections/main-product.liquid:1640`, `sections/main-product.liquid:1840`, `sections/main-product.liquid:2040`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-padlock.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-password-header.liquid:37`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-pants.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:401`, `sections/main-product.liquid:1123`, `sections/main-product.liquid:1368`, `sections/main-product.liquid:1644`, `sections/main-product.liquid:1844`, `sections/main-product.liquid:2044`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-pause.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/slideshow.liquid:249`, `sections/slideshow.liquid:90`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/component-slideshow.css:163`, `assets/component-slideshow.css:196`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-paw-print.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:405`, `sections/main-product.liquid:1127`, `sections/main-product.liquid:1372`, `sections/main-product.liquid:1648`, `sections/main-product.liquid:1848`, `sections/main-product.liquid:2048`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-pepper.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:409`, `sections/main-product.liquid:1131`, `sections/main-product.liquid:1376`, `sections/main-product.liquid:1652`, `sections/main-product.liquid:1852`, `sections/main-product.liquid:2052`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-perfume.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:413`, `sections/main-product.liquid:1135`, `sections/main-product.liquid:1380`, `sections/main-product.liquid:1656`, `sections/main-product.liquid:1856`, `sections/main-product.liquid:2056`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-pinterest.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-password-footer.liquid:29`, `snippets/header-drawer.liquid:223`, `snippets/social-icons.liquid:67`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-plane.svg

- Disposition: `rhino_replacement_planned`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:417`, `sections/main-product.liquid:1139`, `sections/main-product.liquid:1384`, `sections/main-product.liquid:1660`, `sections/main-product.liquid:1860`, `sections/main-product.liquid:2060`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: International review semantics need Rhino-specific delivery iconography.

### assets/icon-plant.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:421`, `sections/main-product.liquid:1143`, `sections/main-product.liquid:1388`, `sections/main-product.liquid:1664`, `sections/main-product.liquid:1864`, `sections/main-product.liquid:2064`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-play.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/collage.liquid:136`, `sections/slideshow.liquid:252`, `sections/slideshow.liquid:93`, `sections/video.liquid:78`, `snippets/product-media-gallery.liquid:283`, `snippets/product-media.liquid:59`, `snippets/product-thumbnail.liquid:119`, `snippets/product-thumbnail.liquid:67`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/component-deferred-media.css:96`, `assets/component-slideshow.css:162`, `assets/component-slideshow.css:173`, `assets/component-slideshow.css:197`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-plus.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/featured-product.liquid:231`, `sections/main-cart-items.liquid:300`, `sections/main-product.liquid:296`, `snippets/card-product.liquid:384`, `snippets/cart-drawer.liquid:355`, `snippets/quantity-input.liquid:44`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/component-complementary-products.css:123`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-price-tag.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:425`, `sections/main-product.liquid:1147`, `sections/main-product.liquid:1392`, `sections/main-product.liquid:1668`, `sections/main-product.liquid:1868`, `sections/main-product.liquid:2068`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-question-mark.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:429`, `sections/main-product.liquid:1151`, `sections/main-product.liquid:1396`, `sections/main-product.liquid:1672`, `sections/main-product.liquid:1872`, `sections/main-product.liquid:2072`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-recycle.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:433`, `sections/main-product.liquid:1155`, `sections/main-product.liquid:1400`, `sections/main-product.liquid:1676`, `sections/main-product.liquid:1876`, `sections/main-product.liquid:2076`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-remove.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-cart-items.liquid:319`, `snippets/cart-drawer.liquid:374`, `snippets/quick-order-list-row.liquid:289`, `snippets/quick-order-list.liquid:150`, `snippets/quick-order-list.liquid:241`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/component-cart-items.css:418`, `assets/quick-order-list.css:252`, `assets/quick-order-list.css:275`, `assets/quick-order-list.css:322`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-reset.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-search.liquid:120`, `snippets/country-localization.liquid:70`, `snippets/header-search.liquid:73`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-return.svg

- Disposition: `rhino_replacement_planned`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:437`, `sections/main-product.liquid:1159`, `sections/main-product.liquid:1404`, `sections/main-product.liquid:1680`, `sections/main-product.liquid:1880`, `sections/main-product.liquid:2080`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Return semantics need Rhino-specific support iconography.

### assets/icon-ruler.svg

- Disposition: `rhino_replacement_planned`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:441`, `sections/main-product.liquid:1163`, `sections/main-product.liquid:1408`, `sections/main-product.liquid:1684`, `sections/main-product.liquid:1884`, `sections/main-product.liquid:2084`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dimensions, diameter, arbor, and size semantics need Rhino-specific technical iconography.

### assets/icon-search.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-search.liquid:125`, `snippets/country-localization.liquid:73`, `snippets/header-search.liquid:20`, `snippets/header-search.liquid:78`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-serving-dish.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:445`, `sections/main-product.liquid:1167`, `sections/main-product.liquid:1412`, `sections/main-product.liquid:1688`, `sections/main-product.liquid:1888`, `sections/main-product.liquid:2088`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-share.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `snippets/share-button.liquid:17`, `snippets/share-button.liquid:22`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/base.css:1432`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-shirt.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:449`, `sections/main-product.liquid:1171`, `sections/main-product.liquid:1416`, `sections/main-product.liquid:1692`, `sections/main-product.liquid:1892`, `sections/main-product.liquid:2092`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-shoe.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:453`, `sections/main-product.liquid:1175`, `sections/main-product.liquid:1420`, `sections/main-product.liquid:1696`, `sections/main-product.liquid:1896`, `sections/main-product.liquid:2096`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-shopify.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-password-footer.liquid:105`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/section-password.css:311`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-silhouette.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:457`, `sections/main-product.liquid:1179`, `sections/main-product.liquid:1424`, `sections/main-product.liquid:1700`, `sections/main-product.liquid:1900`, `sections/main-product.liquid:2100`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-snapchat.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-password-footer.liquid:69`, `snippets/header-drawer.liquid:263`, `snippets/social-icons.liquid:77`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-snowflake.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:461`, `sections/main-product.liquid:1183`, `sections/main-product.liquid:1428`, `sections/main-product.liquid:1704`, `sections/main-product.liquid:1904`, `sections/main-product.liquid:2104`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-star.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:465`, `sections/main-product.liquid:1187`, `sections/main-product.liquid:1432`, `sections/main-product.liquid:1708`, `sections/main-product.liquid:1908`, `sections/main-product.liquid:2108`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-stopwatch.svg

- Disposition: `rhino_replacement_planned`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:469`, `sections/main-product.liquid:1191`, `sections/main-product.liquid:1436`, `sections/main-product.liquid:1712`, `sections/main-product.liquid:1912`, `sections/main-product.liquid:2112`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Speed semantics need Rhino-specific technical iconography.

### assets/icon-success.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/contact-form.liquid:35`, `sections/email-signup-banner.liquid:132`, `sections/footer.liquid:230`, `sections/main-article.liquid:170`, `sections/main-login.liquid:78`, `sections/newsletter.liquid:111`, `templates/gift_card.liquid:167`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/section-contact-form.css:9`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-tick.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/pickup-availability.liquid:89`, `sections/pickup-availability.liquid:9`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-tiktok.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-password-footer.liquid:49`, `snippets/header-drawer.liquid:243`, `snippets/social-icons.liquid:47`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-truck.svg

- Disposition: `rhino_replacement_planned`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:473`, `sections/main-product.liquid:1195`, `sections/main-product.liquid:1440`, `sections/main-product.liquid:1716`, `sections/main-product.liquid:1916`, `sections/main-product.liquid:2116`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Freight and parcel delivery semantics need Rhino-specific delivery iconography.

### assets/icon-tumblr.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-password-footer.liquid:59`, `snippets/header-drawer.liquid:253`, `snippets/social-icons.liquid:87`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-twitter.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-password-footer.liquid:9`, `snippets/header-drawer.liquid:203`, `snippets/social-icons.liquid:57`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-unavailable.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `snippets/buy-buttons.liquid:137`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: `assets/component-pickup-availability.css:21`
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-vimeo.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-password-footer.liquid:89`, `snippets/header-drawer.liquid:283`, `snippets/social-icons.liquid:97`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-warning.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `snippets/cart-disclosure-indicator.liquid:63`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-washing.svg

- Disposition: `replace_when_touched`
- Ledger decision: `replace`
- Direct references: None recorded.
- Dynamic option references: `sections/collapsible-content.liquid:477`, `sections/main-product.liquid:1199`, `sections/main-product.liquid:1444`, `sections/main-product.liquid:1720`, `sections/main-product.liquid:1920`, `sections/main-product.liquid:2120`
- Dynamic renderer references: `sections/collapsible-content.liquid:84`, `sections/main-product.liquid:218`, `sections/main-product.liquid:562`, `snippets/icon-accordion.liquid:2`, `snippets/icon-accordion.liquid:3`, `snippets/icon-with-text.liquid:46`, `snippets/icon-with-text.liquid:68`, `snippets/icon-with-text.liquid:90`
- CSS or URL references: None recorded.
- Rationale: Dynamic Shopify Trade stock product icon is selectable in admin but is not approved final Rhino iconography.

### assets/icon-youtube.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `sections/main-password-footer.liquid:79`, `snippets/header-drawer.liquid:273`, `snippets/social-icons.liquid:37`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/icon-zoom.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `snippets/product-thumbnail.liquid:75`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/loading-spinner.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `snippets/loading-spinner.liquid:11`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

### assets/square.svg

- Disposition: `retain_as_upstream`
- Ledger decision: `keep`
- Direct references: `snippets/facets.liquid:271`, `snippets/facets.liquid:642`, `snippets/gift-card-recipient-form.liquid:27`
- Dynamic option references: None recorded.
- Dynamic renderer references: None recorded.
- CSS or URL references: None recorded.
- Rationale: Inherited Shopify Trade utility, state, media-control, social, or form-control icon currently supporting baseline theme behavior.

## Non-Icon Stock Visuals Recorded In Ledger

These assets are not counted as B-011 icon assets, but they are listed in `data/stock-asset-ledger.json` because the stock-asset validator tracks repository visual assets.

### assets/email-signup-banner-background-mobile.svg

- Ledger decision: `replace`
- Direct references: `sections/email-signup-banner.liquid:57`
- CSS or URL references: `assets/section-email-signup-banner.css:65`, `assets/section-email-signup-banner.css:71`
- Rationale: Non-icon stock SVG. Keep as upstream until the email signup banner is redesigned; replace when that surface is touched.

### assets/email-signup-banner-background.svg

- Ledger decision: `replace`
- Direct references: `sections/email-signup-banner.liquid:56`
- CSS or URL references: `assets/section-email-signup-banner.css:24`, `assets/section-email-signup-banner.css:71`
- Rationale: Non-icon stock SVG. Keep as upstream until the email signup banner is redesigned; replace when that surface is touched.

### assets/mask-arch.svg

- Ledger decision: `replace`
- Direct references: `sections/featured-collection.liquid:213`, `sections/main-collection-product-grid.liquid:199`, `sections/main-search.liquid:333`, `sections/related-products.liquid:58`
- CSS or URL references: None recorded.
- Rationale: Non-icon stock SVG mask. Keep as upstream until collection/search decorative masks are redesigned; replace when those surfaces are touched.

### assets/sparkle.gif

- Ledger decision: `replace`
- Direct references: None recorded.
- CSS or URL references: `assets/base.css:3463`
- Rationale: Non-icon stock raster remnant used by upstream motion styling. Replace when the owning decorative motion surface is touched.

## Follow-Up Work

- Use `snippets/rhino-icon.liquid` for future Rhino component work that needs the implemented production icon names.
- Replace the dynamic Shopify Trade product icon option set with Rhino-approved semantic choices when the product information blocks are redesigned.
- Decide whether extensionless `inline_asset_content` references should be normalized in a separate theme-code change.
- Add additional Rhino-owned icon assets to `data/media-manifest.json` only after the actual asset files exist.
