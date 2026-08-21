# Epic D Homepage Current-State Audit

**Epic:** D - Homepage Transformation  
**PBI:** D-PBI-002  
**Audit date:** 2026-08-20  
**Target:** Authenticated persistent preview first; production read-only identity check only  
**Production changed:** No  
**Repository template inspected:** [templates/index.json](../../templates/index.json)  
**Rendered preview evidence:** `test-results/epic-d/homepage-preview-current-state.json` and screenshots under [docs/qa/evidence/epic-d](../qa/evidence/epic-d/)  
**Durable Admin evidence summary:** [2026-08-20-epic-d-admin-current-state-summary.json](../qa/evidence/epic-d/2026-08-20-epic-d-admin-current-state-summary.json)

This audit records actual current homepage state before any visible Epic D
redesign. It does not describe the intended transformed homepage.

## A. Repository Homepage State

`templates/index.json` contains one homepage section:

| Section ID | Type | Order | Rhino-specific | App/custom Liquid |
|---|---|---:|---|---|
| `rhino_intro` | `rich-text` | 1 | No custom Rhino section; Rhino-specific content in a Trade rich-text section | None |

Blocks:

| Block ID | Type | Order | Customer-facing content/settings |
|---|---|---:|---|
| `heading` | `heading` | 1 | Heading: `Choose lapidary equipment for the work you need to do`; configured `heading_size: h1` |
| `text` | `text` | 2 | Body: `Find lapidary machines, replacement parts, consumables, and accessories by product role, machine family, and the work you need to do. Confirm product details before ordering.` |
| `button` | `button` | 3 | Primary label `Shop machines`, destination `shopify://collections/machines`; secondary label `Contact us`, destination `shopify://pages/contact` |

Section settings:

| Setting | Value |
|---|---|
| `desktop_content_position` | `center` |
| `content_alignment` | `center` |
| `color_scheme` | `scheme-1` |
| `full_width` | `true` |
| `padding_top` | `64` |
| `padding_bottom` | `64` |

Repository homepage media references: none.

Repository homepage app blocks: none.

Repository homepage custom Liquid: none.

## B. Rendered Persistent Preview

Rendered preview was captured at the established Epic C viewport set:

| Viewport | Screenshot | Horizontal overflow | Homepage content images | Broken responses |
|---|---|---:|---:|---:|
| 360 x 800 | [mobile 360](../qa/evidence/epic-d/2026-08-20-epic-d-homepage-mobile-360-current-state.png) | No | 0 | 1 Shop Pay 403 |
| 390 x 844 | [mobile 390](../qa/evidence/epic-d/2026-08-20-epic-d-homepage-mobile-390-current-state.png) | No | 0 | 1 Shop Pay 403 |
| 768 x 1024 | [tablet 768](../qa/evidence/epic-d/2026-08-20-epic-d-homepage-tablet-768-current-state.png) | No | 0 | 1 Shop Pay 403 |
| 1440 x 900 | [desktop 1440](../qa/evidence/epic-d/2026-08-20-epic-d-homepage-desktop-1440-current-state.png) | No | 0 | 1 Shop Pay 403 |
| 1920 x 1080 | [desktop 1920](../qa/evidence/epic-d/2026-08-20-epic-d-homepage-desktop-1920-current-state.png) | No | 0 | 1 Shop Pay 403 |

Rendered section order:

1. `shopify-section-template--22155410112709__rhino_intro`

Visible content:

- Heading text matches repository copy.
- Body text matches repository copy.
- Visible CTAs are `Shop machines` and `Contact us`.
- No homepage content images are rendered.
- No homepage app blocks are rendered.
- No visible placeholder matches were found in the rendered main content.

Rendered heading note: the configured `heading_size: h1` renders as an `h2`
element with Trade class `h1`. This is current state, not a Batch 1 fix.

Broken response note: each viewport observed a 403 document response from a
Shop Pay hop URL. The homepage content still rendered, and no homepage route
failure was observed. This should be reviewed in future smoke/performance work
if it appears in user-visible flows.

## C. Shopify Admin / Theme Editor Dependencies

Read-only Admin GraphQL inspection was performed. No mutation was run.

Theme Editor files observed on preview:

