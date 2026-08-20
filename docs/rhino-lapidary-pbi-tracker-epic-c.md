# Rhino Lapidary Epic C PBI Handoff Package

**Epic:** Epic C - Global Header, Navigation, and Footer  
**Source backlog:** [Rhino Lapidary Storefront Backlog and Epics.md](Rhino%20Lapidary%20Storefront%20Backlog%20and%20Epics.md)  
**Created:** 2026-08-06  
**Status:** Ready for Product Owner review  
**ID note:** `C-001` through `C-039` are already machine-specification conflict IDs in [rhino-machine-specification-resolution-register.md](product/rhino-machine-specification-resolution-register.md). Epic C PBIs use `C-PBI-*` IDs to avoid collision.

## Coding Model Instruction Flow

Use this section as the first instruction set for any coding model, web agent, or IDE agent that receives one of these PBIs.

1. Read the assigned PBI and its listed repository sources before editing.
2. Confirm whether the PBI is **admin-only**, **drop-in**, **context-aware repository work**, or **measurement/documentation**.
3. If the PBI is admin-only, do not edit repository code unless the PBI explicitly asks for a repository snapshot, fixture, or validation update.
4. If the PBI includes a drop-in artifact, create that file or method exactly, then run the validation commands listed in the PBI.
5. If code changes depend on existing Liquid, JSON templates, menu structure, section settings, or storefront behavior, do not paste partial code blindly. Use the included **IDE web-agent prompt** and hand the work back to a context-aware repository agent.
6. If the PBI defines a general rule that can be enforced by measurement, add or update a validator/test so the rule is quantifiable. Do not leave enforceable governance as prose only.
7. Keep all work preview-first unless a release PBI explicitly permits production.
8. Do not invent collection handles, product handles, support URLs, policy text, warranty claims, freight promises, social account links, or international availability.
9. Do not weaken existing assertions in smoke, accessibility, social metadata, route identity, product-data, brand-claims, performance, or Theme Check validation.
10. Do not create new paid-app dependencies until native Shopify, Trade theme behavior, and small theme customizations have been evaluated.
11. For any Shopify Admin change, capture before state, after state, theme ID or admin location, rollback steps, and the validation output.
12. For every customer-facing copy change, run claims and placeholder validation and cite the approved source.

## Required Source Context

At minimum, read these files before starting any Epic C implementation PBI:

- [docs/architecture/adr-0003-navigation-architecture.md](architecture/adr-0003-navigation-architecture.md)
- [data/navigation-spec.json](../data/navigation-spec.json)
- [schemas/navigation-spec.schema.json](../schemas/navigation-spec.schema.json)
- [scripts/validate-navigation-spec.js](../scripts/validate-navigation-spec.js)
- [tests/navigation.spec.js](../tests/navigation.spec.js)
- [sections/header.liquid](../sections/header.liquid)
- [sections/header-group.json](../sections/header-group.json)
- [snippets/header-drawer.liquid](../snippets/header-drawer.liquid)
- [snippets/header-dropdown-menu.liquid](../snippets/header-dropdown-menu.liquid)
- [snippets/header-mega-menu.liquid](../snippets/header-mega-menu.liquid)
- [snippets/header-search.liquid](../snippets/header-search.liquid)
- [sections/footer.liquid](../sections/footer.liquid)
- [sections/footer-group.json](../sections/footer-group.json)
- [assets/rhino-custom.css](../assets/rhino-custom.css)
- [docs/brand/rhino-brand-style-guide.md](brand/rhino-brand-style-guide.md)
- [docs/brand/rhino-theme-settings-launch-plan.md](brand/rhino-theme-settings-launch-plan.md)
- [docs/brand/rhino-action-hierarchy.md](brand/rhino-action-hierarchy.md)
- [docs/brand/rhino-icon-system.md](brand/rhino-icon-system.md)
- [docs/brand/rhino-reassurance-microcopy.md](brand/rhino-reassurance-microcopy.md)
- [docs/brand/rhino-product-naming-and-terminology.md](brand/rhino-product-naming-and-terminology.md)
- [docs/brand/rhino-content-migration-rules.md](brand/rhino-content-migration-rules.md)
- [data/brand-content-migration-register.json](../data/brand-content-migration-register.json)
- [data/legal-claims-register.json](../data/legal-claims-register.json)
- [data/rhino-preview-brand-slice.json](../data/rhino-preview-brand-slice.json)
- [docs/qa/epic-b-brand-qa-plan.md](qa/epic-b-brand-qa-plan.md)
- [docs/release/release-checklist.md](release/release-checklist.md)

## Epic C Outcome

Epic C should make Rhino's global storefront chrome useful from every page:

- First-time visitors can understand the machine ecosystem without already knowing product names.
- Returning owners can reach parts, consumables, manuals, support, and contact paths quickly.
- Search, cart, account, localization, and support links are discoverable without cluttering the header.
- Footer links are trustworthy, legally safe, and operationally owned.
- Navigation changes are measurable through route checks, smoke tests, accessibility tests, mobile QA, and release evidence.

## Final Epic C Status - 2026-08-19

Technical status: all machine-verifiable Epic C PBIs are complete. Static, preview, aggregate, responsive, and finalization gates passed on 2026-08-19, with C-PBI-027 remaining as human signoff only. Production remains untouched.

Preview theme: `158631198917` (`Rhino Lapidary - Preview`, `UNPUBLISHED`)  
Production theme: `158579622085` (`MAIN`)  
Preview header menu: `preview-primary-navigation-menu`  
Production header menu: `main-menu`  
Preview footer menu: `preview-footer-menu`  
Production footer menu: `footer`

