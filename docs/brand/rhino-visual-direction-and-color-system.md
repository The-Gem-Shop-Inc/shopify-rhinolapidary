# Rhino Visual Direction and Accessible Color System

**PBIs:** B-004 and B-005  
**Direction name:** Precision Workshop  
**Status:** Approved design direction; implementation deferred to the token, CSS, and theme-settings PBIs  
**Evidence basis:** Supplied Rhino logo package, supplied EM-1 advertising, approved brand positioning, and current Trade configuration

## 1. Launch direction

Rhino will use a **restrained technical storefront** rather than recreating the legacy advertisement or applying a generic dark industrial theme.

The launch system should feel:

- Precise
- Durable
- Direct
- Technical
- Product centered
- Calm enough for long specification and policy reading

The visual hierarchy should borrow three useful ideas from the supplied advertising:

1. Strong black, white, and red contrast
2. Clear capability grouping
3. Thin connector lines and framed labels that resemble diagrams

It should not borrow:

- Gradient feature bars
- Decorative gears
- Large amounts of all-caps text
- Heavy black backgrounds on every surface
- Complex borders around ordinary content
- Red text used as the only indicator of urgency or importance

## 2. Approved color palette

### Brand source colors

| Role | Token proposal | Value | Source | Approved use |
|---|---|---:|---|---|
| Rhino red | `--rhino-color-red-500` | `#ED1C24` | Supplied logo raster | Logo, motif, focus outline, diagram accents, large display accents, nontext indicators |
| Deep Rhino | `--rhino-color-red-900` | `#791716` | Supplied EM-1 advertisement frame | Dark brand panels, footer accents, hover states, technical callout borders |
| Workshop gold | `--rhino-color-gold-500` | `#B6830D` | Supplied EM-1 feature bar and gears | Sparse highlight, legacy campaign reference, selected diagram emphasis; never a primary CTA |
| Black | `--rhino-color-black` | `#000000` | Supplied logo | Logo and one-color assets; ordinary UI text should use Carbon instead |

### Designed accessible interface colors

| Role | Token proposal | Value | Intended use |
|---|---|---:|---|
| Primary action red | `--rhino-color-red-700` | `#B51820` | Primary buttons and filled commerce actions with white text |
| Link red | `--rhino-color-link` | `#A3151C` | Inline links on white or light surfaces |
| Carbon | `--rhino-color-carbon` | `#111111` | Primary text and dark surfaces |
| Graphite | `--rhino-color-graphite` | `#2B2D30` | Secondary dark surfaces and strong borders |
| Steel | `--rhino-color-steel` | `#5D6670` | Muted text on white |
| Alloy | `--rhino-color-alloy` | `#C9CDD2` | Borders and dividers |
| Mist | `--rhino-color-mist` | `#F3F4F5` | Alternate surface and product-media backdrop |
| Warm white | `--rhino-color-warm-white` | `#FCFBF8` | Editorial or support surface |
| White | `--rhino-color-white` | `#FFFFFF` | Primary surface and reversed text |

### Functional colors

Functional colors are intentionally distinct from the historical brand palette so customers do not have to infer state from “Rhino red.”

| State | Token proposal | Value | Pairing |
|---|---|---:|---|
| Information | `--rhino-color-info` | `#0B5EA8` | White text |
| Success | `--rhino-color-success` | `#1F6B45` | White text |
| Warning | `--rhino-color-warning` | `#7A4A00` | White text |
| Error | `--rhino-color-error` | `#B42318` | White text |

## 3. Required contrast pairings

| Foreground | Background | Contrast ratio | Decision |
|---|---|---:|---|
| White | Primary action red `#B51820` | 6.74:1 | Approved for normal text |
| White | Deep Rhino `#791716` | 10.79:1 | Approved for normal text |
| Carbon `#111111` | Rhino red `#ED1C24` | 4.31:1 | Use only for large or bold text; prefer nontext use |
| Carbon `#111111` | Workshop gold `#B6830D` | 5.61:1 | Approved for normal text |
| Steel `#5D6670` | White | 5.83:1 | Approved muted text |
| Link red `#A3151C` | White | 7.83:1 | Approved link text |
| White | Information | 6.60:1 | Approved |
| White | Success | 6.47:1 | Approved |
| White | Warning | 7.48:1 | Approved |
| White | Error | 6.57:1 | Approved |

