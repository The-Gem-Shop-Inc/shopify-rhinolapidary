# Rhino Lapidary Epic D PBI Handoff Package

**Epic:** Epic D - Homepage Transformation  
**Source backlog:** [Rhino Lapidary Storefront Backlog and Epics.md](Rhino%20Lapidary%20Storefront%20Backlog%20and%20Epics.md)  
**Created:** 2026-08-20  
**Status:** Ready for Product Owner review  
**ID note:** Epic D PBIs use `D-PBI-*` IDs to avoid collision with existing Epic A, Epic B, and Epic C tracker IDs.

## Coding Model Instruction Flow

Use this section as the first instruction set for any coding model, web agent, or IDE agent that receives one of these PBIs.

1. Read the assigned PBI and its listed repository sources before editing.
2. Confirm whether the PBI is **admin-only**, **drop-in**, **context-aware repository work**, or **measurement/documentation**.
3. Keep all work preview-first unless a release PBI explicitly permits production.
4. If the PBI is admin-only, do not edit repository code unless the PBI explicitly asks for a repository snapshot, fixture, or validation update.
5. If the PBI includes a drop-in artifact, create that file, register, validator, or test method exactly, then run the validation commands listed in the PBI.
6. If code changes depend on existing Liquid, JSON templates, theme settings, product data, section schema, or Shopify Admin content, do not paste partial code blindly. Use the included **Implementation handoff** and hand the work to a context-aware repository agent.
7. Prefer existing Trade sections when they satisfy the customer goal, accessibility requirement, and maintenance model.
8. Create a `rhino-*` section only when the content relationship is genuinely Rhino-specific and matches the approved section-pattern rules.
9. Do not invent collection handles, product handles, product claims, patent claims, warranty terms, freight promises, financing availability, testimonials, review counts, support hours, dealer locations, video URLs, trade-show dates, or international availability.
10. Do not weaken existing assertions in smoke, accessibility, social metadata, route identity, product-data, brand-claims, performance, global-chrome, or Theme Check validation.
11. Do not create new paid-app dependencies until native Shopify, Trade theme behavior, and small theme customizations have been evaluated.
12. For every Shopify Admin change, capture before state, after state, theme ID or admin location, rollback steps, and the validation output.
13. For every customer-facing copy change, run claims and placeholder validation and cite the approved source.
14. For every homepage section, document the customer outcome, source owner, content source, empty state, mobile behavior, accessibility expectation, performance budget effect, and success measure.

## Required Source Context

At minimum, read these files before starting any Epic D implementation PBI:

- [docs/Rhino Lapidary Storefront Backlog and Epics.md](Rhino%20Lapidary%20Storefront%20Backlog%20and%20Epics.md)
- [templates/index.json](../templates/index.json)
- [sections/rich-text.liquid](../sections/rich-text.liquid)
- [sections/image-banner.liquid](../sections/image-banner.liquid)
- [sections/image-with-text.liquid](../sections/image-with-text.liquid)
- [sections/collection-list.liquid](../sections/collection-list.liquid)
- [sections/featured-collection.liquid](../sections/featured-collection.liquid)
- [sections/featured-product.liquid](../sections/featured-product.liquid)
- [sections/featured-blog.liquid](../sections/featured-blog.liquid)
- [sections/video.liquid](../sections/video.liquid)
- [sections/multicolumn.liquid](../sections/multicolumn.liquid)
- [assets/rhino-custom.css](../assets/rhino-custom.css)
- [docs/architecture/rhino-custom-section-block-strategy.md](architecture/rhino-custom-section-block-strategy.md)
- [docs/brand/rhino-reusable-section-rules.md](brand/rhino-reusable-section-rules.md)
- [data/rhino-section-patterns.json](../data/rhino-section-patterns.json)
- [docs/brand/rhino-brand-positioning.md](brand/rhino-brand-positioning.md)
- [docs/brand/rhino-brand-style-guide.md](brand/rhino-brand-style-guide.md)
- [docs/brand/rhino-brand-voice-and-copy.md](brand/rhino-brand-voice-and-copy.md)
- [docs/brand/rhino-action-hierarchy.md](brand/rhino-action-hierarchy.md)
- [docs/brand/rhino-product-badges-and-trust-markers.md](brand/rhino-product-badges-and-trust-markers.md)
- [docs/brand/rhino-machine-family-identifiers.md](brand/rhino-machine-family-identifiers.md)
- [docs/brand/rhino-product-photography-art-direction.md](brand/rhino-product-photography-art-direction.md)
- [docs/brand/rhino-video-system.md](brand/rhino-video-system.md)
- [docs/brand/rhino-reassurance-microcopy.md](brand/rhino-reassurance-microcopy.md)
- [docs/brand/rhino-legal-claims-rules.md](brand/rhino-legal-claims-rules.md)
- [docs/architecture/metafield-metaobject-architecture.md](architecture/metafield-metaobject-architecture.md)
- [data/media-manifest.json](../data/media-manifest.json)
- [data/legal-claims-register.json](../data/legal-claims-register.json)
- [data/brand-content-migration-register.json](../data/brand-content-migration-register.json)
- [data/brand-performance-budget.json](../data/brand-performance-budget.json)
- [data/navigation-spec.json](../data/navigation-spec.json)
- [tests/fixtures/storefront-fixtures.json](../tests/fixtures/storefront-fixtures.json)
- [tests/storefront-smoke.spec.js](../tests/storefront-smoke.spec.js)
- [docs/qa/storefront-quality-baseline.md](qa/storefront-quality-baseline.md)
- [docs/qa/manual-qa-evidence-process.md](qa/manual-qa-evidence-process.md)
- [docs/release/release-checklist.md](release/release-checklist.md)
- [docs/release/release-signoff-checklist.md](release/release-signoff-checklist.md)

## Epic D Outcome

Epic D should turn the homepage from a simple introduction into a governed decision gateway:

- First-time visitors can understand what Rhino sells and choose a useful path within the first screen.
- Experienced buyers can quickly reach machines, accessories, consumables, parts, manuals, or contact paths.
- The machine ecosystem is visible without requiring customers to already know every product family name.
- Homepage proof, support, warranty, freight, financing, and education messages are source-backed and legally safe.
- Every homepage module has an explicit customer outcome and measurable validation.
- Homepage media makes the product and workshop context inspectable, not decorative.
- The page remains fast, accessible, mobile-usable, and safe to edit in the Shopify theme editor.

## Current Evidence Snapshot

- [templates/index.json](../templates/index.json) currently contains one `rich-text` section named `rhino_intro` with an H1, one paragraph, and buttons for `shopify://collections/machines` and `shopify://pages/contact`.
- The current homepage does not include a hero image, machine-family overview, customer-path chooser, parts or consumables path, proof section, education module, video module, support reassurance group, newsletter, featured products, testimonials, reviews, or homepage-specific measurement plan.
- Epic B's first preview implementation slice explicitly allowed only a limited homepage introduction and excluded a full homepage redesign.
- Existing Trade sections are available for rich text, image banners, image-with-text, collection lists, featured collections, featured products, featured blogs, videos, multicolumn content, and newsletter-style banners.
- Rhino custom section governance requires `sections/rhino-*.liquid`, `rhino-section` root classes, approved pattern IDs, no customer-facing placeholders, locale-backed schema labels, and governed content sources.
- `data/rhino-section-patterns.json` approves or plans section patterns for `trust-support`, `education`, `video`, `technical-diagram`, `compatibility`, `technical-specs`, and `comparison`; comparison remains planned and post-launch.
- `data/navigation-spec.json` currently verifies homepage, machines, catalog, search, cart, contact, manuals, and policy routes, but does not define homepage module destinations or section-level click targets.
- `tests/fixtures/storefront-fixtures.json` includes `/` as a required homepage fixture for preview testing.
- The performance budget prohibits immediate video embeds, autoplay media, synchronous third-party scripts, and excessive initial image weight.
- Brand and legal governance blocks unsupported manufacturer, supplier, exclusivity, certification, patent, universal warranty, freight, delivery-time, international availability, and financing claims.
- The media manifest contains Rhino-owned brand marks and UI icons, but launch-critical product photography gaps remain governed by the photography art-direction document and Shopify Admin audit.

## Recommended Epic D Batches

| Batch | PBIs | Goal |
|---|---|---|
| Batch 1 - Homepage model and evidence | D-PBI-001 through D-PBI-006 | Establish source hierarchy, current-state audit, section outcome model, content map, media inventory, and route contract before visible changes. |
| Batch 2 - First-screen decision gateway | D-PBI-007 through D-PBI-011 | Design and implement the governed hero, customer-path chooser, primary CTA hierarchy, mobile-first sequencing, and preview baseline. |
| Batch 3 - Product ecosystem modules | D-PBI-012 through D-PBI-018 | Add machine-family, featured machine, parts, consumables, comparison teaser, and product-card modules from approved sources. |
| Batch 4 - Trust, education, and lead paths | D-PBI-019 through D-PBI-025 | Add Why Rhino, support, freight/warranty, education, video, testimonial/review, newsletter, and institutional paths only when source-backed. |
| Batch 5 - QA, release, and measurement | D-PBI-026 through D-PBI-032 | Add accessibility, performance, responsive evidence, analytics plan, finalization runner, release docs, and preview signoff. |

## Full Epic D Backlog

