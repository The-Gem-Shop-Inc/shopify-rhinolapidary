# Rhino Lapidary Epic B - Rhino Brand Foundation Backlog

Date: 2026-07-30

Scope: planning and backlog development only. This document does not implement storefront behavior, change Shopify admin data, install apps, or alter production settings.

## Purpose

Epic B defines the brand foundation work needed before Rhino Lapidary turns the stock Shopify Trade storefront into a distinctive, trustworthy, high-performing storefront for specialized lapidary machinery, parts, accessories, and consumables.

The emphasis is not decoration. The brand system must make expensive technical purchases easier to evaluate by improving clarity, hierarchy, confidence, accessibility, and maintainability.

## Documents Inspected For Format And Process Rules

Backlog and PBI format:

- `docs/Rhino Lapidary Storefront Backlog and Epics.md`
- `docs/rhino-lapidary-pbi-tracker-v12.md`
- `docs/project/github-project-workflow.md`
- `docs/project/pbi-implementation-record-template.md`

Repository and implementation process:

- `README.md`
- `docs/architecture/trade-upstream-baseline.md`
- `docs/architecture/upstream-update-strategy.md`
- `docs/architecture/theme-customization-inventory.md`
- `docs/architecture/design-token-governance.md`
- `docs/architecture/css-architecture.md`
- `docs/architecture/javascript-architecture.md`
- `docs/architecture/rhino-custom-section-block-strategy.md`
- `docs/architecture/hardcoded-string-locale-strategy.md`
- `docs/development/settings-data-policy.md`

Admin, app, privacy, media, QA, and release process:

- `docs/project/admin-change-record-template.md`
- `docs/project/shopify-admin-change-evidence.md`
- `docs/apps/app-dependency-policy.md`
- `docs/apps/app-register.md`
- `docs/apps/theme-editor-code-register.md`
- `docs/privacy/security-privacy-review-checklist.md`
- `docs/privacy/third-party-script-and-pixel-register.md`
- `docs/media/media-asset-source-of-truth.md`
- `docs/qa/storefront-quality-baseline.md`
- `docs/qa/manual-qa-evidence-process.md`
- `docs/qa/manual-qa-evidence-template.md`
- `docs/release/release-checklist.md`
- `docs/release/release-notes-template.md`
- `docs/release/release-signoff-checklist.md`
- `docs/release/production-launch-readiness-gate.md`

Current supporting data files:

- `data/design-token-inventory.json`
- `data/media-manifest.json`
- `data/stock-asset-ledger.json`
- `data/stock-trade-remnants.json`
- `data/hardcoded-string-allowlist.json`
- `data/release-risk-register.json`

## Process Rules Applied To Epic B PBIs

Use the exact PBI format from `docs/Rhino Lapidary Storefront Backlog and Epics.md`.

When an Epic B PBI later changes theme code:

- Use a branch named `pbi/<pbi-id>-short-description`.
- Update `docs/architecture/theme-customization-inventory.md` when theme files change.
- Follow `docs/architecture/css-architecture.md` for Rhino CSS.
- Follow `docs/architecture/javascript-architecture.md` for Rhino JavaScript.
- Follow `docs/architecture/rhino-custom-section-block-strategy.md` for any new Rhino sections or blocks.
- Run the repository validation commands from `README.md` and the relevant npm validators.
- Record durable completion evidence with `docs/project/pbi-implementation-record-template.md`.

When an Epic B PBI later changes Shopify admin or theme-editor configuration:

- Follow `docs/development/settings-data-policy.md`.
- Record the change with `docs/project/admin-change-record-template.md` under `docs/project/admin-change-records/`.
- Include rollback instructions.
- Update release notes with admin impact.

When an Epic B PBI later changes media:

- Follow `docs/media/media-asset-source-of-truth.md`.
- Update `data/media-manifest.json` for repository-owned UI media.
- Keep product catalog media in Shopify product media or Shopify Files, not theme assets.
- Confirm alt text, ownership, dimensions, and license or usage permission.

When an Epic B PBI later adds or changes an app, app block, app embed, third-party script, embedded form, video embed, analytics behavior, or customer-data surface:

- Follow `docs/apps/app-dependency-policy.md`.
- Update `docs/apps/app-register.md`, `docs/apps/theme-editor-code-register.md`, or `docs/privacy/third-party-script-and-pixel-register.md` as applicable.
- Use `docs/privacy/security-privacy-review-checklist.md`.

When an Epic B PBI later affects the storefront experience:

- Follow `docs/qa/storefront-quality-baseline.md`.
- Record manual QA when needed with `docs/qa/manual-qa-evidence-template.md` under `docs/qa/evidence/`.
- Use `docs/release/release-checklist.md`, `docs/release/release-notes-template.md`, and `docs/release/release-signoff-checklist.md` before production publish.

## Current Evidence Summary

Repository:

- The theme is Shopify Trade `15.5.0`.
- `config/settings_data.json` currently has no committed logo value, blank social links, blank brand headline/description, DM Sans headings, Jost body text, light gray/white/taupe/charcoal color schemes, small radii, no button shadows, and generic badge settings.
- `assets/rhino-custom.css` exists as the Rhino CSS entrypoint and currently defines only `--rhino-color-brand-primary` and `--rhino-section-spacing-y`.
- `assets/rhino-storefront.js` exists and currently only initializes `window.RhinoLapidary.version`.
- `layout/theme.liquid` loads `rhino-storefront.js` and `rhino-custom.css`.
- `data/design-token-inventory.json` contains only two proposed Rhino tokens.
- `data/media-manifest.json` contains only a proposed placeholder entry.
- `data/stock-asset-ledger.json` and `data/stock-trade-remnants.json` are starter ledgers, not complete brand-ready inventories.
- Existing stock Trade placeholder copy remains in `templates/index.json` and `templates/product.json`.
- Stock Trade icons include many non-lapidary symbols that are poor brand fits for Rhino.

External brand evidence checked on 2026-07-30:

- http://www.rhinolapidary.com/
- http://www.rhinolapidary.com/about-us.html
- http://www.rhinolapidary.com/policies-and-procedures.html
- https://thegemshop.com/collections/rhino-lapidary
- https://thegemshop.com/products/rhino-lapidary-em-1-machine

Observed external brand signals:

- Current Rhino pages emphasize the EM-1 as an "Everything Machine" and describe four-machine utility, grinding, sanding, polishing, trim saw, flexible shaft, variable speed, torque, and water circulation/filtration.
- Rhino's current public site presents Rhino as a partnership between Silica-Gem and The Gem Shop, with Silica-Gem tied to manufacturing/sourcing and The Gem Shop tied to customer service, website management, and fulfillment.
- The Gem Shop Rhino collection describes The Gem Shop as the exclusive American supplier of Rhino Lapidary equipment.
- The Gem Shop product media provides a practical product-media base for EM-1 setups and accessories.
- Current public pages use legacy Weebly styling and The Gem Shop styling that should be treated as source evidence, not as a design system to copy.

## Epic B PBI Backlog

---

## `[B-001] Create a Rhino brand evidence inventory`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Discovery
**Priority:** P0
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `type: discovery`, `area: design-system`, `area: content`, `needs-admin`

### Problem or opportunity

Rhino's current brand evidence is scattered across the repository, Shopify theme settings, legacy Rhino pages, The Gem Shop product pages, product media, policy copy, videos, and likely Shopify admin content. Without an inventory, later visual and copy decisions risk becoming opinion-driven and inconsistent.

### Evidence

- `config/settings_data.json` has blank brand fields and no committed logo value.
- `data/design-token-inventory.json` and `data/media-manifest.json` are starter records.
- Current Rhino pages contain EM-1 positioning, partnership language, policy language, product imagery, and YouTube embeds.
- The Gem Shop Rhino collection and EM-1 product page contain product names, product media, pricing context, supplier language, and shipping notes.

### Proposed outcome

Create a durable brand evidence inventory that distinguishes existing source material, current theme defaults, and proposed future direction.

### Scope

- Inventory logo files, colors, typography, product media, diagrams, video thumbnails, product names, support promises, warranties, shipping/freight statements, partner identity language, and social profile references.
- Record source URL, owner, usage rights or unknowns, customer journey relevance, and whether each item is approved, outdated, proposed, or needs review.
- Identify missing evidence that requires Shopify admin access or business stakeholder input.

### Out of scope

- Designing the final visual system.
- Migrating media into Shopify.
- Editing templates, CSS, JavaScript, products, pages, policies, or settings.

### Acceptance criteria

- [ ] A brand evidence inventory exists in `docs/` or `data/` with source, owner, status, and usage-rights fields.
- [ ] Existing Rhino, The Gem Shop, and Silica-Gem identity statements are captured separately.
- [ ] Repository defaults are clearly labeled as Trade/theme defaults rather than Rhino decisions.
- [ ] Missing assets and missing decisions are listed as follow-up PBIs.

### Implementation considerations

- This is a discovery/process PBI.
- Use `docs/project/pbi-implementation-record-template.md` when closing.
- If the inventory is JSON, add or reuse a schema and include it in `npm run validate:registers`.
- If the inventory records admin-only evidence, use `docs/project/shopify-admin-change-evidence.md` only for actual admin changes; discovery notes alone do not require admin-change records.

### Dependencies

- Access to Shopify admin Files, product media, products, pages, policies, navigation, and theme-editor settings.
- Permission or business confirmation for any external logo/media usage.

### Risks and cautions

- Do not treat legacy Weebly styling or The Gem Shop styling as automatically approved Rhino direction.
- Do not commit large product images to the theme repository.
- Avoid copying competitor visual systems or proprietary assets.

### Testing notes

- Validate any structured inventory file.
- Review links and evidence dates.
- Confirm no customer data or secrets are included.

### Success measure

Future brand PBIs can cite a single source of truth instead of rediscovering current assets and claims.

### Open questions

- Who owns final brand approval?
- Which Rhino logo files are authoritative?
- Which The Gem Shop media can be reused on the Rhino storefront?

---

## `[B-002] Define Rhino brand positioning and purchase-journey messaging`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Content
**Type:** Discovery
**Priority:** P0
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `type: discovery`, `area: content`, `area: brand`

### Problem or opportunity

Rhino sells expensive, technical lapidary equipment to very different audiences: new enthusiasts, experienced lapidaries, owners seeking compatible parts, professional workshops, wholesale/dealer/institutional buyers, and international visitors. The brand needs clear positioning before visual design work begins.

### Evidence

- The master backlog identifies ruggedness, reliability, precision, innovation, workshop practicality, technical expertise, long-term support, lapidary craftsmanship, and ecosystem confidence as target traits.
- The current Rhino homepage positions EM-1 around practical multi-machine value.
- The About page explains the Silica-Gem and The Gem Shop partnership.
- The repo still contains generic Trade demo copy in `templates/index.json`.

### Proposed outcome

