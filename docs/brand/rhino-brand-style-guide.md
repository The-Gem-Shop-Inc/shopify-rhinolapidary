# Rhino Brand Style Guide

**PBI:** B-034
**Status:** Approved review artifact; not a public storefront style-guide implementation
**Requirements source:** [data/rhino-brand-style-guide-requirements.json](../../data/rhino-brand-style-guide-requirements.json)

This guide consolidates Epic B direction for pull-request, preview, Shopify
admin, media, and release review. It does not replace the source documents.
When this guide and a source document conflict, stop and resolve the source
decision before implementing.

## Status and source hierarchy

Status labels are: Approved, Needs review, Proposed, Blocked, and Post-launch.
Approved and implemented are separate states.

Source hierarchy:

1. Current governed registers and machine-readable plans.
2. Approved Epic B source documents.
3. Repository implementation records and validators.
4. Legacy Rhino, The Gem Shop, Silica-Gem, or Shopify export evidence.

Core sources:

- [data/design-token-inventory.json](../../data/design-token-inventory.json)
- [data/media-manifest.json](../../data/media-manifest.json)
- [data/legal-claims-register.json](../../data/legal-claims-register.json)
- [data/rhino-launch-theme-settings.json](../../data/rhino-launch-theme-settings.json)
- [docs/brand/brand-governance-and-approval-workflow.md](brand-governance-and-approval-workflow.md)
- [docs/architecture/rhino-brand-css-implementation-plan.md](../architecture/rhino-brand-css-implementation-plan.md)
- [docs/brand/rhino-theme-settings-launch-plan.md](rhino-theme-settings-launch-plan.md)
- [docs/qa/epic-b-brand-qa-plan.md](../qa/epic-b-brand-qa-plan.md)
- [docs/rhino-storefront-discovery-epic-b.md](../rhino-storefront-discovery-epic-b.md)
- [docs/brand/rhino-brand-evidence-inventory.md](rhino-brand-evidence-inventory.md)

Escalation rules from governance apply: accessibility overrides visual
preference, the performance budget overrides decorative preference, and
unsupported technical or legal claims remain blocked.

## Brand positioning and identity

**Approved:** Rhino should read as a precise, practical lapidary equipment
storefront. Product usefulness, setup clarity, and support routing matter more
than promotional tone.

**Needs review:** Seller of record, manufacturer role, supplier role,
fulfillment role, repair ownership, support ownership, and warranty
responsibility remain business/legal facts until approved.

Sources:

- [docs/brand/rhino-brand-positioning.md](rhino-brand-positioning.md)
- [docs/brand/rhino-identity-architecture.md](rhino-identity-architecture.md)
- [data/legal-claims-register.json](../../data/legal-claims-register.json)

Do: use neutral Rhino brand positioning and approved product roles.

Don't: publish manufacturer, supplier, exclusivity, warranty, repair, or service
responsibility language without the required Business Owner and Legal or Claims
Reviewer approval.

## Visual direction

**Approved:** The launch direction is Precision Workshop: restrained,
technical, product centered, readable, and calm.

**Blocked:** Recreating the dense legacy ad system, continuous black pages,
decorative gears, red gradients, faux metal effects, and overbuilt card stacks.

Sources:

- [docs/brand/rhino-visual-direction-and-color-system.md](rhino-visual-direction-and-color-system.md)
- [docs/brand/rhino-brand-evidence-inventory.md](rhino-brand-evidence-inventory.md)

Do: use clean product surfaces, thin technical rules, strong alignment, and
selective Rhino red.

Don't: turn every section into a dark industrial panel or use decoration that
competes with product information.

## Logo and Rhino mark

**Approved:** Use repository-owned Rhino logo and mark assets recorded in the
media manifest. Keep the silhouette, frame, color, clear space, and minimum size
intact.

**Needs review:** Any new logo crop, recolor, animation, trademark symbol, or
nonstandard placement.

Sources:

- [docs/brand/rhino-logo-and-motif-usage.md](rhino-logo-and-motif-usage.md)
- [docs/media/media-asset-source-of-truth.md](../media/media-asset-source-of-truth.md)
- [data/media-manifest.json](../../data/media-manifest.json)

Do: use approved assets from `assets/` and provide accessible names when the
logo is linked or visible.

Don't: trace a new mark from memory, add trademark symbols, distort the frame,
or use low-resolution references when approved sources exist.

## Color system

