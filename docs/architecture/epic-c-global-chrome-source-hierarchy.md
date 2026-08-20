# Epic C Global Chrome Source Hierarchy

**Epic:** C - Global Header, Navigation, and Footer  
**PBIs:** C-PBI-001 through C-PBI-006  
**Status:** Batch 1 source hierarchy  
**Created:** 2026-08-06  
**Governing backlog:** [rhino-lapidary-pbi-tracker-epic-c.md](../rhino-lapidary-pbi-tracker-epic-c.md)

This document defines which source controls each global chrome decision before
visible header, drawer, mega-menu, breadcrumb, or footer work begins.

## Override Rules

Accessibility, route correctness, legal safety, and performance requirements
override visual preference. A global chrome change is not accepted when it:

- Introduces serious or critical accessibility failures.
- Sends customers to `/password`, a 404 page, or an unrelated storefront route.
- Adds an unsupported legal, technical, freight, warranty, support, dealer,
  financing, social, or international claim.
- Adds scripts, media, or app embeds that violate the approved performance
  budget.
- Changes Shopify Admin navigation without route-contract and rollback
  evidence.

## Source Authority

| Decision area | Authoritative source | Owner | Notes |
|---|---|---|---|
| Repository behavior | Theme files, tests, [ADR-0003](adr-0003-navigation-architecture.md), [css-architecture.md](css-architecture.md) | Frontend Engineering | Liquid, CSS, JavaScript, schema, and Playwright tests control rendered behavior. |
| Shopify Admin navigation | Shopify Admin `main-menu` and `footer`, mirrored by [data/global-navigation-ia.json](../../data/global-navigation-ia.json) | Product Owner and Shopify Admin | Admin menus are not source-controlled; every change needs evidence and route-contract updates. |
| Menu labels | [data/global-navigation-ia.json](../../data/global-navigation-ia.json), [rhino-product-naming-and-terminology.md](../brand/rhino-product-naming-and-terminology.md), [rhino-brand-voice-and-copy.md](../brand/rhino-brand-voice-and-copy.md) | Product Owner, Brand Owner, Shopify Admin | Current labels and future labels are separated. Generic current labels do not imply final approval. |
| Route paths | [data/navigation-spec.json](../../data/navigation-spec.json), [tests/navigation.spec.js](../../tests/navigation.spec.js), [tests/global-chrome-links.spec.js](../../tests/global-chrome-links.spec.js) | Frontend Engineering and Shopify Admin | Verified preview routes only. Missing destinations remain blockers or dependencies. |
| Footer claims | [data/legal-claims-register.json](../../data/legal-claims-register.json), [rhino-reassurance-microcopy.md](../brand/rhino-reassurance-microcopy.md), [rhino-content-migration-rules.md](../brand/rhino-content-migration-rules.md) | Legal, Product Owner, Content, Support | Footer copy repeats sitewide, so claim rules are stricter than one-off page copy. |
| Policy links | Shopify policy objects, [data/navigation-spec.json](../../data/navigation-spec.json), rendered footer audit | Legal and Shopify Admin | Dynamic policy links must resolve. Missing policies are admin/legal blockers, not optional test failures. |
| Support information | [rhino-reassurance-microcopy.md](../brand/rhino-reassurance-microcopy.md), [data/legal-claims-register.json](../../data/legal-claims-register.json), future support content sources | Unresolved support, content, legal, and business owners | Support route, hours, channels, repair, and warranty administration ownership remain unresolved. |
| Internationalization | Shopify Markets/languages, [data/global-navigation-ia.json](../../data/global-navigation-ia.json), [legal-claims-register.json](../../data/legal-claims-register.json) | Unresolved business, operations, and Shopify Admin owners | Selector visibility cannot imply global availability, voltage support, freight, or warranty scope. |
| QA evidence | [docs/qa/manual-qa-evidence-process.md](../qa/manual-qa-evidence-process.md), [tests/global-chrome-links.spec.js](../../tests/global-chrome-links.spec.js), `test-results/epic-c/` | QA and Release Approver | Durable summaries live in docs; transient JSON output remains in `test-results/epic-c/`. |
| Release evidence | [release-checklist.md](../release/release-checklist.md), [release-notes-template.md](../release/release-notes-template.md), [backup-and-rollback-procedures.md](../release/backup-and-rollback-procedures.md) | Release Owner | Navigation changes must be called out separately from theme code changes. |

## Controlled Artifacts

