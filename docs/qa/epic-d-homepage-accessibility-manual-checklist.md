# Epic D Homepage Accessibility Manual Checklist

**Epic:** D - Homepage Transformation  
**PBI:** D-PBI-026  
**Status:** Checklist ready; manual checks pending unless marked otherwise  
**Evidence root:** `docs/qa/evidence/epic-d/`  
**Automated evidence:** `test-results/epic-d/homepage-accessibility-*.json`

Manual review must not be marked passed unless a reviewer actually performs the
check on the persistent preview theme.

| Check | Applies now | Required evidence path | Current Batch 2 status | Notes |
|---|---|---|---|---|
| Heading hierarchy | Yes | `docs/qa/evidence/epic-d/YYYY-MM-DD-homepage-accessibility-heading-hierarchy.md` | Pending | Current Trade rich-text heading is observed as `h2.h1`; future hero must own semantic `h1`. |
| Visible focus | Yes | `docs/qa/evidence/epic-d/YYYY-MM-DD-homepage-accessibility-focus.md` | Pending | Review header, current homepage CTAs, footer transition, and future modules when implemented. |
| Keyboard traversal | Yes | `docs/qa/evidence/epic-d/YYYY-MM-DD-homepage-accessibility-keyboard.md` | Pending | Confirm source order matches visual order and focus is not hidden by sticky chrome. |
| 200% zoom | Yes | `docs/qa/evidence/epic-d/YYYY-MM-DD-homepage-accessibility-200-zoom.md` | Pending | Current and future CTAs must not clip or overlap. |
| Text spacing | Yes | `docs/qa/evidence/epic-d/YYYY-MM-DD-homepage-accessibility-text-spacing.md` | Pending | Verify body copy, CTA wrapping, and future cards/forms. |
| Forced colors | Yes | `docs/qa/evidence/epic-d/YYYY-MM-DD-homepage-accessibility-forced-colors.md` | Pending | Confirm buttons, focus rings, links, and future media controls remain visible. |
| Reduced motion | Conditional | `docs/qa/evidence/epic-d/YYYY-MM-DD-homepage-accessibility-reduced-motion.md` | Not applicable | No homepage-specific motion exists now; required when future animated/media modules are implemented. |
| Informative image alt text | Conditional | `docs/qa/evidence/epic-d/YYYY-MM-DD-homepage-accessibility-image-alt.md` | Not applicable | Current homepage has no content images; required for future hero/product/media images. |
| Decorative image treatment | Conditional | `docs/qa/evidence/epic-d/YYYY-MM-DD-homepage-accessibility-decorative-media.md` | Not applicable | Required if future decorative brand/media assets render. |
| Media captions and controls | Conditional | `docs/qa/evidence/epic-d/YYYY-MM-DD-homepage-accessibility-media.md` | Blocked | No approved video URL, captions, transcript, poster, or privacy/performance approval exists. |
| Form labels, errors, and status | Conditional | `docs/qa/evidence/epic-d/YYYY-MM-DD-homepage-accessibility-forms.md` | Not applicable | Required when newsletter, inquiry, quote, or support forms are implemented. |
| Mobile screen-reader spot check | Yes | `docs/qa/evidence/epic-d/YYYY-MM-DD-homepage-accessibility-mobile-sr.md` | Pending | At minimum review iOS VoiceOver or Android TalkBack before release. |
| Desktop screen-reader spot check | Yes | `docs/qa/evidence/epic-d/YYYY-MM-DD-homepage-accessibility-desktop-sr.md` | Pending | At minimum review NVDA, JAWS, or VoiceOver before release. |

## Status Rules

- `Pending`: check is required but was not performed in this batch.
- `Not applicable`: the relevant module or feature is not rendered.
- `Blocked`: required source, media, route, or owner approval is missing.
- `Passed`: reviewer performed the check and attached evidence.
- `Failed`: reviewer performed the check and recorded a defect.

## D-PBI-030 Input

D-PBI-030 should require this checklist, automated homepage accessibility JSON,
and any completed manual evidence records before final Epic D release signoff.
