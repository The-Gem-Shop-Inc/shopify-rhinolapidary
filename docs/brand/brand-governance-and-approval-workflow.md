# Rhino Brand Governance and Approval Workflow

**PBI:** B-032  
**Status:** Draft for role assignment  
**Applies to:** Epic B and later storefront work that changes Rhino identity, visual presentation, content, media, legal claims, or customer-facing brand behavior.

## Purpose

This workflow prevents a theme code change, Shopify admin edit, media upload, or copy revision from being treated as approved merely because it is technically complete.

## Roles

Assign one person to each role. One person may hold several roles, but the approval responsibilities remain distinct.

| Role | Responsibility |
|---|---|
| Product Owner | Prioritizes PBIs, resolves scope, accepts completion evidence, and decides whether work advances to preview or release review. |
| Brand Owner | Approves positioning, visual direction, logo use, color, typography, voice, imagery, and final style-guide decisions. |
| Business Owner | Confirms operating responsibilities, supplier or distributor relationships, support ownership, fulfillment responsibility, and seller-of-record facts. |
| Legal or Claims Reviewer | Reviews trademarks, certifications, patents, warranties, exclusivity, manufacturer or supplier language, and other claims with legal or regulatory risk. |
| Engineering Owner | Reviews theme architecture, Liquid, CSS, JavaScript, JSON, upgrade safety, validation, performance, accessibility implementation, and rollback feasibility. |
| Shopify Admin Owner | Reviews theme-editor settings, Files, products, pages, policies, navigation, metafields, metaobjects, apps, and other admin changes. |
| Content Owner | Maintains approved copy, terminology, product claims, migration decisions, alt text, and localization ownership. |
| Media Owner | Confirms source files, usage permission, dimensions, crops, accessibility, file location, and replacement or retirement decisions. |
| QA and Release Approver | Confirms automated checks, manual evidence, accessibility, performance, release notes, rollback instructions, and release signoff. |

## Decision classes

### Class 1: Evidence collection

Examples: inventories, audits, screenshots, source URLs, current-value records.

Required approval:

- PBI author confirms source accuracy.
- Product Owner accepts completeness.
- Legal approval is not required unless the inventory itself asserts that a disputed claim is true.

### Class 2: Brand proposal

Examples: positioning, visual direction, color, typography, voice, icon style, photography direction.

Required approval:

- Brand Owner.
- Product Owner.
- Engineering Owner when the proposal creates implementation, accessibility, performance, or maintainability constraints.

### Class 3: Business identity or customer promise

Examples: manufacturer, supplier, fulfillment, support, repair, warranty, freight, return, exclusivity, certification, patent, or geographic availability statements.

Required approval:

- Business Owner.
- Legal or Claims Reviewer.
- Content Owner.
- Product Owner.

No Class 3 statement may be marked approved based only on a legacy webpage.

### Class 4: Repository implementation

Examples: Liquid, CSS, JavaScript, JSON templates, settings schema, locale files, theme assets, structured data.

Required approval:

- Engineering Owner.
- Applicable Brand or Content Owner.
- QA and Release Approver.
- Product Owner.

Required evidence:

- PBI branch.
- Repository validation.
- Theme Check.
- Relevant automated tests.
- Theme customization inventory update.
- Implementation record.
- Preview evidence.
- Rollback instructions.

### Class 5: Shopify admin or theme-editor implementation

Examples: logo, favicon, colors, typography, social links, products, pages, policies, navigation, Files, metafields, metaobjects, app blocks, app embeds.

Required approval:

- Shopify Admin Owner.
- Applicable Brand, Content, Business, or Legal reviewer.
- QA and Release Approver.
- Product Owner.

Required evidence:

- Admin change record.
- Before and after values or screenshots.
- Preview theme or draft content target.
- Rollback instructions.
- Release-note impact.
- Confirmation that production was not changed unless the release was explicitly approved.

### Class 6: Media implementation

Examples: logos, product images, diagrams, downloadable manuals, video thumbnails, social graphics.

Required approval:

- Media Owner.
- Brand Owner.
- Content Owner for alt text and captions.
- Engineering or Admin Owner according to storage location.
- Legal or Claims Reviewer when the asset contains a legal claim or protected mark.

Required evidence:

- Source and owner.
- Usage permission.
- Dimensions and format.
- Intended location.
- Alt text or accessibility alternative.
- Media manifest or product-media record.
- Replacement and rollback plan.

## Status model

Every Epic B artifact uses one of these statuses:

1. **Observed** — current evidence, not approval.
2. **Proposed** — drafted direction awaiting review.
3. **Needs review** — incomplete ownership, accuracy, legal, accessibility, performance, or implementation review.
4. **Approved** — all required role approvals recorded.
5. **Rejected** — excluded with rationale.
6. **Superseded** — replaced by a newer approved decision.
7. **Implemented in preview** — applied to a nonproduction theme or draft surface.
8. **Released** — published after release signoff.
9. **Retired** — intentionally removed with migration or replacement evidence.

“Approved” and “implemented” are separate states.

## Approval record

Use this block in the PBI implementation record or linked decision document:

| Field | Value |
|---|---|
| Decision or artifact | |
| PBI | |
| Version or commit | |
| Status | Proposed / Needs review / Approved / Rejected / Superseded |
| Brand Owner | |
| Business Owner | |
| Legal or Claims Reviewer | |
| Engineering Owner | |
| Shopify Admin Owner | |
| Content Owner | |
| Media Owner | |
| QA and Release Approver | |
| Product Owner | |
| Approval date | |
| Review or expiration date | |
| Conditions | |
| Evidence links | |

Only list roles that apply. A blank required role means the artifact is not approved.

## Workflow

1. **Collect evidence.** Record the source, evidence date, owner, rights status, and uncertainty.
2. **Classify the change.** Identify all applicable decision classes.
3. **Draft the proposal.** Keep observed evidence separate from proposed direction.
4. **Review constraints.** Evaluate legal claims, accessibility, performance, privacy, data ownership, Shopify admin impact, and upstream theme risk.
5. **Record decisions.** Mark each item approved, rejected, or needing review. Record rationale.
6. **Plan implementation.** Separate repository, admin, media, content, app, and legal work.
7. **Implement in preview.** Do not publish directly to production.
8. **Collect QA evidence.** Run applicable automated checks and manual review.
9. **Obtain release signoff.** Confirm approvals, rollback, release notes, and production target.
10. **Review after release.** Record regressions, superseded decisions, and claims with expiration dates.

## Escalation rules

- Conflicting brand and accessibility decisions resolve in favor of accessibility.
- Conflicting visual and performance decisions resolve in favor of the approved performance budget.
- Unverified legal or technical claims remain unpublished.
- When Rhino, The Gem Shop, and Silica-Gem role language conflicts, the Business Owner and Legal or Claims Reviewer must resolve it before implementation.
- When production state differs from repository or documentation, stop and reconcile the source of truth before release.
- When an approver is unavailable, the Product Owner must name an explicit substitute; silence is not approval.

## Minimum completion criteria for B-032

- A named owner or vacant designation exists for every role.
- The Product Owner confirms the decision classes and status model.
- The repository links this workflow from the project workflow or brand documentation index.
- Future Epic B PBIs reference this workflow in implementation records.