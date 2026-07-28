# shopify-rhinolapidary

## Development Procedures

Refer to the [Upstream Baseline](docs/architecture/trade-upstream-baseline.md) for the baseline of the Shopify Trade theme used in this project.

## Validation Procedures

# Rhino Lapidary Shopify Theme

Custom Shopify storefront for Rhino Lapidary, based on Shopify Trade.

## Theme baseline

* Upstream theme: Shopify Trade
* Baseline version: 15.5.0
* Baseline Git tag: `trade-15.5.0-baseline`
* Clean upstream branch: `upstream/trade`
* Active development branch: `main`

See:

* `docs/architecture/trade-upstream-baseline.md`
* `docs/architecture/upstream-update-strategy.md`
* `docs/architecture/theme-customization-inventory.md`

## Store environments

| Environment              | Store/theme                    |
| ------------------------ | ------------------------------ |
| Shopify store            | `[STORE].myshopify.com`        |
| Persistent preview theme | `[PREVIEW THEME NAME / ID]`    |
| Production theme         | `[PRODUCTION THEME NAME / ID]` |

Do not commit access tokens, storefront passwords, or other secrets.

## Prerequisites

* Git
* Node.js and npm
* Shopify CLI
* Access to the Rhino Lapidary Shopify store
* Permission to work with unpublished themes

Confirm tools:

```sh
git --version
node --version
npm --version
shopify version
```

## Install development dependencies

```sh
npm install
npx playwright install chromium webkit
```

## Shopify authentication

Authenticate using Shopify CLI and select the Rhino Lapidary store.

Do not place tokens or passwords in committed configuration files.

## Local development

Start a local development theme:

```sh
shopify theme dev --environment default
```

This creates a temporary development theme and provides:

* A local preview URL
* A Shopify-hosted preview URL
* A theme-editor link

Do not perform routine development against the published theme.

## Persistent preview deployment

Validate first:

```sh
python scripts/validate-theme-repository.py
shopify theme check --fail-level warning
npm run test:a11y
```

Push to the persistent unpublished preview theme:

```sh
shopify theme push --environment preview --strict
```

Open the preview:

```sh
shopify theme open --environment preview
```

## Required validation

Before opening or updating a pull request:

```sh
python scripts/validate-theme-repository.py
shopify theme check --fail-level warning
npm run test:a11y
```

Update the customization inventory after changing theme files:

```powershell
.\scripts\update-theme-inventory.ps1
```

Commit the updated inventory when its output changes.

## Settings safety

`config/settings_data.json` is version-controlled as a reviewed snapshot.

Routine code deployments must not silently overwrite remote theme-editor settings.

When intentionally changing theme settings:

1. Make the change on the persistent preview theme.
2. Pull only the required settings file.
3. Review the Git diff.
4. Commit the settings change explicitly.
5. Verify it again in preview before publishing.

See:

* `docs/development/settings-data-policy.md`

## Branch and upstream policy

* `main` contains Rhino Lapidary work.
* `upstream/trade` contains clean Shopify Trade releases only.
* Never commit Rhino changes to `upstream/trade`.
* Do not copy a new Trade release directly over `main`.
* Review upstream changes through the documented update procedure.

## Pull request expectations

Every theme pull request should identify:

* Templates, sections, snippets, assets, or settings changed
* Customer journeys affected
* Shopify-admin changes required
* Accessibility impact
* Performance impact
* Preview testing performed
* Rollback considerations

Visual changes should include screenshots or a preview link.

## Production publishing

Production publishing requires:

1. Passing CI
2. Review on the persistent preview theme
3. Completion of the release checklist
4. A backup of the currently published theme
5. Explicit approval from the designated publisher

See:

* `docs/release/release-checklist.md`

Do not use direct live-theme pushes as the normal release workflow.

## Quality standards

Browser support, responsive testing, accessibility requirements, and performance budgets are defined in:

* `docs/qa/storefront-quality-baseline.md`

## Repository validation

The repository validator checks:

* JSON syntax
* Tracked IDE files
* Tracked environment files
* Generated files
* Logs and local artifacts

Run:

```sh
python scripts/validate-theme-repository.py
```

## Theme Check

Run:

```sh
shopify theme check --fail-level warning
```

Theme Check decisions and accepted suppressions are documented in:

* `docs/architecture/theme-check-decisions.md`

## Important theme surfaces

Changes to these areas require focused testing:

* `layout/theme.liquid`
* `config/settings_schema.json`
* `config/settings_data.json`
* `templates/product.json`
* `sections/main-product.liquid`
* `assets/cart.js`
* `assets/cart-notification.js`
* `assets/quick-order-list.js`
* `assets/standard-actions-override.js`
* Search and collection filtering
* Cart and quick-order behavior
* App blocks and app embeds

## Documentation index

### Architecture

* Trade baseline
* Upstream update strategy
* Theme customization inventory
* Theme Check decisions

### Development

* Settings-data policy
* Shopify environment configuration

### Quality assurance

* Browser and device support
* Accessibility baseline
* Performance budget

### Release

* Production release checklist

## Secrets

Never commit:

* Shopify access tokens
* Storefront passwords
* Private app credentials
* Customer data
* Payment information
* `.env` files
* Local Shopify state