Create a concise positioning document that defines what Rhino should communicate, what it should avoid, and how messaging should shift by customer journey.

### Scope

- Define primary brand promise, support promise, technical credibility points, and purchase reassurance messages.
- Map messages to audience journeys.
- Identify claims requiring verification, such as manufacturing credentials, warranty language, CE Mark references, exclusive supplier statements, and performance specs.
- Define guidance for balancing rugged industrial tone with lapidary craft.

### Out of scope

- Writing final homepage, product page, or policy copy.
- Legal approval of all claims.
- Implementing copy in Shopify admin or templates.

### Acceptance criteria

- [ ] Positioning document identifies core brand promise and supporting proof points.
- [ ] Audience-specific messaging is mapped for at least new buyers, experienced users, existing owners, professional workshops, wholesale/institutional buyers, and international visitors.
- [ ] Claims requiring legal/business verification are flagged.
- [ ] Guidance distinguishes Rhino brand voice from The Gem Shop voice.

### Implementation considerations

- This is a content/process PBI.
- Final implementation records should use `docs/project/pbi-implementation-record-template.md`.
- Later copy implementation must follow `docs/architecture/hardcoded-string-locale-strategy.md`.
- Any Shopify page or policy updates created later require admin-change evidence.

### Dependencies

- B-001 brand evidence inventory.
- Business stakeholder approval.
- Legal review owner for warranty, trademark, supplier, and manufacturing claims.

### Risks and cautions

- Overstating technical claims creates legal and trust risk.
- Vague premium language is not enough for technical buyers.
- The Gem Shop and Rhino identities must not be blurred in a way that confuses fulfillment or support responsibility.

### Testing notes

- Review positioning against product, support, warranty, freight, and international purchase journeys.
- Confirm terms remain readable at mobile sizes when used later.

### Success measure

Later copy and design PBIs can reference an approved positioning source instead of debating brand direction in every issue.

### Open questions

- Is Rhino positioned as manufacturer, brand, product line, or storefront?
- Should the primary promise lead with ecosystem support, innovation, durability, or versatility?

---

## `[B-003] Resolve Rhino, The Gem Shop, and Silica-Gem identity architecture`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Content
**Type:** Discovery
**Priority:** P0
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `type: discovery`, `area: content`, `area: seo`, `needs-legal-review`

### Problem or opportunity

Customers need to understand who manufactures, sells, fulfills, supports, warranties, and repairs Rhino equipment. Current public evidence refers to Rhino, Silica-Gem, and The Gem Shop in overlapping ways.

### Evidence

- Current Rhino About page says Rhino is an amalgamation of Silica-Gem and The Gem Shop.
- The same page says Silica-Gem handles manufacturing and sourcing while The Gem Shop handles customer service, website management, and fulfillment.
- The Gem Shop Rhino collection says The Gem Shop is the exclusive American supplier of Rhino Lapidary equipment.
- `docs/seo/structured-data-and-seo-architecture.md` includes TODOs around the legal/business entity used in structured data.

### Proposed outcome

Define the identity architecture and approved explanatory language for storefront surfaces, structured data, social sharing, support pages, footer content, and product pages.

### Scope

- Clarify legal entity, brand entity, manufacturer role, distributor/supplier role, fulfillment role, and support/warranty role.
- Define approved short, medium, and long descriptions.
- Identify where each statement belongs: header/footer, About page, product page trust module, policy pages, structured data, and social profiles.
- Record legal review requirements.

### Out of scope

- Implementing structured data changes.
- Rewriting all About/support/policy pages.
- Changing business operations.

### Acceptance criteria

- [ ] Identity architecture document names each entity and its role.
- [ ] Approved language exists for compact storefront use and full About/support use.
- [ ] Structured data implications are linked to SEO PBIs or docs.
- [ ] Legal/business owner signs off before launch use.

### Implementation considerations

- This is content/discovery with legal and SEO implications.
- Later Shopify admin page edits require `docs/project/admin-change-record-template.md`.
- Later structured data code changes require repository validation, Theme Check, SEO verification, and release notes.
- Coordinate with `docs/seo/structured-data-and-seo-architecture.md`.

### Dependencies

- Business/legal owner.
- B-001 and B-002.
- Admin access to pages, policies, social links, and store details.

### Risks and cautions

- Misstating manufacturer, supplier, or warranty responsibility can create customer support and legal risk.
- SEO structured data must not contradict visible storefront language.

### Testing notes

- Review all identity statements in desktop and mobile templates after implementation.
- Validate structured data when later changed.

### Success measure

Customers can quickly understand who Rhino is and who supports the purchase without leaving product pages.

### Open questions

- What legal entity should appear in Organization structured data?
- Should social links point to Rhino-owned channels, The Gem Shop channels, or both with labels?

---

## `[B-004] Define the Rhino visual direction system`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Design
**Type:** Discovery
**Priority:** P1
**Impact:** High
**Effort:** L
**Confidence:** Medium
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `type: discovery`, `area: design-system`

### Problem or opportunity

The storefront should not feel like a lightly recolored Trade theme, but visual ideas need to be evaluated before implementation. Potential directions such as rhino armor, geological strata, technical diagrams, workshop materials, and polished stone can become noisy or gimmicky if not governed.

### Evidence

- The master backlog lists possible concepts but warns not to blindly implement them.
- Current Trade settings provide a muted industrial palette but no distinct Rhino system.
- The legacy Rhino and The Gem Shop sites show existing product/media evidence but not a final design system.

### Proposed outcome

Create a visual direction document with approved, rejected, and experimental directions for Rhino's storefront.

### Scope

- Produce style tiles or documented visual directions for at least two plausible approaches.
- Evaluate color, type, texture, photography, iconography, product detail hierarchy, buttons, badges, diagrams, and motion.
- Recommend one launch foundation direction and identify long-term experimental directions.
- Document accessibility, performance, and maintainability constraints.

### Out of scope

- Implementing CSS or theme settings.
- Creating final production assets.
- Redesigning specific templates.

### Acceptance criteria

- [ ] Visual direction document distinguishes source evidence from proposals.
- [ ] Recommended direction is appropriate for expensive industrial equipment and technical specs.
- [ ] Rejected directions include rationale.
- [ ] Accessibility and performance constraints are explicit.

### Implementation considerations

- This is a design/process PBI.
- If visual prototypes use repository assets, follow `docs/media/media-asset-source-of-truth.md`.
- Do not introduce app-based design tools or embedded scripts without app/privacy review.
- Future code implementation should update `data/design-token-inventory.json` and `assets/rhino-custom.css`.

### Dependencies

- B-001, B-002, and B-003.
- Access to current logo and product media.

### Risks and cautions

- Decorative backgrounds can reduce spec readability.
- Single-hue palettes and generic industrial tropes can make Rhino feel undifferentiated.
- Visual concepts should not imply unverified manufacturing or certification claims.

### Testing notes

- Review proposed directions at mobile and desktop dimensions.
- Check color contrast early.
- Validate that tables, prices, specs, and compatibility labels remain legible.

### Success measure

Stakeholders can approve a direction before implementation PBIs spend time in code or admin settings.

### Open questions

- Should the launch visual system be restrained and technical, expressive and geological, or a hybrid?
- Which visual ideas are off-brand for Rhino?

---

## `[B-005] Define the accessible Rhino color system`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Improvement
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: accessibility`, `area: theme-settings`

### Problem or opportunity

The current color schemes are Trade-style neutrals and taupes, with no documented Rhino-specific roles for machine confidence, support, alerts, badges, links, diagrams, or compatibility. A color system is needed before broad visual implementation.

### Evidence

- `config/settings_data.json` contains color schemes using light gray, white, taupe, charcoal, and dark gray-blue values.
- `data/design-token-inventory.json` has only one color token, `--rhino-color-brand-primary`, mapped to Trade button color.
- `docs/architecture/design-token-governance.md` requires Rhino-specific visual decisions to be represented in token inventory.

### Proposed outcome

Define an accessible Rhino color system with semantic roles, token names, theme-setting implications, and contrast rules.

### Scope

- Define launch-ready roles such as brand primary, brand secondary, surface, alternate surface, text, muted text, border, link, focus, success, warning, error, sale, sold-out, freight/support, machine-family identifiers, and diagram accents.
- Map roles to Shopify color schemes where practical.
- Update proposed token inventory in planning, then create implementation PBIs for settings/CSS changes.
- Include contrast requirements for text, buttons, links, badges, forms, and diagrams.

### Out of scope

- Implementing the final palette in `settings_data.json` or CSS.
- Designing full pages.
- Changing product data or badges.

### Acceptance criteria

- [ ] Color roles are defined with token names and intended usage.
- [ ] All customer-facing foreground/background pairings meet WCAG AA contrast targets.
- [ ] Color is not the only way to communicate state or machine-family meaning.
- [ ] Admin/theme setting changes are identified separately from repository CSS changes.

### Implementation considerations

- Code implementation must update `data/design-token-inventory.json`, `assets/rhino-custom.css`, and possibly `config/settings_data.json`.
- Theme-editor color changes require `docs/project/admin-change-record-template.md` and `docs/development/settings-data-policy.md`.
- Validate with `npm run validate:design-tokens` and the accessibility baseline.
- Record manual QA for key page surfaces when implemented.

### Dependencies

- B-004 visual direction.
- B-014 machine-family identifier strategy.
- Business approval of palette.

### Risks and cautions

- Machine-family color coding can fail accessibility if it relies on hue alone.
- Aggressive dark palettes can harm product detail readability.
- Theme setting changes can overwrite remote theme-editor state if not handled through settings policy.

### Testing notes

- Test desktop, mobile, 200% zoom, and forced-color/high-contrast behavior where practical.
- Check header, footer, product cards, badges, forms, filters, product pages, cart, and support content.

### Success measure

Future visual work uses a small set of approved semantic color roles instead of scattered literal values.

### Open questions

- Should red remain part of Rhino's visible identity, or only appear in alerts and legacy references?
- Which machine families need distinct identifiers at launch?

---

## `[B-006] Define typography, type scale, and technical hierarchy`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Improvement
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: accessibility`, `area: theme-settings`

### Problem or opportunity

DM Sans and Jost are configured, but there is no Rhino typography system for product specs, comparison data, support notes, technical labels, headings, and long educational content.

### Evidence

- `config/settings_data.json` sets heading font to `dm_sans_n5`, heading scale to `105`, body font to `jost_n4`, and body scale to `100`.
- Product and homepage templates still contain generic Trade content.
- The quality baseline requires logical heading levels, readable text, zoom support, and no layout overlap.

### Proposed outcome

Define Rhino typography roles and hierarchy for storefront use.

### Scope

- Define type roles for page title, section heading, product title, product subtitle, technical label, spec value, price, badge, support note, body copy, caption, table heading, and CTA.
- Decide whether current DM Sans/Jost choices remain.
- Define type scale boundaries without viewport-based font scaling.
- Define rules for long product names, variant labels, grit/diameter notation, and mobile wrapping.