| PBI | Current status | Acceptance result | Evidence |
|---|---|---|---|
| C-PBI-001 | Complete | Source hierarchy remains valid | [epic-c-global-chrome-source-hierarchy.md](architecture/epic-c-global-chrome-source-hierarchy.md) |
| C-PBI-002 | Complete | Current Admin/rendered state reinspected | [epic-c-global-chrome-current-state-audit.md](architecture/epic-c-global-chrome-current-state-audit.md), `test-results/epic-c/batch-5/rendered-admin-reconciliation-probe.json` |
| C-PBI-003 | Complete | IA register validates with preview-only handles and current Admin routes | [global-navigation-ia.json](../data/global-navigation-ia.json), `npm run validate:global-navigation-ia` |
| C-PBI-004 | Complete | Route contract includes real current policy/manual routes only | [navigation-spec.json](../data/navigation-spec.json), `npm run test:navigation` |
| C-PBI-005 | Complete | Rendered global chrome links resolve and match IA | [global-chrome-links.spec.js](../tests/global-chrome-links.spec.js), `test-results/epic-c/global-chrome-links-*.json` |
| C-PBI-006 | Complete | Admin workflow and rollback rules remain in force | [shopify-navigation-change-workflow.md](development/shopify-navigation-change-workflow.md) |
| C-PBI-007 | Complete | Preview header baseline now records isolated preview menu settings | [c-pbi-007-preview-header-baseline-configuration.md](project/implementation-records/c-pbi-007-preview-header-baseline-configuration.md), [header-group.json](../sections/header-group.json) |
| C-PBI-008 | Complete | Desktop header/search passed at required widths | [c-pbi-008-desktop-header-hierarchy-and-search.md](project/implementation-records/c-pbi-008-desktop-header-hierarchy-and-search.md), `npm run test:header-desktop` |
| C-PBI-009 | Complete | Drawer opens/closes, traps focus, returns focus, and exercises real nested IA | [c-pbi-009-mobile-drawer-navigation-behavior.md](project/implementation-records/c-pbi-009-mobile-drawer-navigation-behavior.md), `npm run test:mobile-drawer` |
| C-PBI-010 | Complete | Governed mega-menu model retained; current preview hierarchy reconciled | [c-pbi-010-desktop-mega-menu-content-model.md](project/implementation-records/c-pbi-010-desktop-mega-menu-content-model.md), [global-navigation-ia.json](../data/global-navigation-ia.json) |
| C-PBI-011 | Complete | Preview header navigation isolation verified; production remains on `main-menu` | [c-pbi-011-preview-mega-menu-admin-safety-gate.md](project/implementation-records/c-pbi-011-preview-mega-menu-admin-safety-gate.md), `test-results/epic-c/batch-5/rendered-admin-reconciliation-probe.json` |
| C-PBI-012 | Complete | Breadcrumb architecture remains valid | [c-pbi-012-breadcrumb-architecture.md](project/implementation-records/c-pbi-012-breadcrumb-architecture.md), [epic-c-breadcrumb-architecture.md](architecture/epic-c-breadcrumb-architecture.md) |
| C-PBI-013 | Complete | Accessible breadcrumbs render on required route types | [c-pbi-013-accessible-breadcrumbs.md](project/implementation-records/c-pbi-013-accessible-breadcrumbs.md), [rhino-breadcrumbs.liquid](../snippets/rhino-breadcrumbs.liquid) |
| C-PBI-014 | Complete | Product, collection, search, contact page, cart, and policy BreadcrumbList coverage passed; blog/article no longer a launch dependency | [c-pbi-014-breadcrumb-structured-data-validation.md](project/implementation-records/c-pbi-014-breadcrumb-structured-data-validation.md), `npm run test:breadcrumbs` |
| C-PBI-015 | Complete | Footer IA governance remains valid | [c-pbi-015-footer-information-architecture.md](project/implementation-records/c-pbi-015-footer-information-architecture.md), [epic-c-footer-support-ia.md](architecture/epic-c-footer-support-ia.md) |
| C-PBI-016 | Complete | Preview footer menu isolation verified; production remains on `footer` | [c-pbi-016-preview-footer-configuration.md](project/implementation-records/c-pbi-016-preview-footer-configuration.md), [footer-group.json](../sections/footer-group.json) |
| C-PBI-017 | Complete | Footer/legal claim governance validates with current links | [c-pbi-017-footer-claim-governance.md](project/implementation-records/c-pbi-017-footer-claim-governance.md), `npm run validate:brand-claims` |
| C-PBI-018 | Complete | Rendered footer policies and `/sitemap.xml` verified with strict route identity; absent terms/contact-information policies remain explicit non-published dependencies, not required published routes | [c-pbi-018-policy-legal-sitemap-discoverability.md](project/implementation-records/c-pbi-018-policy-legal-sitemap-discoverability.md), `npm run test:footer-policy-sitemap`, `test-results/epic-c/batch-4/footer-policy-sitemap-*.json` |
| C-PBI-019 | Complete | Published and hidden manuals inventoried with launch gating | [c-pbi-019-support-manual-download-inventory.md](project/implementation-records/c-pbi-019-support-manual-download-inventory.md), [footer-support-resources.json](../data/footer-support-resources.json) |
| C-PBI-020 | Complete | US-only/no-selector launch decision recorded and verified in rendered chrome | [c-pbi-020-localization-market-safety.md](project/implementation-records/c-pbi-020-localization-market-safety.md), [localization-market-decision.json](../data/localization-market-decision.json) |
| C-PBI-021 | Complete | Search, account/login, cart empty/nonempty, and localization absence passed | [c-pbi-021-global-utility-affordance-labels.md](project/implementation-records/c-pbi-021-global-utility-affordance-labels.md), `npm run test:global-utilities` |
| C-PBI-022 | Complete | Global chrome accessibility passed with real nested IA and current policies/manuals | [c-pbi-022-global-chrome-accessibility.md](project/implementation-records/c-pbi-022-global-chrome-accessibility.md), `npm run test:global-chrome-accessibility` |
| C-PBI-023 | Complete | Static and runtime global chrome performance budgets passed; homepage zero-image warning is non-blocking for the current measured page | [c-pbi-023-global-chrome-performance-budget.md](project/implementation-records/c-pbi-023-global-chrome-performance-budget.md), `npm run validate:global-chrome-performance`, `npm run test:brand-performance:release` |
| C-PBI-024 | Complete | Responsive evidence passed 55/55 route viewports, 490/495 states passed, 5 not applicable, and `0` required width failures | [c-pbi-024-responsive-global-chrome-evidence.md](project/implementation-records/c-pbi-024-responsive-global-chrome-evidence.md), `test-results/epic-c/batch-5/responsive-global-chrome-qa-2026-08-19T21-16-00-504Z.json` |
| C-PBI-025 | Complete for technical gate | Static, preview, aggregate, and finalization validators passed; C-PBI-027 remains human-signoff-only | [c-pbi-025-epic-c-finalization-qa-runner.md](project/implementation-records/c-pbi-025-epic-c-finalization-qa-runner.md), [epic-c-global-chrome-qa-plan.json](../data/epic-c-global-chrome-qa-plan.json), `test-results/epic-c/batch-5/epic-c-qa-all-2026-08-19T21-16-00-552Z.json`, `test-results/epic-c/batch-5/epic-c-finalization.json` |
| C-PBI-026 | Complete | Release docs include Epic C commands, evidence, and rollback references | [c-pbi-026-release-documentation-integration.md](project/implementation-records/c-pbi-026-release-documentation-integration.md), [release-signoff-checklist.md](release/release-signoff-checklist.md) |
| C-PBI-027 | Ready for human signoff / GO candidate | Technical prerequisites prepared; stakeholder approvals not recorded and production not approved | [c-pbi-027-preview-signoff-and-production-go-no-go.md](project/implementation-records/c-pbi-027-preview-signoff-and-production-go-no-go.md), [release-signoff-checklist.md](release/release-signoff-checklist.md) |
| C-PBI-028 | Complete | Measurement plan defined; no tracking code added | [c-pbi-028-post-launch-navigation-measurement-plan.md](project/implementation-records/c-pbi-028-post-launch-navigation-measurement-plan.md), [epic-c-post-launch-navigation-measurement-plan.md](analytics/epic-c-post-launch-navigation-measurement-plan.md) |

Resolved stale blockers:

- Preview header menu isolation: resolved with `preview-primary-navigation-menu`; production remains on `main-menu`.
- Preview footer menu isolation: resolved with `preview-footer-menu`; production remains on `footer`.
- Nested menu availability: resolved with real `Catalog` child branch.
- C-PBI-014 blog/article blocker: corrected as broader than PBI scope; blogging is not a launch requirement.
- Policy expansion: Privacy, Refund, Shipping, and Legal notice are real published routes.
- Manuals: EM-1, TrimMaster, and ShapeMaster are published; hidden manuals remain inventoried and not globally discoverable.
- Localization: United States launch with country/language selectors absent.
- Accounts: enabled; login affordance is part of launch.
- Preview QA access: smoke, global links, footer policy/sitemap, performance, responsive, and aggregate QA reached real storefront routes; no generic Playwright or preview-access blocker remains.

Remaining dependency:

- C-PBI-027 requires human approvals and production go/no-go. The coding agent did not approve production publication.

Latest automated evidence:

- `npm run test:footer-policy-sitemap`: passed on 2026-08-19 for desktop Chromium, mobile Chromium, and desktop WebKit.
- `npm run qa:epic-c:preview`: passed; report `test-results/epic-c/batch-5/epic-c-qa-preview-2026-08-19T19-49-39-038Z.json`.
- `npm run qa:epic-c:static`: passed; report `test-results/epic-c/batch-5/epic-c-qa-static-2026-08-19T19-50-18-820Z.json`.
- `npm run validate:epic-c-finalization`: passed; report `test-results/epic-c/batch-5/epic-c-finalization.json`.
- `npm run qa:epic-c:all`: passed; report `test-results/epic-c/batch-5/epic-c-qa-all-2026-08-19T21-16-00-552Z.json`.

## Epic C Finalization Required Inputs

C-PBI-025 now requires Batch 1 through Batch 5 artifacts before Epic C finalization, including:

- [epic-c-global-chrome-source-hierarchy.md](architecture/epic-c-global-chrome-source-hierarchy.md)
- [epic-c-global-chrome-current-state-audit.md](architecture/epic-c-global-chrome-current-state-audit.md)
- [shopify-navigation-change-workflow.md](development/shopify-navigation-change-workflow.md)
- [global-navigation-ia.json](../data/global-navigation-ia.json)
- [global-navigation-ia.schema.json](../schemas/global-navigation-ia.schema.json)
- [validate-global-navigation-ia.js](../scripts/validate-global-navigation-ia.js)
- [global-chrome-links.spec.js](../tests/global-chrome-links.spec.js)
- [epic-c-breadcrumb-architecture.md](architecture/epic-c-breadcrumb-architecture.md)
- [breadcrumbs.spec.js](../tests/breadcrumbs.spec.js)
- [epic-c-footer-support-ia.md](architecture/epic-c-footer-support-ia.md)
- [footer-support-resources.json](../data/footer-support-resources.json)
- [localization-market-decision.json](../data/localization-market-decision.json)
- [global-chrome-accessibility.spec.js](../tests/global-chrome-accessibility.spec.js)
- [brand-performance-budget.json](../data/brand-performance-budget.json)
- [epic-c-responsive-global-chrome-evidence-plan.md](qa/epic-c-responsive-global-chrome-evidence-plan.md)
- [epic-c-global-chrome-qa-plan.json](../data/epic-c-global-chrome-qa-plan.json)
- [validate-epic-c-finalization.js](../scripts/validate-epic-c-finalization.js)
- [run-epic-c-global-chrome-qa.js](../scripts/run-epic-c-global-chrome-qa.js)
- [release-checklist.md](release/release-checklist.md)
- [release-signoff-checklist.md](release/release-signoff-checklist.md)
- [epic-c-post-launch-navigation-measurement-plan.md](analytics/epic-c-post-launch-navigation-measurement-plan.md)

## Current Evidence Snapshot

- The current navigation route contract contains 12 verified preview routes: home, machines, catalog, search query, search page, cart, contact, EM-1 manual, privacy policy, refund policy, shipping policy, and legal notice in [data/navigation-spec.json](../data/navigation-spec.json).
- Header rendering is still primarily Trade-owned in [sections/header.liquid](../sections/header.liquid), with drawer, dropdown, mega-menu, and search snippets.
- Header group settings currently use the preview-owned `preview-primary-navigation-menu`; production remains on `main-menu`.
- Footer rendering is still primarily Trade-owned in [sections/footer.liquid](../sections/footer.liquid), with the preview-owned `preview-footer-menu`; production remains on `footer`.
- Breadcrumbs are implemented as a repository-owned system for supported page types; blog/article breadcrumb coverage is not an Epic C launch dependency.
- Epic B explicitly excluded navigation redesign and footer identity claims from the first preview implementation slice.
- Current footer policy validation proves rendered links for `/policies/privacy-policy`, `/policies/shipping-policy`, `/policies/refund-policy`, and `/policies/legal-notice`; terms of service and contact-information policy routes are absent/deferred dependencies, not required published routes.
- `/sitemap.xml` is validated separately as Shopify XML sitemap content, not through the HTML storefront-page unlock path.