| File | Checksum | Updated at | Observed homepage/global dependency |
|---|---|---|---|
| `templates/index.json` | `071bd7ee26e6d984ddec3a03671499e3` | 2026-08-06T17:38:10Z | Matches repository homepage template content. |
| `config/settings_data.json` | `e4fe6ae8e07be18f03601c7332975550` | 2026-08-06T17:41:42Z | `content_for_index` is empty; social links are empty; password sections only in settings-owned section data. |
| `sections/header-group.json` | `205274964212b46e0f8a97656514e46d` | 2026-08-18T17:53:19Z | Header uses `preview-primary-navigation-menu`. |
| `sections/footer-group.json` | `4bd4b37b5791eba84ac5c1d80315de21` | 2026-08-18T17:53:32Z | Footer uses `preview-footer-menu`; policy display enabled. |

Collections observed:

| Title | Handle | Products | Image |
|---|---|---:|---|
| 18" LapMaster Parts | `18-lapmaster-parts` | 0 | None |
| Blades & Wheels | `blades-wheels` | 0 | None |
| EM-1 Parts | `em-1-parts` | 0 | None |
| Flat Laps | `flat-laps` | 2 | None |
| Home page | `frontpage` | 1 | None |
| JadeMaster Parts | `jademaster-parts` | 0 | None |
| Machines | `machines` | 11 | None |
| Nuts & Screws | `nuts-screws` | 0 | None |
| Saws | `saws` | 6 | None |
| Shaping Machines | `shaping` | 4 | None |
| TrimMaster Parts | `trimmaster-parts` | 0 | None |

Pages observed:

| Title | Handle | Published | Template |
|---|---|---|---|
| Contact | `contact` | Yes | `contact` |
| Your Privacy Choices | `data-sharing-opt-out` | Yes | default |
| 12 in. LapMaster Manual | `12-in-lapmaster-manual` | No | `page` |
| 18 in. LapMaster Manual | `18-in-lapmaster-manual` | No | `page` |
| 18 in. SawMaster Manual | `18-in-sawmaster-manual` | No | `page` |
| 24 in. SawMaster Manual | `24-in-sawmaster-manual` | No | `page` |
| 36 in. SawMaster Manual | `36-in-sawmaster-manual` | No | `page` |
| TrimMaster Manual | `trimmaster-manual` | Yes | `page` |
| JadeMaster Manual | `jademaster-manual` | No | `page` |
| BeadMaster Manual | `beadmaster-manual` | No | `page` |
| ShapeMaster Manual | `shapemaster-manual` | Yes | `page` |
| EM-1 Manual | `em-1-manual` | Yes | `page` |
| Manuals | `manuals` | Yes | `page` |

Blogs/articles: no articles were returned in the Admin audit.

Policies observed: Legal notice, Privacy policy, Refund policy, and Shipping.

Apps/embeds: rendered homepage app block count is 0. `settings_data.json`
showed no configured social links or `content_for_index` section entries.
Admin app-installation inventory was blocked by available scope, so installed
app dependency state remains read-blocked rather than inferred.

Forms/reviews/video dependencies: no rendered homepage form, review widget, or
video module was observed.

Policy/support destinations that could later be promoted: contact page, policy
routes, and published manual pages exist, but route existence does not approve
support, warranty, freight, shipping, pickup, or service language.

## D. Theme Identity / Safety

| Theme | ID | Name | Role/status | Batch 1 use |
|---|---|---|---|---|
| Persistent preview | `158631198917` | Rhino Lapidary - Preview | `UNPUBLISHED`; processing false; processingFailed false | Implementation/testing target |
| Production | `158579622085` | shopify-rhinolapidary/main | `MAIN`; processing false; processingFailed false | Read-only identity and checksum check |

Configuration note: `shopify.theme.toml` currently names preview theme
`158631198917`; its production environment still contains placeholder
`PUBLISHED_THEME_ID`. The production ID above was therefore taken from the
read-only Admin `MAIN` theme query, not from the placeholder configuration.

Preview `templates/index.json`, production `templates/index.json`, and the
repository template share checksum `071bd7ee26e6d984ddec3a03671499e3` at audit
time. No Admin mutation, theme publish, file upsert, page creation, collection
creation, media upload, menu edit, product edit, or Theme Editor section change
was performed in Batch 1.

## E. Current Route State

Current homepage links:

