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