## Recommended Epic C Batches

| Batch | PBIs | Goal |
|---|---|---|
| Batch 1 - Contracts and evidence | C-PBI-001 through C-PBI-006 | Establish source hierarchy, current-state audit, route/menu contracts, and admin workflow before visible changes. |
| Batch 2 - Header navigation | C-PBI-007 through C-PBI-011 | Apply preview header decisions, search prominence, mobile drawer behavior, and Shopify menu IA. |
| Batch 3 - Breadcrumbs and utility paths | C-PBI-012 through C-PBI-014, C-PBI-021 | Add breadcrumb rules, implementation, structured data, account/cart/search utility QA. |
| Batch 4 - Footer and support IA | C-PBI-015 through C-PBI-020 | Build footer information architecture, policy routes, support/manual dependencies, localization decisions. |
| Batch 5 - QA and release readiness | C-PBI-022 through C-PBI-028 | Add accessibility, performance, responsive, finalization, release, signoff, and measurement gates. |

## Full Epic C Backlog

| PBI | Title | Priority | Effort | Work area | Implementation mode |
|---|---|:---:|:---:|---|---|
| C-PBI-001 | Create the Epic C source hierarchy and decision log | P0 | S | Documentation | Measurement/documentation |
| C-PBI-002 | Audit current header, footer, menu, and route state | P0 | M | Mixed | Measurement/documentation |
| C-PBI-003 | Create a machine-readable global navigation IA register | P0 | M | Repository / Admin | Drop-in register and validator |
| C-PBI-004 | Expand the launch navigation route contract without inventing handles | P0 | S | Repository / Admin | Context-aware update |
| C-PBI-005 | Add global chrome link and route validation | P0 | M | Repository | Drop-in test method |
| C-PBI-006 | Define Shopify Admin menu change and rollback workflow | P0 | S | Admin / Documentation | Measurement/documentation |
| C-PBI-007 | Apply preview header baseline configuration | P1 | S | Admin / Repository snapshot | Context-aware update |
| C-PBI-008 | Define and implement desktop header hierarchy and search prominence | P1 | M | Design / Repository | Context-aware update |
| C-PBI-009 | Define and implement mobile drawer navigation behavior | P1 | M | Design / Repository | Context-aware update |
| C-PBI-010 | Define desktop mega-menu content model | P1 | M | Content / Admin | Measurement/documentation |
| C-PBI-011 | Configure preview mega-menu navigation in Shopify Admin | P1 | M | Shopify Admin | Admin-only |
| C-PBI-012 | Define breadcrumb architecture and source rules | P1 | S | Documentation / SEO | Measurement/documentation |
| C-PBI-013 | Implement accessible breadcrumbs in theme templates | P1 | M | Repository | Context-aware update |
| C-PBI-014 | Add breadcrumb structured data and validation | P1 | M | Repository / SEO | Drop-in test method |
| C-PBI-015 | Define footer information architecture and ownership | P1 | M | Content / Admin | Measurement/documentation |
| C-PBI-016 | Configure preview footer menu groups and neutral support copy | P1 | M | Admin / Content | Context-aware update |
| C-PBI-017 | Govern footer identity, reassurance, and legal claim language | P1 | S | Content / Legal | Measurement/documentation |
| C-PBI-018 | Verify policy, legal, and sitemap discoverability | P1 | S | Admin / SEO | Drop-in test method |
| C-PBI-019 | Inventory manuals, downloads, and support landing dependencies | P1 | M | Content / Admin | Measurement/documentation |
| C-PBI-020 | Decide localization selector visibility and market-safe labels | P2 | S | Admin / Internationalization | Measurement/documentation |
| C-PBI-021 | Verify account, cart, search, and utility affordance labels | P1 | S | Repository / QA | Drop-in test method |
| C-PBI-022 | Expand accessibility coverage for header, navigation, and footer | P0 | M | Repository / QA | Drop-in test method |
| C-PBI-023 | Add a global chrome performance budget | P1 | S | Repository / QA | Drop-in validation method |
| C-PBI-024 | Create responsive global chrome QA evidence plan | P1 | S | QA / Documentation | Measurement/documentation |
| C-PBI-025 | Add Epic C QA runner and finalization validator | P0 | M | Repository / QA | Drop-in script pattern |
| C-PBI-026 | Update release and documentation indexes for navigation changes | P1 | S | Documentation / Release | Measurement/documentation |
| C-PBI-027 | Conduct preview signoff and production go/no-go | P0 | M | Mixed | Measurement/documentation |
| C-PBI-028 | Define post-launch navigation measurement plan | P2 | S | Analytics / Product | Measurement/documentation |

---

## C-PBI-001 Create the Epic C Source Hierarchy and Decision Log

**Epic:** Epic C - Global Header, Navigation, and Footer  
**Work area:** Documentation  
**Type:** Discovery  
**Priority:** P0  
**Impact:** High  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Foundation  
**Suggested GitHub labels:** `epic: c`, `area: navigation`, `area: documentation`, `type: discovery`, `priority: p0`

### Problem or opportunity

Epic C spans repository code, Shopify Admin navigation, content, policy routes, accessibility, and release evidence. Without a source hierarchy, future workers may treat menu copy, footer support statements, or route assumptions as implementation details instead of governed decisions.

### Evidence

- [adr-0003-navigation-architecture.md](architecture/adr-0003-navigation-architecture.md) defines route contracts but not final menu IA.
- [rhino-preview-implementation-slice.md](brand/rhino-preview-implementation-slice.md) explicitly excludes navigation redesign and footer identity claims.
- [legal-claims-register.json](../data/legal-claims-register.json) governs sensitive claims.

### Proposed outcome

Create an Epic C source hierarchy and decision log that identifies which documents own navigation IA, route fixtures, footer copy, support claims, policy routes, localization, and release evidence.

### Scope

- Create a concise document such as `docs/architecture/epic-c-global-chrome-source-hierarchy.md`.
- Identify source owners for repository, Shopify Admin, content, legal, support, internationalization, and QA decisions.
- Link existing validators and fixture records.
- Define how Epic C decisions are superseded or amended.

### Out of scope

- Implementing navigation or footer changes.
- Editing Shopify menus.
- Writing final support or policy copy.

### Acceptance criteria

- [ ] Source hierarchy document exists and links all current owner documents.
- [ ] The document names the authoritative source for menu labels, route paths, footer claims, policy links, and QA evidence.
- [ ] Unresolved source ownership is listed as open questions rather than silently resolved.
- [ ] The document states that accessibility and performance gates override visual preference.

### Implementation handoff

**Validation method:** Add this file to the Epic C finalization validator in C-PBI-025 so source links can be checked automatically.

### Success measure

Future Epic C PBIs can cite one source for the current decision owner instead of reopening Epic B documents.

### Open questions

- Who is the business owner for support, dealer, financing, and international navigation labels?

---

## C-PBI-002 Audit Current Header, Footer, Menu, and Route State

**Work area:** Mixed  
**Type:** Discovery  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Foundation  
**Suggested GitHub labels:** `epic: c`, `area: navigation`, `area: shopify-admin`, `type: discovery`, `priority: p0`

### Problem or opportunity

The repository contains header/footer code and group settings, but Shopify Admin owns the actual `main-menu` and `footer` menu contents. Epic C needs a before-state audit before menu changes are made.

### Evidence

- [sections/header-group.json](../sections/header-group.json) references `main-menu`.
- [sections/footer-group.json](../sections/footer-group.json) references `footer`.
- [data/navigation-spec.json](../data/navigation-spec.json) currently contains only five routes.

### Proposed outcome

Create an audit report that captures the rendered preview header, drawer, mega menu, footer, policy links, utility links, and route status at required viewports.

### Scope

- Inspect preview pages for homepage, collection, search, product, cart, contact, and policy.
- Capture rendered menu labels, hrefs, route status, active states, and missing links.
- Identify which links come from Shopify menus, theme settings, policy objects, localization, account state, or hardcoded Liquid.
- Record before screenshots and route test output.

### Out of scope

- Changing menus or code.
- Choosing final IA.

### Acceptance criteria

- [ ] Audit report exists under `docs/architecture/` or `docs/qa/evidence/epic-c/`.
- [ ] Every rendered global header/footer link has a source and status.
- [ ] Dynamic Shopify policy links are separated from admin menu links.
- [ ] Desktop and mobile states are both recorded.
- [ ] Route failures are recorded without being made optional.

### Implementation handoff

**Measurement method:** Use Playwright to enumerate `header a`, `footer a`, drawer links, and mega-menu links after preview authentication. Store JSON evidence under `test-results/epic-c/`.

### Success measure

The team can compare after-state navigation to a saved baseline and prove whether Epic C changed production-visible paths.

---

## C-PBI-003 Create a Machine-Readable Global Navigation IA Register

**Work area:** Repository / Shopify Admin  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Foundation  
**Suggested GitHub labels:** `epic: c`, `area: navigation`, `area: data`, `type: improvement`, `priority: p0`

### Problem or opportunity

