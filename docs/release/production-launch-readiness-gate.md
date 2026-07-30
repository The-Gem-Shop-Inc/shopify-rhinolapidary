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
* Shopify Theme Check
* JSON register validation
* Data architecture validation
* Theme architecture validation
* Cleanup architecture validation
* Cart configuration validation
* Placeholder content check

When `PREVIEW_URL` is configured, it also runs:

* Storefront fixture validation
* Desktop smoke tests
* Desktop cart tests
* Desktop accessibility tests
* Navigation route tests

## Release rule

A production publish is blocked if this command fails.

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
