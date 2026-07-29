# Redirect and URL Migration Architecture

## Purpose

Rhino Lapidary is moving from legacy web properties into Shopify.

This document defines how old URLs, The Gem Shop Rhino-related URLs, and new Rhino Shopify URLs are mapped so launch does not create broken links, duplicate product pages, or SEO ambiguity.

## Scope

This architecture covers:

* Legacy Rhino website URLs
* Legacy Weebly pages
* Rhino-related product and collection URLs on The Gem Shop
* New Shopify product URLs
* New Shopify collection URLs
* New policy/support pages
* Canonical host behavior
* Redirect import and verification

## Source URL inventories

Create these source files:

```text
docs/seo/url-inventory/legacy-rhino-urls.csv
docs/seo/url-inventory/the-gem-shop-rhino-urls.csv
docs/seo/url-inventory/shopify-target-urls.csv
docs/seo/url-inventory/redirect-map.csv
```

## Redirect map schema

Use this CSV structure:

```csv
source_url,source_host,source_type,target_url,target_host,target_type,redirect_type,priority,status,owner,notes
/policies-and-procedures.html,www.rhinolapidary.com,legacy_page,/pages/policies-and-procedures,www.rhinolapidary.com,page,301,high,proposed,TBD,Legacy policy page
/products/rhino-lapidary-em-1-machine,thegemshop.com,tgs_product,/products/rhino-lapidary-em-1-machine,www.rhinolapidary.com,product,canonical_decision,high,needs_decision,TBD,Decide whether TGS keeps page or links to Rhino
```

## Redirect types

Use the following values:

| Type                   | Meaning                                            |
| ---------------------- | -------------------------------------------------- |
| `301`                  | Permanent redirect into Rhino Shopify              |
| `canonical_decision`   | Needs business/SEO decision before redirecting     |
| `keep_live`            | Keep old URL live intentionally                    |
| `retire_404`           | Allow old URL to 404 intentionally                 |
| `manual_review`        | Needs content/product review                       |
| `external_link_update` | Update referring page/link rather than redirecting |

## URL priority

| Priority   | Meaning                                                                            |
| ---------- | ---------------------------------------------------------------------------------- |
| `critical` | Homepage, machine product pages, checkout/support paths, high-traffic legacy pages |
| `high`     | Product/category pages, policy/support pages, pages with backlinks                 |
| `medium`   | Educational pages, blog-like pages, minor collections                              |
| `low`      | Thin/obsolete pages with no known business value                                   |

## Canonical rules

* One customer-facing canonical domain is chosen in the domain checklist.
* Shopify product URLs are the canonical URLs for Rhino-owned product pages.
* The Gem Shop pages that still sell or describe Rhino products need explicit canonical/ownership decisions.
* Duplicate product copy across Rhino and The Gem Shop must not be left ambiguous.
* Legacy Rhino pages should redirect to the closest equivalent Shopify page when there is one.
* Do not redirect every missing URL to the homepage.
* Retire obsolete URLs deliberately rather than hiding the decision.

## Shopify redirect import

Shopify URL redirects operate within the primary domain and can be created or imported from CSV.

Required Shopify admin path:

```text
Shopify Admin → Online Store → Navigation → URL redirects
```

Before import:

* [ ] Canonical domain is decided.
* [ ] Redirect source paths are relative where Shopify requires relative paths.
* [ ] Redirect targets are valid.
* [ ] Product and collection handles are final.
* [ ] Policy/support pages exist.
* [ ] The map has been reviewed for redirect loops.
* [ ] The map has been reviewed for redirects to draft/unpublished products.

## Spot-check set

Create a launch spot-check list containing:

* Homepage
* EM-1 machine product
* Major accessories
* Major consumables
* Policy/support page
* Contact page
* Legacy category page
* Any old URL with known backlinks
* The Gem Shop Rhino collection/product links

## Verification commands

```powershell
curl.exe -I https://www.rhinolapidary.com/OLD-PATH
curl.exe -I https://www.rhinolapidary.com/products/rhino-lapidary-em-1-machine
```

Expected:

* Old URLs return 301 or 302 only when intentionally redirected.
* Final target returns 200.
* Redirect chain is short.
* Final URL uses the canonical host.
* Final URL uses HTTPS.
* Product URLs resolve to active/published products.

## Launch blocker

Launch is blocked if:

* Machine product URLs are missing or unpublished.
* Legacy homepage/category/product redirects are undecided.
* The Gem Shop duplicate product strategy is undecided.
* Redirect map has not been spot-checked.
* Canonical host is not settled.
* Redirects create loops.
* Redirects point to draft products.