| PBI | Title | Priority | Effort | Work area | Implementation mode |
|---|---|:---:|:---:|---|---|
| D-PBI-001 | Create the Epic D homepage source hierarchy and decision log | P0 | S | Documentation | Measurement/documentation |
| D-PBI-002 | Audit current homepage sections, content, routes, media, and Admin state | P0 | M | Mixed | Measurement/documentation |
| D-PBI-003 | Define a machine-readable homepage section outcome model | P0 | M | Product / Repository | Drop-in register and validator |
| D-PBI-004 | Map homepage content sources, owners, and claim approvals | P0 | M | Content / Legal | Measurement/documentation |
| D-PBI-005 | Inventory homepage media candidates and launch-critical asset gaps | P1 | M | Media / Content | Measurement/documentation |
| D-PBI-006 | Define homepage destination route contract without inventing handles | P0 | S | Repository / Admin | Context-aware update |
| D-PBI-007 | Define the homepage hero content model and approved first-screen promise | P1 | M | Product / Content / Design | Measurement/documentation |
| D-PBI-008 | Implement a preview-safe homepage hero with governed media and CTAs | P1 | M | Repository / Admin | Context-aware update |
| D-PBI-009 | Add primary customer-path choices for machines, parts, consumables, and support | P1 | M | Repository / Admin / Content | Context-aware update |
| D-PBI-010 | Apply homepage CTA hierarchy and action-label governance | P1 | S | Design / Content / QA | Measurement/documentation |
| D-PBI-011 | Validate first-screen and mobile sequencing across supported viewports | P1 | M | QA / Design | Drop-in test method |
| D-PBI-012 | Define the homepage machine-family overview content model | P1 | M | Product Data / Content | Measurement/documentation |
| D-PBI-013 | Implement a machine-family overview module without compatibility claims | P1 | L | Repository / Product Data | Context-aware update |
| D-PBI-014 | Add a flagship-machine feature module with source-backed product evidence | P1 | M | Repository / Content | Context-aware update |
| D-PBI-015 | Add parts-for-your-machine entry point with unresolved-data fallback | P1 | M | Repository / Admin / Product Data | Context-aware update |
| D-PBI-016 | Add consumables reorder entry point from approved product-role data | P2 | M | Repository / Product Data | Context-aware update |
| D-PBI-017 | Add product comparison teaser without implementing the full comparison tool | P2 | S | Content / Repository | Measurement/documentation |
| D-PBI-018 | Add featured collections or featured products using launch-safe merchandising rules | P2 | M | Admin / Repository | Context-aware update |
| D-PBI-019 | Define and implement a source-backed Why Rhino proof module | P1 | M | Content / Legal / Repository | Context-aware update |
| D-PBI-020 | Add homepage trust and support reassurance without overclaiming policies | P1 | M | Content / Legal / Repository | Context-aware update |
| D-PBI-021 | Add freight, shipping, pickup, warranty, and financing information paths | P1 | M | Content / Operations / Admin | Context-aware update |
| D-PBI-022 | Add educational and buying-guide entry points from approved content | P2 | M | Content / Admin | Context-aware update |
| D-PBI-023 | Add latest video or demonstration module with deferred loading and captions | P2 | M | Media / Repository / Privacy | Context-aware update |
| D-PBI-024 | Decide testimonial, review, and social-proof readiness for homepage use | P2 | S | Content / App / Legal | Measurement/documentation |
| D-PBI-025 | Add newsletter, dealer, school, club, or workshop inquiry entry point when owned | P2 | M | Admin / Forms / Content | Context-aware update |
| D-PBI-026 | Add homepage accessibility coverage and manual review checklist | P0 | M | Repository / QA | Drop-in test method |
| D-PBI-027 | Add homepage performance and media budget validation | P0 | M | Repository / QA | Drop-in validation method |
| D-PBI-028 | Create responsive homepage QA evidence plan | P1 | S | QA / Documentation | Measurement/documentation |
| D-PBI-029 | Define post-launch homepage measurement plan | P2 | S | Analytics / Product | Measurement/documentation |
| D-PBI-030 | Add Epic D QA runner and finalization validator | P0 | M | Repository / QA | Drop-in script pattern |
| D-PBI-031 | Update release documentation for homepage transformation | P1 | S | Documentation / Release | Measurement/documentation |
| D-PBI-032 | Conduct preview homepage signoff and production go/no-go | P0 | M | Mixed | Measurement/documentation |

---

## D-PBI-001 Create the Epic D Homepage Source Hierarchy and Decision Log

**Epic:** Epic D - Homepage Transformation  
**Work area:** Documentation  
**Type:** Discovery  
**Priority:** P0  
**Impact:** High  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Foundation  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: documentation`, `type: discovery`, `priority: p0`

### Problem or opportunity

The homepage will combine brand, product, support, media, merchandising, and Shopify Admin decisions. Without a source hierarchy, later implementation can mix approved evidence with unverified claims or theme-editor guesses.

### Evidence

- [templates/index.json](../templates/index.json) currently owns the homepage section order in source control.
- Epic B and Epic C introduced source-owned registers, implementation records, and finalization gates before broad storefront changes.
- Brand, legal, media, section-pattern, and performance rules already live in separate documents and data files.

### Proposed outcome

Create a single Epic D source hierarchy and decision log that defines which source wins for homepage content, routes, media, claims, metrics, theme settings, and rollback evidence.

### Scope

- Create `docs/architecture/epic-d-homepage-source-hierarchy.md`.
- List repository, Shopify Admin, media, product data, legal, analytics, and release sources.
- Define preview-only implementation and rollback evidence requirements.
- Identify unresolved decisions that block customer-facing homepage sections.

### Out of scope

- Implementing homepage sections.
- Approving claims, routes, media, testimonials, financing, or support copy.
- Publishing production theme changes.

### Acceptance criteria

- [ ] Source hierarchy names the owner for every homepage evidence class.
- [ ] Decision log separates approved facts from hypotheses and blocked claims.
- [ ] Preview and production responsibilities are explicit.
- [ ] Future PBI implementation records have a required source section.

### Implementation handoff

**Measurement method:** Follow the Epic C source hierarchy pattern and add homepage-specific rows for section order, module outcomes, media sources, content owner, legal-sensitive claims, route targets, and analytics ownership.

### Success measure

Homepage implementation can proceed without ambiguity about source priority or review ownership.

### Open questions

- Who is the final Product Owner for homepage section priority?
- Who approves homepage use of The Gem Shop, Silica-Gem, warranty, freight, and support role language?

---

## D-PBI-002 Audit Current Homepage Sections, Content, Routes, Media, and Admin State

**Epic:** Epic D - Homepage Transformation  
**Work area:** Mixed  
**Type:** Discovery  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Foundation  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: shopify-admin`, `area: qa`, `type: discovery`, `priority: p0`

### Problem or opportunity

The repository shows a minimal homepage, but Shopify Admin may have preview theme state, product assignments, image selections, or unpublished changes that are not obvious from `templates/index.json`.

### Evidence

- [templates/index.json](../templates/index.json) contains only one `rich-text` section named `rhino_intro`.
- Epic C showed that Admin-owned menu state can diverge from repository expectations and needs explicit reconciliation.
- Existing preview QA relies on fixture route `/`.

### Proposed outcome

Produce a current-state audit of the homepage across repository JSON, rendered preview, theme editor, route targets, product/collection dependencies, media, and validation coverage.

### Scope

- Document all homepage sections, settings, blocks, and route targets.
- Capture rendered screenshots at required baseline widths.
- Record the preview theme ID, production theme ID, and whether production is untouched.
- Identify Admin-only dependencies for collections, pages, blogs, forms, reviews, videos, and policy routes.
- Record existing homepage test coverage and gaps.

### Out of scope

- Redesigning the homepage.
- Changing Shopify Admin content.
- Adding or removing sections.

### Acceptance criteria

- [ ] Audit links repository homepage configuration to rendered preview evidence.
- [ ] Every current homepage link is resolved or listed as blocked.
- [ ] Current media and missing media are recorded.
- [ ] Admin-owned dependencies are listed with owner and rollback notes.

### Implementation handoff

**Measurement method:** Create `docs/architecture/epic-d-homepage-current-state-audit.md` and record screenshots under `docs/qa/evidence/epic-d/` using the manual QA evidence process.

### Success measure

Epic D starts from known current behavior rather than assumptions about the theme editor or rendered preview.

---

## D-PBI-003 Define a Machine-Readable Homepage Section Outcome Model

