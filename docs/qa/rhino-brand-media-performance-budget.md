# Rhino Brand Media and Visual Performance Budget

**PBI:** B-030  
**Status:** Approved foundation  
**Owner:** Engineering, Performance, Media, Brand, and QA  
**Last reviewed:** 2026-08-04

## Purpose

Rhino branding must improve clarity and trust without making technical product
pages slow, unstable, or dependent on unnecessary third-party code.

This budget supplements the repository performance baseline established in
Epic A.

When the Epic A budget is stricter, the stricter requirement wins.

## Core performance targets

Target these values on representative mobile preview runs:

| Metric | Target |
|---|---:|
| Largest Contentful Paint | 2.5 seconds or less |
| Cumulative Layout Shift | 0.10 or less |
| Interaction to Next Paint, field target | 200 ms or less |
| Total Blocking Time, Lighthouse proxy | 200 ms or less |
| Lighthouse mobile performance | 85 or higher |
| Lighthouse accessibility | 95 or higher |

A preview regression greater than 10% against the approved baseline requires
investigation even when the absolute score still passes.

Run at least three mobile measurements and use the median result.

## Incremental Epic B code budget

These values measure additions caused by Rhino branding, not the entire Trade
theme.

| Resource | Incremental launch budget |
|---|---:|
| Rhino CSS, compressed | 30 KB maximum |
| Rhino JavaScript, compressed | 10 KB maximum |
| Third-party animation JavaScript | 0 KB |
| External font JavaScript | 0 KB |
| Additional font families | 0 |
| New synchronous third-party scripts | 0 |
| New immediately loaded video players | 0 |

A larger code addition requires:

- Measured customer benefit
- Architecture review
- Before-and-after performance evidence
- Removal or deferral of equivalent weight where practical

## Font budget

- Use Shopify-hosted DM Sans.
- Do not load an external font service.
- Do not add a separate display or monospace family for launch.
- Load only weights actually used.
- Prefer existing Shopify font delivery and generated font-face output.
- Do not preload every font weight.
- Avoid icon fonts.

## Image budget

### Above-the-fold mobile content

Total brand and product imagery loaded before customer interaction:

`500 KB target`

### Above-the-fold desktop content

`900 KB target`

### Individual assets

| Asset | Target compressed weight |
|---|---:|
| Mobile product hero candidate | 350 KB or less |
| Desktop product hero candidate | 500 KB or less |
| Product-card image delivered at card size | 120 KB or less |
| Video poster or thumbnail | 160 KB or less |
| Raster diagram | 120 KB or less |
| SVG diagram | 35 KB or less |
| Decorative texture | 30 KB or less |
| Social or Open Graph image | Not part of page load; optimize separately |
| UI SVG icon | 2 KB target per icon |

These values are delivery targets, not master-file limits.

Shopify product media should use responsive image delivery rather than sending
the master dimensions to every device.

## Layout stability

Every brand media component must reserve its expected dimensions using:

- Width and height attributes
- Aspect ratio
- Stable responsive container
- Known placeholder dimensions

Do not insert:

- Video iframe
- Diagram
- Poster
- Logo
- Badge group
- Trust marker

without preserving its expected layout space.

## Lazy loading

Lazy load:

- Product images below the initial viewport
- Diagrams below the initial viewport
- Video posters below the initial viewport
- All third-party video players
- Editorial textures
- Secondary gallery media where current Trade behavior permits

Do not lazy load the true LCP image.

Do not eager load more than the initial page requires.

## Video budget

Before customer activation, a third-party video may load:

- The Rhino-controlled poster
- The play control
- Visible title and duration text

It may not load:

- YouTube or Vimeo iframe
- Player JavaScript
- Tracking requests
- Related-video data
- Third-party thumbnails when a Rhino-controlled poster is available

The player loads only after deliberate activation.

Only one player should be active at a time on ordinary product or education
pages.

## Texture budget

Launch core commerce surfaces use no bitmap geological texture.

A post-launch texture exception is limited to:

- One decorative texture request per page
- 30 KB compressed target
- No texture above the LCP product image
- No texture behind dense text, tables, prices, forms, cart, or purchase
  controls
- A solid-color fallback
- No external texture host

## Diagram budget

Prefer SVG for:

- Callout diagrams
- Flow diagrams
- Simple dimensional drawings
- Compatibility relationships

Prefer optimized raster content for:

- Scanned manuals
- Highly detailed technical drawings
- Complex shaded illustrations

Do not embed complete CAD exports directly into a page.

Simplify diagrams for the customer task.

## Third-party review

Any new app, embed, script, player, form, or media host requires:

- App or script register entry
- Privacy review
- Performance measurement
- Consent review where applicable
- Removal plan
- Owner
- Pages affected
- Failure behavior

A performance application must not be installed to compensate for avoidable
theme or media problems.

## Critical pages

Measure at minimum:

- Homepage
- Machine collection
- Mixed product collection
- Search results
- Launch machine product
- Consumable product
- Replacement-part product
- Cart
- Contact or support page
- Policy page

## Network profiles

Use:

- Mobile emulation
- Slow 4G or the repository’s approved mobile profile
- Warm and cold cache where supported
- Preview theme without development overlays when practical

## Evidence

Record:

- Commit
- Preview URL
- Page
- Device profile
- Three run results
- Median
- Transferred bytes
- CSS and JavaScript changes
- Image request sizes
- Third-party requests
- Before-and-after comparison
- Known limitations
- Reviewer

## Failure conditions

Block release when:

- An immediately loaded video iframe is introduced.
- A decorative asset becomes the LCP element without approval.
- Layout shift exceeds the target.
- A new third-party script lacks ownership or privacy review.
- Rhino CSS or JavaScript exceeds its budget without review.
- A texture appears behind critical technical or commerce content.
- The customer receives a master-sized image where a responsive derivative
  should be used.
- Reduced-motion behavior is missing.
- A performance regression is explained only as “better branding.”

## Completion condition

B-030 closes when this budget is approved and referenced by the release and QA
planning PBIs.