| Label | Source section/block | Intended route | Rendered href/path | Preview status | Route contract status |
|---|---|---|---|---|---|
| Shop machines | `rhino_intro` / `button.button_link` | `shopify://collections/machines` | `/collections/machines` | Rendered in all audited viewports | Covered by route ID `machines`; approved current homepage CTA |
| Contact us | `rhino_intro` / `button.button_link_2` | `shopify://pages/contact` | `/pages/contact` | Rendered in all audited viewports | Covered by route ID `contact`; approved current generic contact CTA |

Route discrepancy recorded:

- Preview header menu uses `preview-primary-navigation-menu`.
- Its nested `Saws`, `Laps`, and `Shaping` items currently point to
  `/collections/machines`.
- Default `main-menu` has distinct `/collections/saws`, `/collections/flat-laps`,
  and `/collections/shaping` children.
- This is Admin/current-state evidence only and was not corrected in Batch 1.

Potential future homepage destination classes are represented in
[data/navigation-spec.json](../../data/navigation-spec.json) as approved,
observed, draft, or blocked. Blocked route classes such as parts, accessories,
consumables, education, financing, quote/inquiry, and dealer/institutional do
not reserve invented URLs.

## F. Current Media

Current rendered homepage media: none.

Repository-owned media candidates:

- `assets/rhino-og-default.jpg`: governed metadata fallback, not launch-ready
  first-screen product/workshop media.
- `assets/rhino-logo-horizontal-dark.svg`: governed brand asset, not product
  media.
- Rhino icon SVGs: governed theme UI assets, not content media.

Admin media candidates:

- Machine collection has 11 products. Nine observed products have ready featured
  images; SawMaster 36 and TumbleMaster have no featured media.
- Observed machine featured media alt text is empty.
- First page of Shopify Files returned 30 ready `image/jpeg` media records,
  mostly 1800 x 1800 with some 1440 x 1440 and one 2489 x 2189 image; observed
  file alt values are empty.

Missing launch-critical media:

- No approved first-screen product/workshop image.
- No approved workshop/process imagery.
- No approved video poster or thumbnail.
- No homepage media has complete rights, crop safety, alt-text ownership, and
  performance approval for first-screen use.

Machine-readable media readiness is recorded in
[data/media-manifest.json](../../data/media-manifest.json).

## G. Existing Automated Coverage

Current coverage:

| Area | Existing command/artifact | Current Batch 1 finding |
|---|---|---|
| Homepage smoke | `npm run test:smoke` | Existing smoke suite includes homepage route through storefront fixtures. |
| Navigation/routes | `npm run validate:navigation`, `npm run test:navigation`, new `npm run test:homepage-routes` | Route contract now covers current homepage CTAs and blocked future homepage route classes. |
| Placeholders | `npm run check:placeholders` | Existing placeholder checker remains relevant; rendered audit found no homepage placeholder matches. |
| Hardcoded strings | `npm run validate:hardcoded-strings` | Existing hardcoded string allowlist remains relevant; no visible redesign added. |
| Claims | `npm run validate:brand-claims`, new `npm run validate:homepage-content-claims` | Content map is scanned for blocked claim patterns. |
| Media | `npm run validate:media` | Media manifest now includes homepage inventory and readiness gates. |
| Accessibility | `npm run test:ally` | Existing accessibility suite can cover current homepage; Epic D-specific a11y coverage remains later D-PBI-026. |
| Responsive behavior | Screenshot evidence captured at 360, 390, 768, 1440, and 1920 widths | No horizontal overflow observed in current homepage content. Later D-PBI-028 defines transformed homepage evidence plan. |
| Performance | `npm run validate:brand-performance`, `npm run test:brand-performance:release` | Current homepage content has no content images/videos; full Epic D homepage performance validation remains D-PBI-027. |
| Rhino sections/patterns | `npm run validate:rhino-sections`, `npm run validate:rhino-section-patterns` | No new visible Rhino section was added in Batch 1. |
| Theme repository | `npm run validate:theme-repository`, `npm run theme:check` | Existing repository/theme validation remains relevant. |

Coverage gaps recorded, not implemented in Batch 1:

- Homepage-specific accessibility assertions for future modules.
- Homepage-specific performance runtime budget for first-screen media and video.
- Homepage responsive QA plan for transformed modules.
- Epic D finalization runner.
- Manual signoff and production go/no-go.
