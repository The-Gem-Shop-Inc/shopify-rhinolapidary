# Media Asset Source of Truth

## Purpose

Rhino Lapidary product media, support images, videos, manuals, and diagrams should have clear ownership and predictable storage.

## Rules

* Shopify product media is the source of truth for product images.
* Shopify Files or approved external storage is the source of truth for manuals and downloadable support files.
* Repository assets are for theme UI only, not product catalog media.
* Large product images should not be committed to the theme repository.
* Every launch-critical product image needs meaningful alt text.
* Vendor-provided images must have usage permission.
* Stock Shopify/Trade images must be removed, replaced, or explicitly retained in a ledger.
* Video embeds must be reviewed under the app/script/privacy checklist if they introduce third-party tracking.
* Media changes for key products must be reflected in release notes.

## Manifests

Repository-owned UI media is listed in:

```text
data/media-manifest.json
```

Stock/inherited visual assets are listed in:

```text
data/stock-asset-ledger.json
```

Product catalog media is checked through product export validation, not committed to the repo.