**Epic:** Epic D - Homepage Transformation  
**Work area:** Product / Repository  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Foundation  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: product`, `area: qa`, `type: improvement`, `priority: p0`

### Problem or opportunity

Epic D requires that every homepage section have a clear purpose and measurable customer outcome. If this remains prose-only, the homepage can drift into decorative or duplicative modules.

### Evidence

- The source backlog states that every homepage section should have a clear purpose and measurable customer outcome.
- Epic C used machine-readable IA, route, and QA registers to keep implementation measurable.
- Current `templates/index.json` does not identify section outcomes, owners, dependencies, or success measures.

### Proposed outcome

Create a machine-readable homepage section model that defines section IDs, outcomes, source owners, content sources, route targets, empty states, test requirements, and metrics.

### Scope

- Create `data/homepage-section-outcomes.json`.
- Create `schemas/homepage-section-outcomes.schema.json`.
- Create `scripts/validate-homepage-section-outcomes.js`.
- Add an npm script such as `validate:homepage-sections`.
- Require every planned homepage module to map to a customer outcome and route or behavior.

### Out of scope

- Rendering sections.
- Implementing analytics events.
- Approving final section order.

### Acceptance criteria

- [ ] Register validates against a schema.
- [ ] Each section has purpose, owner, source, empty behavior, route targets, accessibility notes, performance notes, and success measure.
- [ ] Sections with unapproved claims or missing routes are marked blocked or draft.
- [ ] Validator fails when customer-facing sections lack a measurable outcome.

### Implementation handoff

**Drop-in register and validator:** Model the structure after Epic C's navigation IA register and validator, but make the required keys homepage-specific. Do not infer valid section data from display titles alone.

### Success measure

Homepage section decisions are reviewable before code changes and machine-checkable during finalization.

---

## D-PBI-004 Map Homepage Content Sources, Owners, and Claim Approvals

**Epic:** Epic D - Homepage Transformation  
**Work area:** Content / Legal  
**Type:** Discovery  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Foundation  
**Suggested GitHub labels:** `epic: d`, `area: content`, `area: legal`, `area: homepage`, `needs-decision`, `type: discovery`, `priority: p0`

### Problem or opportunity

The homepage is the highest-risk place for broad proof claims such as reliability, patented features, warranty, freight, support, dealer status, manufacturing role, reviews, or financing. Those claims need explicit approval before they appear above the fold.

### Evidence

- [docs/brand/rhino-legal-claims-rules.md](brand/rhino-legal-claims-rules.md) blocks unsupported manufacturer, supplier, certification, patent, exclusivity, and universal warranty statements.
- [docs/brand/rhino-reassurance-microcopy.md](brand/rhino-reassurance-microcopy.md) requires legal, operations, product-data, and support approval for freight, warranty, return, pickup, and support claims.
- [data/legal-claims-register.json](../data/legal-claims-register.json) governs customer-facing claim status.

### Proposed outcome

Create a homepage content and claims map that ties each proposed message to an approved source or blocks it until approval exists.

### Scope

- Map hero promise, Why Rhino proof, support, warranty, freight, financing, testimonials, reviews, videos, and dealer/institutional messages.
- Identify safe neutral copy that can launch.
- Identify blocked copy requiring legal, operations, product, support, or business approval.
- Add homepage-specific records to the brand content migration register or a linked artifact.

### Out of scope

- Rewriting full policy pages.
- Approving legal-sensitive claims.
- Inventing proof points to fill missing sections.

### Acceptance criteria

- [ ] Every proposed homepage copy block has a source, owner, and approval state.
- [ ] Blocked claims are absent from implementation PBIs until approved.
- [ ] Claims validator covers newly added customer-facing copy.
- [ ] Implementation records cite approved source documents.

### Implementation handoff

**Measurement method:** Extend the brand content migration register or create `docs/brand/epic-d-homepage-content-claims-map.md`, then require `npm run validate:brand-claims` and `npm run check:placeholders` before preview signoff.

### Success measure

Homepage copy can create trust without unsupported legal, operational, or product claims.

### Open questions

- Is financing available, and who owns the source of truth?
- Are testimonials or reviews approved for homepage use?
- Which proof points, if any, can use patent or differentiating-feature language?

---

## D-PBI-005 Inventory Homepage Media Candidates and Launch-Critical Asset Gaps

**Epic:** Epic D - Homepage Transformation  
**Work area:** Media / Content  
**Type:** Discovery  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Foundation  
**Suggested GitHub labels:** `epic: d`, `area: media`, `area: homepage`, `needs-content`, `type: discovery`, `priority: p1`

### Problem or opportunity

The homepage needs real product, workshop, process, or machine imagery. Generic or decorative media would undercut inspection of expensive equipment and may hide missing product photography.

### Evidence

- [docs/brand/rhino-product-photography-art-direction.md](brand/rhino-product-photography-art-direction.md) identifies launch-critical machine photography gaps and requires controlled product views.
- [data/media-manifest.json](../data/media-manifest.json) contains Rhino-owned brand and icon assets, not a complete homepage image set.
- The current homepage in [templates/index.json](../templates/index.json) uses no image media.

### Proposed outcome

Create an inventory of usable homepage media candidates, missing assets, required alt text, source ownership, crop safety, and launch blockers.

### Scope

- Audit repository-owned and Shopify Admin media candidates for hero, machine-family, workshop/process, support, and video thumbnails.
- Record source, rights, dimensions, alt-text owner, crop risks, and whether media is launch-ready.
- Identify which modules can launch without media and which must wait.
- Define fallback behavior for missing media.

### Out of scope

- Uploading product media.
- Commissioning photography.
- Editing product media in Shopify Admin.

### Acceptance criteria

- [ ] Homepage media inventory exists and links to source evidence.
- [ ] Hero and first-screen media cannot launch with unresolved rights or crop risk.
- [ ] Each informative image has alt-text guidance.
- [ ] Media candidates are added to `data/media-manifest.json` when repository-owned.

### Implementation handoff

**Measurement method:** Add a homepage section to the media gap register and validate repository-owned assets with `npm run validate:media`.

### Success measure

Homepage media improves product understanding without introducing rights, accessibility, crop, or performance failures.

---

## D-PBI-006 Define Homepage Destination Route Contract Without Inventing Handles

**Epic:** Epic D - Homepage Transformation  
**Work area:** Repository / Admin  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Foundation  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: navigation`, `area: qa`, `type: improvement`, `priority: p0`

### Problem or opportunity

Homepage modules will add links to machines, parts, consumables, support, manuals, education, quote/contact, policy, and possibly institutional paths. A broken or invented route in a homepage CTA creates immediate launch friction.

### Evidence

- [data/navigation-spec.json](../data/navigation-spec.json) currently verifies only global navigation and utility routes.
- The homepage currently links to `shopify://collections/machines` and `shopify://pages/contact`.
- Epic C established route identity checks for global chrome and policy links.

### Proposed outcome

Create a homepage route contract that validates every homepage destination before the destination appears in preview.

### Scope

- Add homepage destination records to `data/navigation-spec.json` or a dedicated homepage route register.
- Mark each route as approved, draft, blocked, or optional.
- Include route purpose, source owner, section ID, and test fixture where applicable.
- Validate rendered homepage links against the route contract.

### Out of scope

- Creating missing pages or collections.
- Renaming routes.
- Adding navigation menu items.

### Acceptance criteria

- [ ] Every homepage CTA and card link is represented in a route contract.
- [ ] Required homepage routes resolve in preview before signoff.
- [ ] Draft or blocked routes are not rendered as customer-facing links.
- [ ] Validator does not rely on production URLs unless a release PBI approves production testing.

### Implementation handoff

**Context-aware update:** Extend the existing navigation route validation pattern with homepage-specific section ownership. Avoid inventing handles for parts, consumables, guides, videos, financing, or dealer pages.

### Success measure

Homepage CTAs do not lead to 404s, password pages, empty pages, or unapproved destinations.

---

## D-PBI-007 Define the Homepage Hero Content Model and Approved First-Screen Promise

**Epic:** Epic D - Homepage Transformation  
**Work area:** Product / Content / Design  
**Type:** Discovery  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: content`, `area: branding`, `needs-decision`, `type: discovery`, `priority: p1`

### Problem or opportunity

The first screen must explain Rhino's value and route customers to useful next steps without relying on a generic Trade intro or unapproved claims.

### Evidence

- [templates/index.json](../templates/index.json) currently uses a text-only H1 and two buttons.
- [docs/brand/rhino-brand-positioning.md](brand/rhino-brand-positioning.md) proposes technical clarity, workshop practicality, ecosystem confidence, purchase reassurance, and craft respect as supporting promises, but marks the positioning as not approved for storefront use.
- [docs/brand/rhino-action-hierarchy.md](brand/rhino-action-hierarchy.md) limits primary CTA use.

### Proposed outcome

Define a hero content model with approved heading, subcopy, media requirement, primary action, secondary action, and fallback behavior for unavailable media or unapproved claims.

### Scope

- Decide the first-screen customer promise.
- Choose safe CTA destinations from the homepage route contract.
- Define mobile order, H1 ownership, image requirements, and above-the-fold height constraints.
- Record blocked proof claims separately.

### Out of scope

- Implementing the hero.
- Producing new photography.
- Approving final brand positioning.

### Acceptance criteria

- [ ] Hero model has approved copy or safe neutral draft copy.
- [ ] Hero includes no unsupported manufacturer, patent, exclusivity, warranty, freight, or performance claim.
- [ ] Primary and secondary actions follow the action hierarchy.
- [ ] Hero media source and fallback are documented.

### Implementation handoff

**Measurement method:** Add a `hero` section record to `data/homepage-section-outcomes.json` and cite the approved content source before implementation.

### Success measure

The first screen helps customers understand the storefront and choose a path without creating legal or operational risk.

---

## D-PBI-008 Implement a Preview-Safe Homepage Hero With Governed Media and CTAs

**Epic:** Epic D - Homepage Transformation  
**Work area:** Repository / Admin  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: theme`, `area: media`, `area: accessibility`, `priority: p1`

### Problem or opportunity

The homepage needs a distinctive first-screen presentation, but a bespoke hero should not bypass Trade section behavior, theme-editor usability, media performance, heading order, or rollback requirements.

### Evidence

- Trade provides [sections/image-banner.liquid](../sections/image-banner.liquid), [sections/image-with-text.liquid](../sections/image-with-text.liquid), and [sections/rich-text.liquid](../sections/rich-text.liquid).
- Current `templates/index.json` uses only a `rich-text` section.
- The performance budget limits initial image weight and prohibits immediate video embeds.

### Proposed outcome

Implement the approved hero in the persistent preview using the simplest section approach that satisfies content, media, accessibility, and performance requirements.

### Scope

- Prefer an existing Trade section when it can meet the model.
- Create a `rhino-*` section only if the approved hero relationship cannot be represented safely by Trade sections.
- Update `templates/index.json` for preview-safe section order.
- Reserve media dimensions and responsive crops.
- Keep the hero editable by merchants without exposing unsafe heading-level controls.

### Out of scope

- Full homepage implementation.
- Autoplay video hero.
- New third-party scripts or apps.
- Production publish.

### Acceptance criteria

- [ ] Hero renders one page-level H1.
- [ ] Primary and secondary actions are keyboard reachable and route-valid.
- [ ] Media has approved source, alt treatment, crop safety, and responsive dimensions.
- [ ] No customer-facing placeholder copy appears.
- [ ] Rollback restores the previous homepage intro configuration.

### Implementation handoff

**Context-aware update:** Start with existing Trade section capabilities. If a new Rhino section is required, follow `rhino-reusable-section-rules.md`, add a pattern record if necessary, and run section, hardcoded-string, media, claims, accessibility, smoke, and performance validation.

### Success measure

The homepage first screen feels intentionally Rhino-owned while remaining accessible, fast, governed, and reversible.

---

## D-PBI-009 Add Primary Customer-Path Choices for Machines, Parts, Consumables, and Support

