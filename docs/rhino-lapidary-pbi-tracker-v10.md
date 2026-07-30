# Rhino Lapidary PBI Tracker

Source backlog: `rhino-storefront-discovery-epic-a.md`

Status values:

- `Not started`
- `Guidance provided`
- `In progress`
- `Blocked`
- `Ready for verification`
- `Complete`

## Current execution batch

| Order | PBI | Title | Priority | Size | Status | Why now |
|---:|---|---|:---:|:---:|---|---|
| 1 | A-038 | Create navigation architecture decision record | P1 | M | Guidance provided | Converts menu expectations into testable storefront/navigation fixtures. |
| 2 | A-040 | Create design token inventory and governance | P1 | M | Guidance provided | Establishes token ownership before visual customization accelerates. |
| 3 | A-041 | Define CSS architecture for Rhino customizations | P1 | M | Guidance provided | Keeps Rhino CSS isolated from inherited Trade CSS and validates import boundaries. |
| 4 | A-044 | Define JavaScript architecture and event contracts | P1 | M | Guidance provided | Prevents ad-hoc storefront JS and creates testable event/API contracts. |
| 5 | A-058 | Create a Rhino custom section/block strategy | P1 | M | Guidance provided | Defines how new Rhino-specific sections are named, documented, and schema-validated. |

## Project context adjustment

- The Shopify store was newly created from default settings.
- Only the product import and a small number of title-only collections currently exist.
- A-052 is deferred rather than treated as a launch-blocking audit.
- Admin-oriented PBIs should activate only when the project introduces or changes the relevant configuration.

## Full Epic A backlog