**Approved:** Use the tokenized Rhino palette. Brand red is an accent and focus
source, primary action red is the CTA color, and functional colors are distinct
from brand colors.

**Blocked:** Unsupported literal colors in Rhino CSS, inaccessible pairings, and
using red as the only state indicator.

Sources:

- [docs/brand/rhino-visual-direction-and-color-system.md](rhino-visual-direction-and-color-system.md)
- [docs/architecture/design-token-governance.md](../architecture/design-token-governance.md)
- [data/design-token-inventory.json](../../data/design-token-inventory.json)

Do: use `--rhino-*` tokens and confirm values match `assets/rhino-custom.css`.

Don't: introduce a new page surface color without registering the token and
checking contrast.

## Typography

**Approved:** DM Sans is the launch font family for headings and body copy.
Use sentence case, stable wrapping, tabular numerals for measurements and
prices, and restrained label styling.

**Blocked:** Imitating the striped wordmark as text, viewport-scaled type, and
all-caps paragraphs.

Sources:

- [docs/brand/rhino-typography-system.md](rhino-typography-system.md)
- [docs/brand/rhino-visual-direction-and-color-system.md](rhino-visual-direction-and-color-system.md)
- [data/design-token-inventory.json](../../data/design-token-inventory.json)

Do: make product names readable before adding visual emphasis.

Don't: shrink technical labels until they fail zoom or mobile wrapping checks.

## Layout, spacing, borders, and elevation

**Approved:** Use the documented spacing scale, 1400 px canvas, readable page
gutters, flat technical surfaces, restrained radii, and borders before shadows.

**Blocked:** Nested cards, floating sections, ordinary card shadows, and layout
that hides purchase or specification content on mobile.

Sources:

- [docs/brand/rhino-layout-and-surface-system.md](rhino-layout-and-surface-system.md)
- [docs/architecture/css-architecture.md](../architecture/css-architecture.md)
- [data/design-token-inventory.json](../../data/design-token-inventory.json)

Do: use section bands and flat grids for scannable product information.

Don't: add decorative containers around Trade cards just to make a page feel
branded.

## Buttons, links, and actions

**Approved:** Primary actions are reserved for purchase or major progression.
Secondary and support actions must look subordinate but usable. Focus treatment
is part of the action system.

**Needs review:** New action roles or global Trade action overrides.

Sources:

- [docs/brand/rhino-action-hierarchy.md](rhino-action-hierarchy.md)
- [docs/architecture/rhino-brand-css-implementation-plan.md](../architecture/rhino-brand-css-implementation-plan.md)
- [data/design-token-inventory.json](../../data/design-token-inventory.json)

Do: keep purchase actions visually clear and support links explicit.

Don't: use primary button styling for low-priority links, policy links, or
decorative navigation.

## Forms and interface states

**Approved:** Forms need visible labels, clear required/optional language,
timely validation, associated errors, success states, accessible loading, and
empty states that explain next steps.

**Blocked:** Placeholder-only labels, color-only errors, vague failures, or
state copy that promises unsupported response times.

Sources:

- [docs/brand/rhino-form-and-state-patterns.md](rhino-form-and-state-patterns.md)
- [docs/brand/rhino-action-hierarchy.md](rhino-action-hierarchy.md)
- [docs/architecture/rhino-brand-css-implementation-plan.md](../architecture/rhino-brand-css-implementation-plan.md)

Do: describe what failed and what the customer can do next.

Don't: hide labels to make a form look cleaner.

## Product badges and trust markers

**Approved:** Badges must be sparse, source-backed, and useful for product
decisions. Product-card badges are limited.

**Blocked:** Warranty durations, freight estimates, compatibility, included
items, or support promises without structured source data and claim review.

Sources:

- [docs/brand/rhino-product-badges-and-trust-markers.md](rhino-product-badges-and-trust-markers.md)
- [docs/brand/rhino-reassurance-microcopy.md](rhino-reassurance-microcopy.md)
- [data/legal-claims-register.json](../../data/legal-claims-register.json)

Do: show current Shopify availability and approved product role signals.

Don't: add freight, warranty, or compatibility badges because legacy copy
mentioned them.

## Icon system

**Approved:** Use repository-owned Rhino icons through the approved render path
when future Rhino components adopt them. Existing Trade icons are not globally
replaced by this guide.

**Needs review:** Any new icon name, icon meaning, replacement relationship, or
dynamic icon option.

