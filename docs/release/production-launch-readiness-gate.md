# Production Launch Readiness Gate

## Purpose

This gate defines the minimum checks required before Rhino Lapidary publishes a production theme or makes a launch-impacting storefront change.

## Launch command

Run:

```powershell
npm run validate:production-readiness
```

## Required checks

The production readiness gate includes:

* Repository hygiene
* Epic F Batch F1 consumer provenance, generated-artifact drift, fixture isolation and claims containment
* Shopify Theme Check
* JSON register validation
* Data architecture validation
* Theme architecture validation
* Cleanup architecture validation
* Cart configuration validation
* Placeholder content check
* Production push file audit

For global chrome, navigation, breadcrumb, footer, policy, localization, support,
or measurement changes, also run:

```powershell
npm run qa:epic-c:static
npm run qa:epic-c:preview
npm run validate:epic-c-finalization
```

When `PREVIEW_URL` or `PREVIEW_BASE_URL` is configured, it also runs:

* Storefront fixture validation
* Desktop smoke tests
* Desktop cart tests
* Desktop accessibility tests
* Navigation route tests

## Release rule

A production publish is blocked if this command fails.

Epic F's repository gate permits only a shell with zero technical fact grants. It
rebuilds the expected exact-GID routing artifact in memory and rejects drift;
it never regenerates away an error during release validation. Expired or missing
Epic E reconciliation cannot authorize facts. The dated Admin snapshot is already
expired; no current fact activation is certified by a repository pass. Product
source cleanup, external API/feed/app exposure, media review and existing launch
data findings remain separate release blockers. See the Batch F1 implementation
record in `docs/project/implementation-records/f-pbi-001-005-batch-f1.md`.

Epic C production readiness is blocked when required static or preview QA fails,
when preview evidence is environment-blocked, when unresolved required PBIs
remain, or when required human approvals are blank.

Warnings may be accepted only when they are documented in the appropriate ledger, release note, or follow-up PBI.

## Manual evidence still required

Automation cannot fully verify:

* Shopify Admin domain state
* DNS provider state
* App embed state
* Customer event/pixel state
* Search and Discovery admin configuration
* Product publication in admin unless exported and validated
* Checkout settings
* Payment provider readiness

Those must be checked through the release checklist and admin dependency register.