| PBI | Title | Priority | Size | Status | Current batch | Notes |
|---|---|:---:|:---:|---|:---:|---|
| A-001 | Document the local development workflow | P0 | S | Complete |  |  |
| A-002 | Record the Trade base version and upstream source | P0 | S | Guidance provided | 4 | Record the clean Trade baseline before Rhino-specific changes begin. |
| A-003 | Create an upstream-update strategy | P0 | M | Complete |  |  |
| A-004 | Build an upstream-vs-Rhino customization inventory | P0 | M | Complete |  |  |
| A-005 | Remove or ignore IDE project files from version control | P1 | S | Complete |  |  |
| A-006 | Add a `.shopifyignore` policy | P1 | S | Complete |  |  |
| A-007 | Define `settings_data.json` ownership and safety rules | P0 | M | Guidance provided | 1 | Protect theme-editor state before changing configuration files. |
| A-008 | Establish development, preview, and production theme workflow | P0 | M | Guidance provided | 2 | Establish a safe preview and production workflow before implementation begins. |
| A-009 | Add Theme Check configuration | P0 | S | Complete |  |  |
| A-010 | Resolve or explicitly document current Theme Check warnings | P1 | M | Complete |  |  |
| A-011 | Add CI for theme validation | P0 | M | Complete |  |  |
| A-012 | Add a no-placeholder-content check | P1 | S | Complete |  |  |
| A-013 | Create a repository release checklist | P0 | S | Complete |  |  |
| A-014 | Create a changelog or release notes template | P2 | S | Complete |  |  |
| A-015 | Create a PR checklist for Shopify theme work | P1 | S | Complete |  |  |
| A-016 | Add issue templates for PBIs and discovery tasks | P2 | S | Not started |  |  |
| A-017 | Define file ownership and review requirements | P2 | S | Not started |  |  |
| A-018 | Document app dependency and app embed policy | P0 | M | Complete |  |  |
| A-019 | Audit all app block surfaces in the theme | P1 | M | Complete |  |  |
| A-020 | Create a third-party script and pixel register | P0 | M | Complete |  |  |
| A-021 | Create analytics migration and verification plan | P1 | M | Complete |  |  |
| A-022 | Verify domain, DNS, and HTTPS launch requirements | P0 | M | Complete |  |  |
| A-023 | Create redirect and URL migration architecture | P1 | M | Complete |  |  |
| A-024 | Define admin dependency register | P0 | M | Complete |  |  |
| A-025 | Define browser and device support baseline | P1 | S | Complete |  |  |
| A-026 | Establish accessibility baseline | P0 | M | Complete |  |  |
| A-027 | Establish performance budget | P0 | M | Complete |  |  |
| A-028 | Add storefront smoke tests | P1 | L | Complete |  |  |
| A-029 | Add visual regression testing strategy | P2 | L | Not started |  |  |
| A-030 | Define fixture data for tests and previews | P1 | M | Complete |  |  |
| A-031 | Create cart and quick-order architecture note | P0 | M | Complete |  |  |
| A-032 | Verify cart type strategy | P1 | M | Complete |  |  |
| A-033 | Verify product template purchase architecture | P0 | M | Guidance provided | 3 | Resolve the current purchase-path risk: the default product template lacks normal buy controls. |
| A-034 | Create product template architecture decision record | P1 | M | Complete |  |  |
| A-035 | Create collection and filtering architecture decision record | P1 | M | Complete |  |  |
| A-036 | Document Search and Discovery dependency | P1 | M | Complete |  |  |
| A-037 | Define metafield and metaobject architecture | P0 | L | Complete |  |  |
| A-038 | Create navigation architecture decision record | P1 | M | Not started |  |  |
| A-039 | Define locale and internationalization strategy | P2 | M | Not started |  |  |
| A-040 | Create design token inventory and governance | P1 | M | Not started |  |  |
| A-041 | Define CSS architecture for Rhino customizations | P1 | M | Not started |  |  |
| A-042 | Audit duplicate and dead CSS/JS assets | P2 | M | Not started |  |  |
| A-043 | Audit stock icon and illustration assets | P2 | S | Not started |  |  |
| A-044 | Define JavaScript architecture and event contracts | P1 | M | Not started |  |  |
| A-045 | Create a Custom Liquid and app embed guardrail | P1 | S | Complete |  |  |
| A-046 | Create media asset source-of-truth rules | P1 | M | Not started |  |  |
| A-047 | Define structured data and SEO architecture | P1 | M | Complete |  |  |
| A-048 | Create security and privacy review checklist | P1 | M | Complete |  |  |
| A-049 | Define Shopify admin access and permissions policy | P1 | S | Not started |  |  |
| A-050 | Document policy, notification, and support content dependencies | P1 | M | Not started |  |  |
| A-051 | Establish product data quality gates | P0 | M | Complete |  |  |
| A-052 | Create a Shopify admin discovery checklist issue | P0 | S | Deferred — new store defaults | 5 | Expose Shopify-admin dependencies that cannot be verified from repository code. |
| A-053 | Define backup and rollback procedures | P0 | M | Complete |  |  |
| A-054 | Create a production launch readiness gate | P0 | M | Not started |  |  |
| A-055 | Create architecture decision log | P2 | S | Not started |  |  |
| A-056 | Define documentation index and ownership | P2 | S | Not started |  |  |
| A-057 | Create a known stock Trade remnants ledger | P1 | M | Not started |  |  |
| A-058 | Create a Rhino custom section/block strategy | P1 | M | Not started |  |  |
| A-059 | Define hardcoded string and locale strategy | P2 | M | Not started |  |  |
| A-060 | Audit generated and local-only files before first production push | P1 | S | Not started |  |  |

## Verification log

