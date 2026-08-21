# Epic D Homepage Measurement Plan

**Epic:** D - Homepage Transformation  
**PBI:** D-PBI-029  
**Status:** Design complete; no tracking code authorized  
**Machine-readable source:** [data/epic-d-homepage-measurement-plan.json](../../data/epic-d-homepage-measurement-plan.json)  
**Validator:** `npm run validate:homepage-measurement-plan`

This plan defines how the transformed homepage should be evaluated after
launch. It does not install pixels, add custom events, install analytics apps,
or change consent behavior.

## Rules

- Use native Shopify reporting where it is sufficient.
- Treat custom events as proposal-only until Analytics, Product, Business, and
  Privacy/Legal owners approve them.
- Do not duplicate ecommerce tracking for product view, add to cart, checkout,
  or purchase.
- Establish baseline periods before setting final numerical targets.
- Cross-check [analytics-migration-verification-plan.md](analytics-migration-verification-plan.md)
  before implementing any future tracking.

## Covered Measures

| Measure | Module | Native Shopify | Custom event state |
|---|---|---|---|
| Hero CTA clicks | `homepage-first-screen-gateway` | Partial | Proposed only |
| Customer path clicks | `homepage-customer-path-chooser` | Partial | Proposed only |
| Machine-family entry | `homepage-machine-family-overview` | Partial | Proposed only |
| Parts entry | `homepage-parts-accessories-consumables` | Partial | Proposed only |
| Accessories entry | `homepage-parts-accessories-consumables` | Partial | Proposed only |
| Consumables entry | `homepage-parts-accessories-consumables` | Partial | Proposed only |
| Support/contact entry | `homepage-support-reassurance` | Sufficient | No custom event |
| Education/video engagement | `homepage-education-manuals` | Partial | Proposed only |
| Newsletter/inquiry starts | `homepage-inquiry-path` | Partial | Proposed only |
| Homepage-to-product continuation | `rhino-intro-current` | Sufficient | No custom event |

## Baseline And Thresholds

Every measure requires a baseline before final success thresholds are set. The
default baseline is the first 28 days after the relevant module or route is
approved and launched. The current minimal homepage baseline should be retained
for before/after comparison.

## Privacy And Consent

Native aggregate Shopify reporting has no new tracking-code impact. Any custom
event would collect interaction data and must go through analytics ownership,
privacy/consent review, duplicate-tracking review, and a later approved
implementation PBI.

## D-PBI-030 Input

D-PBI-030 should require the JSON measurement plan and validator output, but it
must not require custom tracking implementation.
