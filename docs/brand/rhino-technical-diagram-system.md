# Rhino Technical Diagram and Blueprint System

**PBI:** B-013  
**Status:** Approved foundation  
**Owner:** Technical, Product Data, Brand, Media, Accessibility, and Engineering  
**Last reviewed:** 2026-08-04

## Purpose

Rhino diagrams explain machine layout, dimensions, movement, flow, included
components, maintenance, and compatibility when photography or prose alone is
not sufficient.

They are explanatory tools, not decorative blueprint imagery.

## When to use a diagram

Use a diagram for:

- Part identification
- Component location
- Water flow
- Rotational direction
- Cutting or grinding direction
- Dimensions and workshop clearance
- Connection points
- Maintenance access
- Included versus optional equipment
- Installation sequence
- Confirmed compatibility
- Exploded-view relationships

Use photography for:

- Appearance
- Surface condition
- Finish
- Real workshop context
- Included physical contents
- Product scale when a real setting matters

Use tables for:

- Comparable specifications
- Numeric values
- Machine-to-machine comparison
- Compatibility matrices

Use video for:

- Multi-step operation
- Technique
- Sound or movement
- Maintenance procedure
- Troubleshooting sequence

## Diagram categories

### Orientation diagram

Shows named machine areas or controls.

### Dimension diagram

Shows measured dimensions, clearances, and orientation.

### Flow diagram

Shows water, slurry, air, power, or process direction.

### Motion diagram

Shows verified rotation or travel direction.

### Exploded diagram

Shows part order and assembly relationships.

### Compatibility diagram

Shows approved product or machine relations.

### Procedure diagram

Shows a short verified sequence where a static diagram remains clearer than
video.

## Visual grammar

### Background

Preferred:

- White
- Mist
- Warm White

Dark blueprint backgrounds are not the default.

### Primary line

- Graphite
- 1.5 to 2 px at normal rendered size
- Solid
- Used for machine and component outlines

### Secondary line

- Steel
- 1 to 1.5 px
- Used for hidden, contextual, or nonessential geometry

### Rhino callout

- Action Red or Deep Rhino
- 2 px
- Used for callout leader lines and selected components

### Water flow

- Information Blue
- Dashed line plus arrow and visible `Water flow` label

### Movement

- Graphite or Action Red
- Arrow plus explicit direction label
- Movement cannot be communicated by animation alone

### Dimension

- Graphite
- Thin extension lines
- Arrowheads
- Visible unit
- Consistent source-approved rounding

### Warning

- Warning or Error color
- Warning symbol
- Visible warning heading
- Text explanation

Color is never the only distinction.

## Callouts

Callouts use:

- Sequential numbers
- Short labels
- Leader lines that do not cross when avoidable
- An adjacent keyed list
- A stable reading order

Callout labels should generally remain outside the machine silhouette.

Do not place long paragraphs inside a diagram.

## Labels

- DM Sans
- Sentence case
- 14 px minimum equivalent at ordinary display size
- Strong enough contrast against the diagram surface
- No condensed imitation of the Rhino wordmark
- No label smaller than the surrounding caption system
- Keep units with values
- Preserve approved machine terminology

## Source control

Every technical diagram must record:

- Diagram title
- Machine or product
- Source documents
- Technical reviewer
- Product-data fields represented
- Version
- Effective date
- Superseded version
- Known limitations
- Whether dimensions are assembled, operational, packaged, or shipping
  dimensions
- Whether compatibility is family or model-specific

Do not resolve a conflict from the machine specification register through
illustration.

An unresolved value remains absent or visibly marked as unconfirmed.

## Asset storage

### Repository assets

Use the repository for:

- Small UI diagrams
- Reusable explanatory SVGs
- Shared diagram components
- Diagram styling
- Version-controlled customer-facing illustrations

Record repository-owned assets in `data/media-manifest.json`.

### Shopify product media

Use product media for:

- Product-specific customer diagrams
- Gallery diagrams
- Model-specific annotations

### Shopify Files

Use Files for:

- Downloadable PDFs
- Manuals
- Support diagrams used across pages
- Documents managed by content or support teams

### External master storage

Keep:

- CAD
- source drawing files
- high-resolution editable masters
- engineering workbooks

outside the theme repository under an approved controlled source.

Do not commit proprietary working CAD merely to render a customer diagram.

## Format

Prefer SVG for:

- Orientation
- Callouts
- Flows
- Movement
- Simple dimensions
- Compatibility

Use optimized raster content for complex scans or illustrations that cannot be
represented efficiently as SVG.

Use PDF for complete downloadable manuals or engineering documentation.

## Accessibility

A simple diagram requires:

- Concise alt text
- Nearby caption

A complex diagram requires:

- Concise alt text naming its purpose
- Adjacent text explanation
- Structured list or table containing the essential information
- Reading order independent of visual callout placement

Do not put the complete description inside the alt attribute.

Decorative diagram accents are hidden from assistive technology.

Interactive diagrams are not approved in this PBI.

## Mobile behavior

- Preserve labels at readable size.
- Prefer stacking the diagram above its keyed list.
- Do not shrink an entire detailed diagram until its labels become unreadable.
- Allow an accessible horizontal overflow container only when the diagram is
  genuinely two-dimensional.
- Provide a text alternative outside the overflow region.
- Keep controls at least 44 px if future zoom or selection is introduced.

## Prohibited treatments

- Faux blueprint paper
- Glowing lines
- Decorative grids behind ordinary product copy
- Unverified measurements
- Perspective that distorts dimensions
- Animated arrows without a static alternative
- Dense leader-line crossings
- Tiny embedded text
- Red as the only indicator
- Technical-looking decoration with no explanatory value
- Scanned source pages presented without customer-oriented simplification

## Future implementation

Epic F machine pages should create separate PBIs for:

- EM-1 orientation diagram
- Machine dimension diagrams
- Water-flow diagrams
- Included-components diagrams
- Maintenance-access diagrams
- Model-specific compatibility diagrams

Each implementation requires technical approval and accessibility evidence.

## Completion condition

B-013 closes when this system is approved.

No final diagram is required to close the planning PBI.