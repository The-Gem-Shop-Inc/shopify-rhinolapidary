# Rhino Layout, Spacing, and Surface System

**PBI:** B-007  
**Status:** Approved foundation  
**Owner:** Brand and Engineering  
**Last reviewed:** 2026-07-31

## Purpose

Rhino layouts should resemble an orderly technical workspace: clear alignment,
controlled density, visible relationships, and little decorative clutter.

Whitespace, dividers, and hierarchy are preferred to nested cards.

## Spacing scale

| Token role | Value |
|---|---:|
| Space 1 | 4 px |
| Space 2 | 8 px |
| Space 3 | 12 px |
| Space 4 | 16 px |
| Space 5 | 24 px |
| Space 6 | 32 px |
| Space 7 | 48 px |
| Space 8 | 64 px |
| Space 9 | 96 px |

Do not create intermediate spacing values without documenting why an existing
step cannot express the relationship.

## Content widths

| Role | Maximum width |
|---|---:|
| Global storefront canvas | 1400 px |
| Standard content | 1120 px |
| Policy, editorial, and educational text | 720 px |
| Compact technical form | 640 px |

## Page gutters

- Mobile: 16 px
- Tablet: 24 px
- Desktop: 32 px

## Section rhythm

| Section type | Mobile | Desktop |
|---|---:|---:|
| Standard section | 40 px | 64 px |
| Dense technical section | 24 px | 32 px |
| Major landing transition | 64 px | 96 px |
| Related compact groups | 16 px | 24 px |

A section may use smaller internal spacing, but unrelated content must not be
compressed merely to reduce page length.

## Density modes

### Standard

Use for:

- Homepage sections
- Product storytelling
- Collection introductions
- Support navigation
- Educational content

### Technical

Use for:

- Specifications
- Included-components lists
- Compatibility
- Quick-order interfaces
- Parts tables
- Shipping dimensions
- Maintenance information

Technical density reduces spacing, not type size.

### Compact

Use only for:

- Utility navigation
- Small filter groups
- Table controls
- Brief metadata
- Icon-and-label groups

Compact layouts must retain 44 px interactive targets.

## Borders and dividers

### Standard border

- 1 px Alloy
- Used for inputs, tables, media boundaries, and ordinary separation

### Strong border

- 1 px Graphite
- Used for major technical panels and active control boundaries

### Brand rule

- 2 to 4 px Rhino red or Deep Rhino
- Used for a single section accent, callout edge, or diagram relationship
- Not used around every card

Prefer a divider when:

- Content belongs to the same conceptual group
- Rows need comparison
- A panel would create unnecessary nesting
- The parent surface already provides contrast

Prefer a panel when:

- Content has a distinct task or state
- The group needs a separate accessible name
- A warning, support action, or technical summary must be isolated
- The surface meaningfully differs from its parent

## Radii

| Element | Radius |
|---|---:|
| Buttons | 4 px |
| Inputs and selects | 4 px |
| Technical panels | 4 px |
| Product cards | 6 px maximum |
| Product media | 6 px maximum |
| Modals and drawers | 6 px |
| Tables | 0 to 4 px |
| Badges | Defined in B-010 |

Avoid:

- Large pill buttons
- Different radii inside one component
- Rounded containers nested inside rounded containers
- Rounded technical tables unless the outer boundary benefits from it

## Elevation

Ordinary cards, panels, product media, and technical modules use no shadow.

Shadows are reserved for:

- Drawers
- Modals
- Popovers
- Menus that visually overlap content
- Temporary cart or confirmation surfaces

Elevation must communicate layering, not perceived luxury.

## Surface roles

| Surface | Color | Use |
|---|---|---|
| Primary | White | Default content and commerce |
| Alternate | Mist | Technical grouping, collection or support separation |
| Editorial | Warm White | Policies, support, education |
| Dark | Carbon | Footer and occasional campaign surface |
| Brand dark | Deep Rhino | Rare campaign or high-value reassurance surface |

Continuous dark pages are not approved.

## Grid behavior

- Machine and high-value product cards should have more width than small
  consumable cards.
- Do not force five dense machine columns merely because Trade permits them.
- Technical values align by label and value.
- Repeated specification groups use consistent column widths.
- At mobile widths, comparison grids become labeled stacked rows.
- Controls move below headings rather than shrinking below usable sizes.
- Horizontal scrolling is acceptable only for genuinely two-dimensional data,
  with a visible overflow affordance and keyboard-accessible container.

## Card rules

A product card may contain:

- Product image
- Product title
- Compact classification or compatibility information
- Price
- One primary or secondary action when appropriate
- A small, governed badge set

A product card must not contain:

- Another card
- Multiple bordered callouts
- A full specification table
- Several competing buttons
- Decorative gears, textures, or shadows

## Implementation implications

- Rhino-specific classes use the `rhino-` prefix.
- New spacing values must use `--rhino-space-*` variables.
- Trade component CSS is not edited merely to implement Rhino tokens.
- Theme settings are changed only through the preview-first settings process.
- Responsive evidence is required when a component begins consuming these
  rules.