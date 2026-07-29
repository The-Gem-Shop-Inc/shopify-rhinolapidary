# ADR-0001: Product Template Architecture

## Status

Proposed

## Context

Rhino Lapidary products are not one uniform product type.

The storefront needs different product-page structures for:

* Machines
* Consumables
* Accessories
* Replacement parts
* Manuals and support content

The default Shopify Trade product template should support the normal purchase path. Specialized templates may add machine specifications, compatibility tables, manuals, video, freight/warranty messaging, or quick-order behavior.

## Decision

Use explicit product templates for major product classes.

| Product class    | Template                          | Purchase model                                                                    | Required data                                                                   |
| ---------------- | --------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Standard product | `product.json`                    | Standard variant picker, quantity selector, buy buttons                           | title, price, description, media, SKU                                           |
| Machine          | `product.machine.json`            | Standard purchase or request/contact path, depending on freight/business decision | specs, voltage, water requirements, warranty, freight, manuals, videos, support |
| Consumable       | `product.consumable.json`         | Standard purchase, possibly quick reorder later                                   | grit, diameter, arbor, material, compatibility, pack size                       |
| Accessory        | `product.accessory.json`          | Standard purchase                                                                 | compatibility, dimensions, related machine, support notes                       |
| Replacement part | `product.replacement-part.json`   | Standard purchase or inquiry path                                                 | compatibility, diagram/manual reference, part number                            |
| Manual/support   | page or metaobject-driven content | No purchase                                                                       | file, associated product, version/date                                          |

## Data ownership

| Data                                 | Location                                              |
| ------------------------------------ | ----------------------------------------------------- |
| Product title, handle, price, status | Shopify product/variant admin                         |
| Long description                     | Product description or product-specific sections      |
| SKU                                  | Variant admin                                         |
| Compatibility                        | Product metafields or metaobjects                     |
| Machine specifications               | Product metafields                                    |
| Manual/download links                | Shopify Files, product metafields, or support pages   |
| Video                                | Shopify media or approved video embed                 |
| Freight/warranty/support copy        | Product metafields, page content, or reusable section |
| Template assignment                  | Shopify product admin                                 |

## Rules

* The default product template must keep a working purchase path.
* Machine pages may add inquiry/freight reassurance, but must not accidentally remove price/availability/purchase controls without a documented decision.
* Quick-order should not be the only purchase path for normal products unless deliberately approved.
* Product-class templates must be tested through fixture products.
* Template changes require `npm run validate:product-templates`.

## Consequences

This creates more upfront structure, but it prevents machinery, consumables, and support content from being forced into one generic product page.
