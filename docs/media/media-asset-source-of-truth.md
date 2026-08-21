# Media Asset Source of Truth

## Purpose

Rhino Lapidary product media, support files, videos, manuals, diagrams, and
repository UI assets must have clear ownership, a canonical storage location,
and an explicit review path before storefront use or deletion.

## Canonical Records

| Record | Scope | Use |
|---|---|---|
| [data/media-manifest.json](../../data/media-manifest.json) | Repository-owned UI media, homepage media candidates, and compact Shopify Files audit summary | Machine-readable media governance and validation source |
| [rhino-shopify-files-content-audit-2026-08-20.md](rhino-shopify-files-content-audit-2026-08-20.md) | Full Shopify Admin Files inventory returned on 2026-08-20 | Row-level evidence for Shopify Files images, videos, documents, URLs, IDs, sizes, notes, and duplicate candidates |
| [data/stock-asset-ledger.json](../../data/stock-asset-ledger.json) | Stock or inherited visual assets | Stock asset retention, replacement, or removal ledger |

Product catalog media is governed in Shopify product media and checked through
product/Admin validation, not by committing catalog images to the theme repo.

## Source Rules

* Shopify product media is the source of truth for product images.
* Shopify Files or approved external storage is the source of truth for manuals,
  diagrams, and downloadable support files.
* Repository assets are for theme UI only, not product catalog media.
* Large product images should not be committed to the theme repository.
* Every launch-critical product, homepage, or instructional image needs
  meaningful alt text before reuse.
* Vendor-provided images must have usage permission before storefront use.
* Stock Shopify/Trade images must be removed, replaced, or explicitly retained
  in a ledger.
* Video embeds must be reviewed under the app/script/privacy checklist if they
  introduce third-party tracking.
* Media changes for key products must be reflected in release notes.

## Shopify Files Audit Snapshot

The 2026-08-20 Shopify Files audit is summarized in
`data/media-manifest.json` under `shopifyFilesAudit`. The full row-level audit
remains in `docs/media/rhino-shopify-files-content-audit-2026-08-20.md`.

| Metric | Result |
|---|---:|
| Total files | 867 |
| Images | 793, 1.06 GiB |
| Shopify hosted videos | 37, 7.86 GiB, 53:49 total duration |
| Documents and generic files | 37, 93.22 MiB |
| Total original bytes | 9.01 GiB |
| READY with no file errors | 867 |
| Missing alt text | 867 |
| Directly associated with current product media | 95 |
| Not directly associated with current product media | 772 |

Current source-truth status: `governance_blocked`. The audit is evidence, not
approval to publish, delete, or reuse media.

## Reuse Gates

* Add descriptive alt text before reusing any published product, homepage, or
  instructional visual media.
* Confirm ownership and usage rights before selecting Shopify Files media for a
  homepage, product, education, support, or social module.
* Review mobile crop safety, dimensions, and performance budget before using
  images in first-screen or high-traffic modules.
* Use posters, deferred loading, short previews, captions or transcript
  evidence, and selective publication before rendering videos.
* Keep internal notes, dealer lists, editable source files, and production
  project files private unless a storefront dependency and public use are
  explicitly approved.

## Deletion Gates

Detached Files are not deletion-safe by default. The audit found 772 files not
directly associated with current `product.media`, but those files may still be
referenced by theme settings, pages, articles, rich text, metafields,
metaobjects, product descriptions, app-owned content, or unpublished themes.

Before deleting or replacing Shopify Files media:

1. Build and run a reference crawler across Shopify Admin content, metafields,
   metaobjects, product descriptions, theme JSON, app-owned content, and
   unpublished theme settings.
2. Hash suspected duplicate originals where the audit only proves matching
   previews or normalized renditions.
3. Select one canonical asset.
4. Rewrite every confirmed reference.
5. Remove duplicate or obsolete files only after the reference evidence passes.

## Review Queues

The manifest records these audit-derived queues:

| Queue | Count | Required action |
|---|---:|---|
| Blank alt text | 867 | Prioritize published product, homepage, and instructional media alt text |
| Oversized videos | 7 | Transcode web delivery variants and use click-to-load poster behavior |
| Long videos | 8 | Avoid autoplay and immediate player loads |
| Detached Files | 772 | Prove references before deleting |
| Internal generic files | 4 | Review public exposure and retention |
| Customer-facing source files | 8 | Publish governed PDFs and keep editable sources private |
| Legacy BMP | 1 | Convert to WebP or JPEG before storefront use |

## Validation

Use:

```powershell
npm run validate:media
```

The validator checks the media manifest schema, homepage inventory, Shopify
Files audit arithmetic, audit source path, launch-ready homepage media rules,
and existing repository media file expectations.
