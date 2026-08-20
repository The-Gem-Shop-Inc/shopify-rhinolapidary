# Epic C Responsive Global Chrome Evidence Plan

**Epic:** C - Global Header, Navigation, and Footer  
**PBIs:** C-PBI-024 and C-PBI-027  
**Status:** Batch 5 repeatable evidence plan  
**Preview theme:** `158631198917` - Rhino Lapidary - Preview  
**Production theme:** `158579622085`

## Evidence Roots

Automated run results are stored under:

```text
test-results/epic-c/batch-5/
```

Screenshot and human review artifacts are stored under:

```text
docs/qa/evidence/epic-c/
```

Screenshot names follow the Epic B pattern with the Epic C identifier:

```text
YYYY-MM-DD-epic-c-{route}-{viewport}-{state}.png
```

## Required Viewports

Use the Epic B viewport vocabulary:

| ID | Width | Height | Required |
|---|---:|---:|---|
| `mobile-360` | 360 | 800 | Yes |
| `mobile-390` | 390 | 844 | Yes |
| `tablet-768` | 768 | 1024 | Yes |
| `desktop-1440` | 1440 | 900 | Yes |
| `desktop-1920` | 1920 | 1080 | Yes |

## Required Route Categories

Routes are sourced from existing fixture and route records only.

| Category | Source |
|---|---|
| Homepage | `tests/fixtures/storefront-fixtures.json#homepage` |
| Collection | `tests/fixtures/storefront-fixtures.json#collection` |
| Search | `tests/fixtures/storefront-fixtures.json#search` |
| Product | `tests/fixtures/storefront-fixtures.json#simpleProduct` |
| Cart | `tests/fixtures/storefront-fixtures.json#cart` |
| Contact | `tests/fixtures/storefront-fixtures.json#contact` |
| Policy | `data/navigation-spec.json#privacy-policy` |

Do not add handles, pages, policies, collections, products, blogs, or articles only to satisfy this evidence plan.

## Required States

The automated runner captures or verifies these states where the current IA and Shopify configuration render them:

| State | Evidence Rule |
|---|---|
| Default header | Capture and geometry-check every route and viewport. |
| Sticky/scrolled header | Capture and verify focused controls are not hidden by the sticky header. |
| Desktop primary navigation | Verify at desktop viewports. |
| Mega menu open | Capture when rendered; record `dep-preview-menu-isolation` when the current flat shared menu prevents it. |
| Mobile drawer open | Capture at mobile and tablet viewports. |
| Nested drawer state | Capture when a real nested fixture exists; record the C-PBI-011 dependency when no nested menu renders. |
| Search open | Capture and geometry-check every route and viewport. |
| Breadcrumb region | Capture where rendered; homepage omission is expected. |
| Footer top | Capture and geometry-check every route and viewport. |
| Footer bottom | Capture and geometry-check every route and viewport. |
| Localization controls | Record rendered controls and labels, or Shopify-suppressed state. |

## Automated Blocking Rules

The responsive runner must fail required approval when it detects:

- Horizontal page overflow at a required width.
- Clipped drawer or search UI.
- Header controls overlapping.
- Navigation or menu labels overlapping or clipping.
- Footer columns overflowing.
- Sticky header obscuring a focused control.

Required width overlap, clipping, overflow, or sticky-focus obstruction failures block C-PBI-027 approval.

## Runner

Run:

```powershell
npm run qa:epic-c:responsive
```

The runner writes:

```text
test-results/epic-c/batch-5/responsive-global-chrome-qa.json
```

Environment blockers are not pass results. They must be carried into C-PBI-027 as missing preview evidence.