### Out of scope

- Implementing font/theme setting changes.
- Rewriting copy.
- Adding new fonts without performance review.

### Acceptance criteria

- [ ] Typography roles and usage rules are documented.
- [ ] The system supports dense technical content without oversized headings inside compact panels.
- [ ] Long product names and technical values have wrapping rules.
- [ ] Any font changes include performance and Shopify font availability considerations.

### Implementation considerations

- Theme setting changes require settings-data policy and admin evidence.
- CSS changes belong in `assets/rhino-custom.css` or future `assets/rhino-*.css`.
- Token updates should be reflected in `data/design-token-inventory.json`.
- Run design-token, CSS architecture, Theme Check, and accessibility validation when implemented.

### Dependencies

- B-004 visual direction.
- B-025 product naming and terminology rules.

### Risks and cautions

- Adding external fonts can degrade performance and privacy posture.
- Over-large display type can harm scanability on product and support pages.

### Testing notes

- Test at 360, 390, 768, 1440, and 1920 widths.
- Test browser zoom to 200%.
- Inspect product cards, product pages, quick order, filters, forms, and policy/support pages.

### Success measure

Technical product information becomes easier to scan without relying on one-off font sizes.

### Open questions

- Are DM Sans and Jost final brand choices or temporary Trade preset settings?
- Do technical labels need a mono or tabular numeral style?

---

## `[B-007] Define layout rhythm, spacing, borders, radii, and elevation`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Improvement
**Priority:** P1
**Impact:** Medium
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: css`

### Problem or opportunity

Current Trade settings include generic spacing, cards, radii, borders, and shadows. Rhino needs a restrained layout system that supports technical scanning without nested cards or decorative clutter.

### Evidence

- `config/settings_data.json` uses `page_width: 1200`, `spacing_sections: 0`, grid spacing of 12, button/input/card radii, and mostly zero shadows.
- `data/design-token-inventory.json` includes `--rhino-section-spacing-y` only.
- The custom frontend instructions discourage nested cards, excessive rounding, and decorative background effects.

### Proposed outcome

Create rules for spacing, borders, radii, elevation, dividers, panels, and dense technical layouts.

### Scope

- Define spacing scale for sections, product info, specs, cards, filters, forms, and support modules.
- Define radius rules for buttons, product cards, media, badges, forms, modals, drawers, and tables.
- Define when borders/dividers are preferred over cards.
- Define shadow/elevation usage, likely minimal for an engineered storefront.

### Out of scope

- Implementing CSS.
- Redesigning page sections.
- Changing Trade layout globally without a separate implementation PBI.

### Acceptance criteria

- [ ] Spacing/radius/elevation rules are documented and mapped to tokens where needed.
- [ ] Rules support dense product/spec displays and mobile wrapping.
- [ ] Guidance explicitly avoids nested card patterns and decorative floating panels.
- [ ] Implementation implications for CSS and theme settings are listed.

### Implementation considerations

- Update `data/design-token-inventory.json` before code implementation.
- Use `assets/rhino-custom.css` for Rhino-specific CSS.
- Theme setting changes require settings-data policy and release notes.
- Visual changes require manual QA evidence and responsive screenshots.

### Dependencies

- B-004, B-005, and B-006.

### Risks and cautions

- Too many cards can make an operational storefront feel generic and hard to scan.
- Removing too much separation can hurt technical comparison.

### Testing notes

- Test product grids, product pages, quick order, collection filters, contact forms, and support modules at required viewport widths.

### Success measure

New Rhino sections and modified Trade surfaces feel consistent without ad hoc spacing and radius decisions.

### Open questions

- Should machinery and support modules use a stronger border language than general merchandising content?

---

## `[B-008] Define button, link, and CTA hierarchy`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Improvement
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: accessibility`, `area: conversion`

### Problem or opportunity

Expensive equipment purchases need a clear action hierarchy across buy, request help, compare, view specs, download manual, watch video, find compatible parts, and contact support. Stock Trade button styles do not define Rhino-specific intent.

### Evidence

- `config/settings_data.json` defines generic button border/radius settings.
- Product templates still use stock structure and placeholder tabs.
- Current Rhino pages rely on legacy Weebly buttons and inline links.

### Proposed outcome

Define CTA roles and visual hierarchy for commerce, support, education, and technical discovery.

### Scope

- Define primary, secondary, tertiary, destructive, support, external, disabled, loading, and icon-button styles.
- Define link styles for inline content, technical documents, videos, support calls, and external The Gem Shop/Silica-Gem references.
- Define copy rules for CTAs.
- Identify which roles can reuse Trade buttons and which require Rhino CSS.

### Out of scope

- Implementing button styles.
- Changing product purchase behavior.
- Adding new support forms or app widgets.

### Acceptance criteria

- [ ] Button and link roles are documented with usage rules.
- [ ] Purchase and support actions are visually distinct without confusing priority.
- [ ] Disabled/loading/error states are included.
- [ ] Keyboard focus and accessible names are covered.

### Implementation considerations

- CSS implementation belongs in `assets/rhino-custom.css`.
- Reusable UI copy should follow `docs/architecture/hardcoded-string-locale-strategy.md`.
- Code changes require Theme Check, repository validation, accessibility tests, and manual QA evidence.

### Dependencies

- B-005 color system.
- B-006 typography system.
- Product purchase architecture from Epic A.

### Risks and cautions

- Making every support link look like a primary CTA can distract from purchasing.
- Color-only state differences are not accessible.

### Testing notes

- Test keyboard focus, hover, active, disabled, loading, high contrast, and reduced-motion states.
- Test product page, collection, cart, contact, and support surfaces.

### Success measure

Customers can identify the next best action on technical and purchase pages without hesitation.

### Open questions

- Should "Request freight quote" or "Contact support" ever outrank "Add to cart" for machinery?

---

## `[B-009] Define Rhino form, validation, empty, and error-state patterns`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Improvement
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: accessibility`, `area: forms`

### Problem or opportunity

Forms and state messaging need to support support requests, contact, search, customer accounts, cart errors, freight questions, product availability, and future lead capture without inconsistent styling or inaccessible feedback.

### Evidence

- Trade provides stock forms and error components.
- The quality baseline defines form label, error, and success-message requirements.
- Future Rhino workflows are likely to include support, warranty, wholesale, school/club, and freight inquiries.

### Proposed outcome

Create a Rhino state pattern guide covering forms, validation, empty states, no-results states, loading states, success states, warnings, errors, and unavailable product states.

### Scope

- Define visual/copy patterns for contact forms, search no-results, empty cart, product unavailable, cart update errors, policy/support notices, and account forms.
- Define accessible error and success behavior.
- Define when state messages belong in locale files, admin content, or product metafields.

### Out of scope

- Building new forms.
- Installing form apps.
- Changing Shopify checkout.

### Acceptance criteria

- [ ] State patterns cover form, search, product, cart, account, and support contexts.
- [ ] Every pattern includes accessible name, focus, and announcement guidance where applicable.
- [ ] Copy ownership is documented.
- [ ] Future app or embedded-form needs are flagged for privacy review.

### Implementation considerations

- Code changes must follow CSS architecture, locale strategy, and QA baseline.
- App or embedded form changes must follow app policy and security/privacy checklist.
- Admin form changes require admin evidence and rollback notes.

### Dependencies

- B-005, B-006, and future Epic P form strategy.

### Risks and cautions

- Forms can introduce customer-data collection and privacy requirements.
- Placeholder text must not be the only label.

### Testing notes

- Test keyboard-only interaction, screen reader announcement where practical, mobile, 200% zoom, and error recovery.

### Success measure

State feedback feels consistent and trustworthy across purchase, support, and discovery journeys.

### Open questions

- Which forms are Shopify-native at launch versus future app-backed forms?

---

## `[B-010] Define Rhino product badge and trust-marker system`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Improvement
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: product-data`, `needs-admin`

### Problem or opportunity

Product cards and product pages need meaningful badges beyond stock sale/sold-out treatment, especially for machine families, compatibility, freight, warranty, support, backorder, replacement part, consumable type, and new product signals.

### Evidence

- `config/settings_data.json` configures generic sale and sold-out badge schemes.
- The Gem Shop Rhino collection includes high-value machinery and consumables in one collection, with limited visible differentiation.
- Product data architecture docs already identify compatibility, warranty/support, freight, and product classes as structured needs.

### Proposed outcome

Define a badge and trust-marker system that can be driven by Shopify product data, metafields, collection context, and theme settings.

### Scope

- Define badge categories and priority order.
- Define visual treatment and copy rules.
- Define data source for each badge.
- Include machine-family and compatibility constraints.
- Identify which badges belong on product cards, product pages, collections, search results, cart, and support areas.

### Out of scope

- Implementing badge rendering.
- Creating metafield definitions.
- Editing product data.

### Acceptance criteria

- [ ] Badge categories and priority rules are documented.
- [ ] Each badge has an intended data source.
- [ ] Color/icon usage is accessible and does not rely on color alone.
- [ ] Admin and code implementation requirements are separated.

### Implementation considerations

- Product/admin data changes require admin evidence.
- Code changes likely touch `snippets/card-product.liquid`, product page sections, CSS, and possibly metafields/metaobjects.
- Use `docs/architecture/metafield-metaobject-architecture.md` and `data/product-data-rules.json`.
- Validate product data and design tokens when implemented.

### Dependencies

- B-005 color system.
- B-013 icon system.
- B-014 machine-family identifier system.
- Epic E product information architecture.

### Risks and cautions

- Too many badges reduce trust and scanability.
- Unverified warranty/freight badges create legal and operational risk.

### Testing notes

- Test product cards, search results, collection grids, product pages, and mobile wrapping.
- Test badge priority when several badges apply.

### Success measure

Customers can quickly distinguish machines, parts, consumables, compatibility, and support-critical information in browsing contexts.

### Open questions

- Which badges are launch-critical?
- Who owns badge data accuracy?

---

