# Search and Discovery Configuration Process

## Purpose

Shopify Search and Discovery controls storefront filters, search behavior, recommendations, synonyms, and product boosts.

Because this configuration lives in Shopify admin rather than normal theme files, Rhino Lapidary keeps a desired-state spec in the repository and validates it before release.

## Source of truth

Repository desired state:

```text
data/search-discovery-desired-state.json
```

Related filter architecture:

```text
data/collection-filter-spec.json
docs/architecture/adr-0002-collection-filtering-architecture.md
```

## Process

Before changing Search and Discovery configuration:

1. Update the desired-state JSON.
2. Validate it locally.
3. Apply the matching configuration in Shopify Admin.
4. Test collection and search fixture pages.
5. Update release notes.
6. Include screenshots or admin notes in the release package.

## Shopify admin location

```text
Shopify Admin → Apps → Search & Discovery
```

## Release blocker

A production release is blocked if:

* Customer-facing filters are changed in admin but not represented in the desired-state spec.
* Desired-state filters conflict with `data/collection-filter-spec.json`.
* Search synonyms/boosts are undocumented.
* Filter source metafields do not exist or are not owned.
