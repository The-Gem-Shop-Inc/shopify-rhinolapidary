# ADR-0002: Collection and Filtering Architecture

## Status

Proposed

## Context

Rhino Lapidary needs technical product discovery, not generic apparel-style filtering.

Customers may need to filter by machine family, compatibility, application, grit, diameter, arbor size, voltage, consumable type, availability, price, and support status.

Shopify Search and Discovery controls storefront filters, and filters can be based on product fields, product options, product metafields, and variant metafields.

## Decision

Use a data-first filtering model.

| Attribute      | Preferred source                    | Customer-facing? | Notes                                                             |
| -------------- | ----------------------------------- | :--------------: | ----------------------------------------------------------------- |
| Availability   | Shopify native availability         |        Yes       | Native filter                                                     |
| Price          | Shopify native price                |        Yes       | Native filter                                                     |
| Product class  | Product metafield or product type   |        Yes       | Machine, consumable, accessory, replacement part                  |
| Machine family | Product metafield                   |        Yes       | Example: EM series                                                |
| Compatibility  | Product metafield/metaobject        |        Yes       | Critical for accessories/parts/consumables                        |
| Application    | Product metafield                   |        Yes       | Grinding, polishing, cutting, replacement                         |
| Grit           | Product metafield or variant option |        Yes       | Use variant option only when it truly drives purchasable variants |
| Diameter       | Product metafield or variant option |        Yes       | Prefer structured value                                           |
| Arbor size     | Product metafield or variant option |        Yes       | Prefer structured value                                           |
| Voltage        | Product metafield or variant option | Yes for machines | Variant option if voltage changes purchasable variant             |
| Support status | Product metafield                   |     Possibly     | Current, legacy, discontinued                                     |
| Vendor         | Shopify native vendor               |   No by default  | Admin useful; not necessarily customer-facing                     |
| Tags           | Internal/admin                      |   No by default  | Avoid customer-facing filters built from messy tags               |

## Rules

* Customer-facing filters must have clear labels.
* Tags should not be the primary source for technical filters.
* Variant options are used only when the option changes the purchasable variant.
* Metafields are preferred for technical attributes that describe the product.
* Filter source choices must be listed in `data/collection-filter-spec.json`.
* Search and Discovery admin configuration must match the filter spec.
* Filter changes require `npm run validate:filters`.

## Consequences

This makes Rhino’s product data stricter, but it avoids brittle tag-based filtering and makes customer discovery more reliable.