## `[B-011] Define Rhino icon system and stock icon replacement plan`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Improvement
**Priority:** P1
**Impact:** Medium
**Effort:** L
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: media`, `area: accessibility`

### Problem or opportunity

The theme includes stock Trade icons for unrelated product categories, while Rhino needs a technical icon system for machinery, support, compatibility, warranty, shipping, voltage, water, grit, diameter, arbor size, manuals, and replacement parts.

### Evidence

- The asset folder contains stock icons such as food, apparel, beauty, shoe, and other generic symbols.
- `data/stock-asset-ledger.json` is only a starter ledger.
- `docs/media/media-asset-source-of-truth.md` requires repository-owned UI media to be listed in `data/media-manifest.json`.

### Proposed outcome

Define icon categories, style rules, accessibility rules, asset ownership, and a phased stock icon replacement plan.

### Scope

- Inventory currently referenced and unreferenced stock icons.
- Define required Rhino icon set and naming.
- Define whether icons should be SVG snippets, asset files, inline symbols, or CSS-backed.
- Define accessible label rules for informative icons and hidden rules for decorative icons.
- Update the stock asset ledger and media manifest plan.

### Out of scope

- Drawing final icons.
- Removing existing assets.
- Implementing icon rendering.

### Acceptance criteria

- [ ] Icon system document identifies launch-critical and later icons.
- [ ] Stock icon decisions are captured in `data/stock-asset-ledger.json` or a linked ledger plan.
- [ ] Repository-owned icon assets have media manifest requirements.
- [ ] Accessibility guidance covers labels, decorative icons, and color-only meaning.

### Implementation considerations

- Future icon asset changes must update `data/media-manifest.json`.
- Use `npm run validate:media`, `npm run validate:stock-assets`, and accessibility checks when implemented.
- Do not install icon apps for static UI icons.
- Do not use external icon CDNs unless reviewed under privacy/performance policy.

### Dependencies

- B-005, B-010, B-014, and B-015.

### Risks and cautions

- Icons without labels can create accessibility failures.
- Overly illustrative icons can feel less precise than technical labels.

### Testing notes

- Test icon visibility at small sizes, high contrast, mobile, and 200% zoom.
- Confirm tooltips or labels where needed.

### Success measure

Rhino has a coherent technical icon set and a controlled path away from irrelevant stock assets.

### Open questions

- Should icons use line-art technical style, filled industrial symbols, or a hybrid?

---

## `[B-012] Define machine-family visual identifiers`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Improvement
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: product-data`, `needs-admin`

### Problem or opportunity

Rhino's ecosystem includes machines and compatible consumables or replacement parts. Customers need a reliable way to see family and compatibility without relying on product titles alone.

### Evidence

- The Gem Shop Rhino collection includes machine names such as EM-1, Beadmaster, Lapmaster, Sawmaster, Shapemaster, and Trimmaster.
- Product data architecture docs identify machine family and compatibility as required structured concepts.
- The current theme has no Rhino-specific machine-family visual system.

### Proposed outcome

Define machine-family identifiers that combine text, color, iconography, and data source rules.

### Scope

- Define which machine families need identifiers.
- Define identifier format for product cards, product pages, filters, compatibility tables, manuals, and support content.
- Define color/icon/text rules that remain accessible.
- Map identifiers to product metafields or metaobjects.

### Out of scope

- Implementing filters or compatibility tables.
- Editing product data.
- Creating final icons.

### Acceptance criteria

- [ ] Machine families and visual identifiers are documented.
- [ ] Identifier meaning is conveyed with text, not color alone.
- [ ] Data source and admin ownership are identified.
- [ ] Implementation dependencies are linked to product data and search/filter PBIs.

### Implementation considerations

- Admin data changes require admin-change evidence.
- Code changes may affect product cards, product templates, collection filters, and search results.
- Coordinate with `docs/architecture/metafield-metaobject-architecture.md` and `docs/architecture/adr-0002-collection-filtering-architecture.md`.

### Dependencies

- B-005 color system.
- B-010 badge system.
- B-011 icon system.
- Epic E/H product data and filtering work.

### Risks and cautions

- Incorrect compatibility signals are high-risk for existing owners ordering parts.
- Too many family colors can weaken accessibility and brand coherence.

### Testing notes

- Test product cards, product pages, collection filters, search, and mobile wrapping when implemented.
- Validate product data exports.

### Success measure

Customers can understand machine-family relevance and compatibility without reading every product description.

### Open questions

- Which machine families are active launch families?
- Are there compatibility overlaps that need multi-family identifiers?

---

## `[B-013] Define technical diagram and blueprint styling`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Design
**Type:** Discovery
**Priority:** P2
**Impact:** Medium
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Post-Launch
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: media`, `area: product-page`

### Problem or opportunity

Technical diagrams could strongly differentiate Rhino, but they need a consistent visual language and content model before they are introduced into product pages or support flows.

### Evidence

- The master backlog identifies technical drawings, machine diagrams, water flow, rotational motion, cutting, grinding, and polishing as visual concepts to investigate.
- Current product pages contain practical product images but no repo-owned diagram system.
- Product data architecture identifies manuals, specs, compatibility, and support files.

### Proposed outcome

Define diagram styles, usage rules, asset requirements, and accessibility requirements for future machine diagrams.

### Scope

- Define when to use diagrams versus product photos, tables, or video.
- Define style rules for labels, callouts, dimensions, water flow, movement arrows, exploded views, compatibility callouts, and safety/support notes.
- Define alt text and long-description requirements.
- Define whether diagrams are repository UI assets, Shopify Files, product media, or downloadable support files.

### Out of scope

- Creating final diagrams.
- Building interactive diagrams.
- Editing product pages.

### Acceptance criteria

- [ ] Diagram style guide exists with usage rules and examples or references.
- [ ] Asset storage and ownership rules are documented.
- [ ] Accessibility requirements for complex diagrams are documented.
- [ ] Future implementation PBIs are identified for machine pages.

### Implementation considerations

- Follow `docs/media/media-asset-source-of-truth.md`.
- Repository UI diagrams require `data/media-manifest.json`.
- Product/support diagrams likely belong in Shopify Files or product media.
- Interactive diagrams would be Epic Y or product-page feature work, not base brand foundation.

### Dependencies

- B-001 media evidence.
- B-004 visual direction.
- Epic F machine product page requirements.

### Risks and cautions

- Diagrams can mislead customers if specs or compatibility are inaccurate.
- Overly decorative blueprint effects can reduce readability.

### Testing notes

- Test diagrams on mobile, at 200% zoom, and with text spacing changes.
- Review alt text and long descriptions.

### Success measure

Future machine pages can add diagrams without reinventing visual and accessibility rules.

### Open questions

- Are original CAD, manual, or exploded-view files available?

---

## `[B-014] Define geological pattern and texture rules`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Design
**Type:** Discovery
**Priority:** P2
**Impact:** Medium
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Post-Launch
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: performance`, `area: media`

### Problem or opportunity

Geological textures and cut-stone references could make Rhino feel tied to lapidary craft, but texture misuse can create visual noise, poor contrast, and asset bloat.

### Evidence

- The master backlog lists geological strata, cut-stone textures, and rough-to-polished progression as concepts to investigate.
- Current repository media is minimal and mostly stock/inherited.
- The media source-of-truth doc discourages committing large product imagery to the theme.

### Proposed outcome

Define where geological textures are allowed, where they are prohibited, and what performance/accessibility requirements apply.

### Scope

- Evaluate texture use for backgrounds, section separators, product badges, diagrams, social images, and editorial content.
- Define approved contrast overlays, image weights, file formats, and fallback colors.
- Define rules preventing textures behind dense specs, tables, form fields, prices, and purchase controls.

### Out of scope

- Creating final texture assets.
- Implementing textured sections.
- Adding decorative background scripts or animated effects.

### Acceptance criteria

- [ ] Texture usage rules are documented.
- [ ] Dense technical surfaces explicitly prohibit readability-reducing texture.
- [ ] Performance limits and asset ownership rules are defined.
- [ ] Accessibility contrast rules are included.

### Implementation considerations

- Any texture asset must be recorded in `data/media-manifest.json`.
- Validate media and performance when implemented.
- Large or decorative assets should be lazy loaded or avoided.
- No external texture CDN should be used without privacy/performance review.

### Dependencies

- B-004 visual direction.
- B-005 color system.
- B-031 performance budget for brand media.

### Risks and cautions

- Texture-heavy design can make Rhino feel generic, rustic, or luxury-oriented instead of engineered.
- Background imagery can obscure text on mobile crop changes.

### Testing notes

- Test contrast, mobile crops, 200% zoom, and Lighthouse before/after when implemented.

### Success measure

Geological references support brand texture without impairing product evaluation.

### Open questions

- Should launch use any texture at all, or reserve it for editorial/education pages?

---