`data/navigation-spec.json` validates routes, but it does not describe menu hierarchy, customer intent, admin ownership, or launch gating. A separate IA register is needed before applying Shopify Admin menu changes.

### Evidence

- [data/navigation-spec.json](../data/navigation-spec.json) is route-only.
- Epic C requires machine, task, parts, support, learning, policy, and utility paths.
- Product data and support pages are not all approved yet.

### Proposed outcome

Create `data/global-navigation-ia.json` and a validator that quantifies menu completeness, ownership, route readiness, and unresolved dependencies.

### Scope

- Define top-level menu groups without inventing unverified handles.
- Allow each item to record `status`, `owner`, `targetPath`, `source`, `requiredForLaunch`, and `dependencies`.
- Support admin-owned, repository-owned, policy-object, and external-social source types.
- Block launch-required items with blank or TODO paths.

### Out of scope

- Applying Shopify Admin menus.
- Implementing mega-menu rendering.

### Acceptance criteria

- [ ] Register file exists and validates.
- [ ] Every launch-required item has a concrete route or an explicit blocker.
- [ ] Handles are not invented for unverified collections or pages.
- [ ] Support, policy, manuals, and social links are marked unresolved where source ownership is missing.

### Implementation handoff

**Drop-in register skeleton:**

```json
{
  "schemaVersion": 1,
  "status": "draft",
  "source": "Epic C global navigation IA",
  "menus": [
    {
      "id": "primary",
      "label": "Primary header navigation",
      "owner": "Product Owner and Shopify Admin",
      "sourceType": "shopify_navigation",
      "adminHandle": "main-menu",
      "items": []
    },
    {
      "id": "footer",
      "label": "Footer navigation",
      "owner": "Product Owner, Support, Legal, and Shopify Admin",
      "sourceType": "shopify_navigation",
      "adminHandle": "footer",
      "items": []
    }
  ],
  "unresolvedDependencies": []
}
```

**Drop-in validator method:** Create `scripts/validate-global-navigation-ia.js` that reads the register, enforces unique menu IDs and item IDs, blocks TODO launch paths, requires owner/source/status fields, and confirms each concrete path starts with `/` or has `sourceType` set to an allowed external type. Add `validate:global-navigation-ia` to `package.json`.

### Success measure

Navigation hierarchy becomes reviewable and testable before Shopify Admin changes are made.

---

## C-PBI-004 Expand the Launch Navigation Route Contract Without Inventing Handles

**Work area:** Repository / Shopify Admin  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** S  
**Confidence:** Medium  
**Suggested milestone:** Foundation  
**Suggested GitHub labels:** `epic: c`, `area: navigation`, `area: qa`, `needs-admin`, `priority: p0`

### Problem or opportunity

The current route contract is too small for Epic C. It does not prove paths for consumables, accessories, replacement parts, support, policy, manuals, or learning content.

### Evidence

- [adr-0003-navigation-architecture.md](architecture/adr-0003-navigation-architecture.md) lists required launch groups.
- [data/navigation-spec.json](../data/navigation-spec.json) only includes home, machines, search, cart, and contact.

### Proposed outcome

Expand `data/navigation-spec.json` only with verified existing routes. Mark missing route categories as dependencies in the IA register rather than inventing handles.

### Scope

- Verify existing collection, page, policy, and search routes on preview.
- Add launch-required routes only when they return a non-password, non-404 storefront page.
- Keep unknown collections/pages out of the route contract until admin creates them.

### Out of scope

- Creating Shopify collections or pages.
- Editing product handles.
- Making route tests optional.

### Acceptance criteria

- [ ] `data/navigation-spec.json` contains all verified launch routes needed by current menus.
- [ ] Missing routes are recorded in `data/global-navigation-ia.json` or a launch dependency register.
- [ ] `npm run validate:navigation` passes.
- [ ] `npm run test:navigation` passes against preview.

### Implementation handoff

**IDE web-agent prompt:**

```text
Read data/navigation-spec.json, schemas/navigation-spec.schema.json, scripts/validate-navigation-spec.js, tests/navigation.spec.js, tests/helpers/storefront-auth.js, and the current preview route evidence. Expand only with routes that are verified to return HTTP 200 and are appropriate for Epic C global navigation. Do not invent collection, product, policy, or page handles. Preserve existing route identity assertions and preview authentication. Add missing but required route categories to the Epic C IA dependency register instead of weakening tests.
```

### Success measure

The launch navigation spec covers every currently approved global navigation route and fails when a required menu destination breaks.

---

## C-PBI-005 Add Global Chrome Link and Route Validation

**Work area:** Repository  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Foundation  
**Suggested GitHub labels:** `epic: c`, `area: qa`, `area: navigation`, `type: improvement`, `priority: p0`

### Problem or opportunity

Route specs validate expected URLs, but they do not prove that the rendered header, drawer, and footer expose the expected links or avoid broken destinations.

### Evidence

- [tests/navigation.spec.js](../tests/navigation.spec.js) visits configured routes but does not enumerate rendered global chrome links.
- Header and footer links are partly dynamic through Shopify menus and policy objects.

### Proposed outcome

Add a Playwright test that authenticates preview, extracts global chrome links, verifies route identity for internal links, and reports missing expected links separately from broken dynamic policy links.

### Scope

- Test header, drawer, footer, and policy link areas.
- Ignore external social links only when explicitly marked external in the IA register.
- Fail internal links that route to `/password`, 404, or unrelated storefront pages.
- Save a JSON link inventory to `test-results/epic-c/`.

### Out of scope

- Testing checkout.
- Creating missing admin content.

### Acceptance criteria

- [ ] Test file exists and uses the shared storefront authentication helper.
- [ ] The test proves required IA items are present in rendered global chrome.
- [ ] Broken internal links fail the suite.
- [ ] Generated report does not contain the storefront password.

### Implementation handoff

**Drop-in test method:** Create `tests/global-chrome-links.spec.js` using the same pattern as `tests/navigation.spec.js`. Load `data/navigation-spec.json` and, when available, `data/global-navigation-ia.json`. Use locators for `header`, `header-drawer`, and `footer`, then normalize link URLs and assert internal launch-required links resolve.

### Success measure

Preview QA can prove not only that a route exists, but that customers can reach it from global navigation.

---

## C-PBI-006 Define Shopify Admin Menu Change and Rollback Workflow

**Work area:** Admin / Documentation  
**Type:** Configuration  
**Priority:** P0  
**Impact:** High  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Foundation  
**Suggested GitHub labels:** `epic: c`, `area: shopify-admin`, `area: release`, `type: configuration`, `priority: p0`

### Problem or opportunity

Header and footer menus are admin-owned. Without a workflow, repository tests can pass while the actual Shopify menu state drifts or cannot be rolled back.

### Evidence

- Header group uses `main-menu`; footer group uses `footer`.
- Existing release documents require navigation release notes and rollback evidence.

### Proposed outcome

Create an admin workflow that captures before and after menu screenshots or exports, maps admin changes to repository route specs, and defines rollback steps.

### Scope

- Document menu handles, owner, change steps, evidence, rollback, and validation.
- Require route contract updates when menus change.
- Require release notes for global navigation changes.

### Out of scope

- Applying any specific menu change.

### Acceptance criteria

- [ ] Workflow document exists and links to admin evidence requirements.
- [ ] Before/after/rollback evidence is required for preview and production.
- [ ] Navigation changes must run `validate:navigation`, `test:navigation`, and global chrome link tests.

### Implementation handoff

**Measurement method:** Add the workflow document to the C-PBI-025 finalization validator so missing menu rollback guidance blocks Epic C closure.

### Success measure

No navigation admin change can be accepted without a matching route contract and rollback evidence.

---

## C-PBI-007 Apply Preview Header Baseline Configuration

**Work area:** Admin / Repository snapshot  
**Type:** Configuration  
**Priority:** P1  
**Impact:** Medium  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: header`, `area: shopify-admin`, `priority: p1`

### Problem or opportunity

The preview header should use a deliberate Rhino baseline before deeper navigation work begins. Current settings already point to `main-menu`, `mega`, `reduce-logo-size`, and scheme `scheme-4`, but that state needs explicit approval and evidence.

### Evidence

- [sections/header-group.json](../sections/header-group.json) records current header group settings.
- Epic B settings work established preview-only settings safety.

### Proposed outcome

Confirm or adjust preview header group settings through the approved preview settings workflow, then pull the resulting state back into the repository if changed.

### Scope

- Validate logo position, mobile logo position, sticky behavior, color scheme, menu type, utility selectors, and spacing.
- Capture before/after screenshots across required viewports.
- Preserve manual logo/favicon settings.

### Out of scope

- Rewriting `sections/header.liquid`.
- Changing production.
- Final mega-menu content.

### Acceptance criteria

- [ ] Preview theme ID and before/after settings evidence are recorded.
- [ ] `npm run check:rhino-theme-settings` still passes.
- [ ] Header settings do not introduce color contrast failures.
- [ ] Production theme remains untouched.

### Implementation handoff

**IDE web-agent prompt:**

```text
Read docs/brand/rhino-theme-settings-launch-plan.md, data/rhino-launch-theme-settings.json, scripts/manage-rhino-theme-settings.js, config/settings_data.json, sections/header-group.json, and the preview settings workflow. Confirm the approved preview header baseline. If admin settings drift, apply only to the persistent preview theme, preserve manual logo/favicon values, pull settings back into the repository through the established workflow, and run check:rhino-theme-settings plus smoke/accessibility checks. Do not change production.
```

### Success measure

Header visual behavior is stable before IA changes begin.

---

## C-PBI-008 Define and Implement Desktop Header Hierarchy and Search Prominence

**Work area:** Design / Repository  
**Type:** Improvement  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: header`, `area: search`, `area: accessibility`, `priority: p1`