**Epic:** Epic D - Homepage Transformation  
**Work area:** Repository / Admin / Content  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: navigation`, `area: content`, `needs-admin`, `priority: p1`

### Problem or opportunity

Rhino serves different journeys: new buyers, experienced buyers, current owners, support seekers, and mobile visitors. The homepage should route these users without forcing them through product names alone.

### Evidence

- The source backlog lists customer paths such as shop machines, shop accessories, find parts for your machine, consumables reorder, support contact, and education.
- Current homepage intro links only to Machines and Contact.
- Epic C verified primary navigation routes but did not create homepage path-choice modules.

### Proposed outcome

Add a homepage path-choice module that routes visitors to the most important launch-safe destinations with clear labels and no unsupported promises.

### Scope

- Define 3 to 5 primary path choices for launch.
- Use approved route targets only.
- Include concise descriptions that distinguish machines, parts, consumables, support, and learning paths.
- Confirm mobile layout and keyboard order.

### Out of scope

- Implementing visual parts finder logic.
- Creating missing collections or support pages.
- Adding account-specific personalization.

### Acceptance criteria

- [ ] Each path has an approved destination route.
- [ ] Labels describe the customer task, not only internal category names.
- [ ] Missing destination paths are omitted or shown only as approved non-link text.
- [ ] Cards or links are usable at 360 px and 200% zoom.

### Implementation handoff

**Context-aware update:** Use `multicolumn`, `collection-list`, or a governed Rhino section depending on whether the path model needs source-backed state, icons, or empty behavior. Link every route to D-PBI-006.

### Success measure

Visitors can reach the right product or support path from the homepage without knowing Rhino's product taxonomy in advance.

---

## D-PBI-010 Apply Homepage CTA Hierarchy and Action-Label Governance

**Epic:** Epic D - Homepage Transformation  
**Work area:** Design / Content / QA  
**Type:** Improvement  
**Priority:** P1  
**Impact:** Medium  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: content`, `area: accessibility`, `priority: p1`

### Problem or opportunity

Homepage modules can easily accumulate competing buttons such as Shop, Learn more, Contact, Request quote, Watch video, and Sign up. Without hierarchy, customers cannot tell which action matters.

### Evidence

- [docs/brand/rhino-action-hierarchy.md](brand/rhino-action-hierarchy.md) defines primary, secondary, tertiary, support, destructive, icon, and external link roles.
- The current homepage has two button labels: `Shop machines` and `Contact us`.
- Epic D will add multiple modules with competing actions.

### Proposed outcome

Create homepage-specific CTA rules and a validation checklist that enforce one primary action per action group, specific labels, route ownership, and safe support/commerce separation.

### Scope

- Define CTA roles for hero, path chooser, machine family, featured product, support, education, newsletter, and dealer/institutional modules.
- Replace generic labels where context is insufficient.
- Validate visible and accessible names.
- Record external-link and support-action treatment.

### Out of scope

- Creating a new button system.
- Changing global product purchase actions.
- Redesigning header or footer CTAs.

### Acceptance criteria

- [ ] Each action group has at most one primary CTA.
- [ ] Support actions do not outrank commerce actions unless the section is support-specific.
- [ ] Labels name the action or destination.
- [ ] Keyboard focus order follows visual order.

### Implementation handoff

**Measurement method:** Add homepage CTA checks to the section outcome model and preview QA plan. Use role/name selectors for key actions in Playwright rather than brittle class selectors.

### Success measure

Homepage actions are scannable, specific, and accessible without visual clutter.

---

## D-PBI-011 Validate First-Screen and Mobile Sequencing Across Supported Viewports

**Epic:** Epic D - Homepage Transformation  
**Work area:** QA / Design  
**Type:** Improvement  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: mobile`, `area: qa`, `priority: p1`

### Problem or opportunity

Homepage design often passes desktop review but fails on mobile when the hero consumes the whole screen, CTAs wrap poorly, or section sequencing hides the next useful path.

### Evidence

- The storefront quality baseline defines required viewports from 360 px mobile through 1920 px desktop.
- The source backlog names mobile visitors from YouTube, social, QR codes, and trade shows as a key audience.
- Current homepage has no complex responsive behavior, so Epic D changes introduce new layout risk.

### Proposed outcome

Add first-screen and mobile sequencing validation for the homepage hero, customer paths, section order, CTA wrapping, and next-section visibility.

### Scope

- Test 360, 390, 430, 768, 1024, 1280, 1440, and 1920 widths.
- Confirm H1, proposition, primary action, and next useful path are visible without incoherent overlap.
- Confirm sticky header does not cover focused or anchored content.
- Capture screenshots for initial load and first scroll.

### Out of scope

- Visual pixel-perfect approval.
- Testing every homepage section variation.

### Acceptance criteria

- [ ] No unintended horizontal scrolling.
- [ ] First-screen content does not overlap global header or subsequent content.
- [ ] Buttons and long labels wrap without clipping.
- [ ] Next useful homepage path is visible or reachable without dead space.

### Implementation handoff

**Drop-in test method:** Add `tests/homepage-responsive.spec.js` or include homepage states in an Epic D QA runner. Reuse preview unlock helpers and fixture route `/`.

### Success measure

The transformed homepage works as a mobile-first decision gateway, not just a desktop composition.

---

## D-PBI-012 Define the Homepage Machine-Family Overview Content Model

**Epic:** Epic D - Homepage Transformation  
**Work area:** Product Data / Content  
**Type:** Discovery  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: product-data`, `area: content`, `needs-admin`, `priority: p1`

### Problem or opportunity

Customers need to understand the Rhino machine ecosystem, but family identifiers are not compatibility proof and several technical details remain unresolved.

### Evidence

- [docs/brand/rhino-machine-family-identifiers.md](brand/rhino-machine-family-identifiers.md) defines launch family names and warns that identifiers are not proof of compatibility.
- [data/rhino-section-patterns.json](../data/rhino-section-patterns.json) treats comparison as planned and post-launch.
- The source backlog calls for a machine-family overview and product comparison teaser on the homepage.

### Proposed outcome

Define a homepage machine-family overview model that introduces machine families by role, operation, and route without asserting unresolved specs or compatibility.

### Scope

- Select launch-visible machine families.
- Define family display name, customer role, task summary, icon source, route target, and blocked/spec fields.
- Document which fields come from product data, metaobjects, or approved content.
- Define empty behavior when a family route or product data is not ready.

### Out of scope

- Full machine comparison.
- Compatibility selectors.
- Product metafield or metaobject creation.
- Technical specification resolution.

### Acceptance criteria

- [ ] Every visible family has an approved display name and route.
- [ ] Descriptions avoid unresolved technical specifications.
- [ ] Family identifiers are not presented as compatibility guarantees.
- [ ] Missing family data does not produce empty or misleading homepage cards.

### Implementation handoff

**Measurement method:** Add machine-family rows to the homepage section outcome model and link to the machine-family identifier guide. If structured Admin data is unavailable, use safe editorial copy with explicit owner approval.

### Success measure

Customers can orient themselves within the machine lineup without being misled by unverified product data.

---

## D-PBI-013 Implement a Machine-Family Overview Module Without Compatibility Claims

**Epic:** Epic D - Homepage Transformation  
**Work area:** Repository / Product Data  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** L  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: theme`, `area: product-data`, `area: accessibility`, `priority: p1`

### Problem or opportunity

A visible machine-family overview can help customers choose where to start, but the implementation must not hardcode technical facts, overstate compatibility, or create a hard-to-maintain custom layout.

### Evidence

- Rhino family icons exist in [data/media-manifest.json](../data/media-manifest.json).
- Custom section rules require pattern IDs and governed content sources for Rhino sections.
- Existing Trade sections may support simple collection or multicolumn layouts.

### Proposed outcome

Implement a homepage machine-family module that shows approved families, concise role descriptions, and route-valid actions.

### Scope

- Choose Trade section or Rhino section based on D-PBI-012.
- Render approved family names, icons or media, role summaries, and links.
- Handle missing family records by omitting incomplete cards.
- Ensure heading hierarchy, keyboard access, and screen-reader names are correct.

### Out of scope

- Compatibility badges.
- Full spec tables.
- Product comparison interactions.
- App-based quizzes.

### Acceptance criteria

- [ ] Each visible family links to an approved collection, page, or product route.
- [ ] No visible copy claims compatibility or unresolved specs.
- [ ] Icons are decorative or have appropriate accessible labels.
- [ ] Module remains usable at 360 px and 200% zoom.
- [ ] Section validates with Rhino section and brand validators when custom code is used.

### Implementation handoff

**Context-aware update:** If using a custom section, create `sections/rhino-machine-family-overview.liquid` only after adding or confirming an approved pattern in `data/rhino-section-patterns.json`. Prefer structured settings or data sources over hardcoded cards.

### Success measure

Homepage visitors can identify the relevant machine family path with less reliance on search or support contact.

---

## D-PBI-014 Add a Flagship-Machine Feature Module With Source-Backed Product Evidence

**Epic:** Epic D - Homepage Transformation  
**Work area:** Repository / Content  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: content`, `area: product-data`, `needs-content`, `priority: p1`

### Problem or opportunity

The homepage should spotlight a flagship or representative machine, but the feature must use product-specific evidence instead of broad claims or unresolved technical copy.

### Evidence

- The source backlog calls for a flagship-machine feature and differentiating features.
- Fixture data includes a machine product at `/products/trimmaster`.
- Product photography guidance identifies missing machine views and launch-critical media gaps.

### Proposed outcome

Add a flagship-machine module that presents one approved machine with media, role summary, price or availability treatment only when source-backed, and route-valid CTAs.

### Scope

- Select the flagship machine and source product route.
- Define what data can safely appear on the homepage.
- Include approved media or launch without media only if the design remains useful.
- Add CTA such as `View machine details` or `Compare machines` only when routes are approved.

### Out of scope

- Machine product page redesign.
- Full comparison tool.
- Changing purchase model.
- Writing new technical specs.

### Acceptance criteria

- [ ] Featured machine selection is documented with Product Owner approval.
- [ ] Product data and copy are source-backed.
- [ ] Media has approved source, crop, and alt treatment.
- [ ] Section omits blocked specs, warranty, freight, patent, or exclusivity claims.