## `[B-015] Define Rhino motif and logo usage rules`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Discovery
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: media`, `needs-admin`

### Problem or opportunity

The Rhino name and current logo are central brand assets, but the repo does not contain logo files or usage rules. Overusing rhino motifs could become gimmicky, while underusing them leaves the site generic.

### Evidence

- `config/settings_data.json` has no committed logo value and `logo_width` is 70.
- Current Rhino pages reference Rhino branding in page imagery and social metadata.
- `data/media-manifest.json` has only a proposed placeholder.

### Proposed outcome

Define approved logo variants, clear-space rules, minimum sizes, contrast requirements, background rules, and motif use cases.

### Scope

- Inventory available logo files and source quality.
- Define primary, reversed, one-color, small-space, social, favicon, and app icon variants.
- Define when rhino armor/silhouette/horn motifs may be used.
- Define prohibited uses.

### Out of scope

- Redrawing or redesigning the logo.
- Uploading logo assets to Shopify.
- Changing header/footer settings.

### Acceptance criteria

- [ ] Logo/motif usage guide exists.
- [ ] Required logo variants and missing files are listed.
- [ ] Accessibility and contrast requirements are documented.
- [ ] Theme-editor setting changes are identified for a later implementation PBI.

### Implementation considerations

- Logo uploads and theme settings require settings-data policy and admin-change evidence.
- Repository-owned UI logos/icons require `data/media-manifest.json`.
- Header/footer implementation must be manually QA'd across the viewport matrix.

### Dependencies

- B-001 brand evidence inventory.
- Business approval of current or revised logo assets.

### Risks and cautions

- Poor logo contrast or tiny logo sizing weakens trust.
- Motif use should not distract from machinery and specs.

### Testing notes

- Test header, footer, password page, social images, mobile nav, and high-contrast backgrounds when implemented.

### Success measure

Rhino logo usage becomes consistent across storefront, social sharing, and theme-editor assets.

### Open questions

- Are vector logo files available?
- Should Rhino-owned social channels exist separately from The Gem Shop channels?

---

## `[B-016] Define favicon, app icon, and browser preview assets`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Improvement
**Priority:** P1
**Impact:** Medium
**Effort:** S
**Confidence:** Medium
**Suggested milestone:** Launch Readiness
**Suggested GitHub labels:** `epic: brand-foundation`, `area: media`, `area: seo`, `needs-admin`

### Problem or opportunity

Favicons, app icons, and browser/social preview assets are small but trust-critical. The Gem Shop pages currently use The Gem Shop favicon, and the Rhino Shopify repository does not define Rhino favicon/app icon requirements.

### Evidence

- The Gem Shop Rhino pages load a The Gem Shop favicon.
- `config/settings_data.json` does not expose a committed favicon or logo value.
- `docs/media/media-asset-source-of-truth.md` requires source-of-truth rules for theme UI media.

### Proposed outcome

Define required favicon, app icon, pinned tab, and browser preview assets for Rhino.

### Scope

- Define required sizes, formats, source files, ownership, alt/metadata requirements, and Shopify admin locations.
- Identify whether assets belong in Shopify admin, Shopify Files, or repository assets.
- Define validation steps for browser tabs, mobile homescreen saves, and social previews.

### Out of scope

- Creating final icon files.
- Uploading or configuring assets.
- Implementing SEO/social metadata changes.

### Acceptance criteria

- [ ] Asset requirements and ownership are documented.
- [ ] Shopify admin locations are identified.
- [ ] Missing source files are listed.
- [ ] Later implementation requires admin evidence and media manifest updates where applicable.

### Implementation considerations

- Admin/theme-editor changes require `docs/project/admin-change-record-template.md`.
- Repository-owned assets require `data/media-manifest.json`.
- Release notes must mention changed favicon/app/social assets.

### Dependencies

- B-015 logo usage rules.
- B-019 social-sharing image system.

### Risks and cautions

- Browser/app icons with low contrast or too much detail can look unprofessional.
- The Gem Shop identity should not appear where Rhino identity is expected unless explicitly approved.

### Testing notes

- Test in desktop browser tabs, mobile Safari/Chrome, bookmarks, and social preview validators when implemented.

### Success measure

Rhino has a complete, approved small-format identity asset checklist before launch.

### Open questions

- Should app icons use the full logo, a rhino mark, or a machine/monogram mark?

---

## `[B-017] Define social-sharing and Open Graph image system`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Improvement
**Priority:** P1
**Impact:** Medium
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Launch Readiness
**Suggested GitHub labels:** `epic: brand-foundation`, `area: media`, `area: seo`, `area: content`

### Problem or opportunity

Social shares from YouTube, QR codes, trade shows, product pages, and collection pages should show credible Rhino imagery and copy. Current sources mix Rhino legacy imagery, The Gem Shop collection imagery, and default Shopify/Trade metadata behavior.

### Evidence

- Current Rhino pages expose EM-1 images in `og:image`.
- The Gem Shop Rhino collection uses Rhino EM-1 collection imagery.
- The Gem Shop EM-1 product exposes product images and detailed product metadata.
- `snippets/meta-tags.liquid` and Shopify theme/product data determine many storefront social previews.

### Proposed outcome

Define social-sharing image templates, copy rules, source media rules, and ownership for home, collection, product, article, support, and policy pages.

### Scope

- Define page types needing social images.
- Define image dimensions, safe areas, text usage, logo usage, product crop rules, and alt/metadata.
- Define when product media should drive previews versus a brand image.
- Identify Shopify admin and repo implementation requirements.

### Out of scope

- Creating final social images.
- Implementing metadata changes.
- Adding social scheduling or marketing apps.

### Acceptance criteria

- [ ] Social image system covers homepage, collection, product, article, and support/policy pages.
- [ ] Source-of-truth and ownership are documented.
- [ ] Image dimensions and crop rules are documented.
- [ ] SEO implementation dependencies are linked.

### Implementation considerations

- Coordinate with `docs/seo/structured-data-and-seo-architecture.md`.
- Media assets follow `docs/media/media-asset-source-of-truth.md`.
- Admin changes need admin evidence.
- Metadata code changes require Theme Check, repository validation, SEO validation, and release notes.

### Dependencies

- B-015 and B-016.
- Product media audit.
- SEO/canonical decisions.

### Risks and cautions

- Product image previews must not misrepresent included accessories.
- Text-heavy social images may be illegible on mobile/social surfaces.

### Testing notes

- Use social preview validators when implemented.
- Check product pages with and without product-specific media.

### Success measure

Shared Rhino URLs present consistent, product-relevant, trustworthy previews.

### Open questions

- Should social images emphasize machinery, polished stone output, or the Rhino mark?

---

## `[B-018] Define product photography art direction`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Content
**Type:** Discovery
**Priority:** P1
**Impact:** High
**Effort:** L
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: media`, `area: content`, `area: product-page`, `needs-admin`

### Problem or opportunity

Product photography is one of the highest-trust surfaces for expensive machinery. Rhino needs consistent guidance for machine photos, setup photos, detail shots, accessories, consumables, scale references, packaging, and support visuals.

### Evidence

- The repository does not contain product photography.
- The Gem Shop EM-1 page includes product and setup images such as machine, flexible shaft, trim saw setup, and accessory setup photos.
- The Gem Shop Rhino collection includes product imagery for multiple machines and consumables.
- `docs/media/media-asset-source-of-truth.md` states product media belongs in Shopify product media, not theme assets.

### Proposed outcome

Create photography art direction and shot-list requirements for Rhino products and support content.

### Scope

- Define shot categories: hero, front/side/back, in-use, setup, detail, included accessories, scale, texture/output, packaging, maintenance, replacement part, and compatibility.
- Define background, lighting, crop, aspect ratio, resolution, file format, and alt text rules.
- Define product-specific needs for machines versus consumables.
- Inventory reshoot needs and existing image gaps.

### Out of scope

- Producing new photography.
- Uploading product media.
- Redesigning product pages.

### Acceptance criteria

- [ ] Photography guide and shot list exist.
- [ ] Machine and consumable requirements are separated.
- [ ] Existing media gaps are listed by product family where known.
- [ ] Alt text and licensing/permission requirements are documented.

### Implementation considerations

- Product media changes require Shopify admin evidence.
- Product catalog media should not be committed to the repo.
- Launch-critical media changes must be reflected in release notes.
- Manual QA must review mobile crops and product-media accessibility.

### Dependencies

- B-001 brand evidence inventory.
- Shopify admin product/media access.
- Product fixture data from Epic A.

### Risks and cautions

- Poor or inconsistent photography undermines confidence in high-ticket machinery.
- Crops that hide controls, scale, or included accessories can create product misunderstanding.

### Testing notes

- Test product gallery, thumbnails, product cards, social previews, mobile crops, zoom/modal behavior, and alt text.

### Success measure

Each launch-critical machine has a documented media path that supports confident buying and support.

### Open questions

- Which products need reshoots before launch?
- Are model releases or usage permissions needed for workshop/in-use imagery?

---

## `[B-019] Define video thumbnail and embedded-video brand rules`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Improvement
**Priority:** P2
**Impact:** Medium
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Post-Launch
**Suggested GitHub labels:** `epic: brand-foundation`, `area: media`, `area: privacy`, `area: performance`, `area: content`

### Problem or opportunity

Rhino's educational and product videos can build confidence, but embedded videos and thumbnails need consistent styling, privacy review, performance controls, captions, and transcript expectations.

### Evidence

- Current Rhino homepage embeds a YouTube video for the EM-1.
- The Gem Shop collection links to Rhino YouTube videos.
- Trade sections support YouTube/Vimeo video URLs.
- The privacy checklist requires review for video embeds that set cookies.

### Proposed outcome

Define a video usage system covering thumbnails, overlays, captions, transcripts, embeds, privacy, performance, and placement rules.

### Scope

- Define video categories: product overview, setup, maintenance, technique, troubleshooting, comparison, and support.
- Define thumbnail composition, logo use, title length, play-button treatment, and mobile crop rules.
- Define embed/privacy/performance requirements.
- Define caption/transcript expectations for instructional videos.

### Out of scope

- Editing or producing videos.
- Enabling new video apps.
- Implementing video sections.

### Acceptance criteria

- [ ] Video brand rules and accessibility requirements are documented.
- [ ] Third-party embed/privacy process is referenced.
- [ ] Performance requirements are documented.
- [ ] Future video implementation PBIs distinguish Shopify-native embeds from app/script approaches.

### Implementation considerations

- Use `docs/privacy/security-privacy-review-checklist.md` for embedded videos that set cookies or introduce third-party scripts.
- Update app/script registers if app embeds, scripts, or pixels are involved.
- Use media source-of-truth rules for thumbnails.
- QA must cover reduced motion, captions, transcripts, mobile, and performance.

### Dependencies

- B-018 photography/media guidance.
- Educational content strategy in Epic M.

### Risks and cautions

- Autoplay or heavy embeds can harm performance and accessibility.
- Videos without captions/transcripts do not meet the quality baseline.

### Testing notes

- Test thumbnail rendering, embed load, keyboard controls, captions, reduced motion, and Lighthouse impact.

### Success measure

Videos feel integrated with Rhino's brand and support customer education without hidden privacy or performance costs.

### Open questions

- Which YouTube channel is canonical for Rhino content?
- Should video embeds use privacy-enhanced mode or click-to-load patterns?

---

## `[B-020] Define brand motion and loading-state rules`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Improvement
**Priority:** P2
**Impact:** Medium
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Post-Launch
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: accessibility`, `area: performance`

### Problem or opportunity

Motion can support ideas like rotational movement, water flow, and machine precision, but unnecessary animation can distract from product evaluation, harm performance, or violate reduced-motion preferences.

### Evidence

- `config/settings_data.json` enables reveal-on-scroll and default hover animation behavior.
- Trade includes stock animation scripts and loading spinner assets.
- The quality baseline requires reduced-motion support and accessible status changes.

### Proposed outcome

Define motion rules for transitions, loading states, hover behavior, skeletons, progress, cart updates, quick-order feedback, and future technical animations.

### Scope

- Define allowed and prohibited motion patterns.
- Define duration/easing ranges and reduced-motion alternatives.
- Define loading and busy states for search, filters, quick order, cart, media, and future custom sections.
- Define whether any brand motion belongs in launch scope.

### Out of scope

- Implementing animations.
- Building interactive machine animations.
- Adding animation libraries.

### Acceptance criteria

- [ ] Motion rules cover functional feedback and brand expression separately.
- [ ] Reduced-motion requirements are explicit.
- [ ] Loading states include accessible announcements where needed.
- [ ] Performance and JavaScript constraints are documented.

### Implementation considerations

- Prefer CSS and existing Trade behavior over custom JavaScript.
- Rhino JS changes must follow `docs/architecture/javascript-architecture.md`.
- Event contracts must be added to `data/storefront-event-contracts.json` if new Rhino events are introduced.
- Run accessibility and performance tests when implemented.

### Dependencies

- B-004 visual direction.
- Cart/search/filter behavior from Epic A.

### Risks and cautions

- Motion that resembles machinery can imply interactivity or technical accuracy where none exists.
- Unnecessary JS animation can degrade mobile performance.

### Testing notes

- Test `prefers-reduced-motion`, slow network, mobile devices, cart/quick-order loading, and screen reader status announcements where practical.

### Success measure

Motion supports clarity and feedback without becoming decorative overhead.

### Open questions

- Should launch keep Trade's default reveal animations or disable them for a more utilitarian feel?

---

## `[B-021] Define Rhino brand voice and copy rules`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Content
**Type:** Content
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: content`, `area: brand`

### Problem or opportunity

