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
npm run test:ally
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

## Epic C Global Chrome QA

Global header, navigation, breadcrumb, footer, localization, policy, account,
cart, and search changes affect every storefront page. For Epic C or later
global chrome changes, run:

```sh
npm run qa:epic-c:static
npm run qa:epic-c:preview
npm run validate:epic-c-finalization
```

Use `npm run qa:epic-c:all` only when both static and preview access are
available. The preview QA must target the unpublished preview theme
`158631198917`, not production theme `158579622085`.

## Epic D Homepage QA

Homepage transformation uses an aggregate technical gate while retaining D-PBI-032 as human-only production signoff:

```sh
npm run qa:epic-d:static
npm run qa:epic-d:preview
npm run qa:epic-d:all
npm run validate:epic-d-finalization
```

The runner targets unpublished preview theme `158631198917`; production theme `158579622085` remains unapproved.

## Shopify upload policy

The repository includes documentation, tests, scripts, local environment files, and CI configuration that must not be uploaded to Shopify as theme assets.

`.shopifyignore` defines the files excluded from `shopify theme push`.

Before changing `.shopifyignore`, verify that required Shopify theme directories remain uploadable:

- `assets`
- `blocks`
- `config`
- `layout`
- `locales`
- `sections`
- `snippets`
- `templates`

Do not ignore runtime theme files merely to hide local changes.

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

* [Trade baseline](docs/architecture/trade-upstream-baseline.md)
* [Upstream update strategy](docs/architecture/upstream-update-strategy.md)
* [Theme customization inventory](docs/architecture/theme-customization-inventory.md)
* Theme Check decisions are documented when suppressions are introduced.
* [Rhino brand CSS implementation plan](docs/architecture/rhino-brand-css-implementation-plan.md)
* [Rhino custom section/block strategy](docs/architecture/rhino-custom-section-block-strategy.md)
* [Epic C global chrome source hierarchy](docs/architecture/epic-c-global-chrome-source-hierarchy.md)
* [Epic C global chrome current-state audit](docs/architecture/epic-c-global-chrome-current-state-audit.md)
* [Epic C breadcrumb architecture](docs/architecture/epic-c-breadcrumb-architecture.md)
* [Epic C footer and support IA](docs/architecture/epic-c-footer-support-ia.md)
* [Rhino MVP sequencing decision](docs/roadmap/rhino-mvp-sequencing.md)

### Development

* [Settings-data policy](docs/development/settings-data-policy.md)
* [Shopify environment configuration](docs/release/theme-environment-workflow.md)
* [Shopify navigation change workflow](docs/development/shopify-navigation-change-workflow.md)

### Brand

* Rhino brand style guide
* Rhino theme settings launch plan
* Rhino preview implementation slice

### Quality assurance

* [Browser and device support](docs/qa/storefront-quality-baseline.md)
* [Accessibility baseline](docs/qa/epic-b-accessibility-review-checklist.md)
* [Performance budget](docs/qa/rhino-brand-media-performance-budget.md)
* [Epic B brand QA plan](docs/qa/epic-b-brand-qa-plan.md)
* [Epic C global chrome QA plan](data/epic-c-global-chrome-qa-plan.json)
* [Epic C responsive global chrome evidence plan](docs/qa/epic-c-responsive-global-chrome-evidence-plan.md)
* [Epic C post-launch navigation measurement plan](docs/analytics/epic-c-post-launch-navigation-measurement-plan.md)
* [Epic D homepage QA plan](data/epic-d-homepage-qa-plan.json)
* [Epic D technical finalization report](docs/release/epic-d-finalization-report.md)

### Release

* [Production release checklist](docs/release/release-checklist.md)
* [Release notes template](docs/release/release-notes-template.md)

## Secrets

Never commit:

* Shopify access tokens
* Storefront passwords
* Private app credentials
* Customer data
* Payment information
* `.env` files
* Local Shopify state