### Implementation handoff

**Context-aware update:** Use `featured-product`, `image-with-text`, or a Rhino section depending on whether the source-backed fields are product-driven or editorial. Do not parse technical details from product description HTML.

### Success measure

Visitors see a concrete Rhino machine path and can continue to product detail without misleading preview copy.

---

## D-PBI-015 Add Parts-for-Your-Machine Entry Point With Unresolved-Data Fallback

**Epic:** Epic D - Homepage Transformation  
**Work area:** Repository / Admin / Product Data  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: product-data`, `area: navigation`, `needs-admin`, `priority: p1`

### Problem or opportunity

Existing Rhino owners need a clear way to find compatible replacement parts. If structured compatibility data is incomplete, the homepage must not imply a precise parts finder exists.

### Evidence

- The source backlog calls for `Find parts for your machine`.
- [docs/brand/rhino-product-badges-and-trust-markers.md](brand/rhino-product-badges-and-trust-markers.md) forbids deriving compatibility from titles, tags, dimensions, or family resemblance.
- [data/rhino-section-patterns.json](../data/rhino-section-patterns.json) approves a compatibility pattern but requires approved compatibility relations.

### Proposed outcome

Add a homepage entry point for parts that routes to approved parts content when available, or to an approved support/contact fallback when compatibility data is not ready.

### Scope

- Identify approved parts destination route or fallback.
- Define safe copy that does not promise a working compatibility selector unless it exists.
- Include support fallback for unconfirmed compatibility.
- Add route validation and section outcome record.

### Out of scope

- Building a visual parts finder.
- Creating compatibility metafields.
- Creating QR code flows.
- Guaranteeing part fitment.

### Acceptance criteria

- [ ] Entry point has an approved route or approved non-link fallback.
- [ ] Copy says `confirmed compatible` only when structured compatibility source exists.
- [ ] Support fallback is owned and route-valid.
- [ ] No compatibility is inferred from product title or collection membership.

### Implementation handoff

**Context-aware update:** Gate the homepage parts module on explicit route and copy approval. If the route is not ready, render a support-first path such as an approved contact action rather than a fake selector.

### Success measure

Current owners get a responsible path to parts without being misdirected by incomplete compatibility data.

---

## D-PBI-016 Add Consumables Reorder Entry Point From Approved Product-Role Data

**Epic:** Epic D - Homepage Transformation  
**Work area:** Repository / Product Data  
**Type:** Feature  
**Priority:** P2  
**Impact:** Medium  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Post-Launch  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: product-data`, `area: merchandising`, `priority: p2`

**Batch status (2026-08-27):** Appropriately blocked — preview-safe collection/page/search inspection found no approved, published aggregate consumables destination. The generic one-product `Home page` collection is not consumables governance. No module or unsupported reorder/product-role claim was added; structured relationships are handed to Epic E/G.

### Problem or opportunity

Returning buyers may want to reorder known consumables quickly, but the homepage must not expose unverified product-role labels, incorrect collection membership, or unsupported subscription behavior.

### Evidence

- The source backlog calls for popular replacement parts and consumables reorder sections.
- Product badge governance proposes `rhino.product_class` for product role.
- Current homepage has no returning-buyer or reorder path.

### Proposed outcome

Add a consumables reorder entry point that routes customers to an approved consumables collection, search path, or filtered experience.

### Scope

- Confirm consumable product-role data or collection ownership.
- Define safe route and label.
- Use product cards or a collection link only when the data is reliable.
- Avoid subscription or reorder-reminder language unless approved separately.

### Out of scope

- Account order-history reorder.
- Subscriptions.
- Saved machine ownership.
- Back-in-stock alerts.

### Acceptance criteria

- [ ] Consumables route is approved and validates.
- [x] Product-role claims come from approved data or are omitted.
- [x] Section omits subscription or reminder claims unless a separate system exists.
- [ ] Mobile layout supports returning-buyer scanning.

### Implementation handoff

**Context-aware update:** Prefer a simple collection or task-link section until structured product-role data is reliable enough for automated merchandising.

### Success measure

Returning customers can reach consumables faster without creating false product categorization.

---

## D-PBI-017 Add Product Comparison Teaser Without Implementing the Full Comparison Tool

**Epic:** Epic D - Homepage Transformation  
**Work area:** Content / Repository  
**Type:** Improvement  
**Priority:** P2  
**Impact:** Medium  
**Effort:** S  
**Confidence:** Medium  
**Suggested milestone:** Post-Launch  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: comparison`, `area: product-data`, `priority: p2`

**Batch status (2026-08-27):** Complete with deferred dependency — no truthful comparison or machine-selection destination exists, so the teaser is intentionally omitted until Epic I or approved buying guidance supplies one. The planned comparison pattern is automation-gated from rendering.

### Problem or opportunity

A comparison entry point can help customers choose machines, but the full comparison experience belongs to Epic I and depends on structured, resolved product data.

### Evidence

- The source backlog includes a product comparison teaser under Epic D and a full comparison experience under Epic I.
- `data/rhino-section-patterns.json` marks comparison as `planned` and `post_launch`.
- Machine specification conflicts are tracked separately from homepage planning.

### Proposed outcome

Add a lightweight teaser or editorial route to future comparison guidance without implying that a full interactive comparison tool is already available.

### Scope

- Define safe teaser copy and destination.
- Link only to an approved comparison page, buying guide, or machine collection.
- Identify data fields required before full comparison work begins.

### Out of scope

- Building side-by-side comparison.
- Implementing a questionnaire or quiz.
- Creating persistent compare trays.

### Acceptance criteria

- [x] Teaser does not render as an interactive comparison table.
- [x] Destination route is approved or section remains omitted.
- [x] Copy clarifies the next step without unsupported recommendations.
- [x] Full comparison requirements are handed off to Epic I.

### Implementation handoff

**Measurement method:** Keep this as editorial or route-only until `comparison` becomes an approved launch pattern with source-backed data.

### Success measure

Customers see a path toward machine selection guidance without depending on unfinished comparison infrastructure.

---

## D-PBI-018 Add Featured Collections or Featured Products Using Launch-Safe Merchandising Rules

**Epic:** Epic D - Homepage Transformation  
**Work area:** Admin / Repository  
**Type:** Feature  
**Priority:** P2  
**Impact:** Medium  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: merchandising`, `area: shopify-admin`, `priority: p2`

**Batch status (2026-08-27):** Complete — audited Machines and EM-1 as launch-safe candidates and made an explicit no-add decision. The current primary Machines route, machine-family module, and lightweight EM-1 flagship already provide the useful merchandising outcome; another native featured section would duplicate destinations and assets.

### Problem or opportunity

Homepage merchandising can expose useful products and collections, but ungoverned featured sections can show empty collections, poor product images, incorrect product roles, or unsupported badges.

### Evidence

- Trade provides [sections/featured-collection.liquid](../sections/featured-collection.liquid), [sections/featured-product.liquid](../sections/featured-product.liquid), and [sections/collection-list.liquid](../sections/collection-list.liquid).
- Existing smoke tests accept a collection product grid or empty collection state, but homepage-specific merchandising checks do not exist.
- Product badge rules limit card labels and source ownership.

### Proposed outcome

Add featured collection or product modules only when the selected collection/product has approved purpose, inventory behavior, image quality, and route safety.

### Scope

- Select candidate collections or products with Merchandising/Product Owner approval.
- Confirm visible products, images, prices, availability, and route behavior.
- Keep product-card badge display within approved limits.
- Record empty collection behavior.

### Out of scope

- Creating bundles.
- Editing product prices or inventory.
- Adding a recommendation app.
- Rebuilding product cards.

### Acceptance criteria

- [x] Featured collection/product selections are documented.
- [ ] Section handles empty or sold-out states without broken layout.
- [ ] Product cards do not exceed badge limits.
- [ ] Links and add-to-cart pathways remain valid where rendered.

### Implementation handoff

**Context-aware update:** Prefer native Trade featured sections before custom code. If Shopify Admin selects collections/products, capture before/after theme settings and rollback.

### Success measure

Homepage merchandising sends customers to launch-ready products without exposing data-quality problems.

---

## D-PBI-019 Define and Implement a Source-Backed Why Rhino Proof Module

**Epic:** Epic D - Homepage Transformation  
**Work area:** Content / Legal / Repository  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: branding`, `area: legal`, `needs-content`, `priority: p1`

**Batch status (2026-08-27):** Complete — exactly three Product Owner-approved statements from the governed Vejdi Ziyansiz source record render in a text-only Why Rhino module. Additional engineering facts remain a future enhancement, while broad manufacturer, supplier, superiority, quality, reliability, and durability claims remain blocked.

### Problem or opportunity

The homepage should explain why customers should consider Rhino, but broad value propositions can become unsupported durability, innovation, patent, exclusivity, or service claims.

### Evidence

- The source backlog calls for `Why Rhino`, patented or differentiating features, reliability, and support messaging.
- Brand positioning proposes technical clarity, workshop practicality, ecosystem confidence, purchase reassurance, and craft respect.
- Legal claims rules block patent, certification, supplier, manufacturer, warranty, and exclusivity statements without approval.

### Proposed outcome

Create a proof module using approved, specific, low-risk statements that support the Rhino brand without legal overreach.

### Scope

- Select 3 to 5 proof points with source owners.
- Separate safe neutral messages from blocked claims.
- Use icons or concise text only when they add understanding.
- Validate every claim before rendering.

### Out of scope

- Patent claim publication.
- Unsupported durability or superiority claims.
- Competitor comparisons.
- Testimonials or reviews.

### Acceptance criteria

- [x] Every proof point has an approved source or is marked blocked.
- [x] No universal warranty, parts availability, support, or performance claim appears.
- [x] Module is accessible and does not rely on icons alone.
- [x] Claims validator passes.

### Implementation handoff

**Context-aware update:** Use a Trade multicolumn/rich-text section if possible. Use a Rhino section only if the proof points need governed source fields and empty behavior.

### Success measure

Visitors understand Rhino's practical value without the homepage making claims the business cannot yet verify.

---

## D-PBI-020 Add Homepage Trust and Support Reassurance Without Overclaiming Policies

**Epic:** Epic D - Homepage Transformation  
**Work area:** Content / Legal / Repository  
**Type:** Feature  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: support`, `area: legal`, `needs-decision`, `priority: p1`

