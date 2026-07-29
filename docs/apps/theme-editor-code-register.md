# Theme Editor Code Register

## Purpose

Custom Liquid blocks, app embeds, and theme-editor injected code can change the storefront without appearing clearly in normal theme code review.

This register documents all code-like behavior configured outside normal repository files.

## Policy

Custom Liquid is allowed only when all of the following are true:

* Shopify-native settings cannot satisfy the need
* A repository-controlled section or snippet would be heavier than the problem warrants
* The code is small, readable, and reversible
* The code has an owner
* The code has a rollback path
* The code does not collect customer data unless reviewed under the security and privacy checklist
* The code does not duplicate analytics, pixel, or app behavior
* The code is represented in this register before production publish

## Disallowed Custom Liquid uses

Do not use Custom Liquid for:

* Analytics scripts
* Marketing pixels
* Checkout-related tracking
* Customer-data collection
* Large JavaScript components
* Product logic that belongs in Liquid sections/snippets
* Styling that belongs in CSS
* App install snippets copied from vendor documentation
* Code that cannot be tested in preview
* Code without an owner

## App embed rule

Every enabled app embed must be listed here or in the app register.

An app embed must include:

* App name
* Owner
* Purpose
* Pages affected
* Whether it injects JavaScript
* Whether it collects data
* Whether consent applies
* How to disable it
* Last reviewed date

## Register

| ID      | Type          | Location                         | Owner | Purpose                            | Code/source | Pages affected | Data collected | Consent behavior | Performance risk | Disable/rollback path        | Last reviewed |
| ------- | ------------- | -------------------------------- | ----- | ---------------------------------- | ----------- | -------------- | -------------- | ---------------- | ---------------- | ---------------------------- | ------------- |
| TCL-001 | Custom Liquid | Example: homepage custom section | TBD   | Example only; delete before launch | N/A         | N/A            | None           | N/A              | Low              | Remove block in theme editor | 2026-07-29    |

## Release rule

Before production publish:

* [ ] Review all Custom Liquid blocks in the preview theme.
* [ ] Review all enabled app embeds.
* [ ] Confirm each production Custom Liquid block appears in this register.
* [ ] Confirm each app embed appears in the app register or this register.
* [ ] Confirm no analytics or customer-data script is hidden in Custom Liquid.
* [ ] Confirm rollback steps are known.
