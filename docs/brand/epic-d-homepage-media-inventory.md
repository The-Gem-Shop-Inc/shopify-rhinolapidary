# Epic D Homepage Media Inventory

**Epic:** D - Homepage Transformation  
**PBI:** D-PBI-005  
**Status:** Batch 1 inventory and gap register  
**Created:** 2026-08-20  
**Machine-readable source:** [data/media-manifest.json](../../data/media-manifest.json) `homepageInventory`  
**Current-state audit:** [epic-d-homepage-current-state-audit.md](../architecture/epic-d-homepage-current-state-audit.md)

This inventory records homepage media candidates and gaps. No media was
uploaded, replaced, cropped, edited, commissioned, or selected for visible
homepage use in Batch 1.

## Candidate Summary

| Candidate | Source/location | Role | Rights | Dimensions | Launch readiness | Blocker |
|---|---|---|---|---|---|---|
| `repo-rhino-og-default` | `assets/rhino-og-default.jpg` | Brand fallback | Approved | 1200 x 630 | Fallback only | Not product/workshop media; crop needs review for homepage content use. |
| `repo-rhino-logo-horizontal-dark` | `assets/rhino-logo-horizontal-dark.svg` | Brand fallback | Approved | SVG viewBox 3096 x 1062 | Fallback only | Not product or workshop media. |
| `admin-machine-featured-media` | Shopify product media for `machines` collection | Informative | Needs confirmation | Mostly 1440 x 1440; EM-1 2489 x 2189 | Blocked | Empty alt text, unresolved rights, crop review, product selection, and missing media for SawMaster 36/TumbleMaster. |
| `admin-product-files-first-page` | First 30 Shopify Files `MediaImage` records | Informative | Needs confirmation | Mixed 1440/1800 square and 2489 x 2189 | Blocked | Empty alt, rights, exact mapping, and crop safety unresolved. |
| `missing-first-screen-product-media` | No approved source | Missing | Unknown | Unknown | Blocked | Launch-critical first-screen product/workshop media missing. |
| `missing-workshop-process-media` | No approved source | Missing | Unknown | Unknown | Blocked | No rights-cleared workshop/process media for proof or education modules. |
| `missing-video-poster` | No approved source | Missing | Unknown | Unknown | Blocked | No canonical video, poster, captions, transcript, owner, privacy, or performance evidence. |

## Module Media Requirements

| Module | Launch media dependency |
|---|---|
| `rhino-intro-current` | Can launch without media; current homepage has none. |
| `homepage-first-screen-gateway` | Requires media before launch; no launch-ready first-screen image exists. |
| `homepage-customer-path-chooser` | Can launch without media using text and approved lightweight icons. |
| `homepage-machine-family-overview` | Can use governed fallback only after Admin media rights, alt, crop, and mapping review. |
| `homepage-featured-machine` | Requires media before launch. |
| `homepage-parts-accessories-consumables` | Can launch without media if routes and compatibility-safe copy are approved. |
| `homepage-why-rhino-proof` | Can launch without media after claim approvals. |
| `homepage-support-reassurance` | Can launch without media; policy/support paths should not depend on decorative imagery. |
| `homepage-education-manuals` | Can launch without media once content and route approvals exist. |
| `homepage-video-demo` | Requires approved poster, captions/transcript, URL, privacy, and performance evidence. |
| `homepage-social-proof` | Can launch without media only after source and rights approval. |
| `homepage-inquiry-path` | Can launch without media. |

## Batch 2 Media Blockers

- First-screen product/workshop image is missing.
- Admin product media rights and alt text are unresolved.
- Machine media crop safety has not been reviewed for homepage and mobile use.
- SawMaster 36 and TumbleMaster have no observed featured media in the machine
  collection audit.
- Video poster, captions, transcript, privacy behavior, and click-to-load
  performance evidence do not exist.

## Validation

Use:

```powershell
npm run validate:media
```

The media validator checks the existing media manifest plus homepage inventory
rules. It prevents launch-ready media from passing when rights, dimensions,
crop safety, alt-text ownership, or blockers are unresolved.