Sources:

- [docs/brand/rhino-icon-system.md](rhino-icon-system.md)
- [docs/brand/rhino-stock-icon-asset-audit.md](rhino-stock-icon-asset-audit.md)
- [data/media-manifest.json](../../data/media-manifest.json)

Do: use icons as secondary support for text or known controls.

Don't: use an icon alone for unfamiliar technical meaning.

## Machine family identifiers

**Approved:** CamelCase family casing is approved for BeadMaster, ShapeMaster,
TrimMaster, LapMaster, SawMaster, and JadeMaster. EM-1 is the flagship model.

**Blocked:** TumbleMaster remains unavailable pending commercial and technical
review.

Sources:

- [docs/brand/rhino-machine-family-identifiers.md](rhino-machine-family-identifiers.md)
- [docs/brand/rhino-product-terminology-source-audit.md](rhino-product-terminology-source-audit.md)
- [data/product-name-normalization-proposal.json](../../data/product-name-normalization-proposal.json)

Do: keep family identifiers beside visible family text.

Don't: use unresolved machine specifications as visual icon content.

## Photography

**Approved:** Product photography should show the actual product clearly before
detail crops. Neutral backgrounds and consistent crops support technical review.

**Needs review:** Product-media reuse rights, final product photography
migration, and missing alt text for launch-critical products.

Sources:

- [docs/brand/rhino-product-photography-art-direction.md](rhino-product-photography-art-direction.md)
- [docs/media/media-asset-source-of-truth.md](../media/media-asset-source-of-truth.md)
- [data/media-manifest.json](../../data/media-manifest.json)

Do: preserve important machine shape, controls, and scale in responsive crops.

Don't: approve The Gem Shop product media reuse without recorded permission.

## Technical diagrams

**Approved:** Diagrams explain orientation, dimensions, flow, movement,
compatibility, exploded parts, and procedures when source-controlled evidence
exists.

**Blocked:** Customer-facing technical diagrams based on unresolved B-022
conflicts or unsourced specifications.

Sources:

- [docs/brand/rhino-technical-diagram-system.md](rhino-technical-diagram-system.md)
- [docs/product/rhino-machine-specification-resolution-register.md](../product/rhino-machine-specification-resolution-register.md)
- [docs/media/media-asset-source-of-truth.md](../media/media-asset-source-of-truth.md)

Do: pair complex diagrams with text alternatives or structured lists.

Don't: imply an engineering relationship that the source documents do not prove.

## Geological motifs and textures

**Approved:** Launch uses a restrained CSS strata motif only where it supports
brand recognition without increasing media weight.

**Post-launch:** Rich geological textures may be revisited when real assets,
performance evidence, and accessibility evidence exist.

Sources:

- [docs/brand/rhino-geological-pattern-and-texture-rules.md](rhino-geological-pattern-and-texture-rules.md)
- [docs/brand/rhino-visual-direction-and-color-system.md](rhino-visual-direction-and-color-system.md)
- [docs/architecture/rhino-brand-css-implementation-plan.md](../architecture/rhino-brand-css-implementation-plan.md)

Do: keep motifs subordinate to product information.

Don't: place stone textures behind specifications, forms, or policy text.

## Motion and loading

**Approved:** Motion is functional, short, reduced-motion aware, and never a
substitute for clear state text.

**Blocked:** Autoplay, decorative scroll reveals on dense surfaces, layout-shift
animations, and animated GIF previews.

Sources:

- [docs/brand/rhino-motion-and-loading-system.md](rhino-motion-and-loading-system.md)
- [data/brand-performance-budget.json](../../data/brand-performance-budget.json)
- [data/design-token-inventory.json](../../data/design-token-inventory.json)

Do: use approved duration, easing, and distance tokens.

Don't: add motion that masks slow loading or breaks reduced-motion preferences.

## Video

**Approved:** Videos require canonical source, owner, rights, captions,
transcript status, poster owner, privacy review, and click-to-load behavior.

**Blocked:** Autoplay and immediate third-party video iframes.

Sources:

- [docs/brand/rhino-video-system.md](rhino-video-system.md)
- [docs/brand/rhino-social-sharing-image-system.md](rhino-social-sharing-image-system.md)
- [docs/media/media-asset-source-of-truth.md](../media/media-asset-source-of-truth.md)

Do: use a Rhino-controlled poster and load the player only after deliberate
activation.

