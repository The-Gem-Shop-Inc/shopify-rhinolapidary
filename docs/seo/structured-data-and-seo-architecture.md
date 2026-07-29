# Structured Data and SEO Architecture

## Purpose

This document defines how Rhino Lapidary handles metadata, canonical URLs, structured data, product SEO fields, organization identity, and search-engine migration.

## Current known theme surfaces

Initial audit surfaces:

* `snippets/meta-tags.liquid`
* `sections/main-product.liquid`
* `sections/header.liquid`
* JSON templates under `templates/`
* Product data imported into Shopify
* Shopify admin SEO fields

## Metadata rules

Each indexable page should have:

* A clear page title
* A meaningful meta description
* One canonical URL
* Open Graph/Twitter metadata where supported by the theme
* No stock Trade placeholder copy
* No duplicate product copy without an ownership decision

## Canonical rules

* Canonical host comes from the domain launch checklist.
* Product pages on Rhino Shopify are canonical for Rhino-owned products unless a specific exception is documented.
* The Gem Shop product pages for Rhino products need a keep/redirect/canonical decision.
* Legacy Weebly pages should redirect to the closest relevant Rhino Shopify page.
* Search/filter/sort URLs should not become accidental canonical targets unless intentionally designed.
* Draft/unpublished products must not be referenced in launch redirects.

## Organization identity

Clarify the relationship among:

| Entity         | Role                     | SEO representation                         |
| -------------- | ------------------------ | ------------------------------------------ |
| Rhino Lapidary | Product/storefront brand | Primary storefront organization/brand      |
| The Gem Shop   | Related seller/company   | Mention only where business-approved       |
| Silica-Gem     | TODO                     | Clarify before schema or footer references |

Decision required:

```text
TODO: Which legal/business entity should appear in Organization structured data?
```

## Product schema data requirements

For each product class, define data requirements.

| Product class    | Required SEO/schema fields                                                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Machine          | Title, SEO title, meta description, price, availability, SKU, brand, images, description, warranty/support summary, freight note, compatibility, videos/manuals where relevant |
| Accessory        | Title, SEO title, meta description, price, availability, SKU, brand, images, compatibility, dimensions/specs                                                                   |
| Consumable       | Title, SEO title, meta description, price, availability, SKU, grit/material/size, compatibility, images                                                                        |
| Replacement part | Title, SEO title, meta description, price, availability, SKU, compatibility, diagrams/manual references                                                                        |
| Manual/download  | Title, description, associated product, file type, version/date                                                                                                                |

## Field ownership

| Data                     | Shopify source                   | Owner                   |   Required before launch  |
| ------------------------ | -------------------------------- | ----------------------- | :-----------------------: |
| Product title            | Product admin                    | Merchandising           |            Yes            |
| URL handle               | Product admin                    | SEO/engineering         |            Yes            |
| SEO title                | Search engine listing            | SEO/merchandising       |    Yes for key products   |
| SEO description          | Search engine listing            | SEO/merchandising       |    Yes for key products   |
| Product description      | Product admin                    | Merchandising/support   |            Yes            |
| Product images           | Product media                    | Media/merchandising     |            Yes            |
| Alt text                 | Product media                    | Media/SEO/accessibility |            Yes            |
| SKU                      | Variant admin                    | Operations              |            Yes            |
| Availability             | Product/variant status           | Merchandising/ops       |            Yes            |
| Compatibility            | Product metafield or description | Product/support         | Yes for accessories/parts |
| Freight/warranty/support | Product metafield/page/section   | Business/support        |      Yes for machines     |

## Structured data policy

* Prefer Shopify Trade’s existing structured-data output unless a gap is documented.
* Do not add duplicate Product JSON-LD without verifying the existing output.
* Do not hardcode organization data in multiple places.
* New schema types require an owner and test method.
* Product schema changes must be tested using a structured-data validator.
* FAQ/video/breadcrumb schema should not be added until source content and ownership are clear.

## Required SEO files and tools

* Domain launch checklist
* Redirect map
* Product data quality gate
* Media source-of-truth rules
* Search Console verification
* Structured-data validation output
* Release notes

## Launch blockers

Launch is blocked if:

* Canonical domain is undecided.
* Important product handles are unstable.
* EM-1 machine page lacks title, meta description, active product status, and image alt text.
* Redirect/canonical strategy for duplicated The Gem Shop Rhino content is undecided.
* Structured data is duplicated or clearly wrong.
* Legacy pages with business value have no redirect decision.