The checked-in theme still speaks in generic Trade B2B copy. Rhino needs a voice that is technically credible, direct, supportive, and useful to both new and experienced lapidary customers.

### Evidence

- `templates/index.json` contains stock copy such as generic industry/business language and placeholder testimonial/education text.
- `templates/product.json` contains generic product tab headings.
- Current Rhino copy contains useful technical claims but also legacy phrasing and formatting that should be rewritten for Shopify.

### Proposed outcome

Create a brand voice guide with tone, terminology, claim discipline, CTA language, educational style, support language, and examples.

### Scope

- Define voice attributes and anti-patterns.
- Provide before/after examples using current Rhino and Trade copy.
- Define rules for product, support, freight, warranty, educational, wholesale, and international copy.
- Identify copy that requires legal or technical verification.

### Out of scope

- Rewriting all storefront pages.
- Editing Shopify pages or theme templates.
- Replacing policy text.

### Acceptance criteria

- [ ] Voice guide exists and includes examples.
- [ ] Stock Trade tone is explicitly rejected for launch copy.
- [ ] Technical/spec claims require source evidence.
- [ ] Rules identify where copy belongs: locale files, Shopify admin, product data, pages, or metafields.

### Implementation considerations

- Later copy implementation must follow `docs/architecture/hardcoded-string-locale-strategy.md`.
- Admin/page/product copy changes require admin evidence.
- Template copy changes require repository validation and placeholder checks.

### Dependencies

- B-002 positioning.
- B-003 identity architecture.
- B-025 terminology rules.

### Risks and cautions

- Overly salesy claims can undermine technical trust.
- Casual copy can make expensive machinery feel unsupported.

### Testing notes

- Review copy at mobile widths and with long product names.
- Validate no stock placeholders remain through `npm run check:placeholders`.

### Success measure

Future copy PBIs can use a consistent voice standard instead of ad hoc rewriting.

### Open questions

- Should Rhino use first-person plural language, neutral technical language, or a hybrid?

---

## `[B-022] Define product naming and technical terminology rules`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Content
**Type:** Content
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: content`, `area: product-data`, `needs-admin`

### Problem or opportunity

Rhino product names, machine families, accessories, consumables, grit values, dimensions, voltage, and compatibility terms must be consistent across navigation, product cards, filters, pages, manuals, and support flows.

### Evidence

- The Gem Shop collection uses names such as EM-1 Machine, Beadmaster, Lapmaster 12, Lapmaster 18, Sawmaster 18, Sawmaster 24, Shapemaster, Trimmaster, saw blades, radius wheels, core drill bits, and flat lap discs.
- Current product data on The Gem Shop includes some blank or null SKU values in visible page data.
- Product data architecture docs already identify required data fields and compatibility requirements.

### Proposed outcome

Create a terminology guide and naming rules for product titles, variant titles, collection names, filters, specs, badges, and support documents.

### Scope

- Define naming patterns for machines, machine sizes, replacement parts, accessories, consumables, grit, diameter, arbor size, voltage, kit/bundle contents, and compatible machines.
- Define capitalization, units, symbols, abbreviations, pluralization, and sorting conventions.
- Identify customer-facing terminology versus internal/admin terminology.
- Flag product data cleanup PBIs.

### Out of scope

- Editing product records.
- Implementing filters.
- Renaming products without business approval.

### Acceptance criteria

- [ ] Terminology guide defines product and variant naming patterns.
- [ ] Unit and abbreviation rules are documented.
- [ ] Customer-facing and admin-only terminology are separated.
- [ ] Product data cleanup requirements are listed as follow-up PBIs.

### Implementation considerations

- Product/admin changes require admin-change records and product export validation.
- Search/filter changes coordinate with Search and Discovery process docs.
- Copy changes follow hardcoded string/locale strategy.

### Dependencies

- B-002, B-012, and product data architecture.
- Shopify product export/admin access.

### Risks and cautions

- Renaming products can affect URLs, SEO, redirects, customer recognition, and support references.
- Technical abbreviations must remain understandable to new buyers.

### Testing notes

- Test product cards, collection sort/filter labels, search suggestions, product pages, cart lines, and order/notification surfaces after later implementation.

### Success measure

Product and variant names are consistent enough to support search, compatibility, and reordering.

### Open questions

- Should model numbers or machine family names lead product titles?
- What unit style should be used for inches, millimeters, rpm, voltage, and grit?

---

## `[B-023] Define warranty, freight, support, and reassurance microcopy rules`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Content
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Launch Readiness
**Suggested GitHub labels:** `epic: brand-foundation`, `area: content`, `area: support`, `area: legal`, `needs-admin`

### Problem or opportunity

Customers buying expensive machinery need reassurance about freight, support, warranties, replacement parts, damage claims, and returns. These messages need a consistent brand treatment and legal accuracy.

### Evidence

- Current Rhino policies include shipping, international shipment, damage, returns, non-returnable items, one-year warranty, 90-day limited warranty for some separately purchased tools/motors, and freight-cost responsibility language.
- The Gem Shop EM-1 page mentions pickup options and estimated shipping cost range.
- The repo does not contain Shopify policy content or support messaging architecture.

### Proposed outcome

Create rules and source-of-truth mapping for trust/support microcopy across product pages, cart, checkout-adjacent pages, support pages, policies, and notifications.

### Scope

- Define approved short labels and longer explanations for freight, pickup, warranty, returns, support contact, repairs, replacement parts, and international availability.
- Map each message to source: policy, page, product metafield, metaobject, theme section, cart text, or notification.
- Identify legal review and admin evidence requirements.

### Out of scope

- Changing shipping policies or legal terms.
- Editing product/cart templates.
- Editing Shopify notifications.

### Acceptance criteria

- [ ] Microcopy rules identify each trust/support message, source, and owner.
- [ ] Legal/business review requirements are explicit.
- [ ] Product-page, cart, policy, and notification dependencies are separated.
- [ ] Follow-up PBIs are created for implementation surfaces.

### Implementation considerations

- Admin changes require `docs/project/admin-change-record-template.md`.
- Policy/notification changes must be included in release notes.
- Code changes require accessibility and purchase-path testing.
- Coordinate with Epic J/K/L support and freight work.

### Dependencies

- B-003 identity architecture.
- Current policy/legal review.
- Shopify admin policies, notifications, products, and shipping configuration access.

### Risks and cautions

- Incorrect freight or warranty messaging can create legal, support, and refund risk.
- Checkout limitations may prevent displaying some messages exactly where desired.

### Testing notes

- Test product page, cart, checkout entry, policy pages, email notifications, mobile, and screen-reader semantics when implemented.

### Success measure

Customers see consistent reassurance at decision points without conflicting with legal policy language.

### Open questions

- Which warranty summary is approved for short product-page use?
- Can freight estimates be generalized safely?

---

## `[B-024] Define brand content migration rules from legacy Rhino and The Gem Shop sources`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Discovery
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `type: discovery`, `area: content`, `area: seo`, `needs-admin`

### Problem or opportunity

Existing Rhino and The Gem Shop content contains valuable proof points, but migration without rules can create duplicate SEO content, outdated claims, unsupported copy, inconsistent formatting, and brand confusion.

### Evidence

- Legacy Rhino pages contain EM-1 positioning, About, policies, videos, images, and contact details.
- The Gem Shop pages contain Rhino product data, images, collection descriptions, and supplier language.
- `docs/seo/redirect-and-url-migration-architecture.md` and `docs/seo/structured-data-and-seo-architecture.md` already flag migration/SEO concerns.

### Proposed outcome

Create content migration rules for what to reuse, rewrite, retire, verify, redirect, or leave on The Gem Shop.

### Scope

- Classify legacy content by page/source.
- Define migration decisions for product copy, About copy, policy copy, support copy, videos, images, and metadata.
- Flag outdated or legally sensitive content.
- Coordinate canonical and redirect decisions.

### Out of scope

- Migrating content.
- Changing canonical tags or redirects.
- Rewriting all pages.

### Acceptance criteria

- [ ] Migration rules distinguish source evidence from approved destination copy.
- [ ] Duplicate-content and canonical risks are identified.
- [ ] Legal/technical verification needs are listed.
- [ ] Admin and code implementation paths are separated.

### Implementation considerations

- Admin page/product/policy edits need admin evidence.
- SEO code changes need repository validation and SEO testing.
- Media changes follow media source-of-truth rules.
- Release notes must list migrated content and support impacts.

### Dependencies

- B-001, B-002, B-003, B-021, and B-022.
- SEO redirect/canonical decisions.

### Risks and cautions

- Blindly copying legacy HTML can bring inline styling, inaccessible markup, old tracking, and inconsistent tone.
- Duplicate product content between Rhino and The Gem Shop can confuse search engines.

### Testing notes

- Test links, redirects, metadata, mobile readability, and placeholder checks after later migration.

### Success measure

Content migration happens through approved, traceable decisions instead of copy/paste from legacy pages.

### Open questions

- Which content remains on The Gem Shop after Rhino Shopify launch?

---

## `[B-025] Expand the Rhino design token inventory for brand launch`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Repository
**Type:** Improvement
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: repository`, `area: css`

### Problem or opportunity

The current design token inventory is too small to support a brand launch. Without expanded tokens, implementation will drift into hardcoded values and inconsistent CSS.

### Evidence

- `data/design-token-inventory.json` contains only `--rhino-color-brand-primary` and `--rhino-section-spacing-y`.
- `assets/rhino-custom.css` defines the same two tokens.
- `docs/architecture/design-token-governance.md` requires Rhino visual decisions to be represented in token inventory.

### Proposed outcome

Expand the design token inventory to cover approved launch color, typography, spacing, border, radius, shadow, badge, icon, motion, and state tokens.

### Scope

- Define required token fields and statuses.
- Add tokens for approved brand foundations after B-005 through B-020 decisions.
- Identify which tokens map to Shopify theme settings and which live only in CSS.
- Add validation updates if schema coverage is insufficient.

### Out of scope

- Final visual implementation before design decisions are approved.
- Hardcoding page-specific CSS values.
- Changing Shopify admin settings without evidence.

### Acceptance criteria

- [ ] Token inventory covers launch-critical brand roles.
- [ ] Each token has name, type, value or planned value, owner, status, and notes.
- [ ] Tokens align with `--rhino-*` naming rules.
- [ ] `npm run validate:design-tokens` passes.

### Implementation considerations

- This is a repository/code-adjacent PBI.
- If schema changes are needed, update related validation scripts and tests.
- Run repository validation, design-token validation, CSS architecture validation, and Theme Check if Liquid/settings are touched.
- Use implementation record template when closing.

### Dependencies

- B-005, B-006, B-007, B-008, B-009, B-010, B-011, and B-020.

### Risks and cautions

- Expanding tokens before decisions are approved can create churn.
- Token names should describe semantic roles, not current color names.

### Testing notes