Don't: migrate an old public video merely because it is available.

## Brand voice and terminology

**Approved:** Rhino copy is direct, precise, calm, practical, supportive, and
transparent. Product titles and units follow the terminology guide.

**Blocked:** Unsupported performance, certification, warranty, freight,
compatibility, patent, durability, exclusivity, or universal availability
claims.

Sources:

- [docs/brand/rhino-brand-voice-and-copy.md](rhino-brand-voice-and-copy.md)
- [docs/brand/rhino-product-naming-and-terminology.md](rhino-product-naming-and-terminology.md)
- [docs/brand/rhino-product-terminology-source-audit.md](rhino-product-terminology-source-audit.md)

Do: state uncertainty plainly when a source is unresolved.

Don't: reuse legacy product copy as final destination copy.

## Warranty, freight, support, and reassurance

**Needs review:** Warranty, freight, return, international, support routing, and
repair responsibility copy requires business, legal, operations, support, and
content approval before publication.

**Blocked:** Universal warranty durations, universal international shipping,
unreviewed freight timing, unreviewed return terms, and unapproved support
responsibility claims.

Sources:

- [docs/brand/rhino-reassurance-microcopy.md](rhino-reassurance-microcopy.md)
- [docs/brand/rhino-content-migration-rules.md](rhino-content-migration-rules.md)
- [docs/policy/Rhino Lapidary Policies - Warranty, Shipping, Returns.pdf](../policy/Rhino%20Lapidary%20Policies%20-%20Warranty,%20Shipping,%20Returns.pdf)
- [data/legal-claims-register.json](../../data/legal-claims-register.json)

Do: link to full approved policies when summaries cannot carry every exception.

Don't: compress legal or operational terms into a reassuring badge without
review.

## Legal claims and attribution

**Approved:** Plain Rhino Lapidary brand-name use and the EM-1 positioning line
are allowed only within their documented scope.

**Blocked:** Certification, patent, exclusivity, unapproved role, warranty,
freight, return, support, compatibility, and unqualified performance claims
remain blocked until their claim records are approved.

Sources:

- [docs/brand/rhino-legal-claims-rules.md](rhino-legal-claims-rules.md)
- [data/legal-claims-register.json](../../data/legal-claims-register.json)
- [docs/brand/rhino-identity-architecture.md](rhino-identity-architecture.md)

Do: check the claims register before adding customer-facing copy, metadata,
structured data, images containing text, or badges.

Don't: treat a legacy page, product export, PDF, or The Gem Shop page as legal
approval.

## Browser and social assets

**Approved:** Use the repository-owned browser identity and default social image
assets recorded in the media manifest and launch asset register.

**Needs review:** Page-specific social images require approved source imagery,
alt text, crop, and claim review.

Sources:

- [docs/brand/rhino-logo-and-motif-usage.md](rhino-logo-and-motif-usage.md)
- [docs/brand/rhino-social-sharing-image-system.md](rhino-social-sharing-image-system.md)
- [data/brand-launch-assets.json](../../data/brand-launch-assets.json)
- [data/media-manifest.json](../../data/media-manifest.json)

Do: use the default social image only as a fallback when no approved page or
product image exists.

Don't: hardcode production hostnames or add social accounts before ownership is
confirmed.

## Implementation architecture

**Approved:** Rhino implementation belongs in the governed Rhino CSS layer,
explicit Liquid snippets/sections, machine-readable registers, and preview
theme settings plan.

**Blocked:** Direct production settings changes, broad Trade CSS rewrites, new
metafields without architecture approval, and generated-doc edits outside their
owning generator.

Sources:

- [docs/architecture/rhino-brand-css-implementation-plan.md](../architecture/rhino-brand-css-implementation-plan.md)
- [docs/architecture/css-architecture.md](../architecture/css-architecture.md)
- [docs/architecture/rhino-custom-section-block-strategy.md](../architecture/rhino-custom-section-block-strategy.md)
- [docs/development/settings-data-policy.md](../development/settings-data-policy.md)
- [docs/brand/rhino-theme-settings-launch-plan.md](rhino-theme-settings-launch-plan.md)
- [data/rhino-launch-theme-settings.json](../../data/rhino-launch-theme-settings.json)
- [data/rhino-section-patterns.json](../../data/rhino-section-patterns.json)

