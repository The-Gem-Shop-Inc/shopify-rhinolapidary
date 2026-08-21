# Epic D Homepage Source Hierarchy

**Epic:** D - Homepage Transformation  
**PBIs:** D-PBI-001 through D-PBI-006  
**Status:** Batch 1 source hierarchy  
**Created:** 2026-08-20  
**Governing backlog:** [rhino-lapidary-pbi-tracker-epic-d.md](../rhino-lapidary-pbi-tracker-epic-d.md)

This document defines which source controls homepage decisions before Epic D
adds visible homepage modules. It follows the Epic C global chrome pattern, but
the authority model is specific to homepage section order, module outcomes,
content, media, claims, routes, measurement, and release evidence.

## Override Rules

Accessibility, legal safety, route correctness, media rights, performance, and
production safety override visual preference. A homepage change is not accepted
when it:

- Introduces unsupported legal, warranty, freight, financing, support, dealer,
  testimonial, review, certification, patent, supplier, manufacturer,
  compatibility, availability, or international claims.
- Sends customers to `/password`, a 404 route, an unrelated route, or an
  unresolved draft or blocked route.
- Uses media without rights, dimensions, crop, alt-text, and performance review.
- Loads autoplay media, immediate third-party video, unapproved form/review/chat
  widgets, or scripts that violate the performance budget.
- Treats a proposed or observed source as approved customer-facing content.
- Changes Shopify Admin or production theme state without explicit approval and
  rollback evidence.

## Preview And Production Authority

Epic D implementation and validation target the persistent preview theme. The
production theme is read-only unless a later release PBI explicitly authorizes a
production publication.

Technical completion in the repository, a passing validator, or a successful
preview test does not authorize production publication. Production publication
requires the later Epic D release/signoff process and explicit stakeholder
approval.

## Source Authority