| Date | PBI | Result | Evidence / follow-up |
|---|---|---|---|
| 2026-07-30 | A-028 | Complete | User confirmed automated storefront smoke tests are finished. |
| 2026-07-30 | A-031 | Complete | User confirmed cart and checkout-entry architecture is finished. |
| 2026-07-30 | A-032 | Complete | User confirmed cart type/cart notification verification is finished. |
| 2026-07-30 | A-036 | Complete | User confirmed Search and Discovery configuration process is finished. |
| 2026-07-30 | A-037 | Complete | User confirmed metafield/metaobject architecture is finished. |
| 2026-07-30 | A-038 | Guidance provided | Navigation ADR, fixture spec, and route tests supplied. |
| 2026-07-30 | A-040 | Guidance provided | Design token inventory and validator supplied. |
| 2026-07-30 | A-041 | Guidance provided | Rhino CSS boundary policy and validator supplied. |
| 2026-07-30 | A-044 | Guidance provided | JavaScript architecture and storefront contract validator supplied. |
| 2026-07-30 | A-058 | Guidance provided | Custom section/block strategy and schema validator supplied. |
| 2026-07-29 | A-024 | Complete | User moved on after automated register validation work; admin register treated as complete. |
| 2026-07-29 | A-030 | Complete | User moved on after fixture validation setup; fixture baseline treated as complete. |
| 2026-07-29 | A-051 | Complete | User moved on after product data gate setup; product validation baseline treated as complete. |
| 2026-07-29 | A-034 | Complete | Optional specialized product templates intentionally not created yet; validator allows absence until real fixture requirements exist. |
| 2026-07-29 | A-035 | Complete | User moved on after filter spec validation setup; filter architecture baseline treated as complete. |
| 2026-07-29 | A-028 | Guidance provided | Storefront smoke test suite supplied. |
| 2026-07-29 | A-031 | Guidance provided | Cart and checkout-entry architecture with automated checks supplied. |
| 2026-07-29 | A-032 | Guidance provided | Cart notification behavior validator supplied. |
| 2026-07-29 | A-036 | Guidance provided | Search and Discovery config process and export validation supplied. |
| 2026-07-29 | A-037 | Guidance provided | Metafield/metaobject architecture and schema validation supplied. |
| 2026-07-29 | A-022 | Complete | User confirmed domain/DNS/HTTPS launch document is finished. |
| 2026-07-29 | A-023 | Complete | User confirmed redirect and URL migration architecture is finished. |
| 2026-07-29 | A-021 | Complete | User confirmed analytics migration and verification plan is finished. |
| 2026-07-29 | A-047 | Complete | User confirmed structured data and SEO architecture is finished. |
| 2026-07-29 | A-053 | Complete | User confirmed backup and rollback procedures are finished. |
| 2026-07-29 | A-024 | Guidance provided | Machine-checkable admin dependency register supplied. |
| 2026-07-29 | A-030 | Guidance provided | Storefront fixture data and validator supplied. |
| 2026-07-29 | A-051 | Guidance provided | Product data quality gate validator supplied. |
| 2026-07-29 | A-034 | Guidance provided | Product template ADR and template block validator supplied. |
| 2026-07-29 | A-035 | Guidance provided | Collection/filtering ADR and filter spec validator supplied. |
| 2026-07-29 | A-018 | Complete | User confirmed app dependency/app embed policy is finished. |
| 2026-07-29 | A-019 | Complete | User confirmed app block surface audit is finished. |
| 2026-07-29 | A-045 | Complete | User confirmed Custom Liquid/app embed guardrail is finished. |
| 2026-07-29 | A-020 | Complete | User confirmed third-party script/pixel register is finished. |
| 2026-07-29 | A-048 | Complete | User confirmed security/privacy checklist is finished. |
| 2026-07-29 | A-022 | Guidance provided | Domain/DNS/HTTPS launch checklist supplied. |
| 2026-07-29 | A-023 | Guidance provided | Redirect and URL migration architecture supplied. |
| 2026-07-29 | A-021 | Guidance provided | Analytics migration and verification plan supplied. |
| 2026-07-29 | A-047 | Guidance provided | Structured data and SEO architecture supplied. |
| 2026-07-29 | A-053 | Guidance provided | Backup and rollback procedures supplied. |
| 2026-07-29 | A-005 | Complete | User confirmed IDE/local-file hygiene is finished. |
| 2026-07-29 | A-006 | Complete | User confirmed `.shopifyignore` policy is finished. |
| 2026-07-29 | A-012 | Complete | User confirmed placeholder-content check is finished. |
| 2026-07-29 | A-015 | Complete | User confirmed PR checklist is finished. |
| 2026-07-29 | A-014 | Complete | User confirmed release notes template is finished. |
| 2026-07-29 | A-018 | Guidance provided | App dependency policy and register supplied. |
| 2026-07-29 | A-019 | Guidance provided | App block surface audit script and register supplied. |
| 2026-07-29 | A-045 | Guidance provided | Custom Liquid and app embed guardrail supplied. |
| 2026-07-29 | A-020 | Guidance provided | Third-party script and pixel register supplied. |
| 2026-07-29 | A-048 | Guidance provided | Security and privacy review checklist supplied. |
| 2026-07-29 | A-025 | Complete | User confirmed browser/device baseline is finished. |
| 2026-07-29 | A-026 | Complete | User confirmed accessibility baseline is finished. |
| 2026-07-29 | A-027 | Complete | User confirmed performance budget is finished. |
| 2026-07-29 | A-013 | Complete | User confirmed release checklist is finished. |
| 2026-07-29 | A-001 | Complete | User confirmed README/local workflow documentation is finished. |
| 2026-07-29 | A-005 | Guidance provided | Repository hygiene cleanup commands supplied. |
| 2026-07-29 | A-006 | Guidance provided | `.shopifyignore` policy supplied. |
| 2026-07-29 | A-012 | Guidance provided | Placeholder-content validator and CI integration supplied. |
| 2026-07-29 | A-015 | Guidance provided | PR template supplied. |
| 2026-07-29 | A-014 | Guidance provided | Release notes template supplied. |
| 2026-07-03 | A-003 | Complete | User confirmed upstream update strategy is finished. |
| 2026-07-03 | A-004 | Complete | User confirmed customization inventory is finished. |
| 2026-07-03 | A-009 | Complete | User confirmed Theme Check configuration is finished. |
| 2026-07-03 | A-010 | Complete | User confirmed current Theme Check warning disposition is finished. |
| 2026-07-03 | A-011 | Complete | User confirmed CI theme validation is finished. |
| 2026-07-03 | A-001 | Guidance provided | README content supplied; awaiting repository application. |
| 2026-07-03 | A-006 | Guidance provided | `.shopifyignore` policy supplied; awaiting repository application. |
| 2026-07-03 | A-025 | Guidance provided | Browser/device support matrix supplied. |
| 2026-07-03 | A-026 | Guidance provided | Accessibility baseline and release checks supplied. |
| 2026-07-03 | A-027 | Guidance provided | Performance budget supplied. |
| 2026-07-03 | A-052 | Deferred — new store defaults | Revisit when non-default admin dependencies are introduced. |
| 2026-07-03 | A-003 | Guidance provided | Upstream strategy and baseline-tag workflow supplied. |
| 2026-07-03 | A-004 | Guidance provided | Generated customization-inventory approach supplied. |
| 2026-07-03 | A-009 | Guidance provided | `.theme-check.yml` configuration supplied. |
| 2026-07-03 | A-010 | Guidance provided | Warning disposition and targeted fixes supplied. |
| 2026-07-03 | A-011 | Guidance provided | GitHub Actions validation workflow supplied. |
| 2026-07-02 | A-007 | Guidance provided | Awaiting repository policy addition and workflow adoption. |
| 2026-07-02 | A-008 | Guidance provided | Awaiting store/theme IDs and preview workflow verification. |
| 2026-07-02 | A-033 | Guidance provided | Awaiting product template update and preview tests. |
| 2026-07-02 | A-002 | Guidance provided | Awaiting architecture note commit. |
| 2026-07-02 | A-052 | Guidance provided | Awaiting Shopify admin audit completion. |

## Tracker maintenance rule

A PBI is only marked `Complete` after its acceptance criteria have been verified. Providing code or instructions changes the status to `Guidance provided`; applying the change changes it to `Ready for verification`; successful testing changes it to `Complete`.
