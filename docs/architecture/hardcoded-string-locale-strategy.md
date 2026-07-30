# Hardcoded String and Locale Strategy

## Purpose

Rhino Lapidary should avoid scattering customer-facing copy across Liquid, JavaScript, and JSON templates without ownership.

## Decision

* Theme UI copy should live in locale files when it is reusable interface text.
* Product, collection, page, policy, and merchandising copy should live in Shopify admin or structured data sources.
* Section labels/defaults should be reviewed through section schema validation.
* Rhino custom JavaScript should not introduce customer-facing strings unless documented.
* Launch-critical copy remnants are tracked through the placeholder checker and stock Trade remnants ledger.

## Rules

* Do not add new hardcoded customer-facing strings to `assets/rhino-storefront.js`.
* Avoid adding customer-facing strings directly to inherited Trade Liquid unless required by theme architecture.
* New reusable UI strings should use locale keys.
* Product-specific content belongs in product data, metafields, pages, or metaobjects.
* Every accepted hardcoded string exception must be listed in `data/hardcoded-string-allowlist.json`.