- Run `npm run validate:design-tokens`.
- Run `python scripts/validate-theme-repository.py`.
- If CSS is changed, run `npm run validate:css-architecture`.

### Success measure

Brand implementation can proceed through documented tokens instead of one-off values.

### Open questions

- Should token inventory include proposed tokens before stakeholder approval, or only approved launch tokens?

---

## `[B-026] Plan Rhino theme settings changes for launch branding`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Configuration
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Launch Readiness
**Suggested GitHub labels:** `epic: brand-foundation`, `area: theme-settings`, `area: design-system`, `needs-admin`

### Problem or opportunity

Many brand choices are stored in `config/settings_data.json` or theme-editor settings. Launch branding can accidentally overwrite live settings if not planned through the settings-data policy.

### Evidence

- `config/settings_data.json` controls logo width, typography, colors, radii, badge settings, social links, brand fields, animations, and cart color scheme.
- `docs/development/settings-data-policy.md` and README define settings safety rules.
- `settings_data.json` is version-controlled as a reviewed snapshot.

### Proposed outcome

Create an implementation plan for safe Rhino brand changes in theme settings and `settings_data.json`.

### Scope

- Identify required theme-editor/settings changes for logo, favicon if applicable, colors, typography, cards, buttons, badges, social links, brand info, animations, and section defaults.
- Define preview-first workflow.
- Define diff review, rollback, admin evidence, and release note requirements.

### Out of scope

- Making settings changes.
- Pulling or pushing theme settings.
- Changing production theme-editor state.

### Acceptance criteria

- [ ] Theme settings change plan lists each setting, owner, rationale, and rollback.
- [ ] Plan follows settings-data policy.
- [ ] Admin-change evidence requirements are listed.
- [ ] Release checklist impacts are identified.

### Implementation considerations

- Later implementation requires preview theme changes, settings pull, Git diff review, admin-change record, and release notes.
- Run `npm run validate:settings-data` after changes if available.
- Run production readiness checks before publish.

### Dependencies

- B-005 through B-020 decisions.
- Access to preview theme and Shopify admin.

### Risks and cautions

- `settings_data.json` changes can overwrite merchant edits.
- Theme-editor-only changes can drift from repository source if not pulled and reviewed.

### Testing notes

- Test theme editor load, settings persistence, mobile/desktop visual impact, and rollback procedure when implemented.

### Success measure

Brand settings can be applied through a predictable, reversible workflow.

### Open questions

- Which settings are repository-owned versus merchant-owned after launch?

---

## `[B-027] Plan Rhino CSS implementation layer for brand styles`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Repository
**Type:** Improvement
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: css`, `area: design-system`, `area: repository`

### Problem or opportunity

`assets/rhino-custom.css` exists, but brand implementation needs a scoped structure that avoids editing upstream Trade CSS unnecessarily.

### Evidence

- `docs/architecture/css-architecture.md` establishes `assets/rhino-custom.css` as the Rhino CSS entrypoint.
- `layout/theme.liquid` loads `rhino-custom.css` after `base.css`.
- `assets/rhino-custom.css` currently contains only a brief comment and two tokens.

### Proposed outcome

Create a CSS implementation plan for the Epic B design system that keeps Rhino styles scoped, testable, and upgrade-friendly.

### Scope

- Define CSS sections within `rhino-custom.css` or future `assets/rhino-*.css`.
- Define selector naming, token use, component boundaries, responsive rules, and fallback strategy.
- Identify Trade CSS files that should not be edited unless necessary.
- Identify validators or checks needed to prevent hardcoded values.

### Out of scope

- Implementing final CSS.
- Changing inherited Trade component CSS.
- Creating new sections.

### Acceptance criteria

- [ ] CSS implementation plan maps brand rules to CSS files and selectors.
- [ ] Plan follows `rhino-` classes and `--rhino-*` tokens.
- [ ] Upstream Trade conflict risks are documented.
- [ ] Validation commands and manual QA requirements are listed.

### Implementation considerations

- Later code changes require `npm run validate:css-architecture`, `npm run validate:design-tokens`, repository validation, Theme Check, and visual/manual QA.
- Update theme customization inventory after CSS changes.
- Use implementation record template when closing.

### Dependencies

- B-025 design token inventory.
- B-004 visual direction.

### Risks and cautions

- Broad selectors can unintentionally affect Trade components, app blocks, checkout-adjacent surfaces, or Shopify preview UI.
- Hardcoded colors and spacing will undermine token governance.

### Testing notes

- Test representative templates, mobile viewports, 200% zoom, and key purchase paths after implementation.

### Success measure

Brand styles can be implemented through a controlled Rhino layer rather than scattered overrides.

### Open questions

- Should brand-specific component CSS be split into files only when sections are introduced?

---

## `[B-028] Define brand rules for reusable Rhino sections and blocks`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Repository
**Type:** Improvement
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: theme-architecture`, `area: design-system`, `area: repository`

### Problem or opportunity

Rhino-specific sections will likely be needed for machine specs, support promises, compatibility, diagrams, videos, and education. Brand foundation must define how those sections express visual and content rules before implementation begins.

### Evidence

- `docs/architecture/rhino-custom-section-block-strategy.md` defines naming and schema rules for `sections/rhino-*.liquid`, `snippets/rhino-*.liquid`, `assets/rhino-*.css`, and `assets/rhino-*.js`.
- Existing Trade sections are stock and do not express Rhino-specific brand modules.

### Proposed outcome

Define brand rules for future Rhino sections and blocks, including schema expectations, token use, content source rules, and QA requirements.

### Scope

- Define common section patterns for technical specs, trust/support, compatibility, media, diagrams, educational content, and comparison blocks.
- Define block naming, heading hierarchy, icon/badge usage, media handling, and empty-state handling.
- Define when to use Trade sections instead.

### Out of scope

- Building new sections.
- Creating final product-page architecture.
- Adding custom JavaScript widgets.

### Acceptance criteria

- [ ] Brand section/block rules extend the existing Rhino section strategy.
- [ ] Rules identify content source for each pattern.
- [ ] Schema and placeholder-copy requirements are explicit.
- [ ] Future implementation PBIs can reference the guide.

### Implementation considerations

- New sections must pass `npm run validate:rhino-sections`.
- New customer-facing strings follow locale/hardcoded-string rules.
- Media follows media source-of-truth rules.
- App blocks or Custom Liquid alternatives require app/theme-editor register review.

### Dependencies

- B-004 visual direction.
- B-005 through B-011 design system decisions.
- Epic E/F product-page architecture.

### Risks and cautions

- Overbuilding custom sections duplicates Trade and increases upgrade burden.
- Hardcoded product-specific content in sections will make admin maintenance harder.

### Testing notes

- Future sections require Theme Check, repository validation, section schema validation, responsive QA, accessibility QA, and manual evidence.

### Success measure

Future Rhino sections can be designed and implemented consistently without reopening foundational decisions.

### Open questions

- Which Rhino-specific sections are launch-critical versus post-launch?

---

## `[B-029] Define accessibility review for the brand system`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Discovery
**Priority:** P0
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: accessibility`, `area: design-system`, `area: qa`

### Problem or opportunity

Brand changes often introduce contrast, focus, motion, text scaling, icon-label, and layout problems. Rhino needs accessibility requirements applied before visual implementation, not after.

### Evidence

- `docs/qa/storefront-quality-baseline.md` targets WCAG 2.2 AA and defines component-specific checks.
- Epic B includes colors, typography, icons, badges, motion, forms, and media.
- High-value machine purchases require trust and usability for customers with varied devices and abilities.

### Proposed outcome

Create an Epic B accessibility review checklist mapped to brand-system decisions and later implementation surfaces.

### Scope

- Define checks for color contrast, focus indicators, text scale, wrapping, icon labels, badge meaning, motion, video captions, diagram descriptions, form states, and media alt text.
- Map checks to relevant PBIs and release QA evidence.
- Define acceptable automated and manual evidence.

### Out of scope

- Running full audits against unimplemented designs.
- Fixing existing Trade accessibility issues not introduced by brand work.

### Acceptance criteria

- [ ] Epic B accessibility checklist exists and references the storefront quality baseline.
- [ ] Checklist maps to brand PBIs.
- [ ] Manual QA evidence requirements are defined.
- [ ] No brand implementation PBI can be marked done without applicable accessibility evidence.

### Implementation considerations

- Use `docs/qa/manual-qa-evidence-template.md` for manual evidence.
- Automated checks should use the repository's canonical accessibility script; note the current docs/package script naming discrepancy before enforcing.
- Use release checklist and release signoff for production changes.

### Dependencies

- B-005 through B-020.
- Epic A QA baseline.

### Risks and cautions

- Deferring accessibility until visual polish creates expensive rework.
- Badge/icon systems are especially prone to color-only meaning.

### Testing notes

- Test representative pages, mobile/desktop, keyboard, reduced motion, 200% zoom, text spacing, and axe serious/critical violations when brand code is implemented.

### Success measure

Accessibility requirements become part of brand definition, not a cleanup pass.

### Open questions

- Which assistive technology/manual screen-reader checks are feasible before launch?

---

## `[B-030] Define performance budget for brand media and visual effects`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Discovery
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: performance`, `area: media`, `area: design-system`

### Problem or opportunity

Brand differentiation can add heavy imagery, textures, video embeds, fonts, scripts, and animations. Rhino needs brand-specific performance constraints before visual implementation grows.

### Evidence

- `docs/qa/storefront-quality-baseline.md` defines performance expectations and release performance checks.
- `docs/media/media-asset-source-of-truth.md` discourages committing large product images to the theme.
- Epic B includes photography, video thumbnails, textures, motion, and social images.

### Proposed outcome

Define performance limits and review rules for brand assets, fonts, animations, media, and app/script-driven visual features.

### Scope

- Define page-weight budgets for brand assets on homepage, collection, product, support, and editorial pages.
- Define limits for new CSS/JS, font loading, texture usage, video embeds, and image sizes.
- Define measurement process and release evidence expectations.

### Out of scope

- Running final Lighthouse tests before implementation exists.
- Optimizing existing Trade assets.
- Selecting paid performance apps.

### Acceptance criteria

- [ ] Brand media/performance budget is documented.
- [ ] Limits are mapped to release checklist requirements.
- [ ] Third-party visual or video features require privacy/performance review.
- [ ] Future PBIs include performance testing notes.

### Implementation considerations

- Use `docs/qa/storefront-quality-baseline.md` and release checklist.
- Use app/privacy review for any third-party asset or script.
- Update media manifest for repository-owned assets.
- Record Lighthouse/performance evidence in implementation records or QA evidence.

### Dependencies

- B-014 textures, B-018 photography, B-019 video, B-020 motion.

### Risks and cautions

- High-quality product visuals can become slow if not cropped/resized correctly.
- External font or video choices can add privacy and performance debt.

### Testing notes

