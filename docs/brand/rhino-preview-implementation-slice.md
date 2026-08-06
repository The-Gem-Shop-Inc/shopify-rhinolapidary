# Rhino Preview Implementation Slice

**PBI:** B-035
**Status:** Approved plan
**Target:** Persistent preview only
**Production publish allowed:** No
**Machine-readable source:** [data/rhino-preview-brand-slice.json](../../data/rhino-preview-brand-slice.json)

This plan defines the first implementation slice for the Rhino brand system. It
does not implement the slice and does not authorize production changes.

## Scope Decision

The first slice proves the brand system on a limited set of real storefront
surfaces:

1. Global theme settings
2. Browser identity
3. Homepage introduction
4. Collection product card
5. Search product card
6. Product purchase summary

The slice must remain reversible, preview-only, and narrow enough that failures
can be diagnosed without rewriting the whole theme.

## Included Surfaces

### global-theme-settings

Apply the approved B-026 candidate settings to the persistent preview only.
Validate DM Sans, palette, width, spacing, radii, card styles, badge styles, and
disabled scroll reveal.

Do not change cart behavior or commerce architecture.

Evidence:

- Settings candidate and rollback snapshot
- Preview theme ID or URL
- Before/after setting values
- Screenshots at required viewports
- `npm run validate:rhino-theme-settings-plan`
- `npm run check:rhino-theme-settings`

Rollback: restore the pre-change preview settings snapshot and rerun settings
validation.

### browser-identity

Preview logo, favicon, Apple touch icon, mask icon, theme color, and default
social metadata using approved generated assets only.

Evidence:

- [data/media-manifest.json](../../data/media-manifest.json)
- Browser tab and favicon screenshots
- Rendered social metadata validation
- Confirmation that no production hostname or unapproved social account URL was hardcoded

Rollback: restore prior theme-editor logo/favicon values and revert preview-only
metadata changes if needed.

### homepage-intro

Use an existing appropriate Trade section when possible. Replace stock
placeholder introduction copy with approved neutral Rhino positioning.

Do not add unapproved manufacturer, supplier, warranty, certification,
exclusivity, patent, support-responsibility, or performance claims. Do not
perform a complete homepage redesign.

Evidence:

- Before/after homepage screenshots
- Source link to approved positioning
- `npm run validate:brand-claims`
- Placeholder-content review

Rollback: restore the previous preview homepage section configuration and revert
any scoped CSS adapter.

### collection-product-card

Prove typography, image treatment, card spacing, price, availability, badge
restraint, focus, and wrapping on the stable fixture collection.

Do not add compatibility or freight badges without structured source data.

Evidence:

- `/collections/machines` fixture screenshots
- Product-card wrapping evidence
- Keyboard focus screenshots
- Smoke and accessibility test output

Rollback: revert card snippet and scoped CSS adapter changes.

### search-product-card

Confirm the same product-card language survives search context and no-results
states.

Do not redesign predictive search in this slice.

Evidence:

- `/search?q=rhino` screenshots
- No-results state screenshot or note
- Keyboard search-flow notes
- Smoke and accessibility test output

Rollback: revert search/card adapter changes and restore prior preview search
configuration if changed.

### product-purchase-summary

Prove product title, price, variants, quantity, primary purchase action,
secondary/support link hierarchy, focus, loading, error, and mobile wrapping.
Use the existing fixture product `/products/left-moss-pad` for a working
purchase path.

Do not add unresolved technical specifications, compatibility relations,
warranty durations, freight estimates, or included-component claims.

Evidence:

- Product summary screenshots at required widths
- Keyboard add-to-cart evidence
- Cart continuation evidence
- `npm run validate:product-purchase`
- `npm run test:cart`

Rollback: revert product summary Liquid and CSS adapters and rerun purchase,
cart, smoke, and accessibility tests.

## Excluded Surfaces

Excluded from this slice:

- Production publish
- Navigation redesign
- Footer identity claims
- Structured specifications
- Compatibility
- Checkout
- Full homepage redesign
- New product templates
- New metafields or metaobjects
- Product renaming
- Policy migration
- Notification changes
- Social account links
- Third-party applications
- Video embeds
- Technical diagrams
- Geological image textures
- Final product photography migration
- Broad content migration

## Fixtures

Use existing fixture records only:

| Category | Fixture | Route |
|---|---|---|
| Homepage | `homepage` | `/` |
| Collection | `collection` | `/collections/machines` |
| Search | `search` | `/search?q=rhino` |
| Product | `simpleProduct` | `/products/left-moss-pad` |
| Cart | `cart` | `/cart` |

The machine product `/products/trimmaster` may be used for supplemental visual
review, but unresolved technical copy must not be introduced.

## Go/No-Go

Progression is blocked when any of these occur:

- A required validator fails.
- Serious or critical axe violations are introduced.
- Keyboard purchase flow fails.
- Required fixture routes return errors.
- LCP, CLS, TBT, image, script, or media budgets fail.
- Stock Trade placeholder content remains on included surfaces.
- Preview settings cannot be rolled back.
- Unsupported claims appear.
- Product-card or purchase controls break at required widths.
- Production was changed.
- Required stakeholder approval is missing.

Go/no-go categories are repository, accessibility, performance, content, media,
admin, purchase-path, rollback, and stakeholder.

## Required QA

Static validation:

```powershell
npm run validate:epic-b-finalization
npm run qa:epic-b:static
```

Preview validation only when `PREVIEW_URL` and fixture route variables are
available:

```powershell
npm run qa:epic-b:preview
```

Manual evidence follows [docs/qa/epic-b-brand-qa-plan.md](../qa/epic-b-brand-qa-plan.md)
and [docs/qa/manual-qa-evidence-process.md](../qa/manual-qa-evidence-process.md).

## Follow-Up Rollout Tasks

Use stable keys until the next available PBI number is proven:

| Key | Task |
|---|---|
| BRAND-PREVIEW-01 | Implement persistent preview global settings and browser identity. |
| BRAND-PREVIEW-02 | Implement preview homepage introduction. |
| BRAND-PREVIEW-03 | Implement card and search visual adapters. |
| BRAND-PREVIEW-04 | Implement product purchase-summary visual adapters. |
| BRAND-PREVIEW-05 | Execute Epic B preview QA and collect evidence. |
| BRAND-PREVIEW-06 | Stakeholder review and go/no-go. |
| BRAND-PREVIEW-07 | Broader rollout planning after preview acceptance. |

## Closure Dependency

B-035 closes as a plan when this document and
[data/rhino-preview-brand-slice.json](../../data/rhino-preview-brand-slice.json)
validate. The implementation slice itself remains future work.