### Prohibited pairings

- White normal text on logo red `#ED1C24` because the measured ratio is about 4.38:1, below the 4.5:1 normal-text target.
- White text on workshop gold.
- Workshop gold text on white.
- Rhino red text on black for dense paragraphs.
- Any state communicated by hue alone.

## 4. Typography decision

The launch storefront will use **DM Sans for headings and body copy**.

This replaces the current two-family DM Sans/Jost combination because the two geometric sans families add complexity without creating a meaningful technical hierarchy.

Rules:

- Body: DM Sans 400
- Secondary emphasis: DM Sans 500
- Navigation, labels, and buttons: DM Sans 600
- Page and section headings: DM Sans 700
- Technical values, model numbers, prices, dimensions, and tabular data: DM Sans with `font-variant-numeric: tabular-nums`
- Uppercase is limited to short labels and badges, with additional letter spacing
- The striped Rhino wordmark is a logo asset and must never be imitated as a heading font
- No additional external font is approved for launch

## 5. Spacing and layout direction

These are governing design decisions. Batch 3 will translate them into formal tokens and component rules.

### Spacing scale

`4, 8, 12, 16, 24, 32, 48, 64, 96 px`

### Widths

- Global page maximum: 1400 px
- Standard content maximum: 1120 px
- Long-form policy and education text: 720 px
- Mobile page gutter: 16 px
- Tablet page gutter: 24 px
- Desktop page gutter: 32 px

### Vertical rhythm

- Standard section spacing: 40 px mobile, 64 px desktop
- Dense technical section spacing: 24 px mobile, 32 px desktop
- Major landing-page transition: up to 96 px desktop when content density permits

### Structural treatment

- Default surface: white
- Alternate surface: Mist
- Dark surface: Carbon or Deep Rhino, used selectively
- Borders: 1 px Alloy or Graphite
- Radius: 4 px for controls and technical panels; 6 px maximum for product media and general cards
- Shadows: none for ordinary cards; reserved for modals, drawers, and transient overlays
- Dividers and whitespace are preferred to nested cards
- Product specifications remain flat and scannable

## 6. Layout language

Approved:

- Clear grid alignment
- Full-width section bands used sparingly
- Thin red diagram lines or framed labels
- Strong whitespace around machinery
- Tables and specification groups with visible labels
- Light product surfaces with dark text
- Dark footer or campaign panel with white text and red accents

Rejected:

- Continuous black-background storefront
- Gear graphics as repeated decoration
- Faux metal textures
- Stone or geological textures behind specifications
- Red gradients in controls
- Rounded “floating” cards for every content block
- Oversized display headings that delay product details
- Decorative armor patterns on product cards

## 7. Photography and diagram relationship

Photography supplies proof. Diagrams explain.

- A product hero must show the complete product before the page uses detail crops.
- Red connector lines may identify features in diagrams or educational media, but they must not imply inaccurate engineering relationships.
- Text labels should sit outside the product image where possible.
- Product imagery must not inherit the old advertisement’s black background by default.
- Neutral photography gives the red logo and UI accents more authority.

## 8. Motion direction

Launch motion should be utilitarian:

- Preserve essential state transitions.
- Avoid decorative scroll reveals on dense product and support pages.
- No auto-playing media.
- All movement must respect `prefers-reduced-motion`.
- Loading indicators must describe progress or state rather than act as ornament.

B-020 will formalize and close this decision.

## 9. Implementation separation

This document does not change:

- `config/settings_data.json`
- `config/settings_schema.json`
- `assets/rhino-custom.css`
- `data/design-token-inventory.json`
- Shopify theme-editor settings

Those changes belong to B-025, B-026, B-027, and the preview implementation slice.

## 10. Acceptance record

- B-004 visual direction: **Ready for repository adoption**
- B-005 accessible color system: **Pulled forward and ready for repository adoption**
- Theme implementation: **Not started**