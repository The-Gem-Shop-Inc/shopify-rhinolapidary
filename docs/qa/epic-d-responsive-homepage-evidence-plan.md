# Epic D Responsive Homepage Evidence Plan

**Epic:** D - Homepage Transformation  
**PBI:** D-PBI-028  
**Status:** Evidence plan ready for current and future homepage states  
**Evidence root:** `docs/qa/evidence/epic-d/`  
**Runtime result root:** `test-results/epic-d/`

This plan extends the storefront quality baseline and Epic C responsive QA
conventions for homepage-specific first-screen and module sequencing. It does
not replace Epic C global chrome evidence.

## Required Viewports

| Viewport ID | Size | Purpose |
|---|---:|---|
| `mobile-360` | 360 x 800 | Narrow Android and older mobile layouts |
| `mobile-390` | 390 x 844 | Common modern phone layout |
| `mobile-430` | 430 x 932 | Large phone layout |
| `tablet-768` | 768 x 1024 | Tablet portrait |
| `tablet-1024` | 1024 x 768 | Tablet landscape |
| `desktop-1280` | 1280 x 720 | Laptop and vertical constraint review |
| `desktop-1440` | 1440 x 900 | Primary desktop review |
| `desktop-1920` | 1920 x 1080 | Wide desktop and max-width review |

## State Matrix

| State | Current Batch 2 status | Future requirement |
|---|---|---|
| Initial load | Required | Screenshot and geometry for every viewport |
| Hero | N/A until `homepage-first-screen-gateway` is implemented | H1, proposition, media, primary CTA, secondary CTA, crop, and first-screen height evidence |
| First scroll | Required | Show next useful path or useful content without excessive dead space |
| Customer path chooser | N/A until implemented | Screenshot and geometry for every path card/link |
| Machine family module | N/A until implemented | Card/list wrapping, media crop, route reachability |
| Trust/support | N/A until implemented | Support/policy action hierarchy and no unsupported promise emphasis |
| Media/video | N/A until implemented | Poster, controls, no immediate iframe, no autoplay, crop/legibility evidence |
| Forms/newsletter | N/A until implemented | Labels, errors/status, 200% zoom, no clipped controls |
| Footer transition | Required | Homepage content transitions into existing footer without overlap or sticky focus obstruction |

## Blocking Failures

The following block homepage visual approval:

- Unintended horizontal scroll
- Clipping
- Overlap
- Header collision
- Unreadable image crop
- CTA clipping
- Incoherent CTA wrapping
- Dead vertical space that hides the next useful path
- First-screen composition hiding the next useful path on mobile or desktop
- Keyboard focus obscured by sticky chrome

## Automated Evidence

Automated checks cover:

- Viewport rendering for all required widths
- Document and main-content scroll width
- Header/main overlap geometry where measurable
- CTA/link bounds and wrapping/clipping
- Element visibility
- First-scroll state
- Sticky-header focus obstruction
- Screenshot capture
- Conditional hero/path assertions based on `data/homepage-section-outcomes.json`

The automated JSON evidence must include viewport, state, selected checks,
passed, failed, not applicable, and failure details.

## Manual Evidence

Manual review remains required for:

- Visual crop quality
- Content hierarchy
- Visual balance
- Text legibility over media
- First-screen usefulness
- Whether the next useful path is genuinely understandable

Manual evidence should be recorded under `docs/qa/evidence/epic-d/` using the
manual QA evidence process. Do not mark manual checks passed unless they were
actually performed.

## Naming

Screenshots:

```text
YYYY-MM-DD-epic-d-homepage-{viewport-id}-{state}.png
```

Runtime JSON:

```text
test-results/epic-d/homepage-responsive-{project}.json
```

## D-PBI-030 Input

D-PBI-030 should consume this plan, `tests/homepage-responsive.spec.js`, and
the generated JSON/screenshot evidence directly.
