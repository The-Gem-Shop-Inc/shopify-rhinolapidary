# Shopify Admin Change Evidence

## Purpose

Some launch-critical Shopify changes cannot be fully represented in theme code. This document defines how admin changes are tracked.

## Admin changes requiring evidence

Evidence is required for:

* Domains
* Shipping settings
* Taxes
* Payment settings
* Markets
* Search and Discovery
* Navigation menus
* Product publication
* Product media
* Metafield definitions
* Metaobject definitions
* App embeds
* Pixels/customer events
* Checkout settings
* Store password state
* Policies

## Evidence location

Store evidence under:

```text id="xwpvag"
docs/project/admin-change-records/
```

Use one Markdown file per change.

## File naming

```text id="z1tk0z"
YYYY-MM-DD-short-admin-change.md
```

Example:

```text id="0xfdwd"
2026-07-30-search-discovery-filters.md
```

## Required fields

Each record must include:

* Date
* Admin area
* Setting changed
* Reason
* Owner
* Screenshot or description
* Rollback instructions
* Related PBI
* Validation command, when applicable

## Release rule

Production launch is blocked if a launch-critical admin change exists without evidence.

## Epic E product-information mutations

Epic E uses this same Admin evidence process; it does not create a parallel release path. Before any product, variant, custom-data, relationship, Files, collection, or shipping-data mutation is authorized, the related change record must link a plan conforming to `schemas/epic-e-admin-mutation-plan.schema.json`.

The plan must identify a current read snapshot, hashed deterministic input, exact field allowlist, dry-run artifact, explicit Product Owner and Shopify Admin Owner GO, bounded before state, rollback classification, partial-failure recovery, idempotency, separate transport/GraphQL/`userErrors` handling, throttle/resume behavior, after snapshot, and drift validation. Product data is store-level and is not isolated by the preview theme.

E-PBI-022 and E-PBI-023 are not valid mutation-plan targets until split into bounded domains. Validate plans with:

```powershell
npm run validate:epic-e-mutation-plan -- path/to/plan.json
```
