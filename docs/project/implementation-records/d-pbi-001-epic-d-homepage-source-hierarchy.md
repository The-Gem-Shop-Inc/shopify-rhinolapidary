# D-PBI-001 Implementation Record

## PBI

```text
PBI ID: D-PBI-001
Title: Create the Epic D homepage source hierarchy and decision log
Epic: D - Homepage Transformation
Type: Measurement/documentation
Owner: Frontend Engineering with Product, Admin, Legal, Content, Media, QA, Release, and Analytics inputs
Date completed: 2026-08-20
Status: Complete
```

## Scope Completed

- Created the Epic D homepage source hierarchy and decision status model.
- Defined authority, fallback, owner/reviewer, allowed scope, non-authority, and conflict-resolution rules for homepage section order, module outcomes, Theme Editor settings, Shopify Admin content, products/collections, routes, product facts, media, media rights, brand copy, legal-sensitive claims, warranty/support/freight language, analytics, accessibility, performance, release/signoff evidence, and rollback evidence.
- Documented preview vs production authority and stated that technical completion does not authorize production publication.
- Required future Epic D implementation records to include a `Sources / Evidence` section.

## Files Changed

- `docs/architecture/epic-d-homepage-source-hierarchy.md`
- `docs/project/implementation-records/d-pbi-001-epic-d-homepage-source-hierarchy.md`

## Sources / Evidence

- `docs/architecture/epic-c-global-chrome-source-hierarchy.md`
- `docs/rhino-lapidary-pbi-tracker-epic-d.md`
- `data/homepage-section-outcomes.json`
- `data/navigation-spec.json`
- `data/media-manifest.json`
- `data/legal-claims-register.json`
- `data/homepage-content-claims-map.json`

## Automation Added Or Reused

- Reused aggregate register validation through `npm run validate:registers`.
- D-PBI-001 itself is a policy/documentation artifact; enforceable rules were added through D-PBI-003, D-PBI-004, D-PBI-006, and D-PBI-005.

## Validation Evidence

```text
npm run validate:registers: PASS; homepage section outcomes and homepage content claims map included in aggregate register validation.
npm run validate:homepage-sections: PASS; 12 modules.
npm run validate:navigation: PASS; 21 routes.
npm run validate:media: PASS; 43 media entries and 7 homepage media candidates, with existing proposed-placeholder warning.
```

## Shopify Admin Evidence

No Shopify Admin mutation was made. Read-only Admin inspection for Batch 1 is recorded in D-PBI-002.

## Preview Theme Identity

- Preview theme: `158631198917`, `Rhino Lapidary - Preview`, `UNPUBLISHED`.
- Production theme: `158579622085`, `shopify-rhinolapidary/main`, `MAIN`.

## Production Safety Statement

Production was not modified. D-PBI-001 does not authorize production publication.

## Unresolved Blockers

- Final Product Owner for homepage section priority.
- First-screen promise approver.
- Legal/business owners for entity-role, warranty, freight, support, financing, dealer, institutional, testimonial, and review language.
- Media owner for first-screen imagery.
- Analytics owner for post-launch homepage measurement.

## Acceptance Criteria Result

| Acceptance criterion | Result |
|---|---|
| Source hierarchy names the owner for every homepage evidence class. | PASS |
| Decision log separates approved facts from hypotheses and blocked claims. | PASS |
| Preview and production responsibilities are explicit. | PASS |
| Future PBI implementation records have a required source section. | PASS |

## Follow-Up Implications For Batch 2

Batch 2 can use this hierarchy to decide which homepage modules may become visible. Any unanswered source question remains draft, blocked, or unknown.
