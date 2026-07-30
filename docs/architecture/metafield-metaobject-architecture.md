# Metafield and Metaobject Architecture

## Purpose

Rhino Lapidary needs structured product data for filters, machine specifications, compatibility, SEO, support content, and future specialized product templates.

This document defines the desired architecture. Shopify admin remains the place where definitions are created, but the repository owns the desired-state specification.

## Principles

* Use product metafields for attributes that describe one product.
* Use variant metafields for attributes that differ by purchasable variant.
* Use metaobjects for reusable structured entities such as machine families, compatibility groups, manuals, videos, or support resources.
* Do not use tags as the primary source for technical filters.
* Every customer-facing metafield needs an owner and display purpose.
* Every filter-backed metafield must be listed in the collection filter spec.

## Desired-state file

```text
data/metafield-metaobject-definitions.json
```

## Launch rule

Before launch, Shopify Admin → Settings → Custom data must match the desired-state file for launch-required definitions.