| Artifact | Purpose | Validation |
|---|---|---|
| [data/global-navigation-ia.json](../../data/global-navigation-ia.json) | Machine-readable IA, current menu state, unresolved destinations, ownership, and blockers | `npm run validate:global-navigation-ia` |
| [schemas/global-navigation-ia.schema.json](../../schemas/global-navigation-ia.schema.json) | Structural contract for the IA register | `npm run validate:registers` |
| [data/navigation-spec.json](../../data/navigation-spec.json) | Verified route contract for launch navigation | `npm run validate:navigation`, `npm run test:navigation` |
| [tests/global-chrome-links.spec.js](../../tests/global-chrome-links.spec.js) | Rendered header, drawer, footer, utility, and policy link validation | `npm run test:global-chrome-links` |
| [epic-c-breadcrumb-architecture.md](epic-c-breadcrumb-architecture.md) | Breadcrumb page-type rules, ancestry, canonical cleanup, accessibility, and JSON-LD ownership | `npm run test:breadcrumbs` |
| [epic-c-footer-support-ia.md](epic-c-footer-support-ia.md) | Footer IA groups, support/manual dependencies, policy discoverability, localization safety, and footer menu isolation | `npm run validate:footer-support`, `npm run validate:localization-market-safety`, `npm run test:footer-policy-sitemap` |
| [data/footer-support-resources.json](../../data/footer-support-resources.json) | Manuals, downloads, support, warranty, repairs, shipping/freight, and parts-help publication readiness | `npm run validate:footer-support` |
| [data/localization-market-decision.json](../../data/localization-market-decision.json) | Admin-observed localization state and market-safe selector decision | `npm run validate:localization-market-safety` |
| [shopify-navigation-change-workflow.md](../development/shopify-navigation-change-workflow.md) | Admin menu evidence, rollback, and production boundary process | Future C-PBI-025 finalization validator |
| [epic-c-global-chrome-current-state-audit.md](epic-c-global-chrome-current-state-audit.md) | Durable Batch 1 audit summary | Manual review plus link to transient JSON evidence |

## Control of Specific Decisions

### Menu Labels

The IA register controls whether a label is `verified_current`,
`approved_for_launch`, blocked, or unresolved. Shopify Admin may render current
labels before the final IA is approved; those labels are recorded as current
state, not as final approval. Product-family labels must follow
[rhino-product-naming-and-terminology.md](../brand/rhino-product-naming-and-terminology.md).

### Route Paths

`data/navigation-spec.json` controls verified launch routes. A route can be
added only after authenticated preview verification confirms:

- The page is not `/password`.
- The route does not return 404.
- The final route matches the intended storefront page.
- The destination is approved for the current navigation contract.

Missing route categories must be recorded in
`data/global-navigation-ia.json` as dependencies or blockers.

### Footer Claims

Footer claims are governed by `data/legal-claims-register.json` and approved
brand/content rules. Do not add warranty duration, freight estimate, financing,
dealer, supplier, manufacturer, support-responsibility, certification, patent,
exclusivity, availability, or international claims without explicit approved
evidence.

### Policy Links

Shopify policy objects are the source for dynamic policy links. Repository
fixtures and route contracts may point only to currently available policy pages.
As of Batch 1, `/policies/privacy-policy` is verified; other policy routes are
recorded as unresolved dependencies.

### Completion Evidence

Completion evidence for C-PBI-001 through C-PBI-006 is controlled by:

- Implementation records under `docs/project/implementation-records/`.
- `test-results/epic-c/global-chrome-links-*.json`.
- The durable current-state audit document.
- Validation command output.
- Admin workflow documentation.

## Amendment and Supersession Rules

1. Update the machine-readable register before or alongside any admin menu
   change.
2. Update `data/navigation-spec.json` only for verified routes.
3. Record blocked or missing destinations as dependencies, not as placeholder
   routes.
4. Update this hierarchy when a new authoritative source replaces a Batch 1
   source.
5. Record each material source change in the relevant implementation record and
   release notes.
6. C-PBI-025 must treat this file, the IA register, the admin workflow, the
   current-state audit, route tests, and global chrome link tests as required
   finalization inputs.

## Open Ownership Questions

- Who is the accountable support owner for global support labels, route content,
  contact channels, and response expectations?
- Who approves dealer or wholesale navigation labels and destinations?
- Who approves financing navigation labels and whether financing should be
  visible globally?
- Who approves international labels, market selector visibility, and regional
  availability language?
- Who approves official social account URLs for global header, drawer, or footer
  use?
- Which legal/admin owner will provide refund, terms, shipping, contact
  information, and accessibility policy pages if they are required for launch?

## Future C-PBI-025 Inputs

C-PBI-025 must validate that these Batch 1 artifacts exist and are linked:

- `docs/architecture/epic-c-global-chrome-source-hierarchy.md`
- `docs/architecture/epic-c-global-chrome-current-state-audit.md`
- `docs/development/shopify-navigation-change-workflow.md`
- `data/global-navigation-ia.json`
- `schemas/global-navigation-ia.schema.json`
- `scripts/validate-global-navigation-ia.js`
- `tests/global-chrome-links.spec.js`
- `docs/architecture/epic-c-breadcrumb-architecture.md`
- `tests/breadcrumbs.spec.js`
- `docs/architecture/epic-c-footer-support-ia.md`
- `data/footer-support-resources.json`
- `data/localization-market-decision.json`
- `scripts/validate-footer-support-resources.js`
- `scripts/validate-localization-market-safety.js`
