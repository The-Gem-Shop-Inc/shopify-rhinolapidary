# Epic D Homepage Social-Proof Decision

**PBI:** D-PBI-024  
**Decision date:** 2026-08-26  
**Status:** Complete — decision deferred/blocked  
**Owners required for reconsideration:** Content, Legal or Claims, Privacy, Accessibility, Performance, and Shopify Admin

## Decision

Homepage social proof is deferred/blocked.

No testimonial, review, rating, review count, or review widget is approved for current homepage use. The homepage will ship without these elements until the governed prerequisites below are satisfied.

## Evidence Reviewed

- `data/homepage-section-outcomes.json`, especially `homepage-social-proof`
- `data/homepage-content-claims-map.json`, especially `testimonial-language` and `review-language`
- `data/legal-claims-register.json`
- `data/navigation-spec.json`
- `data/rhino-section-patterns.json`
- `data/media-manifest.json`
- `templates/index.json`
- `config/settings_data.json`
- Theme `templates/`, `sections/`, `snippets/`, and `config/` scan for testimonial, rating, review-count, review-widget, app-block, and social-proof implementations
- `docs/brand/epic-d-homepage-content-claims-map.md`
- `docs/brand/rhino-legal-claims-rules.md`
- `docs/architecture/epic-d-homepage-current-state-audit.md`
- `docs/architecture/epic-d-homepage-source-hierarchy.md`
- `docs/rhino-lapidary-pbi-tracker-epic-d.md`

No approved testimonial or review source was found in the governed repository and Admin-derived evidence available to this implementation. This finding does not assert that reviews or testimonials do not exist elsewhere in the business; it means no source available here has current permission, ownership, attribution, freshness, and display-rights evidence for homepage use.

No homepage social-proof section, review app block, rating summary, review count, or review widget is configured in `templates/index.json`. The repository contains upstream theme capabilities that could be used by future work, but capability is not approval or evidence.

## Preconditions for Future Approval

Future homepage social proof requires all of the following before implementation:

- Source of each testimonial or review
- Permission for storefront use
- Customer attribution policy, including anonymous or partial attribution rules
- Editing and truncation rights
- Freshness or review date
- Owner responsible for ongoing accuracy
- Verified rating source before showing stars or rating values
- Verified review-count source before showing counts
- Accessibility review
- Privacy review
- Performance impact review
- Removal and rollback strategy
- App data-export and migration strategy if an app is later required
- Moderation, correction, dispute, and takedown process
- Approval of final displayed wording and surrounding context

Approval must be recorded in the governed content and outcome registers before a homepage module becomes rendered.

## App Strategy Decision

- No review app will be installed for D-PBI-024.
- Native or no-app presentation is preferred when it can meet the approved content, moderation, accessibility, privacy, and maintenance requirements.
- Any future app requires a separate app-strategy and dependency PBI before theme implementation.
- Paid app adoption requires clear justification against native Shopify, no-app, and lightweight-theme alternatives, including ownership, recurring cost, storefront impact, data portability, removal behavior, and vendor risk.

## Accessibility and Performance Requirements for Future Widgets

Any future social-proof presentation must meet these minimum requirements:

- No inaccessible carousel-only interaction
- No unlabeled stars
- Rating meaning exposed in text
- Full keyboard usability
- No serious or critical axe violations
- No synchronous third-party script
- No homepage performance-budget regression
- No hidden tracking or pixels without privacy review
- No essential testimonial or rating information available only through animation, hover, or a visual icon
- A stable, usable no-script or failure state when a remote dependency is unavailable

## Reconsideration and Rollback

Reconsider this decision only through a later PBI that supplies the complete source and ownership package, updates machine-readable governance, and passes preview accessibility, privacy, performance, responsive, and route checks.

Because D-PBI-024 adds no customer-facing module, app, script, or Admin configuration, rollback consists of reverting this decision record and its register references. No production storefront rollback is required.