### Problem or opportunity

High-price equipment buyers need reassurance about support, manuals, parts, policies, and contact paths. The homepage can reduce uncertainty, but only if messages are accurate and operationally owned.

### Evidence

- [docs/brand/rhino-reassurance-microcopy.md](brand/rhino-reassurance-microcopy.md) defines source owners for freight, pickup, international availability, warranty, support contact, repairs, replacement parts, and damage procedures.
- Epic C verified policy and manual discoverability in global chrome.
- Current homepage offers only a generic `Contact us` action.

### Proposed outcome

Add a trust/support module that exposes approved paths such as manuals, contact support, warranty details, shipping policy, and replacement parts without summarizing policy terms incorrectly.

### Scope

- Select support and reassurance items from approved sources.
- Link to verified policy, manual, contact, or support destinations.
- Use neutral wording for unresolved responsibilities.
- Ensure section does not replace full policies.

### Out of scope

- Writing policy text.
- Changing support hours or contact ownership.
- Creating repair or warranty workflows.
- Adding live chat or support apps.

### Acceptance criteria

- [ ] Each trust item has source owner and route target.
- [ ] Warranty and freight summaries are neutral unless approved.
- [ ] Support contact does not promise response time or repair responsibility without approval.
- [ ] Policy links remain route-valid.

### Implementation handoff

**Context-aware update:** Use the approved `trust-support` section pattern or Trade sections. Do not hardcode contact details unless identity architecture and support ownership are approved.

### Success measure

Customers can find reassurance and support paths before purchase without being given policy shortcuts that create risk.

---

## D-PBI-021 Add Freight, Shipping, Pickup, Warranty, and Financing Information Paths

**Epic:** Epic D - Homepage Transformation  
**Work area:** Content / Operations / Admin  
**Type:** Improvement  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: shipping`, `area: support`, `needs-decision`, `priority: p1`

### Problem or opportunity

Heavy machinery buyers need logistics and payment clarity before purchase. The homepage should route to that information, but it must not imply fixed freight rates, pickup eligibility, warranty duration, international support, or financing availability unless those are approved.

### Evidence

- The source backlog includes warranty reassurance, shipping or freight explanation, and financing or installment explanation.
- [docs/brand/rhino-reassurance-microcopy.md](brand/rhino-reassurance-microcopy.md) blocks universal freight amounts, unverified delivery windows, and universal warranty duration.
- [data/navigation-spec.json](../data/navigation-spec.json) currently validates shipping and refund policy routes.

### Proposed outcome

Add route-safe informational paths for freight, shipping, pickup, warranty, and financing readiness.

### Scope

- Confirm which logistics and payment topics are approved for homepage visibility.
- Link to policy, support, or approved information pages.
- Mark financing as omitted until an approved financing system exists.
- Add content owner and legal/operations status.

### Out of scope

- Creating a freight quote workflow.
- Installing financing apps.
- Editing checkout.
- Publishing new policy language.

### Acceptance criteria

- [ ] Freight and warranty text uses approved neutral language or links only.
- [ ] Financing appears only if business approval and destination exist.
- [ ] International or pickup claims are absent unless approved.
- [ ] Section passes claims validation.

### Implementation handoff

**Context-aware update:** Treat this as a route-and-copy module, not a policy summary. If financing requires an app or payment-provider setup, create a separate Epic J/K/P/Q PBI before homepage implementation.

### Success measure

Homepage visitors can find logistics information without being promised terms that depend on product, destination, or external provider.

---

## D-PBI-022 Add Educational and Buying-Guide Entry Points From Approved Content

**Epic:** Epic D - Homepage Transformation  
**Work area:** Content / Admin  
**Type:** Feature  
**Priority:** P2  
**Impact:** Medium  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Post-Launch  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: content`, `area: education`, `needs-content`, `priority: p2`

**Batch status (2026-08-26):** Complete with deferred dependency — the persistent preview Manuals route was verified and the text-only Manuals homepage entry was implemented. Broader education and buying-guide content remains deferred because no approved destination or content exists.

### Problem or opportunity

Customers researching lapidary techniques may not be ready to buy. The homepage should surface useful education or buying guides when approved content exists.

### Evidence

- The source backlog calls for educational content, latest videos, buying guides, and professional/school/workshop applications.
- `data/rhino-section-patterns.json` approves an `education` pattern and recommends Trade-first implementation.
- Current route contract does not include a learning center or buying guide path.

### Proposed outcome

Add homepage entry points to approved educational pages, articles, videos, or buying guides using native Shopify content first.

### Scope

- Inventory approved education or guide content.
- Decide whether content lives in Shopify pages, blogs/articles, or collections.
- Add route records for launch-ready destinations.
- Render section only when destinations are ready.

### Out of scope

- Writing full buying guides.
- Creating a learning center IA.
- Video production.
- SEO article strategy beyond homepage links.

### Acceptance criteria

- [x] The single Manuals card links to the approved `/pages/manuals` destination.
- [x] Section omits placeholder educational topics.
- [x] Copy is limited to neutral Manuals navigation and contains no technical advice.
- [x] Blog/article route coverage is not required because no blog/article action is rendered.

### Implementation handoff

**Context-aware update:** Prefer `featured-blog`, `rich-text`, or `multicolumn` before creating a Rhino education section. If blog/article routes become required, extend route and smoke tests.

### Success measure

Research-oriented visitors have a credible next step that does not dilute purchase-oriented homepage paths.

---

## D-PBI-023 Add Latest Video or Demonstration Module With Deferred Loading and Captions

**Epic:** Epic D - Homepage Transformation  
**Work area:** Media / Repository / Privacy  
**Type:** Feature  
**Priority:** P2  
**Impact:** Medium  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Post-Launch  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: media`, `area: performance`, `area: privacy`, `priority: p2`

**Batch status (2026-08-27):** Complete — the Product Owner-approved silent EM-1 promotional video and 1280 × 720 Shopify-hosted poster render through a click-to-load Rhino section. Initial state has no player/provider request or autoplay; activation uses a titled privacy-enhanced YouTube iframe. Captions/transcript are correctly N/A because the source has no spoken or verbal content.

### Problem or opportunity

Videos can explain machines and process better than copy, but embedded players can hurt performance, accessibility, and privacy when loaded immediately.

### Evidence

- The source backlog calls for latest videos and demonstration content.
- `data/rhino-section-patterns.json` allows video only with `click_to_load_only`.
- The performance budget prohibits immediate video embeds and autoplay media.
- The quality baseline requires captions and transcripts or equivalent written guidance for instructional videos.

### Proposed outcome

Add a video or demonstration module only when an approved video source, thumbnail, caption/transcript plan, and deferred-loading behavior exist.

### Scope

- Inventory approved videos and owners.
- Confirm thumbnail rights and alt text.
- Use click-to-load behavior or native deferred section behavior.
- Document privacy and third-party host implications.

### Out of scope

- Uploading or editing videos.
- Autoplay hero video.
- Installing video apps.
- Building a video library.

### Acceptance criteria

- [x] No iframe or third-party player loads before deliberate activation.
- [x] Video has caption/transcript or equivalent written guidance plan.
- [x] Thumbnail is approved and performance-budgeted.
- [x] Privacy and consent implications are documented.

### Implementation handoff

**Context-aware update:** Use existing `sections/video.liquid` only if it satisfies click-to-load and accessibility requirements. Otherwise create a narrow Rhino video section following the approved pattern.

### Success measure

Homepage video supports customer understanding without slowing first load or creating privacy debt.

---

## D-PBI-024 Decide Testimonial, Review, and Social-Proof Readiness for Homepage Use

**Epic:** Epic D - Homepage Transformation  
**Work area:** Content / App / Legal  
**Type:** Research  
**Priority:** P2  
**Impact:** Medium  
**Effort:** S  
**Confidence:** Medium  
**Suggested milestone:** Post-Launch  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: app`, `area: legal`, `needs-decision`, `priority: p2`

**Batch status (2026-08-26):** Complete — decision: deferred/blocked. No approved testimonial, review, rating, count, or widget source was found in the governed evidence, so no social proof will render and no app was installed.

### Problem or opportunity

Testimonials and reviews can build trust, but unverified quotes, review widgets, imported review counts, or paid apps can create legal, privacy, accessibility, and performance risk.

### Evidence

- The source backlog calls for customer testimonials and reviews.
- App dependency policy treats new apps as maintenance, performance, privacy, and cost liabilities.
- Legal claims rules apply to homepage and advertising-like proof.

### Proposed outcome

Decide whether homepage testimonials or reviews are ready for launch, and document the approved source, display rules, and app strategy.

### Scope

- Inventory existing testimonials, reviews, or customer quotes.
- Confirm permission, attribution, editing rights, and review freshness.
- Evaluate native Shopify and free review options before paid apps.
- Define accessibility and performance requirements for any widget.

### Out of scope

- Installing a review app.
- Migrating reviews.
- Writing testimonial copy.
- Publishing social-proof claims.

### Acceptance criteria

- [x] Decision record states deferred/blocked status.
- [x] Source inventory found no approved item; future use requires permission and an owner before approval.
- [x] Decision prefers native/no-app presentation and requires a separate app-strategy PBI for any future dependency.
- [x] No review count or rating is rendered.

### Implementation handoff

**Measurement method:** Create `docs/architecture/epic-d-homepage-social-proof-decision.md`. If app work is needed, split it to an app-strategy PBI before theme implementation.

### Success measure

Homepage social proof is either safely source-backed or deliberately deferred.

---

## D-PBI-025 Add Newsletter, Dealer, School, Club, or Workshop Inquiry Entry Point When Owned