### Problem or opportunity

Customers need search, machine navigation, cart, and support paths without a cluttered generic Trade header.

### Evidence

- [sections/header.liquid](../sections/header.liquid) is still mostly upstream Trade.
- [docs/brand/rhino-action-hierarchy.md](brand/rhino-action-hierarchy.md) defines action hierarchy.
- Epic C requires search prominence and utility links.

### Proposed outcome

Create a desktop header hierarchy that balances brand mark, primary navigation, search, account, cart, localization, and support entry points while preserving Trade compatibility.

### Scope

- Define header layout rules in documentation or a scoped implementation note.
- Apply narrow CSS/Liquid changes only if current Trade layout cannot meet the approved hierarchy.
- Preserve keyboard focus, skip links, search modal behavior, and cart notification.
- Validate 990 px and wider desktop behavior.

### Out of scope

- Full predictive search redesign.
- New search app.
- Product data or filter changes.

### Acceptance criteria

- [ ] Header search entry is discoverable on desktop and keyboard accessible.
- [ ] Primary nav labels do not wrap or overlap at required desktop widths.
- [ ] Account and cart controls retain accessible names.
- [ ] No broad global `a`, `.header`, or `.card` overrides are added.
- [ ] Smoke, accessibility, Theme Check, and performance validation pass.

### Implementation handoff

**IDE web-agent prompt:**

```text
Read sections/header.liquid, snippets/header-search.liquid, snippets/header-mega-menu.liquid, snippets/header-dropdown-menu.liquid, snippets/header-drawer.liquid, assets/base.css, assets/rhino-custom.css, docs/brand/rhino-action-hierarchy.md, docs/brand/rhino-typography-system.md, and docs/architecture/css-architecture.md. Implement the smallest context-aware preview-safe desktop header hierarchy changes needed to make search and primary navigation clear. Preserve Trade search/cart/account behavior and accessibility. Add scoped Rhino CSS only where existing settings cannot express the decision. Do not redesign predictive search or install apps.
```

### Success measure

Desktop users can identify search, shop navigation, cart, and support paths within the first header scan.

---

## C-PBI-009 Define and Implement Mobile Drawer Navigation Behavior

**Work area:** Design / Repository  
**Type:** Improvement  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: mobile`, `area: navigation`, `area: accessibility`, `priority: p1`

### Problem or opportunity

Mobile visitors from video, social, QR codes, and trade shows must reach machines, parts, search, support, and cart with reliable touch and keyboard behavior.

### Evidence

- Header drawer rendering lives in [snippets/header-drawer.liquid](../snippets/header-drawer.liquid).
- Mobile is a primary surface in the source backlog and QA baseline.

### Proposed outcome

Define and implement a mobile drawer IA that mirrors approved primary menu priorities and keeps touch targets, labels, focus order, and close behavior accessible.

### Scope

- Review drawer hierarchy, disclosure labels, close behavior, nested links, and utility links.
- Test mobile 360 and 390 widths plus tablet 768.
- Preserve Trade disclosure mechanics unless a measured accessibility problem requires a scoped fix.

### Out of scope

- Custom app navigation.
- Product compatibility selector.
- Predictive search redesign.

### Acceptance criteria

- [ ] Drawer opens, closes, and returns focus correctly.
- [ ] All top-level mobile nav items have clear text labels.
- [ ] Touch targets meet the QA baseline.
- [ ] Drawer content does not trap page scroll incorrectly.
- [ ] No serious or critical axe violations.

### Implementation handoff

**IDE web-agent prompt:**

```text
Read snippets/header-drawer.liquid, sections/header.liquid, assets/component-menu-drawer.css, assets/rhino-custom.css, tests/accessibility.spec.js, tests/storefront-smoke.spec.js, and data/global-navigation-ia.json if it exists. Implement mobile drawer improvements only where required by approved Epic C IA and measured QA. Preserve Trade disclosure behavior, focus management, and localization/account/cart utilities. Add or update Playwright checks for open, nested navigation, close, and focus return.
```

### Success measure

Mobile customers can reach approved top-level paths and close the drawer without losing keyboard or touch context.

---

## C-PBI-010 Define Desktop Mega-Menu Content Model

**Work area:** Content / Admin  
**Type:** Discovery  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: navigation`, `area: content`, `needs-admin`, `priority: p1`

### Problem or opportunity

Epic C calls for navigation by machine, task, parts, support, and learning. These labels need a content model before Shopify Admin menu entries are created.

### Evidence

- Current `main-menu` existence is known, but its final structure is not source-controlled.
- Product naming and unresolved machine specifications are governed by B-022 artifacts.

### Proposed outcome

Define a mega-menu IA model that separates approved official product/family names from marketing phrases, support links, and future content placeholders.

### Scope

- Define candidate groups such as `Shop by machine`, `Shop by product role`, `Parts and consumables`, and `Support`.
- Use only verified routes as active links.
- Mark uncreated content as planned, blocked, or admin dependency.
- Keep `The Everything Machine` as positioning, not a primary official product name.

### Out of scope

- Creating missing collections or pages.
- Adding compatibility claims.
- Creating learning center content.

### Acceptance criteria

- [ ] IA model lists each proposed group, label, route, owner, and status.
- [ ] Machine family labels follow approved terminology.
- [ ] No unresolved technical values appear in menu labels.
- [ ] Missing route dependencies are explicit.

### Implementation handoff

**Measurement method:** Record this IA in `data/global-navigation-ia.json` and validate with C-PBI-003 tooling.

### Success measure

Admin can build menus from an approved IA without making technical or legal claims in navigation.

---

## C-PBI-011 Configure Preview Mega-Menu Navigation in Shopify Admin

**Work area:** Shopify Admin  
**Type:** Configuration  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: shopify-admin`, `area: navigation`, `priority: p1`

### Problem or opportunity

Once the IA is approved, the preview storefront must reflect it through Shopify Admin menus so real menu behavior can be tested.

### Evidence

- `sections/header-group.json` uses menu handle `main-menu`.
- Header supports `mega` menu type.

### Proposed outcome

Apply the approved IA to the persistent preview theme's `main-menu`, capture before/after evidence, and verify rendered links.

### Scope

- Apply only approved active links.
- Leave blocked or future items unpublished.
- Record admin screenshots or export evidence.
- Run route and rendered global chrome link tests.

### Out of scope

- Production menu changes.
- Creating missing products/collections/pages.
- Code changes unless tests reveal a theme rendering defect.

### Acceptance criteria

- [ ] Preview `main-menu` matches the approved IA.
- [ ] Every active menu link resolves.
- [ ] Rendered desktop and mobile menu labels match approved copy.
- [ ] Rollback steps are documented.

### Implementation handoff

**Admin-only handoff:** Use Shopify Admin -> Online Store -> Navigation -> `main-menu`. Do not edit Liquid for this PBI unless a separate repository defect is discovered.

### Success measure

Customers can navigate the approved product ecosystem paths from preview header menus.

---

## C-PBI-012 Define Breadcrumb Architecture and Source Rules

**Work area:** Documentation / SEO  
**Type:** Improvement  
**Priority:** P1  
**Impact:** Medium  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: seo`, `area: navigation`, `type: improvement`, `priority: p1`

### Problem or opportunity

Breadcrumbs are required by Epic C but are not currently defined. Breadcrumb paths must avoid false hierarchy and duplicate-content risks.

### Evidence

- No current breadcrumb snippet or section was found.
- Structured data architecture already governs SEO decisions.

### Proposed outcome

Document breadcrumb rules for products, collections, search, pages, articles if present, cart, and policies.

### Scope

- Define page-type behavior.
- Identify when breadcrumbs should be hidden.
- Define source priority for product collection ancestry.
- Define label escaping and truncation rules.
- Align with canonical URL rules.

### Out of scope

- Implementing breadcrumbs.
- Creating new collection hierarchy.

### Acceptance criteria

- [ ] Breadcrumb architecture document exists.
- [ ] Rules cover all Epic C QA page categories.
- [ ] Breadcrumbs never imply an unapproved machine/category relationship.
- [ ] SEO and accessibility expectations are measurable.

### Implementation handoff

**Measurement method:** Add requirements to C-PBI-014 tests.

### Success measure

Breadcrumb implementation can be reviewed against explicit source rules instead of ad hoc hierarchy decisions.

---

## C-PBI-013 Implement Accessible Breadcrumbs in Theme Templates

