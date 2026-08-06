# Rhino Logo and Motif Usage Rules

**PBI:** B-015  
**Status:** Ready for repository adoption  
**Source of truth:** `Rhino Lapidary Banner.psd`

## 1. Approved logo variants

### Primary light variant

- Black striped wordmark
- Rhino red mark `#ED1C24`
- Black rounded rectangular frame
- White field
- Use on white, Mist, or Warm White surfaces

### Primary dark variant

Evidence for this treatment appears in the supplied EM-1 advertisement.

- White striped wordmark
- Rhino red mark `#ED1C24`
- White rounded rectangular frame
- Carbon or black field
- Use on Carbon, Graphite, or black surfaces

### One-color variants

Create from the PSD source:

- Solid black on white
- Solid white on black or Deep Rhino

Use only where color reproduction is unavailable, including engraving, embossing, single-color print, or limited browser icon contexts.

### Small-space mark

Use the rhino silhouette alone when the full horizontal logo cannot remain legible.

Approved uses:

- Favicon source
- App icon source
- Compact mobile identity
- Social avatar
- Small loading or ownership mark when an accessible text label is present

Do not redraw the rhino. Export it from the authoritative PSD.

## 2. Production export requirements

The PSD is the master source. Create:

- SVG where a clean vector export can be produced without changing shapes
- Transparent PNG at 1x and 2x display sizes
- WebP only when transparent rendering and browser validation are satisfactory
- One-color SVG or PNG variants
- Rhino-mark-only square exports

Do not use the supplied 12,900 px PSD directly in Shopify.

## 3. Clear space

Define `x` as one eighth of the full framed logo height.

- Keep at least `x` of clear space on all sides.
- No text, buttons, borders, photographs, or pattern edges may enter the clear-space area.
- The logo’s own outer frame does not replace external clear space.

## 4. Minimum display size

- Full horizontal logo: 180 px minimum width on desktop
- Full horizontal logo: 144 px minimum width on mobile
- Below 144 px: use the rhino mark alone
- Printed minimum: test at 45 mm wide before approval because the striped wordmark loses definition quickly

Header implementation should target approximately 180–220 px desktop and 144–176 px mobile, subject to responsive QA.

## 5. Background rules

Approved:

- White or Mist with the light variant
- Carbon or black with the dark variant
- Deep Rhino with a one-color white variant
- Solid, quiet backgrounds

Prohibited:

- Directly over photography
- Over gradients
- Over geological textures
- Over colors that reduce the frame, wordmark, or rhino contrast
- Inside another enclosing border that resembles a second logo frame

## 6. Prohibited alterations

Do not:

- Stretch, compress, rotate, skew, or crop
- Remove or redraw the striped wordmark
- Change Rhino red
- Apply a gradient to the rhino
- Recolor individual armor plates
- Add shadows, glow, bevel, outline, or animation
- Replace the wordmark with typed text
- Separate the rhino and wordmark except for the approved small-space mark
- Add “The Gem Shop,” “Silica-Gem,” warranty language, or a tagline inside the logo frame
- Use the logo as a repeating background pattern

## 7. Motif rules

### Approved motifs

- Single rhino silhouette as an ownership mark
- Thin red connector lines for technical callouts
- Rectangular framed labels inspired by the supplied EM-1 advertisement
- A single red rule or block to establish section hierarchy
- Segment-like geometry in diagrams when it supports comprehension

### Restricted motifs

- Armor segmentation may appear in occasional campaign art or illustration, but not as a repeated card texture.
- Horn imagery may appear only when clearly connected to Rhino identity and not to warnings or unsafe interaction cues.

### Rejected motifs

- Gears as a generic industrial decoration
- Repeating rhino silhouettes
- Faux metal, carbon fiber, diamond plate, or distressed textures
- Animated charging or impact rhinos
- Red gradient buttons
- Decorative connector lines that imply nonexistent product relationships

## 8. Accessibility

- A linked logo must have an accessible name such as “Rhino Lapidary home.”
- When adjacent visible text already names Rhino Lapidary, a decorative image can use empty alt text.
- Do not place essential descriptive copy inside logo artwork.
- The full logo is not suitable for very small controls.
- High-contrast and forced-color modes must preserve a recognizable text alternative.

## 9. Later Shopify admin work

Do not perform this during B-015.

When B-026 or B-035 authorizes implementation:

1. Export the approved web variants from the PSD.
2. Record repository-owned variants in `data/media-manifest.json`.
3. Upload the required logo and favicon through the preview theme editor.
4. Record the change using `docs/project/admin-change-record-template.md`.
5. Capture the previous setting values and rollback steps.
6. Test header, mobile navigation, footer, password page, browser tab, and high-contrast backgrounds.