| Evidence class | Authoritative source | Fallback source | Owner/reviewer | Allowed to establish | Not allowed to establish | Conflict-resolution rule |
|---|---|---|---|---|---|---|
| Homepage section order | `templates/index.json` for repository state; persistent preview `templates/index.json` for live preview state | Current-state audit screenshot and rendered DOM evidence | Frontend Engineering, Product Owner | Actual checked-in and preview section order | Final Epic D section approval, Admin publication approval | If repository and preview differ, record drift and treat preview as test target until explicitly reconciled. |
| Homepage module purpose/outcomes | [data/homepage-section-outcomes.json](../../data/homepage-section-outcomes.json) | Epic D tracker for planned families | Product Owner, UX/Content, Frontend Engineering | Customer outcome, module status, route dependency, empty state, mobile, a11y, performance, success measure | Final copy, media rights, legal claims approval | Machine-readable outcome register wins over prose plans. Blocked or draft modules cannot be treated as approved. |
| Theme Editor settings | Shopify preview theme files such as `sections/header-group.json`, `sections/footer-group.json`, and `config/settings_data.json` | Read-only Admin evidence summary | Shopify Admin Owner, Frontend Engineering | Actual preview theme setting values and menu assignments | Source-controlled final module intent, claim approval, production publication | Record setting drift; do not correct it during Batch 1 unless a PBI explicitly authorizes Admin work. |
| Shopify Admin content | Shopify Admin pages, collections, products, policies, files, menus | Durable Admin evidence summaries under `docs/qa/evidence/epic-d/` | Shopify Admin Owner, Product/Data/Content Owners | Whether content exists, is published, has a handle, or has media | Whether content is approved for homepage promotion or claim use | Admin existence is observed state only unless a source register marks it approved. |
| Products and collections | Shopify product and collection records; `data/product-export/products.csv` where available | Product specification and migration registers | Product Data Owner, Shopify Admin Owner | Current titles, handles, collection membership, media count, publication observations | Compatibility, availability, warranty, freight, or performance claims | Structured product data wins; title similarity and collection membership are not compatibility evidence. |
| Route destinations | [data/navigation-spec.json](../../data/navigation-spec.json) and route tests | Rendered preview link audit | Frontend Engineering, Shopify Admin Owner | Approved, observed, draft, and blocked route status; current homepage CTA coverage | Invented handles or customer-facing URLs for blocked routes | Required/approved homepage routes must have preview-resolving paths; blocked routes must not reserve or render paths. |
| Product facts | Product data exports, Shopify product records, product-specific specification registers | Legacy Rhino or The Gem Shop sources as evidence only | Product Data Owner, Technical Reviewer, Legal | Product title, product ID/handle, media presence, structured facts when verified | Capability, compatibility, included items, warranty, delivery, durability, certification | Product facts require structured or approved source evidence before homepage use. |
| Media | [data/media-manifest.json](../../data/media-manifest.json), Shopify Files/product media read-only evidence | Photography/video art-direction docs | Media Owner, Brand Owner, Accessibility, Performance | Candidate ownership, rights status, dimensions, role, alt guidance, crop/performance blockers | Launch readiness when rights, dimensions, crop, alt, or performance are unresolved | `launchReadiness: ready` must satisfy media validator rules; otherwise use blocked, needs review, or fallback only. |
| Media rights | Media manifest and approved source/rights records | Source migration register | Media Owner, Business Owner, Legal | Rights approval or unresolved rights status | Rights approval by visual inspection alone | Unknown or needs-confirmation rights block launch-critical media. |
| Brand copy | Approved brand voice/copy rules and approved future homepage content map entries | Proposed brand positioning as draft evidence only | Brand Owner, Content Owner, Product Owner | Tone, voice, safe writing rules, and observed current neutral copy | New claims, first-screen promises, or proof points without approval | Approved content map/register entry wins. Proposed positioning cannot become storefront copy alone. |
| Legal-sensitive claims | [data/legal-claims-register.json](../../data/legal-claims-register.json) | Content claims map references | Legal or Claims Reviewer with business/ops/product owners | Claim status, prohibited wording, allowed surfaces | Business decisions, route existence, or media readiness | Blocked claims block approved modules and customer-facing copy. Do not weaken claim rules to pass validation. |
| Warranty/support/freight language | [rhino-reassurance-microcopy.md](../brand/rhino-reassurance-microcopy.md), legal-claims register, Shopify policies when approved | Observed policy objects and contact page | Legal, Operations, Support, Business, Product Data | Safe neutral labels and review requirements | Warranty duration, freight cost/timing, pickup availability, support hours, repair role, international availability | Policy existence does not approve homepage summaries. Use blocked/unknown until legal and operations approve. |
| Analytics or measurement ownership | Future Epic D measurement plan; existing analytics migration plan | Native Shopify reports where sufficient | Analytics Owner, Product Owner, Privacy | Success measure ownership and privacy notes | Pixel/app installation or duplicate ecommerce tracking | No custom tracking is implemented in Batch 1; future measurement requires owner approval. |
| Accessibility requirements | Homepage outcome register, quality baseline, future accessibility tests | Manual QA evidence | Accessibility Owner, Frontend Engineering, QA | Required names, headings, focus, alt text, captions/transcripts, mobile readability | Waiving serious/critical failures because content is draft | Accessibility defects block approval for visible modules. |
| Performance requirements | [data/brand-performance-budget.json](../../data/brand-performance-budget.json), media manifest homepage inventory | Runtime performance reports | Frontend Engineering, Performance Reviewer | Budgets for images, video, scripts, third-party hosts, LCP/CLS/TBT | Approval for heavy media/widgets without measurement | Performance budget wins over visual preference. |
| Release/signoff evidence | Implementation records, release checklist, future Epic D finalization | Preview evidence folder | Release Owner, QA, Product Owner | Completion status, validation, blockers, signoff readiness | Production publication by implication | Every PBI gets an implementation record. Later release PBI controls production go/no-go. |
| Rollback evidence | Admin change records, theme file checksums, release rollback docs | Preview and production read-only checksums | Release Owner, Shopify Admin Owner, Frontend Engineering | How to restore preview or production state after an approved change | Permission to mutate production in Batch 1 | Batch 1 is read-only for Admin; future Admin changes need before/after/rollback evidence. |

## Decision Status Model

Epic D distinguishes these decision states:

| Status | Meaning | Customer-facing implication |
|---|---|---|
| `approved` | Source, owner, reviewer, and validation requirements are satisfied. | May be used if the route/media/performance/a11y gates also pass. |
| `observed` | Current repository, preview, or Admin state was seen during audit. | May be tested as current state; not final Epic D approval. |
| `proposed` | A source suggests a future direction but approval is missing. | Do not render as final customer-facing copy or routes. |
| `draft` | Structured model exists, but one or more dependencies remain unresolved. | Do not publish as final; may guide later implementation. |
| `blocked` | Required source, owner, approval, route, media, or claim evidence is missing or invalid. | Do not render customer-facing content or URL. |
| `unknown` | The team does not yet know the source, owner, or state. | Treat as blocked until evidence exists. |

Unanswered questions remain draft, blocked, or unknown. They do not become
approved facts through prose, tests, or visual design.

## Controlled Artifacts

| Artifact | Purpose | Validation |
|---|---|---|
| [data/homepage-section-outcomes.json](../../data/homepage-section-outcomes.json) | Machine-readable module outcomes, statuses, dependencies, accessibility, performance, routes, and success measures | `npm run validate:homepage-sections`, `npm run validate:registers` |
| [schemas/homepage-section-outcomes.schema.json](../../schemas/homepage-section-outcomes.schema.json) | Structural contract for homepage outcomes | `npm run validate:homepage-sections` |
| [data/homepage-content-claims-map.json](../../data/homepage-content-claims-map.json) | Homepage content classes, owners, claim references, safe neutral fallbacks, and blockers | `npm run validate:homepage-content-claims`, `npm run validate:brand-claims` |
| [data/navigation-spec.json](../../data/navigation-spec.json) | Route contract for current and future homepage destinations | `npm run validate:navigation`, `npm run test:navigation`, `npm run test:homepage-routes` |
| [data/media-manifest.json](../../data/media-manifest.json) | Media asset ownership plus homepage media inventory and launch-readiness gaps | `npm run validate:media` |
| [epic-d-homepage-hero-content-model.md](../brand/epic-d-homepage-hero-content-model.md) | Human-readable explanation of the governed hero contract | `npm run validate:homepage-sections`, `npm run validate:homepage-content-claims` |
| [epic-d-responsive-homepage-evidence-plan.md](../qa/epic-d-responsive-homepage-evidence-plan.md) | Homepage responsive viewport/state/evidence matrix | `npm run test:homepage-responsive` |
| [epic-d-homepage-accessibility-manual-checklist.md](../qa/epic-d-homepage-accessibility-manual-checklist.md) | Manual accessibility evidence checklist and status rules | `npm run test:homepage-accessibility` plus manual evidence |
| [data/epic-d-homepage-measurement-plan.json](../../data/epic-d-homepage-measurement-plan.json) | Homepage post-launch measures with no tracking-code authorization | `npm run validate:homepage-measurement-plan`, `npm run validate:registers` |
| Homepage performance budget in [data/brand-performance-budget.json](../../data/brand-performance-budget.json) | Homepage-specific LCP, CLS, TBT, transfer, request, image, media, video, and host budgets | `npm run validate:homepage-performance`, `npm run test:homepage-performance` |
| [epic-d-homepage-current-state-audit.md](epic-d-homepage-current-state-audit.md) | Durable Batch 1 audit of repository, preview, Admin, route, media, and coverage state | Manual review plus linked evidence |
| `docs/qa/evidence/epic-d/` | Screenshots and durable evidence summaries | Manual QA process |
| Implementation records under `docs/project/implementation-records/` | PBI status, sources/evidence, validation, Admin inspection, production safety, blockers | Manual review; future Epic D finalization |

## Future Implementation Record Requirement

Every future Epic D implementation record must include a `Sources / Evidence`
section that lists:

- Repository sources used.
- Admin or preview evidence used.
- Claim, route, media, accessibility, performance, and measurement sources.
- Any unresolved blockers or deferred dependencies.
- Production safety statement.

## Open Ownership Questions

- Who is final Product Owner for homepage section priority?
- Who approves the first-screen homepage promise?
- Who approves use of The Gem Shop, Silica-Gem, manufacturer, supplier, or
  support role language?
- Who owns warranty, freight, shipping, pickup, and support summaries for
  homepage use?
- Who owns financing, dealer, school, club, workshop, and institutional paths?
- Who owns homepage media rights, crop approval, and alt text?
- Who owns post-launch homepage analytics and privacy review?
