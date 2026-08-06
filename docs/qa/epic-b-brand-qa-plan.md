# Epic B Brand QA Plan

**PBI:** B-031
**Status:** Approved plan; execution required when a preview implementation exists
**Machine-readable source:** [data/epic-b-brand-qa-plan.json](../../data/epic-b-brand-qa-plan.json)

## Purpose

Epic B brand changes affect identity, visual style, product discovery, purchase
controls, support copy, policy context, media, metadata, accessibility, and
performance. This plan defines the evidence required before those changes can
move from repository planning to persistent preview review or production release.

The plan does not execute QA by itself. It defines the pages, viewports,
journeys, automated suites, manual checks, evidence naming, and signoffs used by
the Epic B QA runner and release review.

## Source Links

- Manual QA process: [docs/qa/manual-qa-evidence-process.md](manual-qa-evidence-process.md)
- Manual QA template: [docs/qa/manual-qa-evidence-template.md](manual-qa-evidence-template.md)
- Release checklist: [docs/release/release-checklist.md](../release/release-checklist.md)
- Release signoff: [docs/release/release-signoff-checklist.md](../release/release-signoff-checklist.md)
- QA runner: [scripts/run-epic-b-brand-qa.js](../../scripts/run-epic-b-brand-qa.js)
- Fixture source: [tests/fixtures/storefront-fixtures.json](../../tests/fixtures/storefront-fixtures.json)
- Performance budget: [data/brand-performance-budget.json](../../data/brand-performance-budget.json)
- Accessibility baseline: [docs/qa/storefront-quality-baseline.md](storefront-quality-baseline.md)
- Signoff workflow: [docs/brand/brand-governance-and-approval-workflow.md](../brand/brand-governance-and-approval-workflow.md)
- Evidence root: `docs/qa/evidence/epic-b`
- Result root: `test-results/epic-b`

## Evidence Naming

Use the rules from [docs/qa/manual-qa-evidence-process.md](manual-qa-evidence-process.md).
Epic B evidence uses:

- Manual evidence: `YYYY-MM-DD-epic-b-{scope}.md`
- Screenshots: `YYYY-MM-DD-epic-b-{page}-{viewport}-{check}.png`
- Automated reports: `epic-b-qa-{mode}-{timestamp}.json`

Each manual evidence file must identify the preview URL or theme ID, tester,
browser/device, scope, result, related PBIs, and follow-ups.

## Pages

The QA plan uses existing fixture records and environment-variable overrides.
Do not invent product or collection handles for Epic B evidence.

| Page | Category | Route source |
|---|---|---|
| Homepage | homepage | `/` from fixture records |
| Machines collection | collection | `TEST_COLLECTION_PATH`, fallback `/collections/machines` |
| Rhino search | search | `TEST_SEARCH_PATH`, fallback `/search?q=rhino` |
| Simple product | product | `/products/left-moss-pad` |
| Machine product | product | `TEST_MACHINE_PRODUCT_PATH`, fallback `/products/trimmaster` |
| Cart | cart | `/cart` |
| Contact | contact | `TEST_CONTACT_PATH`, fallback `/pages/contact` |
| Policy | policy | `TEST_POLICY_PATH`, fallback `/policies/privacy-policy` |

## Viewports

Required:

- `mobile-360`: 360 x 800
- `mobile-390`: 390 x 844
- `tablet-768`: 768 x 1024
- `desktop-1440`: 1440 x 900

Supplemental when practical:

- `desktop-1920`: 1920 x 1080

## Journeys

The machine-readable plan defines six journey categories:

- Identity
- Discovery
- Purchase
- Cart
- Support
- Policy

Each journey records the customer state, pages, checks, expected result, and
evidence. Purchase and cart journeys must prove the product purchase path, not
only the visual state.

## Automated Suites

Static suites are safe to run without preview credentials:

```powershell
npm run validate:epic-b-finalization
npm run qa:epic-b:static
```

The static plan includes these existing package scripts:

- `validate:epic-b-architecture`
- `validate:brand-launch-governance`
- `validate:brand-performance`
- `validate:registers`
- `validate:brand-claims`
- `validate:brand-assets`
- `validate:epic-b-finalization`

Preview suites require a persistent preview URL and fixture routes:

```powershell
npm run qa:epic-b:preview
```

Configured preview suites:

- `test:smoke`
- `test:ally`
- `test:brand-performance:release`
- `test:social-metadata`

Do not run preview suites unless `PREVIEW_URL` and required fixture variables
are available. Do not introduce another smoke or accessibility framework.

## Manual Checks

Required manual checks:

- Keyboard operation
- 200 percent zoom
- Text spacing
- Reduced motion
- Forced colors
- Mobile crops
- Placeholder content
- Claims review
- Logo legibility
- Focus visibility
- Heading hierarchy
- Product-card wrapping
- Product purchase path
- Cart state
- Form labels and errors
- Responsive image crops
- Social preview
- Favicon and browser identity
- Settings persistence
- Rollback rehearsal

Manual review must capture mobile and desktop evidence. Screenshots are required
for crop, focus, wrapping, and visual regression failures.

## Evidence Mapping

Code evidence belongs in pull requests and implementation records. Required
proof includes repository validation, Theme Check, relevant npm output, and
rollback instructions.

Admin evidence belongs in manual QA evidence and release notes. Required proof
includes before/after values or screenshots, preview theme target, rollback, and
confirmation that production was not changed.

Content evidence must identify the source register or approved copy source.
Sensitive copy must link to [data/legal-claims-register.json](../../data/legal-claims-register.json).

Media evidence must identify the media manifest or product-media owner, rights,
crop, alt text or accessibility alternative, and rollback or replacement path.
Repository-owned media is governed by [data/media-manifest.json](../../data/media-manifest.json).

## Signoff

Required for every Epic B preview acceptance:

- Brand Owner
- Engineering Owner
- QA and Release Approver
- Product Owner

Add role-specific signoff when the change touches that area:

- Business Owner for entity, supplier, support ownership, or commercial facts
- Legal or Claims Reviewer for sensitive claims
- Content Owner for copy, metadata, migration, or localization
- Media Owner for images, logos, diagrams, video posters, or social graphics
- Shopify Admin Owner for theme settings, products, pages, policies, Files, and uploads
- Support Owner for contact, repair, warranty routing, or post-purchase help

## Release Use

Before production release, the QA evidence must be referenced from
[docs/release/release-checklist.md](../release/release-checklist.md) and
[docs/release/release-signoff-checklist.md](../release/release-signoff-checklist.md).
Production publish remains blocked until release signoff, rollback readiness,
and required stakeholder approvals are complete.