**Epic:** Epic D - Homepage Transformation  
**Work area:** Admin / Forms / Content  
**Type:** Feature  
**Priority:** P2  
**Impact:** Medium  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Post-Launch  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: forms`, `area: content`, `needs-admin`, `priority: p2`

**Batch status (2026-08-27):** Appropriately blocked / explicitly deferred post-launch — Product Owner deferred newsletter and dealer, school, club, workshop, or institutional lead capture. This is not an Epic D launch blocker; future owned form/process work is handed to Epic P. The generic Contact route was not promoted and no form app was installed.

### Problem or opportunity

The homepage can collect useful interest from institutions, clubs, dealers, workshops, and newsletter subscribers, but each form path needs ownership, consent, routing, and success/error handling.

### Evidence

- The source backlog includes dealer/showroom information, newsletter signup, trade-show follow-up, and professional, school, club, or workshop applications.
- Forms and lead capture are covered separately by Epic P.
- Current homepage has no newsletter or specialized lead-capture module.

### Proposed outcome

Add one owned homepage inquiry or signup entry point only after form destination, routing, consent, and follow-up ownership are defined.

### Scope

- Decide which inquiry path is launch-ready.
- Use Shopify-native forms or existing contact route first.
- Define required fields, consent language, spam prevention, notifications, success state, and owner.
- Add homepage module and route validation when ready.

### Out of scope

- Building multiple forms.
- Installing a paid form builder without evaluation.
- CRM integration.
- Dealer account approval workflows.

### Acceptance criteria

- [ ] Form or destination owner is documented.
- [ ] Consent and routing are approved.
- [ ] Error and success states are accessible.
- [x] Homepage module is omitted while no owned follow-up process exists.

### Implementation handoff

**Context-aware update:** Start with a route to an existing approved contact or Shopify Forms experience. If form setup is not ready, keep homepage copy as a non-promissory contact path.

### Success measure

Homepage lead capture produces actionable inquiries without collecting data the business cannot route or follow up on.

---

## D-PBI-026 Add Homepage Accessibility Coverage and Manual Review Checklist

**Epic:** Epic D - Homepage Transformation  
**Work area:** Repository / QA  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: accessibility`, `area: qa`, `priority: p0`

**Batch status (2026-08-27):** Complete — automated accessibility assertions now cover every implemented homepage module and current preview evidence passes. Manual keyboard, screen-reader, and visual accessibility signoff remains a separate Product Owner input for D-PBI-032.

### Problem or opportunity

Homepage changes introduce new headings, images, cards, CTAs, possible video, forms, and dynamic sections. Accessibility failures on the homepage affect nearly every customer journey.

### Evidence

- The quality baseline requires WCAG 2.2 AA-oriented checks, one clear main landmark, heading order, keyboard operation, visible focus, 200% zoom, reduced motion, image alt text, video captions, and accessible forms.
- Existing `test:ally` includes homepage coverage, but Epic D needs section-specific assertions.

### Proposed outcome

Expand automated and manual homepage accessibility checks for hero, path chooser, machine-family cards, media, support links, education links, video, and forms where present.

### Scope

- Add role/name assertions for H1, primary CTAs, cards, forms, and media controls.
- Verify no serious or critical axe violations.
- Add manual checks for heading order, focus, zoom, text spacing, forced colors, reduced motion, and image alt text.
- Record evidence for preview signoff.

### Out of scope

- Suppressing axe rules.
- Accessibility review of Shopify-owned checkout.
- Auditing every product page.

### Acceptance criteria

- [x] Homepage has exactly one visible logical H1.
- [x] Every interactive homepage element has an accessible name.
- [x] Keyboard traversal reaches all homepage modules and controls in logical order.
- [x] No serious or critical axe violations are introduced.
- [ ] Manual accessibility evidence is recorded.

### Implementation handoff

**Drop-in test method:** Add `tests/homepage-accessibility.spec.js` and include it in Epic D QA. Use role-based locators and do not expand existing exclusions beyond Shopify-owned preview UI.

### Success measure

The transformed homepage remains usable for keyboard, screen-reader, low-vision, zoom, and reduced-motion users.

---

## D-PBI-027 Add Homepage Performance and Media Budget Validation

**Epic:** Epic D - Homepage Transformation  
**Work area:** Repository / QA  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: performance`, `area: media`, `area: qa`, `priority: p0`

**Batch status (2026-08-27):** Complete — the implemented homepage passes static and governed three-run median runtime validation with the 130-request ceiling unchanged. Manual real-device release review remains a separate Product Owner input for D-PBI-032.

### Problem or opportunity

Homepage transformation is likely to add above-the-fold images, product cards, icons, videos, forms, and possibly third-party widgets. These can harm LCP, CLS, request count, and mobile transfer size.

### Evidence

- [data/brand-performance-budget.json](../data/brand-performance-budget.json) defines runtime limits for LCP, CLS, TBT, image bytes, immediate video iframes, autoplay media, and third-party script hosts.
- The current homepage has no image requests from homepage content in the known Epic C runtime note.
- Video and social-proof modules are explicitly risky if they introduce immediate third-party embeds.

### Proposed outcome

Add homepage-specific budget checks for first-screen media, total initial transfer, LCP candidate size, CLS, video embeds, autoplay, third-party scripts, and deferred/lazy loading.

### Scope

- Extend the existing performance budget or create an Epic D wrapper report.
- Measure homepage runtime in preview with required mobile and desktop runs.
- Fail when immediate video embeds, autoplay media, unapproved third-party hosts, or oversized first-screen media appear.
- Record before/after metrics.

### Out of scope

- Replacing the global performance budget.
- Installing optimization apps.
- CDN or infrastructure changes outside Shopify theme behavior.

### Acceptance criteria

- [x] Homepage budget thresholds are machine-readable.
- [x] Runtime report captures LCP, CLS, TBT, transfer size, request count, image bytes, video embeds, autoplay, and third-party hosts.
- [x] Hero media dimensions reserve layout space.
- [x] Noncritical media lazy loads.
- [x] Performance report is part of finalization.

### Implementation handoff

**Drop-in validation method:** Extend `scripts/validate-brand-performance-budget.js` with a homepage category or add `scripts/validate-homepage-performance-budget.js` that reuses existing runtime measurement conventions.

### Success measure

Homepage visual richness does not silently degrade launch performance.

---

## D-PBI-028 Create Responsive Homepage QA Evidence Plan

**Epic:** Epic D - Homepage Transformation  
**Work area:** QA / Documentation  
**Type:** Improvement  
**Priority:** P1  
**Impact:** Medium  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: mobile`, `area: qa`, `priority: p1`

**Batch status (2026-08-27):** Complete — the implemented homepage passes the automated matrix at all eight governed widths. Manual visual hierarchy, crop, balance, and real-device approval remain separate Product Owner inputs for D-PBI-032.

### Problem or opportunity

Homepage approval needs repeatable evidence across viewport sizes and module states, not only a single desktop screenshot.

### Evidence

- Epic C captured global chrome responsive evidence across mobile, tablet, desktop, and wide desktop states.
- The quality baseline defines required viewport sizes and responsive acceptance rules.
- Epic D modules add new layout and media states.

### Proposed outcome

Create an Epic D responsive homepage QA evidence plan with required viewports, screenshots, file naming, module states, and pass/fail criteria.

### Scope

- Define screenshot states for initial load, hero, path chooser, machine-family module, trust/support, media/video, forms/newsletter, and footer transition.
- Include mobile drawer or sticky header overlap checks only where homepage-specific.
- Store evidence under `docs/qa/evidence/epic-d/`.
- Record test results under `test-results/epic-d/`.

### Out of scope

- Pixel-perfect visual regression tooling.
- Replacing Epic C global chrome evidence.

### Acceptance criteria

- [x] Evidence plan lists required viewport and state matrix.
- [x] Naming rules are consistent with prior evidence folders.
- [x] Plan blocks approval for overlap, clipping, horizontal scroll, or unreadable media crops.
- [x] Manual and automated evidence responsibilities are clear.

### Implementation handoff

**Measurement method:** Create `docs/qa/epic-d-responsive-homepage-evidence-plan.md` and reference it from D-PBI-030 finalization.

### Success measure

Homepage visual approval is repeatable across the actual supported device range.

---

## D-PBI-029 Define Post-Launch Homepage Measurement Plan

**Epic:** Epic D - Homepage Transformation  
**Work area:** Analytics / Product  
**Type:** Research  
**Priority:** P2  
**Impact:** Medium  
**Effort:** S  
**Confidence:** Medium  
**Suggested milestone:** Post-Launch  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: analytics`, `priority: p2`

**Batch status (2026-08-27):** Complete — native Shopify measures and future proposal-only module events are separated in a validated ten-measure contract, including the newly implemented EM-1 video. No pixel, custom event, app, or consent change was implemented; targets remain baseline-first pending Product/Analytics review.

### Problem or opportunity

The transformed homepage should be evaluated by customer behavior, not only stakeholder preference. Measurement must respect analytics ownership and privacy rules.

### Evidence

- Epic C created a post-launch navigation measurement plan without implementing custom tracking.
- [docs/analytics/analytics-migration-verification-plan.md](analytics/analytics-migration-verification-plan.md) requires event ownership and prevents duplicate ecommerce tracking.
- The source backlog requires measurable customer outcomes for each homepage section.

### Proposed outcome

Define homepage success measures using native Shopify reporting first and list any proposed custom events separately for later approval.

### Scope

- Define measures for hero CTA clicks, path-choice clicks, machine-family entry, parts entry, consumables entry, support/contact entry, education/video engagement, newsletter or inquiry starts, and homepage-to-product continuation.
- Identify native Shopify reports versus custom event needs.
- Record owners, privacy implications, baseline period, and review cadence.

### Out of scope

- Implementing pixels or custom events.
- Installing analytics apps.
- Setting final numerical targets before baseline data exists.

### Acceptance criteria

- [x] Measurement plan lists measure, question, source, owner, privacy note, and baseline period.
- [x] Native Shopify reporting is used where sufficient.
- [x] Custom events are proposed but not implemented.
- [x] No duplicate ecommerce tracking is introduced.

### Implementation handoff

**Measurement method:** Create `docs/analytics/epic-d-homepage-measurement-plan.md` and optional `data/epic-d-homepage-measurement-plan.json` with a validator if finalization needs machine checks.

### Success measure

The team can learn whether homepage modules help customers choose useful next steps after launch.

---

## D-PBI-030 Add Epic D QA Runner and Finalization Validator

**Epic:** Epic D - Homepage Transformation  
**Work area:** Repository / QA  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: qa`, `area: release`, `type: improvement`, `priority: p0`

