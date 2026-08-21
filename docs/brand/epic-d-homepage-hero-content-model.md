# Epic D Homepage Hero Content Model

**Epic:** D - Homepage Transformation  
**PBI:** D-PBI-007  
**Status:** Complete with copy approval blocker; hero media selected and governed
**Machine-readable source:** [data/homepage-section-outcomes.json](../../data/homepage-section-outcomes.json) module `homepage-first-screen-gateway`  
**Content/claim source:** [data/homepage-content-claims-map.json](../../data/homepage-content-claims-map.json)

This document explains the governed hero contract. It does not approve final
storefront copy, media, routes, or claims.

## Stable Module Contract

| Field | Decision |
|---|---|
| Stable hero module ID | `homepage-first-screen-gateway` |
| Implementation state | `blocked` |
| First-screen customer outcome | Customers should understand what Rhino sells and choose a useful next path before scrolling. |
| Audience | First-time, experienced, and existing Rhino customers arriving on the homepage. |
| H1 ownership | Future implemented hero owns the single semantic page `h1`. Current intro remains observed only. |
| Headline source | `data/homepage-content-claims-map.json#hero-promise` |
| Supporting copy source | Current intro body may be used only as safe neutral draft reference until approved supporting copy exists. |
| Copy approval state | `blocked` |
| Required copy approvers | Brand Owner, Product Owner, Legal or Claims Reviewer, Content Owner |
| Primary CTA role | Primary commerce action to approved route `machines`; currently draft and blocked from hero rendering. |
| Secondary CTA role | Secondary/support action to approved generic route `contact`; no support promise is approved. |
| Approved route references | `machines`, `contact` |
| Media requirement | Rights-cleared, crop-reviewed, alt-reviewed, dimensioned, performance-approved product or workshop media. |
| Media source/state | Product Owner-selected `admin-em-1-homepage-hero-selected`; Shopify Files PNG, 2489 x 2189, governed for contained/adapt first-screen use. Visible implementation still requires runtime performance validation and actual informative alt treatment. |
| Image fallback behavior | Do not substitute decorative brand art as hero media unless the approved model explicitly allows a text-first hero. |
| No-media fallback | Keep the current neutral rich-text intro; do not render a redesigned hero. |
| Mobile sequencing | Headline, copy, primary action, secondary action, and next useful path must remain visible or reachable without overflow or CTA clipping at 360 px and wider. |
| First-screen height | Avoid dead vertical space; the next useful path should be visible or reachable with one normal first scroll. |
| Accessibility | One semantic page `h1`, named CTAs, correct image alt treatment, visible focus, and source-order keyboard traversal. |
| Performance | Homepage performance budget applies for LCP, CLS, TBT, transfer, request count, image bytes, first-screen media bytes, dimensions, autoplay, video embeds, and third-party hosts. |
| Success measure | Preview evidence shows first-screen route choice without unsupported claims or media blockers. |

## Safe Neutral Draft

The only safe neutral draft headline currently represented is:

`Choose lapidary equipment for the work you need to do`

This is observed current homepage copy and a draft fallback, not final hero
approval. The current body copy is also observed/draft only. Proposed language
from [rhino-brand-positioning.md](rhino-brand-positioning.md) remains proposed
and cannot be promoted into storefront hero copy by implementation.

## Prohibited Hero Claims

The hero model blocks customer-facing language that implies:

- Manufacturer role
- Supplier or distributor role
- Patent or patent-pending status
- Exclusivity
- Universal warranty duration
- Freight guarantees
- Delivery timing or cost promises
- Financing availability
- Performance or superiority claims

## Implementation Blockers

- Approved first-screen homepage promise is missing.
- Proposed positioning is not approved for storefront use.
- The selected EM-1 asset is governed, but visible implementation must ensure the informative alt treatment is actually rendered.
- An implemented hero must provide one semantic page `h1`; stock Trade image-banner and image-with-text headings currently render as `h2`.
- Runtime performance must pass after the selected EM-1 image is actually rendered.
- Broad performance, warranty, freight, supplier, manufacturer, patent,
  exclusivity, and financing claims remain prohibited unless separately
  approved.

## D-PBI-008 Implication

D-PBI-008 is no longer blocked on hero-media selection. It remains blocked on
approved first-screen copy and must also satisfy semantic-H1, actual informative
alt treatment, responsive crop, and runtime performance requirements when
implemented. Until then, keep the current neutral rich-text intro and do not
render the redesigned hero.