Repository work requires code review, validators, Theme Check, implementation
record, preview evidence, and rollback instructions. Shopify admin work requires
before/after evidence, preview target, rollback notes, and release-note impact.
Media work requires source, rights, dimensions, crop, accessibility, and manifest
or product-media records. Legal review is required for customer promises and
claims. Release evidence is required before production publishing.

## Quality assurance and evidence

**Approved:** Epic B review uses the QA plan, required viewport matrix, manual
evidence process, automated suites, release checklist, and signoff workflow.

**Blocked:** Production rollout when required validation fails, serious or
critical axe regressions appear, performance budgets fail, preview routes break,
unsupported claims appear, or stakeholder approval is missing.

Sources:

- [docs/qa/epic-b-brand-qa-plan.md](../qa/epic-b-brand-qa-plan.md)
- [docs/qa/storefront-quality-baseline.md](../qa/storefront-quality-baseline.md)
- [docs/qa/manual-qa-evidence-process.md](../qa/manual-qa-evidence-process.md)
- [docs/release/release-checklist.md](../release/release-checklist.md)
- [docs/release/release-signoff-checklist.md](../release/release-signoff-checklist.md)
- [data/brand-performance-budget.json](../../data/brand-performance-budget.json)

Do: include screenshots or preview links for visible changes.

Don't: close a brand implementation as complete with only a desktop screenshot.

## Open issues

Retained open or blocked decisions:

- Legal seller of record and entity responsibility model need business/legal approval.
- Manufacturer, supplier, fulfillment, repair, support, and warranty roles remain blocked as customer promises.
- Machine specification conflicts remain governed by C-001 through C-039 decisions.
- TumbleMaster remains unavailable pending commercial and technical review.
- The Gem Shop product-media reuse permission remains unresolved.
- Legacy content migration decisions remain governed by the migration register.
- Policy, warranty, freight, international, return, and support wording remains legal/operations gated.
- Preview password or route instability remains a known release-risk consideration.

Sources:

- [docs/brand/rhino-brand-evidence-inventory.md](rhino-brand-evidence-inventory.md)
- [data/brand-content-migration-register.json](../../data/brand-content-migration-register.json)
- [docs/product/rhino-machine-specification-resolution-register.md](../product/rhino-machine-specification-resolution-register.md)
- [data/release-risk-register.json](../../data/release-risk-register.json)

Do: keep blocked decisions visible in PR and admin-review notes.

Don't: create polished workaround copy that hides an unresolved source conflict.

## Post-launch extensions

**Post-launch:** Richer video systems, geological media textures, custom
education sections, comparison tools, broader product specification displays,
and larger content migrations should wait until the preview slice proves the
system.

Sources:

- [docs/brand/rhino-video-system.md](rhino-video-system.md)
- [docs/brand/rhino-geological-pattern-and-texture-rules.md](rhino-geological-pattern-and-texture-rules.md)
- [docs/brand/rhino-reusable-section-rules.md](rhino-reusable-section-rules.md)
- [docs/brand/rhino-preview-implementation-slice.md](rhino-preview-implementation-slice.md)

Do: create follow-up work from approved preview evidence.

Don't: expand scope into video embeds, new templates, diagrams, or broad
content migration before preview acceptance.

## Review Examples

| Hypothetical change | Where the guide sends the reviewer |
|---|---|
| New button style | Review Buttons, links, and actions; Color system; Forms and interface states; Implementation architecture; Quality assurance and evidence. Check `docs/brand/rhino-action-hierarchy.md`, `data/design-token-inventory.json`, and `docs/architecture/rhino-brand-css-implementation-plan.md`. |
| New product media upload | Review Photography; Media source rules under Implementation architecture; Browser and social assets when the image affects sharing. Check `docs/media/media-asset-source-of-truth.md`, `data/media-manifest.json`, and product-media evidence. |
| New machine specification section | Review Brand voice and terminology; Technical diagrams; Product badges and trust markers; Open issues. Check `docs/brand/rhino-product-terminology-source-audit.md` and `docs/product/rhino-machine-specification-resolution-register.md` before writing copy. |
| New YouTube video | Review Video; Motion and loading; Browser and social assets; Quality assurance and evidence. Check `docs/brand/rhino-video-system.md` and privacy/performance evidence before adding any embed. |
| New warranty claim | Review Warranty, freight, support, and reassurance; Legal claims and attribution; Brand voice and terminology. Check `data/legal-claims-register.json` and require Legal or Claims Reviewer approval before publication. |