**Batch status (2026-08-27):** Complete — aggregate static, preview, and all-mode runners plus an artifacts-only and technical finalization validator are implemented. The gate requires current D019/D023 state, allows explicitly governed optional deferrals, and always reports that D-PBI-032 human GO remains required and production is not approved.

### Problem or opportunity

Epic D needs a single static/preview QA entry point so completion cannot be claimed while section outcome, routes, claims, placeholders, accessibility, performance, responsive evidence, or release docs are skipped.

### Evidence

- Epic B and Epic C use QA runners and finalization validators.
- Existing package scripts include smoke, accessibility, performance, route, brand, section, and global chrome validation.
- Epic D introduces homepage-specific registers and evidence.

### Proposed outcome

Create an Epic D QA plan, QA runner, and finalization validator that compose existing checks with new homepage checks.

### Scope

- Create `data/epic-d-homepage-qa-plan.json`.
- Create `scripts/run-epic-d-homepage-qa.js`.
- Create `scripts/validate-epic-d-finalization.js`.
- Add package scripts such as `qa:epic-d:static`, `qa:epic-d:preview`, `qa:epic-d:all`, and `validate:epic-d-finalization`.
- Include artifacts from D-PBI-001 through D-PBI-029.

### Out of scope

- Creating another test framework.
- Running preview suites without preview credentials.
- Publishing production.

### Acceptance criteria

- [x] Static runner validates homepage model, routes, section patterns, hardcoded strings, media, claims, placeholders, and required docs.
- [x] Preview runner validates homepage route identity, smoke, accessibility, responsive states, and performance where credentials exist.
- [x] Runner report records selected, passed, failed, failedRequired, skipped, and duration totals.
- [x] Missing required artifacts block finalization.

### Implementation handoff

**Drop-in script pattern:** Copy the Epic C runner/finalization structure and replace global-chrome artifacts with Epic D homepage artifacts. Do not weaken existing global validation.

### Success measure

Epic D can close only when repository, Admin, content, accessibility, performance, responsive, and release gates are complete.

---

## D-PBI-031 Update Release Documentation for Homepage Transformation

**Epic:** Epic D - Homepage Transformation  
**Work area:** Documentation / Release  
**Type:** Improvement  
**Priority:** P1  
**Impact:** Medium  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: release`, `area: documentation`, `priority: p1`

**Batch status (2026-08-27):** Complete — release checklist, signoff checklist, finalization report, and README now identify Epic D commands, preview/production IDs, route/media/claims/video/NFR evidence, `--nodelete` rollback, and the required human D-PBI-032 GO.

### Problem or opportunity

Homepage changes affect the first customer impression, route flow, media performance, content claims, and Shopify theme-editor state. Release docs must make those checks visible.

### Evidence

- Release documentation already includes production launch readiness and signoff checklists.
- Epic C release integration added global-chrome commands and rollback references.
- Epic D will add new homepage assets, routes, section settings, and evidence.

### Proposed outcome

Update release and documentation references so homepage transformation is reviewed consistently before any production publish.

### Scope

- Add Epic D QA commands to release checklist and signoff checklist.
- Reference homepage route, media, claims, performance, responsive evidence, and rollback artifacts.
- Add homepage section order and theme-editor rollback requirements.
- Update documentation indexes if present.

### Out of scope

- Conducting production signoff.
- Publishing the theme.
- Editing generated docs manually.

### Acceptance criteria

- [x] Release checklist includes Epic D static and preview commands.
- [x] Signoff checklist requires homepage screenshots and rollback evidence.
- [x] Release notes/finalization report prompts for homepage section, media, route, and Admin changes.
- [x] Documentation references are included in D-PBI-030 finalization.

### Implementation handoff

**Measurement method:** Add required release documentation links to the Epic D finalization validator.

### Success measure

Homepage releases cannot bypass route, claim, media, performance, and rollback review.

---

## D-PBI-032 Conduct Preview Homepage Signoff and Production Go/No-Go

**Epic:** Epic D - Homepage Transformation  
**Work area:** Mixed  
**Type:** Configuration / QA  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: d`, `area: homepage`, `area: release`, `area: qa`, `needs-admin`, `priority: p0`

### Problem or opportunity

Homepage transformation includes repository and Shopify Admin state. Production should not change until stakeholders approve content, media, routes, accessibility, performance, rollback, and measurement readiness.

### Evidence

- Epic B preview workflow requires persistent preview evidence and stakeholder review.
- Epic C final status kept production untouched pending human signoff.
- Homepage changes may expose legal-sensitive claims and Admin-owned content.

### Proposed outcome

Collect preview signoff and make a production go/no-go decision for the transformed homepage.

### Scope

- Validate preview theme ID, section order, route targets, media, claims, accessibility, performance, responsive evidence, and release docs.
- Get Product Owner, Brand, Engineering, QA/Release, Shopify Admin, Content, Legal, Operations, Support, and Analytics approvals where needed.
- Record production deployment approval or blockers.

### Out of scope

- Deploying without approval.
- Resolving missing content with unapproved copy.
- Making checkout, product-page, search, or global navigation changes outside approved dependencies.

### Acceptance criteria

- [ ] Epic D finalization validator passes.
- [ ] Static and preview Epic D QA reports pass required checks.
- [ ] Manual evidence is complete.
- [ ] Required stakeholder signoffs are recorded.
- [ ] Production remains untouched until explicit approval.

### Implementation handoff

**Measurement method:** Use the Epic D QA runner report plus manual evidence checklist as the signoff package. Record production go/no-go in an implementation record.

### Success measure

The homepage can move from preview to production without untracked Admin drift, unsupported claims, inaccessible modules, performance regressions, or missing rollback steps.

## Epic D Finalization Required Inputs

D-PBI-030 should require these artifacts before Epic D finalization:

- [epic-d-homepage-source-hierarchy.md](architecture/epic-d-homepage-source-hierarchy.md)
- [epic-d-homepage-current-state-audit.md](architecture/epic-d-homepage-current-state-audit.md)
- `data/homepage-section-outcomes.json`
- `schemas/homepage-section-outcomes.schema.json`
- `scripts/validate-homepage-section-outcomes.js`
- Homepage destination route contract updates
- Homepage content and claims map
- Homepage media inventory or gap register
- Homepage responsive QA evidence plan
- Homepage accessibility test
- Homepage responsive test
- Homepage performance budget validation
- Epic D measurement plan
- `data/epic-d-homepage-qa-plan.json`
- `scripts/run-epic-d-homepage-qa.js`
- `scripts/validate-epic-d-finalization.js`
- Release checklist and signoff checklist updates
- PBI implementation records for every visible homepage module

## Top Recommended Starting PBIs

1. D-PBI-001 - Create the Epic D homepage source hierarchy and decision log.
2. D-PBI-002 - Audit current homepage sections, content, routes, media, and Admin state.
3. D-PBI-003 - Define a machine-readable homepage section outcome model.
4. D-PBI-004 - Map homepage content sources, owners, and claim approvals.
5. D-PBI-006 - Define homepage destination route contract without inventing handles.
6. D-PBI-007 - Define the homepage hero content model and approved first-screen promise.
7. D-PBI-011 - Validate first-screen and mobile sequencing across supported viewports.
8. D-PBI-030 - Add Epic D QA runner and finalization validator.

## Highest-Risk Areas

- Unsupported homepage claims about manufacturer, supplier, exclusivity, patents, certification, warranty, freight, financing, service, support, dealer, or international availability.
- Hero and media choices that hide machine details, load too much above the fold, or create layout shift.
- Broken or invented homepage CTA destinations.
- Machine-family cards that imply compatibility or unresolved technical specifications.
- App widgets for reviews, video, chat, forms, or financing that add privacy, performance, accessibility, or cost burden.
- Mobile first-screen layouts that hide useful paths behind oversized hero content.
- Shopify Admin theme-editor changes that lack rollback snapshots.
- Homepage personalization or dynamic recommendations without analytics and privacy ownership.

## Missing Business Decisions

- Approved homepage brand promise and first-screen headline.
- Launch-visible machine families and destination routes.
- Flagship machine selection and source-backed proof points.
- Which parts, accessories, and consumables paths are real at launch.
- Whether financing or installment messaging is approved.
- Whether testimonials, reviews, or customer projects can be used.
- Which support owner, contact route, manuals, warranty, and freight pages can be promoted from the homepage.
- Whether education, buying guides, latest videos, newsletter, dealer, school, club, institutional, or trade-show modules are launch-ready.
- Which homepage metrics are owned by native Shopify reporting and which need future custom analytics approval.

## Proposed Validation Commands

Run these as Epic D artifacts are added:

```powershell
npm run validate:homepage-sections
npm run validate:navigation
npm run test:navigation
npm run check:placeholders
npm run validate:hardcoded-strings
npm run validate:brand-claims
npm run validate:media
npm run validate:rhino-sections
npm run validate:rhino-section-patterns
npm run test:smoke
npm run test:ally
npm run test:brand-performance:release
npm run validate:registers
npm run validate:theme-repository
npm run theme:check
```

When D-PBI-030 is implemented, replace the individual Epic D command bundle with:

```powershell
npm run validate:epic-d-finalization
npm run qa:epic-d:static
npm run qa:epic-d:preview
```

Preview suites require preview credentials and fixture routes. Do not run preview suites against production unless an explicit production release PBI approves it.
