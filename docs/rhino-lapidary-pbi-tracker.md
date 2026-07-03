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

| Order | PBI | Title | Priority | Size | Status            | Why now |
|---:|---|---|:---:|:---:|-------------------|---|
| 1 | A-007 | Define `settings_data.json` ownership and safety rules | P0 | M | Guidance provided | Protect theme-editor state before changing configuration files. |
| 2 | A-008 | Establish development, preview, and production theme workflow | P0 | M | Guidance provided | Establish a safe preview and production workflow before implementation begins. |
| 3 | A-033 | Verify product template purchase architecture | P0 | M | Guidance provided | Resolve the current purchase-path risk: the default product template lacks normal buy controls. |
| 4 | A-002 | Record the Trade base version and upstream source | P0 | S | Complete          | Record the clean Trade baseline before Rhino-specific changes begin. |
| 5 | A-052 | Create a Shopify admin discovery checklist issue | P0 | S | Guidance provided | Expose Shopify-admin dependencies that cannot be verified from repository code. |

## Full Epic A backlog

| PBI | Title | Priority | Size | Status | Current batch | Notes |
|---|---|:---:|:---:|---|:---:|---|
| A-001 | Document the local development workflow | P0 | S | Not started |  |  |
| A-002 | Record the Trade base version and upstream source | P0 | S | Guidance provided | 4 | Record the clean Trade baseline before Rhino-specific changes begin. |
| A-003 | Create an upstream-update strategy | P0 | M | Not started |  |  |
| A-004 | Build an upstream-vs-Rhino customization inventory | P0 | M | Not started |  |  |
| A-005 | Remove or ignore IDE project files from version control | P1 | S | Not started |  |  |
| A-006 | Add a `.shopifyignore` policy | P1 | S | Not started |  |  |
| A-007 | Define `settings_data.json` ownership and safety rules | P0 | M | Guidance provided | 1 | Protect theme-editor state before changing configuration files. |
| A-008 | Establish development, preview, and production theme workflow | P0 | M | Guidance provided | 2 | Establish a safe preview and production workflow before implementation begins. |
| A-009 | Add Theme Check configuration | P0 | S | Not started |  |  |
| A-010 | Resolve or explicitly document current Theme Check warnings | P1 | M | Not started |  |  |
| A-011 | Add CI for theme validation | P0 | M | Not started |  |  |
| A-012 | Add a no-placeholder-content check | P1 | S | Not started |  |  |
| A-013 | Create a repository release checklist | P0 | S | Not started |  |  |
| A-014 | Create a changelog or release notes template | P2 | S | Not started |  |  |
| A-015 | Create a PR checklist for Shopify theme work | P1 | S | Not started |  |  |
| A-016 | Add issue templates for PBIs and discovery tasks | P2 | S | Not started |  |  |
| A-017 | Define file ownership and review requirements | P2 | S | Not started |  |  |
| A-018 | Document app dependency and app embed policy | P0 | M | Not started |  |  |
| A-019 | Audit all app block surfaces in the theme | P1 | M | Not started |  |  |
| A-020 | Create a third-party script and pixel register | P0 | M | Not started |  |  |
| A-021 | Create analytics migration and verification plan | P1 | M | Not started |  |  |
| A-022 | Verify domain, DNS, and HTTPS launch requirements | P0 | M | Not started |  |  |
| A-023 | Create redirect and URL migration architecture | P1 | M | Not started |  |  |
| A-024 | Define admin dependency register | P0 | M | Not started |  |  |
| A-025 | Define browser and device support baseline | P1 | S | Not started |  |  |
| A-026 | Establish accessibility baseline | P0 | M | Not started |  |  |
| A-027 | Establish performance budget | P0 | M | Not started |  |  |
| A-028 | Add storefront smoke tests | P1 | L | Not started |  |  |
| A-029 | Add visual regression testing strategy | P2 | L | Not started |  |  |
| A-030 | Define fixture data for tests and previews | P1 | M | Not started |  |  |
| A-031 | Create cart and quick-order architecture note | P0 | M | Not started |  |  |
| A-032 | Verify cart type strategy | P1 | M | Not started |  |  |
| A-033 | Verify product template purchase architecture | P0 | M | Guidance provided | 3 | Resolve the current purchase-path risk: the default product template lacks normal buy controls. |
| A-034 | Create product template architecture decision record | P1 | M | Not started |  |  |
| A-035 | Create collection and filtering architecture decision record | P1 | M | Not started |  |  |
| A-036 | Document Search and Discovery dependency | P1 | M | Not started |  |  |
| A-037 | Define metafield and metaobject architecture | P0 | L | Not started |  |  |
| A-038 | Create navigation architecture decision record | P1 | M | Not started |  |  |
| A-039 | Define locale and internationalization strategy | P2 | M | Not started |  |  |
| A-040 | Create design token inventory and governance | P1 | M | Not started |  |  |
| A-041 | Define CSS architecture for Rhino customizations | P1 | M | Not started |  |  |
| A-042 | Audit duplicate and dead CSS/JS assets | P2 | M | Not started |  |  |
| A-043 | Audit stock icon and illustration assets | P2 | S | Not started |  |  |
| A-044 | Define JavaScript architecture and event contracts | P1 | M | Not started |  |  |
| A-045 | Create a Custom Liquid and app embed guardrail | P1 | S | Not started |  |  |
| A-046 | Create media asset source-of-truth rules | P1 | M | Not started |  |  |
| A-047 | Define structured data and SEO architecture | P1 | M | Not started |  |  |
| A-048 | Create security and privacy review checklist | P1 | M | Not started |  |  |
| A-049 | Define Shopify admin access and permissions policy | P1 | S | Not started |  |  |
| A-050 | Document policy, notification, and support content dependencies | P1 | M | Not started |  |  |
| A-051 | Establish product data quality gates | P0 | M | Not started |  |  |
| A-052 | Create a Shopify admin discovery checklist issue | P0 | S | Guidance provided | 5 | Expose Shopify-admin dependencies that cannot be verified from repository code. |
| A-053 | Define backup and rollback procedures | P0 | M | Not started |  |  |
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
| 2026-07-02 | A-007 | Guidance provided | Awaiting repository policy addition and workflow adoption. |
| 2026-07-02 | A-008 | Guidance provided | Awaiting store/theme IDs and preview workflow verification. |
| 2026-07-02 | A-033 | Guidance provided | Awaiting product template update and preview tests. |
| 2026-07-02 | A-002 | Guidance provided | Awaiting architecture note commit. |
| 2026-07-02 | A-052 | Guidance provided | Awaiting Shopify admin audit completion. |

## Tracker maintenance rule

A PBI is only marked `Complete` after its acceptance criteria have been verified. Providing code or instructions changes the status to `Guidance provided`; applying the change changes it to `Ready for verification`; successful testing changes it to `Complete`.