**Work area:** Repository  
**Type:** Feature  
**Priority:** P1  
**Impact:** Medium  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: navigation`, `area: accessibility`, `area: seo`, `priority: p1`

### Problem or opportunity

Customers need orientation on product, collection, search, policy, and content pages without relying only on the browser back button or main menu.

### Evidence

- Breadcrumbs are listed in Epic C but absent from current snippets.
- Page templates currently rely on Trade defaults.

### Proposed outcome

Implement a reusable, accessible breadcrumb snippet and render it on approved page types using source rules from C-PBI-012.

### Scope

- Create a snippet such as `snippets/rhino-breadcrumbs.liquid`.
- Render breadcrumbs from appropriate templates/sections.
- Use `<nav aria-label="Breadcrumb">`.
- Escape labels.
- Avoid duplicate H1 text crowding on mobile.
- Keep cart and search behavior intentional.

### Out of scope

- Breadcrumbs in checkout.
- Inventing collection ancestry.
- Adding JavaScript.

### Acceptance criteria

- [ ] Breadcrumbs render only on approved page types.
- [ ] Current page crumb is not a self-link unless the architecture approves it.
- [ ] Product breadcrumb source priority is documented.
- [ ] Mobile breadcrumbs do not overflow or obscure page content.
- [ ] Accessibility tests pass.

### Implementation handoff

**IDE web-agent prompt:**

```text
Read docs/seo/structured-data-and-seo-architecture.md, docs/architecture/adr-0003-navigation-architecture.md, sections/main-product.liquid, sections/main-collection-product-grid.liquid, sections/main-search.liquid, templates/page*.json, templates/cart.json, snippets/meta-tags.liquid, and current Trade template patterns. Implement an accessible Rhino breadcrumb snippet using the approved C-PBI-012 rules. Do not invent collection ancestry or add JavaScript. Keep labels escaped and compatible with Shopify page types. Add focused tests for output, mobile wrapping, and accessibility.
```

### Success measure

Customers and search engines receive consistent page orientation without false product taxonomy claims.

---

## C-PBI-014 Add Breadcrumb Structured Data and Validation

**Work area:** Repository / SEO  
**Type:** Improvement  
**Priority:** P1  
**Impact:** Medium  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: seo`, `area: qa`, `type: improvement`, `priority: p1`

### Problem or opportunity

Breadcrumb HTML and breadcrumb JSON-LD can drift. A validator should prove the rendered structured data matches the visible path and canonical route rules.

### Evidence

- Social metadata validation already verifies rendered SEO metadata.
- Structured data architecture governs canonical and schema behavior.

### Proposed outcome

Add tests that verify visible breadcrumb labels, hrefs, and `BreadcrumbList` JSON-LD on configured routes.

### Scope

- Validate product, collection, search, page/contact, cart if implemented, and policy routes.
- Confirm no breadcrumb URL contains preview parameters.
- Confirm final crumb labels match visible content.

### Out of scope

- Rewriting product schema unrelated to breadcrumbs.

### Acceptance criteria

- [ ] Breadcrumb tests fail when visible breadcrumb and JSON-LD disagree.
- [ ] Canonical and breadcrumb URLs are preview-parameter-free.
- [ ] Tests cover at least the Epic B/Epic C fixture route categories.

### Implementation handoff

**Drop-in test method:** Create `tests/breadcrumbs.spec.js` using the shared storefront helper. Parse JSON-LD from `script[type="application/ld+json"]`, find `BreadcrumbList`, and compare item names/URLs to rendered `[aria-label="Breadcrumb"]` links.

### Success measure

Breadcrumb SEO remains synchronized with rendered navigation.

---

## C-PBI-015 Define Footer Information Architecture and Ownership

**Work area:** Content / Admin  
**Type:** Discovery  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: footer`, `area: content`, `needs-admin`, `priority: p1`

### Problem or opportunity

The footer must support contact, policy, support, warranty, shipping, manuals, social, newsletter, payment, and sitemap discoverability, but many items depend on legal or operational decisions.

### Evidence

- [sections/footer-group.json](../sections/footer-group.json) has a single `Quick links` block.
- [sections/footer.liquid](../sections/footer.liquid) can render menu blocks, brand information, newsletter, social links, localization, payment icons, and dynamic policies.
- Epic B excluded footer identity claims.

### Proposed outcome

Define footer IA groups, labels, routes, owner, source evidence, and unresolved dependencies.

### Scope

- Define launch footer groups such as Shop, Support, Company, Policies, and Account/Utility if approved.
- Mark warranty, freight, financing, manuals, and support hours as blocked unless approved sources exist.
- Identify which links should come from Shopify policy objects versus footer menu entries.

### Out of scope

- Writing final policy or warranty content.
- Creating social links without account ownership confirmation.

### Acceptance criteria

- [ ] Footer IA appears in the global navigation IA register or a linked footer register.
- [ ] Each footer item has route status and owner.
- [ ] Sensitive claim dependencies cite the claims register.
- [ ] Missing pages are explicit launch dependencies.

### Implementation handoff

**Measurement method:** Validate footer IA through C-PBI-003 tooling and route tests.

### Success measure

Footer content becomes operationally safe and testable rather than generic quick links.

---

## C-PBI-016 Configure Preview Footer Menu Groups and Neutral Support Copy

**Work area:** Admin / Content  
**Type:** Configuration  
**Priority:** P1  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: footer`, `area: shopify-admin`, `needs-content`, `priority: p1`

### Problem or opportunity

The preview footer should expose approved routes and neutral support/contact pathways without adding unsupported legal, freight, warranty, or service claims.

### Evidence

- Footer supports link list and text blocks.
- Support and reassurance copy rules exist, but footer claims still require ownership.

### Proposed outcome

Configure preview footer blocks and menu groups according to approved IA and source copy.

### Scope

- Use menu blocks for approved footer groups.
- Use text block copy only when source-approved and claims-safe.
- Keep dynamic policy links enabled if routes exist.
- Capture before/after footer screenshots.

### Out of scope

- Production footer change.
- Newsletter strategy unless approved.
- Social links unless account ownership is confirmed.

### Acceptance criteria

- [ ] Footer groups match approved IA.
- [ ] Footer route tests pass.
- [ ] Claims validation passes.
- [ ] No placeholder footer headings remain.
- [ ] Footer remains readable on scheme `scheme-4`.

### Implementation handoff

**IDE web-agent prompt:**

```text
Read sections/footer.liquid, sections/footer-group.json, docs/brand/rhino-reassurance-microcopy.md, docs/brand/rhino-brand-voice-and-copy.md, docs/brand/rhino-content-migration-rules.md, data/legal-claims-register.json, data/brand-content-migration-register.json, and data/global-navigation-ia.json if available. Configure only preview footer menu groups and neutral source-approved support/contact copy. Do not add warranty duration, freight estimate, financing, dealer, certification, supplier, exclusivity, or support-hour claims without explicit approved evidence. Preserve dynamic Shopify policy links where valid.
```

### Success measure

The footer helps customers find support and legal paths without creating unsupported operational promises.

---

## C-PBI-017 Govern Footer Identity, Reassurance, and Legal Claim Language

**Work area:** Content / Legal  
**Type:** Content  
**Priority:** P1  
**Impact:** High  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: legal`, `area: footer`, `area: content`, `priority: p1`

### Problem or opportunity

Footer copy is highly visible and repeated on every page. Unsupported identity, support, warranty, freight, dealer, financing, or certification language creates sitewide risk.

### Evidence

- [data/legal-claims-register.json](../data/legal-claims-register.json) governs sensitive claims.
- [rhino-reassurance-microcopy.md](brand/rhino-reassurance-microcopy.md) defines reassurance ownership.
- Epic B blocked unsupported technical and legal claims.

### Proposed outcome

Create footer-specific claim rules and add them to automated claims validation.

### Scope

- Define allowed neutral footer statements.
- Block unsupported warranty duration, freight estimates, financing availability, certification, patent, exclusivity, and supplier/manufacturer claims.
- Ensure footer copy points to approved pages instead of compressing full policies into the footer.

### Out of scope

- Writing legal policy copy.
- Approving any sensitive claim.

### Acceptance criteria

- [ ] Footer claim rules exist and link to the legal claims register.
- [ ] Claims validator scans footer group JSON and footer Liquid/custom text sources.
- [ ] Unsupported claims fail validation.

### Implementation handoff

**Validation method:** Extend `scripts/validate-brand-claims.js` or its input register so footer-specific blocked terms and allowed source paths are measurable.

### Success measure

Footer copy can be changed by admins only within a documented and testable claim boundary.

---

## C-PBI-018 Verify Policy, Legal, and Sitemap Discoverability

**Work area:** Admin / SEO  
**Type:** Bug / Configuration  
**Priority:** P1  
**Impact:** High  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: seo`, `area: legal`, `area: shopify-admin`, `priority: p1`

### Problem or opportunity

Global footer policy links must resolve. Current preview QA proves the rendered policy links resolve; tests must not require unpublished Shopify policy types that are not rendered.

### Evidence

- Performance and social QA currently use `/policies/privacy-policy`.
- Footer can render `shop.policies` dynamically.
- 2026-08-19 focused footer policy/sitemap QA rendered and validated `Privacy policy`, `Shipping policy`, `Refund policy`, and `Legal notice`.
- `/sitemap.xml` returned `200` with XML sitemap content when requested as its own resource.
- Terms of service and contact-information policies are not currently rendered footer policy links and remain absent/deferred unless Legal/Admin makes them required.

### Proposed outcome

Verify each published Shopify policy route, sitemap discoverability, and footer policy rendering. Record missing policies as legal/admin dependencies rather than making tests optional.

### Scope

- Verify rendered Shopify policy links, required published policy fixtures, missing/deferred policy categories, and the sitemap route.
- Update fixture examples only for routes that return valid pages.
- Record missing policy pages as launch blockers or deferred dependencies.

