# Rhino Geological Pattern and Texture Rules

**PBI:** B-014  
**Status:** Approved foundation  
**Owner:** Brand, Media, Accessibility, Performance, and Engineering  
**Last reviewed:** 2026-08-04

## Launch decision

Rhino will use **no bitmap or photographic geological texture on launch
commerce surfaces**.

The connection to lapidary craft will come from:

- Product photography
- Stone results and examples
- Technical diagrams
- Material terminology
- A restrained strata-line divider
- Editorial imagery
- The Rhino identity

This decision protects technical readability, performance, and the engineered
character of the storefront.

## Approved launch motif

A simple strata rule may be used as a section separator.

It consists of:

- Two or three horizontal lines
- Slightly different lengths or offsets
- Alloy, Steel, and Rhino red
- No image request
- No motion
- No repeated page background

The strata rule is decorative and must be hidden from assistive technology.

## Post-launch allowed uses

A geological texture may be proposed for:

- Educational article hero
- Editorial process story
- Social image
- Trade-show or campaign landing page
- Section transition without dense text
- Rough-to-polished visual narrative
- Supporting image adjacent to, rather than behind, technical content

Every texture remains an exception requiring review.

## Prohibited surfaces

Do not place texture behind:

- Product titles
- Prices
- Buy controls
- Variant selectors
- Quick order
- Cart
- Search
- Filters
- Forms
- Specifications
- Compatibility tables
- Warranty
- Freight information
- Error or warning messages
- Policy text
- Manuals
- Diagrams
- Logo
- Navigation

## Prohibited treatments

- Faux granite UI
- Faux marble UI
- Diamond plate
- Carbon fiber
- Distressed metal
- Repeating rhino pattern
- Gear pattern
- Highly polished luxury-stone backgrounds
- Moving strata
- Parallax
- Texture applied to buttons
- Texture applied inside inputs
- Texture used to imply material, quality, or manufacturing claims
- Texture fetched from an external image CDN
- Large transparent PNG overlays

## Contrast

When text appears in the same section as a texture:

- Text sits on a solid surface.
- The solid surface has an approved contrast pairing.
- The texture does not cross the text boundary.
- Mobile cropping cannot move texture behind the text.
- The fallback remains understandable when images are disabled.
- Forced-color mode does not depend on the texture.

An overlay is not an acceptable substitute for checking every responsive crop.

## Asset requirements

A future texture asset must record:

- Owner
- Source
- Rights
- Intended surface
- Dimensions
- Format
- Compressed weight
- Fallback color
- Mobile crop
- Desktop crop
- Alt-text or decorative status
- Review date
- PBI
- Removal path

Repository-owned texture assets must appear in `data/media-manifest.json`.

## Performance

A post-launch texture exception has these limits:

- One texture request per page
- 30 KB compressed target
- No texture above the true LCP product image
- Lazy load when below the initial viewport
- Solid fallback
- No JavaScript
- No animation
- No third-party host

## File format

Prefer:

- AVIF or WebP for photographic texture
- SVG for a simple original line pattern
- CSS borders for the launch strata rule

Avoid:

- GIF
- uncompressed PNG
- giant transparent overlays
- source photography committed at master resolution

## Editorial stone imagery

Actual stone imagery should be treated as photography, not UI texture.

It must:

- Identify the material when known
- Avoid implying that shown results are guaranteed
- Avoid misleading color correction
- Follow the photography guide
- Have appropriate alt text
- Remain separate from technical specifications

## Completion condition

B-014 closes when these rules are approved.

Launch requires no geological texture asset.