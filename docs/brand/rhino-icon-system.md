# Rhino Icon System and Stock Icon Replacement Plan

**PBI:** B-011  
**Status:** Approved foundation; repository asset audit completed  
**Owner:** Brand, Engineering, Media, and Accessibility  
**Last reviewed:** 2026-07-31

## Purpose

Rhino icons must support technical comprehension without becoming decorative
industrial imagery.

Icons supplement labels. They do not replace product names, specifications,
compatibility text, warnings, or instructions.

## Style decision

Rhino uses a restrained technical outline style.

### Construction

- Base canvas: 24 by 24
- Default visible size: 20 to 24 px
- Compact visible size: 16 px
- Stroke width: approximately 1.75 px
- Stroke uses `currentColor`
- Rounded joins and caps are acceptable where they improve clarity
- Shapes remain readable at 16 px
- Internal detail is minimized
- No gradients
- No shadow
- No faux metal treatment
- No perspective illustration
- No gear decoration unless the icon literally represents a gear or drive part

Filled shapes are reserved for:

- Small state dots
- Selected states
- Alert symbols where a solid silhouette improves recognition
- The approved Rhino brand mark

## Launch icon categories

### Navigation and interaction

- Search
- Cart
- Account
- Menu
- Close
- Previous
- Next
- Expand
- Collapse
- External link
- Download
- Print
- Share

Prefer inherited Trade icons for common interaction controls when they already
meet accessibility and visual requirements.

### Product classification

- Machine
- Replacement part
- Accessory
- Consumable
- Manual or document
- Kit or bundle

### Technical information

- Voltage
- Motor or power
- Speed
- Diameter
- Arbor
- Grit
- Dimensions
- Weight
- Water
- Blade
- Wheel or disc
- Included component
- Optional component

These icons always accompany visible labels in specifications.

### Compatibility and ownership

- Compatible
- Not compatible
- Machine family
- Replacement
- Installed on machine
- Multiple machine compatibility

A positive compatibility icon cannot be rendered unless structured
compatibility data confirms it.

### Delivery and support

- Freight
- Parcel delivery
- Pickup
- International review
- Warranty
- Support
- Repair
- Replacement parts
- Shipping damage
- Return
- Documentation

## Machine family icon concepts

These are concepts, not final artwork.

| Family | Code | Icon concept |
|---|---|---|
| EM-1 | EM1 | Four-part operation field or central multi-operation machine |
| BeadMaster | BDM | Circular bead with centered opening |
| ShapeMaster | SHM | Controlled profile or template outline |
| TrimMaster | TRM | Thin blade crossing a trim line |
| LapMaster | LPM | Horizontal lap disc |
| SawMaster | SWM | Circular saw blade |
| JadeMaster | JDM | Neutral family monogram until machine type is technically confirmed |

TumbleMaster receives no storefront family icon while it remains unavailable.

## Accessibility rules

### Informative icons

An informative icon must have one of:

- Adjacent visible text
- An accessible name
- An accessible description when the meaning is complex

Do not provide both visible text and duplicate spoken text unless the icon adds
meaning not present in the label.

### Decorative icons

Decorative SVG elements use:

```html
aria-hidden="true"
focusable="false"
```

## Repository asset audit

The completed B-011 stock icon source audit is recorded in
[rhino-stock-icon-asset-audit.md](rhino-stock-icon-asset-audit.md).

## Production Rhino icon set

The first repository-owned Rhino SVG icon set is implemented as
`assets/rhino-icon-{name}.svg` and rendered through
`snippets/rhino-icon.liquid`.

Supported names:

- `machine`
- `replacement-part`
- `accessory`
- `consumable`
- `bundle`
- `compatible`
- `included`
- `optional`
- `manual`
- `voltage`
- `speed`
- `dimensions`
- `weight`
- `water`
- `diameter`
- `arbor`
- `grit`
- `blade`
- `wheel`
- `freight`
- `parcel`
- `pickup`
- `international`
- `warranty`
- `support`
- `repair`
- `return`
- `em-1`
- `beadmaster`
- `shapemaster`
- `trimmaster`
- `lapmaster`
- `sawmaster`
- `jademaster`

Do not create or render a TumbleMaster icon while the family remains
unavailable.

Future Rhino components should render these icons with:

```liquid
{% render 'rhino-icon', name: 'freight', label: 'Freight delivery' %}
```

The snippet maps each supported name to a literal asset filename. It must not
construct filenames dynamically from merchant or customer input.

The implementation record is
[b-011-rhino-icon-set.md](../project/implementation-records/b-011-rhino-icon-set.md).
