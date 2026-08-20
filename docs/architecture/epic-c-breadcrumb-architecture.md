# Epic C Breadcrumb Architecture

**Epic:** C - Global Header, Navigation, and Footer  
**PBIs:** C-PBI-012 through C-PBI-014  
**Status:** Batch 3 implementation source  
**Created:** 2026-08-07  
**Governing sources:** [ADR-0003](adr-0003-navigation-architecture.md), [Epic C source hierarchy](epic-c-global-chrome-source-hierarchy.md), [navigation-spec.json](../../data/navigation-spec.json)

## Purpose

Breadcrumbs provide orientation without implying unapproved product taxonomy,
machine-family hierarchy, support ownership, policy text, or merchandising
relationships. Accessibility, canonical integrity, and route correctness
override visual preference.

## Rendering Rules

| Page type | Breadcrumb behavior | Label and URL sources |
|---|---|---|
| Homepage | Hidden | The homepage must not render a redundant breadcrumb. |
| Product | Rendered | `Home` from locale, optional approved collection context, current `product.title`; product URL uses canonical product URL. |
| Collection | Rendered | `Home` from locale, current `collection.title`; collection URL uses `collection.url` without query parameters. |
| Search | Rendered | `Home` from locale, current `Search results` from locale; breadcrumb URL uses `/search` and excludes query parameters. |
| Ordinary page | Rendered | `Home` from locale, current `page.title`; page URL uses `page.url`. |
| Blog | Rendered when a blog fixture exists | `Home` from locale, current `blog.title`; blog URL uses `blog.url`. |
| Article | Rendered when an article fixture exists | `Home` from locale, ancestor `blog.title`/`blog.url`, current `article.title`. |
| Cart | Rendered | `Home` from locale, current `Cart` from locale; URL uses `routes.cart_url`. |
| Shopify policy | Rendered for verified policy routes | `Home` from locale, current `policy.title` with page title fallback; URL uses canonical policy route. |
| Password, 404, checkout, customer account, challenge, and unsupported system routes | Hidden | Checkout is outside theme breadcrumb ownership. Customer account and challenge surfaces may be Shopify-owned. |

## Product Ancestry

Product ancestry is deterministic:

1. Use a valid collection context from the current storefront request only when
   Shopify provides `collection`, the product belongs to that collection, and
   the route is not the generic `all` collection.
2. Use a governed product ancestry source only after the repository defines and
   validates one.
3. Otherwise render `Home -> Product`.

The implementation must not use arbitrary `product.collections.first`, must not
invent a machine family, and must not invent a metafield key. A future explicit
ancestry source is desirable but remains a dependency until defined.

## URL Rules

- Breadcrumb links and JSON-LD URLs use the storefront origin plus clean route
  paths.
- Remove `preview_theme_id`, `preview_key`, `_fd`, `pb`, password-page URLs,
  filter parameters, sort parameters, pagination parameters, and search query
  parameters from breadcrumb and canonical comparison URLs.
- Search breadcrumbs use `/search`, even when the requested route includes
  `q`, `options`, or `sort_by`.
- Current page crumbs align with the canonical route after query removal.
- Breadcrumb URLs must not point to unrelated storefront domains.

## Markup and Accessibility

- Use `<nav aria-label="Breadcrumb">`.
- Use an ordered list.
- Link ancestor crumbs only.
- Mark the current crumb with `aria-current="page"`.
- The current page crumb is text, not a self-link.
- Escape all customer-supplied or Admin-supplied labels.
- Decorative separators are hidden from assistive technology.
- Breadcrumbs do not create a second page heading and do not interfere with skip
  links or heading order.

## Visual Rules

- Breadcrumbs render immediately inside `#MainContent`, before page content and
  page headings.
- Mobile breadcrumbs must sit above the page heading, wrap long labels, avoid
  horizontal overflow, and keep separators attached to adjacent content.
- Desktop spacing remains subordinate to the page title and primary content.
- Link focus must remain visible and contrast must meet the repository
  accessibility baseline.

## Structured Data

Visible breadcrumbs and `BreadcrumbList` JSON-LD are owned by the shared
breadcrumb snippet and must describe the same hierarchy. Each rendered
`BreadcrumbList` uses `https://schema.org`, consecutive positions beginning at
1, clean URLs, and the same names as the visible breadcrumbs after whitespace
normalization.

## Fixtures and Acceptance

Automated tests must cover current verified routes from `data/navigation-spec.json`
and `tests/fixtures/storefront-fixtures.json`: product, collection, search,
ordinary page/contact, cart, privacy policy, and homepage absence. Blog and
article coverage remains blocked until valid fixture routes are added. Missing
fixtures must be reported as blockers, not silently excluded.

