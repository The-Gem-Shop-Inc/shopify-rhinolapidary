# Epic D Homepage Content Claims Map

**Epic:** D - Homepage Transformation  
**PBI:** D-PBI-004  
**Status:** Batch 1 governed source map  
**Created:** 2026-08-20  
**Machine-readable source:** [data/homepage-content-claims-map.json](../../data/homepage-content-claims-map.json)  
**Legal claim authority:** [data/legal-claims-register.json](../../data/legal-claims-register.json)

This document explains the homepage content ownership and claims decisions
captured in the machine-readable map. It does not approve new customer-facing
commercial, legal, operational, product, warranty, freight, financing,
testimonial, review, dealer, video, or support claims.

## Policy

- Legal claim status lives in `data/legal-claims-register.json`.
- Homepage content class ownership and source mapping lives in
  `data/homepage-content-claims-map.json`.
- Approved brand voice rules can shape copy, but they do not approve new facts.
- Proposed brand positioning remains proposed until the named approvers approve
  homepage use.
- Safe neutral fallback text may be used only when the referenced route,
  module, media, and claim gates also pass.

## Content Class Decisions

| Content class | Current Batch 1 status | Source/owner | Related claims | Decision |
|---|---|---|---|---|
| Current intro heading/body | Observed | `templates/index.json`; Frontend Engineering and Product Owner | None | Current state only. Not final Epic D hero approval. |
| Current homepage CTAs | Observed | `templates/index.json`; Frontend Engineering and Shopify Admin Owner | None | Route-safe current links to machines and contact. |
| First-screen/hero promise | Blocked | Proposed brand positioning; Brand/Product/Legal | `CLAIM-002`, `CLAIM-010`, `CLAIM-011` | Do not author final hero promise until approved. |
| Why Rhino proof | Blocked | Brand positioning and legal claims register | `CLAIM-005`, `CLAIM-006`, `CLAIM-010` | No proof module until entity-role and proof claims are approved. |
| Machine/product statements | Draft | Shopify product/Admin evidence and product data owners | `CLAIM-010`, `CLAIM-015` | Titles and handles are observed; capability and compatibility need structured evidence. |
| Support | Blocked | Reassurance microcopy and contact page evidence | `CLAIM-014` | Contact route exists, but support responsibility, hours, repair, and warranty administration are not approved. |
| Warranty | Blocked | Reassurance microcopy and policies | `CLAIM-007`, `CLAIM-008`, `CLAIM-014` | Safe label `Warranty details` is not enough without route and legal approval. |
| Freight | Blocked | Reassurance microcopy and operations | `CLAIM-012` | No freight cost, timing, included freight, or delivery promise can be used. |
| Shipping | Blocked | Shopify shipping policy object and operations | `CLAIM-012` | Policy route existence does not approve homepage shipping summaries. |
| Pickup | Blocked | Reassurance microcopy and operations | None | Do not infer pickup availability from Shopify location state. |
| Financing | Blocked | No approved source | `CLAIM-016` | No financing route or wording should render. |
| Testimonials/reviews | Blocked | No approved source/app evidence | None | Do not manufacture social proof, counts, ratings, or testimonials. |
| Video/demo descriptions | Blocked | Video system rules only | `CLAIM-010` | No video URL, thumbnail, transcript, captions, owner, or privacy approval exists. |
| Dealer language | Blocked | No approved source | `CLAIM-016` | No dealer path wording should render. |
| School/club/workshop/institutional language | Blocked | No approved process source | None | No institutional inquiry route or follow-up owner exists. |
| Education/buying-guide language | Draft | Published manuals page and future content sources | None | Manuals are observed; buying-guide homepage placement is not approved. |

## Safe Neutral Fallbacks

Observed or safe-neutral strings currently represented:

- `Choose lapidary equipment for the work you need to do`
- `Find lapidary machines, replacement parts, consumables, and accessories by product role, machine family, and the work you need to do. Confirm product details before ordering.`
- `Shop machines`
- `Contact us`
- `Warranty details`
- `Freight delivery`
- `Shipping policy`
- `Pickup availability`
- `Manuals`

These strings are not blanket approval for homepage publication. They still
depend on route, module, legal, operations, media, accessibility, and
performance gates.

For D-PBI-007, the current heading is also represented as safe neutral draft
fallback for `hero-promise`. That draft state does not approve final hero copy
or proposed brand-positioning language.

## Blockers For Batch 2

- Approved first-screen homepage promise.
- Approved destination and content model for parts and consumables paths.
- Approved support/warranty/freight/shipping/pickup language and owners.
- Legal approval for proof points and entity-role language.
- Product data approval for machine-family summaries and compatibility-safe
  statements.
- Media owner approval for first-screen and machine-family imagery.

## Validation

Use:

```powershell
npm run validate:homepage-content-claims
npm run validate:brand-claims
npm run check:placeholders
```

`validate:homepage-content-claims` validates content class structure, module
references, legal claim references, blocker requirements, and safe neutral
fallback text against the claims register.