### Out of scope

- Drafting legal policy copy.
- Publishing policies without approval.

### Acceptance criteria

- [x] Every footer policy link returns a valid non-password page.
- [x] Missing/deferred policy categories are listed with legal/admin ownership.
- [x] Policy route fixtures use current 200 routes.
- [x] Route identity tests remain strict.

### Implementation handoff

**Drop-in test method:** Extend `tests/global-chrome-links.spec.js` or `tests/navigation.spec.js` to crawl rendered `.policies a` links and fail any internal policy link returning 404 or `/password`.

### Success measure

Customers can reach legal and policy information from every page footer.

---

## C-PBI-019 Inventory Manuals, Downloads, and Support Landing Dependencies

**Work area:** Content / Admin  
**Type:** Discovery  
**Priority:** P1  
**Impact:** Medium  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: support`, `area: content`, `needs-admin`, `priority: p1`

### Problem or opportunity

Epic C includes manuals and downloads in global navigation, but source documents and customer-safe support paths are not fully productized.

### Evidence

- Product manuals and specification documents exist in the repository.
- B-022 identified unresolved technical conflicts that should not be exposed as claims.

### Proposed outcome

Create an inventory of manuals, downloads, support landing pages, and ownership dependencies before linking them globally.

### Scope

- Identify existing approved manuals/downloads and their rights/source status.
- Identify needed pages: manuals, contact/support, warranty, repairs, shipping/freight, parts help.
- Mark pages as approved, needs content, needs legal, needs technical, or do not link.

### Out of scope

- Creating download pages.
- Uploading files to Shopify.
- Resolving machine specification conflicts.

### Acceptance criteria

- [ ] Inventory links each candidate support/download route to source evidence and owner.
- [ ] Technical documents with unresolved conflicts are not globally linked as authoritative product specs.
- [ ] Navigation IA consumes only approved support/download destinations.

### Implementation handoff

**Measurement method:** Add a support/download section to `data/global-navigation-ia.json` or a linked register and validate status/owner/source fields.

### Success measure

Global navigation exposes support resources only when the content is accurate, rights-safe, and operationally owned.

---

## C-PBI-020 Decide Localization Selector Visibility and Market-Safe Labels

**Work area:** Admin / Internationalization  
**Type:** Research / Configuration  
**Priority:** P2  
**Impact:** Medium  
**Effort:** S  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: internationalization`, `area: shopify-admin`, `needs-decision`, `priority: p2`

### Problem or opportunity

Header and footer currently enable country and language selectors when Shopify makes more than one country or language available. Epic C must not imply international availability, voltage compatibility, freight, warranty, or support unless operations approve it.

### Evidence

- [sections/header.liquid](../sections/header.liquid) and [sections/footer.liquid](../sections/footer.liquid) render localization selectors conditionally.
- Machine specification conflicts include unresolved voltage and international configuration questions.

### Proposed outcome

Decide when localization selectors should appear and what market-safe labels or warnings are needed.

### Scope

- Audit active Shopify Markets, currencies, and languages.
- Decide whether selectors remain visible at launch.
- Document any market availability or voltage restrictions that must be resolved before global navigation promotes international shopping.

### Out of scope

- Translating content.
- Approving international shipping, voltage, or warranty support.

### Acceptance criteria

- [ ] Market/localization decision is recorded.
- [ ] Selector visibility matches active Shopify market strategy.
- [ ] No international claim appears without approval.
- [ ] Header/footer accessibility remains intact when selectors appear or disappear.

### Implementation handoff

**Measurement method:** Add localization selector state to the global chrome audit from C-PBI-002.

### Success measure

Global chrome does not overpromise international sale, support, or compatibility.

---

## C-PBI-021 Verify Account, Cart, Search, and Utility Affordance Labels

**Work area:** Repository / QA  
**Type:** Improvement  
**Priority:** P1  
**Impact:** Medium  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: accessibility`, `area: header`, `area: qa`, `priority: p1`

### Problem or opportunity

Global utility controls are icon-heavy. They must have accessible names, clear visible behavior, and predictable routes.

### Evidence

- Header renders search, account, and cart icons with visually hidden labels.
- Account link appears only when customer accounts are enabled.

### Proposed outcome

Add focused QA coverage for utility controls across customer states and viewport sizes.

### Scope

- Verify search button/input names.
- Verify account icon route and label when enabled.
- Verify cart icon, cart count, and empty/non-empty states.
- Verify localization selector labels when rendered.

### Out of scope

- Account redesign.
- Cart drawer redesign.

### Acceptance criteria

- [ ] Utility controls have accessible names.
- [ ] Cart count announcement works for empty and non-empty carts.
- [ ] Search remains discoverable and keyboard reachable.
- [ ] Tests cover desktop and mobile.

### Implementation handoff

**Drop-in test method:** Extend storefront smoke/accessibility tests with a `global utilities` describe block that uses role/name selectors for search, cart, account when enabled, and localization forms when present.

### Success measure

Utility controls are usable without relying on visual icon recognition alone.

---

## C-PBI-022 Expand Accessibility Coverage for Header, Navigation, and Footer

**Work area:** Repository / QA  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: accessibility`, `area: qa`, `priority: p0`

### Problem or opportunity

Global chrome appears on every page, so accessibility defects scale across the storefront.

### Evidence

- Existing `npm run test:ally` runs axe and required page categories.
- Header drawer, mega-menu, footer forms, localization selectors, and policy links need component-specific checks.

### Proposed outcome

Expand accessibility tests with global chrome-specific keyboard, focus, landmark, disclosure, contrast, and link-purpose assertions.

### Scope

- Test desktop header menu, mobile drawer, search, footer links, newsletter if enabled, localization selectors if enabled, and policy links.
- Preserve existing axe assertions and exclusions.
- Add manual evidence requirements for zoom 200, text spacing, forced colors, and reduced motion.

### Out of scope

- Adding accessibility allowlists.
- Suppressing color contrast or aria rules.

### Acceptance criteria

- [ ] No serious or critical axe violations.
- [ ] Keyboard can traverse and dismiss header menus and drawer.
- [ ] Focus indicators are visible on header/footer controls.
- [ ] Footer newsletter has labels/errors/success states if enabled.
- [ ] Manual checks have evidence paths.

### Implementation handoff

**Drop-in test method:** Add `tests/global-chrome-accessibility.spec.js` using `@axe-core/playwright`, existing preview authentication, and role-based locators. Run it through `test:ally` or the Epic C QA runner.

### Success measure

Global navigation remains accessible as IA grows.

---

## C-PBI-023 Add a Global Chrome Performance Budget

**Work area:** Repository / QA  
**Type:** Improvement  
**Priority:** P1  
**Impact:** Medium  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: performance`, `area: qa`, `priority: p1`

### Problem or opportunity

Header/footer changes can add CSS, JavaScript, icons, images, or app embeds to every page. Global chrome needs its own budget.

### Evidence

- [data/brand-performance-budget.json](../data/brand-performance-budget.json) governs brand performance.
- Header already loads multiple component CSS files and cart notification JavaScript.
- 2026-08-19 runtime performance passed `npm run test:brand-performance:release`; homepage zero image requests were reported as a warning only and are not an Epic C blocker for the current measured document.

### Proposed outcome

Define a measurable global chrome budget for added Rhino CSS, JS, media, icon count, and third-party scripts.

### Scope

- Add a `globalChrome` category to the existing performance budget register if schema allows.
- Measure added asset bytes and runtime resource counts.
- Warn or fail when header/footer changes add blocking third-party scripts or large media.

### Out of scope

- Re-architecting Trade asset loading.
- Performance apps.

### Acceptance criteria

- [x] Budget thresholds are machine-readable.
- [x] Performance validator reports global chrome resource deltas.
- [x] Runtime route reports still prove the measured page is not `/password`.
- [x] No immediate video embeds or external icon/font resources are introduced.

### Implementation handoff

**Validation method:** Extend `scripts/validate-brand-performance-budget.js` or add an Epic C wrapper that counts header/footer-specific assets and global resource deltas. Do not weaken current route identity checks.

### Success measure

Header/footer enhancements do not silently slow every storefront page.

---

## C-PBI-024 Create Responsive Global Chrome QA Evidence Plan

**Work area:** QA / Documentation  
**Type:** Improvement  
**Priority:** P1  
**Impact:** Medium  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: mobile`, `area: qa`, `priority: p1`

### Problem or opportunity

Navigation failures are often viewport-specific: wrapping labels, clipped drawers, sticky header overlap, and footer columns can pass desktop smoke checks while failing mobile.

### Evidence

- Epic B QA already defines mobile, tablet, desktop, and supplemental desktop viewport IDs.
- Global header/footer appear on all required fixture routes.
- 2026-08-19 responsive QA passed 55/55 route viewports with 490 passed states, 5 not applicable states, and `0` required width failures.

### Proposed outcome

Create an Epic C evidence plan for global chrome screenshots, keyboard paths, mobile drawer states, sticky header states, and footer wrapping.

### Scope

- Use mobile-360, mobile-390, tablet-768, desktop-1440, and supplemental desktop-1920.
- Capture homepage, collection, search, product, cart, contact, and policy global chrome.
- Include drawer open, drawer nested menu, search open, footer bottom, and sticky scrolled states.