- Run three mobile Lighthouse checks for critical pages after implementation, as required by release checklist.
- Compare before/after page weight.

### Success measure

Brand changes improve trust without materially degrading Core Web Vitals or mobile usability.

### Open questions

- What is the maximum acceptable additional CSS and image weight for launch branding?

---

## `[B-031] Create an Epic B brand QA evidence plan`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Operations
**Type:** Discovery
**Priority:** P1
**Impact:** Medium
**Effort:** S
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: qa`, `area: process`

### Problem or opportunity

Brand implementation will affect many surfaces and needs repeatable QA evidence beyond subjective review.

### Evidence

- `docs/qa/manual-qa-evidence-process.md` defines evidence location and required fields.
- `docs/release/release-checklist.md` requires responsive, accessibility, performance, content, and merchandising checks.
- Epic B will affect color, type, buttons, forms, icons, media, motion, and copy.

### Proposed outcome

Create an Epic B QA evidence plan defining screenshots, manual checks, automated checks, and signoff requirements for brand changes.

### Scope

- Define required preview pages and fixture products.
- Define screenshot viewports and manual QA scopes.
- Define evidence naming and storage.
- Define stakeholder review flow.

### Out of scope

- Running QA for unimplemented brand work.
- Creating visual regression tooling if not already available.

### Acceptance criteria

- [ ] QA evidence plan references manual QA process and release checklist.
- [ ] Required pages, viewports, and customer journeys are listed.
- [ ] Evidence requirements are mapped to code, admin, content, and media PBIs.
- [ ] Signoff expectations are documented.

### Implementation considerations

- Use `docs/qa/manual-qa-evidence-template.md`.
- Future visual changes should include screenshots or preview links in PRs.
- Release signoff should reference final QA evidence.

### Dependencies

- Epic A fixture data and storefront QA baseline.
- B-029 accessibility review.
- B-030 performance budget.

### Risks and cautions

- Without objective evidence, brand feedback can become subjective and repetitive.
- Manual QA must include mobile and desktop, not only desktop screenshots.

### Testing notes

- This PBI creates the test plan. Later implementation PBIs execute it.

### Success measure

Brand changes can be reviewed consistently by engineering, design, business, and support stakeholders.

### Open questions

- Who gives final brand QA signoff?

---

## `[B-032] Define brand governance and approval workflow`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Operations
**Type:** Discovery
**Priority:** P1
**Impact:** Medium
**Effort:** S
**Confidence:** High
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: process`, `area: design-system`

### Problem or opportunity

Brand changes can span code, Shopify admin, product media, copy, legal claims, and partner identity. Without a governance workflow, changes may ship without the right review.

### Evidence

- Existing docs define PR expectations, admin evidence, app/privacy review, release signoff, and implementation records.
- Epic B PBIs require design, content, business, legal, admin, media, accessibility, and engineering input.

### Proposed outcome

Define who approves brand decisions and what evidence is required by change type.

### Scope

- Define owners for brand strategy, design, copy, legal claims, product data, media, theme code, Shopify admin, accessibility, performance, and release approval.
- Map approval requirements to PBI types.
- Define when a brand decision needs an ADR, implementation record, admin-change record, QA evidence, media manifest update, or release note.

### Out of scope

- Assigning named individuals if not known.
- Replacing the GitHub project workflow.
- Implementing brand changes.

### Acceptance criteria

- [ ] Brand governance workflow exists.
- [ ] Required evidence is mapped by change type.
- [ ] Approval responsibilities are listed by role.
- [ ] Workflow links to existing process templates.

### Implementation considerations

- Coordinate with `docs/project/github-project-workflow.md`.
- Use role names when individual owners are unavailable.
- Update README or docs index later if this becomes a standing process.

### Dependencies

- Business stakeholder availability.
- Existing Epic A process docs.

### Risks and cautions

- Overly heavy governance can slow small improvements.
- Under-governed legal/support claims can create launch risk.

### Testing notes

- Test the workflow by applying it to one code PBI, one admin PBI, one media PBI, and one content/legal PBI before launch.

### Success measure

Brand PBIs move from backlog to done with the right evidence and approval, not informal chat-only decisions.

### Open questions

- Who has final say when design, support, and SEO priorities conflict?

---

## `[B-033] Define trademark, certification, and legal attribution rules`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Discovery
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Launch Readiness
**Suggested GitHub labels:** `epic: brand-foundation`, `area: legal`, `area: content`, `area: seo`, `needs-legal-review`

### Problem or opportunity

Brand and product claims may include Rhino marks, partner names, CE Mark references, patent-pending motor language, exclusive supplier statements, warranty terms, and manufacturer/distributor roles. These need rules before being repeated across the storefront.

### Evidence

- Current Rhino pages reference Silica-Gem, The Gem Shop, CE Mark, patent-pending motor, warranties, and partner roles.
- The Gem Shop collection uses exclusive American supplier language.
- SEO docs include entity/structured-data questions.

### Proposed outcome

Define legal and attribution rules for brand marks, partner names, certifications, claims, warranty references, and supplier/manufacturer statements.

### Scope

- Inventory claims and marks that require legal or business approval.
- Define approved wording, required attribution, prohibited wording, and expiration/review dates.
- Define where legal-sensitive claims may appear.
- Create follow-up PBIs for any claim that lacks evidence.

### Out of scope

- Providing legal advice.
- Registering trademarks.
- Editing storefront copy.

### Acceptance criteria

- [ ] Claim/attribution register exists or is defined for implementation.
- [ ] Each legal-sensitive claim has owner, source, approval status, and review date.
- [ ] Approved wording is available for common storefront uses.
- [ ] Unverified claims are blocked from implementation until reviewed.

### Implementation considerations

- Legal review should be documented before copy/admin/code changes.
- Admin page/product/policy edits require admin evidence.
- Structured data changes coordinate with SEO architecture.
- Release notes should include changed legal/support claims.

### Dependencies

- B-001, B-003, B-021, and B-023.
- Legal/business owner.

### Risks and cautions

- Incorrect claims can create legal, SEO, support, and warranty risk.
- "Patent-pending" and certification claims may change over time and need review dates.

### Testing notes

- Review final visible text across homepage, product pages, support, policies, social previews, and structured data when implemented.

### Success measure

Customer-facing brand claims are traceable, approved, and consistent.

### Open questions

- What is the current legal status of Rhino marks and patent/certification claims?

---

## `[B-034] Create launch-ready brand style guide artifact`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Design
**Type:** Improvement
**Priority:** P1
**Impact:** High
**Effort:** L
**Confidence:** Medium
**Suggested milestone:** Foundation
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: docs`

### Problem or opportunity

Epic B decisions need to be consolidated into a usable style guide for developers, admins, content writers, and stakeholders.

### Evidence

- Epic B spans positioning, color, type, spacing, buttons, links, forms, icons, badges, media, motion, voice, naming, and legal attribution.
- Existing docs are process-oriented; there is no consolidated Rhino brand style guide.

### Proposed outcome

Create a launch-ready style guide artifact that references approved Epic B decisions and process requirements.

### Scope

- Consolidate approved direction, tokens, typography, color, spacing, buttons, links, forms, badges, icons, media, motion, voice, terminology, and legal/identity rules.
- Include do/don't examples.
- Link implementation and evidence requirements by change type.
- Identify open issues and post-launch extensions.

### Out of scope

- Implementing CSS or admin settings.
- Creating a public-facing style guide page.
- Replacing source process docs.

### Acceptance criteria

- [ ] Style guide exists in `docs/`.
- [ ] Style guide distinguishes approved rules from proposals.
- [ ] Style guide links to token inventory, media manifest, process docs, and relevant ADRs.
- [ ] Style guide can be used to review future PRs and admin changes.

### Implementation considerations

- This is a documentation PBI.
- Use implementation record template when closing.
- If this guide changes launch-critical process, link it from README or docs index in a separate PBI.

### Dependencies

- Completion or guidance from B-001 through B-033.

### Risks and cautions

- A style guide that mixes proposals and approved decisions without status labels will create confusion.
- Keeping the guide too abstract will not help implementation review.

### Testing notes

- Review the guide against representative future PBIs: theme code, admin theme settings, product media, copy, and app/video embed changes.

### Success measure

Future brand implementation can be reviewed against one coherent guide.

### Open questions

- Should the guide live only in Markdown, or later become a private storefront/page preview?

---

## `[B-035] Plan first brand implementation slice for preview only`

**Epic:** Epic B - Rhino Brand Foundation
**Work area:** Mixed
**Type:** Improvement
**Priority:** P1
**Impact:** High
**Effort:** M
**Confidence:** Medium
**Suggested milestone:** Launch Readiness
**Suggested GitHub labels:** `epic: brand-foundation`, `area: design-system`, `area: release`, `area: qa`, `needs-admin`

### Problem or opportunity

After Epic B foundation decisions are approved, the first implementation slice should prove the brand system on a limited set of surfaces before applying it everywhere.

### Evidence

- README requires preview-first workflow and production publishing safeguards.
- Release checklist requires settings safety, preview deployment, QA, accessibility, performance, content, and admin dependency checks.
- Brand implementation will touch visible customer surfaces and possibly `settings_data.json`, CSS, media, and admin settings.

### Proposed outcome

Define a small preview-only implementation slice that validates the brand system on representative surfaces without destabilizing the whole storefront.

### Scope

- Identify the minimum implementation surfaces, likely header/logo, homepage intro area, product card, product page trust/spec area, buttons, badges, and footer identity.
- Define required code/admin/media changes and evidence.
- Define rollback and release-note requirements.
- Define go/no-go criteria before broader rollout.

### Out of scope

- Implementing the slice.
- Publishing to production.
- Redesigning all templates.

### Acceptance criteria

- [ ] First implementation slice is documented with included and excluded surfaces.
- [ ] Required code, admin, content, media, QA, accessibility, performance, and release evidence is listed.
- [ ] Preview-only validation plan is defined.
- [ ] Follow-up rollout PBIs are identified.

### Implementation considerations

- Code changes require branch workflow, repository validation, Theme Check, relevant npm validators, inventory update, and implementation record.
- Admin/settings changes require settings-data policy and admin evidence.
- Media changes require media manifest/source-of-truth compliance.
- Manual QA evidence and release signoff are required before production publish.

### Dependencies

- B-005 through B-034 sufficiently approved.
- Persistent preview theme access.
- Fixture products/pages.

### Risks and cautions

- Implementing too much in the first slice makes feedback and rollback harder.
- Implementing too little may not prove the brand system across real product and support journeys.

### Testing notes

- Test required viewport matrix, accessibility, performance, placeholder check, product purchase paths, search/collection visibility, and mobile crops.

### Success measure

Stakeholders can evaluate the brand system on real Shopify preview surfaces before broad rollout.

### Open questions

- Which surface should be the first proof point: homepage, product page, or product card?

