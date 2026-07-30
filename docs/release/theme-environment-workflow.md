# Theme Environment Workflow

## Purpose

Rhino Lapidary uses separate local, preview, and production stages so theme changes can be tested without risking the live storefront.

## Environments

| Environment           | Purpose                                                                           |
| --------------------- | --------------------------------------------------------------------------------- |
| Local                 | Editing and first validation                                                      |
| Shopify preview theme | Browser, accessibility, smoke, cart, navigation, and admin-dependent verification |
| Production theme      | Customer-facing storefront                                                        |

## Rules

* Do not push directly to production from an unverified local state.
* Preview pushes must pass repository validation first.
* Production publish must pass the production readiness gate.
* Theme IDs must be documented outside secrets when safe, or in `.env` when local-only.
* `PREVIEW_URL` is required for preview-dependent Playwright tests.
* Password-protected preview tests should run with one worker.
* Production publish requires backup theme ID and rollback owner.

## Standard workflow

```powershell
npm run validate:production-readiness
shopify theme push --environment preview --strict
npm run test:smoke -- --project=desktop-chromium
npm run test:cart -- --project=desktop-chromium
npm run test:ally -- --project=desktop-chromium
npm run test:navigation -- --project=desktop-chromium
```

Only after verification:

```powershell
shopify theme push --environment production --strict
```

or publish through Shopify Admin, depending on the release decision.

## Launch blocker

Do not publish production when:

* Git working tree is dirty in unknown ways.
* Production readiness gate fails.
* Preview theme has not been tested.
* Backup theme ID is not recorded.
* Rollback owner is not available.