### Out of scope

- Visual regression framework replacement.
- Public style guide pages.

### Acceptance criteria

- [x] Evidence plan lists screenshot states and naming rules.
- [x] Required fixture routes are sourced from existing fixture/environment records.
- [x] Plan blocks approval if product-card or menu labels overlap at required widths.

### Implementation handoff

**Measurement method:** Reuse Epic B evidence naming patterns under `docs/qa/evidence/epic-c/` and record results under `test-results/epic-c/`.

### Success measure

Responsive navigation review is repeatable and not based on a single desktop screenshot.

---

## C-PBI-025 Add Epic C QA Runner and Finalization Validator

**Work area:** Repository / QA  
**Type:** Improvement  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: qa`, `area: release`, `type: improvement`, `priority: p0`

### Problem or opportunity

Epic C needs a single static/preview QA entry point like Epic B so completion cannot be claimed while route, menu, accessibility, policy, or performance checks are skipped.

### Evidence

- Epic B uses `scripts/run-epic-b-brand-qa.js` and `scripts/validate-epic-b-finalization.js`.
- Existing scripts include navigation, smoke, accessibility, performance, social metadata, and register validation.
- 2026-08-19 `qa:epic-c:static`, `qa:epic-c:preview`, `qa:epic-c:all`, and `validate:epic-c-finalization` passed.

### Proposed outcome

Create an Epic C QA plan, QA runner, and finalization validator that reference existing scripts and any new Epic C tests.

### Scope

- Create `data/epic-c-global-chrome-qa-plan.json`.
- Create `scripts/validate-epic-c-finalization.js`.
- Create `scripts/run-epic-c-global-chrome-qa.js`.
- Add package scripts such as `validate:epic-c-finalization`, `qa:epic-c:static`, `qa:epic-c:preview`, and `qa:epic-c:all`.
- Reuse existing smoke/accessibility/performance frameworks.

### Out of scope

- Creating another test framework.
- Running preview suites without credentials.

### Acceptance criteria

- [x] Static runner validates registers, route specs, claims, performance budget, and finalization artifacts.
- [x] Preview runner executes navigation, global chrome links, smoke, accessibility, performance, and social metadata where configured.
- [x] Runner report records selected/passed/failed/failedRequired totals.
- [x] Missing required artifacts block finalization.

### Implementation handoff

**Drop-in script pattern:** Copy the Epic B runner/finalization structure and replace brand-specific artifacts with Epic C global chrome artifacts. Do not weaken any existing script requirement; call existing npm scripts by their actual names in `package.json`.

### Success measure

Epic C can only close when repository, admin, route, accessibility, performance, and evidence gates pass.

---

## C-PBI-026 Update Release and Documentation Indexes for Navigation Changes

**Work area:** Documentation / Release  
**Type:** Improvement  
**Priority:** P1  
**Impact:** Medium  
**Effort:** S  
**Confidence:** High  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: release`, `area: documentation`, `priority: p1`

### Problem or opportunity

Navigation and footer changes affect every page and must be visible in release checklists, rollback plans, and documentation indexes.

### Evidence

- Release checklists already include navigation checkpoints.
- Documentation index ownership may need updates after Epic C creates new artifacts.

### Proposed outcome

Update release and documentation references so global chrome changes are reviewed consistently.

### Scope

- Add Epic C artifacts to the documentation index if one exists.
- Update release notes/checklist references to include menu handles, route spec, global chrome tests, and rollback evidence.
- Ensure generated docs are updated only through generators.

### Out of scope

- Completing release signoff.
- Manually editing generated inventories.

### Acceptance criteria

- [ ] Release checklist points to Epic C QA commands.
- [ ] Navigation menu changes require release notes.
- [ ] Documentation index links new Epic C source documents.

### Implementation handoff

**Measurement method:** Add required link checks to C-PBI-025 finalization validator.

### Success measure

Future releases treat global chrome changes as high-blast-radius changes.

---

## C-PBI-027 Conduct Preview Signoff and Production Go/No-Go

**Work area:** Mixed  
**Type:** Configuration / QA  
**Priority:** P0  
**Impact:** High  
**Effort:** M  
**Confidence:** Medium  
**Suggested milestone:** Launch Readiness  
**Suggested GitHub labels:** `epic: c`, `area: release`, `area: qa`, `needs-admin`, `priority: p0`

### Problem or opportunity

Epic C changes include both repository and Shopify Admin state. Production should not change until stakeholders approve route behavior, copy, accessibility, performance, and rollback evidence.

### Evidence

- Epic B preview workflow established preview-only validation.
- Admin-owned menus cannot be fully proven by repository diffs alone.
- 2026-08-19 automated Epic C gates passed; this does not supply stakeholder approval or production go/no-go.

### Proposed outcome

Collect preview signoff and make a production go/no-go decision for header, navigation, breadcrumbs, footer, policy links, and utility controls.

### Scope

- Validate preview theme ID, menu state, route tests, accessibility, performance, social metadata, and screenshots.
- Get Product Owner, Brand, Engineering, QA/Release, Shopify Admin, Legal/Content/Support where needed.
- Record production deployment approval or blockers.

### Out of scope

- Deploying without approval.
- Resolving missing policies/content by writing unapproved copy.

### Acceptance criteria

- [ ] All required automated suites pass.
- [ ] Manual evidence is complete.
- [ ] Production menu and theme rollback are documented.
- [ ] Required stakeholder signoffs are recorded.
- [ ] Production remains untouched until explicit approval.

### Implementation handoff

**Measurement method:** Use the Epic C QA runner report plus manual evidence checklist as the signoff package.

### Success measure

Epic C can move from preview to production without untracked admin drift or unresolved launch blockers.

---

## C-PBI-028 Define Post-Launch Navigation Measurement Plan

**Work area:** Analytics / Product  
**Type:** Research  
**Priority:** P2  
**Impact:** Medium  
**Effort:** S  
**Confidence:** Medium  
**Suggested milestone:** Post-Launch  
**Suggested GitHub labels:** `epic: c`, `area: analytics`, `area: navigation`, `priority: p2`

### Problem or opportunity

Navigation success should be measured after launch, not judged only by stakeholder preference.

### Evidence

- Product Owner epic report recommends search usage, zero-result rate, collection click rate, support form completion, mobile conversion, and task completion measures.
- Analytics strategy is governed outside Epic C.

### Proposed outcome

Define measurable navigation outcomes and the minimum analytics events or Shopify reports needed to evaluate them.

### Scope

- Define measures for header search usage, menu clicks, footer support clicks, policy visits, machine navigation, parts navigation, and mobile drawer usage.
- Identify consent implications.
- Use native Shopify analytics where possible before adding custom events.

### Out of scope

- Installing analytics apps.
- Implementing pixels without privacy review.

### Acceptance criteria

- [ ] Measurement plan lists event/report source, owner, privacy notes, and success threshold.
- [ ] Custom event needs are separated from native Shopify reporting.
- [ ] No invasive tracking is introduced.

### Implementation handoff

**Measurement method:** Add post-launch measurement definitions to the analytics plan and do not implement event code until the analytics owner approves.

### Success measure

Navigation improvements can be evaluated by customer behavior and support outcomes after launch.

## Top Recommended Starting PBIs

1. C-PBI-001 - Create the Epic C source hierarchy and decision log.
2. C-PBI-002 - Audit current header, footer, menu, and route state.
3. C-PBI-003 - Create a machine-readable global navigation IA register.
4. C-PBI-004 - Expand the launch navigation route contract without inventing handles.
5. C-PBI-006 - Define Shopify Admin menu change and rollback workflow.
6. C-PBI-010 - Define desktop mega-menu content model.
7. C-PBI-015 - Define footer information architecture and ownership.
8. C-PBI-025 - Add Epic C QA runner and finalization validator.

## Highest-Risk Areas

- Admin menu drift that is not represented in repository route specs.
- Linking to missing policy, support, manual, or collection routes.
- Footer copy that creates unsupported warranty, freight, support, dealer, financing, or international claims.
- Mobile drawer behavior regressions.
- Header/footer CSS overrides that affect every page.
- Breadcrumb hierarchy that implies unapproved product taxonomy or collection ancestry.
- Adding apps or scripts to solve navigation problems that Trade and Shopify can already handle.

## Missing Business Decisions

- Final machine/category navigation labels for product-role and task-based shopping.
- Whether support, warranty, repairs, manuals, shipping/freight, financing, dealer, and learning pages exist for launch.
- Which policy pages are legally required and ready to publish.
- Whether social links are approved and which accounts are official.
- Whether country/language selectors should be visible at launch.
- Whether customer accounts are part of the launch customer journey.

## Proposed Validation Commands

Run these as Epic C artifacts are added:

```powershell
npm run validate:navigation
npm run test:navigation
npm run check:placeholders
npm run validate:hardcoded-strings
npm run validate:brand-claims
npm run test:smoke
npm run test:ally
npm run test:brand-performance:release
npm run validate:registers
python scripts/validate-theme-repository.py
shopify theme check --fail-level warning
```

When C-PBI-025 is implemented, replace the individual Epic C command bundle with:

```powershell
npm run validate:epic-c-finalization
npm run qa:epic-c:static
npm run qa:epic-c:preview
```

Preview suites require preview credentials and fixture routes. Do not run preview suites against production unless an explicit production release PBI approves it.
